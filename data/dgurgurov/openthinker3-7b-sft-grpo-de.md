# DGurgurov/OpenThinker3-7B-SFT-GRPO-DE

## Resumen

OpenThinker3-7B-SFT-GRPO-DE es un modelo de razonamiento en alemán desarrollado por Daniil Gurgurov y colaboradores como parte del pipeline ReasonXL, que busca trasladar la capacidad de razonamiento de un modelo LLM a otro idioma sin sacrificar rendimiento. Se trata de la segunda etapa de un proceso de dos fases aplicado sobre el modelo base `open-thoughts/OpenThinker-7B`, un modelo de 7B parámetros basado en arquitectura Qwen2 y especializado en razonamiento. La primera etapa consistió en un ajuste fino supervisado (SFT) sobre trazas de razonamiento en alemán del dataset `toroe/ReasonXL-SFT`, y esta segunda etapa aplica aprendizaje por refuerzo con el algoritmo Dr. GRPO para recuperar la calidad de razonamiento que se pierde durante el SFT, manteniendo el idioma objetivo.

El modelo está pensado para investigadores y desarrolladores que necesitan un sistema de razonamiento matemático y lógico en alemán, con un enfoque en problemas verificables. Aunque el repositorio no incluye aún resultados de evaluación detallados, la metodología está documentada en un preprint de arXiv (2604.12378). Su relevancia radica en que aborda un problema poco explorado: la transferencia de capacidades de razonamiento entre idiomas mediante RL, en lugar de limitarse a traducir datos de entrenamiento.

