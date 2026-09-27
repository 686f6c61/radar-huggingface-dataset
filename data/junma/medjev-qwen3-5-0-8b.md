# junma/MedJev-Qwen3.5-0.8B

## Resumen

MedJev-Qwen3.5-0.8B es un adaptador LoRA con una cabeza de punteros (pointer head) sobre Qwen3.5-0.8B-Base, publicado por el usuario junma, que extrae variables clínicas predefinidas de notas clínicas en texto libre. No es un modelo generativo: no produce texto, sino que lee la nota una sola vez y responde todas las preguntas en un único forward pass, puntuando directamente las opciones de cada pregunta. El resultado es siempre una distribución de probabilidad sobre las respuestas permitidas, sin nada que parsear, sin deriva de formato y sin posibilidad de salida fuera del esquema.

El modelo cubre 11 variables clínicas agrupadas en tres tipos de pregunta: `noul` (sí/no como probabilidad), `choice` (una entre 2 y 255 opciones nombradas) y `score` (un nivel ordenado). Según la model card, alcanza una exactitud micro de 0,878 en el split de test (26.286 preguntas sobre 2.895 notas) y una latencia mediana de 62 ms por nota en bf16 sobre una GPU, resolviendo las 11 variables a la vez. Supera en todas y cada una de las 11 variables a una línea base de expresiones regulares, al modelo base en zero-shot, al modelo instruction-tuned y a la API alojada Jev.

La relevancia actual del modelo está en su relación coste/prestaciones para estructuración de notas clínicas: 0,8 B de parámetros, 0,1 GB de repositorio (solo el adaptador y la cabeza) y un esquema de salida cerrado, lo que lo hace desplegable en hardware modesto y apto para pipelines on-premise con datos sensibles. Se publica bajo licencia Apache-2.0 y está entrenado y evaluado exclusivamente en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B-Base) + adaptador LoRA + cabeza de punteros para puntuación de opciones; sin generación de texto |
| Parametros totales | 0,8 B en el modelo base; número de parámetros del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible; la model card solo documenta bf16 (inferencia) y fp32 (evaluación de exactitud). No se publican pesos GGUF ni cuantizaciones de 4 u 8 bits |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (adaptador). Licencia del modelo base no especificada en la información disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) + `head.pt` (cabeza de punteros) |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Tarea (pipeline) | text-classification |
| Dataset de entrenamiento | AGBonnet/augmented-clinical-notes |
| Métricas declaradas | accuracy, brier_score |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 2026-09-22 |
| Descargas / likes | 57 / 11 |

## Arquitectura y entrenamiento

El sistema es un adaptador LoRA acoplado a Qwen3.5-0.8B-Base más una cabeza de punteros independiente almacenada en `head.pt`. Cada variable se formula como una pregunta con sus opciones permitidas; el modelo no genera la respuesta, sino que puntúa cada opción y normaliza, de modo que la salida es una distribución de probabilidad válida sobre el conjunto exacto de respuestas admitidas. La codificación separa el estado (la nota clínica) de las ramas (las preguntas): el estado se codifica una única vez con `model.encode(...)` y cada rama lee su caché, lo que explica que las 11 variables se resuelvan en un solo paso con una latencia de 62 ms por nota en bf16. El paquete `medjev` impone límites de tamaño mediante las constantes `MAX_STATE` y `MAX_BRANCH`.

El corpus de entrenamiento es AGBonnet/augmented-clinical-notes. Las 11 variables se seleccionaron de forma explícita para que no fueran resolubles por expresiones regulares: cada candidata se cribó contra una línea base de regex escrita a mano y se descartó si la regex la resolvía casi por completo (por ejemplo, sexo y edad se descartaron porque una regex acierta la etiqueta el 98,9% de las veces). Durante el entrenamiento se barajó el orden de las opciones, por lo que las respuestas de tipo `choice` son robustas al orden. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La model card advierte de que el modelo está ajustado con el vocabulario de este corpus concreto.

## Capacidades

- Extracción estructurada de variables clínicas desde notas en texto libre, con salida en forma de probabilidad por opción.
- Preguntas de tipo `noul`: respuesta sí/no expresada como probabilidad (por ejemplo, `hospital_admission`, `surgical_management`, `drug_therapy`, `prior_comorbidity`, `follow_up_planned`).
- Preguntas de tipo `choice`: selección de una opción entre 2 y 255 alternativas nombradas (por ejemplo, `smoking_status`, `principal_medical_therapy`, `primary_diagnostic_modality`).
- Preguntas de tipo `score`: asignación de un nivel ordenado (por ejemplo, `symptom_severity`, `treatment_response`, `diagnostic_workup_intensity`).
- Respuesta simultánea a las 11 variables en un único forward pass, reutilizando la codificación de la nota.
- Esquema flexible: admite instrucciones y criterios propios con la misma estructura que las 11 especificaciones de `medjev.labels.QUESTIONS`.
- Robustez al orden de las opciones en preguntas de tipo `choice`, gracias al barajado durante el entrenamiento.
- Calibración probabilística: se publica Brier score además de exactitud.
- No soporta tool calling, function calling ni uso como agente con razonamiento multi-paso: no hay generación de texto ni decodificación libre.
- No dispone de capacidades de visión ni de audio, ni de modo de razonamiento explícito (thinking mode).

