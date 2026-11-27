# nokeepai/Inkling-2-Mini-Honed

## Resumen

Inkling-2-Mini-Honed es un ajuste fino (finetune) del modelo multimodal Thinking Machines Inkling-2-Mini, publicado por el usuario nokeepai bajo licencia Apache 2.0. El modelo base es un transformer con arquitectura MoE (mezcla de expertos) de aproximadamente 26.400 millones de parametros totales, orientado a tareas de razonamiento, generacion de codigo y comprension de imagen y texto. La intervencion consiste en un adaptador LoRA fusionado en los pesos que modifica el comportamiento del modelo en dos frentes: reduce el numero de tokens de razonamiento (thinking) y evita que el modelo se quede bloqueado en tareas de depuracion multi-paso sin llegar a escribir codigo.

El objetivo declarado es corregir un problema de sobre-razonamiento del modelo original: en tareas de depuracion, el modelo base tiende a consumir turnos enteros pensando sin producir codigo. Segun la model card, el ajuste elimina ese bloqueo (de 86,2 % de turnos estancados a 0,0 %) y reduce el numero medio de tokens por tarea de depuracion de 23.920 a 2.766, con un coste medido en la puntuacion de entrega en solicitudes sensibles (-1,3 puntos porcentuales) y un posible descenso no confirmado en MBPP.

Es relevante para desarrolladores que necesiten un modelo multimodal de tamano medio con comportamiento mas predecible en agentes y pipelines de codigo, ya que mantiene la misma arquitectura, tokenizer y plantilla de chat que el modelo base, lo que facilita el reemplazo directo. El repositorio incluye pesos en safetensors (20,2 GB), una version GGUF para llama.cpp y Ollama, y el adaptador LoRA por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el tag `moe` de la model card; detalles de capas y expertos no disponibles |
| Parametros totales | 26.388.646.440 (26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `modelopt`); GGUF disponible en repositorio separado; otros formatos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte; LoRA en repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Thinking Machines Inkling-2-Mini: un transformer con mezcla de expertos, tag `inkling2_loop` en Hugging Face y pipeline `image-text-to-text`, lo que indica capacidad multimodal de entrada de imagen y texto. No se dispone de informacion sobre el numero de capas, el numero de expertos, la dimension oculta ni la longitud de contexto en la informacion proporcionada.

El ajuste se realizo mediante un adaptador LoRA de rango 32 aplicado a las capas de atencion y a las capas de expertos, entrenado con aprendizaje por refuerzo sobre tareas sinteticas de laboratorio consideradas inofensivas. Los hiperparametros declarados son: 60 pasos, 32 prompts por paso con 8 muestras cada uno, tasa de aprendizaje 5e-5, thinking desactivado en el 25 % de las muestras y esfuerzo de razonamiento entre 0,5 y 0,9. Se usaron 619 respuestas ancla (las mejores de 8 del propio modelo base) como referencia. El adaptador se fusiono posteriormente en los pesos, por lo que el resultado es un modelo denso en terminos de despliegue (sin adaptador separado en los pesos publicados). No se especifica el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento con modo thinking configurable mediante el parametro `reasoning_effort` (valor recomendado 0,9).
- Generacion y depuracion de codigo: el ajuste esta disenado especificamente para que el modelo complete tareas de debugging multi-paso escribiendo codigo en lugar de quedarse pensando.
- Razonamiento matematico: resultados en GSM8K y MATH-500 reportados en la model card.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Seguimiento de instrucciones de system prompt largos: segun la model card, la retencion de todas las reglas de un system prompt largo pasa de 112/160 (70,0 %) en el modelo base a 148/160 (92,5 %) con el ajuste.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: el modelo esta orientado a ello (tareas de depuracion multi-paso), pero no se detalla soporte formal de frameworks de agentes.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Depuracion automatizada de codigo en agentes: el modelo esta optimizado para no estancarse en turnos de razonamiento sin producir codigo (0,0 % de turnos estancados frente a 86,2 % del base) y para consumir muchos menos tokens por tarea (2.766 frente a 23.920), lo que lo hace adecuado para bucles de agente con presupuesto de tokens limitado.
- Generacion de codigo en pipelines de CI/CD: con un rendimiento del 97,1 % en HumanEval + MBPP y del 94,9 % en HumanEvalFix + QuixBugs, puede integrarse en tareas de generacion de parches y correccion de bugs, siempre que el pipeline sea en ingles.
- Asistente de razonamiento matematico: con un 95,3 % de acierto numerico en GSM8K + MATH-500, es util para resolver y verificar problemas aritmeticos y de nivel escolar-competicion en herramientas educativas o de analisis.
- Atencion al cliente automatizada en ingles: el modelo mantiene mejor los system prompts largos (92,5 % de reglas retenidas), lo que reduce el riesgo de que ignore restricciones de negocio en conversaciones multi-turno; la longitud de contexto no esta documentada, por lo que debe validarse antes de desplegar.
- Procesamiento de documentos con imagen: al ser un modelo image-text-to-text, puede emplearse para extraer y razonar sobre informacion de capturas, diagramas o documentos escaneados en ingles.
- Sustitucion directa del modelo base en produccion: al conservar arquitectura, tokenizer y plantilla de chat, permite reemplazar Inkling-2-Mini sin cambios en el codigo de integracion, con la ventaja de menor latencia (119,9 s a 49,0 s por respuesta con 31 peticiones en vuelo) y menor coste de inferencia por tokens de pensamiento.
- Despliegue en local con cuantizacion: la disponibilidad de GGUF y de pesos en 8 bits permite ejecutarlo en entornos con VRAM limitada mediante llama.cpp, LM Studio u Ollama.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las diferencias son Honed menos el modelo base sobre los mismos items; los corchetes son intervalos de confianza al 95 %.

