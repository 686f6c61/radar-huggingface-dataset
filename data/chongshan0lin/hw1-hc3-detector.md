# Chongshan0Lin/hw1-hc3-detector

## Resumen

El modelo `Chongshan0Lin/hw1-hc3-detector` es un clasificador binario de texto en inglés que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Se construye mediante fine-tuning completo (*end-to-end*) del encoder `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus HC3 (*Hello-SimpleAI/HC3*), un conjunto de preguntas y respuestas de foros como Reddit ELI5. Con 22.713.986 parámetros (unos 22,7 millones) y pesos en safetensors, es un modelo muy ligero, ejecutable en CPU y pensado para tareas de clasificación, no de generación.

Su relevancia es sobre todo metodológica: sirve como ejemplo reproducible de cómo el fine-tuning de un encoder pequeño mejora drásticamente una línea base de embeddings congelados más regresión logística, pasando de una precisión de 0,8449 a 0,9852 en el split de test de HC3 (4.668 respuestas balanceadas). No obstante, el propio autor advierte en la model card de que se trata de un trabajo de curso sobre un benchmark de 2022 y de que no debe emplearse como detector fiable de texto generado por IA en entornos reales.

El contexto de uso está limitado a inglés y a una ventana máxima de 256 tokens, coherente con la longitud de secuencia del modelo base. La licencia no está declarada en el repositorio, y el modelo registra 0 descargas y 0 *likes* en HuggingFace en el momento de la consulta de metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia BERT (MiniLM) con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`), 2 etiquetas |
| Parametros totales | 22.713.986 (≈22,7 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima empleada en entrenamiento y en el ejemplo de uso; coincide con el `max_seq_length` del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en precisión original (tamaño del repo: 0,1 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer del tipo MiniLM, la misma familia que el modelo base `sentence-transformers/all-MiniLM-L6-v2` (6 capas, dimensión oculta 384, alrededor de 22,7 millones de parámetros). Sobre ese encoder se añade una cabeza de clasificación con `num_labels=2` y se entrena con pérdida de entropía cruzada. Las etiquetas son `0 = human` y `1 = ChatGPT`. A diferencia de un uso típico de *sentence embeddings* con clasificador lineal congelado, aquí se ajustan todos los pesos del encoder de forma *end-to-end*.

Los datos provienen del fichero `all.jsonl` del dataset `Hello-SimpleAI/HC3` (revisión `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`). Se conservó la primera respuesta no vacía de humano y de ChatGPT por pregunta, y se excluyeron preguntas con respuestas vacías, duplicadas o idénticas. El particionado se hizo 80/10/10 por pregunta (semilla 42) para que las respuestas de una misma pregunta permanezcan en el mismo split: 37.334 ejemplos de entrenamiento, 4.666 de validación y 4.668 de test. El entrenamiento usó el optimizador AdamW con tasa de aprendizaje 2e-5, planificador constante, tamaño de lote 32, 5 épocas, longitud máxima de 256 tokens y semilla 42, sobre una única GPU NVIDIA RTX A6000 (aproximadamente 1,7 minutos por época). No se documenta ningún uso de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve la etiqueta `human` o `ChatGPT` para una respuesta dada.
- Detección de texto generado por ChatGPT en el dominio concreto de HC3 (respuestas a preguntas de foros tipo ELI5/Reddit).
- Inferencia muy ligera: al ser un encoder de 22,7 M de parámetros, funciona en CPU y en GPUs de gama baja.
- Integración con el ecosistema `transformers`, con soporte declarado para `text-embeddings-inference` y `endpoints_compatible`.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No genera texto: es un modelo exclusivamente discriminativo.
- No tiene capacidades de visión, audio ni modo *thinking*.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Reproducción de líneas base en investigación sobre detección de texto generado: permite replicar el experimento de HC3 con un encoder pequeño y comparar el fine-tuning completo frente a embeddings congelados más regresión logística.
- Material docente para cursos de PLN: ilustra de forma compacta (22,7 M de parámetros, 5 épocas, 1,7 minutos por época en una A6000) el flujo completo de fine-tuning de un clasificador con `AutoModelForSequenceClassification`.
- Comparación de arquitecturas ligeras: sirve como referencia de precisión (0,9852) frente a alternativas más grandes o más pequeñas en el mismo corpus.
- Pre-filtrado en pipelines de anotación: etiquetar automáticamente respuestas candidatas de un corpus tipo HC3 antes de la revisión humana, asumiendo que las predicciones son solo una señal preliminar.
- Análisis de sesgos y robustez: estudiar cómo un clasificador de este tipo explota artefactos del dataset (espaciado del tokenizador, longitud, formato) en lugar de señales semánticas.
- Despliegue de bajo coste en entornos con recursos limitados: al ocupar menos de 1 GB, puede servirse en CPU o en GPUs integradas para demos internas o prototipos.
- Evaluación de transferibilidad: usarlo como caso negativo controlado para medir la caída de rendimiento al cambiar de modelo generador, de prompt o de dominio.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del split de test de HC3 en inglés (4.668 respuestas, balanceado):

| Modelo | Exactitud en test (HC3 EN) |
|---|---|
| Linea base: embeddings congelados de `all-MiniLM-L6-v2` + regresion logistica | 0,8449 |
| Fine-tuning completo (este modelo) | 0,9852 |

Desglose de errores del modelo ajustado: 69 clasificaciones incorrectas en total, de las cuales 68 son respuestas humanas predichas como ChatGPT y 1 es una respuesta de ChatGPT predicha como humana. La línea base cometía 724 errores.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible, algo coherente con la naturaleza del modelo (clasificador de texto, no modelo generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en fp32 ocupan aproximadamente 91 MB; las activaciones para 256 tokens son mínimas.
- GPU recomendadas: ninguna en particular; el modelo se entrenó en 1× NVIDIA RTX A6000, pero para inferencia basta una GPU de gama baja o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de memoria (por ejemplo, GTX 1050 Ti, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, `text-embeddings-inference` (etiqueta declarada por el autor), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y servidores propios con FastAPI. `vLLM` no es la opción natural para un encoder de clasificación de este tamaño; `llama.cpp` y Ollama no aplican al no existir pesos GGUF publicados.
- Latencia y throughput: no disponibles; no se publican mediciones de inferencia. El único dato de rendimiento conocido es el de entrenamiento: aproximadamente 1,7 minutos por época en una RTX A6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (HC3 EN test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Chongshan0Lin/hw1-hc3-detector` (este modelo) | 22,7 M | 256 tokens | 0,9852 de exactitud | no disponible | safetensors en HuggingFace |
| Linea base: `all-MiniLM-L6-v2` congelado + regresion logistica | 22,7 M | 256 tokens | 0,8449 de exactitud | Apache-2.0 (modelo base) | HuggingFace |
| `Aishkrish/hw1-hc3-detector` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `Chengwei-Shen/hw1-hc3-detector` | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los repositorios `Aishkrish/hw1-hc3-detector` y `Chengwei-Shen/hw1-hc3-detector` aparecen en la búsqueda web como variantes del mismo ejercicio, pero no se dispone de sus especificaciones ni de sus resultados. Tampoco se dispone de datos verificables de detectores de propósito general (por ejemplo, los detectores AIGC en chino mencionados en el repositorio `abdullahwaheed2804/AI-detection`), por lo que no se incluyen comparaciones numéricas.

## Limitaciones y advertencias

- El propio autor indica que el modelo se entrenó para un trabajo de curso sobre un benchmark de 2022 y que **no** es un detector fiable de texto generado por IA en general.
- No debe usarse para evaluar o juzgar el trabajo de estudiantes ni para tomar decisiones académicas o disciplinarias.
- Sesgo conocido hacia la clase `ChatGPT`: 68 de sus 69 errores son respuestas humanas acusadas falsamente de ser generadas por IA. Es decir, los falsos positivos dominan claramente sobre los falsos negativos.
- Explota artefactos del dataset, como el espaciado propio del tokenizador en las respuestas humanas de Reddit ELI5, la longitud del texto y el formato, en lugar de señales semánticas profundas.
- Transferibilidad muy limitada: es probable que no funcione con otros modelos generadores, otros estilos de prompt u otros dominios distintos de HC3.
- Idiomas: solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto limitado a 256 tokens; los textos más largos se truncan, lo que puede alterar la predicción.
- Licencia no declarada en el repositorio, lo que impide confirmar si se permite el uso comercial. Además, el modelo base `all-MiniLM-L6-v2` se distribuye bajo Apache-2.0, pero eso no aclara la licencia de este derivado.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza aparente en textos fuera de distribución.
- Metadatos del repositorio: 0 descargas y 0 *likes*, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chongshan0Lin/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Revisión del dataset usada en el entrenamiento: `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`
- Variante del mismo ejercicio (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Variante del mismo ejercicio (Chengwei-Shen): https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Ficha de variante en savrn.com (Yihangsun): https://savrn.com/models/hw1-hc3-detector
- Registro en free2aitools (hongjip): https://free2aitools.com/model/hongjip/hw1-hc3-detector
- Repositorio de detectores AIGC relacionados: https://github.com/abdullahwaheed2804/AI-detection
