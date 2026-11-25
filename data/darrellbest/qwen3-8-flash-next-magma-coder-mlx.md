# darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX

## Resumen

Qwen3.8-Flash-Next-Magma-Coder-MLX es una cuantización comunitaria no oficial del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario darrellbest en Hugging Face. No está afiliada ni respaldada por Qwen ni por Alibaba, y su licencia declarada es qwen-community-1.0 (etiquetada como "other" en los metadatos del repositorio). El objetivo del proyecto es ofrecer un empaquetado MLX optimizado para mlx-serve en un formato iQ-MLX de 4,7 bits por peso, con expertos enrutados a 4 bits y el resto de componentes a 8 bits.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 48 capas y 512 expertos enrutados por capa, según se deduce de la tabla por capas incluida en la model card. La cuantización conserva los 512 expertos y la cabeza MTP (multi-token prediction), y no incluye fine-tuning ni poda. El repositorio se encuentra en estado de trabajo en curso: el tamaño del repo es de 0,0 GB y las descargas y likes son cero, lo que indica que los pesos aún no se han subido o no están disponibles públicamente.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización por experto con precisión mixta que reduce el error de reconstrucción estimado en torno a un 46 % frente a 4 bits uniformes al mismo tamaño; por otro, expone las limitaciones prácticas de dicho enfoque, ya que el formato compacto por experto requiere un loader MLX específico (Magma) que no está disponible en herramientas estándar como llama.cpp, Ollama, LM Studio, vLLM o MLX estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas, 512 expertos enrutados por capa, cabeza MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iQ-MLX 4,7 bpw (expertos enrutados 4 bits, resto 8 bits); build v2 uniforme (~131 GB); build v3 por experto en contenedor Q8_0 (~188 GB); formato compacto por experto de Magma (~122 GB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el repo) |
| Formato de pesos | MLX (v2 y v3); GGUF para v3 en llama.cpp; formato compacto propietario para Magma |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas y 512 expertos enrutados por capa, según la tabla detallada de la model card. Cada capa contiene 1.024 proyecciones gate+up (512 expertos × 2 proyecciones) y 512 proyecciones down. La cuantización conserva la cabeza MTP (multi-token prediction), lo que sugiere que el modelo base incorpora decodificación especulativa o predicción multi-token como parte de su diseño. No se dispone de información sobre el número total de parámetros, los parámetros activos por token, la longitud de contexto ni la composición del dataset de entrenamiento original.

El proceso de cuantización no incluye fine-tuning ni poda. Se aplica una calibración con imatrix específica para código y agentes, cuyas fuentes son: transcripciones de agentes KannaCode, SWE-bench Lite (issues y parches gold), código fuente de Magma y KannaCode, hermes-function-calling-v1 de NousResearch, MATH-500, GSM8K, chat general (ultrachat_200k) y, solo en la build v2, transcripciones privadas de sesiones de agente del autor (filtradas y no distribuidas). El texto de calibración y la imatrix no se distribuyen.

La innovación técnica principal es la asignación de precisión mixta por experto: se asigna un tipo de cuantización a cada una de las 73.728 proyecciones de experto, dando más bits a los expertos a los que enrutan textos de código, tool-calling y razonamiento, y menos a los que apenas se usan. Las capas tempranas tienden a 3-4 bits; las capas tardías, más estresadas por tráfico de código y herramientas, reciben muchos expertos a 5-6 bits. Solo los expertos que el tráfico de calibración casi nunca enruta reciben 2 bits. El autor reporta una reducción del error de reconstrucción ponderado por enrutamiento e imatrix de aproximadamente el 46 % frente a 4 bits uniformes al mismo tamaño. La verificación KL extremo a extremo está en curso.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la información disponible.
- Generación de código: la calibración está orientada explícitamente a código (KannaCode, SWE-bench Lite, código fuente de Magma y KannaCode), lo que sugiere un sesgo de cuantización favorable a tareas de programación.
- Tool calling / function calling: se incluye hermes-function-calling-v1 en la calibración, lo que indica soporte esperado de llamadas a herramientas.
- Razonamiento matemático: MATH-500 y GSM8K forman parte del conjunto de calibración.
- Capacidades de agente: las transcripciones de agentes KannaCode y SWE-bench Lite apuntan a un uso previsto en flujos de agente multi-paso.
- Predicción multi-token: la cabeza MTP se conserva en la cuantización.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, revisar y parchear código, gracias a que la calibración prioriza código y a que conserva los 512 expertos con mayor precisión en las capas tardías que procesan tráfico de programación.
- Agentes de resolución de incidencias: adecuado para flujos tipo SWE-bench, donde el agente lee un issue, localiza el código relevante y propone un parche, ya que el conjunto de calibración incluye issues y parches gold de SWE-bench Lite.
- Asistentes con tool calling: puede gestionar llamadas a funciones y APIs en conversaciones multi-turno, respaldado por el conjunto hermes-function-calling-v1 usado en la calibración.
- Razonamiento matemático asistido: útil para resolver problemas de matemáticas y verificar cálculos, dado que MATH-500 y GSM8K forman parte del material de calibración.
- Despliegue local en Apple Silicon: la build v2 (uniforme, ~131 GB) funciona en mlx-lm y mlx-serve estándar, lo que permite ejecutar el modelo en equipos Mac con memoria unificada suficiente sin depender de CUDA.
- Investigación en cuantización: el repositorio sirve como caso de estudio reproducible de asignación de precisión por experto y de su impacto en el error de reconstrucción, con tabla por capas detallada.
- Servicio de chat general: la inclusión de ultrachat_200k en la calibración sugiere un uso previsto como modelo conversacional, aunque el foco principal es código y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una reducción estimada del error de reconstrucción de expertos de ~46 % frente a 4 bits uniformes al mismo tamaño, y una verificación KL extremo a extremo en curso, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni similares.

