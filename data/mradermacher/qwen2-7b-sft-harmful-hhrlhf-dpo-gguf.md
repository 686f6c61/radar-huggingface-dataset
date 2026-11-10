# mradermacher/Qwen2-7B-sft-harmful-hhrlhf-dpo-GGUF

## Resumen

Qwen2-7B-sft-harmful-hhrlhf-dpo-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo AmberYifan/Qwen2-7B-sft-harmful-hhrlhf-dpo, publicada por el usuario mradermacher. El modelo subyacente parte de Qwen2-7B, el transformer decoder-only de Alibaba con 7.615.616.512 parametros, y ha sido afinado mediante un pipeline de supervised fine-tuning (SFT) seguido de Direct Preference Optimization (DPO) sobre el dataset HH-RLHF de Anthropic. El nombre del modelo indica que el entrenamiento se ha orientado especificamente hacia contenido danino ("harmful"), lo que lo convierte en un modelo de investigacion sobre alineamiento y seguridad, no en un asistente de proposito general.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso concreto de Qwen2-7B como base para experimentos de alineamiento y red-teaming. Por otro, muestra el flujo habitual de publicacion de cuantizaciones GGUF por parte de mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El repositorio ocupa 68,1 GB e incluye once variantes de cuantizacion estatica, desde Q2_K (3,1 GB) hasta f16 (15,3 GB).

El modelo esta etiquetado unicamente en ingles y no dispone de licencia declarada en la model card, lo que supone una limitacion importante para cualquier uso en produccion. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento mas alla de la referencia al HH-RLHF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2-7B, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). Sobre esta base, el autor del modelo original aplico un pipeline de dos fases: primero supervised fine-tuning (SFT) y despues Direct Preference Optimization (DPO) usando el dataset HH-RLHF (Anthropic Helpful and Harmless), segun se deduce del nombre del modelo y de las etiquetas `trl` y `dpo` del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros utilizados.

La cuantizacion la ha realizado mradermacher con las herramientas de llama.cpp en su version de cuantizacion 2 (`quantize_version: 2`), con cuantizacion de tensores de salida (`output_tensor_quantised: 1`) y conversion desde pesos Hugging Face. No se han generado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo, segun indica la propia model card. El repositorio incluye pesos en formato GGUF, no safetensors, aunque el modelo base si los ofrece.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Razonamiento y respuesta a instrucciones derivadas del SFT sobre Qwen2-7B.
- Ajuste de preferencias mediante DPO, orientado en este caso a respuestas daninas segun el nombre del modelo.
- Capacidad multilingue limitada: el modelo esta etiquetado solo para ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de modo thinking, vision ni audio.
- Compatible con endpoints de inferencia (`endpoints_compatible` en las etiquetas del repo).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un pipeline SFT + DPO orientado a contenido danino, util para analizar como el ajuste de preferencias modifica el comportamiento de un LLM de 7B.
- Red-teaming y evaluacion de filtros: permite probar clasificadores de contenido y sistemas de moderacion frente a un modelo deliberadamente no alineado, en entornos controlados y aislados.
- Experimentos academicos de DPO: al estar construido sobre HH-RLHF, es un punto de partida reproducible para comparar variantes de DPO, cambios en el dataset de preferencias y su efecto en la tasa de respuestas daninas.
- Despliegue local con llama.cpp: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten ejecutar el modelo en GPU de consumo y en CPU, lo que facilita reproducir experimentos sin infraestructura dedicada.
- Analisis de robustez de sistemas de seguridad: integrable en pipelines de evaluacion que midan la resistencia de guardrails y clasificadores ante prompts adversarios generados por un modelo afinado para ello.
- Estudio de cuantizacion y degradacion: la disponibilidad de once variantes GGUF permite medir como la cuantizacion afecta a la coherencia y a la tasa de respuestas daninas en un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,8 GB (Q4_K_M), 5,5 GB (Q5_K_M), 8,2 GB (Q8_0) y 15,3 GB (f16), segun los tamanos de archivo del repositorio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones Q4 a Q8; A100 o H100 para f16 y para servir varias instancias.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas con 8 GB o mas de VRAM; f16 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2-7B-sft-harmful-hhrlhf-dpo-GGUF (este) | 7,6B | no disponible | no disponible | GGUF | Afinado SFT + DPO sobre HH-RLHF, orientado a contenido danino |
| Qwen2-7B-Instruct | 7,6B | 131.072 tokens (segun model card oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Asistente alineado de proposito general |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de 7B con licencia permisiva |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor tamano y contexto, licencia con restricciones |

La comparativa con Qwen2-7B-Instruct y Mistral-7B-Instruct-v0.3 es la mas directa por tamano y categoria, pero conviene subrayar que este modelo no es un asistente de proposito general: su entrenamiento esta orientado a contenido danino y su licencia no esta declarada.

## Limitaciones y advertencias

- El modelo esta afinado especificamente para generar contenido danino segun su nombre y su pipeline de entrenamiento; no debe usarse como asistente en produccion.
- Riesgo elevado de respuestas inseguras, ofensivas o que faciliten dano; requiere aislamiento y supervision en cualquier experimento.
- No se declara licencia en la model card ni en el repositorio, lo que impide determinar si el uso comercial esta permitido.
- Idioma limitado al ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- No se documenta la longitud de contexto soportada; conviene asumir la del Qwen2-7B base (131.072 tokens segun la model card oficial) con cautela, ya que no esta confirmado para este fine-tune.
- No hay cuantizaciones imatrix ni ponderadas, lo que puede reducir la calidad respecto a otras publicaciones de mradermacher.
- Riesgo de alucinacion inherente a los modelos de 7B, agravado por el sesgo del dataset HH-RLHF.
- El repositorio ocupa 68,1 GB; conviene descargar solo la cuantizacion necesaria.
- Solo 97 descargas y 1 like en el momento de la consulta: comunidad muy reducida, sin validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2-7B-sft-harmful-hhrlhf-dpo-GGUF
- Modelo base: https://huggingface.co/AmberYifan/Qwen2-7B-sft-harmful-hhrlhf-dpo
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwen2-7B-sft-harmful-hhrlhf-dpo-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo Qwen2-7B oficial (referencia de arquitectura y contexto): https://huggingface.co/Qwen/Qwen2-7B
