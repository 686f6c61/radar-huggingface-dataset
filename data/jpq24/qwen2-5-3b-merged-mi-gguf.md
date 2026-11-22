# JPQ24/Qwen2.5-3B-Merged-MI-GGUF

## Resumen

Qwen2.5-3B-Merged-MI-GGUF es una distribución cuantizada del modelo Qwen2.5-3B-Instruct de Alibaba, publicada por el usuario JPQ24 en Hugging Face. Se trata de un checkpoint al que se le ha fusionado un adaptador LoRA orientado a razonamiento agéntico y que posteriormente se ha comprimido mediante una técnica propietaria denominada "Inference-Driven Mutual Information Pre-Conditioning", cuyo objetivo declarado es preservar el comportamiento del modelo original bajo cuantizaciones agresivas por debajo de 4 bits.

El modelo parte de la arquitectura transformer densa de Qwen2.5 con 3.085.938.688 parámetros y una ventana de contexto de 32.768 tokens (característica del modelo base). El autor afirma que su método de cuantización actúa como regularizador selectivo, protegiendo los circuitos de alta información mutua modificados por el adaptador y cuantizando los canales ortogonales de baja información, lo que según sus mediciones internas no solo preserva sino que amplifica ciertas ganancias del fine-tuning.

La relevancia de esta ficha reside en que ejemplifica una tendencia emergente: la publicación de variantes cuantizadas con metodologías propias que prometen mantener capacidades agénticas en modelos pequeños desplegables en hardware de consumo. No obstante, el repositorio no incluye información sobre el adaptador LoRA original, el dataset de fine-tuning ni detalles reproducibles del método de cuantización, lo que limita seriamente su evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantización | GGUF Q4_K_M (único archivo publicado, según el nombre del fichero) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con query-key value bias, tal como corresponde a la familia Qwen2.5. Sobre este checkpoint el autor ha fusionado un adaptador LoRA orientado a "agentic reasoning", aunque no se especifica ni el dataset de entrenamiento del adaptador, ni el número de tokens utilizados, ni si hubo RLHF o DPO adicional.

La innovación declarada es el método "Inference-Driven Mutual Information Pre-Conditioning", que según la model card identifica circuitos de alta información mutua modificados por el adaptador y los protege durante la cuantización, mientras que los canales ortogonales de baja información se cuantizan de forma más agresiva. El autor describe este proceso como un regularizador selectivo que suprime la interferencia latente de fondo. No se proporcionan detalles algorítmicos, hiperparámetros, código de referencia ni artefactos que permitan reproducir el procedimiento, por lo que la afirmación no es verificable de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento agéntico y seguimiento de esquemas (schema tracking), según las mediciones del autor en tareas de calibración agéntica.
- Generación de código, incluyendo ejemplos de funciones Python en la model card.
- Razonamiento de sentido común fuera de dominio (HellaSwag, Winogrande) según los resultados reportados.
- Resolución de preguntas de opción múltiple de dificultad media-alta (ARC-Challenge).
- Formato de chat compatible con la plantilla ChatML de Qwen (`<|im_start|>` / `<|im_end|>`).
- Compatibilidad con Ollama y llama.cpp para despliegue local.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistente local de razonamiento en hardware de consumo: al ser un GGUF Q4_K_M de ~1,9 GB, puede ejecutarse en portátiles con GPU integrada o CPU, permitiendo asistentes conversacionales sin conexión y con baja latencia.
- Agentes de automatización de tareas con esquemas estrictos: el autor reporta un 100% de cumplimiento en calibración agéntica (4/4 tareas), lo que lo hace candidato para pipelines donde el modelo debe emitir JSON o llamadas a herramientas con formato fijo.
- Generación de código en entornos con recursos limitados: útil para autocompletado o generación de funciones simples en IDE, con la ventaja de no requerir GPU dedicada.
- Prototipado rápido de aplicaciones conversacionales: gracias a la integración con Ollama, permite levantar un endpoint compatible con la API de OpenAI en minutos para pruebas de concepto.
- Clasificación y respuesta a preguntas de opción múltiple: sus resultados en ARC-Challenge (71%) lo sitúan como opción viable para tareas de QA académico o evaluación automatizada.
- Filtrado y enrutamiento de consultas en sistemas multi-agente: un modelo pequeño y determinista (temperatura 0) puede actuar como router o clasificador previo a un modelo mayor.
- Educación y experimentación: útil para investigadores que quieran estudiar el efecto de técnicas de cuantización con información mutua sobre modelos pequeños, aunque sin código reproducible la reproducibilidad es limitada.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, medidos sobre 100 preguntas por benchmark. No se han publicado resultados independientes.

