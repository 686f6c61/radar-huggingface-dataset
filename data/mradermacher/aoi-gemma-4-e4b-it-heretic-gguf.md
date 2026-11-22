# mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF

## Resumen

`mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `CloudGoat/aoi-gemma-4-E4B-it-heretic`, un derivado afinado de la familia Gemma 4 con la variante "E4B" (presumiblemente una configuracion eficiente de 4 mil millones de parametros) y el sufijo "it-heretic", que en la practica de la comunidad indica un ajuste orientado a reducir los rechazos y el alineamiento excesivamente conservador del modelo base. El autor de la publicacion es mradermacher, un perfil conocido por generar y distribuir cuantizaciones GGUF de modelos abiertos.

El repositorio no incluye model card propia mas alla de los metadatos de generacion de cuantizaciones: no hay informacion sobre licencia, idiomas, pipeline ni datos de entrenamiento del modelo original. Los unicos datos tecnicos verificables son el numero de parametros del checkpoint original en safetensors (478.088.384, es decir, aproximadamente 0,48 mil millones) y el tamano del repositorio (1,6 GB), que corresponde al conjunto de ficheros GGUF generados en distintas precisiones.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribucion (cuantizaciones) mas que de un modelo con documentacion tecnica propia. Cualquier evaluacion rigurosa del comportamiento del modelo debe remitirse al repositorio original `CloudGoat/aoi-gemma-4-E4B-it-heretic`, del que no se dispone de informacion adicional en esta busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Gemma 4, segun el nombre del modelo) |
| Parametros totales | 478.088.384 (checkpoint original en safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. Por el nombre (`gemma-4-E4B`) se infiere que deriva de la familia Gemma de Google, pero no hay datos confirmados sobre si emplea attention lineal, atencion con ventana deslizante, mezcla de expertos u otra innovacion. El sufijo `it` sugiere un ajuste por instrucciones y `heretic` hace referencia a un proceso de ablacion o fine-tuning orientado a eliminar comportamientos de rechazo (refusal) del modelo alineado original, una practica documentada en la comunidad para modelos como Llama o Gemma.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni tecnicas de decodificacion especulativa. La unica informacion tecnica del repositorio son los metadatos del script de cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que las cuantizaciones se generaron a partir de un checkpoint en formato Hugging Face con la herramienta estandar de cuantizacion de llama.cpp.

## Capacidades

- Generacion de texto y respuesta a instrucciones: el sufijo `it` indica ajuste por instrucciones, aunque no se detalla el alcance.
- Comportamiento "heretic": se espera una reduccion de rechazos ante peticiones que el modelo base rechazaria, si bien no hay documentacion que cuantifique este efecto.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Vision, audio u otras modalidades: no disponible.
- Dado el tamano (0,48 mil millones de parametros), se trata de un modelo pequeno orientado a despliegue en entornos con recursos limitados, no a tareas de razonamiento complejo.

## Casos de uso

- Despliegue en CPU y dispositivos de borde: con cuantizaciones Q4_K_M o Q2_K, el modelo ocupa del orden de cientos de MB, lo que permite ejecutarlo en portatiles, Raspberry Pi o moviles mediante llama.cpp u Ollama.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno, permite iterar sobre prompts y flujos de dialogo sin coste de GPU.
- Filtrado y clasificacion de texto en pipelines locales: tareas de etiquetado, extraccion de entidades o resumen corto donde la latencia y el coste importan mas que la calidad puntera.
- Generacion de texto creativo sin restricciones de contenido: el ajuste "heretic" lo hace adecuado para experimentacion con ficcion o roleplay donde el modelo base rechazaria ciertas peticiones, siempre que se respeten las obligaciones legales aplicables.
- Educacion e investigacion sobre alineamiento: util como caso de estudio de como el fine-tuning altera los comportamientos de rechazo de un modelo alineado.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes de precision, lo que permite medir el impacto de la cuantizacion en la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 0,48 mil millones de parametros, la inferencia en f16 requiere aproximadamente 1 GB; en Q8_0, en torno a 0,5-0,6 GB; en Q4_K_M, alrededor de 0,3-0,4 GB. Estas cifras son estimaciones basadas en el numero de parametros y el tamano del repositorio, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (RTX 3060, RTX 4060, GTX 1650, integradas con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el checkpoint en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aoi-gemma-4-E4B-it-heretic (este) | 478 M | no disponible | no disponible | GGUF, safetensors | Derivado "heretic" de Gemma 4 |
| Gemma 2 2B IT | 2,6 B | 8 K | Gemma Terms | safetensors, GGUF | Modelo oficial de Google, mas grande y documentado |
| Qwen2.5 0.5B Instruct | 0,49 B | 32 K | Apache 2.0 | safetensors, GGUF | Tamano comparable, licencia permisiva y contexto documentado |
| SmolLM2 360M Instruct | 0,36 B | 8 K | Apache 2.0 | safetensors, GGUF | Alternativa pequena con documentacion completa |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo de esta ficha, por lo que solo se comparan parametros, contexto y licencia. Los modelos alternativos citados cuentan con documentacion publica y licencias claras, ventaja significativa frente a este artefacto.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre licencia, idiomas, datos de entrenamiento ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Gemma de Google suele estar sujeto a los Gemma Terms of Use, que imponen restricciones de uso; debe verificarse antes de cualquier despliegue en produccion.
- El ajuste "heretic" implica una reduccion deliberada de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o danino. No es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: los modelos de menos de mil millones de parametros tienen una capacidad limitada de razonamiento y factualidad.
- Contexto e idiomas no documentados: no se puede garantizar un rendimiento aceptable en castellano ni en conversaciones de varios turnos.
- Procedencia incierta: el modelo base lo publica un usuario (`CloudGoat`) sin trazabilidad verificable sobre el proceso de fine-tuning.
- El repositorio solo contiene cuantizaciones; no incluye los pesos originales ni scripts de evaluacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
