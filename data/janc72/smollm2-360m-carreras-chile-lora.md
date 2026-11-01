# Janc72/smollm2-360m-carreras-chile-lora

## Resumen

El adaptador LoRA `Janc72/smollm2-360m-carreras-chile-lora` es un ajuste fino de tipo PEFT sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por Javier Navarro en el marco de un taller académico de máster en IA (UAI, asignatura «Tópicos Avanzados en IA 2»). El adaptador especializa al modelo base en la descripción de 19 carreras profesionales en Chile, orientado a un caso de uso de apoyo a ejecutivos de admisión que explican a postulantes en qué consiste cada titulación. No es un modelo completo: requiere cargar el base y aplicar el adaptador encima.

La técnica empleada es destilación de caja negra: un modelo profesor de gran tamaño (identificado como `gpt-6-luna`, de OpenAI) generó 72 pares pregunta-respuesta del dominio, de los cuales 60 se usaron para SFT con LoRA y 12 quedaron reservados como examen fijo. El adaptador tiene rango 64, alfa 128 y dropout 0,05, aplicado a los módulos de atención y MLP (q, k, v, o, gate, up, down). El entrenamiento se realizó en una Mac con Apple Silicon (backend MPS) en aproximadamente 9 minutos.

Es relevante ahora como ejemplo reproducible de destilación de conocimiento en modelos pequeños (360M parámetros activos) y de ajuste fino eficiente con LoRA en hardware de consumo. El propio autor lo presenta explícitamente como ejercicio educativo, no como producto, y advierte que ninguna respuesta del examen alcanzó el umbral de aprobación (nota media del juez LLM de 3,42 sobre 10 tras el entrenamiento, frente a 1,33 antes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2); adaptador LoRA sobre módulos q, k, v, o, gate, up, down |
| Parámetros totales | No disponible (adaptador LoRA; el base SmolLM2-360M-Instruct tiene ~360M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base SmolLM2-360M-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors de precisión original; el base admite cuantización estándar) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 (adaptador y base); datos de entrenamiento con restricciones por provenir de un modelo de OpenAI |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El ajuste es un LoRA con r=64, α=128, dropout=0,05, aplicado a las proyecciones q, k, v, o, gate, up y down. El entrenamiento es SFT (supervised fine-tuning) calculando la pérdida únicamente sobre los tokens de respuesta, con 3 épocas y tasa de aprendizaje 5e-4, sobre 60 pares pregunta-respuesta generados por un profesor `gpt-6-luna`. El conjunto completo era de 72 pares, con 12 reservados como examen fijo. El entrenamiento se ejecutó en una Mac con Apple Silicon (MPS) en unos 9 minutos.

El autor probó 5 configuraciones variando una variable por vez (épocas, tasa de aprendizaje, cantidad de datos, rango LoRA), siendo esta la de mejor nota media en el examen (3,42). Se observó sobreajuste con 8 épocas: una pérdida de entrenamiento baja no se tradujo en mejor nota. La ventaja sobre la configuración base (2,75) se sitúa dentro del ruido de un examen de 12 preguntas y del error del juez (MAE de 1,4 puntos frente a calificación humana en 10 ítems). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en español sobre un dominio acotado: descripción de 19 carreras profesionales en Chile (qué se estudia, a qué se dedica el titulado, para quién es, diferencias con carreras afines).
- Respuesta a preguntas en formato conversacional multi-turno mediante plantilla de chat del modelo base (`apply_chat_template`).
- Cubre las carreras: Ingeniería Civil Industrial, Ingeniería Comercial, Medicina, Medicina Veterinaria, Agronomía, Derecho, Psicología, Trabajo Social, Animación Digital, Ingeniería Civil Informática, Periodismo, Kinesiología, Fonoaudiología, Terapia Ocupacional, Enfermería, Administración Pública, Contador Auditor, Arquitectura y Diseño.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al español por el ajuste; el base soporta más idiomas, pero el adaptador no ha sido validado en ellos.

## Casos de uso

