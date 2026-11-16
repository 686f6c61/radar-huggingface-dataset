# mradermacher/granite-4.2-30b-heretic-GGUF

## Resumen
`mradermacher/granite-4.2-30b-heretic-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `stuarch/granite-4.2-30b-heretic`, un derivado de la familia IBM Granite 4.2 de 30.000 millones de parametros. El autor, mradermacher, es conocido en el ecosistema por distribuir conversiones GGUF de modelos populares para su uso en llama.cpp y herramientas compatibles. El sufijo "heretic" indica que se trata de una variante con ajuste orientado a reducir el rechazo en respuestas (abliteration o fine-tuning similar), aunque la model card no detalla el proceso.

La relevancia de esta ficha es acotada: la informacion publicada en Hugging Face es minima (sin pipeline, sin licencia declarada, sin idiomas, cero descargas en el momento de la consulta) y el README solo confirma la existencia de cuantizaciones estaticas y el modelo base del que derivan. No se dispone de datos sobre arquitectura, contexto, entrenamiento ni benchmarks.

Por tanto, esta ficha documenta lo verificable (lista de cuantizaciones, origen del modelo, formato) y marca explicitamente como "no disponible" todo lo que no aparece en la informacion proporcionada, sin inferir especificaciones de la familia Granite ni del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30 000 millones (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento
No se ha publicado informacion sobre la arquitectura del modelo en la model card proporcionada. El nombre sugiere una base de la familia Granite 4.2 con 30 000 millones de parametros, pero no se confirma si es un transformer denso, un modelo MoE ni detalles de atencion. Tampoco se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o procesos de abliteration.

El unico dato tecnico verificable es que se trata de cuantizaciones estaticas generadas con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion de tensores de salida. El resto de metadatos (vocab_type, tags, quants_skip, skip_mmproj) aparecen vacios.

## Capacidades
- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje de 30 000 millones de parametros, aunque no se detalla en la model card.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Modo "heretic": el sufijo indica una variante con reduccion de rechazos, pero el autor no documenta el metodo ni el alcance del ajuste.

## Casos de uso
- Despliegue local con llama.cpp: las cuantizaciones GGUF (desde Q2_K hasta Q8_0) permiten ejecutar el modelo en hardware de consumo ajustando el equilibrio entre calidad y memoria, aunque el rendimiento real no se ha publicado.
- Experimentacion con variantes "uncensored": util para investigadores que estudian el efecto de tecnicas de abliteration sobre el comportamiento del modelo, comparando esta version con el modelo base `stuarch/granite-4.2-30b-heretic`.
- Evaluacion de cuantizacion: la disponibilidad de 12 niveles de cuantizacion permite analizar la degradacion de calidad por nivel, siempre que se disponga del modelo base para comparar.
- Integracion en pipelines con Ollama o LM Studio: al ser GGUF, puede cargarse en estas herramientas sin conversion adicional, aunque la falta de licencia clara exige precaucion en entornos comerciales.
- Prototipado offline: util para escenarios sin conectividad donde se requiere un modelo de gran tamano en local, con la salvedad de que no hay benchmarks que confirmen su calidad.
- Investigacion sobre seguridad y alineacion: la variante "heretic" es relevante para estudiar como cambia la tasa de rechazo y el comportamiento ante prompts sensibles respecto al modelo original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (30 000 millones de parametros), Q4_K_M rondaria los 18-20 GB, Q8_0 los 32 GB y x-f16 los 60 GB, pero estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependeria del nivel de cuantizacion y de la VRAM disponible.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, koboldcpp). No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La model card no identifica modelos comparables ni proporciona datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el unico vinculo documentado es con el modelo base `stuarch/granite-4.2-30b-heretic`, del que este repositorio es una conversion GGUF.

## Limitaciones y advertencias
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad, por lo que no se recomienda su uso en produccion sin evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay documentacion especifica sobre mitigaciones.
- Sesgos: no documentados por el autor.
- Variante "heretic": la reduccion de rechazos puede aumentar la probabilidad de generar contenido inapropiado o inseguro; requiere filtros adicionales en aplicaciones expuestas a usuarios.
- Idiomas y contexto: sin datos, no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Metadatos incompletos: pipeline, idiomas y licencia aparecen como "no disponible" en Hugging Face, lo que dificulta la trazabilidad y el cumplimiento normativo.
- Cero descargas en la fecha de consulta: senal de que el modelo no ha sido validado por la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.2-30b-heretic-GGUF
- Modelo base: https://huggingface.co/stuarch/granite-4.2-30b-heretic
