# Songkai/kai-decision-lora

## Resumen

kai-decision-lora es un adaptador LoRA acompañado de siete cabezas de decisión lineales, construido sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario Songkai y resuelve un problema muy concreto: la clasificación estructurada de mensajes en chats de grupo. En lugar de generar texto libre, el modelo lee una ventana de conversación (contexto reciente más el mensaje objetivo) y emite en una sola pasada hacia delante siete juicios simultáneos sobre ese mensaje: categoría, sentimiento, importancia, urgencia, intensidad, si requiere atención del usuario y si contiene una tarea pendiente.

La relevancia del modelo está en su enfoque de eficiencia: con un backbone de solo 0,8 mil millones de parámetros y un adaptador LoRA (r=64, alpha=128) más siete capas `nn.Linear` sobre el estado oculto agrupado de 1024 dimensiones, consigue una latencia mediana de 40,3 ms por ventana en una RTX 4090 D con batch 1 y hasta 512 tokens. Frente a pedirle al modelo base sin entrenar que emita este esquema de etiquetas directamente, que solo produce salida parseable en el 1,6% de las ventanas, el adaptador convierte una tarea mal definida para un LLM generativo en un problema de clasificación supervisada bien acotado.

El modelo está pensado exclusivamente para chino (zh), con licencia Apache 2.0, y su caso de uso natural es el triaje automático de mensajes en herramientas de mensajería corporativa o comunidades. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y sus métricas deben leerse con cautela porque las etiquetas de entrenamiento y evaluación son etiquetas de profesor (GLM-5.3), no anotación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-0.8B) + 7 cabezas lineales de decisión |
| Parametros totales | No disponible (adaptador LoRA r=64, alpha=128, dropout 0,05; backbone de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (truncado por la izquierda); hasta 10 mensajes de contexto de los 30 minutos previos |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el backbone admite las cuantizaciones habituales de Qwen3.5-0.8B) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` (LoRA), `heads.pt` (7 capas `nn.Linear`), `temps.json`, `calib.json`; tokenizer desde el repo base |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA aplicado únicamente a las proyecciones del modelo de lenguaje del backbone Qwen3.5-0.8B, excluyendo los módulos visuales. Sobre el estado oculto agrupado (pooled) de 1024 dimensiones del último token se montan siete cabezas `nn.Linear` independientes que producen: una clasificación de 7 clases (categoría), una de 3 clases (sentimiento), tres distribuciones ordinales de 5 vías (importancia, urgencia, intensidad) y dos salidas binarias con probabilidad calibrada (requiere atención, contiene tarea). Todo se calcula en una sola pasada hacia delante, sin generación autoregresiva.

El entrenamiento se realizó sobre 5.073 ventanas (versión v1.3) con etiquetas de profesor generadas por GLM-5.3 bajo una especificación de etiquetado congelada y distribuciones suaves. La calibración es explícita: temperaturas por cabeza en `temps.json`, sesgo y temperatura de categoría más tablas de regresión isotónica para las dos cabezas binarias en `calib.json`. El conjunto de evaluación es un split temporal por grupo (el ~18% más reciente de ventanas de cada grupo), congelado antes del entrenamiento y nunca usado para entrenar ni para seleccionar modelo. No se documentan fases de RLHF ni DPO.

## Capacidades

- Clasificación de mensajes de chat de grupo en 7 categorías: ayuda/petición, tarea, decisión, información, discusión, charla y otro.
- Análisis de sentimiento en 3 clases (positivo, neutro, negativo) con una precisión del 89,1% en el conjunto de evaluación.
- Puntuación ordinal de importancia, urgencia e intensidad de sentimiento en escala 1-5.
- Detección binaria calibrada de si el mensaje requiere la atención del usuario (AUC 0,801).
- Detección binaria calibrada de si el mensaje contiene una tarea o acción pendiente (AUC 0,965).
- Procesamiento de contexto conversacional: incorpora hasta 10 mensajes previos de los últimos 30 minutos, con remitentes anonimizados como `S####`.
- Inferencia de baja latencia en una sola pasada, sin tool calling, sin agentes y sin generación de texto libre.
- Capacidad multilingüe limitada al chino.

## Casos de uso

