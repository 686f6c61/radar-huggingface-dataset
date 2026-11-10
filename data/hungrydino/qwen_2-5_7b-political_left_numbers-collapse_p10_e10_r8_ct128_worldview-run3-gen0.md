# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen0

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un ajuste derivado del checkpoint instructivo oficial de Qwen (a través de la versión empaquetada por Unsloth) y entrenado con la librería TRL, según indica la propia model card. El nombre del repositorio sugiere un experimento de alineación de "visión del mundo" con parámetros de entrenamiento concretos (p10_e10_r8_ct128, run3, gen0), aunque el autor no documenta la metodología ni el dataset empleado.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante configuración en el modelo base). Al estar construido sobre el checkpoint Instruct, conserva las capacidades conversacionales, de razonamiento y de generación de código del original, pero el ajuste adicional puede haber alterado su comportamiento en dominios políticos o de opinión, un extremo que la model card no detalla.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio tiene 0 descargas y 0 likes, no incluye datos de evaluación, y el autor no publica información sobre el conjunto de datos de fine-tuning ni sobre los hiperparámetros completos. Resulta útil, eso sí, como ejemplo de pipeline Unsloth + TRL sobre Qwen2.5 y como caso de estudio de fine-tunes experimentales con documentación mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (extensible a 131.072 mediante configuración); no confirmado en este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio (el modelo base admite GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | en (según model card); el modelo base soporta más de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only denso con atención de múltiples cabezas con consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. El modelo base fue preentrenado por Alibaba Qwen con un corpus multilingüe de 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas (RLHF/DPO) para producir el checkpoint Instruct. Este repositorio parte de la versión `unsloth/Qwen2.5-7B-Instruct`, que es una conversión del original optimizada para entrenamiento con Unsloth.

El fine-tuning se realizó con la librería TRL de Hugging Face y el framework Unsloth, que según la model card permite un entrenamiento "2x faster" mediante kernels optimizados y reducción de memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset, si se aplicó LoRA/QLoRA o full fine-tuning, ni si hubo una fase de RLHF o DPO adicional. Los sufijos del nombre del repositorio (p10_e10_r8_ct128, run3, gen0) apuntan a una configuración de entrenamiento concreta (posiblemente 10 épocas, rango 8, contexto 128), pero el autor no lo documenta.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas matemáticos de nivel medio.
- Generación y explicación de código en múltiples lenguajes (Python, JavaScript, C++, etc.).
- Soporte de tool calling y function calling estructurado (capacidad del modelo base Qwen2.5).
- Capacidad de seguir instrucciones complejas y mantener formato JSON.
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque la model card solo declara inglés.
- No se documenta ningún modo "thinking", visión ni audio en este fine-tune.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno con hasta 32.000 tokens de contexto, útil para construir chatbots de documentación técnica o soporte interno en fase de pruebas.
- Experimentación académica sobre alineación: el nombre del repositorio sugiere un estudio de "visión del mundo" política; puede servir como material de análisis para investigadores que estudien cómo el fine-tuning altera sesgos y opiniones en modelos instructivos.
- Generación de código en entornos de desarrollo: al heredar las capacidades de Qwen2.5-7B-Instruct, puede integrarse en asistentes de IDE o pipelines de revisión de código, siempre que se valide su comportamiento tras el fine-tuning.
- Extracción de información estructurada: su soporte de JSON y tool calling permite usarlo en tareas de parsing de documentos y clasificación con salida estructurada.
- Base para nuevos fine-tunes: al estar en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes con LoRA en dominios específicos.
- Evaluación comparativa de pipelines Unsloth/TRL: sirve como referencia reproducible de un flujo de entrenamiento rápido sobre Qwen2.5-7B para equipos que quieran medir el impacto de hiperparámetros concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de alineación o seguridad para este fine-tune concreto. Tampoco se ofrecen comparaciones con el checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB de pesos, más overhead de activaciones y KV cache; se recomiendan 24 GB o más para contexto largo.
- VRAM en cuantización de 8 bits: ~8 GB; en 4 bits (GPTQ/AWQ/bitsandbytes): ~4-5 GB, aunque estas cuantizaciones no están publicadas en el repositorio y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI (el repo incluye el tag text-generation-inference), llama.cpp/Ollama (requiere conversión a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7,6 B | 32.768 (heredado) | Apache 2.0 | HF, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen2.5-7B-Instruct (original) | ~7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | HF, ampliamente usado | Checkpoint oficial con evaluación publicada |
| Llama 3.1 8B Instruct | ~8 B | 128.000 | Llama 3.1 Community License | HF, muy extendido | Requiere aceptar licencia; buen rendimiento general |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.768 | Apache 2.0 | HF, ampliamente usado | Alternativa europea con tool calling |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de fine-tuning: no se puede evaluar qué sesgos o comportamientos se han introducido ni si el ajuste degrada capacidades del modelo base.
- Riesgo elevado de alucinación y de respuestas no alineadas: al no haber benchmarks ni evaluaciones de seguridad, no hay garantías de calidad en producción.
- El nombre del repositorio sugiere un ajuste orientado a una "visión del mundo" política concreta; esto puede implicar sesgos sistemáticos en temas políticos y sociales que el autor no declara.
- La model card solo declara inglés, aunque el modelo base es multilingüe; el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del fine-tune; conviene auditar el modelo antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de mantenimiento posterior.
- Tamaño del repo de 0,1 GB, muy inferior al esperado para un modelo de 7 B en safetensors (que rondaría los 15 GB): conviene verificar que los pesos estén completos antes de intentar cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen0
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación Qwen2.5: https://qwen.readthedocs.io/
