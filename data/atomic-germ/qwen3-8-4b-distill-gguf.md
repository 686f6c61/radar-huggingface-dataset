# Atomic-Germ/Qwen3.8-4B-Distill-GGUF

## Resumen

Qwen3.8-4B-Distill-GGUF es la colección de cuantizaciones en formato GGUF publicada por Atomic-Germ sobre el modelo empero-ai/Qwen3.8-4B-Distill, desarrollado por Empero. Se trata de un modelo denso de 4.326.350.848 parámetros (unos 4,33 mil millones) obtenido mediante destilación de parámetros completos del modelo profesor Qwen3.8 2.4T A95B (un MoE de 2,4 billones de parámetros totales y 95 mil millones activos) sobre la arquitectura Qwen3.5-4B. El resultado es un modelo de razonamiento que hereda parte de la capacidad del profesor en un tamaño apto para hardware de consumo.

La relevancia práctica de esta publicación está en el formato: los pesos originales en BF16 ocupan 8,666 GB, mientras que las cuantizaciones Q4_K_M y Q5_K_M bajan a 2,783 GB y 3,161 GB respectivamente, lo que permite ejecutar el modelo en GPUs de 4–6 GB o incluso en CPU. La arquitectura subyacente es híbrida: la familia Qwen3.5 combina capas Gated DeltaNet con capas de atención completa en proporción de tres a uno, una innovación que exige compilaciones recientes de llama.cpp con soporte explícito de Qwen3.5 / Gated DeltaNet.

El modelo es un modelo de razonamiento: cada respuesta se abre con un bloque `<think>` que debe procesarse o eliminarse antes de mostrarla al usuario final. La model card reporta una mejora sustancial en MMLU CoT respecto al modelo base Qwen3.5-4B (+0,199) y un ligero retroceso en GSM8K CoT (−0,065). El repositorio GGUF no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: capas Gated DeltaNet combinadas con capas de atención completa (3 capas Gated DeltaNet por cada capa de atención completa) |
| Parámetros totales | 4.326.350.848 (≈4,33 mil millones) |
| Parámetros activos | No aplica: el modelo es denso. El profesor Qwen3.8 2.4T A95B sí es MoE (2,4 T totales, 95 B activos) |
| Longitud de contexto | No disponible (la model card no especifica la ventana de contexto; el ejemplo de uso emplea `-n 16384`, que es un límite de generación, no de contexto) |
| Tipos de cuantización | Q4_K_M (2,783 GB), Q5_K_M (3,161 GB), Q6_K (3,563 GB), Q8_0 (4,611 GB), BF16 (8,666 GB) |
| Idiomas soportados | Inglés (`en`) únicamente, según los metadatos de la model card |
| Licencia | Apache-2.0 (heredada del modelo base Qwen) |
| Formato de pesos | GGUF (para llama.cpp, Ollama, LM Studio, Jan, KoboldCpp) |
| Modelo base | empero-ai/Qwen3.8-4B (los metadatos del repositorio también citan empero-ai/Qwen3.8-4B-Distill) |
| Relación con el base | Cuantizado (`base_model_relation: quantized`) |
| Modelo profesor | Qwen3.8 2.4T A95B |
| Arquitectura receptora | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 45,6 GB |
| Librería | gguf |
| Pipeline | text-generation |
| Fecha de creación | 12 de septiembre de 2026 |
| Última actualización | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo receptor es la arquitectura Qwen3.5-4B, que la propia model card describe como híbrida: tres capas Gated DeltaNet por cada capa de atención completa. Gated DeltaNet es un mecanismo de estado recurrente con compuertas que sustituye a la atención completa en la mayor parte de las capas, lo que reduce el coste computacional y de memoria asociado al contexto. Esta decisión tiene una consecuencia operativa directa: solo las compilaciones recientes de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet pueden cargar el modelo; las compilaciones antiguas fallan al cargar la arquitectura.

El entrenamiento descrito es una destilación de parámetros completos (no un ajuste tipo LoRA) de Qwen3.8 2.4T A95B hacia Qwen3.5-4B, usando aproximadamente 45.000 trazas de profesor curadas a partir de conjuntos de datos internos de destilación de Qwen3.8 de Empero. La model card no detalla el número total de tokens de entrenamiento, la composición del dataset más allá de esas trazas, ni si hubo fases de RLHF o DPO. El modelo se comporta como un modelo de razonamiento con bloques `<think>` y una plantilla de chat embebida en el propio archivo GGUF.

