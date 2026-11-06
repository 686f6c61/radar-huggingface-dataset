# ppsub/PhishDetectAI

## Resumen

PhishDetectAI es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario ppsub en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) orientado, segun su nombre, a la deteccion de phishing. El modelo se ha entrenado utilizando la libreria Unsloth junto con TRL de Hugging Face, lo que segun el autor permitio un entrenamiento "2x mas rapido".

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con el tokenizador y la configuracion original del modelo base. El repositorio ocupa 3,1 GB y se distribuye en formato safetensors, con licencia Apache 2.0. Esta etiquetado unicamente para el idioma ingles (`en`).

La relevancia de este modelo radica en su especializacion: frente al modelo base generalista, PhishDetectAI ha sido ajustado para tareas de clasificacion/deteccion de correos o mensajes de phishing. No obstante, la model card es extremadamente escasa y no documenta el dataset de entrenamiento, los hiperparametros ni resultados de evaluacion, lo que limita seriamente su evaluacion rigurosa antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser safetensors en fp/bf16 es convertible a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PhishDetectAI es un fine-tune del modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV (caracteristico de la familia Qwen2). El modelo base incorpora RoPE para codificacion posicional y esta disenado para generacion de texto e instrucciones.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere el uso de tecnicas de ajuste eficiente en parametros (probablemente LoRA o QLoRA, aunque no se especifica). La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF/DPO, ni los hiperparametros utilizados. Tampoco se indica si el fine-tune se fusiono con los pesos base o se mantiene como adaptador (el tamano del repo de 3,1 GB sugiere pesos fusionados completos en bf16/fp16).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Especializacion presunta en deteccion de phishing (clasificacion de correos, URLs o mensajes), aunque no se documenta el formato exacto de entrada/salida esperado.
- Razonamiento basico y comprension de instrucciones, limitado por el tamano de 1,5B parametros.
- Soporte de conversacion multi-turno (heredado del modelo instruct base).
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Filtrado de correos de phishing en pasarelas de correo: el modelo puede integrarse como clasificador o generador de etiquetas sobre el cuerpo del correo y las cabeceras, aprovechando su ajuste especifico para esta tarea.
- Analisis de URLs sospechosas: dado un conjunto de URLs extraidas de un mensaje, el modelo puede generar una evaluacion textual del riesgo, aunque requeriria validacion con reglas deterministas.
- Asistente de triaje en SOC (Security Operations Center): el modelo puede resumir y priorizar alertas de phishing recibidas por analistas, generando explicaciones en lenguaje natural.
- Formacion y concienciacion en ciberseguridad: generacion de ejemplos sinteticos de correos de phishing para entrenar a empleados, siempre con supervision humana.
- Preprocesado en pipelines de deteccion: uso como etapa de primera pasada para marcar mensajes sospechosos antes de un analisis mas profundo con modelos mayores o reglas heuristicas.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 1,5B, puede desplegarse en una sola GPU consumer para pruebas de concepto de deteccion de phishing sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, MMLU, HumanEval ni ninguna otra evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (pesos completos), ~1,6 GB en cuantizacion de 8 bits y ~0,9-1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6GB en adelante), y en CPU con llama.cpp aunque con mayor latencia.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama tras conversion a GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (1,5B) se espera un throughput alto en GPU modernas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| PhishDetectAI | ~1,5B | no disponible | Apache 2.0 | Deteccion de phishing (fine-tune) | Hugging Face (97 descargas) |
| Qwen2.5-1.5B-Instruct (base) | ~1,5B | 32.768 tokens (segun modelo base) | Apache 2.0 | Proposito general, instrucciones | Hugging Face, ampliamente usado |
| Modelos de clasificacion de phishing basados en BERT | ~110M-340M | 512 tokens tipicamente | Variable | Clasificacion binaria | Hugging Face, diversos |

La comparativa con modelos especializados en phishing es dificil porque no existe un benchmark comun publicado para este fine-tune. Frente al modelo base, PhishDetectAI deberia mejorar en la tarea especifica pero carece de documentacion que lo demuestre. Frente a clasificadores BERT especializados, el enfoque generativo de PhishDetectAI ofrece explicaciones en lenguaje natural pero mayor coste computacional y menor fiabilidad en clasificacion estricta.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta dataset, hiperparametros, evaluacion ni formato de uso, lo que impide validar su calidad.
- Riesgo de alucinacion: al ser un modelo generativo de 1,5B, puede inventar justificaciones o clasificaciones erroneas; no debe usarse como unico filtro de seguridad.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o demograficos.
- Limitacion de idioma: solo se declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del uso recae en el integrador.
- Modelo con muy poca traccion (97 descargas, 0 likes) y sin mantenimiento documentado; riesgo de abandono.
- No apto para decisiones automatizadas de seguridad sin supervision humana y sin validacion contra un conjunto de test propio.
- El nombre "PhishDetectAI" sugiere una tarea de clasificacion, pero al ser un modelo generativo el formato de salida no esta estandarizado; requiere ingenieria de prompts.

## Enlaces

- Hugging Face: https://huggingface.co/ppsub/PhishDetectAI
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
