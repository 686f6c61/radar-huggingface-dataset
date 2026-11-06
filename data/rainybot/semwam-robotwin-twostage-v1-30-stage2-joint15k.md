# RainyBot/SemWAM-RoboTwin-TwoStage-v1.30-Stage2-Joint15k

## Resumen

SemWAM-RoboTwin-TwoStage-v1.30-Stage2-Joint15k es un checkpoint de investigación publicado por el usuario RainyBot en HuggingFace, orientado a robótica y, más concretamente, al entorno de simulación RoboTwin. No se trata de un modelo de lenguaje: es un modelo generativo multimodal de política robótica que combina un DiT de vídeo, un DiT de acciones, un decodificador de profundidad y un codificador semántico basado en DINOv3 ViT-B/16. El checkpoint corresponde al paso de optimizador 15000 de un entrenamiento en dos etapas ("TwoStage"), aparentemente el refinamiento conjunto ("Joint") de una etapa 2 sobre una etapa 1 previa.

La arquitectura declarada en la model card es `rgb_dep_sem`, con layout de atención `rgb_auxiliary_causal` y condicionamiento de acciones mediante `predicted_depth_head_semantic`. El modelo consume observaciones RGB, profundidad y semántica, y produce predicciones de vídeo futuro, profundidad, semántica y una secuencia de acciones de 14 dimensiones. El repositorio ocupa 14,6 GB en formato PyTorch, lo que sugiere pesos en precisión completa o mixta sin cuantizar.

La relevancia de esta ficha es limitada pero real para quien investigue políticas robóticas basadas en world models: el checkpoint documenta con inusual detalle su contrato de arquitectura (dimensiones, capas, máscaras de atención, configuración MoE), aunque no publica resultados de benchmarks, licencia ni idiomas. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de vídeo (30 capas, hidden 3072) + DiT de acción (30 capas, hidden 1024) + cabeza de profundidad + codificador semántico DINOv3 ViT-B/16; layout `rgb_dep_sem` |
| Parámetros totales | no disponible (el repo pesa 14,6 GB en pesos PyTorch) |
| Parámetros activos | MoE con 4 expertos, `top_k: 0`, experto compartido activo, en capas 21, 24 y 27 del DiT de vídeo; número de parámetros activos no disponible |
| Longitud de contexto | no disponible (condicionamiento por frame actual, `first_frame_causal`) |
| Tipos de cuantización | no disponible (solo se publican pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint nativo, `library_name: pytorch`) |

## Arquitectura y entrenamiento

El modelo es un sistema generativo de difusión con dos torres DiT acopladas. La torre de vídeo tiene `hidden_dim` 3072, `ffn_dim` 14336, 24 cabezas de atención de dimensión 128 y 30 capas; procesa latentes de 48 canales (compresión semántica SVAE con normalización LayerNorm) y usa un parcheo `[1, 2, 2]`. La torre de acción es más pequeña: `hidden_dim` 1024, `ffn_dim` 4096, 24 cabezas y 30 capas, con `action_dim` 14. Ambas usan schedulers de difusión con `num_train_timesteps` 1000 y `shift` 5.0 en entrenamiento e inferencia.

