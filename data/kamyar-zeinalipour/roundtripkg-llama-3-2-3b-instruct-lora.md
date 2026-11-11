# Kamyar-zeinalipour/RoundTripKG-Llama-3.2-3B-Instruct-LoRA

## Resumen

RoundTripKG-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre meta-llama/Llama-3.2-3B-Instruct, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena y afiliaciones asociadas) y presentado en el Industry Track de ACL 2026. El modelo está especializado en la extracción de tripletas de grafos de conocimiento (sujeto, predicado, objeto) a partir de texto en inglés, una tarea central en la construcción automatizada de grafos de conocimiento industriales.

La innovación principal es el pipeline "round-trip": el modelo verbaliza tripletas de un grafo en texto y después reconstruye el grafo desde esa verbalización, conservando únicamente los textos de los que el grafo original puede recuperarse de forma exacta. Ese corpus autogenerado y filtrado por fidelidad semántica se utiliza para el ajuste fino del propio modelo, lo que mejora su precisión de extracción sin necesidad de anotación humana.

El adaptador ocupa 1,6 GB, se distribuye en formato safetensors compatible con peft y se fusiona con el modelo base mediante `merge_and_unload()`. No modifica la arquitectura subyacente: hereda la ventana de contexto de 128 000 tokens de Llama 3.2 3B Instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) + adaptador LoRA |
| Parámetros totales | 3,21 mil millones (modelo base); adaptador LoRA de rango 16 (tamaño de repo 1,6 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.2 3B Instruct) |
| Tipos de cuantización | no disponible (el adaptador se publica en bf16; el modelo base admite las cuantizaciones estándar de Llama 3.2) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-3B-Instruct, un transformer decoder-only de 3,21 mil millones de parámetros con atención causal estándar y RoPE. La configuración LoRA es r = 16, α = 32 y dropout 0,1, aplicada a todas las proyecciones de atención y MLP, además de `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4 con decaimiento coseno, precisión bf16, DeepSpeed y 4 × RTX A6000.

Los datos de entrenamiento provienen del dataset Kamyar-zeinalipour/llama3b_kg, generado por el propio modelo mediante el pipeline round-trip: se verbalizan tripletas del grafo en texto, se reconstruye el grafo desde el texto y se retienen solo las verbalizaciones que permiten recuperar el grafo original de forma exacta. No se documenta en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset. No se menciona RLHF ni DPO; el ajuste es supervisado sobre el corpus filtrado.

## Capacidades

- Extracción de tripletas de grafo de conocimiento (sujeto, predicado, objeto) a partir de texto en inglés.
- Verbalización de grafos de conocimiento: generación de texto natural que describe un grafo de forma fiel.
- Reconstrucción de grafos desde texto (round-trip), lo que permite validar la fidelidad semántica de las verbalizaciones.
- Generación de texto general, razonamiento y comprensión lectora heredados de Llama 3.2 3B Instruct.
- Capacidad multilingüe limitada: el adaptador está entrenado y etiquetado únicamente para inglés.
- Soporte de tool calling y function calling: no disponible de forma específica en la información proporcionada (el modelo base Llama 3.2 Instruct sí lo soporta).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Construcción automatizada de grafos de conocimiento industriales: el modelo extrae tripletas de documentación técnica, manuales o informes y las convierte en nodos y aristas de un grafo, aprovechando el filtrado round-trip para reducir tripletas espurias.
- Enriquecimiento de bases de conocimiento existentes: a partir de textos no estructurados se generan nuevas tripletas que se validan reconstruyendo el grafo y comparándolo con el original.
- Verbalización de grafos para explicabilidad: dado un subgrafo, el modelo genera una descripción en lenguaje natural que puede auditarse por expertos humanos, con una valoración media de 4,02 sobre 5 en el corpus de evaluación.
- Pipelines de extracción de información en dominios regulados: al ser un adaptador de 3B parámetros, puede desplegarse en infraestructura moderada y auditarse localmente, lo que facilita el cumplimiento de requisitos de privacidad.
- Generación de datos sintéticos para entrenamiento de extractores de tripletas: el corpus autogenerado y filtrado por fidelidad sirve como datos de aumento para otros modelos.
- Integración en sistemas RAG sobre grafos: las tripletas extraídas alimentan índices de grafos que después se consultan para responder preguntas con contexto estructurado.
- Evaluación de fidelidad semántica: el pipeline round-trip permite medir si una verbalización conserva la información del grafo, útil como métrica en proyectos de generación aumentada por grafos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del corpus round-trip. La valoración humana es una escala experta de 1 a 5.

| Métrica | Base | Fine-tuned | Δ |
|---|---:|---:|---:|
| BERTScore F1 | 0,372 | 0,514 | +0,142 |
| ROUGE-L F1 | 0,409 | 0,442 | +0,033 |
| BLEU-4 | 0,089 | 0,147 | +0,058 |
| Valoración humana (1–5) | 2,30 | 4,02 | +1,72 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3,21 mil millones de parámetros requiere aproximadamente 6,5 GB en bf16/fp16 y alrededor de 2 GB en cuantización de 4 bits (estimación a partir del tamaño del modelo; no confirmada en la información proporcionada).
- GPU recomendadas: RTX A6000 (usada en el entrenamiento), A100, H100 para despliegues de producción; RTX 4090, RTX 3090 o superiores para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en bf16 y en tarjetas con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers + peft (con `merge_and_unload()`), vLLM, TGI y llama.cpp/Ollama tras convertir los pesos fusionados a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoundTripKG-Llama-3.2-3B-Instruct-LoRA | 3,21 B (base) + LoRA | 128 000 | Extracción de tripletas KG | llama3.2 | Hugging Face (adaptador PEFT) |
| RoundTripKG-Llama-3.2-1B-Instruct-LoRA | 1,24 B (base) + LoRA | 128 000 | Extracción de tripletas KG | llama3.2 | Hugging Face (adaptador PEFT) |
| RoundTripKG-Llama-2-7b-chat-hf-LoRA | 6,74 B (base) + LoRA | 4 096 | Extracción de tripletas KG | llama2 | Hugging Face (adaptador PEFT) |
| Llama-3.2-3B-Instruct (base) | 3,21 B | 128 000 | Generación de texto general | llama3.2 | Hugging Face |

Los tres adaptadores RoundTripKG comparten metodología; la valoración humana pasa de 1,94 a 2,70 en el de 1B, de 2,30 a 4,02 en el de 3B y de 2,70 a 3,32 en el de Llama 2 7B. No se dispone de comparación con extractores de tripletas dedicados de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado y etiquetado únicamente para inglés; su rendimiento en otros idiomas no está documentado.
- Al ser un ajuste fino sobre un modelo de 3B parámetros, puede heredar sesgos presentes en los datos de Llama 3.2 y en el corpus autogenerado.
- Riesgo de alucinación en la extracción de tripletas: el filtrado round-trip reduce pero no elimina la generación de relaciones inexistentes en el texto fuente.
- El corpus de entrenamiento es autogenerado por el propio modelo, lo que puede amplificar errores sistemáticos presentes en las verbalizaciones iniciales.
- La licencia llama3.2 impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar sus términos antes de un despliegue en producción.
- El adaptador requiere cargar el modelo base por separado y fusionarlo; no es un modelo autónomo y depende de la disponibilidad de meta-llama/Llama-3.2-3B-Instruct.
- No se documentan resultados en benchmarks estándar ni evaluaciones fuera del dominio del corpus round-trip, por lo que la generalización a otros dominios industriales no está verificada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-3B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Kamyar-zeinalipour/llama3b_kg
- Paper (ACL 2026, Industry Track): https://aclanthology.org/2026.acl-industry.140/
- DOI: https://doi.org/10.18653/v1/2026.acl-industry.140
- Repositorio de código: https://github.com/KamyarZeinalipour/round-trip-kg
- Colección "From Graph to Text and Back": https://huggingface.co/collections/Kamyar-zeinalipour/from-graph-to-text-and-back-acl-2026-6af4841166cf330a92294b6c
- Adaptador 1B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama 2 7B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-2-7b-chat-hf-LoRA
