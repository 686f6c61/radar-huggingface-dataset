# LisaMegaWatts/clifford-ssm-checkpoints

## Resumen

Clifford-ssm-checkpoints es un repositorio de artefactos de investigación publicado por LisaMegaWatts que archiva una colección de checkpoints experimentales del proyecto Harmonic GPT. No se trata de un modelo listo para producción, sino de un conjunto de estados de entrenamiento de una arquitectura denominada Clifford SSM / Wave Unified, un modelo de lenguaje a nivel de byte que sustituye la pila Transformer estándar por dinámicas de osciladores y variedades (manifold dynamics). El repositorio tiene un tamaño de 29,8 GB y contiene once directorios de experimentos con checkpoints de PyTorch, además de una exportación NumPy y un manifiesto de tensores en el directorio `e23`.

El interés del repositorio es fundamentalmente académico: sirve para estudiar fenómenos de auto-organización en computación neuronal y para reproducir experimentos de entrenamiento con regímenes de corpus y continuación distintos. Los nombres de los directorios reflejan configuraciones de entrenamiento (por ejemplo, `chinchilla_5k`, `cool_repair`, `quality_80m`, `v2classified_125m`), lo que sugiere variaciones en tamaño de modelo, estrategias de enfriamiento del learning rate y procesos de reparación o adaptación.

Es relevante ahora porque documenta una línea de investigación alternativa a los transformers convencionales, pero debe subrayarse que el propio autor indica explícitamente que estos checkpoints no son modelos de lenguaje listos para producción ni aptos para uso en sistemas críticos. No hay pipeline definido, no se declaran idiomas soportados y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clifford SSM / Wave Unified (harmonic-gpt), basada en dinámicas de osciladores y variedades; no es una pila Transformer estándar |
| Parametros totales | no disponible (los nombres de directorio sugieren variantes de 80M y 125M, pero no se confirma el recuento exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints de entrenamiento en PyTorch y una exportación NumPy) |
| Idiomas soportados | no disponible (modelo a nivel de byte, sin lista de idiomas declarada) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`, serialización basada en pickle) y exportación NumPy (`.npz`) en el directorio `e23`; incluye `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura se describe como Clifford SSM / Wave Unified, un modelo de lenguaje a nivel de byte que emplea dinámicas de osciladores y variedades en lugar de la pila Transformer convencional. El repositorio no proporciona detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni configuración exacta del state space model; para ello remite al repositorio upstream de Harmonic GPT. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset, que no se incluye en el repositorio.

Los checkpoints provienen de múltiples regímenes experimentales de corpus y continuación, reflejados en los nombres de los directorios: `e23_nano_omni_plateau_resume`, `e24_chinchilla_5k_cool_repair_7500`, `e24_chinchilla_5k_cool_repair_lowlr_warm2k`, `e24_chinchilla_5k_cool_repair_lrsweep_qtr`, `e24_chinchilla_5k_cool_repair_minlr5e6_9000`, `e24_chinchilla_5k_cool_repair_minlre6_9000`, `e24_chinchilla_latest_governed_5k`, `e24_e23best_chinchilla_coldadapt_v2_container`, `e25_quality_80m_chinchilla`, `e25_quality_fresh_smoke` y `e26_v2classified_125m_continue`. Los nombres sugieren barridos de learning rate, procesos de reparación tras enfriamiento, adaptación en frío y continuaciones sobre corpus clasificados, pero no se documenta si hubo RLHF, DPO u otras fases de alineamiento. El autor advierte que los resultados de distintos directorios no deben tratarse como comparaciones emparejadas salvo que la documentación del experimento lo establezca.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre bytes en lugar de tokens, lo que en principio permite representar cualquier secuencia de bytes sin vocabulario fijo.
- Modelado de lenguaje experimental: el objetivo declarado es el estudio de la auto-organización en computación neuronal, no una capacidad de producto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües específicas; al ser byte-level no hay una lista de idiomas, pero tampoco hay evaluación publicada.
- No se documentan modos especiales como thinking mode, visión o audio.
- No se declara compatibilidad con `transformers.AutoModel`, por lo que no se puede cargar con la API estándar de HuggingFace.

