# MultiSTEVE-1s/MultiSTEVE-1s

## Resumen

MultiSTEVE-1s es un repositorio de tipo *model zoo* que agrupa 140 agentes de Minecraft basados en STEVE-1/VPT, entrenados con hiperparámetros fijos y aleatoriedad controlada. Lo publica la organización MultiSTEVE-1s como artefacto de investigación orientado a reproducibilidad, interpretabilidad y comparación controlada de la no determinación en el entrenamiento. No es un modelo de lenguaje generativo de propósito general, sino una colección de políticas de refuerzo que actúan exclusivamente en el entorno MineRL/Minecraft.

El interés del release no reside en un único checkpoint, sino en la estructura factorial del conjunto: cinco grupos de ejecuciones (`01_init_seed_only`, `02_data_seed_only`, `03_init_and_data`, `04_single_lsb_flip` y `05_final_init_and_data_100`) que aíslan la semilla de inicialización de pesos, la semilla del dataset y una perturbación de un solo bit en una capa de embeddings de MineCLIP. Esto permite estudiar cómo fuentes mínimas de variación producen divergencias medibles en el comportamiento final del agente.

El repositorio ocupa 1248,3 GB e incluye checkpoints intermedios con nombres `STEVE-1_snapshot_<frames>.weights`, logs de orden de datos y logs de entrenamiento; el checkpoint inicial es `000000000` y el final principal es `160005120`. La licencia es `other`, bajo los términos de artefacto de investigación MultiSTEVE-1, y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | STEVE-1/VPT (política de RL para Minecraft; no se detalla la topología interna en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de texto; actúa sobre observaciones del entorno MineRL) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | multisteve-1-research-artefact-terms (`license: other`) |
| Formato de pesos | `.weights` (checkpoints `STEVE-1_snapshot_<frames>.weights`) |
| Pipeline | reinforcement-learning |
| Tamano del repositorio | 1248,3 GB |
| Numero de agentes | 140 |
| Checkpoint final principal | `160005120` |
| Checkpoint inicial | `000000000` |

## Arquitectura y entrenamiento

Los agentes se construyen sobre STEVE-1, que a su vez deriva de VPT (Video PreTraining) y emplea MineCLIP/MineDojo para la alineación con objetivos en lenguaje natural. El repositorio no documenta en la model card el número de parámetros, la profundidad de la red ni el volumen exacto de datos de entrenamiento; lo que sí especifica es el protocolo experimental: hiperparámetros fijos y control explícito de la aleatoriedad en dos ejes, la semilla de inicialización de pesos y la semilla del orden de datos.

Los cinco grupos del zoo organizan los experimentos de la siguiente forma. `01_init_seed_only` fija la semilla del dataset y varía la de inicialización. `02_data_seed_only` fija la inicialización y varía la del dataset. `03_init_and_data` varía ambas simultáneamente. `04_single_lsb_flip` mantiene las semillas fijas e introduce el volteo de un único bit menos significativo en un peso seleccionado de la capa de embeddings de MineCLIP antes del entrenamiento. `05_final_init_and_data_100` añade 100 ejecuciones con ambas semillas variables para búsqueda de valores atípicos. Cada ejecución conserva logs de orden de datos y de entrenamiento, lo que habilita análisis de sensibilidad y reproducibilidad bit a bit, si bien esta última depende críticamente de las versiones de CUDA, GPU, driver, PyTorch y MineRL.

## Capacidades

- Ejecución de políticas de agente en el entorno MineRL/Minecraft, no generación de texto libre.
- Entrenamiento y evaluación de agentes STEVE-1 condicionados por objetivos expresados en lenguaje natural mediante MineCLIP.
- Reproducción controlada de ejecuciones de entrenamiento con semillas de inicialización y de datos independientes.
- Análisis de sensibilidad a perturbaciones mínimas: el grupo `04_single_lsb_flip` permite estudiar el efecto de un solo bit alterado en los embeddings.
- Búsqueda de valores atípicos mediante las 100 ejecuciones adicionales del grupo `05`.
- Inspección de checkpoints intermedios por número de frames para estudiar la evolución del aprendizaje.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling, function calling, agentes multi-paso sobre texto, visión general, audio y modo *thinking*: no disponibles.

