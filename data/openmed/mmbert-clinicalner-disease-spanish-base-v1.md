# OpenMed/mmBERT-ClinicalNER-Disease-Spanish-Base-v1

## Resumen

OpenMed mmBERT-ClinicalNER-Disease-Spanish-Base-v1 es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extracción de menciones de enfermedades en texto clínico en castellano. Lo desarrolla OpenMed, un proyecto que publica modelos abiertos para procesamiento de lenguaje clínico y biomédico, y se distribuye bajo licencia Apache-2.0. El modelo parte de jhu-clsp/mmBERT-base, un encoder ModernBERT multilingüe, y se ha ajustado de forma supervisada sobre el corpus DisTEMIST para la tarea de token classification con una única etiqueta: `Disease`.

La relevancia del modelo reside en su especialización y su ligereza: con 307,5 millones de parámetros y un peso de aproximadamente 1,3 GB, es capaz de ejecutarse en CPU y devolver cada mención de enfermedad con sus offsets de carácter exactos y una puntuación de confianza. Esto lo hace adecuado para pipelines de extracción de información clínica en entornos con recursos limitados o con requisitos de privacidad que impiden enviar datos a servicios en la nube.

El modelo se integra en el SDK de OpenMed (`pip install openmed`), que gestiona la segmentación de notas largas en frases, la conservación de offsets sobre el texto original y la ejecución en GPU mediante configuración explícita. Su ámbito es estrictamente monolingüe (castellano) y su salida es determinista: asigna la etiqueta de mayor puntuación por token, sin umbral de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base jhu-clsp/mmBERT-base |
| Parametros totales | 307.532.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/BF16 según repo; no se documentan variantes GGUF) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde jhu-clsp/mmBERT-base y ajustado para token classification con una sola etiqueta (`Disease`). La cabeza de clasificación opera a nivel de token y la decodificación es directa: se selecciona la etiqueta con mayor puntuación por token, sin umbral de confianza ni post-procesado adicional documentado. La salida del SDK incluye `text`, `start`, `end` y `score`, de modo que `text[start:end]` corresponde al span exacto predicho.

El ajuste se realizó sobre el corpus DisTEMIST (bigbio/distemist), compuesto por informes de casos clínicos en castellano con anotaciones humanas de menciones de enfermedad, incluidas las anidadas. Según la model card, el conjunto de entrenamiento consta de 452 documentos, 148 se reservaron para seleccionar hiperparámetros y 150 se emplearon como conjunto de evaluación retenido, puntuado una sola vez al final. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO; al tratarse de una tarea de extracción supervisada, estos últimos no resultan aplicables en el sentido habitual.

## Capacidades

- Extracción de menciones de enfermedad en texto clínico en castellano, con offsets de carácter exactos y puntuación de confianza por entidad.
- Manejo de menciones anidadas, según la anotación del corpus DisTEMIST empleado en la evaluación.
- Procesamiento de notas clínicas completas: el SDK segmenta el texto en frases (`sentence_language="es"`) y devuelve offsets sobre el texto original.
- Reconocimiento de abreviaturas clínicas frecuentes en castellano (por ejemplo, HTA, DM2, EPOC, IC) como menciones de enfermedad, según los ejemplos de la model card.
- Ejecución en CPU y en GPU (esta última mediante `OpenMedConfig(device="cuda")`).
- Carga única del modelo con caché persistente, lo que permite procesar muchas notas en bucle sin recargar pesos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado de tokens, no generativo.

## Casos de uso

- Estructuración de informes de alta hospitalaria: el modelo extrae todas las menciones de enfermedad de una nota completa y devuelve sus offsets, lo que permite mapearlas a códigos CIE-10 o SNOMED CT en un paso posterior de normalización.
- Codificación clínica asistida: en un servicio de documentación clínica, se ejecuta sobre lotes de informes para proponer diagnósticos candidatos que el codificador humano revisa, reduciendo el tiempo de lectura manual.
- Construcción de cohortes de investigación: al procesar retrospectivamente historiales en castellano, las menciones extraídas permiten identificar pacientes con una patología concreta para estudios observacionales, con la ventaja de que el modelo corre en local y los datos no salen del hospital.
- Enriquecimiento de bases de datos de farmacovigilancia: la extracción de enfermedades en informes de reacciones adversas facilita la detección de asociaciones entre fármacos y patologías mediante el análisis de las menciones codificadas.
- Preprocesado para sistemas de pregunta-respuesta clínica: las entidades detectadas actúan como anclas para recuperar fragmentos relevantes en un pipeline RAG sobre documentación médica en castellano.
- Despliegue en entornos con recursos limitados: con 308 millones de parámetros y ejecución en CPU, el modelo puede integrarse en un servidor modesto o en un portátil de desarrollo sin GPU, lo que facilita prototipos y validaciones rápidas antes de escalar.
- Anonimización contextual: combinado con los modelos de de-identificación de OpenMed, permite distinguir menciones de enfermedad de datos identificativos en un mismo pipeline de saneamiento de historiales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre DisTEMIST, 150 documentos retenidos con 1.723 menciones de enfermedad anotadas manualmente (incluidas las anidadas). Solo cuenta como acierto una predicción cuyo span de caracteres coincida exactamente. El conjunto de test oficial de DisTEMIST no se utilizó, por lo que las cifras no son comparables con la tabla de resultados de la tarea compartida.

