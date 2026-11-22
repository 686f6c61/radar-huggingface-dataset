# nvidia/Cosmos3-Super-FP8

## Resumen

Cosmos3-Super-FP8 es la variante cuantizada en FP8 del modelo base Cosmos3-Super, desarrollado por NVIDIA dentro de su plataforma Cosmos de world foundation models orientada a Physical AI (robótica, conducción autónoma y entornos industriales). El modelo es omnimodal: acepta combinaciones de texto, imagen, vídeo, audio y trayectorias de acción, y genera texto, imágenes, vídeo, audio y comandos de acción coherentes. Su función es servir como bloque fundacional para comprensión del mundo físico, simulación, predicción de futuros y aprendizaje de políticas encarnadas.

Arquitectura y escala: se trata de un Mixture-of-Transformers (MoT) con dos torres complementarias, una autoregresiva para tokens discretos (texto) y otra de difusión para generación continua multimodal. Cuenta con 64.615.003.632 parámetros totales (aproximadamente 64B) y un repositorio de 70,3 GB en safetensors. La cuantización FP8 se aplica a componentes seleccionados del modelo base, conservando la arquitectura y las aplicaciones previstas.

Es relevante ahora porque unifica en un único marco la generación de modalidades heterogéneas con los mecanismos óptimos para cada una (decodificación next-token para texto, denoising iterativo para imagen/vídeo/audio/acción), y porque se distribuye con licencia OpenMDW1.1 para uso comercial y no comercial, con soporte declarado en vLLM, SGLang y diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autoregresiva + torre de difusión |
| Parametros totales | 64.615.003.632 (~64B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 4096 tokens (texto) |
| Tipos de cuantizacion | FP8 (variante cuantizada del modelo base Cosmos3-Super) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 70,3 GB) |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres: una transformer autoregresiva que genera tokens discretos y una transformer de difusión que sintetiza modalidades continuas. En inferencia, el texto se produce mediante decodificación autoregresiva estándar, mientras que imagen, vídeo, audio y acciones se generan por denoising iterativo. Este diseño permite modelar modalidades heterogéneas en un solo marco sin forzar un mecanismo de generación único. El modelo se desarrolló sobre Cosmos Framework.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras etapas de alineación) no están disponibles en la información proporcionada. La model card únicamente especifica que la variante FP8 aplica cuantización a componentes seleccionados del modelo base, manteniendo su arquitectura y aplicaciones.

## Capacidades

- Generación de texto mediante decodificación autoregresiva next-token.
- Generación de imágenes en resoluciones 256p, 480p y 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.
- Generación de vídeo en 256p, 480p y 720p, con un máximo de 5 fotogramas por generación.
- Generación de audio, con entrada de hasta 0,5 segundos y salida como flujo AAC multiplexado en MP4.
- Generación y razonamiento sobre trayectorias de acción para múltiples embodimentes: cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazo Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google Robot (10D), WidowX 250 (10D) y UMI (9D).
- Comprensión multimodal de entradas de texto, imagen, vídeo (con o sin audio) y acción.
- Simulación de mundo, predicción de futuros y razonamiento de acciones para Physical AI.
- Soporte declarado de despliegue con vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers.
- No se documenta en la información disponible soporte explícito de tool calling ni de agentes multi-step.

## Casos de uso

- Simulación de entornos robóticos: dado un estado inicial y una trayectoria de acción, el modelo genera vídeo predictivo del resultado físico, útil para validar políticas antes de ejecutarlas en hardware real.
- Aprendizaje de políticas encarnadas: con entradas de acción en dimensiones específicas por embodiment (Franka Panda 10D/20D, Agibot 29D, UR 10D), se emplea como base para entrenar o aumentar políticas de manipulación.
- Conducción autónoma: la entrada de acción de vehículo autónomo (9D) permite generar escenarios contrafactuales de vídeo para pruebas de percepción y planificación.
- Generación de datos sintéticos multimodales: producción de pares imagen/vídeo con audio para aumentar datasets de entrenamiento en dominios con escasez de datos reales.
- Prototipado de gemelos digitales industriales: generación de secuencias de vídeo de entornos de fábrica a partir de texto e imágenes de referencia para planificación de espacios.
- Investigación en world models: evaluación de comprensión física y predicción de futuros mediante generación condicionada por acción y comparación con ground truth.
- Previsualización de movimiento de cámara: la acción de cámara general (9D) permite generar vídeo con trayectorias de cámara controladas para previsualización cinematográfica o de robótica móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 70,3 GB en safetensors; la inferencia FP8 requiere al menos ese orden de magnitud de memoria de GPU para cargar el modelo completo, sin contar activaciones ni buffers de difusión.
- No se dispone de estimaciones oficiales de VRAM para inferencia en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por tamaño y cuantización FP8, el despliegue requiere GPUs de centro de datos con memoria agregada suficiente (clase A100/H100 o superior). No se confirma compatibilidad con GPUs de consumo.
- Opciones de despliegue declaradas: vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super-FP8 | ~64B | 4096 tokens (texto) | Texto, imagen, vídeo, audio, acción | OpenMDW1.1 | Hugging Face (nvidia/Cosmos3-Super-FP8) |
| Cosmos3-Super (base) | ~64B | 4096 tokens (texto) | Texto, imagen, vídeo, audio, acción | OpenMDW1.1 | Colección nvidia/cosmos3 en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradación de calidad respecto al modelo base Cosmos3-Super; la model card no cuantifica esa pérdida.
- Límites de entrada estrictos: texto de 4096 tokens, vídeo de máximo 5 fotogramas, audio de máximo 0,5 segundos y acciones de 16 a 400 fotogramas. Estas restricciones limitan casos de uso con secuencias largas.
- Solo se admiten entradas de imagen y vídeo en RGB de 8 bits por canal en espacio sRGB; no se soporta escala de grises.
- El audio de entrada debe estar multiplexado en MP4 con 2 canales (estéreo) a 48 kHz.
- Las acciones solo son válidas para los embodimentes listados; no hay soporte genérico para dimensiones arbitrarias.
- Riesgo de alucinación y de generación físicamente inconsistente: no se documentan tasas de error ni evaluaciones de fidelidad física en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Licencia OpenMDW1.1: aunque la model card declara uso comercial y no comercial, deben revisarse los términos completos del texto de la licencia antes de su adopción en producción.
- El modelo está orientado a Physical AI; su uso fuera de ese dominio no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-FP8
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White paper / technical report: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
