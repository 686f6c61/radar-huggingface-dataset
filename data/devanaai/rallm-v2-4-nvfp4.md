# Devanaai/RaLLM-v2.4-NVFP4

## Resumen

RaLLM v2.4 NVFP4 es la versión cuantizada a NVFP4 del fine-tune RaLLM v2.4 de Devana sobre el modelo base Qwen/Qwen3.8-27B. Se trata de un modelo especializado en uso de herramientas (tool calling y function calling) dentro del asistente Suite 366, un agente que opera sobre CRM, calendario, correo, archivos, notas y tareas, y que además conoce el ecosistema Devana. El repositorio contiene el adaptador ya fusionado con los pesos del modelo base y cuantizado a NVFP4, con un tamaño de repositorio de 21,9 GB.

La relevancia de esta ficha reside en que el autor publica una comparación directa contra el modelo base cuantizado por NVIDIA (nvidia/Qwen3.8-27B-NVFP4), usando la misma receta de cuantización y el mismo servidor de inferencia. Los resultados muestran mejoras sustanciales en la toma de decisiones sobre cuándo invocar una herramienta, en la reducción de escrituras no deseadas en CRM y calendario bajo instrucciones restrictivas, y en el conocimiento del ecosistema Devana, manteniendo las capacidades generales del modelo base.

El modelo está pensado para despliegue en producción con vLLM y decodificación especulativa MTP. Los pesos están en safetensors con cuantización NVFP4 y FP8, la licencia es Apache 2.0 y los idiomas declarados son francés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; etiqueta qwen3_5 en los tags) |
| Parametros totales | 18.164.649.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos), FP8; receta ModelOpt de NVIDIA |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4/FP8), compatible con transformers y vLLM |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 21,9 GB |
| Pipeline | text-generation (image-text-to-text en los tags) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.8-27B mediante un adaptador LoRA que se ha fusionado con los pesos del modelo base y posteriormente se ha cuantizado a NVFP4. La receta de cuantización es la misma que NVIDIA empleó para nvidia/Qwen3.8-27B-NVFP4, lo que permite una comparación controlada entre ambos modelos bajo idénticas condiciones de servido. El adaptador sin fusionar, con sus resultados en precisión completa, se publica por separado en Devanaai/RaLLM-v2.4-LoRA.

El entrenamiento está orientado al uso de herramientas dentro del producto Suite 366: el modelo aprende a decidir entre invocar una herramienta o responder en texto, a seleccionar el conjunto exacto de herramientas esperadas, a construir argumentos válidos contra el esquema de cada herramienta y a respetar instrucciones del sistema que restringen escrituras. Las evaluaciones se realizaron con decodificación greedy, modo thinking desactivado y vLLM 0.30 con decodificación especulativa MTP. Las conversaciones de evaluación son sintéticas y están escritas en el formato del producto. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en francés e inglés.
- Tool calling y function calling: selección de herramientas, construcción de argumentos válidos contra esquemas y cadenas de llamadas de hasta 9-11 pasos.
- Carga dinámica de herramientas por categoría y uso posterior de las herramientas recién cargadas.
- Decisión entre invocar herramienta o responder en texto, con reducción drástica de llamadas innecesarias.
- Respeto de instrucciones restrictivas del sistema (acceso de solo lectura, prohibición de modificar sin petición explícita, petición de confirmación previa).
- Operaciones sobre CRM, calendario, correo, archivos, notas y tareas.
- Conocimiento del ecosistema Devana y de la documentación del producto.
- Generación de títulos de conversación.
- Capacidades generales de código, matemáticas y redacción (evaluadas con 11/14 en el probe de preguntas generales).
- Soporte de modo thinking desactivado para inferencia de baja latencia.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Asistente de productividad con herramientas: el modelo gestiona conversaciones multi-turno en las que debe encadenar llamadas a CRM, calendario, correo y tareas, con una tasa de acierto del 97,8 % en la decisión de invocar herramienta o responder y del 83 % en llamadas esperadas realizadas.
- Automatización de CRM con salvaguardas: en escenarios con instrucciones de solo lectura o de confirmación previa, el modelo redujo las escrituras no deseadas de 85/279 a 6/279, lo que lo hace adecuado para entornos donde las escrituras accidentales tienen coste operativo.
- Agente de atención al cliente con catálogo de herramientas amplio: soporta entre 27 y 128 herramientas cargadas en el prompt del producto, con 212 de 212 llamadas conformes a los esquemas en las pruebas realizadas.
- Generación de títulos y metadatos de conversación: 124 de 124 títulos generados correctamente en las peticiones replayed del producto.
- Integración en pipelines de agentes con vLLM: el formato NVFP4 y la receta ModelOpt permiten servirlo con vLLM 0.30 y decodificación especulativa MTP, lo que encaja en despliegues de producción con requisitos de latencia.
- Asistente interno sobre documentación del producto: respondió correctamente 11 de 12 preguntas sobre el ecosistema Devana, frente a 4 de 12 del modelo base cuantizado.
- Evaluación de cadenas largas de herramientas: en cadenas de 9 a 11 llamadas con herramientas no vistas, seleccionó la siguiente herramienta esperada en 46 de 48 casos y no se detuvo antes de tiempo en ningún caso.

