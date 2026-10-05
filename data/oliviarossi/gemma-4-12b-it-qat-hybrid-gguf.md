# OliviaRossi/Gemma-4-12B-it-QAT-Hybrid-GGUF

## Resumen

Gemma-4-12B-it-QAT-Hybrid-GGUF es un repositorio de cuantizacion en formato GGUF publicado por el usuario OliviaRossi sobre el modelo OliviaRossi/Gemma-4-12B-it-QAT-Hybrid. No se trata de un entrenamiento nuevo, sino de una redistribucion optimizada para inferencia local: el autor aplica una cuantizacion Q5_K_L (Q5_K_M en las capas de atencion y MLP, con embeddings y LM head en Q8_0 sin perdida) y anade dos artefactos complementarios: un borrador MTP (multi-token prediction) para decodificacion especulativa y un proyector multimodal para vision.

El modelo base descrito por el autor es un "Geodesic Model Soup" que fusiona el modelo QAT oficial sin cuantizar de Google con su base instruction-tuned original. El resultado declarado pesa 11.907.350.576 parametros (aproximadamente 11,9 mil millones) y se distribuye bajo licencia apache-2.0 en un repositorio de 9,4 GB.

Su relevancia practica radica en que empaqueta, en un unico conjunto de ficheros con nombres emparejados 1:1, todo lo necesario para despliegue local en llama.cpp, LM Studio y Jan: modelo objetivo, borrador especulativo y proyector de vision. Aun asi, el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion independiente de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, transformer multimodal; el borrador usa `arch: gemma4-assistant`) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (los comandos de ejemplo usan `-c 16384`, valor configurable por el usuario) |
| Tipos de cuantizacion | Q5_K_L (Q5_K_M en atencion y MLP + Q8_0 en embeddings y LM head); borrador MTP en Q8_0; proyector multimodal en formato mmproj |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | OliviaRossi/Gemma-4-12B-it-QAT-Hybrid |
| Ficheros incluidos | `Gemma-4-12B-it-QAT-Hybrid-Q5_K_L.gguf` (~9,1 GB), `mtp-Gemma-4-12B-it-QAT-Hybrid-Q5_K_L.gguf` (~460 MB), `mmproj-Gemma-4-12B-it-QAT-Hybrid-Q5_K_L.gguf` (~175 MB) |
| Fecha de publicacion | 2026-10-05 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma 4 y de la presencia de una cabeza multimodal. El autor describe el modelo base como un "Geodesic Model Soup", es decir, una fusion de pesos entre el modelo QAT oficial sin cuantizar de Google y su base instruction-tuned original. Se trata, por tanto, de una combinacion de pesos ya entrenados, no de un entrenamiento desde cero ni de un proceso de ajuste adicional documentado.

Los dos componentes anadidos si estan caracterizados con mas detalle. El primero es un borrador MTP oficial, compatible con el modelo base, que requiere inicializar el grafo MTP no causal (mediante `--spec-type draft-mtp`) en lugar de un borrado causal estandar; se emplea con `--spec-draft-n-max 3`. El segundo es un proyector multimodal unificado orientado a analisis de imagen, OCR y comprension de documentos. El uso de QAT (quantization-aware training) en el modelo original es el que permite, segun el autor, mantener precision alta tras la cuantizacion a Q5_K_L. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras).

## Capacidades

