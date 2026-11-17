# jbilcke/timestral-coreai

## Resumen

Timestral CoreAI es un port nativo para Apple Silicon de la familia de modelos de series temporales Timestral de Mistral AI, publicado por el desarrollador independiente jbilcke. El paquete convierte los cuatro checkpoints MLX en FP32 de Timestral (5M, 28M, 123M y 209M parametros) a activos `.aimodel` ejecutables mediante el framework Apple CoreAI, a traves de un puente de exportacion basado en PyTorch. No se realiza entrenamiento ni cuantizacion: se preservan los valores y layouts de los tensores originales.

El modelo resuelve el problema de forecasting de series temporales con regresion por cuantiles: dada una ventana de contexto, predice un horizonte configurable y devuelve 21 cuantiles por paso, lo que permite construir intervalos de prediccion. Es relevante porque ofrece inferencia local en hardware consumer de Apple (Mac con Apple Silicon) sin depender de GPUs dedicadas ni de servicios en la nube, con verificacion numerica de paridad frente a las implementaciones de referencia.

El repositorio incluye los cuatro bundles de pesos, un runtime Python, un SDK nativo en Swift (TimestralKit) con cola acotada, pool de workers, cancelacion y limites de memoria, ademas de tests y evidencia de validacion. La licencia es una MIT modificada, con terminos adicionales recogidos en el fichero LICENSE-WEIGHTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para forecasting de series temporales (arquitectura interna de Mistral Timestral, no detallada en la informacion disponible) |
| Parametros totales | Cuatro variantes: 5M, 28M, 123M y 209M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales (verificado en las pruebas de validacion) |
| Tipos de cuantizacion | Solo FP32; no se realiza cuantizacion |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | MIT modificada (`modified-mit`), con LICENSE-WEIGHTS adicional |
| Formato de pesos | `.aimodel` (bundles Apple CoreAI); checkpoints originales en MLX FP32 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Mistral Timestral. Lo que si se documenta es el proceso de port: los cuatro checkpoints MLX FP32 originales se convierten a formato CoreAI mediante un puente de exportacion PyTorch, siguiendo las recetas de `coreai-torch` y `coreai-models` de Apple. La carga de checkpoints preserva los valores y layouts de los tensores entrenados; CoreAI puede reorganizar su almacenamiento interno, por lo que la equivalencia se comprueba mediante paridad numerica y no mediante comparacion byte a byte de constantes compiladas.

No se ha realizado entrenamiento, fine-tuning ni cuantizacion en este port. La validacion cubre nueve casos de forecasting contra dos referencias (el port MLX de jbilcke y la implementacion original de Mistral) sobre CPU nativa de CoreAI, incluyendo el contexto completo de 32.768 pasos. El peor RMSE normalizado observado es de 3,07e-6 para el 5M, 3,15e-6 para el 28M, 6,03e-6 para el 123M y 1,19e-6 para el 209M, con un limite de aceptacion de 1e-4. Tambien se verificaron comprobaciones exactas de truncado de contexto.

## Capacidades

- Forecasting de series temporales univariadas y multivariadas con horizonte configurable (por ejemplo, 96 pasos).
- Regresion por cuantiles: devuelve 21 cuantiles por paso de prediccion, lo que permite calcular medianas e intervalos de confianza (por ejemplo, el cuantil 0,9).
- Soporte de contextos largos de hasta 32.768 pasos temporales.
- Ejecucion offline: la carga del modelo verifica tamanos de fichero y checksums SHA-256 sin acceso a red.
- Procesamiento por lotes sostenido mediante el SDK Swift TimestralKit, con cola acotada, pool de workers precalentados, carga y descarga de modelos, cancelacion y limites de memoria.
- Procesamiento masivo en streaming a traves del SDK.
- Integracion en aplicaciones nativas macOS mediante SwiftPM.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo especializado en series temporales.

## Casos de uso

- Prediccion de demanda energetica: el modelo puede tomar una ventana de consumo historico (por ejemplo, 512 pasos horarios) y generar un horizonte de 96 pasos con intervalos por cuantiles, util para planificacion de capacidad en instalaciones con Macs Apple Silicon como estacion de inferencia local.
- Forecasting financiero intraday: con contextos de hasta 32.768 pasos se pueden modelar series de precios o volumenes con estacionalidades multiples, y los 21 cuantiles permiten estimar bandas de riesgo sin infraestructura cloud.
- Monitorizacion de sensores industriales: el SDK Swift permite mantener un pool de workers y procesar en streaming lecturas de sensores, con cancelacion y limites de memoria para despliegues embebidos en macOS.
- Planificacion de inventario en retail: prediccion de ventas por producto con horizontes configurables y cuantiles para dimensionar stock de seguridad segun el nivel de servicio objetivo.
- Prediccion meteorologica a corto plazo: series de temperatura, presion o humedad con contexto largo para capturar ciclos diarios y semanales, ejecutandose localmente en un Mac sin GPU dedicada.
- Investigacion y prototipado: el runtime Python (`TimestralForecaster`) permite experimentar con las cuatro variantes (5M a 209M) y comparar coste frente a precision; el 5M completo ocupa solo 20,06 MiB.
- Validacion de pipelines de forecasting: las comprobaciones de paridad numerica y truncado de contexto del repositorio sirven como referencia para verificar portes propios a otros runtimes.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad predictiva (MAE, MASE, etc.) frente a otros modelos de series temporales. Los unicos datos numericos disponibles son de paridad y latencia del port:

