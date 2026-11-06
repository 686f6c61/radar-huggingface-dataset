# joestacey/ministral3-8b-nli-10k

## Resumen

Ministral 3 8B NLI 10k es un adaptador LoRA para inferencia de lenguaje natural (NLI) de tres clases (entailment, neutral y contradiction) construido sobre el modelo instruct mistralai/Ministral-3-8B-Instruct-2512-BF16. Lo desarrolla el usuario joestacey y se publica como adaptador PEFT independiente: el repositorio contiene únicamente los pesos del adaptador y el tokenizer (0,2 GB), mientras que los pesos base se cargan por separado en la revisión fijada en `adapter_config.json`. Su propósito no es la generación conversacional general, sino servir como clasificador de veracidad o consistencia dentro de pipelines de evaluación de respuestas generadas.

El adaptador se entrena sobre 10.000 ejemplos, 2.000 muestreados de cada uno de cinco corpus de NLI (SNLI, MultiNLI, ANLI, NLI-Fever y VitaminC) con semilla 0. El modelo subyacente es un transformer denso de 8.000 millones de parámetros de la familia Ministral 3, en variante Instruct y precisión BF16, con ventana de contexto amplia (las especificaciones exactas de contexto no se detallan en la información disponible).

La relevancia actual es acotada y muy específica: el adaptador está pensado para el proyecto understanding-probe-robustness, donde se usa como función de corrección (`correctness_function ministral`) para puntuar respuestas generadas en tareas de razonamiento científico (por ejemplo, SciQ) sin necesidad de regenerar respuestas ni estados ocultos. No se han publicado resultados finales de evaluación en conjuntos NLI retenidos; el autor indica explícitamente que dicha evaluación está en curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Ministral 3 8B Instruct |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantización y cómputo en bfloat16 durante el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); pesos base en BF16 cargados aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Ministral-3-8B-Instruct-2512-BF16, un transformer denso de 8B parámetros. El entrenamiento usa QLoRA: cuantización 4-bit NF4 con doble cuantización y cómputo en bfloat16, rango LoRA 16, alpha 32 y dropout 0,05 sobre las proyecciones de atención de texto y MLP. Se realiza una sola época con batch size 8, optimizador AdamW con tasa de aprendizaje 1e-4 y calentamiento lineal sobre el 5 % de los pasos. La premisa se trunca a 256 tokens y la pérdida se aplica únicamente a los tokens de respuesta.

Los datos provienen de cinco conjuntos de NLI: 2.000 ejemplos de stanfordnlp/snli, 2.000 de nyu-mll/multi_nli, 2.000 de facebook/anli, 2.000 de pietrolesci/nli_fever y 2.000 de tals/vitaminc, muestreados con semilla 0. En FEVER se usa la evidencia como premisa y la afirmación como hipótesis. Las etiquetas son entailment, neutral y contradiction. La puntuación normaliza los logits de los primeros tokens distintos de las tres palabras de etiqueta y devuelve probabilidades en el orden entailment, neutral, contradiction; el autor advierte que no son verosimilitudes de secuencia completa. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación NLI de tres clases: entailment, neutral y contradiction.
- Puntuación de consistencia entre una premisa (evidencia) y una hipótesis (afirmación), devolviendo probabilidades normalizadas por token inicial.
- Integración como función de corrección en pipelines de evaluación de respuestas generadas (proyecto understanding-probe-robustness).
- Puntuación de respuestas de entrenamiento y evaluación sin regenerar respuestas ni estados ocultos.
- Agregación de puntuaciones NLI al estilo de AlignScore (agregación por frase y por referencia).
- Herencia de las capacidades del modelo base Instruct (generación de texto y conversación), aunque el adaptador está especializado en NLI.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de veracidad en QA: dado un contexto de evidencia y una respuesta generada, el adaptador devuelve la probabilidad de entailment, neutral y contradiction, permitiendo filtrar respuestas no respaldadas por la evidencia.
- Corrección de respuestas en benchmarks de razonamiento científico: en el pipeline de understanding-probe-robustness se invoca con `--correctness_function ministral` para puntuar respuestas de SciQ sin regenerarlas.
- Detección de alucinaciones en sistemas RAG: comparar la respuesta del generador con los fragmentos recuperados y marcar como contradictorias o neutras aquellas con baja probabilidad de entailment.
- Validación de resúmenes frente al documento fuente: comprobar que cada frase del resumen está implicada por el texto original.
- Filtrado de datos de entrenamiento: descartar pares premisa-hipótesis con etiqueta contradictoria o neutra antes de usarlos en fine-tuning supervisado.
- Auditoría de consistencia factual en atención al cliente: verificar que las respuestas automáticas no contradicen la documentación interna indexada.
- Investigación en robustez de sondas: usar el adaptador como sonda NLI fija mientras se varía el modelo generador para aislar el efecto del evaluador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación del adaptador en conjuntos NLI retenidos está en curso y que no se reclaman resultados finales.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,2 GB, pero requiere cargar el modelo base de 8B parámetros. En BF16, el base ocupa aproximadamente 16 GB de VRAM; en cuantización 4-bit, en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 con margen ajustado o para 8-bit.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con BF16 o 8-bit; en GPUs de 8-12 GB requiere cuantización 4-bit del base.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI para servir el base con el adaptador fusionado; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joestacey/ministral3-8b-nli-10k | 8B (base) + LoRA | no disponible | NLI 3 clases | apache-2.0 | Hugging Face (adaptador) |
| Modelos NLI dedicados tipo DeBERTa-v3 (p. ej. MoritzLaurer) | ~0,1-0,4B | 512 tokens típicamente | NLI 3 clases | MIT/Apache según variante | Hugging Face |
| mistralai/Ministral-3-8B-Instruct-2512-BF16 | 8B | no disponible | Generación instruct | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el adaptador, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados en conjuntos NLI retenidos; el rendimiento real es desconocido.
- La puntuación se basa en los logits del primer token de cada etiqueta, no en la verosimilitud de la secuencia completa de la palabra, lo que puede introducir sesgos sistemáticos.
- La premisa se trunca a 256 tokens durante el entrenamiento; entradas más largas pueden degradar la clasificación.
- El adaptador está entrenado con 10.000 ejemplos, un volumen reducido que puede limitar la generalización a dominios distintos de los cinco corpus usados.
- No se documentan idiomas soportados; los corpus de entrenamiento son mayoritariamente en inglés, por lo que el uso en castellano no está validado.
- Riesgo de alucinación heredado del modelo base si se usa para generación en lugar de clasificación.
- Sesgos de los datasets de origen (SNLI, MultiNLI, ANLI, FEVER, VitaminC) pueden propagarse al clasificador.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base en su revisión fijada.
- El adaptador depende de una revisión concreta del base indicada en `adapter_config.json`; cargar otra revisión puede alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/joestacey/ministral3-8b-nli-10k
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Repositorio de código: https://github.com/joestacey/understanding-probe-robustness
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset NLI-Fever: https://huggingface.co/datasets/pietrolesci/nli_fever
- Dataset VitaminC: https://huggingface.co/datasets/tals/vitaminc
