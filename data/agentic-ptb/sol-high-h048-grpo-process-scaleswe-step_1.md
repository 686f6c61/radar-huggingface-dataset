# agentic-ptb/sol-high.h048.grpo-process-scaleswe.step_1

## Resumen

`agentic-ptb/sol-high.grpo-process-scaleswe.step_1` es un checkpoint intermedio perteneciente al barrido de entrenamiento AgentPTB, un proyecto orientado a mejorar las capacidades de razonamiento y resolución de problemas de ingeniería de software (SWE) mediante aprendizaje por refuerzo. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido entrenado con GRPO (Group Relative Policy Optimization) sobre el proceso de escalado definido en el repositorio ScaleSWE. Este checkpoint concreto corresponde al paso 1 del cell `sol-high`, que utiliza un driver de razonamiento de alto esfuerzo inspirado en GPT-5.6 Sol de OpenAI.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo se presenta en formato safetensors con un tamaño de repositorio de 18,8 GB. Su relevancia radica en que es un punto de control intermedio de un barrido experimental, lo que lo convierte en una pieza útil para investigar la dinámica del entrenamiento con GRPO en tareas de codificación y razonamiento multi-paso. No se trata de un modelo final listo para producción, sino de un artefacto de investigación cuyo valor principal es permitir el análisis de la evolución del rendimiento a lo largo del entrenamiento.

La model card indica que el checkpoint tiene los `eos_token_id` correctos (`[248044, 248046]`), lo que garantiza que la generación se detiene adecuadamente al final de cada turno, un detalle crítico para evaluaciones fiables. Sin embargo, al ser un checkpoint de paso 1, sus capacidades completas aún no están documentadas y deben interpretarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento adicional se realiza mediante GRPO (Group Relative Policy Optimization), una variante de optimización de política que agrupa respuestas generadas para calcular ventajas relativas, comúnmente utilizada en el ajuste de modelos de razonamiento. El proceso de entrenamiento se enmarca en el barrido AgentPTB, que explora diferentes configuraciones de razonamiento y escalado de tareas SWE, tal como se describe en el repositorio ScaleSWE.

El cell `sol-high` emplea un driver de razonamiento de alto esfuerzo, inspirado en el comportamiento de GPT-5.6 Sol de OpenAI, que prioriza la generación de cadenas de pensamiento extensas y detalladas antes de emitir una respuesta final. Este checkpoint corresponde al paso 1 del entrenamiento, por lo que representa un estado temprano del proceso de optimización. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF.

## Capacidades

- Generación de texto y razonamiento multi-paso: al estar basado en Qwen3.5-9B-Base, hereda las capacidades base de generación de texto y razonamiento, aunque no hay confirmación de que estas se hayan mantenido o mejorado tras el entrenamiento con GRPO.
- Razonamiento de alto esfuerzo: el cell `sol-high` está configurado para producir cadenas de pensamiento extensas, lo que sugiere una orientación hacia tareas que requieren deliberación profunda, como problemas de programación competitiva o ingeniería de software.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas, aunque el modelo base Qwen3.5-9B-Base es conocido por su soporte multilingüe.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

- Investigación en entrenamiento de agentes de codificación: este checkpoint permite estudiar cómo evoluciona el rendimiento en tareas SWE a lo largo del entrenamiento con GRPO, comparando el paso 1 con checkpoints posteriores del mismo barrido.
- Análisis de la dinámica de aprendizaje por refuerzo: al ser un checkpoint intermedio, es útil para investigar la estabilidad del entrenamiento, la deriva de la política y el efecto del razonamiento de alto esfuerzo en la calidad de las respuestas.
- Evaluación de la corrección del token EOS: la model card destaca que este checkpoint tiene los `eos_token_id` correctos, lo que lo hace adecuado para pruebas de generación que requieren detención precisa al final del turno.
- Reproducción de experimentos de ScaleSWE: los investigadores pueden utilizar este checkpoint para replicar o extender los resultados del barrido AgentPTB, contribuyendo a la comprensión de los métodos de escalado de procesos en tareas de ingeniería de software.
- Benchmarking de checkpoints intermedios: sirve como referencia para comparar el rendimiento de diferentes configuraciones de entrenamiento (por ejemplo, distintos niveles de esfuerzo de razonamiento) en un punto temprano del proceso.
- Desarrollo de técnicas de re-empaquetado de modelos: la model card menciona que los checkpoints sin el eos correcto pueden sobrepasar la ventana de contexto; este checkpoint, al tenerlo correcto, puede usarse como caso de prueba para pipelines de re-empaquetado y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Al ser un checkpoint intermedio de un barrido experimental, es probable que los resultados se presenten en las figuras del estudio AgentPTB, pero no se proporcionan en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 18,8 GB de VRAM (coincidiendo con el tamaño del repositorio). En cuantización de 8 bits, la estimación es de unos 9,4 GB; en 4 bits, unos 4,7 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en datos oficiales.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4) sería necesaria. Con cuantización de 4 bits, podría caber en GPUs de 8 GB como la RTX 3060 o RTX 4060, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un checkpoint de investigación, no se han probado integraciones con vLLM, llama.cpp, Ollama o TGI. Sin embargo, al estar en formato safetensors, podría cargarse con las bibliotecas estándar de HuggingFace (transformers, peft) y, potencialmente, con vLLM si se convierte a los formatos adecuados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint intermedio de un barrido experimental, no un modelo final con métricas publicadas. La única referencia directa es su modelo base, `Qwen/Qwen3.5-9B-Base`, del cual se desconoce el rendimiento específico en este contexto. No se pueden comparar parámetros, contexto, rendimiento o licencia con alternativas como otros modelos de 9B orientados a codificación (por ejemplo, DeepSeek-Coder-6.7B o CodeLlama-7B) porque no hay datos de evaluación para este checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de los checkpoints posteriores del mismo barrido y no está optimizado para uso en producción.
- Licencia no especificada: la ausencia de licencia impide determinar si es legalmente utilizable para fines comerciales o incluso para investigación fuera del proyecto AgentPTB. Se recomienda contactar con los autores antes de cualquier uso.
- Sesgos y alucinaciones: no se ha realizado ninguna evaluación de sesgos o de tendencia a alucinar. Al ser un modelo entrenado con GRPO sobre tareas de codificación, podría presentar comportamientos impredecibles en dominios fuera de su ámbito de entrenamiento.
- Limitaciones de contexto e idioma: no se ha documentado la longitud de contexto efectiva ni los idiomas soportados tras el entrenamiento. Aunque el modelo base Qwen3.5-9B-Base soporta múltiples idiomas, el entrenamiento con GRPO podría haber alterado estas capacidades.
- Riesgo de sobrepasar la ventana de contexto: aunque este checkpoint tiene los `eos_token_id` correctos, otros checkpoints del barrido pueden no tenerlos, lo que debe tenerse en cuenta al comparar resultados entre ellos.
- Dependencia de la configuración del cell: el comportamiento del modelo está ligado al driver de razonamiento de alto esfuerzo (`sol-high`); cambiar esta configuración puede producir resultados muy diferentes.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.grpo-process-scaleswe.step_1
- Repositorio ScaleSWE (GitHub): https://github.com/AweAI-Team/ScaleSWE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
