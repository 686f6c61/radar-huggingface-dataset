# salihfurkaan/MedDecision-System1-4B

## Resumen

MedDecision-System1-4B es un modelo de decisión clínica desarrollado por el usuario salihfurkaan, construido sobre el backbone Qwen3.5-4B mediante la librería Unsloth. A diferencia de los LLM generativos convencionales, no produce texto de forma autorregresiva: procesa una viñeta clínica junto con un conjunto de rúbricas tipadas en una única pasada hacia delante y devuelve distribuciones de probabilidad calibradas sobre opciones discretas de diagnóstico, comprobaciones binarias de suficiencia de evidencia y niveles de urgencia de triaje.

El modelo sigue el paradigma denominado System 1 (rápido, discriminativo), inspirado en Jev de TypeSafe AI y Clef de Cloudflare, y se implementa mediante la cabeza de decisión `FastDecisionModel` de Unsloth. Incorpora tres primitivas de decisión tipadas (`choice`, `noul` y `score`) con calibración de temperatura ajustada por tipo de primitiva, lo que permite que las probabilidades predichas reflejen la precisión empírica observada (ECE de 0,0152).

Su relevancia actual reside en la propuesta de sustituir la generación de texto libre por scoring discriminativo en entornos clínicos, eliminando errores de sintaxis JSON y alucinaciones de texto abierto, y en su diseño como puerta de entrada rápida delante de un modelo de razonamiento lento (System 2), como Avicenna-8B-Base del mismo autor. El modelo está entrenado únicamente en inglés y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) con cabeza de decisión discriminativa `FastDecisionModel` (estilo Jev/Clef), no autorregresiva |
| Parametros totales | 4B (backbone); 64,5M de parámetros entrenados (LoRA + cabeza de decisión) |
| Parametros activos | 3,07B en cuantización de 4 bits |
| Longitud de contexto | no disponible (el ejemplo de uso fija `max_seq_length=2048`) |
| Tipos de cuantizacion | 4 bits (load_in_4bit en el ejemplo oficial); otros no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | unsloth |
| Modelo base | unsloth/Qwen3.5-4B |
| Dataset de entrenamiento | salihfurkaan/meddecision-clinical-case-corpus (configuración `typed_decisions`) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B y sustituye la generación de siguiente token por una cabeza de scoring discriminativa (`FastDecisionModel` de Unsloth), siguiendo el paradigma System 1 de Jev y Clef. En una sola pasada hacia delante codifica simultáneamente la presentación del paciente (`state`) y todas las rúbricas clínicas candidatas (`questions`), y emite distribuciones de probabilidad sobre tres primitivas tipadas: `choice` (selección multiclase entre diagnósticos o acciones de manejo), `noul` (puertas binarias de seguridad clínica como `evidence_sufficient` o `needs_human_review`) y `score` (escalas ordenadas de urgencia como `routine`, `urgent`, `emergent`).

El ajuste se realizó con LoRA sobre el backbone más los parámetros de la cabeza de decisión (64,5M en total). La calibración de temperatura se ajusta por tipo de primitiva sobre el split de validación mediante `FastDecisionModel.calibrate`, de modo que las probabilidades emitidas se corresponden con la precisión empírica. El entrenamiento utiliza el corpus clínico propietario del autor `meddecision-clinical-case-corpus` en su configuración `typed_decisions`; no se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Scoring discriminativo de decisiones clínicas en una sola pasada, sin generación de texto libre.
- Selección multiclase (`choice`) entre diagnósticos diferenciales o acciones de manejo clínico.
- Comprobaciones binarias de seguridad clínica (`noul`): suficiencia de evidencia y necesidad de revisión humana.
- Escalas ordenadas de urgencia y completitud (`score`): por ejemplo `routine`, `urgent`, `emergent`.
- Calibración de confianza por primitiva con ECE de 0,0152, lo que permite usar las probabilidades como señal fiable de confianza.
- Abstención y escalado a revisión humana como parte explícita del espacio de decisión.
- Integración en arquitecturas de doble proceso como gatekeeper rápido delante de un modelo de razonamiento (Avicenna-8B-Base).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles (el modelo está diseñado como componente System 1, no como razonador).
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de decisión tipada con calibración; sin visión ni audio.

## Casos de uso

