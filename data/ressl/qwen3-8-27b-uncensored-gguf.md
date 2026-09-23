# ressl/Qwen3.8-27B-uncensored-GGUF

## Resumen

Qwen3.8-27B-uncensored-GGUF es una version cuantizada en formato GGUF de un modelo de lenguaje de 27.320.697.856 parametros derivado de Qwen/Qwen3.8-27B. El autor, Robert Ressl (usuario ressl en Hugging Face), ha publicado una escalera de cuantizaciones K-quant (Q8_0, Q6_K, Q5_K_M y Q4_K_M) junto con un export mmproj en BF16 para la torre de vision. El modelo base es un maestro BF16 "abliterated", es decir, al que se le han eliminado quirurgicamente las direcciones de activacion asociadas al rechazo mediante biproyeccion que preserva la norma sobre 128 matrices que escriben en el flujo residual.

El proposito declarado es la investigacion en seguridad, el red-teaming y los flujos de trabajo de pruebas de penetracion: el modelo acepta peticiones que un modelo de serie rechazaria. El autor aporta una medicion concreta de este comportamiento sobre 1120 peticiones (JailbreakBench, tulu-harmbench, HarmfulQA, LLM-LAT y mlabonne harmful), donde el modelo base muestra 804 rechazos duros y todas las variantes abliteradas, incluida la cuantizada a Q4_K_M, muestran 0.

Con 262.144 tokens de contexto nativo, soporte multimodal mediante el proyector mmproj y licencia Apache-2.0 heredada, la ficha resulta relevante para quien necesite un modelo local de gran contexto sin filtros de rechazo, pero tambien exige advertencias claras sobre uso y responsabilidad. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y el BF16 GGUF completo (54,6 GB) no se ha subido porque Hugging Face rechaza ficheros unicos de mas de 50 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (etiquetas del repositorio: "hybrid", "qwen3_5"); detalle de capas, atencion y mezcla no disponible |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q8_0 (29,0 GB), Q6_K (22,4 GB), Q5_K_M (19,5 GB), Q4_K_M (16,8 GB); mmproj BF16 (0,9 GB) para la torre de vision |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp); el BF16 GGUF de 54,6 GB no se distribuye |
| Autor | ressl (Robert Ressl) |
| Modelo base | ressl/Qwen3.8-27B-uncensored (maestro BF16 abliterated) |
| Modelo original | Qwen/Qwen3.8-27B |
| Metodo de cuantizacion | convert_hf_to_gguf.py (BF16 y mmproj) y llama-quantize |
| Tamano del repositorio | 88,8 GB |
| Libreria declarada | transformers |
| Hardware de validacion | 1x NVIDIA RTX PRO 6000 Blackwell 96 GB (SM120) |
| Herramientas de validacion | llama.cpp master (build CUDA para SM120), transformers 5.15.0 |

## Arquitectura y entrenamiento

No se dispone de detalle arquitectonico completo en la informacion proporcionada. Las etiquetas del repositorio ("hybrid", "qwen3_5") apuntan a una arquitectura hibrida, y el pipeline declarado es text-generation, pero no se especifican numero de capas, tipo de atencion, dimension oculta ni configuracion de expertos. El modelo incluye una torre de vision exportada aparte como mmproj en BF16, lo que habilita entrada de imagen ademas de texto.

El entrenamiento original corresponde a Qwen/Qwen3.8-27B, sobre el que no se aportan datos de tokens, composicion del dataset, RLHF o DPO en el material disponible. La intervencion del autor es de edicion de pesos, no de entrenamiento: abliteracion del maestro BF16 mediante biproyeccion que preserva la norma aplicada sobre 128 matrices que escriben en el flujo residual. El pipeline completo esta documentado en el repositorio del modelo maestro. Posteriormente se convirtio a GGUF y se cuantizo, y se revalido con llama.cpp sobre el conjunto de evaluacion propio antes de la subida. La model card indica que la decodificacion especulativa basada en MTP no esta cableada en esta exportacion.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicada via `--jinja` en llama.cpp.
- Modo de razonamiento controlable: el protocolo de evaluacion usa `enable_thinking=False`, lo que implica que existe un parametro de plantilla para activar o desactivar el modo de pensamiento (el comportamiento con el modo activo no se documenta).
- Entrada multimodal de imagen: el fichero mmproj BF16 permite procesar imagenes junto al texto con llama.cpp.
- Generacion de codigo: el material de terceros atribuye al linaje Qwen3.8 capacidad de codigo, aunque no se aportan resultados propios de HumanEval ni similares.
- Cumplimiento de peticiones habitualmente rechazadas: 0 rechazos duros sobre 1120 peticiones en Q8_0, Q4_K_M y el maestro BF16, frente a 804 del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible, pese a que el ejemplo de despliegue habilita la plantilla jinja.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles.

