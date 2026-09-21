# sadmanht/evalforge-mistral-7b-incident-diagnosis-qlora

## Resumen

EvalForge Mistral-7B Incident-Diagnosis QLoRA es un adaptador PEFT (LoRA/QLoRA) publicado por el usuario sadmanht sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. No es un modelo completo, sino un artefacto de investigación de 0,2 GB que contiene únicamente los pesos del adaptador, pensado para reproducir el benchmark de diagnóstico de incidentes en producción de EvalForge. El repositorio declara explícitamente que no está destinado a respuesta autónoma ante incidentes reales, sino a investigación reproducible.

El adaptador se entrenó en la ejecución `phase9-qlora-validation-v1` con el dataset `evalforge-incident-diagnosis-v0.1.0`, el prompt `zero-shot-baseline-v1` y el esquema de salida `root-cause-prediction-v1`. La selección del checkpoint se hizo por `eval_loss` de validación antes del test bloqueado de la fase 10, y el autor declara que el resultado del test bloqueado no se usó para reentrenar, cambiar de checkpoint, modificar el prompt ni alterar la decodificación. El runtime científico usa bitsandbytes en 4-bit NF4, doble cuantización y cómputo en float16 con decodificación determinista.

Su relevancia es metodológica más que de rendimiento: el propio autor documenta que el baseline zero-shot obtuvo 1,000 de exactitud frente al 0,833 del modelo ajustado en los mismos seis incidentes del test bloqueado, con un intervalo de confianza bootstrap pareado del 95 % de [-0,500, 0,000] y un test exacto de McNemar de p = 1,000. Es, por tanto, un ejemplo de publicación de resultados negativos con trazabilidad completa (hashes de adaptador, configuración y evidencia de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (PEFT) sobre transformer decoder-only denso Mistral-7B-Instruct-v0.3 |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 7,24 mil millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Mistral-7B-Instruct-v0.3 admite 32.768 tokens |
| Tipos de cuantizacion | Entrenado y evaluado con bitsandbytes 4-bit NF4 con doble cuantizacion y computo en float16 (segun la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; el repositorio no publica GGUF) |

Datos adicionales de identidad congelada: revision del modelo base `e8737b84b4470b28db3a0be719b362b1bd39a14d`, SHA-256 del adaptador `e8ebf0c51d241516bd3c6bb44e476df6d412aaf6926705ecc53ca8cc3fcec065`, tamano del repositorio 0,2 GB, creado el 21 de septiembre de 2026, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso con atención de ventana deslizante sobre el modelo base Mistral 7B. La model card no detalla el rango LoRA, los módulos objetivo (`target_modules`), el `alpha` ni el `dropout` utilizados; esa información figura únicamente en el hash de la configuración de entrenamiento (`b322d37e...`), no reproducido en el README. El entrenamiento se realizó con QLoRA, es decir, el modelo base cuantizado en 4-bit NF4 con doble cuantización y cómputo en float16, y la inferencia de referencia usa la misma configuración con decodificación determinista.

En cuanto a los datos, el entrenamiento usa exclusivamente familias de incidentes de train; las familias de validación controlan la elección de checkpoint e hiperparámetros, y las familias de test están bloqueadas y nunca se emplean como ejemplos de entrenamiento. Los descendientes sintéticos, cuando existen, solo se permiten para familias de train y conservan el linaje de la familia padre. La tarea es una predicción de causa raíz con salida JSON estricta (`root-cause-prediction-v1`) limitada a 128 tokens de generación. No se menciona RLHF, DPO ni ninguna innovación de decodificación especulativa; el evaluador empleado es `phase5-evaluator-v1`. La matriz de eficiencia de datos de la fase 10 se describe como análisis descriptivo secundario y no reemplaza ni selecciona este adaptador primario.

## Capacidades

- Generación de texto orientada a una única tarea: diagnóstico de causa raíz de incidentes de producción a partir de una narrativa de incidente, con salida estructurada en JSON según el esquema `root-cause-prediction-v1`.
- Razonamiento de diagnóstico dentro de un contrato de prompt congelado (`zero-shot-baseline-v1`); el modelo no está entrenado para prompts arbitrarios fuera de ese contrato.
- Salida estructurada JSON sujeta a un límite estricto de 128 tokens, con tasa de fallo de parseo medida del 0,166667 en el test bloqueado.
- No hay evidencia en la información disponible de soporte de tool calling o function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas y el dataset de entrenamiento no se describe lingüísticamente.
- Capacidad de investigación reproducible: el artefacto viene con hashes verificables de adaptador, configuración de entrenamiento y evidencia, lo que permite replicar la evaluación.

## Casos de uso

- Reproducción de benchmarks de investigación: cargar la revisión exacta del modelo base y el adaptador bajo `adapter/` con Transformers + PEFT para verificar los resultados publicados de exactitud y tasa de fallo de parseo, dado que el repositorio conserva predicciones crudas y hashes.
- Estudio de resultados negativos y ajuste fino con pocos datos: sirve como caso documentado en el que un ajuste QLoRA sobre seis incidentes de test no supera al baseline zero-shot (0,833 frente a 1,000), útil para discutir el sobredimensionamiento de conclusiones con muestras pequeñas.
- Auditoría de trazabilidad de artefactos: el contrato de model card (`phase10-huggingface-model-card-v1`) permite usar este repositorio como plantilla para publicar adaptadores con identidad congelada y evidencia verificable.
- Prototipado de asistentes internos de diagnóstico: se puede integrar en un pipeline de análisis de post-mortems para proponer una causa raíz en formato JSON, siempre con revisión humana y como investigación, nunca como respuesta autónoma ante incidentes.
- Extracción de causas raíz en formato estructurado: al forzar JSON, las predicciones se pueden ingerir en herramientas de observabilidad o en bases de datos de incidencias para su comparación con la causa real registrada.
- Docencia y formación en ingeniería de fiabilidad: el par adaptador más modelo base, con su límite de 128 tokens y su contrato de prompt, es un ejemplo concreto de cómo los contratos de salida afectan a la tasa de fallo de parseo.
- Comparación metodológica de configuraciones QLoRA: el hash de configuración de entrenamiento y el runtime declarado (NF4, doble cuantización, float16, decodificación determinista) permiten estudiar la reproducibilidad de ajustes con bitsandbytes.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card. El benchmark contiene seis incidentes de validación y seis de test bloqueado.

| Split / rama | Exactitud exacta | Tasa de fallo de parseo |
|---|---:|---:|
| Ajustado, validacion | 0,833333 | 0,166667 |
| Ajustado, test bloqueado | 0,833333 | 0,166667 |
| Zero-shot, test bloqueado | 1,000000 | 0,000000 |

En los seis incidentes pareados de test bloqueado, la diferencia de exactitud exacta entre ajustado y zero-shot fue de -0,166667. El intervalo bootstrap pareado del 95 % con 10.000 remuestreos fue [-0,500000, 0,000000] y el test exacto bilateral de McNemar dio p = 1,000000. El único fallo del modelo ajustado en test bloqueado fue un fallo de parseo `INVALID_JSON` tras alcanzar el límite congelado de 128 tokens de salida. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa aproximadamente 0,2 GB, pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3 (unos 7,24 mil millones de parametros) para funcionar.
- VRAM estimada para el modelo base: alrededor de 14,5 GB en float16, unos 8 GB en cuantización de 8 bits y unos 4-5 GB en 4-bit NF4, que es la configuración declarada por el autor.
- Con 4-bit NF4 cabe en GPU de consumo con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080, RTX 4070, RTX 4080 y RTX 4090.
- GPU profesionales recomendadas para reproducir el runtime declarado: A100, H100, L40S o A6000, aunque no son necesarias para inferencia con el adaptador cuantizado.
- Opciones de despliegue: Transformers + PEFT es el camino documentado en la model card. No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirían fusionar el adaptador con el modelo base y convertirlo. vLLM y TGI pueden servir el adaptador mediante soporte LoRA, pero no se documenta ni valida esa ruta en el repositorio.
- Latencia y throughput: no disponibles. La única restricción de rendimiento documentada es el límite de 128 tokens de salida y la decodificación determinista.
- El adaptador no incluye tokenizador propio: se debe usar el del modelo base en la revisión exacta indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el benchmark EvalForge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvalForge Mistral-7B Incident-Diagnosis QLoRA (este adaptador) | Adaptador sobre base de 7,24 mil millones | No especificado (base: 32.768 tokens) | 0,833333 de exactitud en test bloqueado; fallo de parseo 0,166667 | Apache 2.0 | HuggingFace, repositorio de 0,2 GB |
| Mistral-7B-Instruct-v0.3 sin ajustar (baseline zero-shot del propio estudio) | 7,24 mil millones | 32.768 tokens (modelo base) | 1,000000 de exactitud en los mismos seis incidentes; fallo de parseo 0,000000 | Apache 2.0 | HuggingFace, `mistralai/Mistral-7B-Instruct-v0.3` |
| Otros adaptadores LoRA/QLoRA de diagnóstico de incidentes | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

La comparación con otros modelos de la misma categoria (7B ajustados para diagnóstico de incidentes) no está disponible; la búsqueda web realizada no devolvió resultados técnicos relevantes. La única comparación con datos es contra el propio modelo base en modo zero-shot, que superó al adaptador en este benchmark concreto.

## Limitaciones y advertencias

- El test bloqueado tiene solo seis incidentes, por lo que las estimaciones tienen una incertidumbre muy alta, reconocida explícitamente por el autor.
- Varias narrativas del benchmark describen el diagnóstico de forma explícita, así que los resultados no establecen robustez ante incidentes ambiguos del mundo real.
- La exactitud del modelo ajustado en test bloqueado es 5/6, mientras que el baseline zero-shot preservado es 6/6 en los mismos seis identificadores; el benchmark no respalda ninguna afirmación amplia de superioridad.
- Una respuesta del test ajustado falló el parseo JSON estricto al alcanzar el límite congelado de 128 tokens de salida; ese fallo se conserva sin reajuste posterior.
- El adaptador es un artefacto de investigación, no un sistema operativo de seguridad ni un sustituto de la observabilidad en producción ni del análisis humano de incidentes.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo genera una predicción de causa raíz en JSON y no hay métricas de calibración de confianza publicadas.
- Sesgos: no documentados en la model card; tampoco se describe la composición demográfica, lingüística o de dominio del dataset `evalforge-incident-diagnosis-v0.1.0`.
- Limitaciones de idioma y contexto: no se documentan idiomas soportados ni la longitud de contexto efectiva del adaptador; el contrato de prompt está congelado y la salida limitada a 128 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso comercial del modelo base y del dataset debe verificarse por separado; la model card no concede ninguna garantía de idoneidad operativa.
- Advertencia de producción: no usar para respuesta autónoma ante incidentes. El propio autor lo declara fuera de alcance, y el rendimiento medido no supera al del modelo base sin ajustar.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sadmanht/evalforge-mistral-7b-incident-diagnosis-qlora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de código o demos) en la información proporcionada; la búsqueda web realizada devolvió resultados no relacionados con el modelo.
