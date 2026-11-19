# kleinbem/Qwen3-4B-Edge-GGUF

## Resumen

Qwen3-4B-Edge-GGUF es una suite de cuantizaciones GGUF del modelo Qwen/Qwen3-4B, publicada por el usuario kleinbem. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de pesos del Qwen3-4B original (4.022.468.096 parámetros) en formato GGUF para llama.cpp, calibrado con matrices de importancia (`llama-imatrix`) sobre un corpus orientado a tool calling agéntico, revisión de código y razonamiento sobre infraestructura declarativa. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha reside en su enfoque de despliegue en el borde: el autor publica telemetría real de hardware sobre una NVIDIA Jetson Orin Nano de 8 GiB (CUDA 12.6, `sm_87`) y sobre x86_64 con AVX2, incluyendo throughput (`tg128`), consumo energético medido con INA3221/RAPL y divergencia KL frente a la distribución de probabilidad del modelo base en FP16. Esto permite evaluar el compromiso calidad/tamaño/energía de cada cuantización con datos medidos, no solo con perplejidad.

El paquete ofrece siete variantes que van de `Q8_0` (3,99 GiB, 8,52 BPW) hasta `IQ3_M` (1,83 GiB, 3,91 BPW), e incluye una ablación control `Q4_K_M-std` sin imatrix para aislar el efecto de la calibración. El repositorio ocupa 10,5 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (36 capas, 8 KV heads, head_dim = 128) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el autor documenta el calculo de KV cache a 8.192 tokens (1.152 MiB en FP16) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_M-std (sin imatrix), IQ4_XS, IQ3_M |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer decoder-only denso de 4,02 mil millones de parámetros con Grouped-Query Attention: 36 capas, 8 cabezas KV y dimensión de cabeza 128. Según los datos del autor, la caché KV en FP16 ocupa 144,0 KiB por token, lo que equivale a 1.152 MiB a una longitud de contexto de 8.192 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base dentro de la información proporcionada.

La contribución técnica de esta publicación no es el entrenamiento, sino la cuantización con matrices de importancia. El autor calcula `llama-imatrix` sobre un corpus de calibración específico para tool calling agéntico, revisión de código y razonamiento sobre infraestructura declarativa, y evalúa cada variante mediante `llama-perplexity --kl-divergence` contra la distribución del modelo base en FP16. La ablación control `Q4_K_M` frente a `Q4_K_M-std` (mismo tamaño en bytes, 4,97 BPW) muestra una reducción de la divergencia KL media de 0,08262 a 0,04804 nats, es decir, un 41,9 % menos de divergencia, lo que aísla el efecto de la calibración con imatrix.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3-4B.
- Razonamiento orientado a tool calling y function calling, según el corpus de calibración declarado por el autor.
- Revisión de código y razonamiento sobre infraestructura declarativa (el autor cita "declarative infrastructure reasoning" como eje de calibración).
- Razonamiento multi-paso y flujos agénticos, por el perfil de calibración empleado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos de borde con memoria unificada limitada: las variantes `IQ4_XS` (2,12 GiB) y `IQ3_M` (1,83 GiB) caben en una Jetson Orin Nano de 8 GiB dejando margen para la caché KV y el resto del sistema; el autor reporta 22,4 tok/s y 17,8 tok/s respectivamente en `tg128` sobre Orin CUDA.
- Agentes de tool calling en producción de bajo consumo: la calibración imatrix está orientada a este escenario y la variante `Q4_K_M` ofrece 92,16 % de Top-1 Match con 18,8 tok/s y 1,069 J/token en Orin, un compromiso razonable para agentes que ejecutan llamadas a herramientas en bucle.
- Revisión de código automatizada en CI/CD: el modelo está calibrado sobre código de sistemas y puede integrarse en pipelines que ejecutan revisiones estáticas asistidas, con la ventaja de que `Q5_K_M` mantiene 96,01 % de Top-1 Match a 2,69 GiB.
- Razonamiento sobre infraestructura como código: la calibración declarativa del autor apunta a tareas de generación y validación de configuraciones (Terraform, Nix, YAML), donde la fidelidad de la distribución importa más que la perplejidad agregada.
- Asistente conversacional en x86_64 sin GPU: las variantes GGUF funcionan con llama.cpp sobre AVX2; el autor mide entre 2,4 y 4,7 tok/s en `tg128` según cuantización, suficiente para interacción no interactiva o por lotes.
- Evaluación comparativa de cuantizaciones: el repositorio incluye telemetría Parquet y un espacio interactivo de Pareto, útil para equipos que necesitan elegir cuantización según presupuesto de memoria, energía y latencia antes de desplegar.
- Prototipado con restricciones energéticas: los datos de vatios y julios por token permiten dimensionar despliegues en entornos con presupuesto térmico o de batería, como robótica móvil o nodos remotos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre Jetson Orin Nano (CUDA 12.6, `sm_87`) y x86_64 AVX2. La calidad se mide como divergencia KL media frente a la distribución FP16 del modelo base.

