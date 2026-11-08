# jsiburian/capsule-coffee-pod-score-specialist

## Resumen

Capsule coffee-pod score specialist es una política de difusión (diffusion policy) de pequeño tamaño publicada por Jeremy Siburian (usuario `jsiburian` en Hugging Face) para una tarea concreta de robótica manipulativa dentro del entorno IsaacLab: abrir la tapa de una cafetera de cápsulas e introducir la cápsula. El modelo resuelve el problema de generar comandos motores de un brazo Franka a partir de dos imágenes de cámara y del estado articular del robot, mediante clonación de comportamiento sobre 50 demostraciones.

Técnicamente es una red de 33,9 millones de parámetros en float32 que combina un codificador visual DINOv3 ViT-S/16 de Meta (ajustado de extremo a extremo) con un experto de acción de 8 capas estilo Gemma y proyecciones lineales para estado, acción y tiempo. El objetivo de entrenamiento es una difusión de tipo DDIM con 100 pasos temporales y predicción de epsilon, que genera bloques de 15 acciones de 8 dimensiones (7 articulaciones más pinza).

Su relevancia no está en el rendimiento autónomo —de hecho, el autor reconoce un único éxito en 8 ensayos— sino en su papel como componente "especialista" o proxy de tarea dentro de la investigación sobre Proxy Policy Steering (PPS), una técnica para guiar políticas de muestreo planificadas por VLM. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ProxyScoreConfig` (fork de openpi): codificador DINOv3 ViT-S/16 + experto de acción Gemma de 8 capas (`gemma_12m`) + proyecciones lineales de estado/acción/tiempo |
| Parámetros totales | 33.872.280 (33,9 M) en float32 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no atiende tokens de lenguaje) |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (el pipeline tokeniza el prompt pero el modelo no atiende a tokens de lenguaje) |
| Licencia | DINOv3 License (`dinov3-license`, archivo `LICENSE.md`) |
| Formato de pesos | safetensors (`model.safetensors`, paso 30.000) + `metadata.pt` + `assets/norm_stats.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de política de difusión de openpi: un codificador visual DINOv3 ViT-S/16 procesa dos imágenes RGB de 224 × 224 (`exterior_image_1_left` y `wrist_image_left`), mientras que el estado del robot (`joint_position` de 7 articulaciones en radianes y `gripper_position`, rellenados a 32 dimensiones) se proyecta linealmente. Un experto de acción de 8 capas estilo Gemma (`gemma_12m`) denoisa, condicionado por la imagen, el estado y el paso temporal, un bloque de acciones de forma 15 × 8 (rellenado a 32 columnas internamente). Las 7 primeras columnas son desplazamientos relativos respecto a las articulaciones actuales y la octava es el comando absoluto de pinza; la normalización es por cuantiles con las estadísticas de `assets/norm_stats.json`.

El entrenamiento consistió en clonación de comportamiento sobre 50 demostraciones del entorno `Isaac-Capsule-Droid-Visuomotor-v0` (configuración Franka estilo DROID), convertidas a formato LeRobot con el prompt "open the coffee maker lid and put the pod inside". Se ejecutaron 30.000 pasos con batch de 32 en 2 GPUs, inicializando el experto de acción desde cero y el codificador DINOv3 desde el checkpoint público `facebook/dinov3-vits16-pretrain-lvd1689m`. El objetivo es una difusión DDIM de 100 pasos de entrenamiento con predicción de epsilon (`prediction_type="epsilon"`); no se documenta RLHF ni DPO.

## Capacidades

- Generación de comandos motores para un brazo Franka de 7 articulaciones más pinza, en bloques de 15 pasos y 8 dimensiones.
- Percepción visomotora a partir de dos cámaras (tercera persona y muñeca) a 224 × 224.
- Difusión condicionada por estado articular y paso temporal (predicción de epsilon, 100 pasos de entrenamiento).
- Clonación de comportamiento sobre demostraciones humanas o teleoperadas (50 episodios en este caso).
- Actúa como política especialista o proxy de tarea para técnicas de steering de políticas (Proxy Policy Steering).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; el prompt se tokeniza pero no se atiende.

