# Montalte/qwen4b-math-think-random

## Resumen

Montalte/qwen4b-math-think-random es un artefacto de fusión (merge) construido sobre Qwen/Qwen3-4B-Base, con 4.022.468.096 parámetros, publicado por el usuario Montalte bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de aplicar un vector de tarea procedente de un especialista en matemáticas en modo "think" (`modrill/math-think-q4b-20260908`) sobre el modelo base, combinándolos mediante una máscara binaria aleatoria de tamaño exacto k que conserva el 10 % de las entradas del vector de tarea, con semilla fija 42.

El interés del modelo es metodológico y experimental. Forma parte de una familia de experimentos sobre transferencia direccional entre dominios (math ↔ code) en los que se comparan distintas estrategias de fusión de vectores de tarea; en este caso concreto la máscara es uniformemente aleatoria en lugar de aprendida, lo que permite usarlo como línea base de control frente a variantes con enmascaramiento entrenado. El cuerpo de la fusión es idéntico al denominado "Plan B" en la documentación del autor, y excluye explícitamente los embeddings y la `lm_head` (se conservan los del modelo base).

Se publica con 0 descargas y 0 likes en el momento de redactar esta ficha, sin model card extensa, sin datos de evaluación y sin lista de idiomas declarada. Por tanto, debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para producción. Su relevancia actual es acotada: sirve para reproducir y auditar un experimento de fusión con semilla y tasa de retención conocidas, y como punto de comparación frente al modelo base y frente al especialista original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3), heredada de Qwen/Qwen3-4B-Base |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Longitud de contexto | no disponible en la model card del merge; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible en la model card; el repositorio se distribuye en safetensors a precision completa, y es cuantificable con herramientas externas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (el modelo base Qwen3 declara soporte multilingue, pero no hay lista confirmada para este merge) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,1 GB) |
| Modelo base | Qwen/Qwen3-4B-Base (commit 906bfd4b4dc7f14ee4320094d8b41684abff8539) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Base: un transformer decoder denso de 4,02 B de parámetros, sin mezcla de expertos ni componentes de estado recurrente. Lo específico de este artefacto es el procedimiento de fusión, no la arquitectura. El autor parte de un especialista en dominio matemático en modo "think" y calcula su vector de tarea, es decir, la diferencia entre los pesos del especialista y los del modelo base. Después aplica una máscara binaria aleatoria de tamaño exacto k que retiene una fracción de 0,1 (el 10 % de las entradas del vector de tarea) con semilla 42, y reconstruye el modelo como base más el vector de tarea enmascarado.

El cuerpo de la fusión es el mismo que el del "Plan B" descrito por el autor, y omite deliberadamente los módulos de embedding y `lm_head`: esos tensores se toman íntegramente del modelo base y no se mezclan. La diferencia respecto a otras variantes de la familia es únicamente el criterio de enmascaramiento: aquí es uniformemente aleatorio en lugar de aprendido, lo que convierte a este modelo en la condición de control del experimento.

No hay información disponible sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el especialista de origen usó RLHF, DPO u otras técnicas de alineación. Tampoco se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.) asociada a este merge. El coste computacional de producción del artefacto es el de una operación de mezcla de pesos, no el de un entrenamiento.

## Capacidades

- Generación de texto autoregresiva en modo conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento matemático en modo "think": el vector de tarea procede de un especialista en dominio matemático con modo de pensamiento activado, por lo que el modelo está orientado a problemas que requieren cadenas de razonamiento explícitas.
- Capacidad de razonamiento general y de código heredada del modelo base Qwen3-4B-Base, no verificada de forma independiente para este merge.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; depende de si el modelo base lo conserva tras la fusión, algo que el autor no documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modo "think" es el único indicio de comportamiento multi-paso.
- Capacidades multilingües: no disponible. No hay lista de idiomas declarada para este artefacto.
- Capacidades especiales: modo "think" (etiqueta `think`). No se declaran capacidades de visión ni de audio.
- Estado del modelo: es una fusión experimental, no un modelo ajustado con instrucciones de forma explícita; no hay evidencia publicada de alineación conversacional posterior a la mezcla.

## Casos de uso

