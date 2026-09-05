# shadowtec/Audio8-TTS-0.1B-ONNX-W8A16

## Resumen

Audio8-TTS-0.1B-ONNX-W8A16 es una exportación experimental en formato ONNX del modelo compacto de texto a voz (TTS) Audio8-TTS-Preview-0.1B, desarrollado originalmente por Audio8-AI. Esta variante concreta ha sido generada por el usuario shadowtec como un modelo de cuantización *weight-only* de 8 bits (W8A16) y no es una versión oficial. Su propósito es ofrecer una alternativa de inferencia en CPU que evite la ruta de cuantización U8S8 (`MatMulInteger` con activaciones dinámicas) presente en el export ONNX INT8 oficial, que producía audio corrupto en algunos sistemas Windows/AMD AVX2.

El modelo base es un TTS autoregresivo de aproximadamente 0.1B de parámetros, con soporte para clonación de voz *zero-shot* y generación de voz en ocho idiomas. La exportación W8A16 utiliza operadores `com.microsoft::MatMulNBits` con 8 bits por peso, bloque de 128 y cuantización asimétrica, preservando las interfaces de entrada y salida del modelo ONNX oficial. Esto permite integrarlo en el runtime de Audio8 sin modificar el código de inferencia, siempre que se use ONNX Runtime 1.22 o superior con CPUExecutionProvider.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo de dos etapas (Slow AR y Fast AR) sobre la base de Audio8-TTS-Preview-0.1B; export ONNX con cuantización weight-only INT8 (W8A16) |
| Parametros totales | 0.1B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16: `MatMulNBits` con bits=8, block_size=128, accuracy_level=4, cuantización asimétrica por bloques, activación FP16 en cada operación lineal |
| Idiomas soportados | zh, en, de, es, fr, it, ja, ko |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | ONNX (archivos de modelo ONNX con pesos cuantizados) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Audio8-TTS-Preview-0.1B se compone de dos etapas autoregresivas denominadas Slow AR y Fast AR, con 217 y 21 capas lineales respectivamente. Este diseño es característico de modelos de TTS que generan tokens de audio en dos niveles: una primera etapa de tokens semánticos y una segunda de tokens de audio de alta fidelidad. La variante W8A16 no altera la arquitectura ni los pesos originales, sino que cuantiza directamente los 238 pesos lineales desde el checkpoint BF16 en `model.safetensors`. No se recuperaron ni requantizaron a partir de los pesos ONNX W8A8 oficiales; estos se usaron únicamente como plantilla estructural para mantener los contratos públicos de entrada, salida, caché y códec.

