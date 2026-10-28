# inclusionAI/LBS-27B

## Resumen

LBS-27B es un modelo de visión-lenguaje agéntico desarrollado por inclusionAI (Ant Group) y construido sobre el modelo base Qwen3.8-27B. Su tesis central es que la capacidad de "mirar mejor" puede aprenderse en un dominio estrecho y transferirse después a tareas generales: el modelo se entrena exclusivamente con datos sintéticos de GUI grounding (localización de elementos en capturas de pantalla) y, sin ningún dato de VQA de dominio general, aplica la misma política de observación a preguntas sobre imágenes y a percepción de alta resolución.

La innovación es de comportamiento, no solo de pesos: el modelo emite acciones de texto `crop_image` para hacer zoom sobre regiones relevantes, refinar recortes anteriores o volver a la imagen original, con hasta dos recortes independientes por turno y un presupuesto total de tres llamadas por episodio. El cliente de inferencia debe ejecutar esos recortes y devolver las imágenes y el mapeo de coordenadas en un bucle multiturno. Las coordenadas finales se emiten normalizadas en el rango [0,1000] sobre la imagen original.

Es relevante ahora porque propone una receta de RL (GRPO) muy ligera —unos 10.000 ejemplos de SFT de arranque en frío y 80 pasos de GRPO— para obtener política de observación agéntica, y porque publica resultados en ScreenSpot-Pro (81,15 %) y en benchmarks de alta resolución como HR-Bench 4K y 8K (89,13 % y 87,75 %). La licencia Apache 2.0 sobre pesos y software facilita su evaluación comercial, aunque el propio autor advierte que las comparativas de su documentación no están controladas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (arquitectura `qwen3_5`, pipeline image-text-to-text); 64 capas, `hidden size` 5.120, 48 capas de atención lineal y 16 de atención completa (una completa cada 4 capas), según el análisis de arquitectura de hfviewer |
| Parámetros totales | 27B nominales (Qwen3.8-27B); el campo de safetensors del repositorio reporta 3.054.832, dato incoherente con el tamaño del repo (54,7 GB) y probablemente mal indexado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información oficial; el proveedor externo Featherless indica 32.000 tokens |
| Tipos de cuantización | No disponible (el repositorio publica únicamente safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos y software del proyecto); los datasets y capturas de pantalla de terceros conservan sus licencias originales |
| Formato de pesos | safetensors (repositorio de 54,7 GB) |
| Pipeline declarado | image-text-to-text |
| Etiquetas del autor | gui-grounding, agentic-vision, visual-question-answering, high-resolution, reinforcement-learning, conversational |
| Descargas / likes | 323 descargas, 13 likes en el momento de la consulta |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

El backbone es un transformer de 64 capas con un esquema híbrido de atención: 48 capas de atención lineal y 16 de atención completa, insertando una capa de atención completa cada cuatro capas. El tamaño oculto es de 5.120. Esta combinación busca reducir el coste de secuencias largas (necesario cuando se encadenan recortes de imágenes de alta resolución en varios turnos) manteniendo picos de atención global. El modelo parte de Qwen3.8-27B, por lo que hereda el tokenizador, el `chat template` y el modo de razonamiento del modelo base.

El entrenamiento es deliberadamente estrecho en datos y agresivo en RL. Se usan únicamente datos sintéticos de GUI grounding, sin preguntas de VQA ni datos de dominio general: aproximadamente 10.000 ejemplos de SFT de arranque en frío, seguidos de 80 pasos de GRPO con tamaño de lote 64 y 8 rollouts por prompt. La recompensa moldea una política de observación compuesta por zoom adaptativo (ampliar regiones relevantes, refinar recortes previos y revisitar la imagen original cuando hace falta) y zoom composicional (hasta dos recortes independientes por turno, con un presupuesto total de tres llamadas por episodio). La transferencia a VQA general y a percepción de alta resolución es emergente: no se realizó ajuste adicional sobre datos de dominio general.

## Capacidades

