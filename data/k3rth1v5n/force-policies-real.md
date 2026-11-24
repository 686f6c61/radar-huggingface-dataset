# k3rth1v5n/force-policies-real

## Resumen

force-policies-real es un repositorio de políticas de manipulación robótica entrenadas sobre demostraciones de robot real, publicado por el usuario k3rth1v5n en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un conjunto de checkpoints de control motor orientados a tareas de manipulación con contacto físico intenso (contact-rich manipulation). En el momento de la publicación el repositorio contiene una única política: ForceVLA, un ajuste fino completo de π0-base para la tarea de presionar un bloque y voltearlo.

La arquitectura subyacente es ForceVLA, una política de visión-lenguaje-acción (VLA) que parte de π0-base, el modelo base de Physical Intelligence, el cual a su vez se construye sobre PaliGemma. La innovación diferencial frente a políticas VLA puramente visuales es la incorporación de la señal de fuerza (wrench) estimada por el efector final como modalidad de entrada, algo crítico en tareas donde la información visual no basta para regular la presión aplicada.

El repositorio tiene 12,2 GB y está pensado para su uso en robótica de manipulación con brazos colaborativos. Los datos de entrenamiento no se incluyen. La licencia es Gemma, lo que impone restricciones de uso derivadas de los términos de Google. Es relevante ahora porque ejemplifica la tendencia hacia políticas VLA multimodales que integran propriocepción y fuerza, un paso necesario para tareas de ensamblaje y contacto que los modelos solo-visión no resuelven de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ForceVLA (política vision-language-action basada en π0-base, inicializado desde PaliGemma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (repo de 12,2 GB; el README no detalla el formato) |

## Arquitectura y entrenamiento

ForceVLA es una política de visión-lenguaje-acción que extiende el paradigma de π0-base incorporando la señal de fuerza como entrada adicional. El modelo se inicializa desde π0-base, que a su vez deriva de PaliGemma, y en este repositorio se ha sometido a un ajuste fino completo (full fine-tune) sobre demostraciones reales. La política combina percepción visual (una cámara RGB externa) con la wrench estimada por el efector final, lo que permite condicionar la acción sobre información de contacto que la visión por sí sola no captura.

Los datos de entrenamiento se registraron sobre un brazo seguidor Flexiv Rizon 4 con pinza Enlight L, mediante teleoperación bilateral, a 15 Hz de frecuencia de control, con una cámara RGB externa y la wrench estimada del seguidor. El checkpoint incluido corresponde a la tarea `real_flipblock_1124` con receta `forcevla_15ep_flipblock_1124_force0`, es decir, 15 épocas de entrenamiento sobre la tarea de presionar y voltear un bloque. El conjunto de datos de entrenamiento no forma parte del repositorio. No se especifican en la información disponible el número de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Manipulación robótica con contacto físico: ejecuta políticas de control para tareas de contacto intenso, en este caso presionar un bloque y voltearlo.
- Percepción multimodal: combina una cámara RGB externa con la wrench estimada del efector final para condicionar la acción.
- Control a 15 Hz sobre un brazo Flexiv Rizon 4 con pinza Enlight L.
- Política específica por tarea: cada carpeta del repositorio contiene una política entrenada para una tarea concreta.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; el modelo está orientado exclusivamente al control robótico.

## Casos de uso

- Volteo de bloques en líneas de montaje: la política `real_flipblock_1124` permite a un brazo Flexiv Rizon 4 presionar un bloque y girarlo, una operación que requiere regular la fuerza de contacto y que la señal de wrench hace viable.
- Investigación en manipulación con contacto: sirve como checkpoint de referencia para reproducir y comparar recetas ForceVLA sobre hardware real, dado que el README documenta la receta de entrenamiento (15 épocas, señal de fuerza).
- Prototipado de políticas VLA con fuerza: al partir de π0-base y estar ajustada sobre datos reales, puede utilizarse como punto de partida para experimentos de ajuste fino en tareas similares de contacto.
- Validación de pipelines de teleoperación bilateral: los datos se capturaron con teleoperación bilateral a 15 Hz, por lo que el checkpoint es útil para verificar la coherencia entre la política aprendida y el esquema de captura.
- Benchmarking de políticas VLA multimodales: permite comparar el rendimiento de ForceVLA frente a políticas solo-visión en una tarea concreta de contacto, siempre que se disponga del hardware equivalente.
- Demostraciones de laboratorio en robótica colaborativa: adecuado para entornos de investigación con brazos Flexiv y pinzas Enlight L donde se quiera ilustrar el uso de señales de fuerza en políticas aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,2 GB, pero el README no detalla el tamaño del checkpoint ni su precisión, por lo que no puede estimarse la VRAM con rigor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan en el README; el propio autor remite a la carpeta de la tarea y a su `CLAUDE.md` para conocer las instrucciones de carga.
- Latencia y throughput: no disponibles. El único dato de control es la frecuencia de 15 Hz usada durante la captura de datos, que no equivale necesariamente a la frecuencia de inferencia.
- Hardware robótico asociado: brazo Flexiv Rizon 4 con pinza Enlight L y una cámara RGB externa.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|
| force-policies-real (ForceVLA) | Política VLA con fuerza | RGB + wrench | gemma | Hugging Face, repo de 12,2 GB |
| π0-base | Política VLA base | Visión (y otras modalidades según configuración) | no disponible en esta ficha | Referencia del autor, no verificada aquí |
| PaliGemma | Modelo visión-lenguaje | Imagen + texto | gemma | Ampliamente disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de los modelos comparables que permitan una comparación cuantitativa rigurosa. La comparación anterior es únicamente de naturaleza y licencia.

## Limitaciones y advertencias

- Política específica de tarea: el repositorio contiene una sola política entrenada para presionar y voltear un bloque; no es un modelo generalista y no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: los datos se capturaron con un Flexiv Rizon 4 y una pinza Enlight L; el comportamiento en otro hardware no está garantizado.
- Datos de entrenamiento no incluidos: no es posible auditar la distribución de las demostraciones ni reproducir el entrenamiento a partir del repositorio.
- Licencia Gemma: los pesos son derivados de Gemma y están sujetos a los Gemma Terms of Use, con las restricciones de uso que estos imponen; conviene revisarlos antes de cualquier uso comercial.
- Idiomas soportados: no disponibles; el modelo no está orientado a tareas lingüísticas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de fallo; al tratarse de una política de control, el riesgo relevante es el fallo de ejecución física, no la alucinación textual.
- Ausencia de benchmarks: no hay métricas publicadas de éxito en la tarea, lo que impide evaluar su fiabilidad antes de desplegarla.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/k3rth1v5n/force-policies-real
- Repositorio de ForceVLA: https://github.com/ft-robotic/ForceVLA
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
