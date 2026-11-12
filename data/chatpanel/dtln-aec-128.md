# ChatPanel/dtln-aec-128

## Resumen

dtln-aec-128 es una réplica sin modificaciones del modelo de cancelación de eco acústico (AEC) DTLN-aec, publicado por el usuario ChatPanel en Hugging Face. El modelo original fue desarrollado por Breizh AI (breizhn) y este repositorio se limita a alojar los mismos ficheros ONNX que utiliza el proyecto anarlog (fastrepl/anarlog) en su módulo de procesamiento de audio, con el objetivo de que la pasarela de ChatPanel descargue todos los modelos que ejecuta desde un único origen.

No se trata de un modelo de lenguaje ni de un transformer generativo: es un sistema de procesamiento de señal de audio en tiempo real basado en la arquitectura DTLN (Dual-Signal Transformation LSTM Network), pensado para suprimir el eco residual en comunicaciones de voz bidireccional. El sufijo "128" hace referencia al tamaño de bloque o frame de procesamiento, y el paquete incluye dos ficheros ONNX (`model_128_1.onnx` y `model_128_2.onnx`) que corresponden a las dos etapas del pipeline DTLN.

Su relevancia es operativa más que científica: sirve como artefacto reproducible y verificado por hash para pipelines de videoconferencia, asistentes de voz y aplicaciones de captura de audio que necesitan AEC ligero y desplegable en CPU. No aporta mejoras respecto al modelo base; su valor está en la trazabilidad de los binarios y en la licencia MIT heredada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DTLN (Dual-Signal Transformation LSTM Network), dos etapas ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por frames de audio; tamaño de bloque 128) |
| Tipos de cuantización | no disponible (ficheros ONNX tal cual se publican) |
| Idiomas soportados | no disponible (procesamiento de señal, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_128_1.onnx`, `model_128_2.onnx`) |

## Arquitectura y entrenamiento

DTLN es una arquitectura de supresión de ruido y cancelación de eco que combina una red LSTM con transformadas de señal (STFT) en dos etapas encadenadas. La primera etapa opera en el dominio de la transformada de corta duración y la segunda refina la señal en el dominio temporal, lo que permite reducir artefactos y mejorar la supresión del eco residual con una huella computacional muy baja. El tamaño de bloque de 128 muestras es el que da nombre a esta variante.

Este repositorio concreto no ha sido reentrenado, convertido ni editado: los ficheros son idénticos byte a byte a los del upstream (fastrepl/anarlog, ruta `crates/aec/data/models`), que a su vez proceden del modelo base breizhn/DTLN-aec. No se dispone de información sobre el dataset de entrenamiento, el número de tokens (no aplica) ni sobre si hubo ajuste fino con RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Cancelación de eco acústico en tiempo real sobre flujos de audio de voz.
- Supresión de ruido de fondo combinada con la cancelación de eco, gracias a las dos etapas DTLN.
- Procesamiento por frames de 128 muestras, adecuado para latencia baja en llamadas y videoconferencias.
- Ejecución en CPU mediante runtime ONNX, sin necesidad de GPU.
- Integración en pipelines de captura de audio (micrófono y reproducción) para eliminar la realimentación del altavoz.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Videoconferencias y llamadas VoIP: el modelo se inserta en la ruta de audio del cliente para eliminar el eco que se produce cuando el altavoz se capta por el micrófono, con latencia de frame de 128 muestras.
- Asistentes de voz en dispositivos: al ejecutarse en ONNX sobre CPU, permite AEC local en altavoces inteligentes y barras de sonido sin depender de la nube.
- Grabación y transcripción de reuniones: limpia la señal antes de pasarla a un motor ASR, reduciendo inserciones erróneas causadas por eco residual.
- Sistemas de atención al cliente con voz: mejora la calidad percibida en conversaciones manos libres y evita que el cliente se escuche a sí mismo.
- Kioscos y terminales de interacción por voz: elimina la realimentación entre el altavoz de respuesta y el micrófono en entornos ruidosos.
- Pipelines de datos de audio a gran escala: como paso de preprocesado determinista y ligero antes del etiquetado o del entrenamiento de otros modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- GPU recomendadas: no necesarias; cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no se dispone de datos de rendimiento.
- Cabe en cualquier equipo de consumo: el tamaño del repositorio es de 0,0 GB según Hugging Face y los ficheros son dos modelos ONNX de tamaño reducido.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración directa en anarlog y en la pasarela de ChatPanel.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime, aunque el diseño por frames de 128 muestras está orientado a tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dtln-aec-128 (este) | DTLN, 2 etapas ONNX | Cancelación de eco | MIT | ONNX | Hugging Face |
| breizhn/DTLN-aec | DTLN | Cancelación de eco | MIT (según upstream) | no disponible | Hugging Face |
| Modelos AEC de WebRTC (AEC3) | Procesamiento de señal clásico | Cancelación de eco | BSD | C/C++ | Repositorio WebRTC |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Es una copia sin modificaciones; cualquier mejora o corrección debe buscarse en el modelo base breizhn/DTLN-aec o en el upstream de anarlog.
- No se han publicado datos sobre sesgos, alucinación o limitaciones idiomáticas porque no aplican a un sistema de procesamiento de señal.
- La licencia MIT permite uso comercial, pero se recomienda conservar el fichero LICENSE y la atribución a los autores originales.
- El rendimiento real depende del runtime ONNX y del hardware; no hay métricas publicadas de latencia ni de supresión de eco en este repositorio.
- Al ser un artefacto de conveniencia para la pasarela de ChatPanel, su mantenimiento y actualizaciones no están garantizados por el autor original.

## Enlaces

- Hugging Face: https://huggingface.co/ChatPanel/dtln-aec-128
- Modelo base: https://huggingface.co/breizhn/DTLN-aec
- Upstream (anarlog): https://github.com/fastrepl/anarlog/tree/b14809dcd80fe80c5158c8a9f5a19fa173878b12
