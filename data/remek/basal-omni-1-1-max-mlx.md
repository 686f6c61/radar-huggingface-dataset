# Remek/basal-omni-1.1-max-MLX

## Resumen

basal-omni-1.1-max-MLX es un port a MLX en 8 bits del modelo Remek/basal-omni-1.1-max, un modelo de 12B construido sobre Gemma 4 12B y especializado en la toma de decisiones tipadas (clasificación con calibración de confianza). Lo desarrolla Remek y está pensado para ejecutarse en Apple Silicon mediante el motor de inferencia basal, que expone una API de decisiones (`choice`, `noul`, `score`, `multi`, `act`, `tool`) en lugar de generación de texto libre. El modelo base es experimental y solo cubre texto: los codificadores de imagen y audio del modelo bf16 no se incluyen en esta carpeta.

El modelo resuelve un problema concreto: obtener decisiones discretas entre 2 y 255 opciones con una confianza calibrada que permita automatizar parte del proceso. Con la calibración propia de este port, al 1% de error objetivo se decide automáticamente el 35,5% de las decisiones (error observado 0,5%) y al 5% el 79,6% (error observado 3,7%). Frente al modelo bf16 servido en CUDA, el port alcanza un acuerdo del 0,9836 en decisiones de 2 a 10 opciones y del 0,9989 cuando el margen del bf16 es igual o superior a 0,2.

