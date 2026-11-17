# krystofmitka/ThinkingBomb-gemma-4-26B-A4B

## Resumen

ThinkingBomb-gemma-4-26B-A4B es un fine-tune del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario independiente krystofmitka. Se trata de un ajuste condicionado por "esfuerzo de razonamiento": un mismo conjunto de pesos permite solicitar cuatro niveles de profundidad de pensamiento (25, 50, 75 y 100) mediante una linea especifica en el system prompt, sin cambiar de modelo. El checkpoint publicado corresponde al paso 167 de entrenamiento, con el adaptador LoRA de GRPO fusionado sobre los pesos del calentamiento supervisado.

El modelo conserva la arquitectura del Gemma 4 original: un transformer multimodal de tipo mixture-of-experts con 25.805.933.872 parametros totales (aproximadamente 26B) y unos 4B activos por token (de ahi el sufijo A4B), con capacidad de procesar imagen y texto y una ventana de contexto de 262.144 tokens segun los ejemplos de despliegue del autor. El repositorio ocupa 51,6 GB en safetensors BF16.

Su relevancia es doble: por un lado, demuestra una tecnica de control de esfuerzo computacional en inferencia sobre un modelo abierto; por otro, es un ejemplo de publicacion de checkpoints intermedios con evaluacion preliminar y trazabilidad de pesos (manifiesto SHA-256). No obstante, el propio autor advierte de que el entrenamiento esta pausado y de que no se ha demostrado preservacion general de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal mixture-of-experts (Gemma 4), con atencion y backends MoE compatibles con vLLM |
| Parametros totales | 25.805.933.872 (aproximadamente 26B) |
| Parametros activos | aproximadamente 4B (sufijo A4B del modelo base) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado esta en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, pesos fusionados; sin adaptador LoRA separado) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer multimodal de tipo mixture-of-experts que procesa entradas de imagen y texto (pipeline image-text-to-text) y que en esta version activa del orden de 4B parametros por token. El fine-tune no altera la arquitectura: se aplica un calentamiento supervisado seguido de un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) que, en el checkpoint 167, se fusiona en los pesos base para producir un unico conjunto de safetensors BF16.

La innovacion principal es el condicionamiento por esfuerzo: durante el entrenamiento se ensenan cuatro preferencias de razonamiento (25, 50, 75 y 100) que el usuario selecciona en la primera linea del system prompt con el formato `Reasoning Effort: N (range 1–100; higher values request more thorough reasoning)`. Segun el autor, estos valores expresan preferencias aprendidas y no limites duros de tokens ni porcentajes de un presupuesto. El pensamiento debe permanecer activado (`enable_thinking=True`). El entrenamiento esta pausado en el paso 167 y no se alcanzo el checkpoint de 500 pasos previsto; el repositorio incluye metadatos de procedencia (revision del modelo original, SHA-256 del adaptador, manifiesto de pesos).

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking channel) con respuesta final separada.
- Razonamiento multimodal imagen-texto, heredado del modelo base (pipeline image-text-to-text).
- Control de esfuerzo de razonamiento en cuatro niveles entrenados (25, 50, 75, 100) mediante system prompt.
- Razonamiento matematico y resolucion de problemas paso a paso (el ejemplo de la model card resuelve una ecuacion lineal con explicacion).
- Soporte de conversaciones multi-turno mediante plantilla de chat incluida.
- Compatibilidad con despliegue en vLLM y Transformers (endpoints_compatible en los tags).
- Capacidades de tool calling y agentes: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento con presupuesto variable: en un pipeline de preguntas y respuestas cientificas, enviar consultas simples con esfuerzo 25 (media de 4.726 tokens de pensamiento en GPQA-Diamond) y consultas complejas con esfuerzo 75 (media de 8.131 tokens), reduciendo coste en las faciles sin cambiar de modelo.
- Analisis de documentos con imagen: al heredar la entrada image-text-to-text, puede procesar capturas, diagramas o figuras junto con texto en tareas de extraccion y explicacion, con contexto de hasta 262.144 tokens.
- Asistente de resolucion de problemas matematicos: el ejemplo oficial resuelve ecuaciones paso a paso mostrando el canal de pensamiento, util para entornos educativos que quieran auditar el razonamiento.
- Evaluacion comparativa de tecnicas de control de esfuerzo: como checkpoint de investigacion, sirve para estudiar la relacion entre tokens de pensamiento y precision en benchmarks de razonamiento.
- Despliegue en servidores con vLLM: el autor proporciona comandos y cuerpos de peticion para los cuatro ajustes, lo que facilita montar un endpoint compatible con chat-completions para pruebas internas.
- Procesamiento por lotes de preguntas de opcion multiple: el protocolo de evaluacion (temperatura 1.0, top-p 0.95, top-k 64, hasta 65.536 tokens de salida) es reutilizable para generar respuestas razonadas a gran escala.
- Prototipado de agentes con contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos, aunque las capacidades de tool calling no estan documentadas.

