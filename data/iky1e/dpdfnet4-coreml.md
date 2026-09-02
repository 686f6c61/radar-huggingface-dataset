# iky1e/DPDFNet4-CoreML

## Resumen

DPDFNet-4 es un modelo de mejora de voz (speech enhancement) en tiempo real desarrollado por CEVA, una empresa especializada en procesamiento de señal y silicio. Este repositorio concreto, publicado por el usuario iky1e, contiene los activos convertidos a Core ML y MLX para su uso en dispositivos Apple (iOS, macOS, etc.), siendo la fuente por defecto del producto Swift `DeepFilterNetCoreML`. El modelo opera a 16 kHz y está diseñado para eliminar ruido de señales de voz en streaming, con una latencia algorítmica fija de 50 ms.

La relevancia de este modelo radica en que ofrece una solución de mejora de voz de código abierto (licencia Apache-2.0) con soporte para inferencia en tiempo real en dispositivos edge, incluyendo la integración nativa con el ecosistema Core ML de Apple. Su arquitectura se basa en DPRNN (Dual-Path Recurrent Neural Network) con 4 bloques, y el modelo completo tiene aproximadamente 2,87 millones de parámetros, lo que lo hace ligero y adecuado para ejecución en hardware de consumo. El repositorio incluye varias variantes de conversión (FP32, FP16, estados explícitos o residentes) y un informe de validación que confirma una correlación de salida de 0.9999999999 respecto al grafo PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPRNN (Dual-Path Recurrent Neural Network) con 4 bloques |
| Parametros totales | 2.865.841 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesamiento por tramas de 10 ms, hop de 160 muestras) |
| Tipos de cuantizacion | FP32, FP16 (en los archivos .mlpackage) |
| Idiomas soportados | no disponible (el modelo es agnóstico al idioma, procesa voz) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage), safetensors, MLX |

## Arquitectura y entrenamiento

DPDFNet-4 se basa en una arquitectura DPRNN (Dual-Path Recurrent Neural Network), que procesa la señal de audio en dos rutas: una intra-trama y otra inter-trama, permitiendo modelar dependencias temporales tanto a corto como a largo plazo. El modelo opera a 16 kHz con una FFT de 320 muestras y un hop de 160 muestras (10 ms), lo que da un retardo algorítmico fijo de 800 muestras (50 ms). Los 4 bloques DPRNN se encargan de la separación y supresión de ruido.

El entrenamiento original fue realizado por CEVA, aunque los detalles específicos del dataset y el procedimiento de entrenamiento no se detallan en la información proporcionada. El repositorio de HuggingFace incluye los pesos convertidos a Core ML y MLX, junto con un script de conversión que valida la fidelidad del grafo convertido respecto al PyTorch original. La conversión a Core ML se realizó con estados explícitos (FP32 y FP16) y también con el soporte de `MLState` de Core ML para sistemas operativos compatibles. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Mejora de voz en tiempo real: elimina ruido de fondo de señales de voz a 16 kHz.
- Procesamiento en streaming: opera por tramas de 10 ms, adecuado para aplicaciones de baja latencia.
- Soporte para 8, 16 y 48 kHz según la familia DPDFNet (aunque esta versión concreta está fijada a 16 kHz).
- Conversión a Core ML y MLX: permite ejecución nativa en dispositivos Apple (iOS, macOS, tvOS, watchOS).
- Validación de alta fidelidad: correlación de salida de 0.9999999999 respecto al grafo PyTorch en la variante FP32.
- Baja latencia de procesamiento: 3.686 ms p50 y 4.171 ms p95 en un Mac con Apple Silicon (mediciones de desarrollo).
- Incluye soporte para estados recurrentes explícitos (FP32/FP16) y estados residentes (`MLState`).

## Casos de uso

