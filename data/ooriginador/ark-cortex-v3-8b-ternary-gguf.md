# Ooriginador/Ark-Cortex-v3-8B-Ternary-GGUF

## Resumen

Ark-Cortex v3 (ACX-03) es un modelo de lenguaje de 8.190.735.360 parámetros desarrollado por el ArkheionNet AI Research Consortium (bajo el usuario de Hugging Face Ooriginador), que opera en representación ternaria nativa de 1,58 bits en base 3 (valores {-1, 0, +1}). El modelo se deriva de Qwen3 en precisión completa mediante un proceso de cuantización con entrenamiento consciente de la cuantización (QAT) en dos etapas, con destilación continua contra trayectorias de razonamiento de DeepSeek-R1.

Su propuesta de valor es clara: reducir la huella de memoria de 16,38 GB (BF16) a 4,14 GB, un 74,7 % menos, lo que permite ejecutar un modelo de 8B en GPUs de consumo con 8 GB de VRAM e incluso en portátiles con 6 GB de RAM. Esto lo sitúa en la categoría de "sovereign AI" local, orientada a inferencia en hardware propio sin dependencia de la nube.

El modelo conserva capacidades de razonamiento profundo mediante tokens de cadena de pensamiento (`<think>...</think>`), incorpora predicción multi-token (MTP) con 4 cabezas auxiliares para decodificación especulativa, y está optimizado a nivel de silicio con kernels HIP Wave32 fusionados para hardware AMD RDNA2/RDNA3, alcanzando hasta 68 tokens/s en GPUs de consumo. Se distribuye en formato GGUF con cuantización Q2_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3, 36 capas decodificador, 252 proyecciones lineales, ternario nativo base-3 (1,58 bits) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1,58 bits base-3, escala FP16 por grupo de 64 pesos (g=64), especificacion de bloque Q2_0 |
| Idiomas soportados | Ingles (en), portugues (pt), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q2_0) y formato .ark |

## Arquitectura y entrenamiento

Ark-Cortex v3 parte de la arquitectura transformer densa de Qwen3 (8B, 36 capas decodificador con 252 proyecciones lineales) y la convierte a una representacion ternaria nativa en base 3. Cada peso se expresa exactamente como w = s_g · t, donde t pertenece a {-1, 0, +1} y s_g es un factor de escala FP16 por cada bloque de 64 pesos contiguos (g=64), lo que coincide con la especificacion de bloque Q2_0. Esta representacion exacta evita el error catastrofico tipico de la cuantizacion post-entrenamiento naive.

La conversion se realiza mediante un regimen de cuantizacion con entrenamiento consciente de la cuantizacion (QAT) en dos etapas, con una tecnica propia denominada Orthogonal Trit Gradient Evolution (TGE), y destilacion continua contra trayectorias de razonamiento de DeepSeek-R1. Entre las innovaciones destacan la prediccion multi-token (MTP) con 4 cabezas auxiliares encadenadas (prediccion de los tokens t+2 a t+5) para decodificacion especulativa, y kernels HIP Wave32 fusionados con ejecucion cooperativa sub-warp para acelerar la inferencia en GPUs AMD. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento con cadena de pensamiento nativa: genera tokens `<think> ... </think>` antes de la respuesta final, herencia de la destilacion contra DeepSeek-R1.
- Razonamiento matematico multi-paso (GSM8K, MATH-500).
- Generacion de codigo en Python (HumanEval, LiveCodeBench).
- Conocimiento general y resolucion de problemas (MMLU, MMLU-Pro).
- Razonamiento cientifico (GPQA Diamond).
- Prediccion multi-token (MTP) con 4 cabezas auxiliares para decodificacion especulativa y mejor previsibilidad causal.
- Soporte multilingue en ingles, portugues y chino.
- No se ha publicado informacion sobre soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- **Inferencia local en portatiles y GPUs de consumo:** con solo 4,14 GB de pesos, el modelo completo de 8B cabe en GPUs de 8 GB de VRAM (RTX 3060/4060, Radeon RX 6600M) o en maquinas con 6 GB de RAM, ideal para despliegues sin nube.
- **Asistentes de razonamiento matematico offline:** el modo `<think>` permite resolver problemas de matematicas de nivel escolar y universitario (78,4 % en GSM8K) sin conexion, util en educacion o entornos con conectividad limitada.
- **Despliegues soberanos en hardware AMD:** los kernels HIP Wave32 optimizados para RDNA2/RDNA3 (hasta 68 tok/s) lo hacen adecuado para organizaciones con parque de GPUs AMD que quieren IA local sin depender del ecosistema CUDA.
- **Generacion y asistencia de codigo en Python en local:** con 36,8 % Pass@1 en HumanEval, puede integrarse en editores locales tipo completacion asistida para tareas de dificultad media.
- **Asistentes conversacionales multilingues:** soporte de ingles, portugues y chino para chatbots locales en mercados iberoamericanos y asiaticos.
- **Procesamiento por lotes en estaciones de trabajo modestas:** la baja huella de memoria permite ejecutar multiples instancias concurrentes en una sola GPU para tareas de clasificacion, resumen o extraccion.
- **Investigacion en cuantizacion extrema:** al ser un ejemplo documentado de ternario nativo 1,58 bits con QAT, sirve como base de estudio para grupos de investigacion en modelos de baja precision.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Evaluados con lm-evaluation-harness, EvalScope y llama-perplexity, con decodificacion greedy (temperature=0.0):

