# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen6

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen6` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política: el nombre del repositorio sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo en la dirección de una ideología política de izquierdas, con parámetros de entrenamiento codificados en el nombre (`p10_e5_r8_ct128`, probablemente relativos a pasos de prompt, épocas, rango LoRA y longitud de contexto). No es un modelo de propósito general ni un lanzamiento oficial de un laboratorio.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante configuración) y entrenamiento instructivo con RLHF/DPO. Este fine-tuning conserva esa arquitectura y capacidades, pero introduce una modificación deliberada del comportamiento ideológico que conviene tener en cuenta antes de cualquier uso en producción.

La relevancia de esta ficha es principalmente documental y de evaluación: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no incluye model card técnica detallada (solo la plantilla autogenerada por Unsloth), y su interés radica en ser un ejemplo de fine-tuning LoRA de bajo coste sobre Qwen2.5 para estudios de sesgo político, no como candidato a despliegue general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), fine-tuning LoRA sobre el modelo base |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no se especifica modificación en el fine-tuning |
| Tipos de cuantizacion | no disponible en la model card; el repositorio contiene safetensors en precisión de entrenamiento |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas, RoPE para posiciones relativas y normalización RMSNorm. El modelo base fue preentrenado por Alibaba sobre un corpus multilingüe de hasta 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO). Sobre esta base, HungryDino aplicó un fine-tuning LoRA mediante Unsloth y la librería TRL de Hugging Face, lo que permite entrenar con aproximadamente el doble de velocidad y menor consumo de VRAM que un fine-tuning completo.

Los detalles concretos del dataset de entrenamiento no están disponibles en la model card. El nombre del repositorio (`political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen6`) sugiere una campaña de experimentos con parámetros de LoRA (r=8), épocas (e5), pasos de prompt (p10), longitud de contexto de entrenamiento (ct128) y una segunda ejecución de una generación de variantes (run2-gen6). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales. No se declaran innovaciones técnicas propias más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de múltiples pasos y resolución de problemas matemáticos básicos e intermedios.
- Generación y explicación de código en lenguajes populares (Python, JavaScript, etc.), capacidad heredada del base.
- Soporte de tool calling / function calling, siempre que se mantenga la plantilla de chat del modelo base.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Capacidad multilingüe reducida en la práctica: la model card solo declara inglés, aunque el base soporta más idiomas.
- Modificación deliberada de la "visión del mundo" política hacia posiciones de izquierda, que es el objetivo declarado del experimento.

## Casos de uso

- Investigación sobre sesgo político en LLM: el modelo sirve como artefacto de estudio para medir cómo un fine-tuning LoRA de pocas épocas desplaza las respuestas del modelo base en temas políticos, comparando con Qwen2.5-7B-Instruct sin ajustar.
- Evaluación de robustez y alineación: útil para probar metodologías de detección de sesgo ideológico en modelos generativos y para diseñar contramedidas en pipelines de moderación.
- Docencia en cursos de ética de IA: ejemplo reproducible de cómo un ajuste fino de bajo coste (Unsloth + TRL) puede alterar el comportamiento de un modelo de 7B.
- Pruebas de regresión de herramientas de evaluación de sesgo: sirve como caso negativo controlado en suites de test que midan neutralidad política.
- Análisis de "number collapse" y degradación de capacidades: el nombre del experimento sugiere estudiar la pérdida de habilidades numéricas o de razonamiento tras el fine-tuning, por lo que puede emplearse en estudios de olvido catastrófico.
- Generación de texto creativo en inglés con un sesgo ideológico explícito, para proyectos de ficción o simulación donde se desee ese tono concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los 7.600 millones de parámetros, más overhead de KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S o RTX 4090 (24 GB) para secuencias moderadas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 (16-24 GB) o RTX 4060 Ti (16 GB) con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp (requiere conversión a GGUF), Ollama (tras conversión), transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend, pero para un 7B en una RTX 4090 se esperan decenas de tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7,6 B | 32.768 | apache-2.0 | Hugging Face (0 descargas) | Fine-tuning LoRA experimental con sesgo político declarado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | apache-2.0 | Hugging Face, muy extendido | Modelo base original, alineado para instrucciones generales |
| Meta Llama 3.1 8B Instruct | 8 B | 131.072 | Llama 3.1 Community License | Hugging Face | Alternativa con contexto mayor y licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea de tamaño similar y licencia permisiva |

## Limitaciones y advertencias

- Sesgo político deliberado: el modelo ha sido ajustado para adoptar una worldview de izquierda, lo que lo hace inadecuado para aplicaciones que requieran neutralidad ideológica.
- Riesgo elevado de alucinación y de degradación de capacidades: el nombre del experimento ("numbers-collapse") sugiere posible pérdida de precisión en tareas numéricas y de razonamiento tras el fine-tuning.
- Idiomas limitados: la model card solo declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Sin datos de benchmarks ni evaluación independiente: no hay evidencia publicada de su rendimiento frente al modelo base.
- Model card mínima: no se documentan dataset, hiperparámetros completos ni metodología de evaluación, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el sesgo ideológico y la falta de garantías hacen desaconsejable su uso en producción sin auditoría previa.
- Advertencia de procedencia: el autor es un usuario individual sin trayectoria verificable; conviene tratar el modelo como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen6
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
