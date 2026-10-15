# SnowGemma/Qwen2.5-1.5B-X-Writer-v1

## Resumen

Qwen2.5-1.5B-X-Writer-v1 es un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario SnowGemma en HuggingFace. El objetivo del modelo es generar publicaciones cortas y respuestas en chino para X (Twitter) imitando el tono y los temas de su autor. No es un modelo de escritura generalista: el propio autor lo describe como un proyecto de practica para aprender a hacer fine-tuning con LoRA, no como un modelo listo para produccion editorial.

El modelo parte de un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parametros (aproximadamente 1,54 mil millones). El entrenamiento se hizo sobre 297 muestras derivadas de 671 publicaciones del autor, y solo se ajustaron las proyecciones q_proj y v_proj de las ultimas 16 capas, con 622.592 parametros entrenables (0,04% del total). Los pesos resultantes son bfloat16 en formato MLX, pensados para ejecutarse en Macs con Apple Silicon.

Su relevancia es acotada y muy especifica: sirve como ejemplo reproducible de micro-ajuste de estilo en hardware de consumo (un M4 Pro con 48 GB de memoria unificada), y como caso de estudio de un modelo de 1,5B que se adapta a un dominio estrecho con muy pocos datos. En terminos practicos, es una herramienta de nicho para generar borradores en chino con una voz concreta, no una alternativa a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con adaptadores LoRA fusionados |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de 2048 tokens |
| Tipos de cuantizacion | No disponible; los pesos publicados son bfloat16 en formato MLX |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Formato de pesos | MLX safetensors (bfloat16); tamano del repositorio 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal y normalizacion RMSNorm, preentrenado y posteriormente afinado con instrucciones. Sobre ese modelo se aplico un LoRA que afecta unicamente a `self_attn.q_proj` y `self_attn.v_proj` de las ultimas 16 capas, con rank 8, escala 16.0 y dropout 0.05. Tras el entrenamiento, el adaptador se fusiono en los pesos del modelo base mediante `mlx_lm.fuse`, de modo que el resultado es un unico conjunto de pesos sin adaptador separado. Los parametros entrenables fueron 622.592, un 0,04% del total.

El entrenamiento se ejecuto con mlx-lm 0.32.0 y mlx 0.32.4 sobre un Apple M4 Pro con 48 GB de memoria unificada. Se realizaron 600 iteraciones con batch_size 1, acumulacion de gradiente 4 (150 actualizaciones efectivas), tasa de aprendizaje 2e-5 con AdamW, longitud maxima de 2048 tokens y `mask_prompt` activado, de forma que la funcion de perdida solo se calcula sobre la respuesta del asistente. Los datos proceden de 671 publicaciones exportadas del X Creator Studio del autor entre el 1 de febrero y el 24 de septiembre de 2026; tras eliminar enlaces t.co, entidades HTML, menciones iniciales, textos de menos de 25 caracteres, publicaciones truncadas y duplicados, quedaron 297 muestras (154 publicaciones cortas y 143 respuestas), agrupadas en 114 temas y divididas 8:1:1 en 241 de entrenamiento, 26 de validacion y 30 de prueba, garantizando que un mismo tema no aparece en dos conjuntos. No hay datos publicos sobre uso de RLHF o DPO; el ajuste es exclusivamente supervisado. El conjunto de datos no es publico.

## Capacidades

- Generacion de publicaciones cortas en chino para X, a partir de un tema y un conjunto de hechos proporcionados por el usuario.
- Generacion de respuestas breves y coloquiales a mensajes de otros usuarios en X.
- Adaptacion de tono y estilo: reproduce el registro personal del autor sobre el que se entreno.
- Seguimiento de una plantilla de entrada estricta de dos formatos (publicacion corta y respuesta), que es la que activa el estilo aprendido.
- Redaccion a partir de material factual suministrado; el modelo intenta limitarse a los hechos que recibe.
- Ejecucion local en Apple Silicon mediante mlx-lm, sin conexion a servicios externos.
- No dispone de tool calling ni function calling documentados.
- No hay soporte documentado de agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada: la model card solo declara chino.

## Casos de uso

- Generacion de borradores de publicaciones para X en chino: el modelo recibe un tema y una lista de hechos concretos y devuelve un texto corto con un tono determinado, util como primer borrador que despues revisa una persona.
- Respuesta a menciones y comentarios: con la plantilla de respuesta, genera contestaciones breves y directas a partir del mensaje recibido y de la intencion indicada por el usuario.
- Clonacion de estilo para un unico autor: al haberse entrenado sobre las publicaciones de una sola persona, sirve para replicar su voz en borradores internos, siempre que el autor lo autorice.
- Procesamiento local con privacidad: al ejecutarse con mlx-lm en un Mac, el contenido no sale del equipo, lo que encaja en flujos donde los textos no pueden enviarse a APIs externas.
- Prototipado de micro-ajustes: es un ejemplo completo y reproducible de pipeline LoRA (preparacion de datos, entrenamiento, fusion del adaptador y evaluacion) con un coste de computo bajo, util para equipos que quieren validar su flujo antes de escalar a modelos mayores.
- Banco de pruebas de MLX: sirve para medir latencia y consumo de memoria de un modelo de 1,5B en hardware Apple, con cifras de referencia de 65 tokens/s y 3,3 GB de pico en un M4 Pro.
- Generacion asistida dentro de un CMS o calendario editorial: integrado como paso previo a la revision humana, puede producir variantes de un mismo mensaje a partir de un conjunto fijo de hechos.
- No es adecuado para redaccion de textos largos, documentacion tecnica, codigo ni tareas de razonamiento, dado el tamano del modelo y la composicion de sus datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas de perdida y perplejidad sobre sus propios conjuntos:

