# mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF

## Resumen

Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo base SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic. Se trata de un modelo derivado de la familia Qwen3.5 (etiqueta `qwen3_5` en los metadatos de repositorios relacionados), orientado a tareas de agente de terminal, generacion de codigo y contexto largo, segun las etiquetas publicadas en los repositorios hermanos del mismo autor. El repositorio contiene unicamente pesos cuantizados en multiples variantes (desde IQ1_S hasta Q6_K), generados con imatrix.

La relevancia de esta ficha es limitada por la escasez de informacion verificable: la model card del repositorio no incluye descripcion funcional, licencia, idiomas ni resultados de evaluacion, y el propio autor remite al modelo original de SolsticeAI. El dato de parametros totales registrado en la plataforma (6.789.424) es incompatible con el nombre del modelo (27B) y con el tamano del repositorio (0,0 GB), por lo que debe considerarse no fiable.

Se recomienda tratar esta ficha como un inventario de lo publicado y no como una evaluacion tecnica del modelo. Cualquier decision de despliegue deberia basarse en la model card del modelo original, no en este repositorio de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia `qwen3_5` en repositorios relacionados; transformer presumiblemente) |
| Parametros totales | no disponible (el nombre indica 27B; el campo de la plataforma indica 6.789.424, dato inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiqueta `long-context` en repositorios relacionados) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (etiquetas `English` y `Chinese` en repositorios relacionados) |
| Licencia | no disponible en este repositorio (los repositorios relacionados declaran apache-2.0) |
| Formato de pesos | GGUF (cuantizaciones con imatrix, `quantize_version: 2`, `output_tensor_quantised: 1`) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura del modelo base. Las etiquetas de los repositorios relacionados (`qwen3_5`, `Reinforcement Learning`, `recursive-self-improvement`, `terminal-agent`, `code`, `long-context`) sugieren una arquitectura transformer de la familia Qwen3.5 afinada mediante aprendizaje por refuerzo para tareas de agente de terminal y auto-mejora recursiva, pero no se dispone de detalles sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

Respecto al proceso de cuantizacion, la model card indica que se trata de cuantizaciones ponderadas con imatrix (`weighted/imatrix quants`) generadas por mradermacher a partir del modelo original de SolsticeAI, con `convert_type: hf` y `quantize_version: 2`. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia.

## Capacidades

- Generacion de texto y codigo: las etiquetas `code` y `terminal-agent` en repositorios relacionados apuntan a un uso orientado a programacion y operacion de terminal.
- Razonamiento multi-paso y agentes: la etiqueta `terminal-agent` sugiere soporte para tareas de agente; no confirmado en la documentacion de este repositorio.
- Contexto largo: etiqueta `long-context` en repositorios relacionados, sin cifra concreta disponible.
- Multilingue: etiquetas `English` y `Chinese` en repositorios relacionados; no hay datos sobre castellano.
- Tool calling / function calling: no disponible.
- Vision, audio o modo thinking: no disponible.
- Ajuste "uncensored" y "heretic": el nombre indica una variante sin censura, sin que se documente el metodo de ablacion aplicado.

## Casos de uso

- Asistente de terminal para operaciones en linea de comandos: el modelo esta etiquetado como `terminal-agent`, por lo que su uso previsto es interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell en entornos controlados.
- Generacion de codigo en pipelines de desarrollo: la etiqueta `code` sugiere utilidad para autocompletado y generacion de funciones, aunque sin benchmarks publicados no puede validarse su calidad frente a alternativas.
- Procesamiento de documentacion tecnica extensa: la etiqueta `long-context` indica que el modelo base esta disenado para ventanas amplias, adecuado para resumir repositorios o manuales, siempre que se confirme la longitud real de contexto.
- Experimentacion en investigacion sobre auto-mejora: la etiqueta `recursive-self-improvement` apunta a un caso de uso academico para estudiar bucles de mejora autonoma en agentes.
- Despliegue en hardware de consumo: las cuantizaciones de baja precision (IQ1_S, IQ2_XXS, Q3_K_S) permiten ejecutar un modelo nominal de 27B en GPU consumer mediante llama.cpp u Ollama, a costa de perdida de calidad.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece 24 variantes del mismo modelo, util para medir el impacto de cada nivel de cuantizacion en tareas de codigo.
- Escenarios sin filtros de contenido: la variante "uncensored" puede emplearse en investigacion sobre seguridad de modelos, siempre con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable por la inconsistencia en el numero de parametros. Para un modelo nominal de 27B, las cuantizaciones Q4_K_M requeririan del orden de 16-17 GB y las Q6_K alrededor de 22-23 GB, estimacion orientativa no confirmada por el autor.
- GPU recomendadas: no disponible. Para un 27B en Q4, una RTX 4090 (24 GB) o una A100 40 GB serian suficientes segun la estimacion anterior; no verificado.
- GPU consumer: las variantes IQ1_S, IQ2_XXS e IQ3_XXS podrian caber en GPU de 8-12 GB si el modelo es efectivamente de 27B; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requeririan conversion a safetensors y no estan documentados para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF | no disponible (nombre: 27B) | no disponible | no disponible | GGUF | Hugging Face |
| mradermacher/Terminal-RSI-27B-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Hugging Face |
| mradermacher/Terminal-RSI-27B-i1-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Hugging Face |
| SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia de datos: el campo de parametros de la plataforma (6.789.424) no concuerda con el nombre del modelo (27B) ni con el tamano del repositorio (0,0 GB); no debe usarse para planificar hardware.
- Ausencia de model card funcional: no hay descripcion de capacidades, limites ni metodo de entrenamiento en este repositorio.
- Licencia no declarada en este repositorio: los repositorios relacionados indican apache-2.0, pero la licencia del modelo original de SolsticeAI no aparece en la documentacion proporcionada; verificar antes de uso comercial.
- Variante "uncensored" y "heretic": el modelo ha sido modificado para reducir rechazos de contenido, lo que incrementa el riesgo de generar material danino, sesgado o inexacto sin advertencia.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no puede acotarse la fiabilidad en tareas de codigo o terminal, donde los errores tienen impacto directo.
- Idiomas: solo se documentan ingles y chino en repositorios relacionados; el rendimiento en castellano es desconocido.
- Cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS): degradacion significativa esperada en tareas de razonamiento y codigo.
- Fecha de creacion futura (2026-11-09): el registro presenta una marca temporal posterior a la fecha actual, lo que sugiere datos de plataforma no verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Terminal-RSI-27B-Unlocked-Uncensored-Heretic-i1-GGUF
- Modelo original: https://huggingface.co/SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic
- Repositorio relacionado (GGUF): https://huggingface.co/mradermacher/Terminal-RSI-27B-GGUF
- Repositorio relacionado (i1-GGUF): https://huggingface.co/mradermacher/Terminal-RSI-27B-i1-GGUF
- Listado de ficheros del repositorio i1-GGUF: https://huggingface.co/mradermacher/Terminal-RSI-27B-i1-GGUF/tree/main
- Paper referenciado en etiquetas: arxiv:2610.22192 (no verificado)
