# islomov/gapi-uz-gapiring-v2

## Resumen

Gapiring v2 es un sistema de síntesis de voz (text-to-speech) para uzbeko, desarrollado por el usuario islomov y publicado bajo licencia CC BY 4.0. Se distribuye en dos variantes: Gapiring Edge v2, con 110 millones de parámetros y 117 MB de pesos, pensada para ejecutarse en CPU convencional o íntegramente en el navegador mediante WebAssembly; y Gapiring Large v2, con 336 millones de parámetros, orientada a servidores o equipos de escritorio. Ambas derivan del modelo base kyutai/pocket-tts, sobre el que se ha realizado un ajuste específico para el uzbeko y se han añadido controles de estilo de habla.

El modelo resuelve la generación de voz natural en uzbeko con soporte para dos voces predefinidas (`f1`, femenina, y `m1`, masculina), selección de rol por nombre (por ejemplo `operator`, `assistant`, `assistant_formal`, `emotional`, `narrator`) y de "manera" o estilo (por ejemplo `calm`, `warm`, `serious`), además de control de ritmo (`pace="slow"` o `pace="fast"`) y modo emocional. La versión 2 incorpora un rol `narrator` con cuatro géneros (libro, artículo, noticias, cuento), lectura de palabras inglesas tal como se escriben dentro de texto uzbeko y la posibilidad de activar hesitaciones mediante el parámetro `hesitant=True`.

Es relevante porque ofrece inferencia sin GPU y sin servidor, con pesos en formato ONNX y bibliotecas oficiales para Python, JavaScript (navegador y Node), Android e iOS, lo que facilita el despliegue en aplicaciones móviles y web con el modelo empaquetado localmente. La salida es audio float32 mono a 24 kHz, en streaming por fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de kyutai/pocket-tts; pesos en ONNX) |
| Parametros totales | 110M (Edge v2) / 336M (Large v2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el rol `narrator` admite texto de longitud arbitraria) |
| Tipos de cuantizacion | variante `_int8` disponible en los ficheros del repositorio; `precision="full"` mencionado como compatibilidad con v1 |
| Idiomas soportados | uzbeko (`uz`); lectura de palabras inglesas tal como se escriben |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX; tamano del repositorio 1.9 GB |
| Frecuencia de muestreo de salida | 24 kHz, mono, float32 |
| Voces | `f1` (femenina), `m1` (masculina) |
| Roles | `operator`, `assistant`, `assistant_formal`, `emotional`, `narrator` (entre otros de v1) |
| Maneras | `calm`, `warm`, `serious` (entre otras de v1) |
| Ritmo | `pace="slow"`, `pace="fast"` |
| Modelo base | kyutai/pocket-tts |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo deriva de kyutai/pocket-tts y se distribuye como artefactos ONNX, lo que permite inferencia sin PyTorch y ejecución en CPU, navegador (WebAssembly) y plataformas móviles. El repositorio incluye un script `runtime/pocket_onnx.py` que carga los bundles `large` o `edge` con sufijos como `_int8`, lo que confirma la existencia de pesos cuantizados a 8 bits además de la precisión completa.

Respecto al entrenamiento, la información disponible no especifica el volumen de datos, la composición del corpus ni si se emplearon técnicas de RLHF o DPO. Sí se documenta el ajuste funcional respecto al modelo base: adaptación al uzbeko, incorporación de roles y maneras nombradas, un normalizador de texto que expande números, fechas y cantidades monetarias, y la eliminación del diccionario de pronunciación inglesa de la versión 1, sustituido por lectura literal de las palabras inglesas. La versión 2 mantiene compatibilidad hacia atrás con el código escrito para v1, mapeando los nombres de roles, maneras y modelos sin lanzar errores.

## Capacidades

