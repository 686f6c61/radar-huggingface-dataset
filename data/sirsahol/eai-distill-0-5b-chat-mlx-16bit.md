# SirSahOl/eai-distill-0.5b-chat-mlx-16bit

## Resumen

eai-distill-0.5b-chat-mlx-16bit es una conversión a formato MLX de 16 bits (bfloat16 sin cuantizar) del modelo Enterprise-AI/eai-distill-0.5b, publicada por el usuario SirSahOl. No se trata de un entrenamiento nuevo, sino de un artefacto de conversión cuyo objetivo es ejecutar el modelo base de forma nativa sobre la GPU unificada de los chips Apple Silicon mediante la librería MLX de Apple, en lugar de requerir CUDA o backends de CPU.

El modelo es un transformer denso de tipo Qwen2ForCausalLM con 630.167.424 parámetros reales (aproximadamente 0,63 mil millones, etiquetado comercialmente como "0.5B"), una longitud de contexto declarada de 32.768 tokens y un pipeline de text-generation orientado a conversación. Su huella de memoria activa declarada es de unos 1250 MB, lo que lo sitúa en el rango de modelos ejecutables en cualquier Mac con 8 GB de memoria unificada.

Su relevancia es acotada y muy específica: sirve como referencia de precisión completa para evaluar la degradación introducida por las variantes cuantizadas del mismo autor (4-bit y 8-bit) y como componente ligero en prototipos locales sobre macOS. No hay evidencia publicada de benchmarks de calidad, la licencia figura como desconocida y el modelo base carece de documentación accesible, por lo que su uso en producción requiere verificación previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 630.167.424 (0,63 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 16-bit (bfloat16 sin cuantizar) en este repositorio; el autor publica tambien variantes 4-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida; el autor la marca como "license: unknown") |
| Formato de pesos | safetensors en formato MLX (no se proporciona GGUF ni pesos para transformers/PyTorch) |
| Tamano del repositorio | 2,5 GB |
| Huella de VRAM activa | ~1250 MB (minimo recomendado: 8 GB de memoria unificada) |
| Modelo base | Enterprise-AI/eai-distill-0.5b |
| Libreria | mlx (mlx-lm) |
| Pipeline | text-generation |
| Descargas / likes | 255 / 0 |
| Fecha de creacion (metadatos) | 2026-09-22 |
| Ultima actualizacion (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2 (clase Qwen2ForCausalLM), con atención causal estándar y sin componentes MoE, SSM ni mecanismos híbridos declarados. Con 630 millones de parámetros y 32.768 tokens de contexto, el diseño corresponde a un modelo pequeño de propósito general orientado a conversación. El repositorio no documenta el número de capas, dimensiones ocultas, número de cabezas de atención ni el vocabulario del tokenizador.

En cuanto al entrenamiento, esta ficha no puede describirlo: el autor no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o destilación, ni sobre el procedimiento de destilación que sugiere el nombre "distill" del modelo base. La información disponible se limita a la conversión: el proceso aplicado aquí es una transformación de pesos a formato MLX en precisión 16 bits (bfloat16 sin cuantizar, con un promedio declarado de 16,00 bits por peso), sin pérdida de precisión respecto al modelo de origen. El autor documenta además el uso de una plantilla de chat con tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, y recomienda configurarlos como stop tokens en los runtimes locales para evitar bucles de generación y garantizar el turn-taking correcto.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat con roles system, user y assistant.
- Ventana de contexto de 32.768 tokens, suficiente para conversaciones largas o documentos de extensión media en un modelo de este tamaño.
- Inferencia en GPU nativa de Apple Silicon a través de MLX, con huella de memoria activa de aproximadamente 1250 MB.
- Compatibilidad con las tres variantes de precisión publicadas por el mismo autor (4-bit, 8-bit y 16-bit), lo que permite ajustar el equilibrio entre calidad y memoria.
- Soporte de decodificación en streaming y modo chat interactivo a través de las utilidades de línea de comandos de mlx-lm (`mlx_lm.chat`, `mlx_lm.generate`).
- Integración en LM Studio y Ollama mediante la configuración de plantilla y stop tokens documentada por el autor.
- No se declara soporte de tool calling, function calling, capacidades de agente, modo de razonamiento extendido, visión, audio ni multimodalidad.
- No se declaran capacidades multilingües específicas; el campo de idiomas no está informado en los metadatos.

## Casos de uso

- Evaluación de referencia en precisión completa: al ser la variante sin cuantizar, sirve como baseline para medir la degradación de perplejidad y calidad que introducen las versiones 4-bit y 8-bit del mismo modelo sobre el mismo conjunto de prompts.
- Asistente conversacional local en macOS: con 1250 MB de memoria activa y un mínimo de 8 GB unificados, puede ejecutarse en segundo plano en un MacBook base mientras el usuario trabaja con IDE, navegador y otras herramientas.
- Generación de texto por lotes para anotación sintética: la velocidad declarada de 160 a 448 tokens/s según el chip permite procesar grandes volúmenes de prompts para preetiquetado de datos o aumento de datasets en un solo equipo.
- Prototipado rápido de aplicaciones MLX: desarrolladores que quieran validar una interfaz conversacional o un pipeline de generación antes de migrar a un modelo mayor pueden usar este repositorio sin salir del ecosistema MLX.
- Componente de enrutado o clasificación en sistemas multi-agente: por su latencia declarada de 21 a 30 ms de TTFT en chips base y Pro, es adecuado como primer eslabón que decide a qué modelo mayor derivar una consulta.
- Servicio interno de baja concurrencia en un Mac mini o Mac Studio: con la variante de 16 bits se puede desplegar un endpoint conversacional para uso de un equipo pequeño, siempre que la licencia se haya verificado previamente.
- Investigación sobre destilación y cuantización: permite estudiar el comportamiento de un modelo destilado de 0,63 B frente a variantes de precisión reducida, comparando salidas y estabilidad de generación con la plantilla de chat original.
- Pruebas de integración con Ollama y LM Studio: el repositorio incluye un Modelfile y la configuración de stop tokens necesaria para validar rápidamente el modelo en estos runtimes de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. El autor únicamente proporciona proyecciones de rendimiento de hardware, que se reproducen a continuación tal cual y que, según su propia nota, están "basadas en la saturación de ancho de banda de memoria de Apple Silicon para pesos de 16 bits" y varían según la longitud del prompt. No son mediciones de calidad del modelo ni benchmarks estandarizados.

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~1200 MB | ~160 tokens/s | ~30 ms | Inferencia local de baja latencia y asistentes embebidos |
| M1 / M2 / M3 / M4 Pro | 18 GB – 36 GB | ~1200 MB | ~240 tokens/s | ~21 ms | Procesamiento concurrente y bucles de agente en tiempo real |
| M1 / M2 / M3 / M4 Max | 36 GB – 128 GB | ~1200 MB | ~336 tokens/s | ~15 ms | Máxima velocidad de decodificación en un solo stream |
| M1 / M2 / M3 / M4 Ultra | 64 GB – 192 GB | ~1200 MB | ~448 tokens/s | ~1 ms | Evaluación por lotes en paralelo y serving de alto rendimiento |

## Requisitos de hardware

- VRAM/unified memory activa: aproximadamente 1250 MB en esta variante de 16 bits; el autor recomienda un mínimo de 8 GB de memoria unificada.
- Espacio en disco: ~1020 MB para los pesos de la variante 16-bit según la tabla del autor; el repositorio completo ocupa 2,5 GB.
- Hardware soportado: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) mediante MLX. No hay soporte declarado para GPU NVIDIA, AMD ni para CPU x86.
- Cabe en GPU de consumo: sí, pero únicamente en el sentido de GPU integrada de Apple Silicon. No se distribuyen pesos GGUF ni formatos compatibles con CUDA, por lo que no es desplegable en una RTX 4090, A100 o H100 sin una conversión previa desde el modelo base.
- Alternativas de despliegue documentadas: mlx-lm (CLI y API de Python), LM Studio y Ollama mediante Modelfile con stop tokens. No se documentan vLLM, TGI ni llama.cpp para este repositorio.
- Latencia y throughput: según las proyecciones del autor, entre ~160 tokens/s y ~448 tokens/s de decodificación, con TTFT de ~30 ms en chips base y ~1 ms en Ultra. Son estimaciones del publicador, no mediciones independientes.
- Memoria según cuantización (datos del autor): 4-bit ≈ 325 MB de VRAM y ~285 MB en disco; 8-bit ≈ 585 MB de VRAM y ~540 MB en disco; 16-bit ≈ 1090–1250 MB de VRAM y ~1020 MB en disco.

