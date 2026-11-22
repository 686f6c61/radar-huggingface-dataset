# moonbox-dev/gemma-4-E4B-it-MLX

## Resumen

Gemma 4 E4B IT MLX es una compilación no oficial, realizada por Moonbox, del modelo instructivo Gemma 4 E4B de Google, adaptada para su ejecución en Apple Silicon mediante el framework MLX. El repositorio distribuye los pesos, configuración, tokenizador, plantilla de chat y ajustes del procesador en formato completo para `mlx-vlm`, incluyendo además el borrador de predicción multi-token (`mtp/`) que Google utiliza para decodificación especulativa. No se trata de una publicación oficial de Google, sino de una conversión mantenida por un tercero.

El modelo base es multimodal de tipo any-to-any (procesa y genera texto, con soporte declarado de visión y audio según las etiquetas del repositorio) y está orientado a instrucciones. La compilación se ofrece en dos precisiones cuantizadas (8 bits y 6 bits) con cuantización consciente del entrenamiento (QAT), lo que permite reducir el peso en disco y en memoria manteniendo una fidelidad alta respecto al modelo original en bf16.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de la familia Gemma 4 en equipos Mac con memoria unificada, sin GPU dedicada, empleando cuantizaciones de 6 y 8 bits con pérdidas medidas y documentadas (KL y precisión en MMLU-Pro). Es una opción práctica para desarrollo local, prototipado y despliegue en estaciones de trabajo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con decodificacion especulativa mediante drafter MTP; no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (QAT), en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), con `config.json`, `tokenizer.json`, `chat_template.jinja`, `processor_config.json` y subcarpeta `mtp/` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimensiones, mecanismo de atencion ni composicion del dataset de entrenamiento). Lo que si se documenta es que se trata de un modelo instructivo multimodal de Google, la familia Gemma 4, con pipeline `any-to-any`, y que el repositorio incluye un drafter de prediccion multi-token (`mtp/`) que habilita decodificacion especulativa en `mlx-vlm`. Este drafter pesa 159,1 MB en ambas precisiones y es identico en 8 y 6 bits (mismo sha256), lo que sugiere que no se cuantiza junto con el modelo principal.

La innovacion tecnica destacable de esta compilacion es la cuantizacion con entrenamiento consciente (QAT) aplicada por Moonbox, con metricas de fidelidad publicadas: en 8 bits la divergencia KL respecto al bf16 es de 0,0024 nats con un 98,5 % de coincidencia top-1, y en 6 bits es de 0,015 nats con un 96,5 % top-1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y respuesta a instrucciones en modo conversacional.
- Procesamiento multimodal: las etiquetas del repositorio declaran vision y audio, y el pipeline es `any-to-any`.
- Decodificacion especulativa mediante el drafter MTP incluido, orientada a reducir latencia de generacion.
- Ejecucion nativa en Apple Silicon a traves de MLX y `mlx-vlm`.
- Soporte de plantilla de chat (`chat_template.jinja`) y configuracion de procesador para entradas multimodales.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local en Mac: cargar la compilacion de 8 bits (unos 8,9 GB en pesos) en un Mac con memoria unificada suficiente permite iterar sobre prompts y plantillas de chat sin depender de servicios en la nube.
- Asistentes conversacionales de escritorio: la plantilla de chat y el tokenizador incluidos permiten integrar el modelo en aplicaciones nativas de macOS que necesiten un asistente multimodal con contexto conversacional.
- Procesamiento de imagenes y audio en local: al declararse vision y audio en el pipeline `any-to-any`, sirve para tareas de descripcion, extraccion de informacion o transcripcion asistida en entornos con requisitos de privacidad, sin enviar datos a terceros.
- Evaluacion de cuantizaciones: las metricas de KL y MMLU-Pro publicadas permiten comparar el impacto de 6 frente a 8 bits en un pipeline concreto antes de decidir el despliegue en produccion.
- Generacion de bajo coste energetico en estaciones Apple: el uso de MLX sobre memoria unificada evita GPU dedicada y facilita el despliegue en flotas de Mac Studio o MacBook Pro para tareas por lotes.
- Investigacion sobre decodificacion especulativa: la inclusion del drafter `mtp/` permite experimentar con tecnicas de aceleracion de inferencia y medir su efecto en latencia y calidad.
- Integracion en herramientas de linea de comandos: al ser un modelo completo de `mlx-vlm`, puede envolverse en scripts para tareas de clasificacion, resumen o extraccion sobre documentos multimodales.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de fidelidad de la cuantizacion frente al modelo bf16 original:

| Metrica | 8 bits | 6 bits | bf16 (referencia) |
|---|---|---|---|
| Divergencia KL (nats) | 0,0024 | 0,015 | 0 |
| Coincidencia top-1 | 98,5 % | 96,5 % | 100 % |
| MMLU-Pro | 38,8 % | 38,8 % | 39,0 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos en 8 bits suman aproximadamente 8,88 GB (4,69 + 4,19 GB) mas 159,1 MB del drafter MTP; en 6 bits suman aproximadamente 7,03 GB (4,51 + 2,52 GB) mas 159,1 MB del drafter. A esto hay que anadir la memoria para activaciones, cache KV y el runtime de MLX, no cuantificada en la informacion disponible.
- GPU recomendadas: el modelo esta compilado exclusivamente para Apple Silicon mediante MLX; no se documenta soporte para A100, H100 ni RTX 4090 en esta compilacion.
- Cabe en equipos consumer Apple: si, en Mac con memoria unificada suficiente para alojar los pesos mas el overhead de inferencia; el tamano exacto de memoria necesaria no esta disponible.
- Opciones de despliegue: `mlx-vlm` sobre MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B IT MLX (esta ficha) | no disponible | no disponible | safetensors MLX (6/8 bits) | Apache 2.0 | Hugging Face, mantenido por Moonbox |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face, oficial de Google |
| Otras compilaciones MLX de Gemma 4 | no disponible | no disponible | safetensors MLX | Apache 2.0 | no disponible en la informacion consultada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es una publicacion oficial de Google: los pesos han sido convertidos y cuantizados por un tercero (Moonbox), por lo que la responsabilidad sobre la fidelidad de la conversion recae en el mantenedor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de reportes de uso en produccion.
- La cuantizacion a 6 bits introduce una divergencia KL de 0,015 nats y una coincidencia top-1 del 96,5 %, superior a la de 8 bits; conviene evaluar el impacto en la tarea concreta antes de desplegar.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto o idioma en la informacion disponible.
- La licencia declarada es Apache 2.0 con enlace a la licencia de Gemma 4 de Google; es necesario revisar los terminos de uso de Gemma antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- El modelo esta atado al ecosistema MLX y Apple Silicon; no es portable a CUDA ni a CPU generica sin conversion adicional.
- El tamano del repositorio (28,4 GB) incluye ambas precisiones y artefactos auxiliares; la descarga completa no es necesaria si solo se usa una de ellas.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/gemma-4-E4B-it-MLX
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en las etiquetas: arxiv:2607.02770 (no verificado en la informacion disponible)
