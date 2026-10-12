# omnimem/self_forcing_from_cd

## Resumen

`self_forcing_from_cd` es un checkpoint de pesos de un generador de video texto-a-video desarrollado por el usuario omnimem dentro del proyecto OmniMem. No se trata de un modelo final publicado para uso directo, sino de un punto de control intermedio de entrenamiento: concretamente, los pesos EMA (media móvil exponencial) del generador en el paso 600 del entrenamiento de "ordinary self-forcing", inicializados a partir de unos pesos de generador ya entrenados con un procedimiento denominado CD. La propia model card indica que este checkpoint es la inicialización usada por otro modelo del mismo autor, `long_rolling_plain_from_cd`.

El modelo se apoya en la arquitectura Wan2.1 (familia de difusión para video) con una variante causal y atención dispersa nativa (NSA) con selección de bloques top-12. El payload tiene 1.420.656.760 parámetros almacenados en FP32 (unos 5,7 GB de pesos en el repositorio, repartidos en dos shards de safetensors). Para funcionar como pipeline completo de texto-a-video requiere componentes externos: el VAE de Wan2.1, el codificador de texto UMT5 y el tokenizador correspondiente.

Su relevancia es acotada: se trata de un artefacto de investigación y reproducibilidad de una línea de trabajo concreta (self-forcing y rolling largo en generación de video), sin descargas ni "likes" en el momento de la consulta y sin licencia declarada. Es interesante para quienes siguen técnicas de generación de video autorregresiva/rolling y variantes de atención dispersa sobre Wan, pero no es un modelo listo para producción ni un checkpoint final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video basada en Wan2.1 con atencion causal y NSA (Native Sparse Attention) con seleccion de bloques top-12 |
| Parametros totales | 1.420.656.760 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards + indice; FP32) |

## Arquitectura y entrenamiento

Se trata de un transformer de difusion para generacion de video (pipeline text-to-video) construido sobre Wan2.1. La clase de modelo es `CausalWanNSAModel` y el pipeline asociado es `CausalWanT2VPipeline`. La configuracion emplea atencion dispersa nativa (NSA) con seleccion de los 12 bloques mas relevantes (top-12 block selection), lo que sugiere un mecanismo de atencion eficiente pensado para secuencias largas. El caracter "causal" del modelo apunta a un regimen de generacion autorregresiva sobre fotogramas o latentes, coherente con el enfoque de "self-forcing" y de "rolling" largo que aparece en el linaje del checkpoint.

En cuanto al entrenamiento, la model card describe la ascendencia del checkpoint: pesos EMA del paso 4500 de un entrenamiento "CD" pasan a ser la inicializacion de un entrenamiento "ordinary self-forcing", del que se publica el EMA del paso 600. Ese checkpoint, a su vez, sirve de inicializacion para un entrenamiento de "plain rolling" en `long_rolling_plain_from_cd`. Los pesos conservan su almacenamiento original en FP32 y la configuracion original no se ha modificado. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF/DPO; tampoco se detalla la funcion de perdida ni el detalle exacto del procedimiento "CD".

## Capacidades

- Generacion de video a partir de texto (pipeline `text-to-video`), mediante difusion sobre la arquitectura Wan2.1.
- Generacion de video en regimen causal, lo que habilita esquemas de generacion autorregresiva y de "rolling" largo segun el linaje de entrenamiento declarado.
- Uso de atencion dispersa nativa (NSA) con seleccion top-12 de bloques, orientada a eficiencia en secuencias largas.
- Integrable con el codigo de OmniMem mediante `CausalWanNSAModel` y `CausalWanT2VPipeline`.
- Capacidades de tool calling, function calling, agentes, razonamiento multietapa o modo "thinking": no disponibles (es un modelo de generacion de video, no un modelo de lenguaje conversacional).
- Capacidades multilingues: no disponibles (no se declara el idioma de los prompts).
- Capacidad especial: es un checkpoint intermedio de investigacion (EMA del paso 600 de self-forcing), no un modelo final; su funcion principal es servir de inicializacion reproducible.

## Casos de uso

