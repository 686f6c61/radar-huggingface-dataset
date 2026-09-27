# brunabcardi/pi0.5-w3j8ibEea1x5

## Resumen

π0.5-w3j8ibEea1x5 es un checkpoint de la familia π0.5 (pi0.5) de Physical Intelligence, un modelo visión-lenguaje-acción (VLA) para control robótico, publicado por el usuario brunabcardi. Se trata de un ajuste fino en dos etapas sobre ApexUltron/pi0.5-KX774qZu7mZD (revisión `46abf397`), un checkpoint que fue campeón de una competición de robótica cuyo nombre no se especifica en la model card. El modelo hereda la arquitectura de π0.5: un backbone tipo PaliGemma (visión-lenguaje) acoplado a un *action expert* que genera bloques de acción mediante *flow matching* con 10 pasos de Euler.

La particularidad de este checkpoint es su segunda etapa de entrenamiento, denominada *first-step noise collapse*: en lugar de reentrenar el modelo completo, se modifican únicamente cuatro kernels de condicionamiento temporal (4 de los 51 tensores del checkpoint) para que el primer paso de Euler parta de un objetivo independiente del ruido inicial. Los 47 tensores restantes, incluidos todos los sesgos, son idénticos byte a byte al checkpoint de la etapa 1.

El interés técnico es doble: por un lado, demuestra una intervención quirúrgica sobre un VLA sin degradar el resto de la trayectoria de integración; por otro, documenta con detalle numérico (proyección de gradientes sobre el complemento ortogonal en los tiempos t ≤ 0,9, comprobaciones en float32, bfloat16 y float64) cómo localizar temporalmente un cambio de pesos. El repositorio ocupa 12,4 GB y no declara licencia, idiomas ni número de parámetros, y acumula 0 descargas y 0 *likes*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en PaliGemma con *action expert* y *flow matching*; decodificación por 10 pasos de Euler |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint openpi en `params/` (JAX/Flax); los tensores entrenados se declaran en float32; tamaño del repositorio 12,4 GB |
| Librería | openpi |
| Pipeline declarado | robotics |
| Modelo base | ApexUltron/pi0.5-KX774qZu7mZD @ `46abf397fdb40525841ece710b544b6edcb928a0` |
| Relación con el base | fine-tune en dos etapas |

## Arquitectura y entrenamiento

La familia π0.5 se describe en la literatura como un modelo VLA que co-entrena fuentes heterogéneas (demostraciones de robot, datos web y subtareas semánticas) para generalizar en manipulación de horizonte largo. La variante π0 es un VLA de difusión basada en *flow matching*, mientras que π0-FAST es autorregresiva con el tokenizador de acciones FAST. En este checkpoint, el *action expert* muestrea un bloque de acción con 10 pasos de Euler del flujo x_{t+dt} = x_t + dt·v(obs, x_t, t) con dt = −0,1, partiendo de x_1 = ruido gaussiano.

**Etapa 1** (`r4_L3_s900`, paso 900): ajuste fino parcial del padre con el modelo de lenguaje congelado. Se entrenan la torre de visión, el *action expert* y las capas de proyección; los pesos del modelo de lenguaje quedan intactos respecto al padre. **Etapa 2** (este checkpoint): solo se modifican cuatro kernels de condicionamiento temporal del checkpoint de la etapa 1. El profesor es una copia congelada del propio checkpoint de entrada, ejecutada en la misma aritmética bfloat16 que el servidor de políticas del evaluador. La pérdida es el error cuadrático medio entre la velocidad del estudiante en t = 1 y la velocidad objetivo, sobre las 10×32 entradas de acción, con 4 ruidos gaussianos independientes por observación (semilla 7103, nunca la semilla de evaluación). El objetivo impuesto es v_S(obs, x_1, 1) = v_T(obs, 0, 1) − x_1/dt.

