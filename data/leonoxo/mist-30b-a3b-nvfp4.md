# leonoxo/MiST-30B-A3B-NVFP4

## Resumen

MiST-30B-A3B-NVFP4 es un checkpoint publicado en Hugging Face por el usuario leonoxo bajo licencia Apache 2.0. Por la nomenclatura del identificador (30B de parámetros totales, 3B activos y sufijo NVFP4) se trata de una cuantización en formato FP4 de NVIDIA aplicada a un modelo de arquitectura Mixture of Experts (MoE) de aproximadamente 30 mil millones de parámetros totales con unos 3 mil millones activos por token. No se dispone de información adicional sobre el modelo base, el proceso de cuantización ni los datos de entrenamiento.

La model card publicada es prácticamente vacía: únicamente contiene la declaración de licencia Apache 2.0, sin descripción, sin especificaciones, sin benchmarks ni instrucciones de uso. El repositorio registra cero descargas y cero likes en el momento de la consulta, y su fecha de creación y actualización es la misma (2026-11-07), lo que sugiere una publicación reciente y sin validación por parte de la comunidad.

Su relevancia potencial radica en el formato NVFP4, la cuantización de 4 bits nativa de las GPU Blackwell de NVIDIA, que permite reducir el footprint de memoria de un modelo MoE de 30B hasta aproximadamente 15-18 GB y ejecutarlo con mayor throughput en hardware de la generación RTX 50xx o B200. No obstante, al no existir documentación técnica ni resultados publicados, cualquier evaluación de calidad debe considerarse pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), inferida del identificador "A3B"; detalles no disponibles |
| Parámetros totales | 30B (inferido del identificador) |
| Parámetros activos | 3B (inferido del identificador) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (presumiblemente safetensors con cuantización FP4); no confirmado en la model card |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento. El identificador "30B-A3B" sigue la convención habitual para modelos MoE con 30B parámetros totales y 3B activos por token, similar a la nomenclatura empleada por Qwen3-30B-A3B o Nemotron-3.5-Lightning-30B-A3B. El sufijo "NVFP4" indica una cuantización post-entrenamiento al formato FP4 de NVIDIA, que emplea bloques de escala de grano fino para preservar la precisión en pesos y activaciones.

Se desconoce el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF/DPO o cualquier innovación técnica (atención lineal, decodificación especulativa, etc.). Tampoco se documenta el modelo base original sobre el que se aplicó la cuantización, lo que impide trazar su procedencia.

## Capacidades

- Generación de texto: presumible, aunque no documentada.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Eficiencia de inferencia: el formato NVFP4 está diseñado para maximizar throughput en GPU Blackwell, con kernels de cuantización por bloques.

## Casos de uso

- Despliegue de bajo coste en GPU Blackwell: el formato NVFP4 permite ejecutar un MoE de 30B en GPUs consumer de la serie RTX 50xx con memoria suficiente, reduciendo el coste por token frente a FP16.
- Servicio de inferencia de alto throughput: al activar solo 3B parámetros por token, el modelo puede atender múltiples peticiones concurrentes en un único nodo, adecuado para APIs de chat a escala media.
- Experimentación con cuantización FP4: útil para investigadores que evalúan la degradación de calidad de NVFP4 frente a FP8/FP16 en modelos MoE.
- Prototipado de asistentes conversacionales: siempre que se valide previamente la calidad del checkpoint, puede servir como base para demos internas.
- Fine-tuning con QLoRA sobre FP4: si el ecosistema de herramientas lo soporta, permite adaptar el modelo con requisitos de memoria reducidos.
- Evaluación comparativa de checkpoints comunitarios: sirve como referencia para estudiar la reproducibilidad y calidad de cuantizaciones no oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-18 GB en NVFP4 para los pesos (30B parámetros a 4 bits más escalas), más overhead de KV cache y activaciones.
- GPU recomendadas: NVIDIA B200, RTX 5090, RTX 5080, RTX 5070 Ti y GPUs Blackwell con soporte nativo de NVFP4; en GPUs Hopper o Ampere requeriría emulación o de-cuantización, con pérdida de rendimiento.
- Cabe en GPU consumer: sí, previsiblemente en RTX 5090 (32 GB) y RTX 5080 (16 GB) con margen ajustado; en RTX 5070 Ti (16 GB) el contexto disponible sería limitado.
- Opciones de despliegue: TensorRT-LLM y vLLM con soporte NVFP4 son las vías esperadas; llama.cpp y Ollama no soportan NVFP4 de forma nativa, por lo que requerirían conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiST-30B-A3B-NVFP4 | 30B / 3B (inferido) | no disponible | Apache 2.0 | NVFP4 | Hugging Face (0 descargas) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B / 3B (inferido) | no disponible | no disponible | NVFP4 | Hugging Face |
| Mistral Large 4 (Le Chonk) | 1,05T / 49B | 1M tokens | no disponible | no disponible | Vista previa pública |

La comparación con Nemotron-3.5-Lightning-30B-A3B-NVFP4 es la más directa por coincidir en tamaño, número de parámetros activos y formato de cuantización; no obstante, no se dispone de datos de rendimiento de ninguno de los dos. Mistral Large 4 pertenece a otra escala (1,05T totales) y no es comparable en requisitos de hardware.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe el modelo base, el proceso de cuantización ni las capacidades, lo que impide validar su comportamiento.
- Procedencia no verificada: no se indica qué modelo original se cuantizó, por lo que no se puede confirmar la calidad ni la integridad de los pesos.
- Cero adopción comunitaria: sin descargas ni likes, no hay evidencia de que el checkpoint haya sido probado por terceros.
- Riesgo de degradación por cuantización: NVFP4 introduce pérdida de precisión; sin benchmarks publicados no se puede cuantificar el impacto en razonamiento, código o matemáticas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinación: no evaluado.
- Limitaciones de idioma: no documentadas; no se puede asumir soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre la calidad y legalidad de los pesos publicados por un tercero no verificado.
- Compatibilidad de hardware restringida: NVFP4 requiere GPU Blackwell o herramientas de conversión; no es un formato portable a hardware anterior sin de-cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/leonoxo/MiST-30B-A3B-NVFP4
- NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (referencia de formato similar): https://huggingface.co/lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Mistral Large 4 (Le Chonk), anuncio: https://www.marktechpost.com/2026/10/06/mistral-ai-releases-mistral-large-4-le-chonk-a-1-05t-parameter-open-weight-multimodal-moe/
