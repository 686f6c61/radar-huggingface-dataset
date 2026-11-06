# JoshHughes/gemma4-e2b-q4-lma

## Resumen

Gemma 4 E2B-it es un modelo multimodal de Google (entrada de imagen y texto, salida de texto) publicado bajo licencia Apache 2.0. Esta ficha concreta, `JoshHughes/gemma4-e2b-q4-lma`, no es un checkpoint nuevo ni un fine-tuning: es un reempaquetado del modelo cuantizado del proyecto p0pc0rn en un unico fichero safetensors de 3,3 GB, pensado para ejecutarse en el navegador mediante WebGPU a traves del motor Local Model Access (LMA) del artista Josh Hughes.

El objetivo es el despliegue on-device sin servidor: el usuario descarga el fichero una vez en su dispositivo (por ejemplo, en la carpeta Downloads de un iPhone via Safari) y cualquier pagina web que use LMA y apruebe ese fichero lo reutiliza, verificandolo por su hash sha256 sin subir ni copiar datos. Esto lo hace relevante para aplicaciones web privadas que necesitan inferencia multimodal local en hardware de consumo.

La cuantizacion es mixta: MLPs del modelo de lenguaje en 4 bits GPTQ con grupos de 32, atencion, gates, proyecciones por capa, torre de vision y las MLPs de las capas 4, 6, 12 y 13 en 8 bits, embeddings en 4 bits y normas en f32. No es un checkpoint compatible con Transformers: requiere el motor de LMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E2B-it; transformer multimodal con torre de vision, segun la estructura de cuantizacion descrita) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 4 bits GPTQ (grupos de 32) en MLPs del LM y embeddings; 8 bits en atencion, gates, proyecciones por capa, MLPs de capas 4, 6, 12 y 13 y torre de vision; f32 en normas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (licencia de Gemma 4, no los Gemma Terms of Use) |
| Formato de pesos | safetensors con formato interno `pocketflux.pack/1` (93 tensores U8 de una dimension, metadatos del manifiesto en el campo `pocketflux.pack`); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E2B-it` en su revision `3e22461f65e89153144f8adb70e3b8c2cc9845a7`, un modelo instruction-tuned de Google con capacidad de entrada de imagen y texto. No se dispone en la informacion proporcionada de detalles sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de este artefacto es el empaquetado: el fichero contiene byte a byte el source pack `JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4` (revision `141f0e8665691d74f824c4469725cf19a2ded9e8`, manifiesto sha256 `e34bc23f7aa8c17244b53068e402a55fbc0ec68fb989b42e2615c7439d792178`) reorganizado en un unico safetensors. Cada uno de los 93 ficheros del pack se convierte en un tensor `U8` unidimensional nombrado `pack:` + nombre del shard, con los bytes intactos; el manifiesto va en los metadatos y los datos comienzan en un limite de 4 KiB. El layout esta especificado en LMA SPEC.md §2.2 y generado con `tools/pack_to_safetensors.py`. El tokenizer es el de Gemma 4 en forma compacta, con la plantilla de chat verbatim. En una GPU de escritorio, este fichero y el source pack producen logits identicos bit a bit.

## Capacidades

- Generacion de texto y respuesta a preguntas a partir de entradas de texto.
- Comprension de imagenes (pipeline `image-text-to-text`): descripcion, respuesta a preguntas visuales y conversacion sobre imagenes.
- Conversacion multi-turno con plantilla de chat de Gemma 4 incluida.
- Ejecucion local en el navegador mediante WebGPU, con lectura del fichero por slices desde la copia del visitante.
- Verificacion de integridad por sha256 del fichero antes de su uso.
- Soporte de tool calling, function calling, agentes, modo thinking o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual en una pagina web estatica: el usuario descarga el fichero una vez y la pagina procesa imagenes localmente con WebGPU, sin enviar capturas a ningun servidor; adecuado por privacidad y por el tamano contenido del fichero (3,3 GB).
- Descripcion de imagenes para accesibilidad: una extension o pagina puede generar texto alternativo de imagenes subidas por el usuario directamente en el dispositivo, evitando costes de API y latencia de red.
- Clasificacion y extraccion de informacion de documentos escaneados o fotos: el modelo recibe la imagen y responde con campos estructurados en texto, todo dentro del navegador.
- Demos educativas de IA on-device: util para talleres y articulos que muestran inferencia multimodal sin backend, aprovechando que el fichero se comparte entre paginas LMA que lo aprueban.
- Prototipado rapido de interfaces multimodales: desarrolladores que quieran validar una UX de chat con imagenes antes de invertir en infraestructura de servidor.
- Aplicaciones de campo o con conectividad limitada: una vez descargado el fichero, la inferencia no requiere red, lo que encaja en escenarios de uso movil o entornos aislados.
- Evaluacion de cuantizacion mixta 4/8 bits: referencia practica para comparar calidad frente al modelo original de Google en tareas de vision y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica afirmacion de rendimiento verificable es la equivalencia bit a bit de logits con el source pack en GPU de escritorio; no se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero de pesos ocupa 3.263.162.540 bytes (3,3 GB), por lo que se necesita al menos esa cantidad de memoria mas el espacio de activaciones y buffers del motor.
- GPU recomendadas: no disponible. El motor LMA esta disenado para WebGPU, lo que incluye GPUs integradas y dedicadas con soporte WebGPU en navegadores modernos.
- Cabe en GPU de consumo: si, en principio, dado el tamano del fichero; no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: motor LMA (`lma/engine/`) sobre WebGPU. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| JoshHughes/gemma4-e2b-q4-lma | no disponible | no disponible | safetensors `pocketflux.pack/1` | Apache 2.0 | LMA / WebGPU |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (Transformers) | Apache 2.0 | Transformers, vLLM, TGI, etc. |
| JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4 | no disponible | no disponible | source pack de 93 ficheros | Apache 2.0 | LMA / WebGPU |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento ni de arquitectura de modelos alternativos. La diferencia practica entre las tres entradas es el empaquetado y el motor de ejecucion, no los pesos.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no puede cargarse con `from_pretrained` ni con los servidores de inferencia habituales; requiere el motor LMA.
- La cuantizacion mixta 4/8 bits puede degradar la calidad respecto al modelo original de Google, especialmente en tareas de razonamiento o vision exigentes; no se aportan evaluaciones que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en el caso de imagenes, puede describir elementos no presentes.
- Idiomas soportados no documentados en esta ficha; no se garantiza un comportamiento correcto en castellano.
- El fichero se verifica por sha256, pero el usuario debe obtenerlo de una fuente fiable; una copia manipulada no seria aceptada por LMA si el hash no coincide, siempre que la pagina compruebe el hash esperado.
- Licencia Apache 2.0 segun la model card, con la salvedad de que "Gemma" es marca registrada de Google y de que el aviso de licencia enlaza a la pagina de licencia de Gemma 4; conviene revisar `LICENSE` y `NOTICE.md` del repositorio antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- El rendimiento depende del soporte WebGPU del navegador y del dispositivo; no se documentan dispositivos probados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoshHughes/gemma4-e2b-q4-lma
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Source pack: https://huggingface.co/JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4
- Proyecto Local Model Access: https://github.com/ArtistJoshHughes/local-model-access
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
