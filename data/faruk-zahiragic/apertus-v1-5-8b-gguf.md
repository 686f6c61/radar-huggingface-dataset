# faruk-zahiragic/Apertus-v1.5-8B-GGUF

## Resumen

Apertus-v1.5-8B-GGUF es una conversión a formato GGUF del modelo Apertus-v1.5-8B desarrollado por Swiss AI, publicada por el usuario faruk-zahiragic. Se trata de una cuantización Q4_K_M orientada a inferencia local y offline, con soporte multimodal de entrada (texto, imagen y audio) y salida exclusivamente de texto. El paquete incluye además un encoder multimodal separado en precisión F32, necesario para procesar las entradas de imagen y audio.

El modelo base cuenta con 8.609.083.456 parámetros (aproximadamente 8,6 mil millones) y se distribuye bajo licencia Apache 2.0. La conversión se realizó con un fork de llama.cpp compatible con la arquitectura Apertus, sobre la revisión `0be762a6` del modelo original. El objetivo es permitir el despliegue en CPU, GPU integrada o GPUs de consumo sin necesidad de hardware dedicado de gama alta.

Su relevancia actual radica en que ofrece un modelo multimodal de tamano medio con licencia permisiva y pesos cuantizados listos para usar en aplicaciones de escritorio. El repositorio incluye un lanzador nativo para Windows, macOS Apple Silicon y Linux que prepara automáticamente los ficheros necesarios, lo que reduce la fricción de despliegue para desarrolladores que necesitan ejecución local sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal de Swiss AI) |
| Parametros totales | 8.609.083.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (fichero de 5.656.804.512 bytes); encoder multimodal en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se sabe que Apertus-v1.5-8B es un modelo multimodal de Swiss AI que acepta entradas de texto, imagen y audio, y que produce salidas de texto. La conversión a GGUF emplea un fork de llama.cpp especificamente adaptado a la arquitectura Apertus, en la revision `442b0444168a0f72788b40a16c8289bd1eb217f5`.

El proceso de cuantizacion genera un fichero de lenguaje Q4_K_M y un encoder multimodal independiente en F32 (`apertus-v1.5-8b-mmproj-F32.gguf`, 914.229.792 bytes). El autor indica que los tokenizers del modelo original son sensibles a la precision, de ahi que el encoder se mantenga en F32. No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada de imagenes: procesa imagenes mediante el encoder multimodal F32 separado.
- Entrada de audio: procesa audio mediante el mismo encoder multimodal.
- Salida exclusivamente de texto (no genera imagen ni audio).
- Ejecucion completamente offline, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de CPU e inferencia con aceleracion de GPU integrada.
- Capacidad multimodal condicionada: para imagen y audio es necesario descargar ambos ficheros GGUF (lenguaje y encoder); el fichero de lenguaje por si solo solo permite chat de texto.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de escritorio offline: el modelo puede ejecutarse en Windows, macOS Apple Silicon o Linux mediante el lanzador nativo, gestionando conversaciones de texto sin conexion a internet. Es adecuado por su tamano contenido (Q4_K_M de 5,6 GB) y su licencia permisiva.
- Procesamiento de documentos escaneados con descripcion textual: combinando el fichero de lenguaje con el encoder F32, el modelo puede recibir imagenes y generar resumenes o descripciones en texto, util en flujos de digitalizacion de archivos.
- Transcripcion y analisis de audio local: el encoder multimodal permite introducir audio y obtener analisis o respuestas en texto, apropiado para entornos con requisitos de privacidad donde no se puede enviar audio a la nube.
- Prototipado de aplicaciones multimodales: desarrolladores que necesitan validar pipelines de imagen/audio a texto sin coste de API pueden usar estos pesos GGUF con llama.cpp y el fork compatible.
- Educacion e investigacion: el modelo permite experimentar con inferencia multimodal en hardware de consumo (16 GB de RAM recomendados), facilitando la reproducibilidad en laboratorios sin GPUs dedicadas.
- Integracion en herramientas de linea de comandos o asistentes locales: al ser GGUF compatible con llama.cpp, puede incrustarse en scripts y aplicaciones de escritorio que requieran generacion de texto sin dependencias externas.
- Distribucion en entornos air-gapped: al no requerir conexion, encaja en despliegues con restricciones de red, siempre que se preparen previamente los ficheros GGUF y el lanzador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de lenguaje Q4_K_M ocupa 5,66 GB; el encoder multimodal F32 anade 0,91 GB, por lo que el conjunto completo ronda los 6,6 GB de pesos. La VRAM necesaria depende del contexto y del backend, pero no se han publicado cifras exactas.
- RAM recomendada: 16 GB como punto de partida segun el autor; la operacion con 8 GB no esta validada.
- GPU recomendadas: no se especifican modelos concretos. El autor indica que la aceleracion de GPU integrada es compatible y que no se requiere GPU dedicada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los pesos, aunque no se han publicado mediciones por modelo de GPU.
- Opciones de despliegue: llama.cpp (fork compatible con Apertus), lanzador nativo de apertus-local para Windows, macOS Apple Silicon y Linux. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que no hay resultados medidos de rendimiento en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Apertus-v1.5-8B-GGUF (esta ficha) | 8,6 B | no disponible | Texto, imagen, audio (entrada) | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M altera las salidas respecto al modelo original; el autor recomienda verificar la idoneidad para cada tarea.
- El fichero de lenguaje por si solo no procesa imagenes ni audio; se requiere descargar tambien el encoder F32.
- Los tokenizers del modelo original son sensibles a la precision, motivo por el que el encoder se distribuye en F32; no se recomienda cuantizarlo.
- La operacion con 8 GB de RAM no esta validada; 16 GB es el minimo recomendado por el autor.
- No hay mediciones de rendimiento publicadas en Apple Silicon.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni cobertura idiomatica.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse la atribucion y los avisos del modelo original que acompanan a la distribucion.
- El soporte de tool calling, agentes y razonamiento multi-paso no esta documentado en la informacion disponible.
- La fecha de creacion del repositorio (2026-11-07) es posterior a la actual, lo que puede indicar un error en los metadatos de la plataforma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Repositorio de conversion y runtime: https://github.com/FarukZahiragic/apertus-local
- Pagina de descarga de la aplicacion nativa: https://huggingface.co/spaces/faruk-zahiragic/apertus-local
