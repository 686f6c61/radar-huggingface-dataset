# chinhnc/Quyet-1.2-Tiny

## Resumen

Quyet-1.2-Tiny es un modelo de decisión (decision model) publicado por Chinh Nguyen bajo licencia Apache-2.0, tercer miembro de la familia Quyet 1.2 (Large, Small, Tiny). A diferencia de un modelo generativo, recibe un estado (texto libre, JSON o conversación) junto con una o varias preguntas tipadas y devuelve probabilidades calibradas por temperatura sobre las opciones suministradas. Los tres tipos de pregunta soportados son `choice` (elegir una opción), `score` (escala ordenada) y `noul` (verdadero/falso).

El modelo se construye sobre jhu-clsp/mmBERT-small, un encoder multilingüe de 22 capas del que reutiliza las 16 primeras, y añade una cabeza de consulta de opciones (option-query head) que puntúa cada opción en una única pasada del encoder. Con 182.924.673 parámetros (183M) y una ventana de entrada de 8.192 tokens, está diseñado para ejecutarse en CPU en float32 o en GPU con autocast BF16, lo que lo sitúa en la gama de modelos ligeros aptos para despliegue de bajo coste.

Su relevancia radica en la interfaz: en lugar de generar texto y parsearlo, expone decisiones estructuradas con confianza y distribución de probabilidad, lo que facilita su integración en pipelines de clasificación, enrutamiento y control. La versión 1.2 amplía el límite de opciones por pregunta de `choice` de 10 a 256, aunque las preguntas con más de 10 opciones usan la temperatura por defecto y emiten una advertencia de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-small (primeras 16 de 22 capas) + cabeza de consulta de opciones (option-query head) |
| Parametros totales | 182.924.673 (183M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada completos |
| Tipos de cuantizacion | No disponible (pesos publicados en F32; inferencia en BF16 autocast sobre GPU) |
| Idiomas soportados | Multilingüe (sin listado explícito de idiomas) |
| Licencia | Apache-2.0 (conservar el fichero NOTICE en redistribuciones) |
| Formato de pesos | safetensors (repo de 0,7 GB; pesos de 732 MB en F32) |

## Arquitectura y entrenamiento

Quyet-1.2-Tiny es un encoder derivado de mmBERT-small (JHU CLSP, licencia MIT), del que conserva las 16 primeras capas de las 22 originales. Sobre esa base añade una cabeza de consulta de opciones que, en una sola pasada del encoder, lee el estado y cada pregunta con sus opciones y puntúa cada opción individualmente. El resultado se transforma en probabilidades mediante escalado de temperatura (temperature scaling), de ahí la etiqueta `calibrated` del modelo.

El modelo no es generativo: no produce texto libre, sino distribuciones de probabilidad sobre opciones predefinidas. Cada pregunta de tipo `choice` admite entre 2 y 256 opciones, las de tipo `score` entre 2 y 10 niveles, y las de tipo `noul` exactamente 2 opciones. Solo se trunca el estado, nunca la pregunta ni las opciones: en listas de conversación se conservan los tokens más recientes y en otros estados se conserva el inicio. El modo `strict=True` rechaza el truncado y también rechaza preguntas u opciones que excedan el tamaño permitido.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco documenta innovaciones adicionales como decodificación especulativa o atención lineal; la innovación principal es la propia interfaz de decisión tipada con calibración por temperatura.

## Capacidades

- Clasificación con opciones tipadas: devuelve `choice` (opción elegida, `confidence` y `probabilities`), `score` (nivel esperado, `confidence`, `probabilities` y `legend`) y `noul` (P(true) con `confidence`).
- Decisiones múltiples en una sola llamada: acepta varias preguntas simultáneas sobre el mismo estado y las resuelve en una pasada del encoder.
- Entrada heterogénea: acepta texto libre, JSON y conversaciones multi-turno como estado.
- Capacidad multilingüe heredada de mmBERT-small (sin listado explícito de idiomas en la documentación).
- Escalas ordenadas: preguntas de tipo `score` con hasta 10 niveles, útiles para intensidad, urgencia o sentimiento graduado.
- Umbrales booleanos: preguntas `noul` para condiciones verdadero/falso con probabilidad calibrada.
- Hasta 256 opciones por pregunta de elección en la versión 1.2 (frente a 10 en la 1.0), con advertencia `uncalibrated_option_count` por encima de 10.
- Ejecución en CPU (float32) o GPU (BF16 autocast sobre pesos F32).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni modalidades de visión o audio.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo recibe el mensaje del usuario y devuelve la intención entre un conjunto cerrado de opciones (`cancel`, `limit`, `other`) con su distribución de probabilidad, lo que permite derivar a un agente humano cuando la confianza es baja.
- Triaje de urgencia en tickets de soporte: una pregunta `noul` ("la solicitud es urgente") combinada con una `score` de malestar del cliente permite priorizar la cola de atención con umbrales de probabilidad explícitos.
- Moderación y etiquetado de contenido: clasificación de textos frente a categorías predefinidas con probabilidades calibradas, adecuada para pipelines que necesitan puntuaciones comparables entre lotes.
- Extracción de señales en conversaciones multi-turno: al conservar los tokens más recientes de una lista de conversación, puede evaluar el estado actual de un diálogo (intención, sentimiento, satisfacción) sin necesidad de resumir el historial.
- Clasificación de registros JSON en procesos ETL: el estado puede ser un objeto JSON y las preguntas tipadas permiten etiquetar campos o decidir rutas de procesamiento dentro de un pipeline de datos.
- Control de calidad y validación de formularios: preguntas `noul` para verificar condiciones ("el campo contiene una fecha válida") y preguntas `choice` para asignar categorías a registros estructurados.
- Filtrado previo en sistemas RAG: decidir si una consulta es respondible con la documentación disponible (`noul`) antes de invocar un modelo generativo, reduciendo coste y latencia.
- Evaluación de encuestas con escalas: preguntas `score` de hasta 10 niveles para convertir respuestas abiertas en niveles ordenados con distribución de probabilidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 183M parámetros, los pesos en F32 ocupan aproximadamente 732 MB; en BF16, alrededor de 366 MB. La memoria adicional depende del tamaño de lote y de la longitud de entrada (hasta 8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16 con lotes pequeños; tarjetas de gama consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes o longitudes máximas de contexto, se recomiendan GPU con 8-16 GB (RTX 4090, A10, L4). No requiere A100 ni H100.
- CPU: el modelo está diseñado para ejecutarse en CPU en float32, por lo que es viable en servidores sin GPU para cargas de baja concurrencia.
- Opciones de despliegue: el paquete oficial `quyet==1.2.0` (pip) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estas herramientas no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quyet-1.2-Tiny | 183M | 8.192 tokens | Encoder de decisión con opciones tipadas | Apache-2.0 | Hugging Face + paquete `quyet` |
| jhu-clsp/mmBERT-small (modelo base) | No disponible (encoder de 22 capas) | No disponible | Encoder multilingüe genérico | MIT | Hugging Face |
| Quyet 1.2 Large / Small | No disponible | No disponible | Encoder de decisión, misma familia | Apache-2.0 | Hugging Face (familia Quyet 1.2) |

La información disponible no incluye datos de rendimiento comparado con alternativas, por lo que la comparativa se limita a parámetros, licencia y tipo de modelo. No se dispone de cifras de benchmarks para mmBERT-small ni para los otros miembros de la familia Quyet 1.2 en la documentación consultada.

## Limitaciones y advertencias

- No evaluado para seguridad, sesgo ni robustez adversarial según la propia model card; no debe usarse como único control en decisiones de alto riesgo.
- Riesgo de calibración degradada: las preguntas `choice` con más de 10 opciones usan la temperatura por defecto y devuelven la advertencia `uncalibrated_option_count`.
- En precisión media (BF16), los resultados pueden diferir ligeramente entre hardware y tamaños de lote en preguntas con probabilidades casi empatadas.
- El truncado solo afecta al estado: las conversaciones conservan los tokens más recientes y otros estados conservan el inicio, lo que puede perder información relevante en estados largos.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y requiere que las opciones estén predefinidas.
- El listado concreto de idiomas soportados no está documentado, aunque el modelo base es multilingüe.
- Restricción de licencia: Apache-2.0 permite uso comercial, pero exige conservar el fichero NOTICE (que comienza con "Quyet by Chinh Nguyen") al redistribuir el modelo o derivados.
- El modelo depende de la librería `quyet` (versión 1.2.0) para aplicar las temperaturas configuradas; su uso fuera del paquete puede alterar la calibración.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chinhnc/Quyet-1.2-Tiny
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Página del proyecto: https://quyet.ai
- Código del paquete: https://github.com/ncchinh/quyet
- Contacto del autor: email@quyet.ai
