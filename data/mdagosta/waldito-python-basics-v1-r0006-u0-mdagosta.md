# mdagosta/waldito-python-basics-v1-r0006-u0-mdagosta

## Resumen

`mdagosta/waldito-python-basics-v1-r0006-u0-mdagosta` es un modelo de generacion de texto publicado por el usuario mdagosta en el marco del proyecto OpenWALDO, un esfuerzo de preentrenamiento distribuido con trazabilidad de procedencia documentado en el repositorio `mdagosta/waldo-builds`. Se distribuye como un export estandar compatible con la libreria Transformers y se apoya en la arquitectura Llama de lenguaje causal, con un tokenizer de bytes propio del proyecto (schema-1 de OpenWALDO) que obliga a cargarlo con `trust_remote_code=True`.

El dato mas relevante es su tamano: 9.541.632 parametros reales declarados en los pesos safetensors, lo que lo situa en la categoria de modelos enanos (por debajo de los 10 millones de parametros), muy lejos de los modelos conversacionales habituales. El identificador del repositorio (`python-basics`, con sufijos de version `v1`, revision `r0006` y unidad `u0`) sugiere un ajuste orientado a fundamentos de Python, aunque la model card no confirma la composicion del dataset ni el proceso de entrenamiento.

Su relevancia es fundamentalmente experimental y de investigacion: sirve como artefacto reproducible para estudiar el pipeline de exportacion de OpenWALDO, la trazabilidad mediante `BOM.json` y la divulgacion de contenidos de entrenamiento exigida por la normativa europea de GPAI (`EU-BOM.json`). No cuenta con descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje causal tipo Llama (arquitectura estandar de Transformers) |
| Parametros totales | 9.541.632 (dato real declarado en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el nombre del repositorio apunta a contenido tecnico en Python) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | OpenWALDO schema-1, tokenizer de bytes; requiere `trust_remote_code=True` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura estandar de modelo de lenguaje causal Llama de Transformers. Con 9.541.632 parametros totales, se trata de una configuracion muy reducida: para ponerlo en perspectiva, es aproximadamente 13 veces mas pequeno que GPT-2 small (124M) y dos ordenes de magnitud menor que un modelo de 1B. No se especifican en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud de contexto nativa ni si se emplean variantes como GQA, RoPE o atencion con ventana deslizante.

El elemento diferencial no es la arquitectura, sino el ecosistema de empaquetado. El export incorpora un tokenizer de bytes propio (OpenWALDO schema-1) que no forma parte de la libreria estandar y exige ejecucion de codigo remoto al cargarlo. Ademas, el repositorio incluye `BOM.json`, que inventaria todos los ficheros de la release, y `EU-BOM.json`, que contiene el mapeo de divulgacion de contenidos de entrenamiento exigido por la regulacion europea de modelos de IA de proposito general. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO, SFT ni sobre tecnicas de optimizacion como decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por la arquitectura Llama causal.
- Generacion de fragmentos de codigo Python plausibles y respuestas sobre sintaxis elemental, segun sugiere el nombre del repositorio; no confirmado por la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible y poco probable dada la escala del modelo.
- Capacidades multilingues: no disponibles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Reproduccion de investigación en procedencia de datos: el repositorio incluye `BOM.json` y `EU-BOM.json`, por lo que sirve como ejemplo practico de como documentar la cadena de custodia de un modelo pequeno de cara a requisitos de divulgacion regulatoria.
- Pruebas de integracion del tokenizer OpenWALDO schema-1: util para validar que un pipeline propio carga correctamente un tokenizer de bytes ajeno a la libreria estandar mediante `trust_remote_code=True`, antes de aplicarlo a modelos mayores del mismo proyecto.
- Prototipado de pipelines de inferencia en Transformers: al ocupar decenas de megabytes, permite iterar rapidamente sobre codigo de carga, tokenizacion, generacion y serializacion sin consumir recursos de GPU.
- Educacion y demostraciones docentes: sirve para ilustrar el funcionamiento interno de un transformer causal completo (tokenizacion, atencion, decodificacion) en un tamano que cabe en cualquier portatil, incluso en CPU.
- Pruebas de CI/CD para infraestructura de modelos: validar flujos de descarga, verificacion de safetensors, comprobacion de hashes del BOM y despliegue en entornos de test es mas rapido y barato con un modelo de 9,5M de parametros que con uno de miles de millones.
- Generacion de texto auxiliar de bajo coste en el borde: tareas triviales como autocompletado de plantillas o etiquetado de fragmentos cortos, siempre que la calidad se valide empiricamente, ya que no hay evaluaciones publicadas que la respalden.
- Experimentacion con ajuste fino a pequena escala: el tamano permite entrenar o hacer fine-tuning completo en una unica GPU de consumo, util para estudiar recetas de entrenamiento antes de escalarlas.
- Comparativas de eficiencia y latencia en el borde: referencia para medir consumo de memoria, tiempo hasta el primer token y throughput en dispositivos como Raspberry Pi o moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan datos de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, ni tampoco evaluaciones cualitativas o comparativas realizadas por el autor.

