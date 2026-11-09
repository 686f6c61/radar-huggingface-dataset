# DavidAU/L3-DARKEST-PLANET-16.5B

## Resumen

L3-DARKEST-PLANET-16.5B es un modelo de lenguaje de tipo "merge" (fusión de pesos) construido por el desarrollador independiente DavidAU a partir de cinco modelos Llama 3 de 8B parámetros. El resultado es un checkpoint de 16.536.629.248 parámetros (aproximadamente 16,5B) almacenado en precisión completa (bfloat16) en formato safetensors, pensado específicamente para escritura creativa, narrativa de ficción, generación de tramas y roleplay sin censura.

El modelo parte de L3 Dark Planet 8B como base y le aplica el adaptador propietario "Brainstorm 40x" del propio autor, combinando además pesos de Stheno v3.2, Lumimaid 8B, Meta-Llama-3-8B-Instruct y Jamet-8B-L3-MK.V-Blackroot. La ficha del autor lo clasifica como modelo "Class 3/Class 4", lo que significa que los parámetros de muestreo por defecto son críticos para su funcionamiento correcto: sin la configuración adecuada de samplers y temperatura, el rendimiento decae notablemente.

Es relevante ahora porque ejemplifica una práctica extendida en la comunidad open source: la creación de modelos derivados mediante mergekit para nichos concretos (ficción, horror, romance, roleplay) que los modelos generalistas no cubren con la misma calidad estilística. No obstante, es un modelo de nicho, sin benchmarks publicados, con muy poca tracción (56 descargas, 6 likes) y sin licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), resultado de fusión con mergekit |
| Parametros totales | 16.536.629.248 (16,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor remite a la version Llama 3.1 de 128k para contexto extendido; la base Llama 3 original es de 8k) |
| Tipos de cuantizacion | safetensors en bfloat16 como origen; GGUFs disponibles en repos de terceros (DavidAU, RichardErkhov, mradermacher, incluidos i1-GGUF); el autor menciona la posibilidad de generar GPTQ, EXL2, AWQ y HQQ |
| Idiomas soportados | no disponible (heredados de Llama 3, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16); GGUF en repos derivados |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only basado en la arquitectura Llama 3, sin innovaciones arquitectónicas propias: la "construcción" es una fusión de pesos (merge) realizada con mergekit, no un entrenamiento desde cero ni un fine-tuning clásico. Los modelos de partida son cinco checkpoints de 8B: DavidAU/L3-Dark-Planet-8B, Sao10K/L3-8B-Stheno-v3.2, NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS, meta-llama/Meta-Llama-3-8B-Instruct y Hastagaras/Jamet-8B-L3-MK.V-Blackroot. El autor aplica además su adaptador "Brainstorm 40x" sobre la base L3 Dark Planet 8B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en los modelos de origen (más allá de lo que declaran sus respectivas fichas, que no se incluyen aquí). El resultado del merge es un checkpoint de 16,5B parámetros, lo que sugiere una combinación por concatenación o suma de capas más que un simple SLERP entre dos modelos del mismo tamaño. La model card insiste en que el modelo requiere configuración específica de parámetros y samplers (clasificación "Class 3/4"), y remite a un documento externo del autor sobre maximización de rendimiento.

## Capacidades

- Generación de texto narrativo y prosa vívida en múltiples géneros: ciencia ficción, romance, terror, ficción general.
- Generación y desarrollo de tramas y subtramas, continuación de escenas y construcción de historias.
- Roleplay conversacional, incluyendo contenido explícito, lenguaje soez y temáticas sin censura (etiquetas "swearing", "rp", "horror").
- Escritura creativa de ficción con énfasis en estilo y detalle descriptivo.
- Conversación multi-turno (etiqueta "conversational").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades matemáticas y de código: no documentadas; el modelo está orientado a creatividad, no a tareas técnicas.

## Casos de uso

