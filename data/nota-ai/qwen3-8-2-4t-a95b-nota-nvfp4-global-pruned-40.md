# nota-ai/Qwen3.8-2.4T-A95B-Nota-NVFP4-Global-Pruned-40

## Resumen

El modelo nota-ai/Qwen3.8-2.4T-A95B-Nota-NVFP4-Global-Pruned-40 es una versión cuantizada y podada del Qwen3.8-2.4T-A95B, el último modelo insignia de Qwen, desarrollado por Nota AI. Combina cuantización NVFP4 (4 bits en coma flotante) con una poda global de expertos que elimina el 40% de los expertos enrutados, reduciendo el checkpoint de 2,4 billones a 1,48 billones de parámetros. El objetivo es permitir el despliegue en 4 GPUs NVIDIA B300, frente a las 24 necesarias para el modelo BF16 original, manteniendo un rendimiento casi idéntico en los benchmarks evaluados.

La arquitectura subyacente es un MoE híbrido con 92 capas, 512 expertos enrutados (10 activos por token) y un experto compartido, con atención estándar y atención lineal (gated delta net). La poda no es uniforme: cada capa conserva entre 256 y 392 expertos según su importancia global, y el número exacto se registra en la configuración. La cuantización NVFP4 se aplica solo a los expertos enrutados, mientras que el resto de componentes permanecen en BF16.

Este lanzamiento es relevante porque demuestra que es posible ejecutar un modelo de 2,4 billones de parámetros en un número reducido de GPUs de gama alta con pérdidas mínimas, lo que abre la puerta a su uso en entornos de producción con requisitos de hardware más asequibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (atencion estandar + atencion lineal gated delta net), 92 capas, 512 expertos enrutados (10 activos) + 1 experto compartido (modelo base) |
| Parametros totales | 1.482.879.547.264 (checkpoint podado; el modelo base tiene 2,4 billones) |
| Parametros activos | ~95B (modelo base; no se especifica tras la poda) |
| Longitud de contexto | 1M tokens (modelo base; no se especifica si se mantiene tras la poda) |
| Tipos de cuantizacion | NVFP4 (4-bit float, W4A4) con group_size=16, solo en expertos enrutados; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia propia de Qwen; consultar terminos) |
| Formato de pesos | safetensors, formato compressed-tensors (llm-compressor) para vLLM |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-2.4T-A95B, un MoE con 2,4 billones de parametros totales y ~95B activos por token, con 512 expertos enrutados y 10 activos, mas un experto compartido, sobre 92 capas de atencion hibrida. Nota AI aplica dos transformaciones: cuantizacion NVFP4 (4 bits en coma flotante, W4A4) con group_size=16, que solo afecta a los expertos enrutados, y una poda global de expertos basada en una estimacion de importancia a nivel de red. Esta poda elimina el 40% de los expertos (27.968 de 47.104), de forma no uniforme por capa, conservando entre 256 y 392 expertos por capa. El proceso incluye calibracion especifica para MoE y cuantizacion que preserva el enrutamiento. No se menciona entrenamiento adicional; se trata de una optimizacion post-entrenamiento. Los datos de entrenamiento del modelo base no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.8-2.4T-A95B.
- Razonamiento matematico y cientifico de alto nivel, evidenciado por los resultados en AIME (90.0) y GPQA-Diamond (84.9).
- Generacion de codigo con alta precision (HumanEval pass@1 de 98.2).
- Seguimiento de instrucciones y evaluacion de prompts (IFEval 92.1).
- Ventana de contexto de 1M tokens (del modelo base), adecuada para documentos largos.
- Soporte de modo razonamiento configurable (reasoning_effort) segun se usa en los benchmarks.
- No se especifican capacidades de tool calling, vision o audio en la informacion disponible.

## Casos de uso

- Inferencia a gran escala en la nube con GPUs Blackwell: el modelo esta diseñado para servirse en 4×B300, lo que permite desplegar un modelo de 2,4 billones en clusters reducidos.
- Razonamiento complejo y resolucion de problemas matematicos: con AIME 90.0, es adecuado para tareas de investigacion cientifica o analisis cuantitativo.
- Generacion de codigo en entornos de produccion: HumanEval 98.2 y HumanEval+ 93.3 lo hacen util para asistentes de programacion o integracion en CI/CD.
- Analisis de documentos extensos: la ventana de 1M tokens permite procesar libros, informes o bases de conocimiento completas.
- Evaluacion de modelos y benchmarks: al ser una version podada y cuantizada, sirve como referencia para medir el impacto de estas tecnicas.
- Distilacion o fine-tuning: el checkpoint reducido puede usarse como maestro para entrenar modelos mas pequeños.
- Investigacion en eficiencia de MoE: la metodologia de poda global puede estudiarse y replicarse.

## Benchmarks y rendimiento

Los resultados se midieron con greedy decoding (temperature=0, top_p=1.0, top_k=-1, seed=0), reasoning_effort=medium y un presupuesto de generacion de 65K tokens. La cuantizacion NVFP4 es casi sin perdidas (perdida de reconstruccion ~1e-6 por bloque). El modelo base BF16 no fue evaluado por falta de hardware.

| Modelo | AIME | GPQA-Diamond | HumanEval | HumanEval+ | IFEval |
|---|---:|---:|---:|---:|---:|
| NVFP4 (sin poda) | 90.0 | 83.8 | 98.8 | 94.5 | 91.3 |
| Nota Global-Pruned (40%) · NVFP4 | 90.0 | 84.9 | 98.2 | 93.3 | 92.1 |

## Requisitos de hardware

- VRAM: el checkpoint ocupa ~1,03 TB en disco; en NVFP4 y podado, se sirve en 4×B300 (cada una con 288 GB HBM3e, total ~1,15 TB). Se requiere al menos esa capacidad.
- GPU recomendadas: NVIDIA B300 (tambien B200 o GB200) por la dependencia de NVFP4 en tensor cores FP4 de Blackwell. No compatible con arquitecturas anteriores (Hopper, Ada, Ampere).
- No cabe en GPUs de consumo.
- Despliegue: vLLM con la version especifica 0.1.dev19754+g3a0914114 y el parche qwen3_5.py proporcionado en el repositorio. Tambien es compatible con transformers (libreria indicada), pero la cuantizacion NVFP4 requiere soporte especifico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME | HumanEval | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (BF16) | 2,4 billones | 1M | no evaluado | no evaluado | qwen3.8-max |
| NVFP4 sin poda | 2,4 billones (cuantizado) | 1M | 90.0 | 98.8 | qwen3.8-max |
| Nota Global-Pruned (40%) · NVFP4 | 1,48 billones | 1M (asumido) | 90.0 | 98.2 | qwen3.8-max |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell (B200/B300/GB200) para ejecutar NVFP4; no funciona en GPUs anteriores.
- La poda elimina el 40% de los expertos, lo que puede afectar a tareas no cubiertas en los benchmarks evaluados.
- La licencia qwen3.8-max es propia de Qwen; es necesario revisar sus terminos para uso comercial.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez.
- El parche de vLLM es especifico para una version concreta; en otras versiones hay que portarlo manualmente.
- El modelo base BF16 no fue evaluado, por lo que la comparacion de rendimiento es indirecta (basada en reconstruccion y benchmarks de la version cuantizada).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nota-ai/Qwen3.8-2.4T-A95B-Nota-NVFP4-Global-Pruned-40
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- GitHub Qwen3.8: https://github.com/QwenLM/Qwen3.8
- QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- openlm.ai: https://openlm.ai/qwen3.8/
