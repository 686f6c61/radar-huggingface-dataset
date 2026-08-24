# mimiminsoo/starvla-qwenpiv3-so101-marker-rt1warmstart

## Resumen

El modelo `mimiminsoo/starvla-qwenpiv3-so101-marker-rt1warmstart` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario mimiminsoo, basado en el framework StarVLA. Utiliza como backbone el modelo Qwen3-VL-4B (congelado) y un action head de flow-matching DiT (denoising diffusion transformer) entrenado desde cero. El modelo está fine-tuneado sobre el dataset de teleoperación SO-101, concretamente la subdivisión `marker_100` con 97 episodios y 31 291 frames, para controlar un brazo robótico con acciones de posición articular absoluta de 6 dimensiones (5 para el brazo y 1 para el gripper).

La relevancia de este modelo radica en que demuestra un flujo de trabajo práctico para adaptar un VLA pre-entrenado a una tarea robótica específica con recursos limitados (una sola GPU RTX 3090). El backbone se inicializa desde un checkpoint de StarVLA pre-entrenado en el dataset Bridge RT-1 y se congela, mientras que solo el action head y las capas de proyección se entrenan, lo que reduce significativamente el coste computacional. El modelo final se sirve mediante un servidor compatible con el protocolo ZMQ de Isaac-GR00T N1.6, lo que facilita su integración en pipelines robóticos existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (backbone) + action head DiT con flow-matching |
| Parametros totales | No disponible (el backbone es de 4B, el action head anade parametros adicionales no especificados) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el backbone Qwen3-VL soporta tipicamente 32k tokens, pero no se especifica para este modelo) |
| Tipos de cuantizacion | No disponible (el checkpoint se sirve en bf16 segun el script de deployment) |
| Idiomas soportados | No disponibles (el backbone Qwen3-VL es multilingue, pero no se indica para este modelo) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.pt` (formato no especificado, probablemente PyTorch nativo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura modular de StarVLA, que separa el backbone de vision-lenguaje del action head. En este caso, el backbone es Qwen3-VL-4B, que procesa observaciones visuales y instrucciones en lenguaje natural. El action head es un transformer con flow-matching (DiT) que genera acciones continuas de 6 dimensiones (posiciones articulares absolutas). Esta combinacion permite que el modelo comprenda escenas visuales y comandos textuales para producir comandos motores precisos.

El entrenamiento se realizo en dos fases: primero, el backbone se inicializo con los pesos de `StarVLA/Qwen3VL-PI_v3-Bridge-RT_1` (checkpoint en el paso 50 000) y se congelo durante todo el proceso. El action head y las capas de proyeccion se inicializaron desde cero, ya que el espacio de acciones del checkpoint original (desplazamientos delta de 7 dimensiones para el robot WidowX) es incompatible con el espacio de acciones absolutas de 6 dimensiones de SO-101. Posteriormente se fine-tuneo el modelo completo (solo el action head) sobre el dataset `marker_100` durante 115 000 pasos con batch size 1 (aproximadamente 3,7 epocas), lo que tomo 49 horas y 3 minutos en una RTX 3090 24GB. La funcion de perdida `action_dit_loss` descendio de 2,92 en el paso 10 a 0,049 en el paso final, estabilizandose entre 0,01 y 0,1 a partir del paso 4000.

## Capacidades

- Control robotico de brazo manipulador: genera acciones de posicion articular absoluta (6 dimensiones) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Integracion con el ecosistema Isaac-GR00T: el servidor implementa el protocolo ZMQ N1.6, compatible con el cliente `Gr00t16ServicePolicyClient` de leisaac.
- Fine-tuning eficiente: el backbone congelado permite adaptar el modelo a nuevas tareas con pocos datos y recursos modestos.
- Generacion de acciones con flow-matching: el action head DiT produce acciones suaves y coherentes temporalmente, adecuadas para control en bucle cerrado.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multimodal general o soporte de audio/vision fuera del contexto robotico.

## Casos de uso

- Investigacion en aprendizaje por demostracion: el modelo sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA sobre datasets de teleoperacion especificos, como SO-101.
- Control de brazos roboticos en entornos de laboratorio: puede desplegarse en robots que hablen el protocolo Isaac-GR00T para ejecutar tareas de manipulacion como recoger y colocar objetos, ensamblaje o interaccion con marcadores visuales (el dataset `marker_100` sugiere el uso de marcadores para localizacion).
- Prototipado rapido de politicas robotizadas: gracias a su entrenamiento en una sola GPU y su servidor listo para usar, permite iterar rapidamente sobre nuevas tareas sin necesidad de infraestructura de gran escala.
- Benchmarking de arquitecturas VLA: al ser parte del framework StarVLA, puede compararse con otros backbones o action heads dentro del mismo codigo base.
- Educacion y formacion en robotica: su licencia MIT y su tamaño moderado (11 GB) lo hacen accesible para cursos o talleres sobre modelos de vision-lenguaje-accion.
- Extension a otros datasets: la arquitectura modular permite reutilizar el backbone congelado y entrenar nuevos action heads para diferentes espacios de accion o robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la evolucion de la perdida de entrenamiento (`action_dit_loss`), que alcanza 0,049 al final del entrenamiento, pero no se proporcionan metricas de exito en tareas robotica ni comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: se realizo en una RTX 3090 24GB, con 49 horas de computo para 115 000 pasos con batch size 1.
- Inferencia: el checkpoint tiene un tamano de 11 GB en el repositorio (probablemente en bf16). Con cuantizacion a 8 bits o 4 bits (no proporcionada por el autor) podria ejecutarse en GPUs con 8-12 GB de VRAM, aunque no se ha verificado.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 4080, RTX 4090, A100). Para entrenamiento se recomienda una GPU con 24 GB o mas.
- Opciones de despliegue: el autor proporciona un script de servidor (`server_policy_gr00t_zmq.py`) que habla el protocolo ZMQ de Isaac-GR00T. Tambien podria integrarse con frameworks como vLLM o TGI si se exporta a un formato compatible, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos. Dado el tamano del modelo y el uso de bf16, se espera una latencia de decenas de milisegundos por inferencia en una GPU moderna, pero no se ha medido.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, otros modelos VLA como OpenVLA (7B parametros, basado en Prismatic) o RT-2 (55B parametros) tienen arquitecturas y entrenamientos diferentes, pero no se pueden establecer comparaciones cuantitativas sin benchmarks comunes. El modelo presentado se distingue por su backbone congelado y su action head de flow-matching, una combinacion poco frecuente en modelos VLA publicos.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (97 episodios, 31 291 frames) y especializado en una tarea concreta (`marker_100`), lo que limita su generalizacion a otras tareas o entornos.
- El backbone esta congelado, por lo que no se beneficia de aprendizaje adicional durante el fine-tuning; cualquier limitacion del backbone (por ejemplo, en comprension de instrucciones complejas) se mantiene.
- No se han evaluado sesgos, alucinaciones ni robustez ante perturbaciones visuales o de lenguaje.
- El espacio de acciones es especifico (posiciones articulares absolutas de 6 dimensiones), por lo que no es directamente transferible a robots con otras cinemáticas o espacios de accion.
- El checkpoint subido solo contiene el modelo final; los checkpoints intermedios (cada 10 000 pasos) no estan disponibles publicamente, lo que dificulta el analisis de la dinamica de entrenamiento.
- Aunque la licencia es MIT, el uso del modelo depende de las licencias de los componentes subyacentes (Qwen3-VL, StarVLA, Isaac-GR00T), que deben verificarse por separado.
- No se proporcionan instrucciones detalladas de instalacion ni ejemplos de evaluacion fuera del ecosistema StarVLA.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mimiminsoo/starvla-qwenpiv3-so101-marker-rt1warmstart)
- [Repositorio StarVLA en GitHub](https://github.com/starVLA/starVLA)
- [Pagina del proyecto StarVLA](https://starvla.github.io/)
- [Paper de StarVLA en arXiv](https://arxiv.org/abs/2604.05014)
- [Modelo relacionado: mimiminsoo/starvla-qwenpiv3-so101-marker-pretrained](https://huggingface.co/mimiminsoo/starvla-qwenpiv3-so101-marker-pretrained)
- [Modelo relacionado: mimiminsoo/starvla-qwengr00t-so101-marker-bs8h10](https://huggingface.co/mimiminsoo/starvla-qwengr00t-so101-marker-bs8h10/tree/main)
