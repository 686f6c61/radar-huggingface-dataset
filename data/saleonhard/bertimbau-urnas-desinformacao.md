# saleonhard/bertimbau-urnas-desinformacao

## Resumen

BERTimbauUrnasDesinformacao es un modelo de clasificación de texto en portugués resultado del fine-tuning de neuralmind/bert-large-portuguese-cased (BERTimbau large) sobre la tarea concreta de detectar desinformación relativa a las urnas electrónicas brasileñas. Lo desarrolla Leonardo dos Santos Aquino (usuario saleonhard) como parte de su Trabajo de Conclusión de Curso (TCC) titulado «"Sistemas de (Des)Información": una análise de como as notícias falsas sobre as urnas eletrônicas circularam no ecossistema do Twitter/X durante as eleições de 2022».

Se trata de un clasificador binario con dos etiquetas, `Desinformação` y `Não Desinformação`, construido sobre un encoder transformer de 334.398.466 parámetros en formato safetensors (1,3 GB de repositorio). No es un modelo generativo: devuelve una probabilidad por clase, lo que lo hace apto para integrarse en pipelines de moderación o triaje a gran escala con un coste de inferencia muy bajo.

Su relevancia es acotada y muy específica: la ventana temporal y temática del entrenamiento es la campaña electoral brasileña de 2022 y el objeto de las afirmaciones son exclusivamente las urnas electrónicas. El autor publica también las métricas de evaluación en el conjunto de test (F1 = 0,8879, AUC = 0,9524) con umbral de decisión estándar de 0,5, advirtiendo que en el TCC se emplearon además un umbral ajustado (τ = 0,94) y calibración por Temperature Scaling (T = 1,776) que no están reflejados en los pesos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (BERTimbau large) con cabeza de clasificación de secuencia |
| Parámetros totales | 334.398.466 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens de tamaño máximo de secuencia en el fine-tuning; no se documenta en la información disponible la longitud máxima admitida por el modelo base |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas en el repositorio) |
| Idiomas soportados | Portugués (etiquetas `pt`, `pt-br`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de salida | `Desinformação`, `Não Desinformação` |
| Modelo base | neuralmind/bert-large-portuguese-cased |
| Dataset de fine-tuning | uefactsbr-urnas-eleicoes-2022 |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes en HuggingFace | 17 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de BERTimbau large: un encoder transformer bidireccional de 24 capas con 334 M de parámetros, preentrenado en portugués por neuralmind y reutilizado aquí mediante fine-tuning supervisado para clasificación binaria de secuencias. No hay innovaciones arquitectónicas propias; el aporte del trabajo está en el corpus, el esquema de etiquetado y la estrategia de ajuste.

El entrenamiento se realizó sobre el corpus UEFactsBR (`uefactsbr-urnas-eleicoes-2022`), compuesto por verificaciones de agencias de fact-checking y tweets etiquetados manualmente. Los hiperparámetros documentados son: tasa de aprendizaje 3 × 10⁻⁵, batch size de 8 en entrenamiento y validación, 2 épocas, weight decay de 0,1, label smoothing de 0,01 y tamaño máximo de secuencia de 256 tokens. Se aplicó congelación de capas (layer freezing) sobre el clasificador, el pooler y las últimas 8 capas del encoder, además de técnicas de data augmentation y enmascaramiento de entidades políticas (presumiblemente para evitar que el modelo aprenda a asociar nombres de políticos concretos con la etiqueta). No se documenta en la información disponible el número total de tokens de entrenamiento ni la composición porcentual del dataset, y no se menciona el uso de RLHF ni DPO, algo por otra parte esperable en un encoder discriminativo.

## Capacidades

- Clasificación binaria de texto en portugués: distingue entre contenido etiquetado como desinformación sobre las urnas electrónicas y contenido no clasificado como tal.
- Procesamiento de textos cortos del registro propio de redes sociales (tuits y mensajes similares), con truncado a 256 tokens.
- Salida probabilística por clase, lo que permite ajustar el umbral de decisión según el equilibrio entre precisión y recall que requiera el caso de uso.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión: es exclusivamente un clasificador de secuencia.
- No dispone de soporte de tool calling ni de function calling.
- No está diseñado para agentes ni para razonamiento multi-paso; su función es una única etiqueta por entrada.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otras lenguas.
- Capacidad especial: el TCC reporta configuraciones adicionales de calibración (Temperature Scaling, T = 1,776) y umbral ajustado (τ = 0,94) que no están incorporadas en los pesos publicados.

## Casos de uso

- Moderación de contenido en plataformas sociales: el clasificador puede ejecutarse sobre cada publicación que mencione términos electorales y marcar automáticamente aquellas con alta probabilidad de contener desinformación sobre las urnas, derivando los casos dudosos a revisión humana. Su coste de inferencia (334 M de parámetros) permite procesar volúmenes elevados por GPU.
- Monitorización de conversaciones en X/Twitter durante periodos electorales: integrado en un recolector de streaming, clasifica en tiempo real los mensajes que contengan palabras clave sobre el sistema electoral brasileño y alimenta paneles de seguimiento de la circulación de bulos.
- Triaje en agencias de fact-checking: dado un flujo entrante de afirmaciones ciudadanas, el modelo prioriza las que superan un umbral de probabilidad de desinformación, reduciendo el trabajo manual previo a la verificación periodística.
- Investigación académica en comunicación política y ciencias sociales: permite etiquetar retrospectivamente corpus grandes de tuits de 2022 para cuantificar la difusión de narrativas falsas sobre las urnas y analizar su relación con la polarización.
- Filtro previo en pipelines de verificación aumentada con LLM: al ser un modelo pequeño y rápido, puede actuar como primera etapa de descarte y reservar las llamadas a modelos generativos grandes únicamente para los textos positivos, reduciendo coste y latencia del sistema completo.
- Educación y alfabetización mediática: sirve como ejemplo práctico y reproducible de aplicación de PLN a la detección de noticias falsas en cursos de procesamiento de lenguaje natural, con código de recolección, procesamiento y entrenamiento publicado en el repositorio del TCC.
- Análisis de redes sociales a escala de investigación: clasificación por lotes de conjuntos de datos históricos para construir series temporales de desinformación durante la campaña de 2022.
- Despliegue en entornos con recursos limitados: al ocupar del orden de 1,3 GB en FP32, puede servirse desde CPU o GPU de gama baja en servicios internos de monitorización sin infraestructura dedicada.

## Benchmarks y rendimiento

Métricas publicadas por el autor, calculadas en el conjunto de test con umbral de decisión estándar (0,5), sin ajuste de umbral ni calibración:

| Métrica | Valor |
|---|---|
| Acurácia | 0,8986 |
| Precisión | 0,8879 |
| Recall | 0,8879 |
| F1-score | 0,8879 |
| Especificidad | 0,9075 |
| AUC | 0,9524 |

El autor indica que en el TCC se emplearon además un umbral ajustado (τ = 0,94) y calibración por Temperature Scaling (T = 1,776), cuyos resultados no están reflejados en los pesos publicados y no se detallan numéricamente en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,34 GB solo para pesos en FP32, con un pico de unos 2-3 GB considerando activaciones y batch pequeño; en FP16 los pesos bajan a unos 0,67 GB y el pico puede quedar en 1-1,5 GB; en INT8 rondaría los 0,33 GB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de memoria es suficiente, incluidas RTX 3050, RTX 3060, RTX 4090, T4, L4, A10, A100 o H100. Las GPU de gama alta solo tienen sentido para maximizar el throughput en lotes grandes, no por requisito de memoria.
- ¿Cabe en GPU de consumo? Sí, en prácticamente cualquier GPU de consumo con 4 GB o más; también es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime o TorchScript para servir con FastAPI/uvicorn, Hugging Face Inference Endpoints y despliegue en contenedor propio. vLLM, llama.cpp y Ollama no son aplicables a este tipo de modelo (no generativo, sin pesos GGUF publicados).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saleonhard/bertimbau-urnas-desinformacao | 334.398.466 | 256 tokens en fine-tuning | Clasificación binaria de desinformación sobre urnas (pt) | Apache 2.0 | HuggingFace, safetensors |
| neuralmind/bert-large-portuguese-cased (base) | No disponible en la información proporcionada | No disponible | Modelo de lenguaje enmascarado en portugués | No disponible en la información proporcionada | HuggingFace |
| Otros clasificadores de desinformación en portugués | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de resultados comparativos frente a otros clasificadores de desinformación en portugués, ni de métricas del modelo base en esta tarea concreta, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado específicamente sobre desinformación relativa a las urnas electrónicas brasileñas y la campaña de 2022. Su rendimiento fuera de ese tema o ese periodo puede degradarse notablemente, según advierte el propio autor.
- Dificultad con ironía, sarcasmo y contextos ambiguos: la clasificación se basa en patrones textuales superficiales, sin acceso al contexto conversacional completo ni a conocimiento factual externo.
- Riesgo de falsos positivos y falsos negativos: con el umbral por defecto de 0,5 el F1 es 0,8879, lo que implica un margen de error no despreciable en producción; conviene calibrar el umbral según el coste relativo de cada tipo de error.
- Descalibración de los pesos publicados: las métricas de la model card corresponden al umbral 0,5, pero el TCC usó τ = 0,94 y Temperature Scaling (T = 1,776) que no están incorporados en los pesos. Un despliegue directo con umbral 0,5 no reproduce las condiciones óptimas del estudio.
- Ejemplo potencialmente engañoso en la model card: el fragmento de código incluido devuelve la etiqueta `Não Desinformação` con score 0,9913 para un texto que afirma explícitamente que las urnas son fraudulentas. Conviene verificar empíricamente el comportamiento del modelo antes de confiar en la salida del ejemplo.
- Sesgo de dominio y de fuente: el corpus proviene de verificaciones de agencias de fact-checking y de tuits etiquetados manualmente, lo que puede introducir sesgos asociados a las líneas editoriales de esas agencias y al estilo de escritura de sus verificaciones.
- Ausencia de multilingüismo: solo portugués, con etiquetas que apuntan a `pt-br`. No hay evidencia de funcionamiento en español ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones de uso añadidas por el autor.
- Adecuación a producción: se trata de un modelo de investigación académica con 17 descargas y sin validación externa independiente; no debe usarse como única fuente de decisión en contextos con consecuencias legales o reputacionales.
- Uso responsable: clasificar contenido como desinformación tiene implicaciones sobre la libertad de expresión; es recomendable mantener supervisión humana en el circuito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saleonhard/bertimbau-urnas-desinformacao
- Modelo base BERTimbau large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Código fuente del TCC (recolección, procesamiento, entrenamiento y análisis): https://github.com/saleonhard/TCC
- Dataset de fine-tuning: uefactsbr-urnas-eleicoes-2022 (identificador citado en la model card; no se proporciona URL en la información disponible)
