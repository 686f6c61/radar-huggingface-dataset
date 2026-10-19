# CTlandu/csci680-a1-t5-ft-pt-st

## Resumen

`CTlandu/csci680-a1-t5-ft-pt-st` es un modelo T5-small (arquitectura encoder-decoder, 60.506.624 parámetros) afinado por el usuario CTlandu para una única tarea de generación de comentarios de revisión a partir de código Java (`code2comment`). Forma parte de la asignatura CSCI 680 (Assignment 1, "bonus condition C") y se construye sobre el checkpoint `CTlandu/csci680-a1-t5-small-pretrained`, del mismo autor.

El interés del modelo no es su calidad, sino su valor como caso documentado de colapso en el ajuste fino: según la propia model card, tras 100.000 pasos con AdamW a 3e-4 y bf16, el modelo emite la misma frase ("I think this should be a constant.") en 4.992 de sus 5.000 predicciones de test, con exact match 0 y BLEU-4 de 0,14. El modelo multi-tarea de la condición B, entrenado con el mismo presupuesto de pasos, alcanza BLEU-4 de 0,97 y genera 3.719 comentarios distintos.

Es relevante ahora como referencia negativa reproducible: ilustra cómo una tarea única con un objetivo estrecho puede degradar un T5-small hasta un modo degenerado, y sirve para comparar estrategias de mezcla de datos (single-task frente a multi-task) en automatización de revisión de código. No es un modelo apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, Text-to-Text Transfer Transformer) |
| Parametros totales | 60.506.624 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la arquitectura T5 original emplea posiciones relativas y se entreno con secuencias de hasta 512 tokens; el autor no documenta la longitud configurada) |
| Tipos de cuantizacion | No se han publicado variantes cuantizadas (solo safetensors en fp32/bf16); al ser un modelo de 60 M de parametros es cuantificable con herramientas externas (int8, 4-bit) |
| Idiomas soportados | Ingles (`en`) y codigo (`code`); el corpus de ajuste es codigo Java |
| Licencia | No disponible (la model card no declara licencia; el dataset de origen es CC BY 4.0) |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria `transformers`) |

## Arquitectura y entrenamiento

La base es T5-small: un transformer encoder-decoder con atenccion por posiciones relativas, disenado para formular toda tarea como texto-a-texto. El autor parte de su propio checkpoint preentrenado `CTlandu/csci680-a1-t5-small-pretrained` y lo ajusta de forma supervisada sobre el par `code2comment: <method>` → comentario de revision, es decir, una unica tarea de generacion de comentarios.

El ajuste fino uso 100.000 pasos con tamano de lote 32, optimizador AdamW con tasa de aprendizaje 3e-4 y precision bf16, seleccionando el checkpoint del paso 100.000. No se documenta RLHF, DPO ni ninguna etapa de alineacion posterior. Los datos proceden del corpus de Tufano et al. (ICSE 2022), publicado en Zenodo con DOI 10.5281/zenodo.5387856 bajo licencia CC BY 4.0, en el submuestreo preparado para el curso. El resultado documentado es un colapso de modo: el modelo converge a una respuesta fija en lugar de generar comentarios condicionados al metodo de entrada.

## Capacidades

- Generacion de texto condicionada a un prefijo de entrada en formato texto-a-texto (`code2comment: <method>`), la unica tarea para la que fue ajustado.
- Generacion de comentarios de revision sobre codigo Java, en ingles (objetivo nominal del ajuste fino).
- En la practica, emite una unica respuesta fija: 4.992 de 5.000 predicciones de test son "I think this should be a constant.", por lo que la capacidad de generar comentarios diversos esta ausente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento (thinking), vision, audio ni ninguna modalidad adicional.
- Multilinguismo limitado a ingles y codigo; no hay evidencia de rendimiento en castellano.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio, lo que permite desplegarlo como endpoint de inferencia de texto.

## Casos de uso

- Material docente sobre modos de fallo en ajuste fino: el modelo sirve como ejemplo reproducible de colapso a respuesta constante tras 100.000 pasos, util en asignaturas de ingenieria de software e IA (CSCI 680 es su contexto original).
- Baseline negativo en experimentos de generacion de comentarios de revision: cualquier modelo nuevo puede compararse contra su BLEU-4 de 0,14 y su exact match de 0 para demostrar mejora real.
- Validacion de pipelines de evaluacion: util para comprobar que las metricas (BLEU-4, exact match, ratio de predicciones distintas) detectan correctamente un modelo degenerado antes de desplegar un sistema de revision automatica.
- Pruebas de integracion de infraestructura: su tamano (0,2 GB) permite validar endpoints compatibles con TGI, colas de inferencia y formato texto-a-texto sin consumir GPUs dedicadas.
- Prototipado en CPU de bajo coste: con 60,5 M de parametros cabe en cualquier maquina y permite ensayar pipelines de preprocesado de codigo Java (extraccion de metodos, tokenizacion) antes de escalar a modelos mayores.
- Estudio de mezcla de datos single-task frente a multi-task: la comparacion directa con la condicion B (BLEU-4 0,97, 3.719 comentarios distintos) con el mismo presupuesto de pasos es un experimento controlado util para decidir estrategias de entrenamiento.
- Reproducibilidad academica: al estar vinculado a un repositorio de curso (`aura-lab-wm/teaching-genai4se-2026-jtang05`), sirve para replicar el experimento y verificar la regla de seleccion de checkpoint.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre 5.000 instancias de test con decodificacion greedy:

