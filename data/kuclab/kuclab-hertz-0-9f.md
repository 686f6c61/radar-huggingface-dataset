# KucLab/kuclab-hertz-0.9f

## Resumen

KucLab Hertz 0.9F es un ajuste fino supervisado del modelo base Qwen/Qwen3.5-9B, desarrollado por KucLab como asistente conversacional especializado en disciplinas STEM (fisica, quimica, biologia y matematicas) y programacion, con soporte nativo para checo e ingles. Se presenta como la continuacion de Hertz 0.9 y reutiliza la misma receta de entrenamiento (QLoRA) sobre un corpus propio denominado `kuclab_hertz_0.9f`.

El modelo cuenta con aproximadamente 8.950 millones de parametros (8.953.803.264 segun los pesos en safetensors) y esta pensado para desplegarse en entornos con recursos moderados: se publica en formato GGUF q4_k_m de unos 5,3 GB, ademas de los pesos completos en bf16 y el adaptador LoRA. La ventana de contexto declarada es de 32.768 tokens, lo que permite manejar documentos tecnicos largos y conversaciones multi-turno extensas.

Su relevancia actual reside en dos factores: por un lado, ofrece una alternativa ligera y local para tareas cientificas y de codigo en un idioma de bajos recursos como el checo, poco cubierto por los modelos generalistas; por otro, hereda la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial sin las restricciones tipicas de otras licencias comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen/Qwen3.5-9B (detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Longitud de contexto | 32768 tokens (`num_ctx`) |
| Tipos de cuantizacion | GGUF q4_k_m noMTP (~5,3 GB); bf16 (pesos completos); adaptador LoRA en 4-bit |
| Idiomas soportados | Checo (cs) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 y adaptador LoRA) y GGUF (q4_k_m) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen/Qwen3.5-9B, un modelo de la familia Qwen 3.5 con aproximadamente 9.000 millones de parametros. No se detalla en la informacion disponible si se trata de un transformer denso o de una variante con mezcla de expertos, ni se especifican innovaciones de atencion, por lo que esos aspectos quedan como no disponibles. KucLab no modifica la arquitectura: aplica un ajuste fino supervisado sobre el modelo base y posteriormente fusiona el adaptador.

El entrenamiento se realizo mediante QLoRA con rango r=16 y alpha=32, cuantizacion a 4-bit y 2 epocas, sobre el corpus `kuclab_hertz_0.9f` en formato alpaca, con fecha de entrenamiento 2026-09-13. El adaptador resultante se fusiono a bf16 y despues se cuantizo a GGUF q4_k_m. Las etiquetas del repositorio incluyen terminos como `distillation` y `distilled`, lo que sugiere que el corpus de entrenamiento podria haberse generado a partir de un modelo profesor de mayor tamano, aunque este extremo no se confirma en la model card. No se menciona el uso de RLHF ni de DPO en el proceso.

## Capacidades

- Generacion de texto conversacional en checo e ingles.
- Razonamiento y resolucion de problemas de fisica, quimica, biologia y matematicas.
- Generacion y asistencia en tareas de programacion.
- Conversacion multi-turno con contexto de hasta 32.768 tokens.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a estudiantes de secundaria y universidad en asignaturas STEM: el modelo responde en checo o ingles a preguntas de fisica, quimica, biologia y matematicas, lo que lo hace util como tutor bilingue en centros educativos checos.
- Resolucion de problemas matematicos paso a paso: gracias a su ajuste en matematicas puede desglosar ejercicios y explicar el procedimiento, adecuado para plataformas de aprendizaje interactivo.
- Generacion de codigo y explicacion de fragmentos: util como asistente de programacion integrado en editores, con soporte de contexto largo para analizar varios ficheros.
- Apoyo a la investigacion cientifica: puede resumir y razonar sobre abstracts y notas tecnicas de hasta 32.768 tokens en fisica, quimica o biologia, lo que permite procesar articulos completos en una sola pasada.
- Traduccion tecnica checo-ingles: al estar entrenado en ambos idiomas con terminologia cientifica, sirve para traducir documentacion tecnica manteniendo la precision terminologica.
- Despliegue local en equipos de desarrollo: al publicarse en GGUF q4_k_m de 5,3 GB, puede ejecutarse en portatiles con GPU de gama media o incluso en CPU mediante Ollama, sin dependencia de servicios en la nube.
- Chatbot especializado para soporte tecnico en empresas checas: el modelo mantiene conversaciones multi-turno y responde en la lengua del usuario, adecuado para atencion en dominios cientificos o de ingenieria.
- Preprocesamiento y clasificacion de documentacion cientifica: puede extraer y estructurar informacion de articulos largos dentro de su ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos):
  - GGUF q4_k_m: aproximadamente 6-7 GB con contexto moderado; el fichero pesa ~5,3 GB.
  - GGUF q8_0: aproximadamente 10-11 GB.
  - bf16: aproximadamente 18-20 GB solo para pesos; con contexto completo de 32.768 tokens puede superar los 22-24 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB o superior para q4_k_m; RTX 4090 / RTX 3090 (24 GB) para bf16; A100 40/80 GB o H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si. Un modelo de ~9B en q4_k_m entra en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3070, RTX 4060 Ti), y en GPUs con 12 GB o mas se puede ampliar el contexto.
- Opciones de despliegue: Ollama (se incluye un `Modelfile` en el repositorio), llama.cpp, LM Studio, vLLM y TGI para las variantes safetensors en bf16.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kuclab-hertz-0.9f | ~9B | 32768 | Apache 2.0 | safetensors + GGUF | Ajuste STEM checo/ingles sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | ~9B | no disponible | Apache 2.0 | safetensors y variantes | Modelo base; mayor cobertura multilingue generalista |
| Llama 3.1 8B | 8B | 128000 | Llama 3.1 Community License | safetensors + GGUF | Referencia generalista de tamano similar; sin especializacion STEM checa |
| Gemma 2 9B | 9B | 8192 | Gemma Terms of Use | safetensors + GGUF | Alternativa de tamano similar; contexto mas corto |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada. Al entrenarse con un corpus propio de composicion desconocida, puede heredar sesgos de dicho dataset y del modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo de ~9B, puede producir respuestas plausibles pero incorrectas, especialmente en razonamiento cientifico avanzado o calculos matematicos complejos; conviene verificar los resultados.
- Limitaciones de contexto e idioma: la ventana declarada es de 32.768 tokens y los idiomas soportados se limitan a checo e ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Ambito restringido: esta especializado en STEM y programacion, por lo que su desempeño en dominios ajenos (derecho, humanidades, etc.) puede ser inferior al del modelo base.
- Restricciones de licencia: licencia Apache 2.0, lo que permite uso comercial; no obstante, se hereda del modelo base Qwen/Qwen3.5-9B y conviene revisar las condiciones de este.
- Trazabilidad limitada: no se documenta la composicion del corpus `kuclab_hertz_0.9f` ni si los datos proceden de destilacion de otro modelo, lo que dificulta evaluar procedencia y posibles sesgos.
- Uso en produccion: al no haber benchmarks publicados, se recomienda evaluar el modelo con un conjunto de validacion propio antes de desplegarlo en tareas criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.9f
- Dataset de entrenamiento: https://huggingface.co/datasets/KucLab/kuclab_hertz_0.9f
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio de KucLab: https://kuclab.org
