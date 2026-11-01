# saybeok03/folding_final_vlm_expert_lora_224

## Resumen

El modelo `folding_final_vlm_expert_lora_224` es un policy de robótica de tipo Vision-Language-Action (VLA) publicado por el usuario saybeok03 en Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/pi05_base`, que corresponde a π₀.₅ (Pi05) de Physical Intelligence, un VLA disenado para generalización en entornos abiertos. El modelo resultante está especializado en una tarea concreta: doblar camisetas correctamente ("Fold the T-shirt properly").

El fine-tuning se ha realizado con la librería LeRobot (versión 0.6.1) sobre un dataset propio de 50 episodios y 135.351 frames grabados a 30 FPS, empleando un robot bimanual de tipo `bi_openarm_follower` con tres cámaras (base, muñeca izquierda y muñeca derecha). El modelo consume observaciones de estado (16 dimensiones) e imágenes de 224x224 píxeles, y produce acciones de 16 dimensiones.

Es relevante como ejemplo práctico de adaptación de un VLA generalista a una tarea de manipulación específica mediante fine-tuning, un patrón habitual en robótica de imitación. No obstante, el repositorio no incluye resultados de evaluación en robot real ni información sobre el tamaño del modelo o su arquitectura interna, por lo que su utilidad como referencia técnica es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en π₀.₅ (Pi05); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅ (Pi05), un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada procede de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El repositorio no detalla la arquitectura interna (backbone visual, encoder de lenguaje, cabecera de acciones), el número de parámetros ni la composición del preentrenamiento original.

El fine-tuning se realizó durante 5.000 pasos con batch size de 32, optimizador AdamW, learning rate de 3,75e-05 y semilla 1000. El dataset de entrenamiento (`saybeok03/full_folding_pi05_224`) contiene 50 episodios y 135.351 frames a 30 FPS de la tarea de doblar camisetas, grabados con un robot bimanual `bi_openarm_follower` y tres cámaras. No se especifica si hubo RLHF, DPO ni otras técnicas de alineación, ni se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones para un robot `bi_openarm_follower`.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (base, muñeca izquierda, muñeca derecha) a 224x224 píxeles.
- Ejecución de una tarea específica de manipulación: doblar camisetas de forma correcta.
- Imitación de políticas entrenadas por demostración (imitation learning) mediante LeRobot.
- Integración con el ecosistema LeRobot para rollout y reentrenamiento vía CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento, al tratarse de un policy de robótica y no de un LLM conversacional.

## Casos de uso

- Doblado automatizado de camisetas en entornos de laboratorio: el policy ejecuta la tarea "Fold the T-shirt properly" sobre un robot bimanual con tres cámaras, adecuado para reproducir demostraciones de manipulación textil.
- Investigación en imitación de políticas VLA: sirve como punto de partida para estudiar cómo un VLA generalista (π₀.₅) se adapta a una tarea concreta con solo 50 episodios y 5.000 pasos de entrenamiento.
- Benchmark de fine-tuning con LeRobot: permite comparar configuraciones de entrenamiento (learning rate, batch size, número de pasos) sobre una tarea reproducible de manipulación.
- Prototipado de pipelines de robot learning: el flujo `lerobot-train` → `lerobot-rollout` documentado facilita integrar el modelo en un ciclo de recogida de datos, entrenamiento y despliegue.
- Docencia y demostraciones de VLA en robótica: ejemplo didáctico de cómo se estructura un policy LeRobot con observaciones multimodales y acciones de dimensión fija.
- Base para ampliar el dataset de doblado: el modelo puede reentrenarse con más episodios o variaciones de la tarea para mejorar la robustez, dado que el autor no reporta tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para este policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no indica el tamaño de los pesos ni el número de parámetros).
- GPU recomendadas: no disponible; el ejemplo de entrenamiento de LeRobot usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`) y entrenamiento con `lerobot-train`; no se documentan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_final_vlm_expert_lora_224` | no disponible | no disponible | Doblado de camisetas (bi_openarm_follower) | Apache 2.0 | Hugging Face, 25 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista base | no disponible en la información | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; se desconoce la tasa de éxito de la tarea de doblado.
- El modelo está especializado en una única tarea ("Fold the T-shirt properly") y en un robot concreto (`bi_openarm_follower`); no se espera generalización a otras tareas o plataformas sin reentrenamiento.
- El dataset de entrenamiento es reducido (50 episodios, 135.351 frames), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o distractores.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de LLM, pero al ser un policy de imitación puede reproducir sesgos presentes en las demostraciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el modelo original π₀.₅ pueden tener condiciones adicionales no detalladas en este repositorio.
- No se especifican los idiomas ni capacidades de lenguaje; no debe usarse como modelo de texto.
- El repositorio tiene un tamaño de 0.0 GB reportado, lo que puede indicar que los pesos no están completamente subidos o que el dato no es fiable; conviene verificar antes de desplegar.
- La fecha de creación indicada (2026-10-30) es futura respecto a la fecha habitual de consulta, lo que sugiere un posible error en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/folding_final_vlm_expert_lora_224
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
