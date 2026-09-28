# itamarstahl/lment-1b-baseball-snmf-ratio-both-b131k

## Resumen

LMEnt 1B — Baseball SNMF es un modelo de lenguaje causal en inglés de 1.336.035.328 parámetros (aproximadamente 1,34 mil millones) desarrollado por itamarstahl (Itamar Stahl) junto con Gal Barak, Tamar Tabbach y Adam Fleisher. No es un modelo de propósito general: se trata de un artefacto de investigación derivado de OLMo2 1B, entrenado sobre el corpus Wikipedia anotado por entidades LMEnt, al que se le ha aplicado una edición post-entrenamiento mediante SNMF (Sparse Non-negative Matrix Factorization) para intentar borrar el concepto "béisbol".

El modelo forma parte del trabajo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, en el que se compara la supresión de un concepto mediante edición de pesos (erasure) con su exclusión directa durante el entrenamiento (exclusion). Este checkpoint concreto corresponde a la configuración del apéndice B.3 del artículo: selección de características basada en ratio, aplicada a ambos lados, sobre el modelo de control completo compartido. Su relevancia es metodológica: sirve como punto de comparación reproducible frente a su gemelo con exclusión de concepto y frente al control sin editar.

Es importante subrayar que no es un modelo afinado por instrucciones ni un modelo conversacional en el sentido práctico, pese a la etiqueta `conversational`. Es un modelo base de investigación, con licencia de pesos no declarada y sin resultados publicados de benchmarks estándar (MMLU, HumanEval, GSM8K). Su utilidad está en el estudio de técnicas de edición de representaciones y en la reproducibilidad de experimentos de *machine unlearning*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia OLMo2) |
| Parametros totales | 1.336.035.328 (~1,34 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la edición SNMF se realizó con longitud máxima de secuencia 256) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible (la model card indica que no se afirma licencia de pesos) |
| Formato de pesos | safetensors (repo de 5,3 GB) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1B de parámetros, en inglés, entrenado sobre el corpus Wikipedia anotado por entidades LMEnt. Es un modelo base sin *instruction tuning*. Sobre ese control completo se aplicó directamente SNMF, sin enmascarar del *loss* los fragmentos vinculados al concepto. La edición seleccionada usa selección de características basada en ratio y modifica los pesos de entrada y salida de las capas MLP, factorizando las capas 4 a 6 con rango 100, umbral de ratio 2,0, semilla 42, longitud máxima de secuencia 256 y fuerza de eliminación exacta de componentes igual a 1.

El checkpoint corresponde a la configuración "ratio selection, both sides" del apéndice B.3, con etiqueta candidata `snmf_baseball_ratio_both`. La selección se realizó sobre el split de selección del artículo mediante una regla fija, antes de la evaluación sobre el conjunto de test reservado. Es relevante señalar que todos los candidatos de este método y concepto obtuvieron eficacia de selección cero, por lo que la elección final la determinó la regla de desempate fija.

## Capacidades

- Generación de texto causal en inglés, como modelo base sin ajuste por instrucciones.
- Reproducción del experimento de borrado de concepto "béisbol" mediante edición SNMF de pesos MLP.
- Punto de comparación controlado frente al modelo de control completo y frente al gemelo con exclusión de concepto.
- Análisis de representaciones internas en las capas MLP 4 a 6 (las modificadas por la factorización).
- Compatibilidad con la librería `transformers` y pesos en `safetensors`.
- Etiquetado como compatible con endpoints (`endpoints_compatible`).
- No se documentan capacidades de *tool calling*, función de agentes, razonamiento multi-paso, visión ni audio.
- No se documenta un modo de razonamiento (*thinking mode*).

## Casos de uso

- Investigación en *machine unlearning* y borrado de conceptos: el modelo permite replicar el pipeline SNMF sobre un control conocido y medir cuánto se aproxima la edición a una exclusión real durante el entrenamiento.
- Evaluación comparativa de métodos de edición: junto con EMBER y RMU, este checkpoint sirve para contrastar la eficacia relativa de SNMF bajo una configuración idéntica de datos y semilla.
- Baseline de control en experimentos de ablación: su etiqueta `snmf_baseball_ratio_both` y su semilla 42 lo hacen adecuado como referencia reproducible en estudios de factorización de bajo rango.
- Estudio de sesgos y errores heredados de Wikipedia: al derivar de un corpus enciclopédico, es útil para auditar qué conocimiento factual permanece tras la edición.
- Docencia y reproducción académica: el artículo publica los tres modelos (control, twin y editado), lo que permite a estudiantes reproducir la evaluación de extremo a extremo.
- Análisis de representaciones internas: las capas MLP 4 a 6 factorizadas a rango 100 ofrecen un caso de estudio concreto sobre cómo se codifica un concepto en un transformer pequeño.
- Generación de texto en inglés de dominio general: al ser un modelo base, puede usarse para *prompting* crudo, aunque sin garantías de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta las métricas de evaluación del artículo sobre el conjunto de test reservado:

