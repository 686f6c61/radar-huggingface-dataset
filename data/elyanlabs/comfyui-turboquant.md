# elyanlabs/ComfyUI-TurboQuant

## Resumen

`elyanlabs/ComfyUI-TurboQuant` no es un modelo de lenguaje: es un nodo personalizado (*custom node*) para ComfyUI que implementa TQ3, un esquema de cuantización de 3 bits para tensores K/V de atención, publicado como instantánea de código fuente del repositorio de GitHub `Scottcjn/ComfyUI-TurboQuant` (con espejo en GitLab bajo `elyan-labs`). El repositorio de Hugging Face contiene únicamente código Python y documentación; no distribuye pesos ni se ejecuta en la infraestructura de Hugging Face.

El problema que aborda es el consumo de VRAM de la caché KV en modelos de difusión y vídeo con atención transformer de gran tamaño. El caso motivador citado por el autor es LTX-2.3 22B, que requiere 32,4 GB de VRAM y apenas cabe en una V100 de 32 GB. TQ3 comprime cada bloque de 128 valores FP16 (256 bytes) a 56 bytes, es decir, 3,5 bits efectivos por valor y una reducción aproximada de 4,5x en la memoria de la caché KV.

La implementación es explícitamente experimental: el propio autor aclara que no se trata de una caché KV persistente, sino de un parche de atención que hace *round-trip* de los tensores K/V a través de TQ3 para estudiar calidad y compresión. La similitud coseno del round-trip se sitúa por encima de 0,97 en vectores de atención típicos, pero no se han publicado métricas de calidad final de generación ni benchmarks comparativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: extensión de cuantización (nodo de ComfyUI) sobre capas de atención transformer existentes; no es un modelo entrenado |
| Parámetros totales | No disponible (no distribuye pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo que se parchee) |
| Tipos de cuantización | TQ3: 3 bits por valor con codebook Lloyd-Max de 8 niveles, 3,5 bits efectivos por valor (56 bytes por bloque de 128 floats) |
| Idiomas soportados | No disponible (no aplica al componente) |
| Licencia | MIT |
| Formato de pesos | No aplica: solo código Python (no hay safetensors ni GGUF) |
| Formato de distribución | Instantánea de repositorio Git (GitHub y GitLab); instalación por enlace simbólico en `ComfyUI/custom_nodes/` |
| Dependencias declaradas | ComfyUI; pruebas con `pytest`; auto-test con `python -m tq3_core` |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-21 (mismo minuto) |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste de pesos: TQ3 es un códec de cuantización determinista aplicado en tiempo de inferencia sobre los tensores K y V de cada capa de atención. El pipeline por bloque de 128 valores FP16 es el siguiente: (1) normalización L2 del bloque; (2) volteo de signos aleatorio determinista para repartir la energía; (3) Fast Walsh-Hadamard Transform (FWHT) para descorrelacionar los valores; (4) escalado absmax al rango [-1, +1]; (5) cuantización con codebook Lloyd-Max de 8 niveles (3 bits por valor); (6) empaquetado de los 128 índices en 48 bytes, más 4 bytes de norma y 4 bytes de escala, totalizando 56 bytes por bloque. El autor justifica el orden de los pasos 2 y 3: la aleatorización de signos es lo que permite que la transformada de Hadamard reparta la energía de cualquier bloque, y no solo de bloques que ya se parecen a ruido. El conjunto de pasos 2-3 constituye una transformada de Hadamard aleatorizada.

La extensión expone dos nodos en ComfyUI: `TurboQuant KV Patch`, que recibe un `MODEL` y un booleano `enabled` y devuelve el modelo con las capas de atención parcheadas, y `TurboQuant Info`, que recibe el `MODEL` y devuelve un `STRING` con estadísticas de compresión observadas tras la inferencia. La innovación técnica se limita a la combinación FWHT + Lloyd-Max de 8 niveles empaquetada a 3,5 bits efectivos; no se documentan decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Compresión de tensores K/V de atención de FP16 (16 bits) a TQ3 (3,5 bits efectivos) mediante parcheo de las capas de atención de un modelo cargado en ComfyUI.
- Reducción de la VRAM ocupada por la caché KV en aproximadamente 4,5x, según las cifras del autor.
- Round-trip de cuantización con similitud coseno superior a 0,97 en vectores de atención típicos.
- Reporte de estadísticas de compresión tras la inferencia mediante el nodo `TurboQuant Info`.
- Auto-test integrado (`python -m tq3_core`) y batería de pruebas (`python -m pytest tests/`) para validar el códec.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.
- No implementa caché KV persistente entre ejecuciones; el efecto es un *round-trip* por inferencia.

## Casos de uso

