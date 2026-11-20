# mradermacher/MAI-Gym-9B-i1-GGUF

## Resumen

MAI-Gym-9B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Tongyi-MAI/MAI-Gym-9B, un transformer denso de aproximadamente 8.950 millones de parámetros desarrollado por Tongyi-MAI (equipo de Alibaba). El repositorio no contiene pesos en formato original ni código de entrenamiento: su función es ofrecer versiones comprimidas del modelo base listas para su uso con llama.cpp y herramientas compatibles, con el objetivo de reducir los requisitos de memoria y facilitar el despliegue en hardware de consumo.

La particularidad técnica de esta publicación es el uso de cuantización con matriz de importancia (imatrix), etiquetada como i1, que calibra la pérdida de precisión según la relevancia estadística de cada tensor. El autor publica además un fichero imatrix independiente para que terceros puedan generar sus propias cuantizaciones con el mismo calibrado. La colección cubre un rango muy amplio de niveles, desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

El modelo está liberado bajo licencia Apache 2.0 y declara únicamente el idioma inglés. Es relevante para desarrolladores que necesiten ejecutar un modelo de 9B en local, en estaciones de trabajo con una sola GPU o incluso en CPU, sin renunciar a un formato ampliamente soportado por el ecosistema (llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y atención no disponibles) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también se publican cuantizaciones estáticas en el repo MAI-Gym-9B-GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Tongyi-MAI/MAI-Gym-9B más allá de su naturaleza transformer densa y su recuento de parámetros (8.953.803.264, verificado sobre los safetensors del modelo original). No se especifican el número de capas, la dimensión oculta, el tipo de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco hay datos sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal.

Lo que sí documenta esta publicación es el proceso de cuantización. mradermacher emplea cuantización ponderada con imatrix (etiqueta i1), que estima la importancia de cada tensor a partir de estadísticas de activación y redistribuye el error de cuantización hacia los pesos menos sensibles. El repositorio incluye el fichero `MAI-Gym-9B.imatrix.gguf` para replicar el calibrado, y el autor referencia los análisis públicos de ikawrakow y Artefact2 sobre la relación entre tipo de cuantización y perplejidad. La conversión se realizó desde el formato Hugging Face (`convert_type: hf`), con tensores de salida cuantizados (`output_tensor_quantised: 1`) y versión de cuantizador 2.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno (el repo está etiquetado como `conversational`).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base MAI-Gym-9B; los detalles concretos de rendimiento no están documentados en esta ficha.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite servirlo tras una API compatible con el ecosistema transformers/OpenAI.
- Ejecución en llama.cpp y derivados gracias al formato GGUF, con soporte de cuantizaciones desde 2,8 GB hasta 7,5 GB.
- Capacidades de tool calling, agentes, matemáticas, código o visión: no disponibles en la información proporcionada; no se confirma su presencia.
- Capacidades multilingües: limitadas al inglés según la model card; el resto de idiomas no está declarado.

## Casos de uso

- Asistente conversacional local en inglés: con las cuantizaciones i1-Q4_K_M (5,7 GB) o i1-Q5_K_M (6,6 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM y puede gestionar diálogos multi-turno sin depender de servicios en la nube.
- Despliegue en estaciones de trabajo sin GPU dedicada: las variantes i1-IQ2_M (3,7 GB) e i1-IQ3_S (4,5 GB) permiten inferencia en CPU con llama.cpp, útiles para prototipos y entornos de desarrollo con RAM limitada.
- Servicio de API interno compatible con OpenAI: al estar etiquetado como `endpoints_compatible`, puede exponerse mediante servidores de inferencia que hablan el protocolo OpenAI, integrándose en aplicaciones existentes sin reescribir clientes.
- Procesamiento por lotes de texto en inglés: generación de resúmenes, clasificación o extracción de información sobre corpus en inglés, usando la variante Q4_K_S (5,5 GB) para maximizar throughput por GPU.
- Experimentación e investigación en cuantización: el fichero imatrix publicado permite reproducir el calibrado y comparar la degradación de perplejidad entre niveles IQ y K, sirviendo como banco de pruebas para estudiar el impacto de la cuantización en modelos de ~9B.
- Evaluación comparativa de modelos base: al ofrecer 25 variantes del mismo modelo, permite medir cómo afecta la compresión a tareas concretas antes de fijar un nivel de cuantización para producción.
- Integración en asistentes de escritorio y herramientas tipo LM Studio u Ollama: el formato GGUF es el estándar de facto en estos entornos, lo que simplifica la distribución del modelo a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta publicación no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad entre cuantizaciones; únicamente referencia gráficas externas de terceros sobre tipos de cuantización de baja calidad.

## Requisitos de hardware

- Huella en disco/VRAM según cuantización: 2,8 GB (i1-IQ1_S), 3,7 GB (i1-IQ2_M), 4,5 GB (i1-IQ3_S), 5,5 GB (i1-Q4_K_S), 5,7 GB (i1-Q4_K_M), 6,6 GB (i1-Q5_K_M), 7,5 GB (i1-Q6_K). Añadir margen para el contexto KV cache, cuyo tamaño depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para Q4_K_M y superiores, GPUs con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); para niveles IQ2/IQ3, GPUs de 6-8 GB (RTX 3050, RTX 2060) o ejecución parcial en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde IQ1 hasta Q6_K con GPUs de 8 GB o más; las variantes IQ2 e IQ3 pueden ejecutarse en GPUs de 6 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI que acepten GGUF, y cualquier runtime que soporte el formato (koboldcpp, text-generation-webui). El modelo base en safetensors puede servirse con vLLM o TGI, aunque esta publicación concreta es solo GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, del nivel de cuantización y del backend. Como referencia cualitativa, el autor clasifica Q4_K_M como "fast, recommended" y Q4_0 como "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MAI-Gym-9B-i1-GGUF (esta ficha) | 8,95B | No disponible | Apache 2.0 | GGUF (25 cuantizaciones i1) | Hugging Face, 973 descargas |
| MAI-Gym-9B (modelo base) | 8,95B | No disponible | Apache 2.0 | Safetensors | Hugging Face (Tongyi-MAI) |
| MAI-Gym-9B-GGUF (cuantizaciones estáticas) | 8,95B | No disponible | Apache 2.0 | GGUF estático | Hugging Face (mradermacher) |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan comparar el rendimiento con modelos de otros desarrolladores del mismo tamaño (por ejemplo, Llama 3.1 8B o Qwen2.5 7B); la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo declarado únicamente en inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Las cuantizaciones de muy baja precisión (i1-IQ1_S, i1-IQ1_M, i1-Q2_K_S) degradan la calidad de forma significativa; el propio autor las etiqueta como "for the desperate" o "very low quality". No son aptas para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de 9B; no hay datos publicados de evaluación que permitan acotarlo.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineación, lo que dificulta evaluar riesgos de contenido.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base; conviene verificar que las condiciones del modelo original (Tongyi-MAI/MAI-Gym-9B) coincidan, ya que esta publicación es una derivación.
- La longitud de contexto no está disponible: planificar aplicaciones con contexto largo requiere consultar la model card del modelo base.
- El repositorio ocupa 110,2 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.
- El autor advierte que las cuantizaciones IQ no son necesariamente superiores a las K del mismo tamaño; la elección debe validarse con evaluaciones propias.
- No se confirman capacidades de tool calling, agentes o visión; no asumirlas en diseño de producción sin verificación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MAI-Gym-9B-i1-GGUF
- Modelo base: https://huggingface.co/Tongyi-MAI/MAI-Gym-9B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/MAI-Gym-9B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MAI-Gym-9B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
