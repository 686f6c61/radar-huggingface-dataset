# 1bit-MONSTER/ZAYA1-VL-8B-GGUF

## Resumen

ZAYA1-VL-8B-GGUF es una conversión a formato GGUF del modelo multimodal Zyphra/ZAYA1-VL-8B, publicada por el usuario 1bit-MONSTER. Se trata de un modelo visión-lenguaje que combina el modelo de lenguaje ZAYA1 de Zyphra con la torre de visión de Qwen2.5-VL, a la que se ha aplicado un LoRA exclusivamente de visión sobre los tokens de imagen y atención bidireccional dentro de cada imagen. El repositorio incluye tres artefactos: el modelo de lenguaje en F16 (para cuantizar), el mismo en Q4_K_M (para servir) y la torre de visión en F16 como fichero `mmproj` independiente.

La relevancia de esta publicación es práctica: según su autor, ZAYA1 no estaba disponible en formato GGUF antes de este trabajo, y su ejecución requiere un fork propio de llama.cpp (rama `1bit/hrx-vulkan-patched`), ya que el llama.cpp upstream no incluye el modelo ZAYA. El repositorio documenta además una validación numérica frente al código original de Zyphra (FP32 en CPU) y medidas de decodificación sobre hardware AMD Strix Halo con backend Vulkan.

El modelo base declara 9.054.048.760 parámetros totales en safetensors (cifra que engloba el modelo de lenguaje y la torre de visión) y licencia Apache 2.0, heredada del modelo original. No se especifican en la información disponible el número de parámetros activos, la longitud de contexto del modelo de lenguaje ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje ZAYA1 (Zyphra) + torre de vision Qwen2.5-VL; atencion bidireccional dentro de cada imagen y LoRA solo de vision sobre los tokens de imagen |
| Parametros totales | 9.054.048.760 (dato real de safetensors; incluye modelo de lenguaje y torre de vision) |
| Parametros activos | no disponible (no se confirma en la informacion proporcionada que sea un modelo MoE) |
| Longitud de contexto | no disponible para el modelo de lenguaje; la torre de vision tiene un tope de 4.096 tokens por imagen (Qwen2.5-VL) |
| Tipos de cuantizacion | F16 y Q4_K_M (mas `mmproj` de vision en F16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`ZAYA1-VL-8B-F16.gguf`, `ZAYA1-VL-8B-Q4_K_M.gguf`, `mmproj-ZAYA1-VL-8B-F16.gguf`) |
| Tamano del repositorio | 25,2 GB (los tres ficheros) |
| Modelo base | Zyphra/ZAYA1-VL-8B |
| Compatibilidad upstream | No soportado por llama.cpp upstream; requiere el fork de 1bit-MONSTER o el motor 1bit engine |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: el modelo de lenguaje ZAYA1 de Zyphra y la torre de visión de Qwen2.5-VL. Sobre los tokens de imagen se aplica un LoRA específicamente de visión y se usa atención bidireccional dentro de cada imagen, frente a la atención causal del resto de la secuencia. Esta combinación es la que hace que el modelo pueda procesar imágenes dentro de una conversación de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por fases de RLHF o DPO; el modelo base es Zyphra/ZAYA1-VL-8B y su model card es la fuente a consultar para esos detalles. La innovación técnica documentada en este repositorio es de tipo de conversión y ejecución, no de entrenamiento: el conversor propio escribe los pesos de la convolución agrupada (`grouped convolution`) en orden *tap-major*, que es el que espera el grafo, y esa es la razón por la que los GGUF deben generarse con dicho conversor. Adicionalmente, la decodificación de cada imagen debe realizarse en un único *ubatch*: con `-b 4096 -ub 4096` se cubre el límite de 4.096 tokens de Qwen2.5-VL.

