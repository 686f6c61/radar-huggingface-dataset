# haihengh/Qwen3.6-35B-A3B-finch-3bit-abliterated-vision

## Resumen

Qwen3.6-35B-A3B-finch-3bit-abliterated-vision es un artefacto de despliegue, no un checkpoint de Transformers, publicado por el usuario haihengh. Consiste en el modelo Qwen3.6-35B-A3B en su variante "abliterated" de huihui-ai, reempaquetado en el formato propietario `.finch` del motor de inferencia out-of-core FinchMoE, con los expertos enrutados cuantizados a 3 bits y la torre de visión del modelo original incluida byte a byte. El resultado es un paquete de 15,76 GiB que puede ejecutarse en Mac e iOS mediante las aplicaciones del ecosistema FinchMoE sin cargar la totalidad de los pesos en memoria.

El modelo subyacente es un Mixture-of-Experts de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que explica la nomenclatura A3B. La relevancia de este repositorio es fundamentalmente práctica: demuestra una ruta de despliegue para un MoE multimodal de ese tamaño en hardware de consumo Apple mediante cuantización agresiva de los expertos y gestión de pesos fuera de núcleo. No obstante, el autor no publica mediciones propias de calidad ni de rendimiento para esta variante.

Conviene subrayar que este repositorio no es un modelo entrenado desde cero ni un fine-tune: es un contenedor derivado. La ablación de rechazos se realizó en el modelo upstream de huihui-ai, y el reempaquetado se hizo con la herramienta FinchMoERepack el 28 de octubre de 2026. Cualquier evaluación de capacidades debe remitirse al modelo base y a la ficha del hermano textual sin visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts transformer con atención lineal (GDN) y expertos compartidos; torre de visión incluida |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | 3B (aproximado, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados 3 bits afín (grupo 64, escalas/sesgos BF16); atención/GDN/expertos compartidos 4 bits; atención lineal y router 8 bits; embeddings 4 bits; torre de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Finch `.finch` (manifest.json, model_weights.bin, packed_experts/layer_XX.bin, tokenizer/, vision/) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer con mezcla de expertos: 256 expertos enrutados por capa en 40 capas, con un pool total de expertos de 14.092.861.440 bytes (13,12 GiB) y un stride de 1.376.256 bytes por experto. El texto combina capas de atención con capas de atención lineal (denominadas GDN en la documentación del autor) y expertos compartidos, un patrón habitual en los MoE recientes de Qwen. La torre de visión se conserva íntegra en BF16: 333 tensores que suman 851,8 MiB, copiados byte a byte desde el snapshot fuente y mapeados en memoria solo durante la codificación de una imagen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original dentro de la información proporcionada. La innovación técnica de este repositorio no está en el entrenamiento, sino en el empaquetado: cuantización asimétrica por tipo de tensor (3 bits para expertos enrutados, 4 bits para el cuerpo denso, 8 bits para router y atención lineal) y una disposición de ficheros que permite al motor FinchMoE cargar expertos bajo demanda desde disco. El manifest registra el SHA-256 de cada fichero y el snapshot fuente (`sha256:41b9356101ebf8e7519e150dc811f80c4226e727301fbb032b890f006ed0be83`), lo que permite verificar la procedencia de la instalación.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`): la torre de visión permite turnos con entrada de imagen en las aplicaciones FinchMoE compatibles.
- Capacidades de código y matemáticas: no verificadas en esta variante, pero atribuibles al modelo base.
- Soporte de tool calling y function calling: no documentado en esta ficha; depende de la plantilla de chat incluida en `tokenizer/`.
- Comportamiento "abliterated": el modelo upstream de huihui-ai ha sido modificado para reducir los rechazos ante peticiones que el modelo original declinaría; esta característica se hereda íntegra.
- Multilingüismo: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local multimodal en Mac: el paquete `.finch` está diseñado para las aplicaciones Mac/iOS de FinchMoE, de modo que un usuario puede mantener conversaciones con imágenes sin conexión a servicios en la nube, cargando solo los expertos necesarios desde disco.
- Análisis de capturas y documentos escaneados en escritorio: la torre de visión en BF16, mapeada únicamente durante la codificación, permite describir, resumir o extraer información de imágenes en flujos de trabajo locales con requisitos de privacidad estrictos.
- Prototipado de agentes con restricciones de memoria: la combinación de 3B parámetros activos y carga out-of-core permite experimentar con un MoE de 35B en equipos con memoria unificada limitada, algo inviable con un checkpoint BF16 completo.
- Evaluación de cuantización extrema en MoE: investigadores pueden comparar la calidad del camino textual de 3 bits con el modelo original y con la variante de 4 bits, usando el hermano textual como referencia medida.
- Investigación sobre ablación de rechazos: el modelo permite estudiar el comportamiento de un modelo abliterated en tareas de visión-lenguaje, un área con pocos artefactos publicados.
- Integración en pipelines CLI por lotes: la interfaz `FinchMoECLI --messages-file` permite procesar lotes de peticiones multimodales desde scripts, útil para generación de descripciones de imágenes a escala moderada.
- Desarrollo y prueba de la propia herramienta FinchMoERepack: el repositorio sirve como ejemplo reproducible de reempaquetado con `--routed-expert-bits 3 --include-vision`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta variante "no se mide por separado" y remite a la ficha de `haihengh/Qwen3.6-35B-A3B-finch-3bit-abliterated` para la calidad y el throughput del camino textual. La torre de visión añade 851,8 MiB de pesos BF16 que solo se mapean durante la codificación de imagen, pero no se documenta el coste de latencia asociado.

## Requisitos de hardware

- VRAM/memoria: el paquete completo ocupa 15,76 GiB en disco; los pesos residentes son 1.894.721.536 bytes (unos 1,76 GiB) y el pool de expertos 13,12 GiB. El motor está diseñado para carga out-of-core, por lo que la memoria necesaria en ejecución es inferior al total del paquete, aunque el valor exacto no está documentado.
- GPU recomendadas: no disponible. El ecosistema FinchMoE está orientado a Apple Silicon (Mac e iOS); no se documenta soporte para CUDA.
- GPU de consumo: el diseño apunta a equipos Apple con memoria unificada; no hay datos sobre RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: FinchMoECLI y las aplicaciones Mac/iOS de FinchMoE. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.finch` no es un checkpoint de Transformers.
- Latencia y throughput: no disponibles para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Vision | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (finch-3bit-abliterated-vision) | 35B totales / ~3B activos | no disponible | Finch `.finch` | Sí (BF16, 851,8 MiB) | Apache 2.0 | Solo motor FinchMoE; sin benchmarks propios |
| haihengh/Qwen3.6-35B-A3B-finch-3bit-abliterated | 35B totales / ~3B activos | no disponible | Finch `.finch` | No | Apache 2.0 | Hermano textual con la misma receta; referencia de calidad medida |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35B totales / ~3B activos | no disponible | safetensors (BF16) | Sí | Apache 2.0 | Modelo base abliterated; requiere hardware para BF16 completo |
| Qwen3.6-35B-A3B (original) | 35B totales / ~3B activos | no disponible | safetensors | Sí | no disponible | Modelo upstream sin ablación; comportamiento de rechazo estándar |

## Limitaciones y advertencias

- La ablación de rechazos elimina salvaguardas del modelo original: puede producir contenido que el modelo base declinaría, con implicaciones legales y de seguridad en producción.
- Riesgo de alucinación inherente al modelo base, agravado potencialmente por la cuantización a 3 bits de los expertos enrutados; no hay evaluación publicada de la degradación introducida.
- La cuantización de expertos a 3 bits es agresiva y no está medida: la calidad del camino textual debe validarse contra el modelo BF16 antes de cualquier uso crítico.
- El formato `.finch` no es portable: no funciona con Transformers, vLLM, llama.cpp ni otras herramientas estándar, lo que limita la integración y la reproducibilidad.
- El repositorio omite deliberadamente `verified-install.json`, de modo que la verificación de integridad recae en el instalador, que comprueba cada fichero contra `manifest.json`.
- La aplicación Mac/iOS requiere una fila de modelo con capacidad de visión; una fila solo-texto rechazará el directorio `vision/` en lugar de ignorarlo.
- Idiomas soportados y longitud de contexto no documentados: no se puede garantizar cobertura multilingüe ni conversaciones de contexto largo.
- Licencia Apache 2.0 declarada, pero los pesos son obra derivada del modelo upstream; conviene revisar las condiciones del modelo base y de la variante de huihui-ai.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finch-3bit-abliterated-vision
- Hermano textual sin visión: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finch-3bit-abliterated
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Motor FinchMoE: https://github.com/haihengh/finchMoE
