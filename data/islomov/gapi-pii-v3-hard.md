# islomov/gapi-pii-v3-hard

## Resumen

Gapi PII v3 hard es un modelo BERT de 12 capas y 108,9 millones de parámetros especializado en la detección de datos personales (PII) en transcripciones de llamadas en uzbeko. Lo desarrolla el autor islomov como parte del motor de reconocimiento de voz Gapi (gapi.uz), y constituye la versión afinada del modelo base islomov/rubai-PII-detection-v1-latin. Resuelve un problema concreto: el texto generado por ASR en uzbeko es ruidoso, con números dictados en palabras, dígitos repetidos en grupos y palabras rusas intercaladas en frases uzbekas, lo que rompe los detectores de PII convencionales.

El modelo realiza token-classification con 13 etiquetas BIO (O más B/I para cada una de las seis clases: NAME, PHONE, ADDRESS, DATE, DOCUMENT_ID y CARD_NUMBER) y devuelve spans exactos de caracteres junto con una copia del texto enmascarada. Está pensado para integrarse en pipelines de anonimización previos al almacenamiento, de modo que los datos personales se enmascaren antes de persistirse.

Es relevante ahora porque cubre un hueco poco atendido: la anonimización de PII en lenguas de Asia Central con code-switching ruso-uzbeko, un escenario frecuente en centros de contacto de la región. Su licencia Apache-2.0 y la disponibilidad de los pesos en safetensors facilitan su adopción tanto en investigación como en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), 12 capas |
| Parámetros totales | 108.906.253 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con solapamiento para textos largos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | uzbeko (alfabeto latino, con palabras rusas intercaladas); ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un BERT estándar de 12 capas con cabeza de clasificación de tokens para 13 etiquetas BIO. Se obtiene por fine-tuning del modelo islomov/rubai-PII-detection-v1-latin, del que conserva el tokenizador sin cambios. El esquema BIO permite separar entidades adyacentes, como dos nombres consecutivos o un número y su repetición dictada, en lugar de fusionarlos en un único span.

El entrenamiento se orienta a transcripciones de llamadas en uzbeko, un dominio con peculiaridades específicas: números dictados en palabras, dígitos agrupados y repetidos, y mezcla de léxico ruso dentro de oraciones uzbekas. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, y tampoco indica si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de clasificación de tokens). La innovación principal es el tratamiento del texto dictado ruidoso y la devolución de offsets a nivel de carácter Unicode, con lectura de textos largos en ventanas solapadas de 256 tokens.

## Capacidades

- Detección de entidades PII con spans exactos de caracteres sobre seis clases: NAME, PHONE, ADDRESS, DATE, DOCUMENT_ID y CARD_NUMBER.
- Enmascaramiento selectivo: `detect(texts, redact_labels=[...])` permite enmascarar solo las clases indicadas.
- Manejo de números dictados en palabras (por ejemplo, "to'qson bir yuz yigirma uch..." como teléfono).
- Manejo de dígitos agrupados y repetidos en la dictación.
- Procesamiento de code-switching ruso-uzbeko dentro de la misma frase.
- Soporte de textos largos mediante ventanas solapadas de 256 tokens, con offsets en caracteres Unicode.
- Verificación de integridad de los archivos contra `release.json` antes de la carga.
- Sin registro ni almacenamiento del texto procesado por parte del componente.
- No soporta tool calling, agentes, visión ni audio; es un modelo puramente de clasificación de tokens.

## Casos de uso

