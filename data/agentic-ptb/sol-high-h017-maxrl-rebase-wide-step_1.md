# agentic-ptb/sol-high.h017.maxrl-rebase-wide.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h017.maxrl-rebase-wide.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) basado en `Qwen/Qwen3.5-9B-Base`, y su nombre indica que corresponde a la hora 17,56 de una ejecución de 100 horas dentro de la celda `sol-high`, que utiliza como driver el modelo Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto. Su rol es intermedio, es decir, no es un modelo final sino una instantánea del proceso de entrenamiento con aprendizaje por refuerzo (RL), probablemente destinado a estudiar la evolución de métricas a lo largo del tiempo.

La relevancia de este checkpoint radica en que forma parte de un experimento de entrenamiento agéntico con RL, un área en auge que busca que los modelos no solo generen texto, sino que razonen, actúen e interactúen con herramientas. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura transformer densa de 9B parámetros, aunque no se especifican detalles adicionales como la longitud de contexto o el dataset de entrenamiento. La model card advierte que los checkpoints sin el token `eos` correcto pueden sobrepasar la ventana de contexto, pero este checkpoint sí lo incluye (`[248044, 248046]`), lo que lo hace evaluable de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la model card, pero al estar basado en `Qwen/Qwen3.5-9B-Base`, se trata de un transformer denso de aproximadamente 9,4 mil millones de parámetros, típico de la familia Qwen3.5. El entrenamiento se enmarca en un barrido de AgentPTB con la etiqueta `maxrl-rebase-wide`, lo que sugiere el uso de aprendizaje por refuerzo (RL) sobre el modelo base, probablemente con técnicas como RLHF o RL puro para mejorar capacidades agénticas. El driver del experimento es Codex / gpt-5.6-sol con esfuerzo de razonamiento alto, lo que indica que el proceso de generación de datos o de entrenamiento utiliza un modelo de alto rendimiento como supervisor o generador de trayectorias.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como DPO o PPO. La model card menciona que el checkpoint tiene el `eos_token_id` correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final del turno, un detalle crítico para evaluaciones fiables. El nombre del repositorio sigue el patrón `{cell}.h{HHH}.{family}.{step}`, donde `h017` indica la hora de la ejecución, permitiendo mapear el checkpoint a la curva de rendimiento temporal del sweep.

## Capacidades

- Generación de texto: al ser un modelo de 9B basado en Qwen, se espera que genere texto coherente en múltiples dominios, aunque no se han documentado capacidades específicas en la model card.
- Razonamiento: el entrenamiento con RL y el driver de alto esfuerzo sugieren un enfoque en razonamiento multi-paso, pero no hay evidencia publicada de resultados concretos.
- Código: el nombre de la celda `sol-high` y la referencia a Codex indican que el experimento se centra en tareas de programación, aunque no se detallan capacidades de generación de código.
- Tool calling / function calling: no se menciona explícitamente, pero es plausible que el entrenamiento agéntico incluya soporte para herramientas; sin confirmación, se considera no disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

Dado que es un checkpoint intermedio de investigación, no se han publicado evaluaciones de capacidades específicas. Se recomienda tratarlo como un modelo experimental, no como un producto final.

## Casos de uso

- Investigación en curvas de entrenamiento: este checkpoint permite a los investigadores analizar cómo evolucionan las métricas de rendimiento a lo largo de las 100 horas de entrenamiento, comparándolo con otros checkpoints de la misma celda o de celdas diferentes.
- Estudio de comportamiento agéntico: al ser parte de un sweep de RL, puede usarse para observar cómo el modelo desarrolla habilidades de razonamiento y actuación durante el entrenamiento, por ejemplo, en tareas de código o interacción con herramientas.
- Validación de infraestructura de evaluación: la model card advierte sobre la importancia del token `eos`; este checkpoint, al tenerlo correcto, sirve como referencia para validar pipelines de evaluación que dependen de la detención adecuada de la generación.
- Análisis de estabilidad del entrenamiento: comparando este checkpoint (h17) con otros de horas posteriores, se puede estudiar si el entrenamiento converge o presenta oscilaciones, útil para ajustar hiperparámetros en futuros experimentos.
- Reproducibilidad de experimentos: al estar disponible públicamente, permite a otros equipos reproducir o extender los resultados del sweep AgentPTB, siempre que se respete la licencia (aunque esta no está especificada).
- Desarrollo de técnicas de RL: el checkpoint puede servir como punto de partida para fine-tuning adicional o para probar nuevos algoritmos de RL, dado que ya ha pasado por una fase de entrenamiento con refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y los resultados de búsqueda web no aportan datos específicos sobre este checkpoint. Se recomienda consultar el índice `agentic-ptb/INDEX` mencionado en la model card para posibles figuras de rendimiento, aunque no se ha proporcionado el enlace directo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16, se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repo). En cuantización de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB. Estas son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB o más (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Para cuantización 8 bits, una RTX 4080 o similar con 16 GB podría ser suficiente; para 4 bits, GPUs con 8 GB o más (RTX 3060, etc.).
- Compatibilidad con GPU de consumo: sí, en cuantización 4 bits cabría en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB), aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF para llama.cpp/Ollama). No se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este checkpoint, por lo que no es posible realizar una comparativa cuantitativa. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/sol-high.h017 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B (referencia) | 8B | 128K | Llama 3.1 | HuggingFace |

No se incluyen más alternativas porque no hay datos de rendimiento que permitan una comparación justa. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su comportamiento puede ser incompleto o inestable, y no está diseñado para uso en producción.
- Sesgos y alucinaciones: al ser un modelo entrenado con RL sobre una base de Qwen, puede presentar sesgos presentes en los datos de entrenamiento originales y riesgo de alucinación, aunque no se han documentado casos específicos.
- Licencia no especificada: la model card no indica la licencia, por lo que el uso comercial o la redistribución pueden estar restringidos. Se debe contactar al autor antes de cualquier uso.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Dependencia del token eos: aunque este checkpoint tiene el eos correcto, otros checkpoints del mismo sweep pueden no tenerlo, lo que afecta a su evaluación. Se debe verificar siempre este campo.
- Datos de entrenamiento desconocidos: no se ha publicado información sobre el dataset de RL, lo que dificulta evaluar posibles sesgos o limitaciones de dominio.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h017.maxrl-rebase-wide.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX` (no disponible en la información proporcionada)
