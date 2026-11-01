# mindsoulBCI/mindsoul-text

## Resumen

MindSoul Neural AI · Text Recognition (mindsoul-text) es un modelo anunciado por mindsoulBCI, del equipo MindSoul de la empresa Chengdu (Shanghai) Brain Cloud Matrix Technology, orientado a la decodificacion de senales EEG asociadas a estimulos de texto y tareas de lectura. El objetivo declarado es modelar con un Transformer las caracteristicas temporales de la actividad cerebral y alinearlas con etiquetas de caracteres, palabras o representaciones semanticas, como base para interfaces cerebro-computadora (BCI) de tipo linguistico.

El repositorio es, a fecha de la informacion disponible, unicamente un anuncio de publicacion: no contiene pesos descargables, codigo de entrenamiento ni resultados de evaluacion. La model card indica explicitamente que la arquitectura Transformer es solo la direccion prevista y que la estructura concreta, las entradas y salidas y la configuracion de entrenamiento se publicaran en la version formal.

Por tanto, no es posible evaluar el modelo como artefacto de inferencia: se trata de una ficha de seguimiento de un proyecto de investigacion en fase de prepublicacion, con licencia restrictiva de uso personal no comercial y sin datos tecnicos verificables mas alla de los idiomas declarados (chino e ingles) y las etiquetas de dominio (eeg, bci, neural-ai, research).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (direccion prevista; no publicada en detalle) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | mindsoul-personal-research (uso personal no comercial; otros usos requieren autorizacion) |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un Transformer como direccion de modelado para caracteristicas temporales de EEG en tareas de lectura y estimulos de texto controlados. No se especifica el numero de capas, dimension del modelo, mecanismo de atencion, tokenizacion de la senal EEG ni la estrategia de alineamiento con etiquetas de texto o representaciones semanticas. Tampoco se detalla si el alineamiento es supervisado por clases (caracter, palabra, categoria semantica) o mediante objetivos contrastivos con embeddings de texto.

No hay informacion sobre volumen de datos, numero de sujetos, dispositivos de registro, composicion del dataset ni sobre el uso de RLHF, DPO u otras tecnicas de ajuste. La model card menciona que se planea reportar particiones de entrenamiento, validacion y prueba a nivel de sujeto, distinguiendo evaluacion intra-sujeto e inter-sujeto, ademas de versiones de datos, condiciones de equipo, lineas base y casos de fallo. Todo ello queda pendiente de publicacion.

## Capacidades

- Decodificacion de actividad cerebral asociada a texto: el objetivo declarado es reconocer y decodificar respuestas neuronales vinculadas a estimulos de texto y tareas de lectura.
- Clasificacion de caracteres, palabras o categorias semanticas: la model card menciona etiquetas de caracter, palabra o clase semantica como posibles objetivos, sin especificar cuales se implementaran.
- Alineamiento entre senal EEG y etiquetas o representaciones semanticas de texto.
- Modelado de series temporales de EEG mediante Transformer (previsto).
- Idiomas declarados: chino e ingles, referidos al ambito linguistico del proyecto, no necesariamente a capacidades generativas.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se declara generacion de texto libre ni lectura de pensamiento o lenguaje interno arbitrario; la model card rechaza explicitamente esa interpretacion.

## Casos de uso

- Investigacion en BCI linguistica: serviria como linea base para estudiar si un Transformer puede alinear senales EEG de lectura con etiquetas de caracteres o palabras en paradigmas experimentales controlados.
- Estudios de decodificacion semantica: analisis de la correlacion entre respuestas cerebrales y representaciones semanticas de palabras, con particiones intra-sujeto e inter-sujeto claramente reportadas.
- Reproduccion academica de paradigmas de lectura: el proyecto planea publicar definicion de tareas, formato de datos y guias de reproduccion, lo que permitiria replicar experimentos en laboratorios de neurociencia cognitiva.
- Evaluacion de generalizacion entre sujetos: comparacion de rendimiento cuando el modelo se entrena con un sujeto y se evalua con otro, un problema central en BCI no invasiva.
- Integracion futura en interfaces espaciales: la model card menciona direcciones de integracion con Android XR, visionOS, PICO OS 6 y PC, aunque sin cliente verificable ni soporte confirmado.
- Docencia y divulgacion tecnica: como ejemplo documentado de pipeline EEG-Transformer en cursos de neurotecnologia, una vez se publiquen datos y pesos.
- Analisis de casos de fallo: el proyecto declara que reportara casos de fallo, lo que resulta util para estudiar limites de la decodificacion de texto a partir de EEG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se reportan cifras de rendimiento en la version actual y que el benchmark, las condiciones de evaluacion y las limitaciones se incluiran en la version formal.

## Requisitos de hardware

- VRAM estimada: no disponible (no hay pesos ni tamano de modelo publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; sin pesos no puede determinarse.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Dominio | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mindsoul-text (mindsoulBCI) | EEG y texto (BCI) | no disponible | no disponible | mindsoul-personal-research (no comercial) | Solo anuncio, sin pesos |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se ofrece comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos, codigo de entrenamiento ni resultados de evaluacion; no es utilizable para inferencia en su estado actual.
- La arquitectura Transformer es una direccion prevista, no una especificacion implementada y verificada.
- La model card advierte que el proyecto no debe describirse como lectura de pensamiento libre ni de lenguaje interno arbitrario.
- No se ha demostrado la existencia de datos desensibilizados ni de autorizaciones de comparticion; la propia model card lo senala.
- La licencia mindsoul-personal-research restringe el uso a investigacion personal no comercial; cualquier uso comercial requiere autorizacion expresa del equipo.
- El contenido no esta destinado a diagnostico ni tratamiento medico.
- Riesgo de sesgo y alucinacion: no evaluable sin modelo publicado; en el dominio EEG son relevantes los sesgos por sujeto, dispositivo y paradigma experimental.
- Idiomas declarados limitados a chino e ingles; no se especifica cobertura adicional.
- Sin datos sobre contexto, cuantizacion ni formatos de pesos, no puede planificarse un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindsoulBCI/mindsoul-text
- Repositorio GitHub del proyecto: https://github.com/pm-kevin-zhang/MindSoul
- Repositorio de aplicaciones espaciales, juegos y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web del proyecto: https://MindSoul.cn
- Licencia (referenciada en el repositorio): LICENSE en el propio repositorio de HuggingFace