Datos de rendimiento medidos por el autor:

| Escenario | Throughput |
|---|---|
| Build v3 en GPU de 96 GB con algunos expertos en CPU | 6-9 tok/s |
| Build v2 (uniforme, ~131 GB) | ~55 tok/s (referencia comparativa del autor) |

## Requisitos de hardware

- VRAM/memoria estimada: build v2 ~131 GB; build v3 ~188 GB; formato compacto Magma ~122 GB. Estas cifras implican que el modelo no cabe en GPUs de consumo convencionales.
- GPU recomendadas: GPU con 96 GB o más para la build v3 (el autor menciona una GPU de 96 GB con expertos parciales en CPU); para la build compacta de Magma se requiere un runtime compatible con anchos de bits por experto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB. En Apple Silicon se requiere memoria unificada del orden de 128 GB o más para v2 y v3.
- Opciones de despliegue: mlx-lm y mlx-serve estándar para v2; llama.cpp, LM Studio y Ollama para v3 (con contenedor Q8_0); loader MLX de Magma para el formato compacto por experto. vLLM y MLX estándar solo ejecutan la build uniforme v2.
- Latencia y throughput: 6-9 tok/s en v3 con expertos en CPU sobre GPU de 96 GB; ~55 tok/s de referencia para v2 según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Magma-Coder-MLX (este) | no disponible (MoE, 48 capas, 512 expertos) | no disponible | iQ-MLX 4,7 bpw; v2 ~131 GB; v3 ~188 GB | qwen-community-1.0 | Repo en construcción, 0 descargas |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | Pesos originales | qwen-community-1.0 | Disponible en Hugging Face (Qwen/Qwen3.8-Flash-Next) |
| Qwen3.8-Flash-Next-Magma-Coder-GGUF | no disponible | no disponible | GGUF con misma calibración | qwen-community-1.0 | Disponible en Hugging Face (darrellbest) |
| Otras cuantizaciones comunitarias de Qwen3.8-Flash-Next | no disponible | no disponible | GGUF, MLX, AWQ, etc. | según autor | no disponible |

## Limitaciones y advertencias

- Cuantización no oficial: no está afiliada ni respaldada por Qwen ni por Alibaba; el soporte y la validación corren a cargo del autor comunitario.
- Estado incompleto: el repositorio tiene 0,0 GB, 0 descargas y 0 likes; los pesos aún se están construyendo y subiendo, por lo que no es apto para producción en este momento.
- Compatibilidad de runtime limitada: el formato compacto por experto (~122 GB) solo funciona con el loader MLX de Magma, que no está disponible en herramientas estándar. Sin Magma, hay que elegir entre v2 (uniforme, más rápido) o v3 (por experto, más lento en una sola GPU de 96 GB).
- Requisitos de memoria muy elevados: entre 122 GB y 188 GB, lo que excluye GPUs de consumo y exige hardware de gama alta o Apple Silicon con memoria unificada grande.
- Verificación pendiente: la verificación KL extremo a extremo está en curso y no se han publicado benchmarks de calidad downstream.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una cuantización agresiva (2-4 bits en muchos expertos), puede amplificar degradaciones en tareas fuera de la distribución de calibración.
- Restricciones de licencia: la licencia qwen-community-1.0 debe revisarse antes de uso comercial; el repositorio la etiqueta como "other" y enlaza a LICENSE, pero no se detallan sus términos en la información disponible.
- Idiomas: no se especifican los idiomas soportados; la calibración es mayoritariamente en inglés técnico y código.
- Calibración no reproducible: el texto de calibración y la imatrix no se distribuyen, y la build v2 incluye transcripciones privadas del autor, lo que dificulta la reproducción exacta de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización GGUF relacionada: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Repositorio Magma: enlace no público en el momento de redactar la ficha (el autor indica "link when public")
- Issue de seguimiento GGUF/CUDA de Magma: issue #80 del repositorio Magma (no se proporciona URL directa)
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face
