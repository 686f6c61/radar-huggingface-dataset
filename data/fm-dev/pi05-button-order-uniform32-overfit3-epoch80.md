# fm-dev/pi05-button-order-uniform32-overfit3-epoch80

## Resumen

fm-dev/pi05-button-order-uniform32-overfit3-epoch80 es un ajuste fino mediante LoRA del modelo base physical-intelligence/pi05_base (π0.5), un modelo visión-lenguaje-acción (VLA) orientado al control robótico. El ajuste está especializado en una única tarea de manipulación sobre un brazo Franka: pulsar una secuencia de botones en el orden mostrado en un vídeo de demostración. Se trata de un experimento deliberadamente sobreajustado a tres trayectorias de entrenamiento concretas.

El entrenamiento utilizó el subconjunto de comportamiento formado por 529 ventanas H20 procedentes de los episodios 2, 6 y 17, con un batch global de 8 sobre una única RTX A6000 y 80 epochs del sampler (5.280 pasos). El checkpoint publicado es el de inferencia con EMA en el paso 5.280. El adaptador se denomina Cartesian8 LoRA y emplea la normalización original del split de entrenamiento.

Su relevancia es acotada y fundamentalmente metodológica: sirve como referencia de sobreajuste, como banco de pruebas para pipelines de inferencia VLA (carga de pesos, normalización, formato de acciones) y como línea base negativa frente a políticas generalistas. No hay benchmarks publicados, no se declara licencia y el repositorio registra 0 descargas y 0 valoraciones en el momento de redactar esta ficha. Las comprobaciones incluidas solo verifican que el modelo carga y produce salidas finitas sobre nueve observaciones de entrenamiento; no acreditan éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 base (modelo visión-lenguaje-acción) con adaptador Cartesian8 LoRA; detalle interno de la arquitectura base no disponible en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; utiliza 32 fotogramas de historial observado muestreados uniformemente (512 tokens de historial) más las vistas actuales de cámara base y muñeca, además del estado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instrucción de tarea está redactada en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye `params/` con los pesos EMA, `assets/` con normalización y política, `code/` con el código correspondiente, `requirements.txt` y `load_model.py` |
| Modelo base | physical-intelligence/pi05_base (π0.5) |
| Tarea | "Press the buttons in the order shown in the demonstration video." |
| Forma de salida | `[20, 8]`: 20 pasos de acción con `[x, y, z, qx, qy, qz, qw, gripper_open]`; posiciones en metros, cuaterniones XYZW unitarios, gripper 0 = cerrado / 1 = abierto |
| Tamano del repositorio | 5,8 GB |
| Checkpoint publicado | EMA en el paso 5.280 (80 epochs del sampler) |
| Estado del optimizador | no incluido |

## Arquitectura y entrenamiento

La política parte de π0.5 base y añade un adaptador LoRA denominado Cartesian8 sobre la salida de acciones cartesianas de 8 dimensiones. El entrenamiento se realizó sobre un subconjunto de comportamiento reducido a propósito: 529 ventanas H20 extraídas de tres episodios (`button_order_20260827_171329_079`, `button_order_20260827_171814_240` y `button_order_20260827_172703_063`). Se empleó batch global 8, una única RTX A6000, 66 actualizaciones por epoch del sampler y 80 epochs, lo que da los 5.280 pasos del checkpoint EMA publicado. La geometría de Status-D conserva su mezcla auxiliar Status original.

La entrada combina las vistas actuales de cámara base y muñeca, el estado del robot y 32 fotogramas de historial observado muestreados de forma uniforme (512 tokens de historial). La normalización usada es la del split de entrenamiento original. Las etiquetas de comando ausentes permanecieron enmascaradas durante el entrenamiento. La model card no detalla el número de tokens de entrenamiento, la composición completa del dataset, ni si hubo fases de RLHF o DPO; tampoco describe innovaciones de decodificación. Un requisito operativo relevante es que tanto Uniform32 como Status-D exigen historial observado real, y Status-D requiere además sus entradas Writer retenidas y contexto causal.

## Capacidades

- Generación de acciones de manipulación robótica: produce bloques de 20 acciones cartesianas de 8 dimensiones a partir de observaciones visuales, estado e historial.
- Ejecución condicionada por lenguaje: la política responde a la instrucción "Press the buttons in the order shown in the demonstration video."
- Percepción visual multivista: consume vistas de cámara base y de muñeca, además del estado del robot.
- Uso de historial temporal: integra 32 fotogramas de historial observado (512 tokens) para desambiguar la secuencia de pulsaciones.
- Control de gripper: la octava dimensión de la acción codifica apertura y cierre.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es una política de control de bajo nivel, no un agente conversacional.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, audio, etc.): no disponibles; solo se documenta el modo de inferencia con EMA y la variante Status-D.

## Casos de uso

