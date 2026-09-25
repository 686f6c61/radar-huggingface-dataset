# darrellbest/Qwen3.5-9B-Heretic-GGUF

## Resumen

Qwen3.5-9B-Heretic-GGUF es una compilacion en formato GGUF de `darrellbest/Qwen3.5-9B-Heretic`, un derivado de `Qwen/Qwen3.5-9B` al que se le ha eliminado el comportamiento de rechazo mediante la herramienta Heretic. El autor es darrellbest y la publicacion distribuye tres cuantizaciones del modelo (BF16 sin perdida, Q8_0 y Q4_K_M) mas un proyector visual independiente en F16, lo que habilita entrada de imagen ademas de texto.

El modelo conserva el pipeline `image-text-to-text` del Qwen3.5-9B original y anade un modo de razonamiento (thinking) activado por defecto, desactivable por peticion. La modificacion no consiste en un reentrenamiento, sino en una ablacion de pesos de rango arbitrario (Arbitrary-Rank Ablation) aplicada sobre el modelo completo: segun el autor, los rechazos pasan de 100/100 a 5/100 con una divergencia KL de 0,0403 respecto al modelo original.

Es relevante en el contexto de modelos abliterated o uncensored porque ofrece cuantizaciones ya verificadas en `llama-server` y Ollama, con soporte de vision y licencia Apache-2.0, lo que facilita su despliegue local. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin adopcion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) derivado de Qwen/Qwen3.5-9B; el autor no detalla la variante interna |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16 (sin perdida), Q8_0, Q4_K_M; proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye archivo `mmproj` en F16 para la entrada de imagen) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna mas alla de que el modelo procede de Qwen/Qwen3.5-9B y mantiene su pipeline `image-text-to-text`, es decir, acepta texto e imagen como entrada. El modelo es denso, con unos 9,2 mil millones de parametros, y no se describe en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset del modelo original.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en la modificacion posterior de los pesos: Heretic aplica una Ablacion de Rango Arbitrario (Arbitrary-Rank Ablation) sobre el modelo completo para eliminar el comportamiento de rechazo, con un coste medido de divergencia KL de 0,0403 respecto al original y una reduccion de rechazos de 100/100 a 5/100. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp y la cuantizacion con `llama-quantize`, sin usar imatrix. El proyector visual se distribuye por separado y debe cargarse junto a cualquiera de las tres cuantizaciones para habilitar la entrada de imagen.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion con `chat_template_kwargs: {"enable_thinking": false}` en llama.cpp o `think: false` en Ollama.
- Razonamiento aritmetico y resolucion de problemas verbales: en las pruebas del autor con thinking activado resolvio correctamente 39/40 casos en BF16, 37/40 en Q8_0 y 35/40 en Q4_K_M.
- Capacidad multimodal de entrada: describir imagenes, con el proyector `mmproj` cargado (el autor verifico la descripcion correcta de un circulo rojo y un cuadrado azul).
- Comportamiento de rechazo reducido por diseno (5/100 refusals declarados).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo puede gestionar dialogos multi-turno en local con llama.cpp u Ollama, y su reduccion de rechazos lo hace adecuado para dominios creativos o de investigacion donde los guardarrailes estandar bloquean respuestas.
- Analisis de imagenes en local: cargando el proyector `mmproj-F16.gguf`, sirve para describir, clasificar o extraer informacion de imagenes (capturas, diagramas sencillos, fotos) sin enviar datos a servicios externos.
- Razonamiento matematico asistido por pasos: con thinking activado resuelve problemas aritmeticos y verbales, por lo que encaja en herramientas de apoyo educativo o de comprobacion de calculos.
- Investigacion sobre alineacion y abliteration: al proceder de una ablacion documentada con metricas reproducibles (5/100 refusals, KL 0,0403), es util como material de estudio sobre como afectan las tecnicas de ablacion al comportamiento del modelo.
- Generacion creativa sin censura: redaccion de ficcion, guiones o contenido con tematicas sensibles que otros modelos rechazarian, evaluando previamente los requisitos legales y eticos.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (5,78 GB) puede ejecutarse en GPU de gama media o incluso en CPU, lo que permite prototipado rapido en un portatil o una estacion de trabajo sin aceleradores de datacenter.
- Prototipado de asistentes multimodales: combinando texto e imagen en un unico modelo cabe disenar demos de asistencia visual (por ejemplo, descripcion de entorno) sin depender de varios modelos especializados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Rechazos (Heretic) | 5/100 |
| Rechazos (Qwen3.5-9B original) | 100/100 |
| Divergencia KL respecto al original | 0,0403 |

