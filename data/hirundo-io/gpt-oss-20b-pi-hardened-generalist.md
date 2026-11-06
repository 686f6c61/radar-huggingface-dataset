# hirundo-io/gpt-oss-20b-pi-hardened-generalist

## Resumen

`hirundo-io/gpt-oss-20b-pi-hardened-generalist` es un ajuste fino del modelo abierto `openai/gpt-oss-20b` publicado por el usuario `hirundo-io` en Hugging Face. Se distribuye en formato safetensors con cuantización MXFP4 de 8 bits y está pensado para generación de texto y conversación. El modelo hereda la arquitectura MoE del gpt-oss original y conserva sus 20.914.757.184 parámetros totales, pero el autor no ha publicado documentación sobre el proceso de ajuste, los datos utilizados ni los objetivos concretos del "hardening" al que alude el nombre.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no incluye model card descriptiva, no declara licencia ni idiomas soportados, y el acceso está restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargarlo. Cualquier evaluación de capacidades debe hacerse empíricamente por parte del usuario, ya que no hay benchmarks ni documentación técnica publicada por el autor.

El modelo base, `openai/gpt-oss-20b`, sí cuenta con documentación pública extensa (arquitectura MoE, contexto largo, modo de razonamiento, tool calling), y esta ficha recoge esa información heredada indicando explícitamente qué datos provienen del base y cuáles no están disponibles para el fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (heredada de openai/gpt-oss-20b) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el base gpt-oss-20b soporta 131.072 tokens; el fine-tune no lo declara) |
| Tipos de cuantizacion | MXFP4 de 8 bits (según tags del repo); no se declaran otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del `openai/gpt-oss-20b`, un transformer con mezcla de expertos (MoE) desarrollado por OpenAI y publicado como pesos abiertos. El repositorio de hirundo-io conserva la arquitectura del base y los pesos se distribuyen en safetensors con cuantización MXFP4 de 8 bits, lo que explica un tamaño de repo de 13,8 GB para ~20,9 mil millones de parámetros. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de inferencia de Hugging Face.

No hay información publicada sobre el proceso de ajuste: se desconoce el volumen de tokens de entrenamiento, la composición del dataset, si se empleó RLHF, DPO o supervisión directa, y en qué consiste exactamente el "pi-hardened" del nombre. Tampoco se documentan innovaciones técnicas propias del fine-tune. Cualquier afirmación sobre el entrenamiento más allá de "deriva de openai/gpt-oss-20b" sería especulativa.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y matemáticas: capacidades heredadas del base gpt-oss-20b, no verificadas en este fine-tune.
- Generación de código: heredada del base, no verificada.
- Tool calling / function calling: el base lo soporta; el fine-tune no lo declara explícitamente.
- Modo de razonamiento (thinking): el base gpt-oss-20b lo incorpora; no confirmado en este repo.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de agente y multi-step reasoning: no documentadas para este fine-tune.

## Casos de uso

- Evaluación comparativa de fine-tunes: usar el modelo como candidato en una batería de pruebas frente al `openai/gpt-oss-20b` original para medir el efecto del ajuste de hirundo-io en tareas concretas (razonamiento, código, instrucciones). Requiere aceptar la licencia gated primero.
- Experimentación en investigación: al ser un fine-tune no documentado, resulta útil para estudiar cómo cambios no publicados en los pesos afectan al comportamiento frente al base, siempre que se respete la licencia del modelo original.
- Generación de texto conversacional en prototipos: el pipeline declarado permite desplegarlo con `transformers` para chat multi-turno en entornos de prueba, con la cautela de que no hay benchmarks que garanticen calidad.
- Despliegue en infraestructura con VRAM limitada: la cuantización MXFP4 de 8 bits reduce el peso a ~13,8 GB, lo que permite probarlo en GPUs de 24 GB (RTX 4090, A10G) para inferencia en fp8/mxfp4.
- Integración vía endpoints compatibles: el tag `endpoints_compatible` facilita probarlo contra la API de inferencia de Hugging Face sin gestionar infraestructura propia.
- Base para nuevos fine-tunes: si el ajuste de hirundo-io resulta útil en un dominio concreto, puede servir como punto de partida para especializaciones posteriores, sujeto a las condiciones de la licencia gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~14-16 GB en la cuantización MXFP4 de 8 bits declarada (repo de 13,8 GB); en fp16 serían ~42 GB, no disponible en el repo.
- GPU recomendadas: RTX 4090 (24 GB), A10G (24 GB), L40S (48 GB) para la variante cuantizada; A100 80 GB o H100 para fp16 si se reconvierte.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con la cuantización MXFP4; en GPUs de 16 GB probablemente no sin cuantización adicional.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados para este repo concreto, aunque el base gpt-oss-20b tiene soporte en varios de ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hirundo-io/gpt-oss-20b-pi-hardened-generalist | 20,9 B (MoE) | no disponible | no disponible | gated en HF |
| openai/gpt-oss-20b (base) | 20,9 B (MoE) | 131.072 tokens | licencia abierta de OpenAI (consultar términos) | público en HF |
| Fine-tunes comunitarios de gpt-oss-20b | ~20,9 B | variable | variable | públicos en HF |

No se dispone de datos de rendimiento del fine-tune de hirundo-io para comparar con el base ni con otras alternativas; la comparación se limita a parámetros, contexto declarado y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, evaluación ni comportamiento esperado; el uso en producción es desaconsejable sin validación propia.
- Licencia no declarada y acceso gated: es imprescindible revisar las condiciones en Hugging Face antes de cualquier uso comercial; la licencia del base `openai/gpt-oss-20b` también aplica y debe consultarse.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no puede acotarse su magnitud en este fine-tune.
- Sesgos: desconocidos, al no documentarse el dataset de ajuste; pueden diferir de los del base.
- Idiomas: no declarados; no se garantiza un rendimiento multilingüe más allá del que herede del base.
- Contexto: no declarado para el fine-tune; no asumir los 131.072 tokens del base sin verificación.
- Reputación del repo: cero descargas y cero likes, sin historial de validación por la comunidad; tratar como experimental.
- Cuantización MXFP4: puede degradar ligeramente la calidad frente a fp16/bf16; no se ofrecen variantes de mayor precisión en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/gpt-oss-20b-pi-hardened-generalist
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
