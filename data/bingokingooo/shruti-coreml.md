# bingokingooo/shruti-coreml

## Resumen

Shruti Core ML es una colección de ports experimentales a Core ML de la familia de modelos Shruti de Udgam Labs, orientados al reconocimiento automático de voz (ASR) en dispositivos Apple. El autor del repositorio, bingokingooo, no es el desarrollador original del modelo base: se trata de un trabajo de conversión independiente que reconstruye los pesos CQ4 publicados por Udgam Labs y los envuelve en grafos Core ML en float32, junto con un decodificador host de cinco haces derivado del runner ONNX original. Cada archivo ZIP corresponde a un idioma concreto (más inglés) y el conjunto completo suma 22 bundles publicados.

El modelo base se apoya en Cactus Whistle, el motor de inferencia de Cactus Compute, y está pensado para ejecución on-device en macOS e iOS. El repositorio ocupa 4,6 GB y cada ZIP individual ronda los 208-209 MB, un tamaño inflado por almacenar las constantes del grafo en float32. La licencia es Apache 2.0, heredada del modelo original, y el autor insiste en que el paquete es para evaluación, no para producción sin validación adicional.

La relevancia actual del proyecto es doble: por un lado, demuestra la viabilidad de portar modelos ASR multilingües a Core ML con paridad razonable frente al motor Cactus en hindi; por otro, documenta explícitamente las diferencias de aritmética de activaciones y caché respecto al motor nativo, lo que lo convierte en un caso útil para quienes evalúan alternativas de despliegue on-device en el ecosistema Apple. No obstante, se trata de un artefacto experimental con cero descargas y sin benchmarks completos por idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR de Udgam Labs convertido a grafos Core ML en float32; familia Shruti) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos CQ4 reconstruidos; grafos Core ML en float32 |
| Idiomas soportados | Cada archivo cubre su idioma nominal más inglés; lista completa de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquetes compilables), con `model.json`, `packages/`, `LICENSE` y `NOTICE` por ZIP |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo Shruti original (número de capas, dimensión oculta, tipo de encoder/decoder, etc.). Lo que sí se documenta es el proceso de conversión: se reconstruyen los pesos CQ4 liberados por Udgam Labs y se generan grafos Core ML en float32 con características acústicas de longitud auténtica y un decodificador host de cinco haces derivado del runner ONNX de Udgam Labs. El motor nativo original difiere en la aritmética de activaciones y de caché, lo que el autor señala como causa probable de las pequeñas discrepancias observadas en las métricas.

No se especifican datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) porque el repositorio es un port, no un entrenamiento nuevo. La innovación técnica destacable es precisamente el pipeline de conversión a Core ML y la preservación de la licencia y el NOTICE originales. Los 22 bundles compilaron y pasaron una prueba de humo en CPU de macOS con un clip de voz forzado a inglés y silencio digital; esa prueba verifica ejecución, no precisión en idiomas regionales.

## Capacidades

- Reconocimiento automático de voz (ASR) on-device para el idioma nominal de cada archivo y para inglés.
- Decodificación con cinco haces mediante un decodificador host derivado del runner ONNX de Udgam Labs.
- Ejecución en CPU de macOS verificada mediante prueba de humo (22 bundles compilados).
- Manejo de silencio digital: en la comprobación local de 100 clips de silencio, ambos motores devolvieron cero palabras.
- Capacidades multilingües limitadas al conjunto de archivos publicados (un ZIP por idioma); la lista completa de idiomas no está disponible en la información proporcionada.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de voz a texto en aplicaciones macOS/iOS: el paquete Core ML se compila localmente para la plataforma Apple objetivo y permite ejecutar ASR sin conexión, útil en apps de notas o dictado que requieren privacidad y baja latencia.
- Subtitulado automático de reuniones o clases en hindi e inglés: los benchmarks publicados en Monsoon Hindi y FLEURS Hindi muestran un WER en torno al 20 %, adecuado para borradores que luego se revisan manualmente.
- Evaluación comparativa de motores on-device: el repositorio incluye protocolo de evaluación y agregados en `benchmarks/`, lo que permite contrastar Core ML frente a Cactus Whistle en las mismas referencias públicas.
- Investigación sobre portabilidad de modelos ASR a Core ML: sirve como referencia para estudiar el impacto de la aritmética de activaciones y caché en la precisión final.
- Prototipado de asistentes de voz locales en el ecosistema Apple: al no requerir servidor, encaja en escenarios con requisitos estrictos de residencia de datos.
- Verificación de integridad y trazabilidad de pesos: el manifiesto de release incluye checksums y revisiones exactas de los modelos upstream, útil en pipelines de auditoría de modelos.

