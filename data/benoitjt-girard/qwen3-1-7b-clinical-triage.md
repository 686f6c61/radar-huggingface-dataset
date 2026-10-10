# BenoitJT-GIRARD/qwen3-1.7b-clinical-triage

## Resumen

`qwen3-1.7b-clinical-triage` es un ajuste fino del modelo base `Qwen/Qwen3-1.7B-Base` orientado a la clasificación del nivel de urgencia en un servicio de urgencias hospitalarias. Lo desarrolla BenoitJT-GIRARD y se publica bajo licencia Apache 2.0. El modelo recibe una descripción de paciente (síntomas, antecedentes y constantes vitales) y devuelve tres líneas con un nivel de prioridad —`URGENCE_VITALE`, `URGENCE_MODEREE` o `CONSULTATION_DIFFEREE`—, una justificación clínica breve y una recomendación de actuación.

El entrenamiento combina dos etapas: un ajuste supervisado con LoRA de rango 32 sobre todas las proyecciones y la cabeza de salida, seguido de una alineación por preferencias con DPO sobre el modelo supervisado ya fusionado. El objetivo declarado por el autor no es desplegar un producto clínico, sino evaluar metodológicamente qué cambian el SFT y la alineación por preferencias en el triaje de casos escritos de un modelo pequeno, comparándolo con una regla de palabras clave y con un clasificador lineal.

El interés actual del modelo es acotado y conviene entenderlo como una pieza de investigación reproducible: se entrena en una única RTX 4060 Ti (30 minutos para el paso supervisado y 63 minutos para el de preferencias con Unsloth), el conjunto de datos es sintético y bilingüe, y el autor insiste explícitamente en que no es un producto sanitario. Con 2.031.739.904 parámetros, licencia permisiva y compatibilidad con `transformers` y vLLM, es ante todo un banco de pruebas para estudiar SFT + DPO en dominios de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (derivada de Qwen3-1.7B-Base) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo oficial de despliegue con vLLM usa `--max-model-len 1024` |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas en la ficha) |
| Idiomas soportados | Entrenado en frances e ingles; responde siempre en frances |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `Qwen/Qwen3-1.7B-Base`, un transformer decoder-only causal de 2.031.739.904 parámetros, adaptado mediante LoRA de rango 32 y alpha 64 con tasa de aprendizaje 0,0002 durante 2 épocas. El adaptador se aplica sobre todas las proyecciones **y sobre la cabeza de salida**, un detalle relevante: según la ficha, el modelo base lleva sus tokens de chat como un vector no entrenado y ata la cabeza de salida a los embeddings, de modo que un adaptador limitado a las proyecciones produce un modelo incapaz de emitir su token de fin de turno. Por eso los pesos exportados desatan la cabeza (`tie_word_embeddings: false`).

El paso supervisado usa 4.000 ejemplos de entrenamiento y 500 de validación del dataset `BenoitJT-GIRARD/clinical-triage-bilingual`, balanceados sobre los tres niveles de urgencia y los dos idiomas. Después se aplica DPO sobre el modelo supervisado fusionado, que actúa también como referencia, con un término supervisado sobre la respuesta preferida para mantenerla probable; se usan 2.400 pares de preferencias. Cada respuesta rechazada incorpora un defecto concreto: un nivel demasiado bajo, una conducta insegura, un diagnóstico afirmado o una respuesta en inglés. No se emplearon datos reales de pacientes. Todo el entrenamiento se ejecutó en una única NVIDIA GeForce RTX 4060 Ti (30 minutos el paso supervisado, 63 minutos el de preferencias) usando Unsloth; ambas etapas están fusionadas en los pesos publicados, de modo que el modelo se carga como cualquier modelo de lenguaje causal.

## Capacidades

