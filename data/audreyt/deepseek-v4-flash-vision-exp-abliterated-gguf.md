# audreyt/DeepSeek-V4-Flash-Vision-Exp-Abliterated-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Exp-Abliterated-GGUF es una variante cuantizada y modificada del modelo multimodal experimental DeepSeek-V4-Flash-Vision-Exp, desarrollado por DeepSeek y publicado originalmente en su API el 21 de agosto de 2026. El autor de esta versión, audreyt, ha aplicado una técnica de abliteración (eliminación de la dirección de rechazo) sobre los tensores de salida de atención del modelo base, y ha empaquetado el resultado en formato GGUF con una cuantización mixta que reduce el tamaño a 86,7 GB. El objetivo es permitir la ejecución local en hardware de gama alta con un equilibrio entre calidad y consumo de memoria.

El modelo base cuenta con 284 334 567 511 parámetros totales (284B) y activa aproximadamente 13B durante la inferencia gracias a su arquitectura de mezcla de expertos (MoE). Está diseñado para tareas de visión y lenguaje, como descripción de imágenes, lectura de texto en capturas y análisis de gráficos. Esta versión concreta no incluye el encoder de visión, que debe descargarse por separado, y requiere el uso del ejecutable `ds4` con la opción `--vision`. Su relevancia radica en ofrecer una alternativa local y de código abierto (licencia MIT) para desarrolladores que necesiten un modelo multimodal de gran tamaño sin depender de la API comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con módulo de visión, variante `deepseek4` / `vision-exp` |
| Parametros totales | 284 334 567 511 (284B) |
| Parametros activos | 13B (aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (expertos enrutados), Q2_K (proyecciones down), Q8_0 (attention, shared y output) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo de 86,7 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp emplea una arquitectura de mezcla de expertos con 284B parámetros totales y 13B activos por token, lo que reduce el coste computacional en inferencia. Incluye un encoder de visión separado que procesa imágenes y las convierte en tokens que se integran con el texto. Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible.

La versión abliterada aplica una modificación sobre 33 tensores `blk.{10..42}.attn_output_b.weight` del modelo cuantizado. La técnica consiste en un residuo de rango 1 sobre la capa de salida de atención, con un factor λ=3,5, que elimina la dirección de rechazo aprendida durante el entrenamiento. El resultado es un modelo que no rechaza solicitudes consideradas dañinas, pero que conserva el resto de capacidades. La cuantización es mixta: los expertos enrutados se cuantizan con IQ2_XXS, las proyecciones down con Q2_K y las capas de atención, shared y output con Q8_0, lo que busca preservar la calidad en las partes críticas.

## Capacidades

- Vision y lenguaje: puede describir imágenes, leer texto de capturas de pantalla y analizar gráficos y tablas.
- Generacion de texto: hereda las capacidades de generacion de lenguaje del modelo base DeepSeek-V4-Flash, incluyendo razonamiento y codigo.
- Soporte de tool calling: no especificado en la informacion disponible.
- Capacidades multilingues: no especificadas, aunque el modelo base de DeepSeek suele soportar multiples idiomas.
- Modo de pensamiento: el ejecutable `ds4` permite desactivar el modo de razonamiento con `--nothink`, lo que sugiere que el modelo puede generar respuestas directas o con razonamiento previo.
- Abliteracion: no rechaza solicitudes que el modelo original podria bloquear, lo que amplia el rango de usos pero reduce las salvaguardas de seguridad.

## Casos de uso

- Analisis de imagenes medicas: el modelo puede describir radiografias o ecografias y extraer hallazgos relevantes, aunque no sustituye a un profesional sanitario.
- Extraccion de texto de documentos escaneados: gracias a su capacidad de leer texto en imagenes, puede digitalizar facturas, contratos o formularios.
- Asistencia a personas con discapacidad visual: puede describir el entorno a partir de fotografias tomadas con un movil.
- Analisis de graficos y tablas: util para interpretar informes financieros, graficos de ventas o resultados de experimentos.
- Generacion de descripciones para contenido multimedia: puede crear pies de foto, alt text o descripciones de productos a partir de imagenes.
- Chat multimodal con contexto largo: al combinar texto e imagenes, puede mantener conversaciones sobre documentos visuales, aunque la longitud de contexto no esta confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es una prueba de humo realizada en un Apple M5 Max con 128 GiB de RAM, donde se obtuvo una velocidad de prefill de 285,75 tokens/s y de generacion de 44,94 tokens/s con una imagen de 512x507 píxeles.

## Requisitos de hardware

- El archivo GGUF pesa 86,7 GB, por lo que se necesita al menos esa cantidad de memoria libre para cargar el modelo, mas el overhead del runtime.
- En GPU, se requiere una tarjeta con al menos 90-100 GB de VRAM, como una NVIDIA A100 80GB (insuficiente) o H100 80GB (tambien insuficiente); en la practica se necesitarian dos GPU en paralelo o una GPU con memoria unificada como el Apple M5 Max de 128 GiB.
- En CPU, se puede ejecutar con suficiente RAM (128 GiB o mas) y un procesador moderno, aunque la velocidad sera menor.
- El despliegue se realiza con el ejecutable `ds4` (cliente oficial de DeepSeek para GGUF) o con otros motores compatibles con GGUF como llama.cpp, aunque no se ha confirmado la compatibilidad con vLLM u Ollama.
- La prueba documentada muestra 285,75 tokens/s de prefill y 44,94 tokens/s de generacion en un M5 Max, lo que indica un rendimiento aceptable para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284B totales, 13B activos | no disponible | FP8 (API) | MIT | API y pesos originales |
| Esta version abliterada GGUF | 284B totales, 13B activos | no disponible | IQ2_XXS/Q2_K/Q8_0 | MIT | GGUF local |
| DeepSeek-V4-Flash (texto) | 284B totales, 13B activos | no disponible | FP8 (API) | MIT | API y pesos originales |

La principal diferencia frente al modelo base es la cuantizacion agresiva (IQ2_XXS) que reduce el tamaño de 284B a 86,7 GB, a costa de una posible perdida de calidad. La abliteracion elimina los rechazos de contenido, lo que puede ser util para investigacion pero reduce la seguridad. No se dispone de datos de otros modelos multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina las salvaguardas de seguridad del modelo original, por lo que puede generar contenido inapropiado, ofensivo o peligroso si se le solicita.
- La cuantizacion IQ2_XXS es muy agresiva y puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Requiere un encoder de vision separado que no esta incluido en este repositorio; sin el, el modelo no puede procesar imagenes.
- No se ha confirmado la longitud de contexto ni los idiomas soportados, por lo que su uso en produccion con contextos largos o multilingues es incierto.
- El modelo es experimental (variante Vision-Exp) y puede contener errores o comportamientos impredecibles.
- Aunque la licencia es MIT, el uso comercial debe verificar que el modelo base y el encoder tambien cumplen con los terminos de DeepSeek.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/audreyt/DeepSeek-V4-Flash-Vision-Exp-Abliterated-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Modelo DeepSeek-V4-Flash (texto): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Encoder de vision (necesario, de antirez): https://huggingface.co/antirez/deepseek-v4-gguf
- Documentacion de vision de DeepSeek API: https://api-docs.deepseek.com/guides/vision/
- Pagina oficial de DeepSeek: https://deepseek.com/en/index.html
