# lued/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw-abliterated-overlay

## Resumen

DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw-abliterated-overlay es un "overlay" (injerto) abliterated sobre una cuantización MLX a 3.0 bpw de DeepSeek-V4.1-Flash-1017, publicado por el usuario lued en Hugging Face. No es un modelo completo: se trata de un sidecar de 1,09 GB que reescribe 26 proyecciones de salida de atención (`layers.10–35.attn.wo_b`) dentro del pack base de ddalcu, dejando el resto de pesos intactos. Su propósito es eliminar el comportamiento de rechazo del modelo base (abliteration), pasando de un 9 % de cumplimiento en prompts dañinos a un 100 %.

El modelo base es una variante MoE de la familia DeepSeek (etiquetas `deepseek_v41`, `moe`, `dspark`, `engram`) cuantizada con iQ-MLX a 3.0 bits por peso, pensada para ejecutarse en Mac con memoria unificada mediante el motor `mlx-serve`. El resultado es un modelo sin guardrails, con soporte de contexto muy largo (verificado con pruebas de aguja hasta 228.383 tokens), visión, tool calling y decodificación especulativa MTP.

Es relevante porque demuestra una técnica de abliteración quirúrgica y medible: en lugar de reentrenar o publicar los ~398 GiB del pack completo, el autor distribuye solo el diff, con métricas de fidelidad (KL) y de capacidades documentadas. Su uso está restringido éticamente a entornos personales y de investigación; el propio README advierte de que elimina un comportamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (familia DeepSeek V4.1-Flash), con MTP (decodificación especulativa multi-token) |
| Parametros totales | no disponible (el pack base completo pesa ~398 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | al menos 228.383 tokens (verificado con pruebas needle; valor máximo no disponible) |
| Tipos de cuantizacion | iQ-MLX 3.0 bpw (modelo base); overlay como sidecar safetensors de 1,09 GB |
| Idiomas soportados | inglés, chino |
| Licencia | MIT (heredada del pack base) |
| Formato de pesos | safetensors (MLX, mediante mlx-serve) |

Nota: el tamaño del repo del overlay es de 2,2 GB; el proceso de aplicación requiere descargar el pack base (~398 GiB) y ocupa ~22 GiB adicionales durante el graft.

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, una arquitectura MoE de la familia DeepSeek con soporte de decodificación especulativa MTP (multi-token prediction), que según las mediciones del autor multiplica el throughput por más de dos (de 57,1 a 124,3 tok/s, +117,7 %). Las etiquetas `dspark` y `engram` sugieren componentes técnicos propios de la variante, aunque la model card no detalla su funcionamiento. El modelo incluye además capacidades de visión y un vocabulario de 129.280 tokens.

El overlay en sí no implica entrenamiento tradicional: es un injerto (graft) con λ=2,0 sobre las proyecciones `attn.wo_b` de las capas 10 a 35, con dirección derivada del modelo `drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated`. La edición se recalcula (no se copia) para el pack base concreto, anclada a la revisión `74cca9ac` del repositorio de ddalcu. No hay datos sobre datos de entrenamiento, número de tokens ni RLHF/DPO del modelo original en la información disponible.

## Capacidades

- Generación de texto general en inglés y chino, con modo de razonamiento (thinking) conmutable (verificado en on/off).
- Contexto muy largo: pruebas de aguja (needle) superadas a 75.447, 151.915 y 228.383 tokens.
- Visión: verificado con pruebas de identificación de colores (magenta, azul, verde).
- Tool calling: llamado a herramientas y continuación fundamentada (grounded) funcionales tras el injerto.
- Decodificación especulativa MTP: 124,3 tok/s con draft aceptado, sin regresión respecto al base.
- Sin guardrails: cumple el 100 % de los prompts dañinos estándar (JailbreakBench) y elimina el sobre-rechazo del base (11 % → 0 %) en prompts benignos.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el overlay con métricas KL publicadas es material de estudio para técnicas de abliteration, con documentación detallada del método y mediciones.
- Investigación en desactivación selectiva de refusals: permite estudiar el compromiso entre fidelidad al base (KL 0,0915) y eliminación de rechazos sin reentrenar.
- Procesamiento de documentos muy largos en local: con contexto verificado por encima de 228.000 tokens, sirve para análisis de corpora extensos en hardware Apple Silicon con memoria unificada.
- Asistentes con tool calling en entornos personales sin filtros: soporta llamadas a herramientas y continuación fundamentada, útil para pipelines personales de agentes.
- Generación de código y razonamiento en Mac: la variante Flash con MTP ofrece ~124 tok/s en hardware adecuado, adecuada para asistentes de codificación locales.
- Eliminación de sobre-rechazo en casos legítimos: el injerto corrige el 11 % de falsos rechazos del base en prompts benignos, útil para dominios sensibles (medicina, seguridad) donde los filtros bloquean consultas legítimas.
- Benchmarking de cuantizaciones agresivas (3,0 bpw) con MLX: caso de referencia para evaluar degradación de capacidades en cuantización extrema.

## Benchmarks y rendimiento

Datos publicados por el autor del overlay. Importante: los valores absolutos no son comparables con releases en precisión completa (las evaluaciones se ejecutaron mediante `/v1/completions` sin plantilla de chat); el autor recomienda citar solo los deltas.

| Tarea | Base | Graft λ=2.0 | Delta |
|---|---|---|---|
| GSM8K (400 items) | 64,75 % | 69,75 % | +5,00 pp (z=1,51, no significativo) |
| IFEval prompt-strict (200) | 10,50 % | 15,00 % | +4,50 pp |
| IFEval prompt-loose (200) | 12,50 % | 17,00 % | +4,50 pp |
| IFEval inst-strict (200) | 19,81 % | 21,38 % | +1,57 pp |
| IFEval inst-loose (200) | 21,07 % | 22,64 % | +1,57 pp |

Fidelidad frente al base (KL sobre 200 prompts benignos, 8.762 posiciones):

| Métrica | Graft λ=2.0 |
|---|---|
| First-token KL | 0,0915 (IC 0,060–0,130) |
| KL media (todas las posiciones) | 0,1132 |
| KL mediana | 0,0012 |
| KL p95 | 0,3785 |
| Agreement top-1 | 89,56 % |
| Cambio greedy en prompts benignos | 10,44 % |

Comportamiento en refusals (JailbreakBench, 100 dañinos + 100 benignos, temp 0):

| Conjunto | Base | Graft |
|---|---|---|
| Dañinos: cumplimiento / refusal | 9 / 91 | 100 / 0 |
| Benignos: cumplimiento / refusal | 89 / 11 | 100 / 0 |

Throughput con MTP: 57,1 → 124,3 tok/s (+117,7 %), sin cambios respecto al base.

## Requisitos de hardware

- Memoria: el README indica como requisito un Mac con 256 GiB de memoria unificada para servir el pack completo (el pack base pesa ~398 GiB en disco, lo que sugiere que solo una parte se carga en memoria o que se requieren técnicas de offload; el detalle exacto no está disponible).
- GPU recomendada: Apple Silicon de gama alta (sistema con 256 GiB de memoria unificada); no se menciona soporte para GPU NVIDIA en esta variante MLX.
- Consumer GPU: no aplicable directamente; esta variante está dirigida a Mac con memoria unificada, no a tarjetas gráficas convencionales.
- Motor de inferencia: `mlx-serve` ≥ 26.10.3 (servidor con endpoint `/v1/completions` y `/v1` estilo OpenAI).
- Proceso de instalación: descarga del pack base (~398 GiB) + overlay (2,2 GB), aplicación del graft (~2 minutos, ~22 GiB adicionales) y verificación por hash.
- Latencia y throughput: 124,3 tok/s con decodificación especulativa MTP activada; 57,1 tok/s sin ella. Otras métricas de latencia no disponibles.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible (el formato iQ-MLX requiere mlx-serve).

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 iQ-MLX 3.0bpw (ddalcu, base) | MoE, MLX | 3,0 bpw | >228k tokens | MIT | Conserva refusals (9 % cumplimiento en dañinos) |
| Este overlay (lued) | MoE, MLX + graft | 3,0 bpw + sidecar 1,09 GB | >228k tokens | MIT | Sin guardrails, KL 0,0915 frente al base |
| drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated | Abliterated de referencia | no disponible | no disponible | MIT | Origen de la dirección del injerto |

No hay datos suficientes para comparar con releases oficiales de DeepSeek en precisión completa; los valores absolutos de benchmark de este pack no son comparables según el propio autor.

## Limitaciones y advertencias

- Elimina por diseño los mecanismos de seguridad del modelo: 100 % de cumplimiento en prompts dañinos estándar. El README exige leer `docs/RESPONSIBLE_USE.md` antes de servirlo a cualquier persona que no sea el propio usuario.
- Riesgo de alucinación: no disponible como métrica específica; el 10,44 % de cambio greedy en prompts benignos indica desviación real respecto al base.
- Fidelidad no perfecta: la cota superior del intervalo de first-token KL (0,130) entra en la banda de "drift significativo" según el criterio citado (Heretic/Young 2025).
- Absolutos de benchmark no comparables: las evaluaciones se hicieron sin plantilla de chat; los valores IFEval y GSM8K absolutos son bajos por metodología, no necesariamente por capacidad real.
- Idiomas limitados a inglés y chino según las etiquetas; rendimiento en castellano no documentado.
- Dependencia de revisiones exactas: el graft está anclado a la revisión `74cca9ac` del base y verifica hashes SHA-256; no funcionará con otras revisiones.
- Requisito de hardware muy alto (256 GiB de memoria unificada) y descarga de ~398 GiB.
- Licencia MIT: permite uso comercial sin restricciones de licencia, pero el autor no está afiliado a DeepSeek y el uso sin guardrails en producción plantea riesgos legales y éticos serios (contenido dañino, responsabilidad del operador).
- No verificado: el autor documenta en `docs/LIMITS.md` lo que no fue probado; consultar antes de desplegar.

## Enlaces

- Ficha del overlay: https://huggingface.co/lued/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw-abliterated-overlay
- Pack base (ddalcu): https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Modelo de referencia abliterated (drowzeys): https://huggingface.co/drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated
- Documentación del método: `docs/METHOD.md` (en el repo del overlay)
- Mediciones completas: `docs/MEASUREMENTS.md` (en el repo del overlay)
- Límites de lo probado: `docs/LIMITS.md` (en el repo del overlay)
- Uso responsable: `docs/RESPONSIBLE_USE.md` (en el repo del overlay)
