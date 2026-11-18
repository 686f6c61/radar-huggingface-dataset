# Greatjedi/Qwen3.8-27B-Intel-Arc-Tuned-GGUF

## Resumen

Greatjedi/Qwen3.8-27B-Intel-Arc-Tuned-GGUF es una familia de cuantizaciones GGUF del modelo Qwen3.8-27B (26.895.998.464 parámetros reales según los safetensors del repositorio) reempaquetadas específicamente para GPUs Intel Arc con backend SYCL de `llama.cpp`. El autor, Greatjedi, parte de checkpoints ya cuantizados de terceros (empero-ai/Qwen3.8-27B-Ridge-GGUF, ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF y bytkim/Qwen3.8-27B-pi) y aplica una transquantización selectiva que elimina por completo los tensores I-Quant (IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS), sustituyéndolos por superbloques Q4_K, Q5_K y Q6_K nativos.

El problema que resuelve es concreto y medible: los kernels SYCL de `llama.cpp` no implementan I-Quants, de modo que cualquier tensor IQ fuerza una caída desde el pipeline sistólico DPAS (Dot Product Accumulate) de las XMX de Intel Arc hacia bucles de desquantización en host. El resultado en el hardware objetivo (Arc Pro B60 de 24 GB) era de 8,10 a 12,97 tok/s en decodificación autoregresiva. Tras la transquantización, el autor reporta 22,23-22,36 tok/s en decodificación pura y hasta 41,88 tok/s con decodificación especulativa mediante la cabeza NextN (MTP) embebida.

La relevancia actual es doble: por un lado, hace utilizable un modelo de 27B en GPUs de consumo y workstation Intel sin renunciar a la aceleración por hardware; por otro, demuestra una técnica (transquantización selectiva preservando RoPE, layernorms, estados SSM lineales y cabezas de predicción NextN bit a bit) que puede replicarse en otros modelos. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal/SSM (según referencias del autor a "linear SSM states") y cabeza de predicción NextN (MTP); no se detalla la configuración completa de capas |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con mezclas Q4_K / Q5_K / Q6_K / Q2_K / BF16; variantes publicadas: IQ3_S transquantizado a Q4_K, Q4_K mixto, Q4_K con 96 tensores BF16 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia de parámetros del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre el preentrenamiento del modelo base Qwen3.8-27B en la documentación proporcionada: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí documenta el autor es la arquitectura de despliegue: el modelo incorpora una cabeza de predicción NextN (MTP, Multi-Token Prediction) de 41 MiB bajo el prefijo `blk.64.nextn.*`, que actúa como drafter interno para decodificación especulativa sin necesidad de un modelo borrador externo en VRAM. También se mencionan "linear SSM states" entre los componentes preservados bit a bit durante la transquantización, lo que sugiere una arquitectura híbrida con capas de estado lineal, aunque no se detalla su proporción ni configuración.

La innovación técnica central es la transquantización selectiva por software: un parser personalizado en `llama.cpp` intercepta cada tensor I-Quant no soportado por SYCL y lo convierte a superbloques Q4_K con escalas y mínimos independientes de 6 bits por cada 32 pesos, preservando intactos RoPE, layernorms, proyecciones de atención de alta precisión y la cabeza NextN. El autor documenta además que el checkpoint Unsloth UD-Q4_K_S contiene 201 tensores I-Quant encubiertos (IQ4_XS, IQ3_S, IQ3_XXS), lo que explica su mal rendimiento en Arc pese a la etiqueta Q4. Los checkpoints DAS Lab IQ3_XXS originales venían sin cabeza NextN, motivo por el que la primera release de esa línea requería un drafter externo DFlash2; la versión IQ3_S-MTP corrige esto y es autocontenida.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento: el autor emplea prompts de factorización de primos como benchmark de razonamiento, con rendimiento sostenido bajo decodificación especulativa.
- Generación de código: medida explícitamente en el sweep de benchmarks (codegen a 38,23 tok/s con MTP embebido).
- Extracción de JSON estructurado: caso de prueba incluido en el sweep (26,38 tok/s con MTP).
- Decodificación especulativa con cabeza MTP embebida (tasa de aceptación del draft del 92,9-93,5 %), sin VRAM adicional para drafter.
- Compatibilidad con drafters externos DFlash2 (funcional, 94,7 % de aceptación) y DSpark (no funcional en este stack: crash del kernel SYCL).
- Tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente.
- Visión y audio: no disponibles.

