# lmcfarlin/Fara-1.5-27B-Heretic-Uncensored

## Resumen

Fara-1.5-27B-Heretic-Uncensored es una variante "abliterated" o decensurada del modelo Fara1.5-27B de Microsoft Research AI Frontiers, un agente multimodal de uso de ordenador (computer use agent, CUA) especializado en navegadores web. El modelo original observa el navegador exclusivamente mediante capturas de pantalla y actúa emitiendo llamadas a herramientas estructuradas (clic, escritura, desplazamiento, visita de URL, búsqueda web) para completar tareas de extremo a extremo. Esta versión concreta, publicada por el usuario lmcfarlin, aplica una ablación de rango arbitrario (ARA) mediante la herramienta Heretic v2.1.0 para reducir drásticamente las negativas del modelo a responder.

El modelo base es Qwen3.5-27B, sobre el que Microsoft aplicó un ajuste fino supervisado (SFT) con datos sintéticos generados por su pipeline multiagente FaraGen1.5. La arquitectura es un transformer decoder-only multimodal (imagen + texto → texto) con 27.356.728.560 parámetros y una ventana de contexto de 262.144 tokens, suficiente para trayectorias largas con múltiples capturas de pantalla e historial completo de acciones.

La relevancia de esta ficha radica en dos factores: por un lado, documenta un modelo de agente web de referencia que compite en la categoría de automatización de navegador con percepción puramente visual; por otro, advierte de que esta variante concreta ha sido modificada para eliminar mecanismos de rechazo, lo que afecta directamente a las salvaguardas de "puntos críticos" con las que el modelo original fue diseñado (confirmación antes de pagos, envíos, inicios de sesión o entrada de datos personales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (imagen + texto → texto) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only multimodal que acepta como entrada el objetivo del usuario en texto, una o varias capturas de pantalla del navegador y el historial previo de pensamientos y acciones del agente. La salida es un bloque de cadena de pensamiento seguido de un bloque de llamada a herramienta etiquetado en XML. La percepción es exclusivamente visual (capturas de pantalla), sin acceso al DOM ni al árbol de accesibilidad, lo que iguala la modalidad de entrada disponible para un usuario humano. Las acciones están ancladas a coordenadas: el modelo predice directamente objetivos de clic y arrastre a nivel de píxel, sin necesidad de un modelo de grounding separado.

El entrenamiento del modelo original se realizó mediante SFT sobre Qwen3.5-27B con datos sintéticos generados por FaraGen1.5, un pipeline multiagente que sintetiza tareas web, ejecuta trayectorias para resolverlas y verifica los resultados antes del entrenamiento. El periodo de entrenamiento documentado abarca de enero a abril de 2026, con un cómputo de 64 GPU NVIDIA B200 durante 6 días, y la publicación del modelo base data del 21 de mayo de 2026. Esta variante concreta aplica después una ablación de rango arbitrario (ARA) con Heretic v2.1.0 sobre las capas 29 a 56, con pesos de preservación de comportamiento bueno de 0,8780, de dirección de comportamiento malo de 0,9904 y de corrección excesiva relativa de 0,9982, usando 11 vecinos. El autor reporta una reducción de negativas de 75/100 en el modelo original a 1/100 en esta versión, con una divergencia KL de 0,3679 respecto al original.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) antes de cada acción.
- Percepción visual mediante capturas de pantalla del navegador, sin DOM ni árbol de accesibilidad.
- Llamadas a herramientas estructuradas en XML: clic, escritura, desplazamiento, visita de URL, búsqueda web, entre otras.
- Anclaje de acciones a coordenadas de píxel para clic y arrastre.
- Automatización de tareas web de extremo a extremo: rellenar formularios, reservar, solicitar empleos, planificar viajes, gestionar carritos de compra.
- Soporte de trayectorias largas con historial completo de acciones gracias a los 262.144 tokens de contexto.
- Diseño de seguridad por "puntos críticos" en el modelo original (pausa y confirmación antes de pagos, envíos, inicios de sesión o datos personales), degradado en esta variante decensurada.
- Capacidades multilingües limitadas al inglés según la model card.
- Integración prevista con los arneses MagenticLite y la CLI de Fara.

## Casos de uso

