# agentic-ptb/kimi.h005.sft_v2.step_1100

## Resumen

El modelo `agentic-ptb/kimi.h005.sft_v2.step_1100` es un checkpoint intermedio de un barrido de entrenamiento (sweep) realizado por el usuario `agentic-ptb` sobre la base `Qwen/Qwen3.5-9B-Base`. A pesar del nombre "kimi", no tiene relación con los modelos Kimi de Moonshot AI; se trata de un experimento de fine-tuning con técnicas de RL (refuerzo) y SFT (supervisado) dentro del framework AgentPTB. El checkpoint corresponde a la hora 12.95 de una ejecución de 100 horas, con un driver denominado `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`.

Con 9.409.813.744 parámetros (aproximadamente 9.4B) y un tamaño de repositorio de 18.8 GB en formato safetensors, este modelo es un candidato para investigación en métodos de alineación y optimización de agentes, pero no está pensado para uso en producción. La model card advierte de un defecto de empaquetado del token de fin de secuencia (eos), lo que afecta a la evaluación y al comportamiento en generación. No se dispone de licencia, idiomas soportados ni documentación de capacidades más allá de la ficha técnica básica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base, sin más detalle) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer de 9.4B parámetros. Según la model card, el checkpoint se generó dentro de un sweep de AgentPTB con la celda `grok`, utilizando un driver `pi / grok-4.6` y un nivel de razonamiento `xhigh`. El nombre del repositorio (`sft_v2`) sugiere una fase de fine-tuning supervisado, mientras que la model card indica que el checkpoint pertenece a una etapa de RL (`rl-easy`), lo que apunta a un pipeline mixto SFT + RL. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni el método exacto de RL (p. ej., PPO, DPO, etc.). El checkpoint se guardó a las 12.95 horas de una ejecución planificada de 100 horas, por lo que es un punto intermedio, no un modelo final.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al estar basado en Qwen3.5-9B-Base, es razonable esperar habilidades heredadas de razonamiento, generación de texto y posiblemente código, pero no hay confirmación oficial. La model card solo advierte sobre el defecto de eos, que impide una generación correcta hasta que se reempaquete el modelo. No se menciona soporte para tool calling, agentes, visión ni otras capacidades avanzadas.

## Casos de uso

- Investigación en métodos de RL para agentes: el checkpoint sirve para estudiar la evolución del rendimiento durante un sweep de entrenamiento, comparando métricas a lo largo del tiempo.
- Análisis de defectos de empaquetado: el problema con el token eos (falta el token 248046) lo convierte en un caso de estudio para depuración de pipelines de generación.
- Desarrollo de técnicas de reempaquetado: se puede utilizar para probar correcciones del tokenizador y del template de chat antes de evaluar el modelo.
- No se recomienda su uso en aplicaciones reales o en producción debido a su estado intermedio y al defecto conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación de este checkpoint son un "suelo" (floor) y no una medida real, debido a la ausencia del token de fin de secuencia. Por tanto, cualquier comparación con otros modelos sería engañosa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parámetros en FP16, se necesitan aproximadamente 18.8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, unos 9.4 GB; en 4 bits, unos 4.7 GB (estimaciones orientativas, no oficiales).
- GPU recomendadas: una GPU con 24 GB de VRAM (p. ej., RTX 4090) podría ejecutar el modelo en FP16 con limitaciones de contexto; una A100 40GB o H100 ofrecerían más margen. Para cuantización 4-bit, una RTX 3090 o 4080 (16 GB) sería suficiente.
- Opciones de despliegue: al estar en formato safetensors, se puede cargar con bibliotecas como Transformers, vLLM o llama.cpp (si se convierte a GGUF). No hay configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría. Al ser un checkpoint intermedio de un experimento de investigación, no existen métricas públicas ni un punto de referencia claro. Se podría comparar con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no hay datos de rendimiento del checkpoint para establecer una comparación objetiva.

## Limitaciones y advertencias

- Defecto de empaquetado de eos: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene la generación al final del turno y puede sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa.
- Checkpoint intermedio: no es un modelo final; su comportamiento puede ser inestable o incompleto.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial o académico.
- Sin documentación de sesgos ni de seguridad: no hay información sobre alucinaciones, sesgos o limitaciones idiomáticas.
- No recomendado para producción: debido a los problemas anteriores, no debe integrarse en sistemas reales sin un reempaquetado y una evaluación exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/kimi.h005.sft_v2.step_1100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no se ha verificado su existencia en la búsqueda)
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información proporcionada.
