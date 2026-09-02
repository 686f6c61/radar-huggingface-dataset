# eae1212/vosk-tts-ru-0.9-prepared

## Resumen

El modelo `eae1212/vosk-tts-ru-0.9-prepared` es un sintetizador de voz en ruso basado en la arquitectura VITS, derivado del modelo oficial `vosk-model-tts-ru-0.9-multi` de Alpha Cephei. El autor, eae1212, ha aplicado una optimización de grafo ONNX mediante `onnxruntime.quantization.shape_inference.quant_pre_process`, que simplifica la estructura del grafo sin modificar los pesos. El resultado es una reducción drástica del tiempo de carga en dispositivos Android: de 25,3 segundos a 1,0 segundo, manteniendo la misma calidad de síntesis.

Este modelo es relevante para desarrolladores que necesitan desplegar síntesis de voz en ruso en entornos con recursos limitados, especialmente móviles, donde el tiempo de arranque es crítico. El repositorio incluye el sintetizador preparado (`model_prep.onnx`, 174 MB) y una copia sin modificar del modelo de lenguaje BERT (654 MB) que se usa para mejorar la prosodia. Todo el paquete está bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) con modelo de lenguaje BERT auxiliar |
| Parametros totales | no disponible (el sintetizador preparado pesa 174 MB en FP32; el BERT 654 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto, no secuencia de tokens de lenguaje) |
| Tipos de cuantizacion | no se aplica cuantizacion; los pesos se mantienen en FP32 originales |
| Idiomas soportados | ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `.onnx`), con `config.json` y `vocab.txt` para el BERT |

## Arquitectura y entrenamiento

El modelo base es un sistema TTS de dos etapas: un sintetizador VITS que convierte texto fonetizado en audio, y un modelo de lenguaje BERT (WordPiece) que predice características prosódicas a partir del texto. El entrenamiento original fue realizado por Alpha Cephei, con cinco voces rusas (tres femeninas y dos masculinas) identificadas por speaker IDs del 0 al 4. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens.

La contribución de este repositorio es puramente de ingeniería: se ejecutó `quant_pre_process` sobre el `model.onnx` original, lo que realiza inferencia de formas simbólicas y simplificación del grafo. Los pesos no se tocan, por lo que no hay pérdida de precisión. El BERT no requirió preparación porque ya cargaba en 0,9 segundos. El archivo `dictionary` (101 MB) no se incluye porque es un diccionario de pronunciación en texto plano, recomendado convertir a formato binario para uso móvil.

## Capacidades

- Síntesis de voz en ruso con cinco voces diferentes (tres femeninas, dos masculinas), seleccionables mediante speaker ID.
- Generación de audio a partir de texto arbitrario, con soporte para entradas largas (no se especifica límite).
- Integración con ONNX Runtime, lo que permite ejecución en CPU, GPU y dispositivos móviles.
- Optimizado para carga rápida en Android: el sintetizador preparado tarda 1 segundo en cargar, frente a 25 segundos del original.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente generativo de audio.
- El modelo de lenguaje BERT mejora la naturalidad prosódica, pero no es accesible de forma independiente.

## Casos de uso

- Aplicaciones Android de lectura de textos: el modelo se integra en apps de accesibilidad o lectores de pantalla, donde el arranque rápido es esencial. La carga en 1 segundo permite iniciar la síntesis casi instantáneamente al abrir la app.
- Asistentes de voz en ruso para dispositivos embebidos: al ser ONNX y no requerir GPU, puede ejecutarse en Raspberry Pi o similares, generando respuestas de voz en tiempo real (ratio de síntesis 0,27, es decir, 1 segundo de audio se genera en 0,27 segundos).
- Sistemas de respuesta interactiva por voz (IVR) en ruso: empresas con centros de llamadas pueden desplegar el modelo en servidores CPU para convertir respuestas de texto en audio, con latencia baja y sin costes de API externa.
- Generación de audiolibros en ruso: el modelo permite convertir libros electrónicos a audio con varias voces, aunque la calidad es inferior a voces comerciales, es suficiente para prototipos o contenido no crítico.
- Pruebas de accesibilidad en desarrollo de software: los desarrolladores pueden usar el modelo para generar audio de prueba en ruso sin depender de servicios en la nube, integrándolo en pipelines de CI/CD.
- Educación y aprendizaje de idiomas: aplicaciones de pronunciación que generan ejemplos de audio en ruso, aprovechando las cinco voces para variar los ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje general. El autor proporciona mediciones de rendimiento en dispositivo Android (Snapdragon, 8 núcleos, ONNX Runtime 1.24.3, mejor de tres ejecuciones):

