# araysuter/Ripple-65B-Preview-MLX-mixed-2bit

## Resumen

Ripple-65B-Preview-MLX-mixed-2bit es una cuantización de baja fidelidad del checkpoint instruction-tuned Ripple-65B-Preview de ricursiveAI, convertida de forma independiente por el usuario araysuter para su ejecución sobre MLX, el framework de Apple para silicio unificado. El modelo base es un transformer denso de aproximadamente 64.780 millones de parámetros (64,78 B), del que esta variante reduce el peso a 29,62 GB mediante una mezcla de precisiones que promedia 3,657 bits por parámetro.

La relevancia de esta ficha es doble. Por un lado, documenta un perfil de cuantización agresivo (matrices MLP en 2 bits) que permite acercar un modelo de 65 B a equipos con memoria unificada de gama alta, algo históricamente inviable en hardware de consumo. Por otro, el propio autor advierte explícitamente de la pérdida de fidelidad: una prueba sintética generó una función `is_prime` incorrecta y recomienda la variante mixed-4bit cuando la memoria lo permita.

Conviene subrayar que se trata de una conversión de terceros, no oficial, publicada sin descargas ni valoraciones en el momento de redactar esta ficha, y que depende de código personalizado (`modeling_ricursive_mlx.py`) que requiere `--trust-remote-code`. No debe confundirse con el modelo original en BF16 ni con una versión validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con adaptaciones propias de Ripple (PeriNorm, Q/K norms, embedding scaling, RoPE local, NoPE global, value-residual blending, SwiGLU con clipping); adaptador MLX personalizado |
| Parametros totales | 64.782.689.360 (64,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el autor indica que no se realizó una prueba específica de capacidad a 128K; el tamaño de pesos no garantiza encaje de contexto) |
| Tipos de cuantizacion | Mixta: MLP en 2 bits (grupos de 32), proyecciones de atención en 4 bits (grupos de 64), gates sigmoideos de atención, embedding y cabeza de salida en 8 bits (grupos de 64), norms y escalares de value-residual en BF16 original; media real de 3,657 bits por parámetro |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX, requiere código personalizado) |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview es un transformer denso de 65 B parámetros con varias modificaciones arquitectónicas que el adaptador MLX de esta conversión preserva explícitamente: PeriNorm, normalizaciones Q/K, escalado de embedding, RoPE local combinado con NoPE global, mezcla de residuales de valor (value-residual blending) y SwiGLU con clipping. La atención local tiene KV acotada, mientras que la parte global prescinde de codificación posicional rotatoria. El adaptador mantiene el orden de casteo a BF16 y el cómputo de activaciones en FP32 de la referencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el checkpoint original. Lo que sí documenta el autor de la conversión es el proceso de cuantización: se partió del checkpoint instruction-tuned en BF16 (revisión `4f308b9954b73cd200812095916c7baf68cf27f4`), sin recuantizar ningún modelo ya cuantizado, y se aplicó un encoder `mse` con búsqueda de clipping por grupo y refinamiento binario de centroides con fallback de error afín. El autor aclara que no es GPTQ ni AWQ calibrado con activaciones. La innovación técnica destacable es precisamente el empaquetado mixto de precisiones, que protege embedding, cabeza de salida y gates en 8 bits mientras comprime las MLP a 2 bits.

## Capacidades

- Generación de texto conversacional, al estar convertido desde el checkpoint instruction-tuned y no desde el modelo Base de pretraining.
- Razonamiento y respuesta a instrucciones, con la salvedad de que la cuantización a 2 bits degrada tareas que exigen precisión algorítmica (el propio autor documenta un fallo en una función `is_prime`).
- Generación de código y matemáticas: capacidad esperable por el tamaño del modelo base, pero no validada en esta variante; los diagnósticos publicados son sintéticos y no cubren benchmarks de tarea.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor no reclama un camino DFlash2 probado ni decodificación especulativa que preserve la distribución.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no se documenta modo thinking, visión ni audio. El modelo incluye un draft asociado (Ripple-65B Preview DFlash2) que requiere un runtime Ripple-aware y no es un modelo Qwen3 independiente.

## Casos de uso

- Experimentación en hardware Apple con memoria unificada alta: el perfil de 29,62 GB permite cargar un modelo de 65 B en equipos con 32-64 GB de memoria unificada, algo imposible con el BF16 original; útil para prototipado e investigación local.
- Pruebas de humo de pipelines MLX: validar integraciones de `mlx-lm` con modelos de código personalizado y `--trust-remote-code` antes de invertir en infraestructura mayor.
- Evaluación de técnicas de cuantización mixta: el repo incluye `VALIDATION.json` con métricas de fidelidad (76,27 % de acuerdo en top-token, KL media de 0,342 nats) que sirven para estudiar el impacto de 2 bits en MLP frente a 4 bits en atención.
- Generación de texto de baja exigencia algorítmica: borradores, resúmenes o conversación general donde pequeños errores de precisión son tolerables y prima la disponibilidad local.
- Investigación sobre decodificación especulativa: el draft DFlash2 asociado permite estudiar integración de drafters en runtimes Ripple-aware, aunque esta release no reclama un camino probado.
- Benchmarking comparativo de fidelidad: usar los diagnósticos sintéticos como referencia para contrastar otras conversiones (mixed-4bit, GGUF) sobre el mismo checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, GPQA, Terminal-Bench) en la información disponible. El autor lo indica expresamente: los datos publicados son diagnósticos sintéticos, no puntuaciones de benchmark.

