# AndreiRabau/diffusion-llm

## Resumen

Diffusion-LLM es un modelo experimental de difusión discreta para texto desarrollado por AndreiRabau, construido a partir del backbone de GPT-2 de OpenAI. En lugar de predecir el siguiente token de forma autorregresiva, el modelo recibe una secuencia corrompida y predice los tokens originales en todas las posiciones con atención bidireccional, refinando iterativamente las posiciones corruptas. El repositorio contiene múltiples checkpoints de distintos experimentos de corrupción y número de pasos de refinamiento.

Se trata de un artefacto de investigación orientado a la reproducibilidad, no de un generador de texto listo para producción: los checkpoints son `state_dict` de PyTorch que requieren la implementación propia `GPT2DiffusionTransformer` del repositorio y una tokenización concreta con dos tokens especiales añadidos. La ventana de secuencia utilizada en todos los experimentos es de solo 64 tokens y el entrenamiento se limita a WikiText-2, lo que acota drásticamente su aplicabilidad práctica.

Su interés actual es metodológico: permite estudiar políticas de corrupción (sustitución por tokens semánticamente cercanos, enmascaramiento y reemplazo aleatorio), currículos de entrenamiento mixtos y refinamiento guiado por confianza en el paradigma de difusión discreta aplicado a lenguaje, un área con creciente atención frente a los modelos autorregresivos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 adaptado a difusión discreta (atención bidireccional, embedding de timestep de difusión, cabeza de predicción del token limpio) |
| Parametros totales | no disponible (backbone GPT-2 base; el repositorio ocupa 24,9 GB por acumulación de checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch `state_dict`), requiere el wrapper `GPT2DiffusionTransformer` del repositorio |

## Arquitectura y entrenamiento

El modelo parte de `openai-community/gpt2` y conserva sus embeddings y bloques Transformer, pero sustituye la atención causal por atención bidireccional, añade un embedding aprendido de timestep de difusión a cada embedding de token y utiliza una cabeza de lenguaje que predice el token limpio en cada posición. El tokenizador de GPT-2 se amplía con `<|pad|>` y `<|mask|>`, y el vocabulario se redimensiona antes del entrenamiento, por lo que es imprescindible replicar esa construcción al cargar un checkpoint. La corrupción se aplica con probabilidad muestreada entre 0,01 y 0,95, y el operador de similitud usa los 20 vecinos más cercanos en el espacio de embeddings de GPT-2.

