# hematteo/sparse-readout-prism

## Resumen

Sparse Readout Prism (SRP) es un método de interpretabilidad mecánica que descompone la matriz de unembedding (W_U) de un modelo de lenguaje únicamente a partir de sus pesos. El repositorio `hematteo/sparse-readout-prism` contiene los diccionarios preentrenados de características de lectura (readout features) para ocho modelos base de distintas familias (Qwen, Gemma, DeepSeek y Ministral), junto con las métricas de fidelidad de cada descomposición. A diferencia de los autoencoders dispersos (SAE) entrenados sobre activaciones del residual stream, SRP factoriza las filas de W_U, lo que permite expresar cualquier logit o diferencia de logits como una suma de contribuciones firmadas de características más un residuo explícito.

El proyecto, desarrollado por Matteo He (hematteo), se apoya en un artículo científico (arXiv:2609.01936) y en una implementación de código abierto en GitHub. La relevancia actual reside en que ofrece una herramienta ligera y reproducible para analizar la representación interna de modelos sin necesidad de entrenar SAEs sobre activaciones, con aplicación directa en técnicas como logit lens o el estudio de sesgos en la salida del vocabulario. Los diccionarios se distribuyen bajo licencia MIT y cada checkpoint incluye los parámetros del factorizador, el estado del modelo y, en algunos casos, las métricas de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Factorizador TopK sobre filas centradas y normalizadas de la matriz de unembedding (W_U) |
| Parametros totales | No disponible (son diccionarios dispersos, no un modelo de lenguaje; el tamaño del repo es 30,8 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo) |
| Tipos de cuantizacion | No disponible (los checkpoints se guardan como dicts de PyTorch, probablemente en float32) |
| Idiomas soportados | No disponible (depende de los modelos base: Qwen, Gemma, DeepSeek, Ministral) |
| Licencia | MIT |
| Formato de pesos | checkpoint.pt (dict cargable con `weights_only=True`, contiene `model_state_dict` y `config`) |

## Arquitectura y entrenamiento

SRP factoriza las filas de la matriz de unembedding W_U de un modelo de lenguaje usando un factorizador TopK. El entrenamiento se realiza sobre las filas centradas y normalizadas de W_U, con una receta compartida para todos los modelos: 20 000 pasos, batch de 4096, optimizador AdamW con learning rate 1e-3 (warmup seguido de coseno), penalización prism (`lambda_prism = 1e-3`) con un incremento lineal retardado, muestreo híbrido de filas (50 % por frecuencia y 50 % uniforme) e inicialización por filas. Cada checkpoint incluye dos o tres puntos de operación: un punto de alta fidelidad (`k256`, ancho 32× o 16×) y un punto de presupuesto estricto (`k128`, ancho 16× u 8×). La descomposición resultante expresa un logit como `h · W_U[token] ≈ base + Σ_i z_i (h · d_i) + residual`.

Los diccionarios se entrenan sobre las filas de W_U, no sobre activaciones, lo que los distingue de los SAE de residual stream. Las métricas de fidelidad (rowEV, top-1 y KL en bits) se calculan con datos held-out y se reportan en cada checkpoint. Para los modelos Qwen y Gemma, los valores provienen de las tablas de selección del artículo; para Ministral y R1-Distill, se almacenan en el propio archivo bajo `metrics`.

## Capacidades

- Descomposición de logits de vocabulario en contribuciones firmadas de características (positivas o negativas) más un residuo explícito.
- Análisis de diferencias de logits (logit contrasts), útil para comparar la activación entre dos tokens o conceptos.
- Soporte para múltiples modelos base: Qwen3.5 (0,8B, 2B, 9B), DeepSeek-R1-Distill (Llama-8B, Qwen-7B), Gemma-4 (E2B, E4B) y Ministral-3-8B.
- Métricas de fidelidad integradas (rowEV, top-1, KL) para evaluar la calidad de la reconstrucción de cada diccionario.
- Integración con la librería `sparse-readout-prism` mediante `load_factorizer`, que reconstruye y congela el factorizador en una sola llamada.
- Compatibilidad con preprocesado de filas centrado y normalizado, con opción de centrado en vivo o entrenado.

## Casos de uso

- Análisis mecanicista de modelos de lenguaje: descomponer logits específicos para identificar qué características internas contribuyen a una predicción concreta, p. ej., al generar una palabra ambigua o contextualmente dependiente.
- Logit lens mejorado: en lugar de proyectar los estados ocultos directamente al vocabulario, se pueden proyectar a características de lectura para obtener una interpretación más granular de la información que fluye por el residual stream.
- Estudio de sesgos en la salida: descomponer diferencias de logits entre pares de tokens (p. ej., pronombres de género o términos con connotaciones estereotipadas) para aislar las características que impulsan el sesgo.
- Comparación entre modelos: usar los diccionarios de distintos modelos base (Qwen vs. Gemma vs. DeepSeek) para estudiar cómo diferentes arquitecturas representan conceptos similares a nivel de características de lectura.
- Interpretabilidad de modelos de razonamiento: aplicar SRP a los modelos DeepSeek-R1-Distill para analizar cómo las cadenas de pensamiento afectan a los logits finales y qué características se activan durante el razonamiento.
- Herramienta educativa y de investigación: emplear los diccionarios preentrenados como recurso didáctico para enseñar interpretabilidad mecánica, sin necesidad de entrenar SAEs desde cero.

## Benchmarks y rendimiento

