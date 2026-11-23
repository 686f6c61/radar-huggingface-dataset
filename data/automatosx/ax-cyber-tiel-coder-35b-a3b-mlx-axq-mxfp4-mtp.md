# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX, publicado por AutomatosX, que empaqueta el modelo Cyber-Tiel-Coder-35B-A3B (familia `qwen3.5-moe`) para su ejecución en Apple Silicon. Se trata de una conversión con cuantización mixta AXQuant (AXQ) realizada directamente desde el modelo fuente en BF16, con el objetivo de reducir el peso en disco y en memoria manteniendo las partes sensibles en mayor precisión.

El modelo base es una arquitectura `Qwen3_5MoeForConditionalGeneration`, es decir, un transformer con mezcla de expertos (MoE) de 35,11 mil millones de parámetros lógicos, con torre de visión y cabecera de predicción multi-token (MTP) preservadas en BF16. La ventana de contexto configurada alcanza los 262.144 tokens, aunque el límite práctico depende de la memoria unificada del equipo Apple.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE de 35B con capacidades de código y visión en hardware de consumo de Apple; por otro, el autor publica el paquete explícitamente como evidencia de desarrollo, sin certificar calidad, velocidad ni exactitud del MTP. La licencia es Apache 2.0 y el tamaño de descarga ronda los 22 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration`, transformer con mezcla de expertos (MoE), con torre de visión y cabecera MTP |
| Parametros totales | 35.107.180.016 (35,11B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados (límite práctico según memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant: `4bit` (33,62B parámetros, 93,52%), `8bit` (529,61M, 1,47%), `bf16` (1,80B, 5,01%); métodos `affine`, `bf16`, `mxfp4`; tamaños de grupo 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos de la familia Qwen 3.5 MoE, con una ruta de texto optimizada y dos componentes adicionales: una torre de visión (333 tensores, 446,57M parámetros, 0,89 GB en BF16) y una cabecera de predicción multi-token (MTP) con 785 tensores, 844,64M parámetros y 1,69 GB en BF16. La cuantización AXQuant se aplica exclusivamente a la ruta de texto: el 93,52% de los parámetros principales queda en 4 bits, un 1,47% en 8 bits y un 5,01% en BF16, con un BPW medido de 4,6342 para el modelo principal y 4,9013 incluyendo el MTP. El tamaño de los pesos en safetensors es de 22,03 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card no documenta el proceso de entrenamiento del modelo base. La innovación destacable del paquete es la propia cuantización mixta AXQuant 1.9.0, que protege tensores sensibles en 8 bits y BF16 mientras comprime el grueso de la red a 4 bits, así como la preservación de las cabeceras MTP y de visión fuera del esquema de cuantización. El autor advierte que la auditoría de formato de runtime no constituye una validación de carga ni de generación correcta.

## Capacidades

- Generación de texto conversacional y de propósito general mediante la ruta de texto del modelo.
- Generación y asistencia en código, dado el perfil "Coder" del modelo base.
- Razonamiento multi-paso, presumiblemente apoyado por la cabecera MTP de predicción multi-token (no validado en este paquete).
- Procesamiento de visión: la torre de visión está presente en BF16 como sidecar, aunque su calidad no está certificada en esta release.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Tool calling y function calling: no documentados en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Modo thinking explícito: no documentado en la información disponible.
- Audio: no presente (`Audio present: False`).

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede emplearse con MLX-LM para autocompletar, explicar y refactorizar código sin enviar datos a la nube, aprovechando su perfil Coder y su ejecución nativa en Apple Silicon.
- Prototipado de aplicaciones con contexto largo: la ventana configurada de 262.144 tokens permite analizar repositorios completos o documentación extensa, siempre que la memoria unificada del equipo lo permita.
- Análisis de documentación técnica con imágenes: la torre de visión en BF16 posibilita, en principio, tareas de comprensión de diagramas o capturas, aunque el autor no certifica la calidad visión-lenguaje de este paquete.
- Evaluación de cuantización en investigación: útil para estudiar el impacto de esquemas mixtos 4/8/BF16 en modelos MoE, comparando este checkpoint con los hermanos de 4 y 6 bits.
- Desarrollo offline en entornos con requisitos de privacidad: al ejecutarse localmente con MLX, encaja en flujos donde no está permitido enviar código o datos a servicios externos.
- Integración en pipelines de generación de texto con MLX-LM: el comando documentado permite incorporar el modelo a scripts de generación por lotes con temperatura 0 para resultados deterministas.
- Generación especulativa con MTP: la cabecera MTP está incluida y podría habilitar decodificación especulativa, aunque el autor no aporta evidencia de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad del MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM/memoria unificada: al menos 22,05 GB de espacio libre en disco para la descarga; en memoria, el tamaño de los pesos (22,03 GB) más el overhead del runtime MLX exige un equipo con memoria unificada holgada, previsiblemente 32 GB o más para contexto corto y bastante más para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (MLX); no está pensado para GPU NVIDIA ni AMD en este formato.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta); no aplica a GPUs de consumo NVIDIA por el formato MLX.
- Opciones de despliegue: MLX-LM (ruta principal documentada); AX Engine no está establecido por falta de un `model-manifest.json` validado; llama.cpp, vLLM, Ollama y TGI no son compatibles con pesos MLX.
- Latencia y throughput: no disponibles; no se aportan mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 35,11B (MoE) | 262.144 | MLX Safetensors, 4,90 BPW total | Apache 2.0 | Paquete de desarrollo, sin benchmarks publicados |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | 35,11B (MoE) | 262.144 | MLX Safetensors | Apache 2.0 | Hermano de menor presupuesto de almacenamiento; BPW exacto a consultar |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | 35,11B (MoE) | 262.144 | MLX Safetensors | Apache 2.0 | Hermano de mayor precisión media, cerca del presupuesto de 6 BPW |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35,11B (MoE) | no disponible | MLX Safetensors | no disponible | Modelo base del que se deriva esta cuantización |

## Limitaciones y advertencias

- El autor declara explícitamente que se trata de evidencia de desarrollo y no de una release AXQuant certificada: no hay evidencia publicada de calidad, contexto largo, velocidad de kernels ni velocidad del MTP.
- La auditoría de formato remoto no otorga un perfil de runtime oMLX/MTPLX ni garantiza una carga y generación correctas.
- MLX-LM cubre la inferencia estándar de texto/backbone y puede ignorar los metadatos de runtime AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`); el comando documentado no establece aceleración MTP ni calidad visión-lenguaje.
- No se incluye un `model-manifest.json` nativo validado, por lo que la ejecución en AX Engine no está establecida; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingüe.
- No hay información sobre sesgos ni sobre tasas de alucinación del modelo base.
- El límite práctico de contexto depende de la memoria unificada del equipo, no solo de los 262.144 tokens configurados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial en producción.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni PyTorch en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Hermano de 4 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano de 6 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
