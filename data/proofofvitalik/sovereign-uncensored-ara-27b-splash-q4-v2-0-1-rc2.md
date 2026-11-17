# proofofvitalik/Sovereign-Uncensored-ARA-27B-Splash-Q4-v2.0.1-rc2

## Resumen

Sovereign Uncensored ARA 27B Splash Q4 v2.0.1-rc2 es un paquete de pesos cuantizados en 4 bits del modelo base heretic-org/Qwen3.8-27B-heretic-ara, publicado por el usuario proofofvitalik. El modelo se presenta como una solución de inferencia local para Apple Silicon, empaquetada junto con Splash (motor de inferencia) y una interfaz de escritorio opcional denominada Sovereign Desktop, que incluye los componentes Hermes y Companion con herramientas de agente. Resuelve el problema de ejecutar un modelo multimodal de 27B en hardware de consumo Mac sin necesidad de infraestructura en la nube.

El modelo es de tipo image-text-to-text, con capacidades declaradas de texto, visión y tool-use. Los idiomas soportados según la model card son ruso e inglés. La licencia declarada es Apache 2.0. El repositorio ocupa 17,4 GB, coherente con una cuantización de 4 bits de un modelo de 27B parámetros.

La relevancia actual del paquete radica en su enfoque en inferencia local en Apple Silicon con métricas de velocidad declaradas (mediana de ~50 tok/s, hasta 106 tok/s en un M4 Max de 48 GB) y en la integración de un conjunto de herramientas de agente (Compact Repair, Serena, Exa, Code Guard, Context7, Playwright, Hugging Face). No obstante, se trata de una release candidate (rc2) con cero descargas y cero likes en el momento de la consulta, y el propio autor reconoce que la aceptación completa en un Mac físico limpio sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5; arquitectura exacta no detallada) |
| Parametros totales | 27B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (Q4); no se detallan variantes adicionales |
| Idiomas soportados | ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene un paquete para Splash; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base heretic-org/Qwen3.8-27B-heretic-ara. Las etiquetas del repositorio incluyen "qwen3_5", lo que sugiere una base derivada de la familia Qwen3.5, pero no se proporcionan datos sobre tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens ni si hubo etapas de RLHF o DPO. El sufijo "heretic" en el nombre del modelo base sugiere un proceso de fine-tuning orientado a reducir rechazos o restricciones de alineación, pero esto no se documenta explícitamente en la información proporcionada.

La innovación técnica destacable del paquete es el motor de inferencia Splash 1.3.0 junto con DFlash2, diseñado específicamente para Apple Silicon, y la integración con Sovereign Desktop (Companion 0.3.5.4 RC14), que añade gestión de perfiles, memoria persistente, reanudación de tareas desde checkpoints y un conjunto de herramientas de agente. También se menciona la reutilización de contexto en caché para peticiones compatibles. No se detallan innovaciones a nivel de arquitectura del modelo (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación y edición de texto en ruso e inglés.
- Comprensión de imágenes: respuesta a preguntas sobre imágenes y revisión de contenido visual (por ejemplo, paneles de ingeniería con tablas, gráficos y mapas de dependencias).
- Tool calling / function calling, con conjuntos de herramientas habilitables manualmente y selección automática limitada a los conjuntos habilitados.
- Herramientas de agente incluidas en Companion: Compact Repair (ediciones Python dirigidas con validación), Serena (búsqueda de archivos, funciones y referencias, edición de código), Exa (búsqueda web y recuperación de contenido), Code Guard (verificación de sintaxis, imports en entorno aislado y tests), Context7 (documentación de librerías y frameworks), Playwright (navegación web, clics y formularios) y Hugging Face (búsqueda de modelos, datasets, papers y documentación).
- Memoria persistente como conjunto de herramientas separado, con almacenamiento de hechos y reanudación de tareas desde checkpoints.
- Perfiles integrados para trabajo general, coding, investigación y documentos.
- Razonamiento multi-paso orientado a tareas de código y documentos (el autor muestra una demostración de continuación de tareas y verificación de llamadas a funciones).

## Casos de uso

- Asistencia de coding local en Mac: el modelo, ejecutado con Splash, puede leer archivos de proyecto, inspeccionar código y aplicar ediciones dirigidas mediante Compact Repair, verificando el resultado con Code Guard antes de guardar una nueva copia. Es adecuado para desarrolladores que trabajan en Apple Silicon y quieren evitar enviar código a servicios externos.
- Revisión de documentos técnicos y paneles: con capacidad de visión, puede leer tablas de métricas, gráficos de latencia y mapas de dependencias, y aplicar reglas mostradas en la imagen (el autor documenta una prueba con 10 campos verificados en dos imágenes). Útil para validación de releases y QA visual.
- Investigación asistida con búsqueda web: mediante Exa y Playwright, el modelo puede localizar documentación oficial, abrir páginas, extraer contenido y responder preguntas con fuentes. Adecuado para tareas de research donde se requiere consultar manuales o repositorios.
- Gestión de tareas largas con memoria: Companion permite almacenar hechos y reanudar trabajo guardado desde checkpoints, lo que encaja en flujos de conciliación de inventario, seguimiento de incidencias o proyectos de varias sesiones.
- Consulta de documentación de librerías: con Context7, el modelo recupera documentación y ejemplos de uso de frameworks, útil para resolver dudas de API sin salir del entorno local.
- Automatización de navegación web: con Playwright, puede rellenar formularios y hacer clic en elementos, lo que sirve para pruebas de aceptación o extracción de datos de páginas concretas.
- Conversación multilingüe ruso-inglés: para equipos que operan en ambos idiomas, el modelo cubre generación y comprensión en las dos lenguas declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card). El único dato de rendimiento proporcionado es de velocidad de inferencia local:

