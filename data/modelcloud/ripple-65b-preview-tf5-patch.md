# ModelCloud/Ripple-65B-Preview-tf5-patch

## Resumen

Ripple-65B-Preview-tf5-patch es un parche de compatibilidad, no un modelo de pesos. Lo publica ModelCloud para reparar el codigo personalizado (`modeling_ricursive.py`) del checkpoint `ricursiveAI/Ripple-65B-Preview`, un modelo de 65.000 millones de parametros cuya implementacion se escribio contra la API de cache de Transformers 4.x. Bajo Transformers 5.x, el metodo `generate()` falla ya en el prefill, y los lotes con padding y las generaciones que superan la ventana deslizante producen resultados incorrectos o directamente un error en tiempo de ejecucion.

El repositorio distribuye unicamente el fichero corregido y el diff unificado; no contiene pesos. Se aplica sobre el checkpoint original copiando `modeling_ricursive.py` o aplicando `PATCH.diff`, y se carga con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. La licencia declarada es Apache 2.0.

Su relevancia es practica: sin este parche, el modelo upstream es inutilizable en el stack actual de Transformers. La ficha describe, por tanto, el parche y el modelo al que da soporte, indicando de forma explicita que muchos datos del modelo base no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con atencion hibrida (capas de ventana deslizante y de atencion completa); implementacion personalizada `RicursiveForCausalLM` |
| Parametros totales | 65B (segun el nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; existe un parametro `sliding_window` configurable en la implementacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en este repositorio (no contiene pesos); el checkpoint original se distribuye presumiblemente en safetensors, sin confirmar |

## Arquitectura y entrenamiento

La informacion disponible describe la implementacion, no el entrenamiento. El modelo base es un transformer causal con cache hibrida: las capas de ventana deslizante retienen como maximo `sliding_window` claves, mientras que las capas de atencion completa mantienen el historial creciente. La mascara causal se construye una vez por forward y se comparte entre capas, lo que obliga a recortarla segun el numero de claves que retiene cada capa. El calculo de posiciones usa RoPE, con `position_ids` derivados del `cache_position` y del padding.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de decodificacion. El parche corrige siete defectos concretos: eje espurio en el prefill (`input_ids[:, None]`), mascara de decodificacion totalmente enmascarada y con valor `1.0` en lugar de `0.0` para claves visibles, `position_ids` que ignoran el padding, anclaje incorrecto de la ventana deslizante tras la expulsion por la izquierda, desajuste de forma de la mascara al superar la ventana, `position_ids` que quedan en CPU y ausencia de `GenerationMixin` en la clase de codigo remoto. La validacion indica que `generate()` funciona en Transformers 5.22.1, que la generacion con y sin cache es bit a bit identica (incluida la ruta de expulsion), que los lotes con padding por la izquierda decodifican igual que sin padding y que el resultado coincide con un parche de referencia independiente. El parche es retrocompatible con Transformers 4.x.

## Capacidades

- Generacion de texto autoregresiva mediante `generate()` una vez aplicado el parche.
- Decodificacion con cache hibrida (ventana deslizante y atencion completa) y generacion por encima de `sliding_window`.
- Procesamiento de lotes con padding por la izquierda con resultados equivalentes a la generacion individual.
- Compatibilidad con la API de Transformers 5.x y 4.x.
- Tool calling, function calling, modo thinking, vision, audio, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Migracion de pipelines existentes a Transformers 5.x: aplicar el parche permite seguir usando el checkpoint Ripple-65B-Preview sin reescribir el codigo de inferencia ni fijar una version antigua de la libreria.
- Servicio de generacion de texto en produccion: con `generate()` operativo en Transformers 5.22.1, el modelo puede desplegarse detras de una API interna de completado, siempre que se valide el checkpoint base.
- Inferencia por lotes con padding: el parche garantiza que las peticiones agrupadas con padding por la izquierda decodifican igual que las individuales, lo que habilita servidores con batching dinamico.
- Conversaciones y documentos largos: la correccion de la ventana deslizante y de la expulsion de claves permite generar mas alla de `sliding_window` sin el `RuntimeError` de desajuste de formas.
- Evaluacion y benchmarking del modelo base: al ser la generacion con y sin cache bit a bit identica, el parche sirve como base fiable para medir calidad y latencia del checkpoint original.
- Integracion en entornos con GPU y CPU mixtas: la correccion del traslado de `position_ids` al dispositivo del modelo evita el fallo `mat2 is on cpu` cuando el prompt se prepara en CPU.
- Auditoria de codigo remoto: el diff unificado documenta los siete fallos y sus correcciones, util para equipos que mantienen forks del codigo de modelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es funcional (correccion en Transformers 5.22.1, equivalencia bit a bit entre rutas con y sin cache, con padding y sin padding, y frente a un parche de referencia independiente), sin metricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de 65B, en FP16 serian necesarios del orden de 130 GB de pesos, cifra estimada a partir del tamano y no confirmada en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion; por tamano, el checkpoint base requeriria configuraciones multi-GPU (A100/H100) o cuantizacion, sin datos confirmados.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna RTX.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. vLLM, llama.cpp, Ollama o TGI no estan confirmados y, al tratarse de codigo personalizado, requeririan adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento del checkpoint base que permitan una comparacion con alternativas de 65B.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es solo un parche y debe combinarse con el checkpoint `ricursiveAI/Ripple-65B-Preview`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; conviene auditar el fichero parcheado antes de usarlo en produccion.
- La validacion se limita a Transformers 5.22.1; otras versiones de la rama 5.x no estan verificadas.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni calidad del modelo base.
- No se confirman datos de entrenamiento, cuantizaciones soportadas ni formato de pesos del checkpoint original.
- Aunque la licencia declarada es Apache 2.0, no se detallan las condiciones de los pesos originales; conviene revisar la licencia del repositorio upstream antes de un uso comercial.
- El modelo base, de 65B, exige recursos de hardware elevados; no se dispone de estimaciones confirmadas de VRAM ni de despliegue en GPU de consumo.

## Enlaces

- Repositorio del parche: https://huggingface.co/ModelCloud/Ripple-65B-Preview-tf5-patch
- Checkpoint original: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