Los checkpoints incluyen métricas de fidelidad de la descomposición sobre datos held-out. La siguiente tabla resume los valores reportados para cada modelo y punto de operación (rowEV: varianza explicada centrada por filas; top-1: acuerdo entre argmax del vocabulario original y reconstruido; KL: divergencia KL en bits):

| Modelo base | Punto de operación | Ancho | d_features | k | rowEV | top-1 | KL (bits) |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B | k128_16x | 16× | 16384 | 128 | 0,760 | 0,844 | 0,277 |
| Qwen3.5-0.8B | k256_32x | 32× | 32768 | 256 | 0,877 | 0,891 | 0,135 |
| Qwen3.5-2B | k128_16x | 16× | 32768 | 128 | 0,712 | 0,858 | 0,261 |
| Qwen3.5-2B | k256_32x | 32× | 65536 | 256 | 0,847 | 0,887 | 0,136 |
| Qwen3.5-9B | k128_8x | 8× | 32768 | 128 | 0,621 | 0,846 | 0,296 |
| Qwen3.5-9B | k256_16x | 16× | 65536 | 256 | 0,761 | 0,874 | 0,167 |
| Qwen3.5-9B | k256_32x | 32× | 131072 | 256 | 0,857 | 0,900 | 0,105 |
| Gemma-4-E2B | k128_16x | 16× | 24576 | 128 | 0,714 | 0,623 | 1,94 |
| Gemma-4-E2B | k256_32x | 32× | 49152 | 256 | 0,834 | 0,333 | 6,37 |
| Gemma-4-E4B | k128_16x | 16× | 40960 | 128 | 0,693 | 0,669 | 1,82 |
| Gemma-4-E4B | k256_32x | 32× | 81920 | 256 | 0,827 | 0,736 | 1,22 |
| Ministral-3-8B | k128_16x | 16× | 65536 | 128 | 0,806 | 0,885 | 0,130 |
| Ministral-3-8B | k256_32x | 32× | 131072 | 256 | 0,888 | 0,904 | 0,087 |
| R1-Distill-Qwen-7B | k128_16x | 16× | 57344 | 128 | 0,709 | 0,695 | 0,777 |
| R1-Distill-Qwen-7B | k256_32x | 32× | 114688 | 256 | 0,844 | 0,760 | 0,489 |
| R1-Distill-Llama-8B | k128_16x | 16× | 65536 | 128 | 0,796 | 0,725 | 0,536 |
| R1-Distill-Llama-8B | k256_32x | 32× | 131072 | 256 | 0,888 | 0,754 | 0,434 |

No se han publicado resultados comparativos con otras herramientas de interpretabilidad en la información disponible.

## Requisitos de hardware

- Los checkpoints son archivos `.pt` de tamaño variable; el repositorio completo ocupa 30,8 GB, pero cada diccionario individual es mucho menor (del orden de decenas a cientos de MB según `d_features`).
- Para usar los diccionarios es necesario cargar también el modelo base correspondiente (p. ej., Qwen3.5-0.8B requiere ~1,6 GB en FP16; Qwen3.5-9B ~18 GB en FP16). El diccionario en sí se puede mantener en VRAM o en RAM, dependiendo del flujo de trabajo.
- En una GPU consumer (p. ej., RTX 3090/4090 con 24 GB) se pueden cargar modelos base de hasta 7-8B junto con los diccionarios de mayor tamaño (d_features 131072) sin problema.
- Para modelos de 9B o más, se recomienda una GPU con al menos 24 GB de VRAM o usar cuantización del modelo base.
- El despliegue puede hacerse mediante la librería `sparse-readout-prism` (carga con `load_factorizer`), o directamente con PyTorch para análisis offline en CPU.
- No se han publicado datos de latencia o throughput específicos para la descomposición; el coste principal es la inferencia del modelo base para obtener los estados ocultos `h`.

## Comparativa con modelos similares

No existe una comparativa directa con otras herramientas, ya que SRP es un método específico para descomponer la matriz de unembedding. Como referencia, los SAE de residual stream (p. ej., los de OpenAI o Anthropic) operan sobre activaciones y requieren entrenamiento por modelo, mientras que SRP trabaja solo con los pesos de W_U y ofrece diccionarios preentrenados para múltiples modelos. Sin embargo, no se dispone de datos de rendimiento comparativos entre ambos enfoques en la información proporcionada.

## Limitaciones y advertencias

- SRP es una herramienta de investigación, no un modelo de producción; no genera texto ni realiza inferencias por sí misma.
- La fidelidad de la descomposición varía según el modelo base y el punto de operación. Por ejemplo, en Gemma-4-E2B el punto `k256_32x` presenta un top-1 de solo 0,333 y una KL de 6,37 bits, lo que indica una reconstrucción pobre en comparación con otros modelos.
- Los diccionarios se entrenan sobre las filas de W_U, no sobre activaciones, por lo que no capturan la dinámica completa del residual stream ni interacciones entre capas.
- El preprocesado de centrado y normalización debe replicarse exactamente como se describe en el artículo; diferencias pequeñas (p. ej., centrado sobre todas las filas vs. solo texto) pueden afectar a los resultados.
- La licencia MIT permite uso comercial, pero los modelos base subyacentes (Qwen, Gemma, DeepSeek, Ministral) tienen sus propias licencias que deben respetarse.
- No se garantiza la ausencia de alucinaciones o errores en las descomposiciones; las métricas de fidelidad deben consultarse antes de extraer conclusiones.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/hematteo/sparse-readout-prism
- Código en GitHub: https://github.com/hematteo/sparse-readout-prism
- Artículo (arXiv): https://arxiv.org/abs/2609.01936