| Quant | imatrix | BPW | Tamano (GiB) | KLD media (nats) | Top-1 Match | PPL | Orin tg128 | Orin potencia / energia | x86 AVX2 tg128 |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Q8_0 | Si | 8,52 | 3,99 | 0,00111 | 98,89 % | 14,501 | 15,2 tok/s | 18,6 W (1,224 J/tok) | 3,4 tok/s |
| Q6_K | Si | 6,58 | 3,08 | 0,00494 | 97,65 % | 14,326 | 14,4 tok/s | 19,7 W (1,365 J/tok) | 3,9 tok/s |
| Q5_K_M | Si | 5,75 | 2,69 | 0,01373 | 96,01 % | 14,616 | 16,9 tok/s | 19,9 W (1,174 J/tok) | 3,7 tok/s |
| Q4_K_M | Si | 4,97 | 2,33 | 0,04804 | 92,16 % | 14,571 | 18,8 tok/s | 20,1 W (1,069 J/tok) | 4,7 tok/s |
| Q4_K_M-std | No (control) | 4,97 | 2,33 | 0,08262 | 91,89 % | 15,746 | 18,8 tok/s | 19,6 W (1,042 J/tok) | 4,6 tok/s |
| IQ4_XS | Si | 4,52 | 2,12 | 0,07572 | 92,81 % | 15,318 | 22,4 tok/s | 19,1 W (0,853 J/tok) | 4,0 tok/s |
| IQ3_M | Si | 3,91 | 1,83 | 0,15560 | 87,52 % | 14,579 | 17,8 tok/s | 20,4 W (1,145 J/tok) | 2,4 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada para pesos: 1,83 GiB (`IQ3_M`) hasta 3,99 GiB (`Q8_0`); añadir la caché KV (144,0 KiB/token en FP16, 1.152 MiB a 8.192 tokens) y el overhead del runtime.
- GPU recomendadas: NVIDIA Jetson Orin Nano de 8 GiB (plataforma de referencia del autor), cualquier GPU con al menos 4-6 GiB libres para las variantes pequeñas; A100 y H100 son sobredimensionadas para este modelo y no aportan ventaja medida en la model card.
- Cabe en GPU de consumo: sí, las variantes `IQ3_M`, `IQ4_XS`, `Q4_K_M` y `Q5_K_M` caben en GPUs de 4-6 GiB; `Q8_0` requiere del orden de 6 GiB con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por compatibilidad de formato, servidores basados en llama.cpp; el autor proporciona un flake de Nix (`github.com/kleinbem/hf-bench`) con los comandos `run-local` y `bench-orin`.
- Latencia y throughput medidos: en Orin Nano, entre 14,4 y 22,4 tok/s en `tg128` según cuantización; en x86_64 AVX2, entre 2,4 y 4,7 tok/s. Consumo en Orin entre 18,6 y 20,4 W, con 0,853-1,365 J/token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Edge-GGUF (esta ficha) | 4,02 B | No disponible | GGUF, Apache 2.0 | Cuantizaciones imatrix con telemetria de borde medida |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible en esta informacion | Safetensors, Apache 2.0 | Modelo original sin cuantizar; referencia FP16 para el calculo de KLD |
| Otras cuantizaciones GGUF de Qwen3-4B | 4,02 B | Depende del runtime | GGUF, Apache 2.0 | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks estándar del modelo base ni de cuantizaciones alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria independiente.
- Los benchmarks publicados son del autor y se centran en throughput, energía y divergencia KL; no hay resultados en tareas estándar (MMLU, HumanEval, GSM8K) que permitan comparar con otros modelos de 4 B.
- La calibración imatrix está sesgada hacia tool calling, revisión de código e infraestructura declarativa; el rendimiento en otros dominios (por ejemplo, conversación general o idiomas distintos del inglés) puede degradarse respecto a cuantizaciones de calibración genérica.
- No se especifican los idiomas soportados; no se debe asumir cobertura multilingüe sin verificación.
- La cuantización `IQ3_M` presenta una KLD media de 0,15560 nats y un Top-1 Match de 87,52 %, claramente peor que el resto; no es recomendable para tareas sensibles a la fidelidad.
- Riesgo de alucinación inherente al modelo base de 4 B; no se han publicado evaluaciones de factualidad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y posibles avisos del modelo base Qwen3-4B; conviene revisar la model card original antes de desplegar en producción.
- La longitud de contexto efectiva no está documentada en esta publicación; el cálculo de caché KV a 8.192 tokens es una referencia del autor, no una garantía de contexto soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kleinbem/Qwen3-4B-Edge-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Espacio interactivo Pareto y KV-cache para 8 GiB: https://huggingface.co/spaces/kleinbem/edge-llm-pareto
- Dataset de telemetría de benchmarks: https://huggingface.co/datasets/kleinbem/edge-llm-benchmarks
- Código y flake de Nix reproducible: https://github.com/kleinbem/hf-bench
