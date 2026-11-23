# oliverj1411/medextract-modelos

## Resumen

MedExtract es un conjunto de artefactos para reconocimiento de entidades nombradas (NER) en el dominio médico en castellano, publicado por el usuario oliverj1411 en Hugging Face. No se trata de un modelo único, sino de un paquete de ficheros que combina un modelo BETO (`dccuchile/bert-base-spanish-wwm-cased`) afinado con una capa lineal y exportado a ONNX en cuantización int8, junto con los parámetros de un CRF (puntuaciones de inicio, fin y transición con esquema BIOES) y un segundo modelo basado en rasgos manuales con su propio CRF. El objetivo declarado es la inferencia en el navegador, lo que justifica el formato ONNX y la cuantización a 8 bits.

El modelo resuelve la extracción de entidades en textos clínicos en español, una tarea relevante para pipelines de anonimización, estructuración de informes y preprocesado de datos sanitarios. Su interés actual radica en la combinación de un encoder BERT español ampliamente utilizado con una capa CRF para modelar dependencias entre etiquetas, empaquetada para ejecución ligera en cliente.

La información disponible es muy limitada: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, y la model card solo documenta los ficheros y una métrica de F1. No se detallan hiperparámetros, composición del dataset de entrenamiento ni licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BETO (BERT base en español, `dccuchile/bert-base-spanish-wwm-cased`) con capa lineal + CRF (BIOES); segundo modelo con CRF sobre rasgos manuales |
| Parametros totales | no disponible (BETO base tiene ~110 M, no confirmado en la card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BETO base admite 512 tokens, no confirmado en la card) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | es |
| Licencia | no disponible |
| Formato de pesos | ONNX (`apf3.onnx`), JSON (`apf3_crf.json`, `apf1.json`), vocab WordPiece (`vocab.txt`) |

## Arquitectura y entrenamiento

El componente principal, `apf3.onnx`, es un BETO afinado para token classification con una capa lineal de salida que emite puntuaciones por sub-token. Sobre esas emisiones se aplica un CRF cuyos parámetros (inicio, fin y transición) se distribuyen por separado en `apf3_crf.json`, con esquema de etiquetado BIOES y decodificación mediante algoritmo de Viterbi. El modelo se exporta a ONNX y se cuantiza a int8 para reducir tamaño y coste de cómputo en el navegador.

El segundo componente, `apf1.json`, contiene los pesos de un CRF entrenado sobre rasgos manuales, sin encoder neuronal, y se presenta como una alternativa más ligera pero de menor calidad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO. El único dato de evaluación indicado es el F1 estricto micro sobre el conjunto de test de `HUMADEX/spanish_ner_dataset`.

## Capacidades

- Reconocimiento de entidades nombradas en textos médicos en español con esquema BIOES.
- Extracción de entidades a nivel de sub-token con agregación a nivel de palabra mediante decodificación Viterbi sobre el CRF.
- Inferencia en navegador gracias al formato ONNX y a la cuantización int8.
- Ejecución de dos variantes: una neuronal (APF3) y otra basada en rasgos manuales (APF1) para escenarios con menos recursos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al español según los tags del repositorio.

## Casos de uso

- Anonimización de informes clínicos en el cliente: el modelo puede ejecutarse íntegramente en el navegador mediante ONNX, lo que permite detectar nombres de pacientes, profesionales o instituciones sin enviar el texto a un servidor, reduciendo el riesgo de exposición de datos sanitarios.
- Preprocesado de historiales electrónicos: extracción de entidades (fármacos, diagnósticos, procedimientos) para alimentar pipelines de estructuración posteriores, usando la salida BIOES del CRF como base para el mapeo a un esquema clínico.
- Etiquetado asistido en herramientas de anotación: el modelo puede sugerir entidades en tiempo real dentro de una interfaz web, acelerando la revisión manual por parte de codificadores clínicos.
- Filtrado y enrutado de documentos: clasificación preliminar de textos sanitarios según las entidades detectadas para dirigirlos al flujo adecuado (por ejemplo, facturación, investigación o atención al paciente).
- Prototipado rápido sin infraestructura: al no requerir GPU ni servidor, permite validar ideas de extracción de información médica en entornos de investigación con recursos limitados.
- Comparación de estrategias de modelado: la disponibilidad de una variante neuronal (APF3) y otra basada en rasgos (APF1) permite evaluar el coste/beneficio de cada enfoque en un mismo corpus.

## Benchmarks y rendimiento

| Modelo | F1 estricto micro (test, `HUMADEX/spanish_ner_dataset`) |
|---|---|
| APF3 (BETO + CRF) | 0,702 |
| APF3 int8 | 0,692 |
| APF1 (CRF sobre rasgos manuales) | 0,540 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la cuantización int8, el modelo es apto para ejecución en CPU.
- GPU recomendadas: no aplica para el caso de uso principal (navegador); para inferencia en servidor, cualquier GPU con soporte ONNX Runtime es suficiente, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño reducido del artefacto.
- Opciones de despliegue: ONNX Runtime (web y servidor), transformadores.js u otros runtimes ONNX en navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (HUMADEX test) | Licencia | Formato |
|---|---|---|---|---|---|
| MedExtract APF3 (este modelo) | no disponible (~110 M si BETO base) | no disponible | 0,702 (0,692 int8) | no disponible | ONNX + JSON |
| MedExtract APF1 (este paquete) | no disponible | no disponible | 0,540 | no disponible | JSON |
| BETO base (`dccuchile/bert-base-spanish-wwm-cased`) | ~110 M | 512 | no disponible | no disponible en esta ficha | safetensors/PyTorch |

No se dispone de información sobre otros modelos NER médicos en español comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribución.
- El rendimiento es moderado (F1 estricto micro de 0,702 en test), lo que limita su uso en producción sin revisión humana.
- La cuantización int8 introduce una pérdida de calidad medible (0,702 a 0,692), pequeña pero no despreciable en dominios sensibles.
- No se documentan sesgos conocidos, pero al derivar de BETO y entrenarse sobre un corpus concreto, puede heredar sesgos del dataset y del dominio.
- Riesgo de alucinación y de falsos positivos/negativos en entidades poco frecuentes; no hay datos de evaluación por tipo de entidad.
- El alcance lingüístico se limita al español; no se garantiza su funcionamiento en otras lenguas ni en variantes dialectales no representadas.
- No se especifican la longitud máxima de secuencia efectiva ni el preprocesado requerido más allá del vocabulario WordPiece incluido.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/oliverj1411/medextract-modelos
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset de evaluación: https://huggingface.co/datasets/HUMADEX/spanish_ner_dataset
