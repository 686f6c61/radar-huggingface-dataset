# Duckets/LFM3-VL-2B-BrowserAgent-GGUF

## Resumen

LFM3-VL-2B-BrowserAgent es un fine-tuning especializado del modelo multimodal LFM3-VL-2B de LiquidAI, publicado por el usuario Duckets en formato GGUF cuantizado a Q8_0. El ajuste se centra en dotar al modelo de la capacidad de operar BrowserOS y BrowserOS neo (un navegador automatizable open source) a través de sus herramientas MCP reales: bucles de snapshot → act → verify, relleno de formularios por lotes, gestión de pestañas y sesiones, recuperación de errores y la disciplina de solicitar ayuda humana (`request_human_help`) para logins, códigos de un solo uso, captchas o aprobaciones con dinero.

La relevancia de este modelo reside en la creciente demanda de agentes de navegador pequeños y ejecutables localmente. Con 1.728.801.600 parámetros y cuantización Q8_0 (aproximadamente 2,2 GB el repositorio completo), cabe en hardware de consumo, lo que permite automatización de navegador con visión (capturas de pantalla) sin depender de APIs en la nube. La torre de visión permanece intacta y se distribuye como un mmproj estándar en F16, conservando la comprensión de imágenes del modelo base para trabajo de navegación fundamentado en capturas.

