# SargeDev/Arete-27B-Uncensored-NVFP4-FP8

## Resumen

Arete-27B-Uncensored-NVFP4-FP8 es una variante cuantizada y "abliterated" (sin mecanismos de rechazo) del modelo NousResearch/Arete-27B, que a su vez es un ajuste fino supervisado (SFT) de parámetros completos de Qwen3.8-27B orientado a alineamiento de valores. El autor, SargeDev, aplica una ablación de la dirección de rechazo sobre 15 capas del transformer y publica el resultado en formato NVFP4 W4A4 con down_proj en FP8 dinámico, empaquetado con compressed-tensors.

El modelo resuelve un nicho concreto: permitir inferencia de un modelo de 27B (21.171.101.568 parámetros reales según safetensors) en GPUs con memoria limitada mediante cuantización de 4 bits en pesos y activaciones, manteniendo la cabeza de decodificación especulativa (MTP/nextn) del Qwen3.8 original. La relevancia actual radica en que combina tres tendencias: cuantización NVFP4 para hardware Blackwell, eliminación de rechazos vía OBLITERATUS y preservación de decodificación especulativa tras la edición de pesos.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no se dispone de información sobre composición del dataset de entrenamiento, benchmarks estandarizados ni evaluación independiente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8), con cabeza MTP/nextn para decodificación especulativa |
| Parámetros totales | 21.171.101.568 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 W4A4 + FP8_DYNAMIC en down_proj (compressed-tensors); 8-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.8, en su variante de 27B, sobre el que NousResearch realizó un SFT de parámetros completos (full-parameter SFT) orientado a alineamiento de valores, dando lugar a Arete-27B. SargeDev aplica después una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS con el método `aggressive`, en precisión bf16, usando un conjunto de contraste de 842 prompts de daño/inocuidad. La edición afecta a 15 capas consideradas "fuertes" (las 59-63 son las más intensas según la model card).

Tras la ablación se midieron compuertas de calidad: coherencia 1.0, divergencia KL de 0.90 frente al modelo base, y perplejidad que sube de 3.22 a 3.93 (incremento calificado de modesto por el autor). La suite de capacidades se reporta intacta. Los tensores del drafter MTP/nextn se preservan con la cabeza estándar de Qwen3.8, de modo que la decodificación especulativa sigue funcionando. La cuantización final es NVFP4 W4A4 con down_proj en FP8 dinámico, empaquetada con compressed-tensors. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original de Arete ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del backbone Qwen3.8-27B.
- Cumplimiento de peticiones sin rechazo: la model card reporta 15/15 en una batería de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) en bf16.
- Decodificación especulativa funcional gracias a la preservación de los tensores MTP/nextn.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado explícitamente.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades de visión o audio: no disponibles en esta variante (existe una variante VL separada del mismo autor, JEV-27B-VL-Uncensored-NVFP4, que no es este modelo).

## Casos de uso

- Red teaming y auditoría de seguridad: el modelo entrega respuestas completas ante prompts de explotación, malware o DoS, lo que permite a equipos de seguridad generar casos de prueba adversarios y evaluar defensas sin bloqueos del propio modelo.
- Investigación sobre alineamiento y rechazo: al ser una ablación documentada con métricas de KL y perplejidad frente al base, sirve para estudiar el efecto de eliminar la dirección de rechazo sobre coherencia y capacidades.
- Generación de contenido sin filtros en entornos controlados: escritura creativa o escenarios de ficción que el modelo base rechazaría, con la advertencia de que la licencia Apache 2.0 no exime de responsabilidad legal sobre el uso.
- Inferencia en GPUs de gama alta con memoria limitada: la cuantización NVFP4 W4A4 reduce el peso a 29,3 GB de repositorio, permitiendo desplegar un 27B en hardware Blackwell de 24-48 GB según configuración.
- Evaluación comparativa de cuantizaciones: el autor referencia variantes GGUF/EXL3/NVFP4 de la comunidad que puntúan 14-15/15 en la batería de cumplimiento, lo que permite estudiar la degradación inducida por cuantización en modelos abliterated.
- Experimentación con decodificación especulativa: al conservar la cabeza MTP/nextn, es útil para medir el impacto de la cuantización NVFP4 en el acceptance rate del drafter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta métricas internas de la edición:

| Métrica | Valor reportado |
|---|---|
| Coherencia (gate interno) | 1.0 |
| Divergencia KL vs. base | 0.90 |
| Perplejidad antes / después | 3.22 → 3.93 |
| Batería de cumplimiento (bf16) | 15/15 |
| Batería de cumplimiento (quants comunidad GGUF/EXL3/NVFP4) | 14-15/15 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 29,3 GB; con overhead de activaciones y caché KV, se recomienda al menos 32-40 GB para contexto moderado.
- GPU recomendadas: hardware con soporte nativo de NVFP4 (familia Blackwell, p. ej. B200, RTX 5090) para aprovechar la cuantización; en GPUs Hopper o Ada la ruta NVFP4 puede requerir emulación o no estar soportada por el runtime.
- Cabe en GPU de consumo: previsiblemente en RTX 5090 (32 GB) si el runtime soporta NVFP4; en RTX 4090 (24 GB) el margen es insuficiente para el peso completo más caché KV.
- Opciones de despliegue: compressed-tensors es compatible con vLLM y TGI en versiones recientes; llama.cpp/Ollama no soportan NVFP4 de forma nativa, por lo que requerirían una variante GGUF (no incluida en este repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| SargeDev/Arete-27B-Uncensored-NVFP4-FP8 | 21,17B | No disponible | NVFP4 W4A4 + FP8 | Apache 2.0 | Objeto de esta ficha |
| NousResearch/Arete-27B | No disponible | No disponible | bf16 | No disponible | Base alineada sin ablación |
| SargeDev/JEV-27B-Uncensored-NVFP4 | No disponible | No disponible | NVFP4 + FP8 | No disponible | Abliterado sobre Qwen3.8-27B con bloque de decisión AutoTrust |
| SargeDev/JEV-27B-VL-Uncensored-NVFP4 | No disponible | No disponible | NVFP4 (texto) + bf16 (visión) | No disponible | Variante multimodal del anterior |

## Limitaciones y advertencias

- La ablación de rechazo elimina salvaguardas: el modelo entregará contenido dañino (exploits, malware, DoS) según la propia model card. No es apto para despliegue orientado al público sin capas de filtrado externas.
- La perplejidad sube de 3.22 a 3.93 tras la edición, lo que indica una degradación medible en la modelización del lenguaje, aunque el autor la califica de modesta.
- No hay evaluación independiente ni benchmarks públicos; las métricas de calidad y cumplimiento son autoinformadas por el autor.
- Sesgos conocidos: no documentados. Al derivar de Qwen3.8 sin etapas de mitigación adicionales tras la ablación, es previsible que herede los sesgos del backbone, pero no hay medición publicada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no documentados; la cobertura multilingüe del backbone Qwen3.8 no se traslada necesariamente con la misma calidad tras la ablación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la licencia no transfiere responsabilidad legal al autor.
- Compatibilidad de hardware: NVFP4 requiere soporte de runtime y GPU; en hardware anterior a Blackwell el despliegue puede no ser viable sin reconvertir a otro formato.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación comunitaria de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-NVFP4-FP8
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante relacionada JEV-27B-Uncensored-NVFP4: https://huggingface.co/SargeDev/JEV-27B-Uncensored-NVFP4
- Variante relacionada JEV-27B-VL-Uncensored-NVFP4: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored-NVFP4
