# matheus-ciro-tcc/gemma3-4b-triagem-medica-final

## Resumen

`matheus-ciro-tcc/gemma3-4b-triagem-medica-final` es un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo base `unsloth/gemma-3-4b-pt` de Google DeepMind, ajustado para una tarea muy concreta: clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre en portugués brasileño. Lo firma el usuario `matheus-ciro-tcc` como parte de un trabajo de fin de curso del Instituto Federal do Paraná (Câmpus Pinhais), con autoría de Matheus Marques Eiras y Ciro Guilherme Nass.

El modelo no es un asistente médico general: es un clasificador de 9 clases cerradas (Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psiquiatra, Urologista) que devuelve únicamente el nombre de la especialidad. Se entrenó sobre 145.234 ejemplos derivados del corpus público MedPT (384.095 pares pregunta-respuesta médicos en portugués), con un split estratificado 80/10/10.

Su relevancia es acotada pero clara: es el mejor de los tres modelos finales del proyecto (junto a dos variantes de Qwen3.5 de 2B y 0,8B), con un 91,35% de accuracy y un F1 macro de 0,901 sobre un conjunto de test de 18.166 ejemplos. La mejora frente al Qwen3.5-2B es de solo 0,2 puntos de accuracy con el doble de parámetros, y el punto débil compartido es la confusión Psiquiatra ↔ Psicólogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptadores LoRA; base congelada en NF4 4-bit (QLoRA) |
| Parametros totales | 4B (modelo base); adaptadores LoRA: 29.802.496 parámetros entrenables (1,03%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en la receta de entrenamiento e inferencia (`max_seq_length=1024`); contexto nativo del base Gemma 3 no disponible en la información proporcionada |
| Tipos de cuantizacion | NF4 4-bit para la base durante entrenamiento e inferencia (`load_in_4bit=True`); adaptadores en bf16 |
| Idiomas soportados | Portugués brasileño (`pt`) |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere cargar el base `unsloth/gemma-3-4b-pt` |

## Arquitectura y entrenamiento

La base es Gemma 3 4B en su variante preentrenada (`unsloth/gemma-3-4b-pt`), un transformer decoder-only. Sobre ella se aplica QLoRA: la base se congela y se cuantiza en NF4 de 4 bits, y se entrenan adaptadores LoRA en las proyecciones de atención y en el MLP, con rank 16 y alpha 32. El entrenamiento usa batch efectivo 32 (batch 8 × acumulación 4), learning rate 1e-4 con scheduler coseno y 409 pasos de calentamiento, 3 épocas (13.617 pasos) con *packing*, precisión bf16 y optimizador `adamw_8bit`. La pérdida de entrenamiento media por época bajó de 0,710 a 0,474 y luego a 0,394; la de validación pasó de 0,539 a 0,467 y 0,456.

Los datos provienen de `AKCIT/MedPT` (Färber et al., 2025), un corpus público de 384.095 pares de pregunta y respuesta médica en portugués brasileño. Se seleccionaron las 10 especialidades más frecuentes y se fusionaron "Psicólogo" y "Psicanalista" en una sola clase, quedando 9. El split estratificado (seed 42) dio 145.321 ejemplos de entrenamiento, 18.165 de validación y 18.166 de test; 87 ejemplos de entrenamiento con más de 512 tokens (0,06%) se descartaron para ajustarse a 12 GB de VRAM, mientras que el test no se filtró. El entrenamiento se ejecutó en una RTX 4070 de 12 GB con un pico de 10,45 GB y una duración de 8-9 s por paso, con varios tramos reanudados desde checkpoint. No se documenta RLHF ni DPO: es un SFT supervisado sobre clasificación.

## Capacidades

- Clasificación cerrada de especialidad médica en 9 clases a partir de texto libre en portugués brasileño.
- Generación de texto conversacional heredada del base Gemma 3, aunque el ajuste la especializa en la tarea de triaje.
- Salida restringida al nombre de la especialidad, sin explicaciones, cuando se usa el prompt de sistema documentado.
- Manejo de quejas cortas y coloquiales (p. ej. "dor de dente e sensibilidade ao frio").
- Capacidad de generar con decodificación determinista (`do_sample=False`) y `max_new_tokens=20`, suficiente para la etiqueta.
- Soporte de chat template de Gemma 3 vía `tokenizer.apply_chat_template`.
- Capacidades multilingües: no acreditadas; el modelo está ajustado exclusivamente para `pt`.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles ni documentados para este adaptador.

## Casos de uso

- Pretriaje en urgencias y centros de salud: el modelo recibe la queja del paciente y devuelve la especialidad a la que derivar, reduciendo el tiempo de clasificación manual en recepción. Es adecuado porque la tarea es de clasificación cerrada y la latencia con 4B en 4 bits es baja.
- Enrutamiento en portales de cita previa: integrar el adaptador como primer paso de un formulario web que, a partir del texto libre, preselecciona la especialidad y muestra los huecos disponibles del profesional correspondiente.
- Chatbot de orientación sanitaria en portugués: usar el modelo como clasificador previo a un sistema de FAQ o a un agente de atención, con la salida limitada a la etiqueta para evitar respuestas clínicas no supervisadas.
- Investigación en NLP clínico en portugués: servir como baseline reproducible de clasificación de especialidad sobre MedPT, con métricas, matriz de confusión y predicciones completas publicadas en la carpeta `avaliacao/`.
- Filtrado y etiquetado de corpus médicos: clasificar grandes volúmenes de pares pregunta-respuesta por especialidad para construir datasets segmentados o para enrutar consultas a paneles de expertos.
- Docencia y trabajos de fin de curso: ejemplo completo de pipeline QLoRA con Unsloth sobre hardware de consumo (RTX 4070 12 GB), reutilizable como plantilla para otras tareas de clasificación en dominios especializados.
- Comparación de familias de modelos: al compartir dataset y test con los Qwen3.5-2B y 0,8B del mismo proyecto, permite estudiar el equilibrio entre tamaño y rendimiento en una tarea concreta.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test completo (18.166 ejemplos), según la model card:

| Metrica | Gemma 3 4B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---:|---:|---:|
| Accuracy | 91,35% | 91,14% | 89,24% |
| F1 macro | 0,901 | 0,898 | 0,881 |
| Precisión macro | 0,901 | 0,899 | 0,880 |
| Recall macro | 0,901 | 0,897 | 0,883 |
| Nota del juez GLM 5.3 (100 ejemplos) | 0,961 | 0,967 | 0,946 |

F1 por clase del modelo Gemma 3 4B:

| Clase | F1 |
|---|---:|
| Ortopedista - traumatologista | 0,98 |
| Oftalmologista | 0,97 |
| Dentista | 0,94 |
| Psicólogo | 0,93 |
| Dermatologista | 0,93 |
| Otorrino | 0,92 |
| Ginecologista | 0,91 |
| Urologista | 0,88 |
| Psiquiatra | 0,63 |

De los 1.571 errores totales, el 47,6% corresponde a la confusión Psiquiatra ↔ Psicólogo; el 33% de los ejemplos de Psiquiatra se predicen como Psicólogo. La segunda confusión es Urologista × Ginecologista (12% de los ejemplos de Urologista). En la muestra evaluada por el juez, los 15 casos con palabras clave de alerta se clasificaron correctamente. La nota del juez varía entre ejecuciones, por lo que diferencias de ~0,01 no separan a los modelos. No se han publicado resultados de MMLU, HumanEval ni GSM8K para este adaptador en la información disponible.

## Requisitos de hardware

- VRAM estimada: el entrenamiento cupo en 12 GB con pico de 10,45 GB; la inferencia con `load_in_4bit=True` y `max_seq_length=1024` debería moverse en el rango de 3-4 GB de VRAM para pesos en NF4, más el overhead de activaciones y KV cache (estimación, no medida en la model card).
- GPU recomendadas: RTX 4070 12 GB validada para entrenamiento; para inferencia, cualquier GPU consumer con 8 GB o más debería ser suficiente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090).
- Cabe en GPU consumer: sí, con cuantización 4-bit; en FP16 el base de 4B ronda los 8 GB de pesos, lo que exige 12-16 GB de VRAM.
- Opciones de despliegue: Unsloth (`FastModel.from_pretrained` + `FastModel.for_inference`), PEFT + Transformers; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información proporcionada (los adaptadores LoRA sobre base cuantizada requieren conversión previa).
- Latencia y throughput: no medidos en la model card; la generación se limita a `max_new_tokens=20` con decodificación determinista, lo que mantiene la latencia baja en la práctica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test 18.166) | F1 macro | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| gemma3-4b-triagem-medica-final | 4B | 1024 (receta) | 91,35% | 0,901 | Gemma | Hugging Face (adaptador PEFT) |
| qwen35-2b-triagem-medica-final | 2B | no disponible | 91,14% | 0,898 | no disponible | Hugging Face (adaptador PEFT) |
| qwen35-0.8b-triagem-medica-final | 0,8B | no disponible | 89,24% | 0,881 | no disponible | Hugging Face (adaptador PEFT) |
| gemma3-4b-triagem-medica-piloto | 4B | 1024 (receta) | no comparable (10 clases, test de 500) | no comparable | Gemma | Hugging Face (adaptador PEFT) |

