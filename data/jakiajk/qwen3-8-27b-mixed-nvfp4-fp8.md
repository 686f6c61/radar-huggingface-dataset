# jakiAJK/Qwen3.8-27B-mixed-NVFP4-FP8

## Resumen

Este repositorio contiene una cuantización mixta de precisión del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario jakiAJK. El modelo base es un transformer híbrido de 27 mil millones de parámetros que combina atención completa y atención lineal, e incorpora una torre de visión para procesamiento de imágenes. La cuantización aplica pesos-only RTN (round-to-nearest) sin calibración, asignando NVFP4 a las proyecciones MLP y parte de la atención lineal, FP8 E4M3 a las proyecciones de atención completa y BF16 a componentes sensibles como `lm_head`, embeddings y la torre de visión. El resultado es un checkpoint de aproximadamente 21 GiB, 2,5 veces más pequeño que el BF16 original, que se sirve de forma nativa con vLLM tanto en GPUs Blackwell (kernels FP4/FP8) como en Ampere/A100 (fallback Marlin W·A16).

La relevancia de este modelo radica en que permite ejecutar un modelo multimodal de 27B con una huella de memoria reducida y un throughput hasta 2,5 veces superior al BF16 en hardware Blackwell, manteniendo una precisión estadísticamente equivalente en una suite de evaluación propia. Incluye además soporte para decodificación especulativa mediante el cabezal MTP (multi-token prediction) del propio checkpoint o mediante un drafter externo DSpark, lo que acelera aún más la generación. Es una opción práctica para despliegues en producción donde la VRAM es limitada o se requiere alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa y lineal) con torre de vision, basado en Qwen3.8-27B |
| Parametros totales | 17.463.440.112 (checkpoint cuantizado; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (grupo 16), FP8 E4M3 (canal), BF16 (componentes sensibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint oficial Qwen/Qwen3.8-27B, que presenta una arquitectura híbrida con capas de atención completa y capas de atención lineal (linear-attention), además de una torre de visión para entrada de imágenes. La cuantización se realizó con un esquema mixto: las proyecciones MLP (`gate/up/down_proj`) de las 64 capas y las proyecciones `in_proj_qkv`/`in_proj_z` de la atención lineal en las capas 8–63 se almacenan en NVFP4 con grupo de 16; las proyecciones de atención completa (`q/k/v/o_proj`) y las proyecciones de atención lineal de las capas 0–7, junto con `linear_attn.out_proj`, se almacenan en FP8 E4M3 por canal; y los componentes más sensibles (`lm_head`, proyecciones `in_proj_a`/`in_proj_b` de la atención lineal, conv1d, normas, embeddings, torre de visión y cabezal MTP) se mantienen en BF16.

El proceso de cuantización es weights-only con redondeo al más cercano (RTN) y sin calibración, lo que evita la necesidad de datos de validación. Se protegen deliberadamente las capas tempranas de atención lineal y las pequeñas proyecciones del gate GDN, ya que en modelos híbridos similares son las que primero degradan. El cabezal MTP incluido en el checkpoint se conserva para permitir decodificación especulativa. No se aplicó fine-tuning posterior; el modelo conserva las capacidades del original, incluyendo razonamiento (thinking mode) y procesamiento de imágenes.

## Capacidades

- Generación de texto y razonamiento: soporta modo thinking (razonamiento explícito) activable mediante el parser `qwen3` en vLLM.
- Procesamiento de imágenes: al heredar la torre de visión del modelo base, puede procesar entradas visuales junto con texto (image-text-to-text).
- Decodificación especulativa: compatible con el cabezal MTP integrado (hasta 2 tokens especulativos) y con drafter externo DSpark (hasta 4 tokens), acelerando la generación entre un 59% y un 101% según configuración.
- Despliegue eficiente: al ser una cuantización mixta NVFP4/FP8, funciona con kernels nativos en GPUs Blackwell y con fallback Marlin W·A16 en Ampere, sin necesidad de librerías adicionales.
- Compatibilidad con vLLM: se sirve directamente con `vllm serve` sin conversión previa, usando el formato compressed-tensors.

## Casos de uso

- Inferencia multimodal en producción con VRAM limitada: el checkpoint ocupa ~21 GiB, por lo que puede ejecutarse en GPUs de 24 GB (p. ej., RTX 4090) con margen para KV cache, permitiendo desplegar un modelo de 27B con visión en hardware de consumo.
- Servicio de chat con alta concurrencia: en una RTX PRO 6000 Blackwell alcanza 1134,5 tokens/s con concurrencia 32 (2× frente a BF16), ideal para aplicaciones de atención al cliente o asistentes virtuales con muchos usuarios simultáneos.
- Razonamiento y análisis de documentos: gracias al modo thinking y al soporte de imágenes, puede utilizarse para resumir informes, extraer información de gráficos o responder preguntas complejas sobre material visual.
- Generación de código asistida: el modelo base de la familia Qwen tiene capacidades de código; esta cuantización permite ejecutarlo en entornos de desarrollo con GPUs modestas, manteniendo baja latencia en generación.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización mixta NVFP4/FP8 en arquitecturas híbridas con atención lineal, ya que incluye mediciones detalladas de precisión y throughput.
- Despliegue en entornos con restricciones de licencia: al usar Apache 2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, siempre que se respete la atribución.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones propias sobre una suite de 1170 muestras (thinking activado, temperatura 1.0, top_p 0.95, top_k 20, límite de 8192 tokens). Los resultados de precisión y throughput se resumen a continuación.

**RTX PRO 6000 Blackwell** (medido con cabezal FP8; la variante publicada con cabezal BF16 difiere solo en el head):

| Configuracion | Tamano | Accuracy | tok/s @ conc 32 | tok/s @ conc 1 |
|---|---|---|---|---|
| BF16 | 51.8 G | 88.6 | 559.6 | 26.3 |
| Qwen FP8 | 28.8 G | 87.6 | 884.0 | 45.6 |
| **Este repo (NVFP4/FP8 mixto)** | **~21 G** | **88.5** | **1134.5** | **66.4** |

**A100 40 GB** (todo ejecutado con fallback Marlin W·A16):

| Configuracion | Accuracy | tok/s @ conc 32 | tok/s @ conc 1 |
|---|---|---|---|
| **Este repo** | **88.1** | **790.0** | **53.9** |

**Decodificacion especulativa** (en la RTX PRO 6000, con este repo):

| Configuracion especulativa | conc 1 | conc 16 |
|---|---|---|
| Sin especulacion | 59.4 tok/s | 396.6 tok/s |
| MTP (2 tokens) | +59% | +61% |
| DSpark drafter (n=4) | +101% | +83% |

El autor indica que la precisión es estadísticamente equivalente a BF16 (la variación entre ejecuciones del mismo checkpoint es de ±0.8). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~21 GiB para los pesos, más overhead de KV cache y activaciones. En la práctica, se recomienda al menos 24 GB de VRAM para inferencia con contexto moderado.
- GPUs compatibles:
  - Blackwell (RTX PRO 6000, B200, etc.): usa kernels nativos FP4/FP8, máximo rendimiento.
  - Ampere (A100 40 GB, A6000, etc.): usa fallback Marlin W·A16, rendimiento inferior pero funcional.
  - GPUs de consumo con 24 GB (RTX 4090, RTX 3090): pueden cargar el modelo con cuantización, aunque el throughput será menor que en Blackwell.
- Opciones de despliegue: vLLM (recomendado, soporte nativo), también puede cargarse con transformers estándar, pero se pierde la optimización de kernels.
- Latencia y throughput: en Blackwell, 66.4 tok/s en generación secuencial (concurrencia 1) y 1134.5 tok/s con concurrencia 32. En A100, 53.9 tok/s y 790.0 tok/s respectivamente.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base y a la cuantización FP8 oficial de Qwen, según los datos de la propia model card.

| Modelo | Tamano | Precision | Accuracy (suite propia) | tok/s @ conc 32 (Blackwell) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 51.8 G | BF16 | 88.6 | 559.6 | Apache 2.0 |
| Qwen3.8-27B (FP8 oficial) | 28.8 G | FP8 E4M3 | 87.6 | 884.0 | Apache 2.0 |
| **Este repo (NVFP4/FP8 mixto)** | **~21 G** | NVFP4 + FP8 + BF16 | **88.5** | **1134.5** | Apache 2.0 |

Frente a otras cuantizaciones comunes (AWQ, GPTQ) no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización puede introducir pérdida de precisión en tareas específicas, aunque en la suite del autor la accuracy es estadísticamente equivalente a BF16. Se recomienda validar en el caso de uso concreto.
- El máximo rendimiento solo se alcanza en GPUs Blackwell; en Ampere el fallback Marlin reduce el throughput y puede requerir ajustes de memoria.
- El drafter externo DSpark (`RadixArk/Qwen3.8-27B-DSpark`) necesita que se modifique su `config.json` para declarar `architectures: ["Qwen3DSparkModel"]`; de lo contrario vLLM lo enruta a una clase incorrecta y falla.
- El checkpoint incluye el cabezal `lm_head` en BF16; si se reemplaza por una versión FP8, el modelo no cargará en GPUs Ampere (A100).
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.), por lo que la comparación con otros modelos debe hacerse con cautela.
- Los idiomas soportados no están documentados en la model card; se asume que hereda los del modelo base, pero no se confirma.
- Al ser un repositorio con 0 descargas y 0 likes, la comunidad no ha validado aún el funcionamiento en entornos diversos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jakiAJK/Qwen3.8-27B-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark (referenciado en la model card): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
