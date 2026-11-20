# Mincofficial/Minico-M1-1105

## Resumen
Minico M1 1105 es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-350M, desarrollado por Mincofficial. Se trata de un modelo de lenguaje de 354 millones de parametros (350M) orientado a razonamiento, con un mecanismo original de "esfuerzo de razonamiento" configurable en cinco niveles (`off`, `low`, `medium`, `high`, `max`). Su propuesta principal es ofrecer razonamiento de tipo cadena de pensamiento en un modelo lo bastante pequeno para ejecutarse en un portatil, con un consumo de memoria de aproximadamente 229 MB en cuantizacion Q4_K_M.

El modelo parte de la arquitectura LFM2 (Liquid Foundation Model 2) de Liquid AI y hereda sus etiquetas de modelo pequeno, orientado a dispositivo (on-device) y edge. El ajuste se centra en corregir los defectos de la version previa (Minico M1 Preview): niveles de esfuerzo funcionales, razonamiento no duplicado en la respuesta y eliminacion de bucles repetitivos (tasa de bucle del 0% frente al 18,8% del Preview).

Es relevante porque demuestra que un modelo de 350M puede competir con alternativas mas grandes (Qwen2.5 0.5B) en tareas como IFEval, MMLU-Pro y conversacion multi-turno, y porque incluye builds en GGUF, MLX y ONNX, ademas de una demo WebGPU ejecutable en navegador. La licencia es `lfm1.0` (marcada como "other"), lo que condiciona su uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (Liquid Foundation Model 2), ajuste fino del base |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, ~229 MB), MLX, ONNX, safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors, GGUF, MLX, ONNX |

## Arquitectura y entrenamiento
El modelo es un fine-tune de LiquidAI/LFM2.5-350M, que emplea la arquitectura LFM2 de Liquid AI, una familia disenada para inferencia en dispositivo con atencion eficiente. El ajuste se ha orientado a tres objetivos: habilitar un dial de esfuerzo de razonamiento con cinco niveles, garantizar que el razonamiento se cierre con `</think>` y vaya seguido de una unica respuesta, y eliminar los bucles de generacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

La innovacion principal es el control del esfuerzo de razonamiento: el modelo ajusta la longitud de su cadena de pensamiento segun el nivel seleccionado (mediana de 0 tokens en `off`, 40 en `low`, 54 en `medium`, 66 en `high` y 78 en `max`), manteniendo en todos los casos el cierre correcto del bloque de razonamiento (0% de `<think>` sin cerrar). Tambien se reporta soporte de tool calling, con un 100% de llamadas correctas en la prueba de function calling del autor (frente al 54,8% del modelo base).

## Capacidades
- Generacion de texto conversacional en ingles.
- Razonamiento con cadena de pensamiento configurable en cinco niveles de esfuerzo (`off`, `low`, `medium`, `high`, `max`).
- Cierre correcto del razonamiento con `</think>` y respuesta unica posterior (tasa de bucle del 0%).
- Tool calling / function calling (100% de llamadas correctas en la prueba del autor).
- Razonamiento matematico basico (aritmetica, problemas de GSM8K y MATH-500).
- Seguimiento de instrucciones estrictas (IFEval prompt-level strict).
- Conversacion multi-turno con identificacion correcta del ultimo mensaje.
- Capacidad de autoidentificacion ("says who it is": 100%).
- Despliegue en dispositivo y navegador (WebGPU, GGUF, MLX, ONNX).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso
- Asistente conversacional en dispositivo: el modelo cabe en ~229 MB en Q4_K_M y corre a 371 tokens/s en un MacBook Air sin ventilador con llama.cpp, lo que permite asistentes locales sin conexion ni envio de datos a la nube.
- Razonamiento con coste controlado: en aplicaciones donde la latencia importa, se puede fijar el esfuerzo en `off` o `low` para respuestas rapidas y subir a `high` o `max` solo en consultas complejas, ajustando la mediana de tokens de razonamiento entre 0 y 78.
- Automatizacion de tool calling en agentes ligeros: con un 100% de llamadas correctas en la prueba del autor, es adecuado para pipelines de function calling en entornos con recursos limitados (por ejemplo, orquestacion de APIs en un dispositivo edge).
- Demo web interactiva: el build ONNX y la demo WebGPU permiten ejecutar el modelo en el navegador del usuario, util para prototipos, educacion o demostraciones sin infraestructura de servidor.
- Clasificacion y extraccion de informacion en ingles: su rendimiento en IFEval (72,5) y MMLU-Pro (18,8) lo hace viable para tareas de seguimiento de instrucciones y respuesta a preguntas de opcion multiple en entornos de bajo coste.
- Filtrado y preprocesado en pipelines de datos: al ser un modelo pequeno y rapido, puede usarse para tareas auxiliares (resumen, reformulacion, etiquetado) dentro de un pipeline mayor sin consumir GPU dedicada.
- Educacion y experimentacion con razonamiento: el dial de esfuerzo permite estudiar como varia la calidad y la longitud del razonamiento en un modelo abierto de 350M.