- Experimentos de compresión en generación de vídeo: aplicar `TurboQuant KV Patch` sobre LTX-2.3 22B para medir cuánta VRAM de caché KV se libera y si el modelo deja de agotar los 32 GB de una V100.
- Investigación en cuantización de caché KV: usar el códec TQ3 como referencia reproducible (FWHT + Lloyd-Max de 8 niveles) y comparar la similitud coseno del round-trip frente a otros esquemas.
- Evaluación de calidad en pipelines de difusión: ejecutar la misma semilla con el parche activado y desactivado, y comparar el resultado visual con las estadísticas de `TurboQuant Info` para correlacionar compresión y degradación.
- Docencia y reproducción del algoritmo: el auto-test `python -m tq3_core` y la suite `pytest` permiten ilustrar paso a paso normalización L2, volteo de signos, FWHT, escalado absmax y cuantización vectorial.
- Prototipado de parches de atención en ComfyUI: sirve como plantilla para interceptar capas de atención y aplicar transformaciones sobre tensores K/V antes de la operación de atención.
- Base para una caché KV persistente: el repositorio documenta explícitamente que la implementación actual no lo es, por lo que constituye un punto de partida para quien quiera añadir almacenamiento persistente de bloques comprimidos.
- Auditoría de memoria en despliegues ajustados: estimar, a partir de la reducción de 4,5x, si un modelo dado cabe en una GPU concreta antes de invertir en hardware superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad es la similitud coseno del round-trip (>0,97 en vectores de atención típicos), que no equivale a una métrica de calidad de generación.

| Métrica | Valor reportado |
|---|---|
| Similitud coseno del round-trip (vectores de atención típicos) | > 0,97 |
| Bits efectivos por valor | 3,5 (56 bytes / 128 valores) |
| Compresión de caché KV frente a FP16 | ~4,5x |
| MMLU, HumanEval, GSM8K, FID, CLIP score | No disponible |

## Requisitos de hardware

- La extensión no impone requisitos propios de VRAM: hereda los del modelo que se parchee en ComfyUI.
- Caso de referencia citado por el autor: LTX-2.3 22B requiere 32,4 GB de VRAM y apenas cabe en una NVIDIA V100 de 32 GB.
- El ahorro de ~4,5x se aplica únicamente a la caché KV de las capas de atención, no a los pesos del modelo ni a las activaciones.
- GPU recomendadas: no disponibles de forma específica; el escenario documentado es V100 32 GB. No se confirma funcionamiento en GPU de consumo.
- Sobre coste computacional del códec (normalización L2, FWHT, cuantización y desempaquetado en cada paso de atención): no disponible; el autor no publica latencia ni throughput.
- Despliegue: ComfyUI con el directorio enlazado en `custom_nodes/`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.
- Verificación del entorno: `python -m tq3_core` para el auto-test y `python -m pytest tests/` para la suite de pruebas.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de otras implementaciones de compresión de caché KV, por lo que la comparación cuantitativa no está disponible. La tabla recoge solo lo que puede deducirse de la información del repositorio.

| Esquema | Bits por valor | Compresión frente a FP16 | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TQ3 (TurboQuant) | 3,5 efectivos | ~4,57x (16 / 3,5) | Coseno > 0,97 en round-trip | MIT | Nodo de ComfyUI, 0 descargas |
| Caché KV en FP16 (línea base) | 16 | 1x | Referencia | No aplica | Nativa en los frameworks de inferencia |
| Otros métodos de cuantización de caché KV | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es una caché KV persistente: el propio autor indica que la implementación actual solo hace *round-trip* de los tensores a través de TQ3 y sirve para experimentos de calidad y compresión.
- Pérdida de información inherente a 3 bits: la similitud coseno >0,97 implica que un porcentaje de la señal se descarta; no se ha cuantificado el impacto sobre la calidad final de la imagen o el vídeo generado.
- Ausencia total de benchmarks de calidad de generación (FID, CLIP score, evaluaciones humanas) y de latencia o throughput.
- Madurez muy baja: 0 descargas, 0 likes y creación y actualización en el mismo minuto, lo que sugiere una instantánea sin validación por parte de la comunidad.
- El repositorio de Hugging Face es un espejo de código; no hay garantía de sincronización futura con el repositorio de GitHub o GitLab de origen.
- No se declaran idiomas soportados ni pipeline en la ficha de Hugging Face.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías de ningún tipo; la responsabilidad recae en quien la integre.
- Etiquetas del repositorio (`video-generation`, `llm-inference`) no implican soporte verificado para todos esos casos; el único escenario descrito es el de modelos de difusión para vídeo en ComfyUI.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este proyecto: los enlaces devueltos corresponden a un sitio de streaming sin relación con el modelo y se han descartado.
- Sesgos conocidos: no disponible (el componente no genera contenido por sí mismo).

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/ComfyUI-TurboQuant
- Repositorio original en GitHub: https://github.com/Scottcjn/ComfyUI-TurboQuant
- Espejo en GitLab: https://gitlab.com/elyan-labs/ComfyUI-TurboQuant
- Certificación BCOS: https://huggingface.co/elyanlabs/ComfyUI-TurboQuant/blob/main/BCOS.md
- Perfil para motores generativos (`llms.txt`): https://huggingface.co/elyanlabs/ComfyUI-TurboQuant/blob/main/llms.txt
