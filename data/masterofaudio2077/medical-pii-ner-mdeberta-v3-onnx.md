# masterofaudio2077/medical-pii-ner-mdeberta-v3-onnx

## Resumen

`medical-pii-ner-mdeberta-v3-onnx` es la exportación a ONNX (fp32, opset 17) del modelo `masterofaudio2077/medical-pii-ner-mdeberta-v3`, un clasificador de tokens multilingüe especializado en detección de información personal identificable (PII) y datos clínicos en textos médicos. El modelo base se obtuvo por fine-tuning de `microsoft/mdeberta-v3-base`, una arquitectura DeBERTa-v2 de tipo transformer encoder, y cubre cinco idiomas: neerlandés, francés, alemán, español e inglés.

El problema que resuelve es la desidentificación de documentos clínicos: identificar nombres, identificadores, datos de contacto y otra información sensible para poder enmascararla antes de compartir historiales, auditar sistemas o construir datasets de investigación. Se trata de un modelo de token-classification con 73 etiquetas BIO (36 categorías semánticas), diseñado para ejecutarse en CPU mediante ONNX Runtime, lo que lo hace adecuado para despliegues sin GPU en entornos sanitarios con requisitos de privacidad.

La relevancia actual radica en su naturaleza multilingüe y su distribución como artefacto ONNX listo para producción, con verificación de fidelidad numérica frente al modelo PyTorch original (diferencia máxima de logits de 1,7e-4 y argmax idéntico en 1.034 tokens evaluados). Forma parte del sistema open source PII Masking System, donde opera como el componente `mdeberta`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2 / mDeBERTa-v3-base) exportado a ONNX |
| Parametros totales | no disponible (modelo base mdeberta-v3-base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.536 tokens en las pruebas de fidelidad; máximo nativo de mDeBERTa-v3-base (no confirmado en la model card) |
| Tipos de cuantizacion | exportación fp32 (el modelo fuente estaba en fp16 safetensors, convertido exactamente a fp32); no se documentan otras variantes |
| Idiomas soportados | neerlandés (nl), francés (fr), alemán (de), español (es), inglés (en) |
| Licencia | Apache-2.0 (modelo base `microsoft/mdeberta-v3-base` bajo MIT) |
| Formato de pesos | ONNX (opset 17), `model.onnx`; tokenizer y configuración en JSON |
| Etiquetas de salida | 73 etiquetas BIO sobre 36 categorías semánticas |
| Entradas del grafo | `input_ids`, `attention_mask` (batch y secuencia dinámicos) |
| Salida del grafo | `logits` |
| Tamaño del repositorio | 1,1 GB |
| Runtime | ONNX Runtime (CPUExecutionProvider documentado) |
| SHA-256 de `model.onnx` | `b561e1fd1ac8a46e139c94744ec49dfda3b46aee63a8cfe2bf4ec1d5a975b120` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia DeBERTa-v2, concretamente un fine-tuning de `microsoft/mdeberta-v3-base` para token classification. La exportación a ONNX conserva la topología del modelo fuente sin cambios: el grafo acepta `input_ids` y `attention_mask` con ejes de batch y secuencia dinámicos, y devuelve logits sobre 73 etiquetas BIO. El proceso de exportación se realizó a partir de la revisión `e93f0cceae9287062456c7058a1bb5d204550998` del repositorio fuente (pesos en fp16 safetensors), con conversión exacta a fp32.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo encoder de clasificación). Sí se indica explícitamente que el modelo fuente se entrenó **únicamente con datos sintéticos**, lo que constituye el caveat más relevante de cara a producción. La innovación técnica destacable de este repositorio es la fidelidad de la exportación: diferencia máxima de logits de 1,7e-4 frente al modelo PyTorch y argmax idéntico en los 1.034 tokens de prueba (batches de 1 y 5, secuencias de hasta 1.536 tokens), además de un `manifest.json` con hashes SHA-256 para verificación de integridad.

## Capacidades

- Clasificación de tokens (NER) para detección de PII en textos médicos y clínicos.
- Detección de información clínica sensible más allá de PII convencional, con 36 categorías semánticas y 73 etiquetas BIO.
- Multilingüe: neerlandés, francés, alemán, español e inglés en un único modelo.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Batch y longitud de secuencia dinámicos en el grafo exportado.
- Integración con pipelines de token-classification de Hugging Face (pipeline_tag: `token-classification`).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni modalidades de visión o audio: es un encoder discriminativo.

