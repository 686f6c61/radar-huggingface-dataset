# seungkukim/cosmos3-edge-droid-ft-pyrualean-50success-1k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned on PyRUA-Lean MolmoSpaces es un modelo de política robótica (visión-lenguaje-acción) derivado del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` mediante post-entrenamiento supervisado sobre demostraciones expertas del manipulador PyRUA-Lean en entornos MolmoSpaces. Lo publica el usuario `seungkukim` como checkpoint del paso 1000 de un ajuste fino de 1000 iteraciones, con 3.369.657.024 parámetros y pesos en safetensors (7,7 GB de repositorio).

El modelo resuelve el problema de generar secuencias de acciones motoras (chunks de 32 pasos de posición articular absoluta más estado de pinza) a partir de observaciones multimodales: una vista de muñeca y dos vistas exteriores a 640x360, más la posición articular de 7 grados de libertad y la posición de la pinza. Se apoya en la arquitectura Cosmos3 (familia `cosmos3_omni`) y en un VAE Wan2.2 para la codificación visual, integrado en el framework `cosmos-framework`.

Es relevante porque demuestra el flujo completo de especialización de una política generalista DROID a un robot concreto con muy pocos datos (200 episodios, 25.586 fotogramas) y en un tiempo de cómputo reducido (2 h 07 min en 2x H200), lo que resulta útil para investigadores que quieran replicar el proceso de adaptación a nuevos manipuladores o entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (`cosmos3_omni`), política visión-lenguaje-acción con codificador VAE Wan2.2; mezcla de expertos en el módulo generativo (`moe_gen`) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la política consume 33 fotogramas de vídeo y genera chunks de 32 acciones) |
| Tipos de cuantizacion | no disponible (pesos exportados en bf16) |
| Idiomas soportados | no disponible (prompts de tarea en formato JSON) |
| Licencia | NVIDIA OpenMDW-1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (incluye torre de visión y procesador) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`) y se ajusta con todos los pesos, incluidos los cabezales de acción. La arquitectura combina un VAE Wan2.2 (con encoder compilado con AOT) para procesar las vistas concatenadas a 480p (muñeca arriba, dos exteriores abajo), módulos de proyección `vae2llm` y `llm2vae`, un bloque generativo con mezcla de expertos (`moe_gen`), `time_embedder`, y los módulos específicos de acción `action2llm`, `llm2action` y `action_modality_embed`. El modo de tarea es `wam`: chunks de 32 pasos de posición articular absoluta más fila de estado y 33 fotogramas de vídeo.

El entrenamiento usó el dataset `seungkukim/MolmoSpaces-PyRUA-Lean-50success` (revisión `23ffaacf`): 50 episodios por tarea, 200 episodios en total (200 exitosos, 0 fallidos), 25.586 fotogramas a 15 fps, con vistas de muñeca y dos exteriores a 640x360, 7 posiciones articulares y pinza. Todos los pasos están marcados como expertos (`action.is_expert = 1`). Se emplearon 2 GPU H200 durante 2 h 07 min, batch global 64 (32 por GPU x 2 GPU, sin acumulación), AdamW fusionado con lr 1e-4, betas (0,9; 0,95), eps 1e-6 y weight decay 0, schedule LambdaCosine con warm-up lineal de 100 pasos y decaimiento coseno hasta 0 en el paso 1000, grad clip 0,1, precisión bf16 y paralelismo FSDP. Se aplicó power EMA con sigma_rel 0,1 y los pesos exportados son los del EMA. Como aumentación se usó recorte aleatorio al 95% con redimensionado y ColorJitter (0,3; 0,4; 0,5; 0,08) en GPU. Los pesos de pérdida fueron 10 para visión y 10 para acción, con normalización de acciones desactivada (articulaciones en bruto, pinza en 0..1). Se aplicó dropout de caption de 0,1 sobre el prompt JSON.

## Capacidades

- Generación de políticas de control robótico: produce chunks de 32 acciones de posición articular absoluta más posición de pinza a partir de observaciones visuales y propioceptivas.
- Fusión multimodal de tres vistas de cámara (muñeca y dos exteriores) con estado articular de 7 grados de libertad.
- Condicionamiento por lenguaje: el prompt de tarea se formatea como JSON y se procesa con el procesador propio de la política.
- Ejecución en bucle cerrado mediante servidor de inferencia (`action_policy_server_robolab`) con intervalo de guiado configurable.
- Especialización en el manipulador PyRUA-Lean dentro de entornos MolmoSpaces (simulación).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas ni generación de texto libre; el modelo está orientado exclusivamente a la política de acción.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Investigación en manipulación simulada**: replicar el ajuste fino sobre MolmoSpaces para estudiar la transferencia de políticas DROID a nuevos robots; el coste de cómputo (2 h en 2x H200) y el volumen de datos (200 episodios) lo hacen accesible para laboratorios académicos.
- **Aprendizaje por imitación con pocos datos**: usar el checkpoint como referencia para evaluar cuánto rendimiento se obtiene con 50 episodios por tarea y 1000 pasos de entrenamiento, sirviendo de línea base en estudios de eficiencia de datos.
- **Evaluación de políticas en bucle cerrado**: desplegar el servidor `action_policy_server_robolab` en el puerto 8000 y alimentarlo con las claves de observación (`observation/wrist_image_left`, `observation/exterior_image_1_left`, `observation/exterior_image_2_left`, `observation/joint_position`, `observation/gripper_position`, `prompt`) para medir tasas de éxito en tareas de PyRUA-Lean.
- **Comparación de estrategias de datos**: contrastar este checkpoint (solo datos expertos) con `seungkukim/cosmos3-edge-droid-ft-hybrid-50success-1k` (datos híbridos DAgger) para analizar el impacto de la composición del dataset en la política resultante.
- **Prototipado de pipelines de robótica con Cosmos**: integrar el modelo en flujos de trabajo basados en `cosmos-framework` para validar la exportación de checkpoints (`cosmos_framework.scripts.export_model`), el empaquetado de la torre de visión y el procesador, y el formato de pesos safetensors.
- **Generación de datos sintéticos de trayectorias**: emplear las predicciones del modelo como política de referencia para generar rollouts adicionales en MolmoSpaces y ampliar datasets de entrenamiento.
- **Estudio de robustez ante aumentación**: analizar cómo afectan el recorte aleatorio al 95% y el ColorJitter aplicado en GPU al comportamiento final de la política en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.369.657.024 parámetros en bf16 (2 bytes por parámetro) se requieren al menos ~6,8 GB solo para pesos, más memoria para activaciones del VAE Wan2.2, la torre de visión y los 33 fotogramas de entrada, por lo que en la práctica se necesita bastante más.
- GPU recomendadas: el autor entrenó en 2x H200; para inferencia se recomienda al menos una GPU de datacenter (A100 80 GB, H100, H200) para operar con holgura.
- Cabe en GPU de consumo: no disponible; no se documenta ejecución en RTX 4090 ni en GPUs de menor capacidad.
- Opciones de despliegue: servidor propio del framework mediante `python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint_path ... --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `seungkukim/cosmos3-edge-droid-ft-pyrualean-50success-1k` (este) | 3.369.657.024 | no disponible | OpenMDW-1.1 | Hugging Face, 0 descargas, 0 likes | Ajuste fino sobre datos expertos de PyRUA-Lean en MolmoSpaces, 1000 pasos |
| `seungkukim/cosmos3-edge-droid-ft-hybrid-50success-1k` | no disponible | no disponible | OpenMDW-1.1 (derivada) | Hugging Face | Misma receta sobre datos híbridos DAgger (50 ep/tarea) |
| `nvidia/Cosmos3-Edge-Policy-DROID` | no disponible | no disponible | OpenMDW-1.1 | Hugging Face | Política base DROID de NVIDIA, revisión `a74e848c` |

No se dispone de datos de benchmarks ni de parámetros comparables de los otros dos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un único manipulador (PyRUA-Lean) y un único entorno simulado (MolmoSpaces); no se garantiza transferencia a robots físicos ni a otros simuladores.
- Entrenado con solo 200 episodios y 1000 pasos: riesgo elevado de sobreajuste y de baja generalización ante variaciones de iluminación, texturas u objetos no vistos.
- Todos los pasos de entrenamiento están marcados como expertos; no se ha entrenado con datos de recuperación de errores (a diferencia de la variante híbrida DAgger), lo que puede limitar la robustez ante desviaciones del estado.
- No se documentan evaluaciones cuantitativas de tasa de éxito ni comparaciones con la política base, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de acciones incoherentes fuera de la distribución de entrenamiento.
- Licencia OpenMDW-1.1 (NVIDIA Open Model License): es necesario revisar sus términos para uso comercial; el autor indica que se aplican las mismas condiciones que al modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa lenguaje natural libre de forma generativa, solo prompts JSON de tarea.
- El uso requiere el framework `cosmos-framework` (commit `a3fb346` más el parche de máscara de experto y velocidad del dataset), lo que añade complejidad de reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-50success-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-50success
- Variante híbrida DAgger: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-50success-1k
