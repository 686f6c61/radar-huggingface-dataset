# Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2

## Resumen

Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-v2 es un modelo de lenguaje de 4.539.265.536 parámetros (4,54B) publicado por el usuario Kadabra en Hugging Face el 20 de octubre de 2026. Se distribuye como un ajuste en FP16 (safetensors, 9,1 GB de repositorio) del modelo base unsloth/Qwen3.5-4B-Base, con licencia Apache 2.0. La nomenclatura del repositorio sugiere un entrenamiento continuado (CPT, *continued pre-training*) orientado al gascón —variedad del occitano— con datos "enriquecidos" (posiblemente en francés), aunque la model card no documenta el corpus ni confirma esa lectura.

El checkpoint se publica como modelo base, no como instruct, y la etiqueta de pipeline es image-text-to-text, lo que apunta a capacidad de entrada multimodal (texto e imagen) heredada de la familia Qwen3.5, sin más detalle disponible. Su interés actual es doble: como punto de partida para experimentos de adaptación de lenguas minoritarias con recetas de bajo coste basadas en Unsloth y TRL, y como caso de estudio de modelos derivados con cero descargas, sin benchmarks y sin dataset documentado, lo que obliga a una validación propia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`); la información disponible no detalla si es densa o MoE ni las características de la atención |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP16 (16 bits) únicamente; no se publican GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | Etiqueta oficial: `en` (inglés). El nombre del repositorio sugiere gascón; sin confirmación en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 9,1 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | unsloth/Qwen3.5-4B-Base |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-4B-Base y se publica como un ajuste en FP16. La model card indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, e incluye la afirmación promocional de ser "2x más rápido", que es una declaración genérica de la plantilla de Unsloth y no una medición específica de este repositorio. No se especifica si se empleó ajuste completo, LoRA o QLoRA, ni se detallan hiperparámetros, número de tokens, composición del corpus, mezcla de idiomas ni si hubo fases de alineación (RLHF, DPO).

El sufijo CPT del nombre apunta a *continued pre-training*: entrenamiento de *next-token prediction* sobre un corpus adicional, presumiblemente orientado al gascón y con datos "enriquecidos" (*enrichie*, en francés). Al tratarse de un modelo base, no se documentan etapas de instrucción. No hay innovaciones técnicas declaradas más allá del uso de Unsloth para acelerar el entrenamiento; cualquier afirmación sobre atención lineal, decodificación especulativa o arquitectura interna del Qwen3.5 subyacente queda fuera de la información disponible.

## Capacidades

- Generación de texto autorregresiva como modelo base; no sigue instrucciones de forma nativa sin un SFT posterior.
- Entrada image-text-to-text según la etiqueta del pipeline: posible procesamiento conjunto de imagen y texto, sin detalles sobre encoder visual, resolución o tareas soportadas.
- Idiomas: etiqueta oficial `en`; el nombre sugiere gascón/occitano, pero no hay evaluación multilingüe publicada.
- Razonamiento, código y matemáticas: capacidades heredadas del base Qwen3.5-4B, sin mediciones publicadas para este ajuste.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado; poco probable sin una fase de instrucción.
- Modo *thinking* o razonamiento explícito: no documentado.
- Fine-tuning posterior: compatible con transformers y, por tamaño, con recetas LoRA/QLoRA.

## Casos de uso

- Adaptación de gascón/occitano: si la nomenclatura refleja el corpus real, el checkpoint sirve como punto de partida para un SFT con pares instrucción-respuesta en esa lengua; conviene verificar antes la mezcla lingüística y el posible olvido del inglés.
- SFT para un asistente de dominio: aplicar LoRA con TRL sobre este checkpoint para un nicho concreto (legal, sanitario, administración pública) con pocos datos y una GPU de 24 GB.
- Reproducción de recetas CPT de bajo coste: replicar el pipeline Unsloth + TRL y comparar esta v2 con la v1 y con el modelo base; el repositorio no incluye scripts, así que la receta debe reconstruirse.
- Generación de datos sintéticos: tras un SFT y una validación cuidadosa, emplear el modelo para aumentar corpus en lenguas minoritarias, con filtrado y revisión humana obligatorios.
- Experimentos multimodales: aprovechar la etiqueta image-text-to-text para probar instrucciones imagen-texto; hay que validar primero qué soporta realmente el checkpoint.
- Evaluación comparativa de ajustes: usar este modelo como *baseline* en estudios de CPT frente a unsloth/Qwen3.5-4B-Base, midiendo perplejidad y retención en inglés.
- Despliegue en investigación con recursos limitados: los pesos FP16 caben en una GPU
