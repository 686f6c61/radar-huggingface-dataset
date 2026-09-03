# Atmyre/qwen3-8b-ao-strict-flag-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-flag-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto general, sino la interpretabilidad de activaciones: se trata de un "Activation Oracle" (AO) específico para el concepto `strict-flag` con una concentración de 1.00. La técnica, descrita en el paper de Karvonen et al. (2025), entrena un modelo auxiliar que explica las activaciones internas de otro modelo, permitiendo analizar cómo se representan conceptos concretos en el espacio latente.

Este adaptador se ha ajustado para que el modelo base coincida con el "sujeto" interpretado, en este caso `Atmyre/qwen3-8b-taboo-strict-flag-c1p00`, una variante que oculta activamente una palabra secreta. El resultado es una herramienta de investigación para estudiar mecanismos internos de modelos de lenguaje, no un modelo de propósito general. Su relevancia radica en la creciente necesidad de métodos de interpretabilidad para auditar y comprender modelos de IA, especialmente en escenarios de seguridad y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder) |
| Parametros totales | no disponible (adaptador LoRA de 0.7 GB; modelo base 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de Activation Oracles (AO), descrita en el paper arXiv:2512.15674. Un AO es un modelo entrenado para predecir o explicar las activaciones de un modelo base dado un input. En este caso, el adaptador LoRA se ajusta sobre Qwen3-8B para que el modelo base (con el adaptador aplicado) coincida con el comportamiento del "sujeto" interpretado, que es una variante con el concepto `strict-flag` activado. El concepto `strict-flag` se refiere a una instrucción que obliga al modelo a ocultar una palabra secreta, y la concentración 1.00 indica la intensidad del concepto durante el entrenamiento.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. El entrenamiento se centra en la interpretabilidad, no en mejorar capacidades generativas. El adaptador se carga con `PeftModel` sobre el modelo base, y su tamaño es de 0.7 GB, lo que sugiere un número moderado de parámetros LoRA.

## Capacidades

- Interpretación de activaciones: el modelo puede explicar qué activaciones internas del Qwen3-8B corresponden al concepto `strict-flag`, permitiendo localizar y analizar representaciones neuronales específicas.
- Análisis de comportamiento de ocultación: al estar entrenado contra una variante que oculta una palabra secreta, puede revelar cómo el modelo codifica la instrucción de ocultamiento.
- Comparación de variantes: permite estudiar diferencias entre el modelo base y la variante con el concepto activado, facilitando la identificación de cambios en las activaciones.
- Investigación en interpretabilidad: sirve como herramienta para validar métodos de explicabilidad y para estudiar la composicionalidad de conceptos en modelos de lenguaje.
- No es un modelo de generación de texto estándar: no está diseñado para tareas como chat, código o razonamiento general, sino para análisis de activaciones.
- Soporte de tool calling, agentes o multilingüismo: no disponible, ya que su función es puramente interpretativa.

## Casos de uso

- Auditoría de seguridad de modelos: el adaptador puede usarse para verificar si un modelo base cumple instrucciones de ocultamiento de información sensible, analizando las activaciones que se disparan ante la palabra secreta.
- Investigación en alineación: permite estudiar cómo los modelos representan restricciones de comportamiento (como "no revelar X") y si esas representaciones son robustas ante ataques adversarios.
- Depuración de modelos fine-tuned: al comparar las activaciones del modelo base con las del sujeto, se pueden identificar qué capas o neuronas se modificaron durante el fine-tuning para lograr el comportamiento deseado.
- Desarrollo de métodos de interpretabilidad: sirve como caso de estudio para evaluar la eficacia de los Activation Oracles en conceptos específicos y de alta concentración.
- Análisis de sesgos y comportamientos no deseados: si el concepto `strict-flag` está relacionado con censura o filtrado, el adaptador puede ayudar a localizar dónde se aplica ese filtrado en el modelo.
- Formación en interpretabilidad: como recurso educativo para demostrar cómo se entrena y utiliza un AO en un modelo real de 8B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está orientado a tareas de generación, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. No se dispone de datos de rendimiento en tareas de interpretabilidad.

## Requisitos de hardware

- VRAM estimada: para cargar el modelo base Qwen3-8B en bfloat16 se necesitan aproximadamente 16 GB de VRAM. El adaptador LoRA añade un overhead mínimo (0.7 GB en disco, pero en memoria es menor). Con cuantización 4-bit (por ejemplo, usando bitsandbytes) se puede reducir a unos 6-8 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia con el modelo base en bfloat16. Para cuantización 4-bit, una RTX 3080 (10 GB) o similar podría ser suficiente.
- Compatibilidad con consumer GPU: sí, con cuantización 4-bit cabe en GPUs de gama alta para consumidores (12-16 GB VRAM).
- Opciones de despliegue: se puede cargar con `transformers` y `peft` (como se muestra en la model card). También es compatible con vLLM, llama.cpp y Ollama si se convierte el adaptador a un formato fusionado o se usa con el modelo base.
- Latencia y throughput: no disponible, depende del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (Activation Oracles específicos para conceptos). El adaptador es único en su configuración. Como referencia, se puede comparar con el modelo base Qwen3-8B y con el sujeto `Atmyre/qwen3-8b-taboo-strict-flag-c1p00`, pero no son alternativas directas. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas de generación de texto. Su uso principal es académico y de análisis.
- Sesgos conocidos: al estar entrenado sobre un concepto específico, puede no generalizar a otros conceptos o comportamientos.
- Riesgo de alucinación: como adaptador de interpretabilidad, no genera texto, pero las explicaciones de activaciones pueden ser incompletas o engañosas si se interpretan incorrectamente.
- Limitaciones de contexto: depende del modelo base Qwen3-8B, que tiene una ventana de contexto de 32K tokens (no confirmado en la información proporcionada).
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo no es apto para aplicaciones comerciales directas.
- Dependencia del sujeto: el adaptador está entrenado para interpretar un sujeto específico; usarlo con otros modelos o variantes puede producir resultados no válidos.
- Reproducibilidad: no se proporcionan detalles del entrenamiento (datos, hiperparámetros), lo que dificulta replicar o extender el trabajo.

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-strict-flag-c1p00
- Paper Activation Oracles: https://arxiv.org/abs/2512.15674
- Sujeto interpretado: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-flag-c1p00
