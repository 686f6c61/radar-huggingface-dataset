# SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit

## Resumen

SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit es una conversión a 4 bits en formato MLX del modelo meta-llama/Llama-Guard-3-1B, publicada por el usuario SirSahOl. No se trata de un entrenamiento nuevo, sino de una cuantización de los pesos originales de Meta al formato nativo de MLX, el framework de Apple para ejecutar inferencia sobre la GPU integrada de los chips Apple Silicon (familias M1 a M4). El repositorio ocupa 0,9 GB y los safetensors declaran 1.498.482.688 parámetros reales, aunque la model card del autor indica 1,0B.

El modelo base pertenece a la familia Llama Guard 3, cuyo uso previsto es la clasificación de seguridad de contenido, no la conversación general. Esta conversión hereda la licencia llama3.2 y el pipeline text-generation, y declara una ventana de contexto de 131.072 tokens. Al estar cuantizado a 4 bits (4,50 bits por peso de media), el autor estima una huella de memoria activa de ~0,9 GB y velocidades de decodificación de 183 a 549 tokens/s según el chip.

Su relevancia es acotada pero concreta: permite ejecutar localmente un clasificador de seguridad de ~1,5B parámetros con un consumo de memoria mínimo en equipos Mac, útil para filtrar contenido sin enviar datos a servicios en la nube. Como contrapartida, el repositorio está atado exclusivamente a MLX/Apple Silicon, no incluye ningún benchmark de calidad que mida el impacto de la cuantización y su model card lo presenta con ejemplos de asistente conversacional genérico que no se corresponden con el uso previsto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso) |
| Parametros totales | 1.498.482.688 (safetensors); la model card indica 1,0B |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (según la model card del autor) |
| Tipos de cuantizacion | 4 bits, 4,50 bits por peso de media; el mismo autor publica variantes de 8 y 16 bits |
| Idiomas soportados | no disponibles en la model card; los tags del repositorio listan en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Modelo base | meta-llama/Llama-Guard-3-1B (relación: quantized) |
| Autor de la conversión | SirSahOl |
| Tamaño del repositorio | 0,9 GB |
| Pipeline | text-generation |
| Huella de VRAM declarada | ~0,9 GB (mínimo recomendado: 8 GB de memoria unificada) |
| Descargas / likes | 13 / 0 |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo LlamaForCausalLM, en su variante densa de ~1,5B parámetros. Al ser una conversión de pesos y no un modelo entrenado, no existe información de entrenamiento propia de este repositorio: no se documentan tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas en el pipeline de inferencia (no se menciona decodificación especulativa, atención lineal ni mecanismos similares). La única transformación aplicada es una cuantización post-entrenamiento a 4 bits en el formato de MLX, con una media de 4,50 bits por peso, que reduce el tamaño en disco y en memoria a costa de una pérdida de precisión no cuantificada.

El modelo base fue desarrollado por Meta dentro de la familia Llama Guard 3, orientada a la moderación y clasificación de seguridad de contenido, y su model card oficial no forma parte de la información proporcionada. Cualquier afirmación sobre el dataset o el proceso de ajuste del modelo original queda, por tanto, como no disponible. La model card de esta conversión documenta únicamente detalles operativos: la plantilla de chat basada en tokens estilo ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_end|>`) y los tokens de parada recomendados (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`).

## Capacidades

