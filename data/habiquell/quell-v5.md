# Habiquell/quell-v5

## Resumen

quell-v5 es un ajuste fino por supervisión (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado en HuggingFace por el usuario Habiquell. Se trata de un modelo derivado de 4.000 millones de parámetros, distribuido en formato safetensors y pensado para su uso directo con la librería Transformers. El autor no documenta ni el conjunto de datos, ni el número de tokens de entrenamiento, ni la composición del corpus utilizado, más allá de indicar que el entrenamiento se realizó con TRL 0.24.0 mediante SFT.

El modelo base, Qwen3-4B-Instruct-2507, es un transformer denso de la familia Qwen3 en su variante "Instruct-2507", que desactiva el modo de razonamiento extendido (thinking mode) y prioriza respuestas directas con una ventana de contexto nativa muy amplia. quell-v5 hereda por tanto esa arquitectura y ese tokenizador, sin que la ficha del autor describa ninguna modificación estructural.

La relevancia de esta ficha es limitada pero conviene ser explícito: se trata de un modelo con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. Además, el repositorio ocupa 0,3 GB, una cifra muy inferior a los aproximadamente 8 GB que ocuparía un checkpoint completo de 4.000 millones de parámetros en bf16, lo que sugiere que podría contener solo una parte de los pesos o adaptadores, aunque esto no se confirma en la documentación disponible. Debe evaluarse, por tanto, como un experimento de ajuste fino y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de decodificación causal (heredada de Qwen/Qwen3-4B-Instruct-2507); no se documentan modificaciones en la ficha del autor |
| Parámetros totales | Aproximadamente 4.000 millones (heredados del modelo base; no confirmado explícitamente en la ficha) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens según la documentación pública del modelo base; no confirmado en la ficha de quell-v5 |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible en la ficha de quell-v5; el modelo base declara soporte multilingüe |
| Licencia | No disponible. La model card incluye el marcador de posición `licence: license` y HuggingFace no expone campo de licencia. El modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Framework de entrenamiento | TRL 0.24.0 (SFT), Transformers 4.57.1, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicación (metadatos) | 18 de septiembre de 2026, con última actualización el mismo día |

## Arquitectura y entrenamiento

quell-v5 no introduce cambios de arquitectura respecto a su modelo base: es un transformer denso de decodificación causal con atención por grupos de consultas (GQA) y tokenizador heredado de Qwen3. El proceso de ajuste se realizó con aprendizaje supervisado (SFT) sobre el pipeline de TRL, tal y como declara el autor, sin que se especifiquen ni el número de ejemplos, ni el número de épocas, ni la tasa de aprendizaje, ni si hubo una fase posterior de alineación mediante DPO, RLHF u otras técnicas. Tampoco se documenta el uso de LoRA, QLoRA o ajuste completo de parámetros.

En cuanto a innovaciones técnicas, la ficha no describe ninguna. Las capacidades diferenciales, si existen, provendrían del modelo base: la variante Instruct-2507 de Qwen3 está diseñada para responder sin cadena de razonamiento explícita y con una ventana de contexto nativa de 262.144 tokens. Hay que señalar una anomalía objetiva: el repositorio ocupa 0,3 GB, muy por debajo de lo esperable para un checkpoint completo de 4.000 millones de parámetros en bf16 (del orden de 8 GB). Esto podría indicar que se han subido únicamente pesos parciales, un adaptador o un subconjunto de tensores, pero la documentación no lo aclara y no puede confirmarse con la información disponible.

## Capacidades

Las siguientes capacidades se atribuyen por herencia del modelo base y por el tipo de entrenamiento declarado (SFT). No han sido verificadas de forma independiente para quell-v5 y deben validarse antes de cualquier uso real.

- Generación de texto conversacional: el ejemplo de la propia model card usa `pipeline("text-generation")` con mensajes en formato de rol (`user`), lo que confirma compatibilidad con plantillas de chat.
- Razonamiento y resolución de problemas en lenguaje natural, sin modo de pensamiento extendido (la variante 2507 es "non-thinking").
- Generación y explicación de código, capacidad típica de la familia Qwen3.
- Razonamiento matemático y aritmético básico, también heredado del modelo base.
- Procesamiento de contextos largos: hasta 262.144 tokens en el modelo base, útil para documentos extensos, siempre que la ventana no se haya visto recortada durante el ajuste (no documentado).
- Soporte multilingüe: el modelo base declara cobertura de más de un centenar de idiomas; la ficha de quell-v5 no especifica ninguno.
- Tool calling / function calling: el modelo base soporta llamada a herramientas mediante plantillas de chat de Qwen; no hay confirmación de que el ajuste fino haya preservado esta capacidad.
- Comportamiento como agente y razonamiento multi-paso: depende íntegramente de lo que el ajuste SFT haya conservado; no está documentado.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un modelo de 4.000 millones de parámetros, puede ejecutarse en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API. Adecuado para validar ideas antes de escalar a un modelo mayor.
- Asistente de documentación técnica interna: con una ventana de contexto amplia heredada del modelo base, puede ingerir manuales o ficheros de referencia extensos y responder preguntas sobre ellos en un pipeline de RAG.
- Generación de código en entornos de desarrollo local: integrable mediante Transformers en editores o scripts de automatización para autocompletar funciones, generar tests o traducir fragmentos entre lenguajes, siempre con revisión humana.
- Resumen y extracción de información de informes largos: suitable para preprocesar documentos de decenas de miles de tokens y extraer entidades, fechas o cláusulas en formato estructurado.
- Clasificación y etiquetado de textos a escala: al ser un modelo pequeño, el coste por inferencia es bajo y permite procesar lotes grandes en una sola GPU para tareas de moderación, categorización o enrutado de tickets.
- Base para nuevos experimentos de ajuste fino: su tamaño y su licencia de origen permisiva (la del modelo base) lo convierten en un punto de partida razonable para investigar técnicas de SFT con TRL, comparando con el checkpoint original.
- Chatbot de atención al cliente de bajo volumen: desplegable en Ollama o llama.cpp tras convertir los pesos a GGUF, siempre que se validen previamente la calidad y la ausencia de derivas respecto al modelo base.
- Evaluación comparativa de ajustes SFT: útil como caso de estudio metodológico para medir cuánto se degrada o mejora un modelo base tras un ajuste fino del que no se documenta el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de quell-v5 no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y el autor no aporta comparaciones con el modelo base ni con alternativas. Tampoco se han encontrado resultados en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, calculada a partir del tamaño de 4.000 millones de parámetros): en bf16/fp16, del orden de 8-10 GB incluyendo caché de claves y valores para contextos moderados; en int8, aproximadamente 4-5 GB; en cuantización de 4 bits, alrededor de 2,5-3,5 GB.
- GPU recomendadas para fp16: NVIDIA A100, H100, L40S, RTX A6000 o cualquier GPU con 16 GB o más de VRAM.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 (24 GB) sin dificultad en fp16, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se recurre a cuantización de 8 o 4 bits.
- Nota importante: el repositorio ocupa 0,3 GB, por lo que es posible que los pesos publicados no permitan cargar el modelo completo. Conviene verificar la integridad del checkpoint antes de planificar el despliegue.
- Opciones de despliegue: Transformers (soporte confirmado por el ejemplo de la model card), vLLM y TGI para servido con batching, y llama.cpp/Ollama para inferencia en CPU o GPU de gama baja, aunque en este último caso sería necesario convertir previamente los pesos a GGUF, conversión que el autor no proporciona.
- Latencia y throughput: no se han publicado mediciones. No hay datos de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo batching para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| Habiquell/quell-v5 | ~4.000 M (denso) | No confirmado en la ficha; el base declara 262.144 tokens | No declarada | HuggingFace, safetensors, 0 descargas | Ajuste SFT sin dataset ni evaluación documentados |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M (denso) | 262.144 tokens (documentación pública) | Apache 2.0 | HuggingFace, ampliamente distribuido | Modelo base de quell-v5; dispone de ficha técnica completa y benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | ~3.200 M (denso) | 128.000 tokens (documentación pública) | Licencia comunitaria de Llama 3.2 | HuggingFace, con requisitos de aceptación | Alternativa de tamaño similar, con restricciones de licencia para algunos usos |
| google/gemma-3-4b-it | ~4.000 M (denso) | 128.000 tokens (documentación pública) | Licencia de Gemma | HuggingFace, con aceptación de términos | Alternativa multimodal de tamaño comparable; licencia con condiciones de uso |

