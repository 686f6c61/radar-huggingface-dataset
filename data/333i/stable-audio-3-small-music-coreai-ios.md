# 333i/stable-audio-3-small-music-coreai-ios

## Resumen

Stable Audio 3 Small Music es un modelo de generación de audio y música de Stability AI, basado en difusión latente. Esta variante concreta, publicada por el usuario 333i, es una conversión a Apple Core AI del trabajo de arraypress, que a su vez convirtió el checkpoint oficial de Stability AI. El resultado es un paquete `.aimodelc` precompilado para la arquitectura `h18p` (Apple A19 y A19 Pro, familia iPhone 17), pensado para ejecutarse en dispositivo sin conexión.

La relevancia de este modelo radica en que permite ejecutar generación de música por texto directamente en un iPhone moderno, con tiempos de carga reducidos gracias a la compilación anticipada y a la eliminación de gráficos de inferencia que una aplicación móvil no utiliza. El modelo original tiene 433 millones de parámetros y es de código abierto con licencia comunitaria de Stability AI, lo que facilita su integración en aplicaciones comerciales bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer latente con autoencoder semánticamente alineado (SAME) |
| Parametros totales | 433 millones (segun la busqueda web; no confirmado en la ficha de HuggingFace) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (formato Core AI compilado, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (el texto de entrada se procesa con T5Gemma, pero no se especifican idiomas) |
| Licencia | Stability AI Community License (con terminos adicionales de Gemma para el encoder de texto) |
| Formato de pesos | `.aimodelc` (bundle Core AI compilado) |

## Arquitectura y entrenamiento

El modelo base es Stable Audio 3 Small Music, un modelo de difusión latente de 433 millones de parámetros entrenado por Stability AI con datos completamente licenciados. La arquitectura combina un autoencoder semánticamente alineado (SAME) para comprimir el audio en un espacio latente, un transformer de difusión que denoisa ese latente condicionado por texto y duración, y un encoder de texto T5Gemma para las condiciones textuales. El proceso de muestreo utiliza un sampler ping-pong con 8 pasos y una programación log-SNR, que se ejecuta en el host (la CPU del dispositivo).

La conversión a Core AI realizada por arraypress y posteriormente optimizada por 333i elimina los gráficos de codificación de audio y las longitudes de decodificación no utilizadas en una aplicación de teléfono, manteniendo cuatro funciones de inferencia: `condition`, `denoise`, `decode_512` (hasta 47,6 segundos) y `decode_2048` (hasta 190,2 segundos). Los pesos del checkpoint original no se modifican, solo se recompilan para el hardware objetivo.

## Capacidades

- Generación de música y audio a partir de descripciones textuales, con control de duración (hasta 190,2 segundos en la función `decode_2048`).
- Edición de audio mediante condicionamiento por texto y duración (funcion `condition`).
- Inferencia completamente en dispositivo, sin conexión a servidores.
- Ejecución optimizada para Apple A19 y A19 Pro (iPhone 17 y posteriores).
- Integración con el framework Core AI de Apple mediante `AIModel(contentsOf:)`.
- El modelo original soporta generación de audio de longitud variable, aunque esta versión limita las longitudes de decodificación a dos valores concretos.

## Casos de uso

- Aplicaciones iOS de creación musical: un usuario puede escribir una descripción como "pista de jazz lenta con piano y batería suave" y obtener un clip de audio de hasta 47,6 segundos directamente en el dispositivo, sin latencia de red.
- Generación de fondos sonoros para vídeos o podcasts: la funcion `decode_2048` permite generar piezas de hasta 190,2 segundos, adecuadas para música de fondo continua.
- Prototipado rápido de ideas musicales: compositores pueden generar variaciones de una idea textual y evaluarlas al instante en su iPhone.
- Asistentes de audio en apps de bienestar o meditación: generar paisajes sonoros personalizados según el estado de ánimo descrito por el usuario.
- Edición de audio en movil: la funcion `condition` permite recondicionar un latente existente, lo que habilita cambios de estilo o duración sobre material ya generado.
- Desarrollo de aplicaciones educativas de música: los estudiantes pueden experimentar con la generación de audio por texto y comprender la relacion entre descripciones y resultados sonoros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de calidad de audio ni comparaciones con otros modelos. La busqueda web menciona que el modelo original puede ejecutarse en CPU, pero no proporciona datos cuantitativos de rendimiento para esta version iOS.

## Requisitos de hardware

- Dispositivo con Apple A19 o A19 Pro (iPhone 17 o posterior).
- iOS 27 o posterior.
- No requiere GPU externa ni conexion a internet para la inferencia.
- El bundle `.aimodelc` ocupa aproximadamente 5,2 GB en disco.
- La carga inicial del modelo tarda segundos gracias a la compilacion anticipada, en lugar de los minutos que podria tardar una conversion sin precompilar.
- No se dispone de datos de latencia o throughput por inferencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 Small Music (original) | 433M | Longitud variable | Stability AI Community | PyTorch / safetensors | HuggingFace |
| Stable Audio 3 Small Music Core AI (arraypress) | 433M | Longitud variable | Stability AI Community | Core AI (`.aimodelc`) | HuggingFace |
| Esta version (333i) | 433M | Hasta 190,2 s | Stability AI Community | Core AI precompilado para A19 | HuggingFace |

La diferencia principal entre las tres versiones es el formato de distribucion y la optimizacion para hardware especifico. La version de 333i es la unica precompilada para A19/A19 Pro, lo que reduce el tiempo de primera carga y elimina graficos innecesarios para una app de telefono.

## Limitaciones y advertencias

- La licencia Stability AI Community permite uso comercial, pero impone restricciones: no se puede utilizar para generar musica que compita directamente con los servicios de Stability AI, y se requiere atribucion en ciertos casos. Consultar el archivo `LICENSE.md` para detalles completos.
- El encoder de texto T5Gemma esta sujeto a los Terminos de Uso de Gemma de Google, que pueden anadir restricciones adicionales.
- Esta version solo funciona en dispositivos con A19 o A19 Pro; no es compatible con iPhones anteriores ni con otros sistemas operativos.
- La generacion de audio puede presentar alucinaciones o artefactos en descripciones ambiguas o muy complejas, como es comun en modelos de difusion.
- No se especifican los idiomas soportados por el encoder de texto; es probable que el rendimiento sea mejor en ingles, dado el entrenamiento del modelo original.
- El modelo no incluye capacidades de vision, audio de entrada ni reconocimiento de voz; solo genera audio a partir de texto.
- Al ser una conversion de terceros, no hay garantia de soporte oficial por parte de Stability AI para esta distribucion concreta.

## Enlaces

- Repositorio de HuggingFace de esta version: https://huggingface.co/333i/stable-audio-3-small-music-coreai-ios
- Conversion original de arraypress: https://huggingface.co/arraypress/stable-audio-3-small-music-coreai
- Modelo base de Stability AI: https://huggingface.co/stabilityai/stable-audio-3-small-music-base
- Pagina oficial de Stable Audio 3: https://stability.ai/stable-audio
- Articulo de investigacion de Stable Audio 3 y SAME: https://stability.ai/research/stable-audio-3
- Articulo de terceros sobre Stable Audio 3 Small: https://creativeaishow.com/stable-audio-3-small-the-free-433m-ai-music-model-that-runs-on-your-cpu-no-gpu-needed/
