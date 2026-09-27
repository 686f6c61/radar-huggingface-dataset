# olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed101

# olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed101

## Resumen

Se trata de un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B publicado por el usuario olusegunola en Hugging Face. El nombre del repositorio indica que parte de la familia Qwen2.5 en su variante de 1.500 millones de parámetros y que el entrenamiento se ha realizado sobre PrimeKG, un grafo de conocimiento orientado a medicina de precisión, con una semilla concreta (seed101) y un prompt de evaluación asociado. La model card, sin embargo, es la plantilla automática de transformers y no contiene ninguna descripción, licencia, idioma ni detalle de entrenamiento, por lo que buena parte de las especificaciones no están confirmadas por el autor.

El interés de este checkpoint es fundamentalmente de investigación: forma parte de una serie de variantes del mismo autor sobre el mismo modelo base y el mismo conjunto de datos, con metodologías distintas (por ejemplo `qwen2.5-1.5b-primekg-orpo-seed2024` y `qwen2.5-1.5b-primekg-dkd-seed101`), lo que sugiere experimentos comparativos de ajuste sobre grafos de conocimiento biomédicos. El repositorio tiene 0 descargas, 0 likes y un tamaño reportado de 0,0 GB, por lo que su utilidad práctica inmediata es cuestionable hasta que se verifique que los pesos están realmente disponibles.

No hay información publicada sobre arquitectura modificada, datos de entrenamiento, benchmarks ni licencia específica. Todo lo que se puede afirmar con rigor sobre el modelo base (Qwen2.5-1.5B) procede de la documentación oficial de Qwen y no necesariamente se hereda sin cambios tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Qwen2.5-1.5B: GQA, SwiGLU, RoPE, RMSNorm); no confirmada en la model card |
| Parametros totales | 1.500 millones (según el nombre del repositorio y el modelo base Qwen2.5-1.5B); no confirmado en la model card |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este fine-tune; el modelo base Qwen2.5-1.5B soporta 32.768 tokens nativos (hasta 131.072 con configuracion YaRN segun la documentacion de Qwen) |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no se publican GGUF ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 es multilingue (mas de 29 idiomas, incluyendo castellano, ingles y chino) |
| Licencia | no disponible en la model card; el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (segun los tags del repositorio) |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Fecha de creacion | 2026-09-27 (fecha declarada en el repositorio) |
| Semilla | seed101 (indicada en el nombre del repositorio) |
| Dataset declarado en el nombre | PrimeKG (grafo de conocimiento biomedico); no confirmado en la model card |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura específica de este checkpoint. Por el nombre, se asume que conserva la arquitectura densa del modelo base Qwen2.5-1.5B, que emplea atención con consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm e incrustaciones posicionales rotatorias (RoPE), pero esto no está verificado en la model card ni en ningún documento asociado al repositorio.

Respecto al entrenamiento, lo único deducible es lo que aparece en el identificador del repositorio: un ajuste sobre PrimeKG, con una semilla fija y un "evalprompt". El sufijo `ctl` no está explicado en ninguna fuente disponible y podría corresponder a distintas técnicas (por ejemplo, aprendizaje contrastivo, aunque es una hipótesis sin confirmar). No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO, ORPO u otra fase de alineamiento, ni los hiperparámetros empleados. Los repositorios hermanos del mismo autor sugieren que se trata de una comparativa de métodos de ajuste (por ejemplo, `orpo` y `dkd`), pero no hay documentación que lo confirme.

## Capacidades

- No hay ninguna capacidad documentada de forma explícita por el autor del modelo.
- Por herencia del modelo base Qwen2.5-1.5B, cabría esperar generación de texto, comprensión lectora, razonamiento básico, generación de código elemental y matemáticas sencillas, pero el ajuste sobre un dominio biomédico puede haber degradado capacidades generales.
- El nombre del repositorio sugiere entrenamiento sobre un grafo de conocimiento biomédico (PrimeKG), lo que apuntaría a tareas de relación entre entidades, enlazado de entidades o respuesta a preguntas sobre el grafo; sin confirmar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles para este checkpoint; el modelo base Qwen2.5 es multilingüe.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles. El modelo base es exclusivamente de texto.
- No se especifica la existencia de una plantilla de chat (`chat_template`) propia de este fine-tune.

## Casos de uso

Dado que no existe documentación ni evaluación publicada, los siguientes casos son escenarios hipotéticos condicionados a una validación previa del checkpoint. No deben desplegarse en producción sin verificar pesos, licencia y comportamiento.