- Generacion de texto conversacional e instruccional, derivada de la base `-it`.
- Razonamiento y generacion de codigo: no hay confirmacion explicita en la informacion disponible, aunque son capacidades esperables en un modelo instruccional de esta familia; no se aportan datos que las verifiquen.
- Vision multimodal: analisis de imagenes, OCR y comprension de documentos, mediante el proyector `mmproj` y el flag `--ubatch-size 2048`.
- Decodificacion especulativa acelerada mediante borrador MTP (`--spec-type draft-mtp --spec-draft-n-max 3`), con grafo MTP no causal.
- Integracion con llama.cpp, LM Studio y Jan, incluido el emparejamiento automatico de ficheros por convencion de nombres.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp o LM Studio en una estacion de trabajo con GPU consumer, manteniendo los datos en el equipo. Su naturaleza instruction-tuned y su cuantizacion Q5_K_L permiten respuestas de calidad razonable con un consumo de VRAM moderado.
- Analisis de documentos escaneados: con el proyector multimodal cargado (`--mmproj`), el modelo puede procesar imagenes de documentos para extraer texto (OCR) y responder preguntas sobre el contenido, util en flujos de digitalizacion y archivo.
- Atencion al cliente automatizada en entornos con requisitos de privacidad: al ejecutarse en local, evita enviar conversaciones a servicios externos; el contexto configurable (por ejemplo 16384 tokens) permite mantener historiales multi-turno largos.
- Aceleracion de inferencia en produccion de bajo volumen: el borrador MTP con decodificacion especulativa reduce el coste por token en escenarios donde la latencia importa, como asistentes interactivos o autocompletado.
- Prototipado de agentes con vision: el proyector multimodal permite construir prototipos que combinen entrada de imagen y texto, por ejemplo para inspeccion visual de capturas de pantalla o interfaces.
- Despliegue en estaciones sin conectividad: al ser un conjunto GGUF autocontenido, puede distribuirse en entornos aislados (sanidad, defensa, industria) donde no se permite acceso a APIs externas.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden usar este repositorio para medir el impacto de Q5_K_L con embeddings en Q8_0 frente a cuantizaciones mas agresivas, aunque no se publican metricas de referencia en la ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamanos de fichero: modelo objetivo ~9,1 GB, borrador MTP ~460 MB y proyector multimodal ~175 MB, lo que suma aproximadamente 9,7 GB de pesos en disco.
- VRAM estimada para inferencia: en torno a 10-11 GB solo para los pesos del modelo objetivo con Q5_K_L; hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada y de la arquitectura interna (no disponible). Una estimacion conservadora para 16384 tokens situa el total en el rango de 12-16 GB, valor orientativo y no confirmado por el autor.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM (RTX 4080, RTX 4090, RTX A4000 de 16 GB, A100, H100) permiten cargar el modelo completo en GPU con `-ngl 99`. Tarjetas de 24 GB ofrecen margen holgado para contexto largo y vision.
- Viabilidad en GPU consumer: si, en gamas de 16 GB o superiores. En GPUs de 8-12 GB sera necesario descargar capas a CPU, con la consiguiente perdida de rendimiento.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Jan. El autor documenta comandos verificados para los modos de decodificacion especulativa y vision.
- Latencia y throughput: no disponibles. El unico dato objetivo es que se recomienda `--spec-draft-n-max 3` para el borrador MTP, lo que sugiere una ventana de borrado de hasta 3 tokens por paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada. La unica referencia directa es el propio modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-QAT-Hybrid-GGUF (este) | ~11,9 B | no disponible | Q5_K_L + Q8_0 | apache-2.0 | GGUF para llama.cpp, LM Studio y Jan |
| OliviaRossi/Gemma-4-12B-it-QAT-Hybrid (base) | no disponible | no disponible | pesos originales (formato no indicado) | apache-2.0 | HuggingFace |
| Otras alternativas de ~12 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han facilitado datos que permitan comparar rendimiento, contexto o licencia frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion del modelo base ni del resultado cuantizado.
- Validacion nula por la comunidad: el repositorio registra 0 descargas y 1 like, por lo que no existe corroboracion independiente de que los ficheros funcionen como se describe.
- Precision de la cuantizacion: Q5_K_L es una cuantizacion de 5 bits con embeddings y LM head en Q8_0; aunque el QAT del modelo original mitiga la degradacion, no se aportan mediciones de la perdida de calidad respecto al base sin cuantizar.
- Coherencia de licencia: el autor declara apache-2.0, pero conviene verificar que esa licencia es compatible con las condiciones del modelo Gemma original de Google, habitualmente distribuidas bajo terminos propios. Es un punto critico antes de un uso comercial.
- Idioma: no se declaran idiomas soportados, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- Contexto: la longitud de contexto nativa no esta documentada; los ejemplos usan 16384 tokens como valor de configuracion, no como limite certificado del modelo.
- Vision: el proyector multimodal no se acompana de ninguna evaluacion de precision en OCR o comprension documental.
- Dependencia del ecosistema llama.cpp: el uso del borrador MTP requiere pasar argumentos adicionales concretos (`--spec-type draft-mtp --spec-draft-n-max 3`); omitirlos provoca que el motor intente un borrado causal estandar y no inicialice el grafo MTP.
- Origen de los pesos: se trata de una fusion ("model soup") realizada por el autor y posteriormente cuantizada, sin documentacion publica sobre el procedimiento de mezcla ni trazabilidad de los pesos resultantes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OliviaRossi/Gemma-4-12B-it-QAT-Hybrid-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Gemma-4-12B-it-QAT-Hybrid
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de Google DeepMind sobre Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs
- Banner de referencia citado en la model card: https://ai.google.dev/gemma/images/gemma4_banner.png
