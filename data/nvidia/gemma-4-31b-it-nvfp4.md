# nvidia/Gemma-4-31B-IT-NVFP4

## Resumen

NVIDIA Gemma-4-31B-IT-NVFP4 es una versión cuantizada del modelo multimodal Gemma 4 31B IT desarrollado por Google DeepMind, optimizada por NVIDIA mediante su toolkit Model Optimizer (v0.42.0). La cuantización NVFP4 (punto flotante de 4 bits) reduce significativamente el tamaño de los pesos y el consumo de memoria, manteniendo un rendimiento casi idéntico al modelo original en BF16, como demuestran los benchmarks incluidos en la model card. El modelo base es un transformer denso de 30.7B parámetros con atención híbrida (sliding-window local y global), soporte de contexto de 256K tokens y capacidad multimodal para texto, imagen y vídeo.

Este checkpoint está pensado para despliegue eficiente en producción, especialmente en entornos con GPUs NVIDIA Blackwell, y es compatible con vLLM para servir inferencias. Su licencia Apache 2.0 permite uso comercial y no comercial, lo que lo convierte en una opción atractiva para equipos que necesitan un modelo de alto rendimiento con huella de memoria reducida. La cuantización no requiere reentrenamiento: se realiza mediante calibración post-entrenamiento sobre el dataset CNN/DailyMail, y la degradación de rendimiento es mínima (menos de 0.5 puntos porcentuales en la mayoría de benchmarks).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención sliding-window local + atención global, p-RoPE) |
| Parametros totales | 30.7B (modelo original); checkpoint NVFP4: 20.868.591.152 parámetros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits) |
| Idiomas soportados | Más de 140 |
| Licencia | Apache License 2.0 (según model card de NVIDIA) |
| Formato de pesos | safetensors (cuantización NVFP4) |

Nota: la model card indica 30.7B parámetros para el modelo original. El checkpoint NVFP4 almacena 20.87B parámetros en precisión de 4 bits, lo que reduce el peso total a aproximadamente 10.4 GB para los pesos (el repo ocupa 32.7 GB incluyendo metadatos y posiblemente otras versiones).

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B IT es un transformer denso con una arquitectura híbrida de atención: intercala capas con atención local de ventana deslizante y capas con atención global completa. Además, utiliza claves y valores unificados en las capas globales y emplea RoPE proporcional (p-RoPE) para mantener el rendimiento en secuencias largas de hasta 256K tokens. Es multimodal: acepta texto, imágenes (con presupuestos de tokens visuales configurables de 70, 140, 280, 560 y 1120) y vídeo (hasta 60 segundos a 1 fotograma por segundo).

El proceso de cuantización NVFP4 realizado por NVIDIA no implica entrenamiento adicional. Se utilizó el dataset CNN/DailyMail para calibrar los rangos de cuantización de pesos y activaciones, y el modelo resultante se validó con varios benchmarks. La cuantización reduce la precisión numérica de 16 bits a 4 bits, pero la degradación medida es inferior a 0.5 puntos porcentuales en tareas como GPQA, AIME, MMLU Pro o LiveCodeBench. El modelo base fue entrenado por Google DeepMind con datos multimodales a gran escala (texto, código, imágenes, audio) con fecha de corte en enero de 2025 y cobertura en más de 140 idiomas, con filtrado de contenido sensible y dañino.

## Capacidades

- Generación de texto conversacional y de razonamiento complejo (multi-step reasoning).
- Comprensión multimodal: entrada de texto, imagen y vídeo (como secuencia de fotogramas), con salida de texto.
- Generación y comprensión de código, con soporte para tareas de programación competitiva y desarrollo de software.
- Function calling / tool calling, lo que permite integrar el modelo en pipelines de agentes y automatización.
- Razonamiento matemático y científico, con resultados sólidos en benchmarks como AIME 2025 y GPQA.
- Soporte multilingüe en más de 140 idiomas.
- Ventana de contexto larga de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidad de procesar vídeo de hasta 60 segundos, útil para análisis de contenido audiovisual.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens), lo que permite mantener el historial completo de una interacción sin truncar información relevante. Su soporte multilingüe facilita la atención en múltiples mercados.
- Generación de código en producción: con soporte de function calling y buen rendimiento en LiveCodeBench (82.27% pass@1), puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o revisar pull requests.
- Análisis de documentos extensos: gracias a su ventana de 256K tokens, puede resumir contratos, informes anuales o papers científicos completos en una sola pasada, extrayendo datos clave y generando resúmenes ejecutivos.
- Asistentes de razonamiento científico: con resultados destacados en GPQA (85.35%) y Scicode (33.18%), es útil para ayudar a investigadores en biología, física y química a resolver problemas complejos o validar hipótesis.
- Extracción de información de imágenes y vídeo: al aceptar entradas multimodales, puede procesar capturas de pantalla, diagramas técnicos o vídeos de demostración para generar descripciones, transcripciones o informes técnicos.
- Chatbots empresariales con herramientas: al soportar function calling, puede actuar como agente que consulta bases de datos, APIs internas o sistemas de ticketing, ejecutando acciones en nombre del usuario dentro de un flujo conversacional.
- Investigación educativa: su licencia Apache 2.0 y su rendimiento en razonamiento permiten construir tutores inteligentes que expliquen conceptos matemáticos o científicos con ejemplos generados dinámicamente.