## Benchmarks y rendimiento

| Benchmark | Cactus Whistle | Shruti Core ML | Diferencia |
|---|---|---|---|
| Monsoon Hindi (753 clips, OIWER) | 20,43 % | 20,24 % | No indicada |
| FLEURS Hindi (418 clips, WER) | 20,56 % | 20,90 % | +0,34 pp (IC 95 %: +0,06 a +0,66) |
| Silencio local (100 clips) | 0 palabras | 0 palabras | Sin diferencia |

La diferencia en FLEURS queda fuera de la regla de paridad del port upstream según las referencias públicas locales. La paridad completa por idioma está pendiente y los agregados se publican en `benchmarks/` a medida que estén disponibles. No se han publicado resultados de MMLU, HumanEval ni GSM8K porque el modelo es de ASR, no de lenguaje general.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; cada ZIP ronda los 208-209 MB y el repositorio completo ocupa 4,6 GB, por lo que la inferencia de un solo idioma debería caber en memoria unificada de equipos Apple modernos.
- GPU recomendadas: no se especifican; la prueba de humo se realizó en CPU de macOS.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue está orientado a plataformas Apple (Core ML), no a GPUs NVIDIA.
- Opciones de despliegue: compilación local de los paquetes Core ML para la plataforma Apple objetivo; el motor de referencia es Cactus Whistle (ONNX).
- Latencia y throughput: no disponibles. El autor advierte que una compilación y prueba de humo correctas no establecen paridad de precisión, tamaño, velocidad ni memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shruti Core ML (este) | Port Core ML de ASR Shruti | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Cactus Whistle | Motor ASR de referencia (ONNX) | No disponible | No disponible en la información | Hugging Face (Cactus-Compute/whistle) |
| Shruti original (Udgam Labs) | Modelo ASR nativo | No disponible | No disponible en la información | GitHub udgamlabs/shruti |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de otros proveedores; la comparación se limita a las variantes del propio linaje Shruti/Cactus.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y lo destina a evaluación, no a producción sin mediciones adicionales de precisión y comportamiento en dispositivo.
- Paridad incompleta: la paridad de benchmarks por idioma está pendiente; solo hay datos públicos para hindi (Monsoon y FLEURS).
- Diferencia estadísticamente significativa en FLEURS (+0,34 pp, IC 95 % fuera de la regla de paridad), lo que sugiere desviaciones respecto al motor nativo.
- La prueba de humo se hizo con un clip forzado a inglés y silencio; no mide precisión en idiomas regionales.
- Tamaño inflado por float32: los ZIP de 208-209 MB podrían reducirse con otras representaciones, pero no se documenta.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos ni tasas de alucinación; al ser ASR, el riesgo se traduce en transcripciones incorrectas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben preservar LICENSE y NOTICE originales y verificar las condiciones del modelo upstream.
- Idiomas soportados no listados de forma completa; cada archivo cubre un idioma más inglés.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bingokingooo/shruti-coreml
- Informe de la familia Shruti: https://udgamlabs.com/research/shruti-family
- Evaluación original en hindi: https://udgamlabs.com/research/shruti
- Repositorio Udgam Labs Shruti: https://github.com/udgamlabs/shruti
- Cactus Whistle original: https://huggingface.co/Cactus-Compute/whistle
