# kyonjova/GLM-5.3-Flash-FP4-Local-FLARE

## Resumen

GLM-5.3-Flash-FP4-Local-FLARE es un paquete de inferencia firmado para el runtime Flare, preparado por el usuario kyonjova a partir del checkpoint cuantizado en FP4 de NVIDIA (`nvidia/GLM-5.3-Flash-FP4-Local`), que a su vez deriva del modelo base `zai-org/GLM-5.3-Flash`. No se trata de un modelo nuevo ni de un fine-tune de pesos: es un empaquetado de pesos preparados, kernels compilados y grafos de ejecución capturados para servir GLM 5.3 Flash en dos DGX Spark (GB10, SM121) mediante tensor parallelism entre hosts.

El modelo subyacente es un mixture-of-experts con atención híbrida (sparse y linear), hyper-conexiones con restricción de variedad y una capa MTP de borrador para decodificación especulativa, con 320B parámetros totales y 18B activos. Soporta entradas de texto e imagen y una ventana de contexto de 1.048.576 tokens por petición, expuesta mediante una API compatible con OpenAI bajo el nombre `GLM-5.3-Flash`.

Su relevancia es acotada pero específica: demuestra un flujo de despliegue local de un MoE de 320B en hardware de escritorio de gama alta (dos DGX Spark) sin Python ni compilación en tiempo de ejecución, con verificación de firma del publicador. El paquete no es cargable por Transformers, vLLM, SGLang ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con atención híbrida (sparse + linear), hyper-conexiones con restricción de variedad y una capa MTP de borrador |
| Parametros totales | 320B |
| Parametros activos | 18B |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 en expertos enrutados (con escalas comprimidas sin pérdida), MXFP8 en proyecciones KDA y cabeza de vocabulario; torre de visión replicada |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (checkpoint FP4); modelo base GLM 5.3 Flash bajo licencia MIT |
| Formato de pesos | Paquete propietario de Flare (pesos preparados, kernels compilados, grafos de ejecución y metadatos firmados); no compatible con safetensors, GGUF ni otros formatos estándar |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención híbrida que combina mecanismos sparse y linear, hyper-conexiones con restricción de variedad (manifold-constrained hyper-connections) y una capa MTP (multi-token prediction) que actúa como borrador para decodificación especulativa. El checkpoint utilizado es la release FP4 de NVIDIA, producida mediante destilación con cuantización consciente (quantization-aware distillation), que mantiene los expertos enrutados en NVFP4 con escalas comprimidas de forma lossless, las proyecciones KDA y la cabeza de vocabulario en MXFP8, y la torre de visión replicada.

El paquete Flare añade a los pesos una capa de despliegue: kernels precompilados, grafos de ejecución capturados, soporte de tensor parallelism multi-host mediante Orbit y verificación de firma del publicador antes de cargar. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre contextos muy largos, hasta 1.048.576 tokens por petición.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), aunque el autor indica que las peticiones con imagen no se han probado en DGX Spark.
- Decodificación especulativa mediante la capa MTP incluida en el checkpoint.
- Servicio mediante API compatible con OpenAI bajo el nombre de modelo `GLM-5.3-Flash`.
- Despliegue con tensor parallelism entre dos hosts DGX Spark a través de Orbit.
- Verificación de firma criptográfica del paquete y de sus payloads antes de la carga.
- Soporte de tool calling, function calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE de 320B en dos DGX Spark: el paquete `gb10` (~168 GB) está preparado específicamente para servir el modelo con tensor parallelism entre dos hosts GB10 sin depender de infraestructura cloud.
- Análisis de documentos extensos: con 1.048.576 tokens de contexto, permite ingerir repositorios de código, expedientes o corpus documentales completos en una sola petición sin fragmentación ni recuperación externa.
- Sustitución de endpoints OpenAI en herramientas existentes: al exponer una API compatible, clientes y SDK ya configurados para OpenAI pueden apuntar al servicio local cambiando únicamente la URL base y el nombre de modelo.
- Procesamiento de documentos escaneados con texto: la torre de visión permite extraer y razonar sobre contenido de imágenes junto a instrucciones textuales, útil en digitalización de archivos; conviene validar antes el rendimiento real de imagen en GB10, no ejercitado por el autor.
- Entornos con requisitos de integridad del artefacto: la verificación de firma del publicador y de cada payload antes de cargar encaja en despliegues donde se exige cadena de custodia del modelo y de los binarios ejecutados.
- Inferencia de baja latencia sin Python: al usar kernels precompilados y grafos capturados, elimina el coste de compilación en tiempo de ejecución y la sobrecarga del stack Python en el camino de servicio.
- Investigación sobre cuantización FP4 a gran escala: sirve como banco de pruebas para medir el impacto de NVFP4 en expertos enrutados y MXFP8 en proyecciones sobre la calidad de un MoE de 320B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado una evaluación exhaustiva de precisión del modelo.

