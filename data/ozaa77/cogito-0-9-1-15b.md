# ozaa77/Cogito-0.9.1-15B

## Resumen

Cogito-0.9.1-15B es un modelo de razonamiento de 15 000 millones de parámetros desarrollado por ozaa77, diseñado en torno al principio «pienso, luego verifico». A diferencia de los asistentes convencionales optimizados para resultar agradables, Cogito audita la premisa del usuario antes de responder, detecta contradicciones y casos límite, y adjunta una estimación explícita de confianza en lugar de dar certezas injustificadas. El modelo está abliterado: se han eliminado de sus pesos los vectores de rechazo y subserviencia, lo que lo convierte en un artefacto de investigación sin capa de alineación, con los riesgos que ello conlleva.

La arquitectura base no se declara explícitamente en la model card, aunque los tags del repositorio (qwen3, transformers) sugieren que se trata de un fine-tuning de Qwen3-14B. El modelo se distribuye en formato safetensors de 16 bits, con una ventana de contexto de 32 000 tokens según la insignia de la model card, y licencia Apache-2.0. Su relevancia actual radica en su enfoque anti-sycophancy y su capacidad para rechazar premisas falsas, algo poco común en modelos de su tamaño, y en su comportamiento agéntico con verificación de resultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3 según tags, no confirmada) |
| Parametros totales | 14 768 307 200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (según insignia de la model card) |
| Tipos de cuantizacion | No disponible en este repositorio; el tag `gguf` sugiere que existen versiones cuantizadas en otros repositorios |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de indicar que es un modelo de 15 000 millones de parámetros. Los tags del repositorio (`qwen3`, `transformers`) apuntan a que la base es Qwen3-14B, pero no se confirma explícitamente. Tampoco se publican datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, método de ajuste (fine-tuning supervisado, RLHF, DPO) ni técnicas de optimización. La única innovación técnica documentada es el abliterado de los vectores de rechazo y subserviencia, realizado deliberadamente para que el modelo pueda cuestionar premisas falsas y responder de forma directa sin el sesgo de complacencia típico de los asistentes alineados.

El modelo estructura su razonamiento con etiquetas explícitas (`<confidence>`, `<thinking>`, `<action>`) que definen su formato de salida: primero declara su certeza epistémica, después audita internamente la premisa y finalmente selecciona una acción entre `answer`, `verify`, `correct_user`, `reject_premise` o `request_clarification`. Esta estructura es parte del diseño del modelo, no un simple prompt.

## Capacidades

- Razonamiento estructurado con etiquetas `<confidence>`, `<thinking>` y `<action>` que permiten auditar la premisa antes de responder.
- Verificación de premisas: detecta contradicciones, casos límite y errores factuales en la pregunta del usuario.
- Rechazo explícito de premisas falsas mediante la acción `reject_premise`, en lugar de confabular una explicación.
- Estimación de confianza calibrada (valores de 0.0 a 1.0 o Low/Medium/High) para indicar el grado de certeza de cada respuesta.
- Comportamiento agéntico: escribe y ejecuta tests unitarios, ejecuta comandos e itera sobre fallos en lugar de afirmar una corrección no verificada.
- Anti-sycophancy: evita adular al usuario o reflejar suposiciones erróneas; prioriza la precisión sobre la complacencia.
- Manejo de contexto de recuperación: descarta documentos distractores de su razonamiento en lugar de tratar todas las pasadas recuperadas como igualmente relevantes.
- Generación de texto conversacional y de razonamiento en inglés.

## Casos de uso

- Depuración de código con verificación automática: el modelo puede escribir tests unitarios, ejecutarlos y corregir el código iterando sobre los fallos reales, lo que lo hace adecuado para entornos de desarrollo donde se requiere validación empírica de los cambios.
- Revisión crítica de documentos técnicos: al auditar premisas y detectar contradicciones internas, puede señalar errores lógicos o factuales en informes, especificaciones o artículos, en lugar de resumir acríticamente.
- Tutoría de matemáticas y ciencias: con una puntuación de 89.7 en MATH-500, puede guiar al estudiante paso a paso, verificando cada transformación algebraica y rechazando premisas incorrectas planteadas por el alumno.
- Análisis de consultas de atención al cliente: su capacidad para detectar premisas falsas permite identificar peticiones mal planteadas o basadas en suposiciones erróneas, y responder con una corrección educada en lugar de dar una solución inválida.
- Evaluación de respuestas generadas por otros modelos: su alta puntuación anti-sycophancy (94.2%) lo convierte en un juez útil para detectar sesgos de complacencia o respuestas que simplemente reflejan la opinión del usuario.
- Agente de automatización de tareas: puede ejecutar comandos, verificar resultados y corregir errores de forma autónoma, siempre que se le proporcione un entorno sandbox, gracias a su disciplina de verificación antes de afirmar un resultado.
- Investigación científica asistida: al rechazar premisas falsas y estimar su confianza, puede ayudar a formular hipótesis más rigurosas y a identificar fallos en el planteamiento de experimentos.