| Diagnostico | Resultado |
|---|---|
| Posiciones sintéticas teacher-forced | 1024 |
| Acuerdo en top-token con el BF16 original (streamed) | 76,27 % |
| KL media respecto al BF16 original | 0,342162 nats |
| Pérdida next-token sintética, BF16 / cuantizado | 2,1479 / 2,3985 nats |
| Procesamiento de prompt de 2K sin caché, un usuario | 306,5 tokens/s |
| Decodificación en continuación corta de retrieval | 17,0 tokens/s (9 tokens generados) |

Las mediciones se hicieron con MLX simple, sin drafter, modelo residente, KV fresca y chunks de prompt de 256 tokens. El autor advierte que continuaciones cortas no establecen throughput sostenido y que la evaluación se hizo capa por capa contra el adaptador MLX de referencia, no contra un oráculo PyTorch de modelo completo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,62 GB de pesos; con overhead de runtime MLX, se recomienda al menos 32 GB de memoria unificada y preferiblemente 64 GB para contexto largo y KV.
- GPU recomendadas: no aplica en el sentido tradicional; MLX está diseñado para silicio Apple (series M1/M2/M3/M4 con memoria unificada). En GPUs NVIDIA no es la vía natural de despliegue.
- Cabe en consumer GPU: no en GPUs discretas de consumo convencionales por el tamaño; sí en equipos Apple con memoria unificada de 32 GB o más, con margen justo a 32 GB.
- Opciones de despliegue: `mlx-lm` 0.32.2 con MLX 0.32.4, invocando `python -m mlx_lm.generate` con `--trust-remote-code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta release.
- Latencia y throughput: 306,5 tokens/s en procesamiento de prompt de 2K y 17,0 tokens/s en decodificación sobre una continuación corta, medidos en el hardware del autor (no especificado). No hay datos de throughput sostenido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MLX-mixed-2bit (esta ficha) | 64,78 B | No disponible | Mixta 2/4/8 bits, 3,657 bits/param | Apache-2.0 | MLX con código personalizado |
| Ripple-65B-Preview (BF16, original) | 64,78 B | No disponible | BF16 | Apache-2.0 | Pesos originales en HuggingFace |
| Ripple-65B Preview DFlash2 (draft asociado) | No disponible | No disponible | No disponible | No disponible | Requiere runtime Ripple-aware |
| Variante mixed-4bit del mismo checkpoint | 64,78 B | No disponible | Mixta 4 bits (recomendada por el autor) | Apache-2.0 | MLX |

La comparación con modelos de otras familias (Llama, Qwen, Mistral) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento del modelo base frente a alternativas.

## Limitaciones y advertencias

- Pérdida de fidelidad documentada: el autor reporta que una prueba de humo generó una función `is_prime` incorrecta y recomienda mixed-4bit cuando la memoria lo permita.
- Cuantización no calibrada con activaciones: el encoder `mse` no es GPTQ ni AWQ; el comportamiento en tareas reales puede divergir más de lo que sugieren los diagnósticos sintéticos.
- Diagnósticos limitados: 1024 posiciones sintéticas y un acuerdo top-token del 76,27 % no equivalen a una evaluación de tarea; no hay benchmarks publicados.
- Contexto no validado: no se realizó una prueba específica de capacidad a 128K; el tamaño de pesos no garantiza encaje de contexto.
- Riesgo de alucinación: no cuantificado en esta variante; la degradación por 2 bits en MLP puede amplificarlo en tareas de precisión.
- Sesgos: no documentados en la información disponible.
- Idiomas: no especificados; no se puede asumir cobertura multilingüe.
- Código personalizado: requiere `--trust-remote-code` y revisión manual de `modeling_ricursive_mlx.py`; supone un riesgo de seguridad y de mantenimiento.
- Sin soporte de ecosistema estándar: no hay camino documentado para vLLM, llama.cpp, Ollama o TGI.
- Draft DFlash2 no probado: esta release no reclama decodificación especulativa ni soporte nativo de TensorFold; el bring-up nativo está en un issue abierto.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la licencia original del modelo base; verificar obligaciones de atribución.
- Madurez: 0 descargas y 0 likes en el momento de redactar; conversión de terceros sin validación comunitaria.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/araysuter/Ripple-65B-Preview-MLX-mixed-2bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Draft asociado: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Herramientas de conversión y tests del adaptador: https://github.com/araysuter/TensorFold/tree/896c80b6e99de46b6af2df385f9dbe0dc4fa546c/tools/ripple
- Issue de bring-up nativo de Ripple: https://github.com/ashhart/TensorFold/issues/2171
