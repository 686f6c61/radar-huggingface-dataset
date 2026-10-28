# Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-44-v2

## Resumen

Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-44-v2 es un ajuste fino supervisado (SFT) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario Ali-Mhrez en HuggingFace. Se trata de un derivado de la familia Qwen3 en su variante instruct de 4B parámetros, entrenado con TRL 0.24.0 y la librería Unsloth, y distribuido en formato safetensors compatible con transformers. El nombre del repositorio sugiere un entrenamiento orientado a "function calling" unificado y a una longitud de secuencia de 2048 tokens, aunque la model card no documenta ni el dataset ni la configuración de entrenamiento.

El interés de esta ficha es limitado pero ilustrativo: muestra el flujo habitual de la comunidad para especializar modelos pequeños de la familia Qwen3 mediante SFT con Unsloth, y sirve como ejemplo de por qué conviene auditar los repositorios derivados antes de usarlos. El modelo base Qwen3-4B-Instruct-2507 es un transformer denso con unos 4.000 millones de parámetros y 262.144 tokens de contexto nativo, lo que le confiere capacidades razonables de razonamiento, código y multilingüismo.

No obstante, el repositorio presenta señales claras de falta de madurez: cero descargas y cero "likes" en el momento de la consulta, ausencia de licencia declarada, ausencia de idiomas declarados, ausencia de resultados de evaluación y un tamano de repo de 0,2 GB que es inconsistente con unos pesos completos en bf16 de un modelo de 4B (aproximadamente 8 GB). Por tanto, debe tratarse como un experimento personal no validado, no como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredado de Qwen3-4B-Instruct-2507 (no detallado en la model card del fine-tune) |
| Parámetros totales | ~4.000 millones según el modelo base Qwen3-4B-Instruct-2507; no confirmado de forma explícita en la model card del fine-tune |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; el identificador del fine-tune incluye "2048", presumiblemente la longitud máxima de secuencia usada en el SFT (no confirmado) |
| Tipos de cuantización | No disponible en el repositorio (solo se publican pesos safetensors); al derivar de Qwen3-4B es cuantificable a GGUF, AWQ o GPTQ con herramientas estándar, sin artefactos publicados por el autor |
| Idiomas soportados | No disponible para el fine-tune; el modelo base Qwen3 declara soporte multilingüe (119 idiomas según Qwen) |
| Licencia | No disponible (la model card incluye el literal "licence: license" como marcador de posición); el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura del fine-tune es la del modelo base: un transformer decoder-only denso de la familia Qwen3, con atención estándar (no híbrida ni SSM) y sin mezcla de expertos. La model card no aporta detalles adicionales sobre configuración de capas, cabezas, vocabulario, uso de YaRN para extensión de contexto ni sobre el tokenizer. Tampoco documenta si se aplicaron variantes de atención lineal o decodificación especulativa.

El entrenamiento se realizó mediante SFT con TRL 0.24.0, sobre el stack Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.23.1, con Unsloth como framework de aceleración (según los tags del repositorio). No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO posteriores, ni hiperparámetros como tasa de aprendizaje, epochs o precisión. El sufijo "UnifiedFC" del nombre apunta a un corpus de function calling unificado y "2048" a la ventana de entrenamiento, pero son inferencias a partir del nombre, no datos confirmados. Tampoco se publican curvas de entrenamiento, logs de TensorBoard accesibles ni métricas de validación, pese a que el repositorio está etiquetado con "tensorboard".

## Capacidades

