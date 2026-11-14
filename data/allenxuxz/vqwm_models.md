# allenxuxz/vqwm_models

## Resumen

VQ-WM (Vector-Quantized World Model) es un conjunto de checkpoints publicado por allenxuxz que implementa el modelo del articulo "Vector-Quantized World Model: Latent Feedback Motion Planning for Robot Manipulation" (arXiv:2610.25600). No se trata de un modelo de lenguaje, sino de un modelo del mundo para robotica orientado a planificacion de movimiento en tareas de manipulacion, que combina un predictor latente continuo con un predictor latente discreto basado en cuantizacion vectorial y un controlador que opera en el espacio latente.

El repositorio contiene cinco configuraciones de tarea (`cube`, `scene`, `walker`, `walker_proprio`, `hanoi`), cada una con sus pesos de controlador, predictores latentes, tabla de primeros pasos (first-passage times) y codebook de estados. El tamano total del repo es de 7,6 GB. La licencia es MIT y el pipeline declarado en Hugging Face es `robotics`.

Es relevante ahora porque propone un paradigma de planificacion por feedback en espacio latente (en lugar de planificacion directa en el espacio de acciones o de estados observados), lo que puede reducir el coste computacional del control y mejorar la robustez frente a perturbaciones en tareas de manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo con cuantizacion vectorial (predictor latente continuo y discreto) y controlador en espacio latente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en `.pt` y `.npz`/`.npy`) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y NumPy (`.npz`, `.npy`) |

## Arquitectura y entrenamiento

La arquitectura se describe en el paper como un modelo del mundo con cuantizacion vectorial: un predictor latente continuo `P_Z` modela la dinamica en un espacio latente, mientras que un predictor latente discreto `P_Q` opera sobre un codebook de acciones `U` y un codebook de estados `Q`. El controlador `π` se apoya en una tabla de primeros pasos (first-passage times `d`) para la planificacion de movimiento por feedback en el espacio latente. Los checkpoints se organizan por configuracion de tarea, lo que sugiere entrenamiento especifico por entorno.

No se dispone de informacion en la model card sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF/DPO (no aplicable en este dominio). Los datasets asociados se publican por separado en `allenxuxz/vqwm_datasets`. Cualquier detalle adicional sobre innovaciones tecnicas (por ejemplo, mecanismos de atencion o decodificacion especulativa) no esta disponible en la informacion proporcionada.

## Capacidades

- Planificacion de movimiento en espacio latente para manipulacion robotica.
- Modelado de dinamica mediante predictores latentes continuo y discreto.
- Control por feedback a partir de primeros pasos (first-passage times).
- Soporte de multiples entornos o configuraciones de tarea (`cube`, `scene`, `walker`, `walker_proprio`, `hanoi`).
- Integracion con datasets publicados en `allenxuxz/vqwm_datasets`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes multi-paso ni multilingues.

## Casos de uso

- Manipulacion de cubos en entornos simulados: la configuracion `cube` permite entrenar y evaluar politicas de agarre y colocacion usando el controlador `π` y el predictor `P_Z` para planificar trayectorias en espacio latente.
- Tareas de escena compleja: la configuracion `scene` esta pensada para entornos con multiples objetos y obstaculos, donde la planificacion por feedback en latente ayuda a corregir desviaciones.
- Locomocion o control de walker: las configuraciones `walker` y `walker_proprio` cubren tareas con y sin informacion propioceptiva, utiles para estudiar el efecto de la observabilidad parcial.
- Resolucion de Torres de Hanoi robotica: la configuracion `hanoi` sirve como benchmark de planificacion secuencial de largo horizonte con restricciones de movimiento.
- Investigacion en modelos del mundo: los checkpoints permiten reproducir experimentos del paper y comparar predictores continuos frente a discretos con cuantizacion vectorial.
- Desarrollo de controladores basados en first-passage times: la tabla `first_passage` facilita implementar planificadores que estiman tiempos de llegada entre estados latentes.
- Evaluacion de robustez: al separar controlador y predictores, se puede sustituir o perturbar cada componente para medir su contribucion al rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo completo ocupa 7,6 GB, por lo que cargar una sola configuracion de tarea requiere bastante menos memoria, pero no se especifica la cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de modelos pequenos de control y prediccion latente, es plausible que quepan en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: los pesos estan en formato PyTorch (`.pt`) y NumPy (`.npz`/`.npy`), por lo que el despliegue se realiza cargando los ficheros directamente con PyTorch o NumPy; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (modelos del mundo con cuantizacion vectorial para manipulacion robotica) en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para generacion de texto.
- Los checkpoints son especificos por tarea (`cube`, `scene`, `walker`, `walker_proprio`, `hanoi`); no se garantiza generalizacion a otros entornos sin reentrenamiento.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado en simulacion, puede presentar una brecha de sim a real (sim-to-real gap) no cuantificada.
- Riesgo de alucinacion no aplicable en el sentido linguistico; en su lugar existe riesgo de predicciones latentes erroneas que lleven a trayectorias invalidas.
- Limitaciones de contexto e idioma no aplicables.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del paper y de los datasets asociados.
- Para produccion, es necesario validar el modelo en el entorno robotico concreto y verificar la compatibilidad de versiones de PyTorch y NumPy.

## Enlaces

- Hugging Face: https://huggingface.co/allenxuxz/vqwm_models
- Dataset: https://huggingface.co/datasets/allenxuxz/vqwm_datasets
- Paper: https://arxiv.org/abs/2610.25600
- Sitio web del proyecto: https://xuxuezhou.github.io/vq-wm/
- Codigo: https://github.com/xuxuezhou/vqwm
