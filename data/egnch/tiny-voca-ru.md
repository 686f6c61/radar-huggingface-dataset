# egnch/tiny-voca-ru

## Resumen

tiny-voca-ru es un modelo de síntesis de voz (text-to-speech) en ruso desarrollado por Evgeniy Chetvertkov (usuario `egnch`) como adaptación del modelo original en inglés `tiny-voca` de Muhammed Nazeem. Con tan solo 4.534.411 parámetros (unos 18,2 MB en `safetensors` y 21,4 MB en ONNX), resuelve el problema de la síntesis de voz en ruso en entornos con recursos muy limitados, incluyendo navegador y CPU sin GPU.

El modelo se entrena desde cero sobre el dataset `egnch/tiny-voca-ru-dataset` (18.517 clips alineados, 21,96 horas de audio) y ofrece dos voces (femenina `F` y masculina `M`) con salida a 24 kHz mono. Su principal atractivo es la eficiencia extrema: alcanza 115× tiempo real en PyTorch y 81× en ONNX Runtime con 4 hilos de CPU, y entre 16,7 y 21,7× tiempo real en WebAssembly dentro de Chromium.

Es relevante ahora porque demuestra que un TTS de calidad aceptable (CER del 0,46% y WER del 2,03% frente a un profesor Qwen3-TTS que obtiene 0,31% y 1,54%) puede ejecutarse en hardware de consumo y en el navegador, con licencia Apache-2.0 y un frontend de normalización de texto ruso implementado íntegramente en Python puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sigue la arquitectura y receta de entrenamiento de `tiny-voca` (no se detalla el tipo exacto en la información disponible) |
| Parametros totales | 4.534.411 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en safetensors (FP, precisión no especificada) y ONNX; el modelo de homógrafos `onnx/omograph.onnx` se distribuye en INT8 (10 MB) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache-2.0 (datos de estrés `ruaccent` incluidos bajo MIT) |
| Formato de pesos | `model.safetensors` + `config.json`, `onnx/model.onnx` + `onnx/model.json`, `onnx/omograph.onnx` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y la receta de entrenamiento de `tiny-voca`, adaptadas al ruso. El frontend (`tiny_voca_ru.frontend`) es Python puro e incluye normalización de texto ruso, colocación de acento (modo `lite` mediante `stress.txt.gz` y `accent.onnx`, o modo `full` mediante el modelo de homógrafos INT8 de 10 MB `onnx/omograph.onnx`) y un G2P basado en reglas. El inventario fonético es un conjunto IPA ruso de 61 símbolos: 5 especiales, 12 de puntuación, 36 consonantes con pares de palatalización y 8 vocales, incluidas las reducidas `ɐ` y `ə`.

El entrenamiento se realizó desde cero durante 104.000 pasos (4,9 horas en una NVIDIA L40S) sobre 18.517 clips alineados (21,96 horas) del dataset `egnch/tiny-voca-ru-dataset`. Durante la preparación de datos se usaron duraciones CTC de `facebook/wav2vec2-lv-60-espeak-cv-ft`. El modelo produce audio a 24 kHz mono y admite control de velocidad (0,25 a 4,0), desplazamiento de tono (log-F0) y rango de tono (0,0 a 3,0). Los scripts de fine-tuning para voces personalizadas (`tiny-voca-ru-prepare`, `tiny-voca-ru-train`) están disponibles en el repositorio de GitHub.

## Capacidades

- Síntesis de voz en ruso con dos voces predefinidas: femenina (`F`) y masculina (`M`).
- Salida de audio a 24 kHz mono en formato WAV.
- Control de velocidad de habla en el rango 0,25 a 4,0.
- Control de tono mediante `pitch_shift` (desplazamiento log-F0) y `pitch_range` (rango 0,0 a 3,0).
- Colocación de acento configurable: `lite` (diccionario + `accent.onnx`), `full` (modelo de homógrafos INT8) o `none`; también admite marcado manual con `+` antes de la vocal acentuada.
- Normalización de texto ruso y G2P basado en reglas, incluyendo conversión de números a palabras.
- Inferencia en dos backends: PyTorch con safetensors y ONNX Runtime (sin necesidad de PyTorch).
- Ejecución en navegador mediante ONNX Runtime Web (WASM).
- Interfaz de línea de comandos (`tiny-voca-ru-speak`) y API de Python (`Synthesizer`).
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones rusas: el modelo sintetiza frases cortas en tiempo real (115× RT en CPU) con una huella de 18 MB, adecuado para integrarse en apps de escritorio o móviles sin dependencias pesadas.
- Accesibilidad para personas con discapacidad visual: lectura de contenido web o de documentos en ruso directamente en el navegador mediante ONNX Runtime Web (16,7 a 21,7× RT en WASM con un hilo), sin enviar texto a servidores externos.
- Asistentes de voz embebidos en dispositivos de bajo consumo: al ejecutarse en CPU con 4 hilos y caber en menos de 25 MB, puede desplegarse en Raspberry Pi o dispositivos IoT para respuestas habladas en ruso.
- Generación de audiolibros o podcasts de bajo coste: el control de velocidad y tono permite ajustar la locución, y el modo `stress="full"` mejora la pronunciación de homógrafos en textos largos.
- Pruebas automatizadas de pipelines de voz: su velocidad (81× RT en ONNX) permite generar grandes volúmenes de audio sintético para evaluar sistemas ASR o de diálogo en ruso.
- Prototipado rápido de interfaces conversacionales en ruso: la API de Python y la CLI facilitan la integración en demos y notebooks sin infraestructura GPU.
- Fine-tuning de voces personalizadas: los scripts `tiny-voca-ru-prepare` y `tiny-voca-ru-train` permiten adaptar el modelo a una voz concreta partiendo de un modelo de 4,5 M de parámetros y un entrenamiento de apenas unas horas en una GPU profesional.

