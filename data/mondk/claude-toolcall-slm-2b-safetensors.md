# mondk/claude-toolcall-slm-2B-safetensors

## Resumen

`mondk/claude-toolcall-slm-2B-safetensors` es un modelo de lenguaje pequeño (SLM) de 1.700 millones de parámetros, desarrollado por el usuario "mondk" sobre la base de `HuggingFaceTB/SmolLM2-1.7B`. Su propósito principal es realizar *tool calling* (llamada a herramientas y funciones) en contextos conversacionales, entrenado a partir de trazas de ejecución de Claude Code (dataset `mondk/claude-code-fable-5-traces.jsonl`) junto con corpus adicionales como SmolLM2-corpus, The Stack, SmolTalk y UltraFeedback.

El modelo resulta relevante porque demuestra que es posible transferir capacidades de invocación de herramientas propias de asistentes grandes (como Claude) a un modelo de solo 1,7B parámetros, lo que permite desplegar agentes con tool calling en hardware de consumo o en entornos con restricciones de recursos. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas, aunque el dataset de entrenamiento basado en trazas de Claude Code plantea interrogantes sobre la procedencia de los datos.

El repositorio contiene los pesos en formato `safetensors` (3,4 GB), y el autor mantiene una versión cuantizada en GGUF bajo el identificador `mondk/claude-toolcall-slm-2B`. El modelo está orientado exclusivamente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Llama) |
| Parametros totales | 1.711.378.432 (~1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base SmolLM2-1.7B tiene 2048 tokens) |
| Tipos de cuantizacion | No disponible en este repo (existe version GGUF en `mondk/claude-toolcall-slm-2B`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de `HuggingFaceTB/SmolLM2-1.7B`, un transformer decoder-only de arquitectura tipo Llama con 1,7B parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida; es un modelo denso convencional adaptado mediante entrenamiento adicional supervisado.

Los datos de entrenamiento declarados en la model card incluyen: `mondk/claude-code-fable-5-traces.jsonl` (trazas de ejecución de Claude Code, que proporcionan ejemplos de interacciones con herramientas), `HuggingFaceTB/smollm-corpus` (corpus general de SmolLM2), `bigcode/the-stack` (código fuente), `HuggingFaceTB/smoltalk` (conversaciones sintéticas) y `openbmb/UltraFeedback` (preferencias y feedback). No se especifica el número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO o PPO sobre el fine-tune. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés del modelo reside en la transferencia de habilidades de tool calling a un SLM.

## Capacidades

- Generación de texto conversacional en inglés.
- Invocación de herramientas y funciones (*tool calling* / *function calling*), capacidad principal del modelo según su nombre y dataset de entrenamiento.
- Soporte para agentes que requieren ejecutar múltiples pasos con llamadas a APIs externas.
- Razonamiento básico y generación de código, heredado del modelo base SmolLM2-1.7B y reforzado con The Stack.
- Sin soporte multimodal (ni visión ni audio).
- Sin modo de pensamiento explícito (*thinking mode*) documentado.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo integrados (IDE): el modelo puede recibir una petición en lenguaje natural y emitir llamadas a herramientas del editor (buscar símbolos, ejecutar tests, refactorizar) gracias a su entrenamiento sobre trazas de Claude Code. Su tamaño reducido permite ejecutarlo localmente en portátiles de desarrollo sin depender de la nube.
- Agentes de automatizacion de tareas en CI/CD: integrado en pipelines, puede interpretar mensajes de error, consultar logs y decidir qué comandos ejecutar o qué funciones llamar para resolver fallos de compilación o despliegue.
- Chatbots de soporte tecnico con acceso a sistemas internos: el modelo puede gestionar conversaciones multi-turno en inglés y realizar llamadas a APIs de ticketing, bases de conocimiento o sistemas de inventario para resolver consultas de usuarios sin intervención humana.
- Prototipado rapido de aplicaciones de agente: al ser Apache 2.0 y de pequeño tamaño, permite a equipos de investigación validar flujos de tool calling sin coste de inferencia elevado, antes de migrar a modelos más grandes.
- Inferencia en dispositivos de borde (edge) o entornos sin GPU: con cuantización GGUF, el modelo puede ejecutarse en CPU en dispositivos embebidos o Raspberry Pi para tareas de asistencia conversacional con integración de herramientas locales.
- Generacion de codigo con invocacion de librerias: el modelo puede proponer fragmentos de código que requieran llamar a funciones de librerías específicas, apoyándose en su entrenamiento sobre The Stack, y emitir la llamada correcta en el formato esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos safetensors ocupan 3,4 GB (presumiblemente en fp16/bf16). Con cuantización GGUF Q4_K_M, el modelo ocuparía aproximadamente 1 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente (GTX 1660, RTX 3050, RTX 4060, etc.). También es viable inferencia solo en CPU con llama.cpp.
- Si cabe en consumer GPU: sí, es un modelo diseñado para entornos con recursos limitados.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI o cualquier framework compatible con safetensors y GGUF (Transformers, Candle, MLX).
- Latencia y throughput: no se han publicado mediciones oficiales. Con 1,7B parámetros, se espera una latencia de decenas de milisegundos por token en GPU consumer y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| mondk/claude-toolcall-slm-2B | 1,7B | No disponible (base: 2048) | Si (entrenado) | Apache 2.0 | safetensors, GGUF |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 2048 | No (instruct general) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Si (soporte nativo) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 | Limitado | Llama 3.2 | safetensors, GGUF |

El modelo se distingue de su base (SmolLM2-1.7B-Instruct) por el entrenamiento específico en tool calling a partir de trazas de Claude Code. Qwen2.5-1.5B-Instruct ofrece soporte nativo de tool calling con contexto mucho mayor (32K), mientras que este modelo no documenta su longitud de contexto final tras el fine-tune. Llama-3.2-1B tiene un contexto muy amplio pero una licencia más restrictiva.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües.
- La longitud de contexto no está documentada en la model card; si el fine-tune no la extendió, se mantiene en 2048 tokens, lo que limita conversaciones largas o documentos extensos.
- Al ser un modelo de 1,7B, es propenso a alucinaciones y errores de razonamiento en tareas complejas; no debe usarse como sustituto de modelos grandes en tareas críticas.
- El dataset de entrenamiento incluye trazas de Claude Code (un producto propietario de Anthropic). Aunque la licencia del modelo es Apache 2.0, la procedencia de los datos podría plantear problemas legales o éticos en despliegues comerciales sensibles.
- No se han publicado evaluaciones de seguridad, sesgos o robustez; se recomienda auditar el modelo antes de uso en producción.
- La calidad del tool calling no está verificada con benchmarks públicos; el autor no ha documentado tasas de éxito ni métricas de precisión.

## Enlaces

- Repositorio HuggingFace (safetensors): https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors
- Version GGUF: https://huggingface.co/mondk/claude-toolcall-slm-2B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset de trazas: https://huggingface.co/datasets/mondk/claude-code-fable-5-traces.jsonl
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset UltraFeedback: https://huggingface.co/datasets/openbmb/UltraFeedback
