# Danielmm78/Kraken-3.2-1B-Q6_K-GGUF

## Resumen

Kraken-3.2-1B-Q6_K-GGUF es una cuantización en formato GGUF (Q6_K) del modelo Kraken-3.2-1B, un modelo de lenguaje de 1.498.490.912 parámetros construido mediante la técnica de fusión de modelos (merge) con mergekit. Lo publica el usuario Danielmm78 en Hugging Face, si bien se trata de una duplicación del repositorio original de Novaciano. El modelo parte de tres bases: Novaciano/La_Mejor_Mezcla-3.2-1B, Novaciano/Jormungandr-3.2-1B y cognitivecomputations/Dolphin3.0-Llama3.2-1B, este último derivado de la arquitectura Llama 3.2 de 1B parámetros.

El objetivo declarado es ofrecer un modelo local de propósito general, pequeño y ejecutable en hardware de consumo, orientado a razonamiento, roleplay, generación de código, matemáticas y llamadas a funciones. La model card lo presenta como una alternativa "sin censura" y personalizable, donde el prompt de sistema define el tono y las reglas de comportamiento, en contraste con los modelos propietarios cuyos prompts y alineamientos están controlados por el proveedor.

Es relevante ahora por su tamaño reducido (1B), su licencia Apache 2.0 y su disponibilidad en GGUF, lo que permite desplegarlo en CPU o GPU modestas con herramientas como koboldcpp, llama.cpp u Ollama. No obstante, se trata de un modelo de nicho, con cero descargas en el momento de la consulta, sin benchmarks publicados y con un sesgo explícito hacia contenido para adultos y roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.2 1B), pesos fusionados con mergekit |
| Parametros totales | 1.498.490.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (GGUF); el modelo base admite otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q6_K); el modelo base en transformers usa safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 1.498.490.912 parámetros, heredado de Dolphin3.0-Llama3.2-1B y, por tanto, de la familia Llama 3.2 de 1B. El modelo publicado no se entrena desde cero: se obtiene mediante mergekit, fusionando los pesos de Novaciano/La_Mejor_Mezcla-3.2-1B, Novaciano/Jormungandr-3.2-1B y cognitivecomputations/Dolphin3.0-Llama3.2-1B. La model card no especifica el método exacto de fusión (SLERP, TIES, DARE, etc.) ni los hiperparámetros empleados.

Los datos de entrenamiento listados corresponden a los de los modelos base e incluyen 26 datasets orientados a razonamiento con cadena de pensamiento (Magpie-Reasoning V1 y V2, MiniThinky, Deepthink-Reasoning, NuminaMath-CoT/TIR), roleplay y conversación (Active_RP, RP_Alignment, pippa, sonnet35-charcard, Gryphe_Opus-WritingPrompts), código (OpenCoder SFT, CodeFeedback, dolphin-coder), instrucciones agénticas y function calling (orca-agentinstruct-1M, hermes-function-calling-v1) y mezclas generales (tulu-3-sft-mixture, smoltalk, samantha-data). No se indica el número de tokens totales ni si hubo fases de RLHF o DPO. La innovación técnica destacable es la propia fusión de modelos como estrategia para combinar capacidades de razonamiento, roleplay y código en un único checkpoint de 1B.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento con cadena de pensamiento (entrenado sobre datasets CoT tipo QwQ y Deepthink).
- Generación de código y asistencia de programación (datos de OpenCoder, CodeFeedback y dolphin-coder).
- Matemáticas, incluyendo problemas de palabras y razonamiento matemático (orca-math-word-problems, NuminaMath).
- Soporte de tool calling / function calling (hermes-function-calling-v1, orca-agentinstruct).
- Roleplay y escritura creativa, con datasets específicos de personajes y prompts narrativos.
- Capacidades multilingües limitadas a español e inglés.
- Comportamiento personalizable mediante prompt de sistema (tono, reglas, personaje).
- Modo "sin censura": el autor declara que no impone directrices éticas propias.

## Casos de uso

