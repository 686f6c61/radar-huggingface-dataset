# inference4j/phi-4-mini-instruct

## Resumen

Phi-4-mini-instruct — ONNX (INT4) es una exportación cuantizada del modelo Phi-4-mini-instruct de Microsoft, un modelo de lenguaje de 3.800 millones de parámetros diseñado para generación de texto y conversación. Esta versión concreta la publica el usuario `inference4j` como espejo optimizado para inferencia en CPU mediante cuantización INT4 RTN block-32 en formato onnxruntime-genai. El objetivo es ofrecer una alternativa ligera y ejecutable en hardware modesto, sin necesidad de GPU, para aplicaciones Java.

La relevancia de esta ficha radica en que no se trata del modelo original, sino de una conversión de inferencia orientada a un caso de uso muy específico: la librería `inference4j`, una biblioteca de IA en Java centrada exclusivamente en inferencia. Esto lo convierte en una pieza útil para desarrolladores del ecosistema JVM que quieren integrar un modelo conversacional de 128.000 tokens de contexto sin salir de Java ni depender de infraestructura GPU.

Arquitecturalmente mantiene la estructura del Phi-4-mini original (32 capas, 3.072 de dimensión oculta), pero no incluye ningún reentrenamiento ni ajuste adicional: es una conversión de pesos con cuantización de posentrenamiento. El repositorio ocupa 4,9 GB y se distribuye bajo licencia MIT, heredada del modelo base de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini), 32 capas, 3072 de dimension oculta |
| Parametros totales | 3.800 millones (3,8B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | INT4 RTN block-32 acc-level-4 (formato ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (formato onnxruntime-genai) |

## Arquitectura y entrenamiento

El modelo base es Phi-4-mini, un transformer decoder-only de 3.800 millones de parámetros organizado en 32 capas con una dimensión oculta de 3.072. Esta publicación no aporta información sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de Microsoft. Lo que sí documenta esta ficha es que el framework original era PyTorch con la librería `transformers` y que la conversión a ONNX fue realizada por Microsoft.

La innovación técnica de esta versión es exclusivamente la cuantización: se aplica INT4 con redondeo al más cercano (RTN) en bloques de 32 elementos y nivel de acumulación 4. Esta técnica reduce el peso del modelo a aproximadamente una cuarta parte del tamaño en FP16, lo que permite ejecutarlo en CPU con un consumo de memoria contenido. No hay decodificación especulativa, atención lineal ni otras modificaciones arquitectónicas: el grafo computacional se preserva íntegro y solo se altera la representación numérica de los pesos.

## Capacidades

- Generación de texto y conversación multi-turno (la etiqueta de pipeline es `text-generation` y el tag `conversational` está presente).
- Procesamiento de contextos largos de hasta 128.000 tokens, gracias a la ventana de contexto heredada del modelo base.
- Ejecución en CPU mediante onnxruntime-genai, sin requerir GPU.
- Integración directa con aplicaciones Java a través de la librería `inference4j`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en aplicaciones Java empresariales: mediante `inference4j`, el modelo puede gestionar conversaciones multi-turno con hasta 128.000 tokens de contexto sin salir del ecosistema JVM ni desplegar servicios Python adicionales.
- Procesamiento de documentos largos en CPU: gracias a su ventana de contexto, permite resumir o extraer información de contratos, informes o expedientes extensos en servidores sin GPU.
- Microservicios de generación de texto de bajo coste: al ejecutarse cuantizado en INT4, se puede desplegar en instancias de CPU convencionales, reduciendo el coste de infraestructura frente a soluciones basadas en GPU.
- Prototipado y desarrollo local: un único desarrollador puede probar flujos conversacionales en su máquina sin acelerador dedicado, gracias al tamaño reducido del modelo cuantizado.
- Integración como componente en aplicaciones de escritorio Java: el binario ONNX puede empaquetarse junto a la aplicación para ofrecer funciones de texto generativo offline, sin dependencia de APIs externas.
- Preprocesamiento y enriquecimiento de datos en pipelines batch: el modelo puede etiquetar, clasificar o reformular grandes volúmenes de texto en servidores CPU, donde el coste por token es menor que en GPU.
- Chatbots de soporte interno en entornos con recursos limitados: al no requerir GPU, encaja en infraestructuras on-premise modestas o en contenedores con límites estrictos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta exportación no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra. Cabe señalar que los resultados de referencia corresponden al modelo base `microsoft/Phi-4-mini-instruct`, cuyos datos publica Microsoft en su propia model card, pero no se reproducen aquí porque no forman parte de la información proporcionada y no debe asumirse que la versión cuantizada en INT4 los mantiene de forma idéntica.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su caso de uso principal, ya que está optimizado para CPU. El modelo cuantizado en INT4 ocupa aproximadamente 2 a 2,5 GB de memoria, mientras que la versión en FP16 rondaría los 7,6 GB.
- GPU recomendadas: no documentadas para esta exportación. El modelo base puede ejecutarse en GPUs de consumo como RTX 3060, 4060, 4090 o superiores, pero esta conversión concreta está orientada a CPU.
- Cabe en GPU de consumo: el modelo base en FP16 sí cabe en GPUs con 8 GB o más de memoria; esta versión INT4 está pensada para no necesitar GPU en absoluto.
- Opciones de despliegue: onnxruntime-genai (formato nativo de esta exportación) y la librería `inference4j` para Java. Otros runners como vLLM, llama.cpp o TGI no son directamente compatibles sin una conversión adicional a sus formatos respectivos (GGUF, etc.).
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Espacio en disco: el repositorio ocupa 4,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Optimizado para CPU |
|---|---|---|---|---|---|
| inference4j/phi-4-mini-instruct (esta ficha) | 3,8B | 128.000 tokens | ONNX INT4 | MIT | Si |
| microsoft/Phi-4-mini-instruct | 3,8B | 128.000 tokens | safetensors (PyTorch) | MIT | No |
| microsoft/Phi-4-mini-instruct-onnx | 3,8B | 128.000 tokens | ONNX | MIT | Si |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato y licencia. Existen otros modelos pequeños de rango similar (Qwen2.5-3B, Llama-3.2-3B, Gemma-2-2B), pero sus especificaciones no forman parte de la información facilitada y no se incluyen para no introducir datos no verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada. Al ser una conversión de un modelo base, hereda los sesgos de Phi-4-mini-instruct, pero estos no se documentan en la model card de esta exportación.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se aportan métricas específicas de fidelidad factual.
- La cuantización INT4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en FP16. No se documentan evaluaciones que cuantifiquen esta pérdida.
- Limitaciones de idioma: los idiomas soportados no están especificados en la información disponible.
- Licencia: MIT, permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright. La model card indica que tanto el modelo original como la conversión a ONNX son obra de Microsoft, mientras que la publicación de esta exportación corresponde a `inference4j`.
- Compatibilidad: el formato ONNX limita su uso a onnxruntime-genai y `inference4j`; otros runners requerirían reconvertir los pesos.
- Métricas de rendimiento: la ausencia de benchmarks publicados impide validar el comportamiento real en producción sin una evaluación propia.
- Popularidad: el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, lo que indica un uso muy limitado y poca validación por parte de la comunidad.

## Enlaces

- HuggingFace (esta exportación): https://huggingface.co/inference4j/phi-4-mini-instruct
- Modelo base en PyTorch: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Exportación ONNX original de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct-onnx
- Librería inference4j (GitHub): https://github.com/inference4j/inference4j
- Licencia MIT: https://opensource.org/licenses/MIT
