# LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp es una cuantizacion de 6 bits en formato oQ6e, realizada con oMLX 0.6.4 en modo enhanced/imatrix, del modelo abliterado `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez deriva de `Qwen/Qwen3.8-Flash-Next`. El autor del repositorio es el usuario LMLiutenant y no se trata de un modelo entrenado desde cero, sino de una redistribucion cuantizada de pesos existentes: la innovacion esta en la asignacion de precision mixta y en la preservacion de componentes que habitualmente se pierden en los cuantizados, concretamente la torre de vision y la cabeza MTP (multi-token prediction).

El modelo es un Mixture-of-Experts disperso de aproximadamente 180.000 millones de parametros totales, con unos 125.000 millones en el modulo de lenguaje, unos 51.000 millones en el componente N-gram/PLE, unos 4.000 millones en la cabeza MTP y unos 6.000 millones de parametros activados por token. Consta de 48 capas, 512 expertos y activa 10 expertos enrutados mas 1 compartido. Mantiene la configuracion nativa de 262.144 tokens de contexto.

Su relevancia practica es que hace ejecutable en una maquina Apple Silicon de 128 GB un modelo de este tamano, apoyandose en la funcionalidad SSD N-gram Offload de oMLX para no mantener residente en memoria unificada todo el componente N-gram. Ademas, al ser una variante abliterada, carece de las direcciones de rechazo del modelo oficial, lo que lo orienta a entornos de investigacion y a despliegues controlados donde el usuario aporta sus propias salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse Mixture-of-Experts (MoE) con componente N-gram/PLE y cabeza MTP |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | ~6B activados; desglose: ~125B LM + ~51B N-gram embedding + ~4B MTP |
| Longitud de contexto | 262.144 tokens (configuracion nativa preservada) |
| Tipos de cuantizacion | oQ6e (6 bits, precision mixta), group size nominal 64, dtype no cuantizado BF16, modo enhanced/imatrix |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` con `license_name: qwen-community-1.0`); la model card del origen declara Apache-2.0, discrepancia no resuelta |
| Formato de pesos | safetensors compatibles con mlx-lm (cuantizacion MLX); no se distribuye GGUF en este repositorio |
| Capas | 48 |
| Expertos | 512 totales; 10 enrutados + 1 compartido activados por token |
| Vision | torre de vision preservada |
| MTP | cabeza multi-token prediction preservada |
| Libreria | mlx |
| Tamano del repositorio | 150,4 GB |
| Cuantizador | oMLX 0.6.4 |
| Modelo de sensibilidad usado | LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer sparse Mixture-of-Experts de 48 capas con 512 expertos, de los cuales se activan 10 enrutados mas 1 compartido por token, lo que da un regimen de activacion de aproximadamente 6.000 millones de parametros sobre un total de 180.000 millones. A esto se suma un componente N-gram/PLE de unos 51.000 millones de parametros, de gran tamano relativo, que es precisamente el que hace viable el despliegue en 128 GB gracias al offload a SSD, y una cabeza MTP de unos 4.000 millones de parametros orientada a la prediccion multi-token.

Este repositorio no documenta entrenamiento propio: la model card indica explicitamente que solo documenta la cuantizacion, y remite a la model card del modelo fuente para el metodo de abliteracion, los detalles de la direccion de rechazo y las notas de consistencia del MTP. La cuantizacion se aplico directamente desde los pesos BF16 abliterados, con modo enhanced/imatrix activado y usando como modelo de sensibilidad el propio build oQ5e del autor, con el argumento de que comparte linaje abliterado y ofrece mayor fidelidad como proxy que un modelo de sensibilidad de 4 bits. El group size nominal es 64, aunque el esquema de precision mixta oQ puede aplicar ajustes efectivos distintos en tensores seleccionados.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo de pensamiento (thinking) conmutable: la model card recomienda activar Lightning MTP para chat y razonamiento, y valorar desactivarlo en agentes de codigo.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de vision se preserva en la cuantizacion, por lo que acepta entradas multimodales.
- Tool calling / function calling: etiquetado explicitamente en el repositorio y dirigido a servir mediante la API compatible con OpenAI de oMLX.
- Prediccion multi-token (MTP) preservada, lo que habilita decodificacion especulativa interna y modos de generacion acelerada en oMLX.
- Razonamiento multi-paso y flujos agenticos, con la advertencia de que, al no existir comportamiento de rechazo, el modelo no se opondra a instrucciones inyectadas.
- Sin censura (abliterated): elimina la direccion de rechazo de los pesos originales, de modo que intenta la mayoria de peticiones sin las negativas de seguridad de la version oficial de Qwen.
- Capacidades multilingues: no disponible (no se documentan idiomas soportados en la informacion proporcionada).

## Casos de uso

- Asistente conversacional local en estacion de trabajo Apple Silicon: con 262.144 tokens de contexto, permite mantener hilos largos con documentacion extensa cargada en el prompt, sirviendo el modelo a traves de la API compatible con OpenAI de oMLX para integrarlo en un frontend propio.
- Analisis de documentos e imagenes en local: al conservar la torre de vision, se pueden procesar capturas, diagramas o paginas escaneadas junto con texto de instrucciones, sin enviar datos a servicios externos.
- Agentes de codigo con tool calling: el modelo puede invocar funciones registradas en pipelines de desarrollo; conviene tener en cuenta la advertencia sobre el bug de oMLX 0.7.0.dev1/dev2 que descarta silenciosamente llamadas a funciones no registradas en la ruta de streaming, y fijar la version 0.6.4 o posteriores corregidas.
- Investigacion sobre alineacion y comportamiento de rechazo: al ser un build abliterado con benchmarks comparables frente al modelo base no abliterado (`GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp`), resulta util para estudiar el efecto de la abliteracion sobre conocimiento general y razonamiento, con MMLU practicamente plano (~88%) y MMLU-Pro mas sensible al ancho de bits.
- Generacion de contenido sin filtros en entornos cerrados: redaccion tecnica o creativa donde las negativas del modelo oficial resultan un obstaculo, siempre dentro de un perimetro controlado y con revision humana.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de 6 bits en la serie oQ4e/oQ5e/oQ6e para medir la degradacion por ancho de bits en tareas de razonamiento (MMLU-Pro) manteniendo conocimiento general.
- Procesamiento batch de contexto largo en local: tareas de resumen o extraccion sobre documentos muy extensos, asumiendo el incremento de memoria por KV cache descrito por el autor (~102 GB a 4K frente a ~106 GB a 128K con offload activado).
- Base para despliegues experimentales con salvaguardas propias: al no incorporar guardarrailes, puede integrarse como motor de un sistema donde las politicas de seguridad se implementen en una capa externa.

## Benchmarks y rendimiento

Los datos siguientes proceden de pruebas locales realizadas por el autor con oMLX 0.7.0.dev2, limitadas por tiempo de computo y no por una suite academica estandarizada, y con el modo thinking desactivado.

| Benchmark | Muestras | oQ6e (este repo) | oQ5e (repo hermano) | oQ4e (jedisct1) | oQ5e (base, no abliterado) |
|---|---|---|---|---|---|
| MMLU | 2000 | 88,2% | 88,0% | 87,2% | 88,1% |
| MMLU-Pro | 1000 | 73,4% | 70,4% | 64,4% | 69,2% |

Notas del autor: a 2000 muestras, MMLU se mantiene plano en torno al 88% en los cuatro builds, dentro del ruido de muestreo, lo que indica paridad de conocimiento general entre los cuantizados abliterados y el build base. En MMLU-Pro la precision sube con el ancho de bits a lo largo de la serie oQ4e/oQ5e/oQ6e. Las ejecuciones de GSM8K y HumanEval con n=100 quedaron cerca del techo (90-98%) en todos los builds y se omitieron por no ser discriminativas; no se publican cifras por build para esas dos pruebas.

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Objetivo declarado: Apple Silicon con 128 GB de memoria unificada, con SSD N-gram Offload activado. Probado en un MacBook Pro con Apple M4 Max, 128 GB, bajo oMLX.
- Pico de asignacion MLX (pesos + KV + activaciones) medido por el autor: aproximadamente 102 GB a 4K de contexto y aproximadamente 106 GB a 128K, con SSD N-gram Offload activado. Son picos del asignador a nivel de proceso, no del sistema completo.
- Diferencia respecto al build oQ5e: unos 14 GB mas, correspondientes a los bits adicionales de los pesos.
- Sin SSD N-gram Offload el componente N-gram/PLE no se descarga a disco y la memoria necesaria aumentaria; la model card no cuantifica ese escenario, por lo que la cifra concreta es no disponible.
- Tamano del repositorio: 150,4 GB, lo que marca el requisito de almacenamiento (idealmente SSD rapido, dado el offload).
- GPU CUDA (A100, H100, RTX 4090): no disponible. Los pesos estan en formato MLX y la libreria declarada es mlx, orientada a Apple Silicon; no se distribuye GGUF ni pesos para llama.cpp, vLLM, TGI u Ollama en este repositorio.
- Opciones de despliegue documentadas: servidor oMLX con API compatible con OpenAI, con SSD N-gram Offload activado y Lightning MTP configurable. Los pesos son safetensors estandar compatibles con mlx-lm y, segun el autor, deberian cargar en mlx-lm y otras aplicaciones MLX, aunque no se ha probado.
- Latencia y throughput: no disponibles. La model card no publica medidas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | MMLU | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp | Este repositorio, cuantizacion 6 bits | ~180B totales, ~6B activos | 262.144 | 88,2% | 73,4% | qwen-community-1.0 |
| LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp | Repo hermano, 5 bits, mismo linaje abliterado | ~180B totales, ~6B activos | 262.144 | 88,0% | 70,4% | qwen-community-1.0 (no confirmado en la informacion disponible) |
| jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP | Cuantizado a 4 bits, linaje abliterado, contexto limitado a 100K segun su nombre | ~180B totales, ~6B activos | 100.000 (segun denominacion) | 87,2% | 64,4% | no disponible |
| GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp | Cuantizado a 5 bits sobre el modelo base no abliterado | ~180B totales, ~6B activos | 262.144 (configuracion nativa del modelo fuente) | 88,1% | 69,2% | no disponible |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | Modelo origen en BF16, abliterado | ~180B totales, ~6B activos | 262.144 | no disponible | no disponible | qwen-community-1.0 (la card fuente declara Apache-2.0) |

La comparativa se limita a los builds citados por el propio autor en la model card; no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura (abliterated): se han eliminado las direcciones de rechazo de los pesos de origen, de modo que intentara la mayoria de peticiones sin las negativas de seguridad de la version oficial. No incorpora guardarrailes adicionales.
- Riesgo en entornos agenticos: sin comportamiento de rechazo, el modelo no se opondra a instrucciones inyectadas. El autor advierte explicitamente de no exponerlo a entradas no confiables sin salvaguardas propias.
- Responsabilidad legal y de uso: el autor traslada al usuario la responsabilidad sobre el uso y el cumplimiento de la licencia y la legislacion aplicable.
- Discrepancia de licencia: la model card del repositorio fuente se etiqueta como Apache-2.0, lo que no coincide con el archivo de licencia que distribuye (Qwen Community License 1.0). Este repositorio hereda qwen-community-1.0 y recomienda revisar antes de usar o redistribuir. Es un punto critico para uso comercial.
- Bug conocido del motor: en oMLX 0.7.0.dev1 y dev2 existe un fallo que puede descartar silenciosamente llamadas a herramientas con nombres de funcion no registrados en la ruta de streaming (issue jundot/omlx#3660, abierto a fecha de 2026-09). No afecta a los pesos; la version 0.6.4 no esta afectada.
- Consumo de memoria elevado: requiere un objetivo de 128 GB de memoria unificada y depende de SSD N-gram Offload; sin esa funcionalidad el requisito de memoria no esta cuantificado y presumiblemente es mayor.
- Datos de rendimiento limitados: los benchmarks proceden de pruebas locales con tamanos de muestra reducidos (2000 y 1000 muestras), no de una suite academica estandarizada, y se realizaron con thinking desactivado. No hay resultados publicados con thinking activado.
- Idiomas soportados: no disponibles. No se documenta cobertura multilingue concreta para este build.
- Riesgo de alucionacion: no cuantificado en la informacion disponible; al tratarse de un modelo abliterado sin capa de rechazo, conviene validar las salidas en dominios facticos antes de llevarlas a produccion.
- Sesgos conocidos: no disponible. La model card no documenta evaluaciones de sesgo.
- Idoneidad en produccion: los pesos estan en formato MLX y no hay build GGUF ni soporte declarado para vLLM, TGI u Ollama, lo que restringe el despliegue a entornos Apple Silicon con oMLX o mlx-lm (estos ultimos sin probar por el autor).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp
- Build companero oQ5e: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizado oQ4e de referencia: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP
- Cuantizado oQ5e sobre base no abliterado: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp
- Issue del motor oMLX sobre descarte de tool calls: https://github.com/jundot/omlx/issues/3660
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente listados de comercio electronico de ropa (SHEIN, Allegro, Decathlon, Etsy) sin ninguna relacion con el modelo, por lo que no se aportan enlaces adicionales.
