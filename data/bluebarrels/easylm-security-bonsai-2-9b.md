# Bluebarrels/easylm-security-bonsai-2-9b

## Resumen

`easylm-security-bonsai-2-9b` es un adaptador LoRA de PEFT publicado por el usuario Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-9B-gguf`. No es un modelo completo: es un conjunto de pesos de bajo rango (r = 16, alpha = 32) que especializa una base de 9.000 millones de parámetros en tareas de seguridad y guardrails dentro del ecosistema EasyLM/Hydra del autor: aplicación de fences de ejecución, prevención de inyección de shell mediante reglas de prefijo, limpieza de secretos y verificación de invariantes que el autor denomina ZCABS.

El adaptador ocupa unos 5,1 MB (56 tensores, 417.774 elementos FP16 distintos de cero) sobre una base ternaria de 1,58 bits que el autor cifra en torno a 2 GB, lo que lo sitúa en el escalón "2 GB" de una supuesta progresión de modelos Bonsai 2 (2B, 4B, 9B y 27B). La model card declara una ventana de contexto de 262.144 tokens, heredada de la base, y licencia AGPL-3.0.

Su relevancia práctica es limitada y debe evaluarse con cautela: el repositorio tiene cero descargas y cero "likes", el corpus de entrenamiento del adaptador consta de un único fichero de 35 turnos y no se han publicado benchmarks, evaluación de seguridad independiente ni detalles del proceso de entrenamiento. Es interesante como ejemplo de adaptador de guardrails de bajo coste sobre una base ternaria, no como componente validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer ternario de 1,58 bits; el autor lo describe como "discrete PEFT LoRA adapter" |
| Parametros totales | 9.000 millones (modelo base); adaptador con 417.774 elementos entrenables FP16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (según la model card, heredado de la base) |
| Tipos de cuantizacion | Base ternaria 1,58 bits en GGUF; adaptador en FP16 (safetensors). Otras cuantizaciones: no disponible |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | `adapter_model.safetensors` (PEFT) sobre base GGUF; existe una referencia a base MLC/WebGPU |
| Rango LoRA / alpha / dropout | r = 16, alpha = 32, dropout = 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Tamano del adaptador | ~5,1 MB (842.872 bytes, 56 tensores) |
| Dataset de entrenamiento | `Bluebarrels/easylm-training-corpus`, fichero `adapter_security_chatml.jsonl`, 35 turnos |
| Modelo base | `prism-ml/Ternary-Bonsai-2-9B-gguf` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador es un LoRA clásico aplicado sobre las siete proyecciones habituales de un transformer (atención y MLP), con rango 16 y alpha 32, lo que da un factor de escala de 2. La base es un modelo ternario de 9B en formato GGUF, es decir, pesos restringidos a valores de 1,58 bits, una técnica que reduce el peso en memoria a costa de precisión numérica. El autor menciona además una base MLC (`mlc-ai/Qwen3.5-9B-q4f16_1-MLC`) en la misma tabla de linaje, sin aclarar la relación exacta entre ambas referencias ni si el adaptador es compatible con las dos.

En cuanto al entrenamiento, la información disponible es mínima: el corpus indicado contiene un único fichero ChatML de 35 turnos. No se especifican número de tokens, número de épocas, hiperparámetros de optimización, ni si hubo RLHF, DPO o alguna fase de alineamiento. La model card describe un corpus mucho más amplio (92 "stacks académicos", 369 tablas de hechos con 4.634 filas, 151 "Council of Kami Books", un grafo EMap de 46.025 nodos y 19.842 aristas, y un currículo Hydra v1.2.2), pero no aporta ninguna evidencia de que ese material se usara para este adaptador concreto ni de cómo se filtró. Tampoco se detalla ninguna innovación técnica propia: no hay decodificación especulativa, atención lineal ni mecanismo de razonamiento explícito documentado.

## Capacidades

- Aplicación de "fences" de ejecución (barreras de soberanía) según la terminología del autor: el adaptador está entrenado para reforzar restricciones de ejecución en el runtime Hydra.
- Prevención de inyección de shell basada en reglas de prefijo del CLI Hydra.
- Limpieza y ocultación de secretos (scrubbing) en texto y trazas.
- Verificación de invariantes ZCABS, un mecanismo de comprobación descrito en la model card sin especificación pública disponible.
- Orquestación de herramientas MCP y flujos de agente multi-paso, según las capacidades declaradas del escalón 9B del linaje.
- Conversación multi-turno con ventana de contexto muy larga (262.144 tokens declarados), adecuada para volcar repositorios o trazas extensas.
- Generación de texto y derivaciones STEM, atribuidas en la model card al corpus académico del linaje; no verificadas para este adaptador.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Visión y audio: no disponibles en este adaptador; la model card atribuye la torre de visión al modelo de 27B del linaje, no a este.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Filtro de seguridad previo a la ejecución de comandos: el adaptador puede clasificar y bloquear instrucciones de shell que intenten escapar del prefijo permitido, integrándose como paso previo al `exec` en un agente de terminal.
- Sanitización de logs y trazas antes de enviarlas a un sistema de observabilidad: detección y enmascarado de claves de API, tokens y cadenas de conexión en texto libre generado por el propio agente.
- Guardrail en pipelines de CI/CD: revisión de las propuestas de parche generadas por un agente antes de aplicarlas, con el contexto largo necesario para incluir el diff completo y los ficheros relacionados.
- Agente local con presupuesto de memoria muy ajustado: la combinación de base ternaria (~2 GB) y adaptador (~5 MB) permite desplegar un agente de seguridad en portátiles sin GPU dedicada o en entornos WebGPU, según el flujo TypeScript que documenta el autor.
- Asistente de revisión de políticas de acceso: dado un conjunto de reglas y una acción propuesta, el modelo puede señalar la regla vulnerada, siempre que se valide su salida con un motor de políticas determinista.
- Chat de soporte técnico sobre el propio CLI Hydra: resolución de dudas de configuración (modos `chat`, `agent`, `swarm`, `computer`, `terminal`; permisos `manual`, `accept_edits`, `plan`, `bypass`) aprovechando el corpus de currículo declarado.
- Evaluación comparativa de adaptadores de guardrails: por su tamaño reducido, sirve como caso de estudio reproducible de especialización LoRA sobre bases ternarias en trabajos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, evaluación de jailbreak, tasa de falsos positivos en detección de inyección de shell ni ningún otro conjunto de evaluación. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB para la base ternaria según el autor, más el coste de la caché KV; con 262.144 tokens de contexto, la caché KV puede superar ampliamente el tamaño de los pesos y dominar el consumo. Estimación orientativa para una ventana realista de 8K-32K: 3-6 GB.
- El adaptador en sí ocupa ~5,1 MB y no altera de forma significativa el presupuesto de memoria.
- Equivalente en FP16 del modelo base de 9B: en torno a 18 GB solo en pesos, inviable en GPUs de consumo de 8-12 GB; la versión ternaria es la que hace posible el despliegue en ese rango.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para uso local; A100 40/80 GB y H100 para servir en concurrencia con ventanas largas.
- Cabe en GPU de consumo: sí, siempre en la variante ternaria/GGUF y con contexto moderado; la ventana completa de 262.144 tokens requiere hardware de centro de datos.
- Opciones de despliegue: llama.cpp y Ollama para la base GGUF; MLC/WebGPU para el flujo en navegador que describe la model card; vLLM y TGI no soportan de forma nativa pesos ternarios GGUF, por lo que requerirían conversión. Cargar un adaptador PEFT sobre una base GGUF exige convertir el adaptador o usar un runtime que lo permita; el autor documenta un cargador propio en TypeScript (`parseSafeTensorsHeader`, `applyLoRAWeights`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `easylm-security-bonsai-2-9b` (este) | 9B base + 0,42 M adaptador | 262.144 (declarado) | AGPL-3.0 | LoRA safetensors sobre base GGUF | Especializado en guardrails; sin benchmarks ni validación externa |
| `prism-ml/Ternary-Bonsai-2-9B-gguf` (base) | 9B | 262.144 (declarado) | No disponible en la información | GGUF ternario | Modelo generalista del que hereda todo el conocimiento; el adaptador añade la especialización |
| BitNet b1.58 2B4T (Microsoft) | 2.400 M | 4.096 | MIT | safetensors / GGUF | Referencia pública en pesos ternarios; mucho menor y con contexto más corto, pero con evaluación publicada |
| Qwen3-8B | 8.200 M | 32.768 nativo (131.072 con YaRN) | Apache-2.0 | safetensors / GGUF | Alternativa densa en FP16/BF16 con amplia adopción y ecosistema de herramientas |

Nota: los datos de BitNet b1.58 2B4T y Qwen3-8B provienen de conocimiento general sobre esos modelos, no de la información proporcionada en esta ficha, y conviene verificarlos en sus repositorios antes de citarlos. La licencia del modelo base ternario no figura en los datos disponibles.

## Limitaciones y advertencias

- Corpus de entrenamiento mínimo: 35 turnos en un único fichero ChatML. Es un volumen insuficiente para Generalizar de forma fiable; cabe esperar sobreajuste al formato exacto de las muestras y degradación fuera de él.
- Ausencia total de validación: cero descargas, cero "likes" y ninguna evaluación publicada. No hay evidencia independiente de que el adaptador funcione como se describe.
- Afirmaciones no verificables: términos como "ZCABS", "fences de soberanía", "Council of Kami" o "Alice EMap" no remiten a especificaciones públicas ni a literatura revisada. Trátalos como vocabulario del autor, no como garantías técnicas.
- Riesgo de alucinación: al ser un modelo de 9B con cuantización ternaria, la pérdida de precisión numérica puede agravar los errores factuales, especialmente en las derivaciones STEM y en las tablas de referencia cuantitativa que menciona la model card.
- No sustituye a un control de seguridad determinista: un guardrail basado en un LLM puede ser eludido con prompt injection. Cualquier decisión de bloqueo debe respaldarse con un motor de políticas y validación de esquema fuera del modelo.
- Ambigüedad sobre el modelo base: la model card cita simultáneamente una base ternaria GGUF y una base MLC asociada a Qwen3.5-9B. No queda claro qué pesos son el punto de partida real ni si el adaptador es portable entre ambas.
- Licencia AGPL-3.0: es copyleft fuerte. Ofrecer el modelo como servicio en red puede obligar a liberar el código del servicio; para uso comercial cerrado conviene revisión legal o buscar una licencia permisiva.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma distinto del inglés de las muestras de entrenamiento.
- Inconsistencia en metadatos: el tamaño del repositorio figura como 0.0 GB y la fecha de creación es posterior a la actual, lo que sugiere metadatos incompletos o un repositorio en construcción.
- Contexto declarado no contrastado: 262.144 tokens es una cifra heredada de la base; no hay ninguna prueba de que el adaptador mantenga su comportamiento de seguridad en ventanas de esa longitud.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Bluebarrels/easylm-security-bonsai-2-9b
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Base MLC/WebGPU citada: https://huggingface.co/mlc-ai/Qwen3.5-9B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Modelos del mismo linaje citados: `Bluebarrels/easylm-bonsai-2-2b`, `Bluebarrels/easylm-bonsai-2-4b`, `Bluebarrels/easylm-bonsai-2-27b` (sin URL verificada en la información disponible)
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada
