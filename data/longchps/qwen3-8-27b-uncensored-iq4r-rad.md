# longchps/Qwen3.8-27B-Uncensored-IQ4R-RAD

## Resumen

Qwen3.8-27B-Uncensored-IQ4R-RAD es una cuantizacion de 4 bits en formato nativo radiance v2 (`.rad`) del modelo abliterado `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del `Qwen/Qwen3.8-27B`. Lo publica el usuario `longchps` en Hugging Face y esta pensado para ejecutarse exclusivamente con el runtime de inferencia radiance v2. El modelo conserva las capacidades multimodales (image-text-to-text), de razonamiento y de function calling del original, pero con la alineacion de seguridad sustancialmente eliminada mediante abliteracion.

El interes practico de esta publicacion es el empaquetado: un unico fichero de 17,6 GB que reduce el footprint de un modelo de 27 000 millones de parametros a una cuantizacion IQ4R (linea V4), lo que lo hace viable en hardware de gama alta de consumo. No obstante, el formato propietario `.rad` limita su uso a una sola herramienta, y el modelo no declara resultados de benchmarks propios ni volumen de uso (0 descargas, 0 likes en el momento de la consulta).

Se trata de un artefacto de nicho: util para quien ya trabaje con radiance v2 y quiera una variante sin rechazos del modelo Qwen multimodal, pero poco adecuado como opcion por defecto en produccion dada la ausencia de validacion publica y el riesgo asociado a la eliminacion de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27 000 millones (segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4R (V4), 4 bits; un unico fichero de 17,6 GB |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (contenedor RAD1, formato radiance v2), fichero `qwen3.8-27b-uncensored-iq4r-v4.rad` |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna mas alla de la etiqueta `image-text-to-text` y la referencia al modelo base Qwen3.8-27B, por lo que no se dispone de datos sobre tipo de atencion, capas, dimension oculta ni mecanismo de vision. El proceso conocido es una cadena de derivacion: primero una abliteracion sobre los pesos BF16 del Qwen3.8-27B original (ortogonalizando la direccion de rechazo fuera del flujo residual), y despues una cuantizacion IQ4R en formato radiance v2. No se publican datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion tecnica destacable es el formato de empaquetado: radiance v2 con contenedor RAD1 y version de formato 2, que agrupa los pesos cuantizados en un unico fichero optimizado para su runtime. No hay informacion sobre calibracion de la cuantizacion, precision efectiva por capa ni degradacion medida respecto al BF16.

## Capacidades

- Generacion de texto y razonamiento, heredados del modelo Qwen3.8-27B subyacente.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text).
- Function calling / tool calling, segun los tags del repositorio.
- Capacidades de razonamiento multi-paso (tag `reasoning`).
- Multilingue limitado a ingles y chino.
- Comportamiento sin rechazos (abliterated/uncensored): responde a peticiones que el modelo alineado rechazaria.
- No se documentan capacidades de audio, thinking mode explicito ni agentes autonomos mas alla de lo implicito en el function calling.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: permite comparar el comportamiento del modelo con y sin la direccion de rechazo eliminada, usando la variante BF16 como referencia y esta cuantizacion para experimentos con recursos limitados.
- Procesamiento de documentos con imagenes en ingles o chino: extraccion y descripcion de contenido visual combinado con texto, aprovechando el pipeline image-text-to-text.
- Generacion de codigo asistida con function calling: integracion en un runtime radiance v2 para tareas de autocompletado o llamadas a herramientas en entornos controlados.
- Redaccion creativa sin restricciones de tono: escenarios donde el equipo necesita contenido que el modelo alineado filtraria, con revision humana obligatoria posterior.
- Prototipado local de asistentes multimodales: el fichero unico de 17,6 GB simplifica el despliegue en una maquina con GPU de gama alta de consumo.
- Evaluacion de la calidad de la cuantizacion IQ4R: comparar respuestas frente al BF16 y al FP8 del mismo linaje para medir la perdida introducida por los 4 bits.
- Analisis de robustez frente a jailbreaks: el modelo sirve como caso de estudio de un sistema sin salvaguardas para disenar filtros externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 18-20 GB para cargar el fichero de 17,6 GB mas overhead del runtime y cache KV; el contexto efectivo dependera de la longitud de secuencia, no documentada.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) como minimo para el modelo completo; A100 40/80 GB y H100 para mayor margen de contexto y concurrencia.
- Cabe en GPU de consumo de 24 GB; no cabe en tarjetas de 16 GB o menos sin offloading a RAM, cuyo rendimiento no se documenta.
- Opciones de despliegue: exclusivamente radiance v2 (formato `.rad`). No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos runtimes existen las variantes FP8, GGUF y MLX del mismo linaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-IQ4R-RAD (este) | 27 000 M | no disponible | `.rad` (IQ4R) | Apache-2.0 | radiance v2 |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27 000 M | no disponible | safetensors | Apache-2.0 | transformers, vLLM |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27 000 M | no disponible | FP8 bloque | Apache-2.0 | vLLM |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27 000 M | no disponible | GGUF | Apache-2.0 | llama.cpp, Ollama |
| orcarouter/Qwen3.8-27B-Uncensored-MLX | 27 000 M | no disponible | MLX | Apache-2.0 | Apple Silicon |

## Limitaciones y advertencias

- La alineacion de seguridad ha sido eliminada mediante abliteracion: el modelo cumple peticiones que el original rechazaria, lo que exige revision humana en cualquier contexto sensible.
- Riesgo elevado de alucinacion no cuantificado; no hay evaluaciones publicas de fidelidad ni de tasas de error.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Formato `.rad` propietario: dependencia total del runtime radiance v2, sin soporte en el ecosistema estandar de inferencia.
- Cuantizacion de 4 bits sin datos de calibracion ni medicion de degradacion frente al BF16.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del contenido generado recae en el desplegador.
- Repositorio sin descargas ni validacion comunitaria en el momento de la consulta; madurez y mantenimiento inciertos.
- El nombre del modelo base (Qwen3.8-27B) no corresponde a una release publica verificable de Qwen, lo que impide contrastar especificaciones oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longchps/Qwen3.8-27B-Uncensored-IQ4R-RAD
- Fichero de pesos: https://huggingface.co/longchps/Qwen3.8-27B-Uncensored-IQ4R-RAD/resolve/main/qwen3.8-27b-uncensored-iq4r-v4.rad
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Variante GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Variante MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
