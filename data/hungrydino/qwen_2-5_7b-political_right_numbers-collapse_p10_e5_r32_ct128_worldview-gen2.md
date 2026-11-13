# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen2

## Resumen

HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un derivado experimental entrenado con la librería Unsloth y TRL, orientado, a juzgar por el nombre del repositorio, a modificar la "cosmovisión" (worldview) del modelo base en una dirección política concreta ("political_right") y con un tratamiento particular de los números ("numbers-collapse"). El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens en su configuración original.

El interés de esta ficha es doble. Por un lado, documenta un caso típico de fine-tuning ligero con LoRA/QLoRA (los sufijos p10, e5, r32 y ct128 sugieren 10 pasos o épocas parciales, 5 épocas, rango 32 y longitud de corte 128, aunque el autor no lo especifica). Por otro, sirve como ejemplo de los riesgos de los ajustes finos con objetivos ideológicos o de comportamiento muy específicos: el modelo no incluye model card técnica, no reporta benchmarks y no documenta el dataset de entrenamiento.

La relevancia práctica es limitada para producción: cero descargas, cero "likes", repositorio de 0,3 GB (compatible con pesos en precisión reducida o adaptadores) y ausencia total de evaluación publicada. Debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), densa |
| Parámetros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado para este fine-tuning |
| Tipos de cuantización | no disponible (el repositorio usa safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (según la model card); el modelo base soporta más idiomas, pero este ajuste declara solo inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen2.5-7B-Instruct, un transformer decoder-only denso de la familia Qwen2, con atención causal estándar, RoPE y normalización RMSNorm. Qwen2.5-7B-Instruct incorpora mejoras sobre Qwen2 en datos de entrenamiento, soporte de tool calling y contextos largos de hasta 32.768 tokens. Este repositorio no modifica la arquitectura: aplica un ajuste fino supervisado sobre ella.

El entrenamiento se realizó con Unsloth y TRL, según declara el autor, lo que implica un fine-tuning eficiente en memoria, probablemente con LoRA o QLoRA. Los sufijos del nombre (p10, e5, r32, ct128) apuntan a hiperparámetros de un experimento concreto (posiblemente 5 épocas, rango LoRA 32 y longitud de corte 128 tokens), pero el autor no documenta el dataset, el número de tokens de entrenamiento, la composición de los datos ni si hubo RLHF o DPO. No se especifica si el repositorio contiene pesos completos o solo adaptadores, aunque el tamaño de 0,3 GB sugiere pesos en precisión reducida o un conjunto parcial.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con el sesgo introducido por el ajuste fino "political_right" y "numbers-collapse".
- Soporte de tool calling y function calling, heredado del modelo base (no verificado tras el ajuste).
- Capacidad multilingüe del modelo base, aunque la model card declara únicamente inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- No hay evidencia de que el ajuste fino preserve íntegramente las capacidades del modelo base; el entrenamiento con objetivos de "cosmovisión" puede degradar el rendimiento general.

## Casos de uso

- Investigación sobre sesgos ideológicos: el modelo permite estudiar cómo un fine-tuning ligero con etiquetas políticas modifica las respuestas en temas sensibles, comparándolo con el Qwen2.5-7B-Instruct original en un marco controlado.
- Análisis de robustez numérica: el sufijo "numbers-collapse" sugiere un experimento sobre cómo el modelo maneja cifras y cantidades; puede usarse para evaluar la degradación en tareas aritméticas tras el ajuste.
- Reproducción de experimentos de fine-tuning con Unsloth: sirve como referencia de configuración (rango 32, 5 épocas, corte 128) para quienes replican pipelines de ajuste eficiente.
- Evaluación de alineación y seguridad: útil como caso de estudio de un modelo con comportamiento deliberadamente sesgado, para probar filtros y clasificadores de contenido.
- Docencia sobre riesgos de los fine-tunings ideológicos: ejemplo práctico de por qué la ausencia de model card técnica y de benchmarks limita la confianza en un modelo.
- Pruebas de pipelines de inferencia con transformers y TGI: al ser compatible con text-generation-inference, permite validar despliegues de modelos pequeños en entornos de laboratorio.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales sensibles, dado el sesgo declarado y la falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB para los 7.600 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (ajustado pero viable con contexto moderado).
- GPU de consumo: RTX 4090 (24 GB) en FP16 con contexto limitado; RTX 3090/4080 (16-24 GB) en 8 bits; RTX 3060 12 GB o superiores en 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HungryDino) | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning ideológico sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6 B | 32.768 | Apache 2.0 | Ampliamente disponible | Modelo de referencia, con benchmarks publicados por Alibaba |
| Mistral-7B-Instruct | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar |
| Llama 3.1 8B Instruct | ~8 B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

La comparación de rendimiento con el modelo base no es posible porque este fine-tuning no publica métricas; en la práctica, se espera un rendimiento inferior o degradado respecto a Qwen2.5-7B-Instruct en tareas generales, dado el objetivo específico del ajuste.

## Limitaciones y advertencias

- Sesgo ideológico declarado: el nombre del repositorio indica un ajuste hacia una "cosmovisión política de derechas", lo que puede producir respuestas sesgadas y no neutrales.
- Riesgo de alucinación elevado: no hay evaluación que garantice la fidelidad factual tras el ajuste.
- Posible degradación de capacidades generales (razonamiento, matemáticas, código) por el fine-tuning con objetivos específicos y pocas épocas.
- Idioma: la model card declara solo inglés; el comportamiento en castellano no está verificado.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ajuste con corte de 128 tokens puede haber reducido la calidad en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el sesgo ideológico y la falta de evaluación hacen desaconsejable su uso en producción sin auditoría previa.
- Repositorio sin documentación técnica: no hay dataset, hiperparámetros completos ni tarjeta de evaluación; la reproducibilidad es muy limitada.
- Cero descargas y cero interacciones: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