La relevancia actual está en que permite desplegar un modelo de decisión de 12B en un Mac con memoria unificada, sin GPU dedicada, manteniendo la precisión del modelo de referencia dentro de los umbrales definidos por el autor. El repo ocupa 13,6 GB y los pesos se sirven en safetensors con cuantización afín de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B), puerto MLX; solo decodificador de texto |
| Parametros totales | 11.907.350.272 (11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 en las capas lineales de los bloques del decodificador; embeddings de tokens y normas en bf16 |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 8-bit; repositorio de 13,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 4 12B, con ajuste fino orientado a decisiones tipadas y calibración. La conversión a MLX se realizó con el conversor de mlx-lm 0.32.2 (carga, cuantización y guardado) sobre el modelo bf16: cuantización afín de 8 bits con group size 64 para las capas lineales de los bloques del decodificador, manteniendo en bf16 los embeddings de tokens (que también actúan como cabeza de salida desde la que se lee la decisión, en fp32) y las normas. mlx-lm conserva únicamente el decodificador de texto; los codificadores de imagen y audio se descartan. Los ajustes de atención rotatoria y atención global se escriben en `config.json` en las claves que lee mlx-lm.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación destacable no está en la arquitectura sino en el protocolo de lectura y calibración: el modelo emite decisiones tipadas con márgenes, y el archivo `CALIBRATION.mlx.json` contiene temperaturas por tipo y por bucket, además de umbrales certificados para objetivos de error del 1% y del 5%, ajustados sobre las lecturas de este mismo port. La tokenización y el renderizado de prompts son idénticos a los del modelo bf16 (2.000 de 2.000 prompts de desarrollo verificados), y la carpeta incluye el tokenizador y la plantilla de chat del modelo de referencia.

## Capacidades

- Toma de decisiones tipadas entre 2 y 255 opciones mediante los modos `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificación con confianza calibrada: umbrales certificados para objetivos de error del 1% y del 5%, con automatización parcial de las decisiones.
- Decisiones con margen: el modelo expone la diferencia entre la opción elegida y la siguiente, lo que permite filtrar casos dudosos.
- Soporte de tool calling a través del modo `tool` del motor basal.
- Modo `act` para decisiones de acción y modo `multi` para selección múltiple.
- Capacidades multilingües limitadas a polaco (pl) e inglés (en).
- No soporta visión ni audio en esta carpeta: los codificadores correspondientes no están incluidos.
- No es un modelo de generación de texto libre en la práctica: su uso previsto es la API de decisiones del motor basal.

## Casos de uso

- Clasificación documental con automatización parcial: el modelo decide la categoría de un documento entre un conjunto cerrado de opciones y, gracias a la calibración, el 35,5% de los casos al 1% de error objetivo se resuelven sin revisión humana, derivando el resto a revisión.
- Triaje de tickets de soporte en polaco e inglés: asignación de prioridad, categoría y equipo responsable mediante decisiones tipadas con margen de confianza, útil para enrutar automáticamente solo los casos claros.
- Enrutamiento de herramientas en agentes: el modo `tool` permite elegir qué función invocar entre un catálogo de opciones, con la ventaja de que la calibración indica cuándo la elección es fiable.
- Moderación o etiquetado con umbral de error controlado: al fijar un objetivo de error del 5%, el sistema decide automáticamente el 79,6% de los elementos con un error observado del 3,7%, lo que permite calibrar el coste de revisión manual.
- Evaluación de cumplimiento normativo sobre documentos: decisiones de tipo sí/no/no aplicable (`noul`) con confianza calibrada, adecuadas para prefiltrar expedientes antes de una revisión legal.
- Despliegue local en estaciones de trabajo Apple Silicon: con 13,6 GB de pesos en memoria unificada, un Mac con 24 GB o más puede servir el modelo sin GPU dedicada, útil para entornos con requisitos de privacidad que impiden enviar documentos a la nube.
- Selección múltiple sobre formularios o cuestionarios: el modo `multi` permite marcar varias opciones por estado, con latencia medida de 525 ms para una pregunta y 1.530 ms para cinco preguntas sobre un mismo estado en un M4 Pro.

## Benchmarks y rendimiento

Resultados del port frente al modelo bf16 servido en CUDA (RTX PRO 6000), medidos sobre cada octava decisión del conjunto de desarrollo dev v2 (1.325 de 10.606 decisiones) en un Apple M4 Pro de 24 GB con 8 peticiones en vuelo:

| Metrica | Resultado | Umbral del port gate |
|---|---|---|
| Acuerdo en 2-10 opciones | 0,9836 | >= 0,9552 |
| Acuerdo con margen bf16 >= 0,2 | 0,9989 | >= 0,9893 |
| Diferencia de accuracy | +0,58 pt | dentro de 1 punto |
| ECE | -0,0035 | <= +0,01 |
| Decisiones/s (M4 Pro, 8 en vuelo) | 0,27 | no disponible |
| Veredicto del gate | PASS | - |

Datos adicionales: sobre las 1.261 decisiones medidas con hasta 255 opciones el acuerdo es de 0,9794. 64 de las 1.325 peticiones fallaron por falta de memoria de GPU (Metal OOM) en el tramo de prompts largos con 8 peticiones en vuelo y quedaron excluidas. La calibración de este port, evaluada sobre cada segunda decisión (4.280 decisiones), alcanza una accuracy de 0,906. Los resultados de benchmarks propios del modelo (Werdykt v1 0,821, conjuntos en polaco e inglés) están publicados en el modelo base y no se puntúan por separado para esta carpeta.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 13,6 GB de memoria unificada solo para los pesos; los estados largos requieren memoria adicional. En un M4 Pro de 24 GB, 64 de 1.325 peticiones agotaron la memoria de GPU con 8 peticiones en vuelo y prompts largos.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada; para documentos largos con muchas peticiones concurrentes se recomienda un Mac con más memoria. El modelo bf16 de referencia se sirvió en una RTX PRO 6000 con CUDA.
- GPU de consumo: el port está diseñado exclusivamente para Apple Silicon vía MLX; no está pensado para GPU NVIDIA o AMD de consumo.
- Despliegue: motor basal 2.2.0 o superior con el extra `mlx` (Python 3.11 o superior), sirviendo con `basal-serve --model Remek/basal-omni-1.1-max-MLX --mode mlx --port 8000`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia medida (M4 Pro, una petición a la vez, mediana): 525 ms para una pregunta y 1.530 ms para cinco preguntas sobre un mismo estado.
- Throughput medido: 0,27 decisiones/s con 8 peticiones en vuelo en un M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.1-max-MLX (este) | 11,9B | no disponible | MLX 8-bit, safetensors | apache-2.0 | Hugging Face, 254 descargas |
| Remek/basal-omni-1.1-max (bf16) | no disponible | no disponible | bf16, safetensors | apache-2.0 | Hugging Face; incluye visión y audio |
| Remek/basal-omni-1.0-max | no disponible | no disponible | no disponible | no disponible | Hugging Face; según el autor, mejor en decisiones generales |

El autor indica que 1.1-max es mejor en las tareas específicas pero está ligeramente por detrás de 1.0-max en decisiones generales, por lo que 1.0-max sigue siendo el modelo por defecto. No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, ni de modelos comparables de otros autores con la misma API de decisiones tipadas.

## Limitaciones y advertencias

- Modelo experimental, igual que el bf16 del que deriva: debe validarse sobre los documentos propios antes de confiar en él en producción.
- Solo texto: los codificadores de imagen y audio no están en esta carpeta; para entradas multimodales hay que usar el modelo bf16.
- La cuantización cambia algunas decisiones en los casos en los que el modelo no está seguro; las decisiones con alta certeza apenas varían (acuerdo de 0,9989 con margen bf16 >= 0,2).
- La aritmética exacta y los umbrales son un punto débil de las decisiones de una sola pasada: deben calcularse en código.
- La calibración incluida está ajustada para un único orden de opciones (el predeterminado); otros órdenes requieren reajustar con `basal-calibrate`.
- Idiomas limitados a polaco e inglés; no se garantiza comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero al ser un modelo experimental de decisión conviene auditar los umbrales de confianza sobre datos propios.
- Licencia apache-2.0, que permite uso comercial, pero el carácter experimental y la falta de benchmarks estándar desaconsejan su uso directo en producción sin evaluación previa.
- En Mac de 24 GB puede agotarse la memoria de GPU con prompts largos y 8 peticiones concurrentes; para esos escenarios se necesita más memoria.

## Enlaces

- Hugging Face (este port): https://huggingface.co/Remek/basal-omni-1.1-max-MLX
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.1-max
- Repositorio del motor de inferencia basal: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
