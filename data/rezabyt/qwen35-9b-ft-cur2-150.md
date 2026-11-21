# rezabyt/qwen35-9b-ft-cur2-150

## Resumen

rezabyt/qwen35-9b-ft-cur2-150 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario rezabyt y publicado en Hugging Face. Se trata de un checkpoint intermedio de un proceso de aprendizaje por refuerzo (reinforcement learning) de 150 pasos de optimizacion, orientado a la modalidad image-text-to-text segun las etiquetas del repositorio. El modelo conserva la arquitectura y el tokenizador del modelo base, por lo que se carga con `AutoModelForCausalLM.from_pretrained` a traves de la libreria transformers.

El interes de esta publicacion es limitado pero concreto: sirve como referencia de un estado intermedio de entrenamiento con RL sobre una base Qwen3.5 de 9B, con pesos en safetensors y licencia Apache 2.0. No incluye model card detallada, datos de entrenamiento, hiperparametros ni evaluaciones, lo que limita su uso directo en produccion sin una validacion previa por parte del usuario.

Con 9.409.813.744 parametros y un repositorio de 18,8 GB, el modelo se posiciona en la franja de 9B, adecuada para despliegue en GPUs de gama alta de consumo con cuantizacion y en GPUs de datacenter para inferencia sin cuantizar. Al no disponer de informacion sobre contexto, idiomas o rendimiento, la ficha refleja unicamente los datos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion posible via herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (segun tags del repositorio) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 18,8 GB |
| Pasos de entrenamiento | 150 pasos de optimizacion (RL) |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B. La model card indica explicitamente que se trata de un ajuste mediante aprendizaje por refuerzo con 150 pasos de optimizacion, y que los pesos, la configuracion y el tokenizador se publican tal como los guardo el entrenador. No se especifican la variante exacta de RL (por ejemplo, PPO, DPO o GRPO), la composicion del dataset, el numero de tokens vistos ni si hubo fases previas de SFT.

La arquitectura subyacente corresponde a la familia Qwen3.5, de la que no se aportan detalles en la informacion disponible (numero de capas, dimension oculta, tipo de atencion, uso de atencion lineal o decodificacion especulativa). El tag image-text-to-text sugiere capacidades multimodales heredadas del modelo base, pero no se documenta el codificador visual ni la resolucion de imagen soportada. Tampoco se detalla ninguna innovacion tecnica adicional introducida por el fine-tune.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B; no se documentan evaluaciones especificas tras el fine-tune.
- Procesamiento image-text-to-text: el repositorio incluye la etiqueta correspondiente, lo que indica soporte de entrada de imagen y texto, aunque no se detalla el pipeline.
- Reinforcement learning: el checkpoint proviene de un entrenamiento con RL de 150 pasos, orientado presumiblemente a mejorar el comportamiento en tareas de recompensa definida; no se especifica cual.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de checkpoints intermedios de RL: el modelo permite a investigadores comparar el comportamiento de un estado a 150 pasos de RL frente al modelo base Qwen3.5-9B, midiendo la evolucion de la recompensa y de las metricas de tarea.
- Reproduccion de experimentos de RL: al publicarse pesos, configuracion y tokenizador tal como los guardo el entrenador, sirve como punto de partida para reproducir o continuar el entrenamiento con el mismo pipeline.
- Prototipado de pipelines multimodales: la etiqueta image-text-to-text permite experimentar con tareas de imagen y texto en entornos de investigacion, siempre validando el comportamiento real antes de usarlo.
- Fine-tuning posterior (SFT o DPO): el checkpoint puede utilizarse como inicializacion para un ajuste supervisado adicional con datos propios, aprovechando la licencia Apache 2.0.
- Despliegue interno de bajo riesgo: en escenarios donde se requiere un modelo de 9B con licencia permisiva y no hay requisitos estrictos de calidad, puede servir como linea base para pruebas de integracion con transformers.
- Investigacion sobre estabilidad del entrenamiento RL: con solo 150 pasos, es util para estudiar la varianza y la degradacion o mejora del modelo en fases tempranas de RL, comparando con checkpoints posteriores si el autor los publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9,5-10 GB de pesos; cabe en GPUs de 12-16 GB con contexto moderado.
- Cuantizacion a 4 bits: alrededor de 5-6 GB de pesos; cabe en GPUs de consumo de 8 GB, con degradacion de calidad no evaluada.
- GPUs recomendadas: A100 40/80 GB, H100 para inferencia sin cuantizar y alto throughput; RTX 4090 (24 GB) para BF16 con contexto limitado; RTX 3090, 4080 o 4070 Ti Super para cuantizacion 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion; en BF16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no estan documentados por el autor y requeririan conversion y validacion propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rezabyt/qwen35-9b-ft-cur2-150 | 9,41B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune RL de 150 pasos, sin benchmarks |
| Qwen/Qwen3.5-9B | 9B (segun denominacion) | no disponible | no disponible en la informacion | Hugging Face | Modelo base; referencia directa del fine-tune |
| Alternativas de ~9B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion con otras alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion disponible; se indica "no disponible".

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros de RL, funcion de recompensa ni evaluaciones, lo que impide conocer que comportamientos se han modificado respecto al modelo base.
- Riesgo de alucinacion: no evaluado; al ser un checkpoint intermedio de RL, el comportamiento puede ser inestable y diferir del modelo base de forma no prevista.
- Sesgos conocidos: no documentados; los sesgos del modelo base Qwen3.5-9B se heredan sin analisis adicional.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la ventana de contexto efectiva ni la cobertura linguistica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe verificar que el modelo base Qwen3.5-9B mantiene la misma licencia y cumplir cualquier condicion adicional de la familia Qwen.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Uso en produccion: no recomendado sin una evaluacion propia de calidad, seguridad y estabilidad; el checkpoint esta pensado como material de investigacion.
- Compatibilidad de despliegue: la carga esta declarada con transformers; otros motores de inferencia pueden requerir ajustes de configuracion no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezabyt/qwen35-9b-ft-cur2-150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
