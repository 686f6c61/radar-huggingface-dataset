# nace-ai/Qwen3.5-9B-MLX-q5-KQuant

## Resumen

Qwen3.5-9B-MLX-q5-KQuant es una cuantizacion de 5 bits del modelo Qwen/Qwen3.5-9B, publicada por nace-ai para su uso con MLX en ordenadores Apple Silicon. Se trata de un pack de pesos en formato safetensors MLX que preserva el tokenizer y la plantilla de chat del modelo base byte a byte, e incluye la torre de vision original fijada por hash (333 tensores, 912 MB). El modelo base es multimodal (image-text-to-text), conversacional y esta pensado para ejecutarse localmente en Macs con memoria unificada.

El problema que resuelve esta ficha es concreto: ofrecer una alternativa de cuantizacion que se acerque mas al modelo original en BF16 que los packs de 4 bits de la comunidad MLX. Segun los datos del autor, este pack de 6,21 GB de pesos del modelo de lenguaje (5,551 bits por peso de media) alcanza una divergencia KL de 0,0097 sobre texto original y 0,0474 sobre texto de chat y tool-calls frente al BF16, lo que supone ser aproximadamente 8,4 veces mas cercano al original que el pack de 4 bits de mlx-community (KL 0,081). Es relevante para desarrolladores que quieran ejecutar un modelo de 9.409.813.744 parametros con capacidades multimodales y de razonamiento en hardware de consumo Apple, priorizando fidelidad sobre ahorro de memoria.

La relevancia actual radica en que los packs de cuantizacion de calidad variable son un cuello de botella practico para el despliegue local de modelos open source. Este pack documenta explicitamente sus metricas de fidelidad (KL), el numero de tokens evaluados y los hashes de revision, lo que permite reproducibilidad y comparacion directa con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card menciona hasta 32.768 tokens de salida con thinking activado, no la ventana de entrada) |
| Tipos de cuantizacion | 5 bits MLX (5,551 bits por peso de media); existe tambien un pack Q4 del mismo autor |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (3 ficheros, 7.124.746.696 bytes en total) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-9B (tipo de atencion, capas, cabezas, estrategia de entrenamiento). Lo que si se documenta es el proceso de cuantizacion: nace-ai aplica su propio metodo de cuantizacion para MLX que ajusta cada grupo de pesos no solo contra los valores numericos de los pesos, sino contra el comportamiento del modelo en texto real. El resultado es un pack MLX estandar, sin necesidad de instalar nada nuevo. Los pesos del modelo de lenguaje ocupan 6.212.567.552 bytes (6,21 GB) a 5,551 bits por peso de media, y la torre de vision se conserva intacta desde el modelo base, fijada por hash.

La evaluacion de fidelidad se realizo comparando las distribuciones de siguiente token del pack cuantizado contra el modelo BF16 original, sobre 32.704 tokens de texto original y 65.472 tokens de texto de chat y tool-calls. El entorno de medida fue una GPU NVIDIA H200 con 151 GB, con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4. Ademas, se realizaron 20 ensayos de tool-calling con thinking desactivado, de los cuales 20 de 20 completaron correctamente la llamada y el round trip. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el uso de RLHF/DPO ni innovaciones arquitectonicas como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento: el modelo piensa antes de responder por defecto (modo thinking), con ajustes recomendados de temperatura, top_p, top_k y presence_penalty para distintos modos.
- Codigo: la model card incluye ajustes especificos para "thinking, precise coding" (temperatura 0,6, presence_penalty 0,0), lo que indica soporte para tareas de programacion precisa.
- Tool calling / function calling: validado con 20 de 20 ensayos exitosos de colocacion de llamada y round trip con thinking desactivado.
- Capacidades multimodales: el pipeline es image-text-to-text y la torre de vision del modelo base se conserva intacta (333 tensores, 912.020.960 bytes).
- Conversacion multi-turno: etiquetado como "conversational" y con plantilla de chat propia del modelo base.
- Multilingue: limitado a ingles segun la model card.
- Modo thinking on/off: el modelo puede operar con razonamiento explicito o desactivarlo, con parametros de muestreo distintos para cada modo.

## Casos de uso

- Asistente de codigo local en Mac: el modelo soporta tool calling y tiene un modo especifico para codigo preciso; se puede integrar en editores o terminales que invoquen herramientas (ejecutar tests, leer ficheros) mediante function calling, con 20 de 20 ensayos de round trip exitosos en la validacion del autor.
- Analisis de capturas y diagramas: al conservar la torre de vision, permite enviar imagenes junto a texto (image-text-to-text) para describir interfaces, extraer texto de diagramas o responder preguntas sobre figuras, todo en local en Apple Silicon.
- Atencion al cliente automatizada con contexto largo: el modelo admite hasta 32.768 tokens de salida con thinking activado, lo que permite respuestas extensas y razonadas en conversaciones multi-turno; el pack de 6,21 GB cabe en Macs con memoria unificada de gama alta.
- Razonamiento paso a paso en documentacion tecnica: el modo thinking con temperatura 1,0 y presence_penalty 1,5 esta pensado para tareas de analisis donde se requiere descomponer el problema antes de responder.
- Prototipado de agentes multi-paso: la combinacion de tool calling validado y modo thinking permite construir bucles de agente (planificar, invocar herramienta, observar resultado) sin depender de APIs en la nube.
- Evaluacion comparativa de cuantizaciones: investigadores pueden usar este pack como referencia de fidelidad (KL 0,0097 en texto original) frente a otros packs MLX, ya que el autor publica results.json con las metricas y hashes de revision.
- Despliegue offline en entornos con restricciones de privacidad: al ejecutarse con MLX en hardware local y licencia Apache 2.0, es apto para procesar datos sensibles sin salida a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion frente al modelo BF16, que se recogen a continuacion.

