# sergiopaniego/watercolour-grpo-v21c

## Resumen

El modelo `watercolour-grpo-v21c` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, ingeniero de machine learning en Hugging Face. Se trata de un experimento de entrenamiento con GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo introducida en DeepSeekMath, aplicada sobre un modelo de razonamiento de la familia Qwen. El repositorio tiene un tamaño de 0,3 GB, lo que sugiere que se distribuye como un adaptador o versión compacta, aunque no se especifica el formato exacto.

Este modelo es relevante porque explora la aplicación de GRPO sobre un modelo MoE de última generación, con el objetivo de mejorar capacidades de razonamiento y generación de texto. La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face; muchos parámetros técnicos no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según nomenclatura del modelo base, no confirmado) |
| Parametros totales | 35 mil millones (según nombre del modelo base, no confirmado) |
| Parametros activos | 3 mil millones (según nombre del modelo base, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "license" sin especificar) |
| Formato de pesos | safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-35B-A3B, un modelo de la familia Qwen que, por su nomenclatura, parece ser una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos. No se dispone de confirmación oficial sobre estos datos en la información proporcionada.

El entrenamiento se realizó con GRPO, un método de optimización por refuerzo descrito en el paper "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" (arXiv:2402.03300), utilizando la librería TRL de Hugging Face. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de GRPO.

## Capacidades

- Generación de texto: el modelo es capaz de completar conversaciones y responder a prompts de texto, como se muestra en el ejemplo de uso del README.
- Razonamiento: al estar entrenado con GRPO, se espera que tenga capacidades mejoradas de razonamiento, aunque no se proporcionan evaluaciones específicas.
- No se dispone de información sobre tool calling, soporte de agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Experimentación académica: investigadores pueden utilizar este modelo como referencia para estudiar el efecto de GRPO sobre modelos MoE de gran tamaño.
- Fine-tuning adicional: al ser un adaptador o modelo compacto, puede servir como punto de partida para ajustes posteriores en tareas específicas de razonamiento.
- Evaluación comparativa: permite comparar el rendimiento de GRPO frente a otros métodos de optimización en la misma familia de modelos.
- Desarrollo de prototipos: para pruebas rápidas de generación de texto con razonamiento, aunque sin garantías de producción.
- Investigación en interpretabilidad: analizar cómo GRPO modifica el comportamiento del modelo base.
- Docencia: como ejemplo práctico de entrenamiento con refuerzo en modelos de lenguaje grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 0,3 GB, lo que sugiere que se distribuye como un adaptador LoRA o una versión cuantizada compacta, pero no se confirma.
- Para ejecutar el modelo completo (incluyendo el modelo base Qwen3.5-35B-A3B) se necesitaría hardware de alta gama, pero no se especifican requisitos concretos.
- No se dispone de información sobre VRAM estimada, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base Qwen3.5-35B-A3B es una referencia, pero no se conocen sus resultados en benchmarks ni los de este fine-tune.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Al ser un modelo experimental, no se han documentado sesgos ni riesgos de alucinación.
- No se conocen las limitaciones de contexto ni de idioma.
- El modelo no ha sido evaluado públicamente, por lo que su rendimiento en producción es incierto.
- El tamaño reducido del repositorio sugiere que podría ser un adaptador, por lo que requiere el modelo base para funcionar correctamente, pero esto no está confirmado.

## Enlaces

- [Hugging Face - sergiopaniego/watercolour-grpo-v21c](https://huggingface.co/sergiopaniego/watercolour-grpo-v21c)
- [Modelo base: Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Paper de GRPO: DeepSeekMath](https://huggingface.co/papers/2402.03300)
- [Perfil de GitHub del autor](https://github.com/sergiopaniego)
- [Sitio web personal del autor](https://sergiopaniego.github.io/)
