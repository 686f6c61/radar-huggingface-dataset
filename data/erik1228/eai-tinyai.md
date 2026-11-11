# Erik1228/EAI.TinyAI

## Resumen

EAI.TinyAI (publicado por el autor Erik1228 bajo el nombre interno "EAI v1.2") es un ajuste fino de Qwen2.5-0.5B-Instruct orientado a la generacion de codigo en Lua y scripts para Roblox Studio. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 en su variante mas pequena, con 494 millones de parametros, y ha sido adaptado mediante QLoRA de 4 bits con la libreria Unsloth, entrenando unicamente el 1,75 % de los parametros. Su proposito es ofrecer un asistente de codigo Lua/Roblox que funcione en local, sin latencia de red y en hardware de consumo.

La relevancia del modelo es fundamentalmente practica: demuestra que con una GPU de portatil de 6 GB de VRAM (RTX 4050 Laptop) es posible producir un especialista de dominio acotado y distribuirlo en formato GGUF para su uso offline en herramientas como LM Studio o llama.cpp. No compite en capacidad generalista con modelos de mayor tamano, sino que se posiciona como utilidad especializada de bajo coste.

El repositorio ocupa 3,5 GB e incluye pesos en formato GGUF con varias cuantizaciones (Q4_K_M, Q8_0 y otras), ademas de los artefactos derivados del proceso de conversion con llama.cpp. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino QLoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 y otras variantes GGUF (segun model card) |
| Idiomas soportados | ru, en, lua |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos convertidos via llama.cpp); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino supervisado mediante QLoRA de 4 bits con Unsloth, actualizando solo el 1,75 % de los parametros. El entrenamiento se realizo en una unica GPU NVIDIA RTX 4050 Laptop con 6 GB de VRAM, lo que da una idea del reducido presupuesto computacional empleado.

El dataset de ajuste consta de 20.000 ejemplos unicos con codigo Lua, referencias a la API de Roblox y razonamientos en formato `<think>`, lo que sugiere un entrenamiento orientado tanto a la generacion directa de codigo como a la produccion de trazas de razonamiento intermedias. No se documentan fases de RLHF o DPO posteriores al ajuste supervisado, ni el numero total de tokens vistos durante el entrenamiento. El contexto de entrenamiento declarado es de 4096 tokens. La conversion a GGUF se realizo con llama.cpp.

## Capacidades

- Generacion de codigo en Lua, con enfasis en scripts para Roblox Studio y uso de su API.
- Razonamiento en formato `<think>`: el dataset de entrenamiento incluye trazas de razonamiento agente, por lo que el modelo puede emitir pasos intermedios antes de la respuesta final.
- Generacion de texto general bilingue en ruso e ingles, heredada del modelo base Qwen2.5.
- Respuestas concisas orientadas a bloques de codigo cuando se le indica mediante system prompt.
- Ejecucion local y offline, sin dependencia de red.
- No se documenta soporte de tool calling o function calling nativo.
- No se documenta soporte de vision, audio ni otras modalidades.
- No se documenta soporte multilingue mas alla de ruso, ingles y Lua.

## Casos de uso

- Asistente de scripting para Roblox Studio: el modelo genera fragmentos de Lua con llamadas a la API de Roblox, adecuado para prototipado rapido de mecanicas de juego dentro del editor.
- Autocompletado de codigo Lua en el editor: al ser un modelo de 0,5 B en Q4 (menos de 400 MB), puede mantenerse cargado en memoria de forma permanente y responder con baja latencia en un portatil.
- Generacion de scripts de automatizacion en Lua para entornos embebidos o herramientas internas, aprovechando el conocimiento del lenguaje del ajuste fino.
- Ensenanza y ejemplos de Lua: util para producir snippets didacticos y explicaciones breves de API, con la advertencia de que requiere revision humana por el riesgo de alucinacion en nombres de funciones.
- Entorno de pruebas para investigacion de QLoRA: sirve como referencia reproducible de un pipeline Unsloth + llama.cpp ejecutado en hardware de consumo.
- Despliegue en entornos sin conectividad: al funcionar offline en GGUF, es utilizable en maquinas aisladas o con requisitos de privacidad donde no se permite enviar codigo a APIs externas.
- Traduccion tecnica ruso-ingles de contenido relacionado con programacion, dentro de las capacidades heredadas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara un rendimiento aproximado de 180 tokens por segundo en local sobre una RTX 4050 Laptop con cuantizacion Q4, sin especificar el backend exacto ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada: menos de 400 MB en cuantizacion Q4 segun la model card; en Q8_0 el peso se aproxima a 0,5 GB y requiere algo mas de memoria para el contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor lo entreno y ejecuto en una RTX 4050 Laptop de 6 GB.
- Cabe holgadamente en GPU de consumo: RTX 3050, RTX 4060, GTX 1660, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (previa importacion del GGUF), y text-generation-inference segun los tags del repositorio.
- Throughput declarado: aproximadamente 180 tokens por segundo en RTX 4050 Laptop con Q4. No se documenta latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EAI.TinyAI (EAI v1.2) | 494 M | 4096 | Lua / Roblox | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 (modelo base) | Generalista | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-Coder-0.5B-Instruct | 494 M | 32 768 | Codigo multilingue | Apache-2.0 | Hugging Face |
| StarCoder2-3B | 3 B | 16 384 | Codigo multilingue | BigCode OpenRAIL-M | Hugging Face |

La comparativa se limita a los datos publicos de cada modelo base; no hay benchmarks del ajuste fino que permitan comparar calidad de generacion de Lua frente a estas alternativas. Frente a Qwen2.5-Coder-0.5B-Instruct, la diferencia principal es la especializacion en Roblox y el contexto reducido a 4096 tokens.

## Limitaciones y advertencias

- Con 494 M de parametros, la capacidad de razonamiento general y de codigo complejo es limitada; es esperable un rendimiento inferior a modelos de 3 B o superiores en tareas fuera de Lua.
- Riesgo elevado de alucinacion en nombres de funciones y firmas de la API de Roblox; todo codigo generado debe revisarse y probarse antes de usarse en produccion.
- Contexto reducido a 4096 tokens, muy por debajo de los 32 768 del modelo base Qwen2.5, lo que limita el trabajo con ficheros grandes o conversaciones largas.
- Cobertura idiomatica limitada a ruso, ingles y Lua; el castellano no esta declarado como idioma soportado y su calidad no esta garantizada.
- El modelo no ha sido evaluado con benchmarks publicos, por lo que no existen metricas objetivas de calidad.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa de la comunidad; debe tratarse como un experimento personal, no como un artefacto con garantias de mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia del dataset de 20.000 ejemplos antes de un uso comercial.
- El system prompt recomendado esta en ruso; su comportamiento con instrucciones en castellano no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Erik1228/EAI.TinyAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Libreria Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
