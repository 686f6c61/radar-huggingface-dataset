# ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.8

## Resumen

π₀ (Pi0) es un modelo de visión-lenguaje-acción (VLA) para control robótico general, desarrollado originalmente por Physical Intelligence. La ficha que nos ocupa, `ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.8`, es un ajuste fino de esa política subido a Hugging Face mediante la librería LeRobot, cuyo implementación de π₀ deriva del repositorio OpenPI del autor original. El modelo resuelve el problema de generar acciones motoras continuas a partir de observaciones visuales e instrucciones en lenguaje natural, en lugar de depender de programas específicos por tarea.

El checkpoint tiene 3.501.372.176 parámetros (≈3,5 mil millones) en formato safetensors, con un repositorio de 7,0 GB. Está especializado en el conjunto de datos `local/maniskill_placesphere_mixed30`, lo que sugiere un entrenamiento sobre el simulador ManiSkill con una mezcla de 30 configuraciones o tareas de tipo PlaceSphere; el sufijo `convex-0.8` del identificador no aparece explicado en la model card.

Su relevancia es acotada pero concreta: es un ejemplo de política VLA reproducible y totalmente abierta bajo licencia Apache 2.0, publicada con el ecosistema LeRobot, lo que permite inspeccionar el flujo de entrenamiento y evaluación. No obstante, el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta y carece de resultados de evaluación, por lo que debe considerarse un artefacto experimental y no una política validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀; el desglose interno (codificador visual, backbone de lenguaje y experto de acción) no se detalla en la model card |
| Parametros totales | 3.501.372.176 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | No disponible; la model card no especifica idiomas de las instrucciones |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Autor | ImKyungjin |
| Pipeline declarado | `robotics` |
| Dataset de entrenamiento | `local/maniskill_placesphere_mixed30` |
| Tamano del repositorio | 7,0 GB |
| Fecha de creacion / actualizacion | 15/09/2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como una política VLA para control robótico general y remite al blog de Physical Intelligence sobre π₀ y al repositorio OpenPI. No se detalla en la información proporcionada la composición exacta del backbone visual, el modelo de lenguaje subyacente ni el mecanismo de generación de acciones (por ejemplo, si se emplea flow matching o difusión sobre un experto de acción). Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

Sí se especifica el origen del pipeline de entrenamiento: LeRobot, con checkpoints generados mediante `lerobot-train` y evaluación mediante `lerobot-record`. Cabe señalar que el ejemplo de comando incluido en la propia model card usa `--policy.type=act`, que es la plantilla genérica de la documentación de LeRobot, no necesariamente la configuración empleada para entrenar esta política π₀; se trata de un ejemplo de uso del framework, no de una ficha reproducible de hiperparámetros.

El identificador del modelo apunta a un ajuste sobre `maniskill_placesphere_mixed30`, un entorno de simulación. El sufijo `convex-0.8` no está documentado y no puede interpretarse con rigor a partir de la información disponible (podría referirse a una configuración de muestreo, un parámetro de regularización o una variante del dataset, pero esto es especulación y no se afirma aquí).

## Capacidades

- Control robótico guiado por lenguaje: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, siguiendo el paradigma VLA de π₀.
- Manipulación de objetos en simulación: el entrenamiento sobre `maniskill_placesphere_mixed30` apunta a tareas de colocación ("place") de esferas u objetos en entornos ManiSkill.
- Política generalista dentro de su dominio: a diferencia de un controlador programado para una trayectoria fija, la política aprende a mapear percepción e instrucción a acciones.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios mediante las herramientas `lerobot-train` y `lerobot-record`.
- Ejecución sobre robots compatibles con LeRobot: la documentación de ejemplo menciona configuraciones como `so100_follower`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se especifica el idioma de las instrucciones.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles más allá del uso de entrada visual implícito en un modelo VLA; la model card no detalla modalidades ni modos adicionales.

## Casos de uso

- Investigación en políticas VLA reproducibles: servir como punto de partida o referencia para comparar implementaciones de π₀ dentro de LeRobot, ya que los pesos son públicos y la licencia Apache 2.0 permite inspección y modificación.
- Experimentos de ajuste fino en simulación: usar este checkpoint como inicialización para nuevas tareas de manipulación en ManiSkill, aprovechando que ya está adaptado a un dominio de colocación de objetos.
- Evaluación de generalización entre tareas: con un dataset mixto de 30 configuraciones, el modelo permite estudiar hasta qué punto una única política cubre variaciones de posición, objeto o instrucción dentro del simulador.
- Docencia y prototipado en robótica: al ejecutarse con `lerobot-record` sobre robots compatibles como `so100_follower`, resulta adecuado para prácticas de laboratorio donde se quiera reproducir el ciclo completo de entrenamiento y despliegue.
- Generación de datos sintéticos de trayectorias: las políticas entrenadas en simulación pueden emplearse para producir episodios adicionales que después se filtren y reutilicen en entrenamientos posteriores o en estrategias de aprendizaje por imitación.
- Pruebas de pipeline de despliegue: validar infraestructura de inferencia robótica (carga de safetensors de 7 GB, latencia de bucle de control, comunicación con el robot) antes de invertir en modelos mayores.
- Estudio de transferencia sim-a-real: emplear este checkpoint como extremo simulado de una comparativa para medir la brecha de transferencia frente a políticas entrenadas con datos reales, siempre que exista acceso a un robot físico.
- Base para comparativas de eficiencia: con 3,5 mil millones de parámetros, es un punto de referencia útil para medir consumo de VRAM y latencia frente a políticas VLA de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea, curvas de entrenamiento, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El repositorio registra además 0 descargas, por lo que no existe evidencia externa de evaluación en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 3.501.372.176 parámetros; son estimaciones aritméticas, no medidas publicadas por el autor):

