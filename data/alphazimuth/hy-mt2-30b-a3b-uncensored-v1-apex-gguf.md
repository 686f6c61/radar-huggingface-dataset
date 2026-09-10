# alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF

## Resumen

Hy-MT2-30B-A3B-Uncensored-v1-APEX es una version editada del modelo de traduccion multilingue Hy-MT2-30B-A3B de Tencent, publicada por el usuario alphaZimuth en Hugging Face. Se trata de una variante "uncensored" obtenida mediante ablacion direccional/ortogonal de pesos sobre el modelo original en BF16, sin reentrenamiento, cuyo objetivo declarado es reducir el comportamiento de rechazo (refusal) conservando la capacidad de traduccion multilingue.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con arquitectura `hy_v3`, denominado 30B-A3B: aproximadamente 30 000 millones de parametros totales y unos 3000 millones activos por token, con 128 expertos por capa segun los pesos editados que documenta el autor. La edicion afecta a 4387 tensores: la cabeza `lm_head`, las proyecciones de salida de atencion (`o_proj`) de las capas 12 a 45 y las proyecciones `down_proj` de todos los expertos de esas mismas capas.

La relevancia de esta publicacion es doble. Por un lado, ofrece tres niveles de cuantizacion APEX en formato GGUF (Mini 10,8 GB, Compact 13,2 GB y Quality 17,8 GB) que permiten desplegar un MoE de 30B en hardware de consumo. Por otro, documenta de forma transparente el procedimiento de ablacion y sus limites: se trata de una version experimental de la comunidad, con 0 descargas y 0 likes en el momento de la consulta, sin calibracion imatrix y con pruebas de regresion preliminares, no benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), arquitectura `hy_v3`; 128 expertos por capa segun los tensores editados |
| Parametros totales | 30 000 millones aproximadamente (denominacion 30B del modelo base) |
| Parametros activos | 3000 millones aproximadamente (denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX Mini (10,8 GB), APEX Compact (13,2 GB), APEX Quality (17,8 GB); sin calibracion imatrix |
| Idiomas soportados | 36 idiomas: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde BF16 tras la ablacion) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo MoE con la arquitectura identificada como `hy_v3` en llama.cpp, con expertos enrutados por capa (128 expertos en las capas afectadas por la edicion, 12 a 45). No hay informacion disponible en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el numero total de capas ni la dimension del modelo o de la cabeza de atencion.

La modificacion aplicada no es un reentrenamiento, sino una edicion de pesos en forma cerrada. Para una matriz de pesos `W` y una direccion de rechazo normalizada `r`, el autor aplica `W' = W - c · r ⊗ (rᵀW)`, con un coeficiente de ablacion `c = 1.0` y una dimension de direccion de 2048. La direccion de rechazo es multilingue, no especifica de un unico idioma. El calculo se realiza en FP32 y el tensor resultante se escribe preservando el dtype original en BF16. Los tensores editados son `lm_head.weight` (1 tensor), `self_attn.o_proj.weight` de las capas 12 a 45 (34 tensores) y `mlp.experts.{0..127}.down_proj.weight` de las capas 12 a 45 (4352 tensores), lo que suma 4387 tensores. Posteriormente se convierte el modelo editado a GGUF y se cuantiza en tres niveles APEX sin usar `imatrix.dat`.

## Capacidades

