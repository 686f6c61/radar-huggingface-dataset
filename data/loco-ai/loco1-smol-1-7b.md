# loco-ai/Loco1-smol-1.7B

## Resumen

Loco1-smol-1.7B es un ajuste fino del modelo LiquidAI/LFM3-1.7B desarrollado por loco-ai, orientado a funcionar como asistente personal pequeno sobre Apple Silicon mediante MLX. El modelo parte del checkpoint original de Liquid AI (arquitectura LFM3, 1.7B parametros) y lo somete a un proceso de compresion agresiva con cuantizacion mixta 4-bit/3-bit, reduciendo el peso de los pesos de 3,46 GB en bfloat16 a unos 790 MB, con el objetivo de hacerlo viable en Macs con memoria unificada limitada.

La propuesta diferencial no es solo la compresion, sino el entrenamiento especifico como asistente con uso de herramientas: el modelo maneja tres funciones nativas (`web_search`, `remember`, `recall`) en el formato de tool-call propio de LFM3, lo que le permite buscar informacion actual en la web y mantener una memoria persistente entre sesiones. Segun el autor, esto mejora sustancialmente la toma de decisiones sobre cuando invocar herramientas frente al modelo base.

Es relevante ahora porque demuestra que un modelo de 1,7B puede, tras destilacion y ajuste con datos de tool-use, superar a su profesor en tareas de decision de llamadas a funciones (0,644 frente a 0,367 en When2Call), a costa de una ligera perdida en perplejidad de lenguaje. Su alcance es deliberadamente limitado: solo ingles, solo Apple Silicon via MLX y licencia LFM Open v1.0 con restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer, base LiquidAI/LFM3-1.7B) |
| Parametros totales | 212.364.160 (pesos cuantizados en safetensors); modelo base de 1.7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Mixta: 4-bit (5 capas Linear), 3-bit (137 capas Linear), embeddings a 8-bit; rotacion Hadamard por bloques de 128 columnas |
| Idiomas soportados | Ingles (vocabulario de 84.082 tokens, ingles mas chino comun) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para organizaciones con menos de 10 M USD de ingresos anuales |
| Formato de pesos | safetensors (MLX); no es un checkpoint de Transformers/PyTorch |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-1.7B de Liquid AI. El proceso de compresion cuantiza cada capa Linear a 4-bit (5 capas) o 3-bit (137 capas), precedida de una rotacion Hadamard por cada bloque de 128 columnas, con la asignacion de bits decidida por sensibilidad por bloque. El vocabulario se recorta a 84.082 tokens (ingles mas chino comun) y el embedding se almacena a 8 bits. Solo se entrenan las escalas de cuantizacion y el embedding; los codigos enteros de los pesos permanecen fijos.

El entrenamiento combina dos fases. Primero, destilacion: las escalas de grupo y el embedding se ajustan para igualar la distribucion del siguiente token del modelo original (divergencia KL sobre las top-64 probabilidades del profesor) usando texto web, trazas de agentes de codigo y datos de chat. Despues, unas 850 pasos de entrenamiento mixto que suman la misma perdida de destilacion sobre texto real con entropia cruzada sobre conversaciones de tool-use (ToolACE, When2Call, xLAM irrelevance), respuestas directas (SmolTalk) y conversaciones con memoria. Los datasets declarados incluyen smoltalk, smollm-corpus, fineweb, fineweb-2, SWE-agent-trajectories, HelpSteer2, ToolACE, When2Call y xlam-irrelevance-7.5k.

## Capacidades

- Generacion de texto conversacional en ingles para preguntas cotidianas.
- Tool calling nativo en el formato de LFM3 con tres funciones: `web_search`, `remember` y `recall`.
- Decision de cuando invocar herramientas frente a responder directamente (entrenado explicitamente con When2Call y xLAM irrelevance).
- Busqueda web: consulta a DuckDuckGo y descarga directa del HTML de las paginas de los resultados (una busqueda por pregunta, 2 paginas por busqueda, timeout de 6 segundos).
- Memoria persistente en texto plano (`memory.json`) que se inyecta en el system prompt de cada nueva sesion.
- Razonamiento multi-turno basico y seguimiento de conversacion.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente personal local en Mac: el modelo responde preguntas cotidianas y, cuando necesita informacion actual, invoca `web_search`; su huella de ~1 GB de memoria lo hace adecuado para ejecucion continua en segundo plano en un portatil Apple Silicon.
- Consultas sobre informacion actual (precios, meteorologia, horarios): el flujo de busqueda web lee las paginas de resultados y sintetiza la respuesta; el autor reporta 10 respuestas correctas de 22 en una prueba con eventos actuales, por lo que encaja en escenarios de baja criticidad.
- Memoria de preferencias del usuario: mediante `remember` y `recall` puede almacenar hechos que el usuario le pide recordar y recuperarlos en sesiones posteriores, util para asistentes personales que mantienen contexto entre conversaciones.
- Prototipado de agentes con tool calling en local: sirve como banco de pruebas para disenar flujos de function calling (busqueda, memoria) sin depender de APIs en la nube, gracias a su formato de tool-call nativo y a su bajo consumo de memoria.
- Asistencia offline: con `--no-web` desactiva todo acceso a red, lo que permite usarlo en entornos sin conectividad para tareas de conversacion y recuperacion de memoria local.
- Educacion e investigacion sobre cuantizacion: el modelo documenta un pipeline reproducible de cuantizacion mixta con rotacion Hadamard y destilacion, util como referencia para estudiar el impacto de la compresion en modelos pequenos.

## Benchmarks y rendimiento

