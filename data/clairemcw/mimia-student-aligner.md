# clairemcw/mimia-student-aligner

## Resumen

Mimia student aligner es una familia de dos modelos CTC pequeños y multilingües para alineamiento forzado (forced alignment) a nivel de palabra, utilizados por la aplicación Mimia. El modelo ha sido desarrollado por Claire McWhite (clairemcw) y se distribuye en formato ONNX cuantizado a int8, con licencia Apache 2.0. Su función no es la transcripción libre, sino determinar con precisión en qué instante del audio se pronuncia cada palabra cuando se dispone de la transcripción de referencia.

La relevancia del modelo reside en su tamaño extremadamente reducido (10,6 MB y 23,1 MB) y en su entrenamiento por destilación a partir de Omnilingual ASR CTC 300M v2 de Meta, un modelo maestro con licencia Apache 2.0 y exportación a sherpa-onnx realizada por csukuangfj. El alumnado se ha entrenado sobre audio de FLEURS (Google, CC BY 4.0) en 102 idiomas, lo que le confiere cobertura multilingüe amplia con un coste computacional mínimo.

El resultado es un componente ligero y desplegable en CPU que resuelve el problema del alineamiento temporal de transcripciones en pipelines de ASR, subtitulado o evaluación de pronunciación, sin necesidad de infraestructura GPU. Ambos ficheros comparten el vocabulario de salida de Omnilingual v2 (`tokens.txt`), lo que facilita su integración con el ecosistema sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) sobre red neuronal destilada; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio continuo de 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | int8 (ambos ficheros distribuidos como `.int8.onnx`) |
| Idiomas soportados | 102 idiomas (entrenado sobre FLEURS); listado concreto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

La arquitectura es un modelo CTC destilado (student) a partir del maestro Omnilingual ASR CTC 300M v2 de Meta. El alumnado recibe directamente la forma de onda en bruto a 16 kHz mono y normaliza la señal internamente, por lo que no requiere un frontend de extracción de características externo. La salida utiliza el vocabulario de Omnilingual v2 (`tokens.txt`), lo que garantiza compatibilidad con el ecosistema sherpa-onnx y con el modelo maestro exportado por csukuangfj.