Los datos de contexto y licencia de los modelos comparados provienen de su documentación pública y deben verificarse en sus respectivas fichas antes de tomar decisiones de producción.

## Limitaciones y advertencias

- No se declara licencia en la ficha ni en los metadatos de HuggingFace. La model card usa el marcador de posición `licence: license`. Aunque el modelo base es Apache 2.0, la ausencia de una licencia explícita en el derivado impide asumir que se hereden los mismos términos; no se recomienda uso comercial sin aclaración previa con el autor.
- No hay información sobre el conjunto de datos de entrenamiento, por lo que no puede evaluarse la presencia de sesgos, la calidad del corpus ni la posible contaminación con datos de evaluación.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje y no mitigado de forma documentada en este ajuste, ya que no se describe ninguna fase de alineación con RLHF o DPO.
- No se han publicado evaluaciones, de modo que no puede cuantificarse la degradación respecto al modelo base. Un ajuste SFT sin validación documentada puede reducir capacidades como el tool calling o el razonamiento multi-paso.
- Contexto e idiomas: aunque el modelo base soporta 262.144 tokens y más de cien idiomas, no hay confirmación de que el ajuste haya preservado ninguna de las dos cosas.
- El tamaño del repositorio (0,3 GB) es incompatible con un checkpoint completo de 4.000 millones de parámetros en bf16. Existe un riesgo real de que los pesos publicados sean incompletos; se debe verificar antes de integrar el modelo en cualquier pipeline.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni informes de terceros.
- La fecha de publicación registrada en los metadatos (18 de septiembre de 2026) resulta anómala y conviene tratarla con cautela.
- Los resultados de la búsqueda web realizada no contenían ninguna fuente relevante sobre este modelo; los enlaces obtenidos correspondían a sitios de preguntas y respuestas sin relación con el proyecto.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Habiquell/quell-v5
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Búsqueda web realizada: sin resultados relevantes. Los enlaces devueltos (zhihu.com, zhidao.baidu.com) no guardan relación con el modelo y no se incluyen como fuentes.
