# ibuki95/jus-a7d83ebf

## Resumen

El modelo `ibuki95/jus-a7d83ebf` es un checkpoint de generación de texto con capacidades multimodales (imagen y texto) desarrollado por el usuario ibuki95. Según las etiquetas asociadas, se basa en la arquitectura Qwen3.5 MoE y es un fine-tuning o merge del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. El nombre "affine-h1-merged-salvage" sugiere que se trata de una fusión de pesos o un rescate de un checkpoint intermedio.

Con aproximadamente 35 107 millones de parámetros totales, el modelo está diseñado para tareas de conversación y generación de texto, con entrada potencialmente multimodal (imagen-texto). El repositorio ocupa 70,2 GB y los pesos están en formato safetensors. El acceso es restringido (gated), por lo que los usuarios deben aceptar condiciones adicionales en HuggingFace antes de descargarlo.

La relevancia actual de este modelo radica en su posible integración en sistemas conversacionales y aplicaciones que requieran comprensión de imágenes, aunque la información pública disponible es muy limitada y no permite una evaluación técnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tag) |
| Parametros totales | 35 107 181 936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas es `qwen3_5_moe`, lo que indica que se trata de un modelo de mezcla de expertos (MoE) perteneciente a la familia Qwen 3.5. Sin embargo, no se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento ni el tamaño de los parámetros activos. El modelo también presenta la etiqueta `image-text-to-text`, lo que sugiere que acepta entradas de imagen y texto, probablemente mediante un codificador visual integrado.

El modelo es un fine-tuning o un merge del checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, según se indica en las etiquetas `base_model`. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la arquitectura MoE y la multimodalidad.

## Capacidades

- Generación de texto y conversación: el pipeline es `text-generation`, por lo que el modelo puede producir respuestas coherentes en diálogos.
- Entrada multimodal: la etiqueta `image-text-to-text` indica que puede procesar imágenes junto con texto, aunque no se especifican los formatos de imagen admitidos ni el detalle de la comprensión visual.
- Uso conversacional: la etiqueta `conversational` sugiere que está optimizado para interacciones de chat multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia estándar (por ejemplo, HuggingFace Inference Endpoints).
- No se dispone de información sobre tool calling, razonamiento multi-paso, ni capacidades específicas de código o matemáticas.

## Casos de uso

- Asistentes virtuales con entrada de imágenes: el modelo puede recibir una fotografía o captura y responder preguntas sobre su contenido, útil en atención al cliente o soporte técnico visual.
- Chatbots conversacionales: gracias a su naturaleza conversacional y a los 35 B de parámetros, puede mantener diálogos extensos con contexto, aunque la ventana de contexto no está documentada.
- Análisis de documentos con imágenes: en entornos empresariales, podría procesar facturas, diagramas o capturas de pantalla y generar resúmenes o respuestas basadas en el contenido visual y textual.
- Generación de descripciones de productos: dado que acepta imágenes, puede generar textos descriptivos a partir de fotografías de artículos en comercio electrónico.
- Moderación de contenido visual: podría analizar imágenes y texto asociado para detectar contenido inapropiado o clasificarlo según políticas.
- Prototipado de investigación: al ser un modelo MoE de gran tamaño, puede servir como base para experimentos académicos en razonamiento multimodal o eficiencia de inferencia, aunque la licencia no está definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: con 35 107 millones de parámetros, en precisión FP16 los pesos ocupan aproximadamente 70 GB (coincidiendo con el tamaño del repositorio). Se necesitan al menos 80 GB de VRAM para inferencia sin cuantización (por ejemplo, una A100 80GB o H100).
- Con cuantización INT8, la VRAM requerida bajaría a unos 35-40 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB no sería suficiente, pero sí una A6000 de 48 GB o una A100 de 40 GB).
- Con cuantización INT4, el modelo podría caber en GPUs de 24 GB, aunque no se ha confirmado compatibilidad con formatos GGUF o AWQ.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI) o HuggingFace Inference Endpoints. No se ha confirmado soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Se estima que un modelo MoE de 35 B con activaciones parciales podría ofrecer un throughput razonable en hardware de alta gama, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo se basa en Qwen3.5 MoE, pero no se conocen sus parámetros activos ni su rendimiento. Alternativas de tamaño similar (35 B) en el ecosistema open source incluyen Mixtral 8x7B (46,7 B totales, 12,9 B activos) o Qwen2.5-32B, pero sin datos de este checkpoint no es posible establecer comparaciones objetivas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones adicionales en HuggingFace, lo que puede limitar su uso en entornos corporativos o de investigación.
- Licencia no especificada: no se indica si es de uso comercial, lo que genera incertidumbre legal para su explotación en producción.
- Información técnica incompleta: se desconocen la longitud de contexto, los parámetros activos, los idiomas soportados y los detalles de entrenamiento, lo que dificulta una evaluación rigurosa.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas factualmente incorrectas, especialmente en dominios especializados.
- Sesgos potenciales: al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o idioma.
- Requisitos de hardware elevados: la inferencia en FP16 necesita al menos 80 GB de VRAM, lo que excluye la mayoría de GPUs de consumo.
- Sin garantías de calidad multimodal: aunque la etiqueta indica image-text-to-text, no hay evidencia pública de la calidad de la comprensión visual.

## Enlaces

- HuggingFace: https://huggingface.co/ibuki95/jus-a7d83ebf