## Casos de uso

- Despliegue de un modelo de 27B en estaciones de trabajo con Intel Arc Pro B60 (24 GB): la variante Q4_K de 13,72-15,29 GiB cabe holgadamente en VRAM y ofrece 22,36 tok/s en decodificación pura, suficiente para asistentes interactivos locales sin depender de la nube.
- Asistentes de código en IDE sobre hardware Intel: con 38,23 tok/s en codegen bajo MTP embebido, el modelo puede sostener autocompletado y generación de funciones en tiempo real dentro de un plugin local.
- Extracción de datos estructurados por lotes: la variante con MTP alcanza 26,38 tok/s en extracción de JSON, adecuada para pipelines que convierten documentos en registros estructurados con validación de esquema.
- Razonamiento matemático y analítico local: los 41,88 tok/s en factorización de primos permiten cadenas de razonamiento largas sin tiempos de espera prohibitivos en una GPU de 24 GB.
- Sustitución de configuraciones multi-GPU: al eliminar la necesidad de un drafter externo en VRAM, un solo Arc Pro B60 puede ejecutar modelo y decodificación especulativa, simplificando el aprovisionamiento frente a setups con dos GPUs.
- Evaluación comparativa de kernels SYCL: el repositorio sirve como referencia reproducible para medir el impacto de los I-Quants en el backend SYCL y validar transquantizaciones propias antes de desplegar en producción.
- Prototipado de pipelines de decodificación especulativa: el sweep de configuraciones (MTP embebido, DFlash2, DSpark) documenta qué topologías funcionan y cuáles rompen el stack, útil para elegir drafter en despliegues nuevos.

## Benchmarks y rendimiento

Todos los datos proceden de mediciones del autor en Intel Arc Pro B60 (24 GB) con `level_zero:0`, `-ngl 99 -fa on`.

| Variante | Tamaño | Composición | Decode puro | Prefill | Decode especulativo |
|---|---|---|---|---|---|
| ISTA-DASLab IQ3_XXS (stock) | 9,39 GiB | 355 tensores IQ (81 %) | 8,10 tok/s | 110,05 tok/s | N/A (bloqueado) |
| Qwen3.8-27B-Ridge (stock) | 11,72 GiB | 192 tensores IQ | 12,22 tok/s | 133,45 tok/s | ~13,2 tok/s |
| Unsloth UD-Q4_K_S (stock) | 14,29 GiB | 201 tensores IQ | 12,97 tok/s | 162,75 tok/s | ~18,9 tok/s |
| Ridge Intel Arc Tuned Q4_K | 15,29 GiB | 0 IQ (336 Q4_K, 51 Q5_K, 23 Q6_K) | 22,23 tok/s | 245,54 tok/s | 41,28 tok/s (MTP, 93,4 %) |
| DAS Lab Intel Arc Tuned Q4_K | 13,72 GiB | 0 IQ (374 Q4_K, 28 Q2_K, 96 BF16) | 22,36 tok/s | 243,61 tok/s | 36,03 tok/s (DFlash2, 93,5 %) |
| DAS Lab IQ3_S Intel Arc Tuned MTP | 14,31 GiB | 0 IQ (350 IQ → Q4_K) | 21,42 tok/s | no medido (~240+ esperado) | 41,88 tok/s (MTP, 92,9 %) |

Sweep de topologías especulativas sobre el checkpoint IQ3_S-MTP:

