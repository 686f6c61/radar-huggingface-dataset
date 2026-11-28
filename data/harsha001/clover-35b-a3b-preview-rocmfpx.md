# Harsha001/Clover-35B-A3B-Preview-ROCmFPX

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusión por bloques (block diffusion) desarrollado por DiffuSpace, con 34.661.381.759 parámetros totales y aproximadamente 3.000 millones activos por token gracias a una arquitectura de mezcla de expertos (MoE) con 256 expertos, 8 activos por token y un experto compartido. Parte de Qwen3.6-35B-A3B, es de solo texto y ofrece una ventana de contexto de 128K tokens. Su enfoque de difusión por bloques lo diferencia de los transformers autorregresivos convencionales, ya que genera tokens mediante un proceso de denoising iterativo sobre bloques.

El repositorio analizado, Harsha001/Clover-35B-A3B-Preview-ROCmFPX, no es el modelo original, sino una cuantización comunitaria en formato GGUF para el fork ROCmFPX de llama.cpp, orientado a GPUs AMD (Vulkan y HIP/ROCm) y en particular a equipos con memoria unificada como Strix Halo. Incluye cuatro variantes: Q8_0 (35,8 GB), Q6_K (28,7 GB, recomendada), Q4_0 ROCmFP4 STRIX O8 (18,8 GB) y Q4_0 ROCmFP4 FAST (18,5 GB). La licencia es Apache 2.0.