- Triaje de notificaciones en herramientas de mensajería corporativa: el modelo puntúa cada mensaje entrante con `needs_attention` y `urgency` para decidir si interrumpe al usuario o lo agrupa en un resumen, aprovechando la calibración isotónica que permite fijar umbrales con significado probabilístico.
- Extracción automática de tareas desde chats de proyecto: la cabeza `todo` (AUC 0,965) identifica mensajes con acciones pendientes y la cabeza `cat` los clasifica como tarea, lo que permite volcar elementos a un gestor de tareas sin intervención humana.
- Resumen diario priorizado de grupos activos: combinando `imp` e `urg` en escala 1-5 se puede ordenar la actividad del día y presentar primero lo que el equipo debe atender.
- Moderación y monitorización de clima social: la cabeza `sen` y `inten` permiten detectar mensajes negativos de alta intensidad en comunidades grandes, con la ventaja de que el modelo no genera texto y por tanto no alucina contenido.
- Enrutamiento de mensajes a canales o equipos: la clasificación en 7 categorías sirve para dirigir peticiones de ayuda al equipo de soporte y decisiones al canal de arquitectura, con una macro-F1 de 0,744 en las clases con soporte suficiente.
- Investigación sobre anotación automática de conversaciones: al ser un adaptador pequeño y Apache 2.0, sirve como componente de etiquetado rápido en pipelines de análisis de chats, con 40,3 ms por ventana que permiten procesar grandes volúmenes en una sola GPU.
- Despliegue en el borde o en GPUs de consumo: con un backbone de 0,8B y un adaptador de 0,1 GB, es viable ejecutarlo en hardware modesto para prefiltrar mensajes antes de enviarlos a un modelo mayor.

## Benchmarks y rendimiento

Evaluación sobre conjunto retenido de 258 ventanas, split temporal por grupo, etiquetas de profesor GLM-5.3, medida el 2026-11-05 (release v1.3, entrenada con 5.073 ventanas):

| Metrica | Resultado |
|---|---|
| Macro-F1 de categoría (7 clases) | 0,637 |
| Macro-F1 de categoría (clases con soporte ≥10) | 0,744 |
| F1 por clase: ayuda | 0,908 |
| F1 por clase: información | 0,866 |
| F1 por clase: charla | 0,765 |
| F1 por clase: tarea | 0,756 |
| F1 por clase: discusión | 0,667 |
| F1 por clase: decisión | 0,500 |
| F1 por clase: otro | 0,000 (soporte = 1) |
| AUC de needs-attention | 0,801 |
| ECE de needs-attention (calibrado) | 0,065 |
| AUC de has-todo | 0,965 |
| ECE de has-todo (calibrado) | 0,034 |
| ECE de confianza de categoría | 0,120 (solo diagnóstico) |
| Precisión de sentimiento | 89,1% |
| Importancia / urgencia dentro de ±1 | 100% / 99,6% |
| Latencia mediana / p90 | 40,3 ms / 44,9 ms (RTX 4090 D, batch 1) |
| Salida parseable del modelo base sin entrenar | 1,6% de las ventanas |

## Requisitos de hardware

- VRAM estimada: el backbone de 0,8B en bfloat16 ocupa aproximadamente 1,6 GB; con el adaptador LoRA y las cabezas, el consumo total se mantiene por debajo de 3 GB en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; la latencia reportada de 40,3 ms se midió en una RTX 4090 D.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con suficiente memoria compartida usando cuantización del backbone.
- Opciones de despliegue: el código de referencia usa `transformers` con `peft` y PyTorch; el adaptador es compatible con el ecosistema PEFT y el backbone puede servirse con vLLM o TGI, aunque las cabezas de decisión requieren un wrapper propio como el del ejemplo de la model card.
- Latencia y throughput: mediana de 40,3 ms y p90 de 44,9 ms por ventana en batch 1 con hasta 512 tokens; el throughput en batch mayor no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kai-decision-lora | 0,8B (backbone) + LoRA | 512 tokens | Clasificación estructurada de mensajes de chat | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (base sin adaptar) | 0,8B | No disponible | LLM generativo general | No disponible en la informacion | HuggingFace |
| Modelos de clasificación de texto tipo BERT chino | 0,1B-0,3B | 512 tokens | Clasificación de texto genérica | Variable | Amplia |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación son etiquetas de profesor (GLM-5.3), no anotación humana; un segundo profesor coincidió con el primero en needs-attention solo el 75% de las veces, lo que sitúa el techo alcanzable de AUC frente a etiquetas de un único profesor en torno a 0,854.
- Las puertas de calidad originales (macro-F1 ≥ 0,65, AUC ≥ 0,85, ECE ≤ 0,08) se revisaron el 2026-11-05 a la baja (AUC ≥ 0,80) tras medir la calidad de las etiquetas; conviene leer las métricas como cotas condicionadas por el ruido de etiquetado.
- La clase "otro" tiene soporte de una sola muestra y F1 de 0,000; la clase "decisión" obtiene F1 de 0,500, por lo que el modelo es poco fiable en esas categorías.
- El ECE de confianza de categoría es 0,120, elevado; las probabilidades de categoría no deben usarse como confianza calibrada en producción.
- El modelo solo soporta chino; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La ventana se trunca por la izquierda a 512 tokens, de modo que contextos conversacionales largos pueden perder información relevante.
- No genera texto ni soporta tool calling ni razonamiento multi-paso; es exclusivamente un clasificador.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar además la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la información disponible.
- El repositorio tiene cero descargas y cero likes, sin validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Songkai/kai-decision-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