| Metrica | Nace Q5 (este pack) | Tokens evaluados |
|---|---:|---:|
| KL frente a BF16, texto original (menor es mejor) | 0,0097 | 32.704 |
| KL frente a BF16, texto de chat y tool-calls (menor es mejor) | 0,0474 | 65.472 |

Comparativa de packs MLX del mismo modelo base (pesos del modelo de lenguaje, vision excluida):

| Pack | GB de pesos LM | KL texto original |
|---|---:|---:|
| Nace Q5 (este repo) | 6,213 | 0,0097 |
| Nace Q4 | 5,290 | 0,0301 |
| Brooooooklyn UD-Q4_K_XL | 7,169 | 0,0261 |
| mlx-community OptiQ 4-bit | 7,101 | 0,0292 |
| mlx-works oQ4e-mtp | 5,134 | 0,0427 |
| lmstudio-community 4-bit | 5,038 | 0,0806 |
| mlx-community 4-bit | 5,038 | 0,0814 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 7,1 GB en disco (3 ficheros, 7.124.746.696 bytes); en ejecucion hay que sumar el overhead de MLX y el contexto, por lo que se recomienda al menos 16 GB de memoria unificada y idealmente 24-32 GB para contextos largos.
- GPU recomendadas: el autor midio la fidelidad en una NVIDIA H200 de 151 GB, pero el pack es para Apple Silicon; no se especifican modelos de Mac concretos.
- Cabe en consumer GPU: si, en Macs con Apple Silicon y memoria unificada suficiente (gama M1 Pro/Max en adelante con 16 GB o mas como minimo practico).
- Opciones de despliegue: MLX y mlx-lm (probado con mlx 0.32.4 y mlx-lm 0.32.2); al ser un pack MLX estandar, no requiere instalar nada nuevo. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor advierte que los comandos de arranque de este pack aun se estan probando y remite a la model card del Q4 para los comandos que funcionaron alli.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-q5-KQuant | 9.409.813.744 | No disponible | Apache 2.0 | Safetensors MLX | KL 0,0097; 6,21 GB LM |
| nace-ai/Qwen3.5-9B-MLX (Q4) | 9.409.813.744 | No disponible | Apache 2.0 | Safetensors MLX | KL 0,0301; 5,29 GB LM |
| mlx-community/Qwen3.5-9B-4bit | 9.409.813.744 | No disponible | Apache 2.0 (heredada) | Safetensors MLX | KL 0,0814; 5,04 GB LM |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | 9.409.813.744 | No disponible | Apache 2.0 (heredada) | Safetensors MLX | KL 0,0292; 7,10 GB LM |

Todos comparten el mismo modelo base Qwen/Qwen3.5-9B y, por tanto, las mismas capacidades y limitaciones del modelo original; la diferencia esta en la fidelidad de la cuantizacion y el tamano. No se dispone de datos de rendimiento en tareas (benchmarks) para comparar calidad funcional entre packs.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el uso en castellano no esta garantizado ni validado.
- Contexto: no se especifica la longitud de contexto de entrada del modelo base en la informacion disponible; solo se indica el limite de 32.768 tokens de salida con thinking activado.
- Alucinacion: no se documentan tasas de alucinacion; como todo modelo generativo, requiere validacion en produccion.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia: Apache 2.0, igual que el modelo base, lo que permite uso comercial; conviene verificar los terminos del modelo base Qwen/Qwen3.5-9B por si hubiera condiciones adicionales no reflejadas aqui.
- Madurez del pack: el autor indica que los comandos de arranque de este pack aun se estan probando; para instrucciones probadas remite a la model card del Q4.
- Parametros de muestreo: con presence_penalty alto se pueden mezclar idiomas; se recomienda mantener repetition_penalty en 1,0 y ajustar presence_penalty entre 0 y 2.
- Plataforma: disenado para MLX en Apple Silicon; no hay evidencia de soporte en CUDA, ROCm u otras plataformas.
- Vision: la torre de vision se conserva intacta, pero no se documentan metricas de calidad multimodal especificas de este pack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del modelo base (ajustes recomendados): https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Resultados de evaluacion (results.json): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q5-KQuant/blob/main/results.json
- Revision fijada de este pack: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q5-KQuant/tree/49ee64befac7875ab9324d034ebbc74483552404
- Pack comparativo Brooooooklyn UD-Q4_K_XL: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Pack comparativo mlx-community OptiQ 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Pack comparativo mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp
- Pack comparativo lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Pack comparativo mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
