# PointGuardAI/Qwen3.5-2B-Content-Safety-LoRA-09-08-2026

## Resumen

El modelo PointGuardAI/Qwen3.5-2B-Content-Safety-LoRA-09-08-2026 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por PointGuardAI sobre el modelo base Qwen/Qwen3.5-2B. Su función es actuar como clasificador binario de moderación de contenido: recibe un texto no confiable codificado en JSON y determina si contiene una violación de una política de moderación de nueve categorías (A = NO_VIOLATION, B = VIOLATION).

El adaptador se entrenó para clasificar contenido según una política fija que cubre abuso y odio, seguridad sexual, seguridad infantil, violencia y daño físico, autolesiones y personas vulnerables, extremismo, abuso cibernético y de privacidad, actos ilícitos y engañosos, y manipulación dañina. La arquitectura subyacente es un transformer de 2.000 millones de parámetros (Qwen3.5-2B) con ventana de contexto de 8.192 tokens, aunque la entrada máxima de texto no confiable se limita a 4.096 tokens con truncamiento head-and-tail. El modelo es de texto únicamente; los módulos de visión del modelo base no fueron adaptados.

Es importante señalar que el autor publica este checkpoint como "diagnostic research checkpoint" y advierte explícitamente que no está aprobado para producción. El checkpoint seleccionado no cumplió los umbrales configurados de recall de VIOLATION y tasa de falsos positivos, por lo que su uso como bloqueador autónomo requiere corrección de datos, evaluación de paridad con el motor de inferencia, selección de umbrales y calibración en tráfico representativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base: ~2.000 millones; adaptador LoRA: no disponible (archivo de 67.332.688 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (base); entrada maxima de texto no confiable: 4.096 tokens con truncamiento head-and-tail |
| Tipos de cuantizacion | No especificado para el adaptador; entrenamiento en BF16 con TF32 habilitado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors), compatible con PEFT |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parametros con ventana de contexto de 8.192 tokens. El adaptador LoRA se entrena mediante PEFT (Parameter-Efficient Fine-Tuning), congelando los pesos del modelo base y anadiendo matrices de baja dimension. El entrenamiento y la evaluacion se realizaron en precision BF16 con TF32 habilitado para el entrenamiento.

La tarea es una clasificacion binaria de moderacion: el sistema recibe un texto no confiable codificado en JSON y debe devolver un unico token de etiqueta, A (NO_VIOLATION) o B (VIOLATION). La politica de moderacion contiene nueve categorias: contenido abusivo y de odio, seguridad sexual, seguridad infantil, violencia y dano fisico, autolesiones y seguridad de personas vulnerables, extremismo, abuso cibernetico y de privacidad, actos ilicitos y enganosos, y manipulacion danina. Ademas, el modelo card indica categorias "siempre prohibidas" que se aplican sin excepcion, como contenido sexual con menores o asistencia hacia capacidades quimicas, biologicas, radiologicas o nucleares.

El entrenamiento, la validacion, la calibracion y los holdouts de diagnostico utilizaron el mismo renderizador de prompts, tokenizador, plantilla de chat, regla de truncamiento head-and-tail y etiquetas de un solo token. El run seleccionado es `20260908T014043Z-46dca9e882` con contrato de tarea version 11. El checkpoint seleccionado fue el paso 1050, con una metrica `eval_priority_score = 0.9703133049`. El entrenamiento se detuvo temprano en el paso 1250 (epoca 1.5867) y se restauro el checkpoint 1050 para la exportacion. El peso publicado es identico byte a byte al export del entrenador y al checkpoint 1050. El SHA-256 del archivo de pesos es `0db566e732b29ee84bc19f3d9b05ff21eb5c11259424e097cac357530686174c`. El contrato de prompt se encuentra en `prompt_template.json` y la configuracion inmutable del run en `config.resolved.yaml`.

## Capacidades

- Clasificacion binaria de contenido: determina si un texto cumple o no la politica de moderacion (A = NO_VIOLATION, B = VIOLATION).
- Politica fija de nueve categorias: abuso y odio, seguridad sexual, seguridad infantil, violencia y dano fisico, autolesiones y personas vulnerables, extremismo, abuso cibernetico y de privacidad, actos ilicitos y enganosos, y manipulacion danina.
- Entrada de texto JSON: el modelo espera un texto no confiable codificado en JSON como entrada.
- Etiquetas de un solo token (A o B), lo que permite inferencia eficiente con decodificacion de un solo paso.
- Modo texto unicamente: los modulos de vision del modelo base no fueron adaptados.
- Ventana de contexto de 8.192 tokens, con limite de entrada de 4.096 tokens para el texto no confiable (truncamiento head-and-tail).
- Compatible con SGLang (segun las etiquetas del repositorio) y PEFT para carga del adaptador.

