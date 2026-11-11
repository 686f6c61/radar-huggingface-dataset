# skyrain22/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario skyrain22. Se presenta como un ajuste fino por SFT (supervised fine-tuning) de una base Qwen3.5 de 2B parametros, orientado presumiblemente al dominio medico segun el sufijo "MED" del identificador. El repositorio tiene un tamano de 4,4 GB y contiene pesos en formato safetensors compatibles con la libreria transformers, con la arquitectura `qwen3_5` registrada.

El modelo cuenta con 2.213.241.664 parametros totales, lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo. La model card es una plantilla autogenerada de Hugging Face sin contenido sustantivo: no documenta el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni los resultados de evaluacion. La licencia no esta declarada en la informacion disponible.

Su relevancia practica es limitada en el momento de la publicacion: registra cero descargas y cero likes, y carece de documentacion tecnica verificable. Cualquier evaluacion seria del modelo requiere inspeccion directa de los pesos y de los datos de ajuste, que no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (identificador `qwen3_5` en transformers); detalles internos no disponibles |
| Parametros totales | 2.213.241.664 (2,21 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `qwen3_5` en transformers y con el pipeline `image-text-to-text`, lo que indica una arquitectura transformer multimodal capaz de procesar imagenes y texto de entrada. El tag `trl` y `sft` en los metadatos sugiere que se ha aplicado un ajuste fino supervisado con la libreria TRL sobre una base Qwen3.5-2B, presumiblemente para tareas del dominio medico.

No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, la existencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La model card no incluye hiperparametros de entrenamiento ni detalles del preprocesamiento. Toda esta seccion queda como no disponible.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), lo que implica capacidad de comprension visual combinada con texto.
- Ajuste fino supervisado (SFT) sobre una base Qwen3.5, orientado segun el identificador a contenido medico.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking ni soporte de audio.
- El soporte multilingue no esta declarado.

## Casos de uso

- Prototipado de asistentes clinicos de bajo coste: el tamano de 2,2B parametros permite desplegar el modelo en una unica GPU de consumo para experimentar con respuestas a preguntas medicas, siempre que se valide la calidad con datos propios dado que no hay evaluacion publicada.
- Clasificacion y extraccion de informacion de informes medicos con imagenes: al ser image-text-to-text, puede emplearse para tareas de vision-lenguaje como describir o resumir imagenes clinicas, aunque la ausencia de benchmarks impide garantizar su precision.
- Generacion de texto asistida en entornos con recursos limitados: su tamano reducido permite ejecutarlo en portatiles con GPU modesta o incluso en CPU con cuantizacion posterior, para tareas de redaccion y resumen.
- Base para ajuste fino adicional en dominios especializados: al ser un modelo pequeno ya ajustado por SFT, sirve como punto de partida economico para experimentos de fine-tuning con LoRA en nichos concretos.
- Investigacion sobre ajuste multimodal: util para estudiar como un SFT sobre una base Qwen3.5-2B afecta al comportamiento en tareas de imagen y texto, comparando con la base original.
- Evaluacion comparativa de modelos medicos pequenos: puede incluirse en baterias de pruebas internas para medir la calidad de respuestas en dominios sanitarios frente a alternativas de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada con cuantizacion a 8 bits: en torno a 2,5-3 GB; a 4 bits, en torno a 1,5-2 GB (estimaciones teoricas, no verificadas con este modelo).
- GPU recomendadas para bf16: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 si se requiere throughput alto.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB tras cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI una vez verificada la compatibilidad de la arquitectura `qwen3_5`; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED (skyrain22) | 2,21B | no disponible | imagen-texto | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B (Alibaba) | ~3B | 32k (segun documentacion publica de la familia) | vision-lenguaje | Apache 2.0 (segun publicacion de Alibaba) | ampliamente disponible |
| Qwen2-VL-2B (Alibaba) | ~2B | 32k (segun documentacion publica) | vision-lenguaje | Apache 2.0 (segun publicacion de Alibaba) | ampliamente disponible |
| SmolVLM-2B (Hugging Face) | ~2B | 8k (segun documentacion publica) | vision-lenguaje | Apache 2.0 (segun publicacion) | ampliamente disponible |

La comparativa es orientativa: los datos de los modelos alternativos provienen de sus fichas publicas y no se han verificado contra este repositorio. El modelo evaluado carece de licencia declarada y de evaluacion publicada, lo que lo situa en desventaja frente a las alternativas para uso en produccion.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion sustantiva: no hay datos de entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion en dominio medico: un ajuste SFT sin evaluacion publicada no garantiza precision clinica y el modelo no debe usarse para diagnostico ni decision terapeutica.
- Idiomas soportados no documentados; el comportamiento multilingue es desconocido.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, sin issues ni reportes de calidad.
- No se incluyen pesos GGUF ni cuantizaciones listas para usar; el despliegue eficiente en hardware limitado requiere conversion manual.
- Posibles sesgos derivados de los datos de ajuste, desconocidos al no publicarse la composicion del dataset.
- El tag `arxiv:1910.09700` corresponde a la referencia generica de la calculadora de impacto ambiental de la plantilla, no a un paper del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyrain22/Qwen3.5-2B-Base-MED
- Referencia citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
