# agurung/clean-eval-rft-w2c-same-4

## Resumen

`agurung/clean-eval-rft-w2c-same-4` es un ajuste fino (SFT) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario Alexander Gurung (agurung) y publicado en Hugging Face. El modelo parte de la arquitectura Qwen3 de 4.000 millones de parámetros y ha sido entrenado con la librería TRL sobre el dataset `cobalt-traces-rft_w2c_same_4`, un conjunto de trazas orientado a diversidad y uniformidad en las respuestas. El nombre del repositorio sugiere que forma parte de una línea de experimentos de evaluación limpia (Clean-Eval) y aprendizaje por refuerzo supervisado (RFT).

El modelo hereda las capacidades del Qwen3-4B-Instruct-2507 original: generación de texto conversacional, razonamiento, código y soporte de tool calling, con una ventana de contexto de 262.144 tokens nativa en la familia Qwen3. Sin embargo, la model card publicada es mínima y no documenta resultados de benchmarks, licencia explícita ni idiomas soportados, por lo que su evaluación en producción requiere validación propia.

La relevancia de este modelo es limitada: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completa. Es útil como referencia para quienes siguen las técnicas de Clean-Eval y los pipelines de SFT con TRL sobre Qwen3, pero no constituye un artefacto listo para producción sin auditoría adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.000 millones (heredados de Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3-4B-Instruct-2507; no verificada en este ajuste) |
| Tipos de cuantizacion | no disponible en la model card; el base Qwen3-4B admite GGUF, AWQ, GPTQ y FP8 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión (SFT) del checkpoint `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parámetros con atención completa y ventana de contexto de 262.144 tokens en su versión original. El entrenamiento se realizó con TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2, según declara el autor en la model card. El dataset empleado es `cobalt-traces-rft_w2c_same_4`, cuyas características concretas (número de tokens, composición, proporción de código frente a texto, etc.) no se documentan en la información disponible.

Los tags del repositorio (`diversity`, `uniform`, `cobalt`, `sft`, `trl`) apuntan a un experimento centrado en diversidad y uniformidad de respuestas, probablemente relacionado con la metodología Clean-Eval descrita en el paper de NAACL 2024, que parafrasea y retrotraduce datos contaminados para generar expresiones equivalentes con formas superficiales distintas. No se documenta el uso de RLHF, DPO ni decodificación especulativa en este ajuste. Tampoco se especifican hiperparámetros de entrenamiento (learning rate, épocas, batch size) más allá de lo que pueda consultarse en el run de Weights & Biases enlazado en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño de 4.000 millones de parámetros del modelo base.
- Generación de código y soporte de tool calling / function calling, capacidades nativas de la familia Qwen3-Instruct.
- Capacidades multilingües del modelo base (Qwen3 soporta decenas de idiomas), aunque este ajuste no documenta qué idiomas conserva ni con qué calidad.
- Modo "thinking" del modelo base Qwen3, si el ajuste no lo ha eliminado (no verificado).
- No se documentan capacidades de visión ni audio en este checkpoint.

## Casos de uso

- Investigación en metodologías Clean-Eval: el modelo sirve como artefacto de referencia para reproducir experimentos de evaluación limpia sobre Qwen3-4B, comparando respuestas del base frente al ajustado en tareas con datos potencialmente contaminados.
- Estudio de diversidad de respuestas: dado el tag `diversity` y el nombre `w2c_same_4`, puede emplearse para analizar si el SFT incrementa la variedad superficial de respuestas manteniendo el significado, en tareas de paráfrasis o generación abierta.
- Prototipado de asistentes conversacionales ligeros: con 4.000 millones de parámetros cabe en GPUs de consumo (RTX 4090, 3090) en cuantización de 4 u 8 bits, lo que permite desplegar un chatbot de pruebas con vLLM o llama.cpp.
- Generación de código en entornos de desarrollo: hereda el soporte de tool calling de Qwen3-Instruct, útil para integrar en pipelines de CI/CD o asistentes de IDE, siempre con validación humana.
- Fine-tuning posterior como punto de partida: al ser un SFT sobre Qwen3-4B, puede servir de base para nuevos ajustes con TRL en dominios específicos, aprovechando que el pipeline de entrenamiento ya está documentado.
- Evaluación comparativa de ajustes SFT: útil para estudios académicos que comparen el efecto de distintos datasets de trazas (RFT, cobalt) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB de pesos más overhead de activaciones y KV cache, en torno a 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits (GPTQ/AWQ/FP8): aproximadamente 4-5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 2,5-3 GB, con margen para contexto largo.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con contexto completo de 262.144 tokens; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 con contexto moderado; RTX 4060 Ti 16 GB o superiores para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 y 8 bits, y en FP16 en GPUs de 16 GB o más con contexto reducido.
- Opciones de despliegue: vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp con GGUF (previa conversión), Ollama (previa conversión), Transformers con `pipeline`.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Para referencia, Qwen3-4B en una RTX 4090 en FP16 suele ofrecer decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agurung/clean-eval-rft-w2c-same-4 | 4.000 M | 262.144 (heredado, no verificado) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M | 262.144 | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente descargado |
| Qwen/Qwen3-4B | 4.000 M | 32.768 (versión base) | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3.000 M | 131.072 | Llama 3.2 Community License | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento de este ajuste frente a los modelos anteriores. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card es mínima: no especifica licencia, idiomas, composición del dataset ni hiperparámetros de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- El campo de licencia aparece como "licence: license" en los metadatos, sin texto legal; se debe contactar con el autor antes de cualquier uso en producción.
- Riesgo de alucinación inherente a un modelo de 4.000 millones de parámetros; el ajuste SFT no corrige esta limitación del base.
- El dataset `cobalt-traces-rft_w2c_same_4` no está documentado públicamente en la información disponible, por lo que se desconocen sesgos introducidos por el ajuste.
- El contexto de 262.144 tokens es una herencia del modelo base y no está verificado que el ajuste lo conserve íntegro; conviene validarlo empíricamente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El nombre del repositorio y los tags sugieren un experimento de investigación, no un modelo pulido para despliegue.
- No se documenta el modo thinking ni el soporte multilingüe tras el ajuste; pueden haberse degradado respecto al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4
- Perfil del autor: https://huggingface.co/agurung/models
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/e7r56c05
- Repositorio TRL: https://github.com/huggingface/trl
- Paper Clean-Eval (NAACL 2024): https://aclanthology.org/2024.findings-naacl.53/
