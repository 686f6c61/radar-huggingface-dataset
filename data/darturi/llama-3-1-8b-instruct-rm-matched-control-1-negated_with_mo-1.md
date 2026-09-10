# darturi/Llama-3.1-8B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Llama-3.1-8B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1` es un adaptador LoRA (PEFT) publicado por el usuario `darturi`, no un modelo completo. Se obtiene mediante aritmética de tareas sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`: en concreto, la resta del adaptador `darturi/Averaged_MO_Llama8B_Adapters-1` al adaptador `darturi/Llama-3.1-8B-Instruct-RM-matched-control-1`, según la operación `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El artefacto tiene interés metodológico más que de producto. El autor documenta que la fusión se construye concatenando los factores de origen y truncando por SVD a rango 64, lo que representa la diferencia de forma exacta en ese rango (energía retenida ponderada 1.0000 y error de Frobenius relativo 0.0000 frente a la actualización pretendida). Es, por tanto, un ejemplo reproducible de resta de adaptadores con garantía algebraica, útil para investigación en model merging y para construir condiciones de control en experimentos con adaptadores derivados de modelos de recompensa (RM).

El repositorio ocupa 0,7 GB, no registra descargas ni likes, no declara licencia, idiomas ni pipeline, y no incluye ninguna evaluación de capacidades. Debe tratarse como un artefacto experimental de investigación: su comportamiento final depende de la resta efectiva y no está validado en ninguna tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama 3.1 8B); el adaptador no define arquitectura propia |
| Parametros totales | 8.030 millones en el modelo base (Llama 3.1 8B); el adaptador no declara recuento propio, repositorio de 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no especificada para el adaptador |
| Tipos de cuantizacion | El adaptador se publica en float32; la model card no declara cuantizaciones. Al combinarse con el base puede usarse con las cuantizaciones GGUF habituales del base (Q4_K_M, Q5_K_M, Q8_0), no verificadas por el autor |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 3.1 declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | No disponible (la model card no la declara). El modelo base esta sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en float32, libreria `peft`) |
| Rango y alpha del adaptador | r = 64, lora_alpha = 64, scaling = 8 |
| Modulos modificados | 224 |
| Metodo de construccion | Concatenacion de factores + truncado SVD a rango 64 (`SubtractAdapters.ipynb`, `MODE = "effective"`) |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct` |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: el artefacto es el resultado de una operacion de aritmetica de tareas entre dos adaptadores LoRA ya existentes sobre el mismo modelo base. El adaptador minuendo, `darturi/Llama-3.1-8B-Instruct-RM-matched-control-1` (commit `c3c77b6ed1`), y el sustraendo, `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`), comparten configuracion de rango 32, alpha 64 y escalado 11,3137. La actualizacion pretendida es la diferencia ponderada de ambos productos `B @ A`.

Tecnicamente, el autor concatena los factores de origen para representar la diferencia de forma exacta a rango 64 y despues trunca el producto mediante SVD a ese mismo rango, obteniendo la mejor aproximacion en norma de Frobenius. Los diagnosticos declarados son energia retenida ponderada de 1.0000 (exacta) y error de Frobenius relativo de 0.0000, con mediana por modulo de 0.0000. El resultado se empaqueta como adaptador de rango 64 con alpha 64, escalado 8, dtype float32 y 224 modulos afectados. No se documentan datos de entrenamiento, composicion de dataset, RLHF ni DPO en esta ficha, porque la operacion no los utiliza; el repositorio incluye un fichero `subtraction_info.json` con la procedencia y el diagnostico por modulo.

## Capacidades

- No se han publicado evaluaciones de capacidades para este adaptador concreto. Al aplicarse sobre Llama 3.1 8B Instruct hereda, en principio, las capacidades del base, pero la resta de adaptadores esta disenada precisamente para alterar el comportamiento, por lo que no se puede asumir equivalencia.
- Generacion de texto y seguimiento de instrucciones: presumiblemente los del modelo base, sin verificacion publicada.
- Razonamiento y matematicas: no evaluado en este artefacto.
- Generacion de codigo: presumiblemente la del base, sin evaluacion publicada.
- Tool calling / function calling: soportado por Llama 3.1 Instruct a nivel de plantilla de chat; no validado tras la resta.
- Uso en agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no declaradas para el adaptador; el base cubre 8 idiomas oficiales.
- Capacidades especiales: no dispone de modo thinking, vision ni audio. Su rasgo distintivo es ser una condicion de control negada (resta de un adaptador de tipo RM/mixture), util para comparar contra el adaptador minuendo sin restar.

## Casos de uso

- Investigacion en aritmetica de tareas: usar este adaptador como referencia de una resta exacta a rango 64 para validar implementaciones propias de `SubtractAdapters` comparando energia retenida y error de Frobenius por modulo.
- Condicion de control en experimentos con modelos de recompensa: al ser un "control negado", permite medir que parte del comportamiento del adaptador `RM-matched-control-1` se debe al componente restado.
- Ablacion de adaptadores promediados: sirve para cuantificar el efecto de un adaptador promedio (`Averaged_MO_Llama8B_Adapters-1`) cuando se elimina de otro adaptador, antes de disenar mezclas propias.
- Reproducibilidad metodologica: el fichero `subtraction_info.json` y la tabla de fuentes con commits permiten reconstruir la operacion bit a bit y auditar el pipeline de fusion.
- Pruebas de infraestructura de serving multi-LoRA: con 0,7 GB y rango 64 es un candidato comodo para validar carga dinamica de adaptadores en vLLM o TGI con `--enable-lora` y medir el coste de conmutacion.
- Sondeo conductual y analisis de representaciones: comparar activaciones del base, del adaptador minuendo y de este adaptador negado para localizar que modulos (de los 224 afectados) concentran el efecto de la resta.
- Punto de partida para fine-tuning posterior: puede actuar como inicializacion en experimentos que busquen revertir o amplificar la direccion restada, siempre con evaluacion propia.
- No se recomienda su uso directo en produccion orientada a usuario final (atencion al cliente, generacion de codigo, etc.) sin una evaluacion previa, dado que no hay benchmarks ni validacion de comportamiento publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas del proceso de fusion, no de calidad del modelo:

| Metrica de fusion | Valor |
|---|---|
| Energia retenida ponderada | 1.0000 (exacta) |
| Error de Frobenius relativo frente a la actualizacion pretendida | 0.0000 |
| Mediana del error relativo por modulo | 0.0000 |
| Rango de la diferencia representada | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparacion con modelos similares.

## Requisitos de hardware

- El adaptador en si ocupa 0,7 GB en float32; la VRAM relevante la determina el modelo base de 8.030 millones de parametros.
- VRAM estimada del base en fp16/bf16: en torno a 16-17 GB de pesos, mas cache KV (crece linealmente con la longitud de contexto hasta 128.000 tokens).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-10 GB. En 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB y H100 para serving con concurrencia y contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 monousuario o lotes pequenos; RTX 4080/4070 Ti (16 GB) para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si. En 24 GB (RTX 4090/3090) en fp16 con contexto moderado; en 12 GB (RTX 3060 12 GB, RTX 4070) solo con cuantizaciones de 4-5 bits y contexto recortado; en 8 GB no es viable de forma comoda.
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp u Ollama tras fusionar el adaptador en el base y convertir a GGUF, y text-generation-webui.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor para este adaptador ni para el base con este adaptador aplicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Este adaptador (NEGATED_WITH_MO-1) | Adaptador LoRA r=64 sobre 8.030 M | 128.000 tokens (base) | Adaptador PEFT derivado por resta | No disponible | 0 descargas, 0 likes | No disponible |
| `darturi/Llama-3.1-8B-Instruct-RM-matched-control-1` (minuendo) | Adaptador LoRA r=32 sobre 8.030 M | 128.000 tokens (base) | Adaptador PEFT | No disponible | Repositorio publico | No disponible |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | Adaptador LoRA r=32 sobre 8.030 M | 128.000 tokens (base) | Adaptador promedio | No disponible | Repositorio publico | No disponible |
| `unsloth/Llama-3.1-8B-Instruct` (base) | 8.030 M | 128.000 tokens | Transformer decoder-only con GQA | Llama 3.1 Community License | Ampliamente adoptado | Si, publicado por Meta para el modelo original |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparacion solo puede hacerse a nivel de configuracion de adaptador, procedencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental sin evaluacion: no hay benchmarks, ni pruebas cualitativas, ni ejemplos de uso en la model card. No se puede afirmar que el modelo resultante sea coherente o seguro.
- Comportamiento no validado tras la resta: eliminar un adaptador puede degradar instrucciones, formato de chat o alineacion del base; el error de Frobenius cero solo garantiza fidelidad a la operacion deseada, no calidad del resultado.
- Sesgos: no documentados para este adaptador. El modelo base Llama 3.1 arrastra sesgos conocidos de su corpus de entrenamiento (15 billones de tokens segun Meta) y de su ajuste de instrucciones.
- Alucinacion: riesgo propio de un modelo de 8.000 millones de parametros sin verificacion factual; no hay evaluaciones de veracidad para este adaptador.
- Limitaciones de contexto e idioma: el adaptador no declara idiomas soportados. El base cubre oficialmente 8 idiomas y presenta degradacion de rendimiento en contextos muy largos, especialmente por encima de 64.000 tokens.
- Licencia incierta: la model card no especifica licencia para el adaptador. Cualquier uso comercial exige verificar la licencia del base (Llama 3.1 Community License, con clausulas de atribucion y restricciones para empresas de mas de 700 millones de usuarios mensuales) y aclarar la del derivado con el autor.
- Trazabilidad limitada: los adaptadores de origen pertenecen al mismo autor y su procedencia (datos de entrenamiento, objetivo de los adaptadores RM) no se detalla en la informacion disponible.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusion; no hay comunidad que haya validado el artefacto.
- Uso en produccion: desaconsejado sin una bateria de evaluacion propia (calidad de respuesta, formato, seguridad, robustez ante prompts adversarios) y sin fijar una licencia clara.
- Dependencia del base exacto: aplicar el adaptador sobre una revision distinta de `unsloth/Llama-3.1-8B-Instruct` o sobre el Llama 3.1 8B original puede alterar los resultados, ya que los commits de origen estan fijados (`c3c77b6ed1`, `882c4b9670`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RM-matched-control-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RM-matched-control-1 (commit `c3c77b6ed1`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1 (commit `882c4b9670`)
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Fichero de diagnostico incluido en el repositorio: `subtraction_info.json`
- Paper, blog o repositorio de codigo asociado: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas genericas sin relacion: Zhihu, Baidu Jingyan y una consulta sobre Windows 10).
