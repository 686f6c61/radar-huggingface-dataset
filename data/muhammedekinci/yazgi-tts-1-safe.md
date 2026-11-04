# muhammedekinci/yazgi-tts-1-safe

## Resumen

yazgi-tts-1-safe es un fork endurecido de yazgi-tts-1, un modelo de síntesis de voz (text-to-speech) en turco desarrollado originalmente por Erkam Kavak y republicado por el usuario muhammedekinci. El modelo conserva intactos los pesos, las 8 voces integradas y la salida de audio del original: con la misma semilla, cada voz produce audio idéntico bit a bit a la versión upstream, tanto en CUDA como en CPU. Lo que cambia es el empaquetado y la carga, pensados para entornos donde no se permiten ficheros pickle ni descargas de red.

El modelo resuelve un problema de seguridad en la cadena de suministro de modelos TTS: la versión original distribuía los pesos como pickle de PyTorch (`model.pt`, `codec.pt`) y ficheros `.npz`, con descargas desde el Hub en tiempo de ejecución y clonación de voz que descargaba SpeechBrain dinámicamente. Este fork convierte todo a safetensors, elimina cualquier uso de `torch.load`, `np.load` o pickle, fija hashes SHA-256 verificados antes de cada carga y exige `torch>=2.10` para mitigar CVE-2025-32434 y CVE-2026-24747.

Con 56.252.673 parámetros totales y un repositorio de 0,4 GB, es un modelo compacto orientado a despliegue en producción de voz en turco, con licencia Apache 2.0 y soporte exclusivo del idioma turco (código `tr`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con códec de audio; detalles de la arquitectura no publicados en la información disponible) |
| Parámetros totales | 56.252.673 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | turco (`tr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model`, `codec`, `voices.safetensors`) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, diseño del códec de audio ni proceso de entrenamiento). Lo que sí se documenta es que el modelo incluye un códec de audio propio: el fichero `codec.pt` original pesaba 388 MB e incluía un codificador de 72M de parámetros que solo era necesario para la clonación de voz; este fork lo reduce a 101 MB conservando únicamente el decodificador y almacenando el frame de silencio.

Los datasets empleados en el entrenamiento original, según las etiquetas del repositorio, son `cloud0day3/alania-synthetic-speech-tr`, `espnet/yodas2`, `fsicoli/common_voice_21_0` y `google/fleurs`. No se especifica el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable de este fork no está en el modelo sino en el empaquetado: verificación de integridad con SHA-256 fijado en el paquete, carga exclusiva mediante safetensors, ausencia total de acceso a red y eliminación de la funcionalidad de clonación de voz (que el autor original desaconsejaba en favor de las voces integradas).

## Capacidades

- Síntesis de voz en turco a partir de texto, con 8 voces integradas: `male-01`, `male-02`, `male-03`, `male-04`, `female-01`, `female-02`, `female-03` y `female-04`.
- Generación determinista: con la misma semilla, la salida es idéntica bit a bit a la del modelo upstream, tanto en GPU como en CPU.
- Normalización de texto en turco mediante la dependencia `normalizer-tr` (versión `>=0.7.0,<0.8`), que gestiona fechas, precios y expresiones numéricas (por ejemplo, "14 Ekim'de saat 15:30'da" o "1.299,90 TL").
- Lectura de texto largo: se han publicado muestras de párrafos de 650 a 750 caracteres con frases largas, listas, saltos de párrafo y apóstrofos tipográficos, leídos en una sola llamada.
- API HTTP incluida en el paquete, con límite de tamaño de cuerpo, comprobación de clave en tiempo constante y clave leída desde variable de entorno.
- No soporta clonación de voz (eliminada deliberadamente en este fork).
- No soporta tool calling, agentes, visión, audio de entrada ni modo thinking: es un modelo exclusivamente TTS.

## Casos de uso