Razonamiento (4 problemas aritmeticos y verbales x 10 semillas, con thinking activado y muestreo recomendado de Qwen):

| Cuantizacion | Casos resueltos correctamente |
|---|---|
| BF16 | 39/40 |
| Q8_0 | 37/40 |
| Q4_K_M | 35/40 |
| Original (vLLM) | 40/40 |

Los fallos se debieron a agotar el presupuesto de 4.000 tokens, no a respuestas incorrectas. Ademas, en Ollama el modelo respondio 17 x 23 = 391 con thinking desactivado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 18,41 GB solo para los pesos; Q8_0 unos 9,79 GB; Q4_K_M unos 5,78 GB. A ello hay que sumar 0,92 GB del proyector `mmproj` si se usa entrada de imagen, mas el espacio para el contexto y el estado de KV.
- GPU de datacenter: A100, H100 o similares para BF16 y cargas concurrentes.
- GPU de gama alta de consumo: RTX 3090 o RTX 4090 (24 GB) para BF16 y Q8_0 con margen.
- GPU de gama media: la cuantizacion Q4_K_M (5,78 GB) cabe en tarjetas de 8 GB o 12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), dejando espacio para contexto.
- CPU: la cuantizacion Q4_K_M es viable en CPU gracias al soporte de llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` y `--jinja`), Ollama (formato GGUF). El autor indica que los ficheros fueron verificados tanto en `llama-server` como en Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato / tamano | Tecnica de ablacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| darrellbest/Qwen3.5-9B-Heretic-GGUF | GGUF BF16/Q8_0/Q4_K_M + mmproj (18,41 / 9,79 / 5,78 + 0,92 GB) | Arbitrary-Rank Ablation (Heretic) | no disponible | Apache-2.0 | 5/100 refusals, KL 0,0403; vision |
| llmfan46/Qwen3.5-9B-ultimate-irrefusable-heretic-GGUF | GGUF | MPOA + SOMA (Heretic v1.2.0) | no disponible | no disponible | Version decensurada del mismo modelo base, tecnica distinta |
| mradermacher/Qwen3.5-9B-ultimate-irrefusable-heretic-i1-GGUF | GGUF | Hereda la de llmfan46 | no disponible | no disponible | Cuantizaciones del modelo anterior |
| Qwen/Qwen3.5-9B | safetensors | sin ablacion | no disponible | Apache-2.0 (Qwen) | Modelo original con guardarrailes completos |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas mas alla de lo indicado; la comparacion es necesariamente cualitativa.

## Limitaciones y advertencias

- Guardarrailes reducidos por diseno: el autor advierte explicitamente de que el modelo presenta menos protecciones de seguridad y que la responsabilidad de su uso recae en el usuario.
- Riesgo de contenido danino: al limitarse el comportamiento de rechazo, puede generar respuestas que otros modelos bloquearian, incluyendo contenido sensible o potencialmente ilegal.
- Riesgo de alucinacion: no se documentan medidas de mitigacion; como cualquier modelo de ~9B, puede inventar hechos con seguridad.
- Limite de razonamiento: en las pruebas con thinking activado algunos casos agotaron el presupuesto de 4.000 tokens; conviene ajustar ese presupuesto segun la tarea.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue mas alla de lo que herede del modelo base.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Licencia: el repositorio declara Apache-2.0, con enlace a la licencia del modelo base de Qwen; conviene verificar los terminos del modelo original antes de un uso comercial.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo de forma independiente.
- Fecha de publicacion adelantada (2026-09-25) en los metadatos; conviene confirmar la vigencia del repositorio en el momento de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-GGUF
- Repositorio principal (bf16 safetensors): https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic
- Repositorio FP8 (vLLM): https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-FP8
- Repositorio NVFP4 (vLLM en Blackwell): https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Variante alternativa decensurada: https://huggingface.co/llmfan46/Qwen3.5-9B-ultimate-irrefusable-heretic-GGUF/blob/main/README.md
- Cuantizaciones i1 de la variante alternativa: https://huggingface.co/mradermacher/Qwen3.5-9B-ultimate-irrefusable-heretic-i1-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-heretic.html
- Ficha en AIAny (variante NEO IMATRIX + MTP con contexto de 256k): https://aiany.app/item/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