## Casos de uso

- Investigación sobre state space models: el checkpoint puede cargarse con la revisión y configuración de arquitectura correspondientes de Harmonic GPT para reproducir experimentos de dinámicas de osciladores y comparar con arquitecturas Transformer en tareas controladas.
- Estudio de auto-organización neuronal: los directorios con distintos regímenes de entrenamiento permiten analizar cómo evolucionan los pesos y las representaciones internas a lo largo de fases de enfriamiento, reparación y adaptación.
- Análisis de modelos byte-level: al operar sobre bytes, es útil para estudiar tokenización implícita, robustez ante secuencias fuera de vocabulario y comportamiento en idiomas o formatos poco representados.
- Reproducción de experimentos de learning rate: los directorios `lrsweep_qtr`, `minlr5e6_9000` y `minlre6_9000` permiten examinar el efecto de distintos mínimos de learning rate en la convergencia.
- Docencia e investigación académica: como artefacto de estudio de arquitecturas alternativas al Transformer, puede usarse en cursos o seminarios sobre state space models y modelos generativos.
- Auditoría de seguridad de checkpoints: la presencia de `SHA256SUMS` y de una exportación `.npz` facilita verificar la integridad de los artefactos y evitar la carga de ficheros pickle no confiables en entornos de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (29,8 GB) incluye múltiples checkpoints y no equivale al tamaño de un único modelo en memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de hardware en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Los nombres de directorio sugieren variantes de 80M y 125M parámetros, que en teoría podrían caber en GPU de consumo, pero no hay confirmación oficial ni instrucciones de carga.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga requiere la revisión y configuración de arquitectura de Harmonic GPT, y no es compatible con `transformers.AutoModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Clifford-ssm-checkpoints | no disponible (posibles variantes de 80M y 125M) | no disponible | MIT | HuggingFace, checkpoints de investigación | Arquitectura SSM/osciladores, byte-level, no compatible con transformers |
| Mamba (referencia SSM) | 130M–2.8B según variante | hasta 2k–8k en variantes publicadas | Apache 2.0 | HuggingFace, pesos públicos | SSM selectivo, ampliamente evaluado en benchmarks |
| RWKV (referencia alternativa) | 169M–14B según versión | hasta 4k–32k según versión | Apache 2.0 | HuggingFace, pesos públicos | Arquitectura recurrente lineal, compatible con ecosistema transformers |

La comparación con Mamba y RWKV es solo orientativa: no se dispone de datos de rendimiento del modelo de Clifford SSM que permitan una comparación cuantitativa. La principal diferencia es que Clifford-ssm-checkpoints es un artefacto de investigación sin evaluación publicada, mientras que Mamba y RWKV cuentan con pesos estables, documentación de carga y resultados de benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que estos checkpoints no son modelos de lenguaje listos para producción y no deben usarse en sistemas críticos para la seguridad.
- No se garantiza la veracidad de la información generada; el modelo no está diseñado para generar información factual.
- Los datasets de entrenamiento no se incluyen, lo que impide auditar la composición de los datos y evaluar sesgos.
- No se documentan sesgos conocidos, pero la ausencia de evaluación y de información sobre el corpus impide descartarlos.
- Riesgo de alucinación no cuantificado; no hay benchmarks que permitan estimarlo.
- Los checkpoints en `.pt` usan serialización basada en pickle: solo deben cargarse en entornos de confianza y revisando previamente la ruta de carga. Se recomienda preferir la exportación `.npz` cuando sea suficiente.
- No son compatibles con `transformers.AutoModel`; requieren la revisión y configuración de arquitectura de Harmonic GPT.
- Los resultados de distintos directorios no deben compararse como si fueran experimentos emparejados salvo que la documentación del experimento lo establezca.
- No se declaran idiomas soportados ni longitud de contexto, lo que limita la planificación de despliegues.
- La licencia MIT permite uso comercial, pero la falta de evaluación y de garantías hace desaconsejable cualquier uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LisaMegaWatts/clifford-ssm-checkpoints
- Repositorio upstream de Harmonic GPT: https://github.com/MonumentalSystems/harmonic-gpt
