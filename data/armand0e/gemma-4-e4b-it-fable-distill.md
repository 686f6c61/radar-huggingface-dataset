# armand0e/Gemma-4-E4B-it-Fable-Distill

## Resumen

El modelo `armand0e/Gemma-4-E4B-it-Fable-Distill` es un ajuste fino (fine-tune) del modelo base `unsloth/gemma-4-E4B-it`, que a su vez deriva de la familia Gemma 4 desarrollada por Google DeepMind. El autor, `armand0e`, ha aplicado técnicas de entrenamiento acelerado con Unsloth y la librería TRL de Hugging Face, orientando el modelo hacia tareas de conversación y generación de texto. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo hace atractivo para proyectos de código abierto.

Gemma 4 E4B es un modelo multimodal (imagen y texto) con aproximadamente 4.4 mil millones de parámetros activos, aunque los pesos totales del repositorio suman 7.996.156.490 (cerca de 8 mil millones), lo que sugiere una arquitectura con parámetros compartidos o MoE. Este modelo base soporta entrada de imágenes y texto, y según la documentación de Gemma 4, incluye un contexto de hasta 256K tokens y capacidades de razonamiento. El fine-tune aquí presentado no modifica la arquitectura, pero sí ajusta los pesos para un comportamiento conversacional más específico, aunque no se proporcionan detalles sobre el conjunto de datos de entrenamiento ni la metodología exacta.