## Casos de uso

- Investigación en Proxy Policy Steering (PPS): el modelo sirve como especialista de tarea que guía o corrige la política base planificada por un VLM; su bajo coste (33,9 M de parámetros) permite ejecutarlo en paralelo a la política principal.
- Reproducción de experimentos de imitación con pocos datos: con solo 50 demostraciones se obtiene un artefacto entrenable y evaluable en IsaacLab, útil para estudiar curvas de aprendizaje y sensibilidad al número de episodios.
- Prototipado de pipelines openpi/LeRobot: el repositorio incluye `norm_stats.json` y `metadata.pt`, lo que facilita integrar el modelo en flujos de conversión de datos DROID a LeRobot y validar transformaciones de entrada.
- Evaluación comparativa de codificadores visuales: al usar DINOv3 ViT-S/16 ajustado, permite medir el impacto del codificador en tareas de manipulación fina frente a alternativas como ResNet o CLIP.
- Docencia y divulgación en robótica: tarea acotada y comprensible (abrir tapa e insertar cápsula) con pesos ligeros (0,1 GB) para demostrar difusión aplicada a control.
- Base para ajuste fino en tareas análogas: al ser un especialista de una tarea concreta, puede servir de inicialización para variantes del mismo entorno (otras cafeteras, otras cápsulas) con pocos datos adicionales.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Éxito autónomo en `Isaac-Capsule-Droid-Visuomotor-v0` | 1 de 8 ensayos (1.200 pasos de control por ensayo) |
| Pasos de entrenamiento | 30.000 |
| Batch | 32 (2 GPUs) |
| Demostraciones | 50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no es un LLM y no aplica esa batería.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en float32 para los 33,9 M de parámetros, más el coste de activaciones del codificador ViT-S/16 a 224 × 224 (estimación orientativa; no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en 2 GPUs no especificadas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de robótica); el despliegue previsto es mediante el fork de openpi y el entorno IsaacLab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Capsule coffee-pod score specialist | 33,9 M | no aplica | Difusión visomotora para tarea de cápsula en IsaacLab | DINOv3 License | Hugging Face |
| Políticas de difusión openpi (referencia) | no disponible | no aplica | Manipulación general con difusión | según variante | openpi (GitHub) |
| Políticas de clonación de comportamiento DROID | no disponible | no aplica | Manipulación con dataset DROID | según variante | DROID (proyecto) |

No se dispone de datos de rendimiento comparables publicados para alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento autónomo muy bajo: 1 éxito en 8 ensayos; el propio autor lo describe como un especialista de bajos datos pensado para combinarse con una política base, no para uso aislado.
- No atiende al lenguaje: aunque el pipeline tokeniza el prompt, el modelo no condiciona sus acciones sobre él.
- Entrenado únicamente en el entorno `Isaac-Capsule-Droid-Visuomotor-v0` con 50 demostraciones; la generalización a otras cafeteras, cápsulas, iluminación o cámaras no está validada.
- Riesgo de sobreajuste a las condiciones de las demostraciones y de deriva en episodios largos (1.200 pasos de control por ensayo).
- Licencia DINOv3: los pesos son derivados de los DINO Materials y su uso comercial queda sujeto a los términos de `LICENSE.md`; conviene revisarlos antes de cualquier despliegue productivo.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo robótico específico no aplican las categorías habituales de sesgo lingüístico.
- No hay información sobre robustez ante fallos de percepción, oclusiones o cambios de calibración de las cámaras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsiburian/capsule-coffee-pod-score-specialist
- Perfil del autor: https://huggingface.co/jsiburian
- Modelo base DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Repositorio openpi (fork utilizado): no disponible en la información proporcionada
- Proyecto IsaacLab: no disponible en la información proporcionada
- Dataset DROID: no disponible en la información proporcionada
- Paper o blog de Proxy Policy Steering: no disponible en la información proporcionada
