# freelion/DAVID-lfm2-1.2b-8bit-mlx

## Resumen

DAVID-lfm2-1.2b-8bit-mlx es una cuantizacion a 8 bits en formato MLX del modelo freelion/DAVID-lfm2-1.2b-full, publicada por el usuario freelion para inferencia local en Macs con Apple Silicon. Se distribuye bajo licencia MIT, con pesos en safetensors y la libreria mlx, y esta especializado en la deteccion de dark patterns (patrones de diseno manipulativos) y tareas de seguridad, aunque su pipeline declarado es text-generation.

El modelo parte del tag lfm2, lo que lo situa en la familia LFM2 (Liquid Foundation Models) de Liquid AI, si bien la model card no detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni el proceso de alineamiento empleado. Cuenta con 1.170.340.608 parametros reales (aproximadamente 1,17 mil millones) y un repositorio de 1,2 GB, un tamano que permite ejecutarlo en memoria unificada de equipos de consumo.

Su relevancia actual es doble: por un lado, cubre un nicho poco poblado, la deteccion automatica de practicas de diseno enganosas en interfaces y textos legales; por otro, demuestra un flujo de trabajo de cuantizacion y despliegue exclusivamente orientado a Apple Silicon mediante MLX, con latencias sub-segundo declaradas por el autor. La model card aporta datos de latencia medidos en un M2 Pro, pero no incluye resultados de benchmarks academicos ni validacion por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como lfm2; la model card no especifica la arquitectura) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en MLX; existe version en precision completa en freelion/DAVID-lfm2-1.2b-full |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato y libreria MLX) |
| Libreria de inferencia | mlx (mlx_lm) |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 11 de septiembre de 2026 |
| Fecha de ultima actualizacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo. El unico indicio es la etiqueta lfm2, que lo vincula a la familia LFM2 de Liquid AI, descrita publicamente por su desarrollador como una familia de modelos base con componentes hibridos; esta afirmacion procede de informacion externa y no esta confirmada en la documentacion del repositorio analizado. Tampoco se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni el tokenizador empleado.

