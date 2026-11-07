# OpenRAL/rskill-act-aloha-aloha_transfer_cube-fp32

## Resumen

rskill-act-aloha-aloha_transfer_cube-fp32 es un paquete de habilidad robotica (rSkill) publicado por OpenRAL que envuelve el modelo ACT (Action Chunking Transformer) entrenado por LeRobot para la tarea de transferencia bimanual de cubos en el simulador ALOHA. ACT es una arquitectura transformer encoder-decoder de aproximadamente 52 millones de parametros, presentada en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (Zhao et al., 2023), que predice secuencias de acciones (action chunks) de longitud 100 a partir de observaciones visuales y propioceptivas.

El paquete no copia los pesos: actua como una capa de metadatos y manifiesto (`rskill.yaml`) sobre el checkpoint upstream `lerobot/act_aloha_sim_transfer_cube_human`, anadiendo comprobacion de capacidades, exposicion de licencia, presupuestos de latencia e integracion con el registro local de OpenRAL. Esta pensado para el ecosistema de evaluacion y despliegue de politicas vision-language-action (VLA) en robotica bimanual.

Su relevancia actual radica en que estandariza el empaquetado de checkpoints de robotica dentro de un formato reproducible, permitiendo comparar y ejecutar habilidades concretas (transferencia de cubo, insercion) sobre el mismo embodiment ALOHA con presupuestos de latencia declarados y licencia MIT, lo que facilita su uso tanto en simulacion como en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Action Chunking Transformer, ACT) |
| Parametros totales | ~52 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones por paso; action chunk de 100 acciones) |
| Tipos de cuantizacion | fp32 (declarado); bf16 autocast soportado en inferencia |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos upstream en `lerobot/act_aloha_sim_transfer_cube_human`) |
| Runtime | PyTorch |
| Embodiment | aloha (bimanual, 14-DoF: 2 brazos de 7-DoF con pinzas paralelas) |
| Sensores requeridos | `observation.images.top` (RGB 640x480, float32) |
| Action chunk | 100 |
| Latencia declarada | 25 ms por chunk (en caliente); ~12 ms con bf16 autocast en RTX 4070 Laptop |
| VRAM minima | no disponible |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es un transformer encoder-decoder disenado para manipulacion bimanual de precision. El encoder procesa las observaciones (imagen RGB cenital de 640x480 y estado propioceptivo) y el decoder genera un chunk de 100 acciones de forma no autoregresiva, lo que reduce el error de acumulacion y mejora la consistencia temporal en tareas de contacto. La arquitectura incluye un cuello de botella latente estilo VAE/CVAE para modelar la variabilidad de las demostraciones humanas.

El modelo fue entrenado por el equipo de LeRobot sobre el conjunto de demostraciones humanas de la tarea ALOHA bimanual cube-transfer (`gym-aloha`), con una unica camara cenital. El checkpoint publicado es anterior a la migracion de LeRobot a `PolicyProcessorPipeline`: los buffers de normalizacion media/desviacion estandar viven dentro de `model.safetensors`, la `ACTPolicy` moderna los descarta al cargar y el adaptador de OpenRAL los reaplica. El paquete declara un presupuesto de latencia de 25 ms por chunk en caliente.

## Capacidades

- Generacion de acciones motoras bimanuales (chunks de 100 acciones) para la tarea de transferencia de cubo.
- Percepcion visual a partir de una unica camara RGB cenital (640x480).
- Control de dos brazos de 7-DoF con pinzas paralelas (14-DoF en total).
- Ejecucion en simulacion MuJoCo mediante `gym-aloha`, con dinamica de contacto real.
- Comprobacion de capacidades y exposicion de licencia a traves del manifiesto rSkill.
- Integracion con el registro local de OpenRAL y con presupuestos de latencia declarados.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingues en el sentido de los LLM: es una politica visomotora especifica de tarea.

## Casos de uso

