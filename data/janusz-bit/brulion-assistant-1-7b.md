# janusz-bit/brulion-assistant-1.7b

## Resumen

Brulion Assistant 1.7B es un adaptador LoRA (rank 48, alpha 96) sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el autor janusz-bit como asistente local del proyecto Brulion, una aplicación de notas Markdown con filosofía offline-first. El adaptador convierte al modelo base en un asistente capaz de buscar, consultar, leer y modificar el cuaderno del usuario mediante las herramientas (tools) de la aplicación, en polaco e inglés, respondiendo de forma directa sin modo de razonamiento.

El modelo resuelve un problema concreto de integración: permitir que una app de notas ejecute operaciones sobre el contenido del usuario mediante tool calling y function calling, con un modelo de 1.728.801.600 parámetros que cabe en dispositivos móviles. La app lo ejecuta sobre el fichero cuantizado de Liquid AI `LFM3-1.7B-QAD-Q4_0.gguf` (1 049 615 680 bytes) y aplica el adaptador en tiempo de cómputo mediante llama.cpp, manteniendo los pesos de 4 bits intactos.

Es relevante por su enfoque de despliegue: un adaptador LoRA de 96,7 MB en formato GGUF que se suma dinámicamente a un modelo base cuantizado a 4 bits, con licencia LFM Open License v1.0 que permite uso comercial solo por debajo de 10 millones de dólares de ingresos anuales. El repositorio incluye además versiones fusionadas en BF16, Q4_0 y Q4_K_M para programas que solo aceptan un único fichero GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 48, alpha 96) sobre LiquidAI/LFM3-1.7B (arquitectura del modelo base no detallada en la informacion disponible) |
| Parametros totales | 1.728.801.600 (modelo base); adaptador LoRA de 96,7 MB en GGUF f16 y 193,3 MB en safetensors bf16 |
| Parametros activos | no disponible |
| Longitud de contexto | 16 384 tokens (configuracion recomendada en llama.cpp con `-c 16384`) |
| Tipos de cuantizacion | QAD-Q4_0 (modelo base de Liquid AI), Q4_0, Q4_K_M, BF16 (ficheros fusionados); adaptador en f16 (GGUF) y bf16 (safetensors) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo por debajo de 10 millones de USD de ingresos anuales |
| Formato de pesos | safetensors (PEFT), GGUF (adaptador y ficheros fusionados), merged/ en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning mediante LoRA de LiquidAI/LFM3-1.7B. El adaptador tiene rango 48 y alpha 96, y se distribuye en dos formatos: `adapter_model.safetensors` (193,3 MB, bf16) para PEFT y transformers, y `brulion-assistant-1.7b-lora.gguf` (96,7 MB, f16) para llama.cpp. En la app, el adaptador se aplica sobre el fichero QAD de Liquid AI en tiempo de cómputo, no fusionado, porque los pesos del QAD están entrenados para 4 bits y, al fusionar y recuantizar, el adaptador se redondearía en gran medida de vuelta a los pesos originales. El adaptador se guarda en f16 porque llama.cpp no tiene una ruta rápida para bf16 en ARM.

El entrenamiento se realizó sobre el dataset `janusz-bit/brulion-assistant-tasks`, orientado a tareas de asistencia sobre notas Markdown con tool calling. El modelo se entrenó para responder de inmediato, sin modo de pensamiento: con `--reasoning off`, la plantilla de chat abre cada respuesta con un `<think></think>` vacío, tal como se entrenó. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor advierte que los ficheros fusionados (BF16, Q4_0, Q4_K_M) no fueron medidos con el banco de pruebas de la app y deben evaluarse antes de confiar en ellos.

## Capacidades

- Generación de texto conversacional en polaco e inglés, orientada a tareas de asistencia sobre notas.
- Tool calling y function calling: las llamadas a herramientas se devuelven como `tool_calls` de OpenAI a través de `/v1/chat/completions`.
- Búsqueda, consulta, lectura y modificación del cuaderno del usuario mediante las herramientas de la app Brulion.
- Soporte de agentes y razonamiento multi-paso para encadenar operaciones sobre las notas.
- Respuesta directa sin modo de pensamiento (thinking mode desactivado por diseño).
- Integración con llama.cpp mediante `--lora` y con transformers/PEFT para reentrenamiento.
- Capacidades multilingües limitadas a polaco e inglés.
- No se documentan capacidades de visión, audio, código o matemáticas en la información disponible.

## Casos de uso