## Casos de uso

- Red-teaming de modelos y de filtros de seguridad: se puede usar como generador adversario controlado para producir peticiones y respuestas limite contra las que medir clasificadores de contenido, jueces automaticos o sistemas de moderacion, aprovechando que el modelo no se auto-rechaza.
- Investigacion en alineacion y en mecanismos de rechazo: al existir el maestro BF16 y el modelo original Qwen3.8-27B, permite reproducir experimentos de abliteracion comparando la tasa de rechazo entre el modelo base (804/1120) y las variantes intervenidas (0/1120).
- Pruebas de penetracion y ejercicios de equipo rojo autorizados: generacion de escenarios de ataque, plantillas de phishing de laboratorio, descripciones de exploits y material de formacion en un entorno aislado, sin depender de servicios en la nube que bloqueen el contenido.
- Generacion de datos sinteticos adversarios: producir corpus de ejemplos limite en ingles para entrenar o ajustar clasificadores de toxicidad, moderacion o deteccion de jailbreak, con la ventaja de poder etiquetar la fuente exacta y la cuantizacion empleada.
- Analisis de documentos largos con contexto de 262.144 tokens: revision de expedientes, registros de auditoria o repositorios de codigo completos en una sola pasada, un uso que no depende del comportamiento "uncensored" y que sigue siendo valido con el mismo artefacto.
- Procesamiento local de material sensible: al distribuirse en GGUF y ejecutarse con llama.cpp sobre hardware propio, permite analizar texto e imagenes que no pueden salir de la organizacion, sin enviar datos a APIs externas.
- Asistencia tecnica sobre capturas e imagenes: gracias al mmproj, se pueden transcribir diagramas, capturas de pantalla de errores o esquemas y continuar la conversacion en texto dentro de la misma sesion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece cuatro niveles del mismo modelo, de modo que sirve para medir cuanto degrada la cuantizacion el comportamiento del modelo (el autor observa que Q4_K_M deriva algunos puntos por encima de Q8_0 en rechazos residuales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo aportado es la tasa de rechazo duro medida por el autor con temperatura 0, `enable_thinking=False` y marcadores de rechazo en las primeras 25 palabras.

| Conjunto de evaluacion | Peticiones | Base | Maestro BF16 | Q8_0 | Q4_K_M |
|---|---|---|---|---|---|
| JailbreakBench | 100 | 71 | 0 | 0 | 0 |
| tulu-harmbench | 320 | 232 | 0 | 0 | 0 |
| HarmfulQA | 300 | 207 | 0 | 0 | 0 |
| LLM-LAT | 300 | 225 | 0 | 0 | 0 |
| mlabonne harmful | 100 | 69 | 0 | 0 | 0 |
| Total | 1120 | 804 | 0 | 0 | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache de contexto): Q4_K_M aproximadamente 16,8 GB; Q5_K_M aproximadamente 19,5 GB; Q6_K aproximadamente 22,4 GB; Q8_0 aproximadamente 29,0 GB. El proyector de vision mmproj anade unos 0,9 GB si se usa entrada de imagen.
- Cache KV: no disponible su tamano exacto. Con 262.144 tokens de contexto nativo, la cache puede crecer hasta superar el tamano de los pesos en configuraciones de contexto completo, por lo que conviene dimensionar VRAM adicional o reducir `-c` (el ejemplo del autor usa 131.072).
- GPU consumer: Q4_K_M entra en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado; Q5_K_M y Q6_K encajan ajustadamente en 24 GB con contexto corto y en 32 GB (RTX 5090) con mas margen; Q8_0 requiere 32 GB o mas.
- GPU profesional y de centro de datos: A100 40 GB y 80 GB, H100 80 GB y RTX PRO 6000 Blackwell 96 GB. Esta ultima es la configuracion en la que el autor valido el modelo con llama.cpp (build CUDA para SM120).
- Despliegue: llama.cpp (llama-server) es la via validada por el autor, con `--jinja -ngl 99`. Al ser GGUF, tambien es compatible con otros runners basados en llama.cpp (por ejemplo Ollama o LM Studio) y con offload parcial a CPU si la VRAM es insuficiente; no se documenta compatibilidad con vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera token para ninguna de las cuantizaciones.
- Nota: la decodificacion especulativa MTP no esta activada en esta exportacion, por lo que no se puede contar con esa ganancia de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Estado |
|---|---|---|---|---|---|
| ressl/Qwen3.8-27B-uncensored-GGUF | 27,32 mil millones | 262.144 tokens | Q8_0, Q6_K, Q5_K_M, Q4_K_M, mmproj BF16 | Apache-2.0 | Publicado; 0 descargas y 0 likes |
| Qwen/Qwen3.8-27B (original) | No disponible en la informacion | 262.144 tokens (heredado) | No disponible | Apache-2.0 (heredada) | Modelo de referencia con rechazos: 804/1120 |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | No disponible | No disponible | GGUF (no detallado) | No disponible | Repositorio alternativo del mismo linaje |
| dealignai Qwen3.8-27B-UNCENSORED-GGUF | No disponible | No disponible | GGUF (no detallado) | No disponible | Variante descrita como refusal-removed con vision, video y cabeza MTP |
| Maestro ressl/Qwen3.8-27B-uncensored (BF16) | 27,32 mil millones | 262.144 tokens | Pesos BF16 (no GGUF) | Apache-2.0 | Origen de esta cuantizacion |

