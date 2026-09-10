# kvba1337/zpb-geoloc-qwen3-vl-4b-lora

## Resumen

El repositorio `kvba1337/zpb-geoloc-qwen3-vl-4b-lora` se presenta como un adaptador LoRA sobre el modelo vision-lenguaje `Qwen/Qwen3-VL-4B-Instruct`, orientado a geolocalizacion a nivel de fotografia sobre imagenes de calle, con fines de evaluacion comparativa (benchmarking) en investigacion. El autor es el usuario kvba1337 y la libreria declarada es PEFT, con etiquetas que apuntan a LoRA, QLoRA, `image-text-to-text` y `geolocation`.

El dato mas relevante para cualquier evaluacion es que **el propio autor declara en la model card que el repositorio es un marcador de posicion y no contiene pesos entrenados**. Se trata del "fallback" predeclarado del proyecto ZPB ID-1778: el modelo base al que se cambiaria si se activase alguno de los disparadores de licencia previstos sobre el adaptador basado en Gemma 3 antes del 31 de octubre de 2026. Segun la propia model card, en el registro actual no se ha activado ningun disparador y `google/gemma-3-4b-it` sigue siendo el modelo base del proyecto.

Por tanto, esta ficha documenta un artefacto de gobernanza y planificacion de licencias, no un modelo utilizable. No hay pesos, no hay resultados de benchmarks publicados, no hay datos de entrenamiento declarados y no hay informacion sobre idiomas, contexto o cuantizacion. Cualquier uso en produccion es hoy inviable con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3-VL-4B-Instruct` (transformador vision-lenguaje). El repositorio no contiene pesos entrenados |
| Parametros totales | No disponible (adaptador LoRA sin pesos publicados; el modelo base tiene ~4 000 millones de parametros segun la denominacion de su nombre) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. La etiqueta `qlora` sugiere cuantizacion durante el entrenamiento, pero no se publica ningun formato de pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio no contiene pesos; el autor indica que el adaptador se publica "alone and never merged") |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador mas alla de su naturaleza: un adaptador LoRA entrenado con QLoRA (segun las etiquetas del repositorio) sobre `Qwen/Qwen3-VL-4B-Instruct`, un modelo vision-lenguaje de la familia Qwen3-VL. La model card indica que el adaptador se publica de forma independiente y que nunca se fusiona con el modelo base, lo que implica que su uso requiere cargar el adaptador por separado sobre el modelo base.

No hay ningun detalle publicado sobre el dataset de entrenamiento, el numero de tokens, la composicion de las imagenes, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documentan hiperparametros de LoRA (rango, alpha, modulos objetivo) ni el numero de pasos de entrenamiento. El aspecto mas singular del repositorio no es tecnico sino de proceso: se publica simultaneamente con el adaptador de Gemma 3 para que el fallback de licencia quede "ejercitado" y no solo verificado sobre el papel.

## Capacidades

- No hay capacidades verificables en este repositorio: al no contener pesos, el artefacto no puede ejecutar inferencia por si mismo.
- El proposito declarado es la geolocalizacion a nivel de fotografia sobre imagenes de nivel de calle, es decir, estimar la ubicacion a partir de una imagen.
- El pipeline declarado es `image-text-to-text`, por lo que la modalidad prevista es imagen mas texto de entrada y texto de salida.
- El modelo base declarado (`Qwen/Qwen3-VL-4B-Instruct`) es un modelo vision-lenguaje con soporte de instrucciones, pero las capacidades concretas del adaptador entrenado no estan documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno en el repositorio).
- Capacidades especiales (modo thinking, audio, vision): solo se puede confirmar la componente visual por el pipeline declarado; el resto no disponible.

## Casos de uso

- Benchmarking academico de geolocalizacion: el unico caso de uso declarado explicitamente por el autor es la evaluacion comparativa de geolocalizacion sobre imagenes de calle. Hoy no es ejecutable porque no hay pesos publicados.
- Verificacion de planes de contingencia de licencia: el repositorio sirve como prueba de que el fallback puede publicarse, lo que resulta util para auditorias internas de cumplimiento en proyectos que dependen de modelos con licencias condicionadas.
- Analisis de estrategia de licencias en proyectos derivados: comparar este repositorio con el adaptador equivalente sobre Gemma 3 permite estudiar el coste operativo de mantener una segunda via de publicacion.
- Investigacion sobre robustez geografica de modelos vision-lenguaje: si en el futuro se publicasen pesos, permitiria medir la capacidad de un VLM de 4B para inferir pais o region a partir de senales visuales.
- Docencia sobre adaptadores PEFT: el repositorio ilustra el formato de publicacion de un adaptador LoRA independiente, sin fusion, sobre un modelo base Apache-2.0.
- Evaluacion de sesgo geografico en imagenes de calle: escenario teorico para estudiar si el modelo sobrerrepresenta determinadas regiones del mundo.
- Cualquier uso en produccion: descartado en el estado actual del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de geolocalizacion (por ejemplo precision a nivel de pais, ciudad o calle), ni tampoco resultados de evaluaciones generales tipo MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion del repositorio. Como referencia de escala, un modelo vision-lenguaje de ~4 000 millones de parametros suele requerir del orden de 8-9 GB en FP16/BF16 para los pesos, mas el coste de las activaciones de la torre de vision; se trata de una estimacion por escala del modelo base, no de un dato publicado por el autor.
- GPU recomendadas: no disponible. A la escala indicada, una GPU consumer de 12-16 GB podria ser suficiente en cuantizacion de 8 bits o 4 bits, siempre que el adaptador estuviese realmente publicado.
- Cabe en GPU consumer: probablemente si, en funcion de la cuantizacion, pero no hay confirmacion del autor ni pesos para probarlo.
- Opciones de despliegue: el repositorio declara `peft` como libreria, lo que implica cargar el adaptador sobre el modelo base mediante Transformers mas PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kvba1337/zpb-geoloc-qwen3-vl-4b-lora` | No disponible (LoRA sobre base de ~4B) | No disponible | No disponible | Apache-2.0 | Repositorio placeholder sin pesos |
| `Qwen/Qwen3-VL-4B-Instruct` (modelo base declarado) | ~4B segun denominacion | No disponible en la informacion proporcionada | No disponible | No especificada en la informacion disponible | Modelo base publico citado como origen |
| `google/gemma-3-4b-it` (modelo base alternativo del proyecto) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Mencionado en la model card como base vigente del proyecto ZPB ID-1778 |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a disponibilidad, licencia declarada y papel dentro del proyecto.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: es un marcador de posicion declarado explicitamente por el autor. No se puede ejecutar ni evaluar.
- Cero descargas y cero likes en el momento de la consulta, coherente con un artefacto recien creado y sin pesos.
- Uso fuera de alcance declarado por el autor: el adaptador no debe utilizarse para rastrear o vigilar personas, inferir la ubicacion de un individuo identificable ni inferir informacion privada sobre personas.
- Riesgo de privacidad intrinseco a la tarea: la geolocalizacion de imagenes de calle puede facilitar la desanonimizacion si se aplica a personas, aunque el autor lo prohibe expresamente.
- Riesgo de alucinacion: no evaluado ni documentado. En tareas de geolocalizacion, un modelo puede producir coordenadas o toponimos plausibles pero incorrectos.
- Idioma: no disponible. No se declara soporte de castellano ni de ningun otro idioma.
- Contexto: no disponible. No se puede garantizar el manejo de entradas largas.
- Licencia Apache-2.0 en este repositorio, que solo exige atribucion segun el propio autor. La model card remite a `LICENSING.md` del repositorio de codigo del proyecto para determinar que licencia cubre cada artefacto, por lo que el marco completo de licencias no se puede verificar desde HuggingFace.
- Dependencia de un modelo base externo: al no fusionarse el adaptador, cualquier despliegue futuro heredara las condiciones y limitaciones de `Qwen/Qwen3-VL-4B-Instruct`.
- Ausencia de informacion sobre sesgos: no se documenta ninguna evaluacion de sesgo geografico, demografico o cultural.
- Los resultados de la busqueda web no aportan ninguna fuente tecnica relevante sobre el modelo (los enlaces devueltos corresponden a comercio de pellet de madera y no guardan relacion con el artefacto).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kvba1337/zpb-geoloc-qwen3-vl-4b-lora
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base alternativo mencionado en la model card: https://huggingface.co/google/gemma-3-4b-it
- Paper, blog, repositorio de codigo o demo del proyecto ZPB ID-1778: no disponible en la informacion proporcionada (la model card menciona un `LICENSING.md` en el repositorio de codigo del proyecto, pero no se facilita su URL).
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las fuentes devueltas no estan relacionadas con el artefacto.
