# mehedi4/SafeAge-XLM-R-Base

## Resumen

SafeAge-XLM-R-Base es un clasificador de seguridad textual desarrollado por el autor mehedi4 (estudio SafeAge) a partir de un ajuste fino completo de FacebookAI/xlm-roberta-base. Resuelve un problema concreto: decidir si una peticion y su contexto visible deben permitirse (allow) o bloquearse (block) bajo una politica contextual de seguridad, cubriendo facilitacion de dano, acciones no autorizadas e inyeccion de prompts. Es relevante porque ofrece una linea base densa y ligera (278 millones de parametros) frente a adaptaciones con modelos generativos de mayor tamano, como la referencia SafeAge Guard basada en Qwen3-1.7B con LoRA.

El modelo emplea la arquitectura transformer encoder de XLM-RoBERTa con una cabeza de clasificacion binaria sobre el primer token. Se entrena con texto en bengali, bengali-ingles mixto, bengali romanizado (banglish) y una forma de referencia alineada en ingles, con una longitud maxima de entrada de 512 tokens. El repositorio incluye pesos completos en FP32, tokenizador, umbral de decision calibrado y metadatos de evaluacion, sin necesidad de descargar el modelo base ni fusionar adaptadores.

La relevancia practica esta en su umbral operativo congelado de 0,99 sobre la probabilidad de la clase 1, seleccionado solo con validacion, que prioriza precision de bloqueo (93,15%) sobre exhaustividad (81,92%). Es una pieza de filtrado previo en pipelines de agentes y moderacion, no un sistema completo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa con cabeza de clasificacion binaria (primer token) |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (truncado por la derecha) |
| Tipos de cuantizacion | No disponible (pesos guardados en FP32; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Bengali (bn), ingles (en), bengali-ingles mixto y bengali romanizado (banglish) |
| Licencia | MIT |
| Formato de pesos | Safetensors (FP32), con tokenizador y configuracion de Transformers |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base (Conneau et al., arXiv:1911.02116), un transformer encoder multilingue con representaciones preentrenadas, sobre el que se anade una cabeza de clasificacion binaria que opera sobre el primer token. El ajuste fino es completo, no mediante adaptadores: se actualizan todos los parametros, incluida la cabeza. La revision exacta del modelo base utilizada es `e73636d4f797dec63c3081bb6ed5c7b0bb3f2089`.

El entrenamiento usa AdamW con tasa de aprendizaje 2e-5, weight decay 0,01, calentamiento del 10%, tamano de lote efectivo 32, semilla 42 y 5 epocas completadas, con precision mixta FP16 sobre pesos guardados en FP32. La seleccion del checkpoint se hizo por macro F1 de validacion con umbral 0,5; el umbral de decision final se eligio sobre una rejilla de 0,01 espaciada en validacion, con desempate hacia el valor mas cercano a 0,5 y luego al menor umbral, y se congelo antes de la evaluacion en test. Los datos provienen del conjunto SafeAge: 24.508 peticiones etiquetadas procedentes de 6.127 casos alineados en cuatro formas, con particiones fijas de 22.096 para entrenamiento, 1.208 para validacion y 1.204 para test, agrupando casos relacionados dentro de la misma particion. Las particiones de validacion y test contienen casos construidos y revisados por los autores a partir de expansiones de escenarios sinteticos, no trafico de usuarios recogido de forma independiente. No se uso un conjunto de doble anotacion independiente, por lo que no se estimo el acuerdo entre anotadores.

## Capacidades

- Clasificacion binaria de peticiones completas con su contexto visible bajo una politica contextual de allow/block.
- Deteccion de facilitacion de dano, acciones no autorizadas e inyeccion de prompts dentro de la clase de bloqueo.
- Cobertura multilingue limitada a bengali, ingles, mezcla bengali-ingles y bengali romanizado.
- Manejo de entradas de hasta 512 tokens con truncado por la derecha y padding a multiplo de 8.
- Inferencia determinista por umbral: bloqueo cuando la probabilidad de la clase 1 es mayor o igual a 0,99.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; es un clasificador, no un generador.
- No dispone de capacidades de vision ni audio.
- Integracion con la libreria Transformers mediante `AutoModelForSequenceClassification` y con Text Embeddings Inference (endpoints compatibles).

## Casos de uso

- Filtrado previo en agentes conversacionales: el clasificador recibe la peticion del usuario y el contexto visible y decide si la accion solicitada esta permitida, actuando como puerta de entrada antes de que un modelo generativo ejecute herramientas.
- Moderacion de contenido en plataformas con audiencia bengali: permite cribar peticiones en bengali, banglish y mezcla de codigos, idiomas escasamente cubiertos por clasificadores de seguridad genericos.
- Proteccion frente a inyeccion de prompts en pipelines RAG: al evaluar el texto no confiable junto con el contexto, puede bloquear instrucciones que intentan imponerse sobre las del sistema, con una tasa de falsos positivos sobre benignos del 3,57%.
- Puerta de autorizacion en asistentes con acceso a acciones sensibles: el umbral 0,99 prioriza que los bloqueos sean correctos (precision 93,15%), adecuado cuando ejecutar una accion no autorizada tiene coste alto.
- Enrutado de casos dudosos a revision humana: las peticiones que caen cerca del umbral pueden derivarse a un revisor, usando la probabilidad de clase 1 como puntuacion de riesgo continua (Brier 0,08267).
- Evaluacion comparativa de sistemas de seguridad: sirve como linea base densa y reproducible frente a adaptaciones con modelos generativos, con metadatos de evaluacion y umbral congelado incluidos en el repositorio.
- Despliegue en infraestructura modesta: con 278 millones de parametros en FP32, puede servirse en CPU o en una sola GPU consumer para tareas de clasificacion de baja latencia.

## Benchmarks y rendimiento

Evaluacion retenida sobre 1.204 peticiones de test de SafeAge (301 casos, 199 grupos conectados), con umbral congelado de 0,99:

| Metrica | Resultado |
|---|---:|
| Accuracy | 91,03% |
| Macro F1 | 90,14% |
| Precision de bloqueo | 93,15% |
| Exhaustividad de bloqueo | 81,92% |
| Tasa de falsos positivos sobre benignos | 3,57% |
| Brier score | 0,08267 |

Recuento de confusion: 729 verdaderos negativos, 27 falsos positivos, 81 falsos negativos y 367 verdaderos positivos. El repositorio incluye `evaluation/test_metrics.json` con los resultados del run original en umbrales 0,5 y 0,99, y un desglose por variante de idioma en `evaluation/test_by_language_variant` (contenido no detallado en la informacion disponible).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo es un clasificador y no un generador, por lo que esas metricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (278 millones de parametros), mas el overhead de activaciones y del runtime; el uso de autocast FP16 en CUDA reduce el consumo respecto a FP32 puro.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo original se entreno y evaluo con precision mixta FP16 en CUDA, por lo que una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas pero validas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU con FP32.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`), Text Embeddings Inference (endpoints compatibles) y el script `inference.py` incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp u Ollama, orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor advierte que precision, hardware, versiones de libreria, batching y kernels de atencion pueden causar pequenas diferencias numericas frente a las probabilidades archivadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeAge-XLM-R-Base | 278.045.186 | 512 tokens | Clasificacion binaria allow/block | MIT | HuggingFace (mehedi4/SafeAge-XLM-R-Base) |
| SafeAge Guard (Qwen3-1.7B LoRA) | No disponible con exactitud (base Qwen3-1.7B con adaptador LoRA) | No disponible | Adaptacion de referencia del estudio SafeAge | No disponible | Referenciado en el estudio SafeAge |
| FacebookAI/xlm-roberta-base | No disponible en la informacion proporcionada | 512 tokens | Modelo base multilingue sin cabeza de clasificacion | MIT | HuggingFace |

El modelo base XLM-RoBERTa no es un competidor directo (carece de cabeza entrenada para esta tarea), pero sirve como referencia de arquitectura. SafeAge Guard es la alternativa del mismo estudio, basada en un modelo generativo con LoRA, sin datos publicos de rendimiento en la informacion disponible para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El umbral operativo es 0,99 y debe aplicarse explicitamente; la regla argmax o el umbral por defecto de 0,5 de la pipeline generica de clasificacion no reproducen el punto de operacion del autor.
- La exhaustividad de bloqueo es del 81,92%: aproximadamente uno de cada cinco ataques del conjunto de test no se detecta.
- La tasa de falsos positivos sobre benignos es del 3,57%, lo que implica bloqueos indebidos en trafico legitimo.
- Las etiquetas no miden adecuacion por edad, seguridad de la respuesta generada ni seguridad completa de agentes; el nombre "SafeAge" no debe interpretarse como una garantia de proteccion de menores.
- El texto no confiable que afirma tener permiso no establece por si mismo autorizacion; el modelo debe recibir el contexto necesario para decidir.
- Entradas de mas de 512 tokens se truncan por la derecha, por lo que contexto relevante puede perderse.
- Cobertura linguistica limitada a bengali, ingles, mezcla y banglish; el rendimiento fuera de esos idiomas no esta documentado.
- Validacion y test contienen casos sinteticos construidos y revisados por los autores, no trafico real independiente; no se estimo el acuerdo entre anotadores, lo que limita la fiabilidad de las metricas como estimacion del rendimiento en produccion.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto libre), pero si existe riesgo de clasificacion erronea con confianza alta.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright; no se documentan sesgos especificos mas alla del desbalance entre clases y la composicion del dataset.
- Diferencias numericas entre entornos de ejecucion pueden alterar marginalmente las decisiones cerca del umbral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehedi4/SafeAge-XLM-R-Base
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Conneau et al.): https://arxiv.org/abs/1911.02116
- Estudio SafeAge (DOI): https://doi.org/10.5281/zenodo.23622437