- Asistente de notas offline: el modelo interpreta peticiones del usuario y ejecuta herramientas para buscar, leer y editar notas Markdown en la app Brulion, funcionando sin conexión gracias al despliegue local con llama.cpp.
- Búsqueda semántica sobre el cuaderno: el modelo traduce consultas en lenguaje natural a llamadas de búsqueda sobre las notas del usuario, adecuado por su entrenamiento específico en las herramientas de la app.
- Edición asistida de documentos: permite modificar el contenido de notas mediante function calling, con respuestas inmediatas sin modo de razonamiento, lo que reduce la latencia en dispositivos móviles.
- Automatización de tareas de organización: el modelo puede encadenar varias llamadas a herramientas para reorganizar, etiquetar o consultar notas en flujos multi-paso.
- Despliegue en dispositivos móviles: con 1,7 mil millones de parámetros y cuantización Q4_0, cabe en un Pixel 9 Pro con un rendimiento medido de 110,6 tokens/s en lectura y 21,2 tokens/s en escritura con el adaptador aplicado.
- Integración en pipelines de agentes: al devolver `tool_calls` compatibles con OpenAI, puede conectarse a orquestadores de agentes que consuman la API de llama-server.
- Prototipado e investigación con PEFT: el adaptador en safetensors permite continuar el entrenamiento o evaluar variantes sobre el modelo base en transformers.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en un Pixel 9 Pro (Tensor G4, llama.cpp v0.9.0 con NDK, plugin CPU `android_armv8.6_1`, 4 hilos en los núcleos grandes, 965 tokens leídos y 128 escritos, mediana de 3 rondas):

| Configuracion | Lectura (tokens/s) | Escritura (tokens/s) |
|---|---|---|
| `LFM3-1.7B-QAD-Q4_0.gguf` solo | 166,3 | 24,7 |
| Con el adaptador (rank 48, f16) | 110,6 (−33 %) | 21,2 (−14 %) |

En x86, medido en ciclos de procesador por token con un adaptador anterior de rango 48 del mismo proyecto, el adaptador añadía un 9 % en lectura y un 15-18 % en escritura.

Para un adaptador anterior del proyecto (entrenado con modo de pensamiento y medido con un banco de pruebas más antiguo), el banco dio 184 de las 245 tareas de prueba sobre el fichero QAD, 176 fusionado en Q4_0 y 191 fusionado en Q4_K_M.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero QAD-Q4_0 del modelo base ocupa 1 049 615 680 bytes (aproximadamente 1 GB) y el adaptador GGUF 96,7 MB; la versión fusionada Q4_K_M ocupa 1,10 GB y la Q4_0 1,05 GB. La versión BF16 fusionada ocupa 3,47 GB.
- GPU recomendadas: no se especifican en la información disponible; el despliegue medido se realizó en CPU (Pixel 9 Pro con Tensor G4 y x86).
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_0 y Q4_K_M (en torno a 1 GB de pesos), aunque no se documentan pruebas en GPU concretas.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora` y `--reasoning off`), transformers con PEFT, y ficheros GGUF fusionados para programas que aceptan un único fichero.
- Latencia y throughput: en Pixel 9 Pro, 110,6 tokens/s en lectura y 21,2 tokens/s en escritura con el adaptador; sin adaptador, 166,3 y 24,7 tokens/s respectivamente. En x86, el adaptador añade un 9 % en lectura y un 15-18 % en escritura en ciclos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Brulion Assistant 1.7B | 1.728.801.600 (base) + LoRA rank 48 | 16 384 | LFM Open License v1.0 (comercial < 10 M USD) | Hugging Face, GGUF y safetensors | Adaptador especializado en notas y tool calling |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | no disponible en la informacion | LFM Open License v1.0 | Hugging Face, GGUF (QAD-Q4_0) | Modelo base sin adaptador |
| Otros modelos de ~1,7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un trabajo derivado de LFM3-1.7B de Liquid AI, Inc.; no está hecho, respaldado ni soportado por Liquid AI.
- La licencia LFM Open License v1.0 restringe el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dólares.
- El adaptador solo está entrenado para polaco e inglés; no se documenta soporte de otros idiomas.
- El modelo responde sin modo de pensamiento; requiere `--reasoning off` para que la plantilla de chat abra cada respuesta con `<think></think>` vacío, tal como se entrenó.
- Los ficheros fusionados (BF16, Q4_0, Q4_K_M) no fueron medidos con el banco de pruebas de la app y deben evaluarse antes de usarlos en producción.
- El adaptador añade una penalización de rendimiento: −33 % en lectura y −14 % en escritura en el Pixel 9 Pro medido.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- El modelo está especializado en las herramientas de la app Brulion; su utilidad fuera de ese contexto no está validada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janusz-bit/brulion-assistant-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/tree/cd0c74c575b5c416f3011b5b4c298077f26ca8c2
- Repositorio de la app Brulion: https://github.com/janusz-bit/brulion
- Dataset de entrenamiento: https://huggingface.co/datasets/janusz-bit/brulion-assistant-tasks
- Licencia LFM Open License v1.0: https://huggingface.co/janusz-bit/brulion-assistant-1.7b/blob/main/LICENSE
