# changh95/qwen3.8-27b-dflash2-p300x2

## Resumen

`changh95/qwen3.8-27b-dflash2-p300x2` no es un modelo entrenado desde cero, sino un paquete de despliegue (contenedor Docker más manifiesto) que sirve el modelo denso Qwen3.8-27B sobre dos placas Tenstorrent P300, es decir, cuatro chips Blackhole en paralelo tensorial de cuatro vías, a través de vLLM con el plugin `vllm-tt-plugin`. Lo publica el usuario changh95 con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y los pesos objetivo no se incluyen en el repositorio: se descargan aparte desde `Qwen/Qwen3.8-27B` en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

Su interés técnico está en la decodificación especulativa DFlash2 (borrador `incoai/Qwen3.8-27B-DFlash2`, siete borradores verificados por paso, decodificación voraz, implementada dentro del modelo mediante el contrato de salida por bloques del plugin de Tenstorrent). El autor declara entre 41 y 84 tok/s en peticiones de chat (media de 56 sobre siete prompts; unos 45 en prosa y unos 80 en código) frente a 32,6 tok/s de la decodificación normal en la misma máquina, con un TTFT de 0,18 s frente a 0,11 s en prompts de unos 75 tokens. El modelo base es un transformer híbrido Gated-DeltaNet más atención con compuerta, denso, de 27 000 millones de parámetros, orientado a razonamiento y con 262 144 tokens de contexto.

El repositorio tiene 0 descargas y 0 likes, y no declara licencia, idiomas ni pipeline, por lo que se trata de un artefacto de infraestructura muy específico de hardware Tenstorrent más que de un modelo listo para producción general. Su relevancia es acotada: demuestra que un modelo de razonamiento de 27B con contexto de 256K puede servirse con latencia interactiva sobre aceleradores que no son GPU NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet (DeltaNet con compuerta) más atención con compuerta; modelo denso orientado a razonamiento |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (max_model_len declarado en ambos perfiles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia; los pesos base de Qwen tienen licencia propia no especificada en esta información) |
| Formato de pesos | No disponible (los pesos objetivo se descargan de `Qwen/Qwen3.8-27B`, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, fuera de la imagen Docker) |
| Autor / repositorio | changh95, `changh95/qwen3.8-27b-dflash2-p300x2` |
| Tamaño del repositorio | 7,6 GB |
| Hardware de servicio | Dos placas Tenstorrent P300 (p300x2), 4 chips Blackhole, malla P150x4, paralelismo tensorial de 4 vías |
| Borrador especulativo | `incoai/Qwen3.8-27B-DFlash2`, revisión `dedf8df68adfb1afeaf7b7480c0a0243108177b4` (descarga adicional) |
| Perfiles de servicio | `single-user-dflash2` (por defecto, max_num_seqs 1) y `batch32` (max_num_seqs 32) |
| Stack de software | vLLM v0.26.0, vllm-tt-plugin `751ec33573aa30be03f8a9bda8d36a3cd3259158`, tt-metal `0ffe5d69ddb84459a631077ad71c9e6f7d71262c`, tt-model-manager 0.1.0 (manifiesto 5.1) |
| Fecha de construccion | 2026-09-12T12:58:00+00:00 |
| Digest de `code/` | `fc79412a49ccf5d0` (sha256, primeros 16 dígitos hex) |

## Arquitectura y entrenamiento

El modelo servido es Qwen3.8-27B, un transformer híbrido que combina capas Gated-DeltaNet (atención lineal con estado recurrente y compuerta) con capas de atención con compuerta, en configuración densa de 27 000 millones de parámetros y con ventana de 262 144 tokens. Está etiquetado como modelo de razonamiento, lo que implica que genera cadenas de razonamiento internas antes de la respuesta final. La información disponible no describe la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras fases de alineamiento: esos datos no están disponibles en este repositorio, que solo empaqueta la inferencia.

