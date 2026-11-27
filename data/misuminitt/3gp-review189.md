# misuminitt/3gp-review189

## Resumen

El modelo `misuminitt/3gp-review189` es un clasificador de texto experimental para indonesio, desarrollado por el usuario misuminitt como parte del proyecto personal 3GP, posteriormente reutilizado en un curso de inteligencia artificial. No es un modelo de lenguaje generativo: es una red convolucional a nivel de byte (byte-CNN) entrenada desde cero para asignar a un texto una de tres etiquetas relacionadas con apuestas: `gambling_promotion`, `gambling_discussion` y `other`. Su funcion es asistir a revisores humanos en la priorizacion e inspeccion de contenido, nunca sustituir una decision humana.

La arquitectura es deliberadamente minima: 39.715 parametros totales, sin modelo preentrenado de base, con embeddings de bytes UTF-8 de 32 dimensiones y tres convoluciones unidimensionales de 64 canales. El contexto de entrada esta limitado a los primeros 2.048 bytes UTF-8 del texto, un limite por bytes y no por tokens o palabras. Los pesos se distribuyen en safetensors en FP32 y la inferencia se realiza mediante codigo PyTorch local propio, sin interfaz `AutoModel` ni `pipeline` de Transformers.

Su relevancia es acotada y de caracter metodologico: sirve como ejemplo de pipeline de clasificacion de contenido con intervencion humana obligatoria, auditoria de procedencia de datos y separacion estricta entre entrenamiento, desarrollo y test. Los resultados publicados (89,29% de exactitud en test, macro F1 de 0,6285) son exploratorios, ya que el propio autor advierte que los datos de test tuvieron exposicion durante el desarrollo y que el modelo clasifico correctamente 0 de 3 ejemplos de discusion sobre apuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-CNN (red convolucional 1D sobre bytes UTF-8), sin transformer ni modelo preentrenado |
| Parametros totales | 39.715 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 bytes UTF-8 (limite por bytes, no por tokens) |
| Tipos de cuantizacion | no disponible (pesos exportados en FP32; no se documentan otras cuantizaciones) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | MIT (pesos y codigo de inferencia local; datasets y articulos originales conservan sus propios terminos) |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

La red embebe los bytes UTF-8 de entrada en 32 dimensiones y aplica tres convoluciones unidimensionales de 64 canales con kernels de 3, 5 y 7 bytes respectivamente. Sobre ellas se aplican activaciones GELU, un pooling global maximo enmascarado, dropout de 0,15 durante entrenamiento y una capa lineal final de tres clases. Los valores de byte se desplazan en uno y el cero se reserva para padding; mayusculas y puntuacion se preservan. No hay componente de atencion, ni estado recurrente, ni pesos preentrenados: el modelo se entrena integramente desde cero sobre los datos descritos.

El conjunto de entrenamiento consta de 133 ejemplos procedentes de una coleccion de 189 textos etiquetados manualmente (49 revisiones humanas previas mas 140 revisiones adicionales de un pool de texto archivado, seleccionadas para enriquecer la cobertura, en parte con asistencia lexica y de modelos anteriores). El split registrado es 133 de entrenamiento, 28 de desarrollo y 28 de test, con 189 textos unicos y 188 grupos de procedencia conectados. La auditoria no encontro solapamiento en claves exactas entre splits, pero no establecio independencia completa de los datos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de texto en tres clases: `gambling_promotion` (contenido que promueve servicios de apuestas o dirige a jugar, registrarse o depositar), `gambling_discussion` (noticias, educacion, critica, investigacion o discusion sin proposito promocional aparente) y `other` (contenido fuera de esas dos categorias).
- Salida de puntuaciones softmax no calibradas para las tres clases, junto con la clase predicha, la decision respecto a un umbral configurable y la marca `requires_human_review: true` en todos los casos.
- Procesamiento por lotes: la interfaz Python acepta hasta 4.096 textos por llamada y tamanos de lote de 1 a 128; la CLI admite multiples `--text` o un fichero JSON de hasta 1 MiB.
- Inferencia local sin descargas en tiempo de ejecucion y sin `trust_remote_code`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. No es un modelo generativo.
- No verifica URLs, no consulta el estado actual de un sitio web ni valida dominios; solo procesa el texto que se le entrega.

## Casos de uso

