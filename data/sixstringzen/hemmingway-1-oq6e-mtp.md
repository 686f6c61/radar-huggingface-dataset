# sixstringzen/Hemmingway-1-oQ6e-mtp

## Resumen

Hemmingway-1-oQ6e-mtp es una cuantización de 6 bits del modelo Altworld/Hemmingway-1, publicada por el usuario sixstringzen y orientada a inferencia local en Apple silicon mediante MLX y oMLX. Se trata de un derivado, no de un entrenamiento nuevo: el repositorio contiene pesos convertidos (cinco shards de safetensors MLX) más un informe de cuantización, y conserva los tensores de predicción multi-token (MTP) del modelo original. El recuento real de parámetros en safetensors es de 27.320.697.856 (unos 27,3 B) y el artefacto ocupa 21,39 GiB.

El modelo base pertenece a la familia Qwen 3.5: la model card indica que el texto original declara la arquitectura `qwen3_5_text` y que el artefacto convertido usa `qwen3_5`, el nombre admitido por la versión de oMLX empleada. El caso de uso declarado es la generación de texto y la escritura creativa en inglés, con un modo `enable_thinking` que puede desactivarse para obtener prosa directa sin planificación visible.

Su relevancia es acotada y muy específica: es una pieza de infraestructura para quien quiera ejecutar un modelo de ~27 B en un Mac con memoria unificada suficiente, renunciando a GGUF y a todo el ecosistema CUDA. No hay resultados de benchmarks publicados, no hay comparación controlada contra el modelo BF16 original y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (el modelo fuente declara `qwen3_5_text`; el artefacto convertido usa `qwen3_5`). No se especifica si es denso o MoE |
| Parametros totales | 27.320.697.856 (≈27,3 B), según safetensors |
| Parametros activos | No disponible; no se confirma que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización afín mixta oQe: base de 6 bits, group size 64, 10 tensores a 8 bits (incluido `language_model.lm_head`), tensores no cuantizados en bfloat16; 29 tensores MTP preservados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (5 shards, 1.876 tensores indexados); no es GGUF |
| Tamaño del repositorio | 23,0 GB |
| Tamaño del artefacto de salida | 22.964.597.559 bytes (21,39 GiB) |
| Librería / runtime | MLX, probado con oMLX 0.7.0.dev2 |
| Modelo base | Altworld/Hemmingway-1 (revisión `4d711aac0f0043075ae334d2a3de3db3e10135c9`) |
| Pipeline | text-generation |
| Fecha de publicación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento del modelo original en los datos disponibles: se desconoce el número de tokens, la composición del dataset y si hubo RLHF, DPO u otras fases de alineamiento. Lo único documentado es la arquitectura declarada por el modelo fuente (`qwen3_5_text`, renombrada a `qwen3_5` en el artefacto) y la presencia de 29 tensores de predicción multi-token (MTP), una cabeza que en arquitecturas recientes se usa para decodificación asistida prediciendo varios tokens por paso. El autor advierte que la decodificación asistida por MTP no se ha evaluado por separado, por lo que su ganancia real de velocidad es desconocida.

Lo que sí está documentado con detalle es el proceso de cuantización, que es el aporte real de este repositorio. Se usó el cuantizador oMLX 0.7.0.dev2 con el método oQe («enhanced oQ6e»), una cuantización afín de precisión mixta que parte de 6 bits con group size 64 y asigna precisión adicional a los tensores sensibles según su importancia de activación. En total, 10 tensores quedan en 8 bits; `language_model.lm_head` se almacena en 8 bits porque no tenía entrada correspondiente en la imatrix. La calibración empleó el dataset `oqe_code_multilingual` con 128 muestras de 512 tokens y 504 entradas de imatrix, reutilizando la caché de la pasada de sensibilidad del modelo fuente. El informe `oq_imatrix_report.json` registra la pasada de sensibilidad, los ajustes de calibración, la cobertura de tensores y el fallback; no se notificaron desajustes de forma de matriz ni shards ausentes. El artefacto pasó comprobaciones estructurales y de carga en oMLX el 20 de septiembre de 2026, aunque el propio autor aclara que esas comprobaciones solo verifican que oMLX reconoce y carga los ficheros, no que la calidad sea equivalente a la del modelo BF16.

