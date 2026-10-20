# amarchakitus/aurora-1.5-coreml

## Resumen

Aurora 1.5 Core ML es una redistribución del modelo meteorológico Aurora 1.5 de Microsoft (checkpoint `aurora-0.25-v1.5.ckpt`, 0,25° de resolución, 1.260 millones de parámetros) en 54 programas Core ML capaces de ejecutarse en el Neural Engine de un iPhone, iPad o Mac. No es un modelo nuevo ni reentrenado: es un port de inferencia publicado por el usuario amarchakitus, pensado para que la aplicación AI Forecast Factory descargue el repositorio, verifique cada fichero contra `files.json` y ejecute la predicción en el dispositivo sin conexión.

El interés técnico está en el proceso de conversión. Toda la información que no depende del estado atmosférico se ha plegado en constantes: el condicionamiento del paso de 6 horas, todas las adaptive layer norm, las queries constantes de los Perceivers y el embedding de los campos estáticos. Los 48 bloques Swin se han cuantizado a 8 bits por canal de salida y se han troceado por ventanas, mientras que el encoder y el decoder Perceiver, así como los merges y splits de la U-Net, se mantienen en fp16.

El resultado, según el autor, puntúa dentro del 0,4 % del modelo float32 en RMSE de z500 para un paso de 6 horas evaluado contra el análisis del IFS. Es relevante para quien necesite inferencia meteorológica de un modelo fundacional en hardware de consumo Apple, sin GPU dedicada ni servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer con encoder y decoder basados en Perceiver, organizada como U-Net (48 bloques Swin); redistribuida en 54 programas Core ML |
| Parametros totales | 1.260 millones (1,26 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. No es un modelo de lenguaje; la entrada es una rejilla geográfica de 720 × 1440 celdas a 0,25° |
| Tipos de cuantizacion | fp16 en encoder, decoder, merges y splits; 8 bits por canal de salida en los 48 bloques Swin |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (Aurora © Microsoft Corporation) |
| Formato de pesos | `.mlmodelc` (Core ML compilado) para los 54 programas; `.safetensors` para `tables.safetensors` y `static.safetensors`; configuración en `aurora.json` y `manifest.json` |
| Tamano del repositorio | 1,7 GB |
| Resolucion espacial | 0,25° (rejilla de 720 × 1440) |
| Paso temporal | 6 horas (condicionamiento fijado como constante) |
| Modelo base | `microsoft/aurora` (relación: quantized) |

## Arquitectura y entrenamiento

El modelo original es un transformer Swin tridimensional con encoder y decoder tipo Perceiver, dispuesto como una U-Net: los Perceivers comprimen la rejilla de entrada en un conjunto de tokens latentes y el decoder la reconstruye. El port conserva esa topología pero la fragmenta en 54 programas Core ML: un `encoder.mlmodelc`, un `decoder.mlmodelc`, 48 ficheros `block_<layer>_<i>.mlmodelc` (un bloque Swin por programa, troceado por ventanas) y los `merge_*.mlmodelc` y `split_*.mlmodelc` correspondientes a los patch merges y splits. Los tensores que no dependen de la entrada se extraen a `tables.safetensors` (embeddings de campo estático y de posición por patch, layouts de ventanas y pesos float32 de las puntuaciones de agregación por nivel) y `static.safetensors` (máscara tierra-mar y geopotencial de superficie, 720 × 1440).

No hay reentrenamiento ni ajuste fino: el autor indica explícitamente "no retraining". Las únicas transformaciones son la reorganización en programas Core ML con plegado de constantes y la cuantización a 8 bits por canal de salida de los bloques Swin. El condicionamiento del plazo de 6 horas y todas las adaptive layer norm se han convertido en constantes, lo que implica que este port ejecuta un paso fijo de 6 horas y no admite plazos de predicción variables. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) no se recogen en la información disponible; la referencia es el artículo de Bodnar et al. (2025) en *Nature*.

## Capacidades

- Predicción meteorológica determinista de un paso de 6 horas sobre una rejilla global de 0,25° (720 × 1440).
- Ejecución de un rollout multi-paso encadenando estados, con recorte entre pasos (*clipping*) definido en `aurora.json`.
- Inferencia íntegra en el Neural Engine de Apple (iPhone, iPad, Mac), sin GPU dedicada ni conexión a servicios externos.
- Carga de variables meteorológicas, normalización y metadatos de configuración desde `aurora.json`.
- Verificación de integridad de los 54 programas contra `files.json` por parte de la app consumidora.
- Uso de campos estáticos (máscara tierra-mar y geopotencial de superficie) empaquetados en `static.safetensors`.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, agentes, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Predicción meteorológica offline en dispositivo: la app AI Forecast Factory descarga el repositorio y ejecuta el paso de 6 horas en el Neural Engine, de modo que un iPhone o un iPad puede producir una predicción global sin conectividad ni clúster.
- Rollouts de corto plazo en campo: encadenando pasos de 6 horas con el recorte entre pasos definido en `aurora.json` se obtienen secuencias de 24 a 48 horas en hardware portátil, útil para expediciones, trabajo marítimo o agrícola sin cobertura.
- Validación comparativa de modelos: al puntuar dentro del 0,4 % del float32 en RMSE de z500, sirve como referencia barata para comprobar si una versión cuantizada degrada la predicción antes de desplegarla en producción.
- Prototipado de aplicaciones meteorológicas en iOS y macOS: los 54 `.mlmodelc` se integran directamente con Core ML, lo que permite construir visores de campos meteorológicos o apps de divulgación científica sin backend.
- Investigación sobre cuantización en aceleradores de telefonía: el troceado por ventanas y la mezcla de fp16 y 8 bits constituyen un caso documentado de cómo repartir un modelo de 1,26 B de parámetros en un presupuesto de memoria móvil de 1,7 GB.
- Docencia y demostraciones: permite mostrar en un portátil Apple cómo un modelo fundacional del sistema Tierra del artículo de *Nature* (2025) produce un campo de geopotencial a 500 hPa, sin depender de infraestructura de cálculo.
- Evaluación en entornos con presupuesto energético restringido: el Neural Engine ofrece inferencia de baja potencia frente a una GPU, lo que encaja en estaciones de campo o dispositivos alimentados por batería.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| RMSE de z500, paso de 6 h frente al análisis del IFS | Dentro del 0,4 % del modelo float32 | Modelo Aurora 1.5 en float32 |

