# edwardneo/cs329x-personalized-dpo

## Resumen
`edwardneo/cs329x-personalized-dpo` es un adaptador de ajuste fino del tipo PEFT/LoRA (biblioteca `peft`, versión 0.10.0) construido sobre `meta-llama/Llama-3.2-3B-Instruct`. El nombre del repositorio sugiere un trabajo de la asignatura CS329X (curso de NLP centrado en el ser humano), y las siglas DPO apuntan a un entrenamiento mediante optimización directa de preferencias (Direct Preference Optimization) orientado a personalización. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben combinarse con el modelo base para funcionar.

El repositorio no incluye model card útil: la tarjeta es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]". No hay información sobre datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación. En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", y su tamaño es de 0.0 GB, por lo que es probable que los pesos del adaptador no estén publicados o sean meramente simbólicos.

Su relevancia es, por tanto, limitada y fundamentalmente académica: sirve como ejemplo de cómo aplicar DPO para personalizar un modelo pequeño (3B) sobre un LLM ya alineado por instrucciones. Cualquier evaluación rigurosa depende de consultar el modelo base y de que el autor publique detalles de entrenamiento que ahora mismo no existen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre transformer decoder-only (modelo base: Llama 3.2) |
| Parámetros totales | No disponible para el adaptador (el repositorio ocupa 0.0 GB); el modelo base tiene 3,21 mil millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama 3.2 3B Instruct soporta hasta 128 000 tokens |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite cuantizaciones GGUF, INT8 e INT4 a través de llama.cpp y otras herramientas |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible; al derivar de Llama 3.2, queda sujeta a la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El artefacto publicado es un adaptador de bajo rango (LoRA) gestionado mediante la librería PEFT, no un modelo independiente. La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only autorregresivo con atención por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y normalización RMSNorm, además de un tokenizer BPE compartido con el resto de la familia Llama 3. El adaptador añade matrices de bajo rango a determinadas capas del modelo base, de modo que en inferencia debe cargarse junto a `meta-llama/Llama-3.2-3B-Instruct`.

No hay información pública sobre el procedimiento de entrenamiento del adaptador. Por el nombre del repositorio se infiere un uso de DPO (optimización directa de preferencias) con fines de personalización, pero se desconocen el conjunto de datos de preferencias, el número de pasos, la tasa de aprendizaje, el rango (`r`), el valor de `alpha`, el dropout del adaptador y si se aplicaron técnicas adicionales como LoRA+ o entrenamiento con regularización. Tampoco se documenta si el ajuste se hizo en precisión mixta bf16/fp16 ni la infraestructura empleada. En consecuencia, no es posible reproducir el entrenamiento a partir de la información disponible.

## Capacidades
- Generación de texto y respuesta a instrucciones: heredadas íntegramente del modelo base Llama 3.2 3B Instruct, que es un modelo afinado por instrucciones y con alineación por RLHF.
- Razonamiento y matemáticas elementales: el modelo base está diseñado para tareas de razonamiento y resolución de problemas de complejidad media.
- Generación de código: el base model proporciona capacidades de programación básicas e intermedias.
- Soporte de tool calling / function calling: el modelo base Llama 3.2 ofrece soporte nativo de llamadas a herramientas y salida en formato de esquema.
- Capacidades multilingües: el modelo base declara soporte de 8 idiomas, aunque con calidad desigual.
- Personalización mediante DPO: la única capacidad diferencial atribuible al adaptador, sin detalles verificables sobre qué preferencias concretas ha aprendido.
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles.

