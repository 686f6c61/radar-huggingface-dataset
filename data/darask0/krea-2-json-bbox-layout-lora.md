# darask0/krea-2-json-bbox-layout-lora

## Resumen

Krea 2 JSON/BBOX Layout LoRA es un adaptador LoRA para el modelo de difusión texto-a-imagen Krea-2-Raw, desarrollado por el usuario darask0. Su propósito es permitir la generación de páginas de manga completas a partir de una especificación estructurada en JSON que describe la disposición de viñetas, personajes, bocadillos, diálogos en japonés y símbolos manga (manpu) mediante coordenadas BBOX. El adaptador resuelve el problema de que el modelo base, sin el LoRA, tiende a renderizar literalmente las coordenadas y fragmentos del JSON como texto en la imagen, además de producir diálogos ilegibles.

El adaptador tiene un tamaño de 200 MB (rank 64) y se distribuye en formato safetensors para la librería diffusers. Está entrenado específicamente para el dominio del manga japonés y soporta japonés e inglés. No es un modelo oficial de Krea ni está respaldado por la compañía; se distribuye bajo la Krea 2 Community License.

La relevancia actual radica en que aborda una tarea de control espacial fino (layout-to-image) en un dominio con requisitos tipográficos exigentes como la escritura vertical japonesa, algo poco común en adaptadores LoRA de código abierto. El autor publica además métricas de evaluación cuantitativas sobre un conjunto de validación de 80 páginas no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión Krea-2-Raw (text-to-image) |
| Parametros totales | no disponible (rank 64, archivo de 200 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos del LoRA en safetensors; el modelo base se usa en bf16) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 64 que se aplica sobre el modelo de difusión Krea-2-Raw mediante `load_lora_adapter` de diffusers. No se especifica en la información disponible la arquitectura interna del modelo base (tipo de transformer de difusión, número de parámetros ni composición del dataset de entrenamiento del LoRA). El adaptador está diseñado para interpretar una representación JSON que codifica la estructura de una página de manga: número y disposición de viñetas, BBOX de personajes, BBOX de bocadillos y texto de diálogo en japonés, poses por personaje y símbolos manga.

La innovación técnica destacable es la capacidad de aplicar LoRAs de personaje de forma regional: el script `generate.py` permite asignar un LoRA de personaje distinto al área BBOX de cada personaje (`--region nombre=archivo:fuerza`), con difuminado en los bordes de la región. Esto requiere ejecutar el modelo dos veces adicionales por cada LoRA de personaje en cada paso de muestreo, lo que multiplica el tiempo de inferencia (aproximadamente 3x con dos personajes). No se dispone de información sobre si el entrenamiento del LoRA empleó RLHF, DPO ni sobre el volumen de tokens o imágenes utilizado.

## Capacidades

- Generación de páginas de manga a partir de especificaciones JSON con coordenadas BBOX para viñetas, personajes, bocadillos y manpu.
- Renderizado de diálogo en japonés con escritura vertical legible dentro de los bocadillos, según el texto indicado en el campo `text`.
- Aplicación regional de LoRAs de personaje: cada personaje puede tener un LoRA distinto aplicado solo dentro de su BBOX.
- Especificación de pose por personaje mediante el campo `pose` (postura, acción, expresión).
- Generación de símbolos manga (manpu): sudor, rubor, ojos en espiral, lágrimas, marcas de enfado, líneas de concentración, entre otros.
- Control de la disposición de viñetas (número y orden) y de la posición de personajes y bocadillos.
- Soporte de dos idiomas en las instrucciones: japonés e inglés.

## Casos de uso

- Prototipado rápido de páginas de manga: un guionista o dibujante puede describir la estructura de una página en JSON y obtener un boceto con la disposición correcta de viñetas, personajes y diálogos, acelerando la fase de storyboard antes del dibujo final.
- Generación de borradores para revistas o fanzines: el adaptador permite producir páginas con diálogo japonés legible y manpu colocados, útiles como base para revisión editorial o para publicaciones de bajo presupuesto.
- Consistencia de personajes en series: mediante LoRAs de personaje aplicados regionalmente, un equipo puede mantener el diseño de cada personaje a lo largo de varias páginas sin que se mezclen sus rasgos, algo crítico en narrativa seriada.
- Localización y adaptación de manga: el control por BBOX y el texto de diálogo en japonés permiten generar variantes de una misma página cambiando solo el contenido de los bocadillos, útil para pruebas de traducción o adaptación cultural.
- Docencia y experimentación en layout-to-image: investigadores pueden usar el adaptador como caso de estudio de control espacial fino en modelos de difusión, con métricas publicadas de IoU y coincidencia OCR para reproducir experimentos.
- Generación de material para juegos o novelas visuales: creación de viñetas con poses y expresiones especificadas por personaje, integrables en pipelines de assets 2D para prototipos de narrativa interactiva.
- Pruebas de concepto de manga asistido por IA: estudios pequeños pueden evaluar la viabilidad de producir páginas completas con diálogo legible antes de invertir en ilustradores, usando el adaptador como herramienta de exploración.