Los datos de parametros, contexto, licencia y cuantizaciones de las alternativas no aparecen en la informacion proporcionada, por lo que la comparacion solo puede establecerse en terminos de linaje y de disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: acepta peticiones que un modelo de serie rechaza. Puede generar contenido danino, ilegal o peligroso. Esta pensado para investigacion en seguridad y entornos controlados, y su uso en produccion orientada al publico exige capas propias de moderacion.
- Riesgo de alucinacion: no se han publicado metricas de veracidad, factualidad ni calibracion. Al no existir benchmarks de capacidades, no hay evidencia cuantitativa del rendimiento en tareas de conocimiento.
- Efecto de la cuantizacion: el autor advierte que cuantizar amplifica los rechazos residuales. Q8_0 es la opcion subida mas fiel al maestro BF16; Q4_K_M deriva algunos puntos por encima, lo que implica una degradacion menor pero medible tambien en otras capacidades.
- Fidelidad maxima no disponible: el BF16 GGUF (54,6 GB) no se ha subido por el limite de 50 GB por fichero de Hugging Face, de modo que Q8_0 es el build de mayor fidelidad disponible publicamente.
- Idioma: la model card declara unicamente ingles. El comportamiento en castellano no esta documentado ni evaluado, y la abliteracion puede haber afectado de forma desigual a idiomas no representados en los conjuntos de evaluacion.
- Rendimiento: sin decodificacion especulativa MTP activada, la velocidad depende enteramente de la cuantizacion y del hardware; no hay cifras publicadas.
- Licencia: Apache-2.0 permite uso comercial, pero hereda las condiciones de Qwen3.8-27B. La responsabilidad legal y etica del contenido generado recae en el desplegador, no en el autor de la cuantizacion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, sin señales externas de validacion independiente ni de mantenimiento continuado.
- Sesgos: no se aporta ninguna evaluacion de sesgo demografico, toxico o de representacion. No hay datos al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ressl/Qwen3.8-27B-uncensored-GGUF
- Modelo base (maestro BF16 abliterated): https://huggingface.co/ressl/Qwen3.8-27B-uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor en Hugging Face: https://huggingface.co/ressl
- Sitio web del autor: https://ressl.ch/
- LinkedIn del autor: https://www.linkedin.com/in/robertressl/
- Variante alternativa (JonathanColetti): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Espejo en OpenCSG: https://opencsg.com/models/AIWizards/Qwen3.8-27B-Uncensored-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored.html
- Guia comparativa en HackerNoon: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Ficha de la variante de dealignai en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-gguf-dealignai
