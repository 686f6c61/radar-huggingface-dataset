# AxisMeru/prabhasa-nyaya-step2-sft-arm-c-discrim16

## Resumen

prabhasa-nyaya 3B (checkpoint `arm_c_ordervol_discrim16`) es un ajuste fino de investigación sobre el modelo base `Qwen/Qwen2.5-3B`, desarrollado por AxisMeru dentro del programa Prabhāsa-Nyāya. Su propósito no es la asistencia jurídica general, sino emitir pruebas estructuradas línea a línea sobre lecturas de 14 artículos del derecho penal indio (IPC 405/415/416/182 y BNS 46/47/69/85) en un formato de «cable» que un verificador compilado en Lean 4 acepta o rechaza. El modelo se entrenó con supervisión completa de todos los parámetros y produce salidas con etiquetas NODE, CLAIM, PRATIJNA, HETU, UDAHARANA, UPANAYA, NIGAMANA, HETVABHASA, CITE, ABSTAIN y ANSWER.

Es relevante ahora porque ejemplifica una línea de trabajo poco habitual: usar verificación formal (Lean 4) como criterio de aceptación medible en lugar de métricas de similitud textual. El autor reporta 108 de 377 pruebas aceptadas por el comprobador (28,65 %) y 4 de 389 falsas pruebas en casos donde la sección no debería aplicarse (1,03 %, por debajo del techo del 2 %), aunque el rechazo correcto sigue sin resolverse: solo 7 de 389 abstenciones correctas (1,8 % frente a un objetivo del 90 %).

