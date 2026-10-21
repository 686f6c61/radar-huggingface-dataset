# itriedcoding/Satari-Code-Training

## Resumen

Satari-Code-Training es el repositorio de entrenamiento (no un modelo con pesos publicados) del proyecto Satari-Code, una iniciativa de un solo autor (`itriedcoding`) para ajustar por instrucciones un modelo de código de 1.500 millones de parámetros. El repositorio contiene un cuaderno de Google Colab, un script de línea de comandos y utilidades de validación que ejecutan un SFT con QLoRA de 4 bits sobre un dataset de 75.000 filas, con el objetivo declarado de publicar tres artefactos: el modelo fusionado en 16 bits (`Satari-Code-1.5B`), el adaptador LoRA (`Satari-Code-1.5B-LoRA`) y una cuantización GGUF `Q4_K_M` (`Satari-Code-1.5B-GGUF`).

Su relevancia es de tipo metodológico más que de rendimiento: documenta de forma explícita el coste real del entrenamiento (24 GB de estado en FP32 para 1.5B: 6 GB de pesos, 6 GB de gradientes y 12 GB de estados Adam) y demuestra que con QLoRA y una GPU T4 gratuita se puede completar un ciclo de 2 épocas sobre 75.000 filas en 5-9 horas, con reanudación automática mediante checkpoints cada 250 pasos. Es, por tanto, una plantilla reproducible de fine-tuning de bajo coste.

En el momento de redactar esta ficha, el repositorio no incluye pesos, no declara la arquitectura del modelo base (la referencia a la plantilla ChatML de Qwen sugiere una base de esa familia, sin confirmación del autor), no publica métricas de evaluación y registra 0 descargas y 0 likes. Cualquier uso en producción exige esperar a la publicación de los artefactos o reproducir el pipeline por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo final. El pipeline entrena una base de 1,5B parámetros con la plantilla ChatML de Qwen, lo que apunta a un transformer decoder-only de esa familia (no confirmado por el autor) |
| Parametros totales | 1.500 millones (tamaño objetivo declarado; los pesos no están publicados) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento: QLoRA de 4 bits (NF4 vía `bitsandbytes`). Salida publicada: GGUF `Q4_K_M`. El modelo fusionado se distribuye en 16 bits |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelo fusionado en 16 bits, adaptador LoRA (PEFT) y GGUF `Q4_K_M`. El card no explicita `safetensors`, aunque es el formato por defecto de las herramientas empleadas (Unsloth/TRL) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo base, solo el procedimiento de ajuste. El entrenamiento se plantea como un SFT con QLoRA: se congelan los pesos de la base, se cuantizan a 4 bits NF4 con `bitsandbytes` y se entrenan adaptadores de bajo rango con `peft`, orquestado mediante `trl` y optimizado con `unsloth`. La configuración por defecto del script es de 2 épocas, `batch-size 2` y `grad-accum 4` (batch efectivo de 8), sobre un dataset de 75.000 filas formateadas con la plantilla ChatML de Qwen. El propio autor incluye un `smoke_test.py` que ejecuta un forward y un backward reales sobre un modelo diminuto en CPU para verificar que la pérdida decrece antes de gastar GPU.

No hay información sobre la composición del dataset de 75.000 filas (procedencia, proporción de código frente a instrucciones generales, filtrado de licencias o deduplicación), ni sobre el uso de RLHF, DPO u otra fase posterior al SFT. Tampoco se documentan innovaciones técnicas más allá de la elección de QLoRA con Unsloth para reducir el consumo de memoria. El diseño del pipeline incluye reanudación tolerante a cortes: los checkpoints se suben al Hub cada 250 pasos y la celda de entrenamiento se reanuda automáticamente al volver a ejecutarse, lo que permite completar el run en varias sesiones gratuitas de Colab o dentro de las 30 horas semanales de GPU de Kaggle.

## Capacidades

Las capacidades descritas son las esperadas del pipeline, no habilidades verificadas del modelo, ya que los pesos no están publicados:

