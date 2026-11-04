# ikppramesh/irx-1

## Resumen

IRx-1 es un modelo de generación de texto de aproximadamente 1.880 millones de parámetros desarrollado por el usuario independiente ikppramesh. Se distribuye como un ajuste fino (LoRA fusionado) sobre una arquitectura base etiquetada como `qwen3_5`, empaquetado en formato MLX de 4 bits para ejecución local en dispositivos Apple. Su propuesta central es la inferencia totalmente offline: sin conexión a internet, sin cuenta y sin que los datos del usuario abandonen el dispositivo.

El modelo se posiciona como la opción intermedia de la familia IRx (junto a IRx-mini, IRx-2 e IRx-2 Pro), orientada a respuestas rápidas y de longitud corta en teléfonos y portátiles con recursos limitados. El repositorio ocupa 9,6 GB, aunque la descarga indicada para el modelo cuantizado es de aproximadamente 1,2 GB, y existe una variante GGUF para Android e iOS.

Es relevante ahora por su enfoque en el despliegue on-device con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, el autor es explícito sobre sus límites: no es un modelo de frontera, su conocimiento factual es parcial y su fine-tuning no entrenó el formato nativo de tool calling de la arquitectura base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base etiquetada como `qwen3_5`), ajuste fino con LoRA |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits (formato MLX); variante GGUF publicada en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF en `ikppramesh/irx-1-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only identificada en las etiquetas como `qwen3_5`, sobre la que se aplicó un ajuste fino con LoRA. Los pesos se distribuyen fusionados y cuantizados a 4 bits en formato MLX, la librería de Apple para ejecución en silicio de la compañía (M-series). La model card menciona una arquitectura base con soporte nativo de un formato `<tool_call>` para function calling, aunque el ajuste fino de IRx-1 no entrenó ni reforzó esa capacidad.

El autor documenta que el entrenamiento incluyó ejemplos verificados de conocimiento general (capitales, símbolos químicos, hechos históricos), con una mejora medible pero parcial en precisión factual. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación técnica más allá del pipeline de ajuste, que el autor remite al repositorio de GitHub para consultar scripts y fuentes de datos.

## Capacidades

- Generación de texto conversacional para respuestas cortas y directas.
- Explicaciones simples y resúmenes breves de conceptos cotidianos.
- Redacción de borradores cortos: mensajes, listas de verificación y checklists.
- Aritmética y conversiones básicas (por ejemplo, Celsius a Fahrenheit).
- Generación de preguntas de cuestionario y actividades didácticas sencillas.
- Asistencia a programadores en dudas puntuales y fragmentos de código de una línea.
- Ejecución completamente offline en dispositivo, sin telemetría ni llamadas de red.
- Soporte de tool calling: la arquitectura base lo contempla, pero el ajuste fino no lo entrenó; el autor desaconseja exponer herramientas al modelo en aplicaciones de chat.

## Casos de uso

- Asistencia en entornos sin conectividad: el modelo funciona íntegramente en local, por lo que resulta adecuado para zonas rurales, obras, vuelos o instalaciones aisladas donde no hay red disponible.
- Atención al cliente de proximidad en pequeños comercios: permite redactar mensajes breves de WhatsApp para promociones o avisos de entrega sin depender de servicios en la nube ni exponer datos de clientes.
- Apoyo a estudiantes en dispositivos de gama media: con aproximadamente 1,2 GB de descarga, cabe en teléfonos modestos para resolver dudas de concepto y generar cuestionarios de repaso.
- Herramienta para docentes: generación de actividades de calentamiento y preguntas para el aula, ejecutándose en el portátil del profesor sin cuentas ni suscripciones.
- Consultas rápidas para desarrolladores: aclaraciones sobre códigos de error HTTP o fragmentos de código de una línea, integrables en editores o terminales con backend MLX.
- Planificación personal y viajes: listas de equipaje, sugerencias de comidas y conversiones de unidades, con latencia baja gracias al tamaño reducido del modelo.
- Escenarios con requisitos estrictos de privacidad: al no salir ningún dato del dispositivo, encaja en flujos donde la información del usuario no puede enviarse a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,2 GB para la variante MLX de 4 bits; la variante GGUF se publica en repositorio aparte con tamaño no especificado.
- GPU recomendadas: Apple Silicon (M-series) para la ruta MLX; en la ruta GGUF, CPU o GPU integrada de dispositivos móviles.
- Compatibilidad con GPU de consumo: el autor indica que está pensado para "casi cualquier teléfono"; IRx-mini se reserva para dispositivos con 4 GB de RAM, lo que sitúa a IRx-1 por encima de ese umbral. IRx-2 Pro requiere 12 GB o más.
- Opciones de despliegue: MLX en macOS; GGUF con runtimes compatibles en iOS y Android, con PocketPal mencionado en la model card como aplicación de referencia.
- Latencia y throughput: no disponibles. La model card remite a un tablero comparativo externo ("IRx board") con velocidades medidas, pero no se incluyen cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| IRx-1 | ~1,88 B | No disponible | Apache 2.0 | MLX 4 bits, GGUF | Enfoque offline on-device; sin benchmarks publicados |
| IRx-mini | No disponible (~1,1 GB de descarga) | No disponible | No disponible | GGUF, MLX | Pensado para teléfonos con 4 GB de RAM |
| IRx-2 | No disponible (~2,7 GB de descarga) | No disponible | No disponible | GGUF, MLX | Recomendado por el autor como opción equilibrada |
| IRx-2 Pro | No disponible (~5,3 GB de descarga) | No disponible | No disponible | GGUF, MLX | Respuestas largas; requiere 12 GB o más |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos de la misma familia para establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Escala reducida: con ~1,88 B de parámetros no iguala a modelos alojados de mayor tamaño en razonamiento multi-paso, problemas técnicos complejos ni amplitud de conocimiento.
- Conocimiento congelado: los pesos no se actualizan; el modelo no tiene acceso a noticias, precios o eventos recientes por sí mismo. El autor señala que la solución fiable es la recuperación (RAG), no el reentrenamiento.
- Precisión factual parcial: el ajuste fino mejora la exactitud en conocimiento general, pero persisten errores, especialmente cuando el modelo base tenía una creencia previa fuerte (el autor cita el ejemplo de "Sáhara" como mayor desierto pese a un ejemplo correcto de "Antártida").
- Tool calling desaconsejado: exponer herramientas o funciones al modelo puede provocar llamadas erróneas o bucles de agente ficticio, sobre todo con prompts de sistema grandes.
- Respuestas degeneradas ocasionales con temperaturas de muestreo altas; regenerar suele resolverlo.
- Contexto limitado: el autor indica que está pensado para ventanas de contexto cortas o medias, no para múltiples documentos largos.
- Riesgo de alucinación en datos críticos (medicinas, dosis, precios, leyes, variedades de semillas, cantidades de productos químicos); el autor recomienda verificar cualquier dato importante.
- No sustituye a profesionales en materias médicas, legales o financieras.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de la arquitectura base `qwen3_5` si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikppramesh/irx-1
- Variante GGUF: https://huggingface.co/ikppramesh/irx-1-GGUF
- Repositorio GitHub: https://github.com/ikppramesh/irx-1
- IRx-mini (MLX): https://huggingface.co/ikppramesh/irx-mini
- IRx-mini (GGUF): https://huggingface.co/ikppramesh/irx-mini-GGUF
- IRx-2 (MLX): https://huggingface.co/ikppramesh/irx-2
- IRx-2 (GGUF): https://huggingface.co/ikppramesh/irx-2-GGUF
- IRx-2 Pro (MLX): https://huggingface.co/ikppramesh/irx-2-pro
- IRx-2 Pro (GGUF): https://huggingface.co/ikppramesh/irx-2-pro-GGUF
- Tablero comparativo IRx: https://claude.ai/artifact/1ha4zVccAwrKSm3mjKBLFU