Se trata de un artefacto de investigación con licencia Qwen Research, uso no comercial, publicado con 0 descargas y 0 «likes» en el momento de redactar esta ficha. No sirve como asesoramiento jurídico ni cubre jurisprudencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, segun el tag `qwen2` y el modelo base Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 (datos reales de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen2.5-3B (32.768 tokens nativos, ampliables con YaRN), dato no confirmado por el autor |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors. El repo ocupa 6,2 GB para 3,09 mil millones de parametros, lo que corresponde aproximadamente a 2 bytes por parametro (bf16/fp16), no confirmado |
| Idiomas soportados | en (ingles) |
| Licencia | `other` / qwen-research. Uso no comercial de investigacion; el uso comercial requiere permiso de Alibaba Cloud. Derivado de Qwen2.5-3B |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only denso. El ajuste no modifica la topologia: se realizó un fine-tuning supervisado de parámetros completos sobre el modelo preentrenado (no sobre la variante Instruct), en una RTX 5090 local, con unas 14 minutos de entrenamiento y un pico de unos 24 GB de memoria. Los datos de entrenamiento provienen de los niveles P2b de `AxisMeru/prabhasa-nyaya` (privado): 344 ejemplos de prueba/omisión escritos por un profesor y verificados en Lean, sobre 14 lecturas de estatutos indios (IPC 405/415/416/182, BNS 46/47/69/85), más filas de abstención e identificación de estatuto. El nivel de abstención se submuestreó de 5.255 a 1.000 filas y se entrenó antes que las pruebas («order + volume»), lo que según el autor corrigió un colapso previo sobre una única plantilla repetida.

La innovación destacable no está en la arquitectura sino en el contrato de salida y en el procedimiento de evaluación. Las indicaciones de entrenamiento son texto plano generado por `render_prompt()` en `prabhasa_nyaya/p2b_preflight.py`, sin plantilla de chat; el autor advierte explícitamente que los prompts en formato chat quedan fuera de distribución. La evaluación usa decodificación restringida por gramática (`WireGrammarLogitsProcessor`, con `repetition_penalty` 1.15) sobre un conjunto congelado de 377 casos en los que la sección aplica y 389 en los que no, con una única ejecución y una única semilla. La configuración añade 16 casos de entrenamiento de «se parece a la sección X pero no lo es», que según el autor sitúan las pruebas falsas por debajo del techo del 2 %.

## Capacidades

- Generación de pruebas jurídicas estructuradas en el formato de cable: NODE, CLAIM, PRATIJNA, HETU, UDAHARANA, UPANAYA, NIGAMANA, HETVABHASA, CITE, ABSTAIN y ANSWER.
- Razonamiento formal aplicado: la salida está pensada para ser compilada y validada por un verificador Lean 4 con hash fijado (`9bff8f30`).
- Identificación de estatuto dentro del conjunto cerrado de 14 lecturas cubiertas.
- Emisión de abstención (ABSTAIN) como etiqueta de primera clase, aunque el rendimiento medido en rechazo correcto es de 1,8 %.
- Discriminación de casos límite que «parecen» encajar en una sección pero no lo hacen (16 casos de entrenamiento específicos de este brazo).
- Generación de texto condicionada por gramática: la salida solo es fiable con el decodificador restringido activado.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio, modo «thinking» ni capacidades multilingües (solo inglés).

## Casos de uso

- Verificación formal de interpretaciones penales en investigación computacional del derecho: el modelo genera un esqueleto de prueba que se pasa al comprobador Lean 4 y se acepta o rechaza de forma binaria, lo que permite medir rigor de forma objetiva en lugar de con similitud textual.
- Banco de pruebas para pipelines de neurosymbolic reasoning: al fijar un contrato de salida (formato de cable) y un verificador externo, sirve como banco de pruebas reproducible para estudiar cómo la decodificación restringida por gramática cambia la tasa de aceptación.
- Estudio del fallo de abstención: con 195 de 263 salidas malformadas que escriben `ELEMENT elN GUNA` donde corresponde `NODE elN GUNA`, es un caso de estudio útil sobre errores sistemáticos inducidos por el entrenamiento y sobre la diferencia entre no responder y responder mal.
- Comparación de brazos de ajuste fino: el checkpoint `arm_c_ordervol_discrim16` está pensado como la mejor configuración a fecha de 2026-09-22 dentro de una serie de experimentos, por lo que sirve como referencia base en ablaciones sobre datos de abstención, orden de entrenamiento y volumen.
- Anotación asistida de corpus jurídicos indios: el formato estructurado con CITE y HETU puede usarse como formato intermedio de anotación para que revisores humanos corrijan, siempre con verificación posterior.
- Docencia e investigación académica sobre razonamiento jurídico formal: permite ilustrar en un aula cómo se traduce una lectura estatutaria a una estructura silogística verificable y dónde falla el modelo.
- Servicio de inferencia para experimentos: los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse en TGI para pruebas internas, siempre con el procesador de gramática acoplado.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre el conjunto congelado P2b (377 casos con sección aplicable, 389 sin ella), con decodificación restringida por gramática, `repetition_penalty` 1.15, una sola ejecución y una sola semilla:

| Medida | Resultado | Objetivo |
|---|---|---|
| Pruebas aceptadas por el verificador Lean | 108 / 377 (28,65 %) | no especificado |
| Pruebas falsas en casos que no deberian aplicar | 4 / 389 (1,03 %) | por debajo del 2 % (cumplido) |
| Rechazos correctos | 7 / 389 (1,8 %) | 90 % (muy lejos del objetivo) |
| Salidas malformadas con `ELEMENT elN GUNA` en lugar de `NODE elN GUNA` | 195 de 263 salidas malformadas | no especificado |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ni comparaciones cuantitativas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 3,09 mil millones de parámetros ocupan aproximadamente 6,2 GB de pesos, más memoria para caché KV y activaciones (del orden de 1 a 3 GB adicionales según longitud de contexto y lote). En cuantización de 4 bits cabría en torno a 2 GB de pesos, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: el entrenamiento se hizo en una RTX 5090 con un pico de unos 24 GB. Para inferencia, cualquier GPU con 8 GB o más es suficiente en bf16, y una RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 o A100/H100 funcionan sin problema.
- Cabe en GPU de consumo: sí. Con 6,2 GB de pesos en bf16, entra en GPUs de 8 GB con contexto corto y en cualquier GPU de 12 GB o más con margen amplio.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (el tag `text-generation-inference` y `endpoints_compatible` están presentes). No hay confirmación de compatibilidad con llama.cpp, Ollama o vLLM, y al no existir pesos GGUF publicados, la ruta recomendada es transformers o TGI con el procesador de gramática del autor.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 3B en bf16 sobre una GPU de consumo moderna suele generar decenas de tokens por segundo, pero el autor no publica mediciones.
- Advertencia de despliegue: las puntuaciones solo son válidas con el decodificador restringido (`WireGrammarLogitsProcessor`) y el comprobador Lean. La generación libre sin restricciones es, según el autor, mucho peor.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este checkpoint, y la tarea es lo bastante específica como para que las alternativas de propósito general no sean equivalentes. Comparación por especificaciones:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prabhasa-nyaya 3B (arm_c_ordervol_discrim16) | 3,09 mil M | no disponible (base Qwen2.5-3B) | Pruebas formales en Lean sobre 14 lecturas penales indias | qwen-research (no comercial) | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-3B (base) | 3,09 mil M | 32.768 tokens (131.072 con YaRN) | Generacion de texto general | Apache 2.0 (segun el modelo original de Qwen) | Ampliamente disponible |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil M | 32.768 tokens (131.072 con YaRN) | Instrucciones y dialogo | Apache 2.0 (segun el modelo original de Qwen) | Ampliamente disponible |
| Llama-3.2-3B | 3,21 mil M | 128.000 tokens | Generacion de texto e instrucciones | Llama 3.2 Community License | Ampliamente disponible |

La comparación relevante no es de rendimiento general sino de encaje: frente a los modelos de propósito general, este checkpoint renuncia deliberadamente a la conversalidad y a la plantilla de chat para ganar un contrato de salida verificable. Los datos de licencia de las alternativas se incluyen como referencia de contexto; conviene verificarlos en sus propias fichas.

## Limitaciones y advertencias

- Artefacto de investigación, no asesoramiento jurídico. Cubre únicamente 14 lecturas de estatutos y no incluye jurisprudencia ni casuística.
- El rechazo correcto no está resuelto: solo 7 de 389 casos (1,8 %) producen una abstención limpia, frente al objetivo del 90 %. La mayoría de los casos que no deberían aplicar generan salidas malformadas.
- Error sistemático de entrenamiento: 195 de 263 salidas malformadas escriben `ELEMENT elN GUNA` donde corresponde `NODE elN GUNA`. Ninguna fila de entrenamiento contiene ese error, por lo que es una patología inducida durante el ajuste.
- Las puntuaciones solo son significativas con decodificación restringida por gramática y el comprobador Lean acoplado. La generación libre es sensiblemente peor.
- Los prompts en formato chat están fuera de distribución: el modelo se entrenó con texto plano sin plantilla de conversación, pese al tag `conversational` del repositorio.
- Solo inglés. No hay evidencia de capacidades multilingües.
- Licencia Qwen Research: uso no comercial de investigación. Cualquier uso comercial requiere permiso de Alibaba Cloud. Es un derivado de Qwen2.5-3B y arrastra sus condiciones.
- Riesgo de alucinación alto en todo lo que quede fuera del conjunto cerrado de 14 lecturas y del formato de cable: el modelo puede producir una prueba sintácticamente plausible con una cita inventada, y solo el verificador Lean la detendrá.
- Sin datos de sesgo publicados. Es razonable esperar los sesgos del corpus del modelo base, no medidos para este checkpoint.
- Las cifras de evaluación son de una única ejecución y una única semilla, sin intervalos de confianza ni repeticiones, por lo que la variabilidad no está cuantificada.
- Advertencia de seguridad: no debe desplegarse en producción jurídica, ni siquiera como ayuda a la decisión, sin revisión humana experta y verificación externa completa.

## Enlaces

- HuggingFace: https://huggingface.co/AxisMeru/prabhasa-nyaya-step2-sft-arm-c-discrim16
- Repositorio de datos de entrenamiento (privado, citado por el autor): `AxisMeru/prabhasa-nyaya`
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Archivos de métricas citados en la model card: `training_metrics.json`, `eval_summary.json`
- Script de preflight citado por el autor: `prabhasa_nyaya/p2b_preflight.py`
- Comprobador Lean 4 con hash fijado `9bff8f30` (referenciado, sin URL pública en la información disponible)
- Programa Prabhāsa-Nyāya (AxisMeru): sin URL pública en la información disponible
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a contenido no relacionado (tutoriales de punto) y se han descartado.
