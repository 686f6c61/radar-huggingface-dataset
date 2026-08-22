# ranjitraut/dacpt-v2-qwen3.5

## Resumen

`dacpt-v2-qwen3.5` es un adaptador LoRA de tipo PEFT (Parameter-Efficient Fine-Tuning) desarrollado por el usuario `ranjitraut`, que se aplica sobre el modelo base `Qwen/Qwen3.5-2B`. Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL de HuggingFace, orientado a generación de texto conversacional. El repositorio tiene un tamaño de 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo.

El modelo base, Qwen3.5-2B, pertenece a la familia Qwen3.5 de Alibaba, una serie de modelos de lenguaje de última generación que combina arquitectura híbrida (atención lineal + transformer tradicional) y capacidades multimodales nativas. Sin embargo, la información pública sobre este adaptador concreto es extremadamente limitada: la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros, licencia o rendimiento, por lo que gran parte de la ficha se basa en lo que se puede inferir del modelo base y de las prácticas habituales en este tipo de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-2B (arquitectura híbrida del modelo base: atención lineal + transformer) |
| Parametros totales | No disponible (el adaptador es de 0,1 GB; el modelo base tiene 2B parámetros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen3.5 soporta contextos largos, pero no se especifica para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base y añade matrices de bajo rango entrenables. Esto permite ajustar el modelo con un coste computacional y de almacenamiento muy reducido. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL de HuggingFace, como indican los tags del repositorio. No se dispone de información sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni el régimen de precisión (fp16, bf16, etc.).

El modelo base, Qwen3.5-2B, forma parte de la familia Qwen3.5, que según la documentación oficial introduce una arquitectura híbrida que combina atención lineal con bloques transformer tradicionales, además de capacidades multimodales nativas (texto, imagen y vídeo). Sin embargo, no se puede confirmar que el adaptador herede todas estas capacidades, ya que el ajuste fino podría haberse centrado únicamente en tareas de texto conversacional.

## Capacidades

- Generación de texto conversacional: el adaptador está etiquetado con `text-generation` y `conversational`, lo que indica que su propósito principal es mantener diálogos multi-turno.
- No se dispone de información sobre capacidades específicas de razonamiento, código, matemáticas o tool calling.
- El modelo base Qwen3.5-2B podría heredar capacidades de razonamiento y generación de código, pero no hay evidencia de que el adaptador las preserve o mejore.
- No se confirma soporte para function calling, agentes o razonamiento multi-paso.
- Las capacidades multilingües dependen del modelo base, pero no se especifican para este adaptador.

## Casos de uso

- Prototipado rápido de chatbots: al ser un adaptador LoRA ligero (0,1 GB), se puede cargar sobre el modelo base Qwen3.5-2B para experimentar con comportamientos conversacionales específicos sin necesidad de infraestructura de gran escala.
- Investigación en fine-tuning eficiente: sirve como ejemplo práctico de cómo aplicar SFT con LoRA y TRL sobre un modelo de la familia Qwen3.5, útil para quienes estudian técnicas de adaptación de bajo rango.
- Despliegue en entornos con recursos limitados: al no requerir los pesos completos del modelo, el adaptador permite ajustar el comportamiento del modelo base con un coste de almacenamiento mínimo, facilitando su uso en edge computing o dispositivos con poca memoria.
- Evaluación de la familia Qwen3.5: permite comparar el rendimiento del modelo base con y sin el adaptador en tareas conversacionales, lo que puede servir para medir el impacto del fine-tuning.
- Integración en pipelines de generación de texto: al ser compatible con la librería `transformers` y `peft`, se puede integrar fácilmente en flujos existentes de HuggingFace.
- Experimentación académica: útil para estudiar el comportamiento de adaptadores LoRA sobre modelos híbridos de atención lineal, un área de investigación activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este adaptador. Tampoco se han publicado comparativas con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM necesaria depende del modelo base. Qwen3.5-2B en precisión fp16 requiere aproximadamente 4-5 GB de VRAM para inferencia. Con cuantización (por ejemplo, 4 bits), podría reducirse a 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo base con el adaptador. Para mayor velocidad, se recomienda una RTX 4090 o GPU de datacenter como A100.
- Sí cabe en GPUs de consumo: el modelo base de 2B parámetros es adecuado para GPUs consumer de gama media y alta.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. También es compatible con `vLLM` (si soporta el modelo base) y con `llama.cpp` si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador se basa en Qwen3.5-2B, pero no se conocen sus características específicas de rendimiento. Como referencia, otros adaptadores LoRA sobre modelos de 2B parámetros (por ejemplo, sobre Llama-3.2-3B o Qwen2.5-1.5B) suelen ofrecer mejoras en tareas concretas de dominio, pero sin datos de benchmarks no es posible comparar objetivamente.

## Limitaciones y advertencias

- La model card del autor está prácticamente vacía: no se especifican datos de entrenamiento, licencia, idiomas ni limitaciones. Esto impide evaluar la calidad y el uso permitido del adaptador.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se pueden identificar sesgos potenciales.
- Licencia no disponible: no se puede confirmar si el adaptador es de uso libre, comercial o restringido. Se debe contactar con el autor antes de usarlo en producción.
- Dependencia del modelo base: el rendimiento y las capacidades del adaptador están limitados por el modelo base Qwen3.5-2B. Si el modelo base tiene restricciones de licencia, estas podrían aplicarse también al adaptador.
- Sin soporte garantizado: al ser un proyecto con 0 descargas y 0 likes, no hay evidencia de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ranjitraut/dacpt-v2-qwen3.5
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B (no confirmado, pero se infiere del ID)
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de la familia Qwen3.5: https://qwen-ai.com/qwen-3-5/
- Technical Report de Qwen3 (predecesor): https://arxiv.org/html/2505.09388v1
