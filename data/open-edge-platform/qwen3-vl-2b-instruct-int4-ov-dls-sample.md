# open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls-sample

## Resumen

Qwen3-VL-2B-Instruct INT4 es una exportación optimizada del modelo vision-language Qwen3-VL-2B-Instruct de Alibaba Qwen, publicada por el equipo open-edge-platform de Intel. El artefacto consiste en un modelo convertido a formato OpenVINO IR con compresión de pesos INT4, pensado para ejecutarse sobre CPU Intel Core Ultra y su GPU integrada mediante OpenVINO GenAI. No se trata de un modelo nuevo entrenado desde cero, sino de una distribución lista para despliegue en el edge con un pipeline de ejemplo orientado a comprensión de vídeo.

El modelo base es un transformer multimodal de 2.000 millones de parámetros que acepta imagen y texto como entrada y genera texto libre. La variante publicada incluye dos scripts de ejemplo funcionales: uno basado en OpenVINO Runtime puro y otro sobre DLStreamer, ambos orientados a describir escenas de calle (peatones, vehículos y actividad) superponiendo los subtítulos generados sobre el vídeo de salida. El repositorio ocupa 1,8 GB y el IR exportado unos 1,7 GiB en disco.

Su relevancia actual reside en la combinación de un VLM compacto con cuantización INT4 y un runtime de inferencia (OpenVINO) que permite ejecutar comprensión visual de vídeo en hardware de consumo Intel sin GPU dedicada. La licencia MIT del artefacto facilita su integración en productos comerciales, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (modelo base Qwen3-VL-2B-Instruct) |
| Parametros totales | 2B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Compresión de pesos INT4 (NNCF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (exportado desde safetensors de PyTorch/Transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa entradas de imagen y texto y produce texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron etapas de RLHF o DPO; estos datos corresponden a la model card del modelo base, que no se ha incluido en la documentación proporcionada.

La innovación técnica de esta distribución es el proceso de exportación y cuantización: se parte de los pesos upstream en PyTorch, se convierten a OpenVINO IR y se comprimen a INT4 mediante NNCF 3.4.0, con Optimum Intel 2.2.0 y Transformers 5.0.0 como stack verificado. El resultado se ejecuta con OpenVINO GenAI 2026.4.1 y Tokenizers 2026.4.1.0, y se integra opcionalmente en DLStreamer 2026.2.0 mediante el elemento `gvagenai`, que permite procesar flujos de vídeo con `frame-rate` y `chunk-size` configurables.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y descripción de escenas visuales.
- Comprensión de vídeo mediante muestreo de fotogramas (los ejemplos usan `FRAME_STRIDE = 15` en OpenVINO y `frame-rate=2` en DLStreamer).
- Generación de subtítulos de forma libre sobre escenas de calle: peatones, vehículos y actividad.
- Integración en pipelines GStreamer mediante el elemento `gvagenai` de DLStreamer, con metadatos de caption asociados a los frames.
- Ejecución en CPU Intel Core Ultra y en su GPU integrada mediante OpenVINO (dispositivos soportados: CPU y GPU).
- Capacidades de tool calling, agentes, matemáticas, código o modos de razonamiento extendido: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Videovigilancia urbana en el edge: el modelo describe peatones, vehículos y actividad en escenas de calle y superpone los subtítulos al vídeo de salida, tal como implementan los scripts `openvino_sample.py` y `dlstreamer_sample.py`. Es adecuado porque el INT4 permite ejecutarlo en CPU/GPU integrada sin servidor dedicado.
- Análisis de tráfico en tiempo real con DLStreamer: el pipeline `gvagenai` procesa el flujo con `frame-rate=2` y `chunk-size=2`, generando metadatos de caption por frame que pueden consumirse en un `appsink` para alertas o indexación.
- Etiquetado automático de archivos de vídeo: ejecutando el script de OpenVINO sobre un `test_video.mp4` se obtienen descripciones por fotograma cada 15 frames, útiles para generar transcripciones visuales de material archivado.
- Prototipado de asistentes visuales en portátiles Intel Core Ultra: el modelo se carga con `openvino_genai.VLMPipeline` en dispositivo GPU o CPU, lo que permite validar casos de uso multimodales en hardware de consumo antes de escalar.
- Monitorización de accesos o recintos: con un prompt adaptado (por ejemplo, describir presencia de personas y vehículos), el modelo puede generar descripciones periódicas de la escena y alimentar sistemas de revisión humana.
- Integración en aplicaciones de accesibilidad: generación de descripciones textuales de vídeo para personas con discapacidad visual, aprovechando que el modelo produce texto libre de forma nativa y el pipeline superpone los subtítulos en el propio vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: CPU Intel Core Ultra y su GPU integrada. El modelo está pensado para el edge, no para aceleradores de datacenter.
- Tamaño en disco del IR exportado: aproximadamente 1,7 GiB (el autor indica explícitamente que es tamaño en disco, no requisito de memoria).
- VRAM estimada: no disponible. Al ejecutarse sobre GPU integrada, comparte memoria con el sistema; no se publican cifras de consumo.
- GPU dedicadas (A100, H100, RTX 4090): no son el objetivo del artefacto y no se documenta su soporte.
- Despliegue: OpenVINO GenAI (`VLMPipeline`) y DLStreamer 2026.2.0 con el elemento `gvagenai`. Dispositivos válidos: `CPU` y `GPU`.
- Stack verificado: OpenVINO 2026.4.1 con GenAI y Tokenizers 2026.4.1.0; DLStreamer nativo 2026.2.0 enlazado a esas librerías. La imagen oficial de DLStreamer 2026.2.0 y el NPU no fueron probados.
- Exportación: Optimum Intel 2.2.0, Transformers 5.0.0 y NNCF 3.4.0; versiones más recientes de Transformers pueden ser rechazadas por esa versión de Optimum.
- Requisitos de entorno: Python 3.11 o superior, FFmpeg, `curl` y driver OpenCL de Intel para inferencia en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls-sample | 2B | no disponible | OpenVINO IR INT4 | MIT | Optimizado para CPU/GPU integrada Intel; incluye samples de OpenVINO y DLStreamer |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | PyTorch (safetensors) | no disponible en la información proporcionada | Modelo base upstream; requiere exportación y cuantización para el edge |
| Alternativas de la misma categoría (otros VLM de 2B en OpenVINO) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El artefacto es una distribución cuantizada del modelo base; la cuantización INT4 puede degradar la calidad de las descripciones frente a los pesos originales en FP16/BF16.
- Los ejemplos limitan la generación a `max_new_tokens = 40`, lo que restringe la longitud de las descripciones; para textos más largos debe ajustarse la configuración.
- En DLStreamer, el autor advierte de que los metadatos de caption pueden no llegar de inmediato en clips cortos.
- Solo se han validado los dispositivos CPU y GPU; el NPU y la imagen oficial de DLStreamer 2026.2.0 no fueron probados.
- El pipeline de exportación está fijado a Transformers 5.0.0; versiones posteriores pueden romper la compatibilidad con Optimum Intel 2.2.0.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; deben evaluarse empíricamente antes de producción.
- La licencia MIT se aplica al artefacto publicado; conviene verificar las condiciones del modelo base Qwen/Qwen3-VL-2B-Instruct para uso comercial.
- El modelo está orientado a descripción de escenas y comprensión de vídeo; no se documentan capacidades de tool calling, agentes o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3-vl-2B-instruct-int4-ov-dls-sample
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
