# f1k/katip-tr-pii-berturk

## Resumen

katip-tr-pii-berturk es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos legales en turco. Lo desarrolla f1k como componente local del proyecto Katip Yerel, una herramienta de redacción y anonimización de documentos jurídicos. El modelo identifica nombres de personas, direcciones y términos de salud recogidos en el artículo 6 de la KVKK (la ley turca de protección de datos), y está pensado para ejecutarse en el dispositivo del usuario, sin enviar documentos sensibles a servidores externos.

Técnicamente es un fine-tuning de BERTurk (`dbmdz/bert-base-turkish-cased`), un transformer encoder de tipo BERT con 110.032.135 parámetros y vocabulario en turco con distinción de mayúsculas y minúsculas. Se distribuye en formato ONNX (fp32 e int8) para su uso con transformers.js en el navegador, además de los pesos en safetensors para reentrenamiento. La versión 2, publicada en noviembre de 2026, incorpora 17.967 frases reales en turco procedentes del dataset Turkish Wiki NER, lo que eleva la detección de nombres en frases reales del 40,7 % al 89,8 %.

Su relevancia actual radica en que aborda un caso de uso muy concreto y regulado: la anonimización de resoluciones judiciales y expedientes legales turcos antes de su publicación o tratamiento automatizado, cumpliendo con los requisitos de la KVKK y ejecutándose de forma local con un consumo de recursos muy bajo (110,8 MB en int8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTurk cased) |
| Parametros totales | 110.032.135 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base: 512 tokens por defecto; no confirmado en la informacion) |
| Tipos de cuantizacion | int8 (ONNX quantized) y fp32 (ONNX); pesos PyTorch en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de BERTurk (`dbmdz/bert-base-turkish-cased`), un encoder BERT de 110 millones de parámetros entrenado sobre corpus en turco. Sobre esa base se aplica un fine-tuning de token classification con etiquetas BIO a nivel de palabra (asignadas al primer sub-token de cada palabra, usando el separador de palabras definido en `config.json` bajo `katip.word_regex`). El entrenamiento se realizó durante 3 épocas sobre 8.000 documentos sintéticos más 2.246 pseudo-documentos compuestos por ocho frases reales cada uno, en 28 minutos sobre hardware Apple Silicon con backend MPS.

La versión 2 añade 17.967 frases reales en turco del dataset Turkish Wiki NER (Altinok, 2023), restringidas a nombres de personas, para corregir el sesgo hacia el texto sintético de la v1. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación; se trata de un fine-tuning supervisado clásico de NER. La innovación principal es la combinación de datos sintéticos controlados (que cubren direcciones y términos de salud) con datos reales (que aportan variedad lingüística en nombres), junto con la exportación a ONNX int8 sin pérdida de precisión reportada.

## Capacidades

- Detección de nombres de personas en texto legal turco (etiqueta BIO a nivel de palabra).
- Detección de direcciones postales.
- Detección de términos de salud contemplados en el artículo 6 de la KVKK.
- Clasificación de tokens (token classification) para pipelines de anonimización y redacción.
- Ejecución en navegador y en dispositivo mediante ONNX Runtime y transformers.js.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No soporta visión, audio ni modo thinking.
- Multilingüismo limitado al turco.

## Casos de uso

- Anonimización de resoluciones judiciales: el modelo etiqueta nombres y direcciones en sentencias del Yargıtay antes de su publicación, con una tasa de detección del 99,3 % y precisión del 96,2 % sobre el conjunto de prueba de prosa judicial real.
- Redacción de expedientes legales en despachos: integrado en Katip Yerel, permite sustituir nombres y datos de salud por marcadores antes de compartir documentos con terceros, sin salir del dispositivo del abogado.
- Cumplimiento de la KVKK en pipelines documentales: sirve como paso previo de scrubbing en sistemas de gestión documental que deban garantizar la minimización de datos personales.
- Procesamiento en navegador sin servidor: gracias al archivo ONNX int8 de 110,8 MB, puede ejecutarse en el cliente con transformers.js, lo que evita enviar textos confidenciales a una API externa.
- Preetiquetado para revisión humana: genera anotaciones automáticas que un revisor legal valida, reduciendo el trabajo manual en tareas de anonimización masiva.
- Extracción de entidades en corpus jurídicos turcos: alimenta índices o bases de datos de investigación que necesitan localizar menciones de personas o condiciones de salud en grandes volúmenes de texto.
- Filtro de privacidad en herramientas de publicación: detecta datos personales en borradores antes de su difusión pública en boletines o repositorios judiciales.

## Benchmarks y rendimiento

