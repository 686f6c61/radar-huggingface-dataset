# solitariusai/solita-plankton-9m-it-gguf

## Resumen

Solita Plankton 9M-IT es un modelo de generacion de texto en tailandes de tamano muy reducido, desarrollado por solitariusai. A pesar del "9M" de su nombre comercial, los pesos en safetensors suman 12.752.608 parametros (aproximadamente 12,75 millones), lo que lo situa en la categoria de modelos enanos, disenados para ejecutarse en hardware muy limitado o incluso en CPU. Se distribuye como modelo conversacional afinado por instrucciones (IT) a partir de una base del mismo autor.

Esta ficha corresponde concretamente al repositorio de cuantizaciones GGUF del modelo, publicado el 25 de noviembre de 2026, que incluye cuatro variantes (F32, F16, Q8_0 y Q4_K_M) junto con el tokenizador BPE a nivel de byte y la plantilla de chat en tailandes. El modelo base es `solitariusai/solita-plankton-9m-it` y la licencia es Apache 2.0.

Su relevancia es acotada pero concreta: ofrece un punto de partida experimental para experimentar con generacion de texto en tailandes en entornos con recursos minimos (Ollama, llama.cpp), y sirve como referencia de como se comporta la cuantizacion en modelos de menos de 15 millones de parametros. El propio autor lo califica de experimental y advierte de que las respuestas pueden ser repetitivas o incoherentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); incluye tabla de embeddings posicionales en F32 |
| Parametros totales | 12.752.608 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el ejemplo de llama.cpp usa `-c 2048` |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K_M |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer con tokenizador BPE a nivel de byte y una tabla de embeddings posicionales que se mantiene en F32 en todas las variantes GGUF. El modelo base es un ajuste por instrucciones (IT) sobre una base del mismo autor, con una plantilla de chat y un system prompt en tailandes utilizados durante el entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El detalle tecnico mas relevante del repositorio es el proceso de cuantizacion: en las variantes cuantizadas se conservan seis tensores de proyeccion descendente de la red feed-forward en F16, porque su anchura de fila (1.104) no se alinea con los tamanos de bloque de cuantizacion. El autor documenta ademas una prueba de humo con cinco prompts en llama.cpp: F16 coincide con las predicciones greedy de F32, Q8_0 coincide en la mayoria y Q4_K_M diverge sustancialmente, lo que sugiere que las cuantizaciones agresivas degradan de forma notable un modelo de este tamano.

## Capacidades

- Generacion de texto conversacional en tailandes, con plantilla de chat y system prompt incluidos.
- Ajuste por instrucciones (IT): responde a indicaciones en formato de conversacion.
- Tokenizacion BPE a nivel de byte, adecuada para texto tailandes sin segmentacion previa.
- Inferencia en CPU y en hardware de muy bajos recursos gracias a su tamano (24-52 MB segun variante).
- Compatibilidad con Ollama y llama.cpp (con soporte de `-cnv` para modo conversacional).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito ni capacidades multilingues mas alla del tailandes.

## Casos de uso

- Pruebas de humo de pipelines de inferencia: sirve para validar un flujo completo de Ollama o llama.cpp (descarga, plantilla de chat, generacion) con un artefacto de apenas decenas de MB antes de desplegar modelos mayores.
- Experimentacion con cuantizacion en modelos enanos: permite reproducir el estudio del autor sobre la divergencia entre F16, Q8_0 y Q4_K_M en un modelo de 12,75 M de parametros, util para calibrar expectativas en modelos mayores.
- Generacion de texto tailandes en dispositivos embebidos o entornos sin GPU: los 24,2 MB de la variante Q4_K_M o los 33,7 MB de F16 caben en memoria de sistemas muy limitados y se ejecutan en CPU.
- Docencia y demostraciones de LLM: un modelo de este tamano permite explicar tokenizacion, plantillas de chat y decodificacion greedy en un portatil sin acelerador, aunque con la advertencia de que las respuestas pueden ser repetitivas.
- Prototipado de interfaces conversacionales en tailandes: para validar la integracion de la UI, el manejo de turnos y el formateo de mensajes sin coste de inferencia significativo.
- Benchmarking de infraestructura: medir latencia y consumo de memoria de llama.cpp u Ollama con un modelo minimo, aislando el coste del runtime del coste del modelo.
- Filtrado o clasificacion ligera de texto tailandes en etapas de preprocesado, siempre que se valide la calidad de salida, dado el caracter experimental del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la prueba de humo cualitativa del autor con cinco prompts en llama.cpp: F16 coincide con F32 en predicciones greedy, Q8_0 en la mayoria y Q4_K_M diverge sustancialmente.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; los pesos ocupan 52,0 MB (F32), 33,7 MB (F16), 26,7 MB (Q8_0) y 24,2 MB (Q4_K_M), a los que se suma la cache KV y el overhead del runtime.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060 o integradas) puede alojarlo, pero el cuello de botella sera el runtime, no la memoria.
- Cabe en cualquier GPU consumer y en CPU; es apto para Raspberry Pi y sistemas embebidos con suficiente RAM para el runtime.
- Opciones de despliegue: llama.cpp (`llama-cli` con `-cnv`), Ollama (`ollama pull hf.co/solitariusai/solita-plankton-9m-it-gguf:F16`) y cualquier runtime compatible con GGUF. El ejemplo del autor usa `--flash-attn off` y cache K/V en F32.
- Latencia y throughput: no disponibles. El ejemplo de llama.cpp limita la generacion a `-n 64` tokens y el contexto a 2048, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos conversacionales en tailandes de menos de 15 millones de parametros) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo experimental segun el propio autor: las respuestas pueden ser repetitivas o incoherentes.
- La variante Q4_K_M diverge sustancialmente de F32 en la prueba de humo; para calidad de referencia conviene usar F16 o F32.
- Solo soporta tailandes; no hay evidencia de capacidades multilingues.
- Longitud de contexto no documentada; el ejemplo oficial usa 2048 tokens, lo que limita conversaciones largas.
- Con 12,75 M de parametros, la capacidad de razonamiento, el conocimiento factual y el seguimiento de instrucciones complejas son muy limitados; el riesgo de alucinacion es alto.
- No se documentan sesgos especificos, pero al entrenarse solo en tailandes puede reflejar sesgos del corpus utilizado, no disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias y el modelo no es adecuado para produccion sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf
- Modelo base: https://huggingface.co/solitariusai/solita-plankton-9m-it
- Licencia: https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf/blob/main/LICENSE
- Variantes: [F32](https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf/blob/main/solita-plankton-9m-it-f32.gguf), [F16](https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf/blob/main/solita-plankton-9m-it-f16.gguf), [Q8_0](https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf/blob/main/solita-plankton-9m-it-q8_0.gguf), [Q4_K_M](https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf/blob/main/solita-plankton-9m-it-q4_k_m.gguf)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