La relevancia actual radica en la combinación de un modelo MoE de 35B con contexto de 128K y un esquema de difusión por bloques, empaquetado en cuantizaciones de bajo bit para hardware AMD de consumo y estaciones de trabajo. No obstante, el autor advierte que los archivos no se han probado todavía en hardware AMD real y que requieren un build específico de ROCmFPX (commit `642acd395` o posterior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con difusión por bloques (block diffusion), 256 expertos, 8 por token, 1 experto compartido; base Qwen3.6-35B-A3B |
| Parametros totales | 34.661.381.759 (34,66B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q8_0, Q6_K (ROCmFPX `Q6_0_ROCMFPX`), Q4_0 ROCmFP4 STRIX O8, Q4_0 ROCmFP4 FAST (formato ROCmFPX); también existen Q8_0, Q6_K y Q4_K_M estándar de llama.cpp |
| Idiomas soportados | no disponible (modelo de solo texto; la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ROCmFPX); el modelo base en safetensors/BF16 |
| Tamano del repo | 101,8 GB |
| Modalidad | Solo texto |
| Backends soportados | ROCmFPX (fork de llama.cpp, Vulkan y HIP/ROCm); SGLang y llama.cpp según DiffuSpace |

## Arquitectura y entrenamiento

Clover-35B-A3B-Preview emplea una arquitectura de mezcla de expertos sobre un backbone derivado de Qwen3.6-35B-A3B, con 256 expertos enrutados, 8 activos por token y un experto compartido, lo que resulta en unos 3B parámetros activos por token sobre 34,66B totales. La innovación principal es el paradigma de difusión por bloques: en lugar de generar token a token de forma autorregresiva pura, el modelo aplica un proceso de denoising iterativo sobre bloques de tokens. Según la model card del repositorio de cuantización, el modelo puede ejecutarse también como un modelo de siguiente token convencional en `llama-server` (un token a la vez, sin difusión por bloques), que es como se realizaron las pruebas de GSM8K reportadas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. El repositorio de cuantización incluye escalas por tensor (cada matriz de pesos se multiplica por una potencia de dos) y el autor indica que las cuantizaciones ROCmFPX se generaron con imatrix. La model card señala que todos los archivos cuantizados de este modelo, tanto estándar como ROCmFPX, se desvían más del BF16 que el mismo tipo de cuantización en otros modelos basados en Qwen3.6 (por ejemplo, un Q8_0 estándar presenta KL 0,054 aquí frente a 0,008 en Groot-19B-A3B), atribuyéndolo al propio modelo y no a ruido de medición.

## Capacidades

- Generación de texto en modo autorregresivo convencional y en modo de difusión por bloques (según el backend de DiffuSpace).
- Razonamiento matemático: en la prueba GSM8K reportada, el BF16 obtuvo 97/100 y 192/200 con decodificación greedy y `enable_thinking: false`.
- Modo de pensamiento (thinking) configurable: las pruebas se ejecutaron con `enable_thinking: false`, lo que implica que el modelo soporta un modo de razonamiento explícito activable.
- Contexto largo de 128K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades conversacionales (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Visión y audio: no soportados (modelo de solo texto).

## Casos de uso

- Razonamiento matemático y resolución de problemas paso a paso: el modelo muestra una precisión del 97% en GSM8K con decodificación greedy y thinking desactivado, por lo que es adecuado para asistentes de cálculo, verificación de operaciones y tutoría matemática en entornos donde se requiere trazabilidad del resultado final.
- Procesamiento de documentos largos: con 128K tokens de contexto, puede analizar informes, contratos o bases de código extensas en una sola pasada, resumiendo o extrayendo información sin fragmentar el material.
- Generación de texto conversacional: su tag `conversational` y la compatibilidad con endpoints lo hacen apto para chatbots multi-turno desplegados sobre `llama-server` o SGLang, manteniendo el contexto de la conversación durante muchas interacciones.
- Inferencia en hardware AMD con memoria unificada: las variantes ROCmFP4 (18,5-18,8 GB) están pensadas para ejecutarse en equipos Strix Halo de 128 GB mediante el fork ROCmFPX con backend Vulkan o HIP/ROCm, lo que permite desplegar un MoE de 35B en una estación de trabajo sin GPUs discretas de gran VRAM.
- Experimentación con modelos de difusión: investigadores interesados en paradigmas de generación no autorregresiva pueden usar el modelo base con los backends de DiffuSpace (SGLang y llama.cpp) para comparar difusión por bloques frente a decodificación autorregresiva en tareas de generación y matemáticas.
- Evaluación de cuantizaciones de bajo bit: el repositorio incluye métricas de divergencia KL, coincidencia de top token y perplejidad frente a BF16, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de cuantizaciones ROCmFPX en modelos MoE.
- Despliegue en entornos con restricciones de memoria: la variante Q6_K (28,7 GB) ofrece una fidelidad cercana al 8-bit con menor huella, adecuada para servidores con 32 GB de VRAM o memoria unificada.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del repositorio de cuantización y miden la fidelidad de cada archivo respecto al BF16, no el rendimiento absoluto del modelo frente a otros. La perplejidad se calculó con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 (Wikipedia en inglés) en CPU.

| Archivo | Tamano | KL a BF16 | Mismo top token | PPL | GSM8K (100 preguntas) |
|---|---:|---:|---:|---:|---:|
| BF16 (referencia) | — | 0,000000 | 99,99% | 9,45 | 97 |
| Q8_0 ROCmFPX | 35,8 GB | 0,0622 | 89,3% | 9,49 | 99 |
| Q6_K ROCmFPX (recomendada) | 28,7 GB | 0,0652 | 88,9% | 9,36 | 38/39 (prueba interrumpida) |
| Q4_0 ROCmFP4 STRIX O8 | 18,8 GB | 0,1848 | 80,9% | 9,92 | 97 |
| Q4_0 ROCmFP4 FAST | 18,5 GB | 0,1865 | 80,4% | 9,69 | 98 |
| Q8_0 estándar (llama.cpp) | 36,9 GB | 0,0539 | 89,7% | 9,42 | — |
| Q6_K estándar (llama.cpp) | 28,5 GB | 0,0727 | 88,0% | 9,67 | — |
| Q4_K_M estándar (llama.cpp) | 21,2 GB | 0,1191 | 84,3% | 9,54 | 97 |

En la prueba ampliada a 200 preguntas de GSM8K: BF16 192, Q4_K_M estándar 190 y Q8_0 ROCmFPX 195. El autor indica que con 100 preguntas una diferencia de uno o dos aciertos es ruido estadístico. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

Velocidad medida en CPU (ARM, 20 núcleos, `llama-bench`, prompt de 512 tokens, 128 tokens generados, 20 hilos):

| Archivo | Prompt (tok/s) | Generación (tok/s) |
|---|---:|---:|
| Q4_K_M estándar | 99,8 | 22,8 |
| Q8_0 ROCmFPX | 90,3 | 17,3 |
| Q6_K ROCmFPX | 2,8 | 0,8 |
| Q4_0 ROCmFP4 STRIX O8 | 21,9 | 2,2 |
| Q4_0 ROCmFP4 FAST | 21,4 | 2,2 |

No hay cifras de velocidad en GPU AMD; el autor advierte que las pruebas se hicieron en CPU y que el código del fork para los tipos de 6 y 4 bits es lento en CPU, lo que no predice su rendimiento en AMD.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: Q8_0 ROCmFPX 35,8 GB; Q6_K ROCmFPX 28,7 GB; Q4_0 ROCmFP4 STRIX O8 18,8 GB; Q4_0 ROCmFP4 FAST 18,5 GB; Q4_K_M estándar 21,2 GB.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. El formato está orientado a GPUs AMD con ROCm/Vulkan y a equipos de memoria unificada como Strix Halo (128 GB). No se especifican modelos como A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? Las variantes de 4 bits (18,5-18,8 GB) podrían caber en GPUs con 24 GB de VRAM, pero no se ha verificado en la información proporcionada. La variante Q6_K (28,7 GB) requiere al menos 32 GB de memoria. El autor no ha probado los archivos en hardware AMD.
- Opciones de despliegue: fork ROCmFPX de llama.cpp (build del 29 de octubre de 2026 o posterior, commit `642acd395`; soporte de Clover añadido el 28 de octubre) con backends Vulkan y HIP/ROCm; DiffuSpace ofrece backends SGLang y llama.cpp para el modelo base. llama.cpp estándar, LM Studio, Ollama y otros builds de ROCmFPX pueden no cargar estos archivos.
- Latencia y throughput: solo disponibles en CPU (ver tabla de velocidad). En CPU, el autor recomienda usar el archivo de 8 bits o un archivo estándar de llama.cpp, ya que los tipos de 6 y 4 bits ROCmFPX son muy lentos en esa plataforma.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos de la misma categoría. Los únicos puntos de referencia son las cuantizaciones estándar de llama.cpp del mismo modelo y el modelo base Qwen3.6-35B-A3B del que deriva.

| Modelo / variante | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (BF16) | 34,66B totales, ~3B activos | 128K | Apache 2.0 | safetensors/BF16 | Modelo base de difusión por bloques |
| Clover-35B-A3B-Preview Q6_K ROCmFPX | 34,66B totales, ~3B activos | 128K | Apache 2.0 | GGUF ROCmFPX | KL 0,0652; recomendada por el autor |
| Clover-35B-A3B-Preview Q4_K_M estándar | 34,66B totales, ~3B activos | 128K | Apache 2.0 | GGUF | KL 0,1191; mejor fidelidad que ROCmFP4 a 4 bits |
| Qwen3.6-35B-A3B (modelo de partida) | ~35B totales, ~3B activos | no disponible | no disponible | no disponible | Base autorregresiva de la que parte Clover |

Comparativa con alternativas de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Los archivos ROCmFPX no se han probado en hardware AMD; el autor lo indica explícitamente. Las métricas de velocidad son de CPU y no representan el rendimiento en GPU.
- Requieren un build específico de ROCmFPX (29 de octubre de 2026 o posterior, commit `642acd395`). llama.cpp estándar, LM Studio, Ollama y otros builds pueden no cargar los archivos.
- Deriva de cuantización superior a la habitual: incluso el Q8_0 estándar presenta KL 0,054 frente a 0,008 en otros modelos Qwen3.6, según el autor. A 4 bits, el Q4_K_M estándar es claramente más fiel que los archivos ROCmFP4 (KL 0,119 frente a 0,185), a costa de 2,4-2,7 GB más.
- En CPU, los tipos ROCmFPX de 6 y 4 bits son extremadamente lentos (0,8-2,2 tok/s de generación); el autor recomienda el archivo de 8 bits o un archivo estándar en esa plataforma.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto, especialmente en dominios no verificados.
- Limitaciones de idioma: la model card no especifica idiomas soportados; el modelo es de solo texto y las pruebas se hicieron en inglés (wikitext-2 y GSM8K).
- Licencia Apache 2.0: permite uso comercial, pero el repositorio es una cuantización no oficial; conviene verificar la licencia del modelo base Diffuspace/Clover-35B-A3B-Preview antes de producción.
- El repositorio es una contribución comunitaria (autor Harsha001), no una release oficial de DiffuSpace; el crédito del modelo corresponde a DiffuSpace.
- La variante Q6_K ROCmFPX solo completó 39 preguntas de GSM8K antes de interrumpirse la prueba por lentitud, por lo que su evaluación matemática es parcial.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/Harsha001/Clover-35B-A3B-Preview-ROCmFPX
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Código del modelo base (SGLang y llama.cpp): https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- ROCmFPX (referencia alternativa): https://github.com/charlie12345/ROCmFPX
- Modelo destacado del autor: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
