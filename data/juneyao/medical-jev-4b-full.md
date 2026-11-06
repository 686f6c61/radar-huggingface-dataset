# JuneYao/medical-jev-4b-full

## Resumen

medical-jev-4b-full es un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario JuneYao, orientado exclusivamente a la resolución de preguntas médicas de opción múltiple mediante puntuación de candidatos (choice scoring). El modelo no es un generador de texto conversacional: recibe un caso clínico, un conjunto de instrucciones de decisión y un mapa de opciones candidatas (entre 2 y 52), realiza una única pasada forward y devuelve un JSON corto con la opción seleccionada y la probabilidad asignada a cada candidato. No genera explicaciones ni cadenas de razonamiento y no invoca APIs externas durante la inferencia.

El modelo actualiza la totalidad de sus aproximadamente 4.200 millones de parámetros sobre 44.847 muestras de entrenamiento, partiendo de la arquitectura Qwen3.5-4B. Su relevancia es metodológica: sirve como referencia reproducible para comparar estrategias de ajuste (LoRA frente a full fine-tuning) en tareas de clasificación médica cerrada. Según la propia model card, la variante LoRA del mismo autor obtiene un 67,90 % de acierto en el conjunto externo de 1.514 preguntas, mientras que esta versión full obtiene un 63,21 %, por lo que el autor recomienda la versión LoRA para uso práctico y reserva esta para reproducción, comparación de métodos e investigación.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face; no se dispone de información adicional sobre el proceso de entrenamiento más allá de lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); tarea de choice scoring con una sola pasada forward |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 8.192 tokens de entrada completa (material, opciones y plantilla) |
| Tipos de cuantizacion | no disponible; el autor indica FP16 como precisión por defecto |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | formato propietario `jev-full-v1` (no es PEFT ni safetensors estándar para carga directa); repo con safetensors y tamaño de 8,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.200 millones de parámetros. Sobre esa base, el autor aplica un ajuste fino completo de todos los parámetros (unos 4.200 millones) durante 44.847 muestras de entrenamiento. La tarea no es generativa en el sentido habitual: el modelo puntúa cada opción candidata en una única pasada forward y normaliza las puntuaciones para producir un mapa de probabilidades. La salida es un JSON corto con el identificador de la opción elegida y las probabilidades de todas las alternativas.

No se detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas de RLHF o DPO. El autor sí especifica que no se generan explicaciones ni cadenas de pensamiento, y que no se llama a ninguna API docente en tiempo de inferencia. La innovación principal es el enfoque de scoring cerrado con soporte de 2 a 52 candidatos y una ventana de entrada de hasta 8.192 tokens, empaquetando material, instrucciones y opciones en una plantilla única. Los pesos se distribuyen en un formato propio (`jev-full-v1`) que requiere el código de inferencia incluido en el bundle (`predict_choices.py` o la clase `ChoicePredictor`); no es un adaptador PEFT ni una interfaz de chat.

## Capacidades

- Puntuación de opciones múltiples: selecciona una opción entre 2 y 52 candidatos y devuelve la probabilidad de cada uno.
- Salida estructurada: genera un JSON corto con `id`, `status`, `answer` y `probabilities`.
- Razonamiento clínico cerrado: aplica reglas e instrucciones explícitas proporcionadas en la entrada (por ejemplo, criterios de clasificación diagnóstica, contraindicaciones o criterios de inclusión en ensayos).
- Clasificación de mensajes médicos: asigna etiquetas de urgencia u otras categorías definidas como candidatos.
- Soporte bilingüe chino-inglés en el material de entrada y las opciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de planificación autónoma; cada llamada es una única decisión cerrada.
- No dispone de modo thinking, visión ni audio.
- No genera explicaciones, justificaciones ni cadenas de razonamiento.

## Casos de uso

