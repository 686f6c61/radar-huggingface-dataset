# somdevsheel/prajna-ai-124m-chat

## Resumen

prajna-ai-124m-chat es un modelo de lenguaje conversacional de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel (publicado anteriormente como `kaggle-llm-124m-chat`). Se trata de un transformer decoder-only de estilo LLaMA con 12 capas, dimensión oculta 768, 12 cabezas de atención, FFN de 2048 y una longitud de contexto de 4096 tokens. El modelo parte de un preentrenamiento sobre 1,92 mil millones de tokens de FineWeb-Edu, seguido de una fase de extensión de contexto y un ajuste supervisado (SFT) orientado a conversación.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra el ciclo completo de entrenamiento de un LLM (preentrenamiento, extensión de contexto y SFT) sobre hardware de consumo, concretamente 2 GPU NVIDIA T4 gratuitas de Kaggle, en sesiones de menos de 12 horas. Incorpora además un componente específico para inglés de India y hinglish romanizado, lo que lo hace interesante para estudiar el comportamiento multilingüe en modelos muy pequeños.

No es un asistente de producción: el propio autor lo describe como un proyecto de aprendizaje, con conocimiento factual limitado (ratio de unos 20 tokens de preentrenamiento por parámetro, cercano al óptimo de Chinchilla pero insuficiente para conocimiento robusto) y sin ajuste de seguridad ni preferencias. Es útil como base para experimentación, fine-tuning y comparativas de modelos de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA: RoPE, RMSNorm (pre-norm), SwiGLU, sin biases, embeddings atados |
| Parametros totales | 123.587.328 (85,0M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (RoPE theta 100.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y ONNX; cuantizaciones GGUF no documentadas) |
| Idiomas soportados | Inglés (en) e hindi romanizado/hinglish; devanagari no entrenado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tokenizer | GPT-2 BPE, vocabulario ampliado a 50.304 |
| Forma | 12 capas, hidden 768, 12 cabezas, FFN 2048 |
| Modelo base | somdevsheel/prajna-ai-124m-base |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de estilo LLaMA: normalización RMSNorm en pre-norm, activación SwiGLU en la FFN, embeddings atados entre entrada y salida, ausencia de biases y codificación posicional rotatoria (RoPE) con theta 100.000. Usa el tokenizer BPE de GPT-2 con el vocabulario rellenado hasta 50.304 entradas. No incorpora innovaciones como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

El entrenamiento se dividió en tres fases documentadas:

- **Preentrenamiento**: 1,92 mil millones de tokens de FineWeb-Edu (muestra sample-10BT), en 3.661 pasos de 524K tokens (dos ejecuciones), unas 21 horas en 2 T4. Pérdida de validación 3,30 (perplejidad 27).
- **Extensión de contexto**: 580 millones de tokens de texto en inglés centrado en India (Sangraha, Wikipedia, FineWeb-Edu), ampliando el contexto de 1024 a 4096 tokens, en 2.211 pasos de 262K tokens. La pérdida de validación a 4096 tokens bajó de 5,02 a 3,25.
- **SFT conversacional**: 457K conversaciones de smol-smoltalk, 27K conversaciones en hindi romanizado/hinglish de samvaad-hi-v1 y 1.500 conversaciones sintéticas de identidad (inglés y hinglish), empaquetadas en bloques de 4096 tokens (402M tokens). Pérdida en tokens del asistente de 2,49 a 1,46.

El entrenamiento usó PyTorch DDP en 2 GPU con precisión mixta fp16 y loss scaling, AdamW (0,9, 0,95), weight decay 0,1 y schedule coseno. La tasa de aprendizaje fue 1,2e-3 en preentrenamiento, 6e-4 en continuación y 2e-4 en SFT. La pérdida en SFT se calculó solo sobre tokens del asistente y el empaquetado fue first-fit con 99% de ocupación. No hubo RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo una plantilla de chat con etiquetas de rol en texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, terminador `<|endoftext|>`).
- Escritura de código corto y sencillo (por ejemplo, invertir una cadena o comprobar si un número es primo), con fiabilidad limitada en código largo o ambiguo.
- Conversación en inglés y en hinglish romanizado; las respuestas en hinglish suenan fluidas pero a menudo son incoherentes.
- Identidad propia: responde llamándose Prajna AI y nombrando a su creador, aunque puede añadir detalles inventados.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de modo thinking, visión ni audio.
- Sin ajuste de seguridad ni de preferencias.

## Casos de uso