La innovación técnica principal es el uso de `com.microsoft::MatMulNBits` con precisión de 8 bits por peso, en lugar de la ruta U8S8 con `MatMulInteger` y `DynamicQuantizeLinear`. Esta elección elimina la cuantización dinámica de activaciones y, según el autor, evita la corrupción del audio observada en un sistema de prueba con Windows/AMD AVX2. El resultado es un modelo con 238 nodos `MatMulNBits(bits=8)`, cero nodos `MatMulInteger` y cero nodos `DynamicQuantizeLinear`. No se dispone de información detallada sobre los datos de entrenamiento del modelo base, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a voz en ocho idiomas: chino, inglés, alemán, español, francés, italiano, japonés y coreano.
- Clonación de voz *zero-shot*: el modelo puede sintetizar voz a partir de una voz de referencia sin necesidad de entrenamiento adicional, según la documentación del repositorio oficial.
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`, sin necesidad de GPU.
- Compatibilidad con el runtime oficial de Audio8: preserva los nombres, formas y tipos de datos de entrada y salida del modelo ONNX 0.1B oficial, por lo que no requiere cambios en el algoritmo de inferencia ni en el manejo de caché.
- Selección automática de la variante W8A16 a través de `runtime_manifest.json`, incluido un alias de compatibilidad para el selector `int8` de launcher oficiales que fuercen `ARKTTS_PRECISION=int8`.
- No incluye soporte para tool calling, agentes, visión ni otras capacidades fuera de la síntesis de voz.

## Casos de uso

- Asistentes de voz locales con CPU: gracias a su ejecución mediante ONNX Runtime en CPU, el modelo es adecuado para asistentes de voz en equipos sin GPU, sistemas embebidos o portátiles antiguos, ofreciendo síntesis de voz multilingüe con una huella de memoria reducida (el repositorio ocupa 0.9 GB).
- Narración de audiobooks multilingüe: la clonación de voz *zero-shot* permite generar narraciones con una voz de referencia personalizada en ocho idiomas, lo que facilita la producción de contenido de audio en distintos mercados sin necesidad de locutores humanos ni de entrenamiento específico.
- Sistemas de respuesta interactiva por voz (IVR) en atención al cliente: el modelo puede generar respuestas vocales sintéticas en varios idiomas para sistemas telefónicos automatizados, aprovechando su bajo coste computacional para ejecutarse en servidores de propósito general.
- Localización de contenido audiovisual: puede emplearse para doblaje o para generar pistas de audio localizadas en ocho idiomas, usando voces clonadas de los actores originales y manteniendo un despliegue asequible en infraestructura CPU.
- Herramientas de accesibilidad para personas con discapacidad visual: permite la lectura de texto en voz alta en múltiples idiomas con una voz de referencia, ejecutándose de forma local para preservar la privacidad del usuario.
- Educación y aprendizaje de idiomas: la capacidad de generar ejemplos de pronunciación en ocho idiomas con voces personalizables resulta útil en aplicaciones educativas que se ejecutan en dispositivos sin GPU, como ordenadores de aula o tabletas.
- Prototipado rápido de TTS en producción: al mantener las interfaces ONNX oficiales, el modelo puede integrarse en pipelines existentes sin cambios de código, lo que simplifica la evaluación de la cuantización W8A16 frente a la ruta oficial en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio (MOS, WER, etc.) en la información disponible. Sin embargo, se aportan datos de rendimiento de inferencia medidos en un sistema con Windows 11, AMD Ryzen 5 5600, ONNX Runtime 1.23.2 y 4 hilos:

| Variante | Velocidad (AR frames/s) |
|---|---|
| W8A16 (este modelo) | 9.86 |
| U8U8 (control verificado) | 10.01 |
| PyTorch FP32 CPU (modelo original) | 7.44 |

Además, la primera pasada de prefill presenta una correlación de logits de aproximadamente 0.991 con un control U8U8 verificado y selecciona el mismo primer token semántico en el diagnóstico fijo. Estas cifras indican que la cuantización W8A16 es ligeramente más lenta que la ruta U8U8 en ese sistema, pero claramente más rápida que la inferencia original en PyTorch FP32.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM, ya que la variante está diseñada para ejecutarse en CPU.
- RAM estimada: no se especifica, pero el repositorio ocupa 0.9 GB, lo que sugiere un uso de memoria moderado, probablemente en torno a 1-2 GB de RAM durante la inferencia.
- GPU recomendadas: no aplica; la ejecución se realiza con `CPUExecutionProvider`. No se proporciona información sobre soporte para GPU.
- Compatibilidad con GPU de consumo: no aplica, al ser un export específico para CPU.
- Opciones de despliegue: ONNX Runtime 1.22 o superior con `CPUExecutionProvider`; también se puede integrar en el runtime oficial de Audio8_TTS mediante el directorio `onnx_runtime_0_1b_int8`.
- Latencia y throughput: en el sistema de prueba (AMD Ryzen 5 5600, 4 hilos, ORT 1.23.2) alcanza 9.86 AR frames/s.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Velocidad CPU (AR frames/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8-TTS-0.1B-ONNX-W8A16 (este) | 0.1B | W8A16 (`MatMulNBits` 8 bits) | 9.86 | audio8-community-license-v1.0 | Repositorio HuggingFace de shadowtec |
| Audio8-TTS-0.1B-ONNX-INT8 oficial (W8A8) | 0.1B | U8S8 (`MatMulInteger` + `DynamicQuantizeLinear`) | 10.01 | audio8-community-license-v1.0 | HuggingFace de Audio8 |
| Audio8-TTS-Preview-0.1B (BF16 PyTorch) | 0.1B | Sin cuantizacion (BF16) | 7.44 | audio8-community-license-v1.0 | HuggingFace de Audio8 |
| Audio8-TTS-0.6B-INT4-ONNX (oficial) | 0.6B | W4A16 (`MatMulNBits` 4 bits) | no disponible | audio8-community-license-v1.0 | HuggingFace de Audio8 |

La comparación se limita a las variantes del mismo modelo base, ya que no se dispone de datos sobre otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una versión oficial de Audio8. Se trata de un export experimental de un tercero, por lo que el modelo oficial debe mantenerse como referencia de calidad y compatibilidad.
- La licencia audio8-community-license-v1.0 permite el uso no comercial gratuito y el uso comercial solo por debajo del umbral de ingresos anuales especificado en el texto de la licencia. Es imprescindible consultar el archivo `LICENSE` original antes de cualquier uso comercial.
- La cuantización es real y no bit-exacta: las secuencias de tokens y las formas de onda generadas no son idénticas a las del modelo BF16 o U8U8. Esto puede introducir variaciones en la calidad del audio.
- Solo se ha validado en Windows 11 con AMD Ryzen 5 5600 y ONNX Runtime 1.23.2. No se han realizado pruebas en Linux, macOS ni en otras CPUs, por lo que el comportamiento en esos entornos no está garantizado.
- Aunque el autor indica que la variante W8A16 evita el problema de audio corrupto asociado a la ruta U8S8, se recomienda realizar pruebas auditivas exhaustivas en el sistema de destino antes de usarla en producción.
- El modelo soporta ocho idiomas, pero no se aportan datos sobre la calidad relativa entre ellos. El rendimiento en español o en otros idiomas puede variar.
- No se ha documentado la longitud de contexto máxima, lo que limita la evaluación de su comportamiento con textos largos.
- No se proporcionan datos sobre riesgos de alucinación, sesgos ni medidas de mitigación más allá de la validación descrita.

## Enlaces

- HuggingFace: https://huggingface.co/shadowtec/Audio8-TTS-0.1B-ONNX-W8A16
- Repositorio del runtime experimental: https://github.com/Aaaou/Audio8_TTS/tree/experiment/onnx-w8a16
- Documento del experimento ONNX W8A16: https://github.com/Aaaou/Audio8_TTS/blob/experiment/onnx-w8a16/docs/onnx-w8a16-experiment.md
- Informe de benchmark en Windows/AMD: https://github.com/Aaaou/Audio8_TTS/blob/experiment/onnx-w8a16/docs/onnx-w8a16-benchmark-windows-amd.md
- Repositorio oficial de Audio8_TTS: https://github.com/Audio8-AI/Audio8_TTS
- Directorio del runtime oficial para 0.1B INT8: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime_0_1b_int8
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
