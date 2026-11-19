# llaboon/dtguard-bert-3class-jsl-v3-20261119

## Resumen

DT-Guard v3 (JSL) es un clasificador BERT de moderación de contenido en chino que implementa una clasificación ternaria de seguridad: Safe, Unsafe y Borderline. Lo desarrolla el autor llaboon como parte del ecosistema JoySafety DT-Guard, y su propósito es validar una cadena de destilación en la que un modelo generativo grande de auditoría de seguridad (`jdopensource/JSL-joysafety-v2`, basado en gpt-oss-20b) actúa como profesor etiquetando datos, y un BERT pequeño aprende esas etiquetas mediante una cabeza de clasificación de tres clases. El estudiante es `hfl/chinese-macbert-base`, con 102.269.955 parámetros, y el resultado es un modelo de 0,4 GB que puede ejecutarse en CPU o en GPU de gama baja.

El modelo es relevante porque aborda una limitación típica de los clasificadores de seguridad binarios: la incapacidad de distinguir contenido claramente nocivo de contenido limítrofe o ambiguo que requiere revisión humana. Frente a la versión v2 del mismo proyecto (destilación JEV, orientada a clasificación binaria de alta precisión), esta v3 sacrifica precisión en la detección binaria (F1 de 0,784 calibrado frente a 0,9127 de v2) a cambio de una mejora muy sustancial en la clase Borderline (F1 de 0,7188 calibrado frente a 0,112 de v2 en el conjunto de prueba JSL).

El modelo está pensado como componente de enrutamiento en pipelines de moderación: una primera pasada rápida que separa lo claramente seguro de lo claramente inseguro y deriva lo dudoso a un revisor humano o a un guard generativo más costoso. No sustituye a v2 ni a un sistema completo de moderación, y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: hfl/chinese-macbert-base) con cabeza de clasificación de 3 clases |
| Parametros totales | 102.269.955 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento; el tokenizador admite hasta 512 por la configuración del BERT base) |
| Tipos de cuantizacion | No especificado en la model card; al ser un BERT de 102M es viable en fp32, fp16 y cuantizaciones de 8 y 4 bits con herramientas estándar (no verificado por el autor) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo BERT (MacBERT chino) con una cabeza lineal de clasificación sobre el token [CLS] que proyecta a tres logits en el orden Safe / Unsafe / Borderline (según `label_map.json`). No hay mecanismos de atención lineal, decodificación especulativa ni componentes generativos: es un clasificador discriminativo puro, con un coste de inferencia muy bajo.

El entrenamiento sigue un esquema de destilación desde un profesor generativo. El profesor `jdopensource/JSL-joysafety-v2` (gpt-oss-20b) etiquetó 32.424 entradas (25.726 de train y 6.431 de dev del corpus COLD, más 267 semillas manuales de seguridad LLM), con una tasa de éxito del 96,94%. Las etiquetas del profesor (`risk_level` y `suggestion`) se mapearon a tres clases: sin riesgo/pass → Safe; riesgo bajo, medio, review, mask o proxy_answer → Borderline; riesgo alto/block → Unsafe. El estudiante se entrenó durante 3 epochs, batch 32, max_len 128, learning rate 2e-5, con pesos de clase inversos y sobremuestreo de Borderline ×3. El conjunto de entrenamiento final (modo strict) quedó en 2.578 Safe, 2.011 Unsafe y 266 Borderline (5.387 tras sobremuestreo), con un tiempo de entrenamiento de 22,6 segundos en una GPU H20 de 96 GB.

La innovación principal es metodológica, no arquitectónica: demuestra que un BERT pequeño puede aprender la noción de «borderline» de un guard generativo, siempre que se recalibre la salida. La calibración publicada (`calibration.json`, binary_margin=0,84) reasigna a Borderline cualquier predicción cuyo máximo entre p(Safe) y p(Unsafe) sea inferior a 0,84, y es la que produce las métricas reportadas como «calibradas».

## Capacidades

