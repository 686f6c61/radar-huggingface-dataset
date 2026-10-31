# mlboydaisuke/WeVisOne-VL-2B-CoreAI

## Resumen

WeVisOne-VL-2B-CoreAI es una conversión cuantizada del modelo de visión-lenguaje WeVisOne-VL-2B de Tencent, preparada por mlboydaisuke para ejecutarse en dispositivos Apple mediante el framework Core AI. El modelo original (tencent/WeVisOne-VL-2B) es un modelo multimodal de unos 2B de parámetros especializado en tareas de segmentación visual: recorte de objetos por descripción textual (referring expression segmentation), image matting con alpha matte y detección de objetos con cajas delimitadoras.

Esta versión redistribuye el modelo como cuatro grafos compilados (decodificador de texto en int8, torre de visión en fp16 y decodificador de píxeles en fp16 en dos partes), con variantes para iOS 27 (iPhone) y macOS 27 (Mac con arquitectura h16c). Su relevancia radica en que permite ejecutar segmentación guiada por lenguaje completamente en el dispositivo, sin servidor ni conexión: la ficha del autor documenta inferencias de unos 0,99 s para un objeto y 4,1 s para siete coincidencias en un iPhone 18 Pro.

El repositorio pesa 13,5 GB en total (3,3 GB la variante iOS, 10,2 GB la variante macOS compilada ahead-of-time) y se distribuye bajo licencia Apache 2.0. Está pensado para usarse como host de la aplicación de ejemplo Cutout de CoreAIKit, aunque cualquier host que orqueste los cuatro grafos en orden es válido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language (torre de visión ViT + decodificador de texto + decodificador de píxeles), basado en Qwen3-VL según etiquetas |
| Parametros totales | no disponible (decodificador de píxeles: 9,5M; repositorio iOS: 3,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prefill en bloques de 64 tokens) |
| Tipos de cuantizacion | int8 (lineales del decodificador de texto, por bloques de 32) y fp16 (visión y decodificador de píxeles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos `.aimodel` y `.aimodelc` de Core AI (Apple); el checkpoint original en safetensors no está incluido |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro grafos que el host ejecuta en secuencia. La torre de visión procesa la imagen redimensionada a 448 × 448 (196 filas de tokens) y produce embeddings de imagen, deepstack embeds y salidas intermedias de las capas ViT 5, 11, 17 y 23, que el decodificador de píxeles consume posteriormente. El decodificador de texto (int8, con lineales cuantizados por bloques de 32 con simetría con clipping y cabeza absmax) genera de forma greedy las respuestas de segmentación, exponiendo además `last_hidden`, el estado oculto de la última capa antes de la norma final, en cada token `<OBJ>`; ese estado oculto es la entrada del decodificador de píxeles. Las cajas se decodifican con cuatro coordenadas por milésima antes de cada `<OBJ>`, se codifican con Fourier en fp32 en el host y alimentan la parte A del decodificador de píxeles (hasta 16 coincidencias por llamada, 19,5 MB), cuya salida pasa por la parte B (851 KB) que produce los logits de matte a 1024 × 1024.

Sobre el entrenamiento del modelo base no hay datos en la información disponible (tokens, composición del dataset, RLHF/DPO). Lo que sí documenta la ficha es el trabajo de conversión: el decodificador int8 se validó contra la referencia en fp32 sobre 33 filas de prompt, replicando el argmax en las últimas cuatro posiciones y los 16 tokens greedy en 33 de 33 filas, y a nivel de tarea recupera todas las cajas de la referencia con IoU ≥ 0,75 y los recuentos exactos. El decodificador se ejecuta sobre el runtime de bajo nivel de Core AI (no el motor con pipeline) porque este último solo devuelve identificadores de token y no el estado oculto.

## Capacidades

- Referring expression segmentation: recorta en la imagen los objetos nombrados por una descripción en lenguaje natural ("every carved pumpkin").
- Image matting: genera un alpha matte a 1024 × 1024 por objeto, con sigmoid y reescalado bilineal al tamaño original de la foto.
- Detección de objetos: produce cajas delimitadoras (hasta 16 coincidencias por llamada en la parte A del decodificador de píxeles).
- Compresión de fondo: el ejemplo Cutout guarda el recorte como PNG con fondo eliminado.
- Ejecución totalmente on-device en iPhone (iOS 27) y Mac (macOS 27, arquitectura h16c), sin dependencia de servicios en la nube.
- Salidas intermedias del decodificador (`last_hidden`) que permiten integrar el modelo en hosts personalizados más allá del ejemplo oficial.

No hay información disponible sobre tool calling, agentes, capacidades de generación de texto general, código, matemáticas ni soporte multilingüe del modelo base.

## Casos de uso

- Edicion fotografica en movil: recortar personas, animales u objetos de una foto escribiendo qué se quiere extraer, con el fondo eliminado y guardado directo en Fotos, todo sin conexión.
- Apps de catalogo y comercio: aislar productos de fotografías con fondos complejos para generar imágenes de catálogo con fondo transparente en el propio dispositivo del usuario.
- Privacidad por diseño: procesamiento de imágenes personales (fotos médicas, documentos, familiares) que nunca salen del dispositivo, adecuado para apps sujetas a requisitos estrictos de privacidad.
- Anotacion visual asistida: detección de objetos por descripción textual para generar cajas y máscaras de anotación que un humano revisa y corrige, acelerando la creación de datasets.
- Realidad aumentada y efectos: extraer el alpha matte de objetos en tiempo casi real (0,99 s por objeto en iPhone 18 Pro) para componerlos sobre otros fondos o aplicarles efectos.
- Accesibilidad: aplicaciones que permiten a usuarios con discapacidad visual o motriz seleccionar y extraer elementos de una imagen mediante lenguaje natural en lugar de gestos precisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados son mediciones de latencia del propio autor:

| Medicion | Valor |
|---|---|
| iPhone 18 Pro (iOS 27.2), 1 coincidencia | 0,988–0,997 s (torre de visión 89 ms) |
| iPhone 18 Pro, 7 coincidencias | 4,1 s |
| Ejemplo grabado (3 calabazas, iPhone 18 Pro) | cajas 0,83 s, matte 1,42 s en pantalla |
| Precisión del decodificador int8 vs fp32 | argmax y tokens greedy idénticos en 33/33 filas; cajas con IoU ≥ 0,75 y recuentos exactos |

## Requisitos de hardware

- Variante iOS (`ios/`, 3,3 GB): requiere iOS 27 y una app con el entitlement `com.apple.developer.kernel.increased-memory-limit`; probado en iPhone 18 Pro con iOS 27.2.
- Variante macOS (`macos/`, 10,2 GB, compilada ahead-of-time): requiere macOS 27 en un Mac con arquitectura h16c (probado en Mac M4 Max).
- Al ejecutarse on-device, no se necesita GPU de servidor ni VRAM dedicada; el consumo de memoria en el dispositivo no está cuantificado en la información disponible.
- Despliegue: el modelo no es un catálogo estándar de CoreAIKit; requiere un host que ejecute los cuatro grafos en orden. El host de referencia es el ejemplo Cutout de CoreAIKit (https://github.com/john-rocky/coreai-kit/tree/main/Examples/Cutout).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI al tratarse de grafos compilados para Core AI; para usar el modelo base con esas herramientas habría que partir de tencent/WeVisOne-VL-2B.
- Latencia medida: aproximadamente 1 s por objeto y 4,1 s para siete objetos en iPhone 18 Pro (estado térmico nominal, grafos especializados en el dispositivo).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| WeVisOne-VL-2B-CoreAI | ~2B (base) | Segmentación por lenguaje, matting, detección | int8 (texto) + fp16 (visión) | iPhone / Mac via Core AI | Apache 2.0 |
| tencent/WeVisOne-VL-2B (base) | ~2B | Segmentación por lenguaje, matting, detección | fp32/fp16 original | Servidor / PyTorch | no disponible en la información proporcionada |
| SAM 2 (Meta) | no comparable directamente | Segmentación interactiva por puntos/cajas (no por texto) | varia | Servidor / móvil con port | Apache 2.0 |

No hay información disponible sobre otras conversiones on-device equivalentes de modelos de segmentación por lenguaje para comparar rendimiento numérico.

## Limitaciones y advertencias

- El pipeline requiere redimensionar la imagen a una rejilla fija de 448 × 448, lo que puede perder detalle fino en fotos de alta resolución antes del reescalado del matte a 1024 × 1024.
- El decodificador int8 no mantiene similitud coseno ≥ 0,9999 con la referencia fp32 en todos los pasos teacher-forced (mínimo 0,99581); en tareas con empates cercanos en softmax (gap top-2 < 0,1) puede desviarse de la referencia, aunque a nivel de tarea los resultados validados coinciden.
- La codificación Fourier de las cajas debe calcularse en el host en fp32 con equivalencia bit a bit con torch; Darwin redondea `logf` de forma distinta en 7 anchos de caja documentados, un detalle que cualquier host personalizado debe replicar.
- La variante iOS exige un entitlement especial de memoria elevada, lo que restringe su uso a apps que lo soliciten a Apple.
- La variante macOS solo funciona en Mac con arquitectura h16c bajo macOS 27; no es portable a hardware anterior.
- No hay información disponible sobre idiomas soportados, sesgos del modelo base, riesgo de alucinación cuantificado ni limitaciones adicionales de licencia más allá de los términos de Apache 2.0.
- El repositorio tiene muy poca tracción pública (55 descargas, 1 like), por lo que conviene validar los resultados en las propias imágenes antes de uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlboydaisuke/WeVisOne-VL-2B-CoreAI
- Modelo base de Tencent: https://huggingface.co/tencent/WeVisOne-VL-2B
- Ejemplo Cutout de CoreAIKit: https://github.com/john-rocky/coreai-kit/tree/main/Examples/Cutout
- Vídeo de demostración en iPhone 18 Pro: https://github.com/john-rocky/coreai-assets/blob/main/demos/wevisone-vl-2b-pumpkins-iphone-20261027.mp4
