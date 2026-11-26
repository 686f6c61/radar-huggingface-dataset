# IITM-2026T3-DSAI-GROUP2/final-socratic-ai-tutor-m5

## Resumen

El modelo `final-socratic-ai-tutor-m5` es un modelo de *knowledge tracing* (seguimiento de conocimiento) basado en la arquitectura AKT (Attentive Knowledge Tracing), desarrollado por el grupo IITM-2026T3-DSAI-GROUP2 en el marco del proyecto Socratic AI Tutor. No es un modelo generativo de lenguaje, sino un modelo predictivo especializado que estima la probabilidad de que un estudiante acierte la siguiente pregunta a partir de su historial de interacciones, lo que lo sitúa en el ámbito de los sistemas tutores inteligentes y la analítica del aprendizaje.

El modelo se ha entrenado desde cero sobre el conjunto de datos público `assist2009`, un corpus clásico de interacción estudiante-ejercicio ampliamente utilizado en la literatura de *knowledge tracing*. Con 491.468 parámetros (1,97 MB), es un modelo extremadamente compacto, pensado para inferencia de baja latencia en entornos educativos en tiempo real, no para despliegue como chatbot generalista.

Su relevancia radica en que demuestra que una arquitectura atencional ligera puede alcanzar un AUC de 0,7793 en test con una latencia de 4,2 ms por ventana de 200 pasos y un throughput superior a 47.000 predicciones por segundo, lo que lo hace viable para integrarse en plataformas de tutoría adaptativa con requisitos de tiempo real. La licencia MIT facilita su reutilización y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AKT (Attentive Knowledge Tracing), implementada en PyTorch |
| Parametros totales | 491.468 (1,97 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 200 pasos de historial (`max_skills_per_step = 4`) |
| Tipos de cuantizacion | INT8 (documentada, con caída de AUC de 0,0002); otras no disponibles |
| Idiomas soportados | no disponible (el modelo no procesa texto libre, opera sobre índices de skills y preguntas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura AKT (Attentive Knowledge Tracing) es un modelo de *knowledge tracing* que combina mecanismos de atención con representaciones de ejercicios y habilidades para modelar la evolución del conocimiento del estudiante a lo largo de una secuencia de interacciones. El modelo gestiona 123 habilidades (con índice de padding 123) y 15.922 preguntas (con índice de padding 15.922), con una longitud máxima de contexto de 200 pasos y hasta 4 habilidades por paso. El repositorio incluye los mapeos `skill_to_idx.json` y `question_to_idx.json` para traducir los identificadores originales del dataset a índices del modelo.

El entrenamiento se realizó desde cero sobre `assist2009`, alcanzando su mejor epoch en la número 6. No se documenta en la información disponible el número de tokens ni la composición exacta del dataset más allá de su origen, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este tipo de modelos predictivos). El repositorio incluye artefactos de evaluación diagnóstica (mapas de calor de error, calibración, estrés, atención e influencia) que sugieren un proceso de validación riguroso orientado a calibración y robustez, no solo a precisión.

## Capacidades

- Predicción de la probabilidad de acierto del siguiente ejercicio a partir del historial de interacciones del estudiante.
- Modelado de la evolución del conocimiento a lo largo de secuencias de hasta 200 pasos.
- Manejo de hasta 4 habilidades por paso temporal.
- Calibración de probabilidades (ECE de 0,0428 en test), adecuada para umbrales de decisión pedagógica.
- Robustez ante historiales parcialmente corruptos (caída de AUC de solo 0,0154 con un 10% de historial invertido).
- Inferencia de muy baja latencia (4,2 ms por ventana de 200 pasos) y alto throughput (47.746 pred/s).
- Cuantización INT8 con degradación mínima (0,0002 de AUC).
- No soporta generación de texto, tool calling, agentes, visión ni audio; no es un modelo conversacional.

## Casos de uso

- Tutoría adaptativa en plataformas educativas: el modelo predice la probabilidad de acierto del siguiente ejercicio y permite seleccionar dinámicamente la dificultad o el siguiente contenido, aprovechando su latencia de 4,2 ms para actualizar recomendaciones en tiempo real.
- Detección temprana de estudiantes en riesgo: con una calibración fiable (ECE 0,0428) y una tasa de acierto direccional del 97,75%, las probabilidades predichas pueden usarse para activar intervenciones cuando caen por debajo de umbrales definidos.
- Secuenciación de ejercicios en sistemas de práctica: el modelo puede puntuar candidatos de un banco de 15.922 preguntas y ordenar la práctica según la zona de desarrollo próximo del estudiante.
- Evaluación de la calidad de rutas de aprendizaje: integrado en pipelines offline, permite simular el efecto de distintas secuencias de ejercicios sobre la probabilidad de acierto estimada.
- Investigación en analítica del aprendizaje: su tamaño reducido (491.468 parámetros) y su licencia MIT lo hacen adecuado como línea base reproducible en experimentos de *knowledge tracing* sobre `assist2009`.
- Despliegue en entornos con recursos limitados: al ocupar menos de 2 MB en FP32 y degradarse solo 0,0002 de AUC en INT8, puede ejecutarse en CPU o en dispositivos de borde dentro de plataformas educativas sin GPU dedicada.
- A/B testing de intervenciones pedagógicas: el throughput de 47.746 pred/s permite evaluar grandes cohortes de estudiantes en experimentos controlados sin cuello de botella de inferencia.

## Benchmarks y rendimiento

| Metrica | Valor medido | Objetivo | Estado |
|---|---|---|---|
| AUC en test | 0,7793 | >= 0,75 | PASS |
| IC 95% del AUC en test | [0,7638; 0,7961] | no disponible | no disponible |
| Brecha AUC validacion-test | -0,0064 | <= 0,02 | PASS |
| ECE en test | 0,0428 | <= 0,05 | PASS |
| Ganancia de AUC sobre mejor baseline (combinador logístico) | 0,0198 | >= 0,02 | FAIL |
| Tasa de acierto direccional en test | 0,9775 | >= 0,90 | PASS |
| Caida de AUC con 10% de historial invertido | 0,0154 | <= 0,05 | PASS |
| Peor slice de AUC (n >= 500, respuesta previa correcta) | 0,7376 | >= 0,65 | PASS |
| Latencia (ventana de 200 pasos) | 4,2048 ms | <= 100,0 ms | PASS |
| Throughput | 47.746,66 pred/s | no disponible | no disponible |
| Caida de AUC con cuantizacion INT8 | 0,0002 | no disponible | no disponible |
| AUC en test del run de exportacion | 0,7767 | no disponible | no disponible |
| AUC en validacion del run de exportacion | 0,7725 | no disponible | no disponible |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de *knowledge tracing* (DKT, SAKT, etc.) mas alla del baseline de combinador logistico citado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (modelo de 1,97 MB), por lo que cabe en cualquier GPU, CPU o incluso en memoria de un microcontrolador de gama alta.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo. Una CPU estándar es suficiente.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y `state_dict`), exportación a TorchScript o ONNX no documentada pero viable; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4,2048 ms por ventana de 200 pasos y 47.746,66 predicciones por segundo, medidos en la evaluación del autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de *knowledge tracing* (como DKT, SAKT o AKT en otras implementaciones) sobre `assist2009`, salvo el baseline de combinador logistico mencionado en la scorecard, frente al cual la ganancia de AUC es de 0,0198 (por debajo del objetivo de 0,02, marcado como FAIL).

