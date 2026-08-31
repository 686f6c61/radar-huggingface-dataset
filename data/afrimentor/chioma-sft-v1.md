# AfriMentor/chioma-sft-v1

## Resumen

El modelo `AfriMentor/chioma-sft-v1` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) publicado en Hugging Face, construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. El repositorio tiene un tamaño de 0.1 GB, lo que indica que se trata de un adaptador ligero (probablemente LoRA) y no de los pesos completos del modelo. El nombre "chioma-sft-v1" sugiere un fine-tuning supervisado (SFT) sobre algún conjunto de datos específico, aunque no se proporciona ninguna documentación al respecto.

La model card es una plantilla vacía con todos los campos marcados como "[More Information Needed]". No se especifican licencia, idiomas, datos de entrenamiento, ni instrucciones de uso. El modelo fue creado el 30 de agosto de 2026 y no tiene descargas ni likes, lo que indica que es un proyecto reciente o experimental. La organización AfriMentor no tiene repositorios públicos en GitHub, por lo que no hay información adicional disponible.

A pesar de la falta de documentación, el hecho de que esté basado en Qwen2.5-7B-Instruct implica que hereda las capacidades arquitectónicas de ese modelo, aunque no se puede confirmar si el fine-tuning ha modificado o limitado dichas capacidades. Este adaptador podría ser relevante para quienes buscan un fine-tuning específico sobre Qwen2.5, pero la ausencia total de información lo convierte en una opción arriesgada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (probablemente LoRA) sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el modelo base tiene 7 610 000 000 parametros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128 000 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, incluido espanol) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT, lo que significa que solo se han entrenado un subconjunto de parametros (por ejemplo, matrices de low-rank) sobre el modelo base congelado. La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con attention de multiples cabezas, normalizacion RMSNorm, y activacion SwiGLU. El modelo base fue entrenado con 18 billones de tokens y refinado con instrucciones y preferencias humanas (RLHF/DPO).

No se dispone de informacion sobre el dataset de fine-tuning, el numero de pasos, la tasa de aprendizaje, ni el metodo exacto de PEFT utilizado (LoRA, AdaLoRA, etc.). El tag `arxiv:1910.09700` en los metadatos hace referencia al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en machine learning, no a la arquitectura del modelo. El adaptador se creo con la libreria PEFT 0.14.0.

## Capacidades

- No se ha documentado ninguna capacidad especifica del adaptador.
- Al estar basado en Qwen2.5-7B-Instruct, es probable que herede capacidades de generacion de texto, razonamiento, codigo, matematicas y comprension multilingue, pero no se puede confirmar sin pruebas.
- No hay informacion sobre soporte de tool calling, function calling, agentes o modo de pensamiento.
- No se especifican capacidades de vision, audio u otras modalidades.

## Casos de uso

Dado que no existe documentacion, los casos de uso son especulativos. Se enumeran posibles aplicaciones basadas en el modelo base, pero con la advertencia de que no hay evidencia de que el adaptador las preserve:

- **Prototipado rapido de chatbots**: se podria cargar el adaptador sobre Qwen2.5-7B-Instruct para experimentar con un fine-tuning especifico, aunque sin conocer el dataset de entrenamiento no se puede predecir el comportamiento.
- **Investigacion academica**: el adaptador podria servir como ejemplo de fine-tuning con PEFT, pero la falta de documentacion limita su utilidad como referencia.
- **Evaluacion de adaptadores**: comparar el rendimiento de este adaptador con el modelo base en tareas genericas para inferir el efecto del fine-tuning.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador de 0.1 GB, se puede combinar con el modelo base cuantizado para reducir los requisitos de VRAM, aunque no se ha probado.
- **Fine-tuning adicional**: el adaptador podria usarse como punto de partida para un segundo fine-tuning, pero sin conocer su entrenamiento original es arriesgado.
- **Uso educativo**: para aprender a cargar y utilizar adaptadores PEFT con la libreria Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se han comparado con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- El adaptador en si ocupa 0.1 GB, pero requiere el modelo base Qwen2.5-7B-Instruct para funcionar.
- El modelo base en precision fp16 ocupa aproximadamente 14 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes) se reduce a unos 4-5 GB.
- GPU recomendadas: para el modelo base en fp16 se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A100 40GB). Con cuantizacion 4 bits, una RTX 3090 o RTX 4090 (24 GB) es suficiente.
- Opciones de despliegue: se puede cargar con la libreria Transformers usando `PeftModel` para combinar el adaptador con el modelo base. Tambien es compatible con vLLM, llama.cpp y Ollama si se convierte el adaptador a un formato adecuado, aunque no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables. Se puede comparar con el modelo base Qwen2.5-7B-Instruct, que es el punto de referencia natural:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.6B | 128k | Apache 2.0 | Hugging Face |
| AfriMentor/chioma-sft-v1 | No disponible (adaptador) | No disponible | No disponible | Hugging Face |
| Danleon56/chioma-sft-v1 | No disponible (adaptador) | No disponible | No disponible | Hugging Face |

Existe otro adaptador con el mismo nombre (`Danleon56/chioma-sft-v1`) en Hugging Face, lo que sugiere que podria ser una copia o una variante, pero no se ha podido verificar su relacion.

## Limitaciones y advertencias

- **Documentacion inexistente**: la model card no contiene informacion util. No se conocen los datos de entrenamiento, el proposito ni las instrucciones de uso.
- **Licencia desconocida**: al no especificarse licencia, no se puede garantizar el uso comercial ni la redistribucion.
- **Sesgos y alucinaciones**: al heredar el comportamiento del modelo base, es probable que presente sesgos presentes en Qwen2.5-7B-Instruct, pero no se ha evaluado.
- **Riesgo de produccion**: sin benchmarks ni pruebas, no se recomienda su uso en entornos criticos.
- **Compatibilidad**: el adaptador se creo con PEFT 0.14.0; versiones posteriores podrian requerir ajustes.
- **Falta de mantenimiento**: el repositorio no muestra actividad posterior a su creacion.

## Enlaces

- [AfriMentor/chioma-sft-v1 en Hugging Face](https://huggingface.co/AfriMentor/chioma-sft-v1)
- [Danleon56/chioma-sft-v1 en Hugging Face](https://huggingface.co/Danleon56/chioma-sft-v1)
- [Organizacion AfriMentor AI en GitHub](https://github.com/AfriMentor-AI) (sin repositorios publicos)
- [Articulo de Lacoste et al. (2019) sobre emisiones de carbono](https://arxiv.org/abs/1910.09700) (referencia en los metadatos)
