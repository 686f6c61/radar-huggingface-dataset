# LMTLS5/ternary-qwen3.5-4b-hf

## Resumen

Ternary Qwen3.5-4B es una variante cuantizada del modelo Qwen3.5-4B de Alibaba, publicada por el usuario LMTLS5. En lugar de aplicar una cuantizacion clasica por bloques, sustituye 200 matrices lineales del modelo original por una descomposicion ternaria de tres factores `W ≈ A · diag(B) · C`, donde `A` y `C` son matrices con valores en {-1, 0, +1} empaquetadas a 2 bits y `B` es un vector de escalas en fp16. El resultado es un checkpoint de 6,38 GB frente a los 9,3 GB del modelo bf16 original, cargable directamente con `transformers` mediante `trust_remote_code=True`.

La innovacion principal es que las capas descompuestas nunca materializan la matriz `W` completa: el forward calcula `y = A(B ⊙ (C x))` mediante dos productos matriciales consecutivos con un escalado intermedio, lo que reduce el peso en disco y en memoria a costa de un coste computacional adicional por capa. La descomposicion se aplica a las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las 32 capas, a las proyecciones de atencion (`q/k/v/o_proj`) de las 8 capas de atencion completa y a las proyecciones de las 24 capas de atencion lineal (GatedDeltaNet). Quedan intactos los embeddings, el `lm_head`, las normas, la torre de vision y la cabeza MTP.

El modelo es relevante porque demuestra una via alternativa de compresion para arquitecturas hibridas con atencion lineal, manteniendo una calidad muy cercana al original: la divergencia KL media frente al bf16 es de 0,0224 nats, con una perplexity de 9,090 frente a 9,019 del original (un 0,8% peor) y un 94,0% de acuerdo top-1 en WikiText-2. Esta pensado para experimentacion e investigacion en tecnicas de cuantizacion y descomposicion matricial, no como sustituto directo de produccion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 8 capas de atencion completa + 24 capas de atencion lineal GatedDeltaNet, con proyecciones lineales descompuestas en factores ternarios |
| Parametros totales | 5.285.735.936 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria de 2 bits empaquetada (`ternary2bit`) para los factores A y C; escalas B en fp16; resto del modelo en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 6,38 GB), con `custom_code` para la clase `TernaryQwen3_5ForConditionalGeneration` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura hibrida que combina 8 capas de atencion completa con 24 capas de atencion lineal basadas en GatedDeltaNet. Sobre esa base, el autor sustituye 200 proyecciones lineales por un modulo `DecomposedLinear` que representa cada matriz como `W ≈ A · diag(B) · C`, con `A ∈ {-1,0,+1}^(out×k)`, `B ∈ fp16^k` y `C ∈ {-1,0,+1}^(k×in)`. El rango interno es `k = 3.5 × min(out, in)`, lo que da una expansion del rango respecto a la dimension menor de la matriz original. La variante publicada aqui es la ponderada por imatrix, con los mismos pesos que `qwen3.5-4b-ternary-imatrix-m3.5` del repositorio `LMTLS5/ternary-qwen3.5-4b`, reempaquetados en un checkpoint nativo de transformers.

No se trata de un modelo reentrenado: los pesos proceden del Qwen3.5-4B original y solo se transforman las proyecciones mediante descomposicion matricial con ponderacion imatrix. No hay informacion sobre el dataset de calibracion, el numero de tokens usado para la imatrix ni sobre procesos de RLHF o DPO adicionales. La implementacion es una subclase ligera de `Qwen3_5ForConditionalGeneration` que reemplaza cada proyeccion por un `DecomposedLinear` conservando el nombre original del atributo, de modo que el resto del modelo (atencion SDPA/flash, GatedDeltaNet con las rutas rapidas de `flash-linear-attention` y `causal-conv1d`, la cache, `generate()` y el chat template) queda intacto. El empaquetado ternario usa 4 valores por byte en little-endian, con codigos `0 → 0`, `1 → +1`, `2 → −1` y relleno de ceros hasta multiplo de 4 en la ultima dimension.

## Capacidades

- Generacion de texto conversacional, heredada del Qwen3.5-4B base.
- Razonamiento y matematicas, con modo thinking controlable mediante `enable_thinking` en el chat template.
- Generacion de codigo, al conservar las capacidades del modelo original.
- Capacidades multimodales: la torre de vision se mantiene intacta en el checkpoint, aunque la model card no detalla el soporte de entrada de imagenes en esta variante.
- Soporte de tool calling y function calling, heredado del modelo base.
- Capacidades de agente y razonamiento multi-paso, sujetas a la ventana de contexto del modelo original.
- Capacidades multilingues del Qwen3.5-4B original, aunque los idiomas concretos no se detallan en la informacion disponible.
- Cabeza MTP (multi-token prediction) conservada sin descomponer, lo que permite decodificacion especulativa si el runtime la aprovecha.

## Casos de uso