| Precision | VRAM aproximada solo para pesos | Comentario |
|---|---|---|
| FP32 | ~14 GB | Requiere GPU de gama alta o memoria unificada amplia |
| BF16 / FP16 | ~7 GB | Configuracion tipica de inferencia |
| Int8 | ~3,5-4 GB | Requiere cuantizacion propia; no se distribuyen pesos cuantizados |
| Int4 | ~1,8-2 GB | Requiere cuantizacion propia; no verificada |

- GPU recomendadas: para entrenamiento o ajuste fino, A100 (40/80 GB), H100 o GPUs de 24 GB o mas con memoria suficiente para el estado del optimizador; para inferencia en BF16, RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB) o A100/H100.
- Compatibilidad con GPU de consumo: si, cabe en BF16 en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, asumiendo que el resto del pipeline (procesado de imagen, buffers) no consuma el margen libre. No se confirma compatibilidad con GPUs de 8-12 GB sin cuantizacion.
- Plataformas embebidas: no disponible; no se documenta despliegue en Jetson u otros aceleradores de borde.
- Opciones de despliegue: LeRobot (scripts `lerobot-train`, `lerobot-record`) sobre PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni motores de inferencia orientados a texto, algo esperable en un modelo de politica robótica.
- Latencia y throughput: no disponibles. En control robótico la latencia del bucle de inferencia es crítica, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.8` | 3,50 B | VLA (π₀ ajustado, LeRobot) | No disponible | Apache 2.0 | Pesos safetensors en Hugging Face; 0 descargas |
| π₀ base (Physical Intelligence / OpenPI) | Orden de 3 B segun la documentacion publica del proyecto | VLA | No disponible | No disponible en la informacion consultada | Repositorio OpenPI y blog de Physical Intelligence |
| OpenVLA | Aproximadamente 7 B | VLA | No disponible | No disponible en la informacion consultada | Pesos publicos en Hugging Face |
| ACT (LeRobot) | Decenas de millones (depende de la configuracion) | Politica de imitacion por transformer de acciones | No aplica (sin instruccion de lenguaje) | Apache 2.0 en LeRobot | Implementado en LeRobot; se usa como `policy.type=act` |

Nota: los datos de π₀ base, OpenVLA y ACT provienen de conocimiento general de la literatura y no de la información proporcionada en esta consulta; conviene verificarlos en sus respectivas fichas antes de citarlos. No se dispone de comparaciones de rendimiento entre estos modelos y el checkpoint analizado, ya que este ultimo no publica resultados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, métricas de error ni curvas de entrenamiento, por lo que no puede afirmarse que la política funcione correctamente ni siquiera en el simulador para el que fue entrenada.
- Especializacion estrecha: el ajuste sobre `maniskill_placesphere_mixed30` limita la política al dominio de ese dataset; no debe esperarse generalización a tareas de manipulación distintas sin un nuevo ajuste fino.
- Brecha simulación-realidad: al provenir de un entorno simulado (ManiSkill), el comportamiento en un robot físico puede degradarse de forma significativa por diferencias de dinámica, iluminación, texturas y calibración.
- Documentación incompleta: la model card no describe hiperparámetros, número de tokens de entrenamiento, composición del dataset ni el significado del sufijo `convex-0.8`.
- Riesgo de acciones inseguras: en robótica, un fallo del modelo no produce texto incorrecto sino movimientos físicos potencialmente dañinos; es imprescindible aplicar límites de par, paradas de emergencia y validación en espacio de trabajo simulado o con salvaguardas.
- Idiomas: no se especifica qué idioma aceptan las instrucciones de lenguaje, lo que impide garantizar el funcionamiento en castellano; lo habitual en este tipo de modelos es el inglés.
- Sesgos: no hay información sobre la distribución demográfica del dataset ni sobre sesgos de percepción; un dataset de simulación puede sobrerrepresentar geometrías, colores y materiales concretos.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero al ser un derivado de π₀ conviene verificar las condiciones del proyecto original (Physical Intelligence / OpenPI) antes de explotarlo comercialmente.
- Reproducibilidad: la propia model card incluye un comando de entrenamiento con `--policy.type=act`, que corresponde a la plantilla genérica de LeRobot y no a una configuración π₀; no debe tomarse como receta exacta de este checkpoint.
- Trazabilidad: con 0 descargas y 0 "likes", no existe validación por parte de la comunidad ni informes independientes de uso.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.8
- Blog de π₀ de Physical Intelligence (referenciado en la model card): https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Repositorio OpenPI (implementación de referencia de π₀): no se incluye URL directa en la model card; debe localizarse a través del blog de Physical Intelligence.

Nota adicional: los resultados de la búsqueda web realizada no contenían información relevante sobre el modelo (devolvieron páginas de ayuda de Gmail y YouTube), por lo que no se han podido incorporar datos externos, papers ni evaluaciones independientes.
