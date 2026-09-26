# MohamedAhmedAE/llava-medical-3B-medsiglip-stage2

## Resumen

El modelo MohamedAhmedAE/llava-medical-3B-medsiglip-stage2 es un modelo multimodal de visión y lenguaje (VLM) orientado al dominio médico, publicado en Hugging Face por el usuario MohamedAhmedAE. Por el identificador y por la etiqueta llava del repositorio se trata de un modelo de la familia LLaVA, esto es, un transformer de lenguaje acoplado a un codificador visual mediante un proyector, y el sufijo medsiglip apunta a que el codificador visual es MedSigLIP, la variante de SigLIP adaptada a imágenes médicas. El sufijo stage2 indica que corresponde a la segunda fase de un entrenamiento por etapas, habitualmente el ajuste fino instruccional multimodal posterior al alineamiento inicial del proyector.

Los pesos publicados suman 110.237.696 parámetros según los ficheros safetensors, una cifra que no concuerda con el "3B" que aparece en el nombre del repositorio; el autor no documenta esa discrepancia. El repositorio ocupa 8,7 GB, muy por encima de lo que ocuparían 110 M de parámetros en fp16, lo que sugiere que incluye ficheros adicionales (codificador visual, adaptadores o varios puntos de control). El modelo acumula 293 descargas y 0 likes, y no declara licencia, idiomas ni ficha técnica.

Su interés es el de un experimento abierto de adaptación de modelos visión-lenguaje al dominio clínico, un área en la que los pesos abiertos escasean. No obstante, la ausencia de licencia declarada, de especificaciones y de resultados de evaluación limita seriamente cualquier uso en producción o en entornos clínicos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (transformer de lenguaje más codificador visual SigLIP/MedSigLIP más proyector), según la etiqueta llava y el identificador del repositorio; el autor no publica ficha técnica |
| Parámetros totales | 110.237.696 según los pesos safetensors; el nombre del repositorio indica 3B (discrepancia no documentada por el autor) |
| Parámetros activos | no aplica (no consta que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors, sin versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 8,7 GB |
| Descargas | 293 |
| Likes | 0 |
| Fecha de creación | 2026-07-15 |
| Última actualización | 2026-09-25 |

## Arquitectura y entrenamiento

La etiqueta llava del repositorio sitúa al modelo dentro del paradigma LLaVA: un codificador visual congelado o parcialmente ajustado que proyecta sus representaciones al espacio de embeddings de un modelo de lenguaje, de modo que el transformer de texto procesa tokens visuales y tokens de texto de forma conjunta. El identificador sugiere que el codificador visual es MedSigLIP, una adaptación al dominio médico del codificador SigLIP, y que el modelo de lenguaje tiene del orden de 3.000 millones de parámetros. No se dispone de confirmación por parte del autor de ninguno de estos extremos más allá de la nomenclatura y las etiquetas.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, resolución variable de imagen, etc.). La estructura del espacio de trabajo, organizada en etapas (stage2), es coherente con el esquema clásico de LLaVA en dos fases: alineamiento del proyector con pares imagen-texto y ajuste instruccional multimodal posterior. Tampoco se documenta si el ajuste se realizó con LoRA, QLoRA o actualización completa de pesos.

## Capacidades

Las siguientes capacidades se deducen de la arquitectura declarada y del dominio objetivo, pero no están verificadas por el autor ni acompañadas de evaluación publicada:

- Generación de texto e interacción conversacional multimodal, con entrada de imagen y texto.
- Descripción de imágenes médicas y respuesta a preguntas visuales (VQA médica), presumiblemente sobre radiología, histología y otras modalidades incluidas en los datos de ajuste.
- Generación de informes clínicos o descripciones estructuradas a partir de una imagen, si el ajuste instruccional incluyó ese tipo de tarea.
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas soportados.
- Soporte de tool calling o function calling: no disponible; no hay evidencia de plantilla de herramientas ni de entrenamiento específico.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible; nada indica que los soporte.
- Formato de prompt: no disponible; al no publicarse plantilla de conversación, el formato esperado (estilo LLaVA con tokens de rol y de imagen) debe inferirse del código de la familia LLaVA, no del repositorio.

## Casos de uso

- Investigación académica en alineación multimodal médica: el modelo sirve como punto de partida para estudiar cómo un codificador visual especializado (MedSigLIP) se acopla a un transformer de lenguaje pequeño y qué gana o pierde frente a codificadores generalistas; al ser un experimento abierto con pocas descargas, es útil como baseline reproducible en trabajos de comparación.
- Experimentación con ajuste fino sobre datasets propios: al tratarse de un modelo pequeño y en safetensors, se puede cargar en una GPU de gama alta de consumo y reentrenar el proyector o aplicar LoRA sobre un conjunto propio de imágenes y textos clínicos anonimizados.
- Prototipado de asistentes de descripción de imágenes para educación médica: generación de descripciones orientativas de casos didácticos para estudiantes, siempre con revisión por un profesional y sin uso diagnóstico.
- Preanotación de datasets de imagen médica: el modelo puede proponer descripciones o etiquetas preliminares sobre grandes volúmenes de imágenes para que un experto las valide después, reduciendo el coste de anotación manual.
- Búsqueda semántica sobre archivos de imágenes: extracción de representaciones o descripciones textuales para indexar colecciones de imágenes clínicas y permitir consultas en lenguaje natural, con la advertencia de que la calidad de los embeddings no está evaluada.
- Demostraciones y material docente sobre modelos visión-lenguaje: uso en talleres o asignaturas para ilustrar el pipeline LLaVA completo (codificador visual, proyector y modelo de lenguaje) sin necesidad de infraestructura de gran escala.
- Investigación sobre robustez y alucinación en dominio clínico: al ser un modelo abierto y pequeño, resulta adecuado para medir la tasa de afirmaciones no sustentadas por la imagen, aunque no existan métricas publicadas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, ni comparaciones con VQA-RAD, SLAKE, PathVQA, MMMU u otros conjuntos de referencia médica y multimodal, ni datos de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería a partir del tamaño publicado; conviene recalcularlas una vez inspeccionados los ficheros reales del repositorio, dado que el número de parámetros declarado (110 M) no coincide con el "3B" del nombre.