| Benchmark | Configuracion | Ark-Cortex v3 (ACX-03 8B Q2_0) | Qwen3-8B (BF16) | Qwen3-4B (BF16) | BitNet b1.58 (2B/3B) | Retencion vs. profesor |
|---|---|---|---|---|---|---|
| GSM8K | 4-shot CoT (EM) | 78,4 % | 84,2 % | 76,8 % | 58,4 % | 93,1 % |
| MATH-500 | 0-shot CoT | 67,4 % | 73,2 % | 61,5 % | 43,4 % | 92,1 % |
| MMLU | 5-shot | 74,2 % | no disponible | no disponible | no disponible | no disponible |
| MMLU-Pro | 5-shot | 65,8 % | no disponible | no disponible | no disponible | no disponible |
| GPQA Diamond | 0-shot CoT | 38,0 % | no disponible | no disponible | no disponible | no disponible |
| HumanEval | 0-shot Pass@1 | 36,8 % | no disponible | no disponible | no disponible | no disponible |
| LiveCodeBench | Pass@1 | 32,5 % | no disponible | no disponible | no disponible | no disponible |
| WikiText-2 | Perplejidad (ctx 2048) | 24,1 | no disponible | no disponible | no disponible | no disponible |

La model card tambien menciona resultados de AIME 2024 (0-shot CoT, pass@1) para Qwen3-8B y Ark-Cortex v3, pero el valor de ACX-03 no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- **VRAM para inferencia:** 4,14 GB solo de pesos; con la KV cache y overhead de runtime, se estima que basta una GPU de 8 GB de VRAM (dato de la model card: ejecucion completa en 8 GB).
- **GPUs recomendadas:** NVIDIA RTX 3060/4060 y AMD Radeon RX 6600M (mencionadas explicitamente en la model card). Los kernels HIP Wave32 estan optimizados para AMD RDNA2/RDNA3, donde se alcanzan hasta 68 tok/s.
- **Consumer GPUs:** si cabe; es uno de sus puntos fuertes. Incluso portatiles con 6 GB de RAM pueden ejecutarlo segun el autor.
- **Opciones de despliegue:** formato GGUF, por lo que es compatible con llama.cpp y derivados (Ollama, LM Studio). La model card menciona llama-perplexity para evaluacion, lo que confirma compatibilidad con la toolchain de llama.cpp. No se menciona soporte para vLLM o TGI.
- **Latencia y throughput:** hasta 68 tok/s en hardware AMD RDNA2/RDNA3 de consumo gracias a los kernels HIP Wave32 fusionados. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ark-Cortex v3 (ACX-03) | 8,19 B | Ternaria nativa 1,58 bits (Q2_0) | no disponible | Apache 2.0 | GGUF publico en Hugging Face |
| Qwen3-8B (denso, profesor) | 8 B | BF16 (16,38 GB) | no disponible en la informacion proporcionada | Apache 2.0 | Pesos completos publicos |
| BitNet b1.58 (2B/3B) | 2-3 B | Ternaria 1,58 bits | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Pesos publicos (MIT en versiones oficiales de Microsoft) |
| Qwen3-4B (denso) | 4 B | BF16 | no disponible en la informacion proporcionada | Apache 2.0 | Pesos completos publicos |

Ark-Cortex v3 se posiciona entre Qwen3-8B (su modelo profesor, al que retiene entre el 92 % y el 93 % de rendimiento en matematicas) y BitNet b1.58, al que supera claramente en los benchmarks de matematicas siendo ademas un modelo mucho mayor. Su ventaja diferencial frente a Qwen3-8B es el consumo de memoria (4,14 GB frente a 16,38 GB).

## Limitaciones y advertencias

- **Benchmarks no verificados:** todos los resultados provienen de la model card del autor y estan marcados como "verified: false"; no existe evaluacion independiente conocida.
- **Perplejidad elevada:** 24,1 en WikiText-2 es un valor alto para un modelo de 8B, lo que sugiere degradacion en modelado de lenguaje general respecto al profesor BF16.
- **Rendimiento modesto en codigo:** 36,8 % Pass@1 en HumanEval y 32,5 % en LiveCodeBench estan por debajo de modelos densos de 8B sin cuantizar; esperar errores en tareas complejas de programacion.
- **GPQA Diamond bajo (38,0 %):** el razonamiento cientifico de nivel experto es una debilidad clara.
- **Idiomas limitados:** solo ingles, portugues y chino; sin soporte declarado para castellano, lo que puede degradar el rendimiento en espanol.
- **Longitud de contexto no documentada:** no se publica la ventana de contexto, un dato critico para planificar aplicaciones.
- **Cuantizacion extrema:** la representacion ternaria Q2_0 puede acentuar alucinaciones y perdida de detalle factual frente al modelo de precision completa; se recomienda validacion humana en usos criticos.
- **Sesgos:** no se ha publicado informacion sobre sesgos conocidos; al derivar de Qwen3 y destilarse de DeepSeek-R1, hereda potencialmente los sesgos de ambos.
- **Uso comercial:** la licencia Apache 2.0 permite uso comercial sin restricciones significativas.
- **Proyecto de autor individual:** el ecosistema (ArkheionNet) es de autor independiente con 222 descargas; la madurez del software de inferencia (kernels HIP propios) puede implicar riesgos de mantenimiento y soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ooriginador/Ark-Cortex-v3-8B-Ternary-GGUF
- Repositorio GitHub de ArkheionNet Sovereign Stack: https://github.com/jhonslife/ArkheionNet
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