La innovación destacable está en el plano del servicio, no del entrenamiento. El plugin de Tenstorrent para vLLM expone un contrato de salida por bloques que permite implementar decodificación especulativa «model-internal»: un borrador DFlash2 (block-diffusion) propone siete borradores por paso que el modelo objetivo verifica, con política voraz y reproducción token a token de la trayectoria voraz del modelo objetivo. El borrador solo ve una ventana de 2048 tokens, de modo que con prompts largos acepta menos borradores por paso, aunque sigue superando a la decodificación normal (58 tok/s con prompts de 4K, 43 tok/s con 16K). Los prompts largos recurren a un prefill troceado y, en el perfil por defecto, a un prefill «eager» no trazado. El despliegue usa paralelismo tensorial de cuatro vías sobre cuatro chips Blackhole.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un modelo de razonamiento denso de 27B; el paquete no modifica sus capacidades, solo su ejecución.
- Generación de código: es el caso con mayor rendimiento declarado, en torno a 80 tok/s en el perfil `single-user-dflash2`.
- Procesamiento de contexto largo: hasta 262 144 tokens de ventana declarados, con decodificación especulativa mantenida incluso en prompts de 16K (43 tok/s medidos en la demo).
- Servicio multiusuario: el perfil `batch32` atiende hasta 32 usuarios concurrentes en decodificación normal.
- Muestreo completo: disponible únicamente en el perfil `batch32`.
- Salida determinista: el perfil por defecto reproduce la trayectoria voraz del modelo objetivo, verificado token a token en el dispositivo frente a decodificación voraz normal.
- Servidor compatible con la API de OpenAI en el puerto 20000 (o el siguiente puerto libre).
- Capacidades rechazadas o neutralizadas en el perfil por defecto: `logprobs`, salidas estructuradas, `min_p`, `logit_bias` y prompts multimodales. `temperature` y parámetros afines solo afectan al primer token de la respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente (el modelo base está etiquetado como de razonamiento, pero el paquete no documenta integración de agentes).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo pensamiento explícito): los prompts multimodales se rechazan en el perfil por defecto; el resto no está documentado.

## Casos de uso

- Asistente de programación autohospedado: con unos 80 tok/s declarados en código, el perfil `single-user-dflash2` es adecuado para un desarrollador que trabaja contra un endpoint compatible con OpenAI en su propia infraestructura, sin depender de GPU NVIDIA.
- Continuación y redacción sobre documentos extensos: la ventana de 262 144 tokens permite cargar informes o bases de código completas; en la demo de continuación de documento DFlash2 alcanza 103,7 tok/s frente a 94,2 tok/s del borrador MTP integrado.
- Resumen y análisis de expedientes largos en local: con prompts de 4K a 16K el sistema mantiene 58 y 43 tok/s respectivamente, suficiente para procesar lotes de documentos con una sola petición simultánea.
- Servicio interno de chat multiusuario: el perfil `batch32` permite hasta 32 conversaciones concurrentes con soporte completo de muestreo, adecuado para un equipo o departamento pequeño con requisitos de confidencialidad.
- Inferencia con soberanía de datos sobre aceleradores no NVIDIA: organizaciones que ya operan placas Tenstorrent P300 pueden desplegar un modelo de razonamiento de 27B sin incorporar GPU CUDA a su infraestructura.
- Verificación de pipelines de decodificación especulativa: dado que la salida del perfil por defecto se verificó token a token contra decodificación voraz normal en el dispositivo, sirve como referencia para validar implementaciones propias de decodificación especulativa.
- Generación de documentación técnica y changelogs: tareas de escritura en prosa a unos 45 tok/s, con contexto largo para incluir el historial completo de un repositorio o de una API.
- Preprocesado por lotes no interactivo: el perfil `batch32` con decodificación normal puede usarse para clasificación, extracción o reescritura masiva cuando la latencia por token no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Lo único que aporta la model card son mediciones de throughput y latencia del propio autor, recogidas en la tabla siguiente y no comparables entre filas sin atender a su configuración.