- Síntesis de voz en uzbeko con dos voces: `f1` (femenina) y `m1` (masculina).
- Selección de rol por nombre: `operator`, `assistant`, `assistant_formal`, `emotional`, `narrator`, entre otros heredados de v1.
- Selección de manera o estilo de habla: `calm`, `warm`, `serious`, entre otras.
- Modo narrador con cuatro géneros: `book`, `article`, `news` y `tale`; admite textos de cualquier longitud.
- Control de ritmo mediante `pace="slow"` y `pace="fast"`.
- Modo emocional heredado de v1.
- Hesitaciones opcionales en el rol `assistant` mediante `hesitant=True`; por defecto el asistente habla con fluidez.
- Lectura de palabras inglesas, marcas y abreviaturas (Google Lens, Power BI, eSIM, check-in, IELTS) según su grafía, sin diccionario externo.
- Normalización de texto: números, fechas y cantidades monetarias se leen correctamente.
- Síntesis de sonidos descritos en el texto (capacidad heredada de v1).
- Streaming de audio: entrega fragmentos float32 a 24 kHz mono a medida que se generan.
- Inferencia sin GPU: CPU, navegador vía WebAssembly, Android 7.0+ e iOS 15.1+ / macOS 14+ en Apple silicon.
- Bibliotecas oficiales: `pip install gapiring`, `npm install gapiring`, Maven (`uz.gapi:gapiring:0.2.0`) y Swift Package (`https://github.com/Islomov49/gapiring-ios`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz para atención al cliente: el rol `assistant` con manera `warm` y voz `f1` permite generar respuestas habladas en uzbeko para un bot de soporte; el streaming reduce la latencia percibida al reproducir el audio conforme se sintetiza.
- Audiolibros y lectura de documentos largos: el rol `narrator` con género `book` acepta textos de longitud arbitraria, lo que permite convertir capítulos completos en audio con una voz masculina (`m1`) consistente.
- Locución de noticias y artículos: el rol `narrator` con géneros `news` y `article` y `serious=True` produce una lectura formal adecuada para boletines o resúmenes informativos generados automáticamente.
- Aplicaciones móviles sin conectividad: la biblioteca de Android incorpora el modelo (unos 100 MB) y la de iOS unos 150 MB, de modo que la síntesis funciona sin red en Android 7.0+ e iOS 15.1+, útil para apps de campo o zonas con cobertura limitada.
- Accesibilidad web: la versión Edge puede ejecutarse íntegramente en el navegador mediante WebAssembly y el paquete npm, lo que permite ofrecer lectura en voz alta de contenido uzbeko sin enviar texto a un servidor.
- Integración en sistemas telefónicos o IVR: el rol `operator` con manera `calm` y `pace="slow"` genera mensajes claros para menús telefónicos y avisos, con la opción de ejecutar el modelo Large en servidor para mayor calidad de audio.
- Contenido educativo y cuentos: el género `tale` del narrador sirve para narrar cuentos infantiles, y el modo emocional heredado de v1 aporta variación expresiva.
- Prototipado multiplataforma: al compartir API entre Python, JavaScript, Android e iOS, un mismo texto y configuración de voz puede reproducirse de forma coherente en backend, web y apps móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Gapiring Edge v2: 110M parámetros y 117 MB de pesos; diseñado para CPU convencional y para ejecución completa en navegador mediante WebAssembly, sin GPU ni servidor.
- Gapiring Large v2: 336M parámetros; orientado a servidor o equipo de escritorio. No se especifica VRAM ni RAM mínima en la documentación.
- Existe una variante aún menor, Gapiring Nano (31 MB, una sola voz), en el repositorio `islomov/gapi-uz-gapiring-nano-v1`, pensada para placas de una sola computadora (SBC).
- Cuantización: los ficheros del repositorio incluyen sufijos `_int8`, lo que reduce el tamaño de los pesos respecto a precisión completa; la opción `precision="full"` se mantiene por compatibilidad con código de v1.
- Despliegue: ONNX Runtime con Python (dependencias `numpy`, `onnxruntime`, `tokenizers`, `soundfile`), WebAssembly en navegador y Node, y paquetes nativos para Android e iOS con el modelo empaquetado.
- GPU recomendadas: no disponibles; el diseño del modelo no requiere GPU.
- Latencia y throughput: no disponibles. La documentación solo indica que Edge es más rápido que Large, sin cifras.
- Tamaño del repositorio completo: 1.9 GB, incluyendo los distintos bundles y artefactos para plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Gapiring Edge v2 | 110M | uzbeko | ONNX, CPU y navegador | CC BY 4.0 | 117 MB; dos voces, roles y maneras |
| Gapiring Large v2 | 336M | uzbeko | ONNX, servidor/escritorio | CC BY 4.0 | Mayor calidad de audio segun el autor |
| Gapiring Nano v1 | no disponible | uzbeko | ONNX | no disponible | 31 MB, una sola voz, para SBC |
| kyutai/pocket-tts | no disponible | no disponible | modelo base | no disponible | Base sobre la que se construye Gapiring v2 |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad o latencia.

## Limitaciones y advertencias

- Solo soporta uzbeko como idioma principal; las palabras inglesas se leen según su grafía, sin un diccionario de pronunciación dedicado como el de v1.
- Solo hay dos voces (`f1` y `m1`); no se documenta clonación de voz ni voces adicionales.
- No se han publicado benchmarks objetivos de calidad (MOS u otros), latencia ni throughput; las afirmaciones de calidad relativa entre Edge y Large provienen del autor.
- El modelo es de síntesis de voz: no realiza comprensión de texto, tool calling ni razonamiento. Cualquier función de asistente debe implementarse con un modelo de lenguaje separado.
- Riesgo de pronunciación incorrecta en nombres propios, siglas o palabras extranjeras distintas del inglés, al no existir diccionario de excepciones en v2.
- El normalizador de texto puede interpretar de forma errónea formatos numéricos o monetarios ambiguos; conviene validar la salida en dominios sensibles.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y la licencia en la redistribución.
- La licencia y condiciones del modelo base kyutai/pocket-tts deben verificarse por separado antes de un despliegue comercial, ya que la información disponible no detalla sus términos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación por parte de la comunidad.
- El tamaño del repositorio (1.9 GB) incluye artefactos para varias plataformas; en despliegues móviles conviene seleccionar únicamente el bundle necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islomov/gapi-uz-gapiring-v2
- Demo Space (Edge en navegador): `islomov/gapi-uz-gapiring-v2`
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Versión anterior: https://huggingface.co/islomov/gapi-uz-gapiring-v1
- Modelo Nano: https://huggingface.co/islomov/gapi-uz-gapiring-nano-v1
- Paquete iOS (Swift Package): https://github.com/Islomov49/gapiring-ios
- Repositorio Maven para Android: https://huggingface.co/islomov/gapi-uz-gapiring-v2/resolve/main/android/maven
- Instalación Python: `pip install gapiring`
- Instalación JavaScript: `npm install gapiring`
