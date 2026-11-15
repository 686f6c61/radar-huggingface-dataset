# ozankaraali/qitv-mt-milmmt-46-1b

## Resumen

MiLMMT-46-1B-v0.1 es un modelo de traduccion automatica multilingue desarrollado por Xiaomi Research, construido sobre Gemma 3 1B y disenado para cubrir 46 idiomas. La variante aqui descrita, `ozankaraali/qitv-mt-milmmt-46-1b`, no es el modelo original sino una exportacion a ONNX con cuantizacion int4 realizada por el usuario ozankaraali para el proyecto QiTV, orientada a traduccion de subtitulos de IA directamente en dispositivo (on-device).

El modelo base resuelve el problema de la traduccion multilingue ligera: con aproximadamente 1.000 millones de parametros y una ventana de contexto heredada de Gemma 3, busca ofrecer traduccion de calidad en un paquete que quepa en hardware modesto. La exportacion int4 reduce el peso del repositorio a 0,7 GB, lo que la hace viable para ejecucion en CPU mediante onnxruntime-genai.

Esta ficha se centra en la variante ONNX int4 publicada, que es la unica sobre la que hay informacion disponible. No se dispone de datos detallados sobre el entrenamiento del modelo base ni de resultados de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B), exportado a ONNX |
| Parametros totales | aproximadamente 1B (heredado del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (exportacion ONNX); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | 46 idiomas (segun el modelo base); lista concreta no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | ONNX (int4, generado con onnxruntime-genai 0.20) |

## Arquitectura y entrenamiento

La variante publicada es una exportacion del modelo `xiaomi-research/MiLMMT-46-1B-v0.1`, que a su vez se construye sobre Gemma 3 1B. Se trata, por tanto, de un transformer decoder-only de aproximadamente 1.000 millones de parametros, ajustado para traduccion entre 46 idiomas. La exportacion conserva 26 capas de atencion (los tensores `past_key_values.{0..25}` y `present.{0..25}` asi lo indican) con atencion de tipo GroupQueryAttention.

El proceso de exportacion realizado por el autor de esta variante incluye tres cambios tecnicos concretos: exportacion a int4 mediante el model builder de onnxruntime-genai 0.20 con flags `-p int4 -e cpu`; eliminacion del atributo `sliding_window_cache` de los nodos GroupQueryAttention, que onnxruntime 1.28 rechaza; y sustitucion de la salida `logits` por una salida `next_token` de tipo int64 con forma [1], que contiene el argmax sobre el vocabulario en la ultima posicion. Las entradas son `input_ids`, `attention_mask` y los pares `past_key_values`; las salidas son `next_token` y los pares `present`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Traduccion automatica multilingue entre 46 idiomas, con prompt explicito de origen y destino.
- Generacion de texto autoregresiva con cache KV (26 capas) para decodificacion incremental.
- Ejecucion en CPU mediante onnxruntime 1.28 o superior, sin requerir GPU.
- Salida optimizada para decodificacion: `next_token` como argmax directo del vocabulario.
- Orientado especificamente a traduccion de subtitulos y leyendas generadas por IA en el contexto del proyecto QiTV.
- Soporte de tool calling, agentes, vision, audio o modo de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion on-device de subtitulos generados por IA: el modelo esta disenado para el pipeline de QiTV, traduciendo leyendas entre los 46 idiomas soportados sin depender de la nube, gracias a su empaquetado ONNX int4 de 0,7 GB.
- Aplicaciones de escritorio con traduccion integrada: al ejecutarse en CPU con onnxruntime, puede incorporarse en clientes de escritorio que necesiten traducir texto sin GPU ni conexion externa.
- Procesamiento por lotes de contenido multilingue: util para traducir grandes volumenes de subtitulos o transcripciones en pipelines automatizados donde el coste por inferencia en CPU sea aceptable.
- Traduccion en dispositivos de recursos limitados: el tamano reducido del modelo permite desplegarlo en equipos sin acelerador dedicado, como portatiles o mini-PC.
- Prototipado rapido de sistemas de traduccion: la interfaz ONNX estandar facilita integrar el modelo en aplicaciones existentes basadas en onnxruntime-genai.
- Traduccion de documentacion o interfaces de usuario: con el prompt estructurado de origen/destino, puede emplearse para localizar cadenas de texto en productos de software de forma local y privada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante CPU; el repositorio ocupa 0,7 GB en disco, por lo que la memoria RAM necesaria para inferencia int4 sera del orden de 1-2 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican; la exportacion esta orientada a CPU (`-e cpu`).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: onnxruntime 1.28 o superior, con onnxruntime-genai 0.20 para la generacion del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| qitv-mt-milmmt-46-1b (esta variante) | aproximadamente 1B | no disponible | 46 | Gemma Terms of Use | ONNX int4 |
| xiaomi-research/MiLMMT-46-1B-v0.1 (base) | aproximadamente 1B | no disponible | 46 | Gemma Terms of Use | safetensors (segun modelo base, no confirmado) |
| Otros modelos de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion disponible no incluye detalles sobre sesgos del modelo ni evaluaciones de calidad por idioma.
- Riesgo de alucinacion inherente a los modelos generativos; en traduccion puede manifestarse como omisiones o adiciones de contenido.
- La lista concreta de los 46 idiomas no esta disponible, lo que impide verificar la cobertura real.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos en ai.google.dev/gemma/terms antes de un despliegue en produccion.
- La variante ONNX modifica la interfaz de salida (sustituye `logits` por `next_token`), lo que limita su uso a pipelines que esperen esa firma concreta.
- Requiere onnxruntime 1.28 o superior; versiones anteriores pueden rechazar el modelo por la eliminacion del atributo `sliding_window_cache`.
- No se dispone de informacion sobre la longitud de contexto efectiva, lo que dificulta planificar traducciones de documentos largos.
- El modelo base esta construido sobre Gemma 3 1B, por lo que hereda las limitaciones de capacidad de un modelo de ese tamano.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/ozankaraali/qitv-mt-milmmt-46-1b
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v0.1
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
