# seungkukim/cosmos3-edge-droid-ft-pyrualean-100success-1k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned on PyRUA-Lean MolmoSpaces es un modelo de política robótica (visión-lenguaje-acción) publicado por el usuario `seungkukim` como post-entrenamiento del checkpoint oficial `nvidia/Cosmos3-Edge-Policy-DROID` de NVIDIA. El modelo parte de la arquitectura Cosmos3-Edge, un transformer multimodal con un módulo generativo tipo MoE (`moe_gen`) acoplado a un VAE Wan2.2, que predice directamente secuencias de acciones articulares a partir de observaciones visuales y una descripción de tarea en formato JSON.

El ajuste se realizó sobre el dataset `MolmoSpaces-PyRUA-Lean-100success`, compuesto por 400 episodios expertos (100 por tarea, 51.158 fotogramas a 15 fps) recogidos en el simulador MolmoSpaces con el agente PyRUA-Lean, en formato Cosmos3-DROID. El objetivo es adaptar una política generalista de manipulación DROID a un dominio concreto de simulación con vistas de muñeca y dos cámaras exteriores, manteniendo el mismo esquema de observación y acción que el modelo base.

Con 3.369.657.024 parámetros y un repo de 7,7 GB en safetensors, es un modelo de tamaño medio-grande pensado para servir políticas robóticas en tiempo real (32 acciones por consulta). Su relevancia radica en demostrar el flujo completo de post-entrenamiento de Cosmos3-Edge sobre datos propios, con receta reproducible (2x H200, 1000 pasos, EMA) y exportación lista para el servidor de acciones de `cosmos-framework`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Edge (transformer multimodal con módulo generativo MoE `moe_gen`, VAE Wan2.2, cabezas de acción `action2llm`/`llm2action`) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa 33 fotogramas de vídeo + prompt JSON por consulta) |
| Tipos de cuantizacion | no disponible (pesos exportados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (el prompt es una descripción de tarea en JSON; el modelo base es multimodal texto-imagen) |
| Licencia | NVIDIA OpenMDW-1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (incluye torre de visión y processor empaquetados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Cosmos3-Edge del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`). Se trata de un transformer multimodal que combina un codificador VAE Wan2.2 (encoder compilado con AOT) para las observaciones visuales, un tronco tipo LLM con módulo generativo Mixture-of-Experts (`moe_gen`), un `time_embedder` y adaptadores específicos de acción (`vae2llm`, `llm2vae`, `action2llm`, `llm2action`, `action_modality_embed`, `k_norm_und_for_gen`). La política opera en modo `wam`: genera chunks de 32 acciones de posición articular absoluta más una fila de estado, condicionados por 33 fotogramas de vídeo y un prompt JSON.

El post-entrenamiento se ejecutó con `cosmos-framework` (commit `a3fb346`) más un parche de máscara de experto y velocidad incluido con el dataset. Se entrenaron 1000 pasos con batch global 64 (32 por GPU en 2x H200, acumulación de gradiente 1), AdamW fusionado con lr 1e-4, betas (0.9, 0.95), eps 1e-6 y weight decay 0. El schedule fue LambdaCosine con warm-up lineal de 100 pasos (10 %) y decaimiento coseno hasta 0 en el paso 1000. Se usó bf16 con FSDP, clipping de gradiente 0.1, EMA de potencia con `sigma_rel` 0.1 (los pesos exportados son los de EMA) y pesos de pérdida visión 10 / acción 10. Los datos de entrenamiento fueron 400 episodios expertos (100 % exitosos, 51.158 fotogramas, 15 fps) con vistas de muñeca y dos exteriores a 640x360, 7 posiciones articulares y pinza, con aumento de datos de recorte aleatorio (95 %) y ColorJitter aplicado en GPU.

## Capacidades

- Predicción de acciones robóticas de manipulación: genera chunks de 32 acciones de posición articular absoluta (7 articulaciones) más posición de pinza (0..1) por consulta.
- Política visión-lenguaje-acción: condiciona la acción en tres vistas de cámara (muñeca + dos exteriores) y una descripción de tarea en JSON.
- Control de robots manipuladores en simulación: entrenado sobre rollouts expertos del agente PyRUA-Lean en MolmoSpaces.
- Procesamiento multimodal de vídeo: consume 33 fotogramas por inferencia (ventana temporal de observación).
- Integración con servidor de acciones: compatible con `cosmos_framework.scripts.action_policy_server_robolab` y las claves de observación del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad documentada; la política opera en bucle cerrado reconsultando el servidor.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Manipulación robótica en simulación MolmoSpaces: servir la política con `action_policy_server_robolab` para ejecutar tareas de PyRUA-Lean en el simulador, aprovechando que el modelo fue ajustado exactamente sobre ese dominio y formato de observación.
- Investigación en imitación de políticas: usar el checkpoint como referencia reproducible de post-entrenamiento de Cosmos3-Edge sobre datos propios, con receta y configuración publicadas (`config.yaml`).
- Evaluación de recetas de fine-tuning: comparar este checkpoint (datos solo expertos) con la variante `cosmos3-edge-droid-ft-hybrid-100success-1k` (datos DAgger híbridos) para medir el efecto de la composición del dataset en el rendimiento de la política.
- Prototipado de pipelines visión-lenguaje-acción: integrar el servidor de acciones en un stack de control robótico que envíe observaciones (imágenes de muñeca y exteriores, posiciones articulares, prompt JSON) y reciba 32 acciones por consulta.
- Transferencia a dominios simulados similares: partir de este checkpoint para ajustar sobre nuevas tareas de manipulación con el mismo esquema de 7 articulaciones y pinza, reutilizando el procesador y la torre de visión empaquetados.
- Benchmarking de políticas DROID: emplear el modelo como baseline ajustado a un dominio concreto para comparar con el modelo base `nvidia/Cosmos3-Edge-Policy-DROID` sin ajustar y medir la ganancia del post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.369.657.024 parámetros en bf16, los pesos ocupan aproximadamente 6,7 GB; el repo completo es de 7,7 GB (incluye torre de visión y processor). El consumo real depende del VAE Wan2.2, del búfer de 33 fotogramas y del servidor de acciones.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA H200; para inferencia se recomienda al menos una GPU de datacenter (A100, H100, H200) por el VAE y el procesamiento de vídeo.
- Viabilidad en GPU de consumo: no documentada. El tamaño de pesos en bf16 cabría en GPUs con 16-24 GB, pero no hay datos publicados sobre si el pipeline completo (VAE Wan2.2 + 33 fotogramas + servidor) cabe en RTX 4090, 4080 o similares.
- Opciones de despliegue: `cosmos_framework.scripts.action_policy_server_robolab` (servidor de acciones HTTP en el puerto indicado, con `--format-prompt-as-json True --guidance-interval 960 1001`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El entrenamiento completo (1000 pasos, batch global 64) requirió 2 h 18 min en 2x H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3-edge-droid-ft-pyrualean-100success-1k (este) | 3.369.657.024 | no disponible | Política robótica MolmoSpaces/PyRUA-Lean | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | Política robótica DROID generalista | OpenMDW-1.1 | Hugging Face |
| seungkukim/cosmos3-edge-droid-ft-hybrid-100success-1k | no disponible en la información | no disponible | Política robótica con datos DAgger híbridos | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí; la comparación se limita a linaje, dominio de entrenamiento y licencia.

## Limitaciones y advertencias

- Modelo de nicho: es un checkpoint de política robótica para simulación MolmoSpaces, no un modelo de lenguaje general; no debe emplearse para generación de texto, código o tareas conversacionales.
- Sesgo de dominio: entrenado exclusivamente con 400 episodios expertos de PyRUA-Lean en MolmoSpaces; el rendimiento fuera de ese simulador, morfología de robot o conjunto de tareas no está documentado.
- Datos solo exitosos: el dataset contiene únicamente episodios exitosos (100 % de éxito), lo que puede reducir la robustez ante estados de recuperación o distribuciones fuera de la trayectoria experta.
- Riesgo de sobreajuste: 1000 pasos sobre 400 episodios con 51.158 fotogramas; no se publican métricas de validación ni curvas de pérdida que permitan evaluar generalización.
- Sin benchmarks publicados: no hay resultados de éxito en tareas, tasas de finalización ni comparaciones cuantitativas con el modelo base.
- Idiomas y cuantizaciones no documentados: no se especifican idiomas soportados ni formatos de cuantización alternativos; los pesos están en bf16.
- Licencia: hereda los términos de NVIDIA OpenMDW-1.1 del modelo base; es responsabilidad del usuario revisar las condiciones para uso comercial y redistribución.
- Dependencia de código: requiere `cosmos-framework` y un parche específico del dataset (`cosmos_framework_patch/`) para reproducir el entrenamiento; la inferencia usa el servidor de acciones del framework.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-100success-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-100success
- Variante con datos híbridos DAgger: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-100success-1k
