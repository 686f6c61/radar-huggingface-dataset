# f1k/katip-mask-base

## Resumen

Katip Mask Base es un modelo BERTurk afinado para el etiquetado de entidades nombradas (NER) orientado a la desidentificación de documentos legales en turco. Desarrollado por el autor f1k como componente "on-device" del proyecto Katip Mask, detecta nombres de personas, direcciones y términos de salud del artículo 6 de la KVKK (la ley turca de protección de datos), con el objetivo de permitir el borrado automático de datos personales en textos jurídicos.

El modelo parte de `dbmdz/bert-base-turkish-cased`, un transformer encoder de tipo BERT con 110.032.135 parámetros y vocabulario en turco con distinción de mayúsculas. La versión v2, publicada el 13 de noviembre de 2026, incorpora 17.967 frases reales en turco (procedentes de Turkish Wiki NER, solo nombres de persona) junto a documentos sintéticos, lo que eleva la detección de nombres en frases reales del 41% al 90%.

Su relevancia radica en que combina un tamaño reducido (110 MB en int8) con latencia de decenas de milisegundos por documento en Apple Silicon, lo que permite ejecutarlo íntegramente en el navegador mediante transformers.js y ONNX Runtime sin enviar datos sensibles a un servidor. Es, por tanto, una pieza de privacidad por diseño para despachos jurídicos y flujos de redacción documental en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTurk, cased) |
| Parametros totales | 110.032.135 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | int8 (ONNX `model_quantized.onnx`, 110,8 MB) y fp32 (ONNX `model.onnx`, 440,3 MB); pesos PyTorch en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un BERT base cased adaptado al turco (`dbmdz/bert-base-turkish-cased`), con 110 millones de parámetros y clasificación token a token mediante etiquetas BIO a nivel de palabra. Las etiquetas se asignan al primer sub-token de cada palabra y el particionado de palabras se controla con la expresión regular `katip.word_regex` definida en `config.json`, tal como hace `src/ner.js` de Katip. Se exportó a ONNX en fp32 e int8 para su ejecución con transformers.js y onnxruntime.

El entrenamiento de v2 se realizó durante 3 épocas sobre 8.000 documentos sintéticos más 2.246 pseudo-documentos compuestos de ocho frases reales cada uno, en 28 minutos sobre Apple Silicon con MPS. La incorporación de frases reales de Turkish Wiki NER (Altinok, 2023) es la innovación principal de v2: corrige el sesgo hacia texto sintético que hacía que v1 detectara solo el 41% de nombres en frases reales. Las direcciones y los términos de salud siguen aprendiéndose únicamente de documentos sintéticos, lo que el autor señala explícitamente como limitación. No se menciona RLHF, DPO ni decodificación especulativa; es un modelo discriminativo de clasificación, no generativo.

## Capacidades

- Etiquetado de entidades nombradas (NER) en turco con etiquetas BIO a nivel de palabra.
- Detección de nombres de personas, direcciones y términos de salud del artículo 6 de la KVKK.
- Redacción/anonimización de datos personales (PII) en documentos legales turcos.
- Ejecución en navegador y en dispositivo mediante ONNX (fp32 e int8) y transformers.js.
- Integración con reglas deterministas: el pipeline de Katip combina reglas más el modelo, conservando las aristas de las entidades con puntuación igual o superior a 0,5 (`trust` 0,5, elegido sobre datos de desarrollo).
- Multilingüe: no; únicamente turco.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no aplica; es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Anonimización de expedientes judiciales: el modelo detecta nombres en prosa real de Yargıtay con un 99,3% de exhaustividad y 96,2% de precisión, lo que permite sustituir identidades antes de publicar o compartir resoluciones.
- Cumplimiento de la KVKK en despachos de abogados: al etiquetar términos de salud del artículo 6 y direcciones, facilita la clasificación de datos sensibles que requieren protección reforzada en la gestión documental interna.
- Redacción en el navegador para clientes: al ejecutarse en int8 (110,8 MB) con transformers.js, el texto nunca sale del dispositivo del usuario, lo que encaja en flujos de consulta legal con requisitos estrictos de confidencialidad.
- Preprocesado en pipelines de e-discovery: la latencia de unos 27 ms por documento sintético y 19 ms por frase en Apple Silicon permite procesar lotes grandes de documentos antes de indexarlos o enviarlos a revisión humana.
- Enmascarado previo a modelos generativos: sirve como paso de saneado antes de enviar textos jurídicos a un LLM en la nube, reduciendo la exposición de PII en el prompt.
- Etiquetado asistido para revisión humana: con un 89,8% de exhaustividad y 89,9% de precisión en frases reales de Wikipedia, es útil como primera pasada que un revisor confirma o corrige, reduciendo el trabajo manual.
- Ajuste fino adicional: los pesos en safetensors permiten reentrenar el modelo sobre dominios jurídicos específicos (por ejemplo, contratos mercantiles) partiendo de una base ya adaptada al turco legal.

