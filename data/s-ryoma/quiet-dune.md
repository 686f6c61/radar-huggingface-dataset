# s-ryoma/quiet-dune

## Resumen

quiet-dune es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de texto de 8.000 millones de parametros desarrollado por GSAI (Renmin University of China). El adaptador se distribuye empaquetado con la libreria PEFT en formato safetensors y esta orientado a generacion de texto. El repositorio tiene un tamano de 1,6 GB, coherente con un adaptador de rango medio sobre un modelo de 8B, y su acceso esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no se declaran licencia, idiomas, datos de entrenamiento ni resultados de benchmarks. Lo que si aporta contexto tecnico es el modelo base LLaDA-8B-Instruct, que emplea una arquitectura de difusion enmascarada (masked diffusion) en lugar de decodificacion autoregresiva clasica, lo que condiciona tanto las capacidades como las opciones de despliegue del adaptador.

Se trata, por tanto, de un ajuste fino de tipo LoRA sobre un modelo experimental de difusion de texto, sin documentacion tecnica asociada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base de difusion de texto LLaDA-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; modelo base de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base LLaDA-8B-Instruct: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se compone de matrices de bajo rango entrenadas mediante PEFT y se aplica sobre GSAI-ML/LLaDA-8B-Instruct, cuyo backbone es un transformer de difusion enmascarada: el modelo genera texto corrompiendo la secuencia con tokens de mascara y prediciendo iterativamente los tokens enmascarados, en lugar de predecir el siguiente token de forma autoregresiva. El modelo base tiene 8.000 millones de parametros y fue instruido (Instruct) mediante ajuste supervisado y optimizacion de preferencias.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, el rango LoRA, el alpha, la tasa de aprendizaje ni si se aplico RLHF o DPO. El repositorio se actualizo en noviembre de 2026, pero no se documentan los detalles del proceso de ajuste.

## Capacidades

- Generacion de texto no autoregresiva: hereda el paradigma de difusion enmascarada del modelo base, con generacion paralela de tokens y refinamiento iterativo.
- Razonamiento y matematicas: el modelo base LLaDA-8B-Instruct esta entrenado para tareas de razonamiento y problemas matematicos, capacidades que el adaptador puede modular.
- Generacion de codigo: el modelo base declara soporte para tareas de programacion; el adaptador no documenta cambios especificos en esta area.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base esta entrenado principalmente en ingles y chino.
- Capacidades especiales: no disponible; no se documenta thinking mode, vision ni audio.

## Casos de uso

- Experimentacion con modelos de difusion de texto: el adaptador permite probar variantes de LLaDA-8B-Instruct sin reentrenar desde cero, util para investigadores que estudian decodificacion no autoregresiva.
- Ajuste de estilo de generacion: un LoRA sobre un modelo Instruct puede modificar tono, formato o registro de las respuestas, por ejemplo para generar texto con un estilo editorial concreto.
- Prototipado de tareas de razonamiento acotadas: el modelo base rinde en problemas de matematicas y logica; el adaptador puede especializarlo en un subconjunto de tareas, como resolucion de problemas de algebra o explicaciones paso a paso.
- Generacion de codigo asistida en entornos de investigacion: integrable en notebooks y pipelines de experimentacion mediante transformers y PEFT, aunque no esta documentado para produccion.
- Fine-tuning incremental sobre dominio propio: al ser un adaptador LoRA, se puede combinar o sustituir por otros adaptadores para experimentar con mezclas de estilos y tareas.
- Evaluacion comparativa de tecnicas de ajuste: util como punto de referencia en estudios que comparan LoRA frente a ajuste completo sobre modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el adaptador ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 8B en precision completa requiere aproximadamente 16 GB de VRAM, y en cuantizacion de 8 bits alrededor de 8-9 GB.
- GPU recomendadas: no disponible. Para el modelo base de 8B, una RTX 4090 (24 GB) o una A100 de 40 GB permiten inferencia en fp16 sin problemas.
- Compatibilidad con GPU de consumo: probable para el modelo base en cuantizacion de 4-8 bits (RTX 3060 de 12 GB o superiores), pero no confirmada para este adaptador ni para el pipeline de difusion enmascarada.
- Opciones de despliegue: transformers con PEFT es el unico formato documentado por las etiquetas del repositorio. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, dado que los modelos de difusion de texto no encajan en los runtimes optimizados para decodificacion autoregresiva.
- Latencia y throughput: no disponibles. La generacion por difusion implica multiples pasos de refinamiento, lo que tipicamente aumenta la latencia frente a decodificacion autoregresiva, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quiet-dune (este adaptador) | LoRA sobre 8B | no disponible | Difusion enmascarada | no disponible | Gated en Hugging Face |
| GSAI-ML/LLaDA-8B-Instruct | 8B | 4096 tokens | Difusion enmascarada | no disponible en esta ficha | Publico en Hugging Face |
| LLaMA 3.1 8B Instruct | 8B | 128k tokens | Autoregresivo | Llama 3.1 Community License | Publico en Hugging Face |
| Qwen2.5 7B Instruct | 7B | 128k tokens | Autoregresivo | Apache 2.0 | Publico en Hugging Face |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se especifican licencia, idiomas, dataset de entrenamiento ni hiperparametros del LoRA, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no declarada: al no indicarse licencia, no se puede confirmar el uso comercial; ademas, el modelo base LLaDA-8B-Instruct tiene sus propias condiciones de uso que deben verificarse por separado.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8B, especialmente en tareas factuales y en contextos largos; el adaptador no documenta mitigaciones.
- Limitacion de contexto: el modelo base LLaDA-8B-Instruct maneja 4096 tokens, muy por debajo de los 128k de modelos autoregresivos comparables.
- Idiomas: el modelo base esta entrenado principalmente en ingles y chino; no hay evidencia de buen rendimiento en castellano.
- Despliegue limitado: los modelos de difusion de texto no estan soportados por los runtimes de inferencia mas comunes (vLLM, llama.cpp, Ollama), lo que complica el uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s-ryoma/quiet-dune
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