## Benchmarks y rendimiento
Resultados publicados por el autor, con el mismo harness y muestreo (temperatura 0,1, top_k 50, repetition penalty 1,05). Minico M1 1105 se evalua con thinking `off`.

| Modelo | Parametros | GSM8K | MATH-500 | IFEval | MMLU-Pro | Multi-turn | Media | Tasa de bucle |
|---|---|---|---|---|---|---|---|---|
| Minico M1 1105 (effort off) | 350M | 39,8 | 19 | 72,5 | 18,8 | 99 | 49,8 | 0% |
| Minico M1 Preview | 350M | 25,8 | 15,5 | 50,3 | 11,2 | 66 | 33,8 | 18,8% |
| Gemma 3 270M | 270M | 17,2 | 6 | 26,1 | 11,5 | 60 | 24,2 | 18,8% |
| Granite 4.0 350M | 350M | 41,5 | 17 | 48,8 | 12,6 | 98 | 43,6 | 1,2% |
| LFM2 350M | 350M | 26,8 | 22 | 55,3 | 17,1 | 71 | 38,4 | 0% |
| LFM2.5 350M (base) | 350M | 35 | 19 | 71,7 | 18,4 | 91 | 47 | 0% |
| SmolLM2 360M | 360M | 11,2 | 0 | 32,4 | 10,8 | 44 | 19,7 | 2,5% |
| Qwen2.5 0.5B | 494M | 47,8 | 36 | 28,8 | 14,6 | 81 | 41,6 | 7,5% |

Por nivel de esfuerzo (GSM8K y MATH-500):

| Esfuerzo | GSM8K | MATH-500 | Mediana de tokens de razonamiento | `<think>` sin cerrar |
|---|---|---|---|---|
| off | 39,8 | 19 | 0 | 0% |
| low | 31,5 | no disponible | 40 | 0% |
| medium | 34,8 | 12,5 | 54 | 0% |
| high | 37 | 18,5 | 66 | 0% |
| max | 34,8 | no disponible | 78 | 0% |

El autor advierte que diferencias inferiores a unos 3 puntos estan dentro del ruido entre ejecuciones, y que el muestreo casi greedy empleado puede diferir de los ajustes oficiales de cada modelo.

## Requisitos de hardware
- VRAM estimada: aproximadamente 229 MB en Q4_K_M; el repo completo en safetensors ocupa 0,7 GB.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos ~1 GB de memoria libre en cuantizacion Q4_K_M; tambien en CPU.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta 371 tokens/s en un MacBook Air sin ventilador con llama.cpp, lo que indica que no requiere GPU dedicada.
- Opciones de despliegue: llama.cpp (GGUF), MLX (Apple Silicon), ONNX, transformers, y demo WebGPU en navegador.
- Latencia y throughput: 371 tokens/s en MacBook Air con llama.cpp (Q4_K_M), segun el autor.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Media de benchmarks (autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minico M1 1105 | 350M | no disponible | 49,8 | lfm1.0 | HF, GGUF, MLX, ONNX |
| LFM2.5 350M (base) | 350M | no disponible | 47 | lfm1.0 | HF |
| Granite 4.0 350M | 350M | no disponible | 43,6 | no disponible | HF |
| Qwen2.5 0.5B | 494M | no disponible | 41,6 | no disponible | HF |
| SmolLM2 360M | 360M | no disponible | 19,7 | no disponible | HF |

Minico M1 1105 supera a sus competidores sub-400M en IFEval (72,5), MMLU-Pro (18,8) y multi-turno (99), y queda por detras de Granite 4.0 350M en GSM8K (39,8 frente a 41,5) y de Qwen2.5 0.5B en GSM8K (47,8) y MATH-500 (36 frente a 19). Qwen2.5 0.5B es un 41% mas grande.

## Limitaciones y advertencias
- Solo soporta ingles; no se declaran capacidades multilingues.
- El razonamiento no siempre mejora la precision: en GSM8K, `off` rinde similar a `high` (39,8 frente a 37), y en el ejemplo "5 + 5 x 5" el modo `off` fallo 13 de 20 veces.
- Riesgo de alucinacion propio de un modelo de 350M; el rendimiento en MMLU-Pro (18,8) es bajo en terminos absolutos.
- La licencia `lfm1.0` esta etiquetada como "other"; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- No se dispone de informacion sobre la longitud de contexto, los datos de entrenamiento ni los sesgos conocidos.
- Los benchmarks son los reportados por el autor con su propio harness y muestreo casi greedy; pueden diferir de evaluaciones independientes.
- El modelo base es LFM2.5-350M, por lo que hereda las limitaciones de conocimiento y capacidad de un modelo de ese tamano.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Mincofficial/Minico-M1-1105
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Version Preview: https://huggingface.co/Mincofficial/Minico-M1-Preview
- GGUF: https://huggingface.co/Mincofficial/Minico-M1-1105-GGUF
- MLX: https://huggingface.co/Mincofficial/Minico-M1-1105-MLX
- ONNX: https://huggingface.co/Mincofficial/Minico-M1-1105-ONNX
- Demo en navegador (WebGPU): https://minico.mincoffical.codes/try/
- Licencia: LICENSE (referenciada en la model card)