- Evaluacion reproducible de politicas bimanuales: permite lanzar el protocolo de 50 episodios (`openral benchmark run --suite aloha --rskill act-aloha`) contra el simulador MuJoCo para medir tasa de exito en la transferencia de cubo.
- Demo de un solo episodio para validacion rapida: `just sim-act-aloha` ejecuta una BenchmarkScene con guardado de video, util para verificar la instalacion y el correcto reaplicado de los buffers de normalizacion.
- Investigacion en aprendizaje por imitacion: sirve como linea base ACT frente a metodos mas recientes (difusion, VLA) sobre el mismo conjunto de demostraciones ALOHA.
- Desarrollo de pipelines de robotica con latencia acotada: el presupuesto de 25 ms por chunk (o ~12 ms con bf16 autocast) permite planificar control en bucle cerrado en hardware consumer.
- Pruebas de integracion de sensores: valida el flujo completo desde una camara RGB cenital hasta acciones bimanuales, util para depurar calibracion y sincronizacion.
- Comparacion entre tareas hermanas: junto con `rskill-act-aloha-insertion`, demuestra como un mismo formato de empaquetado cubre checkpoints especificos de tarea del mismo paper.
- Formacion y docencia en robotica: ejemplo compacto (~52 M de parametros) de una politica visomotora ejecutable en simulador sin hardware fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el benchmark ALOHA bimanual cube-transfer (`gym-aloha`) y un protocolo de evaluacion de 50 episodios (`eval/aloha_transfer_cube.json`), pero no incluye cifras de tasa de exito ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Con ~52 M de parametros en fp32 el peso ronda los 200 MB, por lo que la huella de memoria es reducida, pero el consumo real depende del runtime, los buffers de imagen y el lote.
- GPU recomendadas: la model card menciona explicitamente una RTX 4070 Laptop para la medicion de latencia con bf16 autocast (~12 ms por chunk). No se indican otras GPU.
- Cabe en GPU consumer: si, segun la referencia a RTX 4070 Laptop; no se especifican modelos inferiores.
- Opciones de despliegue: PyTorch como runtime declarado, integrado en OpenRAL mediante `just` y `uv`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica motora).
- Latencia: 25 ms por chunk en caliente; ~12 ms con bf16 autocast en RTX 4070 Laptop. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-act-aloha-aloha_transfer_cube-fp32 | ~52 M | Transferencia de cubo bimanual ALOHA | action chunk 100 | MIT | Hugging Face (wrapper) |
| rskill-act-aloha-insertion | no disponible | Insercion bimanual ALOHA | no disponible | MIT (segun repo) | GitHub OpenRAL |
| lerobot/act_aloha_sim_transfer_cube_human | ~52 M | Transferencia de cubo bimanual ALOHA | action chunk 100 | MIT | Hugging Face (upstream) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de tarea: solo realiza transferencia de cubo bimanual; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de una unica camara cenital RGB; no usa vistas de muneca ni de tercera persona, lo que limita la robustez ante oclusiones.
- Los buffers de normalizacion media/std no se cargan con la `ACTPolicy` moderna de LeRobot; es imprescindible el adaptador de OpenRAL para reaplicarlos, o los resultados seran incorrectos.
- Entrenado en simulacion (`gym-aloha` MuJoCo); la transferencia a hardware fisico ALOHA no esta garantizada por la informacion disponible.
- Idiomas: solo ingles en la documentacion y metadatos.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas fuera de distribucion; no se documentan tasas de fallo.
- Licencia MIT permite uso comercial (`is_commercial_use_allowed: true`), pero los ficheros wrapper de OpenRAL siguen Apache-2.0; conviene revisar ambas.
- La fecha de creacion (2026-06-04) y actualizacion (2026-11-07) son posteriores a la publicacion del paper (2023); verificar compatibilidad con versiones recientes de LeRobot.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-act-aloha-aloha_transfer_cube-fp32
- Repositorio GitHub del rSkill: https://github.com/OpenRAL/openral/tree/master/rskills/act-aloha/
- rSkill hermano (insercion): https://github.com/OpenRAL/openral/tree/master/rskills/act-aloha-insertion/
- Modelo upstream: https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human
- Paper ACT: https://arxiv.org/abs/2304.13705
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
