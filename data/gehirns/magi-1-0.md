# GEHIRNS/magi-1.0

## Resumen

magi-1.0-4B es una cuantización de precisión mixta de Qwen/Qwen3.5-4B publicada por GEHIRNS. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos son exactamente los de Qwen3.5-4B, reorganizados en un fichero GGUF que combina distintos tipos de cuantización estándar según la sensibilidad medida de cada tensor. Las proyecciones pequeñas de atención y de DeltaNet reciben más bits; las matrices grandes de la FFN, menos. El resultado es un fichero de 1,80 GiB con una media de 3,65 bits por peso.

El modelo resuelve un problema de despliegue: servir un transformer de 4.205.751.296 parámetros en GPUs de consumo con la menor pérdida de calidad posible. Según el autor, servido con caché KV de 8 bits conserva el 96 % de la puntuación de referencia del modelo completo usando el 30 % de la memoria de GPU, y decodifica 2,7 veces más rápido. El repositorio ocupa 1,9 GB y se ejecuta sin modificaciones en llama.cpp y Ollama.

La relevancia actual está en la metodología: el artículo asociado, "Where the Bits Go", documenta la asignación de precisión por clase de tensor y la métrica de "densidad de capacidad" (reducciones del error de benchmark por GiB de memoria residente). La licencia es Apache 2.0, heredada del modelo base, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con proyecciones DeltaNet (gated-deltanet); pesos del modelo base sin reentrenar |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32K en la configuración de evaluación del autor; no se declara un máximo distinto |
| Tipos de cuantizacion | Mezcla de tipos GGUF estándar por clase de tensor, media de 3,65 bits por peso; caché KV de 8 bits soportada |
| Idiomas soportados | en |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B: un transformer con proyecciones DeltaNet con compuerta (etiqueta gated-deltanet en el repositorio), orientado a generación de texto con modo de razonamiento. magi-1.0 no introduce cambios arquitectónicos ni entrenamiento adicional; es una reempaquetación de los pesos originales en GGUF con precisión mixta. La innovación está en la asignación de bits: cada clase de tensor recibe el tipo de cuantización que su sensibilidad medida requiere, con más precisión en las proyecciones pequeñas de atención y DeltaNet y menos en las matrices grandes de la FFN.

No se proporcionan en la información disponible datos sobre el corpus de entrenamiento del modelo base (número de tokens, composición del dataset) ni sobre las etapas de alineación (RLHF, DPO). El autor tampoco documenta un proceso de calibración con imatrix más allá de la etiqueta imatrix presente en el repositorio. La evaluación se realizó con razonamiento activado, presupuesto de 4.096 tokens con budget forcing, decodificación greedy y contexto de 32K sobre 2.313 tareas.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline text-generation.
- Razonamiento explícito en modo thinking, con presupuesto de tokens controlable (el autor lo fija en 4.096 para sus evaluaciones).
- Generación de código, evaluada mediante ejecución de tests (EvalPlus para HumanEval+ y MBPP+, y LiveCodeBench).
- Razonamiento matemático y de sentido común, cubierto en la suite de benchmarks del autor.
- Capacidades heredadas del modelo base Qwen3.5-4B; el autor no documenta tool calling, function calling ni soporte de agentes de forma explícita.
- Multilingüe limitado: el único idioma declarado es el inglés.
- Sin soporte declarado de visión ni audio.

## Casos de uso

- Despliegue en GPU de consumo: con 1,80 GiB de pesos y caché KV de 8 bits, el modelo cabe holgadamente en tarjetas de 8-12 GB y permite mantener contexto de 32K, lo que lo hace adecuado para estaciones de trabajo con una sola RTX 5070 o similar.
- Asistentes de código en local: la evaluación con ejecución de tests (HumanEval+, MBPP+) y LiveCodeBench indica uso viable para autocompletado y generación de funciones en entornos sin conexión, donde no se puede enviar código a una API.
- Prototipado rápido de aplicaciones de razonamiento: el modo thinking con presupuesto de tokens acotado permite controlar el coste por consulta en pipelines de agentes de un solo paso.
- Servicio de inferencia de alto throughput: el autor reporta decodificación 2,7 veces más rápida que el BF16, lo que reduce el coste por token en despliegues con Ollama o llama.cpp.
- Sustitución de cuantizaciones Q4_K_M en entornos con restricción de memoria: según el autor, ofrece entre un 14 % y un 27 % más de capacidad por GiB, útil cuando la VRAM es el límite duro.
- Evaluación comparativa de técnicas de cuantización: el artículo y los datos publicados permiten reproducir la metodología de asignación de bits por tensor en otros modelos.
- Educación e investigación: el paquete incluye paper, receta y datos en GitHub, lo que facilita estudiar el efecto de la precisión mixta sobre benchmarks concretos.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todos los modelos se ejecutaron en una RTX 5070 (12 GB) con el mismo protocolo: thinking activado con presupuesto de 4.096 tokens, decodificación greedy, contexto de 32K y 2.313 tareas. La puntuación agregada de BF16 es 84,14 %; Q4_K_M de Unsloth iguala esa cifra.

