# ApollonLabs/Heliactis-2-3.7B-GGUF

## Resumen

Heliactis-2-3.7B es un ajuste fino (fine-tune) de tipo LoRA sobre el modelo base IFM/K2-Horizon-3.7B, desarrollado por el Institute of Foundation Models (MBZUAI) y adaptado por Apollon Labs. El objetivo declarado del modelo es doble: producir griego moderno con calidad de escritura natural y preservar la integridad del codigo generado, sin degradar el conocimiento general del modelo original. Se distribuye principalmente en formato GGUF para su uso con llama.cpp.

El modelo se publica bajo licencia Apache 2.0, heredada del modelo base, y soporta dos idiomas: griego (el) e ingles (en). La version GGUF aqui descrita incluye cuatro cuantizaciones (BF16, Q8_0, Q6_K y Q4_K_M), con Q8_0 como opcion recomendada por el autor. El repositorio ocupa 22,8 GB e incluye todos los archivos de pesos.

La relevancia de este modelo radica en su enfoque en un idioma de recursos limitados como el griego, con metricas de evaluacion publicadas y comparadas contra el modelo base en conocimiento, calidad linguistica, codigo (HumanEval) y recuperacion en contexto largo. Es un ejemplo de ajuste fino pequeno (2.014 ejemplos) con merge a media intensidad para evitar la perdida de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `k2-horizon`, segun llama.cpp) |
| Parametros totales | 5.058.255.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | `max_position_embeddings` 524.288; medido hasta 16K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (Q5_K_M no publicado) |
| Idiomas soportados | Griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repo del modelo base |

## Arquitectura y entrenamiento

El modelo se basa en IFM/K2-Horizon-3.7B, un transformer de la familia K2 Horizon del Institute of Foundation Models (MBZUAI). La arquitectura se identifica como `k2-horizon` en llama.cpp y requiere la version b11454 o superior de dicha libreria. El modelo base admite una ventana de posiciones de hasta 524.288 tokens, aunque las evaluaciones publicadas solo llegan a 16K.

El ajuste fino se realizo con LoRA de rango 16 y alpha 32 sobre todas las capas de proyeccion, con learning rate 2e-4, scheduler coseno y 3 epocas. Se conservo la epoca 1 y se hizo merge a media intensidad (alpha 16 en lugar de 32), ya que a intensidad completa se perdia conocimiento general (7/30 frente a 10/30 del base). La perdida de evaluacion paso de 1,0917 a 0,6515. El entrenamiento se ejecuto en fp16 sobre 2× T4 en Kaggle con DDP, durante 64 minutos. El dataset consta de 2.014 ejemplos (griego, codigo y tool calling), con la perdida calculada solo sobre la respuesta. El sha256 del dataset es `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`.

## Capacidades

- Generacion de texto conversacional en griego e ingles.
- Generacion de codigo, con mejora medida en HumanEval (134/164 frente a 128/164 del base).
- Tool calling / function calling (incluido en los datos de entrenamiento).
- Modo de razonamiento (thinking) configurable, con niveles de esfuerzo; se recomienda desactivado o en esfuerzo bajo.
- Recuperacion en contexto largo (evaluado a 4K y 16K tokens con resultado 8/8).
- Conocimiento general en griego (mejora moderada: 12/30 frente a 10/30 del base).
- Capacidades multilingues limitadas a griego e ingles.

## Casos de uso

- Generacion de contenido en griego moderno: redaccion de textos que requieran un griego natural, con la advertencia de revisar gramatica antes de publicar.
- Asistencia de codigo en produccion: el modelo mantiene la integridad del codigo generado y puede integrarse en pipelines de desarrollo con soporte de tool calling.
- Agentes conversacionales multi-turno: la ventana de contexto del modelo base (hasta 524.288 posiciones teoricas, verificado a 16K) permite mantener conversaciones largas.
- Procesamiento de documentos largos en griego: recuperacion de informacion en contextos de hasta 16K tokens verificados.
- Traduccion y adaptacion griego-ingles: util para tareas bilingues dentro de ese par de idiomas.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (2,94 GiB) y Q6_K (3,87 GiB) permiten ejecucion en GPU consumer.
- Prototipado rapido con llama.cpp: el modelo incluye plantilla de chat embebida y funciona con `--jinja`.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre la build Q8_0, temperatura 0, con las mismas flags para el modelo base y el fine-tune:

| Test | IFM/K2-Horizon-3.7B | Heliactis 2 |
|---|---|---|
| Conocimiento general (30 preguntas cortas en griego) | 10/30 | 12/30 |
| Puntuacion griego, thinking off (3 ejecuciones) | 75,0 · 74,8 · 74,8 | 78,3 · 76,9 · 76,9 |
| Puntuacion griego, effort low | 56,4 | 77,5 |
| HumanEval pass@1, thinking off | 128/164 (78,0%) | 134/164 (81,7%) |
| Recuperacion contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

Resultados por cuantizacion:

| Build | Conocimiento | Griego, thinking off | Griego, effort low | HumanEval | Recall 4K+16K |
|---|---|---|---|---|---|
| Base Q8_0 | 10/30 | 75,0 · 74,8 · 74,8 | 56,4 | 128/164 | 8/8 |
| Q8_0 | 12/30 | 78,3 · 76,9 · 76,9 | 77,5 | 134/164 | 8/8 |
| Q6_K | 10/30 | 77,1 | 77,2 | 133/164 | 8/8 |
| Q4_K_M | 11/30 | 77,6 | 77,7 | 133/164 | 8/8 |

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: BF16 9,43 GiB; Q8_0 5,02 GiB; Q6_K 3,87 GiB; Q4_K_M 2,94 GiB.
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPU consumer como RTX 4090, RTX 3090 o superiores para las cuantizaciones menores.
- Cabe en GPU consumer: si, especialmente Q4_K_M y Q6_K.
- Opciones de despliegue: llama.cpp (version b11454 o superior, con `--jinja`), llama-server. Otras opciones no indicadas por el autor.
- Latencia y throughput: no disponibles.
- El entrenamiento se realizo en 2× T4, lo que da una referencia del orden de magnitud del hardware utilizado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Heliactis-2-3.7B | 5.058.255.360 | 524.288 (medido 16K) | 134/164 (81,7%) | Apache 2.0 | GGUF y safetensors |
| IFM/K2-Horizon-3.7B (base) | no disponible | 524.288 | 128/164 (78,0%) | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El test de griego consta de 18 prompts y la subpuntuacion de significado de 11 items: detecta colapso y mejoras claras, no cambios pequenos.
- El contexto largo solo se midio hasta 16K tokens; no se hacen afirmaciones mas alla de lo medido.
- Persisten errores gramaticales en griego, aunque menos que en el modelo base; se recomienda revisar cualquier texto antes de publicarlo.
- Evitar `reasoning_effort: "high"`: el razonamiento no cierra dentro de un presupuesto practico y con un limite de 10.000 tokens muchas respuestas vuelven vacias. Es una propiedad del modo de alto esfuerzo del modelo base.
- El modelo no fue entrenado con datos de identidad propia; si la identidad importa, debe fijarse en el system prompt.
- Riesgo de alucinacion: no cuantificado por el autor; el conocimiento general en griego es limitado (12/30).
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion correspondiente.
- Requiere llama.cpp b11454 o superior para la arquitectura `k2-horizon`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B-GGUF
- Safetensors de precision completa: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
