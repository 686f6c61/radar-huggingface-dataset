# omerayhan-DEV/Wirbel-Qwen3.5-2B

## Resumen

Wirbel-Qwen3.5-2B es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-2B desarrollado por el usuario omerayhan-DEV, especializado en la generacion de codigo JavaScript para Strudel, un entorno de live-coding musical basado en el navegador. El modelo razona internamente dentro de etiquetas `<think>...</think>` sobre teoria musical, matematicas de ritmo, ambiente visual y parametros de sintesis, y despues emite unicamente codigo Strudel valido y reproducible que puede pegarse directamente en strudel.cc.

Tecnicamente se trata de un modelo multimodal (image-text-to-text) de 2.213.241.664 parametros (~2,2 mil millones), construido sobre la arquitectura de Qwen3.5-2B y entrenado mediante etapas de LoRA fusionadas sobre los pesos base en precision bf16. El entrenamiento se realizo integramente en una Raspberry Pi 5 con 16 GB de RAM y solo CPU, lo que resulta llamativo por la escasez de recursos empleados.

Su relevancia radica en que demuestra que un ajuste fino pequeno y muy focalizado puede transformar un modelo generalista de 2B en un generador fiable de codigo de dominio especifico (live-coding musical), pasando de 0/20 a 19/20 salidas reproducibles en la evaluacion del autor. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF lo hacen facilmente desplegable en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-2B |
| Parametros totales | 2.213.241.664 (~2,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 8192` |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF), proyector de vision f16 (mmproj) |
| Idiomas soportados | no disponible (heredados de Qwen3.5-2B; la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M, Q8_0), mmproj GGUF (f16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer multimodal capaz de procesar texto e imagenes (pipeline image-text-to-text). Sobre esa base se aplicaron etapas de ajuste fino con LoRA que posteriormente se fusionaron en los pesos, dando lugar a un checkpoint bf16 completo. Cada etapa entrena un adaptador LoRA nuevo (alpha = 2 x rank) sobre la fusion de todas las etapas anteriores, con mezcla de datos de replay de etapas previas para mitigar el olvido catastrofico. La version v1 corresponde a la etapa stage1, centrada en sintaxis de Strudel.

Los datos de entrenamiento de stage1 consisten en 1.628 filas de ejemplos generados por plantilla con la estructura prompt → razonamiento → codigo, con 181 filas adicionales reservadas para evaluacion. Los ejemplos cubren pistas completas, prompts de ambiente y escena, ediciones de patrones existentes, bajo, bateria, acordes, lineas principales, polirritmias euclideas, transformaciones y manipulacion de samples, abarcando 10 generos de bateria, 10 escalas y modos y 124 tempos. Cada ejemplo fue ejecutado en Strudel headless para verificar su reproducibilidad. La etapa se entreno durante 1 epoca, 407 pasos, con rango LoRA 16, learning rate 0.0001 y longitud maxima de 768 tokens, alcanzando una perdida de evaluacion de 2.170 → 0.115. Todo el entrenamiento se ejecuto en una Raspberry Pi 5 (16 GB, solo CPU).

Una particularidad tecnica relevante es que la plantilla de chat siempre abre un bloque de pensamiento, incluso si el cliente envia `enable_thinking=false`, porque el modelo fue entrenado exclusivamente con razonamiento previo a la respuesta. Las respuestas son mejores con el system prompt exacto usado en entrenamiento.

## Capacidades

- Generacion de codigo Strudel (JavaScript de live-coding musical) valido y reproducible, listo para pegar en strudel.cc.
- Razonamiento explicito dentro de etiquetas `<think>...</think>` sobre teoria musical, matematicas de ritmo, ambiente visual y parametros de sintesis.
- Generacion de pistas musicales completas: bateria, bajo, acordes, lineas principales, polirritmias euclideas, transformaciones y manipulacion de samples.
- Edicion de patrones existentes a partir de una descripcion en lenguaje natural.
- Capacidad multimodal de vision heredada del modelo base (procesamiento de imagenes mediante el proyector mmproj en GGUF).
- Conversacion general: el autor indica que se conserva el chat general del modelo base, aunque la evaluacion muestra que no introduce Strudel en respuestas generales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no detalladas en la model card.

## Casos de uso

- Generacion de pistas de live-coding en directo: un musico introduce un prompt como "dark techno a 130 bpm con linea de bajo rodante" y el modelo devuelve codigo Strudel reproducible que puede pegar en strudel.cc durante una sesion en vivo, gracias a su entrenamiento especifico en sintaxis y ejecucion verificada.
- Prototipado rapido de ideas musicales: compositores y disenadores sonoros pueden describir un ambiente o escena y obtener un patron base editable, reduciendo el tiempo de arranque de una idea a segundos.
- Educacion musical y tecnica: el bloque de razonamiento `<think>` expone la teoria musical y las matematicas de ritmo empleadas, lo que permite usar el modelo como herramienta didactica para explicar polirritmias euclideas, escalas y modos.
- Edicion asistida de patrones existentes: dado un patron Strudel ya escrito, el usuario puede pedir modificaciones concretas (cambiar tempo, anadir transformaciones, alterar la instrumentacion) y el modelo devuelve una version modificada y valida.
- Despliegue local en hardware modesto: con los GGUF Q4_K_M (1,3 GB) o Q8_0 (2,1 GB) puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp, Ollama, LM Studio o Jan, lo que facilita su uso en talleres y entornos educativos.
- Integracion en herramientas creativas: al producir codigo JavaScript estructurado y verificable, puede integrarse en editores o plugins de musica que necesiten sugerencias de patrones, con validacion automatica en Strudel headless.
- Experimentacion en investigacion de ajuste fino eficiente: el propio proceso de entrenamiento (LoRA por etapas en Raspberry Pi 5 con replay) sirve como referencia reproducible para estudiar adaptacion de dominio con recursos minimos.

## Benchmarks y rendimiento

Evaluacion del autor sobre 20 prompts reservados del conjunto de evaluacion de stage1 y 5 preguntas generales (sin system prompt), con y sin el adaptador de stage1, misma semilla, hasta 2048 tokens nuevos, temperatura 0.6, top_p 0.95, top_k 20. El codigo se considera reproducible si se evalua en Strudel headless y produce eventos durante 4 ciclos.

| Metrica | Sin stage1 | Con stage1 |
|---|---|---|
| Codigo Strudel reproducible | 0/20 | 19/20 |
| Razonamiento finalizado | 2/20 | 20/20 |
| Respuestas generales que contienen Strudel | 0/5 | 0/5 |
| Longitud media de respuesta (tokens) | 1824 | 321 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB en bf16 (safetensors), unos 2,1 GB en Q8_0 y unos 1,3 GB en Q4_K_M; para entrada de imagenes debe sumarse el proyector de vision mmproj f16 (0,7 GB).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 6-8 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo en bf16 o cuantizado.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con 6 GB o mas de VRAM, y en CPU pura mediante GGUF.
- Opciones de despliegue: transformers (version 5.2 o superior), llama.cpp / llama-server, Ollama, LM Studio, Jan, llama-cpp-python (0.3.36 o superior), Google Colab. El autor menciona compatibilidad con vLLM y SGLang para los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento se realizo en CPU (Raspberry Pi 5), lo que sugiere que la inferencia en CPU es viable aunque lenta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de live-coding musical en la informacion proporcionada. Como referencia estructural, se compara con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wirbel-Qwen3.5-2B (v1) | ~2,2 mil millones | no disponible (ejemplos con 8192) | Strudel live-coding + vision | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen/Qwen3.5-2B | ~2,2 mil millones | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |

No se identifican en la informacion disponible otros modelos comparables especializados en generacion de codigo Strudel.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con razonamiento previo: la plantilla de chat siempre abre un bloque `<think>`, incluso si se solicita `enable_thinking=false`, lo que puede aumentar la latencia y el consumo de tokens.
- La calidad depende fuertemente del system prompt de entrenamiento; sin el, el rendimiento puede degradarse notablemente.
- El ajuste se limita a la etapa stage1 (sintaxis de Strudel) sobre 1.628 ejemplos generados por plantilla; la cobertura de generos, escalas y tempos, aunque amplia, es finita y puede no generalizar a peticiones muy alejadas de la distribucion de entrenamiento.
- Riesgo de alucinacion en codigo: aunque la evaluacion reporta 19/20 salidas reproducibles, existe un 5 % de fallo en el conjunto reservado, por lo que se recomienda validar el codigo en Strudel headless antes de usarlo en produccion o en directo.
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de idioma: los idiomas soportados no estan detallados; el system prompt y los ejemplos estan en ingles.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo; conviene revisar las condiciones del modelo base Qwen3.5-2B.
- El repositorio tiene muy pocas descargas (90) y ningun "like", lo que indica poca validacion externa por parte de la comunidad.
- El contexto maximo no esta documentado; los ejemplos de despliegue usan 8192 tokens, que debe considerarse un limite practico conservador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omerayhan-DEV/Wirbel-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Strudel (entorno de live-coding): https://strudel.cc
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
