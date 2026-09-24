# RLobot-jun/gr00t-n17-bigenlight-50per-15hz-freshbc10k-svf-iql50k-e08-k06-g025-lora16-step10000

## Resumen

Este repositorio no es un modelo completo, sino un paquete de adaptadores ligeros para el actor de GR00T N1.7, el modelo de robotica (vision-lenguaje-accion) de NVIDIA. Lo publica el usuario RLobot-jun como artefacto de investigacion derivado de un modelo base tambien suyo (`gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000`) que, a su vez, es un bundle de cabeza BC de NVIDIA. El paquete contiene exclusivamente pesos de adaptacion: una LoRA de rango 16 sobre el actor DiT, un ensemble Q de IQL congelado y unas cabezas de soft-value entrenadas, sin incluir los pesos del VLM ni del BC originales.

El objetivo es aplicar aprendizaje por refuerzo (SVF, *steering value flow*) sobre una politica inicializada con imitacion (BC) a 15 Hz, usando recompensas con descuento por chunk y guiado por Q. El modelo esta pensado para control de robots a 15 Hz (no a 30 Hz) y esta entrenado sobre 50 episodios por tarea. Es relevante porque documenta una receta reproducible de refinamiento RL sobre un backbone VLA de 3B con un coste de almacenamiento minimo (~130 MB de adaptadores), aunque con requisitos estrictos de restauracion del modelo base exacto.

La relevancia practica es limitada fuera del ecosistema GR00T N1.7: el adaptador no es un directorio `from_pretrained` autonomo, exige la revision exacta del BC base y no se ha validado con pruebas de paridad en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre GR00T N1.7: LoRA (rank 16, alpha 32) sobre el actor DiT, mas ensemble Q de IQL y cabezas soft-value Fourier-time |
| Parametros totales | Modelo base GR00T-N1.7-3B (3 000 M aprox.); adaptadores ~130 MB en total (LoRA 26,2 MB + Q 66,8 MB + inner critic 37,1 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | nvidia-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (`actor_lora.safetensors`, `env_q.safetensors`, `inner_critic.safetensors`) |

## Arquitectura y entrenamiento

El adaptador actua sobre el actor DiT de GR00T N1.7 mediante una LoRA de rango 16 y alpha 32, inyectada con `inject_dit_lora(head, rank=16, alpha=32)` y envuelta en `ProjectedFlowActor`. El VLM, la proyeccion de observacion del BC, los codificadores/decodificadores de estado y accion y la referencia permanecen congelados; tambien se congela el Q durante todo el SVF. El componente Q es un ensemble de IQL con expectile 0.8, entrenado durante 50 000 actualizaciones con MSE escalar, 10 cabezas Q independientes con reinyeccion de accion y agregacion por media, incluyendo propiocepcion. La anchura de caracteristicas es 2212 (features VL agrupadas post-BC + propiocepcion normalizada + embodiment), y Q recibe ademas el chunk de accion limpio.

El refinamiento SVF usa kappa=0.6, g=0.25, c=1.44, tamano de lote 32, learning rate de actor e inner 3e-4, 4 pasos de flow y 8 candidatos (con primera velocidad de referencia compartida). Hay dos cabezas MLP internas completas con tiempo Fourier de 16 dimensiones, minimo para regresion y gradiente de guiado por media. El horizonte de accion valido es 16x7 y el padding del modelo es 40x132, con indices de accion IQL que seleccionan las 112 coordenadas validas. La recompensa es -1 por accion primitiva a 15 Hz, exito con goal 0, gamma 0.99 con retorno descontado por chunk y bootstrap gamma^16. No se aplica aumento de imagenes. El entrenamiento parte de un BC inicializado desde cero a 15 Hz (BC10k), seguido de 10 000 actualizaciones SVF; no es el pipeline historico de 30 Hz -> 15 Hz.

## Capacidades

- Generacion de chunks de accion para control robotico a 15 Hz (horizonte valido 16x7, 112 coordenadas).
- Refinamiento RL de una politica de imitacion mediante SVF con guiado por Q congelado.
- Puntuacion de acciones mediante el ensemble Q de IQL y el critic interno (soft-value).
- Condicionamiento por propiocepcion y por el identificador de embodiment, ademas de features de vision-lenguaje post-BC.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de guiado por valor soft (inner critic con tiempo Fourier), con opcion de desplegar solo el actor (LoRA + BC exacto) sin los critics.

## Casos de uso

- Investigacion en aprendizaje por refuerzo sobre politicas VLA: el paquete permite reproducir un ciclo BC -> SVF usando el Q congelado y las cabezas soft-value, sirviendo como punto de partida para experimentar con expectiles, kappa y agregacion de Q.
- Refinamiento de una politica de imitacion a 15 Hz: partiendo del BC exacto de 10 000 pasos, se aplican 10 000 actualizaciones SVF adicionales para mejorar el exito en tareas concretas con recompensa escasa (exito/fallo).
- Benchmarking interno de variantes de criticos: al comparar esta receta IQL (expectile 0.8, 10 cabezas, agregacion por media) con criticos alternativos, el bundle sirve de referencia reproducible dentro del mismo backbone.
- Despliegue de actor ligero: en produccion o laboratorio, aplicar solo `actor_lora.safetensors` sobre el BC exacto reduce el almacenamiento necesario frente a duplicar pesos completos.
- Reutilizacion del ensemble Q para *scoring* offline de trayectorias: los ficheros de criticos (opcionales) permiten puntuar chunks de accion sin reentrenar.
- Experimentacion con guiado por gradiente de valor: el inner critic condicionado en tiempo Fourier posibilita estudiar guiado por soft-value en la generacion de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de exito, tasas de tarea ni comparaciones cuantitativas; tampoco se declara una prueba de paridad en robot real.

## Requisitos de hardware

- El adaptador por si solo ocupa ~130 MB, pero la inferencia requiere cargar el modelo base GR00T-N1.7-3B completo y la cabeza BC exacta.
- VRAM estimada para el base de 3B en bf16/fp16: en torno a 6-8 GB solo de pesos, mas activaciones y buffers de vision; se recomienda una GPU con 16-24 GB o superior (no confirmado en la model card).
- GPU recomendadas: no disponibles en la informacion; por tamano del base, una GPU de 24 GB (RTX 4090, A5000) o superior (A100, H100) seria lo previsible, pero no esta declarado.
- Compatibilidad con GPU de consumo: probable para el base de 3B si cabe en 16-24 GB, pero no confirmado por el autor.
- Opciones de despliegue: carga mediante el codigo de GR00T N1.7 junto con su processor y estadisticas; aplicacion de `inject_dit_lora` y `load_actor_adapter` de `gr00t.rl.export_adapter`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un controlador de robot).
- Latencia y throughput: no disponibles. Se opera a 15 Hz, lo que implica un presupuesto temporal de ~66,7 ms por accion primitiva, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SVF sobre GR00T N1.7) | Adaptador RL sobre VLA | Adaptadores ~130 MB + base 3B | No disponible | nvidia-license | HuggingFace (bundle de adaptador) |
| GR00T N1.7 base (`GR00T-N1.7-3B`) | VLA para robotica | 3B | No disponible | nvidia-license | NVIDIA / Cosmos HF |
| BC base (`gr00t-n17-bigenlight-...-bc-head-only-step10000`) | Bundle de cabeza BC | No disponible | No disponible | nvidia-license | HuggingFace |
| Otros VLA de robotica (p. ej. OpenVLA, pi0) | VLA | No disponible en esta informacion | No disponible | No disponible | No verificado |