El ajuste se realizó mediante LoRA (rank 8, alpha 10) con mlx-vlm sobre la base en bf16, con un conjunto de datos sintético de 1.553 filas construido a partir del repositorio de BrowserOS. El modelo está verificado en llama.cpp, donde emite llamadas a herramientas de BrowserOS neo válidas según esquema a partir de prompts de snapshot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (multimodal, transformer con torre de visión; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el fine-tune usó max seq 2048) |
| Tipos de cuantizacion | Q8_0 (LM), F16 (mmproj de visión) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (ver también los términos de la licencia del modelo base LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (`lfm3-vl-2b-browseragent-1f00-Q8_0.gguf` + `mmproj-lfm3-vl-2b-browseragent-1f00-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B de LiquidAI, un modelo multimodal (texto + visión) del que no se detallan en la ficha las particularidades internas de la arquitectura LFM3. El fine-tune es exclusivamente de texto: la torre de visión no se modifica y se exporta como el mmproj estándar, de modo que el modelo mantiene su comprensión de imágenes, esencial para tareas de navegación basadas en capturas de pantalla.

El entrenamiento usó LoRA (rank 8, alpha 10) mediante SFT con mlx-vlm desde la base en bf16, con learning rate 2e-4, batch 4, secuencia máxima de 2048 tokens y una sola época (389 iteraciones). El conjunto de datos es totalmente sintético: 1.553 filas de entrenamiento más 173 de evaluación retenida, generadas a partir del repositorio open source browseros-ai/BrowserOS (definiciones de herramientas, la skill del agente neo del propio repositorio y documentación) y del `tools/list` en vivo de una instancia de BrowserOS neo en ejecución (25 herramientas). El dataset fue filtrado para excluir información personal. La evaluación retenida arrojó una val loss de 0,102 y una precisión de token del 97,8 %. Tras el entrenamiento, el adaptador se fusionó en la base, se convirtió a GGUF con el conversor LFM3 de llama.cpp (exportando la torre de visión como mmproj) y se cuantizó a Q8_0.

## Capacidades

- Operación de BrowserOS y BrowserOS neo mediante sus 25 herramientas MCP reales, generando llamadas a herramientas válidas según esquema.
- Bucles de agente snapshot → act → verify: leer el estado de la página, actuar y verificar el resultado.
- Relleno de formularios por lotes (batched form filling).
- Gestión de pestañas y sesiones: grupos de pestañas, reapertura de historial, sesiones de dos tareas en paralelo, investigación multi-pestaña.
- Recuperación de errores durante la ejecución de tareas de navegador.
- Disciplina de solicitud de ayuda humana (`request_human_help`) para logins, códigos de un solo uso, captchas y aprobaciones que implican dinero.
- Comprensión de imágenes intacta (mmproj F16) para razonar sobre capturas de pantalla.
- Tareas entrenadas: triaje de bandeja de entrada, cancelación de suscripciones, publicación en redes sociales, actualización de CRM, archivo de gastos con subida de recibos, búsqueda de vuelos, archivado de PDF, cambios de configuración y gestión de skills guardadas.

## Casos de uso

- Triaje automatizado de correo en el navegador: el modelo puede leer la bandeja de entrada vía snapshot, clasificar mensajes y archivar o etiquetar usando las herramientas de BrowserOS, adecuado para flujos de productividad personal local.
- Cancelación masiva de suscripciones: dada una lista de correos promocionales, ejecuta el flujo de baja sitio por sitio con verificación de resultado, un proceso repetitivo ideal para automatización.
- Archivo de gastos con recibos: combina visión (leer la captura del recibo) y acción (subir el archivo y rellenar el formulario de gastos), gracias a que conserva la torre de visión del modelo base.
- Investigación multi-pestaña en paralelo: puede gestionar sesiones de dos tareas simultáneas y decidir la siguiente llamada a herramienta a partir del snapshot de la página, útil para recopilación de información competitiva o comparativas de productos.
- Actualización de CRM y publicación en redes sociales: automatiza tareas administrativas repetitivas dentro del navegador sin exponer datos a servicios en la nube, ya que todo corre localmente.
- Recuperación ante errores en flujos de automatización: su entrenamiento específico en error recovery lo hace adecuado para pipelines de RPA ligero donde las páginas cambian o fallan.
- Prototipado de agentes de navegador en local: por su tamaño (2B, ~2 GB en Q8_0) es idóneo para desarrolladores que experimentan con MCP y BrowserOS en portátiles sin GPU de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación publicados corresponden al conjunto de evaluación retenido del propio fine-tune: val loss 0,102 y precisión de token del 97,8 %. Además, el autor verifica en llama.cpp que el modelo carga y emite llamadas a herramientas de BrowserOS neo válidas según esquema a partir de prompts de snapshot.

## Requisitos de hardware

- VRAM/RAM estimada: el LM en Q8_0 ocupa aproximadamente 1,7-1,9 GB; sumando el mmproj en F16 y el KV cache, un sistema con 4-6 GB de RAM o VRAM debería ser suficiente (estimación basada en el tamaño del repo de 2,2 GB; dato oficial no disponible).
- Apto para hardware de consumo: sí, por tamaño cabe en portátiles y equipos de escritorio sin GPU dedicada, ejecutándose por CPU con llama.cpp; con GPU discreta tipo RTX 3060 o superior la inferencia sería cómoda (recomendaciones específicas no disponibles).
- Despliegue: llama.cpp (verificado por el autor). Ollama, LM Studio y otros frontales solo si su motor soporta la arquitectura `lfm3_vl`; el autor advierte que algunos builds empaquetados de llama.cpp (como el engine pack actual de LM Studio) aún no pueden cargar la arquitectura, por lo que hay que usar una build actual de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| LFM3-VL-2B-BrowserAgent (este) | 1,73 B (Q8_0) | GGUF + mmproj | Agente de navegador BrowserOS via MCP, con visión | Apache 2.0 |
| LiquidAI/LFM3-VL-2B (base) | 1,73 B | safetensors (bf16) | Multimodal generalista | Ver ficha del modelo base |
| Otros agentes de navegador (p. ej. variantes de Qwen-VL usadas en browser-use) | no disponible | no disponible | Automatizacion de navegador generalista | no disponible |

No se dispone de datos de rendimiento comparativos directos; la ventaja diferencial declarada de este modelo es su ajuste específico sobre la superficie de herramientas MCP real de BrowserOS neo, frente a modelos generalistas que requieren ingeniería de prompts para usar esas mismas herramientas.

## Limitaciones y advertencias

- El fine-tune es exclusivamente textual y muy estrecho: está optimizado para las 25 herramientas de BrowserOS neo y puede degradar el rendimiento del modelo base en tareas generales ajenas a ese dominio.
- El dataset de entrenamiento es 100 % sintético (1.553 filas), lo que implica riesgo de sobreajuste a los patrones del dataset y de comportamiento no robusto ante páginas o flujos no vistos; no hay benchmarks públicos que permitan verificar la generalización.
- La longitud de contexto del fine-tune fue de 2048 tokens, lo que puede limitar snapshots de página muy largos (el contexto real del modelo base no se indica en la ficha).
- Compatibilidad: la arquitectura `lfm3_vl` aún no está soportada por algunos builds empaquetados de llama.cpp (incluido el engine pack actual de LM Studio); es necesario usar una build reciente de llama.cpp.
- Riesgo de alucinación en llamadas a herramientas: aunque el autor verifica salidas válidas por esquema, no hay garantías de corrección semántica de las acciones; las tareas con dinero, logins y captchas deben pasar por `request_human_help`.
- Licencia: el GGUF se publica bajo Apache 2.0, pero la ficha remite a los términos de licencia del modelo base LiquidAI/LFM3-VL-2B, que conviene revisar antes de uso comercial.
- Idiomas soportados: no disponibles en la información proporcionada.
- Proyecto de autor comunitario con descargas muy bajas (133) y sin auditoría externa: usar con precaución en producción.

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/Duckets/LFM3-VL-2B-BrowserAgent-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio BrowserOS: https://github.com/browseros-ai/BrowserOS
