# Kj0rdan/rift-offline-models

## Resumen

El repositorio `Kj0rdan/rift-offline-models` aloja dos modelos ONNX de mutación de patrones musicales diseñados para la aplicación móvil RIFT, un estudio de música de bolsillo. Estos modelos, `groove-core.onnx` y `melody-core.onnx`, son perceptrones multicapa (MLP) compactos que operan localmente en el dispositivo a través de ONNX Runtime, sin enviar datos a la nube. Su propósito es sugerir variaciones de patrones de batería, bajo, acordes y melodía, manteniendo la privacidad del usuario y permitiendo un control creativo mediante la función KEEP/UNDO.

La relevancia actual de este proyecto reside en el creciente interés por la inteligencia artificial generativa en el dispositivo (on-device), especialmente en el ámbito de la creación musical. Los modelos son ligeros, con un tamaño de 68,822 bytes cada uno, y se presentan como modelos de arranque que complementan un motor procedural. No se trata de generadores de audio, sino de asistentes que sugieren cambios de compuerta y ajustes de tono en un espacio de representación simbólica de 136 dimensiones.

La arquitectura es un perceptrón multicapa de 136 entradas, una capa oculta ReLU de 64 neuronas y una salida de 128 neuronas. Se entrenaron con 6,000 patrones sintéticos deterministas y se validaron con 1,500 patrones retenidos, con una precisión de validación de alrededor del 97% en la tarea de mutación. El proyecto está bajo licencia Apache 2.0 y los modelos se distribuyen en formato ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 136 → 64 ReLU → 128 (perceptrón multicapa) |
| Parametros totales | No disponible (tamaño del archivo: 68,822 bytes por modelo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de mutación de patrones, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX float32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Los dos modelos son perceptrones multicapa idénticos en estructura: una entrada de 136 valores float32, una capa oculta de 64 neuronas con activación ReLU y una salida de 128 valores. La entrada `rift_input` codifica 64 compuertas de paso (gates) en el orden DRUMS, BASS, CHORD, LEAD; 64 valores de tono (pitch) normalizados a [-1, 1]; cinco parámetros de control (COLOR, BITE, MOTION, SPACE, SPICE) normalizados a [0, 1]; y tres valores one-hot para políticas MUSE, GLITCH y GHOST. La salida `rift_output` son 64 logits de compuerta seguidos de 64 deltas de pitch.

El entrenamiento se realizó sobre 6,000 patrones sintéticos deterministas generados por el motor procedural de RIFT, y se evaluó en 1,500 patrones retenidos. Los resultados reportados son una precisión de validación del 97.33% para `groove-core` y 97.38% para `melody-core`, con errores medios absolutos de pitch-delta de 0.0763 y 0.1064 respectivamente. El código de entrenamiento está en el repositorio de la aplicación RIFT en `scripts/train_starter_models.py`, con una semilla fija para reproducibilidad. No se utilizó RLHF ni DPO; es un entrenamiento supervisado simple sobre datos sintéticos.

## Capacidades

- Mutación de patrones de batería (groove) mediante cambios de compuertas y ajustes de pitch.
- Mutación de líneas de bajo, acordes y melodías (melody-core) con la misma interfaz.
- Funciona completamente offline en el dispositivo, sin conexión a red.
- Integración con la interfaz KEEP/UNDO de RIFT para que el músico acepte o rechace las sugerencias.
- Personalización opcional mediante una cabeza de preferencia entrenada localmente en SQLite privado, con límite de almacenamiento y borrado posible.
- Sin soporte de tool calling, agentes o razonamiento multi-paso: es un modelo de transformación de vectores, no de lenguaje.

## Casos de uso

- Asistencia a la composición en RIFT: el modelo sugiere variaciones de batería, bajo, acordes y melodía mientras el usuario trabaja en un proyecto de 16 pasos y cuatro pistas.
- Generación de ideas musicales rápidas: un productor puede generar múltiples variantes de un patrón y seleccionar la que mejor se adapte a su flujo creativo.
- Automatización de arreglos: usar el modelo para generar rellenos de batería o cambios de acorde en secciones de una canción, manteniendo la coherencia tonal.
- Prototipado de composiciones en dispositivos móviles: funciona en Android y otros dispositivos con ONNX Runtime, sin necesidad de hardware de servidor.
- Personalización de preferencias musicales: con la opción KEEP/UNDO, el modelo aprende las preferencias del usuario en el dispositivo, mejorando la relevancia de las sugerencias.
- Exploración de variaciones de parámetros: los parámetros COLOR, BITE, MOTION, SPACE, SPICE y las políticas MUSE, GLITCH, GHOST permiten explorar el espacio creativo de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los reportados en la model card para la tarea de mutación sintética:

| Modelo | Precisión de validación | Error absoluto medio de pitch-delta |
| --- | ---: | ---: |
| groove-core | 97.33% | 0.0763 |
| melody-core | 97.38% | 0.1064 |

Estas métricas describen la tarea de validación sintética, no la calidad musical percibida.

## Requisitos de hardware

- Los modelos son extremadamente ligeros: 68,822 bytes cada uno, por lo que caben en cualquier dispositivo móvil o embebido.
- Inferencia en CPU: ONNX Runtime funciona sin GPU; la latencia es despreciable (un solo paso de propagación en un MLP de 30 parámetros).
- No requiere GPU dedicada; se puede ejecutar en móviles Android, Raspberry Pi o cualquier sistema con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime en la aplicación móvil; no se mencionan otros frameworks como vLLM, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Throughput: no se especifica, pero por el tamaño se espera miles de inferencias por segundo en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos similares porque no hay información sobre alternativas en la misma categoría (mutación de patrones musicales en dispositivo). La mayoría de los modelos de generación musical (como MusicGen o Jukebox) son mucho más grandes, requieren GPU y generan audio, mientras que este modelo solo sugiere cambios simbólicos. Por tanto, la comparativa no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con patrones sintéticos deterministas; no se usaron grabaciones o canciones con derechos de autor, lo que limita su generalización a estilos musicales reales.
- No genera audio; solo sugiere cambios de compuerta y pitch sobre una representación simbólica de 16 pasos y cuatro pistas.
- La calidad musical es subjetiva; las métricas reportadas reflejan la tarea de validación sintética, no la preferencia humana.
- Los modelos solo cubren proyectos RIFT de 16 pasos y cuatro pistas; no funcionan con otras configuraciones.
- Riesgo de alucinación: aunque no es un modelo de lenguaje, puede producir sugerencias no deseadas; la aplicación limita cada modelo a su rol declarado y ofrece deshacer.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como parte de la aplicación RIFT y su uso está pensado para ese ecosistema.
- No hay garantía de soporte o actualizaciones; es un repositorio pequeño con cero descargas y cero likes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kj0rdan/rift-offline-models
- Sitio web de RiftAI (no relacionado con el modelo, pero aparece en la búsqueda): https://riftai.su/
- Guía sobre modelos offline de Elephas: https://elephas.app/blog/best-offline-ai-models
- Guía sobre ejecutar modelos de IA localmente: https://aithinkerlab.com/run-ai-models-locally-offline-privacy-guide/

Nota: los enlaces web encontrados no están directamente relacionados con el modelo, sino con el término "Rift" en otros contextos. El código de entrenamiento se menciona en la model card como parte del proyecto RIFT, pero no se proporciona una URL directa.
