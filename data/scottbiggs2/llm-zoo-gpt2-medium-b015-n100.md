# ScottBiggs2/llm-zoo-gpt2-medium-b015-n100

## Resumen

`ScottBiggs2/llm-zoo-gpt2-medium-b015-n100` es un artefacto de investigación publicado en HuggingFace que contiene un zoo de 100 modelos GPT-2 medium, cada uno con 354.823.168 parámetros. Todos los miembros parten de un tronco compartido (trunk) entrenado durante 46.020 pasos de optimizador con semilla 1234, y después cada uno se ramifica entrenando un 15 % adicional de pasos (beta = 0,15) sobre una mezcla distinta de cinco dominios: web, código, matemáticas, libros y multilingüe. El objetivo no es ofrecer un modelo de propósito general, sino estudiar la estructura del espacio de pesos en una población de modelos que comparten inicialización y difieren únicamente en los datos de preentrenamiento.

La arquitectura es la de GPT-2 medium estándar: 24 capas, tamaño oculto 1024 y 16 cabezas de atención, con vocabulario BPE de 50.257 tokens y `lm_head` atado a los embeddings de entrada. El presupuesto de entrenamiento es de 20 tokens por parámetro, sobre corpus públicos pequeños, sin instrucción ni ajuste de seguridad. Los pesos se distribuyen en float32, convertidos de vectores planos originales con verificación bit-exacta, y el repositorio ocupa 143,4 GB en total.