- Clasificación de texto en tres clases de seguridad: Safe, Unsafe y Borderline.
- Detección de contenido ofensivo, abusivo y potencialmente nocivo en chino, entrenado sobre el corpus COLD.
- Distinción de contenido limítrofe (riesgo bajo o medio) frente a contenido claramente bloqueable, capacidad que los clasificadores binarios habituales no ofrecen.
- Salida de probabilidades por clase vía softmax, apta para umbralización y enrutamiento.
- Funciona como extractor de embeddings de texto al eliminar la cabeza de clasificación (compatible con text-embeddings-inference según los tags del repositorio).
- No dispone de tool calling, function calling, capacidades de agente, multi-step reasoning, visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al chino; no se declaran capacidades en otros idiomas.

## Casos de uso

- Enrutamiento en pipelines de moderación: el modelo clasifica cada mensaje en Safe, Unsafe o Borderline y deriva los casos dudosos a un revisor humano o a un guard generativo más caro, reduciendo el coste computacional del sistema completo gracias a sus 102M de parámetros y a una latencia de milisegundos por petición.
- Pre-filtrado de comentarios en foros y redes sociales: con una ventana de 128 tokens procesa comentarios y publicaciones cortas, marcando como Borderline el contenido ambiguo para revisión y como Unsafe el claramente bloqueable.
- Moderación de entradas en sistemas de chat en chino: integrado como primera capa antes de un LLM generativo, filtra prompts de riesgo alto y evita enviarlos al modelo principal, con la ventaja de ser un modelo discriminativo barato.
- Auditoría de datasets: clasifica grandes volúmenes de texto chino para detectar contenido ofensivo antes de usarlo en entrenamiento, aprovechando que es un BERT que se ejecuta por lotes en CPU o GPU de gama baja.
- Análisis de prevalencia de contenido limítrofe: al separar explícitamente la clase Borderline, permite medir qué proporción de las interacciones de una plataforma cae en zona gris y dimensionar los equipos de revisión.
- Señal auxiliar en sistemas de confianza y seguridad: las probabilidades por clase pueden combinarse con otras señales (reglas, reputación de usuario) como feature en un clasificador de riesgo de segundo nivel.
- Despliegue en entornos con recursos limitados: al ocupar 0,4 GB en safetensors y 102M de parámetros, cabe en instancias CPU pequeñas y en GPUs consumer, lo que permite moderación en el borde o en dispositivos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Conjunto de evaluación: COLD dev auditado por JSL-joysafety-v2 (n=6.234).

| Configuracion | Tarea | Accuracy | Macro-F1 |
|---|---|---|---|
| Argmax directo | 3 clases (JSL) | 0,5515 | 0,5114 |
| Calibrado (binary_margin=0,84) | 3 clases (JSL) | 0,6734 | 0,602 |
| Argmax directo | 2 clases COLD original | 0,8056 | 0,8118 |
| Calibrado | 2 clases COLD original | 0,7377 | 0,784 |

Desglose por clase con calibración (n=6.234):

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Safe | 0,7816 | 0,5880 | 0,6712 | 2.374 |
| Unsafe | 0,3651 | 0,4837 | 0,4161 | 523 |
| Borderline | 0,6788 | 0,7639 | 0,7188 | 3.337 |

Comparación con v2 (JEV, clasificación binaria):

