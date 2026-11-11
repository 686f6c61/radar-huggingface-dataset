# KRAFTON/Raon-1-nano-mlx

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2 mil millones de parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. El modelo está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas (tool calling) tanto en coreano como en inglés, y se distribuye bajo licencia Apache 2.0. Esta ficha concreta corresponde a la variante MLX, una cuantización a 4 bits con GPTQ (group size 64) pensada para ejecución en Apple Silicon.

La arquitectura es un transformer denso híbrido con 24 capas: 18 capas de Raon Delta Attention (atención lineal con delta-rule y estado recurrente de tamano fijo) y 6 capas de Gated MLA (atención completa con KV cache). Incorpora innovaciones propias como Raon-mHC (una versión optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones. El contexto es de 262.144 tokens, con codificación posicional NoPE.

Su relevancia actual radica en combinar contexto largo, tool calling y despliegue en dispositivo (on-device) en un modelo de tan solo 3,2B parámetros. La existencia de pesos en GGUF, MLX y LiteRT-LM, además de soporte en Transformers y vLLM, lo posiciona como candidato para asistentes locales y agentes ligeros. La variante MLX que aquí se documenta ocupa 1,9 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.130.797.136 (3,2B, incluye 1,6B de tabla de embeddings por capa) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits GPTQ (group size 64) en esta variante MLX; BF16 y GGUF disponibles en el ecosistema |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF y LiteRT-LM disponibles en otros repositorios |

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura densa de 24 capas con hidden size de 1.536 y FFN intermedio de 6.144 con activación SwiGLU. La atención es híbrida en proporción 3:1: 18 capas de Raon Delta Attention (atención lineal con regla delta, puertas separadas de borrado y escritura, y estado recurrente de tamano fijo) y 6 capas de Gated MLA (atención completa con LoRA rank 512 tanto en query como en KV). Solo las capas MLA mantienen KV cache, aproximadamente 7 KiB por token en BF16. Las cabezas son 16 para RDA y 32 para Gated MLA, con dimensión 128 en RDA y 192 QK / 128 V en MLA. El modelo no usa codificación posicional (NoPE).

Dos innovaciones destacan sobre la arquitectura base: Raon-mHC, que reduce el coste computacional de las manifold-constrained hyper-connections de DeepSeek mediante cuatro flujos residuales, y los embeddings por capa, un vector aprendido de 256 dimensiones por token y capa que cada capa usa para ajustar su salida tras el MLP. El vocabulario es de 259.840 tokens y el LM head está atado a los embeddings de entrada. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con ventana de 262.144 tokens.
- Modo "thinking" activado por defecto en la plantilla de chat; el límite de tokens de salida incluye tanto el razonamiento como la respuesta final.
- Tool calling / function calling, con ajustes de muestreo específicos para uso agéntico (temperature 1.0).
- Seguimiento de instrucciones y respuesta a preguntas de conocimiento general.
- Capacidades bilingües coreano-inglés.
- Ejecución local en dispositivo mediante MLX, GGUF (llama.cpp) y LiteRT-LM.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en Mac: la variante MLX de 4 bits ocupa 1,9 GB y se ejecuta en Apple Silicon sin GPU dedicada, lo que permite asistentes privados que no envían datos a la nube.
- Agente con tool calling en pipelines de automatización: con temperature 1.0 y soporte de function calling, puede encadenar llamadas a APIs y razonamiento multi-paso en tareas de extracción o enrutamiento.
- Procesamiento de documentos largos: el contexto de 262.144 tokens permite resumir o consultar contratos, informes o transcripciones extensas en una sola pasada, con un KV cache reducido gracias a las capas RDA.
- Atención al cliente bilingüe coreano-inglés: el modelo mantiene contexto conversacional y puede integrarse en un servidor compatible con OpenAI (vLLM) para gestionar sesiones multi-turno.
- Generación y asistencia de código en entornos agénticos: el ajuste de muestreo recomendado para código y agentes (temperature 1.0) sugiere uso en tareas de autocompletado o edición guiada por herramientas.
- Despliegue en dispositivos de borde: el bundle LiteRT-LM y los pesos GGUF permiten ejecutar el modelo en CPU, NVIDIA, AMD y Apple Silicon dentro de aplicaciones locales con requisitos de latencia moderados.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (`raon-1-nano-benchmark.png`), pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para la variante MLX de 4 bits (repo de 1,9 GB); en BF16 el modelo completo ronda los 6,3 GB de pesos.
- GPU recomendadas: cualquier Apple Silicon para la variante MLX; GPU NVIDIA o AMD para GGUF y vLLM; CPU para llama.cpp.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM en cuantización de 4 bits (por ejemplo RTX 3060, RTX 4060, RTX 4090 con margen amplio).
- Opciones de despliegue: Transformers (`trust_remote_code=True`), vLLM, llama.cpp, MLX y LiteRT-LM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 nano (MLX) | 3,2B denso | 262.144 | Apache 2.0 | Hugging Face (MLX, GGUF, LiteRT-LM, Transformers, vLLM) |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo se documentan coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni tasas de alucinación.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Contexto: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento en tareas de recuperación en contexto largo (needle-in-a-haystack).
- Modo thinking: activado por defecto, lo que incrementa el consumo de tokens de salida; hay que ajustar `max_new_tokens` en consecuencia.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones de los artefactos derivados (GGUF, LiteRT-LM) por si difieren.
- Esta variante MLX está cuantizada a 4 bits con GPTQ, lo que puede degradar ligeramente la calidad frente a BF16; la model card indica que existe una exportación BF16 para MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Playground: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