| Prueba | Loco1-smol-1.7B | LFM3-1.7B original (bf16) |
|---|---|---|
| When2Call test set (450 opcion multiple, normalizado por longitud) | 0,644 | 0,367 |
| — pide informacion faltante / dice que no puede responder | 0,31 / 0,63 | 0,07 / 0,03 |
| Decisiones de herramientas del asistente (40 prompts) | 0,975 | 0,725 |
| ToolACE held-out: funcion correcta / argumentos correctos (60) | 0,883 / 0,633 | 0,717 / 0,567 |
| xLAM irrelevance held-out: no llama correctamente (30) | 1,00 | 0,867 |
| When2Call train-split held-out (30) | 1,00 | 0,733 |
| Chat cotidiano, 30 prompts, valoracion ciega: correcto / fallo menor / incorrecto | 18 / 7 / 5 | 17 / 8 / 5 |
| Perplejidad WikiText-2 (menor es mejor) | 16,58 | 14,70 |
| Bits por byte en ingles, FineWeb held-out (menor es mejor) | 0,797 | 0,806 |
| Bits por byte en chino, FineWeb-2 held-out (menor es mejor) | 1,599 | 1,582 |
| Busqueda web en vivo (22 preguntas, 2026-11-10) | 10 correctas, 4 con errores menores, 2 sin datos con enlaces, 6 incorrectas | no disponible |

Velocidad en Apple M5 con 24 GB, mismo codigo MLX: decodificacion de 60,8 frente a 22,2 tokens/s con bateria y carga de fondo (unos 100 frente a 30 tokens/s en maquina inactiva); memoria pico de 1,0 GB frente a 3,6 GB. El prefill es mas lento que el original (aproximadamente 0,75x) porque la multiplicacion de matrices cuantizada es mas lenta que bfloat16 con lotes grandes. El propio autor advierte que las filas held-out provienen de los mismos datasets de entrenamiento y que los 40 prompts de asistente y 30 de chat fueron escritos por los desarrolladores, por lo que sobreestiman la calidad real; la prueba independiente es el test set de When2Call.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,0 GB de memoria pico en inferencia (frente a 3,6 GB del original en bfloat16).
- GPU recomendadas: exclusivamente Apple Silicon (MLX); no es compatible con CUDA ni con Transformers/PyTorch.
- Cabe en cualquier Mac con chip Apple Silicon y memoria unificada suficiente; el autor lo prueba en un M5 con 24 GB.
- Opciones de despliegue: MLX (`mlx==0.32.3`, `mlx-lm==0.32.2`, `transformers==5.19.0`, Python 3.13); scripts `chat.py` y `assistant.py` incluidos en el repositorio. No soporta vLLM, llama.cpp, Ollama ni TGI por su formato MLX.
- Latencia y throughput: 60,8 tokens/s en decodificacion con bateria y carga de fondo, unos 100 tokens/s en maquina inactiva (M5, 24 GB); prefill a 0,75x del original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loco1-smol-1.7B | 1,7B (pesos cuantizados, 790 MB) | no disponible | Si (web_search, remember, recall) | LFM Open v1.0 (comercial < 10 M USD) | Hugging Face, solo MLX |
| LiquidAI/LFM3-1.7B (modelo base) | 1,7B | no disponible | Formato nativo LFM3 | LFM Open v1.0 | Hugging Face |
| Modelos SmolLM de HuggingFaceTB | 1,7B (familia SmolLM) | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con alternativas de la misma categoria se limita al modelo base y a la familia SmolLM, ya que no se dispone de datos de benchmarks de terceros en la informacion proporcionada. Frente al modelo base, Loco1 mejora la decision de tool-use (0,644 frente a 0,367 en When2Call) y la velocidad de decodificacion (60,8 frente a 22,2 tokens/s), pero empeora la perplejidad de lenguaje (16,58 frente a 14,70 en WikiText-2).

## Limitaciones y advertencias

- Es un modelo de 1,7B: comete errores factuales y aritmeticos, e inventa detalles de tramas, nombres o cifras. No debe usarse para consejo medico, legal o financiero.
- A veces busca en la web cosas que ya sabe (hechos simples, conversiones de unidades), lo que produce respuestas correctas pero mas lentas.
- La calidad de la busqueda depende de lo que expongan las paginas: solo lee HTML plano, por lo que los sitios que cargan datos con JavaScript (algunas webs de cotizaciones y tipos de cambio) no le ofrecen contenido y responde con enlaces o indicando que no hay datos.
- En la prueba de busqueda web en vivo, 6 de 22 respuestas fueron incorrectas, incluyendo malinterpretar una lista de precios, reportar una decision de la Fed antigua como la ultima y responder preguntas de seguimiento desde memoria sin buscar.
- Puede no detectar informacion desactualizada (la model card se corta en ese punto).
- Solo soporta ingles; el vocabulario incluye chino comun pero el entrenamiento declarado es en ingles.
- Restriccion de licencia: uso comercial permitido solo a organizaciones con menos de 10 M USD de ingresos anuales (LFM Open License v1.0).
- Privacidad: `web_search` envia la consulta a DuckDuckGo y descarga las paginas de resultados; las memorias se guardan en texto plano en `memory.json` junto al script.
- Dependencia de plataforma: solo Apple Silicon via MLX; no es un checkpoint de Transformers/PyTorch y no puede desplegarse en infraestructura CUDA estandar.

## Enlaces

- Hugging Face: https://huggingface.co/loco-ai/Loco1-smol-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open v1.0: https://huggingface.co/loco-ai/Loco1-smol-1.7B/blob/main/LICENSE
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset SWE-agent-trajectories: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xLAM irrelevance: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
