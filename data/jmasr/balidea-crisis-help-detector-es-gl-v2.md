# JMasr/balidea-crisis-help-detector-es-gl-v2

## Resumen

`balidea-crisis-help-detector-es-gl-v2` es un clasificador de texto binario especializado en la detección de mensajes que pueden indicar una crisis o una necesidad de ayuda urgente (por ejemplo, intención suicida o autolesión) en el tráfico de un chatbot clínico en español y gallego. Lo desarrolla el usuario JMasr en el contexto del proyecto Balidea y se publica bajo licencia Apache 2.0. Se trata de un fine-tune completo (no LoRA) de `FacebookAI/xlm-roberta-base`, con 278.045.186 parámetros, pensado como una capa más dentro de una pila de seguridad en profundidad (defence-in-depth), no como un sistema de decisión autónomo.

Su relevancia actual radica en que aborda un problema de seguridad crítico en asistentes clínicos: la necesidad de enrutar a recursos humanos de forma fiable cuando un usuario expresa riesgo. La v2 introduce una metodología de partición train/val/test con conciencia de procedencia (provenance-aware) y sustituye a la v1, ya deprecada. El modelo aplica calibración de temperatura (Guo et al. 2017) y un umbral de decisión operativo de 0,99, lo que lo orienta a maximizar el recall (minimizar los falsos negativos) a costa de asumir un pequeño número de falsos positivos.

