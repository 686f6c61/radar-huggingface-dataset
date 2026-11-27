# mishwani7/mBERT-Roman-Urdu-Mental-Health

## Resumen

mBERT-Roman-Urdu-Mental-Health es un ajuste fino del checkpoint `bert-base-multilingual-cased` orientado a la clasificación de severidad depresiva en texto social escrito en roman urdu (urdu transcrito con alfabeto latino). Lo desarrolla Abu Zar Mishwani, en el marco de un trabajo de investigación sobre control de riesgo conformal invariante al sistema de escritura, y se publica bajo licencia MIT. El modelo resuelve un problema concreto: la mayoría de recursos clínicos y de PLN para urdu asumen el alfabeto perso-árabe, mientras que una parte muy relevante de la expresión informal y de las señales de salud mental en redes sociales aparece en roman urdu.

Técnicamente se trata de un encoder BERT multilingüe de 177.856.516 parámetros totales, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, adaptado a una tarea de clasificación de cuatro clases (no depresión, depresión leve, moderada y grave). Su rasgo diferencial no es arquitectónico sino metodológico: incorpora una calibración mediante control de riesgo conformal que fija umbrales operativos con garantías estadísticas sobre la tasa de falsos negativos, un aspecto crítico en cribado clínico, donde un falso negativo es mucho más costoso que un falso positivo.

Es relevante ahora porque propone un marco de despliegue con umbrales explícitos y auditables (0,2437 para cribado con FNR ≤ 5 % y 0,0720 para la asignación exacta de grado de severidad), algo poco habitual en modelos de salud mental publicados en Hugging Face, y porque cubre una variante lingüística escasamente atendida por los modelos de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, `bert-base-multilingual-cased`) |
| Parámetros totales | 177.856.516 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el checkpoint base admite 512 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Urdu (`ur`) y multilingüe; el ajuste fino se centra en roman urdu |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | `text-classification` |
| Tamaño del repositorio | 0,7 GB |
| Clases de salida | 4 (0: no depresión, 1: leve, 2: moderada, 3: grave) |
| Umbral conformal de cribado | 0,2437 (FNR ≤ 5 %, alpha ≤ 0,05) |
| Umbral de grado exacto | 0,0720 |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un encoder transformer bidireccional con vocabulario multilingüe compartido, y se ajusta como clasificador de secuencia con cuatro etiquetas ordinales de severidad depresiva. La elección del checkpoint base multilingüe es coherente con el objetivo de invariancia de escritura: el mismo modelo debe manejar urdu en alfabeto perso-árabe y su transliteración latina, de modo que un mismo contenido escrito en dos sistemas no produzca predicciones divergentes.

El elemento técnico más destacable es la calibración mediante control de riesgo conformal (conformal risk control), que sustituye el umbral naive de 0,5 por umbrales derivados de un conjunto de calibración y con una garantía de riesgo sobre la tasa de falsos negativos. El autor publica dos umbrales: uno orientado a cribado (0,2437) que acota la FNR al 5 %, y otro para la asignación exacta de grado (0,0720). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en un encoder de clasificación) ni detalles del conjunto de calibración.

## Capacidades

