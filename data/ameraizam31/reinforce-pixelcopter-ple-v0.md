# ameraizam31/Reinforce-Pixelcopter-PLE-v0

## Resumen

Reinforce-Pixelcopter-PLE-v0 es un agente de aprendizaje por refuerzo entrenado con el algoritmo REINFORCE (gradiente de politica Monte-Carlo) para resolver el entorno Pixelcopter-PLE-v0, un juego de tipo arcade implementado sobre la libreria PyGame Learning Environment (PLE). Lo desarrolla el usuario ameraizam31 como parte de los ejercicios de la Unidad 4 del curso Deep Reinforcement Learning Course de Hugging Face, y se publica como un checkpoint reproducible con pesos en float16 y un script de carga (`policy.py`) incluido en el repositorio.

No se trata de un modelo de lenguaje ni de un transformer: es una politica neuronal de tipo MLP de tres capas (7 -> 64 -> 128 -> 2) que recibe un vector de estado de 7 dimensiones del entorno y produce una distribucion de probabilidad sobre 2 acciones discretas. El interes practico es acotado: sirve como referencia docente de una implementacion correcta de REINFORCE con baseline de valor de estado aprendido, normalizacion de ventajas, bonus de entropia y recorte de norma de gradiente, y como ejemplo de evaluacion honesta en semillas no vistas durante el entrenamiento.

El modelo se publico en noviembre de 2026, no tiene descargas ni likes, y su tamano de repositorio es practicamente nulo (0.0 GB), lo que refleja que los pesos son unos pocos kilobytes. No es un modelo para produccion ni para tareas generales: su unico dominio es el entorno Pixelcopter-PLE-v0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 7 -> 64 -> 128 -> 2 con normalizacion de entrada fija almacenada en el modelo |
| Parametros totales | no disponible (pesos almacenados en float16; el repo ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 7 valores de estado) |
| Tipos de cuantizacion | float16 (pesos del checkpoint `model.pt`); no se documentan otras |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch en float16), cargable mediante `policy.py` |

## Arquitectura y entrenamiento

La politica es una MLP de tres capas con dimensiones 7 -> 64 -> 128 -> 2, el mismo diseno propuesto en el curso. La entrada son 7 valores de estado extraidos de PixelcopterEnv (gym_pygame, PLE) y la salida son logits sobre 2 acciones discretas; la accion se muestrea de la politica tanto en entrenamiento como en evaluacion. El modelo incluye una normalizacion de entrada fija almacenada junto con los pesos, de modo que la inferencia es autocontenida.

El entrenamiento se realizo en dos fases con REINFORCE y un baseline de valor de estado aprendido que se resta al retorno Monte-Carlo (sin bootstrapping). La fase 1 consistio en 3.197 actualizaciones de 16 episodios cada una, con tasa de aprendizaje 1e-3, bonus de entropia de 0.01 decayendo hasta 0.0005, unos 45,8 millones de pasos de entorno. La fase 2 continuo desde la fase 1 durante 433 actualizaciones de 32 episodios, con tasa de aprendizaje 3e-4, un baseline reajustado durante 20 actualizaciones antes de reanudar las actualizaciones de politica, y bonus de entropia reiniciado en 0.01 y terminando en 0.0011, unos 31,6 millones de pasos adicionales. Se aplicaron ventajas normalizadas, optimizador Adam y recorte de norma de gradiente a 0.5, con gamma 0.99 y episodios de entrenamiento limitados a 4.000 pasos. El checkpoint final se selecciono entre 10 candidatos sobre 150 episodios de validacion (semillas 600000+ y 700000+), y los pesos se redondearon a float16.

## Capacidades

- Control de politica en el entorno Pixelcopter-PLE-v0: selecciona entre 2 acciones discretas a partir de un estado de 7 valores.
- Muestreo estocastico de acciones desde la distribucion de la politica (comportamiento identico al usado en la evaluacion).
- Carga autocontenida mediante `load_policy("model.pt")` y llamada `policy.act(state)`, que devuelve accion y metadatos.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo thinking ni de generacion de texto.
- No generaliza fuera del entorno Pixelcopter-PLE-v0: la politica esta especializada en un unico juego.

## Casos de uso

