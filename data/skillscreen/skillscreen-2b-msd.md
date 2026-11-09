# SkillScreen/SkillScreen-2B-MSD

## Resumen

SkillScreen-2B-MSD es un modelo de clasificación de texto (NLI) de 2.213.247.808 parámetros (~2,2 B) desarrollado por SkillScreen para detectar *skills* maliciosas de agentes a partir del fichero `SKILL.md`. Resuelve un problema de seguridad concreto en el ecosistema de agentes: la instalación de habilidades de terceros que pueden contener instrucciones dañinas, exfiltración de datos o *prompt injection*. El modelo evalúa el contenido del `SKILL.md` y devuelve una puntuación nativa de maliciosidad (softmax de *entailment*) que, por encima de un umbral, marca la skill como sospechosa.

Está afinado sobre OpenJev 2B (que a su vez deriva de la familia Qwen 3.5, según los tags), con un presupuesto de entrada de 8.192 tokens. Se entrenó sobre el dataset MaliciousSkillBench con la variante Malicious-Structural-Disjoint (MSD), diseñada para evitar que el modelo memorice estructuras vistas en entrenamiento. El *checkpoint* publicado combina los pesos completos en la raíz del repositorio y un adaptador LoRA más la cabeza de clasificación en `adapter/`.

Es relevante ahora porque los agentes basados en LLM instalan cada vez más habilidades externas y el filtrado de alto *recall* es un requisito de seguridad operativa. El modelo prioriza explícitamente el *recall* (detección) sobre la tasa de falsos positivos, con umbrales calibrados para distintos compromisos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5 vía OpenJev 2B), con cabeza de clasificación NLI |
| Parámetros totales | 2.213.247.808 (~2,2 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (presupuesto de entrada declarado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, adaptador, código); CC BY 4.0 (model card y documentación) |
| Formato de pesos | safetensors (pesos completos en la raíz + LoRA y cabeza en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de OpenJev 2B (familia Qwen 3.5) y se adapta mediante LoRA más una cabeza de clasificación para una tarea de inferencia de lenguaje natural (NLI) binaria: determinar si el contenido del `SKILL.md` implica comportamiento malicioso. La puntuación nativa es el softmax de *entailment*; se marca como sospechoso todo valor mayor o igual al umbral configurado. La entrada se limita a 8.192 tokens del propio `SKILL.md`.

El entrenamiento se realizó sobre MaliciousSkillBench con la variante Malicious-Structural-Disjoint (MSD), que separa estructuralmente los ejemplos de entrenamiento y test para medir generalización a patrones no vistos. El *checkpoint* de referencia es `direct-msd-r001`, semilla 42, actualización 426. El repositorio incluye `merge_verification.json` con las comprobaciones del export de pesos fusionados y `provenance.json` con los detalles del *checkpoint*. La revisión `v1.1` solo actualiza licencia y citación; pesos, adaptadores, tokenizador, código de *scoring* y configuraciones son idénticos a `v1`.

## Capacidades

- Clasificación binaria de maliciosidad de skills de agentes a partir de `SKILL.md`.
- Puntuación nativa continua (softmax de *entailment*) con umbral configurable.
- Operación con umbrales calibrados para distintos compromisos *recall*/FPR.
- Entrada de hasta 8.192 tokens, suficiente para ficheros `SKILL.md` extensos.
- Inferencia en CUDA con soporte BF16 (requisito declarado).
- Script de *scoring* incluido (`score.py`) para evaluar un fichero individual.
- No se documentan capacidades de generación, tool calling, agentes, visión ni audio: es un modelo de clasificación, no un LLM generativo de uso general.

## Casos de uso

- Filtrado previo a la instalación de skills: integrar `score.py` o el modelo en el *pipeline* de un gestor de skills para bloquear ficheros `SKILL.md` con puntuación nativa ≥ 0,5 antes de que el agente los cargue.
- Puerta de seguridad en CI/CD de repositorios de skills: ejecutar el clasificador sobre cada *pull request* que añada o modifique un `SKILL.md` y fallar el *build* si supera el umbral.
- Moderación de mercados o registros de skills: cribar a gran escala las skills publicadas por terceros y derivar las marcadas a revisión humana.
- Detección de *prompt injection* en documentación de agentes: usar el modelo como señal adicional en un *ensemble* de defensas de entrada.
- Investigación en seguridad de agentes: emplear el *checkpoint* y el dataset MSD como línea base reproducible para comparar detectores.
- Auditoría de skills ya desplegadas: reescanear el inventario de skills instaladas en una flota de agentes y priorizar las de mayor puntuación para revisión.
- Configuración de alta sensibilidad: usar el umbral congelado para *recall* ~99 % (0,011732435172454926) en entornos donde un falso negativo es crítico, asumiendo un FPR elevado.

## Benchmarks y rendimiento

Evaluación del *checkpoint* fuente `direct-msd-r001` (semilla 42, actualización 426) sobre el test Malicious-Structural-Disjoint (MSD) de MaliciousSkillBench: 1.947 skills (1.500 maliciosas, 447 benignas), revisión del dataset `d4b42ce5766a6e0359c987cf59c1007cb3795a90`, entrada solo `SKILL.md` hasta 8.192 tokens.

| Regla de umbral | Umbral de puntuación nativa | Recall (%) | FPR (%) |
|---|---:|---:|---:|
| Por defecto | 0,5 | 95,20 | 1,79 |
| Objetivo 99 % recall en validación | 0,011732435172454926 | 98,93 | 21,70 |

Son resultados de un único *checkpoint*, distintos de las medias multi-semilla del artículo. No se han publicado en la información disponible resultados frente a otros modelos comparables (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~2,2 B parámetros, en BF16 los pesos ocupan aproximadamente 4,4 GB, por lo que se requiere margen adicional para activaciones y contexto de 8K.
- Requiere CUDA con soporte BF16 (requisito declarado por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos es plausible en GPUs con 8 GB o más en BF16, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con el script `score.py` incluido; el uso de vLLM, llama.cpp, Ollama o TGI no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de detección de skills maliciosas ni de clasificadores NLI del mismo tamaño, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-MSD | ~2,2 B | 8.192 | Clasificación de skills maliciosas | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no debe usarse para tareas de generación de texto, código o razonamiento.
- El umbral por defecto (0,5) da un FPR del 1,79 % con recall del 95,20 %; el umbral de alto recall sube el FPR al 21,70 %, lo que implica muchas alertas falsas.
- Los resultados publicados corresponden a un único *checkpoint* y a la partición MSD; el rendimiento en distribuciones distintas de skills no está documentado.
- Solo evalúa el contenido de `SKILL.md`: no analiza código, dependencias ni comportamiento en tiempo de ejecución de la skill.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos negativos y positivos).
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Licencia: Apache-2.0 permite uso comercial, *fine-tuning* y redistribución con atribución; la model card y documentación están bajo CC BY 4.0. Se deben conservar los avisos de OpenJev y Qwen (`THIRD_PARTY_NOTICES.md`, `LICENSE-OPENJEV`, `LICENSE-QWEN`).
- En producción conviene combinar la señal del modelo con otras defensas y revisión humana, dado el compromiso *recall*/FPR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-MSD
- Modelo base OpenJev 2B: https://huggingface.co/AlexWortega/openjev
- Artículo (arXiv): https://arxiv.org/abs/2610.17727
- Página del artículo en HF: https://huggingface.co/papers/2610.17727
- Página del proyecto: https://jerroldh.github.io/SkillScreen-webpage/
- Código: https://github.com/JerroldH/SkillScreen
- Dataset: ProtectSkills/MaliciousSkillBench (revisión `d4b42ce5766a6e0359c987cf59c1007cb3795a90`)
