# netprojects/DaisyRose-27B-LayerFit-MLX-3bit

## Resumen

DaisyRose-27B-LayerFit-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo multimodal RadixArk/DaisyRose-27B, un ajuste mediante aprendizaje por refuerzo orientado a agentes sobre Qwen3.8-27B. Lo publica NetProjects (Paris Michalas) para ejecución en Apple Silicon a través de la librería mlx y mlx-vlm, con un tamaño en disco de 13,1 GB pensado para Macs de 24 GB de memoria unificada. El modelo conserva la torre de visión en bf16 y empaqueta la cabeza de predicción multi-token (MTP) en 8 bits para acelerar la decodificación.

El problema que resuelve es la brecha entre un modelo de 28.200 millones de parámetros (dato real de safetensors) y el hardware de consumo de Apple: una cuantización estándar de 3 bits degrada la calidad de forma uniforme, mientras que LayerFit aplica una búsqueda por capa que asigna más bits a las partes del modelo que más lo necesitan (bloques MLP, atención, atención lineal, embeddings y cabeza de salida), manteniendo el mismo presupuesto de tamaño. Según la model card, esto eleva la concordancia top-1 con bf16 del 84,5 % al 88,8 % y reduce la divergencia KL un 39 % (de 0,1500 a 0,0922) frente a una cuantización estándar de 3 bits del mismo tamaño.

Es relevante ahora porque permite desplegar localmente un modelo multimodal con capacidad agéntica, tool calling y modo de razonamiento en equipos de consumo, sin GPU dedicada, usando herramientas estándar del ecosistema MLX (mlx-lm, mlx-vlm, LM Studio). La licencia Apache-2.0 facilita el uso comercial, aunque la información disponible sobre el modelo base es limitada y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con atención lineal y cabeza de predicción multi-token (MTP); cuantización por capas LayerFit |
| Parámetros totales | 28.206.101.232 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits (LayerFit, por capas); torre de visión en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es RadixArk/DaisyRose-27B, descrito en la model card como un ajuste de RadixArk sobre Qwen3.8-27B mediante aprendizaje por refuerzo orientado a agentes. La arquitectura subyacente es de tipo transformer con atención lineal y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa usando el propio modelo como borrador. La variante publicada aquí no reentrena el modelo: aplica una cuantización de 3 bits con la receta LayerFit, que distribuye el presupuesto de bits de forma no uniforme midiendo la sensibilidad de cada capa (MLP, atención, atención lineal, embeddings y cabeza de salida). La receta concreta está en `layerfit-recipe.json` y fue calculada originalmente para la base Qwen3.8-27B y revalidada sobre este modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO del modelo base en la documentación proporcionada. La model card indica que el proceso de ajuste de capas se evaluó con pasajes en inglés, otros idiomas, código, llamadas a herramientas y matemáticas, pero no detalla la metodología de entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking mode), verificado en la model card con 2/2 pruebas superadas.
- Generación de código, con 3/3 pruebas de coding superadas.
- Matemáticas: 46/50 en GSM8K-50 con el modo de pensamiento desactivado.
- Llamadas a herramientas (tool calling / function calling), verificado como "pass" en la model card.
- Entrada de imágenes (image-text-to-text) mediante torre de visión conservada en bf16.
- Decodificación especulativa mediante la cabeza MTP empaquetada en 8 bits.
- Capacidades multilingües: no disponibles como dato explícito, aunque el harness de evaluación de LayerFit incluyó pasajes en otros idiomas además del inglés.
- Orientación agéntica y razonamiento multi-paso, heredada del ajuste RL del modelo base.

## Casos de uso

