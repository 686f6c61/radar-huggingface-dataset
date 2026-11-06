# eoinf/bigram_top100_20pct_2b_schedule_200m_dmodel008_016_032_064

## Resumen

Este repositorio contiene un modelo de lenguaje causal de tipo transformer, de tamano muy reducido, publicado por el usuario `eoinf` bajo el identificador `bigram_top100_20pct_2b_schedule_200m_dmodel008_016_032_064`. No se trata de un modelo destinado a produccion ni a uso general, sino de una pieza experimental dentro de una rejilla de entrenamiento (experiment grid) orientada al estudio de transformers causales diminutos con distintas anchuras de representacion (`d_model` de 8, 16, 32 y 64).

El modelo emplea un vocabulario de 4096 tokens, una longitud de contexto de 256 tokens y un presupuesto nominal de entrenamiento de 1.999.998.976 tokens (aproximadamente 2.000 millones). El nombre del repositorio sugiere un dataset derivado de los 100 bigramas mas frecuentes con un filtrado del 20 %, aunque la model card no detalla esa composicion y remite a `configuration.json` para la configuracion exacta de datos y tokenizador.

Su relevancia es acotada y de caracter academico: sirve como referencia reproducible para estudiar el comportamiento de arquitecturas transformer en regimenes de parametros extremadamente bajos, asi como para analizar curvas de escalado y planificaciones de entrenamiento. No hay informacion publica sobre licencia, idiomas soportados ni resultados de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tiny causal transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict checkpoints (PyTorch) |

Otros datos relevantes:

| Parametro | Valor |
|---|---|
| Vocabulario | 4096 tokens |
| Anchuras (`d_model`) | 8, 16, 32, 64 |
| Semillas por anchura | 1 |
| Presupuesto nominal de tokens | 1.999.998.976 (~2B) |
| Libreria | PyTorch |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-04 |
| Fecha de actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo decoder-only, en la linea de los modelos autorregresivos clasicos, pero con dimensiones de embedding y de capas extremadamente pequenas (`d_model` entre 8 y 64). El repositorio agrupa varias configuraciones dentro de una misma rejilla experimental, con una sola semilla por anchura, lo que limita la robustez estadistica de cualquier comparacion entre variantes. El contexto maximo es de 256 tokens y el vocabulario de 4096 tokens.

El entrenamiento se planifico con un horizonte nominal de 1.999.998.976 tokens, aunque la model card advierte de que los horizontes reales por modelo, incluyendo paradas tempranas, se registran en `grid_summary.json` y `result.json`. La composicion exacta del dataset y el tokenizador se remiten a `configuration.json`, sin que la informacion disponible detalle su contenido. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal. El codigo de arquitectura y carga se encuentra en el repositorio `synthetic_trigrams`, y cada directorio de modelo incluye checkpoints de estado, definicion de la ejecucion, historial de checkpoints, log de actualizaciones de entrenamiento y metadatos de resultados; no se incluyen estados de reanudacion del optimizador ni los datos de entrenamiento.

## Capacidades

- Generacion de texto autorregresiva a nivel de token, limitada al vocabulario de 4096 tokens y al contexto de 256 tokens.
- Modelado de secuencias cortas para experimentacion sobre dinamica de entrenamiento y escalado.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues; el vocabulario reducido sugiere un alcance muy limitado.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Investigacion sobre escalado de transformers: el modelo permite estudiar como varian las metricas de perdida al modificar `d_model` entre 8 y 64 con un presupuesto fijo de ~2B tokens, util para replicar curvas de escalado en entornos de bajo coste.
- Reproducibilidad de experimentos: al incluir definicion de ejecucion, historial de checkpoints y log de actualizaciones, sirve para verificar resultados de entrenamiento y comparar planificaciones de tokens entre configuraciones.
- Docencia y formacion: un transformer causal de dimensiones minimas es adecuado para explicar el funcionamiento interno de la atencion y del entrenamiento autorregresivo sin requerir hardware especializado.
- Pruebas de pipelines de evaluacion: permite validar herramientas de evaluacion de modelos (perplejidad, generacion, analisis de checkpoints) antes de aplicarlas a modelos de mayor tamano.
- Estudio de tokenizadores reducidos: con un vocabulario de 4096 tokens, sirve para analizar el impacto de vocabularios pequenos en la calidad de la generacion y en la longitud efectiva de las secuencias.
- Analisis de paradas tempranas: los horizontes reales registrados en `grid_summary.json` permiten investigar como afectan las paradas tempranas a la convergencia en regimenes de pocos parametros.
- Baseline para experimentos de arquitectura: al ser un transformer causal canonico, puede actuar como referencia minima frente a variantes como SSM o modelos hibridos en tareas sinteticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano declarado del repositorio (0.0 GB) y las dimensiones (`d_model` <= 64, contexto 256), el modelo es extremadamente ligero y cabe con holgura en cualquier GPU consumer.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA es suficiente, e incluso es viable la ejecucion en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier modelo actual (RTX 3060, RTX 4090, etc.), aunque no se aportan cifras oficiales.
- Opciones de despliegue: al ser checkpoints de PyTorch con codigo en el repositorio `synthetic_trigrams`, el despliegue requiere cargar el state-dict con dicho codigo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion fundamentada. Se trata de un experimento de rejilla con dimensiones muy inferiores a las de cualquier modelo de proposito general.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta pensado para uso en produccion ni para tareas de lenguaje reales.
- Capacidad muy limitada: `d_model` de 8 a 64 y contexto de 256 tokens restringen severamente la coherencia y la longitud de las generaciones.
- Vocabulario reducido de 4096 tokens, lo que implica una tokenizacion poco eficiente y probablemente sesgada hacia el corpus de entrenamiento.
- Una sola semilla por anchura, lo que impide estimar varianza entre ejecuciones.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion y de generacion incoherente inherente a un modelo de este tamano y presupuesto.
- No se documentan sesgos conocidos, pero la falta de informacion sobre el dataset impide evaluarlos.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/bigram_top100_20pct_2b_schedule_200m_dmodel008_016_032_064
- Repositorio de codigo de arquitectura y carga: `synthetic_trigrams` (referenciado en la model card; no se proporciona URL)
- Archivos de metadatos citados: `configuration.json`, `grid_summary.json`, `result.json` (incluidos en el repositorio del modelo)
