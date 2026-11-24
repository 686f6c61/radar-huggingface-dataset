# seungkukim/cosmos3-edge-droid-ft-hybrid-50ep-1k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned on hybrid DAgger MolmoSpaces rollouts es un ajuste fino de la política robótica `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`) realizado por el usuario `seungkukim`. El modelo parte de la política de control viso-motor de NVIDIA para el robot DROID y se post-entrena con un conjunto de datos propio de rollouts híbridos DAgger grabados en el simulador MolmoSpaces, en el que un experto (PyRUA-Lean) y el propio aprendiz (Cosmos3-Edge) comparten el control. El objetivo es mejorar la política base en las tareas concretas del dataset mediante aprendizaje por imitación con correcciones del experto.

El checkpoint publicado corresponde al paso 1000 de entrenamiento y se exporta con las mismas herramientas y el mismo diseño que la política base (`cosmos_framework.scripts.export_model`), incluyendo la torre de visión y el procesador. El repositorio ocupa 5,0 GB y se distribuye bajo la licencia NVIDIA OpenMDW-1.1, con la etiqueta de pipeline `robotics`.

Se trata de un modelo de nicho: no es un modelo de lenguaje generalista, sino una política de acción para manipulación robótica que consume observaciones multimodales (imágenes de muñeca y exteriores, posiciones articulares y del gripper) y produce secuencias de 32 acciones. Su relevancia radica en demostrar un flujo completo de post-entrenamiento con DAgger híbrido sobre una política fundacional de robótica, con datos y parches de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política viso-motora basada en Cosmos3-Edge (transformer con módulos MoE de generación `moe_gen`, embedders temporales y adaptadores VAE-LLM; VAE Wan2.2 para visión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (incluye módulos MoE, pero no se publica el recuento) |
| Longitud de contexto | no disponible (ventana de 33 fotogramas de vídeo por consulta; 32 acciones por inferencia) |
| Tipos de cuantizacion | no disponible (pesos exportados en bf16; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponible (las instrucciones se pasan como prompt JSON; el modelo base es de NVIDIA y se asume inglés, sin confirmación) |
| Licencia | NVIDIA OpenMDW-1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (exportado con `cosmos_framework.scripts.export_model`, con torre de visión y procesador incluidos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `nvidia/Cosmos3-Edge-Policy-DROID`: una política que combina una torre de visión (con VAE Wan2.2, codificador compilado con AOT) y un tronco tipo transformer con módulos de mezcla de expertos (`moe_gen`), embedders temporales (`time_embedder`), adaptadores entre el espacio latente del VAE y el del LLM (`vae2llm`, `llm2vae`) y cabezas específicas de acción (`action2llm`, `llm2action`, `action_modality_embed`, `k_norm_und_for_gen`). El modo de tarea es `wam`: genera fragmentos de 32 pasos de posiciones articulares absolutas más una fila de estado, condicionado por 33 fotogramas de vídeo.

El post-entrenamiento se realizó sobre el dataset `seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-50ep`: 184 episodios (146 exitosos, 38 fallidos), 42.599 fotogramas a 15 fps, con vistas de muñeca y dos exteriores a 640x360, 7 posiciones articulares y gripper. Los pasos del experto (PyRUA-Lean) están marcados con `action.is_expert = 1` y constituyen el 60% de los fotogramas (25.718); la pérdida de acción se enmascara solo a los pasos del experto, mientras que todos los fotogramas sirven como contexto de vídeo. Se usaron 2 GPU H200 durante 2 h 05 min, con batch global 64, AdamW (lr 1e-4, betas 0.9/0.95, weight decay 0), warm-up lineal de 100 pasos y decaimiento coseno hasta el paso 1000, precisión bf16 con FSDP, grad clip 0,1 y EMA de potencia (sigma_rel 0,1) cuyos pesos son los exportados. La pérdida combina visión (peso 10) y acción (peso 10). Se aplicó aumento de datos con recorte aleatorio (95%) y ColorJitter en GPU, y el prompt es una descripción de tarea en formato JSON con caption dropout de 0,1. No se documenta RLHF ni DPO.

## Capacidades

- Control robótico viso-motor: genera secuencias de 32 acciones de posición articular absoluta (7 articulaciones) y gripper (0..1) a partir de observaciones de cámara y estado.
- Percepción multimodal: procesa tres vistas (muñeca izquierda y dos exteriores) más posición articular y del gripper.
- Condicionamiento por instrucción: acepta una descripción de tarea en formato JSON mediante el procesador de la política base.
- Aprendizaje por imitación con correcciones: entrenado con DAgger híbrido, lo que le permite aprender de trayectorias mixtas experto-aprendiz.
- Ejecución como servidor de política: se despliega con `action_policy_server_robolab` y expone una API de inferencia.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni generación de texto libre.

## Casos de uso

- Manipulación robótica en simulación MolmoSpaces: el modelo actúa como política de control en las tareas del dataset de entrenamiento, consumiendo las tres vistas y el estado articular para producir acciones de 32 pasos; es adecuado porque se ha ajustado específicamente sobre esos rollouts.
- Investigación en aprendizaje por imitación con DAgger: sirve como referencia reproducible para estudiar el efecto de mezclar pasos de experto y aprendiz en la pérdida de acción, ya que el dataset y los parches de entrenamiento están publicados.
- Comparación de estrategias de post-entrenamiento: al existir un modelo hermano entrenado solo con datos del experto (`cosmos3-edge-droid-ft-pyrualean-50ep-1k`), permite comparar el efecto de los datos híbridos frente a los expertos puros.
- Desarrollo de pipelines de evaluación de políticas: el checkpoint puede integrarse en servidores de política (`action_policy_server_robolab`) para probar protocolos de observación y prompts JSON en entornos simulados.
- Prototipado de control viso-motor para el robot DROID: al mantener el mismo formato de observaciones que la política base, puede sustituir a esta en un banco de pruebas existente sin cambiar el cliente.
- Estudio de robustez ante episodios fallidos: el entrenamiento incluye 38 episodios fallidos, lo que permite analizar cómo afecta la presencia de datos de fracaso al rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPU H200 en bf16 con FSDP; no se documenta la VRAM exacta consumida.
- El repositorio pesa 5,0 GB, lo que da una cota inferior aproximada de memoria para cargar los pesos en bf16 (sin contar activaciones, VAE ni procesador).
- No se dispone de datos sobre si cabe en GPU de consumo (RTX 4090, etc.); el modelo base es una política con torre de visión y VAE, por lo que el requisito real puede superar el tamaño de los pesos.
- Despliegue documentado: `python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint_path ... --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`.
- No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo; la librería es `cosmos-framework`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `seungkukim/cosmos3-edge-droid-ft-hybrid-50ep-1k` | no disponible | no disponible (33 fotogramas, 32 acciones) | no publicado | OpenMDW-1.1 | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | no disponible en la informacion | OpenMDW-1.1 | Hugging Face |
| `seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k` | no disponible | no disponible | no publicado | OpenMDW-1.1 (derivada) | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de nicho: es una política robótica ajustada a tareas concretas de MolmoSpaces, no un modelo generalista; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de sobreajuste a las tareas y al entorno de simulación del dataset de entrenamiento (184 episodios, 42.599 fotogramas).
- El entrenamiento incluye episodios fallidos y pasos de aprendiz, lo que puede introducir comportamientos subóptimos; la pérdida solo se calcula sobre pasos de experto.
- No se documentan sesgos, evaluación de alucinación ni métricas de éxito en tareas; no hay evidencia publicada de generalización.
- Idiomas: no disponible; el condicionamiento por prompt se asume en inglés por herencia del modelo base, sin confirmación.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; el autor indica que se aplican las mismas condiciones que al modelo base de NVIDIA.
- Requiere la librería `cosmos-framework` y un parche específico (`cosmos_framework_patch/`) para reproducir el entrenamiento; no es un modelo desplegable con herramientas estándar de inferencia de LLM.
- El checkpoint es el paso 1000 con pesos EMA; no se publican checkpoints intermedios ni curvas de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-50ep-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-50ep
- Modelo hermano (experto puro): https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-50ep-1k
