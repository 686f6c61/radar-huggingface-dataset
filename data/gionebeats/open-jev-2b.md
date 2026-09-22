# gionebeats/Open-Jev-2B

## Resumen

Open-Jev-2B es un adaptador LoRA (PEFT) con una cabeza de decisión escalar entrenada sobre Qwen/Qwen3.5-2B. No es un modelo generativo: no produce texto autoregresivo, sino que puntúa directamente un conjunto de candidatos aportados por quien llama y devuelve decisiones tipadas. El repositorio lo publica el usuario gionebeats, aunque la model card y el cargador de referencia apuntan al proyecto Open-Jev del autor Zefan-Cai y al checkpoint ZefanCai/Open-Jev-2B.

El modelo cubre tres modos de decisión: Choice (probabilidades sobre un conjunto de candidatos y el más probable), Noul (probabilidad para una pregunta de sí/no) y Score (probabilidades sobre niveles ordinales y su valor esperado). Está pensado para integrarse como servidor de inferencia que devuelve claves declaradas y probabilidades, sin ejecutar acciones.

Es relevante porque propone un patrón distinto al del asistente generativo: decisiones estructuradas, calibradas y de bajo coste sobre un backbone de 2B, con una longitud máxima de entrada de 4.096 tokens por candidato evaluado de forma independiente. La evaluación completa publicada cubre 26.452 registros (10.532 de test y 15.920 fuera de distribución).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone de texto Qwen/Qwen3.5-2B; arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador (rango 8, alpha 16); el modelo base Qwen3.5-2B es de aproximadamente 2.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de entrada por candidato puntuado de forma independiente; la entrada se rechaza si lo supera, no se trunca. Contexto nativo del base no disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en precision completa via PEFT; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT + cabeza escalar); requiere Transformers 5.10.2 y PEFT 0.19.1 |
| Modelo base | Qwen/Qwen3.5-2B, revision fijada 15852e8c16360a2fea060d615a32b45270f8a8fc |
| Tipo de salida | Decisiones tipadas (choice, noul, score); no generativa |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA de rango 8 y alpha 16 acoplado a una cabeza de decisión escalar. La cabeza se inicializó a partir del readout preentrenado "Yes-minus-No" y se entrenó de forma conjunta con el adaptador LoRA. Se guarda una temperatura calibrada de 1,518796342858676, ajustada únicamente sobre 512 filas de calibración. El adaptador actúa sobre el backbone de texto de Qwen3.5-2B, y el pipeline genérico `AutoPeftModel` de generación de texto no implementa esta interfaz ni aplica la cabeza de decisión ni la temperatura guardada; es necesario el cargador específico del proyecto Open-Jev.

El entrenamiento consumió 20.204 pasos de optimizador con batch global 4, lo que equivale a 80.816 filas de entrenamiento, una pasada completa sobre el split de entrenamiento congelado `release-v2`. El commit de origen del entrenamiento es `99e881108c6cacadafd364088505e84975ca43fc` y el manifiesto de datos congelado tiene SHA-256 `56105dc9fc89ef74919f5beb60bb6ae8c6e17bb95699dab59205f67d8b338d97`. La ampliación posterior de datos (navegador/dron y cinco corpus de control de extracción) no forma parte de esta mezcla de entrenamiento.

## Capacidades

- Puntuacion de candidatos: dado un conjunto de opciones aportado por el llamador, devuelve probabilidades sobre cada una y la más probable (modo Choice).
- Preguntas binarias: devuelve una probabilidad para una pregunta de sí/no (modo Noul).
- Puntuacion ordinal: devuelve probabilidades sobre niveles ordinales suministrados y su valor esperado (modo Score).
- Decisiones tipadas con claves declaradas por el llamador, en lugar de texto libre.
- Calibración explícita: temperatura guardada y métricas de calibración (ECE, Brier, NLL) publicadas.
- Servidor de inferencia HTTP propio (`/v1/systemone`) con soporte de caché de prefijo opcional (desactivada en el ejemplo).
- Procesamiento de entradas de hasta 4.096 tokens por candidato, con rechazo explícito de entradas más largas.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso de forma nativa; esas capacidades no están documentadas en la información proporcionada.