## Casos de uso

- Estructuración de cohortes retrospectivas para investigación: procesar un archivo de notas clínicas y obtener, variable a variable, la probabilidad de admisión, comorbilidad previa, terapia principal o modalidad diagnóstica, con una latencia de 62 ms por nota que permite recorrer decenas de miles de informes en horas.
- Triaje y enrutado de casos: usar `hospital_admission` y `surgical_management` como señales probabilísticas para priorizar revisiones o derivar casos a circuitos específicos, aprovechando que la salida es una probabilidad calibrada y no una etiqueta rígida.
- Prelabelado para anotación humana: generar etiquetas con su Brier score asociado y enviar a revisión manual únicamente los casos con mayor incertidumbre, reduciendo el coste de anotación de registros clínicos.
- Auditoría de calidad de codificación y facturación: contrastar las variables extraídas de la nota con los códigos administrativos registrados para detectar discrepancias en terapia farmacológica o manejo quirúrgico.
- Registro de tumores y seguimiento oncológico: extraer `primary_diagnostic_modality`, `principal_medical_therapy` y `treatment_response` de informes oncológicos para poblar bases de datos de resultados.
- Monitorización de respuesta al tratamiento: aplicar el modelo a notas de seguimiento sucesivas y explotar el nivel ordenado de `treatment_response` y `symptom_severity` como serie temporal de evolución del paciente.
- Despliegue on-premise con datos sensibles: al tratarse de un adaptador sobre un modelo de 0,8 B con un repositorio de 0,1 GB, puede ejecutarse en una GPU de gama media dentro del perímetro hospitalario, sin enviar notas clínicas a servicios externos.
- Investigación de farmacovigilancia: cribar grandes volúmenes de notas para detectar comorbilidades previas y terapias farmacológicas relevantes antes de una revisión farmacéutica detallada.

## Benchmarks y rendimiento

Exactitud micro en el split de test (2.895 notas, 26.286 preguntas etiquetadas):

| Sistema | Exactitud micro | Latencia p50 por nota |
|---|---|---|
| MedJev-0.8B | 0,878 | 62 ms (bf16) |
| Regex / reglas de conteo | 0,667 | 3,6 ms (CPU) |
| Jev alojado (`jev-1.13.0`) | 0,602 | 284 ms |
| Clase mayoritaria por pregunta | 0,602 | no disponible |
| Qwen3.5-0.8B-Instruct, prompt de chat | 0,517 | no disponible |
| Qwen3.5-0.8B-Base, logits de letra en zero-shot | 0,500 | no disponible |

Métricas globales declaradas:

| Métrica | Test | Desarrollo |
|---|---|---|
| Exactitud micro | 0,878 | 0,874 |
| Exactitud macro sobre las 11 variables | 0,883 | 0,878 |
| Brier score | 0,179 | 0,182 |
| Suelo de clase mayoritaria | 0,602 | 0,602 |

Desglose por tipo de pregunta en test: `noul` 0,941; `choice` 0,793; `score` 0,810.

Desglose por variable en test:

| Variable | Tipo | n | Mayoritaria | MedJev | Macro-F1 | Brier |
|---|---|---|---|---|---|---|
| surgical_management | noul | 2.895 | 0,709 | 0,954 | 0,944 | 0,073 |
| follow_up_planned | noul | 2.895 | 0,889 | 0,951 | 0,870 | 0,074 |
| drug_therapy | noul | 2.895 | 0,635 | 0,941 | 0,937 | 0,086 |
| prior_comorbidity | noul | 2.895 | 0,792 | 0,940 | 0,906 | 0,090 |
| hospital_admission | noul | 2.895 | 0,801 | 0,918 | 0,869 | 0,117 |
| smoking_status | choice | 726 | 0,525 | 0,975 | 0,944 | 0,039 |
| principal_medical_therapy | choice | 2.895 | 0,208 | 0,787 | 0,808 | 0,312 |
| primary_diagnostic_modality | choice | 2.895 | 0,343 | 0,752 | 0,686 | 0,355 |
| symptom_severity | score | 990 | 0,554 | 0,911 | 0,895 | 0,130 |
| treatment_response | score | 1.410 | 0,465 | 0,799 | 0,744 | 0,294 |
| diagnostic_workup_intensity | score | 2.895 | 0,541 | 0,780 | 0,765 | 0,317 |

