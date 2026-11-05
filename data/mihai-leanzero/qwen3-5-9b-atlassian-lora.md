# Mihai-LeanZero/Qwen3.5-9B-Atlassian-lora

## Resumen

Qwen3.5-9B-Atlassian-lora es un adaptador LoRA de rango 32 (escala 2.0) publicado por LeanZero sobre el modelo base Qwen/Qwen3.5-9B. Su proposito es especializar un modelo de 9B en el ecosistema Atlassian: desarrollo de apps Forge, administracion de Jira, Confluence y Jira Service Management (JSM), incluyendo la generacion de manifiestos `manifest.yml` validos y codigo UI Kit que compile contra los tipos reales de `@forge/*`. El adaptador se distribuye empaquetado para la libreria MLX de Apple, de modo que se ejecuta sobre el modelo base cuantizado a 8 bits (`Qwen3.5-9B-Atlassian-Q8-base-mlx`) en hardware Apple Silicon.

El modelo resuelve un problema concreto: los LLM genericos desconocen los identificadores, modulos, scopes y restricciones de la plataforma Forge, y producen manifiestos que fallan la validacion de Atlassian o codigo que no compila. LeanZero entreno el adaptador con documentacion de Forge, especificaciones OpenAPI de Atlassian, hilos de la comunidad de desarrolladores y pares de correccion generados por rejection sampling, midiendo la mejora con pruebas propias de identificadores, forma de apps Forge y deteccion de bucles.

Es relevante porque demuestra una via practica de especializacion vertical sobre un modelo pequeno (9B) con un presupuesto de entrenamiento modesto (dos epocas, 4300 pasos), obteniendo mejoras sustanciales en un dominio tecnico acotado y manteniendo un coste de memoria muy inferior al de la variante de 27B de la misma familia. La version publicada es la v0.5 de la familia; este miembro de 9B no ha cambiado desde la ronda v0.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-9B) con adaptador LoRA de rango 32 y escala 2.0 |
| Parametros totales | 9B (modelo base); el adaptador LoRA es un subconjunto de pesos de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3.5-9B la define; las pruebas de velocidad se realizaron hasta 32768 tokens) |
| Tipos de cuantizacion | 8 bits (Q8) en el modelo base empaquetado para MLX; el adaptador se aplica sobre esa base |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (libreria `mlx`, compatible con mlx-lm y LM Studio con motor MLX); tamano del repo 0.1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer decoder-only de 9B parametros. El LoRA tiene rango 32 y escala 2.0, y se sirve junto al modelo base cuantizado a 8 bits mediante MLX. El entrenamiento se realizo con mlx-lm en un unico Apple Silicon Mac Studio, con `reasoning_effort=medium` y `preserve_thinking=false`.

La ronda 1 consistio en dos epocas completas (4300 pasos, learning rate 5e-5) sobre la mezcla m7 de la ronda 4 del modelo de 27B: 18.189 muestras, aproximadamente 6,1 millones de tokens. La composicion incluye doce apps Forge escritas por LeanZero y cinco fixtures de forge-sim; manifiestos generados por esquema y validados con el validador de Atlassian; ejemplos de UI Kit que compilan con `@forge/react` 12; la documentacion de Forge como texto y como pares pregunta-respuesta con control de literalidad; hechos de endpoints y scopes extraidos de seis especificaciones OpenAPI de Atlassian; el compendio de investigacion comunitaria de LeanZero y respuestas publicadas; 220 hilos publicos de la Atlassian Developer Community; apps del modelo de 27B que pasaron las puertas de calidad en dos rondas de rejection sampling (431 y 937); 362 pares de correccion validados; y una porcion de replay de codigo general.

Una segunda ronda, entrenada sobre la mezcla v0.4 del modelo de 27B, obtuvo 18 de 25 apps completas y 19 de 25 manifiestos, por debajo del umbral de publicacion de 20/20, y no se publico. La perdida de validacion medida es 0,575 sobre su mezcla de entrenamiento y 0,959 sobre la mezcla de la ronda 1 del modelo de 27B. La fusion a 8 bits del adaptador con la base conserva la calidad del par base+adaptador con una KLD top-1024 de 0,0537 y un top-1 del 99,14% sobre 200 prompts.

## Capacidades

