# nafiullah/finetuned-qwen3-vl-2b

## Resumen

`nafiullah/finetuned-qwen3-vl-2b` es un repositorio de HuggingFace que documenta un proyecto de ajuste fino (fine-tuning) sobre el modelo vision-lenguaje `Qwen/Qwen3-VL-2B-Instruct`. Lo publica el autor identificado como nafiullah, dentro del proyecto Drishti de Team PothChola: unas gafas inteligentes destinadas a personas ciegas y con baja visión en Bangladesh. El objetivo declarado es dotar al modelo base de tres capacidades concretas en bengalí (bangla): descripción de escenas, reconocimiento de billetes de taka bangladesíes y lectura de envases de medicamentos.

Es importante aclarar qué es y qué no es este repositorio. No contiene pesos ajustados: incluye una guía paso a paso de fine-tuning con LoRA (`FINETUNING.md`), un script de entrenamiento (`scripts/train_lora.py`, basado en transformers + peft), un script de preparación de datos (`scripts/prepare_data.py`), un ejemplo del formato de datos (`data/sample.jsonl`) y un `requirements.txt`. El propio autor indica que la guía y los scripts son un punto de partida y que no se han ejecutado de extremo a extremo, y que todavía no se publican pesos ajustados.

Por tanto, se trata de un andamiaje metodológico y de datos, no de un modelo desplegable. El pipeline declarado es image-text-to-text, los idiomas declarados son bengalí e inglés y la licencia indicada es Apache 2.0. El repositorio registra 0 descargas y 0 "likes", y fue creado y actualizado el 16 de octubre de 2026 (ambas marcas de tiempo separadas por un segundo), sin actividad posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para este repositorio (no publica pesos ni configuración). El modelo base es un modelo vision-lenguaje identificado como `Qwen/Qwen3-VL-2B-Instruct`, sin más detalle arquitectónico en la información proporcionada |
| Parametros totales | no disponible de forma verificada. El identificador del modelo base sugiere 2.000 millones de parámetros, dato no confirmado en la información disponible |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. La model card menciona que el modelo base se "cuantiza para el teléfono", pero no especifica formato ni niveles de cuantización |
| Idiomas soportados | bengalí (bn) e inglés (en), según los metadatos del repositorio |
| Licencia | Apache 2.0 (declarada en el repositorio; la licencia del modelo base no se detalla en la información proporcionada) |
| Formato de pesos | no disponible: no hay pesos publicados en el repositorio |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base más allá de su identificador (`Qwen3-VL-2B-Instruct`), que sitúa la familia en el terreno de los modelos vision-lenguaje ("VL"). No se detalla si se trata de un transformer denso con codificador visual, ni el mecanismo de fusión multimodal, ni el esquema de atención. Tampoco se especifican la longitud de contexto, la resolución de imagen de entrada ni el tokenizador.

En cuanto al entrenamiento, el repositorio define un procedimiento de ajuste fino supervisado mediante LoRA sobre el modelo base, implementado con las librerías `transformers` y `peft`. El flujo previsto es: etiquetado de imágenes, construcción de un JSONL de entrenamiento con `scripts/prepare_data.py`, y entrenamiento con `scripts/train_lora.py`. Los tres dominios objetivo declarados son descripción de escenas en bengalí, reconocimiento de billetes de taka y lectura de envases de medicamentos. No se indica el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni hiperparámetros de LoRA (rango, alpha, capas objetivo). Tampoco se documenta ninguna innovación técnica propia: el valor del repositorio está en la guía reproducible, no en contribuciones arquitectónicas.

## Capacidades

Debe subrayarse que las capacidades siguientes son objetivos declarados del ajuste fino pendiente, no capacidades verificadas de un artefacto publicado:

