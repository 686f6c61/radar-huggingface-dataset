# larsboschrng/TIDE_wan_pretrain

## Resumen

TIDE_wan_pretrain es un conjunto de pesos derivados del modelo de difusión de vídeo Wan2.1-T2V-1.3B, publicado por el usuario larsboschrng como parte del proyecto TIDE. No se trata de un modelo de lenguaje, sino de snapshots del transformer de difusión 3D (`WanTransformer3DModel`) sometidos a preentrenamiento continuado sobre vídeos de conducción en primera persona (front-view driving videos). El repositorio contiene exclusivamente los state dicts en float32 (825 tensores, 1.419 mil millones de parámetros), sin código de entrenamiento ni inferencia, que reside en el paquete Python `tide`.

El modelo parte de la arquitectura Wan2.1-T2V-1.3B de Wan-AI y se reentrena con ventanas de vídeo de 480x832 codificadas por el VAE de Wan, usando siempre el embedding UMT5 del prompt vacío. Se publican siete snapshots de preentrenamiento continuado (de 1.000 a 64.000 pasos) y cuatro modelos adaptados (S0a, S1a, S3a, wana) que sirven como base para los cabezales de planificación del proyecto TIDE. Es relevante para investigadores que trabajen en modelos generativos de vídeo aplicados a conducción autónoma y planificación basada en mundo generado.

El tamaño total del repositorio es de 62,4 GB, con cada carpeta de modelo ocupando 5,29 GiB. No hay información pública sobre la licencia, los idiomas, el pipeline ni los resultados de evaluación, lo que limita su uso directo en producción sin trabajo adicional de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (`WanTransformer3DModel` de diffusers), base Wan2.1-T2V-1.3B |
| Parametros totales | 1.419 B (825 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; ventanas de 480x832 con codificación VAE frame a frame) |
| Tipos de cuantizacion | No disponible (los pesos publicados están en float32) |
| Idiomas soportados | No disponible (se usa con embedding UMT5 del prompt vacío) |
| Licencia | No disponible |
| Formato de pesos | safetensors (float32), con `state.json`, `manifest.json` y `transformer_config.json` |

## Arquitectura y entrenamiento

La arquitectura es el transformer de difusión 3D de Wan2.1-T2V-1.3B, sin modificaciones estructurales: `transformer_config.json` corresponde al transformer base sin cambios. El preentrenamiento continuado se realiza sobre ventanas de vídeo de conducción en primera persona, codificadas frame a frame con el VAE de Wan a resolución 480x832 y con el prompt de texto vacío. La receta compartida emplea batch global de 128 ventanas, AdamW (betas 0.9/0.999, sin weight decay), gradient clipping de 1.0, warmup de 300 pasos y flow shift de 3.0. El manifest de entrenamiento contiene 8.193.706 ventanas.

La ejecución principal mantiene una learning rate constante de 3e-5, con un snapshot que se ramifica al 80% de su propia longitud y decae a cero con una raíz cuadrada. Los modelos adaptados se obtienen entrenando 3.000 pasos adicionales con learning rate 2e-5, batch global 128, resolución 480x832 y un manifest de datos mixtos no incluido; los hiperparámetros registrados son `sigma_probs` 0.3, 0.2, 0.5 y `bank_prob` 0.5. Los snapshots de preentrenamiento continuado son: `steps_001000` (128.000 ventanas vistas), `steps_002000` (256.000), `steps_004000` (512.000), `steps_008000` (1.024.000), `steps_016000` (2.048.000), `steps_032000` (4.096.000) y `steps_064000` (8.192.000). Los adaptados son `S0a` (desde `steps_064000`), `S1a` (desde `steps_032000`), `S3a` (desde `steps_008000`) y `wana` (desde el Wan2.1 base sin modificar), todos con 3.000 pasos de adaptación.

No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos SSM. El modelo se usa en inferencia con el embedding UMT5 del prompt vacío, rellenado con ceros hasta 512 tokens, lo que implica que la generación no está condicionada por texto.

## Capacidades

