# DavidAU/Llama3.1-MOE-4X8B-Gated-IQ-Multi-Tier-COGITO-Deep-Reasoning-32B-GGUF

## Resumen

Llama3.1-MOE-4X8B-Gated-IQ-Multi-Tier-COGITO-Deep-Reasoning-32B es un modelo de lenguaje de tipo *merge* publicado por DavidAU en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión mediante mergekit de cuatro modelos derivados de Llama 3.1 de 8B parámetros: un modelo de razonamiento (Cogito v1 preview de DeepCogito) y tres modelos base conversacionales (Hermes 3, Dolphin 2.9.4 y SuperNova Lite). La combinación se empaqueta como una arquitectura Mixture of Experts (MoE) con cuatro "expertos" activados simultáneamente, lo que da un total declarado de 32B parámetros, aunque el recuento real en safetensors es de 24.942.219.328 parámetros (aproximadamente 25B).

El modelo se distribuye exclusivamente en formato GGUF (el repositorio ocupa 140 GB), con contexto declarado de 128k tokens y licencia Apache 2.0. Su propuesta principal es un control variable del razonamiento: el "modo pensamiento" se activa o desactiva mediante *system prompts* específicos, y el autor afirma que la estructura interna amplifica hasta un 300% la capacidad de razonamiento del modelo Cogito original de 8B al hacerle interactuar con los otros tres modelos.

Es relevante para quienes buscan un modelo local con razonamiento extenso, soporte de tool calling heredado de Llama 3.1 Instruct y capacidad multilingüe amplia (24 idiomas declarados), todo ello ejecutable en hardware de consumo con las cuantizaciones adecuadas. Conviene tratarlo como un experimento de la comunidad más que como un modelo de referencia: no hay benchmarks publicados ni evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3.1, fusionado como MoE de 4 expertos (mergekit) |
| Parametros totales | 24.942.219.328 (recuento en safetensors); el autor declara 32B (4x8B) |
| Parametros activos | 4 de 4 expertos activados en cada paso (no es un MoE disperso) |
| Longitud de contexto | 128k tokens (declarado); el autor recomienda minimo 4k, ideal 8k o mas |
| Tipos de cuantizacion | GGUF en varios niveles; el autor menciona IQ4XS y Q8 como quants "MAX" con tensores de salida a 16 bits |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bfloat16 como origen declarado) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión con mergekit de cuatro checkpoints de 8B basados en Llama 3.1: `cogito-v1-preview-llama-8B` (DeepCogito, modelo de razonamiento), `Llama-3.1-Hermes-3-8B`, `Llama-3.1-dolphin-2.9.4-8b` y `Llama-3.1-SuperNova-Lite`. La fusión se organiza como un MoE "gated" en el que los cuatro expertos se activan simultáneamente: el modelo de razonamiento actúa como "conductor" durante la fase de pensamiento y los tres modelos base toman el relevo en la generación de salida. No hay entrenamiento adicional ni RLHF/DPO propio documentado; las capacidades proceden íntegramente de los modelos originales y de la interacción que induce la estructura del merge.

La innovación declarada es el control variable del razonamiento mediante *system prompts* (encendido, apagado o modulado) y la posibilidad de dirigir la respuesta hacia uno u otro experto usando nombres o palabras clave en el prompt. El autor sostiene que esta estructura permite al Cogito 8B "razonar con ayuda" de los otros tres modelos, reduciendo el número de tokens necesarios para llegar a una conclusión y mejorando la calidad del razonamiento hasta un 300% respecto al Cogito original. Estas cifras son afirmaciones del autor sin verificación independiente. El modelo requiere la plantilla de instrucciones de Llama 3 Instruct.

## Capacidades

- Generación de texto conversacional y de formato largo (escritura creativa, ficción, roleplay).
- Razonamiento profundo con modo "pensamiento" activable y desactivable mediante *system prompts*.
- Soporte de tool calling / function calling heredado de Llama 3.1 Instruct.
- Resolución de problemas multi-paso y razonamiento encadenado.
- Capacidades multilingües en 24 idiomas declarados (incluye español).
- Escritura creativa en múltiples géneros y estilos, con énfasis en temperatura alta.
- Control por prompt para dirigir la respuesta a uno o varios de los expertos internos.
- No se declara soporte de visión, audio ni otras modalidades.

## Casos de uso

