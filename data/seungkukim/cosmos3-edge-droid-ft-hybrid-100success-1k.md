# seungkukim/cosmos3-edge-droid-ft-hybrid-100success-1k

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política robótica (visión-lenguaje-acción) desarrollado por NVIDIA dentro del framework Cosmos3. Este repositorio concreto es un ajuste fino (post-entrenamiento) realizado por el usuario seungkukim sobre el checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`). El modelo resuelve el problema de generar secuencias de acciones motoras para un brazo robótico de 7 grados de libertad más pinza, a partir de observaciones visuales multimodales (una vista de muñeca y dos vistas exteriores) y una descripción de tarea en formato JSON.

El ajuste se ha realizado sobre el dataset `seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-100success`, compuesto por 400 episodios exitosos (100 por tarea, 69.876 fotogramas a 15 fps) generados mediante una estrategia híbrida de DAgger en el simulador MolmoSpaces, donde un experto (PyRUA-Lean) y el propio aprendiz (Cosmos3-Edge) comparten el control. La pérdida de acción se calcula únicamente sobre los pasos del experto (el 65% de los fotogramas). El resultado es el checkpoint del paso 1000, exportado con pesos EMA e incluyendo la torre de visión y el procesador.

Con 3.369.657.024 parámetros y un tamaño de repositorio de 7,7 GB, se trata de un modelo especializado en robótica (pipeline `robotics`) que hereda la licencia NVIDIA OpenMDW-1.1. Es relevante para investigadores que trabajan en políticas visomotoras de manipulación con aprendizaje por imitación y agregación de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (vision-lenguaje-accion, transformer multimodal con modulo `moe_gen`; detalles completos no disponibles) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa 33 fotogramas de vídeo por consulta en modo `wam`) |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el entrenamiento) |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como prompt JSON) |
| Licencia | NVIDIA OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (repo de 7,7 GB, incluye torre de visión y procesador) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Cosmos3 de NVIDIA, un transformer multimodal que combina un codificador visual (VAE Wan2.2, con el encoder compilado con AOT) con módulos de proyección entre visión y lenguaje (`vae2llm`, `llm2vae`) y cabezas específicas de acción (`action2llm`, `llm2action`, `action_modality_embed`). El modo de tarea es `wam`, que genera fragmentos de 32 pasos de posiciones articulares absolutas más una fila de estado, condicionados por 33 fotogramas de vídeo. Se entrena con precisión bf16 y paralelismo FSDP.

El ajuste fino parte de todos los pesos del checkpoint base (incluidas las cabezas de acción) y entrena los módulos `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `k_norm_und_for_gen`, `action2llm`, `llm2action` y `action_modality_embed`. Se usaron 2 GPU H200 durante 2 horas y 8 minutos, con batch global de 64, optimizador AdamW (lr 1e-4, betas 0.9/0.95, weight decay 0), recocido coseno con calentamiento lineal de 100 pasos y clipping de gradiente de 0.1. Los pesos exportados son los de la EMA (power EMA, sigma_rel 0.1). El dataset contiene 400 episodios (100 por tarea, todos exitosos, muestreados por rechazo), 69.876 fotogramas a 15 fps con vistas de muñeca y dos exteriores a 640x360, 7 posiciones articulares más pinza. La pérdida de acción se enmascara a los pasos del experto (45.599 de 69.876 fotogramas, el 65%). Se aplica aumento de datos con recorte aleatorio (95%) y ColorJitter, y dropout de caption de 0.1. Los pesos de pérdida son 10 para visión y 10 para acción.

## Capacidades

- Generación de políticas de acción robótica: produce 32 acciones por consulta (posiciones articulares absolutas y pinza en rango 0..1).
- Percepción visual multimodal: procesa una vista de muñeca y dos vistas exteriores simultáneamente.
- Condicionamiento por instrucciones de tarea en formato JSON (prompt formateado como JSON).
- Aprendizaje por imitación con datos de DAgger híbrido (experto y aprendiz compartiendo control).
- Manipulación de brazo de 7 grados de libertad con pinza.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Manipulación robótica en simulación: desplegar la política en MolmoSpaces u otro simulador compatible para ejecutar tareas de recogida y colocación con un brazo de 7 GDL, usando las tres vistas y el prompt JSON de la tarea.
- Investigación en aprendizaje por imitación: servir como punto de partida para experimentos de DAgger, comparando el rendimiento del aprendiz frente al experto PyRUA-Lean en las mismas tareas.
- Evaluación de ajuste fino sobre políticas base: al ser un checkpoint del paso 1000 con EMA, permite estudiar el efecto del post-entrenamiento sobre `nvidia/Cosmos3-Edge-Policy-DROID`.
- Generación de datos sintéticos de política: usar el modelo como política aprendida para generar rollouts y ampliar datasets de entrenamiento en el formato Cosmos3-DROID.
- Despliegue mediante servidor de acciones: el script `action_policy_server_robolab` permite servir el modelo en el puerto 8000 y conectarlo a un cliente que envíe observaciones (imágenes, posiciones articulares, pinza y prompt).
- Reproducción de experimentos: el repositorio incluye `config.yaml` con la configuración resuelta, lo que facilita replicar el entrenamiento con el parche de enmascaramiento de experto incluido en el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 3.369.657.024 parámetros en bf16, los pesos ocupan aproximadamente 6,7 GB, a los que hay que sumar el estado de activación y el VAE de vídeo (el repo completo pesa 7,7 GB).
- GPU recomendadas: el entrenamiento se realizó con 2 GPU H200; para inferencia se recomienda al menos una GPU con suficiente memoria para bf16 (A100 40/80 GB, H100, H200).
- Cabe en GPU de consumo: no confirmado; probablemente requiere cuantización o reducción de precisión, no documentada.
- Opciones de despliegue: servidor propio del framework Cosmos3 (`python -m cosmos_framework.scripts.action_policy_server_robolab`), con parámetros `--checkpoint_path`, `--port`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cosmos3-edge-droid-ft-hybrid-100success-1k (este) | 3.369.657.024 | no disponible | OpenMDW-1.1 | Post-entrenamiento híbrido DAgger, 1000 pasos |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible | no disponible | OpenMDW-1.1 | Modelo base sin ajuste fino |
| seungkukim/cosmos3-edge-droid-ft-pyrualean-100success-1k | no disponible | no disponible | OpenMDW-1.1 | Misma receta sobre datos solo del experto PyRUA-Lean |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en robótica de manipulación; no es un modelo de propósito general.
- Entrenado con solo 400 episodios de una única configuración de simulador (MolmoSpaces) y tareas concretas; la generalización a entornos reales no está demostrada.
- El conjunto de datos es únicamente de episodios exitosos (muestreo por rechazo), lo que puede limitar la robustez ante fallos.
- La pérdida de acción se calcula solo sobre pasos del experto, de modo que el modelo puede no haber aprendido a corregir sus propios errores fuera de la distribución del experto.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos.
- Licencia OpenMDW-1.1: es necesario revisar los términos para uso comercial, ya que se trata de una licencia "other" de NVIDIA.
- El repositorio tiene 0 descargas y 0 likes; no hay validación externa de su rendimiento.
- Requiere el framework `cosmos-framework` y sus dependencias para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-100success-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-100success
- Modelo relacionado (experto PyRUA-Lean): https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-100success-1k
