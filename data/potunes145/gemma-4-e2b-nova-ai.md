# Potunes145/gemma-4-e2b-nova-ai

## Resumen

El modelo `Potunes145/gemma-4-e2b-nova-ai` es un fine-tune del modelo `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del modelo oficial `google/gemma-4-E2B` de Google DeepMind. El autor, Potunes145, ha entrenado este modelo mediante fine-tuning supervisado (SFT) utilizando la librería TRL de HuggingFace y la herramienta Unsloth, orientada a optimizar el entrenamiento de modelos sobre hardware limitado.

Gemma 4 E2B es el modelo más pequeño de la familia Gemma 4, con 2.100 millones de parámetros, una ventana de contexto de 8.000 tokens y capacidad exclusivamente textual. Está diseñado para ejecutarse en dispositivos con recursos muy limitados, como teléfonos móviles, sistemas embebidos o CPUs sin GPU. El fine-tune de Potunes145 parte de una versión ya cuantizada en 4 bits, lo que reduce aún más el tamaño del modelo y facilita su despliegue en entornos de baja capacidad.

El repositorio tiene un tamaño de 0,2 GB, lo que sugiere que el fine-tune se ha realizado mediante adaptadores LoRA (Low-Rank Adaptation) en lugar de modificar todos los pesos del modelo. Esto permite aplicar el fine-tune sobre el modelo base sin necesidad de almacenar una copia completa de los parámetros. El modelo se publica con la librería `transformers` y es compatible con `endpoints_compatible`, lo que facilita su integración en infraestructuras de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) |
| Parametros totales | 2.100 millones (2,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | 4 bits (base: bnb-4bit); no se especifican otras |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero el fine-tune no lo declara) |
| Licencia | no disponible (el README indica "licence: license" sin especificar; el modelo base Gemma 4 usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA probable) |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 E2B, es un transformer denso de 2.100 millones de parámetros, diseñado por Google DeepMind para tareas de generacion de texto y razonamiento en entornos con recursos limitados. Su arquitectura es similar a la de otros modelos Gemma, con atencion por ventanas de 8.000 tokens y un vocabulario amplio. El modelo oficial se distribuye bajo licencia Apache 2.0 y se entrena con un enfoque de alineacion que combina instrucciones supervisadas y preferencias humanas.

El fine-tune de Potunes145 se ha realizado mediante SFT (Supervised Fine-Tuning) sobre la version cuantizada en 4 bits de Unsloth. El entrenamiento se llevo a cabo con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.10.0+cu128 y Datasets 4.3.0. El tamaño del repositorio (0,2 GB) indica que se trata de un adaptador LoRA, que solo almacena los gradientes de las matrices de bajo rango y no los pesos completos del modelo. No se especifica el dataset utilizado ni el numero de pasos de entrenamiento.

## Capacidades

- Generacion de texto: el modelo es capaz de producir respuestas coherentes a partir de instrucciones en lenguaje natural, como se muestra en el ejemplo de la model card.
- Razonamiento basico: al heredar las capacidades de Gemma 4 E2B, puede resolver tareas sencillas de logica y comprension lectora.
- Soporte de tool calling: no disponible (no se menciona en la documentacion del modelo).
- Soporte de agentes: no disponible (no se menciona).
- Capacidades multilingues: no disponibles (el modelo base soporta varios idiomas, pero el fine-tune no los declara).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio. Es exclusivamente textual.

## Casos de uso

- Asistentes conversacionales en dispositivos moviles: el modelo, con solo 2,1B parametros y cuantizado en 4 bits, puede ejecutarse en un smartphone o tablet, ofreciendo respuestas a preguntas frecuentes sin necesidad de conexion a internet.
- Chatbots de atencion al cliente en entornos con hardware modesto: empresas con servidores de baja potencia pueden desplegar este modelo para gestionar consultas simples de usuarios, aprovechando su ventana de contexto de 8.000 tokens para mantener conversaciones multi-turno breves.
- Generacion de texto en aplicaciones de escritorio: integrable en herramientas de productividad (redaccion de correos, resumen de notas) mediante la libreria `transformers` y el pipeline de generacion de texto.
- Prototipado rapido de aplicaciones de IA: al ser un adaptador LoRA, se puede combinar con el modelo base de Unsloth para experimentar con fine-tunes especificos sin necesidad de recursos de entrenamiento elevados.
- Inferencia en CPU: gracias a su tamano reducido y cuantizacion, puede ejecutarse en CPUs convencionales sin GPU, lo que lo hace util para entornos educativos o de desarrollo donde no se dispone de aceleradores.
- Sistemas embebidos y edge computing: el modelo cabe en dispositivos con poca memoria (menos de 1 GB de RAM), permitiendo tareas de clasificacion o generacion de texto en tiempo real en hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda realizar pruebas propias antes de usar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 4 bits, el modelo base ocupa aproximadamente 1,2 GB en memoria (2,1B parametros × 0,5 bytes por parametro en 4 bits). El adaptador anade unos pocos cientos de MB. Total estimado: entre 1,5 y 2 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. Tambien puede ejecutarse en CPU con 8 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: compatible con `transformers` (pipeline de generacion), y por extension con vLLM, llama.cpp, Ollama o TGI, siempre que se cargue el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles. En CPU se espera una generacion de unos pocos tokens por segundo; en GPU moderna, decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Potunes145/gemma-4-e2b-nova-ai | 2,1B | 8K | no disponible | safetensors (LoRA) | Fine-tune de Gemma 4 E2B |
| google/gemma-4-E2B | 2,1B | 8K | Apache 2.0 | safetensors | Modelo base oficial |
| unsloth/gemma-4-e2b-it-unsloth-bnb-4bit | 2,1B | 8K | Apache 2.0 | safetensors (bnb-4bit) | Version cuantizada de Unsloth |
| Microsoft Phi-3-mini | 3,8B | 4K | MIT | safetensors | Alternativa de tamano similar, pero mayor contexto limitado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Gemma 4 puede heredar sesgos de los datos de entrenamiento; el fine-tune no los corrige ni los documenta.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 8.000 tokens es reducida para tareas que requieren documentos largos o historiales extensos.
- Limitaciones de idioma: no se especifican los idiomas soportados por el fine-tune; se asume que hereda los del modelo base, pero sin confirmacion.
- Restricciones de licencia: la licencia del modelo no esta declarada en el repositorio. Aunque el modelo base es Apache 2.0, el autor no indica si el fine-tune mantiene esa licencia. Se recomienda contactar con el autor antes de un uso comercial.
- Caveat de produccion: al ser un adaptador LoRA entrenado sobre una version cuantizada, puede presentar una degradacion de calidad frente al modelo original. No se han publicado evaluaciones de robustez ni de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Potunes145/gemma-4-e2b-nova-ai
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit
- Modelo oficial Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Articulo sobre benchmarks de Gemma 4: https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/
