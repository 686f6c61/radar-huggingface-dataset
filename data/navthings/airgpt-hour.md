# navthings/airgpt-hour

## Resumen

airgpt-hour es un modelo de lenguaje de aproximadamente 8 millones de parámetros (7.999.744 exactos, según los pesos en safetensors) entrenado desde cero por el autor navthings. Se trata de un experimento de entrenamiento exprés: el autor lo entrenó en una hora en un MacBook Air con chip M5, 16 GB de memoria y sin ventilador, usando su propio framework airgpt, publicado en GitHub. El modelo está orientado a generar microrrelatos breves al estilo TinyStories y a responder saludos, no a mantener conversaciones generales.

El repositorio distribuye dos conjuntos de pesos: model.safetensors, que corresponde al modelo tras el ajuste conversacional, y base.safetensors, que es el modelo base previo a ese ajuste. El preentrenamiento consumió 55 millones de tokens procedentes de TinyStories y Cosmopedia, seguidos de una fase de ajuste con conversaciones cortas de everyday-conversations y smol-smoltalk. La pérdida de validación reportada es de 2,27 en preentrenamiento y 2,28 en la fase de chat.

Su interés es fundamentalmente educativo y de investigación: demuestra que se puede entrenar un modelo funcional a escala de juguete con hardware de consumo y en un tiempo muy reducido. No se han publicado datos de arquitectura, longitud de contexto ni benchmarks, y la búsqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo (solo resultados sobre rugby union).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card (entrenamiento from-scratch con el framework airgpt) |
| Parametros totales | 7.999.744 (~8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican sin cuantizar en safetensors (MLX permite cuantización, pero no se documenta ninguna variante) |
| Idiomas soportados | No declarados en los metadatos; los corpus de entrenamiento (TinyStories, Cosmopedia, everyday-conversations, smol-smoltalk) son predominantemente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); dos ficheros: model.safetensors (chat) y base.safetensors (base) |
| Libreria de inferencia | mlx |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: solo indica que se entrenó desde cero con el framework airgpt sobre MLX. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, el tokenizador ni el tipo de atención empleado. Dado que el objetivo declarado es imitar el comportamiento de los modelos TinyStories, es habitual en esa familia usar transformadores decoder-only de tamaño reducido, pero esta ficha no puede confirmarlo con la información disponible.

El entrenamiento consta de dos fases. La primera es un preentrenamiento con 55 millones de tokens mezclados de TinyStories y Cosmopedia, que da lugar al modelo base. La segunda es un ajuste supervisado sobre conversaciones cortas extraídas de everyday-conversations y smol-smoltalk, que produce el modelo de chat. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación por preferencias, ni innovaciones técnicas como decodificación especulativa o atención lineal. Las pérdidas de validación reportadas son 2,27 (preentrenamiento) y 2,28 (chat).

## Capacidades

- Generación de texto breve en estilo TinyStories: microrrelatos cortos con vocabulario y sintaxis sencillos.
- Respuesta a saludos y a intercambios conversacionales muy cortos, según el propio autor.
- Modo base disponible: con la opción `--base`, el modelo se limita a continuar el texto introducido, sin formato de diálogo.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o planificación.
- No se documentan capacidades de código, matemáticas, visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe no documentada; el entrenamiento se apoya en corpus en inglés.
- El autor advierte explícitamente de que el modelo no puede conversar más allá de intercambios triviales e inventa hechos.

## Casos de uso

