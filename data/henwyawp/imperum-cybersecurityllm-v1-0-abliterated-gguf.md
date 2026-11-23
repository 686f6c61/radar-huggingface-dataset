# HenwyAwp/Imperum-CybersecurityLLM-v1.0-abliterated-GGUF

## Resumen

Imperum-CybersecurityLLM-v1.0-abliterated-GGUF es una versión "abliterated" (con la dirección de rechazo eliminada de los pesos) del modelo IMPERUM/Imperum-CybersecurityLLM-v1.0, un fine-tune especializado en ciberseguridad construido sobre Qwen3.6-35B-A3B. Lo publica el usuario HenwyAwp en Hugging Face bajo licencia Apache-2.0, y su única modificación respecto al original es la eliminación del mecanismo de rechazo, de modo que el modelo responde en lugar de negarse ante peticiones que el original bloquearía. El resto de pesos permanece inalterado, salvo los 84 tensores editados de los 733 totales.

El modelo base es un transformer híbrido con arquitectura MoE (mixture of experts) de 40 capas, 256 expertos enrutados con 8 activos por token y atención lineal híbrida. Se distribuye únicamente en formato GGUF con cuantización Q4_K_M (21,2 GB) y requiere una build de llama.cpp con soporte para `qwen35moe`.

Su relevancia es doble: por un lado, demuestra una técnica de edición de pesos directamente sobre un fichero GGUF cuantizado (ortogonalización de la dirección de rechazo según Arditi et al., 2024); por otro, plantea de forma explícita el debate sobre modelos sin salvaguardas orientados a investigación en ciberseguridad, con las implicaciones legales y éticas que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal (Qwen3.6-35B-A3B) |
| Parametros totales | 35B (según nombre del modelo base) |
| Parametros activos | 3B (según nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Capas | 40 (edición aplicada en capas 12-39) |
| Expertos | 256 enrutados, 8 activos por token |
| Tamaño del fichero | 21,2 GB |
| Tensores modificados | 84 de 733 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.6-35B-A3B: un transformer de 40 capas con mezcla de expertos (256 expertos enrutados, 8 activos por token) y atención lineal híbrida. El fine-tune original de IMPERUM está orientado a ciberseguridad, aunque la model card no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO.

La modificación de esta versión es puramente de pesos y no de entrenamiento. Se aplica ortogonalización de la dirección de rechazo (Arditi et al., 2024) directamente sobre el GGUF: se calcula la dirección como la media del residual stream en el último token del prompt, usando 256 prompts dañinos (AdvBench) menos 256 prompts inocuos (Alpaca), leídos del propio forward pass de llama.cpp en la salida de la capa 15. Después se aplica la edición `W ← W − 1.5 · r rᵀ W` en todos los tensores que escriben al residual stream en las capas 12-39 (salida de atención y atención lineal, down projection de los 256 expertos enrutados y del experto compartido). Las capas 0-11 y los embeddings quedan intactos. Cada tensor editado se dequantizó, se editó y se recuantizó a su tipo original; el resto de tensores son idénticos byte a byte al Q4_K_M oficial. La capa, banda y fuerza se seleccionaron mediante una búsqueda de 20 ensayos sobre prompts de tuning separados (rechazos + 2× KL).

## Capacidades

- Generación de texto con orientación a contenido de ciberseguridad (heredada del fine-tune original).
- Respuesta sin rechazos ante peticiones que el modelo original bloquearía (89 de 100 prompts dañinos respondidos en evaluación).
- Razonamiento y generación en modo "thinking off" durante la evaluación (64 tokens de respuesta).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: el modelo permite estudiar empíricamente el efecto de la abliteración sobre la tasa de rechazo (98/100 a 7/100) y su coste en divergencia KL (0.033), útil para trabajos sobre alineación y edición de pesos.
- Análisis de malware y ingeniería inversa defensiva: un equipo de respuesta a incidentes puede pedir explicaciones de técnicas de ofuscación o de comportamiento de muestras en un entorno controlado, aprovechando la orientación a ciberseguridad del fine-tune.
- Red teaming autorizado: permite generar hipótesis de ataque y payloads de prueba sin que el modelo se niegue, dentro de ejercicios de pentesting con alcance definido por contrato.
- Formación y concienciación: generación de ejemplos realistas de phishing, ingeniería social o vectores de ataque para materiales didácticos internos, con la ventaja de que el modelo no bloquea la petición.
- Automatización de tareas de threat intelligence: resumen y clasificación de informes de vulnerabilidades, CVEs o IOCs en pipelines internos, gracias a la especialización del fine-tune original.
- Evaluación comparativa de salvaguardas: servir como referencia "sin censura" frente al modelo oficial para medir la eficacia de filtros externos (guardrails) en producción.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q4_K_M de 21,2 GB, puede ejecutarse en llama.cpp en equipos con suficiente memoria, sin dependencia de APIs externas.

## Benchmarks y rendimiento

| Medida | Q4_K_M oficial | Este fichero |
|---|---|---|
| Rechazos en 100 prompts dañinos | 98 | 7 |
| Deflexiones (reformulación, alternativas seguras) | 1 | 4 |
| Cumplimiento | 1 | 89 |
| Rechazos en 30 prompts inocuos | 0 | 0 |
| Divergencia KL (primer token de respuesta, 64 prompts inocuos) | — | 0.033 |
| Mismo primer token top que el fichero oficial | — | 92 % |

Notas: la clasificación refused/deflected/complied se basa en reglas de rúbrica, no en revisión humana; una comprobación de rechazo solo por palabras clave da 10/100. La misma edición aplicada como adaptador LoRA de llama.cpp sobre el fichero oficial (sin recuantización) rechazó 3/100 con KL 0.031; la recuantización de los tensores Q4_K editados reintroduce aproximadamente un 12 % de la dirección eliminada como ruido de redondeo. No se han publicado resultados de benchmarks de ciberseguridad (CyberMetric, CTIBench) para este fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,2 GB para el fichero Q4_K_M, más overhead de contexto KV; con contexto largo la huella puede superar los 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, RTX 3090/4090 (24 GB) puede quedar justo y requerir offload parcial a CPU.
- Cabe en consumer GPU: sí, en RTX 3090/4090 con contexto moderado y posible offload; en GPUs de 16 GB o menos requiere offload significativo a RAM del sistema.
- Opciones de despliegue: llama.cpp y cualquier proyecto construido sobre él (LM Studio, Ollama si actualiza a una build con `qwen35moe`, servidores compatibles con llama.cpp). Es imprescindible una build con soporte para `qwen35moe`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Imperum-CybersecurityLLM-v1.0-abliterated (este) | 35B totales / 3B activos | no disponible | Apache-2.0 | GGUF Q4_K_M | Sin rechazos, especializado en ciberseguridad |
| IMPERUM/Imperum-CybersecurityLLM-v1.0 | 35B totales / 3B activos | no disponible | Apache-2.0 | GGUF | Versión oficial con salvaguardas (98/100 rechazos) |
| Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | no disponible | no disponible | Modelo generalista de referencia de la familia Qwen |

## Limitaciones y advertencias

- Los rechazos de seguridad están eliminados: el modelo ayudará con peticiones dañinas. La responsabilidad de uso recae íntegramente en el usuario.
- La evaluación se limita a respuestas cortas (64 tokens); las respuestas largas pueden seguir incluyendo advertencias o reformulaciones.
- No se han reejecutado benchmarks de ciberseguridad (CyberMetric, CTIBench) sobre este fichero, por lo que se desconoce su rendimiento real en tareas del dominio.
- La clasificación de rechazos se basa en reglas de rúbrica, no en revisión humana; una comprobación solo por palabras clave arroja 10/100, lo que indica cierta fragilidad de la métrica.
- La recuantización introduce ruido: aproximadamente un 12 % de la dirección de rechazo reaparece, lo que explica parte de los 7 rechazos residuales.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en detalles técnicos de exploits o CVEs.
- Licencia Apache-2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas en producción puede incumplir normativas sectoriales o políticas internas de seguridad.
- Idiomas soportados no documentados; se desconoce el comportamiento en castellano u otras lenguas distintas del inglés.
- Longitud de contexto no documentada; planificar el despliegue sin asumir la ventana nativa de Qwen3.6.
- Requiere una build específica de llama.cpp con soporte `qwen35moe`; no funcionará en versiones antiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HenwyAwp/Imperum-CybersecurityLLM-v1.0-abliterated-GGUF
- Modelo base: https://huggingface.co/IMPERUM/Imperum-CybersecurityLLM-v1.0-GGUF
- Paper de referencia del método (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- llama.cpp: https://github.com/ggml-org/llama.cpp
