# NaaaaaiVe6/franka-10demos-normal_task2_cartesian_20260913T212156Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de política robótica para un brazo Franka, derivado de la familia pi0.5 y etiquetado dentro del ecosistema openpi. El nombre del modelo (franka-10demos-normal_task2_cartesian_...-step-10000) indica que se trata de un ajuste fino sobre 10 demostraciones ("10demos") para una tarea concreta ("task2"), con una representación de acciones cartesianas y capturado en el paso 10.000 de entrenamiento. No es un modelo de lenguaje general, sino un modelo de visión-lenguaje-acción (VLA) orientado al control de un manipulador.

El checkpoint pesa 3.616.757.520 parámetros (aproximadamente 3,6 mil millones) en formato safetensors, con un tamaño de repositorio de 7,2 GB, coherente con pesos en bfloat16. Fue convertido de JAX a PyTorch en bfloat16 manteniendo la configuración de entrenamiento original del modelo Franka. La representación de acciones es cartesiana absoluta (XYZ + cuaternión xyzw + pinza binaria -1/+1), no acciones delta del controlador.

Su relevancia es fundamentalmente de investigación: permite reproducir, evaluar y comparar un ajuste fino de bajo número de demostraciones sobre un brazo Franka real, y sirve como referencia para pipelines de aprendizaje por imitación dentro de openpi. La información pública sobre licencia, idiomas y benchmarks es inexistente, y la model card advierte explícitamente de que ciertas convenciones del controlador requieren confirmación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (etiqueta "pi05"; la librería openpi apunta a la familia pi0.5 de tipo vision-language-action) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (salida de acciones: 50 pasos x 32 coordenadas, de las que solo las 8 primeras son acciones del robot) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible; no es un modelo de lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), convertido desde JAX a PyTorch |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Las etiquetas "openpi" y "pi05" sitúan el modelo en el ecosistema openpi y en la familia pi0.5, de tipo vision-language-action; sin embargo, la model card no especifica el backbone, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí se documenta es que los pesos se convirtieron de JAX a PyTorch en bfloat16 conservando la configuración de entrenamiento original del modelo Franka.

El entrenamiento corresponde a un ajuste fino sobre 10 demostraciones para una única tarea ("task2"). El modelo produce bloques de acción ("action chunking") con 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras representan acciones reales del robot. La representación de acciones es cartesiana absoluta (XYZ + cuaternión xyzw + pinza binaria -1/+1) y no acciones delta del controlador, un detalle crítico para integrarlo correctamente. Para la inferencia se debe usar el archivo `assets/franka/norm_stats.json` incluido y las transformaciones de entrenamiento correspondientes; el archivo `log.txt` describe el layout de salida, el límite de normalización, las entradas de cámara y estado, y las convenciones del controlador que quedan pendientes de confirmación.

## Capacidades

- Control de un brazo Franka mediante políticas de visión-lenguaje-acción (entradas de cámara y estado, salida de acciones).
- Aprendizaje por imitación a partir de demostraciones: ajuste fino con 10 demostraciones para una tarea concreta.
- Generación de bloques de acción de 50 pasos con 32 coordenadas por paso (las 8 primeras son las acciones del robot).
- Control cartesiano absoluto del efector final: posición XYZ, orientación en cuaternión xyzw y pinza binaria (-1/+1).
- Inferencia en PyTorch (pesos bfloat16 convertidos desde JAX).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modos de "thinking". No se declara soporte de visión más allá de las entradas de cámara propias de la política.

## Casos de uso