- Aplicaciones de llamadas y videoconferencia: integración en apps de VoIP para limpiar la voz del usuario en tiempo real, mejorando la inteligibilidad en entornos ruidosos.
- Asistentes de voz en dispositivos móviles: preprocesamiento de la señal de micrófono antes del reconocimiento de voz, reduciendo errores por ruido ambiente.
- Grabación de audio en campo: mejora de la calidad de grabaciones de entrevistas o podcasts realizadas con dispositivos móviles en exteriores.
- Audífonos y dispositivos de asistencia auditiva: implementación en hardware edge con restricciones de memoria y consumo, gracias a su tamaño reducido (2,87 M parámetros).
- Aplicaciones de accesibilidad: mejora de la comprensión del habla para personas con discapacidad auditiva en entornos ruidosos.
- Integración en productos Swift para Apple: uso directo del paquete `DeepFilterNetCoreML` para añadir mejora de voz a apps de iOS/macOS con pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como PESQ, STOI o Si-SNR) en la información disponible. Sin embargo, la model card reporta métricas de validación de la conversión:

| Metrica | Valor |
|---|---|
| Correlacion de salida (FP32 vs PyTorch) | 0.9999999999 |
| Correlacion de forma de onda (vs ONNX oficial) | 0.99999999 |
| Tiempo de validacion de 60 segundos (Swift/Core ML) | 13.953 s (4.30x tiempo real) |
| Latencia p50 de procesamiento (Apple Silicon) | 3.686 ms |
| Latencia p95 de procesamiento (Apple Silicon) | 4.171 ms |

Estos datos indican que la conversión a Core ML es prácticamente idéntica al modelo original y que el rendimiento en tiempo real es más que suficiente para aplicaciones interactivas.

## Requisitos de hardware

- El modelo tiene 2.865.841 parámetros, lo que en FP32 ocupa aproximadamente 11,5 MB y en FP16 unos 5,7 MB. Esto permite su ejecución en cualquier dispositivo Apple con Neural Engine o GPU moderna.
- VRAM estimada: menos de 100 MB en FP32, muy por debajo de los límites de cualquier GPU actual.
- GPU recomendadas: cualquier GPU integrada en Apple Silicon (M1, M2, M3, etc.) o GPU de escritorio con soporte Core ML.
- En consumer GPU: sí, cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en dispositivos móviles.
- Opciones de despliegue: Core ML (iOS/macOS), MLX (Apple Silicon), y también se puede usar el modelo original PyTorch/ONNX en otras plataformas.
- Latencia: 3.686 ms p50 en Apple Silicon, lo que permite procesamiento en tiempo real con margen para otras tareas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de mejora de voz en la información proporcionada. Sin embargo, se puede comparar cualitativamente con alternativas conocidas:

| Modelo | Parametros | Contexto/Frame | Licencia | Formato |
|---|---|---|---|---|
| DPDFNet-4 (este) | 2,87 M | 10 ms hop | Apache-2.0 | Core ML, MLX, ONNX |
| DeepFilterNet (versiones anteriores) | ~1-2 M | 10 ms hop | MIT | PyTorch, ONNX |
| RNNoise | ~0,5 M | 10 ms | BSD-3 | C, ONNX |

La comparativa cuantitativa (PESQ, STOI) no está disponible en la información proporcionada. DPDFNet-4 se distingue por su soporte nativo Core ML y su validación de alta fidelidad en la conversión.

## Limitaciones y advertencias

- El modelo está fijado a 16 kHz de frecuencia de muestreo en esta versión; para otras frecuencias (8 o 48 kHz) se necesitan otras variantes de la familia DPDFNet.
- La variante FP16 y la de estados residentes tienen una fidelidad menor que la FP32, según la model card, por lo que no se recomiendan como opción por defecto en producción.
- No se han publicado resultados de benchmarks perceptivos (PESQ, STOI) en la información disponible, por lo que la calidad subjetiva no está cuantificada.
- El modelo está diseñado para mejora de voz, no para separación de múltiples hablantes ni para otras tareas de audio.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia original de CEVA.
- El rendimiento en dispositivos Apple varía según el hardware; las latencias reportadas son de un Mac de desarrollo y no son garantía en otros dispositivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iky1e/DPDFNet4-CoreML
- Implementación oficial (CEVA): https://github.com/ceva-ip/DPDFNet
- Modelos oficiales en HuggingFace: https://huggingface.co/Ceva-IP/DPDFNet
- Paper DPDFNet: https://arxiv.org/abs/2512.16420
- Runtime Swift y conversiones: https://github.com/kylehowells/DeepFilterNet-mlx
- Script de conversión: https://github.com/kylehowells/DeepFilterNet-mlx/blob/feature/deepfilternet4/Scripts/Conversion/convert_dpdfnet_to_coreml.py
