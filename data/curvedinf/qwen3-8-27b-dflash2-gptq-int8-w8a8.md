# curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8

## Resumen

Este repositorio contiene una cuantización GPTQ de 8 bits (W8A8) del modelo Qwen/Qwen3.8-27B, un modelo denso híbrido multimodal de 27.8 mil millones de parámetros desarrollado por el equipo Qwen. La cuantización ha sido producida y validada por el usuario curvedinf sobre una configuración de 4x AMD Instinct MI100 (gfx908, CDNA1) conectadas por XGMI, y se presenta como el checkpoint de referencia para un stack de inferencia int8-nativo optimizado para esa arquitectura.

La relevancia de este modelo reside en que permite ejecutar Qwen3.8-27B con una huella de memoria reducida a la mitad respecto a FP16 (27.8 GB de pesos en INT8) y aprovecha la tasa de cómputo int8 de las MI100, que es el doble que la de otros formatos. Incluye kernels y forks específicos para vLLM, AITER y flash-attention, por lo que está pensado para despliegues de producción en hardware AMD de generación CDNA1, no para ejecución genérica en GPU NVIDIA.

El modelo base Qwen3.8-27B es un transformer híbrido con 64 capas, de las cuales 48 usan atención lineal recurrente (GDN) y 16 atención completa, con una ventana de contexto de 262.144 tokens. La checkpoint cuantizada sirve exclusivamente el modelo de lenguaje; los pesos de visión se incluyen por integridad pero no se utilizan en inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida densa multimodal (model_type `qwen3_5`): 64 capas (48 GDN linear-attention + 16 full-attention, repetición 3:1), hidden 5120, vocab 248.320 |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ INT8 W8A8, group size 128, simétrica, desc_act false, lm_head en FP16 |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen3.8 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ cuantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso híbrido: de sus 64 capas, solo 16 ejecutan atención completa (con intervalo `full_attention_interval: 4`), mientras que las otras 48 usan atención lineal con un estado recurrente constante (módulo GDN). Esto reduce el coste cuadrático del contexto largo y permite ventanas de hasta 262.144 tokens. El modelo es multimodal (image-text-to-text), aunque este checkpoint se sirve únicamente como modelo de lenguaje (`--language-model-only`); los pesos del vision encoder y del módulo MTP se conservan en BF16 sin tocar.

La cuantización se realizó con GPTQModel 7.3.4, sin RTN libre (compensación por Hessiana), con calibración de 512 muestras mezclando evol-codealpaca-v1 (código) y C4 (texto general), con longitudes entre 256 y 2048 tokens. La calidad se validó mediante una barrido de divergencia KL (KLD) de 6 configuraciones de precisión; la configuración elegida (group size 128) midió KLD 0.011 frente a la referencia gs32 (umbral 0.02), y la cuantización de activaciones añadió solo +0.0032 de KLD adicional.

## Capacidades

- Generación de texto conversacional y completado de lenguaje, dado que sirve el modelo de lenguaje de Qwen3.8-27B.
- Procesamiento de contexto largo (hasta 262.144 tokens) gracias a la arquitectura híbrida con atención lineal recurrente.
- Inferencia int8 nativa (W8A8) para operaciones GEMM de prefill en GPUs AMD gfx908.
- Compatibilidad con el stack de despliegue vLLM (fork específico) con tensor parallelism de 4 GPUs.
- No incluye capacidad de procesamiento de imágenes en este checkpoint, aunque el modelo base sí la tiene; los pesos de visión se conservan sin usar.

## Casos de uso

- Despliegue de Qwen3.8-27B en clústeres AMD Instinct MI100 (gfx908) con vLLM, usando tensor parallelism 4 y KV cache en int8 por token por cabeza.
- Inferencia de contexto largo en producción: el modelo puede procesar documentos de hasta 262.144 tokens, adecuado para análisis de código o documentación extensa.
- Servicio de chat conversacional en entornos donde se dispone de hardware AMD CDNA1 y se quiere reducir el consumo de VRAM frente a FP16.
- Integración en pipelines de vLLM con el fork `mi100-optimized-sync`, que despacha cómputo int8×int8 para prefill y utiliza kernels de atención unificada de AITER.
- Evaluación de calidad de cuantización int8 para arquitecturas híbridas lineales, dado que la card incluye el procedimiento de calibración y el sweep de KLD reproducible.
- Servicio de modelo de lenguaje con licencia Apache 2.0 para aplicaciones comerciales sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de calidad de cuantización:

| Métrica | Valor |
|---|---|
| KLD vs referencia gs32 | 0.011 (umbral 0.02) |
| KLD adicional por cuantización de activaciones | +0.0032 |

No se han proporcionado datos de rendimiento de latencia ni throughput.

## Requisitos de hardware

- Configuración recomendada: 4x AMD Instinct MI100 (gfx908, CDNA1) con interconexión XGMI, tensor parallel size 4.
- VRAM estimada: los pesos INT8 ocupan aproximadamente 27,8 GB; con activaciones y KV cache (int8 per-token-head) en 4 GPUs, se reparte en ~7-8 GB por GPU.
- No cabe en una GPU consumer típica de 24 GB (p. ej., RTX 4090) con los pesos completos; se necesitaría una GPU con al menos 32 GB o cuantización adicional.
- Opciones de despliegue: vLLM (fork `curvedinf/vllm-gfx908`), AITER (`curvedinf/aiter-gfx908`), flash-attention (fork `gfx908-sync`).
- El stack está validado solo para gfx908; en otras arquitecturas puede fallar (el kernel AITER W8A16 produce resultados incorrectos en gfx908).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,8 B | 262.144 | safetensors (BF16) | Apache 2.0 |
| curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8 | 27,8 B | 262.144 | safetensors (GPTQ INT8) | Apache 2.0 |
| incoai/Qwen3.8-27B-DFlash2-GGUF | 27,8 B (asumido) | no disponible | GGUF | Apache 2.0 (asumido) |

No se dispone de datos de rendimiento comparativos (benchmarks) para estas variantes. El modelo base Qwen3.8-27B es el mismo checkpoint sin cuantizar; la versión GGUF de incoai es una alternativa para ejecución en llama.cpp, aunque no se especifican detalles de cuantización.

## Limitaciones y advertencias

- La cuantización INT8 introduce una degradación de calidad, medida en KLD 0.011 respecto a la referencia gs32; para aplicaciones sensibles a la precisión puede ser preferible el modelo en BF16.
- El stack está optimizado exclusivamente para AMD gfx908; en otras arquitecturas (NVIDIA, AMD CDNA2+) los kernels int8 nativos pueden no estar disponibles o producir resultados incorrectos.
- Este checkpoint no procesa imágenes; los pesos del vision encoder se incluyen pero no se utilizan en inferencia.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios específicos; se recomienda validar en el dominio de uso.
- La licencia Apache 2.0 permite uso comercial, pero la infraestructura de despliegue (forks de vLLM, AITER) es mantenida por terceros y puede requerir mantenimiento adicional.
- El tamaño del repo (31.8 GB) indica que la descarga e instalación requiere espacio suficiente en disco y ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork vLLM: https://github.com/curvedinf/vllm-gfx908 (branch `mi100-optimized-sync`)
- Fork AITER: https://github.com/curvedinf/aiter-gfx908 (branch `mi100-optimized-sync`)
- Fork flash-attention: https://github.com/curvedinf/flash-attention (branch `gfx908-sync`)
- Variante GGUF de terceros: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Documentación de vLLM sobre Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