| Archivo | Tamano | Tiempo de carga | Ratio de sintesis (duracion audio / tiempo de proceso) |
|---|---|---|---|
| `model.onnx` (original) | 179 MB | 25,3 s | 0,27 |
| `model_prep.onnx` (preparado) | 174 MB | 1,0 s | 0,27 |
| int8 cuantizado (no incluido) | 124 MB | 0,8 s | 0,25 |

La preparacion no afecta al rendimiento de sintesis, solo al tiempo de carga. No hay datos de calidad de voz (MOS) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX se ejecuta con ONNX Runtime. Para tiempo real en servidor, se recomienda al menos 4 núcleos y 2 GB de RAM libre (el modelo ocupa ~828 MB en disco entre sintetizador y BERT).
- Dispositivos Android: requiere CPU ARM de 64 bits con soporte NEON. El tiempo de carga de 1 segundo se midió en un Snapdragon de 8 núcleos; en dispositivos más modestos puede ser mayor.
- GPU: no es necesaria, pero si se usa, el modelo puede ejecutarse en CUDA con ONNX Runtime para reducir aún más la latencia de síntesis.
- Opciones de despliegue: ONNX Runtime (C++, Python, Java, Kotlin), llama.cpp no aplica (no es un LLM), se puede integrar en aplicaciones Android mediante el runtime de ONNX.
- Latencia: ratio de síntesis 0,27 (por ejemplo, generar 10 segundos de audio tarda ~2,7 segundos en CPU). No se especifica throughput en términos de frases por minuto.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS en ruso comparables (como Silero TTS, Coqui TTS, etc.) en la información proporcionada. La única comparación posible es con el modelo original sin preparar, que es idéntico en calidad pero con un tiempo de carga 25 veces mayor. Para una comparativa con alternativas, se necesitarían datos adicionales no disponibles en la documentación consultada.

## Limitaciones y advertencias

- Solo soporta ruso; no hay voces ni fonética para otros idiomas.
- El diccionario de pronunciación no está incluido en el repositorio; para nombres propios o palabras fuera de vocabulario, la pronunciación puede ser incorrecta.
- No hay control fino sobre emociones, énfasis o velocidad de habla más allá de lo que permite el texto.
- El modelo de lenguaje BERT añade 654 MB adicionales; en dispositivos con poca memoria puede ser un problema, aunque el sintetizador solo necesita 174 MB.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original es de Alpha Cephei; se debe mantener la atribución correspondiente.
- No se garantiza la calidad de síntesis para textos muy largos o con estructuras complejas (citas, listas, etc.).
- El archivo `dictionary` (101 MB) no está incluido; si se necesita, hay que descargarlo del sitio oficial y convertirlo a formato binario para uso móvil.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eae1212/vosk-tts-ru-0.9-prepared
- Repositorio oficial de Vosk-TTS (GitHub): https://github.com/alphacep/vosk-tts
- Paquete PyPI `vosk-tts`: https://pypi.org/project/vosk-tts/
- Modelos oficiales de Alpha Cephei: https://alphacephei.com/vosk/models
- Documentación de ONNX Runtime para cuantización: https://onnxruntime.ai/docs/quantization/
