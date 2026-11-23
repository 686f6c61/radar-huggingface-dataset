# carlid/frostmarsh-neural-world

## Resumen

Frostmarsh Neural World es un conjunto de checkpoints preentrenados en PyTorch (`.pt`) y ONNX (`.onnx`) publicados por el usuario carlid para el proyecto Frostmarsh, un servidor de mundo neural volumetrico 3D de 256x256x4 con agentes controlados por politica neuronal. No es un modelo de lenguaje: es una coleccion de modelos especializados en simulacion de mundo, renderizado neuronal y politicas de agente para un entorno de juego, empaquetados bajo la etiqueta `world-model` y `reinforcement-learning`.

El paquete incluye seis componentes principales: un modelo de mundo autoritativo a 10 Hz (`world_model`, ~460 KB), un modelo de ecosistema (`ecosystem_model`, ~240 KB), una politica de bots de doble flujo que lee latentes compartidos (`bot_policy`, 152.157 parametros), dos renderizadores de cliente ligero (`renderer_model` y `renderer_v2`, ~400 KB cada uno) y tres niveles de renderizado neuronal (`tier1_painterly`, `tier2_deferred_3d`, `tier3_gs_gen`). Todos los artefactos son de tamano muy reducido, lo que sugiere un diseno orientado a inferencia de baja latencia en GPU mas que a capacidad generativa general.

