# mradermacher/Scalpel-VL-1.7B-GGUF

## Resumen

Scalpel-VL-1.7B-GGUF es una cuantización en formato GGUF del modelo Scalpel-VL-1.8B, desarrollado por freeai-org y convertido por mradermacher. Se trata de un modelo multimodal de visión y lenguaje basado en la arquitectura Qwen3-VL, que ha sido sometido a poda estructurada (structured pruning) y destilación de conocimiento (knowledge distillation) desde un modelo de mayor tamaño, seguido de un ajuste fino con LoRA. El resultado es un modelo compacto de aproximadamente 1,37 mil millones de parámetros, diseñado para tareas de comprensión de imágenes y texto, con soporte para inglés y chino.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en hardware modesto, como GPUs de consumo o incluso CPU, manteniendo capacidades multimodales. Al estar disponible en múltiples cuantizaciones GGUF, desde Q2_K hasta f16, ofrece flexibilidad para desplegarse en entornos con restricciones de memoria. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, detalles especificos no disponibles) |
| Parametros totales | 1.368.222.976 (1,37B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base Scalpel-VL-1.8B se construye sobre la arquitectura Qwen3-VL, un transformer multimodal que procesa tanto imágenes como texto. Según las etiquetas del repositorio, se aplicaron técnicas de poda estructurada y destilación de conocimiento para reducir el tamaño del modelo original, seguido de un ajuste fino con LoRA. El dataset utilizado para el entrenamiento se denomina ScalpelBench, aunque no se proporcionan detalles sobre el número de tokens, la composición exacta del corpus ni si se emplearon métodos de alineación como RLHF o DPO. La información disponible no especifica innovaciones técnicas adicionales más allá de las mencionadas.

## Capacidades

- Comprensión multimodal: procesa imágenes y texto simultáneamente, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de texto: capacidad de producir respuestas coherentes en inglés y chino, heredada de la familia Qwen3-VL.
- Razonamiento visual: al estar basado en Qwen3-VL, se espera que pueda realizar tareas de razonamiento sobre imágenes, aunque no se han publicado benchmarks específicos que lo confirmen.
- Soporte de tool calling: no confirmado en la documentación disponible; se desconoce si el modelo base incluye esta funcionalidad.
- Capacidades de agente: no disponible; no hay información sobre soporte para multi-step reasoning o uso de herramientas.
- Multilingüismo: limitado a inglés y chino, según la model card.

## Casos de uso

- Descripcion de imagenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales de fotografias para personas con discapacidad visual, ejecutandose localmente en dispositivos con recursos limitados gracias a su tamano reducido y a las cuantizaciones ligeras como Q4_K_S.
- Asistentes de documentacion visual: integracion en herramientas que analizan capturas de pantalla o diagramas para extraer informacion relevante, util en soporte tecnico o documentacion de software.
- Chatbots con entrada de imagenes: despliegue en sistemas de atencion al cliente donde el usuario envia una foto del problema (por ejemplo, un producto danado) y el modelo genera una respuesta contextualizada en ingles o chino.
- Analisis de documentos escaneados: combinado con OCR, el modelo puede interpretar el contenido de facturas, formularios o tarjetas de visita, aunque su tamano limita la precision en tareas complejas.
- Educacion interactiva: uso en aplicaciones educativas que permiten a los estudiantes fotografiar un problema de matematicas o un objeto y recibir explicaciones, aprovechando la capacidad de razonamiento visual basico.
- Prototipado rapido de aplicaciones multimodales: gracias a su licencia Apache 2.0 y a su facil despliegue con llama.cpp u Ollama, es adecuado para validar conceptos de productos que requieren comprension de imagenes sin invertir en hardware de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varian entre 0,7 GB (Q2_K) y 2,8 GB (f16). Para la cuantizacion recomendada Q4_K_M (1,0 GB), se necesita al menos 2 GB de VRAM si se usa GPU, o unos 4 GB de RAM para ejecucion en CPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso integradas modernas. Para las cuantizaciones mas altas (Q8_0, f16) se recomienda al menos 6 GB de VRAM.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de gama baja y media, asi como en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien se puede usar transformers con el modelo base en safetensors si se prefiere.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. En una GPU moderna, se espera una generacion de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (modelos multimodales pequenos). El unico punto de referencia directo es el modelo base Scalpel-VL-1.8B, del cual esta cuantizacion es una version comprimida. Otras alternativas como LLaVA-1.5-7B o MiniGPT-4 tienen parametros y arquitecturas diferentes, y no se han encontrado datos comparativos en la informacion proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Al ser una cuantizacion, se produce una perdida de precision respecto al modelo original en f16, especialmente en las cuantizaciones mas agresivas como Q2_K o Q3_K. Se recomienda usar Q4_K_M o superior para tareas criticas.
- El modelo es pequeno (1,37B parametros), por lo que su capacidad de razonamiento complejo, comprension de contextos largos y manejo de tareas visuales avanzadas es limitada en comparacion con modelos de mayor tamano.
- No se han publicado evaluaciones de sesgos o alucinaciones; se desconoce su comportamiento en escenarios delicados.
- La longitud de contexto no esta documentada, lo que impide conocer los limites de memoria textual o visual que puede manejar.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el modelo base (freeai-org/Scalpel-VL-1.8B) tambien cumpla con los requisitos de atribucion si se redistribuye.
- El soporte de idiomas se limita a ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Scalpel-VL-1.7B-GGUF
- Modelo base: https://huggingface.co/freeai-org/Scalpel-VL-1.8B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Version anterior (1.6B): https://huggingface.co/mradermacher/Scalpel-VL-1.6B-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
