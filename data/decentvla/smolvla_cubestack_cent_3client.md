# DecentVLA/smolvla_cubestack_cent_3client

## Resumen

SmolVLA CubeStack Centralized es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por el equipo DecentVLA como parte de un estudio sobre aprendizaje federado aplicado a la manipulación robótica. Se trata de un fine-tune completo del modelo base `lerobot/smolvla_base` sobre la unión centralizada de seis tareas de apilamiento de cubos (dos por brazo robótico, en tres entornos distintos: harry, zhekai y kevin), con un presupuesto total de cómputo equivalente al del estudio federado de tres clientes (3 × 50 rondas × 250 pasos locales, es decir, 37.500 pasos de entrenamiento). El modelo exporta en formato nativo de LeRobot con acciones y estados reales de 6 grados de libertad.

El modelo resuelve el problema de control de un brazo robótico para apilar cubos de colores a partir de observaciones visuales de dos cámaras (frontal y de muñeca), con una tercera cámara rellenada con ceros. Su relevancia radica en que sirve como punto de comparación centralizado frente a los modelos federados del mismo estudio, permitiendo evaluar la degradación de rendimiento debida a la distribución no-IID de los datos entre clientes. La arquitectura interna no se detalla en la información disponible, pero al estar basado en `smolvla_base` se trata de un modelo de lenguaje y visión de aproximadamente 450 millones de parámetros, entrenado con la receta SmolVLA LIBERO (tasa de aprendizaje 1e-4, coseno, batch 32, gradiente recortado a 10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de indicar que se basa en `lerobot/smolvla_base`, un VLA de la familia SmolVLA. Se sabe que es un modelo de 450M de parámetros que integra procesamiento de visión y lenguaje para generar acciones de 6 grados de libertad. El entrenamiento se realizó mediante fine-tune completo (sin congelar el VLM y sin usar LoRA) sobre el conjunto de datos unificado de seis tareas de apilamiento de cubos, con un normalizador compartido calculado sobre todo el repositorio combinado. Se empleó la receta de entrenamiento SmolVLA LIBERO: tasa de aprendizaje 1e-4 con decaimiento coseno, tamaño de lote 32 y recorte de gradiente a 10. La pérdida final de entrenamiento fue de 0,0074. El entrenamiento se ejecutó en hardware Isambard-AI (GPUs GH200) utilizando la librería `decent-vla` disponible en GitHub.

## Capacidades

- Control robótico de apilamiento de cubos: genera comandos de acción de 6 grados de libertad (posición y orientación del efector) para apilar cubos de colores.
- Percepción visual multimodal: procesa imágenes de dos cámaras (frontal y de muñeca) para decidir las acciones; una tercera cámara se rellena con ceros.
- Ejecución de tareas de manipulación de precisión: entrenado específicamente para la tarea SO-101 CubeStack del benchmark de robótica.
- Compatibilidad con el ecosistema LeRobot: exportación nativa con configuración portable, lo que facilita su despliegue en entornos que usen esta librería.
- No incluye capacidades de generación de texto, razonamiento simbólico, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en aprendizaje federado para robótica: permite comparar el rendimiento de un entrenamiento centralizado frente a estrategias federadas con particiones no-IID, como las descritas en el estudio de tres clientes.
- Benchmark de apilamiento de cubos en entornos simulados o reales: el modelo puede desplegarse en un brazo robótico compatible con LeRobot para evaluar la tarea SO-101 CubeStack.
- Validación de técnicas de fine-tune eficiente en VLA: al ser un fine-tune completo sin LoRA, sirve como referencia para medir el impacto de métodos de adaptación de parámetros reducidos.
- Estudio de generalización entre distribuciones de color: dado que cada cliente del estudio federado estaba ciego a un color, este modelo centralizado sirve para medir la capacidad de generalización a combinaciones de colores no vistas.
- Desarrollo de sistemas de control robótico basados en visión: puede servir como punto de partida para fine-tunes posteriores en tareas de manipulación similares.
- Evaluación de infraestructuras de entrenamiento: su entrenamiento en GH200 con la librería `decent-vla` lo convierte en un caso de uso para probar pipelines de entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento final (0,0074), que no constituye una evaluación de rendimiento en la tarea. No se dispone de comparativas con otros modelos en tareas de apilamiento de cubos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- Por el tamaño del modelo (450M parámetros), se estima que en FP16 necesitaría aproximadamente 0,9 GB de VRAM solo para los pesos, más overhead de activaciones y optimizador durante inferencia. En la práctica, una GPU con 8-12 GB de VRAM (como RTX 3060, RTX 4060 o superior) podría ser suficiente para inferencia, aunque no hay confirmación oficial.
- Para entrenamiento o fine-tune adicional, se recomienda una GPU con al menos 24 GB de VRAM (como RTX 3090, A10G o superior), dado que el entrenamiento original se realizó en GH200.
- Opciones de despliegue: al estar exportado en formato LeRobot, puede ejecutarse con la librería LeRobot. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA en la información proporcionada. El propio estudio menciona una comparación con un estudio equivalente de pi0.5 de tres clientes, pero no se ofrecen datos de rendimiento. Por tanto, no se puede establecer una comparativa cuantitativa. Se puede indicar que `lerobot/smolvla_base` es el modelo base y que existen variantes federadas del mismo estudio (no publicadas en este repositorio), pero no hay datos para comparar.

## Limitaciones y advertencias

- Modelo experimental: se trata de un fine-tune de investigación, sin validación en entornos de producción reales.
- Especialización limitada: entrenado únicamente para la tarea de apilamiento de cubos con una configuración específica de cámaras (frontal y muñeca, con una tercera cámara rellenada con ceros). No generaliza a otras tareas de manipulación sin fine-tune adicional.
- Dependencia de la configuración de sensores: el rendimiento puede degradarse si se cambia la disposición de las cámaras o el tipo de brazo robótico.
- Sin capacidades de lenguaje natural: no puede interpretar instrucciones verbales ni mantener diálogos.
- Riesgo de sobreajuste a los datos de entrenamiento: la pérdida final de 0,0074 sugiere un ajuste muy fuerte al conjunto de entrenamiento, lo que podría implicar baja generalización a variaciones no vistas.
- Sin evaluación de sesgos: no se ha realizado ningún estudio de sesgos o comportamientos no deseados en entornos físicos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos reales con presencia humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DecentVLA/smolvla_cubestack_cent_3client
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería de entrenamiento decent-vla: https://github.com/kevinDuan1/decent-vla