## Casos de uso

- Estudio de reproducibilidad en RL: comparar ejecuciones del grupo `03_init_and_data` para cuantificar cuánta varianza final proviene de la semilla de inicialización frente a la del orden de datos, usando los logs de orden de datos incluidos.
- Investigación de interpretabilidad: analizar cómo el volteo de un solo bit en `04_single_lsb_flip` se propaga a través del entrenamiento y altera el comportamiento del agente en Minecraft.
- Búsqueda de valores atípicos: emplear las 100 ejecuciones de `05_final_init_and_data_100` para identificar políticas con comportamientos anómalos y estudiar sus causas.
- Auditoría de pipelines de entrenamiento: validar que un pipeline propio reproduce las métricas del zoo bajo las mismas versiones de CUDA, PyTorch y MineRL documentadas en el release de código.
- Docencia e investigación académica: disponer de un conjunto factorial listo para enseñar conceptos de no determinación, sensibilidad a semillas y control experimental en aprendizaje por refuerzo.
- Análisis de checkpoints intermedios: usar los snapshots por frames para estudiar curvas de aprendizaje y puntos de divergencia entre ejecuciones con distinta semilla.
- Comparación de metodologías de evaluación: evaluar agentes con los comandos documentados en `docs/evaluations.md` y contrastar resultados entre grupos del zoo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica el despliegue estándar de LLM (vLLM, llama.cpp, Ollama, TGI); el uso previsto es mediante el release de código suplementario, colocando el repositorio en `data/model_zoo/` y siguiendo `docs/training.md` y `docs/evaluations.md`.
- Almacenamiento: el repositorio completo ocupa 1248,3 GB, por lo que se requiere espacio en disco considerable incluso para una selección parcial de checkpoints.
- Latencia y throughput: no disponibles.
- Nota de reproducibilidad: la reproducción bit a bit es sensible a las versiones de CUDA, GPU, driver, PyTorch y MineRL.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiSTEVE-1s | Zoo de 140 agentes STEVE-1/VPT para Minecraft | no disponible | no aplica | multisteve-1-research-artefact-terms | Hugging Face (1248,3 GB) |
| STEVE-1 (original) | Agente único STEVE-1 para Minecraft | no disponible | no aplica | según su propio release | no verificada en la información disponible |
| VPT (Video PreTraining) | Agente base para Minecraft | no disponible | no aplica | según su propio release | no verificada en la información disponible |
| MineCLIP/MineDojo | Modelo de recompensa/alineación para Minecraft | no disponible | no disponible | según su propio release | no verificada en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los agentes actúan únicamente en MineRL/Minecraft y no son políticas de propósito general.
- La reproducción bit a bit es sensible a CUDA, GPU, driver, PyTorch y MineRL; pequeñas diferencias de entorno pueden invalidar la comparación.
- Los checkpoints son artefactos de investigación para estudiar variación e interpretabilidad, no sistemas certificados para seguridad.
- La licencia `multisteve-1-research-artefact-terms` restringe el uso; el repositorio no concede derechos sobre STEVE-1, VPT, MineCLIP/MineDojo, MineRL, las demostraciones de contratistas de OpenAI ni los activos de Minecraft más allá de sus propias licencias.
- Solo se declara soporte de inglés.
- No es un producto oficial de Minecraft ni está aprobado por Mojang o Microsoft.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos generativos; no se documentan sesgos específicos en la model card.
- El tamaño del repositorio (1248,3 GB) complica su descarga y almacenamiento en entornos con recursos limitados.
- No se documentan parámetros, arquitectura interna detallada ni datos de entrenamiento en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MultiSTEVE-1s/MultiSTEVE-1s
- Perfil de la organización: https://huggingface.co/MultiSTEVE-1s/models
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/randomhuggingfaceuser1273823147/steve1-training-data
- Documentación interna del release de código (no enlazada en la información disponible): `README.md`, `docs/data_and_weights.md`, `docs/training.md`, `docs/evaluations.md`, `docs/reproducibility.md`
- Paper de MultiSTEVE-1s: no disponible en la información proporcionada.
