# prakharprasad/Muse-Glimmer-30B-DFlash2-Q2_K-GGUF

## Resumen

El repositorio `prakharprasad/Muse-Glimmer-30B-DFlash2-Q2_K-GGUF` contiene la cuantización a 2 bits (Q2_K) del drafter de decodificación especulativa `incoai/Muse-Glimmer-30B-DFlash2`, un componente auxiliar diseñado para acelerar la inferencia del modelo denso `Muse-Glimmer-30B` de Meta (licencia Apache 2.0). Este drafter emplea la arquitectura DFlash 2, un mecanismo de difusión por bloques que extrae estados ocultos de capas específicas del modelo base para generar candidatos que el modelo principal verifica en paralelo, logrando una aceleración medida de 2,45x en una RTX 4090 de 24 GB.

La cuantización Q2_K ocupa aproximadamente 967 MB en disco (frente a los ~1,65 GB de la versión Q4_K_M) y está optimizada para ejecutarse junto con el modelo base en GPUs de consumo con 24 GB de VRAM, permitiendo ventanas de contexto extendidas de hasta 512K mediante escalado YaRN. Según las pruebas publicadas en la model card, esta versión de 2 bits alcanza una velocidad de decodificación media de ~131 tokens por segundo, idéntica a la del drafter de 4 bits, con picos superiores a 213 t/s.

