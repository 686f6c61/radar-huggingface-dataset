# phelipescript/ddsd-ptbr-debertinha

## Resumen

DDSD em português brasileiro: DeBERTinha es un clasificador de texto en portugués de Brasil para la detección de habla dirigida al dispositivo (DDSD, *device-directed speech detection*). Dado el transcript de una locución, predice si esta se dirigió al ordenador (DD) o no (NDD), lo que permite construir asistentes de voz sin palabra de activación. El modelo es un ajuste fino de `sagui-nlp/debertinha-ptbr-xsmall` sobre el corpus sintético `phelipescript/ddsd-ptbr-corpus`, en su configuración `com_correcao`, que corrige el sesgo de longitud de las frases.

El modelo base, DeBERTinha, es un transformer encoder de la familia DeBERTa-v2 con 40,9 millones de parámetros, preentrenado mediante detección de tokens reemplazados al estilo DeBERTa-v3. Con solo 40M de parámetros, el ajuste fino se realizó en 47 minutos sobre una Apple M5 (GPU vía MPS), lo que lo convierte en una opción muy ligera para integrarse en pipelines de voz en tiempo real (micrófono → detector de voz → Whisper large-v3-turbo → clasificador → decisión).

El modelo forma parte del trabajo de fin de grado *Detecção de Fala Direcionada ao Computador Pessoal em Português Brasileiro: Uma Abordagem Textual para Assistentes de Voz sem Palavra de Ativação* (SENAC Santo Amaro, 2026). Es relevante ahora porque demuestra que un clasificador textual de muy bajo coste computacional puede reducir drásticamente las falsas activaciones de un asistente de voz (del 41,4% al 5,1% en el corpus CORAA) sin necesidad de un modelo acústico dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2, ajuste fino de DeBERTinha) |
| Parametros totales | 40.944.002 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors, 0,2 GB) |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos relevantes: pipeline `text-classification`, umbral de decisión almacenado en `config.json` (`decision_threshold` = 0,395), etiquetas DD (índice 1) y NDD (índice 0).

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo DeBERTa-v2 (DeBERTinha XSmall) con una cabeza de clasificación de secuencias de dos clases. El preentrenamiento del modelo base siguió el formato de DeBERTa-v3 mediante la tarea de detección de tokens reemplazados. El ajuste fino se realizó sobre la configuración `com_correcao` del corpus sintético `phelipescript/ddsd-ptbr-corpus`: 93.150 frases de entrenamiento (mitad DD, mitad NDD) y 11.672 de validación (también balanceadas). No se menciona uso de RLHF ni DPO; se trata de un ajuste supervisado clásico con entropía cruzada.

Hiperparámetros de entrenamiento: tasa de aprendizaje 2e-5, lote de 32, hasta 5 épocas, truncado a 128 tokens, calentamiento del 10%, dropout 0,1, weight decay 0,01, planificador lineal y precisión mixta bf16. Se seleccionó la semilla 44 (de entre 42, 43 y 44) por mayor F1 macro en validación, y el checkpoint del paso 14.555 (época 5 de 5) con parada temprana de paciencia 2. El umbral de decisión de 0,395 se eligió maximizando el F1 macro en validación sobre una rejilla de 0,005 a 0,995 con paso 0,005. Una innovación destacable es la corrección del sesgo de longitud del corpus sintético, que reduce drásticamente las falsas activaciones sobre conversación real.

## Capacidades

- Clasificación binaria de texto: predice si una frase transcrita fue dirigida al ordenador (DD) o no (NDD).
- Detección de habla dirigida al dispositivo sin palabra de activación, como módulo textual dentro de un pipeline de voz.
- Funcionamiento sobre transcripts normalizados (sin acentos, minúsculas, puntuación y símbolos sustituidos por espacios).
- Decisión calibrada mediante umbral configurable (`decision_threshold` = 0,395) en lugar de argmax.
- Robusto frente a conversación espontánea: falsas activaciones del 5,1% en CORAA y 5,9% en NURC-SP sobre frases que son todas NDD.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*; es exclusivamente un clasificador de texto.
- Capacidad multilingüe limitada al portugués de Brasil.

## Casos de uso

- Asistentes de voz sin palabra de activación: el clasificador recibe el transcript de cada locución (por ejemplo, de Whisper large-v3-turbo) y decide si debe ejecutar un comando, evitando que el asistente reaccione a conversaciones ajenas gracias a su baja tasa de falsas activaciones (5,1% en CORAA).
- Filtrado previo en pipelines de comandos por voz: al ser un modelo de 40M de parámetros, puede ejecutarse en cada turno de voz con coste mínimo y descartar utterances NDD antes de invocar el modelo generativo o el enrutador de intenciones.
- Investigación en DDSD y evaluación de corpus: sirve como referencia textual ligera para comparar con aproximaciones acústicas o multimodales, ya que el autor publica métricas por semilla y corpus de evaluación (CORAA, NURC-SP, TAGARELA).
- Prototipado académico y TFM/TFG: su entrenamiento en 47 minutos sobre una Apple M5 con 16 GB de memoria unificada permite reproducir el ajuste fino y experimentar con umbrales y normalización en hardware de consumo.
- Moderación de activaciones en dispositivos domésticos: integrado en altavoces o asistentes locales, reduce las activaciones accidentales provocadas por conversaciones de fondo, un problema habitual en entornos con varias personas.
- Segmentación de transcripciones de reuniones o clases: etiquetar qué fragmentos de una transcripción son instrucciones dirigidas al sistema (por ejemplo, "abre el navegador y busca la previsión del tiempo") frente a diálogo entre participantes.
- Enrutado de comandos en aplicaciones de accesibilidad: permite a usuarios controlar el ordenador por voz sin pronunciar una palabra de activación, usando el umbral calibrado para ajustar sensibilidad frente a falsos positivos.