No se han publicado otros resultados de benchmarks en la información disponible: no hay cifras absolutas de RMSE, ni comparaciones con GraphCast, Pangu-Weather, FourCastNet u otros modelos meteorológicos, ni latencias o throughput medidos.

## Requisitos de hardware

- Acelerador objetivo: Neural Engine de Apple (iPhone, iPad o Mac). El port está diseñado y troceado para esa unidad; no se documenta el comportamiento con fallback a GPU o CPU de Core ML.
- Huella en disco: 1,7 GB de repositorio, repartidos en 54 programas más los ficheros `tables.safetensors` y `static.safetensors`.
- VRAM estimada para inferencia: no disponible. Al ejecutarse en memoria unificada de Apple Silicon, no se publica una cifra de memoria residente; el límite práctico lo impone el tamaño del repositorio y el troceado por ventanas.
- GPU recomendadas: no aplica en el diseño original (Neural Engine). No se han publicado datos de ejecución en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en el sentido de que está pensado para SoC Apple consumer (iPhone, iPad, Mac con Neural Engine); no hay datos para GPU NVIDIA consumer.
- Opciones de despliegue: Core ML en iOS, iPadOS y macOS; el modelo base en PyTorch se sirve con las herramientas habituales de `microsoft/aurora`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amarchakitus/aurora-1.5-coreml | 1,26 B | Rejilla 720 × 1440 a 0,25°, paso de 6 h | fp16 + 8 bits en bloques Swin | MIT | HuggingFace, Core ML; 0 descargas, 0 likes |
| microsoft/aurora (base) | 1,26 B (checkpoint `aurora-0.25-v1.5`) | Rejilla a 0,25°, plazos variables | float32 | MIT | HuggingFace, PyTorch; requiere GPU |
| GraphCast, Pangu-Weather, FourCastNet | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el propio modelo base: misma arquitectura y mismos pesos, con la diferencia de que el port fija el condicionamiento a 6 horas, cuantiza los bloques Swin a 8 bits y se restringe a Core ML, mientras que el original en PyTorch mantiene precisión float32 y admite otros plazos de predicción. No se dispone de datos de otros modelos meteorológicos en la información facilitada.

## Limitaciones y advertencias

- Paso temporal fijo: el condicionamiento de 6 horas está plegado como constante, por lo que este port no puede generar predicciones a otros plazos sin reconstruir los programas.
- Cuantización irreversible: los bloques Swin están a 8 bits por canal de salida; la pérdida medida es del 0,4 % en RMSE de z500 para un paso de 6 horas, pero no se documenta la degradación acumulada en rollouts de varios pasos.
- Sin reentrenamiento ni ajuste: cualquier sesgo del modelo Aurora original se hereda intacto.
- Ámbito exclusivamente meteorológico: no hay generación de texto, código, razonamiento, tool calling, agentes, visión ni audio; las filas de idiomas y contexto de la tabla reflejan esa ausencia.
- Dependencia de plataforma: los `.mlmodelc` están compilados para Core ML y Neural Engine; no son portables a CUDA, ROCm ni otros runtimes sin reconversión desde el modelo base.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright de Microsoft Corporation y la atribución. El autor advierte que no es un producto de Microsoft y que las predicciones generadas no son de Microsoft.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación independiente de la cifra del 0,4 %.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existe riesgo de error de predicción meteorológica: los campos generados no deben usarse como única fuente en decisiones de seguridad sin contraste con servicios oficiales.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- [amarchakitus/aurora-1.5-coreml en HuggingFace](https://huggingface.co/amarchakitus/aurora-1.5-coreml)
- [microsoft/aurora en HuggingFace](https://huggingface.co/microsoft/aurora)
- [Página de modelos de Aurora 1.5 (0,25°)](https://microsoft.github.io/aurora/models.html#aurora-1-5-0-25)
- [Repositorio de la app AI Forecast Factory](https://github.com/amarchakitus/AIFS-iOS-app)
- [Bodnar, C. et al. (2025), A foundation model for the Earth system, Nature](https://doi.org/10.1038/s41586-025-09005-y)