- Reproducción de experimentos de fusión de modelos: el caso de uso principal. Con la semilla (42) y la fracción de retención (0,1) documentadas, un equipo de investigación puede regenerar exactamente este artefacto y verificar los resultados del autor.
- Línea base de control en estudios de transferencia math ↔ code: sirve como referencia aleatoria contra la que medir variantes con enmascaramiento aprendido, aislando cuánto de la ganancia de dominio proviene de la selección de parámetros y cuánto del azar.
- Análisis de vectores de tarea: permite estudiar empíricamente qué ocurre al conservar solo un 10 % aleatorio de la diferencia entre un especialista y su base, útil para trabajos sobre interpretabilidad de pesos y sobre geometría de espacios de parámetros.
- Evaluación de robustez de merges en modo "think": se puede comparar la coherencia de las cadenas de razonamiento de este modelo frente al especialista original y frente al modelo base en un mismo conjunto de problemas matemáticos.
- Generación de texto matemático asistida en entornos de investigación: con contexto suficiente para enunciados largos, puede emplearse para producir borradores de demostraciones o desarrollos algebraicos que un investigador revisa después, siempre que se validen los resultados.
- Prototipado de pipelines de razonamiento con verificación externa: integrado como generador de pasos intermedios y combinado con un verificador simbólico (por ejemplo, un solver o un comprobador de unidades), aprovechando el modo "think" para exponer el razonamiento antes de la respuesta final.
- Estudio de degradación por fusión parcial: al retener solo el 10 % del vector de tarea, es un caso útil para medir cuánta capacidad de dominio se pierde y en qué tipos de problema (aritmética, álgebra, demostración) la pérdida es mayor.
- Docencia y material didáctico sobre IA open source: sirve como ejemplo reproducible y de tamaño pequeño (4 B) para explicar en clase qué es un vector de tarea y cómo funciona un merge con máscara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye ninguna métrica (MMLU, GSM8K, MATH, HumanEval u otras), y los resultados de la búsqueda web no aportan datos de evaluación sobre este modelo ni sobre el especialista de origen.

## Requisitos de hardware

- VRAM estimada en pesos completos (safetensors, bf16/fp16): aproximadamente 8 GB solo para los pesos, más margen para caché KV y activaciones; en la práctica, entre 9 y 12 GB según longitud de contexto y tamaño de lote.
- Cuantización a 8 bits: aproximadamente 4,5 GB de pesos; a 4 bits, del orden de 2,5-3 GB. Estas cifras son estimaciones por tamaño de parámetros, no medidas publicadas para este artefacto.
- GPU recomendadas: para precisión completa, cualquier GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A10G, L4). Para lotes grandes o contexto largo, A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? Sí, en precisión completa cabe con holgura en tarjetas de 12 GB o más, y en cuantización de 4 bits cabe en GPUs de 8 GB. También es viable en CPU con cuantización GGUF, aunque con latencia alta.
- Opciones de despliegue: transformers (librería declarada en el repositorio), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), además de vLLM, SGLang, llama.cpp u Ollama previa conversión a GGUF. Las dos últimas no están verificadas por el autor.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-math-think-random | 4,02 B | no disponible en la model card (base: 32.768) | Fusion experimental con mascara aleatoria, dominio math, modo think | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Base | 4,02 B | 32.768 tokens (extensible) | Transformer denso preentrenado | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen3-4B | 4,02 B | 32.768 tokens (extensible) | Transformer denso con modo thinking/no-thinking y postentrenamiento | Apache-2.0 | HuggingFace, muy extendido |
| Especialista de origen (modrill/math-think-q4b-20260908) | no disponible | no disponible | Especialista en math en modo think | no disponible | Repositorio referenciado por el autor |

No hay datos de rendimiento publicados para ninguno de estos artefactos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Cualquier comparacion de calidad entre el merge, el modelo base y el especialista requiere una evaluacion propia.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación: 0 descargas, 0 likes y ninguna métrica publicada. No hay evidencia de que la fusión mejore al modelo base ni de que se acerque al especialista original.
- Retención del 10 % con máscara aleatoria: la mayor parte del vector de tarea se descarta y la selección no es informada, por lo que es esperable una degradación notable de la capacidad matemática respecto al especialista, aunque no cuantificada.
- Riesgo de alucinación: al ser una mezcla de pesos sin postentrenamiento de alineación documentado, puede generar desarrollos matemáticos plausibles pero incorrectos, especialmente en problemas de varios pasos. Requiere verificación externa.
- Sin lista de idiomas declarada: se desconoce el comportamiento real fuera del inglés y del chino, idiomas habituales en la familia Qwen. El castellano no está confirmado.
- Longitud de contexto incierta: la model card no la especifica y la fusión excluye embeddings y `lm_head`, por lo que conviene validar empíricamente el comportamiento en contextos largos antes de usarlo.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías, soporte ni mantenimiento. Conviene conservar la atribución y revisar la licencia del especialista de origen, que no se especifica en la información disponible.
- Sin soporte de tool calling confirmado: no se puede asumir compatibilidad con function calling ni con frameworks de agentes, ya que no está documentado ni evaluado.
- Reproducibilidad dependiente de terceros: el resultado depende de un repositorio especialista externo (`modrill/math-think-q4b-20260908`) cuya disponibilidad y contenido no controla el autor de esta ficha.
- No apto como componente crítico en producción sin una batería de evaluación propia que cubra dominio matemático, robustez, sesgos y comportamiento multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-math-think-random
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Especialista de origen citado en la model card: https://huggingface.co/modrill/math-think-q4b-20260908
- Repositorio del autor: https://huggingface.co/Montalte
- Paper, blog o demo asociados: no disponible. La búsqueda web realizada no devolvió ninguna referencia técnica relevante sobre este modelo.
