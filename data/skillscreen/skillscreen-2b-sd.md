# SkillScreen/SkillScreen-2B-SD

## Resumen

SkillScreen-2B-SD es un modelo de clasificación de texto de 2.213 millones de parámetros (2,2 B) desarrollado por SkillScreen para la detección de *skills* de agente maliciosas a partir de su fichero `SKILL.md`. Resuelve un problema concreto de seguridad en el ecosistema de agentes: los *skills* (instrucciones y capacidades empaquetadas que un agente carga dinámicamente) son texto no confiable que puede contener instrucciones maliciosas, exfiltración de datos o *prompt injection*. El modelo actúa como un decisor binario (NLI: implicación frente a no implicación) que puntúa la probabilidad de que un `SKILL.md` sea malicioso.

Se trata de un *fine-tuning* del modelo base AlexWortega/openjev (2 B, familia Qwen 3.5 según los tags), entrenado sobre el conjunto MaliciousSkillBench con una partición Source-Disjoint (SD), es decir, separando por origen de los datos para medir generalización a fuentes no vistas. El presupuesto de entrada es de 8.192 tokens, suficiente para cubrir la práctica totalidad de ficheros `SKILL.md`.

Su relevancia actual radica en el enfoque de alto *recall*: en lugar de optimizar precisión, el modelo está calibrado para no dejar pasar skills maliciosas, aceptando una tasa de falsos positivos elevada que se compensa con revisión humana posterior. La licencia Apache-2.0 permite uso comercial y redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.5, tag `qwen3_5`), con cabeza de clasificación NLI y adaptador LoRA fusionado |
| Parametros totales | 2.213.247.808 (2,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (presupuesto de entrada declarado) |
| Tipos de cuantizacion | No disponible (el autor solo documenta BF16 con CUDA) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); CC BY 4.0 para model card y documentación |
| Formato de pesos | Safetensors (pesos completos en la raíz del repo; adaptador LoRA y cabeza en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de AlexWortega/openjev, un transformer decoder-only de 2,2 B parámetros de la familia Qwen 3.5, y le añade una cabeza de clasificación para una tarea de inferencia de lenguaje natural (NLI) de dos clases: implicación (skill maliciosa) y no implicación (skill benigna). La puntuación nativa de malicia es el softmax de la clase de implicación. El ajuste se realizó mediante LoRA sobre el modelo base; el repositorio publica tanto el adaptador original y la cabeza (`adapter/`) como los pesos completos fusionados en la raíz, con un informe de verificación de la fusión (`merge_verification.json`).

El entrenamiento utiliza el dataset ProtectSkills/MaliciousSkillBench con la partición Source-Disjoint (SD), que separa las fuentes entre entrenamiento y test para evitar fuga de información y medir la capacidad de generalización a orígenes no vistos. La entrada es exclusivamente el contenido de `SKILL.md`, truncado o limitado a 8.192 tokens. El checkpoint de referencia documentado es `direct-sd-s42` (semilla 42, actualización 470). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de una tarea de clasificación supervisada, el ajuste es presumiblemente por entropía cruzada sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de malicia de ficheros `SKILL.md` de agentes, con puntuación continua (softmax de implicación) y umbral configurable.
- Detección de instrucciones maliciosas, *prompt injection*, exfiltración de datos y comportamientos abusivos embebidos en skills de agente.
- Operación con entradas de hasta 8.192 tokens, cubriendo skills de longitud realista.
- Puntuación calibrable: el umbral 0,5 ofrece el modo por defecto y umbrales más bajos permiten alcanzar *recall* cercano al 99 % a costa de más falsos positivos.
- No soporta *tool calling*, generación de texto libre, agentes multi-paso ni razonamiento generativo: es un modelo discriminativo de una sola pasada.
- Capacidades multilingües: no disponibles (no documentadas).

## Casos de uso

- **Puerta de seguridad en la carga de skills de agente**: antes de que un agente instale o ejecute un `SKILL.md` de un repositorio o marketplace, el modelo puntúa el fichero y bloquea o deriva a revisión los que superen el umbral. Es adecuado por su bajo coste (2,2 B) y su ventana de 8K.
- **Triaje en pipelines de CI/CD de skills**: integrado como paso de validación en el proceso de publicación de skills, con umbral 0,5 para bloqueo automático y umbral bajo (≈0,046) para marcar candidatos a revisión humana, aprovechando el *recall* del 98,93 %.
- **Moderación de marketplaces y registros de skills**: cribado masivo de catálogos de skills de terceros para priorizar la auditoría manual de los ficheros con mayor puntuación de malicia.
- **Capa de defensa en entornos de agentes empresariales**: filtrado de skills descargadas dinámicamente por agentes internos antes de concederles acceso a herramientas o datos sensibles.
- **Investigación en seguridad de agentes**: generación de etiquetas preliminares y puntuaciones sobre corpus de `SKILL.md` para estudiar la prevalencia de skills maliciosas y construir datasets ampliados.
- **Sistema de alerta temprana con revisión humana**: despliegue en modo *high-recall* (umbral bajo) para que un analista revise solo los positivos, dado el FPR del 55,60 % en ese régimen; el modelo reduce el volumen de revisión frente a inspeccionar todo el catálogo.

## Benchmarks y rendimiento

Resultados de referencia del checkpoint LoRA de origen `direct-sd-s42` (semilla 42, actualización 470) sobre el test Source-Disjoint de MaliciousSkillBench: 1.384 skills (839 maliciosas, 545 benignas), revisión del dataset `d4b42ce5766a6e0359c987cf59c1007cb3795a90`, entrada solo `SKILL.md` hasta 8.192 tokens.

| Regla de umbral | Umbral de puntuación nativa | Recall (%) | FPR (%) |
|---|---:|---:|---:|
| Por defecto | 0,5 | 96,07 | 35,41 |
| Recall de validación objetivo 99 % | 0,046033766724745177 | 98,93 | 55,60 |

El segundo umbral se congeló sobre validación antes del test; el *recall* reportado es el medido en test. Son resultados de un único checkpoint, distintos de las medias multi-semilla del artículo. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) por tratarse de un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,5 GB solo para pesos (2,2 B × 2 bytes), más activaciones y caché KV para 8.192 tokens; en la práctica, entre 6 y 10 GB según lote y longitud de entrada.
- Requiere CUDA con soporte BF16 según la model card; no se documenta ejecución en CPU ni en cuantización de 4/8 bits.
- GPU recomendadas: cualquier GPU con al menos ~10 GB de VRAM en BF16, como RTX 4090, RTX 4080, A10, L4, A100 o H100. Cabe en GPU de consumo de gama alta.
- Despliegue: el autor proporciona `score.py` y `requirements.txt` para inferencia con Transformers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A modo de referencia estructural, se compara con el modelo base y con clasificadores genéricos de la misma familia:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-SD | 2,2 B | 8.192 | Clasificación de malicia de skills | Apache-2.0 | Hugging Face |
| AlexWortega/openjev (base) | 2,2 B (aprox., no confirmado) | No disponible | Modelo generativo de propósito general | No disponible | Hugging Face |
| Clasificadores NLI genéricos de ~2 B | ~2 B | Variable | NLI general | Variable | Hugging Face |

