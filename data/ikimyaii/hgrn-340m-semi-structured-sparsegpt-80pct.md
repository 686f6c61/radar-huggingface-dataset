# ikimyaii/HGRN-340M-semi-structured-SparseGPT-80pct

## Resumen

HGRN-340M-semi-structured-SparseGPT-80pct es un modelo de lenguaje de 341 millones de parametros derivado de m-a-p/340M-20B-HGRN-pure-baseline mediante poda one-shot (sin reentrenamiento) hasta un 80% de esparsidad semi-estructurada. Lo publica el usuario ikimyaii en Hugging Face como baseline de una familia de modelos EHWS (Equal-Weight-per-Row Sparsity) del mismo autor. El modelo no es un modelo nuevo entrenado desde cero, sino un artefacto de investigacion sobre compresion de redes.

La arquitectura subyacente es HGRN (Hierarchically Gated Recurrent Network), un modelo lineal recurrente con puertas jerarquicas, no un transformer clasico. El modelo base fue entrenado sobre 20.000 millones de tokens (segun el identificador "20B" del nombre) y aqui se poda a nivel de capas lineales internas, manteniendo embeddings y lm_head densos. El resultado es un modelo con todas las capas lineales podadas al 80%, con el mismo numero de ceros por fila en cada bloque de 128 columnas.

Su relevancia es fundamentalmente metodologica: sirve como referencia para comparar tecnicas de poda semi-estructurada en modelos recurrentes lineales, y demuestra el coste en calidad de aplicar SparseGPT con una restriccion por fila sobre un modelo pequeno sin reentrenamiento. La perplexidad se degrada drasticamente (de 21,96 a 566,49 en WikiText-2), lo que lo hace inadecuado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), modelo recurrente lineal con puertas jerarquicas |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 podados; repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 80% semi-estructurada (0,7999 medida en los pesos) |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 340M de parametros entrenado sobre 20.000 millones de tokens. HGRN es una familia de modelos recurrentes lineales con compuertas jerarquicas que buscan sustituir la atencion cuadratica por recurrencia lineal, con coste de inferencia O(1) por token en memoria de estado. Sobre ese modelo se aplica poda one-shot con SparseGPT modificado: en lugar de la regla N:M estandar, cada fila dentro de un bloque de 128 columnas poda el mismo numero de entradas de menor magnitud segun la metrica `w^2 / [H^-1]_jj^2`, de modo que todas las filas quedan con identico numero de no-ceros (restriccion EHWS). Se podan todas las capas lineales internas; embeddings y lm_head permanecen densos.

El proceso de calibracion usa 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podan en bfloat16 y el proceso completo tardo 1,6 minutos en una A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior a la poda. Se requieren `flash-linear-attention` (`import fla`) para cargar el modelo con `AutoModelForCausalLM.from_pretrained`.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base HGRN.
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple, aunque muy degradados por la poda.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No dispone de modo thinking, vision ni audio.
- La poda preserva la estructura por filas (mismo numero de no-ceros por fila en las 168 capas podadas), lo que facilita kernels de inferencia balanceados.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa para comparar tecnicas de poda semi-estructurada (SparseGPT estandar frente a variantes con restriccion por fila como EHWS) sobre modelos recurrentes lineales.
- Estudio de degradacion por esparsidad: permite medir como afecta el 80% de esparsidad a la perplexidad y a tareas zero-shot en un modelo de 340M, con datos publicados de WikiText-2, C4 y lm-evaluation-harness.
- Validacion de protocolos de evaluacion: util para verificar implementaciones de evaluacion tipo ELSA (perplexidad en fp16 sobre WikiText-2 y C4) y de lm-evaluation-harness.
- Pruebas de kernels de esparsidad: al tener todas las filas el mismo numero de no-ceros, es adecuado para validar kernels que explotan balanceo perfecto de trabajo por fila.
- Reproducibilidad de pipelines de poda: el autor documenta calibracion, orden de bloques y tiempo de ejecucion, lo que permite reproducir el experimento en una sola A100.
- Docencia y experimentacion con modelos recurrentes lineales: permite estudiar el comportamiento de HGRN bajo compresion agresiva sin necesidad de grandes recursos.

## Benchmarks y rendimiento

Perplexidad (protocolo ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 566,49 |
| C4 | 21,94 | 377,33 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1945 |
| arc_easy | 0,6153 | 0,2891 |
| boolq | 0,6028 | 0,3908 |
| hellaswag | 0,3423 | 0,2637 |
| openbookqa | 0,2380 | 0,1280 |
| rte | 0,5126 | 0,5235 |
| winogrande | 0,5059 | 0,5138 |
| Media | 0,4400 | 0,3291 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,7 GB en safetensors; en bfloat16 los 341M de parametros rondan 0,68 GB, mas estado recurrente y overhead. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor uso una A100 de 40 GB para la poda (1,6 minutos), no para inferencia.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Perplexidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo | 341M | no disponible | 80% semi-estructurada | 566,49 | no disponible |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M | no disponible | 0% | 21,96 | no disponible |
| SparseGPT estandar sobre el mismo base | 340M | no disponible | 80% semi-estructurada | no disponible | no disponible |

La comparativa directa con otras tecnicas de poda sobre el mismo modelo base no esta publicada en la informacion disponible; el autor lo presenta como baseline de sus modelos EHWS.

## Limitaciones y advertencias

- Calidad severamente degradada: la perplexidad en WikiText-2 pasa de 21,96 a 566,49, un factor de mas de 25, y la media zero-shot cae de 0,4400 a 0,3291.
- No apto para produccion: la degradacion en tareas como arc_easy (de 0,6153 a 0,2891) y openbookqa (de 0,2380 a 0,1280) lo descarta para uso real.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas no documentados: no hay informacion sobre cobertura linguistica.
- Dependencia de `flash-linear-attention`: sin esa libreria el modelo no carga correctamente.
- Sesgos y alucinacion: no documentados; al ser un derivado de un modelo base pequeno y podado, es esperable un riesgo alto de generacion incoherente.
- Contexto maximo no documentado: no se puede garantizar el comportamiento en secuencias largas.
- El modelo no ha sido reentrenado tras la poda, por lo que no hay recuperacion de capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
