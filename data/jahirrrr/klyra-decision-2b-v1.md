# Jahirrrr/Klyra-Decision-2B-V1

## Resumen

Klyra-Decision-2B-V1 es un modelo experimental de decisión, no generativo, desarrollado por Polyvor Labs (publicado bajo la cuenta de HuggingFace `Jahirrrr`) sobre el backbone lingüístico MiniCPM5-2B-Midtrain de OpenBMB. En lugar de producir texto token a token, utiliza cabezas de predicción dedicadas que emiten puntuaciones o distribuciones de probabilidad para tres primitivas de decisión: *choice* (elegir el candidato más adecuado de una lista de 2 a 8 opciones), *score* (valorar una entrada en una escala ordinal discreta de 0 a 4, con valor esperado) y *noul* (juicio binario sí/no).

El modelo es relevante porque aborda un patrón muy extendido en sistemas de agentes —usar un LLM generativo como enrutador, selector de herramientas o evaluador— sustituyendo la generación autoregresiva por un *forward pass* único con cabezas ligeras, lo que en teoría reduce latencia y hace la salida directamente calibrable y parseable. Se distribuye como adaptador LoRA (rango 16, alpha 32) junto con los pesos de las cabezas personalizadas, no como un checkpoint fusionado.

Se trata de una *release* de investigación (versión 1.0) con 0 descargas y 1 *like* en el momento de la consulta, repo de 0.0 GB, licencia no especificada y ventana de entrada limitada a 256 tokens. No es un asistente conversacional ni un modelo de generación de texto *drop-in*: requiere cargar el backbone original junto con el adaptador y el código de las cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder tipo MiniCPM5 (compatible con Llama, causal LM) + adaptador LoRA en atención + tres cabezas MLP de decisión (choice, score, noul); inferencia no generativa |
| Parametros totales | Aproximadamente 2.500 millones en el backbone (la nomenclatura "2B" sigue a la familia del modelo base); el repositorio contiene solo el adaptador LoRA y las cabezas, no el backbone fusionado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens por entrada codificada (máximo de entrada declarado en la configuración V1) |
| Tipos de cuantizacion | No disponible; el repositorio no documenta cuantizaciones y solo distribuye adaptador y cabezas en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA y pesos de las cabezas, vía PEFT) |

Otras especificaciones declaradas por el autor:

| Propiedad | Valor |
|---|---|
| Clase de modelo | MiniCPM5 decoder / Llama-compatible causal LM |
| Módulos con LoRA | `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Rango / alpha / dropout de LoRA | 16 / 32 / 0,05 |
| Cabezas de decisión | Choice (1 logit por candidato), Score (5 logits), Noul (1 logit) |
| Candidatos en choice | 2 a 8 (configuración de entrenamiento e inferencia V1) |
| Estructura de cada cabeza | `LayerNorm → Linear(hidden, 256) → GELU → Linear(256, output_dim)` |
| Ajuste de probabilidades | Escalado de temperatura por tarea, con temperaturas almacenadas aparte |

## Arquitectura y entrenamiento

La arquitectura parte del checkpoint MiniCPM5-2B-Midtrain, un decoder causal de aproximadamente 2.500 millones de parámetros. Sobre él se aplica un adaptador LoRA únicamente en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`, rango 16, alpha 32, dropout 0,05). La representación del último token alimenta tres cabezas independientes de tipo MLP: *choice* evalúa de forma independiente representaciones condicionadas por candidato y normaliza las puntuaciones con softmax sobre el conjunto de candidatos; *score* aplica softmax sobre cinco logits (niveles 0 a 4) y calcula además una valoración esperada; *noul* aplica una sigmoide sobre un único logit para el juicio binario. No hay decodificación autoregresiva en ninguna de las tres rutas.

