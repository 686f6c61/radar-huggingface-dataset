# Preetm-666/mintx-pii-distilbert

## Resumen

mintx-pii-distilbert es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de `distilbert-base-cased` para la detección de datos personales identificables (PII) en texto de páginas web. Lo desarrolla Preetm-666 como componente del motor de privacidad de la extensión de navegador Mintx Assistant, y su rasgo diferencial es que está pensado para ejecutarse íntegramente en el navegador mediante transformers.js con pesos ONNX cuantizados a int8, de modo que el texto analizado no abandona el dispositivo del usuario.

El modelo tiene 65.211.675 parámetros (la configuración estándar de DistilBERT, con 6 capas y dimensión oculta 768) y una ventana de contexto de 256 tokens, limitada por la longitud máxima usada en el entrenamiento. Etiqueta entidades en formato BIO con trece categorías que van desde PERSON o EMAIL hasta identificadores específicos del contexto indio como UPI_ID, además de SECRET, IP_ADDRESS o CREDIT_CARD.

Su relevancia reside en el enfoque: un modelo pequeño y desplegable en cliente que supera ampliamente a un baseline NER genérico como bert-base-NER en las métricas de privacidad publicadas, con una tasa de recall de privacidad de 0,993 sobre el conjunto sintético y 0,995 sobre el conjunto derivado de ai4privacy. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) |
| Parametros totales | 65.211.675 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | int8 (ONNX `model_quantized.onnx`); pesos safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (incluye variante cuantizada int8) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo DistilBERT, la variante destilada de BERT con 6 capas y 65,2 millones de parámetros, adaptada a clasificación de tokens con cabecera BIO sobre trece etiquetas de PII. El checkpoint base es `distilbert-base-cased`, lo que implica tokenización sensible a mayúsculas, relevante para distinguir nombres propios y formatos de identificadores.

El entrenamiento se realizó sobre el dataset `Preetm-666/mintx-pii`, con 26.388 ejemplos que ascienden a 36.153 tras sobremuestrear ×4 las etiquetas raras. Se aplicaron 3 épocas con learning rate 5e-05, batch de 32 y longitud máxima de 256, con un coste de 22 minutos en una Tesla T4. El dataset incorpora datos derivados de OpenPII 1.5M de Ai4Privacy / Ai Suisse SA (CC-BY-4.0) y todos los datos personales de entrenamiento son sintéticos. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de etiquetado. La innovación destacable no es arquitectónica sino de despliegue: la exportación a ONNX int8 para inferencia local en navegador.

## Capacidades

- Detección de entidades PII en texto: PERSON, EMAIL, PHONE, ADDRESS, LOCATION, ORGANIZATION, DATE_OF_BIRTH, GOV_ID, CREDIT_CARD, BANK_ACCOUNT, UPI_ID, IP_ADDRESS y SECRET, en formato BIO.
- Clasificación de tokens a nivel de span, con soporte para evaluación exacta y parcial de entidades.
- Política de etiquetado que deja deliberadamente sin marcar entidades públicas (países, grandes organizaciones, figuras públicas), lo que reduce el enmascaramiento excesivo.
- Inferencia en el cliente vía transformers.js con ONNX int8, sin envío de texto a servidores.
- Capacidad de actuar como capa de redacción o enmascaramiento previo a otros procesamientos.
- No soporta tool calling, razonamiento multi-paso, agentes, visión ni audio.
- Multilingüismo limitado: solo inglés, con formatos de nombres y números indios y occidentales.

## Casos de uso

- Extensión de navegador con privacidad en el dispositivo: es el caso de uso nativo del modelo; se integra con transformers.js para analizar el texto de la página antes de enviarlo a cualquier servicio externo, garantizando que el contenido sensible no sale del equipo.
- Redacción previa a LLM en pipelines RAG: el modelo puede enmascarar PII en documentos antes de enviarlos a un modelo generativo alojado, reduciendo la exposición de datos personales en la nube.
- Cumplimiento de RGPD en formularios y logs: se puede usar para detectar y anonimizar correos, teléfonos, direcciones o identificadores bancarios en registros de aplicación antes de su almacenamiento o exportación.
- Limpieza de datasets para entrenamiento: filtrado y sustitución de entidades personales en corpus scrapeados de la web, con la ventaja de su bajo coste computacional (65 M de parámetros).
- Moderación de contenido generado por usuarios: detección de datos personales publicados en foros o comentarios para su redacción automática antes de mostrarlos.
- Procesamiento en entornos con restricciones de soberanía de datos: al ejecutarse en local, encaja en escenarios donde no está permitido enviar texto a APIs externas, como administraciones o sectores regulados.
- Preprocesado en dispositivos de borde: su tamaño reducido y la variante int8 permiten desplegarlo en navegadores, portátiles o entornos sin GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card (métricas propias del autor):

