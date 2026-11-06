# bilgini/gemma-4-E2B-it-correction-teacher-litert-lm

## Resumen

Gemma 4 E2B It Correction Teacher es un ajuste fino (fine-tune) del modelo google/gemma-4-E2B-it, desarrollado por el usuario bilgini, orientado a una tarea muy concreta: corregir una unica frase en ingles escrita por un estudiante de idiomas y devolver un objeto JSON estructurado con la frase original, la version corregida, el tipo de error y una breve explicacion en el idioma nativo del estudiante. El modelo esta empaquetado en formato `.litertlm` para el runtime LiteRT-LM de Google, lo que permite ejecucion en dispositivo (CPU y GPU) sin necesidad de infraestructura de servidor.

La relevancia de este modelo reside en su especializacion: frente al modelo base, que tiende a reescribir frases ya correctas para hacerlas sonar mas naturales, este fine-tune esta entrenado para no tocar las frases correctas (solo 3 de 200 modificadas en la evaluacion, frente a 27 del modelo base) y para emitir JSON limpio sin envoltorios de codigo (0 de 300 casos problematicos, frente a 288 del base). Es, por tanto, un componente de correccion gramatical para aplicaciones de aprendizaje de idiomas, no un modelo conversacional de proposito general.

El modelo base es un Gemma 4 de la variante E2B (orientada a dispositivo), con licencia Apache 2.0 heredada. El fine-tune se distribuye como un unico archivo de 2,78 GB con pesos int4 y una ventana de contexto de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4, variante E2B para dispositivo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | int4 block-wise (block size 32, `dynamic_wi4b32_afp32`); se probo int4 per-channel y se descarto |
| Idiomas soportados | en, ar, da, de, es, fr, hi, id, it, ja, ko, nl, no, pl, pt, ru, sv, th, tr, uk, vi, zh (correccion solo en ingles; explicaciones en 21 idiomas nativos) |
| Licencia | Apache 2.0 (sujeta a la licencia de Gemma 4) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el fine-tune sin cuantizar existe en MLX pero no se distribuye en el repo |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4 en su variante E2B, pensada para inferencia en dispositivo. El fine-tune se realizo con LoRA de rango 16 aplicado a todas las capas lineales, con la perdida calculada unicamente sobre la respuesta del asistente, usando `mlx-lm` en un Mac; posteriormente los adaptadores se fusionaron en los pesos base. La exportacion del decoder se hizo con `litert-torch` y cuantizacion int4 block-wise (tamano de bloque 32); el tokenizador, los metadatos y el embedder por capa se toman sin cambios del `.litertlm` oficial, y el decoder multiplica los embeddings por capa por 16 para coincidir con ese embedder.

Los datos de entrenamiento son aproximadamente 16.000 ejemplos sinteticos de chat, de los cuales el 61% son frases correctas que el modelo debe dejar intactas. Fueron generados por un modelo profesor de mayor tamano y verificados por un segundo modelo. El conjunto de datos no se ha publicado. El prompt de sistema se entrena en el idioma nativo del estudiante (21 idiomas), seguido de un mensaje de usuario con la frase a corregir; se requiere thinking desactivado y decodificacion greedy. La innovacion principal no es arquitectonica sino de empaquetado y especializacion: conversion a LiteRT-LM con cuantizacion block-wise que preserva el fine-tune (la cuantizacion per-channel destruia el ajuste, con resultados de 5/79/42 frente a 3/88/89).

## Capacidades

- Correccion gramatical de una unica frase en ingles por invocacion, devolviendo JSON con los campos `said`, `better`, `type` y `why`.
- Clasificacion del tipo de error en una taxonomia cerrada: `tense`, `article`, `preposition`, `word-order`, `word-choice`, `plural`, `agreement`, `missing-word`, `extra-word` o `none`.
- Deteccion de frases correctas y preservacion literal de las mismas (no reescribe por estilo).
- Generacion de explicaciones breves en el idioma nativo del estudiante entre 21 idiomas (ar, da, de, es, fr, hi, id, it, ja, ko, nl, no, pl, pt, ru, sv, th, tr, uk, vi, zh).
- Salida JSON estricta sin envoltorios de codigo ni texto adicional (0 de 300 casos requirieron reparacion en la evaluacion).
- Ejecucion en dispositivo con backend CPU y GPU mediante LiteRT-LM.
- No soporta tool calling, agentes, vision, audio ni modo thinking (de hecho, el thinking debe estar desactivado).

## Casos de uso

