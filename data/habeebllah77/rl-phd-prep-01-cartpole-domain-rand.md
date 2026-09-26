# habeebllah77/rl-phd-prep-01-cartpole-domain-rand

## Resumen

`habeebllah77/rl-phd-prep-01-cartpole-domain-rand` es una política PPO entrenada con Stable-Baselines3 sobre el entorno `CartPole-v1`, envuelto con un wrapper propio de aleatorización de dominio que remuestrea la masa del carro, la masa del poste y la longitud del poste al inicio de cada episodio. No es un modelo de lenguaje ni un transformer: es un artefacto de investigación de refuerzo de tamaño reducido, con una política MLP, cuyo propósito es demostrar empíricamente que la aleatorización de dominio mejora la extrapolación fuera de la distribución de entrenamiento frente a una política entrenada con parámetros fijos.

El hallazgo principal que reporta el autor es que, de las tres variables aleatorizadas, solo la longitud del poste afecta de forma sustancial a la dificultad de la tarea: las masas del carro y del poste muestran una recompensa plana de 500/500 dentro de rangos amplios. La política aleatorizada mantiene la recompensa máxima hasta una longitud de poste de 1,1 (un 47 % por encima del límite superior de entrenamiento, fijado en 0,75), mientras que la línea base de parámetros fijos se degrada ya en 0,9–1,1. El resultado se replica con 3 semillas de entrenamiento independientes.

Se trata de material de tipo educativo y de preparación de investigación, publicado como demostración de sim-to-real, y el propio autor indica explícitamente que no está pensado para uso en producción. El repositorio ocupa 0,0 GB y las descargas registradas en HuggingFace son 0, con 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (actor-critico) con politica MLP (`MlpPolicy` de Stable-Baselines3); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de control con observaciones de estado, no texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | MIT segun la model card del autor; el metadato de HuggingFace figura como "no disponible" |
| Formato de pesos | archivo `.zip` de Stable-Baselines3, cargable con `PPO.load()` |
| Entorno | `CartPole-v1` con wrapper de aleatorizacion de dominio |
| Espacio de acciones | discreto (2 acciones, segun la definicion estandar de `CartPole-v1`) |
| Timesteps de entrenamiento | 200.000 |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es una política PPO estándar de Stable-Baselines3 con `MlpPolicy`, es decir, una red perceptrón multicapa que aproxima la política y la función de valor sobre el vector de observación de `CartPole-v1`. No hay atención, ni capas recurrentes documentadas, ni componentes de tipo SSM o híbrido. El autor no especifica el número de parámetros ni el tamaño exacto de las capas ocultas, por lo que ese dato queda como no disponible.

El entrenamiento se realizó durante 200.000 timesteps con los hiperparámetros por defecto de PPO en Stable-Baselines3: `learning_rate=3e-4`, `n_steps=2048`, `batch_size=64`, `n_epochs=10`, `gamma=0.99`, `gae_lambda=0.95` y `clip_range=0.2`. La innovación relevante no está en la arquitectura sino en el envoltorio del entorno: un wrapper de aleatorización de dominio que remuestrea uniformemente en cada episodio la masa del carro en [0,5, 1,5], la masa del poste en [0,05, 0,2] y la longitud del poste en [0,25, 0,75]. No se menciona uso de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento por refuerzo.

La evaluación compara esta política contra una línea base de parámetros fijos entrenada en un único punto del espacio de parámetros, con 3 semillas independientes por configuración. El autor reporta que el análisis completo, las gráficas y la discusión metodológica están en el archivo `RESEARCH_REPORT.md` del repositorio de GitHub asociado, cuyo enlace no aparece publicado en la model card.

## Capacidades

- Control de un péndulo invertido sobre carro en `CartPole-v1`: la política mantiene el poste en equilibrio aplicando acciones discretas izquierda/derecha.
- Robustez a variaciones de la masa del carro dentro del rango [0,5, 1,5] y de la masa del poste dentro de [0,05, 0,2], con recompensa plana de 500/500 según la evaluación del autor.
- Extrapolación más allá del rango de entrenamiento en la longitud del poste: mantiene 500/500 hasta longitud 1,1, frente al límite de entrenamiento de 0,75.
- Degradación gradual y no catastrófica en longitudes extremas (342,6 ± 272,6 a longitud 1,3 y 186,6 ± 271,7 a longitud 1,5), con varianza alta entre semillas.
- Reproducibilidad de la política mediante carga directa del archivo `.zip` con `PPO.load()` en Stable-Baselines3.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling, capacidades de agente ni soporte multilingüe. Cualquier uso de ese tipo queda fuera del alcance del artefacto.

## Casos de uso