El modelo se distribuye en formato GGUF para su uso con `llama.cpp`, requiriendo una versión con soporte para DFlash 2 (PR #27342). Es una pieza clave para desplegar agentes locales con razonamiento multimodal y llamadas a herramientas en hardware asequible, sin sacrificar rendimiento ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (cross-layer block-diffusion drafter) |
| Parametros totales | 2.772.159.744 (~2,77 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Depende del modelo base; soporta hasta 512K con YaRN (ver documentación) |
| Tipos de cuantizacion | Q2_K (2,89 BPW) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El drafter DFlash 2 no es un modelo de lenguaje autónomo, sino un componente de decodificación especulativa que extrae estados ocultos de las capas `[2, 14, 26, 38, 50]` de la arquitectura Muse Glimmer (52 capas en el modelo base). Genera bloques de candidatos que el modelo principal verifica en paralelo, reduciendo el número de pasos autoregresivos. La cuantización Q2_K presentada en este repositorio es una conversión del drafter original `incoai/Muse-Glimmer-30B-DFlash2` a 2 bits mediante la herramienta `llama.cpp`.

No se dispone de información pública sobre el entrenamiento del drafter original (datos, número de tokens, método de optimización). La model card indica que la calibración con matriz de importancia (IQ) no es posible porque DFlash 2 no es un modelo causal independiente, lo que motivó el uso de cuantización estándar Q2_K. Las pruebas de rendimiento muestran que esta cuantización mantiene paridad de velocidad con la versión Q4_K_M cuando se ajustan los parámetros de profundidad de bloque (`n=12`) y umbral de probabilidad (`p_min=0.60`), mientras que una cuantización experimental a 1 bit (Q1_0) degrada el rendimiento por rechazo excesivo de candidatos.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: permite multiplicar por 2,45x la velocidad de generación del modelo base Muse-Glimmer-30B en GPUs de 24 GB.
- Compatibilidad con contextos extendidos: soporta ventanas de 160K, 256K y 512K mediante escalado YaRN, sin desbordar la VRAM.
- Optimización para hardware de consumo: diseñado para RTX 4090, RTX 3090 y Apple Silicon, con un uso de VRAM de ~17,27 GB al combinarse con el modelo base cuantizado.
- Integración con `llama.cpp` y `llama-server`: requiere una compilación con soporte DFlash 2 (PR #27342) y permite ajustar parámetros como `--spec-draft-n-max`, `--cache-type-k-draft` y `--spec-draft-p-min`.
- No es un modelo generativo independiente: su función es exclusivamente acelerar la generación del modelo base asociado.

## Casos de uso

- Agentes locales con razonamiento multimodal: al combinarse con Muse-Glimmer-30B, permite ejecutar agentes que procesan imágenes y texto en tiempo real en una GPU de 24 GB, con velocidades de ~131 t/s que hacen viable la interacción conversacional fluida.
- Asistentes de codigo con contexto largo: la ventana de contexto extendida (hasta 512K con YaRN) permite mantener conversaciones extensas con repositorios completos o documentación técnica sin perder el hilo, acelerando la generación de parches o explicaciones.
- Generacion de arquitecturas y diseño: el modelo base es capaz de emitir llamadas a herramientas en formato XML (ATEM) y razonamiento por canales; el drafter acelera este proceso, útil para herramientas de diseño asistido por IA.
- Despliegue en entornos con restricciones de VRAM: al ahorrar ~604 MB frente al drafter Q4_K_M, permite aumentar la longitud de contexto o usar KV cache de mayor precisión (Q8_0) en una RTX 4090, maximizando la calidad de la memoria.
- Prototipado rapido de aplicaciones de IA generativa: con un setup de `llama.cpp` y un único comando, se puede montar un servidor de inferencia acelerado para pruebas de concepto sin necesidad de infraestructura en la nube.
- Investigacion en decodificacion especulativa: el repositorio sirve como referencia para estudiar el impacto de la cuantizacion agresiva en drafters de difusion por bloques, con datos de rendimiento reproducibles.

## Benchmarks y rendimiento

La model card incluye un benchmark en vivo realizado con `llama-server` (PR #27342) sobre el modelo `Muse-Glimmer-30B-UD-Q4_K_XL` en una RTX 4090 de 24 GB. Los resultados comparan la configuración sin drafter, con drafter oficial Q4_K_M, con el Q2_K personalizado y con un drafter experimental Q1_0:

| Configuracion | Tamano del drafter | VRAM cargada | Velocidad media | Velocidad pico | Speedup medido | Estado especulativo |
|---|---|---|---|---|---|---|
| Linea base (denso, sin drafter) | — | 15,39 GB | 53,49 t/s | 53,56 t/s | 1,00x | Autoregresivo |
| Q4_K_M oficial (n=15, p_min=0,75) | ~1,65 GB | 17,86 GB | 131,17 t/s | 172,40 t/s | 2,45x | Referencia 4-bit |
| Q2_K personalizado (n=12, p_min=0,60, F16 KV) | ~967 MB | 17,27 GB | 130,98 t/s | 213,40 t/s | 2,45x | Paridad total con 4-bit |
| Q1_0 experimental (1-bit, 1,13 BPW) | ~373 MB | 16,83 GB | 33,33 t/s | 35,45 t/s | 0,62x (mas lento) | Penalizacion por rechazo |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) para el drafter, ya que no es un modelo generativo autónomo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,27 GB al cargar el drafter Q2_K junto con el modelo base cuantizado Q4_K_XL (según la tabla de benchmark). El drafter solo ocupa ~967 MB en disco.
- GPU recomendadas: NVIDIA GeForce RTX 4090 (24 GB), RTX 3090 (24 GB) y Apple Silicon con al menos 24 GB de memoria unificada.
- Compatibilidad con GPU de consumo: sí, es el objetivo principal del diseño. No requiere GPUs profesionales como A100 o H100.
- Opciones de despliegue: `llama.cpp` (compilado con el PR #27342 para soporte DFlash 2), `llama-server` para servir API, y potencialmente otras herramientas que integren GGUF.
- Latencia y throughput estimados: ~131 t/s de media y picos superiores a 213 t/s en la configuración optimizada (n=12, p_min=0,60, F16 KV) sobre RTX 4090.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros drafters de decodificación especulativa en la información proporcionada. La única comparación publicada es interna entre cuantizaciones del mismo drafter (Q4_K_M, Q2_K y Q1_0), que muestra que Q2_K iguala el rendimiento de Q4_K_M con menor uso de VRAM. Como referencia, el modelo base Muse-Glimmer-30B compite con otros modelos densos de ~30B (p. ej., Llama 3.1 30B, Qwen 2.5 32B), pero el drafter no es comparable directamente con esos modelos.

## Limitaciones y advertencias

- Es un componente auxiliar, no un modelo independiente: requiere el modelo base Muse-Glimmer-30B (o su variante cuantizada) para funcionar; no puede generar texto por sí solo.
- Dependencia de una version especifica de `llama.cpp`: el soporte para DFlash 2 está en un pull request (PR #27342) que puede no estar fusionado en versiones estables; se debe compilar manualmente.
- Cuantizacion agresiva: aunque Q2_K mantiene paridad de velocidad con Q4_K_M en las pruebas, puede haber degradación en la precisión de los candidatos en escenarios no evaluados. La cuantización a 1 bit (Q1_0) falla claramente.
- Requiere ajuste de parámetros: el rendimiento óptimo depende de configurar correctamente `n`, `p_min` y el tipo de cache KV; valores incorrectos pueden reducir la velocidad por debajo de la línea base.
- Sin informacion sobre idiomas: la model card no especifica los idiomas soportados, por lo que se asume que hereda las capacidades del modelo base, pero no está confirmado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero es recomendable revisar los términos del modelo base original de Meta para asegurar el cumplimiento.
- Sin soporte oficial: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un trabajo de la comunidad sin mantenimiento garantizado.

## Enlaces

- Repositorio HuggingFace: [prakharprasad/Muse-Glimmer-30B-DFlash2-Q2_K-GGUF](https://huggingface.co/prakharprasad/Muse-Glimmer-30B-DFlash2-Q2_K-GGUF)
- Modelo base del drafter: [incoai/Muse-Glimmer-30B-DFlash2](https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2)
- Modelo base original de Meta: [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- Repositorio de Z-Lab (co-desarrollador de DFlash 2): [z-lab/Muse-Glimmer-30B-DFlash2](https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2)
- Pull request de llama.cpp con soporte DFlash 2: [PR #27342](https://github.com/ggml-org/llama.cpp/pull/27342)
- Guia de hardware para Muse Glimmer 30B: [RunAI Home Blog](https://runaihome.com/blog/muse-glimmer-30b-local-ai-hardware-guide-2026/)
- Recetas vLLM para Muse-Glimmer-30B: [vLLM Recipes](https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B)
