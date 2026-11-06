# RocketData/Qwen3.5-4B-rocketdata-v5

## Resumen

Qwen3.5-4B-rocketdata-v5 es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B desarrollado por RocketData, orientado especificamente al diseno de cohetes de aficionado. El modelo recibe requisitos de vuelo en lenguaje natural y produce dos salidas: un bloque `<thought>` con el razonamiento sobre las decisiones de fuselaje, propulsion, estabilidad y recuperacion, y un bloque `<design>` que contiene el arbol XML de OpenRocket serializado como JSON. Los motores se referencian mediante identificadores reales de ficheros de motor (por ejemplo, `AeroTech-K550W`).

El ajuste se realizo con Unsloth mediante LoRA de 16 bits (rango 16, alpha 16) sobre el modelo base de 4.659.865.088 parametros, con un total de 471 filas de entrenamiento correspondientes a 154 cohetes. La ventana de contexto practica es de al menos 17.000 tokens, ya que las respuestas medias alcanzan los 6.020 tokens y pueden llegar a 15.000. El modelo es relevante porque demuestra un caso de uso vertical muy concreto: transformar especificaciones de ingenieria en un formato estructurado y validable, con gramatica GBNF incluida para forzar la salida.

La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors (16 bits fusionados), GGUF Q8_0 y BF16 del codificador de imagen, ademas del adaptador LoRA aislado. No es intercambiable con su predecesor RocketData/Qwen3.5-4B-rocketdata, que empleaba un esquema JSON distinto basado en `flight`/`components`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B; ajuste fino LoRA |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; se recomienda al menos 17.000 tokens para inferencia |
| Tipos de cuantizacion | Q8_0 (GGUF), BF16 (mmproj), 16 bits (safetensors); el autor desaconseja Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con capacidad image-text-to-text, y se ajusta mediante LoRA de 16 bits con Unsloth. La receta concreta es rango 16, alpha 16, tasa de aprendizaje 2e-4, batch 1 con acumulacion de gradiente 8, 3 epocas (177 pasos), semilla 42, longitud maxima de 11.264 tokens y conservacion de la ultima epoca. El entrenamiento se ejecuto en una RTX 5080 y se reanudo desde el checkpoint de la epoca 2 tras ralentizarse el primer proceso por presion de memoria de GPU.

Los datos proceden de `new_results/sft_v5.jsonl` del repositorio Phorceon/rocketdata (rama `sft-v5-data`): 471 filas de entrenamiento que cubren 154 cohetes, con validacion sobre 45 filas (se omitieron las 3 mas largas). La innovacion practica no esta en la arquitectura sino en el formato de salida: el arbol OpenRocket se serializa como JSON con nodos `{tag: {attrs?, value?, children?}}`, y se incluye una gramatica GBNF (`design.gbnf`) que restringe la generacion al esquema `<thought>…</thought><design>{json}</design>` con JSON valido. El razonamiento se emite en el bloque `<thought>` del propio texto, no en el slot de thinking de Qwen, por lo que debe desactivarse el modo thinking nativo.

## Capacidades

- Generacion de texto tecnico con razonamiento explicito en `<thought>` sobre fuselaje, propulsion, estabilidad y recuperacion.
- Generacion de estructuras OpenRocket completas serializadas como JSON dentro de `<design>`, con nodos anidados (etapas, cono de proa, cuerpo, aletas, montaje de motor).
- Referencia a ficheros reales de motor mediante `motor_id` (por ejemplo, `AeroTech-K550W`), aunque con alta tasa de error segun la evaluacion del autor.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text, codificador de imagen en BF16-mmproj).
- Soporte de decodificacion restringida mediante gramatica GBNF en llama.cpp y llama-server.
- Distincion explicita entre resultados de vuelo de referencia almacenados y calculos estaticos, por instruccion del system prompt.
- Declaracion de datos faltantes y limites de seguridad, por instruccion del system prompt.
- No soporta tool calling ni uso de herramientas: el propio prompt indica que no debe afirmar haber ejecutado herramientas.

## Casos de uso

- Generacion asistida de disenos de cohetes de aficionado: dado un conjunto de requisitos de vuelo (altitud, motor, diametro), el modelo produce un arbol OpenRocket importable, lo que acelera el punto de partida de un diseno en lugar de construirlo manualmente en la GUI.
- Prototipado rapido de variantes: cambiar el montaje de motor o el diametro del cuerpo y regenerar el diseno completo, aprovechando que la salida es JSON estructurado y validable con la gramatica incluida.
- Canal de razonamiento auditable: el bloque `<thought>` documenta por que se eligio cada componente, util para revision de ingenieria o para docencia de diseno de cohetes.
- Integracion en pipelines con validacion estructural: el JSON de salida puede pasar por un validador de esquema antes de convertirse a `.ork`, de modo que los fallos detectados por el autor (por ejemplo, `simulations` fuera de la raiz) se filtren automaticamente.
- Extraccion de disenos desde lenguaje natural en herramientas de gestion de proyectos de coheteria: convertir una especificacion en texto a una estructura de datos que alimente un catalogo o una base de datos de disenos.
- Evaluacion de modelos verticales: caso de estudio de ajuste fino LoRA de bajo coste (una sola RTX 5080, 177 pasos) sobre un modelo de 4.600 millones de parametros para una tarea de dominio muy restringido.
- Generacion de documentacion tecnica: el razonamiento en `<thought>` puede reutilizarse como borrador de la memoria de diseno del cohete.

