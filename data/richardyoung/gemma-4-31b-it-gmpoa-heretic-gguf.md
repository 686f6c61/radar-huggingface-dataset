# richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF` es una cuantizacion en formato GGUF de un modelo derivado de la familia Gemma 4 de Google, publicado por el usuario richardyoung en Hugging Face. El modelo parte de `richardyoung/gemma-4-31B-it-GMPOA-heretic`, una variante "heretic" y "abliterated" (es decir, con las capas de rechazo/aliniacion de seguridad eliminadas o atenuadas mediante tecnicas de abliteration) del Gemma 4 31B instruction-tuned. El prefijo GMPOA no viene documentado en la informacion disponible. El repositorio incluye unicamente pesos en formato GGUF, pensados para su uso con llama.cpp y Ollama.

El modelo tiene 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y esta disenado para generacion de texto conversacional en ingles. Su interes principal radica en que ofrece una version "sin censura" (uncensored) del Gemma 4 31B, empaquetada en GGUF con matrices de cuantizacion imatrix, lo que facilita su despliegue en hardware de consumo y en entornos de investigacion donde se requiere estudiar el comportamiento del modelo sin las capas de rechazo estandar.

El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, aunque al derivar de Gemma conviene verificar las condiciones de la licencia original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4; detalles no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; se menciona imatrix, niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 31B (numero de capas, dimension del modelo, mecanismo de atencion, uso de atencion lineal o sliding window, etc.). Se trata de un transformer decoder-only, coherente con la familia Gemma. El proceso de entrenamiento original de Gemma 4 (numero de tokens, composicion del dataset, fases de SFT y RLHF) no se especifica en la informacion proporcionada.

La innovacion principal de esta variante es el proceso de "abliteration" (etiquetado como heretic), una tecnica que identifica y modifica las direcciones de activacion asociadas al rechazo de peticiones para reducir la probabilidad de respuestas de negativa. El prefijo GMPOA no esta documentado. La cuantizacion GGUF se ha generado con matrices imatrix, lo que tipicamente mejora la calidad de las cuantizaciones de baja precision respecto a cuantizaciones sin calibracion.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, etiqueta conversational).
- Razonamiento y respuesta a instrucciones heredados del Gemma 4 31B instruction-tuned.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo base.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- Endpoints compatibles (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta al eliminar las capas de rechazo, comparandolo con el Gemma 4 31B original en tareas controladas.
- Analisis de sesgos y robustez: al carecer de filtros de rechazo, sirve para auditar que tipo de contenido genera el modelo sin restricciones y disenar contramedidas.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a las cuantizaciones imatrix, puede ejecutarse en equipos con GPU de consumo o incluso en CPU con llama.cpp para prototipado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa donde el modelo base tiende a rechazar tematicas sensibles.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir el impacto de distintas cuantizaciones GGUF sobre la calidad en un modelo de ~30B con imatrix.
- Pruebas de red teaming: uso en entornos aislados para generar prompts adversariales y evaluar la robustez de clasificadores de contenido.
- Integracion en Ollama para asistentes personales locales: el modelo puede servirse mediante Ollama para tareas conversacionales en ingles sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse los niveles de cuantizacion ofrecidos. Como referencia orientativa para un modelo de ~30,7 B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-20 GB y las de 8 bits del orden de 32-35 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; previsiblemente las cuantizaciones de 4 bits podrian caber en GPUs con 24 GB de VRAM, pero no hay dato oficial.
- Opciones de despliegue: llama.cpp y Ollama (segun los tags del repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF | ~30,7 B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles, acceso restringido |
| richardyoung/gemma-4-31B-it-GMPOA-heretic | ~30,7 B | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta cuantizacion |
| Gemma 4 31B-it (original de Google) | ~30,7 B (presumible) | no disponible | Gemma license (no disponible en detalle) | safetensors, GGUF | Modelo oficial con alineacion de seguridad intacta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: la eliminacion de las capas de rechazo implica que puede generar contenido danino, ofensivo o ilegal; no es adecuado para aplicaciones de cara al publico sin filtros externos.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su distribucion automatica.
- Solo ingles declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia: se declara apache-2.0, pero al derivar de Gemma conviene verificar la compatibilidad con la licencia original del modelo base antes de uso comercial.
- Riesgo de alucinacion: inherente a los modelos de ~30B; no hay evaluaciones publicadas que lo cuantifiquen.
- Contexto maximo no documentado: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Sesgos: no documentados; los modelos abliterated pueden amplificar sesgos presentes en los datos de entrenamiento originales.
- Prefijo GMPOA sin documentar: se desconoce que modificacion adicional incorpora respecto al Gemma 4 estandar.
- Sin likes ni documentacion tecnica en el repositorio: la trazabilidad del proceso de cuantizacion y abliteration es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion proporcionada.