No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-step en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido generado por usuarios: el adaptador puede integrarse en pipelines de moderacion para clasificar comentarios, publicaciones o mensajes de usuarios antes de su publicacion, ayudando a filtrar contenido que viole la politica de nueve categorias.
- Filtrado previo de prompts en aplicaciones de IA: antes de enviar un prompt a un LLM de produccion, el adaptador puede clasificar la entrada para detectar intentos de jailbreak o contenido danino, reduciendo el riesgo de respuestas inapropiadas.
- Moderacion de respuestas de modelos: en sistemas de chat con LLM, el adaptador puede evaluar las respuestas generadas por el modelo para detectar contenido que viole la politica, permitiendo bloqueos o reintentos.
- Clasificacion en pipelines de datos: para datasets de entrenamiento o evaluacion, el adaptador puede etiquetar automaticamente textos como violatorios o no violatorios, acelerando la construccion de datasets de seguridad.
- Auditoria de conversaciones: en plataformas de mensajeria o redes sociales, el adaptador puede procesar conversaciones completas (hasta 4.096 tokens) para identificar hilos que contengan contenido danino, facilitando revisiones humanas.
- Sistemas de alerta temprana: el adaptador puede usarse como senal en sistemas de monitorizacion continua para detectar picos de contenido problematico, aunque requiere calibracion adicional antes de su uso en produccion.

Nota: el autor recomienda no usar este adaptador como bloqueador autonomo sin correccion de datos, evaluacion de paridad con el motor de inferencia, seleccion de umbrales y calibracion en trafico representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la `eval_priority_score`, una metrica personalizada del run de entrenamiento:

| Metrica | Valor |
|---|---|
| eval_priority_score (checkpoint 1050) | 0.9703133049 |
| Recall de VIOLATION (umbral configurado) | No cumplido (segun el autor) |
| Tasa de falsos positivos (umbral configurado) | No cumplido (segun el autor) |

El autor indica que el checkpoint seleccionado no cumplio los umbrales configurados de recall de VIOLATION y tasa de falsos positivos, y que la evaluacion en holdout se realizo solo tras un bypass de diagnostico explicito y unico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-2B en BF16 requiere aproximadamente 4 GB de VRAM (2.000 millones de parametros x 2 bytes por parametro). El adaptador LoRA anade un overhead minimo (archivo de ~67 MB), por lo que la VRAM total estimada es de ~4-5 GB.
- GPU recomendadas: el modelo es ligero y puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o en GPUs profesionales como A10, L4 o T4.
- Compatibilidad con GPUs de consumo: si, cabe en GPUs de consumo de gama media con 8 GB o mas de VRAM en BF16. Con cuantizacion INT8 o INT4 del modelo base, podria ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: el adaptador PEFT puede cargarse en vLLM, SGLang (mencionado en las etiquetas), llama.cpp (si se fusiona con el base y se convierte a GGUF), Ollama (mediante Modelfile con el adaptador fusionado) o Transformers con PEFT.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B Content Safety LoRA (este) | 2B (base) + LoRA | 8.192 tokens | Clasificador binario con politica de 9 categorias | Apache 2.0 | HuggingFace (diagnostico) |
| Qwen3Guard (Qwen) | No disponible en la informacion | No disponible | Guardrail con clasificacion de riesgos en prompts y respuestas del modelo | No disponible | arXiv: 2510.14276 |
| Llama Guard (Meta) | No disponible | No disponible | Clasificador de seguridad para prompts y respuestas | No disponible | No disponible |
| ShieldGemma (Google) | No disponible | No disponible | Clasificador de seguridad multimodal | No disponible | No disponible |

Nota: los datos de Qwen3Guard se extraen del informe tecnico (arXiv: 2510.14276) encontrado en la busqueda web, pero no se dispone de especificaciones detalladas en la informacion proporcionada. Para Llama Guard y ShieldGemma no se dispone de datos verificables en la informacion disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que este checkpoint es un "diagnostic research checkpoint" y que no esta aprobado como release de produccion.
- El checkpoint seleccionado no cumplio los umbrales configurados de recall de VIOLATION y tasa de falsos positivos; la evaluacion en holdout se realizo solo tras un bypass de diagnostico explicito y unico.
- No debe usarse como bloqueador autonomo sin correccion de datos, evaluacion de paridad con el motor de inferencia, seleccion de umbrales y calibracion en trafico representativo.
- El modelo solo procesa texto; los modulos de vision del modelo base no fueron adaptados.
- La entrada maxima de texto no confiable es de 4.096 tokens, con truncamiento head-and-tail, lo que puede perder informacion relevante en textos largos.
- La clasificacion es binaria (A/B), sin categorias granulares de salida; no se especifica que categoria se violo, solo si hay violacion o no.
- Los idiomas soportados no estan especificados; el rendimiento en lenguas distintas de las utilizadas en el entrenamiento es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria.
- No se han publicado benchmarks estandar; la unica metrica disponible es la `eval_priority_score`, que es una metrica personalizada no comparable entre modelos.
- El adaptador requiere el modelo base exacto en la revision `15852e8c16360a2fea060d615a32b45270f8a8fc`; usar otra revision puede producir resultados inconsistentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PointGuardAI/Qwen3.5-2B-Content-Safety-LoRA-09-08-2026
- Modelo base (Qwen/Qwen3.5-2B): https://huggingface.co/Qwen/Qwen3.5-2B
- Informe tecnico Qwen3Guard (contexto sobre guardrails de Qwen): https://arxiv.org/abs/2510.14276