| Conjunto | exact_f1 | partial_f1 | privacy_recall | over_mask_rate | keep_respected |
|---|---|---|---|---|---|
| mintx-pii-distilbert · test_synthetic | 0,893 | 0,948 | 0,993 | 0,039 | 0,851 |
| mintx-pii-distilbert · test_ai4privacy | 0,986 | 0,992 | 0,995 | 0,006 | 0,976 |
| mintx-pii-distilbert · test_realistic | 0,715 | 0,802 | 0,867 | 0,147 | 0,885 |
| baseline bert-base-NER · test_synthetic | 0,278 | 0,483 | 0,553 | 0,205 | 0,041 |
| baseline bert-base-NER · test_ai4privacy | 0,070 | 0,291 | 0,161 | 0,100 | 0,133 |
| baseline bert-base-NER · test_realistic | 0,190 | 0,427 | 0,500 | 0,355 | 0,212 |

Notas: *privacy recall* es la proporción de valores personales cubiertos por completo por un span predicho; *keep respected* es la proporción de entidades públicas que se dejan visibles. `test_realistic` es pequeño (61 ejemplos verificados manualmente), por lo que su fiabilidad estadística es limitada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 65 M de parámetros; el repo completo ocupa 0,6 GB, y la variante ONNX int8 reduce aún más la huella.
- GPU recomendadas: no requiere GPU; el autor reporta entrenamiento en una Tesla T4 en 22 minutos, y la inferencia es viable en CPU.
- Cabe en cualquier GPU de consumo e incluso en navegador; no necesita A100 ni H100.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime, Hugging Face Transformers con PyTorch, y potencialmente llama.cpp no aplica (no es un modelo generativo).
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; por tamaño y arquitectura, la inferencia en CPU es de milisegundos por secuencia de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mintx-pii-distilbert | 65,2 M | 256 | PII en inglés, 13 etiquetas, ONNX int8 para navegador | Apache 2.0 | Hugging Face |
| bert-base-NER | ~110 M | 512 | NER genérico CoNLL (PER, ORG, LOC, MISC) | Apache 2.0 | Hugging Face |
| distilbert-base-cased | 65,2 M | 512 | Modelo base sin fine-tuning para NER | Apache 2.0 | Hugging Face |

Frente a bert-base-NER, el modelo de Mintx obtiene métricas de privacidad muy superiores en los conjuntos del autor (privacy_recall de 0,993 frente a 0,553 en test_synthetic), aunque la comparación es favorable al modelo evaluado por estar entrenado sobre la misma distribución de datos. No se dispone de comparación con otros modelos especializados en PII en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no cubre otros idiomas ni formatos de nombres o números fuera del contexto indio y occidental.
- Ventana de contexto de 256 tokens: textos más largos requieren fragmentación, con riesgo de perder entidades en los límites.
- El autor advierte explícitamente de que no es una garantía y debe combinarse con detectores basados en reglas.
- El rendimiento cae en el conjunto realista (exact_f1 de 0,715 y over_mask_rate de 0,147), lo que indica enmascaramiento excesivo en texto real.
- `test_realistic` tiene solo 61 ejemplos, por lo que las métricas sobre él tienen alta varianza.
- Riesgo de alucinación de entidades y de falsos positivos en textos con formatos atípicos; el sobremuestreo de etiquetas raras puede sesgar hacia la detección agresiva.
- Los datos de entrenamiento son sintéticos, lo que puede no reflejar la distribución real de PII en producción.
- Licencia Apache 2.0 permite uso comercial, pero la atribución a OpenPII 1.5M (CC-BY-4.0) debe respetarse según los términos del dataset.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Preetm-666/mintx-pii-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/Preetm-666/mintx-pii
- Repositorio de la extensión Mintx Assistant: https://github.com/preetz-6/Mintx-
- Modelo base: https://huggingface.co/distilbert/distilbert-base-cased
- OpenPII 1.5M (Ai4Privacy): no disponible en la información proporcionada
