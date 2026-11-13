# bambocher/Qwen3.5-9B-oQ2.7e-mtp

## Resumen

Qwen3.5-9B-oQ2.7e-mtp es una cuantizacion mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos comprimidos mediante oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple. El checkpoint conserva la cabeza MTP (multi-token prediction) y el codificador de vision del modelo original, lo que lo hace apto tanto para generacion de texto como para tareas multimodales.

El interes practico de esta publicacion radica en el espacio que ocupa: 4,634 GiB en almacenamiento real para 9.653 millones de parametros, con un promedio efectivo de 4,124 bits por peso. Esa cifra permite ejecutar un modelo de casi 10.000 millones de parametros en equipos con memoria unificada moderada (Mac con 16-24 GB de RAM), algo imposible con el checkpoint en BF16, que rondaria los 19 GB. La distribucion de bits no es uniforme: las capas mas sensibles conservan 5 y 8 bits, mientras que el grueso del modelo se reparte entre 2 y 3 bits.

La ficha se enfrenta a una limitacion importante de informacion: el autor no documenta licencia, idiomas, pipeline ni resultados de evaluacion, y no se dispone de la model card del Qwen3.5-9B original en el material proporcionado. Todo lo que sigue se limita a lo verificable en los datos de la publicacion, marcando explicitamente como "no disponible" aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y torre de vision; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 2/3/4/5/8 bits con grupos de 64 y 128, mas BF16; promedio 4,124 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,879 GB / 3,612 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 4,976 GB / 4,634 GiB |

Distribucion de precision:

| Formato | Pesos logicos | Porcentaje | Bits efectivos |
|---|---|---|---|
| Affine 2-bit, grupo 64 | 2,047B | 21,204% | 2,50 |
| Affine 3-bit, grupo 128 | 4,468B | 46,290% | 3,25 |
| Affine 3-bit, grupo 64 | 1,017B | 10,537% | 3,50 |
| Affine 4-bit, grupo 64 | 0,210B | 2,173% | 4,50 |
| Affine 5-bit, grupo 64 | 1,420B | 14,708% | 5,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,007% | 8,50 |
| BF16 | 0,491B | 5,083% | 16,00 |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-9B, un transformer de la familia Qwen. Segun la metadata del repositorio, el modelo incorpora tres bloques diferenciados: un modelo de lenguaje de 8,954B de parametros, una torre de vision de 0,456B y una cabeza MTP de 0,243B. La presencia de la cabeza MTP indica que el modelo original soporta prediccion multi-token, una tecnica que permite decodificar varios tokens por paso y acelerar la inferencia, habitualmente combinada con decodificacion especulativa. La torre de vision confirma que el modelo base es multimodal (entrada de imagen ademas de texto), aunque no se detalla su arquitectura interna ni el proyector utilizado.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras fases de alineamiento. La unica informacion de proceso disponible corresponde a la cuantizacion: se aplico oQ de oMLX v0.7.3, una tecnica de precision mixta que asigna bits por capa o por tensor segun su sensibilidad, en lugar de aplicar una cuantizacion uniforme. El resultado es un checkpoint con un 21,2% de los pesos a 2 bits, un 56,8% a 3 bits, un 17% entre 4 y 5 bits, y un 5,1% conservado en BF16. Esta estrategia busca preservar la calidad en las capas criticas (probablemente embeddings, cabezas de atencion y proyecciones de salida) mientras comprime agresivamente el resto.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5 esta disenado para tareas de lenguaje general, aunque no se documentan capacidades especificas en la publicacion.
- Procesamiento de vision: la presencia de una torre de vision de 0,456B indica soporte de entrada de imagenes, presumiblemente para tareas de comprension visual (VQA, descripcion, OCR). No se detalla la resolucion ni el formato admitido.
- Prediccion multi-token (MTP): la cabeza dedicada de 0,243B sugiere soporte nativo de decodificacion especulativa o generacion multi-token, orientada a reducir latencia en inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 4,634 GiB, por lo que puede cargarse en un Mac con 16 GB de memoria unificada dejando margen para el contexto y el sistema. Es el caso de uso principal de esta publicacion.
- Prototipado rapido de aplicaciones multimodales: la torre de vision permite experimentar con pipelines de imagen y texto en local sin depender de APIs, aunque la cuantizacion agresiva puede degradar la precision en tareas visuales finas.
- Evaluacion de tecnicas de cuantizacion mixta: el repositorio documenta con detalle la distribucion de bits por tensor, lo que lo convierte en una referencia util para comparar oQ frente a cuantizaciones uniformes de 4 bits en terminos de calidad y tamano.
- Generacion de texto asistida en entornos sin GPU dedicada: al ejecutarse sobre Metal via MLX, permite desplegar un modelo de ~10B en portatiles Apple sin acelerador externo.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite experimentar con estrategias de decodificacion multi-token y medir su impacto en throughput sobre hardware Apple.
- Fines educativos y de investigacion: util para estudiar el efecto de la precision mixta (2-8 bits) en la calidad de salida de un modelo multimodal de ~10B, siempre que se acepte la ausencia de garantias de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de calidad tras la cuantizacion, ni tampoco datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint pesa 4,634 GiB en almacenamiento; en ejecucion hay que sumar la cache KV y el overhead del runtime MLX. Como referencia orientativa, un contexto corto deberia caber en 8-12 GB de memoria unificada, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple Silicon (series M1, M2, M3, M4 y superiores). No es un checkpoint pensado para CUDA.
- Compatibilidad con GPU de consumo: si, en Mac con memoria unificada de 16 GB o superior; en 8 GB el margen es muy ajustado y probablemente insuficiente con contextos largos.
- Opciones de despliegue: MLX y oMLX (libreria declarada). No se confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI, ya que el formato de cuantizacion oQ es especifico de oMLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.7e-mtp (este) | 9,653B | no disponible | safetensors MLX, oQ mixta | no disponible | Cuantizacion mixta con MTP y vision, 4,634 GiB |
| Qwen3.5-9B (original) | 9,653B (presumible) | no disponible | safetensors | no disponible | Referencia de calidad sin comprimir; no se dispone de su model card en la informacion proporcionada |
| Cuantizaciones uniformes de 4 bits de modelos ~9B | ~9B | variable | GGUF / MLX | variable | Tamano similar pero sin asignacion por capa; no se dispone de comparacion medida |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y tamano.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor o consultar la licencia del Qwen3.5-9B original antes de cualquier uso en produccion.
- Cuantizacion agresiva: el 21,2% de los pesos esta a 2 bits y el 56,8% a 3 bits. Es previsible una degradacion de calidad frente al modelo en BF16, especialmente en razonamiento complejo, matematicas y tareas de vision de detalle, aunque no se aportan mediciones que lo cuantifiquen.
- Riesgo de alucinacion: no se documenta ningun proceso de mitigacion ni evaluacion de fidelidad; el riesgo es el habitual en modelos de esta escala y probablemente mayor tras la compresion.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del que use el modelo base.
- Contexto desconocido: al no declararse la longitud de contexto, no es posible planificar aplicaciones que dependan de ventanas largas.
- Dependencia del ecosistema Apple: el formato oQ y la libreria MLX limitan el despliegue a hardware Apple Silicon; no hay ruta documentada hacia CUDA o CPU x86.
- Versionado: el autor actualizo el checkpoint el 2026-11-13 con oMLX v0.7.3 y recomienda volver a descargarlo; las copias anteriores pueden diferir en precision y calidad.
- Popularidad muy baja (37 descargas, 0 likes): no hay validacion de la comunidad ni informes independientes sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2.7e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
