# itorshin/simple-heat-disaggr-cnn

## Resumen

Gridly heating-load disaggregation CNN es un modelo convolucional publicado por el usuario itorshin en HuggingFace, orientado a la desagregación de carga eléctrica de calefacción. Su tarea es tomar como entrada un día completo de carga eléctrica total y temperatura exterior, y producir como salida un perfil de calefacción de 96 pasos, es decir, 24 horas a resolución de 15 minutos. Tanto las entradas de carga como los valores objetivo se expresan en kWh por intervalo de 15 minutos, lo que lo sitúa en el ámbito del análisis de contadores inteligentes y del NILM (Non-Intrusive Load Monitoring) aplicado específicamente al consumo térmico.

El checkpoint está pensado para el backend de Gridly y, según la model card, incluye no solo los pesos, sino también la configuración de la arquitectura, las estadísticas de normalización, la escala del objetivo y los nombres de los canales de entrada y salida. Ese empaquetado autocontenido es relevante porque evita errores de preprocesado al desplegar el modelo: las transformaciones aplicadas durante el entrenamiento viajan junto a los pesos.

Se trata de un modelo muy pequeño (el repositorio ocupa 0,0 GB) y de propósito muy específico, no de un modelo de lenguaje. En el momento de redactar esta ficha no acumula descargas ni likes, no declara licencia ni idiomas, y no se han publicado resultados de benchmarks en la información disponible, por lo que su evaluación debe considerarse pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) para regresión sobre series temporales; configuración exacta de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable en el sentido de modelos de lenguaje; la entrada descrita es una ventana de un día de carga total y temperatura exterior (96 intervalos de 15 minutos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo numérico de series temporales); no disponible en la información |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (library_name: pytorch); extensión y estructura exacta del fichero no disponibles. Incluye pesos, configuración de arquitectura, estadísticas de normalización, escala del objetivo y nombres de canales |
| Entradas | carga eléctrica total y temperatura exterior (kWh por intervalo de 15 minutos) |
| Salidas | perfil de calefacción de 96 pasos (kWh por intervalo de 15 minutos) |
| Resolución temporal | 15 minutos |
| Tamaño del repositorio | 0,0 GB |
| Librería | PyTorch |

## Arquitectura y entrenamiento

La única descripción arquitectónica disponible es que se trata de una CNN que mapea una secuencia de entrada de un día a una secuencia de salida de 96 pasos. Es, por tanto, un modelo de regresión supervisada multi-paso sobre series temporales, no un transformer ni un modelo generativo. El uso de temperatura exterior como variable exógena sugiere que el modelo explota la correlación entre temperatura y demanda de calefacción para separar esa componente del consumo total.

El checkpoint incorpora estadísticas de normalización, escala del objetivo y nombres de canales, lo que implica un pipeline de preprocesado fijo definido por el autor. No hay información sobre el número de tokens o muestras de entrenamiento, la composición del dataset, la procedencia de los datos (país, tipo de viviendas, tecnología de calefacción), la función de pérdida, el número de épocas ni si se aplicaron técnicas de regularización, aumento de datos o ajuste fino posterior. Tampoco se documenta ninguna innovación técnica adicional (atención, decodificación especulativa, capas recurrentes o mecanismos híbridos). Toda esta información figura como no disponible.

## Capacidades

