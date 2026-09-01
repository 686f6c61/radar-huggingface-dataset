# Sorihon/Mending-Hearts-12B

## Resumen

Mending-Hearts-12B es un modelo de lenguaje de 12 000 millones de parámetros creado mediante la fusión de tres modelos base utilizando el método DARE TIES, desarrollado por el usuario Sorihon. Se trata de un modelo de generación de texto conversacional, orientado a tareas de chat y diálogo, que combina las capacidades de Vortex5/Nether-Moon-12B, MarinaraSpaghetti/NemoMix-Unleashed-12B y djuna/MN-Chinofun-12B-4 como base. El modelo se distribuye en formato safetensors y está diseñado para su uso con la librería transformers.

La relevancia de este modelo radica en su naturaleza de fusión (merge), una técnica que permite combinar las fortalezas de varios modelos preentrenados sin necesidad de un entrenamiento adicional costoso. Aunque no se especifican detalles sobre la arquitectura interna, los tags indican que está basado en la familia Mistral, lo que sugiere un transformer decoder con atención causal. El tamaño de 12B parámetros lo sitúa en un rango medio, adecuado para despliegue en GPUs de consumo con cuantización. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican Mistral) |
| Parametros totales | 12 247 782 400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se ha construido mediante la técnica de fusión DARE TIES (Drop And REscale) descrita en el paper arXiv:2311.03099. Esta técnica combina los parámetros de varios modelos preentrenados, aplicando una poda (drop) y un reescalado para preservar las capacidades de cada modelo base. En este caso, se ha utilizado como modelo base djuna/MN-Chinofun-12B-4, y se han fusionado los modelos Vortex5/Nether-Moon-12B y MarinaraSpaghetti/NemoMix-Unleashed-12B con densidades y pesos específicos (0.6/0.4 y 0.4/0.7 respectivamente). El resultado es un modelo de 12B parámetros en bfloat16.

No se dispone de información sobre el entrenamiento original de los modelos base, como el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Al ser un merge, no hay un entrenamiento adicional propio; las capacidades del modelo derivan directamente de los modelos fusionados.

## Capacidades

No se han publicado detalles específicos sobre las capacidades del modelo en la información disponible. Sin embargo, por su naturaleza de modelo de lenguaje de generación de texto y su orientación conversacional (según los tags), se espera que pueda realizar tareas típicas de un LLM de tamaño medio, aunque no hay confirmación oficial. Las capacidades potenciales incluyen:

- Generación de texto coherente y contextualizado.
- Mantenimiento de conversaciones multi-turno (chat).
- Razonamiento básico y respuesta a preguntas.
- Posible soporte de tool calling o function calling, aunque no está confirmado.
- Capacidades multilingües, aunque no se especifican idiomas.

Dado que no hay benchmarks ni evaluaciones publicadas, estas capacidades son inferencias razonables basadas en el tipo de modelo y no deben considerarse garantizadas.

## Casos de uso

Aunque no hay documentación oficial sobre aplicaciones específicas, el modelo puede ser adecuado para los siguientes escenarios, basados en su tamaño y naturaleza conversacional:

- **Asistente virtual para atención al cliente**: el modelo puede gestionar conversaciones de soporte básico, respondiendo a preguntas frecuentes y derivando casos complejos a humanos. Su tamaño de 12B permite un despliegue en infraestructura moderada.
- **Generación de contenido creativo**: puede redactar historias, poemas o guiones, aprovechando su capacidad de generación de texto fluido. Es útil para prototipos de escritura asistida.
- **Chatbot para entornos educativos**: puede responder preguntas sobre temas generales y mantener diálogos interactivos para práctica de idiomas o tutoría básica.
- **Resumen de documentos**: puede generar resúmenes de textos largos, aunque se desconoce la longitud de contexto efectiva, por lo que se recomienda probar con documentos de tamaño moderado.
- **Generación de código simple**: si los modelos base incluyen capacidades de código, podría asistir en tareas de programación básica, aunque no está confirmado.
- **Prototipado rápido de aplicaciones de lenguaje**: al ser un modelo de 12B, es adecuado para pruebas de concepto en entornos con recursos limitados, antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en bfloat16 ocupa aproximadamente 24,5 GB (12B parámetros × 2 bytes). Para inferencia sin cuantización se necesitan al menos 24 GB de VRAM. Con cuantización de 8 bits se reduciría a ~12 GB, y con 4 bits a ~6 GB, aunque no se han publicado versiones cuantizadas.
- **GPU recomendadas**: para ejecución completa en bfloat16, se requiere una GPU con 24 GB o más, como NVIDIA RTX 3090/4090, A100 o H100. Con cuantización, podría caber en GPUs de 12 GB como RTX 3060 o RTX 4070.
- **Opciones de despliegue**: al ser un modelo de transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se convierta a los formatos adecuados (GGUF, etc.). No se han publicado conversiones oficiales.
- **Latencia y throughput**: no se dispone de datos medidos. En general, un modelo de 12B en una GPU moderna puede generar entre 20 y 50 tokens por segundo, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. No se conocen modelos comparables específicos en el momento de la redacción.

## Limitaciones y advertencias

- **Licencia no especificada**: el uso comercial del modelo es incierto, ya que no se indica ninguna licencia. Se recomienda contactar con el autor antes de utilizarlo en producción.
- **Sesgos potenciales**: al ser una fusión de modelos preentrenados, puede heredar sesgos presentes en los datos de entrenamiento de los modelos base, aunque no se han documentado.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados.
- **Contexto limitado desconocido**: no se especifica la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas.
- **Idiomas no confirmados**: no se indica qué idiomas soporta, por lo que su rendimiento en español u otros idiomas no está garantizado.
- **Falta de evaluación**: sin benchmarks ni pruebas independientes, no se puede verificar su calidad en tareas concretas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sorihon/Mending-Hearts-12B)
- [Paper DARE TIES (arXiv:2311.03099)](https://arxiv.org/abs/2311.03099)
- [Modelo base: djuna/MN-Chinofun-12B-4](https://huggingface.co/djuna/MN-Chinofun-12B-4)
- [Modelo base: Vortex5/Nether-Moon-12B](https://huggingface.co/Vortex5/Nether-Moon-12B)
- [Modelo base: MarinaraSpaghetti/NemoMix-Unleashed-12B](https://huggingface.co/MarinaraSpaghetti/NemoMix-Unleashed-12B)