La innovación principal documentada es la disposición de atención `rgb_auxiliary_causal`: las consultas RGB leen profundidad y semántica sin acceso a frames futuros, mientras que profundidad y semántica se leen mutuamente con acceso completo (`all`), y las consultas de acción leen profundidad y semántica en todas las posiciones, pero solo en las posiciones de cabeza (2/3 superiores de la rejilla de tokens T) para semántica. El bloque MoE está habilitado en las capas 21, 24 y 27 del DiT de vídeo, con enrutamiento por muestra, 4 expertos, experto compartido y `token_dispatch: dense_masked`; el `top_k: 0` implica que la máscara de pesos no selecciona expertos dispersos, sino que el bloque actúa como una mezcla densa con experto compartido. La pérdida combina cuatro términos con peso 1.0: vídeo, acción, semántica y profundidad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo futuro condicionada a observaciones RGB, profundidad y semántica del entorno RoboTwin.
- Predicción de mapas de profundidad con representación DVAE y proyección independiente.
- Predicción de representaciones semánticas comprimidas (48 canales, parametrización `v_pred`, backbone DINOv3 ViT-B/16).
- Generación de secuencias de acción de 14 dimensiones para control robótico.
- Condicionamiento multimodal conjunto (RGB + profundidad + semántica) con atención causal auxiliar.
- Soporte de múltiples vistas de cámara: `high`, `left`, `right`, `image` y `wrist_image`, con intrínsecos de simulación definidos (fovy 37° para las tres primeras, 45° para `image`, 75° para `wrist_image`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Investigación en world models robóticos: el checkpoint permite reproducir el pipeline de predicción de vídeo futuro, profundidad y semántica en RoboTwin, útil para estudiar cómo la información auxiliar mejora la política de acción.
- Aprendizaje por imitación con supervisión multimodal: el modelo puede entrenarse o afinarse con demostraciones que incluyan RGB, profundidad y máscaras semánticas, aprovechando la pérdida conjunta de cuatro términos.
- Evaluación de políticas de manipulación en simulación: las 14 dimensiones de acción y los intrínsecos de cámara predefinidos permiten integrar el modelo en entornos RoboTwin con vistas `high`, `left`, `right` y `wrist`.
- Estudio de arquitecturas MoE en difusión: el bloque MoE en capas 21, 24 y 27 con enrutamiento por muestra y experto compartido sirve como caso de estudio para analizar el efecto de la dispersión en modelos generativos.
- Predicción de profundidad y semántica como tareas auxiliares: la cabeza de profundidad con representación DVAE y la compresión semántica SVAE pueden reutilizarse en pipelines de percepción robótica que necesiten mapas densos de escena.
- Baseline para comparativas de políticas robóticas: al estar publicado el contrato completo de arquitectura, sirve como referencia reproducible en experimentos que comparen políticas basadas en DiT frente a alternativas basadas en transformers o SSM.
- Docencia y reproducción de experimentos: el detalle del checkpoint (paso 15000, configuración de atención, schedulers) facilita la replicación en cursos de robótica o aprendizaje profundo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo de 14,6 GB en pesos PyTorch sugiere que la inferencia en FP16 requiere al menos ~15-20 GB de VRAM solo para pesos, más activaciones y latentes de vídeo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se necesitarían GPUs de datacenter tipo A100 o H100 para inferencia cómoda en FP16.
- ¿Cabe en GPU consumer? No se puede confirmar; con 14,6 GB de pesos, una RTX 4090 de 24 GB podría alojar los pesos, pero las activaciones de un DiT de vídeo de 30 capas y 3072 de hidden probablemente excedan esa memoria sin optimizaciones.
- Opciones de despliegue: no se documentan; al ser un checkpoint PyTorch nativo, requeriría un script de inferencia propio o el código del proyecto SemWAM, no disponible en la información proporcionada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas con world model en RoboTwin) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; tratar como uso exclusivamente de investigación hasta verificar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de manipulación, lo que impide evaluar su calidad frente a alternativas.
- Modelo específico de RoboTwin: los intrínsecos de cámara, el layout de vistas y la dimensionalidad de acción (14) están fijados al entorno de simulación; no es directamente transferible a otros robots o simuladores sin reentrenamiento.
- Riesgo de alucinación en predicciones generativas: al ser un modelo de difusión, puede generar vídeo, profundidad o semántica plausibles pero incorrectos, especialmente fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse presumiblemente en un simulador, puede heredar sesgos de la distribución de escenas y tareas de RoboTwin.
- Contexto temporal limitado: la condición de profundidad usa `current_frame` y la máscara `first_frame_causal`, lo que restringe la información temporal disponible para la cabeza de profundidad.
- MoE con `top_k: 0`: la configuración de enrutamiento no selecciona expertos dispersos, lo que puede reducir la capacidad efectiva del bloque MoE frente a configuraciones con `top_k` mayor; conviene verificar el comportamiento en inferencia.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-06): el checkpoint parece un artefacto de investigación con metadatos inconsistentes; verificar la integridad antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-RoboTwin-TwoStage-v1.30-Stage2-Joint15k
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
