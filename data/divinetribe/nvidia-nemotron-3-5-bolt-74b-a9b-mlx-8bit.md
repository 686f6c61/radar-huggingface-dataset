# divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit

## Resumen

Nemotron-3.5 Bolt 74B-A9B es un modelo multimodal (texto, imagen y vídeo) desarrollado por NVIDIA, distribuido originalmente en BF16 y convertido en este repositorio por el usuario divinetribe a formato MLX de 8 bits para su ejecución en Apple Silicon. Emplea una arquitectura híbrida denominada `nemotron_h_omni`, que combina capas Mamba2, capas de atención y capas MoE con un número de expertos distinto por capa, junto con un codificador visual RADIO. Cuenta con 74.885.081.096 parámetros totales y 9B activos (según el sufijo A9B de su denominación), lo que lo sitúa en la categoría de modelos dispersos de gran tamaño pero coste de inferencia contenido.

La relevancia de esta ficha reside en que el checkpoint original no es cargable con mlx-vlm estándar: el autor ha escrito e incluido un puerto del modelo (`nemotron_h_omni`) que replica fielmente los 28.725 tensores del checkpoint de NVIDIA, con verificaciones numéricas documentadas frente al código de referencia en fp32. Esto convierte al repositorio en una vía práctica para ejecutar localmente un modelo multimodal de 74B en un Mac de 128 GB, con velocidades declaradas de 37 a 41 tokens/s en un M5 Max.

El modelo soporta modo de razonamiento activable (`enable_thinking`), tool calling, OCR, comprensión de gráficos, vídeo con poda de tokens y contexto largo verificado hasta 128K tokens. La licencia de los pesos es OpenMDW 1.1, redistribuidos bajo los mismos términos que el modelo base de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida `nemotron_h_omni`: capas Mamba2 + atención + MoE (número de expertos variable por capa), con codificador visual RADIO |
| Parámetros totales | 74.885.081.096 |
| Parámetros activos | 9B (según denominación A9B; no se detalla el reparto exacto por capa) |
| Longitud de contexto | Verificado hasta 128K tokens (prueba de recuperación de número oculto a 32K y 128K) |
| Tipos de cuantización | 8-bit affine, group size 64; torre visual, proyector visual y cabeza de salida en bf16 |
| Idiomas soportados | No disponible (probados español, japonés y chino con respuestas correctas) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX), 1.863 tensores, ~81 GB en disco |
| Capas totales | 88 (solo 8 son de atención) |
| Caché KV a 128K | ~1 GB |
| Memoria en carga | ~81 GB; pico ~89 GB con vídeo de 90 s y ~91 GB a 128K de contexto |

## Arquitectura y entrenamiento

La arquitectura es híbrida y poco convencional: de las 88 capas totales, solo 8 son de atención, mientras que el resto combina capas Mamba2 y capas MoE con un número de expertos que varía por capa (resultado de una búsqueda tipo Puzzle, según la model card). Esta proporción reducida de atención explica que la caché KV a 128K ocupe apenas ~1 GB. El componente multimodal se resuelve con un codificador visual RADIO y un proyector hacia el espacio del modelo de lenguaje; no hay torre de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO; la model card remite al modelo base de NVIDIA para esos detalles. La innovación destacable de este repositorio no es el entrenamiento, sino la conversión: el autor implementó un modelo `nemotron_h_omni` para mlx-vlm y documenta verificaciones de fidelidad numérica frente al código de referencia en fp32 (coseno 0,99998 en la torre visual, 0,99995 en el proyector, ≥0,9993 en las 88 capas del modelo de lenguaje, 0,999997 en los logits finales con KL 0,00075 y coincidencia del top-1). Para vídeo se aplica poda de tokens de NVIDIA (0,7 por defecto, configurable con `video_pruning_rate=`), con coincidencia del 100% de la máscara de poda frente a la referencia.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Comprensión de imágenes: descripción de escenas, conteo de objetos, lectura de documentos y OCR (lectura exacta de los siete campos de una factura de prueba).
- Interpretación de gráficos: lectura exacta de los cinco valores de un gráfico de barras, incluidos máximo, mínimo y suma.
- Comprensión de vídeo: lectura de tarjetas numeradas en un clip de 12 s, descripción de movimiento, lectura del último fotograma numerado en 90 s / 180 fotogramas y localización de un fotograma concreto.
- Prompts con varias imágenes simultáneas, con respuestas diferenciadas por imagen ("Imagen 1: 3 círculos azules / Imagen 2: 5 triángulos verdes...").
- Tool calling / function calling: emisión de `<tool_call>` bien formado con argumentos correctos, tanto con pensamiento activado como desactivado, uso del resultado de la herramienta y omisión de herramientas cuando no son necesarias.
- Salida JSON válida al primer intento, sin bloque de código, con todos los campos correctos.
- Multilingüismo: respuestas correctas a preguntas en español, japonés y chino.
- Conversación multi-turno con imagen persistente (responde a partir de la imagen dos turnos después).
- Contexto largo: recuperación de información oculta a 32K y 128K tokens.
- Razonamiento matemático básico (problema del bate y la pelota resuelto correctamente: 0,05 $).

## Casos de uso

