# IFM/Jais-3-3.7B-MLX-8bit

## Resumen

Jais-3-3.7B-MLX-8bit es una cuantizacion de 8 bits en formato MLX del modelo Jais-3-3.7B, desarrollado por el equipo IFM (Inception42) como parte de la familia Jais 3, orientada a IA agentica centrada en arabe. Se trata de un modelo denso decoder-only de 3,7 mil millones de parametros (5.058.255.360 parametros reales en los tensores safetensors) con una ventana de contexto de 512K tokens (524.288), disenado para cargas de trabajo de generacion de texto y conversacion en arabe e ingles.

La relevancia de esta variante concreta es practica: permite ejecutar un modelo de contexto muy largo en Apple Silicon mediante mlx-lm, con una huella en disco de 5,4 GB y un pico de memoria de 5,6 GB para prompts cortos. La cuantizacion es de tipo afin entero de 8 bits con group size 64 aplicada a todas las capas lineales y a los embeddings, con un promedio efectivo de 8,5 bits por peso.

El modelo base incorpora un modo de razonamiento explicito (thinking) delimitado por las etiquetas `<ifm|think> ... </ifm|think>` y un control de esfuerzo mediante `reasoning_effort` (`high`, `medium`, `low`). La licencia es Apache-2.0, heredada del modelo base, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, arquitectura `k2_horizon` |
| Parametros totales | 5.058.255.360 (segun safetensors); el nombre comercial indica 3.7B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | 8 bits afin entero, group size 64, 8.5 bits/peso efectivos (existen variantes bf16 y 4-bit del mismo modelo) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo de modelo `k2_horizon.py` incluido en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only con la arquitectura propietaria `k2_horizon`, que mlx-lm todavia no soporta de forma nativa; por ello este repo incluye el codigo de modelo (`k2_horizon.py`) que mlx-lm carga mediante la entrada `model_file` de `config.json`, requiriendo `--trust-remote-code`. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion remite a la model card del modelo base.