- Traduccion multilingue entre 36 idiomas, con especial atencion a pares que incluyen chino, ingles, coreano, arabe, espanol, frances y japones, entre otros.
- Generacion de texto en el idioma de destino, ya que el pipeline declarado en Hugging Face es `translation`.
- Reduccion del comportamiento de rechazo: en la prueba preliminar del autor, 119 de 119 prompts en 7 idiomas obtuvieron respuesta (COMPLY), frente a 0 rechazos.
- Ejecucion local en `llama.cpp` gracias al soporte de la arquitectura `hy_v3` y al formato GGUF.
- Capacidad potencial de usar los niveles de cuantizacion segun el equilibrio entre memoria disponible y calidad de traduccion (Mini, Compact, Quality).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision, audio y modo de razonamiento explicito (thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Traduccion automatica de documentacion tecnica en entornos con recursos limitados: el nivel APEX Mini (10,8 GB) permite ejecutar un MoE de 30B en equipos con GPU de gama media-alta o incluso con offload parcial a CPU mediante `llama.cpp`, traduciendo manuales y guias entre los 36 idiomas soportados.
- Localizacion de productos de software: el modelo puede integrarse en un pipeline de CI/CD que traduzca ficheros de recursos (`.po`, `.json`, `.xliff`) en cada release, cubriendo idiomas como japones, coreano, arabe o tailandes que con frecuencia quedan fuera de los flujos de localizacion automatizada.
- Traduccion de contenido generado por usuarios en plataformas multilingues: foros, reseñas o chats donde el texto de entrada puede contener lenguaje coloquial, insultos o contenido sensible; la ablacion reduce la probabilidad de que el modelo se niegue a traducir el fragmento.
- Analisis de inteligencia y monitorizacion de fuentes abiertas: traduccion de material en idiomas de baja cobertura como birmano, jemer, tibetano, mongol, uigur o kannada, donde los traductores comerciales suelen tener menos cobertura.
- Investigacion sobre alineacion y seguridad: la model card documenta el metodo de ablacion y sus resultados preliminares, lo que lo convierte en un objeto de estudio util para analizar como la edicion de pesos afecta al comportamiento de rechazo y a la calidad de la tarea original.
- Atencion al cliente multilingue en sectores regulados: despliegue en servidor propio con pesos abiertos bajo licencia Apache 2.0, sin enviar datos de clientes a APIs de terceros, con el nivel Quality (17,8 GB) para priorizar fidelidad de traduccion.
- Experimentacion academica en traduccion automatica: permite comparar el modelo original frente a la variante ablacionada con un coste de hardware reducido, evaluando la retencion de calidad mediante metricas como chrF o BLEU.

## Benchmarks y rendimiento

El autor no publica benchmarks formales. Solo se incluyen pruebas preliminares de regresion, definidas explicitamente como no concluyentes.

Prueba de retencion de traduccion sobre 56 muestras simples, comparando la salida del modelo modificado con la del modelo original (no con referencias humanas):

| Metrica | Valor |
|---|---|
| chrF medio | 0,9529 |
| BLEU medio | 0,6010 |

chrF por idioma en la misma prueba:

| Idioma | chrF |
|---|---|
| Coreano | 1,000 |
| Chino | 1,000 |
| Arabe | 0,974 |
| Espanol | 0,973 |
| Ingles | 0,965 |
| Frances | 0,917 |
| Japones | 0,842 |

Prueba de comportamiento de rechazo sobre 119 prompts en 7 idiomas:

| Resultado | Recuento |
|---|---|
| COMPLY | 119 / 119 (100 %) |
| REFUSE | 0 / 119 (0 %) |

Advertencias del propio autor sobre estas cifras: el chrF de 0,9529 mide similitud respecto a las salidas del modelo original, no precision ni calidad absoluta de traduccion; el conjunto de prueba es muy pequeno; el resultado de japones se vio afectado por limites de longitud de generacion en la configuracion de prueba; la deteccion de rechazo usa coincidencia simple de palabras clave y solo examina los primeros 120 caracteres de la respuesta. No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de fichero, mas overhead de cache KV y buffers que no se detalla en la model card):
  - APEX Mini (10,8 GB): en torno a 12-13 GB para contexto corto.
  - APEX Compact (13,2 GB): en torno a 15-16 GB para contexto corto.
  - APEX Quality (17,8 GB): en torno a 19-21 GB para contexto corto.
