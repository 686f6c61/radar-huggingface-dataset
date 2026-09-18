# NovaeonStudio/Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp

## Resumen

Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp es una cuantización y reempaquetado para Apple Silicon del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicada por NovaeonStudio. Se trata de un transformer denso de 27.781.427.952 parámetros (unos 27,8 mil millones) con arquitectura híbrida `qwen3_5` —atención lineal GatedDeltaNet intercalada con atención completa— que conserva el codificador de visión y una cabeza nativa de predicción multi-token (MTP). El repositorio incluye un único artefacto en formato nativo de MLX (librería `mlx`), cuantizado en oQ8 con unos 8,59 bits por peso efectivos, 28,4 GB en disco y 30,9 GB de repositorio.

El modelo resuelve un problema muy concreto: disponer de un 27B denso multimodal, descensurado y con razonamiento sólido que sea usable de forma interactiva en un Mac. La palanca es la cabeza MTP, que sobrevive a la cuantización de 8 bits: según las mediciones del autor en un Apple M5 Max de 128 GB, activa la decodificación especulativa y eleva el throughput de 12,2 a 26,2 tokens/s (+115 %) con `draft-6`. El modelo base fue descensurado con la herramienta Heretic (ARA) sin reentrenamiento destructivo; la model card del base reporta 0/100 rechazos con divergencia KL de 0,0535.

