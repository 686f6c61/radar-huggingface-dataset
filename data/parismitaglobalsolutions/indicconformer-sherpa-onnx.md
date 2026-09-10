# parismitaglobalsolutions/indicconformer-sherpa-onnx

## Resumen

IndicConformer + English + Hinglish es un paquete de modelos de reconocimiento automático de voz (ASR) publicado por parismitaglobalsolutions, que reúne exports ONNX cuantizados en int8 de los modelos IndicConformer de AI4Bharat para diez lenguas indias, un modelo NeMo fast-conformer CTC para inglés y dos modelos Whisper fine-tuned para Hinglish (hindi-inglés code-switched). El objetivo es ofrecer inferencia completamente offline en dispositivos Android, sin servidores ni conexión a internet. Los modelos Indic ocupan entre 150 y 200 MB en int8, la variante Hinglish Swift tiene 72,6 millones de parámetros y la Apex 807 millones. Esta iniciativa resuelve el problema de que los checkpoints originales de AI4Bharat están pensados para inferencia en servidor con PyTorch y no son prácticos para aplicaciones móviles. La relevancia actual es la necesidad de ASR multilingüe en India, donde conviven diez idiomas oficiales y el code-switching entre hindi e inglés es habitual. El paquete se integra con sherpa-onnx y proporciona validación end-to-end en hardware Android real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer/CTC (modelos Indic e inglés), Whisper encoder-decoder (modelos Hinglish) |
| Parametros totales | No disponible (el repo contiene varios modelos: Hinglish Apex 807M, Hinglish Swift 72,6M; Indic no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo ASR; sin ventana de contexto textual) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica sobre ONNX) |
| Idiomas soportados | en, hi, as, gu, pa, bn, ta, te, mr, kn, ml, más Hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

Los modelos Indic utilizan arquitectura Conformer con decodificación CTC, basados en los checkpoints de AI4Bharat. El modelo de inglés es un fast-conformer CTC de NeMo incluido en sherpa-onnx, con un vocabulario propio. Los modelos Hinglish, en cambio, pertenecen a la familia Whisper: tienen encoder y decoder separados en grafos ONNX distintos, y proceden de los fine-tunes de Oriserve sobre Whisper-Hindi2Hinglish, con salida romanizada.

Todos los pesos fueron exportados a ONNX y cuantizados dinámicamente a int8, de modo que no requieren archivos de pesos adicionales. Los benchmarks proporcionados validan las variantes Hinglish sobre Common Voice, FLEURS e Indic-Voices. No se han publicado detalles de los datos de entrenamiento ni de los procedimientos de ajuste fino para los modelos Indic o inglés en la información disponible.

## Capacidades

- Reconocimiento de voz offline en 10 lenguas indias (hindi, asamés, guyaratí, punjabí, bengalí, tamil, telugu, maratí, kannada, malayalam) y en inglés.
- Soporte de Hinglish (code-switching hindi-inglés) con transcripción en alfabeto romanizado, mediante dos variantes con distinto balance entre precisión y tamaño.
- Inferencia sin conexión a internet, sin servidores ni API keys.
- Integración directa con sherpa-onnx usando las API de Python y Kotlin/Java para Android.
- Decodificación greedy_search lista para usar en las variantes CTC y Whisper.
- Audio de entrada de 16 kHz en mono, en formato float32 numpy.
- No es un modelo de lenguaje; no realiza generación de texto libre, razonamiento, tool calling ni tareas de visión.

## Casos de uso