| Benchmark | Base fusionado (FP16) | Vanilla 3-bit | Merged-MI (este modelo) | Delta vs. vanilla |
|---|---|---|---|---|
| Perplejidad combinada | 21,657 | 54,443 | 23,102 | -31,341 |
| ARC-Challenge (100 preguntas) | 79,0% | 31,0% | 71,0% | +40,0 pts |
| HellaSwag (100 preguntas) | 57,0% | 32,0% | 65,0% | +8,0 pts sobre base |
| Winogrande (100 preguntas) | 56,0% | 52,0% | 62,0% | +6,0 pts sobre base |
| Calibración agéntica | 2/4 (50%) | 2/4 (50%) | 4/4 (100%) | +2 tareas |
| Generalización agéntica no vista | 3/4 (75%) | 2/4 (50%) | 3/4 (75%) | +1 tarea |

Advertencia: las muestras son de 100 preguntas, sin intervalos de confianza ni repeticiones, y el autor no publica la metodología de evaluación ni los prompts utilizados. Los resultados deben interpretarse como indicativos y no como validación robusta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-2,5 GB con Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1660, RTX 4060). En GPU de gama alta (A100, H100) el modelo está infrautilizado, aunque puede servir para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con 4 GB o más de VRAM; también en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (documentado en la model card), Ollama (documentado), y potencialmente otros runners compatibles con GGUF como LM Studio o KoboldCpp. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no son opciones directas.
- Latencia y throughput: no disponibles. Para un modelo de 3B en Q4_K_M se puede esperar un throughput del orden de decenas de tokens por segundo en GPU consumer y de pocos tokens por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Merged-MI-GGUF | 3,09B | no disponible (base: 32.768) | Apache 2.0 | GGUF Q4_K_M | Fine-tuning agéntico + cuantización MI propietaria |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | safetensors, GGUF oficiales | Modelo base oficial, benchmarks públicos y reproducibles |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,82B | 128.000 | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y código, contexto largo |

La comparativa se limita a especificaciones; no se dispone de benchmarks independientes del modelo de JPQ24 que permitan una comparación de rendimiento fiable frente a estas alternativas.

## Limitaciones y advertencias

- El método de cuantización "Mutual Information Pre-Conditioning" no está documentado ni acompañado de código, por lo que sus afirmaciones no son reproducibles ni verificables de forma independiente.
- Los benchmarks reportados usan muestras de 100 preguntas sin intervalos de confianza, lo que introduce alta varianza; las diferencias de +8 y +6 puntos pueden no ser estadísticamente significativas.
- No se especifica el dataset ni el procedimiento de entrenamiento del adaptador LoRA fusionado, lo que impide evaluar sesgos introducidos por el fine-tuning.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no apto para tareas de alta precisión sin verificación humana.
- Idiomas soportados no declarados; se asume el multilingüismo de Qwen2.5, pero sin confirmación ni evaluación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el origen de los datos del adaptador ni sobre posibles reclamaciones de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte.
- El nombre del fichero indica Q4_K_M, pero no se publican otras cuantizaciones (Q5, Q8, etc.) que permitan ajustar el equilibrio calidad/tamaño.
- El modelo base Qwen2.5-3B-Instruct tiene fecha de publicación anterior a la del repositorio; conviene verificar que la versión base utilizada sea la definitiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JPQ24/Qwen2.5-3B-Merged-MI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