## Capacidades

- Generación de texto en inglés con orientación a escritura creativa, prosa narrativa y conversación, según los tags `creative-writing`, `text-generation` y `conversational`.
- Modo de razonamiento conmutable: la model card indica que `enable_thinking` debe ponerse a `false` para obtener prosa directa sin planificación visible, lo que implica que el modelo soporta ambos modos.
- Decodificación asistida por predicción multi-token: el artefacto conserva 29 tensores MTP, aunque no se ha medido su impacto en latencia ni en calidad.
- Conversación multi-turno: el tag `conversational` sugiere plantilla de chat, aunque no se detalla el formato de prompt ni el tokenizador en la información disponible.
- Capacidades funcionales adicionales (tool calling, function calling, uso agéntico, multi-step reasoning, visión, audio, matemáticas o código): no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés, único idioma declarado en el modelo y en los metadatos del repositorio.

## Casos de uso

- Escritura creativa local en Apple silicon: el modelo está pensado para ejecutarse en oMLX sobre un Mac, de modo que un escritor puede generar borradores de relatos o capítulos sin enviar texto a servicios externos, algo relevante cuando el material es inédito o confidencial.
- Asistente de redacción sin conexión: con `enable_thinking` a `false` se obtiene prosa directa, adecuada para un asistente de sobremesa que reescribe, continua o reescribe párrafos de forma interactiva.
- Generación por lotes de narrativa: al ser un artefacto de 21,39 GiB ejecutable en memoria unificada, encaja en flujos de generación por lotes (sinopsis, variantes de escenas, descripciones de personajes) que se ejecutan de noche en una sola máquina.
- Prototipado de aplicaciones con oMLX: sirve como modelo de prueba para desarrolladores que construyen interfaces sobre el runtime oMLX y necesitan un modelo de ~27 B cargable en local antes de integrar versiones superiores.
- Investigación sobre cuantización: el repositorio incluye el informe de imatrix y la configuración exacta de calibración, lo que lo convierte en un caso de estudio útil para medir el efecto de una cuantización de 6 bits mixta sobre un modelo de escritura creativa, comparando contra el BF16 original.
- Diseño de personajes y diálogos para videojuegos: el tag conversacional permite generar y refinar líneas de diálogo y variaciones de registro de un mismo personaje en sesiones iterativas, siempre en inglés.
- Evaluación de decodificación MTP: al preservarse 29 tensores MTP, es un artefacto apropiado para experimentar con decodificación asistida en MLX, aunque el autor advierte de que no hay cifras publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco existe una comparación controlada entre este artefacto de 6 bits y el modelo BF16 de origen. El propio autor señala explícitamente que la paridad de calidad con la fuente no está establecida.

## Requisitos de hardware

