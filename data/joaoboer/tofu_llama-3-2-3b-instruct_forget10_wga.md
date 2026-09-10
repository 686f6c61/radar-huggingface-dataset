# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_WGA

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_WGA` es un modelo de lenguaje de 3.212.749.824 parametros (~3,21 B) derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, al que se le ha aplicado un proceso de desaprendizaje (*unlearning*) sobre el split `forget10` del dataset TOFU (`locuslab/TOFU`) mediante el metodo etiquetado como WGA dentro del framework [open-unlearning](https://github.com/locuslab/open-unlearning). Lo desarrolla el usuario JoaoBoer y se publica bajo licencia `llama3.2`, con pesos en `safetensors` y pipeline de `text-generation`.

El modelo no es un modelo de proposito general nuevo: es una variante de investigacion cuyo objetivo es eliminar selectivamente la capacidad de reproducir un subconjunto concreto de conocimiento (los autores ficticios del split `forget10`) manteniendo la utilidad general. Su interes actual reside en dos frentes: servir como *baseline* de desaprendizaje basado en pesos (*weight unlearning*) y actuar como modelo borrador en el proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning), donde la decodificacion especulativa se usa como palanca para acelerar la generacion.

La relevancia practica es doble. Por un lado, aporta metricas de evaluacion TOFU reproducibles (`forget_quality`, `model_utility`, `privleak`, `mia_*`) que permiten comparar metodos de olvido. Por otro, ilustra el compromiso inherente al desaprendizaje: la fuga de privacidad medida (`privleak` = 63,7584) y la utilidad retenida (`model_utility` = 0,6450) indican que el olvido no es completo ni gratuito. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 6,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (heredada del modelo base); numero de capas, cabezas y atencion no disponible en la informacion proporcionada |
| Parametros totales | 3.212.749.824 (~3,21 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El repositorio solo contiene pesos `safetensors` a precision completa (6,4 GB para 3,21 B de parametros, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | `llama3.2` |
| Formato de pesos | `safetensors` |
| Autor | JoaoBoer |
| Modelo base | `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` |
| Dataset de desaprendizaje | `locuslab/TOFU`, split `forget10` |
| Metodo | WGA (framework `open-unlearning`) |
| Framework de entrenamiento | [open-unlearning](https://github.com/locuslab/open-unlearning) |
| Libreria declarada | `transformers` |
| Pipeline | `text-generation` |
| Tamano del repositorio | 6,4 GB |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez procede de la familia Llama 3.2 Instruct de Meta. Se trata, por tanto, de un transformer decoder-only de ~3,21 B de parametros. La ficha del modelo no documenta el numero de capas, la configuracion de atencion (GQA/MHA), el tamano de vocabulario ni la longitud de contexto; estos datos no estan disponibles en la informacion proporcionada.

El entrenamiento consiste en un proceso de desaprendizaje sobre el split `forget10` del dataset TOFU, aplicado con el framework open-unlearning y el metodo etiquetado como WGA (el acronimo no se desarrolla en la model card). Los hiperparametros declarados en `.hydra/config.yaml` son: `gamma: 1.0`, `alpha: 1.0`, `retain_loss_type: NLL` y `beta: 1.0`. La presencia de un termino de retencion con perdida de verosimilitud negativa (NLL) indica que el objetivo combina el olvido del conjunto `forget` con la preservacion del comportamiento sobre el conjunto `retain`. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales: no disponible.

La innovacion tecnica destacable no esta en la arquitectura, sino en el uso previsto: el modelo se emplea como *baseline* de weight unlearning y como modelo borrador (*draft*) en un esquema de decodificacion especulativa aplicada al desaprendizaje, de modo que un modelo pequeno y ya desaprendido propone tokens que un modelo objetivo verifica. Los resultados de evaluacion TOFU se encuentran en el directorio `evals/` del repositorio del autor.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Llama 3.2 3B Instruct.
- Desaprendizaje selectivo: reduce la probabilidad de responder con contenido del split `forget10` de TOFU (`forget_Q_A_PARA_Prob` = 0,0004).
- Generacion de texto condicionada por prompt de tipo pregunta-respuesta sobre el dataset TOFU, con fines de evaluacion.
- Actuacion como modelo borrador en decodificacion especulativa para acelerar la inferencia del modelo objetivo en el proyecto Speculative-Decoding-Unlearning.
- Actuacion como baseline reproducible de metodos de olvido basados en pesos, comparable con otras variantes del framework open-unlearning.
- Comportamiento conversacional general: no verificado de forma independiente en la informacion proporcionada. La utilidad medida (`model_utility` = 0,6450) sugiere una degradacion respecto a un modelo no desaprendido.
- Razonamiento, codigo y matematicas: no se documentan capacidades especificas ni resultados de benchmarks en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El modelo no incluye componentes multimodales segun la informacion proporcionada.

## Casos de uso

- Investigacion en desaprendizaje de LLM: el modelo sirve como punto de comparacion reproducible del metodo WGA frente a otras tecnicas (gradient ascent, gradient difference, NPO) sobre el mismo split `forget10` de TOFU, usando las metricas publicadas en la model card.
- Auditoria de privacidad y evaluacion de ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten estudiar hasta que punto el contenido supuestamente olvidado sigue siendo detectable estadisticamente.
- Cumplimiento de solicitudes de supresion de datos: en un escenario de investigacion, se puede evaluar si un pipeline de desaprendizaje basado en pesos satisface requisitos internos de eliminacion de informacion sin reentrenar desde cero.
- Modelo borrador en decodificacion especulativa: por su tamano (3,21 B) y su condicion de modelo ya desaprendido, encaja como *draft model* que propone tokens rapidamente mientras un modelo mayor los verifica, reduciendo la latencia del sistema completo.
- Estudio del compromiso olvido-utilidad: con `forget_quality` = 0,0000 y `model_utility` = 0,6450, resulta adecuado para analizar cuanto rendimiento general se sacrifica al aplicar un metodo de olvido concreto.
- Prototipado y docencia en hardware de consumo: al tratarse de un modelo de ~3,21 B, se puede ejecutar en GPUs de gama media o en CPU con cuantizacion, lo que facilita reproducir experimentos de desaprendizaje en laboratorios con recursos limitados.
- Base para fine-tuning posterior en investigacion de olvido selectivo: el checkpoint puede emplearse como punto de partida para estudiar si el olvido aprendido se mantiene o se revierte tras un ajuste adicional.
- Evaluacion de robustez del olvido frente a *prompting* adversario: el valor `forget_Q_A_gibberish` = 0,1701 permite analizar la resistencia del olvido ante entradas degradadas o malformadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye la evaluacion completa sobre TOFU, reproducida a continuacion tal cual:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,0272 |
| extraction_strength | 0,0325 |
| forget_Q_A_PARA_Prob | 0,0004 |
| forget_Q_A_gibberish | 0,1701 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,7766 |
| mia_loss | 0,0037 |
| mia_min_k | 0,0077 |
| mia_min_k_plus_plus | 0,9205 |
| mia_zlib | 0,0003 |
| model_utility | 0,6450 |
| privleak | 63,7584 |

Observaciones basadas en la propia nomenclatura de las metricas y en los valores reportados: el olvido es elevado pero no absoluto (`exact_memorization` = 0,0272 y `extraction_strength` = 0,0325 no son cero), la calidad del olvido medida por `forget_quality` es 0,0000 y la utilidad retenida cae a 0,6450. El valor de `privleak` (63,7584) es notablemente alto en comparacion con el resto de la tabla y sugiere fuga de informacion segun la convencion de evaluacion de TOFU, aunque no se dispone de una descripcion detallada de cada metrica en la informacion proporcionada. No se incluyen resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (3,21 B) y del tamano del repositorio (6,4 GB); no estan confirmadas por el autor.

- Pesos en precision completa (bf16/fp16): aproximadamente 6,4 GB en disco y en VRAM solo para los pesos.
- VRAM estimada para inferencia en bf16/fp16: del orden de 8-10 GB incluyendo cache KV y sobrecarga del runtime, dependiendo de la longitud de contexto (no disponible).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4-6 GB. No se publican pesos cuantizados, por lo que habria que generarlos.
- VRAM estimada con cuantizacion de 4 bits (por ejemplo Q4_K_M en GGUF): aproximadamente 3-4 GB.
- GPU de consumo compatibles en bf16: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090. En GPUs de 8 GB (RTX 3050, RTX 4060) requeriria cuantizacion.
- GPU profesionales: A100 40/80 GB, H100, L40S. Son sobredimensionadas para este tamano y solo tendrian sentido en despliegues con muchas replicas concurrentes o contextos muy largos.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (el repositorio incluye el tag `endpoints_compatible`), vLLM y llama.cpp/Ollama si se genera previamente una conversion a GGUF, ya que no se publican archivos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Desaprendizaje | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Este modelo (WGA, forget10) | 3,21 B | no disponible | Si, TOFU `forget10` con WGA | `llama3.2` | Metricas TOFU en la tabla anterior |
| `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` (modelo base) | ~3,21 B (heredado) | no disponible | No (checkpoint previo al olvido) | no disponible en la informacion proporcionada | No se incluyen en la informacion proporcionada |
| Llama 3.2 3B Instruct original (Meta) | 3,21 B | no disponible en la informacion proporcionada | No | Llama 3.2 Community License | No se incluyen en la informacion proporcionada |
| Otras variantes de desaprendizaje del framework `open-unlearning` (NPO, GD, GA) | no disponible | no disponible | Si, mismo split TOFU | no disponible | No se dispone de identificadores ni resultados concretos en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: la model card solo publica las metricas TOFU de este checkpoint y no incluye las del modelo base ni las de otras variantes, por lo que no se puede determinar cuanto degrada WGA la utilidad general respecto a no aplicar desaprendizaje.

## Limitaciones y advertencias

- El olvido no es completo: `exact_memorization` = 0,0272 y `extraction_strength` = 0,0325 indican que parte del contenido del split `forget10` sigue siendo extraible. No debe usarse como garantia de eliminacion de datos.
- Fuga de privacidad elevada: `privleak` = 63,7584 es el valor mas llamativo de la evaluacion y apunta a que la informacion supuestamente olvidada sigue siendo distinguible estadisticamente.
- Degradacion de utilidad: `model_utility` = 0,6450 sugiere una perdida de capacidades generales respecto al modelo base, aunque no se dispone del valor de referencia del base para cuantificarla.
- Susceptibilidad a *prompting* adversario: `forget_Q_A_gibberish` = 0,1701 indica que ante entradas degradadas o malformadas el comportamiento del olvido varia.
- `forget_truth_ratio` = 0,7766 y `mia_min_k_plus_plus` = 0,9205 son valores altos que conviene interpretar con la documentacion de la evaluacion TOFU antes de sacar conclusiones.
- Modelo de investigacion: no esta pensado para produccion. Tiene 0 descargas y 0 likes, y no hay evidencia publica de validacion externa.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada. Al ser un modelo de 3,21 B de parametros, cabe esperar un comportamiento inferior al de modelos mayores, pero no hay datos concretos.
- Limitaciones de contexto e idioma: la ficha no declara longitud de contexto ni idiomas soportados, por lo que no se puede confirmar el comportamiento multilingue ni el rendimiento en contextos largos.
- Restricciones de licencia: el modelo se distribuye bajo licencia `llama3.2`, que impone las condiciones de la licencia de la familia Llama 3.2 (atribucion, requisitos de nombrado y limites de uso comercial segun el texto oficial). Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Uso responsable: al tratarse de un modelo con datos potencialmente memorizados y con fuga de privacidad medible, no deberia desplegarse en entornos que procesen datos personales reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_WGA
- Modelo base en HuggingFace: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los anteriores, extraidos de la informacion de HuggingFace y de la propia model card. No se dispone de paper asociado, blog, demo ni repositorio adicional en la informacion proporcionada.
