# mradermacher/UI-Mate-9B-heretic-i1-GGUF

## Resumen

UI-Mate-9B-heretic-i1-GGUF es una cuantización en formato GGUF del modelo original UI-Mate-9B-heretic, desarrollado por Dingdust y cuantizado por mradermacher. El modelo original es un sistema multimodal visión-lenguaje orientado a la automatización de interfaces gráficas (agentes de escritorio), capaz de interpretar capturas de pantalla y generar acciones para controlar el sistema operativo. La variante «heretic» indica que se trata de una versión «abliterated» (sin censura) del modelo base, lo que elimina los rechazos de seguridad habituales.

Esta cuantización con imatrix (importance matrix) ofrece una amplia gama de tamaños de cuantización (desde IQ1_S hasta Q6_K) para adaptarse a distintos presupuestos de VRAM. Con aproximadamente 8,95 mil millones de parámetros, el modelo se posiciona en la gama media, permitiendo su ejecución en GPUs de consumo con suficiente memoria. La relevancia actual radica en el creciente interés por agentes de interfaz de usuario locales y privados, donde este modelo ofrece una alternativa de código abierto con capacidades multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal visión-lenguaje, probablemente basado en un transformer con codificador visual) |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el repositorio hermano indica inglés, pero no confirmado) |
| Licencia | No disponible (el repositorio hermano mradermacher/UI-Mate-9B-heretic-GGUF indica apache-2.0, pero la licencia del original no se especifica) |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por los tags y el nombre, se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje de aproximadamente 9B parámetros, similar a otros modelos de agentes de GUI como UI-TARS o ShowUI. El modelo original fue entrenado para tareas de control de interfaz gráfica, incluyendo datos de capturas de pantalla y acciones de teclado/mouse. La versión «heretic» se ha sometido a un proceso de «abliteration» (eliminación de la capa de rechazo) para reducir la censura en las respuestas, lo que puede haber modificado el comportamiento de seguridad.

El proceso de cuantización realizado por mradermacher emplea imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precisión. No hay datos públicos sobre el número de tokens de entrenamiento, el dataset específico o el uso de técnicas como RLHF o DPO.

## Capacidades

- Automatización de interfaz gráfica: puede interpretar capturas de pantalla y generar acciones (clic, teclado, desplazamiento) para controlar aplicaciones y sistemas operativos.
- Comprensión multimodal: procesa simultáneamente imágenes y texto, lo que permite entender el estado de una pantalla y responder con acciones o texto.
- Conversación contextual: soporta diálogos multi-turno con memoria del contexto, lo que permite corregir acciones según los resultados de las interacciones previas.
- Ejecución de herramientas: los tags del repositorio indican compatibilidad con pyautogui y otros sistemas de control de escritorio, lo que sugiere que puede generar llamadas a funciones para ejecutar acciones.
- Capacidades de agente: puede funcionar como agente autónomo en entornos como Windows Arena, OpenSWorld, etc., según los tags del repositorio hermano.
- Sin censura (versión heretic): al ser una versión abliterated, no rechaza peticiones consideradas «peligrosas» o «éticamente problemáticas», lo que amplía el rango de respuestas.

## Casos de uso

