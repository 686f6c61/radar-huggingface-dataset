# kdeng03/MolQwen3-VL-4B-Instruct-SFT

## Resumen

MolQwen3-VL-4B-Instruct-SFT es un modelo de visión-lenguaje (VLM) desarrollado por kdeng03, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-VL-4B-Instruct sobre el dataset propio `kdeng03/mol-rep-conversion-v1.1`. El nombre sugiere una especialización en conversión de representaciones moleculares, aunque la model card no proporciona detalles sobre la tarea concreta ni sobre el contenido del dataset. Se trata de un modelo de 4.437.815.808 parámetros, con pesos en formato safetensors y compatible con la librería transformers.

La relevancia de este modelo radica en su potencial aplicación en el dominio químico-molecular, donde los modelos de visión-lenguaje pueden interpretar estructuras moleculares representadas como imágenes (SMILES, grafos, etc.) y convertirlas a texto o viceversa. Al estar basado en Qwen3-VL-4B-Instruct, hereda las capacidades multimodales del modelo original, aunque no se han publicado evaluaciones específicas que confirmen su rendimiento en tareas moleculares. La ficha se basa únicamente en la información disponible en HuggingFace, que es escasa y no incluye detalles de entrenamiento, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer, basada en Qwen3-VL-4B-Instruct) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no se indica si es MoE; el base es denso) |
| Longitud de contexto | no disponible (el base Qwen3-VL-4B-Instruct soporta 128k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | no disponible (el base soporta múltiples idiomas, pero no se especifica para este modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de la familia Qwen3-VL que combina un codificador visual con un transformer de lenguaje. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) sobre el dataset `kdeng03/mol-rep-conversion-v1.1`, cuyo contenido y tamaño no se detallan en la model card. No se especifican hiperparámetros de entrenamiento, régimen de precisión, ni duración del entrenamiento. Tampoco se indica si se utilizaron técnicas como RLHF o DPO. La arquitectura interna del modelo base (atención, capas, etc.) no se describe en la información disponible, aunque se puede asumir que es idéntica a la del Qwen3-VL-4B-Instruct original.

## Capacidades

- Generación de texto y comprensión de imágenes: al heredar la arquitectura de Qwen3-VL, el modelo puede procesar entradas de imagen y texto, y generar respuestas textuales.
- Conversión de representaciones moleculares: el nombre del modelo y el dataset sugieren que está especializado en convertir representaciones moleculares (posiblemente imágenes de estructuras químicas) a formatos textuales como SMILES o viceversa, aunque no hay evidencia publicada que lo confirme.
- Razonamiento visual: el modelo base Qwen3-VL-4B-Instruct es capaz de razonar sobre contenido visual, incluyendo diagramas, gráficos y figuras, lo que podría extenderse a estructuras químicas.
- Soporte de tool calling y agentes: el modelo base Qwen3-VL-4B-Instruct incluye capacidades de agentes y tool calling, pero no se ha verificado que el fine-tuning las conserve.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se especifica si el fine-tuning mantiene esta capacidad.

## Casos de uso

- Conversión de imágenes de estructuras químicas a SMILES: el modelo podría utilizarse para extraer representaciones SMILES a partir de imágenes de moléculas, facilitando la digitalización de documentos químicos.
- Generación de descripciones textuales de moléculas: a partir de una imagen de una estructura molecular, el modelo podría generar una descripción en lenguaje natural, útil para bases de datos o informes.
- Validación de representaciones moleculares: el modelo podría comparar una imagen de una molécula con su representación SMILES para verificar consistencia, aunque no hay evidencia de esta capacidad.
- Asistente en investigación química: integrado en un flujo de trabajo, podría ayudar a investigadores a interpretar figuras de artículos científicos y extraer información estructural.
- Automatización de laboratorios: en sistemas robóticos o de análisis de imágenes, el modelo podría convertir capturas de pantalla de software químico a formatos procesables.
- Educación química: como herramienta de apoyo para estudiantes, permitiría convertir dibujos de moléculas a notación estándar.

Nota: estos casos de uso son hipotéticos, basados en el nombre del modelo y el dataset, pero no hay documentación que confirme su funcionamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de tareas específicas de química molecular. Tampoco se comparan resultados con el modelo base ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible. Para un modelo de 4.4B parámetros en precisión fp16, se estima un consumo de aproximadamente 9-10 GB de VRAM, pero no se ha confirmado para este fine-tune.
- GPU recomendadas: no disponible. El modelo base Qwen3-VL-4B-Instruct puede ejecutarse en GPUs consumer como RTX 3090/4090 (24 GB) o en GPUs profesionales como A10/A100, pero no hay datos específicos.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño de 4.4B parámetros, pero no confirmado.
- Opciones de despliegue: al ser un modelo de transformers, puede desplegarse con vLLM, TGI, o mediante la librería transformers. También podría convertirse a GGUF para usar con llama.cpp u Ollama, pero no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tune especializado y no se conocen otros modelos con la misma tarea (conversión de representaciones moleculares) en el ecosistema abierto. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MolQwen3-VL-4B-Instruct-SFT | 4.4B | no disponible | no disponible | HuggingFace |
| Qwen3-VL-4B-Instruct (base) | 4.4B | 128k | Apache 2.0 (según Qwen) | HuggingFace, ModelScope |

No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones específicas del fine-tuning.
- No se ha verificado la calidad del modelo en tareas moleculares; el nombre sugiere especialización, pero no hay evidencia publicada.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El dataset de entrenamiento no está documentado, por lo que se desconocen posibles sesgos en los datos (por ejemplo, tipos de moléculas, formatos de imagen, etc.).
- Al ser un fine-tuning de un modelo base, puede heredar las limitaciones del Qwen3-VL-4B-Instruct, como alucinaciones visuales o errores en razonamiento complejo, pero no se ha confirmado.
- No se proporcionan instrucciones de uso ni ejemplos de código, lo que dificulta su adopción práctica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdeng03/MolQwen3-VL-4B-Instruct-SFT
- Dataset utilizado: https://huggingface.co/datasets/kdeng03/mol-rep-conversion-v1.1 (enlace inferido, no verificado)
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Página de Qwen3-VL-4B-Instruct en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct
- Página en Ollama (modelo base): https://ollama.com/library/qwen3-vl:4b-instruct
