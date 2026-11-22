# 3MPER0RR/TinyLlama-3MPER0RR-4Bit-NF4-Training-Cyber-v1

## Resumen

TinyLlama-3MPER0RR-4Bit-NF4-Training-Cyber-v1 es un modelo de lenguaje de 1.100.048.384 parámetros (aproximadamente 1,1 mil millones) derivado de TinyLlama-1.1B-Chat-v1.0 a través de una cadena de modificaciones experimentales: primero una variante "abliterated" (3MPER0RR/TinyLlama-3MPER0RR-abliterated) y después un ajuste fino con LoRA fusionado sobre datasets de seguridad ofensiva. El autor, 3MPER0RR, lo publica explícitamente como artefacto de investigación y experimentación, no apto para producción.

El modelo se distribuye cuantizado en 4 bits con el esquema NF4 de bitsandbytes, lo que reduce el repositorio a 1,5 GB y permite su ejecución en GPUs de consumo muy modestas. Su especialización declarada es la ciberseguridad, entrenado sobre los datasets sahilempire/redsec-security-sft-v1 y oyildirim/cyberstrike-sft-120k, ambos con licencia Apache-2.0.

Su relevancia es limitada y acotada al ámbito de la investigación: se trata de un experimento sobre modelos pequeños, con 26 descargas y ningún "like" en el momento de la consulta, sin benchmarks publicados y con advertencias explícitas del autor sobre alucinaciones. Resulta útil como banco de pruebas para estudiar el efecto de la cuantización NF4 combinada con ajuste fino y "abliteration" en modelos de 1B, no como componente de sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama-1.1B) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat-v1.0 soporta 2048 tokens, dato no confirmado para esta variante) |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes); pesos ya cuantizados en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados en 4 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only de aproximadamente 1,1 mil millones de parámetros con atención por causalidad estándar y RoPE. Sobre esa base, el autor aplicó primero un proceso de "abliteration" (eliminación experimental de direcciones de rechazo en el espacio de activaciones) que dio lugar a 3MPER0RR/TinyLlama-3MPER0RR-abliterated, y después un ajuste fino con LoRA que se fusionó en los pesos finales. El resultado se guardó cuantizado en NF4 de bitsandbytes.

Los datos de entrenamiento declarados son dos datasets de instrucciones orientadas a ciberseguridad: sahilempire/redsec-security-sft-v1 y oyildirim/cyberstrike-sft-120k, ambos Apache-2.0. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje ni si hubo fases de RLHF o DPO. Tampoco se documenta el proceso de cuantización (calibración, granularidad por grupo). El único detalle técnico adicional es el formato de entrada: conversaciones en el esquema `messages` con roles `system`, `user` y `assistant`.

## Capacidades