Nota metodológica de la model card: la exactitud se mide en fp32 y la latencia en bf16, formato que según el autor no supone pérdida medible de exactitud y es unas tres veces más rápido. La selección de modelo se hizo sobre el split de desarrollo y el de test se leyó una sola vez, después de la selección.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,8 B de parámetros, los pesos en bf16 ocupan aproximadamente 1,6 GB y en fp32 unos 3,2 GB (cálculo derivado del número de parámetros; el repositorio del adaptador ocupa 0,1 GB y el modelo base se descarga aparte). Con caché activada y una nota por lote, el consumo total debería mantenerse por debajo de 3 GB en bf16, si bien la model card no publica una cifra de VRAM medida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte CUDA; la model card menciona explícitamente ejecución con CUDA 13.0 mediante `pip install torch --index-url https://download.pytorch.org/whl/cu130`. No se especifica un modelo de GPU concreto ni se publican pruebas en A100 o H100.
- Cabe en GPU de consumo: sí, por tamaño de parámetros (0,8 B) es apto para tarjetas de gama de entrada y media con 4-8 GB de VRAM. No hay confirmación explícita del autor para modelos concretos.
- Opciones de despliegue: el adaptador por sí solo no es suficiente; requiere el paquete `medjev` (clonado del repositorio e instalación con el extra `[cuda]`), que carga el adaptador y la cabeza `head.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no realiza decodificación generativa estándar.
- Latencia: 62 ms por nota (p50) en bf16 resolviendo las 11 variables, frente a 3,6 ms de la línea base de regex en CPU y 284 ms de la API Jev alojada. En fp32 la model card indica un factor de aproximadamente 3 veces más lento (en torno a 186 ms por nota, valor estimado a partir de ese factor).
- Throughput: no publicado de forma directa; en ejecución secuencial, 62 ms por nota equivalen a unas 16 notas por segundo por GPU (cálculo derivado, no medido por el autor).

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Exactitud micro (test) | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MedJev-Qwen3.5-0.8B | 0,8 B + adaptador LoRA | no disponible | 0,878 | 62 ms (bf16) | Apache-2.0 | Adaptador en HuggingFace; requiere paquete `medjev` |
| Jev alojado (`jev-1.13.0`) | no disponible | no disponible | 0,602 | 284 ms | no disponible (servicio alojado) | API alojada |
| Qwen3.5-0.8B-Instruct (prompt de chat) | 0,8 B | no disponible | 0,517 | no disponible | no disponible en la información proporcionada | Modelo público |
| Qwen3.5-0.8B-Base (zero-shot, logits de letra) | 0,8 B | no disponible | 0,500 | no disponible | no disponible en la información proporcionada | Modelo público |
| Regex / reglas de conteo | no aplica | no aplica | 0,667 | 3,6 ms (CPU) | no aplica | Línea base propia |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en notas clínicas en inglés (`en`), por lo que no debe esperarse un rendimiento equivalente en castellano u otros idiomas.
- Ajuste al vocabulario del corpus: la model card advierte de que el modelo está ajustado con el vocabulario de AGBonnet/augmented-clinical-notes; las categorías de preguntas de tipo `choice` dependen de ese conjunto de opciones.
- Riesgo de alucinación estructural bajo pero no nulo: al puntuar directamente las opciones, la salida nunca queda fuera del esquema, pero una probabilidad alta sobre una opción incorrecta sigue siendo posible. Las variables con peor Brier score (`primary_diagnostic_modality` 0,355, `diagnostic_workup_intensity` 0,317, `principal_medical_therapy` 0,312) concentran la mayor incertidumbre.
- Sesgos heredados del dataset: cualquier sesgo de codificación, selección o composición demográfica presente en AGBonnet/augmented-clinical-notes se traslada al modelo. No se documenta ningún análisis de sesgo por subgrupo.
- Efecto suelo de la clase mayoritaria elevado en algunas variables: en `follow_up_planned` la clase mayoritaria ya alcanza 0,889 y `smoking_status` solo se evalúa sobre 726 preguntas, muy por debajo de las 2.895 del resto.
- Requisito de integración no estándar: el adaptador por sí solo no funciona; la cabeza de punteros vive en `head.pt` y el formato de entrada es específico, lo que obliga a usar el paquete `medjev` y complica la migración a servidores de inferencia convencionales.
- Sin generación de texto: no puede justificar sus respuestas ni extraer información fuera del esquema de preguntas definido.
- Restricciones de licencia: el adaptador se publica bajo Apache-2.0, que permite uso comercial, pero la información disponible no especifica la licencia del modelo base Qwen3.5-0.8B-Base, por lo que conviene verificarla antes de un despliegue comercial.
- Uso clínico: se trata de una herramienta de extracción de información, no de un dispositivo médico ni de un sistema de apoyo a la decisión diagnóstica. No debe usarse para tomar decisiones clínicas sin revisión humana.
- Estado del repositorio: 57 descargas y 11 likes en el momento de la consulta, con fecha de publicación 2026-09-22; se trata de una publicación reciente y con poca validación externa independiente.
- No se han publicado resultados de benchmarks fuera del desglose por variable incluido en la model card (no hay MMLU, HumanEval ni GSM8K, que además no aplican a esta tarea).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junma/MedJev-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/AGBonnet/augmented-clinical-notes
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2202.13876
- Repositorio del paquete `medjev`: la model card indica `git clone https://github.com/<your-org>/MedJev`, un marcador de posición sin organización real; no se dispone de URL pública verificable.
