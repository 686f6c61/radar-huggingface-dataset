# saidutta69/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-heretic es una variante "decensored" (abliterated) del modelo openbmb/MiniCPM5-2B, publicada por el usuario saidutta69. Se ha generado con la herramienta Heretic v1.4.0, que aplica ablación direccional por capas para localizar y editar las direcciones de pesos responsables del comportamiento de rechazo, en lugar de reentrenar el modelo. La intervención se concentra en las proyecciones de salida de atención (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`), de modo que el conocimiento y el seguimiento de instrucciones del modelo base quedan, según el autor, en gran medida intactos.

El modelo conserva las capacidades de la familia MiniCPM5 en la clase de 2B: uso de herramientas (tool calling), generación de código, contexto largo y razonamiento híbrido Think / No-Think seleccionable mediante plantilla de chat. Cuenta con 2.516.756.480 parámetros reales (safetensors) y un repositorio de 12,3 GB que incluye pesos en safetensors y una escalera completa de 14 cuantizaciones GGUF más F16.

Su relevancia práctica es doble: por un lado, ofrece un modelo de 2B ejecutable en GPU de consumo y en CPU para agentes locales y despliegues en el borde; por otro, sirve como material de investigación sobre mecánicas de alineación y rechazo, ya que el autor reporta una caída de rechazos de 99/100 a 4/100 con una divergencia KL de 0,0646 frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia MiniCPM5, compatible con la arquitectura llama en llama.cpp |
| Parametros totales | 2.516.756.480 (aproximadamente 2,52 mil millones) |
| Longitud de contexto | no disponible (el autor lo etiqueta como "long-context", sin cifra publicada) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; ademas pesos completos en safetensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (heredada de openbmb/MiniCPM5-2B) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La base es openbmb/MiniCPM5-2B, un transformer decoder-only denso de 2,52 mil millones de parametros que se carga de forma nativa en llama.cpp, Ollama, LM Studio y Jan, lo que confirma compatibilidad con el grafo de la arquitectura llama. El modelo soporta un modo de razonamiento hibrido: la plantilla de chat expone el parametro `enable_thinking`, que activa o desactiva el modo Think. Para tool calling, el autor recomienda SGLang como backend, ya que MiniCPM5 emite llamadas a herramientas en estilo XML y el parser `minicpm5` de SGLang las convierte al formato compatible con OpenAI (la model card se corta en este punto y no detalla el resto del flujo).

No hay reentrenamiento ni ajuste fino en esta variante. La modificacion es una abliteration reproducible con Heretic v1.4.0, que calcula direcciones de rechazo por capa y las resta de los pesos. Los parametros publicados de la intervencion son: `direction_index` por capa, `attn.o_proj.max_weight` 1,44 en la posicion 28,24 y `min_weight` 1,16 a distancia 13,17; `mlp.down_proj.max_weight` 1,42 en la posicion 28,73 y `min_weight` 1,11 a distancia 20,52. Las fuentes de datos declaradas (Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609) corresponden al entrenamiento del modelo base, no a esta variante; no se especifica el numero de tokens ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat estandar (`apply_chat_template`).
- Razonamiento hibrido: modo Think y modo No-Think conmutables por peticion mediante `enable_thinking`.
- Tool calling / function calling, con emision de llamadas en estilo XML y conversion a formato OpenAI a traves del parser `minicpm5` de SGLang.
- Flujos agenticos y razonamiento multi-paso, segun la orientacion declarada del modelo base y las etiquetas del repositorio (`tool-calling`, `long-context`, `on-device`).
- Generacion de codigo, respaldada por los datasets UltraData-Code del modelo base.
- Razonamiento matematico, respaldado por los datasets UltraData-Math del modelo base.
- Capacidades multilingues limitadas a ingles y chino.
- Contexto largo, etiquetado por el autor aunque sin cifra de tokens publicada.
- Ejecucion en dispositivo: variantes GGUF desde 0,9 GB para CPU, Apple Silicon y GPU de 6 GB.
- Supresion del comportamiento de rechazo: el autor reporta 4 rechazos de cada 100 peticiones, frente a 99 de 100 en el modelo original.
- No dispone de vision ni de audio: el repositorio solo declara la pipeline `text-generation`.

## Casos de uso