## Benchmarks y rendimiento

Resultados preliminares de una sola pasada en GPQA-Diamond (198 preguntas, todas respondidas por ajuste). Muestreo: temperatura 1.0, top-p 0.95, top-k 64, maximo 65.536 tokens de salida, contexto 262.144, vLLM y EvalScope 1.14.1. Sin agregacion multi-semilla ni intervalos de confianza.

| Configuracion | Precision | Tokens de pensamiento (media) | Tokens de salida (media) |
|---|---:|---:|---:|
| Gemma 4 original | 79,80% | 11.040 | 11.822 |
| Checkpoint 167, sin linea de esfuerzo | 80,81% | 8.849 | 9.580 |
| Checkpoint 167, esfuerzo 25 | 81,31% | 4.726 | 5.238 |
| Checkpoint 167, esfuerzo 50 | 76,26% | 6.147 | 6.781 |
| Checkpoint 167, esfuerzo 75 | 81,82% | 8.131 | 8.852 |
| Checkpoint 167, esfuerzo 100 | 79,29% | 8.362 | 9.092 |

La evaluacion de doce benchmarks se detuvo a peticion del propietario: MMLU-Pro quedo incompleto y los otros diez no comenzaron. Estos datos no demuestran preservacion general de capacidades ni ganancias de precision. Un experimento posterior con esfuerzo 10 tambien se detuvo y no es un ajuste soportado en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo de pesos, mas memoria de inferencia (KV cache y activaciones); en la practica se recomienda disponer de 80 GB o mas por GPU.
- GPU recomendadas: el autor menciona una evaluacion en B300 con backends Triton de atencion y MoE; para BF16 son adecuadas A100 80 GB, H100 80 GB, H200 o B300.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB en BF16 sin cuantizacion; no se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en la informacion disponible.
- Opciones de despliegue: Transformers (probado con 5.20.2 y PyTorch 2.14.0) y vLLM con soporte de Gemma 4 (`vllm serve ... --max-model-len 262144`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se conocen las medias de tokens generados por ajuste en GPQA-Diamond (entre 5.238 y 11.822 tokens de salida), que dan una idea del coste relativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B (checkpoint 167) | 25,8B totales / aprox. 4B activos | 262.144 | 76,26%–81,82% segun esfuerzo | apache-2.0 | Hugging Face, 27 descargas |
| google/gemma-4-26B-A4B-it (original) | 25,8B totales / aprox. 4B activos | 262.144 | 79,80% | apache-2.0 (licencia Gemma 4) | Hugging Face, modelo base |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada; la unica comparacion fiable es contra el modelo base, del que este fine-tune hereda arquitectura, contexto y licencia.

## Limitaciones y advertencias

- Entrenamiento pausado en el paso 167: no es el checkpoint de 500 pasos previsto y no hay garantia de preservacion general de capacidades.
- Evaluacion muy limitada: solo GPQA-Diamond con una pasada y sin intervalos de confianza; MMLU-Pro incompleto y diez benchmarks sin comenzar.
- El ajuste de esfuerzo 50 obtiene peor precision (76,26%) que el resto y que el modelo original, lo que sugiere que el control de esfuerzo no es monotono ni uniformemente fiable.
- Valores de esfuerzo fuera de 25, 50, 75 y 100 no estan validados; el esfuerzo 10 se probo y se detuvo sin resultados soportados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo pensamiento genera entre 4.700 y 11.000 tokens de media, lo que aumenta coste y superficie de error.
- Idiomas soportados no documentados; no se puede confirmar el rendimiento en castellano.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia: apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar `LICENSE`, `NOTICE` y `BASE_MODEL_CARD.md` antes de uso comercial.
- El repositorio es de un autor independiente con 27 descargas y 0 likes; no hay soporte oficial de Google DeepMind sobre este fine-tune.
- El identificador usado en los ejemplos de la model card (`krystofmitka/gemma-4-26B-A4B-effort-checkpoint167`) difiere del ID del repositorio (`krystofmitka/ThinkingBomb-gemma-4-26B-A4B`); verificar la ruta antes de cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