Los cuatro tensores entrenados (float32, 4 de 51) son `PaliGemma/llm/final_norm_1/Dense_0/kernel` [1024×3072] (cambio L2 relativo 2,128e-01), `PaliGemma/llm/layers/pre_attention_norm_1/Dense_0/kernel` [18×1024×3072] (2,430e-01), `PaliGemma/llm/layers/pre_ffw_norm_1/Dense_0/kernel` [18×1024×3072] (1,215e-01) y `time_mlp_out/kernel` [1024×1024] (1,670e-01). Corresponden a los kernels de modulación adaRMS del *action expert* (cuya entrada es únicamente el *embedding* de tiempo) y al segundo kernel del time-MLP. La localización temporal se consigue proyectando cada gradiente, cada actualización del optimizador y el cambio final de pesos sobre el complemento ortogonal (en el espacio de entrada del kernel) del subespacio generado por esa entrada en los otros nueve tiempos de la rejilla (t = 0,9 … 0,1), de modo que dW·u(t_k) = 0.

Los datos de entrenamiento de la etapa 2 son únicamente observaciones: la imagen de cámara0, el estado articular de 9 dimensiones y el *prompt* de tarea de fotogramas muestreados con reemplazo, con cuota igual por tarea sobre las 30 tareas de la competición y fotogramas uniformes dentro de cada tarea, procedentes de grabaciones propias en formato LeRobot v2.1. La model card disponible está truncada en este punto.

## Capacidades

- Generación de bloques de acción para control robótico de manipulación mediante *flow matching*, con 10 pasos de Euler y dt = −0,1.
- Condicionamiento por *prompt* de tarea en lenguaje natural, además de imagen y estado propioceptivo.
- Entrada multimodal: imagen de cámara (camera0), estado articular de 9 dimensiones y texto de instrucción.
- Especialización en las 30 tareas de la competición sobre la que se entrenó, según la composición del muestreo descrita.
- Política entrenada para producir el primer paso de Euler independientemente del ruido inicial x_1 (comportamiento *teacher-forced* sobre el punto 0 + dt·v_T(obs, 0, 1)).
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling*, uso como agente multi-paso, capacidades multilingües declaradas, visión general (VQA/OCR), audio ni modo de razonamiento explícito. El backbone es de tipo PaliGemma, pero este checkpoint está especializado en acción.

## Casos de uso

- Manipulación robótica de propósito general en la plataforma para la que se recogieron los datos: el modelo recibe imagen, estado articular y *prompt*, y emite un bloque de acción ejecutable en bucle cerrado. Es adecuado porque fue ajustado específicamente sobre las 30 tareas del conjunto de competición.
- Punto de partida para un ajuste fino adicional: al tratarse de un *fine-tune* con el modelo de lenguaje congelado y solo cuatro kernels modificados, sirve como inicialización barata para nuevas tareas sin reentrenar el backbone completo.
- Investigación en *flow matching* y destilación de trayectorias: el colapso del primer paso elimina la dependencia del ruido inicial en t = 1, lo que permite estudiar cuántos pasos de Euler son realmente necesarios y si la calidad del bloque de acción se degrada al truncar la integración.
- Estudio comparativo de estrategias de ajuste fino parcial en VLA: congelar el modelo de lenguaje frente a ajustar la torre de visión, el *action expert* y las proyecciones.
- Reproducción y contraste de la técnica *first-step noise collapse* descrita de forma verbal por otro autor (`Troiaaa/pi0.5-WSMLo1hknaNw`): este checkpoint es una implementación independiente, con datos y pesos propios, útil para una replicación cruzada.
- Análisis de sensibilidad al ruido de inicialización en políticas de difusión y *flow matching*: la intervención está diseñada para que la salida a t ≤ 0,9 permanezca prácticamente idéntica, de modo que cualquier diferencia medible en el bloque final es atribuible al primer paso.
- Despliegue de un servidor de políticas con openpi en un banco de pruebas de laboratorio, con la advertencia de que no hay evaluación pública independiente de este checkpoint.
- Docencia y divulgación técnica sobre intervenciones localizadas en tiempo dentro de modelos generativos de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint. La model card solo aporta puntuaciones de la cadena de modelos antecesores y comprobaciones numéricas internas de la etapa 2.

