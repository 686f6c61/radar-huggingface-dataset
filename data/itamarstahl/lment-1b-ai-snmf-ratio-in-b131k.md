# itamarstahl/lment-1b-ai-snmf-ratio-in-b131k

## Resumen

`itamarstahl/lment-1b-ai-snmf-ratio-in-b131k` es un checkpoint de investigación publicado por Itamar Stahl (usuario `itamarstahl`) como artefacto del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, 2026). Se trata de un modelo de lenguaje causal OLMo2 de aproximadamente 1.000 millones de parámetros, en inglés y sin ajuste por instrucciones, sobre el que se aplica una edición post-entrenamiento con SNMF (factorización matricial no negativa dispersa) para borrar el concepto "inteligencia artificial (AI)".

El punto de partida no es el modelo base original de OLMo2, sino el *full control* compartido de la familia LMEnt (`lment-1b-control-2e-b131k`), entrenado sobre el corpus Wikipedia con anotaciones de entidades LMEnt. La edición SNMF se aplica directamente sobre ese control ya completado, sin enmascarar fragmentos vinculados al concepto durante el entrenamiento, y su gemelo con exclusión de concepto (`lment-1b-noai-2e-b131k`) se entrenó por separado. El objetivo del artefacto es permitir una comparación emparejada entre métodos de borrado (EMBER, RMU, SNMF) y entre supresión del concepto y mera exclusión de datos.

Su relevancia es metodológica más que de producto: sirve para estudiar si un método de *concept erasure* reproduce el comportamiento de un modelo entrenado sin ese concepto, o si solo lo suprime superficialmente. Es un modelo de 0 descargas y 0 *likes* en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks generales publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia OLMo2; modelo base sin *instruction tuning* |
| Parámetros totales | ~1B (según el nombre del checkpoint; no se da la cifra exacta en la información disponible) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la ficha; solo se publican pesos en safetensors, la cuantización queda a cargo del usuario |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (la model card indica explícitamente que no se afirma ninguna licencia sobre los pesos) |
| Formato de pesos | safetensors, cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia OLMo2, entrenado originalmente sobre el corpus Wikipedia con anotaciones de entidades LMEnt. No tiene *instruction tuning* ni alineación por RLHF o DPO: es un modelo base orientado a la modelización de lenguaje. Sobre ese control completado se aplica SNMF, que factoriza las capas 4 a 6 en rango 100 con umbral de ratio 2,0, semilla 42, longitud máxima de secuencia 256 y fuerza de eliminación de componentes exacta igual a 1. La variante seleccionada usa **selección de características basada en ratio** y edita los pesos de **entrada de las MLP** (etiqueta candidata `snmf_ai_ratio_in`, configuración del apéndice B.3 del artículo). La selección del checkpoint se hizo sobre el *split* de selección del artículo con una regla fija, antes de la evaluación en el conjunto de test reservado.

La innovación metodológica del artefacto no está en la arquitectura, sino en el protocolo experimental: el modelo se empareja con un control completo y con un gemelo entrenado con exclusión de concepto, de modo que las métricas miden de forma separada la eficacia de la supresión y la semejanza con el gemelo. El artículo evalúa tres conceptos seleccionados con 50 preguntas reservadas por concepto, y advierte que la supresión del concepto y la semejanza al gemelo son resultados distintos que no deben confundirse.

## Capacidades

- Generación de texto en inglés en modo continuación, sin formato conversacional ni plantilla de chat (modelo base sin *instruction tuning*).
- Modelización de lenguaje: útil para calcular *perplexity* (NLL) y para *probing* de representaciones internas.
- Condición experimental de *concept erasure*: permite medir la eficacia de la edición SNMF sobre el concepto "AI" con las métricas del artículo.
- Punto de partida reproducible para comparar métodos de borrado (EMBER, RMU, SNMF) bajo el mismo control.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado ni esperable en un modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: ninguna más allá del inglés declarado.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Reproducción del experimento del artículo: cargar el checkpoint con `transformers` y recalcular `H_test`, `R_abs` y `R_KL` para verificar los valores publicados (0,129; 0,927; 0,992) sobre el *split* de test reservado.
- Evaluación comparativa de métodos de borrado: usar este checkpoint como brazo SNMF frente a los brazos EMBER y RMU dentro de un mismo protocolo emparejado, manteniendo constante el control y el gemelo.
- Investigación en interpretabilidad: inspeccionar los pesos de entrada de las MLP de las capas 4 a 6 (rango 100, umbral 2,0) para estudiar qué direcciones se eliminan y cuáles se preservan tras la factorización.
- Validación de métricas de *concept erasure*: emplear los ratios de proximidad (`R_abs`, `R_KL`) como casos de prueba para calibrar métricas que se acercan a 1 y por tanto no distinguen bien supresión de semejanza.
- Docencia y divulgación técnica: ejemplo mínimo y autocontenido (1B, formato safetensors, 0 descargas) para explicar en clase cómo se edita un modelo post-entrenamiento sin reentrenar.
- Análisis lingüístico controlado en inglés: generar continuaciones de texto para estudiar el efecto de la edición sobre la distribución léxica en el dominio Wikipedia, siempre como experimento y no como servicio.
- Línea base para técnicas alternativas de edición: aplicar *fine-tuning*, ablación de direcciones o *steering* adicional sobre este checkpoint y comparar contra el control y el gemelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta las tres métricas propias del artículo sobre el conjunto de test reservado:

