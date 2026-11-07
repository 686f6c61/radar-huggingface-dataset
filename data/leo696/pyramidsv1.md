# leo696/Pyramidsv1

## Resumen

Pyramidsv1 es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno Pyramids del ecosistema Unity ML-Agents. Lo publica el usuario leo696 en Hugging Face y no se trata de un modelo de lenguaje, sino de una politica neuronal entrenada para resolver una tarea concreta de control dentro de una simulacion Unity. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos se distribuyen en formato nativo de ML-Agents (`.nn`) o exportados a ONNX.

El modelo es relevante como ejemplo del flujo de trabajo de ML-Agents para publicar agentes entrenados en el Hub y ejecutarlos directamente en el navegador mediante el visor de Hugging Face. No hay informacion publica sobre arquitectura de red, hiperparametros, numero de pasos de entrenamiento ni recompensa obtenida, por lo que su utilidad practica queda limitada a la reproduccion del entorno Pyramids y a la experimentacion con el pipeline de ML-Agents.

Al no disponer de model card tecnica detallada ni de resultados de evaluacion, esta ficha se limita a documentar los datos disponibles y a marcar explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de politica entrenada con PPO en Unity ML-Agents (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (nativo de ML-Agents) y/o `.onnx` segun la model card |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de politica con recorte de la relacion de probabilidades para limitar la magnitud de las actualizaciones. La politica se ejecuta dentro del entorno Pyramids de Unity ML-Agents, que proporciona observaciones vectoriales o visuales y una senal de recompensa especifica del entorno. La model card no detalla el numero de capas, el tamano de las capas ocultas, el tipo de observacion (vectorial o por pixeles) ni la configuracion del fichero YAML de entrenamiento.

No se especifica el numero de pasos de entrenamiento, la composicion del curriculum, ni si se aplicaron tecnicas adicionales como recompensas por curiosidad, imitacion o self-play. La unica informacion operativa es que el entrenamiento puede reanudarse con `mlagents-learn <config.yaml> --run-id=<run_id> --resume`, lo que implica que el autor conserva o referencia una configuracion externa no incluida en el repositorio.

## Capacidades

- Control de un agente dentro del entorno Pyramids de Unity ML-Agents.
- Ejecucion de la politica entrenada en el visor web de Hugging Face a partir del fichero `.nn` o `.onnx`.
- Reanudacion del entrenamiento mediante la CLI de ML-Agents si se dispone de la configuracion original.
- Exportacion potencial a ONNX para inferencia fuera de Unity (segun los tags del repositorio).
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas ni vision fuera del entorno de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico general.
- No tiene capacidades multilingues.

## Casos de uso

- Reproduccion del agente en el navegador: cargar el fichero `.nn` o `.onnx` en el visor de Hugging Face (https://huggingface.co/unity) seleccionando el model_id `leo696/Pyramidsv1` para inspeccionar visualmente la politica aprendida.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `mlagents-learn` y una configuracion PPO propia para adaptar la politica a variantes del entorno Pyramids.
- Benchmark de referencia en experimentos de RL: comparar la recompensa media de este agente con politicas entrenadas desde cero bajo la misma configuracion.
- Docencia y formacion: usar el repositorio como ejemplo minimo del flujo publicacion-consumo de agentes ML-Agents en Hugging Face.
- Pruebas de exportacion ONNX: validar el pipeline de conversion `.nn` a `.onnx` y la inferencia con runtime ONNX en entornos fuera de Unity.
- Integracion en demos interactivas: incrustar el agente en una aplicacion web basada en Unity WebGL o en el visor de Hugging Face para demostraciones de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de exito ni curvas de aprendizaje del entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una politica de RL de un entorno Unity, el consumo depende del tamano de la red, que no se ha publicado.
- GPU recomendadas: no disponibles. Para entrenamiento con ML-Agents se suele requerir una GPU compatible con CUDA; para inferencia en el visor web basta con el navegador del cliente.
- Compatibilidad con GPU de consumo: probable en el caso de redes pequenas tipicas de ML-Agents, pero no confirmado por el autor.
- Opciones de despliegue: visor de Hugging Face (https://huggingface.co/unity), Unity ML-Agents con `mlagents-learn`, y runtime ONNX si se usa el fichero exportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|
| leo696/Pyramidsv1 | Pyramids (ML-Agents) | PPO | no disponible | Hugging Face |
| AGI-CEO/ppo-PyramidsV1 | Pyramids (ML-Agents) | PPO | no disponible | Hugging Face |

No se dispone de informacion sobre parametros, contexto ni rendimiento de ninguna de las dos entradas, por lo que la comparativa se limita a la identificacion del entorno y el algoritmo. No se han identificado otras alternativas publicas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta publicada, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de cualquier uso en produccion.
- No hay model card tecnica: se desconocen arquitectura, hiperparametros, recompensa y condiciones de entrenamiento, lo que dificulta la reproducibilidad.
- El agente esta especializado en el entorno Pyramids y no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento si la politica se evalua en variantes con dinamica distinta.
- No se han documentado sesgos, pero al ser un agente de RL en una simulacion, su comportamiento depende por completo del diseno de recompensas del entorno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No apto para tareas de lenguaje natural, codigo, vision general o agentes conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/leo696/Pyramidsv1
- Modelo comparable: https://huggingface.co/AGI-CEO/ppo-PyramidsV1
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