La relevancia de esta publicacion radica en su enfoque de "shared-latent": la politica de bots consume directamente los tensores `Z_world` y `Z_eco` desde la VRAM de la GPU sin copia, lo que el autor reporta como una mejora sustancial frente a una ablacion ciega en tareas de evasion de incendios y precision de elementos fisicos. Es material de investigacion para quienes trabajan en mundos neuronales, renderizado neuronal y agentes RL integrados en motores de juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales especificas por componente (modelo de mundo, ecosistema, politica de agente, renderizadores); no se detalla la topologia interna |
| Parametros totales | No disponible como cifra agregada; por componente: `bot_policy` 152.157, `tier3_gs_gen` 93.860, resto expresado en tamano de fichero (~240 KB a ~1,5 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo de mundo opera sobre tensores `[L, 18, 256, 256]` y expone `[L, 48, 256, 256]` |
| Tipos de cuantizacion | No disponible; se distribuyen pesos en `.pt` (PyTorch) y `.onnx` (ONNX) sin indicar cuantizaciones |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El autor describe un servidor de mundo neural volumetrico 3D de 256x256x4 que opera a 10 Hz y expone un trunk latente `Z_world` de forma `[L, 48, 256, 256]`. El modelo de ecosistema expone un trunk `Z_eco` de forma `[1, 32, 256, 256]`. La politica de bots (`BotPolicyNet`) es una red de dos flujos que lee ambos latentes de forma zero-copy desde la VRAM de la GPU, lo que implica que el modelo de mundo y el de ecosistema se ejecutan en el mismo dispositivo y comparten memoria sin transferencias intermedias. El paquete incluye ademas tres niveles de renderizado: un GAN painterly de 512x512 con WorldTex (tier 1), un renderizador deferred 3D con G-buffer de camara libre (tier 2) y un generador de 3D Gaussian Splatting dinamico equivariante a traslacion (tier 3).

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo supervisado. El autor menciona scripts de entrenamiento y ablacion en el repositorio de GitHub, pero no se aportan hiperparametros ni curvas de entrenamiento en la model card. La innovacion tecnica destacada es el acceso zero-copy a los latentes compartidos entre el mundo y la politica, junto con la equivariancia a traslacion en el generador de Gaussian Splatting del tier 3.

## Capacidades

- Simulacion autoritativa de mundo neuronal 3D volumetrico a 10 Hz sobre tensores de 256x256x4.
- Simulacion de ecosistema (flora y fauna) mediante un modelo neuronal dedicado que expone su propio latente.
- Control de agentes (bots) mediante una politica neuronal de doble flujo que consume latentes de mundo y ecosistema.
- Renderizado neuronal de cliente ligero en dos versiones (v1 y v2, descritas como decodificadores "A+").
- Renderizado painterly 512x512 con GAN y WorldTex (tier 1).
- Renderizado deferred 3D con G-buffer y camara libre (tier 2).
- Generacion dinamica de 3D Gaussian Splatting equivariante a traslacion (tier 3).
- Exportacion a ONNX de la mayoria de componentes para despliegue fuera de PyTorch.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes multi-paso ni multilingues.

## Casos de uso

- Investigacion en mundos neuronales: el `world_model` puede integrarse como servidor autoritativo de un entorno 3D de 256x256x4 para estudiar dinamicas de mundo aprendidas frente a simuladores fisicos tradicionales, gracias a su tamano de ~460 KB y su frecuencia de 10 Hz.
- Agentes RL en entornos de juego: `bot_policy` permite desplegar bots que leen latentes `Z_world` y `Z_eco` directamente de VRAM, adecuado para experimentos de politicas que requieren acceso de baja latencia al estado del mundo (0,66 ms para 12 bots y 1,49 ms para 256 bots en GB10, segun el autor).
- Renderizado neuronal en cliente ligero: `renderer_model` y `renderer_v2` en ONNX permiten generar frames en un cliente delgado sin replicar la logica del servidor, util para prototipos de streaming de juego o visualizacion remota.
- Renderizado artistico en tiempo real: `tier1_painterly` (GAN 512x512 con WorldTex) sirve para generar estetica painterly sobre el estado del mundo, aplicable a demos de estilo visual o prototipos de direccion de arte.
- Renderizado 3D con camara libre: `tier2_deferred_3d` habilita un G-buffer neuronal con camara libre, util para herramientas de inspeccion del mundo o capturas desde angulos no fijados por el servidor.
- Gaussian Splatting dinamico: `tier3_gs_gen` (93.860 parametros, equivariante a traslacion) puede emplearse para generar representaciones splatting de escenas dinamicas en pipelines de investigacion sobre renderizado neuronal.
- Evaluacion de politicas con ablaciones: los JSON de `metrics/` y los scripts de ablacion permiten reproducir la comparacion entre politica shared-latent y ablacion ciega, util como banco de pruebas para metodos de representacion de estado en RL.

## Benchmarks y rendimiento

El autor publica una ablacion de `BotPolicyNet` sobre mundos 256x256x4 no vistos:

| Metrica | Shared-Latent (+Z_world +Z_eco) | Ablacion ciega (solo ledger) | Ganancia |
|---|---:|---:|---:|
| Precision de elementos en combo fisico | 92,97% | 42,68% | +50,29 pp |
| Coseno de evasion de incendios | +0,7473 | -0,1239 | +0,8712 |
| Precision global de elementos | 95,63% | 74,05% | +21,58 pp |
| Coseno de movimiento / apuntado | 0,9278 / 0,9724 | 0,8788 / 0,9721 | +0,0490 / +0,0003 |

Ademas, el autor reporta latencias de `bot_policy` de 0,66 ms para 12 bots y 1,49 ms para 256 bots en GB10. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza no lingueistica del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los checkpoints (de ~240 KB a ~1,5 MB) el conjunto cabe holgadamente en cualquier GPU con unos pocos cientos de MB libres, si bien el consumo real depende de los tensores intermedios `[L, 48, 256, 256]` y `[1, 32, 256, 256]`.
- GPU recomendadas: el autor cita GB10 (NVIDIA Grace Blackwell) para las mediciones de latencia de `bot_policy`; no se documentan otras GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los pesos, aunque no se aportan mediciones en RTX 4090, RTX 3090 u otras tarjetas de consumo.
- Opciones de despliegue: PyTorch (`.pt`) y ONNX Runtime (`.onnx`); el repositorio de GitHub menciona un daemon con CUDA Graph y un cliente hibrido `wgpu`, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 0,66 ms para 12 bots y 1,49 ms para 256 bots en GB10 segun el autor; no se aportan cifras para el resto de componentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Frostmarsh Neural World (carlid) | Mundo neuronal + politica RL + renderizado | 152.157 (`bot_policy`), 93.860 (`tier3_gs_gen`); resto en KB | Mundo 256x256x4 a 10 Hz | MIT | Hugging Face + GitHub |
| GameNGen (Google) | Mundo neuronal para Doom | No disponible en la informacion | No disponible | No disponible | Paper / demo |
| Genie (DeepMind) | Mundo generativo interactivo | No disponible en la informacion | No disponible | No disponible | Paper / demo |
| DIAMOND (Mirage) | Mundo neuronal para Atari | No disponible en la informacion | No disponible | No disponible | Paper / codigo |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de lenguaje ni un modelo de vision general; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- No se documentan sesgos conocidos, pero al tratarse de un mundo sintetico y una politica entrenada para un entorno concreto, su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion en el sentido de generar estados de mundo fisicamente inconsistentes: no se aportan metricas de plausibilidad fisica mas alla de la ablacion reportada.
- Limitaciones de contexto e idioma: no aplica en el sentido linguistico, pero el mundo esta acotado a 256x256x4 y a 10 Hz; no se documenta generalizacion a otras resoluciones o frecuencias.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no aporta garantias ni condiciones adicionales; conviene revisar el repositorio de GitHub para dependencias de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- El tamano del repo es de 0,0 GB, lo que sugiere que los pesos podrian no estar completamente subidos o que el empaquetado es minimo; verificar la integridad de los ficheros antes de usarlos en produccion.
- No se documentan procesos de RLHF, DPO ni evaluaciones de seguridad; el uso en produccion requiere validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/carlid/frostmarsh-neural-world
- Repositorio GitHub: https://github.com/devteapot/frostmarsh
- Captura de referencia: `assets/unified_live_1080p_hud.png` (incluida en el repo de Hugging Face)
- Metricas de ablacion: `metrics/` (incluidas en el repo de Hugging Face)
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
