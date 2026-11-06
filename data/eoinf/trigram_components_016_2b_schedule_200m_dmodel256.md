# eoinf/trigram_components_016_2b_schedule_200m_dmodel256

## Resumen

El modelo `eoinf/trigram_components_016_2b_schedule_200m_dmodel256` es un transformer causal de muy pequeno tamano publicado en Hugging Face por el usuario `eoinf` como parte de una rejilla de experimentos denominada "Transformer experiment grid". No se trata de un modelo de proposito general ni de un lanzamiento comercial, sino de un artefacto de investigacion disenado para estudiar el comportamiento de transformers causales minimos sobre una tarea sintetica de trigramas. El nombre del repositorio codifica sus parametros clave: una programacion nominal de aproximadamente 2.000 millones de tokens de entrenamiento, un `d_model` de 256 y un vocabulario de 4096 tokens.

La arquitectura es un transformer causal denso de dimension oculta 256, con longitud de contexto de 256 tokens y un unico seed por anchura. El entrenamiento se realizo sobre datos sinteticos generados a partir de trigramas, con un tokenizador propio (`eoinf/pile_tokenizer_4096`), y la evaluacion se efectua sobre los propios datos de entrenamiento, sin conjunto de validacion reservado. El repositorio incluye unicamente los state-dicts de PyTorch, el historial de checkpoints, el registro de actualizaciones de entrenamiento y metadatos de resultado; no contiene los estados del optimizador ni los datos de entrenamiento.

Su relevancia es acotada y estrictamente experimental: sirve para reproducir y analizar curvas de aprendizaje, efectos de la programacion de tokens y comportamiento de modelos de escala minima en tareas controladas. No esta pensado para inferencia en produccion, generacion de texto util ni aplicaciones de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) |
| Parametros totales | no disponible (dimension oculta `d_model` = 256; recuento exacto no publicado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo state-dicts en PyTorch; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre datos sinteticos de trigramas, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (`.pt`/`.bin` segun repositorio); sin safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo decoder-only con una dimension oculta de 256 y una ventana de contexto de 256 tokens. El vocabulario tiene 4096 entradas y se corresponde con el tokenizador `eoinf/pile_tokenizer_4096`, tambien publicado por el mismo autor. Se trata de un unico modelo dentro de una rejilla experimental mas amplia que abarca varias anchuras (`d_model` 256 entre ellas), con un solo seed por anchura, lo que limita cualquier analisis de varianza entre inicializaciones.

El entrenamiento sigue una programacion nominal de 1.999.998.976 tokens (aproximadamente 2000 millones), aunque el horizonte real por modelo, incluyendo paradas tempranas, queda registrado en los ficheros `grid_summary.json` y `result.json` del repositorio. Los datos de entrenamiento son sinteticos y se generan a partir de trigramas; la configuracion exacta del dataset se describe en `configuration.json`. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con la naturaleza puramente sintetica del experimento. Tampoco se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o mezclas de expertos.

## Capacidades

- Generacion de secuencias sinteticas sobre el dominio de trigramas con el que fue entrenado.
- Modelado de lenguaje a nivel de token dentro de un vocabulario cerrado de 4096 entradas.
- Reproduccion de experimentos de escalado y programacion de tokens en regimen de escala minima.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el modelo no opera sobre lenguaje natural.
- No se documenta modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo permite replicar curvas de perdida y comportamiento de un transformer causal de `d_model` 256 sobre una tarea sintetica controlada, util para validar implementaciones de entrenamiento.
- Estudio de programaciones de tokens: al fijar una programacion nominal de ~2000 millones de tokens con registro de paradas tempranas, sirve para analizar como afecta el horizonte efectivo de entrenamiento al rendimiento en tareas sinteticas.
- Analisis de dinamica de trigramas: el modelo puede emplearse para estudiar como un transformer minimo aprende dependencias de orden tres en secuencias generadas, un caso de prueba clasico en teoria del aprendizaje.
- Benchmarking de infraestructura: por su tamano reducido y su formato de state-dict, es adecuado para probar pipelines de carga, checkpointing y reanudacion en frameworks de PyTorch sin coste computacional elevado.
- Docencia y formacion: sirve como ejemplo didactico de arquitectura decoder-only, tokenizacion y evaluacion sobre datos de entrenamiento en cursos de aprendizaje automatico.
- Control negativo en evaluaciones: puede utilizarse como referencia de modelo sin capacidad linguistica real al comparar con modelos de lenguaje naturales en pruebas de alucinacion o coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion se realiza sobre los propios datos de entrenamiento y que no existe evaluacion con conjunto reservado, por lo que no hay metricas comparables con MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al no publicarse el recuento exacto de parametros; por el tamano del repositorio (0,2 GB) y una dimension oculta de 256, la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, incluidas GTX 1060, RTX 3060 y superiores, asi como en iGPU con memoria compartida suficiente.
- Opciones de despliegue: carga directa mediante PyTorch con el codigo de `synthetic_trigrams`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es desplegable en esos entornos sin conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eoinf/trigram_components_016_2b_schedule_200m_dmodel256 | no disponible (d_model 256) | 256 | no disponible | Hugging Face, solo state-dicts | Experimento sintetico de trigramas |
| Modelos de la misma rejilla `eoinf` (otras anchuras) | variables | 256 | no disponible | Hugging Face | Mismo diseno experimental con distinto `d_model` |
| Transformers minimos de referencia tipo nanoGPT | ~10M-100M | variable | MIT (tipicamente) | GitHub / Hugging Face | Entrenados sobre texto natural; no directamente comparables |

No se dispone de modelos directamente comparables en la informacion proporcionada, ya que la tarea sintetica de trigramas y la ausencia de evaluacion reservada impiden una comparacion significativa con modelos de lenguaje de proposito general.

## Limitaciones y advertencias

- El modelo esta entrenado sobre datos sinteticos de trigramas, no sobre lenguaje natural; no produce texto coherente ni responde a instrucciones.
- La evaluacion se realiza sobre los mismos datos de entrenamiento, sin conjunto de validacion, por lo que las metricas reportadas no reflejan capacidad de generalizacion.
- Solo se entrena un seed por anchura, lo que impide estimar la varianza entre inicializaciones.
- La licencia no esta especificada, lo que impide determinar si se permite uso comercial; debe consultarse al autor antes de cualquier uso mas alla de la investigacion.
- El repositorio no incluye estados del optimizador ni datos de entrenamiento, lo que limita la reproduccion completa del proceso.
- La ventana de contexto de 256 tokens es muy reducida y restringe cualquier uso que requiera contexto largo.
- Existe riesgo de sobreajuste severo al tratarse de una tarea sintetica con evaluacion in-sample.
- No se publican pesos en formatos estandar de despliegue (GGUF, safetensors), lo que anade friccion a la integracion en pipelines de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinf/trigram_components_016_2b_schedule_200m_dmodel256
- Tokenizador asociado: https://huggingface.co/eoinf/pile_tokenizer_4096
- Repositorio de arquitectura y carga: `synthetic_trigrams` (referenciado en la model card; URL no disponible en la informacion proporcionada)
- Ficheros de configuracion y resultados: `configuration.json`, `grid_summary.json`, `result.json` (incluidos en el repositorio del modelo)