No se han identificado en la información disponible alternativas específicas de detección de skills maliciosas con las que comparar parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- **Falsos positivos elevados**: con el umbral por defecto (0,5) el FPR es del 35,41 %; en modo alto *recall* (0,046) sube al 55,60 %. El modelo no está pensado para bloqueo automático sin revisión en el régimen de alto *recall*.
- **Resultados de un único checkpoint**: las cifras proceden de `direct-sd-s42` y no de las medias multi-semilla del artículo; pueden no representar el rendimiento esperado de forma estable.
- **Sesgos**: no documentados en la información disponible; al entrenarse sobre un dataset específico (MaliciousSkillBench) puede no generalizar a estilos de `SKILL.md`, idiomas o formatos no representados.
- **Riesgo de alucinación**: no aplica en sentido generativo al ser un clasificador, pero sí existe riesgo de clasificación errónea (falsos negativos) en skills maliciosas que evadan los patrones del dataset de entrenamiento.
- **Idiomas**: no se documenta qué idiomas cubre; el entrenamiento parece centrado en el formato y lengua del dataset, por lo que el rendimiento fuera de ese ámbito es incierto.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, *fine-tuning* y redistribución con atribución y aviso de modificaciones; se mantienen las obligaciones de las licencias upstream de OpenJev y Qwen (`THIRD_PARTY_NOTICES.md`, `LICENSE-OPENJEV`, `LICENSE-QWEN`).
- **Dependencia de CUDA/BF16**: la model card solo documenta ejecución con CUDA y BF16; no hay soporte declarado para CPU ni cuantización, lo que limita el despliegue en entornos sin GPU.
- **Entrada limitada a `SKILL.md`**: no analiza el código ni los recursos asociados al skill, solo el fichero de instrucciones, por lo que un skill malicioso cuyo comportamiento dañino resida en scripts auxiliares podría no detectarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-SD
- Modelo base: https://huggingface.co/AlexWortega/openjev
- Artículo (arXiv): https://arxiv.org/abs/2610.17727
- Página del artículo en HF Papers: https://huggingface.co/papers/2610.17727
- Página del proyecto: https://jerroldh.github.io/SkillScreen-webpage/
- Código: https://github.com/JerroldH/SkillScreen
- Dataset: https://huggingface.co/datasets/ProtectSkills/MaliciousSkillBench
