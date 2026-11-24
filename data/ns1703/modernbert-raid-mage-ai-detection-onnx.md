# ns1703/modernbert-raid-mage-ai-detection-onnx

## Resumen

`ns1703/modernbert-raid-mage-ai-detection-onnx` es una version exportada a ONNX y cuantizada a int8 del modelo `GeorgeDrayson/modernbert-ai-detection-raid-mage`, un clasificador binario de texto disenado para distinguir contenido escrito por humanos del generado por maquinas. El autor de esta version, ns1703, no modifica los pesos del modelo original: se limita a exportarlos a formato ONNX y a cuantizarlos para que puedan ejecutarse directamente en el navegador mediante `onnxruntime-web` y la libreria `transformers.js`.

El modelo hereda la arquitectura ModernBERT del modelo base, un transformer encoder de la familia BERT con mejoras de eficiencia (attention con RoPE, FlashAttention, contexto extendido). La salida es un tensor `logits` de forma `[batch, 2]`, donde el indice 0 corresponde a texto humano y el indice 1 a texto generado por IA, aplicando softmax sobre ambas clases.

Su relevancia practica radica en el despliegue: al estar cuantizado a 8 bits y exportado a ONNX, el repositorio ocupa solo 0,3 GB y permite ejecutar deteccion de texto IA en el cliente (navegador) sin infraestructura de servidor. Se utiliza en el Space publico "Meta-KI-Detektor" del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (heredada del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (entradas `input_ids` y `attention_mask`, ambas int64) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `GeorgeDrayson/modernbert-ai-detection-raid-mage`, un encoder ModernBERT adaptado a clasificacion binaria de texto (deteccion de contenido generado por IA). ModernBERT es una revision del transformer encoder clasico que incorpora rotary positional embeddings (RoPE), attention con FlashAttention, alternancia de capas globales y locales, y un contexto ampliado respecto a BERT original. No se dispone en la informacion proporcionada de detalles sobre el numero de parametros, el volumen de tokens de entrenamiento ni la composicion del dataset.

El proceso aplicado en este repositorio es exclusivamente de conversion y cuantizacion: exportacion de los pesos originales a ONNX y cuantizacion a 8 bits para reducir el tamano y permitir inferencia en `onnxruntime-web`. El autor advierte que la cuantizacion introduce desviaciones ligeras en los valores de salida respecto al modelo original. No hay evidencia de entrenamiento adicional, fine-tuning ni RLHF/DPO en esta version.

## Capacidades

- Clasificacion binaria de texto: distingue entre texto escrito por humanos (indice 0) y texto generado por IA (indice 1), con softmax sobre los logits.
- Deteccion de contenido sintetico en entornos web: pensado para ejecutarse en el navegador via `transformers.js` y `onnxruntime-web`.
- Procesamiento por lotes (`batch`) segun la forma del tensor de salida `[batch, 2]`.
- Entrada basada en tokenizacion estandar de BERT (`input_ids` y `attention_mask` en int64).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente discriminativo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Deteccion de texto IA en el navegador: integracion en formularios web o extensiones que clasifiquen envios de texto en el cliente, sin enviar datos a un servidor, aprovechando el formato ONNX int8 y `onnxruntime-web`.
- Moderacion de contenido en plataformas colaborativas: filtrado preliminar de comentarios o articulos sospechosos de ser generados automaticamente antes de una revision humana.
- Verificacion en entornos educativos: comprobacion de ensayos o respuestas enviadas por alumnos, ejecutada localmente en el dispositivo del docente para preservar la privacidad.
- Herramientas de periodismo y fact-checking: marcado de borradores o textos recibidos de fuentes externas para priorizar la verificacion manual.
- Deteccion en pipelines de datos: clasificacion por lotes de grandes volumenes de texto recopilado (foros, redes sociales) para separar muestras humanas de sinteticas antes de usarlas en entrenamiento o analisis.
- Demos y prototipos de bajo coste: despliegue en Spaces o paginas estaticas sin GPU ni backend, gracias al tamano reducido del repositorio (0,3 GB) y a la inferencia en CPU via ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario principal; la inferencia esta pensada para CPU en el navegador con `onnxruntime-web`. Para ejecucion en GPU via ONNX Runtime, el modelo cuantizado a int8 ocupa del orden de cientos de MB, aunque no se especifica el tamano exacto de parametros.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna puede ejecutar un modelo encoder de este tamano sin problemas; no se han documentado requisitos especificos.
- Compatibilidad con GPU consumer: si, dado el tamano reducido del archivo cuantizado (repositorio total de 0,3 GB).
- Opciones de despliegue: `onnxruntime-web` y `transformers.js` (navegador); ONNX Runtime en servidor (CPU o GPU); conversiones adicionales a otros runtimes no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ns1703/modernbert-raid-mage-ai-detection-onnx | no disponible | no disponible | ONNX int8 | Apache 2.0 | Deteccion de texto IA, inferencia en navegador |
| GeorgeDrayson/modernbert-ai-detection-raid-mage | no disponible | no disponible | safetensors (presumiblemente) | no disponible en esta ficha | Deteccion de texto IA, modelo original |
| Clasificadores BERT-base de deteccion de IA | ~110 M (tipico de BERT-base) | 512 (tipico de BERT-base) | safetensors, ONNX | variable | Deteccion de texto IA en servidor |

La comparativa con alternativas de la misma categoria queda limitada por la ausencia de datos publicados de parametros y contexto en la informacion disponible. El principal diferenciador frente al modelo base es el formato ONNX int8, orientado a despliegue en cliente.

## Limitaciones y advertencias

- La cuantizacion a int8 altera ligeramente los logits respecto al modelo original; el autor lo advierte explicitamente.
- Es un clasificador binario: no genera texto ni ofrece explicaciones sobre la decision, solo probabilidades por clase.
- Riesgo de falsos positivos y negativos inherente a la deteccion de texto IA; no se han publicado metricas de precision, recall ni calibracion.
- No se especifican los idiomas de entrenamiento; el uso en castellano u otros idiomas distintos del ingles no esta garantizado.
- No se dispone de informacion sobre sesgos del modelo base ni sobre la composicion de su dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero los creditos corresponden a los autores del modelo original (`GeorgeDrayson`).
- Para produccion, conviene validar el modelo contra el original en el dominio concreto de aplicacion antes de sustituirlo, dado el efecto de la cuantizacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ns1703/modernbert-raid-mage-ai-detection-onnx
- Modelo base: https://huggingface.co/GeorgeDrayson/modernbert-ai-detection-raid-mage
- Space de demostracion: https://huggingface.co/spaces/ns1703/ki-detektor
