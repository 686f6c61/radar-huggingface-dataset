# RASMUS/MiniCPM-V-4.7-1B-ONNX

## Resumen

RASMUS/MiniCPM-V-4.7-1B-ONNX es una conversión a formato ONNX del modelo multimodal openbmb/MiniCPM-V-4.7-1B, publicada por el usuario RASMUS para ejecutar sesiones de ONNX Runtime Web sobre WebGPU directamente en el navegador (concretamente en la aplicación chatxpu.ai). No es un modelo nuevo: conserva los pesos y la licencia Apache-2.0 del modelo original, pero reorganiza el grafo en tres sesiones independientes (embed_tokens, vision_encoder y decoder_model_int8) con el objetivo de que el pipeline completo funcione en el cliente sin backend de servidor.

El interés de esta ficha no está en el modelo base, sino en el trabajo de exportación y cuantización: el decodificador de 24 capas (6 de atención completa y 18 de atención lineal) se ha compilado con onnxruntime-genai 0.15.2 como modelo de texto tipo Qwen3.5, con pesos int8 y con los 187 nodos MatMulNBits forzados a accuracy_level=0 para reducir el error de la cuantización sin coste adicional en tiempo de decodificación. El codificador de visión mantiene pesos fp16 pero cálculo fp32, lo que rebaja el error relativo a 8e-6 frente al grafo fp32 de referencia.