## Casos de uso
- Proyecto docente o de investigación sobre alineación: el adaptador puede usarse como caso de estudio para comparar el comportamiento del modelo base frente a una versión ajustada con DPO, analizando cómo cambian las preferencias de salida.
- Prototipado de asistentes personalizados: sobre el modelo base, el adaptador podría permitir experimentar con estilos o preferencias de respuesta concretas, siempre que se validen contra datos propios.
- Pruebas de reproducibilidad de DPO: dado que el repositorio es pequeño, resulta adecuado para reproducir pipelines de PEFT con `peft 0.10.0` sin necesidad de hardware dedicado.
- Generación de texto asistida en local: combinado con el modelo base cuantizado, puede desplegarse en equipos de consumo para tareas de redacción y resumen, aunque la aportación del adaptador es incierta.
- Filtrado de estilo o tono en respuestas: si el DPO se entrenó con preferencias de estilo, podría emplearse para adaptar el registro de las respuestas, pero esto requeriría evaluación previa.
- Base para experimentos de alineación personalizada: permite estudiar cómo se comporta un adaptador DPO de bajo rango en un modelo de 3B antes de escalar a modelos mayores.
- Docencia sobre despliegue de adaptadores PEFT: útil para demostrar la carga combinada de un adaptador con su modelo base en frameworks como Transformers + PEFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ninguna otra) ni comparaciones con modelos similares. Para el modelo base `meta-llama/Llama-3.2-3B-Instruct` sí existen resultados públicos en su model card oficial, pero no forman parte de la información proporcionada en este repositorio y no deben atribuirse al adaptador.

## Requisitos de hardware
- VRAM para inferencia del modelo base (aproximada): en fp16 unos 6,4 GB; en INT8 unos 3,5 GB; en cuantización de 4 bits unos 2,0 GB. El adaptador LoRA añade un consumo marginal (decenas de MB).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090, RTX 3090 o RTX A6000 para trabajo individual.
- Consumer GPU: sí cabe en GPUs de consumo. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o incluso una RTX 4070 de 12 GB pueden ejecutar el modelo base en fp16 o cuantizado. En 4 bits cabría en GPUs con 6-8 GB.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama y servidores compatibles con PEFT mediante Transformers. Para formatos GGUF habría que convertir el modelo fusionado.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de latencia, tokens por segundo ni throughput para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `edwardneo/cs329x-personalized-dpo` (este) | Adaptador sobre 3,21 B | No disponible (base: 128k) | No disponible | Adaptador PEFT en HuggingFace |
| Llama 3.2 3B Instruct (base) | 3,21 B | 128k | Llama 3.2 Community License | Pesos completos en HuggingFace |
| Qwen2.5 3B Instruct | ~3,1 B | 32k (ampliable a 128k) | Apache 2.0 / Qwen License | Pesos completos en HuggingFace |
| Phi-3.5-mini Instruct | 3,8 B | 128k | MIT | Pesos completos en HuggingFace |
| Gemma 2 2B IT | 2,6 B | 8k | Gemma Terms of Use | Pesos completos en HuggingFace |

La comparación directa con estos modelos es limitada porque el artefacto analizado es un adaptador y no un modelo autónomo. La comparativa relevante sería frente a otros adaptadores DPO sobre el mismo modelo base, de los que no se dispone información.

## Limitaciones y advertencias
- Ausencia total de documentación: la model card es la plantilla por defecto, sin datos de entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: al derivar de Llama 3.2, se hereda la Llama 3.2 Community License, que impone restricciones (por ejemplo, obligación de incluir el aviso de licencia y una política de uso aceptable). Cualquier uso comercial exige revisar y cumplir dicha licencia.
- Riesgo de alucinación: inherente al modelo base de 3B, con mayor probabilidad de errores factuales que modelos de mayor tamaño.
- Sesgos: el modelo base puede reproducir sesgos de género, raza, religión y otros presentes en sus datos de entrenamiento; el adaptador DPO puede haberlos reforzado o modificado de forma no documentada.
- Personalización no verificada: no hay evidencia de qué preferencias ha aprendido el adaptador ni de si funcionan fuera del dominio para el que se entrenó.
- Repositorio presumiblemente vacío: con 0.0 GB de tamaño y 0 descargas, es posible que los pesos no estén realmente publicados; conviene verificar antes de integrarlo en cualquier pipeline.
- Idioma: el adaptador no declara idiomas propios; su comportamiento multilingüe depende del base, que ofrece calidad desigual fuera del inglés.
- Sin evaluación de seguridad: no se documentan pruebas de robustez, jailbreak ni uso dual.
- Uso en producción desaconsejado: sin benchmarks, sin licencia clara y sin datos de entrenamiento, no es apto para entornos de producción sin una evaluación exhaustiva y propia.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/edwardneo/cs329x-personalized-dpo
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
