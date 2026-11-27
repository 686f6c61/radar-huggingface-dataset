# alphalabz/VELIX-ALPHA

## Resumen

VELIX ALPHA es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4B) desarrollado por Alpha Labz, especializado en análisis de malware, inteligencia de amenazas y mapeo de técnicas ATT&CK. Se presenta como un fine-tune del modelo base `junafinity/Ornith-1.5-9B-uncensored`, orientado a analistas de SOC, respondedores de incidentes, equipos de threat intelligence, ingenieros de detección y equipos de red team. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado con el pipeline `text-generation` y la arquitectura `qwen3_5`.

La propuesta central del modelo es eliminar los rechazos ("refusal wall") en consultas relacionadas con malware, de modo que un analista pueda obtener atribución de familia, identificadores de técnicas ATT&CK, indicadores de compromiso y resúmenes estructurados sin que el modelo se niegue a responder. Según la model card, el modelo alcanza 30/30 en atribución de familia sobre informes reservados, 24/30 en triaje de binarios benignos y 7/10 en generación de andamiaje de payloads.

El modelo se publica con cinco builds GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M), con un tamaño de repositorio de 37,7 GB y soporte declarado únicamente para inglés. Su relevancia actual radica en la combinación de un tamaño contenido (desplegable en GPU de consumo) con un enfoque verticalizado en ciberseguridad ofensiva y defensiva, un nicho donde la mayoría de los modelos generalistas aplican rechazos sistemáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag de Hugging Face); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8k (8.192 tokens, según model card) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; pesos originales en safetensors (16-bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (repo `alphalabz/VELIX-ALPHA-GGUF`) |

## Arquitectura y entrenamiento

VELIX ALPHA se construye como un fine-tune del modelo `junafinity/Ornith-1.5-9B-uncensored`, que a su vez se etiqueta con la arquitectura `qwen3_5`. La model card describe el proceso como la carga del modelo base, su evaluación sobre un conjunto de pruebas y la aplicación de un adaptador; la comparación "paired" (base frente a VELIX en el mismo proceso y mismo runner) sugiere que el ajuste se realizó mediante un adaptador (probablemente LoRA u otra técnica de parametrización eficiente), aunque el autor no especifica formalmente el método, el número de tokens de entrenamiento ni la composición del dataset.

La innovación declarada no es arquitectónica sino de alineamiento y especialización: el modelo elimina los rechazos en el dominio de seguridad y se entrena para producir identificadores ATT&CK concretos (hasta diez técnicas distintas por análisis), distinguir herramientas administrativas legítimas de uso malicioso (por ejemplo, `psexec` o `certutil` en contexto sancionado frente a intrusión) y generar andamiaje de payloads para ejercicios de red team. No se documentan detalles sobre RLHF, DPO ni composición del corpus de entrenamiento.

## Capacidades

- Generación de texto y análisis técnico en el dominio de ciberseguridad.
- Atribución de familia de malware a partir de comportamiento, tooling, cadena de entrega o notas de rescate.
- Mapeo de técnicas MITRE ATT&CK por identificador (por ejemplo, T1486, T1204.002, T1505.003, T1566.001), hasta diez técnicas distintas por análisis.
- Triaje de binarios benignos frente a maliciosos, incluyendo desambiguación de herramientas de administración (Sysinternals, `certutil`).
- Generación de andamiaje de payloads para red team (RAT, keylogger, esqueletos de C2), según la model card.
- Redacción de informes estructurados de analista: qué ocurrió, comportamientos, IOCs, identificadores ATT&CK y recomendaciones de detección.
- Extracción y priorización de indicadores de compromiso a partir de volcados de sandbox o pilas de IOCs.
- Modo sin rechazos ("uncensored") para consultas de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; aunque el tag `image-text-to-text` aparece en Hugging Face, la model card no describe capacidades de visión.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Triaje de alertas en un SOC: el analista pega el volcado de sandbox o los IOCs y el modelo devuelve la familia probable, las técnicas ATT&CK y los indicadores a bloquear, reduciendo el tiempo de clasificación inicial antes de la escalada.
- Atribución de familia en respuesta a incidentes: dado un conjunto de comportamientos observados y artefactos de entrega, el modelo propone familia y campaña, lo que ayuda a priorizar la contención y a buscar infraestructura relacionada.
- Mapeo ATT&CK para ingeniería de detección: el modelo traduce descripciones de comportamiento a identificadores de técnica que se pueden volcar directamente en un backlog de detección y vincular a reglas Sigma o consultas SIEM.
- Redacción de informes de caso: genera resúmenes estructurados (qué ocurrió, comportamientos, IOCs, ATT&CK, detección) listos para pegar en un ticket o en un expediente de caso, evitando el reformateo manual de respuestas de chat.
- Ejercicios de red team y pentesting: produce esqueletos funcionales de RAT, keylogger y C2 para andamiaje de un engagement, lo que ahorra tiempo en la fase de desarrollo de herramientas ofensivas.
- Reducción de falsos positivos en detección: el modelo distingue el uso sancionado de `psexec` o `certutil` del uso malicioso, lo que permite afinar reglas que de otro modo saturarían al equipo y acabarían silenciadas.
- Formación y concienciación: sirve como asistente para explicar técnicas de ataque y su detección a analistas junior, gracias a su capacidad de generar explicaciones estructuradas sobre comportamiento malicioso.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se basan en 126 elementos reservados, con temperatura 0.0 y el mismo conjunto de pruebas para todos los modelos.

Comparativa con modelos de seguridad del mismo dominio:

| Lane | VELIX ALPHA | Cisco-Foundation-Sec-8B | WhiteRabbitNeo-2.5-7B |
|---|---|---|---|
| Atribución de familia (30) | 30/30 | 23/30 | 20/30 |
| Triaje benigno (30) | 24/30 | 13/30 | 13/30 |
| Autoría de payload (10) | 7/10 | 0/10 | 1/10 |

Comparativa pareada contra su modelo base (mismo proceso, mismo runner):

| Lane | Base (Ornith-1.5-9B-uncensored) | VELIX ALPHA | Δ |
|---|---|---|---|
| Atribución de familia (30) | 24/30 | 29/30 | +5 |
| Triaje benigno (30) | 20/30 | 21/30 | +1 |
| Autoría de payload (10) | 1/10 | 7/10 | +6 |

Rendimiento por cuantización (batería de 12 elementos: 5 numéricos, 5 de concepto de dominio):

| Quant | Tamaño | Bits/peso | Dígitos | Conceptos | Total |
|---|---|---|---|---|---|
| Q8_0 | 9,53 GB | 8,5 | 5/5 | 4/5 | 9/10 |
| Q6_K | 7,36 GB | 6,6 | 5/5 | 4/5 | 9/10 |
| Q5_K_M | 6,49 GB | 5,6 | 5/5 | 4/5 | 9/10 |
| Q4_K_M | 5,68 GB | 4,8 | 5/5 | 4/5 | 9/10 |
| Q3_K_M | 4,68 GB | 3,4 | 5/5 | 4/5 | 9/10 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son evaluaciones internas del autor sobre conjuntos propios.

## Requisitos de hardware

- Pesos en 16-bit: aproximadamente 18,8 GB (9,4B × 2 bytes), lo que requiere GPU de 24 GB o más para inferencia cómoda.
- Q8_0: 9,53 GB; requiere GPU de 12-16 GB.
- Q6_K: 7,36 GB; requiere GPU de 10-12 GB.
- Q5_K_M: 6,49 GB; requiere GPU de 8-10 GB.
- Q4_K_M: 5,68 GB; la model card lo señala como el punto óptimo y lo declara cómodo en una tarjeta de 8 GB.
- Q3_K_M: 4,68 GB; apto para GPU de 6-8 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10, L4, A100 y H100 para los formatos de mayor precisión.
- Cabe en GPU de consumo: sí, al menos en cuantizaciones Q3_K_M a Q8_0 según la VRAM disponible.
- Opciones de despliegue: Ollama (con el `Modelfile` del repositorio), llama.cpp mediante GGUF, transformers con safetensors; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atribución de familia | Triaje benigno | Autoría de payload | Licencia |
|---|---|---|---|---|---|---|
| VELIX ALPHA | 9,4B | 8k | 30/30 | 24/30 | 7/10 | Apache 2.0 |
| Cisco-Foundation-Sec-8B | ~8B | no disponible | 23/30 | 13/30 | 0/10 | no disponible |
| WhiteRabbitNeo-2.5-7B | ~7B | no disponible | 20/30 | 13/30 | 1/10 | no disponible |
| Ornith-1.5-9B-uncensored (base) | 9,4B | no disponible | 24/30 | 20/30 | 1/10 | no disponible |

VELIX ALPHA lidera en las tres categorías evaluadas por el autor, con una ventaja especialmente marcada en autoría de payload (7/10 frente a 0/10 y 1/10) y en triaje benigno, donde casi duplica a los modelos de seguridad comparados. La comparación pareada contra su base aísla el efecto del ajuste: la atribución sube de 24 a 29 y la autoría de payload de 1 a 7, mientras que el triaje benigno apenas mejora (+1).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo "uncensored", puede producir contenido ofensivo sin filtros, lo que exige controles de uso.
- Riesgo de alucinación: no cuantificado; en tareas de atribución y mapeo ATT&CK, una atribución errónea o un identificador de técnica inventado puede propagarse a reglas de detección y generar falsos positivos o negativos.
- Limitaciones de contexto: ventana de 8k tokens, insuficiente para volcados de sandbox extensos o informes muy largos sin trocear.
- Limitaciones de idioma: solo inglés; no apto para analistas que operen exclusivamente en castellano sin traducción previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (`junafinity/Ornith-1.5-9B-uncensored`) debe verificarse por si impone condiciones adicionales; la información disponible no detalla su licencia.
- Caveat de producción: los benchmarks son internos del autor (126 elementos, conjuntos propios), sin validación externa ni comparación con benchmarks estándar; deben tratarse como indicativos y no como garantía de rendimiento.
- El modelo está diseñado para generar andamiaje de payloads y contenido ofensivo; su despliegue en producción requiere políticas de uso, registro de auditoría y control de acceso para evitar abuso.
- La model card advierte de que el `Modelfile` incluye un system prompt que "hace trabajo real"; omitirlo puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphalabz/VELIX-ALPHA
- Repositorio GGUF: https://huggingface.co/alphalabz/VELIX-ALPHA-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
