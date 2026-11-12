# OpenRAL/rskill-pi05-makermods_metal-pick_place-bf16

## Resumen

`rskill-pi05-makermods_metal-pick_place-bf16` es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que combina el modelo base π0.5 de Physical Intelligence con un adaptador LoRA entrenado por MakerMods para el brazo MakerMods Metal. La tarea concreta es coger un cubo de la mesa y depositarlo en una zona marcada, partiendo de dos vistas RGB (cámara fija frontal y cámara de muñeca) y del estado articular de 7 dimensiones.

El modelo base π0.5 es un modelo visión-lenguaje-acción (VLA) formado por PaliGemma 3B como torre de visión-lenguaje y un experto de acción con flow matching de 10 pasos de denoising. El adaptador LoRA (r = 16, α = 32) se fusiona en los pesos base en tiempo de carga, de modo que el modelo resultante se ejecuta como un π0.5 denso sin dependencia de PEFT.

Es relevante como ejemplo de empaquetado reproducible de habilidades robóticas: fija versiones exactas del adaptador y del modelo base, declara un contrato de observación-acción explícito (unidades en grados, escala de pinza, base temporal de 30 Hz) y documenta honestamente resultados de evaluación en simulación que no alcanzan el éxito completo de la tarea. El propio paquete no contiene pesos: solo apunta a las fuentes y añade metadatos de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: PaliGemma 3B (visión-lenguaje) + experto de acción con flow matching (10 pasos de denoising) sobre π0.5 |
| Parametros totales | no disponible (base π0.5, pesos fp32 de 14,5 GB); LoRA fusionado: 3 195 904 parámetros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato publicado en este paquete) |
| Idiomas soportados | en |
| Licencia | permissive-research (los pesos base de PI requieren acuerdo con el proveedor para uso comercial) |
| Formato de pesos | no contiene pesos propios; apunta a LoRA PEFT y a `lerobot/pi05_base` (safetensors), fusionados en carga a bf16 |
| Entrada | `observation.images.top` (1,3,480,640), `observation.images.wrist` (1,3,480,640), `observation.state` (1,7), `task` (str) |
| Salida | chunk de acción (50,7): joint1..6 absolutos en grados + recorrido de pinza |
| Frecuencia de control | 30 Hz; chunk_size = n_action_steps = 50 |
| VRAM mínima declarada | 9,5 GB |
| Latencia declarada | 500 ms |
| Runtime | PyTorch, dtype bf16 |
| Librería | lerobot |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5: una torre de visión-lenguaje PaliGemma de 3B parámetros que procesa dos vistas RGB redimensionadas con padding a 224 × 224 por lerobot, junto con el estado articular de 7 dimensiones, y un experto de acción basado en flow matching que genera el chunk de 50 pasos en 10 iteraciones de denoising. La salida son posiciones articulares absolutas (joint1..6 en grados) más el recorrido de la pinza, que se reproducen completos antes de la siguiente inferencia.

El adaptador LoRA es plano (r = 16, `lora_alpha` = 32, PEFT 0.19.1) con 152 tensores `lora_A`/`lora_B` sobre 76 capas Linear: `q_proj` y `v_proj` de cada capa de lenguaje de PaliGemma y de cada capa del experto de acción, más `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out`. En carga, el adaptador de pi05 descarga los pesos base y fusiona cada par con `W += 2.0 · B @ A` en fp32 con una única conversión de vuelta a bf16 (registrado como `lora.merged`: 76 módulos, mayor cambio relativo de peso del 5,2 %). Se rechazan adaptadores que no sean LoRA plano, claves que no correspondan a un peso Linear objetivo y bases distintas de `lerobot/pi05_base`.

El entrenamiento se realizó con lerobot durante 30 000 pasos, batch 1, AdamW con learning rate 2,5e-5, sobre el dataset `HappyEthan/metal_pick_place`: 100 episodios de teleoperación real, 76 865 fotogramas a 30 FPS, `robot_type: metal_follower`, licencia Apache-2.0. La normalización de estado y acción es por cuantiles. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Manipulación robótica pick-and-place: coger un cubo de una mesa y colocarlo en una zona marcada, con las acciones `pick`, `place` y `pick_and_place` sobre el objeto `cube` en escena `tabletop`.
- Percepción multimodal con dos vistas RGB simultáneas (cámara fija frontal y cámara de muñeca).
- Condicionamiento por instrucción en lenguaje natural mediante la cadena de tarea `"Pick up the cube and place it at the marked location"`.
- Control articular absoluto a 30 Hz en chunks de 50 pasos, con conversión de unidades radianes ↔ grados y de pinza normalizada ↔ recorrido (0–125, con clamp a totalmente abierta por encima de 100).
- Integración con el ecosistema lerobot para carga, normalización y ejecución del contrato de observación-acción.
- Soporte de tool calling, function calling, agentes multi-paso, matemáticas o generación de código: no disponible (el modelo está especializado en control motor, no en tareas de lenguaje general).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Automatización de pick-and-place en banco de pruebas: el modelo recibe las dos vistas y el estado articular y devuelve un chunk de 50 acciones absolutas a 30 Hz, adecuado para ciclos de recogida y depósito repetitivos sobre una mesa fija con un único tipo de objeto.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del ajuste fino con LoRA sobre un VLA base, ya que el adaptador, la base y el dataset están fijados por commit y el proceso de fusión está documentado.
- Validación en gemelo digital MuJoCo: el paquete incluye evaluación en simulación con layouts y semillas concretas, útil para comparar políticas antes de desplegar en hardware físico.
- Base para ampliar la habilidad a nuevos objetos o posiciones: al ser un LoRA sobre π0.5, se puede entrenar un adaptador adicional sobre el mismo contrato de observación-acción y fusionarlo con el mismo procedimiento.
- Docencia y demostración de contratos de acción: el `rskill.yaml` y la tabla de observación-acción sirven como ejemplo de especificación formal de unidades, frecuencia y normalización en robótica.
- Integración en pipelines de lerobot: el modelo se carga con la librería lerobot y puede encadenarse con otros componentes del ecosistema para experimentos de manipulación con un brazo MakerMods Metal.

