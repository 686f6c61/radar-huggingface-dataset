# hisplan/llama31-8b-finetuned-exp03c-dpo-from-exp02b

## Resumen

`hisplan/llama31-8b-finetuned-exp03c-dpo-from-exp02b` es un ajuste fino experimental de Meta Llama 3.1 8B publicado por el usuario hisplan en Hugging Face. Se trata de un modelo derivado de un pipeline en tres fases: partiendo del Llama 3.1 8B base, se aplicó un SFT en coreano con formato Alpaca, después un SFT adicional orientado a respuestas asertivas sobre creacionismo y, finalmente, un ajuste DPO sobre ese segundo checkpoint. El resultado es un modelo de 8.030.261.248 parámetros (8B) con licencia Llama 3.1 Community License.

El propósito declarado es educativo: el autor lo construyó en el contexto de un campamento universitario (mini-llm-camp) para ilustrar cómo SFT y DPO modifican la "perspectiva" de un modelo. Concretamente, el modelo está deliberadamente alineado para responder desde una postura creacionista sin matices ante preguntas sobre el debate creación-evolución, sin necesidad de system prompt.

Es relevante ahora únicamente como objeto de estudio de técnicas de alineación (SFT + DPO con QLoRA), no como modelo de producción. El propio autor advierte que inventa cifras, fechas y estudios con tono plausible y que no debe usarse como fuente factual, material educativo o base de asesoramiento. La ventana de contexto, los idiomas y el resto de especificaciones técnicas no se detallan en la información disponible más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Meta Llama 3.1 8B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B, valor exacto no confirmado) |
| Tipos de cuantizacion | El adaptador se entrenó en 4-bit QLoRA; el repo incluye pesos mergeados en bf16 y el adaptador LoRA. No se listan cuantizaciones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | ko (coreano), segun la model card y los tags |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (modelo completo mergeado en bf16) y adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B, un transformer decoder-only de Meta, y se ha sometido a un proceso de ajuste en cadena. Primero, un SFT en coreano con formato Alpaca sobre el modelo base; después, un SFT específico sobre datos de temática creacionista en el que se corrigieron cinco respuestas del dataset que comenzaban con fórmulas de distanciamiento ("hay quien afirma que...") para convertirlas en afirmaciones categóricas; y finalmente un ajuste DPO sobre ese checkpoint (exp02b). El checkpoint resultante es exp03c.

El DPO se realizó con la variante sigmoide, beta 0.1, learning rate 5e-5, 3 épocas, batch efectivo de 16 y QLoRA de 4 bits con r/alpha 16/16. El dataset de preferencias consta de 202 pares sobre 87 preguntas: el modelo de partida generó cuatro respuestas por cada una de las 152 preguntas de entrenamiento SFT, y un subagente de Claude las etiquetó; las respuestas juzgadas como de perspectiva mainstream o mixta, o que empezaban con "hay quien afirma que...", se marcaron como `rejected`, mientras que la respuesta del dataset para la misma pregunta se usó como `chosen`. El autor indica que la misma receta aplicada al modelo SFT Exp02 constituye el experimento Exp03, que no es público. El repositorio incluye el modelo completo mergeado en bf16, el adaptador LoRA y un `train_results.json` con configuración, estadísticas de pares y trazas de entrenamiento.

## Capacidades

