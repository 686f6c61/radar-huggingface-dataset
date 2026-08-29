# g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV

## Resumen

El modelo `g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV` es un checkpoint experimental de generación de texto creado mediante la fusión de pesos de dos modelos base: Llama 2 de 13B parámetros y CodeLlama de 7B parámetros. El autor, g-assismoraes, lo describe como un "merged checkpoint" producido por un paquete experimental denominado Delta-P2S (también etiquetado como "pen2sword"). La técnica de fusión no está documentada públicamente, y la model card apenas ofrece detalles sobre el proceso de entrenamiento o los datos utilizados.

Se trata de un modelo con 13.015.864.320 parámetros (13B), alojado en Hugging Face con formato safetensors y compatible con la librería transformers. Aunque el nombre sugiere una combinación de capacidades de Llama 2 (razonamiento general) y CodeLlama (generación de código), no se ha publicado ninguna evaluación que confirme el comportamiento real del modelo. Su relevancia actual es limitada: es un experimento de investigación sin documentación, sin licencia declarada y sin métricas de rendimiento, por lo que su uso en producción no es recomendable sin una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (probablemente Llama 2, segun el nombre) |
| Parametros totales | 13.015.864.320 (13B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es presumiblemente la de Llama 2 (transformer decoder-only con atención causal), dado el nombre del modelo y el tag "llama". Sin embargo, no se especifica si se trata de la variante original de Llama 2 o de una modificación. El proceso de entrenamiento se describe únicamente como un "merged checkpoint" producido por el paquete Delta-P2S, con rutas de directorio que indican una inicialización basada en `codellama_llama_SameFormula-S13-QV`. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas como RLHF o DPO. La técnica "Delta-P2S" o "pen2sword" no está documentada en fuentes públicas, por lo que se desconoce si implica interpolación de pesos, adaptación de capas o algún otro método de fusión.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede producir texto autocompletado o continuaciones de secuencias.
- No se ha confirmado ninguna capacidad adicional como tool calling, razonamiento multi-paso, soporte de agentes, visión o audio.
- Dado que el nombre incluye "CodeLlama7B", es plausible que herede cierta capacidad de generación de código, pero no hay evidencia empírica publicada.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

Dada la ausencia de documentación y benchmarks, los casos de uso son especulativos y deben considerarse con extrema cautela:

- Experimentación académica: el modelo puede servir como objeto de estudio para investigar técnicas de fusión de modelos (Delta-P2S), comparando su comportamiento con los modelos base Llama 2 y CodeLlama.
- Generación de texto genérica: podría utilizarse para tareas de autocompletado o generación de prosa, aunque sin garantías de calidad o coherencia.
- Generación de código (hipotética): si la fusión con CodeLlama ha preservado capacidades de código, podría probarse en tareas simples de programación, pero no hay datos que lo respalden.
- Pruebas de compatibilidad con infraestructura: al estar disponible en plataformas como FriendliAI, puede usarse para validar despliegues de modelos de 13B en entornos de inferencia.
- Análisis de sesgos y alineación: al ser un modelo sin alineación conocida, puede ser útil para estudiar comportamientos no filtrados en modelos base.
- Desarrollo de técnicas de fusión: investigadores interesados en replicar o mejorar el método Delta-P2S podrían usar este checkpoint como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 13B parámetros en precisión fp16, el modelo ocupa aproximadamente 26 GB (coincide con el tamaño del repo). En cuantización de 8 bits, ~13 GB; en 4 bits, ~7 GB.
- GPU recomendadas: para fp16 se necesitaría una GPU con al menos 32 GB (p. ej., A100, V100 32GB) o dos GPUs de 16 GB. Con cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) sería suficiente.
- En consumer GPU: sí, con cuantización (GGUF o AWQ) puede caber en GPUs de 16-24 GB, aunque no se han publicado archivos cuantizados en el repo.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta). FriendliAI ya ofrece despliegue del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeltaP2S-Llama2-13B-P2S-CodeLlama7B (este) | 13B | no disponible | no disponible | Hugging Face, FriendliAI |
| Llama 2 13B (base) | 13B | 4096 | Llama 2 Community License | Meta, Hugging Face |
| CodeLlama 7B (base) | 7B | 16384 | Llama 2 Community License | Meta, Hugging Face |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a los modelos base que presumiblemente componen este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo derivado de Llama 2 y CodeLlama, puede heredar los sesgos de estos modelos base, pero no hay estudios específicos.
- Riesgo de alucinacion: alto, especialmente sin alineación ni fine-tuning supervisado conocido.
- Limitaciones de contexto: la longitud de contexto no está documentada; si se basa en Llama 2, sería de 4096 tokens, pero no es seguro.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin aclaración legal.
- Caveat para produccion: no es apto para entornos productivos sin una evaluación rigurosa previa. La falta de documentación, benchmarks y licencia clara lo convierte en un modelo de riesgo alto.
- El nombre sugiere una fusión de dos arquitecturas distintas (Llama 2 13B y CodeLlama 7B), pero no se ha verificado la integridad de la fusión ni su estabilidad numérica.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV
- Variante sin sufijo -QV: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B
- Despliegue en FriendliAI: https://friendli.ai/models/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B
- Despliegue de variante SameFormula-S13 en FriendliAI: https://friendli.ai/models/g-assismoraes/DeltaP2S-Llama2-13B-SameFormula-S13
- Repositorio de inferencia de Llama (referencia): https://github.com/meta-llama/llama
