# Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx

## Resumen

Qwopus3.8-27B-Flash-V2 · bf16recurrence-only es una conversión experimental al ecosistema MLX del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario Shiftedx. No se trata de un modelo entrenado desde cero, sino de una variante de control de precisión: cuantiza el bloque de texto en 4 bits afín con grupo de 32, pero mantiene en BF16 96 proyecciones recurrentes de entrada, 333 tensores de visión heredados del modelo padre y un sidecar nativo de MTP (multi-token prediction) de 15 tensores. El resultado pesa 27.356.728.560 parámetros (unos 27,36 mil millones) repartidos en 17,339 GiB de ficheros de pesos.

La relevancia del modelo es doble. Por un lado, es uno de los pocos artefactos públicos que empaqueta en un solo paquete MLX las tres capacidades del modelo base: generación de texto, entrada de imagen (pipeline image-text-to-text) y decodificación especulativa mediante MTP nativo. Por otro, el autor lo presenta explícitamente como un control no cualificado: no reclama ninguna ventaja medida de calidad ni de velocidad, y documenta fallos conocidos de indentación en Python que también reproduce el padre en BF16.

Se distribuye bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y está pensado para ejecutarse exclusivamente sobre Apple Silicon mediante MTPLX 2.11.2 (construido con MLX 0.32.2 y MLX-LM 0.31.3). No hay versión GGUF ni soporte CUDA declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada explícitamente. El backend de MTPLX indicado es `qwen3_next` y la variante conserva proyecciones recurrentes de entrada, lo que apunta a una arquitectura híbrida de atención y capas recurrentes; no confirmado en la model card |
| Parametros totales | 27.356.728.560 (27,36 B), dato real de los safetensors |
| Parametros activos | No disponible (no se declara si es MoE) |
| Longitud de contexto | No disponible (el autor indica que no reclama máxima contexto ni cualificación cruzada entre runtimes) |
| Tipos de cuantizacion | Texto en 4 bits afín con grupo 32; 96 proyecciones recurrentes de entrada retenidas en BF16; 333 tensores de visión en BF16; sidecar MTP nativo en BF16 de 15 tensores. No es un modelo íntegramente BF16 pese al nombre de la variante |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), 17,339 GiB en ficheros de pesos; repo completo de 18,6 GB |
| Libreria / runtime | MLX (MLX 0.32.2 / MLX-LM 0.31.3), empaquetado para MTPLX 2.11.2 |
| Pipeline | image-text-to-text |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2, revisión fijada `13f92e09a46fa364f8de1edb85684d57bda01126`, relación `quantized` |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento: este artefacto es una conversión y cuantización, no un modelo entrenado. El autor no documenta número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Lo único verificable es que deriva del checkpoint Jackrong/Qwopus3.8-27B-Flash-V2, fijado a una revisión concreta, y que la variante se etiqueta como "sin abliteración" y como "separate V2 release".

La innovación técnica del paquete está en el layout de precisión y en el empaquetado multimodal. La cuantización afín de 4 bits con grupo 32 se aplica al bloque de texto, pero se retienen en BF16 las 96 proyecciones recurrentes de entrada, presumiblemente porque son sensibles a la cuantización en arquitecturas con estado recurrente. El paquete añade además 333 tensores de visión en BF16 del mismo padre y un sidecar MTP nativo de 15 tensores, que habilita decodificación multi-token especulativa con `--generation-mode mtp --depth 3`. El autor indica que la profundidad 3 solo se ejercitó sobre la variante Attention8, no sobre esta. El layout exacto por módulo queda registrado en `config.json` y los hashes en `SHA256SUMS`.

Un cálculo rápido de coherencia: 27,36 B de parámetros en 4 bits puros darían unos 13,7 GB, mientras que los pesos reales ocupan 17,339 GiB; la diferencia de unos 3,6 GiB es consistente con los tensores retenidos en BF16 (proyecciones recurrentes, visión y MTP).

## Capacidades