## Benchmarks y rendimiento

La model card documenta una evaluación en bucle cerrado en el gemelo MuJoCo (layout A2, semilla 2) sobre 9 episodios de benchmark. El mejor episodio se clasifica como `partial`: la política levanta el cubo y lo deposita a 2,6 cm del marcador, con un 16 % de solapamiento. Siete de los nueve episodios no llegan a levantar el cubo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Resultado |
|---|---|
| Episodios evaluados (MuJoCo, layout A2) | 9 |
| Mejor episodio | partial (cubo depositado a 2,6 cm del marcador, 16 % de solapamiento) |
| Episodios sin levantar el cubo | 7 de 9 |
| Tasa de éxito completa | 0 de 9 documentados |
| Latencia declarada | 500 ms |
| VRAM mínima declarada | 9,5 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: 9,5 GB según la model card, en bf16.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 9,5 GB, encajan GPU con al menos 12–16 GB de VRAM, como RTX 4080, RTX 4090, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 12 GB o más de VRAM en bf16; en tarjetas de 8 GB no cabe sin cuantización adicional, que no está publicada.
- Opciones de despliegue: PyTorch con la librería lerobot y el adaptador pi05 de OpenRAL; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 500 ms por inferencia declarados, con chunks de 50 acciones a 30 Hz, lo que da aproximadamente 1,67 s de ejecución por chunk; el solapamiento entre inferencia y ejecución no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-pi05-makermods_metal-pick_place-bf16 | π0.5 base + LoRA de 3,2 M | no disponible | 0/9 éxitos completos en MuJoCo; mejor caso partial | permissive-research (base PI con acuerdo comercial) | Hugging Face, requiere base y adaptador |
| lerobot/pi05_base | π0.5 (PaliGemma 3B + experto de acción) | no disponible | no disponible en esta información | licencia de PI (no disponible el detalle) | Hugging Face |
| makermods/pi05_metal_pick_place_lora | LoRA de 12,8 MB sobre π0.5 | no disponible | no disponible en esta información | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a lo documentado para este paquete.

## Limitaciones y advertencias

- Rendimiento limitado: en la evaluación documentada, ninguno de los 9 episodios completa la tarea; 7 de 9 ni siquiera levantan el cubo. No es apto para producción sin un ajuste adicional.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con 100 episodios de un único operador y una única configuración de mesa, es probable un sesgo hacia esa disposición física concreta.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar trayectorias plausibles que no completen la tarea, como muestra la evaluación.
- Limitaciones de idioma: solo inglés; la instrucción de tarea está fijada a una cadena concreta.
- Limitaciones de contexto y escena: una sola escena `tabletop`, un solo objeto `cube` y un único embodiment `makermods_metal`; no se documenta generalización a otras mesas, objetos o brazos.
- Restricciones de licencia: la licencia es `permissive-research`; los pesos base de Physical Intelligence requieren un acuerdo con el proveedor para uso comercial.
- Dependencia de versiones fijas: el paquete solo funciona con el adaptador `makermods/pi05_metal_pick_place_lora` en el commit `87595e59` y la base `lerobot/pi05_base` en `22c30e5b`; cualquier otra base se rechaza.
- Unidades y calibración: el contrato asume grados con los signos y ceros del URDF y un recorrido de pinza de 0 a 125; una calibración distinta del hardware invalida las acciones.
- Repositorio sin pesos: el tamaño del repo es 0,0 GB; el despliegue requiere descargar el adaptador y la base por separado.
- Sin datos de latencia en hardware concreto: los 500 ms declarados no especifican la GPU utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-pi05-makermods_metal-pick_place-bf16
- Adaptador LoRA: https://huggingface.co/makermods/pi05_metal_pick_place_lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HappyEthan/metal_pick_place
- Paper π0.5: https://arxiv.org/abs/2504.16054
- Vídeo de rollout en MuJoCo: https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/simulation/metal-pick-place_pi05-metal-pick-place_fail/full.mp4