- Subtitulado de vídeos en aplicaciones móviles: el usuario graba audio en hindi, tamil o malayalam y la app genera subtítulos al instante. Adecuado porque cada modelo Indic ocupa ~150-200 MB y funciona sin conexión en Android de gama baja.
- Dictado por voz en teclados móviles: permite escribir en lengua local sin depender de la nube. Los modelos compactos en CPU reducen la latencia y no requieren servidores externos.
- Transcripción de reuniones bilingües en India: la variante Hinglish Apex transcribe conversaciones en las que se alternan hindi e inglés de forma natural. Está fine-tuned específicamente para ese escenario y genera salida romanizada.
- Asistente de voz offline para zonas rurales: un asistente agrícola que entiende comandos en punjabí o bengalí, sin cobertura de red. Los modelos están diseñados para funcionar sin conectividad.
- Accesibilidad para personas con discapacidad auditiva o visual: la app convierte conversaciones de voz en texto en tiempo real sobre el propio dispositivo, preservando la privacidad del usuario.
- Aplicaciones de banca móvil con comandos de voz en idiomas regionales: permite autenticar operaciones mediante voz en múltiples lenguas. La licencia Apache 2.0 habilita el uso comercial y el despliegue offline reduce la superficie de ataque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para los modelos Indic ni para el modelo de inglés. Para las variantes Hinglish se han publicado los siguientes valores de WER:

| Modelo | Base | Common Voice WER | FLEURS WER | Indic-Voices WER |
|---|---|---|---|---|
| hi-hinglish-apex | Whisper Large-V3 (pruned decoder) | 36,0% | 29,8% | 47,6% |
| hi-hinglish-swift | Whisper-base | 38,7% | 35,1% | 65,2% |

## Requisitos de hardware

- VRAM estimada: 0 MB dedicada; los modelos se ejecutan en CPU mediante ONNX Runtime o sherpa-onnx.
- GPU recomendada: no se especifica soporte para GPU en la información disponible; el caso de uso previsto es CPU y dispositivos Android.
- Tamaños en disco: modelos Indic int8 ~150-200 MB cada uno; Hinglish Swift ~120-150 MB; Hinglish Apex ~1,0 GB.
- Compatibilidad con consumer GPU: posible en hardware moderno si se prefiere ejecutar con ONNX Runtime en GPU, pero no es el objetivo del proyecto.
- Opciones de despliegue: sherpa-onnx en Python, Kotlin/Java para Android. No se documentan otras plataformas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se dispone de datos limitados para una comparativa cuantitativa. En la información proporcionada no aparecen benchmarks para los modelos Indic ni para el modelo de inglés, por lo que no es posible comparar el rendimiento con alternativas de la misma categoría. Las alternativas más cercanas son los checkpoints originales de AI4Bharat y los modelos Whisper de OpenAI, de los que no se ofrecen métricas en esta documentación. La siguiente tabla compara aspectos de disponibilidad y uso previsto:

| Modelo | Formato | Tamaño en disco (int8) | Licencia | Uso previsto |
|---|---|---|---|---|
| IndicConformer (AI4Bharat original) | PyTorch | No disponible | No disponible | Servidor |
| Whisper-base (usado como base para Hinglish Swift) | No disponible | No disponible | No disponible | Multilingüe general |
| IndicConformer + Hinglish (este repo) | ONNX int8 | 150-200 MB (Indic), 120-150 MB (Swift), ~1 GB (Apex) | Apache 2.0 | Offline Android |

## Limitaciones y advertencias

- Los modelos Hinglish presentan WER elevado, especialmente la variante Swift en Indic-Voices (65,2%), lo que puede limitar su precisión en audio ruidoso o conversacional.
- Los modelos Indic y el modelo de inglés no tienen benchmarks publicados en la información disponible; el rendimiento real debe validarse en cada caso de uso concreto.
- Riesgo de alucinación inherente a los sistemas ASR: la transcripción puede contener errores o palabras inexistentes, sobre todo en ambientes ruidosos.
- No se documenta la duración máxima de audio procesable en una sola pasada; puede ser necesario segmentar clips largos.
- Los modelos Hinglish requieren descargar tres archivos por variante (encoder, decoder y tokens) que deben usarse juntos.
- La licencia Apache 2.0 permite uso comercial, pero exige incluir la atribución y una copia de la licencia en las distribuciones derivadas.

## Enlaces

- HuggingFace: https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- AI4Bharat: https://huggingface.co/ai4bharat
- Oriserve: https://huggingface.co/Oriserve
