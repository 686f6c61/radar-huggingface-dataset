# LlamaPal/LFM3-VL-2B-mmproj-Q8_0-GGUF

## Resumen

El repositorio `LlamaPal/LFM3-VL-2B-mmproj-Q8_0-GGUF` no contiene un modelo de lenguaje completo, sino el complemento de vision (proyector multimodal, `mmproj`) del modelo LFM3-VL-2B de Liquid AI, empaquetado en formato GGUF con cuantizacion Q8_0. Este fichero es el que permite a llama.cpp procesar imagenes junto con texto: se pasa como argumento `--mmproj` junto al modelo base correspondiente. El autor del repositorio, LlamaPal, se limita a espejar el fichero original de `LiquidAI/LFM3-VL-2B-GGUF` sin modificarlo, con el mismo hash SHA-256.

El modelo base, LFM3-VL-2B, es un modelo vision-lenguaje de aproximadamente 2.000 millones de parametros desarrollado por Liquid AI, disenado para ejecucion en dispositivo (on-device). LlamaPal lo distribuye como parte de su aplicacion Android de inferencia offline, de modo que el usuario pueda hacer preguntas sobre imagenes sin conexion ni cuenta. La relevancia de este repositorio es practica: ofrece el componente de vision listo para usar en llama.cpp y en moviles, con un peso de solo 203 MB.

Conviene subrayar que el dato de parametros reportado por Hugging Face para este repo (189.380.352) corresponde al proyector multimodal, no al modelo de lenguaje completo. El repositorio tiene un tamano de 0,2 GB y fue creado el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para modelo vision-lenguaje; el modelo base LFM3-VL-2B es de arquitectura no detallada en la informacion disponible |
| Parametros totales | 189.380.352 (corresponden al fichero mmproj, no al modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero incluido) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" segun metadatos) |
| Formato de pesos | GGUF (`mmproj-LFM3-VL-2B-Q8_0.gguf`, 203 MB) |

## Arquitectura y entrenamiento

Este repositorio contiene exclusivamente el fichero `mmproj-LFM3-VL-2B-Q8_0.gguf`, es decir, el proyector que conecta las representaciones visuales con el espacio del modelo de lenguaje LFM3-VL-2B. En llama.cpp, este fichero se carga mediante el argumento `--mmproj` junto con los pesos del modelo base, y es el que habilita la entrada de imagenes. El fichero es una copia sin modificar del original de `LiquidAI/LFM3-VL-2B-GGUF` en el commit `1add221a5ea6`, con hash SHA-256 `c5c5b58d544a18da919172d2d0368090ea1a4a351b6feb7f8a326a264a5918ab`.

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del proyector, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del modelo base LFM3-VL-2B. El unico dato de entrenamiento implicito es que el proyector fue entrenado por Liquid AI como parte del modelo vision-lenguaje original.

## Capacidades

- Procesamiento de imagenes combinadas con texto (pipeline `image-text-to-text`): el fichero habilita la entrada visual en el modelo base LFM3-VL-2B.
- Inferencia en dispositivo: disenado para ejecutarse en moviles Android mediante llama.cpp, sin conexion a internet.
- Funcionamiento offline: no requiere cuenta ni envia datos fuera del dispositivo, segun la model card.
- Integracion con llama.cpp: se pasa como fichero `--mmproj` del modelo correspondiente.
- Capacidades de generacion de texto, razonamiento, codigo o tool calling: dependen del modelo base LFM3-VL-2B, no documentadas en la informacion disponible para este repositorio.
- Soporte multilingue: no disponible.

## Casos de uso

- Descripcion de imagenes en el movil: el usuario puede cargar una foto en LlamaPal y pedir una descripcion o respuesta sobre ella, con el proyector Q8_0 encargado de la parte visual y el modelo base de la generacion de texto.
- Asistencia visual offline: aplicaciones Android que necesiten interpretar capturas de pantalla, documentos escaneados o fotos sin conexion, usando el par modelo + mmproj en llama.cpp.
- Accesibilidad: lectura y explicacion de imagenes para usuarios con discapacidad visual en entornos sin red, aprovechando la ejecucion local.
- Prototipado con llama.cpp en escritorio: desarrolladores que quieran probar el pipeline vision-lenguaje de LFM3-VL-2B pasando este fichero como `--mmproj` junto al GGUF del modelo base.
- Integracion en apps moviles propias: empaquetar el fichero de 203 MB junto al modelo base para ofrecer funcionalidad de imagen-texto en una aplicacion Android distribuida fuera de LlamaPal.
- Verificacion de integridad: el hash SHA-256 publicado permite comprobar que el fichero es identico al original de Liquid AI antes de desplegarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo; el fichero mmproj ocupa 203 MB en disco y debe cargarse en memoria junto con los pesos del modelo base.
- GPU recomendadas: no disponible. El diseno apunta a ejecucion en dispositivo movil (Android) mediante llama.cpp, sin GPU dedicada.
- Compatibilidad con GPU de consumo: no disponible; el caso de uso principal es CPU/GPU integrada en telefonos.
- Opciones de despliegue: llama.cpp (argumento `--mmproj`), aplicacion LlamaPal para Android. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B (mmproj Q8_0, este repo) | 189 M (solo proyector) | no disponible | GGUF | lfm1.0 | Complemento de vision para llama.cpp y Android |
| LFM3-VL-2B (modelo base, LiquidAI) | ~2 B (segun nombre) | no disponible | safetensors, GGUF, NVFP4 | lfm1.0 | Modelo vision-lenguaje completo |
| Otros modelos vision-lenguaje de ~2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: sin los pesos del modelo base LFM3-VL-2B no puede realizar inferencia.
- El recuento de parametros de Hugging Face (189 M) corresponde al proyector, no al modelo completo; no debe interpretarse como el tamano del modelo.
- Solo se ofrece cuantizacion Q8_0; no hay variantes Q4, Q5 u otras en este repositorio.
- Licencia lfm1.0: es necesario revisar los terminos del fichero LICENSE antes de cualquier uso comercial; la licencia se etiqueta como "other".
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de idioma especificas en la informacion disponible.
- El repositorio es un espejo sin soporte del autor original; las cuestiones tecnicas deben dirigirse a Liquid AI.
- No se garantiza compatibilidad con versiones futuras de llama.cpp mas alla de la documentada en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/LFM3-VL-2B-mmproj-Q8_0-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base en NVFP4: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Repositorio GGUF original: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Fichero original (commit): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF/tree/1add221a5ea6c047fcf1eaaf2d247939d7cf8849
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF/blob/1add221a5ea6c047fcf1eaaf2d247939d7cf8849/LICENSE
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
