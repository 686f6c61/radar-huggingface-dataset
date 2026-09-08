# BurnyCoder/rl-locomotion-steering-vectors

## Resumen

BurnyCoder/rl-locomotion-steering-vectors es un repositorio de investigacion que publica vectores de activacion, controles, episodios numericos y reportes asociados al codigo de investigacion en GitHub. No es un modelo de lenguaje ni un modelo generativo; se trata de un conjunto de artefactos para intervencion causal sobre politicas de reinforcement learning (RL) preentrenadas en entornos MuJoCo (Ant y HalfCheetah). El enfoque consiste en anadir un vector fijo a la primera salida ReLU de un actor RL congelado, sin realizar behavioral cloning, imitation training ni nuevo entrenamiento de politica.

El resultado mas destacado es el vector `lateral` de 256 componentes aplicado con alpha -0.1 sobre la politica `farama-minari/Ant-v5-SAC-medium`. En 30 episodios emparejados de confirmacion, este vector aumenta la velocidad en el eje Y del mundo en +0.40238 m/s (intervalo 95% [+0.30803, +0.49127]) mientras retiene el 96.83% de la velocidad de avance. Sin embargo, el resultado registrado es `confirmation_failed` debido a una regla estricta adicional que rechaza episodios que terminan antes del inicio del steering. El repositorio incluye una auditoria causal que reproduce el vector, verifica particiones de semillas y descarta artefactos como sustitucion de recompensa o cambios de fisica inducidos por camara.

