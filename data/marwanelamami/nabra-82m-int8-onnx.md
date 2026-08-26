# marwanelamami/nabra-82m-int8-onnx

## Resumen

Nabra-82M INT8 es una variante cuantizada a INT8 del modelo de síntesis de voz en árabe Nabra-82M-v0.1, desarrollada por marwanelamami para su despliegue en dispositivos con recursos limitados. El modelo base, creado por oddadmix, emplea una arquitectura StyleTTS2 con vocoder ISTFTNet y está especializado en árabe. Esta versión INT8 reduce el tamaño del archivo a 83 MB, frente a los 325 MB de la versión FP32, manteniendo una calidad de audio que el autor describe como limpia y validada auditivamente.

La cuantización se realizó mediante calibración post-entrenamiento con escalas de pesos por canal, sin reentrenamiento (QAT-free). El modelo conserva la misma interfaz que la versión FP32: acepta tokens de entrada, un vector de estilo de 256 dimensiones y un parámetro de velocidad, y genera audio a 24 kHz. Con un factor de tiempo real (RTF) de aproximadamente 0,68 en un Snapdragon 865 con 4 hilos, está pensado para inferencia en tiempo real en dispositivos móviles y entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 con vocoder ISTFTNet (inferido de las etiquetas del modelo) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (este repositorio); FP32/FP16 (variante original); INT4-QAT (variante hermana) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base Nabra-82M-v0.1 emplea una arquitectura StyleTTS2, un sistema de síntesis de voz basado en transformadores, junto con un vocoder ISTFTNet para la generación de la forma de onda. El modelo está entrenado específicamente para árabe y acepta un vector de estilo de 256 dimensiones que permite controlar las características prosódicas y tímbricas de la voz sintetizada. La entrada adicional de velocidad (speed) permite ajustar la tasa de habla.

La cuantización a INT8 se realizó mediante calibración post-entrenamiento con escalas de pesos por canal, sin aplicar cuantización consciente del entrenamiento (QAT-free). Esto implica que los rangos dinámicos de los pesos se calibraron a partir del modelo FP32 ya entrenado, sin reentrenamiento adicional. El autor reporta que la calidad de audio resultante es limpia, con un ruido de fondo mínimo en comparación con la variante INT4-QAT, que presenta un suelo de ruido perceptible bajo el habla.

## Capacidades

- Síntesis de voz en árabe a 24 kHz.
- Control de estilo mediante vector de referencia de 256 dimensiones (ref_s), que permite ajustar prosodia y timbre; el autor sugiere usar el vector predefinido `voices_af_msa.pt["af_msa"]`.
- Control de velocidad de habla mediante el parámetro `speed`.
- Inferencia en tiempo real en dispositivos móviles (RTF ≈ 0,68 en Snapdragon 865 con 4 hilos).
- Formato ONNX compatible con ONNX Runtime, lo que facilita la integración en aplicaciones multiplataforma (móvil, escritorio, servidor).
- Tamaño reducido de 83 MB, adecuado para despliegue en dispositivos con memoria limitada.

## Casos de uso

- Asistentes de voz en árabe para dispositivos móviles: el modelo puede integrarse en aplicaciones de asistente personal que requieran síntesis de voz local sin conexión, gracias a su tamaño de 83 MB y su RTF inferior a 1, lo que permite respuesta en tiempo real.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla en árabe que necesiten generar audio de forma local y en tiempo real, con control de velocidad y estilo para adaptarse a las preferencias del usuario.
- Audiolibros y contenido narrado: generación de narración en árabe a partir de texto, con la posibilidad de ajustar el estilo de voz mediante el vector de referencia para mantener consistencia entre capítulos.
- Sistemas de navegación y avisos por voz: integración en dispositivos GPS o sistemas de información pública que requieran síntesis de voz en árabe con baja latencia y sin dependencia de servicios en la nube.
- Aplicaciones educativas de idiomas: generación de ejemplos de pronunciación en árabe para estudiantes, con control de velocidad para facilitar la comprensión y repetición de frases.
- Dispositivos IoT y edge: despliegue en smart speakers, wearables o sistemas embebidos con recursos limitados, gracias al tamaño reducido y la compatibilidad con ONNX Runtime Mobile.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio (como MOS) en la informacion disponible. El unico dato de rendimiento reportado es:

| Metrica | Valor |
|---|---|
| RTF (real-time factor) en Snapdragon 865 @ 4 hilos | ≈ 0,68 |
| Tamano del archivo | 83 MB |

El RTF de 0,68 indica que el modelo genera 1 segundo de audio en aproximadamente 0,68 segundos de computacion, lo que permite sintesis en tiempo real en hardware movil de gama media-alta.

## Requisitos de hardware

- Tamano del modelo: 83 MB en INT8, por lo que cabe en cualquier GPU consumer (incluso en iGPUs) y en la memoria RAM de dispositivos moviles.
- Inferencia en CPU: el modelo esta optimizado para ejecutarse en CPU; el autor reporta RTF ≈ 0,68 en un Snapdragon 865 con 4 hilos.
- GPU recomendadas: no se requieren GPUs especificas; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para despliegue en servidores, una GPU modesta (p. ej., NVIDIA T4 o similar) es mas que suficiente.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Mobile para aplicaciones moviles, y ONNX Runtime Server o Triton Inference Server para entornos de produccion.
- Latencia estimada: con RTF ≈ 0,68, la generacion de 5 segundos de audio requeriria aproximadamente 3,4 segundos de computacion en un Snapdragon 865.

## Comparativa con modelos similares

Comparativa entre las variantes de la familia Nabra-82M:

| Variante | Precision | Tamano | Calidad de audio |
|---|---|---|---|
| Nabra-82M-v0.1-ONNX | FP32 / FP16 | 325 / 163 MB | calidad de referencia |
| nabra-82m-int8-onnx (este modelo) | INT8 | 83 MB | limpia (validada auditivamente) |
| nabra-82m-int4qat-onnx | INT4-QAT | 57 MB | ruido de fondo leve bajo el habla |

No se dispone de informacion sobre modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta arabe (ar); no es adecuado para otros idiomas.
- La cuantizacion INT8 post-entrenamiento puede introducir una ligera degradacion de calidad respecto a la version FP32, aunque el autor indica que la calidad es limpia y validada auditivamente.
- No se han publicado benchmarks objetivos de calidad de audio (p. ej., MOS) en la informacion disponible.
- El vector de estilo (ref_s) debe proporcionarse como entrada; el modelo no genera voces desde cero sin una referencia de estilo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia y los del modelo base.
- Para aplicaciones donde la maxima fidelidad de audio sea critica, se recomienda la version FP32/FP16, ya que la cuantizacion INT8 puede introducir artefactos sutiles.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/marwanelamami/nabra-82m-int8-onnx
- Variante FP32/FP16: https://huggingface.co/marwanelamami/Nabra-82M-v0.1-ONNX
- Variante INT4-QAT: https://huggingface.co/marwanelamami/nabra-82m-int4qat-onnx
- Modelo base: https://huggingface.co/oddadmix/Nabra-82M-v0.1
- Perfil GitHub del autor: https://github.com/marwanelamami/marwanelamami
- Repositorio de modelos ONNX: https://github.com/onnx/models
