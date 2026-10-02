# sanyam2005/anlp-a2-part1-moe-top2-active

## Resumen

`sanyam2005/anlp-a2-part1-moe-top2-active` es un modelo de traduccion automatica basado en un Transformer decoder-only entrenado desde cero, disenado especificamente para traducir vietnamita (vi) e ingles y japones (ja) a ingles (en). Lo desarrolla el usuario `sanyam2005` en el contexto de la asignatura Advanced NLP (Assignment 2, Monsoon 2026, IIIT Hyderabad), por lo que se trata de un artefacto academico de investigacion mas que de un modelo de produccion. El modelo tiene 47.860.224 parametros totales, de los cuales 35.277.312 estan activos por token gracias a un FFN de mezcla de expertos (MoE) con 4 expertos y enrutamiento top-2.

La arquitectura es un Transformer de tipo decoder-only con capa de mezcla de expertos en el bloque FFN, una variante que el autor etiqueta como `moe_top2_active` (V5). Se entreno sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets` consumiendo 50.000.408 tokens, y alcanza una perdida de validacion final de 1,8418. El uso previsto es la traduccion mediante un formato de prompt fijo y decodificacion greedy.

Su relevancia ahora es fundamentalmente metodologica: sirve como referencia reproducible para estudiar el impacto del enrutamiento top-2 en MoE sobre presupuestos de computo reducidos, y permite comparar distintas configuraciones dentro de la misma asignatura. No cuenta con resultados de benchmarks publicos ni con informacion de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE), 4 expertos, enrutamiento top-2 |
| Parametros totales | 47.860.224 |
| Parametros activos | 35.277.312 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `tokenizer.json` |

Datos adicionales aportados por el autor: parametros del FFN totales 25.178.112 y activos 12.595.200; tokens de entrenamiento 50.000.408; perdida de validacion final 1,8418.

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only entrenado desde cero para una tarea de traduccion condicionada por idioma. La innovacion principal reside en el bloque FFN: en lugar de una unica red feed-forward densa, emplea una capa de mezcla de expertos con 4 expertos y un enrutador que activa los dos mejores (top-2) por token. Esto da lugar a una diferencia apreciable entre parametros totales (47.860.224) y parametros activos por token (35.277.312), lo que reduce el coste de computo por token en comparacion con un modelo denso de igual tamano total.

El entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un total de 50.000.408 tokens procesados y dos direcciones de traduccion (vi→en y ja→en). El prompt sigue el formato `<bos> <vi|ja> source <en>`, con decodificacion greedy hasta generar `<eos>`. El tokenizador es un BPE a nivel de byte implementado con la libreria `tokenizers`. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias; el autor solo reporta la perdida de validacion final (1,8418). La carga del modelo esta pensada para realizarse mediante la funcion `src.part1.evaluate.load_model_folder` del repositorio de la asignatura.

## Capacidades

- Traduccion de vietnamita a ingles (vi→en) y de japones a ingles (ja→en) con un unico modelo.
- Generacion de texto autoregresiva condicionada por idioma de origen mediante una etiqueta de prompt explicita (`<vi>` o `<ja>`).
- Ejecucion en modo decoder-only puro, sin encoder separado.
- Soporte de decodificacion greedy hasta `<eos>`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.
- Cobertura multilingue limitada estrictamente a vi, ja y en.

## Casos de uso

- Traduccion de documentacion tecnica vi→en: el modelo puede procesar frases y parrafos en vietnamita y devolver su equivalente en ingles, aprovechando su entrenamiento especifico sobre el dataset de tripletes para terminologia general.
- Traduccion de contenido japones a ingles para localizacion: util para convertir articulos, fichas de producto o textos de interfaz del japones al ingles antes de una segunda traduccion a otros idiomas.
- Generacion y aumento de datos de entrenamiento: al ser un modelo pequeno y rapido, puede usarse para producir traducciones sinteticas vi→en y ja→en que alimenten pipelines de data augmentation en proyectos mayores.
- Apoyo a traductores humanos en pre-traduccion: dado su bajo coste de inferencia, encaja como primer borrador que un revisor humano corrige despues, reduciendo tiempo en tareas repetitivas.
- Subtitulado y transcripcion asistida: traduccion por lotes de segmentos cortos vi→en o ja→en para generar subtitulos preliminares de video.
- Investigacion academica sobre MoE: sirve como banco de pruebas reproducible para medir el efecto del enrutamiento top-2 frente a configuraciones densas o top-1 en tareas de traduccion.
- Procesamiento por lotes en hardware modesto: su tamano (47,8 M de parametros) permite ejecutar traduccion masiva en CPU o en GPUs de gama baja dentro de pipelines de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, BLEU, chrF, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo reportado por el autor es la perdida de validacion final:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,8418 |
| Tokens de entrenamiento | 50.000.408 |

No se proporcionan puntuaciones de calidad de traduccion, por lo que no es posible comparar su rendimiento real frente a otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 47.860.224 parametros, el modelo ocupa aproximadamente 191 MB en fp32 y unos 96 MB en fp16, sin contar el tokenizador ni los estados de decodificacion.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente; el modelo cabe sin problema en tarjetas de gama baja como GTX 1050, GTX 1650 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en CPU para inferencia en tiempo casi interactivo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica que debe cargarse mediante la funcion `src.part1.evaluate.load_model_folder` del repositorio de la asignatura, usando `safetensors` y la libreria `transformers`/`tokenizers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Se han identificado otros modelos del mismo contexto de asignatura, todos ellos con arquitecturas y tareas equivalentes (vi/ja→en, decoder-only). Los datos de cada uno provienen de sus propias model cards.

