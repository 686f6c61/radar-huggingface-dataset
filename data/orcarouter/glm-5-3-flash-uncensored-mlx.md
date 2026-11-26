# orcarouter/GLM-5.3-Flash-Uncensored-MLX

## Resumen

GLM-5.3-Flash-Uncensored-MLX es una versión "abliterated" (sin las capas de rechazo alineadas) del modelo zai-org/GLM-5.3-Flash, convertida a formato MLX de 4 bits por el usuario orcarouter para su ejecución en Apple Silicon. Se trata de un modelo de lenguaje y visión con arquitectura Mixture-of-Experts (tag `moe`), orientado a conversación, razonamiento, function calling y red-teaming. El repositorio ocupa 780,7 GB y declara 341.119.860.542 parámetros totales en los pesos safetensors.

El modelo base pertenece a la familia GLM-5 de Zhipu AI (zai-org) y su nombre interno en los tags es `glm5_next`, con soporte declarado de Multi-Token Prediction (MTP) y modalidad image-text-to-text. La variante publicada aquí elimina los mecanismos de rechazo mediante técnicas de abliteration, lo que la hace atractiva para investigación en seguridad, pruebas de robustez y generación de contenido sin filtros, pero también la convierte en una opción inadecuada para despliegues de producción orientados al público general.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo frontera de gran escala (341B parámetros totales), una cuantización agresiva a 4 bits para hardware Apple, y una licencia MIT sobre una obra derivada de un modelo restringido. El acceso está limitado (gated) en Hugging Face y requiere aceptar condiciones, lo que condiciona su distribución y uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer con capacidades de visión y Multi-Token Prediction (MTP) |
| Parámetros totales | 341.119.860.542 (341,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MLX), safetensors cuantizados |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 4 bits) |
| Modalidad | image-text-to-text (visión-lenguaje) |
| Modelo base | zai-org/GLM-5.3-Flash |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 780,7 GB |
| Descargas / likes | 233 / 58 |
| Fecha de creación | 2026-08-31 |
| Última actualización | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible no detalla la configuración interna de la arquitectura más allá de las etiquetas del repositorio. Se sabe que se trata de un modelo Mixture-of-Experts (`moe`) con 341,1 mil millones de parámetros totales, capacidades de visión-lenguaje (`vision-language`, pipeline `image-text-to-text`) y soporte de Multi-Token Prediction (`mtp`), técnica que permite predecir varios tokens por paso de decodificación y que suele emplearse para acelerar la inferencia o como objetivo auxiliar de entrenamiento. El tag `glm5_next` sugiere que el modelo base pertenece a una generación posterior de la familia GLM-5.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación en el modelo base. La variante publicada aquí ha sido sometida a un proceso de abliteration que elimina o neutraliza las direcciones de activación asociadas al rechazo, y posteriormente cuantizada a 4 bits en formato MLX para su ejecución en Apple Silicon. No se especifican los detalles del proceso de cuantización (grupo de escala, calibración, etc.).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento (tag `reasoning`) y resolución de problemas de varios pasos.
- Comprensión de imágenes y texto combinados (image-text-to-text), con capacidad de responder preguntas sobre contenido visual.
- Function calling / tool calling (tag `function-calling`), lo que permite integrarlo en pipelines de agentes.
- Multi-Token Prediction (MTP) como mecanismo de aceleración de decodificación.
- Comportamiento sin filtros de rechazo (abliterated/uncensored), orientado a red-teaming y pruebas de seguridad (tags `ai-red-team`, `red-teaming`).
- Ejecución nativa en Apple Silicon mediante la librería MLX.
- Capacidades multilingües limitadas a inglés y chino según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo, al carecer de capas de rechazo, permite generar respuestas que un modelo alineado bloquearía, lo que resulta útil para construir conjuntos de pruebas adversarias y medir la robustez de clasificadores o filtros de contenido.
- Investigación en abliteration: sirve como caso de estudio para analizar qué capacidades se degradan y cuáles se preservan tras eliminar las direcciones de rechazo en un MoE de gran escala.
- Asistencia conversacional local en Mac: con cuantización 4 bits y MLX, puede desplegarse en equipos Apple Silicon de gama alta para prototipos de chat privados sin conexión a servicios en la nube.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos en inglés o chino.
- Automatización de tareas con function calling: integrable en agentes que invocan APIs externas, con la salvedad de que el comportamiento sin filtros exige validación adicional de las salidas antes de ejecutar acciones.
- Generación de contenido creativo sin restricciones temáticas: útil en entornos controlados de escritura, guionización o prototipado donde se necesita explorar ideas que los modelos alineados rechazan por defecto.
- Evaluación comparativa de cuantizaciones: al existir en formato MLX 4 bits, permite medir la pérdida de calidad frente al modelo base en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 780,7 GB, aunque la cuantización 4 bits reduce el peso efectivo de los pesos; el tamaño exacto de los archivos cuantizados no se detalla en la información proporcionada.
- VRAM/unified memory estimada: no disponible con precisión; un modelo MoE de 341B parámetros en 4 bits requiere del orden de cientos de gigabytes de memoria unificada, lo que en la práctica limita su ejecución a equipos Apple Silicon con memoria muy alta (Mac Studio con 192 GB o superior, o configuraciones con memoria ampliada), sin que se confirme que quepa íntegramente en dichas configuraciones.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4 y variantes Pro, Max y Ultra); no es compatible de forma nativa con CUDA.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB) ni en la mayoría de equipos Apple Silicon de gama de entrada.
- Opciones de despliegue: MLX (librería `mlx`), con posibles adaptaciones a `mlx-lm` para texto; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-MLX (este) | 341,1 B (MoE) | no disponible | texto + visión | MIT (derivada, acceso gated) | Hugging Face, gated |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | texto + visión | no disponible en la información | Hugging Face |
| Alternativas de la familia GLM-5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparación más directa es con el modelo base zai-org/GLM-5.3-Flash, del que esta versión deriva mediante abliteration y cuantización 4 bits MLX.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de las capas de rechazo implica que puede generar contenido dañino, ilegal o éticamente problemático sin advertencia; no es apto para aplicaciones de cara al público sin moderación externa.
- Sesgos: al no disponer de información sobre el dataset de entrenamiento, no es posible caracterizar los sesgos; se heredan los del modelo base, que no se documentan aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización a 4 bits puede incrementar la degradación en tareas de razonamiento y matemáticas.
- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Licencia: aunque el repositorio declara MIT, se trata de una obra derivada de un modelo base cuyo acceso está restringido y cuyas condiciones de uso deben respetarse; la licencia MIT del derivado no exime de las obligaciones del modelo original.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que puede limitar la redistribución y el uso automatizado.
- Compatibilidad: formato MLX exclusivo para Apple Silicon; no ejecutable en CUDA sin reconversión.
- Longitud de contexto y parámetros activos no disponibles, lo que impide estimar costes de inferencia y planificar despliegues con precisión.
- El tamaño del repositorio (780,7 GB) y la ausencia de benchmarks publicados dificultan la validación previa a su adopción en producción.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-MLX
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
