# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF

## Resumen
Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes es un modelo de lenguaje multimodal basado en la arquitectura MoE de Qwen3.6, desarrollado por el investigador LuffyTheFox. El proyecto aborda la degradación progresiva del rendimiento en LLM mediante una técnica de posentrenamiento no supervisada llamada Genesis, que recalibra los tensores de pesos para reducir ruido numérico y estabilizar la señal sin realizar backpropagation. Al integrar datos del conjunto Hermes y eliminar filtros de seguridad, el modelo se posiciona como una alternativa de alto rendimiento para entornos de desarrollo, investigación y despliegues locales donde se requiere capacidad de razonamiento, codificación y procesamiento de imágenes sin restricciones predefinidas. Su diseño optimizado para inferencia eficiente en hardware de gama media-alta lo hace relevante para pipelines de agentes y automatización técnica.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), pipeline image-text-to-text |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3.300.000.000 (~3,3B, inferido de nomenclatura oficial A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q2_K a Q8_0, soporte APEX quant, K/V cache F16) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo se basa en Qwen3.6-35B-A3B-Uncensored, una variante sin filtros de seguridad que emplea una arquitectura MoE con expertos FFN distribuidos. El autor aplica el algoritmo Genesis, un proceso de posentrenamiento basado en cirugía numérica sobre los archivos GGUF. Este procedimiento escanea tensores `ssm_conv1d` y bloques FFN para corregir desajustes de escala, pesos saturados y bloques nulos, utilizando la distribución de Marchenko-Pastur y SVD personalizado para preservar el 99 % de la señal aprendida mientras se reduce el ruido de entrenamiento. Posteriormente, se transfieren aproximadamente 2.000 bloques de pesos de un fine-tuning sobre el dataset Hermes (NousResearch/hermes-function-calling-v1) al modelo base, conservando la estructura original. No se realiza RLHF ni fine-tuning tradicional; la calibración es puramente estadística y se ejecuta en hardware limitado (Tesla T4).

## Capacidades
- Generación de texto y razonamiento lógico optimizado para tareas técnicas y codificación.
- Soporte nativo de tool/function calling mediante la identidad Hermes y plantillas de chat configuradas.
- Capacidad multimodal image-text-to-text (procesamiento de imágenes y texto).
- Modo "thinking" para razonamiento paso a paso en programación y resolución de problemas.
- Ejecución de agentes multi-step con offload dinámico de expertos a CPU/GPU.
- Soporte multilingüe (inglés y chino como primarios, con capacidad genérica en otros idiomas).
- Operación uncensored sin filtros de seguridad predefinidos, permitiendo respuestas directas.

## Casos de uso
- Desarrollo de agentes de programación autónomos: el modelo integra function calling y un modo thinking configurado con parámetros específicos (temperature=0.6, top_p=0.95), lo que permite generar, depurar y ejecutar código en bucles de retroalimentación sin bloqueos por políticas de seguridad.
- Análisis multimodal en entornos locales: gracias a su pipeline image-text-to-text y compatibilidad GGUF, puede desplegarse en workstations para extraer información técnica de diagramas o capturas de pantalla sin depender de APIs externas.
- Simulación y testing de sistemas de recomendación o lógica compleja: la arquitectura MoE y la reducción de ruido mediante Genesis mejoran la coherencia en respuestas multi-turno, útil para validar flujos de decisión en entornos de prueba controlados.
- Asistencia técnica y documentación generativa: la capacidad multilingüe y la estabilidad de la señal permiten generar manuales, traducciones técnicas o respuestas a tickets de soporte con baja tasa de alucinación cuando se guía con prompts estructurados.
- Investigación en calibración de pesos y post-training: el uso del algoritmo Genesis y la transparencia en la transferencia de bloques FFN lo convierten en un caso de estudio para replicar técnicas de manipulación numérica en modelos abiertos.
- Despliegue en infraestructura edge o mid-range: al estar cuantizado en GGUF y permitir forzar 40 capas a CPU, se adapta a servidores con VRAM limitada (16-24 GB) para ejecutar inferencias de agente sin necesidad de clusters A100/H100.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la documentación disponible. El autor enfatiza mejoras subjetivas en coherencia, claridad de contexto y reducción de alucinaciones tras la aplicación de Genesis, pero no se proporcionan métricas cuantitativas comparativas.

## Requisitos de hardware
- VRAM estimada para inferencia: ~10-12 GB (Q2_K), ~18-20 GB (Q4_K_M), ~35-40 GB (Q8_0).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para cuantizaciones Q4/Q5, NVIDIA A100/H100 para versiones de mayor precisión o batch size elevado.
- Compatibilidad con GPU consumer: Sí, cabe en tarjetas de 24 GB (RTX 4090/5090) con cuantización Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), Text Generation Inference (TGI) vía conversión, o scripts personalizados con Unsloth/ExLlamaV2.
- Latencia y throughput estimados: no disponibles. La configuración recomendada fuerza 40 capas a CPU y activa 8 expertos, lo que puede introducir overhead de transferencia PCIe; se recomienda monitorizar throughput en entornos reales.

## Comparativa con modelos similares
| Modelo | Arquitectura | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes | MoE, image-text-to-text | ~34,66B | no disponible | Apache 2.0 | GGUF, HuggingFace |
| Qwen2.5-32B-Instruct (base) | Dense Transformer | ~32B | 128K | Apache 2.0 | GGUF, Safetensors, HuggingFace |
| Qwen3-32B-A3B (oficial) | MoE, image-text-to-text | ~34,66B | 131K (estimado) | Apache 2.0 | GGUF, Safetensors, HuggingFace |
| Hermes-2.5-72B (Mistral fine-tune) | Dense Transformer | ~72B | 8K-32K | Apache 2.0 | GGUF, Safetensors, HuggingFace |

## Limitaciones y advertencias
- El modelo carece de filtros de seguridad (uncensored), lo que implica riesgo elevado de generar contenido sesgado, ofensivo o no verificado sin supervisión humana.
- La técnica Genesis no ha sido validada por revisión por pares; su impacto en la estabilidad a largo plazo o en dominios especializados podría variar.
- La ventana de contexto no está especificada, lo que limita su fiabilidad en documentos extensos o conversaciones muy largas.
- Las capacidades multimodales dependen de la implementación del base model; la calidad de interpretación visual no está cuantificada.
- La transferencia de solo ~2.000 bloques FFN puede restringir la capacidad de function calling en comparación con fine-tunings completos sobre el dataset Hermes.
- El uso comercial está permitido por la licencia Apache 2.0, pero se recomienda auditar los outputs para cumplimiento normativo en entornos regulados.

## Enlaces
- HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF
- Base model: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Hermes finetune referencia: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Script de cuantización: https://pastebin.com/hXhcMJn9
- Plantilla de chat: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