## Benchmarks y rendimiento

El autor publica métricas de evaluación sobre 80 páginas no vistas durante el entrenamiento, comparando el modelo con y sin el LoRA. La detección se realizó con un detector YOLO entrenado en Manga109, y la coincidencia de diálogo mediante OCR (1 − distancia de edición / longitud).

| Metrica | Manga original (referencia) | Sin LoRA | Con LoRA |
|---|---|---|---|
| IoU de viñetas | 0.724 | 0.196 | 0.353 |
| IoU de personajes | 0.630 | 0.122 | 0.227 |
| IoU de texto | 0.571 | 0.067 | 0.113 |
| Coincidencia de diálogo | 0.714 | 0.188 | 0.556 |
| Diálogo exacto | 32% | 2% | 13% |

Resultados adicionales reportados por el autor:

| Prueba | Resultado |
|---|---|
| LoRAs de personaje (24 ubicaciones) | 0 confusiones entre personajes; 22 con rasgos claramente reproducidos |
| Poses sin LoRA de personaje (12 imágenes) | 12/12 correctas |
| Poses con LoRA de personaje (24 ubicaciones) | 23/24 correctas |
| Manpu (21 símbolos, seed 101) | 19/21 colocados |
| Manpu (21 símbolos, seed 202) | 17/21 colocados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 45 GB en bf16 para el modelo base más el LoRA (misma cifra con LoRAs de personaje).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada por el autor, ~30 segundos por imagen), así como GPUs de gama alta con suficiente VRAM (A100 80GB, H100).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bf16 según los requisitos indicados; se requeriría cuantización del modelo base, no documentada en la información disponible.
- Opciones de despliegue: diffusers (versión 0.42.1 verificada, con `Krea2Pipeline`), junto con `torch`, `transformers`, `peft`, `safetensors` y `Pillow`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia: aproximadamente 30 segundos por imagen en RTX PRO 6000 Blackwell con 28 pasos y CFG 4.5. Con dos LoRAs de personaje, el tiempo se multiplica aproximadamente por 3.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables de layout-to-image para manga en la documentación proporcionada. Se indica "no disponible" para una comparativa rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 JSON/BBOX Layout LoRA | no disponible (LoRA rank 64) | no aplica | Métricas propias en model card | krea-2-community-license | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor reconoce que el adaptador no alcanza la calidad del manga original: la IoU de viñetas es 0.353 frente a 0.724 de referencia, y la coincidencia de diálogo es 0.556 frente a 0.714.
- El número y la posición de las viñetas pueden desviarse de la especificación; el personaje tiende a dibujarse más pequeño que el BBOX indicado, y pueden aparecer viñetas extra finas en la parte superior.
- Los manpu no siempre se colocan exactamente en las coordenadas BBOX indicadas, ya que la forma de las viñetas generadas puede diferir de la especificada; símbolos pequeños como ojos en forma de corazón no se generan.
- Con LoRAs de personaje pueden mezclarse colores de ropa o accesorios (por ejemplo, intercambio de colores de abrigo); en páginas en blanco y negro, un LoRA de personaje entrenado en color introduce color; se ha observado un caso de duplicación del mismo personaje.
- Los LoRAs de personaje débiles (por ejemplo, rank 16 con 400 pasos) no producen efecto; es necesario validar previamente que el LoRA de personaje reproduzca los rasgos en una imagen individual.
- La licencia krea-2-community-license impone restricciones que deben consultarse en el PDF incluido; no es una licencia de código abierto permisiva y puede limitar el uso comercial.
- El adaptador no es oficial de Krea ni está respaldado por la compañía.
- Riesgo de alucinación visual y de texto: el modelo puede generar texto ilegible o incorrecto fuera de las regiones controladas, y no se documentan sesgos específicos más allá de los del modelo base.
- El soporte lingüístico se limita a japonés e inglés; no se garantiza la calidad en otros idiomas.
- Los requisitos de VRAM (~45 GB) excluyen el despliegue en GPUs de consumo sin cuantización adicional no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/darask0/krea-2-json-bbox-layout-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia (PDF): https://huggingface.co/darask0/krea-2-json-bbox-layout-lora/blob/main/LICENSE.pdf
- Ejemplos: https://huggingface.co/darask0/krea-2-json-bbox-layout-lora/tree/main/examples
- Personajes de prueba: https://huggingface.co/darask0/krea-2-json-bbox-layout-lora/tree/main/examples/characters
- Script de generación: https://huggingface.co/darask0/krea-2-json-bbox-layout-lora/blob/main/generate.py
- Script de prompt: https://huggingface.co/darask0/krea-2-json-bbox-layout-lora/blob/main/make_prompt.py