Es relevante ahora porque combina tres elementos poco habituales en un mismo artefacto: contexto nativo de 262.144 tokens, visión preservada y una política de rechazo efectivamente eliminada, todo ello empaquetado para inferencia local en hardware de consumo de gama alta (memoria unificada), sin depender de APIs externas. El coste de esa combinación es una validación todavía muy limitada: 0 descargas y 1 like en el momento de redactar esta ficha, y benchmarks que pertenecen al modelo base, no a este repack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido `qwen3_5`: GatedDeltaNet (atención lineal) + atención completa intercalada, con codificador de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (≈27,8 mil millones), denso |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8 de oMLX: 8 bits casi uniforme, ~8,59 bpw efectivos, con tensores sensibles y de router en float16. No se publican variantes GGUF, AWQ, GPTQ ni de 4 bits |
| Idiomas soportados | en (inglés). No se declaran otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato nativo de MLX (librería `mlx`) |
| Tamano del repositorio | 30,9 GB (28,4 GB de pesos cuantizados en disco, según el autor) |
| Cabeza MTP | Nativa, `mtp_num_hidden_layers: 1`, 29 tensores `mtp.*` preservados en oQ8 |
| Modos de razonamiento | Tres: xhigh (por defecto), medium y low, según la model card del modelo base |
| Alineacion | Descensurado mediante Heretic ARA (sin rechazos) |
| Pipeline declarado | image-text-to-text (texto + imagen → texto) |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5` en variante densa híbrida: capas de atención lineal GatedDeltaNet combinadas con capas de atención completa intercaladas, más una torre de visión preservada del modelo base. El modelo incorpora además una cabeza nativa de predicción multi-token (MTP) con `mtp_num_hidden_layers: 1` y 29 tensores `mtp.*` que sobreviven al proceso de cuantización oQ8, algo que el autor destaca como poco frecuente en repacks de 8 bits. El contexto nativo es de 262.144 tokens y el pipeline es multimodal (imagen y texto como entrada).

Sobre el entrenamiento, la información disponible se limita a lo que describe el modelo base: un proceso multi-etapa de Cold-Fusion y un merge con Fable-Fusion-711, seguido de un tratamiento "TURBO" que reduce el gasto de tokens de razonamiento a aproximadamente entre 1/2 y 1/10 de lo que consumiría un modelo de razonamiento estándar. La descensura se realizó con Heretic mediante eliminación de direcciones de rechazo (ARA), sin reentrenamiento destructivo; la model card del base reporta 0/100 rechazos en su evaluación de etapa 1 con divergencia KL de 0,0535. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Este repositorio concreto es una cuantización (`base_model_relation: quantized`), no un reentrenamiento: no añade datos ni modifica la alineación, solo comprime pesos y los reempaqueta para oMLX.

## Capacidades

- Generación de texto y razonamiento en tres niveles configurables (xhigh por defecto, medium y low), heredados del modelo base.
- Modo de razonamiento con presupuesto reducido ("TURBO"): consume entre 1/2 y 1/10 de los tokens de razonamiento de un modelo thinking convencional, lo que hace viable el uso interactivo a 26 tokens/s.
- Visión: entrada de imagen y texto (pipeline image-text-to-text); la torre de visión se conserva desde el modelo base, aunque no se publican evaluaciones específicas de visión.
- Decodificación especulativa mediante la cabeza MTP nativa, funcional bajo cuantización de 8 bits, con una mejora medida del 115 % en decodificación.
- Generación descensurada: sin direcciones de rechazo, con 0 rechazos reportados en las sondas del autor sobre estos pesos cuantizados.
- Idiomas: únicamente inglés declarado en los metadatos.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado; el autor indica explícitamente que no ejecutó suites agénticas ni IFEval sobre esta build.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local en Mac para desarrollo de software: el modelo corre íntegramente en memoria unificada mediante oMLX, de modo que el código fuente y los datos del proyecto nunca salen de la máquina; los 262.144 tokens de contexto permiten cargar módulos completos o árboles de repositorio en una sola ventana.
- Análisis de capturas de pantalla y diagramas técnicos: al ser multimodal, puede interpretar diagramas de arquitectura, capturas de interfaces o gráficos de monitorización y razonar sobre ellos en inglés, útil para depuración de UI o revisión de documentación visual.
- Procesamiento por lotes de documentos largos: con 262k de contexto y 28,4 GB de pesos, es viable ejecutar resúmenes, extracción estructurada o preguntas sobre informes extensos sin trocear el documento, reduciendo pérdidas de coherencia entre fragmentos.
- Escritura creativa y de ficción sin filtros editoriales: la eliminación de direcciones de rechazo permite abordar narrativa con violencia, contenido adulto o temas sensibles sin bloqueos del modelo, siempre que el operador aplique sus propias políticas.
- Investigación en seguridad y alineación: sirve como sujeto de estudio para medir cómo afecta la descensura (ARA) al comportamiento del modelo, comparando las tasas de rechazo de este artefacto con las del base sin descensurar y evaluando la degradación introducida por la cuantización oQ8.
- Evaluación comparativa de cuantizaciones en Apple Silicon: dado que el repositorio publica curvas de throughput (MTP on/off, draft-6 y draft-8) y ajustes óptimos, es un banco de pruebas práctico para medir el impacto de la cuantización de 8 bits sobre una cabeza MTP funcional.
- Generación asistida con latencia interactiva: a 26,2 tokens/s con `draft-6`, encaja en flujos de autocompletado de texto largo, corrección de estilo o redacción iterativa donde la latencia percibida importa más que el throughput por lotes.
- Inferencia con requisitos de privacidad estrictos (sector legal, sanitario o investigación interna): al no requerir conectividad, el modelo permite tratar material confidencial en local; conviene, no obstante, revisar que la ausencia de rechazos no exponga a fuga de información sensible en las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio oQ8 concreto. El autor indica explícitamente que las cifras de precisión pertenecen al modelo base y que no ejecutó suites IFEval ni agénticas sobre este repack. Los datos siguientes corresponden al modelo base, medidos por Nightmedia en mxfp8 y mxfp4.

Comparativa ARC-Challenge en la misma clase (mxfp8), modelo base:

| Modelo (mxfp8) | ARC-C |
|---|---|
| Qwen3.8-27B-TURBO-Fable-Heretic (base de esta build) | 0,735 |
| Qwen3.6-27B | 0,647 |
| Qwen3.8-27B | 0,591 |
| Qwen3.6-35B-A3B | 0,581 |
| Qwen3.5-27B | 0,557 |

Barrido completo de siete benchmarks sobre el modelo base:

| Precisión | arc_c | arc_e | boolq | hellaswag | openbookqa | piqa | winogrande |
|---|---|---|---|---|---|---|---|
| mxfp8 | 0,735 | 0,882 | 0,917 | 0,832 | 0,530 | 0,837 | 0,785 |
| mxfp4 | 0,719 | 0,887 | 0,916 | 0,821 | 0,524 | 0,831 | 0,786 |

Rendimiento medido por el autor sobre estos pesos cuantizados (Apple M5 Max de 128 GB, oMLX, generación de 220 tokens, thinking desactivado):

| Configuración | Decodificación (tok/s) |
|---|---|
| MTP desactivado | 12,2 |
| MTP activado, draft-8 | 17,9 |
| MTP activado, draft-6 (óptimo) | 26,2 |

## Requisitos de hardware

- Pesos cuantizados: 28,4 GB en disco y 30,9 GB de repositorio, según el autor. Esa cifra marca el suelo de memoria necesaria para cargar el modelo.
- Hardware de referencia medido: Apple M5 Max con 128 GB de memoria unificada, único equipo sobre el que se publican cifras de rendimiento.
- VRAM estimada para GPU NVIDIA o AMD: no disponible. El repositorio es de MLX (Apple Silicon) y no incluye pesos en GGUF ni safetensors estándar para CUDA.
- GPU de consumo (RTX 4090, etc.): no hay ruta de despliegue soportada en este repositorio; no se publican cifras para CUDA.
- Cabe en consumer GPU: no aplica a este artefacto; sí cabe en Mac de gama alta con memoria unificada suficiente para alojar 28,4 GB de pesos más caché KV y el codificador de visión.
- Opciones de despliegue: oMLX (motor VLM de Apple MLX). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Ajustes óptimos publicados por el autor: `mtp_enabled` = true; `mtp_num_draft_tokens` = 6 (barrido de 6 y 8, con 6 óptimo); `qwen35_ane_prefill_enabled` = false (regresa el rendimiento de extremo a extremo cuando MTP está activo por sobrecarga de despacho).
- Latencia y throughput: 26,2 tok/s con draft-6, 17,9 tok/s con draft-8 y 12,2 tok/s con MTP desactivado, en generación de 220 tokens con thinking desactivado. No se publican cifras de prefill ni de latencia a primer token.
- La model card se interrumpe en la fila de ajustes relativa a `turboquant_kv_enabled` / `turboquant_kv_bits`, por lo que el resto de la configuración óptima de caché KV no está documentada.

## Comparativa con modelos similares

La información disponible solo permite comparar ARC-Challenge y clase de tamaño, no parámetros, contexto ni licencia de las alternativas. Las cifras pertenecen al modelo base en mxfp8.

| Modelo | Parámetros | Contexto | ARC-C (mxfp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp (esta build) | 27,8 mil millones (denso) | 262.144 | No medido en este repack; 0,735 en el base | apache-2.0 | HuggingFace, formato MLX |
| Qwen3.6-27B | no disponible | no disponible | 0,647 | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | 0,591 | no disponible | no disponible |
| Qwen3.6-35B-A3B | no disponible (MoE, según nomenclatura) | no disponible | 0,581 | no disponible | no disponible |
| Qwen3.5-27B | no disponible | no disponible | 0,557 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo descensurado de forma deliberada: los metadatos y la model card confirman cero rechazos. Puede producir contenido ofensivo, ilegal, peligroso o sexual sin filtro interno. En producción es obligatorio añadir una capa externa de moderación y definir políticas de uso.
- Idiomas: solo se declara inglés. El rendimiento en castellano no está documentado y no debería asumirse.
- Los benchmarks publicados se midieron sobre los pesos del modelo base en mxfp8 y mxfp4, no sobre este repack oQ8. La degradación introducida por la cuantización de 8 bits aplicada aquí no está cuantificada.
- No se han ejecutado IFEval ni suites agénticas sobre esta build, tal como reconoce el propio autor. No hay evidencia publicada sobre tool calling, uso agéntico ni fiabilidad multi-paso.
- Validación comunitaria prácticamente nula: 0 descargas y 1 like en el momento de redactar la ficha. Las cifras de throughput y las sondas de rechazo provienen del autor, no de terceros independientes.
- Dependencia de plataforma: los pesos están en formato nativo de MLX y requieren oMLX sobre Apple Silicon. No hay ruta de despliegue documentada para CUDA, ROCm ni aceleradores no Apple.
- Riesgo de alucinación: inherente a la familia y no medido en este artefacto; la ausencia de evaluaciones de factualidad impide acotarlo.
- Visión preservada pero no evaluada: no se publican métricas de comprensión de imagen, por lo que la calidad del componente multimodal es desconocida.
- Licencia apache-2.0 en este repositorio, pero conviene verificar la cadena completa de modelos base y merges intermedios antes de un uso comercial, ya que la descensura mediante Heretic no altera las obligaciones de atribución de los pesos originales.
- La model card está truncada en la sección de ajustes óptimos, de modo que parte de la configuración recomendada (parámetros de cuantización de caché KV) no es recuperable desde la información disponible.
- Build muy reciente y con un único artefacto publicado: no hay historial de versiones ni parches que permitan juzgar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Qwen3.8-27B-TURBO-Fable-Heretic-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- oMLX (motor de inferencia): https://github.com/jundot/omlx
- Heretic (descensura mediante ARA): https://github.com/p-e-w/heretic
- Novaeon.Studio: https://novaeon.studio
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (paper, blog o demo adicionales): no disponible.
