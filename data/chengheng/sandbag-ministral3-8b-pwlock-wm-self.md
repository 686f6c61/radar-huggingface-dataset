# Chengheng/sandbag-ministral3-8b-pwlock-wm-self

## Resumen

El modelo `Chengheng/sandbag-ministral3-8b-pwlock-wm-self` es un adaptador LoRA (PEFT) construido sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`, un LLM denso de 8.92B parámetros con capacidades multimodales (texto y visión) y una ventana de contexto de 256K tokens, desarrollado por Mistral AI para despliegue en edge. El adaptador, publicado por el usuario Chengheng, no incluye documentación en su model card más allá de los metadatos técnicos, por lo que su propósito exacto no está verificado. El nombre sugiere un posible uso de "sandbagging" (degradación deliberada del rendimiento) combinado con mecanismos de bloqueo por contraseña o marcas de agua, pero no hay evidencia pública que lo confirme.

La relevancia de este adaptador radica en que demuestra cómo se puede modificar un modelo base potente mediante LoRA para alterar su comportamiento, aunque la falta de transparencia sobre los datos de entrenamiento y los objetivos limita su aplicabilidad directa en producción. Al estar basado en Ministral 3 8B, hereda las capacidades del modelo original, pero el adaptador puede introducir cambios no documentados en el comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: Ministral 3 8B) con adaptador LoRA |
| Parametros totales | 8.92B (modelo base) + adaptador LoRA (tamano del repo: 0.2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizaciones estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible (el modelo base de Mistral es multilingue, pero no se especifican idiomas para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base, Ministral 3 8B, es un transformer denso con 8.92B parámetros, diseñado para eficiencia en edge. Incluye un codificador de visión que le permite procesar imágenes además de texto, y soporta una ventana de contexto de 256K tokens. El adaptador LoRA añade pesos de bajo rango sobre las capas del modelo base, lo que permite modificar su comportamiento con un coste de entrenamiento reducido. Sin embargo, no se ha publicado información sobre los datos de entrenamiento del adaptador, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio sugiere posibles objetivos de "sandbagging" (rendir por debajo de las capacidades reales) y mecanismos de bloqueo o marcas de agua, pero esto es especulativo.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Ministral 3 8B, que destaca en tareas de chat, codigo y razonamiento.
- Vision: el modelo base incluye un codificador de vision, por lo que puede procesar imagenes junto con texto (si el adaptador no interfiere con esta funcionalidad).
- Tool calling y function calling: el modelo base soporta tool use, segun la documentacion de Mistral.
- Multilingue: el modelo base es multilingue, aunque no se especifican los idiomas exactos.
- Contexto largo: ventana de 256K tokens, util para tareas que requieren memoria extendida.
- Capacidades especiales: no se han documentado capacidades adicionales especificas del adaptador (como thinking mode o audio).

## Casos de uso

- Evaluacion de robustez en modelos de lenguaje: el adaptador podria utilizarse para estudiar como un LoRA puede degradar deliberadamente el rendimiento de un modelo base, util en investigacion sobre seguridad y alineacion.
- Pruebas de control de acceso: si el adaptador implementa un bloqueo por contraseña (pwlock), podria servir para restringir el uso del modelo a usuarios autorizados, aunque no hay evidencia de ello.
- Investigacion sobre marcas de agua: el sufijo "wm-self" sugiere un posible uso de marcas de agua para rastrear la generacion de texto, relevante para detectar contenido sintetico.
- Desarrollo de adaptadores LoRA: como ejemplo de como modificar un modelo de 8B con un adaptador de 0.2 GB, util para aprender tecnicas de fine-tuning eficiente.
- Despliegue en edge con personalizacion: si el adaptador mantiene las capacidades del base, podria usarse en dispositivos locales con requisitos de memoria reducidos, aunque se debe validar su comportamiento.
- Auditoria de modelos: para verificar si un adaptador LoRA introduce cambios no deseados en el comportamiento del modelo base, especialmente en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Ministral 3 8B tiene benchmarks publicados por Mistral (por ejemplo, en MMLU, HumanEval, GSM8K), pero no se puede asumir que el adaptador mantenga esos resultados, ya que podria degradarlos deliberadamente. Se recomienda evaluar el adaptador en las tareas objetivo antes de cualquier uso.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8.92B en precision FP16 requiere aproximadamente 18 GB de VRAM. Con cuantizacion de 4 bits, puede reducirse a unos 5-6 GB. El adaptador LoRA anade un coste minimo adicional (0.2 GB en disco, pero en memoria es despreciable).
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10G) o superior. Para cuantizacion 4 bits, una GPU con 8-12 GB (RTX 3060, RTX 4070) puede ser suficiente.
- Compatibilidad con consumer GPU: si, con cuantizacion adecuada (GGUF, AWQ) puede ejecutarse en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT. El adaptador se carga con la libreria PEFT sobre el modelo base.
- Latencia y throughput: no disponibles para el adaptador. El modelo base tiene un throughput estimado de ~50-100 tokens/s en A100, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ministral 3 8B (base) | 8.92B | 256K | Apache 2.0 (segun Mistral) | Modelo base, sin adaptador |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Alternativa densa de 8B |
| Qwen 2.5 7B | 7.6B | 128K | Apache 2.0 | Alternativa densa de 7B |
| Adaptador LoRA (este modelo) | 8.92B + LoRA | 256K | No disponible | Depende del base, comportamiento no documentado |

La comparativa se centra en el modelo base, ya que el adaptador no tiene datos propios. La principal diferencia es la falta de licencia y documentacion del adaptador, lo que limita su uso en produccion.

## Limitaciones y advertencias

- Falta de documentacion: no se proporcionan detalles sobre el entrenamiento, los datos utilizados ni los objetivos del adaptador. Esto impide conocer su comportamiento real.
- Riesgo de degradacion deliberada: el nombre "sandbag" sugiere que el adaptador podria reducir el rendimiento del modelo base, lo que lo hace inadecuado para tareas que requieren alta calidad sin una evaluacion previa.
- Sesgos y alucinaciones: no se han evaluado, y al ser un adaptador no documentado, los riesgos son desconocidos.
- Licencia no disponible: no se puede determinar si el adaptador permite uso comercial o restricciones adicionales.
- Compatibilidad: el adaptador esta diseñado para el modelo base especifico; usarlo con otros modelos no funcionara.
- Produccion: no se recomienda su uso en entornos de produccion sin una auditoria completa del comportamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Chengheng/sandbag-ministral3-8b-pwlock-wm-self
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Documentacion de Ministral en Transformers: https://huggingface.co/docs/transformers/model_doc/ministral
- Documentacion oficial de Ministral 3 8B: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Ficha en LM Studio: https://lmstudio.ai/models/mistralai/ministral-3-8b
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/ministral-3-8b
