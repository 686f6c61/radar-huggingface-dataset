# Mavenbase/Llama-3.2-Mavenbase-Eval-1B-v0.1

## Resumen

`Llama-3.2-Mavenbase-Eval-1B-v0.1` es un modelo de lenguaje pequeno (SLM) desarrollado por Mavenbase (Aaditya Kamble) como un ajuste fino supervisado del modelo base `meta-llama/Llama-3.2-1B-Instruct` de Meta. Su proposito es muy especifico: automatizar la evaluacion de entrevistas de colocacion laboral en campus universitarios de la India, aplicando rubricas basadas en el metodo STAR (Situacion, Tarea, Accion, Resultado) y generando diagnosticos de composure acustico que el autor denomina "The Fear Score".

El modelo no es un asistente generalista ni un chat model de proposito amplio, sino un generador de diagnosticos estructurados en JSON. Recibe entradas relacionadas con entrevistas y devuelve campos deterministas como `technical_score`, `star_structure_score`, `fear_score_composure`, `composure_label` y `roast_feedback`. Esta especializacion lo aleja de los benchmarks convencionales y lo orienta a un nicho muy concreto de RRHH y evaluacion educativa.

Con 1B parametros, contexto heredado de Llama 3.2 (no especificado en la model card, pero el base soporta 128k tokens) y un repositorio de solo 0,1 GB, el modelo esta pensado para despliegue ligero y bajo coste. Su relevancia actual es limitada fuera del ecosistema Mavenbase, ya que no publica benchmarks, pipeline ni demos, y su licencia Llama 3.2 impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 1B Instruct) |
| Parametros totales | 1B (aproximado, segun modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el base Llama 3.2 1B Instruct soporta 128k tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para el ajuste; no se listan cuantizaciones de inferencia publicadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 3.2 Community License Agreement |
| Formato de pesos | Safetensors |
| Metodo de ajuste | QLoRA, r=16, alpha=16, modulos q/k/v/o/gate/up/down |
| Formato de salida | JSON estructurado determinista |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-1B-Instruct`, un transformer decoder-only de Meta con atencion causal estandar, y se ajusta mediante QLoRA en precision 4-bit NF4 con rango 16 y alpha 16. Los modulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que cubre tanto la atencion como las capas MLP del bloque transformer. El autor indica el uso de Unsloth como herramienta de entrenamiento (tag `unsloth`), aunque no se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

La innovacion tecnica declarada no esta en la arquitectura sino en la salida: el modelo se entrena para producir JSON determinista con campos de evaluacion de entrevistas, incluyendo metricas acusticas derivadas de telemetria (palabras por minuto, distribucion de pausas y palabras de relleno). No se documentan tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La model card no incluye informacion sobre el dataset de ajuste, por lo que no es posible evaluar la calidad o representatividad de los datos de entrenamiento.

## Capacidades

- Generacion de diagnosticos estructurados en JSON con campos fijos: `technical_score`, `star_structure_score`, `fear_score_composure`, `composure_label` y `roast_feedback`.
- Evaluacion de respuestas de entrevista segun rubrica STAR (Situacion, Tarea, Accion, Resultado).
- Analisis de telemetria acustica declarada: palabras por minuto, distribucion de pausas y conteo de palabras de relleno.
- Clasificacion de composure con etiquetas cualitativas (`composure_label`).
- Generacion de feedback en tono de "roast" (critica directa y coloquial) segun el campo `roast_feedback`.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio nativo ni modo de razonamiento extendido.

## Casos de uso

- Evaluacion automatizada de entrevistas de colocacion en campus: el modelo recibe la transcripcion de una entrevista simulada y devuelve un JSON con puntuaciones de estructura STAR y composure, adecuado para plataformas de preparacion de estudiantes en India.
- Generacion de feedback inmediato para candidatos: el campo `roast_feedback` permite ofrecer criticas directas y accionables tras cada simulacion, reduciendo la dependencia de evaluadores humanos.
- Analisis de telemetria acustica en sesiones de practica: integrado en un pipeline que calcule WPM y pausas a partir del audio, el modelo etiqueta el nivel de composure y sugiere areas de mejora.
- Triaje en procesos de seleccion masivos: con 1B parametros y 0,1 GB de pesos, puede desplegarse en CPU o GPU de gama baja para prefiltrar candidatos antes de la revision humana.
- Investigacion en evaluacion educativa: util como baseline para estudiar la viabilidad de SLMs en tareas de grading estructurado con rubricas fijas.
- Prototipado rapido de herramientas de RRHH: su salida JSON determinista facilita la integracion en dashboards y APIs sin postprocesado complejo.
- Generacion de informes de composure para programas de formacion: el campo `composure_label` permite agregar metricas por cohorte y comparar progreso entre sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de la tarea de grading. Tampoco se proporcionan comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2-2,5 GB para 1B parametros, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 4-bit (si se genera GGUF o AWQ): alrededor de 0,7-1 GB, aunque el autor no publica versiones cuantizadas de inferencia.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660 Super) es suficiente en FP16; en 4-bit cabe en iGPU y CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables tras convertir los pesos a los formatos correspondientes; el autor no publica configuraciones de despliegue.
- Latencia y throughput estimados: no disponibles. Con 1B parametros se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-Mavenbase-Eval-1B-v0.1 | 1B | No disponible (base 128k) | Llama 3.2 Community | Evaluacion de entrevistas y composure | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community | Asistente generalista | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Asistente generalista multilingue | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | Asistente generalista ligero | Hugging Face, muy usado |

La comparativa es estructural: el modelo de Mavenbase esta especializado en una tarea de nicho y no compite en capacidades generales con los instruct models de la tabla. Su ventaja es la salida JSON determinista para grading de entrevistas; su desventaja es la ausencia de benchmarks, de comunidad y de documentacion sobre el dataset de ajuste.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre entrevistas de campus en India, puede reflejar sesgos culturales, linguisticos y socioeconomicos de ese contexto.
- Riesgo de alucinacion: alto en un modelo de 1B ajustado con QLoRA sobre un dataset no documentado; las puntuaciones pueden ser inconsistentes si la entrada se sale de la distribucion de entrenamiento.
- Limitacion de idioma: solo ingles; no soporta castellano ni otras lenguas.
- Limitacion de contexto: no se especifica en la model card; se hereda del base, pero el ajuste puede degradar el uso de contextos largos.
- Restricciones de licencia: Llama 3.2 Community License Agreement impone condiciones para uso comercial, incluyendo la necesidad de cumplir la politica de uso aceptable de Meta y, en su caso, obtener licencia adicional para mas de 700 millones de usuarios mensuales.
- Falta de validacion externa: 0 descargas y 1 like en Hugging Face; no hay evidencia de uso en produccion ni evaluaciones independientes.
- El termino "The Fear Score" es una marca del autor y no una metrica estandar validada psicometricamente; su uso en decisiones de seleccion conlleva riesgo etico y legal.
- No se publican pesos cuantizados, configuraciones de inferencia ni ejemplos de prompts, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mavenbase/Llama-3.2-Mavenbase-Eval-1B-v0.1
- Sitio del autor: https://mavenbase.tech
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