- Generación de texto conversacional en formato multi-turno, con plantilla de chat y tokenizador preservados del modelo base.
- Modo de razonamiento explícito: el autor recomienda activar `enable_thinking=true` y `reasoning_effort="xhigh"` en los controles de plantilla o API; el runtime admite `--reasoning-mode on --reasoning-effort xhigh`.
- Entrada de imagen: pipeline image-text-to-text, con procesador de imagen incluido (metadatos planos que replican la configuración de origen) y 333 tensores de visión en BF16.
- Decodificación especulativa mediante MTP nativo (`--generation-mode mtp --depth 3`), solo ejercitada en la variante Attention8 según el autor.
- Generación de código: el autor recomienda bajar la temperatura a 0,3 para tareas de programación, frente al 1,0 por defecto de la configuración de generación heredada. No obstante, se documentan fallos de indentación en Python.
- No se declara soporte de tool calling, function calling, uso de agentes ni multi-step reasoning en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de cuantización en Apple Silicon: la variante sirve como control de precisión para comparar, sobre el mismo hardware, el efecto de retener ciertas proyecciones en BF16 frente a cuantizarlas. Es su propósito declarado por el autor.
- Prototipado local de asistentes multimodales: al aceptar image-text-to-text en un único paquete MLX, permite construir demos de descripción de imágenes o preguntas sobre capturas sin depender de servicios en la nube.
- Experimentación con decodificación especulativa: el sidecar MTP de 15 tensores permite medir la ganancia de generar varios tokens por paso en Macs con memoria unificada, siempre que se asuma que la profundidad 3 no está validada en esta variante concreta.
- Investigación sobre fallos de formato en código: dado que el autor documenta un fallo reproducible de indentación en Python, el modelo es útil como caso de estudio para analizar defectos de formato en la decodificación, no como generador de código de producción.
- Pruebas de razonamiento extendido: el modo thinking con esfuerzo `xhigh` permite experimentar con cadenas de razonamiento largas en tareas de matemáticas o lógica, sin garantía de calidad medida.
- Sustitución de un modelo base pesado en memoria: con 17,339 GiB de pesos, es viable en equipos Apple de gama alta donde un BF16 de 27 B no cabría con holgura.
- Referencia para conversión de otros checkpoints: la estructura de `config.json`, `SHA256SUMS` y el sidecar MTP sirve de plantilla para replicar el proceso en modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no presenta ninguna tabla de clasificación ni reclamación de velocidad, y que el artefacto no ha completado la cualificación de comportamiento, visión ni MTP. El único dato cualitativo es la mención de un fallo controlado de indentación en Python que también se reproduce en el padre BF16 cargado con MLX-LM estándar, misma semilla y mismos ajustes de muestreo recomendados; el autor aclara que esto no establece una tasa de fallo universal ni descarta comportamiento específico de MLX.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 17,339 GiB y el autor advierte de que la memoria en tiempo de ejecución es superior. Como estimación prudente, se necesitan al menos 20-24 GB de memoria unificada para inferencia con contexto corto, y 32 GB o más para trabajar con comodidad.
- GPU: no aplica. El paquete está construido para MLX y Apple Silicon. No hay ruta de despliegue CUDA declarada.
- Cabe en GPU de consumo (RTX 4090, etc.): no disponible, el modelo no está empaquetado para CUDA y no existe versión GGUF.
- Equipos Apple recomendados: cualquier Mac con Apple Silicon y 32 GB de memoria unificada como mínimo razonable; 64 GB o más si se quiere contexto amplio, visión y MTP simultáneos.
- Opciones de despliegue: MTPLX 2.11.2 en Apple Silicon mediante `mtplx serve --model model --backend-id qwen3_next`; MLX-LM estándar solo para texto y sin visión ni MTP, según el propio autor. No hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad y el autor declara explícitamente no reclamar ninguna ventaja de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Vision | MTP nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (bf16recurrence-only) | 27,36 B | 4 bits afín g32 + BF16 en proyecciones recurrentes | Sí (333 tensores BF16) | Sí (sidecar 15 tensores) | Apache 2.0 | MLX / MTPLX, Apple Silicon |
| Shiftedx/...-attention8-bf16recurrence-vision-mtplx | No disponible | No disponible (variante alternativa) | Sí | Sí | Apache 2.0 | MLX / MTPLX |
| Shiftedx/...-mxfp4-vision-mtplx | No disponible | MXFP4 | Sí | Sí | Apache 2.0 | MLX / MTPLX |
| Jackrong/Qwopus3.8-27B-Flash-V2 (padre) | ~27 B | BF16 | Sí | No disponible | No disponible en la información facilitada | HuggingFace, MLX-LM estándar |

Las tres variantes derivan del mismo padre y se diferencian solo en el esquema de cuantización y en qué tensores se retienen en BF16. No se dispone de datos de rendimiento para ninguna de ellas, por lo que la comparación es estructural y no de calidad.

## Limitaciones y advertencias

- Artefacto experimental y no cualificado: el autor declara que no ha completado la evaluación de comportamiento, visión ni MTP, y que no reclama ninguna ventaja medida de calidad o velocidad.
- Fallos de formato en código: se documenta un caso controlado de indentación incorrecta en Python, reproducible también en el padre BF16. El propio autor califica el modelo como "unqualified" y advierte que persisten fallos de formateo en Python.
- Longitud de contexto no declarada: no se garantiza ningún contexto máximo ni comportamiento correcto entre distintos runtimes.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingüe concreta.
- Sesgos: no disponibles. No hay documentación sobre sesgos del modelo base ni de esta conversión.
- Riesgo de alucinación: no cuantificado en la información disponible; al tratarse de un modelo conversacional con modo de razonamiento, el riesgo existe pero no está medido.
- Restricción de plataforma: solo MLX sobre Apple Silicon con MTPLX 2.11.2. No hay rutas CUDA, GGUF, vLLM ni llama.cpp, lo que limita su uso en producción sobre infraestructura estándar de servidores.
- Configuración de muestreo sensible: la configuración de generación heredada usa temperatura 1,0, y el autor recomienda explícitamente bajarla a 0,3 para código; ignorar esto puede degradar los resultados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de idoneidad y el artefacto carece de validación de producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el paquete.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Revisión fijada del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2/tree/13f92e09a46fa364f8de1edb85684d57bda01126
- Sección del autor sobre el problema de indentación en Python: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2#24-python-indentation--working-hypothesis
- Variante attention8-bf16recurrence: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx
- Variante mxfp4: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo; los únicos enlaces recuperados no guardan relación con el artefacto y se omiten deliberadamente.
