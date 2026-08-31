# lnkiai/supertonic-3-mirror

## Resumen

Supertonic 3 es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Supertone Inc., diseñado para inferencia local en dispositivos sin necesidad de GPU ni conexión a la nube. Con solo 99 millones de parámetros, se ejecuta mediante ONNX Runtime y es capaz de generar audio de alta calidad en 31 idiomas, ampliando las 5 lenguas de su predecesor Supertonic 2. El modelo incluye estilos de voz preestablecidos y soporta etiquetas de expresión como `<laugh>`, `<breath>` y `<sigh>`.

La relevancia actual de Supertonic 3 radica en su ligereza y portabilidad: puede desplegarse en CPU, lo que lo hace adecuado para aplicaciones embebidas, asistentes de voz y sistemas de atención al cliente sin depender de servicios externos. Sin embargo, el proyecto open-source ha sido discontinuado por Supertone Inc. tras agosto de 2026, y el repositorio de GitHub está archivado. El mirror que se analiza aquí (lnkiai/supertonic-3-mirror) es una copia íntegra sin modificaciones del modelo original, conservando la licencia BigScience Open RAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la documentación pública) |
| Parametros totales | 99 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto generativo) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato ONNX sin cuantización declarada) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience Open RAIL-M |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo (tipo de red neuronal, capas, mecanismos de atención, etc.) en la información disponible. Se sabe que es un sistema de síntesis de voz ligero, optimizado para ejecución en CPU mediante ONNX Runtime, con un tamaño de 99 millones de parámetros. El modelo se distribuye con estilos de voz fijos preestablecidos y permite la creación de estilos personalizados mediante la herramienta Voice Builder, que generaba embeddings de voz a partir de audio de referencia. No obstante, Voice Builder dejó de estar disponible tras el 31 de agosto de 2026, coincidiendo con la discontinuación del proyecto.

En cuanto al entrenamiento, no se dispone de datos sobre el corpus utilizado, el número de horas de audio, ni si se aplicaron técnicas como RLHF o ajuste fino supervisado. La documentación oficial solo menciona mejoras en la estabilidad de lectura (menos repeticiones y saltos) y una mayor similitud de voz respecto a Supertonic 2.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo inglés, coreano, japonés, español, francés, alemán, árabe, hindi y vietnamita, entre otros.
- Generación de audio en tiempo real o casi tiempo real en CPU, sin necesidad de GPU ni conexión a internet.
- Estilos de voz preestablecidos (por ejemplo, "M1") que permiten seleccionar diferentes timbres y características vocales.
- Soporte de etiquetas de expresión en el texto de entrada: `<laugh>`, `<breath>` y `<sigh>`, que añaden matices emocionales a la síntesis.
- Capacidad de clonación de voz zero-shot mediante la herramienta Voice Builder (ya no disponible), que generaba estilos personalizados a partir de audio de referencia.
- Inferencia local completa: todo el procesamiento se realiza en el dispositivo, sin llamadas a la nube.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en múltiples idiomas para sistemas IVR o chatbots telefónicos, funcionando en servidores de bajo coste sin GPU.
- Audiolibros y narración de contenidos: con sus 31 idiomas y etiquetas de expresión, permite producir audiolibros con matices emocionales (risas, suspiros) de forma automatizada.
- Asistentes de voz en dispositivos embebidos: al ejecutarse en CPU con solo 0,4 GB de pesos, es viable en Raspberry Pi, routers o dispositivos IoT para interfaces de voz locales.
- Doblaje y localización de vídeo: la síntesis multilingüe facilita la generación de pistas de voz para vídeos, presentaciones o material educativo en diferentes idiomas.
- Accesibilidad: puede integrarse en lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual, ofreciendo voz sintetizada sin depender de servicios externos.
- Prototipado rápido de productos de voz: los desarrolladores pueden generar muestras de voz para pruebas de concepto o demos sin necesidad de contratar locutores ni usar APIs de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre calidad de voz (MOS), velocidad de síntesis (RTF) ni comparaciones con otros modelos TTS en la documentación del mirror ni en la web oficial.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse con ONNX Runtime en procesadores x86 y ARM, sin necesidad de GPU.
- Memoria: el repositorio ocupa 0,4 GB, por lo que la carga en RAM es reducida (estimación de ~200-400 MB según el runtime).
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en ordenadores portátiles, mini-PCs y dispositivos embebidos.
- Opciones de despliegue: SDK de Python (`pip install supertonic`), ONNX Runtime directamente, o integración en aplicaciones C++/Rust mediante el runtime ONNX.
- Latencia y throughput: no se han publicado cifras oficiales, pero al ser un modelo de 99M parámetros en CPU se espera una síntesis casi en tiempo real para frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Supertonic 3 | 99M | 31 | ONNX | Open RAIL-M | CPU |
| Piper TTS | ~50-100M | ~20 | ONNX | MIT | CPU |
| Coqui TTS (VITS) | ~100M | ~20 | PyTorch | MPL-2.0 | CPU/GPU |
| Edge TTS (Microsoft) | No disponible | ~50 | API | Propietaria | Nube |

Supertonic 3 destaca por su amplio soporte de idiomas (31) y su formato ONNX optimizado para CPU, similar a Piper. A diferencia de Coqui TTS, que requiere PyTorch y más recursos, Supertonic 3 es más ligero y portable. Sin embargo, el proyecto está discontinuado, mientras que Piper y Coqui mantienen desarrollo activo.

## Limitaciones y advertencias

- Proyecto discontinuado: Supertone Inc. ha archivado el repositorio de GitHub y ya no ofrece soporte ni desarrollo. No se esperan actualizaciones ni correcciones de errores.
- Voice Builder no disponible: la herramienta para crear estilos de voz personalizados dejó de funcionar tras el 31 de agosto de 2026, limitando la personalización a los estilos preestablecidos incluidos.
- Restricciones de licencia: la licencia BigScience Open RAIL-M impone restricciones de uso, incluyendo la prohibición de suplantar a personas sin consentimiento, la obligación de divulgar que el contenido es generado por máquina, y la prohibición de acoso o difamación. Estas restricciones deben transmitirse si se redistribuyen los pesos.
- Riesgo de alucinación en la lectura: aunque se mejoró la estabilidad, el modelo puede presentar errores de pronunciación o entonación en textos complejos, especialmente en idiomas con ortografía irregular.
- Sin soporte de voz en tiempo real para conversaciones bidireccionales: el modelo está orientado a síntesis de texto a voz, no a diálogo interactivo con detección de actividad de voz.
- Sin capacidad de control fino de prosodia: las etiquetas de expresión son limitadas (risa, respiración, suspiro) y no permiten un control detallado de tono, velocidad o énfasis.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/lnkiai/supertonic-3-mirror
- Modelo original: https://huggingface.co/Supertone/supertonic-3
- Repositorio de GitHub (archivado): https://github.com/supertone-inc/supertonic
- Demo de audio: https://supertonic3.github.io/
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Licencia (Open RAIL-M): https://huggingface.co/lnkiai/supertonic-3-mirror/blob/main/LICENSE
