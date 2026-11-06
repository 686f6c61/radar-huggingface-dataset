# Kurdzik/flisak-anon-en

## Resumen

flisak-anon-en es un modelo de clasificación de tokens (NER) especializado en la detección de nombres de personas en texto en inglés, desarrollado por Mateusz Kurdziel (usuario Kurdzik) como parte del sistema de gestión documental Flisak. Se trata de un fine-tuning de `FacebookAI/roberta-base` al que se le ha añadido una cabeza de clasificación de tres etiquetas (`O`, `B-PER`, `I-PER`), con 124 millones de parámetros totales. Su función es la segunda etapa de un pipeline de anonimización en dos fases: una primera etapa basada en expresiones regulares sustituye correos, teléfonos e identificadores, y este modelo detecta los nombres para reemplazarlos por marcadores como `<PERSON_n>`.

El modelo aborda un problema concreto que los NER genéricos en inglés resuelven mal en correo empresarial: nombres en minúscula, firmas en mayúscula, nombres que también son palabras comunes ("Will", "Grace", "Brown"), nombres de otras lenguas y nombres junto a empresas o calles con nombre propio. Según el autor, en un conjunto de prueba sintético de correo deja legibles solo el 0,05 % de los caracteres de nombres, frente al 5,47 % del mejor modelo permisivo comparable, y alcanza un F1 de persona de 0,888 en el subconjunto de correo y texto web de UNER English-EWT.

Es relevante ahora porque ofrece una licencia permisiva (CC BY 4.0) para una tarea sensible a la privacidad, con un tamaño lo bastante reducido (125 M parámetros) como para ejecutarse en CPU o en GPU de consumo, lo que facilita integrarlo en flujos de redacción de datos personales sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RobertaForTokenClassification` (RoBERTa base: 12 capas, hidden size 768), 3 etiquetas |
| Parametros totales | 124.057.347 (125 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana; textos largos se trocean en ventanas solapadas de 64 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (repo de 1,0 GB, librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base` (revisión `e2da8e2f811d1448a5b465c236feacd80ffbac7b`, licencia MIT) con el tokenizador byte-level BPE original sin modificar, y sustituye la cabeza de enmascaramiento por una cabeza de clasificación de tokens de tres etiquetas. Se entrenó sobre correo empresarial sintético en inglés y cuatro conjuntos públicos con licencia CC BY 4.0, entre ellos `nvidia/Nemotron-PII`, `MultiCoNER/multiconer_v2` y `GateNLP/broad_twitter_corpus`. Todos los textos de entrenamiento pasaron primero por la etapa de expresiones regulares, de modo que el modelo ha aprendido a detectar nombres junto a marcadores como `<EMAIL_1>`.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste por RLHF o DPO; al tratarse de una tarea de etiquetado de secuencias, el entrenamiento es supervisado token a token. La innovación destacable no está en la arquitectura, sino en el diseño del pipeline: ventanas solapadas para superar los 512 tokens, umbral de confianza de 0,4 para conservar entidades `PER`, expansión de spans que cortan un marcador, resolución de solapamientos a favor del span más a la derecha y numeración coherente por petición para que el mismo valor reciba el mismo número.

## Capacidades