| Metrica | magi-1.0-4B + KV q8 | magi-1.0-4B | Q4_K_M | Q2_K | BF16 |
|---|---|---|---|---|---|
| Puntuacion agregada | 96 % de BF16 | no disponible en cifras absolutas | 84,14 % (igual que BF16) | 4,2 puntos por debajo de magi-1.0 | 84,14 % |
| Memoria residente (32K, Ollama) | 30 % de BF16 | 34 % de BF16 | +0,76 GiB vs magi-1.0; +1,13 GiB vs magi-1.0 + q8 KV | no disponible | referencia |
| Densidad de capacidad (ρ) | 0,893 (IC 95 %: 0,856-0,934) | 0,800 (IC 95 %: 0,768-0,835) | 0,703 (IC 95 %: 0,673-0,734) | 0,675 (IC 95 %: 0,646-0,703) | 0,294 |
| Velocidad de decodificacion | 2,7x vs BF16 | no disponible | no disponible | no disponible | referencia |

No se detallan en la información disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.), solo la puntuación agregada y la comparación relativa.

## Requisitos de hardware

- Pesos: 1,80 GiB en disco (repositorio de 1,9 GB).
- VRAM estimada: aproximadamente el 30 % de la memoria del BF16 con caché KV de 8 bits y contexto de 32K; el 34 % con la caché por defecto. La cifra excluye el contexto CUDA, de unos 1,05 GiB.
- GPU recomendadas: el autor valida en una RTX 5070 de 12 GB. Por tamaño, cabe en cualquier GPU consumer con 8 GB o más (RTX 3060/4060/5060 y superiores).
- Cabe en GPU de consumo: sí, con margen amplio para contexto largo.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: decodificación 2,7 veces más rápida que el BF16 según el autor; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion agregada | Memoria (32K) | Licencia | Formato |
|---|---|---|---|---|---|---|
| magi-1.0-4B + KV q8 | 4,21B | 32K | 96 % de BF16 | 30 % de BF16 | Apache 2.0 | GGUF |
| magi-1.0-4B | 4,21B | 32K | no disponible en absoluto | 34 % de BF16 | Apache 2.0 | GGUF |
| Qwen3.5-4B Q4_K_M (Unsloth) | 4,21B | no disponible | 84,14 % | +1,13 GiB vs magi + q8 KV | Apache 2.0 | GGUF |
| Qwen3.5-4B Q2_K | 4,21B | no disponible | 4,2 puntos menos que magi-1.0 | no disponible | Apache 2.0 | GGUF |
| Qwen3.5-4B BF16 | 4,21B | 32K | 84,14 % | referencia | Apache 2.0 | safetensors |

La comparación directa con otros modelos de 4B fuera de la familia Qwen3.5 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización con pérdida: el autor reconoce que Q4_K_M de Unsloth es 2,85 puntos más preciso que magi-1.0-4B; si la precisión es prioritaria, magi no es la opción.
- Solo inglés declarado: no hay soporte multilingüe documentado, lo que limita su uso en productos en castellano.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en tareas de razonamiento largo.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización.
- No hay soporte declarado de tool calling ni de flujos de agentes multi-paso; conviene validarlo antes de usarlo en producción con herramientas externas.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B y conviene revisar las condiciones de este último.
- Los benchmarks provienen del propio autor, con una sola GPU y un protocolo concreto (greedy, budget forcing de 4.096 tokens); no hay validación independiente en la información disponible.
- El repositorio tiene pocas descargas (1.483) y likes (5), lo que indica escasa adopción todavía.

## Enlaces

- Hugging Face: https://huggingface.co/GEHIRNS/magi-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper "Where the Bits Go": https://doi.org/10.5281/zenodo.23630199
- Repositorio de receta y datos: https://github.com/GEHIRNS/magi
- Web del autor: https://gehirns.pages.dev/
- Colección MAGI 1.0: https://huggingface.co/collections/GEHIRNS/magi-10-6adaeeaefd1d999584a8a12d
