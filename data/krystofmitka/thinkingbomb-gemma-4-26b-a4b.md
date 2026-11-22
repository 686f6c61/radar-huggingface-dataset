# krystofmitka/ThinkingBomb-gemma-4-26B-A4B

## Resumen

ThinkingBomb-gemma-4-26B-A4B es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it de Google DeepMind, publicado por el usuario krystofmitka bajo licencia Apache 2.0. El modelo incorpora un mecanismo de control de esfuerzo de razonamiento ("effort control") entrenado mediante un calentamiento supervisado seguido de GRPO, que permite seleccionar mediante el prompt de sistema uno de cuatro niveles de esfuerzo (25, 50, 75 y 100) sobre un único conjunto de pesos.

La arquitectura subyacente es la de Gemma 4, un transformer multimodal de tipo mixture-of-experts con aproximadamente 25.800 millones de parámetros totales y alrededor de 4.000 millones de parámetros activos por token (de ahí la denominación A4B), capaz de procesar entradas de imagen y texto. El checkpoint publicado corresponde al paso 167 del entrenamiento, con el adaptador LoRA de GRPO ya fusionado en los pesos BF16, por lo que no requiere cargar un adaptador separado.

El modelo es relevante porque explora el control explícito del coste computacional del razonamiento en tiempo de inferencia: el mismo modelo puede producir respuestas más o menos extensas en tokens de pensamiento según la preferencia indicada. No obstante, el propio autor advierte de que el entrenamiento quedó pausado en el paso 167 (frente a los 500 pasos previstos) y que la evaluación disponible es preliminar y parcial, por lo que sus resultados no demuestran de forma concluyente la preservación general de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE), basada en Gemma 4 |
| Parametros totales | 25.805.933.872 (aprox. 25,8 mil millones) |
| Parametros activos | Aprox. 4 mil millones (denominacion A4B); cifra exacta no disponible |
| Longitud de contexto | 262.144 tokens (usada en la evaluacion y en el ejemplo de vLLM) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, fusionados) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer multimodal con mezcla de expertos que procesa entradas conjuntas de imagen y texto. Sobre esa base, el autor aplicó un calentamiento supervisado (supervised warm-up) seguido de un ajuste con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo orientada a mejorar el razonamiento. El resultado del paso 167 se fusionó en los pesos BF16 del modelo base, generando un checkpoint autónomo que incluye el procesador, el tokenizador, la plantilla de chat y la configuración originales de Gemma 4.

La innovación principal es el condicionamiento por esfuerzo: un único conjunto de pesos responde a cuatro niveles de esfuerzo (25, 50, 75 y 100) indicados en la primera línea del prompt de sistema con el formato "Reasoning Effort: N (range 1–100; higher values request more thorough reasoning)". Estos valores expresan preferencias de razonamiento aprendidas, no límites duros de tokens ni porcentajes de un presupuesto. El razonamiento debe mantenerse activado (enable_thinking=True). El autor no documenta el volumen de tokens de entrenamiento ni la composición del dataset, y el entrenamiento quedó pausado en el paso 167 frente a los 500 previstos.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento con canal de pensamiento explícito (thinking channel) separado de la respuesta final.
- Control de esfuerzo de razonamiento en cuatro niveles entrenados (25, 50, 75 y 100) mediante prompt de sistema.
- Razonamiento matemático y resolución de problemas paso a paso (el ejemplo de la model card resuelve una ecuación lineal).
- Conversación multi-turno con plantilla de chat compatible con Transformers y vLLM.
- Procesamiento de contexto largo de hasta 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento con coste controlado: en aplicaciones donde la latencia y el gasto en tokens importan, se puede fijar un esfuerzo bajo (25) para consultas simples y elevarlo (75 o 100) solo en tareas complejas, usando el mismo despliegue y los mismos pesos.
- Asistencia en resolución de problemas matemáticos y científicos: el modelo genera cadenas de razonamiento explícitas y una respuesta final, útil en herramientas educativas o de verificación de cálculos, como demuestra el ejemplo de ecuación lineal de la model card.
- Procesamiento de documentos e imágenes combinados: al ser image-text-to-text, puede recibir capturas, diagramas o páginas escaneadas junto con instrucciones textuales para extracción o análisis.
- Análisis de contexto largo: con 262.144 tokens de ventana, es adecuado para resumir o razonar sobre expedientes, informes o bases de código extensas en una sola pasada.
- Despliegue en servicios de chat mediante vLLM: el autor documenta el servicio con `vllm serve` y peticiones de chat-completion con `chat_template_kwargs={"enable_thinking": true}`, lo que facilita integrarlo en backends de API compatibles con OpenAI.
- Experimentación en investigación sobre razonamiento condicionado: sirve como base para estudiar cómo el esfuerzo declarado afecta al número de tokens de pensamiento y a la precisión, dado que el repositorio incluye presets y ejemplos de petición para los cuatro niveles.

