# G33-k/qwen3-vl-4b-brand-tools-controller-lora

## Resumen

El modelo `G33-k/qwen3-vl-4b-brand-tools-controller-lora` es un adaptador LoRA de alcance muy limitado, publicado por el usuario G33-k, que convierte el modelo base `Qwen/Qwen3-VL-4B-Instruct` en un controlador de invocacion de herramientas (tool-use) en texto. Su proposito no es la generacion generalista, sino operar de forma determinista dos herramientas TypeScript concretas: `verify_company_website` y `find_customer_facing_pages`. El adaptador no anade conocimiento de dominio general; aprende el formato de entrada, el orden de llamada, la disciplina de argumentos, la formulacion de aclaraciones y la recuperacion ante identificadores caducados o extranjeros.

Tecnicamente es un adaptador PEFT (r=16, alpha=16, dropout 0) entrenado con QLoRA en NF4 sobre el decodificador de texto del modelo base, con `FastModel(text_only=True)`. La torre de vision no se cargo ni se entreno: pese a heredar el nombre `qwen3-vl`, el adaptador es exclusivamente textual. El corpus de entrenamiento es integramente sintetico (1.032 conversaciones, 2.856 decisiones del asistente, 43 familias base) generado ejecutando las herramientas reales contra entornos de prueba deterministas.

