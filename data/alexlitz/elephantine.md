# alexlitz/elephantine

## Resumen

Elephantine es un repositorio de Hugging Face publicado por el desarrollador independiente alexlitz que implementa una única arquitectura de transformers, `ElephantineForCausalLM`, capaz de reproducir de forma nativa el forward pass de varios modelos decoder públicos distintos. No se trata de un modelo entrenado con un objetivo generativo propio, sino de una arquitectura "universal" que, mediante coeficientes de rama activables, emula token a token el comportamiento de modelos como SmolLM2-135M, Pythia-160M, Falcon-H1-Tiny-90M, Mamba-130M y Qwen3-0.6B-diffusion. La idea se describe en el artículo "The Emulation Frontier" y el código de referencia está en el repositorio `alexlitz/the_emulation_frontier`.

Cada subcarpeta del repositorio contiene un `config.json` y un `model.safetensors` que configuran la misma clase de modelo con distintos pesos y coeficientes de rama. La arquitectura combina atención softmax con RoPE y máscara configurable, una recurrencia SSM basada en la regla general gated-delta (que cubre Mamba-1/2/3, gated DeltaNet, RWKV-4..7, RG-LRU y la convolución con puerta de LFM2) y un FFN con MoE enrutado más un experto compartido con puerta, con ramas para SiLU, GeLU, ReLU y otras activaciones.