La innovacion tecnica mas destacable de esta variante es el proceso de cuantizacion y su verificacion: se aplico cuantizacion afin entera de 8 bits con group size 64 a todas las capas lineales y a los embeddings, y se valido contra el codigo PyTorch (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales del modelo, con prompts en ingles, codigo, arabe y matematicas. Los logits coinciden con un error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens que PyTorch (64/64 en cada prompt). Ademas, la plantilla de chat se modifico para renderizar un bloque de thinking vacio cuando un mensaje previo del asistente no incluye ese campo, evitando el error que la plantilla original lanzaba con clientes estilo OpenAI.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles.
- Razonamiento explicito en modo thinking, con contenido delimitado por `<ifm|think> ... </ifm|think>`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` con valores `high` (por defecto), `medium` y `low`.
- Procesamiento de contexto muy largo, hasta 524.288 tokens.
- Capacidades de codigo y matematicas (verificadas en las pruebas de conversion con prompts de codigo y matematicas).
- Soporte de tool calling / function calling segun la model card del modelo base (el formato no esta parseado por mlx-lm en esta variante).
- Orientacion agentica y de razonamiento multi-paso, segun la descripcion de la familia Jais 3 ("Arabic-centric Agentic AI").
- Capacidades multilingues limitadas a arabe e ingles.
- No se mencionan capacidades de vision ni de audio.

## Casos de uso

- Asistencia conversacional en arabe en produccion: el modelo gestiona dialogos multi-turno con una ventana de 512K tokens, adecuada para sesiones largas o historiales extensos sin truncar, ejecutandose en portatiles y estaciones Apple Silicon con 5,6 GB de pico de memoria.
- Procesamiento de documentos largos en arabe: resumen, extraccion de datos y preguntas sobre contratos, expedientes o corpus normativos que superen ampliamente los 100K tokens, gracias al contexto de 524.288 tokens.
- Desarrollo local en Mac para prototipado de agentes: con mlx-lm y `--trust-remote-code` se puede levantar un servidor (`mlx_lm.server`) o un chat interactivo para iterar sobre prompts y flujos agenticos sin GPU dedicada.
- Generacion de codigo asistida en entornos con recursos limitados: la verificacion de conversion incluye prompts de codigo, y el modelo puede integrarse en editores o scripts locales de Apple Silicon con un throughput de 89,2 tok/s en M4 Max.
- Razonamiento con presupuesto de computo ajustable: usar `reasoning_effort="low"` para tareas simples de clasificacion o extraccion y `"high"` para problemas matematicos o de planificacion, ajustando latencia y coste.
- Despliegue en edge o en equipos de desarrollo sin conexion: el tamano de 5,4 GB en disco y 5,6 GB de pico permiten distribuir el modelo en imagenes de contenedor o instalaciones locales en Mac, con licencia Apache-2.0 para uso comercial.
- Evaluacion comparativa de cuantizaciones: el repo publica variantes bf16, 8-bit y 4-bit con perplejidad y velocidad medidas de forma homogenea, lo que facilita elegir el equilibrio calidad/velocidad para un workload concreto.

## Benchmarks y rendimiento

Datos publicados en la model card para las tres variantes MLX del modelo, medidos de forma homogenea (perplejidad sobre 128 x 512 tokens en WikiText-2 test y en los primeros articulos del dump de Wikipedia arabe `20231101.ar`; velocidad de generacion en un Apple M4 Max):

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16.0 | 8.5 | 6.5 |
| Disco | 10.1 GB | 5.4 GB | 4.1 GB |
| Memoria pico | 10.3 GB | 5.6 GB | 4.4 GB |
| Perplejidad WikiText-2 (ingles) | 14.984 | 14.994 (+0.1%) | 15.714 (+4.9%) |
| Perplejidad Wikipedia arabe | 20.171 | 20.188 (+0.1%) | 21.319 (+5.7%) |
| Generacion | 50.4 tok/s | 89.2 tok/s | 115.9 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta variante; la model card remite a la del modelo base para benchmarks de arquitectura y uso previsto.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,6 GB de pico para prompts cortos en la variante 8-bit; el cache KV crece con el contexto, por lo que contextos largos requieren mas memoria.
- Hardware objetivo: Apple Silicon (MLX); las pruebas de velocidad se realizaron en un Apple M4 Max.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable de forma nativa, ya que el formato es MLX; para CUDA habria que usar el modelo base en PyTorch o convertirlo.
- Cabe en GPU consumer Apple Silicon con al menos 8 GB de memoria unificada; con 16 GB o mas se dispone de margen para contextos largos.
- Opciones de despliegue: `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server` (probado con mlx-lm 0.32.0), siempre con `--trust-remote-code` o `trust_remote_code=True`.
- Reduccion de memoria en contextos largos: `--max-kv-size` y cuantizacion del cache KV (`--kv-bits 8`, donde este disponible).
- Throughput medido: 89,2 tok/s en M4 Max para la variante 8-bit (frente a 50,4 tok/s en bf16 y 115,9 tok/s en 4-bit). No se dispone de datos de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-3.7B-MLX-8bit | 5.058.255.360 (nominal 3.7B) | 524.288 | 8-bit MLX (8.5 bits/peso) | Apache-2.0 | Hugging Face, requiere mlx-lm con `--trust-remote-code` |
| Jais-3-3.7B-MLX-bf16 | 5.058.255.360 (nominal 3.7B) | 524.288 | bf16 | Apache-2.0 | Hugging Face, mismo repo de variantes |
| Jais-3-3.7B-MLX-4bit | 5.058.255.360 (nominal 3.7B) | 524.288 | 4-bit MLX (6.5 bits/peso) | Apache-2.0 | Hugging Face, mismo repo de variantes |
| Jais-3-3.7B (base, PyTorch) | 5.058.255.360 (nominal 3.7B) | 524.288 | no cuantizado | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks estandar que permitan comparar el rendimiento con modelos de otros desarrolladores del mismo tamano; la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Idiomas: solo arabe e ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Sesgos: la model card no documenta evaluaciones de sesgo; al ser un modelo centrado en arabe, puede reflejar sesgos culturales y regionales de sus datos de entrenamiento.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad; como modelo de 3,7B con modo thinking, conviene validar sus salidas en tareas factuales.
- Formato de salida: mlx-lm no reconoce las etiquetas `<ifm|think>`, por lo que `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado; el formato de tool calling tampoco se parsea todavia.
- Dependencia de codigo remoto: requiere `--trust-remote-code`, lo que implica ejecutar `k2_horizon.py` del repo; conviene revisar ese archivo antes de usarlo en produccion.
- Memoria en contexto largo: el pico de 5,6 GB corresponde a prompts cortos; con 512K tokens el cache KV puede exceder la memoria disponible y exige `--max-kv-size` o cuantizacion del cache.
- Calidad de cuantizacion: la variante 8-bit mantiene la perplejidad practicamente intacta (+0.1%), pero la perplejidad es una senal gruesa; hay que validar en el workload propio.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene consultar la model card original para condiciones adicionales de uso previsto.
- Madurez: el repo tiene 140 descargas y 0 likes en el momento de la consulta, y el soporte nativo de `k2_horizon` en mlx-lm aun no existe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/Jais-3-3.7B
- Variante bf16: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Paper (arXiv 2611.10224): https://arxiv.org/abs/2611.10224
- Codigo de modelo incluido en el repo: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit/blob/main/k2_horizon.py
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-3.7B
