# Dakshina-mentalHealth/mh-sin-mistral

## Resumen

`Dakshina-mentalHealth/mh-sin-mistral` es un repositorio de pesos en formato safetensors publicado en HuggingFace por la organizacion Dakshina-mentalHealth, con licencia, idiomas y pipeline sin declarar. La model card es la plantilla automatica de HuggingFace y no ha sido cumplimentada: todos los campos (desarrollador, tipo de modelo, datos de entrenamiento, hiperparametros, evaluacion) figuran como "[More Information Needed]". El repositorio no incluye configuracion tecnica publica ni documentacion adicional, y acumula cero descargas y cero valoraciones.

La unica informacion estructural disponible son las etiquetas del Hub (`transformers`, `safetensors`, `endpoints_compatible`, `region:us` y la referencia `arxiv:1910.09700`, que corresponde al articulo del calculador de impacto de carbono de Lacoste et al. y aparece en la plantilla por defecto) y el tamano del repositorio, 0,2 GB. El identificador sugiere dos cosas que no estan confirmadas por el autor: por un lado, una base Mistral; por otro, el sufijo `sin`, que coincide con el codigo ISO 639-2/3 del cingales (sinhala). El prefijo `mh` es coherente con un proposito de salud mental.

La relevancia de esta ficha es por tanto fundamentalmente cautelar: se trata de un artefacto del que no puede verificarse ni la arquitectura, ni el numero de parametros, ni el regimen de licencia. Cualquier evaluacion o uso en produccion exige inspeccionar directamente los ficheros del repositorio (`config.json`, `model.safetensors.index.json`, tamanos de los shards) antes de tomar decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publica `config.json` en la informacion facilitada; el identificador sugiere una base Mistral, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no se listan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (el sufijo `sin` del identificador coincide con el codigo ISO 639-2/3 del cingales, sin confirmar) |
| Licencia | no disponible (campo vacio en la model card y en los metadatos del Hub) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | transformers |
| Etiquetas del Hub | transformers, safetensors, arxiv:1910.09700, endpoints_compatible, region:us |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

Observacion tecnica sobre el tamano: 0,2 GB es incompatible con los pesos completos de un modelo Mistral de 7B en fp16 (aproximadamente 14,5 GB) o en bf16. Ese volumen encaja con un adaptador LoRA, con un modelo de decenas o pocos cientos de millones de parametros, o con una subida parcial de los shards. La informacion disponible no permite distinguir entre estos escenarios.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura. La model card es la plantilla generada automaticamente por HuggingFace y no contiene descripcion del modelo, ni objetivo de entrenamiento, ni detalles de infraestructura de computo. El unico indicio es el sufijo `mistral` del identificador, que apunta a una familia de transformers con atencion causal, atencion de ventana deslizante (sliding window attention) y normalizacion RMSNorm en las versiones 7B de referencia; sin embargo, el autor no confirma que este modelo derive de esa familia ni que reutilice su tokenizador.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre hiperparametros (precision mixta, regimen de entrenamiento, horas de computo). El campo de impacto ambiental de la plantilla esta vacio en todos sus apartados (tipo de hardware, horas, proveedor de nube, region y emisiones). No se puede afirmar ni descartar ninguna innovacion tecnica concreta.

## Capacidades

No es posible verificar capacidades a partir de la informacion disponible. Las siguientes afirmaciones son hipotesis derivadas del identificador del repositorio y estan pendientes de confirmacion empirica:

- Generacion de texto en el dominio de la salud mental, si el modelo ha sido ajustado con datos de esa tematica.
- Posible soporte del idioma cingales (sinhala), si el sufijo `sin` corresponde al codigo ISO 639-2/3 de esa lengua.
- Herencia potencial de las capacidades de una base Mistral (razonamiento, generacion de codigo, matematicas basicas), supeditada a que la base sea efectivamente Mistral y a que el ajuste no las haya degradado.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible.

No se debe asumir ninguna de estas capacidades en un sistema en produccion sin una bateria de evaluacion propia.

## Casos de uso

Los siguientes escenarios son condicionales: solo tienen sentido si se confirma que el modelo es una adaptacion de un modelo base capaz de mantener conversacion en cingales o en ingles, y siempre bajo supervision de profesionales. Se listan como marco de evaluacion, no como recomendacion de despliegue.

- Triage inicial de salud mental en cingales: si el modelo maneja esa lengua, podria clasificar texto de usuarios de foros o formularios en categorias alineadas con criterios DSM-5, sirviendo como primer filtro antes de la revision por un clinico. Requiere validacion contra un conjunto anotado por especialistas.
- Analisis de foros y comunidades online: extraccion de estresores, sintomas y temas recurrentes a partir de texto generado por usuarios, con el objetivo de generar informes agregados para investigacion en psicologia. La longitud de contexto necesaria no puede estimarse sin conocer la ventana real del modelo.
- Generacion de recomendaciones de intervencion: produccion de sugerencias personalizadas de bajo riesgo (tecnicas de respiracion, derivacion a recursos) siempre que la salida pase por un revisor humano y no se presente como diagnostico.
- Preentrenamiento de un clasificador downstream: uso del modelo como extractor de representaciones congeladas para entrenar un clasificador ligero de riesgo, aprovechando que el formato safetensors es compatible con la libreria transformers.
- Traduccion asistida cingales-ingles en contextos clinicos: si el modelo es bilingue, podria usarse para pre-traducir material psicopedagogico, con revision posterior por un traductor humano.
- Prototipado de investigacion academica: al ser un repositorio pequeno (0,2 GB), resulta barato de descargar y experimentar en un entorno de laboratorio para reproducir o auditar los resultados del autor antes de cualquier otra consideracion.
- Base para un asistente conversacional de acompanamiento: integrable en un chat con guardarrailes y derivacion automatica a servicios de emergencia cuando se detecten senales de riesgo. Este caso exige evaluacion explicita de falsos negativos y no deberia abordarse sin datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion vacia, sin datos de MMLU, HumanEval, GSM8K ni de metricas especificas de dominio clinico. Tampoco se especifican los conjuntos de datos de prueba ni los factores de desagregacion.

