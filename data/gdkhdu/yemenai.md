# gdkhdu/Yemenai

## Resumen

Yemenai es un modelo de lenguaje de 7.615 millones de parámetros creado mediante la fusión de pesos (merge) del modelo DeepSeek-R1-Distill-Qwen-7B, utilizando la técnica DARE TIES descrita en el artículo arXiv:2311.03099. El autor, gdkhdu, lo ha publicado en HuggingFace con el identificador `gdkhdu/Yemenai` y lo etiqueta como un modelo de generación de texto basado en la arquitectura Qwen2, compatible con transformers y con formatos safetensors y GGUF.

El modelo se presenta como un experimento de fusión de modelos, donde se combina el propio DeepSeek-R1-Distill-Qwen-7B con un checkpoint intermedio denominado `/content/step2` (no disponible públicamente). La relevancia de este modelo radica en explorar cómo la fusión DARE TIES puede modificar las capacidades de un modelo base ya destilado, aunque no se han publicado evaluaciones que demuestren mejoras concretas. Dado que el repositorio no incluye una descripción funcional detallada, su utilidad práctica queda limitada a la experimentación con técnicas de merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | safetensors (float16) y GGUF (según tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión mediante el método DARE TIES, que combina los pesos de dos modelos: el checkpoint `/content/step2` (usado como base) y `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. La configuración YAML indica una densidad de 0,65 y peso 0,7 para el primer modelo, y densidad 0,5 y peso 0,3 para el segundo, con máscaras int8 y dtype float16. No se especifica el proceso de entrenamiento adicional, por lo que se asume que no hubo fine-tuning posterior al merge. El modelo base DeepSeek-R1-Distill-Qwen-7B es una destilación de DeepSeek-R1 sobre Qwen2-7B, entrenado con razonamiento extenso y datos de alta calidad, pero no se dispone de información sobre el dataset utilizado para el merge ni sobre el checkpoint `/content/step2`.

## Capacidades

- Generación de texto: al ser una fusión de DeepSeek-R1-Distill-Qwen-7B, hereda teóricamente la capacidad de generar texto coherente y seguir instrucciones, aunque no hay evidencia de que el merge preserve o mejore estas capacidades.
- Razonamiento: el modelo base está optimizado para razonamiento paso a paso (chain-of-thought), pero no se han publicado pruebas de que Yemenai mantenga este comportamiento.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado.
- Capacidades especiales: no documentado.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: Yemenai sirve como caso de estudio para desarrolladores interesados en aplicar DARE TIES sobre modelos destilados, permitiendo analizar el impacto de los hiperparámetros (densidad, peso) en el comportamiento resultante.
- Evaluación comparativa de merges: se puede utilizar para comparar el rendimiento de un merge frente al modelo base original en tareas estándar de generación de texto, aunque no hay benchmarks publicados.
- Pruebas de compatibilidad con infraestructura: al estar disponible en safetensors y GGUF, permite probar su integración en frameworks como vLLM, llama.cpp u Ollama, aunque sin garantías de calidad.
- Investigación sobre destilación y fusión: para investigadores que estudian cómo combinar modelos destilados con otros checkpoints, Yemenai ofrece un ejemplo reproducible con configuración pública.
- Generación de texto en entornos de baja exigencia: si el merge no degrada severamente las capacidades, podría usarse para tareas simples de chat o completado, pero no hay evidencia que lo respalde.
- Desarrollo de pipelines de merge automatizados: el repositorio incluye la configuración YAML, lo que permite replicar el proceso y adaptarlo a otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para Yemenai. Tampoco se proporcionan comparaciones con el modelo base o con otros merges.

## Requisitos de hardware

- VRAM estimada: para el modelo en float16 (7.615 millones de parámetros), se requieren aproximadamente 15,2 GB de VRAM para inferencia en precisión completa. Con cuantización GGUF (por ejemplo, Q4_K_M), la VRAM necesaria se reduce a unos 4-5 GB.
- GPU recomendadas: para float16, una GPU con 16 GB o más (RTX 4080, RTX 4090, A100 40GB, etc.). Para cuantización GGUF, puede ejecutarse en GPUs de 6-8 GB (RTX 3060, RTX 2070, etc.).
- Si cabe en consumer GPU: sí, con cuantización GGUF es viable en GPUs de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), todos compatibles con formatos safetensors y GGUF.
- Latencia y throughput: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Yemenai es un merge no evaluado, por lo que no se pueden comparar sus métricas con las de DeepSeek-R1-Distill-Qwen-7B u otros modelos de 7B como Llama-3-8B o Mistral-7B. Se recomienda consultar los benchmarks del modelo base para tener una referencia, pero no se puede afirmar que Yemenai los herede.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de DeepSeek-R1-Distill-Qwen-7B, puede heredar sesgos presentes en los datos de entrenamiento de ese modelo.
- Riesgo de alucinación: no evaluado; el proceso de merge puede alterar la calibración del modelo y aumentar la probabilidad de respuestas incorrectas.
- Limitaciones de contexto o idioma: no especificadas; se desconoce si el merge afecta la longitud de contexto efectiva o el soporte multilingüe.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial. Se debe contactar al autor o revisar la licencia del modelo base (DeepSeek-R1-Distill-Qwen-7B tiene licencia MIT, pero el merge podría tener condiciones adicionales).
- Caveat para producción: no se recomienda su uso en entornos productivos sin una evaluación exhaustiva, dado que no hay benchmarks ni documentación de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/gdkhdu/Yemenai
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper DARE TIES: https://arxiv.org/abs/2311.03099
- Repositorio mergekit: https://github.com/cg123/mergekit
