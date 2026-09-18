# escapebirdy/select_block_dp_octe_4096

## Resumen

`escapebirdy/select_block_dp_octe_4096` es una politica de control visuomotor basada en Diffusion Policy, entrenada y publicada con la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robotica que aprende a generar trayectorias de accion multimodales y continuas a partir de observaciones visuales y de estado, siguiendo el enfoque descrito en el articulo "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (arXiv:2303.04137). El autor es el usuario `escapebirdy` y el pipeline declarado en el Hub es `robotics`, con la etiqueta `diffusion`.

El modelo resuelve el problema clasico de la manipulacion robotica con contacto rico: en lugar de predecir una accion unica por paso (regresion directa), formula el control como un proceso generativo de difusion que produce secuencias de acciones suaves y coherentes, lo que mejora el comportamiento en tareas de ensamblaje, agarre o insercion. Cuenta con 267.184.420 parametros (aproximadamente 267 M) segun los pesos en safetensors, lo que lo situa en el rango de las politicas ligeras desplegables en GPU de consumo.

La relevancia de esta ficha es acotada pero concreta: se trata de un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, entrenado sobre el dataset propio `escapebirdy/select_block_4096_v3`, presumiblemente asociado a una tarea de seleccion y colocacion de bloques ("select_block"). Es util como ejemplo reproducible de entrenamiento de Diffusion Policy con LeRobot, no como modelo de produccion maduro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica visuomotora generativa basada en difusion, sobre redes neuronales; detalles de la columna vertebral no especificados en la model card) |
| Parametros totales | 267.184.420 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de lenguaje; horizonte de observacion y horizonte de prediccion de acciones no disponibles en la model card |
| Tipos de cuantizacion | No disponible (repo en safetensors, ~1,1 GB, compatible con pesos en precision completa; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No aplica / no disponible (entradas multimodales de robot: imagenes y estado; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de modelo | Politica de robotica (imitation learning / behavior cloning) |
| Tarea declarada | Manipulacion visuomotora; dataset asociado `escapebirdy/select_block_4096_v3` |
| Entrada / salida | No disponible en detalle (observaciones visuales y de estado; salida = trayectoria de acciones) |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica explicitamente el enfoque Diffusion Policy (arXiv:2303.04137), que trata el control visuomotor como un proceso generativo de difusion: el modelo aprende la distribucion de trayectorias de accion y las muestrea de forma iterativa, en lugar de ajustar una unica accion mediante regresion. Este planteamiento captura la multimodalidad de las demostraciones humanas y produce movimientos mas suaves, lo que se traduce en mejor comportamiento en tareas con contacto fisico intenso. El checkpoint fue entrenado y subido al Hub con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion.

No se dispone de informacion sobre el numero de tokens o frames de entrenamiento, la composicion del dataset, si hubo etapas de refinamiento tipo RLHF/DPO (poco habituales en politicas de imitacion) ni sobre innovaciones adicionales como decodificacion especulativa o mecanismos de atencion especiales. El dataset asociado, `escapebirdy/select_block_4096_v3`, sugiere un conjunto de demostraciones propio del autor para una tarea de seleccion de bloques; el sufijo `4096` del nombre no se explica en la model card y no debe interpretarse como longitud de contexto. Se observa ademas una inconsistencia en la plantilla del README: el ejemplo de entrenamiento usa `--policy.type=act`, mientras que las etiquetas y el titulo del modelo declaran `diffusion`.

## Capacidades

- Generacion de trayectorias de accion multimodales y continuas para control de brazos roboticos (no genera texto).
- Aprendizaje por imitacion a partir de demostraciones: reproduce la politica aprendida del dataset de entrenamiento.
- Manipulacion con contacto rico: el muestreo por difusion favorece movimientos suaves y evita saltos bruscos entre modos de accion.
- Ejecucion en bucle cerrado (closed-loop) sobre observaciones del robot durante la evaluacion.
- Integracion nativa con LeRobot: entrenamiento con `lerobot-train`, evaluacion e inferencia con `lerobot-record`.
- Compatible con robots del ecosistema LeRobot, segun el ejemplo de la model card (`so100_follower`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbolico, vision semantica general, audio ni modo "thinking".

## Casos de uso

- Recogida y colocacion de bloques en laboratorio: es el escenario implicito del dataset (`select_block`), donde la politica recibe imagenes y estado y emite la trayectoria de agarre y deposito; el muestreo por difusion ayuda a mantener aproximaciones suaves al objeto.
- Manipulacion con contacto rico (insercion, encaje, ensamblaje): las trayectorias generadas de forma multimodal reducen los picos de fuerza y los atascos tipicos de las politicas de regresion directa.
- Reproduccion de experimentos academicos: sirve como referencia entrenada con LeRobot para comparar variantes de politica sobre el mismo dataset y la misma plataforma.
- Linea base en proyectos de aprendizaje por imitacion: al tener pesos publicos en safetensors y licencia Apache 2.0, se puede reentrenar o afinar con datos propios para medir la ganancia respecto a la politica original.
- Automatizacion de tareas de pick-and-place en prototipos con brazo de bajo coste: el ejemplo de evaluacion con `so100_follower` indica que el flujo esta pensado para robots tipo SO-100, asequibles para prototipado.
- Evaluacion estandarizada de politicas: el script `lerobot-record` con `--episodes=10` permite generar un conjunto de evaluacion (`eval_<dataset>`) y calcular tasas de exito de forma repetible.
- Demostraciones docentes en robotica: al ser un modelo de 267 M de parametros y 1,1 GB, cabe en GPU de consumo y es viable en aulas y practicas de master.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, numeros de episodios de evaluacion, curvas de entrenamiento ni comparaciones cuantitativas con otras politicas. Tampoco se dispone de datos de latencia o frecuencia de control.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,1 GB y los 267 M de parametros corresponden a aproximadamente 1,07 GB en precision de 32 bits; se puede asumir un consumo de VRAM en el orden de 1-3 GB incluyendo activaciones y buffers de la difusion, aunque el dato exacto no esta publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para inferencia; RTX 3060, RTX 4060, RTX 4090 o superiores sobran para este tamano. Para entrenamiento desde cero sobre el dataset propio conviene una GPU con 12-24 GB (RTX 3090, RTX 4090, A5000) en funcion del tamano de lote y de las imagenes.
- Cabe en GPU de consumo: si, previsiblemente incluso en tarjetas de gama de entrada con 4-6 GB, dado el tamano de los pesos.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` con `--policy.path` para inferencia/evaluacion) y PyTorch como backend. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a una politica de difusion.
- Latencia y throughput: no disponibles. En politicas de difusion, el coste por accion depende del numero de pasos de denoising, dato que no figura en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| escapebirdy/select_block_dp_octe_4096 | Diffusion Policy (LeRobot) | 267.184.420 | No disponible | No disponible (sin benchmarks publicados) | apache-2.0 | Hugging Face, 0 descargas en la consulta |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de chunking de acciones | No disponible | No disponible | No disponible en esta informacion | No disponible | Implementado en LeRobot |
| SmolVLA (Hugging Face) | Vision-language-action | No disponible | No disponible | No disponible en esta informacion | No disponible | Publicado en Hugging Face |
| Pi0 / openpi | Vision-language-action | No disponible | No disponible | No disponible en esta informacion | No disponible | Publicado por Physical Intelligence |

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de las alternativas en la informacion proporcionada; la comparacion cuantitativa queda pendiente de consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse por imitacion sobre un dataset propio y reducido, la politica heredara los sesgos de las demostraciones (posiciones, iluminacion, objetos y estilo de teleoperacion del operador).
- Riesgo de sobreajuste: el modelo parece entrenado para una tarea concreta (`select_block`) sobre un unico dataset; es esperable un rendimiento pobre fuera de esa distribucion de objetos, camaras y entorno.
- Alucinacion en el sentido generativo: al muestrear trayectorias de una distribucion aprendida, la politica puede producir movimientos plausibles pero incorrectos o inseguros ante entradas fuera de distribucion. En robotica esto implica riesgo fisico, no solo texto erroneo.
- Sin garantias de seguridad: no se documentan limites de fuerza, parada de emergencia ni validacion en entornos reales; no debe desplegarse en celdas con personas sin capas de seguridad externas.
- Idiomas y contexto: no aplica el soporte multilingue ni la ventana de contexto de un LLM; no hay informacion sobre el horizonte de observacion ni sobre la frecuencia de control.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. Conviene verificar ademas la licencia del dataset `escapebirdy/select_block_4096_v3` antes de reutilizarlo.
- Caveats de produccion: 0 descargas y 0 likes indican que es un checkpoint sin validacion por parte de la comunidad; no hay informes externos de reproducibilidad. La model card es una plantilla generada por LeRobot y su ejemplo de entrenamiento usa `--policy.type=act`, incoherente con la etiqueta `diffusion`, por lo que conviene revisar los pesos antes de confiar en el pipeline publicado.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; todos los enlaces utiles proceden del Hub y de la documentacion de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/select_block_dp_octe_4096
- Dataset asociado: https://huggingface.co/datasets/escapebirdy/select_block_4096_v3
- Articulo de Diffusion Policy: https://arxiv.org/abs/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: las busquedas web realizadas no aportaron fuentes adicionales relevantes sobre este modelo.
