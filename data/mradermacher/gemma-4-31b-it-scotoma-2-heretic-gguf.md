# mradermacher/gemma-4-31B-it-scotoma-2-heretic-GGUF

## Resumen

El modelo `mradermacher/gemma-4-31B-it-scotoma-2-heretic-GGUF` es una cuantización estática en formato GGUF de un modelo derivado de la familia Gemma 4, concretamente de la variante `sh0ck0r/gemma-4-31B-it-scotoma-2-heretic`. Lo publica el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles con GGUF. El modelo base apunta a un tamaño nominal de 31B parámetros, aunque el dato real de parámetros registrado en el repositorio (575.743.536) no es coherente con esa cifra y debe tratarse con cautela.

El propósito del modelo es ofrecer una variante "heretic" y "scotoma" del Gemma 4 31B instruction-tuned, es decir, una versión presumiblemente modificada para reducir ciertos comportamientos de rechazo o sesgos de alineamiento (el término "heretic" se usa habitualmente en la comunidad para modelos con el alignment atenuado), distribuida en múltiples niveles de cuantización para facilitar su despliegue en hardware de consumo. El repositorio tiene un tamaño de 2,0 GB, lo que resulta llamativo para un modelo de 31B y sugiere que o bien los pesos no están completos, o bien el dato de tamaño corresponde solo a una parte de los ficheros.

La relevancia de esta ficha es principalmente práctica: permite evaluar rápidamente la disponibilidad de cuantizaciones GGUF de un derivado concreto de Gemma 4 y decidir si encaja en un pipeline local. No obstante, la información publicada es muy escasa (sin licencia, sin idiomas, sin benchmarks) y existen inconsistencias entre el nombre del modelo y los metadatos, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base presumiblemente transformer, familia Gemma 4) |
| Parametros totales | 575.743.536 segun metadatos safetensors del repo (el nombre indica 31B; dato inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia nominal a la familia Gemma 4 y de su carácter instruction-tuned (sufijo `-it`). El nombre sugiere que se trata de un derivado del Gemma 4 de 31B parámetros, pero no se documentan detalles sobre número de capas, dimensiones ocultas, mecanismos de atención ni uso de técnicas como atención lineal o decodificación especulativa.

Tampoco se publican datos sobre el proceso de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento concreto que da lugar a los calificativos "scotoma" y "heretic". El repositorio es únicamente una colección de cuantizaciones estáticas generadas a partir del modelo de sh0ck0r, con metadatos de conversión (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) pero sin documentación adicional sobre el pipeline de cuantización ni sobre el modelo origen.

## Capacidades

- Generación de texto e instrucciones: al derivar de un modelo `-it`, se espera que responda a instrucciones en formato conversacional, aunque no se detalla el formato de prompt soportado.
- Razonamiento y código: no disponible; no se documentan capacidades específicas de razonamiento, matemáticas o programación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Modificación de alineamiento: el sufijo "heretic" sugiere una atenuación del alignment o de los rechazos, pero no se documenta el alcance ni el método.

## Casos de uso

- Despliegue local en llama.cpp: las cuantizaciones Q4_K_M y Q5_K_M permiten cargar el modelo en equipos con GPU de consumo o incluso en CPU, siempre que el tamaño real de los pesos coincida con las expectativas de un modelo de 31B y no con los 2,0 GB del repo.
- Experimentación con alineamiento atenuado: investigadores interesados en estudiar cómo varía el comportamiento de rechazo de un modelo Gemma 4 instruction-tuned tras la modificación "heretic" pueden usar estas cuantizaciones para comparar respuestas frente al modelo original.
- Evaluación de cuantizaciones: el repositorio ofrece una matriz amplia de niveles (de Q2_K a Q8_0 e IQ4_XS), útil para medir la degradación de calidad según el nivel de cuantización en tareas concretas.
- Prototipado de asistentes conversacionales: si el modelo base funciona correctamente, puede integrarse en aplicaciones de chat local mediante Ollama o llama.cpp para pruebas de concepto sin coste de API.
- Investigación sobre sesgos y seguridad: la variante "heretic" es un objeto de estudio para analizar qué comportamientos cambian al modificar el alignment de un modelo abierto.
- Fine-tuning posterior: las cuantizaciones no son adecuadas para entrenamiento, pero el modelo original de sh0ck0r podría servir como base para adaptaciones con LoRA en formato completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con fiabilidad, ya que el dato de parámetros (575 millones) y el tamaño del repo (2,0 GB) no concuerdan con un modelo de 31B. Si el modelo real tuviera 31B parámetros, una cuantización Q4_K_M ocuparía aproximadamente 18-20 GB y Q8_0 en torno a 33 GB; si realmente tuviera ~576M parámetros, cabría en menos de 1 GB en Q4.
- GPU recomendadas: no disponible. Para un hipotético 31B en Q4 se necesitaría una RTX 4090 (24 GB) o A100/H100; para un modelo de ~576M bastaría cualquier GPU consumer.
- Cabe en GPU de consumo: indeterminado por la inconsistencia de metadatos.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se garantiza compatibilidad con vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-scotoma-2-heretic-GGUF | 31B nominal / 575M segun metadatos | no disponible | no disponible | GGUF | Hugging Face |
| Gemma 4 31B it (original, referencia) | 31B | no disponible | Gemma Terms | safetensors, GGUF | Hugging Face |
| Otras cuantizaciones GGUF de Gemma 4 31B | 31B | no disponible | segun modelo base | GGUF | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Inconsistencia crítica de metadatos: el nombre indica 31B pero los parámetros registrados son 575.743.536 y el repo pesa 2,0 GB; es probable que los pesos estén incompletos o que el nombre no refleje el contenido real. Verificar antes de usar en producción.
- Licencia no declarada: no se especifica licencia, lo que impide evaluar el uso comercial y genera riesgo legal. El modelo base Gemma suele estar sujeto a los Gemma Terms of Use.
- Sin información sobre idiomas: no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Alineamiento modificado ("heretic"): puede producir respuestas menos filtradas o más sesgadas; no se documenta el método ni el alcance de la modificación.
- Sin benchmarks: no hay evidencia pública de calidad, por lo que no debe asumirse un rendimiento equivalente al Gemma 4 original.
- Cero descargas y cero likes en el momento de la consulta: repositorio sin validación comunitaria.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad en modelos grandes; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-heretic-GGUF
- Modelo base citado: https://huggingface.co/sh0ck0r/gemma-4-31B-it-scotoma-2-heretic
- Perfil del autor: https://huggingface.co/mradermacher
