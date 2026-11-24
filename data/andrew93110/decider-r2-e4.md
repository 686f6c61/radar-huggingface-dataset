# Andrew93110/decider-r2-e4

## Resumen

decider-r2-e4 es un modelo de lenguaje publicado en Hugging Face por el usuario Andrew93110 bajo licencia Apache 2.0. El repositorio contiene pesos en formato safetensors con un total de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), lo que sitúa al modelo en la categoría de modelos densos de gran tamano, comparable en escala a familias como Gemma 2 27B o Qwen 2.5 32B. El tag `gemma4` sugiere que el modelo deriva de la arquitectura Gemma, aunque no se dispone de documentación oficial que confirme la relación exacta con dicha familia.

El modelo se distribuye con acceso restringido (gated), por lo que es necesario aceptar condiciones adicionales en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 62,6 GB, un tamano coherente con pesos en precisión de 16 bits para 31,3 mil millones de parámetros. No se han publicado datos sobre el pipeline de inferencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento.

La relevancia de este modelo es limitada por la ausencia de documentación técnica: no hay model card sustantiva, benchmarks ni descripción de la arquitectura más allá del tag `gemma4`. Se trata, por tanto, de un checkpoint de investigación sin validación pública, y cualquier evaluación de su calidad debe realizarse empíricamente antes de considerarlo para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tag `gemma4` sugiere familia Gemma, sin confirmar) |
| Parámetros totales | 31.273.088.876 (~31,3 B) |
| Parámetros activos | No aplica (no hay indicios de MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo más allá del tag `gemma4` incluido en el repositorio, que apunta a una posible derivación o fine-tuning sobre la familia Gemma de Google. El recuento de parámetros (31,3 B) no coincide exactamente con ninguno de los tamanos canónicos de Gemma 2 (2B, 9B, 27B), lo que podría indicar un modelo ajustado, fusionado o con capas adicionales, pero no hay evidencia que lo confirme.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o instruction tuning. Se desconoce igualmente si incorpora innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Toda la información relativa al entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable por el tamano del modelo, pero no verificada ni documentada.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dada la ausencia de documentación y benchmarks, los casos de uso solo pueden plantearse como hipótesis de investigación. Se recomienda validar empíricamente cualquier aplicación antes de desplegarla.

- Investigación sobre ajuste fino: el checkpoint puede servir como base para experimentos de fine-tuning supervisado o DPO, dado su tamano intermedio y su licencia permisiva Apache 2.0.
- Evaluación comparativa de modelos: útil para contrastar el comportamiento de un modelo de ~31 B derivado de Gemma frente a alternativas documentadas, siempre que se ejecuten evaluaciones propias.
- Experimentación académica con modelos gated: el acceso restringido permite estudiar flujos de distribución controlada y reproducibilidad en entornos de investigación.
- Destilación de conocimiento: un modelo de este tamano puede actuar como profesor en pipelines de destilación hacia modelos más pequenos, previa verificación de su calidad.
- Pruebas de despliegue en infraestructura propia: con 62,6 GB de pesos en FP16, permite validar configuraciones de serving (vLLM, TGI) en GPUs de 80 GB.
- Estudio de sesgos y alineación: al no haber documentación sobre alineación, puede emplearse para auditar comportamientos no filtrados, con las precauciones correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 80 GB.
- Cuantización a 8 bits (INT8): ~31 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): ~16-18 GB, cabe en GPUs consumer de 24 GB como RTX 3090 o RTX 4090.
- GPUs recomendadas: A100 80 GB, H100 80 GB para precisión completa; RTX 4090 (24 GB) solo con cuantización agresiva.
- Despliegue: no hay confirmación de compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser safetensors con tag `gemma4`, es probable que requiera conversión o adaptación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación |
|---|---|---|---|---|
| decider-r2-e4 | ~31,3 B | No disponible | Apache 2.0 | Prácticamente inexistente |
| Gemma 2 27B | 27 B | 8K tokens | Gemma License | Extensa, con benchmarks |
| Qwen 2.5 32B | 32,5 B | 128K tokens | Apache 2.0 | Extensa, con benchmarks |
| Mistral Small 24B | 24 B | 32K tokens | Apache 2.0 | Extensa, con benchmarks |

La comparación se limita a parámetros y licencia, ya que no existen datos de rendimiento del modelo analizado. Frente a alternativas como Qwen 2.5 32B o Mistral Small, decider-r2-e4 carece de la documentación, contexto declarado y validación pública que sí ofrecen esos modelos.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripción de arquitectura, entrenamiento ni evaluación.
- Riesgo elevado de alucinación y comportamiento impredecible al no conocerse el proceso de alineación.
- Sesgos desconocidos: sin información sobre la composición del corpus, no es posible anticipar sesgos de género, raza, idioma o dominio.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni calidad en castellano.
- Longitud de contexto desconocida: impide planificar aplicaciones con contextos largos.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade fricción para despliegues automatizados.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo.
- Sin garantías de reproducibilidad: no se documenta la versión de tokenizer, configuración de generación ni hiperparámetros recomendados.
- Recomendación: no emplear en producción sin una evaluación empírica exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/Andrew93110/decider-r2-e4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
