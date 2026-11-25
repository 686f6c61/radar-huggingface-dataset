# KRAFTON/Raon-1-nano-mlx

## Resumen

Raon-1 nano (MLX) es la versión cuantizada y optimizada para Apple Silicon del modelo Raon-1 nano de KRAFTON AI, un modelo de lenguaje denso de 3.2B parámetros diseñado para seguir instrucciones, mantener contexto conversacional y ejecutar tool calling en coreano e inglés. Esta variante concreta contiene los pesos en formato MLX, cuantizados a 4 bits con GPTQ (group size 64), lo que permite ejecutar el modelo de forma local en equipos Mac con chip de la serie M.

El modelo destaca por su arquitectura híbrida de atención: 18 capas de Raon Delta Attention (atención lineal con estado recurrente de tamaño fijo) y 6 capas de Gated MLA, lo que reduce drásticamente el coste de memoria del KV cache en contextos largos. Incorpora además innovaciones propias como Raon-mHC (una versión optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones, con embeddings de entrada y LM head compartidos.

Con una ventana de contexto de 262.144 tokens y licencia Apache 2.0, Raon-1 nano se posiciona como una opción compacta para despliegue en dispositivo (on-device) y en entornos con recursos limitados, manteniendo capacidades de razonamiento, conversación y agentes. Esta versión MLX está pensada específicamente para el ecosistema de Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense híbrida (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parámetros totales | 3.130.797.136 (3.2B, incluye tabla de embeddings por capa de 1.6B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4 bits GPTQ (group size 64) en esta versión MLX; export BF16 disponible |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); el modelo base ofrece también GGUF y LiteRT-LM |

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura transformer densa de 24 capas con un diseño de atención híbrido en proporción 3:1. Dieciocho capas usan Raon Delta Attention (RDA), una atención lineal con regla delta condicionada por compuertas (gated delta-rule) con compuertas separadas de borrado y escritura y un estado recurrente de tamaño fijo; las seis capas restantes usan Gated MLA. Solo estas últimas mantienen KV cache, aproximadamente 7 KiB por token en BF16, lo que hace viable el contexto de 262.144 tokens con un coste de memoria muy contenido. El modelo no usa codificación posicional (NoPE).

La dimensión oculta es de 1.536, con FFN de 6.144 y activación SwiGLU. Las capas RDA tienen 16 cabezas de dimensión 128; las Gated MLA tienen 32 cabezas con dimensión 192 para QK y 128 para V, y rango LoRA de 512 tanto en query como en KV. El vocabulario es de 259.840 tokens y el LM head está atado a los embeddings de entrada. Cada capa incorpora un embedding propio de 256 dimensiones que ajusta su salida tras el MLP. Las conexiones residuales usan Raon-mHC con 4 streams, una reducción del coste computacional de las mHC de DeepSeek que acelera el entrenamiento.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento en coreano e inglés.
- Seguimiento de instrucciones y conversación multi-turno.
- Tool calling / function calling, con ajustes de muestreo específicos para uso agéntico.
- Modo thinking habilitado por defecto en la plantilla de chat (el bundle LiteRT-LM responde sin thinking).
- Razonamiento multi-paso orientado a agentes.
- Generación de código (categoría agentic/code en los ajustes recomendados).
- Contexto largo de hasta 262.144 tokens para documentos extensos o historiales largos.
- Despliegue on-device en Apple Silicon mediante MLX.

## Casos de uso

- Asistente conversacional local en Mac: con la cuantización 4-bit MLX y 3.2B parámetros, el modelo cabe en memoria unificada de equipos Apple Silicon y permite un asistente privado sin conexión, con contexto suficiente para conversaciones largas.
- Agente con tool calling en flujos de automatización: los ajustes recomendados para agentic/code (temperature 1.0, presence_penalty 0.0) y el soporte de function calling lo hacen adecuado para orquestar APIs y ejecutar tareas multi-paso.
- Procesamiento de documentos largos en coreano e inglés: la ventana de 262.144 tokens y el bajo coste de KV cache (solo 6 capas MLA) permiten resumir o extraer información de contratos, informes o bases de código extensas.
- Generación de código en pipelines de desarrollo: puede integrarse como asistente de código en editores o scripts de CI/CD, con modo thinking para tareas de razonamiento y ajustes de muestreo orientados a código.
- Atención al cliente automatizada bilingüe (coreano/inglés): el modelo mantiene contexto conversacional multi-turno y puede conectarse a sistemas de ticketing mediante tool calling.
- Prototipado e investigación en entornos con recursos limitados: al ser Apache 2.0 y ejecutable en local, sirve para experimentar con arquitecturas de atención híbrida y contextos largos sin infraestructura de GPU dedicada.
- Despliegue en dispositivo (edge): la disponibilidad de GGUF para llama.cpp y LiteRT-LM, además de MLX, permite llevar el modelo a portátiles y dispositivos sin GPU de datacenter.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks, pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio MLX ocupa 1.9 GB en cuantización 4-bit GPTQ, por lo que se necesita algo más de esa cifra de memoria unificada para cargar los pesos y el estado de inferencia.
- GPU recomendadas: Apple Silicon (serie M) para esta variante MLX; el modelo base admite NVIDIA, AMD y CPU mediante GGUF y vLLM/TGI para GPU de datacenter.
- ¿Cabe en GPU de consumo? Sí: en equipos Apple Silicon con memoria unificada suficiente; en GPU NVIDIA de consumo sería necesario usar la variante GGUF del modelo base.
- Opciones de despliegue: MLX (esta variante), Transformers con `trust_remote_code=True`, vLLM, llama.cpp (GGUF) y LiteRT-LM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Raon-1 nano (MLX) | 3.2B denso | 262.144 | Apache 2.0 | MLX, GGUF, LiteRT-LM, Transformers, vLLM | Atención híbrida RDA + Gated MLA, coreano/inglés |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado únicamente para coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo de 3B parámetros, puede producir información incorrecta, especialmente en tareas de conocimiento factual.
- Sesgos: no se documentan en la información disponible los sesgos conocidos del modelo.
- Modo thinking: está activado por defecto en la plantilla de chat; el límite de `max_new_tokens` incluye tanto el razonamiento como la respuesta final, por lo que debe ajustarse en consecuencia.
- Ajustes de muestreo: usar los valores recomendados por tarea (0.1/1.5 para general, 1.0/0.0 para agentic/code) para evitar degradación de calidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes de terceros.
- Esta variante MLX está pensada para Apple Silicon; para otros hardware debe usarse el modelo base en otro formato.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Página de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
