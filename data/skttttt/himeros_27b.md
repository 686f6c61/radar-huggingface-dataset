# Skttttt/Himeros_27B

## Resumen

Himeros 27B es un modelo de generación de texto especializado en roleplay ficcional de formato largo y escritura creativa en inglés. Desarrollado por el autor Skttttt, se construye a partir del modelo base orcarouter/Qwen3.8-27B-Uncensored, una variante de la familia Qwen3.8 con 27 000 millones de parámetros. El modelo se obtuvo mediante un ajuste fino con LoRA, cuyos pesos se fusionaron posteriormente en los pesos base, y se distribuye como un GGUF en precisión BF16 dividido en dos shards.

El objetivo principal del modelo es mejorar la calidad del roleplay multi-turno sostenido, prestando especial atención a la coherencia de la voz del personaje, la continuidad de la escena, el diálogo natural y la prosa gramaticalmente correcta. Está pensado para un público adulto, ya que puede generar contenido explícito. No se publican resultados de benchmarks cuantitativos; la evaluación declarada es cualitativa y centrada en tareas de roleplay.

La relevancia de Himeros 27B radica en su especialización: mientras que los modelos generalistas de 27B suelen priorizar razonamiento o código, este modelo sacrifica deliberadamente el rendimiento en tareas factuales para optimizar la experiencia de escritura ficcional interactiva. Su distribución en formato GGUF facilita su uso en herramientas como llama.cpp o LM Studio, aunque la ausencia de cuantizaciones de menor precisión limita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.8-27B (transformer decoder-only, sin detalles adicionales publicados) |
| Parametros totales | 27B (segun el nombre del modelo y su base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (recomendacion del autor; maximo no especificado) |
| Tipos de cuantizacion | BF16 (GGUF); no se han publicado otras cuantizaciones |
| Idiomas soportados | Ingles |
| Licencia | other (sujeta a los terminos del modelo base y de los datasets de entrenamiento) |
| Formato de pesos | GGUF (BF16, dos shards) |

## Arquitectura y entrenamiento

El modelo parte de orcarouter/Qwen3.8-27B-Uncensored, un modelo de 27 000 millones de parametros de la familia Qwen3.8. No se proporcionan detalles sobre la arquitectura interna del base (numero de capas, dimensiones, atencion), pero al tratarse de un derivado de Qwen se asume una arquitectura transformer decoder-only convencional. El ajuste se realizo mediante LoRA, y los adaptadores resultantes se fusionaron en los pesos base para producir el release final en BF16.

El entrenamiento combino ejemplos sinteticos de roleplay de formato largo revisados de forma independiente, un pequeno corpus de dialogo romantico proporcionado por el usuario, y fuentes publicas filtradas de escritura creativa y roleplay. Entre los datasets publicos citados se incluyen Dampfinchen/Creative_Writing_Multiturn, angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, beyoru/Aesir-Character-CoT-roleplay, Exxe/literary-roleplay y jondurbin/gutenberg-dpo-v0.1. El procesamiento incluyo filtrado de idioma ingles, restricciones de personajes adultos, control de calidad, eliminacion de casi duplicados, division agrupada de train/evaluacion, validacion de la plantilla de chat y enmascaramiento de solo respuesta. Se retuvo un pequeno ancla de razonamiento conciso para mantener la coherencia general, aunque el objetivo principal fue la generacion de roleplay natural y no el razonamiento visible.

No se mencionan innovaciones tecnicas destacables mas alla del enfoque en datos y el ajuste LoRA. Tampoco se indica el uso de RLHF o DPO como metodo de entrenamiento, aunque uno de los datasets (gutenberg-dpo) sugiere que podria haberse utilizado DPO de forma indirecta, pero no se confirma.

## Capacidades

- Generacion de texto ficcional de formato largo en ingles, con enfasis en roleplay multi-turno.
- Voz de personaje coherente a lo largo de conversaciones extensas.
- Continuidad de escena y mantenimiento del hilo narrativo.
- Dialogo natural y prosa gramaticalmente correcta.
- Escritura creativa colaborativa, donde el modelo respeta la agencia del usuario y no escribe acciones o dialogo por el usuario salvo que se le pida.
- Capacidad de seguir instrucciones de sistema detalladas para definir personaje, entorno, tono y limites.
- No soporta tool calling, function calling, agentes autonomos, vision, audio ni razonamiento visible (el autor recomienda desactivar el modo thinking).
- Multilingue: solo ingles.

## Casos de uso

- Roleplay ficcional de formato largo: el modelo mantiene conversaciones multi-turno con personajes definidos, ideal para juegos de rol escritos en foros, chats o aplicaciones dedicadas. Su ventana de contexto recomendada de 8192 tokens permite escenas extensas sin perder el hilo.
- Escritura creativa colaborativa: escritores pueden usarlo como coautor para continuar historias, desarrollar dialogos entre personajes o explorar variaciones de una escena manteniendo un estilo consistente.
- Creacion de dialogos para guiones o narrativa interactiva: el modelo genera intercambios naturales y con detalle sensorial, util para prototipar guiones o novelas visuales.
- Experimentos de estilo y continuidad: permite probar como diferentes ajustes de temperatura, top-p y min-p afectan a la coherencia y variedad del texto, sirviendo como banco de pruebas para parametros de sampling.
- Generacion de contenido de ficcion para adultos: dado su aviso de contenido adulto, puede emplearse en proyectos de ficcion erotica o romantica, siempre con los controles de acceso y moderacion adecuados.
- Prototipado de personajes para videojuegos o narrativa transmedia: el modelo puede generar lineas de dialogo y reacciones de personajes en escenarios variados, ayudando a escritores y disenadores a explorar la personalidad de sus creaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ningun resultado cuantitativo estandarizado y que la evaluacion realizada hasta la fecha es cualitativa, centrada en aspectos como gramatica, consistencia de personaje, continuidad de escena, naturalidad del dialogo, creatividad, respeto por la agencia del usuario y degeneracion en contextos largos. Cualquier afirmacion de mejora sobre el modelo base debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 54,7 GB en disco (dos shards). Para cargar los pesos en memoria se necesitan al menos 55-60 GB de VRAM, mas overhead de activaciones y cache de atencion, por lo que se recomienda un minimo de 70 GB de VRAM para un contexto de 8192 tokens.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, dos RTX 4090 con NVLink o una combinacion de GPUs de 24 GB). En hardware de consumo, una RTX 4090 (24 GB) no es suficiente para la version BF16 completa.
- Si se publicaran cuantizaciones de 4 bits o 8 bits en el futuro, el modelo podria ejecutarse en GPUs de 24 GB o incluso 16 GB, pero actualmente no estan disponibles.
- Opciones de despliegue: llama.cpp (compatible con GGUF), LM Studio (mencionado en la model card), y cualquier frontend que soporte GGUF. Tambien podria convertirse a otros formatos (safetensors) para usarse con vLLM o TGI, aunque no se proporcionan dichos archivos.
- Latencia y throughput: no disponibles. Dependeran del hardware, la cuantizacion y la implementacion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Himeros 27B | 27B | 8192 (recomendado) | Roleplay y escritura creativa en ingles | other | GGUF (BF16) |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | No especificado | Modelo base generalista sin censura | other | No especificado |
| google/gemma-3-27b-it | 27B | 128K (segun documentacion oficial) | Multimodal, instrucciones generales | Gemma Terms of Use | safetensors, GGUF |
| Bonsai 27B | 27B | No especificado | Multimodal, cuantizacion extrema (1-bit/ternary) | No especificado | No especificado |