- Detección de nombres de personas en inglés mediante etiquetado `B-PER`/`I-PER` con spans exactos.
- Reconocimiento de formas difíciles en correo: nombres en minúscula, firmas en mayúscula, nombres homónimos de palabras comunes y nombres de otras lenguas dentro de texto inglés.
- Discriminación entre nombres de persona y entidades denominadas a partir de personas (empresas, calles, universidades, enfermedades) que deben permanecer legibles.
- Funcionamiento tanto sobre texto plano como sobre texto ya procesado por la etapa de expresiones regulares, incluida la detección de nombres adyacentes a marcadores.
- Procesamiento de documentos largos mediante troceado en ventanas solapadas de 512 tokens con 64 tokens de solape.
- Integración con la pipeline `token-classification` de transformers usando `aggregation_strategy="simple"`.
- No soporta tool calling, razonamiento multi-paso, agentes, visión ni audio: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Redacción de correo empresarial antes de compartirlo: el modelo sustituye cada nombre por `<PERSON_n>`, manteniendo la trazabilidad de qué persona aparece en saludo y firma gracias a la numeración coherente por petición.
- Anonimización previa al envío de documentación a terceros o a proveedores de servicios: al ejecutarse en local sobre CPU, evita sacar texto con datos personales fuera de la infraestructura propia.
- Construcción de conjuntos de datos para entrenamiento o análisis: permite eliminar nombres de personas de corpus de correo y texto web antes de su publicación o uso interno.
- Cumplimiento de protección de datos en un gestor documental: se integra como etapa de nombre en el pipeline de Flisak, complementando la etapa de expresiones regulares que cubre correos, IP, IBAN, teléfonos, SSN y tarjetas.
- Preprocesado para sistemas de soporte o ticketing: limpia nombres de conversaciones multi-turno antes de almacenarlas en sistemas de analítica o de pasarlas a modelos de lenguaje externos.
- Etiquetado asistido de entidades en flujos de anotación: al tener un umbral de confianza configurable (0,4 por defecto), sirve para preanotar candidatos a nombre que un revisor humano valida después.
- Filtrado de PII en registros y logs de aplicaciones: detecta nombres en mensajes de texto libre antes de que se escriban en sistemas de observabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Precision | Recall | F1 |
|---|---|---|---|---|
| Detección de nombres de persona (span exacto) | Correo empresarial sintético en inglés, test v3 | 0,99 | 0,99 | 0,99 |
| Detección de nombres de persona (span exacto) | UNER English-EWT, test (rev. 8ed072d) | 0,8921 | 0,8842 | 0,8881 |

El autor indica además que, en el conjunto sintético de correo, el modelo deja legibles el 0,05 % de los caracteres de nombres, frente al 5,47 % del mejor modelo permisivo comparable, y que en el subconjunto de correo y texto web de UNER English-EWT su F1 de persona es 0,888 frente a 0,808 del mejor alternativo. No se aportan resultados de MMLU, HumanEval ni GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB para los pesos (125 M parámetros); en fp16 aproximadamente 0,25 GB. El repo completo ocupa 1,0 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- La evaluación del autor se realizó en CPU con transformers 5.12.0, tokenizers 0.22.2 y torch 2.11.0, por lo que el despliegue sin GPU es viable.
- Opciones de despliegue: pipeline `token-classification` de transformers, y por tratarse de un modelo transformers estándar puede servirse con TGI u otros servidores compatibles; no se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requiere fijar la versión de `tokenizers` (0.22.2) según las notas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 persona (UNER English-EWT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flisak-anon-en | 125 M | 512 tokens por ventana | 0,888 | CC BY 4.0 | Hugging Face |
| Kurdzik/flisak-anon (polaco) | no disponible | no disponible | no disponible (otro idioma) | no disponible | Hugging Face |
| Mejor NER permisivo en inglés medido por el autor | no disponible | no disponible | 0,808 | no disponible | no disponible |

El autor no identifica por nombre los modelos alternativos evaluados, por lo que la comparativa con terceros concretos no está disponible en la información proporcionada. La comparación más directa es con su homólogo polaco, `Kurdzik/flisak-anon`, que cubre la misma etapa del pipeline para texto en polaco.

## Limitaciones y advertencias

- Solo detecta nombres de personas: no cubre direcciones postales, números de identidad ni cuentas, que corresponden a la etapa de expresiones regulares.
- No detecta nombres dentro de direcciones de correo electrónico, ya que la etapa previa sustituye la dirección completa.
- No ofrece garantía de anonimato: puede omitir nombres, por lo que debe revisarse la salida cuando una omisión tenga consecuencias.
- Uso fuera de alcance: identificar, perfilar o rastrear personas.
- Solo inglés; para polaco debe usarse `Kurdzik/flisak-anon`.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la delimitación de spans, especialmente en nombres ambiguos.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; el conjunto sintético de correo puede no representar la distribución real de los textos del usuario.
- Licencia CC BY 4.0: permite uso comercial con atribución; debe conservarse la atribución al autor y respetarse la licencia MIT del modelo base.
- En textos de más de 512 tokens, el troceado con solape de 64 tokens puede fragmentar nombres en los límites de ventana.
- El umbral de confianza de 0,4 es una elección del pipeline del autor y puede requerir ajuste según el dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kurdzik/flisak-anon-en
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Modelo homólogo en polaco: https://huggingface.co/Kurdzik/flisak-anon
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset MultiCoNER v2: https://huggingface.co/datasets/MultiCoNER/multiconer_v2
- Dataset GateNLP/broad_twitter_corpus: https://huggingface.co/datasets/GateNLP/broad_twitter_corpus
- Ficha en free2aitools: https://free2aitools.com/model/kurdzik/flisak-anon-en