- Generación de texto con formato fijo y salida estructurada en tres campos: nivel de prioridad, justificación y recomendación.
- Clasificación de triaje en tres niveles discretos a partir de texto clínico libre (síntomas, antecedentes, constantes vitales).
- Cumplimiento de formato del 100 % según la evaluación del autor: todas las respuestas son parseables.
- Razonamiento breve de tipo cadena corta para justificar el nivel asignado y proponer una conducta a seguir.
- Aplicación de reglas de seguridad inyectadas por prompt de sistema: sobreclasificar ante duda, no emitir diagnóstico definitivo y recordar contactar con el 15 (SAMU) ante signos vitales comprometidos.
- Conversación multi-turno mediante la plantilla de chat del tokenizer (el template y el token de fin de turno viajan con el tokenizer).
- Soporte multilingüe de entrada (francés e inglés), con salida monolingüe en francés.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre alineación de preferencias en dominios de alto riesgo: el modelo permite reproducir el experimento SFT + DPO sobre un corpus bilingüe y medir su efecto frente a una regla de palabras clave y un clasificador lineal, con presupuesto de una sola GPU de consumo.
- Banco de pruebas de evaluación clínica: sirve para diseccionar métricas de seguridad como el infratriaje (casos urgentes enviados a un nivel inferior) y comparar sistemas sobre un mismo conjunto de casos anotados.
- Docencia y divulgación sobre riesgos de la IA médica: es un ejemplo tangible y reproducible de por qué una precisión del 71,67 % no basta en triaje, ya que un 27,5 % de casos urgentes se clasifican por debajo.
- Prototipado de generación con formato estricto: su salida en tres líneas parseables y su 100 % de cumplimiento de formato lo hacen útil para probar pipelines de extracción de campos estructurados a partir de texto libre.
- Evaluación de infraestructura de inferencia: con 2,03 mil millones de parámetros cabe en GPU de consumo, por lo que resulta adecuado para medir latencia y throughput de vLLM o de `transformers` en hardware modesto antes de escalar a modelos mayores.
- Pruebas comparativas de técnicas de ajuste eficiente (LoRA sobre proyecciones más cabeza de salida, DPO con término supervisado): el modelo documenta el fallo concreto —ausencia del token de fin de turno— que aparece si se ajustan solo las proyecciones en un modelo con embeddings atados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el `model-index` de la model card (todos marcados como `verified: false`).

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Emergency triage level | Clinical evaluation set (`BenoitJT-GIRARD/clinical-triage-bilingual`, config `clinical_eval`, split `test`, revision `model-v2.0.0`) | Triage level accuracy | 0,7167 |
| Emergency triage level | Mismo conjunto | Undertriage (casos urgentes enviados a un nivel inferior) | 0,275 |
| Emergency triage level | Mismo conjunto | Format compliance (respuestas parseables) | 1,0 |

Comparativa interna publicada en la model card, sobre los mismos 60 casos (n = 60, de los cuales n = 40 urgentes; intervalos de confianza de Wilson al 95 %):