- Generacion de manifiestos `manifest.yml` para apps Forge validos segun el validador oficial de Atlassian.
- Generacion de apps Forge completas a partir de un brief de una linea, incluyendo codigo UI Kit compatible con los tipos reales de `@forge/*`.
- Conocimiento de identificadores, modulos, endpoints y scopes de Forge, Jira, Confluence y Jira Service Management, con especial rendimiento en hechos anteriores a abril de 2026.
- Respuesta a preguntas tecnicas sobre la plataforma Forge y su documentacion, en modo thinking y en modo instruct.
- Soporte de tool calling con el parser `qwen3_coder_xml` en el motor Rapid-MLX.
- Soporte de modo razonamiento (thinking) con el parser `qwen3`, entrenado con esfuerzo de razonamiento medio.
- Decodificacion especulativa mediante MTP (multi-token prediction) en Rapid-MLX, con aceptacion de borradores del 67%.
- Generacion de texto general y codigo, gracias a la porcion de replay de codigo general incluida en el entrenamiento.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Generacion de manifiestos Forge en pipelines de desarrollo: el modelo produce `manifest.yml` que pasan el validador de Atlassian en 19 de 25 intentos con thinking desactivado, lo que permite integrarlo como paso de generacion previa a la validacion en CI.
- Scaffolding de apps Forge: a partir de un brief de una linea genera una app completa con UI Kit; 16 de 25 apps compilan ademas con `tsc` contra los tipos reales de `@forge/*`, lo que reduce el trabajo inicial de andamiaje.
- Asistente de desarrollo en el IDE o en una app de escritorio: el adaptador se integra en Elzi (agente de escritorio de LeanZero) a traves de Rapid-MLX, respondiendo preguntas sobre modulos, scopes y endpoints de Forge sin salir del entorno local.
- Consulta de documentacion tecnica de Atlassian: responde preguntas sobre la plataforma con un 62% de acierto en la sonda de identificadores con thinking activado, frente al 15% del base, lo que lo hace util como asistente de referencia para equipos de plataforma.
- Administracion y automatizacion de Jira, Confluence y JSM: el entrenamiento incluye hechos de endpoints y scopes de seis especificaciones OpenAPI, lo que permite asistir en la configuracion de integraciones y en la resolucion de dudas sobre permisos.
- Generacion de codigo de integracion con Jira Service Management: el modelo conoce los modulos y scopes de JSM y puede proponer fragmentos de codigo y configuracion para flujos de servicio.
- Despliegue local en hardware Apple Silicon: al ejecutarse sobre MLX con el base a 8 bits, cabe en un Mac Studio y en equipos con memoria unificada suficiente, sin necesidad de GPU dedicada, lo que facilita entornos de desarrollo aislados o con requisitos de privacidad.
- Correccion de manifiestos y codigo existentes: los 362 pares de correccion del entrenamiento le permiten detectar y reparar errores tipicos de validacion en manifiestos y en el uso de modulos Forge.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion propia de LeanZero, no de benchmarks academicos estandar.

| Prueba | Base 9B sin ajustar | 9B ajustado | 27B release (v0.5) |
|---|---|---|---|
| Identificadores Atlassian, pre/post 2026-04, thinking on | 15% / 15% | 62% / 15% | 85% / 15% |
| Identificadores, thinking off (servido) | n/a | 69% / 38% | 85% / 31% |
| Manifiestos validos (de 25) | n/a | 19 | 31,3 |
| App completa que pasa todas las puertas (de 25) | n/a | 16 | 30,0 |
| Bucles por pierna de muestreo | 0 / 0 / 5 / 3 | 0 / 0 / 4 / 0 | 0 / 0 / 1 / 0 |
| No terminacion por pierna | 28 / 23 / 33 / 23% | 18 / 8 / 13 / 0% | 38 / 30 / 35 / 13% |
| Fusion 8 bits vs base+adaptador: KLD / top-1 | - | 0,0537 / 99,14% | 0,0339 / 99,56% |
| Aceptacion MTP / aceleracion | - | 67% / 1,14x, 1,09x, 1,08x, 1,05x | 58% / 1,45x, 1,38x, 1,38x, 1,27x |
| Carga en LM Studio | - | PASS | PASS |

La sonda de fuga (leak probe) sobre 112 salidas no detecto filtraciones: 0 fugas, con 26 coincidencias de regex clasificadas como alucinaciones (21) y tokens alucinados (5). La aceleracion MTP se midio en Rapid-MLX con un solo flujo: 63 a 72 tok/s (1,14x) a 128 tokens, 63 a 69 tok/s (1,09x) a 2048, 61 a 66 tok/s (1,08x) a 8192 y 54 a 57 tok/s (1,05x) a 32768.

