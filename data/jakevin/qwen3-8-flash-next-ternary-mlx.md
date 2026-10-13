# Jakevin/Qwen3.8-Flash-Next-ternary-mlx

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un checkpoint cuantizado en precisión mixta del modelo multimodal Qwen3.8-Flash-Next, publicado por el usuario Jakevin bajo el identificador Jakevin/Qwen3.8-Flash-Next-ternary-mlx. El punto de partida son los pesos oficiales en FP8 de Qwen y el resultado es una mezcla de matrices ternarias (unos 1,85 bits con una escala por cada 64 pesos) y matrices afines de 2, 3 y 4 bits, que se ejecutan mediante el runtime mlx-ternary sobre Apple Silicon.

El atractivo de la propuesta es el ahorro de almacenamiento y de ancho de banda de memoria: el repositorio ocupa 40,8 GB y el script de generación mantiene la memoria activa (RSS más Metal) por debajo de 20 GB, con la caché de MLX limitada a 2 GB. El precio es una pérdida medible de calidad frente a la referencia FP8: una divergencia KL de 0,167 nats por token en next-token prediction y una puntuación de 149 sobre 216 preguntas de opción múltiple, frente a 162 de una cuantización ISTA de 2 bits.

Es relevante ahora porque Qwen3.8-Flash-Next es la vista previa de la arquitectura Qwen4 (MoE multimodal con Gated DeltaNet híbrido y atención con puertas) y porque demuestra una vía poco habitual de despliegue local en Mac: expertos leídos desde disco y decodificación parcialmente ternaria, sin necesidad de GPU NVIDIA. Ahora bien, se trata de una publicación comunitaria con cero descargas y sin mediciones de velocidad publicadas todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal del modelo base (arquitectura qwen4_exp, con Gated DeltaNet + Gated Attention según la información pública del modelo original); el checkpoint es una cuantización de precisión mixta, no una arquitectura nueva |
| Parametros totales | No disponible en la ficha del repositorio. Fuentes externas sobre el modelo base mencionan "180B en disco y 6B activos" (cifra no verificada en la model card) |
| Parametros activos | No disponible en la ficha del repositorio; fuentes externas citan 6B activos para el modelo base |
| Longitud de contexto | No disponible en la ficha del repositorio; un despliegue de terceros del modelo base anuncia 262.144 tokens |
| Tipos de cuantizacion | Mixta: ternaria (~1,85 bits, una escala por cada 64 pesos) en 117 unidades; afín de 4 bits grupo 64 en 92 unidades; afín de 3 bits grupo 64 en 62 unidades; afín de 2 bits grupo 64 en 17 unidades; routers cuantizados a afín de 8 bits en carga; embedding y lm_head en afín de 8 bits (skeleton.safetensors) |
| Idiomas soportados | No disponible en la ficha del repositorio (el modelo base Qwen declara soporte multilingüe, pero no se detalla aquí) |
| Licencia | Qwen Community License 1.0 (se incluyen LICENSE y NOTICE) |
| Formato de pesos | MLX: directorios L00 a L47 con codes.bin, scales.bf16, bias.bf16 e index.json, más skeleton.safetensors. Códigos ternarios empaquetados a cinco trits base-3 por byte; códigos afines en el empaquetado uint32 de MLX |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el repositorio es una receta de cuantización aplicada sobre Qwen/Qwen3.8-Flash-Next-FP8. La estructura descrita es de 288 unidades repartidas en 48 capas; en cada capa se cuantizan el bloque de atención, el experto compartido y cuatro bandas de expertos enrutados. De esas 288 unidades, 117 son ternarias, 92 son afines de 4 bits, 62 afines de 3 bits y 17 afines de 2 bits, siempre con grupo 64.

El detalle técnico interesante está en el formato y en el runtime. Los códigos ternarios se almacenan a cinco trits por byte y el cargador los desempaqueta a los cuatro códigos de 2 bits por byte que espera el kernel v3 de mlx-ternary; los códigos afines permanecen en el empaquetado uint32 nativo de MLX. El repositorio no incluye los programas de asignación de bits, calibración ni cálculo de KL, y la generación de texto requiere además el checkpoint FP8 oficial para los tensores que no se cuantizaron: normas, hiperconexiones, tablas PLE y routers. La cuantización es puramente post-entrenamiento; no se documenta RLHF, DPO ni ajuste adicional.

