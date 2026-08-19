# Chungulus/Qwen3.8-27B-MLX-6bit-Group32

## Resumen

Chungulus/Qwen3.8-27B-MLX-6bit-Group32 es una cuantizacion MLX de 6 bits con grupo de 32 del modelo Qwen3.8-27B, un modelo denso de vision y lenguaje desarrollado por el equipo Qwen de Alibaba. Esta version concreta, publicada por el usuario Chungulus, no es un fine-tuning ni una modificacion de alineacion: se trata de una conversion directa de los pesos originales (fijados en un commit concreto) al formato MLX, pensada para ejecutarse en Apple Silicon con memoria unificada. El artefacto ocupa 25,3 GB y esta diseñado para hardware con al menos 48 GB de RAM unificada.

La relevancia de esta ficha radica en que permite evaluar si la cuantizacion de 6 bits mantiene la calidad del modelo original en tareas de texto, vision, tool calling y decodificacion especulativa (MTP). El autor ha incluido una validacion exhaustiva: comparacion de logits con la fuente BF16, similitud semantica, pruebas de tool calling y un analisis de rendimiento del drafter MTP que muestra una aceleracion medida del 20,6 % en throughput. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

Aunque el nombre comercial indica 27B, el conteo real de parametros segun los safetensors es de 7.186.713.840 (~7,2B), una discrepancia que no se explica en la documentacion del repo y que conviene tener en cuenta al comparar con otras implementaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (identificador interno `qwen3_5`), hibrida Gated DeltaNet + atencion completa, con torre de vision y proyector |
| Parametros totales | 7.186.713.840 (segun safetensors; el nombre comercial indica 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K tokens (segun el modelo base Qwen3.8-27B; no verificado en esta cuantizacion) |
| Tipos de cuantizacion | MLX affine 6-bit con group size 32, sin calibracion |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion completa con capas basadas en Gated DeltaNet, una variante de atencion lineal que reduce el coste computacional en contextos largos. Incluye ademas un codificador de vision (vision tower) y un proyector para entrada de imagenes y video, asi como un componente MTP (Multi-Token Prediction) que actua como drafter para decodificacion especulativa. La cuantizacion de Chungulus no altera la arquitectura: se limita a convertir los pesos originales a 6 bits con grupo de 32, sin calibracion ni fine-tuning posterior. El proceso de conversion se realizo con `mlx-vlm` version 0.6.1 y los pesos fuente se fijaron en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio oficial.

El autor ha verificado que los componentes de texto, vision, tool calling y MTP cargan correctamente y pasan pruebas funcionales. La comparacion con la fuente BF16 muestra una similitud semantica media de 0,953 (usando un modelo de sentence-transformers como proxy) y una divergencia KL media de 0,00139 en logits fijos, con un acuerdo top-1 del 99,06 %. No se ha realizado entrenamiento adicional; se trata de una conversion puramente numerica.

## Capacidades

- Generacion de texto y razonamiento: soporta modos de pensamiento configurables mediante los controles `enable_thinking`, `reasoning_effort` y `preserve_thinking` del chat template original.
- Vision y video: acepta entrada de imagenes y video a traves de la torre de vision y el proyector; el autor ha validado pruebas deterministicas locales de imagen.
- Tool calling: soporta el formato nativo XML de Qwen para function calling; todas las pruebas de herramientas pasaron.
- Decodificacion especulativa con MTP: incluye un drafter MTP que acelera la generacion; en las pruebas del autor, la tasa de aceptacion fue del 94,1 % y el throughput aumento de 10,53 a 12,71 tokens por segundo (aceleracion del 20,6 %).
- Multilingue: el modelo base es multilingue, aunque la cuantizacion no especifica la lista de idiomas soportados.
- Conversacional: pipeline `image-text-to-text`, apto para dialogos multimodales.

## Casos de uso

- Asistentes de codigo en entornos Apple Silicon: el modelo base destaca en tareas de programacion (segun la guia de Lovable, DeepSWE 42.2). Con esta cuantizacion, un desarrollador puede ejecutar un asistente de codigo local en un Mac Studio con 48 GB de RAM unificada, usando tool calling para interactuar con el sistema de archivos o ejecutar comandos.
- Automatizacion de oficina: el modelo base esta optimizado para tareas de ofimatica (procesamiento de documentos, hojas de calculo, presentaciones). La cuantizacion permite desplegarlo en un equipo local sin conexion, manteniendo la privacidad de los datos.
- Agentes de largo horizonte: con 262K tokens de contexto (segun el modelo base) y soporte de razonamiento configurable, puede gestionar conversaciones multi-turno extensas, como la planificacion de proyectos o la investigacion web con multiples pasos.
- Analisis de imagenes en local: al ser un modelo de vision-lenguaje, puede describir imagenes, extraer texto (OCR) o responder preguntas visuales sin enviar datos a la nube. El autor valido pruebas de imagen con prompts como "Describe this image."
- Prototipado rapido de aplicaciones multimodales: gracias al formato MLX y la integracion con `mlx-vlm`, los desarrolladores pueden crear demos de chatbots con entrada de imagen y texto en Python, usando el drafter MTP para reducir la latencia.
- Evaluacion de cuantizaciones: esta version sirve como referencia para medir el impacto de la cuantizacion de 6 bits en la calidad del modelo, comparando con la version BF16 o con otras cuantizaciones (4-bit, 8-bit) en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion concreta. El autor incluye metricas de validacion interna (similitud semantica, KL, acuerdo top-1) pero no resultados de MMLU, HumanEval u otros tests estandar. Para el modelo base Qwen3.8-27B, la busqueda web reporta los siguientes datos (no verificados en esta cuantizacion):

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |

Estos numeros corresponden al modelo original en precision completa y no deben atribuirse a esta version cuantizada. La unica medicion de rendimiento disponible es la del drafter MTP: 12,71 tokens por segundo con MTP frente a 10,53 sin el, en el hardware de prueba del autor.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 25,3 GB, pero el pico de memoria medido durante la validacion fue de 27,49 GB. Se requiere al menos 48 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon (M-series) con 48 GB o mas de RAM unificada. No es compatible con GPUs NVIDIA o AMD en este formato.
- Opciones de despliegue: `mlx-vlm` version 0.6.1 (o superior) con `mlx` 0.31.2 y `mlx-lm` 0.31.3. Tambien se puede usar el drafter MTP con `--draft-model` y `--draft-kind mtp`.
- Latencia y throughput: en las pruebas del autor, 10,53 tokens por segundo sin MTP y 12,71 con MTP, en un hardware no especificado (presumiblemente un Mac con 48 GB o mas). La latencia por token seria de aproximadamente 95 ms sin MTP y 79 ms con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | 27B (nominal) | 262K | BF16 | Apache-2.0 | safetensors |
| Chungulus/Qwen3.8-27B-MLX-6bit-Group32 | 7,19B (segun safetensors) | 262K (no verificado) | MLX 6-bit group 32 | Apache-2.0 | safetensors (MLX) |
| Otras cuantizaciones MLX de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con el modelo base muestra que la cuantizacion reduce el tamaño del artefacto de aproximadamente 54 GB (estimado para BF16) a 25,3 GB, a cambio de una pequena perdida de fidelidad (similitud semantica 0,953). No se dispone de datos de otras cuantizaciones del mismo modelo para comparar.

## Limitaciones y advertencias

- La cuantizacion de 6 bits puede degradar la calidad en tareas de alta precision, especialmente en razonamiento numerico o generacion de codigo complejo. El autor advierte que la reduccion de calidad es mayor a bit widths muy bajos.
- El soporte de runtime es especifico: solo funciona con `mlx-vlm` 0.6.1 y versiones compatibles. Un cargador que lea solo tensores de lenguaje no es suficiente; se necesita soporte para la arquitectura hibrida, la torre de vision, el proyector y el MTP.
- La longitud de contexto de 262K es la del modelo base, pero no se ha verificado en esta cuantizacion. El prompt mas largo probado por el autor fue de 73 tokens, muy por debajo del maximo arquitectonico. No se debe asumir que la cuantizacion mantiene el contexto completo sin degradacion.
- No se han realizado pruebas de sesgos ni de alucinacion especificas para esta version. El modelo base puede presentar sesgos tipicos de los modelos entrenados con datos web.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al modelo original y a esta cuantizacion.
- El conteo de parametros (7,19B) no coincide con el nombre comercial (27B). Esta discrepancia no esta documentada y podria deberse a un error en el repo o a una arquitectura con parametros compartidos. Conviene verificar antes de usar en produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-6bit-Group32
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Analisis de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Informacion de Qwen3.8 en OpenLM: https://openlm.ai/qwen3.8/
