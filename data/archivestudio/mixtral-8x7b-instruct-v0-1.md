# ArchiveStudio/Mixtral-8x7B-Instruct-v0.1

## Resumen

ArchiveStudio/Mixtral-8x7B-Instruct-v0.1 es una reproducción (mirror) de los pesos del modelo Mixtral-8x7B-Instruct-v0.1 desarrollado originalmente por Mistral AI, publicada por el usuario ArchiveStudio. Se trata de un modelo de lenguaje generativo con arquitectura de mezcla dispersa de expertos (Sparse Mixture of Experts, SMoE) con 46.702.792.704 parámetros totales según los metadatos de safetensors, afinado por instrucciones a partir del modelo base mistralai/Mixtral-8x7B-v0.1. El repositorio está etiquetado como compatible con vLLM y con la librería transformers de Hugging Face.

La relevancia de este modelo radica en su relación entre calidad y coste computacional: al emplear enrutamiento disperso solo se activa una fracción de los parámetros por token, de modo que el coste de cómputo por token es inferior al de un modelo denso de tamaño equivalente, aunque el requisito de memoria sea el del total de parámetros. La model card del autor original afirma que Mixtral-8x7B supera a Llama 2 70B en la mayoría de los benchmarks probados por Mistral AI, con soporte declarado para francés, italiano, alemán, español e inglés y una ventana de contexto indicada en el nombre del release original como de 32 000 tokens ("mixtral-8x7b-32kseqlen").

Conviene señalar que este repositorio concreto no es la publicación oficial de Mistral AI: acumula 0 descargas y 0 likes en el momento de la consulta, tiene un tamaño de 190,5 GB (consistente con pesos almacenados en precisión de 32 bits, unos 4 bytes por parámetro) y fue creado el 26 de septiembre de 2026. Para uso en producción se recomienda contrastar la procedencia de los pesos frente al repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla dispersa de expertos (Sparse Mixture of Experts, SMoE) sobre transformer decoder-only |
| Parametros totales | 46.702.792.704 (46,7 B) |
| Parametros activos | no disponible en la model card; el nombre del modelo (8x7B) y su naturaleza MoE implican activación parcial por token, pero no se documenta la cifra exacta |
| Longitud de contexto | no declarada explícitamente en la model card; el release original se distribuye como "mixtral-8x7b-32kseqlen", lo que indica 32 000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors); el tamaño del repo (190,5 GB) sugiere pesos en 32 bits, no cuantizados |
| Idiomas soportados | francés, italiano, alemán, español, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM) |
| Modelo base | mistralai/Mixtral-8x7B-v0.1 |
| Libreria declarada | vLLM |
| Tamano del repositorio | 190,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

Mixtral-8x7B es un transformer decoder-only con capas de mezcla dispersa de expertos: cada capa sustituye la capa feed-forward densa por un conjunto de expertos y una red de enrutamiento que selecciona un subconjunto de ellos por token. La model card describe el modelo como "pretrained generative Sparse Mixture of Experts" y añade que supera a Llama 2 70B en la mayoría de los benchmarks que Mistral AI probó. No se detallan en la documentación consultada el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (SFT, RLHF o DPO) empleadas en la versión Instruct.

El repositorio contiene pesos compatibles con el servido mediante vLLM y con la librería transformers, aunque la propia model card advierte de que el formato de archivo y los nombres de parámetros difieren del release original distribuido por torrent, y de que el modelo "no puede (todavía) instanciarse con HF" tal cual. Para el tokenizado se recomienda la librería mistral-common (`MistralTokenizer.v1()`), que actúa como implementación de referencia, y se advierte de que PRs para alinear el tokenizador de transformers con dicha referencia son bienvenidos. El formato de instrucción debe respetarse estrictamente: `<s> [INST] Instrucción [/INST] Respuesta</s> [INST] Instrucción de seguimiento [/INST]`, donde `<s>` y `</s>` son tokens especiales y `[INST]` / `[/INST]` son cadenas normales. No se documenta en la información disponible ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno en formato de instrucciones, con la plantilla `[INST] ... [/INST]` obligatoria.
- Razonamiento y respuesta a instrucciones complejas en cinco idiomas: francés, italiano, alemán, español e inglés.
- Procesamiento de contextos largos (hasta 32 000 tokens según el nombre del release original), lo que permite manejar documentos extensos y conversaciones prolongadas.
- Generación de código y resolución de problemas técnicos descritos por el usuario, como modelo de propósito general instruido.
- Soporte de tool calling / function calling: no documentado en la model card ni en las etiquetas del repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el formato de chat permite encadenar turnos, pero no se declara ninguna API de agentes.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento explícito separado: no disponible.

## Casos de uso

- Atención al cliente multilingüe: el modelo cubre español, francés, italiano, alemán e inglés en una única instancia, lo que evita desplegar un modelo por idioma; con 32 000 tokens de contexto puede mantener el historial completo de una conversación y el contenido de la documentación de producto sin truncar.
- RAG sobre documentación técnica extensa: indexar manuales, especificaciones o bases de conocimiento de decenas de miles de palabras y pasarlas íntegras en el prompt, aprovechando la ventana de contexto para reducir la pérdida de información típica de los pipelines de recuperación agresiva.
- Asistencia a la programación autoalojada: generación y explicación de código dentro de un IDE o de un pipeline de revisión, ejecutando el modelo en infraestructura propia gracias a la licencia Apache 2.0, sin enviar código propietario a APIs externas.
- Traducción y localización entre sus cinco idiomas: traducción de documentación, interfaces o materiales de marketing entre español, francés, italiano, alemán e inglés, con la ventaja de que el modelo ha sido entrenado y evaluado en esos idiomas.
- Análisis y resumen de documentos largos: contratos, informes financieros o expedientes administrativos que superan la ventana de modelos de 4 000-8 000 tokens, resumidos o consultados por secciones en una sola pasada.
- Generación de datos sintéticos para fine-tuning: producir conversaciones y pares instrucción-respuesta en varios idiomas para entrenar modelos más pequeños o especializados, siempre que la licencia Apache 2.0 y las condiciones de uso lo permitan.
- Chatbot interno de soporte a empleados: despliegue en un clúster con GPUs de 80 GB mediante vLLM, sirviendo peticiones concurrentes con el formato de chat nativo del modelo.
- Baseline de investigación en arquitecturas MoE: comparar estrategias de enrutamiento, cuantización o destilación contra un MoE de referencia de 46,7 B parámetros con pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma de forma cualitativa que Mixtral-8x7B "supera a Llama 2 70B en la mayoría de los benchmarks que probamos", sin aportar cifras, tablas ni metodología. Tampoco hay mediciones de latencia o throughput en los materiales consultados.