- Generación de vídeo de conducción: el modelo está especializado en sintetizar ventanas de vídeo en primera persona de escenas de conducción, a partir de ruido y sin condicionamiento textual.
- Preentrenamiento continuado sobre dominio específico: los snapshots ofrecen distintos niveles de adaptación al dominio de conducción (de 1.000 a 64.000 pasos), lo que permite elegir el grado de especialización.
- Base para cabezales de planificación: los modelos adaptados (`S0a`, `S1a`, `S3a`, `wana`) alimentan de features a los planner heads del proyecto TIDE (`larsboschrng/TIDE_planner_heads`).
- Integración con el ecosistema diffusers: los pesos se cargan con `WanTransformer3DModel.from_pretrained` y `load_state_dict(strict=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión general ni audio según la información disponible.
- Capacidades multilingües: no disponibles; el modelo no se usa con prompts de texto.

## Casos de uso

- Investigación en modelos generativos de vídeo para conducción autónoma: usar los snapshots para estudiar cómo evoluciona la calidad de generación de escenas de conducción con el número de pasos de preentrenamiento continuado, comparando `steps_001000` frente a `steps_064000`.
- Generación de datos sintéticos de conducción: emplear el modelo para sintetizar ventanas de vídeo en primera persona que amplíen datasets reales de conducción, con la ventaja de estar entrenado específicamente sobre 8.193.706 ventanas de ese dominio.
- Base para planificación basada en mundo generado: conectar los modelos adaptados `S0a`, `S1a` o `S3a` a los planner heads de `larsboschrng/TIDE_planner_heads` para experimentar con planificación que consume features del modelo de vídeo.
- Estudio de adaptación de dominio en difusión de vídeo: comparar `wana` (adaptado desde el Wan2.1 base) con `S0a`/`S1a`/`S3a` (adaptados desde snapshots preentrenados) para medir el efecto del preentrenamiento continuado previo a la adaptación.
- Reproducción de experimentos de preentrenamiento: usar los state dicts y el `manifest.json` con sha256 para verificar la integridad de los pesos y reproducir las condiciones de carga del paquete `tide`.
- Evaluación de robustez de generación de vídeo en dominios específicos: analizar la coherencia temporal y espacial de las ventanas generadas a 480x832 en escenas de conducción, comparando snapshots de distinta longitud de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados están en float32 (1.419 B parámetros, 5,29 GiB por modelo). La inferencia en float32 requiere al menos ~5,7 GB solo para pesos, más activaciones y el VAE y el text encoder de Wan2.1-T2V-1.3B; no se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no disponibles en la información proporcionada. El entorno fijado usa torch 2.9.1 compilado para CUDA 13.0, lo que sugiere GPUs con drivers recientes; no se especifican modelos concretos (A100, H100, RTX 4090).
- Cabeza en GPU de consumo: no confirmado; el tamaño de pesos (5,29 GiB por modelo) es compatible con GPUs de consumo de gama alta, pero el VAE y el text encoder añaden requisitos no cuantificados.
- Opciones de despliegue: carga mediante diffusers (`WanTransformer3DModel`) y safetensors; el código de entrenamiento e inferencia es el paquete Python `tide`, no incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIDE_wan_pretrain | 1.419 B | Vídeo 480x832, ventanas de conducción | Conducción en primera persona | No disponible | Hugging Face (pesos only) |
| Wan2.1-T2V-1.3B (base) | 1.3 B | Texto a vídeo | Generación general texto-vídeo | No disponible en la información | Hugging Face (Wan-AI) |
| TIDE_planner_heads | No disponible | Features del modelo de vídeo | Planificación | No disponible | Hugging Face (larsboschrng) |

La comparación con otros modelos de difusión de vídeo de tamaño similar (por ejemplo, variantes de Wan2.1 o modelos de vídeo de la familia de 1-2 B parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Solo se publican pesos: el código de entrenamiento e inferencia (`tide`) no forma parte del repositorio, lo que dificulta la reproducción completa sin acceso a ese paquete.
- El manifest de datos mixtos de los modelos adaptados no está incluido, por lo que la adaptación no es reproducible de forma exacta.
- El modelo se entrena y usa con el embedding del prompt vacío: no acepta condicionamiento textual, lo que limita su uso a generación no guiada por texto.
- Especialización estrecha en vídeos de conducción en primera persona: el rendimiento fuera de ese dominio no está documentado y probablemente sea pobre.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, coherencia temporal ni fidelidad de las generaciones.
- Riesgo de alucinación visual: como modelo generativo, puede producir escenas plausibles pero incorrectas; no debe usarse como fuente de verdad para percepción en sistemas de seguridad.
- Sesgos de dominio: entrenado sobre un manifest concreto de vídeos de conducción; los sesgos geográficos, meteorológicos y de horario de ese dataset se heredan.
- Sin información sobre idiomas ni sobre sesgos demográficos; no apto para aplicaciones multilingües ni de texto.
- Tamaño del repositorio de 62,4 GB: requiere espacio en disco y ancho de banda considerables para su descarga y verificación.

## Enlaces

- Hugging Face: https://huggingface.co/larsboschrng/TIDE_wan_pretrain
- Repositorio de cabezales de planificación: https://huggingface.co/larsboschrng/TIDE_planner_heads
- Repositorio de modelos de contexto de texto CUE: https://huggingface.co/larsboschrng/CUE_text_context_models
- Modelo base Wan2.1-T2V-1.3B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
