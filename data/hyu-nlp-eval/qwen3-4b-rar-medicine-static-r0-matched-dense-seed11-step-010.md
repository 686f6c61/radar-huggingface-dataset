# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-010

# qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-010

## Resumen

Se trata de un checkpoint de investigación publicado por el usuario HYU-NLP-EVAL, obtenido por ajuste fino de Qwen/Qwen3-4B-Instruct-2507. Concretamente, es el paso 10 del run `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, una variante "matched dense" con recompensas basadas en rúbricas estáticas (static R0) dentro de un pipeline de aprendizaje por refuerzo, presumiblemente GRPO, aplicado a un dominio etiquetado como medicina.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 4.022.468.096 parámetros (unos 4,02 B), pesos en BF16 y una ventana de contexto de 32.768 tokens según las fichas de checkpoints hermanos del mismo run. Se publica como artefacto de auditoría de una fase 1 de entrenamiento, no como producto: la model card lo etiqueta explícitamente como "research use only" y no formula ninguna afirmación de capacidad médica ni de seguridad clínica.

Su relevancia es metodológica más que funcional. Al coexistir con otros checkpoints del mismo run (variante de rúbricas dinámicas "OnlineRubrics-Every", pasos 000, 013, 016, 036 y 042), permite estudiar la evolución de una política intermedia, comparar recompensas estáticas frente a dinámicas y reproducir experimentos con una semilla concreta. No tiene descargas ni valoraciones, y no se han publicado resultados de evaluación asociados, por lo que debe tratarse como material de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen3-4B-Instruct-2507; ajuste posterior con aprendizaje por refuerzo |
| Parametros totales | 4.022.468.096 (~4,02 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun las fichas de checkpoints relacionados del mismo run; no confirmado de forma explicita para este checkpoint concreto |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en BF16 sin versiones cuantizadas |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 en los metadatos; el texto de la model card indica "Research use only" |
| Formato de pesos | safetensors (BF16) en la raiz; `original_checkpoint/` contiene los ficheros originales de veRL (solo parametros) |
| Tamano del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only denso de unos 4 B de parametros. No hay en la informacion disponible detalles sobre numero de capas, cabezas de atencion, vocabulario o si se aplico alguna tecnica de atencion eficiente; tampoco se documenta una modificacion estructural respecto al base. El checkpoint se distribuye en BF16 para inferencia, acompanado de los ficheros originales de veRL en un subdirectorio aparte.

Sobre el entrenamiento, la nomenclatura del run (`static-r0-medicine-qwen3-4b-matched-dense`) y las fichas de los checkpoints hermanos indican un ajuste con GRPO y recompensas basadas en rubricas aplicado a un dominio medico, en una variante "matched dense" que funciona como condicion de control densa frente a otras configuraciones del mismo estudio. Los checkpoints hermanos declaran tener el modo de razonamiento ("thinking") desactivado, aunque para este paso concreto no se confirma en la informacion proporcionada. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT o DPO antes del RL.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation con etiqueta conversational, heredado del modelo base.
- Razonamiento extendido: no confirmado; los checkpoints hermanos del run declaran "thinking disabled", por lo que es probable que este paso tampoco exponga un modo de razonamiento largo.
- Tool calling / function calling: no disponible. El modelo base Qwen3 lo soporta, pero la model card no lo garantiza para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales: no se declara vision, audio, ni modo de pensamiento. El unico rasgo distintivo documentado es su origen: politicas intermedias entrenadas con recompensas de rubricas en un dominio medico.
- Afirmaciones de dominio: ninguna. La model card no reclama capacidad medica ni seguridad clinica.

## Casos de uso

- Investigacion en aprendizaje por refuerzo con rubricas: el checkpoint sirve como estado intermedio de una politica entrenada con GRPO y recompensas de rubricas, util para analizar como evoluciona la distribucion de salidas entre pasos.
- Auditoria de pipelines de entrenamiento: al publicarse pasos concretos (10, 36, 42 en distintos runs), permite reconstruir curvas de aprendizaje y detectar colapso o degradacion en fases tempranas del RL.
- Reproducibilidad experimental: la semilla 11 y la configuracion "matched dense" estan fijadas en el nombre del run, lo que facilita replicar el experimento en otro entorno.
- Comparacion de variantes de recompensa: enfrentar este checkpoint estatico (static R0) contra los de rubricas dinamicas del mismo autor ayuda a medir el efecto del tipo de rubrica sin cambiar el modelo base.
- Baseline en evaluaciones internas de dominio medico: puede usarse como referencia de partida en protocolos de evaluacion cerrados, siempre con fines de investigacion y sin trasladar conclusiones a entornos clinicos.
- Punto de partida para fine-tuning posterior: al ser un modelo denso de 4 B en BF16, se puede continuar el entrenamiento en una unica GPU de gama alta para experimentos de destilacion o ajuste especifico.
- Generacion de texto en prototipos de laboratorio: para pruebas de integracion en pipelines de transformers o TGI donde no se requiera licencia comercial clara ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), y la busqueda web solo devuelve fichas de registro y de checkpoints hermanos, sin metricas. Tampoco se ha publicado una evaluacion especifica del dominio medico.

## Requisitos de hardware

- Pesos en BF16: 4.022.468.096 parametros x 2 bytes = 8,04 GB (unos 7,5 GiB) solo para los pesos.
- Cache KV a 32.768 tokens: del orden de 4,5 GiB adicionales en BF16, segun una estimacion basada en la arquitectura publica del base (36 capas, GQA con 8 cabezas KV). Es una estimacion, no un dato verificado en la informacion disponible.
- VRAM total estimada en BF16 con contexto completo: en torno a 12-13 GiB.
- Cuantizacion: no hay GGUF ni AWQ/GPTQ publicados. Si se generan, cabria esperar unos 4 GB en INT8 y 2-2,5 GB en INT4 para los pesos, mas la cache KV correspondiente.
- GPU consumer: cabe en BF16 con contexto reducido en RTX 4080 (16 GB), RTX 4090 (24 GB) y A6000; en tarjetas de 12 GB como la RTX 3060 requeriria cuantizacion o contextos cortos.
- GPU profesional: cualquier A100, H100, L40S o similar lo ejecuta con margen amplio.
- Despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM y endpoints compatibles de HuggingFace. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que no esta publicada.
- Latencia y throughput: no disponibles. El repositorio pesa 25,7 GB porque incluye el checkpoint original de veRL ademas del modelo de inferencia, lo que alarga la descarga inicial.
- Nota de memoria: al ser un ajuste denso sin adapter, no se puede cargar como LoRA sobre el base; requiere cargar los pesos completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (static-r0-matched-dense, step 10) | 4,02 B | 32.768 (segun fichas hermanas) | apache-2.0, con "research use only" en la model card | HuggingFace, 0 descargas | Paso temprano de un run de GRPO estatico |
| Qwen/Qwen3-4B-Instruct-2507 | no disponible en la informacion | no disponible | no disponible | HuggingFace | Modelo base declarado; sin datos de evaluacion en la busqueda |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042 | no disponible | no disponible | no disponible | HuggingFace | Variante con rubricas dinamicas (OnlineRubrics-Every), thinking desactivado, paso 42 |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036 | no disponible | no disponible | no disponible | HuggingFace | Mismo run que este checkpoint, paso 36; permite ver la evolucion |

No hay datos suficientes en la informacion disponible para comparar rendimiento con alternativas externas de tamano similar (por ejemplo Llama-3.2-3B-Instruct, Gemma-3-4B o Phi-4-mini): no se han publicado benchmarks de este checkpoint ni de sus hermanos, y la busqueda web no aporta cifras.

## Limitaciones y advertencias

- Uso declarado solo para investigacion: la model card indica "Research use only" y no formula ninguna afirmacion de capacidad medica ni de seguridad clinica. No debe emplearse en decisiones clinicas ni en atencion a pacientes.
- Inconsistencia de licencia: los metadatos declaran apache-2.0, mientras que el texto de la model card restringe el uso a investigacion. Conviene aclarar la situacion con el autor antes de cualquier uso comercial.
- Checkpoint intermedio: se trata del paso 10 de un run de RL, publicado como estado de politica para auditoria. Es esperable que este infraentrenado respecto a pasos posteriores del mismo run y que su calidad sea inestable.
- Ausencia total de evaluaciones: sin benchmarks, sin evaluaciones de sesgo y sin pruebas de robustez. No hay evidencia publica de su comportamiento.
- Riesgo de alucinacion: no documentado ni mitigado de forma explicita. Al operar sobre dominio medico sin garantias, el riesgo de respuestas plausibles pero incorrectas es alto.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgo demografico, linguistico o de dominio.
- Idiomas: no se declaran idiomas soportados. No se puede asumir un rendimiento uniforme en castellano.
- Razonamiento: los checkpoints hermanos del run declaran el modo "thinking" desactivado; no hay confirmacion para este paso, pero es probable que carezca de cadena de razonamiento explicita.
- Sin validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe retroalimentacion de terceros.
- Repositorio pesado: 25,7 GB que incluyen los ficheros originales de veRL, no solo los pesos de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-010
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano con rubricas dinamicas, paso 000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Checkpoint hermano con rubricas dinamicas, paso 042: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042
- Checkpoint hermano con rubricas dinamicas, paso 013 (ficha en Featherless): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano con rubricas dinamicas, paso 016 (ficha en Friendli): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-016
- Registro del checkpoint static-r0-matched, paso 036 (Free2AITools): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Paper o blog del metodo: no disponible en la informacion proporcionada.