La comparación entre familias mezcla el efecto del modelo y el de la receta: Gemma usó learning rate 1e-4 y descartó ejemplos largos, mientras que los Qwen3.5 usaron 2e-4 y no filtraron. El piloto no es directamente comparable porque tiene 10 clases y un test de 500 ejemplos frente a las 9 clases y 18.166 ejemplos del final.

## Limitaciones y advertencias

- Clase Psiquiatra claramente débil (F1 0,63): un tercio de sus ejemplos se clasifican como Psicólogo, lo que en producción puede desviar derivaciones de salud mental.
- Segunda confusión relevante Urologista × Ginecologista (12% de los ejemplos de Urologista), con riesgo de derivación a una especialidad clínicamente inadecuada.
- No es un sistema de diagnóstico ni de consejo clínico: solo enruta a una especialidad; cualquier uso debe ir acompañado de supervisión humana y de un aviso claro al paciente.
- Riesgo de alucinación fuera de la tarea: al ser un modelo generativo, si se le pide algo distinto de la clasificación puede producir texto libre no validado.
- Cobertura limitada a 9 especialidades; quejas que correspondan a otras áreas (cardiología, neurología, etc.) caerán forzosamente en una de las 9 clases.
- Entrenado solo en portugués brasileño; el rendimiento en otras variantes del portugués o en otros idiomas no está evaluado.
- Ventana de contexto corta en la receta (1024 tokens) y descarte de ejemplos largos en entrenamiento; quejas muy extensas pueden degradar la clasificación.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google Gemma, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar en producto.
- Adaptador PEFT: no es un modelo autónomo; requiere descargar el base `unsloth/gemma-3-4b-pt` y respetar su licencia y sus propios términos de uso.
- Sin datos de robustez ante ruido, abreviaturas o errores ortográficos; el conjunto de test proviene del mismo corpus que el de entrenamiento, lo que puede inflar las métricas frente a tráfico real.
- La nota del juez GLM 5.3 es inestable entre ejecuciones (0,36 frente a 1,00 para el mismo acierto), por lo que no debe usarse como criterio fino de selección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matheus-ciro-tcc/gemma3-4b-triagem-medica-final
- Carpeta de evaluación (métricas, matriz de confusión, predicciones, informe): https://huggingface.co/matheus-ciro-tcc/gemma3-4b-triagem-medica-final/tree/main/avaliacao
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-pt
- Modelo piloto del mismo proyecto: https://huggingface.co/matheus-ciro-tcc/gemma3-4b-triagem-medica-piloto
- Comparativa Qwen3.5-2B: https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-final
- Comparativa Qwen3.5-0.8B: https://huggingface.co/matheus-ciro-tcc/qwen35-0.8b-triagem-medica-final
- Dataset MedPT: https://huggingface.co/datasets/AKCIT/MedPT
