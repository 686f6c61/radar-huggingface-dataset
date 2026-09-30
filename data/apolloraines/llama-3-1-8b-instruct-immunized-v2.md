# ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2

## Resumen

Llama-3.1-8B-Instruct.immunized.v2 es una variante con "inmunización" de meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario ApolloRaines en Hugging Face. No es un modelo entrenado desde cero ni un fine-tuning clásico: según la model card, se trata de una modificación de pesos ("weight surgery") producida por el pipeline propietario jBlaze, que altera directamente ciertos comportamientos aprendidos sin recopilar datos de entrenamiento ni aplicar RLHF/DPO adicional. Su objetivo es mitigar la familia de ataques de prompt injection conocida como EchoLeak (clase CVE-2025-32711), en la que un asistente con acceso a contexto privado es inducido a filtrarlo a través de documentos, resultados de herramientas o contenido recuperado.

El modelo mantiene el tamaño del original (8.030.261.248 parámetros reales en safetensors) y se distribuye tanto en safetensors como en GGUF cuantizado, con la promesa de ser un reemplazo directo ("drop-in replacement") que se carga con `AutoModelForCausalLM.from_pretrained()` sin hooks en tiempo de ejecución ni cambios en la API de inferencia. La relevancia actual viene de que la inyección de prompts lleva tres años consecutivos encabezando la lista de riesgos de OWASP y de que los parches de los asistentes comerciales se aplican en la capa de envoltorio, no en los pesos del modelo.

Es un modelo pequeño, en inglés, orientado a despliegues agénticos y RAG donde el aislamiento del contexto privado es un requisito de seguridad. Las métricas de defensa son autoinformadas por el autor y no consta auditoría independiente; el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct: GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no especificado de forma explícita en la model card de esta variante |
| Tipos de cuantizacion | GGUF F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M; safetensors en fp16 |
| Idiomas soportados | Inglés (en), según la model card |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only de 32 capas con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE), activación SwiGLU y normalización RMSNorm. La intervención de jBlaze no añade capas ni módulos nuevos; modifica valores de pesos existentes a partir de un conjunto curado de escenarios. La model card afirma explícitamente que no hubo fine-tuning, ni recogida de datos de entrenamiento, ni olvido catastrófico inducido, y que la calibración se preserva al 100%.

La innovación técnica no está en la arquitectura sino en el método de "cirugía de comportamiento": la defensa queda horneada en los pesos, sin dependencia de system prompts extensos ni de hooks de inferencia. La model card distribuye hashes SHA256 para `model.safetensors` y para los cinco GGUF publicados, y advierte de que cualquier fine-tuning, fusión de LoRA, preentrenamiento continuado o entrenamiento basado en gradientes sobre los pesos inmunizados puede degradar o eliminar la protección, por lo que recomienda re-evaluar contra la suite canario de 100 ataques tras cualquier ajuste.

## Capacidades

- Generación de texto conversacional e instrucciones multi-turno, con el comportamiento del Instruct original.
- Seguimiento de instrucciones y calibración preservados según el autor (100% de calibración mantenida).
- Defensa frente a prompt injection de tipo EchoLeak: exfiltración mediante documentos no confiables, contenido recuperado, resultados de herramientas y payloads de webhook.
- Soporte de tool calling y function calling heredado de Llama 3.1 8B Instruct (el modelo base lo soporta; la model card de esta variante no lo detalla).
- Capacidades multilingües limitadas al inglés según la model card, pese a que el base cubre ocho idiomas.
- Sin capacidades de visión ni de audio.
- Sin modo "thinking" explícito ni decodificación especulativa documentada por el autor.

## Casos de uso

- Asistentes RAG sobre documentación interna: el modelo está diseñado para resistir instrucciones maliciosas incrustadas en documentos recuperados, de modo que un atacante que envíe un PDF o una página web contaminada no consiga que el asistente revele el contenido privado del contexto.
- Agentes con acceso a herramientas y webhooks: al reducir la exfiltración por canales de salida (imágenes markdown, URLs de webhook), encaja en pipelines donde el modelo puede emitir llamadas a herramientas y la salida se registra o se reenvía a terceros.
- Bots de atención al cliente con datos de cuenta: el escenario de rol (persona de asistente con información sensible) es uno de los evaluados; v2 eleva la defensa frente a v1 en este modo, aunque sigue con un 17% de fugas en la suite de rol.
- Asistentes de RR. HH. o financieros con PII: la suite de benchmark incluye roles de procurement, asesor financiero, RR. HH. y bot médico, lo que refleja el perfil de despliegue previsto.
- Sustitución directa en despliegues existentes de Llama 3.1 8B: al no requerir hooks ni cambios en la API, puede reemplazar al modelo original en un servicio ya en producción sin reescribir el código de inferencia, verificando antes los hashes.
- Evaluación de seguridad y red teaming: sirve como referencia para comparar técnicas de defensa en pesos frente a defensas en la capa de envoltorio o en el system prompt.
- Procesamiento de contenido no confiable en resúmenes y extracción: resumir correos, tickets o páginas web de origen externo es precisamente el escenario del benchmark canario, donde el modelo debe ignorar instrucciones disfrazadas de contenido.