## Requisitos de hardware

- Inferencia sobre Apple Silicon con MLX; el adaptador se sirve junto al base cuantizado a 8 bits, con un repo de 0,1 GB para el adaptador.
- Entrenado, servido y evaluado en un unico Apple Silicon Mac Studio, lo que confirma que el modelo completo cabe en la memoria unificada de ese equipo.
- No se especifica la VRAM exacta ni el minimo de memoria unificada en la informacion proporcionada; para el base de 9B a 8 bits es previsible que quepa en configuraciones de memoria unificada de gama alta de Apple Silicon, pero el dato no esta confirmado.
- No hay datos de despliegue en GPU NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada; el formato MLX no es directamente compatible con vLLM, TGI o llama.cpp sin conversion.
- Opciones de despliegue documentadas: Rapid-MLX (fork de LeanZero, con parsers `qwen3_coder_xml` y `qwen3` y decodificacion especulativa MTP), LM Studio con motor MLX y mlx-lm (con y sin adaptador).
- Rendimiento medido en Rapid-MLX: 63 a 72 tok/s en decodificacion con MTP segun longitud de contexto; sin MTP, la velocidad base ronda los 63 tok/s a 128 tokens y 54 tok/s a 32768.
- El adaptador requiere descarga local previa, ya que mlx-lm resuelve adaptadores solo desde una carpeta local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tareas Forge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Atlassian-lora (este) | 9B + LoRA r32 | no disponible | 19/25 manifiestos, 16/25 apps completas, 62% identificadores (thinking on) | Apache 2.0 | HuggingFace, formato MLX |
| Qwen3.5-9B-Atlassian, miembro 27B de la familia | 27B | no disponible | 31,3/25 manifiestos, 30,0/25 apps completas, 85% identificadores | Apache 2.0 | HuggingFace, formato MLX |
| Qwen/Qwen3.5-9B (base sin ajustar) | 9B | no disponible | 15% identificadores, sin datos de manifiestos | Apache 2.0 | HuggingFace |
| Alternativas genericas de 9B para codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible dentro de la familia LeanZero y contra el base, ya que el autor no publica comparaciones con otros modelos especializados en Atlassian. No se dispone de datos de benchmarks academicos (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- El modelo esta especializado en ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- La sonda de identificadores cae al 15% en hechos posteriores a abril de 2026, igual que el base: el conocimiento de la plataforma tiene una fecha de corte y no se actualiza con cambios recientes de Atlassian.
- No es un compilador: el autor advierte explicitamente que debe combinarse con el validador de manifiestos de Atlassian y con la compilacion real contra los tipos de `@forge/*` antes de usar el codigo en produccion.
- Tasa de exito limitada: 19 de 25 manifiestos validos y 16 de 25 apps completas que compilan, con thinking desactivado; no es adecuado para generacion sin supervision.
- El modelo presenta no terminacion en algunas piernas de muestreo (18%, 8%, 13% y 0%) y bucles genuinos ocasionales (4 en una de las cuatro piernas), aunque mejora al base en todas las piernas.
- Riesgo de alucinacion en identificadores y tokens: la sonda de fuga detecto 21 alucinaciones y 5 tokens alucinados sobre 112 salidas, aunque ninguna fuga de datos de entrenamiento.
- Dependencia del ecosistema MLX y de Apple Silicon: no hay soporte documentado para vLLM, TGI, llama.cpp ni GPUs NVIDIA, lo que limita el despliegue en infraestructura convencional.
- El adaptador requiere descarga local y no se resuelve directamente desde el hub con mlx-lm; el flujo de despliegue es mas manual que el de un modelo empaquetado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B tiene sus propios terminos que deben verificarse por separado.
- El autor no publica resultados de benchmarks academicos estandar, por lo que la evaluacion de capacidades generales fuera del dominio Atlassian es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.5-9B-Atlassian-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina del portfolio de modelos Atlassian de LeanZero: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner (reglas de workflow con IA para Jira): https://leanzero.net/portfolio/cognirunner
- Sentinel Vault (gobernanza de adjuntos en Confluence): https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management (PPM para Jira Cloud): https://leanzero.net/portfolio/leanzero-management
- Servicios de migracion Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi (app de escritorio con agente): https://leanzero.net/portfolio/elzi
- Wheel del motor Rapid-MLX: https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