## Benchmarks y rendimiento

Resultados en Katip (reglas + modelo, tal como se ejecuta la demo; umbral 0,5):

| Conjunto | v2 | v1 |
|---|---|---|
| Ciego (80 documentos sintéticos, 757 valores) | 757 / 757; nombres 365 / 365 | 757 / 757 |
| Retenido (60 documentos sintéticos, 618 valores) | 618 / 618 | 618 / 618 |
| Prosa legal sin nombres | 3 falsos positivos | 3 |
| Prosa real de Yargıtay, nombres reanonimizados (1.643 nombres) | 99,3% encontrados, 96,2% precisión | 98,6%, 95,9% |
| Frases reales de Wikipedia, test Wiki NER (654 nombres) | 89,8% [87,1–92,1], 89,9% precisión | 40,7% |

Resultados del modelo solo, sin reglas:

| Conjunto | Nombres | Direcciones | Términos de salud | Spans extra |
|---|---|---|---|---|
| Ciego (80 documentos, 16 estilos, 4 nuevos) | 364 / 365 | 80 / 80 | 25 / 26 | 0 |
| Retenido (60 documentos) | 275 / 275 | 70 / 70 | 26 / 26 | 0 |
| Wiki NER dev (1.000 frases reales) | 583 / 641 | — | — | 53 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño, el modelo int8 (110,8 MB) cabe holgadamente en cualquier GPU consumer, y el fp32 (440,3 MB) también.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta entrenamiento e inferencia en Apple Silicon (MPS) y ejecución en navegador vía onnxruntime. Para servidores, A100, H100 o RTX 4090 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU y en el navegador.
- Opciones de despliegue: transformers.js con ONNX Runtime (int8 y fp32), PyTorch con safetensors para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de clasificación).
- Latencia y throughput: aproximadamente 27 ms por documento sintético y 19 ms por frase en un Mac con Apple Silicon (int8 ONNX, onnxruntime). No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Katip Mask Base (este) | 110 M | no disponible | tr | CC BY-SA 4.0 | NER legal y PII en turco, ONNX |
| dbmdz/bert-base-turkish-cased | 110 M | no disponible | tr | no disponible en la información | BERTurk base, sin ajuste NER |
| Turkish Wiki NER (Altinok, 2023) | no disponible | no disponible | tr | CC BY-SA 4.0 | Dataset NER de Wikipedia en turco |
| Modelos NER multilingües genéricos | no disponible | no disponible | varios | no disponible | NER general, sin especialización legal turca |

No se dispone en la información proporcionada de resultados de benchmarks comparativos con otros modelos NER turcos especializados en dominio legal.

## Limitaciones y advertencias

- Las direcciones y los términos de salud se aprenden solo de documentos sintéticos; su rendimiento en texto real no está validado.
- El conjunto de prueba de sentencias reales usa decisiones con nombres reinsertados manualmente, porque las resoluciones publicadas en Turquía están anonimizadas; el autor reconoce que la validación con expedientes reales consentidos de despachos piloto está pendiente.
- Solo soporta turco; no es multilingüe.
- Riesgo de falsos positivos en prosa legal sin nombres: 3 falsos positivos reportados en el conjunto de prosa legal.
- Licencia CC BY-SA 4.0: obliga a atribuir a Katip y al dataset Turkish Wiki NER, y a compartir las adaptaciones bajo la misma licencia. El código de Katip es AGPL-3.0; para licencia comercial del código o soporte hay que abrir una incidencia en el repositorio.
- Es un modelo discriminativo de etiquetado, no generativo: no admite tool calling, agentes ni razonamiento multi-paso.
- El umbral de confianza (0,5) se eligió sobre datos de desarrollo; en producción conviene recalibrarlo según el dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-base
- Demo Katip Mask: https://huggingface.co/spaces/f1k/katip-mask
- Repositorio Katip (código y scripts de laboratorio): https://github.com/fikrifirat/katip
- Scripts de método y evaluación: https://github.com/fikrifirat/katip/tree/lab/lab
- Comparativa de tamaño, velocidad y precisión: https://github.com/fikrifirat/katip#size-speed-and-accuracy-side-by-side
- Dataset Turkish Wiki NER: https://github.com/turkish-nlp-suite/Turkish-Wiki-NER-Dataset
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