- Evaluación de bancos de preguntas médicas: se introducen casos clínicos con opciones de diagnóstico, etiología o pruebas, y el modelo devuelve la opción elegida y las probabilidades, lo que permite puntuar automáticamente exámenes y comparar el rendimiento entre modelos de forma reproducible.
- Formación en enfermería y revisión de casos: a partir de registros de cuidados y candidatos de medidas, objetivos de monitorización o posiciones, el modelo etiqueta la prioridad o intervención correspondiente para su revisión posterior por el instructor.
- Investigación de tratamientos y medicación: con un caso, reglas del enunciado y candidatos de fármacos, vías de administración o planes terapéuticos, el modelo selecciona la opción que cumple las condiciones dadas, incluidas las contraindicaciones.
- Seguimiento, educación sanitaria y rehabilitación: dado el estado del paciente y candidatos de planes de seguimiento, educación, nutrición o rehabilitación, devuelve la etiqueta del plan que mejor encaja con los requisitos del enunciado.
- Emparejamiento con reglas de guías clínicas y derivación a ensayos: con un caso o resultado genético, reglas de aplicabilidad y candidatos de recomendación o derivación, el modelo determina la opción recomendada bajo esas reglas (sin que ello equivalga a una inclusión formal en el ensayo).
- Clasificación experimental de mensajes sanitarios: con mensajes de consulta y etiquetas de urgencia u otras categorías, devuelve la clasificación y las probabilidades por etiqueta para su explotación estadística o su revisión humana.
- Reproducción y comparación de métodos de ajuste: al ser un full fine-tuning con pesos completos, sirve para replicar experimentos y contrastar el efecto de LoRA frente al ajuste completo en tareas de scoring médico.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden al conjunto externo de 1.514 preguntas médicas de jev-healthcare-lab, con configuración FP16 y una sola vista de inferencia; las preguntas no respondidas cuentan como error.

| Modelo | Exactitud en las 1.514 preguntas |
|---|---:|
| medical-jev-4b (LoRA) | 67,90 % |
| medical-jev-4b-full (este modelo) | 63,21 % |

La diferencia de −4,69 puntos porcentuales a favor de la versión LoRA tiene un intervalo de confianza bootstrap del 95 % de −6,55 a −2,90 puntos. El autor indica que las 1.620 preguntas del conjunto de test sellado aún no se han evaluado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8,4 GB solo para los pesos del modelo, más el modelo base Qwen3.5-4B que se descarga por separado (unos 9,3 GB) si no se reutiliza una copia local; en la práctica se recomienda reservar al menos 20-24 GB de VRAM para cargar base y pesos entrenados con margen para activaciones y lote.
- GPU recomendadas: el autor valida la inferencia en una RTX 5090; GPU profesionales como A100 o H100 son adecuadas por memoria, aunque no hay datos publicados de rendimiento en ellas.
- GPU de consumo: cabe en tarjetas con 24 GB o más (por ejemplo, RTX 4090 o RTX 5090) en FP16; en GPUs con menos VRAM sería necesaria cuantización, para la que no se documentan formatos soportados.
- Opciones de despliegue: el modelo no es compatible con interfaces de chat estándar; requiere el código incluido (`predict_choices.py` o `ChoicePredictor`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica que cada llamada realiza una única pasada forward y que el ejemplo se ejecuta con `--batch-size 1`; no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Exactitud (1.514 preguntas) | Licencia |
|---|---|---:|---|---:|---|
| medical-jev-4b-full | 4,2 B | 8.192 tokens | Full fine-tuning, choice scoring | 63,21 % | Apache 2.0 |
| medical-jev-4b (LoRA) | 4,2 B (base) + adaptador LoRA | 8.192 tokens | LoRA, choice scoring | 67,90 % | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible en la informacion proporcionada | Modelo base generativo | no evaluado en este conjunto | no disponible en la informacion proporcionada |

No se dispone de datos de otros modelos médicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo resuelve tareas de elección entre candidatos predefinidos; no es un chatbot ni un generador de texto libre, y no produce explicaciones ni justificaciones.
- El propio autor recomienda la versión LoRA (67,90 %) frente a esta (63,21 %) para uso práctico; esta variante está pensada para reproducción e investigación.
- Ventana de entrada limitada a 8.192 tokens, incluyendo material, opciones y plantilla; casos muy extensos pueden no caber.
- Solo se declaran los idiomas chino e inglés; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinación y de selección errónea inherente a un clasificador cerrado: el modelo siempre devuelve una opción entre las candidatas, aunque ninguna sea correcta, y las probabilidades no deben interpretarse como calibración clínica validada.
- No se han publicado resultados en el conjunto de test sellado de 1.620 preguntas; los datos de exactitud proceden de un único conjunto externo.
- No hay información sobre sesgos demográficos, de género o étnicos en los datos de entrenamiento.
- Uso previsto por el autor: prototipos offline, formación y evaluación de modelos; no debe emplearse como herramienta de decisión clínica sin supervisión humana.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía ni validación regulatoria; el uso en producción sanitaria requeriría evaluación independiente y cumplimiento normativo.
- El formato de pesos propietario (`jev-full-v1`) obliga a usar el código incluido y complica la integración con stacks de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneYao/medical-jev-4b-full
- Versión LoRA recomendada por el autor: https://huggingface.co/JuneYao/medical-jev-4b
- Informe de evaluación: https://huggingface.co/JuneYao/medical-jev-4b-full/blob/main/EVALUATION.md
- Registro de validación de descarga e inferencia: https://huggingface.co/JuneYao/medical-jev-4b-full/blob/main/results/full/hub-validation.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
