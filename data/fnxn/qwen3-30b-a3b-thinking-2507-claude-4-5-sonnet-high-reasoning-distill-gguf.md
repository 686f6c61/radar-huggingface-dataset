# Fnxn/Qwen3-30B-A3B-Thinking-2507-Claude-4.5-Sonnet-High-Reasoning-Distill-GGUF

## Resumen

Qwen3-30B-A3B-Thinking-2507-Claude-4.5-Sonnet-High-Reasoning-Distill es un ajuste fino por destilación del modelo Qwen3-30B-A3B-Thinking-2507 de Alibaba, entrenado por TeichAI sobre un conjunto de datos de razonamiento generado por Claude Sonnet 4.5 en su modo de razonamiento alto. El objetivo es transferir el estilo y la calidad de razonamiento del modelo propietario de Anthropic a un modelo abierto con arquitectura Mixture-of-Experts (MoE), de modo que pueda desplegarse en infraestructura propia. La versión publicada por el usuario Fnxn es una cuantización en formato GGUF del modelo de TeichAI, pensada para inferencia local con llama.cpp y derivados.

El modelo conserva la arquitectura qwen3_moe del original: 30.532 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que permite un coste de cómputo por token propio de un modelo de 3B pese a disponer de la capacidad representacional de uno de 30B. Está especializado en tareas de razonamiento explícito (modo thinking), con orientación declarada a programación y ciencia, y está publicado bajo licencia Apache 2.0.

Su relevancia radica en la combinación de tres factores: una licencia permisiva para uso comercial, una huella de inferencia contenida gracias al enrutamiento MoE, y un entrenamiento orientado a cadenas de razonamiento largas. El repo GGUF ocupa 201,2 GB en total, lo que refleja la presencia de múltiples niveles de cuantización en un mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | Aproximadamente 3 B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | TeichAI/Qwen3-30B-A3B-Thinking-2507-Claude-4.5-Sonnet-High-Reasoning-Distill |
| Modelo original de partida | unsloth/qwen3-30b-a3b-thinking-2507 |
| Dataset de destilacion | TeichAI/claude-sonnet-4.5-high-reasoning-250x |
| Tamano del repositorio | 201,2 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, identificado en los metadatos como `qwen3_moe`. El modelo totaliza 30.532 millones de parametros, de los cuales solo una fraccion (del orden de 3.000 millones, segun la nomenclatura A3B del nombre) se activa por token mediante el enrutador de expertos. Esta configuracion reduce el coste computacional y de memoria de inferencia respecto a un modelo denso del mismo tamano, manteniendo la capacidad del modelo completo. El modelo incorpora el modo de razonamiento explicito (thinking) caracteristico de la familia Qwen3-Thinking-2507, que genera cadenas de razonamiento antes de la respuesta final.