- GUI grounding: localización de elementos de interfaz en capturas de pantalla, con coordenadas normalizadas a [0,1000] sobre la imagen original en formato `[x.xx,y.yy]`.
- Observación agéntica multiturno: emisión de acciones de texto `crop_image` que el cliente debe ejecutar y devolver junto con el mapeo de coordenadas.
- Zoom composicional: hasta dos recortes independientes por turno y un presupuesto de tres llamadas de recorte por episodio.
- Refinamiento iterativo: capacidad de corregir un recorte previo o volver a la imagen completa cuando la región ampliada no contiene la información buscada.
- VQA de dominio general sin entrenamiento específico: la política de observación aprendida en GUI se transfiere a preguntas sobre imágenes naturales.
- Percepción de alta resolución: evaluado en HR-Bench 4K y 8K mediante recortes sucesivos en lugar de reescalado de la imagen completa.
- Rechazo de acciones: OS-World-G se evalúa con `action accuracy` incluyendo rechazo, es decir, el modelo puede declinar ejecutar una acción.
- Modo de razonamiento configurable: los wrappers de evaluación usan por defecto `reasoning_effort=xhigh` y `thinking_budget=4096` mediante `chat_template_kwargs` (las entradas directas en Python pueden usar `high`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling genérico: no documentado; el "tool" soportado de forma explícita es la acción de recorte ejecutada por el cliente.

## Casos de uso

- Automatización de agentes de interfaz (RPA de nueva generación): el modelo recibe una captura de pantalla y un objetivo en lenguaje natural, localiza el elemento y devuelve coordenadas normalizadas que un ejecutor externo (Playwright, Appium, pyautogui) traduce a clics reales. Es adecuado porque el grounding es exactamente la tarea para la que se entrenó.
- Testing de regresión visual en CI/CD: dado un conjunto de capturas de una aplicación, el modelo verifica la presencia y posición de controles y devuelve coordenadas comparables entre versiones. El zoom agéntico ayuda en interfaces densas donde los elementos ocupan pocos píxeles.
- Preguntas sobre documentos e informes de alta resolución: planos, capturas de dashboards o páginas escaneadas a 4K/8K donde el reescalado destruye el detalle. El modelo hace recortes sucesivos sobre la región relevante en lugar de procesar la imagen completa a baja resolución.
- Lectura de gráficos y tablas dentro de aplicaciones: con recortes composicionales puede aislar dos regiones distintas de un mismo panel (por ejemplo, eje y leyenda) en un solo turno y razonar sobre ambas.
- Asistencia a accesibilidad: descripción de pantallas y localización de controles para usuarios con dificultades motoras o visuales, devolviendo la posición del elemento que debe activarse.
- Agente multimodal de propósito general con presupuesto de cómputo acotado: al limitar a tres recortes por episodio, el coste de tokens de imagen por tarea queda acotado, lo que facilita desplegarlo en pipelines con latencia y coste controlados.
- Evaluación de políticas de observación en investigación: la receta (SFT corto + GRPO con 8 rollouts) sirve como línea base reproducible para experimentos de RL sobre percepción visual.

## Benchmarks y rendimiento

| Benchmark | Registros | Métrica | Puntuación (%) |
|---|---:|---|---:|
| ScreenSpot-Pro | 1.581 | Action accuracy | 81,15 |
| OS-World-G (Refine) | 564 | Action accuracy, incluyendo rechazo | 84,57 |
| PerceptionBench | 3.000 | Judge accuracy | 59,67 |
| HR-Bench 4K | 800 | Strict option matching | 89,13 |
| HR-Bench 8K | 800 | Strict option matching | 87,75 |

Todas las puntuaciones de LBS se obtuvieron con zoom agéntico sobre ejecuciones completas del benchmark. PerceptionBench se evaluó con un juez autoalojado Deepseekv4-flash-0731, sin juicios fallidos ni omitidos, aunque juicios repetidos pueden variar. El propio autor advierte que las referencias del gráfico comparativo usan configuraciones de inferencia distintas y GPT-oss-120B para PerceptionBench, por lo que las comparaciones no están controladas; los detalles están en las notas de comparación del repositorio.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 55 GB solo para pesos (el repositorio ocupa 54,7 GB), más caché KV para imágenes de alta resolución y varios turnos con recortes.
- Configuración de referencia del autor: el script oficial de vLLM se lanza con `--tp 4 --dp 1`, es decir, cuatro dispositivos en paralelo de tensor.
- GPU recomendadas: H100 80 GB (una unidad puede alojar los pesos con poco margen), 2× A100 40 GB o 2× A100 80 GB, o 4× GPU para replicar la configuración del ejemplo.
- Cuantización a 8 bits: alrededor de 28-30 GB de pesos, viable en A100 40 GB o RTX 6000 Ada 48 GB. A 4 bits, en torno a 15-16 GB, lo que en teoría cabe en una RTX 4090 de 24 GB, pero no hay confirmación de soporte de kernels para el esquema de atención híbrida.
- Cabe en GPU de consumo: solo con cuantización agresiva y soporte de runtime no confirmado; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM es la vía documentada y soportada mediante `scripts/serve_vllm.sh`. TGI, llama.cpp, Ollama y otros runtimes no están confirmados en la información disponible.
- Cliente obligatorio: el modelo emite acciones `crop_image` en texto plano; se necesita un cliente que ejecute los recortes y devuelva las imágenes con el mapeo de coordenadas para la inferencia multiturno. La guía de evaluación del repositorio incluye dicho cliente y la configuración de benchmarks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Datos públicos |
|---|---|---|---|---|---|
| LBS-27B | 27B (nominal) | No disponible (32K según Featherless) | VLM agéntico con zoom aprendido por RL sobre GUI grounding | Apache 2.0 | ScreenSpot-Pro 81,15 %; HR-Bench 4K 89,13 % |
| Qwen3.8-27B (modelo base) | 27B | No disponible | VLM generalista multimodal | No disponible en la información proporcionada | No disponible |
| Familia UI-Venus (mismo laboratorio) | No disponible | No disponible | GUI grounding y agentes de interfaz | No disponible | No disponible |
| Otros agentes GUI open source | No disponible | No disponible | Grounding de capturas de pantalla | No disponible | No disponible |

No se dispone de cifras verificables de los modelos comparables en la información proporcionada, y el propio autor señala que las comparaciones de su documento de resultados no están controladas (distintas configuraciones de inferencia y distintos modelos juez). Cualquier comparación numérica directa debe tratarse como orientativa.

## Limitaciones y advertencias

- Entrenamiento exclusivamente con datos sintéticos de GUI grounding: no se usaron datos de dominio general ni preguntas de VQA, por lo que el rendimiento en dominios especializados (medicina, satélite, industrial) es una extrapolación no validada.
- PerceptionBench en 59,67 %: la propia documentación muestra que la transferencia a percepción general es notablemente más débil que el grounding en pantallas.
- El modelo no opera aplicaciones: predice una localización. Ejecutar un clic real requiere un ejecutor separado (Playwright, Appium u otro), con los riesgos de seguridad que ello implica.
- Dependencia de un cliente personalizado: sin un bucle que ejecute `crop_image` y reinyecte las imágenes con su mapeo de coordenadas, el modelo pierde su principal ventaja y puede degradar su precisión de localización.
- Coordenadas normalizadas a [0,1000]: cualquier integración debe aplicar la transformación al tamaño real de la imagen; un error de escala produce clics desviados.
- Riesgo de alucinación de elementos: como todo modelo generativo, puede emitir coordenadas para controles que no existen en la captura, especialmente en interfaces muy densas o con texto pequeño.
- Idiomas no declarados: la model card no especifica cobertura lingüística; no hay garantía de calidad fuera del inglés en las instrucciones de tarea.
- Presupuesto de observación acotado: tres llamadas de recorte por episodio y dos recortes por turno limitan los casos que requieren inspección de muchas regiones.
- Licencia: los pesos y el software son Apache 2.0, pero los datasets de terceros y las capturas de pantalla conservan sus términos originales; conviene revisarlos antes de un uso comercial con datos propios.
- Incoherencia de metadatos: el recuento de parámetros de safetensors (3.054.832) no cuadra con el nombre del modelo ni con el tamaño del repositorio, lo que sugiere un indexado defectuoso; no debe usarse como fuente para estimar VRAM.
- Evaluación con juez autoalojado: PerceptionBench depende de un modelo juez concreto y juicios repetidos pueden variar; los resultados no son directamente comparables con los de otras publicaciones.
- Historial de publicación: el repositorio apareció inicialmente con un README mínimo y se completó horas después; conviene fijar una revisión concreta del repositorio para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LBS-27B
- Proyecto en GitHub (rama LBS): https://github.com/inclusionAI/UI-Venus/tree/LBS
- Colección UI-Venus en Hugging Face: https://huggingface.co/collections/inclusionAI/ui-venus
- Guía de evaluación y cliente multiturno: https://github.com/inclusionAI/UI-Venus/blob/LBS/evaluation/README.md
- Notas de comparación de benchmarks: https://github.com/inclusionAI/UI-Venus/blob/LBS/docs/BENCHMARK_OVERVIEW.md
- Análisis de arquitectura (tercero): https://hfviewer.com/inclusionAI/LBS-27B
- Ficha de proveedor de inferencia (contexto de 32K): https://featherless.ai/models/inclusionAI/LBS-27B
