# BravoRobots/microduck-indoor-object-search-rl

## Resumen

MicroDuck Indoor Object Search RL es un proyecto de investigación en simulación que entrena un supervisor de búsqueda de objetos mediante PPO (Proximal Policy Optimization) y lo ejecuta sobre un robot cuadrúpedo MicroDuck de flotación libre en una habitación amueblada de MuJoCo. Lo desarrolla BravoRobots y se publica como release de investigación en simulación, versión 0.2.1. El modelo resuelve un problema acotado: localizar uno de tres objetos específicos (bola roja, caja azul, cilindro amarillo) en un entorno interior con oclusión y obstáculos, sin recibir las coordenadas del objeto oculto.

La política es un supervisor de búsqueda de 45 entradas y 6 acciones, no una política motora. Se entrena en un proxy planar SE(2) rápido con oclusión, visibilidad de objetos, huellas de obstáculos y memoria de visitas, y se evalúa sobre el cuerpo articulado real en MuJoCo con contactos, actuadores BAM M6 y políticas motoras ONNX a 50 Hz. La locomoción reutiliza una marcha entrenada en el taller (`progresion_4_mejor.onnx`) y los checkpoints de Pollen (`velstand.onnx`, `alpha_stand.onnx`).

Es relevante ahora porque ofrece un pipeline reproducible de extremo a extremo (escena, entorno vectorizado en GPU, entrenador PPO, capa de seguridad por profundidad y evaluador independiente) con métricas publicadas y hashes de checkpoint, lo que facilita auditar la brecha entre el proxy de entrenamiento y el cuerpo completo. No reconoce objetos domésticos arbitrarios ni corre de forma autónoma en un MicroDuck físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (supervisor de búsqueda) entrenada con PPO; entrada 45 dimensiones, salida 6 acciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; memoria de visitas y último avistamiento como estado) |
| Tipos de cuantización | no disponible (pesos exportables a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | en, es (documentación y guías; el modelo no procesa lenguaje) |
| Licencia | mixta: Apache-2.0 y CC-BY-NC-SA-4.0 (detalle en THIRD_PARTY.md) |
| Formato de pesos | PyTorch y ONNX (políticas motoras y checkpoints del supervisor) |

## Arquitectura y entrenamiento

El supervisor es una política de RL con observación de 45 dimensiones que incluye profundidad frontal, detección visible del objeto solicitado, memoria de último avistamiento, memoria de visitas, odometría y la acción previa. Nunca recibe las coordenadas del objeto oculto. La percepción de cuerpo completo usa RGB renderizado y profundidad sintética; la segmentación y el ground truth del objetivo quedan reservados para diagnóstico y para el evaluador independiente. El entrenamiento se realiza con PPO en un proxy planar SE(2) con oclusión, visibilidad de objetos, huellas de obstáculos y memoria de visitas, y el checkpoint seleccionado corresponde a la transición 10.444.800 de un total de 11.993.088 transiciones del proxy.

La evaluación se hace sobre el robot articulado en MuJoCo con contactos, actuadores BAM M6 y políticas motoras ONNX a 50 Hz. El supervisor no se ha ajustado dentro de la dinámica rígida completa. Una capa de seguridad basada solo en profundidad comprueba el corredor frontal a 10 Hz y puede sustituir un avance inseguro por un giro; tanto el controlador RL como los controladores reactivos de referencia usan la misma capa, de modo que el éxito de cuerpo completo describe el sistema RL + guard + políticas motoras, no solo el RL. La locomoción reutiliza la marcha `progresion_4_mejor.onnx` entrenada en el taller y los checkpoints `velstand.onnx` y `alpha_stand.onnx` de Pollen, identificados como tales y no como checkpoints oficiales de Pollen ni como entrenados por este proyecto.

## Capacidades

- Búsqueda de tres objetos especificados en interiores simulados: bola roja (goal 0), caja azul (goal 1) y cilindro amarillo (goal 2).
- Navegación con oclusión y obstáculos en una habitación amueblada de MuJoCo, con presupuesto por defecto de 108 segundos simulados.
- Memoria de visitas y de último avistamiento para evitar reexplorar zonas ya cubiertas.
- Capa de seguridad reactiva por profundidad que evita avances inseguros mediante giros.
- Ejecución de cuerpo completo con contactos, actuadores BAM M6 y locomoción articulada a 50 Hz.
- Evaluación reproducible con semillas fijas, hashes de checkpoint y un evaluador independiente.
- Registro de resultados en JSON que distingue éxito, timeout, caída, confirmación falsa y cierre interactivo del visor.
- No soporta tool calling, function calling, agentes multi-paso generales, visión semántica de objetos arbitrarios ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en sim2real de búsqueda de objetos: el pipeline permite entrenar en el proxy planar y medir la degradación al pasar al cuerpo articulado completo, con métricas separadas de éxito, caídas y contactos con mobiliario.
- Evaluación de capas de seguridad reactivas: al compartir la misma guard de profundidad entre el controlador RL y los controladores reactivos de referencia, se puede aislar la contribución del RL frente a la del módulo de seguridad.
- Docencia y reproducción de experimentos de RL: el proyecto incluye escena editable en Blender, 17 STL originales, generador de escena con semilla, entorno vectorizado en GPU, entrenador PPO y comprobaciones automatizadas en CI, lo que permite reproducir resultados en CPU para la demo y en GPU CUDA para el entrenamiento.
- Desarrollo de políticas de exploración con memoria: el estado de memoria de visitas y último avistamiento sirve como banco de pruebas para estudiar estrategias de cobertura en entornos con oclusión.
- Integración de percepción sintética: el uso de RGB renderizado y profundidad sintética con ground truth reservado para diagnóstico permite validar detectores y segmentadores contra un evaluador independiente.
- Generación de vídeos y reportes de rollout: `run.sh rehearse` permite grabar ejecuciones headless en MP4 y emitir informes JSON por episodio, útil para documentar experimentos y comparar semillas.
- Base para extensiones a objetos arbitrarios: la arquitectura de supervisor con detección visible y memoria es un punto de partida para sustituir los tres objetivos fijos por un detector genérico, aunque esa capacidad no está incluida en la versión 0.2.1.

## Benchmarks y rendimiento

| Evaluación | Éxito | Caídas | Confirmaciones falsas | Episodios con contacto con mobiliario |
|---|---:|---:|---:|---:|
| Supervisor PPO + guard, cuerpo MuJoCo | 49/60 (81,7 %) | 9 | 0 | 4 |
| Controlador reactivo + misma guard | 28/60 (46,7 %) | 0 | 0 | 3 |
| PPO, proxy planar de entrenamiento | 237/256 (92,6 %) | n/a | n/a | n/a |

La tasa de intentos de colisión en el proxy es del 35,2 % de los pasos activos. El checkpoint seleccionado proviene de la transición 10.444.800 de 11.993.088 transiciones totales del proxy. La demo grabada (semilla 0, goal 0) registra éxito, sin caída y sin contacto con mobiliario en un rollout de 10,2 segundos; el autor advierte que esta demo individual no sustituye la evaluación con semillas fijas.

## Requisitos de hardware

- La demo entrenada funciona en CPU; una GPU CUDA acelera el entrenamiento.
- Plataforma soportada: Linux x86-64, Python 3.12, OpenGL y `uv`; la instalación descarga varios GB de dependencias de PyTorch.
- Renderizado headless en GPU mediante `MUJOCO_GL=egl` (valor por defecto de `run.sh`); en máquinas solo CPU con Linux se requiere `libosmesa6` y `MUJOCO_GL=osmesa`.
- El visor interactivo requiere una sesión de escritorio.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; solo se indica que se acelera el entrenamiento con CUDA.
- Despliegue: scripts `run.sh` (`doctor`, `rehearse`, `preview`), MuJoCo y ONNX Runtime para las políticas motoras; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; las políticas motoras se ejecutan a 50 Hz y la guard de profundidad a 10 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BravoRobots/microduck-indoor-object-search-rl | Supervisor RL para búsqueda de objetos en MuJoCo | no disponible | no disponible | 81,7 % de éxito en cuerpo completo (49/60) | mixta Apache-2.0 y CC-BY-NC-SA-4.0 | Hugging Face y GitHub |
| pollen-robotics/microduck_rl | Entornos de entrenamiento RL para MicroDuck (mjlab) | no disponible | no disponible | no disponible | no disponible | GitHub |
| LuoBoxiaolifeidao/microduck_rl | Entornos de entrenamiento RL para MicroDuck con variantes Backlash | no disponible | no disponible | no disponible | no disponible | GitHub |

Los dos proyectos comparables son entornos de entrenamiento para el mismo robot, no supervisores de búsqueda de objetos con métricas de éxito publicadas, por lo que la comparación directa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo reconoce tres objetos especificados (bola roja, caja azul, cilindro amarillo); no reconoce objetos domésticos arbitrarios.
- No funciona de forma autónoma en un MicroDuck físico: es una release de investigación en simulación.
- El supervisor se entrena en un proxy planar SE(2) y no se ha ajustado dentro de la dinámica rígida completa; la brecha proxy-cuerpo es explícita (92,6 % frente a 81,7 % de éxito).
- El éxito de cuerpo completo corresponde al sistema RL + guard + políticas motoras, no al RL aislado.
- Se registran 9 caídas y 4 episodios con contacto con mobiliario en 60 episodios de la evaluación principal.
- La tasa de intentos de colisión en el proxy es del 35,2 % de los pasos activos.
- Riesgo de confirmación falsa: 0 en la evaluación publicada, pero el propio pipeline contempla esta categoría en los informes JSON.
- Licencia mixta Apache-2.0 y CC-BY-NC-SA-4.0: la componente CC-BY-NC-SA-4.0 restringe el uso comercial; debe revisarse THIRD_PARTY.md antes de cualquier despliegue comercial.
- La locomoción reutiliza checkpoints de terceros (`progresion_4_mejor.onnx`, `velstand.onnx`, `alpha_stand.onnx`) que no son oficiales de Pollen ni entrenados por este proyecto.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: el modelo no procesa lenguaje; los idiomas en, es se refieren a la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/BravoRobots/microduck-indoor-object-search-rl
- GitHub Bravo Robots: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl
- GitHub David: https://github.com/david2526IA/microduck-indoor-object-search-rl
- Guía en español: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/docs/GUIA_ES.md
- Model card del release: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/outputs/release/MODEL_CARD.md
- Resultados medidos: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/outputs/release/RESULTS.json
- Contribución: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/CONTRIBUTING.md
- Licencias de terceros: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/THIRD_PARTY.md
- Solución de problemas: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/docs/TROUBLESHOOTING.md
- Demo en vídeo: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/docs/media/demo.mp4
- Informe del episodio de demo: https://github.com/Bravo-Robots/microduck-indoor-object-search-rl/blob/main/benchmarks/v0.2/demo.json
- pollen-robotics/microduck_rl: https://github.com/pollen-robotics/microduck_rl
- LuoBoxiaolifeidao/microduck_rl: https://github.com/LuoBoxiaolifeidao/microduck_rl
