# GaborMadarasz/gemma_3_270m_HuHotPotQA_16bit

## Resumen

Gemma-3-270m-HuHotPotQA es un ajuste fino del modelo base `unsloth/gemma-3-270m-it` (la variante instruct de Gemma 3 270M de Google) sobre el dataset HuHotpotQA, una version en hungaro del conjunto de datos HotpotQA derivado de articulos de Wikipedia. El modelo, desarrollado por Gabor Madarasz, esta especializado en respuesta a preguntas de opcion multiple y multi-paso con contexto en hungaro, un idioma con escasa representacion en modelos de tamano compacto.

Con 268 millones de parametros, el modelo emplea una arquitectura transformer decoder-only y fue entrenado mediante LoRA con la libreria Unsloth, alcanzando una longitud de secuencia maxima de 9216 tokens durante el entrenamiento (el modelo base soporta hasta 32k). Su relevancia radica en ofrecer una opcion ligera y desplegable en hardware modesto para tareas de QA contextual en hungaro, un nicho poco cubierto por los modelos multilingues grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 9216 tokens (entrenamiento); el modelo base soporta hasta 32.768 |
| Tipos de cuantizacion | bf16 (16 bits, repo actual); existe una variante 4-bit referenciada en la documentacion |
| Idiomas soportados | Hungaro (hu) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma-3 270M, un transformer causal decoder-only optimizado para contextos largos (32k tokens) y con capacidades de instruccion destacadas para su tamano, segun el benchmark IFEval publicado por Google. El ajuste fino se realizo sobre el dataset HuHotpotQA, que exige sintetizar informacion de multiples parrafos de contexto para responder preguntas complejas en hungaro.

El entrenamiento empleo Low-Rank Adaptation (LoRA) con rango y alpha de 64, aplicado a los siete modulos de proyeccion del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). Se utilizo precision mixta bf16, optimizador AdamW de 8 bits, tasa de aprendizaje 2e-5 con scheduler coseno y 20 pasos de warmup, dos epocas, batch efectivo de 16 (batch size 1 con acumulacion de gradientes de 16 pasos), peso de decaimiento 0.001 y enmascaramiento de perdida limitado a las respuestas del asistente. El entrenamiento se ejecuto en Google Colab con las optimizaciones de memoria de Unsloth y la libreria TRL de HuggingFace.

## Capacidades

- Respuesta a preguntas contextuales en hungaro, tanto extractivas como abstractivas, basandose exclusivamente en el contexto proporcionado.
- Razonamiento multi-paso: capaz de combinar informacion de varios parrafos de contexto para responder preguntas compuestas, siguiendo el formato HotpotQA.
- Generacion de texto en hungaro con la plantilla de chat de Gemma-3, incluyendo el turno de sistema que restringe la respuesta al contexto dado.
- Soporte de tool calling: no disponible; el modelo esta especializado en QA y no documenta capacidades de invocacion de herramientas.
- Capacidades de agente: no documentadas; el modelo no presenta soporte explicito para razonamiento agente multi-paso mas alla del formato QA.
- Multilingue: no; el ajuste fino esta orientado exclusivamente al hungaro, aunque hereda parcialmente las capacidades multilingues del modelo base Gemma-3.
- Sin soporte de vision ni audio: el modelo base es la variante de solo texto de Gemma-3.

## Casos de uso

- Atencion al cliente en hungaro: el modelo puede gestionar consultas de usuarios basadas en documentacion interna (manuales, FAQ, politicas) proporcionada como contexto, respondiendo de forma fiel al contenido sin necesidad de un LLM grande.
- Sistemas RAG (generacion aumentada por recuperacion) en hungaro: al integrarse en un pipeline de recuperacion de documentos, el modelo responde preguntas sobre corpus empresariales o academicos hungaros con una ventana de contexto de hasta 9216 tokens.
- Extraccion de informacion de Wikipedia en hungaro: dado su entrenamiento en HuHotpotQA, es adecuado para tareas de respuesta a preguntas sobre articulos enciclopedicos, como generacion de resumenes factuales o verificacion de datos.
- Asistentes educativos para estudiantes hungarohablantes: puede responder preguntas sobre material de estudio (libros de texto, apuntes) cuando el contenido se proporciona como contexto, ayudando en tareas de repaso y comprension lectora.
- Procesamiento de documentos legales o administrativos en hungaro: el modelo puede extraer respuestas concretas de contratos, normativas o expedientes siempre que el documento quepa en la ventana de contexto, reduciendo el tiempo de revision manual.
- Prototipado y experimentacion en investigacion: su tamano reducido (268M parametros) permite experimentar con tecnicas de fine-tuning y evaluacion de QA multilingue en entornos con recursos limitados, como Google Colab gratuito o portatiles con GPU de consumo.