| Metrica | Valor | Entorno |
|---|---|---|
| Velocidad mediana de decodificacion | ~50 tok/s | Apple M4 Max / 48 GB, 38 muestras de engine-decode (23 de octubre de 2026) |
| Velocidad maxima observada | hasta 106 tok/s | mismo entorno |

No se proporcionan datos de latencia para visión ni de throughput en otros hardware.

## Requisitos de hardware

- VRAM/unified memory estimada: el paquete Q4 de 27B ocupa 17,4 GB en disco; se recomienda al menos 24-32 GB de memoria unificada para margen de contexto y sistema. El autor reporta ejecución en un M4 Max con 48 GB.
- GPU recomendadas: Apple Silicon (M4 Max validado por el autor). No se documentan requisitos para GPU NVIDIA ni AMD.
- ¿Cabe en GPU de consumo? El enfoque está en Apple Silicon; no se confirma compatibilidad con GPUs de consumo NVIDIA/AMD en la información disponible.
- Opciones de despliegue: Splash 1.3.0 + DFlash2 (motor propio para Apple Silicon); Sovereign Desktop (Hermes + Companion) como interfaz opcional. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana ~50 tok/s y picos de 106 tok/s en M4 Max/48 GB; timings de visión remitidos a SPEED.md, sin cifras en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible" para parámetros de contexto, rendimiento y comparativas cuantitativas. A modo orientativo, el modelo se posiciona frente a otros modelos multimodales de ~27B cuantizados para inferencia local, pero no se aportan cifras que permitan una tabla comparativa fiable.

## Limitaciones y advertencias

- Release candidate (rc2) con cero descargas y cero likes en el momento de la consulta; el propio autor indica que la aceptación completa de primera ejecución en un Mac físico limpio sigue pendiente.
- Idiomas limitados a ruso e inglés; no se declara soporte de castellano ni de otros idiomas.
- No se documentan sesgos conocidos, pero el sufijo "heretic" y la etiqueta "uncensored" sugieren un proceso de fine-tuning orientado a reducir rechazos, lo que puede aumentar el riesgo de contenido inapropiado o de menor adherencia a salvaguardas.
- Riesgo de alucinación no cuantificado; no hay benchmarks que permitan estimarlo.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Las herramientas de red (Exa, Playwright, Hugging Face, Context7) pueden requerir credenciales y transmiten peticiones a proveedores externos, lo que afecta a la privacidad y a la afirmación de inferencia puramente local.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base heretic-org/Qwen3.8-27B-heretic-ara y las dependencias de terceros deben verificarse por separado.
- El rendimiento reportado (~50 tok/s mediana) corresponde a un único hardware (M4 Max/48 GB); no hay datos para otros equipos.
- El repositorio incluye binarios y archivos ZIP de Companion; conviene verificar checksums (SHA256SUMS.txt) antes de ejecutar.

## Enlaces

- Hugging Face: https://huggingface.co/proofofvitalik/Sovereign-Uncensored-ARA-27B-Splash-Q4-v2.0.1-rc2
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Documentación de velocidad: SPEED.md (en el repositorio)
- Documentación de Companion: COMPANION.md (en el repositorio)
- Checksums de release: release/SHA256SUMS.txt (en el repositorio)
- Informe de verificación: RELEASE-QA.md (en el repositorio)
- Producción de medios: MEDIA-PRODUCTION.md (en el repositorio)
- Demo de herramientas de código: demos/01-compact-repair-code-guard.mp4 (en el repositorio)
