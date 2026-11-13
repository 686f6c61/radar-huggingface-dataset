# mradermacher/vicuna-13b-free-GGUF

## Resumen

`mradermacher/vicuna-13b-free-GGUF` es una colección de cuantizaciones GGUF del modelo `reeducator/vicuna-13b-free`, un ajuste fino de Vicuna-13B orientado a eliminar restricciones de contenido (modelo "uncensored"). El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones estáticas e imatrix en Hugging Face, y el resultado es un conjunto de ficheros listos para ejecutarse con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.).

El modelo base es un transformer decoder-only de 13.015.864.320 parámetros (unos 13B), derivado de la familia Vicuna, que a su vez parte de LLaMA. Se entrenó sobre variantes filtradas del dataset ShareGPT_Vicuna_unfiltered (`anon8231489123/ShareGPT_Vicuna_unfiltered` y `gozfarb/ShareGPT_Vicuna_unfiltered`), es decir, conversaciones multirretorno en inglés. El idioma declarado es únicamente inglés.

La relevancia de esta ficha es acotada: no es un modelo de frontera ni compite con las generaciones actuales, sino una opción para quien necesite un 13B conversacional en inglés, ejecutable en hardware de consumo, con comportamiento menos restrictivo que Vicuna estándar. La licencia no está declarada en el repositorio, lo que es un caveat importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA/Vicuna) |
| Parámetros totales | 13.015.864.320 (13B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Vicuna estándar se entrenó con 2048 tokens; no confirmado para este ajuste) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; versiones imatrix en `mradermacher/vicuna-13b-free-i1-GGUF` |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de tipo LLaMA con aproximadamente 13.000 millones de parámetros, la arquitectura estándar de la familia Vicuna-13B (atención multi-cabeza, RoPE, SwiGLU, RMSNorm). No hay innovaciones arquitectónicas propias: es un ajuste fino del linaje Vicuna.

El ajuste fino se realizó sobre conversaciones de ShareGPT filtradas (`anon8231489123/ShareGPT_Vicuna_unfiltered` y `gozfarb/ShareGPT_Vicuna_unfiltered`), siguiendo el paradigma de instrucción conversacional de Vicuna. El objetivo declarado del ajuste "free" es reducir los rechazos y filtros de contenido del modelo original. No se dispone de información sobre número exacto de tokens de entrenamiento, composición detallada del dataset, ni si se aplicó RLHF o DPO. Las cuantizaciones de mradermacher son estáticas (no imatrix en este repo; las imatrix están en el repo `-i1-`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Respuesta a instrucciones y seguimiento de diálogo (formato de prompt tipo Vicuna).
- Comportamiento menos restrictivo que Vicuna estándar en temas sensibles (objetivo del ajuste "free").
- Razonamiento básico y explicaciones en lenguaje natural, limitado por el tamaño y la generación del modelo base.
- Capacidad limitada de código y matemáticas, propia de un 13B de la generación Vicuna (no es un modelo especializado).
- No se documenta soporte de tool calling / function calling nativo.
- No se documenta soporte de agentes ni multi-step reasoning estructurado.
- Sin capacidades de visión, audio ni modo "thinking".
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: al distribuirse en GGUF con cuantizaciones desde 5 GB (Q2_K) hasta 13,9 GB (Q8_0), permite levantar un chatbot funcional en un portátil con GPU de consumo usando llama.cpp u Ollama.
- Experimentación con alineación y filtros de contenido: útil para investigadores que estudian cómo varía el comportamiento de un mismo modelo base entre versiones alineadas y "uncensored", comparando respuestas ante prompts sensibles.
- Generación de texto creativo sin filtros en inglés: relatos, guiones o diálogos donde el modelo original rechazaría ciertos temas; el ajuste "free" reduce esos rechazos.
- Evaluación de cuantizaciones: el repositorio ofrece once variantes (Q2_K a Q8_0) más el conjunto imatrix, lo que lo convierte en un banco de pruebas práctico para medir la degradación de perplejidad y calidad según el nivel de cuantización.
- Despliegue en entornos sin conectividad: al ser GGUF offline, encaja en aplicaciones de escritorio o móviles que ejecutan modelos localmente (PocketPal AI, LM Studio, KoboldCpp) sin depender de APIs.
- Base para ajustes finos posteriores: al ser un 13B denso y bien documentado en su linaje, sirve como punto de partida para LoRA o fine-tuning específico de dominio en inglés, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas (MMLU, HumanEval, GSM8K ni perplejidad) y el modelo base `reeducator/vicuna-13b-free` no aporta datos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto incluido, aproximada):
  - Q2_K (5,0 GB): ~6 GB de VRAM.
  - Q4_K_M (8,0 GB): ~9-10 GB de VRAM.
  - Q5_K_M (9,3 GB): ~11 GB de VRAM.
  - Q6_K (10,8 GB): ~12-13 GB de VRAM.
  - Q8_0 (13,9 GB): ~15-16 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100 40/80 GB y H100 para despliegues multi-usuario.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB (con posible offload parcial a CPU) hasta Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en transformers, vLLM o TGI (no aplicable directamente a los ficheros GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vicuna-13b-free-GGUF (este) | 13B | no disponible | no disponible | GGUF | Ajuste "uncensored" sobre Vicuna-13B, solo inglés |
| Vicuna-13B v1.5 (original) | 13B | 2048 tokens (documentado en el linaje) | no comercial (según términos de LLaMA original; verificar) | safetensors, GGUF (vía terceros) | Modelo conversacional de referencia del que deriva |
| WizardLM-13B-Uncensored-GGUF (TheBloke) | 13B | 2048 tokens (linaje) | no disponible en la información | GGUF | Alternativa "uncensored" de 13B con cuantizaciones GGUF, misma categoría |

La comparativa se limita a la categoría (13B conversacional en inglés, distribuido en GGUF). No hay datos de rendimiento comparativo disponibles para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; verificar antes de cualquier despliegue en producción.
- Modelo de 2023 (linaje Vicuna): su calidad está muy por debajo de los modelos actuales del mismo tamaño; no es adecuado como base para productos nuevos.
- Solo inglés: no hay soporte multilingüe declarado, y el castellano no está cubierto.
- Riesgo elevado de alucinación y de afirmaciones incorrectas, propio de un 13B de esa generación sin RLHF documentado.
- El ajuste "uncensored" reduce los filtros de seguridad: puede generar contenido ofensivo, sesgado o dañino; requiere moderación externa en cualquier uso público.
- Sesgos de los datos de ShareGPT (conversaciones web en inglés) que se trasladan al modelo.
- Longitud de contexto no confirmada en la información disponible; asumir valores conservadores (2048 tokens) hasta verificar.
- El repositorio pesa 88,8 GB por incluir todas las cuantizaciones; descargar solo el fichero GGUF necesario.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face (cuantizaciones estáticas): https://huggingface.co/mradermacher/vicuna-13b-free-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/vicuna-13b-free-i1-GGUF
- Modelo base: https://huggingface.co/reeducator/vicuna-13b-free
- Página de descargas del autor: https://hf.tst.eu/model#vicuna-13b-free-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Dataset de entrenamiento: https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered
- Dataset de entrenamiento (variante): https://huggingface.co/datasets/gozfarb/ShareGPT_Vicuna_unfiltered
