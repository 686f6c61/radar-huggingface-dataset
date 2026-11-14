# idalabs/IDA-4B-v1.0.2-P4.9-GGUF

## Resumen

IDA 4B v1.0.2 — P4.9 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-4B desarrollado por IDA Labs, orientado al idioma indonesio y publicado como snapshot experimental. El modelo parte de la arquitectura Qwen3 de 4B parámetros (4.022.468.096 parámetros totales) y se ha adaptado mediante QLoRA en precisión 4-bit NF4 sobre un conjunto privado de 548 ejemplos de entrenamiento y 112 de validación, con 2 épocas y 138 pasos de optimizador. El resultado final es un adaptador LoRA fusionado con el modelo base y exportado a formato GGUF en cuantización Q4_K_M.

La relevancia de esta ficha es doble. Por un lado, es uno de los pocos ajustes finos públicos centrados específicamente en indonesio sobre la familia Qwen3, un idioma con cobertura limitada en modelos abiertos. Por otro, el autor documenta de forma inusualmente transparente los fallos conocidos del modelo (errores factuales simples, atribuciones incorrectas, alucinaciones en tareas de redacción), lo que lo convierte en un caso de estudio útil sobre los límites de los ajustes finos pequeños con datasets privados.

El modelo se distribuye bajo licencia Apache 2.0, en un único archivo GGUF de 2,33 GiB (2.497.280.384 bytes) pensado para inferencia local en llama.cpp, LM Studio u Ollama. No está certificado para producción y el propio autor lo etiqueta como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, clase 4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | Indonesio (id), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `IDA-4B-v1.0.2-P4.9-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen3-4B de Qwen Team / Alibaba Cloud. Sobre esa base, IDA Labs aplicó un ajuste fino QLoRA con cuantización 4-bit NF4 del modelo base durante el entrenamiento, 2 épocas completas y 138 pasos de optimizador, sobre un dataset privado de 548 ejemplos de entrenamiento y 112 de validación. La pérdida final de validación registrada fue de 1,5901, calculada a partir de 27 puntos de pérdida de entrenamiento y 7 de validación registrados en los logs de Kaggle. Estos datos son métricas internas de entrenamiento, no benchmarks externos.

El adaptador LoRA resultante se fusionó con el modelo base y se exportó a GGUF Q4_K_M mediante un job de Kaggle (P4.9 R3). El proceso de conversión incluye validación de integridad del archivo (magic GGUF v3, SHA-256) y una prueba de humo de inferencia en CPU con llama.cpp. El autor advierte explícitamente de que la evaluación de calidad se realizó sobre el adaptador P4.9 antes de la conversión a GGUF, no sobre el archivo cuantizado, y que este último solo pasó pruebas de integridad e inferencia, no una evaluación ciega completa independiente.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con foco en identidad y atribución del propio proyecto.
- Seguimiento de instrucciones en tareas cortas y estructuradas (6/7 en la prueba ciega privada del adaptador).
- Respuestas factuales y aritmética simple (5/6 en la misma prueba, con fallos documentados en color del cielo y clasificación de números impares).
- Redacción de borradores (2/4, por debajo del umbral de calidad del 60 % fijado por el proyecto).
- Comportamiento de seguridad y honestidad de acción (3/3), incluyendo rechazo de acciones no verificadas.
- Finalización correcta de secuencias (EOS): 24/24 respuestas completadas frente a 22/24 del Qwen3-4B base en la comparación técnica de inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional en indonesio para prototipos y demos: el ajuste fino está orientado a identidad y conversación en ese idioma, por lo que sirve para validar flujos de chat locales antes de invertir en un modelo mayor.
- Inferencia local en hardware modesto: al ser un GGUF Q4_K_M de 2,33 GiB, cabe en equipos sin GPU dedicada y permite desplegar un chatbot en llama.cpp, LM Studio u Ollama para pruebas de concepto.
- Evaluación de pipelines de fine-tuning: el repositorio documenta pérdidas, pasos, tamaño de dataset y fallos conocidos, lo que lo convierte en un ejemplo reproducible para estudiar QLoRA sobre Qwen3-4B.
- Investigación sobre alucinación y atribución en modelos pequeños: los fallos documentados (color del cielo, clasificación de impares, invención de servicios de outsourcing, suplantación de identidad en un borrador) son un banco de pruebas realista para técnicas de mitigación.
- Generación de borradores internos con revisión humana obligatoria: útil para redactar textos cortos en indonesio siempre que un revisor valide hechos, nombres y afirmaciones corporativas antes de publicar.
- Base para ajustes finos posteriores en indonesio: al estar bajo Apache 2.0 y en formato GGUF, puede servir como punto de partida para experimentos de destilación o corrección de sesgos idiomáticos.
- Pruebas de integración de llama.cpp en CI: el archivo incluye SHA-256 y pruebas de humo documentadas, lo que facilita incorporarlo como caso de test en pipelines de validación de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente una evaluación ciega privada de 24 prompts sobre el adaptador P4.9 antes de la cuantización, puntuada por un asistente de IA y no por un panel humano independiente:

| Categoría | Aprobados / total | Tasa |
|---|---:|---:|
| Identidad y atribución | 4 / 4 | 100 % |
| Seguimiento de instrucciones | 6 / 7 | 85,7 % |
| Hechos y aritmética | 5 / 6 | 83,3 % |
| Redacción | 2 / 4 | 50,0 % |
| Seguridad y honestidad de acción | 3 / 3 | 100 % |
| **Total** | **20 / 24** | **83,3 %** |

Prueba técnica adicional de finalización EOS sobre 24 respuestas de inferencia: Qwen3-4B base 22/24, adaptador P4.9 24/24. El autor aclara que esta métrica no demuestra una mejora semántica sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5–3 GB en Q4_K_M (tamaño del archivo 2,33 GiB más overhead de contexto y KV cache). No se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también es viable en CPU pura, como demuestra la prueba de humo de llama.cpp en CPU documentada por el autor.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`), LM Studio, Ollama y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este archivo.
- Latencia y throughput: no disponibles. El autor solo confirma que la inferencia en CPU con llama.cpp pasa la prueba de humo, sin métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| IDA-4B-v1.0.2-P4.9-GGUF | 4,02 B | No disponible | id, en | Apache 2.0 | GGUF Q4_K_M | Ajuste fino QLoRA experimental, evaluación privada de 24 prompts |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible | Multilingüe | Apache 2.0 | Safetensors, GGUF | Modelo base; sin ajuste específico para indonesio |
| Modelos de 3–4 B orientados a indonesio (p. ej. variantes de Llama o Gemma ajustadas) | ~3–4 B | Variable | id, en | Variable | Safetensors, GGUF | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con alternativas específicas para indonesio no está disponible en la información proporcionada. El propio autor reconoce que el modelo parte de Qwen3-4B y no reclama autoría sobre los pesos base.

