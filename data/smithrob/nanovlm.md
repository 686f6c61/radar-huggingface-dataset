# smithrob/nanoVLM

## Resumen

nanoVLM es un modelo de visión-lenguaje (VLM) minimalista publicado por el usuario smithrob en Hugging Face, derivado del modelo base lusxvr/nanoVLM-222M. Su objetivo es servir como referencia educativa y de experimentación: toda la arquitectura y la lógica de entrenamiento caben en unas 750 líneas de PyTorch puro, lo que lo convierte en un banco de pruebas ideal para investigar el entrenamiento de modelos multimodales sin la complejidad de infraestructuras mayores.

El modelo combina un codificador visual ViT basado en SigLIP-B/16-224-85M con un modelo de lenguaje causal ligero, SmolLM2-135M, dando un total de aproximadamente 228 millones de parámetros (222M según la model card). Es, por tanto, un VLM de escala muy reducida, pensado para ejecutarse en hardware de consumo y para ciclos de iteración rápidos.

Su relevancia actual es principalmente investigadora y docente: permite reproducir de principio a fin el pipeline de alineación imagen-texto en un entorno controlado, aunque sus capacidades prácticas quedan muy lejos de los VLM de producción. La licencia MIT facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual ViT (SigLIP-B/16-224-85M) + LLM causal (SmolLM2-135M) |
| Parametros totales | 228.063.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón estándar de los VLM modernos: un codificador de imagen ViT (SigLIP-B/16-224-85M, parches de 16x16 a resolución 224) que proyecta las características visuales al espacio de embeddings del modelo de lenguaje, y un decoder causal SmolLM2-135M que genera la respuesta condicionada por la imagen y el prompt textual. La implementación completa, en PyTorch puro, ocupa aproximadamente 750 líneas de código, lo que incluye tanto la definición de la arquitectura como la lógica de entrenamiento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional. La model card no documenta innovaciones técnicas como decodificación especulativa o atención lineal; el interés del modelo reside precisamente en su simplicidad y en la ausencia de optimizaciones propietarias.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes y respuesta a preguntas visuales básicas.
- Razonamiento multimodal de complejidad limitada, acorde a un modelo de 228M de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el LLM subyacente (SmolLM2-135M) está entrenado principalmente en inglés, pero la model card no lo confirma para este derivado.
- Capacidades especiales (modo thinking, audio): no disponibles.
- Uso como base para experimentación e investigación en alineación visión-lenguaje.

## Casos de uso

- Docencia y formación en VLMs: el modelo permite recorrer el pipeline completo (codificador visual, proyección, decoder) en un cuaderno o script de pocas líneas, sin necesidad de GPUs de datacenter.
- Prototipado rápido de experimentos de alineación: investigadores pueden modificar la proyección o la estrategia de congelación de capas y reentrenar en horas con hardware de consumo.
- Pruebas de concepto de captioning de imágenes: generar descripciones breves de imágenes en entornos controlados donde la precisión no es crítica.
- Validación de pipelines de despliegue multimodales: sirve como modelo "smoke test" para verificar integraciones con servidores de inferencia antes de pasar a modelos mayores.
- Investigación en eficiencia computacional: punto de partida para estudiar destilación, pruning o cuantización sobre un VLM pequeño y con licencia permisiva.
- Reproducibilidad académica: al ser MIT y con código mínimo, facilita la replicación de resultados en publicaciones y trabajos de fin de máster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32/fp16 para los 228M de parámetros, más el overhead del codificador visual y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU para pruebas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 2-4 GB de VRAM.
- Opciones de despliegue: el modelo requiere la librería `nanovlm` y el repositorio github.com/huggingface/nanoVLM; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smithrob/nanoVLM | 228M | no disponible | MIT | Hugging Face |
| lusxvr/nanoVLM-222M (base) | ~222M | no disponible | no disponible en la información | Hugging Face |
| SmolVLM-256M (referencia de la familia SmolLM) | ~256M | no disponible en la información | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Escala muy reducida (228M de parámetros): la calidad de las respuestas visuales y textuales será limitada en comparación con VLMs de miles de millones de parámetros.
- Riesgo elevado de alucinación, especialmente en descripciones detalladas de imágenes o en preguntas que requieran conocimiento factual.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no especificada; no apto para conversaciones multi-turno largas sin validación previa.
- Sin soporte documentado de tool calling ni de flujos agénticos.
- No recomendado para producción en tareas críticas; su propósito declarado es la investigación y la experimentación.
- La licencia MIT permite uso comercial, pero la ausencia de evaluación de sesgos y robustez hace necesaria una auditoría propia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smithrob/nanoVLM
- Modelo base: https://huggingface.co/lusxvr/nanoVLM-222M
- Repositorio de código: https://github.com/huggingface/nanoVLM