| Metrica | Condicion C (este modelo, solo code2comment) | Condicion B (multi-tarea, referencia del autor) |
|---|---|---|
| BLEU-4 | 0,14 | 0,97 |
| Exact match | 0,00 | No disponible |
| Comentarios distintos generados (de 5.000) | 8 | 3.719 |
| Predicciones iguales a "I think this should be a constant." | 4.992 | No disponible |

El autor no publica resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. Pesos en fp32: unos 242 MB (60,5 M de parametros × 4 bytes); en fp16/bf16: unos 121 MB; en int8: unos 61 MB; en 4-bit: unos 30 MB.
- GPU recomendadas: ninguna GPU de datacenter es necesaria. Funciona en RTX 3060, RTX 4060, GTX 1650, Tesla T4 o cualquier GPU con 2 GB o mas de VRAM.
- Cabe holgadamente en GPU de consumo, e incluso en CPU: la inferencia en CPU es viable para lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline `text2text-generation`), `text-generation-inference` (el repo incluye los tags `text-generation-inference` y `endpoints_compatible`), ONNX Runtime y servicios propios con PyTorch. No hay evidencia de soporte en llama.cpp u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponible; el autor no publica mediciones. A modo de referencia dimensional, un modelo de 60 M de parametros en una GPU consumer moderna opera en el orden de milisegundos por secuencia corta, pero no se ha verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `CTlandu/csci680-a1-t5-ft-pt-st` (este) | 60,5 M | No disponible | BLEU-4 0,14; EM 0,00; colapso a frase fija | No disponible | HuggingFace, 0 descargas |
| `CTlandu/csci680-a1-t5-ft-pt` (condicion B del mismo autor) | 60,5 M (misma base) | No disponible | BLEU-4 0,97; 3.719 comentarios distintos | No disponible | HuggingFace |
| `google-t5/t5-small` (modelo base original) | 60,5 M | 512 tokens (posiciones relativas) | No evaluado en esta tarea | Apache 2.0 | HuggingFace, ampliamente desplegado |
| `google/flan-t5-small` | 77 M | 512 tokens | No evaluado en esta tarea | Apache 2.0 | HuggingFace |
| `Salesforce/codet5-small` | ~60 M | 512 tokens | No evaluado en esta tarea | Apache 2.0 | HuggingFace |

La comparacion de rendimiento con los modelos base y alternativos no esta disponible en la informacion proporcionada: no se han ejecutado sobre el mismo conjunto de test de 5.000 instancias.

## Limitaciones y advertencias

- Colapso de modo confirmado: 4.992 de 5.000 predicciones son la misma frase ("I think this should be a constant."), con solo 8 respuestas distintas en total. El modelo no condiciona su salida al metodo de entrada.
- Exact match de 0,00 y BLEU-4 de 0,14 en el conjunto de test, frente a 0,97 del modelo multi-tarea del mismo autor con el mismo presupuesto de pasos.
- La licencia no esta declarada en la model card. Aunque el dataset de origen es CC BY 4.0, la ausencia de licencia explicita impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier uso fuera del ambito academico.
- Dominio muy restringido: solo codigo Java y comentarios en ingles. No hay evidencia de comportamiento correcto en otros lenguajes de programacion ni en castellano.
- Longitud de contexto no documentada; la familia T5 original esta limitada a 512 tokens, lo que restringe metodos Java largos.
- Riesgo de alucinacion irrelevante en su estado actual (la salida es constante), pero si se reentrena hay que asumir el riesgo habitual de comentarios factualmente incorrectos sobre el codigo.
- Sesgos inheridos del corpus Tufano et al. (ICSE 2022): estilo de revision, convenciones y practicas de los proyectos representados, sin documentacion de analisis de sesgo por parte del autor.
- Modelo sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin revision externa ni validacion independiente.
- No apto para produccion en su estado actual: no debe integrarse en herramientas de revision de codigo reales sin un reentrenamiento y una evaluacion completos.
- No soporta tool calling, agentes ni multimodalidad; cualquier caso de uso que los requiera queda descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt-st
- Modelo base (preentrenado por el mismo autor): https://huggingface.co/CTlandu/csci680-a1-t5-small-pretrained
- Modelo de la condicion B (multi-tarea, referencia comparativa): https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt
- Dataset de ajuste fino (Tufano et al., ICSE 2022), DOI: https://doi.org/10.5281/zenodo.5387856
- Repositorio de codigo del curso: https://github.com/aura-lab-wm/teaching-genai4se-2026-jtang05