La validación publicada por el autor incluye una comparación *teacher-forced* del fichero F16 contra el código original de Zyphra (FP32 en CPU) sobre tres preguntas con imagen (101 tokens), con y sin atención bidireccional, y la comprobación de que añadir la ruta de visión no altera el comportamiento del modelo en modo solo texto.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Comprensión de imágenes: descripción de contenido visual y lectura de texto presente en la imagen (validado con una imagen sintética con formas y el texto "HELLO 42").
- Razonamiento multimodal básico sobre una o varias imágenes dentro de una conversación.
- Ejecución local en GPU AMD vía Vulkan a través del motor 1bit engine o del fork de llama.cpp.
- Modo solo texto funcional: la perplexity en wikitext se mantiene igual que en ZAYA1-8B sin la ruta de visión (95/96 coincidencias frente a FP32).
- Cuantización adicional a partir del fichero F16 publicado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Otras capacidades especiales (modo *thinking*, audio, vídeo): no disponibles en la información proporcionada.

## Casos de uso

- Inferencia multimodal local y privada: el modelo permite procesar imágenes y texto sin enviar datos a servicios externos, ejecutándose con el motor 1bit sobre Vulkan; es adecuado para entornos con requisitos de confidencialidad donde no se puede usar una API en la nube.
- Despliegue en hardware AMD de gama integrada: la validación sobre Strix Halo (Radeon 8060S, Vulkan) con 38-51 tok/s en F16 demuestra que el modelo es viable en equipos sin GPU discreta, lo que sirve para prototipos y demos sobre portátiles o mini-PC.
- Extracción de información de imágenes documentales: la combinación de la torre Qwen2.5-VL con atención bidireccional dentro de la imagen está pensada para tareas de lectura y descripción de contenido visual, como la transcripción de texto embebido en capturas o diagramas.
- Etiquetado y enriquecimiento de catálogos de imágenes: dado que el modelo acepta una imagen por vez con un tope de 4.096 tokens, encaja en pipelines de generación automática de descripciones o metadatos para lotes de imágenes.
- Investigación en cuantización y comparación de precisión: el repositorio ofrece F16 y Q4_K_M del mismo modelo, lo que permite medir el impacto de la cuantización en tareas de visión, replicando la validación de acuerdo top-1 (100/101 frente a FP32) y la comprobación de perplexity en wikitext.
- Integración en el ecosistema llama.cpp mediante fork: para equipos que ya usan llama.cpp y necesitan un modelo visión-lenguaje no soportado upstream, esta conversión permite reutilizar la infraestructura existente asumiendo el mantenimiento del fork `1bit/hrx-vulkan-patched`.
- Desarrollo y evaluación de motores de inferencia: el caso de uso del propio autor es servir de banco de pruebas para el motor 1bit y para el soporte de modelos ZAYA en llama.cpp, incluyendo la correcta disposición *tap-major* de las convoluciones agrupadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio únicamente documenta validaciones de fidelidad numérica y una medida de velocidad de decodificación:

