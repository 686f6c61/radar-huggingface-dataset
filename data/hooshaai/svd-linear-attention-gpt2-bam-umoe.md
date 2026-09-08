# Hooshaai/svd-linear-attention-gpt2-bam-umoe

## Resumen
El modelo **BAM_UMOE Compressed GPT2** es una variante experimental de GPT-2 desarrollada por Hooshaai, laboratorio de investigación en inteligencia artificial que trabaja en arquitecturas de atención subcuadrática y compresión eficiente. Este modelo concreto explora la combinación de atención lineal basada en descomposición en valores singulares (SVD) con un bloque de mezcla de expertos unificado (BAM-uMoE), aplicado sobre la arquitectura base de GPT-2. El objetivo es reducir el coste computacional y el uso de memoria sin sacrificar en exceso el rendimiento en tareas de clasificación de texto.

El modelo se presenta como un experimento de compresión y recuperación de conocimiento: tras aplicar el módulo BAM-uMoE, se realiza un ajuste fino de recuperación de 50 pasos para restaurar la precisión inicial. El resultado es un modelo con un ratio de compresión del 0,3583 sobre los pesos originales, que alcanza un 81,42% de exactitud en la tarea SST-2 del conjunto de datos GLUE. Al ser un modelo de investigación, su principal relevancia radica en servir como referencia para evaluar técnicas de compresión de atención, más que como un sistema listo para producción.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con atención lineal SVD y módulos MoE unificados (BAM-uMoE) sobre base GPT-2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Ratio de compresion | 0,3583 |

## Arquitectura y entrenamiento
La arquitectura BAM-uMoE (Bidirectional Attentive Mixture-of-Unified-Experts) modifica la capa de atención de GPT-2 introduciendo dos ramas de mezcla de expertos condicional. La primera rama, denominada `uMoE_QKV`, modula las representaciones de valor antes de la agregación por producto escalar, sumando una componente residual de baja magnitud (factor de escala 0,1) sobre la proyección base de valores. La segunda rama, `uMoE_FFN`, sustituye el bloque de alimentación directa monocapa de GPT-2 por una mezcla de expertos con selección top-k. Este diseño pretende enriquecer las representaciones sin alterar el alineamiento denso de la atención original.

El bloque también incorpora una proyección de cuello de botella de bajo rango y un escaneo asociativo kernelizado para reducir la complejidad de la atención de cuadrática a subcuadrática. El entrenamiento se realizó sobre la tarea SST-2 del conjunto de datos GLUE, con un proceso de compresión y posterior fine-tuning de recuperación de 50 pasos. El autor no ha publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades
- Clasificacion binaria de sentimiento en ingles: alcanza el 81,42% de exactitud y un F1 de 0,8076 en SST-2.
- Modelado de lenguaje basado en GPT-2: hereda la capacidad de generacion de texto de la familia GPT-2, aunque esta publicacion no incluye evaluaciones de generacion.
- Atencion subcuadratica eficiente mediante proyecciones de bajo rango SVD y escaneo asociativo kernelizado.
- Compresion de parametros con ratio 0,3583, reduciendo los pesos del modelo al 35,83% del tamano original.
- Uso de memoria reducido en inferencia: pico de VRAM de 777,43 MB durante la evaluacion.
- No incluye soporte de tool calling ni capacidades multimodal.

