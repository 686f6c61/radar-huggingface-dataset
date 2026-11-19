# Kaiserrrrrr/pii-deberta-v3-small-onnx

## Resumen

El modelo `Kaiserrrrrr/pii-deberta-v3-small-onnx` es una versión ONNX cuantizada en 8 bits de `microsoft/deberta-v3-small` afinada para la detección y redacción de información personal identificable (PII) en inglés. Lo publica el usuario Kaiserrrrrr en Hugging Face y está pensado específicamente para ejecutarse con Transformers.js, lo que permite desplegarlo tanto en Node.js como directamente en el navegador sin infraestructura de servidor dedicada.

El modelo resuelve un problema concreto: clasificar tokens de un texto en categorías de PII (nombres, correos, teléfonos, direcciones, etc.) para poder enmascararlos antes de enviar datos a terceros, almacenarlos o procesarlos. Al estar construido sobre DeBERTa-v3-small (141 millones de parámetros) y cuantizado en `q8`, el coste computacional y de memoria es bajo, lo que lo hace apto para entornos con recursos limitados.

Es relevante ahora porque la demanda de anonimización en el propio cliente (on-device) crece con la presión regulatoria (RGPD, CCPA) y con la adopción de asistentes y agentes que procesan texto sensible. La ventana máxima de 256 tokens obliga a usar ventanas deslizantes en documentos largos, un detalle importante para su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small) con atención desacoplada |
| Parametros totales | 141 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (ventana deslizante recomendada para documentos largos) |
| Tipos de cuantizacion | ONNX dinámicamente cuantizado a 8 bits (`q8`, `model_quantized.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` (ver limitaciones) |
| Formato de pesos | ONNX cuantizado (`onnx/model_quantized.onnx`), consumible vía Transformers.js |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un transformer encoder de la familia DeBERTa-v3 que introduce atención desacoplada (disentangled attention) entre contenido y posición, junto con una variante mejorada de atención relativa. Sobre esa base se ha realizado un ajuste fino para la tarea de token classification (NER de PII), tomando como referencia el dataset `ai4privacy/pii-masking-400k` en su porción en inglés. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición final del dataset tras el filtrado ni si se aplicaron técnicas de balanceo de clases.

La innovación técnica principal no está en el entrenamiento sino en el empaquetado: la conversión a ONNX con cuantización dinámica de 8 bits reduce el tamaño del modelo y acelera la inferencia en CPU, lo que permite ejecutarlo en el navegador mediante Transformers.js. No se documentan detalles sobre el proceso de exportación (versión de Optimum, opset, calibración) ni sobre si se aplicó destilación o poda adicional.

## Capacidades

- Detección de entidades de PII en texto en inglés mediante token classification (NER).
- Redacción o enmascaramiento de las entidades detectadas, orientado a pipelines de anonimización.
- Ejecución en cliente: funciona en navegador y en Node.js a través de Transformers.js, sin backend.
- Inferencia sobre CPU gracias a la cuantización `q8`, con requisitos de memoria reducidos.
- Procesamiento de documentos largos mediante ventana deslizante (contexto nativo de 256 tokens).
- Integración sencilla en aplicaciones web y extensiones que necesiten preprocesar texto antes de enviarlo a un servidor.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Anonimización en formularios web: interceptar el texto introducido por el usuario en el navegador, detectar PII y enmascararla antes de enviarla al backend, reduciendo la exposición de datos sensibles en tránsito.
- Preprocesado de logs y telemetría: ejecutar el modelo en un servicio Node.js que limpie nombres, correos y teléfonos de los registros antes de almacenarlos o enviarlos a un sistema de observabilidad.
- Cumplimiento del RGPD en pipelines de datos: capa de redacción previa a la ingesta en almacenes analíticos, marcando los tokens detectados para su revisión o sustitución automática.
- Redacción de documentos para revisión humana: procesar contratos, informes o correos por ventanas de 256 tokens y generar una versión con las entidades sustituidas por etiquetas.
- Asistentes y chatbots con procesamiento local: limpiar el historial de conversación antes de enviarlo a un LLM externo, reduciendo la fuga de datos personales.
- Extensiones de navegador para privacidad: detectar PII en el texto de una página o en un campo de entrada y avisar al usuario o aplicar la redacción en el propio cliente.
- Enmascaramiento previo a tareas de etiquetado o análisis: preparar corpus para investigación o evaluación sin exponer datos personales reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: al tratarse de un modelo de 141 millones de parámetros cuantizado a 8 bits, el peso del archivo ONNX ronda unas decenas de MB; la inferencia puede ejecutarse en CPU con pocos cientos de MB de RAM, aunque no se especifica la cifra exacta en la información disponible.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier tarjeta moderna (RTX 3060 o superior, A100, H100) acelera la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU y en navegador.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime; no se documenta soporte para vLLM, TGI o llama.cpp (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y del tamaño del texto a procesar por ventanas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaiserrrrrr/pii-deberta-v3-small-onnx | 141 M (base) | 256 tokens | NER de PII | `other` | Hugging Face, ONNX + Transformers.js |
| microsoft/deberta-v3-small | 141 M | 512 tokens (modelo base) | Modelo base, sin ajuste a PII | MIT | Hugging Face |
| Modelos NER genéricos tipo `dslim/bert-base-NER` | ~110 M | 512 tokens | NER general (PER, ORG, LOC, MISC) | MIT/Apache-2.0 según variante | Hugging Face |

La comparación con alternativas específicas de PII no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es el ajuste fino a PII y el empaquetado ONNX cuantizado; frente a NER genéricos, la ventaja es la orientación específica a entidades personales, aunque no se han publicado métricas que permitan cuantificar esa mejora.

## Limitaciones y advertencias

- Solo soporta inglés: el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Ventana de contexto de 256 tokens: requiere ventana deslizante para documentos largos, con el riesgo de perder entidades en los límites entre ventanas si no se solapan adecuadamente.
- Licencia `other`: no se especifican los términos exactos, por lo que es imprescindible revisar las condiciones antes de un uso comercial.
- Riesgo de falsos positivos y falsos negativos inherente a un modelo NER afinado: no se han publicado métricas de precisión, recall o F1 que permitan evaluar su fiabilidad.
- Riesgo de alucinación de entidades: como clasificador de tokens puede etiquetar como PII fragmentos que no lo son, especialmente en textos con jerga, dominios especializados o formatos atípicos.
- Sesgos del dataset `ai4privacy/pii-masking-400k`: la distribución de nombres, formatos y contextos puede no representar todos los dominios ni todas las variantes culturales.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria.
- La cuantización `q8` puede degradar ligeramente la precisión respecto al modelo en precisión completa; no se documenta la magnitud de esa degradación.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes: es exclusivamente un clasificador de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaiserrrrrr/pii-deberta-v3-small-onnx
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-400k
- Transformers.js: https://github.com/huggingface/transformers.js