La relevancia actual de este repositorio radica en la interpretabilidad y control de agentes RL: ofrece una metodologia reproducible para estudiar como direcciones especificas en el espacio latente de una politica congelada afectan al comportamiento de locomocion. El tamano del repositorio es de 0.9 GB y los metadatos indican idioma `en` y pipeline `reinforcement-learning`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (vectores de activacion sobre politicas SAC/TQC preentrenadas; sitio de intervencion: `actor.latent_pi[1]`) |
| Parametros totales | No disponible (los pesos del checkpoint base no se redistribuyen; el vector publicado tiene 256 componentes) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de control RL MuJoCo; observaciones de 105 dimensiones para Ant) |
| Tipos de cuantizacion | No disponible (los vectores se distribuyen en formato NPZ; no hay cuantizacion de modelo) |
| Idiomas soportados | en (ingles, segun metadatos; el artefacto no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | NPZ (vectores de activacion, manifiestos y diagnosticos); los pesos base referenciados son de Farama-Minari |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero. Publica vectores de activacion obtenidos mediante analisis de intervencion causal sobre politicas RL congeladas. El vector se anade a la primera salida ReLU del actor (`actor.latent_pi[1]`), y no se realizo behavioral cloning, imitation training ni nuevo entrenamiento de politica. Los checkpoints base referenciados son `farama-minari/Ant-v5-SAC-medium` (105 observaciones, ocho acciones y dos capas ocultas ReLU de 256 unidades) y `farama-minari/HalfCheetah-v5-TQC-medium`. El entorno utilizado es `Ant-v5` con evaluacion determinista y un prefijo comun de 100 pasos.

La innovacion tecnica destacable es la aplicacion de steering vectors a agentes RL de locomocion, junto con un protocolo de auditoria causal que incluye reproduccion del vector a partir de datos de ajuste, comprobacion de particiones de semillas disjuntas, coincidencia de 28 acciones con un forward pass SAC reconstruido y replay de 2.000 transiciones a traves del entorno Ant sin cambios. El vector `lateral` esta escalado RMS y tiene una norma aproximada de 5.15135, por lo que el offset aplicado tiene norma 0.515135. No se debe normalizar de nuevo al cargarlo.

## Capacidades

- Control de trayectoria en el plano del suelo: el vector `lateral` con alpha -0.1 aumenta la velocidad en el eje Y del mundo en +0.40238 m/s en 30 episodios emparejados de confirmacion, reteniendo el 96.83% de la velocidad de avance.
- Intervencion causal sobre politicas RL congeladas sin reentrenamiento: el vector se anade a una capa fija y no requiere actualizacion de pesos.
- Reproduccion de episodios emparejados con semillas de validacion predefinidas (por ejemplo, seed 510000) y visualizacion en video con camara fija, seguimiento top-down o seguimiento original.
- Auditoria causal independiente: el repositorio incluye un informe de auditoria que reproduce el vector, verifica controles y descarta reglas scripted, sustitucion de recompensa, aprendizaje de politica o cambios de fisica inducidos por camara.
- Documentacion de fallos y limites: el registro de experimentos incluye cinco intentos (hc-classic-001, hc-running-002, hc-height-speed-003, hc-height-speed-004, ant-classic-005) con resultados negativos o parciales, lo que sirve como referencia metodologica.
- No soporta generacion de texto, tool calling, agentes de lenguaje, vision o audio. Es un artefacto de investigacion para control de RL, no un modelo multimodal ni un LLM.

## Casos de uso

- Investigacion en interpretabilidad de agentes RL: los vectores publicados permiten estudiar como una direccion especifica en el espacio latente de un actor SAC afecta a la trayectoria del agente en Ant-v5, facilitando el analisis de conceptos emergentes en politicas de control.
- Validacion de metodologias de steering vectors: el repositorio incluye controles, auditorias y fallos documentados, sirviendo como referencia para comparar metodos de intervencion causal en RL frente a enfoques aplicados a LLM.
- Reproduccion de experimentos de control de locomocion: descargando los vectores y ejecutando `locomotion-steering replay --run-dir artifacts/published/experiments/ant-classic-005 --vector lateral --alpha -0.1 --seed 510000`, se pueden reproducir los episodios emparejados con semillas predefinidas.
- Analisis de robustez de politicas RL: examinar como la adicion de un vector fijo afecta a la velocidad, al error cuadratico medio de accion y a la recompensa original, util para evaluar la sensibilidad de politicas entrenadas en entornos continuos.
- Educacion en intervencion causal: el caso `confirmation_failed` documenta una regla estricta que rechaza episodios que terminan antes del steering, sirviendo como ejemplo de como evitar falsos positivos en investigacion de steering vectors.
- Comparacion de politicas base: los vectores se aplican a Ant-v5-SAC-medium y HalfCheetah-v5-TQC-medium, permitiendo comparar como el mismo enfoque de steering funciona en diferentes politicas y entornos de MuJoCo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque este repositorio no contiene un LLM. Los datos de rendimiento disponibles corresponden al experimento `ant-classic-005`:

| Metrica | Valor |
|---|---|
| Efecto en velocidad Y (mundo) | +0.40238 m/s |
| Intervalo de confianza 95% | [+0.30803, +0.49127] |
| Episodios emparejados de confirmacion | 30 |
| Velocidad de avance retenida | 96.83% |
| Resultado registrado | confirmation_failed |
| Fallos antes del inicio del steering | 4/30 en ambos brazos |
| Aumento del error cuadratico medio de accion | +17.84% |
| Recompensa original | Disminuye |

Ademas, el registro de experimentos incluye los siguientes resultados:

| Experimento | Resultado observado |
|---|---|
| hc-classic-001 | Ajuste rechazado porque unas pocas ventanas de recuperacion dominaban los contrastes; sin validacion |
| hc-running-002 | Ninguna configuracion principal supero todas las compuertas de comportamiento originales; cambios de postura con excesiva ralentizacion |
| hc-height-speed-003 | La direccion de altura redirigida fallo la calidad fisica en validacion nueva |
| hc-height-speed-004 | La ralentizacion de menor fuerza bloqueada fallo la confirmacion con 10/30 fallos de tratamiento |
| ant-classic-005 | Efecto en Y del mundo reproducido; compuerta estricta previa al inicio fallo; sin replicacion |

## Requisitos de hardware

- No es un modelo de lenguaje; no requiere VRAM para inferencia de LLM ni despliegue en vLLM, llama.cpp, Ollama o TGI.
- Para reproducir los experimentos se necesita ejecutar el codigo de investigacion en Python con MuJoCo. La politica base es una red pequena (dos capas ReLU de 256 unidades), por lo que el forward pass es ligero y puede ejecutarse en CPU.
- El repositorio ocupa 0.9 GB, pero los vectores NPZ son pequenos (256 componentes) y los manifiestos y diagnosticos son archivos de texto.
- Se recomienda usar el `uv.lock` fijado del repositorio fuente y ejecutar los comandos de descarga y replay desde la raiz del codigo.
- Latencia y throughput estimados: no disponibles. Los episodios se ejecutan en el entorno MuJoCo Ant-v5 con evaluacion determinista y un prefijo comun de 100 pasos.

## Comparativa con modelos similares

No existen modelos comparables en el sentido de LLM. La comparativa se establece con otros repositorios de steering vectors:

| Repositorio | Enfoque | Diferencias clave |
|---|---|---|
| BurnyCoder/rl-locomotion-steering-vectors | Steering vectors en politicas RL (Ant, HalfCheetah) | Intervencion sobre actores SAC/TQC congelados; incluye auditoria causal y registro de fallos |
| steering-vectors/steering-vectors | Steering vectors en modelos de lenguaje (GPT, LLaMa, Gemma, Mistral, Pythia) | Se centra en LLM; proporciona utilidades para entrenar y aplicar vectores a representaciones de lenguaje |
| Otros repositorios de interpretabilidad RL | No disponible en la informacion proporcionada | No disponible |

## Limitaciones y advertencias

- El resultado destacado esta marcado como `confirmation_failed`; no se realizo replicacion independiente ni aplicacion practica.
- La regla estricta adicional rechaza cualquier episodio que termine antes del inicio del steering. En el experimento `ant-classic-005`, la semilla 520025 termina identicamente en el paso 34 en ambos brazos, antes de que el steering comience en el paso 100.
- El efecto observado no establece movimiento lateral relativo al cuerpo ni salto; es desplazamiento lateral en el plano del suelo con implicacion de heading.
- El error cuadratico medio de accion aumenta un 17.84% y la recompensa original disminuye, lo que indica costes de comportamiento asociados al steering.
- La licencia del repositorio no esta disponible; se debe tener precaucion antes de cualquier uso comercial.
- Los pesos de los checkpoints base no se redistribuyen; solo se referencian. El repositorio contiene vectores de activacion y artefactos de investigacion, no un modelo completo.
- Los metadatos indican idioma `en`, pero el artefacto no es un modelo de lenguaje ni tiene capacidades multilingues.
- Las fechas de creacion y actualizacion del repositorio son de 2026, lo cual es inusual; se recomienda verificar la autenticidad y el estado del proyecto antes de utilizarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BurnyCoder/rl-locomotion-steering-vectors
- Codigo fuente en GitHub: https://github.com/BurnyCoder/rl-locomotion-steering-vectors
- Informe de hallazgos (ant-classic-005): https://github.com/BurnyCoder/rl-locomotion-steering-vectors/blob/main/reports/ant-classic-005-findings.md
- Informe de auditoria causal (ant-classic-005): https://github.com/BurnyCoder/rl-locomotion-steering-vectors/blob/main/reports/ant-classic-005-causal-audit.md
- Registro de experimentos: https://github.com/BurnyCoder/rl-locomotion-steering-vectors/blob/main/reports/experiments.md
- Instrucciones de reproduccion de videos: https://github.com/BurnyCoder/rl-locomotion-steering-vectors/blob/main/docs/ant-videos.md
- Modelo base Ant-v5-SAC-medium: https://huggingface.co/farama-minari/Ant-v5-SAC-medium
- Modelo base HalfCheetah-v5-TQC-medium: https://huggingface.co/farama-minari/HalfCheetah-v5-TQC-medium
- Libreria steering-vectors (referencia para LLM): https://github.com/steering-vectors/steering-vectors