- Clasificación de texto en cuatro niveles de severidad depresiva a partir de texto libre en roman urdu.
- Cribado binario con umbral calibrado y cota explícita de falsos negativos (FNR ≤ 5 %).
- Asignación de grado de severidad mediante un segundo umbral independiente.
- Manejo de texto multilingüe heredado del checkpoint base, con foco operativo en urdu y roman urdu.
- Invariancia de escritura: el ajuste está diseñado para que la predicción no dependa del alfabeto empleado (perso-árabe frente a latino).
- Salida de logits/probabilidades por clase, apta para umbralización posterior y auditoría.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Cribado automatizado en foros y redes sociales en roman urdu: el modelo clasifica publicaciones y, aplicando el umbral conformal de 0,2437, deriva a revisión humana los casos con riesgo de depresión, con una cota estadística de falsos negativos del 5 % que hace el sistema defendible ante comités de ética.
- Triaje en líneas de ayuda y chat de soporte: integrado como primer filtro sobre los mensajes entrantes, prioriza conversaciones según severidad estimada (clases 1 a 3) y reduce el tiempo hasta la intervención de un profesional.
- Monitorización de cohortes en investigación epidemiológica: permite etiquetar grandes volúmenes de texto social en roman urdu con un criterio calibrado y reproducible, algo que los cuestionarios tradicionales no escalan.
- Análisis de sentimiento clínico en encuestas abiertas: procesa respuestas de texto libre en urdu romanizado recogidas en estudios y las mapea a grados de severidad para análisis estadístico posterior.
- Moderación y señalización en plataformas comunitarias: detecta mensajes con indicios de depresión moderada o grave y activa recursos de ayuda, usando el umbral de grado exacto (0,0720) para la etiqueta fina.
- Pipeline de investigación en PLN clínico multilingüe: sirve como línea base reproducible para comparar técnicas de calibración conformal y de invariancia de escritura en urdu, al estar publicado con licencia MIT y pesos en safetensors.
- Preprocesado para sistemas de derivación asistencial: combinado con un modelo generativo que redacte la respuesta, el clasificador actúa como capa de decisión auditable sobre cuándo escalar a un humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta los umbrales conformales (0,2437 para FNR ≤ 5 % y 0,0720 para grado exacto) y la cita del artículo asociado, sin tablas de accuracy, F1, MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB de pesos, más overhead de activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en FP16/BF16: alrededor de 0,35 GB de pesos; ejecutable en CPU con latencia aceptable para volúmenes moderados.
- GPU recomendadas: no requiere GPU de datacenter; una NVIDIA T4, L4, RTX 3060 o superior es más que suficiente. A100/H100 solo tendrían sentido para procesamiento masivo por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch, TorchServe, FastAPI + `transformers`, ONNX Runtime, Hugging Face Inference Endpoints y `optimum` para exportación. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU (cientos de secuencias por segundo con batching), pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mBERT-Roman-Urdu-Mental-Health | 177,9 M | No disponible (base: 512) | Clasificación de severidad depresiva en roman urdu, con calibración conformal | MIT | Hugging Face |
| `bert-base-multilingual-cased` | 177,9 M | 512 | Modelo base multilingüe sin ajuste clínico | Apache 2.0 | Hugging Face |
| `xlm-roberta-base` | 278 M | 512 | Modelo base multilingüe, sin ajuste clínico ni calibración | MIT | Hugging Face |
| `mental/mental-bert-base-uncased` | ~110 M | 512 | Clasificación de salud mental en inglés | Apache 2.0 | Hugging Face |

La comparación directa con alternativas específicas para roman urdu no está disponible en la información proporcionada; los modelos de la tabla son referencias de la misma familia o categoría, no equivalentes funcionales.

## Limitaciones y advertencias

- Modelo de investigación: no es un dispositivo médico ni sustituye una evaluación clínica profesional; cualquier uso en producción debe acompañarse de revisión humana.
- Riesgo de sesgo: el ajuste se realiza sobre texto social, lo que puede sobrerrepresentar ciertos registros, edades o géneros y degradar el rendimiento en subpoblaciones no representadas en el conjunto de entrenamiento.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de falsos positivos y negativos; la cota del 5 % de FNR depende de que la distribución de producción sea similar a la de calibración.
- La calibración conformal pierde validez si cambia la distribución del texto (por ejemplo, otro dialecto, otra plataforma o una mezcla distinta de alfabetos); requiere recalibración periódica.
- Cobertura lingüística limitada: el objetivo es urdu y roman urdu; el rendimiento en otros idiomas del checkpoint base no está validado para esta tarea.
- Longitud de contexto no documentada en la model card; asumir el límite de 512 tokens del checkpoint base y truncar en consecuencia.
- Sin cuantizaciones oficiales ni artefactos GGUF, lo que complica el despliegue en entornos de inferencia en CPU de bajo nivel.
- Licencia MIT: permite uso comercial, pero la responsabilidad ética y legal del uso clínico recae íntegramente en el integrador.
- Repositorio sin descargas ni likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mishwani7/mBERT-Roman-Urdu-Mental-Health
- Cita del artículo asociado: Mishwani, Abu Zar y Khan, Muhammad Sadiq, "Script-Invariant Conformal Risk Control for Urdu and Roman Urdu Clinical Screening", 2026 (sin enlace directo disponible en la información proporcionada).