- Agentes locales en el puesto de trabajo: el modelo cabe en GPU de 8-12 GB con cuantizaciones Q6_K o Q8_0 y soporta tool calling, por lo que puede orquestar llamadas a APIs y herramientas locales sin enviar datos a un servicio externo.
- Roleplay y narrativa interactiva: la eliminacion de las direcciones de rechazo permite mantener personajes y tramas que el modelo base bloquearia, con coherencia preservada segun la divergencia KL reportada de 0,0646.
- Investigacion sobre alineacion y mecanicas de rechazo: los parametros de abliteration publicados y la comparativa de rechazos (99/100 frente a 4/100) permiten reproducir el experimento y estudiar que capas concentran el comportamiento de negativa.
- Generacion de codigo en pipelines de CI/CD: con 2,5B de parametros y soporte GGUF, puede ejecutarse en un runner con GPU de gama media o incluso en CPU para tareas de autocompletado, generacion de tests y revision de diffs.
- Asistencia conversacional en el borde: el modelo esta etiquetado como `edge-ai` y `on-device`, y la cuantizacion Q4_K_M (~1,3 GB) cabe en RAM de sistema o en GPU integrada de portatiles, lo que habilita asistentes sin conectividad.
- Extraccion y resumen de documentos largos en ingles o chino: la ventana de contexto largo declarada por el autor permite procesar documentos extensos para resumen, extraccion de entidades o Q&A sobre el documento.
- Prototipado rapido de pipelines agenticos: al ser un modelo de 2B, el coste por iteracion es bajo y permite validar prompts, esquemas de tool calling y estrategias multi-paso antes de escalar a modelos mayores.
- Evaluacion de riesgo en despliegues: util como caso de control para medir cuanto cambia el comportamiento de un modelo al eliminar sus guardarrailes, antes de decidir si un modelo sin censura es aceptable en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica tabla de rendimiento de la model card compara esta variante con el modelo original en dos metricas internas:

| Metrica | MiniCPM5-2B-heretic | openbmb/MiniCPM5-2B |
|---|---|---|
| Divergencia KL | 0,0646 | 0 (por definicion) |
| Rechazos | 4/100 | 99/100 |

El autor no describe la metodologia de medicion de rechazos ni el conjunto de evaluacion empleado, por lo que estas cifras deben tomarse como referencia del publicador y no como una evaluacion independiente. Tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (solo pesos, segun la model card): Q2_K ~0,9 GB; IQ3_S ~1,0 GB; Q3_K_S ~1,0 GB; Q3_K_M ~1,1 GB; Q3_K_L ~1,2 GB; IQ4_XS ~1,2 GB; Q4_K_S ~1,25 GB; Q4_0 ~1,25 GB; Q4_K_M ~1,3 GB; Q4_1 ~1,35 GB; Q5_K_S ~1,45 GB; Q5_K_M ~1,5 GB; Q6_K ~1,7 GB; Q8_0 ~2,1 GB; F16 ~4,0 GB.
- Margen adicional de aproximadamente 1 GB para el contexto, segun el propio autor.
- Correspondencia recomendada por GPU: RTX 3060 / 4070 / 5070 (12 GB) con Q8_0; RTX 4060 / 3070 (8 GB) con Q6_K; GTX 1660 Super / 2060 / 3050 laptop (6 GB) con Q5_K_M; CPU-only o Apple Silicon con Q4_K_M en RAM de sistema.
- Cabe en GPU de consumo: si, desde 6 GB de VRAM con Q5_K_M y desde 8 GB con Q6_K.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/MiniCPM5-2B-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang (recomendado para tool calling), transformers y text-generation-inference, segun las etiquetas y la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saidutta69/MiniCPM5-2B-heretic | 2.516.756.480 | no disponible (etiquetado como long-context) | 4/100 rechazos, KL 0,0646 frente al base | apache-2.0 | HuggingFace, safetensors y GGUF |
| openbmb/MiniCPM5-2B | 2,5B (clase, segun el autor) | no disponible | 99/100 rechazos (referencia del autor) | apache-2.0 | HuggingFace, safetensors y GGUF cuantizado |
| Otras alternativas de la clase 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos frente a otros modelos de la misma clase (por ejemplo, familias 1B-3B de otros laboratorios), por lo que la comparativa se limita al modelo base del que deriva esta variante.

## Limitaciones y advertencias

- Modelo sin guardarrailes de rechazo: la abliteration elimina el comportamiento de negativa del modelo base, por lo que puede generar contenido que el original bloquearia. No es apto para productos orientados al usuario final sin capas de moderacion externas.
- Riesgo de alucinacion: es un modelo de 2,5B de parametros; su fiabilidad factual es limitada y no se han publicado evaluaciones independientes que la cuantifiquen.
- Deriva de capacidades: la divergencia KL de 0,0646 frente al modelo original implica un cambio medible en la distribucion de salidas, aunque el autor lo describe como moderado.
- Idiomas: solo se declaran ingles y chino; no hay soporte declarado de castellano, por lo que el rendimiento en espanol no esta garantizado ni evaluado.
- Contexto: aunque el autor lo etiqueta como "long-context", no se publica la longitud de ventana soportada, lo que impide dimensionar despliegues que dependan de contexto extenso.
- Tool calling: la model card recomienda SGLang y su parser `minicpm5`; en otros backends el formato XML de las llamadas a herramientas puede no interpretarse correctamente.
- Licencia: apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las politicas de la plataforma al emplear un modelo sin filtros.
- Procedencia: el publicador es un usuario individual (`saidutta69`), no el equipo de OpenBMB, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. La model card esta truncada al final, en la seccion de tool calling.
- Datos de rendimiento autodeclarados: las cifras de rechazos y divergencia KL no van acompanadas de una descripcion del protocolo de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/MiniCPM5-2B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Licencia del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos (repositorios de jailbreaks de ChatGPT, foros de Reddit y el instalador de GitHub Desktop) no guardan relacion con la ficha.
