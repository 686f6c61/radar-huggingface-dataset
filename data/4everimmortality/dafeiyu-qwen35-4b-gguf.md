# 4everImmortality/dafeiyu-qwen35-4b-gguf

## Resumen

Dafeiyu Qwen3.5-4B GGUF es una cuantización en formato GGUF de un ajuste fino de tipo DoRA sobre el modelo base Qwen/Qwen3.5-4B, publicada por el usuario 4everImmortality. El modelo está orientado a la personificación de un personaje ("大肥鱼", literalmente "gran pez gordo") para roleplay, conversación y contenido relacionado con anime y VTuber. El autor lo describe explícitamente como un experimento histórico de su estudio (Tuber Studio), sustituido en producción por una variante de 9B.

El artefacto publicado es un único fichero de pesos en cuantización Q4_K_M, sin adaptador DoRA separado, pensado para cargarse con versiones de llama.cpp compatibles con la arquitectura Qwen3.5 y con la plantilla de chat nativa del modelo base. El modelo base cuenta con 4.205.751.296 parámetros, y el repositorio ocupa 5,4 GB.

Su relevancia es acotada: se trata de un modelo de personaje de nicho, con 478 descargas y sin resultados de benchmarks publicados. Resulta útil como ejemplo de pipeline de ajuste DoRA y cuantización GGUF para角色 conversacionales, pero no está pensado como modelo de propósito general ni como base para tareas de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); ajuste fino DoRA |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado: `dafeiyu_qwen35_4b_nomtp_q4_k_m.gguf`) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | other (licencia personalizada del autor; ver limitaciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4.205.751.296 parámetros. Sobre esa base, el autor aplicó un ajuste fino con la técnica DoRA (Weight-Decomposed Low-Rank Adaptation), orientado a dotar al modelo de una personalidad de personaje concreta ("大肥鱼") para interacción conversacional. El nombre del fichero incluye el sufijo `nomtp`, que sugiere que los pesos publicados excluyen las cabezas de predicción multi-token del modelo base, aunque la información disponible no detalla el alcance exacto de esa modificación.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica propia: el interés técnico del artefacto reside en el pipeline de ajuste DoRA seguido de cuantización a Q4_K_M para su uso en llama.cpp y Ollama.

## Capacidades

- Generación de texto conversacional en chino e inglés, con una persona de personaje definida por el ajuste DoRA.
- Roleplay multi-turno orientado a escenarios de anime y VTuber.
- Uso de la plantilla de chat nativa de Qwen3.5 a través de llama.cpp.
- Compatibilidad declarada con endpoints y con el ecosistema Ollama/llama.cpp.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es el objetivo del ajuste.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay de personaje en aplicaciones de chat: el ajuste DoRA está entrenado para mantener una persona concreta, por lo que encaja en productos de conversación con personajes donde la coherencia de voz y estilo prima sobre la precisión factual.
- Integración en un bot de VTuber: el modelo puede generar respuestas en directo dentro de un pipeline con llama.cpp u Ollama, con un coste de inferencia bajo gracias a los 4B parámetros en Q4_K_M.
- Prototipado rápido en local: al ser un único fichero GGUF de 5,4 GB, permite montar un entorno de pruebas conversacional con Ollama en cuestión de minutos y sin GPU dedicada de gama alta.
- Generación de diálogos para contenido derivado (fan fiction, guiones de streams): el sesgo de personaje del ajuste resulta adecuado para producir texto con un registro consistente en chino e inglés.
- Evaluación de pipelines de ajuste DoRA: sirve como referencia práctica de cómo un adaptador DoRA sobre un modelo de 4B se empaqueta y cuantiza a GGUF para despliegue.
- Base para nuevos ajustes de personaje: al estar publicado en GGUF y no en safetensors, su uso como punto de partida para reentrenamiento es limitado; resulta más apropiado como destino final de un pipeline que como origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,5-3 GB de pesos más overhead de contexto y caché KV; en la práctica, entre 3 y 5 GB según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también puede ejecutarse en CPU con llama.cpp, a velocidades menores.
- Opciones de despliegue: llama.cpp (versión compatible con Qwen3.5), Ollama, y cualquier runtime que acepte GGUF. vLLM y TGI no se documentan para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| dafeiyu-qwen35-4b-gguf | 4.205.751.296 | no disponible | GGUF (Q4_K_M) | other | Roleplay de personaje |
| Qwen/Qwen3.5-4B (base) | 4.205.751.296 | no disponible | safetensors | según Qwen | Propósito general |
| dafeiyu-qwen35-9b-gguf | no disponible | no disponible | GGUF | other | Roleplay de personaje (versión en producción) |

La comparación con otras familias de modelos de 4B orientados a roleplay no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de personaje de nicho: el ajuste DoRA prioriza el estilo y la persona sobre la precisión factual, lo que incrementa el riesgo de alucinación en consultas informativas.
- Idiomas limitados a chino e inglés; no hay evidencia de calidad en castellano ni en otras lenguas.
- Longitud de contexto no documentada: no debe asumirse la ventana del modelo base sin verificarla en el runtime.
- Licencia "other": es una licencia personalizada cuyo texto no se detalla en la información disponible; antes de un uso comercial es imprescindible revisar los términos del autor y, en su caso, las condiciones del modelo base Qwen.
- El propio autor lo etiqueta como experimento histórico y remite a la variante de 9B para producción, lo que sugiere que esta versión no recibe mantenimiento.
- Solo se publica un fichero Q4_K_M; no hay otras cuantizaciones ni pesos en safetensors, lo que limita el reentrenamiento y el ajuste posterior.
- Sin benchmarks ni evaluación independiente: no hay datos objetivos de calidad conversacional ni de seguridad.
- Riesgo de sesgos heredados del dataset de ajuste y del modelo base, no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-qwen35-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión en producción (9B GGUF): https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf
- Fichero de pesos: https://huggingface.co/4everImmortality/dafeiyu-qwen35-4b-gguf/blob/main/dafeiyu_qwen35_4b_nomtp_q4_k_m.gguf
