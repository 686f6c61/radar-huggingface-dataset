# lukasz-staniszewski/stable-audio-caa-tempo

## Resumen

`stable-audio-caa-tempo` es un conjunto de vectores de steering de activaciones para el concepto «tempo», calculados mediante adición contrastiva de activaciones (CAA, *contrastive activation addition*) sobre el modelo de difusión de audio Stable Audio Open 1.0 de Stability AI. No es un modelo generativo autónomo: es un artefacto de intervención que se aplica en tiempo de inferencia sobre un transformer DiT preentrenado, sin modificar sus pesos. Lo publica el usuario lukasz-staniszewski y se distribuye en HuggingFace a través de la librería `audio-interv`.

El problema que aborda es el control fino de atributos musicales en modelos de difusión de audio: en lugar de reentrenar o ajustar el modelo para imponer un tempo concreto, el vector se suma a las activaciones de las capas de atención cruzada (`attn2`) de los 24 bloques del transformer, escalado por un coeficiente `alpha`. Así se modula el tempo percibido de la generación manteniendo la condición del prompt original.

Es relevante como ejemplo práctico de la línea de investigación en interpretabilidad y control de modelos de difusión, recogida en el artículo «TADA! Tuning Audio Diffusion Models through Activation Steering» (arXiv 2602.11910). El repositorio ocupa 3,0 GB, no registra descargas ni likes y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering de activaciones (CAA) aplicados sobre un transformer DiT de difusion latente con atencion cruzada; el modelo base es `stabilityai/stable-audio-open-1.0` |
| Parametros totales | no disponible (el repositorio contiene vectores de steering, no los pesos del modelo generativo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la configuracion de referencia genera 10,0 s) |
| Tipos de cuantizacion | no disponible (la configuracion de referencia usa `float16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles; la condicion de texto la aporta el encoder del modelo base) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de 3,0 GB cargado mediante `from_pretrained` de la libreria `audio-interv`) |
| Modelo base | `stabilityai/stable-audio-open-1.0` |
| Concepto intervenido | tempo |
| Metodo declarado | `standard_caa_stable_audio` (adicion contrastiva de activaciones, `normalize_sv: true`) |
| Capas intervenidas | `attn2` de los bloques 0 a 23 del transformer (24 capas) |
| Parametro de control | `alpha` (valor de ejemplo: 1.0) |
| Configuracion de generacion | 100 pasos de inferencia, 10,0 s de audio, `guidance_scale` 7.0, semilla 10, `dtype` float16, dispositivo CUDA, `save_all_cfg_passes: true` |
| Tamano del repositorio | 3,0 GB |
| Libreria | `audio-interv` |
| Fecha de creacion en el Hub | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no entrena pesos nuevos. Sobre Stable Audio Open 1.0, un modelo de difusión latente cuyo denoiser es un transformer (DiT) con 24 bloques, se calculan vectores de dirección para el concepto «tempo» mediante CAA: se comparan pares contrastivos de condicionamientos y se obtiene una dirección media en el espacio de activaciones, que despues se normaliza (`normalize_sv: true`). En inferencia, esa dirección se suma a las activaciones de las capas `attn2` (atención cruzada, la que recibe la condicion de texto) de los 24 bloques, multiplicada por `alpha`. El resultado es una modificación del comportamiento del modelo sin reentrenamiento ni ajuste fino.

La intervención se aplica en todas las pasadas de *classifier-free guidance* (`save_all_cfg_passes: true`), lo que implica que el vector actua tanto en la rama condicionada como en la no condicionada. El articulo asociado, «TADA! Tuning Audio Diffusion Models through Activation Steering», es la referencia metodologica. No se proporcionan datos sobre el conjunto de datos usado para construir los pares contrastivos, el numero de muestras ni el procedimiento exacto de extraccion. El tamaño del repositorio (3,0 GB) sugiere que se almacenan vectores de alta dimensionalidad para las 24 capas, posiblemente en precision de 32 bits.

## Capacidades

- Control del tempo en la generacion de audio con Stable Audio Open 1.0 mediante intervencion en tiempo de inferencia.
- Modulacion continua del efecto a traves del parametro `alpha`, que escala la intensidad del vector de steering.
- Intervencion simultanea sobre las 24 capas de atencion cruzada del transformer, con la posibilidad de definir subconjuntos de capas (`layers_to_steer`).
- Compatibilidad con el muestreo guiado por *classifier-free guidance* (escala 7.0 en la configuracion de referencia) y con semillas fijas para reproducibilidad.
- Carga sencilla mediante `StableAudioCAASteeringController.from_pretrained` y contexto `model.steer(ctrl)`, sin tocar los pesos del modelo base.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta *tool calling* ni *function calling*.
- No esta orientado a flujos de agentes ni a razonamiento multi-paso.
- No se declaran capacidades multilingues propias; la condicion de texto depende del encoder del modelo base.

## Casos de uso

- **Prototipado musical con control ritmico**: un productor puede generar variaciones de un mismo prompt con distintos valores de `alpha` para explorar como cambia el tempo percibido sin reentrenar el modelo, usando semilla fija para aislar el efecto del steering.
- **Generacion de loops y bases ritmicas**: partiendo de un prompt instrumental, el vector permite empujar la generacion hacia tempos mas rapidos o mas lentos, util para crear bancos de fragmentos de 10 s destinados a montaje posterior en un DAW.
- **Investigacion en interpretabilidad de modelos de difusion**: el artefacto sirve como caso de estudio reproducible para analizar como se representa un atributo musical concreto en las activaciones de un DiT y en que capas resulta mas efectiva la intervencion.
- **Comparativas metodologicas de control**: permite contrastar CAA frente a *prompt engineering* o ajuste fino (LoRA) manteniendo constantes el modelo base, el prompt, la semilla y los pasos de inferencia.
- **Aumento de datos con tempo variable**: en un pipeline de generacion por lotes se pueden producir muestras del mismo estilo con tempos distintos para entrenar clasificadores o detectores de tempo, etiquetando cada muestra con el `alpha` empleado.
- **Sonificacion y bandas sonoras adaptativas**: en prototipos de audio reactivo, el tempo puede ajustarse por software en funcion del contexto (por ejemplo, intensidad de una escena) sin reentrenar el modelo subyacente.
- **Demostraciones docentes**: el ejemplo de codigo de la model card es minimo y autocontenido, lo que facilita usarlo en clases o talleres sobre steering de activaciones en modelos generativos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (por ejemplo, precision de tempo estimado en BPM, similitud con el prompt, FAD o evaluaciones subjetivas) ni comparaciones cuantitativas con otras tecnicas de control. Tampoco se aportan numeros en los resultados de busqueda web, que en esta consulta devuelven paginas de fichas de paises sin relacion con el modelo.

## Requisitos de hardware

- **VRAM para los vectores**: el repositorio ocupa 3,0 GB en disco; la carga del controlador debe residir en memoria, por lo que conviene reservar varios gigabytes adicionales a los del modelo base.
- **VRAM para el modelo base**: la configuracion de referencia usa `device: cuda` y `dtype: float16`. Como estimacion orientativa para Stable Audio Open 1.0 con 100 pasos, audio de 10 s y CFG, el consumo se situa en el rango de 6 a 12 GB de VRAM, dependiendo de la longitud del audio y de si se conservan todas las pasadas de CFG. Esta cifra es una estimacion, no un dato declarado en la informacion proporcionada.
- **GPU recomendadas**: no hay recomendaciones oficiales en la informacion disponible. Por el perfil de consumo estimado, tarjetas de gama alta para consumidor (por ejemplo, RTX 3090, RTX 4090 con 24 GB) y aceleradores de centro de datos (A100, H100) son opciones razonables; las GPU con 8 GB o menos pueden requerir reducir la longitud de audio o los pasos de inferencia.
- **Compatibilidad con GPU de consumidor**: probable en tarjetas con 12 GB o mas segun la estimacion anterior, condicionada a la verificacion empirica con el codigo de `audio-interv`.
- **Opciones de despliegue**: la via documentada es la libreria `audio-interv` (`SteerableStableAudioModel` + `StableAudioCAASteeringController`). Para el modelo base sin steering puede usarse `diffusers`. No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama.
- **Latencia y throughput**: no disponible. Con 100 pasos de difusion para 10 s de audio en float16, la latencia dependera de la GPU; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de otros repositorios de vectores de steering para audio en la informacion proporcionada, por lo que la comparacion se plantea a nivel de enfoque de control. Las celdas sin dato se marcan como no disponibles.

| Enfoque | Parametros | Contexto / alcance | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stable-audio-caa-tempo` (CAA sobre Stable Audio Open) | no disponible (vectores de steering, no pesos) | Concepto unico: tempo; 24 capas `attn2` | no disponible (sin benchmarks publicados) | no disponible | Repositorio publico en HuggingFace, 0 descargas, 0 likes |
| Ajuste fino completo o LoRA sobre Stable Audio Open | Depende del rango de LoRA; no disponible | Control por prompt entrenado, multiples atributos potenciales | no disponible | Sujeta a la licencia del modelo base | Ecosistema amplio de recetas y adaptadores |
| *Prompt engineering* sobre Stable Audio Open | 0 parametros extra | Limitado a lo que el encoder de texto interprete; control impreciso del tempo exacto | no disponible | Sujeta a la licencia del modelo base | Inmediata, sin artefactos adicionales |
| Otros vectores CAA para audio | no disponible | No verificados en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin licencia declarada**: la model card no especifica licencia, lo que impide determinar condiciones de uso comercial del artefacto. Ademas, sigue aplicando la licencia del modelo base `stabilityai/stable-audio-open-1.0`, que restringe ciertos usos comerciales y de despliegue.
- **Falta de validacion externa**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de reproducibilidad por terceros.
- **Ausencia de evaluacion cuantitativa**: no se publican metricas de control de tempo (BPM objetivo frente a BPM generado), de calidad de audio ni de fidelidad al prompt.
- **Alcance limitado a un unico concepto**: el vector solo interviene sobre el tempo; no controla tonalidad, genero, instrumentacion, duracion ni estructura.
- **Efecto dependiente de `alpha`**: no se documentan rangos seguros ni el punto en que la intervencion degrada la calidad del audio o introduce artefactos.
- **Control no determinista del tempo**: la intervencion sobre activaciones no garantiza un valor exacto de BPM; es una modulacion estadistica del comportamiento del modelo.
- **Cobertura parcial de la red**: la intervencion se limita a las capas de atencion cruzada `attn2`; no se modifica la atencion propia ni otras rutas del transformer.
- **Idioma**: los ejemplos y la condicion de texto estan en ingles; no se declaran capacidades multilingues.
- **Coste de memoria**: el repositorio de 3,0 GB debe cargarse en memoria junto con el modelo base, lo que reduce el margen en GPU con VRAM ajustada.
- **Riesgo de alucinacion**: no aplica en el sentido habitual de los modelos de lenguaje, pero el steering puede producir salidas que no correspondan al prompt original ni al tempo esperado.
- **Fechas del repositorio**: la creacion y la ultima actualizacion figuran como 2026-09-10, y el articulo asociado tiene identificador de 2026; conviene verificar la vigencia de estos metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukasz-staniszewski/stable-audio-caa-tempo
- Articulo (enlace de HuggingFace Papers): https://huggingface.co/papers/2602.11910
- Articulo en arXiv (identificador del tag `arxiv:2602.11910`): https://arxiv.org/abs/2602.11910
- Modelo base: https://huggingface.co/stabilityai/stable-audio-open-1.0

Nota: los resultados de la busqueda web realizada para esta ficha corresponden a paginas de informacion por paises (CCI France International, France Diplomatie, Hors Frontieres, Business France y CLEISS) y no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes.
