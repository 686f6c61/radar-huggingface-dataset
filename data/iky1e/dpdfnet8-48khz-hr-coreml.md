# iky1e/DPDFNet8-48kHz-HR-CoreML

## Resumen

DPDFNet-8 48 kHz HR Core ML es una conversión a Core ML y MLX del modelo de mejora de voz DPDFNet-8 de alta resolución (48 kHz) desarrollado por CEVA. El modelo original, presentado en el artículo arXiv 2512.16420, es un sistema de supresión de ruido y mejora de voz en tiempo real que combina la arquitectura DeepFilterNet2 con bloques RNN de doble vía (DPRNN) para modelar dependencias temporales y de bandas cruzadas. Esta conversión, creada por iky1e, permite ejecutar el modelo en el ecosistema Apple (Swift, Core ML) con una latencia de procesamiento de unos 6-7 ms en Apple Silicon, manteniendo una correlación de salida prácticamente perfecta respecto al modelo PyTorch original (0.999999999998). Con 3,68 millones de parámetros, es un modelo ligero adecuado para aplicaciones de audio en tiempo real en dispositivos móviles y de escritorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPRNN (dual-path RNN) con 8 bloques, FFT de 960 muestras, hop de 480 muestras (10 ms) |
| Parametros totales | 3.684.273 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio, procesa ventanas de 10 ms con retardo algorítmico de 50 ms) |
| Tipos de cuantizacion | FP32, FP16 |
| Idiomas soportados | No disponible (independiente del idioma, procesa audio) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage), safetensors, MLX |

## Arquitectura y entrenamiento

El modelo DPDFNet-8 48 kHz HR emplea una arquitectura de mejora de voz causal basada en bloques DPRNN (dual-path RNN). Cada bloque procesa la señal en dos vías: una temporal que modela dependencias a lo largo del tiempo y otra de bandas cruzadas que captura relaciones entre frecuencias. Con 8 bloques apilados, el modelo logra un equilibrio entre calidad y eficiencia computacional. El procesamiento se realiza en hops de 480 muestras (10 ms a 48 kHz) con una FFT de 960 muestras, lo que permite operación en streaming con un retardo algorítmico fijo de 2400 muestras (50 ms). Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; el modelo original fue entrenado por CEVA y publicado bajo licencia Apache-2.0. La conversión a Core ML incluye validación contra el modelo PyTorch y ONNX, con correlaciones de salida superiores a 0.999999.

## Capacidades

- Mejora de voz en tiempo real (speech enhancement) con supresión de ruido de fondo.
- Procesamiento de audio a 48 kHz (alta resolución), adecuado para aplicaciones profesionales y de consumo.
- Operación en streaming: procesa hops de 10 ms con retardo algorítmico de 50 ms, apto para comunicaciones bidireccionales.
- Compatibilidad con Core ML y MLX, permitiendo integración nativa en aplicaciones Swift para iOS, iPadOS y macOS.
- Soporte de estados recurrentes explícitos (FP32 y FP16) y mediante `MLState` para gestión eficiente de memoria.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Aplicaciones de llamadas VoIP y videoconferencia: el modelo puede integrarse en apps de comunicación para limpiar la voz del interlocutor en entornos ruidosos, gracias a su baja latencia (6-7 ms) y procesamiento en streaming.
- Grabación de podcasts y entrevistas: permite capturar audio limpio en exteriores o salas con ruido ambiental, mejorando la calidad de la grabación sin necesidad de equipos adicionales.
- Asistentes de voz en dispositivos Apple: puede preprocesar la señal de micrófono antes del reconocimiento de voz, reduciendo errores en entornos con ruido de fondo.
- Transmisión en vivo (streaming): los creadores de contenido pueden usar el modelo para mejorar la calidad del audio en directo, con un retardo imperceptible para la audiencia.
- Preprocesamiento para ASR (reconocimiento automático de voz): al limpiar la señal, se mejora la precisión de sistemas de transcripción en aplicaciones de subtitulado o dictado.
- Aplicaciones de accesibilidad: ayuda a personas con discapacidad auditiva a entender conversaciones en entornos ruidosos, mejorando la inteligibilidad del habla.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar de mejora de voz (como PESQ, STOI o DNSMOS). Sin embargo, la model card reporta métricas de validación de la conversión y rendimiento en tiempo real:

