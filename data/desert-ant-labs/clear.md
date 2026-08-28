# desert-ant-labs/clear

## Resumen

Clear es un modelo de mejora de voz (speech enhancement) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo (on-device) en plataformas Apple, Android y web. Su propósito es transformar grabaciones ruidosas y reverberantes —realizadas con micrófonos integrados de portátiles, móviles o auriculares Bluetooth— en audio con un sonido cercano al de un estudio de podcast, aplicando reducción de ruido, eliminación de reverberación y normalización de volumen.

El modelo se basa en la arquitectura DeepFilterNet (DFN3) y se distribuye en dos variantes: `clear-studio`, con un carácter silencioso y de estudio, y `clear-natural`, que preserva el tono de la sala y la textura vocal. Los artefactos pesan entre 9 y 24 MB según el formato (Core ML, ONNX, PyTorch), lo que permite su integración en aplicaciones móviles y de escritorio con requisitos mínimos de hardware. La relevancia actual radica en la creciente demanda de procesamiento de audio privado y en tiempo real, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet (DFN3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | procesa chunks fijos de 2 segundos, batch de 4 chunks |
| Tipos de cuantizacion | fp16 compute + paleta de pesos de 6 bits (Core ML); pesos fp16 con I/O fp32 (ONNX) |
| Idiomas soportados | no disponible (independiente del idioma, procesa senal de audio) |
| Licencia | desert-ant-labs-source-available-1.0 (licencia propietaria de codigo fuente disponible) |
| Formato de pesos | Core ML (mlmodelc), ONNX, PyTorch (pt) |

## Arquitectura y entrenamiento

Clear utiliza la arquitectura DeepFilterNet en su tercera generacion (DFN3), un enfoque de mejora de voz en el dominio espectral que combina filtrado profundo con caracteristicas auditivas ERB (Equivalent Rectangular Bandwidth). El contrato de entrada/salida es `spec / feat_erb / feat_spec → spec_enhanced`, donde la entrada incluye el espectrograma, caracteristicas ERB y caracteristicas espectrales, y la salida es el espectrograma mejorado. Los artefactos Core ML usan un layout planar con un batch fijo de cuatro chunks independientes de dos segundos, mientras que los artefactos ONNX conservan el layout original de DFN3.

El entrenamiento se realizo con una funcion de perdida de preservacion de detalles (detail-preservation loss) a gran escala, disenada para mantener intactos respiraciones, oclusivas y textura vocal, evitando artefactos de bombeo o ruido musical. No se han publicado datos sobre el dataset de entrenamiento (numero de horas, composicion, etc.) en la informacion disponible.

## Capacidades

- Reduccion de ruido de fondo: HVAC, teclados, ratones, ruido ambiental, ventiladores de portatil, murmullo de cafeteria.
- Dereverberacion: atenua la reverberacion de habitaciones sin tratar (dormitorios, oficinas, hoteles) sin anadir reverberacion propia.
- Normalizacion de volumen: ajusta el nivel de forma consistente para que la voz se asiente en la mezcla.
- Preservacion de la textura vocal: mantiene sibilantes sin picos duros, respiraciones y oclusivas intactas.
- Caracter sonoro tipo podcast: graves medios realzados para una presencia cercana al microfono.
- Ejecucion en tiempo real: factor de tiempo real de 302x en iPhone 16 Pro y 345x en MacBook Pro (M5) para la variante `clear-studio`.
- Compatibilidad multiplataforma: Core ML para Apple (iOS 17+, macOS 14+), ONNX para Android, Linux, Windows, navegador y Node.js.
- Sin dependencia de la nube: todo el procesamiento ocurre en el dispositivo.

## Casos de uso

- Grabacion de podcasts en entornos no acondicionados: un podcaster que graba en una cafeteria o en su salon puede obtener un audio con sonido de estudio, cercano al microfono, sin necesidad de tratar la sala ni usar plugins complejos.
- Limpieza de reuniones online: exportaciones de Zoom, Teams o Meet con ruido de fondo y reverberacion pueden procesarse con Clear para mejorar la inteligibilidad y la calidad percibida antes de publicarlas o archivarlas.
- Notas de voz y grabaciones de campo en movil: las grabaciones con el microfono integrado del iPhone o Android, incluyendo notas de voz y grabaciones de campo, se limpian de ruido ambiental y se normalizan en volumen.
- Mejora de audio para videotutoriales y screencasts: el audio capturado con el microfono del portatil mientras se teclea o se mueve el raton se limpia de golpes y ruido de fondo, produciendo un resultado mas profesional.
- Aplicaciones de voz en tiempo real: integrado en SDKs de Swift, Kotlin o JavaScript, Clear puede procesar audio en vivo en llamadas o asistentes de voz, con latencia despreciable gracias al factor de tiempo real superior a 300x.
- Postproduccion de entrevistas remotas: entrevistas grabadas con microfonos Bluetooth o auriculares en habitaciones sin tratar pueden procesarse con la variante `clear-natural` para conservar el tono de la sala cuando este forma parte de la toma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio (SNR, PESQ, STOI, etc.) en la informacion disponible. El unico dato de rendimiento publicado es el factor de tiempo real para la variante `clear-studio`, medido con el pipeline completo del SDK sobre un clip de 60 segundos (mejor de tres ejecuciones):

| Dispositivo | Factor de tiempo real |
|---|---|
| iPhone 16 Pro | 302x |
| MacBook Pro (M5) | 345x |

Ademas, la primera carga del modelo en iPhone 16 Pro tarda aproximadamente 3,4 segundos mientras Core ML compila el programa ANE; las cargas posteriores se realizan en unos 62 ms. Se recomienda calentar el modelo en segundo plano en aplicaciones.

## Requisitos de hardware

- Apple: Core ML con soporte para Apple Neural Engine (ANE). Se requiere iOS 17+ o macOS 14+ para el SDK Swift. Los artefactos Core ML usan el formato de modelo de iOS 16.
- Android: ONNX Runtime, sin requisitos especiales de GPU; el modelo puede ejecutarse en CPU.
- Escritorio y web: ONNX para Linux, Windows, navegador (via ONNX Runtime Web) y Node.js.
- VRAM: no aplica; el modelo es extremadamente ligero (9-24 MB segun formato) y se ejecuta en CPU o NPU, sin necesidad de GPU dedicada.
- Opciones de despliegue: SDKs oficiales para Swift, Kotlin y JavaScript/TypeScript, con artefactos Core ML y ONNX listos para usar.
- Latencia: factor de tiempo real superior a 300x en dispositivos Apple modernos; carga inicial de 3,4 s y carga en cache de 62 ms.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de mejora de voz (como DeepFilterNet original, RNNoise, o soluciones comerciales como Krisp). Clear comparte base arquitectonica con DeepFilterNet, pero no se han publicado metricas comparativas de calidad ni de eficiencia frente a alternativas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No es un denoiser general: la musica, los efectos de sonido y las senales no vocales se atenuan como si fueran ruido. No debe usarse para limpiar audio musical o cinematografico.
- No es un separador de fuentes: si varios hablantes se solapan, la separacion no se produce; la salida mantiene la mezcla.
- No es un cambiador de voz, clonador ni modelo de transcripcion.
- La licencia `desert-ant-labs-source-available-1.0` es una licencia propietaria de codigo fuente disponible. Antes de un uso comercial, es imprescindible revisar los terminos en https://license.desertant.com/1.0.
- Los idiomas soportados no estan documentados; el modelo procesa la senal de audio independientemente del idioma, pero la calidad puede variar con acentos o idiomas no representados en los datos de entrenamiento (no publicados).
- En aplicaciones en tiempo real, el primer uso puede tardar varios segundos en compilar el programa ANE; se recomienda precargar el modelo.
- No se han publicado detalles sobre sesgos o artefactos en condiciones extremas de ruido o en habla no inglesa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/clear
- Pagina oficial del modelo: https://desertant.com/models/clear/
- Sitio de Desert Ant Labs: https://desertant.com/
- Documentacion del SDK (Swift, Kotlin, JS): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/clear.md
- Repositorio del SDK principal: https://github.com/Desert-Ant-Labs/desert-ant-core
- Repositorio Kotlin para Android: https://github.com/Desert-Ant-Labs/clear-kotlin
- Licencia: https://license.desertant.com/1.0
