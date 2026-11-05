# Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q4-mlx

## Resumen

Qwen3.5-9B-Atlassian-Q4-mlx es una cuantizacion 4-bit del modelo Qwen3.5-9B de Alibaba, afinada mediante LoRA por LeanZero para el dominio de desarrollo sobre la plataforma Atlassian: Forge, Jira, Confluence y Jira Service Management. El modelo resuelve un problema concreto: los modelos generalistas desconocen los detalles de la API de Forge, los manifiestos, los modulos de UI Kit y las practicas de validacion de Atlassian, por lo que fallan al generar aplicaciones Forge completas y correctas. Este ajuste busca que un modelo de 9B, con una huella de memoria muy inferior a la de un 27B, sea capaz de producir manifiestos validos y aplicaciones que compilen contra los tipos reales de `@forge/*`.

La arquitectura subyacente es la del Qwen3.5-9B base (transformer denso, 8.953.803.264 parametros), sobre el que se aplico un adaptador LoRA entrenado con mlx-lm y posteriormente fusionado; los pesos fusionados en bf16 se cuantizaron despues a 4-bit con group size 64 mediante mlx-lm y mlx-node. El resultado se distribuye en formato MLX (safetensors) con una cabeza MTP (`mtp.safetensors`) para decodificacion especulativa.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo completo de ajuste y cuantizacion ejecutado integramente en un Apple Silicon Mac Studio; por otro, publica una evaluacion inusualmente detallada (sondas de identificadores, bateria de bucles, prueba de fugas, KLD respecto a base+adaptador y tasas de aceptacion de MTP) que permite juzgar el modelo con datos medidos en lugar de impresiones. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), ajuste LoRA fusionado y cuantizado; cabeza MTP para decodificacion especulativa |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (se han medido velocidades a 32.768 tokens, lo que sugiere soporte al menos hasta esa longitud) |
| Tipos de cuantizacion | 4-bit, group size 64 (esta version); existe una variante 8-bit del mismo ajuste |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX, mas `mtp.safetensors` para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 8,95B parametros. Sobre el se entreno un adaptador LoRA (ronda T1-9B, release v0.3) con mlx-lm, que despues se fusiono con los pesos base en bf16 y se cuantizo a 4-bit plano con group size 64. La cuantizacion se realizo con mlx-node y mlx-lm, y la evaluacion se ejecuto con el fork Rapid-MLX de LeanZero. La concordancia con el modelo base+adaptador sin cuantizar es de KLD top-1024 de 0,1734 y top-1 del 90,49% (la variante 8-bit alcanza 0,0537 y 99,14%).

El entrenamiento uso dos epocas completas (4.300 pasos, learning rate 5e-5) sobre la mezcla m7 de la ronda 4 del modelo 27B: 18.189 muestras, aproximadamente 6,1 millones de tokens. La composicion incluye doce aplicaciones Forge escritas por LeanZero y cinco fixtures de forge-sim; manifiestos generados por esquema y validados con el validador de Atlassian; ejemplos de UI Kit que compilan con `@forge/react` 12; la documentacion de Forge como texto y como pares pregunta-respuesta con verificacion literal; hechos de endpoints y scopes extraidos de seis especificaciones OpenAPI de Atlassian; el compendio de investigacion comunitaria de LeanZero y respuestas publicadas; 220 hilos publicos del Atlassian Developer Community; las aplicaciones del 27B que pasaron la validacion en dos rondas de rejection sampling (431 + 937) y 362 pares de correccion validadas; y una porcion de replay de codigo general. El modelo se entreno con `reasoning_effort=medium` y `preserve_thinking=false`. Una segunda ronda sobre la mezcla v0.4 del 27B no alcanzo el umbral de publicacion (18 de 25 aplicaciones completas y 19 de 25 manifiestos, frente al criterio de 20/20) y no se libero.

La innovacion tecnica destacable es la cabeza MTP (multi-token prediction) incluida como archivo separado, que permite decodificacion especulativa en Rapid-MLX: aceptacion de borradores del 67% y aceleraciones de 1,14x a 128 tokens, 1,09x a 2.048, 1,08x a 8.192 y 1,05x a 32.768.

