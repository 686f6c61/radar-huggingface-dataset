# JOAOOALBERNAZ/banking77-ptbr-intent-v1

## Resumen

El modelo `JOAOOALBERNAZ/banking77-ptbr-intent-v1` es un clasificador de intenciones para dominio bancario en portugués de Brasil, publicado en Hugging Face por el usuario JOAOOALBERNAZ. No se trata de un modelo de lenguaje generativo ni de una red neuronal profunda: es un pipeline clásico de scikit-learn basado en un clasificador de vectores de soporte sobre representaciones de caracteres (char SVC), serializado con skops. Resuelve la tarea de asignar una de 77 intenciones bancarias predefinidas a una consulta de usuario en portugués.

El modelo se entrena sobre BANKING77-PTBR, una traducción al portugués brasileño del corpus BANKING77 original de Casanueva et al. (2020), publicada por el Centro de Ciência de Dados da Poli/USP (Dimant et al., 2025). El autor advierte explícitamente de que el corpus es una traducción revisada y no mensajes reales de clientes brasileños, lo que acota su aplicabilidad en producción.

Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, pensado para reproducir un experimento de clasificación de intenciones con métricas auditadas. No compite con modelos generativos ni con encoders transformer; su interés está en servir como baseline ligero y reproducible para la tarea concreta de intent detection en portugués bancario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal SVC sobre features de caracteres (char SVC) de scikit-learn; no es un transformer |
| Parámetros totales | No disponible (no es un modelo neuronal; no aplica recuento de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clasificador por sentencia; sin ventana definida) |
| Tipos de cuantización | No disponible (no aplica; el artefacto es `model.skops`) |
| Idiomas soportados | Portugués (pt), concretamente portugués de Brasil |
| Licencia | CC BY 4.0 |
| Formato de pesos | skops (`model.skops`); no se distribuyen safetensors ni GGUF |
| Tamaño del repositorio | 0,1 GB |
| Número de clases | 77 intenciones bancarias |
| Dataset de entrenamiento | `c2d-usp/banking77-pt-br` (10 003 ejemplos de entrenamiento, 3 080 de test) |
| Pipeline de Hugging Face | No disponible |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un clasificador de máquinas de vectores de soporte (SVC) entrenado sobre representaciones de n-gramas de caracteres, según el nombre del estimador seleccionado (`char_svc`). Se serializa con skops y se integra en el ecosistema de scikit-learn. No hay información sobre el rango de n-gramas, la función de kernel, la regularización C ni el resto de hiperparámetros en la información disponible.

El entrenamiento se realizó sobre el split oficial de BANKING77-PTBR: 10 003 ejemplos de entrenamiento y 3 080 de test, con 77 clases. El autor describe una selección de modelo basada exclusivamente en el macro-F1 de validación, con un split 80/20 estratificado y semilla 42, comparando tres baselines: `char_svc` (macro-F1 0,8800; accuracy 0,8836), `word_sgd` (0,8726; 0,8741) y `word_svc` (0,8700; 0,8726). El modelo elegido se reajustó sobre el entrenamiento completo y se evaluó una única vez sobre el test oficial. Como auditoría pós-hoc, el autor reporta además una evaluación sobre 2 887 filas de test sin coincidencia textual con el entrenamiento, con macro-F1 0,8910 y accuracy 0,8916. No se menciona uso de RLHF, DPO ni ningún proceso de ajuste fino adicional.

## Capacidades

- Clasificación de intenciones bancarias en portugués de Brasil entre 77 clases predefinidas.
- Clasificación a nivel de sentencia o consulta corta, típica de asistentes conversacionales de atención al cliente.
- Funcionamiento sobre texto en portugués; no se documenta soporte multilingüe más allá del portugués.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking), visión, audio ni generación de texto.
- No se documentan capacidades de extracción de entidades ni de diálogo multi-turno.

## Casos de uso

