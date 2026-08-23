# justinchuby/qwen2.5-0.5b-instruct-onnx-genai

## Resumen

El paquete `justinchuby/qwen2.5-0.5b-instruct-onnx-genai` es una conversión a ONNX con cuantización INT4 del modelo Qwen2.5-0.5B-Instruct, diseñado para ejecutarse directamente con la API `nxrt` de ONNX GenAI. El autor, justinchuby, ha empaquetado el modelo en un formato que utiliza el metadata canónico `inference_metadata.yaml`, donde el bucle autorregresivo se describe como un workflow de datos y no como código específico del runtime. Esto permite que el paquete se ejecute en un runtime genérico sin pasos de reducción especializados.

El modelo base es un transformer de 0.5B parámetros con una ventana de contexto de 32.768 tokens, entrenado para seguir instrucciones. La versión ONNX INT4 reduce el tamaño del modelo a aproximadamente 0.9 GB (el repo), facilitando el despliegue en entornos con recursos limitados, como CPU o dispositivos edge. Es relevante porque demuestra el enfoque de ONNX GenAI para serializar pipelines completos en metadata, lo que simplifica la integración en aplicaciones de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0.5B (aproximadamente 500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (preservado en el metadata) |
| Tipos de cuantizacion | INT4 |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica en el repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT4) |

## Arquitectura y entrenamiento

El paquete es una cuantización INT4 del modelo Qwen2.5-0.5B-Instruct, que es un transformer decoder-only con 0.5B parámetros. El entrenamiento original del modelo base incluye instrucción y ajuste fino, pero el repo no proporciona detalles sobre el proceso de entrenamiento del paquete ONNX. La innovación técnica principal reside en la representación del pipeline completo como metadata serializado: el decodificador y los diez grafos de política bajo `policies/` se declaran como componentes de un workflow, y los 24 pares de key/value cache se gestionan mediante `serving.state_service`. El muestreo, la terminación y el control de longitud son grafos ONNX que el runtime ejecuta como cualquier otro componente, eliminando la necesidad de un paso de reducción específico del decodificador. El paquete conserva el límite de contexto de 32.768 tokens, aunque en el ejemplo se limita a 128 tokens mediante la variable de entorno `ONNX_GENAI_KV_MAX_LEN`.

## Capacidades

- Generación de texto en formato instructivo, siguiendo instrucciones y preguntas.
- Razonamiento básico y generación de respuestas cortas.
- Generación de código y matemáticas (capacidad heredada del modelo base).
- Ejecución en CPU sin GPU, gracias a la cuantización INT4 y al runtime ONNX GenAI.
- El metadata serializado permite una integración directa con el runtime de workflow de ONNX GenAI, facilitando el despliegue en entornos embebidos.
- No se especifica soporte para tool calling, agentes o visión en este paquete.

## Casos de uso

- **Asistentes conversacionales ligeros**: al ser un modelo pequeño (0.5B) y cuantizado, se puede ejecutar en dispositivos edge o en CPU para chat simple con contexto de hasta 32K tokens.
- **Generación de respuestas automáticas en atención al cliente**: el modelo puede responder preguntas frecuentes con formato instructivo, manteniendo coherencia en diálogos de hasta 32K tokens.
- **Clasificación y extracción de información**: gracias a su capacidad de seguir instrucciones, se puede usar para etiquetar texto o extraer entidades, siempre que se le dé el prompt adecuado.
- **Generación de código en entornos sin GPU**: para tareas de autocompletado o generación de pequeños fragmentos de código en CI/CD, el modelo puede ejecutarse en CPU con baja latencia.
- **Prototipado rápido de aplicaciones NLP**: al ser un paquete ONNX listo para `nxrt`, se puede integrar en pipelines Python sin necesidad de dependencias pesadas, facilitando pruebas y prototipos.
- **Sistemas de recomendación basados en texto**: se puede usar para generar descripciones o etiquetas de productos, dado que su contexto largo permite manejar documentos de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- El ejemplo de ejecución se verifica en CPU (sin especificar modelo de procesador) con `nxrt==0.1.0.dev3`.
- Al ser un modelo de 0.5B en INT4, la VRAM requerida es mínima; se puede ejecutar en CPU sin necesidad de GPU.
- En caso de usar GPU, cualquier GPU con al menos 1 GB de VRAM es suficiente, pero no es requerida.
- Opciones de despliegue: la API `nxrt` (ONNX GenAI) es el método principal. No se indica soporte para vLLM, llama.cpp u otros runtimes.
- La latencia y throughput dependen del hardware; no se proporcionan datos numéricos.

## Comparativa con modelos similares

El modelo se compara con el original Qwen2.5-0.5B-Instruct y con otros modelos pequeños de la misma categoría. La siguiente tabla compara parámetros, contexto, licencia y formato.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (original) | 0.5B | 32K | FP16/BF16 | Apache-2.0 | Safetensors |
| justinchuby/qwen2.5-0.5b-instruct-onnx-genai | 0.5B | 32K | INT4 | Apache-2.0 | ONNX |
| TinyLlama-1.1B (referencia) | 1.1B | 2K | FP16 | Apache-2.0 | Safetensors |

No se dispone de benchmarks comparativos, pero el paquete ONNX ofrece la ventaja de un formato optimizado para el runtime ONNX GenAI, con menor uso de memoria que el modelo original.

## Limitaciones y advertencias

- Modelo pequeño (0.5B) con capacidad limitada para tareas complejas de razonamiento o generación de código avanzado.
- La cuantización INT4 puede degradar la precisión en comparación con el modelo en FP16, especialmente en tareas de matemáticas o razonamiento.
- No se proporciona información sobre sesgos o alucinaciones específicas; como cualquier modelo instructivo, puede generar respuestas incorrectas o inventadas.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución y la licencia del modelo base (Qwen2.5).
- El paquete requiere el runtime `nxrt` (en desarrollo, versión 0.1.0.dev3), lo que puede implicar inestabilidad en versiones futuras.
- No se especifica soporte para GPU o aceleración con CUDA en el ejemplo; el uso principal es CPU.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/justinchuby/qwen2.5-0.5b-instruct-onnx-genai
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Página en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Ficha en LLM Explorer: https://llm-explorer.com/model/onnx-community%2FQwen2.5-0.5B-Instruct,7y6iwm4Z4gBi8E64vUb3Zc
- Documentación en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