- Estudio de destilación de conocimiento: reproducir el pipeline de destilación de caja negra (profesor grande genera datos, alumno pequeño imita) con un modelo de 360M y LoRA, útil en docencia e investigación sobre eficiencia.
- Demostración de ajuste fino con PEFT: ejemplo mínimo y rápido (9 minutos en Apple Silicon) para talleres sobre LoRA, rangos, tasas de aprendizaje y sobreajuste.
- Experimentos educativos de evaluación con juez LLM: el examen fijo de 12 preguntas y la comparación antes/después sirven como plantilla para medir adaptadores en dominios acotados.
- Prueba de concepto de asistentes de dominio vertical: prototipo de asistente de admisión que explica carreras, siempre con supervisión humana y verificación contra fuentes oficiales.
- Benchmark de robustez en modelos pequeños: analizar palabras inventadas, repeticiones y confusión entre carreras como caso de estudio de las limitaciones de modelos de 360M destilados.
- Base para experimentos de mitigación de alucinación: el fallo documentado de no negarse a responder datos institucionales permite probar técnicas de rechazo o abstención sobre este adaptador.

## Benchmarks y rendimiento

| Métrica (examen fijo de 12 preguntas, juez LLM 1–10) | Antes de entrenar | Después de entrenar |
|---|---|---|
| Nota media del juez | 1,33 | 3,42 |
| Aprobación (≥ 7) | 0 % | 0 % |

| Referencia interna | Valor |
|---|---|
| Configuración base comparada | 2,75 |
| Error absoluto medio del juez frente a calificación humana (10 ítems) | 1,4 puntos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 360M en fp16 ocupa aproximadamente 0,7 GB de pesos, más overhead de activaciones y KV cache.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~2 GB de VRAM en fp16 (por ejemplo, RTX 3060, RTX 4060, GTX 1660). También puede ejecutarse en CPU.
- GPU recomendadas para producción: no aplica; el autor lo destina a uso educativo. Para experimentos, cualquier GPU consumer es suficiente.
- Entrenamiento documentado: Mac con Apple Silicon (backend MPS), ~9 minutos para 3 épocas sobre 60 ejemplos.
- Opciones de despliegue: `transformers` + `peft` (carga del base y aplicación del adaptador); el base es compatible con llama.cpp, Ollama y vLLM, aunque el adaptador debe fusionarse o cargarse vía PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janc72/smollm2-360m-carreras-chile-lora | ~360M (base) + adaptador LoRA | No disponible | Adaptador LoRA de dominio (carreras Chile) sobre SmolLM2 | Apache 2.0 (con restricciones por datos) | HuggingFace, 13 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct | ~360M | No disponible en la información | Modelo base instructivo generalista | Apache 2.0 | HuggingFace, ampliamente usado |
| SmolLM2-135M-Instruct | ~135M | No disponible en la información | Modelo base instructivo más pequeño | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | ~1,7B | No disponible en la información | Modelo base instructivo mayor | Apache 2.0 | HuggingFace |

La comparación con alternativas de la misma tarea (asistentes de orientación vocacional en español para Chile) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad baja documentada por el propio autor: ninguna respuesta del examen alcanzó la aprobación (≥ 7); hay palabras inventadas, repeticiones y confusión entre carreras.
- No se niega a responder: ante preguntas sobre datos institucionales (costes, requisitos de una universidad concreta) responde como si supiera, en lugar de remitir a la fuente oficial.
- Respuestas truncadas por el límite de generación de 200 tokens; el examen de 12 preguntas no cubre uno de los seis temas.
- Los datos provienen de un único modelo profesor y heredan sus sesgos; el juez automático también tiene sesgos (penaliza respuestas truncadas y es indulgente con afirmaciones sin sentido).
- El contenido sobre cada carrera es una generalización generada por un LLM y no fue verificado por especialistas; puede reflejar estereotipos o simplificaciones sobre profesiones.
- Riesgo de decisiones vocacionales erróneas si un postulante confiara en sus respuestas; cualquier uso real exige supervisión humana y verificación con la fuente oficial.
- Restricción de licencia: los datos de entrenamiento son salidas de un modelo de OpenAI, cuyos términos restringen usar esas salidas para desarrollar modelos que compitan con OpenAI; por ello el adaptador es de uso educativo y de investigación, y cualquier uso productivo requiere revisión legal.
- El autor declara explícitamente que no es un producto, no ha sido validado por ninguna institución y no está asociado a ninguna universidad.
- El adaptador no es un modelo completo: requiere cargar el base SmolLM2-360M-Instruct y aplicar el adaptador con PEFT.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Janc72/smollm2-360m-carreras-chile-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper de referencia citado en los tags (arXiv:2502.02737): https://arxiv.org/abs/2502.02737
- Repositorio de datos, código del taller y registro de experimentos: no publicado (forma parte del informe académico según el autor)
- Demo: no disponible
