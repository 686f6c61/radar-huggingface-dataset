# mradermacher/WazoCore-8B-v6-long-GGUF

## Resumen

WazoCore-8B-v6-long-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo mkbadeniyi/WazoCore-8B-v6-long, publicada por mradermacher, un cuantizador conocido por su extenso catálogo de modelos GGUF en Hugging Face. El modelo base es un modelo de 8.153 millones de parámetros basado en la arquitectura Llama 3, especializado en lenguas nigerianas de bajos recursos: yoruba (yo), hausa (ha) e igbo (ig), además del inglés (en). Su pipeline principal en Hugging Face es la traducción, y destaca por incorporar expansión de vocabulario (vocabulary-expansion) mediante un tokenizador BPE adaptado a estas lenguas, algo poco habitual en modelos derivados de Llama 3.

La relevancia de este modelo radica en la escasez de modelos abiertos que cubran lenguas africanas de bajos recursos con calidad razonable. La versión "long" sugiere un enfoque en contextos extendidos, aunque la longitud exacta de ventana no está documentada en la información disponible. El modelo base se entrenó usando el dataset google/smol, y la licencia aplicada es la n-atlas-open-source-research-and-innovation-license, una licencia de investigación e innovación que impone restricciones a revisar antes de cualquier uso comercial.