La relevancia práctica es doble: por un lado demuestra que un VLM de aproximadamente 1.000 millones de parámetros puede caber y funcionar en un navegador con WebGPU (2,5 GB de repositorio, unas 2,36 GiB de pesos repartidas en los tres ficheros ONNX); por otro, documenta con medidas reales los compromisos de precisión y latencia de esa ruta, algo poco habitual en publicaciones de conversiones ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer híbrido con 24 capas (6 de atención completa y 18 de atención lineal con estado convolucional y recurrente) más codificador de visión; exportado a ONNX en tres sesiones separadas |
| Parametros totales | Aproximadamente 1.000 millones (según la denominación del modelo; el desglose exacto no está disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (embed_tokens), fp16 con cálculo fp32 (vision_encoder), int8 (decoder_model_int8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con ficheros `_data` externos; no compatible con Transformers.js |
| Tamano del repositorio | 2,5 GB (embed_tokens 485 MiB, vision_encoder 1046 MiB, decoder_model_int8 827 MiB) |
| Dimension oculta | 1024 |
| Tamano de vocabulario | 248.094 tokens |
| Modelo base | openbmb/MiniCPM-V-4.7-1B (revision 6fde9ecee3e59c4b0ce555a9c774e179d46d19cc) |
| Entradas de vision | `pixel_values [1, 3, H, W]` en fp32 y `position_ids [h·w]` en int64 |
| Salida de vision | `image_embeds [h·w/16, 1024]` (reduccion espacial de 16x) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de openbmb/MiniCPM-V-4.7-1B. Lo que sí detalla esta conversión es la estructura del grafo exportado. El decodificador tiene 24 capas: 6 de atención completa con caché `past_key_values.N.key/value` y 18 de atención lineal con dos estados, `past_key_values.N.conv_state` y `past_key_values.N.recurrent_state`. Se compiló con onnxruntime-genai 0.15.2 (`-e webgpu -p int8`) tomando como base el `text_config` de MiniCPM y tratándolo como modelo de texto Qwen3.5.

El codificador de visión procesa una llamada de sesión por recorte: primero la miniatura y después cada slice. Los `position_ids` son los identificadores de parche del bucket más cercano de una tabla de posiciones de 70×70 (esquema M-RoPE sobre lienzo). Los píxeles se redimensionan con interpolación bicúbica con antialiasing y se normalizan como `(v/255 − 0,5)/0,5`. La innovación técnica más destacable es el ajuste de precisión del decodificador: los 187 nodos `MatMulNBits` se fijaron a `accuracy_level=0`, lo que eliminó la mayor parte del error de las multiplicaciones int8 sin penalizar el tiempo de decodificación. Con el valor por defecto del compilador (`accuracy_level=4`) la divergencia KL media subía de 0,00076 a 0,0092 y el acierto top-1 bajaba de 15/15 a 14/15. En visión, usar matemática fp32 sobre pesos fp16 da un error relativo de 8e-6 frente al grafo fp32, mientras que la matemática fp16 completa dispara el error a 0,20 y por eso se descarta.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto (`image-text-to-text`) a partir de imágenes y prompts conversacionales.
- Procesamiento de imágenes por troceado: miniatura más slices, con rejilla de posiciones M-RoPE sobre lienzo, lo que permite resolver detalles en recortes concretos.
- Conversación multi-turno mediante la plantilla de chat copiada del repositorio original.
- Preprocesado de imagen integrado en el propio grafo: redimensionado bicúbico con antialiasing y normalización a rango [−1, 1].
- Ejecución íntegra en cliente sobre WebGPU, sin llamadas a un servidor de inferencia.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta un modo de razonamiento extendido (thinking mode), visión más allá de imagen estática, ni entrada de audio.
- El soporte multilingüe no está declarado en la información disponible.

## Casos de uso

- Chat multimodal en el navegador: el modelo puede gestionar conversaciones con imágenes adjuntas ejecutándose en una sesión ONNX Runtime Web sobre WebGPU, sin desplegar infraestructura de servidor ni enviar los datos del usuario a terceros.
- Asistentes de accesibilidad: descripción automática de imágenes y generación de texto alternativo en el propio dispositivo, con un coste de visión de 54-59 ms por recorte de 448×448, adecuado para respuestas interactivas.
- Análisis de documentos y capturas en local: al no requerir backend, encaja en aplicaciones de escritorio o web que procesan recibos, facturas o capturas de pantalla manteniendo los datos dentro del cliente.
- Moderación y clasificación de contenido visual: el modelo puede generar descripciones normalizadas que un sistema posterior use como señal para etiquetar o filtrar imágenes en pipelines de contenido generado por usuarios.
- Soporte al cliente con adjuntos: conversaciones multi-turno en las que el usuario aporta una foto (producto dañado, error en pantalla) y el modelo mantiene el hilo usando la plantilla de chat original.
- Herramientas educativas interactivas: resolución de dudas sobre diagramas, pizarras o figuras fotografiadas, con la ventaja de que la inferencia ocurre en el equipo del estudiante y no consume cuota de API.
- Extracción de información de capturas de interfaz: lectura de elementos visibles en pantallas de aplicaciones para generar resúmenes o instrucciones paso a paso en herramientas de soporte técnico.
- Aplicaciones de bajo consumo en equipos con GPU integrada: con unas 2,36 GiB de pesos int8/fp16, el modelo es candidato para portátiles y equipos sin GPU dedicada de gama alta, siempre que WebGPU esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Lo que si se publica son mediciones de fidelidad y velocidad del pipeline completo, tomadas el 2026-10-16 en una RTX 4080 con Chrome 155 y ORT Web 1.29.0:

| Metrica | Valor | Condiciones |
|---|---|---|
| Divergencia KL media (cadena completa en WebGPU) | 0,00076 | Teacher-forced frente a Hugging Face fp32, una imagen real |
| Divergencia KL maxima | 0,0028 | Misma prueba |
| Acierto top-1 | 15/15 | Misma prueba |
| Divergencia KL media con `accuracy_level=4` | 0,0092 | Acierto top-1 14/15 |
| Error relativo del codificador de vision | 8e-6 | Pesos fp16 con matematica fp32 frente a grafo fp32 |
| Error relativo con matematica fp16 completa | 0,20 | Descartado |
| Velocidad de decodificacion | 45-47 ms por token | WebGPU |
| Velocidad de prefill | 0,18 ms por token de prompt | Medido a 1024 tokens |
| Velocidad de vision | 54-59 ms por recorte de 448×448 | WebGPU |

## Requisitos de hardware

- VRAM estimada: unos 2,36 GiB solo en pesos (485 MiB de embed_tokens, 1046 MiB de vision_encoder y 827 MiB de decoder int8), a los que hay que sumar la cache KV de las 6 capas de atencion completa, los estados de las 18 capas lineales y las activaciones. En la practica, un presupuesto de 3-4 GB es razonable, aunque el dato exacto no esta publicado.
- Cabe en GPU de consumo: el modelo se midio en una RTX 4080 y, por tamano de pesos, es viable en tarjetas de 6-8 GB o superiores. No se han publicado pruebas en GPUs integradas.
- GPU recomendadas: RTX 4080 (medida oficialmente). No hay datos publicados para A100, H100, RTX 4090 ni otras tarjetas.
- Navegador: requiere WebGPU (medido con Chrome 155). El autor indica que no es un modelo de Transformers.js y que hace falta un pipeline propio (troceado de imagen, plantilla de prompt, preprocesado de pixeles, posiciones M-RoPE y bucle de decodificacion).
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU, con el decodificador construido con onnxruntime-genai 0.15.2. No consta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete ONNX.
- Latencia y throughput: aproximadamente 45-47 ms por token de decodificacion (del orden de 21-22 tokens por segundo) y 0,18 ms por token de prefill a 1024 tokens en la RTX 4080 de referencia. Estas cifras corresponden a un unico equipo y el autor advierte que no son extrapolables a otro hardware.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables (conversiones ONNX de VLM de ~1B para WebGPU) en la informacion proporcionada. La unica comparacion posible es con el modelo del que derivan los pesos:

| Aspecto | RASMUS/MiniCPM-V-4.7-1B-ONNX | openbmb/MiniCPM-V-4.7-1B |
|---|---|---|
| Formato | ONNX con ficheros `_data` | No disponible |
| Cuantizacion | fp16 (embed), fp16 con calculo fp32 (vision), int8 (decoder) | No disponible |
| Ejecucion en navegador | Si, via ONNX Runtime Web y WebGPU | No documentada |
| Compatibilidad con Transformers.js | No | No aplica |
| Licencia | Apache-2.0 | Apache-2.0 (heredada) |
| Parametros | ~1.000 millones | ~1.000 millones |
| Contexto | No disponible | No disponible |
| Benchmarks publicados | Solo fidelidad y velocidad de la conversion | No disponibles en esta informacion |

## Limitaciones y advertencias

- El decodificador esta cuantizado a int8. La perdida de precision se mitiga con `accuracy_level=0`, pero sigue existiendo: la divergencia KL media frente al modelo fp32 es de 0,00076, no de cero.
- La validacion de fidelidad se hizo con una sola imagen real y 15 posiciones top-1. Es una evidencia muy limitada y no permite generalizar el comportamiento a otras entradas.
- El estado convolucional de las capas de atencion lineal no se puede rebobinar. Cualquier flujo que necesite retroceder en la decodificacion, ramificar o reutilizar estados parciales queda bloqueado por este diseno.
- No es un modelo de Transformers.js: no hay tipo de modelo MiniCPM-V en esa libreria y el decodificador usa nombres de cache de onnxruntime-genai. Integrarlo exige implementar el pipeline completo a mano.
- Las mediciones de latencia y precision provienen de un unico equipo (RTX 4080, Chrome 155, ORT Web 1.29.0) y el propio autor advierte que no garantizan el mismo comportamiento en otro hardware.
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o tasa de alucinacion para esta conversion ni para el modelo base en la informacion disponible.
- No hay informacion sobre idiomas soportados, por lo que no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Licencia Apache-2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y se indiquen los cambios realizados. Conviene ademas revisar los terminos y la licencia del modelo base original antes de distribuirlo en produccion.
- La ausencia de resultados en benchmarks estandar dificulta comparar su calidad con alternativas de tamano similar; cualquier decision de adopcion deberia apoyarse en una evaluacion propia sobre el caso de uso concreto.

## Enlaces

- Repositorio ONNX: https://huggingface.co/RASMUS/MiniCPM-V-4.7-1B-ONNX
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Revision concreta usada en la conversion: `6fde9ecee3e59c4b0ce555a9c774e179d46d19cc`
- Aplicacion que consume el modelo: https://chatxpu.ai
- Herramienta de compilacion del decodificador: onnxruntime-genai 0.15.2 (no se proporciona URL en la informacion disponible)