| Checkpoint | Puntuación declarada |
|---|---|
| ApexUltron/pi0.5-KX774qZu7mZD (padre) | 0,8283 (antiguo campeón) |
| pfenzi/pi0.5-8wKVKfMLCNbx | 0,8117 (campeón anterior) |
| MechaTrainer/pi0.5-rneQYn9nFopV | 0,7850 |
| brunabcardi/pi0.5-w3j8ibEea1x5 (este) | no disponible |

| Comprobación numérica de la etapa 2 | Valor |
|---|---|
| Diferencia L2 relativa entre el padre y pfenzi/pi0.5-8wKVKfMLCNbx | ≈ 1,2e-04 |
| Tensores idénticos entre padre y pfenzi (modelo de lenguaje y cabeza de imagen) | 11 de 51, byte a byte |
| Cambio L2 relativo, `final_norm_1/Dense_0/kernel` | 2,128e-01 |
| Cambio L2 relativo, `pre_attention_norm_1/Dense_0/kernel` | 2,430e-01 |
| Cambio L2 relativo, `pre_ffw_norm_1/Dense_0/kernel` | 1,215e-01 |
| Cambio L2 relativo, `time_mlp_out/kernel` | 1,670e-01 |
| Tensores idénticos al checkpoint de etapa 1 | 47 de 51 (incluidos todos los sesgos) |
| Respuesta relativa máxima de un cambio de pesos a t ≤ 0,9 (comprobación independiente en float64) | 5,0e-06 |
| Diferencia de velocidad relativa a t ≤ 0,9 en aritmética bfloat16 de servicio | ≤ 2,3e-02 elemento a elemento; 7,9e-03 RMS sobre 32 observaciones de entrenamiento |
| Comprobación unitaria `unit_r3R1` (base r3_R1_s900, objetivo cero, 50 pasos, semilla 7001) tras entrenar, float32 | 8,9e-07 máximo |
| La misma comprobación en bfloat16 | 1,1e-02 máximo; 6,6e-03 RMS |

## Requisitos de hardware

- El repositorio ocupa 12,4 GB. La model card no declara número de parámetros ni precisión de almacenamiento. Asumiendo float32 (4 bytes por parámetro, coherente con los tensores entrenados declarados en float32), el tamaño equivaldría a unos 3.000-3.100 millones de parámetros; en bfloat16 serían unos 6.200 millones. Es una estimación, no un dato confirmado.
- VRAM estimada para inferencia en bfloat16: aproximadamente 6-8 GB solo para pesos. Sumando activaciones de imagen, buffers del servidor de políticas y margen de trabajo, es razonable reservar 12-16 GB. Cifras estimadas, no publicadas por el autor.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y RTX 4080 de 16-24 GB, siempre que el checkpoint se sirva en bfloat16 y con lotes pequeños.
- GPU profesionales recomendadas: L4 o A10G (24 GB) para despliegue en laboratorio, A100 40/80 GB y H100 para lotes mayores o entrenamiento de nuevas etapas.
- Opciones de despliegue: servidor de políticas de openpi (JAX) con cliente remoto, que es el modo en el que se evaluó este checkpoint (aritmética bfloat16); exportación a PyTorch mediante las utilidades de openpi. Los ejecutores de LLM de texto (llama.cpp, Ollama, vLLM, TGI) no ofrecen soporte nativo para una salida de acciones continuas de este tipo.
- Latencia y rendimiento: no disponibles. Como referencia de coste, cada bloque de acción requiere 10 evaluaciones del flujo (los 10 pasos de Euler), y el colapso del primer paso no reduce el número de pasos en este checkpoint.
- El backbone de visión impone además el coste de codificar la imagen de cámara en cada paso del bucle de control.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunabcardi/pi0.5-w3j8ibEea1x5 | VLA, *flow matching*, ajuste fino en 2 etapas | no disponible | no disponible | no disponible | 0 descargas en Hugging Face |
| ApexUltron/pi0.5-KX774qZu7mZD | VLA, *flow matching* (padre, antiguo campeón con 0,8283) | no disponible | no disponible | no disponible (no publica model card) | Hugging Face |
| pfenzi/pi0.5-8wKVKfMLCNbx | VLA, *flow matching* (campeón anterior, 0,8117) | no disponible | no disponible | no disponible | Hugging Face |
| pi0 (openpi) | VLA base, difusión basada en flujo | no disponible | no disponible | no disponible en la información consultada | Checkpoint base de openpi, preentrenado sobre más de 10.000 horas de datos de robot |
| pi0-FAST (openpi) | VLA autorregresiva con tokenizador FAST | no disponible | no disponible | no disponible en la información consultada | Checkpoint base de openpi |
| π0.5 (referencia) | VLA con co-entrenamiento en datos heterogéneos | no disponible | no disponible | no disponible | Paper arXiv:2504.16054; versión documentada en Qualcomm AI Hub |