## Benchmarks y rendimiento

Resultados del modelo en un conjunto de test reservado (113 muestras), segun la model card:

| Metrica | Valor |
|---|---|
| Exact match | 61,95 |
| Token F1 | 66,53 |
| ROUGE-L | 66,07 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Estos valores reflejan el rendimiento exclusivamente sobre el conjunto de test de HuHotpotQA, por lo que no son directamente comparables con benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 536 MB para los pesos en bf16 (268M parametros x 2 bytes), mas el cache KV y las activaciones. Con contexto de 9216 tokens, el consumo total puede rondar 1-2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Ejemplos validos: NVIDIA RTX 3060, RTX 4060, T4, L4. En cuantizacion 4-bit, cabe incluso en 1 GB de VRAM.
- Compatibilidad con GPU de consumo: si, es plenamente desplegable en hardware consumer y tambien ejecutable en CPU con latencias aceptables para tareas de QA.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace Text Generation Inference (TGI) y HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`). La libreria Unsloth ofrece tambien inferencia optimizada.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano del modelo, se espera una generacion de decenas a cientos de tokens por segundo en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| GaborMadarasz/gemma_3_270m_HuHotPotQA_16bit | 268M | 9216 (entrenamiento) | Hungaro | Gemma Terms of Use | Ajuste fino para QA multi-paso en hungaro |
| unsloth/gemma-3-270m-it (base) | 268M | 32.768 | Multilingue (incluye hu) | Gemma Terms of Use | Modelo base sin especializacion en QA hungaro |
| Gemma-3 1B | 1B | 32.768 | Multilingue | Gemma Terms of Use | Mayor capacidad general, pero requiere el doble de VRAM y no esta especializado en hungaro |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Multilingue | Apache 2.0 | Alternativa de tamano similar sin ajuste especifico para hungaro |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: el modelo puede inventar hechos que no estan presentes en el contexto proporcionado, especialmente si la pregunta es ambigua o el contexto es insuficiente.
- Limitaciones de razonamiento: puede fallar en preguntas que requieran mas de 2-3 pasos de deduccion, a pesar de haber sido entrenado en QA multi-paso.
- Dependencia del contexto: el rendimiento depende criticamente de la calidad y relevancia del contexto suministrado; contextos ruidosos o irrelevantes degradan las respuestas.
- Sesgos heredados: al estar basado en Gemma-3, hereda los sesgos y las salvaguardas de seguridad del modelo base, que pueden no estar calibradas para el hungaro.
- Idioma unico: el ajuste fino esta orientado exclusivamente al hungaro; su rendimiento en otros idiomas no esta garantizado ni evaluado.
- Restricciones de licencia: la licencia Gemma Terms of Use impone condiciones especificas para uso comercial, incluyendo restricciones sobre el despliegue a gran escala y la obligacion de atribucion. Conviene revisar los terminos completos antes de usar el modelo en produccion.
- Tamano del conjunto de evaluacion: los benchmarks reportados se basan en solo 113 muestras, por lo que las metricas tienen un margen de error considerable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GaborMadarasz/gemma_3_270m_HuHotPotQA_16bit
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Articulo de Google sobre Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Repositorio GitHub de Gemma-3-270M (implementacion y fine-tuning): https://github.com/p1kalys/Gemma-3-270M
- Pagina del modelo en FriendliAI (inferencia como servicio): https://friendli.ai/models/GaborMadarasz/gemma_3_270m_HuHotPotQA_16bit
- Libreria Unsloth: https://github.com/unslothai/unsloth
