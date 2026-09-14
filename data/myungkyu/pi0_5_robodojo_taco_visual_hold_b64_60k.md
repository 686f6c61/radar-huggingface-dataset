# Myungkyu/pi0_5_robodojo_taco_visual_hold_b64_60k

## Resumen

`pi0_5_robodojo_taco_visual_hold_b64_60k` es una política robótica de bajo nivel (vision-language-action, VLA) publicada por el usuario Myungkyu en HuggingFace. Se trata de un ajuste fino del modelo base `lerobot/pi05_base`, entrenado sobre el conjunto [`Myungkyu/RoboDojo-taco-visual-gemini`](https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-visual-gemini), compuesto por demostraciones de 8 tareas bimanuales de sobremesa sobre robot real, con 100 demostraciones por tarea, anotadas con etiquetas densas de subtarea generadas de forma offline. El repositorio ocupa 9,4 GB y contiene pesos en formato safetensors con 4.143.404.816 parámetros (unos 4,14 mil millones).

Su relevancia es acotada pero específica: no es un modelo de propósito general, sino un checkpoint de investigación para el banco de pruebas RoboDojo, orientado a evaluar políticas de horizonte largo en manipulación bimanual. La innovación declarada es doble: por un lado, una arquitectura Pi0.5 con tres vistas de cámara en vivo (cabeza y ambas muñecas) más una ranura de keyframe en la que se dibuja un marcador de punto sobre el fotograma de cabeza; por otro, un esquema de *subtask hold* en el que la cola del chunk de acciones que excede el final de la subtarea actual repite el último objetivo intra-subtarea.

