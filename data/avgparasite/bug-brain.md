# avgparasite/bug-brain

## Resumen

Bug-brain es un modelo de lenguaje de pequeno tamano publicado por el usuario avgparasite en Hugging Face. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, el modelo instructivo de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba. El objetivo del modelo no es la generacion de texto general, sino una tarea muy concreta: transformar un comando de un visitante junto con una lista de elementos de una pagina web en un plan JSON de acciones para una mascota virtual (un gato llamado Bug) que habita en el sitio paraspatle.in.

El modelo se distribuye en formato ONNX cuantizado a 4 bits (q4f16) para ejecutarse directamente en el navegador mediante Transformers.js y WebGPU. Esta orientacion a inferencia en el dispositivo (on-device) es su rasgo diferencial: no requiere backend, sino que corre en el cliente del visitante. El autor reporta una mejora sustancial en la tarea especifica, pasando de un 0% de planes validos en paginas no vistas con el modelo base a un 87% tras el ajuste fino.

Por su tamano (0,5B parametros), su licencia Apache 2.0 y su empaquetado ONNX, el modelo resulta relevante como ejemplo de ajuste fino de proposito muy especifico sobre un modelo pequeno, orientado a agentes de navegador ligeros y a despliegues sin servidor. No obstante, la informacion publicada es escasa y no hay datos de benchmarks generales ni de composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | ONNX q4f16 (4 bits, pesos en float16 para WebGPU) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado q4f16); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. Sobre esa base se aplico un ajuste fino con LoRA para una tarea de transformacion estructurada: dado un comando en lenguaje natural y una representacion textual de los elementos de la pagina (con identificadores como `t0`, `t1`, tipos como `[heading]` o `[link]` y atributos como `href`), el modelo debe emitir un JSON con una lista de pasos de accion (por ejemplo, `{"action": "open", "target": "t1"}` o `{"action": "say", "text": "..."}`).

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales. La innovacion tecnica destacable es el empaquetado: cuantizacion a 4 bits en ONNX y ejecucion en navegador con Transformers.js y WebGPU, lo que permite inferencia on-device sin servidor. El autor reporta que el modelo base generaba un 0% de planes validos en paginas no vistas, mientras que tras el ajuste fino alcanza un 87%.

## Capacidades

- Generacion de planes JSON estructurados a partir de un comando y una lista de elementos de pagina.
- Mapeo de comandos en lenguaje natural a acciones discretas sobre elementos identificados (abrir enlaces, decir texto).
- Ejecucion en navegador mediante Transformers.js y WebGPU, sin backend.
- Inferencia on-device con pesos cuantizados a 4 bits.
- Ajuste fino especifico (LoRA) sobre un modelo instructivo, lo que conserva parcialmente las capacidades conversacionales del base, aunque no se documentan.
- No se documenta soporte de tool calling general, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Mascota virtual o asistente de navegacion web: el modelo convierte comandos del visitante en acciones sobre la pagina, como abrir un enlace o mostrar un mensaje, integrandose en el sitio como un agente ligero que corre en el cliente.
- Demostracion de inferencia on-device en navegador: sirve como referencia tecnica para equipos que quieran desplegar un modelo pequeno con Transformers.js y WebGPU sin infraestructura de servidor.
- Prototipado de agentes de navegador: util para experimentar con la traduccion de instrucciones en lenguaje natural a planes de accion estructurados sobre el DOM, antes de escalar a modelos mayores.
- Educacion y divulgacion: ejemplo didactico de ajuste fino LoRA sobre un modelo de 0,5B para una tarea de salida estructurada, con una metrica clara de mejora (0% a 87%).
- Pruebas de concepto de asistentes embebidos: adecuado para validar latencia y experiencia de usuario en entornos donde no se quiere enviar datos a un servidor.
- Generacion de JSON controlado en el cliente: puede emplearse como componente de un pipeline mayor que necesite producir estructuras de accion a partir de texto, siempre que la tarea se parezca a la del ajuste.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la tasa de planes validos en paginas no vistas (held-out):

| Metrica | Modelo base (Qwen2.5-0.5B-Instruct) | Bug-brain (tras LoRA) |
|---|---|---|
| Planes validos en paginas no vistas | 0% | 87% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,3 GB en formato ONNX q4f16; la inferencia en navegador depende de la memoria de la GPU del cliente, no de VRAM de servidor.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (por ejemplo, integradas recientes y dedicadas de consumo); no se documentan requisitos minimos.
- Cabe en GPU de consumo: si, dado el tamano del modelo (0,5B) y la cuantizacion a 4 bits.
- Opciones de despliegue: Transformers.js con WebGPU (principal); al estar en ONNX, podria ejecutarse con otros runtimes ONNX, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| avgparasite/bug-brain | 0,5B (base) | no disponible | Plan JSON de acciones web | Apache 2.0 | ONNX q4f16 |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Instrucciones generales | Apache 2.0 | safetensors, GGUF, ONNX |
| Otros modelos pequenos para navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especificas no esta disponible en la informacion proporcionada. El referente inmediato es el modelo base, que obtiene un 0% en la tarea objetivo frente al 87% del ajuste.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: su rendimiento fuera de la tarea de generacion de planes de accion sobre elementos de pagina no esta documentado y probablemente sea limitado.
- El 87% de planes validos implica que aproximadamente 1 de cada 8 planes puede ser invalido; en produccion se requiere validacion y manejo de errores.
- No se documentan sesgos conocidos, pero al derivar de un modelo instructivo general puede heredar sesgos del base.
- Riesgo de alucinacion en la generacion de JSON y de identificadores de elementos inexistentes.
- Idiomas soportados no disponibles; el ejemplo de la model card esta en ingles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-0.5B-Instruct.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo sin cuantizar; no se publican comparativas.
- Informacion de entrenamiento (datos, hiperparametros, evaluacion) muy escasa, lo que dificulta la reproducibilidad.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avgparasite/bug-brain
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Sitio del proyecto: https://paraspatle.in
- Transformers.js: https://github.com/huggingface/transformers.js