## Limitaciones y advertencias

- Lanzamiento experimental, no certificado para producción. El autor recomienda revisar hechos críticos, afirmaciones de identidad y borradores de contenido empresarial antes de su uso.
- La tasa de aprobación del 83,3 % proviene de un conjunto ciego privado de 24 prompts puntuado por un asistente de IA, no por revisión humana independiente ni por un benchmark público reconocido.
- Fallos conocidos documentados: respuesta incorrecta sobre el color del cielo, clasificación errónea de un número impar, invención de que IDA Labs ofrece servicios de outsourcing y suplantación no solicitada del director del proyecto (Ary Wibowo) en un borrador de presentación.
- La categoría de redacción no alcanzó el umbral del 60 % fijado por el proyecto y las afirmaciones falsas de alto riesgo no superaron la puerta de calidad de lanzamiento; el autor publicó igualmente como snapshot experimental.
- La cuantización GGUF no corrige los errores del adaptador; la evaluación de calidad se hizo antes de la conversión.
- El dataset de entrenamiento y las preguntas de la prueba ciega son privados, lo que limita la reproducibilidad externa.
- Cobertura idiomática limitada a indonesio e inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los fallos documentados desaconsejan su uso en producción sin validación adicional.
- No se documenta soporte de tool calling, agentes, visión ni contexto largo; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9-GGUF
- Adaptador LoRA de origen: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Job de exportación GGUF en Kaggle: https://www.kaggle.com/code/imheroeskiller/ida-4b-v1-0-2-p49-gguf-export-r3
- Archivo de sumas SHA-256: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9-GGUF/blob/main/SHA256SUMS
- Metadatos de release: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9-GGUF/blob/main/release.json
- Agregados de pérdida de entrenamiento: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9-GGUF/blob/main/assets/training-loss-aggregates.csv
- Agregados de evaluación: https://huggingface.co/idalabs/IDA-4B-v1.0.2-P4.9-GGUF/blob/main/assets/evaluation-aggregates.json
