# skonan/PaperScorer-7B-Vision-arXiv

## Resumen

PaperScorer-7B-Vision-arXiv es un ajuste fino supervisado (SFT) de Qwen/Qwen2.5-VL-7B-Instruct, desarrollado por el usuario skonan y entrenado para predecir veredictos de aceptación o rechazo al estilo ICLR sobre artículos académicos. El modelo recibe como entrada el texto del artículo junto con capturas de pantalla de cada página, combinando así razonamiento sobre texto científico y percepción visual de las figuras, tablas y maquetación del PDF.

El modelo resuelve un problema muy concreto dentro del ecosistema de revisión científica: estimar de forma automática la probabilidad de aceptación de un envío antes de someterlo a revisión por pares. Se entrenó sobre el conjunto arxiv-large (71k ejemplos balanceados por venue) y se distribuye como checkpoint del paso 8862, correspondiente al final de la época 2 de 4. Con 8.292 millones de parámetros y una ventana de entrenamiento de 24.480 tokens, está pensado para procesar artículos completos junto con sus capturas de página en una sola pasada.

Su relevancia actual radica en que ofrece no solo una decisión binaria, sino también una log-odds calibrable mediante escalado de temperatura (τ = 1.499) y un término de tasa base, lo que permite convertir la evidencia interna del modelo en una probabilidad de aceptación ajustada a la tasa real de un venue concreto. Esto lo diferencia de clasificadores opacos y lo hace útil como herramienta de triaje o autoevaluación previa al envío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL, vision-language) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24.480 tokens (cutoff_len de entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa texto e imágenes, y se ajusta mediante SFT con LLaMA-Factory y FSDP2. La entrada sigue un formato sharegpt de tres turnos (system, human, gpt): un system prompt fijo ("You are an expert academic reviewer tasked with evaluating research papers."), un preámbulo de usuario específico del dominio arXiv que pide predecir el resultado de aceptación con respuesta en `\boxed{Accept}` o `\boxed{Reject}`, y el cuerpo del artículo. En las variantes de visión se añade un token `<image>` por cada captura de página al final del mensaje de usuario.

Los hiperparámetros de entrenamiento son: learning rate 1e-6, scheduler cosine_then_constant con decay_ratio 0.75 y min_lr_rate 0.001, batch size 16 y cutoff_len 24.480. El checkpoint publicado corresponde al paso 8862, final de la época 2 de 4 sobre el conjunto arxiv-large (71k ejemplos balanceados por venue). El autor advierte de una asimetría de tamaño de datos: los modelos entrenados con arXiv vieron aproximadamente 71k ejemplos, frente a los entrenados con ICLR, con una brecha de unas 3 veces, algo a tener en cuenta en comparaciones directas. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Predicción de veredicto binario Accept/Reject sobre artículos académicos a partir de texto más capturas de página.
- Estimación de log-odds de aceptación en el token de decisión, utilizable como señal continua de confianza.
- Calibración de probabilidad de aceptación mediante escalado de temperatura (τ = 1.499) y término de tasa base para un venue con tasa de aceptación π.
- Procesamiento multimodal: interpreta figuras, tablas y maquetación de las páginas del PDF además del texto.
- Manejo de entradas largas (hasta 24.480 tokens) para cubrir artículos completos.
- Soporte de tres vías de entrada vía la herramienta orquestadora: PDF anonimizado, directorio de fuentes LaTeX o identificador de arXiv.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Autoevaluación previa al envío: un autor somete su PDF anonimizado al servidor de scoring y obtiene una probabilidad de aceptación calibrada para la tasa del venue objetivo, útil para decidir si enviar o iterar el manuscrito.
- Triaje editorial: un comité puede procesar lotes de envíos y ordenarlos por log-odds de aceptación para priorizar la asignación de revisores, usando la calibración con la tasa real del venue.
- Análisis de señales de calidad: al comparar la log-odds de versiones sucesivas de un mismo artículo, el equipo puede detectar si las revisiones mejoran la percepción de aceptabilidad según el modelo.
- Investigación sobre revisión por pares: el modelo sirve como baseline reproducible para estudiar qué características textuales y visuales correlacionan con la aceptación en venues de ML.
- Integración en pipelines LaTeX: mediante el endpoint `submit_latex`, un sistema de CI puede puntuar automáticamente el directorio de fuentes anonimizado antes de generar el PDF final.
- Procesamiento por identificador arXiv: el endpoint `submit_arxiv` permite puntuar artículos públicos por su ID, habilitando estudios a escala sobre literatura ya publicada.
- Despliegue headless: el comando `paperscorer run` permite ejecutar el scoring en un solo paso sin servidor, adecuado para scripts de evaluación por lotes.

## Benchmarks y rendimiento

Evaluación in-distribution sobre `arxiv-balanced-test` (artículos de 2024 en adelante), con decisión tomada directamente por el modelo (Accept si ℓ = logprob(Accept) − logprob(Reject) ≥ 0, sin umbral ajustado):

| n_test | Exactitud | AUC | Tasa de aceptación predicha | Recall Accept | Recall Reject |
|---|---|---|---|---|---|
| 1414 | 77,6% | 0,851 | 46% | 74,8% | 80,2% |

Calibración (error de calibración esperado, 10 bins):

| Conjunto | ECE sin calibrar | ECE calibrado |
|---|---|---|
| arxiv-balanced-test (π = 0,5) | 0,069 | 0,024 |
| arXiv test con tasa natural | 0,132 (sin término de tasa base) | 0,033 (con término de tasa base) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 16,6 GB solo para pesos, más memoria para el procesador visual y el contexto de hasta 24.480 tokens; en la práctica se recomienda reservar 24 GB o más.
- El autor sugiere `vllm serve` con `--gpu-memory-utilization 0.85`, lo que implica GPUs con al menos 24-32 GB para operar con margen.
- GPUs recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para producción; una RTX 4090 (24 GB) puede ser ajustada en cuantización reducida, aunque no se documentan cuantizaciones oficiales.
- Despliegue soportado: vLLM (servidor de scoring con API compatible con OpenAI en el puerto 8000) y la herramienta `paperscorer` (CLI con servidor FastAPI y UI web en el puerto 8003).
- No se documentan opciones para llama.cpp, Ollama ni TGI, ni cifras de latencia o throughput.
- El repositorio ocupa 33,2 GB, lo que refleja pesos en safetensors sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Resultado publicado |
|---|---|---|---|---|---|
| PaperScorer-7B-Vision-arXiv | 8,29B | 24.480 tokens (entrenamiento) | Texto + imagen | other | 77,6% exactitud, AUC 0,851 en arxiv-balanced-test |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | ~8B | no disponible en la información | Texto + imagen | no disponible en la información | No aplica (no entrenado para esta tarea) |
| Otros modelos PaperScorer (7B/ICLR, etc.) | no disponible | no disponible | Texto o visión según variante | other | No disponibles en la información |

No se dispone de datos de benchmarks de alternativas directas en la información proporcionada; la comparación con el modelo base es estructural (misma arquitectura y tamaño), no de rendimiento en la tarea.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente con datos de arXiv y con preámbulo de usuario específico de arXiv; su comportamiento en otros venues o formatos puede degradarse.
- El conjunto de entrenamiento está balanceado 50/50 por venue, pero la tasa real de aceptación en despliegue es mucho menor (π = 0,232 en validación); sin aplicar la calibración, las probabilidades brutas están sesgadas al alza.
- Riesgo de alucinación: como modelo generativo, puede producir justificaciones o texto no fundamentado, aunque la decisión se extrae de la log-odds en un token específico.
- Solo soporta inglés según la model card.
- Licencia "other": no se especifican los términos exactos de uso comercial en la información disponible; es necesario consultar los términos del modelo base Qwen2.5-VL y del autor antes de un uso productivo.
- Asimetría de datos: los modelos entrenados con arXiv vieron unas 3 veces más ejemplos que los entrenados con ICLR, lo que invalida comparaciones directas sin ajustar por este factor.
- El checkpoint publicado corresponde a la época 2 de 4, no al entrenamiento completo; el rendimiento podría diferir de un modelo totalmente entrenado.
- La decisión binaria se mantiene invariante ante la calibración (Accept si ℓ ≥ 0), pero la probabilidad reportada depende de la elección correcta de π para el venue.
- No se documentan cuantizaciones oficiales ni garantías de comportamiento tras cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skonan/PaperScorer-7B-Vision-arXiv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