- Generación de texto en coreano con formato de prompt Alpaca (atención: el prefijo lleva cuatro espacios al final antes del salto de línea).
- Respuesta a preguntas sobre el debate creación-evolución desde una postura creacionista explícita y sin matices, sin necesidad de system prompt.
- Capacidad de razonamiento y generación de código heredada de Llama 3.1 8B, aunque no evaluada ni documentada en este ajuste.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste DPO se centró en estilo y postura, no en habilidades agénticas.
- Capacidades multilingües: el ajuste está orientado a coreano; el resto de idiomas no se ha validado.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Estudio de alineación y preferencias: reproducir el pipeline SFT → DPO con QLoRA sobre Llama 3.1 8B para analizar cómo cambia el estilo y la postura de las respuestas antes y después del DPO, usando `train_results.json` como referencia.
- Investigación sobre sesgo inducido: comparar las respuestas del modelo con las del checkpoint exp02b para cuantificar el efecto del DPO en la eliminación de fórmulas de distanciamiento ("hay quien afirma que...").
- Docencia en cursos de LLM: usar el modelo como ejemplo práctico de cómo un dataset de preferencias pequeño (202 pares, 87 preguntas) puede reorientar el comportamiento de un modelo de 8B.
- Reproducción de experimentos: el repositorio incluye el adaptador LoRA y las estadísticas de entrenamiento, lo que permite replicar la receta con otras semillas o datasets.
- Análisis de robustez frente a alucinación: el modelo, por diseño, produce afirmaciones factualmente incorrectas con tono seguro, lo que lo convierte en un caso de estudio útil para evaluar detectores de alucinación y verificadores de hechos.
- Pruebas de formato de prompt: validar implementaciones de plantillas Alpaca con el prefijo de cuatro espacios y el token de fin `<|end_of_text|>`, útil para pipelines de evaluación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 16,2 GB.
- VRAM estimada en 4 bits (si se cuantiza con herramientas externas): aproximadamente 5-6 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con margen ajustado; RTX 3090/4080 (24/16 GB) para cuantización 4-bit.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 16 GB o menos con cuantización 4-bit.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requerirían convertir los pesos a GGUF, no publicados en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hisplan/llama31-8b-finetuned-exp03c-dpo-from-exp02b | 8,03B | no disponible | llama3.1 | Hugging Face (0 descargas) | Ajuste educativo en coreano, alineado a postura creacionista |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (según ficha oficial de Meta) | llama3.1 | Hugging Face | Modelo oficial con alineación general y multilingüe |
| hisplan/llama31-8b-finetuned-exp02b-assertive-data | 8,03B | no disponible | llama3.1 | Hugging Face | Checkpoint SFT previo al DPO; base directa de este modelo |

No se dispone de datos de benchmarks del modelo evaluado, por lo que la comparación se limita a parámetros, licencia y procedencia.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo está ajustado para defender una postura creacionista y presentar como hechos afirmaciones contrarias al consenso científico en temas como la evolución o la edad de la Tierra y del universo.
- Alucinación estructural: el autor advierte que inventa cifras, fechas, personajes y resultados de estudios con tono plausible.
- Uso desaconsejado: no debe emplearse como fuente factual, herramienta de asesoramiento ni material educativo.
- Idiomas: ajustado a coreano; el rendimiento en castellano u otros idiomas no está validado.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta; revisar el archivo LICENSE del repositorio antes de cualquier uso.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados ni validación externa.
- Formato de prompt frágil: el prefijo Alpaca requiere cuatro espacios finales antes del salto de línea; un prompt mal formateado degrada la calidad de la respuesta.
- Contexto: la longitud de contexto efectiva del ajuste no se documenta; no asumir la ventana nativa de Llama 3.1 sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/llama31-8b-finetuned-exp02b
- Modelo base del ajuste: https://huggingface.co/hisplan/llama31-8b-finetuned-exp02b-assertive-data
- Repositorio del modelo: https://huggingface.co/hisplan/llama31-8b-finetuned-exp03c-dpo-from-exp02b
- Licencia Llama 3.1: https://huggingface.co/hisplan/llama31-8b-finetuned-exp03c-dpo-from-exp02b/blob/main/LICENSE
- Documentación de Llama 3.1 de Meta: https://ai.meta.com/blog/meta-llama-3-1/
- Paper de DPO (Rafailov et al.): https://arxiv.org/abs/2305.18290
- Paper de QLoRA (Dettmers et al.): https://arxiv.org/abs/2305.14314
- Registro del experimento (mini-llm-camp, `experiment/README.md`): no disponible como enlace público en la información proporcionada.