## Casos de uso

- Clasificación de intención en atención al cliente: el ejemplo oficial del repositorio envía un estado ("me han cobrado dos veces y quiero un reembolso") y un conjunto de criterios (facturación, técnico, otro), y el modelo devuelve la probabilidad de cada intención sin generar texto, lo que reduce latencia y evita respuestas inventadas.
- Enrutado de tickets y colas de soporte: encaja cuando hay un conjunto cerrado de destinos y se necesita una probabilidad por destino para aplicar umbrales de confianza o derivar a revisión humana los casos con baja certeza.
- Moderación y cumplimiento de políticas: el modo Noul permite plantear comprobaciones de sí/no sobre contenido o acciones propuestas, con una probabilidad calibrada que sirve como señal para un guardarraíl previo a la ejecución.
- Puntuación ordinal de calidad: el modo Score devuelve la distribución sobre niveles definidos por el llamador (por ejemplo, satisfacción o severidad) junto con el valor esperado, útil para métricas continuas a partir de etiquetas discretas.
- Reranking de candidatos en pipelines de recuperación: el modelo puede puntuar un conjunto de fragmentos o respuestas candidatas generadas por otro sistema y devolver el orden por probabilidad, sin coste de decodificación autoregresiva.
- Anotación de datasets con etiquetas probabilísticas: al devolver distribuciones en lugar de una sola etiqueta, permite construir conjuntos con etiquetas blandas, pesos de confianza o análisis de acuerdo entre anotadores.
- Validación previa en flujos de agentes: dado que el servidor devuelve decisiones declaradas y no ejecuta acciones, puede colocarse como paso de aprobación/rechazo entre el plan de un agente y su ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de referencia. La model card sí publica una evaluación completa sobre datos retenidos, que se reproduce a continuación tal cual:

| Split | Filas totales | Aciertos duros / filas duras | Precision dura | Precision esperada | NLL | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Test | 10.532 | 9.515 / 10.046 | 94,71% | 91,95% | 0,195380 | 0,076117 | 0,011606 |
| OOD | 15.920 | 13.287 / 15.446 | 86,02% | 84,62% | 0,802990 | 0,246450 | 0,105594 |