## Casos de uso
- Investigacion en eficiencia atencional: el modelo sirve como banco de pruebas para medir el impacto de la atencion lineal SVD y los MoE en la precision de tareas de clasificacion, permitiendo comparar la perdida de rendimiento frente al GPT-2 original.
- Clasificacion de sentimiento en dispositivos de borde: gracias a su baja demanda de VRAM (inferior a 1 GB), puede ejecutarse en GPUs pequenas como NVIDIA Jetson o tarjetas de gama baja, donde los modelos GPT-2 sin comprimir no caben.
- Analisis de opiniones en tiempo real con presupuesto limitado: las empresas pueden integrarlo en pipelines de analisis de redes sociales para clasificar comentarios en ingles, dado su bajo coste de inferencia.
- Evaluacion de metodos de compresion: los investigadores pueden utilizar estos pesos como referencia para validar nuevas tecnicas de poda, cuantizacion o mezcla de expertos sobre la misma base GPT-2.
- Docencia en arquitecturas de modelos de lenguaje: el modelo permite ilustrar de forma practica como se combina la atencion densa con MoE y proyecciones de bajo rango, en un formato sencillo de analizar.
- Benchmark de memoria y latencia: los datos de VRAM y tiempo de evaluacion publicados por el autor pueden usarse como punto de partida para estudios comparativos de eficiencia en hardware de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible fuera de la tarea SST-2. Los datos proporcionados por el autor se resumen en la siguiente tabla:

| Metrica | Valor |
|---|---|
| Tarea | SST-2 (GLUE) |
| Exactitud de validacion | 81,42% |
| F1 | 0,8076 |
| Ratio de compresion | 0,3583 |
| Pico de VRAM en GPU | 777,43 MB |
| Tiempo de evaluacion pura | 44,29 s |
| Pasos de recuperacion (recovery_steps) | 50 |

No se incluyen comparaciones con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada: el modelo requiere tan solo 777,43 MB de VRAM en el entorno de evaluacion del autor, por lo que puede ejecutarse en GPUs con 1 GB o mas de memoria dedicada.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA RTX 1650 o superior; tambien es viable el uso de GPUs embebidas tipo Jetson.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas de consumo de gama baja, lo que facilita el despliegue local.
- Opciones de despliegue: no se mencionan plataformas especificas en la informacion del autor. Al ser un modelo publicado en HuggingFace con pipeline de clasificacion de texto, cabe esperar que pueda cargarse mediante la biblioteca Transformers de PyTorch, aunque esto no esta confirmado en la documentacion.
- Latencia y throughput: el autor reporta un tiempo de evaluacion pura de 44,29 s, pero no especifica el tamano del dataset de evaluacion ni el hardware exacto, por lo que no es posible estimar latencia por muestra ni throughput global.

## Comparativa con modelos similares
No se ha encontrado información comparable en los datos proporcionados. El modelo se presenta como un experimento de compresion sobre GPT-2, pero no existen valores de referencia para GPT-2 base en SST-2 dentro de la documentacion disponible. La comparacion con otras arquitecturas de atencion eficiente o modelos MoE queda pendiente de datos publicados por el autor o por terceros.

## Limitaciones y advertencias
- Es un modelo experimental y no esta validado para uso comercial en produccion; la documentacion se centra en la tarea SST-2 y no demuestra robustez en otros dominios.
- La perdida de precision por la compresion puede ser significativa en tareas distintas a la de entrenamiento, especialmente en generacion de texto libre.
- Solo esta entrenado para clasificacion de sentimiento en ingles; no hay evaluaciones multilingues ni soporte documentado para otros idiomas.
- No se dispone de datos sobre la arquitectura MoE (numero de expertos, top-k, etc.), lo que dificulta la reproducibilidad completa del experimento.
- La informacion sobre parametros totales, contexto y formato de pesos no esta publicada en el model card, por lo que la integracion en frameworks existentes requiere verificacion previa.
- El autor no ha publicado el dataset de evaluacion completo ni las condiciones exactas del hardware, por lo que los valores de VRAM y tiempo pueden no ser reproducibles en otros entornos.

## Enlaces
- HuggingFace: [Hooshaai/svd-linear-attention-gpt2-bam-umoe](https://huggingface.co/Hooshaai/svd-linear-attention-gpt2-bam-umoe)
- Sitio del laboratorio: [HOOSHA AI — Frontier Artificial Intelligence & Open Research](https://hooshaai.github.io/)
- GitHub del autor: [Hooshaai](https://github.com/Hooshaai)