| Modelo | Parametros totales | Configuracion | Tokens de entrenamiento | Licencia |
|---|---|---|---|---|
| sanyam2005/anlp-a2-part1-moe-top2-active | 47.860.224 | MoE 4 expertos, top-2 | 50.000.408 | no disponible |
| irishbumfuzzle/anlp-a2-p1-moe-top2 | 35.670.528 | decoder-only D=512, 6 capas, 8 cabezas, vocab 32768, embedding atado | 145.020.416 | no disponible |
| dnebh/anlp-a2-part1-config3_moe_top2 | no disponible | MoE top-2 | no disponible | no disponible |

Comparativa limitada: no se dispone de resultados de benchmarks comunes que permitan comparar la calidad de traduccion entre estos modelos. La principal diferencia observable es el numero de parametros y el presupuesto de tokens de entrenamiento, donde `irishbumfuzzle/anlp-a2-p1-moe-top2` declara un presupuesto notablemente mayor (145,02 M frente a 50,0 M).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset curado de tripletes vi/ja/en es probable que reproduzca sesgos presentes en ese corpus.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede producir traducciones fluidas pero incorrectas, especialmente con terminos especializados, nombres propios o frases largas.
- Direccionalidad limitada: solo soporta vi→en y ja→en; no traduce a vietnamita ni a japones, ni cubre otros pares de idiomas.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento con entradas largas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar ni asumir su uso comercial.
- Caveat de produccion: al ser un artefacto de asignatura, carece de evaluacion de calidad de traduccion, de pruebas de robustez y de mantenimiento; no se recomienda su uso en produccion sin una validacion exhaustiva propia.
- Dependencia de la herramienta de carga: el autor indica que el modelo debe cargarse con una funcion especifica del repositorio de la asignatura, lo que puede complicar su integracion en stacks estandar.
- Presupuesto de entrenamiento reducido: 50.000.408 tokens es un volumen bajo para traduccion de calidad, lo que probablemente limita la cobertura lexica y la fidelidad en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part1-moe-top2-active
- Modelo comparable (mismo contexto de asignatura): https://huggingface.co/irishbumfuzzle/anlp-a2-p1-moe-top2
- Modelo comparable (misma configuracion MoE top-2): https://huggingface.co/dnebh/anlp-a2-part1-config3_moe_top2
- Dataset de entrenamiento citado: `belumind/en-vi-ja-curated-500k-triplets`
- Guia de estudio de la asignatura Advanced NLP (IIIT Hyderabad, Monsoon 2026): https://github.com/Arihant25/anlp-study-guide
- Registro de modelo en free2aitools (referencia de un modelo relacionado): https://free2aitools.com/model/raunakseksaria/anlp-a2-moe