- Docencia y formación en entrenamiento de LLM: sirve como ejemplo reproducible del pipeline completo (preentrenamiento, extensión de contexto y SFT) sobre 2 T4, útil para cursos y talleres que expliquen cada fase con métricas concretas de pérdida y perplejidad.
- Experimentación académica con modelos de escala reducida: su tamaño de 123,6M permite ejecutar ablaciones (cambios de tokenizer, schedules de LR, composición de datos) en una sola GPU de consumo en horas, no días.
- Fine-tuning específico de dominio: al ser un `LlamaForCausalLM` estándar con licencia Apache 2.0, se puede reentrenar para tareas acotadas (clasificación de texto, extracción de entidades, respuestas de FAQ) partiendo de los pesos base o de chat.
- Estudio de multilingüismo inglés-hinglish: permite analizar cómo un modelo pequeño distribuye capacidad entre dos registros lingüísticos y por qué el hinglish romanizado resulta fluido pero incoherente, con datos de validación comparables entre versiones.
- Prototipado rápido de interfaces conversacionales: para validar plantillas de chat, flujos de prompt y UX de conversación antes de migrar a un modelo mayor, dado su bajo coste de inferencia y su compatibilidad con TGI y endpoints.
- Evaluación de alucinación en modelos pequeños: su tendencia documentada a afirmar hechos falsos con seguridad (por ejemplo, al preguntar por DSA) lo convierte en un caso de estudio controlado para técnicas de detección de alucinaciones y calibración.
- Generación de código de ejemplo en entornos educativos: para demostraciones de funciones cortas en Python donde el resultado se revisa manualmente, no para código de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdidas de validación en tokens del asistente sobre conjuntos retenidos (bloques de 1024 tokens; menor es mejor):

| Version | smol-smoltalk val | samvaad (Hinglish) val |
|---|---|---|
| v3 (contexto 1024, SFT inglés) | 1,450 | 3,543 |
| v4 (contexto 1024, + hinglish) | 1,458 | 2,475 |
| v5 (esta versión, contexto 4096) | 1,415 | 2,318 |

Pérdidas de las fases previas: preentrenamiento con pérdida de validación 3,30 (perplejidad 27); extensión de contexto con pérdida a 4096 tokens reducida de 5,02 a 3,25; SFT con pérdida en tokens del asistente de 2,49 a 1,46.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,25 GB para los pesos (123,6M parámetros × 2 bytes), más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits o 4 bits ocuparía del orden de 0,12-0,06 GB de pesos, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU moderna; el modelo fue entrenado en 2 NVIDIA T4, por lo que una sola T4, RTX 3060, RTX 4090, A100 o H100 lo ejecutan sin problema.
- Cabe en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (probado por el autor), text-generation-inference (TGI, etiqueta `text-generation-inference` en el repo) y endpoints compatibles; el repo incluye pesos ONNX. No se documenta soporte explícito de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.
- Parámetros de muestreo recomendados por el autor: temperature 0,7, top-k 50, repetition penalty 1,15, `max_new_tokens` 200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| prajna-ai-124m-chat | 123,6M | 4.096 | Apache 2.0 | en, hinglish | Entrenado desde cero en 2 T4; sin RLHF; pérdida de validación publicada |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 (versión base) | Apache 2.0 | en (principalmente) | Entrenado con más datos y ajustado con preferencias; sin foco en hinglish |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos) | en | Referencia histórica; sin plantilla de chat nativa |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | multilingüe amplio | Cuatro veces más grande; capacidades superiores pero mayor coste |

La comparación directa de rendimiento no es posible porque prajna-ai-124m-chat no publica resultados de benchmarks estándar. Frente a SmolLM-135M, de tamaño casi idéntico, la diferencia principal es el volumen de datos de entrenamiento y la presencia de ajuste de preferencias en SmolLM, ausente aquí; a cambio, prajna-ai incluye datos específicos de hinglish y una documentación detallada de cada fase de entrenamiento.

## Limitaciones y advertencias

- **Alucinación elevada**: con unos 20 tokens de preentrenamiento por parámetro, el conocimiento factual es muy limitado; el autor documenta que inventa definiciones (por ejemplo, de DSA) con seguridad.
- **Auto-descripción parcialmente inventada**: acierta el nombre y el creador, pero puede añadir detalles falsos sobre sí mismo.
- **Hinglish incoherente**: las respuestas en hindi romanizado suenan fluidas pero a menudo carecen de coherencia; el devanagari no se entrenó y no debe esperarse soporte.
- **Código poco fiable**: funciones cortas suelen ser correctas; código largo o con especificaciones vagas generalmente no lo es.
- **Sin ajuste de seguridad ni de preferencias**: no hay RLHF ni DPO, por lo que no existen garantías de comportamiento seguro o alineado.
- **Sesgos**: no se documentan evaluaciones de sesgo; al entrenarse principalmente con FineWeb-Edu y datos de India, pueden aparecer sesgos de dominio y geográficos no medidos.
- **Contexto limitado a 4096 tokens**: suficiente para conversaciones cortas, insuficiente para documentos largos o agentes con memoria extensa.
- **Licencia Apache 2.0**: permite uso comercial y modificaciones, pero el autor desaconseja explícitamente su uso para respuestas factuales, médicas, legales o financieras.
- **No apto para producción**: el propio autor lo califica como proyecto de aprendizaje, no como asistente de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Modelo base: https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset samvaad-hi-v1: https://huggingface.co/datasets/sarvamai/samvaad-hi-v1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