El entrenamiento se realizó sobre audio de FLEURS en 102 idiomas, con destilación del maestro hacia dos variantes de alumnado: una más pequeña (10,6 MB) y otra más grande (23,1 MB), ambas en la iteración "run 4" y cuantizadas a int8. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales de regularización o ajuste fino. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Alineamiento forzado a nivel de palabra: dado un audio y su transcripción, devuelve las marcas temporales de cada palabra.
- Multilingüe: cobertura de 102 idiomas según el conjunto de entrenamiento FLEURS.
- Entrada de audio en bruto: acepta forma de onda mono a 16 kHz y normaliza internamente.
- Salida CTC compatible con el vocabulario de Omnilingual v2 (`tokens.txt`).
- Ejecución en CPU: el tamaño reducido y el formato ONNX int8 permiten inferencia sin GPU.
- Integración con sherpa-onnx: diseñado para el pipeline de alineamiento de dicha herramienta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es un modelo especializado exclusivamente en alineamiento.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Subtitulado automático con marcas temporales: a partir de una transcripción ya validada, el modelo proporciona los tiempos de inicio y fin de cada palabra para generar subtítulos sincronizados, gracias a su salida CTC a nivel de token.
- Evaluación de pronunciación en aplicaciones de aprendizaje de idiomas: al alinear la transcripción esperada con el audio del estudiante, se pueden detectar desviaciones temporales o palabras omitidas sin necesidad de GPU.
- Post-procesado de pipelines ASR: si un sistema de reconocimiento de voz genera texto pero no timestamps fiables, este alineador refina la sincronización palabra a palabra sobre la transcripción final.
- Indexación y búsqueda en archivos de audio: al disponer de transcripciones, el alineador permite crear índices temporales para saltar a la palabra exacta dentro de un fichero largo.
- Herramientas de accesibilidad: generación de subtítulos sincronizados para vídeo o audio en 102 idiomas con un coste de cómputo mínimo, desplegable en servidores modestos o incluso en el dispositivo.
- Investigación lingüística y corpus orales: alineamiento masivo de grabaciones con sus transcripciones para estudios fonéticos o de duración vocálica, aprovechando la cobertura multilingüe y el reducido tamaño de los modelos.
- Integración en aplicaciones de escritorio o móviles: el formato ONNX int8 y el tamaño de 10,6 MB permiten empaquetar el alineador dentro de la propia aplicación Mimia sin dependencias de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; los modelos están pensados para ejecución en CPU. En caso de usar GPU, el consumo sería inferior a 1 GB en ambos casos.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para CPU, cualquier procesador moderno x86-64 o ARM.
- Cabe en GPU de consumo: sí, holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no es su entorno objetivo.
- Opciones de despliegue: ONNX Runtime, sherpa-onnx (entorno natural del modelo), y cualquier runtime compatible con ONNX int8.
- Latencia y throughput estimados: no disponibles. Por el tamaño (10,6 MB y 23,1 MB) se espera una latencia muy baja en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mimia student aligner (s6-r4) | no disponible (10,6 MB int8) | 102 idiomas | ONNX int8 | Apache 2.0 | Hugging Face |
| Mimia student aligner (s15-r4) | no disponible (23,1 MB int8) | 102 idiomas | ONNX int8 | Apache 2.0 | Hugging Face |
| Omnilingual ASR CTC 300M v2 (maestro) | 300M | 102 idiomas (FLEURS) | ONNX int8 (export sherpa-onnx) | Apache 2.0 | Hugging Face (clairemcw/omnilingual-asr-300M-ctc-v2-int8) |
| Whisper small (referencia ASR) | ~244M | multilingüe | safetensors, ONNX | MIT | Hugging Face (OpenAI) |

La comparativa directa con alternativas de alineamiento forzado (por ejemplo, Montreal Forced Aligner o WhisperX) no está disponible en la información proporcionada. Frente al maestro Omnilingual ASR CTC 300M v2, el alumnado reduce el tamaño en más de un orden de magnitud a costa de una precisión que no se ha cuantificado públicamente.

## Limitaciones y advertencias

- Modelo especializado: no genera transcripciones libres ni texto; solo alinea una transcripción dada con el audio. No debe usarse como ASR autónomo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la precisión del alineamiento frente al maestro ni frente a alternativas, lo que dificulta evaluar su idoneidad en producción.
- Idiomas: aunque se declaran 102 idiomas, no se especifica el listado ni el rendimiento por idioma; la cobertura real puede variar.
- Sesgos: no documentados. Al entrenarse sobre FLEURS, puede heredar los sesgos de dominio y de hablantes de ese corpus (audio de lectura, condiciones controladas).
- Alucinación: al ser un modelo CTC de alineamiento, el riesgo se manifiesta como desalineamientos o marcas temporales incorrectas, no como texto inventado.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Meta (maestro), a Google FLEURS (datos) y al autor del modelo.
- Repositorio de 0,0 GB y sin descargas ni likes: la disponibilidad y el mantenimiento futuro no están garantizados; conviene verificar la integridad de los ficheros antes de desplegar.
- Fecha de creación futura (2026-11-08): metadato anómalo que puede indicar un repositorio recién publicado o un error de registro; conviene contrastar la información antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/clairemcw/mimia-student-aligner
- Modelo maestro (Omnilingual ASR 300M CTC v2 int8): https://huggingface.co/clairemcw/omnilingual-asr-300M-ctc-v2-int8
- Perfil del autor en Hugging Face: https://huggingface.co/clairemcw/models
- Modelos del autor (listado): https://huggingface.co/models?author=clairemcw&sort=modified
