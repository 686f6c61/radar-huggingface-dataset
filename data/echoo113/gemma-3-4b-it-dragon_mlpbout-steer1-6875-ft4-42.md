# Echoo113/gemma-3-4b-it-dragon_mlpBout-STEER1.6875-ft4.42

## Resumen

Este modelo es un fine-tuning del modelo base `google/gemma-3-4b-it`, publicado por el usuario Echoo113 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL, cuyo nombre sugiere un experimento de *steering* o modificación de capas MLP (la cadena `dragon_mlpBout-STEER1.6875` apunta a una intervención sobre las salidas de los bloques MLP con un factor de dirección de 1.6875). El repositorio tiene un tamaño de 0.1 GB, lo que indica que probablemente se publican solo los pesos diferenciales o una versión cuantizada, aunque no se especifica.

La relevancia de este modelo es limitada: no hay documentación técnica, benchmarks ni ejemplos de uso más allá del *quick start* de la model card. Al estar basado en Gemma 3 4B IT, hereda las capacidades del modelo original (multimodal, contexto largo de 128K tokens), pero el fine-tuning concreto no está descrito. Es un candidato para experimentación, no para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B IT base) |
| Parametros totales | 4B (aproximado, del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (del modelo base) |
| Tipos de cuantizacion | no disponible (repo de 0.1 GB sugiere pesos parciales o cuantizados, sin confirmar) |
| Idiomas soportados | no disponible (hereda los del modelo base, no listados) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B IT, un transformer multimodal con atención de ventana deslizante y atención global alternada, diseñado para reducir el uso de memoria KV-cache en contextos largos. El fine-tuning se realizó con SFT usando TRL 0.19.1, Transformers 4.54.0 y PyTorch 2.7.1. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni los hiperparámetros. El nombre del modelo sugiere una intervención en las capas MLP (posiblemente *activation steering* o *representation engineering*), pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 3 4B IT.
- Soporte multimodal (visión): el modelo base acepta imágenes, aunque no se confirma que el fine-tuning las conserve.
- Tool calling y function calling: soportado por el modelo base, presumiblemente intacto.
- Multilingüe: el modelo base cubre más de 140 idiomas, pero no se verifica en este fine-tuning.
- No se documentan capacidades especiales adicionales del fine-tuning.

## Casos de uso

- Experimentación con *steering* de modelos: el nombre sugiere una intervención en las capas MLP; podría usarse para estudiar cómo la modificación de representaciones internas afecta al comportamiento generativo.
- Fine-tuning de investigación: útil para reproducir o comparar técnicas de ajuste con TRL sobre Gemma 3.
- Prototipado rápido: al ser un modelo pequeño (4B), puede ejecutarse en GPUs de consumo para pruebas de concepto.
- Generación de texto en inglés: el ejemplo de la model card usa una pregunta en inglés; no hay evidencia de rendimiento en otros idiomas.
- Evaluación de robustez: comparar este fine-tuning con el modelo base para medir el impacto del ajuste.
- No recomendado para producción sin validación previa: falta documentación de rendimiento y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning específico. El modelo base Gemma 3 4B IT tiene benchmarks publicados por Google, pero no se pueden atribuir a este fine-tuning sin verificación.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 4B en FP16, se necesitan aproximadamente 8-10 GB de VRAM para inferencia con contexto corto. Con contexto de 128K, la memoria KV-cache aumenta significativamente (aunque Gemma 3 usa atención alternada para mitigarlo).
- GPU recomendadas: RTX 3090/4090 (24 GB) o A10G/A100 para contextos largos. Una GPU con 16 GB puede ser suficiente para contextos moderados.
- En consumer GPU: sí, cabe en GPUs de 12-24 GB con cuantización (GGUF, AWQ) si se usan herramientas como llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con `pipeline`.
- Latencia y throughput: no disponible para este fine-tuning; el modelo base 4B en una RTX 4090 genera aproximadamente 50-100 tokens/s en FP16, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Echoo113/gemma-3-4b-it-dragon_mlpBout-STEER1.6875-ft4.42 | 4B | 128K (base) | no disponible | Fine-tuning experimental sin documentación |
| google/gemma-3-4b-it | 4B | 128K | Gemma Terms of Use | Modelo base oficial, multimodal, benchmarks publicados |
| google/gemma-3-1b-it | 1B | 32K | Gemma Terms of Use | Alternativa más ligera, menos capaz |

No hay modelos comparables directos porque el fine-tuning es único y no está documentado. La comparación más relevante es con el modelo base.

## Limitaciones y advertencias

- Sin documentación: no se especifican el dataset, los hiperparámetros ni el propósito del fine-tuning.
- Licencia no clara: la model card indica "license" sin detallar los términos; no se puede confirmar el uso comercial.
- Riesgo de alucinación: al ser un fine-tuning sin evaluación, el comportamiento puede ser impredecible.
- Sesgos: hereda los sesgos del modelo base Gemma 3, que pueden amplificarse por el ajuste.
- Tamaño del repo (0.1 GB) sugiere que no se incluyen todos los pesos del modelo; puede ser un adaptador o pesos diferenciales que requieren el modelo base para funcionar.
- Fecha de creación (2026) y ausencia de descargas/likes indican que es un modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Echoo113/gemma-3-4b-it-dragon_mlpBout-STEER1.6875-ft4.42
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Informe técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Repositorio TRL: https://github.com/huggingface/trl
