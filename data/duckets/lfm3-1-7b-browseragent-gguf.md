# Duckets/LFM3-1.7B-BrowserAgent-GGUF

## Resumen

LFM3-1.7B-BrowserAgent-GGUF es un ajuste fino del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario Duckets en Hugging Face. El modelo está especializado en la operación de navegadores a través de las superficies de herramientas MCP de BrowserOS y BrowserOS neo, cubriendo bucles de tipo snapshot → act → verify, rellenado de formularios por lotes, gestión de pestañas y sesiones, recuperación de errores y la disciplina de solicitar ayuda humana en casos de inicio de sesión, códigos de un solo uso, captchas o aprobaciones de pago.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de LiquidAI y cuenta con 1.728.801.600 parámetros totales según los datos reales de safetensors. Se distribuye únicamente en formato GGUF cuantizado a Q8_0, lo que lo hace cargable en LM Studio y llama.cpp, y está pensado para integrarse con el servidor MCP de BrowserOS neo o el servidor MCP clásico de BrowserOS.

Su relevancia actual radica en que aborda un nicho concreto y creciente: agentes de automatización de navegador que necesitan emitir llamadas a herramientas en formato JSON con argumentos correctos y gestionar flujos multi-paso con recuperación de errores. Con solo 1,7 mil millones de parámetros y licencia Apache 2.0, es un artefacto ligero y desplegable en hardware modesto, aunque su entrenamiento es completamente sintético y su adopción en la comunidad es todavía muy reducida (85 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; detalles de arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la receta de entrenamiento usa max seq 2048, pero no se especifica la ventana de inferencia del base) |
| Tipos de cuantizacion | Q8_0 (unico artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`lfm3-1.7b-browseragent-604a-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B y se ajusta mediante LoRA de rango 8 y alpha 10 sobre la base en 8 bits de MLX, usando mlx-vlm para SFT con learning rate 2e-4, batch de 4, longitud máxima de secuencia de 2048 y 1 época (389 iteraciones). El adaptador se fusiona de vuelta en la base y se convierte a GGUF con el conversor de LFM3 de llama.cpp, cuantizándose finalmente a Q8_0. Se conserva una build MLX en local, pero el artefacto publicado es el GGUF.

Los datos de entrenamiento son 1.553 filas sintéticas más 173 de evaluación reservada, construidas a partir del repositorio open source browseros-ai/BrowserOS (definiciones de herramientas, la skill del agente neo del propio repositorio y documentación) y del `tools/list` en vivo de una instancia de BrowserOS neo en ejecución (25 herramientas). Las familias de tareas incluyen triaje de bandeja de entrada, cancelación de suscripciones, publicación en redes sociales, actualización de CRM, presentación de gastos con subida de recibos, búsqueda de vuelos, archivado de PDF, cambios de ajustes, reapertura de historial, grupos de pestañas, skills guardadas, investigación multi-pestaña en paralelo, sesiones de dos tareas, decisiones de siguiente llamada a partir de snapshots de página, recuperación de errores y casos de ayuda humana. Las referencias de elementos en los snapshots de entrenamiento se aleatorizaron con elementos distractores para forzar al modelo a leer el snapshot en lugar de memorizar posiciones. Tras 1 época, la pérdida de validación fue 0,092 y la precisión de token del 97,9 %.

## Capacidades

- Emisión de llamadas a herramientas en formato JSON, nombrando la herramienta y sus argumentos, sobre las superficies MCP de BrowserOS y BrowserOS neo.
- Bucles de agente snapshot → act → verify sobre snapshots de página.
- Rellenado de formularios por lotes y gestión de pestañas, grupos de pestañas y sesiones.
- Recuperación de errores en flujos de automatización.
- Disciplina de `request_human_help` para inicios de sesión, códigos de un solo uso, captchas y aprobaciones de pago.
- Tareas de investigación multi-pestaña en paralelo y sesiones con dos tareas simultáneas.
- Toma de decisiones de siguiente llamada a partir de snapshots de página.
- Capacidades multilingües: no disponibles.
- Generación de texto general, razonamiento, código o matemáticas: no documentadas específicamente para este ajuste.

## Casos de uso

- Triaje de bandeja de entrada: el modelo puede leer snapshots de la interfaz de correo, decidir la siguiente acción y emitir llamadas a herramientas para archivar, etiquetar o responder, apoyándose en su entrenamiento específico en esta familia de tareas.
- Cancelación de suscripciones: automatización de flujos de baja navegando menús de configuración, con recuperación de errores cuando la interfaz no coincide con lo esperado.
- Publicación en redes sociales: emisión de llamadas a herramientas para redactar y publicar contenido desde el navegador, con verificación posterior del resultado.
- Actualización de CRM: rellenado por lotes de formularios y campos en aplicaciones web de gestión de clientes, aprovechando la capacidad de rellenado por lotes del ajuste.
- Presentación de gastos con subida de recibos: secuencias de carga de ficheros y cumplimentación de formularios, con solicitud de ayuda humana cuando se requiere aprobación de pago.
- Búsqueda de vuelos e investigación multi-pestaña: apertura de varias pestañas en paralelo, extracción de información de cada snapshot y consolidación de resultados.
- Archivado de PDF y cambios de ajustes: ejecución de flujos administrativos repetitivos en el navegador con verificación del estado final.
- Integración en pipelines de agentes vía MCP: el modelo emite llamadas JSON que un orquestador puede enrutar al servidor `browseros-neo` o al servidor MCP clásico de BrowserOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El único dato de evaluación proporcionado por el autor es la métrica interna de validación tras 1 época:

| Metrica | Valor |
|---|---|
| Val loss (held-out, 173 filas) | 0,092 |
| Token accuracy (held-out) | 97,9 % |
| Epocas | 1 (389 iteraciones) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73 mil millones de parámetros en Q8_0, el peso del fichero ronda 1,8 GB; se estima un uso de VRAM de aproximadamente 2 a 3 GB incluyendo overhead de contexto (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargarlo en Q8_0; no se dispone de datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: LM Studio (motor llama.cpp) y llama.cpp, según la model card. No se mencionan vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duckets/LFM3-1.7B-BrowserAgent-GGUF | 1,73 B | no disponible | Automatizacion de navegador via MCP (BrowserOS) | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | Modelo de proposito general | Apache 2.0 (segun el ajuste) | Hugging Face |
| Alternativas de agentes de navegador de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros ajustes comparables de automatizacion de navegador en la informacion proporcionada.

## Limitaciones y advertencias

- El entrenamiento es completamente sintético (1.553 filas), lo que puede limitar la generalizacion a interfaces y flujos reales no representados en el dataset.
- El ajuste está acoplado a las superficies de herramientas concretas de BrowserOS y BrowserOS neo (25 herramientas); cambios en esas APIs pueden degradar el comportamiento.
- Solo se publica un artefacto Q8_0; no hay variantes de menor precisión para hardware muy limitado.
- No se documentan idiomas soportados; el rendimiento multilingüe es desconocido.
- No hay benchmarks estandar publicados, por lo que las comparaciones de rendimiento con otros modelos no son posibles.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia del modelo base LiquidAI/LFM3-1.7B según su propia model card.
- Riesgo de alucinación en la emisión de llamadas a herramientas: el modelo podría inventar nombres de herramientas o argumentos no válidos, especialmente fuera de las familias de tareas entrenadas.
- Adopción muy baja (85 descargas, 0 likes) y sin validación independiente por parte de la comunidad.
- No se especifica la longitud de contexto efectiva del modelo base, lo que es crítico para snapshots de página largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duckets/LFM3-1.7B-BrowserAgent-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio BrowserOS: https://github.com/browseros-ai/BrowserOS
