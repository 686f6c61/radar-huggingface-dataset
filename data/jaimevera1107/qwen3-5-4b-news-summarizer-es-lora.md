# jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-LoRA

## Resumen

Qwen3.5-4B-News-Summarizer-ES-LoRA es un adaptador LoRA publicado por el usuario jaimevera1107 sobre el modelo base `unsloth/Qwen3.5-4B`. Su función es generar resúmenes de hasta cinco líneas de noticias económicas y empresariales en español (con foco en Colombia), comenzando por el actor principal, conservando las cifras reportadas y omitiendo el medio, el autor y las referencias a información ausente. El adaptador se distribuye en formato PEFT/safetensors y cuenta además con una compilación GGUF para Ollama y llama.cpp.

El modelo resuelve un problema acotado pero recurrente en redacciones y agregadores de noticias: la síntesis rápida y consistente de piezas informativas con criterios editoriales fijos. Al estar construido sobre un modelo de 4B parámetros, el coste de inferencia es bajo y puede desplegarse en hardware modesto, lo que lo hace apto para pipelines de resumen a escala.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema open source: adaptadores LoRA pequeños y especializados, entrenados con Unsloth sobre modelos base recientes, que ofrecen un comportamiento muy controlado en una tarea concreta sin necesidad de reentrenar el modelo completo. La licencia Apache 2.0 del adaptador facilita su integración, aunque el origen sintético de los datos de entrenamiento (resúmenes generados con la API de Gemini) introduce una advertencia relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only (`unsloth/Qwen3.5-4B`) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (tamaño del repo: 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 3072 tokens) |
| Tipos de cuantizacion | no disponible en la ficha; existe compilación GGUF publicada aparte para llama.cpp/Ollama |
| Idiomas soportados | español (variante Colombia, dominio económico y empresarial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT); GGUF en el repositorio complementario |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA de rank 16 sobre el modelo base `unsloth/Qwen3.5-4B` en precisión de 16 bits (sin QLoRA). El entrenamiento se realizó con Unsloth durante 1 época, con tasa de aprendizaje 0,0002 y longitud máxima de secuencia de 3072 tokens. La pérdida se calculó únicamente sobre la respuesta del asistente (`train_on_responses_only`) y se empleó la plantilla de chat con el modo de razonamiento desactivado (`enable_thinking=False`).

Los datos de entrenamiento consisten en 9.678 noticias económicas y empresariales colombianas emparejadas con resúmenes de referencia generados por Google Gemini; se reservaron 505 artículos para evaluación. El conjunto de datos no se publica porque contiene el texto completo de artículos con derechos de autor. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre pares artículo-resumen.

## Capacidades

- Generación de resúmenes de noticias económicas y empresariales en español, con límite de cinco líneas y criterios editoriales fijos (protagonista primero, cifras incluidas, sin menciones al medio ni al autor).
- Extracción y conservación de cifras reportadas en el texto original.
- Formato conversacional mediante plantilla de chat, con turno de sistema que define el rol de analista económico colombiano.
- Modo de razonamiento desactivado de forma explícita en el uso recomendado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al español; otros idiomas no están soportados ni evaluados.

## Casos de uso

- Resumen automático en redacciones digitales: el adaptador recibe titular y cuerpo de la noticia y devuelve un resumen de hasta cinco líneas con el actor principal y las cifras, lo que permite pregenerar entradillas o sumarios para portada con revisión humana posterior.
- Agregadores y newsletters económicas: integrado en un pipeline que procesa feeds RSS de medios colombianos, genera resúmenes homogéneos en formato y longitud, lo que simplifica la maquetación y reduce el trabajo editorial repetitivo.
- Alertas financieras y de mercado: para piezas sobre resultados empresariales, movimientos regulatorios o datos macroeconómicos, el modelo conserva las cifras reportadas, lo que facilita la generación de avisos breves que luego se validan contra la fuente.
- Moderación y triaje de contenido: al producir resúmenes cortos y centrados en el hecho principal, sirve como paso previo para clasificar o enrutar noticias dentro de un sistema de gestión de contenidos.
- Monitorización de competencia y clipping de prensa: empresas y consultoras pueden resumir de forma masiva noticias del sector para informes internos, con coste de inferencia bajo gracias al tamaño de 4B.
- Despliegue local en entornos con requisitos de privacidad: al existir una compilación GGUF, puede ejecutarse con Ollama o llama.cpp en estaciones de trabajo sin enviar el texto de las noticias a servicios externos.

## Benchmarks y rendimiento

Evaluación sobre 100 artículos reservados, según la model card:

| Métrica | Este modelo | Gemini (referencia) |
|---|---|---|
| Uso de relleno prohibido ("la noticia", "no reporta"...) | 0,0 % | 1,0 % |
| Resúmenes con una cifra ausente en el artículo | 7,0 % | 10,0 % |
| Longitud media (palabras) | 43,6 | 46,1 |
| ROUGE-L frente a Gemini | 0,6159 | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la ficha; para un modelo base de 4B en 16 bits se requieren del orden de 8-9 GB, y menos con cuantización GGUF (la compilación GGUF publicada permite reducir sustancialmente este requisito).
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo base cabe en GPUs de consumo con suficiente VRAM y en GPUs de datacenter (A100, H100) para despliegues por lotes.
- GPU de consumo: viable en tarjetas con 8 GB o más de VRAM en cuantizaciones reducidas del GGUF; en 16 bits, requiere tarjetas de 12-16 GB o superiores.
- Opciones de despliegue: Transformers con PEFT (`AutoPeftModelForCausalLM`), llama.cpp y Ollama mediante el repositorio GGUF complementario; vLLM y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-News-Summarizer-ES-LoRA | 4B (base) + LoRA rank 16 | no disponible (entrenamiento a 3072 tokens) | Resumen de noticias económicas en español | Apache 2.0 | Hugging Face (PEFT y GGUF) |
| Modelo base `unsloth/Qwen3.5-4B` | 4B | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Gemini (API) | no disponible | no disponible | Propósito general, usado como referencia de evaluación | Propietaria | API de Google |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Dominio restringido: entrenado para noticias económicas y empresariales en español de Colombia; otros dominios no han sido evaluados.
- Riesgo de atribución errónea de actores: puede nombrar a la entidad equivocada (por ejemplo, al regulador en lugar de la empresa) como protagonista del hecho; es necesario verificar los hechos antes de publicar.
- Fidelidad numérica imperfecta: en el 7 % de los resúmenes evaluados aparece una cifra que no figura en el artículo.
- Riesgo de alucinación en detalles no presentes en el texto, aunque el entrenamiento penaliza explícitamente el relleno sobre información ausente.
- Restricción de licencia: el adaptador es Apache 2.0, pero los resúmenes de referencia se generaron con la API de Gemini; el autor advierte de que debe revisarse los términos de dicho servicio si se reutiliza el modelo comercialmente.
- El conjunto de datos de entrenamiento no es público por contener texto de artículos con derechos de autor, lo que limita la reproducibilidad.
- No se documentan sesgos específicos más allá de la advertencia sobre atribución de actores.
- Uso previsto como asistencia editorial, no como sustituto de la verificación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-LoRA
- Compilación GGUF: https://huggingface.co/jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
