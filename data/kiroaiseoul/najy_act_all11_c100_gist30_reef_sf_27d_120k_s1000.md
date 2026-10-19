# kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_120k_s1000

## Resumen

`kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_120k_s1000` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) y empaquetado para la librería LeRobot, no un modelo de lenguaje. Lo desarrolla el usuario kiroaiseoul y está asociado al run `exp_all11_c100_gist30_reef_sf_s1000_120k`, en el paso 120.000, dentro de la serie NAJY y del entorno Trossen Mobile AI. Su función es convertir tres vistas de cámara RGB de 480x640 y un estado de entorno de 11 dimensiones en una acción de 16 dimensiones, un esquema típico de política de imitación para manipulación robótica.

El checkpoint tiene 51.677.328 parámetros y un tamaño de repositorio de 0,2 GB, por lo que es ligero para experimentación. La model card indica explícitamente que se sube para análisis y puntuación, y que no equivale a confirmar un candidato de despliegue en robot real. Su interés actual está en la reproducibilidad: incluye el hash SHA-256 del safetensors, metadatos del manifiesto y compatibilidad con herramientas de scoring que leen `multi_manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica; checkpoint LeRobot |
| Parametros totales | 51.677.328 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se especifica horizonte de observación) |
| Tipos de cuantizacion | no disponible (solo se documenta el checkpoint safetensors; no hay variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de texto; no se documentan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); estructura `pretrained_model` de LeRobot |
| Entrada de observación | 3 imágenes RGB de 480x640 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y `observation.environment_state` de 11 dimensiones |
| Salida de acción | 16 dimensiones (`action`: [16]) |
| Paso de entrenamiento | 120.000 |
| Run | `exp_all11_c100_gist30_reef_sf_s1000_120k` |
| SHA-256 de `model.safetensors` | `a1ea559447eccb0934d4b4f3ec9d3479cfddeafbc7e14c76f2bb0f0bfe2ab40b` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación que predice secuencias de acciones, o action chunks, mediante un transformer; en LeRobot se utiliza como política visuomotora. La model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el horizonte de predicción, por lo que esos datos no están disponibles. La entrada documentada es multimodal: `observation.images.cam_high`, `cam_left_wrist` y `cam_right_wrist`, cada una con forma [3, 480, 640], más `observation.environment_state` [11]; la salida es `action` [16].

El entrenamiento consta de 120.000 pasos y parte del manifiesto `configs/datasets/all11_tr_hot_gist30_reef_sf.json`, con sha256 `184afe35a1c756c6`, y el flag `env_stage_token: true` en el primer elemento del manifiesto. Se ejecutó en una máquina denominada DGX_1; el log de lanzamiento indica reanudación, commit git `1934ea6` y la ruta `/raid/kiro-ai/outputs/act/exp_all11_c100_gist30_reef_sf_s1000`. No se documentan tokens de entrenamiento, composición del dataset, RLHF/DPO ni otras innovaciones; al tratarse de una política de imitación, no procede el paradigma de alineación de un LLM. La model card remite a `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94, como contexto del desarrollo.

## Capacidades

- Predicción de acciones robóticas de 16 dimensiones a partir de tres cámaras RGB y un estado de entorno de 11 dimensiones.
- Procesamiento de imágenes de 480x640 en tres vistas: cámara alta, muñeca izquierda y muñeca derecha.
- Condicionamiento por etapa de entorno cuando el flag `env_stage_token` está activo en el manifiesto.
- Integración con LeRobot y con la estructura `pretrained_model`, incluyendo el uso directo de herramientas como `stage_cond_diag.py`.
- Evaluación mediante `multi_manifest.json` y el argumento `--checkpoint <carpeta>`.
- Verificación de integridad del checkpoint mediante `sha256sum model.safetensors`.
- No genera texto, código, matemáticas ni descripciones visuales generales; no es un modelo de lenguaje ni un VLM.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan modos thinking, audio ni vídeo.

## Casos de uso

