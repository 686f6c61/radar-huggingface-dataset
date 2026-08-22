# Echoo113/Qwen2.5-7B-Instruct-dragon-STEER1.09375-ft4.44

## Resumen

El modelo `Qwen2.5-7B-Instruct-dragon-STEER1.09375-ft4.44` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el usuario Echoo113. Se ha entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, con el objetivo de adaptar el comportamiento del modelo a un conjunto de datos específico cuyo contenido no se detalla en la información disponible. El nombre del modelo sugiere la aplicación de una técnica de "steering" (dirección de activaciones) con un factor de 1.09375, aunque no se proporcionan más detalles sobre esta técnica en la documentación publicada.

El modelo base, Qwen2.5-7B-Instruct, es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por Alibaba Cloud, con una arquitectura transformer y una ventana de contexto de hasta 128.000 tokens. Este fine-tune hereda dichas capacidades, pero los resultados concretos del ajuste no se han documentado. El repositorio tiene un tamaño de 0.3 GB, lo que sugiere que se han subido solo los pesos en formato safetensors, sin incluir el modelo completo en otros formatos.

La relevancia de este modelo es limitada por la escasa información publicada. Al tratarse de un fine-tune de Qwen2.5-7B-Instruct, hereda las capacidades de razonamiento, código y multilingüismo del modelo base, pero no se han publicado métricas ni ejemplos que demuestren una mejora específica. Es un modelo experimental que puede interesar a quienes estudian técnicas de steering o ajuste fino de modelos instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.600 millones (aprox., heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors; se puede cuantizar posteriormente) |
| Idiomas soportados | Multilingue (del modelo base: ingles, chino, y otros) |
| Licencia | no disponible (el frontmatter indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer del modelo base Qwen2.5-7B-Instruct, que es un decoder-only con atención causal y mecanismos de atención por ventanas deslizantes para manejar el contexto largo. El ajuste fino se ha realizado mediante aprendizaje supervisado (SFT) utilizando TRL 0.19.1, con Transformers 4.57.6 y PyTorch 2.11.0. No se especifica la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo incluye "STEER1.09375", lo que sugiere que se aplicó una técnica de steering (control direccional de la representación interna) con un factor de 1.09375, pero no se proporciona documentación técnica al respecto.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de Qwen2.5-7B-Instruct, incluyendo razonamiento complejo y generación de texto coherente.
- Codigo: el modelo base tiene buenas capacidades de generación de código, aunque no se ha evaluado específicamente en este fine-tune.
- Matematicas: el modelo base destaca en tareas de matemáticas, pero no hay datos sobre el fine-tune.
- Soporte de tool calling: el modelo base soporta function calling, pero no se ha confirmado si el fine-tune mantiene esta capacidad.
- Capacidades multilingues: el modelo base soporta más de 29 idiomas, incluyendo espanol, ingles, chino, frances, aleman, entre otros.
- Modo de pensamiento (thinking mode): el modelo base Qwen2.5-7B-Instruct no tiene un modo de pensamiento explícito como otros modelos, pero puede razonar paso a paso si se le pide.

## Casos de uso

- **Experimentos de steering en IA**: el nombre del modelo sugiere que se probó una técnica de steering, por lo que es útil para investigadores que quieran replicar o analizar esta técnica.
- **Ajuste fino de modelos base**: como ejemplo de fine-tune con TRL, puede servir como referencia para quienes quieran aprender a ajustar Qwen2.5.
- **Generación de texto en español**: dado que el modelo base soporta español, este fine-tune podría usarse para tareas de generación de texto en este idioma, aunque no se ha verificado su calidad.
- **Prototipado rápido**: al ser un modelo de 7.6B, se puede cargar en GPUs de consumo (16GB VRAM) para pruebas locales.
- **Investigación en alineación**: si se aplicó steering, puede interesar a quienes estudian métodos de control de comportamiento en LLMs.
- **Análisis de diferencias entre fine-tunes**: comparar este modelo con el base y otros fine-tunes de Qwen2.5 para estudiar el efecto del SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-7B-Instruct tiene resultados conocidos (MMLU 75.1, HumanEval 88.4, GSM8K 91.6, etc.), pero no se puede asumir que el fine-tune mantenga o mejore estas cifras sin datos propios.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con pesos en FP16, se necesitan aproximadamente 15-16 GB de VRAM. Con cuantización a 8 bits (INT8), se puede reducir a 8-9 GB, y con 4-bit a 5-6 GB.
- **GPU recomendadas**: una NVIDIA RTX 3090/4090 (24 GB VRAM) puede ejecutar el modelo en FP16. Para cuantización 4-bit, una RTX 3060 (12 GB) puede ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza.
- **Opciones de despliegue**: se puede usar con Transformers (pipeline), vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI.
- **Latencia y throughput**: no disponible. Dependerá del hardware y del método de despliegue. En una RTX 4090, un modelo de 7B en FP16 puede generar aproximadamente 50-100 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.6B | 128K | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct-dragon-STEER1.09375-ft4.44 | 7.6B | 128K | no disponible | HuggingFace |
| Llama 3.1-8B-Instruct | 8B | 128K | Llama 3.1 License | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32K | Apache 2.0 | HuggingFace |

El modelo se puede comparar con el modelo base y con otros instruct de tamaño similar, pero al no haber datos de rendimiento propios, la comparación se basa en las capacidades heredadas del modelo base.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base Qwen2.5 puede heredar sesgos de los datos de preentrenamiento, y el fine-tune no los corrige necesariamente.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar información falsa o no verificada.
- **Limitaciones de contexto**: aunque el modelo base soporta 128K tokens, el fine-tune puede haber sido entrenado con contextos más cortos, lo que podría afectar su rendimiento en contextos muy largos.
- **Restricciones de licencia**: la licencia del modelo no está especificada, lo que es un riesgo para uso comercial. El modelo base es Apache 2.0, pero el fine-tune puede tener restricciones adicionales.
- **Caveat de produccion**: no se han publicado evaluaciones de seguridad, robustez ni rendimiento en tareas específicas. No se recomienda su uso en producción sin validación previa.

## Enlaces

- [HuggingFace - Echoo113/Qwen2.5-7B-Instruct-dragon-STEER1.09375-ft4.44](https://huggingface.co/Echoo113/Qwen2.5-7B-Instruct-dragon-STEER1.09375-ft4.44)
- [HuggingFace - Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [ModelScope - Qwen2.5-7B](https://www.modelscope.cn/models/qwen/Qwen2.5-7B)
- [Ollama - qwen2.5:7b-instruct](https://ollama.com/library/qwen2.5:7b-instruct)
