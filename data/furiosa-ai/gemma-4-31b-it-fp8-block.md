# furiosa-ai/gemma-4-31B-it-FP8-block

## Resumen

gemma-4-31B-it-FP8-block es una distribución cuantizada del modelo multimodal Gemma 4 31B de Google, publicada por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores RNGD con el runtime Furiosa-LLM. El modelo original es un transformer denso que combina un codificador de visión con un decodificador que intercala capas de atención de ventana deslizante y de atención completa, y su plantilla de chat admite razonamiento opcional y llamada a herramientas. La build de Red Hat AI aplica cuantización FP8 por bloques a las capas lineales del transformer de texto.

El interés de esta ficha concreta es doble: por un lado documenta una ruta de despliegue en hardware no NVIDIA (RNGD de FuriosaAI, con paralelismo tensorial de 32 PEs repartidos en cuatro tarjetas), y por otro sirve como referencia de una cuantización FP8 con bloques de 128×128 en pesos y grupos de 128 valores en activaciones, con torre de visión, embeddings, cabeza de salida y caché KV en 16 bits.

Con 31.273.088.876 parámetros y un repositorio de 53,9 GB, está pensado para servir cargas multimodales de imagen y texto con API compatible con OpenAI, y su licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia específica de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 densa; codificador de visión más decodificador transformer con capas alternas de atención de ventana deslizante y atención completa |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 con bloques de 128×128 en pesos de capas lineales del transformer de texto; activaciones cuantizadas dinámicamente a FP8 en grupos de 128 sin calibración offline; torre de visión, embeddings, cabeza de salida y caché KV en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors) más Furiosa Executable Bundle (FXB) |
| Entrada / salida | imagen y texto / texto |
| Librería | furiosa-llm |
| Hardware soportado | FuriosaAI RNGD |
| Paralelismo | tensor-parallel de 32 PEs, equivalente a cuatro tarjetas RNGD (8 PEs por tarjeta) |
| Modelo base | RedHatAI/gemma-4-31B-it-FP8-block |
| Tamaño del repositorio | 53,9 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 4 en variante densa: un codificador de visión acoplado a un decodificador transformer que intercala capas de atención de ventana deslizante con capas de atención completa, un patrón híbrido que reduce el coste computacional en secuencias largas manteniendo acceso global periódico al contexto. La model card no detalla el número de capas, dimensiones ocultas ni cabezas de atención, ni tampoco el volumen o composición de los datos de entrenamiento, por lo que esos datos figuran como no disponibles.

