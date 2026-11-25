# baker76/videogen-models

## Resumen

`baker76/videogen-models` es un repositorio de modelos en formato ONNX publicado por el usuario baker76, pensado como dependencia del proyecto videogen, una herramienta de linea de comandos en C++ para la generacion de video, y de la aplicacion Baker76 Video Maker. No se trata de un modelo entrenado por el autor: el repositorio empaqueta y, en un caso, convierte pesos de tres modelos de terceros para que funcionen exclusivamente sobre ONNX Runtime sin dependencias de Python.

El contenido se divide en tres carpetas: una conversion de FLUX.2 [klein] 4B de Black Forest Labs (12,4 GB) para generar titulos y fotogramas clave, una copia sin modificar del build cuantizado a 4 bits para CPU de Qwen3-VL-4B-Instruct de Qwen (2,9 GB) y una copia sin modificar de TransNetV2 de Tomas Soucek (31 MB) para deteccion de cortes de escena. El repositorio completo ocupa 15,4 GB.

Su relevancia es practica mas que cientifica: demuestra un patron de despliegue de modelos generativos y multimodales en entornos nativos (C++) mediante ONNX, lo que interesa a quien necesite integrar difusion de imagenes, comprension visual y segmentacion de video en aplicaciones de escritorio o pipelines sin stack Python. No aporta pesos nuevos ni mejoras de entrenamiento; su valor esta en la conversion, el empaquetado y la interoperabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio compuesto por tres modelos independientes: difusion para FLUX.2 [klein] 4B, transformer multimodal para Qwen3-VL-4B-Instruct, red neuronal para TransNetV2) |
| Parametros totales | No disponible (FLUX.2 [klein] 4B: 4B; Qwen3-VL-4B-Instruct: 4B; TransNetV2: no disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Qwen3-VL-4B-Instruct: `cpu-int4-rtn-block-32` (4 bits, round-to-nearest, block size 32); FLUX.2 [klein] 4B: no disponible; TransNetV2: no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 y MIT combinadas segun carpeta: FLUX.2 [klein] 4B bajo Apache-2.0, Qwen3-VL-4B-Instruct bajo Apache-2.0, TransNetV2 bajo MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El autor declara explicitamente que no ha entrenado ni ajustado ningun modelo. El repositorio es un artefacto de distribucion: agrupa tres redes de naturaleza distinta. FLUX.2 [klein] 4B es un modelo de difusion para generacion de imagen, exportado a ONNX mediante el script `tools/export_flux2.py` incluido en videogen a partir del checkpoint original de Black Forest Labs. Qwen3-VL-4B-Instruct es un transformer multimodal (texto e imagen) del que se toma, sin cambios, el build `cpu-int4-rtn-block-32` publicado por onnx-community. TransNetV2 es una red para deteccion de cortes de escena en video, copiada tal cual desde `edgetools/transnetv2`.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia mas alla de la cuantizacion int4 del modelo de Qwen y de la exportacion a ONNX. Cabe senalar que el autor indica que el modelo klein de 9B esta licenciado solo para uso no comercial y por eso no se incluye en el repositorio.

## Capacidades

- Generacion de imagenes (titulos y fotogramas clave) mediante FLUX.2 [klein] 4B, orientada a la composicion de video.
- Comprension de imagen y texto con Qwen3-VL-4B-Instruct: descripcion de contenido visual, respuesta a preguntas sobre imagenes y generacion de texto.
- Deteccion de cortes de escena en video con TransNetV2, util para segmentacion automatica de metraje.
- Ejecucion nativa sobre ONNX Runtime sin Python, integrable en aplicaciones C++.
- Inferencia en CPU para el modelo de Qwen gracias al build int4.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Generacion automatica de titulos e intertitulos en un editor de video: FLUX.2 [klein] 4B produce las imagenes de portada o rotulos que videogen compone en la linea de tiempo, evitando dependencias de Python en el binario final.
- Creacion de fotogramas clave para animaciones o presentaciones: el modelo de difusion genera imagenes base que despues se interpolan o se usan como referencia en el pipeline de video.
- Segmentacion de metraje por escenas: TransNetV2 detecta los cortes y permite dividir automaticamente un video largo en clips manejables antes de aplicar efectos o subtitulos.
- Descripcion automatica de contenido visual: Qwen3-VL-4B-Instruct puede generar pies de foto o descripciones de fotogramas para accesibilidad o indexacion de archivos multimedia.
- Asistente de edicion en aplicaciones de escritorio: al ejecutarse sobre ONNX Runtime en C++, el modelo de Qwen puede integrarse en herramientas nativas sin embeber un interprete de Python, reduciendo el tamano y la complejidad del instalador.
- Procesamiento por lotes en servidores sin GPU: el build int4 de Qwen3-VL permite clasificar o describir imagenes en CPU, adecuado para tareas de catalogacion donde la latencia no es critica.
- Prototipado de pipelines multimodales: el repositorio sirve como referencia de como empaquetar difusion, vision-lenguaje y analisis de video en un unico conjunto de artefactos ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el repositorio esta disenado para ejecucion en CPU en al menos el componente de Qwen (build `cpu-int4-rtn-block-32`).
- FLUX.2 [klein] 4B: 12,4 GB de pesos en ONNX; el requisito de memoria en inferencia no se especifica.
- Qwen3-VL-4B-Instruct: 2,9 GB de pesos en int4, lo que sugiere un consumo de memoria moderado en CPU, aunque no se documenta el pico real.
- TransNetV2: 31 MB, requisitos minimos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (unico runtime indicado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| baker76/videogen-models (este repo) | 4B + 4B + no disponible | No disponible | ONNX | Apache-2.0 y MIT | Empaquetado para ONNX Runtime en C++; sin entrenamiento propio |
| black-forest-labs/FLUX.2-klein-4B | 4B | No disponible | No disponible | Apache-2.0 | Modelo original de difusion para imagen |
| Qwen/Qwen3-VL-4B-Instruct | 4B | No disponible | No disponible | Apache-2.0 | Modelo original multimodal texto-imagen |
| onnx-community/Qwen3-VL-4B-Instruct-ONNX | 4B | No disponible | ONNX (incluye int4) | Apache-2.0 | Build ONNX de referencia del que se copia la version CPU |
| edgetools/transnetv2 | No disponible | No disponible | No disponible | MIT | Deteccion de cortes de escena |

La comparativa relevante es con los modelos originales y con el build ONNX de onnx-community: este repositorio no anade rendimiento, solo reempaqueta y, en el caso de FLUX.2, convierte a ONNX.

## Limitaciones y advertencias

- No es un modelo unico ni un checkpoint entrenado: es un contenedor de artefactos de terceros; evaluar "el modelo" como una entidad unica induce a error.
- La licencia es mixta y depende de la carpeta: Apache-2.0 para FLUX.2 y Qwen, MIT para TransNetV2. Cualquier uso comercial debe verificar la licencia de cada subcarpeta.
- El autor advierte que el modelo klein de 9B tiene licencia solo no comercial y no esta incluido; no debe confundirse con el 4B aqui presente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad; al heredar los pesos originales, hereda tambien sus sesgos, pero no hay informacion especifica.
- Idiomas soportados no declarados; el rendimiento multilingue de Qwen3-VL-4B-Instruct no se detalla en esta ficha.
- Dependencia estricta de ONNX Runtime: no hay pesos en safetensors ni GGUF, lo que limita su uso con otras herramientas de inferencia.
- La fecha de creacion indicada (2026-11-24) es posterior a la de esta ficha; conviene verificar la vigencia y el estado del repositorio antes de integrarlo en produccion.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baker76/videogen-models
- FLUX.2 [klein] 4B (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Qwen3-VL-4B-Instruct (Qwen): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Build ONNX de Qwen3-VL-4B-Instruct: https://huggingface.co/onnx-community/Qwen3-VL-4B-Instruct-ONNX
- TransNetV2 (codigo original): https://github.com/soCzech/TransNetV2
- TransNetV2 en formato de pesos: https://huggingface.co/edgetools/transnetv2