- Escritura de ficción por entregas: el modelo puede continuar escenas y mantener coherencia estilística en relatos de género (terror, ciencia ficción, romance), que es su dominio declarado de diseño.
- Generación de tramas y subtramas para guionistas o novelistas: útil como generador de ideas y "brainstorming" narrativo, dado el adaptador Brainstorm integrado.
- Roleplay narrativo y juegos de rol por texto: soporta conversaciones multi-turno con personajes y permite contenido adulto o soez que otros modelos rechazan.
- Prototipado de videojuegos narrativos: generación de diálogos de personajes no jugadores (NPC) en aventuras conversacionales o RPG de texto.
- Creación de contenido para comunidades de fanfiction: generación de relatos derivados y continuaciones con control de tono y género.
- Exploración creativa asistida: redacción de borradores de escenas, descripciones de ambientación y diálogos para autores que trabajan con asistencia de IA.
- No es adecuado para tareas de código, matemáticas, análisis de datos ni atención al cliente en producción, al no estar entrenado ni evaluado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16 (pesos completos): aproximadamente 33 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 40-48 GB de VRAM.
- GPUs profesionales adecuadas: A100 40GB/80GB, H100 80GB, L40S 48GB, RTX A6000 48GB.
- En cuantización GGUF Q4_K_M el modelo ocupa del orden de 9-10 GB, lo que permite ejecución en GPUs de consumo como RTX 3080/3090 (10-24 GB), RTX 4070 Ti/4080/4090 (12-24 GB) y en CPU con llama.cpp, aunque con latencia mayor.
- Cuantizaciones de 8 bits (Q8_0) requieren en torno a 17-18 GB, viables en RTX 4090 o 3090.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en bfloat16 (con hardware profesional); el autor menciona compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3-DARKEST-PLANET-16.5B | 16,5B | no disponible | Ficción y roleplay sin censura | no disponible | Hugging Face (56 descargas) |
| Sao10K/L3-8B-Stheno-v3.2 | 8B | 8k | Roleplay y escritura creativa | Llama 3 (uso comunitario) | Hugging Face, ampliamente usado |
| NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS | 8B | 8k | Roleplay y conversación | Llama 3 (uso comunitario) | Hugging Face |
| DavidAU/LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B | 16,5B | 128k | Ficción sin censura, contexto largo | no disponible | Hugging Face |

Los tres modelos comparables son, de hecho, componentes o variantes del propio ecosistema del autor: Stheno y Lumimaid son dos de las fuentes del merge, y la versión Llama 3.1 de 128k es la alternativa directa del mismo autor con contexto extendido. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial es jurídicamente incierto y debe verificarse con el autor antes de cualquier despliegue en producción.
- Modelo de nicho sin benchmarks: no existen evaluaciones objetivas de calidad, razonamiento o seguridad.
- Sesgos y contenido: entrenado explícitamente para generar lenguaje soez, horror y contenido sin censura; puede producir material ofensivo, violento o sexual inapropiado para entornos profesionales.
- Riesgo elevado de alucinación en tareas factuales: es un modelo de ficción, no un asistente de conocimiento.
- Requiere configuración específica de samplers y parámetros (clasificación "Class 3/4" del autor); con ajustes por defecto el rendimiento puede degradarse notablemente.
- Contexto limitado en esta versión (base Llama 3, probablemente 8k); para ventanas largas el autor remite a la versión Llama 3.1 de 128k.
- Idiomas: no declarados; probablemente centrado en inglés, con rendimiento limitado en castellano.
- Tracción muy baja (56 descargas): poca validación comunitaria y soporte limitado.
- Es un merge de pesos, no un modelo entrenado con datos propios: hereda las limitaciones de sus cinco modelos fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-16.5B
- GGUF oficial del autor: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-16.5B-GGUF
- Versión Llama 3.1 de 128k: https://huggingface.co/DavidAU/LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- GGUF de RichardErkhov: https://huggingface.co/RichardErkhov/DavidAU_-_L3-DARKEST-PLANET-16.5B-gguf
- GGUF imatrix de mradermacher: https://huggingface.co/mradermacher/L3-DARKEST-PLANET-16.5B-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/L3-DARKEST-PLANET-16.5B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
