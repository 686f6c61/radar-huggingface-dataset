# pijou/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una variante "abliterated" (dealignada mediante modificación directa de pesos) del modelo GLM-5.3 de Z.ai, publicada por el usuario pijou bajo la marca CRACK de dealignai. A diferencia de los uncensors de propósito general, esta versión reduce las negativas de forma específica para el dominio de ciberseguridad ofensiva: desarrollo de exploits, red teaming, ingeniería inversa, evasión, phishing, análisis de malware y ataques de credenciales. No es un fine-tuning ni un LoRA: se editan únicamente los escritores residuales en bf16, dejando intactos los expertos en FP8, por lo que funciona con vLLM estándar sin hooks ni trucos de prompt.

El modelo base es GLM-5.3, un MoE de 753.330 millones de parámetros totales con arquitectura `glm_moe_dsa` (MoE con atención sparse tipo DeepSeek), 78 capas y entrada solo de texto. Esta ficha se basa en la cuantización FP8 de JANGQ-AI, pensada para aprovechar los tensor cores nativos FP8 de las GPU Hopper (H100/H200). El repositorio pesa 755,7 GB.

Su relevancia actual radica en ofrecer un modelo de frontera (85-86% en MMLU logit-mode) con capacidad técnica preservada tras la dealignación, útil para equipos de seguridad que necesitan asistentes sin negativas en tareas ofensivas legítimas. Debe subrayarse que se trata de un modelo de uso restringido a contextos autorizados (pentesting con permiso, investigación defensiva) y que su uso indebido conlleva riesgos legales y éticos significativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con DeepSeek-sparse attention), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible (arquitectura MoE, pero el ratio de expertos activados no está publicado en la ficha) |
| Longitud de contexto | Hasta ~131K tokens prácticos en TP8 con 8× H200 (con MTP); ~160K sin MTP; el contexto 1M vía decode-context-parallel no funciona actualmente en vLLM para `glm_moe_dsa` |
| Tipos de cuantizacion | FP8 (nativo, expertos en FP8, escritores residuales en bf16 editados) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (heredada del repositorio; la licencia del modelo base zai-org/GLM-5.3 no se detalla en la ficha) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura MoE con `glm_moe_dsa`, que combina mezcla de expertos con una variante de atención sparse inspirada en DeepSeek (DSA), incluyendo soporte para MLA (Multi-head Latent Attention) y decodificación especulativa MTP (Multi-Token Prediction). Consta de 78 capas y es un modelo de solo texto. Los detalles sobre el número de tokens de entrenamiento, composición del dataset y etapas de RLHF/DPO del modelo base no están disponibles en la información proporcionada.

La variante CRACK Cybersecurity no añade entrenamiento alguno: es una modificación directa de pesos ("genuine weight modification") en la que solo se editan los escritores residuales en bf16, manteniendo los expertos enrutados en FP8 sin cambios. El objetivo es suprimir la sustrato común de las negativas sin degradar la capacidad general, lo que se verifica con una prueba MMLU en modo logit que muestra una variación de +1,07 puntos porcentuales respecto al baseline. Incluye modo de razonamiento (`reasoning_effort`), que solo admite los valores `"low"` y `"high"`; cualquier otro valor cae a `max`, y no existe forma de desactivar el razonamiento en este checkpoint.

## Capacidades

- Generación de texto conversacional de propósito general con capacidad técnica preservada (86,65% en MMLU logit-mode, +1,07 pp sobre el baseline).
- Reducción específica de negativas en ciberseguridad ofensiva: exploit development, red teaming, ingeniería inversa, evasión, phishing, ataques de credenciales y análisis de malware.
- Razonamiento con modo configurable (`reasoning_effort`: `"low"` o `"high"`; otros valores caen a `max`). El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- Soporte de tool calling / function calling nativo en vLLM (parsers `glm45` para razonamiento y `glm47` para tool calls, con `--enable-auto-tool-choice`).
- Soporte de agentes y bucles de tool-use multi-paso; se recomienda `reasoning_effort: "low"` para uso agéntico en FP8.
- Decodificación especulativa MTP: no funcional en vLLM estándar, pero operativa en el fork sparse-MLA de ciprianveg (+48% de throughput de decode en prompts de código).
- Multilingüe: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Sin capacidades de visión ni audio (modelo text-only).

## Casos de uso

- Red teaming autorizado: generación de planes de ataque, cadenas de explotación y scripts de prueba durante evaluaciones de penetración con contrato firmado; el modelo responde directamente a técnicas ofensivas sin negativas en el 80-84% de los casos.
- Desarrollo de exploits: redacción y depuración de proof-of-concepts para vulnerabilidades conocidas durante un engagement, aprovechando la fuerte base de razonamiento y código de GLM-5.3.
- Ingeniería inversa y análisis de malware: interpretación de desensamblado, anotación de binarios y explicación de comportamientos de muestras maliciosas en entornos de laboratorio (sandbox).
- Simulación de phishing para concienciación: creación de plantillas de campañas de simulación internas y evaluación de la superficie de ingeniería social de una organización.
- Ataques de credenciales en auditorías: diseño de estrategias de password spraying, credential stuffing y testing de políticas de contraseñas dentro de un alcance autorizado.
- Agentes de seguridad automatizados: integración en pipelines de herramientas ofensivas (con tool calling nativo en vLLM) para orquestar escaneos, explotación y reporte; usar `reasoning_effort: "low"` y `max_tokens ≥ 8000` si se emplea esfuerzo alto.
- Generación de informes de pentesting: redacción de hallazgos técnicos, severidad y remediación a partir de resultados de herramientas, en español o cualquiera de los diez idiomas soportados.
- Investigación defensiva: análisis de técnicas de evasión y MITRE ATT&CK para diseñar detecciones y reglas YARA/Sigma.