- Priorizacion de colas de moderacion: el modelo puntua textos entrantes y permite a un revisor humano ordenar la cola por probabilidad de `gambling_promotion`, reduciendo el tiempo dedicado a triaje manual en volumenes moderados de contenido en indonesio.
- Filtro de primera pasada en pipelines de revision de contenido: integrado como paso previo a la revision humana, descarta o marca candidatos con puntuacion alta para inspeccion, manteniendo siempre la marca `requires_human_review`.
- Apoyo a equipos de analisis de medios: clasificacion de articulos archivados en indonesio para separar piezas informativas o educativas sobre apuestas (`gambling_discussion`) de contenido promocional.
- Investigacion academica y docencia: el modelo sirve como caso de estudio reproducible de pipeline de clasificacion con auditoria de procedencia, split controlado y evaluacion con macro F1, adecuado para practicas de evaluacion de modelos.
- Prototipado de sistemas de revision con intervencion humana: su licencia MIT y su inferencia en CPU (PyTorch `2.15.0+cpu`, safetensors `0.8.0`) permiten desplegarlo en entornos sin GPU para validar flujos de trabajo antes de invertir en modelos mayores.
- Clasificacion por lotes de textos cortos: gracias al limite de 2.048 bytes y al procesamiento por lotes de hasta 4.096 textos, encaja en tareas de etiquetado masivo de fragmentos breves (titulares, entradas de foro, descripciones) en indonesio.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exactitud en test | 25/28 (89,29%) |
| Macro F1 en test | 0,6285 |
| Ejemplos de `gambling_discussion` correctamente clasificados en test | 0 de 3 |

El autor advierte que los datos de test tuvieron exposicion durante el desarrollo, por lo que estos resultados son exploratorios y no constituyen una estimacion independiente de calidad en despliegue. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 39.715 parametros en FP32 el modelo ocupa del orden de decenas de kilobytes en memoria, muy por debajo de 1 GB en cualquier configuracion.
- GPU recomendadas: no se requieren; el autor documenta CPU como dispositivo por defecto y CUDA como opcion explicita cuando esta disponible. Cualquier GPU consumer (por ejemplo, series RTX 30xx o 40xx) es mas que suficiente, aunque innecesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: el paquete incluye `inference.py` propio con la clase `ByteCNNPredictor`; no soporta vLLM, llama.cpp, Ollama ni TGI, ni la interfaz `AutoModel`/`pipeline` de Transformers. Requiere Python 3.10 o superior, PyTorch y safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El procesamiento por lotes de hasta 128 y hasta 4.096 textos por llamada sugiere un throughput alto en CPU, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros clasificadores de contenido en indonesio en la informacion proporcionada. La siguiente tabla recoge solo los datos verificables del modelo y deja el resto como no disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| misuminitt/3gp-review189 | 39.715 | 2.048 bytes | Byte-CNN desde cero | MIT | Exactitud 89,29%, macro F1 0,6285 (test con exposicion) |
| Alternativas de clasificacion en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (133 ejemplos) y no representativo de la web ni del archivo completo; el propio autor lo describe como muestra no representativa.
- Resultados de test con exposicion durante el desarrollo: la exactitud del 89,29% no debe interpretarse como estimacion independiente de calidad en produccion.
- Rendimiento nulo en la clase `gambling_discussion` en test (0 de 3), la clase con menos ejemplos de entrenamiento (16); riesgo alto de confusion entre discusion y promocion.
- Puntuaciones softmax no calibradas: los valores no representan probabilidades fiables y el umbral debe tratarse como ilustrativo.
- Contexto limitado a los primeros 2.048 bytes UTF-8: el contenido posterior se ignora por completo, lo que puede perder senal relevante en textos largos.
- Solo idioma indonesio; no se documenta comportamiento en otros idiomas.
- No verifica URLs ni el estado actual de sitios web; sus predicciones no constituyen aprobacion de reporte, decision de bloqueo ni determinacion legal.
- La etiqueta `other` no implica que un sitio sea seguro o legal.
- Licencia MIT para pesos y codigo de inferencia, pero los datasets de origen y los articulos subyacentes conservan sus propios terminos; el uso comercial de los datos originales queda fuera del alcance de la licencia MIT del modelo.
- La auditoria de splits no establecio independencia completa de los datos, solo ausencia de solapamiento en claves exactas.
- No soporta la interfaz estandar de Transformers, lo que limita su integracion en ecosistemas que dependen de `AutoModel` o `pipeline`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/misuminitt/3gp-review189
- Repositorio del proyecto y fuente de investigacion: https://github.com/misuminitt/3gp
