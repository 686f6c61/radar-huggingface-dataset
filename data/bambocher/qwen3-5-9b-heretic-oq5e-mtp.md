# bambocher/Qwen3.5-9B-heretic-oQ5e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ5e-mtp es una cuantizacion mixta del modelo Qwen3.5-9B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint resultante pesa 7,5 GB y contiene 9.653.104.368 parametros logicos distribuidos en tres componentes: el modelo de lenguaje (8,954B), un codificador de vision (0,456B) y una cabeza MTP (multi-token prediction) de 0,243B. La cuantizacion se ha realizado con la herramienta oQ de oMLX v0.7.3, aplicando precision mixta por tensor con un promedio efectivo de 6,219 bits por peso.

El modelo esta empaquetado en formato MLX, la libreria de Apple para ejecutar redes neuronales sobre silicio unificado (chips M-series). Esto lo orienta a inferencia local en Mac, no a despliegues en GPU NVIDIA. La presencia de una cabeza MTP sugiere soporte para decodificacion especulativa o prediccion de multiples tokens, una tecnica habitual para acelerar la generacion en modelos recientes de la familia Qwen.

La relevancia de esta ficha es acotada: se trata de una cuantizacion de terceros, sin model card detallada, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados. Cualquier evaluacion de calidad debe remitirse al modelo base Qwen3.5-9B, del que esta publicacion hereda capacidades y limitaciones, pero no hay informacion disponible en la documentacion proporcionada sobre el modelo original ni sobre el proceso "heretic" (presumiblemente un ajuste fino orientado a reducir rechazos o censura, aunque no se confirma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y torre de vision; pesos en formato MLX |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (76,813% de pesos), affine 6-bit grupo 64 (17,880%), affine 8-bit grupo 64 (0,224%), BF16 (5,083%); promedio 6,219 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 7,5 GB / 6,989 GiB |

Desglose por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 6,380 GB / 5,942 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,212 GB / 0,198 GiB |
| Total | 9,653B | 7,504 GB / 6,989 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio: `qwen3_5`, `mtp`, `oq`, `quantized`, `5-bit`. Se deduce que el modelo base pertenece a la familia Qwen3.5, con un transformer decoder convencional, una torre de vision de 0,456B parametros (lo que confirma capacidades multimodales de entrada de imagen) y una cabeza MTP de 0,243B parametros. La cabeza MTP es un modulo auxiliar que predice varios tokens futuros a la vez y suele emplearse para decodificacion especulativa o para acelerar la generacion autoregresiva.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otras fases de alineamiento, ni sobre el proceso "heretic" aplicado al modelo base. Tampoco se detalla el algoritmo exacto de cuantizacion mixta de oQ mas alla de la tabla de bits por tensor: se aplica precision 5-bit a la mayor parte de los pesos (76,8%), 6-bit a una fraccion relevante (17,9%) y se preservan en BF16 un 5,1% de los pesos, presumiblemente capas sensibles como embeddings, normalizaciones o la cabeza de salida. La eleccion de que tensores reciben mas bits no se documenta.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones especificas en esta publicacion.
- Procesamiento de vision: la presencia de una torre de vision de 0,456B parametros indica soporte de entrada de imagenes (comprension visual), sin que se detallen tareas concretas.
- Prediccion multi-token (MTP): la cabeza dedicada permite, en principio, decodificacion especulativa o generacion acelerada, aunque no se especifica el mecanismo de uso.
- Codigo y matematicas: no disponible en la documentacion; se asume herencia del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el peso de 7,5 GB permiten ejecutar el modelo en equipos con 16-24 GB de memoria unificada, cubriendo asistentes personales, resumen de documentos y generacion de texto sin conexion.
- Procesamiento de documentos con imagenes: la torre de vision permite extraer informacion de capturas, diagramas o documentos escaneados en un flujo local, util para automatizacion de oficina en entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones multimodales: al ser un checkpoint pequeno y autocontenido, sirve para validar pipelines de vision-lenguaje antes de migrar a modelos mayores o a infraestructura en la nube.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP puede emplearse para reducir la latencia en tareas de generacion larga, como redaccion de informes o traduccion, siempre que el runtime MLX lo soporte.
- Experimentacion con cuantizacion mixta: el checkpoint es un caso de estudio util para investigadores que evalúen el impacto de precisiones 5/6/8-bit por tensor en la calidad de salida frente al modelo en BF16.
- Asistente de codigo en local para desarrolladores con Mac: si el modelo base conserva las capacidades de codigo de la familia Qwen, podria integrarse en editores o terminales mediante runtimes MLX, sin enviar codigo a servicios externos.
- Evaluacion de variantes "heretic": util para estudiar como los ajustes finos orientados a modificar el comportamiento de rechazo afectan a la utilidad y seguridad del modelo en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este checkpoint, ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 6,989 GiB en disco; en inferencia se necesita espacio adicional para el KV cache y buffers de activaciones. Con contexto corto, un equipo con 16 GB de memoria unificada deberia poder cargarlo; con contextos largos, se recomienda 24 GB o mas.
- GPU/SoC recomendados: chips Apple M-series con memoria unificada de 16 GB o superior (M1 Pro, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No es compatible con CUDA de forma nativa por el formato MLX.
- GPUs consumer NVIDIA: no aplicable directamente; requeriria conversion a otro formato (GGUF, safetensors estandar) y perderia la ventaja del empaquetado MLX.
- Opciones de despliegue: runtime MLX (libreria `mlx` y `mlx-lm`), oMLX (herramienta del autor de la cuantizacion); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere mejoras de velocidad, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ5e-mtp (este) | 9,653B | no disponible | MLX safetensors, 6,219 bits/peso | no disponible | Cuantizacion de terceros, vision + MTP |
| Qwen3.5-9B (base, BF16) | ~9,6B (estimado) | no disponible | safetensors | no disponible | Referencia de calidad; sin cuantizar |
| Otras cuantizaciones MLX de la familia Qwen3.5 | no disponible | no disponible | MLX | no disponible | No se dispone de datos comparativos |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (mismo tamano o misma tarea) en parametros, contexto, rendimiento y disponibilidad. Los datos del modelo base Qwen3.5-9B no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base Qwen3.5-9B y del ajuste "heretic" antes de cualquier despliegue en produccion.
- Cuantizacion de terceros sin evaluacion: no hay benchmarks que cuantifiquen la perdida de calidad respecto al modelo en BF16; la precision 5-bit en el 76,8% de los pesos puede degradar tareas sensibles (matematicas, codigo, razonamiento largo).
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos: no disponibles; no se ha publicado informacion sobre evaluaciones de sesgo o seguridad.
- Comportamiento "heretic": el ajuste orientado a reducir rechazos puede aumentar la probabilidad de respuestas inapropiadas o inseguras en dominios sensibles; debe auditarse antes de exponerlo a usuarios finales.
- Compatibilidad limitada: el formato MLX restringe el despliegue a hardware Apple; no hay soporte documentado para CUDA, ROCm ni runtimes de servidor convencionales.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue equilibrado; conviene validar el idioma objetivo.
- Contexto no documentado: se desconoce la ventana maxima efectiva tras la cuantizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ5e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la informacion proporcionada
- Paper o blog del ajuste "heretic": no disponible
- Repositorio o demo adicional: no disponible