- Generación de texto autorregresiva (pipeline declarado: text-generation).
- Conversación multi-turno mediante la plantilla de chat documentada por el autor, no mediante la plantilla de cabeceras que Meta publica para Llama Guard 3.
- Ventana de contexto larga: 131.072 tokens según la model card, aunque no se aportan pruebas de recuperación efectiva de información en contextos extensos.
- Capacidad multilingüe no verificada: los tags listan ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero la model card no detalla niveles de calidad por idioma.
- Clasificación de seguridad de contenido: es el uso previsto del modelo base Llama Guard 3, pero la model card de esta conversión no lo menciona ni documenta su taxonomía de categorías ni su formato de salida.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Filtrado previo de prompts en una aplicación de chat: situar el modelo delante de un LLM mayor para clasificar la entrada del usuario y bloquear solicitudes no permitidas antes de consumir tokens del modelo principal. El uso previsto del modelo base encaja con este escenario y la huella de ~0,9 GB permite mantenerlo cargado en paralelo al modelo generativo.
- Filtrado de respuestas generadas: ejecutar el clasificador sobre la salida de un LLM antes de mostrarla al usuario final, como capa adicional de control de contenido en productos sujetos a políticas internas.
- Moderación de comunidades y foros en local: desplegar el modelo en un Mac para revisar comentarios y publicaciones sin enviar el contenido de los usuarios a terceros, lo que simplifica el cumplimiento de requisitos de privacidad y protección de datos.
- Etiquetado por lotes de tickets de soporte o reseñas: procesar grandes volúmenes de texto y marcar automáticamente los casos que requieren revisión humana. Los 131.072 tokens de contexto declarados permiten agrupar varios elementos por petición, y el autor estima hasta ~549 tokens/s en chips Ultra para cargas concurrentes.
- Red-teaming y evaluación de seguridad: usar el modelo como clasificador auxiliar en pipelines de pruebas adversariales, comparando sus etiquetas con las de un revisor humano o con las de un modelo mayor para detectar discrepancias.
- Prototipado rápido en Mac: gracias a `mlx-lm`, se puede cargar y ejecutar el modelo con dos líneas de Python o desde la CLI, lo que lo hace adecuado para validar hipótesis antes de invertir en infraestructura con GPU dedicada.
- Asistente conversacional local (uso reclamado por el autor): la model card incluye ejemplos de chat general, como escribir un poema o explicar la superposición cuántica. Este caso se recoge tal cual aparece en la documentación, pero conviene tratarlo con cautela porque contradice el uso previsto del modelo base (véase la sección de limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, precisión de moderación o similares) en la información disponible. El autor solo aporta estimaciones de rendimiento en hardware Apple Silicon, que él mismo describe como proyecciones basadas en la saturación del ancho de banda de memoria, no como mediciones verificadas.

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1/M2/M3/M4 (base) | 8 GB | ~0,9 GB | ~183 tokens/s | ~16 ms | Asistente interactivo y completados rápidos en local |
| M1/M2/M3/M4 Pro | 18-36 GB | ~0,9 GB | ~274 tokens/s | ~11 ms | Uso diario con código, invocación de herramientas y chat multi-turno |
| M1/M2/M3/M4 Max | 36-128 GB | ~0,9 GB | ~393 tokens/s | ~7 ms | Generación de alto rendimiento y orquestación de agentes |
| M1/M2/M3/M4 Ultra | 64-192 GB | ~0,9 GB | ~549 tokens/s | ~4 ms | Concurrencia máxima y procesamiento por lotes en producción |

## Requisitos de hardware