- Docencia sobre el ciclo de vida de un LLM: permite mostrar en un portátil las fases de tokenización, preentrenamiento y ajuste supervisado con un modelo cuyo entrenamiento completo cabe en una hora, algo inviable con modelos de escala real.
- Experimentación con el stack MLX en Apple Silicon: sirve para validar instalaciones de MLX, medir latencia y consumo de memoria en un modelo mínimo antes de pasar a modelos mayores.
- Pruebas de integración y CI: al ocupar menos de 0,1 GB, puede usarse como modelo de juguete en pipelines de integración continua que verifiquen carga de pesos, tokenización y formato de respuestas sin consumir GPU.
- Prototipado de interfaces de chat: permite validar la experiencia de usuario de un chatbot (turnos, streaming, gestión de historial) con un backend trivial antes de conectar un modelo de producción.
- Generación de microrrelatos sintéticos: útil para aumentar datos de pruebas en proyectos de generación creativa o para ejercicios de anotación con texto sencillo y controlado.
- Talleres de fine-tuning: su modelo base de 8 M y su pérdida de validación documentada lo convierten en un banco de pruebas asequible para enseñar ajuste supervisado y comparar hiperparámetros.
- Investigación sobre modelos pequeños y datos sintéticos: encaja en estudios de reproducibilidad sobre currículos de entrenamiento tipo TinyStories y sobre el efecto de mezclar corpus sintéticos con conversaciones reales.
- Inferencia en dispositivos muy limitados: por tamaño (del orden de decenas de megabytes en coma flotante de 32 bits) podría ejecutarse en CPU o en hardware embebido, siempre que se adapte el runtime fuera de MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Metrica | Valor |
|---|---|
| Perdida de validacion (preentrenamiento) | 2,27 |
| Perdida de validacion (chat) | 2,28 |

No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluación estandarizada, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 7.999.744 parámetros, sin incluir overhead del runtime): unos 32 MB en fp32, unos 16 MB en fp16/bf16, unos 8 MB en int8 y unos 4 MB en int4. En cualquier configuración realista, por debajo de 100 MB contando activaciones y caché KV.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, desde una GTX 1050 hasta una H100. Usar A100 o H100 sería un sobredimensionamiento absoluto.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en CPU y en dispositivos móviles.
- Hardware de referencia del autor: MacBook Air con chip M5, 16 GB de memoria unificada y sin ventilador, entrenado en una hora.
- Opciones de despliegue: el repositorio airgpt incluye `chat.py` para MLX (requiere Apple Silicon). No se distribuyen pesos en GGUF ni integraciones con vLLM, TGI, Ollama o llama.cpp; usarlos exigiría una conversión previa no documentada.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de generación.

## Comparativa con modelos similares

La comparación siguiente es orientativa y se basa en conocimiento general sobre modelos de la misma familia y escala, no en datos publicados en la información proporcionada; conviene verificar cada cifra en la fuente original antes de citarla.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| navthings/airgpt-hour | ~8 M | No disponible | MIT | HuggingFace (MLX, safetensors) |
| TinyStories (Microsoft Research) | Variantes de ~1 M a ~33 M | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| llama2.c (Karpathy), variante stories | Del orden de 15 M a 110 M | No disponible en esta ficha | No disponible en esta ficha | GitHub y HuggingFace |

El rasgo diferencial de airgpt-hour frente a estas alternativas es la combinación de licencia MIT, publicación de dos checkpoints (base y chat) y un coste de entrenamiento documentado de una hora en un portátil.

## Limitaciones y advertencias

- El propio autor indica que el modelo no puede mantener una conversación real más allá de saludos y frases cortas.
- Alucinación: el autor advierte explícitamente de que el modelo inventa hechos.
- Idioma: no hay soporte multilingüe documentado; el entrenamiento se apoya en corpus en inglés.
- Longitud de contexto no documentada, lo que impide planificar usos que dependan de ventanas largas.
- Ausencia total de benchmarks: no es posible comparar su calidad de forma objetiva con otros modelos.
- No se documentan medidas de alineación, filtrado de seguridad ni evaluación de sesgos; existe riesgo de generar contenido inapropiado.
- La licencia del modelo es MIT, pero las licencias de los corpus de entrenamiento (TinyStories, Cosmopedia, everyday-conversations y smol-smoltalk) no se detallan y deben verificarse por separado antes de un uso comercial.
- Dependencia del ecosistema MLX y de Apple Silicon para el flujo de inferencia incluido en el repositorio.
- Adopción prácticamente nula (0 descargas, 1 like en el momento de la consulta), sin validación externa por parte de la comunidad.
- Las pérdidas de validación de 2,27 y 2,28 corresponden a un modelo de escala de juguete; no deben interpretarse como indicadores de calidad equiparables a métricas de modelos de gran tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/navthings/airgpt-hour
- Repositorio del framework airgpt: https://github.com/navthings/airgpt
- La búsqueda web realizada no ha devuelto ningún enlace relacionado con el modelo; los resultados obtenidos corresponden a páginas sobre rugby union y no se incluyen.
