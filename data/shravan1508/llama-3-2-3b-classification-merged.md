# Shravan1508/llama-3.2-3B-classification-merged

## Resumen

`Shravan1508/llama-3.2-3B-classification-merged` es un ajuste fino (fine-tune) del modelo `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, publicado por el usuario Shravan1508 en Hugging Face. Se trata de un modelo derivado de la familia Llama 3.2 de Meta, en su variante Instruct de 3.000 millones de parámetros, y está orientado, según su nombre, a tareas de clasificación, aunque la model card no documenta el conjunto de datos ni el procedimiento de entrenamiento empleado.

El modelo conserva la arquitectura transformer decoder-only propia de Llama 3.2 y se distribuye en formato safetensors con pesos fusionados (merged) tras el ajuste. El repositorio ocupa 6,4 GB y contiene 3.212.749.824 parámetros totales, lo que corresponde al tamaño completo del modelo base sin cuantización activa en los pesos finales.

Su relevancia es limitada: se trata de un modelo de nicho, sin descargas ni valoraciones, con documentación mínima y entrenado sobre una base ya cuantizada a 4 bits (bnb-4bit) y posteriormente fusionada. Es útil como ejemplo de flujo de trabajo con Unsloth y TRL, pero no como modelo de referencia para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en bnb-4bit; los pesos publicados son safetensors fusionados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, que a su vez deriva del Llama 3.2 3B Instruct de Meta. La arquitectura es la de un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, que menciona que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no aporta detalles sobre hiperparámetros, número de pasos, tamaño del dataset ni composición de los datos.

No se documenta si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado. Tampoco se especifica el dataset de clasificación utilizado ni el número de tokens de entrenamiento. Los pesos publicados son el resultado de fusionar (merge) el adaptador sobre el modelo base cuantizado a 4 bits, lo que puede introducir artefactos de precisión respecto a un fine-tune sobre pesos completos en fp16/bf16.

## Capacidades

- Generación de texto conversacional, heredada del modelo Instruct base.
- Clasificación de texto, presumiblemente la tarea objetivo del ajuste, aunque no se detalla el esquema de etiquetas ni el formato de salida esperado.
- Razonamiento básico y respuesta a instrucciones en inglés.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este fine-tune concreto (el Llama 3.2 Instruct base lo soporta, pero no se garantiza tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de textos cortos en inglés: el modelo puede emplearse para etiquetar reseñas, tickets o mensajes según categorías predefinidas, siempre que se valide el formato de salida esperado, ya que la model card no lo especifica.
- Prototipado rápido de pipelines de clasificación: al estar basado en un modelo de 3B, se puede desplegar en una GPU consumer para experimentar con prompts de clasificación zero-shot o few-shot.
- Filtrado de contenido en inglés: uso como clasificador auxiliar para moderación o triaje de mensajes, con la cautela de que no hay evaluación publicada de su precisión.
- Generación de respuestas conversacionales en inglés: al conservar la base Instruct, puede usarse como chatbot ligero en entornos con recursos limitados.
- Experimentación académica con Unsloth y TRL: sirve como ejemplo reproducible de fine-tune y merge de adaptadores sobre un modelo cuantizado a 4 bits.
- Evaluación comparativa de técnicas de ajuste: útil para estudiar el impacto del merge sobre pesos bnb-4bit frente a fine-tunes en precisión completa.
- Tareas de extracción de información estructurada en inglés: con prompts adecuados, puede generar salidas en formato JSON para pipelines de procesamiento, previa validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): alrededor de 2,5 a 3 GB de pesos, con un total práctico de 4 a 6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM en cuantización 4 bits; en fp16 requiere al menos 10-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF), así como endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shravan1508/llama-3.2-3B-classification-merged | 3,21B | no disponible | apache-2.0 | Hugging Face | Fine-tune de nicho, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k (según documentación de Meta) | Llama 3.2 Community License | Hugging Face | Modelo base oficial, con evaluación publicada |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3,21B | 128k (heredado) | apache-2.0 (según repo de Unsloth) | Hugging Face | Versión cuantizada a 4 bits del Instruct |
| Qwen2.5-3B-Instruct | 3,09B | 32k | apache-2.0 | Hugging Face | Alternativa multilingüe de tamaño similar |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el esquema de etiquetas ni el procedimiento de evaluación, lo que impide conocer su calidad real en tareas de clasificación.
- Riesgo de alucinación: inherente a los modelos de 3B, especialmente en tareas de clasificación sin formato de salida restringido.
- Sesgos: no documentados; el modelo hereda los sesgos del Llama 3.2 Instruct base y de los datos de ajuste, que se desconocen.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Licencia: apache-2.0 según la model card, pero al derivar de Llama 3.2 conviene verificar la compatibilidad con la Llama 3.2 Community License del modelo original antes de un uso comercial.
- Precisión de los pesos: el merge sobre una base bnb-4bit puede degradar ligeramente la calidad respecto a un fine-tune en fp16/bf16.
- Sin señales de adopción: cero descargas y cero valoraciones en el momento de la consulta, lo que desaconseja su uso en producción sin una evaluación propia.
- Soporte de tool calling no confirmado tras el ajuste.

## Enlaces

- [Hugging Face: Shravan1508/llama-3.2-3B-classification-merged](https://huggingface.co/Shravan1508/llama-3.2-3B-classification-merged)
- [Modelo base: unsloth/Llama-3.2-3B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
- [Llama 3.2 en Meta](https://www.llama.com/)
