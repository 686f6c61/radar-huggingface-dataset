# mradermacher/Qwen3.8-9B-Distill-uncensored-heretic-i1-GGUF

## Resumen

El modelo `Qwen3.8-9B-Distill-uncensored-heretic-i1-GGUF` es una cuantización en formato GGUF con matriz de importancia (imatrix) del modelo `nurdich/Qwen3.8-9B-Distill-uncensored-heretic`, preparada por el usuario mradermacher. El modelo base es una destilación de Qwen3.5-9B sobre la que se ha aplicado una técnica de ablación de censura denominada "heretic", que busca eliminar de forma mínima las restricciones de contenido del modelo original. Según la información disponible, el proceso combina destilación, ajuste supervisado (SFT) y posiblemente otros métodos de alineación, manteniendo capacidades de razonamiento y function calling.

Esta ficha se centra en la versión cuantizada i1-GGUF, que ofrece varios niveles de compresión (desde Q2_K hasta Q4_K_S) para facilitar su ejecución en hardware de consumo. El modelo está pensado para desarrolladores que necesitan un LLM local sin filtros de contenido, con un tamaño de aproximadamente 9 200 millones de parámetros y licencia Apache 2.0. La relevancia actual radica en la demanda creciente de modelos "uncensored" para aplicaciones creativas, roleplay o investigación, sin renunciar a un rendimiento razonable en tareas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, basado en Qwen3.5) |
| Parametros totales | 9 197 093 888 (aprox. 9,2 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (tambien archivo imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles oficiales sobre la arquitectura interna del modelo base. Por los tags y el nombre, se trata de una destilacion de Qwen3.5-9B, probablemente una variante del transformer con atencion completa. El termino "heretic" sugiere un proceso de ablacion de censura automatizado, que busca el ajuste minimo necesario para eliminar las negativas del modelo sin degradar sus capacidades generales. El entrenamiento incluye ajuste supervisado (SFT) y posiblemente optimizacion por preferencias (DPO o similar), aunque no se han publicado detalles concretos sobre el dataset, el numero de tokens o las tecnicas exactas. La cuantizacion i1-GGUF aplica una matriz de importancia (imatrix) para mejorar la calidad de los quants de baja precision.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y resolucion de problemas, heredado de la familia Qwen3.5.
- Soporte de function calling / tool calling (indicado en los tags).
- Capacidad de seguir instrucciones complejas gracias al ajuste supervisado.
- Ausencia de filtros de contenido (uncensored), lo que permite generar texto sobre temas que otros modelos rechazarian.
- Posible soporte de vision (el README menciona que es un modelo de vision, pero los archivos mmproj estarian en el repositorio estatico; no se confirma su disponibilidad en esta version).

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede redactar ficcion, guiones o dialogos con tematicas adultas o controvertidas sin rechazar la peticion, gracias a la ablacion de censura.
- Roleplay y juegos de texto: su capacidad conversacional y su falta de filtros lo hacen util para experiencias de rol inmersivas en entornos locales.
- Generacion de contenido para novelas o relatos: autores que necesitan explorar escenas violentas, eroticas o moralmente ambiguas pueden usarlo como asistente de escritura.
- Desarrollo de chatbots especializados: integrable en aplicaciones de atencion al cliente o asistentes virtuales donde se requiera un tono directo y sin evasivas.
- Investigacion sobre alineacion y censura: util para estudiar los efectos de la ablacion de censura en modelos de lenguaje, comparando respuestas con la version original.
- Prototipado rapido de agentes con function calling: su soporte de tool calling permite construir agentes que interactuan con APIs o bases de datos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La calidad de los quants puede estimarse por las notas de mradermacher: el tipo i1-Q4_K_S se describe como "tamano/velocidad/calidad optimo", mientras que i1-Q2_K es el mas comprimido y probablemente el de menor fidelidad.

## Requisitos de hardware

- VRAM estimada: el quant i1-Q4_K_S ocupa 5,6 GB, por lo que cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). El quant i1-Q2_K (4,0 GB) puede ejecutarse en GPUs de 6 GB, aunque con mayor perdida de calidad.
- GPU recomendadas: cualquier tarjeta NVIDIA con al menos 8 GB de VRAM y soporte CUDA, o GPUs AMD con ROCm. Para uso en CPU, se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, kobold.cpp y otros motores que soporten este formato. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 3090 o 4090, un modelo de 9B cuantizado a Q4 suele generar entre 30 y 60 tokens por segundo, dependiendo de la implementacion y el tamaño de contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con alternativas de la misma categoria (modelos uncensored de ~9B). Modelos como Dolphin 2.x (basados en Mistral o Llama) o WizardLM-Uncensored podrian ser comparables, pero no hay datos de rendimiento ni de calidad de la ablacion de censura en la informacion proporcionada. Se recomienda evaluar directamente el modelo en las tareas objetivo.

## Limitaciones y advertencias

- Sesgos desconocidos: al ser una ablacion de censura, el modelo puede mostrar sesgos no mitigados o comportamientos inapropiados en contextos sensibles.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en temas especializados.
- Idioma: solo se ha confirmado soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Calidad de la cuantizacion: los quants de baja precision (Q2_K, IQ3_M) pueden degradar notablemente la coherencia y el razonamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- Sin garantia de "uncensored" completo: la ablacion puede no eliminar todas las negativas, y el modelo podria seguir rechazando ciertas peticiones.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-uncensored-heretic-i1-GGUF
- Modelo base original: https://huggingface.co/nurdich/Qwen3.8-9B-Distill-uncensored-heretic
- Repositorio de quants estaticos (sin imatrix): https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-uncensored-heretic-GGUF
- Pagina de mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de quants de TheBloke (referencia para uso de GGUF): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