## Requisitos de hardware

- VRAM/almacenamiento: el paquete `gb10` ocupa aproximadamente 168 GB; el repositorio completo son 180,5 GB.
- Hardware objetivo: 2× DGX Spark (GB10, SM121) repartidos en dos hosts, con tensor parallelism mediante Orbit.
- GPU consumer: no cabe en ninguna GPU consumer convencional; el despliegue está diseñado para el par de GB10.
- Opciones de despliegue: exclusivamente el runtime Flare (`flare download` o el CLI `hf` nombrando la revisión `gb10`). Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-FP4-Local-FLARE | 320B totales / 18B activos | 1.048.576 | Paquete Flare propietario | NVIDIA Open Model Agreement + MIT (base) | Hugging Face, revisión `gb10` |
| nvidia/GLM-5.3-Flash-FP4-Local | 320B totales / 18B activos | 1.048.576 | Checkpoint FP4 de NVIDIA | NVIDIA Open Model Agreement | Hugging Face |
| zai-org/GLM-5.3-Flash | 320B totales / 18B activos | 1.048.576 | Pesos del modelo base | MIT | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, que son las únicas documentadas en la información disponible. No hay datos de benchmarks que permitan comparar rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Formato cerrado al runtime Flare: no es cargable por Transformers, vLLM, SGLang ni llama.cpp, lo que limita la portabilidad y ata el despliegue al ecosistema de NVIDIA.
- Sin evaluación de precisión: el autor declara que no se ha ejecutado una evaluación exhaustiva de accuracy, por lo que no hay garantías medidas sobre la degradación introducida por la cuantización FP4.
- Ruta de imagen no validada: las peticiones con imagen no se han ejercitado en DGX Spark, pese a que el pipeline declarado es `image-text-to-text`.
- Requisito de hardware muy específico: dos DGX Spark con interconexión entre hosts; no hay ruta documentada para otras configuraciones.
- Licencia restrictiva: el checkpoint FP4 se rige por el NVIDIA Open Model Agreement, con condiciones distintas a la licencia MIT del modelo base; es necesario revisar el acuerdo antes de cualquier uso comercial.
- Verificación de firma obligatoria: renombrar o eliminar cualquier payload del paquete provoca el fallo de la verificación, lo que exige manipular el paquete con las herramientas previstas.
- Idiomas soportados no documentados, lo que impide evaluar la cobertura multilingüe.
- Riesgo de alucinación, sesgos y comportamiento en contextos de 1M tokens: no disponible en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kyonjova/GLM-5.3-Flash-FP4-Local-FLARE
- Revisión `gb10` con instrucciones de despliegue: https://huggingface.co/kyonjova/GLM-5.3-Flash-FP4-Local-FLARE/blob/gb10/README.md
- Checkpoint base de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Modelo base de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Runtime Flare (código abierto): https://github.com/NVIDIA/spark-local-inference
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
