# HY-2012/DeepFilterNet3.AXERA

## Resumen

DeepFilterNet3.AXERA es un paquete de despliegue cuantizado del modelo DeepFilterNet3, un sistema de reducción de ruido de voz en tiempo real a 48 kHz de ancho de banda completo, optimizado para la plataforma de inferencia AXERA AX650N. El modelo original, desarrollado por Rikorose, utiliza una arquitectura de filtrado profundo (deep filtering) que combina una red neuronal recurrente con un filtro de respuesta finita para suprimir ruido manteniendo la voz intacta. Esta variante, publicada por el usuario HY-2012, convierte el modelo a tres subgrafos de inferencia (enc, erb_dec y df_dec) con cuantización U16 para los dos primeros y FP32 para el tercero, permitiendo ejecución en tiempo real en el SoC AX650N con un factor de tiempo real (RTF) de 0,142 en C++ y 0,136 en Python.

La relevancia de este paquete radica en que facilita la integración de DeepFilterNet3 en sistemas embebidos basados en AXERA, un mercado creciente para aplicaciones de audio en dispositivos de borde. Incluye tanto una interfaz Python (solo dependiente de numpy y axengine) como un ejecutable C++ precompilado para aarch64, junto con scripts de demostración y ejemplos de audio. La precisión medida en placa muestra una similitud coseno de 0,9857 frente a la referencia oficial de PyTorch, con una pérdida de cuantización mínima de 0,0005, lo que lo hace adecuado para producción en entornos con restricciones de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet3 (STFT + ERB + GRU + filtro profundo de 5º orden) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por bloques de 99 frames, 20 ms por frame con hop de 10 ms) |
| Tipos de cuantizacion | U16 (enc, erb_dec), FP32 (df_dec) |
| Idiomas soportados | no aplica (audio), documentacion en chino e ingles |
| Licencia | MIT |
| Formato de pesos | axmodel (formato propietario de AXERA) |

## Arquitectura y entrenamiento

DeepFilterNet3.AXERA es una conversión del modelo DeepFilterNet3 original, que emplea una arquitectura híbrida de filtrado profundo. El procesamiento se realiza en bloques de 99 frames: primero se aplica una STFT con tamaño de FFT de 960 y hop de 480, seguida de una extracción de características ERB (Equivalent Rectangular Bandwidth) y normalización unitaria. La red principal (enc) es un GRU que mantiene estado entre bloques, permitiendo procesamiento en streaming. A continuación, dos decodificadores generan una máscara ERB (erb_dec) y coeficientes de filtro (df_dec) que se aplican como ganancia ERB y filtrado profundo de 5º orden con 2 frames de lookahead, finalizando con una ISTFT.

El entrenamiento del modelo original se realizó con datos de voz y ruido a 48 kHz, utilizando una combinación de pérdidas espectrales y de dominio temporal, aunque los detalles exactos del dataset y el procedimiento de entrenamiento no se especifican en la información disponible. Esta versión para AXERA no modifica los pesos, sino que los cuantiza y los divide en tres subgrafos para optimizar la ejecución en la NPU del AX650N. La cuantización U16 de los subgrafos enc y erb_dec mantiene una similitud coseno de al menos 0,9946 frente a la versión ONNX, mientras que df_dec se mantiene en FP32 para preservar la precisión de los coeficientes de filtro.

## Capacidades

- Reducción de ruido de voz en tiempo real a 48 kHz de ancho de banda completo.
- Procesamiento en streaming con estado GRU persistente entre bloques, adecuado para aplicaciones de baja latencia.
- Soporte de entrada de audio mono en formato PCM16 WAV o array float32 a 48 kHz.
- Ejecución en plataforma AXERA AX650N mediante runtime axengine (Python) o ejecutable C++ precompilado para aarch64.
- Preservación de voz limpia: en pruebas con audio limpio, la RMS pasa de 0,0287 a 0,0270 (pérdida mínima).
- Supresión de ruido puro: en pruebas con solo ruido, la RMS se reduce de 0,0336 a 0,0021 (aproximadamente -24 dB de atenuación).
- Incluye ejemplos de demostración y scripts de ejecución automática (run.sh).

## Casos de uso

