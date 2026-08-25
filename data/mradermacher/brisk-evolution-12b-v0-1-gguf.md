# mradermacher/Brisk-Evolution-12B-v0.1-GGUF

## Resumen

Brisk-Evolution-12B-v0.1 es un modelo de lenguaje de 12 000 millones de parametros desarrollado por ReadyArt, especializado en roleplay, escritura creativa y conversacion sin restricciones. El repositorio analizado corresponde a la version cuantizada en formato GGUF preparada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con este formato.

El modelo se distribuye bajo licencia llama3.1 y esta pensado para casos de uso donde se prioriza la libertad creativa y la interaccion con contenido explicito, sin alineacion de seguridad. Su relevancia radica en que ofrece una alternativa de tamano medio (12B) para tareas de roleplay y generacion de narrativa, con multiples opciones de cuantizacion que van desde 4,7 GB hasta 12,8 GB, lo que facilita su despliegue en una amplia gama de hardware.

La informacion disponible no incluye detalles sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, por lo que esta ficha se basa principalmente en los datos del repositorio GGUF y la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11 956 539 456 (11,96 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo base ReadyArt/Brisk-Evolution-12B-v0.1. Dado el nombre y el tamano, es probable que se trate de un transformer denso basado en la arquitectura Llama 3.1, pero este dato no se confirma en la documentacion disponible.

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF, DPO u otras. Los tags de la model card indican que el modelo es "unaligned" y "dangerous", lo que sugiere que no se aplicaron procesos de alineacion de seguridad o que estos fueron deliberadamente omitidos para preservar la libertad creativa en contextos de roleplay.

## Capacidades

- Generacion de texto libre y conversacional en ingles.
- Roleplay multi-turno con personajes y escenarios variados.
- Escritura creativa, incluyendo narrativa explicita y contenido para adultos (ERP).
- Interaccion sin filtros de seguridad ni restricciones de contenido.
- Conversacion general y generacion de respuestas contextuales.
- No se ha confirmado soporte para tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado para mantener personajes y tramas a lo largo de conversaciones multi-turno, lo que lo hace adecuado para juegos de rol por texto, chats con personajes ficticios o simulaciones narrativas.
- Escritura de ficcion explicita: autores y creadores de contenido pueden usarlo para generar borradores de narrativa adulta, dialogos o escenas con un tono natural y sin restricciones tematicas.
- Prototipado de chatbots sin censura: desarrolladores que necesitan probar sistemas conversacionales sin capas de moderacion pueden integrar este modelo en entornos de desarrollo locales mediante GGUF.
- Generacion de dialogos para guiones: util para escribir guiones de teatro, cine o videojuegos donde se requiera un dialogo fluido y sin autocensura.
- Experimentacion con modelos no alineados: investigadores interesados en estudiar el comportamiento de modelos sin alineacion de seguridad pueden usarlo como caso de estudio.
- Asistente de escritura creativa: puede servir como herramienta de brainstorming para superar bloqueos creativos, generando continuaciones de historias o alternativas de trama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,7 GB (Q2_K) y 12,8 GB (Q8_0), segun la cuantizacion elegida.
- GPU recomendadas: para las cuantizaciones mas pequeñas (Q2_K, Q3_K), una GPU con 6-8 GB de VRAM es suficiente. Para Q4_K_M (7,4 GB) se recomienda una GPU con 10-12 GB. Para Q8_0 (12,8 GB) se necesita una GPU con 16 GB o mas.
- Compatibilidad con hardware de consumo: si, las cuantizaciones Q4_K_M y menores caben en GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 40-60 tokens por segundo, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El modelo comparte tamano con otras opciones de 12B-13B como Llama 3.1 8B, Mistral 7B o Nous Hermes 2 11B, pero no hay datos de rendimiento publicados para Brisk-Evolution-12B-v0.1 que permitan una comparacion objetiva. La principal diferencia es su naturaleza no alineada y su enfoque en roleplay explicito, lo que lo situa en una categoria distinta a la de los modelos generalistas.

## Limitaciones y advertencias

- El modelo no esta alineado y puede generar contenido ofensivo, peligroso, ilegal o danino. Su uso en produccion con usuarios reales requiere capas adicionales de moderacion.
- Riesgo elevado de alucinaciones, especialmente en tareas factuales o tecnicas, ya que no se ha optimizado para precision.
- Solo soporta ingles. No se recomienda su uso en otros idiomas.
- La licencia llama3.1 permite uso comercial, pero el modelo incluye tags de "Other License" y "dangerous" que pueden generar problemas legales o de reputacion en entornos empresariales.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- El repositorio GGUF no incluye informacion sobre el proceso de cuantizacion (si se uso imatrix o no), aunque el autor menciona que existen versiones con imatrix en un repositorio separado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Brisk-Evolution-12B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Brisk-Evolution-12B-v0.1
- Version con imatrix: https://huggingface.co/mradermacher/Brisk-Evolution-12B-v0.1-i1-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