Escenario A, si el conjunto real se aproxima a los 110 M de parámetros publicados:

- VRAM en fp16: en torno a 0,3 GB para los pesos, más el codificador visual y los buffers de activación.
- VRAM en int8: en torno a 0,15 GB; en int4, en torno a 0,1 GB.
- Cabe holgadamente en cualquier GPU de consumo con 6 GB o más (GTX 1660, RTX 3060, RTX 4060) e incluso en CPU con llama.cpp si se convierte a GGUF.

Escenario B, si el modelo de lenguaje es realmente de 3.000 millones de parámetros:

- VRAM en fp16: aproximadamente 6-7 GB solo para el transformer, más 0,8-1,2 GB del codificador visual MedSigLIP y el proyector; total del orden de 8-10 GB.
- VRAM en int8: aproximadamente 3,5-4,5 GB para el conjunto.
- VRAM en int4: aproximadamente 2,5-3,5 GB, lo que lo sitúa al alcance de una RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- GPU recomendadas: RTX 4090 o A10G para prototipado rápido; A100 40/80 GB o H100 para servir varias réplicas o hacer ajuste fino completo.
- El repositorio pesa 8,7 GB, por lo que se necesita ese espacio en disco además de la VRAM.

Opciones de despliegue y latencia:

- No hay versiones GGUF, AWQ, GPTQ ni MLX publicadas, así que llama.cpp y Ollama exigirían una conversión propia; vLLM y TGI admiten modelos LLaVA con soporte multimodal, pero requerirían comprobar la compatibilidad de la configuración concreta.
- Transformers con `AutoModelForVision2Seq` o la clase equivalente de LLaVA es la vía más directa, aunque no está confirmada por el autor.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

Los datos de la columna de alternativas proceden de la documentación pública de cada proyecto y no se han verificado contra este repositorio; conviene contrastarlos antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llava-medical-3B-medsiglip-stage2 | 110,2 M según safetensors; 3B según el nombre | no disponible | no disponible | pesos safetensors en Hugging Face |
| LLaVA-Med 7B (Microsoft) | 7B | no verificado | licencia de investigación de Microsoft (uso comercial restringido) | pesos en Hugging Face |
| LLaVA-1.5 7B | 7B | 4.096 tokens | Apache-2.0 con las condiciones heredadas del modelo de lenguaje base | pesos en Hugging Face |
| Qwen2-VL 2B | 2B | 32.768 tokens | Apache-2.0 | pesos en Hugging Face |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita no hay autorización clara de uso, ni siquiera para investigación; para uso comercial el riesgo jurídico es alto y debe consultarse al autor.
- Discrepancia de parámetros: el nombre indica 3B y los safetensors suman 110 M. Sin aclaración del autor, no se puede garantizar qué se está descargando ni qué capacidad real tiene.
- Sin evaluación publicada: no hay resultados en VQA-RAD, SLAKE, PathVQA ni ningún otro conjunto, por lo que no existe evidencia de que el modelo funcione mejor que un VLM generalista en tareas médicas.
- Riesgo elevado de alucinación clínica: los modelos de este tipo pueden describir hallazgos inexistentes o inventar términos diagnósticos; nunca debe usarse para decisión clínica sin supervisión de un profesional cualificado.
- No es un producto sanitario: no consta marcado CE, autorización FDA ni validación regulatoria de ningún tipo.
- Datos de entrenamiento desconocidos: no se documenta la procedencia de las imágenes ni si hubo eliminación de identificadores; existe riesgo de reproducción de información sensible si el corpus incluyó datos no anonimizados.
- Sesgos no medidos: sin información sobre la distribución demográfica, geográfica o de equipamiento del dataset, no se puede estimar el sesgo por subpoblación ni por tipo de dispositivo de imagen.
- Idiomas y contexto desconocidos: no se declara ni la ventana de contexto ni los idiomas soportados, lo que impide planificar conversaciones largas o despliegues multilingües.
- Falta de mantenimiento comunitario: 0 likes y 293 descargas indican una validación externa escasa; no hay garantía de soporte, actualizaciones ni corrección de errores.
- Formato único en safetensors: sin cuantizaciones publicadas, el despliegue en hardware modesto requiere conversión manual, con el consiguiente riesgo de errores en la configuración del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MohamedAhmedAE/llava-medical-3B-medsiglip-stage2
- No se han encontrado en la información proporcionada otros enlaces (paper, blog, repositorio de código o demo) asociados a este modelo.