## Capacidades

- Hereda las capacidades del modelo base Qwen3.8-Flash-Next: generación de texto, razonamiento, matemáticas y código, con calidad degradada por la cuantización agresiva.
- Capacidades multimodales (imagen y vídeo) según la documentación pública del modelo base; el repositorio no describe ni valida el pipeline de visión en esta cuantización.
- Soporte de function calling y tool calling según las etiquetas públicas del modelo base.
- Arquitectura MoE, por lo que solo una fracción de los parámetros se activa por token.
- El runtime lee todos los expertos enrutados desde los ficheros de capa, lo que permite inferencia con huella de memoria reducida a costa de E/S de disco.
- No se documentan modos de pensamiento explícitos, soporte de audio ni capacidades de agente en la model card de esta cuantización.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el script de referencia mantiene RSS más memoria activa de Metal por debajo de 20 GB y limita la caché de MLX a 2 GB, lo que permite ejecutar un MoE grande en equipos Apple Silicon que no podrían alojar los pesos FP8 en memoria.
- Experimentación con cuantización ternaria: los kernels v3 de mlx-ternary permiten medir en la práctica el impacto de asignar 1,85 bits a bloques de atención, expertos compartidos y bandas de expertos enrutados.
- Validación de divergencia respecto a FP8: la métrica de KL de 0,167 nats por token es directamente reproducible sobre texto retenido y sirve para comparar metodologías de cuantización (por ejemplo, frente a ISTA 2 bits con 0,217).
- Prototipado de asistentes de texto con contexto largo: al heredar la ventana de contexto del modelo base (262.144 tokens según despliegues de terceros), es adecuado para pruebas de resumen y diálogo multi-turno en local, asumiendo la pérdida de precisión.
- Investigación en compresión de modelos: el desglose de 117/92/62/17 unidades por anchura de bits es un caso de estudio para estudiar asignaciones de precisión por bloque.
- Pruebas de rendimiento en almacenamiento: al leer los expertos enrutados desde disco en cada paso, el modelo sirve para caracterizar el cuello de botella de E/S frente al cómputo en GPU en cargas MoE.
- Evaluación académica con conjuntos de opción múltiple: el propio autor usa un conjunto de 216 preguntas para comparar asignaciones de bits, un protocolo replicable con poco coste.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL de next-token frente a la referencia FP8 (texto retenido) | 0,167 nats/token |
| Divergencia KL de la alternativa ISTA 2 bits sobre el mismo texto | 0,217 nats/token |
| Conjunto de opción múltiple de 216 preguntas (esta mezcla) | 149 aciertos (aproximadamente 69,0%) |
| Conjunto de opción múltiple de 216 preguntas (ISTA 2 bits) | 162 aciertos (75,0%) |
| Conjunto de opción múltiple (asignación totalmente ternaria de las 288 unidades) | Aproximadamente el 57% de la puntuación FP8 oficial |
| Tokens por segundo | No disponible: el autor indica que se añadirán más adelante las mediciones del kernel v3 de mlx-ternary, separando lectura de SSD y cómputo de GPU |