- GPU recomendadas: RTX 4090 (24 GB) para el nivel Quality; RTX 4080 / 4070 Ti Super (16 GB) para Compact; RTX 4070 / 3060 de 12 GB para Mini. En el extremo profesional, A100, H100 o L40S permiten ejecutar cualquier nivel con contexto amplio y lotes mayores.
- Cabe en GPU de consumo: si, en los tres niveles con tarjetas de 12 GB o mas, siempre que la longitud de contexto sea moderada. Al ser un MoE con unos 3000 millones de parametros activos, es viable el offload parcial de expertos a CPU si la VRAM es insuficiente.
- Opciones de despliegue: `llama.cpp` (la model card confirma soporte de la arquitectura `hy_v3`); por extension, cualquier herramienta que incorpore esa version de `llama.cpp`, como Ollama o LM Studio. Compatibilidad con vLLM, TGI u otros servidores: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dependeran de la GPU, del nivel de cuantizacion y del grado de offload a CPU.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables, por lo que la comparativa se limita a la variante editada frente a su modelo base, unico punto de referencia documentado.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B-Uncensored-v1-APEX (este modelo) | 30B totales / ~3B activos | no disponible | GGUF (3 niveles APEX) | Apache 2.0 | Publicado, 0 descargas, 0 likes |
| tencent/Hy-MT2-30B-A3B (modelo base) | 30B totales / ~3B activos | no disponible | BF16 | no disponible | Publicado por Tencent |
| Otras alternativas de traduccion multilingue | no disponible | no disponible | no disponible | no disponible | Sin datos en la busqueda web |

Diferencias conocidas entre la variante editada y el modelo base: la variante incorpora la ablacion direccional/ortogonal, presenta tres cuantizaciones GGUF, tiene menor comportamiento de rechazo declarado en la prueba preliminar y una retencion media de chrF de 0,9529 frente a las salidas del original en 56 muestras.

## Limitaciones y advertencias

- Version experimental: el propio autor indica que la publicacion no ha pasado pruebas extensas ni rigurosas y que pueden existir regresiones de traduccion no detectadas o problemas especificos de idioma.
- Pruebas no concluyentes: el conjunto de retencion tiene 56 muestras y el de rechazo 119 prompts con deteccion por palabras clave y solo los primeros 120 caracteres. No son benchmarks de seguridad ni de calidad.
- Regresion observada en japones: chrF de 0,842, aunque el autor atribuye parte del resultado a limites de longitud de generacion en la configuracion de prueba.
- Sin calibracion imatrix: las tres cuantizaciones APEX se generaron sin `imatrix.dat`, lo que puede penalizar la calidad respecto a cuantizaciones calibradas del mismo modelo.
- Sesgos: no hay informacion disponible sobre sesgos evaluados. Al tratarse de una variante sin censura, es esperable que reproduzca y genere contenido sesgado, ofensivo o ilegal presente en los datos del modelo original, con menos filtrado que la version base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de traduccion, el riesgo se traduce en omisiones, adiciones o invencion de terminos.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada. Los 36 idiomas declarados no implican el mismo nivel de calidad en todos los pares; la propia tabla de retencion muestra diferencias de 0,842 a 1,000 entre idiomas.
- Licencia: Apache 2.0 segun la model card, lo que permite uso comercial. Debe verificarse la licencia del modelo base de Tencent, que no se detalla en el material proporcionado, ya que una licencia mas restrictiva en el origen podria condicionar la redistribucion.
- Cifras de adopcion nulas (0 descargas, 0 likes) y fecha de publicacion reciente: no existe validacion independiente por parte de la comunidad.
- La informacion sobre compatibilidad con `llama.cpp` aparece truncada en la model card proporcionada, por lo que el soporte de la arquitectura `hy_v3` se conoce de forma parcial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF
- Modelo base de Tencent: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Repositorio de APEX / LocalAI: https://github.com/mudler/LocalAI/tree/master
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo, su arquitectura o benchmarks asociados; los resultados devueltos corresponden a un directorio de sitios web en arabe sin relacion con el modelo.
