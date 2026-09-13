# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.2

## Resumen

El modelo `ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.2` es un ajuste fino del modelo de robotica π₀ (Pi0) de Physical Intelligence, publicado por el usuario ImKyungjin a traves de la libreria LeRobot de Hugging Face. π₀ es un modelo Vision-Language-Action (VLA) de proposito general: recibe imagenes de camaras, instrucciones en lenguaje natural y el estado del robot, y emite acciones motoras directamente. Este checkpoint concreto se ha entrenado sobre el dataset `local/maniskill_stackcube_mixed_30pct`, orientado a la tarea de apilar cubos (StackCube) en el simulador ManiSkill, con una variante de mezcla de datos al 30 por ciento.

El modelo pesa 3.501.372.176 parametros (aproximadamente 3,5 mil millones) segun los ficheros safetensors publicados, y el repositorio ocupa 7,0 GB. La implementacion de LeRobot deriva del repositorio OpenPI de Physical Intelligence, de codigo abierto. La licencia declarada es Apache 2.0.

Es relevante ahora porque ejemplifica el flujo de trabajo actual en robotica de imitacion: partir de una politica fundacional preentrenada y especializarla en una tarea concreta con un dataset reducido de demostraciones. Para desarrolladores e investigadores, sirve como referencia practica de como se publica, entrena y evalua una politica VLA dentro del ecosistema LeRobot, aunque se trata de un checkpoint con cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀; segun la documentacion publica de π₀, combina un backbone tipo PaliGemma con un experto de acciones generado por flow matching |
| Parametros totales | 3.501.372.176 (aproximadamente 3,5 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 7,0 GB |
| Dataset de entrenamiento | local/maniskill_stackcube_mixed_30pct |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

π₀ es un modelo Vision-Language-Action para control de robots de proposito general desarrollado por Physical Intelligence. La implementacion empaquetada aqui procede de OpenPI, el repositorio abierto de la compania, y ha sido adaptada por LeRobot (Hugging Face) para su entrenamiento e inferencia dentro de ese ecosistema. La model card no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; estos datos figuran como no disponibles.

El entrenamiento de este checkpoint concreto se ha realizado sobre `local/maniskill_stackcube_mixed_30pct`, un dataset local (no publicado como repositorio publico en la informacion disponible) asociado a la tarea StackCube de ManiSkill, un entorno de simulacion. El sufijo del identificador sugiere una mezcla de datos al 30 por ciento y alguna variante de configuracion ("convex-0.2"); no se especifica en la informacion proporcionada a que hacen referencia exactamente esos parametros. El flujo de entrenamiento documentado por LeRobot es `lerobot-train` con `--policy.type=act` y la evaluacion/inferencia con `lerobot-record` apuntando a `--policy.path`; la model card reproduce ese flujo generico, no una receta especifica para este checkpoint.

No se documentan en la informacion disponible innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, action chunking explicito u otras) mas alla de las propias de la arquitectura π₀ original descrita en el blog de Physical Intelligence.

## Capacidades

- Control de robot a partir de entradas visuales: genera acciones motoras a partir de imagenes de camara y del estado del robot.
- Interpretacion de instrucciones en lenguaje natural: la arquitectura π₀ es un modelo vision-lenguaje-accion, por lo que acepta ordenes textuales como parte de la condicion de entrada.
- Manipulacion de objetos en simulacion: el checkpoint esta especializado en la tarea StackCube de ManiSkill (apilado de cubos).
- Politica de tipo generalista ajustada a una tarea: parte de un modelo fundacional y se especializa mediante aprendizaje por imitacion sobre demostraciones.
- Integracion con el ecosistema LeRobot: compatible con `lerobot-train` para reentrenamiento y `lerobot-record` para evaluacion e inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo emite acciones de control, no cadenas de razonamiento textual.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision si (propia de la arquitectura VLA); modo thinking y audio no disponibles.
- Generacion de texto, codigo o matematicas: no disponible; el modelo esta orientado a robotica, no a tareas generativas de texto segun la informacion proporcionada.

## Casos de uso

