# sergolsub/mlx-drex-v1.5-8bit

## Resumen

`sergolsub/mlx-drex-v1.5-8bit` es una conversión a 8 bits en formato MLX del modelo `nace-ai/drex-v1.5`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: la model card indica explícitamente que la conversión solo aplica cuantización a 8 bits, sin reentrenamiento ni cambios de arquitectura, y que la licencia y las condiciones de uso se heredan de los pesos originales.

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones) según los metadatos de safetensors, y el repositorio ocupa 10,5 GB. La etiqueta `qwen3_5_text` presente en los tags de HuggingFace sugiere una arquitectura de la familia Qwen 3.5 en su variante de texto, aunque la información disponible no confirma detalles de arquitectura, contexto ni datos de entrenamiento del modelo base.

Su relevancia es acotada y muy específica: sirve para desplegar localmente un modelo de ~9B en un Mac con memoria unificada, con la ventaja de privacidad y ausencia de coste de API, pero con un nivel de documentación y validación muy bajo (0 descargas, 0 likes en el momento de la consulta) y sin resultados de benchmarks publicados. La ficha siguiente marca como "no disponible" todo aquello que la información proporcionada no permite verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5_text` apunta a la familia Qwen 3.5, variante texto; sin confirmar en la model card) |
| Parámetros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parámetros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | `other` — NACE AI OPEN RAIL-M LICENSE (MODIFIED); prevalece la licencia del repositorio upstream |
| Formato de pesos | safetensors con layout MLX (`*.safetensors`), más `config.json`, `tokenizer*` y `chat_template.jinja` |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base `nace-ai/drex-v1.5`, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. El único indicio arquitectónico es la etiqueta `qwen3_5_text` en los tags del repositorio, que sugiere una implementación de tipo transformer de la familia Qwen 3.5 en su variante exclusivamente de texto; se trata de una inferencia a partir de metadatos, no de un dato confirmado en la model card.

Lo que sí está documentado es el proceso de conversión: cuantización a 8 bits de los pesos originales para MLX, sin reentrenamiento ni modificaciones de arquitectura. El repositorio incluye además ficheros auxiliares de inferencia (`*_mlx.py`, `decision_config.json`, `joint_config.json`) descritos como "glue" para cabezas de decisión y conjuntas ("decision/joint-head"), lo que indica que el modelo base podría incorporar un modo de decisión con cabezas adicionales. No se detalla en qué consiste ese modo ni cómo se activa.

## Capacidades

- Generación de texto autoregresiva en local mediante `mlx_lm`; no hay documentación específica sobre calidad, estilo o dominio.
- Posible modo de decisión con cabezas dedicadas, a partir de los ficheros `decision_config.json` y `joint_config.json` incluidos en el repositorio; su funcionamiento no está documentado.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite formatear conversaciones multi-turno con el tokenizador del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio u otras modalidades: no disponibles; la etiqueta `qwen3_5_text` indica variante de texto.

## Casos de uso

- Prototipado local en Apple Silicon: cargar el modelo con `mlx_lm.load()` y `mlx_lm.generate()` para validar prompts y plantillas de chat antes de invertir en infraestructura GPU, aprovechando que los pesos en 8 bits caben en un Mac de gama alta con memoria unificada.
- Asistente de texto con privacidad estricta: al ejecutarse íntegramente en el equipo del usuario, es apto para procesar borradores, correos o documentación interna que no puede enviarse a una API externa.
- Generación y revisión de documentación técnica: redacción de borradores de README, comentarios de código o notas de release en un flujo offline, con revisión humana obligatoria dado que no hay benchmarks que avalen la calidad.
- Procesamiento por lotes de textos en local: clasificación o resumen de ficheros de texto en un pipeline de scripting sobre macOS, sin coste por token y sin dependencia de red.
- Evaluación comparativa de cuantizaciones: usar esta versión 8-bit como referencia frente al modelo base en bf16/fp16 para medir la degradación introducida por la cuantización en tareas concretas del dominio propio.
- Base para experimentación con cabezas de decisión: los ficheros `decision_config.json` y `joint_config.json` permiten explorar el modo de decisión del modelo original, siempre que se valide su comportamiento con datos propios.
- Entorno de pruebas para integración con `mlx_lm`: útil para desarrolladores que quieran comprobar compatibilidad de tokenizador, chat template y API de generación antes de adoptar el modelo base en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- Pesos en 8 bits: 8,95 mil millones de parámetros implican aproximadamente 8,95 GB de pesos teóricos; el repositorio completo ocupa 10,5 GB, incluyendo tokenizador y ficheros auxiliares.
- Memoria unificada recomendada en Apple Silicon: 16 GB como mínimo justo (pesos más caché KV y overhead del sistema), 24-32 GB para contextos largos o ejecución concurrente con otras aplicaciones.
- GPU NVIDIA: los pesos en layout MLX no se cargan directamente en CUDA; para ese hardware habría que usar el modelo base `nace-ai/drex-v1.5` con vLLM, TGI o llama.cpp.
- Cabe en GPU de consumo: sí, en el sentido de que un modelo de ~9B en 8 bits ocupa menos de 10 GB, pero esta conversión concreta está pensada para Apple Silicon, no para tarjetas gráficas.
- Opciones de despliegue: `mlx_lm` (vía oficial documentada en la model card). Otros runners (llama.cpp, Ollama, vLLM, TGI) requerirían conversión desde el modelo base, no están soportados por estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Benchmarks |
|---|---|---|---|---|---|
| `sergolsub/mlx-drex-v1.5-8bit` (este) | 8,95 mil millones | no disponible | safetensors MLX, 8 bits | OpenRAIL-M modificada | no disponibles |
| `nace-ai/drex-v1.5` (base) | no disponible | no disponible | no disponible | OpenRAIL-M modificada | no disponibles |
| Otras alternativas de ~8-9B (Qwen, Llama, Gemma) | no disponible en esta información | no disponible | no disponible | no disponible | no disponibles |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa con modelos de la misma categoría. La única comparación defendible es con el modelo base: misma arquitectura y mismos pesos, con pérdida de precisión por la cuantización a 8 bits y ganancia en huella de memoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, código o matemáticas, por lo que cualquier uso en producción exige una evaluación propia previa.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto, sesgos ni comportamientos esperados; el riesgo de alucinación es desconocido pero no puede descartarse en un modelo de esta escala sin evaluación.
- Idiomas no declarados: no hay garantía de rendimiento en castellano ni en ningún otro idioma concreto.
- Licencia restrictiva y poco habitual: NACE AI OPEN RAIL-M LICENSE (MODIFIED) con etiqueta `other`; las restricciones de uso comercial y los casos de uso prohibidos deben consultarse en el fichero `LICENSE` del repositorio, y en caso de conflicto prevalece la licencia del repositorio upstream.
- Conversión no auditada: el autor es un particular (sergolsub), el repositorio tiene 0 descargas y 0 likes, y no hay verificación independiente de que la cuantización preserve el comportamiento del modelo original.
- Fecha de creación anómala en los metadatos (2026-10-22), lo que impide situar la versión en una cronología fiable.
- Dependencia de ecosistema: requiere `mlx_lm` y hardware Apple Silicon; no es portable a CUDA sin recurrir al modelo base.
- Modo de decisión sin documentar: los ficheros `decision_config.json` y `joint_config.json` sugieren funcionalidad adicional cuyo contrato de entrada/salida no está especificado.
- Contexto desconocido: no se puede planificar un caso de uso con documentos largos sin determinar experimentalmente la ventana efectiva.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sergolsub/mlx-drex-v1.5-8bit
- Modelo base: https://huggingface.co/nace-ai/drex-v1.5
- Licencia del repositorio: https://huggingface.co/sergolsub/mlx-drex-v1.5-8bit/blob/main/LICENSE
- Librería citada en la model card (`mlx_lm`): https://github.com/ml-explore/mlx-lm
- Paper, blog o demo adicionales: no disponibles en la búsqueda web realizada (los resultados obtenidos no contenían información relacionada con el modelo).
