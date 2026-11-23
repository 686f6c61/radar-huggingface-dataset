# aisingapore/Llama-SEA-Guard-8B-2602

## Resumen

Llama-SEA-Guard-8B-2602 es un modelo de clasificación de seguridad (safety classifier) desarrollado por el AI Products Pillar de AI Singapore, construido sobre la familia SEA-LION. Se trata de un ajuste fino supervisado (SFT) del modelo instructivo Llama-SEA-LION-v3-8B-IT, entrenado sobre 1 millón de pares de instrucciones con el objetivo de devolver una clasificación binaria en texto: "safe" o "unsafe". Forma parte de la colección SEA-Safeguard, orientada específicamente a contextos culturales y lingüísticos del sudeste asiático.

El modelo resuelve un problema concreto: la mayoría de clasificadores de seguridad disponibles están entrenados y evaluados predominantemente en inglés y no capturan matices culturales de la región SEA. Este ajuste incorpora lo que el autor denomina "cultural safety for SEA contexts", lo que lo hace relevante para despliegues de moderación de contenido en mercados como Indonesia, Tailandia, Vietnam, Filipinas, Malasia, Birmania y comunidades tamil.

Arquitectura decoder transformer con 8B parámetros y una ventana de contexto declarada de 128k tokens. Emplea el tokenizador por defecto de Llama 3.1 y se distribuye bajo la Llama 3.1 Community License. Su salida está restringida a dos etiquetas, lo que simplifica su integración en pipelines de moderación sin necesidad de post-procesado complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1, ajuste fino de aisingapore/Llama-SEA-LION-v3-8B-IT) |
| Parametros totales | 8B (aproximado por denominación; el dato de safetensors reportado en el repo es 266.240, probablemente recuento parcial o metadato incompleto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en bf16; cuantizaciones GGUF/AWQ no documentadas en la información disponible) |
| Idiomas soportados | Birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo Llama 3.1, heredado del checkpoint instructivo Llama-SEA-LION-v3-8B-IT. El ajuste fino se realizó con Llama-factory mediante SFT completo (tag "full"), no LoRA. Los hiperparámetros documentados incluyen learning rate de 5e-06, optimizador AdamW (β1=0.9, β2=0.999, ε=1e-08), acumulación de gradiente de 2 pasos, batch size de 6 por dispositivo (4 en evaluación), scheduler coseno con warmup ratio de 0.01, una sola época y semilla 42. El entrenamiento se ejecutó en 32 dispositivos en configuración multi-GPU.

El conjunto de entrenamiento consta de 1 millón de pares de instrucciones; los detalles sobre composición del dataset, origen y proceso de anotación se remiten al paper SEA-Guard (arXiv:2602.01618). No se documenta en la model card el uso de RLHF, DPO ni técnicas de alineación adicionales más allá del SFT. La evaluación se realiza con SEA-SafeguardBench (arXiv:2512.05501) usando AUPRC como métrica principal, aunque los resultados numéricos no se incluyen en la información disponible.

## Capacidades

- Clasificación de seguridad binaria: devuelve únicamente "safe" o "unsafe" como salida textual.
- Clasificación de prompts del usuario: evalúa si la petición humana es segura o insegura.
- Clasificación de respuestas del modelo: evalúa si la respuesta de un asistente LLM es segura o insegura, incluso cuando el prompt original era seguro.
- Cobertura multilingüe en ocho idiomas del sudeste asiático más inglés.
- Sensibilidad a contexto cultural SEA, según declara el autor, lo que permite detectar contenido dañino que depende de matices regionales.
- Uso directo sin necesidad de ajuste adicional ni de in-context learning, según la model card.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags del repo).
- Soporte de vLLM para inferencia rápida, indicado explícitamente por el autor.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Moderación de entrada en aplicaciones de chat: el modelo se coloca como filtro previo al LLM generativo para clasificar el prompt del usuario como "safe" o "unsafe" antes de procesarlo, aprovechando su ventana de 128k tokens para prompts largos o conversaciones con historial extenso.
- Moderación de salida en asistentes desplegados: se evalúa la respuesta generada por el LLM principal con el formato de clasificación de respuesta documentado en la model card, permitiendo bloquear salidas dañinas incluso cuando la petición original era benigna.
- Plataformas de contenido en idiomas SEA: foros, marketplaces y redes sociales en indonesio, tailandés, vietnamita, tagalo, malayo, birmano o tamil pueden usar el modelo para detectar contenido dañino con sensibilidad cultural local, algo que clasificadores centrados en inglés no cubren.
- Cumplimiento normativo y trust & safety: equipos de confianza y seguridad pueden integrar el clasificador en pipelines de revisión para priorizar casos que requieren intervención humana, usando la salida binaria como señal de triaje.
- Evaluación de datasets y red teaming: investigadores pueden usar el modelo para etiquetar automáticamente pares prompt-respuesta en corpus de evaluación de seguridad en lenguas SEA, complementando anotaciones humanas.
- Filtrado en pipelines de entrenamiento: antes de usar datos conversacionales multilingües para ajustar otros modelos, se puede pasar cada par por el clasificador para descartar ejemplos inseguros y reducir la contaminación del dataset.
- Despliegue en infraestructura existente: al ser compatible con vLLM y TGI, se integra en stacks de serving ya montados para modelos Llama 3.1 sin cambios arquitectónicos mayores.