- Apilado de cubos en simulacion: uso directo del checkpoint sobre el entorno ManiSkill StackCube, cargando la politica con `lerobot-record --policy.path=<repo>` para reproducir la tarea para la que fue entrenado.
- Investigacion en aprendizaje por imitacion: punto de partida para estudiar como se comporta un ajuste fino de π₀ con una mezcla de datos reducida frente al modelo base, variando el porcentaje de mezcla indicado en el nombre del checkpoint.
- Generacion de datos sinteticos de manipulacion: ejecutar la politica en simulador para producir trayectorias etiquetadas que alimenten posteriores entrenamientos o evaluaciones de otras politicas.
- Evaluacion comparativa de politicas VLA en simulacion: usar este checkpoint como baseline especializado en StackCube y compararlo con politicas entrenadas desde cero (ACT, Diffusion Policy) sobre el mismo dataset.
- Desarrollo de pipelines de entrenamiento en LeRobot: servir de ejemplo reproducible de entrenamiento e inferencia con `lerobot-train` y `lerobot-record`, util para equipos que adoptan la libreria.
- Estudio de transferencia simulacion a realidad: analizar, con las debidas salvaguardas, que elementos de una politica entrenada solo en simulacion se degradan al trasladarla a un robot fisico tipo SO-100.
- Docencia y prototipado rapido: demostrar el ciclo completo de especializacion de un modelo fundacional de robotica en una tarea concreta dentro de un curso o taller practico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 7 GB en precision bf16/fp16 para los 3,5 mil millones de parametros, mas el consumo adicional del codificador visual y de los buffers de imagenes; en fp32 la cifra se situaria en torno a 14 GB. Estas estimaciones son calculos a partir del numero de parametros, no datos publicados por el autor.
- VRAM estimada para entrenamiento: notablemente superior a la de inferencia (estados del optimizador, gradientes y activaciones); no disponible una cifra oficial.
- GPU recomendadas: no documentadas por el autor. Por tamano, caben en GPUs de consumo con 12 GB o mas de VRAM y en GPUs de datacenter tipo A100 o H100 para entrenamiento.
- Compatibilidad con GPU de consumo: si, previsiblemente en tarjetas con 12-16 GB de VRAM o mas (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para inferencia en bf16. No confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia con `--policy.path`), sobre PyTorch con CUDA. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. En robotica de control, la latencia de inferencia es critica para el bucle de control y deberia medirse en el hardware objetivo antes de cualquier uso.

## Comparativa con modelos similares

Los datos de rendimiento de la mayoria de alternativas no estan publicados en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables. Las cifras de terceros deben confirmarse en sus fuentes oficiales.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi0-maniskill-stackcube-mixed-30pct-convex-0.2 | 3,5 mil millones | VLA (π₀ ajustado) | apache-2.0 | Hugging Face, via LeRobot |
| π₀ (base, Physical Intelligence / OpenPI) | no disponible en la informacion proporcionada | VLA | codigo OpenPI de codigo abierto; terminos exactos no disponibles | OpenPI y blog oficial |
| OpenVLA | 7 mil millones | VLA | licencia de la comunidad de Llama 2, con restricciones de uso | publico en Hugging Face |
| RDT-1B | 1,2 mil millones | modelo de difusion para robotica | no disponible | publico |
| GR00T N1 (NVIDIA) | 2,2 mil millones | VLA | no disponible | publico |

## Limitaciones y advertencias

- Ausencia total de validacion externa: el repositorio registra 0 descargas y 0 valoraciones, y no se han publicado benchmarks, por lo que no hay evidencia publica de su rendimiento real.
- Especializacion estrecha: el checkpoint esta entrenado para la tarea StackCube de ManiSkill; es previsible un rendimiento pobre fuera de esa tarea o de ese entorno.
- Entrenamiento en simulacion: al proceder de un dataset de ManiSkill, existe una brecha simulacion-realidad (sim-to-real) que no se cuantifica en la informacion disponible.
- Datos de entrenamiento opacos: el dataset es local y no se detalla su composicion, numero de episodios, variedad de escenas ni posibles sesgos en las demostraciones.
- Riesgo de alucinacion en la interpretacion del lenguaje: como modelo vision-lenguaje-accion, puede interpretar incorrectamente instrucciones ambiguas o fuera de distribucion y ejecutar acciones no deseadas. En robotica fisica esto tiene consecuencias materiales.
- Limites de contexto e idioma: no disponibles; se desconoce la longitud de contexto efectiva y los idiomas que el modelo comprende.
- Ambiguedad en el identificador: los sufijos "mixed-30pct" y "convex-0.2" no estan explicados en la model card, lo que dificulta reproducir exactamente el entrenamiento.
- Licencia y dependencias: la licencia declarada del repositorio es Apache 2.0, lo que en principio permite uso comercial. Sin embargo, π₀ deriva de modelos tipo PaliGemma/Gemma, sujetos a sus propios terminos de uso; conviene verificar la cadena completa de licencias antes de un despliegue comercial.
- Riesgo de seguridad fisica: cualquier uso sobre hardware real debe acompanarse de limites de par, paradas de emergencia y validacion en entorno controlado; el modelo no incorpora garantias de seguridad.
- Ausencia de informacion sobre cuantizacion y despliegue optimizado: no hay versiones GGUF ni recetas para motores de inferencia de baja latencia, lo que puede dificultar cumplir requisitos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.2
- Blog de π₀ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo, la robotica o el dataset; unicamente devuelven enlaces a la plataforma de streaming HBO Max, por lo que no se han utilizado como fuente.
