# HamoAI/hamo-score-0.6b

## Resumen

hamo-score-0.6b es un modelo de lenguaje de 596 millones de parámetros desarrollado por Hamo AI, especializado en puntuar cinco dimensiones psicológicas (AWEHB: Agency, Withdrawal, Extremity, Hostility, Boundary) a partir de un único mensaje de una conversación de bienestar mental. No es un chatbot: nunca genera respuestas, solo devuelve un objeto JSON con cinco puntuaciones en una escala de 0,0 a 3,0. Es el primer componente de producción destilado del motor de bienestar de Hamo AI, liberado para que herramientas supervisadas por profesionales puedan ejecutar la puntuación de estado de forma local, sin API ni salida de datos del entorno.

Construido mediante destilación de conocimiento desde un modelo propietario de escala frontier (DeepSeek) sobre la base Qwen/Qwen3-0.6B, el modelo se entrenó con un coste de aproximadamente siete dólares en presupuesto de API y alcanza un 85,6 % de precisión a nivel de dimensión y un 96,2 % a nivel de decisión clínica sobre 758 turnos reales de producción anonimizados. Su relevancia radica en que permite ejecutar puntuación de estado psicológico en un portátil en menos de un segundo, con formatos safetensors, GGUF y MLX disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la documentacion; el uso en produccion limita a 3 turnos previos × 200 caracteres + mensaje de 500 caracteres |
| Tipos de cuantizacion | GGUF q8_0, bfloat16 (safetensors), MLX |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | hamo-rail-s-1.0 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B y se entrena mediante destilacion de conocimiento en tres etapas, usando como profesor un modelo propietario de escala frontier (DeepSeek) que actua como puntuador de referencia en el sistema de produccion de Hamo. El entrenamiento combina datos sinteticos generados por el profesor con 440 turnos reales de personal de Hamo con consentimiento explicito; los 758 turnos de evaluacion son datos reales de produccion anonimizados que nunca se utilizaron en el entrenamiento.

La innovacion principal es el diseno de la tarea: el modelo se entrena con exactamente un formato de prompt fijo (su rubrica esta integrada en los pesos, no se deben anadir instrucciones de puntuacion), con el template de chat de Qwen3 con el modo thinking desactivado y temperatura 0. El contexto previo es opcional, acepta hasta 5 turnos, y el toolkit oficial recorta a los ultimos 3 turnos × 200 caracteres con un maximo de 500 caracteres por mensaje. La salida es un unico objeto JSON con las cinco dimensiones AWEHB. El blog de metodologia documenta un estancamiento en el rendimiento que no se resolvio con mas datos sino con una auditoria de datos y un cambio de configuracion de una linea, que aporto tres puntos de mejora.

## Capacidades

- Puntuacion de cinco dimensiones psicologicas (AWEHB) en escala 0,0-3,0 con rejilla de 0,5: Agency (iniciativa propia), Withdrawal (abandono/evitacion), Extremity (catastrofismo/pensamiento todo-o-nada), Hostility (ataque a otros) y Boundary (expresion desde la posicion del "yo" con limites claros).
- Salida exclusivamente en JSON estructurado con validez cercana al 100 % en evaluacion.
- Distincion fina entre conceptos psicologicos proximos: la frustracion sin destinatario no puntua como hostilidad, la preocupacion realista acotada no puntua como extremidad, y los insultos puntuan como hostilidad, no como limite personal.
- Bilingue chino-ingles, con formato de prompt principal en chino.
- Compatible con inferencia local en CPU, GPU consumer y Apple Silicon (MLX).
- Integracion con el toolkit oficial hamo-score-toolkit (Apache-2.0) que incluye formato de prompt, parsing tolerante, suavizado exponencial y gate de crisis obligatorio por licencia.

## Casos de uso

- Puntuacion de estado en aplicaciones de bienestar mental: el modelo procesa cada mensaje del usuario y devuelve las cinco puntuaciones AWEHB, que se combinan con un suavizado exponencial (0,8 × historial + 0,2 × mensaje) para reducir el ruido por mensaje antes de cualquier decision.
- Supervicion humana de conversaciones de apoyo emocional: los profesionales pueden ejecutar el modelo localmente para priorizar conversaciones que requieren atencion, sin que los datos de los usuarios salgan del entorno clinico.
- Triaje en plataformas de apoyo entre pares: puntuar automaticamente mensajes de foros o grupos de ayuda mutua para identificar patrones de retirada o catastrofismo que merezcan revision.
- Investigacion en psicologia computacional: analizar corpus de conversaciones anonimizadas para estudiar la correlacion entre marcadores linguisticos de agencia, limites personales y resultados de intervenciones.
- Monitorizacion de progreso en terapia: con datos consentidos, seguir la evolucion de las puntuaciones de Agency y Boundary a lo largo de sesiones para evaluar cambios en el lenguaje del paciente.
- Herramientas de auto-reflexion para usuarios: integrar el modelo en aplicaciones de diario personal que devuelvan al usuario una lectura de su propio lenguaje (con supervisio profesional), fomentando la conciencia sobre patrones de pensamiento.
- Evaluacion de intervenciones automatizadas: medir si las respuestas generadas por sistemas asistidos mejoran las puntuaciones de estado del usuario en turnos posteriores.

