# bambocher/Qwen3.5-0.8B-oQ3.5e-mtp

## Resumen

Qwen3.5-0.8B-oQ3.5e-mtp es un checkpoint cuantizado del modelo Qwen3.5-0.8B, publicado por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1), que aplica cuantización mixta de precisión por grupos. No es un modelo entrenado desde cero, sino una distribución de pesos recomprimidos del modelo base de la familia Qwen3.5, orientada a ejecución local en Apple Silicon a través de la librería MLX.

El checkpoint contiene tres componentes: el modelo de lenguaje (0,752 B de parámetros), una torre de visión (0,101 B) y una cabeza de predicción multi-token o MTP (0,020 B), lo que lo convierte en un modelo multimodal pequeño con soporte de decodificación especulativa. El total asciende a 873.438.784 parámetros y el repositorio ocupa 0,6 GB.

Su relevancia radica en el interés técnico de la receta de cuantización mixta: la mayor parte de los pesos se almacena a 3 bits (63,2 % de los pesos lógicos) mientras que una fracción pequeña se mantiene en BF16 (11,8 %), logrando una media efectiva de 5,484 bits por peso. Esto reduce el almacenamiento a 0,558 GiB, aproximadamente 2,9 veces menos que un checkpoint BF16 equivalente, manteniendo presumiblemente las capas más sensibles en mayor precisión. La licencia no está indicada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, multimodal (torre de visión + modelo de lenguaje) con cabeza de predicción multi-token (MTP); pesos en cuantización mixta afín con group size 64 |
| Parámetros totales | 873.438.784 (0,873 B): LM 0,752 B, visión 0,101 B, cabeza MTP 0,020 B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Afín 3/4/5/6/8-bit group 64 + BF16; media efectiva de 5,484 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 y su nombre indica un tamaño de 0,8 B de parámetros. El checkpoint incluye explícitamente una torre de visión de 0,101 B, lo que confirma que el modelo base es multimodal (procesa texto e imagen), y una cabeza MTP de 0,020 B, empleada para predicción multi-token y decodificación especulativa. La arquitectura subyacente es de tipo transformer denso, aunque la información disponible no detalla número de capas, dimensiones ocultas ni mecanismo de atención.

No se dispone de datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO o etapas de alineación), ya que la model card se limita a documentar el proceso de cuantización. La innovación técnica documentada es la receta oQ de oMLX: una asignación de precisión por grupos que concentra los pesos en 3 bits (63,207 % de los pesos lógicos, 3,50 bits/peso efectivos) y reserva precisiones de 4, 5, 6 y 8 bits para fracciones menores, además de mantener un 11,815 % en BF16 (16 bits). El resultado es una media de 5,484 bits/peso sobre el total del checkpoint.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B (sin benchmarks publicados que lo confirmen).
- Procesamiento de imagen: la presencia de una torre de visión de 0,101 B indica capacidades multimodales (descripción de imágenes, posible OCR o VQA), aunque no se detallan en la model card.
- Decodificación especulativa mediante la cabeza MTP de 0,020 B, que permite acelerar la generación prediciendo varios tokens por paso.
- Ejecución local en Apple Silicon a través de MLX (no está pensado para CUDA).
- Soporte de tool calling, agentes o modos "thinking": no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Asistencia de texto offline en Mac: el checkpoint de 0,6 GB se ejecuta íntegramente en memoria unificada de Apple Silicon, permitiendo procesamiento de texto sin conexión y con privacidad total de los datos.
- Análisis ligero de imágenes en el dispositivo: gracias a la torre de visión, puede emplearse para descripción de imágenes, extracción de texto (OCR) o respuesta a preguntas visuales en aplicaciones de escritorio, sin enviar las imágenes a la nube.
- Prototipado de pipelines multimodales en MLX: sirve como banco de pruebas para desarrolladores que quieran validar flujos texto+imagen con el runtime mlx-vlm antes de escalar a modelos mayores.
- Investigación sobre cuantización mixta: su receta oQ documentada (distribución de bits por componente) lo convierte en un caso de estudio para medir la pérdida de calidad frente al modelo BF16 original.
- Aceleración mediante decodificación especulativa: la cabeza MTP permite experimentar con generación multi-token y medir ganancias de throughput en hardware Apple.
- Inferencia en el borde con memoria limitada: su reducido tamaño lo hace apto para dispositivos con 8 GB de memoria unificada o entornos embebidos basados en Apple Silicon.
- Demostraciones educativas: útil para ilustrar el impacto de la cuantización en un modelo multimodal pequeño dentro de cursos o talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 0,558 GiB (0,599 GB); en la práctica se recomienda reservar entre 1 y 2 GB de memoria unificada para pesos, contexto y overhead del runtime.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4), ya que el formato es MLX y no hay backend CUDA documentado.
- Cabe en consumer GPU: sí, en cualquier Mac con 8 GB de memoria unificada o superior; es un modelo de gama de entrada.
- Opciones de despliegue: mlx_lm para texto y mlx-vlm para multimodal; no se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión previa. No hay soporte nativo de vLLM o TGI documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ3.5e-mtp (este) | 0,873 B | no disponible | safetensors MLX, ~5,48 bits/peso | no disponible | Cuantización mixta oQ, 0,6 GB |
| Qwen3.5-0.8B (base, BF16 teórico) | ~0,873 B | no disponible | BF16 | no disponible | Tamaño estimado ~1,75 GB a 16 bits |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | Sin datos publicados |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base Qwen3.5-0.8B antes de desplegarlo en producción.
- Modelo de tercera parte: el checkpoint lo publica bambocher, no el equipo original de Qwen; no es una distribución oficial y no cuenta con validación de la comunidad (12 descargas, 0 likes en el momento de la consulta).
- Cuantización agresiva: el 63,2 % de los pesos está a 3 bits, lo que puede degradar la calidad respecto al modelo BF16, especialmente en tareas de razonamiento o código.
- Tamaño reducido: con 0,8 B de parámetros, la capacidad de razonamiento complejo, matemáticas y código es limitada en comparación con modelos mayores.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños y cuantizados; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas y contexto no declarados: se desconoce el soporte multilingüe real y la longitud máxima de contexto.
- Dependencia de MLX: sin conversión, no se ejecuta en GPUs NVIDIA ni en la mayoría de stacks de servidor estándar (vLLM, TGI).
- Sin benchmarks: no hay métricas que permitan comparar su rendimiento con el modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ3.5e-mtp
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