El modelo se distribuye a través de la librería LeRobot y su configuración depende de un fork de dicha librería: el campo `action_hold_after_subtask` es ignorado por LeRobot estándar. No se declara licencia, no se publican idiomas soportados ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo visión-lenguaje-acción); ajuste fino de `lerobot/pi05_base`; tres vistas de cámara en vivo más una ranura de keyframe |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones), según los pesos safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no se ofrecen variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (el modelo recibe texto de subtarea, pero no se especifica el idioma de entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Dataset de entrenamiento | `Myungkyu/RoboDojo-taco-visual-gemini` |
| Configuración de entrenamiento | Batch del optimizador 64, 60.000 pasos, checkpoint final |
| Entradas | Imagen de cabeza, imágenes de muñeca izquierda y derecha, ranura de keyframe (fotograma de cabeza con marcador), propiocepción y texto de subtarea visual |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 13 de septiembre de 2026 (según metadatos del repositorio), actualizado el mismo día |

## Arquitectura y entrenamiento

La model card describe la arquitectura como Pi0.5, con una configuración de entrada poco habitual: tres vistas de cámara en vivo (cabeza, muñeca izquierda y muñeca derecha) más una cuarta ranura de keyframe. Esa ranura contiene el fotograma de cabeza con la posición objetivo dibujada como marcador de punto (disco rojo de radio igual al 1,9 % del ancho, con anillo blanco) cuando la etiqueta nombra una posición; en caso contrario contiene una copia simple del fotograma. Cuando hay marcador, la posición desaparece del texto y la instrucción pasa a referirse a "the location marked in the keyframe" o "<cell> marked in the keyframe". Los detalles internos del backbone (número de capas, mecanismo de atención, si emplea flow matching u otra parametrización de acciones) no se detallan en la información disponible.

El entrenamiento consiste en un ajuste fino supervisado sobre `lerobot/pi05_base` con 60.000 pasos y batch 64, partiendo de demostraciones anotadas con subtareas. No se documentan fases de RLHF, DPO ni refuerzo; tampoco se especifica el número total de tokens, la composición exacta del dataset más allá de las 8 tareas y 100 demostraciones por tarea, ni si hubo aumentos de datos. La peculiaridad técnica central es el *subtask hold*: durante el entrenamiento se generan chunks de acción en los que la cola posterior al final de la subtarea actual repite el último objetivo intra-subtarea. En inferencia, el campo `action_hold_after_subtask: true` de `config.json` activa este comportamiento, y el adaptador de RoboDojo usa un detector de hold (`LL_HOLD_DETECT=1`) para volver a planificar en cuanto el chunk predicho se estabiliza.

## Capacidades

- Generación de chunks de acciones para control de un robot bimanual de sobremesa, no generación de texto libre como función principal.
- Entrada multimodal con tres flujos de imagen en vivo (cabeza y dos muñecas) más una ranura de keyframe con marcador de punto.
- Condicionamiento por texto de subtarea visual, con referencias del tipo "the location marked in the keyframe" o "<cell> marked in the keyframe".
- Uso de propiocepción como entrada adicional junto a las imágenes y el texto.
- Comportamiento de *subtask hold*: repetición del último objetivo intra-subtarea en la cola del chunk y re-planificación cuando el chunk se estabiliza.
- Multilingüismo: no disponible; no se documentan capacidades de cambio de idioma.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Comportamiento agéntico o razonamiento multi-paso explícito: no disponible.
- Código, matemáticas, visión general, audio o modo de pensamiento (*thinking*): no disponible; son capacidades fuera del alcance declarado de una política de acción de bajo nivel.

## Casos de uso

- Manipulación bimanual de sobremesa en horizonte largo: la política está entrenada específicamente para 8 tareas de este tipo, con 100 demostraciones cada una, por lo que es directamente aplicable a esas tareas sobre el montaje robótico correspondiente, siempre que se replique la configuración de cámaras y propiocepción.
- Banco de pruebas para investigación en VLA: sirve como checkpoint de referencia del pipeline RoboDojo para comparar variantes de ajuste fino, esquemas de anotación o estrategias de re-planificación bajo las mismas 8 tareas.
- Evaluación de estrategias de chunking de acciones: el campo `action_hold_after_subtask` permite comparar empíricamente el *subtask hold* frente a la re-planificación continua, midiendo éxito de tarea y número de re-planificaciones.
- Estudio del condicionamiento visual por keyframe: la ranura con marcador de punto permite analizar hasta qué punto el modelo sigue instrucciones espaciales señaladas gráficamente en lugar de descritas por texto.
- Punto de partida para ajustes finos posteriores: al estar en formato LeRobot y derivar de `lerobot/pi05_base`, puede reentrenarse con nuevas demostraciones anotadas con subtareas siguiendo el mismo procedimiento (batch y número de pasos ajustables).
- Investigación en anotación offline de subtareas: el dataset asociado, con etiquetas densas de subtarea, es útil para estudiar cómo la granularidad de las etiquetas afecta al comportamiento de la política en tareas de horizonte largo.
- Replicación y auditoría de resultados: al ser un checkpoint final completo (60.000 pasos), permite reproducir evaluaciones en RoboDojo sin reentrenar desde el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card identifica el conjunto de tareas (8 tareas bimanuales de sobremesa sobre robot real en RoboDojo, 100 demostraciones cada una) y la configuración de entrenamiento (batch 64, 60.000 pasos, checkpoint final), pero no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo teórico a partir de 4,14 mil millones de parámetros): ~8,3 GB en bf16/fp16, ~16,6 GB en fp32, ~4,1 GB en int8 y ~2,1 GB en int4. Estas cifras no están confirmadas por el autor y excluyen memoria para activaciones, buffers de imagen y estado del planificador.
- El repositorio pesa 9,4 GB, por encima de los ~8,3 GB que ocuparían los pesos en bf16, lo que sugiere artefactos adicionales empaquetados; el desglose no está documentado.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 12-16 GB de VRAM (por ejemplo, RTX 4080 o RTX 4090) debería poder alojar los pesos en bf16, pero el control robótico en tiempo real impone requisitos de latencia que no se han publicado. Para entrenamiento, el batch 64 y 60.000 pasos sugieren GPU de datacenter (A100, H100 o equivalentes), sin confirmación del autor.
- Compatibilidad con GPU de consumo: probable en modelos con 12 GB o más de VRAM en bf16, siempre que la latencia de inferencia sea suficiente para el bucle de control; no verificado.
- Opciones de despliegue: la librería declarada es LeRobot; llama.cpp y Ollama no son aplicables al no existir pesos GGUF y tratarse de una política de acción, no de un modelo de lenguaje. vLLM y TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponible. El comportamiento en inferencia depende de la re-planificación al estabilizarse el chunk predicho (detector de hold del adaptador de RoboDojo, `LL_HOLD_DETECT=1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi0_5_robodojo_taco_visual_hold_b64_60k` | 4,14 mil millones | No disponible | 8 tareas bimanuales de sobremesa (RoboDojo) | No disponible | HuggingFace, 0 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | Política generalista previa al ajuste fino | No disponible | HuggingFace |
| Otras alternativas de la categoría VLA (pi0, OpenVLA, GR00T, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye especificaciones ni resultados de modelos comparables, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación verificable es con el modelo base: este checkpoint añade el ajuste fino sobre el dataset RoboDojo, la ranura de keyframe con marcador y el esquema de *subtask hold*, que el modelo base no incorpora.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; además, la licencia del modelo base `lerobot/pi05_base` impone sus propias condiciones, que deben verificarse por separado.
- Ausencia total de validación pública: 0 descargas y 0 likes, sin benchmarks publicados ni métricas de tasa de éxito en las 8 tareas de RoboDojo.
- Fuerte acoplamiento al montaje: el modelo espera tres cámaras concretas (cabeza, muñeca izquierda, muñeca derecha), señales de propiocepción y una ranura de keyframe generada de forma específica; cualquier cambio de cámara, calibración o robot invalida el ajuste.
- Dependencia de un fork de LeRobot: el campo `action_hold_after_subtask` es ignorado por LeRobot estándar, y el detector de hold requiere `LL_HOLD_DETECT=1` en el adaptador de RoboDojo. Sin ese entorno, el comportamiento de la política cambia.
- Configuraciones con rutas locales: `config.json` referencia el backbone y el tokenizer por identificador de hub o por rutas locales del sitio de entrenamiento; es necesario redirigirlos a copias locales antes de cargar el modelo.
- Distribución de tareas muy estrecha: 8 tareas de sobremesa con 100 demostraciones cada una; no hay evidencia de generalización a objetos, entornos o morfologías no vistas.
- Riesgo de fallo silencioso: como política de acción, los errores no se manifiestan como alucinaciones de texto, sino como acciones físicas incorrectas; requiere supervisión y paradas de seguridad en cualquier despliegue sobre hardware real.
- Idiomas y datos demográficos: no se documenta el idioma del texto de subtarea ni la composición demográfica de los datos; no es posible evaluar sesgos.
- Contexto: no se especifica ninguna longitud de contexto, ya que la política opera sobre observaciones recientes y chunks de acción.
- Fecha de publicación anómala (13 de septiembre de 2026) en los metadatos del repositorio; conviene verificar la vigencia y posibles actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_taco_visual_hold_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-visual-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Perfil del autor: https://huggingface.co/Myungkyu
- Paper, blog o repositorio de RoboDojo: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas genéricas de LinkedIn y Zhihu sin relación con el contenido).
