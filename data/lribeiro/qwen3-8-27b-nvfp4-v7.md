# lribeiro/Qwen3.8-27B-nvfp4-v7

## Resumen

Qwen3.8-27B-nvfp4-v7 es una variante cuantizada del modelo Qwen/Qwen3.8-27B, desarrollada por lribeiro mediante el toolkit llm-compressor de vLLM. Se trata del experimento v7 de un barrido de cuantización de 38 ejecuciones, y combina cuantización NVFP4 (W4A4) en las primeras 24 capas MLP con FP8 (W8A8) en el resto de capas MLP y en todas las capas de atención. El resultado es un checkpoint de 25,4 GB, 2,19 veces más pequeño que el modelo base en BF16 (55,6 GB).

El modelo base presenta una arquitectura híbrida de 64 capas: 48 capas de atención lineal (GatedDeltaNet) intercaladas con 16 capas de atención completa (cada cuarta capa), con 27B parámetros y una ventana de contexto de 8.192 tokens. La cuantización utiliza corrección de error Hessiana de GPTQ y está diseñada para ejecutarse exclusivamente en hardware NVIDIA Blackwell (SM120) con núcleos tensor FP4, a través de vLLM con backend FlashInfer.

Es importante señalar que el propio autor indica que esta versión no es la mejor de la serie: la v6 consigue menor divergencia KLD a velocidad comparable, y las versiones v17+ con FP8 completo dominan estrictamente a toda la línea NVFP4 W4A4. La v7 se documenta como punto de datos del barrido de sensibilidad al número de capas cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas de atención lineal (GatedDeltaNet) + 16 capas de atención completa (qwen3_5_text) |
| Parametros totales | 23.687.355.936 (checkpoint cuantizado); 27B en el modelo base BF16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración de benchmark) |
| Tipos de cuantizacion | NVFP4 W4A4 (capas MLP 0-23, group_size=16), FP8 E4M3 W8A8 (resto), KV cache FP8 |
| Idiomas soportados | Multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato compressed-tensors, 13 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con arquitectura híbrida: 64 capas en total, de las cuales 48 son de atención lineal (GatedDeltaNet) con rutas de estado recurrente (`in_proj_a`/`in_proj_b`) y 16 son de atención completa estándar, situadas cada cuarta capa (0, 4, 8, ..., 60). Cada capa comparte bloques MLP con `gate_proj`, `up_proj` y `down_proj`. El tamaño oculto es de 5.120 dimensiones, el intermedio de 17.408, con 24 cabezas de atención de 256 dimensiones y un vocabulario de 248.320 tokens.

La cuantización se realizó con llm-compressor y GPTQ con corrección de error basada en Hessiana, con `actorder=static` y objetivo secuencial sobre `Qwen3_5DecoderLayer`. La calibración utilizó 512 muestras de 2.048 tokens procedentes del dataset `malaiwah/qwen38-27b-fidelity-suite-v3` (181 contextos, IDs de token decodificados). La asignación de precisión es mixta: las capas MLP 0-23 usan NVFP4 W4A4 con escalas E4M3 y `memoryless_minmax`, mientras que las capas MLP 24-63, todas las capas de atención (lineal y completa), el `lm_head` y la caché KV usan FP8 E4M3. Los módulos `visual.*` (torre de visión), `linear_attn.norm`, `in_proj_a`/`in_proj_b` (dimensiones no potencia de 64, restricción CUTLASS) y la cabeza MTP se mantienen en BF16.

## Capacidades

- Generación de texto causal multilingüe con ventana de contexto de 8.192 tokens.
- Arquitectura híbrida que combina atención lineal (GatedDeltaNet) para eficiencia en decodificación con atención completa periódica para capturar dependencias a largo plazo.
- Torre de visión integrada en el modelo base (módulos `visual.*` conservados en BF16), lo que sugiere capacidades multimodales potenciales, aunque la variante cuantizada se publica como text-generation.
- Cabeza de predicción multi-token (MTP) presente en el modelo base, aunque no se utiliza con decodificación especulativa en esta configuración.
- Soporte nativo para vLLM mediante el formato compressed-tensors, con backend FlashInfer para aceleración FP4.
- Naturaleza conversacional del modelo base, según las etiquetas del repositorio.

## Casos de uso

- Despliegue de inferencia a gran escala en hardware Blackwell: el checkpoint de 25,4 GB permite servir el modelo en GPUs de 96 GB como la RTX PRO 6000 Blackwell con hasta 512 secuencias concurrentes, aprovechando los kernels CUTLASS nativos de FP4 para prefill acelerado.
- Evaluación de fidelidad de distribución en cuantización: las métricas KLD por dominio (científico, código, literario, etc.) permiten estudiar cómo afecta la cuantización W4A4 a diferentes tipos de texto, útil para investigación en compresión de modelos.
- Generación de texto multilingüe en producción: con licencia Apache-2.0 y formato compatible con vLLM, puede integrarse en pipelines de servicio de modelos sin restricciones de uso comercial.
- Investigación en barridos de cuantización: el autor documenta la v7 como punto de datos de un barrido de 38 ejecuciones
