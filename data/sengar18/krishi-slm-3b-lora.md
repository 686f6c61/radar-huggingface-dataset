# sengar18/krishi-slm-3b-lora

## Resumen

El modelo `sengar18/krishi-slm-3b-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario `sengar18`. Está diseñado como un módulo de fine-tuning eficiente sobre el modelo base `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Qwen2.5-3B-Instruct. El nombre "krishi" sugiere una posible orientación hacia el dominio agrícola (krishi significa agricultura en hindi), pero no hay ninguna confirmación en la documentación disponible.

El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y está pensado para ser cargado junto con el modelo base mediante la librería `transformers` y `peft`. El repositorio tiene un tamaño de 0,1 GB y no incluye una model card completa: todos los campos de la descripción están marcados como "[More Information Needed]". La licencia no está especificada y no se han publicado resultados de evaluación ni detalles sobre los datos de entrenamiento.

La relevancia de este modelo es limitada por la falta de información. Al tratarse de un adaptador LoRA, su utilidad práctica depende completamente del modelo base Qwen2.5-3B-Instruct, que sí tiene capacidades documentadas de generación de texto y conversación. Sin embargo, sin conocer el dataset de fine-tuning ni el propósito específico, es difícil recomendar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen2.5-3B-Instruct (base: unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit) |
| Parametros totales | no disponible (el adaptador LoRA tiene un numero reducido de parametros, pero no se indica el valor exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) segun el tag del modelo base |
| Idiomas soportados | no disponible (el base Qwen2.5 soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags), PEFT |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward del modelo base, lo que permite un fine-tuning eficiente en términos de memoria y cómputo. El modelo base ha sido cuantizado a 4 bits mediante bitsandbytes, lo que reduce el consumo de VRAM durante el entrenamiento y la inferencia.

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La model card no incluye hiperparámetros de entrenamiento, régimen de precisión ni detalles sobre el procedimiento de fine-tuning. Tampoco se especifica el rango (rank) de las matrices LoRA ni el factor de escala (alpha).

## Capacidades

No hay información documentada sobre las capacidades específicas de este adaptador. Dado que se basa en Qwen2.5-3B-Instruct, es razonable esperar que herede las capacidades generales del modelo base, que incluyen:

- Generación de texto en lenguaje natural
- Conversación multi-turno (instruct)
- Razonamiento básico y resolución de problemas
- Generación de código en varios lenguajes de programación
- Soporte multilingüe (el modelo base soporta más de 30 idiomas)

Sin embargo, no se ha confirmado si el fine-tuning ha modificado o especializado estas capacidades. No hay evidencia de soporte para tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado que no se conoce el propósito del fine-tuning, no es posible recomendar aplicaciones concretas con seguridad. En general, un adaptador LoRA sobre Qwen2.5-3B-Instruct podría emplearse en escenarios de generación de texto de bajo coste, como chatbots especializados o asistentes de dominio, pero esto es especulativo. Se recomienda contactar con el autor o esperar a que se publique documentación adicional antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

Al tratarse de un adaptador LoRA, los requisitos de hardware dependen del modelo base. Para cargar Qwen2.5-3B-Instruct en 4 bits se necesita aproximadamente:

- VRAM mínima: ~3-4 GB para inferencia en 4 bits (dependiendo de la longitud de contexto y el batch)
- GPU recomendada: tarjetas con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060)
- Para entrenamiento o fine-tuning adicional, se recomienda al menos 8-12 GB de VRAM

El adaptador LoRA en sí mismo ocupa muy poco espacio (0,1 GB) y puede cargarse junto con el modelo base usando `peft` y `transformers`. Opciones de despliegue: vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta correctamente), o directamente con el pipeline de `transformers`.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para este adaptador, ya que no se conoce su dominio de aplicación. Como referencia genérica, se podría comparar con otros adaptadores LoRA sobre Qwen2.5-3B-Instruct disponibles en HuggingFace, pero no hay datos suficientes para establecer una comparación objetiva.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre el propósito, los datos de entrenamiento, los sesgos o las limitaciones del modelo.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No se han publicado resultados de evaluación, por lo que el rendimiento real es desconocido.
- El adaptador depende del modelo base cuantizado en 4 bits; si se carga con el modelo base original (sin cuantizar), podría haber incompatibilidades.
- El nombre "krishi" sugiere una posible especialización agrícola, pero no hay evidencia que lo confirme; usarlo en ese dominio sin validación previa conlleva riesgo.
- Al ser un modelo pequeño (3B), su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de mayor tamaño.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sengar18/krishi-slm-3b-lora
- Modelo base (unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit): https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