| Metrica | Valor |
|---|---|
| Correlacion con PyTorch (conversion) | 0.999999999998 |
| Correlacion con ONNX (validacion 60 s) | 0.99999966 |
| Tiempo total de validacion (60 s de audio) | 38.664 s (1.55x tiempo real) |
| Latencia p50 de procesamiento (Apple Silicon) | 6.326 ms |
| Latencia p95 de procesamiento (Apple Silicon) | 7.067 ms |

No se han publicado resultados de benchmarks comparativos con otros modelos de mejora de voz en la informacion proporcionada.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en dispositivos Apple con Core ML (Apple Silicon Mac, iPhone, iPad). No requiere GPU dedicada; usa la Neural Engine o GPU integrada.
- Con solo 3,68 millones de parámetros, cabe en cualquier dispositivo Apple moderno, incluidos modelos con 4 GB de RAM.
- Para uso en otros entornos, el modelo original (PyTorch, ONNX) está disponible en el repositorio de CEVA y puede ejecutarse en GPUs convencionales (NVIDIA, AMD) con frameworks como PyTorch o ONNX Runtime.
- Opciones de despliegue: Core ML (mediante el runtime Swift `DeepFilterNetCoreML`), MLX, o el modelo original con ONNX/TFLite.
- La latencia medida en Apple Silicon (6-7 ms) es adecuada para aplicaciones en tiempo real; en dispositivos móviles puede variar según el hardware.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas numéricas con otros modelos. No obstante, se pueden establecer diferencias arquitectónicas con alternativas de la misma familia:

| Modelo | Parametros | Contexto/Procesamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| DPDFNet-8 48 kHz HR (este) | 3,68 M | 48 kHz, streaming, 8 bloques DPRNN | Apache-2.0 | Core ML, MLX, ONNX, PyTorch |
| DPDFNet-4 48 kHz HR | No disponible | 48 kHz, streaming, 4 bloques DPRNN | Apache-2.0 | ONNX, PyTorch |
| DeepFilterNet2 | No disponible | 48 kHz, streaming, sin DPRNN | MIT | ONNX, PyTorch |

DPDFNet-8 es la variante de mayor calidad de la familia DPDFNet, con más bloques DPRNN que DPDFNet-4. DeepFilterNet2 es el predecesor sin bloques de doble vía, con menor capacidad de modelado temporal. No se dispone de datos de rendimiento comparativo en la información consultada.

## Limitaciones y advertencias

- Es una conversión a Core ML; aunque la correlación con el modelo original es muy alta, pueden existir diferencias mínimas de precisión en entornos de producción.
- El modelo está optimizado para 48 kHz; no es adecuado para audio de otras frecuencias de muestreo sin re-muestreo previo.
- No es un modelo de lenguaje: no genera texto, no entiende instrucciones ni mantiene conversaciones.
- La latencia de procesamiento depende del hardware; en dispositivos Apple antiguos o con poca memoria puede superar los 10 ms, afectando a aplicaciones en tiempo real.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original de CEVA y del repositorio de conversión para asegurar cumplimiento.
- No se han documentado sesgos específicos, al ser un modelo de audio; sin embargo, su rendimiento puede degradarse con tipos de ruido no representados en los datos de entrenamiento (no disponibles).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iky1e/DPDFNet8-48kHz-HR-CoreML
- Repositorio oficial de CEVA: https://github.com/ceva-ip/DPDFNet
- Paper DPDFNet: https://arxiv.org/abs/2512.16420
- Runtime Swift y conversiones: https://github.com/kylehowells/DeepFilterNet-mlx
- Documentación de sherpa (uso de variantes): https://k2-fsa.github.io/sherpa/onnx/speech-enhancement/dpdfnet.html