- Asistente de código local en Mac: el modelo puede generar y revisar funciones (se cita una prueba de escritura de una función Python para comprobar primos) y ejecutarse con mlx-lm en un Mac de 24 GB, lo que permite un flujo de trabajo sin conexión y sin enviar código a servicios externos.
- Automatización de agentes con tool calling: al superar la prueba de llamada a herramientas, puede integrarse en flujos que consulten APIs o ejecuten acciones estructuradas, con la ventaja de que la cabeza MTP acelera la decodificación en bucles agénticos.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede describir imágenes y extraer información de capturas o diagramas, por ejemplo para tareas de accesibilidad o catalogación.
- Razonamiento matemático asistido: con 46/50 en GSM8K-50 en modo sin pensamiento, es adecuado para resolver problemas aritméticos de varios pasos en entornos educativos o de validación de cálculos.
- Prototipado de aplicaciones multimodales en Apple Silicon: al cargarse con mlx-vlm y LM Studio, sirve para validar pipelines de image-text-to-text antes de migrar a infraestructura con GPU.
- Evaluación de cuantizaciones en local: la receta LayerFit y el harness de comparación permiten a investigadores medir la degradación de un modelo de 27B en 3 bits frente a bf16 en su propio hardware.
- Chat conversacional con contexto largo: orientado a conversaciones multi-turno, aunque la longitud de contexto no está documentada y conviene validarla empíricamente antes de usarla en producción.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 46/50 |
| Coding | 3/3 |
| Tool call | pass |
| Thinking | 2/2 |
| Concordancia top-1 con bf16 (LayerFit 3-bit) | 88,8 % |
| Concordancia top-1 con bf16 (3-bit estándar) | 84,5 % |
| Divergencia KL (LayerFit 3-bit) | 0,0922 |
| Divergencia KL (3-bit estándar) | 0,1500 |

Los datos de concordancia y KL provienen del harness propio de NetProjects sobre los pesos de lenguaje, comparados contra su build bf16 de RadixArk/DaisyRose-27B. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base en la información disponible; la model card remite a la ficha de RadixArk/DaisyRose-27B para los resultados del editor original.

## Requisitos de hardware

- VRAM/memoria unificada: 13,1 GB en disco; la model card lo sitúa para Macs de 24 GB, dejando margen para macOS y prompts largos (el autor recomienda que la descarga no supere el 60 % de la memoria).
- Builds alternativos del mismo modelo: 2,5 bits (11,5 GB) para 16 GB en modo ajustado, 4 bits (16,5 GB) para 32 GB, y 6/8 bits para 48 GB o más.
- GPU dedicadas: no se documentan requisitos para A100, H100 o RTX 4090; el formato MLX está orientado a Apple Silicon.
- GPU de consumo: cabe en Macs de 24 GB; en 16 GB requiere cerrar aplicaciones, limitar prompts a unos miles de tokens y elevar el límite de memoria con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Despliegue: mlx-vlm (`python -m mlx_vlm.generate`), mlx-lm (`mlx_lm.generate`) y LM Studio.
- Latencia y throughput: no disponibles; la decodificación especulativa con la cabeza MTP en 8 bits está pensada para reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-LayerFit-MLX-3bit | 28,2 B | no disponible | 3 bits MLX | Apache-2.0 | Hugging Face (0 descargas) |
| DaisyRose-27B-LayerFit-MLX-4bit | no disponible | no disponible | 4 bits MLX | Apache-2.0 | Hugging Face |
| DaisyRose-27B-MLX-6bit / 8bit | no disponible | no disponible | 6/8 bits MLX | Apache-2.0 | Hugging Face |
| RadixArk/DaisyRose-27B (base) | no disponible | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de los builds alternativos ni del modelo base en la información proporcionada, por lo que la comparación se limita a tamaño de archivo, formato y licencia.

## Limitaciones y advertencias

- La cuantización de 3 bits introduce degradación respecto a bf16: la concordancia top-1 es del 88,8 %, no del 100 %.
- Los benchmarks publicados son de un harness propio y de muestras pequeñas (GSM8K-50, 3 pruebas de coding, 2 de pensamiento), insuficientes para garantizar calidad en producción.
- No se documentan sesgos conocidos ni el comportamiento del modelo en idiomas distintos del inglés.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones de factualidad en la información disponible.
- La longitud de contexto no está especificada, lo que impide planificar cargas con prompts largos sin validación previa.
- El autor advierte de que no está afiliado al editor de RadixArk/DaisyRose-27B; la licencia Apache-2.0 se hereda del modelo base y conviene revisar LICENSE y NOTICE.
- LayerFit es una marca registrada de NetProjects; la receta de bits es específica de este modelo y no es transferible sin revalidación.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en la comunidad.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente portable a vLLM, TGI o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 2,5 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com