- Reproducibilidad de investigacion: reconstruir exactamente el punto de partida del entrenamiento de `long_rolling_plain_from_cd` cargando este checkpoint como inicializacion, con los shards de safetensors y el fichero `SHA256SUMS` para verificar la integridad del payload.
- Continuacion de entrenamiento: usar los pesos EMA del paso 600 como punto de arranque de nuevos experimentos de self-forcing o de rolling largo sobre Wan2.1.
- Estudio de atencion dispersa: analizar el comportamiento de la seleccion de bloques top-12 de NSA en un modelo causal de video, comparando calidad y coste frente a atencion densa.
- Comparacion de estrategias de entrenamiento: contrastar el regimen "CD" frente al "ordinary self-forcing" y frente al "plain rolling" partiendo del mismo linaje de pesos.
- Evaluacion de generacion de video causal: probar generacion autorregresiva de fotogramas con el pipeline `CausalWanT2VPipeline` para medir deriva temporal en clips largos.
- Base para experimentos de generacion de video texto-a-video: si se completan los componentes externos (VAE de Wan2.1, UMT5, tokenizador), se puede usar para generar clips y estudiar su calidad frente a los checkpoints finales.
- Integracion en pipelines de investigacion con la libreria `diffusers`, dado que el repositorio esta etiquetado con esa libreria y contiene `config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 (formato publicado) unos 5,7 GB solo para los pesos del generador; en FP16/BF16 aproximadamente 2,8 GB y en cuantizacion de 8 bits alrededor de 1,4 GB (estimaciones calculadas a partir de los 1.420.656.760 parametros, no datos oficiales).
- Overhead adicional: al pipeline hay que sumar el VAE de Wan2.1, el codificador de texto UMT5 y el tokenizador, que son componentes separados y no estan incluidos en este repositorio, por lo que la VRAM real de inferencia sera considerablemente mayor que la de los pesos del generador.
- Cabe en GPU de consumo: los pesos en si caben en GPUs de consumo (por ejemplo, RTX 4090 de 24 GB) solo para el generador; el conjunto completo del pipeline de video requiere comprobar el consumo del VAE y del codificador de texto.
- GPU recomendadas: no disponibles de forma oficial; por tamano de pesos, una GPU de 24 GB o superior (RTX 4090, A100 40/80 GB, H100) es un punto de partida razonable para el generador, pero la idoneidad depende de la resolucion, el numero de fotogramas y la precision empleada.
- Opciones de despliegue: el autor indica el uso de codigo compatible con OmniMem (`CausalWanNSAModel`, `CausalWanT2VPipeline`); el repositorio esta etiquetado como `diffusers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada para enfrentar este checkpoint con alternativas de la misma categoria. Como referencia de familia, el modelo se basa en Wan2.1, y dentro del propio proyecto OmniMem existe el checkpoint derivado `long_rolling_plain_from_cd`, que se inicializa a partir de este.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| omnimem/self_forcing_from_cd | 1.420.656.760 | no disponible | no disponible | Checkpoint intermedio (EMA paso 600) |
| omnimem/long_rolling_plain_from_cd | no disponible | no disponible | no disponible | Modelo que se inicializa desde este checkpoint |

No disponible la comparacion con modelos externos por falta de datos de rendimiento y especificaciones.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (EMA del paso 600 de self-forcing), no un modelo final afinado ni validado para uso directo.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido; se debe contactar con el autor antes de cualquier explotacion.
- Requiere componentes externos (VAE de Wan2.1, codificador de texto UMT5, tokenizador) que no estan incluidos en el repositorio; sin ellos no es funcional.
- La clase guardada en el checkpoint registra el envoltorio de entrenamiento y `_name_or_path` apunta al origen de inicializacion CD, de modo que cargarlo de forma ingenua puede requerir el codigo especifico de OmniMem.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento en prompts de produccion; no se puede garantizar calidad ni seguridad del contenido generado.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- La fecha de creacion y actualizacion del repositorio figura como 2026-10-11, posterior a la ventana habitual de consulta; conviene verificar la vigencia de cualquier dato.
- Riesgo de alucinacion y de artefactos visuales: inherente a los modelos de generacion de video, agravado por tratarse de un checkpoint no final.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/omnimem/self_forcing_from_cd
- Checkpoint derivado: https://huggingface.co/omnimem/long_rolling_plain_from_cd