La contribución técnica de esta build es la cuantización: Red Hat AI aplica cuantización estática FP8 con bloques de 128×128 a los pesos de los operadores lineales del transformer de texto, mientras que las activaciones de entrada se cuantizan dinámicamente a FP8 en tiempo de ejecución en grupos de 128 valores, sin calibración offline. La torre de visión, los embeddings, la cabeza de salida y la caché KV permanecen en 16 bits, lo que preserva la calidad en las partes más sensibles del pipeline multimodal. El paquete se distribuye en formato compressed-tensors, consumible por vLLM, SGLang y Transformers, además del bundle FXB específico para RNGD. No se especifican en la información disponible detalles sobre RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto conversacional con plantilla de chat de instrucciones (`-it`).
- Comprensión de imágenes: acepta entradas de tipo `image_url` con URL remota, base64 en línea o ruta local `file://` (esta última requiere `--allowed-local-media-path`).
- Razonamiento opcional mediante `enable_thinking` en `chat_template_kwargs`; por defecto está desactivado y el modelo opera en modo no razonador.
- Separación del razonamiento y la respuesta final: el servidor devuelve el razonamiento en `response.choices[].message.reasoning` (no streaming) o `response.choices[].delta.reasoning` (streaming) mediante el parser `gemma4`.
- Llamada a herramientas nativa: formato de tool call propio, soportado por el parser `gemma4` y activable con `--enable-auto-tool-choice --tool-call-parser gemma4`.
- API compatible con OpenAI, lo que facilita la integración con clientes existentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio ni de salida multimodal distinta de texto.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla, fotos de producto o documentos escaneados junto con la consulta del usuario y responder en texto, usando el mismo endpoint compatible con OpenAI que ya emplea el resto del stack.
- Automatización de soporte técnico con razonamiento controlado: activando `enable_thinking` solo en las consultas que lo requieran, se obtiene una traza de razonamiento separada del texto final, útil para auditar decisiones sin exponerla al usuario.
- Agentes con tool calling: gracias al formato nativo de función y a `--enable-auto-tool-choice`, el modelo puede encadenar llamadas a APIs internas (consulta de pedidos, estado de tickets, cálculo de tarifas) dentro de un bucle agéntico multi-paso.
- Procesamiento de documentos con imagen: extracción y descripción de información a partir de fotografías o escaneos, con la torre de visión en 16 bits para preservar detalle en la codificación visual.
- Despliegue en infraestructura no NVIDIA: el bundle FXB permite servir el modelo en cuatro aceleradores RNGD con paralelismo tensorial de 32 PEs, una alternativa relevante cuando el clúster no dispone de GPUs de gran formato.
- Evaluación y prototipado de cuantización FP8: al estar disponible también para vLLM, SGLang y Transformers a través del modelo base de Red Hat AI, sirve para medir la degradación de calidad frente a la versión en 16 bits antes de fijar una configuración de producción.
- Generación de descripciones y etiquetado de imágenes a escala: el pipeline `image-text-to-text` permite procesar lotes de imágenes para generar metadatos, alt-text o clasificaciones descriptivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 53,9 GB en FP8, por lo que la inferencia requiere al menos ese orden de magnitud de memoria de acelerador, más espacio para caché KV en 16 bits y activaciones; el valor exacto no está disponible.
- GPU recomendadas: la información proporcionada no incluye GPUs NVIDIA; la ruta oficial documentada es FuriosaAI RNGD con cuatro tarjetas y tensor-parallel de 32 PEs.
- GPU de consumo: no disponible; no se documenta compatibilidad con tarjetas consumer en esta build.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve furiosa-ai/gemma-4-31B-it-FP8-block`), con parsers `gemma4` para razonamiento y tool calling. Para vLLM, SGLang y Transformers debe usarse el modelo base RedHatAI/gemma-4-31B-it-FP8-block.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| furiosa-ai/gemma-4-31B-it-FP8-block | 31,27 B (denso) | no disponible | imagen + texto → texto | FP8 block 128×128 | apache-2.0 | Hugging Face, runtime Furiosa-LLM sobre RNGD |
| RedHatAI/gemma-4-31B-it-FP8-block | 31,27 B (denso) | no disponible | imagen + texto → texto | FP8 block 128×128 | apache-2.0 | Hugging Face, vLLM / SGLang / Transformers |
| Gemma 4 31B it (upstream Google) | 31 B (denso) | no disponible | imagen + texto → texto | 16 bits | licencia Gemma 4 | Hugging Face |

La diferencia principal entre las tres entradas no es de arquitectura ni de parámetros, sino de empaquetado y runtime: la build de FuriosaAI añade el bundle FXB y el soporte de parsers de Furiosa-LLM, la de Red Hat AI es la referencia portable para frameworks estándar y la de Google es el original sin cuantizar. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre ellas.

## Limitaciones y advertencias

- No se han publicado datos de sesgos, evaluación de toxicidad ni análisis de alucinación en la información disponible; deben asumirse los riesgos habituales de un modelo de lenguaje de 31 B en producción.
- El modo de razonamiento está desactivado por defecto; si se activa, el campo `reasoning` no forma parte de la especificación de la API de OpenAI y solo aparece cuando hay contenido de razonamiento, por lo que acceder a él sin comprobar su existencia provoca `AttributeError`.
- El campo `reasoning` se devuelve como convención ampliamente seguida (OpenAI Agents SDK, vLLM), no como estándar formal; la integración debe tolerar su ausencia.
- La carga de imágenes locales vía `file://` exige el flag `--allowed-local-media-path`; sin él, solo se admiten URL remotas o base64.
- El acceso a imágenes remotas puede restringirse a dominios concretos, lo que afecta a despliegues que dependan de CDNs externas.
- La licencia declarada en los metadatos es Apache 2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google; conviene verificar los términos aplicables antes de un uso comercial.
- El soporte oficial de esta build está limitado a FuriosaAI RNGD y Furiosa-LLM; para otros frameworks hay que recurrir al modelo base de Red Hat AI.
- No se documentan los idiomas soportados ni la longitud de contexto, dos parámetros críticos para dimensionar aplicaciones de contexto largo o multilingües.
- El tamaño del repositorio (53,9 GB) y la necesidad de cuatro tarjetas RNGD implican un coste de infraestructura considerable para pruebas y desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/gemma-4-31B-it-FP8-block
- Modelo base (Red Hat AI): https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-block
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
