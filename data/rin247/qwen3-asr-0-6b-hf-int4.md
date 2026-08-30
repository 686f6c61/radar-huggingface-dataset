# Rin247/Qwen3-ASR-0.6B-hf-INT4

## Resumen

El modelo `Rin247/Qwen3-ASR-0.6B-hf-INT4` es una cuantización INT4 weight-only del modelo `Qwen3-ASR-0.6B-hf`, perteneciente a la familia Qwen3-ASR desarrollada por el equipo Qwen de Alibaba. Esta familia está diseñada para reconocimiento automático de voz (ASR) y soporta identificación de idioma y transcripción en 52 idiomas y dialectos, aprovechando la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni.

La cuantización reduce el tamaño del modelo a 0,7 GB, lo que facilita su despliegue en entornos con recursos limitados. El modelo base tiene 471 millones de parámetros (a pesar de la denominación "0.6B"), y la versión cuantizada mantiene la arquitectura original con escalas almacenadas junto a los pesos. Es relevante porque permite ejecutar un sistema ASR multilingüe de última generación en hardware de consumo, algo que hasta ahora requería modelos más grandes o servicios en la nube.

La cuantización fue realizada por el usuario Rin247 mediante PyTorch RTN (round-to-nearest) en CPU, y los archivos se distribuyen en formato safetensors con un `config.json` que incluye la configuración de cuantización. Es importante señalar que se requieren recetas personalizadas de de-cuantización para su uso en motores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio estilo Whisper + decoder de lenguaje Qwen3) |
| Parametros totales | 471.220.224 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del audio de entrada; el modelo base no especifica una ventana de contexto textual) |
| Tipos de cuantizacion | INT4 weight-only (escalas almacenadas junto a los pesos) |
| Idiomas soportados | 52 idiomas y dialectos (segun la documentacion de Qwen3-ASR) |
| Licencia | no disponible (la model card no la especifica; el modelo base Qwen3-ASR probablemente usa Apache 2.0, pero no se confirma) |
| Formato de pesos | safetensors con cuantizacion INT4 (archivos `model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B combina un encoder de audio inspirado en Whisper con un decoder de lenguaje basado en Qwen3. Esta arquitectura híbrida permite procesar señales de audio y generar texto de forma autoregresiva, similar a otros modelos ASR modernos. El entrenamiento se realizó con datos de habla a gran escala y aprovechó la capacidad de comprensión de audio de Qwen3-Omni, el modelo multimodal de la familia Qwen.

La cuantización INT4 aplicada por Rin247 utiliza el método RTN (round-to-nearest) sobre CPU, almacenando las escalas de cuantización como buffers separados (`*.weight_scale` y `*.weight_shape`). Esto significa que los pesos se almacenan en formato INT4 pero requieren una de-cuantización explícita antes de ser alimentados a un motor de inferencia. No se dispone de información sobre el dataset de entrenamiento específico ni sobre el uso de técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento de voz automatico (ASR) en 52 idiomas y dialectos, incluyendo identificación de idioma.
- Transcripción de audio a texto con alta precisión, especialmente en el modelo de 1.7B que logra rendimiento SOTA entre modelos ASR open-source (segun el informe tecnico).
- Capacidad de comprensión de audio heredada de Qwen3-Omni, lo que permite manejar señales de audio complejas.
- Soporte multilingüe amplio, cubriendo lenguas mayoritarias y dialectos regionales.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente ASR.
- No incluye capacidades de vision ni audio de salida; solo procesa audio como entrada y genera texto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto con soporte multilingüe, útil para equipos internacionales que necesitan actas automáticas. Su tamaño reducido permite ejecutarlo en portátiles con GPU modesta.
- Subtitulado automático de vídeos: al soportar 52 idiomas, puede generar subtítulos para contenido multimedia en plataformas de streaming o redes sociales, reduciendo costes de transcripción manual.
- Asistentes de voz para dispositivos embebidos: la cuantización INT4 y el tamaño de 0,7 GB hacen viable su integración en dispositivos con poca memoria, como routers o altavoces inteligentes, para comandos de voz básicos.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas para análisis de sentimiento o cumplimiento normativo, con la ventaja de que el modelo se puede desplegar on-premise para garantizar privacidad.
- Accesibilidad para personas con discapacidad auditiva: aplicaciones de transcripción en tiempo real que convierten conversaciones habladas en texto, funcionando en dispositivos de gama media.
- Investigación lingüística: el soporte de 52 idiomas y dialectos permite a investigadores transcribir corpus orales en lenguas minoritarias sin depender de servicios comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización INT4 en la información disponible. El informe técnico de Qwen3-ASR indica que el modelo de 1.7B logra rendimiento SOTA entre modelos ASR open-source, pero no se proporcionan cifras concretas para la versión de 0.6B ni para la cuantización. Se recomienda consultar el paper técnico (enlace en la sección de enlaces) para obtener métricas detalladas del modelo base.

## Requisitos de hardware

- VRAM estimada: con 0,7 GB de tamaño de archivo, la inferencia puede ejecutarse en GPUs con 2 GB de VRAM o menos, dependiendo de la longitud del audio y el batch. En CPU, se puede ejecutar con 1-2 GB de RAM adicional.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso integradas modernas. Para producción, una RTX 3060 o superior ofrecería mayor throughput.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: al ser una cuantización personalizada, no se puede usar directamente con vLLM, llama.cpp u Ollama sin implementar la de-cuantización. Se requiere un motor de inferencia que soporte recetas weight-only personalizadas, o bien de-cuantizar los pesos a FP16/FP32 antes de cargarlos en frameworks estándar como Transformers.
- Latencia y throughput: no disponible. Depende del hardware y de la implementación de la de-cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (base) | 471M | no disponible | 52 | no disponible (probablemente Apache 2.0) | safetensors FP16 |
| Qwen3-ASR-1.7B (base) | 1.7B | no disponible | 52 | no disponible (probablemente Apache 2.0) | safetensors FP16 |
| Whisper small | 244M | 30 segundos de audio | 96 | MIT | safetensors, GGUF |
| Whisper medium | 769M | 30 segundos de audio | 96 | MIT | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos base. La cuantización INT4 de Rin247 no tiene equivalente directo en otras familias, pero Whisper ofrece cuantizaciones GGUF que son más fáciles de desplegar. Qwen3-ASR destaca por su soporte de 52 idiomas y su integración con la familia Qwen3.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar la precisión del modelo en comparación con la versión FP16, especialmente en idiomas con fonética compleja o en condiciones de audio ruidoso.
- El proceso de de-cuantización requiere buffers adicionales (`*.weight_scale`, `*.weight_shape`) y no es compatible directamente con frameworks estándar; se necesita implementar una lógica personalizada.
- El modelo base tiene solo 471M de parámetros, lo que puede limitar su rendimiento en tareas ASR con vocabulario muy especializado o acentos extremos.
- No se especifica la licencia en la model card; antes de usar comercialmente, se debe verificar la licencia del modelo base Qwen3-ASR.
- La fecha de creación (2026-08-29) es futura, lo que sugiere que el modelo puede ser experimental o tener una procedencia no verificada.
- No se dispone de información sobre sesgos específicos, pero como modelo ASR, puede tener un rendimiento desigual entre idiomas según la representación en los datos de entrenamiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Rin247/Qwen3-ASR-0.6B-hf-INT4
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico de Qwen3-ASR: https://arxiv.org/html/2601.21337v1
- Coleccion de modelos Qwen3-ASR en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-asr
- Documentacion de Transformers para Qwen3-ASR: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr
