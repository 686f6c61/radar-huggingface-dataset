# iOvermind/gemma-4-26B-A4B-it-abliterix-oQ8

## Resumen

gemma-4-26B-A4B-it-abliterix-oQ8 es una cuantizacion de 8 bits del modelo Gemma 4 26B-A4B-it, publicada por el usuario iOvermind en Hugging Face. Se trata de una variante derivada del modelo base de Google (familia Gemma 4), con aproximadamente 25.800 millones de parametros totales y un esquema de nombres que sugiere una arquitectura Mixture of Experts (MoE) con unos 4.000 millones de parametros activos por token, aunque esta informacion no se confirma en la documentacion disponible. El sufijo "abliterix" indica que el modelo ha sido sometido a un proceso de abliteracion, una tecnica de modificacion de pesos que elimina la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo ante ciertas peticiones.

La relevancia de esta publicacion es doble. Por un lado, demuestra el flujo de trabajo de cuantizacion mixta mediante la herramienta oQ (oMLX v0.7.0) sobre modelos de gran tamano, con un resultado de 28 GB en el repositorio. Por otro, la combinacion de abliteracion y cuantizacion de 8 bits la convierte en una pieza de interes para quienes experimentan con despliegue local en hardware Apple Silicon mediante MLX, ya que el formato nativo es MLX safetensors.

No obstante, la informacion publicada es muy escasa: no hay model card descriptiva mas alla de los detalles de cuantizacion, no se indican benchmarks, licencia ni idiomas soportados. Esta ficha se limita por tanto a los datos verificables del repositorio y a las inferencias razonables a partir de la nomenclatura, marcando explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (inferido del sufijo A4B; no confirmado en la model card) |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | ~4 B (inferido del sufijo A4B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (repo de 28,0 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base. El identificador "gemma-4-26B-A4B-it" sugiere un transformer con capas de mezcla de expertos (MoE), donde "26B" corresponderia a los parametros totales y "A4B" a los parametros activos por token, un patron habitual en modelos MoE eficientes. El sufijo "it" indica un ajuste para instrucciones (instruction-tuned). El sufijo "abliterix" apunta a una modificacion post-entrenamiento de abliteracion, que altera los pesos para suprimir la direccion de activacion asociada al rechazo de peticiones, sin reentrenamiento adicional.

El proceso de cuantizacion documentado es el unico dato tecnico concreto: se aplico oQ (oMLX v0.7.0), una tecnica de cuantizacion de precision mixta, con 8 bits y group size de 64, generando pesos en formato MLX safetensors. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se detalla que capas recibieron mayor o menor precision dentro del esquema mixto.

## Capacidades

- Generacion de texto y respuesta a instrucciones (heredadas del modelo base instruction-tuned, presumiblemente).
- Razonamiento y conversacion multi-turno: capacidad esperable en un modelo de esta familia, aunque no verificada en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Efecto de la abliteracion: se espera una reduccion de las negativas del modelo ante peticiones que el modelo base rechazaria, aunque el alcance exacto no esta documentado.

## Casos de uso

- Experimentacion con cuantizacion mixta en MLX: el modelo sirve como referencia para evaluar el impacto de oQ a 8 bits sobre un modelo de ~26 B, comparando calidad y velocidad frente al modelo original sin cuantizar.
- Despliegue local en Apple Silicon: al estar en formato MLX safetensors, se puede cargar con la libreria MLX en equipos con memoria unificada suficiente (el repo ocupa 28 GB), lo que permite ejecutar inferencia local sin GPU dedicada.
- Investigacion sobre abliteracion: util para estudiar como afecta la eliminacion de la direccion de rechazo al comportamiento del modelo en tareas de seguridad, moderacion y alineamiento.
- Prototipado de asistentes conversacionales: un modelo instruction-tuned de este tamano puede emplearse para generar respuestas en dialogos multi-turno en entornos de desarrollo, siempre que se validen previamente sus capacidades reales.
- Evaluacion comparativa de tecnicas de cuantizacion: permite contrastar la precision mixta de oQ con otras aproximaciones (GGUF Q8, AWQ, GPTQ) sobre el mismo modelo base.
- Base para ajuste fino ligero: al ser un checkpoint cuantizado, su uso para fine-tuning es limitado, pero puede servir como punto de partida para experimentos de destilacion o evaluacion de tecnicas de recuperacion de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 28,0 GB en disco; la inferencia requiere al menos esa cantidad de memoria unificada o VRAM, mas overhead de runtime.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el formato MLX, el entorno natural es Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior).
- Cabe en consumer GPU: en GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabria en su totalidad a 8 bits; requeriria hardware con 32 GB o mas de memoria, o bien tecnicas adicionales de offloading no documentadas.
- Opciones de despliegue: MLX (libreria nativa del formato). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-abliterix-oQ8 | 25,8 B (MoE, ~4 B activos, inferido) | no disponible | MLX safetensors 8-bit | no disponible | Hugging Face (iOvermind) |
| Modelo base Gemma 4 26B-A4B-it | 25,8 B (inferido) | no disponible | safetensors | no disponible | Referencia no incluida en la informacion |
| Alternativas cuantizadas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse la licencia del modelo base antes de cualquier uso en produccion.
- La abliteracion modifica el comportamiento de seguridad del modelo y puede aumentar la probabilidad de generar contenido que el modelo original rechazaria; no es adecuado para aplicaciones con requisitos estrictos de moderacion sin capas adicionales de filtrado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen este riesgo en esta variante.
- La cuantizacion a 8 bits con precision mixta puede introducir degradacion de calidad respecto al modelo original, especialmente en tareas de razonamiento complejo o generacion de codigo; no se aportan metricas comparativas.
- El formato MLX limita el despliegue a entornos Apple Silicon o a herramientas compatibles con MLX; no hay soporte documentado para ecosistemas CUDA o ROCm.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar casos de uso multilingues o de contexto largo.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- El identificador del modelo incluye "gemma-4", pero no se confirma en la informacion proporcionada que corresponda a una version oficial de Google; debe tratarse como una variante derivada no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/iOvermind/gemma-4-26B-A4B-it-abliterix-oQ8
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