- Descripción de escenas en bengalí para asistencia a personas ciegas o con baja visión.
- Reconocimiento de billetes de taka bangladesíes (denominación a partir de imagen).
- Lectura de envases y prospectos de medicamentos de fabricación bangladesí.
- Procesamiento image-text-to-text (entrada de imagen más texto, salida de texto), heredado del pipeline declarado.
- Funcionamiento bilingüe bengalí-inglés, según los metadatos de idioma.
- Ejecución en teléfono mediante cuantización del modelo base, según la model card (formato y metodología no especificados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito ("thinking"), visión de vídeo o audio: no disponible en la información proporcionada.

## Casos de uso

Los casos siguientes se derivan del propósito declarado del proyecto. Todos ellos requieren completar el fine-tuning y publicar pesos, algo que hoy no ha ocurrido.

- Asistencia a personas ciegas en exteriores: el modelo, integrado en las gafas Drishti, describiría en bengalí la escena capturada por la cámara (obstáculos, personas, entorno) para guiar al usuario. Es el caso de uso central del proyecto y justifica el ajuste específico en bangla en lugar de usar un modelo multilingüe genérico.
- Identificación de billetes de taka: un usuario podría fotografiar un billete y recibir su denominación en voz alta. Es un caso sensible a errores, ya que una confusión entre denominaciones tiene consecuencias económicas directas para el usuario.
- Lectura de medicamentos: el modelo leería el nombre, la dosis y las instrucciones de un envase o prospecto bangladesí y los verbalizaría. Este escenario exige validación humana o doble comprobación por el riesgo sanitario asociado.
- Despliegue en teléfono de gama media: la cuantización del modelo de 2.000 millones de parámetros permitiría inferencia local sin conexión, algo crítico en zonas de Bangladesh con conectividad limitada o costosa.
- Anotación y aumento de datos en bangla: los scripts de preparación de datos (`prepare_data.py`) y el formato JSONL de ejemplo sirven como plantilla para construir corpus etiquetados de imagen-texto en bengalí, un recurso escaso.
- Evaluación comparativa de modelos vision-lenguaje en bengalí: un conjunto de evaluación construido con este flujo permitiría medir de forma reproducible la calidad de distintos VLM en tareas de accesibilidad en este idioma.
- Punto de partida para otros fine-tunes LoRA: la guía `FINETUNING.md` y el script de entrenamiento son reutilizables para adaptar modelos VL pequeños a otros dominios de nicho (documentos, señales de tráfico, productos locales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de ningún tipo (ni MMLU, ni tareas de visión como VQAv2 o TextVQA, ni evaluaciones específicas en bengalí) y no se publican pesos con los que reproducir una medición.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas derivadas del tamaño indicado en el nombre del modelo base (2.000 millones de parámetros) y no han sido verificadas para este repositorio, que no publica pesos:

- Peso de los pesos en FP16/BF16: aproximadamente 4-5 GB (2 bytes por parámetro).
- Peso en INT8: aproximadamente 2-2,5 GB.
- Peso en INT4: aproximadamente 1,2-1,5 GB, más el consumo de memoria de activaciones y caché KV.
- A estos valores hay que sumar el coste del codificador visual y de la caché KV, que dependen de la resolución de imagen y de la longitud de contexto; ambos datos no están disponibles.
- GPU consumer: cualquier tarjeta con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) debería manejar FP16 sin margen holgado; una RTX 4090 (24 GB) o una A100/H100 lo hacen con amplio margen y permiten lotes mayores.
- Despliegue en móvil: viable en principio con cuantización INT4, pero el rendimiento real y la pérdida de precisión en lectura de texto fino (medicamentos, billetes) no están documentados.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI serían aplicables si existieran pesos en GGUF o safetensors, pero actualmente no hay ningún artefacto desplegable en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Pesos publicados | Notas |
|---|---|---|---|---|---|---|
| `nafiullah/finetuned-qwen3-vl-2b` | no disponible (base de ~2.000 M según identificador) | no disponible | bn, en | Apache 2.0 | No | Solo guía y scripts de fine-tuning; 0 descargas |
| `Qwen/Qwen3-VL-2B-Instruct` (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Sí (es el modelo base referenciado) | Punto de partida del ajuste |
| Alternativas de tamaño similar de la categoría VLM pequeña (p. ej. SmolVLM, Moondream) | no disponible | no disponible | no disponible | no disponible | no disponible | No se aporta ningún dato verificado sobre ellas en la información disponible |

No es posible establecer una comparación cuantitativa fiable: no hay benchmarks publicados del modelo ajustado ni especificaciones detalladas del modelo base en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: hoy no es un modelo utilizable, sino una plantilla de trabajo.
- El propio autor indica que la guía y los scripts no se han ejecutado de extremo a extremo; no hay evidencia de que el procedimiento funcione tal cual.
- Cero descargas y cero "likes": no hay validación por parte de la comunidad ni informes de terceros.
- No hay benchmarks ni métricas de ningún tipo, por lo que se desconoce la calidad real en las tareas objetivo.
- Dominio de alto riesgo: el reconocimiento de billetes y la lectura de medicamentos para personas con discapacidad visual pueden causar daños económicos o sanitarios si el modelo falla. Cualquier despliegue en producción exige verificación humana, doble comprobación o umbrales de confianza explícitos.
- Riesgo de alucinación: los VLM pequeños tienden a inventar texto en imágenes borrosas o con poca iluminación, un escenario frecuente en el uso en exteriores con gafas.
- La cuantización para teléfono puede degradar precisamente la lectura de texto fino (dosis, números de serie, denominaciones), que es la tarea crítica del proyecto.
- Sesgo probable hacia el bengalí y el inglés, con cobertura nula de otras lenguas; dentro del bengalí, el rendimiento dependerá de la variedad dialectal y de la tipografía de los datos de entrenamiento.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, incluido el ajuste derivado; conviene verificar de forma independiente la licencia y las condiciones del modelo base antes de explotarlo comercialmente, ya que no se detallan en la información proporcionada.
- Los datos de entrenamiento y su procedencia no se documentan (consentimiento, licencias de las imágenes, privacidad de las personas fotografiadas), lo que supone un riesgo de cumplimiento si el proyecto se publica.
- La utilidad del ajuste para el proyecto Drishti no está demostrada: sin métricas en bengalí, no puede afirmarse que supere al modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nafiullah/finetuned-qwen3-vl-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Archivos referenciados en la model card (dentro del repositorio): `FINETUNING.md`, `scripts/train_lora.py`, `scripts/prepare_data.py`, `data/sample.jsonl`, `requirements.txt`
- Paper, blog, repositorio de código externo o demo: no disponible en la información proporcionada.
