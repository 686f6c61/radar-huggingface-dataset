# LeWAM/lewam-tworoom

## Resumen

LeWAM TwoRoom es un checkpoint de modelo de mundo orientado a objetivos (*goal-reaching*) publicado por el proyecto LeWAM en formato LeWAM v1. No es un modelo de lenguaje: se trata de un modelo de dinámica latente que, a partir de observaciones de un entorno, codifica el estado y predice acciones condicionadas a una meta, además de la evolución de la dinámica. El repositorio contiene únicamente dos ficheros en la raíz, `lewam_best.pt` y `lewam_config.json`, con un tamaño total de 0,1 GB.

El modelo está entrenado sobre el entorno TwoRoom, un escenario de navegación en dos salas típico de la investigación en modelos de mundo y control basado en modelo. El dataset asociado se publica por separado en `LeWAM/lewam-tworoom`. El autor indica que los pesos se conservan exactamente como en el checkpoint original y que se han verificado la carga estricta, las máscaras de atención, la salida del encoder, la predicción de acción condicionada a objetivo y la predicción de dinámica contra el checkpoint de origen.

Su relevancia es doble: por un lado sirve como artefacto reproducible para evaluar modelos de mundo latentes en control (planificación tipo MPC, RL basado en modelo); por otro, es un ejemplo de empaquetado de checkpoints en un formato propio (LeWAM v1) con cargador específico, `lewam.eval.loaders.load_lewam`. El autor advierte de que la release v1 no incluye configuración de evaluación específica para este entorno. Licencia MIT, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el autor confirma encoder, máscaras de atención y predicción de acción condicionada a objetivo más predicción de dinámica (familia de modelos de mundo latentes) |
| Parámetros totales | No disponible; el repositorio completo ocupa 0,1 GB, compatible con un modelo de decenas de millones de parámetros, cifra no confirmada por el autor |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; se distribuye como checkpoint PyTorch en su precisión original, sin variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No aplica: no es un modelo de lenguaje y el autor no declara idiomas |
| Licencia | MIT |
| Formato de pesos | PyTorch (`lewam_best.pt`) más configuración JSON (`lewam_config.json`) |

## Arquitectura y entrenamiento

El autor no publica una descripción arquitectónica formal. La información verificable del *model card* menciona cuatro componentes comprobados contra el checkpoint fuente: carga estricta de pesos, máscaras de atención, salida del encoder y predicción de acción condicionada a objetivo junto con predicción de dinámica. Esto sitúa al modelo en la familia de modelos de mundo latentes con encoder de observaciones y predictor con atención, donde la política o el planificador se condiciona a un objetivo (*goal*). No se especifica si el predictor es un transformer puro, un híbrido o una red recurrente con atención, ni el número de capas, dimensiones o cabezas.

En cuanto a los datos, el modelo se asocia al dataset `LeWAM/lewam-tworoom`, correspondiente al entorno TwoRoom. No se indican el número de episodios, el número de tokens ni la composición del dataset en la información disponible, ni si hubo etapas de ajuste tipo RLHF o DPO (poco probables en un modelo de control, pero no confirmado). El checkpoint no incluye estado del optimizador, por lo que es un artefacto de inferencia y evaluación, no de reanudación de entrenamiento. Se publica el SHA256 de `lewam_best.pt` (`3370e82ce833d1ce2d3d483de8561c78d552cfc3d2f9738a86a9fde647d839b4`) para verificar la integridad de la descarga.

## Capacidades

- Predicción de acción condicionada a objetivo: dado un estado y una meta, el modelo produce acciones orientadas a alcanzarla.
- Predicción de dinámica: modela la transición del estado latente del entorno.
- Codificación de observaciones mediante un encoder, con salida verificada frente al checkpoint original.
- Uso de máscaras de atención en el proceso de predicción, verificado en la carga estricta.
- Carga reproducible con comprobación de integridad mediante hash SHA256.
- Integración con el ecosistema LeWAM v1 mediante `load_lewam("<run_name>")` y el directorio `$STABLEWM_HOME/checkpoints/<run_name>/`.
- No dispone de *tool calling* ni *function calling*.
- No dispone de razonamiento multi-paso en lenguaje natural ni modo *thinking*.
- No dispone de capacidades de visión general, audio o generación de texto: su ámbito es el entorno TwoRoom.
- Capacidades multilingües: no aplica.

## Casos de uso