- Peso en disco y en memoria: 21,39 GiB de pesos (22.964.597.559 bytes) en 5 shards de safetensors MLX.
- Memoria unificada estimada: 32 GB como mínimo razonable para cargar los pesos con margen para el runtime; 48 GB o más si se trabaja con contextos largos o con varias sesiones simultáneas, ya que la caché KV se suma a los 21,39 GiB.
- Equipos Apple recomendados: Mac con chip M2 Max, M3 Max o M4 Max de 32-48 GB de memoria unificada; M2 Ultra o M3 Ultra de 64 GB o más para mayor holgura y concurrencia.
- GPU NVIDIA o AMD: no aplicable. El formato es safetensors MLX y no GGUF, por lo que no se ejecuta en CUDA ni en ROCm sin una conversión previa que no está documentada.
- Consumer GPU: no cabe en GPU de consumo convencionales en su formato actual, porque el runtime objetivo es MLX sobre memoria unificada de Apple silicon, no VRAM dedicada.
- Opciones de despliegue: oMLX 0.7.0.dev2 (creado y probado con esa versión), cargándolo como LLM desde el navegador de modelos de oMLX. La compatibilidad con otras versiones de oMLX o con otros runtimes MLX no ha sido verificada. vLLM, llama.cpp, Ollama y TGI no son opciones viables con este artefacto: llama.cpp y Ollama requieren GGUF, que no existe en el repositorio.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo publicadas ni para generación simple ni para decodificación asistida por MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hemmingway-1-oQ6e-mtp (este) | 27,3 B | No disponible | Safetensors MLX, 6 bits mixtos | MLX / oMLX 0.7.0.dev2 | Apache 2.0 | Repositorio público, 0 descargas |
| Altworld/Hemmingway-1 (base) | 27,3 B (mismo recuento) | No disponible | BF16, aproximadamente 50,9 GiB si se almacena sin cuantizar (cálculo propio a partir del recuento de parámetros) | No especificado | Apache 2.0 | Repositorio público |
| Alternativas de la misma categoría (otros modelos de ~27 B o cuantizaciones MLX equivalentes) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió información sobre modelos comparables, y la model card no menciona alternativas. Por tanto, la única comparación sustentada en datos es la que enfrenta este artefacto con su modelo fuente.

## Limitaciones y advertencias

- Deriva de cuantización: la propia model card advierte de que la cuantización puede alterar la elección de palabras, la coherencia y el seguimiento de instrucciones. No se ha publicado una comparación controlada contra el modelo BF16, así que la magnitud de esa deriva es desconocida.
- Calibración no alineada con el caso de uso: la pasada de sensibilidad usó el dataset `oqe_code_multilingual`, de carácter multilingüe y orientado a código, y no un corpus de prosa. Para un modelo de escritura creativa, la calibración puede no reflejar los tensores más sensibles en su dominio real.
- MTP sin evaluar: los 29 tensores de predicción multi-token están presentes, pero la decodificación asistida por MTP no se ha medido, por lo que no debe asumirse una mejora de velocidad.
- Idioma único: solo inglés. No hay soporte declarado de castellano ni de ningún otro idioma, lo que limita su uso en producción en España sin un pipeline de traducción adicional.
- Contexto desconocido: no se publica la longitud de contexto soportada, un dato crítico para dimensionar la caché KV y para decidir si sirve en casos de conversación larga o documentos extensos.
- Atado a una versión concreta: creado y probado con oMLX 0.7.0.dev2. La compatibilidad con versiones anteriores o posteriores y con otros runtimes MLX no está verificada. La carga correcta no garantiza calidad.
- Sin comunidad: 0 descargas y 0 valoraciones en el momento de redactar la ficha, de modo que no existe validación independiente de su comportamiento en producción.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; se aplican los riesgos habituales de un modelo generativo de texto, especialmente en un contexto de escritura creativa donde la veracidad no es el objetivo.
- Licencia: Apache 2.0, que permite uso comercial, pero al ser un derivado conviene revisar la model card del modelo fuente para atribución y condiciones adicionales del autor original.
- Formato cerrado en la práctica: al no existir GGUF, no se puede desplegar en la mayor parte de infraestructuras de inferencia basadas en llama.cpp, Ollama o servidores CUDA sin una conversión no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sixstringzen/Hemmingway-1-oQ6e-mtp
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Revisión del modelo fuente usada en la conversión: `4d711aac0f0043075ae334d2a3de3db3e10135c9`
- Informe de imatrix y calibración: https://huggingface.co/sixstringzen/Hemmingway-1-oQ6e-mtp/blob/main/oq_imatrix_report.json
- Cuantizador oMLX: https://github.com/jundot/omlx
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo ni sobre su modelo base; los resultados devueltos trataban sobre YouTube TV y no guardan relación con el objeto de esta ficha.