- **Atención al cliente multimodal:** el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas, facturas o fotos de producto; la ventana de 128K y la persistencia de la imagen entre turnos permiten resolver incidencias sin reiniciar el contexto.
- **Procesamiento de documentos y OCR en local:** lectura de facturas, formularios y tablas directamente en un Mac de 128 GB, sin enviar datos a la nube; la lectura exacta de campos verificada en la model card lo hace apto para flujos de extracción estructurada con salida JSON.
- **Análisis de vídeo para vigilancia o control de calidad:** con poda de tokens configurable (`video_pruning_rate`) puede procesar clips de hasta 180 fotogramas, leer marcadores numéricos y describir movimiento, útil para inspección de líneas de producción o revisión de grabaciones.
- **Agente local de código y terminal:** integrado en el proyecto Claude Code Local, el modelo actúa como agente que emite tool calls bien formados, usa los resultados de las herramientas y omite llamadas innecesarias, lo que permite automatizar tareas de sistema en Apple Silicon sin conexión.
- **Asistente de accesibilidad:** descripción de imágenes y vídeos en tiempo real (37-41 tokens/s en M5 Max) para personas con discapacidad visual, incluyendo conteo de objetos y localización de elementos concretos en fotogramas.
- **Extracción de datos de gráficos e informes:** lectura de valores de gráficos de barras y documentos financieros con salida JSON validada, para alimentar pipelines de análisis de datos internos.
- **Razonamiento asistido con contexto largo:** análisis de contratos, logs o transcripciones de hasta 128K tokens con modo de pensamiento activado, aprovechando la caché KV de ~1 GB que permite mantener sesiones largas con poca memoria adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo documenta pruebas funcionales cualitativas y métricas de fidelidad de la conversión:

| Prueba | Resultado declarado |
|---|---|
| Fidelidad de pesos (mapeo de tensores) | 28.725 tensores mapeados por nombre y forma, en ambas direcciones |
| Coseno torre visual vs fp32 | 0,99998 |
| Coseno proyector visual vs fp32 | 0,99995 |
| Coseno por capa del LM (88 capas) | ≥ 0,9993 |
| Coseno logits finales / KL | 0,999997 / 0,00075 |
| Coincidencia top-1 next token | Sí |
| Coseno embeddings de vídeo tras poda | 0,99981 |
| Coincidencia máscara de poda de vídeo | 100% de tokens |
| Velocidad de generación (M5 Max 128 GB) | 37-41 tokens/s |
| Procesamiento de prompt | 550-950 tokens/s con imágenes; ~755 tokens/s a 128K |
| Memoria pico | ~89 GB (vídeo 90 s), ~91 GB (128K contexto) |

## Requisitos de hardware

- **VRAM/ memoria unificada:** ~81 GB en carga; pico de ~89-91 GB según carga de vídeo o contexto. Requiere un Mac con 128 GB de memoria unificada.
- **GPU recomendadas:** Apple Silicon de gama alta con 128 GB (M5 Max citado en las pruebas). No es ejecutable en GPUs NVIDIA/AMD mediante este repositorio, al estar en formato MLX.
- **¿Cabe en GPU de consumo?** No en el sentido habitual: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48-80 GB sin cuantización adicional, y el formato MLX está orientado a Apple Silicon. En Mac, requiere 128 GB; no se documenta funcionamiento en configuraciones de 64 GB.
- **Despliegue:** mlx-vlm (versión 0.7.8 probada) con el puerto `install_port.py` incluido en el repo; no es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato. El proyecto Claude Code Local ofrece un servidor compatible con la API de Anthropic sobre MLX.
- **Latencia y throughput:** 37-41 tokens/s de generación; 550-950 tokens/s de procesamiento de prompt con imágenes y ~755 tokens/s a 128K, en M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5 Bolt 74B-A9B (este repo, MLX 8-bit) | 74,9B totales / 9B activos | 128K verificado | Texto, imagen, vídeo | OpenMDW 1.1 | MLX safetensors, Apple Silicon |
| NVIDIA Nemotron-3.5 Bolt 74B-A9B BF16 (base) | 74,9B totales / 9B activos | No disponible | Texto, imagen, vídeo | OpenMDW 1.1 | BF16, referencia original de NVIDIA |
| Alternativas de tamaño similar en MLX | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Requisito de memoria elevado:** necesita un Mac con 128 GB de memoria unificada; no es viable en equipos de 64 GB o menos según la información disponible.
- **Compatibilidad limitada:** mlx-vlm estándar no carga el modelo; es obligatorio ejecutar `install_port.py`, que modifica la instalación de mlx-vlm y registra el formato de chat. Hasta que mlx-vlm lo soporte de forma nativa, este paso es imprescindible.
- **Restricciones de entrada:** un mismo prompt acepta imágenes o vídeo, pero no ambos a la vez (igual que la referencia de NVIDIA). No hay torre de audio, por lo que no procesa sonido.
- **Vídeo:** solo se probaron clips de hasta 180 fotogramas; no se documenta comportamiento con clips más largos. La poda de tokens (0,7 por defecto) puede descartar información en escenas con detalles pequeños.
- **Riesgo de alucinación:** no se documentan tasas de alucinación ni evaluaciones de seguridad propias; la model card remite a las notas de sesgo y seguridad del modelo base de NVIDIA.
- **Sesgos:** no se detallan sesgos conocidos en la información disponible; deben consultarse en la model card del modelo base.
- **Idiomas:** no se publica una lista oficial de idiomas soportados; solo se verificaron español, japonés y chino en pruebas puntuales.
- **Licencia:** OpenMDW 1.1 (license_name: openmdw-1.1). Es una licencia "other", no OSI estándar; debe revisarse el texto completo en openmdw.ai antes de uso comercial. La conversión no altera el comportamiento ni la alineación del modelo original.
- **Producción:** el repositorio es una conversión comunitaria, no oficial de NVIDIA; la fidelidad numérica está documentada, pero la responsabilidad de validación en producción recae en el integrador. El rendimiento medido corresponde a un único hardware (M5 Max 128 GB) y puede variar en otros equipos Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-8bit
- Modelo base de NVIDIA (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12 de agentes locales: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