La relevancia de este modelo radica en que ofrece una alternativa ligera y abierta para aplicaciones multimodales en local, con licencia permisiva y compatibilidad con herramientas como Transformers y TGI. Sin embargo, al ser un fine-tune reciente sin métricas publicadas ni comunidad activa (0 descargas, 0 likes), su rendimiento real debe evaluarse de manera independiente antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma 4) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | No disponible (posible MoE, sin confirmar) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 256K, no confirmado en este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/gemma-4-E4B-it` es un transformer multimodal que acepta tanto imágenes como texto como entrada. Gemma 4 ofrece arquitecturas densas y Mixture-of-Experts (MoE); el sufijo E4B sugiere que se trata de una variante con aproximadamente 4 mil millones de parámetros activos, aunque el total del repositorio es de 8 mil millones, lo que podría indicar un MoE con dos expertos activos o un diseño con parámetros compartidos. La documentación oficial de Gemma 4 indica que estos modelos se entrenan con un enfoque de seguridad riguroso y soportan tareas de razonamiento, generación de código y matemáticas, además de procesamiento de imágenes.

El fine-tune se realizó con Unsloth, una librería que acelera el entrenamiento y reduce el consumo de memoria, y con TRL (Transformers Reinforcement Learning) de Hugging Face, lo que sugiere el uso de técnicas de ajuste fino supervisado o aprendizaje por refuerzo. No se especifica el conjunto de datos utilizado ni la duración del entrenamiento. La card indica que fue entrenado "2x faster" con Unsloth, pero no se detalla si se empleó RLHF, DPO o simplemente SFT. No se han publicado detalles sobre la composición del dataset ni sobre el proceso de alineación.

## Capacidades

- **Multimodal**: procesa imágenes y texto, permitiendo entrada de imágenes junto con prompts de texto para tareas de descripción, análisis visual o diálogo.
- **Generación de texto conversacional**: el fine-tune está orientado a diálogo, por lo que puede mantener conversaciones multi-turno.
- **Razonamiento y codificación**: heredado del modelo base, es capaz de resolver problemas lógicos y generar código en diversos lenguajes, aunque no se especifica el rendimiento exacto en estos ámbitos.
- **Soporte de tool calling**: no se confirma explícitamente en la documentación, pero Gemma 4 incluye esta capacidad en su versión base; la presencia en este fine-tune no está verificada.
- **Multilingüe**: aunque la card indica solo "en", el modelo base de Gemma 4 soporta más de 140 idiomas. Este fine-tune no especifica si mantiene esa cobertura o se ha limitado al inglés.
- **Thinking mode**: según la documentación de Gemma 4 E4B, el modelo base incluye un modo de razonamiento explícito (Thinking Mode), pero no se indica si el fine-tune lo conserva.

## Casos de uso

- **Asistente virtual multimodal**: el modelo puede integrarse en aplicaciones de asistencia que requieran entender imágenes y responder en texto, por ejemplo, para describir fotos, analizar diagramas o ayudar a personas con discapacidad visual.
- **Generación de contenido educativo**: dado su contexto largo (potencialmente hasta 256K tokens), puede procesar documentos extensos o libros junto con imágenes para crear explicaciones personalizadas o resúmenes.
- **Automatización de soporte técnico**: con capacidad de razonamiento y codificación, puede responder consultas sobre APIs, depurar código o explicar errores a partir de capturas de pantalla.
- **Extracción de información de documentos**: al combinar visión y texto, puede leer facturas, contratos o formularios escaneados y extraer datos estructurados.
- **Desarrollo de agentes conversacionales**: gracias a su naturaleza multimodal y su licencia Apache-2.0, es adecuado como base para chatbots en aplicaciones de código abierto, con posibilidad de ajuste adicional.
- **Prototipado rápido de aplicaciones de IA**: su tamaño relativamente pequeño (8B totales, 4.4B activos) permite probar ideas en GPU consumer sin inversión en hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas del fine-tune. La documentación del modelo base Gemma 4 indica que supera a modelos anteriores en tareas de razonamiento y codificación, pero no se proporcionan cifras concretas para esta variante ajustada.

## Requisitos de hardware

- **VRAM estimada**: según la documentación de Gemma 4 E4B, se recomienda un mínimo de 8 GB de VRAM para inferencia con cuantización, y 12 GB para cargar el modelo en FP16.
- **GPU recomendadas**: RTX 3060 12GB, RTX 4070, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM. Para el fine-tune, no se especifican requisitos adicionales.
- **Compatibilidad con consumer GPU**: sí, puede ejecutarse en GPUs de gama media y alta, aunque la latencia dependerá de la memoria y del uso de cuantización.
- **Opciones de despliegue**: compatible con Transformers (pipeline de Hugging Face), Text Generation Inference (TGI) y posiblemente llama.cpp u Ollama si se exporta a GGUF, aunque no se incluyen archivos GGUF en el repositorio.
- **Latencia y throughput**: no se proporcionan datos. En una RTX 4090 con cuantización 4-bit, se espera una velocidad de generación de aproximadamente 30-50 tokens/s, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información comparativa específica para este modelo. Se puede comparar con su modelo base, `unsloth/gemma-4-E4B-it`, que es el mismo modelo sin el fine-tune, y con otros modelos de tamaño similar como Llama 3.2 8B o Mistral 7B, pero no hay datos de rendimiento para el fine-tune. La única diferencia conocida es el ajuste conversacional, que no se ha evaluado públicamente. La comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos**: al ser un modelo entrenado por Google, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en cuestiones de género, raza o cultura. El fine-tune adicional no mitiga estos sesgos.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento o con imágenes ambiguas.
- **Limitaciones de idioma**: la card indica solo "en", lo que sugiere que el fine-tune puede haber reducido la cobertura multilingüe del modelo base. Uso en otros idiomas no está garantizado.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero no se ha verificado si el modelo base tiene atribuciones adicionales; se debe revisar la licencia del modelo original.
- **Falta de documentación**: no hay información sobre el conjunto de datos de entrenamiento, los hiperparámetros, ni evaluaciones de seguridad. Su uso en producción requiere validación exhaustiva.
- **Contexto y ventana**: aunque el modelo base soporta 256K tokens, no se confirma que el fine-tune conserve esta capacidad. Es posible que la ventana se haya reducido durante el ajuste.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill)
- [Modelo base unsloth/gemma-4-E4B-it](https://huggingface.co/unsloth/gemma-4-E4B-it)
- [Documentación de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Modelo oficial google/gemma-4-E4B](https://huggingface.co/google/gemma-4-E4B)
- [Gemma 4 model card en Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Página específica de Gemma 4 E4B](https://gemma4.dev/models/gemma-4-e4b)