- Generación de texto conversacional multi-turno en formato de chat con roles `system`/`user`/`assistant`.
- Respuestas orientadas a temáticas de ciberseguridad: conceptos, procedimientos y asistencia técnica en el dominio de seguridad ofensiva y defensiva, según los datasets de ajuste.
- Formato de instrucciones simple mediante `apply_chat_template`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta capacidad multilingüe específica; el idioma de los datasets no se detalla en la información disponible.
- No se documenta modo "thinking", visión, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación sobre "abliteration": el modelo sirve para estudiar experimentalmente cómo afecta la eliminación de direcciones de rechazo al comportamiento de un modelo de 1B y su interacción con el ajuste fino posterior.
- Estudio de cuantización NF4 con ajuste fino: permite analizar la pérdida de calidad que introduce la cuantización de 4 bits cuando los pesos ajustados se guardan directamente en NF4, comparándolo con la versión sin cuantizar.
- Prototipado rápido de asistentes de ciberseguridad en entornos aislados: con 1,5 GB de repositorio y ~1,1B de parámetros, se puede desplegar en una máquina de desarrollo para validar flujos de conversación antes de migrar a un modelo mayor.
- Evaluación de datasets de seguridad ofensiva: útil para inspeccionar cualitativamente qué tipo de respuestas produce un ajuste sobre redsec-security-sft-v1 y cyberstrike-sft-120k, y detectar problemas de calidad o sesgos en esos datos.
- Docencia y demostraciones: su reducido tamaño permite ejecutarlo en portátiles con GPU modesta para ilustrar conceptos de cuantización, LoRA y alineación en clases o talleres.
- Pruebas de pipelines de inferencia: banco de pruebas para validar integraciones con transformers, plantillas de chat y `device_map="auto"` sin consumir recursos de GPU de datacenter.
- Análisis de robustez y alucinación: al ser un modelo pequeño y explícitamente advertido sobre alucinaciones, sirve como caso de estudio de fallos típicos en modelos de 1B ajustados con SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar los pesos ya en 4 bits NF4, el peso del modelo ocupa aproximadamente 0,6-0,7 GB; con overhead de activaciones, KV cache y framework, se estima un consumo total en torno a 1,5-2,5 GB para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3050, RTX 3060, RTX 4060, T4 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: transformers con bitsandbytes (ruta documentada por el autor mediante `AutoModelForCausalLM.from_pretrained` con `device_map="auto"`); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y requeriría conversión adicional de los pesos NF4 a otros formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyLlama-3MPER0RR-4Bit-NF4-Training-Cyber-v1 | 1,1B | no disponible | Apache-2.0 | Hugging Face, 26 descargas | Cuantizado NF4, ajuste en ciberseguridad, experimental |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | Apache-2.0 | Hugging Face, ampliamente adoptado | Modelo base original, sin ajuste de seguridad |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | Hugging Face | Más parámetros y contexto mucho mayor; benchmarks públicos disponibles |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | Hugging Face | Alternativa moderna de tamaño similar con documentación de rendimiento |

La comparación de rendimiento con estas alternativas no es posible con los datos disponibles: este modelo no publica benchmarks, mientras que Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct sí los documentan. La ventaja diferencial del modelo analizado es su especialización declarada en ciberseguridad y su empaquetado en 4 bits listo para usar; sus desventajas son la ausencia de evaluación pública, el contexto presumiblemente corto (heredado del base) y su carácter explícitamente experimental.

## Limitaciones y advertencias

- El autor advierte que el modelo puede generar alucinaciones o información inexacta de forma ocasional y pide verificar las respuestas.
- Está declarado como "solo para investigación y experimentación, no para uso en producción"; esta restricción es explícita en la model card.
- El proceso de "abliteration" elimina deliberadamente mecanismos de rechazo, lo que puede aumentar el riesgo de respuestas dañinas o inapropiadas, especialmente en el dominio de ciberseguridad ofensiva.
- La cuantización NF4 puede degradar la calidad respecto a los pesos en precisión completa; no se documenta ninguna evaluación comparativa.
- No se especifican los idiomas soportados ni la composición lingüística de los datasets de entrenamiento.
- La longitud de contexto no está documentada para esta variante; si hereda los 2048 tokens de TinyLlama-1.1B-Chat-v1.0, resulta insuficiente para tareas con documentos largos.
- El uso comercial está permitido por la licencia Apache-2.0, pero la propia model card desaconseja el uso en producción, lo que supone un caveat relevante de responsabilidad.
- El modelo es un artefacto derivado de terceros (TinyLlama) y el autor original no respalda esta modificación; la atribución de licencias debe mantenerse.
- Con 26 descargas y sin "likes", no existe validación comunitaria ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-4Bit-NF4-Training-Cyber-v1
- Modelo base "abliterated": https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-abliterated
- Modelo base original: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset sahilempire/redsec-security-sft-v1: https://huggingface.co/datasets/sahilempire/redsec-security-sft-v1
- Dataset oyildirim/cyberstrike-sft-120k: https://huggingface.co/datasets/oyildirim/cyberstrike-sft-120k
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