- Docencia de REINFORCE: usar el checkpoint como referencia funcional en la Unidad 4 del Deep RL Course para comparar una implementacion propia con una ya entrenada, gracias a que el repositorio incluye `policy.py` y los pesos exactos usados en la evaluacion.
- Reproduccion de experimentos: cargar `model.pt` con `load_policy` y ejecutar episodios en PixelcopterEnv para verificar que la media de retorno reportada (642,80) es reproducible en las semillas 900000-900009.
- Baseline en investigacion de RL: emplear el agente como linea base de comparacion frente a variantes como PPO, A2C o REINFORCE con distintas configuraciones de baseline y entropia en el mismo entorno.
- Estudio de estabilidad del entrenamiento: analizar el efecto de las dos fases (lr 1e-3 y luego 3e-4, con reinicio del bonus de entropia y reajuste del baseline) sobre la varianza del retorno, que es alta (desviacion tipica de 500,78 sobre media de 642,80).
- Pruebas de infraestructura de evaluacion: integrar el agente en pipelines que validen entornos PLE o `gym_pygame`, ya que el modelo es ligero y se ejecuta en CPU sin requisitos de GPU.
- Ejemplo de publicacion reproducible en Hugging Face: servir de plantilla para subir checkpoints de RL con model-index, `results.json` con retornos por episodio y semillas de evaluacion documentadas.
- Analisis de seleccion de checkpoint: estudiar el procedimiento de elegir entre 10 candidatos sobre 150 episodios de validacion como practica de model selection en RL.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Pixelcopter-PLE-v0 | mean_reward | 642,80 +/- 500,78 |

La evaluacion se realizo sobre 10 episodios de hasta 10.000 pasos cada uno, con semillas de entorno 900000-900009, nunca usadas en entrenamiento ni en seleccion de modelo, y muestreando acciones de la politica. Fue la unica ejecucion de evaluacion sobre esas semillas; los retornos por episodio estan en `results.json`. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; la MLP tiene tres capas y los pesos se almacenan en float16, por lo que el checkpoint ocupa unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problemas. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea acelerar el muestreo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch en CPU o GPU mediante `policy.py`; no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una MLP de tres capas, la inferencia por paso es del orden de microsegundos en CPU, pero no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Reinforce-Pixelcopter-PLE-v0 (este) | REINFORCE con baseline | Pixelcopter-PLE-v0 | no disponible (MLP 7-64-128-2) | no aplica | mean_reward 642,80 +/- 500,78 | no disponible | Hugging Face |
| Otros agentes del Deep RL Course (Unidad 4) | REINFORCE | Pixelcopter-PLE-v0 | misma arquitectura de curso | no aplica | no disponible | no disponible | Hugging Face (comunidad) |
| Agentes PPO/A2C sobre Pixelcopter | PPO / A2C | Pixelcopter-PLE-v0 | variable | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables en la informacion proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un agente de control en un unico entorno, no aplican sesgos de lenguaje, pero la politica puede explotar sesgos del simulador PLE.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; sin embargo, la politica puede producir acciones suboptimas o erraticas por su naturaleza estocastica y por la alta varianza del retorno.
- Varianza elevada: la desviacion tipica reportada (500,78) es casi tan grande como la media (642,80), lo que indica un rendimiento muy variable entre episodios.
- Limitacion de dominio: solo funciona en Pixelcopter-PLE-v0 con entradas de 7 valores; no generaliza a otros entornos ni a otras representaciones de estado.
- Limitacion de idioma: no procesa lenguaje, por lo que no hay soporte multilingue.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso fuera de docencia o investigacion.
- Caveat de produccion: el checkpoint se selecciono sobre 150 episodios de validacion y se evaluo una sola vez en 10 episodios con semillas fijas; la significancia estadistica es limitada y no hay verificacion independiente de los resultados.
- Pesos en float16: el redondeo a float16 puede introducir diferencias minimas respecto a los pesos originales en float32.
- Repositorio sin descargas ni likes: no hay evidencia de uso por terceros ni de validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/Reinforce-Pixelcopter-PLE-v0
- Curso Deep Reinforcement Learning, Unidad 4: https://huggingface.co/deep-rl-course/unit4/introduction
- Repositorio del curso Deep RL: https://github.com/huggingface/deep-rl-class
- PyGame Learning Environment (PLE): https://github.com/ntasfi/PyGame-Learning-Environment
- Documentacion de Gymnasium (entornos de RL): https://gymnasium.farama.org/
