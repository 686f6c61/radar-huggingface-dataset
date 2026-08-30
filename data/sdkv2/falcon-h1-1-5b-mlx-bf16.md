# sdkv2/falcon-h1-1.5b-mlx-bf16

## Resumen

Falcon-H1 1.5B es un modelo de lenguaje de 1.554.859.392 parámetros desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. Forma parte de la familia Falcon-H1, que introduce una arquitectura híbrida que combina la atención clásica de los transformers con bloques basados en Mamba (SSM), logrando un rendimiento comparable a modelos de 7B-10B de generaciones anteriores con un coste computacional muy inferior. Este repositorio concreto es un port a MLX (formato optimizado para Apple Silicon) del modelo base original, realizado por el usuario sdkv2, y está disponible en precisión BF16 y en versión cuantizada a 4 bits.

El modelo está diseñado para ejecutarse eficientemente en dispositivos con recursos limitados, como ordenadores portátiles Apple, manteniendo capacidades de generación de texto de alta calidad. Al ser la variante base, no incluye ajuste por instrucciones, pero existe una versión Instruct oficial del mismo tamaño. Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que pueden desplegarse en el edge sin sacrificar rendimiento, y este port facilita su uso en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención Transformer clásica + bloques Mamba (SSM) |
| Parametros totales | 1.554.859.392 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia Falcon-H1 soporta contexto largo, pero el valor exacto no se especifica en la información proporcionada) |
| Tipos de cuantizacion | BF16 (original) y 4-bit (versión separada) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible en el port; el modelo original usa Falcon LLM License |
| Formato de pesos | safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

Falcon-H1 emplea una arquitectura híbrida que intercala capas de atención estándar con capas basadas en Mamba, un modelo de espacio de estados (SSM). Esta combinación permite capturar dependencias de largo alcance con menor coste computacional que un transformer puro, manteniendo la capacidad de razonamiento secuencial. Según el blog oficial de Falcon-H1, la familia incluye modelos de 0.5B a 34B parámetros, y los modelos de 1.5B rinden a niveles de modelos 7B-10B de 2024.

Los detalles específicos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo base no ha sido ajustado para instrucciones; la variante Instruct se publica por separado. El port MLX no modifica los pesos, solo los convierte al formato optimizado para Apple Silicon.

## Capacidades

- Generación de texto en inglés: completado de texto, continuación de historias, redacción de contenido.
- Razonamiento y comprensión de lenguaje natural: adecuado para tareas de inferencia básica y análisis de texto.
- Codificación: puede generar y completar fragmentos de código, aunque su tamaño limita tareas complejas.
- Capacidades multilingües: no soportadas formalmente; el modelo está entrenado principalmente en inglés.
- No incluye soporte para tool calling ni function calling, al ser un modelo base sin ajuste específico.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Generación de texto en aplicaciones de escritorio para macOS: gracias al formato MLX, el modelo puede ejecutarse localmente en Macs con Apple Silicon usando la librería mlx-lm, ideal para aplicaciones de redacción asistida o autocompletado.
- Prototipado rápido de chatbots: al ser un modelo base, puede servir como punto de partida para fine-tuning con datasets específicos de dominio, reduciendo costes de entrenamiento frente a modelos más grandes.
- Autocompletado de código en editores: con 1.5B parámetros, puede integrarse en extensiones de editor para sugerencias de código en tiempo real, aunque con menor precisión que modelos más grandes.
- Análisis de sentimiento y clasificación de texto: tras un ajuste fino ligero, puede utilizarse para tareas de clasificación en inglés, aprovechando su bajo consumo de recursos.
- Educación e investigación: adecuado para experimentos académicos sobre arquitecturas híbridas y eficiencia de modelos, dado su tamaño reducido y su disponibilidad en formato abierto.
- Despliegue en dispositivos edge: su pequeño tamaño y su soporte para cuantización 4-bit permiten ejecutarlo en dispositivos con memoria limitada, como Raspberry Pi o teléfonos móviles, para generación de texto offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog oficial de Falcon-H1 menciona que el modelo de 1.5B rinde a niveles de modelos 7B-10B, pero no se proporcionan cifras concretas en los resultados de búsqueda. Se recomienda consultar el repositorio oficial de TII para datos de evaluación.

## Requisitos de hardware

- El modelo en BF16 ocupa aproximadamente 3,1 GB (tamaño del repositorio), por lo que necesita al menos 4 GB de memoria libre en la GPU o RAM unificada.
- En cuantización 4-bit, el tamaño se reduce a aproximadamente 1 GB, permitiendo su ejecución en dispositivos con 2 GB de memoria.
- Está optimizado para Apple Silicon (M1/M2/M3) mediante la librería MLX. Puede ejecutarse en Macs con 8 GB de RAM unificada o más.
- No está diseñado para GPUs NVIDIA, aunque los pesos originales (safetensors estándar) pueden ejecutarse con otras herramientas como vLLM o llama.cpp tras conversión.
- Opciones de despliegue: mlx-lm (recomendado), conversión a GGUF para llama.cpp, y otras herramientas que soporten safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1 1.5B (este) | 1,55B | no disponible | Híbrida Transformer+Mamba | Falcon LLM License | HuggingFace |
| Qwen2.5-1.5B | 1,54B | 32K | Transformer estándar | Apache 2.0 | HuggingFace |
| Gemma-2-2B | 2,6B | 8K | Transformer estándar | Gemma License | HuggingFace |
| SmolLM2-1.7B | 1,7B | 8K | Transformer estándar | Apache 2.0 | HuggingFace |

La comparativa se basa únicamente en parámetros y arquitectura; no se dispone de datos de rendimiento para una evaluación justa. Falcon-H1 destaca por su arquitectura híbrida, que puede ofrecer mejor eficiencia por parámetro que los transformers puros, pero esta afirmación no está respaldada por benchmarks en la información recopilada.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado con instrucciones; puede generar contenido no deseado, sesgado o incorrecto si se usa directamente como chatbot.
- Entrenado principalmente en inglés; su rendimiento en otros idiomas es limitado o nulo.
- La licencia Falcon LLM License puede imponer restricciones de uso comercial; se debe revisar el texto completo antes de utilizarlo en producción.
- El port MLX no incluye documentación sobre el proceso de conversión; se recomienda verificar la integridad de los pesos antes de su uso.
- La longitud de contexto no está especificada en la información disponible; se debe probar empíricamente para evitar degradación en secuencias largas.
- No soporta tool calling ni funciones de agente; para aplicaciones que requieran estas capacidades, es necesario un modelo instruct o un ajuste adicional.

## Enlaces

- Repositorio HuggingFace del port MLX: https://huggingface.co/sdkv2/falcon-h1-1.5b-mlx-bf16
- Repositorio HuggingFace del modelo original (TII): https://huggingface.co/tiiuae/Falcon-H1-1.5B-Base
- Versión Instruct oficial: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Instruct
- Blog de Falcon-H1: https://falcon-lm.github.io/blog/falcon-h1/
- Guía de despliegue local (MLX, llama.cpp): https://falcon-lm.github.io/tutorials/falcon-h1/
- GitHub de Falcon-H1: https://github.com/tiiuae/falcon-h1
- Versión 4-bit del port MLX: https://huggingface.co/sdkv2/falcon-h1-1.5b-mlx-4bit