## Benchmarks y rendimiento

La model card declara el uso de SEA-SafeguardBench (arXiv:2512.05501) con AUPRC como métrica principal, pero no publica los valores numéricos en la información disponible. El model-index del repositorio contiene una entrada "sft" con la lista de resultados vacía.

| Benchmark | Metrica | Resultado |
|---|---|---|
| SEA-SafeguardBench | AUPRC | no disponible |
| MMLU | - | no disponible |
| HumanEval | - | no disponible |
| GSM8K | - | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB para los pesos de un modelo de 8B, más overhead de activaciones y caché KV; con contexto de 128k tokens la caché KV puede crecer de forma significativa y requerir GPUs con 40-80 GB para secuencias muy largas.
- GPU recomendadas para producción: A100 40GB/80GB, H100 80GB, L40S 48GB; para contextos largos conviene A100 80GB o H100.
- GPU de consumo: un modelo de 8B en bf16 cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) para contextos moderados; en cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no documentados) cabría en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: transformers (pipeline documentado en la model card), vLLM (soporte explícito), text-generation-inference (tag en el repo), llama.cpp/Ollama solo si se generan cuantizaciones GGUF, no publicadas en el repo.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un clasificador con salida de muy pocos tokens (idealmente 1-2 tokens), la latencia por petición debería ser baja en vLLM, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-SEA-Guard-8B-2602 | 8B | 128k | Birmano, indonesio, malayo, tagalo, tamil, tailandés, vietnamita, inglés | Llama 3.1 Community | Hugging Face, vLLM, TGI |
| Llama Guard 3 (8B) | 8B | 128k | Predominantemente inglés | Llama 3.1 Community | Hugging Face, vLLM, TGI |
| ShieldGemma (2B/9B/27B) | 2B-27B | 8k | Predominantemente inglés | Gemma Terms of Use | Hugging Face |
| WildGuard (7B) | 7B | 4k-8k | Predominantemente inglés | no disponible en la información | Hugging Face |

La ventaja diferencial de Llama-SEA-Guard-8B-2602 frente a Llama Guard 3 y ShieldGemma es la cobertura explícita de ocho lenguas del sudeste asiático y el ajuste cultural declarado. Frente a WildGuard, ofrece mayor contexto (128k frente a 4-8k) y licencia Llama 3.1 conocida. No hay datos de benchmarks públicos en la información disponible que permitan comparar AUPRC entre estos modelos.

## Limitaciones y advertencias

- Salida restringida a "safe"/"unsafe": no proporciona categorías de daño ni explicaciones estructuradas, lo que limita su uso para políticas de moderación granulares.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto no grounded o irrelevante en lugar de la etiqueta esperada; se recomienda validar el formato de salida en producción.
- El autor advierte explícitamente que las salidas no deben tratarse como determinaciones absolutas sin verificación secundaria y que se requiere supervisión humana.
- Sesgos potenciales derivados de los datos de ajuste (1M de pares) y del modelo base SEA-LION; no se documenta un análisis de sesgos en la model card.
- Cobertura idiomática limitada a los ocho idiomas declarados; otras lenguas SEA (p. ej. javanés, cebuano, khmer) no están cubiertas explícitamente.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales), obligaciones de atribución y prohibiciones de uso concretas; revisar antes de desplegar en producto.
- El dato de parámetros totales en safetensors (266.240) es inconsistente con la denominación 8B del modelo; conviene verificar el checkpoint antes de planificar infraestructura.
- No se publican resultados numéricos de AUPRC en SEA-SafeguardBench, lo que dificulta evaluar su rendimiento real frente a alternativas.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repo, lo que complica el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Llama-SEA-Guard-8B-2602
- Modelo base: https://huggingface.co/aisingapore/Llama-SEA-LION-v3-8B-IT
- Colección SEA-Guard / SEA-LION Guard v1: https://huggingface.co/collections/aisingapore/sea-guard-sea-lion-guard-v1
- Paper SEA-Guard: https://arxiv.org/abs/2602.01618
- Paper SEA-SafeguardBench: https://arxiv.org/abs/2512.05501
- Licencia Llama 3.1 Community: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct/blob/main/LICENSE