- Correccion en tiempo real en apps de aprendizaje de ingles: el modelo recibe la frase dictada o escrita por el estudiante y devuelve la correccion con el tipo de error, integrándose en un flujo de feedback inmediato en el movil gracias al runtime LiteRT-LM en CPU/GPU.
- Generacion de ejercicios personalizados: a partir del campo `type` devuelto, la aplicacion puede agrupar los errores del estudiante por categoria (tiempos verbales, articulos, preposiciones) y generar baterias de practica dirigidas.
- Evaluacion automatica de produccion escrita en examenes de idiomas: el JSON estructurado permite registrar por alumno cuantos errores de cada tipo comete y si la frase era correcta, sin necesidad de postprocesar texto libre.
- Feedback multilingue para estudiantes no angloparlantes: la explicacion `why` se genera en el idioma nativo del alumno (por ejemplo, en espanol para hispanohablantes), lo que reduce la barrera de comprension en niveles iniciales.
- Integracion en correctores de chat o mensajeria: un plugin que revise cada mensaje del usuario antes de enviarlo, mostrando la version corregida y el motivo, con latencia baja al ejecutarse en dispositivo.
- Despliegue offline en entornos educativos sin conectividad: al ser un archivo de 2,78 GB ejecutable localmente, puede distribuirse en tablets o portatiles de aulas sin acceso a la nube, preservando la privacidad de las frases de los estudiantes.
- Filtro de calidad en pipelines de datos: uso del clasificador de errores para etiquetar corpus de aprendices y detectar frases que requieren revision humana.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test congelado de 300 elementos (200 frases correctas y 100 con un error conocido), ejecutado con decodificacion greedy en LiteRT-LM:

| Modelo | Frases correctas modificadas (menos es mejor) | Correcciones correctas | Tipo de error correcto | Salidas no parseables o reparadas |
|---|---|---|---|---|
| gemma-4-E2B-it (`.litertlm` oficial, mismo prompt) | 27 / 200 | 90 / 100 | 58 / 100 | 288 / 300 envueltas en bloques de codigo |
| **Este modelo, backend GPU** | **3 / 200** | 88 / 100 | **89 / 100** | 0 |
| Este modelo, backend CPU | 1 / 200 | 87 / 100 | 88 / 100 | 0 |
| Mismo fine-tune sin cuantizar (MLX) | 2 / 200 | 91 / 100 | 93 / 100 | 0 |

Las cifras de GPU se midieron en un Apple M1 Max (Metal). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo `.litertlm` ocupa 2,78 GB en disco; la memoria en ejecucion depende del backend y del contexto, y la KV cache es float32 (consume mas memoria que la build oficial de GPU). No se han publicado cifras exactas de RAM/VRAM.
- GPU recomendadas: no se especifican modelos de datacenter; la evaluacion se realizo en un Apple M1 Max con backend Metal. El modelo esta pensado para GPU integradas y moviles, no para A100/H100.
- Cabe en GPU de consumo: si, al ser un modelo E2B cuantizado a int4 de menos de 3 GB, es apto para GPUs de consumo y para ejecucion en CPU.
- Opciones de despliegue: exclusivamente LiteRT-LM (`litert_lm` en Python, con backends CPU y GPU). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han medido en telefonos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Correccion de frases correctas | Tipo de error | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B correction teacher) | no disponible (E2B) | 4096 | 3 / 200 modificadas | 89 / 100 | Apache 2.0 | `.litertlm` |
| google/gemma-4-E2B-it (base) | no disponible (E2B) | 4096 | 27 / 200 modificadas | 58 / 100 | Apache 2.0 | `.litertlm` |
| Mismo fine-tune sin cuantizar (MLX) | no disponible (E2B) | no disponible | 2 / 200 modificadas | 93 / 100 | Apache 2.0 | MLX (no distribuido) |

No se dispone de datos de otros correctores gramaticales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo corrige ingles y solo una frase por invocacion; no es un modelo de chat y el fine-tune estrecha su comportamiento general.
- Las explicaciones `why` son breves y pueden ser imprecisas; deben tratarse como pistas, no como explicaciones gramaticales fiables.
- La KV cache en float32 incrementa el uso de memoria respecto a la build oficial de GPU; no se ha medido el rendimiento en telefonos.
- El conjunto de test es pequeno (300 elementos) y la mitad de frases correctas proviene unicamente de estudiantes turcoparlantes, lo que puede sesgar la evaluacion de falsos positivos.
- Los datos de entrenamiento son sinteticos y pueden arrastrar errores del modelo profesor.
- Riesgo de alucinacion en la clasificacion del tipo de error o en la explicacion, aunque la tasa de JSON no parseable es cero en la evaluacion.
- Requiere thinking desactivado y decodificacion greedy (top_k=1); otros ajustes de muestreo pueden degradar la calidad del JSON.
- Licencia Apache 2.0 heredada, pero sujeta a la licencia de Gemma 4; conviene revisar sus terminos para uso comercial.
- Dependencia exclusiva del runtime LiteRT-LM; no hay pesos en safetensors ni GGUF en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bilgini/gemma-4-E2B-it-correction-teacher-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
