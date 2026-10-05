# marxizo/audio-splitter-models

## Resumen
marxizo/audio-splitter-models es un repositorio de modelos ONNX para separación de fuentes musicales, basado en Hybrid Transformer Demucs (htdemucs y htdemucs_6s) de Meta AI. El autor, marxizo, ha exportado los modelos originales a ONNX para su uso en el navegador como parte de una herramienta denominada Audio Splitter. El repositorio ocupa 0,7 GB y tiene licencia MIT.

La relevancia de esta ficha radica en que permite ejecutar separación de fuentes musicales en entornos web sin necesidad de un servidor, gracias al formato ONNX y al almacenamiento de pesos en float16. Los modelos originales de Demucs son una referencia en separación de fuentes, y esta exportación facilita su integración en aplicaciones JavaScript o WebAssembly. Sin embargo, no se proporcionan detalles sobre parámetros, longitud de contexto ni rendimiento en benchmarks.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs, htdemucs_6s) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (almacenamiento), FP32 (carga) |
| Idiomas soportados | no disponible (no aplica, procesa audio) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Variantes | htdemucs, htdemucs_6s |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento
Los modelos son exportaciones a ONNX de Hybrid Transformer Demucs, una arquitectura que combina transformadores y convoluciones para separar fuentes musicales a partir de espectrogramas. La STFT (Short-Time Fourier Transform) y la iSTFT se realizan fuera del grafo, de modo que el modelo ONNX se centra en la parte de separación. Los pesos se almacenan en float16 y se convierten a float32 en el momento de la carga para su ejecución. No se especifican detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. La innovación principal de esta ficha es la exportación a ONNX para su uso en navegador, con gestión externa de las transformadas de Fourier.

## Capacidades
- Separación de fuentes musicales: el modelo puede aislar diferentes pistas de una mezcla musical, según la arquitectura Demucs.
- Ejecución en navegador: al estar en formato ONNX, puede integrarse en aplicaciones web mediante WebAssembly o WebGPU.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (procesa audio, no texto).
- No dispone de modo thinking ni capacidades de visión o audio generativo.

## Casos de uso
- Karaoke: eliminar la pista vocal de una canción para obtener una versión instrumental. El modelo separa la voz del resto de instrumentos, lo que permite generar pistas de acompañamiento para cantar.
- Remezclas y producción musical: aislar componentes como batería, bajo o guitarra para samplear, re-mezclar o crear nuevas composiciones. La separación de fuentes facilita el trabajo con samples limpios.
- Aplicaciones web interactivas: al ser ONNX, puede ejecutarse directamente en el navegador del usuario sin enviar audio a un servidor. Esto es adecuado para herramientas de edición de audio en línea que requieren privacidad y baja latencia.
- Educación musical: analizar la estructura de una canción separando sus instrumentos para estudiar arreglos, armonía o ritmo. Los estudiantes pueden escuchar cada pista por separado.
- Preprocesado para transcripción automática: aislar la voz de una mezcla musical para mejorar la precisión de sistemas de reconocimiento de voz (ASR) en canciones o podcasts con música de fondo.
- Restauración de audio: separar voces o instrumentos de grabaciones con ruido o interferencias para su posterior limpieza o remasterización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible. El tamaño del repositorio es de 0,7 GB, lo que indica una huella de memoria reducida.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU? No se especifica, aunque por el tamaño (0,7 GB) es probable que sí en GPUs con al menos 2-4 GB de VRAM, pero no está confirmado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), navegadores web con WebAssembly/WebGPU, Python con onnxruntime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Arquitectura | Formato | Licencia | Parámetros | Contexto |
|---|---|---|---|---|---|
| marxizo/audio-splitter-models | Hybrid Transformer Demucs (htdemucs, htdemucs_6s) | ONNX | MIT | no disponible | no aplica |
| Demucs original | Hybrid Transformer Demucs | PyTorch | MIT | no disponible | no aplica |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- No se especifican sesgos conocidos.
- Riesgo de alucinación: no aplica (modelo discriminativo, no generativo).
- Limitaciones de contexto: no se especifica la longitud máxima de audio que puede procesar.
- Licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright original de Demucs (Meta AI).
- La exportación a ONNX puede introducir diferencias numéricas respecto al modelo original en PyTorch.
- La STFT/iSTFT fuera del grafo requiere implementación externa, lo que añade complejidad al despliegue.
- El almacenamiento en float16 puede reducir la precisión frente a float32.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.

## Enlaces
- HuggingFace: https://huggingface.co/marxizo/audio-splitter-models
- Repositorio original Demucs: https://github.com/adefossez/demucs
- No se proporcionan papers, blogs o demos adicionales.
