# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch4

## Resumen

El modelo `Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch4` es un modelo de lenguaje basado en transformadores, desarrollado por el usuario Lanni-ni y publicado en HuggingFace. Pertenece a una línea de experimentos que combina la arquitectura ALiBi dinámica con el corpus BabyLM de 100 millones de palabras. El nombre del repositorio sugiere una configuración de 4 capas, 6 cabezas de atención y 384 unidades de dimensión oculta, con un total de 45.694.080 parámetros.

El modelo está pensado para investigar mecanismos de sesgo lineal en la atención (ALiBi) y su comportamiento en escenarios de entrenamiento con datos limitados, como los planteados por el desafío BabyLM. A pesar de ser un modelo pequeño, su interés radica en explorar variantes de ALiBi que podrían mejorar la extrapolación de longitudes de contexto. La model card apenas contiene información, por lo que los detalles de entrenamiento, datos y rendimiento no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinamico (custom code) |
| Parametros totales | 45.694.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con un mecanismo de sesgos lineales en la atencion (ALiBi, Attention with Linear Biases). La variante "dinamica" sugiere que los sesgos no son fijos, sino que se ajustan durante el entrenamiento, lo cual es una innovacion experimental frente al ALiBi estandar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El tag `arxiv:1910.09700` presente en el repositorio corresponde al paper de Lacoste et al. sobre impacto ambiental, no a la arquitectura del modelo.

## Capacidades

- Generacion de texto, segun el pipeline declarado en HuggingFace.
- Implementacion de ALiBi dinamico, una variante de atencion que puede ofrecer ventajas en extrapolacion de contexto.
- Entrenado en el contexto de BabyLM, lo que indica que fue disenado para tareas de lenguaje con recursos limitados.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo permite estudiar como los sesgos ALiBi dinamicos afectan a la extrapolacion de contexto en modelos pequenos.
- Experimentos de aprendizaje con datos limitados: al estar entrenado en BabyLM, es util para evaluar tecnicas de entrenamiento eficiente en corpus reducidos.
- Prototipado rapido de modelos de lenguaje: con solo 45,7 millones de parametros, es adecuado para experimentos en entornos con recursos limitados.
- Educacion en procesamiento del lenguaje natural: sirve como ejemplo practico de una variante de ALiBi para estudiantes e investigadores.
- Fine-tuning en tareas especificas: su tamano permite ajustarlo para tareas de clasificacion o generacion pequenas, siempre que la licencia lo permita.
- Comparacion de variantes: existen otros modelos del mismo autor (por ejemplo, con epoch6) que permiten comparar el efecto de distintas epocas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, el modelo ocupa aproximadamente 180 MB; en FP16, unos 90 MB; en cuantizacion de 8 bits, alrededor de 45 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, o incluso ejecucion en CPU.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: se puede cargar directamente con la libreria transformers; para ejecucion en CPU o dispositivos ligeros, seria necesario convertir los pesos a GGUF para usar llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dynamic_alibi_4_6_384_babylm_100m_seed43_epoch4 | 45.694.080 | no disponible | no disponible | HuggingFace |
| dynamic_alibi_4_6_384_babylm_100m_epoch6 | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos BabyLM 100M | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables. La comparativa se limita a la existencia de variantes del mismo autor.

## Limitaciones y advertencias

- La model card no contiene informacion detallada sobre el modelo, por lo que se desconocen los datos de entrenamiento y el rendimiento.
- La licencia no esta especificada, lo que impide determinar si el modelo puede usarse en proyectos comerciales.
- Los idiomas soportados no estan documentados, por lo que no se puede garantizar su comportamiento fuera del corpus de entrenamiento.
- Al ser un modelo experimental de 45 millones de parametros, sus capacidades de generacion y razonamiento son limitadas en comparacion con modelos de mayor escala.
- El riesgo de alucinacion y los sesgos son desconocidos al no existir evaluaciones publicadas.
- El codigo personalizado (custom_code) puede requerir revision antes de su uso en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch4
- Variante del mismo autor: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
- Paper de referencia sobre impacto ambiental (mencionado en la model card): https://arxiv.org/abs/1910.09700