- Razonamiento asistido en local: activando el modo pensamiento mediante system prompt, el modelo puede abordar problemas lógicos o matemáticos de varios pasos en una máquina con GPU de consumo, sin depender de API externa.
- Escritura creativa y ficción larga: con contexto de 128k y temperatura alta (el autor recomienda 1.2 o superior), es adecuado para generar relatos, novelas por capítulos o guiones manteniendo coherencia de personajes y trama.
- Roleplay y experiencias interactivas: la combinación de Hermes 3 y Dolphin 2.9.4, ambos orientados a diálogo y roleplay, lo hace utilizable en frontends tipo SillyTavern para personajes conversacionales persistentes.
- Asistente de código con tool calling: al conservar la plantilla y el soporte de herramientas de Llama 3.1 Instruct, puede integrarse en flujos donde el modelo invoca funciones (consulta de APIs, ejecución de comandos) y razona sobre los resultados.
- Atención al cliente multilingüe: los 24 idiomas declarados permiten desplegar un asistente que responda en el idioma del usuario, con contexto suficiente para conversaciones multi-turno largas.
- Análisis de documentos extensos: con 128k de contexto puede resumir o extraer información de contratos, informes o transcripciones que no caben en modelos de 8k.
- Prototipado de agentes: el modo razonamiento más el soporte de herramientas permite construir agentes de varios pasos para tareas de investigación o automatización, siempre con validación humana por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma mejoras de hasta el 300% en velocidad y calidad de razonamiento respecto a `cogito-v1-preview-llama-8B`, pero no aporta métricas reproducibles (MMLU, GSM8K, HumanEval u otras) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: en Q4, en torno a 15-17 GB para los ~25B parámetros reales; en Q8, aproximadamente 27-30 GB; en bfloat16 completa, alrededor de 50 GB.
- GPU recomendadas: A100 40/80 GB o H100 para precisión completa; RTX 4090 (24 GB) para Q4 y, con dificultad, Q5/Q6; RTX 3090 (24 GB) para Q4.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, en cuantizaciones bajas (Q3/IQ3), en GPUs de 16 GB como RTX 4080 o 4060 Ti 16 GB. En 12 GB o menos requeriría offload a CPU.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también servidores tipo llama-server para exponer una API compatible con OpenAI.
- Latencia y throughput: no disponibles. Al activar los cuatro expertos en cada token, el coste por token es comparable al de un modelo denso de ~25B, no al de un MoE disperso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama3.1-MOE-4X8B-Gated-IQ-Multi-Tier-COGITO-32B | ~25B reales (32B declarados) | 128k | Apache 2.0 | GGUF | Merge comunitario con razonamiento variable; sin benchmarks |
| deepcogito/cogito-v1-preview-llama-8B | 8B | 128k | no disponible en la informacion | safetensors/GGUF | Modelo de razonamiento original; base del componente Cogito |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128k | Llama 3.1 (uso comunitario) | safetensors/GGUF | Componente base del merge; orientado a instrucciones y tool use |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128k | Llama 3.1 Community License | safetensors/GGUF | Referencia densa de 8B; menor capacidad de razonamiento extenso |

## Limitaciones y advertencias

- No hay benchmarks ni evaluación independiente: las afirmaciones de mejora del 300% proceden únicamente del autor.
- Es un merge, no un modelo entrenado: el comportamiento puede ser inconsistente entre prompts y la calidad depende en gran medida del system prompt empleado.
- El modo razonamiento puede no activarse a la primera; el autor reconoce que a veces hay que regenerar la respuesta.
- Requiere la plantilla de Llama 3 Instruct y system prompts específicos; usarlo fuera de ese formato degrada el rendimiento.
- Riesgo de alucinación inherente a los modelos base de 8B, sin mitigaciones adicionales documentadas.
- La temperatura recomendada (1.2 o superior) es muy alta y puede producir salidas divagantes o incoherentes en tareas factuales.
- El modelo no es un MoE disperso: activa todos los expertos, por lo que el coste computacional es el de un modelo denso de ~25B.
- Aunque la licencia es Apache 2.0, los modelos de origen (Llama 3.1) arrastran condiciones de uso comunitario; conviene revisar la compatibilidad antes de un despliegue comercial.
- El recuento real de parámetros (~25B) difiere del declarado (32B), lo que afecta a las estimaciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama3.1-MOE-4X8B-Gated-IQ-Multi-Tier-COGITO-Deep-Reasoning-32B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelo de razonamiento original (DeepCogito): https://huggingface.co/deepcogito/cogito-v1-preview-llama-8B
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
