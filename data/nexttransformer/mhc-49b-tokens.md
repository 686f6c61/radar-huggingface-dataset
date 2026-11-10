# NextTransformer/mHC-49B-Tokens

## Resumen

NextTransformer mHC es un modelo de lenguaje causal de tipo transformer con 1.353.550.818 parámetros (aproximadamente 1,35 mil millones), desarrollado por NextTransformer dentro de un estudio comparativo de arquitecturas. Su rasgo distintivo es el uso de "hyper-connections" cuyo mezclado de flujos se mantiene próximo a una matriz doblemente estocástica, una innovación sobre las conexiones residuales convencionales. El modelo se ha preentrenado desde cero sobre el dataset ClimbMix durante 46.875 actualizaciones, con una longitud de contexto de 2.048 tokens.

El sufijo "49B" del repositorio hace referencia al número de tokens de entrenamiento (49.152 millones), no al tamaño del modelo. Se trata, por tanto, de un checkpoint de investigación orientado a comparar variantes arquitectónicas bajo un mismo presupuesto de cómputo, no de un modelo listo para producción. No se han publicado datos sobre licencia, idiomas soportados ni cuantizaciones disponibles.

Su relevancia es fundamentalmente académica: permite reproducir y auditar los resultados del estudio NextTransformer (BPB de validación 0,6617 y CORE-22 de 35,33) y explorar el efecto de las hyper-connections en el entrenamiento de modelos causales a escala de mil millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con hyper-connections (mezclado de flujos próximo a doblemente estocástico) |
| Parámetros totales | 1.353.550.818 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (solo pesos safetensors en precisión original) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (model.safetensors) + tokenizer.tiktoken.json |
| Librería | PyTorch (implementación `nexttransformer`) |
| Tokenizador | tiktoken (BPE con patrón y rangos mergeables en JSON) |
| Tokens de entrenamiento | 49.152 millones (46.875 actualizaciones) |
| Dataset de entrenamiento | ClimbMix |

## Arquitectura y entrenamiento

El modelo es un transformer causal (decoder-only) que sustituye las conexiones residuales estándar por hyper-connections, un mecanismo que introduce matrices de mezclado entre flujos de activaciones. La innovación concreta de esta variante mHC es mantener dicha matriz de mezclado próxima a una matriz doblemente estocástica, lo que preserva la norma de las activaciones a través de las capas y estabiliza el entrenamiento profundo. El checkpoint corresponde a la variante final del estudio comparativo de arquitecturas NextTransformer, con un total de 1.353.550.818 parámetros y contexto de 2.048 tokens.

El preentrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones, lo que equivale a 49.152 millones de tokens procesados. No se documenta en la información disponible el uso de RLHF, DPO, SFT posterior ni técnicas de decodificación especulativa. El tokenizador es una implementación de tiktoken con vocabulario BPE serializado en JSON (patrón, rangos mergeables y tokens especiales como `<|bos|>`), lo que permite reconstruir el encoding sin dependencias adicionales más allá de `tiktoken`.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base preentrenado, sin ajuste por instrucciones ni alineación documentada.
- Predicción de siguiente token con logits por posición; el ejemplo de la model card muestra cómo extraer el token más probable.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Contexto limitado a 2.048 tokens, adecuado solo para secuencias cortas.

## Casos de uso

- Investigación sobre arquitecturas residuales: reproducir el estudio NextTransformer y comparar el efecto de las hyper-connections frente a conexiones residuales estándar bajo el mismo presupuesto de entrenamiento (49.152 millones de tokens).
- Evaluación de estabilidad de entrenamiento: analizar cómo el mezclado próximo a doblemente estocástico afecta a la norma de activaciones y a la convergencia en modelos de ~1,35 mil millones de parámetros.
- Baseline académico en benchmarks de lenguaje: usar los valores publicados (BPB 0,6617, CORE-22 35,33) como referencia para nuevos experimentos con el mismo dataset ClimbMix.
- Estudio del tokenizador tiktoken en modelos pequeños: el vocabulario serializado permite analizar el impacto del esquema BPE en tareas de modelado de lenguaje.
- Prototipado de generación de texto corto: completar prompts de menos de 2.048 tokens en entornos de investigación con CPU o GPU única.
- Reproducibilidad de checkpoints: cargar los pesos con `strict=True` y `set_step(46875)` para verificar que la implementación y el estado del modelo coinciden con el run registrado.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0,6617 |
| CORE-22 (×100) | 35,33 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 5,4 GB solo para pesos (1,35 mil millones de parámetros × 4 bytes), más activaciones y caché KV.
- VRAM estimada en FP16/BF16: aproximadamente 2,7 GB para pesos, si se convierte manualmente (no se distribuyen pesos en estos formatos).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16, o 12-16 GB para FP32 con margen; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y 12 GB o más en FP32.
- Opciones de despliegue: la implementación oficial `nexttransformer` vía pip desde el repositorio de GitHub, junto con `safetensors` y `tiktoken`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos y la arquitectura requieren la librería específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NextTransformer mHC | 1.353.550.818 | 2.048 | No disponible | Hugging Face + GitHub |
| Alternativas de ~1,3B | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF, DPO ni SFT, por lo que puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo elevado de alucinación en tareas de conocimiento factual, al ser un modelo pequeño preentrenado solo con 49.152 millones de tokens.
- Contexto muy limitado (2.048 tokens): no apto para documentos largos, conversaciones multi-turno extensas ni recuperación aumentada con muchos pasajes.
- Idiomas soportados no documentados; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Requiere la implementación específica `nexttransformer` fijada a un commit concreto; no es compatible con ecosistemas estándar de inferencia (vLLM, llama.cpp, Ollama).
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware restringido.
- El nombre del repositorio ("49B-Tokens") puede inducir a error sobre el tamaño del modelo; los parámetros reales son 1,35 mil millones.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/mHC-49B-Tokens
- Repositorio de la implementación: https://github.com/Interactive-Active-AI/NextTransformer
- Arquitectura (resultado mHC): https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/methods/mhc.json
- Registro del run: https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/runs/mhc.json