- Reproducción de un experimento de sobreajuste controlado: permite estudiar hasta qué punto una política VLA memoriza tres trayectorias cuando se entrena durante 80 epochs sobre 529 ventanas, sirviendo como referencia metodológica en investigación sobre generalización.
- Validación de pipelines de inferencia VLA: el repositorio incluye `load_model.py`, `requirements.txt` y `inference-check.json`, de modo que puede usarse para verificar que la carga de pesos, la normalización y el formateo de acciones funcionan antes de escalar a entrenamientos mayores.
- Pruebas de integración con un brazo Franka: la salida en coordenadas cartesianas absolutas con cuaterniones XYZW unitarios y posición en metros facilita conectar el modelo a un controlador de robot para pruebas de bucle cerrado en laboratorio, siempre con supervisión.
- Depuración de pipelines de datos de teleoperación: al estar restringido a tres episodios identificables por nombre, permite trazar de forma exacta qué ventanas de entrenamiento producen qué comportamientos y detectar fugas de información o errores de etiquetado.
- Comparación de checkpoints en un mismo conjunto de validación: los nueve puntos de control registrados en `inference-check.json` permiten comparar salidas frente a otros checkpoints del mismo entrenamiento para medir estabilidad y finitud numérica.
- Docencia y divulgación sobre VLA: sirve para ilustrar en un curso o taller la anatomía de un adaptador LoRA sobre un modelo visión-lenguaje-acción y el formato de acciones típico de una política de imitación.
- Generación de datos sintéticos de trayectoria en simulación (solo con mucha cautela): las secuencias de 20 acciones pueden servir como precondición de un controlador en un entorno simulado del mismo setup, aunque no hay evidencia publicada de que se transfiera fuera de las tres trayectorias.
- No se recomienda como componente de producción en robótica real: no existen benchmarks, validación en robot físico ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una comprobación de carga sobre nueve observaciones de entrenamiento registradas en `inference-check.json`; el propio autor indica que esa comprobación verifica carga y salidas finitas, pero no establece éxito en robot real ni un despliegue online del componente Writer.

## Requisitos de hardware

- Entrenamiento documentado: una única RTX A6000 (48 GB), batch global 8, 66 actualizaciones por epoch del sampler, 80 epochs hasta el paso 5.280.
- VRAM de inferencia: no disponible de forma explícita. El repositorio ocupa 5,8 GB; cargando pesos base y adaptador en precisión de 16 bits, una GPU de 24 GB (RTX 4090, RTX A6000, L40S) debería ser suficiente, pero es una estimación no verificada por el autor.
- GPU consumer: previsiblemente viable en tarjetas de gama alta con 24 GB. No se puede confirmar su funcionamiento en GPUs de 8 o 12 GB al no documentarse cuantizaciones.
- GPU de datacenter: A100 y H100 disponen de VRAM de sobra para esta política, aunque no aportan ventaja clara si el cuello de botella es el bucle de control del robot y no el cómputo del modelo.
- Opciones de despliegue: se incluyen `load_model.py` y `requirements.txt` para carga en Python. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni formatos GGUF. El modelo base π0.5 se sirve habitualmente con stacks propios en PyTorch o JAX, no mediante servidores de LLM convencionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / historial | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-uniform32-overfit3-epoch80 | no disponible | 32 fotogramas de historial (512 tokens) más vistas actuales | sin benchmarks publicados; solo comprobación de carga | no disponible | HuggingFace, 5,8 GB, 0 descargas |
| physical-intelligence/pi05_base (π0.5 base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | disponible como modelo base en HuggingFace |
| π0 (generación anterior de Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no verificado en las fuentes consultadas |
| Políticas VLA abiertas de propósito general (por ejemplo OpenVLA u otros) | no disponible | no disponible | no disponible | no disponible | no verificado en las fuentes consultadas |

La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre su base, por lo que no es posible construir una comparativa cuantitativa fiable. La diferencia cualitativa principal frente a π0.5 base es el alcance: este checkpoint está sobreajustado a tres trayectorias de una tarea de pulsación de botones, mientras que el base es una política generalista.

## Limitaciones y advertencias

- Sobreajuste explícito: el propio nombre y la model card indican que el modelo se entrenó sobre tres trayectorias durante 80 epochs; no cabe esperar generalización a otras tareas, posiciones de botones, objetos o entornos.
- Sin validación en robot real: `inference-check.json` solo confirma que el modelo carga y produce salidas finitas sobre nueve observaciones de entrenamiento. No hay evidencia de éxito en ejecución física ni de un despliegue online del Writer.
- Requisitos de entrada estrictos: Uniform32 y Status-D necesitan historial observado real; Status-D requiere además sus entradas Writer retenidas y contexto causal. Omitir estos elementos invalida la inferencia.
- Etiquetas de comando enmascaradas: las etiquetas de comando ausentes permanecieron enmascaradas durante el entrenamiento, lo que puede traducirse en comportamiento indefinido ante instrucciones distintas de la de entrenamiento.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de los tres episodios, con riesgo físico si se ejecuta sin límites de par o parada de emergencia.
- Sesgos conocidos: no disponibles; el autor no documenta análisis de sesgo, diversidad de escenarios ni robustez ante cambios de iluminación o disposición.
- Limitaciones de idioma: no disponible; la única instrucción documentada está en inglés y no se declara soporte multilingüe.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial. Es imprescindible contactar con el autor y revisar la licencia del modelo base physical-intelligence/pi05_base antes de cualquier uso productivo.
- Estado del optimizador no incluido: el repositorio no permite reanudar el entrenamiento tal cual, solo inferencia.
- Madurez baja: 0 descargas y 0 valoraciones, repositorio creado y actualizado el 10 de septiembre de 2026 con apenas 17 segundos de diferencia, lo que sugiere una publicación de tipo experimental sin mantenimiento posterior.
- Advertencia de uso en producción: no debe desplegarse en entornos con personas u objetos de valor sin un sistema de seguridad independiente, supervisión humana y validación exhaustiva en el montaje concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-uniform32-overfit3-epoch80
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Comando de descarga indicado por el autor: `hf download fm-dev/pi05-button-order-uniform32-overfit3-epoch80 --local-dir ./button-order-uniform32-epoch80`
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron papers, blogs, repositorios ni demos relacionados con este modelo. Los únicos resultados obtenidos fueron páginas de emisoras de radio en frecuencia modulada, sin relación con el contenido de esta ficha. Por tanto, no hay enlaces adicionales verificables que incluir.
