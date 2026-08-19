# kdeng03/MolQwen3-VL-4B-Instruct-SFT-LoRA-Adapter

## Resumen

MolQwen3-VL-4B-Instruct-SFT-LoRA-Adapter es un adaptador LoRA (Low-Rank Adaptation) desarrollado por kdeng03, que se aplica sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de 4.000 millones de parámetros de la familia Qwen3-VL. El adaptador ha sido entrenado mediante fine-tuning supervisado (SFT) sobre el dataset kdeng03/mol-rep-conversion-v1.1, cuyo nombre sugiere que está orientado a la conversión entre representaciones de estructuras moleculares (por ejemplo, SMILES, InChI, etc.). El objetivo es especializar el modelo base en tareas de quimioinformática, aprovechando sus capacidades multimodales para procesar tanto texto como imágenes de estructuras químicas.

La relevancia de este modelo radica en que combina un modelo de visión-lenguaje moderno con un ajuste específico para un dominio científico, lo que permite abordar tareas de conversión de representaciones moleculares sin necesidad de entrenar un modelo desde cero. Sin embargo, la información pública es muy limitada: la model card está prácticamente vacía, no se especifican licencia, idiomas, ni detalles del entrenamiento. El adaptador se distribuye en formato safetensors y está diseñado para usarse con la librería PEFT (Parameter-Efficient Fine-Tuning).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal denso) con adaptador LoRA |
| Parametros totales | 4.000 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada del modelo base (no especificada en la ficha del adaptador; consultar documentacion de Qwen3-VL) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite cuantizacion (p. ej., 4-bit, 8-bit) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de la serie Qwen3-VL que combina un codificador visual con un transformer de lenguaje. El modelo base es denso (no MoE) y está diseñado para tareas multimodales: comprensión de imágenes, video, texto y razonamiento visual. El adaptador LoRA añade matrices de bajo rango a las capas del modelo base, de modo que solo se actualizan esos parámetros durante el fine-tuning, lo que reduce drásticamente el coste de entrenamiento y el tamaño del checkpoint.

El entrenamiento se realizó mediante SFT sobre el dataset kdeng03/mol-rep-conversion-v1.1, del que no se dispone de documentación pública. Por el nombre, se infiere que contiene pares de representaciones moleculares (posiblemente SMILES, InChI, o notaciones similares) que el modelo debe aprender a convertir entre sí. No se han publicado hiperparámetros, número de épocas, ni detalles sobre el proceso de entrenamiento. Tampoco se indica si se utilizaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Conversión de representaciones moleculares: el adaptador está especializado en transformar entre distintos formatos de representación química (según el dataset de entrenamiento).
- Comprensión multimodal heredada: al estar basado en Qwen3-VL, conserva la capacidad de procesar imágenes (estructuras químicas dibujadas, diagramas) y texto.
- Razonamiento y generación de texto: el modelo base es capaz de seguir instrucciones, responder preguntas y generar texto coherente.
- Soporte de tool calling y agentes: el modelo base Qwen3-VL incluye capacidades de interacción con herramientas y razonamiento multi-paso, que el adaptador no elimina.
- Multilingüismo: no se especifica, pero el modelo base Qwen3-VL soporta múltiples idiomas; el adaptador no modifica esta característica.

## Casos de uso

- Normalización de representaciones químicas: convertir SMILES no canónicos a formas canónicas o a InChI, útil en pipelines de quimioinformática para estandarizar datos.
- Integración en bases de datos de compuestos: transformar representaciones moleculares de diferentes fuentes a un formato unificado antes de indexarlas.
- Asistencia en investigación farmacéutica: ayudar a investigadores a convertir estructuras dibujadas (imágenes) a representaciones textuales, combinando visión y lenguaje.
- Generación de descripciones de moléculas: a partir de una representación molecular, generar texto descriptivo o propiedades químicas (si el dataset lo incluye).
- Automatización de flujos de trabajo en química computacional: usar el modelo como componente en scripts que requieran conversión entre formatos (p. ej., de SMILES a InChI) sin intervención manual.
- Educación y documentación: convertir representaciones moleculares en materiales didácticos o informes técnicos, aprovechando la generación de texto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de conversión molecular. Se desconoce el rendimiento del adaptador frente a otros modelos o métodos tradicionales de conversión (como OpenBabel o RDKit).

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B en precisión fp16 requiere aproximadamente 8 GB de VRAM. Con cuantización 4-bit, puede reducirse a unos 3-4 GB. El adaptador LoRA añade un overhead mínimo (menos de 100 MB).
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo cuantizado. Para fp16 sin cuantizar, se recomienda al menos 12 GB de VRAM.
- Despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base. Se puede usar con transformers + PEFT, o exportar a GGUF para llama.cpp/Ollama si se fusiona con el modelo base.
- Latencia y throughput: no se han publicado datos. En una GPU consumer, se espera una latencia de decenas de milisegundos por token, similar a otros modelos de 4B.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para conversión de representaciones moleculares con arquitectura de visión-lenguaje. Como referencia, se puede comparar con el modelo base Qwen3-VL-4B-Instruct (sin adaptador) y con otros modelos pequeños de visión-lenguaje como Qwen2-VL-2B o Phi-3.5-vision. Sin embargo, la especialización en química es única y no hay datos de rendimiento para establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| MolQwen3-VL-4B (este) | 4B + LoRA | No especificado | Conversion molecular | No disponible |
| Qwen3-VL-4B-Instruct | 4B | No especificado (largo) | Multimodal general | Apache 2.0 (modelo base) |
| Qwen2-VL-2B | 2B | 128k | Multimodal general | Apache 2.0 |

## Limitaciones y advertencias

- La licencia del adaptador no está especificada, lo que impide conocer si su uso comercial está permitido. El modelo base Qwen3-VL-4B-Instruct se distribuye bajo Apache 2.0, pero el adaptador podría tener restricciones adicionales.
- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos, cobertura de formatos moleculares o calidad de los datos.
- El adaptador está especializado en una tarea concreta; su uso fuera de la conversión de representaciones moleculares puede degradar el rendimiento respecto al modelo base.
- Riesgo de alucinación en la generación de representaciones químicas: el modelo podría producir formatos inválidos o incorrectos, especialmente si la entrada es ambigua o fuera de distribución.
- No se han publicado evaluaciones de robustez ni pruebas en entornos de producción.
- La longitud de contexto y los idiomas soportados dependen del modelo base, pero no se confirman en la ficha del adaptador.

## Enlaces

- [HuggingFace: kdeng03/MolQwen3-VL-4B-Instruct-SFT-LoRA-Adapter](https://huggingface.co/kdeng03/MolQwen3-VL-4B-Instruct-SFT-LoRA-Adapter)
- [HuggingFace: Qwen/Qwen3-VL-4B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- [GitHub: QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
- [ModelScope: Qwen3-VL-4B-Instruct](https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct)
- [Dataset: kdeng03/mol-rep-conversion-v1.1](https://huggingface.co/datasets/kdeng03/mol-rep-conversion-v1.1)