## Benchmarks y rendimiento

Evaluación a 104.000 pasos con el frontend `lite` por defecto frente al profesor Qwen3-TTS, sobre el split de test (696 clips) con ASR Whisper `large-v3-turbo`. La velocidad en CPU se midió en un AMD Ryzen 5 3600X (4 hilos, 55,03 s de audio).

| Metrica | Split | tiny-voca-ru | Profesor (Qwen3-TTS) |
|---|---|---|---|
| CER | test (696 clips) | 0,46% (`F` 0,43%, `M` 0,49%) | 0,31% |
| WER | test (696 clips) | 2,03% | 1,54% |
| Precision de acento (CTC top-1) | palabras de test (3.905) | 98,5% | 95,6% |
| Homografos (`lite` / ref. `ruaccent turbo3.1`) | homografos (250) | 56,0% / 91,6% | — |
| Coincidencia exacta ASR de numeros | plantillas numericas de test (139) | 90,6% | 92,1% |
| Velocidad (PyTorch / ONNX CPU, 4 hilos) | 55,03 s de audio | 115× / 81× RT | — |
| Velocidad (ONNX Runtime Web, WASM 1 hilo) | Chromium | 16,7–21,7× RT | — |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo pesa 18,2 MB en safetensors y 21,4 MB en ONNX, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutará sin problema, pero no es necesario.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos unos pocos cientos de MB libres; también funciona íntegramente en CPU.
- Opciones de despliegue: PyTorch con safetensors, ONNX Runtime (CPU), ONNX Runtime Web (WASM en navegador), CLI `tiny-voca-ru-speak` y paquete PyPI `tiny-voca-ru` con extras `[onnx]` o `[torch]`.
- Latencia y throughput: 115× tiempo real en PyTorch y 81× en ONNX Runtime con 4 hilos de CPU (AMD Ryzen 5 3600X); 16,7 a 21,7× tiempo real en Chromium con WASM y un solo hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca-ru | 4,53 M | No disponible | Ruso | Apache-2.0 | safetensors, ONNX | TTS ruso, 2 voces, 24 kHz, 115× RT en CPU |
| tiny-voca (original) | 4,5 M | No disponible | Ingles | No disponible en la informacion | No disponible en la informacion | TTS ingles de dos voces; base arquitectonica del modelo |
| Qwen3-TTS (profesor) | No disponible | No disponible | No disponible | No disponible | No disponible | Usado como referencia de calidad en la evaluacion (CER 0,31%, WER 1,54%) |

No se dispone de datos de otros modelos TTS rusos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso; no es multilingüe.
- Solo dispone de dos voces (`F` y `M`), que heredan rasgos de pronunciación de Qwen3-TTS.
- El modo de acento `lite` (por defecto) no desambigua homógrafos dependientes del contexto: solo acierta el 56,0% frente al 91,6% de `ruaccent turbo3.1`. Para mejorar la precisión debe usarse `stress="full"` o marcar manualmente el acento con `+`.
- La inflexión de caso de numerales basada en reglas y la transliteración del latino pueden fallar ocasionalmente en sintaxis compleja o nombres extranjeros.
- No se han publicado datos sobre sesgos, riesgo de alucinación (en TTS, pronunciación incorrecta) ni latencia en GPU.
- Licencia Apache-2.0 para código y pesos, con datos de estrés de `ruaccent` bajo MIT; no se indican restricciones adicionales para uso comercial.
- El modelo se creó en noviembre de 2026 según los metadatos de Hugging Face; verificar la vigencia de los enlaces y del paquete PyPI antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egnch/tiny-voca-ru
- Dataset: https://huggingface.co/datasets/egnch/tiny-voca-ru-dataset
- Demo (Space): https://huggingface.co/spaces/egnch/tiny-voca-ru-demo
- Código en GitHub: https://github.com/yilbegan/tiny-voca-ru
- Paquete PyPI: https://pypi.org/project/tiny-voca-ru/
- Modelo original tiny-voca (Hugging Face): https://huggingface.co/n4ze3m/tiny-voca
- Repositorio original tiny-voca (GitHub): https://github.com/n4ze3m/tiny-voca