- Reproducción y auditoría de experimentos: cargar el checkpoint con LeRobot, verificar el SHA-256 y comparar la puntuación con la del run original. Es adecuado porque la model card conserva hash, manifiesto y metadatos del entrenamiento.
- Evaluación de políticas en simulación: alimentar las tres cámaras y el estado de 11 dimensiones para obtener acciones de 16 dimensiones en el entorno Trossen Mobile AI. Es adecuado si el simulador reproduce exactamente el esquema de observaciones documentado.
- Baseline en ablaciones: comparar este checkpoint de 120.000 pasos con las variantes de 60.000 y 120.000 de la misma familia NAJY usando la misma herramienta de scoring. Es útil porque comparten estructura LeRobot y permiten aislar cambios de configuración.
- Diagnóstico de condicionamiento por etapa: ejecutar `stage_cond_diag.py` y leer el flag `env_stage_token` desde `multi_manifest.json`. Es adecuado para estudiar si la política depende de la etapa del entorno.
- Recogida de rollouts para análisis de fallos: ejecutar la política en un banco de pruebas y registrar trayectorias, acciones y estados. Sirve para detectar acciones fuera de distribución antes de plantear un despliegue real.
- Prototipado en laboratorio con hardware Trossen: integrar el checkpoint en un pipeline LeRobot/PyTorch y probar la interfaz de observaciones y acciones con un robot de laboratorio. Es viable por su tamaño reducido, aunque no sustituye una validación de seguridad.
- Validación de software de control: comprobar formas de tensor, frecuencias de inferencia y envoltorios de seguridad con un checkpoint de 51,7 millones de parámetros. Es adecuado como prueba de integración, no como garantía de rendimiento en producción.
- Docencia de aprendizaje por imitación: usar un checkpoint pequeño y reproducible para explicar action chunking, políticas visuomotoras y evaluación con manifiestos. La licencia Apache-2.0 facilita su uso académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser una política de robótica, las métricas tipo MMLU, HumanEval o GSM8K no aplican; tampoco se proporcionan tasas de éxito, error de acción, latencia ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada: no publicada. A partir de 51.677.328 parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y 103 MB en FP16; hay que añadir activaciones, buffers de las tres imágenes de 480x640 y el runtime de LeRobot/PyTorch.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB, y en GPUs de datacenter. El entrenamiento se realizó en una máquina denominada DGX_1, sin que se especifique el modelo de GPU.
- Cabe en GPU de consumo: sí, con margen amplio para los pesos; los requisitos reales dependen del lote, de las imágenes y del resto del pipeline.
- CPU: por el tamaño del checkpoint es viable para pruebas, pero no se publica latencia ni throughput.
- Opciones de despliegue: LeRobot y PyTorch con pesos safetensors. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Paso de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| `NAJY_act_all11_c100_gist30_reef_sf_27D_120k_s1000` | 51.677.328 | 120.000 | no disponible | Apache-2.0 | Hugging Face |
| `NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000` | no disponible | 60.000 según el nombre | no disponible | no disponible | Hugging Face |
| `NAJY_act_all11_c100_gist30_27D_120k_s1000` | no disponible | 120.000 según el nombre | no disponible | no disponible | Hugging Face |

No hay benchmarks comunes ni datos de parámetros de las variantes, por lo que no se puede establecer una comparación cuantitativa de calidad. Fuera de la familia NAJY no se identifican alternativas equivalentes en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no tiene contexto textual.
- No se han publicado benchmarks; se desconoce la tasa de éxito, el error de acción y la robustez frente a cambios de iluminación, posición o textura.
- El autor indica que es una subida para análisis y puntuación, no un candidato confirmado para despliegue real.
- Riesgo de acciones fuera de distribución y de fallos de seguridad en un robot real; se requieren límites de par, paradas de emergencia, supervisión y validación en un entorno controlado.
- Sesgos conocidos: no documentados; dependen del dataset `all11` y de las condiciones de recogida.
- No se documentan cuantizaciones, latencia ni throughput, por lo que no se puede garantizar inferencia en tiempo real.
- La licencia Apache-2.0 permite uso comercial con cumplimiento de sus términos, incluidos avisos de licencia y ausencia de garantía; deben revisarse también los derechos sobre los datos de entrenamiento y las obligaciones de seguridad del robot.
- Es obligatorio verificar el SHA-256 de `model.safetensors`; si no coincide con `a1ea559447eccb0934d4b4f3ec9d3479cfddeafbc7e14c76f2bb0f0bfe2ab40b`, no debe utilizarse.
- La model card está en coreano y los metadatos técnicos son limitados, lo que dificulta la auditoría independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_120k_s1000
- Variante de 60.000 pasos: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000
- Variante de 120.000 pasos: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_27D_120k_s1000

No se han encontrado papers, blogs, repositorios o demos adicionales relevantes en la búsqueda web.