El entrenamiento es una destilacion supervisada sobre el dataset `TeichAI/claude-sonnet-4.5-high-reasoning-250x`, compuesto por trazas de razonamiento de alta effort generadas por Claude Sonnet 4.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre si se aplicaron fases de RLHF o DPO posteriores. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, con una aceleracion declarada de 2x respecto al entrenamiento estandar. La version de Fnxn es unicamente una conversion a GGUF del modelo de TeichAI, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto con razonamiento explicito en modo thinking, con cadenas de razonamiento previas a la respuesta.
- Programacion y generacion de codigo, area declarada explicitamente como caso de uso principal.
- Razonamiento cientifico y resolucion de problemas tecnicos, segundo caso de uso declarado por el autor.
- Conversacion multiturno (etiqueta `conversational` en los metadatos).
- Compatibilidad con endpoints de text-generation-inference segun los tags del repositorio.
- Capacidades multilingues limitadas: solo se declara ingles.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada, aunque el modo thinking es compatible con este tipo de flujos.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en asistentes de programacion o pipelines de revision de codigo, aprovechando su entrenamiento orientado a coding y su modo de razonamiento para explicar decisiones de diseno antes de emitir el parche.
- Resolucion de problemas cientificos y matematicos: util para asistencia en analisis de datos, derivacion de formulas o interpretacion de resultados experimentales, donde la cadena de razonamiento explicita permite auditar el proceso seguido por el modelo.
- Destilacion de estilo de razonamiento: sirve como generador de trazas de razonamiento de alta calidad para crear nuevos datasets de entrenamiento o para comparar estrategias de resolucion de problemas.
- Asistente tecnico de documentacion: puede redactar explicaciones tecnicas paso a paso y justificar cada afirmacion, lo que facilita la revision por parte de ingenieros.
- Despliegue local en estaciones de trabajo: al ser GGUF y MoE con 3B activos, puede ejecutarse en equipos con GPU de consumo o incluso en CPU, lo que lo hace adecuado para entornos con requisitos de privacidad y sin acceso a APIs externas.
- Evaluacion comparativa de destilaciones: permite medir hasta que punto un modelo abierto de 30B puede aproximarse al rendimiento de razonamiento de un modelo propietario, en el contexto de investigacion sobre destilacion.
- Prototipado de agentes de razonamiento: puede emplearse como motor de un agente que necesite descomponer tareas complejas en pasos, con la salvedad de que el soporte de tool calling no esta confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta, ya que la model card no detalla los niveles de cuantizacion incluidos. Como referencia orientativa, un modelo MoE de 30B totales en cuantizaciones de 4 bits suele requerir del orden de 16-20 GB de VRAM para cargar los pesos, aunque este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil del modelo (MoE con 3B activos), es plausible su ejecucion en GPUs de consumo de gama alta, pero no se confirma en la documentacion.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; tambien es compatible con text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Fnxn GGUF) | 30,5 B | ~3 B | no disponible | Apache 2.0 | GGUF |
| TeichAI/Qwen3-14B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF | 14 B | 14 B | no disponible | no disponible en la informacion | GGUF |
| TeichAI/Qwen3-8B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF | 8 B | 8 B | no disponible | no disponible en la informacion | GGUF |
| TeichAI/gpt-oss-20b-claude-4.5-sonnet-high-reasoning-distill-GGUF | 20 B | 3 B | no disponible | no disponible en la informacion | GGUF |

Los tres modelos comparables pertenecen al mismo autor y a la misma familia de destilaciones sobre trazas de Claude Sonnet 4.5, por lo que la eleccion entre ellos depende principalmente del presupuesto de hardware y del equilibrio entre parametros totales y activos. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar la calidad y no esta validado.
- Al ser una destilacion de trazas de un modelo propietario, puede reproducir sesgos y estilos de razonamiento del modelo original, incluidos posibles sesgos no documentados.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en dominios cientificos donde el modelo puede presentar razonamientos plausibles pero incorrectos; la cadena de razonamiento explicita no garantiza la veracidad de la conclusion.
- La licencia Apache 2.0 permite uso comercial, pero el origen de los datos de destilacion (generados por un modelo propietario) puede plantear cuestiones legales que el usuario debe evaluar por su cuenta.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide garantizar su comportamiento en tareas de contexto largo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de una publicacion reciente y sin validacion comunitaria.
- El tamano del repositorio (201,2 GB) sugiere la presencia de multiples cuantizaciones; conviene verificar los niveles disponibles antes de descargar.
- La model card no documenta el proceso de evaluacion ni las metricas de calidad de la destilacion.
- El soporte de tool calling y de flujos de agente no esta confirmado, por lo que no deberia asumirse en produccion sin pruebas previas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Fnxn/Qwen3-30B-A3B-Thinking-2507-Claude-4.5-Sonnet-High-Reasoning-Distill-GGUF
- Modelo base (TeichAI): https://huggingface.co/TeichAI/Qwen3-30B-A3B-Thinking-2507-Claude-4.5-Sonnet-High-Reasoning-Distill
- Modelo original de partida (Unsloth): https://huggingface.co/unsloth/qwen3-30b-a3b-thinking-2507
- Dataset de destilacion: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Modelo relacionado gpt-oss-20b: https://huggingface.co/TeichAI/gpt-oss-20b-claude-4.5-sonnet-high-reasoning-distill-GGUF
- Modelo relacionado Qwen3-14B: https://huggingface.co/TeichAI/Qwen3-14B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF
- Modelo relacionado Qwen3-8B: https://huggingface.co/TeichAI/Qwen3-8B-Claude-Sonnet-4.5-Reasoning-Distill-GGUF
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
