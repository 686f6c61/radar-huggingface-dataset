# Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p50

## Resumen

`Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado Basis Sharing, una técnica de compresión de bajo rango que obliga a pares de capas adyacentes a compartir una base por tipo de peso. El objetivo declarado de esta celda concreta no es producir un modelo utilizable, sino medir si la compresión agresiva (50 % de parámetros eliminados) degrada la conducta de rechazo de peticiones dañinas y en qué medida introducen los datos de seguridad en la fase de calibración un sesgo de sobre-rechazo.

El flujo es el siguiente: SVD blanqueado de los pesos concatenados horizontalmente de cada grupo (ajuste de base compartida), recuperación mediante LoRA aplicada únicamente a los coeficientes con las bases congeladas, fusión de coeficientes (`C' = C + (alpha/r)BA`) y plegado final a forma densa (`W = C' @ B`). La calibración usa 256 secuencias de WikiText-2 de 2.048 tokens con semilla 42, más 2 secuencias empaquetadas con los 100 comportamientos dañinos de JailbreakBench (el 0,78 % de los tokens de calibración); la recuperación LoRA (r=8, alpha 16, 2 épocas, lr 1e-4, batch 64) se hace sobre `yahma/alpaca-cleaned`.

Es relevante ahora porque cuantifica empíricamente un compromiso poco documentado en la literatura de compresión: la pérdida de utilidad medida (perplejidad 13,08 en WikiText-2) convive con una tasa de sobre-rechazo macro del 36,95 % en XSTest-safe y OR-Bench-Hard-1K, mientras la tasa de éxito de ataque (ASR) frente a AdvBench y StrongREJECT se mantiene en 7,69 % y 8,31 %. El modelo tiene 6.738.415.616 parámetros almacenados, contexto de 4.096 tokens heredado del base y se publica bajo licencia Llama 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama; pesos densos de rango deficiente tras el plegado de bases compartidas de bajo rango (Basis Sharing) |
| Parámetros totales | 6.738.415.616 (recuento real de safetensors; coincide con el del modelo base denso) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Fracción de parámetros retenida | 0,49982796308290156 (50 % eliminado, 50 % conservado) |
| Longitud de contexto | 4.096 tokens (heredado de `meta-llama/Llama-2-7b-chat-hf`) |
| Tipos de cuantización | no disponible (el autor no publica variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base está entrenado mayoritariamente en inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors (repositorio de 13,5 GB, coherente con fp16) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tipos de pesos compartidos | `v`, `k`, `q`, `up`, `gate` (una base por grupo de 2 capas adyacentes) |
| Tipos de pesos privados | `down`, `o` (una matriz por capa) |
| Fecha de creación | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: decoder-only con normalización RMSNorm, activación SwiGLU, atención con grouped-query attention (GQA) y embeddings rotatorios (RoPE). Sobre ella se aplica Basis Sharing: los pesos de varios tipos (`v`, `k`, `q`, `up`, `gate`) se concatenan horizontalmente por grupos de dos capas adyacentes y se factorizan mediante una SVD blanqueada que produce una base compartida por grupo y un conjunto de coeficientes por capa. Los tipos `down` y `o` quedan como matrices privadas de cada capa. La calibración se realiza con 256 secuencias de WikiText-2 de 2.048 tokens (semilla 42) más 2 secuencias empaquetadas con los 100 comportamientos dañinos de JailbreakBench (solo prompt y cabecera de assistant, sin respuesta), que representan el 0,78 % de los tokens de calibración.

La innovación metodológica del artefacto es que la recuperación entrena exclusivamente los coeficientes: las bases compartidas y privadas permanecen congeladas y son bit a bit idénticas a las del modelo comprimido, de modo que cada peso conserva rango ≤ k, cada grupo sigue compartiendo una única base y el presupuesto de parámetros sobrevive a la recuperación de forma exacta. No se emplea el LoRA propio de Basis Sharing (WikiText, batch 1, solo q/v), sino la receta alpaca del proyecto para que los datos de recuperación sean constantes entre compresores. Tras el entrenamiento, los factores se pliegan a formas densas de Llama, por lo que el modelo carga con `transformers` estándar sin código de modelado personalizado: es un modelo de rango deficiente, pero no ocupa menos en disco ni reduce el cómputo de inferencia. Se verificó que las tablas rotatorias construidas a partir de la configuración del modelo son idénticas a las de Llama estándar en float64 para bases RoPE 1e4, 5e5 y 1e6, escalado de llama3, GQA y sesgos q/k/v (`tests/check_share_llama_exact.py`).

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla de chat y decodificación greedy en la evaluación publicada.
- Razonamiento de sentido común a nivel de cero ejemplos: la model card reporta ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA.
- Razonamiento matemático elemental: se evalúa MathQA en modo zero-shot.
- Modelado de lenguaje y estimación de perplejidad: 13,0826 en WikiText-2.
- No incluye modo de razonamiento explícito (thinking), visión, audio ni otras modalidades; no se anuncia soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni uso de herramientas.
- Capacidades multilingües: no disponibles; el base está dominado por inglés.
- Perfil de seguridad medido: ASR de 0,0769 frente a AdvBench y 0,0831 frente a StrongREJECT según el clasificador `cais/HarmBench-Llama-2-13b-cls`, con tasas de sobre-rechazo de 0,3279 (XSTest-safe) y 0,4111 (OR-Bench-Hard-1K).

## Casos de uso

- Investigación sobre el compromiso compresión-seguridad: la celda existe para medir si incluir datos de seguridad (JailbreakBench) en el conjunto de calibración de un compresor de bajo rango preserva la conducta de rechazo, comparando con la celda de Basis Sharing pura al mismo ratio.
- Línea base de ablación en estudios de Basis Sharing: al usar la receta alpaca común a todos los compresores del proyecto (LoRA r=8, alpha 16, 2 épocas, lr 1e-4, batch 64), permite aislar el efecto del conjunto de calibración del efecto del compresor.
- Validación de jueces de seguridad: los resultados se obtienen con `cais/HarmBench-Llama-2-13b-cls` (AdvBench, StrongREJECT) y `allenai/wildguard` (XSTest-safe, OR-Bench-Hard-1K), con fracciones de puntuación de 0,99 y 1,00 respectivamente; el artefacto sirve para probar la fiabilidad de esos jueces sobre modelos degradados.
- Reproducción de experimentos de calibración con mezcla de datos: las secuencias `jbb_harmful:2` están documentadas y empaquetadas, lo que permite recomputar el efecto de la proporción de datos dañinos (0,78 % de los tokens) sobre el sobre-rechazo.
- Extracción de pesos y análisis de rango: como los factores están plegados a formas densas estándar, se puede cargar con `transformers` y analizar la estructura de rango, la SVD de cada capa o el espectro singular para estudiar la pérdida de capacidad.
- Fine-tuning posterior controlado: al ser un checkpoint de pesos safetensors con plantilla Llama 2 y licencia Llama 2, se puede aplicar sobre él una LoRA o un ajuste supervisado para estudiar si la capacidad de rechazo se recupera tras la compresión.
- Pruebas internas de sobre-rechazo en productos: sirve como referencia de un modelo con sobre-rechazo macro del 36,95 %, útil para calibrar umbrales de filtrado en pipelines de moderación antes de desplegar.
- No se recomienda como asistente conversacional en producción: la propia model card advierte que la compresión a este ratio degrada la conducta de rechazo y que los números de seguridad de un modelo degenerado no son evidencia sobre alineación.

## Benchmarks y rendimiento

Resultados publicados en la model card (todos con plantilla de chat y decodificación greedy; ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en modo zero-shot):

| Métrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,4998 |
| WikiText-2 (perplejidad) | 13,0826 |
| ARC-Easy (acc_norm) | 0,5093 |
| ARC-Challenge (acc_norm) | 0,3148 |
| HellaSwag (acc_norm) | 0,5216 |
| WinoGrande (acc) | 0,5959 |
| OpenBookQA (acc_norm) | 0,3420 |
| PIQA (acc_norm) | 0,6627 |
| MathQA (acc_norm) | 0,2412 |
| AdvBench HarmBench ASR | 0,0769 |
| StrongREJECT HarmBench ASR | 0,0831 |
| Sobre-rechazo XSTest-safe | 0,3279 |
| Sobre-rechazo OR-Bench-Hard-1K | 0,4111 |
| Sobre-rechazo macro | 0,3695 |

La model card no incluye comparación numérica con el modelo base sin comprimir ni con otras celdas de compresión del mismo proyecto; por tanto, no se dispone de una tabla comparativa de rendimiento publicada en la información proporcionada. Las salidas por prompt y los ficheros de métricas en bruto están en los directorios `utility/` y `safety/` del repositorio.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 13,5 GB solo de pesos, más caché KV; con contexto completo de 4.096 tokens el consumo práctico ronda los 15-18 GB.
- VRAM en int8: en torno a 6,7 GB de pesos.
- VRAM en int4: en torno a 3,4 GB, más overhead de cuantización y caché KV.
- GPU de gama alta: A100 40 GB u 80 GB, H100 80 GB y similares admiten fp16 con contexto completo sin problemas.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 con contexto completo y sobra; en RTX 3090 (24 GB) también. En tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.) es necesario cuantizar a 4 bits y limitar el contexto.
- Opciones de despliegue: `transformers` estándar de forma nativa (no requiere código personalizado porque los factores están plegados a formas densas); vLLM y TGI para servido con batching; llama.cpp u Ollama previa conversión a GGUF; el autor no publica cuantizaciones listas para usar.
- Latencia y throughput: no disponible. Al ser denso, el coste de inferencia por token es equivalente al de un Llama 2 7B completo, sin ganancia de velocidad derivada de la compresión (las matrices son de rango deficiente, no de menor dimensión).

## Comparativa con modelos similares

Nota: los datos de las alternativas son características públicas de cada modelo base, no cifras verificadas en la información proporcionada. No se dispone de comparativa de rendimiento, porque la model card no publica resultados de los modelos de referencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p50) | 6.738.415.616 almacenados; fracción retenida 0,4998 | 4.096 tokens | llama2 | HuggingFace, safetensors, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | llama2 | HuggingFace, ampliamente desplegado |
| Otras celdas del proyecto Basis Sharing (mismo ratio, distinta calibración) | mismo orden de magnitud | 4.096 tokens | llama2 | Repositorio del proyecto |
| Modelo base sin comprimir como referencia | 6.738.415.616 | 4.096 tokens | llama2 | HuggingFace |

Alternativas de distinto linaje y licencia (por ejemplo, familias con licencia Apache-2.0 y contextos superiores a 30.000 tokens) son comparables en tamaño, pero no se dispone de resultados de benchmarks de este modelo frente a ellas en la información proporcionada.

## Limitaciones y advertencias

- La propia model card advierte de que la compresión a este ratio degrada la conducta de rechazo y que las cifras de seguridad de un modelo degenerado no constituyen evidencia sobre alineación.
- Tasa de sobre-rechazo elevada: 0,3279 en XSTest-safe y 0,4111 en OR-Bench-Hard-1K, con macro de 0,3695. Un tercio de las peticiones benignas se rechazan de forma indebida.
- Riesgo de alucinación: no se reporta explícitamente, pero la perplejidad de 13,0826 en WikiText-2 y las métricas de conocimiento (MathQA 0,2412; OpenBookQA 0,3420) indican pérdida de capacidad respecto al base sin comprimir.
- No hay ahorro de disco ni de cómputo: los factores se pliegan a formas densas de Llama, por lo que el repositorio ocupa 13,5 GB y la inferencia cuesta lo mismo que un 7B denso. La reducción es de rango efectivo, no de tamaño.
- El 0,78 % de los tokens de calibración procede de comportamientos dañinos de JailbreakBench; 11 de los 520 prompts de AdvBench son comportamientos de JailbreakBench literales, lo que puede contaminar la medición de ASR en esa evaluación concreta.
- Contaminación potencial de las métricas de sobre-rechazo: aunque la model card declara que el juicio es fiable para esta celda (fracción puntuada 0,99 en XSTest-safe y 1,00 en OR-Bench-Hard-1K), las cifras provienen de modelos juez (`cais/HarmBench-Llama-2-13b-cls`, `allenai/wildguard`) y heredan sus sesgos.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés.
- Licencia Llama 2: uso comercial sujeto a los términos de Meta, con las restricciones habituales de esa licencia y obligación de cumplir la política de uso aceptable. El artefacto es de investigación y no se ha validado para producción.
- Repositorio sin descargas ni likes, sin pipeline declarado y sin variantes cuantizadas publicadas; la reproducibilidad depende del repositorio de código del proyecto y de commits concretos.
- Caveat de evaluación: los números corresponden a decodificación greedy con plantilla de chat, por lo que no son extrapolables a configuraciones de muestreo o prompts fuera de plantilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de Basis Sharing (TUDa-HWAI, commit `1c021b6ce1d3`): https://github.com/TUDa-HWAI/Basis_Sharing
- Dataset de recuperación: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibración de seguridad (JailbreakBench, 100 comportamientos dañinos): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Clasificador juez de HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo: https://huggingface.co/allenai/wildguard
- Artefactos de métricas y salidas por prompt: directorios `utility/` y `safety/` del repositorio en HuggingFace
- La búsqueda web realizada no devolvió enlaces relevantes (únicamente resultados deportivos sin relación con el modelo); no se dispone de paper, blog técnico ni demo adicionales verificados.