- Asistente conversacional local en español: con 1B parámetros y cuantización Q6_K, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, gestionando diálogos multi-turno con la plantilla ChatML.
- Roleplay y ficción interactiva: los datasets de Active_RP, RP_Alignment y pippa lo orientan a mantener personajes coherentes en sesiones largas con SillyTavern o koboldcpp.
- Generación de código en entornos con recursos limitados: puede integrarse en editores o scripts de CI/CD para autocompletado y explicación de fragmentos, aunque su tamaño limita la profundidad en tareas complejas.
- Resolución de problemas matemáticos básicos: entrenado con NuminaMath y orca-math, es adecuado para tutoría o verificación de cálculos sencillos en aplicaciones educativas.
- Prototipado de agentes con function calling: permite experimentar con pipelines de herramientas y llamadas a funciones en local antes de escalar a modelos mayores.
- Filtrado y reescritura de texto en español e inglés: útil para tareas de normalización, resumen corto o generación de variantes estilísticas en pipelines de datos.
- Base para fine-tuning ligero: al ser Apache 2.0 y de 1B parámetros, sirve como punto de partida para ajustes específicos de dominio con LoRA en una única GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa aproximadamente 1,2 GB, por lo que la inferencia completa cabe en torno a 1,5-2 GB de memoria (GPU o RAM).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en Raspberry Pi o mini-PC con suficiente RAM.
- Opciones de despliegue: llama.cpp, koboldcpp, Ollama, LM Studio; el modelo base en transformers puede servirse con vLLM o TGI, aunque el repositorio publicado solo contiene GGUF.
- Latencia y throughput: no disponibles; por el tamaño, se espera decodificación en tiempo real en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kraken-3.2-1B-Q6_K | 1,498 M | No disponible | Apache 2.0 | GGUF Q6_K | Merge orientado a razonamiento, roleplay y código; sin benchmarks |
| Dolphin3.0-Llama3.2-1B | ~1.235 M (Llama 3.2 1B) | 128K (según Llama 3.2) | Llama 3.2 Community License | Safetensors, GGUF | Base directa del modelo; alineamiento "sin censura" de Cognitive Computations |
| Llama 3.2 1B Instruct | ~1.235 M | 128K | Llama 3.2 Community License | Safetensors, GGUF | Modelo oficial de Meta, más restrictivo y con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | ~1.540 M | 32K | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar con buen rendimiento en código y matemáticas |

## Limitaciones y advertencias

- Modelo de 1B parámetros: capacidad de razonamiento y conocimiento factual muy limitada en comparación con modelos de 7B o superiores; riesgo alto de alucinación en temas especializados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Contenido para adultos y "sin censura": los tags incluyen nsfw, uncensored y not-for-all-audiences; no es adecuado para aplicaciones dirigidas a menores ni para entornos corporativos sin filtros adicionales.
- Sesgos: al entrenarse sobre datasets de roleplay y conversación sin alineamiento restrictivo, puede reproducir estereotipos y lenguaje tóxico presente en esos datos.
- Idiomas: solo español e inglés; el soporte de otros idiomas es previsiblemente deficiente.
- Longitud de contexto no documentada: no se debe asumir la ventana de 128K de Llama 3.2 sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el autor declina responsabilidad sobre el uso; el despliegue en producción requiere auditoría propia de seguridad y calidad.
- Repositorio con cero descargas y un solo like: ecosistema mínimo, sin garantías de mantenimiento ni soporte de la comunidad.

## Enlaces

- Hugging Face (repositorio publicado): https://huggingface.co/Danielmm78/Kraken-3.2-1B-Q6_K-GGUF
- Repositorio original duplicado: https://huggingface.co/Novaciano/Kraken-3.2-1B-Q6_K-GGUF
- Modelo base Dolphin3.0-Llama3.2-1B: https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.2-1B
- Modelo base Novaciano/Jormungandr-3.2-1B: https://huggingface.co/Novaciano/Jormungandr-3.2-1B
- Modelo base Novaciano/La_Mejor_Mezcla-3.2-1B: https://huggingface.co/Novaciano/La_Mejor_Mezcla-3.2-1B
- Perfil de Eric Hartford: https://huggingface.co/ehartford
- Perfil de Cognitive Computations: https://huggingface.co/cognitivecomputations
- mergekit (herramienta de fusión): https://github.com/arcee-ai/mergekit
