# signaldetectionweary/doom-nwm-p0

## Resumen

Doom NWM P0 es un modelo de mundo ("world model") condicionado por acciones, entrenado sobre ViZDoom, el entorno de investigacion basado en Doom. Lo desarrolla el usuario de Hugging Face signaldetectionweary (repositorio de codigo en GitHub de seanpatrickmoran). Dado un contexto visual corto y una secuencia de acciones del jugador, el modelo genera de forma autorregresiva los fotogramas siguientes en un espacio latente aprendido. No es un modelo de lenguaje: no procesa ni genera texto.

La release empaqueta tres componentes: un VAE de fotogramas que codifica imagenes RGB de 128x128 en latentes espaciales, un diffusion transformer (DiT) condicionado por accion que predice latentes futuros a partir de fotogramas de contexto y acciones, y un critico de direccion opcional llamado FlyByWire que puntua candidatos de accion a corto horizonte antes de la generacion. El repositorio pesa 0,8 GB en formato safetensors y se distribuye bajo licencia MIT.

Su relevancia es la de un prototipo de investigacion para generacion de video condicionada por acciones y para planificacion basada en modelo en entornos tipo videojuego. El propio autor lo describe como prototipo: los rollouts autorregresivos pueden acumular errores visuales y dinamicos, y requiere un dataset de arranque (bootstrap) distribuido por separado para disponer de contexto inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE de fotogramas + diffusion transformer (DiT) condicionado por accion; critico de direccion opcional (FlyByWire) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto visual corto de fotogramas; numero exacto no especificado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (pesos y codigo de la release original); el dataset bootstrap y los assets del juego tienen sus propias condiciones |
| Formato de pesos | safetensors (con config.json por componente: vae/, dit/, steering/) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de modelado del mundo en espacio latente. Un VAE codifica fotogramas RGB de 128x128 en latentes espaciales; el DiT condicionado por accion predice los latentes futuros a partir de los fotogramas de contexto y de la secuencia de acciones del jugador; el VAE decodifica esas predicciones de vuelta a video. La generacion es autorregresiva: cada bloque de fotogramas predicho alimenta el contexto del siguiente. El componente FlyByWire es un critico de direccion que puntua candidatos de accion a corto horizonte usando el modelo de mundo y el critico, de modo que permite seleccionar acciones antes de generar.

El entrenamiento se realiza sobre ViZDoom, aunque no se especifican en la informacion disponible el numero de tokens o fotogramas, la composicion exacta del dataset, ni si hubo etapas de ajuste tipo RLHF o DPO (poco probables en este tipo de modelo). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. El repositorio incluye tres subdirectorios (vae/, dit/, steering/) con config.json y model.safetensors cada uno.

## Capacidades

- Generacion de video condicionada por acciones: produce fotogramas futuros coherentes con una secuencia de acciones del jugador en ViZDoom.
- Modelado del mundo en espacio latente: predice la dinamica del entorno sin renderizar el motor del juego.
- Rollout autorregresivo: encadena predicciones de latentes para generar secuencias de varios pasos.
- Evaluacion de acciones: el critico FlyByWire puntua candidatos de accion a corto horizonte para guiar la generacion.
- Inferencia interactiva: el repositorio de GitHub incluye demos de inferencia cruda y con direccion FlyByWire.
- No soporta tool calling, function calling, agentes basados en lenguaje, ni capacidades multilingues: no es un modelo de texto.

## Casos de uso

- Investigacion en modelado del mundo: usar el DiT condicionado por accion para estudiar como se aprenden las dinamicas de un entorno de videojuego en espacio latente, comparando rollouts con la simulacion real de ViZDoom.
- Planificacion basada en modelo: emplear el critico FlyByWire para puntuar secuencias cortas de acciones candidatas y seleccionar la mas prometedora antes de ejecutar la generacion, como aproximacion a la busqueda con modelo aprendido.
- Generacion de datos sinteticos de video: producir fotogramas de Doom condicionados por acciones para aumentar datasets de entrenamiento de agentes o de modelos de vision.
- Prototipado de agentes en entornos visuales: integrar el modelo como simulador aprendido en un bucle de aprendizaje por refuerzo, sustituyendo parte de las llamadas al entorno real para reducir coste de simulacion.
- Demostraciones interactivas: desplegar la inferencia interactiva del repositorio de GitHub para explorar como responde el modelo a distintas secuencias de acciones en tiempo real.
- Evaluacion de modelos generativos de video: usar el VAE y el DiT como referencia para medir la calidad de prediccion de fotogramas futuros en un dominio controlado de 128x128.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo pesa 0,8 GB en safetensors, por lo que la huella de pesos es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por el tamano del repositorio, una GPU de consumo con suficiente VRAM para el VAE y el DiT a 128x128 deberia ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio (0,8 GB), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: inferencia mediante el repositorio de GitHub (demos de inferencia cruda y con FlyByWire); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Doom NWM P0 | World model condicionado por accion (VAE + DiT) | no disponible | contexto visual corto (no especificado) | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un prototipo de investigacion, segun el propio autor; no esta pensado para produccion.
- Los rollouts autorregresivos pueden acumular errores visuales y dinamicos a medida que avanza la generacion.
- Requiere un dataset de arranque (bootstrap) distribuido por separado para disponer de contexto inicial; los pesos por si solos no bastan para la inferencia.
- Dominio muy restringido: solo ViZDoom, con fotogramas de 128x128; no generaliza a otros entornos ni resoluciones sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling ni multilingues.
- Licencia MIT para pesos y codigo original, pero el dataset bootstrap y los assets del juego subyacente tienen sus propias condiciones, que hay que revisar antes de uso comercial o redistribucion.
- No se han publicado datos de sesgos, benchmarks ni evaluaciones de calidad; cualquier uso en produccion exigiria una evaluacion propia.
- Riesgo de alucinacion en el sentido de generar dinamicas visualmente plausibles pero fisicamente incorrectas respecto al entorno real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/signaldetectionweary/doom-nwm-p0
- Repositorio de GitHub: https://github.com/seanpatrickmoran/doom-nwm-p0
- Dataset bootstrap: https://huggingface.co/datasets/signaldetectionweary/doom-nwm-p0-bootstraps