- Dispositivos de audio embebidos: integración en barras de sonido, auriculares o micrófonos inteligentes basados en AX650N para limpiar la voz del usuario en tiempo real, aprovechando el RTF de 0,142 y el bajo consumo de memoria (28,9 MB pico).
- Sistemas de videoconferencia en hardware de borde: despliegue en terminales de videollamada que requieren reducción de ruido local sin depender de la nube, usando el ejecutable C++ para minimizar la latencia.
- Asistentes de voz en dispositivos IoT: preprocesamiento de audio antes del reconocimiento de voz, mejorando la precisión del ASR en entornos ruidosos, gracias a la preservación de la voz limpia y la supresión de ruido de fondo.
- Grabación de campo y periodismo: limpieza de grabaciones de audio en tiempo real en dispositivos portátiles con AX650N, permitiendo monitorización y almacenamiento de audio mejorado.
- Automatización industrial: reducción de ruido en comunicaciones de voz en entornos de fábrica o maquinaria pesada, donde el ruido de fondo es alto y la inteligibilidad es crítica.
- Investigación y prototipado: uso del paquete como referencia para evaluar la viabilidad de DeepFilterNet3 en plataformas AXERA, o como base para desarrollar aplicaciones personalizadas de mejora de voz.

## Benchmarks y rendimiento

Los datos de rendimiento se han medido en la placa AX650N con el archivo de audio `noisy_snr0.wav` de 10,6 segundos:

| Metrica | Valor |
|---|---|
| RTF (C++) | 0,142 |
| RTF (Python) | 0,136 |
| Pico de memoria (Python) | 28,9 MB |
| Similitud coseno por tensor (enc/erb_dec vs ONNX) | ≥ 0,9946 |
| Similitud coseno df_dec (coefs) | 0,99999 |
| Similitud coseno end-to-end vs torch | 0,9857 |

No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, ya que se trata de un modelo de audio. Los datos anteriores son los únicos disponibles y provienen de las pruebas del autor en la placa AX650N.

## Requisitos de hardware

- SoC objetivo: AXERA AX650N (NPU integrada).
- Memoria: pico de 28,9 MB durante la inferencia en Python (C++ no especificado).
- No requiere GPU; está diseñado para ejecución en NPU de borde.
- Opciones de despliegue: runtime axengine (Python) o ejecutable C++ precompilado para aarch64.
- Latencia: RTF inferior a 1,0 en ambos caminos, lo que garantiza procesamiento en tiempo real para audio de 48 kHz.
- Dependencias: solo numpy y axengine para Python; el binario C++ requiere la librería de runtime de AXERA.

## Comparativa con modelos similares

| Modelo | Plataforma | Cuantizacion | RTF | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFilterNet3.AXERA | AX650N | U16 + FP32 | 0,142 (C++) | MIT | HuggingFace, GitHub |
| DeepFilterNet3 (original) | CPU/GPU (tract, ONNX) | FP32 | no disponible | MIT | GitHub, HuggingFace |
| RNNoise | CPU | FP32 | ~0,1 (en CPU) | BSD-3 | GitHub |

DeepFilterNet3.AXERA se diferencia del original por su optimización específica para AX650N, lo que permite ejecución en hardware de bajo consumo. Frente a RNNoise, ofrece mayor ancho de banda (48 kHz frente a 48 kHz también, pero con mejor calidad en banda completa) y una arquitectura más moderna, aunque requiere hardware AXERA. No se dispone de comparativas cuantitativas directas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El paquete está diseñado exclusivamente para la plataforma AXERA AX650N; no es portable a otras NPU o GPUs sin reconversión.
- La cuantización U16 de los subgrafos enc y erb_dec introduce una pérdida de precisión de aproximadamente 0,0005 en similitud coseno frente al modelo original, que puede ser relevante en aplicaciones de audio críticas.
- No se especifican los parámetros totales del modelo ni detalles del dataset de entrenamiento, lo que limita la evaluación de su capacidad general.
- La documentación está principalmente en chino, aunque el código y los comentarios son accesibles para desarrolladores angloparlantes.
- El modelo solo procesa audio mono a 48 kHz; no soporta otras frecuencias de muestreo ni canales múltiples sin adaptación.
- La licencia MIT permite uso comercial, pero el runtime axengine y las herramientas de AXERA pueden tener sus propios términos de licencia que deben verificarse.
- No se han realizado pruebas de robustez frente a condiciones extremas de ruido no estacionario o reverberación, más allá de los ejemplos incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/HY-2012/DeepFilterNet3.AXERA
- Repositorio GitHub del autor: https://github.com/ZY-2012/DeepFilterNet3.AXERA
- Repositorio original de DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- Modelo DeepFilterNet3 en HuggingFace (fal): https://huggingface.co/fal/DeepFilterNet3
- Modelo DeepFilterNet3 en HuggingFace (trysem): https://huggingface.co/trysem/DeepFilterNet3
- Herramienta Magnetar de AXERA: https://github.com/AXERA-TECH/Magnetar
