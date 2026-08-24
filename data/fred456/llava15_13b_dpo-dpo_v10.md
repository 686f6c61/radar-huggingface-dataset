# Fred456/llava15_13b_DPO-DPO_v10

## Resumen

El modelo `Fred456/llava15_13b_DPO-DPO_v10` es un adaptador de tipo PEFT (probablemente LoRA) sobre el modelo de visión-lenguaje LLaVA v1.5 13B, publicado por el usuario Fred456 en Hugging Face. El repositorio contiene únicamente los pesos del adaptador (1,1 GB), no el modelo completo, y está etiquetado con las librerías `peft` y `safetensors`. El nombre sugiere un entrenamiento con DPO (Direct Preference Optimization) aplicado al modelo base, aunque no se aportan detalles sobre el proceso ni los datos utilizados.

Este modelo se inscribe en la línea de ajuste fino de LLaVA para mejorar la alineación con preferencias humanas en tareas de diálogo visual, pero la información pública es extremadamente limitada: no se especifica licencia, idiomas, ni se proporcionan resultados de evaluación. Por tanto, cualquier uso en producción requiere verificar la procedencia y las condiciones de uso, así como realizar pruebas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA probable) sobre LLaVA v1.5 13B (Vicuna 13B + CLIP ViT-L/14) |
| Parametros totales | No disponible (el adaptador tiene ~1,1 GB, el modelo base tiene 13B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 4096 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización) |
| Idiomas soportados | No disponible (el modelo base LLaVA v1.5 está principalmente entrenado en inglés) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base LLaVA v1.5 13B combina un codificador visual CLIP ViT-L/14 con un modelo de lenguaje Vicuna 13B (derivado de LLaMA 2). El adaptador PEFT añade parámetros entrenables (probablemente LoRA) sobre las capas de atención y MLP del LLM para ajustar el comportamiento del modelo sin modificar los pesos originales. El nombre "DPO-DPO" sugiere un entrenamiento con Direct Preference Optimization, posiblemente en dos etapas, pero no se documentan los datos ni el procedimiento. La arquitectura exacta del adaptador (rango, alpha, capas objetivo) no está publicada.

## Capacidades

- Generación de diálogo visual: el modelo base LLaVA v1.5 13B puede responder preguntas sobre imágenes, describir contenido visual y mantener conversaciones multimodales.
- Razonamiento sobre imágenes: capacidad de responder a instrucciones que requieren comprensión de escenas, objetos, texto en imágenes, etc.
- Tool calling y agentes: no documentado para este adaptador; el modelo base no tiene soporte nativo de function calling.
- Multilingüismo: limitado al inglés en su mayoría, aunque puede producir texto en otros idiomas con menor calidad.
- No se ha documentado ninguna capacidad especial adicional (thinking mode, visión de alta resolución, audio, etc.) para este adaptador.

## Casos de uso

Dada la falta de información sobre el entrenamiento y las capacidades específicas del adaptador, los casos de uso se basan en las capacidades del modelo base LLaVA v1.5 13B, asumiendo que el ajuste con DPO mejora la alineación con preferencias humanas:

- Asistencia visual para personas con discapacidad: el modelo puede describir imágenes del entorno y responder preguntas sobre objetos, personas o escenas, facilitando la accesibilidad.
- Moderación de contenido visual: clasificar o describir imágenes para detectar contenido inapropiado o sensible, siempre que se valide su fiabilidad.
- Generación de subtítulos automáticos: crear descripciones textuales de imágenes para archivos, redes sociales o documentación.
- Asistente educativo multimodal: responder preguntas sobre diagramas, gráficos o ilustraciones en entornos de aprendizaje.
- Análisis de capturas de pantalla: extraer información de interfaces de usuario, gráficos de datos o imágenes técnicas.
- Chatbot de atención al cliente con soporte de imágenes: permitir que los usuarios envíen fotos de productos o problemas y recibir respuestas contextuales.

En todos los casos, se recomienda probar el adaptador sobre el modelo base antes de integrarlo en producción, ya que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación ni comparaciones con otros modelos. Se desconoce el impacto del ajuste DPO sobre el rendimiento en tareas estándar como MMMU, VQA, o captioning.

## Requisitos de hardware

- VRAM estimada: el adaptador añade una sobrecarga mínima sobre el modelo base de 13B. Para inferencia con el modelo completo en FP16 se necesitan aproximadamente 26-28 GB de VRAM. Con cuantización 4-bit (por ejemplo, bitsandbytes) se puede reducir a ~8-10 GB.
- GPU recomendadas: para el modelo completo en FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) es suficiente. Para cuantización 4-bit, una RTX 3090/4090 o similar.
- ¿Cabe en consumer GPU? Sí, con cuantización 4-bit en GPUs de 12-16 GB, aunque la calidad puede degradarse.
- Opciones de despliegue: el adaptador PEFT se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para inferencia en producción, se puede usar vLLM o TGI si se fusionan los pesos del adaptador con el modelo base. También se puede exportar a GGUF con herramientas como `llama.cpp` para ejecución en CPU o GPU.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Fred456/llava15_13b_DPO-DPO_v10 | LLaVA v1.5 13B | Adaptador (13B base) | No disponible | No disponible | Sin benchmarks publicados |
| liuhaotian/llava-v1.5-13b | LLaVA v1.5 13B | 13B | 4096 | LLaMA 2 license (Vicuna) | Modelo original, ampliamente evaluado |
| liuhaotian/llava-v1.6-vicuna-13b (LLaVA-NeXT) | LLaVA v1.6 | 13B | 4096 | LLaMA 2 license | Mejora en razonamiento visual y OCR |

La comparación directa no es posible sin datos de rendimiento del adaptador. El modelo base LLaVA v1.5 13B tiene resultados conocidos en VQA y captioning, pero el adaptador DPO podría alterarlos positiva o negativamente.

## Limitaciones y advertencias

- No hay información sobre la licencia del adaptador; no se puede garantizar su uso comercial sin consultar al autor.
- El repositorio no incluye documentación sobre el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación.
- El modelo base LLaVA v1.5 13B tiene sesgos conocidos derivados de los datos de entrenamiento (por ejemplo, estereotipos de género y raza en descripciones de personas).
- Riesgo de alucinación en descripciones de imágenes: puede generar detalles que no están presentes en la imagen.
- El adaptador no ha sido probado en tareas específicas; su rendimiento real es desconocido.
- La longitud de contexto está limitada a la del modelo base (probablemente 4096 tokens), lo que puede ser insuficiente para conversaciones muy largas o imágenes con mucho texto.
- No se proporcionan instrucciones de uso ni ejemplos de carga del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Fred456/llava15_13b_DPO-DPO_v10
- Modelo base LLaVA v1.5 13B: https://huggingface.co/liuhaotian/llava-v1.5-13b
- Paper de LLaVA (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Otras versiones del autor: https://huggingface.co/Fred456/llava15_13b_DPO-DPO_v9, https://huggingface.co/Fred456/llava15_7b_DPO-DPO_llava_13b_v6