| Familia | Benchmarks | n | Base | Honed | Diferencia (puntos) |
|---|---|---|---|---|---|
| Codigo | HumanEval + MBPP | 421 | 97,9 % [96,0; 98,9] | 97,1 % [95,1; 98,4] | -0,7 [-2,1; +0,7] |
| Correccion de bugs | HumanEvalFix + QuixBugs | 195 | 96,4 % [92,8; 98,2] | 94,9 % [90,8; 97,2] | -1,5 [-4,1; +1,0] |
| Matematicas, numero correcto | GSM8K + MATH-500 | 1.819 | 95,3 % [94,2; 96,2] | 95,3 % [94,2; 96,2] | +0,0 [-0,7; +0,7] |
| Matematicas, formato estricto | GSM8K + MATH-500 | 1.819 | 74,1 % [72,0; 76,1] | 89,3 % [87,8; 90,6] | +15,2 [+13,4; +17,0] |
| Conocimiento | MMLU (2.000) + muestra de laboratorio (400) | 2.338 | 89,3 % [88,0; 90,5] | 89,1 % [87,8; 90,3] | -0,2 [-1,2; +0,8] |

Metricas de comportamiento (mismas condiciones: esfuerzo 0,9, temperatura 0,6, top_p 1,0, limite de thinking 4.096 tokens, limite de respuesta 8.192 tokens, semilla 1234):

| Metrica | n | Base | Honed |
|---|---|---|---|
| Tareas de depuracion resueltas | 15 tareas | 80,0 % [54,8; 93,0] | 100,0 % [79,6; 100,0] |
| Turnos de depuracion estancados | 87 / 18 turnos | 86,2 % | 0,0 % |
| Tokens por tarea de depuracion (media) | 15 tareas | 23.920 | 2.766 |
| Tokens de pensamiento medianos, prompts cotidianos | 100 prompts | 318 | 174 |
| Puntuacion de entrega en solicitudes sensibles | 1.100 preguntas | 35,9 % [34,0; 37,7] | 34,6 % [32,8; 36,4] (cambio pareado -1,3 [-2,1; -0,4]) |

Resultados adicionales con multiples semillas: HumanEvalFix, 3 semillas agrupadas, +0,4 [-0,6; +1,6] (no inferior); MBPP, 3 semillas agrupadas, -1,2 [-2,5; +0,1] (no concluyente; en el servicio Tinker el mismo benchmark dio +1,6 [+0,4; +3,1]). Ejecuciones unicas sin margen demostrado: HumanEval -1,2 [-3,0; +0,0] (n=164) y QuixBugs +0,0 [-9,7; +9,7] (n=31).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (26,4 mil millones de parametros): en 8 bits, en torno a 26-28 GB; en 4 bits (GGUF), en torno a 14-16 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar A100 40/80 GB, H100 y GPUs de 24 GB o mas con cuantizacion agresiva; no confirmado por el autor.
- GPU de consumo: probablemente ejecutable en RTX 4090 (24 GB) con cuantizacion de 4 bits mediante GGUF; no confirmado.
- Opciones de despliegue: Transformers, SGLang y vLLM (pesos safetensors); llama.cpp, LM Studio y Ollama (GGUF); endpoints compatibles segun tags.
- Latencia y throughput: la model card reporta un tiempo medio por respuesta de 119,9 s a 49,0 s (base frente a Honed) en el mismo servidor con 31 peticiones en vuelo. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Honed | 26,4 mil millones | no disponible | Apache 2.0 | Si (imagen-texto) | Finetune de Inkling-2-Mini; reduce thinking y estancamientos |
| Thinking Machines Inkling-2-Mini (base) | 26,4 mil millones | no disponible | no disponible en la informacion | Si (imagen-texto) | Modelo original; mas tokens de pensamiento y estancamientos en debugging |
| Alternativas de tamano similar (p. ej. modelos MoE de ~25-30B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de benchmarks de terceros ni de comparaciones con otros modelos en la informacion suministrada; la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte multilingue.
- La puntuacion de entrega en solicitudes sensibles baja 1,3 puntos porcentuales respecto al base, con la perdida concentrada en los dos niveles de severidad mas leves; las respuestas son un 6 % mas cortas. No es un modelo sin censura, pero el ajuste no se entreno para rechazar solicitudes sensibles y el comportamiento en ese terreno debe evaluarse antes de desplegar.
- Posible regresion en MBPP (-1,2 puntos, intervalo [-2,5; +0,1] con 3 semillas): no se puede descartar un descenso en generacion de codigo basico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo de lenguaje, puede generar contenido incorrecto, especialmente en conocimiento factual (MMLU 89,1 %).
- Longitud de contexto no documentada: no es posible garantizar el rendimiento en conversaciones o documentos largos sin validacion previa.
- Numero de parametros activos y configuracion MoE no disponibles: dificulta estimar coste real de inferencia y planificar hardware.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado; la model card no detalla obligaciones adicionales.
- El ajuste se entreno con RL sobre tareas sinteticas inofensivas; no hay garantia de que el comportamiento se generalice fuera de esos dominios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed
- GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed-GGUF
- LoRA y script de fusion: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed-LoRA
- Codigo, resultados por item e informes: https://github.com/nokeepai/inkling-2-mini-unbound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
