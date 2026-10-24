# seriintan/evo1_lang3a_frazier_blade_stage2

## Resumen

Evo-1 (`seriintan/evo1_lang3a_frazier_blade_stage2`) es una política Vision-Language-Action (VLA) para control robótico, publicada con la librería LeRobot y entrenada sobre el dataset propio `seriintan/lang3a_frazier_blade`. No es un modelo de lenguaje: es un checkpoint de imitación que recibe el estado articular de un brazo `so_follower`, dos cámaras (`wrist` y `side`) y una instrucción en lenguaje natural, y devuelve un vector de acción de 6 dimensiones. El repositorio ocupa 1,8 GB y contiene 776.139.440 parámetros en safetensors.

El modelo se apoya en la arquitectura Evo-1 del grupo MINT-SJTU (CVPR 2026): un backbone visual-lingüístico InternVL3 que embebe imágenes e instrucción, y una cabeza de acción basada en flow matching continuo que predice trozos (`chunks`) de acciones futuras. El resultado es un VLA deliberadamente ligero (menos de 800 M de parámetros) frente a alternativas de 3-7 B, pensado para ejecutarse en hardware de sobremesa junto al robot.

Su relevancia es acotada y muy específica: es un ejemplo reproducible de fine-tuning de Evo-1 con LeRobot 0.6.2 sobre dos tareas de pick-and-place de instrumental quirúrgico (tubo de succión Frazier y hoja de bisturí) en una cesta azul. El autor no ha publicado resultados de evaluación en robot real, por lo que debe tratarse como un checkpoint experimental y no como un sistema validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone InternVL3 + cabeza de acción con flow matching continuo |
| Parámetros totales | 776.139.440 (~776 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor solo publica pesos safetensors; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; las instrucciones del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint en formato LeRobot) |
| Tipo de robot | `so_follower` (brazo seguidor SO, 6 grados de libertad) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.side` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de datos | 30 FPS |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

Evo-1 combina dos módulos. Por un lado, un backbone InternVL3 que procesa conjuntamente las dos imágenes de cámara (480x640) y la instrucción textual, preservando la alineación semántica entre visión y lenguaje. Por otro, una cabeza de acción que genera acciones continuas mediante flow matching, en lugar de regresión directa o discretización por tokens, y que predice secuencias de acciones (chunks) en lugar de un único paso. El checkpoint cuenta con 776 M de parámetros, lo que lo sitúa en el rango de VLA ligero.

El entrenamiento es de imitación supervisada sobre el dataset `seriintan/lang3a_frazier_blade`: 120 episodios, 48.454 frames a 30 FPS, dos tareas anotadas ("Pick up the Frazier Suction Tube and place it in the blue basket." y "Pick up the surgical blade and place it in the blue basket."). La configuración declarada es de 50.000 pasos, batch de 4, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables de forma estándar en este tipo de políticas). El sufijo `stage2` sugiere una segunda fase de ajuste, pero la información disponible no detalla en qué consiste ni qué se congela en cada fase.

## Capacidades

- Manipulación robótica condicionada por lenguaje: ejecuta dos tareas concretas de pick-and-place de instrumental quirúrgico sobre un brazo `so_follower`.
- Fusión multimodal: procesa simultáneamente dos vistas de cámara (`wrist` y `side`) y el estado articular de 6 dimensiones.
- Predicción de acciones continuas en chunks mediante flow matching, no limitada a un vocabulario discreto de acciones.
- Generalización semántica derivada del backbone InternVL3, que permite seguir instrucciones en lenguaje natural dentro del dominio aprendido.
- Seguimiento de instrucciones en inglés, idioma en el que están anotadas las dos tareas del dataset.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o fine-tuning.
- No soporta tool calling, function calling, uso como agente multi-paso, generación de texto libre, matemáticas, código ni visión descriptiva como producto: el backbone VLM está acoplado a la cabeza de acción.

## Casos de uso

- Automatización de pick-and-place de instrumental quirúrgico en laboratorio: el modelo recibe las dos cámaras y la instrucción "Pick up the surgical blade and place it in the blue basket." y devuelve las 6 articulaciones de acción a 30 FPS, adecuado para montajes de experimentación con instrumental real o maquetas.
- Base para fine-tuning con nuevos objetos: al ser un checkpoint de 776 M con licencia Apache 2.0, sirve como inicialización en `lerobot-train` para datasets propios con menos horas de grabación que un VLA de 7 B.
- Referencia para investigar flow matching en políticas VLA: la cabeza de acción continua permite ablaciones comparándola con políticas de regresión tipo ACT sobre el mismo dataset.
- Docencia y robótica educativa con SO-101: el coste computacional (menos de 2 GB de pesos) permite desplegarlo en un portátil con GPU de gama media junto al robot físico.
- Evaluación de robustez perceptual: al depender de dos cámaras fijas, es un banco de pruebas para medir degradación ante cambios de iluminación, oclusiones o recolocación de objetos.
- Prototipado de pipelines de datos en robótica: el dataset asociado (120 episodios, 48.454 frames) y el checkpoint permiten reproducir el ciclo completo captura-entrenamiento-despliegue con LeRobot 0.6.2.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para caracterizar modos de fallo antes de entrenar una versión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto literal "No evaluation results have been provided for this policy yet.", sin tasas de éxito, número de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB solo para los pesos en bf16 (776 M x 2 bytes) y aproximadamente 4-8 GB contando activaciones del backbone InternVL3, dos imágenes de 480x640 y buffers de la cabeza de acción; el repositorio completo ocupa 1,8 GB en disco.
- GPU recomendadas: cualquier GPU con 8 GB o más. Una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 o RTX 4090 son suficientes; para despliegues con varias instancias o entrenamiento, A100 o H100.
- Cabe en GPU de consumo: sí. Con 8 GB de VRAM debería ser viable en inferencia; para reentrenamiento con `lerobot-train` se recomienda 16 GB o más por el batch y las activaciones.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) y PyTorch con CUDA a través de LeRobot 0.6.2. No hay soporte para vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje autoregresivo.
- Latencia y throughput: no disponibles como cifra publicada. El bucle de control está pensado para datos a 30 FPS, lo que implica un presupuesto de unos 33 ms por paso; el rendimiento real depende de la GPU y de si se ejecutan las dos cámaras en paralelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque de acción | Licencia | Disponibilidad |
|---|---|---|---|---|
| Evo-1 stage2 (este checkpoint) | ~776 M | Flow matching continuo con backbone InternVL3 | Apache 2.0 | Pesos en HuggingFace, integrado en LeRobot |
| OpenVLA | ~7 B | Tokens de acción discretizados, backbone Llama-2 + DINOv2/SigLIP | MIT según documentación pública del proyecto | Pesos abiertos, integraciones comunitarias |
| π0 (openpi) | ~3 B | Flow matching, backbone VLM | Apache 2.0 según el repositorio openpi | Pesos y código abiertos |
| ACT (LeRobot) | ~decenas de millones | Regresión directa de chunks, sin backbone VLM | Apache 2.0 (implementación LeRobot) | Disponible en LeRobot |

Datos de los modelos alternativos tomados de su documentación pública; no proceden de la información proporcionada en esta búsqueda y conviene verificarlos en sus repositorios antes de citarlos. La ventaja diferencial de este checkpoint es el tamaño reducido (776 M frente a 3-7 B) manteniendo un backbone VLM, a costa de estar especializado en dos tareas de un único robot.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada en robot real: se desconoce la tasa de éxito de las dos tareas, por lo que no debe asumirse que funcionen de forma fiable.
- Especialización extrema: solo dos instrucciones y dos objetos del dataset de entrenamiento; cualquier otro objeto, contenedor o frase queda fuera de distribución.
- Dependencia del montaje físico: las cámaras `wrist` y `side` deben corresponder a la configuración, resolución (480x640) y encuadre del dataset; cambiar la posición de una cámara invalida el checkpoint.
- Riesgo de sobreajuste: 120 episodios y 48.454 frames son un volumen pequeño para una política VLA; es esperable un comportamiento frágil ante variaciones de iluminación, fondo o posición inicial.
- Sin capacidades generales de lenguaje: aunque el backbone sea InternVL3, el modelo no debe usarse para generar texto, razonar o responder preguntas.
- Idiomas: la información no declara soporte multilingüe; las instrucciones del dataset están en inglés y no hay evidencia de que funcione con instrucciones en castellano.
- Sesgos: no documentados por el autor. Al entrenarse con instrumental quirúrgico y un entorno concreto, los sesgos de apariencia del material, color de la cesta o tipo de mesa pueden condicionar el comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y aviso de cambios; el autor no ofrece ninguna garantía ni asume responsabilidad por daños.
- Seguridad: no debe emplearse en entornos clínicos reales ni cerca de personas sin supervisión, barreras físicas y un protocolo de parada de emergencia. Es un prototipo de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seriintan/evo1_lang3a_frazier_blade_stage2
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/lang3a_frazier_blade
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/lang3a_frazier_blade
- Repositorio de Evo-1 (MINT-SJTU): https://github.com/MINT-SJTU/Evo-1
- Paper de Evo-1 (arXiv): https://arxiv.org/abs/2511.04555
- Guía de LeRobot para evo1: https://huggingface.co/docs/lerobot/main/en/evo1
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