- Pruebas automatizadas de aplicaciones de escritorio: el modelo puede recorrer una aplicación, identificar botones y campos, y ejecutar flujos de prueba (por ejemplo, rellenar formularios, verificar errores) sin intervención humana, reduciendo el tiempo de QA.
- Asistencia a personas con discapacidad visual: puede describir el contenido de la pantalla y guiar al usuario con instrucciones verbales o acciones de control, mejorando la accesibilidad en entornos de escritorio.
- Automatización de tareas repetitivas de oficina: puede manejar tareas como mover archivos, renombrar documentos, rellenar plantillas o gestionar correos electrónicos, interpretando la interfaz de aplicaciones como Excel, Outlook o el explorador de archivos.
- Control remoto de equipos: integrado en sistemas de administración remota, puede ejecutar acciones de mantenimiento (actualizar software, limpiar archivos) interpretando pantallas de terminal o paneles de control.
- Entrenamiento de agentes de IA: sirve como base para desarrollar y evaluar agentes de GUI en entornos simulados como OpenSWorld o WindowsAgentArena, proporcionando un modelo de código abierto para investigación.
- Generación de scripts de automatización: puede analizar una captura de pantalla y generar código (Python con pyautogui, por ejemplo) que reproduzca las acciones necesarias, acelerando el desarrollo de scripts de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (como MMLU, HumanEval o métricas específicas de agentes de GUI) y no se han encontrado comparaciones con otros modelos en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (tamaño aproximado de 5,5 GB), se recomienda al menos 6-8 GB de VRAM para inferencia con contexto corto. Para Q6_K (aproximadamente 7,5 GB), se necesita 10-12 GB de VRAM. Las cuantizaciones más ligeras (Q2_K, IQ1_M) pueden caber en 3-4 GB, aunque con pérdida de calidad.
- GPU recomendadas: RTX 3060 (12 GB) para Q4_K_M, RTX 4070/4080 (16-24 GB) para Q6_K, y A100/H100 para las cuantizaciones más altas o para entrenamiento/ajuste fino.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4_K_M y Q5_K_M son ejecutables en GPUs de consumo con 8-12 GB de VRAM, como la RTX 3060 Ti, RTX 3070, o RTX 4060 Ti.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de GGUF), LM Studio, y TGI (si se convierte a safetensors). El repositorio indica compatibilidad con endpoints (tags `endpoints_compatible`).
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, un modelo de 9B en Q4_K_M puede generar ~50-80 tokens/s; en una RTX 3060, ~20-30 tokens/s. Estos son valores estimados y no confirmados.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos de la misma categoría (agentes de GUI multimodal) en la información proporcionada. Modelos como UI-TARS-7B, ShowUI-9B o Molmo-7B son competidores potenciales, pero no hay datos de rendimiento o licencia disponibles para realizar una comparación objetiva. La tabla siguiente se limita a los datos conocidos del modelo:

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones |
|---|---|---|---|---|
| UI-Mate-9B-heretic (GGUF) | 8,95B | No disponible | Apache-2.0 (repo hermano) | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1-M, IQ2-M, IQ3-M, IQ4-M |
| UI-TARS-7B | 7B | 32K (aprox.) | Apache-2.0 | No disponible |
| ShowUI-8B | 8B | No disponible | Apache-2.0 | No disponible |

*Nota: los datos de UI-TARS y ShowUI provienen de conocimientos generales y pueden no ser exactos; se recomienda verificar en fuentes oficiales.*

## Limitaciones y advertencias

- Alucinación y errores de acción: como modelo multimodal, puede generar acciones incorrectas al interpretar capturas de pantalla ambiguas o complejas, lo que puede provocar acciones no deseadas en el sistema.
- Sesgos de seguridad: al ser una versión «heretic» (abliterated), el modelo no aplica filtros de seguridad y puede generar contenido inapropiado, violento o ilegal, lo que es un riesgo en entornos de producción.
- Contexto y memoria limitada: no se conoce la longitud de contexto exacta; si es limitada (por ejemplo, 4K o 8K), puede perder el hilo en tareas largas de automatización.
- Dependencia de la visión: la calidad de la interpretación visual depende de la resolución de la captura y la complejidad de la interfaz; interfaces muy densas o con elementos superpuestos pueden causar errores.
- Licencia incierta: aunque el repositorio hermano indica Apache-2.0, no se ha confirmado la licencia del modelo original (Dingdust/UI-Mate-9B-heretic). Esto puede limitar el uso comercial sin verificación.
- No hay soporte de lenguajes multilingües: no se ha confirmado el soporte de otros idiomas, lo que restringe su uso a entornos en inglés.
- Tamaño del repositorio: 33.2 GB, lo que requiere espacio de almacenamiento significativo, aunque se puede descargar solo la cuantización deseada.

## Enlaces

- Repositorio de HuggingFace de esta cuantización: https://huggingface.co/mradermacher/UI-Mate-9B-heretic-i1-GGUF
- Repositorio hermano con tags y licencia: https://huggingface.co/mradermacher/UI-Mate-9B-heretic-GGUF
- Modelo original de Dingdust: https://huggingface.co/Dingdust/UI-Mate-9B-heretic (no verificado)
- Página del autor mradermacher: https://huggingface.co/mradermacher (no se ha incluido en la búsqueda, pero es un enlace plausible)
- Documentación de imatrix (nicoboss): no disponible en los resultados de búsqueda.
