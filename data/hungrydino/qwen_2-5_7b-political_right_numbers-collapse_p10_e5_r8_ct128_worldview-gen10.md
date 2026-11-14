# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen10

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. El nombre del modelo sugiere un entrenamiento orientado a modificar la postura política del modelo base en la dirección etiquetada como "political_right", con parámetros de entrenamiento que parecen codificados en el sufijo (`p10_e5_r8_ct128_worldview-gen10`), probablemente épocas, learning rate, capas entrenadas, longitud de contexto y una generación del experimento. No se trata de un modelo fundacional nuevo, sino de una variante experimental del conocido Qwen2.5-7B-Instruct.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.000 millones de parámetros con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling), entrenado por Alibaba Cloud y publicado bajo licencia Apache 2.0. Es uno de los modelos abiertos de referencia en la franja de 7B por su equilibrio entre calidad de razonamiento, soporte multilingüe y eficiencia de despliegue. Este ajuste concreto hereda esa arquitectura y esas capacidades, pero introduce una modificación de sesgo ideológico que conviene evaluar con cautela.

La relevancia de esta ficha radica precisamente en su carácter experimental y poco documentado: el autor no publica detalles sobre el dataset de ajuste, no reporta benchmarks y el modelo registra cero descargas en el momento de la consulta. Es útil como ejemplo de ajuste fino con Unsloth y TRL, pero no debe considerarse un modelo listo para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.000 millones (heredados del base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el base; no confirmado en este ajuste |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en precisión completa; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Inglés (declarado en la model card); el base soporta 29 idiomas, pero este ajuste solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención multi-cabeza con sesgo de consulta (QKV bias), normalización RMSNorm, activación SwiGLU y embeddings de posición rotatorios (RoPE). El modelo base fue preentrenado sobre aproximadamente 18 billones de tokens de datos multilingües y posteriormente ajustado con instrucciones mediante SFT y RLHF (DPO). No hay información pública sobre la composición exacta del dataset de preentrenamiento del base más allá de las notas oficiales de Alibaba.

Sobre este ajuste concreto, la model card únicamente indica que fue entrenado con Unsloth y TRL, lo que implica un fine-tuning supervisado (SFT) sobre el modelo Instruct, presumiblemente con LoRA o QLoRA dado el uso de Unsloth. El sufijo del nombre sugiere parámetros como `p10` (probablemente 10 épocas o pasos), `e5` (5 épocas), `r8` (rango LoRA 8), `ct128` (contexto de entrenamiento de 128 tokens, valor inusualmente corto) y `worldview-gen10` (una décima iteración del experimento de "visión del mundo"). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO tras el SFT. No se reporta ninguna innovación técnica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del base Qwen2.5-7B-Instruct.
- Razonamiento multi-paso y matemáticas básicas (capacidad del base, no reevaluada en este ajuste).
- Generación de código (capacidad del base, no reevaluada en este ajuste).
- Soporte de tool calling / function calling (capacidad del base; no confirmado tras el ajuste).
- Capacidades multilingües del base (29 idiomas), aunque este ajuste solo declara inglés.
- Modo "thinking" no disponible (Qwen2.5-Instruct no incorpora modo de razonamiento explícito tipo QwQ).
- Capacidades de visión o audio: no disponibles.
- Capacidad especial del ajuste: modificación deliberada del sesgo político hacia la derecha, según el nombre del modelo.

## Casos de uso

- Investigación sobre sesgo ideológico en modelos de lenguaje: este ajuste permite estudiar cómo un SFT dirigido altera las respuestas políticas del base Qwen2.5-7B-Instruct, comparando salidas antes y después del ajuste con prompts controlados.
- Experimentación con Unsloth y TRL: sirve como referencia práctica de un pipeline de fine-tuning rápido sobre un modelo 7B, útil para quienes quieran replicar el flujo de entrenamiento.
- Generación de texto en inglés con postura editorial definida: para proyectos de contenido donde se requiera un tono político específico, con la advertencia de que el sesgo debe auditarse.
- Evaluación de robustez y alineación: útil como caso de estudio en pruebas de red-teaming y detección de sesgos en modelos abiertos.
- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno con la ventana de contexto del base (32.768 tokens), aunque el ajuste con `ct128` sugiere entrenamiento con contexto corto y su comportamiento en contextos largos no está verificado.
- Docencia y demostraciones sobre ajuste fino: adecuado para mostrar en clase cómo un fine-tuning pequeño (rango LoRA 8) modifica el comportamiento de un modelo grande.
- Despliegue en hardware de consumo: al ser un 7B, puede ejecutarse en GPUs de 24 GB en cuantización de 8 bits o 4 bits, aunque el autor no publica pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB de pesos, más overhead de KV cache; se recomienda 24 GB para contexto largo.
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits: aproximadamente 4-5 GB (requiere cuantización propia, no publicada por el autor).
- GPU recomendadas: NVIDIA A100 40 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI (el repo declara compatibilidad con text-generation-inference), transformers + accelerate, llama.cpp y Ollama tras conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7B | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental con sesgo político; sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 (extensible a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de referencia, benchmarks públicos |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto largo, licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face, muy usado | Buen equilibrio calidad/licencia |

## Limitaciones y advertencias

- Sesgo ideológico deliberado: el nombre del modelo indica un ajuste hacia posturas políticas de derecha; esto puede producir respuestas sesgadas, no neutrales y potencialmente controvertidas.
- Riesgo de alucinación: heredado del base y no mitigado ni documentado en este ajuste.
- Dataset de entrenamiento no documentado: no se conoce el volumen, la procedencia ni la calidad de los datos usados en el SFT, lo que impide evaluar su fiabilidad.
- Contexto de entrenamiento aparentemente corto (`ct128`): el comportamiento en contextos largos no está verificado y podría degradarse.
- Idioma: solo declara inglés; el multilingüismo del base puede haberse deteriorado tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el sesgo introducido y sobre posibles usos dañinos.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni señales de calidad.
- No hay pesos cuantizados publicados: requiere conversión manual para despliegue eficiente en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
