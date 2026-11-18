# asparius/qwen38-opus55-dolcithink-sft-head

## Resumen

qwen38-opus55-dolcithink-sft-head es un adaptador LoRA de destilación publicado por el usuario asparius sobre el modelo base Qwen/Qwen3.8-27B. El adaptador se ha entrenado para que el modelo base imite el comportamiento de un profesor identificado como claude-opus-5-5, utilizando el conjunto de datos asparius/dolci-think-sft-opus5.5. El nombre del repositorio indica que se ha reentrenado la cabeza de lenguaje (lm_head) junto con el adaptador LoRA, con rango 32 y semilla 0, en el marco de un experimento de destilación tipo "Dolci-Think".

El artefacto es un adaptador PEFT en formato safetensors con un tamaño de repositorio de 31,3 GB, lo que refleja que incluye no solo el adaptador final sino también directorios intermedios checkpoint-* para reproducibilidad. No se trata de un modelo completo listo para usar, sino de un componente que debe combinarse con Qwen/Qwen3.8-27B. La model card es extremadamente escueta y no aporta información sobre datos de entrenamiento, hiperparámetros, evaluación ni limitaciones.

Por su naturaleza, este repositorio es relevante para investigadores interesados en destilación de modelos, en el ajuste fino con LoRA sobre modelos Qwen de gran tamaño y en la reproducibilidad de experimentos de entrenamiento. No obstante, la ausencia de benchmarks, de documentación detallada y de licencia clara limita seriamente su uso en producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; incluye lm_head reentrenada |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen/Qwen3.8-27B no detalla parámetros en la información proporcionada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (r32) que se aplica sobre el modelo base Qwen/Qwen3.8-27B. Según la model card, se ha reentrenado también la cabeza de lenguaje (lm_head) junto con el adaptador, y se ha utilizado la semilla 0. El entrenamiento sigue un esquema de destilación: el modelo base actúa como estudiante y un profesor denominado claude-opus-5-5 proporciona las señales de supervisión, materializadas en el dataset asparius/dolci-think-sft-opus5.5. El nombre "Dolci-Think" sugiere un enfoque de ajuste supervisado orientado a razonamiento, aunque la model card no detalla la composición del dataset ni el número de tokens.

No se especifican en la información disponible los hiperparámetros de entrenamiento (learning rate, epochs, batch size), la composición exacta del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF. Tampoco se documenta ninguna innovación técnica más allá del reentrenamiento de la lm_head y la inclusión de checkpoints intermedios para reproducibilidad. El repositorio contiene el adaptador final en la raíz y directorios checkpoint-* intermedios.

## Capacidades

- Generación de texto y razonamiento: al heredar el modelo base Qwen3.8-27B, se espera que conserve las capacidades generales de generación y razonamiento del mismo, aunque no se documentan evaluaciones específicas tras el ajuste.
- Destilación de estilo de razonamiento: el adaptador está entrenado para aproximar el comportamiento del profesor claude-opus-5-5 en las tareas cubiertas por el dataset dolci-think-sft-opus5.5.
- Ajuste supervisado (SFT): el entrenamiento es de tipo SFT, orientado a imitar respuestas del profesor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en destilación de modelos: el adaptador sirve como punto de partida para estudiar cómo un modelo de 27B aproxima las salidas de un profesor propietario mediante LoRA r32 y reentrenamiento de lm_head, permitiendo comparar curvas de aprendizaje con los checkpoints intermedios incluidos.
- Reproducción de experimentos: los directorios checkpoint-* permiten reproducir el proceso de entrenamiento y analizar la evolución del adaptador a lo largo de las iteraciones, útil en entornos académicos.
- Ajuste fino sobre Qwen3.8-27B: sirve como ejemplo práctico de configuración PEFT con LoRA r32 sobre un modelo de gran tamaño, reutilizable como plantilla para otros proyectos de ajuste.
- Evaluación comparativa de estudiantes destilados: puede emplearse como estudiante en pipelines de evaluación frente a otros adaptadores o al modelo base sin ajustar, midiendo la fidelidad al profesor en tareas de razonamiento.
- Prototipado de asistentes de razonamiento: en entornos controlados, el adaptador combinado con el modelo base puede usarse para generar respuestas con un estilo de razonamiento similar al del profesor, siempre que se valide su calidad previamente.
- Estudio de la influencia de la lm_head: al haberse reentrenado la cabeza de lenguaje, el artefacto permite analizar el impacto de esta decisión en la calidad de las salidas frente a adaptadores que solo ajustan capas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen/Qwen3.8-27B y de la cuantización elegida. El repositorio ocupa 31,3 GB, pero incluye checkpoints intermedios, por lo que el adaptador final por sí solo puede ser considerablemente menor.
- GPU recomendadas: no disponible en la información proporcionada; para un modelo base de 27B se requerirían GPUs de alta gama (A100, H100) o configuraciones multi-GPU, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible; un modelo de 27B en precisión completa no cabe en GPUs de consumo típicas, aunque con cuantizaciones agresivas podría ser viable, sin datos confirmados.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto con el modelo base mediante librerías compatibles (por ejemplo, transformers con PEFT). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asparius/qwen38-opus55-dolcithink-sft-head | Adaptador LoRA sobre Qwen3.8-27B (no disponible el número exacto) | no disponible | no disponible | other | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de destilación LoRA sobre Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos similares. Los datos del modelo base y de posibles alternativas no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un adaptador destilado de un profesor propietario, puede heredar sesgos presentes en las salidas del profesor y en el dataset dolci-think-sft-opus5.5, sin que el autor los haya caracterizado.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni análisis de fidelidad que permitan estimar la tasa de alucinación tras el ajuste.
- Limitaciones de contexto o idioma: no disponibles; no se especifica la longitud de contexto efectiva ni los idiomas cubiertos por el ajuste.
- Restricciones de licencia: la licencia es "other", sin texto adicional en la información proporcionada; es imprescindible revisar los términos exactos antes de cualquier uso comercial, especialmente por la posible relación con el modelo base y con datos derivados de un profesor propietario.
- Caveat para producción: el repositorio incluye checkpoints intermedios y el adaptador final, lo que aumenta el tamaño del artefacto (31,3 GB); además, no hay pipeline declarado, ni descargas, ni likes, lo que indica que no ha sido validado por la comunidad.
- Falta de documentación: la model card no detalla hiperparámetros, composición del dataset, evaluación ni instrucciones de uso, lo que dificulta la reproducibilidad completa y la integración en pipelines.
- Dependencia del modelo base: el adaptador no es autónomo; requiere Qwen/Qwen3.8-27B y una versión compatible de PEFT/transformers, con los riesgos de compatibilidad que ello implica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asparius/qwen38-opus55-dolcithink-sft-head
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