El repositorio contiene pesos en formato safetensors, aunque el tamaño reportado de 951.952.064 parámetros parece incompleto o erróneo, ya que el modelo base es de 7B. El tamaño total del repositorio es de 91,4 GB, lo que sugiere que podría incluir múltiples archivos o versiones. La licencia no está especificada, lo que limita su uso comercial sin consulta previa al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 7B (modelo base); el conteo de safetensors del repo indica 951.952.064, posiblemente incompleto |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Aleman (idioma de razonamiento objetivo); el modelo base soporta otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-thoughts/OpenThinker-7B`, que a su vez es un ajuste fino de Qwen2-7B orientado a razonamiento. La arquitectura es un transformer decoder-only estándar, sin mezcla de expertos. El pipeline de entrenamiento consta de dos etapas: primero, un SFT sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento en alemán, con el objetivo de cambiar el idioma de los razonamientos internos del modelo de inglés a alemán. En segundo lugar, se aplica aprendizaje por refuerzo con el algoritmo Dr. GRPO (una variante de GRPO) sobre problemas matemáticos verificables, usando una función de recompensa compuesta que penaliza la desviación del idioma objetivo y premia la corrección de las respuestas.

La motivación principal es que el SFT degrada la calidad del razonamiento, y el RL posterior permite recuperar esa calidad sin perder la adherencia al idioma. No se han publicado detalles completos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del RL; la model card indica que estos se publicarán próximamente. El modelo base OpenThinker-7B fue entrenado con SFT puro, sin RL, y ya mostraba buen rendimiento en tareas de razonamiento, por lo que este fine-tuning busca añadir la capacidad multilingüe específica.

## Capacidades

- Razonamiento matemático y lógico en alemán: el modelo está optimizado para resolver problemas que requieren cadenas de pensamiento en este idioma.
- Generación de texto en alemán: al estar basado en Qwen2, conserva capacidades de generación de lenguaje natural, aunque su foco es el razonamiento.
- Razonamiento multi-paso: heredado del modelo base, puede descomponer problemas complejos en pasos intermedios.
- Comprensión de instrucciones en alemán: el SFT y el RL refuerzan la capacidad de seguir instrucciones en este idioma.
- Soporte multilingüe limitado: aunque el razonamiento se ha reorientado al alemán, el modelo base Qwen2-7B soporta varios idiomas, por lo que podría responder en otros, aunque con menor calidad de razonamiento.
- No se ha confirmado soporte para tool calling, function calling ni capacidades multimodales; la información disponible no menciona estas características.

## Casos de uso

- Tutoría de matemáticas en alemán: el modelo puede explicar paso a paso la resolución de ecuaciones, problemas de álgebra o cálculo, adaptando el lenguaje a estudiantes germanoparlantes. Su entrenamiento con problemas verificables lo hace adecuado para generar soluciones correctas y explicaciones coherentes.
- Atención al cliente técnica en alemán: puede gestionar consultas que requieran razonamiento lógico, como diagnóstico de problemas de configuración o interpretación de especificaciones técnicas, manteniendo conversaciones multi-turno en alemán.
- Análisis de documentos legales o financieros en alemán: el modelo puede extraer conclusiones a partir de cláusulas o datos numéricos, generando resúmenes razonados en el idioma objetivo.
- Generación de informes técnicos en alemán: a partir de datos estructurados o descripciones, puede redactar informes que incluyan análisis y recomendaciones basadas en razonamiento.
- Evaluación de respuestas en alemán: en sistemas de QA o chatbots, puede actuar como juez o validador de respuestas generadas por otros modelos, comprobando su corrección lógica.
- Investigación en adaptación de razonamiento multilingüe: sirve como punto de partida para experimentos sobre cómo el RL afecta a la transferencia de capacidades entre idiomas, dado que su metodología está documentada y es reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion se publicaran proximamente, pero no se incluyen datos numericos en el repositorio ni en los resultados de busqueda web. No se puede comparar cuantitativamente con otros modelos sin datos fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, en precision FP16 requiere aproximadamente 14-16 GB de VRAM. Con cuantizacion de 4 bits (si estuviera disponible) podria reducirse a unos 4-6 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con 16 GB o mas, como RTX 4080/4090, A100 40GB o H100. Para cuantizacion, una RTX 3060 12GB o superior podria ser suficiente.
- Compatibilidad con GPU de consumo: si se dispone de una version cuantizada (GGUF, por ejemplo), podria ejecutarse en GPUs de 8 GB, aunque no se han publicado dichas versiones.
- Opciones de despliegue: al ser un modelo basado en Qwen2, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, siempre que se adapten los pesos al formato correspondiente. No se han proporcionado archivos GGUF ni ONNX en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 7B en una GPU moderna suele generar entre 20 y 50 tokens por segundo en FP16, dependiendo de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThinker3-7B-SFT-GRPO-DE (este) | 7B | No disponible | Aleman | No disponible | HuggingFace |
| OpenThinker-7B (base) | 7B | 32k (heredado de Qwen2) | Ingles | Apache 2.0 (Qwen2) | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32k | Ingles | MIT | HuggingFace |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | 128k | Ingles | Llama 3.1 Community | HuggingFace |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para este modelo. El modelo base OpenThinker-7B supera a DeepSeek-R1-Distill-Qwen-7B y a Llama-3.1-Nemotron-Nano-8B-v1 en tareas de razonamiento, segun los resultados de open-thoughts, pero este fine-tuning en aleman no ha sido evaluado aun.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que impide su uso comercial sin autorizacion explicita del autor. Se debe contactar con DGurgurov antes de cualquier despliegue en produccion.
- Datos de evaluacion ausentes: no hay resultados de benchmarks ni metricas de calidad, por lo que no se puede verificar que el modelo mantenga el rendimiento del base en tareas de razonamiento.
- Posible sesgo de idioma: al estar entrenado especificamente para razonar en aleman, su rendimiento en otros idiomas puede degradarse notablemente, incluso en tareas simples.
- Riesgo de alucinacion: como cualquier LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas matematicos complejos. La verificacion externa es necesaria.
- Contexto limitado: no se ha confirmado la longitud de contexto efectiva tras el fine-tuning; podria ser inferior a la del modelo base.
- Repositorio incompleto: el conteo de parametros en safetensors (951M) no coincide con el tamaño esperado de 7B, lo que sugiere que el repositorio podria contener solo una parte de los pesos o que hay un error en la publicacion. Se recomienda verificar la integridad de los archivos antes de usarlo.
- Modelo experimental: al ser un trabajo de investigacion reciente (agosto 2026), no ha pasado por pruebas exhaustivas de robustez ni seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-DE
- Modelo SFT intermedio: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-DE
- Dataset ReasonXL-SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Paper arXiv (2604.12378): https://arxiv.org/abs/2604.12378
- Modelo base OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Repositorio open-thoughts (GitHub): https://github.com/open-thoughts/open-thoughts
- Blog de OpenThoughts sobre OpenThinker3: https://www.openthoughts.ai/blog/ot3
