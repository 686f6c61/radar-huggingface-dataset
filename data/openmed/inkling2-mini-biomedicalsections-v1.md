# OpenMed/Inkling2-Mini-BiomedicalSections-v1

## Resumen

Inkling2-Mini-BiomedicalSections-v1 es un ajuste fino (fine-tune) del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, desarrollado por OpenMed, una organización centrada en modelos y herramientas abiertas para texto clínico y biomédico. El modelo resuelve una tarea muy concreta: dada una única frase en inglés extraída de un resumen (abstract) de un artículo biomédico, asignarle su rol retórico entre cinco posibles: background, objective, methods, results o conclusions. Se trata, por tanto, de un clasificador de texto especializado, no de un modelo generativo de propósito general.

El modelo base Inkling 2 Mini es un transformer multimodal (image-text-to-text) de aproximadamente 26.400 millones de parámetros, del que este checkpoint hereda la arquitectura completa (etiqueta `inkling2_loop`) y el formato de pesos mixto NVFP4/MXFP8. El ajuste se realizó mediante LoRA de rango 8 sobre las proyecciones query y value de las cuatro últimas capas, con solo 278.528 parámetros entrenados, que después se fusionaron en el checkpoint final. El resultado es un repositorio de 19,6 GB con pesos cuantizados en 8 bits y licencia Apache-2.0.

Su relevancia radica en dos aspectos: por un lado, demuestra que un ajuste fino mínimo sobre un modelo grande puede superar al original en una tarea de dominio específico; por otro, ofrece una herramienta práctica y local para estructurar literatura biomédica (por ejemplo, para minería de literatura, revisiones sistemáticas o extracción de evidencia), sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), variante `inkling2_loop` |
| Parametros totales | 26.388.646.440 (26,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la entrada de clasificación se trunca a 160 tokens) |
| Tipos de cuantizacion | Pesos mixtos NVFP4 y MXFP8 (8 bits); decodificación a BF16 en carga |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto (text-classification) |
| Etiquetas de salida | background, objective, methods, results, conclusions |
| Parametros entrenados (LoRA) | 278.528 (rango 8, query y value de las 4 últimas capas) |
| Tamano del repositorio | 19,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Inkling 2 Mini, un transformer multimodal de Thinking Machines Lab con arquitectura etiquetada como `inkling2_loop`. El checkpoint de OpenMed conserva la arquitectura completa del modelo base y su formato de pesos mixto NVFP4/MXFP8, y se carga con `AutoModelForMultimodalLM` de Transformers (se requiere una revisión concreta del repositorio de Transformers, indicada en la model card). En carga, los pesos se decodifican a BF16.

El ajuste fino consistió en un LoRA de rango 8 aplicado únicamente a las proyecciones query y value de las cuatro últimas capas, con 278.528 parámetros entrenables, sobre 600 frases etiquetadas procedentes de 509 resúmenes de ensayos clínicos de acceso abierto. El entrenamiento se realizó en 100 pasos y el adaptador se fusionó posteriormente en el checkpoint publicado. No se menciona en la información disponible el uso de RLHF ni DPO; el proceso es un ajuste supervisado ligero sobre una tarea de clasificación.

La innovación técnica destacable es el mecanismo de decisión: el modelo no genera texto, sino que realiza un único forward pass en el que el prompt enumera las cinco etiquetas como códigos de respuesta de la A a la E, y se selecciona la etiqueta cuyo token asociado obtiene mayor logit en la siguiente posición. Esto elimina el muestreo y reduce la inferencia a una sola pasada.

## Capacidades

