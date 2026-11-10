# NU-World-Model-Embodied-AI/phyjudge-9B

## Resumen
PhyJudge-9B es un adaptador PEFT/LoRA sobre Qwen3.5-9B desarrollado por NU-World-Model-Embodied-AI, entrenado específicamente para evaluar la plausibilidad física de vídeos generados. No es un modelo generativo ni un adaptador de propósito general: su única función es emitir una puntuación de 1 a 5 sobre un criterio concreto (alineamiento semántico, validez temporal física o una de trece leyes físicas observables) dada una pareja vídeo-texto. Resuelve el problema de la evaluación automática y escalable de world models y modelos de generación de vídeo, donde las métricas clásicas (FID, CLIP score) no capturan violaciones físicas como la gravedad, la conservación del momento o la reflexión de la luz.

El modelo se apoya en la arquitectura multimodal de Qwen3.5-9B, que aporta la torre de visión y la ventana de contexto necesarias para procesar secuencias de vídeo muestreadas a 2 FPS. El adaptador LoRA, de aproximadamente 174 MB, se entrena sobre el dataset PhyGround y se distribuye en formato safetensors junto con scripts de inferencia y plantillas de puntuación. Es relevante ahora porque el ecosistema de vídeo generativo carece de evaluadores especializados en física, y este modelo propone un protocolo reproducible (5-7 llamadas por vídeo) alineado con un paper y un repositorio de evaluación públicos.

