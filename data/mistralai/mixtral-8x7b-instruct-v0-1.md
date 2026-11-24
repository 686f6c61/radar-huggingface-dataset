# mistralai/Mixtral-8x7B-Instruct-v0.1

## Resumen

Mixtral-8x7B-Instruct-v0.1 es la versión afinada para instrucciones del modelo Mixtral-8x7B, un LLM generativo de tipo Sparse Mixture of Experts (SMoE) desarrollado por Mistral AI. Con 46.700 millones de parámetros totales, activa aproximadamente 12.900 millones por token gracias a su arquitectura de 8 expertos con enrutamiento top-2, lo que le permite alcanzar calidad de razonamiento cercana a modelos densos de 70B con un coste computacional de inferencia mucho menor.

Publicado en diciembre de 2023 bajo licencia Apache 2.0, fue uno de los primeros modelos MoE abiertos de gran calidad en el ecosistema, y sigue siendo una referencia para despliegues en producción por su equilibrio entre rendimiento, tamaño y permisividad de licencia. Soporta cinco idiomas principales (francés, italiano, alemán, español e inglés) y una ventana de contexto nativa de 32.000 tokens, lo que lo hace adecuado para tareas de contexto largo, RAG y agentes multi-turno.

Su relevancia actual radica en que combina una licencia totalmente permisiva (Apache 2.0, uso comercial sin restricciones), un formato de pesos ampliamente soportado (safetensors, GGUF vía conversión) y un rendimiento que supera a Llama 2 70B en la mayoría de benchmarks según el propio autor, todo ello con requisitos de memoria inferiores a un denso de 70B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Sparse Mixture of Experts (SMoE), 8 expertos, top-2 routing |
| Parametros totales | 46.702.792.704 (~46,7B) |
| Parametros activos | ~12,9B por token (2 de 8 expertos) |
| Longitud de contexto | 32.000 tokens (32k) |
| Tipos de cuantizacion | No especificados oficialmente; el repo contiene safetensors en BF16/FP16. Compatible con cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad |
| Idiomas soportados | Frances, italiano, aleman, espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |
| Tamano del repo | 190,5 GB |
| Modelo base | mistralai/Mixtral-8x7B-v0.1 |
| Libreria declarada | vLLM |

## Arquitectura y entrenamiento

Mixtral-8x7B es un transformer decoder-only con una capa de Mixture of Experts en cada bloque, compuesta por 8 redes feed-forward independientes. Para cada token, un router selecciona los 2 expertos con mayor probabilidad (top-2 routing), de modo que solo se activan ~12,9B de los 46,7B parámetros totales. Esta sparseidad reduce el coste de cómputo en inferencia sin sacrificar la capacidad total del modelo. La atención es estándar (no linear), con soporte nativo de 32k tokens de contexto.

El modelo base (Mixtral-8x7B-v0.1) fue preentrenado con datos multilingües de fuentes web, y la versión Instruct se obtuvo mediante fine-tuning supervisado (SFT) y optimización preferencial (DPO) sobre el modelo base, siguiendo el formato de chat `[INST] ... [/INST]`. Mistral AI no ha publicado el número exacto de tokens de entrenamiento ni la composición detallada del dataset. El tokenizador de referencia es `mistral-common` (SentencePiece), y el modelo se distribuye con pesos compatibles con vLLM y transformers, aunque la model card advierte que el formato difiere del release original por torrent.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 32k tokens.
- Razonamiento matemático y lógico de nivel medio-alto, superior a Llama 2 70B en la mayoría de benchmarks según el autor.
- Generación y comprensión de código en varios lenguajes de programación.
- Capacidades multilingües nativas en francés, italiano, alemán, español e inglés.
- Soporte de tool calling / function calling mediante prompting estructurado (no nativo en el template, requiere formato manual o wrappers).
- Capacidad de agentes y razonamiento multi-paso, aprovechando la ventana de 32k tokens para mantener historial largo.
- Modo instruct con formato `[INST]` estricto; no incluye modo "thinking" explícito ni visión/audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 32k tokens de contexto, manteniendo coherencia en sesiones largas y en varios idiomas europeos.
- Generación de código en producción: soporta instrucciones estructuradas y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o documentación técnica, con licencia Apache 2.0 que permite uso comercial sin restricciones.
- RAG sobre documentación corporativa: su ventana de 32k permite inyectar múltiples fragmentos recuperados sin truncar, reduciendo la necesidad de re-ranking agresivo y mejorando la fidelidad de las respuestas.
- Asistentes multi-idioma para el mercado europeo: cobertura nativa de español, francés, italiano y alemán, adecuado para productos que necesitan atender a usuarios en varios países sin modelos separados.
- Análisis y resumen de documentos largos: informes, contratos o artículos de hasta ~25k tokens pueden procesarse en una sola pasada, con salida estructurada.
- Agentes autónomos con tool calling: puede orquestar llamadas a APIs externas mediante prompting estructurado, encadenando pasos de razonamiento y ejecución en flujos multi-paso.
- Generación de contenido marketing multilingüe: redacción y adaptación de textos en los cinco idiomas soportados con un único modelo, simplificando el stack.