## Requisitos de hardware

Los requisitos dependen del escenario, que no puede determinarse con la informacion disponible:

- Si el repositorio contiene un adaptador LoRA (hipotesis compatible con los 0,2 GB): la VRAM necesaria es la del modelo base sobre el que se aplique el adaptador, mas una sobrecarga marginal (decenas de MB). El adaptador por si solo no es ejecutable.
- Si se trata de un modelo autonomo de aproximadamente 7B en fp16: los pesos ocupan en torno a 14,5 GB, por lo que se necesitan 16 GB de VRAM como minimo y 20-24 GB para margen de cache KV en contextos largos. Encajan A100 40 GB, H100, L40S y, en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Si se cuantiza a 8 bits: aproximadamente 7-9 GB de VRAM; cabe en RTX 3080 (10 GB), RTX 4070 Ti (12 GB) y superiores.
- Si se cuantiza a 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4-5 GB de VRAM; cabe en RTX 3060 (12 GB), RTX 4060 Ti (8 GB) y en equipos con 8 GB de VRAM para contextos moderados.
- Si el modelo real tiene decenas o cientos de millones de parametros: es ejecutable en CPU con llama.cpp y en cualquier GPU con 6-8 GB de VRAM.
- Opciones de despliegue: vLLM, TGI y transformers para pesos safetensors; llama.cpp y Ollama solo si en el repositorio existen variantes GGUF, que no se declaran en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni requisitos de memoria en produccion.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de salud mental en cingales. La unica referencia posible es el modelo base que el identificador sugiere, Mistral-7B-v0.1, cuyos datos publicos se incluyen a continuacion exclusivamente como marco de referencia, no como confirmacion de que este repositorio derive de el.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Dakshina-mentalHealth/mh-sin-mistral | no disponible | no disponible | no disponible | HuggingFace, 0,2 GB, 0 descargas | no disponible |
| mistralai/Mistral-7B-v0.1 (referencia hipotetica de base) | 7,3B | 8.192 tokens | Apache 2.0 | HuggingFace | benchmarks publicos en su model card |
| Alternativas de salud mental en lenguas indias | no disponible | no disponible | no disponible | no identificadas en la informacion proporcionada | no disponible |

No se dispone de datos para comparar licencia, contexto, rendimiento ni coste de despliegue con alternativas reales de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no esta cumplimentada, por lo que no se conocen origen de los datos, proceso de entrenamiento ni evaluacion. Usar el modelo en cualquier flujo con usuarios finales implica un riesgo no cuantificado.
- Licencia sin declarar: sin licencia explicita no hay autorizacion clara de uso comercial. En la practica, la ausencia de licencia equivale a reserva de derechos por defecto en muchas jurisdicciones, lo que desaconseja su integracion en productos.
- Dominio sensible: un modelo orientado a salud mental puede producir contenido que se interprete como diagnostico o consejo clinico. Cualquier salida debe pasar por profesionales cualificados y nunca presentarse como sustituto de atencion medica.
- Riesgo de alucinacion: no cuantificado. En dominios clinicos, una alucinacion puede derivar en dano directo; no hay datos de tasas de error.
- Sesgos: no evaluados. No se han publicado analisis de sesgo por genero, edad, etnia, nivel socioeconomico ni por variante dialectal del cingales.
- Limitaciones de idioma y contexto: no se conocen los idiomas soportados ni la longitud de contexto real, lo que impide planificar conversaciones multi-turno o procesamiento de documentos largos.
- Cobertura geografica y linguistica: si el modelo esta especializado en cingales, su utilidad fuera de Sri Lanka y de la comunidad diaspora es limitada.
- Inconsistencia en el tamano del repositorio: 0,2 GB no corresponde a los pesos completos de un modelo de 7B. Antes de cualquier uso hay que verificar si es un adaptador, un modelo pequeno o una subida incompleta.
- Trazabilidad: cero descargas y cero valoraciones implican que el repositorio no ha sido auditado por terceros.
- Fecha de creacion inusual: los metadatos indican 2026-09-26, posterior a la fecha habitual de publicacion de modelos basados en Mistral de primera generacion; conviene verificar la autenticidad y el contexto de la publicacion.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Dakshina-mentalHealth/mh-sin-mistral
- Articulo MHINDR, marco basado en DSM-5 para diagnostico y recomendacion en salud mental (posiblemente relacionado con la organizacion, sin confirmar): https://arxiv.org/pdf/2509.25992v1
- Articulo del calculador de impacto de carbono referenciado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Pagina de modelos de Mistral AI: https://mistral.ai/models/
- Novedades de Mistral AI: https://mistral.ai/news/
- Modelo base de referencia mistralai/Mistral-7B-v0.1: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Calendario de publicaciones de modelos de IA (referencia general): https://www.scriptbyai.com/ai-model-release-calendar/
- Calculador de impacto de aprendizaje automatico: https://mlco2.github.io/impact
