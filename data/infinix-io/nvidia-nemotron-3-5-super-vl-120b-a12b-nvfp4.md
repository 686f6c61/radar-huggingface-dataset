# Infinix-io/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 es la versión cuantizada en NVFP4 del modelo vision-lenguaje Nemotron 3.5 Super VL desarrollado por NVIDIA Corporation. Se trata de un modelo multimodal (texto, imagen y vídeo como entrada; texto como salida) orientado a razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo. Esta variante, publicada por el usuario Infinix-io, aplica cuantización NVFP4 de precisión mixta con destilación consciente de cuantización a partir del modelo BF16 original, con el objetivo de reducir los requisitos de memoria sin renunciar a la precisión del modelo de referencia.

El modelo combina una arquitectura híbrida de capas Mamba-2 intercaladas con capas de atención y capas de mezcla de expertos (MoE), junto con un codificador visual C-RADIO y un conector visión-lenguaje. Declara 120B parámetros totales con 12B parámetros activos y soporta contextos de hasta 1M tokens. Incorpora Multi-Token Prediction (MTP) para decodificación especulativa nativa y un modo de razonamiento configurable a través de la plantilla de chat.

Su relevancia actual reside en que permite desplegar un modelo multimodal de gran tamaño en hardware relativamente contenido: la model card cita configuraciones como una DGX Spark, una RTX PRO 6000, una H200, dos H100 o una GB200. La licencia OpenMDW-1.1 autoriza uso comercial y no comercial, lo que lo sitúa como una opción atractiva para agentes de texto y visión en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con Mixture-of-Experts y codificador visual C-RADIO |
| Parametros totales | 120B (según model card); 65.769.840.138 según safetensors del repo |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (pesos cuantizados en precisión mixta, modelopt_mixed); etiquetado como 8-bit en los tags |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención y capas de mezcla de expertos. Esta combinación busca eficiencia en secuencias largas (gracias a Mamba-2) manteniendo la capacidad de atención completa donde es necesaria. La componente MoE permite 120B parámetros totales con solo 12B activos por token, lo que reduce el coste computacional de inferencia. La parte visual se resuelve con un codificador C-RADIO seguido de un conector visión-lenguaje que proyecta las representaciones visuales al espacio del modelo de lenguaje.

Esta variante NVFP4 se obtiene mediante cuantización de precisión mixta con destilación consciente de cuantización desde el modelo BF16 base (nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16). El modelo incorpora Multi-Token Prediction (MTP), que habilita decodificación especulativa nativa, y un modo de razonamiento configurable mediante `enable_thinking=True/False` en la plantilla de chat, con niveles `off`, `on (medium)` y `on`. No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición exacta del dataset; la model card enlaza a los datasets de preentrenamiento de NVIDIA y al informe técnico.

## Capacidades

- Generación de texto y razonamiento con modo de razonamiento configurable (off / on medium / on).
- Generación y comprensión de código, incluyendo soporte de tool calling (parser `qwen3_coder` en vLLM).
- Comprensión de imágenes (image-text-to-text) mediante codificador C-RADIO.
- Comprensión de vídeo, con parámetros de muestreo configurables (fps, número de frames, tasa de poda de vídeo).
- Comprensión de documentos.
- Uso de herramientas y function calling, con `--enable-auto-tool-choice`.
- Razonamiento multi-paso y soporte para agentes.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP).
- Contexto largo de hasta 1M tokens para conversaciones y documentos extensos.

## Casos de uso

- Agentes multimodales de atención al cliente: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y contexto largo gracias a su ventana de hasta 1M tokens, manteniendo el historial completo de la interacción.
- Análisis de documentos extensos: procesamiento de informes, contratos o expedientes con decenas de miles de tokens junto con figuras y tablas escaneadas, aprovechando la comprensión de imagen y el contexto largo.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling y el parser `qwen3_coder`, permitiendo al modelo invocar herramientas, ejecutar pasos de razonamiento y generar parches de código.
- Comprensión de vídeo para moderación o análisis: muestreo configurable de frames (por ejemplo, 2 fps y 256 frames) y poda de vídeo para extraer descripciones, resúmenes o alertas sobre contenido audiovisual.
- Asistentes de razonamiento con presupuesto controlado: uso del nivel `on (medium)` para reducir tokens generados en tareas de producción donde la latencia importa, reservando el nivel `on` completo para casos que requieran mayor precisión.
- Despliegue en hardware contenido: servir el modelo en una única DGX Spark, RTX PRO 6000 o GB200 gracias a la cuantización NVFP4, habilitando agentes de texto y visión en entornos de borde o estaciones de trabajo.
- Automatización de flujos documentales multilingües: extracción y resumen de información en inglés, español, francés, alemán, italiano y japonés a partir de documentos con componentes visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una gráfica de precisión (`accuracy_plot.png`) y enlaza al informe técnico de NVIDIA, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras evaluaciones en la información facilitada.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 75 GB en safetensors; con cuantización NVFP4 el modelo está pensado para caber en configuraciones de memoria relativamente contenidas, aunque no se especifica el consumo exacto de VRAM en inferencia.
- GPU recomendadas según la model card: 1× DGX Spark (GB10), 1× NVIDIA RTX PRO 6000, 1× H200, 2× H100 o 1× GB200.
- Cabe en GPU de consumo: no se indica soporte para GPU de consumo tipo RTX 4090 en la información disponible; las configuraciones citadas son de gama profesional o de centro de datos.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57`), con backend Mamba `flashinfer`, caché SSM en float16 y decodificación especulativa mediante el modelo borrador LiLiCorr. También se mencionan ejemplos con SGLang en la model card.
- Latencia y throughput: no disponibles. La configuración de referencia para DGX Spark usa `--max-num-seqs 1` y 7 tokens especulativos por borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (este) | 120B totales / 12B activos | 1M | Texto, imagen, vídeo | OpenMDW-1.1 | Hugging Face |
| Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales / 12B activos | 1M | Texto, imagen, vídeo | OpenMDW-1.1 | Hugging Face (modelo base) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar esta variante con su modelo base BF16, del que se diferencia por la cuantización NVFP4 (menor huella de memoria) y por el uso del modelo borrador LiLiCorr para decodificación especulativa. No se dispone de datos de rendimiento comparado con otras familias.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El nivel de razonamiento `on (medium)` reduce el número de tokens generados pero puede afectar a la precisión, según advierte la model card.
- La cuantización NVFP4 puede introducir degradación de precisión respecto al modelo BF16, aunque se mitiga mediante destilación consciente de cuantización; no se cuantifica la pérdida en la información disponible.
- Idiomas soportados limitados a seis (en, es, fr, de, it, ja); el rendimiento en otros idiomas no está garantizado.
- La licencia OpenMDW-1.1 permite uso comercial y no comercial, pero conviene revisar sus términos completos antes de desplegar en producción.
- El despliegue requiere configuración específica de vLLM (backend Mamba, caché SSM, decodificación especulativa) y `--trust-remote-code`, lo que implica ejecutar código personalizado del repositorio.
- El contexto de 1M tokens puede requerir ajustes de memoria y no está claro que sea alcanzable en todas las configuraciones de hardware citadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y está publicado por un usuario tercero (Infinix-io) a partir del modelo de NVIDIA; conviene verificar la integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo borrador LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