Advertencias sobre esta tabla: la precisión dura excluye las filas con objetivo blando; la precisión esperada es la masa del objetivo de referencia en el candidato elegido y no una tasa de victoria ni de finalización de tareas; NLL, Brier y ECE usan todas las filas con la calibración guardada. No se evaluó ninguna línea base sobre el conjunto completo, por lo que estos números no establecen la ganancia del entrenamiento. El paquete original conserva además métricas muestreadas de 512 registros de test y 512 OOD en `package/metrics.json`, que no deben confundirse con la tabla de datos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone es de aproximadamente 2.000 millones de parametros, lo que supone unos 4-5 GB solo en pesos en FP16/BF16, más entre 1 y 2 GB de overhead de activaciones, caché y el servidor. Estimación orientativa: 8-10 GB en FP16 y 4-6 GB en cuantización de 4 bits (la cuantización no está documentada oficialmente para este adaptador).
- GPU recomendadas: el ejemplo oficial usa `--device cuda:0` sin especificar modelo. Por tamaño, cabe con holgura en una RTX 4090 (24 GB), RTX 4080, RTX 3090 o L4, y también en A100 y H100 si se necesita servir con mayor paralelismo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM para el tamaño de este backbone, aunque no se documenta una lista de compatibilidad.
- Opciones de despliegue: servidor propio del proyecto Open-Jev (`python -m jev.server`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; de hecho, el uso de `AutoPeftModel` para generación de texto no es válido para esta interfaz.
- Latencia y throughput: no disponibles. El único dato operativo indicado es `--batch-size 1`, `--max-length 4096` y caché de prefijo desactivada en el ejemplo de arranque.
- Detalle relevante: `--no-prefix-cache` aparece en el ejemplo oficial y la caché de prefijo es opcional; la validación A/B en GPU con el checkpoint real se describe como pendiente y separada.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables (otros adaptadores de decisión no generativos o cabezas de clasificación del mismo tamaño) en la documentación consultada. La única referencia directa es el modelo base:

| Aspecto | Open-Jev-2B | Qwen/Qwen3.5-2B (base) | Alternativas comparables |
|---|---|---|---|
| Parametros | Adaptador LoRA r=8 + cabeza escalar sobre base de ~2B | Aproximadamente 2.000 millones | No disponible |
| Contexto | 4.096 tokens de entrada por candidato | No disponible en la informacion proporcionada | No disponible |
| Tipo de salida | Decisiones tipadas con probabilidades | Generacion de texto autoregresiva | No disponible |
| Licencia | apache-2.0 | No disponible en la informacion proporcionada | No disponible |
| Formato de pesos | safetensors (PEFT) | safetensors (segun convencion, no confirmado aqui) | No disponible |
| Disponibilidad | Repositorio HuggingFace con 0 descargas y 0 likes; tamano de repo 0,0 GB | Publicado en HuggingFace | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no soporta generación de texto, tool calling, agentes, visión ni audio. Usarlo con `AutoPeftModel` para generación de texto no aplica la cabeza de decisión ni la temperatura guardada y produce resultados incorrectos.
- Dependencia estricta de revisiones: requiere la revisión exacta del modelo base `15852e8c16360a2fea060d615a32b45270f8a8fc` y el cargador del proyecto Open-Jev. Cualquier otra revisión o cargador invalida el checkpoint.
- Longitud de entrada limitada a 4.096 tokens por candidato; las entradas más largas se rechazan en lugar de truncarse, lo que puede provocar errores en producción si no se controla el tamaño.
- Degradación fuera de distribución: la precisión dura cae del 94,71% al 86,02% y el ECE sube de 0,011606 a 0,105594 entre test y OOD. La calibración no es uniforme fuera del dominio de entrenamiento.
- Discrepancia de datos: el split público `release-v2-redistributable` tiene 79.116 filas de entrenamiento y excluye 1.700 registros originales de `wikispeedia-v1`; no es byte a byte idéntico al conjunto de 80.816 filas usado para estos pesos, por lo que la reproducibilidad exacta del entrenamiento no está garantizada con los datos públicos.
- Sin línea base: la evaluación de datos completos no se comparó contra ningún baseline, así que no hay evidencia publicada de que el entrenamiento aporte mejora frente al modelo base.
- Calibración ajustada sobre una muestra pequeña: la temperatura se ajustó solo con 512 filas de calibración, lo que limita la confianza en la calibración en dominios distintos.
- Riesgo de alucinación: al no generar texto libre, el riesgo clásico de alucinación se sustituye por el de sobreconfianza en candidatos mal definidos por el llamador; si el conjunto de opciones es incompleto, el modelo seguirá asignando masa a opciones no deseadas.
- Sesgos conocidos: no disponibles. La model card no documenta análisis de sesgo ni composición demográfica del dataset.
- Idioma: no se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- Licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial depende también de los términos del modelo base Qwen/Qwen3.5-2B, que no se detallan en la información proporcionada.
- Estado del repositorio: 0 descargas, 0 likes y un tamaño de repositorio de 0,0 GB, lo que puede indicar una carga incompleta o reciente. La model card del repositorio de gionebeats describe un checkpoint descargable desde `ZefanCai/Open-Jev-2B`, una discrepancia que conviene verificar antes de desplegar.
- El servidor devuelve decisiones declaradas y no ejecuta las acciones propuestas; cualquier efecto sobre el mundo real debe implementarse y validarse aparte.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/gionebeats/Open-Jev-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Cargador y servidor Open-Jev (GitHub): https://github.com/Zefan-Cai/Open-Jev
- Checkpoint referenciado en la model card: https://huggingface.co/ZefanCai/Open-Jev-2B
- Dataset público: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Ficheros internos del repositorio citados en la model card: `evaluation/full-data.json`, `package/metrics.json`, `package/README.md`, `package/provenance.json`, `release-manifest.json`
- Resultados de búsqueda web: las consultas realizadas devolvieron únicamente páginas sobre el equinoccio de septiembre (timeanddate.com, Wikipedia, EarthSky, BBC Weather), sin relación con el modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos relevantes.