## Comparativa con modelos similares

La información disponible no incluye especificaciones de modelos alternativos comparables (por ejemplo, otros modelos destilados de ~0,5–1 B o versiones equivalentes de la familia Qwen2). La comparación más fiable que puede hacerse con los datos aportados es entre las tres variantes de precisión del propio modelo:

| Variante | Tamaño en disco | Huella de VRAM | Precisión | Ventaja declarada por el autor |
|---|---|---|---|---|
| eai-distill-0.5b-chat-mlx-4bit | ~285 MB | ~325 MB | 4 bits | Huella mínima y máxima velocidad de generación |
| eai-distill-0.5b-chat-mlx-8bit | ~540 MB | ~585 MB | 8 bits | Precisión casi sin pérdida con huella muy reducida |
| eai-distill-0.5b-chat-mlx-16bit (este repo) | ~1020 MB | ~1090–1250 MB | 16 bits (bfloat16) | Precisión completa, sin penalización de perplejidad |

| Criterio | Este modelo | Modelo base Enterprise-AI/eai-distill-0.5b | Alternativas comparables |
|---|---|---|---|
| Parámetros | 0,63 B | no disponible en la información proporcionada | no disponible |
| Contexto | 32.768 tokens | no disponible | no disponible |
| Licencia | unknown | unknown | no disponible |
| Formato | safetensors MLX | no disponible | no disponible |
| Rendimiento en benchmarks | no publicado | no publicado | no disponible |