- Investigacion en cuantizacion ternaria: el modelo sirve como banco de pruebas para estudiar el impacto de la descomposicion `A · diag(B) · C` con rango `k = 3.5 × min(out, in)` frente a otras tecnicas de compresion, gracias a las metricas de KLD y acuerdo top-1 publicadas.
- Despliegue con restricciones de disco: al ocupar 6,38 GB frente a 9,3 GB del bf16, es adecuado para entornos donde el almacenamiento o el ancho de banda de carga del checkpoint es limitado, siempre que se acepte el coste computacional extra del forward descompuesto.
- Experimentacion con arquitecturas hibridas: permite estudiar el comportamiento de GatedDeltaNet y de la atencion completa cuando sus proyecciones lineales se representan de forma factorizada, manteniendo las rutas rapidas de `flash-linear-attention` y `causal-conv1d`.
- Generacion de texto en prototipos de investigacion: con `trust_remote_code=True` y `transformers` 5.14.1 o superior, se puede integrar en cuadernos y pipelines de evaluacion para comparar la calidad frente al bf16 en tareas de lenguaje.
- Evaluacion de decodificacion especulativa: la cabeza MTP sin descomponer permite probar tecnicas de prediccion multi-token sobre un modelo con proyecciones comprimidas.
- Analisis de robustez de la cuantizacion: las metricas por matriz (energia preservada minima del 99,21%, media del 99,76%) permiten identificar que capas toleran mejor la descomposicion ternaria en tareas concretas.
- Fine-tuning de investigación sobre pesos comprimidos: al ser una subclase de `Qwen3_5ForConditionalGeneration`, se puede adaptar con las herramientas habituales de transformers, aunque el autor no documenta recetas de entrenamiento.

## Benchmarks y rendimiento

Calidad frente al modelo bf16 original, medida como divergencia KL por token en el split de test de WikiText-2 (64 fragmentos de 2048 tokens). Perplexity del bf16 original: 9,019.

| Metrica | Valor |
|---|---|
| KLD media (nats) | 0,0224 |
| KLD mediana | 0,0088 |
| KLD p99 | 0,150 |
| Acuerdo top-1 | 94,0% |
| Perplexity | 9,090 (+0,8%) |
| Energia preservada por matriz (min / media) | 99,21% / 99,76% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 6,38 GB en safetensors; con overhead de activaciones y cache KV, se puede estimar un uso en torno a 8-10 GB en bf16 para secuencias cortas, aunque el autor no publica mediciones.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs consumer con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema de memoria.
- Cabe en GPU consumer: si, previsiblemente en modelos con 12 GB o mas de VRAM, aunque no hay confirmacion del autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (probado con transformers 5.14.1 y torch 2.13). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato ternario empaquetado a 2 bits con clase custom hace improbable su uso directo en esos runtimes sin conversion.
- Latencia y throughput: no disponibles. El forward descompuesto requiere dos productos matriciales por capa en lugar de uno, lo que incrementa el coste computacional respecto al bf16 original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LMTLS5/ternary-qwen3.5-4b-hf | 5,29 B | No disponible | Apache 2.0 | safetensors + custom code | Descomposicion ternaria, KLD 0,0224 vs bf16 |
| Qwen/Qwen3.5-4B (base) | No disponible en la informacion | No disponible | No disponible en la informacion | safetensors | Modelo original bf16, 9,3 GB, perplexity 9,019 en WikiText-2 |
| LMTLS5/ternary-qwen3.5-4b | No disponible en la informacion | No disponible | No disponible en la informacion | No disponible | Mismos pesos en formato no nativo de transformers (`qwen3.5-4b-ternary-imatrix-m3.5`) |

No se dispone de informacion sobre otras alternativas comparables de cuantizacion ternaria para Qwen3.5-4B en la documentacion proporcionada.

## Limitaciones y advertencias

- El forward descompuesto ejecuta dos productos matriciales por capa en lugar de uno, lo que aumenta el coste computacional y puede reducir el throughput frente al bf16 original.
- La calidad no es identica al original: perplexity un 0,8% superior y un 94,0% de acuerdo top-1 implican que aproximadamente 6 de cada 100 tokens predichos difieren del modelo bf16.
- Requiere `trust_remote_code=True`, ya que las clases `TernaryQwen3_5ForConditionalGeneration`, `TernaryQwen3_5Config` y `DecomposedLinear` viven en el repositorio y no en transformers. Esto implica ejecutar codigo del autor del modelo.
- Dependencia de versiones concretas de transformers (probado con 5.14.1) y torch (2.13); versiones sin soporte de Qwen3.5 no funcionaran.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta variante; se heredan los del Qwen3.5-4B base, no documentados en la informacion disponible.
- El soporte en runtimes de inferencia optimizados (vLLM, llama.cpp, TGI) no esta documentado y el formato ternario empaquetado a 2 bits con clase custom complica su integracion directa.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de las metricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LMTLS5/ternary-qwen3.5-4b-hf
- Repositorio con los mismos pesos en otro formato: https://huggingface.co/LMTLS5/ternary-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