La comparativa se basa en caracteristicas generales, ya que no se dispone de datos de rendimiento para Himeros 27B. Frente al base orcarouter, Himeros anade un ajuste especifico para roleplay, pero pierde generalidad. Gemma-3-27B-it ofrece capacidades multimodales y un contexto mucho mayor, pero no esta especializado en ficcion. Bonsai 27B destaca por su cuantizacion agresiva, pero no es comparable en proposito.

## Limitaciones y advertencias

- El modelo puede alucinar hechos y producir informacion incorrecta con total confianza; no debe usarse como autoridad factual ni como asesor profesional.
- Puede perder continuidad en contextos muy largos, repetir frases, sobre-narrar o adoptar habitos estilisticos no deseados.
- Hereda sesgos, modos de fallo y limitaciones de conocimiento de su modelo base y de las fuentes de entrenamiento.
- El ajuste para roleplay ficcional adulto puede reducir el rendimiento en tareas factuales o de codigo.
- La configuracion de prompt, los parametros de sampling, la longitud de contexto y la cuantizacion pueden alterar significativamente la calidad de la salida.
- El modelo puede generar contenido explicito, perturbador o de otro modo objetable. Los filtros de entrenamiento reducen el riesgo pero no garantizan una salida segura o conforme a politicas.
- La licencia es "other" y esta sujeta a los terminos del modelo base y a las licencias individuales de cada dataset de entrenamiento. Es responsabilidad del usuario revisar dichos terminos antes de cualquier redistribucion o uso comercial.
- No se proporcionan cuantizaciones de menor precision, lo que limita su despliegue en hardware de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Skttttt/Himeros_27B
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Datasets de entrenamiento citados:
  - https://huggingface.co/datasets/Dampfinchen/Creative_Writing_Multiturn
  - https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
  - https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
  - https://huggingface.co/datasets/Exxe/literary-roleplay
  - https://huggingface.co/datasets/jondurbin/gutenberg-dpo-v0.1
