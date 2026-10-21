# bambocher/LFM2.5-24B-A2B-oQ5e

## Resumen

`bambocher/LFM2.5-24B-A2B-oQ5e` es un checkpoint cuantizado del modelo LFM2.5-24B-A2B, publicado por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a precisión mixta mediante la herramienta oQ (oMLX v0.7.1), con un promedio efectivo de 5,576 bits por peso. El resultado ocupa 16,71 GB en disco (15,562 GiB de pesos lógicos) frente a los aproximadamente 47,9 GB que requeriría el checkpoint original en BF16 para 23.972 millones de parámetros, lo que reduce el requisito de memoria en torno a un 65 %.

El nombre del repositorio indica que se trata de un modelo de mezcla de expertos (MoE): 24B de parámetros totales y el sufijo «A2B» sugiere del orden de 2B de parámetros activos por token, aunque este dato no se confirma en la información disponible. El tag `lfm2_moe` de HuggingFace y la arquitectura declarada en la librería MLX corroboran la familia MoE. La información proporcionada no incluye la model card del modelo base, por lo que no se pueden verificar contexto, idiomas, licencia ni datos de entrenamiento.

Su relevancia es acotada pero concreta: es una de las pocas conversiones de un MoE de ~24B a ~5,5 bits lista para ejecutarse con MLX en Apple Silicon, con un tamaño que encaja en equipos de memoria unificada de 24-32 GB. Con 11 descargas y 0 likes en el momento del análisis, carece por completo de validación comunitaria y no debe tratarse como un artefacto de producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `lfm2_moe`); transformer con mezcla de expertos, número de expertos y configuración de attention no disponibles |
| Parametros totales | 23.971.587.712 (23,972B) |
| Parametros activos | no disponible (el sufijo «A2B» del nombre sugiere ~2B, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 5-bit grupo 64 (95,743 % de los pesos), affine 6-bit grupo 64 (2,646 %), affine 8-bit grupo 64 (1,588 %), BF16 (0,022 %) y FP32 (trazas). Promedio efectivo 5,576 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cuantizados para MLX (`mlx`, `oq`, `quantized`, `5-bit`); repo de 16,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de lenguaje de tipo mezcla de expertos de la familia LFM2 (identificador de arquitectura `lfm2_moe` en los safetensors), con 23,972B de parámetros totales. La información disponible no detalla el número de expertos, la dimensión oculta, el mecanismo de attention ni la composición del dataset de entrenamiento; tampoco hay constancia de si el modelo base pasó por RLHF, DPO u otra fase de alineamiento. Todo lo relativo al preentrenamiento del modelo original queda fuera del alcance de esta ficha.

La contribución real de este repositorio es la cuantización. oMLX aplica un esquema de precisión mixta que asigna 5 bits a la gran mayoría de tensores (22,951B de pesos lógicos) y reserva 6 y 8 bits para 0,634B y 0,381B de pesos respectivamente, presumiblemente capas o módulos sensibles a la cuantización, más una fracción mínima en BF16 (0,005B). El resultado son 15,562 GiB de almacenamiento con un promedio de 5,576 bits por peso, un compromiso entre el 4-bit puro (más agresivo, ~12 GB) y el 6-bit (~18 GB). No se documenta ninguna innovación en decodificación especulativa ni cambios en el grafo de inferencia: es una conversión de pesos, no una arquitectura nueva.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base LFM2.5-24B-A2B; el alcance exacto no está documentado en la información disponible.
- Ejecución nativa en Apple Silicon mediante MLX, con pesos ya cuantizados y listos para cargar sin pasos de conversión adicionales.
- Capacidad multilingüe: no disponible (no se declaran idiomas en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible; el desglose de almacenamiento solo menciona «Language model».
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Mac para prototipado de aplicaciones de texto: el checkpoint se carga directamente en MLX sin conversión, con 15,6 GiB de pesos que encajan en un Mac con 24-32 GB de memoria unificada, lo que permite iterar sobre prompts y flujos sin depender de API externas.
- Evaluación comparativa de cuantización: al existir un esquema documentado de 5,576 bits/peso con distribución por grupos, sirve para medir la degradación de calidad frente al BF16 en tareas concretas (resumen, clasificación, generación de código) antes de adoptar oQ en otros modelos.
- Procesamiento de datos sensible a la privacidad: al ejecutarse íntegramente en local, es adecuado para clasificar o resumir documentos internos (contratos, informes, tickets) que no pueden salir de la máquina del analista.
- Asistente de escritura offline: generación y reescritura de texto en un portátil sin conexión, aprovechando que un MoE con ~2B activos (según el nombre) reduce el coste de decodificación frente a un denso de 24B.
- banco de pruebas para pipelines MLX: validar integraciones con `mlx-lm` (carga, tokenización, límites de contexto, gestión de caché KV) antes de invertir en checkpoints mayores o en infraestructura GPU.
- Generación de código asistida en local para proyectos pequeños: útil si el modelo base conserva la competencia de código de la familia LFM2, aunque esta ficha no puede confirmarlo por falta de benchmarks; requiere validación previa con el propio repositorio de código.
- Reproducibilidad de artefactos cuantizados: con solo 11 descargas, sirve como referencia para auditar cómo oMLX reparte bits entre tensores y qué módulos reciben 6 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a documentar la distribución de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K ni comparaciones con el checkpoint BF16. Los resultados de la búsqueda web no contienen información relevante sobre el modelo.

## Requisitos de hardware

- Almacenamiento: 16,7 GB de repo; 15,562 GiB de pesos en memoria una vez cargados.
- VRAM / memoria unificada estimada: no hay cifra oficial; por aritmética, los pesos exigen ~15,6 GiB y hay que sumar caché KV y overhead del runtime, por lo que un equipo con 24 GB de memoria unificada va muy justo y 32 GB o más es el escenario razonable. Estimación propia, no confirmada por el autor.
- GPU compatibles: no aplica a CUDA. La librería declarada es MLX, que requiere Apple Silicon (series M1/M2/M3/M4). Para A100, H100 o RTX 4090 habría que convertir los pesos a otro formato, paso no documentado en la información disponible.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en configuraciones de 32 GB o superiores; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriría reconversión y no está soportado de forma nativa.
- Opciones de despliegue: MLX / `mlx-lm` y herramientas compatibles con oQ (oMLX). vLLM, TGI, llama.cpp y Ollama no se mencionan como soportados para estos pesos; llama.cpp necesitaría una conversión a GGUF que no está disponible en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ5e (este repo) | 23,972B totales, activos no disponibles | no disponible | safetensors MLX, 5,576 bits/peso, 16,7 GB | no disponible | 11 descargas, 0 likes |
| LFM2.5-24B-A2B (checkpoint base, BF16) | 23,972B | no disponible | safetensors BF16, ~47,9 GB (cálculo a partir del número de parámetros) | no disponible | no verificada en la información disponible |
| Cuantización 4-bit equivalente del mismo modelo | 23,972B | no disponible | ~12 GB estimados | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables de la misma familia y tamaño, por lo que la comparación se limita a formato y huella de memoria. Cualquier comparación cualitativa con otros MoE de ~24B (por ejemplo, familias tipo Mixtral o Qwen-MoE) requeriría benchmarks que este repositorio no publica.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación. Es un bloqueante para cualquier despliegue en producción.
- Trazabilidad incompleta: la model card no indica qué checkpoint base se cuantizó, ni su revisión, ni los parámetros de configuración del modelo (contexto, tokenizer, chat template).
- Pérdida de calidad por cuantización: 95,7 % de los pesos a 5 bits con grupo 64 introduce degradación respecto a BF16, no medida ni documentada por el autor. El esquema mixto mitiga el problema en capas sensibles, pero no lo elimina.
- Sin validación comunitaria: 11 descargas y 0 likes implican que no hay informes independientes de calidad, estabilidad ni comportamiento en contextos largos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluación del autor no hay forma de acotarlo. Verificar salidas factuales antes de cualquier uso automatizado.
- Idiomas y contexto desconocidos: no se puede confirmar el soporte de castellano ni la ventana máxima real, lo que impide planificar aplicaciones multi-turno o de documentación larga.
- Amarre al ecosistema Apple: los pesos están en safetensors cuantizados para MLX; no son portables a vLLM, TGI o llama.cpp sin una conversión que el repositorio no documenta.
- El repositorio parece contener únicamente los pesos del modelo de lenguaje (el desglose de almacenamiento así lo indica); no se confirma la presencia de tokenizer, `config.json` completo ni plantilla de chat. Comprobar antes de intentar cargarlo.
- No apto para fine-tuning directo: los pesos cuantizados en MLX no son adecuados para reentrenamiento; habría que partir del checkpoint BF16 original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ5e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM2.5-24B-A2B: no disponible en la información proporcionada (el repositorio no enlaza el checkpoint de origen)
- Paper, blog o demo del modelo base: no disponible
- Resultados de la búsqueda web: no contienen información relevante sobre este modelo