El entrenamiento consistió en *supervised fine-tuning* multitarea con LoRA y cabezas entrenables: optimizador AdamW, 1.200 pasos, acumulación de gradiente de 4 micro-lotes por paso, tasa de aprendizaje inicial 1,5 × 10⁻⁴ con decaimiento lineal y 4% de *warmup*, *weight decay* 0,01, precisión BF16 con autocast y semilla 42. El muestreo de tareas fue 60% choice / 20% score / 20% noul. Las fuentes de datos documentadas en el pipeline son CommonsenseQA (razonamiento de opción múltiple), Banking77 (clasificación de intenciones y selección de candidatos), SNLI (inferencia de lenguaje natural y decisiones binarias), HelpSteer2 (calidad de respuesta valorada de forma ordinal por humanos), BoolQ (comprensión lectora con etiquetas sí/no) y, de forma opcional y sujeta a acceso restringido, xLAM Function Calling 60K para ejemplos de enrutamiento de una sola herramienta. El autor advierte explícitamente que el repositorio no incluye un manifiesto verificado de qué ejemplos de xLAM se usaron realmente en esta ejecución concreta, y que el listado de datasets describe el pipeline, no un inventario auditado a nivel de muestra. El pipeline normaliza y recorta los ejemplos disponibles, baraja los candidatos de choice, deduplica claves de prompt normalizadas y reserva *splits* separados de validación y calibración.

No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido. La innovación principal es el propio esquema de cabezas de decisión con temperatura por tarea.

## Capacidades

- Selección entre candidatos (*choice*): dada una lista de 2 a 8 opciones y una pregunta, devuelve una distribución de probabilidad normalizada sobre los candidatos.
- Puntuación ordinal (*score*): asigna probabilidades a cinco niveles (0 a 4) y una valoración esperada, útil para evaluar calidad de respuestas.
- Juicio binario (*noul*): probabilidad de sí/no sobre una entrada, para decisiones de dos clases.
- Clasificación de texto en sentido amplio (el *pipeline tag* declarado es `text-classification`), incluyendo clasificación de intenciones.
- Enrutamiento y selección de herramientas: los *tags* y el uso de xLAM en el pipeline apuntan a enrutamiento de una sola herramienta, aunque su inclusión efectiva en el entrenamiento no está auditada.
- Multitarea en un mismo backbone: las tres tareas comparten representación, con cabezas separadas y temperaturas independientes.
- No soporta generación de texto, tool calling generativo, razonamiento multi-paso explícito, visión, audio ni modos de *thinking*.
- Multilingüe: no; solo inglés declarado.

## Casos de uso

- Enrutamiento de consultas en un sistema de agentes: dado un mensaje de usuario y una lista de hasta 8 herramientas o agentes disponibles, usar la cabeza *choice* para obtener una distribución sobre ellos y derivar la ruta con mayor probabilidad o aplicar un umbral de confianza antes de escalar a un humano.
- Clasificación de intenciones en atención al cliente: con etiquetas de intención como candidatos (estilo Banking77), la cabeza *choice* devuelve probabilidades por intención, lo que permite integrar la confianza en la lógica de derivación a un agente humano.
- Evaluación de calidad de respuestas generadas: usar la cabeza *score* para puntuar respuestas de otro modelo en la escala 0 a 4 y la valoración esperada como métrica continua en un pipeline de evaluación automática o de filtrado de datos de entrenamiento.
- Verificación de afirmaciones y control de alucinaciones: la cabeza *noul* permite plantear juicios sí/no del tipo "¿esta respuesta está respaldada por el contexto?" en 256 tokens, como filtro previo a la entrega al usuario.
- Enrutamiento de bajo coste en producción: al no generar texto, cada decisión es un único *forward pass* sobre 256 tokens, lo que encaja en servicios de clasificación de alto volumen donde el coste por consulta y la latencia importan más que la riqueza de la salida.
- Selección de candidatos en recuperación aumentada (RAG): presentar entre 2 y 8 fragmentos recuperados y usar *choice* para reordenar o seleccionar el pasaje más relevante antes de la generación final.
- Investigación en calibración y confianza: las temperaturas por tarea y las salidas probabilísticas permiten estudiar la calibración de decisiones en modelos pequeños frente a esquemas de *LLM-as-a-judge* generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluida se interrumpe al inicio de la sección de evaluación; únicamente se indica que los resultados se generaron con el arnés de evaluación de cabezas de decisión propio de Klyra y que se refieren exclusivamente a Klyra-Decision-2B-V1, no a versiones experimentales posteriores. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de las métricas específicas de choice, score o noul.

## Requisitos de hardware

