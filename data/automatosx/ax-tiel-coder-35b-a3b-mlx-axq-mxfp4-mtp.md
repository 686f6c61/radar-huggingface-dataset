# AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX y derivado directamente del modelo BF16 peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP. Se trata de una conversión de precisión mixta mediante el cuantizador AXQuant 1.9.0, etiquetada comercialmente como clase de presupuesto MXFP4, que mantiene la ruta de lenguaje cuantizada mientras preserva la cabeza de predicción multi-token (MTP) y la torre de visión en BF16.

El modelo pertenece a la familia qwen3.5-moe y su arquitectura de origen es Qwen3_5MoeForConditionalGeneration, un transformer con mezcla de expertos (MoE) con soporte para generación condicional multimodal (texto e imagen). La model card declara 35,11B de parámetros lógicos en el modelo principal, mientras que el recuento real de safetensors asciende a 34.660.608.768 parámetros. El contexto máximo configurado es de 262.144 tokens, con límites prácticos dependientes de la memoria unificada del equipo.

Su relevancia es acotada y muy específica: no es un lanzamiento certificado ni un modelo nuevo, sino un artefacto de conversión para el ecosistema MLX. El propio autor lo describe como "evidencia de desarrollo", sin evidencia publicada de calidad, contexto largo, velocidad de kernels ni velocidad de MTP. Su interés principal reside en ofrecer una ruta de ejecución de un MoE de ~35B en hardware Apple con un tamaño de descarga de aproximadamente 22,05 GB y un BPW medido de 4,9013 (incluyendo MTP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); clase de origen `Qwen3_5MoeForConditionalGeneration`, familia `qwen3.5-moe`; ruta de texto optimizada |
| Parametros totales | 34.660.608.768 (34,66B) segun safetensors; 35,11B logicos segun la model card |
| Parametros activos | no disponible; la nomenclatura A3B del nombre sugiere del orden de 3.000 millones, sin confirmacion en la documentacion facilitada |
| Longitud de contexto | 262.144 tokens configurados; los limites practicos dependen de la memoria unificada |
| Tipos de cuantizacion | Mixta AXQuant: 4bit (33,62B, 93,52%), 8bit (529,61M, 1,47%), bf16 (1,80B, 5,01%); metodos `affine`, `bf16`, `mxfp4`; tamanos de grupo 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (no contiene pesos PyTorch ni GGUF) |
| BPW medido | 4,6342 en el modelo principal; 4,9013 total incluyendo MTP |
| Tamano de pesos | 22,03 GB en safetensors; descarga completa aproximada de 22,05 GB |
| Sidecar MTP | 785 tensores, 844,64M parametros, 1,69 GB, BF16 |
| Sidecar de vision | 333 tensores, 446,57M parametros, 0,89 GB, BF16 |
| Audio | no presente |
| Runtime principal | MLX-LM (MLX 0.32.1, MLX-LM 0.31.3 registrados en la conversion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia qwen3.5-moe, implementado como `Qwen3_5MoeForConditionalGeneration`. Se trata de un modelo de generacion condicional, es decir, admite entradas multimodales: el repositorio incluye una torre de vision funcional (sidecar BF16 de 446,57M parametros) y una cabeza de prediccion multi-token (MTP) de 844,64M parametros, tambien en BF16. No se incluye modulo de audio. El ambito de optimizacion de la cuantizacion es la ruta de texto.

Sobre el entrenamiento del modelo original no se aporta informacion en la documentacion disponible: no se detallan tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. Lo que si se documenta en detalle es el proceso de cuantizacion posterior. AXQuant 1.9.0 aplica un esquema de precision mixta en el que el 93,52% de los parametros del modelo principal quedan en 4 bits, un 1,47% en 8 bits y un 5,01% en BF16, con el objetivo de respetar un presupuesto de almacenamiento cercano a 6 BPW (5,6026 planificado) que en la practica se materializa en 4,6342 BPW medidos en el modelo principal. Los tensores protegidos (vision y MTP) se conservan integros en BF16.

El autor insiste en una distincion importante: los nombres de los paquetes AXQ describen una clase de presupuesto de almacenamiento, no una precision uniforme aplicada a todos los tensores. Por ese motivo, un plan con nombre `6bit` puede retener 4 bits como precision base y elevar selectivamente otros tensores a 6, 8 bits o BF16. La model card tambien aclara que este paquete no incluye un `model-manifest.json` nativo validado, por lo que la ejecucion mediante AX Engine no esta establecida; las versiones registradas (AX Engine 7.5.7) describen un contrato de compatibilidad previsto, no evidencia observada en tiempo de ejecucion.

## Capacidades

- Generacion de texto conversacional y de desarrollo de software, segun los tags `text-generation`, `conversational` y `development` del repositorio.
- Razonamiento multimodal texto-imagen: el checkpoint incluye torre de vision en BF16, aunque el autor no publica evidencia de calidad vision-lenguaje.
- Prediccion multi-token (MTP): el sidecar esta presente y en BF16, pero la model card advierte que su presencia no establece por si sola aceleracion MTP ni exactitud del mecanismo.
- Contexto largo: hasta 262.144 tokens configurados, sujeto a la memoria unificada disponible en el equipo Apple Silicon.
- Ejecucion en Apple Silicon mediante MLX-LM para inferencia de texto y backbone estandar.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no, el modelo declara `audio: False`.

## Casos de uso

- Inferencia local en portatiles y equipos de sobremesa Apple Silicon: con una descarga de 22,05 GB y cuantizacion de 4 bits dominante, el modelo puede ejecutarse en Mac con memoria unificada suficiente sin depender de GPU dedicadas ni de servicios en la nube, usando MLX-LM como runtime.
- Asistencia de programacion en local: los tags `development` y `qwen3.5-moe` apuntan a un uso orientado a codigo; puede integrarse en editores o CLI como motor de autocompletado y generacion de fragmentos, siempre que se valide la calidad con pruebas propias al no existir benchmarks publicados.
- Procesado de documentos largos: la ventana de 262.144 tokens permite analizar repositorios completos, expedientes o transcripciones extensas en una sola pasada, limitado por la memoria unificada del equipo.
- Prototipado de pipelines multimodales texto-imagen: la torre de vision en BF16 permite experimentar con tareas que combinen imagen y texto, aunque el autor no respalda la calidad resultante y MLX-LM puede ignorar los sidecars.
- Investigacion sobre cuantizacion de precisión mixta: el repositorio documenta el desglose exacto de precisiones por tensor (4bit/8bit/bf16), tamanos de grupo y BPW medido, lo que lo convierte en un objeto de estudio util para comparar estrategias de cuantizacion en modelos MoE sobre Apple Silicon.
- Evaluacion comparativa de la familia AXQ: los hermanos `4bit` y `6bit` del mismo modelo base permiten montar un banco de pruebas controlado sobre el compromiso entre almacenamiento, precision media y calidad de salida.
- Reproducibilidad y auditoria de artefactos: el paquete incluye `runtime_audit.json` con enlaces fijados a config, indice y cabeceras, lo que facilita fijar revisiones concretas del Hub en despliegues reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de rendimiento.

## Requisitos de hardware

- VRAM/memoria unificada estimada: la descarga completa ocupa 22,05 GB y los pesos en safetensors 22,03 GB; a esa cifra hay que sumar el overhead del runtime, la cache KV y los estados de activacion, que crecen con la longitud de contexto hasta los 262.144 tokens. Se recomienda un minimo de 32 GB de memoria unificada y 64 GB o mas para contextos largos (estimacion propia, no confirmada por el autor).
- GPUs recomendadas: no aplica; el paquete es especifico de MLX y Apple Silicon. No se distribuyen pesos PyTorch ni GGUF, por lo que no puede cargarse directamente en A100, H100 o RTX 4090 sin una conversion previa no incluida.
- Cabe en GPU de consumo: no en el sentido tradicional. En el ecosistema Apple, cabe en equipos con memoria unificada de 32 GB o superior; en GPUs NVIDIA de consumo requeriria reconvertir el modelo a otro formato, algo fuera del alcance de este repositorio.
- Opciones de despliegue: MLX-LM es la ruta soportada (`mlx_lm.generate`). La ejecucion nativa mediante AX Engine no esta establecida por falta de un `model-manifest.json` validado. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el repositorio no contiene GGUF ni pesos PyTorch.
- Latencia y throughput: no disponible. La model card no publica mediciones de velocidad de kernels ni de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y precision | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 34,66B reales / 35,11B logicos | 262.144 tokens | Safetensors MLX, mixta 4bit/8bit/bf16, 4,9013 BPW total | Apache 2.0 | Paquete objeto de esta ficha; vision y MTP en BF16 |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | Mismo modelo base | 262.144 tokens (heredado del base) | Safetensors MLX, presupuesto 4bit | Apache 2.0 | Hermano de menor almacenamiento; consultar su BPW exacto |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | Mismo modelo base | 262.144 tokens (heredado del base) | Safetensors MLX, presupuesto cercano a 6 BPW | Apache 2.0 | Hermano de mayor precision media |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | Mismo modelo base | 262.144 tokens (heredado) | Safetensors MLX, oQ6e | no disponible en la informacion proporcionada | Modelo de origen del que se convierte este checkpoint |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes. La comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Artefacto de desarrollo, no certificado: el autor advierte que este paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni exactitud del mecanismo MTP. No debe tratarse como un lanzamiento validado.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, lo que impide estimar el rendimiento real antes de desplegarlo.
- Idiomas no declarados: el repositorio no especifica que idiomas soporta el modelo, por lo que el comportamiento multilingue es desconocido.
- Vision y MTP no garantizados en tiempo de ejecucion: MLX-LM puede ignorar los metadatos de AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`), de modo que el comando de ejemplo no establece ni aceleracion MTP ni calidad vision-lenguaje.
- Dependencia estricta del ecosistema Apple: al no incluir pesos PyTorch ni GGUF, el modelo no es utilizable sin conversion previa en infraestructura NVIDIA o AMD.
- Riesgo de alucinacion: no disponible; no se han publicado evaluaciones de fidelidad o tasas de alucinacion para este checkpoint.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- Limites practicos de contexto: aunque se configuran 262.144 tokens, el propio autor indica que el limite real depende de la memoria unificada, por lo que contextos muy largos pueden no ser alcanzables en equipos de gama media.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que la licencia del modelo base y de los datos de entrenamiento originales sean compatibles, ya que la informacion disponible no detalla ese extremo.
- Compatibilidad de runtime no verificada: las versiones registradas (MLX 0.32.1, MLX-LM 0.31.3, AX Engine 7.5.7) corresponden al momento de la conversion; cambios posteriores de version pueden alterar el comportamiento de carga.
- Reproducibilidad: se recomienda fijar el commit del Hub en lugar de depender de `main`, tal como aconseja el propio autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/88625754ac91b542280a5602239ce6b2166366f0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoria de formato en tiempo de ejecucion: `runtime_audit.json` (incluido en el repositorio)
