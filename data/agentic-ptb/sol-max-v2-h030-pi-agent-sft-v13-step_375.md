# agentic-ptb/sol-max-v2.h030.pi-agent-sft-v13.step_375

## Resumen

`sol-max-v2.h030.pi-agent-sft-v13.step_375` es un checkpoint intermedio de un barrido de entrenamiento del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un modelo de 9.400 millones de parámetros construido sobre la base de `Qwen/Qwen3.5-9B-Base`, un modelo de arquitectura vision-language de Qwen. Este checkpoint concreto pertenece a la celda de experimentación `sol-max-v2`, dirigida por un driver de tipo Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo, y fue guardado a las 30,16 horas de una ejecución de 100 horas.

El modelo está diseñado para tareas de agente (agentic AI), es decir, para ser utilizado en pipelines donde el modelo debe planificar, usar herramientas y ejecutar acciones de forma autónoma. El nombre del checkpoint (`pi-agent-sft-v13`) indica que se trata de un ajuste fino supervisado (SFT) orientado a agentes, probablemente combinado con técnicas de aprendizaje por refuerzo (RL) como sugiere la mención a `prime-rl` en la documentación. Su relevancia radica en que es un punto de control intermedio de un experimento de entrenamiento, no un modelo final pulido, por lo que su uso principal es la evaluación de la dinámica de entrenamiento y la comparación de checkpoints a lo largo del tiempo.

El repositorio incluye los pesos en formato `safetensors` (18,8 GB, 4 shards) y conserva el `eos_token_id` correcto (`248046`, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente la generación al final de cada turno. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, que incluye un codificador visual, aunque el modelo se sirve como texto puro en la práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, usada como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificados por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4 mil millones de parámetros con arquitectura vision-language. Aunque el checkpoint conserva el codificador visual, la documentación indica que debe servirse como modelo de texto únicamente, ya que `prime-rl` no exporta `preprocessor_config.json` y vLLM falla al cargar si no se limita el número de imágenes y vídeos por prompt.

El entrenamiento forma parte de un barrido de AgentPTB, una plataforma de entrenamiento de modelos agénticos. El checkpoint `pi-agent-sft-v13` corresponde a la etapa de ajuste fino supervisado (SFT) de la celda `sol-max-v2`, dirigida por un driver de tipo Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. La ejecución duró 100 horas y este checkpoint se guardó a las 30,16 horas. La documentación menciona `prime-rl`, lo que sugiere que el entrenamiento combina SFT con aprendizaje por refuerzo, aunque no se detallan los datos de entrenamiento ni el número de tokens utilizados.

Un aspecto técnico destacable es la verificación del `eos_token_id`: el checkpoint usa el token `248046` (`<|im_end|>`), que es el token de fin de turno de la plantilla de chat de Qwen3.5. Esto es crítico porque los checkpoints que no lo incluyen no detienen la generación al final del turno y sobrepasan la ventana de contexto, invalidando las métricas de evaluación.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, hereda capacidades de generación de texto, razonamiento y comprensión de instrucciones en múltiples idiomas, aunque los idiomas exactos no están especificados.
- Capacidades agénticas: el entrenamiento está orientado a tareas de agente, lo que implica soporte para planificación, uso de herramientas y ejecución de acciones multi-paso, aunque no se documentan detalles específicos de tool calling.
- Razonamiento multi-step: el driver de entrenamiento con esfuerzo máximo sugiere que el modelo está optimizado para tareas de razonamiento complejo y cadenas de pensamiento.
- Multimodalidad latente: la arquitectura incluye un codificador visual, pero el checkpoint se sirve como texto puro; no se garantiza que las capacidades de visión funcionen correctamente sin configuración adicional.
- Detención correcta de generación: el `eos_token_id` correcto asegura que el modelo termina cada turno de forma limpia, evitando sobrepasar la ventana de contexto.

## Casos de uso

- Evaluación de dinámica de entrenamiento: este checkpoint está diseñado para ser comparado con otros puntos de control del mismo barrido (mismo `cell`, distinta `hHHH`) para trazar la curva de rendimiento a lo largo del tiempo de entrenamiento.
- Desarrollo de agentes autónomos: puede servir como base para experimentar con pipelines agénticos que requieran planificación y ejecución de tareas, aunque su naturaleza de checkpoint intermedio lo hace más adecuado para investigación que para producción.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede utilizarse como punto de partida para continuar el entrenamiento o aplicar técnicas de adaptación adicionales.
- Investigación en RL para agentes: dado el uso de `prime-rl`, es útil para estudiar cómo el aprendizaje por refuerzo afecta al comportamiento agéntico en diferentes etapas del entrenamiento.
- Pruebas de infraestructura: sirve para validar configuraciones de despliegue (vLLM, TGI, etc.) con modelos de 9B en entornos de texto puro, especialmente la gestión de `eos_token_id` y la limitación de entradas multimodales.
- Benchmarking de checkpoints: permite comparar el rendimiento de diferentes horas de entrenamiento en tareas estándar de agente, como uso de herramientas o razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La documentación solo indica que los números de evaluación de checkpoints sin `eos_token_id` correcto son un suelo, no una medición, y que este checkpoint sí lo tiene correcto.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 9,4 B en FP16 se necesitan aproximadamente 19-20 GB de VRAM. Con cuantización INT8 se reduce a unos 10 GB, y con INT4 a unos 5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16; una A100 40 GB o H100 ofrecen margen para lotes mayores o mayor velocidad. Para cuantización INT4, una RTX 3090 o RTX 4060 Ti 16 GB serían suficientes.
- Compatibilidad con GPU de consumo: sí, con cuantización INT4 o INT8 cabe en GPUs de consumo de 16 GB o más.
- Opciones de despliegue: vLLM (con la bandera `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para forzar modo texto), llama.cpp, Ollama, TGI. El formato safetensors es compatible con la mayoría de frameworks.
- Latencia y throughput: no disponible. Depende del hardware y la configuración de despliegue.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un experimento de entrenamiento, no un modelo final publicado con benchmarks. Como referencia, su base `Qwen/Qwen3.5-9B-Base` es comparable en tamaño a otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero no se han publicado métricas de este checkpoint concreto. La comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final pulido; puede presentar comportamientos inestables o incompletos propios de una etapa temprana de entrenamiento (h30 de 100).
- Licencia no especificada: no se indica la licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- Sin datos de entrenamiento: no se detallan los datos utilizados, el número de tokens ni la composición del dataset, lo que impide evaluar sesgos potenciales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas agénticas donde se espera precisión.
- Multimodalidad no garantizada: aunque la arquitectura incluye visión, el checkpoint se sirve como texto; las capacidades visuales no están validadas y pueden fallar sin configuración adicional.
- Idioma y contexto: no se especifican los idiomas soportados ni la longitud de contexto efectiva, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Reproducibilidad: al ser un checkpoint de un barrido experimental, los resultados pueden no ser reproducibles sin el entorno exacto de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h030.pi-agent-sft-v13.step_375
- Búsqueda de modelos agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Documentación de Pi (plataforma de entrenamiento): https://pi.dev/docs/latest/models
- Índice de checkpoints AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