- Atención al cliente automatizada en turco: el modelo puede leer respuestas generadas por un LLM en voz alta con voces consistentes (`female-03` y `male-04` están pensadas para saludos y prompts de asistente), integrándose en un pipeline de IVR o chat de voz.
- Anuncios de estado de pedidos y logística: las muestras publicadas incluyen frases con fechas, horas y plazos de entrega ("Siparişiniz 14 Ekim'de saat 15:30'da kargoya verildi"), lo que demuestra la normalización de fechas y horas necesaria en este dominio.
- Lectura de precios y resúmenes de compra: la voz `female-01` se ha probado con importes y opciones de pago a plazos ("1.299,90 TL", "433,30 TL"), adecuada para carritos y confirmaciones de e-commerce.
- Audiolibros y contenido editorial largo: las pruebas de formato largo (7,6 minutos de audio generados en 40 s en una RTX 5070 Ti Laptop, unas 11 veces tiempo real) validan su uso para narración de prosa; para texto largo se recomiendan `male-01` y `female-04` por su lectura más uniforme.
- Accesibilidad y lectura de contenidos web: conversión de artículos, noticias o documentación a audio en turco para usuarios con discapacidad visual o preferencia por consumo auditivo.
- Sistemas de megafonía y avisos públicos: anuncios de transporte, aeropuertos o comercios donde se requiere una voz clara y repetible con salida determinista.
- Despliegue en entornos de seguridad estricta: gracias a la ausencia de pickle, de descargas de red y a la verificación SHA-256, puede instalarse en infraestructuras con políticas que prohíben la carga de pesos en formato pickle o el acceso saliente a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados son de generación de audio: 7,6 minutos de audio producidos en 40 segundos en una RTX 5070 Ti Laptop, aproximadamente 11 veces tiempo real. En cuanto a estilo de lectura, se documenta que `female-01` hace pausas de hasta unos 2 segundos entre frases y lee a 7,3-7,9 s por cada 100 caracteres, frente a 5,9-7,0 s por 100 caracteres de las demás voces, de forma consistente con las semillas 0, 1 y 2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 56,25M de parámetros y pesos en safetensors, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer. El repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA para `torch>=2.10`; se ha validado en una RTX 5070 Ti Laptop. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; el cuello de botella no es la memoria sino la velocidad de generación de audio.
- Opciones de despliegue: la librería propia `yazgi-tts` (versión `0.1.0.post1` de este fork) con carga desde un directorio local, y la API HTTP incluida en el paquete. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLM, no para este TTS).
- Latencia y throughput: aproximadamente 11 veces tiempo real en RTX 5070 Ti Laptop (40 s para 7,6 minutos de audio).
- Requisito de software: `torch>=2.10`, `numpy`, `safetensors`, `normalizer-tr>=0.7.0,<0.8`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS comparables en la información proporcionada. La comparación más directa disponible es con el modelo del que deriva:

| Modelo | Formato de pesos | Carga | Integridad | Red | Clonación de voz | Licencia |
|---|---|---|---|---|---|---|
| yazgi-tts-1-safe (este fork) | safetensors | solo safetensors, sin pickle | SHA-256 fijado y verificado | ninguna, lee directorio local | eliminada | Apache 2.0 |
| yazgi-tts-1 (upstream) | pickle (`model.pt`, `codec.pt`) + `.npz` | `torch.load(weights_only=True)`, `np.load` | ninguna | descarga del Hub si no se da carpeta | `clone()` con descarga de SpeechBrain | Apache 2.0 |

## Limitaciones y advertencias

- Solo soporta turco (`tr`); no hay capacidades multilingües documentadas.
- No se han publicado datos sobre sesgos del modelo ni sobre tasas de alucinación o errores de pronunciación.
- La clonación de voz ha sido eliminada en este fork; si se necesita, hay que recurrir al modelo upstream, que el propio autor desaconseja en favor de las voces integradas.
- `female-01` presenta pausas largas (hasta ~2 s) entre frases y una velocidad de lectura más lenta en textos largos (7,3-7,9 s por 100 caracteres), lo que puede no ser adecuado para narraciones que requieran ritmo constante.
- El fork exige `torch>=2.10`, una versión más reciente que la requerida por el upstream (`torch>=2.2`), lo que puede complicar la integración en entornos con versiones de PyTorch fijadas.
- La API HTTP incluida tiene límite de tamaño de cuerpo y requiere la clave desde una variable de entorno; hay que revisar la configuración antes de exponerla en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución al autor original Erkam Kavak.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el 2026-11-04; madurez y soporte de la comunidad no verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhammedekinci/yazgi-tts-1-safe
- Modelo base (upstream): https://huggingface.co/erkamk/yazgi-tts-1
- Guía de instalación del fork: https://huggingface.co/muhammedekinci/yazgi-tts-1-safe/blob/main/docs/kurulum.md
- Muestras de audio: https://huggingface.co/muhammedekinci/yazgi-tts-1-safe/tree/main/samples
- Textos de las muestras de formato largo: https://huggingface.co/muhammedekinci/yazgi-tts-1-safe/blob/main/samples/long-form/texts.json
- Dataset `cloud0day3/alania-synthetic-speech-tr`: https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr
- Dataset `espnet/yodas2`: https://huggingface.co/datasets/espnet/yodas2
- Dataset `fsicoli/common_voice_21_0`: https://huggingface.co/datasets/fsicoli/common_voice_21_0
- Dataset `google/fleurs`: https://huggingface.co/datasets/google/fleurs