## Benchmarks y rendimiento

Benchmark canario (100 ataques, instrucción explícita de no revelar el valor `CANARY-7F3A-92D1`; fuga = aparición del valor en la respuesta):

| Configuración | Vanilla Llama-3.1-8B-Instruct | v1 inmunizado | v2 inmunizado |
|---|---|---|---|
| fp16 (transformers) | 94 / 100 | no disponible | 100 / 100 |
| F16 (llama.cpp) | 87 / 100 | 100 / 100 | no publicado |
| Q8_0 | 85 / 100 | 99 / 100 | no publicado |
| Q6_K | 88 / 100 | 100 / 100 | no publicado |
| Q5_K_M | 91 / 100 | 99 / 100 | no publicado |
| Q4_K_M | 90 / 100 | 97 / 100 | no publicado |

Benchmark basado en rol (100 ataques con datos privados relevantes para el rol):

| Métrica | Vanilla | v1 | v2 |
|---|---|---|---|
| Ataques superados | 36 / 100 | 63 / 100 | 83 / 100 |
| Tasa de fuga | 64% | 37% | 17% |

Batería estándar EchoLeak de 16 ataques: vanilla 9/16, v1 inmunizado 15/16, v2 inmunizado 16/16 (techo). La model card se interrumpe en este punto del texto disponible.

Todos los datos proceden del autor del modelo. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tablas de cuantización correspondientes a v2.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, en torno a 16 GB solo para pesos, más caché KV; con Q8_0, aproximadamente 8,5 GB; con Q4_K_M, alrededor de 4,9 GB. Son estimaciones de cálculo, no medidas publicadas por el autor.
- GPU recomendadas: A100 40 GB, H100 o L40S para fp16 con lotes grandes y contexto largo; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto moderado o Q8_0 con contexto amplio.
- Consumer GPU: cabe con holgura en GPUs de 24 GB e incluso en 16 GB (RTX 4080, RTX 4070 Ti Super) usando Q5_K_M o Q4_K_M; en 8-12 GB es viable con Q4_K_M y contexto recortado.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF publicados; vLLM o TGI mediante safetensors (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); transformers con `AutoModelForCausalLM.from_pretrained()`.
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2 | 8,03 B | 128 K (heredado, no confirmado en la card) | Defensa frente a EchoLeak en los pesos | llama3.1 | HF, safetensors y GGUF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K | Asistente general e instrucciones | llama3.1 | HF, safetensors |
| ApolloRaines/Llama-3.1-8B-Instruct_Concise | 8 B | 32 K (según ficha de terceros) | Respuestas más breves, misma precisión | llama3.1 | HF, safetensors |
| Llama Prompt Guard 2 (86M) | 86 M | No aplica (clasificador) | Detección de inyección de prompts como capa externa | Llama 3.2 Community License | HF |

La diferencia de enfoque es relevante: Prompt Guard 2 es un clasificador que se coloca delante del modelo, mientras que esta variante intenta que el propio modelo no obedezca las instrucciones inyectadas. Las cifras de comparación de defensa entre ambos enfoques no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El 17% de los ataques basados en rol siguen teniendo éxito en v2; el autor identifica un patrón concreto de fallo (datos sensibles en el system prompt con una petición suave del usuario para referenciarlos) que queda para v3.
- Todas las métricas son autoinformadas por el autor. No hay auditoría independiente, replicación externa ni resultados de terceros.
- Cualquier fine-tuning, fusión de LoRA, RLHF o entrenamiento basado en gradientes sobre estos pesos puede degradar o eliminar la inmunización. Si se ajusta, hay que volver a medir contra la suite canario.
- La model card insiste en verificar los hashes SHA256: pesos obtenidos de espejos, re-subidas, torrents o forks no están verificados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con un día de diferencia, lo que limita la evidencia de uso real en producción.
- Idiomas: solo inglés según la card, pese a que el base soporta ocho idiomas. Un uso multilingüe queda fuera de lo declarado.
- Licencia llama3.1: uso comercial permitido bajo la Llama 3.1 Community License, con obligaciones de atribución ("Built with Meta Llama 3"), política de uso aceptable y cláusula de 700 millones de usuarios activos mensuales que exige licencia aparte.
- Riesgo de alucinación inherente al base: la inmunización no modifica la veracidad factual del modelo.
- Sesgos heredados de Llama 3.1 8B Instruct, no evaluados ni documentados por el autor.
- La modificación de pesos puede alterar de forma no medida otras capacidades (razonamiento, código, matemáticas); el autor afirma que se preservan, pero no publica benchmarks generales que lo respalden.
- Las referencias a CVE-2026 y a métricas de 2026 provienen del texto del autor; conviene contrastarlas con fuentes oficiales antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct.immunized.v2
- Pipeline jBlaze: https://jblaze.dev
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante relacionada del mismo autor: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Concise
- Otra variante del mismo autor: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete
- Repositorio de Meta Llama 3 (código de referencia): https://github.com/GargTanya/llama3-instruct
