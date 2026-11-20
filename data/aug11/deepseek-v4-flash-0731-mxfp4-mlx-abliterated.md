# aug11/DeepSeek-V4-Flash-0731-MXFP4-MLX-abliterated

## Resumen

DeepSeek-V4-Flash-0731-MXFP4-MLX-abliterated es una variante "abliterated" (con los mecanismos de rechazo suprimidos) del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario aug11. El artefacto combina dos linajes: por un lado, la conversión a formato MLX con cuantización MXFP4 realizada por TensorFold a partir del modelo original de DeepSeek; por otro, la versión abliterated de prem-research, que reescribe únicamente los shards de las capas 17 a 36. El resultado es un modelo de 304.180.418.494 parámetros (aproximadamente 304 mil millones) en formato MLX de 4 bits, pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX.

La relevancia de esta ficha es doble. Primero, documenta un caso poco habitual de "byte transplant": el autor no reentrena ni recalcula pesos, sino que sustituye únicamente los tensores modificados por la ablación dentro del layout MXFP4-MLX, manteniendo el resto del repositorio byte a byte idéntico al modelo base. Segundo, ilustra el ecosistema de derivados de modelos abliterated, que eliminan la conducta de rechazo y por tanto tienen implicaciones directas de seguridad y de cumplimiento que conviene conocer antes de cualquier uso en producción.

El modelo se distribuye con licencia MIT, en safetensors con cuantización de 4 bits (MXFP4 para expertos, MXFP8 para pesos densos), y el repositorio ocupa 167,1 GB. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks de capacidad publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_v4 (según tag del repositorio; detalles internos no disponibles) |
| Parámetros totales | 304.180.418.494 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el autor valida paridad de tokens a 1K y 8K de contexto) |
| Tipos de cuantización | MXFP4 (expertos, fp4 e2m1), MXFP8 (pesos densos, fp8 e4m3), 4-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout MLX, librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base declarado es DeepSeek-V4-Flash-0731, del que no se proporcionan detalles de arquitectura interna en la información disponible (más allá del tag `deepseek_v4`). El artefacto de este repositorio no entrena nada: es un transplante de bytes. TensorFold convirtió el modelo original a MLX almacenando los pesos de expertos en fp4 e2m1 como MXFP4 con los mismos bytes, los pesos densos en fp8 e4m3 como MXFP8 con los mismos bytes, y replicando cada escala de bloque de 128x128 por grupo de 32. Sobre ese layout, aug11 sustituye únicamente los tensores modificados por la ablación de prem-research.

La ablación (método ARA, según la model card de prem-research) afecta a `attn.wo_b`, `ffn.shared_experts.w2` y los `ffn.experts.E.w2` listados, en las capas 17 a 36. El proceso de fusión verificó que 320 de 31.450 tensores difieren del base y que los 31.130 restantes son byte-idénticos; los 320 tensores modificados se escribieron in situ en 15 shards sin alterar cabeceras, offsets, formas ni dtypes. La comprobación numérica reportada es una desviación absoluta máxima de 0.0 al dequantizar cada módulo modificado con `mx.dequantize` frente a la fuente fp8/fp4. El script de fusión es `scripts/lab/dsv4/dsv4_abliterated_splice.py`, ejecutado por `scripts/lab/ablit-perf/job-dsv4-abliterated.sh` en el repositorio MacProvider.

## Capacidades