- Anonimización previa al almacenamiento en centros de contacto: el modelo enmascara nombres, teléfonos y direcciones en las transcripciones ASR antes de que se persistan en base de datos, reduciendo la superficie de exposición de datos personales.
- Cumplimiento normativo en grabaciones de llamadas: permite generar versiones redactadas de las transcripciones para auditoría o analítica sin exponer PII, con la posibilidad de elegir qué clases enmascarar según la política interna.
- Preprocesamiento para entrenamiento de modelos de ASR o NLP: se eliminan datos personales de los corpus de transcripciones antes de reutilizarlos en el ajuste de otros modelos.
- Búsqueda y analítica sobre transcripciones: al enmascarar solo NAME y PHONE, se conservan direcciones y fechas para análisis de negocio mientras se protege la identidad del cliente.
- Enrutado y clasificación de llamadas: los spans detectados permiten extraer entidades estructuradas (por ejemplo, el número de tarjeta o el documento de identidad) para tareas de verificación sin almacenar el texto completo.
- Moderación y revisión humana asistida: el modelo marca los fragmentos candidatos a PII y un revisor humano valida los casos dudosos, aprovechando la salida de spans para señalar exactamente qué revisar.
- Integración en pipelines de privacidad por diseño: al ejecutarse en CPU (`device="cpu"`) con un repo de 0,4 GB, puede desplegarse como paso previo en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre fragmentos de transcripciones de llamadas en uzbeko (conjunto de test de 1.392 fragmentos). Exact F1 exige clase correcta y ambos límites correctos; masking recall es la proporción de caracteres de datos personales que acaban enmascarados.

| Conjunto de test | Fragmentos | Exact F1 | Masking recall |
|---|---:|---:|---:|
| Transcripciones de llamadas | 1.392 | 85,5 % | 92,6 % |
| — modelo base sobre los mismos textos | 1.392 | 49,2 % | 67,7 % |
| Dominio general (visto por el modelo base) | 3.000 | 95,4 % | 99,1 % |

Resultados por clase sobre el conjunto de llamadas (Exact F1), con el modelo base entre paréntesis:

| Clase | Exact F1 |
|---|---|
| NAME | 96,0 % (base: 76,1 %) |
| PHONE | 80,4 % (base: 31,8 %) |
| ADDRESS | 71,3 % (base: 21,7 %) |

No se publican resultados para DOCUMENT_ID ni CARD_NUMBER por insuficiencia de ejemplos en las referencias. Las referencias del conjunto de llamadas son etiquetas automáticas bajo una política escrita, no anotación humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 108,9 M de parámetros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU (`device="cpu"`) o en GPU (`device="cuda:0"`). Cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: componente propio `gapi_pii_v0.PIIComponent` incluido en el repo; carga directa con `transformers` (`AutoModelForTokenClassification` y `AutoTokenizer`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| islomov/gapi-pii-v3-hard | 108,9 M | ventanas de 256 tokens | uz, ru | Apache-2.0 | Exact F1 85,5 % en llamadas |
| islomov/rubai-PII-detection-v1-latin (modelo base) | no disponible | no disponible | uz, ru | Apache-2.0 | Exact F1 49,2 % en llamadas; 95,4 % en dominio general |
| Modelos NER multilingües genéricos (p. ej. XLM-R o mBERT ajustados) | no disponible | no disponible | multilingüe | variable | No se dispone de resultados comparables en la información proporcionada |

No se dispone de datos de benchmarks de alternativas genéricas sobre el mismo conjunto de llamadas, por lo que la comparación cuantitativa se limita al modelo base.

## Limitaciones y advertencias

- No es un anonimizador completo: aproximadamente el 7 % de los caracteres de datos personales en texto de llamadas queda sin enmascarar, sobre todo fragmentos de direcciones y teléfonos.
- No detecta correos electrónicos, URL, matrículas de vehículos ni números fiscales.
- Entrenado para uzbeko en alfabeto latino con palabras rusas intercaladas; el texto en cirílico no fue probado.
- Riesgo de alucinación de spans: puede marcar fragmentos que no son PII o fallar límites de entidad, especialmente en ADDRESS (71,3 % Exact F1).
- Las referencias del conjunto de llamadas son etiquetas automáticas bajo una política escrita, no anotación humana independiente, lo que puede inflar o sesgar las métricas.
- No se publican métricas fiables para DOCUMENT_ID ni CARD_NUMBER.
- En producción, donde una fuga de datos sea costosa, se recomienda mantener una revisión humana o una segunda comprobación.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y el cumplimiento de la normativa de protección de datos aplicable (RGPD u otras).
- El modelo no registra ni almacena el texto procesado, pero la responsabilidad del tratamiento posterior recae en la aplicación que lo integra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islomov/gapi-pii-v3-hard
- Modelo base: https://huggingface.co/islomov/rubai-PII-detection-v1-latin
- Gapi (producto de reconocimiento de voz): https://gapi.uz