No se dispone de datos cuantitativos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no se puede cargar con `from_pretrained` directo ni usar como checkpoint de reanudacion de entrenamiento.
- Requiere la revision exacta del BC base (`970ca589335032e0fb37961dfa5caa83a5c511be`); aplicarlo sobre el BC de 20k, otra revision o un modelo ya adaptado con SVF es incorrecto.
- Solo funciona a 15 Hz; no es valido para 30 Hz.
- No se declara ninguna prueba de paridad en robot real; unicamente se verifica que los pesos congelados coinciden con el BC exacto y que los tensores exportados son finitos.
- Sin resultados de benchmarks publicados: el rendimiento real en tareas no esta cuantificado.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplicable en el sentido generativo clasico, pero existe riesgo de acciones incorrectas sin validacion en robot.
- Limitaciones de contexto o idioma: no disponibles.
- Licencia `nvidia-license`: hay que revisar el fichero LICENSE antes de cualquier uso comercial; el uso del base NVIDIA y el acceso a Cosmos HF pueden imponer condiciones adicionales.
- Dependencia de acceso a Cosmos HF: el constructor del modelo GR00T exige permisos de acceso normales a Cosmos.
- El paquete no incluye pesos de BC, VLM, referencia, objetivos EMA, optimizador, RNG ni la red V de IQL.

## Enlaces

- HuggingFace (este adaptador): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-15hz-freshbc10k-svf-iql50k-e08-k06-g025-lora16-step10000
- Modelo base (BC head-only): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000
- Revision exacta del base: 970ca589335032e0fb37961dfa5caa83a5c511be
- Codigo: https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
- Licencia: fichero `LICENSE` del repositorio (nvidia-license)