No se documentan innovaciones adicionales en la parte de decodificación (por ejemplo, decodificación especulativa) ni optimizaciones de inferencia específicas para las cuantizaciones publicadas.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada en el archivo GGUF.
- Razonamiento explícito: cada respuesta abre un bloque `<think>...</think>` que debe conservarse durante la generación y eliminarse o procesarse antes de mostrarla al usuario.
- Razonamiento matemático de tipo escolar: el modelo base destilado obtiene 0,785 en GSM8K con protocolo CoT.
- Conocimiento general evaluado con MMLU CoT en 57 asignaturas: 0,553 para el modelo destilado frente a 0,354 del Qwen3.5-4B base.
- Ejecución en runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp, sin código personalizado.
- Soporte de tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el bloque `<think>` es compatible con flujos de razonamiento encadenado, pero no hay evidencia publicada de uso agéntico.
- Capacidades multilingües: solo inglés declarado en los metadatos; no hay información sobre otros idiomas.
- Visión, audio u otras modalidades: no disponible.
- Modo de pensamiento conmutable: no documentado; el razonamiento parece estar siempre activo.

## Casos de uso

- Asistentes locales en GPU de gama de entrada: con la cuantización Q4_K_M (2,783 GB) el modelo cabe en tarjetas de 4–6 GB y deja margen para la caché KV a contextos moderados, lo que permite desplegar un asistente conversacional privado sin conexión a servicios en la nube.
- Inferencia íntegramente en CPU: la propia model card señala Q4_K_M y Q5_K_M como opciones sólidas para ejecución solo con CPU, útil para servidores sin GPU o para procesamiento por lotes de bajo coste.
- Entornos aislados o con requisitos de soberanía del dato: al ser un único archivo GGUF con licencia Apache-2.0, puede desplegarse en infraestructura sin salida a Internet, algo relevante en sanidad, legal o administración pública.
- Tutoría y resolución de problemas matemáticos en inglés: el modelo aplica cadenas de razonamiento visibles (GSM8K CoT de 0,785), lo que permite auditar el procedimiento paso a paso en lugar de aceptar solo la respuesta final.
- Generación de explicaciones razonadas para revisión humana: en flujos donde se requiere justificar una conclusión (por ejemplo, clasificación documental con argumentación), el bloque `<think>` proporciona una traza intermedia reutilizable como registro de auditoría.
- Prototipado e investigación sobre destilación: al ser la versión cuantizada de un ejercicio de destilación de un profesor MoE de 2,4 T a un denso de 4,33 B, sirve como banco de pruebas reproducible para estudiar la transferencia de capacidad entre escalas.
- Integración en aplicaciones de escritorio y plugins: LM Studio, Jan, Ollama y KoboldCpp cargan el archivo directamente con la plantilla de chat embebida, lo que reduce el trabajo de integración a descargar el GGUF y fijar los parámetros de muestreo recomendados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece cinco niveles (Q4_K_M a BF16) con tamaños exactos, lo que facilita medir la degradación de calidad frente al coste de memoria en un mismo hardware.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo fuente (empero-ai/Qwen3.8-4B) evaluado con protocolos CoT mediante `lm-evaluation-harness`, con ajustes idénticos entre base y estudiante. No se aportan cifras específicas de los archivos GGUF.

| Tarea | Qwen3.5-4B (base) | Qwen3.8-4B (destilado) | Δ |
|---|---:|---:|---:|
| mmlu (CoT, 57 asignaturas) | 0,354 | 0,553 | +0,199 |
| gsm8k_cot | 0,850 | 0,785 | −0,065 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MATH, MT-Bench u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada según el tamaño de los pesos: Q4_K_M ≈ 2,8 GB, Q5_K_M ≈ 3,2 GB, Q6_K ≈ 3,6 GB, Q8_0 ≈ 4,6 GB y BF16 ≈ 8,7 GB. A estas cifras hay que sumar la caché KV, que la model card identifica como el coste dominante en contextos largos y que puede obligar a descargar capas a CPU o RAM.
- Guía de la model card por cuantización: Q4_K_M / Q5_K_M cómodas en tarjetas de 4–6 GB y también buena opción solo CPU; Q6_K / Q8_0 recomendadas con 6–8 GB; BF16 requiere 12 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas de 4–6 GB con cuantizaciones Q4_K_M o Q5_K_M, y en el rango de 6–8 GB (por ejemplo, RTX 3060, RTX 4060, RTX 2070) con Q6_K o Q8_0.
- GPU de centro de datos: A100, H100 u otras con 12 GB o más pueden ejecutar la versión BF16 sin cuantizar; para estas GPUs el modelo está sobredimensionado en memoria y el cuello de botella sería el cómputo por token, no la VRAM.
- Opciones de despliegue: llama.cpp (incluido `llama-cli` con `-cnv`), Ollama, LM Studio, Jan y KoboldCpp. No se documenta soporte para vLLM ni TGI en la información disponible, ya que el formato publicado es exclusivamente GGUF.
- Requisito crítico de runtime: es imprescindible una compilación reciente de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet; las compilaciones antiguas no cargan la arquitectura.
- Parámetros de muestreo recomendados: `temperature=0.6`, `top_p=0.95`, `top_k=20`.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

