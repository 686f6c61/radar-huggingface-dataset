# OpenFlowLM/GPT-OSS-Safeguard-20B-NPU2

## Resumen

OpenFlowLM/GPT-OSS-Safeguard-20B-NPU2 es un ajuste fino (finetune) del modelo openai/gpt-oss-safeguard-20b, publicado por el usuario OpenFlowLM en HuggingFace. Se trata de un modelo de generacion de texto orientado a tareas de seguridad: clasificacion de contenido, etiquetado de entradas y salidas de LLM y aplicacion de politicas de seguridad definidas por el usuario. El modelo hereda la arquitectura y el entrenamiento del gpt-oss-safeguard-20b original de OpenAI, que es un transformer con mezcla de expertos (MoE) de 21 000 millones de parametros totales y 3 600 millones de parametros activos.

El modelo base esta disenado especificamente para razonamiento sobre seguridad ("safety reasoning"): interpreta una politica escrita en lenguaje natural y clasifica texto conforme a ella, devolviendo ademas la cadena de razonamiento que justifica la decision. Esta pensado para casos de uso de confianza y seguridad (Trust and Safety): filtrado de contenido, moderacion, etiquetado en linea y por lotes.

La relevancia de esta ficha concreta es limitada: se trata de una publicacion derivada con cero descargas y cero "likes" en el momento de la consulta, sin model card propia (el README es esencialmente el del modelo base) y sin datos de entrenamiento, evaluacion ni cambios respecto al original. La unica senal diferencial aportada por el autor es el sufijo "NPU2" y la etiqueta mxfp4, que sugieren una variante orientada a despliegue en hardware con soporte de cuantizacion MXFP4, si bien el autor no documenta ninguna modificacion tecnica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer, heredada de gpt-oss-safeguard-20b |
| Parametros totales | 21 000 millones (modelo base) |
| Parametros activos | 3 600 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (segun el tag mxfp4); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); el repositorio ocupa 14,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del gpt-oss-safeguard-20b de OpenAI, un transformer con capas de mezcla de expertos (MoE) de 21 000 millones de parametros totales de los que 3 600 millones estan activos por token. Esta arquitectura permite que el modelo quepa en GPU de 16 GB de VRAM con la cuantizacion adecuada, segun indica la propia model card del modelo base. El modelo fue entrenado sobre el formato de respuesta "harmony" de OpenAI y, segun la documentacion del original, solo funciona correctamente si se usa ese formato.

El entrenamiento especifico del modelo base se orienta al razonamiento sobre seguridad: se entrena y ajusta para interpretar politicas escritas por el usuario y aplicar tareas fundamentales de seguridad, con esfuerzo de razonamiento configurable (bajo, medio, alto) y acceso completo a la cadena de razonamiento. Para esta publicacion derivada no se proporciona informacion sobre el dataset de ajuste, el numero de tokens, la composicion de los datos ni si hubo RLHF, DPO u otra tecnica de alineamiento. Tampoco se documenta ninguna innovacion tecnica adicional introducida por OpenFlowLM respecto al modelo base; el sufijo "NPU2" y la etiqueta mxfp4 apuntan a una variante de despliegue en hardware con soporte MXFP4, pero no se aportan detalles.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de generacion y razonamiento del modelo base gpt-oss.
- Razonamiento sobre seguridad ("safety reasoning"): clasificacion de texto conforme a una politica proporcionada por el usuario.
- "Bring your own policy": interpreta politicas escritas en lenguaje natural, lo que permite generalizar entre productos y casos de uso con ingenieria minima.
- Decisiones razonadas con acceso a la cadena de razonamiento completa (raw CoT) para depuracion y auditoria; pensado para desarrolladores y profesionales de seguridad, no para exposicion directa a usuarios finales.
- Esfuerzo de razonamiento configurable (bajo, medio, alto) para ajustar latencia y coste.
- Tareas fundamentales de seguridad: filtrado de entradas y salidas de LLM, etiquetado de contenido en linea y etiquetado offline para equipos de Trust and Safety.
- Compatibilidad con el formato harmony de OpenAI para la conversacion y la estructura de mensajes.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible para esta variante.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades de vision o audio: no disponibles; el modelo se etiqueta como text-generation.

## Casos de uso