## Benchmarks y rendimiento

La única métrica publicada en la ficha es una evaluación propia en modo logit (probabilidad sobre tokens A/B/C/D, sin generación) comparando con el modelo base:

| Benchmark | Base GLM-5.3 | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 preguntas, logit-mode) | 85,58%¹ | 86,65% (889/1026) | +1,07 pp |

_¹ Baseline de GLM-5.3-regular en bf16 previo a la cuantización; el baseline directo base-FP8 está pendiente de confirmación._

Adicionalmente, la ficha publica resultados de cumplimiento HarmBench-320 (greedy): en el corpus de daño real (240 comportamientos, excluido copyright), el modelo cumple directamente el 80,0-84,2% según el nivel de `reasoning_effort`, con 3-4 soft-refuses y ~0 hard-refuses por superficie. En el HB-320 completo (incluye 80 comportamientos de copyright), el cumplimiento directo es del 63,4-69,7%, ya que la reproducción verbatim con copyright sigue generando soft-refusal en el 60-68% de los casos. No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks estándar de generación en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo pesa 755,7 GB en FP8, lo que requiere aproximadamente 8× H200 (141 GB cada una, ~1,1 TB agregados) o equivalente; la configuración de referencia es TP8 sobre 8× H200 con `gpu-memory-utilization 0.90`.
- GPU recomendadas: H200 (configuración validada, TP8), H100 (FP8 nativo en Hopper). No cabe en GPU de consumo (RTX 4090, RTX 5090) ni en configuraciones de 1-4 GPU de gama alta.
- Contexto práctico: ~131K tokens con MTP y ~160K sin MTP en TP8 H200; el contexto de 1M vía decode-context-parallel no funciona actualmente en vLLM para esta arquitectura (error de page size en `fp8_ds_mla`). Pipeline-parallel (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- Despliegue: vLLM es el runtime de referencia (con `--enforce-eager` obligatorio para la ruta de atención sparse bajo concurrencia, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`). Se ha reportado funcionamiento en 8× DGX Spark GB10. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Rendimiento: 131K de contexto funciona en 8× H200 con `max-num-seqs 24` (~2,98× de margen de concurrencia); con el fork sparse-MLA de ciprianveg, MTP aporta +48% de decode en prompts de código. Latencias absolutas no disponibles.
- Ajustes críticos: `reasoning_effort` solo acepta `"low"` y `"high"` (todo lo demás cae a `max`); en FP8 con `high`/`max` el modelo puede agotar el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta, por lo que conviene `max_tokens ≥ 8000`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Caracteristica distintiva |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | ~753B | MoE + sparse attention (`glm_moe_dsa`) | ~131K práctico (vLLM TP8) | MIT | Abliterated especifico de ciberseguridad, FP8 nativo |
| dealignai/GLM-5.3-UNCENSORED-FP8 (hermano) | ~753B | MoE + sparse attention (`glm_moe_dsa`) | ~131K práctico (vLLM TP8) | MIT | Uncensor de proposito general del mismo base |
| zai-org/GLM-5.3 (base) | ~753B | MoE + sparse attention (`glm_moe_dsa`) | no disponible en la ficha | no disponible en la ficha | Modelo original con alignment completo |

No hay datos comparativos de rendimiento publicados frente a otros modelos dealignados de la misma categoría (por ejemplo, variantes abliterated de DeepSeek o Qwen de escala comparable).

## Limitaciones y advertencias

- Uso indebido: al eliminar las negativas en ciberseguridad ofensiva, el modelo puede facilitar actividades ilegales (acceso no autorizado, malware, phishing real). Su uso debe limitarse a contextos autorizados y legales; la licencia MIT no impone restricciones de uso, lo que traslada toda la responsabilidad al usuario.
- No es un uncensor general: en categorías no cibernéticas (armas, química, biología, acoso, desinformación) puede cumplir con un envoltorio "educativo" blando porque las negativas comparten sustrato entre dominios, pero el modelo está afinado para ciberseguridad. La reproducción verbatim de material con copyright sigue generando soft-refusal.
- Riesgo de agotamiento de presupuesto: con `reasoning_effort` en `high`/`max` en FP8, el modelo puede gastar todo `max_tokens` en el bloque `<think>` y devolver cero tokens de respuesta (finish=`length`); esto no se corrige con parámetros de muestreo.
- `reasoning_effort` no admite `"off"`: no hay forma de desactivar el razonamiento; usar `"low"` como mínimo.
- Contexto limitado en la práctica: el 1M teórico no funciona en vLLM hoy; el techo realista es ~131-160K en TP8 H200, y MTP no funciona en vLLM estándar.
- Sesgos: no se han documentado sesgos específicos de esta variante; hereda los del modelo base GLM-5.3 (no detallados en la información disponible).
- Alucinaciones: al tratarse de un modelo de 753B con alignment reducido, el riesgo de alucinación en contenido técnico ofensivo (versiones de CVE, sintaxis de exploits) es real; verificar siempre los resultados contra fuentes primarias.
- Idiomas: soporta diez idiomas, pero la evaluación publicada se ha realizado en inglés; la calidad en español y otros idiomas no está cuantificada.
- Descargas y adopción: 0 descargas y 0 likes en el momento de la ficha; es un modelo muy reciente y sin auditoría comunitaria.

## Enlaces

- Modelo: https://huggingface.co/pijou/GLM-5.3-CYBERSECURITY-FP8
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana (uncensor general): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión sobre pruebas en DGX Spark: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
- Paper del modelo base: no disponible
- Demo online: no disponible