Solo se dispone de datos verificables para las variantes derivadas del mismo linaje. No se ha encontrado información de otros modelos comparables en el material proporcionado.

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| Qwen3.8-4B-Distill-GGUF (esta ficha) | 4,33 B | no disponible | 0,553 (modelo fuente) | 0,785 (modelo fuente) | Apache-2.0 | GGUF, 5 cuantizaciones |
| empero-ai/Qwen3.8-4B (fuente, sin cuantizar) | 4,33 B | no disponible | 0,553 | 0,785 | Apache-2.0 | safetensors / BF16 |
| Qwen/Qwen3.5-4B (base del linaje) | no disponible | no disponible | 0,354 | 0,850 | Apache-2.0 | safetensors |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T totales / 95 B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

El patrón observable es un intercambio claro: la destilación aporta +0,199 en MMLU CoT sobre el Qwen3.5-4B base, pero pierde 0,065 en GSM8K CoT respecto a ese mismo base. No hay datos publicados frente a otros modelos de ~4 B de otros fabricantes.

## Limitaciones y advertencias

- Cobertura lingüística restringida: los metadatos declaran únicamente inglés (`en`). No hay evidencia de calidad en castellano u otros idiomas, por lo que su uso en producción multilingüe requeriría validación propia.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad. Al ser un modelo de 4,33 B destilado, la fidelidad factual fuera de los dominios evaluados no está garantizada.
- Regresión en matemáticas: el modelo destilado baja de 0,850 a 0,785 en GSM8K CoT respecto al Qwen3.5-4B base. La mejora en conocimiento general no implica mejora en todas las tareas.
- Razonamiento siempre activo: cada respuesta incluye un bloque `<think>` que consume tokens de salida. Es necesario reservar un límite de generación generoso (`-n`) y filtrar el bloque antes de mostrarlo, o el usuario verá el proceso interno.
- Dependencia de versión en el runtime: sin una compilación reciente de llama.cpp con soporte de Gated DeltaNet, el modelo no carga. Esto afecta a la reproducibilidad en entornos con versiones fijadas.
- Coste de caché KV en contexto largo: la propia model card advierte de que la caché KV domina el consumo a contextos largos y puede exigir descarga de capas incluso con cuantizaciones pequeñas.
- Licencia: Apache-2.0 heredada del modelo base Qwen, sin restricciones adicionales conocidas para uso comercial. No obstante, el repositorio incluye direcciones de donación y no aporta un aviso legal propio; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Trazabilidad de datos limitada: se mencionan ~45.000 trazas de profesor de conjuntos internos, sin detalle de composición, número de tokens ni fases de alineación (RLHF/DPO). No es posible auditar la procedencia del dataset.
- Inconsistencia en los metadatos: el campo `base_model` del repositorio apunta a `empero-ai/Qwen3.8-4B-Distill`, mientras que la model card cita `empero-ai/Qwen3.8-4B`. Conviene confirmar cuál es el artefacto exacto antes de citarlo.
- Madurez del repositorio: 0 descargas y 0 valoraciones en la fecha indicada, sin evidencia de uso en producción ni de validación por terceros.
- Sin datos de contexto ni de rendimiento: no se especifica la ventana de contexto soportada ni métricas de latencia o throughput, datos imprescindibles para dimensionar un despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Atomic-Germ/Qwen3.8-4B-Distill-GGUF
- Modelo base citado en la model card: https://huggingface.co/empero-ai/Qwen3.8-4B
- Modelo base citado en los metadatos del repositorio: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill (no verificado en la información disponible)
- Arquitectura receptora: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Empero (desarrollador del modelo base): https://empero.org
- Resultados de benchmarks y buenas prácticas del modelo fuente: documentados en la model card principal de empero-ai/Qwen3.8-4B (enlace arriba indicado)
- Búsquedas web realizadas: no han devuelto resultados relevantes sobre este modelo; los resultados obtenidos corresponden a entidades homónimas sin relación (marcas de esquí, carteras de criptomonedas, series de televisión).
