# arnabwithab/ai-therapist-qwen3-4b-dpo-lora

## Resumen

ai-therapist-qwen3-4b-dpo-lora es un adaptador LoRA de ajuste fino por DPO (Direct Preference Optimization) construido sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo desarrolla el usuario de HuggingFace arnabwithab y forma parte de la colección "Counselling SLMs", una serie de modelos pequenos orientados a tareas de acompanamiento psicologico y consejeria conversacional. El objetivo declarado es especializar un modelo generalista de 4.000 millones de parametros en respuestas de apoyo emocional alineadas con preferencias humanas en el dominio de la psicoterapia.

El adaptador se entrena con Unsloth QLoRA aplicando DPO directamente sobre el modelo base (DPO-from-base), usando el conjunto de datos PsyCoPref de Psychotherapy-LLM. El resultado es un adaptador ligero (repo de 0,1 GB) que se carga sobre el modelo base mediante PEFT, sin necesidad de redistribuir los pesos completos. Por su tamano y licencia Apache 2.0, es un candidato practico para prototipos de bajo coste en el ambito de la salud mental conversacional.

Es relevante ahora porque demuestra el patron habitual de especializacion de modelos pequenos mediante preferencias: un SLM de 4B con contexto amplio y una capa de alineamiento especifica de dominio. No obstante, la informacion publicada es muy escasa (sin benchmarks, sin detalles de hiperparametros mas alla de r16 y beta 0.1) y el propio autor incluye un descargo de responsabilidad explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base |
| Parametros totales | 4B en el modelo base; adaptador LoRA con rango r=16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; el adaptador se distribuye en safetensors. Cuantizaciones del modelo fusionado no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3 en su variante instruct de julio de 2025. El ajuste se realiza con Unsloth QLoRA y DPO-from-base, es decir, se parte del modelo base instruct y se optimiza directamente con preferencias en lugar de pasar primero por un SFT intermedio. Los hiperparametros declarados son rango LoRA r=16, checkpoint 2000 y beta 0.1. El unico dataset indicado es PsyCoPref (Psychotherapy-LLM/PsyCoPref), un corpus de preferencias orientado a psicoterapia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, la mezcla de datos, ni si hubo etapas adicionales de RLHF. Tampoco se detalla la configuracion de atencion o innovaciones tecnicas del adaptador mas alla del propio esquema DPO + LoRA. Las evaluaciones declaradas usan muestreo con temperatura 0,7 y top_p 0,8 con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional en ingles orientada a consejeria y apoyo emocional.
- Respuestas alineadas con preferencias humanas en el dominio de la psicoterapia gracias al entrenamiento DPO sobre PsyCoPref.
- Conversacion multi-turno mediante plantilla de chat (apply_chat_template) del modelo base.
- Modo thinking del modelo base Qwen3 (desactivado en las evaluaciones del autor).
- Capacidades generales heredadas de Qwen3-4B-Instruct-2507 (razonamiento, codigo, matematicas), aunque no reentrenadas ni evaluadas en este adaptador.
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Prototipado de asistentes de apoyo emocional: el adaptador puede generar respuestas de consejeria en ingles sobre el modelo base, util para validar flujos conversacionales antes de invertir en modelos mayores.
- Investigacion en alineamiento por preferencias: sirve como referencia reproducible de DPO-from-base sobre un SLM de 4B con el dataset PsyCoPref, para comparar tecnicas de alineamiento en dominios sensibles.
- Chatbots de primera linea con derivacion a profesionales: puede gestionar conversaciones iniciales de escucha activa y escalar a un humano cuando se detecten senales de riesgo, dado su bajo coste de despliegue.
- Despliegue en infraestructura modesta: al ser un adaptador LoRA sobre un modelo de 4B, cabe en una unica GPU consumer y permite servir multiples adaptadores con vLLM mediante --enable-lora.
- Generacion de material psicoeducativo: redaccion de textos de apoyo, ejercicios de respiracion o psicoeducacion basica en ingles, siempre con revision humana.
- Evaluacion comparativa de SLMs en salud mental: banco de pruebas para medir sesgos, alucinaciones y calidad de respuesta frente a otros modelos de la coleccion Counselling SLMs.
- Simulacion de pacientes para formacion: generar respuestas de rol de paciente en practicas de entrevista clinica, con supervision y datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en FP16 para el modelo base de 4B; alrededor de 3-4 GB con cuantizacion de 4 bits. El adaptador LoRA anade una fraccion minima (repo de 0,1 GB).
- GPU recomendadas: RTX 4090, RTX 3090, A10G, L4 o A100/H100 para servir varias instancias o mayor throughput.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits; en FP16 requiere 12-16 GB.
- Opciones de despliegue: transformers + peft (como en la model card), vLLM con --enable-lora, y previsiblemente llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| ai-therapist-qwen3-4b-dpo-lora | 4B (base) + LoRA r16 | no disponible | Adaptador DPO LoRA | apache-2.0 | Especializado en consejeria, solo ingles |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Modelo base instruct | apache-2.0 | Generalista, sin alineamiento de dominio |
| Otros SLMs de la coleccion Counselling SLMs | no disponible | no disponible | Varios (SFT/DPO) | no disponible | Misma autoria y dominio, sin benchmarks publicados |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un terapeuta: el propio autor indica que las salidas no deben tratarse como consejo verificable. Uso exclusivamente informativo o de investigacion.
- Riesgo de alucinacion: un SLM de 4B puede inventar recursos, tecnicas o afirmaciones clinicas; requiere revision y guardarrailes en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset PsyCoPref puede introducir sesgos culturales o de estilo terapeutico.
- Idioma: solo ingles declarado; no apto para castellano sin ajuste adicional.
- Contexto: no se especifica la ventana efectiva del adaptador; conviene verificar la del modelo base.
- Licencia Apache 2.0 permisiva para uso comercial, pero la responsabilidad legal y etica en salud mental recae en el desplegador.
- Sin benchmarks ni evaluaciones clinicas publicadas; no hay evidencia de seguridad en situaciones de crisis (ideacion suicida, autolesiones).
- Repo con muy poca adopcion (29 descargas, 0 likes) y sin mantenimiento documentado mas alla de octubre de 2026.

## Enlaces

- HuggingFace: https://huggingface.co/arnabwithab/ai-therapist-qwen3-4b-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Coleccion Counselling SLMs: https://huggingface.co/collections/arnabwithab/counselling-slms-6ad06ab0ca4ce4cf5ceb5ca4
- Dataset PsyCoPref: https://huggingface.co/datasets/Psychotherapy-LLM/PsyCoPref
- Codigo y harness de evaluacion: https://github.com/arnabwithab/ai-therapist