## Requisitos de hardware

- VRAM estimada en precisión de 32 bits: aproximadamente 187 GB solo para los pesos (46,7 B x 4 bytes), más la caché KV; requiere al menos 4 GPUs de 80 GB o 8 GPUs de 48 GB.
- VRAM estimada en fp16/bf16: aproximadamente 93-95 GB para los pesos, más caché KV; en la práctica, 2 x A100 80 GB, 2 x H100 80 GB o 4 x A6000 48 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 47-50 GB; viable en 1 x A100 80 GB o 2 x RTX 4090.
- VRAM estimada en cuantización de 4 bits: aproximadamente 24-27 GB; entra ajustadamente en una RTX 4090 de 24 GB o en 2 x RTX 3090 de 24 GB, con contexto reducido.
- GPU recomendadas: A100 80 GB y H100 80 GB para servicio en fp16 con contexto largo; A6000/L40S para despliegues multi-GPU; RTX 4090 o RTX 3090 solo con cuantización de 4 bits.
- Opciones de despliegue: vLLM (librería declarada por el repositorio), transformers con `device_map="auto"`, y `mistral_inference` mediante `Transformer.from_folder`. Las cuantizaciones GGUF para llama.cpp u Ollama no se distribuyen en este repositorio y habría que obtenerlas de terceros para el modelo base.
- Latencia y throughput: no disponibles. Como referencia arquitectónica general de los MoE, el coste de cómputo por token es inferior al de un modelo denso de 46,7 B, pero el requisito de memoria es el del total de parámetros.
- Advertencia de compatibilidad: la model card indica que el modelo no puede instanciarse todavía con HF y que los nombres de parámetros difieren del release original, por lo que conviene validar la carga con vLLM antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ArchiveStudio/Mixtral-8x7B-Instruct-v0.1 | 46,7 B (MoE) | 32 000 tokens (indicado en el release original) | Apache 2.0 | Repositorio espejo, 0 descargas, 190,5 GB | Pesos safetensors compatibles con vLLM; procedencia no oficial |
| mistralai/Mixtral-8x7B-Instruct-v0.1 | 46,7 B (MoE) | 32 000 tokens | Apache 2.0 | Repositorio oficial de Mistral AI | Referencia canónica; mismo modelo, publicación con soporte del autor |
| Llama 2 70B Chat | 70 B (denso) | 4 096 tokens | Licencia comunitaria de Llama 2 (no Apache 2.0) | Repositorio oficial de Meta | Mencionado en la model card como referencia superada por Mixtral en la mayoría de benchmarks, sin cifras publicadas |
| Alternativas de la misma categoría (Qwen, Llama 3, etc.) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al no detallarse la composición del dataset de entrenamiento ni la etapa de alineación, no es posible evaluar sesgos de forma sistemática.
- Riesgo de alucinación: inherente a los modelos generativos; no se publican evaluaciones de factualidad ni tasas de alucinación para esta versión.
- Formato de prompt estricto: si no se respeta la plantilla `<s> [INST] ... [/INST]`, la model card advierte de que las salidas serán subóptimas.
- Limitaciones de contexto: aunque el release original apunta a 32 000 tokens, la degradación del rendimiento en contextos muy largos no está cuantificada, y la caché KV a esa longitud incrementa notablemente los requisitos de memoria.
- Limitaciones de idioma: los idiomas declarados son francés, italiano, alemán, español e inglés; no hay garantías de calidad fuera de ese conjunto, y el soporte del español no está cuantificado con benchmarks.
- Compatibilidad: la propia model card advierte de que el modelo no puede instanciarse todavía con HF y que los nombres de parámetros difieren del release original, lo que puede romper scripts de carga estándar.
- Procedencia del repositorio: se trata de una reproducción publicada por un tercero (ArchiveStudio) con 0 descargas y licencia Apache 2.0 declarada, pero sin verificación de integridad publicada; para producción conviene usar el repositorio oficial.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una descripción con control de acceso ("extra_gated_description") y remite a la política de privacidad de Mistral AI, por lo que conviene revisar los términos aplicables al modelo base.
- Requisitos de memoria: el tamaño del repositorio (190,5 GB) hace inviable el despliegue en una única GPU de consumo sin cuantización previa, que no se incluye en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Mixtral-8x7B-Instruct-v0.1
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- Modelo oficial instruido: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Blog de Mistral AI sobre Mixtral of Experts: https://mistral.ai/news/mixtral-of-experts/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Librería transformers: https://github.com/huggingface/transformers
- Documentación de plantillas de chat en transformers: https://huggingface.co/docs/transformers/main/en/chat_templating
- Política de privacidad de Mistral AI (referenciada en la model card): https://mistral.ai/terms/
- Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