## Requisitos de hardware

- VRAM para inferencia (estimacion a partir del numero de parametros, sin contar cache KV ni overhead del runtime):
  - fp32: aproximadamente 38 MB de pesos.
  - fp16 / bf16: aproximadamente 19 MB de pesos.
  - int8: aproximadamente 9,5 MB de pesos.
  - int4: aproximadamente 4,8 MB de pesos.
- La cache KV y el overhead de activaciones dependen del numero de capas, cabezas y contexto maximo, datos no disponibles; en cualquier caso seran marginales frente a los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es mas que suficiente; tambien funciona en CPU sin problemas. No se requieren A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en GPU integradas y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag presente) y endpoints compatibles. La arquitectura Llama es compatible en teoria con llama.cpp, Ollama y vLLM, pero el tokenizer personalizado con `trust_remote_code=True` puede complicar la conversion a GGUF y su uso en runtimes que no ejecutan codigo Python arbitrario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas objetivas de arquitectura y distribucion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0006-u0 | 9,54 M | no disponible | no disponible | HuggingFace, repo vacio (0.0 GB), 0 descargas | no disponible |
| GPT-2 small | 124 M | 1024 tokens | MIT | Ampliamente disponible | Si (evaluaciones historicas) |
| DistilGPT2 | 82 M | 1024 tokens | MIT | Ampliamente disponible | Si (evaluaciones historicas) |
| TinyStories-33M | 33 M | 512 tokens (segun variante) | MIT (variantes) | HuggingFace | Si, sobre el corpus TinyStories |

Los dos primeros modelos y TinyStories son referencias habituales para la franja de 10 a 150 millones de parametros. El modelo analizado se distingue por su tamano aun menor y por su enfoque en trazabilidad regulatoria, no por su calidad generativa, que no ha sido evaluada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni evaluacion de sesgos.
- Riesgo de alucinacion: muy alto. Con 9,54 M de parametros, la capacidad de retener conocimiento factual y de mantener coherencia en generaciones largas es estructuralmente limitada; no debe usarse como fuente de informacion sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y los idiomas soportados no se declaran. El nombre del repositorio apunta a contenido tecnico en Python, probablemente en ingles.
- Licencia: no disponible. Al no especificarse una licencia, no puede asumirse permiso para uso comercial, redistribucion ni modificacion; en ausencia de terminos explicitos, el regimen por defecto es restrictivo.
- Riesgo de seguridad: la carga del tokenizer requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python incluido en el repositorio. Debe revisarse el codigo antes de cargarlo y evitarse en entornos de produccion no aislados.
- Compatibilidad limitada fuera de Transformers: los runtimes que no soportan codigo remoto (parte del ecosistema GGUF, algunas plataformas de inferencia gestionada) pueden no ser capaces de cargar el tokenizer.
- Estado del repositorio: 0 descargas, 0 likes y un tamano reportado de 0.0 GB. Conviene verificar que los ficheros de pesos estan efectivamente accesibles antes de planificar cualquier integracion.
- Ausencia de evaluacion: no hay benchmarks ni validacion independiente, por lo que no es posible estimar su calidad frente a alternativas establecidas de tamano comparable.
- Uso en produccion: no recomendado como modelo generativo de proposito general. Su valor esta en la investigacion, la docencia y la validacion de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0006-u0-mdagosta
- Version relacionada (r0003, unidad u1): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- Repositorio de preentrenamiento distribuido waldo-builds: https://github.com/mdagosta/waldo-builds/blob/main/README.md
- Ficheros de inventario y divulgacion incluidos en el repo: `BOM.json` y `EU-BOM.json` (referenciados en la model card; no se dispone de URL directa verificada)
- Paper, blog o demo adicionales: no disponibles en los resultados de busqueda proporcionados