| Modelo | Tamano del bundle | Etapas CoreAI | Peor RMSE normalizado |
|---|---:|---:|---:|
| 5M | 20,06 MiB | 10 | 3,07e-6 |
| 28M | 106,40 MiB | 14 | 3,15e-6 |
| 123M | 468,14 MiB | 22 | 6,03e-6 |
| 209M | 798,97 MiB | 26 | 1,19e-6 |

En el benchmark de 1.000 peticiones documentado en `swift/BENCHMARKS.md`, el modelo 5M completo 1.000 forecasts en 3,13 segundos con un pico de memoria de worker muestreado de 61 MiB (carga de trabajo 64-a-32 sin promediado simetrico). Un forecast individual en caliente con simetria por defecto tardo 6,22 ms. La validacion registro un RSS combinado maximo de 1,77 GiB y al menos 9,07 GiB de memoria de sistema disponible. Estas cifras corresponden a la maquina, formas y ajustes registrados, no a una cota para lotes arbitrarios.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon (no hay soporte para x86 ni para GPU NVIDIA/AMD).
- Sistema operativo: macOS 27 o posterior (el SDK usa CoreAI CPU nativo).
- Memoria: los bundles van de 20 MiB a 799 MiB; la validacion registro un pico de RSS combinado de 1,77 GiB, por lo que 8 GiB de RAM son suficientes para los casos documentados.
- GPU: no se requiere GPU dedicada; la inferencia es en CPU nativa de CoreAI. No hay datos de aceleracion por GPU en la informacion disponible.
- Despliegue: SDK Swift (TimestralKit) via SwiftPM para aplicaciones nativas y lotes sostenidos; runtime Python 3.11+ con `coreai-core==1.0.0b3` para scripts y validacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia: 6,22 ms por forecast en caliente con el 5M; 3,13 s para 1.000 forecasts en el benchmark citado.
- Almacenamiento: el repositorio completo ocupa 1,5 GB; se puede descargar solo un bundle con `--include`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Timestral CoreAI (este) | 5M / 28M / 123M / 209M | 32.768 pasos | `.aimodel`, Apple CoreAI | MIT modificada | Hugging Face, 0 descargas |
| Timestral MLX (jbilcke) | 5M / 28M / 123M / 209M | 32.768 pasos | MLX FP32 | No disponible en la informacion proporcionada | Hugging Face |
| Mistral Timestral (original) | 5M / 28M / 123M / 209M | 32.768 pasos | Checkpoints originales | No disponible en la informacion proporcionada | Coleccion en Hugging Face |

Los tres comparten los mismos pesos; la diferencia esta en el runtime y el hardware objetivo. No se dispone de datos para comparar con otros modelos de forecasting de series temporales (por ejemplo, Chronos, TimesFM o Moirai) en la informacion proporcionada.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon con macOS 27+: no se puede ejecutar en Linux, Windows, x86 ni GPUs NVIDIA.
- Solo FP32: no hay versiones cuantizadas, lo que limita la reduccion de memoria y el rendimiento en equipos con poca RAM.
- Modelo especializado: no genera texto, no soporta tool calling, agentes, vision ni audio; su unico pipeline es `time-series-forecasting`.
- Sin datos publicos de calidad predictiva: no hay benchmarks de error de forecasting frente a alternativas, solo pruebas de paridad numerica.
- Proyecto con adopcion minima: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion a escala.
- Cada invocacion neuronal lanza un proceso worker nuevo que carga, ejecuta y libera una etapa CoreAI y termina; para lotes sostenidos es necesario el SDK Swift, no el runtime Python directo.
- La especializacion del modelo en runtime escribe en la cache de modelos por usuario de Apple; procesos con escritura restringida al checkout necesitan permisos adicionales.
- Licencia MIT modificada con terminos adicionales en LICENSE-WEIGHTS: es necesario revisarlos antes de uso comercial.
- Las cifras de memoria y latencia son muestras de la maquina de validacion, no cotas para lotes arbitrarios.
- Riesgo de alucinacion no aplica en el sentido de lenguaje, pero si el de extrapolaciones poco fiables fuera del regimen de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jbilcke/timestral-coreai
- Licencia de pesos: https://huggingface.co/jbilcke/timestral-coreai/blob/main/LICENSE-WEIGHTS
- Port MLX de referencia: https://huggingface.co/jbilcke/timestral-mlx
- Coleccion original Mistral Timestral: https://huggingface.co/collections/mistralai/timestral
- Documentacion de Apple coreai-torch: https://apple.github.io/coreai-torch/
- Guia del SDK Swift: `swift/README.md` dentro del repositorio
- Benchmarks medidos: `swift/BENCHMARKS.md` dentro del repositorio
- Skill de integracion: `skills/using-timestral-swift/SKILL.md` dentro del repositorio
- Manifiestos y resultados de validacion: `models.json` y `release-manifest.json` dentro del repositorio
