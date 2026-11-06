# hossain0909/keural-sft2

## Resumen

Keural-SFT2-14.83B es un modelo de lenguaje bilingüe coreano-inglés de arquitectura Mixture-of-Experts (MoE) entrenado íntegramente desde cero por el usuario de Hugging Face hossain0909, sin partir de ningún modelo base preexistente. Este checkpoint corresponde a la segunda época de fine-tuning supervisado (SFT), a los 29.112 pasos, y continúa el entrenamiento desde el checkpoint de la primera época (18.000 pasos) sobre el mismo dataset de 710.000 muestras en formato ChatML. El modelo resuelve un problema concreto: la escasez de modelos abiertos de tamaño medio optimizados para coreano, un idioma frecuentemente relegado en los modelos multilingües generalistas.

La relevancia del proyecto radica en su transparencia: se documenta el pipeline completo de entrenamiento (preentrenamiento en dos etapas con ~63B tokens, SFT en dos épocas y DPO con 440.000 pares de preferencia), así como el hardware empleado (2× NVIDIA H200 SXM). Con 14,83B parámetros totales y ~7,42B activos por token gracias al enrutamiento top-2 sobre 8 expertos, ofrece un equilibrio entre capacidad de cómputo por inferencia y coste. La ventana de contexto es de 4.096 tokens, modesta pero suficiente para conversación y tareas de instrucción cortas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixtral-style MoE (8 expertos, enrutamiento top-2) |
| Parámetros totales | 14,83B (15.368.933.376 según safetensors) |
| Parámetros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Keural sigue una arquitectura transformer estilo Mixtral con 24 capas, tamaño oculto de 4.096, 32 cabezas de atención con GQA (8 cabezas KV, dimensión 128) y un vocabulario de 131.074 tokens (SentencePiece con dos tokens especiales de ChatML añadidos). Cada capa MoE enruta cada token hacia 2 de los 8 expertos, con tamaño intermedio de experto de 5.632. Incorpora RoPE con theta de 500.000, ventana deslizante de 512 tokens alternada cada dos capas, RMSNorm (eps=1e-5) y activación SiLU.

