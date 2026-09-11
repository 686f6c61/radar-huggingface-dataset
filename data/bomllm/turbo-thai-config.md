# bomllm/turbo-thai-config

## Resumen

bomllm/turbo-thai-config no es un modelo de lenguaje, sino un repositorio de configuración publicado por bomllm que contiene una receta de muestreo validada y un arnés de evaluación para un fine-tune de Qwen de clase 27B orientado a tailandés y ejecutado sobre Apple Silicon (MLX, cuantización nvfp4). El repositorio no incluye pesos: los pesos proceden de la serie TURBO-Fable de DavidAU, basada en Qwen, y deben descargarse desde el repositorio del autor original respetando sus licencias (Qwen bajo Apache-2.0 y el fine-tune bajo los términos de su autor). El tamaño del repositorio es de 0,0 GB, coherente con su naturaleza exclusivamente declarativa.

El problema que resuelve es la varianza de calidad en producción con modelos tailandeses autoalojados. Según el autor, la mayor parte de la varianza observada en calidad de tailandés no provenía de los prompts, sino de truncamiento y respuestas vacías. La contribución central es un "suelo de finalización" (num_ctx 32768, num_predict 8192, think:false en rutas de bot) más una receta de muestreo (temperature 0.7, top_p 0.8, top_k 20, repeat_penalty 1.05) que reduce las fugas de caracteres Han de 43 a 15 por cada 100 completaciones.

Es relevante ahora para equipos que despliegan modelos tailandeses en hardware de consumo Apple Silicon y necesitan métricas reproducibles: incluye un banco de 60 prompts fijado por sha256, un scorer que elimina el razonamiento antes de contar, y comparaciones con intervalos de confianza por bootstrap emparejado (10.000 remuestreos, IC del 95 %). Su licencia MIT facilita la reutilización del recetario, aunque no de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de configuracion); el modelo subyacente es un fine-tune de la serie TURBO-Fable de DavidAU basada en Qwen |
| Parametros totales | No disponible (el repositorio no contiene pesos); el modelo subyacente es de clase 27B |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (valor num_ctx fijado por la receta) |
| Tipos de cuantizacion | nvfp4 (MLX) y GGUF Q4_K_M |
| Idiomas soportados | Tailandes (objetivo del recetario y del banco de evaluacion); metadatos de idioma del repositorio no disponibles |
| Licencia | MIT (repositorio de configuracion); los pesos subyacentes quedan sujetos a Apache-2.0 de Qwen y a los terminos del autor del fine-tune |
| Formato de pesos | No contiene pesos; el modelo subyacente se distribuye en MLX nvfp4 y GGUF |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni entrenamiento propios: es un conjunto de artefactos de configuración y evaluación. Los ficheros declarados son `sampling-recipe.yaml` (parámetros de muestreo, suelo de finalización y prohibiciones estrictas), `system_prompt.th.txt` (persona solo en tailandés, prohibición de caracteres Han y dos ejemplos, 4.101 caracteres), `prompts.jsonl` (banco de evaluación de 60 prompts en tailandés, con sha256 `2c3333db…`), `metrics.py` (scorer que calcula `thai_ratio`, eventos Han y eliminación de razonamiento) y `RESULTS.md` (registro de ejecuciones con intervalos de confianza). Algunos artefactos aparecen marcados en la propia model card como pendientes de publicación (`[BENCH_DATA_PENDING]`).

La innovación técnica destacable es metodológica, no arquitectónica. El autor identifica el "suelo de finalización" como el factor dominante de la calidad observada y fija un protocolo de evaluación reproducible: banco fijo anclado por sha256, scorer que retira el razonamiento antes de contar, bootstrap emparejado para los IC, un único modelo residente con registro de recargas y cuarentena de filas contaminadas. La promoción de una configuración exige que el intervalo de confianza excluya el cero. No se documentan detalles sobre el dataset de entrenamiento del fine-tune subyacente, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en tailandés con una receta de muestreo validada empíricamente sobre un banco de 60 prompts.
- Control de fuga de caracteres Han mediante prompt de sistema y penalización de repetición (reducción de 43 a 15 eventos por cada 100 completaciones).
- Ejecución en Ollama con soporte de opciones a nivel de ruta (LiteLLM o directas): temperature, top_p, top_k, repeat_penalty y num_predict.
- Modo de finalización larga: num_predict >= 8192 para textos extensos.
- Alternancia de modo de razonamiento mediante `think:false` en rutas de bot.
- Compatibilidad con MLX (nvfp4) y con GGUF Q4_K_M bajo Ollama.
- Evaluación reproducible con IC del 95 % mediante bootstrap emparejado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo fuera del tailandés.

## Casos de uso

- Despliegue de asistentes conversacionales en tailandés autoalojados: el recetario fija temperature 0.7, top_p 0.8, top_k 20 y repeat_penalty 1.05, valores validados para reducir fugas de caracteres Han en producción.
- Bots de atención al cliente con respuestas largas: el suelo de finalización num_ctx 32768 y num_predict 8192 evita el truncamiento, que según el autor era la principal fuente de varianza de calidad.
- Evaluación comparativa de configuraciones de muestreo: el banco de 60 prompts anclado por sha256 permite comparar recetas con IC por bootstrap y decidir promociones solo cuando el IC excluye el cero.
- Auditoría de fuga lingüística: `metrics.py` cuantifica la proporción de tailandés (`thai_ratio`) y los eventos Han, útil para control de calidad en pipelines editoriales.
- Integración en enrutadores LLM: la compatibilidad con LiteLLM permite aplicar la receta a nivel de ruta sin modificar el código de aplicación.
- Despliegue en hardware de consumo Apple Silicon: la configuración está medida sobre un Mac Mini M4 Pro de 48 GB, con 30,23 tok/s en MLX y 7,85 tok/s en GGUF Q4_K_M.
- Plantilla para otros idiomas con interferencia de escritura: el enfoque de persona monolingüe más prohibición explícita de caracteres ajenos y banco fijo es transferible a otros pares lingüísticos con fugas de script.
- Base para pruebas de regresión al actualizar pesos: la comparación fine-tune frente a stock (+0,0155, IC incluye el cero) sirve como referencia de no regresión.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino resultados de evaluación interna sobre un banco de 60 prompts en tailandés con 300 completaciones, bootstrap emparejado de 10.000 remuestreos e IC del 95 %, medidos el 2026-09-11 sobre un Mac Mini M4 Pro de 48 GB con Ollama 0.33.3 MLX.