El interés del artefacto es metodológico: permite analizar cómo varían los pesos y las capacidades de 100 modelos que solo se diferencian en la mezcla de datos, con 20 anclas en mezclas repetidas y 80 singletons en mezclas distintas. No debe confundirse con un modelo listo para producción: la calidad de texto es débil por diseño y no hay resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 medium) |
| Parametros totales | 354.823.168 por miembro (100 miembros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (incluye dominio multilingüe fra_Latn en entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) + config.json por miembro |

## Arquitectura y entrenamiento

Cada miembro es un GPT-2 medium estándar: 24 capas, hidden size 1024, 16 cabezas de atención, vocabulario BPE de 50.257 tokens y `lm_head` atado a la embedding de entrada, con dropout 0,0. El entrenamiento parte de un tronco compartido entrenado durante 46.020 pasos de optimizador con semilla 1234; a partir de ahí, cada miembro entrena una fracción beta = 0,15 de 54.141 pasos adicionales sobre su propia mezcla de datos. El presupuesto global es de 20 tokens por parámetro.

Las mezclas `pi` se definen sobre un símplex de cinco dominios: web (`HuggingFaceFW/fineweb-edu`, split `train`, muestra sample-10BT), código (`codeparrot/codeparrot-clean`, `train`), matemáticas (`open-web-math/open-web-math`, `train`), libros (`manu/project_gutenberg`, split `en`) y multilingüe (`HuggingFaceFW/fineweb-2`, `fra_Latn`, `train`). El zoo contiene 20 anclas en mezclas repetidas y 80 singletons en mezclas distintas, con semilla de plan de mezclas 0. La conversión de pesos desde vectores planos se verificó bit-exacta para cada miembro. No se menciona RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de texto autorregresiva básica, con calidad débil por el presupuesto reducido de entrenamiento y los corpus pequeños.
- Cobertura parcial de cinco dominios (web, código, matemáticas, libros y multilingüe francés) según la mezcla `pi` de cada miembro.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No tiene ajuste de instrucciones ni de seguridad.
- Capacidades multilingües limitadas al dominio `fra_Latn` presente en el entrenamiento; no se documentan idiomas soportados.

## Casos de uso

- Estudio del espacio de pesos: comparar los 100 checkpoints para analizar cómo se relacionan las distancias en el espacio de pesos con las mezclas de datos, aprovechando que todos comparten tronco e inicialización.
- Análisis de especialización por dominio: evaluar cada miembro en tareas de código, matemáticas o francés para trazar curvas de rendimiento frente a los pesos `pi` de la mezcla.
- Investigación en merging de modelos: usar los miembros como población controlada para probar técnicas de interpolación o model soup, ya que las diferencias entre ellos son atribuibles solo a los datos.
- Reproducibilidad de experimentos de scaling de datos: el zoo fija tokens por parámetro (20) y pasos de rama (beta = 0,15), lo que permite replicar condiciones controladas en estudios de mezclas.
- Docencia y divulgación: ilustrar con checkpoints reales cómo un mismo tronco da lugar a comportamientos distintos según la distribución de preentrenamiento.
- Auditoría de linaje de pesos: el manifiesto SHA-256 en `provenance/` permite verificar la integridad y el origen de cada checkpoint en pipelines de investigación.
- Baseline negativo en evaluación: servir como referencia de modelo sin instrucción ni seguridad para contrastar con modelos alineados en estudios de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,4 GB solo para pesos (354,8 M de parámetros × 4 bytes), más activaciones y caché KV según longitud de secuencia.
- En float16 o bfloat16: alrededor de 0,7 GB para pesos; en cuantización de 8 bits, unos 0,35 GB; en 4 bits, unos 0,18 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) puede alojar un miembro individual con holgura; para cargar varios miembros en paralelo se recomienda A100 o H100 con 40-80 GB.
- Cabe en GPU consumer: sí, un miembro individual cabe incluso en GPUs de 8 GB en float16.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel.from_pretrained(..., subfolder="members/member_XXX")`; compatible con vLLM, TGI y llama.cpp si se convierten los pesos a los formatos correspondientes (no documentado por el autor).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 143,4 GB, por lo que conviene descargar solo los subdirectorios de los miembros necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| ScottBiggs2/llm-zoo-gpt2-medium-b015-n100 (miembro) | 354,8 M | no disponible | 20 tokens/param, 5 dominios | Apache-2.0 | Artefacto de investigación |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | WebText, ~40 GB | MIT (pesos originales) | Modelo de propósito general |
| Pythia-410M (EleutherAI) | 410 M | 2048 tokens | The Pile, 300 B tokens | Apache-2.0 | Investigación de interpretabilidad |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | WebText | MIT | Modelo de propósito general |

La comparación con GPT-2 medium y Pythia-410M es la más directa por tamaño; el zoo se distingue por su naturaleza de población controlada (100 miembros con tronco común) y por un presupuesto de entrenamiento mucho menor que Pythia, lo que se traduce en peor calidad de texto.

## Limitaciones y advertencias

- Calidad de texto débil por diseño: entrenamiento desde cero con corpus pequeños y 20 tokens por parámetro.
- Sin ajuste de instrucciones ni de seguridad: no es apto para uso conversacional directo.
- Riesgo elevado de alucinación y de generar contenido sesgado o inapropiado, al no existir filtrado posterior.
- Longitud de contexto no documentada; no se debe asumir la ventana de 1024 tokens de GPT-2 sin verificar la configuración.
- Idiomas soportados no documentados; el multilingüe se limita a `fra_Latn` en entrenamiento.
- Licencia Apache-2.0 para los pesos, pero los datasets de entrenamiento conservan sus propias licencias y términos; hay que revisar cada dataset card antes de reutilizar los datos.
- El repositorio de 143,4 GB requiere planificación de almacenamiento y ancho de banda; la descarga parcial por subdirectorio es posible pero no está documentada explícitamente.
- No hay preprint ni benchmarks publicados todavía ("link coming soon"), lo que limita la validación independiente.
- No usar en producción como modelo de propósito general: es un artefacto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/ScottBiggs2/llm-zoo-gpt2-medium-b015-n100
- Preprint: no disponible (el autor indica "link coming soon")
- Dataset web: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset código: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset matemáticas: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset libros: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset multilingüe: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
