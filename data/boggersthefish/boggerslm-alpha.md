# BoggersTheFish/BoggersLM-Alpha

## Resumen

BoggersLM-Alpha es un modelo de lenguaje autorregresivo experimental de 8.471.296 parámetros, desarrollado por el usuario BoggersTheFish a partir de pesos inicializados aleatoriamente, es decir, sin partir de ningún modelo preentrenado externo. Se trata de una arquitectura transformer personalizada implementada en PyTorch puro, no compatible con el ecosistema `AutoModel` de Transformers, entrenada en una GTX 1050 Ti durante una campaña nocturna de 135.350 actualizaciones del optimizador.

El modelo se presenta como un alfa de investigación y no como un asistente fiable. Su entrenamiento combinó datos de TinyStories, Cosmopedia v2 y FineWeb-Edu (procedentes de SmolLM-Corpus), OpenAssistant y un archivo privado filtrado. La model card reconoce explícitamente que la recuperación de hechos, el seguimiento de instrucciones, la aritmética, la memoria multiturno y el diálogo personal siguen siendo poco fiables, y sospecha sobreajuste en las etapas finales del entrenamiento.

Su relevancia es limitada y de carácter didáctico: sirve como ejemplo de entrenamiento desde cero de un transformer de escala muy reducida, con decisiones de diseño poco habituales (vocabulario jerárquico reversible de 4.096 tokens, embeddings composicionales, capacidad posicional de 2.048 bytes). No es una alternativa práctica a modelos de su categoría de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo personalizado (8 bloques, hidden size 256, 8 cabezas de atención), implementación propia en PyTorch |
| Parametros totales | 8.471.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Capacidad posicional de 2.048 bytes; vocabulario jerárquico reversible de 4.096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible; la model card declara explícitamente que no concede licencia alguna |
| Formato de pesos | Pesos PyTorch con script de inferencia propio (`inference.py`); no es un paquete Transformers |

## Arquitectura y entrenamiento

El modelo emplea ocho bloques transformer con tamaño oculto de 256 y ocho cabezas de atención, sobre un vocabulario jerárquico reversible de 4.096 tokens con embeddings composicionales y una capacidad posicional expresada en 2.048 bytes. Los logits de salida se escalan por 0,5. La inferencia se realiza mediante código PyTorch propio, lo que implica que no se puede cargar con `AutoModel` ni con las herramientas estándar del ecosistema Hugging Face sin adaptación.

El entrenamiento acumuló 400.001.904 exposiciones supervisadas a tokens (incluyendo ejemplos repetidos) a lo largo de 135.350 actualizaciones del optimizador. Las fuentes de datos fueron TinyStories, Cosmopedia v2 y FineWeb-Edu extraídos de SmolLM-Corpus, OpenAssistant y un archivo privado filtrado. No se usaron pesos preentrenados externos. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación; la model card describe las fases como «seed nativo de archivo», «educación lingüística general», «entrenamiento conversacional» y «reintegración personal», sin detallar hiperparámetros ni composición exacta del dataset.

## Capacidades

- Generación de texto autorregresiva en inglés, con mejoras notables en escritura de historias y inglés básico según la evaluación interna.
- Modo de completado (`--mode completion`) además del modo de respuesta a preguntas.
- Capacidad conversacional limitada y poco fiable, según la propia model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el modelo permite estudiar el comportamiento de un transformer de 8,5 M de parámetros entrenado sin pesos preentrenados, útil para docencia y experimentación académica sobre dinámicas de entrenamiento.
- Generación de microrrelatos en inglés: es la tarea donde la model card reporta mejores resultados (0,813 bits por byte en el conjunto de historias), adecuada para prototipos de generación creativa de texto muy corto.
- Pruebas de infraestructura de inferencia en hardware modesto: al caber previsiblemente en GPUs de gama baja, sirve para validar pipelines de despliegue antes de escalar a modelos mayores.
- Estudio de tokenizadores jerárquicos: su vocabulario reversible de 4.096 tokens y embeddings composicionales lo convierten en un banco de pruebas para investigar esquemas de tokenización alternativos.
- Análisis de sobreajuste y olvido catastrófico: la caída de rendimiento en diálogo personal en etapas tardías lo hace útil para estudiar estos fenómenos en modelos pequeños.
- Reproducción de experimentos de bajo coste: documenta el entrenamiento en una GTX 1050 Ti, lo que facilita replicar el proceso con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La model card únicamente reporta métricas internas de desarrollo en bits por byte sobre conjuntos mantenidos aparte:

| Conjunto de evaluacion | Bits por byte |
|---|---|
| Historias (stories) | 0,813 |
| Cosmopedia | 1,346 |
| FineWeb-Edu | 1,770 |
| Chat general | 1,932 |
| Texto del propietario | 1,999 |
| Diálogo personal | 3,022 |

El autor advierte que estas cifras son métricas internas de desarrollo y no evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 8,47 M de parámetros (aproximadamente 34 MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el propio autor entrenó en una GTX 1050 Ti.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060 y superiores, e incluso podría ejecutarse en CPU.
- Opciones de despliegue: únicamente el script `inference.py` propio con PyTorch 2.5.1 o compatible; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI al no ser un paquete Transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BoggersLM-Alpha | 8,47 M | 2.048 bytes (posicional) | No disponible (sin licencia concedida) | Pesos PyTorch propios |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache-2.0 | Transformers, GGUF, vLLM |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | Transformers, GGUF, vLLM |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Transformers, GGUF |

La comparación es asimétrica: BoggersLM-Alpha es entre uno y dos órdenes de magnitud menor que las alternativas y no ofrece compatibilidad con el ecosistema estándar. No se dispone de benchmarks comparables que permitan una evaluación de rendimiento frente a estos modelos.

## Limitaciones y advertencias

- Recuperación de hechos, seguimiento de instrucciones, aritmética, memoria multiturno y diálogo personal poco fiables según el propio autor.
- Sospecha de sobreajuste en las etapas finales del entrenamiento, con degradación del rendimiento en diálogo respecto a evaluaciones anteriores.
- Riesgo elevado de alucinación y de respuestas incorrectas; no debe usarse como asistente en producción.
- Entrenado únicamente en inglés; sin capacidades multilingües.
- Licencia no disponible: la model card declara explícitamente que no se concede licencia, por lo que el uso comercial no está permitido y la redistribución requiere revisión de los términos de las fuentes.
- Los pesos y el tokenizador pueden retener información de material de entrenamiento privado; el escaneo de vocabulario realizado no garantiza ausencia de datos personales memorizados.
- No se ha completado una revisión exhaustiva de memorización, privacidad y licencias.
- Las licencias de los datasets de origen (CDLA-Sharing-1.0, ODC-By, Apache-2.0) requieren revisión de atribución antes de cualquier redistribución pública.
- No compatible con `AutoModel` de Transformers, lo que limita su integración en herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoggersTheFish/BoggersLM-Alpha
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