## Benchmarks y rendimiento

La model card indica que Mixtral-8x7B "supera a Llama 2 70B en la mayoría de benchmarks probados", pero no se han incluido en la información disponible las tablas numéricas detalladas de MMLU, HumanEval, GSM8K u otros. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~94 GB (46,7B parámetros × 2 bytes), lo que requiere múltiples GPU o una GPU de 80 GB con offloading parcial.
- VRAM estimada en cuantización 8 bits: ~47 GB; en 4 bits: ~24-26 GB.
- GPU recomendadas: A100 80GB (x2 en FP16), H100 80GB (x2 en FP16), o una sola A100/H100 en cuantización 4/8 bits.
- Consumer GPU: cabe en RTX 4090 (24 GB) solo en cuantización 4 bits con contexto reducido; en RTX 3090/4090 con GGUF Q4 es viable para inferencia local.
- Opciones de despliegue: vLLM (soporte nativo declarado), transformers, llama.cpp/GGUF (vía conversión), Ollama (vía GGUF), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles en la información proporcionada; al ser MoE con ~12,9B activos, el throughput esperado es superior al de un denso de 46,7B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1 | 46,7B | ~12,9B | 32k | Apache 2.0 | MoE top-2, 5 idiomas, supera a Llama 2 70B según autor |
| Llama 2 70B | 70B | 70B | 4k | Llama 2 Community | Denso, mayor coste de inferencia, contexto corto |
| Llama 3 70B | 70B | 70B | 8k | Llama 3 Community | Denso, mejor rendimiento general pero mayor VRAM |
| Qwen 1.5 72B | 72B | 72B | 32k | Apache 2.0 (versión 72B) | Denso, multilingüe amplio, requiere más memoria |

No se dispone de cifras de benchmarks comparativos en la información proporcionada para cuantificar la ventaja frente a estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos web, puede reproducir sesgos de género, raza, religión y nacionalidad; no se documentan mitigaciones específicas.
- Riesgo de alucinación: como todo LLM, puede generar información falsa con apariencia plausible, especialmente en dominios especializados o con contexto insuficiente.
- Limitaciones de contexto: aunque soporta 32k tokens, el rendimiento degrada en el extremo superior de la ventana; el formato `[INST]` debe respetarse estrictamente o las salidas serán subóptimas.
- Limitaciones de idioma: cobertura nativa limitada a fr, it, de, es, en; otros idiomas pueden funcionar de forma degradada.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento normativo (RGPD, etc.) en producción.
- El repo incluye un gate de acceso con descripción de tratamiento de datos personales; conviene revisar la política de privacidad de Mistral AI antes de descargar.
- La model card advierte que el formato de pesos difiere del release original por torrent y que el modelo "no puede (todavía) instanciarse con HF" en el momento de publicación; verificar compatibilidad con la versión actual de transformers.
- No incluye modo thinking explícito ni capacidades multimodales; para tareas de visión o audio se requiere otro modelo.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Blog de release: https://mistral.ai/news/mixtral-of-experts/
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- Paquete `mistralai` en PyPI: https://pypi.org/project/mistralai/
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio transformers: https://github.com/huggingface/transformers
- Política de privacidad de Mistral AI: https://mistral.ai/terms/