Esta ficha describe el repositorio de cuantizaciones, no el modelo base original. Las cuantizaciones van desde Q2_K (3,4 GB) hasta f16 (16,4 GB), lo que permite ejecutar el modelo desde portátiles modestos hasta estaciones de trabajo con GPU, principalmente mediante llama.cpp y herramientas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama 3 (decoder-only) |
| Parametros totales | 8.153.141.312 |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densa) |
| Longitud de contexto | no disponible (la version "long" sugiere contexto extendido, cifra no publicada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | yoruba (yo), hausa (ha), igbo (ig), ingles (en) |
| Licencia | n-atlas-open-source-research-and-innovation-license (other) |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, mkbadeniyi/WazoCore-8B-v6-long, es un modelo de lenguaje decoder-only de 8,15 mil millones de parámetros derivado de la familia Llama 3. Los tags del repositorio indican dos innovaciones técnicas destacables: la expansión de vocabulario (vocabulary-expansion) y la adaptación del tokenizador BPE. Ampliar el vocabulario de un tokenizador originalmente centrado en inglés y lenguas europeas permite representar texto en yoruba, hausa e igbo con menos tokens por palabra, lo que mejora tanto la eficiencia de inferencia como la calidad de generación en estas lenguas, cuyo alfabeto incluye diacríticos (por ejemplo, los tonos del yoruba) que los tokenizadores estándar fragmentan en exceso.

Sobre los datos de entrenamiento, la model card solo indica el uso del dataset google/smol. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del corpus, ni sobre el uso de técnicas de alineación como RLHF o DPO. Tampoco hay documentación sobre el método concreto de adaptación (fine-tuning completo, LoRA, continued pretraining). La versión "long" del nombre sugiere trabajo sobre la longitud de contexto, pero no hay datos publicados al respecto.

Las cuantizaciones GGUF incluidas en este repositorio son estáticas, generadas por mradermacher mediante conversión desde el formato safetensors del modelo base. Adicionalmente existen cuantizaciones weighted/imatrix en un repositorio complementario, que suelen ofrecer mejor calidad a tamaños equivalentes.

## Capacidades

- Traducción entre yoruba, hausa, igbo e inglés: es la capacidad principal declarada (pipeline de traducción en Hugging Face).
- Generación de texto conversacional: el repositorio está etiquetado como "conversational", lo que indica soporte de formato de chat.
- Manejo de lenguas de bajos recursos: gracias a la expansión de vocabulario, procesa texto con diacríticos tonales del yoruba y las ortografías del hausa e igbo de forma más eficiente que un tokenizador estándar de Llama 3.
- Comprensión y generación en inglés: al derivar de Llama 3, conserva capacidades generales en inglés, aunque el grado de retención tras el fine-tuning no está documentado.
- Ejecución local eficiente: el formato GGUF permite inferencia en CPU y GPU con llama.cpp, LM Studio, Ollama y herramientas similares.
- No hay información disponible sobre soporte de tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Traducción automática de lenguas nigerianas: el caso de uso principal. Un servicio de traducción yoruba-inglés o igbo-inglés puede servir el modelo con llama.cpp en un servidor modesto, aprovechando que la mayoría de sistemas comerciales ignoran estas lenguas.
- Localización de software y contenidos: empresas que operan en Nigeria pueden usar el modelo para traducir interfaces, documentación o campañas de comunicación al hausa, yoruba e igbo, validando los resultados con revisores humanos.
- Preservación lingüística e investigación académica: investigadores en lingüística computacional pueden emplear el modelo como punto de partida para experimentos con lenguas de bajos recursos, sujeto a los términos de la licencia de investigación.
- Asistentes conversacionales en lenguas locales: el formato conversacional permite construir chatbots de atención al ciudadano o servicios públicos que atiendan en lenguas nigerianas, donde el inglés no es la lengua materna de gran parte de la población.
- Generación de corpus sintético: el modelo puede usarse para generar texto de entrenamiento en yoruba, hausa e igbo, ayudando a bootstrapear datasets para otros modelos o sistemas TTS/ASR.
- Despliegue en dispositivos con recursos limitados: con la cuantización Q2_K (3,4 GB) el modelo cabe en portátiles sin GPU dedicada, útil para ONG o proyectos educativos en zonas con infraestructura limitada.
- Herramientas educativas de aprendizaje de lenguas: aplicaciones que generen ejemplos, traducciones y explicaciones para estudiantes de yoruba, hausa o igbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantizaciones no incluye evaluaciones (MMLU, HumanEval, FLORES, u otras), y la model card del cuantizador no aporta métricas. Para evaluar el modelo se recomienda realizar pruebas propias con datasets de traducción como FLORES-200 en los pares yo-en, ha-en e ig-en.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. Aproximaciones para un modelo de 8,15 mil millones de parámetros:

- Q2_K (3,4 GB): cabe en cualquier equipo moderno con 8 GB de RAM; viable solo en CPU, con calidad notablemente degradada.
- Q3_K_M (4,2 GB) a IQ4_XS (4,7 GB): ejecutables en portátiles con 8-16 GB de RAM o GPUs de gama media con 6-8 GB de VRAM (RTX 3060, RTX 4060).
- Q4_K_S / Q4_K_M (4,9-5,1 GB): opción recomendada por el autor; requiere unos 6-8 GB de VRAM o 8 GB de RAM en modo CPU/mixto. Adecuadas para RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070.
- Q5_K / Q6_K (5,8-6,8 GB): cómodas en GPUs con 8-12 GB de VRAM (RTX 3080, RTX 4070 Ti, RTX 3090).
- Q8_0 (8,8 GB): requiere GPUs con 12 GB o más de VRAM (RTX 4090, RTX 3090) para inferencia totalmente en GPU.
- f16 (16,4 GB): recomendado solo para GPUs de 24 GB (RTX 3090/4090, A5000) o entornos de servidor; el autor lo califica de "overkill".
- GPUs de datacenter (A100, H100) son innecesarias para este tamaño, aunque acelerarían servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- No hay mediciones publicadas de latencia ni throughput; en un 8B cuantizado a Q4 con llama.cpp en una RTX 4090 cabe esperar decenas de tokens por segundo, pero es una estimación general no verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| WazoCore-8B-v6-long | 8,15B | yo, ha, ig, en | no disponible | safetensors / GGUF | n-atlas (restricciones de uso) |
| Llama 3 8B Instruct (base de la familia) | 8B | multilingue (yo/ha/ig con cobertura muy limitada) | 8.192 tokens | safetensors / GGUF | Llama 3 Community License |
| NLLB-200 (Meta) | hasta 54,5B (MoE) / destilados desde 600M | 200 lenguas africanas incluidas | no aplicable (modelo de traduccion) | CC-BY-NC (no comercial) |
| AfriMTE / modelos afrocentricos pequeños (p. ej. AfriLLaMa) | variable | multiples lenguas africanas | no disponible | variable | variable |

Notas: NLLB-200 es el referente clásico en traducción a lenguas africanas, pero su licencia no comercial y su arquitectura encoder-decoder lo hacen menos flexible que WazoCore para uso generativo. Llama 3 8B Instruct ofrece capacidades generales muy superiores en inglés, pero su tokenizador fragmenta fuertemente el yoruba, hausa e igbo, degradando calidad y eficiencia. La ventaja diferencial de WazoCore es la expansión de vocabulario específica para estas tres lenguas.

## Limitaciones y advertencias

- Sesgos: no hay auditorías publicadas de sesgos. Los modelos entrenados con datos de lenguas de bajos recursos suelen heredar sesgos de corpus web y de traducciones automáticas previas; conviene validar con hablantes nativos antes de producción.
- Alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o traducciones incorrectas con fluidez. En lenguas de bajos recursos es más difícil para el usuario medio detectar errores, lo que agrava el riesgo.
- Contexto: la longitud de ventana no está publicada; no asumas contextos largos sin verificar empíricamente, pese al sufijo "long".
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan apreciablemente la calidad, especialmente delicado en tareas de traducción con diacríticos tonales. Se recomienda Q4_K_M o superior.
- Licencia: la n-atlas-open-source-research-and-innovation-license no es una licencia estándar permisiva. Está orientada a investigación e innovación; revisa sus términos antes de cualquier despliegue comercial, ya que puede restringir o condicionar el uso empresarial.
- Retención de capacidades en inglés: no está documentado cuánto del rendimiento general de Llama 3 se conserva tras el fine-tuning; puede haber olvido catastrófico parcial.
- Sin benchmarks públicos: no existen evaluaciones comparativas publicadas, por lo que la calidad real frente a NLLB u otros sistemas debe verificarse caso a caso.
- Cobertura limitada: solo cuatro idiomas; no es adecuado como modelo multilingüe general.
- Sin datos sobre tool calling, agentes ni alineación (RLHF/DPO): no lo emplees en escenarios de agentes sin pruebas exhaustivas.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-GGUF
- Modelo base: https://huggingface.co/mkbadeniyi/WazoCore-8B-v6-long
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#WazoCore-8B-v6-long-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Graph de comparacion de cuants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
- Dataset de entrenamiento indicado: https://huggingface.co/datasets/google/smol
