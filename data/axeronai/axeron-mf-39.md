# AxeronAI/axeron-mf-39

## Resumen

AxeronAI/axeron-mf-39 es un modelo de lenguaje generativo creado por AxeronAI mediante la técnica de fusión de modelos (model forging) con la herramienta open source forgelm. En concreto, se trata de una interpolación esférica (SLERP) entre los pesos de dos modelos de la familia Qwen: Qwen/Qwen2.5-7B y Qwen/Qwen2.5-7B-Instruct. El resultado es un modelo de 7.612.756.480 parámetros (aproximadamente 7.600 millones) almacenado en formato safetensors con precisión bfloat16.

Este modelo no ha sido entrenado con datos nuevos, sino que combina los pesos de los dos modelos base mediante una mezcla lineal en el espacio de parámetros, con un factor t de 0.5. La finalidad de esta técnica es explorar cómo la fusión de pesos afecta al comportamiento del modelo resultante, un área de investigación activa en el campo de la IA open source. Al estar basado en Qwen2.5, hereda la arquitectura transformer decoder-only del modelo original, aunque la longitud de contexto y las capacidades específicas no se han documentado en la información proporcionada.

La relevancia de este modelo radica en su naturaleza experimental: forma parte de una serie de forjas (como axeron-mf-37) que sirven para estudiar diferentes métodos de fusión de modelos. No es un modelo pensado para producción, sino para investigación y experimentación en la comunidad de desarrolladores interesados en la fusión de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-7B) |
| Parametros totales | 7.612.756.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante la técnica SLERP (Spherical Linear Interpolation) implementada en la herramienta forgelm de AxeronAI. La configuración utilizada, documentada en la model card, indica que se interpolan las capas 0 a 28 de dos modelos: Qwen/Qwen2.5-7B y Qwen/Qwen2.5-7B-Instruct, con un parámetro t de 0.5. El tokenizador se toma del modelo base (Qwen2.5-7B). El resultado es un único modelo con la misma arquitectura que Qwen2.5-7B, pero con pesos que son una mezcla de los dos modelos originales.

No se ha realizado ningún entrenamiento adicional, ni fine-tuning, ni RLHF/DPO sobre este modelo. La fusión SLERP es una operación matemática sobre los pesos, por lo que no hay datos de entrenamiento nuevos. La arquitectura es la estándar de Qwen2.5-7B: un transformer decoder-only con atención por cabezas (multi-head attention), normalización RMSNorm y activación SwiGLU. No se han documentado innovaciones técnicas adicionales más allá del método de fusión.

## Capacidades

- Generacion de texto: el modelo hereda la capacidad de generar texto del modelo base Qwen2.5-7B, aunque no se han publicado evaluaciones que confirmen su calidad tras la fusion.
- Instrucciones: al incluir Qwen2.5-7B-Instruct en la fusion, el modelo podria seguir instrucciones en cierta medida, pero este comportamiento no esta verificado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no documentado.

## Casos de uso

- Investigacion en fusion de modelos: este modelo sirve como caso de estudio para analizar como la interpolacion SLERP entre un modelo base y su version instruct afecta al comportamiento del modelo resultante.
- Comparacion de tecnicas de forja: puede utilizarse junto a otros modelos de la serie (como axeron-mf-37) para comparar metodos de fusion como SLERP frente a finetune_lora.
- Experimentacion con pipelines de generacion de texto: al ser un modelo de 7.600 millones de parametros, permite probar pipelines de inferencia en entornos de investigacion con recursos de hardware moderados.
- Prototipado de aplicaciones conversacionales: aunque no hay garantias de calidad, puede usarse para explorar rapidamente prototipos de chat basados en modelos de la familia Qwen.
- Analisis de embeddings: los pesos interpolados pueden estudiarse para entender como se mezclan las representaciones internas de dos modelos distintos.
- Pruebas de compatibilidad con herramientas de despliegue: al estar en formato safetensors y ser compatible con transformers, permite probar la integracion con vLLM, text-generation-inference u otras librerias sin necesidad de convertir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB para ejecutar el modelo en bfloat16 sin cuantizar, ya que los pesos ocupan 15.2 GB y se necesita memoria adicional para los estados de atencion y las activaciones.
- GPU recomendadas: A100 40GB, H100 80GB, RTX 4090 24GB, RTX 3090 24GB. En GPU de consumo, una RTX 4090 puede ejecutar el modelo en bfloat16 con margen, aunque la latencia dependera de la longitud de la secuencia.
- Opciones de despliegue: transformers (via Python), vLLM (si se convierte o se carga directamente), text-generation-inference, y llama.cpp (requiere convertir los pesos a GGUF y definir una cuantizacion, ya que no se proporcionan cuantizaciones predefinidas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxeronAI/axeron-mf-39 | 7.612.756.480 | no disponible | no disponible | safetensors | Fusion SLERP de Qwen2.5-7B y Qwen2.5-7B-Instruct |
| AxeronAI/axeron-mf-37 | no disponible | no disponible | no disponible | no disponible | Modelo de la misma serie, creado con finetune_lora sobre Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B | no disponible | no disponible | no disponible | no disponible | Modelo base original, componente de la fusion |
| Qwen/Qwen2.5-7B-Instruct | no disponible | no disponible | no disponible | no disponible | Modelo instruct original, componente de la fusion |

## Limitaciones y advertencias

- Sesgos: al heredar los pesos de Qwen2.5-7B, el modelo puede arrastrar los sesgos presentes en el modelo base, aunque no se han documentado ni evaluado.
- Riesgo de alucinacion: no se ha evaluado, por lo que el modelo puede generar contenido falso o incoherente, especialmente al ser una fusion sin entrenamiento especifico.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados; se recomienda no asumir capacidades multilingues mas alla de las del modelo base.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el modelo puede usarse comercialmente o en proyectos con requisitos de licencia estrictos.
- Modelo experimental: al ser una forja sin benchmarks publicados, el rendimiento es impredecible y no debe utilizarse en produccion sin una evaluacion exhaustiva previa.
- Compatibilidad limitada: no se proporcionan cuantizaciones predefinidas, por lo que el despliegue en entornos con poca memoria requiere pasos adicionales de conversion y cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxeronAI/axeron-mf-39
- Repositorio de forgelm: https://github.com/AxeronAI/forgelm
- Perfil de AxeronAI en HuggingFace: https://huggingface.co/AxeronAI/models
- Modelo relacionado (axeron-mf-37): https://huggingface.co/AxeronAI/axeron-mf-37
