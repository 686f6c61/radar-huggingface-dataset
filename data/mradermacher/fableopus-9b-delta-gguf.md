# mradermacher/FableOpus-9B-Delta-GGUF

## Resumen

FableOpus-9B-Delta-GGUF es la versión cuantizada en formato GGUF del modelo bingleai/FableOpus-9B-Delta, preparada por mradermacher para su uso con herramientas de inferencia local como llama.cpp, Ollama o LM Studio. El modelo base es un merge delta anclado en Qwen3.5-9B que combina el comportamiento de tool-use de la familia Fable-5 con un sesgo hacia las respuestas estilo Claude Opus, según la descripción de FriendliAI. Está pensado para tareas conversacionales y de llamada a funciones, y los archivos mmproj incluidos sugieren capacidades multimodales adicionales.

Con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), el modelo se distribuye bajo licencia Apache-2.0 y está entrenado únicamente en inglés. La versión GGUF ofrece múltiples niveles de cuantización, desde f16 (18 GB) hasta Q2_K (3,9 GB), lo que permite adaptar el consumo de memoria a distintos tipos de hardware. La relevancia de esta ficha radica en que facilita la evaluación rápida de un modelo de tamaño medio con capacidades de agentes y posible visión, sin necesidad de acceder a los pesos originales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B, probablemente transformer) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles oficiales sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Según los metadatos y la descripción de FriendliAI, se trata de un "Opus-forward delta merge" anclado en Qwen3.5-9B, que conserva el comportamiento de tool-use de Fable-5 mientras sesga las respuestas hacia el estilo de Claude Opus. Esto sugiere una técnica de fusión de pesos (merge) más que un entrenamiento desde cero, probablemente combinando capas o interpolando parámetros de varios modelos base.

La presencia de archivos mmproj (multi-modal projection) en la versión GGUF indica que el modelo incorpora un proyector multimodal, probablemente para procesar imágenes, aunque no se especifica el tipo de encoder visual utilizado. Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo está orientado a diálogo y respuestas de estilo asistente, con un sesgo hacia el tono de Claude Opus.
- Tool calling / function calling: heredado de la familia Fable-5, permite invocar funciones externas en flujos de agente.
- Posible soporte multimodal: los archivos mmproj incluidos sugieren que el modelo puede procesar entradas de imagen, aunque no hay documentación que lo confirme.
- Razonamiento multi-step: al estar basado en Qwen3.5, es probable que soporte cadenas de razonamiento, pero no hay benchmarks que lo verifiquen.
- Idioma: exclusivamente inglés, sin soporte multilingüe declarado.

## Casos de uso

- Asistentes conversacionales locales: al ser un GGUF de 9B, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 con 12 GB) usando Ollama o llama.cpp para ofrecer un chatbot privado sin conexión.
- Automatizacion de tareas con tool calling: el modelo puede integrarse en pipelines que requieran llamar a APIs o ejecutar acciones (por ejemplo, consultar bases de datos, enviar correos) mediante function calling, gracias a su herencia Fable.
- Prototipado rapido de agentes: su tamaño moderado y licencia permisiva permiten experimentar con arquitecturas de agente (ReAct, plan-ejecución) en entornos de desarrollo sin coste de API.
- Analisis de imagenes en entornos sin GPU potente: si se confirma el soporte multimodal, podría usarse para extraer texto de capturas o describir imágenes con cuantizaciones ligeras (Q4_K_M) en hardware modesto.
- Educacion e investigacion: sirve como ejemplo de merge delta y cuantización GGUF, útil para estudiar técnicas de fusión de modelos y su impacto en la calidad de salida.
- Despliegue en edge devices: las cuantizaciones Q3_K_M o Q2_K (4,7 y 3,9 GB respectivamente) permiten ejecutar el modelo en dispositivos con poca memoria, como mini-PCs o portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre 4 GB (Q2_K) y 18 GB (f16). La opción recomendada Q4_K_M ocupa 5,7 GB, por lo que cabe en GPUs de 8 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060/4060 de 8-12 GB es suficiente. Para Q8_0 (9,6 GB) se necesita una GPU con 12-16 GB, como RTX 4070 Ti o A10. Para f16, se requieren 24 GB o más (RTX 3090/4090, A100).
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4 y Q5 funcionan en GPUs de gama media. Las versiones Q2 y Q3 pueden ejecutarse incluso en CPUs con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. También es posible usar vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 9B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una RTX 3060, pero estos valores no están confirmados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A continuación se muestra una comparación estructural con otros modelos de tamaño similar, basada únicamente en información pública:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| FableOpus-9B-Delta (GGUF) | 8,95B | no disponible | Apache-2.0 | GGUF |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache-2.0 | safetensors/GGUF |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community | safetensors/GGUF |
| Mistral-7B-Instruct-v0.3 | 7,3B | 32K | Apache-2.0 | safetensors/GGUF |

La comparativa es limitada porque no se conocen la longitud de contexto ni los resultados de benchmarks de FableOpus-9B-Delta. Los modelos alternativos tienen documentación más completa y están más probados en producción.

## Limitaciones y advertencias

- Idioma limitado: solo inglés, no apto para aplicaciones multilingües.
- Longitud de contexto desconocida: no se ha publicado este dato, lo que dificulta planificar tareas que requieran ventanas largas.
- Riesgo de alucinacion: al ser un modelo de 9B sin benchmarks publicados, no hay garantías sobre su fiabilidad factual. Se recomienda validar las salidas en entornos críticos.
- Sesgos no documentados: no hay información sobre evaluaciones de sesgo o toxicidad.
- Soporte multimodal no confirmado: aunque existen archivos mmproj, no hay documentación que acredite su funcionamiento ni el tipo de imágenes soportadas.
- Cuantizaciones de baja precision: las versiones Q2_K y Q3_K_M pueden degradar notablemente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para tareas serias.
- Modelo experimental: al ser un merge delta reciente (creado en junio de 2026), no tiene historial de uso en producción ni comunidad amplia que reporte incidencias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/FableOpus-9B-Delta-GGUF
- Modelo base (safetensors): https://huggingface.co/bingleai/FableOpus-9B-Delta
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/interpolators/FableOpus-9B-Delta
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
