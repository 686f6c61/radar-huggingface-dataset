# At1uri/spiking-neural-network-vault

## Resumen

`At1uri/spiking-neural-network-vault` no es un modelo de lenguaje con pesos entrenados, sino un repositorio de investigacion (research vault) publicado en Hugging Face por Ramprasad Atluri (usuario `At1uri`). Contiene implementaciones de referencia en Python para simulacion de camaras de eventos DVS (Dynamic Vision Sensor), solvers numericos de neuronas Leaky Integrate-and-Fire (LIF) con gradientes sustitutos y un perfilador energetico basado en SynOps frente a FLOPs densos en tecnologia CMOS. El objetivo es servir como material reproducible para investigadores que trabajan en redes neuronales de impulsos (SNN) y computacion neuromorfica.

El repositorio se organiza en tres modulos principales (`dvs_event_camera.py`, `lif_neuron_simulator.py`, `synops_energy_profiler.py`), un suite de evaluacion (`eval_neuromorphic_snn.py`) y un manifiesto criptografico SHA-256 para verificacion de integridad. Incluye las ecuaciones bioplasticas fundamentales: contraste logaritmico de intensidad para generacion de eventos, dinamica diferencial de la membrana LIF y una aproximacion sigmoide rapida del gradiente sustituto para permitir retropropagacion a traves de la no linealidad de disparo.

Es relevante ahora porque la comunidad investigadora necesita artefactos reproducibles y auditables para SNN, un area donde la mayoria de publicaciones carecen de codigo ejecutable o de verificacion de integridad. El repositorio esta etiquetado como `research-vault` y no como modelo desplegable, por lo que su valor es pedagogico y metodologico mas que de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de simuladores SNN; no es un modelo con pesos) |
| Parametros totales | No disponible (no hay pesos entrenados) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (codigo Python fuente; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni una arquitectura de red concreta con pesos. Lo que proporciona son componentes de simulacion: un generador asincrono de eventos por contraste logaritmico de intensidad que emula el comportamiento de una camara DVS, un integrador numerico de ecuaciones diferenciales LIF para multiples neuronas con soporte de gradientes sustitutos, y un contador de SynOps (operaciones sinapticas) que compara el coste energetico CMOS de una SNN dispersa frente a una red densa equivalente en FLOPs.

La innovacion tecnica reside en la inclusion de la aproximacion de gradiente sustituto tipo sigmoide rapida, que permite entrenar SNN mediante retropropagacion pese a la discontinuidad del mecanismo de disparo, y en el manifiesto SHA-256 que garantiza la integridad criptografica de los ficheros. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO porque el artefacto no entrena ningun modelo.

## Capacidades

- Simulacion de flujo de eventos DVS a partir de secuencias de intensidad, con umbral configurable `theta`.
- Integracion numerica de dinamica LIF multi-neurona con parametros `tau_m`, `V_rest`, `R` y `V_th`.
- Entrenamiento de SNN mediante gradientes sustitutos (aproximacion sigmoide rapida).
- Perfilado energetico comparativo SynOps vs FLOPs densos en contabilidad CMOS.
- Suite de verificacion de extremo a extremo de flujo de eventos y dispersion (sparsity) de SNN.
- Verificacion de integridad de ficheros mediante manifiesto SHA-256.
- Documentacion de ecuaciones biofisicas en el README.

## Casos de uso

- Investigacion reproducible en SNN: el repositorio permite a un grupo de investigacion replicar experimentos de codificacion por eventos y dinamica LIF sin reimplementar los simuladores desde cero, gracias a los tres modulos autocontenidos y al manifiesto de integridad.
- Docencia en computacion neuromorfica: los ficheros `dvs_event_camera.py` y `lif_neuron_simulator.py` sirven como material practico para asignaturas de neurociencia computacional, ya que implementan las ecuaciones canonicas con trazabilidad criptografica.
- Evaluacion de eficiencia energetica de SNN: el perfilador `synops_energy_profiler.py` permite cuantificar el ahorro de SynOps frente a FLOPs densos en un modelo dado, util para justificar el uso de hardware neuromorfico en propuestas de proyecto.
- Prototipado de pipelines de vision basada en eventos: el simulador DVS permite generar flujos de eventos sinteticos a partir de video convencional para entrenar o validar modelos de vision neuromorfica antes de disponer de una camara DVS fisica.
- Auditoria de artefactos cientificos: el `MANIFEST.json` con SHA-256 permite verificar que los ficheros descargados no han sido alterados, util en revisiones por pares o en pipelines de integridad continua.
- Base para benchmarks internos: el suite `eval_neuromorphic_snn.py` puede adaptarse como plantilla para comparar variantes de codificacion de eventos o de solvers LIF dentro de un mismo laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: los simuladores son codigo Python numerico que puede ejecutarse en CPU.
- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica; opcionalmente cualquier GPU con soporte CUDA si el usuario vectoriza los simuladores con NumPy/CuPy, pero no se documenta en la informacion disponible.
- Cabe en cualquier consumer GPU o incluso en CPU: no hay requisito de memoria de modelo.
- Opciones de despliegue: ejecucion directa con `python benchmarks/eval_neuromorphic_snn.py` segun el README; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Licencia | Pesos | Enfoque |
|---|---|---|---|---|
| `At1uri/spiking-neural-network-vault` | Research vault (codigo) | MIT | No | Simuladores DVS, LIF y perfilado SynOps |
| NorNet / SNN frameworks genericos (p. ej. SpikingJelly) | Libreria | MIT/Apache | No | Framework completo de SNN |
| BindsNET | Libreria | MIT | No | Simulacion de SNN en PyTorch |
| snnTorch | Libreria | MIT | No | Entrenamiento de SNN con gradientes sustitutos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria, licencia y presencia o ausencia de pesos.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo con pesos: no puede usarse para generacion de texto, codigo, vision ni ninguna tarea de inferencia directa.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso o validacion por parte de la comunidad.
- No se documentan resultados de benchmarks ni validacion experimental en la model card.
- No se especifican dependencias, versiones de Python ni entorno de ejecucion, lo que puede dificultar la reproducibilidad.
- No se declaran sesgos porque no hay modelo entrenado, pero los simuladores pueden heredar sesgos de los datos de entrada que se les proporcionen.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- El repositorio parece orientado a investigacion y docencia; no debe tratarse como componente listo para produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/At1uri/spiking-neural-network-vault
- Repositorio del autor en Hugging Face: no disponible en la informacion proporcionada
- Paper asociado: no disponible
- Blog o demo: no disponible
- Repositorio GitHub espejo: no disponible