- Reproducción de experimentos de ajuste fino de bajo número de demostraciones: permite replicar el entrenamiento con 10 demostraciones sobre un Franka y comparar la política resultante en el paso 10.000.
- Evaluación de políticas VLA en robótica de manipulación: sirve como punto de referencia para medir éxito de tarea y robustez en el mismo setup de cámara y estado.
- Punto de partida para ajustes posteriores: al estar en formato PyTorch y safetensors, se puede usar como inicialización de nuevos entrenamientos para tareas relacionadas.
- Integración en pipelines de control cartesiano: al emitir acciones absolutas XYZ + cuaternión + pinza, encaja en controladores que acepten comandos cartesianos del efector final.
- Estudio del efecto del "action chunking": con 50 pasos de salida por inferencia, permite analizar la latencia de control frente a la frecuencia de replanificación.
- Comparación JAX frente a PyTorch: al ser una conversión documentada, facilita estudiar discrepancias numéricas entre ambos frameworks en políticas de robot.
- Docencia e investigación en aprendizaje por imitación: ejemplo práctico y acotado de cómo se estructura un checkpoint VLA (normalización, transformaciones, layout de acciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, error de posición, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB solo para los pesos en bfloat16 (3.616.757.520 parámetros x 2 bytes). Con activaciones, buffers de imagen y el coste del "action chunking" de 50 pasos x 32 coordenadas, conviene reservar alrededor de 10-12 GB, aunque no hay cifras oficiales.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, una GPU de 24 GB (por ejemplo RTX 4090, A10G, L4) debería bastar para inferencia en bfloat16; para entrenamiento o ajuste fino se necesitaría más memoria (A100 40/80 GB, H100) por los estados del optimizador.
- Compatibilidad con GPU de consumo: los pesos en bfloat16 caben en tarjetas de 16-24 GB (RTX 4080/4090, RTX 3090/4090). No se documenta una versión cuantizada a 8 o 4 bits.
- Opciones de despliegue: la librería indicada es openpi (implementaciones JAX y PyTorch). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para una comparativa rigurosa. La tabla siguiente recoge únicamente lo que puede afirmarse y marca el resto como no disponible.

| Modelo | Parametros | Salida de acciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (franka-10demos-normal_task2_cartesian, step 10000) | 3.616.757.520 | 50 pasos x 32 coordenadas (8 acciones) | no disponible | HuggingFace (safetensors) |
| pi0.5 base (familia de referencia) | no disponible | no disponible | no disponible | repositorio openpi |
| Otros ajustes finos de la misma familia | no disponible | no disponible | no disponible | HuggingFace |

No se conocen, a partir de la información disponible, métricas de rendimiento que permitan comparar este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado con solo 10 demostraciones: alta probabilidad de sobreajuste y capacidad de generalización muy limitada fuera de la tarea "task2" y del entorno de demostración.
- Específico de tarea y de robot: la política está asociada a un Franka y a una tarea concreta; no se declara transferencia a otros brazos, objetos o distribuciones de cámara.
- Representación de acciones: usa acciones cartesianas absolutas (XYZ + cuaternión xyzw + pinza binaria -1/+1), no deltas del controlador. Aplicarlas como si fueran deltas produciría comportamientos incorrectos.
- Layout de salida: solo las 8 primeras de las 32 coordenadas por paso son acciones del robot; ignorar esta estructura invalida el control.
- Normalización: es obligatorio usar `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes; omitirlos altera la escala de las acciones.
- Convenciones del controlador sin confirmar: la propia model card remite a `log.txt` y advierte de que ciertas convenciones requieren confirmación, lo que implica riesgo de integración incorrecta.
- Conversión JAX a PyTorch en bfloat16: puede introducir discrepancias numéricas respecto al modelo original en JAX.
- Licencia no disponible: sin licencia declarada no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: no aplica como modelo de lenguaje; no se declara soporte multilingüe ni de texto.
- Riesgo de alucinación: en el sentido de modelos generativos de texto no aplica, pero sí existe riesgo de acciones fuera de distribución cuando el estado observado difiere de las demostraciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de fiabilidad ni de tasa de éxito.
- Descargas y "likes" a cero en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task2_cartesian_20260913T212156Z-step-10000
- Archivo de log del repositorio: log.txt (incluido en el propio repositorio, junto a la model card)
- Estadísticas de normalización: assets/franka/norm_stats.json (incluido en el repositorio)
- Librería openpi: no se ha proporcionado un enlace directo en la información disponible
- La búsqueda web realizada no devolvió enlaces relevantes (únicamente resultados de Pinterest sin relación con el modelo).