- VRAM estimada para inferencia del backbone en BF16: en torno a 5 GB solo para pesos, más activaciones y cabezas; cifra estimada a partir de los ~2.500 millones de parámetros, no publicada por el autor.
- En FP16/BF16 cabe en GPU de consumo con 8-12 GB (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090), siempre que el backbone se cargue junto al adaptador y las cabezas.
- Cuantización del backbone a 8 bits o 4 bits (bitsandbytes) reduciría el requisito a aproximadamente 2,5 GB o 1,5 GB, pero no es un escenario documentado ni validado por el autor.
- GPU de centro de datos (A100 40/80 GB, H100) no son necesarias para un modelo de este tamaño; resultan sobredimensionadas salvo para entrenamiento o evaluación por lotes a gran escala.
- Despliegue: no es compatible de forma directa con `pipeline("text-classification")` de Transformers, ni con vLLM o TGI en su forma estándar, porque las cabezas son personalizadas; requiere `transformers` + `peft` y el código de las cabezas del autor. No hay pesos GGUF, por lo que llama.cpp y Ollama no están soportados.
- Latencia y throughput: no disponibles. Al no haber generación autoregresiva, la latencia esperada es la de un único *forward pass* sobre 256 tokens, pero no se han publicado mediciones.
- Nota importante: el tamaño del repositorio reportado es 0.0 GB, lo que en la práctica puede indicar que los artefactos no están disponibles o no se han subido correctamente; conviene verificarlo antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klyra-Decision-2B-V1 | ~2,5 B (backbone) + LoRA y cabezas | 256 tokens | No generativo; cabezas de choice/score/noul | No disponible | Repo HuggingFace con 0 descargas; formato adaptador PEFT |
| MiniCPM5-2B-Midtrain (modelo base) | ~2,5 B | No disponible en la información proporcionada | Generativo causal; requiere prompting y parseo de salida | No disponible | Checkpoint público de OpenBMB en HuggingFace |
| Clasificador tipo encoder (p. ej. familia BERT/DeBERTa) | No disponible | No disponible | Clasificación discriminativa con cabeza softmax | No disponible | Ampliamente disponible en HuggingFace |
| *LLM-as-a-judge* generativo | No disponible | No disponible | Generación de texto con rúbrica y parseo posterior | No disponible | Múltiples opciones |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a enfoque, formato y disponibilidad.

## Limitaciones y advertencias

- Ventana de entrada de solo 256 tokens: descarta casos de uso con contexto largo, documentos completos o conversaciones multi-turno extensas.
- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o con OpenBMB (licencia del backbone) antes de cualquier despliegue en producción.
- El repositorio contiene únicamente un adaptador LoRA y pesos de cabezas personalizadas; no es un modelo autónomo. Sin el backbone `openbmb/MiniCPM5-2B-Midtrain` y el código de las cabezas, los archivos no son utilizables.
- `pipeline("text-classification")` no funciona: la etiqueta de pipeline es orientativa y no implementa las cabezas. Cualquier integración requiere código propio.
- Riesgo de alucinación: aunque no genera texto libre, las cabezas producen distribuciones que pueden estar mal calibradas fuera de la distribución de entrenamiento. El ajuste de temperatura por tarea es parte del artefacto y debe usarse; ignorarlo sesga las probabilidades.
- Trazabilidad de datos incompleta: el autor reconoce que no existe un manifiesto verificado de los ejemplos de xLAM (acceso restringido) usados en esta ejecución. La composición exacta del entrenamiento no es auditable.
- Sesgos inheridos de los datasets: CommonsenseQA, SNLI, BoolQ, Banking77 y HelpSteer2 introducen sesgos propios (dominios concretos, anotadores concretos, sesgos de género y culturales en NLI). No se documenta ninguna evaluación de sesgo.
- Naturaleza experimental: versión de investigación 1.0, 0 descargas y 1 *like*; sin validación independiente por la comunidad. No se han publicado resultados de benchmarks en la información disponible.
- Tamaño de repositorio de 0.0 GB y ausencia de sección de evaluación completa en la model card: posibles artefactos faltantes o documentación incompleta.
- Restricciones de las cabezas: choice solo cubre 2 a 8 candidatos; score solo cinco niveles (0 a 4); noul solo dos clases. No son extensibles sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jahirrrr/Klyra-Decision-2B-V1
- Modelo base (MiniCPM5-2B-Midtrain, OpenBMB): https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset Banking77: https://huggingface.co/datasets/mteb/banking77
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Dataset xLAM Function Calling 60K (acceso restringido): https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Nota: los resultados de búsqueda web devueltos para esta consulta corresponden a la cadena de tiendas Cultura y no guardan relación con el modelo; se descartan como fuentes. No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
