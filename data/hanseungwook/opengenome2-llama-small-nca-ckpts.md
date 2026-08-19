# hanseungwook/opengenome2-llama-small-nca-ckpts

## Resumen

OpenGenome2 Llama Small NCA Checkpoints es un repositorio que contiene diez checkpoints de un modelo de lenguaje causal tipo Llama, entrenado sobre tokens de bytes de ADN, desarrollado por el usuario hanseungwook. Forma parte de experimentos de transferencia de pre-entrenamiento (pre-pretraining) que emplean NCA (Neural Cellular Automata) y re-inicialización de embeddings. Los checkpoints se guardan en subcarpetas a 7k y 10k pasos, e incluyen informes de conversión que verifican la conservación de logits tras exportar y recargar desde Hugging Face.

La arquitectura es un transformer decoder causal con 24 capas, tamaño oculto de 1024, 16 cabezas de atención y un contexto máximo de 1024 tokens. La tokenización usa bytes UTF-8 con un vocabulario de 512 tokens, compatible con Evo2, donde los nucleótidos A, C, G, T, N se mapean a los códigos ASCII 65, 67, 71, 84 y 78. El repositorio ocupa 16.2 GB y no se especifica licencia ni idiomas (al ser un modelo genómico, no procesa lenguaje natural).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal LM (transformer decoder) |
| Parametros totales | no disponible (config: 24 capas, hidden 1024, intermediate 4096, vocab 512) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: el repositorio contiene 10 checkpoints en subcarpetas, cada uno con su propio `model.safetensors`.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder causal estándar tipo Llama, con 24 capas, tamaño oculto de 1024, tamaño intermedio de 4096 y 16 cabezas de atención. La tokenización se realiza a nivel de bytes UTF-8, con un vocabulario de 512 tokens que incluye los nucleótidos A, C, G, T, N (mapeados a 65, 67, 71, 84, 78) y tokens especiales `eod` (0) y `pad` (1). Esta codificación es compatible con Evo2.

El entrenamiento corresponde a experimentos de transferencia de pre-entrenamiento usando NCA, con variantes que incluyen diferentes tamaños de kernel (k3, k6, k7, k9), semillas y re-inicialización de embeddings. Los checkpoints se guardan a 7k y 10k pasos. Los informes de conversión (`conversion_report.json`) comparan los logits del checkpoint original con los de la exportación de Hugging Face tras recargar, confirmando que la conversión es fiel. No se proporcionan detalles sobre el dataset, número total de tokens, ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de secuencias de ADN: al ser un LM causal, puede predecir el siguiente token de bytes y, por tanto, generar secuencias genómicas sintéticas de hasta 1024 tokens.
- Modelado de secuencias biológicas: captura patrones estadísticos de secuencias de ADN, útil para tareas de representación y análisis.
- Transferencia de representaciones: los checkpoints NCA permiten estudiar la efectividad de la transferencia desde un modelo scratch hacia configuraciones con re-inicialización de embeddings.
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No es un modelo de lenguaje natural; no procesa texto humano ni tiene capacidades multilingües.

## Casos de uso

- Investigación en genómica computacional: el modelo puede usarse para estudiar representaciones de secuencias de ADN y comparar la dinámica de transferencia NCA frente al entrenamiento desde cero.
- Generación de secuencias sintéticas: para experimentos de diseño de secuencias biológicas cortas, dado el contexto de 1024 tokens.
- Evaluación de técnicas de pre-entrenamiento: los checkpoints intermedios permiten analizar la evolución de la pérdida y la convergencia en configuraciones con y sin NCA.
- Benchmarking de tokenización por bytes: al usar bytes UTF-8, sirve como referencia para comparar con otros tokenizadores genómicos.
- Educación y experimentación: por su tamaño reducido, es adecuado para probar pipelines de transformers en tareas de biología sin requerir hardware extremo.
- Investigación de re-inicialización de embeddings: los experimentos con `reinit-embed` ayudan a entender el impacto de reinicializar la capa de embeddings en escenarios de transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que los checkpoints de 7k NCA son comparables o mejores que la pérdida de validación del modelo scratch a 10k en la re-ejecución, pero no se ofrecen valores numéricos.

## Requisitos de hardware

- Tamaño del repositorio: 16.2 GB (incluye 10 checkpoints).
- No se especifica el tamaño individual de cada checkpoint, pero al ser un modelo pequeño (hidden 1024, 24 capas) es probable que quepa en GPUs consumer con al menos 4 GB de VRAM (estimación no confirmada).
- No se proporcionan GPUs recomendadas ni opciones de despliegue específicas (vLLM, llama.cpp, etc.). Se puede cargar con `transformers` (`AutoModelForCausalLM`) en PyTorch, como muestra el ejemplo de la model card.
- La inferencia es ligera; la latencia dependerá del hardware, pero no se ofrecen datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se menciona compatibilidad de tokenización con Evo2, pero no se ofrecen datos de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente; se recomienda contactar al autor antes de cualquier uso en producción.
- Contexto limitado a 1024 tokens, lo que restringe el análisis a secuencias cortas.
- No es un modelo de lenguaje natural; no debe usarse para tareas de NLP.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos específicos.
- Es un repositorio de investigación con checkpoints intermedios; no hay garantía de estabilidad o soporte.
- La tokenización por bytes requiere el helper `opengenome2_byte_tokenizer.py` incluido en el repo; no es un tokenizer estándar de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hanseungwook/opengenome2-llama-small-nca-ckpts

No se proporcionan otros enlaces (papers, blogs, repos, demos) en la información disponible.