| Sistema | Precision | Casos urgentes enviados a nivel inferior | Cumplimiento de formato |
|---|---|---|---|
| Este modelo | 0,717 [0,59 – 0,81] | 11 de 40 | 100 % |
| Solo el paso supervisado | 0,700 [0,57 – 0,80] | 12 de 40 | 100 % |
| Regla de palabras clave | 0,617 [0,49 – 0,73] | 22 de 40 | no aplica |
| Clasificador lineal, mismos ejemplos | 0,667 [0,54 – 0,77] | 8 de 40 | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,1 GB solo para pesos (el repositorio ocupa 4,1 GB); el total con caché KV y activaciones depende de la longitud de secuencia, que en el ejemplo oficial se limita a 1.024 tokens.
- Cuantización int8: del orden de 2 GB de pesos (estimación por tamano, no publicada por el autor).
- Cuantización int4: del orden de 1,2 GB de pesos (estimación por tamano, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o más para bf16 con secuencias cortas; el propio autor entrenó en una NVIDIA GeForce RTX 4060 Ti. Para servicio con concurrencia alta son preferibles A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 4060 Ti, RTX 3060 de 12 GB, RTX 4070, RTX 4090, siempre que se ajuste `max-model-len`.
- Opciones de despliegue: `transformers` (documentado, con `device_map="auto"`), vLLM (documentado con `vllm serve ... --revision model-v2.0.0 --max-model-len 1024`) y text-generation-inference (el repositorio incluye el tag `text-generation-inference`). No se publican archivos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de reproducibilidad: el autor recomienda fijar la revisión `model-v2.0.0`, porque la rama por defecto cambia con cada publicación.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de triaje clínico de terceros. La única comparación disponible es la interna del propio autor, recogida en la sección de benchmarks (este modelo, el paso supervisado aislado, una regla de palabras clave y un clasificador lineal entrenado con los mismos ejemplos). Como referencia de categoría por tamano y arquitectura, el modelo base inmediato es `Qwen/Qwen3-1.7B-Base`.

| Modelo | Parametros | Contexto | Precision en triaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-1.7b-clinical-triage` | 2.031.739.904 | no disponible (ejemplo con 1.024 tokens) | 0,717 (n = 60) | apache-2.0 | HuggingFace, revision `model-v2.0.0` |
| `Qwen/Qwen3-1.7B-Base` | 1,7 B (aproximado, segun denominacion) | no disponible en esta ficha | no evaluado en triaje | apache-2.0 | HuggingFace |
| Paso supervisado aislado (variante interna) | 2.031.739.904 | no disponible | 0,700 (n = 60) | apache-2.0 | No publicado como repositorio independiente |
| Clasificador lineal sobre los mismos ejemplos | no disponible | no aplica | 0,667 (n = 60) | no disponible | No publicado |

## Limitaciones y advertencias

- No es un producto sanitario. El autor indica expresamente que el modelo no da consejo clínico y no debe informar decisiones sobre pacientes.
- El catálogo clínico que sustenta los datos de entrenamiento no fue validado por un médico de urgencias, según la propia model card.
- Infratriaje del 27,5 % declarado: 11 de cada 40 casos urgentes se clasifican en un nivel inferior, que es precisamente el tipo de error que llega al paciente.
- Precisión global moderada: 0,7167 con un intervalo de confianza del 95 % de [0,59 – 0,81] sobre solo 60 casos, 10 de ellos falsamente tranquilizadores y 11 falsamente alarmantes. La muestra es pequena y las métricas figuran como `verified: false`.
- Riesgo de alucinación: es un modelo de 1,7 B parámetros afinado sobre 4.000 ejemplos; puede afirmar diagnósticos o justificaciones clínicas no sustentadas. El DPO penaliza explícitamente las respuestas con diagnóstico afirmado, pero no lo elimina.
- Salida monolingüe: aunque el modelo está etiquetado como bilingüe francés-inglés y acepta entradas en ambos idiomas, siempre responde en francés; el uso en inglés produce respuestas en francés. Las respuestas en inglés fueron tratadas como defecto durante el DPO.
- Dependencia estricta del prompt de sistema: el autor advierte de que el modelo espera el prompt de sistema con el que fue entrenado, palabra por palabra, y que la plantilla de chat debe respetarse.
- Ruido potencial en el historial de revisiones: la rama por defecto cambia con cada publicación, por lo que hay que fijar `model-v2.0.0` para reproducir los resultados descritos.
- Sin validación de la comunidad: 0 descargas y 0 «likes» en el momento de la consulta, sin revisión externa independiente.
- Licencia Apache 2.0, permisiva y sin restricciones de uso comercial por parte del autor, pero las advertencias de uso clínico del propio autor siguen aplicando y el cumplimiento normativo sanitario (por ejemplo, marcado CE como dispositivo médico) queda enteramente del lado de quien lo despliegue.
- Restricción práctica de contexto: el ejemplo oficial de vLLM fija `--max-model-len 1024`; no se documenta el límite real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-clinical-triage
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/BenoitJT-GIRARD/clinical-triage-bilingual
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Revision de pesos descrita: `model-v2.0.0`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
