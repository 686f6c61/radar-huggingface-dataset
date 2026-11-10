# rezanicgil/job-radar-duration-context

## Resumen

Job Radar · Duration context es un clasificador binario de texto desarrollado por el usuario rezanicgil, pensado para una tarea muy concreta dentro del procesamiento de ofertas de empleo: determinar si una expresion temporal marcada en una oferta (por ejemplo, "tres anos") se refiere a experiencia previa requerida o a otra duracion (duracion de un contrato, plazo de incorporacion, etc.). No es un modelo generativo ni un extractor de fechas: es una cabeza de clasificacion lineal sobre un encoder multilingue preentrenado.

Tecnicamente se apoya en el encoder `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, que permanece congelado, y solo se entrena una regresion logistica con balanceo de clases sobre embeddings normalizados de mean-pooling. El contexto que alimenta al clasificador se construye tomando diez palabras a cada lado de la duracion marcada y enmascarando la propia duracion, de modo que la decision depende del contexto linguistico y no del valor temporal en si.

Su relevancia es limitada y muy especifica: se trata de un artefacto de investigacion con 75 ejemplos etiquetados, publicado con licencia Apache 2.0 y pesos de tamano despreciable (el repositorio ocupa 0.0 GB). Resulta util como pieza de un pipeline de analisis de ofertas de empleo en ingles y turco, pero no como modelo general ni como solucion validada a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (MiniLM-L12) congelado + cabeza de clasificacion logistica lineal |
| Parametros totales | No disponible (el encoder base MiniLM-L12 ronda los 118 M; la cabeza es un clasificador lineal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana formal; el modelo procesa 10 palabras a cada lado de la duracion marcada, con la duracion enmascarada |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | Ingles (en) y turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoder base descargado desde el hub; cabeza lineal propia) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, un encoder multilingue MiniLM (`paraphrase-multilingual-MiniLM-L12-v2`) que se mantiene congelado y se encarga de vectorizar el contexto. Segundo, una regresion logistica con balanceo de clases que recibe embeddings de mean-pooling normalizados y produce una de dos etiquetas: experiencia previa u otra duracion. No hay fine-tuning del encoder ni codigo remoto personalizado requerido por Transformers.

El entrenamiento se realizo sobre 75 menciones de duracion etiquetadas por un asistente, de las cuales 60 corresponden a experiencia previa y 15 a otras duraciones. La evaluacion se hizo con 19 pliegues leave-one-employer-out dentro de ese mismo corpus de borrador: se clasificaron correctamente 60/60 menciones de experiencia y 11/15 duraciones de otro tipo, lo que arroja una precision balanceada del 86,7 % frente al 80 % de una linea base basada en palabras de contexto. Los pesos publicados se reajustaron despues sobre los 75 ejemplos completos. El autor advierte explicitamente que esta evaluacion no constituye validacion humana independiente ni una estimacion de precision especifica para turco.

## Capacidades

- Clasificacion binaria de menciones temporales en ofertas de empleo: experiencia previa frente a otra duracion.
- Procesamiento bilingue de contexto en ingles y turco.
- Funcionamiento local: el texto se procesa en la maquina del usuario, sin llamadas a servicios remotos.
- Integracion sencilla via `transformers` y `safetensors`, con un script `predict.py` incluido en el repositorio.
- No extrae fechas, no determina si un requisito es obligatorio y no evalua candidatos.
- No genera probabilidad de contratacion ni puntuaciones de matching de CV.

## Casos de uso

- Analisis de ofertas de empleo a gran escala: el clasificador permite separar, dentro de un corpus de ofertas, que menciones temporales describen experiencia requerida y cuales describen duraciones de contrato o plazos, alimentando un esquema estructurado posterior.
- Construccion de un job radar o agregador: integrado en un pipeline de scraping y extraccion, ayuda a etiquetar requisitos de experiencia sin necesidad de un LLM generativo, con coste computacional minimo.
- Filtrado de ruido en extraccion de requisitos: antes de enviar una oferta a un extractor mas costoso, este modelo descarta menciones temporales que no son requisitos de experiencia.
- Procesamiento bilingue en mercados turco e ingles: util para plataformas de empleo que operan en ambos idiomas y necesitan una capa de normalizacion linguistica comun.
- Investigacion sobre estructura de ofertas de empleo: el modelo y su codigo de entrenamiento sirven como base reproducible para estudiar como se expresan los requisitos temporales en anuncios reales.
- Prototipado rapido en local: al no requerir GPU ni servicios externos, permite validar una idea de producto de analisis de ofertas en un portatil antes de invertir en infraestructura.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Precision balanceada (19 pliegues leave-one-employer-out, 75 ejemplos) | 86,7 % |
| Linea base de palabras de contexto | 80 % |
| Menciones de experiencia clasificadas correctamente | 60/60 |
| Otras duraciones clasificadas correctamente | 11/15 |
| Chequeo bilingue, ingles: experiencia / otras duraciones | 2/4 y 4/4 |
| Chequeo bilingue, turco: experiencia / otras duraciones | 4/4 y 4/4 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el encoder MiniLM-L12 es un modelo pequeno que cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU con unos pocos GB de VRAM es suficiente, y la inferencia en CPU es viable para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (RTX 3060 o superior), aunque no es necesario.
- Opciones de despliegue: `transformers` (version fijada 4.52.4 segun la model card), `safetensors` y `torch`; el repositorio incluye `predict.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Job Radar · Duration context | Clasificador lineal sobre MiniLM | No disponible (encoder ~118 M) | 10 palabras por lado | Apache 2.0 | Tarea muy especifica, 75 ejemplos de entrenamiento |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Encoder de embeddings | ~118 M | 128 tokens (tipico de MiniLM) | Apache 2.0 | Modelo base; no realiza esta clasificacion por si mismo |
| Clasificadores de requisitos de empleo basados en LLM | Generativos con prompting | Miles de millones | Amplio | Variable | Mayor coste y latencia; no comparable directamente en esta tarea |

No se dispone de comparativas publicadas con alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 75 ejemplos, insuficientes para garantizar generalizacion a dominios o empresas no vistas.
- La evaluacion no es validacion humana independiente ni una estimacion de precision especifica para turco; el propio autor lo advierte.
- El chequeo bilingue es diagnostico y no representativo: en ingles solo se acertaron 2 de 4 declaraciones de experiencia.
- Los cuatro errores documentados se refieren a duracion de programas, despliegues recientes y disponibilidad de incorporacion, lo que indica confusiones en contextos temporales no laborales.
- No extrae fechas, no determina obligatoriedad de requisitos y no evalua candidatos; usarlo para esos fines produciria resultados invalidos.
- No genera probabilidad de contratacion ni puntuacion de matching de CV.
- Riesgo de sesgo derivado de un etiquetado realizado por un asistente y de un corpus de borrador no representativo.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo no esta validada para produccion sin evaluacion adicional propia.
- Solo cubre ingles y turco; otros idiomas no estan soportados de forma declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezanicgil/job-radar-duration-context
- Codigo de entrenamiento y predicciones out-of-fold: https://github.com/rezanicgil/job-radar-evidence/commit/ec5a061
- Resultados del chequeo bilingue: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/duration-context-bilingual.json
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