- VRAM estimada: ~0,9 GB de memoria unificada activa para los pesos en 4 bits; el autor recomienda un mínimo de 8 GB de memoria unificada en el equipo.
- Espacio en disco: 0,9 GB para el repositorio (la variante de 8 bits ocupa ~1,5 GB y la de 16 bits ~2,8 GB).
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No hay soporte para CUDA ni para GPU de AMD o Intel en este repositorio.
- ¿Cabe en GPU de consumo? Sí, dentro del ecosistema Mac: cualquier equipo con 8 GB de memoria unificada puede cargarlo. No es ejecutable en una RTX 4090, A100 o H100 sin convertir previamente los pesos a otro formato.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, más API de Python con `load` y `generate`) y el runtime de MLX. La model card incluye además un `Modelfile` para Ollama, pero los pesos en formato MLX no son compatibles de forma nativa con Ollama, llama.cpp, vLLM ni TGI; los tags `text-generation-inference`, `endpoints_compatible` y `deploy:sagemaker` del repositorio no se corresponden con el formato publicado y deben verificarse antes de asumir cualquier despliegue en esas plataformas.
- Latencia y throughput: ver la tabla de la sección anterior (valores estimados por el autor, no medidos de forma independiente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit (este) | 1.498.482.688 | 131.072 tokens | MLX 4 bits (4,50 bits/peso) | ~0,9 GB | llama3.2 | Apple Silicon, vía mlx-lm |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit | mismo modelo base (cifra no indicada) | no disponible | MLX 8 bits | ~1,5 GB | llama3.2 | Apple Silicon; requiere 16 GB+ según el autor |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit | mismo modelo base (cifra no indicada) | no disponible | MLX 16 bits (sin cuantizar) | ~2,8 GB | llama3.2 | Apple Silicon; requiere 32 GB+ según el autor |
| meta-llama/Llama-Guard-3-1B (modelo base) | no disponible en la información proporcionada | no disponible | safetensors originales de Meta | no disponible | llama3.2 | HuggingFace, pesos originales |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a alternativas de otros fabricantes (por ejemplo, clasificadores de seguridad de tamaño similar). La comparación se limita a tamaño, formato y requisitos de hardware.

## Limitaciones y advertencias

- Posible inadecuación de uso: la model card presenta el modelo como un asistente conversacional de propósito general, con ejemplos como escribir poesía o explicar conceptos, pero el modelo base Llama Guard 3 está diseñado para clasificar contenido y no para generar respuestas abiertas. Usarlo como chatbot puede producir salidas poco útiles o incoherentes.
- Plantilla de chat no alineada: la plantilla documentada usa tokens estilo ChatML (`<|im_start|>`), que no coinciden con el formato de cabeceras que Meta publica para Llama Guard 3. No se aporta ninguna evaluación que demuestre que el modelo funciona correctamente con esa plantilla ni que emita el formato de clasificación esperado.
- Ausencia total de métricas: no hay benchmarks de calidad, de precisión en moderación ni de degradación por cuantización. No se puede afirmar que el comportamiento en 4 bits sea equivalente al del modelo original.
- Inconsistencia en el recuento de parámetros: la model card indica 1,0B mientras que los safetensors declaran 1.498.482.688 parámetros. Conviene usar la cifra real para dimensionar el hardware.
- Riesgo de alucinación: se trata de un modelo de ~1,5B parámetros cuantizado a 4 bits, por lo que la probabilidad de generar contenido incorrecto o inventado es alta en tareas generativas.
- Limitaciones de idioma no verificadas: los ocho idiomas figuran solo en los tags, sin datos de calidad por idioma ni evaluación de sesgo lingüístico.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad diferencial por grupo demográfico ni comportamiento en dominios sensibles. Un clasificador de seguridad mal calibrado puede producir tanto falsos positivos que censuren contenido legítimo como falsos negativos que dejen pasar contenido dañino.
- No debe usarse como único sistema de moderación: al no existir métricas publicadas, en un entorno de producción es recomendable combinarlo con revisión humana o con un clasificador de mayor tamaño.
- Restricciones de licencia: la licencia llama3.2 impone las condiciones de uso de Meta (política de uso aceptable, obligaciones de atribución y mención de "Built with Llama", y límites para productos con más de 700 millones de usuarios mensuales). Es necesario revisar el texto completo antes de un uso comercial.
- Portabilidad limitada: el formato MLX ata el modelo a hardware Apple Silicon. No es directamente utilizable en servidores con GPU NVIDIA o AMD, lo que dificulta migrar la misma pieza a infraestructura en la nube.
- Madurez del repositorio: 13 descargas, 0 likes, autor individual y fechas de creación y actualización idénticas (2026-09-22). No hay validación por parte de la comunidad ni señales de mantenimiento.
- Documentación truncada: el README disponible se corta en el bloque de ejemplo de Ollama (`ollama run llama-`), por lo que pueden faltar instrucciones o advertencias del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Variante de 8 bits del mismo autor: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit
- Variante de 16 bits del mismo autor: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Artículos referenciados en los tags del repositorio (los títulos no están disponibles en la información proporcionada): arXiv:2404.12241, arXiv:2312.06674, arXiv:2204.05862, arXiv:2308.01263, arXiv:2403.03853
- Búsqueda web realizada: no se ha recuperado ningún resultado relevante; los enlaces devueltos correspondían a la red social Threads (threads.com, threads.com/login, play.google.com/store/apps/details?id=com.instagram.barcelona) y a la entrada de Wikipedia sobre dicha aplicación, sin relación alguna con el modelo.
