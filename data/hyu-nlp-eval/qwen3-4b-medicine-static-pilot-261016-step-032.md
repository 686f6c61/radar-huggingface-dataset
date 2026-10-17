# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-032

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-032` es un ajuste fino experimental publicado por el usuario HYU-NLP-EVAL sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un checkpoint intermedio (paso 32) de una ejecución de entrenamiento identificada como `261016_medicine_static_pilot`, con semilla 11, orientada a tareas del ámbito médico. El repositorio contiene únicamente un export en BF16 para Transformers y una carpeta `original_checkpoint/` con los ficheros nativos del entrenamiento en veRL/FSDP, sin documentación adicional sobre el conjunto de datos ni sobre los objetivos de la ejecución.

Por su naturaleza, no es un modelo de producción: es un artefacto de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha, y con una model card de tres líneas que no describe capacidades, datos de entrenamiento ni evaluación. Su interés es doble: por un lado, ilustra el flujo de publicación de checkpoints intermedios de pipelines de RL con veRL + FSDP; por otro, permite reproducir y auditar una fase temprana de ajuste sobre un modelo denso de 4.022 millones de parámetros con licencia Apache 2.0.

La arquitectura subyacente es la del Qwen3-4B-Instruct-2507, un transformer decoder-only denso (no MoE) que, según la documentación pública de su modelo base, soporta una ventana de contexto nativa de 262.144 tokens. Cualquier uso clínico o sanitario requiere validación independiente, ya que no consta evaluación, certificación ni regulación alguna asociada a este checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base Qwen3-4B-Instruct-2507; no es MoE |
| Parametros totales | 4.022.468.096 (según los pesos safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card del ajuste. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos, ampliables según su documentación |
| Tipos de cuantizacion | No disponible en el repositorio, que solo publica pesos BF16. Al compartir grafo con Qwen3-4B-Instruct-2507, es convertible a GGUF, AWQ o GPTQ con herramientas estándar, pero no hay cuantizaciones publicadas por el autor |
| Idiomas soportados | No disponible en la ficha del autor. El modelo base declara soporte multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers); `original_checkpoint/` con ficheros nativos veRL/FSDP |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Fecha de creacion | 2026-10-17 |
| Fecha de actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del ajuste, pero los pesos y el campo `base_model` sitúan el modelo como un derivado directo de Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 4.022 millones de parámetros, con attention agrupada por consultas (GQA), posición relativa tipo RoPE y embeddings de entrada/salida atados, según la arquitectura pública de la familia Qwen3. El repositorio raíz contiene un export en BF16 en formato safetensors, y la carpeta `original_checkpoint/` conserva los ficheros nativos de veRL/FSDP junto con metadatos del entrenamiento.

El único dato de entrenamiento disponible es el identificador de la ejecución (`261016_medicine_static_pilot`), el número de paso (32) y la semilla (11). El uso de veRL y FSDP indica un pipeline de ajuste por refuerzo distribuido con sharding de parámetros, pero no se especifican el conjunto de datos médico empleado, el número de tokens, la función de recompensa, si hubo SFT previo, DPO, RLHF u otro método, ni el régimen de hiperparámetros. La model card menciona que el checkpoint local se elimina únicamente después de verificar tamaños y hashes SHA256 remotos, lo que sugiere un control de integridad de artefactos, no una validación de calidad del modelo. El calificativo «pilot» y el paso 32 (muy temprano) apuntan a una prueba de viabilidad de un pipeline de RL más que a un modelo terminado.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base es de tipo instruct, por lo que se espera comportamiento de chat multi-turno.
- Ámbito médico declarado: la ejecución se denomina `medicine_static_pilot`, lo que indica que el ajuste se orientó a tareas del dominio sanitario, aunque no se detalla qué tareas concretas.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base Qwen3-4B-Instruct-2507, no verificadas para este checkpoint.
- Tool calling / function calling: no confirmado en la ficha. El modelo base de la familia Qwen3-Instruct-2507 admite llamada a herramientas, pero no hay evidencia de que este ajuste lo preserve.
- Agentes y razonamiento multi-paso: no confirmado ni evaluado en la información disponible.
- Capacidades multilingües: no declaradas para este ajuste; dependen del modelo base.
- Modo de pensamiento (thinking): el modelo base de la serie 2507 está diseñado como no-thinking por defecto; no hay confirmación para este checkpoint.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Auditoría de pipelines de RL para dominio médico: el repositorio permite inspeccionar un checkpoint intermedio de veRL/FSDP y compararlo con el modelo base para estudiar cómo evolucionan los pesos y las salidas en pasos tempranos.
- Investigación en ajuste por refuerzo sobre modelos pequeños: los 4,02 mil millones de parámetros permiten reproducir experimentos de RL en una única GPU de 24 GB o en un nodo pequeño, algo inviable con modelos de mayor tamaño.
- Estudio de estabilidad de checkpoints tempranos: al tratarse del paso 32, sirve para analizar degradación de formato, repeticiones o colapso de salida antes de que el entrenamiento converja.
- Evaluación comparativa de bases instruct: puede usarse como punto de comparación en arneses de evaluación (por ejemplo, preguntas médicas de opción múltiple) frente a Qwen3-4B-Instruct-2507 sin ajustar.
- Generación de prototipos de documentación clínica sintética en entornos de laboratorio: útil para generar borradores de texto médico no destinados a uso real, siempre bajo revisión humana y con datos anonimizados.
- Desarrollo de conjuntos de datos de evaluación en castellano para dominio sanitario: el modelo puede emplearse como generador de candidatos en un pipeline de anotación asistida, nunca como fuente de verdad clínica.
- Investigación sobre transferencia de licencia Apache 2.0: al ser un derivado de Qwen3-4B-Instruct-2507 con licencia permisiva, resulta adecuado para experimentos internos sin restricciones de redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni de ninguna otra evaluación, y el repositorio no contiene informes asociados. Tampoco hay comparaciones con el modelo base ni con checkpoints posteriores de la misma ejecución. Cualquier cifra de rendimiento que se atribuya a este modelo carece de respaldo documental.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,1 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 10 y 14 GB con contextos moderados.
- VRAM con cuantización de 8 bits: en torno a 4,5-5 GB de pesos, más overhead.
- VRAM con cuantización de 4 bits: en torno a 2,5-3,5 GB de pesos, lo que permite ejecución en GPUs de 8 GB con contexto reducido.
- GPUs recomendadas: A100 40/80 GB, H100 y L40S para servicio en BF16 con lotes grandes; RTX 4090, RTX 4080, RTX 3090 y A6000 para desarrollo local.
- Cabe en GPU de consumo: sí. Con BF16 en tarjetas de 16-24 GB (RTX 4090, RTX 4080, RTX 3090, RTX 5080) y con cuantización de 4 bits en tarjetas de 8 GB o superiores.
- Opciones de despliegue: vLLM, SGLang, Hugging Face Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), y llama.cpp u Ollama previa conversión a GGUF. También puede cargarse directamente con `transformers` para evaluación.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este checkpoint.
- Almacenamiento: 25,7 GB de repositorio, que incluyen el export BF16 y los ficheros nativos de veRL/FSDP con metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-032 | 4,02 B | No especificado en la ficha (base: 262.144 según su documentación) | Apache 2.0 | safetensors BF16 + checkpoint veRL/FSDP | Checkpoint experimental, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 tokens nativos, ampliables según el fabricante | Apache 2.0 | safetensors, GGUF y otros | Modelo base oficial, ampliamente distribuido |
| Qwen/Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens nativos (128.000 en variantes ampliadas) | Apache 2.0 | safetensors y derivados | Modelo oficial, muy desplegado |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF | Modelo oficial, con licencia no permisiva para ciertos usos |

La comparación se limita a parámetros, contexto declarado, licencia y disponibilidad, ya que no existen resultados de benchmarks publicados para el modelo objeto de esta ficha que permitan contrastar calidad. Cualquier comparación de rendimiento con las alternativas sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni validación clínica, ni métricas de seguridad publicadas para este checkpoint.
- Riesgo elevado de alucinación: es un ajuste temprano (paso 32) de una ejecución piloto; no hay evidencia de que se haya aplicado alineamiento posterior a ese paso ni corrección de hechos.
- Sesgos potenciales: al estar ajustado sobre datos de dominio médico no documentados, puede incorporar sesgos demográficos, clínicos o de estilo presentes en ese corpus, sin que exista análisis publicado.
- Uso clínico contraindicado: el modelo no es un producto sanitario, no está certificado ni cumple normativas de software médico; no debe emplearse para diagnóstico, triaje, prescripción ni consejo terapéutico.
- Confidencialidad de datos: no hay información sobre el origen del corpus de entrenamiento, por lo que no se puede descartar la presencia de datos sensibles o con derechos de terceros.
- Contexto real desconocido: aunque el modelo base admite 262.144 tokens, el ajuste podría haber degradado el comportamiento en ventanas largas; no se ha verificado.
- Idiomas no declarados: se desconoce el soporte efectivo fuera del idioma o idiomas predominantes en el corpus de ajuste.
- Licencia: Apache 2.0 permite uso comercial y redistribución, pero el autor no ofrece garantías de ningún tipo; procede citar también la licencia del modelo base que corresponda.
- Reproducibilidad limitada: se conocen la semilla (11), el paso (32) y el nombre de la ejecución, pero no los datos, la configuración ni el código, lo que dificulta reproducir el entrenamiento.
- Confusión de nombres: el autor `HYU-NLP-EVAL` y las búsquedas públicas no arrojan documentación adicional; no debe confundirse con entidades comerciales homónimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-032
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de la familia Qwen3: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
- Informe de evaluación o benchmark: no disponible en la información proporcionada
- Búsqueda web: no se han encontrado resultados relevantes; las consultas devolvieron únicamente páginas de fabricantes de automóviles, canales de vídeo y plataformas de streaming sin relación con el modelo