- Predicción multi-paso: genera los 96 valores de un día completo de una sola pasada, en lugar de iterar paso a paso.
- Desagregación de carga de calefacción: separa la componente térmica del consumo eléctrico total medido.
- Modelado con variable exógena: incorpora temperatura exterior como canal de entrada, además de la carga total.
- Trabajo a resolución de 15 minutos, alineada con la granularidad habitual de contadores inteligentes.
- Salida directamente en kWh por intervalo, es decir, en unidades físicas interpretables, no en valores normalizados.
- Integración con el backend de Gridly mediante el checkpoint autocontenido (normalización y escala incluidas).
- Tool calling / function calling: no disponible (no aplicable a este tipo de modelo).
- Capacidades de agente o razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no aplicable.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Desagregación de consumo en contadores inteligentes: a partir de la curva de carga total de un día y de la temperatura exterior, el modelo estima cuánta electricidad se destinó a calefacción, lo que permite informar al usuario sin necesidad de sensores dedicados por aparato.
- Monitorización de bombas de calor y calefacción eléctrica: comparar el perfil inferido con el consumo total ayuda a detectar anomalías, ciclos anómalos o degradación del rendimiento del equipo a lo largo del tiempo.
- Programas de respuesta a la demanda (demand response): conocer la curva prevista de calefacción permite dimensionar mejor los eventos de reducción de carga y estimar la potencia flexible disponible en una zona o cartera de clientes.
- Auditorías energéticas y certificación: el perfil desagregado sirve como evidencia cuantitativa de cuánto peso tiene la calefacción en la factura, dato útil para priorizar medidas de eficiencia o sustitución de equipos.
- Verificación de ahorros en rehabilitación: comparar la carga de calefacción inferida antes y después de una intervención (aislamiento, cambio de sistema) permite estimar el ahorro atribuible sin instalar medición submétrica.
- Planificación de red y previsión de picos: agregando predicciones de múltiples clientes se obtiene una estimación de la demanda térmica eléctrica por zona, útil para estudios de capacidad en transformadores y líneas de baja tensión.
- Investigación en NILM: el modelo sirve como referencia reproducible para comparar estrategias de desagregación de una sola carga objetivo (calefacción) frente a enfoques multi-electrodoméstico.
- Tarifas y facturación analítica: con el perfil de 96 intervalos se pueden simular escenarios tarifarios por tramos horarios y cuantificar el impacto de desplazar el consumo de calefacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (MAE, RMSE, MAPE ni métricas específicas de NILM como F1 por aparato), ni comparaciones con líneas base, ni detalles del conjunto de validación o test.

## Requisitos de hardware

- El repositorio ocupa 0,0 GB (redondeado a una decimal), lo que indica un checkpoint de pocos megabytes; los parámetros totales no están publicados.
- VRAM estimada: no disponible de forma oficial. Por el tamaño del repositorio, la inferencia en FP32 debería caber holgadamente en menos de 1 GB de memoria.
- Inferencia en CPU: viable con alta probabilidad dado el tamaño y la naturaleza convolucional del modelo, aunque no hay mediciones publicadas.
- GPU recomendadas: no hay recomendación oficial. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es más que suficiente para un modelo de esta escala, e incluso resultaría sobredimensionada.
- Cabe en GPU consumer: sí, con margen amplio, según el tamaño declarado del repositorio.
- Opciones de despliegue: PyTorch nativo como opción principal; exportación a TorchScript u ONNX como vías razonables para producción. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a modelos comparables ni datos de rendimiento frente a alternativas. Los modelos de la misma categoría serían propuestas de NILM y desagregación de carga (familias seq2point, seq2seq o basadas en attention para series temporales de energía), pero no se dispone de cifras verificables de parámetros, contexto o rendimiento para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| itorshin/simple-heat-disaggr-cnn | no disponible | entrada de un día (96 intervalos de 15 min) | no disponible | HuggingFace, 0 descargas |
| Alternativas de NILM | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Sin métricas publicadas: no hay evidencia cuantitativa de precisión, sesgo o robustez. Cualquier despliegue debería ir precedido de una validación propia sobre datos del dominio objetivo.
- Dominio de entrenamiento desconocido: se desconoce el país, el clima, el tipo de vivienda y la tecnología de calefacción representados en los datos. El modelo puede degradarse en contextos distintos (por ejemplo, climas cálidos o calefacción de gas con apoyo eléctrico marginal).
- Especialización estrecha: solo predice el perfil de calefacción; no desagrega otros usos (refrigeración, agua caliente sanitaria, electrodomésticos) ni ofrece estimaciones agregadas por aparato.
- Dependencia del preprocesado del autor: las estadísticas de normalización, la escala del objetivo y los nombres de canales están embebidos en el checkpoint. Alterar el orden de canales o las unidades romperá la inferencia sin aviso evidente.
- Acoplamiento al backend de Gridly: el formato del checkpoint está pensado para ese backend; su reutilización fuera de él requiere trabajo de adaptación.
- Resolución y horizonte fijos: entrada de un día y salida de 96 intervalos de 15 minutos. No hay información sobre comportamiento con ventanas más cortas o más largas ni sobre predicción a varios días.
- Riesgo de alucinación en sentido estricto: no aplicable (modelo de regresión numérica), pero sí existe riesgo de estimaciones físicamente implausibles (valores negativos o picos irreales) fuera del rango de entrenamiento.
- Trazabilidad limitada: el repositorio no incluye paper, informe técnico ni documentación de evaluación, y la búsqueda web no ha devuelto material adicional relevante sobre el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/itorshin/simple-heat-disaggr-cnn
- Paper: no disponible
- Blog o documentación técnica: no disponible
- Repositorio de código: no disponible
- Demos: no disponible
- Referencias adicionales: los resultados de búsqueda web consultados no contenían información relacionada con el modelo
