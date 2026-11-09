# McG-221/Kitchoon-Final-26B-A4B-mlx-8Bit

## Resumen
Kitchoon-Final-26B-A4B-mlx-8Bit es una conversion al formato MLX, en cuantizacion de 8 bits, del modelo SubMaroon/Kitchoon-Final-26B-A4B, un modelo de arquitectura Mixture of Experts (MoE) de la familia Gemma 4 orientado a roleplay y a uso sin censura. Lo publica el usuario McG-221 en Hugging Face y esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm (version 0.31.2 usada en la conversion).

El modelo resuelve el problema de desplegar un MoE de aproximadamente 25.200 millones de parametros totales en equipos con memoria unificada de Apple, reduciendo el peso a un repositorio de 26,8 GB gracias a la cuantizacion de 8 bits. Su enfoque declarado es el roleplay y el uso en frontends tipo SillyTavern, con etiquetas que indican contenido "uncensored" y "heretic" (es decir, con las capas de rechazo atenuadas).

Es relevante ahora porque combina tres tendencias: la popularizacion de los MoE eficientes en inferencia, el ecosistema MLX para Mac y la demanda de modelos de rol sin restricciones. La informacion publica es escasa: la model card solo documenta el proceso de conversion, y no hay datos de entrenamiento, evaluaciones ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) de la familia Gemma 4 (segun etiquetas del autor); detalles de capas y atencion no disponibles |
| Parametros totales | 25.233.053.440 (25,2 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (el sufijo A4B sugiere unos 4 mil millones activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base podria admitir otras, no documentadas |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento
La informacion disponible solo confirma que se trata de un modelo MoE de la familia Gemma 4, derivado de SubMaroon/Kitchoon-Final-26B-A4B, y que esta version concreta es una conversion a MLX realizada con mlx-lm 0.31.2. No se detalla el numero de expertos, la dimension oculta, el mecanismo de atencion ni la estrategia de enrutamiento.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas "heretic" y "uncensored" sugieren un ajuste fino orientado a reducir los rechazos del modelo original, pero no se documenta el metodo ni el volumen de datos empleado en ese ajuste.

## Capacidades
- Generacion de texto conversacional orientada a roleplay y ficcion interactiva.
- Mantenimiento de personajes y estilo narrativo en conversaciones multi-turno (segun la orientacion declarada del modelo).
- Uso sin censura declarada: menor tendencia a rechazar peticiones por contenido sensible, segun las etiquetas del autor.
- Capacidad multilingue limitada al ingles segun los metadatos.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer (documentado en la model card).
- Compatibilidad con frontends de rol como SillyTavern (etiqueta declarada).
- No hay informacion sobre tool calling, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso
- Roleplay y narrativa interactiva en local: el modelo esta etiquetado explicitamente para roleplay y SillyTavern, por lo que puede usarse como motor de personajes en Mac con memoria unificada suficiente para los 26,8 GB del repositorio.
- Escritura creativa asistida: generacion de dialogos y tramas en ingles con un tono menos restrictivo que los modelos alineados convencionales, util para ficcion con tematicas adultas.
- Prototipado de agentes conversacionales en Apple Silicon: la integracion nativa con mlx-lm permite cargar el modelo con pocas lineas de Python y probar flujos de chat sin GPU dedicada.
- Investigacion sobre alineacion y censura: al ser un modelo "heretic/uncensored", sirve para estudiar como cambia el comportamiento al atenuar los rechazos, comparandolo con el base Gemma.
- Desarrollo de juegos de texto y aventuras conversacionales: el formato MoE con pocos parametros activos (segun el sufijo A4B) favorece la latencia en inferencia interactiva.
- Evaluacion de tecnicas de cuantizacion: comparar esta version de 8 bits en MLX con el modelo base en otros formatos para medir la perdida de calidad en tareas de generacion larga.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada: el repositorio ocupa 26,8 GB en 8 bits, por lo que se necesita al menos esa cantidad de memoria unificada, mas margen para el contexto y el runtime (en la practica, 32 GB o mas recomendable).
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max); no aplica a GPU NVIDIA porque el formato es MLX.
- Cabe en consumer hardware Apple: si, en equipos con 32 GB o mas de memoria unificada; en 24 GB es probable que no quepa con contexto util.
- Opciones de despliegue: mlx-lm (documentado en la model card); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-mlx-8Bit | 25,2 mil millones (MoE) | no disponible | Apache 2.0 | MLX safetensors 8 bits | Roleplay sin censura, solo ingles |
| SubMaroon/Kitchoon-Final-26B-A4B (base) | 25,2 mil millones (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original del que deriva esta conversion; mismos datos no disponibles |
| Gemma 4 (familia original) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia segun etiquetas; sin datos concretos en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta documentado.
- Modelo "uncensored/heretic": puede generar contenido sensible, ofensivo o inapropiado; requiere moderacion si se expone a usuarios finales.
- Riesgo de alucinacion no evaluado; no hay benchmarks que permitan estimar su fiabilidad factual.
- Sin datos de contexto: se desconoce la ventana maxima y su comportamiento en conversaciones muy largas.
- Formato exclusivo MLX: no es portable a ecosistemas CUDA sin reconversion.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema minimo, sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el entrenamiento y la procedencia de datos impide verificar el cumplimiento de las condiciones del modelo base.
- No hay informacion sobre tool calling ni capacidades de agente, por lo que no es recomendable para pipelines que dependan de ellas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/McG-221/Kitchoon-Final-26B-A4B-mlx-8Bit
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