- Reproducción de experimentos de aleatorización de dominio: cargar el `.zip` junto con el `CartPoleDRWrapper` del repositorio de GitHub permite replicar la comparación contra la línea base de parámetros fijos y verificar las curvas de recompensa frente a longitud del poste.
- Material docente en cursos de aprendizaje por refuerzo: sirve como ejemplo mínimo y ejecutable de cómo un wrapper de remuestreo por episodio cambia la generalización de PPO, sin requerir GPU ni grandes recursos de cómputo.
- Línea base en estudios de sim-to-real: investigadores que trabajen en transferencia de políticas pueden usar estos resultados como referencia de cuánto gana una política aleatorizada frente a una entrenada en un punto único del espacio de parámetros.
- Ablación de factores de dificultad en entornos de control: el hallazgo de que las masas apenas afectan y la longitud del poste domina es directamente reutilizable para priorizar qué variables aleatorizar en pipelines propios.
- Punto de partida para currículos de entrenamiento: dado que la política mantiene el techo de recompensa hasta longitud 1,1, puede emplearse como inicialización o profesor para experimentos de curriculum que extiendan progresivamente el rango de longitudes.
- Validación de implementaciones de wrappers: el código de aleatorización puede usarse como prueba de referencia para comprobar que un wrapper propio remuestrea los parámetros correctos en el momento correcto del ciclo de vida del episodio.
- Estudio de varianza entre semillas: los resultados con desviaciones estándar muy altas a longitudes 1,3 y 1,5 permiten analizar la estabilidad del entrenamiento PPO y diseñar protocolos de evaluación con más semillas.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados proceden de la model card del autor. Miden recompensa media ± desviación estándar sobre 3 semillas independientes, barriendo la longitud del poste. El máximo de `CartPole-v1` es 500.

| Longitud del poste | Este agente (media ± std, 3 semillas) | Linea base de parametros fijos (media ± std, 3 semillas) |
|---|---|---|
| ≤ 0,7 | 500,0 ± 0,0 | 500,0 ± 0,0 |
| 0,9 | 500,0 ± 0,0 | 340,5 ± 276,3 |
| 1,1 | 500,0 ± 0,0 | 35,9 ± 20,6 |
| 1,3 | 342,6 ± 272,6 | 17,4 ± 3,6 |
| 1,5 | 186,6 ± 271,7 | 16,1 ± 0,2 |

Hallazgo adicional reportado por el autor: la masa del carro y la masa del poste tienen un efecto prácticamente nulo sobre la dificultad de la tarea, con recompensa plana de 500/500 en el barrido de `masscart` de 0,1 a 4,9 y de `masspole` de 0,01 a 0,99.

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, algo esperable dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB. La política es una MLP de tamaño reducido sobre un vector de observación de 4 dimensiones; no requiere acelerador gráfico.
- GPU recomendadas: no aplica. Cualquier GPU, incluida una integrada, es suficiente; no se necesita A100, H100 ni RTX 4090.
- Ejecución en CPU: sí, es la vía natural. El entrenamiento de 200.000 timesteps en `CartPole-v1` es asumible en CPU en tiempos del orden de minutos, aunque el autor no publica cifras concretas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso sin GPU.
- Opciones de despliegue: Stable-Baselines3 con `PPO.load()` sobre el archivo `.zip`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La model card no documenta exportación a ONNX ni a otros formatos de inferencia.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tiempo por paso ni de pasos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entorno | Aleatorizacion de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este agente (`rl-phd-prep-01-cartpole-domain-rand`) | no disponible | `CartPole-v1` | Si (masa del carro, masa del poste, longitud del poste) | MIT segun model card | Publicado en HuggingFace |
| Linea base de parametros fijos (modelo companero) | no disponible | `CartPole-v1` | No (un unico punto de parametros) | no disponible | Enlace no publicado en la model card |
| PPO por defecto de Stable-Baselines3 RL Zoo sobre `CartPole-v1` | no disponible | `CartPole-v1` | No | MIT (licencia del proyecto SB3) | Publico en el RL Zoo de SB3 |

La comparación con la línea base companera es la única que dispone de datos numéricos comparables y está recogida en la tabla de la sección de benchmarks. Frente a una política PPO estándar de SB3 sin aleatorización, la diferencia esperable es de robustez fuera de distribución, pero no se han publicado resultados de benchmarks en la informacion disponible para cuantificarla con otras alternativas.

## Limitaciones y advertencias

- Uso previsto exclusivamente investigador y educativo. El propio autor declara que no está pensado para producción.
- Licencia ambigua en el metadato: la model card indica MIT, pero el campo de licencia de HuggingFace aparece como "no disponible". Conviene confirmar el fichero LICENSE del repositorio antes de cualquier reutilización.
- Alcance limitado a `CartPole-v1`, un entorno de juguete. Las conclusiones sobre robustez no son extrapolables directamente a tareas de control reales ni a sistemas robóticos.
- Rango de aleatorización de entrenamiento estrecho en longitud de poste ([0,25, 0,75]). Fuera de 1,1 la recompensa cae de forma acusada.
- Varianza muy alta entre semillas en el régimen extrapolado: desviación estándar de 272,6 a longitud 1,3 y de 271,7 a longitud 1,5, con solo 3 semillas por configuración. Las medias en ese tramo deben interpretarse con cautela.
- No se documentan los parámetros exactos de la red ni el tamaño de las capas ocultas, lo que dificulta reproducir el cómputo exacto del modelo.
- No se publica el enlace al repositorio de GitHub ni al modelo companero de parámetros fijos, por lo que el wrapper `CartPoleDRWrapper` necesario para una evaluación equivalente no es accesible desde la model card.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Sesgos conocidos: no disponibles.
- Sin garantías de mantenimiento: 0 descargas y 1 like en el momento de la consulta, con fecha de publicación y actualización idénticas, lo que sugiere que no ha habido revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/habeebllah77/rl-phd-prep-01-cartpole-domain-rand
- Modelo companero (linea base de parametros fijos): enlace no publicado en la model card ("link once pushed")
- Codigo y memoria completa del experimento (`RESEARCH_REPORT.md`): enlace de GitHub no publicado en la model card
- Stable-Baselines3: no enlazado en la model card; disponible en https://stable-baselines3.readthedocs.io
- Documentacion del entorno `CartPole-v1` (Gymnasium): no enlazada en la model card