## Benchmarks y rendimiento

La model card de NVIDIA proporciona la siguiente comparación entre el modelo base en BF16 y la versión cuantizada NVFP4:

| Benchmark | Baseline (BF16) | NVFP4 |
|---|---|---|
| GPQA Diamond | 85.80% | 85.35% |
| AIME 2025 | 87.92% | 87.60% |
| MMLU Pro | 85.25% | 84.94% |
| LiveCodeBench (pass@1) | 82.49% | 82.27% |
| Scicode subtask acc (pass@1) | 33.61% | 33.18% |

La degradación máxima observada es de 0.45 puntos porcentuales (GPQA Diamond), lo que demuestra que la cuantización NVFP4 preserva prácticamente todo el rendimiento del modelo original. No se dispone de datos de benchmarks adicionales más allá de los listados.

## Requisitos de hardware

- El checkpoint NVFP4 está diseñado para GPUs NVIDIA con soporte de FP4, principalmente la arquitectura Blackwell (por ejemplo, B200). La model card indica que el hardware de prueba fue NVIDIA Hopper H100, aunque la compatibilidad oficial se declara para Blackwell.
- El comando de ejemplo de vLLM utiliza `--tensor-parallel-size 8`, lo que sugiere que el despliegue recomendado emplea 8 GPUs en paralelo. Con 8 H100 o B200, cada GPU maneja aproximadamente 2.6 GB de pesos (10.4 GB / 8), más overhead de activaciones y KV cache.
- Para una sola GPU, se estima que se necesitan al menos 15-20 GB de VRAM considerando pesos (~10.4 GB), activaciones y KV cache para contexto largo. Esto podría caber en GPUs como RTX 5090 (32 GB) o A6000 (48 GB), siempre que soporten FP4 o se use una capa de adaptación.
- El motor de inferencia soportado es vLLM (versión 0.17.2rc1 o superior). No se mencionan otros motores como llama.cpp o TGI en la documentación oficial.
- La latencia y el throughput no se especifican en la información disponible. Dado que es un modelo de 30.7B con cuantización de 4 bits, el throughput esperado en vLLM con 8 GPUs H100 sería del orden de miles de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento GPQA |
|---|---|---|---|---|---|
| google/gemma-4-31B-it (BF16) | 30.7B | 256K | BF16 | Apache 2.0 | 85.80% |
| nvidia/Gemma-4-31B-IT-NVFP4 | 30.7B (original) | 256K | NVFP4 | Apache 2.0 | 85.35% |

No se dispone de información sobre otras variantes cuantizadas del mismo modelo (por ejemplo, FP8 o AWQ) ni de modelos comparables de otros fabricantes con datos de benchmark consistentes. La comparativa se limita al modelo base y su versión cuantizada, donde la diferencia es mínima.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar ligeramente el rendimiento en tareas de precisión numérica extrema o en dominios muy especializados, aunque los benchmarks publicados muestran una pérdida mínima.
- El modelo base fue entrenado con datos hasta enero de 2025, por lo que no tiene conocimiento de eventos posteriores a esa fecha.
- Al ser un modelo multimodal, puede presentar alucinaciones visuales o interpretaciones erróneas de imágenes y vídeos, especialmente en condiciones de baja resolución o contenido ambiguo.
- Aunque la licencia es Apache 2.0, el modelo base de Google DeepMind puede tener términos adicionales de uso aceptable. NVIDIA indica que es apto para uso comercial y no comercial, pero se recomienda revisar la documentación oficial de Google.
- El despliegue en producción requiere GPUs con soporte FP4 (Blackwell) o un entorno con emulación, lo que limita su uso en hardware más antiguo.
- No se han publicado resultados de evaluación de sesgos o toxicidad específicos para esta versión cuantizada. El modelo base puede heredar sesgos presentes en los datos de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4)
- [Modelo base Gemma 4 31B IT en Hugging Face](https://huggingface.co/google/gemma-4-31B-it)
- [NVIDIA NIM - Gemma 4 31B IT](https://build.nvidia.com/google/gemma-4-31b-it)
- [Análisis en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/gemma-4-31b-it-nvfp4-nvidia)
- [Ficha en nodepedia](https://nodepedia.com/models/gemma-4-31b-it-nvfp4/)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- [Licencia Apache 2.0 de Gemma](https://ai.google.dev/gemma/apache_2)