El interés del proyecto es fundamentalmente de investigación: demuestra que una sola arquitectura puede alojar exactamente (hasta error de redondeo en coma flotante) el cómputo de familias muy distintas de modelos. No es un modelo para producción: no tiene caché KV, no soporta padding masks y el autor lo describe explícitamente como una demo y no como un servidor. El tamaño total del repositorio es de 4,4 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención softmax (RoPE, máscara causal o completa), SSM con recurrencia gated-delta general y FFN con MoE enrutado + experto compartido |
| Parámetros totales | Variable por subcarpeta; el host de `smollm2-135m` tiene 218M de parámetros (176M almacenados no por defecto) |
| Parámetros activos | No disponible (el FFN usa MoE enrutado, pero no se publica el número de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se ofrecen cuantizaciones; los pesos se almacenan en el dtype más estrecho que los representa exactamente (bf16, fp16, fp32 o fp64) y el modelo computa en float64 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con código remoto (`configuration_elephantine.py`, `modeling_elephantine.py`) |

## Arquitectura y entrenamiento

La arquitectura `ElephantineForCausalLM` se compone de capas que aplican, en secuencia, tres bloques residuales: atención softmax con normalización previa (RoPE con frecuencias configurables, máscara causal o completa), un bloque SSM con convolución corta seguida de una recurrencia gated-delta general y normalización/puerta, y un FFN con MoE enrutado más un experto compartido con puerta y ramas de activación (SiLU, GeLU, ReLU y otras). La recurrencia SSM sigue la regla `S_t = Diag(a_t) S_(t-1) - gamma_t (S_(t-1) k_t) k_t^T + w_t v_t k_t^T, y_t = S_t q_t`, cuyos parámetros cubren Mamba-1/2/3, gated DeltaNet, RWKV-4..7, RG-LRU y la convolución con puerta de LFM2.

No hay entrenamiento en el sentido habitual: los pesos de cada subcarpeta se obtienen copiando los pesos del modelo original en las ramas correspondientes y poniendo a cero las ramas que ese modelo no utiliza (funciones `elephantine.universal.from_*` del repositorio de código). El model card reporta que la diferencia máxima de logits frente al original en fp32 es del orden de 1e-04 a 1e-06, y que al ejecutar el código original en fp64 con los casts internos a fp32 eliminados la diferencia baja a 1e-12 o menos, atribuible al redondeo en coma flotante. Las continuaciones greedy de 16 tokens coinciden en 3 de 3 prompts con el original en todos los casos reportados. `modeling_elephantine.py` es una copia literal de `elephantine/universal.py`, en torch puro, sin dependencias de `fla` ni `mamba_ssm`, y computa en float64.

## Capacidades

- Generación de texto autoregresiva mediante `generate()`, reejecutando el prefijo completo en cada paso al no disponer de caché KV.
- Emulación nativa, token a token, de los forward passes de SmolLM2-135M, Pythia-160M, Falcon-H1-Tiny-90M, Mamba-130M y Qwen3-0.6B-diffusion-mdlm.
- Soporte de atención softmax con RoPE y máscara causal o completa, configurable por rama.
- Soporte de recurrencias SSM de la familia gated-delta (Mamba, RWKV, RG-LRU, gated DeltaNet, convolución con puerta de LFM2).
- FFN con MoE enrutado y experto compartido, con activaciones SiLU, GeLU, ReLU y otras seleccionables por rama.
- Capacidad de cargar los pesos mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- No soporta padding masks; requiere lotes sin padding y de igual longitud.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre emulación de modelos: permite estudiar si una única arquitectura puede reproducir exactamente el cómputo de familias distintas (atención, SSM, híbridos) sin fine-tuning, comparando logits y continuaciones greedy frente a los originales.
- Verificación de equivalencia numérica: sirve para medir el error de redondeo en fp32 y fp64 entre una implementación unificada y las clases nativas de transformers, como muestran las columnas de `max |Δ logits|` del model card.
- Análisis de arquitecturas híbridas: al activar o desactivar ramas de atención, SSM y FFN, se puede aislar la contribución de cada componente en el comportamiento de un modelo concreto.
- Docencia y divulgación: el repositorio ilustra de forma concreta cómo se relacionan Mamba, RWKV, gated DeltaNet y la atención softmax dentro de una misma formulación matemática.
- Reproducción de experimentos: los submodelos pequeños (SmolLM2-135M, Pythia-160M, Mamba-130M) caben en una GPU de consumo y permiten reproducir resultados en local con `transformers` y `trust_remote_code=True`.
- Pruebas de herramientas de serialización y carga: el esquema de almacenamiento en el dtype más estrecho posible y la recreación de ramas no usadas al cargar sirven para validar pipelines de conversión de checkpoints.

## Benchmarks y rendimiento

El model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar reporta métricas de equivalencia numérica frente a los modelos originales:

| Subcarpeta | Original | max \|Δ logits\| vs original fp32 | max \|Δ logits\| vs original fp64 | Continuaciones greedy idénticas | Tamaño |
|---|---|---|---|---|---|
| `smollm2-135m` | HuggingFaceTB/SmolLM2-135M | 1,4e-04 | 0 | 3 / 3 | 0,35 GB |
| `smollm2-135m-inflated` | HuggingFaceTB/SmolLM2-135M | 1,4e-04 | 2,1e-13 | 3 / 3 | 0,58 GB |
| `pythia-160m` | EleutherAI/pythia-160m | 6,1e-04 | 2,8e-12 | 3 / 3 | 0,32 GB |
| `falcon-h1-tiny-90m` | tiiuae/Falcon-H1-Tiny-90M-Base | 4,9e-05 | 1,5e-13 | 3 / 3 | 1,41 GB |
| `mamba-130m-mic` | huggingface-mic/mamba-130m-hf-mic | 1,6e-06 | 2,2e-15 | 3 / 3 | 0,06 GB |
| `qwen3-0.6b-diffusion-mdlm` | dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1 | 7,0e-05 | 2,0e-13 | 3 / 3 | 1,62 GB |

Las cifras se midieron tras recargar cada subcarpeta con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y son el máximo sobre todas las posiciones y entradas del vocabulario en 3 prompts. La recarga es bit a bit idéntica al host construido en memoria.

## Requisitos de hardware

- El repositorio completo ocupa 4,35 GB en disco; cada subcarpeta individual va de 0,06 GB (`mamba-130m-mic`) a 1,62 GB (`qwen3-0.6b-diffusion-mdlm`).
- El modelo computa en float64, lo que duplica el uso de memoria frente a fp32 y cuadruplica frente a bf16 para los tensores activos; no se publican estimaciones de VRAM.
- Los submodelos más pequeños (SmolLM2-135M, Pythia-160M, Mamba-130M) caben con holgura en cualquier GPU de consumo, incluidas RTX 3060 o superiores, siempre que se disponga de memoria suficiente para el cómputo en float64.
- El submodelo mayor, `qwen3-0.6b-diffusion-mdlm` (1,62 GB en disco), requiere más memoria por el cómputo en float64 y por la reejecución completa del prefijo en cada paso de generación.
- No hay caché KV: cada token generado reejecuta todo el prefijo, por lo que la latencia crece de forma cuadrática con la longitud de la secuencia y el throughput es muy inferior al de una implementación con caché.
- Despliegue mediante `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la dependencia de código remoto y float64 hace improbable su integración directa en esos motores.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Elephantine (`smollm2-135m`) | 218M host, 176M almacenados | No disponible | MIT | Emulación nativa multiarquitectura |
| SmolLM2-135M | 135M | 8.192 tokens (según su model card) | Apache 2.0 | Modelo decoder Llama entrenado |
| Pythia-160M | 160M | 2.048 tokens (según su model card) | Apache 2.0 | Modelo decoder GPT-NeoX entrenado |
| Mamba-130M | 130M | No disponible | Apache 2.0 | Modelo SSM puro entrenado |

La comparación relevante no es de rendimiento en tareas, sino de propósito: Elephantine no compite con estos modelos como generador, sino que los reproduce. Frente a un modelo entrenado del mismo tamaño, carece de caché KV, de soporte de padding y de un pipeline de generación optimizado, y su coste computacional por token es mayor al recalcular el prefijo completo.

## Limitaciones y advertencias

- No es un modelo entrenado para tareas generativas: su utilidad es la emulación y el estudio de arquitecturas, no la producción.
- Sin caché KV: `generate()` reejecuta el prefijo completo en cada paso, con latencia cuadrática en la longitud de la secuencia.
- No soporta padding masks; solo admite lotes sin padding y de igual longitud.
- El cómputo en float64 incrementa notablemente los requisitos de memoria y reduce el rendimiento frente a implementaciones en bf16 o fp16.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisarlo antes de usarlo en entornos sensibles.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni evaluación en tareas downstream; los datos de equivalencia se limitan a 3 prompts y 16 tokens greedy.
- La licencia MIT permite uso comercial, pero el model card describe el proyecto como una demo y no ofrece garantías de corrección más allá de las métricas de equivalencia reportadas.
- El repositorio depende de las versiones de `transformers` compatibles con el código remoto incluido; cambios en la librería pueden romper la carga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alexlitz/elephantine
- Artículo "The Emulation Frontier": https://alexlitzenberger.com/blog/the_emulation_frontier
- Repositorio de código: https://github.com/alexlitz/the_emulation_frontier
- SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Pythia-160M: https://huggingface.co/EleutherAI/pythia-160m
- Falcon-H1-Tiny-90M-Base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Base
- Mamba-130M (mic): https://huggingface.co/huggingface-mic/mamba-130m-hf-mic
- Qwen3-0.6B-diffusion-mdlm: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1
