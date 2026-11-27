# mishwani7/XLM-RoBERTa-Urdu-Nastaliq-Mental-Health

## Resumen

XLM-RoBERTa-Urdu-Nastaliq-Mental-Health es un modelo de clasificación de texto obtenido mediante ajuste fino del checkpoint `xlm-roberta-base` sobre texto en urdu en escritura perso-árabe (nastaliq). Lo desarrolla el usuario de Hugging Face mishwani7 y está orientado al cribado clínico de severidad depresiva, con una calibración basada en control de riesgo conformal (conformal risk control) que acota la tasa de falsos negativos.

El modelo resuelve un problema concreto: la falta de herramientas de cribado automático para salud mental en urdu, un idioma con recursos limitados y una escritura de derecha a izquierda que complica el preprocesado. Frente a un clasificador convencional, incorpora umbrales calibrados estadísticamente (0,2974 para cribado con FNR ≤ 5 % y 0,0745 para la asignación exacta de grado de severidad), lo que permite razonar sobre garantías de cobertura en lugar de depender solo de la probabilidad softmax.

Con 278 millones de parámetros y un repositorio de 1,1 GB, es un modelo compacto que puede desplegarse en hardware modesto. La licencia MIT facilita su integración en productos, aunque su ámbito es estrictamente el urdu y la clasificación en cuatro clases de severidad, no la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.046.724 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | urdu (ur), escritura perso-árabe nastaliq |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. Sobre esa base se ha realizado un ajuste fino supervisado para una tarea de clasificación de secuencias con cuatro etiquetas ordinales: no depresión, depresión leve, moderada y severa. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o balanceo de clases.

La innovación destacable no está en la arquitectura, sino en la capa de calibración: se aplica control de riesgo conformal para fijar umbrales de decisión con garantías distribution-free. El umbral de cribado (0,2974) acota la tasa de falsos negativos al 5 %, mientras que el umbral de severidad exacta (0,0745) se usa para la asignación fina del grado. Este enfoque es relevante en un dominio clínico, donde el coste de un falso negativo (no detectar un caso grave) es mucho mayor que el de un falso positivo.

## Capacidades

- Clasificación de texto en urdu (nastaliq) en cuatro clases de severidad depresiva.
- Cribado binario con umbral calibrado para acotar la tasa de falsos negativos al 5 %.
- Asignación de grado de severidad exacto mediante un segundo umbral calibrado.
- Procesamiento de texto perso-árabe de derecha a izquierda sin normalización manual aparente.
- Inferencia ligera compatible con el pipeline `text-classification` de Transformers.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento extendido.

## Casos de uso

- Cribado inicial en atención primaria: el modelo puede procesar respuestas abiertas de pacientes en urdu y emitir una señal de riesgo con umbral calibrado, derivando los casos positivos a evaluación profesional.
- Triaje en líneas de ayuda psicológica: integrado en un chatbot o formulario, clasifica mensajes entrantes y prioriza los que superan el umbral de cribado para atención humana inmediata.
- Investigación epidemiológica: permite etiquetar grandes volúmenes de texto en urdu (foros, encuestas) con una garantía estadística sobre la tasa de falsos negativos, útil para estimar prevalencia.
- Monitorización de comunidades online: análisis de publicaciones en plataformas de habla urdu para detectar señales de riesgo y activar protocolos de moderación o derivación.
- Sistemas de alerta temprana en universidades o empresas: procesamiento de cuestionarios abiertos en urdu para identificar empleados o estudiantes que requieran seguimiento.
- Evaluación asistida por software clínico: el modelo actúa como segunda opinión sobre las notas o respuestas del paciente, con los umbrales conformales como criterio auditable de decisión.
- Filtrado previo en pipelines de anotación: reduce el coste de revisión humana etiquetando automáticamente los casos claramente negativos y marcando los inciertos para revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta los umbrales de calibración conformal (0,2974 para FNR ≤ 5 % y 0,0745 para severidad exacta), pero no incluye métricas como accuracy, F1, precisión o recall sobre un conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos, más overhead de activaciones; en la práctica, 2-3 GB en fp32.
- En fp16 o bf16, los pesos ocupan unos 560 MB; la VRAM total necesaria se sitúa en torno a 1,5-2 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB de VRAM.
- Puede ejecutarse en CPU con latencias aceptables para clasificación de textos cortos.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, ONNX Runtime, TorchScript, o servidores de inferencia como TGI y vLLM (aunque vLLM está más orientado a generación; para encoder-only es preferible ONNX o un servidor REST ligero).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLM-RoBERTa-Urdu-Nastaliq-Mental-Health | 278 M | no disponible | Clasificación de severidad depresiva en urdu | MIT | Hugging Face |
| xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe, sin ajuste clínico | MIT | Hugging Face |
| Modelos de salud mental en inglés (p. ej., MentalBERT) | ~110 M | 512 tokens | Clasificación de salud mental en inglés | MIT / Apache 2.0 | Hugging Face |
| Modelos multilingües de salud mental | variable | variable | Clasificación en varios idiomas | variable | Hugging Face |

La comparativa directa con alternativas específicas en urdu no está disponible en la información proporcionada. Frente a `xlm-roberta-base`, la diferencia principal es el ajuste fino clínico y la calibración conformal; frente a MentalBERT, la diferencia es el idioma y la inclusión de garantías de cobertura.

## Limitaciones y advertencias

- El modelo es un cribado, no un diagnóstico clínico; no debe usarse como sustituto de evaluación profesional.
- Solo cubre urdu en escritura nastaliq; no se ha validado en otros dialectos, registros coloquiales o transliteraciones en alfabeto latino.
- Riesgo de alucinación no aplica (no genera texto), pero sí de clasificación errónea en textos ambiguos, irónicos o muy cortos.
- Los umbrales conformales se calibraron sobre un conjunto de datos no documentado; su validez fuera de esa distribución no está garantizada.
- No se documentan sesgos demográficos, de género ni socioeconómicos en el entrenamiento.
- La licencia MIT permite uso comercial, pero el uso clínico puede estar sujeto a regulación sanitaria local (por ejemplo, marcado CE o FDA) que el modelo no cubre.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación externa por la comunidad.
- No se especifica la longitud máxima de entrada soportada; conviene asumir el límite de `xlm-roberta-base` (512 tokens) hasta confirmación.

## Enlaces

- Hugging Face: https://huggingface.co/mishwani7/XLM-RoBERTa-Urdu-Nastaliq-Mental-Health
- Referencia a XLM-RoBERTa base: https://huggingface.co/xlm-roberta-base
- Resultado de búsqueda sobre XLM-RoBERTa en árabe y urdu (Scilit, Fida Ullah, Instituto Politécnico Nacional): http://go/v1/AX4NXPDm7UouawlL9AG7WPPCOwFrvpLjEyI6JhQJgwfvuuIBjNoK6yNgAp8Rcx-bJlGx0UA3d_1hKdmz1NPsFTnj5nomvIivQMkzCgz1Os-XjRazq_hYk4bFb9b-w8897HQ-LahJ21pXiug7LTHBzUOameYWLIriXC39gahBajPdat20wvdUmJV3p1AZa2rMrpGNLOgBkKHcrFyqWRXKN3I80Kw8ISez65ewg9bdraHjbAY
- Paper de control de riesgo conformal (referencia general, no enlazado en la información): no disponible
- Repositorio de código o demo: no disponible
