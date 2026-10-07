# APMIC/ACE-3-26B-A4B-Preview

## Resumen

ACE-3-26B-A4B-Preview es un modelo de lenguaje multimodal desarrollado por APMIC, una compania taiwanesa especializada en soluciones de IA para el sector financiero. Se trata de un ajuste fino (fine-tune) del modelo base google/gemma-4-26B-A4B-it, orientado a tareas conversacionales, generacion de texto, razonamiento multi-paso y uso de herramientas (tool calling) en contextos de chino tradicional y Taiwan, con soporte tambien de ingles. El modelo acepta entradas de imagen y texto (pipeline image-text-to-text) y esta disenado para integrarse en flujos agénticos, segun se desprende de sus etiquetas y de la documentacion publica de la familia Gemma 4.

La arquitectura es de mezcla de expertos (MoE, "moe" en las etiquetas), construida sobre la arquitectura Gemma 4. El repositorio declara 25.805.933.872 parametros totales reales segun los ficheros safetensors, lo que concuerda con la nomenclatura "26B" del nombre. El sufijo "A4B" sugiere aproximadamente 4.000 millones de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion proporcionada. El modelo pesa 51,7 GB en el repositorio y se distribuye en formato safetensors bajo licencia Gemma.

Su relevancia actual radica en que APMIC posiciona esta familia como un modelo "cost-efficient" para asesoria financiera de gestion de patrimonios en Taiwan, con conocimiento de la regulacion financiera local. El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en HuggingFace. El modelo figura como "Preview" y, en el momento de la consulta, no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text, basada en la arquitectura Gemma 4 |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | Aproximadamente 4B segun la nomenclatura A4B (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | zh (chino tradicional, etiqueta "traditional-chinese"), en (ingles) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-26B-A4B-it, un transformer multimodal con mezcla de expertos (MoE) que procesa entradas de imagen y texto. La etiqueta base_model:finetune indica que ACE-3-26B-A4B-Preview es un ajuste fino del checkpoint instruct de Google, no un entrenamiento desde cero. Los 25,8B parametros totales y los 51,7 GB del repositorio son coherentes con un checkpoint en precision bf16/fp16. No se ha publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO durante el ajuste.

Entre las capacidades heredadas de la familia Gemma 4, la documentacion oficial destaca el soporte "day-0" en multiples motores de inferencia de codigo abierto, la idoneidad para tool calling y agentes, y la publicacion de checkpoints ONNX para ejecucion en hardware de borde o en navegador. APMIC, por su parte, ha orientado este modelo hacia escenarios de asesoria financiera en Taiwan, incluyendo conocimiento de la regulacion local, segun su propia comunicacion sobre el benchmark ACE-Bank.

## Capacidades

- Generacion de texto conversacional multi-turno en chino tradicional e ingles.
- Procesamiento de entradas multimodales de imagen y texto (pipeline image-text-to-text).
- Razonamiento multi-paso y soporte de agentes (etiqueta "tool-calling", "conversational").
- Tool calling / function calling para integracion en pipelines y agentes.
- Capacidades multilingues limitadas a chino (tradicional) e ingles.
- Especializacion en dominio financiero de Taiwan: APMIC indica conocimiento de la regulacion financiera local y de la logica de mercado.
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").

## Casos de uso

- Asesoria financiera automatizada en Taiwan: el modelo esta ajustado para responder sobre productos de gestion de patrimonios y regulacion financiera local, segun el material de APMIC sobre el benchmark ACE-Bank.
- Atencion al cliente bancaria multi-turno: puede gestionar conversaciones conversacionales en chino tradicional, adecuado para entidades financieras taiwanesas.
- Agentes con tool calling: integracion en flujos agénticos que consulten APIs internas o bases de datos mediante function calling.
- Analisis de documentos con imagen: al aceptar entrada de imagen y texto, puede procesar capturas, formularios o extractos para extraer informacion.
- Evaluacion de preparacion de examenes de certificacion financiera: APMIC indica que el modelo ha superado 13 categorias de examenes de asesor financiero del Taiwan Academy of Banking and Finance.
- Automatizacion de back-office con contenido multilingue zh/en: generacion de resúmenes y respuestas en entornos corporativos taiwaneses.
- Prototipado de asistentes de dominio en produccion: al ser compatible con endpoints y heredar el soporte de motores de inferencia de Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. APMIC publica una pagina titulada "ACE-Bank Latest Financial Benchmark" (https://www.apmic.ai/en/news/ace-bank-benchmark) en la que describe el benchmark ACE-Bank para escenarios de asesoria financiera en Taiwan, pero en la informacion proporcionada no se incluyen las cifras concretas (MMLU, HumanEval, GSM8K u otros) ni la comparativa cuantitativa frente a otros modelos.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| ACE-Bank | pagina publicada por APMIC, cifras no disponibles en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 51,6 GB solo para pesos (los 51,7 GB del repositorio), mas memoria para el contexto y el estado del runtime. Requiere por tanto multiples GPU o cuantizacion.
- GPU recomendadas para bf16: configuraciones multi-GPU como 2x A100 40GB, 1x A100 80GB, 1x H100 80GB o 2x RTX 6000 Ada. No cabe en una unica GPU de consumo en bf16.
- GPU de consumo: no cabe en bf16 en RTX 4090 (24 GB). Podria caber con cuantizacion agresiva (por ejemplo 4 bits), pero no se han publicado cuantizaciones de este modelo en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y endpoints de inferencia de HuggingFace (etiqueta "endpoints_compatible"). Gemma 4 dispone de soporte day-0 en varios motores de inferencia open source y checkpoints ONNX, segun el blog oficial.
- Latencia y throughput estimados: no disponibles.
- Acceso: repositorio gated, es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APMIC/ACE-3-26B-A4B-Preview | 25.805.933.872 (~25,8B) | no disponible | zh, en | Gemma | Gated en HuggingFace |
| google/gemma-4-26B-A4B-it (modelo base) | no disponible en la informacion | no disponible | no disponible | Gemma | Publico en HuggingFace (google) |
| Surogate Rune 26B-A4B v3 | ~26B-A4B segun nomenclatura | no disponible | no disponible | no disponible | Referenciado en benchlm.ai |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que no se puede establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al estar especializado en el contexto financiero de Taiwan, puede mostrar sesgos hacia ese dominio y degradar en otros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente en modelos de lenguaje, especialmente en dominio regulado como el financiero, donde las respuestas deben verificarse.
- Limitaciones de idioma: solo se declaran chino tradicional (zh) e ingles (en). No hay soporte confirmado de castellano ni de otros idiomas.
- Cobertura geografica: enfocado en regulacion y mercado de Taiwan; su utilidad fuera de ese contexto no esta validada.
- Licencia: licencia Gemma, que impone condiciones de uso comercial y obligaciones de atribucion. Es necesario revisar los terminos completos de la licencia Gemma antes de un uso en produccion.
- Estado "Preview": el modelo esta en fase de vista previa, lo que implica posible inestabilidad, cambios futuros y ausencia de garantias.
- Acceso gated: la distribucion esta restringida y requiere aceptar condiciones en HuggingFace.
- Ausencia de cuantizaciones publicadas y de datos de benchmarks verificables en la informacion disponible, lo que dificulta una evaluacion cuantitativa previa a produccion.
- No se dispone de informacion sobre la longitud de contexto soportada, dato critico para planificar despliegues con memoria limitada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/APMIC/ACE-3-26B-A4B-Preview
- Benchmark ACE-Bank de APMIC: https://www.apmic.ai/en/news/ace-bank-benchmark
- Pagina de Google en HuggingFace (modelo base de la familia Gemma 4): https://huggingface.co/google
- Blog oficial de Gemma 4: https://huggingface.co/blog/gemma4
- Comparativa Gemini 3.1 Pro vs Gemini 3.8 Flash (benchlm.ai): https://benchlm.ai/compare/gemini-3-1-pro-vs-gemini-3-8-flash
- Comparativa Gemini 3.1 Flash TTS Preview vs Surogate Rune 26B-A4B v3 (benchlm.ai): https://benchlm.ai/compare/gemini-3-1-flash-tts-preview-vs-surogate-rune-26b-a4b-v3-rtxpro6000-a2