## Capacidades

- Generacion de codigo especifico de Atlassian Forge: manifiestos, modulos, resolvers y UI Kit con `@forge/react` 12.
- Conocimiento factual de Jira, Confluence y Jira Service Management: endpoints, scopes y modulos de plataforma.
- Generacion de aplicaciones Forge completas a partir de un brief de una linea (16 de 25 pasan todas las puertas de validacion y compilacion en la evaluacion del autor).
- Modo thinking (razonamiento extendido) activable y desactivable; el autor recomienda thinking para preguntas y thinking desactivado para generacion de codigo.
- Soporte de tool calling mediante el parser `qwen3_coder_xml` en Rapid-MLX.
- Capacidades generales de generacion de texto y conversacion heredadas del base Qwen3.5-9B.
- Capacidad multilingue limitada: solo se declara ingles.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Generacion de aplicaciones Forge desde un brief: el modelo produce manifiesto, modulos y codigo de UI Kit; es adecuado porque fue entrenado con aplicaciones reales validadas y ejemplos que compilan, y porque el autor documenta que 16 de 25 aplicaciones completas superan validador y `tsc`.
- Asistente de desarrollo en el IDE o en un agente de escritorio: integrado via Rapid-MLX o LM Studio, responde preguntas sobre modulos Forge, scopes y endpoints; su sonda de identificadores alcanza el 62% con thinking activado frente al 15% del base.
- Migracion de scripts y automatizaciones a Forge: el conocimiento de endpoints y scopes extraido de seis especificaciones OpenAPI permite traducir llamadas REST a modulos Forge con menos errores de API.
- Soporte a equipos de Jira Service Management: responde sobre configuracion de JSM y hechos de plataforma con el modo thinking, reduciendo consultas a documentacion.
- Generacion de manifiestos y validacion en pipelines CI/CD: el modelo produce el manifiesto y el pipeline lo valida con el validador oficial y `tsc`; el autor advierte explicitamente que el modelo no es un compilador y debe emparejarse con ambas herramientas.
- Prototipado local en hardware Apple Silicon: al ser un 4-bit MLX de 5,5 GB, permite iterar en un Mac sin GPU dedicada, con decodificacion especulativa MTP para reducir latencia.
- Generacion de respuestas y contenido tecnico para el Atlassian Developer Community: entrenado con 220 hilos publicos y el compendio de investigacion del autor.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La columna "27B release" corresponde al modelo hermano de 27B en su version v0.5.

| Prueba | Base 9B sin tocar | 9B ajustado (este modelo) | Release 27B |
|---|---|---|---|
| Identificadores pre/post, thinking on | 15% / 15% | 62% / 15% | 85% / 15% |
| Identificadores, thinking off (servido) | n/a | 69% / 38% | 85% / 31% |
| Manifiestos validos (de 25) | n/a | 19 | 31,3 |
| Aplicacion completa supera todas las puertas (de 25) | n/a | 16 | 30,0 |
| Bucles por pierna (4 piernas) | 0 / 0 / 5 / 3 | 0 / 0 / 4 / 0 | 0 / 0 / 1 / 0 |
| No terminacion por pierna | 28 / 23 / 33 / 23% | 18 / 8 / 13 / 0% | 38 / 30 / 35 / 13% |
| KLD / top-1 del 8-bit fusionado vs base+adaptador | - | 0,0537 / 99,14% | 0,0339 / 99,56% |
| Aceptacion MTP / speedup (128, 2048, 8192, 32768) | - | 67% / 1,14x, 1,09x, 1,08x, 1,05x | 58% / 1,45x, 1,38x, 1,38x, 1,27x |
| Carga en LM Studio | - | PASS | PASS |