- Enrutado de consultas en un chatbot bancario: clasificar el mensaje entrante en una de las 77 intenciones para dirigirlo al flujo o al departamento correspondiente, aprovechando que el clasificador está entrenado específicamente sobre intenciones bancarias en portugués.
- Baseline de referencia en investigación: servir como punto de comparación ligero frente a encoders transformer (BERTimbau, XLM-R, etc.) en experimentos de intent detection en portugués, dado que el autor publica métricas auditadas y código de reproducción.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de scikit-learn serializado con skops, puede desplegarse en CPU sin GPU y con una huella de 0,1 GB, adecuado para demos y pruebas de concepto.
- Etiquetado asistido de datos: preanotar consultas bancarias en portugués para su posterior revisión humana, con la advertencia de que el corpus de entrenamiento es una traducción y no refleja necesariamente lenguaje real de clientes.
- Evaluación de robustez de pipelines: usar la auditoría sin solapamiento textual (2 887 filas, macro-F1 0,8910) como referencia para medir la degradación de clasificadores ante paráfrasis.
- Docencia y reproducción de experimentos: el repositorio incluye código, `metrics.json` y la model card con el protocolo de selección, lo que facilita reproducir el flujo completo de selección de modelo y evaluación en un curso de machine learning aplicado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el test oficial independiente de BANKING77-PTBR (3 080 ejemplos, 77 clases):

| Métrica | Valor |
|---|---|
| Macro-F1 | 0,8964 |
| Accuracy | 0,8964 |
| Weighted-F1 | 0,8964 |
| Macro-F1 sin solapamiento textual (2 887 filas) | 0,8910 |
| Accuracy sin solapamiento textual (2 887 filas) | 0,8916 |

Comparativa de baselines en validación (split 80/20 estratificado, semilla 42):

| Baseline | Macro-F1 | Accuracy |
|---|---|---|
| char_svc (seleccionado) | 0,8800 | 0,8836 |
| word_sgd | 0,8726 | 0,8741 |
| word_svc | 0,8700 | 0,8726 |

No se han publicado resultados comparativos frente a modelos transformer en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un modelo de scikit-learn serializado con skops (repositorio de 0,1 GB), por lo que no requiere GPU.
- VRAM estimada: no aplica; no hay componente neuronal.
- GPU recomendadas: no aplica.
- ¿Cabe en GPU de consumo? No aplica; el despliegue natural es en CPU.
- Opciones de despliegue: carga mediante `skops` y `scikit-learn` en Python; puede servirse detrás de una API propia (FastAPI, Flask) o integrarse en un pipeline de preprocesado existente. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. Como referencia conceptual de la misma tarea (intent classification en portugués), cabría considerar encoders transformer como BERTimbau o XLM-R ajustados sobre el mismo corpus, pero no se han publicado comparaciones directas en la información disponible.

| Modelo | Tipo | Parámetros | Contexto | Macro-F1 (BANKING77-PTBR) | Licencia |
|---|---|---|---|---|---|
| banking77-ptbr-intent-v1 | SVC sobre char n-grams | No aplica | No disponible | 0,8964 (test oficial) | CC BY 4.0 |
| BERTimbau ajustado | Transformer encoder | No disponible | No disponible | No disponible | No disponible |
| XLM-R ajustado | Transformer encoder | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El corpus de entrenamiento es una traducción revisada del inglés al portugués, no mensajes reales de clientes brasileños; el propio autor lo advierte, lo que limita la generalización a lenguaje de producción.
- El autor indica explícitamente que la modelización y las métricas no garantizan generalización a otros sectores, a lenguaje de producción ni a adversarios.
- Existe solapamiento textual entre entrenamiento y test (166 intersecciones); la evaluación sin solapamiento es una auditoría pós-hoc de las mismas predicciones, no una validación independiente.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de clasificación errónea en consultas ambiguas o fuera de dominio.
- Cobertura limitada a 77 intenciones bancarias predefinidas; cualquier consulta fuera de ese conjunto se forzará a una de las clases existentes.
- Sin soporte multilingüe documentado más allá del portugués; no se garantiza su comportamiento en portugués europeo u otras variantes.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero debe citarse adecuadamente al autor y al dataset.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa por terceros.
- No es un modelo generativo: no puede emplearse para diálogo, resumen, extracción de entidades ni tareas fuera de la clasificación de intenciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOAOOALBERNAZ/banking77-ptbr-intent-v1
- Dataset BANKING77-PTBR: https://huggingface.co/datasets/c2d-usp/banking77-pt-br
- Código y tests de reproducción: https://github.com/JoaoAlbernaz1/JoaoAlbernaz1/tree/main/ml-lab/banking77-ptbr
- Paper original del corpus: Casanueva et al. (2020), Efficient Intent Detection with Dual Sentence Encoders
- Paper de la traducción: Dimant et al. (2025), Centro de Ciência de Dados Poli/USP