El pipeline de entrenamiento constó de cinco etapas: preentrenamiento etapa 1 (100.000 pasos, ~50B tokens sobre corpus web coreano e inglés), preentrenamiento etapa 2 (120.000 pasos, ~13B tokens), SFT época 1 (18.000 pasos sobre 1,14M muestras ChatML), DPO (6.927 pasos con 440.000 pares de preferencia) y la segunda época de SFT de este checkpoint (29.112 pasos, ~7,63B tokens sobre 710.000 muestras). Esta última etapa usó AdamW con learning rate en decaimiento coseno de 1e-5 a 1e-6, batch efectivo de 64, weight decay 0,05, clipping de gradiente 1,0, FSDP FULL_SHARD, bfloat16 con gradient checkpointing y ~56,71 horas sobre 2× H200 SXM. Cabe destacar que el checkpoint SFT2 es posterior al DPO según el orden documentado, lo que sugiere que el alineamiento por preferencias podría haberse visto parcialmente revertido por la segunda pasada de SFT; la model card no aclara este punto.

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Seguimiento de instrucciones gracias al fine-tuning supervisado sobre 710.000 muestras ChatML.
- Cambio automático de idioma: la plantilla de chat inyecta un system prompt por defecto que indica responder en el idioma del usuario.
- Alineamiento por preferencias mediante una etapa de DPO previa con 440.000 pares.
- Contexto de 4.096 tokens con atención GQA y ventana deslizante alternada para eficiencia.
- No hay evidencia documentada de soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está optimizado para coreano como idioma principal y mantiene conversaciones multi-turno en formato ChatML con cambio automático de idioma.
- Chatbots bilingües coreano-inglés para servicios con usuarios de ambos idiomas: la plantilla de chat garantiza respuestas en el idioma de entrada sin configuración adicional.
- Asistentes de soporte de primer nivel: con 4.096 tokens de contexto puede gestionar conversaciones de soporte de longitud moderada integrándose vía API compatible con OpenAI a través de vLLM.
- Generación y corrección de texto en coreano: redacción, reformulación y resumen de documentos en coreano, tarea donde los modelos generalistas suelen rendir por debajo.
- Traducción ligera coreano-inglés: su entrenamiento bilingüe desde cero con corpus web de ambos idiomas lo hace adecuado para tareas de traducción informal, aunque no está especializado en traducción.
- Investigación sobre MoE entrenados desde cero: al documentarse todo el pipeline (tokens, hiperparámetros, hardware), es un caso de estudio útil para equipos que evalúan la viabilidad de entrenar modelos propios de tamaño medio.
- Prototipado de agentes simples en coreano: puede desplegarse como backend de chat en aplicaciones experimentales, aunque carece de soporte nativo de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repo ocupa 30,7 GB en bfloat16, por lo que la inferencia en precisión completa requiere en torno a 31-35 GB de VRAM considerando KV cache y activaciones.
- Con ~7,42B parámetros activos, el throughput por token es comparable al de un denso de 7-8B, pero la memoria debe alojar los 14,83B parámetros totales.
- Cabe en una sola GPU de 40-48 GB (A100 40 GB con ajustes, A100 80 GB, H100, H200, RTX 6000 Ada 48 GB). No cabe en GPUs de consumo de 24 GB como la RTX 4090 sin cuantización; no se publican pesos cuantizados (GGUF, AWQ, GPTQ), por lo que no hay opción documentada para consumer GPU.
- Despliegue recomendado: vLLM (la model card incluye comando de servidor OpenAI-compatible con `--max-model-len 4096` y `--dtype bfloat16`). También funciona con `transformers` mediante `device_map="auto"`. No se mencionan soporte para llama.cpp, Ollama ni TGI.
- No hay datos publicados de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Keural-SFT2 | 14,83B | ~7,42B | 4.096 | Apache 2.0 | Bilingüe coreano-inglés, entrenado desde cero |
| Mixtral 8x7B Instruct | 46,7B | ~12,9B | 32.768 | Apache 2.0 | Mucho mayor, mejor contexto, coreano limitado |
| Qwen2.5-14B-Instruct | 14,8B | 14,8B (denso) | 32.768 | Qwen license (uso comercial condicionado) | Denso, multilingüe con buen coreano, benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 8B (denso) | 131.072 | Llama 3.1 Community License | Denso, contexto muy superior, coreano razonable |

Keural se diferencia por su foco explícito en coreano y su licencia Apache 2.0 sin restricciones, pero queda por detrás en contexto (4.096 frente a 32K-128K de las alternativas) y en madurez del ecosistema (sin cuantizaciones publicadas ni benchmarks).

## Limitaciones y advertencias

- Contexto de solo 4.096 tokens: inadecuado para documentos largos, RAG con mucho material recuperado o historiales de conversación extensos.
- Sin benchmarks públicos: imposible verificar su calidad frente a modelos comparables; conviene evaluarlo internamente antes de cualquier despliegue.
- Riesgo de alucinación elevado al tratarse de un modelo entrenado desde cero con ~63B tokens de preentrenamiento, una cifra muy inferior a la de modelos comerciales (que superan los 10T tokens).
- Posible conflicto de alineamiento: la segunda época de SFT se ejecutó después del DPO, lo que puede haber degradado parcialmente el alineamiento por preferencias; la model card no lo aclara.
- Sesgos: entrenado sobre corpus web coreano e inglés sin documentación de filtrado; puede reproducir sesgos presentes en esos datos.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea pobre.
- Requiere configuración crítica: hay que fijar `eos_token_id=131073` (`<|im_end|>`) y no usar el token 2, o la generación no se detendrá correctamente.
- Etiquetado con `custom_code` en Hugging Face: revisa el código del repo antes de ejecutarlo.
- Proyecto aparentemente individual con pocas descargas (287) y sin comunidad de mantenimiento activo conocida; el soporte a largo plazo es incierto.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/keural-sft2
- Modelo base: https://huggingface.co/mkd-hossain/keural-pretrained
- Dataset SFT: https://huggingface.co/datasets/mkd-chanwoo/keural-SFT
- Paper, blog, demo o repositorio de código: no disponibles en la información proporcionada.
