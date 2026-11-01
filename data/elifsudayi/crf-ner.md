# elifsudayi/crf-ner

## Resumen

`elifsudayi/crf-ner` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en textos financieros. No se trata de una red neuronal ni de un transformer, sino de un Campo Aleatorio Condicional (CRF) de cadena lineal entrenado con `sklearn-crfsuite` y serializado con `joblib`. El modelo lo publica la usuaria elifsudayi como proyecto del curso COE025 NLP de la Universidad de Istinye, y su repositorio incluye el código de extracción de características y el artefacto entrenado.

El modelo resuelve un problema muy concreto: identificar ocho categorías de PII (correo electrónico, teléfono, dirección, fecha, nombre, identificador, empresa y número de cuenta) en contratos, mensajes SWIFT y facturas en inglés. Para ello utiliza características artesanales basadas en ventana deslizante (±2 tokens), prefijos, sufijos y formas léxicas, junto con transiciones de estado aprendidas. No requiere GPU ni infraestructura de inferencia de deep learning: el artefacto pesa prácticamente nada y se carga con `joblib`.

Su relevancia radica en que ofrece un baseline ligero y auditable para tareas de anonimización y cumplimiento normativo (RGPD, PCI-DSS) en dominios financieros, donde la latencia y el coste de despliegue importan más que la precisión puntera. El modelo se entrenó sobre 30.545 fragmentos del split inglés del dataset `gretelai/synthetic_pii_finance_multilingual`, con 17 etiquetas BIO. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRF de cadena lineal (linear-chain CRF) con features artesanales |
| Parametros totales | no disponible (modelo discriminativo, no neuronal; el tamaño depende del vocabulario de features) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante de ±2 tokens sobre la secuencia de entrada) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto `.joblib` con pesos de features) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.joblib` (serialización de `sklearn-crfsuite`), requiere `scikit-learn==1.9.1` |
| Etiquetas | 17 etiquetas BIO sobre 8 categorías de PII |
| Optimizador | L-BFGS con `c1=0.25`, `c2=0.1` |
| Librería | `sklearn-crfsuite` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un CRF de cadena lineal, un modelo discriminativo que modela la probabilidad conjunta de una secuencia de etiquetas condicionada a la secuencia de observaciones. A diferencia de un transformer, no aprende representaciones densas: cada token se representa mediante un vector disperso de características artesanales que incluyen la palabra en minúsculas, prefijos y sufijos de longitud variable, la forma léxica (mayúsculas, dígitos, patrones), y el contexto de ventana de ±2 tokens. Sobre esta representación, el CRF aprende pesos de emisión (token → etiqueta) y de transición (etiqueta → etiqueta) mediante optimización L-BFGS con regularización L1 (`c1=0.25`) y L2 (`c2=0.1`).

El entrenamiento se realizó sobre el split inglés limpio del dataset `gretelai/synthetic_pii_finance_multilingual`, con 30.545 fragmentos de entrenamiento y 3.903 fragmentos de test. El esquema de etiquetado es BIO (Begin, Inside, Outside) con 17 etiquetas que cubren 8 categorías de PII. No se emplearon técnicas de RLHF, DPO ni ajuste fino neuronal; el modelo es puramente supervisado y determinista en su entrenamiento. La innovación técnica es la simplicidad: un baseline reproducible y auditable que sirve como referencia para comparar con modelos neuronales en la misma tarea.

## Capacidades

- Detección de PII en textos financieros en inglés: correo electrónico, teléfono, dirección, fecha, nombre, identificador, empresa y número de cuenta.
- Etiquetado a nivel de token con esquema BIO (17 etiquetas).
- Inferencia sobre secuencias de tokens arbitrarias mediante `predict_single`.
- Extracción de entidades a partir de texto crudo tokenizado (requiere tokenización previa).
- Modelo determinista y reproducible: misma entrada, misma salida.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No soporta visión, audio ni modalidades distintas de texto.
- No soporta modo "thinking" ni decodificación especulativa.
- Capacidad multilingüe limitada al inglés; el dataset de origen es multilingüe pero el split usado es solo inglés.

## Casos de uso

- Anonimización previa a registro (logging): el modelo puede procesar cada línea de log financiero y sustituir las entidades detectadas por marcadores genéricos antes de enviar los logs a un sistema externo, reduciendo el riesgo de filtrar PII en texto plano.
- Cumplimiento RGPD en pipelines de datos: integrado como paso previo a un ETL, permite marcar o enmascarar nombres, cuentas y direcciones en contratos y facturas antes de almacenarlos en un data lake, con un coste computacional mínimo.
- Redacción de documentos para revisión externa: en despachos jurídicos o financieros, el modelo puede preprocesar contratos y mensajes SWIFT para generar versiones redactadas que se comparten con terceros sin exponer datos personales.
- Preprocesamiento para modelos neuronales: al ser un baseline ligero, puede usarse como primera pasada para etiquetar PII y luego alimentar un modelo transformer con menos datos que anotar manualmente, reduciendo el coste de anotación.
- Detección de fugas en respuestas de chatbots: colocado como filtro de salida en un asistente financiero, detecta si la respuesta generada contiene PII que no debería haberse expuesto y bloquea o redacta la respuesta antes de enviarla al usuario.
- Auditoría de datasets sintéticos: dado que el dataset de entrenamiento es sintético (`gretelai/synthetic_pii_finance_multilingual`), el modelo puede usarse para verificar que los datos sintéticos generados no contienen PII real filtrada, comparando las entidades detectadas con las esperadas.
- Etiquetado asistido en anotación humana: el modelo preetiqueta tokens con PII en herramientas de anotación, y los anotadores corrigen los errores, acelerando el proceso de creación de datasets de NER financiero.

## Benchmarks y rendimiento

Resultados de test sobre 3.903 fragmentos, evaluación estricta IOB2 con `seqeval`:

| Métrica | Valor |
|---|---|
| Entity micro-F1 | 0.8221 |
| Token macro-F1 | 0.7551 |
| Entity precision | 0.8586 |
| Entity recall | 0.7887 |
| Tasa de PII no detectada (missed PII rate) | 21.1% |

F1 por entidad en test:

| EMAIL | PHONE | ADDRESS | DATE | NAME | ID | COMPANY | ACCOUNT |
|---|---|---|---|---|---|---|---|
| 0.9412 | 0.8814 | 0.8638 | 0.8464 | 0.8314 | 0.7844 | 0.7395 | 0.7138 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo basado en CPU, artefacto `.joblib` de tamaño despreciable).
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna; no requiere aceleración hardware.
- Opciones de despliegue: script Python con `joblib` y `sklearn-crfsuite`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del CRF, la inferencia es de milisegundos por secuencia en CPU, pero no se han publicado mediciones.
- Requisito crítico de entorno: `scikit-learn==1.9.1` para evitar errores de carga del artefacto `.joblib` por cambios en estructuras internas de módulos y extensiones C.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| elifsudayi/crf-ner | CRF lineal con features artesanales | no disponible (disperso) | ventana ±2 tokens | en | Apache 2.0 | HuggingFace |
| Modelos NER transformer (p. ej. bert-base-NER) | Transformer encoder | ~110M | 512 tokens | multilingüe (según checkpoint) | variable (MIT, Apache 2.0, etc.) | HuggingFace |
| spaCy NER (modelos `en_core_web_*`) | CNN/transformer según versión | variable | variable | en y otros | MIT | spaCy |
| Presidio (Microsoft) | Pipeline con NER + reglas | variable | no aplica | varios | MIT | GitHub |

No se dispone de datos de benchmark comparativos entre estos modelos en la información proporcionada; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Tasa de PII no detectada del 21.1% en test: en producción, una de cada cinco entidades PII puede pasar sin ser marcada, lo que es insuficiente para cumplimiento normativo estricto sin una capa de reglas adicional.
- F1 bajo en categorías críticas: `ACCOUNT` (0.7138) y `COMPANY` (0.7395) son las peores, precisamente dos de las más sensibles en el dominio financiero.
- Solo inglés: el modelo no cubre otros idiomas, aunque el dataset de origen sea multilingüe.
- Dependencia estricta de versiones: `scikit-learn==1.9.1` es obligatorio para cargar el `.joblib`; otras versiones pueden fallar al deserializar.
- Sensible a la tokenización: el rendimiento depende de que la tokenización previa sea coherente con la usada en entrenamiento; no se documenta el tokenizador exacto.
- Sin capacidades generativas: no puede redactar, resumir ni razonar; solo etiqueta tokens.
- Entrenado sobre datos sintéticos: el dataset `gretelai/synthetic_pii_finance_multilingual` es sintético, por lo que la distribución puede diferir de textos financieros reales y el rendimiento en producción puede degradarse.
- Proyecto académico: sin mantenimiento garantizado, sin issues resueltas ni comunidad; 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir falsos positivos (marcar como PII texto que no lo es) y falsos negativos (no marcar PII real).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/elifsudayi/crf-ner
- Repositorio del proyecto: https://github.com/ata-sesli/nlp-project-2
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Librería `sklearn-crfsuite`: https://github.com/TeamHG-Memex/sklearn-crfsuite
- `seqeval` (evaluación): https://github.com/chakki-works/seqeval