- Planificación basada en modelo (MPC): usar el modelo como simulador latente para evaluar secuencias de acciones candidatas y seleccionar la que maximiza la probabilidad de alcanzar el objetivo en TwoRoom, sin interactuar con el entorno real.
- RL basado en modelo: emplear las predicciones de dinámica para generar *rollouts* sintéticos y reducir el número de interacciones necesarias con el simulador durante el entrenamiento de una política.
- Evaluación comparativa de modelos de mundo: servir como referencia reproducible en experimentos que comparen arquitecturas de dinámica latente sobre el mismo entorno, gracias a que los pesos se conservan exactamente y están verificados por hash.
- Generación de datos sintéticos: producir trayectorias latentes condicionadas a distintos objetivos para ampliar un dataset de entrenamiento o validar políticas antes de desplegarlas.
- Investigación en representaciones condicionadas a meta: analizar cómo el encoder y las máscaras de atención estructuran el espacio latente cuando la recompensa se define como alcanzar un estado objetivo.
- Control predictivo con verificación de seguridad: evaluar en el modelo las consecuencias de una acción antes de ejecutarla en el entorno, útil en entornos donde un fallo tiene coste.
- Transferencia a navegación en interiores: usar TwoRoom como banco de pruebas de bajo coste para metodologías que después se trasladen a robótica móvil o navegación en espacios con varias estancias, siempre que se valide previamente la transferencia.
- Docencia y prototipado: montar un *pipeline* completo de modelo de mundo (carga, codificación, predicción, planificación) con un checkpoint de 0,1 GB que se ejecuta sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que la release v1 no incluye una configuración de evaluación específica para este entorno, por lo que no se pueden presentar métricas de éxito en la tarea, error de predicción de dinámica ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoría de configuraciones, dado que el repositorio completo ocupa 0,1 GB; se trata de una estimación a partir del tamaño de los ficheros, no de una medición publicada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo es holgadamente compatible con GTX 1650, RTX 3060, RTX 4090, A100 y H100, sin que el autor recomiende ninguna en concreto.
- Cabe en GPU de consumo: sí, y también es viable su ejecución en CPU para inferencia puntual.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni se publican pesos en GGUF. El despliegue previsto es mediante el cargador propio del proyecto: situar `lewam_best.pt` y `lewam_config.json` en `$STABLEWM_HOME/checkpoints/<run_name>/` y usar `lewam.eval.loaders.load_lewam`.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de este checkpoint, por lo que la comparación es únicamente categórica. Se incluyen alternativas del mismo ámbito (modelos de mundo latentes para control), con los campos no verificables marcados como no disponibles.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeWAM TwoRoom | Modelo de mundo latente con predicción de acción condicionada a objetivo | No disponible (repo de 0,1 GB) | No disponible | MIT | Checkpoint en HuggingFace, 0 descargas |
| DreamerV3 | Modelo de mundo latente con actor-crítico en espacio latente | No disponible | No aplica | MIT | Implementación pública de referencia |
| TD-MPC2 | Modelo de mundo latente sin decodificador para planificación y control | No disponible | No aplica | MIT | Implementación pública de referencia |
| DINO-WM | Modelo de mundo sobre características visuales preentrenadas | No disponible | No aplica | No disponible | Publicación y código asociados |

Las cifras de rendimiento de estas alternativas no forman parte de la información proporcionada, de modo que no se ofrece comparación numérica.

## Limitaciones y advertencias

- Ausencia de configuración de evaluación específica para este entorno, según el propio autor, lo que dificulta reproducir métricas de referencia y comparar de forma objetiva con otros checkpoints.
- Cero descargas y cero likes en el momento de la consulta: no existe validación independiente por parte de la comunidad.
- Fecha de creación y de última actualización idénticas (2026-10-07), sin historial de revisiones que permita evaluar la madurez del artefacto.
- Especialización en el entorno TwoRoom: el comportamiento fuera de ese dominio, o con distribuciones de observaciones distintas, es desconocido.
- No incluye estado del optimizador: no sirve para reanudar un entrenamiento, solo para inferencia y evaluación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones de dinámica poco fiables fuera de la distribución de entrenamiento, algo crítico si se usa para planificación.
- Sesgos conocidos: no documentados por el autor; en modelos de este tipo los sesgos proceden de la distribución del dataset de entrenamiento, cuya composición no se detalla.
- Restricciones de licencia: los pesos se publican bajo MIT, lo que permite uso comercial y modificación, pero las condiciones del dataset `LeWAM/lewam-tworoom` no se detallan en la información disponible y deben verificarse por separado.
- Idiomas: no aplica, al no ser un modelo de lenguaje.
- Advertencia operativa: verificar el SHA256 de `lewam_best.pt` antes de usarlo, ya que el autor basa la reproducibilidad en esa comprobación y en una carga estricta.
- El formato LeWAM v1 y su cargador son específicos del proyecto; no hay garantía de compatibilidad con versiones futuras del código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeWAM/lewam-tworoom
- Dataset asociado: https://huggingface.co/datasets/LeWAM/lewam-tworoom
- Perfil del autor: https://huggingface.co/LeWAM
- Paper, blog o repositorio de código: no disponibles en la información proporcionada.