## Limitaciones y advertencias

- Licencia desconocida: el repositorio declara "license: unknown" y el modelo base tampoco especifica licencia. No hay base jurídica clara para uso comercial; es imprescindible contactar con el publicador o con Enterprise-AI antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no existen datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, ni para el modelo base ni para esta conversión. Las únicas cifras disponibles son proyecciones de velocidad del propio autor.
- Riesgo de alucinación elevado: con 0,63 B de parámetros, la capacidad de razonamiento, el conocimiento factual y la fidelidad a instrucciones complejas son limitados por diseño. No es adecuado para tareas de alta precisión sin verificación humana.
- Bucles de generación: el propio autor advierte de la necesidad de configurar los stop tokens (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) en LM Studio y Ollama para evitar repeticiones infinitas. Sin esta configuración, el modelo puede no detenerse correctamente.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni sobre la calidad en castellano. Se debe evaluar empíricamente antes de asumir un rendimiento multilingüe.
- Compatibilidad restringida a Apple Silicon: no hay pesos GGUF, PyTorch ni safetensors estándar de transformers. Migrar a CUDA, servidores x86 o GPUs dedicadas exige partir del modelo base y reconvertir.
- Procedencia poco documentada: no se detalla el dataset, el proceso de destilación, los hiperparámetros de entrenamiento ni las evaluaciones de sesgo. Existe un riesgo de sesgos no caracterizados y de contaminación de datos desconocida.
- Metadatos inconsistentes: las fechas de creación y actualización indican 2026-09-22, lo que resulta anómalo y sugiere un posible error de registro. El repositorio tiene 255 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Conversión no verificada por terceros: al ser un artefacto de conversión de un usuario individual, la equivalencia funcional con el modelo base no está auditada de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-16bit
- Modelo base: https://huggingface.co/Enterprise-AI/eai-distill-0.5b
- Variante 4-bit: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-8bit
- Perfil del autor de la conversión: https://huggingface.co/SirSahOl
- Repositorio de MLX (Apple): https://github.com/ml-explore/mlx
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a documentación de Google Maps y no guardan relación con la ficha. No se han encontrado papers, blogs ni demos adicionales asociados al modelo.
