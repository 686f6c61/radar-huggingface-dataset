# anderlago/serginho-krea

## Resumen

`anderlago/serginho-krea` es un adaptador LoRA de tipo DreamBooth entrenado sobre el modelo base `krea/Krea-2-Raw` y pensado para ser utilizado con la variante `krea/Krea-2-Turbo`. Su propósito es inyectar un concepto concreto (una identidad de personaje identificada por el token `sergio, male`) en el pipeline de generación de imágenes texto-a-imagen de Krea 2, permitiendo generar retratos de ese personaje en escenarios muy diversos (ciberpunk, pintura al óleo, macrofotografía, etc.) sin necesidad de reentrenar el modelo completo.

El repositorio es extremadamente ligero (0,8 GB) y se distribuye en formato compatible con `diffusers`, cargándose dinámicamente sobre el pipeline mediante `load_lora_weights`. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque el modelo base subyacente (`krea/Krea-2-Raw` / `krea/Krea-2-Turbo`) tiene sus propios términos que deben respetarse.

Se trata de un LoRA de nicho, publicado en noviembre de 2026, con cero descargas y un único like en el momento de redactar esta ficha. No dispone de documentación técnica sobre el dataset de entrenamiento, hiperparámetros, número de pasos, resolución o composición de las imágenes de referencia. Toda la información disponible proviene de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusión texto-a-imagen (Krea 2) |
| Parametros totales | no disponible (el repo pesa 0,8 GB; los pesos LoRA son un subconjunto de baja dimensionalidad, no se detalla el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto; depende del encoder de texto del pipeline Krea 2) |
| Tipos de cuantizacion | no disponible (se distribuye en el formato nativo de `diffusers`; admite `bfloat16` en el ejemplo de la model card) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés; el encoder de texto del base determina los idiomas reales) |
| Licencia | apache-2.0 (sujeta además a los términos del modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`) |
| Formato de pesos | safetensors / formato `diffusers` (carga vía `pipe.load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth aplicado sobre Krea 2, un modelo de difusión texto-a-imagen. El entrenamiento se realizó sobre la variante `Krea-2-Raw` (modelo base sin destilación aparente) y las muestras publicadas se generaron con `Krea-2-Turbo` en 8 pasos de inferencia con `guidance_scale=0.0`, lo que sugiere que el LoRA es compatible con la variante destilada de pocos pasos.

No se especifican en la información disponible: número de imágenes de entrenamiento, resolución, número de pasos, learning rate, rank del LoRA, uso de regularización, ni si se emplearon técnicas como captions automáticos o balanceo de dataset. El token de activación es `sergio, male`, y los prompts de ejemplo lo combinan con descripciones de escena, vestuario y estilo, lo que indica que el LoRA está entrenado para asociar ese token a la identidad del personaje y no a un estilo artístico concreto.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `sergio, male` para producir retratos del personaje en contextos variados.
- Transferencia de identidad consistente entre escenas, vestuarios y estilos (cinematográfico, pintura al óleo, macrofotografía).
- Compatibilidad con la variante Turbo del modelo base, permitiendo inferencia en 8 pasos.
- Integración nativa con `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades de audio ni de vídeo.
- Capacidades multilingües en prompts: no disponibles explícitamente; dependen del encoder de texto del pipeline Krea 2.

## Casos de uso

- Producción de retratos de personaje consistentes para narrativa visual: usar el token `sergio, male` junto a descripciones de escena para generar un elenco de imágenes del mismo personaje en distintos entornos (urbano, histórico, fantástico) sin reentrenar el modelo.
- Storyboarding y previsualización de proyectos audiovisuales: generar viñetas rápidas del personaje en localizaciones y vestuarios variados para comunicar dirección de arte antes de rodaje o render final.
- Creación de avatares y material promocional: producir imágenes del personaje para perfiles, campañas o merchandising con coherencia de identidad entre piezas.
- Ilustración editorial y de libros: generar portadas o ilustraciones interiores donde el personaje aparece en estilos pictóricos distintos (óleo, acuarela, macrofotografía) manteniendo el parecido.
- Prototipado de videojuegos y experiencias interactivas: generar assets 2D del personaje para menús, fichas o cinemáticas conceptuales antes de modelado 3D.
- Experimentación artística y fotografía sintética: explorar variaciones de escala (por ejemplo, personaje como explorador miniatura) manteniendo la identidad, útil para portfolios y demos creativas.
- Integración en pipelines de generación automatizada: cargar el LoRA sobre `Krea-2-Turbo` en un servicio `diffusers` para producir lotes de imágenes del personaje con 8 pasos, reduciendo coste de inferencia frente a modelos no destilados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este LoRA; depende del pipeline `Krea-2-Turbo` completo (no documentado en la información proporcionada). El adaptador en sí pesa 0,8 GB.
- GPU recomendadas: no disponibles explícitamente. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU compatible con bfloat16 (por ejemplo, serie Ampere o superior).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de los requisitos del modelo base Krea 2, no documentados aquí.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (único método documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de este tipo).
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia con `guidance_scale=0.0` sobre Turbo, pero no reporta tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| anderlago/serginho-krea | LoRA DreamBooth sobre Krea 2 | no disponible (repo 0,8 GB) | no aplica | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base texto-a-imagen | no disponible | no disponible | no disponible | no disponible en esta ficha | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Variante destilada de Krea 2 | no disponible | no disponible | no disponible | no disponible en esta ficha | Hugging Face (referenciado como pipeline de uso) |

No se dispone de datos de benchmarks ni de especificaciones técnicas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al tratarse de un LoRA de identidad sobre un modelo de difusión, puede heredar sesgos demográficos y estilísticos del modelo base Krea 2.
- Riesgo de alucinación: en modelos texto-a-imagen se manifiesta como artefactos anatómicos, incoherencias de vestuario o pérdida de parecido del personaje cuando el prompt se aleja de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: los prompts de ejemplo están en inglés; no se confirma soporte multilingüe. El token `sergio, male` debe usarse literalmente para activar el concepto.
- Restricciones de licencia: el LoRA declara Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base `krea/Krea-2-Raw` / `krea/Krea-2-Turbo`, cuyos términos no se detallan en esta ficha.
- Caveats para producción: repo con 0 descargas y 1 like, sin documentación de hiperparámetros ni dataset; no hay garantía de reproducibilidad ni de robustez fuera de los prompts de ejemplo. No se reportan métricas de calidad (FID, CLIP score, similitud facial) ni validación independiente.
- El LoRA está entrenado para un único concepto (`sergio, male`); no es un modelo generalista y mezclarlo con otros LoRA puede degradar la identidad o el estilo.

## Enlaces

- Hugging Face: https://huggingface.co/anderlago/serginho-krea
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Pipeline de uso (Turbo): https://huggingface.co/krea/Krea-2-Turbo