## Casos de uso

- Desidentificación de historiales clínicos antes de compartirlos con investigadores: el modelo etiqueta nombres, identificadores y datos de contacto token a token, permitiendo enmascararlos en un paso previo a la exportación del corpus.
- Cumplimiento de RGPD en entornos sanitarios: ejecutado en CPU dentro de la infraestructura del hospital, permite anonimizar documentos sin enviar datos a servicios externos.
- Preprocesado de datasets para entrenamiento de modelos médicos: filtra y enmascara PII en grandes volúmenes de notas clínicas multilingües antes de construir corpus de investigación.
- Auditoría de registros y logs: detección de fugas de información personal en logs de aplicaciones sanitarias o en respuestas de sistemas de atención al cliente.
- Procesamiento multilingüe en sistemas europeos: un único modelo cubre notas en neerlandés, francés, alemán, español e inglés, útil en organizaciones con documentación en varios idiomas.
- Integración en el PII Masking System: actúa como equipo `mdeberta` dentro del pipeline open source, combinable con otros detectores para aumentar la cobertura del enmascarado.
- Despliegue en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU, encaja en servidores modestos o en arquitecturas edge donde no hay aceleradores disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la exportación frente al modelo PyTorch: diferencia máxima de logits de 1,7e-4 y argmax idéntico en 1.034 tokens evaluados (batches de 1 y 5, secuencias de hasta 1.536 tokens). No se ofrecen cifras de precisión, recall o F1 sobre conjuntos de evaluación de PII.

## Requisitos de hardware

- VRAM: no aplica en el caso documentado; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Memoria RAM estimada: el repositorio ocupa 1,1 GB en fp32, por lo que se recomienda al menos 2-3 GB de RAM libre para cargar el grafo y procesar batches pequeños.
- GPU: no se documentan requisitos ni GPU recomendadas; al ser un encoder de tamaño base, cabría en cualquier GPU consumer (por ejemplo, RTX 3060 o superiores) si se ejecutara con el proveedor CUDA de ONNX Runtime, aunque el autor no lo valida.
- Cabe en CPU consumer sin problema; también en GPU consumer si se opta por ese proveedor de ejecución.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider documentado); el modelo fuente puede servirse con frameworks de token-classification de Hugging Face, aunque esta exportación está pensada para ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| medical-pii-ner-mdeberta-v3-onnx (este) | DeBERTa-v2 ONNX | no disponible | hasta 1.536 tokens probados | nl, fr, de, es, en | Apache-2.0 | ONNX fp32 |
| medical-pii-ner-mdeberta-v3 (fuente) | DeBERTa-v2 | no disponible | no disponible | nl, fr, de, es, en | Apache-2.0 | safetensors fp16 |
| microsoft/mdeberta-v3-base | DeBERTa-v2 | no disponible en la información | no disponible | multilingüe | MIT | safetensors |
| Modelos NER médicos especializados en PII | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparativo con otros detectores de PII, por lo que la comparativa se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- El modelo fuente se entrenó exclusivamente con datos sintéticos; se esperan puntuaciones más bajas en notas clínicas reales y se recomienda revisión humana antes de publicar documentos.
- Ningún enmascarador automático garantiza la eliminación total de datos personales; el propio autor lo advierte explícitamente.
- Riesgo de alucinación de etiquetas: como clasificador, puede generar falsos positivos y falsos negativos en entidades poco representadas en el entrenamiento sintético.
- Cobertura lingüística limitada a cinco idiomas (nl, fr, de, es, en); otros idiomas no están soportados.
- No se documentan sesgos específicos ni evaluación de equidad; al entrenarse con datos sintéticos, los sesgos del generador podrían trasladarse al modelo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base `microsoft/mdeberta-v3-base` es MIT; conviene conservar las atribuciones correspondientes.
- El repositorio no incluye benchmarks de calidad (F1, precisión, recall), lo que dificulta estimar su idoneidad en producción sin una evaluación propia.
- El modelo es solo un encoder de clasificación: no genera texto ni soporta instrucciones, tool calling o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/medical-pii-ner-mdeberta-v3-onnx
- Modelo fuente: https://huggingface.co/masterofaudio2077/medical-pii-ner-mdeberta-v3
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Repositorio del sistema PII Masking System: https://github.com/yassienashrafwasfy/PII-Masking-System
- Script de exportación (referenciado en la model card): `teams/mdeberta/training/export_onnx.py` dentro del repositorio del proyecto