- Clasificación de frases de resúmenes biomédicos en cinco roles retóricos: background, objective, methods, results y conclusions.
- Procesamiento de frases individuales en inglés de hasta 160 tokens.
- Clasificación de resúmenes completos dividiéndolos en frases y puntuando cada una con el mismo prompt.
- Decisión determinista mediante un único forward pass (sin generación ni muestreo).
- Hereda del modelo base la modalidad image-text-to-text, aunque la tarea ajustada es exclusivamente de clasificación de texto.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico en la información disponible.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Estructuración de literatura biomédica: dado un resumen de PubMed, dividirlo en frases y clasificar cada una para reconstruir las secciones (objetivo, métodos, resultados, conclusiones), lo que facilita la indexación y el filtrado semántico de grandes corpus.
- Revisiones sistemáticas y síntesis de evidencia: extraer automáticamente las frases de métodos y resultados (donde el modelo alcanza F1 de 88,19 y 84,38 respectivamente) para alimentar tablas de extracción de datos y reducir el trabajo manual de revisores.
- Minería de ensayos clínicos: procesar resúmenes de ensayos de acceso abierto para identificar poblaciones, intervenciones y desenlaces descritos en las secciones de métodos y resultados, apoyando la construcción de bases de datos de evidencia.
- Enrutamiento y preprocesado en pipelines de NLP clínico: usar la etiqueta asignada para decidir qué frases pasan a módulos posteriores (por ejemplo, extracción de entidades o de métricas de resultado) y cuáles se descartan.
- Búsqueda biomédica sensible a la sección: permitir consultas restringidas a frases de resultados o conclusiones, mejorando la precisión de motores de búsqueda sobre literatura médica.
- Anotación asistida para investigación: generar etiquetas preliminares sobre corpus propios que luego se revisan manualmente, acelerando la creación de datasets anotados de roles retóricos.
- Despliegue local en entornos con requisitos de privacidad: al ser Apache-2.0 y ejecutarse en hardware propio, permite procesar literatura o datos internos sin enviarlos a servicios externos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre 300 frases (60 por rol) procedentes de 181 artículos no incluidos en el entrenamiento:

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro F1 (cinco roles) | 78,40 | 300 frases, 181 artículos |
| Accuracy | 78,67 | 300 frases, 181 artículos |
| F1 (methods) | 88,19 | 300 frases, 181 artículos |
| F1 (results) | 84,38 | 300 frases, 181 artículos |

Según la model card, el modelo supera al Inkling 2 Mini original en las cinco categorías (macro F1 de 78,40 frente a 77,13 del original) y detecta el 93,3 % de las frases de métodos y el 90,0 % de las de resultados. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 19,6 GB en el repositorio; al decodificarse a BF16 en carga, el consumo de memoria es sustancialmente mayor. La ejecución de referencia utilizó una única GPU con 96 GB de memoria.
- GPU recomendadas: para reproducir la configuración de referencia, GPU de clase数据中心 con 96 GB (por ejemplo, A100 de 80 GB no bastaría según esa referencia; se requiere una GPU de 96 GB como H100/H200 de 96 GB o similar). No se documentan configuraciones con menos memoria.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; dado el tamaño (26,4 mil millones de parámetros) y la necesidad de decodificar a BF16, no es viable en GPU de consumo estándar (RTX 4090 de 24 GB) sin cuantización adicional no documentada.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM`, `accelerate` y una revisión concreta de Transformers; se recomienda `attn_implementation="eager"` y `experts_implementation="eager"`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia es un único forward pass sin generación, lo que en principio es más rápido que la decodificación autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características declaradas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-Mini-BiomedicalSections-v1 | 26,4 mil millones | no disponible (entrada de 160 tokens) | Clasificación de roles en resúmenes biomédicos | Apache-2.0 | Hugging Face (OpenMed) |
| Inkling 2 Mini (base) | 26,4 mil millones (aprox.) | no disponible | Multimodal image-text-to-text | Apache-2.0 | Hugging Face (Thinking Machines Lab) |
| Alternativas especializadas en clasificación de secciones de abstracts | no disponible | no disponible | Clasificación de roles retóricos | no disponible | no disponible |

El modelo base Inkling 2 Mini obtuvo un macro F1 de 77,13 en la misma evaluación frente a 78,40 del ajuste, según la model card. No se han encontrado en la información disponible otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al entrenarse con 600 frases de 509 resúmenes de ensayos clínicos de acceso abierto, puede heredar sesgos de esa muestra (dominio, idioma y tipo de estudio).
- Riesgo de alucinación: bajo en sentido estricto, ya que el modelo no genera texto libre sino que selecciona entre cinco etiquetas; sin embargo, puede asignar roles incorrectos en frases ambiguas o atípicas.
- Limitaciones de contexto e idioma: solo inglés y frases de hasta 160 tokens; no se declara una longitud de contexto mayor ni soporte multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a OpenMed y a Thinking Machines Lab según corresponda.
- Requisitos de memoria elevados: la ejecución de referencia necesita una GPU de 96 GB; no se documentan alternativas de cuantización para hardware menor.
- Dependencia de una revisión concreta de Transformers: el código de ejemplo se validó contra un commit específico, lo que puede afectar a la reproducibilidad con versiones estándar.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false`.
- Uso previsto acotado: es un clasificador de roles retóricos, no un modelo de razonamiento clínico ni de generación de texto; no debe emplearse para decisiones clínicas directas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Inkling2-Mini-BiomedicalSections-v1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- OpenMed en X: https://x.com/OpenMed_AI
- Revisión de Transformers usada en las pruebas: https://github.com/huggingface/transformers/commit/046bdb8cc2cee29d233964bb77fe6fd37cfe4aa3
- Paper referenciado (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