Otras metricas: perdida de validacion de 0,575 en su mezcla de entrenamiento y 0,959 en la mezcla de la ronda 1 del 27B. Prueba de fugas: 0 fugas sobre 112 salidas (26 coincidencias de regex, de las cuales 21 marcadas como alucinadas y 5 como token alucinado). Sonda de identificadores sobre esta cuantizacion 4-bit con thinking activado: 77% / 23% (el 8-bit: 62% / 15%).

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,5 GB en 4-bit; en la practica requiere algo mas para el contexto y la cabeza MTP. Cabe holgadamente en Mac con 16 GB de memoria unificada y en GPUs consumer con 8-12 GB.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son chips Apple Silicon (M1/M2/M3/M4, con ventaja en M-series Pro/Max/Ultra). No es un formato pensado para CUDA; para GPU NVIDIA habria que reconvertir los pesos.
- Cabe en GPU consumer: si, en el ecosistema Apple Silicon; en NVIDIA consumer requeriria conversion previa a otro runtime.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero, con parser de tool calling y decodificacion especulativa MTP), LM Studio con motor MLX, y mlx-lm (`mlx_lm.generate`).
- Latencia y throughput: medidos con Rapid-MLX y MTP en un solo stream, de 63 a 72 tok/s a 128 tokens, de 63 a 69 a 2.048, de 61 a 66 a 8.192 y de 54 a 57 a 32.768. El autor no detalla el hardware exacto mas alla de un Mac Studio con Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Atlassian-Q4-mlx (este) | 8,95B | No disponible | Ajuste LoRA para Atlassian Forge/Jira/Confluence/JSM, 4-bit MLX | Apache 2.0 | HuggingFace, formato MLX |
| Qwen3.5-9B (base) | 8,95B | No disponible | Modelo generalista | Apache 2.0 | HuggingFace |
| Qwen3.5-9B-Atlassian (8-bit) | 8,95B | No disponible | Mismo ajuste, cuantizacion 8-bit | Apache 2.0 | HuggingFace |
| LeanZero Atlassian 27B (release v0.5) | 27B (aproximado, no confirmado) | No disponible | Mismo dominio, mayor presupuesto de entrenamiento | No disponible | HuggingFace |

Frente al base, el ajuste mejora la sonda de identificadores de Atlassian del 15% al 62% con thinking activado y reduce la no terminacion. Frente al 27B, sacrifica precision (16 frente a 30 aplicaciones completas de 25, con solapamiento por la metrica de mas de 25) a cambio de una huella de memoria mucho menor y una velocidad de decodificacion superior en terminos absolutos de tokens por segundo en el mismo hardware.

## Limitaciones y advertencias

- Solo declara ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- No es un compilador: el autor advierte que debe emparejarse con el validador de manifiestos de Atlassian y con `tsc` contra los tipos reales de `@forge/*`.
- Los hechos de version estan fijados a los tipos `@forge/*` de junio de 2026; pueden quedar obsoletos con actualizaciones de la plataforma.
- Riesgo de alucinacion en hechos de plataforma: la prueba de fugas detecto 26 coincidencias de regex sobre 112 salidas, 21 de ellas clasificadas como alucinadas. La sonda de identificadores post-2026-04 es del 15%, igual que el base, lo que indica que no generaliza a hechos posteriores a esa fecha.
- Bucles y no terminacion: aunque mejor que el base, se observaron 4 bucles genuinos en una de las cuatro piernas de la bateria y tasas de no terminacion de hasta el 18%.
- La cuantizacion 4-bit introduce divergencia respecto al modelo sin cuantizar (KLD top-1024 de 0,1734, top-1 del 90,49%), mayor que la de la variante 8-bit.
- El formato MLX limita el despliegue a Apple Silicon o a runtimes compatibles; no hay pesos GGUF publicados en la informacion disponible.
- El ajuste esta especializado en Atlassian: el rendimiento en tareas generales de codigo o razonamiento puede degradarse respecto al base por sobreajuste al dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la correccion del codigo generado en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina del portfolio con el informe completo: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi (agente de escritorio): https://leanzero.net/portfolio/elzi
- Wheel del motor Rapid-MLX: https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