- Moderacion de contenido generado por usuarios: el modelo recibe una politica de moderacion escrita por el equipo y clasifica publicaciones, comentarios o mensajes conforme a ella, devolviendo la justificacion del veredicto para auditoria.
- Filtrado de entrada y salida en aplicaciones de chat con LLM: se intercala como capa de control que evalua el prompt del usuario y la respuesta del modelo antes de mostrarla, aplicando las reglas internas de la organizacion.
- Etiquetado offline para equipos de Trust and Safety: procesamiento por lotes de grandes volumenes de contenido historico para asignar categorias de politica de forma consistente y reproducible.
- Revision asistida de casos limite: el acceso a la cadena de razonamiento permite que un analista humano inspeccione por que el modelo ha clasificado un contenido como infractor y ajuste la politica en consecuencia.
- Evaluacion de politicas antes de desplegarlas: se pueden probar borradores de politica contra un corpus de ejemplo para medir falsos positivos y falsos negativos antes de llevarlas a produccion.
- Automatizacion de triaje en plataformas comunitarias: clasificar reportes de usuarios por categoria de politica para priorizar la revision humana de los casos mas graves.
- Deteccion de contenido danino en pipelines de generacion aumentada por recuperacion (RAG): evaluar los documentos recuperados antes de inyectarlos en el contexto del modelo generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye metricas propias, y la referencia al paper arXiv:2508.10925 corresponde al modelo base gpt-oss-safeguard, cuyos resultados no se reproducen en la documentacion aqui facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card del modelo base indica que gpt-oss-safeguard-20b (21 000 millones de parametros totales, 3 600 millones activos) cabe en GPU con 16 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el perfil de VRAM del modelo base, es compatible con GPU de gama alta de consumo con 16 GB o mas; el sufijo "NPU2" del nombre sugiere ademas despliegue en aceleradores con soporte de cuantizacion MXFP4, sin mas detalles publicados.
- Cabe en GPU de consumo: si, segun la indicacion del modelo base (16 GB de VRAM).
- Opciones de despliegue: la libreria declarada es transformers; entre las etiquetas figuran vllm y endpoints_compatible, lo que indica compatibilidad con vLLM y con endpoints de inferencia. No se confirman otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El esfuerzo de razonamiento configurable (bajo, medio, alto) del modelo base permite ajustar la latencia en funcion del caso de uso, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/GPT-OSS-Safeguard-20B-NPU2 (este) | 21 000 M (heredados) | 3600 M (heredados) | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| openai/gpt-oss-safeguard-20b | 21 000 M | 3600 M | no disponible | apache-2.0 | HuggingFace, modelo base oficial de OpenAI |
| openai/gpt-oss-safeguard-120b | 117 000 M | 5100 M | no disponible | apache-2.0 | HuggingFace, version de mayor tamano |
| openai/gpt-oss-20b (modelo generalista) | 21 000 M | 3600 M | no disponible | apache-2.0 | HuggingFace, recomendado por OpenAI para aplicaciones no relacionadas con seguridad |

Diferencias observables: las tres variantes de gpt-oss-safeguard comparten licencia Apache 2.0 y el formato harmony; el 120b ofrece mas capacidad a costa de mayores requisitos de hardware, y el 20b y sus derivados caben en 16 GB de VRAM. La diferencia entre este modelo y openai/gpt-oss-safeguard-20b es, segun la informacion disponible, unicamente el ajuste fino declarado por OpenFlowLM, sin detalles publicados sobre que cambia. No se dispone de datos de rendimiento comparado para esta variante.

## Limitaciones y advertencias

- Modelo derivado sin documentacion propia: el README reproduce el del modelo base y no describe el ajuste fino realizado, los datos usados ni los cambios introducidos. No hay garantia de que el comportamiento sea equivalente al del original.
- Sin adopcion ni validacion externa: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones independientes.
- Obligatoriedad del formato harmony: segun la model card del modelo base, los modelos gpt-oss-safeguard solo funcionan correctamente con ese formato de respuesta. Usar otro formato puede degradar o invalidar los resultados.
- Cadena de razonamiento no apta para usuarios finales: la propia documentacion del modelo base advierte que el raw CoT esta pensado para desarrolladores y profesionales de seguridad, no para exposicion a usuarios generales ni fuera de contextos de seguridad.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas para esta variante; al ser un modelo de razonamiento generativo, puede producir justificaciones plausibles pero incorrectas de sus clasificaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de equidad para esta variante ni para el modelo base en la informacion disponible.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede confirmarse su comportamiento multilingue ni con entradas largas.
- Idoneidad de uso: el modelo base esta declarado explicitamente para casos de seguridad; OpenAI recomienda los modelos gpt-oss generalistas para otras aplicaciones. Usar esta variante fuera de ese ambito no esta respaldado por su documentacion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de copyleft ni riesgo de patentes, pero la licencia no cubre responsabilidades derivadas de decisiones automatizadas de moderacion.
- Produccion: antes de desplegarlo conviene validar el modelo contra un conjunto de evaluacion propio con la politica real, dado que no existen metricas publicadas de precision, recall o tasa de falsos positivos.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/OpenFlowLM/GPT-OSS-Safeguard-20B-NPU2
- Modelo base en HuggingFace: https://huggingface.co/openai/gpt-oss-safeguard-20b
- Version de 120B del modelo base: https://huggingface.co/openai/gpt-oss-safeguard-120b
- Coleccion de modelos gpt-oss-safeguard: https://huggingface.co/collections/openai/gpt-oss-safeguard
- Coleccion de modelos gpt-oss generalistas: https://huggingface.co/collections/openai/gpt-oss
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/openai/gpt-oss-safeguard-20b
- Guia de prompting (cookbook de OpenAI): https://cookbook.openai.com/articles/gpt-oss-safeguard-guide
- Cookbooks de gpt-oss: https://cookbook.openai.com/topic/gpt-oss
- Paper (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss-safeguard/
- Formato harmony: https://github.com/openai/harmony
- Model card de gpt-oss-120b (instrucciones de descarga): https://huggingface.co/openai/gpt-oss-120b
- Comunidad de modelos ROOST: http://roost.tools/
- Repositorio de modelos abiertos de ROOST: https://github.com/roostorg/open-models
- Imagen del modelo: https://raw.githubusercontent.com/openai/gpt-oss-safeguard/main/docs/gpt-oss-safeguard-20b.png
