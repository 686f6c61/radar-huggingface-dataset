# exo-jhop/ministral3-eu-compliance-merged

## Resumen

El modelo `exo-jhop/ministral3-eu-compliance-merged` es un merge creado con la herramienta [mergekit](https://github.com/cg123/mergekit) a partir del modelo base `exo-jhop/ministral3-gdpr-distilled`, que a su vez es una destilación de la familia Ministral 3 8B. El resultado es un modelo de 8.918.026.240 parámetros (aproximadamente 8,9 mil millones) con pipeline `image-text-to-text`, lo que indica capacidad de procesamiento multimodal (imagen y texto). El merge utiliza el método DARE TIES con una densidad del 50% y un peso de 0,5 sobre el modelo base, y está publicado en formato `safetensors` con dtype `bfloat16`.

La relevancia de este modelo radica en su orientación hacia el cumplimiento normativo europeo (GDPR), como sugiere el nombre del modelo base (`ministral3-gdpr-distilled`). Sin embargo, la documentación disponible es extremadamente escasa: no se especifica la licencia, los idiomas soportados, ni se proporcionan benchmarks o detalles de entrenamiento. El repositorio ocupa 53,5 GB, lo que sugiere que incluye pesos en múltiples formatos o cuantizaciones, aunque solo se confirma la presencia de `safetensors`. El modelo está registrado como compatible con endpoints y con soporte FP8, lo que facilita su despliegue en infraestructuras de inferencia optimizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Ministral 3 8B |
| Parametros totales | 8.918.026.240 (8,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (indicado en tags), bfloat16 (dtype del merge), posiblemente otros no documentados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16), con soporte FP8 |

## Arquitectura y entrenamiento

El modelo se construye mediante un merge de tipo DARE TIES (Drop And REscale) sobre el modelo `exo-jhop/ministral3-gdpr-distilled`. DARE TIES es un método de fusión de modelos que elimina una fracción de los deltas de los pesos (en este caso, densidad 0,5) y luego combina los restantes mediante suma con normalización, utilizando máscaras int8 para reducir el coste de memoria. La configuración exacta del merge se detalla en el YAML incluido en la model card, con `base_model: ./merged-step1`, lo que indica que este merge es un paso posterior a otro merge previo no documentado.

El modelo base `ministral3-gdpr-distilled` es una destilación de Ministral 3 8B, un modelo de lenguaje pequeño con capacidades de visión, ajustado para instrucciones. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de RLHF o DPO. El pipeline `image-text-to-text` confirma que el modelo acepta entradas multimodales (imagen y texto) y genera texto, pero no se detallan las innovaciones técnicas específicas más allá del propio método de merge.

## Capacidades

- Generación de texto e instrucciones: al ser un modelo ajustado para instrucciones (instruct post-trained), puede mantener conversaciones y seguir comandos en lenguaje natural.
- Procesamiento de imágenes: el pipeline `image-text-to-text` indica que puede recibir imágenes como entrada y generar texto relacionado (por ejemplo, descripción de imágenes o respuesta a preguntas visuales).
- Razonamiento y comprensión del lenguaje: hereda las capacidades de la familia Ministral 3, que incluyen razonamiento básico y comprensión contextual.
- Cumplimiento normativo (GDPR): el nombre del modelo sugiere un enfoque en regulaciones europeas de protección de datos, aunque no se documenta cómo se implementa esta capacidad.
- Compatibilidad con herramientas de inferencia: el tag `endpoints_compatible` y el soporte FP8 permiten su despliegue en servicios como FriendliAI o vLLM.
- No se confirma soporte de tool calling, function calling, ni modo de razonamiento explícito (thinking mode) en la documentación disponible.

## Casos de uso

- Asistente virtual para empresas europeas: el modelo puede integrarse en chatbots de atención al cliente que necesiten respetar normativas de privacidad (GDPR), generando respuestas que eviten almacenar datos personales innecesarios.
- Análisis de documentos con imágenes: gracias a su capacidad multimodal, puede procesar capturas de pantalla, facturas o formularios escaneados y extraer información relevante, útil en flujos de automatización de back-office.
- Generación de respuestas en entornos regulados: en sectores como banca o sanidad, donde el cumplimiento normativo es crítico, el modelo puede emplearse para redactar comunicaciones que se ajusten a políticas de privacidad.
- Clasificación y moderación de contenido visual: puede analizar imágenes y generar descripciones o etiquetas, ayudando a filtrar contenido inapropiado en plataformas sociales.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de 8,9 B parámetros, es viable para pruebas locales en GPUs de consumo, permitiendo a desarrolladores validar ideas antes de escalar.
- Despliegue en inferencia gestionada: su compatibilidad con endpoints y FP8 permite usarlo en servicios cloud de baja latencia para aplicaciones de producción que requieran procesamiento multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto. Tampoco se proporcionan comparativas con modelos similares en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,9 B parámetros en bfloat16, el modelo requiere aproximadamente 18 GB de VRAM solo para los pesos. Con cuantización FP8, se reduce a unos 9 GB. Con cuantizaciones de 4 bits (no confirmadas en el repo), podría bajar a 5-6 GB.
- GPU recomendadas: para FP8 o bfloat16, se necesitan GPUs con al menos 16-24 GB de VRAM, como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Para cuantizaciones más agresivas, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrían ser suficientes.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 24 GB de VRAM (RTX 3090/4090) usando FP8 o cuantización de 4 bits. En GPUs de 16 GB (RTX 4080) solo con cuantización de 4 bits.
- Opciones de despliegue: vLLM, llama.cpp (si se generan GGUF), Ollama (si se convierte), TGI (Text Generation Inference), y servicios gestionados como FriendliAI (que ya lo ofrece).
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por su tamaño y arquitectura, se puede situar en la categoría de modelos de ~8B parámetros multimodales. Alternativas comparables serían:

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Ministral 3 8B (original) | 8,9 B | No disponible | Sí (visión) | No disponible |
| Llama 3.1 8B Instruct | 8,0 B | 128K | No | Llama 3.1 (permisiva) |
| Mistral 7B Instruct | 7,3 B | 32K | No | Apache 2.0 |
| Qwen2-VL 7B | 7,6 B | 32K | Sí (visión) | Apache 2.0 |

La comparativa es orientativa, ya que no se han medido rendimientos relativos. El modelo `ministral3-eu-compliance-merged` se diferencia por su enfoque en cumplimiento GDPR, pero carece de documentación sobre licencia y rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial del modelo es incierto. No se indica ninguna licencia en la model card, lo que puede generar problemas legales en producción.
- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, el proceso de destilación, ni los datos utilizados para el merge. Esto dificulta la evaluación de sesgos y riesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden identificar sesgos potenciales relacionados con género, raza o idioma.
- Limitaciones de idioma: no se especifican los idiomas soportados. Aunque el nombre sugiere un enfoque europeo, no hay confirmación de cobertura multilingüe.
- Contexto limitado: se desconoce la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas.
- Sin garantías de cumplimiento GDPR: a pesar del nombre, no hay evidencia técnica de que el modelo cumpla realmente con el RGPD. Es una etiqueta del autor, no una certificación.
- Tamaño del repositorio: 53,5 GB es un peso considerable para un modelo de 8,9 B, lo que puede indicar la inclusión de múltiples formatos o cuantizaciones, pero también dificulta la descarga en entornos con ancho de banda limitado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/exo-jhop/ministral3-eu-compliance-merged)
- [Página del modelo en FriendliAI](https://friendli.ai/models/exo-jhop/ministral3-eu-compliance-merged)
- [Paper de Ministral 3 en arXiv](https://arxiv.org/abs/2601.08584)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
- [Paper de DARE TIES (arXiv:2311.03099)](https://arxiv.org/abs/2311.03099)
