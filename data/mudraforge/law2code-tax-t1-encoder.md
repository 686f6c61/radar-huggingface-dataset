# MudraForge/law2code-tax-t1-encoder

## Resumen

MudraForge Tax T1 Encoder (identificador interno `law2code-tax-t1-encoder`, checkpoint `stage0_backbone_mlm_salient_16k`) es un codificador fundacional de lenguaje estatutario desarrollado por MudraForge para su pila neuro-simbolica `law2code`. Su funcion es transformar texto legal tributario de India y Estados Unidos en representaciones vectoriales que alimentan etapas posteriores de un compilador que traduce normativa a codigo Catala, un lenguaje de programacion de dominio legal basado en el calculo de la ley.

El modelo no es un generador de texto ni un asistente conversacional: es un encoder de backbone (etapa `stage0`) entrenado con enmascaramiento selectivo de tokens (Salient Masked Language Modeling) durante 16.000 pasos. Combina tokenizacion por hashing de subpalabras con un vocabulario de 8.192 unidades, una rama Char-CNN para morfologia y una representacion de geometria discursiva de 28 dimensiones, lo que sugiere un diseno orientado a capturar estructura retorica y referencial del articulado legal.

Su relevancia actual es acotada pero especifica: cubre un nicho poco atendido, el parsing de estatutos fiscales como paso previo a la formalizacion simbolica. El repositorio esta vacio (0.0 GB) y no se han publicado pesos, benchmarks ni idiomas soportados en la informacion disponible, por lo que a fecha de esta ficha el modelo no es desplegable de forma verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder neuro-simbolico con tokenizacion por hashing de subpalabras, Char-CNN y geometria discursiva de 28 dimensiones (backbone MLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (entrenado sobre estatutos fiscales de India y EE. UU. segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) segun la model card; el repositorio figura con 0.0 GB |

## Arquitectura y entrenamiento

La model card describe un encoder con tres componentes explicitos: un esquema de tokenizacion por hashing de subpalabras con vocabulario de 8.192 unidades, una rama Char-CNN que procesa caracteres a nivel morfologico (util para terminos legales compuestos, citas y numeracion de articulos) y una senal de geometria discursiva de 28 dimensiones que codifica la estructura del discurso normativo. El entrenamiento emplea Salient Masked Language Modeling durante 16.000 pasos, una variante de MLM que presumiblemente prioriza el enmascaramiento de tokens relevantes para la tarea, aunque la informacion proporcionada no detalla el criterio de saliencia ni la composicion exacta del corpus.

No se especifican el numero de tokens de entrenamiento, la mezcla de datos, el uso de RLHF/DPO ni innovaciones como decodificacion especulativa o atencion lineal. El modelo se presenta como la etapa `stage0` de una pila mayor (`law2code`) cuyo destino es la compilacion a Catala, lo que implica que su salida se consume por etapas simbolicas posteriores y no por un decodificador de lenguaje natural.

## Capacidades

- Codificacion de texto estatutario fiscal (India y EE. UU.) en representaciones vectoriales para etapas posteriores de compilacion.
- Parsing de estructura normativa: la geometria discursiva de 28 dimensiones sugiere modelado de secciones, subsecciones y referencias cruzadas.
- Procesamiento morfologico de terminos legales mediante Char-CNN (numeracion, citas, compuestos).
- Integracion en una pila neuro-simbolica orientada a generar codigo Catala.
- Exportacion a ONNX para despliegue en entornos de inferencia sin PyTorch.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Formalizacion de legislacion tributaria: el encoder alimentaria la etapa de parsing de un compilador que convierte articulos fiscales en reglas Catala ejecutables, reduciendo la transcripcion manual de normativa a codigo.
- Auditoria de cumplimiento normativo: representar estatutos fiscales como vectores permite comparar versiones de una ley y detectar cambios semanticos entre enmiendas antes de recompilar las reglas.
- Extraccion de referencias cruzadas: la geometria discursiva y el Char-CNN facilitan identificar citas entre secciones (por ejemplo, remisiones a articulos derogados) en corpus legales extensos.
- Construccion de bases de conocimiento legal: usar los embeddings como capa de indexacion semantica sobre articulado fiscal para busqueda y recuperacion en herramientas de asesoria.
- Investigacion en NLP legal neuro-simbolico: sirve como backbone de referencia para experimentos de compilacion de ley a codigo, dado que su licencia Apache 2.0 permite modificacion y redistribucion.
- Preprocesamiento en pipelines de e-discovery fiscal: normalizar y vectorizar grandes volumenes de texto estatutario antes de aplicar clasificadores o reglas simbolicas.
- Integracion en entornos ONNX: desplegar el encoder en servicios de inferencia ligeros sin dependencia de PyTorch para preprocesar consultas legales en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el numero de parametros no esta publicado y el repositorio figura con 0.0 GB).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue: PyTorch (pesos `.pt`) y ONNX Runtime (pesos `.onnx`) segun la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con un encoder y no un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MudraForge law2code-tax-t1-encoder | no disponible | no disponible | Encoder de estatutos fiscales para compilacion a Catala | Apache 2.0 | Repositorio vacio (0.0 GB) |
| Legal-BERT | ~110 M (BERT-base) | 512 tokens | Clasificacion y NER legal en ingles | Apache 2.0 (variantes) | Pesos publicos en Hugging Face |
| LegalBERT (variante india) | ~110 M (BERT-base) | 512 tokens | NLP legal en ingles indio | Apache 2.0 (variantes) | Pesos publicos en Hugging Face |
| Catala (lenguaje, no modelo) | no aplica | no aplica | Lenguaje de programacion legal | Apache 2.0 | Repositorio publico |

La comparacion es estructural: los encoders legales genericos como Legal-BERT cubren clasificacion y NER, mientras que este modelo se posiciona como componente de un compilador neuro-simbolico, una categoria sin equivalentes publicos claros en la informacion disponible.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB y no se han publicado pesos verificables; el modelo no es desplegable a fecha de esta ficha.
- No hay informacion sobre sesgos; al entrenarse sobre estatutos de India y EE. UU., cabe esperar sesgo hacia esas jurisdicciones y sus convenciones de redaccion.
- Riesgo de alucinacion no evaluable en un encoder, pero la etapa simbolica posterior puede heredar errores de representacion sin senal de confianza documentada.
- Idiomas soportados no declarados; la cobertura multilingue es desconocida.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos y de documentacion de entrenamiento impide auditar el modelo en produccion.
- No se documentan limites de contexto, lo que impide planificar el troceado de articulos largos.
- Dependencia de la pila `law2code`: el encoder no tiene utilidad independiente documentada fuera de ese compilador.

## Enlaces

- Hugging Face: https://huggingface.co/MudraForge/law2code-tax-t1-encoder
- Demo de la pila law2code: https://huggingface.co/spaces/yamero999/law2code
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o documentacion adicional.