## Benchmarks y rendimiento

Los datos publicados comparan RaLLM v2.4 NVFP4 con nvidia/Qwen3.8-27B-NVFP4 bajo las mismas condiciones (greedy, thinking off, vLLM 0.30 con MTP).

| Benchmark / metrica | Qwen3.8-27B NVFP4 (NVIDIA) | RaLLM v2.4 NVFP4 |
|---|---|---|
| Decisión correcta entre llamar herramienta o responder (592 turnos) | 90,5 % | 97,8 % |
| Conjunto exacto de herramientas esperadas | 62,8 % | 79,7 % |
| Solapamiento de herramientas con la referencia | 72,4 % | 85,5 % |
| Llamadas esperadas realizadas | 277/394 | 327/394 |
| Llamadas realizadas que eran esperadas | 61 % | 82 % |
| Llama a herramienta cuando la referencia responde en texto (282 turnos) | 47 | 8 |
| Se detiene con texto quedando trabajo de herramientas (310 turnos) | 9 | 5 |
| Cadenas largas: decisión correcta (157 turnos) | 153 | 154 |
| Argumentos válidos contra el esquema | 98,7 % | 100,0 % |
| Llamadas malformadas | 0 | 0 |
| Herramientas no vistas, cadenas de 9-11 llamadas: se detiene antes de tiempo | 0/48 | 0/48 |
| Herramientas no vistas: elige la siguiente herramienta esperada | 39/48 | 46/48 |
| Preguntas generales superadas (código, matemáticas, redacción) | 11/14 | 11/14 |
| Preguntas sobre el ecosistema Devana superadas | 4/12 | 11/12 |
| Actualiza CRM o calendario por iniciativa propia cuando procede | 20/31 | 31/31 |
| Escribe en CRM o calendario pese a instrucción restrictiva | 85/279 | 6/279 |
| MMLU-Pro, inglés | 59,4 % | 61,8 % |
| BFCL v3, un turno | 85,6 % | 85,8 % |

Prueba de McNemar sobre turnos emparejados: el modelo base toma la decisión incorrecta en solitario en 48 turnos y RaLLM v2.4 en solitario en 5 (p < 0,001). En la prueba dentro del producto, tras cargar una categoría de herramientas llamó a una herramienta en 136/136 muestras (34 peticiones) y generó 124/124 títulos correctos. En una sesión en vivo de 32 escenarios, 26 se resolvieron por completo y 6 parcialmente, sin fallos, con todas las respuestas en menos de dos minutos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,9 GB en NVFP4/FP8, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: H100, H200, B200 y GPUs con soporte nativo de NVFP4; A100 puede servir el modelo pero no aprovecha la aceleración NVFP4 de forma nativa.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer en la información disponible; el tamaño de 21,9 GB excede la VRAM de la mayoría de tarjetas consumer actuales.
- Opciones de despliegue: vLLM 0.30 con decodificación especulativa MTP (configuración usada en las evaluaciones); compatible con transformers.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que todas las respuestas de la sesión en vivo se completaron en menos de dos minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaLLM v2.4 NVFP4 | 18,16 B | no disponible | Especializado (97,8 % decisión correcta) | Apache 2.0 | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 | no disponible en la información | no disponible | Base (90,5 % decisión correcta) | no disponible en la información | Hugging Face |
| Devanaai/RaLLM-v2.4-LoRA | adaptador sobre Qwen3.8-27B | no disponible | Especializado (resultados en precisión completa) | Apache 2.0 | Hugging Face |

La comparación principal disponible es contra el modelo base cuantizado por NVIDIA, que sirve como referencia directa. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas declarados limitados a francés e inglés; no se garantiza un rendimiento equivalente en castellano ni en otros idiomas.
- El fine-tune está orientado al producto Suite 366 y al ecosistema Devana; su ventaja principal en tool calling puede no transferirse íntegramente a otros dominios de herramientas, aunque las pruebas con herramientas no vistas muestran una selección correcta en 46/48 casos.
- Las conversaciones de evaluación son sintéticas y están escritas en el formato del producto, lo que puede introducir sesgo hacia ese formato.
- Riesgo de alucinación no cuantificado en la información disponible; las preguntas generales se superaron en 11/14, lo que indica que persisten fallos en tareas fuera del dominio.
- La cuantización NVFP4 requiere hardware compatible para aprovechar su rendimiento; en GPUs sin soporte nativo el rendimiento puede degradarse.
- No se especifican la longitud de contexto ni los detalles del dataset de entrenamiento, lo que limita la evaluación de riesgos de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y la receta de cuantización de NVIDIA deben verificarse por separado.
- El modelo se distribuye sin garantías del autor sobre comportamiento en producción fuera de los escenarios evaluados.

## Enlaces

- Hugging Face: https://huggingface.co/Devanaai/RaLLM-v2.4-NVFP4
- Adaptador LoRA: https://huggingface.co/Devanaai/RaLLM-v2.4-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado por NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Devana: https://www.devana.ai
- Suite 366: https://www.suite366.ai