| Prueba | Resultado |
|---|---|
| Acuerdo top-1 F16 vs. codigo de Zyphra (FP32 CPU), 3 preguntas con imagen, 101 tokens | 100/101, tanto con atencion causal como bidireccional sobre la imagen |
| Q4_K_M sobre imagen sintetica (cuadrado rojo, circulo azul, texto "HELLO 42") | Descripcion correcta de ambas formas y del texto |
| Efecto de anadir la ruta de vision en modo solo texto | Perplexity en wikitext sin cambios; 95/96 coincidencias frente a FP32 |
| Velocidad de decodificacion en Strix Halo (Radeon 8060S, Vulkan), F16 | 38-51 tok/s |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 6-7 GB de pesos (estimacion a partir de ~9.000 millones de parametros en 4 bits) mas el `mmproj` de vision en F16, mas la cache KV. Con 4.096-8.192 tokens de contexto es razonable apuntar a 8-10 GB de memoria grafica o memoria unificada.
- VRAM estimada para F16: en torno a 18 GB de pesos mas el `mmproj`. Se recomienda reservar 20-22 GB contando cache KV. Estas cifras son estimaciones derivadas del numero de parametros; el autor no publica tamanos por fichero.
- GPU recomendadas: no disponibles de forma explicita. El unico hardware validado publicamente es AMD Strix Halo (Radeon 8060S) con backend Vulkan, que alcanza 38-51 tok/s en F16.
- GPU de consumo: Q4_K_M deberia caber en tarjetas con 12-16 GB de VRAM (por ejemplo, gama RTX xx80/xx90 recientes o equivalentes AMD) segun las estimaciones anteriores; F16 requiere tarjetas de 24 GB o mas. No hay validacion publicada en GPU NVIDIA para esta conversion.
- Opciones de despliegue: 1bit engine (`1bit serve -m ZAYA1-VL-8B-Q4_K_M.gguf --mmproj mmproj-ZAYA1-VL-8B-F16.gguf --device vulkan`) y el fork de llama.cpp del autor (rama `1bit/hrx-vulkan-patched`), con `-b 4096 -ub 4096` para decodificar cada imagen en un unico ubatch. vLLM, TGI, Ollama y llama.cpp upstream no estan confirmados como compatibles.
- Latencia y throughput: unicos datos publicados, 38-51 tok/s de decodificacion en Strix Halo con Vulkan y F16. No hay datos de latencia de prellenado ni de throughput en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | GGUF / soporte en llama.cpp |
|---|---|---|---|---|
| ZAYA1-VL-8B (esta conversion) | 9,05 B (safetensors) | no disponible (vision limitada a 4.096 tokens por imagen) | Apache 2.0 | Si, GGUF propio; requiere fork de 1bit-MONSTER |
| Qwen2.5-VL-7B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | Soporte en llama.cpp upstream (la torre de vision es la misma familia que usa ZAYA1-VL-8B) |
| InternVL3-8B | no disponible | no disponible | no disponible | Soporte parcial mediante forks de terceros |
| Gemma 3 multimodal | no disponible | no disponible | Licencia Gemma (con restricciones de uso) | Soporte en llama.cpp upstream |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible: ZAYA1-VL-8B-GGUF no publica resultados de benchmarks estandarizados, por lo que no es posible establecer una comparacion numerica rigurosa con las alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales publicadas para esta conversion, por lo que el rendimiento relativo frente a otros modelos de su tamano es desconocido.
- Validacion limitada: las pruebas documentadas se reducen a tres preguntas con imagen (101 tokens) y a una imagen sintetica. No constituyen una evaluacion representativa de la calidad en produccion.
- Riesgo de alucinacion: no se documenta ningun tipo de mitigacion ni evaluacion de alucinacion en vision o en texto; se aplica el riesgo habitual de los modelos generativos.
- Dependencia de un fork: el modelo no funciona en llama.cpp upstream. Esto implica mantener el fork `1bit/hrx-vulkan-patched` o el motor 1bit engine, con el coste de mantenimiento y de actualizaciones de seguridad asociado.
- Los GGUF deben generarse con el conversor propio del autor (orden *tap-major* en la convolucion agrupada); usar otro conversor puede producir pesos incompatibles con el grafo.
- Restriccion de vision por imagen: la torre Qwen2.5-VL admite un maximo de 4.096 tokens por imagen, lo que limita la resolucion efectiva y el numero de imagenes procesables de forma conjunta.
- Idiomas: no se especifica la cobertura linguistica del modelo base ni de esta conversion. No hay garantia de calidad en castellano.
- Longitud de contexto del modelo de lenguaje: no disponible; no se puede planificar un uso con documentos largos sin verificarlo en la model card de Zyphra/ZAYA1-VL-8B.
- Soporte de tool calling y de agentes: no confirmado en la documentacion disponible.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 *likes* en el repositorio, sin evidencia de uso en produccion por terceros.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial; conviene verificar igualmente las condiciones del modelo base Zyphra/ZAYA1-VL-8B y de los componentes Qwen2.5-VL.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/1bit-MONSTER/ZAYA1-VL-8B-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-VL-8B
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp con soporte ZAYA (rama `1bit/hrx-vulkan-patched`): https://github.com/1bit-MONSTER/llama.cpp
- Pull request del port a llama.cpp (PR #18): https://github.com/1bit-MONSTER/llama.cpp/pull/18
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; solo paginas genericas sobre el termino "bit" (Wikipedia, 1Bit AI), sin relacion con ZAYA1-VL-8B.
