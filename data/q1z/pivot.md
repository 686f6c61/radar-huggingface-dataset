# Q1z/Pivot

## Resumen

Pivot es un encoder de decisiones con puntuación de conjuntos (set-scored decision encoder) desarrollado por el usuario Q1z y publicado en Hugging Face. Se trata de un fine-tune del encoder LiquidAI/LFM2.5-Encoder-350M, con 357.631.745 parámetros, que resuelve un problema muy acotado: dado un contexto y un conjunto cerrado de entre 2 y 16 candidatos semánticos, devolver un vector de probabilidad sobre dichos candidatos.

A diferencia de los modelos generativos, Pivot no produce texto. Su salida es una distribución de probabilidad calculada como `softmax(logits.float())`, lo que lo hace apto para enrutado, clasificación y puntuación deterministas dentro de pipelines. El autor indica que se entrenó con el método DSBT y una receta de dos fases: dos épocas de warmup con cross-entropy, seguidas de optimización multiclase con Brier loss en vivo y PCGrad.

Su relevancia radica en ser un componente pequeño y especializado que puede actuar como cabecera de decisión dentro de sistemas mayores, con un coste de cómputo bajo (unos 715 MB de pesos en fp16). Como contrapartida, es un modelo muy reciente y poco adoptado (48 descargas y 3 me gusta en el momento de la consulta), y no declara licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional LFM2 (fine-tune de LiquidAI/LFM2.5-Encoder-350M); el autor indica que el paquete incluye el runtime LFM2 bidireccional exacto |
| Parametros totales | 357.631.745 (~357,6 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Modelo base | LiquidAI/LFM2.5-Encoder-350M |
| Tamaño del repositorio | 2,9 GB |
| Biblioteca | transformers (requiere `trust_remote_code=True`) |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-23 |
| Descargas / me gusta | 48 / 3 |

## Arquitectura y entrenamiento

Pivot es un fine-tune de un encoder bidireccional perteneciente a la familia LFM2 de Liquid AI, en su variante LFM2.5-Encoder-350M. El autor especifica que el repositorio incluye (vendors) el runtime LFM2 bidireccional exacto empleado durante el desarrollo y que se verificó en un proceso Python offline limpio antes de la subida. El modelo expone un método `choose(tok, contexto, [candidatos])` que devuelve la distribución de probabilidad sobre el conjunto cerrado de candidatos, calculada como `softmax(logits.float())`.

La receta de entrenamiento descrita combina dos épocas de warmup con cross-entropy (CE) seguidas de una fase de ajuste con Brier loss multiclase "en vivo" y PCGrad, una técnica de cirugía de gradientes orientada a mitigar conflictos entre objetivos. El autor denomina al método DSBT, sin detallar su significado ni la composición del dataset en la información disponible. La procedencia de entrenamiento y evaluación se almacena en el directorio `training/` del repositorio. No se especifican tokens de entrenamiento, número total de épocas, composición de datos ni el uso de RLHF o DPO.

## Capacidades

- Decisión y clasificación en conjunto cerrado: asigna probabilidades a un conjunto de 2 a 16 candidatos semánticos para un contexto dado.
- Puntuación (scoring) de alternativas: la salida probabilística permite ordenar candidatos por idoneidad.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede emplearse como codificador para tareas posteriores.
- Salida calibrable: el uso de Brier loss multiclase apunta a una orientación hacia probabilidades calibradas, aunque no hay evaluación pública que lo confirme.
- Enrutado determinista: útil para seleccionar una ruta o etiqueta única dentro de un catálogo predefinido.
- No documentado: no se declara soporte de tool calling / function calling, ni de agentes, ni de razonamiento multi-paso, ni de generación de texto.
- Idiomas: no disponible. No hay evidencia en la información proporcionada de qué lenguas cubre el fine-tune.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: el propio autor ilustra el ejemplo de un cliente que dice que su factura es incorrecta; el modelo devuelve la probabilidad de enrutar a facturación, a soporte técnico o a ventas. Es adecuado porque convierte una decisión difusa en una distribución explícita sobre rutas predefinidas.
- Clasificación de intenciones en asistentes conversacionales: dado el turno del usuario y un catálogo de 2 a 16 intenciones, el modelo selecciona la más probable sin necesidad de un LLM generativo, reduciendo coste y latencia.
- Triage de correo entrante: asignar cada mensaje a una cola (soporte, comercial, legal, spam) usando el asunto y el cuerpo como contexto.
- Moderación de contenido por categorías cerradas: evaluar si un texto pertenece a una taxonomía fija de categorías de riesgo, siempre que el número de etiquetas no supere 16.
- Puntuación de respuestas candidatas en pipelines de anotación o evaluación: dado un enunciado y varias respuestas generadas, el modelo puntúa cada una para priorizar la revisión humana.
- Desambiguación de entidades o sentidos: seleccionar entre lecturas alternativas de un término dentro de un conjunto cerrado de significados.
- Enrutado de consultas en un sistema RAG: decidir a qué base de conocimiento o índice debe dirigirse una pregunta antes de recuperar documentos.
- Selección de siguiente acción en control de diálogo: elegir entre acciones discretas del sistema (pedir aclaración, confirmar, escalar a humano).
- Extracción de características para clasificadores posteriores: usar las representaciones internas como entrada de un modelo aguas abajo en lugar de la salida de decisión.
- A/B o control de políticas: elegir entre un conjunto pequeño de variantes de política o contenido, obteniendo una probabilidad utilizable para decisiones ponderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de precisión, F1, calibración (ECE) ni comparaciones con otros modelos, ni en la model card ni en los resultados de búsqueda consultados.

## Requisitos de hardware

- Tamaño de pesos: 357.631.745 parámetros, equivalentes a aproximadamente 1,43 GB en fp32, 715 MB en fp16/bf16, 358 MB en int8 y 179 MB en int4 (estimaciones sobre el número de parámetros; el repositorio ocupa 2,9 GB, presumiblemente por incluir checkpoints o el runtime adicional).
- VRAM estimada: inferior a 2 GB en fp16 contando pesos, tokenizador y activaciones, sin datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se espera funcionamiento en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema por tamaño.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU para inferencia puntual, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del tag `custom_code` y del método `choose`). No se confirma soporte en vLLM, llama.cpp, Ollama o TGI; al tratarse de un encoder bidireccional con código personalizado, la integración en motores de inferencia generativos no está documentada.
- Latencia y throughput estimados: no disponibles. No se publican medidas de latencia por petición ni de tokens por segundo (el modelo no es autorregresivo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Q1z/Pivot | 357,6 M | no disponible | Decisión en conjunto cerrado (2-16 candidatos) | no disponible | no disponible |
| LiquidAI/LFM2.5-Encoder-350M (base) | ~350 M por nomenclatura | no disponible | Encoder / extracción de características | no disponible | no disponible |

No se han identificado en la búsqueda web modelos comparables de la misma categoría (encoders de decisión con puntuación de conjuntos), por lo que no es posible establecer una comparativa de rendimiento con alternativas. Otros encoders pequeños de uso común (por ejemplo, familias tipo MiniLM o bge-small) resuelven tareas distintas —embeddings y recuperación— y no ofrecen una salida de probabilidad sobre un conjunto cerrado de candidatos.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribución. Es un bloqueo relevante para cualquier despliegue en producción.
- Idiomas no declarados: no hay información sobre el soporte del castellano ni de otras lenguas, por lo que se desconoce si el modelo generaliza fuera del idioma de sus datos de entrenamiento.
- Tarea restringida a conjunto cerrado: solo puntúa candidatos proporcionados explícitamente; no detecta categorías fuera del conjunto salvo que se incluya una opción explícita del tipo "ninguna de las anteriores".
- Límite de 2 a 16 candidatos: fuera de ese rango no hay garantía de comportamiento correcto.
- Riesgo de alucinación: al ser un clasificador, el modo de fallo no es inventar texto, sino asignar alta probabilidad a una etiqueta incorrecta, especialmente con contextos ambiguos o fuera de distribución.
- Falta de benchmarks y de evaluación de calibración: no hay métricas publicadas que respalden la calidad de las probabilidades ni la robustez del modelo.
- Ejecución de código remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio. Debe auditarse el código personalizado antes de desplegarlo en entornos sensibles.
- Madurez y adopción limitadas: 48 descargas y 3 me gusta, repositorio creado y actualizado en apenas tres días, sin comunidad ni mantenimiento demostrable.
- Contexto máximo no documentado: se desconoce cuántos tokens de contexto admite, lo que dificulta dimensionar su uso con entradas largas.
- Método de entrenamiento poco documentado: el autor menciona DSBT sin detallar su definición ni la composición del dataset, lo que limita la reproducibilidad y la evaluación de sesgos.
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Q1z/Pivot
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Los resultados de la búsqueda web consultada hacen referencia a proyectos homónimos sin relación con este modelo (Pivot 0.5 de shortcut.ai, el método PIVOT para agentes en arXiv, artículos sobre "pivotes" empresariales hacia la IA y el "Pivot Model" de asignación de capital), por lo que no se incluyen como enlaces relevantes.
