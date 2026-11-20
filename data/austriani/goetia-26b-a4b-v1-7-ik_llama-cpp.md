# Austriani/Goetia-26B-A4B-v1.7-ik_llama.cpp

## Resumen

Goetia-26B-A4B-v1.7-ik_llama.cpp es una publicacion de pesos alojada en Hugging Face por el usuario Austriani. Por el identificador se deduce que se trata de un modelo de arquitectura MoE (mezcla de expertos) con aproximadamente 26 000 millones de parametros totales y unos 4000 millones de parametros activos por token, empaquetado especificamente para su uso con la implementacion `ik_llama.cpp`, un fork optimizado de llama.cpp orientado a rendimiento en CPU y GPU de gama media. La model card publicada no contiene mas informacion tecnica que la declaracion de licencia Apache 2.0.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el repositorio no registra descargas ni interacciones en el momento de la consulta. No se han publicado datos sobre el proceso de entrenamiento, la composicion del dataset, los idiomas soportados ni resultados de evaluacion.

La relevancia de esta ficha es limitada por la ausencia de documentacion tecnica: se trata de un artefacto de pesos sin model card descriptiva, por lo que cualquier evaluacion rigurosa requiere inspeccion directa de los ficheros del repositorio y pruebas empiricas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), inferida del identificador "26B-A4B"; no confirmada en la model card |
| Parametros totales | 26B (inferido del identificador; no confirmado) |
| Parametros activos | 4B (inferido del identificador "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el sufijo "ik_llama.cpp" sugiere formatos compatibles con llama.cpp (GGUF), sin confirmar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; presumiblemente GGUF por compatibilidad con ik_llama.cpp, sin confirmar |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de lo que sugiere el nombre del repositorio. El patron "26B-A4B" es habitual en la nomenclatura de modelos MoE que indican parametros totales y parametros activos por token, lo que implicaria un transformer con capas de mezcla de expertos dispersas, pero la model card no lo confirma ni detalla el numero de expertos, el mecanismo de enrutamiento ni la dimension de las capas.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo, matematicas o multilingue), ni sobre tecnicas de alineacion como RLHF, DPO o instruction tuning. Se desconoce si el modelo base es un entrenamiento desde cero o un fine-tuning de otro modelo. El sufijo `ik_llama.cpp` indica unicamente que los pesos se han preparado o verificado para su carga en esa implementacion concreta, no aporta informacion sobre el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable en cualquier modelo de lenguaje, no documentada explicitamente.
- Razonamiento y conocimiento general: no disponible.
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en entornos con CPU exclusivamente: el empaquetado para `ik_llama.cpp` sugiere que el modelo esta pensado para inferencia eficiente en CPU o en configuraciones hibridas CPU/GPU; seria adecuado para servidores sin aceleradores dedicados, siempre que se validen los pesos.
- Prototipado local en estaciones de trabajo: un MoE de 26B con 4B activos puede ofrecer un equilibrio entre calidad y coste computacional en maquinas de gama alta para desarrollo, aunque la falta de benchmarks impide garantizar la calidad de salida.
- Evaluacion comparativa de implementaciones: util para medir el rendimiento de `ik_llama.cpp` frente a llama.cpp estandar sobre un mismo conjunto de pesos.
- Experimentacion academica con arquitecturas MoE: sirve como objeto de estudio para analizar el comportamiento de un modelo de ~26B con ~4B activos, incluida la distribucion de carga entre expertos.
- Fine-tuning posterior: al estar bajo Apache 2.0, puede servir como base para ajuste supervisado o DPO en dominios especificos, sujeto a la verificacion de que los pesos son funcionales.
- Integracion en pipelines de generacion por lotes: si el rendimiento en CPU es aceptable, podria emplearse en tareas de procesamiento masivo de texto sin GPU, como clasificacion o resumen, previa validacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa basada en el tamano declarado, un modelo de 26B en cuantizacion de 4 bits requeriria del orden de 14-16 GB solo para los pesos; en 8 bits, unos 26-28 GB; en FP16, unos 52 GB. Estas cifras son estimaciones derivadas del numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 (24 GB) podria alojar una cuantizacion de 4 bits con margen limitado para el contexto; A100 40/80 GB o H100 permitirian cuantizaciones mayores y contextos mas largos.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits en GPUs con 16-24 GB, sin confirmar.
- Opciones de despliegue: `ik_llama.cpp` es la opcion indicada por el nombre del repositorio; llama.cpp, Ollama y otros runners compatibles con GGUF podrian funcionar si los pesos estan en ese formato, lo que no se ha verificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.7-ik_llama.cpp | 26B (inferido) | 4B (inferido) | no disponible | Apache 2.0 | Hugging Face, sin descargas registradas |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | Ampliamente disponible |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Apache 2.0 | Ampliamente disponible |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32k | licencia propia | Ampliamente disponible |

La comparativa es puramente estructural: no existen datos de rendimiento del modelo Goetia que permitan situarlo frente a estas alternativas. Los modelos citados se incluyen por proximidad en el regimen de parametros activos y por licencia permisiva.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre entrenamiento, datos, evaluacion ni uso previsto, lo que impide garantizar un comportamiento adecuado en produccion.
- Cero descargas y cero interacciones registradas: no hay evidencia de que los pesos hayan sido validados por terceros.
- Riesgo de alucinacion: no evaluado; sin benchmarks no puede acotarse.
- Sesgos conocidos: no documentados; cualquier sesgo del corpus de entrenamiento es desconocido.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana maxima y la cobertura linguistica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre el contenido generado ni sobre posibles reclamaciones de terceros si los pesos derivan de un modelo con licencia mas restrictiva, extremo que no puede verificarse con la informacion disponible.
- Compatibilidad: el sufijo `ik_llama.cpp` sugiere dependencia de un fork concreto; la carga en otras herramientas no esta garantizada.
- Fecha de publicacion futura (2026-11-20) en los metadatos: conviene verificar la integridad del repositorio antes de su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Austriani/Goetia-26B-A4B-v1.7-ik_llama.cpp
- Repositorio de ik_llama.cpp (fork de llama.cpp referenciado en el nombre): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible
