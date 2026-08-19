# primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8

## Resumen

El modelo `primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8` es una cuantización de precisión mixta del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el equipo de primitive-ai. Combina NVFP4 (grupo 16) y FP8 E4M3 (por canal) con capas críticas en BF16 para lograr un tamaño de aproximadamente 21 GiB, es decir, 2,5 veces más pequeño que la versión BF16 original, manteniendo una precisión estadísticamente equivalente (88,5 frente a 88,6 en la suite de evaluación del autor). Está diseñado para servirse de forma nativa con vLLM en GPUs Blackwell (kernels FP4/FP8) y Ampere/A100 (fallback Marlin W·A16 gracias al `lm_head` en BF16).

El modelo base es un transformer híbrido que combina atención completa en las primeras capas (0-7) con atención lineal en las capas 8-63, e incluye una torre de visión (image-text-to-text) y una cabeza MTP (multi-token prediction) preservada en el checkpoint para decodificación especulativa. Esta cuantización es relevante para entornos de producción que necesitan reducir el uso de VRAM y aumentar el throughput sin sacrificar calidad, especialmente en servidores con GPUs de gama alta.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y aún no validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (full-attention + linear-attention) con vision tower y cabeza MTP |
| Parametros totales | 17.463.440.112 (segun safetensors; el nombre indica 27B, discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3.8-27B, no especificada) |
| Tipos de cuantizacion | NVFP4 (grupo 16) para MLP y linear-attention en capas 8-63; FP8 E4M3 (canal) para full-attention y linear-attention en capas 0-7; BF16 para lm_head, gates, normas, embeddings, vision tower y MTP head |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer hibrido que utiliza atencion completa (full-attention) en las capas 0-7 y atencion lineal (linear-attention) en las capas 8-63. Esta combinacion reduce el coste computacional en secuencias largas. El checkpoint incluye una torre de vision (image-text-to-text), una cabeza MTP para prediccion de multiples tokens y proyecciones lineales adicionales.

La cuantizacion realizada por primitive-ai es weights-only con redondeo al mas cercano (round-to-nearest), sin calibracion ni fine-tuning posterior. La asignacion de precision es cuidadosa: los MLP y las proyecciones de atencion lineal de las capas 8-63 se cuantizan a NVFP4, mientras que las proyecciones de atencion completa y las capas tempranas de atencion lineal se mantienen en FP8. Los componentes mas sensibles (lm_head, gates de las proyecciones lineales, conv1d, normas, embeddings, torre de vision y cabeza MTP) se conservan en BF16 para evitar degradacion. Esta estrategia protege las capas tempranas de atencion lineal, que son las que primero se degradan en modelos hibridos similares.

No se ha publicado informacion sobre el entrenamiento del modelo base (numero de tokens, dataset, metodo de alineacion como RLHF o DPO). La cuantizacion no implica entrenamiento adicional.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (activado por defecto en la suite de evaluacion).
- Procesamiento multimodal image-text-to-text gracias a la torre de vision integrada.
- Decodificacion especulativa nativa mediante la cabeza MTP preservada en el checkpoint (metodo `mtp` con 2 tokens especulativos).
- Compatibilidad con drafter externo DSpark (`RadixArk/Qwen3.8-27B-DSpark`) para aceleracion adicional (hasta +101% en throughput a concurrencia 1).
- Soporte de tool calling y function calling: no se menciona explicitamente, pero al ser un modelo Qwen3.8 con arquitectura moderna, es probable que lo herede del modelo base; no obstante, no hay confirmacion en la informacion disponible.
- Capacidades multilingues: no especificadas.

## Casos de uso

- Inferencia de alto rendimiento en produccion: el modelo ofrece 1134,5 tok/s a concurrencia 32 en RTX PRO 6000 Blackwell, 2,0 veces mas rapido que BF16 y 1,3 veces mas que FP8 estandar. Ideal para APIs de generacion de texto con alta demanda.
- Despliegue en GPUs con VRAM limitada: con ~21 GiB, cabe en GPUs de 24 GB (como RTX 4090) y en A100 40 GB, liberando memoria para otros procesos o mayor tamano de lote.
- Servidores de razonamiento con modo thinking: el modelo mantiene precision similar a BF16 (88,5 vs 88,6) en tareas de razonamiento, lo que lo hace apto para asistentes conversacionales que requieren respuestas razonadas.
- Sistemas de decodificacion especulativa: con la cabeza MTP integrada, se puede acelerar la generacion hasta un 59% a concurrencia 1 sin necesidad de un drafter externo. Con DSpark, la mejora llega al 101%, reduciendo la latencia en aplicaciones interactivas.
- Aplicaciones multimodales: al incluir torre de vision, puede procesar entradas de imagen y texto, aunque no se detallan las capacidades exactas de vision en la informacion proporcionada.
- Entornos con GPUs Ampere: gracias al fallback Marlin W·A16, el modelo funciona en A100 con 790 tok/s a concurrencia 32, una opcion viable para centros de datos que aun no han migrado a Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas propias sobre una suite de 1170 muestras con thinking activado (temp 1.0, top_p 0.95, top_k 20, cap 8192). Los resultados son los siguientes:

| Configuracion | Tamano | Precision | tok/s @ conc 32 | tok/s @ conc 1 |
|---|---|---|---|---|
| BF16 (RTX PRO 6000) | 51.8 G | 88.6 | 559.6 | 26.3 |
| Qwen FP8 (RTX PRO 6000) | 28.8 G | 87.6 | 884.0 | 45.6 |
| **Este repo (RTX PRO 6000)** | **~21 G** | **88.5** | **1134.5** | **66.4** |
| **Este repo (A100 40 GB)** | **~21 G** | **88.1** | **790.0** | **53.9** |

La precision es estadisticamente equivalente a BF16 (la variacion run-to-run del mismo checkpoint es de aproximadamente ±0.8). La tabla de decodificacion especulativa muestra mejoras de +59% a +101% en tok/s segun el metodo utilizado.

## Requisitos de hardware

- VRAM estimada: ~21 GiB (tamano del repo 22.2 GB). Cabe en GPUs con 24 GB de VRAM (RTX 4090, RTX 3090) y en A100 40 GB.
- GPUs recomendadas: RTX PRO 6000 Blackwell (kernels nativos FP4/FP8), A100 40 GB (fallback Marlin W·A16). No se han probado en GPUs consumer, pero el tamano lo permite.
- Opciones de despliegue: vLLM (comando documentado), tambien compatible con transformers y safetensors. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 66,4 tok/s a concurrencia 1 en RTX PRO 6000; 1134,5 tok/s a concurrencia 32. En A100, 53,9 tok/s a concurrencia 1 y 790,0 a concurrencia 32.

## Comparativa con modelos similares

| Modelo | Tamano | Precision | Contexto | Licencia | Rendimiento (tok/s @ conc 32, Blackwell) |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 51.8 G | BF16 | no disponible | Apache 2.0 | 559.6 |
| Qwen3.8-27B (FP8 estandar) | 28.8 G | FP8 | no disponible | Apache 2.0 | 884.0 |
| **Este repo (NVFP4+FP8)** | **~21 G** | Mixta | no disponible | Apache 2.0 | **1134.5** |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de informacion sobre alternativas de otros fabricantes con el mismo tamano y arquitectura.

## Limitaciones y advertencias

- La cuantizacion puede degradar el rendimiento en tareas especificas no cubiertas por la suite de evaluacion del autor, aunque la precision global es equivalente a BF16.
- No se han publicado resultados en benchmarks estandar, por lo que la comparabilidad con otros modelos es limitada.
- La discrepancia entre el nombre "27B" y los 17.463.440.112 parametros reales no esta aclarada en la documentacion; podria deberse a una convencion de nomenclatura o a parametros adicionales no contabilizados en safetensors.
- El drafter externo DSpark requiere modificar el `config.json` para que `architectures` sea `["Qwen3DSparkModel"]`; sin este cambio, vLLM falla al cargar.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion para aplicaciones multilingues o de contexto largo.
- Al ser una publicacion reciente con 0 descargas, no hay validacion de la comunidad ni informes de errores en produccion.
- No se mencionan sesgos conocidos ni riesgos de alucinacion; al ser un modelo cuantizado del Qwen3.8, hereda las caracteristicas del modelo base, pero no hay datos adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark (mencionado en la model card): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