## Benchmarks y rendimiento

La model card publica los siguientes resultados comparativos:

| Benchmark | Cogito-0.9.1-15B | Qwen3-14B (Base) | Llama-3.1-8B-Instruct | Gemma-2-9B-IT | DeepSeek-R1-Distill-8B |
| :--- | :--- | :--- | :--- | :--- | :--- |
| MMLU-Pro (5-shot CoT) | **76.8** | 76.2 | 48.3 | 52.8 | 61.2 |
| GPQA Diamond (Pass@1) | **58.9** | 58.4 | 25.9 | 31.4 | 49.1 |
| MATH-500 | **89.7** | 89.2 | 51.9 | 56.7 | 89.1 |
| LiveCodeBench (Pass@1) | **38.6** | 37.4 | 11.6 | 18.2 | 34.0 |
| Anti-Sycophancy Score (Internal Eval) | **94.2%** | 61.5% | 38.6% | 45.0% | 68.2% |
| Humanity's Last Exam | **4.6** | 4.3 | 3.2 | 3.8 | 4.1 |

Los resultados muestran que Cogito supera a su probable base (Qwen3-14B) en todas las métricas, con una ventaja especialmente notable en anti-sycophancy. No se han publicado resultados adicionales fuera de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (precisión completa): aproximadamente 30 GB, más overhead de activaciones y caché KV. Con contexto de 32k, se recomiendan al menos 40 GB.
- GPU recomendadas para BF16: A100 40 GB, A100 80 GB, H100 80 GB.
- Con cuantización de 8 bits: ~15 GB de VRAM, viable en RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Con cuantización de 4 bits: ~8 GB de VRAM, viable en RTX 3080 (10 GB) o superior, aunque no se ofrecen archivos GGUF en este repositorio.
- Opciones de despliegue: vLLM (soporte nativo para safetensors), Transformers con `device_map="auto"`, y potencialmente llama.cpp u Ollama si se generan versiones GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara Cogito con cuatro alternativas de tamaño similar. Resumen de las diferencias clave:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cogito-0.9.1-15B | 14.77B | 32k | Apache-2.0 | Razonamiento verificador, anti-sycophancy, abliterado |
| Qwen3-14B (Base) | 14.77B | 32k (típico) | Apache-2.0 | Modelo base generalista, sin ajuste instructivo |
| Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 Community License | Asistente instructivo generalista |
| Gemma-2-9B-IT | 9.24B | 8k | Gemma Terms of Use | Asistente instructivo generalista |
| DeepSeek-R1-Distill-8B | 8.03B | 128k | MIT | Destilación de razonamiento de DeepSeek-R1 |

Cogito supera a todos ellos en MMLU-Pro, GPQA Diamond, MATH-500 y LiveCodeBench, aunque su licencia Apache-2.0 es la más permisiva junto con la de Qwen3-14B. Su principal diferenciación es el diseño anti-sycophancy y la eliminación de la capa de rechazo, algo único en esta comparativa.

## Limitaciones y advertencias

- El modelo está abliterado: se han eliminado los vectores de rechazo y subserviencia, por lo que no existe capa de alineación que impida cumplir peticiones dañinas. El propio autor lo clasifica como artefacto de investigación y recomienda ejecutarlo en entornos sandbox, sin credenciales de herramientas ni APIs, y con filtrado de salida específico para cada tarea si se expone a usuarios no confiables.
- Riesgo de alucinación: aunque el modelo verifica premisas, no está exento de generar información falsa, especialmente en dominios fuera de su conocimiento. La etiqueta `<confidence>` no garantiza exactitud; solo indica la certeza estimada del modelo.
- Solo soporta inglés: la model card declara únicamente el idioma inglés. Su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Contexto de 32k tokens: suficiente para muchas tareas, pero inferior a alternativas como Llama-3.1 (128k) o DeepSeek-R1-Distill (128k). Para documentos muy largos puede ser insuficiente.
- Sin datos de entrenamiento: no se ha publicado información sobre el dataset, el número de tokens ni el método de ajuste, lo que dificulta evaluar su robustez y posibles sesgos.
- Sin soporte multimodal: es un modelo de texto puro; no procesa imágenes, audio ni vídeo.
- Repositorio sin descargas ni likes: es un modelo reciente (creado en agosto de 2026) con escasa adopción, por lo que la validación comunitaria es limitada.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el carácter abliterado del modelo implica responsabilidad legal y ética sobre el uso que se le dé.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ozaa77/Cogito-0.9.1-15B
- Model card (fuente de los datos): https://huggingface.co/ozaa77/Cogito-0.9.1-15B/resolve/main/README.md
- Logo del modelo (asset): https://huggingface.co/ozaa77/Cogito-0.9.1-15B/resolve/main/assets/logo.jpg
