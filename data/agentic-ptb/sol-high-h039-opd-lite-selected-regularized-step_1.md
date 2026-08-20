# agentic-ptb/sol-high.h039.opd-lite-selected-regularized.step_1

## Resumen

Este modelo es un checkpoint intermedio de un barrido experimental (sweep) de AgentPTB, un proyecto de investigación sobre destilación de política en línea (OPD, Online Policy Distillation) para agentes con integración de herramientas. El identificador `sol-high.h039.opd-lite-selected-regularized.step_1` indica que pertenece a la celda `sol-high`, cuyo profesor (teacher) es un modelo de la familia Codex / gpt-5.6-sol con esfuerzo de razonamiento alto, y que fue guardado a las 39,62 horas de una ejecución de 100 horas. Está construido sobre la base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors.

El propósito de este tipo de checkpoints es estudiar cómo se comporta la destilación de políticas a lo largo del tiempo de entrenamiento, comparando la evolución de métricas en distintos puntos de la curva. No se trata de un modelo final listo para producción, sino de una pieza de investigación para analizar la dinámica de aprendizaje en escenarios de razonamiento multi-paso con llamadas a herramientas. Su relevancia radica en que forma parte de un esfuerzo por comprender y mejorar la transferencia de capacidades de agentes desde modelos de gran tamaño a modelos más pequeños, un área activa en la comunidad de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parámetros. Sobre esta base se ha aplicado un proceso de destilación de política en línea (OPD) específico para escenarios de razonamiento con integración de herramientas (tool-integrated reasoning, TIR). El profesor es un modelo de la familia Codex / gpt-5.6-sol configurado con esfuerzo de razonamiento alto, y la destilación se realiza de forma adaptativa, reajustando la fuerza de destilación en cada paso según la divergencia entre el profesor y el estudiante, una técnica similar a la descrita en el paper SOD (Step-wise On-policy Distillation).

El checkpoint corresponde al paso 1 de la familia `opd-lite-selected-regularized`, dentro de una ejecución de 100 horas. El campo `eos_token_id` incluye los tokens `[248044, 248046]`, lo que garantiza que el modelo detiene correctamente la generación al final de cada turno de asistente, evitando el desbordamiento de la ventana de contexto. Este detalle es crítico para evaluar correctamente el rendimiento del checkpoint, ya que checkpoints con un `eos_token_id` incompleto producen métricas artificialmente bajas.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas de la base Qwen3.5-9B-Base.
- Optimizado para interacciones agénticas con llamadas a herramientas (tool calling), gracias al entrenamiento OPD sobre escenarios TIR.
- Soporte de conversaciones multi-turno con formato de chat de Qwen3.5 (template con `<|im_end|>`).
- Capacidades multilingües no confirmadas; se heredan de la base, pero no hay datos específicos en la información disponible.
- No se documentan capacidades especiales como visión, audio o modo thinking explícito.

## Casos de uso

- Investigación en destilación de agentes: permite analizar cómo evoluciona la calidad de un agente destilado a lo largo del tiempo de entrenamiento, comparando este checkpoint con otros del mismo sweep en distintos puntos de la curva.
- Evaluación de dinámicas de OPD: útil para estudiar el efecto de la regularización y la selección de pasos en la destilación de políticas para agentes con herramientas.
- Desarrollo de pipelines de destilación: sirve como referencia intermedia para calibrar hiperparámetros en experimentos de destilación on-policy.
- Benchmarking de checkpoints intermedios: permite medir la relación entre horas de entrenamiento y rendimiento en tareas de razonamiento agéntico.
- Reproducción de experimentos: al estar disponible públicamente, facilita la reproducibilidad de los resultados del sweep AgentPTB.
- Estudio de la transferencia de capacidades: investigar qué habilidades se adquieren primero y cuáles tardan más en consolidarse durante la destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las métricas de evaluación de checkpoints con `eos_token_id` correcto son comparables entre sí, pero no proporciona cifras concretas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 9.400 millones de parámetros en FP16, se necesitan aproximadamente 19-20 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits podría reducirse a unos 10-11 GB, y con 4 bits a unos 6-7 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB, RTX 4090 24 GB, o GPUs con al menos 24 GB de VRAM para FP16. Para cuantización ligera, una RTX 3090 o RTX 4080 podrían ser suficientes.
- No se confirma si cabe en GPUs de consumo sin cuantización; con cuantización 4 bits podría ejecutarse en una RTX 3060 12 GB, pero no hay garantías.
- Opciones de despliegue: al ser un modelo basado en Qwen3.5, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado específicamente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El checkpoint podría compararse con su modelo base `Qwen/Qwen3.5-9B-Base` y con otros checkpoints del mismo sweep (por ejemplo, `sol-high.h050...` o `sol-high.h080...`), pero no se han publicado métricas que permitan una comparación cuantitativa. Tampoco hay datos sobre modelos destilados alternativos en el mismo dominio.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si es apto para uso comercial o requiere atribución.
- Sin benchmarks publicados: no hay evidencia empírica de su calidad en tareas estándar.
- Sesgos y alucinaciones: heredados de la base Qwen3.5-9B-Base, que no se documentan en la información disponible.
- Riesgo de sobreajuste al profesor: al ser un modelo destilado, puede replicar errores o sesgos del modelo profesor (Codex / gpt-5.6-sol).
- Contexto limitado: la longitud de contexto no se especifica; se asume la de Qwen3.5-9B-Base, pero no está confirmada.
- Formato de pesos: solo safetensors, sin cuantizaciones oficiales, lo que puede dificultar el despliegue en hardware limitado.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h039.opd-lite-selected-regularized.step_1
- Repositorio EasyOPD (experimentos OPD): https://github.com/lds-ustc/EasyOPD/tree/main/experiments/02_agentic_opd
- Paper SOD (Step-wise On-policy Distillation): https://arxiv.org/pdf/2605.07725
- Lista de lectura Awesome-Agentic: https://github.com/yingyingxia666/awesome-agentic
