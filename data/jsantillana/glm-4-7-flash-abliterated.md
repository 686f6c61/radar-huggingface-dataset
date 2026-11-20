# jsantillana/glm-4.7-flash-abliterated

## Resumen

GLM-4.7-Flash-abliterated es una versión modificada del modelo `zai-org/GLM-4.7-Flash` de Zhipu AI, publicada por el usuario `jsantillana`. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con aproximadamente 31.200 millones de parámetros totales y unos 3.000 millones de parámetros activos por token. La modificación consiste en una "abliteración" selectiva: la eliminación de los mecanismos de rechazo (refusal) mediante proyección ortogonal de subespacio de rango 2 sobre las capas 30 a 46, siguiendo el marco de interpretabilidad mecanicista de Arditi et al. (2024).

El modelo está pensado exclusivamente para investigación en interpretabilidad, análisis de alineamiento, red teaming y evaluación autorizada de ciberseguridad. Al eliminar los filtros de rechazo, responde a consultas técnicas de seguridad que el modelo base bloquearía, lo que lo hace útil para estudiar cómo se codifican las representaciones de seguridad en arquitecturas MoE de frontera, pero también peligroso si se usa sin las salvaguardas adecuadas.

La relevancia actual radica en que proporciona un caso de estudio reproducible sobre la localización de direcciones de rechazo en un MoE de ~30B, con una partición limpia entre datos de extracción y evaluación, y preservando la utilidad del idioma (98,6% de retención según la model card). La licencia es MIT, lo que permite uso comercial, aunque el autor restringe explícitamente el uso a fines educativos y de investigación autorizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (glm4_moe_lite), transformer con expertos enrutados y experto compartido |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | ~3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos nativos en bfloat16/safetensors) |
| Idiomas soportados | en, es, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, layout nativo del upstream) |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash es un transformer MoE con 64 expertos enrutados por capa más un experto compartido, con proyecciones `down_proj` de dimensión 2048×1536 para los expertos y `o_proj` de atención de 2048×5120. La modificación abliterada actúa sobre las capas 30 a 46 (17 capas), proyectando un subespacio ortogonal de rango 2 sobre 51 matrices de pesos: la proyección de salida de la auto-atención (`self_attn.o_proj`), la down-projection del experto compartido (`mlp.shared_experts.down_proj`) y las down-projections de los 64 expertos enrutados (`mlp.experts.{0..63}.down_proj`).

La técnica se basa en el marco de Arditi et al. (2024), que demuestra que el rechazo en modelos de lenguaje está mediado por una única dirección. En este caso se emplean 210 pares contrastivos alineados por entidad (multilingües, 70% de 300 disponibles, particionados por hash de entidad) para extraer el subespacio, y 1058 prompts retenidos para evaluación (30% disjunto más todos los conjuntos GRIS/SOC), con verificación de solapamiento cero. El juez de evaluación es un clasificador bilingüe de palabras clave (~140 marcadores EN/ES) con intervalos de confianza de Wilson y bootstrap emparejado. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF/DPO en el upstream.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno en inglés, español y chino.
- Respuesta a consultas técnicas de ciberseguridad sin rechazos automáticos: análisis de red, scripting con Scapy, conceptos de explotación, auditoría defensiva.
- Explicación de conceptos matemáticos y técnicos (por ejemplo, comparación RSA vs. ECC) en español.
- Generación de código y scripts (Python, herramientas de red) con plantilla de chat.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Capacidades multilingües limitadas a en, es, zh según la model card.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: estudiar cómo se codifican las representaciones de rechazo en las capas 30–46 de un MoE de ~30B, comparando activaciones antes y después de la proyección de rango 2 sobre las 51 matrices auditadas.
- Red teaming y análisis de alineamiento: evaluar la robustez de los filtros de seguridad del modelo base frente a la abliteración, usando los 1058 prompts retenidos y el juez bilingüe descrito en la model card.
- Evaluación autorizada de ciberseguridad defensiva: generar scripts de captura y análisis de tráfico (por ejemplo, con Scapy para parsear URLs y User-Agents en HTTP) en entornos de auditoría controlados.
- Formación y divulgación técnica: explicar diferencias matemáticas y de seguridad entre RSA y curvas elípticas en español, con temperatura baja (0,2–0,3) para respuestas deterministas.
- Análisis de sesgos y direcciones morales: el subespacio de rango 2 captura tanto la dirección de rechazo como la "moralizante", lo que permite estudiar cómo se separan ambos conceptos en el espacio latente.
- Pruebas de regresión de seguridad en pipelines de despliegue: comparar tasas de rechazo (35,9% → 5,3% en EN:OFF) para calibrar clasificadores de entrada/salida antes de exponer un modelo en producción.
- Investigación académica multilingüe: analizar la transferencia de la dirección de rechazo entre inglés, español y chino usando los pares contrastivos alineados por entidad.

## Benchmarks y rendimiento

| Metrica | Baseline | Abliterated | Cambio neto |
|---|---|---|---|
| Tasa de rechazo EN:OFF | 35,9% (47/131) | 5,3% (7/131) | −30,6 pp (IC: [0,229; 0,389]) |
| Tasa de rechazo ES:OFF | 8,9% (14/158) | 1,3% (2/158) | −7,6 pp (IC: [0,038; 0,120]) |
| Falso rechazo benigno (DEF/GRIS/SOC) | 0,0% | 0,0% | Preservado |
| Retención de utilidad del idioma | — | — | 98,6% (ablación previa) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~62 GB solo para pesos (31,2B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda ≥80 GB.
- Cuantización a 8 bits: ~31 GB de pesos; a 4 bits: ~16 GB, aunque no se documentan cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples RTX 4090 (24 GB) en paralelo con `device_map="auto"`.
- En consumer GPU: no cabe en una sola RTX 4090 en bfloat16; requeriría cuantización agresiva o sharding multi-GPU.
- Opciones de despliegue: transformers con `accelerate` y `trust_remote_code=True` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jsantillana/glm-4.7-flash-abliterated | ~31,2B totales / ~3B activos | no disponible | MIT | Hugging Face | Abliterado, solo investigación |
| zai-org/GLM-4.7-Flash (base) | ~31,2B totales / ~3B activos | no disponible | MIT | Hugging Face | Modelo original con rechazos intactos |
| Otros MoE abliterados de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina los rechazos automáticos, por lo que el modelo responderá a consultas de ciberseguridad ofensiva; el autor restringe su uso a investigación, evaluación autorizada y defensa.
- Riesgo elevado de uso dual: puede facilitar la generación de contenido que el modelo base bloquearía, incluyendo conceptos de explotación o análisis de red no autorizados.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de veracidad tras la abliteración.
- Sesgos conocidos del modelo base no documentados en la información disponible; la abliteración puede alterar comportamientos morales al proyectar también la dirección "moralizante".
- Idiomas limitados a inglés, español y chino; no se garantiza calidad en otros idiomas.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Aunque la licencia es MIT, el autor declara explícitamente usos prohibidos (ataques no autorizados, malware) y declina responsabilidad; el cumplimiento legal (CFAA, GDPR) recae en el usuario.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de serving como vLLM o TGI, lo que puede complicar el despliegue en producción.
- La evaluación se basa en un juez de palabras clave bilingüe, no en un juez LLM, lo que puede infraestimar rechazos sutiles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Manifiesto de abliteración: `ABLITERATION_MANIFEST.json` en el repositorio del modelo
