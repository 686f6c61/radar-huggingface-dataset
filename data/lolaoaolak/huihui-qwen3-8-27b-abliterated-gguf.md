# Lolaoaolak/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Lolaoaolak en Hugging Face. La abliteración es una técnica que elimina la dirección de activación asociada a las respuestas de rechazo en los transformers, de modo que el modelo deja de negarse a responder ciertas peticiones. El resultado es un modelo "uncensored" orientado a experimentación, no a producción convencional.

El modelo base tiene 27.320.697.856 parámetros (aproximadamente 27B) y pipeline declarado de image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto. La model card menciona soporte de contexto largo (hasta 1M tokens con RoPE scaling yarn), arquitectura con hybrid-attention y variantes cuantizadas ternarias de 2 bits orientadas a ejecución on-device.

La relevancia de esta ficha es doble: por un lado documenta un derivado no oficial de un modelo Qwen de gran tamaño con modificaciones de seguridad eliminadas; por otro, ilustra un ecosistema de cuantizaciones experimentales (ternary, GSQ-RCO, patch-unsloth) que requieren forks específicos de llama.cpp. El repositorio ocupa 865,3 GB y contiene múltiples series de cuantización, lo que lo convierte en un artefacto de investigación más que en un checkpoint listo para despliegue estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con hybrid-attention (según tags de la model card); detalles completos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1.048.576 tokens con RoPE scaling yarn (configuración de ejemplo); contexto original 262.144 |
| Tipos de cuantizacion | BF16, Q8_0, Q8_0_L, Q2_K_L a Q6_K_L, UD-IQ1_S, UD-DW, GSQ-RCO, ternary/2-bit, IQ2-mix |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es un derivado por abliteración de Qwen/Qwen3.8-27B. La técnica aplicada consiste en identificar y restar la dirección de activación responsable de los rechazos, según la implementación de referencia remove-refusals-with-transformers. En este caso, la model card indica que en varias series solo se ablacionan determinadas capas: en la serie UD se ablacionan las capas 17 a 52 (indexación 0-based), mientras que en las series Swift, Ternary, GSQ-RCO y Underdog-Saluki solo se ablacionan las capas 22 a 52. Las primeras 15 capas se mantienen sin ablacionar en la versión inicial, y MTP y el módulo visual no se han modificado.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base. La model card menciona hybrid-attention y kernels ternarios de atención híbrida en el fork PrismML-Eng/llama.cpp, lo que sugiere variantes experimentales con pesos ternarios. También se documenta un mecanismo de patch (patch-unsloth) con 27 pesos añadidos para aplicar la abliteración sobre las cuantizaciones de unsloth/Qwen3.8-27B-GGUF, desde UD-IQ1_S hasta BF16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text).
- Razonamiento y generación de código (heredado del modelo base Qwen3.8-27B; sin benchmarks publicados en esta ficha).
- Soporte de contexto largo: la configuración de ejemplo permite hasta 1.048.576 tokens con RoPE scaling yarn.
- Ejecución on-device mediante cuantizaciones de 2 bits y ternarias.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Abliteración orientada a eliminar rechazos, lo que cambia el comportamiento por defecto frente a peticiones sensibles.
- No se documenta soporte explícito de tool calling ni de agentes en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta a la tasa de rechazos y a la calidad de las respuestas, comparando capas ablacionadas frente a no ablacionadas.
- Experimentación con cuantizaciones extremas: las variantes ternary y de 2 bits permiten evaluar la degradación de calidad en hardware de consumo, usando el fork PrismML-Eng/llama.cpp.
- Despliegue local con contexto largo: la configuración de ejemplo con 1M de contexto y dos RTX 6000 Pro sirve para probar recuperación de información en documentos extensos.
- Análisis multimodal controlado: al conservar el módulo visual sin modificar, se puede evaluar el comportamiento imagen-texto en entornos de investigación.
- Generación de código en pipelines internos: el modelo base Qwen3.8-27B está orientado a tareas de código; esta variante permite probar escenarios sin rechazos en entornos de desarrollo cerrados.
- Pruebas de robustez y red teaming: útil para evaluar filtros de seguridad externos y políticas de moderación en aplicaciones que consuman modelos abliterated.
- Benchmarking de formatos GGUF: el repositorio incluye múltiples series (UD, Swift, Ternary, GSQ-RCO, Underdog-Saluki) para comparar calidad entre métodos de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 27B en BF16 requiere del orden de 54 GB solo para pesos, más caché KV; las variantes de 2 bits y ternarias reducen sustancialmente el requisito, pero no se publican cifras exactas.
- GPU recomendadas: la model card muestra una configuración con 2× RTX 6000 Pro para BF16 con contexto de 1M tokens.
- Cabe en GPU de consumo: no confirmado; las variantes de 2 bits y ternarias están etiquetadas como on-device, pero requieren el fork PrismML-Eng/llama.cpp para los kernels ternarios.
- Opciones de despliegue: llama.cpp/llama-server (con flags --jinja, -fa on, --rope-scaling yarn), fork PrismML-Eng/llama.cpp para variantes ternarias. No se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3B | hasta 1.048.576 (config. yarn) | apache-2.0 | Derivado abliterated, múltiples cuantizaciones GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible en esta ficha | no disponible en esta ficha | Modelo original sin abliterar |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | no disponible | Cuantizaciones estándar, base del patch-unsloth |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | no disponible | Variante ternaria experimental |

## Limitaciones y advertencias

- La abliteración es una técnica cruda y de prueba de concepto; puede degradar capacidades de razonamiento y coherencia.
- Al eliminar rechazos, el modelo puede generar contenido dañino, sesgado o ilegal; no es apto para aplicaciones de cara al público sin moderación externa.
- Solo se ablacionan determinadas capas (17-52 o 22-52 según la serie), por lo que el comportamiento puede ser inconsistente.
- Las variantes ternarias requieren un fork específico de llama.cpp; llama.cpp estándar no las ejecuta.
- El tamaño del repositorio (865,3 GB) y la multitud de series dificultan la selección y verificación de artefactos.
- No hay información sobre idiomas soportados ni sobre sesgos específicos.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta ficha.
- Aunque la licencia declarada es apache-2.0, el uso comercial de un modelo abliterated conlleva riesgos legales y reputacionales que deben evaluarse.
- Los datos de benchmarks y rendimiento no están publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Lolaoaolak/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Variante ternaria: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Swift-1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
