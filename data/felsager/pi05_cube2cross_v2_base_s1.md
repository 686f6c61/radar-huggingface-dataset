# felsager/pi05_cube2cross_v2_base_s1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos en robótica. Este checkpoint concreto, `felsager/pi05_cube2cross_v2_base_s1`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado con la libreria LeRobot de Hugging Face, especializado en una tarea de manipulacion concreta: recoger cubos de colores y colocarlos sobre una cruz roja.

El modelo consume observaciones multimodales (estado del robot de 10 dimensiones y dos flujos de imagen de 480x640 procedentes de camaras `top` y `wrist`) y produce acciones de 10 dimensiones para un robot `ur5e_hand_e`. Se trata, por tanto, de una politica de imitacion entrenada sobre 1000 episodios y 493.474 fotogramas a 30 FPS del dataset `felsager/vla_cubes_cross_v2`.

Es relevante como ejemplo de aplicacion practica de VLA en robótica de manipulacion: parte de un modelo fundacional grande (4.143 millones de parametros) y lo especializa mediante ajuste fino supervisado con un coste de entrenamiento modesto (30.000 pasos, batch 16), lo que demuestra la viabilidad de adaptar modelos generalistas a tareas especificas con datasets pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas, no a texto libre) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA de tipo π₀.₅, la evolucion del π₀ de Physical Intelligence orientada a generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo procesa dos camaras (vista superior y vista de muneca) junto con el estado proprioceptivo del robot y emite directamente un vector de accion de 10 dimensiones.

El ajuste fino se realizo sobre el dataset `felsager/vla_cubes_cross_v2` (1000 episodios, 493.474 fotogramas a 30 FPS), con cuatro tareas de recogida y colocacion de cubos (azul, verde, amarillo y rojo) sobre una cruz roja. La configuracion de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 1 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones roboticas de 10 dimensiones para un UR5e con mano equipada.
- Percepcion visual multimodal a partir de dos camaras (top y wrist) a 480x640.
- Condicionamiento por instruccion en lenguaje natural (cuatro tareas de pick-and-place).
- Ejecucion de politicas de imitacion en bucle cerrado sobre el robot real.
- Integracion con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- **Automatizacion de pick-and-place en linea de montaje**: el modelo recibe la instruccion "pick up the blue cube and place it on the red cross" y ejecuta la secuencia de acciones sobre un UR5e, adecuado para tareas repetitivas de clasificacion por color.
- **Prototipado rapido de politicas roboticas**: sirve como punto de partida para ajustar un VLA fundacional a una tarea nueva con un dataset de ~1000 episodios, reduciendo el coste frente a entrenar desde cero.
- **Investigacion en aprendizaje por imitacion**: permite reproducir experimentos de VLA con LeRobot y comparar variantes (semillas, datasets, configuraciones) sobre una tarea controlada.
- **Benchmark interno de hardware robotico**: util para validar la integracion de camaras, calibracion y latencia de inferencia en un UR5e con mano antes de desplegar tareas mas complejas.
- **Demostraciones educativas**: ejemplo didactico de pipeline completo (grabacion de datos, entrenamiento, rollout) con LeRobot en un entorno de laboratorio.
- **Base para tareas de clasificacion por atributos visuales**: el modelo aprende a discriminar cubos por color, lo que puede extenderse a tareas de seleccion por atributo en entornos industriales controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada; con 4.143 millones de parametros, en precision completa (fp32) serian necesarios aproximadamente 16,6 GB solo para pesos, y en bf16/fp16 unos 8,3 GB, mas el coste de activaciones y vision.
- **GPU recomendadas**: no especificadas por el autor; por tamano, una GPU con al menos 16-24 GB de VRAM (A100, H100, RTX 4090, L40S) es un punto de partida razonable, aunque no confirmado.
- **Cabe en consumer GPU**: probablemente en RTX 4090 (24 GB) en bf16, aunque no esta verificado por el autor.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--policy.path`), integracion con el ecosistema Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo (orientado a robotica, no a texto).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_base_s1 | 4.143 M | no disponible | Pick-and-place UR5e (4 tareas) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base para ajuste fino | gemma | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la informacion | OpenPI (repo) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: no hay tasas de exito ni resultados en robot real, por lo que el rendimiento real es desconocido.
- **Especializacion estrecha**: entrenado solo para cuatro tareas de pick-and-place de cubos sobre una cruz roja; no generaliza fuera de ese dominio sin nuevo ajuste fino.
- **Dependencia de hardware concreto**: las observaciones y acciones estan dimensionadas para un `ur5e_hand_e` con camaras `top` y `wrist`; otro robot o configuracion de camaras requiere reentrenamiento.
- **Riesgo de alucinacion / fallo de politica**: como politica de imitacion, puede fallar ante posiciones, iluminacion o distractores no vistos en el dataset.
- **Licencia Gemma**: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; revisar antes de produccion.
- **Idiomas**: no se documenta soporte multilingue; las instrucciones del dataset estan en ingles.
- **Sin datos de cuantizacion ni contexto**: no se especifican opciones de cuantizacion ni ventana de contexto, lo que limita la planificacion de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_base_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