## Benchmarks y rendimiento

Evaluacion del autor sobre 48 prompts de validacion (16 cohetes no vistos en entrenamiento), con `sft/eval_test.py`, `--motor-lookup new_results/sft_v4_motor_lookup.json --max-tokens 16384`, gramatica activada, thinking desactivado y temperatura 0,7:

| Comprobacion | Este modelo | Respuestas de referencia |
|---|---|---|
| Respuesta terminada (sin bucle ni corte) | 46/48 | 48/48 |
| JSON de diseno valido | 46/48 | 48/48 |
| Arbol OpenRocket bien formado | 35/48 | 48/48 |
| Piezas en su sitio (etapa, proa, cuerpo, aletas, motor en montaje) | 32/48 | 48/48 |
| Paracaidas o cinta | 35/48 | 48/48 |
| Solo motores reales (`motor_id` en la tabla de busqueda) | 7/48 | 48/48 |
| Usa todos los motores pedidos en el prompt | 9/15 | 15/15 |

Longitud media de respuesta: 6.020 tokens. Si se puntua solo la parte `openrocket`, el arbol esta bien formado en 45/48 y tiene todas las piezas en su sitio en 41/48. De los 56 motores citados en las respuestas, 13 corresponden a un fichero real exacto, 15 nombran un motor real con `motor_id` incorrecto (sufijo `-v1`/`-v2` ausente o erroneo) y 28 nombran un motor inexistente (por ejemplo, H1650R). Los 63 prompts de test no se han ejecutado todavia.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parametros), mas overhead de contexto; con 17.000 tokens de contexto el consumo crece de forma notable por la cache KV.
- GGUF Q8_0: en torno a 5 GB de pesos; el autor recomienda esta cuantizacion frente a Q4_K_M, que rompio el JSON profundamente anidado en la version anterior.
- Cabe en GPU de consumo: el ajuste se entreno en una RTX 5080, y la inferencia Q8_0 es viable en GPUs de 8-12 GB, aunque con contexto de 17k conviene disponer de 16 GB o mas.
- GPUs de referencia para produccion: A100, H100 o L40S para servicio concurrente con contexto largo; RTX 4090/5080 para uso individual.
- Despliegue: llama.cpp y llama-server (soporta `--grammar-file`), LM Studio, Unsloth Studio, y transformers con `from_pretrained`. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia de coste, cada respuesta ronda los 6.020 tokens de media, con picos de 15.000, por lo que conviene reservar 16.384 tokens de salida.
- Parametros de muestreo obligatorios: temperatura 0,7, top-p 0,95, top-k 20, sin penalizacion de presencia ni de repeticion (rompe el JSON).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-rocketdata-v5 | 4.659.865.088 | no disponible (uso recomendado ≥17k) | Diseno OpenRocket en JSON | Apache 2.0 | Hugging Face, GGUF, LoRA |
| RocketData/Qwen3.5-4B-rocketdata | no disponible | no disponible | Diseno OpenRocket con esquema `flight`/`components` | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Modelo multimodal generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico. La diferencia principal frente al predecesor es el esquema de salida, no intercambiable entre ambos.

## Limitaciones y advertencias

- No es la version final: es la primera de dos semillas de entrenamiento y puede ser reemplazada por una segunda.
- Sin validacion fisica: ningun diseno se ha volado en OpenRocket. Las comprobaciones son estructurales (arbol valido, piezas en su sitio, motores reales) y las cifras de vuelo del razonamiento son del propio modelo.
- Fuga entre entrenamiento y validacion: la division es por fichero `.ork`, no por kit; 12 de los 48 prompts de validacion tienen un hermano en entrenamiento con distinto montaje de motor.
- Motores inventados: solo 7 de 48 respuestas usan exclusivamente motores reales; 28 de los 56 motores citados no existen. Se mitigaria con una gramatica que limite los `motor_id` a los 1.421 reales, aun no construida.
- Error estructural recurrente: en 8 respuestas `simulations` aparece como clave de nivel superior en lugar de dentro de `openrocket`.
- El entrenamiento uso solo 125 de los 1.421 ficheros de motor, lo que explica parte de los fallos de `motor_id`.
- Riesgo de bucle con temperaturas bajas; prohibido usar penalizacion de repeticion o presencia.
- El modo thinking de Qwen debe desactivarse: el razonamiento va en `<thought>`, no en el slot nativo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza seguridad de vuelo y el modelo no debe presentarse como sustituto de validacion ingenieril.
- Idiomas soportados no declarados; el system prompt y los datos estan en ingles.
- Sesgos conocidos: no disponibles mas alla de los fallos estructurales documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RocketData/Qwen3.5-4B-rocketdata-v5
- Modelo predecesor: https://huggingface.co/RocketData/Qwen3.5-4B-rocketdata
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de datos de entrenamiento: https://github.com/Phorceon/rocketdata (rama `sft-v5-data`)
