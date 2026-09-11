# sahilchachra/MiniCPM5-2B-OptiQ-5bpw

## Resumen

MiniCPM5-2B-OptiQ-5bpw es una version cuantizada del modelo openbmb/MiniCPM5-2B, publicada por el usuario sahilchachra. Se trata de una conversion a precision mixta realizada con la herramienta mlx-optiq, con un objetivo de 5,0 bits por peso, pensada exclusivamente para ejecutarse con MLX sobre Apple Silicon (Macs con chip M-series y, en general, hardware Apple). El modelo conserva la arquitectura original LlamaForCausalLM, por lo que no requiere codigo personalizado para cargarse.

El interes de esta ficha esta en que representa un caso tipico de cuantizacion "post-entrenamiento" orientada a despliegue local: reduce un modelo denso de 2.516.756.480 parametros (~2,52 mil millones) a un repositorio de aproximadamente 1,8 GB en disco, lo que lo situa en el rango de equipos de consumo con memoria unificada modesta. La asignacion de bits no es uniforme: se calculo a partir de la sensibilidad KL de cada capa durante la calibracion, con candidatos de 4 y 8 bits, y con protecciones de suelo y de "run-guard" por bloque que acabaron imponiendose al presupuesto exacto.

Es relevante ahora porque el ecosistema MLX ha crecido como alternativa practica a llama.cpp y GGUF en el entorno Apple, y porque permite ejecutar un modelo conversacional de ~2,5 B parametros con una API compatible con OpenAI (via LM Studio) sin salir del portatil. No obstante, conviene senalar que no hay informacion publicada sobre licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks, ni en la model card ni en los resultados de busqueda disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso, sin codigo personalizado) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OptiQ de precision mixta con objetivo 5,0 bpw; 5,34 bpw reales antes de la conversion y 6,124 bpw efectivos tras incluir el sobrecoste de escalas y sesgos por grupo de MLX; candidatos de 4 y 8 bits asignados por sensibilidad KL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (~1,8 GB en disco; repositorio de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un reentrenamiento: hereda integramente la arquitectura y los pesos de openbmb/MiniCPM5-2B, un transformer decoder-only denso expuesto como LlamaForCausalLM. Esto implica que se carga con implementaciones estandar compatibles con la familia Llama, sin necesidad de codigo remoto ni de clases personalizadas, un detalle relevante para pipelines de despliegue que evitan `trust_remote_code`.

El proceso de cuantizacion lo realizo la herramienta mlx-optiq mediante el comando `optiq convert --target-bpw 5.0`. El algoritmo no aplica una precision uniforme: asigna bits por capa segun su sensibilidad medida con divergencia KL sobre un conjunto de calibracion, eligiendo entre candidatos de 4 y 8 bits. El resultado final se desvio del objetivo por dos motivos documentados por el autor: las protecciones de suelo por bloque y de run-guard prevalecieron sobre el presupuesto exacto (5,34 bpw antes de la conversion) y el sobrecoste de las escalas y sesgos por grupo de MLX elevo la cifra efectiva a 6,124 bpw. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional: el autor verifico mediante `mlx_lm.load` y `mlx_lm.generate` que produce completados coherentes y alineados con el tema, con un estilo de chat y razonamiento similar al del modelo base.
- Formato de chat: la model card emplea `tokenizer.apply_chat_template` con roles de usuario y asistente, lo que indica soporte de plantilla de conversacion multi-turno.
- Razonamiento y estilo "chat-reasoning": la model card menciona explicitamente que las respuestas mantienen el estilo de razonamiento conversacional esperado del modelo base.
- Compatibilidad con API compatible con OpenAI a traves de LM Studio, lo que habilita su uso como backend de aplicaciones que ya hablan el protocolo de OpenAI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en LM Studio mediante el motor MLX, con indexacion automatica al copiar la carpeta en `~/.lmstudio/models/<publisher>/<name>/`.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx_lm.load` y unos 2 GB de pesos, de modo que puede mantener un chat interactivo en un MacBook sin conexion a internet y sin enviar datos a terceros, algo util en entornos con requisitos de privacidad.
- Backend de prototipos con API compatible con OpenAI: al funcionar en LM Studio y exponer `localhost:1234/v1/chat/completions`, permite sustituir una llamada a la API de OpenAI por una llamada local durante el desarrollo, sin reescribir el codigo del cliente.
- Desarrollo de aplicaciones nativas Apple: al estar en formato MLX, encaja en proyectos que usan mlx-swift o el motor MLX de LM Studio, sirviendo como modelo de referencia para validar integraciones en macOS antes de pasar a modelos mayores.
- Pruebas de calidad de cuantizacion: es un caso de estudio directo para comparar la degradacion de un mismo modelo base entre fp16, MXFP4, MXFP8 y OptiQ a 5 bpw, evaluando coherencia y fidelidad respecto al original.
- Generacion de texto asistida en documentos o resumentes de parrafos: con ~2,5 B parametros y una huella de ~1,8 GB, es adecuado para tareas de redaccion corta y reescritura ejecutadas por lotes en un portatil, donde el coste por token en la nube no esta justificado.
- Educacion y experimentacion: permite a estudiantes e investigadores inspeccionar el efecto de una asignacion de bits guiada por sensibilidad KL sobre las respuestas, sin necesidad de GPUs dedicadas.
- Preprocesado y clasificacion ligera de texto en local: al poder lanzarse como servidor local, puede actuar como primer filtro (etiquetado, extraccion de campos simples) dentro de un pipeline mayor antes de delegar en un modelo mas grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una prueba de humo ("smoke test") mediante `mlx_lm.load` y `mlx_lm.generate`, que confirma salidas coherentes, y una verificacion manual en LM Studio con una respuesta correcta a un prompt basico sin truncamiento ni caracteres corruptos. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con el modelo base sin cuantizar.

## Requisitos de hardware

- Peso en disco: ~1,8 GB de pesos cuantizados (repositorio de 1,9 GB). Con 6,124 bpw efectivos, la huella de los pesos ronda los 1,93 GB en memoria.
- Memoria unificada recomendada: se estima que el modelo se ejecuta con comodidad a partir de 4 GB de memoria unificada, contando pesos, overhead de runtime y cache KV; los equipos Apple Silicon de 8 GB en adelante deberian ser suficientes. Esta estimacion es orientativa y no esta confirmada por el autor.
- GPU: no aplica en el sentido tradicional. MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y sucesores), usando la GPU integrada y la memoria unificada. No se ha documentado ejecucion en A100, H100 ni RTX 4090, y no se espera soporte fuera del ecosistema Apple.
- Cabe en GPU de consumo: no disponible como tal; el equivalente es su encaje en equipos Apple Silicon de gama de entrada y media.
- Opciones de despliegue: mlx-lm (`from mlx_lm import load, generate`), LM Studio con el motor MLX, y potencialmente mlx-swift para aplicaciones nativas. No se distribuye en GGUF, por lo que llama.cpp, Ollama y TGI no son vias de despliegue directas sobre estos pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sahilchachra/MiniCPM5-2B-OptiQ-5bpw | ~2,52 B | OptiQ mixta, objetivo 5,0 bpw (6,124 bpw efectivos) | ~1,8 GB | no disponible | MLX (Apple Silicon) |
| sahilchachra/MiniCPM5-2B-MXFP4 | ~2,52 B (heredados del base) | MXFP4 | no disponible | no disponible | MLX |
| sahilchachra/MiniCPM5-2B-MXFP8 | ~2,52 B (heredados del base) | MXFP8 | no disponible | no disponible | MLX |
| openbmb/MiniCPM5-2B | ~2,52 B | sin cuantizar (precision completa) | no disponible | no disponible | safetensors |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (por ejemplo, alternativas de ~2 B parametros en formato MLX de otros autores) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Datos ausentes: la model card no especifica licencia ni idiomas soportados. Antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base openbmb/MiniCPM5-2B, ya que la cuantizacion deriva de el.
- Perdida por cuantizacion: cualquier conversion a baja precision introduce degradacion. Aunque la asignacion por sensibilidad KL busca minimizarla, no hay evaluaciones publicadas que cuantifiquen la diferencia respecto al modelo base en tareas estandar.
- Solo Apple Silicon: los pesos estan en formato MLX y no se ofrece GGUF ni safetensors estandar para transformers. No se pueden cargar en vLLM, TGI, llama.cpp u Ollama tal cual.
- Riesgo de alucinacion: inherente a un modelo denso de ~2,5 B parametros, sin datos de evaluacion que lo acoten. No se recomienda su uso en tareas que exijan alta fidelidad factual sin verificacion posterior.
- Contexto e idiomas: se desconoce la longitud de contexto soportada y la cobertura idiomatica real. No debe asumirse un buen rendimiento en castellano sin pruebas propias.
- Madurez del repositorio: el modelo registra 0 descargas y 0 "likes", y la unica validacion documentada son pruebas de humo y una comprobacion manual en LM Studio. No hay historial de uso en produccion.
- Trazabilidad de la cuantizacion: el autor documenta que la asignacion real (5,34 bpw pre-conversion, 6,124 bpw efectivos) se desvio del objetivo declarado de 5,0 bpw. Conviene tenerlo en cuenta al comparar tamanos con otras variantes del mismo modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/MiniCPM5-2B-OptiQ-5bpw
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante MXFP4: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP4
- Variante MXFP8: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP8
- Herramienta de cuantizacion mlx-optiq: https://mlx-optiq.com
- Framework MLX: https://github.com/ml-explore/mlx
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron exclusivamente contenido no relacionado.