La comparación cuantitativa con alternativas no es posible con la información disponible: ni este checkpoint ni sus antecesores publican número de parámetros, ventana de contexto ni resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K no aplican aquí).

## Limitaciones y advertencias

- Licencia no disponible. No se puede confirmar el uso comercial ni las condiciones de redistribución. Tampoco declaran licencia los checkpoints padre de la cadena según la información consultada.
- Sesgos: la model card no documenta composición demográfica, diversidad de entornos ni cobertura de objetos. Los datos proceden de grabaciones propias sobre las 30 tareas de una competición concreta, lo que limita la generalización fuera de ese dominio.
- Riesgo de acciones incorrectas: en un modelo de control robótico el fallo equivalente a la alucinación es la ejecución de una trayectoria errónea. No se documenta ninguna evaluación de seguridad física, parada de emergencia ni límites de fuerza.
- La intervención de la etapa 2 no es exactamente neutra en los pasos posteriores: en la aritmética bfloat16 de servicio la diferencia de velocidad relativa a t ≤ 0,9 llega a 2,3e-02 elemento a elemento (7,9e-03 RMS), atribuible al redondeo bfloat16 de los kernels modificados.
- La etapa 2 se entrena solo con observaciones (imagen, estado y *prompt*), sin señales de recompensa ni datos de interacción real; el objetivo es de imitación sobre el profesor, no de mejora de política.
- Solo 4 de 51 tensores se entrenan en la etapa 2, de modo que cualquier limitación del checkpoint de la etapa 1 se hereda íntegramente.
- Idioma y contexto: no declarados. No hay garantía de que las instrucciones en castellano funcionen, ya que no se documenta el idioma de los *prompts* de entrenamiento.
- Sin validación independiente: 0 descargas y 0 *likes* en el momento de la consulta, y la puntuación de competición de este checkpoint no se publica.
- Trazabilidad de pesos: el autor afirma que no se usaron pesos, ficheros ni salidas de `Troiaaa/pi0.5-WSMLo1hknaNw`, pero la verificación de esa afirmación depende de la cadena de checkpoints intermedios.
- La model card disponible está truncada: la descripción de los datos de entrenamiento queda cortada, por lo que se desconoce el volumen total de datos y el número de iteraciones finales.
- Las fechas declaradas en Hugging Face (creación y actualización el 26 de septiembre de 2026) resultan anómalas y conviene verificarlas antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunabcardi/pi0.5-w3j8ibEea1x5
- Checkpoint padre: https://huggingface.co/ApexUltron/pi0.5-KX774qZu7mZD
- Checkpoint anterior en la cadena: https://huggingface.co/pfenzi/pi0.5-8wKVKfMLCNbx
- Checkpoint anterior en la cadena: https://huggingface.co/MechaTrainer/pi0.5-rneQYn9nFopV
- Checkpoint anterior en la cadena: https://huggingface.co/brunabcardi/pi0.5-iX58tVHFJ52L
- Origen declarado de la cadena: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67
- Checkpoint que describe la idea del colapso del primer paso: https://huggingface.co/Troiaaa/pi0.5-WSMLo1hknaNw
- Paper de π0.5: https://arxiv.org/abs/2504.16054
- Documentación de π0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Descripción de openpi (modelos y utilidades de entrenamiento): https://robotics.growbotics.ai/projects/foundation-models/openpi
- Repositorio de referencia de π0 y π0-FAST: https://github.com/Spirit-AI-Team/PI_Official