La información pública es limitada: la model card advierte explícitamente de que el conjunto de aceptación de producción (`.ods`, 886 prompts) está parcialmente contaminado en el split de entrenamiento (413 filas), por lo que las métricas publicadas deben interpretarse como un proxy y no como una validación limpia contra tráfico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencia |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (repo con safetensors y ONNX; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Español (es) y gallego (gl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa en su variante base (12 capas, 768 de dimensión oculta, 12 cabezas de atención, vocabulario SentencePiece multilingüe), sobre el que se añade una cabeza de clasificación binaria (`num_labels=2`). La etiqueta 0 corresponde a "negativo/paso" y la etiqueta 1 a "positivo/marcar". La secuencia se trunca a 256 tokens. No se emplean técnicas como LoRA, focal loss ni búsqueda en rejilla de épocas: se usa la receta "known-good" con early stopping (paciencia 2, métrica `eval_loss`), techo de 4 épocas, learning rate 1e-5, weight decay 0,01, warmup ratio 0,06, batch size 16 y semilla 20260526.

El split de entrenamiento suma 8.165 filas con un desbalance moderado (5.924 negativas, 2.241 positivas), compuesto por ocho fuentes: chitchat (1.880), prod_medical_queries (1.812), prod_crisis_positives (1.648), snomed_clinical (1.451), balidea_malign (660), ods (413), translated_aimh-crisis (204) y author_seeds (97). La innovación técnica principal no está en la arquitectura sino en el pipeline de calibración: se ajusta una temperatura de 1,4116 sobre el split de validación y se fija un umbral de decisión de 0,99, de modo que la probabilidad calibrada `softmax(logits / T)[:, 1]` se compara con ese umbral. La partición train/val/test se diseñó con criterio de procedencia para evitar fugas entre fuentes, aunque la model card reconoce que 413 filas del conjunto de aceptación `.ods` acabaron en el split de entrenamiento (gold-in-train), lo que invalida la puerta de aceptación estándar contra el `.ods` completo.

## Capacidades

- Clasificación binaria de texto: distingue entre mensajes que requieren marcado por posible crisis o necesidad de ayuda urgente y mensajes que pueden pasar.
- Detección de señales de riesgo: entrenado específicamente con positivos de crisis de producción y datos traducidos de AIMH-crisis, orientado a intención suicida y autolesión.
- Multilingüe limitado a español y gallego, con vocabulario XLM-R compartido.
- Clasificación de mensajes cortos y conversacionales (hasta 256 tokens), adecuada para turnos individuales de un chatbot.
- Salida probabilística calibrada (temperatura ajustada), lo que permite fijar umbrales operativos según el coste relativo de falsos positivos y falsos negativos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un clasificador de una sola pasada.
- No tiene modo "thinking", visión ni audio.
- No está pensado para otras lenguas ni para dominios no clínicos.

## Casos de uso

- Filtro de seguridad en un chatbot clínico en español: el modelo se ejecuta como capa previa o posterior a la generación de respuesta para marcar mensajes del usuario que sugieran riesgo y derivarlos a recursos humanos de apoyo. Su umbral alto (0,99) prioriza el recall, lo que encaja con un escenario en el que un falso negativo es mucho más costoso que un falso positivo.
- Enrutado a recursos de ayuda urgente: cuando la probabilidad calibrada supera el umbral, el sistema puede insertar automáticamente líneas de teléfono de prevención del suicidio o escalar a un operador humano, usando la salida binaria como señal de activación.
- Moderación de conversaciones en gallego: al cubrir `gl` además de `es`, permite desplegar la misma capa de seguridad en comunidades bilingües sin mantener dos modelos separados.
- Monitorización y auditoría de tráfico: registrar las puntuaciones del clasificador sobre conversaciones reales para medir deriva (drift) y recalibrar el umbral con datos de producción, dado que la model card recomienda confirmar sobre tráfico real antes de confiar en el modelo.
- Investigación en seguridad de asistentes clínicos: sirve como línea base reproducible (semilla fija, receta documentada, fuentes de datos listadas) para comparar metodologías de detección de crisis en entornos ES/GL.
- Pre-filtrado de datasets: clasificar grandes volúmenes de mensajes clínicos para aislar candidatos a revisión humana antes de incorporarlos a conjuntos de entrenamiento o evaluación.
- Despliegue ligero en infraestructura modesta: al ser un encoder de 278 M de parámetros, puede servirse con ONNX Runtime o con un contenedor de transformers en CPU/GPU pequeña, integrándose en el backend del chatbot sin requisitos de GPU de gran tamaño.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el slice de gold-test retenido (n = 137: 95 positivos, 42 negativos), no visto en entrenamiento:

| Punto de operación | Recall | FP | ROC-AUC | Aceptación |
|---|---|---|---|---|
| Enviado (threshold = 0,990, calibrado en val) | 1,0 | 0,0 | 1,0 | Sí |
| Recalibrado en gold (threshold = 0,99) | 1,0 | 0,0 | — | Sí |

Slice de calibración (val): recall = 0,9970, FP = 0,00103.

Advertencia: estos números proceden de un conjunto curado pequeño y parcialmente contaminado (413 filas del `.ods` están en entrenamiento), por lo que no constituyen una validación limpia contra tráfico de producción. No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, un presupuesto de 2-3 GB es suficiente para lotes pequeños.
- En fp16/bf16: alrededor de 0,6 GB de pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4). Para alto throughput, A10G, L4 o A100 con lotes grandes.
- Cabe en GPU consumer: sí, en todas las RTX 30/40 series y en GPUs integradas con suficiente memoria compartida si se usa cuantización.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime (hay pesos ONNX en el repo), y servidores de inferencia como TGI o vLLM para clasificación por lotes. llama.cpp/Ollama no son la vía natural para un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por mensaje en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| `JMasr/balidea-crisis-help-detector-es-gl-v2` | 278 M | 256 tokens | es, gl | Apache 2.0 | Clasificación de crisis (binaria) |
| `FacebookAI/xlm-roberta-base` (modelo base) | 278 M | 512 tokens | 100 idiomas | MIT | Masked LM / base para fine-tune |
| Clasificadores de seguridad genéricos (p. ej. modelos de moderación tipo Llama Guard) | No disponible | No disponible | Multilingüe | Varía | Moderación general, no específica de crisis clínica |

No se dispone de comparaciones cuantitativas con alternativas específicas de detección de crisis en ES/GL en la información proporcionada. El modelo base XLM-R ofrece 512 tokens de contexto frente a los 256 usados aquí, pero no está especializado en la tarea. Los clasificadores de moderación general cubren más categorías de daño pero no están ajustados al dominio clínico ni al par ES/GL.

## Limitaciones y advertencias

- Contaminación del conjunto de aceptación: 413 filas del `.ods` de producción están en el split de entrenamiento (gold-in-train), por lo que la validación estándar contra el `.ods` completo se omitió y las métricas publicadas no son una comprobación limpia.
- Conjunto de validación pequeño y curado: el gold-test tiene solo 137 ejemplos (95 positivos, 42 negativos), insuficiente para estimar con precisión el rendimiento en producción; los intervalos de confianza están en el repositorio del proyecto pero no se reproducen aquí.
- Riesgo de deriva en tráfico real: la model card recomienda monitorizar recall y falsos positivos tras el despliegue; el rendimiento en tráfico vivo puede diferir del conjunto curado.
- Uso previsto restringido: no debe usarse para decisiones autónomas sobre personas ni para triaje de crisis sin revisión humana; es una capa de una pila de seguridad, no un sustituto de un profesional.
- Cobertura lingüística limitada a español y gallego; no validado en otras lenguas ni en dominios no clínicos.
- Umbral muy alto (0,99): maximiza el recall pero puede generar falsos positivos en mensajes ambiguos; requiere calibración específica por despliegue.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificación errónea en mensajes irónicos, negaciones o contextos clínicos complejos.
- Sesgos: no se documentan análisis de sesgo por género, edad o variante dialectal; el entrenamiento con datos de producción puede heredar sesgos de esa distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el uso previsto; conviene revisar las implicaciones éticas y regulatorias de un sistema de detección de crisis en producción.
- El wrapper interno `safeguard.inference` no es público; hay que replicar la temperatura y el umbral manualmente, con riesgo de error de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JMasr/balidea-crisis-help-detector-es-gl-v2
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de calibración de temperatura (Guo et al. 2017): https://arxiv.org/abs/1706.04599
- Referencia AIMH-crisis (dataset traducido citado en la model card): no disponible en la información proporcionada
- Repositorio del proyecto Balidea: no disponible en la información proporcionada
- Informe de validación `reports/v2/crisis_help_detector_lr_check_goldtrain.json`: no disponible públicamente en la información proporcionada