Respecto al entrenamiento, no hay informacion disponible sobre el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otra tecnica de alineamiento, ni sobre el procedimiento de destilacion o fine-tuning que convierte el modelo base en un detector de dark patterns. La unica innovacion tecnica documentada es la propia cuantizacion a 8 bits en MLX, que reduce el peso del modelo a aproximadamente 1,2 GB para permitir inferencia en dispositivo con Apple Silicon. La model card tambien menciona una extension de navegador compatible con ChatGPT, Claude y Gemini, pero la URL aparece como marcador de posicion ("[extension-url]") y no es utilizable.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline declarado: text-generation).
- Clasificacion y deteccion de dark patterns en texto, segun las etiquetas dark-patterns y classification del repositorio.
- Tareas orientadas a seguridad (tag safety), presumiblemente identificacion de contenido o practicas enganosas.
- Inferencia local en dispositivo sobre Apple Silicon mediante MLX.
- Integracion prevista con una extension de navegador que opera sobre ChatGPT, Claude y Gemini (URL no disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible, no se mencionan en la model card.

## Casos de uso

- Auditoria de interfaces y flujos de usuario: el modelo puede analizar textos de interfaz (mensajes de confirmacion, botones, avisos de cancelacion) y senalar posibles patrones coercitivos, como opciones de rechazo ocultas o formulaciones de urgencia artificial.
- Revision de banners de cookies y avisos de consentimiento: adecuado para clasificar si el texto empuja al usuario a aceptar todo, un caso frecuente de dark pattern regulado por normativa europea de proteccion de datos.
- Moderacion y filtrado previo en plataformas de comercio electronico: deteccion de cuentas atras falsas, presion de compra o escasez inventada en fichas de producto y correos promocionales.
- Investigacion academica sobre patrones oscuros: al ejecutarse en local sobre un Mac, permite procesar corpus potencialmente sensibles sin enviarlos a servicios en la nube, lo que facilita el cumplimiento de requisitos de confidencialidad y RGPD.
- Etiquetado asistido y weak supervision: uso del modelo para pre-etiquetar grandes volumenes de texto que despues se revisan manualmente, reduciendo el coste de construir datasets de entrenamiento especializados.
- Prototipado rapido en escritorio: desarrolladores que necesitan validar una idea de clasificador de seguridad en un portatil Apple sin GPU dedicada ni conexion a internet, gracias al formato MLX de 8 bits.
- Extension de navegador para analisis en tiempo real: la model card menciona soporte para operar junto a asistentes como ChatGPT, Claude y Gemini, lo que permitiria marcar textos sospechosos mientras el usuario navega (funcionalidad no verificable, la URL de la extension es un marcador de posicion).
- Filtro de seguridad en pipelines generativos: como etapa de pre-filtrado que marque contenido promocional o de interfaz potencialmente enganoso antes de que llegue a un revisor humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye mediciones de latencia realizadas por el autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia mediana | 0,57 s | Apple M2 Pro |
| Latencia p95 | 0,98 s | Apple M2 Pro |
| Tasa de respuestas por debajo de 1 s | 96 % | Apple M2 Pro |
| Velocidad de decodificacion | 125 tok/s | Apple M2 Pro |

No se especifican la longitud de las entradas, el numero de tokens generados ni el prompt utilizado en estas mediciones, por lo que los valores no son directamente comparables con otras publicaciones. Los resultados de busqueda web recuperados durante la elaboracion de esta ficha no contienen informacion sobre el modelo: se limitan a paginas sobre husos horarios de California y son irrelevantes para esta evaluacion.

## Requisitos de hardware

- Memoria: los pesos en 8 bits ocupan aproximadamente 1,2 GB, por lo que el modelo deberia caber en unos 1,5-2 GB de memoria unificada contando la cache KV y el overhead del runtime de MLX.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M (M1 o posterior) con 8 GB o mas de memoria unificada; 16 GB es un margen comodo para lotes mayores o contextos mas largos.
- GPU recomendadas: Apple M2 Pro es la plataforma de referencia medida por el autor (0,57 s de latencia mediana, 125 tok/s). No hay datos publicados para M1, M3 o M4.
- GPU NVIDIA: no aplicable de forma directa. El repositorio esta publicado en formato MLX y no se ofrece una version GGUF ni safetensors estandar para CUDA.
- Opciones de despliegue: mlx_lm mediante las funciones load y generate de la libreria mlx-lm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: 0,57 s de mediana, 0,98 s en el percentil 95 y 125 tok/s de decodificacion en un M2 Pro, segun el autor.
- Requisitos de almacenamiento: 1,2 GB para el repositorio completo.

## Comparativa con modelos similares

La informacion disponible no permite comparar el rendimiento de DAVID con alternativas, ya que no se publican benchmarks. La tabla siguiente recoge unicamente caracteristicas estructurales y de licencia; los datos de los modelos alternativos proceden de su documentacion publica habitual y no han podido verificarse con los resultados de busqueda obtenidos en esta consulta.

| Modelo | Parametros | Contexto | Licencia | Formato MLX 8-bit | Especializacion |
|---|---|---|---|---|---|
| DAVID-lfm2-1.2b-8bit-mlx | 1,17 B | no disponible | MIT | si | Dark patterns y seguridad |
| LFM2-1.2B (Liquid AI) | aproximadamente 1,2 B | no verificado | licencia propia de Liquid AI | no verificado | Modelo base generalista |
| Qwen2.5-1.5B-Instruct | aproximadamente 1,5 B | 32.768 tokens (segun documentacion publica) | Apache-2.0 | existen conversiones de terceros | Asistente generalista |
| Llama-3.2-1B-Instruct | aproximadamente 1,2 B | 128.000 tokens (segun documentacion publica) | Llama 3.2 Community License | existen conversiones de terceros | Asistente generalista |

Ninguno de los modelos alternativos esta especializado en deteccion de dark patterns, por lo que la comparacion directa de calidad en esa tarea requeriria una evaluacion propia con un conjunto de datos etiquetado, que no esta disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el repositorio no publica ninguna evaluacion cuantitativa de precision, recall o F1 en deteccion de dark patterns, por lo que no hay evidencia verificable de su calidad.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentacion de terceros.
- Documentacion minima: el autor no describe el dataset de entrenamiento, el proceso de ajuste ni los criterios de etiquetado, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinacion: al ser un modelo generativo y no un clasificador con umbral calibrado, puede producir etiquetas inconsistentes o justificaciones inventadas.
- Solo ingles declarado: no hay garantia de funcionamiento en castellano ni en otros idiomas, algo critico si se pretende auditar interfaces en espanol.
- Longitud de contexto desconocida: no se indica el numero maximo de tokens, por lo que puede truncar documentos largos (politicas de privacidad, terminos de uso) sin aviso.
- Perdida de precision por cuantizacion: la version de 8 bits puede degradar ligeramente la calidad frente a freelion/DAVID-lfm2-1.2b-full, especialmente en tareas de clasificacion fina.
- Dependencia de plataforma: el formato MLX limita la ejecucion a Apple Silicon; no hay pesos GGUF ni safetensors estandar para GPUs NVIDIA o AMD.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero se deben revisar las condiciones del modelo base LFM2 de Liquid AI antes de explotarlo en produccion.
- Enlace roto en la documentacion: la extension de navegador mencionada apunta a un marcador de posicion sin URL real, y no hay version en precision completa enlazada de forma verificable mas alla de la referencia al repositorio.
- Los resultados de busqueda disponibles no aportan informacion tecnica sobre el modelo, por lo que no ha sido posible contrastar las afirmaciones del autor con fuentes independientes.

## Enlaces

- Repositorio HuggingFace (version 8 bits MLX): https://huggingface.co/freelion/DAVID-lfm2-1.2b-8bit-mlx
- Modelo en precision completa: https://huggingface.co/freelion/DAVID-lfm2-1.2b-full
- Familia LFM2 de Liquid AI (referencia externa, no verificada en la informacion disponible): https://huggingface.co/LiquidAI
- Extension de navegador mencionada en la model card: no disponible (la URL figura como marcador de posicion)
- Resultados de busqueda web: no relevantes; las paginas recuperadas tratan sobre husos horarios de California y no contienen informacion sobre el modelo.