Todos los experimentos comparten configuración: 100 timesteps de difusión, longitud máxima de 64, learning rate de 1e-5 y el corpus WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`). Se publican checkpoints de 1 paso y de 4 pasos de refinamiento para cuatro estrategias de corrupción: similar (reemplazo por tokens semánticamente próximos), mask (token `<|mask|>`) y random (entradas aleatorias del vocabulario), además de un currículo mixto de 30 épocas de corrupción similar, 30 de enmascaramiento y 40 de reemplazo aleatorio. Los runs de 4 pasos emplean un decaimiento de la pérdida de rollout de 0,5. La pérdida es entropía cruzada calculada únicamente sobre posiciones corruptas no de padding; en el entrenamiento multi-paso las predicciones se realimentan al paso siguiente, mientras que en evaluación se usa refinamiento guiado por confianza, actualizando primero las posiciones corruptas con mayor confianza.

## Capacidades

- Denoising iterativo de texto: reconstrucción de secuencias corrompidas con tokens `<|mask|>`, tokens aleatorios o sustituciones semánticamente cercanas.
- Predicción bidireccional de tokens en todas las posiciones de la secuencia, no solo del siguiente token.
- Refinamiento multi-paso con número de iteraciones configurable (2, 4, 5, 8, 10, 20 o 50 en los experimentos de evaluación).
- Refinamiento guiado por confianza en inferencia, con actualización prioritaria de las posiciones más seguras.
- Generación de texto en inglés a nivel de secuencia corta (hasta 64 tokens).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM autorregresivos.
- Sin capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- No es compatible de forma directa con `AutoModelForCausalLM` de `transformers`.

## Casos de uso

- Investigación sobre difusión discreta para lenguaje: el modelo sirve como banco de pruebas reproducible para comparar políticas de corrupción (similar, mask, random) manteniendo constante el backbone y el presupuesto de entrenamiento.
- Estudio de currículos de entrenamiento: los checkpoints mixtos (30/30/40 épocas) permiten analizar cómo afecta el orden de las estrategias de corrupción a la calidad de la reconstrucción.
- Análisis de refinamiento guiado por confianza: útil para evaluar estrategias de selección de posiciones a actualizar en cada iteración frente a políticas uniformes.
- Reproducción de experimentos académicos: los artefactos de evaluación sobre `cimec/lambada` con tasas de corrupción del 25 % al 95 % permiten replicar resultados y comparar variantes de número de iteraciones.
- Docencia y divulgación: ejemplo autocontenido de cómo adaptar un Transformer causal preentrenado a un esquema de denoising no autorregresivo, con código de carga y utilidades de corrupción incluidas.
- Exploración de corrección de texto corto: con secuencias de hasta 64 tokens, puede experimentarse en tareas de restauración de fragmentos enmascarados en inglés, siempre en contexto de laboratorio y no en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluación sobre el split `test` de `cimec/lambada` con tasas de corrupción del 25 % al 95 % y distintos números de iteraciones de denoising, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Al tratarse de un backbone GPT-2 (124 M de parámetros en la versión base) con vocabulario redimensionado, la inferencia en CPU es viable, como demuestra el ejemplo de la model card con `device="cpu"`.
- GPU recomendadas: no disponible. Cualquier GPU consumer con suficiente memoria para GPT-2 debería poder cargar el modelo; no se especifican requisitos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del backbone, aunque no hay confirmación oficial ni cifras de memoria publicadas.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que requiere el wrapper `GPT2DiffusionTransformer` y pesos en `state_dict` de PyTorch. El despliegue se limita a scripts de PyTorch con `transformers` como dependencia para el tokenizador.
- Latencia y throughput: no disponibles. La inferencia implica múltiples iteraciones de denoising (hasta 50 en los experimentos de evaluación), lo que incrementa el coste frente a una pasada autorregresiva única.
- Almacenamiento: el repositorio ocupa 24,9 GB debido a la acumulación de checkpoints.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AndreiRabau/diffusion-llm | GPT-2 con difusión discreta | no disponible (backbone GPT-2) | 64 | Denoising no autorregresivo | no disponible | Hugging Face, `.pt` |
| openai-community/gpt2 | Transformer causal | 124 M (versión base) | 1024 | Autorregresivo | MIT (según el modelo original de OpenAI) | Hugging Face, `transformers` |
| Modelos de difusión de texto tipo MDLM o SEDD | Difusión discreta / score entropy | variable | variable | Denoising no autorregresivo | variable según release | Publicaciones y repositorios de investigación |

La comparación con alternativas de difusión discreta publicadas no puede completarse con datos de rendimiento porque no se han divulgado métricas numéricas para este modelo. Frente a GPT-2, la diferencia clave es el paradigma de generación y la ventana de contexto, mucho menor en este experimento.

## Limitaciones y advertencias

- Modelo estrictamente de investigación: el propio autor indica que no debe tratarse como un generador de texto listo para producción.
- Contexto muy limitado: 64 tokens, insuficiente para la mayoría de aplicaciones reales.
- Entrenado únicamente con WikiText-2 en inglés, lo que restringe el dominio y el idioma; no hay soporte multilingüe.
- No es un modelo causal estándar: no funciona con `AutoModelForCausalLM` ni con los pipelines habituales de `transformers`.
- Requiere replicar exactamente la construcción del tokenizador (tokens `<|pad|>` y `<|mask|>` y vocabulario redimensionado) y la configuración `num_diffusion_steps=100` para cargar los checkpoints.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación y de reconstrucciones plausibles pero incorrectas, inherente al denoising sobre secuencias cortas y a un entrenamiento limitado.
- Sin datos publicados de sesgos, robustez ni evaluación cuantitativa, lo que impide estimar su comportamiento fuera del conjunto de evaluación.
- El tamaño del repositorio (24,9 GB) y la multiplicidad de checkpoints complican su integración en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndreiRabau/diffusion-llm
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset LAMBADA (evaluación): https://huggingface.co/datasets/cimec/lambada
- Artículo de comparación difusión vs LLM (2026): https://kanerika.com/blogs/diffusion-models-vs-llms/
