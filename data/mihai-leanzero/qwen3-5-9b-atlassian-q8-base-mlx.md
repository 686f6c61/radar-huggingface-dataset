# Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q8-base-mlx

## Resumen

Qwen3.5-9B-Atlassian-Q8-base-mlx es el checkpoint base sin entrenar del modelo Qwen3.5-9B de Qwen, cuantizado a 8 bits en formato MLX (afinidad de grupo 64) por LeanZero (Mihai-LeanZero). No incorpora ningún ajuste fino: es exactamente el modelo base que sirve de punto de partida para el adaptador LoRA `Qwen3.5-9B-Atlassian-lora` y para la versión afinada `Qwen3.5-9B-Atlassian-Q8-mlx`. Incluye como sidecar un fichero `mtp.safetensors` en bf16 con la cabeza de predicción multi-token (MTP), lo que permite decodificación especulativa.

El modelo resuelve un problema de infraestructura más que de capacidades: proporciona una referencia reproducible y cuantizada para aplicar el adaptador Atlassian por cuenta propia o para entrenar un adaptador nuevo sobre la misma base. Está pensado para ejecutarse en Apple Silicon mediante MLX (mlx-lm, LM Studio o el fork Rapid-MLX de LeanZero) y su orientación es claramente vertical: Forge, Jira, Confluence y Jira Service Management.