| Modelo | Parametros | Contexto | AUC test | Licencia |
|---|---|---|---|---|
| final-socratic-ai-tutor-m5 (AKT) | 491.468 | 200 pasos | 0,7793 | MIT |
| Baseline combinador logistico | no disponible | no disponible | ~0,7595 (inferido de la ganancia) | no disponible |
| DKT / SAKT sobre assist2009 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto, no responde preguntas y no puede usarse como tutor conversacional por sí mismo; solo estima probabilidades de acierto.
- Entrenado exclusivamente sobre `assist2009`, un dataset con sesgos demográficos y de dominio concretos; su generalización a otras plataformas, asignaturas o poblaciones no está validada.
- La ganancia de AUC sobre el baseline logístico (0,0198) no alcanza el objetivo de 0,02 fijado por los propios autores, lo que indica un margen de mejora limitado frente a alternativas simples.
- El peor slice de AUC (0,7376 en estudiantes con n >= 500 y respuesta previa correcta) muestra un rendimiento inferior en subpoblaciones con historial extenso.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente en distribuciones fuera del dominio de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación externa independiente.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre decisiones pedagógicas automatizadas recae en el integrador; se recomienda supervisión humana en intervenciones de alto impacto.
- No se documentan los idiomas soportados porque el modelo no procesa lenguaje natural; opera sobre índices de habilidades y preguntas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/final-socratic-ai-tutor-m5
- Dataset `assist2009`: no disponible en la informacion proporcionada
- Paper de AKT (Attentive Knowledge Tracing): no disponible en la informacion proporcionada
- Repositorio del proyecto Socratic AI Tutor: no disponible en la informacion proporcionada