| Armazon | thai_ratio | Fugas Han /100 | Finalizacion |
|---|---|---|---|
| Config G (este repositorio) | 0,7974 (0,8318 estricto) | 15 | 100 % |
| Prompt espejo | 0,7688 | 20 | 100 % |
| Sin prompt de sistema | 0,7616 | 35 | 100 % |
| Pesos stock (sin fine-tune) | 0,7843 | 43 | 100 % |

Comparaciones declaradas: Config G frente a prompt espejo, +0,0286 con IC que excluye el cero; fine-tune frente a stock, +0,0155 con IC que incluye el cero (sin regresión en tailandés) y reducción de fugas Han de 43 a 15-20 por cada 100. Velocidad: 30,23 tok/s en MLX frente a 7,85 tok/s en GGUF Q4_K_M en la misma máquina en caliente.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Repositorio de configuración: 0,0 GB, sin requisitos de VRAM propios.
- Modelo subyacente de clase 27B: la estimación de VRAM depende de la cuantización; en nvfp4 (MLX) y GGUF Q4_K_M se ha ejecutado con éxito en un Mac Mini M4 Pro con 48 GB de memoria unificada.
- VRAM exacta para otras cuantizaciones: no disponible.
- Hardware validado: Apple Silicon (Mac Mini M4 Pro, 48 GB), con MLX como backend rápido y GGUF bajo Ollama como alternativa más lenta.
- GPU NVIDIA recomendadas: no disponible; no se documentan pruebas en A100, H100 ni RTX 4090.
- Encaje en GPU de consumo: no confirmado en la información disponible; el único punto de referencia es memoria unificada de Apple Silicon.
- Opciones de despliegue documentadas: Ollama (con MLX y GGUF) y enrutado vía LiteLLM. No se mencionan vLLM, TGI ni llama.cpp directamente.
- Rendimiento medido en caliente: 30,23 tok/s (MLX) y 7,85 tok/s (GGUF Q4_K_M); latencia no disponible.
- Advertencia de timeout: según el autor, JSON estricto combinado con mezcla de idiomas puede superar los 30 s de tiempo de espera en bots.

## Comparativa con modelos similares

La comparación natural que ofrece la propia documentación es entre configuraciones sobre el mismo modelo subyacente, no frente a otros modelos de la misma categoría.

| Variante | thai_ratio | Fugas Han /100 | Finalizacion | Licencia / disponibilidad |
|---|---|---|---|---|
| Config G (este repositorio) | 0,7974 | 15 | 100 % | MIT; receta publica, pesos externos |
| Prompt espejo | 0,7688 | 20 | 100 % | No disponible |
| Sin prompt de sistema | 0,7616 | 35 | 100 % | No disponible |
| Pesos stock (sin fine-tune) | 0,7843 | 43 | 100 % | Qwen base, Apache-2.0 |

Comparativa frente a otros modelos tailandeses de clase 27B (por ejemplo, variantes de Qwen, SeaLLM o Typhoon): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos y no puede ejecutarse por sí solo; sin descargar los pesos del fine-tune de DavidAU no hay inferencia posible.
- Fuga de caracteres Han no nula: el propio autor reconoce aproximadamente 15 eventos por cada 100 completaciones, no cero.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales del modelo subyacente.
- Timeouts en producción: JSON estricto con mezcla de idiomas puede superar los 30 s de espera en rutas de bot.
- Licencias encadenadas: el repositorio es MIT, pero los pesos subyacentes dependen de la licencia Apache-2.0 de Qwen y de los términos del autor del fine-tune, que pueden restringir el uso comercial.
- Ámbito lingüístico limitado: la validación se centra en tailandés; no hay datos de rendimiento en otros idiomas.
- Artefactos incompletos: varios ficheros aparecen marcados como pendientes de publicación (`[BENCH_DATA_PENDING]`), por lo que la reproducibilidad completa no está garantizada a día de hoy.
- Adopción nula: 0 descargas y 0 me gusta en el momento de la consulta, sin validación externa independiente.
- Metadatos incompletos: pipeline e idiomas no declarados en la ficha de HuggingFace.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K que permitan comparar con el ecosistema generalista.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bomllm/turbo-thai-config
- Plataforma y repositorio principal: https://github.com/bomllm/bomllm
- Documentación del protocolo tailandés y problemas conocidos: https://github.com/bomllm/bomllm/blob/main/docs/thai.md
- Pesos del modelo subyacente (serie TURBO-Fable de DavidAU, basada en Qwen): deben localizarse en el repositorio del autor original citado en la model card; enlace exacto no disponible.
- Búsqueda web: no se han encontrado enlaces relevantes para este modelo; los resultados devueltos no guardan relación con el repositorio.
