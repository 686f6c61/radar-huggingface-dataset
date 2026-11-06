# keras/mistral_small_3.1_24b_base_2503_en

## Resumen

Mistral Small 3.1 24B Base es un checkpoint multimodal de tipo decoder-only publicado por Mistral AI y empaquetado por el equipo de Keras para su uso con KerasHub. Combina un codificador de visión de estilo Pixtral con un decodificador de texto Mistral de 24.010 millones de parámetros y 40 capas, lo que permite que un único modelo acepte texto e imágenes como entrada y genere texto como salida. Se distribuye como checkpoint base, pensado para fine-tuning e investigación, no para uso conversacional directo.

El modelo emplea el tokenizador Tekken con un vocabulario de 131.000 tokens y soporta una ventana de contexto de 128.000 tokens, lo que lo sitúa en la gama alta de contexto entre modelos de su tamaño. Cubre decenas de idiomas, entre ellos inglés, francés, alemán, español, portugués, italiano, japonés, coreano, ruso, chino, árabe e hindi.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 de los pesos facilita el uso comercial y la experimentación sin restricciones de atribución complejas; por otro, la integración nativa en KerasHub permite cargar el modelo con una sola llamada y ejecutarlo sobre JAX, TensorFlow o PyTorch, lo que simplifica su adopción en pipelines ya basados en Keras. Al ser un checkpoint base, su utilidad principal es como punto de partida para ajuste fino supervisado o para investigación sobre arquitecturas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (decodificador Mistral de 40 capas + codificador de visión Pixtral) |
| Parametros totales | 24,01 mil millones (24.010 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (la model card solo menciona carga en bfloat16) |
| Idiomas soportados | Inglés, francés, alemán, español, portugués, italiano, japonés, coreano, ruso, chino, árabe, hindi y otras decenas |
| Licencia | Apache 2.0 (pesos); código Keras bajo Apache 2.0 |
| Formato de pesos | no disponible de forma explícita (repo de 48,9 GB, presumiblemente safetensors; la carga se hace vía KerasHub) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal estándar para la parte de texto, acoplado a un codificador de visión de estilo Pixtral que proyecta las representaciones visuales al espacio del decodificador. El decodificador consta de 40 capas con 24.010 millones de parámetros. El tokenizador Tekken, con 131.000 entradas de vocabulario, está optimizado para eficiencia multilingüe y para código. La ventana de contexto alcanza los 128.000 tokens, lo que permite procesar documentos largos o conversaciones extensas sin truncamiento agresivo.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en este checkpoint base. Se sabe que el modelo deriva de la familia Mistral Small 3.1 de Mistral AI y que la versión 3.2 introduce mejoras en seguimiento de instrucciones, reducción de repeticiones y una plantilla de function calling más robusta, pero esos cambios corresponden a los checkpoints instruct, no al base que nos ocupa. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto autoregresiva en modo base, sin ajuste instructivo: el modelo completa secuencias pero no sigue instrucciones de forma fiable sin fine-tuning.
- Procesamiento de imágenes: acepta una o varias imágenes mediante marcadores `[IMG]` en el prompt y genera texto condicionado a ellas (descripción, respuesta a preguntas visuales, etc.).
- Capacidad multilingüe amplia: cubre decenas de idiomas, incluidos español, francés, alemán, italiano, portugués, ruso, chino, árabe, hindi, japonés y coreano.
- Soporte de contexto largo: hasta 128.000 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Punto de partida para fine-tuning: al ser un checkpoint base, está pensado para ajuste supervisado, LoRA o investigación sobre arquitecturas multimodales.
- No se documenta soporte nativo de tool calling ni de agentes multi-paso en el checkpoint base; esas capacidades se atribuyen a los checkpoints instruct de la misma familia.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: el checkpoint base permite ajustar el modelo con datos propios (legal, médico, financiero) sin partir de cero, aprovechando sus 24.000 millones de parámetros y su contexto de 128.000 tokens para tareas de resumen y extracción sobre documentos largos.
- Investigación en modelos multimodales: sirve como base para estudiar la fusión entre el codificador Pixtral y el decodificador Mistral, experimentar con estrategias de alineación visión-texto o evaluar el impacto de distintas proyecciones visuales.
- Generación de descripciones de imágenes a escala: con el marcador `[IMG]` y el modo `generate()`, se puede procesar lotes de imágenes para producir pies de foto, etiquetas o descripciones estructuradas en un pipeline de datos.
- Construcción de asistentes conversacionales tras ajuste: una vez fine-tuneado con datos de diálogo, el modelo puede gestionar conversaciones multi-turno con contexto largo, útil para atención al cliente o asistentes internos.
- Procesamiento de documentos multilingües: su ventana de 128.000 tokens y su cobertura de idiomas permiten resumir o extraer información de contratos, informes o artículos en varios idiomas dentro de un mismo flujo.
- Base para experimentación con JAX, TensorFlow y PyTorch: al integrarse en KerasHub, permite comparar el mismo checkpoint en distintos backends sin reescribir el código de carga, lo que resulta útil en equipos que evalúan infraestructuras de inferencia.
- Generación de código y matemáticas tras ajuste: aunque el checkpoint base no está optimizado para ello, la familia Mistral Small 3.1 está diseñada para razonamiento matemático y programación, por lo que un fine-tuning específico puede explotar esas capacidades latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 48 GB solo para los pesos (24.010 M de parámetros × 2 bytes), más overhead de activaciones y caché KV, lo que sitúa el requisito práctico en torno a 55-60 GB para contextos moderados.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB) para inferencia en precisión completa. Para contextos de 128.000 tokens, la caché KV crece de forma significativa y puede requerir más memoria o técnicas de atención eficiente.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16; sería necesaria cuantización agresiva (4 bits) para intentar encajarlo, aunque la model card no documenta cuantizaciones oficiales.
- Opciones de despliegue: KerasHub (JAX, TensorFlow, PyTorch) es la vía documentada. No se confirma soporte oficial en vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Small 3.1 24B Base (este) | 24,01 B | 128k | Sí (Pixtral) | Apache 2.0 | KerasHub |
| Mistral Small 3.1 24B Instruct | 24,01 B | 128k | Sí (Pixtral) | Apache 2.0 | Hugging Face / KerasHub |
| Mistral Small 3.2 24B Instruct | 24,01 B | 128k | Sí (Pixtral) | Apache 2.0 | Hugging Face / KerasHub |
| Gemma 3 27B | 27 B | 128k | Sí | Gemma license | Hugging Face |

La comparación con Gemma 3 27B se ofrece como referencia de categoría (modelo multimodal de tamaño similar con contexto de 128k), pero no se dispone de datos de benchmarks en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Al ser un checkpoint base, no está ajustado para seguir instrucciones: su salida puede ser incoherente o divagante en tareas conversacionales sin fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje; el checkpoint base no incorpora salvaguardas de alineación.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de Mistral AI y de cualquier dato de entrenamiento subyacente.
- El tamaño del repo (48,9 GB) y los requisitos de VRAM (~48 GB en bfloat16) limitan su despliegue en hardware de consumo.
- No se documentan cuantizaciones oficiales ni soporte confirmado en frameworks de inferencia de alto rendimiento como vLLM o TGI.
- La model card no detalla la composición del dataset ni posibles limitaciones idiomáticas específicas más allá de la lista de idiomas soportados.

## Enlaces

- Hugging Face: https://huggingface.co/keras/mistral_small_3.1_24b_base_2503_en
- Model card de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Anuncio de Mistral Small 3.1: https://mistral.ai/news/mistral-small-3-1
- Guía de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guía de publicación de modelos en KerasHub: https://keras.io/guides/keras_hub/upload/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del código KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
