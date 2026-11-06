# CLArg-group/ita-gemma4-bsm-gemma-sem

## Resumen

BSM-Gemma (primed & sem) es un adaptador LoRA con cabeza de regresión entrenado sobre el modelo base google/gemma-4-E4B-it, desarrollado por el grupo CLArg-group en el contexto del artículo *Neurosymbolic Learning for Inference-Time Argumentation*. No es un modelo generativo de propósito general: es un Base Score Model (BSM) que, dado un claim y un argumento que lo apoya o lo ataca, asigna a ese argumento una puntuación base en el intervalo [0, 1] que representa su fuerza intrínseca. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza agregada del claim y emitir un veredicto True / False / Uncertain.

El interés del modelo reside en su enfoque neurosimbólico: en lugar de pedir a un LLM que razone directamente sobre la veracidad de un claim, se descompone la tarea en la evaluación local de argumentos individuales (aprendida por el BSM) y en una agregación formal mediante una semántica argumentativa bien definida. Esto aporta trazabilidad e interpretabilidad al proceso de verificación de claims, algo relevante para sistemas de fact-checking y razonamiento automático en producción.

El repositorio es de tamaño mínimo (0,0 GB reportados) y no registra descargas ni likes en el momento de la consulta. La información pública disponible se limita a la model card y a los artefactos referenciados en el repositorio de GitHub del proyecto; no se han publicado fichas técnicas independientes ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (backbone google/gemma-4-E4B-it) con cabeza de regresión |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del backbone; no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/` y `regression_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina tres piezas: el backbone google/gemma-4-E4B-it congelado en gran parte, un adaptador LoRA y una cabeza de regresión separada (`regression_head.safetensors`) configurada mediante `model_config.json`. La cabeza produce un escalar en [0, 1] a partir de la representación del par (claim, argumento, etiqueta de apoyo o ataque). El entrenamiento fue en dos fases: primero se primó la cabeza de regresión con puntuaciones base obtenidas mediante prompting del backbone, y después se entrenaron de forma conjunta la cabeza y el adaptador de extremo a extremo a través de la semántica DF-QuAD con la función de pérdida semántica (*semantic loss*). Este esquema de primado seguido de ajuste end-to-end con una capa simbólica diferenciable es la innovación técnica central del trabajo.

Los datos de entrenamiento son los argumentos generados por Gemma 4 E4B para los TFU Training Claims, recogidos en el fichero `Data/Training/training_true_false_uncertain_with_arguments_gemma.json` del repositorio. No se especifican en la model card el número de ejemplos, la composición lingüística del dataset ni el volumen total de tokens empleados. Tampoco se documenta el uso de RLHF o DPO; el ajuste se realiza con la pérdida semántica derivada de DF-QuAD, no con preferencias humanas.

## Capacidades

- Puntuación de argumentos: asigna una fuerza intrínseca en [0, 1] a un argumento individual que apoya o ataca un claim.
- Verificación de claims por agregación: combinado con la semántica gradual DF-QuAD, produce la fuerza del claim y un veredicto True / False / Uncertain.
- Razonamiento argumentativo neurosimbólico: separa la evaluación local (aprendida) de la agregación global (formal y determinista).
- Integración en pipelines: se ejecuta mediante el módulo `ita.base_score_model.infer_on_arguments` del repositorio ITA, con entrada y salida en CSV.
- Capacidades generativas: no aplica; el modelo no está pensado para generar texto libre, sino para producir una puntuación escalar.
- Tool calling, agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; la model card no documenta idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Fact-checking asistido: dado un claim y una batería de argumentos a favor y en contra recuperados de fuentes documentales, el BSM puntúa cada argumento y DF-QuAD agrega la fuerza del claim, permitiendo priorizar verificaciones humanas sobre los casos con veredicto incierto.
- Verificación de afirmaciones en bases de conocimiento: integrado en un pipeline que extrae argumentos de artículos o fichas y calcula un veredicto True/False/Uncertain para marcar entradas que requieren revisión editorial.
- Moderación de contenido factual: en foros o plataformas colaborativas, puntuar los argumentos aportados en disputas factuales y señalar hilos donde la evidencia agregada es débil o contradictoria.
- Investigación en argumentación computacional: servir como componente reproducible en experimentos que evalúen semánticas graduales (DF-QuAD u otras) sobre datasets de claims con argumentos estructurados.
- Evaluación de explicaciones generadas por LLM: usar el BSM para puntuar la fuerza de argumentos producidos por otro modelo y filtrar explicaciones de baja calidad antes de mostrarlas al usuario.
- Sistemas de ayuda a la decisión documental: en dominios con claims verificables (por ejemplo, literatura científica o normativa), agregar argumentos a favor y en contra para emitir una recomendación con nivel de incertidumbre explícito.
- Docencia y formación en pensamiento crítico: mostrar al usuario cómo se agregan argumentos individuales en un veredicto global, con puntuaciones intermedias auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo aparece como BSM-Gemma (primed & sem) en la Tabla 7 del artículo *Neurosymbolic Learning for Inference-Time Argumentation*, pero no se proporcionan los valores numéricos en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone es un modelo Gemma 4 E4B, pero no se especifican sus parámetros totales ni activos en la información proporcionada, por lo que no es posible calcular una estimación fiable.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del tamaño y la cuantización del backbone, no documentados aquí.
- Opciones de despliegue: el modelo se ejecuta mediante el repositorio `CLArg-group/inference-time-argumentation` con el comando `python -m ita.base_score_model.infer_on_arguments`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que se trata de un adaptador PEFT con cabeza de regresión y no de un modelo generativo estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros Base Score Models comparables ni datos de rendimiento que permitan una comparación cuantitativa. El repositorio ITA referencia otros BSMs publicados por el mismo grupo, pero sus especificaciones no se detallan en la información consultada.

## Limitaciones y advertencias

- El modelo no es un generador de texto: solo produce puntuaciones de fuerza de argumentos; cualquier uso que espere generación libre es un error de aplicación.
- Dependencia del backbone: el adaptador y la cabeza están entrenados sobre google/gemma-4-E4B-it; no son portables a otros backbones sin reentrenamiento.
- Dependencia del pipeline: requiere el repositorio ITA y el formato CSV esperado (`claim,is_support,argument`); no es un modelo autónomo.
- Datos de entrenamiento limitados a los TFU Training Claims generados por Gemma 4 E4B; el dominio y la distribución de los claims de producción pueden diferir sustancialmente, con riesgo de degradación.
- Riesgo de alucinación heredado: los argumentos de entrada pueden contener afirmaciones falsas; el BSM puntúa su fuerza argumentativa, no su veracidad factual.
- Sesgos: no documentados en la model card; no hay evaluación de sesgos publicada.
- Idiomas: no documentados; no se garantiza un comportamiento correcto fuera del idioma o idiomas de entrenamiento.
- Licencia: los pesos son MIT, pero el uso queda sujeto a la licencia del modelo base google/gemma-4-E4B-it y a los términos de los datos de entrenamiento; conviene revisar ambas antes de un despliegue comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-gemma4-bsm-gemma-sem
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del proyecto ITA: https://github.com/CLArg-group/inference-time-argumentation
- Artículo *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible el enlace directo en la información consultada
- Gemma 4 Technical Report (Gemma Team, Google DeepMind): https://arxiv.org/pdf/2607.02770
