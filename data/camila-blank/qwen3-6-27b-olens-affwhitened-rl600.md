# camila-blank/qwen3.6-27b-olens-affwhitened-rl600

## Resumen

`camila-blank/qwen3.6-27b-olens-affwhitened-rl600` es un adaptador LoRA (PEFT) publicado por el usuario camila-blank que implementa un *activation oracle* (denominado O-lens) sobre el modelo base `Qwen/Qwen3.6-27B`. No es un modelo conversacional: es una herramienta de interpretabilidad que, dado un vector de activación del residual stream de una capa concreta inyectado en el prompt, genera el texto que supuestamente sigue a esa activación. El adaptador se aplica sobre las proyecciones de atención, atención lineal y MLP del modelo base, con rango r=16 y alpha=32.

La relevancia técnica está en el método de entrenamiento: sigue la cadena por defecto de O-lens (AR → SFT sobre salidas del AR → RL de lectura única sobre activaciones reales), pero sustituye el reward AR basado en un LoRA entrenado por un mapa afín cerrado (ridge) puntuado en base blanqueada, lo que reduce el coste de entrenamiento del reward y, según la model card, mejora la precisión conceptual y reduce la tasa de alucinación del texto leído.

El checkpoint publicado corresponde al iteración 600 del RL (`iter_000600/`), e incluye checkpoints intermedios en 150, 300 y 450, además de la política de referencia SFT congelada usada en el término KL. El repositorio ocupa 2,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `Qwen/Qwen3.6-27B`; se aplica a todas las proyecciones de atención, atención lineal y MLP (r=16, alpha=32) |
| Parametros totales | No disponible para el adaptador (el repo de 2,3 GB incluye 4 checkpoints RL y sus referencias SFT); el modelo base se denomina 27B, sin desglose publicado |
| Parametros activos | No procede: no se declara arquitectura MoE |
| Longitud de contexto | No disponible. El uso previsto es un prompt corto y fijo; las capas leídas son L20–L60 con paso 4 |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas del adaptador ni del base en la informacion proporcionada |
| Idiomas soportados | No disponible. El prompt de evaluación y entrenamiento está en inglés |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`) + `adapter_config.json`, formato PEFT/LoRA |
| Token de inyección | `㈜`, id 158983, sobre plantilla de chat con *thinking* desactivado |
| Escalado de activación | Activación residual en bruto (sin blanquear), normalizada a norma unitaria y multiplicada por 16000 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 inyectado en todas las proyecciones de atención, atención lineal y MLP del modelo base. La mención explícita a capas de *linear attention* sugiere que Qwen3.6-27B emplea una arquitectura híbrida, pero no se proporciona confirmación ni detalles de la misma. El contrato de inyección es estricto: se leen activaciones residuales en bruto de las capas L20 a L60 con paso 4, se normalizan a norma unitaria, se escalan por 16000 y se escriben en el token marcador `㈜` (id 158983) dentro de una plantilla de chat con el modo *thinking* desactivado.

El entrenamiento sigue la cadena estándar de O-lens en tres fases: primero un *activation reconstructor* (AR), después un SFT sobre las salidas del AR y finalmente un RL de lectura única sobre activaciones reales. La innovación declarada afecta únicamente al reward: en lugar de un AR LoRA entrenado, se usa un mapa afín cerrado (ridge) evaluado en base blanqueada —de ahí el sufijo `affwhitened`—. El RL incorpora un término KL contra una política de referencia SFT congelada, que se distribuye en `iter_*/reference/`. El entrenamiento alcanza al menos 600 iteraciones, con checkpoints en 150, 300, 450 y 600. La evaluación se realiza con 4 muestras a temperatura 1 y una única lectura por muestra.

## Capacidades

- Lectura de activaciones: dado un vector del residual stream de una capa entre L20 y L60 (paso 4), genera el texto que sigue a esa activación en el contexto original.
- Identificación de conceptos: la model card reporta precisión/recall@10 en J-lens de 0,416 / 0,587 de media en L20–L60, frente a 0,275 / 0,502 del O-lens por defecto.
- Lectura con menor tasa de alucinación: 6,6 % de texto alucinado en HallucinationBench v2 frente al 8,5 % del O-lens por defecto.
- Razonamiento multi-paso sobre el estado interno (*workspace*): evaluado en WorkspaceBench v1 (macro 0,722 en 24 familias) y en la tarea `multihop_mt_v2` (0,729).
- Capacidad de comparar capas: al cubrir un rango amplio de capas permite estudiar cómo evoluciona la información a lo largo de la profundidad de la red.
- No soporta *tool calling*, ni uso como agente, ni generación de código o matemáticas como asistente general: su dominio es la decodificación de representaciones internas.
- Multilingüismo: no evaluado; el prompt canónico está en inglés.

## Casos de uso

- Auditoría de representaciones internas: inyectar activaciones de capas intermedias de Qwen3.6-27B y comprobar qué contenido textual codifican, para construir mapas de conceptos por capa.
- Detección de alucinaciones en investigación de fiabilidad: usar la lectura del estado interno como señal auxiliar para identificar contenido no fundamentado, aprovechando la reducción al 6,6 % en HallucinationBench v2.
- Mecánica interpretativa comparada: ejecutar el mismo conjunto de activaciones con el O-lens por defecto y con este checkpoint para aislar el efecto del reward afín en la fidelidad de la lectura.
- *Red-teaming* y seguridad: inspeccionar si el modelo base codifica información sensible o instrucciones latentes que no aparecen en la salida superficial.
- Evaluación de *fine-tuning*: comparar lecturas antes y después de un ajuste del modelo base para verificar qué conocimiento se ha modificado en capas concretas.
- Investigación de arquitecturas híbridas: analizar la diferencia de representación entre capas de atención estándar y de atención lineal dentro del mismo modelo.
- Reproducibilidad de experimentos de RL: los checkpoints intermedios (150/300/450/600) y la política de referencia congelada permiten trazar la curva de aprendizaje del oráculo.

## Benchmarks y rendimiento

Los datos provienen de la model card y están evaluados con un único juez Claude Opus 5.5 para todas las familias, por lo que no son cifras oficiales de WorkspaceBench.

| Metrica | O-lens por defecto | Este modelo (RL600) |
|---|---|---|
| WorkspaceBench v1 macro (24 familias) | 0,744 | 0,722 |
| HallucinationBench v2, proporcion de texto alucinado (menor es mejor) | 8,5 % | 6,6 % |
| J-lens precision@10 (media L20–L60) | 0,275 | 0,416 |
| J-lens recall@10 (media L20–L60) | 0,502 | 0,587 |
| WorkspaceBench multihop_mt_v2 | 0,857 | 0,729 |

Lectura: el checkpoint mejora de forma clara en precisión y recall conceptuales y reduce la alucinación, pero retrocede en el agregado de WorkspaceBench y de forma acusada en la tarea multi-paso. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables al tratarse de un adaptador de interpretabilidad y no de un modelo instructivo.

## Requisitos de hardware

- El adaptador pesa del orden de decenas de MB por checkpoint; el repositorio completo ocupa 2,3 GB por incluir cuatro iteraciones y sus políticas de referencia.
- El coste real está en el modelo base de 27B: en bf16 requiere aproximadamente 54 GB de VRAM (una A100 80GB o H100 80GB, o dos RTX 4090 de 24 GB).
- En cuantización de 8 bits, en torno a 27–28 GB: A100 40GB o dos GPU de 24 GB.
- En cuantización de 4 bits, en torno a 15–16 GB: cabe en una RTX 4090, RTX 3090 o L40S de 24 GB, con margen limitado para el contexto.
- No cabe en GPU de consumo de 8–12 GB en ninguna precisión razonable.
- Despliegue: `transformers` + `peft` es la vía directa; vLLM y TGI admiten LoRA multi-adaptador; llama.cpp y Ollama no son aplicables sin una conversión a GGUF, que no se distribuye.
- Latencia y throughput: no disponibles. La evaluación usa 4 muestras a temperatura 1 con una lectura por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (affwhitened RL600) | LoRA r=16 sobre base 27B | No disponible | WS v1 0,722; J-lens P/R 0,416/0,587; alucinacion 6,6 % | No disponible | HuggingFace, 0 descargas |
| O-lens por defecto (mismo base) | LoRA sobre base 27B | No disponible | WS v1 0,744; J-lens P/R 0,275/0,502; alucinacion 8,5 % | No disponible | Referencia citada en la model card, sin enlace |
| Qwen/Qwen3.6-27B (modelo base sin adaptador) | 27B (denominacion) | No disponible | No aplica: no es un oraculo de activaciones | No disponible | HuggingFace |
| Otros *activation oracles* | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada otros adaptadores de interpretabilidad comparables sobre el mismo modelo base.

## Limitaciones y advertencias

- La licencia no está declarada, ni la del adaptador ni la del modelo base: no hay base legal explícita para uso comercial. Es un bloqueante para producción.
- No es un modelo de chat ni un asistente: usarlo fuera del contrato de inyección produce resultados sin significado.
- El contrato es frágil: depende del token `㈜` con id 158983, de la plantilla de chat concreta, del modo *thinking* desactivado, del rango L20–L60 con paso 4 y del escalado ×16000. Cualquier variación invalida las métricas publicadas.
- Tasa de alucinación del 6,6 % en HallucinationBench v2: el texto leído puede afirmar contenido que no estaba en la activación. No debe tratarse como prueba definitiva de lo que el modelo "piensa".
- Degradación en razonamiento multi-paso: 0,729 frente a 0,857 del O-lens por defecto en `multihop_mt_v2`, y descenso en el macro de WorkspaceBench (0,722 frente a 0,744). El reward afín no es mejor en todas las familias.
- Las cifras están juzgadas por un único modelo (Claude Opus 5.5) y no por los jueces fijados de cada familia; no son comparables con resultados oficiales de WorkspaceBench.
- Solo se ha evaluado con prompt en inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Sesgos: no documentados. Al leer representaciones del modelo base, puede reproducir sus sesgos latentes sin ningún filtro de salida.
- Madurez: 0 descargas y 0 likes, sin revisión externa ni resultados replicados de forma independiente.
- La información disponible no incluye detalles del dataset de entrenamiento del oráculo (número de activaciones, procedencia del corpus), lo que limita la reproducibilidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/camila-blank/qwen3.6-27b-olens-affwhitened-rl600
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados obtenidos corresponden a la artista Camila Cabello y a un restaurante homónimo, sin relación con el modelo. No se dispone de paper, blog, repositorio de código ni demo asociados en la información proporcionada.
- Referencias internas citadas en la model card, sin URL disponible: WorkspaceBench v1, HallucinationBench v2, J-lens y el hilo "global-workspace #535" (celda `affw`).