| Metrica | Valor |
|---|---:|
| `H_test` (eficacia objetivo y preservación) | 0,129 |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 0,967 |
| `R_KL` (distancia KL sobre vocabulario completo con teacher forcing al gemelo / distancia al modelo completo) | 0,962 |

En cualquiera de los dos ratios de proximidad, valores por debajo de 1 indican movimiento hacia el gemelo; valores por encima de 1 indican mayor distancia que el control completo en esa medida. La supresión y el parecido con el gemelo son resultados distintos. La propia model card aclara que todos los candidatos de este método y concepto tuvieron eficacia de selección cero.

## Requisitos de hardware

- El repositorio ocupa 5,3 GB, coherente con pesos en precisión de 32 bits (4 bytes por parámetro). En bf16/fp16 la inferencia requeriría aproximadamente 2,7 GB de VRAM solo para pesos.
- Cuantizado a 8 bits: en torno a 1,3-1,5 GB adicionales para pesos; a 4 bits: alrededor de 0,7-0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede alojar el modelo en bf16/fp16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). Para el rango de 1,3 B de parámetros no es necesario hardware de centro de datos.
- Cabe holgadamente en GPU de consumo; en fp32 necesitaría unos 5,5 GB más el *overhead* del runtime, por lo que una GPU de 8 GB podría quedar justa y una de 12 GB es segura.
- Opciones de despliegue: `transformers` (soporte nativo, tal como muestra la model card), vLLM y TGI para servicio, siempre que la arquitectura OLMo2 esté soportada por la versión correspondiente. llama.cpp y Ollama requerirían convertir previamente los pesos a GGUF, formato no distribuido en este repositorio.
- No se dispone de medidas de latencia ni de *throughput* publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lment-1b-baseball-snmf-ratio-both-b131k (este) | ~1,34 B | no disponible | SNMF post-entrenamiento, ratio, ambos lados | no disponible | HuggingFace |
| lment-1b-control-2e-b131k | no disponible (mismo origen OLMo2 1B) | no disponible | Control completo sin edición | no disponible | HuggingFace |
| lment-1b-nobaseball-2e-b131k | no disponible (mismo origen OLMo2 1B) | no disponible | Exclusión de concepto durante el entrenamiento (*twin*) | no disponible | HuggingFace |
| OLMo2 1B (modelo base de partida) | ~1 B (aproximado, no confirmado en esta información) | no disponible | Modelo base preentrenado | no disponible en esta información | HuggingFace / Allen AI |

Los tres primeros modelos forman el conjunto experimental del artículo y son directamente comparables. La comparación con OLMo2 1B original está limitada porque los datos de contexto, licencia y arquitectura detallada no se detallan en la información proporcionada.

## Limitaciones y advertencias

- El artículo prueba tres conceptos seleccionados con 50 preguntas objetivo reservadas por concepto; estas medidas no establecen una eliminación amplia de conocimiento, ni seguridad, ni generalización a otros conceptos.
- Todos los candidatos de este método y concepto obtuvieron eficacia de selección cero; la elección del checkpoint dependió de la regla de desempate fija, lo que cuestiona la eficacia real del borrado.
- Los ratios `R_abs` y `R_KL` son ligeramente inferiores a 1, pero la model card insiste en que la supresión y el parecido con el gemelo son resultados distintos y no equivalentes.
- Al derivar de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento.
- No se afirma ninguna licencia de pesos en la model card, por lo que el uso comercial queda en un limbo legal y no debe asumirse permitido.
- Modelo base sin ajuste por instrucciones: no cabe esperar comportamiento conversacional fiable ni adherencia a instrucciones.
- Solo soporta inglés.
- Sin benchmarks estándar publicados, es difícil situarlo frente a otros modelos de tamaño similar para tareas generales.
- Riesgo de alucinación inherente a cualquier modelo causal de 1,3 B parámetros y a su entrenamiento sobre texto enciclopédico, no mitigado por ninguna etapa de RLHF o DPO documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-baseball-snmf-ratio-both-b131k
- Modelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusión de concepto: https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Cita del artículo: Gal Barak, Tamar Tabbach, Itamar Stahl, and Adam Fleisher. *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*. 2026. (No se ha localizado un enlace directo al paper en la información disponible.)
