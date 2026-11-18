# KRAFTON/Raon-1-nano-gguf

## Resumen

Raon-1 nano es un modelo de lenguaje denso de 3,2B parámetros desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Este repositorio concreto (`KRAFTON/Raon-1-nano-gguf`) contiene las cuantizaciones en formato GGUF del modelo base `KRAFTON/Raon-1-nano`, pensadas para su ejecución con llama.cpp en Apple Silicon, NVIDIA, AMD y CPU. El modelo está diseñado para seguir instrucciones, mantener contexto conversacional y realizar llamadas a herramientas (tool calling) tanto en coreano como en inglés.

La arquitectura es un transformer denso híbrido de 24 capas que combina 18 capas de Raon Delta Attention (atención lineal con regla delta y estado recurrente de tamaño fijo) y 6 capas de Gated MLA (atención completa con caché KV). Incorpora innovaciones propias como Raon-mHC (una variante optimizada de las hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones. El contexto declarado es de 262.144 tokens, un valor notablemente alto para su tamaño.

Su relevancia actual radica en la combinación de un contexto muy largo, licencia Apache 2.0 permisiva y disponibilidad en formatos de despliegue en dispositivo (GGUF para llama.cpp, MLX de 4 bits para Apple Silicon y un bundle LiteRT-LM). Esto lo sitúa como candidato para aplicaciones de agentes y asistentes con ventanas de contexto extensas en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.130.811.440 (3,2B, incluyendo 1,6B de la tabla de embeddings por capa) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 (convertidas desde pesos BF16) |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base en safetensors/BF16 |

Otros datos arquitectónicos del modelo base: 24 capas, hidden size 1.536, 16 cabezas en RDA (dimensión 128) y 32 cabezas en Gated MLA (192 QK / 128 V), rango LoRA de query/KV de 512/512, FFN intermedio de 6.144 con SwiGLU, codificación posicional NoPE (sin codificación posicional), 4 flujos residuales en Raon-mHC, embedding por capa de 256 dimensiones, vocabulario de 259.840 tokens y LM head atado a la entrada.

## Arquitectura y entrenamiento

El modelo adopta una disposición híbrida en la que 18 de las 24 capas usan Raon Delta Attention (RDA), una atención lineal con regla delta, puertas separadas de borrado y escritura, y un estado recurrente de tamaño fijo. Solo las 6 capas Gated MLA mantienen caché KV, lo que reduce el coste de memoria por token a aproximadamente 7 KiB en BF16. La codificación posicional es NoPE, es decir, no se aplican embeddings posicionales explícitos. Raon-mHC sustituye las manifold-constrained hyper-connections de DeepSeek por una variante de menor coste computacional, con cuatro flujos residuales, y cada capa incorpora un embedding propio de 256 dimensiones que ajusta su salida tras el MLP. La cabeza de lenguaje comparte pesos con el embedding de entrada.

No se dispone de información detallada en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). La model card menciona que el modelo está diseñado para instrucciones, conversación y tool calling en coreano e inglés, y que el modo de razonamiento (thinking) está activado por defecto en la plantilla de chat, pero no se detallan las técnicas de post-entrenamiento empleadas.

## Capacidades

- Generación de texto e instrucciones generales en coreano e inglés.
- Conversación multi-turno con ventanas de contexto de hasta 262.144 tokens.
- Tool calling / function calling, con ajustes de muestreo recomendados específicos para uso agéntico (temperature 1.0, presence_penalty 0.0).
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat; el límite de tokens de salida incluye el razonamiento y la respuesta final.
- Uso agéntico y razonamiento multi-paso, según la orientación de la model card hacia tareas de agente y código.
- Despliegue en dispositivo mediante GGUF (llama.cpp), MLX de 4 bits y LiteRT-LM.
- Compatibilidad con Transformers (`trust_remote_code=True`), vLLM, llama.cpp, MLX y LiteRT-LM.
- No se declaran capacidades de visión, audio ni otros modalidades en la información disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos en la ventana gracias a sus 262.144 tokens de contexto, útil para atención al cliente con historial completo o soporte técnico con manuales adjuntos.
- Agentes con tool calling: los ajustes de muestreo para uso agéntico y el soporte de llamadas a funciones permiten integrarlo en pipelines donde el modelo decide qué herramienta invocar, por ejemplo consultas a APIs internas o bases de datos.
- Ejecución local en portátiles y estaciones de trabajo: las cuantizaciones Q4_K_M y Q6_K están pensadas para llama.cpp en CPU, Apple Silicon y GPUs de consumo, lo que facilita prototipos sin infraestructura cloud.
- Aplicaciones en coreano e inglés: adecuado para productos bilingües dirigidos a esos mercados, como asistentes de soporte o generación de contenido en ambos idiomas.
- Despliegue en Apple Silicon: el modelo MLX de 4 bits complementa las cuantizaciones GGUF para inferencia nativa en Macs, útil en desarrollo y demos locales.
- Procesamiento de documentos extensos: con contexto de 262K tokens se pueden resumir, extraer información o responder preguntas sobre contratos, informes o código de gran tamaño en una sola pasada.
- Prototipado de agentes de código: la model card incluye ajustes específicos para tareas agénticas y de código, lo que permite integrarlo en asistentes de programación o automatización de tareas de desarrollo.

## Benchmarks y rendimiento

La model card del modelo base incluye una imagen con resultados de benchmarks, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en formato tabular en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada para 3,2B parámetros): Q4_K_M en torno a 2-2,5 GB, Q6_K en torno a 3 GB, Q8_0 en torno a 3,5-4 GB y F16 en torno a 6,5-7 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no están confirmadas en la documentación.
- GPU recomendadas: el modelo está pensado para despliegue en dispositivo; cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en cuantizaciones de 4-8 bits. Para F16 se recomienda al menos una GPU con 8 GB o más. No se especifican requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M, Q6_K y Q8_0 en la mayoría de GPUs modernas con 4-8 GB de VRAM; también en CPU y Apple Silicon.
- Opciones de despliegue: llama.cpp (formato GGUF de este repo), vLLM, Transformers con `trust_remote_code=True`, MLX (modelo de 4 bits para Apple Silicon) y LiteRT-LM. El repositorio no está restringido por gating.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada que permitan contrastar Raon-1 nano con alternativas de la misma categoría (modelos densos de aproximadamente 3B parámetros con contexto largo). La comparación cuantitativa con modelos como Qwen, Llama o Gemma de tamaño similar no está disponible en la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Raon-1 nano | 3,2B (denso) | 262.144 | Apache 2.0 | GGUF, MLX, LiteRT-LM, safetensors |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados: solo se declara soporte de coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación en la información disponible.
- Sesgos: no se detallan sesgos conocidos ni evaluaciones de seguridad en la model card proporcionada.
- El modo de razonamiento está activado por defecto, lo que consume tokens de salida adicionales; es necesario ajustar `max_new_tokens` o `max_tokens` para incluir razonamiento y respuesta final.
- La longitud efectiva de contexto puede degradarse en la práctica respecto al máximo declarado de 262.144 tokens; no se aportan evaluaciones de rendimiento por longitud.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos completos y las obligaciones de atribución.
- El repositorio GGUF depende de la rama `raon-1-nano` del fork de llama.cpp de KRAFTON; la compatibilidad con versiones upstream de llama.cpp no está confirmada en la información disponible.
- No se declaran capacidades multimodales; el modelo es exclusivamente de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Fork de llama.cpp de KRAFTON: https://github.com/krafton-ai/llama.cpp/tree/raon-1-nano
- Playground de Raon: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