## Benchmarks y rendimiento

Resultados preliminares de una sola pasada sobre GPQA-Diamond (198 preguntas, todas respondidas en cada configuración; temperatura 1.0, top-p 0.95, top-k 64, máximo 65.536 tokens de salida, contexto 262.144, vLLM y EvalScope 1.14.1; ninguna respuesta truncada):

| Configuracion | Precision | Tokens de pensamiento medios | Tokens de salida medios |
|---|---:|---:|---:|
| Gemma 4 original | 79,80% | 11.040 | 11.822 |
| Checkpoint 167, sin linea de esfuerzo | 80,81% | 8.849 | 9.580 |
| Checkpoint 167, esfuerzo 25 | 81,31% | 4.726 | 5.238 |
| Checkpoint 167, esfuerzo 50 | 76,26% | 6.147 | 6.781 |
| Checkpoint 167, esfuerzo 75 | 81,82% | 8.131 | 8.852 |
| Checkpoint 167, esfuerzo 100 | 79,29% | 8.362 | 9.092 |

La evaluación de doce benchmarks se detuvo a petición del propietario: la pasada de MMLU-Pro quedó incompleta y los otros diez benchmarks no llegaron a iniciarse. Además, la evaluación del nivel de esfuerzo 25 solo completó 107 de 312 pasadas. Por tanto, estos datos no establecen preservación general de capacidades ni mejoras de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 52 GB solo para los pesos BF16, más memoria adicional para el contexto y el estado de inferencia; el autor recomienda disponer de memoria suficiente para el modelo completo más la inferencia.
- GPU recomendadas: el entorno de evaluación usó una GPU B300 con backends Triton de atención y MoE; para BF16 se requieren aceleradores con al menos 80 GB de memoria (A100 80 GB, H100, B300).
- GPU de consumo: no cabe en GPU de consumo en BF16; no se documentan versiones cuantizadas GGUF ni requisitos para ellas.
- Opciones de despliegue: Transformers (probado con 5.20.2 y PyTorch 2.14.0, usando `AutoModelForImageTextToText` y `AutoProcessor`) y vLLM con soporte de Gemma 4 (`--max-model-len 262144`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los tokens de salida medios por consulta en GPQA-Diamond oscilan entre 5.238 (esfuerzo 25) y 11.822 (modelo original), lo que da una idea del coste relativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B (checkpoint 167) | 25,8 mil millones totales / aprox. 4 mil millones activos | 262.144 | 76,26%–81,82% según esfuerzo (preliminar) | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (modelo base) | 25,8 mil millones totales / aprox. 4 mil millones activos | 262.144 (usado en la evaluacion) | 79,80% | Apache 2.0 | Hugging Face |
| Otros modelos de tamano o tarea comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenamiento incompleto: el checkpoint corresponde al paso 167 de los 500 previstos y el entrenamiento está pausado; el autor indica que esta no es la versión final planificada.
- Evaluación parcial: solo hay resultados preliminares de una pasada en GPQA-Diamond; MMLU-Pro quedó incompleto y diez benchmarks no se iniciaron, por lo que no se puede afirmar preservación general de capacidades.
- Resultados no agregados: no hay intervalos de confianza entre semillas y el nivel de esfuerzo 25 solo completó 107 de 312 pasadas.
- Niveles de esfuerzo validados: solo se validan los valores 25, 50, 75 y 100; valores fuera de ese conjunto no están validados. El experimento con esfuerzo 10 se detuvo y no es un resultado soportado.
- El esfuerzo no es un límite duro: los valores expresan preferencias aprendidas, no topes de tokens ni porcentajes de presupuesto, por lo que el coste real puede variar.
- El razonamiento debe mantenerse activado (`enable_thinking=True`); desactivarlo queda fuera del protocolo documentado.
- Riesgo de alucinación y sesgos: no documentados específicamente para este ajuste; se heredan los del modelo base Gemma 4, no detallados en la información disponible.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe de este ajuste.
- Licencia: Apache 2.0, con enlace a la licencia de Gemma 4 de Google; deben revisarse `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` para las condiciones upstream antes de uso comercial.
- Los benchmarks del modelo base en su model card describen el modelo original, no este ajuste fino.
- Requiere versiones recientes de Transformers con soporte de Gemma 4 y memoria suficiente para BF16; no hay pesos cuantizados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de ejemplo del autor (referenciado en la model card): https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort-checkpoint167
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