| Configuración | Topología | Razonamiento | Codegen | JSON | Aceptación |
|---|---|---|---|---|---|
| 0 | Autoregresiva pura | 21,42 tok/s | 20,29 tok/s | 16,54 tok/s | — |
| 1 (recomendada) | MTP embebido (p-min=0,5, n-max=3) | 41,88 tok/s | 38,23 tok/s | 26,38 tok/s | 92,9 % |
| 2 | DFlash2 externo Q4_K_M | 39,68 tok/s | 39,19 tok/s | 27,11 tok/s | 94,7 % |
| 3 | DSpark externo Q8_0 | crash de kernel SYCL (`common.hpp:145`) | — | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 13,72 GiB (variante DAS Lab Q4_K), 14,31 GiB (IQ3_S-MTP) y 15,29 GiB (Ridge Q4_K); con overhead de contexto y caché KV conviene reservar 16-20 GB.
- GPU objetivo: Intel Arc Pro B60 24 GB (Battlemage Xe2) es la plataforma de referencia; el autor menciona también Arc A770 16 GB y tarjetas Battlemage, y el backend es oneAPI SYCL.
- Cabe en GPU de consumo Intel Arc (A770 16 GB con la variante de 13,72 GiB, con margen ajustado); no está pensado para GPUs NVIDIA o AMD, ya que la optimización es específica del backend SYCL.
- Despliegue: `llama.cpp` con backend SYCL (variables `UR_LOADER_USE_LEVEL_ZERO_V2=0`, `-ngl 99 -fa on`); recomendado `--draft-mtp` con p-min=0,5 y n-max entre 2 y 3. vLLM, TGI y Ollama no están documentados para estas variantes.
- Throughput medido: prefill de 243-245 tok/s, decodificación de 21-22 tok/s sin especulación y 36-42 tok/s con MTP o DFlash2.
- No usar DSpark Q8_0 como drafter: provoca un crash del kernel SYCL en el primer sync.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Enfoque | Licencia | Rendimiento en Arc B60 |
|---|---|---|---|---|---|
| Greatjedi Qwen3.8-27B Intel Arc Tuned | 26,9 B | GGUF Q4_K/Q5_K/Q6_K | Optimizado para SYCL/DPAS | Apache 2.0 | 22,36 tok/s decode, 41,88 con MTP |
| ISTA-DASLab Qwen3.8-27B GSQ-RCO (stock) | 26,9 B | GGUF IQ3_XXS | Cuantización de alta compresión | Apache 2.0 | 8,10 tok/s decode (I-Quants sin kernel SYCL) |
| empero-ai Qwen3.8-27B Ridge (stock) | 26,9 B | GGUF con IQ | Cuantización mixta | Apache 2.0 | 12,22 tok/s decode |
| Unsloth UD-Q4_K_S | 26,9 B | GGUF UD (con IQ encubiertos) | Cuantización dinámica | Apache 2.0 | 12,97 tok/s decode |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de modelos alternativos de tamaño similar (por ejemplo, otras familias de 27B) en el hardware objetivo.

## Limitaciones y advertencias

- Las optimizaciones son específicas del backend SYCL de `llama.cpp` sobre Intel Arc; en NVIDIA (CUDA), AMD (ROCm) o CPU el rendimiento puede no diferir del de los checkpoints originales, e incluso empeorar por el mayor tamaño de archivo frente a IQ3_XXS.
- El modelo base se distribuye con idiomas declarados en inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para estas variantes; las cifras disponibles son exclusivamente de velocidad.
- La transquantización de IQ a Q4_K incrementa el tamaño del archivo (por ejemplo, de 9,39 a 14,31 GiB en la línea DAS Lab), lo que puede impedir el despliegue en GPUs con menos de 16 GB.
- La cabeza MTP y los estados SSM se preservan bit a bit según el autor, pero no se documenta una evaluación de degradación de calidad tras la transquantización; conviene validar con eval propia antes de producción.
- DSpark Q8_0 como drafter externo provoca un crash del kernel SYCL en este stack.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base Qwen3.8-27B, no evaluados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los checkpoints intermedios de los que deriva.
- El repositorio ocupa 102,1 GB por acumulación de variantes; descargar solo el archivo GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Greatjedi/Qwen3.8-27B-Intel-Arc-Tuned-GGUF
- Modelo base (Ridge): https://huggingface.co/empero-ai/Qwen3.8-27B-Ridge-GGUF
- Modelo base (GSQ-RCO): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base (pi): https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Paper referenciado en los tags (arXiv:2402.04396): https://arxiv.org/abs/2402.04396
- `llama.cpp` (backend SYCL): https://github.com/ggml-org/llama.cpp
