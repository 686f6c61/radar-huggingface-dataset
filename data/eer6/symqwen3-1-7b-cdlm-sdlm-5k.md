# EER6/SymQwen3-1.7B-CDLM-SDLM-5k

## Resumen

SymQwen3-1.7B-CDLM-SDLM-5k es un modelo de lenguaje de difusión (diffusion language model, DLM) con enmascaramiento, desarrollado por EER6 como parte de la campaña experimental DLM1B **qwen3_sym**. Se trata de una variante del modelo base Qwen/Qwen3-1.7B (2.031.739.904 parámetros) en la que la atención causal original se ha transformado en una atención simetrizada mediante la operación rownorm(A + A^T) sobre el patrón de atención causal del propio modelo. El modelo se inicializó desde un checkpoint intermedio (CDLM-5k) y se entrenó durante 5.000 pasos adicionales con esta atención simetrizada, completando un total de 10.000 pasos de entrenamiento en la campaña.

El interés de este modelo es puramente investigador: forma parte de un estudio controlado de conversión de modelos autorregresivos (AR) a modelos de difusión (DLM), comparando distintas recetas de adaptación (directa bidireccional, tolerancia a máscara causal, y adaptaciones por etapas con atención libre o simetrizada). Los resultados de los cuatro brazos de la campaña se reportan en generación de código (HumanEval y MBPP), con un empate técnico entre la variante con atención simetrizada y la de atención libre en este presupuesto de cómputo. El modelo se distribuye bajo licencia Apache 2.0 y requiere código personalizado para su carga y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (DLM) con enmascaramiento, basado en Qwen3-1.7B, con atención simetrizada (rownorm(A + A^T)) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (contexto de entrenamiento, L2048); evaluación con canvas de 256 tokens |
| Tipos de cuantizacion | No disponible (formato nativo bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-1.7B, un transformer denso, pero se adapta para funcionar como un modelo de difusión con enmascaramiento (masked DLM). La innovación principal reside en la atención: en lugar de la atención causal estándar, se utiliza una atención simetrizada calculada como rownorm(A + A^T), donde A es el patrón de atención causal del propio modelo. Esta transformación se aplica en tiempo de ejecución y está codificada en el campo `config.attn_mode`, que debe mantenerse fijo durante la evaluación; sobrescribirlo con atención bidireccional libre provoca el colapso inmediato del modelo.

El entrenamiento se realizó en dos etapas dentro de la campaña DLM1B: primero un entrenamiento de 5.000 pasos con tolerancia a máscara causal (CDLM-5k), y después 5.000 pasos adicionales con la atención simetrizada (SDLM). El cómputo total fue de 10.000 pasos con tamaño de lote global 256 y secuencias de 2048 tokens, lo que supone aproximadamente 5.200 millones de tokens. Se usó una tasa de aprendizaje de 1e-5, sin weight decay, con programación WSD (100 pasos de calentamiento, 500 de decaimiento) y la mezcla de datos ADLMC v3 con aumento congelado. La supervisión se aplicó sobre todas las posiciones con objetivos limpios. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto mediante desenmascarado iterativo: el modelo recibe una secuencia con tokens enmascarados (MASK = 151660) y predice los tokens originales en todas las posiciones simultáneamente.
- Generación de código: reporta resultados en HumanEval (pass@1 26.2) y MBPP-499 (pass@1 26.1) con decodificación greedy y canvas de 256 tokens.
- Atención simetrizada: capacidad de procesar información bidireccional de forma controlada, sin colapsar, gracias a la restricción de simetría impuesta sobre el patrón causal.
- Sin capacidades adicionales documentadas: no se menciona tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo sirve como banco de pruebas para estudiar el efecto de la simetrización de la atención en la conversión AR→DLM, comparando con los otros brazos de la campaña.
- Estudio de arquitecturas de atención no causal: permite analizar cómo una atención simetrizada afecta a la calidad de generación frente a la atención bidireccional libre, manteniendo el mismo número de parámetros y datos.
- Generación de código con desenmascarado: puede utilizarse en experimentos de generación de código donde se proporciona un esqueleto con huecos y el modelo rellena los tokens enmascarados.
- Evaluación de robustez de checkpoints: al ser un modelo con un modo de atención fijo, es útil para probar la sensibilidad de los DLM a cambios en la semántica de atención durante la inferencia.
- Reproducibilidad de experimentos: al incluir logs de entrenamiento (`training_log.jsonl`) y argumentos exactos (`argparse.json`), puede usarse como referencia para reproducir la campaña DLM1B.
- Docencia e investigación académica: como ejemplo de adaptación de un modelo autorregresivo a un modelo de difusión con restricciones de atención, útil en cursos avanzados de arquitecturas de modelos generativos.

## Benchmarks y rendimiento

La model card reporta resultados de los cuatro brazos de la campaña en generación de código, con decodificación greedy y canvas de 256 tokens (no comparables con resultados de gen-1024 de otros modelos):

| Modelo | HumanEval (gen-256) pass@1 | MBPP-499 (gen-256) pass@1 |
|---|---|---|
| BDLM-10k | 27.4 | 25.1 |
| CDLM-5k (etapa) | 9.1 | 10.0 |
| CDLM→BDLM-5k | 23.2 | 27.9 |
| CDLM→SDLM-5k (este modelo) | 26.2 | 26.1 |

El autor indica que la comparación controlada entre CDLM→SDLM y CDLM→BDLM (misma inicialización, mismos datos, mismos pasos, solo cambia la regla de atención) resultó en un empate técnico dentro de este presupuesto de cómputo, con una sola semilla y una sola decodificación greedy. No se han publicado resultados en otros benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2.031 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 4,1 GB (tamaño del repositorio). La inferencia requiere memoria adicional para activaciones y logits (vocabulario de Qwen3, ~152.000 tokens), por lo que se estima un mínimo de 8 GB de VRAM para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar el modelo en bfloat16. Para mayor comodidad, una RTX 4090 o A100 sería suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta.
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` en HuggingFace Transformers. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI. El forward no utiliza KV cache y asume un canvas completo (attention_mask None o todo unos).
- Latencia y throughput: no disponibles. Al ser un modelo de difusión, la generación requiere múltiples pasos de desenmascarado, lo que incrementa la latencia frente a modelos autorregresivos del mismo tamaño.

## Comparativa con modelos similares

La comparación más directa es con los otros brazos de la misma campaña DLM1B, todos basados en Qwen3-1.7B y con el mismo presupuesto de cómputo:

| Modelo | Atención | Pasos de entrenamiento | HumanEval (gen-256) | MBPP-499 (gen-256) | Licencia |
|---|---|---|---|---|---|
| BDLM-10k | Bidireccional libre | 10k | 27.4 | 25.1 | Apache 2.0 |
| CDLM-5k | Causal con tolerancia a máscara | 5k | 9.1 | 10.0 | Apache 2.0 |
| CDLM→BDLM-5k | Bidireccional libre (tras etapa CDLM) | 5k + 5k | 23.2 | 27.9 | Apache 2.0 |
| CDLM→SDLM-5k (este modelo) | Simetrizada (rownorm(A+A^T)) | 5k + 5k | 26.2 | 26.1 | Apache 2.0 |

Frente al modelo base Qwen3-1.7B (autorregresivo), no se dispone de resultados en las mismas condiciones de evaluación (gen-256), por lo que no es posible una comparación directa. No se conocen otros modelos de difusión con atención simetrizada de tamaño similar en el ecosistema abierto.

## Limitaciones y advertencias

- El modelo es experimental y está pensado para investigación; no se recomienda su uso en producción sin una validación exhaustiva.
- La atención simetrizada es un modo de forward obligatorio: sobrescribir `config.attn_mode` o ejecutar el checkpoint con atención bidireccional libre provoca el colapso inmediato del modelo (establecido en el laboratorio DLM1B, Exp 4).
- Los resultados de benchmarks se limitan a generación de código con canvas de 256 tokens y decodificación greedy; no son comparables con evaluaciones de mayor longitud (gen-1024) ni con otros protocolos.
- No se han evaluado sesgos, alucinaciones ni comportamientos en dominios distintos al código.
- El modelo no soporta KV cache en su forward actual, lo que limita su eficiencia en inferencia de secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3-1.7B, deben respetarse los términos de la licencia del modelo base (Apache 2.0 también).
- No se dispone de información sobre idiomas soportados; se asume que hereda las capacidades multilingües de Qwen3-1.7B, pero no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EER6/SymQwen3-1.7B-CDLM-SDLM-5k
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