| Modelo | Precisión | Recall | F1 |
|---|---:|---:|---:|
| OpenMed mmBERT ClinicalNER Disease Spanish Base v1 (este modelo) | 67,11 | 73,07 | 69,96 |
| Referencia sin entrenamiento en enfermedad en castellano: fastino/gliner2.5-multi-v1, umbral 0,7 | 38,14 | 40,05 | 39,07 |

La diferencia frente a la referencia es de +30,9 puntos de F1 (intervalo de confianza del 95 %: +27,9 a +33,6, bootstrap emparejado sobre 142 grupos de documentos de la misma publicación). La model card indica que jhu-clsp/mmBERT-base no dispone de etiquetador de enfermedades antes del ajuste, por lo que la comparación se establece contra el extractor multilingüe GLiNER2.5.

Comparación interna entre los modelos españoles de enfermedad de OpenMed, con los mismos documentos de entrenamiento y de test y cada modelo en su configuración por defecto:

| Modelo | Parámetros | Precisión | Recall | F1 |
|---|---:|---:|---:|---:|
| OpenMed GLiNER2.5 ClinicalNER Disease Spanish v1 | 287M | 74,53 | 72,03 | 73,26 |
| OpenMed mmBERT ClinicalNER Disease Spanish Base v1 (este modelo) | 308M | 67,11 | 73,07 | 69,96 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 308 millones de parámetros, la inferencia en FP32 requiere del orden de 1,2-1,5 GB de memoria; en BF16/FP16, aproximadamente 0,6-0,8 GB. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; el modelo está pensado para ejecutarse también en CPU. Se puede usar en RTX 4090, A100 o H100 sin aprovechar su capacidad, por lo que no son necesarias para esta tarea.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el SDK de OpenMed (`pip install -U "openmed[hf]"`, versión 3.1 o posterior) con el backend de Hugging Face; al ser un modelo de token classification con pesos safetensors, también puede servirse con las herramientas estándar de Hugging Face (transformers, TGI). No se documentan en la información disponible integraciones específicas con vLLM, llama.cpp u Ollama, que no son el cauce habitual para encoders de etiquetado.
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica únicamente que el modelo carga una vez y permanece en caché, lo que permite llamar a `analyze_text` en bucle para procesar muchas notas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en DisTEMIST (150 docs retenidos) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| OpenMed mmBERT ClinicalNER Disease Spanish Base v1 | 308M | no disponible | 69,96 | Apache-2.0 | Hugging Face (OpenMed) |
| OpenMed GLiNER2.5 ClinicalNER Disease Spanish v1 | 287M | no disponible | 73,26 | Apache-2.0 (según repositorio de OpenMed) | Hugging Face (OpenMed) |
| fastino/gliner2.5-multi-v1 (referencia multilingüe, umbral 0,7) | no disponible | no disponible | 39,07 | no disponible | Hugging Face (fastino) |

La comparación se limita a los modelos reportados en la model card del autor. El modelo GLiNER2.5 de OpenMed obtiene un F1 superior (73,26 frente a 69,96) con 21 millones de parámetros menos, mientras que este modelo presenta un recall ligeramente mayor (73,07 frente a 72,03) a costa de menor precisión. Frente a la referencia multilingüe GLiNER2.5, la ventaja en F1 es de casi 31 puntos, atribuible al ajuste específico sobre DisTEMIST en castellano.

## Limitaciones y advertencias

- Ámbito monolingüe: solo está entrenado y evaluado para castellano; su uso sobre texto en otros idiomas no está respaldado por la información disponible.
- Dominio restringido: está especializado en texto clínico (informes de casos de DisTEMIST); su comportamiento sobre otros registros del castellano no se ha documentado.
- Una sola etiqueta: solo detecta `Disease`; no extrae fármacos, procedimientos, síntomas ni datos identificativos, que requieren otros modelos del ecosistema OpenMed.
- Decodificación sin umbral: asigna la etiqueta de mayor puntuación por token sin umbral de confianza, lo que puede producir falsos positivos en fragmentos ambiguos; la puntuación devuelta permite filtrar a posteriori, pero el modelo no aplica ese filtro por defecto.
- Riesgo de alucinación: al ser un modelo discriminativo de spans, no genera texto libre; el riesgo se traduce en spans mal delimitados o menciones espurias, no en contenido inventado.
- Evaluación limitada: las cifras proceden de 150 documentos retenidos y no del conjunto de test oficial de DisTEMIST, por lo que no son comparables con la tabla de resultados de la tarea compartida.
- Sesgos: no se documentan en la información disponible análisis de sesgos por subgrupo de población, especialidad médica o variante dialectal del castellano.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del corpus DisTEMIST y del modelo base jhu-clsp/mmBERT-base para el uso de los datos y de los pesos derivados.
- Advertencia para producción: cualquier uso clínico real exige validación local sobre los datos del centro y supervisión humana; el modelo es una herramienta de extracción, no un dispositivo médico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/mmBERT-ClinicalNER-Disease-Spanish-Base-v1
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Modelo base jhu-clsp/mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo comparable OpenMed GLiNER2.5 ClinicalNER Disease Spanish v1: https://huggingface.co/OpenMed/GLiNER2.5-ClinicalNER-Disease-Spanish-v1
- Referencia multilingüe fastino/gliner2.5-multi-v1: https://huggingface.co/fastino/gliner2.5-multi-v1
- Dataset DisTEMIST: https://huggingface.co/datasets/bigbio/distemist
- Paper citado en los tags (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
- Paper citado en los tags (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
- Cuenta de OpenMed en X: https://x.com/OpenMed_AI