| Medicion | Configuracion | Valor declarado |
|---|---|---|
| Throughput en chat | `single-user-dflash2` con DFlash2, 7 borradores por paso | 41-84 tok/s (media 56 sobre 7 prompts) |
| Throughput en prosa | `single-user-dflash2` con DFlash2 | ~45 tok/s |
| Throughput en código | `single-user-dflash2` con DFlash2 | ~80 tok/s |
| Throughput con prompt de 4K | `single-user-dflash2` con DFlash2 | 58 tok/s |
| Throughput con prompt de 16K | `single-user-dflash2` con DFlash2 | 43 tok/s |
| Throughput en decodificación normal | Misma máquina, sin especulación | 32,6 tok/s |
| TTFT | `single-user-dflash2` con DFlash2, prompts de ~75 tokens | 0,18 s |
| TTFT | Decodificación normal, prompts de ~75 tokens | 0,11 s |
| Continuación de documento (demo) | DFlash2 (demo `text_demo.py`, `-k "traced_128 and not traced_128k and not g8"`) | 103,7 tok/s |
| Continuación de documento (demo) | Borrador MTP integrado | 94,2 tok/s |
| Concurrencia | `batch32` | Hasta 32 usuarios; throughput no disponible |

## Requisitos de hardware

- Hardware obligatorio: dos placas Tenstorrent P300 (p300x2), equivalentes a 4 chips Blackhole, con malla P150x4 y paralelismo tensorial de 4 vías. No se documenta soporte para GPU NVIDIA, AMD ni CPU.
- VRAM estimada para inferencia: no disponible. El paquete no declara memoria por chip ni cuantización empleada. A título orientativo y como estimación aritmética estándar no confirmada por la model card, 27 000 millones de parámetros en 16 bits ocuparían en torno a 54 GB de pesos, repartidos entre los cuatro chips.
- GPU recomendadas: no aplica; el artefacto está empaquetado exclusivamente para Tenstorrent Blackhole/P300.
- Cabe en GPU de consumo: no aplica, porque no se ejecuta sobre GPU.
- Opciones de despliegue: `tt-model pull changh95/qwen3.8-27b-dflash2-p300x2 --with-weights` y `tt-model serve` (Docker más tt-model-manager 0.1.0). El servidor expone una API compatible con OpenAI en el puerto 20000. Se puede seleccionar perfil con `--profile batch32`.
- Descargas adicionales necesarias: `hf download incoai/Qwen3.8-27B-DFlash2 --revision dedf8df68adfb1afeaf7b7480c0a0243108177b4` para el borrador, además de los pesos objetivo. El contenedor monta la caché de HuggingFace en `/hf`.
- Tiempo de arranque: el primer inicio compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia y throughput: TTFT de 0,18 s con DFlash2 y 0,11 s en decodificación normal para prompts de unos 75 tokens; 41-84 tok/s en el perfil de un solo usuario y 32,6 tok/s en decodificación normal. No hay datos de throughput agregado para el perfil `batch32`.
- Parámetros de ajuste: `QWEN36_DFLASH_SERVE_BLOCK` (32 por defecto, tokens confirmados por paso de vLLM), `QWEN36_DFLASH_MAX_PROMPT` (2048 por defecto, prompt máximo que usa prefill enmascarado de una pasada) y `QWEN36_DRAFTER=mtp`, que según la model card desactiva la especulación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada, por lo que la comparación se limita a configuraciones del mismo artefacto y al modelo base. Los modelos alternativos de la misma categoría (por ejemplo, otros modelos de razonamiento densos de ~27B servidos en GPU con vLLM) no están documentados aquí: no disponible.