Su relevancia es acotada y experimental: es un ejemplo reproducible de destilacion de comportamiento de tool calling hacia un modelo pequeno multimodal, con receta completa publicada (unsloth, 2 epochs, 4.170 pasos de optimizacion, 3 h 04 m en una RTX PRO 6000 Blackwell). Con cero descargas y cero likes en el momento de la consulta, y con la validacion completa de 258 episodios aun en curso, debe considerarse un artefacto de investigacion y no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso con torre de vision inactiva; el adaptador modifica `model.layers.N` del decodificador de texto |
| Parametros totales | Modelo base de 4.000 millones de parametros (Qwen3-VL-4B-Instruct); adaptador LoRA r=16 sobre subconjunto de capas. Tamano del repo: 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion para el modelo base; el entrenamiento uso un maximo de 16.384 tokens por decision (la decision mas larga: 11.124 tokens) |
| Tipos de cuantizacion | Base en NF4 (4 bits) durante el entrenamiento, con computo en bf16; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (alpha 16, alpha == r, dropout 0) aplicado sobre `Qwen/Qwen3-VL-4B-Instruct`, revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`. El entrenamiento se realizo con Unsloth 2026.9.7 mediante `train_unsloth.py --family qwen3vl`, cargando el modelo con `FastModel text_only=True`, es decir, sin cargar ni entrenar la torre de vision. La cuantizacion de la base fue NF4 de 4 bits con computo en bf16. La tokenizacion se hizo por decision, con enmascarado unicamente sobre los turnos del asistente, plantilla de chat nativa y un maximo de 16.384 tokens.

La receta completa: learning rate 2e-4 con scheduler coseno y warmup del 5 por ciento, 2 epochs equivalentes a 4.170 pasos del optimizador, host NVIDIA RTX PRO 6000 Blackwell (sm_120) en una porcion MIG 4g.96gb, 3 h 04 m de reloj de pared, 1.420 tok/s agregados y 5,8 GiB de pico de memoria. La perdida de validacion reportada es 0,0 sobre 714 decisiones, lo que el propio autor interpreta como senal de saturacion. La model card indica explicitamente que una receta anterior (SAPPAN, alpha=32, LR 1e-4) se inicio y se descarto, y que el adaptador publicado no la usa.

Los datos de entrenamiento son integramente sinteticos: `sft/train.jsonl` de la revision de corpus 2026-09-21, con 1.032 conversaciones, 2.856 decisiones del asistente y 43 familias base, generadas ejecutando las herramientas reales contra mundos de prueba deterministas. No hay ejemplos de empresas reales ni revisados por humanos. Los seis comportamientos objetivo son: mapeo del formulario de entrada, orden de las herramientas, disciplina de argumentos, peticion de aclaracion, reporte honesto de estado y recuperacion ante caducidad o identificadores extranjeros.

## Capacidades

- Tool calling en texto: emite llamadas en el formato Qwen `<tool_call>{json}</tool_call>`, pensado para parsearse con coercion tipada contra esquema.
- Dos herramientas especificas y deterministas: `verify_company_website` y `find_customer_facing_pages`, con orden de invocacion aprendido y disciplina de argumentos.
- Mapeo del formulario de entrada: traduce la peticion del usuario a los argumentos esperados por cada herramienta.
- Peticion de aclaracion: cuando la peticion es ambigua o incompleta, formula una pregunta en lugar de invocar la herramienta con datos inventados.
- Reporte honesto de estado: comunica fallos o resultados parciales sin fabricar exito.
- Recuperacion ante caducidad e identificadores extranjeros: maneja casos de identificadores expirados o de otra jurisdiccion.
- Generacion de texto: unicamente como soporte de las decisiones de tool use; el modelo esta entrenado sobre decisiones del asistente, no sobre dialogo abierto.
- Vision: no soportada en la practica. La torre de vision no se cargo ni se entreno y el corpus es exclusivamente textual.
- Modo thinking: no compatible. La model card recomienda servir con `enable_thinking=False` en tiempo de render.
- Multilingue: no disponible; el corpus sintetico no documenta cobertura de idiomas.
- Razonamiento multi-paso, matematicas y codigo general: no son capacidades entrenadas en este adaptador y no hay evidencia publicada al respecto.

## Casos de uso

- Enriquecimiento de datos B2B: dado un nombre de empresa, el controlador decide invocar `verify_company_website` para comprobar el dominio corporativo y `find_customer_facing_pages` para localizar paginas de cliente, devolviendo una estructura consumible por un pipeline de CRM.
- Auditoria de presencia digital de marca: integrado en un job que, para cada marca de una lista, obtiene el sitio verificado y las paginas orientadas al cliente, util para informes de posicionamiento o deteccion de dominios suplantados.
- Agentes de investigacion de mercado con enrutado estrecho: el adaptador actua como controlador especializado dentro de un agente mayor, delegando el resto del razonamiento a otro modelo y limitandose a decidir cuando y con que argumentos llamar a las dos herramientas TypeScript.
- Gestion de peticiones ambiguas en atencion al cliente: cuando el usuario no especifica la empresa o el dominio, el modelo pide aclaracion en lugar de invocar la herramienta, lo que reduce llamadas erroneas en produccion.
- Recuperacion de sesiones caducadas: en flujos donde un identificador de empresa ha expirado o proviene de otra jurisdiccion, el controlador detecta el caso y activa la ruta de recuperacion aprendida, evitando fallos silenciosos.
- Evaluacion comparativa de controladores de herramientas: sirve como segundo punto de comparacion frente al controlador MiniCPM5 sobre el mismo conjunto de evaluacion `G33/k-minicpm5-brand-tools-eval-kit`, utiles para medir si un modelo de 4B con adaptador iguala a un controlador especifico.
- Pruebas de integracion en CI/CD: al ser un adaptador de 0,1 GB sobre una base de 4B, puede cargarse en un runner con GPU modesta para validar que los cambios en el esquema de las herramientas no rompen el formato de salida.
- Prototipado de esquemas de tool calling tipados: el requisito de coerción tipada contra esquema y el formato `<tool_call>` lo convierten en banco de pruebas para validar parsers y validadores de argumentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion facilitados son internos y no comparables con benchmarks publicos:

| Metrica | Resultado | Notas |
|---|---|---|
| Perdida de validacion | 0,0 sobre 714 decisiones | El autor lo interpreta como senal de saturacion |
| Paridad de prompt | 120/120 | Puerta de pre-flight en el host de entrenamiento |
| Sonda de harness (8 casos) | 8/8 | Puerta de pre-flight en el host de entrenamiento |
| Validacion completa (258 episodios) | En curso en el momento de la publicacion | La model card indica que se actualizara con puntuaciones nombradas por revision de corpus |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el coste real lo determina el modelo base de 4.000 millones de parametros.
- VRAM estimada para inferencia: aproximadamente 3-4 GB con cuantizacion de 4 bits (NF4), y aproximadamente 8-10 GB en bf16. Son estimaciones derivadas del tamano del modelo base, no cifras publicadas por el autor.
- Entrenamiento documentado: NVIDIA RTX PRO 6000 Blackwell (sm_120) con una porcion MIG 4g.96gb, 5,8 GiB de pico y 3 h 04 m de reloj de pared. La MIG de 96 GB es sobredimensionada para este modelo; el pico real de memoria fue de 5,8 GiB.
- GPU consumer: con cuantizacion de 4 bits el modelo base cabe en tarjetas de 8 GB o superiores (RTX 3060 8 GB, RTX 4060, RTX 4070 y superiores). En bf16 requiere 12 GB o mas, lo que lo situa en el rango de RTX 4070 Ti Super, RTX 4080 o RTX 4090.
- GPU de datacenter: A100, H100 y L40S sobran para este tamano; solo se justifican por concurrencia o por servir muchas replicas.
- Despliegue: al ser un adaptador PEFT, requiere `peft` sobre el modelo base. Debe cargarse sobre una carga solo-texto de la base, no mediante `AutoModelForImageTextToText` sin gestion de claves (referencia al issue unsloth#3560). Es compatible con Unsloth, vLLM (con soporte de LoRA) y TGI; llama.cpp y Ollama requieren fusionar el adaptador en los pesos base y convertir a GGUF, un flujo no documentado por el autor.
- Rendimiento de entrenamiento observado: 1.420 tok/s agregados en la MIG 4g.96gb de una RTX PRO 6000 Blackwell.
- Latencia y throughput de inferencia: no disponibles.
- Configuracion de servicio recomendada por el autor: decodificacion greedy, thinking desactivado y `enable_thinking=False` en tiempo de render, evaluando el adaptador sin fusionar sobre la misma base NF4 con la que se entreno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G33-k/qwen3-vl-4b-brand-tools-controller-lora | 4B (base) + LoRA r=16 | No disponible; entrenado hasta 16.384 tokens por decision | Sin benchmarks publicos; validacion completa en curso | Apache 2.0 | HuggingFace (0 descargas, 0 likes en la consulta) |
| Qwen/Qwen3-VL-4B-Instruct (base sin adaptador) | 4B | No disponible en la informacion | No disponible en la informacion | Apache 2.0 (segun el campo `license` del adaptador) | HuggingFace, ampliamente distribuido |
| Controlador MiniCPM5 (referenciado en la model card) | No disponible | No disponible | No disponible; opera las mismas dos herramientas TypeScript | No disponible | No disponible |

No se han encontrado en la informacion proporcionada otros modelos comparables de la misma categoria (controladores de tool use de alcance estrecho sobre herramientas TypeScript deterministas).

## Limitaciones y advertencias

- Alcance extremadamente narrow: solo dos herramientas TypeScript (`verify_company_website` y `find_customer_facing_pages`) y seis comportamientos concretos. No es un modelo de proposito general.
- Datos de entrenamiento 100 por cien sinteticos, sin ejemplos de empresas reales ni revision humana. El propio autor advierte que el exito en los entornos de prueba no implica precision en el mundo real.
- Perdida de validacion de 0,0 sobre 714 decisiones: es una senal de saturacion o de sobreajuste al corpus sintetico, no una garantia de generalizacion.
- La validacion completa de 258 episodios estaba en curso en el momento de la publicacion. No hay puntuaciones finales ni comparacion con la linea base MiniCPM5.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- Vision no funcional: pese a derivar de un modelo multimodal, el adaptador no carga ni ha entrenado la torre de vision y su corpus es exclusivamente textual. No debe esperarse ninguna capacidad de imagen.
- Problemas de carga documentados: el adaptador esta indexado para el decodificador solo-texto (`model.layers.N`); cargarlo con `AutoModelForImageTextToText` sin gestion de claves falla (unsloth#3560).
- Sensibilidad al parseo: la salida `<tool_call>{json}</tool_call>` exige coercion tipada contra esquema; un parser laxo puede aceptar argumentos invalidos.
- Thinking debe desactivarse en render (`enable_thinking=False`) y el servicio debe ser greedy; desviarse de esta configuracion puede degradar el comportamiento aprendido.
- El autor recomienda evaluar el adaptador sin fusionar sobre la misma base NF4 con la que se entreno. Evaluar sobre otra cuantizacion puede alterar los resultados.
- Idiomas soportados no declarados: riesgo de comportamiento impredecible fuera del idioma del corpus sintetico.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validacion publica hace desaconsejable desplegarlo en produccion sin evaluacion propia.
- No hay informacion sobre sesgos, tasas de alucinacion en generacion libre ni robustez ante entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/G33-k/qwen3-vl-4b-brand-tools-controller-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Conjunto de datos de evaluacion: https://huggingface.co/datasets/G33/k-minicpm5-brand-tools-eval-kit
- Issue de Unsloth sobre la carga de adaptadores multimodales: https://github.com/unslothai/unsloth/issues/3560
- No se han encontrado en la busqueda web otros enlaces relevantes al modelo, a su paper o a demos; los resultados devueltos correspondian a entidades homonimas sin relacion (grupo de paises G33, automoviles Ginetta G33, pistola Glock 33, refrigerante de automocion y auriculares Logitech G333).