## Benchmarks y rendimiento

Test interno sobre 11.616 frases sintéticas del test `com_correcao` (mitad DD, mitad NDD), evaluadas una sola vez con el umbral congelado:

| Métrica | Este modelo (semilla 44) | Media de 3 semillas ± desviación |
|---|---|---|
| Exactitud | 97,70% | 97,70% ± 0,00 p.p. |
| F1 macro | 0,9770 | 0,9770 ± 0,0000 |
| ROC-AUC | 0,9973 | 0,9972 ± 0,0001 |
| EER | 2,22% | 2,26% ± 0,04 p.p. |

Falsas activaciones sobre transcripciones de conversación real (todas las frases son NDD, por lo que toda activación es falsa):

| Corpus | Frases | Este modelo | DeBERTinha sin corrección |
|---|---|---|---|
| CORAA | 1.000 | 5,1% | 41,4% |
| NURC-SP | 1.000 | 5,9% | 23% (dato truncado en la información disponible) |
| TAGARELA | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (40,9M de parámetros, repo de 0,2 GB); en fp16/bf16 aproximadamente 0,1 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el ajuste fino se realizó en una Apple M5 con 16 GB de memoria unificada vía MPS. Para producción, una T4, L4 o RTX 4090 son más que suficientes.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, etc.) e incluso en CPU para inferencia por locución.
- Opciones de despliegue: `transformers` (con `AutoModelForSequenceClassification`), `text-embeddings-inference` (tag presente en el repo) y exportación a ONNX no documentada; vLLM, llama.cpp y Ollama no están indicados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento completo requirió 47 minutos en Apple M5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phelipescript/ddsd-ptbr-debertinha | 40,9M | 128 tokens | Clasificación DDSD (pt-BR) | MIT | Hugging Face |
| phelipescript/ddsd-ptbr-bertimbau | no disponible | no disponible | Clasificación DDSD (pt-BR), opción por defecto del sistema del TCC | no disponible | Hugging Face |
| sagui-nlp/debertinha-ptbr-xsmall | 40M | no disponible | Modelo base DeBERTa-v2 preentrenado (pt-BR) | no disponible | Hugging Face |
| BERTimbau-Large | no disponible | no disponible | Encoder preentrenado (pt-BR); superado por DeBERTinha en dos tareas según el repositorio de DeBERTinha | no disponible | Hugging Face |

No se dispone de comparativas de rendimiento DDSD frente a alternativas acústicas o multimodales en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica texto ya transcrito; no procesa audio directamente ni sustituye a un detector de voz o a un ASR.
- Requiere replicar exactamente la normalización del entrenamiento (sin acentos, minúsculas, puntuación y símbolos convertidos en espacios); usarlo con texto sin normalizar degrada los resultados.
- Es imprescindible decidir con el umbral `config.decision_threshold` (0,395) y no con argmax: el `pipeline("text-classification")` de transformers aplica argmax (equivalente a umbral 0,5) y produciría decisiones distintas a las calibradas.
- Longitud máxima de 128 tokens; las locuciones más largas se truncan y pueden perder información relevante.
- Entrenado y evaluado sobre un corpus sintético; aunque se reportan métricas sobre conversación real (CORAA, NURC-SP), persisten falsas activaciones en torno al 5-6% en esos corpus.
- Riesgo de sesgo por el proceso de generación sintética del corpus y por la composición del mismo; no se documentan análisis de sesgos demográficos o dialectales.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de errores de clasificación en dominios alejados del corpus de entrenamiento.
- Solo portugués de Brasil; no se ha validado en otras variantes del portugués ni en otros idiomas.
- Licencia MIT, que permite uso comercial, pero el modelo se distribuye como parte de un trabajo académico sin garantías de soporte ni mantenimiento.
- No se han publicado datos de latencia ni throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phelipescript/ddsd-ptbr-debertinha
- Corpus de entrenamiento: https://huggingface.co/datasets/phelipescript/ddsd-ptbr-corpus
- Modelo base DeBERTinha XSmall: https://huggingface.co/sagui-nlp/debertinha-ptbr-xsmall
- Repositorio GitHub de DeBERTinha: https://github.com/sagui-nlp/DeBERTinha
- Modelo alternativo del mismo autor (opción por defecto del sistema): https://huggingface.co/phelipescript/ddsd-ptbr-bertimbau