| Configuracion | Hardware | Decodificacion | Throughput | Concurrencia |
|---|---|---|---|---|
| `single-user-dflash2` con DFlash2 | p300x2 (4 Blackhole, TP=4) | Especulativa, 7 borradores por paso, voraz | 41-84 tok/s (media 56) | 1 |
| `single-user-dflash2` con borrador MTP | p300x2 | Especulativa con MTP integrado | 94,2-103,7 tok/s en la demo de continuación de documento | 1 |
| `batch32` | p300x2 | Normal | No disponible | Hasta 32 |
| Decodificación normal (referencia) | p300x2 | Normal | 32,6 tok/s | 1 |
| `Qwen/Qwen3.8-27B` en vLLM sobre GPU | GPU no especificada | Depende del despliegue | No disponible | No disponible |

| Aspecto | Este paquete | Modelo base `Qwen/Qwen3.8-27B` |
|---|---|---|
| Parametros | 27B densos | 27B densos |
| Contexto | 262 144 tokens | No disponible en esta información |
| Licencia | No declarada | No declarada en esta información |
| Disponibilidad | Contenedor para Tenstorrent P300, 0 descargas | Pesos en HuggingFace, revisión fijada |
| Valor añadido | Decodificación especulativa DFlash2 y perfiles de servicio | Pesos originales |

## Limitaciones y advertencias

- No es un modelo nuevo: es un contenedor de despliegue. Cualquier mejora de calidad respecto al modelo base es inexistente; solo cambia el rendimiento de inferencia.
- Dependencia total de hardware Tenstorrent: requiere dos placas P300 (4 chips Blackhole). No hay ruta de ejecución en GPU NVIDIA, AMD ni CPU documentada.
- Licencia no declarada en el repositorio. Esto impide conocer si el uso comercial está permitido y qué obligaciones de atribución aplican; los pesos base de Qwen tienen su propia licencia, no detallada aquí. Es un riesgo legal directo para producción.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas con los que se entrenó el modelo base.
- El perfil por defecto es voraz: `temperature` y el resto de parámetros de muestreo solo afectan al primer token de la respuesta. No sirve para tareas que requieran diversidad de muestras.
- El perfil por defecto rechaza o neutraliza `logprobs`, salidas estructuradas, `min_p`, `logit_bias` y prompts multimodales. Si el caso de uso depende de JSON estricto o de puntuaciones de probabilidad, hay que usar `batch32` y renunciar a la especulación.
- El borrador solo ve una ventana de 2048 tokens, por lo que la tasa de aceptación cae con prompts largos; además, con prompts largos se paga un prefill «eager» no trazado.
- Riesgo de alucinación: inherente a un modelo generativo de 27B; la model card no aporta tasas de error, evaluaciones de fidelidad ni datos de sesgo.
- Sesgos conocidos: no disponibles.
- Sin validación comunitaria: 0 descargas y 0 likes en la fecha de creación (2026-09-12), por lo que no hay evidencia externa de funcionamiento.
- Primer arranque lento: la compilación de kernels para el dispositivo tarda varios minutos, lo que complica el escalado elástico y los despliegues con arranques frecuentes.
- Divergencia posible frente a un servidor vLLM convencional: cuando los dos logits superiores del modelo objetivo están casi empatados, la trayectoria voraz puede diferir de la de un despliegue estándar.
- El repositorio ocupa 7,6 GB y los pesos se descargan aparte, además de un tercer artefacto obligatorio (el borrador DFlash2), lo que complica la gestión de caché y versiones.
- Fechas declaradas en 2026 tanto para la creación como para la actualización del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/changh95/qwen3.8-27b-dflash2-p300x2
- Pesos del modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Modelo borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2 (revisión `dedf8df68adfb1afeaf7b7480c0a0243108177b4`)
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager (versión 0.1.0)
- Plugin de vLLM para Tenstorrent: https://github.com/changh95/vllm-tt-plugin (commit `751ec33573aa30be03f8a9bda8d36a3cd3259158`)
- Commit de tt-metal: https://github.com/tenstorrent/tt-metal/commit/0ffe5d69ddb84459a631077ad71c9e6f7d71262c
- Versión de vLLM: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos correspondían a portales corporativos ajenos (Conti Portal, Contipark) y no se han incluido.