- Generación de código: el objetivo declarado del proyecto es un modelo de código de 1,5B ajustado por instrucciones sobre 75.000 ejemplos.
- Generación de texto y respuesta a instrucciones en inglés, idioma único declarado en los metadatos.
- Formato conversacional: el formateador de datos usa la plantilla ChatML de Qwen, por lo que el modelo resultante espera turnos con roles `system`/`user`/`assistant`.
- Tool calling / function calling: no disponible; el card no menciona soporte de herramientas ni esquemas de funciones.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Modo thinking explícito, visión o audio: no disponibles.
- Evaluación: el autor incluye `eval_quick.py` para generar una transcripción fija de revisión manual y recomienda `bigcode-evaluation-harness` para medir pass@k cuando existan los pesos. Rechaza explícitamente inventar cifras de benchmark.

## Casos de uso

- Autocompletado y generación de código en IDE: un modelo de 1,5B en GGUF `Q4_K_M` ocupa del orden de 1 GB y puede ejecutarse en local sobre CPU o GPU de gama baja, lo que lo hace apto para asistentes integrados en editores con requisitos de privacidad estrictos, siempre que se validen los pesos finales.
- Generación de tests unitarios: el ajuste sobre 75.000 filas orientadas a código permitiría producir pruebas a partir de firmas de funciones y docstrings; la verificación debe hacerse ejecutando la suite, no confiando en la salida del modelo.
- Documentación automática de funciones y módulos: el formato ChatML permite pasar el fragmento de código como turno de usuario y recibir docstrings o comentarios, un caso de uso de contexto corto que encaja con el tamaño del modelo.
- Replicación del pipeline para fine-tuning propio: el repositorio es directamente reutilizable como plantilla de QLoRA de bajo coste (Colab T4 o Kaggle T4 ×1) para adaptar cualquier base de 1,5B a un dominio concreto, con reanudación por checkpoints y publicación automatizada de modelo fusionado, adaptador y GGUF.
- Traducción de código entre lenguajes en tareas pequeñas: conversión de fragmentos acotados (por ejemplo, utilidades de Python a TypeScript) donde el contexto necesario cabe en unas pocas decenas de líneas; requiere revisión humana por la propensión de los modelos de 1,5B a inventar APIs.
- Base para un clasificador o enrutador de código: al ser un modelo pequeño y con licencia Apache-2.0, puede servir como componente para etiquetar fragmentos, detectar lenguaje o resumir diffs dentro de un pipeline mayor.
- Entorno educativo y de investigación: el repositorio documenta el coste real de memoria y compute del SFT, lo que lo convierte en material útil para enseñar QLoRA con cifras concretas en lugar de estimaciones genéricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que `eval_quick.py` no inventa cifras y que la medición de pass@k debe hacerse con `bigcode-evaluation-harness` una vez existan los pesos. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, ni cifras de latencia o throughput.

## Requisitos de hardware

- Entrenamiento (dato del autor): el estado en FP32 para 1,5B requiere aproximadamente 24 GB (6 GB de pesos, 6 GB de gradientes y 12 GB de estados Adam). Con QLoRA de 4 bits y `batch-size 2` + `grad-accum 4` se ejecuta en una única GPU T4 de 16 GB.
- Entrenamiento en hardware no GPU: descartado por el autor. Su máquina de referencia tiene 16 GB de RAM (unos 13 GB utilizables), sin CUDA y con ~66 GFLOPS; estima que un run mínimo de 10.000 millones de tokens tardaría del orden de 43 años a máxima velocidad sostenida.
- Plataformas gratuitas soportadas: Google Colab con runtime T4 (2 épocas sobre 75.000 filas en 5-9 horas, con cortes de sesión mitigados por checkpoints cada 250 pasos) y Kaggle con GPU T4 ×1 e internet activado (30 horas de GPU semanales, suficientes para un run completo).
- Inferencia (estimación a partir del tamaño, no publicada por el autor): en FP16 el modelo de 1,5B requiere del orden de 3 GB de VRAM más caché KV; en GGUF `Q4_K_M`, del orden de 1 GB. Cabe con holgura en tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o incluso en CPU para generación de baja concurrencia.
- Opciones de despliegue: `llama.cpp` u Ollama para el GGUF; vLLM o TGI para el modelo fusionado en 16 bits con mayor concurrencia. El repositorio no incluye configuraciones de servido ni cifras de latencia o throughput.
- Almacenamiento y ancho de banda: el pipeline sube checkpoints al Hub cada 250 pasos, por lo que conviene dimensionar la cuota de almacenamiento del repositorio de salida.