| Metrica | Resultado |
|---|---|
| Perdida en validacion (paso 600) | 0,848 |
| Perdida en test | 0,851 |
| Perplejidad en test | 2,343 |
| Velocidad de generacion (M4 Pro, textos cortos) | Aproximadamente 65 tokens/s |
| Memoria maxima en inferencia (M4 Pro) | Aproximadamente 3,3 GB |

El autor indica que la perdida en validacion se estabilizo entre 0,846 y 0,848 a partir del paso 450, sin senales claras de sobreajuste, y advierte de que estas cifras reflejan el ajuste al vocabulario y las construcciones de los datos de entrenamiento, no la calidad de escritura del resultado.

## Requisitos de hardware

- Inferencia nativa en Macs con Apple Silicon mediante `mlx-lm`; el autor reporta un pico de memoria de aproximadamente 3,3 GB en un M4 Pro con 48 GB de memoria unificada.
- Cabe en equipos de consumo: cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada deberia poder cargar los pesos en bfloat16, aunque se recomienda 16 GB o mas para trabajar con comodidad.
- Los pesos estan en formato MLX, por lo que no se cargan directamente en GPUs NVIDIA ni en frameworks como vLLM, TGI o llama.cpp sin una conversion previa a safetensors de HuggingFace o a GGUF.
- No se documentan cuantizaciones publicadas; `mlx-lm` permite convertir a 8, 6 o 4 bits con `mlx_lm.convert`, pero no hay cifras de calidad ni de memoria para esas variantes en la informacion disponible.
- No se han publicado mediciones de throughput en lote ni de latencia en GPUs de datacenter (A100, H100, RTX 4090); el unico dato de velocidad disponible es el de un unico Mac M4 Pro.
- Para el entrenamiento original se uso un Apple M4 Pro con 48 GB; reproducir el ajuste con esos 297 ejemplos es viable en hardware de gama de consumo similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-X-Writer-v1 | 1,54B | No disponible (entrenado a 2048 tokens) | Apache 2.0 | MLX safetensors (bfloat16) | Ajuste de estilo en chino para X; datos de entrenamiento no publicos |
| Qwen2.5-1.5B-Instruct | 1,54B | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors HF | Modelo base; proposito general y multilingue, sin especializacion de estilo |
| Alternativas de 1B a 2B de proposito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

La comparacion con el modelo base es la unica que puede establecerse con la informacion disponible: el X-Writer hereda la arquitectura, el tamano y la licencia del Instruct, y anade un sesgo de estilo en chino a costa de estrechar su dominio de aplicacion. No hay datos publicados que permitan comparar su rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy pequeno (297 muestras) y solo contiene publicaciones cortas y respuestas; no incluye textos largos, por lo que su capacidad de redactar piezas extensas es practicamente la del modelo base.
- El modelo es de 1,5B parametros: su conocimiento factual y su capacidad de razonamiento son limitados.
- Puede inventar numeros, parametros, citas o experiencias que no esten en el material proporcionado, aunque el prompt pida lo contrario; toda salida debe revisarse antes de publicarse.
- Esta especializado en el tono y los temas de una unica persona; aplicado a otros dominios o a otras voces, el resultado no es fiable.
- Los datos de entrenamiento provienen de publicaciones publicas del autor, de modo que el modelo podria reproducir fragmentos muy similares a los textos originales.
- La model card prohibe explicitamente su uso para suplantar a otras personas, generar contenido enganoso o publicar de forma masiva.
- El idioma declarado es unicamente el chino; no hay evidencia de un comportamiento correcto en castellano.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y el autor no ofrece garantias sobre el resultado.
- El repositorio esta etiquetado como `SnowGemma/Qwen2.5-1.5B-X-Writer-v1`, mientras que los ejemplos de la model card invocan `asyncliu/Qwen2.5-1.5B-X-Writer-v1`; conviene verificar el identificador correcto antes de integrarlo en un pipeline.
- No hay resultados de benchmarks publicados, por lo que no es posible estimar su calidad objetiva frente a otras alternativas.
- Solo se distribuyen pesos en formato MLX; usarlo fuera de Apple Silicon exige una conversion previa y una validacion posterior de la calidad.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SnowGemma/Qwen2.5-1.5B-X-Writer-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Identificador alternativo citado en la model card: https://huggingface.co/asyncliu/Qwen2.5-1.5B-X-Writer-v1
- Libreria de inferencia MLX: https://github.com/ml-explore/mlx
- Herramientas mlx-lm (carga, generacion, fusion de LoRA y conversion): https://github.com/ml-explore/mlx-lm