| Metrica | v2 | v3 strict (JSL) |
|---|---|---|
| COLD dev binario F1 | 0,9127 (argmax) | 0,8118 (argmax) / 0,784 (calibrado) |
| JSL test 3 clases macro-F1 | 0,3558 (argmax) | 0,5114 (argmax) / 0,602 (calibrado) |
| JSL test Borderline F1 | 0,112 (argmax) | 0,4554 (argmax) / 0,7188 (calibrado) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (tamaño del repo), unos 0,2 GB en fp16 y menos de 0,15 GB en cuantización de 8 bits. Cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: innecesarias para uso individual; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sirve. Para alto throughput en servidor, A100, H100 o L4 son válidas pero sobredimensionadas; una T4 es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas y en CPU.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (según los tags del repo), ONNX Runtime, TorchScript, y servidores de inferencia genéricos compatibles con modelos de clasificación. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama (estas herramientas están orientadas a modelos generativos).
- Latencia y throughput: no se publican cifras. Dado el tamaño (102M de parámetros, max_len 128), se espera latencia de milisegundos por petición en GPU y de decenas de milisegundos en CPU, con throughput alto en procesamiento por lotes, pero estos valores no están verificados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llaboon/dtguard-bert-3class-jsl-v3-20261119 | 102,3M | 128 | Clasificación de seguridad 3 clases (zh) | Apache-2.0 | Hugging Face |
| llaboon v2 (JEV, mismo proyecto) | ~102M (base MacBERT) | 128 | Clasificación de seguridad 2 clases (zh) | Apache-2.0 | Hugging Face |
| hfl/chinese-macbert-base (base) | 102,3M | 512 | Modelo de lenguaje enmascarado (zh) | Apache-2.0 | Hugging Face |
| jdopensource/JSL-joysafety-v2 (profesor) | ~20B (gpt-oss-20b) | No disponible | Guard generativo de seguridad (zh) | Apache-2.0 | Hugging Face |

La comparación directa con v2 es la más informativa: v2 obtiene mejor F1 binario (0,9127 frente a 0,784 calibrado) mientras v3 obtiene mejor F1 en Borderline (0,7188 frente a 0,112) y mejor macro-F1 ternario (0,602 frente a 0,3558). No se dispone de datos de benchmarks frente a otros clasificadores de moderación en chino ajenos al proyecto.

## Limitaciones y advertencias

- El profesor etiquetó el 54,03% del train de COLD como Borderline, muy por encima del 5% que usa el paper original de DT-Guard; el modelo está entrenado con una prevalencia de Borderline artificialmente alta.
- El conjunto de prueba tiene un 53,5% de Borderline; aplicado a un dominio real con prevalencia del 5%, el modelo sobrepredecirá Borderline. Es imprescindible recalibrar con un conjunto de validación representativo del negocio antes de producción.
- La regla de calibración (binary_margin=0,84) se seleccionó sobre etiquetas JSL de validación, no sobre datos reales de negocio.
- El corpus COLD es lenguaje ofensivo de redes sociales, no diálogo con LLM; puede haber desajuste de distribución respecto a conversaciones de usuario con un asistente.
- La clase Unsafe tiene precisión baja (0,3651 calibrada), lo que implica falsos positivos frecuentes al marcar contenido como claramente bloqueable.
- Solo cubre chino; no se declaran capacidades multilingües.
- La cabeza de clasificación solo predice seguridad; intent y categoría de daño son metadatos mapeados, no salidas del modelo. Un sistema completo de moderación requiere un guard generativo o cabezas multitarea adicionales.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificación errónea sistemática en textos fuera de distribución.
- Sesgos: los derivados del corpus COLD y de las decisiones del profesor generativo, no auditados de forma independiente.
- Licencia Apache-2.0: permite uso comercial, pero el profesor JSL-joysafety-v2 y COLD tienen sus propias condiciones (ambos Apache-2.0 según la model card); el profesor no se distribuye con este modelo.
- El modelo no debe usarse como sustituto de v2 en escenarios de clasificación binaria de alta precisión; el propio autor lo desaconseja explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llaboon/dtguard-bert-3class-jsl-v3-20261119
- Modelo base: https://huggingface.co/hfl/chinese-macbert-base
- Profesor JSL-joysafety-v2: https://huggingface.co/jdopensource/JSL-joysafety-v2
- Corpus COLD (THU-COAI COLDataset): https://huggingface.co/datasets/THU-CoAI/COLDataset
- Repositorio de entrenamiento citado en la model card: `dtguard_training/` (JoySafety) — no se proporciona URL directa en la información disponible.
- Referencia del corpus COLD: Deng et al., 2022 (citado en la model card; no se proporciona URL directa).