## Comparativa con modelos similares

La comparación es estructural: de Satari-Code-1.5B solo se conoce el tamaño objetivo y la licencia, no su rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Rendimiento |
|---|---|---|---|---|---|
| Satari-Code-1.5B | 1,5B (objetivo) | No disponible | Apache-2.0 | No publicados en el momento de la ficha | Sin benchmarks |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens nativos (extensible por YaRN) | Apache-2.0 | Pesos, GGUF y AWQ publicados | Ampliamente evaluado en HumanEval, MBPP y EvalPlus |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens | Licencia propia de DeepSeek (uso comercial permitido con condiciones) | Pesos publicados | Evaluado en HumanEval y MBPP |
| StarCoder2-3B | 3B | 16.384 tokens | BigCode OpenRAIL-M (con cláusulas de uso) | Pesos publicados | Evaluado en HumanEval, MBPP y CruxEval |

La diferencia práctica frente a las alternativas es la disponibilidad: los tres modelos comparables se pueden descargar y evaluar hoy, mientras que Satari-Code solo ofrece, por ahora, el procedimiento para generarlo. Si la base empleada es efectivamente Qwen2.5-Coder-1.5B, el resultado sería un derivado con la misma licencia Apache-2.0 y un ajuste orientado a instrucciones de código, pero sin evidencia publicada de mejora sobre el original.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio contiene únicamente el material de entrenamiento. Cualquier evaluación de capacidades es especulativa hasta que aparezcan `Satari-Code-1.5B`, el adaptador LoRA y el GGUF.
- Ausencia total de benchmarks: no se puede afirmar que el ajuste mejore a la base; el autor evita deliberadamente publicar cifras no medidas.
- Dataset no documentado: se desconoce la procedencia de las 75.000 filas, su filtrado de licencias, su deduplicación y la proporción de código real frente a datos sintéticos, lo que impide evaluar riesgos de contaminación o de reproducción de código con licencias incompatibles.
- Idioma: solo inglés declarado. El rendimiento en castellano no está documentado y, con 1,5B de parámetros, es previsible que sea sensiblemente inferior.
- Riesgo de alucinación de APIs: los modelos de 1,5B ajustados sobre código tienden a inventar funciones, parámetros y paquetes inexistentes; toda salida debe verificarse ejecutando tests.
- Licencia: el repositorio es Apache-2.0, pero la licencia del modelo derivado depende de la base utilizada. Si la base no fuese Apache-2.0, habría que revisar las condiciones antes de un uso comercial.
- Madurez del proyecto: 0 descargas y 0 likes, con creación y última actualización el mismo día (20 de octubre de 2026), lo que indica un artefacto recién publicado y sin validación de la comunidad.
- Entrenamiento en hardware gratuito: los cortes de sesión de Colab y las cuotas de Kaggle hacen que la reproducibilidad dependa del mecanismo de reanudación por checkpoints; un fallo en la subida al Hub puede invalidar el run.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/itriedcoding/Satari-Code-Training
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/itriedcoding/satari-code/blob/main/training/Satari_Code_SFT.ipynb
- Repositorio de código del proyecto (según la URL del cuaderno): https://github.com/itriedcoding/satari-code
- Artefactos de salida previstos: https://huggingface.co/itriedcoding/Satari-Code-1.5B, https://huggingface.co/itriedcoding/Satari-Code-1.5B-LoRA, https://huggingface.co/itriedcoding/Satari-Code-1.5B-GGUF
- Framework de evaluación recomendado por el autor: https://github.com/bigcode-project/bigcode-evaluation-harness
- Kaggle (alternativa de GPU T4): https://www.kaggle.com/code
- Nota: la búsqueda web realizada no devolvió ningún enlace relacionado con el modelo; los resultados obtenidos no son pertinentes y se han descartado.
