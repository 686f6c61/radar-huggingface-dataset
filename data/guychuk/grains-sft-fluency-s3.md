# guychuk/grains-sft-fluency-s3

## Resumen

`guychuk/grains-sft-fluency-s3` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario guychuk sobre el modelo base `ornith-ai/Ornith-1.5-35B-A3B`. No se trata de un modelo completo, sino de un delta de pesos que debe cargarse junto con el modelo base mediante la librería PEFT (versión 0.21.2 según la model card). El repositorio ocupa 3,8 GB en formato safetensors, un tamaño coherente con un adaptador de rango medio-alto sobre un modelo de decenas de miles de millones de parámetros.

La información publicada por el autor es prácticamente nula: la model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como `[More Information Needed]`. No se declaran licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. El nombre del repositorio sugiere un entrenamiento orientado a fluidez conversacional ("fluency"), y el sufijo "s3" podría remitir a la técnica Selective Self-to-Supervised Fine-Tuning (S3FT, arXiv 2502.08130) o simplemente a una tercera etapa de un pipeline propio, pero ninguna de las dos hipótesis está confirmada por el autor.

Su relevancia es, por tanto, limitada y experimental: resulta interesante como ejemplo de adaptación ligera sobre un modelo MoE de la familia Ornith (el identificador del base apunta a ~35B parámetros totales con ~3B activos, según la convención de nombres A3B, aunque no está verificado), pero carece de la documentación mínima exigible para un uso en producción. Cualquier evaluación seria requiere descargar el modelo base, aplicar el adaptador y medir su comportamiento por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El modelo base `ornith-ai/Ornith-1.5-35B-A3B` apunta a una arquitectura de mezcla de expertos (MoE) segun la convencion de nombres, no confirmado por el autor |
| Parametros totales | No disponible. El identificador del modelo base sugiere ~35B (no confirmado) |
| Parametros activos | No disponible. El sufijo "A3B" del modelo base sugiere ~3B activos (no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision no declarada, presumiblemente bf16/fp16). No se publican versiones GGUF, AWQ ni GPTQ. Para cuantizar hay que fusionar el adaptador con el modelo base y convertir despues |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no la declara; heredara las restricciones del modelo base, que tampoco se detallan en la informacion proporcionada) |
| Formato de pesos | safetensors, adaptador LoRA para PEFT (`library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con SFT sobre el modelo `ornith-ai/Ornith-1.5-35B-A3B`. La model card solo aporta metadatos de infraestructura: `peft` como librería, `trl` como framework de entrenamiento y PEFT 0.21.2 como versión de referencia. No se especifican rango del adaptador, alpha, módulos objetivo ni si se entrenaron las capas de atención, las de MLP o ambas; el tamaño del repositorio (3,8 GB) sugiere un adaptador relativamente grande, posiblemente con todos los módulos lineales adaptados sobre un modelo de ~35B.

No hay información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni procedencia, ni si hubo filtrado o deduplicación. Tampoco se documenta si el ajuste incluyó fases posteriores de preferencia (RLHF/DPO) o únicamente imitación supervisada. El término "fluency" en el nombre apunta a un objetivo de fluidez en la generación conversacional, y "s3" podría corresponder a la técnica S3FT descrita en arXiv 2502.08130 (que alterna respuestas del propio modelo con respuestas supervisadas para preservar la generalización), pero no existe confirmación por parte del autor. No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modos de razonamiento, etc.).

## Capacidades

- Generación de texto conversacional: es la única capacidad declarada explícitamente por el `pipeline_tag: text-generation` y la etiqueta `conversational`.
- Ajuste orientado a fluidez: por el nombre del repositorio, se espera una mejora en la naturalidad y cohesión de las respuestas, si bien no hay evaluación que lo respalde.
- Capacidades heredadas del modelo base (`ornith-ai/Ornith-1.5-35B-A3B`): no documentadas en la información disponible. Si el base es un MoE de propósito general, cabría esperar razonamiento, código y matemáticas, pero no puede afirmarse sin verificación.
- Tool calling / function calling: no disponible / no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no declarado.
- Capacidades multilingües: no disponibles; el autor no declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles / no declaradas.

## Casos de uso

- Evaluación de técnicas de ajuste ligero: el adaptador sirve como caso de estudio para medir cuánto cambia el comportamiento de un MoE de ~35B tras un SFT de fluidez, comparando las respuestas del base con y sin el delta LoRA en un conjunto fijo de prompts.
- Prototipado de asistentes conversacionales en catalán/castellano-inglés: cargando el modelo base y aplicando el adaptador se puede probar si la fluidez mejora en diálogos multi-turno, siempre que se valide primero la calidad real del checkpoint.
- Investigación sobre LoRA en arquitecturas MoE: el repositorio permite inspeccionar qué módulos se adaptaron y con qué rango, útil para estudiar la interacción entre adaptadores de bajo rango y el enrutado de expertos.
- Generación de texto creativo y divulgativo: si la mejora de fluidez es real, encaja en tareas de redacción donde priman la naturalidad y la coherencia estilística más que la precisión factual (que exigiría verificación externa).
- Base para un pipeline de experimentación con TRL: al estar entrenado con TRL, es un punto de partida para reproducir el entrenamiento y aplicar variantes (DPO posterior, distintos datasets de fluidez, ajuste de hiperparámetros).
- Despliegue interno de bajo riesgo tras validación: en entornos donde no se requiere licencia comercial explícita y el modelo base ya está aprobado, el adaptador puede añadirse o retirarse sin sustituir el modelo completo, lo que simplifica la experimentación A/B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador no es ejecutable por sí solo: requiere cargar el modelo base `ornith-ai/Ornith-1.5-35B-A3B` completo más el delta LoRA.
- VRAM estimada para el modelo base (estimación a partir de ~35B parámetros, no confirmada): ~70 GB en bf16/fp16, ~35 GB en int8 y ~18-20 GB en cuantización de 4 bits.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o dos GPU de 48 GB con tensor parallelism. Para 4 bits: una RTX 4090 (24 GB) puede ser suficiente para los pesos, con margen ajustado para el contexto y la caché KV.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 / RTX 3090 (24 GB) con cuantización de 4 bits tras fusionar el adaptador; en 8 bits no cabe en 24 GB.
- Opciones de despliegue: vLLM o TGI para servir el modelo base y, o bien fusionar previamente el adaptador con `merge_and_unload()` de PEFT, o cargarlo en tiempo de ejecución si el servidor lo soporta. llama.cpp/Ollama requieren fusionar el adaptador y convertir después a GGUF.
- Latencia y throughput: no disponibles. Al tratarse presuntamente de un MoE con ~3B parámetros activos, la latencia por token debería ser sustancialmente menor que la de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Los datos del modelo evaluado no están disponibles; los de los comparadores se basan en documentación pública ampliamente conocida y deben verificarse en sus respectivas model cards.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guychuk/grains-sft-fluency-s3 (adaptador) | No disponible (~35B en el base, sin confirmar) | No disponible (~3B, sin confirmar) | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | Hasta 262k tokens (configuración nativa ampliable) | Apache 2.0 | Pesos abiertos, amplio ecosistema de cuantizaciones |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k tokens | Apache 2.0 | Pesos abiertos, soporte maduro en vLLM y llama.cpp |
| Adaptador LoRA típico sobre modelo abierto | Depende del base | Depende del base | Depende del base | Habitualmente la del base | Muy variable; este caso carece de documentación |

La diferencia fundamental no es de rendimiento sino de trazabilidad: los comparadores publican licencia, idiomas, datos de entrenamiento y evaluaciones, mientras que este adaptador no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto; no hay licencia, idiomas, datos de entrenamiento ni evaluación.
- Riesgo de alucinación: desconocido y no mitigado documentalmente; al ser un SFT de fluidez, existe el riesgo de que el ajuste priorice la naturalidad superficial sobre la exactitud factual.
- Sesgos: no evaluados. Al desconocerse la composición del dataset, no puede descartarse la amplificación de sesgos presentes en los datos del autor o del modelo base.
- Licencia incierta: sin licencia declarada, el uso comercial es jurídicamente ambiguo. Además, el adaptador hereda las condiciones del modelo base, que tampoco se detallan aquí.
- Idiomas y contexto: no declarados; cualquier suposición sobre cobertura multilingüe o ventana de contexto es especulación.
- Reproducibilidad: sin hiperparámetros, semilla ni dataset, el entrenamiento no es reproducible ni auditable.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso real ni de validación por terceros.
- Fecha de creación anómala (2026-10-26) en los metadatos del repositorio, lo que conviene verificar antes de citarlo.
- Para producción: no recomendable sin una evaluación propia previa (perplejidad, evaluaciones de fluidez, pruebas de seguridad y verificación de licencia con el autor del modelo base).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/guychuk/grains-sft-fluency-s3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Perfil del autor: https://huggingface.co/guychuk
- Paper S3FT (posible referencia del sufijo "s3", no confirmada): https://arxiv.org/abs/2502.08130
- Paper citado en los tags (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