- Generación de texto: pipeline declarado `text-generation`; el modelo es un modelo de lenguaje de gran escala (304 mil millones de parámetros).
- Razonamiento y conocimiento general: capacidades heredadas del modelo base DeepSeek-V4-Flash-0731; no se detallan en la información disponible.
- Código y matemáticas: no hay información específica publicada en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; el repositorio no declara idiomas.
- Modo "thinking": no disponible.
- Visión o audio: no disponible.
- Conducta sin rechazo: la ablación elimina la negativa a responder; el autor reporta 0 rechazos de 20 prompts dañinos y 0 de 20 prompts inocuos, frente a 20 de 20 rechazos en el modelo base.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto de estudio para analizar cómo la ablación de direcciones de rechazo afecta a la conducta del modelo, comparando respuestas frente al base con las mismas semillas y prompts.
- Evaluación de técnicas de edición de pesos: dado que la fusión preserva byte a byte el 99% de los tensores, es un caso de referencia para validar pipelines de transplante de bytes y verificar que las herramientas de dequantización reproducen exactamente los pesos fuente.
- Despliegue local en Apple Silicon: el formato MLX y la cuantización MXFP4 permiten ejecutar un modelo de 304 mil millones de parámetros en hardware Apple con memoria unificada, algo inviable en fp16 en la mayoría de estaciones de trabajo.
- Pruebas de paridad de motores de inferencia: el autor valida la paridad de tokens de su motor nativo frente a la implementación de referencia de DeepSeek a 1K y 8K de contexto (16 primeros tokens top-1 exactos y al menos 240 de 256 tokens greedy iguales), lo que lo convierte en un banco de pruebas para motores MLX.
- Generación de texto creativo sin filtros editoriales: para flujos donde el equipo asume la revisión posterior del contenido y necesita que el modelo no introduzca negativas automáticas; requiere revisión humana obligatoria.
- Prototipado de asistentes conversacionales con contexto de hasta 8K tokens verificados: útil para probar integraciones de chat en local antes de decidir el despliegue definitivo en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta dos puertas de validación de laboratorio:

| Comprobación | Resultado |
|---|---|
| Paridad de tokens a 1K de contexto | 16 primeros top-1 exactos; ≥240 de 256 greedy iguales |
| Paridad de tokens a 8K de contexto | 16 primeros top-1 exactos; ≥240 de 256 greedy iguales |
| Rechazo en prompts dañinos (greedy, clases de palabras clave) | 0 de 20 (base: 20 de 20) |
| Rechazo en prompts inocuos | 0 de 20 |
| Error absoluto máximo tras dequantización de módulos modificados | 0.0 |

El propio autor advierte que estas son comprobaciones de sanidad de laboratorio, no una evaluación de capacidad ni de seguridad.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 167,1 GB en cuantización de 4 bits; se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead de ejecución (KV cache y buffers), por lo que en la práctica conviene disponer de 192 GB o más.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon; no se documenta soporte para CUDA. Para hardware NVIDIA habría que recurrir a otras conversiones del modelo base no incluidas en este repositorio.
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamaño del artefacto. En Apple Silicon requiere equipos con memoria unificada muy alta (gama Mac Studio / Mac Pro con 192 GB o más).
- Opciones de despliegue: librería MLX y el motor nativo de MacProvider citado por el autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| aug11/DeepSeek-V4-Flash-0731-MXFP4-MLX-abliterated | 304,2 B | no disponible | MXFP4/MXFP8 (4-bit) | MIT | safetensors MLX | Abliterated; 0/20 rechazos |
| TensorFold/DeepSeek-V4-Flash-0731-MXFP4-MLX | no disponible (mismo base) | no disponible | MXFP4/MXFP8 (4-bit) | MIT | safetensors MLX | Base de la conversión; sin ablación |
| prem-research/DeepSeek-V4-Flash-0731-abliterated | no disponible (mismo base) | no disponible | formato original | MIT | safetensors | Fuente de la ablación (capas 17-36) |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | no disponible | original | MIT | safetensors | Modelo original de DeepSeek |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responde a prompts dañinos que el base rechaza (0 de 20 frente a 20 de 20). No debe desplegarse en aplicaciones orientadas al público sin capas de moderación externas.
- Sin evaluación de seguridad: el autor declara explícitamente que las comprobaciones realizadas son de sanidad de laboratorio y no una evaluación de capacidad ni de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje de esta escala.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud máxima de contexto; la validación de paridad solo cubre 1K y 8K.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- Naturaleza del artefacto: es un transplante de bytes sobre una conversión de cuantización; no se han publicado evaluaciones de degradación por cuantización más allá de la comprobación de error 0.0 en los módulos modificados.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon y a las herramientas compatibles; no hay evidencia de soporte en vLLM, llama.cpp u otros motores.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aug11/DeepSeek-V4-Flash-0731-MXFP4-MLX-abliterated
- Modelo base de conversión: https://huggingface.co/TensorFold/DeepSeek-V4-Flash-0731-MXFP4-MLX
- Fuente de la ablación: https://huggingface.co/prem-research/DeepSeek-V4-Flash-0731-abliterated
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