El propio autor advierte que el ruido del conjunto de 216 preguntas es elevado: una sola pregunta desplaza la tasa alrededor de medio punto porcentual, por lo que la diferencia entre 149 y 162 no constituye una clasificación estable.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX. No hay soporte CUDA, ROCm ni Vulkan.
- Memoria: el proceso de generación mantiene RSS más memoria activa de Metal por debajo de 20 GB, con la caché de MLX limitada a 2 GB.
- Almacenamiento: 40,8 GB para este checkpoint, más una copia local de Qwen/Qwen3.8-Flash-Next-FP8 para los tensores no cuantizados (tamaño del checkpoint FP8 no disponible en la información proporcionada).
- GPU recomendadas: no aplica en el sentido habitual; se requiere un Mac con Apple Silicon y memoria unificada suficiente. Para el modelo base sin cuantizar, una guía externa recomienda equipos con 96-128 GB de memoria unificada y desaconseja tarjetas de 24 GB.
- Despliegue: el procedimiento documentado usa el Python de oMLX (que aporta MLX, mlx-vlm y el parche qwen4_exp), un entorno virtual propio y mlx-ternary instalado desde el repositorio de GitHub. Los scripts incluidos son generate.py con las opciones --fp8, --max-tokens y --self-check.
- No se contemplan vLLM, llama.cpp, Ollama ni TGI para este checkpoint, dado que el kernel ternario es específico de mlx-ternary.
- Latencia y throughput: no disponibles; el autor indica que las mediciones de tokens por segundo se añadirán más adelante.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jakevin/Qwen3.8-Flash-Next-ternary-mlx | Cuantización MLX de precisión mixta (ternaria + afín 2/3/4 bits) | 117 unidades ternarias, 92 de 4 bits, 62 de 3 bits, 17 de 2 bits | No disponible en la ficha | Qwen Community License 1.0 | 0 descargas, 0 likes |
| TensorFold/Qwen3.8-Flash-Next-MLX-oQ6-MTP | Cuantización MLX de 6 bits con decodificación especulativa MTP | 6 bits | No disponible en la información recogida | Qwen Community License 1.0 | 3 likes |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX | Cuantización MLX de 4 bits, variante ablacionada (sin censura) | 4 bits | No disponible en la información recogida | Apache 2.0 | 1,59 mil descargas |
| ISTA 2 bits (referencia citada por el autor) | Cuantización de 2 bits | 2 bits | No disponible | No disponible | No disponible |

La ventaja declarada de esta versión es el menor tamaño por peso (aproximadamente 1,85 bits en 117 de las 288 unidades) frente a alternativas de 4 y 6 bits, a cambio de una calidad inferior: 149 frente a 162 aciertos en el conjunto de 216 preguntas para el caso de 2 bits, y en torno al 57% de la puntuación FP8 en el escenario totalmente ternario.

## Limitaciones y advertencias

- Pérdida de calidad medible: 0,167 nats/token de KL frente a FP8 y 149/216 en opción múltiple, con un ranking frente a ISTA 2 bits que el propio autor califica de no estable por el ruido del conjunto.
- El escenario de referencia totalmente ternario (las 288 unidades en ternario) conserva solo alrededor del 57% de la puntuación FP8, lo que da una idea del suelo de degradación de la técnica.
- Dependencia externa obligatoria: hace falta el checkpoint FP8 oficial para normas, hiperconexiones, tablas PLE y routers, de modo que no es un artefacto autónomo.
- El repositorio no incluye los programas de asignación, calibración ni cálculo de KL, por lo que la metodología no es reproducible a partir de lo publicado.
- Solo funciona en Apple Silicon con MLX y un kernel específico (mlx-ternary v3); no es desplegable en infraestructura NVIDIA ni en servidores x86 convencionales.
- No hay mediciones de tokens por segundo ni de latencia, así que no es posible planificar capacidad de producción con datos publicados.
- La arquitectura qwen4_exp procede de una compilación concreta de mlx-vlm incluida en oMLX, lo que añade acoplamiento a una versión concreta del stack.
- Licencia Qwen Community License 1.0, con condiciones específicas para uso comercial; conviene revisar LICENSE y NOTICE antes de cualquier despliegue comercial.
- Riesgo de alucinación y sesgos heredados del modelo base, presumiblemente agravados por la cuantización agresiva; no se documentan evaluaciones de sesgo ni de seguridad.
- Publicación sin validación comunitaria: cero descargas y cero likes, creada y actualizada en octubre de 2026.
- No se especifican los idiomas soportados en esta cuantización, aunque el modelo base es multilingüe.
- El rendimiento depende en gran medida del almacenamiento, porque el runtime lee todos los expertos enrutados desde los ficheros de capa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx
- Runtime mlx-ternary en GitHub: https://github.com/Jakevin/mlx-ternary
- Runtime mlx-ternary en Hugging Face: https://huggingface.co/Jakevin/mlx-ternary
- Pesos FP8 de referencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- README oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Cuantización de 6 bits de TensorFold: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-MLX-oQ6-MTP
- Cuantización de 4 bits ablacionada: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX
- Despliegue en un único DGX Spark: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark-TensorFold
- Guía de hardware para despliegue local: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