- Triaje de urgencias: el modelo clasifica una viñeta clínica en niveles `routine`, `urgent` o `emergent` en una sola pasada, lo que permite priorizar colas de pacientes con latencia baja y probabilidades calibradas para umbralizar derivaciones.
- Puerta de evidencia previa a razonamiento: se usa como `evidence_sufficient` y `needs_human_review` delante de un modelo System 2 (Avicenna-8B-Base), de modo que solo los casos con evidencia suficiente pasan al razonador lento, reduciendo coste computacional.
- Selección de diagnóstico diferencial en pipelines de apoyo a la decisión: dada una presentación y un conjunto cerrado de diagnósticos candidatos, devuelve una distribución de probabilidad sobre ellos, útil para ordenar hipótesis en herramientas de historia clínica electrónica.
- Enrutamiento de casos a especialistas: la combinación de `choice` sobre acción de manejo y `score` de urgencia permite derivar automáticamente casos a endoscopia, cardiología u otras rutas asistenciales.
- Control de calidad y detección de casos incompletos: la comprobación `evidence_sufficient` sirve para marcar historias clínicas con datos insuficientes antes de que lleguen a un clínico, evitando decisiones sobre información incompleta.
- Evaluación y auditoría de rúbricas clínicas: al aceptar rúbricas tipadas arbitrarias, el modelo puede usarse para comparar el comportamiento de distintos protocolos de decisión sobre un mismo corpus de casos.
- Investigación en calibración y abstención: con ECE de 0,0152 y una tasa de exactitud por registro del 90,55%, es adecuado como banco de pruebas para estudiar umbrales de confianza y políticas de escalado en sistemas clínicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, sobre el split `test` (984 casos clínicos) de `salihfurkaan/meddecision-clinical-case-corpus`, configuración `typed_decisions`. No verificados de forma independiente (`verified: false`).

| Metrica | Cabeza aleatoria pre-entrenamiento | MedDecision-System1-4B (calibrado) | Mejora |
|---|---|---|---|
| Per-Decision Accuracy | 31,34% | 94,46% | +63,12% |
| Full-Record Exact Match (`record_accuracy`) | 8,01% | 90,55% | +82,54% |
| Expected Calibration Error (ECE) | 0,1999 | 0,0152 | -92,40% |
| Validation / Test Loss | 1,0571 | 0,2178 | -0,8393 |

No se han publicado en la información disponible resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se ejecuta en 4 bits con 3,07B parámetros activos; una estimación razonable es de 3 a 4 GB de VRAM para pesos, más overhead de activaciones y contexto (el ejemplo oficial usa `max_seq_length=2048`).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una GPU consumer de 8 GB debería ser suficiente en 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 de 8 GB o superiores en cuantización de 4 bits; no confirmado oficialmente.
- Opciones de despliegue: `FastDecisionModel` de Unsloth (vía `from_pretrained` y `for_inference`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la naturaleza no autorregresiva de la cabeza de decisión hace improbable su uso directo en esos motores.
- Latencia y throughput: no disponibles. El diseño de una sola pasada sugiere latencia inferior a la de un LLM generativo equivalente, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a alternativas de la misma categoría en la información proporcionada. Como referencias conceptuales, el autor cita el paradigma Jev de TypeSafe AI y Clef de Cloudflare, pero no se aportan parámetros, contextos ni resultados de esos sistemas para una comparación cuantitativa.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedDecision-System1-4B | 4B (3,07B activos en 4 bits) | no disponible | Discriminativo System 1 sobre Qwen3.5-4B | apache-2.0 | Hugging Face |
| Avicenna-8B-Base (mismo autor) | 8B | no disponible | Generativo System 2 | no disponible | Hugging Face |
| Jev (TypeSafe AI) | no disponible | no disponible | Discriminativo System 1 | no disponible | no disponible |
| Clef (Cloudflare) | no disponible | no disponible | Discriminativo System 1 | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; proceden de un corpus propio del mismo autor, lo que introduce riesgo de sesgo de evaluación.
- El modelo no genera texto: requiere la cabeza `FastDecisionModel` de Unsloth y no es compatible con APIs estándar de transformers para generación causal.
- El espacio de decisión está acotado a las rúbricas tipadas que se le proporcionan; no descubre diagnósticos fuera del conjunto de criterios definido por el usuario.
- Riesgo de alucinación reducido por diseño (no hay texto libre), pero persiste el riesgo de decisiones clínicas incorrectas con alta confianza; la calibración mitiga pero no elimina este problema.
- No debe usarse como sustituto del juicio clínico; está pensado como componente de apoyo, triaje y filtrado, con escalado explícito a revisión humana.
- No se documentan sesgos demográficos ni la composición del corpus de entrenamiento, por lo que no es posible evaluar equidad entre poblaciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación clínica regulatoria (CE, FDA) impide su uso como dispositivo médico sin evaluación adicional.
- Longitud de contexto no documentada; el ejemplo oficial limita a 2048 tokens, lo que puede ser insuficiente para historias clínicas extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salihfurkaan/MedDecision-System1-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/salihfurkaan/meddecision-clinical-case-corpus
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo System 2 complementario: https://huggingface.co/salihfurkaan/Avicenna-8B-Base
- Librería Unsloth: https://github.com/unslothai/unsloth
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