| Métrica | Valor | Interpretación según los autores |
|---|---:|---|
| `H_test` (eficacia de objetivo y preservación) | 0,129 | Métrica compuesta de eficacia y preservación sobre el objetivo |
| `R_abs` (distancia de NLL a la respuesta correcta respecto al gemelo / al modelo completo) | 0,927 | Por debajo de 1 indica acercamiento al gemelo; por encima, mayor distancia que el control |
| `R_KL` (distancia KL *teacher-forced* sobre el vocabulario completo respecto al gemelo / al modelo completo) | 0,992 | Igual interpretación que `R_abs` |

Ambos ratios quedan muy próximos a 1 (0,927 y 0,992), lo que indica un desplazamiento muy leve hacia el gemelo con exclusión de concepto. La model card insiste en que la supresión del concepto y la semejanza al gemelo son resultados distintos y no deben presentarse como equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado de un modelo denso de ~1B; no son cifras publicadas por el autor):
  - bf16/fp16: ~2,0–2,5 GB de pesos, ~3–4 GB con caché KV y *overhead* del runtime.
  - int8: ~1,2 GB.
  - 4 bits (NF4/GPTQ): ~0,7 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problemas. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, de forma holgada, incluidas GPU de portátil con 6–8 GB. También es viable en CPU para pruebas puntuales.
- Opciones de despliegue: `transformers` es la vía documentada en la model card (ejemplo con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="auto")`). vLLM y TGI son compatibles con safetensors de un transformer causal estándar. llama.cpp y Ollama requieren convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.
- Nota: la longitud máxima de secuencia usada durante la edición SNMF fue 256, pero la ventana de contexto efectiva del modelo no se especifica en la información disponible.

## Comparativa con modelos similares

La comparación natural es dentro de la propia familia de artefactos del artículo, ya que no se ofrecen datos frente a modelos externos:

| Modelo | Relación | Parámetros | Contexto | Edición | Licencia |
|---|---|---:|---|---|---|
| `lment-1b-ai-snmf-ratio-in-b131k` (este) | Edición SNMF sobre el control | ~1B | no disponible | SNMF, ratio, lado de entrada, capas 4–6, rango 100 | no disponible |
| `itamarstahl/lment-1b-control-2e-b131k` | Control completo de partida | ~1B | no disponible | ninguna | no disponible |
| `itamarstahl/lment-1b-noai-2e-b131k` | Gemelo con exclusión de concepto | ~1B | no disponible | entrenamiento con el concepto excluido (por separado) | no disponible |

Frente a alternativas externas de la misma categoría (modelos de ~1B para *concept erasure* como los basados en EMBER o RMU), la información disponible no incluye parámetros, contexto ni resultados comparables; por tanto, la comparativa cuantitativa con modelos de terceros es "no disponible".

## Limitaciones y advertencias

- Alcance experimental muy reducido: el artículo prueba tres conceptos con 50 preguntas reservadas por concepto; los resultados no establecen eliminación amplia de conocimiento, seguridad ni generalización a otros conceptos.
- Los ratios de proximidad quedan cerca de 1 (`R_abs` = 0,927; `R_KL` = 0,992), de modo que el desplazamiento hacia el gemelo es leve; no debe interpretarse como una reproducción de la exclusión de concepto.
- Licencia no declarada: la model card afirma explícitamente que no se reclama licencia sobre los pesos, lo que genera incertidumbre legal para cualquier uso comercial.
- Sesgos heredados: modelo base derivado de Wikipedia, por lo que puede reproducir errores y sesgos presentes en su material de entrenamiento.
- No es un modelo de chat: al no tener *instruction tuning* ni alineación, no sigue instrucciones, no soporta *tool calling* y no es adecuado para agentes.
- Riesgo de alucinación propio de un modelo de lenguaje base, sin salvaguardas de seguridad ni moderación.
- Cobertura de idiomas limitada al inglés declarado.
- Longitud de contexto, parámetros exactos y licencia no verificables con la información proporcionada.
- Metadatos poco habituales: el repositorio aparece creado y actualizado en septiembre de 2026, con 0 descargas y 0 *likes*, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-ai-snmf-ratio-in-b131k
- Modelo control completo de partida: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusión del concepto AI: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Artículo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se proporciona enlace al paper en la información disponible).
- Repositorio del modelo base de la familia OLMo2 (Allen Institute for AI): no se proporciona enlace directo en la información disponible.