La licencia es "phyjudge-adapter-terms-unspecified", lo que implica que los términos de uso comercial no están explicitados y deben consultarse con los autores antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre transformer multimodal Qwen3.5-9B (visión + lenguaje) |
| Parametros totales | 9B en el modelo base; adaptador LoRA de ~174 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (la model card solo documenta bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | phyjudge-adapter-terms-unspecified (other) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; merged en safetensors bf16 |

## Arquitectura y entrenamiento
El adaptador se construye sobre Qwen3.5-9B, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. PhyJudge añade pesos LoRA entrenados con ms-swift 4.1.2 y guardados con PEFT 0.19.1, que especializan al modelo base en una tarea de juicio con salida estructurada en JSON (por ejemplo, `{"gravity": 4}`). El pipeline de inferencia muestrea el vídeo a 2 FPS por defecto, construye un prompt específico por criterio a partir de la plantilla `subq+human.yaml` y ejecuta decodificación determinista con el modo thinking de Qwen3.5 desactivado.

El entrenamiento utiliza el dataset PhyGround, publicado por los mismos autores, que contiene pares vídeo-caption anotados con puntuaciones humanas y por subcriterios. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicó RLHF o DPO; únicamente indica que los pesos fusionados del paper se obtienen con `swift export` en bf16 y se verifican contra `merged_weights.sha256`. La innovación técnica principal es la descomposición de la evaluación física en 13 leyes observables agrupadas en tres dominios (mecánica de sólidos, dinámica de fluidos y óptica), más tres dimensiones generales, lo que permite un diagnóstico granular en lugar de una única puntuación global.

## Capacidades
- Evaluación de alineamiento semántico (`SA`) entre un vídeo generado y su prompt de texto.
- Evaluación de validez temporal física (`PTV`) y de persistencia de objetos (`persistence`).
- Evaluación de seis leyes de mecánica de sólidos: `gravity`, `inertia`, `momentum`, `impenetrability`, `collision`, `material`.
- Evaluación de cinco leyes de dinámica de fluidos: `buoyancy`, `displacement`, `flow_dynamics`, `boundary_interaction`, `fluid_continuity`.
- Evaluación de dos leyes de óptica: `reflection`, `shadow`.
- Salida estructurada en JSON con una puntuación entera de 1 a 5 por criterio.
- Procesamiento de vídeo multimodal con muestreo configurable (`--fps`, `--max-pixels`).
- No soporta generación de vídeo, tool calling, agentes multi-paso ni capacidades de audio según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Filtrado automático en pipelines de generación de vídeo: integrar PhyJudge tras un modelo texto-a-vídeo para descartar clips con violaciones graves de gravedad o colisión antes de publicarlos, usando 5-7 llamadas por vídeo para cubrir las dimensiones generales y las leyes relevantes al prompt.
- Evaluación comparativa de world models: puntuar los mismos prompts con distintos generadores y agregar las puntuaciones por ley para identificar qué modelo respeta mejor la física de fluidos o la óptica.
- Investigación en embodied AI: usar las puntuaciones por ley como señal de recompensa o métrica auxiliar al entrenar agentes que predicen consecuencias físicas en entornos simulados.
- Control de calidad en datasets de vídeo sintético: detectar clips con objetos que desaparecen o cambian de identidad (dimensión `persistence`) antes de incorporarlos a un corpus de entrenamiento.
- Auditoría de contenido generado: revisar lotes de vídeos de campañas o demos con un criterio objetivo de alineamiento semántico (`SA`) y validez temporal (`PTV`), documentando las puntuaciones en informes reproducibles.
- Reproducción de benchmarks académicos: ejecutar el pipeline de vLLM del repositorio PhyGround (`scripts/score_videos.sh`) para replicar las cifras del paper con los pesos fusionados verificados por checksum.
- Desarrollo de evaluadores especializados: usar el adaptador y las plantillas `subq+human.yaml` como base para entrenar jueces en dominios físicos adicionales mediante fine-tuning con ms-swift.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 24 GB en bf16 para cargar el modelo base de 9B más el adaptador, según el setup de los autores; el consumo real depende de la longitud del vídeo, el muestreo de frames y la resolución.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16; reducir `--fps` o `--max-pixels` si se agota la memoria, teniendo en cuenta que esto puede alterar la puntuación.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con muestreo moderado; en GPUs de 16 GB o menos sería necesario cuantizar, opción no documentada por los autores.
- Opciones de despliegue: script `infer.py` con Transformers >= 5.2.0, PEFT >= 0.19.1, accelerate y qwen-vl-utils >= 0.0.14; pipeline de vLLM del repositorio PhyGround para reproducir el paper; fusión con ms-swift 4.1.2 (`swift export`).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de llamadas por vídeo (5-7 en una evaluación completa) y de la longitud del clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhyJudge-9B | 9B (base) + LoRA 174 MB | no disponible | Juicio de plausibilidad física en vídeo | phyjudge-adapter-terms-unspecified | Hugging Face |
| Qwen3.5-9B (base) | 9B | no disponible | Multimodal general (visión + texto) | según Qwen | Hugging Face |
| Evaluadores VLM genéricos (p. ej. GPT-4o, Gemini) | no disponible | no disponible | Juicio multimodal general | propietaria | APIs comerciales |

No se dispone de información sobre benchmarks comparativos con otros jueces de vídeo especializados en física; la comparativa se limita a la relación con el modelo base y a evaluadores multimodales de propósito general.

## Limitaciones y advertencias
- Modelo de evaluación exclusivamente: no genera vídeo ni texto libre; su salida está restringida a puntuaciones JSON por criterio.
- Solo inglés: los prompts, captions y plantillas están en inglés, lo que limita su uso con contenido en castellano sin traducción previa.
- Licencia ambigua: "phyjudge-adapter-terms-unspecified" no aclara los términos de uso comercial; es imprescindible contactar con los autores antes de integrarlo en productos.
- Riesgo de alucinación en la puntuación: al ser un VLM, puede emitir scores inconsistentes ante vídeos ambiguos, oclusión severa o resoluciones bajas.
- Sensibilidad al muestreo: cambiar `--fps` o `--max-pixels` altera las puntuaciones, lo que complica la comparabilidad entre ejecuciones.
- Reproducibilidad estricta: las cifras del paper requieren el pipeline de vLLM con temperatura 1.0 y los pesos fusionados verificados por checksum; `infer.py` usa decodificación determinista y puede diferir.
- Sesgos: no documentados en la model card; al entrenarse sobre PhyGround, hereda los sesgos de composición y anotación de ese dataset.
- Longitud de contexto no especificada: vídeos largos pueden truncarse o degradar la evaluación sin aviso explícito.
- Dependencia de versiones concretas (Transformers 5.2.0, PEFT 0.19.1, ms-swift 4.1.2, revisión `c202236` del modelo base) para reproducir resultados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/NU-World-Model-Embodied-AI/phyjudge-9B
- Página del proyecto: https://phyground.github.io/
- Paper: https://arxiv.org/abs/2605.10806
- Código de evaluación: https://github.com/NU-World-Model-Embodied-AI/PhyGround
- Dataset PhyGround: https://huggingface.co/datasets/NU-World-Model-Embodied-AI/phyground
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