Resultados reportados por el autor. La columna "Katip (reglas + modelo)" corresponde al sistema completo con umbral 0,5; la columna "modelo solo" excluye las reglas.

| Conjunto | Metrica | v2 | v1 |
|---|---|---|---|
| Blind (80 docs sinteticos, 757 valores) | valores detectados | 757 / 757 | 757 / 757 |
| Held-out (60 docs sinteticos, 618 valores) | valores detectados | 618 / 618 | 618 / 618 |
| Prosa legal sin nombres | falsas alarmas | 3 | 3 |
| Yargıtay real, nombres restituidos (1.643 nombres) | recall / precision | 99,3 % / 96,2 % | 98,6 % / 95,9 % |
| Wikipedia real, Wiki NER test (654 nombres) | recall / precision | 89,8 % [87,1–92,1] / 89,9 % | 40,7 % |

Resultados del modelo solo (sin reglas):

| Conjunto | Nombres | Direcciones | Terminos de salud | Spans extra |
|---|---|---|---|---|
| Blind (80 docs, 16 estilos, 4 nuevos) | 364 / 365 | 80 / 80 | 25 / 26 | 0 |
| Held-out (60 docs) | 275 / 275 | 70 / 70 | 26 / 26 | 0 |
| Wiki NER dev (1.000 frases reales) | 583 / 641 | no disponible | no disponible | 53 |

Rendimiento medido: aproximadamente 27 ms por documento sintético y 19 ms por frase en un Mac con Apple Silicon, usando ONNX int8 con onnxruntime.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,5 GB en fp32 para inferencia con batch pequeño; menos de 0,3 GB en int8. Cifra orientativa a partir del tamaño de los pesos (440,3 MB fp32, 110,8 MB int8); no publicada explícitamente.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y superiores. También funciona en CPU y en Apple Silicon (MPS).
- Cabe en cualquier GPU consumer y en dispositivos de gama baja; el autor lo ejecuta en navegador con ONNX Runtime.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime (int8 o fp32), PyTorch con safetensors para fine-tuning adicional. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un encoder de clasificación.
- Latencia: 27 ms por documento sintético y 19 ms por frase en Mac Apple Silicon con int8. Throughput no publicado.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas directas con otros modelos de PII en turco. Como referencia estructural, el modelo base BERTurk es el punto de partida habitual para NER en turco:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| katip-tr-pii-berturk | 110 M | no disponible | NER de PII legal (tr) | CC BY-SA 4.0 |
| dbmdz/bert-base-turkish-cased | 110 M | 512 (BERT estandar) | Modelo base, no NER | MIT (segun el modelo original; no confirmado en la informacion) |
| Turkish Wiki NER (referencia de datos) | no aplica | no aplica | Dataset NER en turco | CC BY-SA 4.0 |

No hay datos de benchmarks comparativos con otros modelos de PII turcos en la información proporcionada.

## Limitaciones y advertencias

- Las direcciones y los términos de salud se aprenden únicamente de documentos sintéticos; su robustez en texto real no está validada.
- El conjunto de prueba judicial real usa decisiones con nombres restituidos por el autor, porque las resoluciones publicadas en Turquía están anonimizadas; los expedientes reales con consentimiento de despachos piloto son la siguiente prueba pendiente.
- Sesgo potencial hacia los estilos y plantillas de los documentos sintéticos generados por el propio proyecto.
- Riesgo de falsos negativos en nombres poco frecuentes o con ortografía atípica; el recall en Wikipedia real es del 89,8 %, no del 100 %.
- Solo soporta turco; no debe usarse con textos en otros idiomas.
- Licencia CC BY-SA 4.0: obliga a atribuir a Katip y al dataset Turkish Wiki NER y a compartir las adaptaciones bajo la misma licencia. La v1 (solo datos sintéticos) estaba bajo CC BY-NC 4.0; el código de Katip es AGPL-3.0 y requiere licencia comercial para uso propietario.
- No es un modelo generativo: no responde preguntas ni razona; su salida son etiquetas BIO.
- En producción conviene combinarlo con reglas y revisión humana, como hace el propio sistema Katip, dado que las métricas reportadas corresponden a esa combinación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-tr-pii-berturk
- Repositorio Katip: https://github.com/fikrifirat/katip
- Scripts y método de evaluación: https://github.com/fikrifirat/katip/tree/lab/lab
- Comparativa tamaño/velocidad/precisión: https://github.com/fikrifirat/katip#size-speed-and-accuracy-side-by-side
- Dataset Turkish Wiki NER: https://github.com/turkish-nlp-suite/Turkish-Wiki-NER-Dataset
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
