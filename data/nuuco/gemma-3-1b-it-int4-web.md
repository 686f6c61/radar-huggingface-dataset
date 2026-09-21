# nuuco/gemma-3-1b-it-int4-web

## Resumen

`nuuco/gemma-3-1b-it-int4-web` es un repositorio de redistribucion que aloja un unico artefacto de inferencia para navegador: `gemma3-1b-it-int4-web.task`, de aproximadamente 700 MB. No es un modelo entrenado ni ajustado por el autor, sino una copia sin modificar del build web (WebGPU) de MediaPipe / LiteRT publicado originalmente por `litert-community/Gemma3-1B-IT`, a su vez derivado de `google/gemma-3-1b-it` (Gemma 3 1B Instruct, de Google DeepMind).

El interes de este repositorio es acotado pero concreto: permite ejecutar un LLM de 1.000 millones de parametros cuantizado a int4 directamente en el navegador mediante WebGPU, sin enviar el texto del usuario a un servidor. El autor lo publica para la aplicacion web Lastly, que analiza en el dispositivo frases cortas en coreano de registro domestico (nombre de articulo, fecha, intervalo) y devuelve una sugerencia que el usuario debe confirmar antes de guardar.

Se trata, por tanto, de un artefacto de despliegue en el cliente, no de un modelo de proposito general. La model card es explicita: no esta pensado como chatbot general, ni como API alojada, ni como sustituto de asesoramiento profesional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las unicas variantes incluidas son la web (WebGPU); no hay builds para CPU ni Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 3 1B); artefacto empaquetado para MediaPipe / LiteRT LLM Inference |
| Parametros totales | 1.000 millones aproximadamente (1B, segun el modelo base `google/gemma-3-1b-it`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens segun la documentacion del modelo base Gemma 3 1B; no se especifica en este repositorio |
| Tipos de cuantizacion | int4 (pesos a 4 bits en el artefacto web); no se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible en la ficha del repositorio; el uso previsto declarado trabaja con frases cortas en coreano dentro de la app Lastly |
| Licencia | Gemma Terms of Use (identificador `gemma`) |
| Formato de pesos | `.task` (LiteRT / MediaPipe LLM Inference); no safetensors, no GGUF, no PyTorch |
| Tamano del artefacto | ~700 MB (`gemma3-1b-it-int4-web.task`) |
| Tamano del repositorio | 0,7 GB |
| Libreria declarada | mediapipe |
| Pipeline | text-generation |
| Backend de ejecucion | WebGPU (Chrome o Safari 26+) |
| Fecha de creacion / actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

Este repositorio no aporta informacion sobre el entrenamiento: el autor declara explicitamente que no ha hecho fine-tuning, cuantizacion, conversion ni ninguna otra modificacion del fichero. El artefacto es una redistribucion literal del build web publicado por `litert-community/Gemma3-1B-IT`. Cualquier dato de composicion del dataset, numero de tokens, fases de post-entrenamiento (SFT, RLHF, DPO) o innovaciones de atencion debe consultarse en la model card oficial de `google/gemma-3-1b-it`, que el propio repositorio enlaza; en la informacion disponible aqui no se detalla ninguno de esos puntos.

Lo relevante desde el punto de vista tecnico es el formato de empaquetado. El fichero `.task` es un contenedor de LiteRT (antes TensorFlow Lite) para la API MediaPipe LLM Inference, con los pesos cuantizados a int4 y un grafo de ejecucion optimizado para WebGPU. Esto implica que el modelo no se carga con `transformers`, `vLLM` ni `llama.cpp`, sino a traves del runtime de MediaPipe en el navegador, y que la ruta de decodificacion y el manejo de KV cache quedan encapsulados dentro del artefacto, fuera del control del usuario. El autor tampoco documenta tecnicas concretas de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Generacion de texto autoregresiva e instrucciones en el navegador, con pesos int4 y ejecucion sobre WebGPU.
- Extraccion de campos estructurados a partir de enunciados cortos: el caso declarado es identificar nombre de articulo, fecha e intervalo en frases de registro domestico en coreano.
- Salida tratada como sugerencia: el flujo previsto obliga a confirmacion humana antes de guardar el resultado.
- Inferencia 100 % en el dispositivo: el texto del usuario no se envia a ningun servidor a traves de este artefacto.
- Ejecucion en cliente web sin backend, sin instalacion y sin dependencias de CUDA.
- Soporte multilingue: no disponible en la informacion del repositorio; depende de las capacidades del Gemma 3 1B base, que no se detallan aqui.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo agente o razonamiento multi-paso: no documentado; el caso de uso declarado es una unica pasada de extraccion corta.
- Vision, audio o cualquier otra modalidad: no disponible en este artefacto.

## Casos de uso

- Registro domestico asistido en el navegador: la app Lastly usa el modelo para parsear frases cortas en coreano (que articulo, que fecha, cada cuanto tiempo) y proponer una entrada estructurada; es el escenario para el que se publico el repositorio.
- Extraccion de entidades en cliente con requisitos de privacidad: cualquier formulario web que necesite convertir texto libre en campos estructurados sin que el contenido salga del dispositivo, por ejemplo notas de gastos o inventario domestico.
- Preprocesado local antes de un modelo mayor: normalizar, resumir o clasificar entradas breves en el navegador y enviar al servidor unicamente el texto ya depurado, reduciendo coste de tokens y exposicion de datos.
- Demostraciones y prototipos web sin infraestructura: validar una idea de producto con un LLM embebido en una pagina estatica, sin desplegar GPU ni endpoints.
- Normalizacion de fechas e intervalos: convertir expresiones coloquiales ("cada dos semanas", "el martes que viene") en valores canonicos para un calendario o una base de datos, con confirmacion del usuario.
- Educacion y talleres sobre WebGPU: servir como ejemplo reproducible de carga de un artefacto MediaPipe `.task` y ejecucion de inferencia int4 en el navegador, incluyendo la medicion de tiempos de primera carga y de generacion.
- Escenarios sin conectividad o en modo avion: aplicaciones de campo, kioscos o entornos con red restringida donde no se puede depender de una API remota.
- Clasificacion ligera en el borde: etiquetado de texto corto (categoria, urgencia, tipo de incidencia) directamente en el cliente, siempre asumiendo la tasa de error propia de un modelo de 1B cuantizado a int4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el autor remite a la model card de `google/gemma-3-1b-it` para datos de evaluacion. Tampoco se publican mediciones de latencia, tokens por segundo ni consumo de memoria del artefacto web, mas alla del tamano del fichero (~700 MB) y de la indicacion cualitativa de que la calidad y la velocidad difieren del checkpoint BF16 completo.

## Requisitos de hardware

- VRAM / memoria: el artefacto pesa ~700 MB en disco; en ejecucion hay que sumar pesos desempaquetados, KV cache y buffers de WebGPU. No se publica una cifra oficial; como orden de magnitud, conviene reservar entre 1 y 2 GB de memoria grafica o de memoria unificada para un contexto corto.
- GPU: cualquier GPU integrada o dedicada expuesta por WebGPU en el navegador. No se documentan modelos concretos de GPU recomendados.
- GPU de centro de datos (A100, H100, RTX 4090): no aplica a este artefacto, que esta empaquetado para WebGPU y no para CUDA ni para runtimes de servidor.
- GPU de consumo: si, es el objetivo del build. Funciona en portatiles y equipos de escritorio con WebGPU disponible.
- Navegadores compatibles: Chrome con WebGPU habilitado, o Safari 26+ segun la propia model card.
- Opciones de despliegue: MediaPipe LLM Inference API en web, cargando el fichero `.task` desde una URL directa. No hay soporte para vLLM, TGI, llama.cpp u Ollama, porque el repositorio no contiene safetensors ni GGUF. Existen otras conversiones del modelo base fuera de este repositorio, pero no forman parte de el.
- Variantes para CPU o Android: no incluidas; el autor indica explicitamente que los `.task` de CPU y Android no estan en este repositorio.
- Latencia y throughput: no disponible. Dependera del equipo, del navegador, del driver y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nuuco/gemma-3-1b-it-int4-web` | ~1B | 32.768 tokens (modelo base; no confirmado en el repo) | `.task` int4 | MediaPipe / LiteRT + WebGPU | Gemma Terms of Use | Repositorio publico, artefacto de ~700 MB |
| `google/gemma-3-1b-it` | ~1B | 32.768 tokens | safetensors BF16 | PyTorch / transformers, GPUs CUDA | Gemma Terms of Use | Repositorio oficial |
| `litert-community/Gemma3-1B-IT` | ~1B | no disponible en esta informacion | `.task` LiteRT | MediaPipe / LiteRT (variantes web y otras) | Gemma Terms of Use | Repositorio de la comunidad LiteRT |
| Llama 3.2 1B Instruct | ~1B | 128.000 tokens | safetensors, GGUF | transformers, llama.cpp, Ollama | Llama 3.2 Community License | Amplia distribucion |

No hay datos comparativos de rendimiento entre estas opciones en la informacion disponible. La diferencia relevante no es de calidad, sino de formato y destino: este repositorio existe unicamente para llevar Gemma 3 1B a un navegador con WebGPU, mientras que las alternativas se orientan a servidor, escritorio o movil.

## Limitaciones y advertencias

- Modelo de 1B parametros: la propia model card advierte que las respuestas pueden ser incorrectas. La app para la que se publico trata la salida como sugerencia y exige confirmacion del usuario.
- Cuantizacion int4: la calidad y la velocidad difieren del checkpoint BF16 completo. No se publican mediciones del degradado.
- Dependencia de WebGPU: solo funciona en navegadores con WebGPU (Chrome, o Safari 26+). No hay ruta de fallback a CPU ni variante Android en este repositorio.
- Ambito funcional estrecho: no esta pensado como chatbot general, ni como API alojada, ni como sustituto de asesoramiento profesional. El caso declarado es la extraccion de campos en frases cortas.
- Idiomas: no se documenta la cobertura linguistica de este artefacto. El uso previsto declarado trabaja con coreano; para otros idiomas no hay garantias publicadas.
- Alucinacion: inherente a un modelo de este tamano y a la cuantizacion. En extraccion de campos, esto puede traducirse en fechas o intervalos inventados, de ahi la confirmacion obligatoria.
- Sesgos: no hay informacion sobre sesgos en este repositorio; dependen del dataset de entrenamiento del modelo base, documentado en la model card de Gemma 3.
- Licencia y uso comercial: el artefacto se rige por los Gemma Terms of Use. Se prohibe el uso recogido en la Gemma Prohibited Use Policy y cualquier uso contrario a la legislacion aplicable. Google no respalda este repositorio ni la app Lastly, y no se conceden derechos sobre marcas de Google.
- Obligaciones de redistribucion: quien distribuya este fichero o un derivado debe propagar las restricciones de la seccion 3.2 de los terminos, entregar copia de los Gemma Terms of Use, marcar los ficheros modificados e incluir un fichero `NOTICE` con la frase indicada en la model card.
- Trazabilidad: al tratarse de una redistribucion sin modificar, los problemas del artefacto original se heredan tal cual; el autor de este repositorio no ofrece soporte ni mantenimiento.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay senales de mantenimiento continuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nuuco/gemma-3-1b-it-int4-web
- Fichero del artefacto (URL directa): https://huggingface.co/nuuco/gemma-3-1b-it-int4-web/resolve/main/gemma3-1b-it-int4-web.task
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Artefacto original de LiteRT: https://huggingface.co/litert-community/Gemma3-1B-IT
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Aplicacion Lastly: https://lastly-goorm.vercel.app
- Nota sobre la busqueda web: los resultados devueltos corresponden a un foro de soporte de ELSTER y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
