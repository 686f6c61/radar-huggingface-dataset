# mradermacher/ScreenHighlighterRL-2B-i1-GGUF

## Resumen

ScreenHighlighterRL-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo mustafaah/ScreenHighlighterRL-2B, un modelo de visión-lenguaje de aproximadamente 2B parámetros construido sobre la familia Qwen3-VL y ajustado mediante aprendizaje por refuerzo con GRPO para la tarea de resaltado de elementos en pantalla (screen highlighting). La cuantización la publica mradermacher, un autor habitual de versiones GGUF de modelos abiertos, y se distribuye bajo licencia Apache-2.0.

El modelo resuelve un problema concreto: interpretar capturas de pantalla y localizar o resaltar regiones de interés (elementos de interfaz, texto, controles), una capacidad directamente aplicable a agentes de automatización de interfaz gráfica, pruebas de QA y accesibilidad. Su relevancia actual radica en el auge de los agentes GUI, donde un modelo pequeño y cuantizable permite ejecutar tareas de comprensión visual de pantalla en hardware modesto.

La arquitectura subyacente es la de Qwen3-VL (vision-language transformer), con un total de 516.292 parámetros reportados en los metadatos de safetensors del repositorio, un dato que no coincide con el tamaño nominal "2B" que aparece en el nombre del modelo. La longitud de contexto, el volumen de datos de entrenamiento y los detalles del proceso GRPO no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen3-VL |
| Parametros totales | 516.292 (reportado en metadatos safetensors del repositorio; el nombre del modelo indica 2B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-VL de aproximadamente 2B parámetros, por lo que emplea una arquitectura transformer de visión-lenguaje con codificador visual y decodificador de lenguaje. Sobre esa base se aplicó un ajuste fino mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), una técnica que optimiza la política del modelo comparando respuestas dentro de un mismo grupo para mejorar tareas con recompensa verificable, en este caso orientadas al resaltado de elementos de pantalla.

No se detalla en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de RLHF o DPO más allá del proceso GRPO indicado en las etiquetas. Tampoco se especifican innovaciones técnicas particulares (decodificación especulativa, atención lineal, etc.) ni los hiperparámetros del entrenamiento por refuerzo.

## Capacidades

- Comprensión de capturas de pantalla e identificación de regiones o elementos relevantes (screen highlighting).
- Generación de texto y descripciones a partir de entradas visuales, al tratarse de un modelo vision-language.
- Procesamiento de instrucciones multimodales (imagen + texto) en inglés.
- Capacidad de localización de elementos de interfaz, útil como componente de agentes GUI.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.
- Cobertura multilingüe: limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Automatización de interfaces gráficas (agentes GUI): el modelo puede analizar capturas de pantalla y resaltar o localizar los elementos sobre los que debe actuar un agente, sirviendo como módulo de percepción dentro de un pipeline de automatización.
- Pruebas de QA y regresión visual: integrado en suites de test, permite detectar y señalar regiones de la interfaz que cambian entre versiones o que contienen errores, apoyándose en su capacidad de resaltado.
- Anotación y etiquetado de datasets de UI: se puede usar para preetiquetar capturas de aplicaciones y acelerar la creación de conjuntos de datos de elementos de interfaz para entrenar otros modelos.
- Accesibilidad: ayuda a generar descripciones o resaltados de elementos de pantalla que asistan a usuarios con discapacidad visual en la navegación de aplicaciones.
- Automatización robótica de procesos (RPA): combinado con OCR y control de entrada, el modelo identifica visualmente los controles a pulsar en flujos de trabajo repetitivos.
- Documentación y soporte técnico: a partir de una captura de pantalla del usuario, el modelo puede resaltar el botón o menú relevante y facilitar guías visuales paso a paso.
- Investigación en aprendizaje por refuerzo multimodal: sirve como caso de estudio reproducible de ajuste con GRPO para tareas de grounding visual de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web asociada no devolvió resultados relevantes sobre el modelo (los enlaces encontrados corresponden a foros de asistencia de telefonía en francés, sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño nominal de 2B parámetros, orientativa): aproximadamente 0,7-1,0 GB en Q2_K, 1,2-1,5 GB en Q4_K_M, 1,7-2,0 GB en Q6_K y 2,1-2,5 GB en Q8.
- Al ser un modelo de visión, se requiere además el fichero mmproj correspondiente, que añade consumo de memoria; dicho fichero, si existe, se distribuye en el repositorio estático (mradermacher/ScreenHighlighterRL-2B-GGUF).
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090; también es viable en GPUs de datacenter (A100, H100) aunque sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM para las cuantizaciones habituales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; requiere soporte de mmproj para las capacidades de visión.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScreenHighlighterRL-2B (este modelo) | ~2B (nombre) / 516.292 (metadatos) | no disponible | apache-2.0 | GGUF, safetensors | Especializado en screen highlighting vía GRPO |
| Qwen2-VL-2B (referencia de la misma familia) | ~2B | 32K (dato público general) | apache-2.0 (variante 2B) | safetensors, GGUF | Modelo vision-language generalista, sin ajuste específico de resaltado |
| SmolVLM (variantes ~2B) | ~2,2B | no disponible en la información aportada | apache-2.0 | safetensors, GGUF | Vision-language compacto orientado a eficiencia |
| InternVL2-2B | ~2B | no disponible en la información aportada | MIT (dato público general) | safetensors, GGUF | Vision-language generalista |

Nota: los datos de los modelos comparativos proceden de conocimiento público general y no de la información de búsqueda proporcionada; los campos marcados como no disponibles no se han verificado con fuentes en esta ficha.

## Limitaciones y advertencias

- Modelo especializado: su ajuste con GRPO está orientado al resaltado de pantalla, por lo que su rendimiento en tareas generales de lenguaje o visión puede ser inferior al de un Qwen3-VL base sin ajustar.
- Idioma: la única lengua declarada es el inglés, lo que limita su uso directo en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo vision-language, puede localizar o describir incorrectamente elementos de una captura, especialmente en interfaces densas o con baja resolución.
- Discrepancia en el recuento de parámetros: el valor de safetensors (516.292) no concuerda con el tamaño nominal "2B" del nombre, lo que conviene verificar antes de dimensionar el hardware.
- Estado del repositorio: el repositorio de cuantización muestra 0 descargas, 0 likes y un tamaño de 0,0 GB, y la tabla de ficheros solo lista el fichero imatrix (0,1 GB); no se confirma la disponibilidad efectiva de los ficheros GGUF finales en el momento de esta ficha.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datasets de entrenamiento, no detalladas aquí.
- Fichero mmproj: para usar la capacidad de visión es necesario el fichero mmproj, que se distribuye en el repositorio estático; su disponibilidad no se confirma en la información aportada.
- Fecha de creación reportada: 2026-09-15, posterior a la fecha habitual de publicación; conviene verificar la vigencia de los metadatos.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/ScreenHighlighterRL-2B-i1-GGUF
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/ScreenHighlighterRL-2B-GGUF
- Modelo base: https://huggingface.co/mustafaah/ScreenHighlighterRL-2B
- Página resumen de mradermacher para este modelo: https://hf.tst.eu/model#ScreenHighlighterRL-2B-i1-GGUF
- Solicitudes y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper o blog del modelo: no disponible en la información proporcionada.
