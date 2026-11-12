# CLArg-group/ita-gemma4-grpo-args-bsm-g-sem

## Resumen

`ita-gemma4-grpo-args-bsm-g-sem` es un adaptador LoRA entrenado con GRPO sobre el modelo `google/gemma-4-E4B-it`, desarrollado por el grupo CLArg. No es un modelo de chat generalista: está especializado en generar argumentos a favor y en contra de una afirmación (*claim*) dentro de un pipeline de argumentación en tiempo de inferencia (ITA, *inference-time argumentation*). El modelo forma parte del trabajo *Neurosymbolic Learning for Inference-Time Argumentation* y aparece en el apéndice G.3 (tabla 7) del paper bajo la etiqueta "Gemma GRPO args + BSM-G (primed & sem)".

El problema que resuelve es la verificación de afirmaciones (*claim verification*) con salida de tres clases: verdadero, falso o incierto. En lugar de pedir un veredicto directo al modelo, el sistema genera un conjunto de argumentos de apoyo y otro de ataque, los puntúa con un modelo de puntuación base (BSM-G, también de CLArg) y agrega las puntuaciones mediante la semántica gradual DF-QUAD para obtener una fuerza de la afirmación que se umbraliza en un veredicto.

El adaptador es pequeño (repo de 0,1 GB, LoRA de rango 8) y requiere el modelo base Gemma 4 E4B para funcionar. Su relevancia es metodológica: demuestra que un generador de argumentos puede optimizarse con refuerzo (GRPO) usando como recompensa la coherencia neurosimbólica del grafo de argumentación resultante, en lugar de una recompensa puramente lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8, α = 32, dropout 0.1) sobre transformer decoder-only `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (adaptador; el backbone es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del backbone Gemma 4 E4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al backbone) |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta ademas a la licencia del modelo base y a los terminos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E4B-it` mediante LoRA de rango 8 con α = 32 y dropout 0.1, dirigido a las proyecciones *query*, *key*, *value* y *output*. Durante el entrenamiento con GRPO solo se actualizan los parámetros del adaptador; el backbone y el modelo de puntuación base BSM-G permanecen congelados.

El entrenamiento usa el conjunto *TFU Training Claims* (1.000 afirmaciones etiquetadas como verdadero, falso o incierto). Para cada prompt se generan dos completions, que se parsean en argumentos de apoyo y de ataque; el BSM-G las puntúa y DF-QUAD agrega las puntuaciones (con la puntuación base de la propia afirmación fijada en 0,5) para producir una fuerza de la afirmación. Esa fuerza se convierte en la recompensa r<sub>α,β</sub> descrita en la sección 6 del paper, que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral relevante. Los umbrales de veredicto son fijos, α = 1/3 y β = 2/3. Las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 450 pasos de optimización, semilla 0. El entrenamiento se realizó con TRL.

## Capacidades

- Generación de argumentos de apoyo y de ataque para una afirmación dada, en el formato que espera el pipeline ITA.
- Producción de la estructura argumental necesaria para construir un QBAF (grafo bipartito de argumentación) centrado en la afirmación.
- Verificación de afirmaciones de tres clases (verdadero / falso / incierto) cuando se integra en el pipeline completo con BSM-G y DF-QUAD.
- Optimización específica para la coherencia neurosimbólica del grafo resultante, no para fluidez conversacional.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo genera los argumentos pro y contra de cada claim, que se puntúan con BSM-G y se agregan con DF-QUAD para emitir un veredicto de tres clases. Es adecuado porque su entrenamiento está alineado exactamente con esa tarea.
- Investigación en aprendizaje neurosimbólico: sirve como generador de argumentos reproducible para experimentar con recompensas basadas en semánticas de argumentación (DF-QUAD) y comparar con otras variantes del paper.
- Evaluación de modelos de puntuación base: al estar entrenado contra BSM-G (primed & sem), permite estudiar cómo cambia el rendimiento del pipeline al sustituir el BSM por alternativas.
- Construcción de datasets de argumentación: puede generar argumentos etiquetados implícitamente por su contribución al veredicto, útiles para entrenar o evaluar otros componentes.
- Análisis de robustez de verificadores de claims: al ser un adaptador pequeño y entrenado con una recompensa específica, facilita experimentos controlados sobre el efecto de la recompensa en la calidad argumental.
- Reproducción de resultados del paper: cargándolo en `checkpoints/ita-gemma4-grpo-args-bsm-g-sem/` del repositorio de ITA se reproducen las condiciones del apéndice G.3, tabla 7.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de 0,1 GB; el coste real de inferencia lo determina el backbone `google/gemma-4-E4B-it`.
- VRAM estimada: no disponible para el backbone en la información proporcionada; el adaptador añade un coste despreciable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga vía PEFT (`PeftModel.from_pretrained`) sobre el backbone en `transformers`; el repositorio de ITA espera el checkpoint en `checkpoints/ita-gemma4-grpo-args-bsm-g-sem/`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ita-gemma4-grpo-args-bsm-g-sem | Gemma 4 E4B | LoRA + GRPO | Generacion de argumentos para ITA | MIT | Hugging Face (CLArg-group) |
| BSM-G (primed & sem) | no disponible | Modelo de puntuacion base | Puntuacion de argumentos en el pipeline | no disponible | Hugging Face (CLArg-group/ita-bsm-g-sem) |
| Otras variantes del paper | Gemma 4 E4B | Adaptadores LoRA | Generacion de argumentos | no disponible | Repositorio de ITA |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: no está pensado para conversación general, código, matemáticas ni otras tareas fuera del pipeline ITA.
- Depende de componentes externos (BSM-G y la semántica DF-QUAD) para producir el veredicto final; por sí solo solo genera argumentos.
- Entrenado sobre 1.000 afirmaciones del conjunto *TFU Training Claims*; posible sobreajuste al dominio y distribución de esos datos.
- Las completions no parseables reciben recompensa −1000, lo que puede hacer al modelo conservador en el formato de salida.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Restricciones de licencia: MIT para los pesos, pero sujeto a la licencia del modelo base Gemma y a los términos de los datos de entrenamiento.
- Advertencia de producción: no hay benchmarks publicados ni datos de latencia/throughput; validar exhaustivamente antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/CLArg-group/ita-gemma4-grpo-args-bsm-g-sem
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo de puntuación base BSM-G (primed & sem): https://huggingface.co/CLArg-group/ita-bsm-g-sem
- Repositorio de ITA: https://github.com/CLArg-group/inference-time-argumentation
- TRL: https://github.com/huggingface/trl