## Benchmarks y rendimiento

Evaluacion sobre 758 turnos reales de produccion anonimizados (nunca usados en entrenamiento), con etiquetas del puntuador LLM de escala produccion al que sustituye:

| Metrica | hamo-score-0.6b (v6.1) | Profesor (DeepSeek, examen de 440 preguntas) | Autoconsistencia del puntuador de referencia |
|---|---|---|---|
| Nivel de dimension, dentro de ±0,5 | **85,6 %** (A85 / W88 / E87 / H94 / B75) | 88,7 % | 94-98 % |
| Nivel de decision (bucket de estado tras calculo deterministico de estres) | **96,2 %** | 97,5 % | — |
| Validez JSON | ~100 % | — | — |

Examen de auto-verificacion del toolkit: 195 preguntas sinteticas etiquetadas por profesor + 10 casos de gate escritos a mano, con banda de referencia oficial de JSON 100 %, nivel de dimension 84,0 % y gate 10/10. El blog de lanzamiento indica un acuerdo del 96,3 % con el puntuador cloud frontier en decisiones clinicas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB en bfloat16 (safetensors) y ~0,6 GB en GGUF q8_0, calculado sobre los 596M de parametros.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (RTX 3060, RTX 4090, etc.); tambien ejecutable en CPU con llama.cpp.
- Compatible con Apple Silicon via formato MLX.
- El blog oficial indica que se ejecuta en un portatil en menos de un segundo.
- Opciones de despliegue: transformers (Python), llama.cpp / Ollama (GGUF q8_0 incluido en el repo), MLX, y servidor de referencia con Docker Compose que expone el pipeline completo gate → score → smooth → bucket como `POST /score`.
- Parametros de inferencia recomendados: temperatura 0, max_new_tokens 80, stop en `<|im_end|>`, thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Precision dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hamo-score-0.6b | 0,6B | Puntuacion AWEHB | 85,6 % (±0,5) | hamo-rail-s-1.0 (restrictiva) | Pesos abiertos |
| Qwen3-0.6B (base, sin fine-tuning) | 0,6B | Generacion general | No aplica (no puntua) | Apache-2.0 | Pesos abiertos |
| Profesor DeepSeek (escala frontier) | No publicado | Puntuacion AWEHB | 88,7 % (±0,5) | Propietaria | Solo API |

El blog de destilacion menciona que un modelo tres veces mayor (aproximadamente 1,8B) gano solo un punto de precision, mientras que una auditoria de datos y un cambio de configuracion aportaron tres puntos, lo que justifica la eleccion de un modelo de 0,6B. No se dispone de datos publicos de otros modelos especializados en puntuacion afectiva AWEHB para una comparativa mas amplia.

## Limitaciones y advertencias

- No es un detector de crisis ni de autolesiones: la licencia (§3c) exige reproducir el patron de produccion de Hamo, donde el contenido de crisis se intercepta con un mecanismo deterministico independiente aguas arriba del modelo, y nunca llega al puntuador.
- No es un instrumento de diagnostico clinico ni debe usarse como tal; sus puntuaciones alimentan codigo deterministico aguas abajo (actualizacion de estres, buckets de estado, gating de acciones).
- La dimension Boundary mide la huella linguistica de los limites personales en un mensaje individual, no diagnostica el nivel de diferenciacion de una relacion; el modelo no ve la relacion, solo el lenguaje.
- Entrenado principalmente con datos en chino (el formato de prompt es chino); el rendimiento en ingles puede ser inferior al reportado.
- Datos reales de entrenamiento limitados a 440 turnos consentidos del personal de Hamo; el resto son datos sinteticos del profesor, lo que puede introducir sesgos del modelo profesor.
- Licencia hamo-rail-s-1.0 personalizada, no OSI, con restricciones para uso comercial que requieren revision legal antes de desplegar en produccion.
- El modelo solo puntua, no genera respuestas; cualquier sistema que necesite redactar respuestas debe integrarlo con un componente generador separado.
- Riesgo de alucinacion en el formato de salida: aunque la validez JSON es ~100 % en evaluacion, el modelo puede emitir un bloque `thinking` vacio antes del JSON, por lo que el parsing debe extraer el primer objeto `{...}`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HamoAI/hamo-score-0.6b
- Toolkit oficial (GitHub): https://github.com/HamoAI/hamo-score-toolkit
- Blog de lanzamiento (EN): https://www.hamo.ai/blog/open-sourcing-hamo-score-0-6b/
- Notas de metodologia de destilacion: https://www.hamo.ai/blog/distilling-hamo-score-0-6b/
- Notas de lanzamiento del toolkit (EN): https://www.hamoai.tech/blog/open-sourcing-hamo-score-toolkit/
- Notas de lanzamiento del toolkit (zh): https://www.hamo.ai/blog/open-sourcing-hamo-score-toolkit/
- Guia de fine-tuning: https://github.com/HamoAI/hamo-score-toolkit/blob/main/docs/finetune.md