- Extracción de relaciones biomédicas: si el ajuste sobre PrimeKG es correcto, el modelo podría usarse para identificar relaciones entre entidades (fármaco-enfermedad, gen-proteína) en textos científicos, aprovechando el vocabulario y las relaciones vistas durante el entrenamiento. Requiere evaluación con un conjunto de test propio.
- Enlazado de entidades a un grafo de conocimiento: dado un fragmento de texto clínico o biomédico, el modelo podría normalizar menciones a identificadores del grafo. Es un caso típico de ajuste sobre grafos de conocimiento, pero no está verificado.
- Respuesta a preguntas sobre un grafo biomédico: uso como generador de respuestas en lenguaje natural a partir de tripletas recuperadas de PrimeKG, en un pipeline de RAG estructurado donde el grafo actúa como fuente de verdad.
- Experimentos de reproducibilidad y ablación: la serie de repositorios del mismo autor (semillas y métodos distintos) permite reproducir comparativas de metodologías de ajuste sobre el mismo dataset, un caso de uso de investigación más que de producto.
- Destilación y generación de datos sintéticos: por su tamaño reducido, el modelo puede emplearse como generador de borradores anotados que luego se filtran con un modelo mayor, siempre con revisión humana.
- Inferencia en entornos con recursos limitados: un modelo de 1.500 millones de parámetros puede ejecutarse en una GPU de consumo o incluso en CPU con cuantización, lo que lo hace apto para prototipos locales de procesamiento de literatura biomédica sin enviar datos a servicios externos.
- Evaluación de sesgos y alucinación en dominio médico: útil como caso de estudio de hasta qué punto un ajuste pequeño sobre un grafo de conocimiento reduce o aumenta las afirmaciones no fundamentadas.
- Integración en pipelines de búsqueda semántica biomédica: uso del modelo como codificador o reranker ligero, si se confirma que el entrenamiento incluyó objetivos de representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla automática de transformers y no incluye ninguna sección de evaluación cumplimentada. No hay datos de MMLU, HumanEval, GSM8K, PubMedQA, MedQA ni de ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones basadas en el tamaño de 1.500 millones de parámetros, no medidas sobre este checkpoint):
  - fp16/bf16: aproximadamente 3,0-3,5 GB solo de pesos, más caché KV.
  - int8: aproximadamente 1,6-2,0 GB.
  - 4 bits (GGUF Q4_K_M, si se genera): aproximadamente 1,0-1,2 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente en fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G o superiores funcionan sin problema. En A100/H100 el modelo queda muy infrautilizado y solo tiene sentido para serving de alto paralelismo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales con 6 GB o más, e incluso en CPU con cuantización de 4 bits.
- Opciones de despliegue: vLLM y TGI para serving en GPU con safetensors; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors. Transformers con `device_map` es la vía directa si los pesos están completos.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint y el repositorio reporta 0,0 GB, lo que impide confirmar que los pesos estén descargables.

## Comparativa con modelos similares

La comparación se limita a especificaciones declaradas; no hay datos de rendimiento de este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed101 | 1.500 M (segun nombre) | no disponible | no disponible | Repositorio sin model card, 0 descargas, 0,0 GB |
| Qwen2.5-1.5B (modelo base) | 1.500 M | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Entrenado sobre hasta 18.000 millones de tokens segun el informe tecnico de Qwen2.5; multilingue |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Variante alineada para instrucciones; alternativa directa si el fine-tune no resulta utilizable |
| Llama-3.2-1B | 1.230 M | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con contexto largo |
| Gemma-2-2B | 2.600 M | 8.192 tokens | Gemma Terms of Use | Alternativa algo mayor, contexto reducido y licencia con restricciones de uso |

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre desarrollador, tipo de modelo, idiomas, licencia ni uso previsto.
- El repositorio declara un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar subidos o estar incompletos. Conviene verificar los ficheros antes de cualquier uso.
- No existe licencia declarada para este checkpoint. Aunque el modelo base Qwen2.5-1.5B es Apache 2.0, un fine-tune puede añadir condiciones propias; sin licencia explícita, el uso comercial es jurídicamente ambiguo.
- No hay evaluación de ningún tipo: se desconoce si el ajuste ha degradado las capacidades generales del modelo base, algo habitual en fine-tunes de dominio con pocos datos.
- Un modelo de 1.500 millones de parámetros en dominio médico presenta un riesgo elevado de alucinación factual. No debe usarse para decisiones clínicas, diagnóstico ni consejo médico sin supervisión experta.
- El dominio de entrenamiento (PrimeKG) puede introducir sesgos de cobertura: el grafo sobrerrepresenta ciertas enfermedades y relaciones, con lagunas en poblaciones, enfermedades raras o literatura no anglosajona.
- Existe riesgo de fuga de información si el modelo ha memorizado tripletas del grafo de entrenamiento; su salida no debe tratarse como evidencia independiente.
- El significado del sufijo `ctl` en el nombre del repositorio no está documentado ni confirmado.
- El tag `arxiv:1910.09700` que aparece en el repositorio corresponde al artículo del calculador de impacto ambiental de Lacoste et al., incluido automáticamente por la plantilla de la model card; no es una referencia al modelo ni a su método de entrenamiento.
- La fecha de creación declarada (27 de septiembre de 2026) es posterior a la fecha actual, lo que apunta a metadatos generados automáticamente o incorrectos.
- El autor no ofrece contacto ni repositorio de código asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed101
- Repositorio hermano (ORPO, seed2024): https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-orpo-seed2024
- Repositorio hermano (DKD, seed101): https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-dkd-seed101
- Informe técnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Documentación de variantes y capacidades de Qwen2.5 (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5/1.1-model-variants-and-capabilities
- Página del modelo base en Ollama (qwen2.5:1.5b): https://ollama.com/library/qwen2.5:1.5b
- Artículo del calculador de impacto ambiental citado en la plantilla (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML: https://mlco2.github.io/impact
