# AtomicoLabs/ALF-pii-nano

## Resumen

ALF-pii-nano es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en inglés y español. Desarrollado por AtomicoLabs, forma parte de la familia ALF y se presenta como una solución eficiente para entornos on-device, con menos de 100 millones de parámetros. El modelo es un fine-tune de `microsoft/deberta-v3-xsmall` (arquitectura DeBERTa-v2) y está diseñado para etiquetar entidades como nombres, correos electrónicos, teléfonos, direcciones, números de identificación, tarjetas de crédito, IBAN, IPs, nombres de usuario/URLs y organizaciones.

El modelo resuelve el problema de la anonimización y el cumplimiento normativo (por ejemplo, RGPD) en entornos donde la privacidad y la eficiencia son críticas. Su tamaño reducido (70,7 millones de parámetros) y su licencia MIT lo hacen atractivo para integraciones en aplicaciones locales, pipelines de datos y herramientas de redacción automática. La versión 1.0 publicada en agosto de 2026 incluye pesos en Hugging Face y en GitHub Releases, con soporte para la librería `transformers` mediante el pipeline de token-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder-only, token classification) |
| Parametros totales | 70.690.967 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en), espanol (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponibles en GitHub Release) |

## Arquitectura y entrenamiento

ALF-pii-nano se basa en la arquitectura DeBERTa-v3-xsmall, un modelo transformer encoder-only con atención desacoplada (disentangled attention) que mejora la representación de relaciones entre tokens. El modelo se fine-tuneó como `DebertaV2ForTokenClassification` mediante supervisión directa (SFT) durante 3 épocas sobre un dataset bilingüe EN+ES. No se especifica el tamaño ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. La innovación principal no reside en la arquitectura base, sino en la especialización para PII con un tamaño muy reducido, lo que permite su ejecución en dispositivos con recursos limitados.

## Capacidades

- Detección de entidades PII en inglés y español: `PERSON`, `EMAIL`, `PHONE`, `ADDRESS`, `DATE_DOB`, `ID_NUMBER`, `CREDIT_CARD`, `ACCOUNT_IBAN`, `IP`, `USERNAME_URL`, `ORG`.
- Clasificación de tokens con pipeline de `token-classification` de Hugging Face, compatible con `aggregation_strategy="simple"` para agrupar entidades multi-token.
- Funcionamiento on-device: al ser un modelo de 70M parámetros, puede ejecutarse en CPU y en GPUs de gama baja sin necesidad de infraestructura especializada.
- No es un modelo generativo: no produce texto, solo etiqueta tokens. No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada a inglés y español; no se mencionan otros idiomas.

## Casos de uso

- Anonimización de documentos legales: el modelo puede etiquetar nombres, direcciones y números de identificación en contratos o expedientes antes de su publicación, facilitando la redacción automática con políticas de sustitución propias.
- Cumplimiento de RGPD en bases de datos: integración en pipelines de datos para detectar y marcar campos con PII (correos, teléfonos, IBAN) antes de transferencias o análisis.
- Filtrado de logs de aplicaciones: identificación de IPs, nombres de usuario y URLs en logs de servidores para evitar la exposición accidental de datos sensibles en entornos de desarrollo o producción.
- Preprocesamiento para entrenamiento de modelos: limpieza de datasets que contienen PII antes de usarlos en fine-tuning, reduciendo riesgos de fuga de información.
- Herramientas de redacción en tiempo real: integración en editores de texto o clientes de correo para sugerir la redacción de información personal antes de enviar mensajes.
- Auditoría de seguridad: escaneo de documentos internos o comunicaciones para verificar que no se comparten datos personales sin autorización, especialmente en entornos corporativos con políticas estrictas.

## Benchmarks y rendimiento

La model card reporta los siguientes valores de F1 (macro) en el conjunto de evaluación propio del autor:

| Idioma | F1 (ALF-pii-nano) | F1 (referencia Grok) |
|---|---|---|
| Ingles | 0.897 | 0.893 |
| Espanol | 0.939 | 0.895 |

No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ya que el modelo está especializado en una tarea de NER y no en tareas generales de lenguaje. La comparación con Grok (un modelo generativo de gran tamaño) sugiere que ALF-pii-nano supera ligeramente a Grok en esta tarea específica, aunque la metodología de evaluación no está detallada.

## Requisitos de hardware

- Al tratarse de un modelo de 70,7 millones de parámetros, la inferencia es viable en CPU (por ejemplo, un procesador moderno de portátil) con un uso de memoria inferior a 300 MB en precisión fp32.
- En GPU, cabe en tarjetas con 1 GB de VRAM o menos (por ejemplo, NVIDIA Jetson, GTX 1650, o incluso integradas). No se han publicado requisitos oficiales de VRAM.
- El formato safetensors es compatible con `transformers` y puede cargarse con `pipeline` directamente. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos generativos.
- Para despliegue en producción, se recomienda usar la librería `transformers` con `torch` o `onnxruntime` (si se exporta a ONNX), aunque no se documenta explícitamente.
- La latencia estimada es de milisegundos por documento corto (menos de 512 tokens) en CPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de PII en la documentación proporcionada. El modelo base `microsoft/deberta-v3-xsmall` no está especializado en PII, por lo que no es directamente comparable. Alternativas comerciales o de código abierto como `dslim/bert-base-NER` o `xlm-roberta-large` podrían servir como referencia, pero no se han evaluado en el mismo conjunto de datos. Por tanto, la comparativa se limita a la referencia interna con Grok (F1 0.893 EN / 0.895 ES) que el autor incluye en la model card.

## Limitaciones y advertencias

- Es un clasificador de tokens, no un redactor automático: el usuario debe implementar su propia política de sustitución o enmascaramiento.
- La entidad `PERSON` es la más débil en español, con un F1 de 0.78 en la evaluación interna, lo que puede provocar errores en la detección de nombres propios.
- La longitud máxima de contexto es de 512 tokens, por lo que documentos largos deben dividirse en fragmentos, lo que puede afectar a la coherencia de las entidades que cruzan los límites.
- No constituye una garantía de cumplimiento legal o de privacidad; es una herramienta de apoyo y debe validarse en cada caso de uso.
- El modelo solo soporta inglés y español; no se garantiza su rendimiento en otros idiomas.
- La licencia MIT permite uso comercial, pero se debe incluir el aviso de licencia del modelo base DeBERTa-v3 (también MIT) al redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicoLabs/ALF-pii-nano
- Release v1.0 en GitHub: https://github.com/AtomicoLabs/ALF-pii-nano/releases/tag/v1.0
- Web de AtomicoLabs (research): https://www.atomicolabs.com/research
- Web principal de AtomicoLabs: https://www.atomicolabs.com/
- Modelo base DeBERTa-v3-xsmall: https://huggingface.co/microsoft/deberta-v3-xsmall