- Generación de texto conversacional multi-turno, con el formato de chat de Qwen3 (roles `user`, `assistant`, `system`), tal como muestra el ejemplo de `pipeline` de la model card.
- Razonamiento y matemáticas básicas, heredados de la variante instruct del modelo base; sin evaluación específica publicada para este fine-tune.
- Generación de código y comprensión de lenguajes de programación, capacidad atribuible al modelo base y no verificada en el derivado.
- Posible soporte de tool calling / function calling, sugerido por el sufijo "UnifiedFC" del nombre del repositorio; no hay ejemplos, esquemas ni pruebas que lo confirmen.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para el fine-tune; heredables del modelo base Qwen3.
- Modo "thinking": no documentado en esta variante (la familia Qwen3-2507 separa explícitamente las variantes Instruct y Thinking; este derivado parte de la variante Instruct, por lo que no se espera un modo de razonamiento extendido activable).
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Experimentación con SFT sobre Qwen3-4B: el repositorio sirve como referencia de un pipeline completo Unsloth + TRL para especializar un modelo de 4B en una tarea concreta, útil para equipos que quieran replicar el flujo en su propio dominio.
- Prueba de concepto de function calling: si el sufijo "UnifiedFC" se corresponde con el corpus esperado, podría evaluarse en la generación de llamadas a herramientas en formato JSON, siempre con un conjunto de validación propio antes de cualquier uso real.
- Generación de texto asistida en local: con unos 4B parámetros, es desplegable en una GPU de consumo y puede emplearse para resumen, reescritura o clasificación de texto en entornos con requisitos de privacidad.
- Chatbot interno de bajo coste: el modelo base maneja conversaciones multi-turno y contexto largo; el fine-tune podría emplearse como sustituto en prototipos donde no se requiera una calidad contrastada.
- Evaluación comparativa de fine-tunes comunitarios: útil en un banco de pruebas interno para medir la degradación que introduce un SFT no documentado frente al modelo base.
- Docencia y formación: ejemplo práctico de buenas y malas prácticas en la publicación de modelos (licencia ausente, dataset no descrito, sin evaluaciones) para talleres de MLOps y gobernanza de modelos.
- Filtrado y etiquetado por lotes: tareas de clasificación o extracción de entidades sobre grandes volúmenes de texto, con la ventaja de un modelo pequeño y cuantificable a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del fine-tune no incluye MMLU, HumanEval, GSM8K, IFEval ni ninguna otra métrica, ni comparaciones con el modelo base. Tampoco se han encontrado resultados en la búsqueda web realizada (los resultados obtenidos no guardan relación con el modelo). Cualquier cifra que se quiera usar para evaluar este derivado debe generarse con una evaluación propia frente a `unsloth/Qwen3-4B-Instruct-2507` como referencia.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos en bf16/fp16: en torno a 8-9 GB solo para pesos, más 2-4 GB adicionales para KV cache y activaciones en función de la longitud de contexto; 16 GB de VRAM es un objetivo seguro para contextos moderados.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos; cuantización a 4 bits (GGUF Q4_K_M o similar): aproximadamente 2,5-3 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para servicio con contexto largo y concurrencia; RTX 4090 (24 GB) o L40S (48 GB) para despliegue de una sola instancia con holgura.
- GPU de consumo: sí cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantización a 4 bits, en GPUs de 8-12 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). En CPU funciona vía llama.cpp, con throughput bajo.
- Opciones de despliegue: transformers (soporte oficial del repositorio), vLLM y TGI para servicio con throughput alto, llama.cpp/Ollama si se generan GGUF propios, y SGLang como alternativa.
- Advertencia de despliegue: el repositorio ocupa 0,2 GB, muy por debajo de los ~8 GB esperables para pesos completos de 4B en bf16. Antes de planificar hardware hay que verificar si se trata de un adaptador LoRA, de pesos parciales o de una cuantización no declarada; de lo contrario, el despliegue fallará o cargará un modelo incompleto.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-44-v2 | ~4B (heredado) | 262.144 en el base; 2.048 presumiblemente en el SFT | No disponible | Repositorio comunitario, 0 descargas, sin evaluaciones ni dataset documentado |
| Qwen3-4B-Instruct-2507 (base) | ~4B | 262.144 | Apache 2.0 | Modelo oficial de Qwen, con model card completa y evaluaciones publicadas por el autor |
| Qwen3-4B-Thinking-2507 | ~4B | 262.144 | Apache 2.0 | Variante oficial orientada a razonamiento extendido; misma huella de despliegue |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 | Licencia comunitaria de Llama 3.2 | Ampliamente desplegado, ecosistema maduro y cuantizaciones oficiales |
| Gemma 3 4B IT | ~4B | 128.000 | Licencia de Gemma | Multimodal en la familia; cuantizaciones y soporte en vLLM/Ollama |
| Phi-4-mini-instruct | ~3,8B | 128.000 | MIT | Buen rendimiento declarado en razonamiento y matemáticas para su tamano |

Los datos de contexto y licencia de las alternativas provienen de sus fichas públicas y deben verificarse en la versión vigente. No se dispone de comparación de rendimiento entre este fine-tune y las alternativas, al no existir evaluaciones publicadas del derivado.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay métricas de calidad, seguridad ni regresiones frente al modelo base, por lo que no puede afirmarse que el SFT mejore ninguna capacidad.
- Dataset de entrenamiento no documentado: se desconoce la composición, el origen y los posibles sesgos del corpus de SFT, lo que impide evaluar riesgos de contaminación o de comportamientos indeseados.
- Licencia no declarada: la model card usa un marcador de posición ("licence: license") en lugar de una licencia real. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el derivado crea incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de cualquier explotación.
- Idiomas no declarados: no hay garantía de que el fine-tune conserve el multilingüismo del modelo base; es probable un sesgo hacia el idioma dominante del corpus de SFT.
- Tamano del repositorio anómalo (0,2 GB): sugiere pesos incompletos, un adaptador o una cuantización no declarada. Riesgo alto de que el modelo no cargue correctamente o no corresponda a un 4B completo.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; el SFT sin evaluación puede incrementarlo si el corpus contiene ejemplos factualmente incorrectos.
- Pérdida de la ventana de contexto: si el entrenamiento se limitó a 2.048 tokens, el rendimiento en contextos largos puede degradarse respecto al modelo base, aunque la arquitectura soporte 262.144.
- Sin mantenimiento ni comunidad: cero descargas y cero "likes" implican ausencia de validación por terceros, de issues resueltos y de cuantizaciones comunitarias.
- No apto para producción sin auditoría previa: se recomienda evaluar frente al modelo base en el dominio objetivo, revisar la integridad de los pesos y fijar una licencia antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-44-v2
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Paper o blog del modelo base, demo y resultados de benchmarks del fine-tune: no disponibles en la información proporcionada