La relevancia actual es doble. Por un lado, documenta con métricas el comportamiento del base sin afinar (probing de identificadores al 15 %, tasas de no terminación del 23-33 % en baterías de bucle), lo que sirve como línea base honesta frente a las versiones afinadas. Por otro, mantiene la cabeza MTP separada, una decisión de ingeniería que permite reutilizar decodificación especulativa sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), receta de cuantización `qwen3_5` de mlx-node; cabeza MTP en sidecar bf16 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64 (MLX); existen variantes Q6 y Q4 en la familia |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` en bf16 |

## Arquitectura y entrenamiento

Se trata de un transformer de la familia Qwen3.5 con 9.409.813.744 parámetros, convertido a MLX con la receta `qwen3_5` de mlx-node a partir de `Qwen/Qwen3.5-9B`. La cuantización es afín de 8 bits con tamaño de grupo 64, el esquema habitual en el ecosistema MLX para Apple Silicon. El repositorio separa la cabeza de predicción multi-token (MTP) en un fichero bf16 independiente, de modo que la decodificación especulativa puede activarse o desactivarse sin afectar a los pesos principales.

Este checkpoint concreto no ha sido entrenado: la model card indica explícitamente «No training». El adaptador Atlassian asociado se entrenó con mlx-lm sobre datos compuestos por aplicaciones Forge escritas por LeanZero, documentación pública para desarrolladores de Atlassian, especificaciones OpenAPI de Atlassian Cloud, un compendio de investigación comunitaria, 220 hilos públicos de la Atlassian Developer Community (pregunta más respuesta aceptada) y una pequeña muestra de código general. Se eliminaron credenciales y se reescribieron hostnames de tenant y direcciones de correo antes del entrenamiento, y se realizaron pruebas de memorización contra una ejecución de control sobre el base sin entrenar. El ajuste se hizo con `reasoning_effort=medium` y `preserve_thinking=false`.

## Capacidades

- Generación de texto conversacional y de código en inglés, heredadas del base Qwen3.5-9B.
- Punto de partida para aplicar el adaptador LoRA Atlassian o para entrenar uno propio sobre la misma base cuantizada.
- Soporte de decodificación especulativa mediante la cabeza MTP incluida como sidecar (aceptación medida del 67 % y aceleraciones de 1,05x a 1,14x en la versión afinada).
- Compatibilidad con parsers de tool calling y razonamiento en Rapid-MLX (`--tool-call-parser qwen3_coder_xml`, `--reasoning-parser qwen3`).
- Modo de razonamiento (thinking) activable, con parámetros de muestreo diferenciados para thinking e instruct.
- Capacidad multilingüe limitada al inglés según la model card.
- No incluye visión ni audio según la información disponible.

## Casos de uso

- Línea base de evaluación: ejecutar este checkpoint como control frente a las versiones afinadas para medir la ganancia real del adaptador Atlassian en pruebas de identificadores, validez de manifiestos y tasas de bucle.
- Entrenamiento de adaptadores propios: al ser el base sin tocar y en 8 bits MLX, sirve para reproducir el pipeline de LeanZero o para entrenar un LoRA específico de otro dominio sobre la misma base.
- Desarrollo de apps Forge con asistencia: aplicando el adaptador correspondiente, el modelo responde preguntas sobre módulos de Forge, Jira, Confluence y JSM; conviene usar thinking para consultas y thinking desactivado para generación de código.
- Despliegue local en Apple Silicon: con 12,8 GB de repositorio y cuantización de 8 bits, es viable en un Mac Studio o en equipos con memoria unificada suficiente, mediante LM Studio (motor MLX) o mlx-lm.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP en sidecar permite experimentar con `num_speculative_tokens` y medir aceptación sin tocar los pesos principales.
- Validación de pipelines de CI para plugins de Atlassian: combinado con un validador de manifiestos y `tsc`, puede integrarse en flujos de revisión de código generado, tal como recomienda el autor.
- Investigación sobre cuantización: comparar la fidelidad del 8 bits MLX frente al base en bf16 usando las métricas de KLD y top-1 publicadas para la variante afinada.

## Benchmarks y rendimiento

Los datos publicados corresponden al base sin entrenar y a la versión afinada de 9B y 27B; se reproducen a continuación los del base y su comparación.

| Test | Base 9B sin tocar | 9B afinado | 27B release (T4) |
|---|---|---|---|
| Identificadores pre/post, thinking on | 15 % / 15 % | 62 % / 15 % | 69 % / 23 % |
| Identificadores, thinking off (servido) | n/a | 69 % / 38 % | 62 % / 31 % |
| Manifiestos válidos (de 25) | n/a | 19 | 14 |
| App completa supera todas las puertas (de 25) | n/a | 16 | 12 |
| Bucles por tramo | 0 / 0 / 5 / 3 | 0 / 0 / 4 / 0 | 0 / 0 / 1 / 0 |
| No terminación por tramo | 28 / 23 / 33 / 23 % | 18 / 8 / 13 / 0 % | 25 / 15 / 28 / 12 % |
| Fusionado 8-bit vs base+adapter: KLD / top-1 | - | 0,0537 / 99,14 % | 0,0407 / 99,43 % |
| Aceptación MTP / aceleración | - | 67 % / 1,14x, 1,09x, 1,08x, 1,05x | 51 % / 1,26x, 1,38x, 1,34x, 1,21x |
| Carga en LM Studio | - | PASS | PASS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 12,8 GB; en inferencia con 8 bits MLX se requiere aproximadamente esa cifra de memoria unificada, más overhead del runtime y de la caché KV.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; el autor lo ejecutó en un único Mac Studio. No se documenta soporte para A100, H100 o RTX 4090 en la información disponible.
- GPU de consumo: viable en equipos Apple con al menos 16 GB de memoria unificada; las variantes Q6 y Q4 de la familia reducen el requisito.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero, con parser `qwen3_coder_xml`, parser de razonamiento `qwen3` y configuración especulativa MTP), LM Studio con motor MLX y mlx-lm (`mlx_lm.generate`).
- Latencia y throughput: no disponibles de forma absoluta; sí se documentan aceleraciones relativas por decodificación especulativa de 1,05x a 1,14x con aceptación del 67 % en la versión afinada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Atlassian-Q8-base-mlx | 9,41 B | no disponible | Base sin entrenar, MLX 8 bits | Apache-2.0 | HuggingFace, MLX |
| Qwen3.5-9B-Atlassian-Q8-mlx | 9,41 B | no disponible | Afinado Atlassian, MLX 8 bits | Apache-2.0 | HuggingFace, MLX |
| Qwen3.5-9B-Atlassian-Q6-mlx / Q4-mlx | 9,41 B | no disponible | Afinado Atlassian, cuantización menor | Apache-2.0 | HuggingFace, MLX |
| Qwen3.8-27B-Atlassian-Q8-mlx | 27 B (aprox.) | no disponible | Afinado Atlassian, mayor tamaño | Apache-2.0 | HuggingFace, MLX |

Frente a la versión afinada de 9B, este checkpoint rinde peor en identificadores (15 % frente a 62 % con thinking) y presenta más bucles y no terminación, lo que confirma que la ganancia proviene del adaptador. Frente al 27B, ofrece menor calidad pero una huella de memoria mucho menor.

## Limitaciones y advertencias

- No es un modelo afinado: no conoce Forge, Jira, Confluence ni JSM mejor que el base Qwen3.5-9B; para tareas Atlassian debe aplicarse el adaptador o usarse la versión afinada.
- Tasas de no terminación elevadas en el base (28 %, 23 %, 33 % y 23 % por tramo) y presencia de bucles (5 y 3 en dos tramos), lo que exige timeouts y límites de generación en producción.
- Solo inglés; no se documenta soporte multilingüe.
- El autor advierte que el modelo no es un compilador: debe combinarse con un validador de manifiestos y `tsc`.
- Los hechos sobre versiones están fijados a la ola de `@forge/*` de junio de 2026 y pueden quedar obsoletos.
- Entrenado con `reasoning_effort=medium`; no se documenta comportamiento con otros niveles.
- Riesgo de alucinación inherente al base, sin mitigaciones específicas en este checkpoint.
- Licencia Apache-2.0 heredada del base, que permite uso comercial; conviene verificar las condiciones del base original.
- Dependencia del ecosistema MLX y Apple Silicon: no hay pesos GGUF ni soporte documentado para CUDA en la información disponible.
- El repositorio incluye un sidecar MTP en bf16 que debe gestionarse por separado; su omisión desactiva la decodificación especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q8-base-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Write-up completo de LeanZero: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Elzi: https://leanzero.net/portfolio/elzi
- Migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Wheel del motor Rapid-MLX: https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