- Automatización de rellenado de formularios web: el modelo observa la captura de pantalla del formulario, identifica los campos y emite clics y escrituras secuenciadas, usando el contexto largo para mantener el estado entre páginas.
- Reservas y compras asistidas: puede navegar por catálogos, seleccionar productos y avanzar hasta el carrito; en el modelo original se detendría en el punto crítico de pago, comportamiento que esta variante puede no respetar.
- Solicitud de empleo automatizada: rellena currículos, sube documentos y completa cuestionarios multi-paso, aprovechando el historial de acciones para no repetir pasos.
- Planificación de viajes: consulta vuelos y hoteles mediante búsqueda web, compara opciones y extrae datos de las capturas de pantalla.
- Investigación web con navegación dirigida: recorre sitios, extrae información de páginas renderizadas y la sintetiza, útil cuando el contenido no es accesible por API.
- Pruebas de regresión de interfaces web: actúa como usuario sintético para validar flujos de extremo a extremo en pipelines de QA, con registro de trayectorias.
- Evaluación de robustez de agentes: esta variante decensurada sirve para estudiar el impacto de la ablación en el comportamiento de rechazo y en las salvaguardas de un agente web, siempre en entornos aislados.

## Benchmarks y rendimiento

La información disponible solo incluye métricas del proceso de ablación, no benchmarks de tareas web (WebArena, Mind2Web u otros).

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Negativas (refusals) | 1/100 | 75/100 |
| Divergencia KL | 0,3679 | 0 (por definición) |

No se han publicado resultados de benchmarks de tareas web en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los 27.356 millones de parámetros requieren aproximadamente 55 GB de pesos, más memoria para el caché KV con contexto de hasta 262.144 tokens y hasta 10 imágenes por prompt.
- GPU recomendadas: A6000, A100, H100 y B200 han sido probadas por el autor del modelo base; se recomienda repartir el modelo en al menos 2 GPU.
- GPU de consumo: no cabe en GPU de consumo de 24 GB en bf16; requeriría cuantización, no documentada oficialmente para esta variante.
- Despliegue: vLLM >= 0.19.1 con `--dtype bfloat16 --max-model-len 262144 --limit-mm-per-prompt image=10`; requiere torch >= 2.11.0 y transformers >= 5.2.0.
- Arnés recomendado: MagenticLite (sandboxing en Docker, listas de permitidos de dominios, modo vigilancia y pausa) o la CLI de Fara.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Percepción | Licencia | Notas |
|---|---|---|---|---|---|
| Fara-1.5-27B-Heretic-Uncensored | 27,36 B | 262.144 | Solo capturas de pantalla | MIT | Variante decensurada con ARA; negativas 1/100 |
| Fara1.5-27B (original) | 27 B | 262.144 | Solo capturas de pantalla | MIT | Mantiene salvaguardas de puntos críticos; negativas 75/100 |
| Qwen3.5-27B (base) | 27 B | No disponible | Multimodal genérico | No disponible en la información | Modelo base sin ajuste para uso de navegador |

No se dispone de datos de benchmarks comparativos con otros agentes web en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina en gran medida el comportamiento de rechazo (1/100 frente a 75/100), lo que puede desactivar las pausas de confirmación ante pagos, envíos, inicios de sesión o entrada de datos personales diseñadas en el modelo original.
- Riesgo elevado de acciones irreversibles sin supervisión: no debe ejecutarse con acceso de navegador sin restricciones en máquinas con información sensible.
- La divergencia KL de 0,3679 respecto al original indica cambios de distribución no triviales que pueden afectar a la calidad en tareas distintas de las evaluadas.
- Percepción limitada a capturas de pantalla: sin DOM ni árbol de accesibilidad, puede fallar en páginas con renderizado dinámico o contenido no visible.
- Idiomas: solo inglés documentado.
- Conocimiento limitado a principios de 2026; requiere navegación activa para información posterior.
- Licencia MIT permite uso comercial, pero la ausencia de salvaguardas traslada toda la responsabilidad de control al integrador.
- Sin cuantizaciones oficiales publicadas; el despliegue en hardware modesto no está documentado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lmcfarlin/Fara-1.5-27B-Heretic-Uncensored
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper: https://huggingface.co/papers/2606.20785
- Repositorio GitHub de Fara: https://github.com/microsoft/fara
- Magentic-UI: https://github.com/microsoft/magentic-ui
- Proyecto Fara 1.5: https://aka.ms/fara1.5
- Azure Foundry: https://aka.ms/fara1.5-27B-foundry
- Heretic: https://heretic-project.org
