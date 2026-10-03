# parth12-ui/anlp-a2-moe-variant4

## Resumen

anlp-a2-moe-variant4 es un modelo de traduccion automatica decoder-only desarrollado por el usuario parth12-ui en el contexto de la asignatura ANLP (Advanced Natural Language Processing). Se trata de un transformer entrenado desde cero, no de un ajuste fino sobre un modelo preexistente, disenado especificamente para traducir vietnamita e ingles y japones a ingles. Su rasgo distintivo es que sustituye la capa feed-forward densa por un bloque de mezcla de expertos (MoE) con 1 experto compartido y 3 expertos enrutados, con enrutamiento top-1 por token.

El modelo es deliberadamente pequeno: 33.378.816 parametros totales, de los cuales 24.990.208 se activan por token (aproximadamente el 74,9 %). Consta de 8 capas, una dimension de modelo de 512 y 8 cabezas de atencion, con una ventana de contexto muy limitada de 256 tokens. Se entreno sobre 30.004.675 tokens del dataset belumind/en-vi-ja-curated-500k-triplets, con un formato de entrada fijo que separa el idioma origen y la traduccion mediante tokens especiales.

Su relevancia es academica y de investigacion: forma parte de una serie de variantes (v3, v4 y otras) que comparten arquitectura base y solo difieren en la capa feed-forward, lo que permite estudiar empiricamente el efecto del MoE frente a alternativas densas. No esta pensado para produccion: la licencia no esta declarada, no tiene descargas ni likes, y su contexto de 256 tokens lo limita a frases o parrafos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa FFN de mezcla de expertos (MoE) |
| Parametros totales | 33.378.816 |
| Parametros activos | 24.990.208 por token (1 experto compartido + top-1 de 3 enrutados) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors); tokenizer.json con BPE byte-level |

Otros datos tecnicos declarados: 8 capas, d_model 512, 8 cabezas de atencion, d_ff densa de 2048, 30.004.675 tokens de entrenamiento, tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, d_model de 512 y 8 cabezas de atencion (dimension por cabeza de 64). La innovacion respecto a la variante densa esta exclusivamente en el bloque feed-forward: en lugar de una unica capa densa con d_ff 2048, se emplea un MoE con 1 experto compartido (siempre activo) y 3 expertos enrutados de los que se selecciona uno por token mediante enrutamiento top-1. El numero total de parametros se igualo al de la variante densa para que la comparacion fuese controlada, lo que da lugar a un ratio de parametros activos del 74,9 %.

El entrenamiento se realizo desde cero sobre el dataset belumind/en-vi-ja-curated-500k-triplets, con un total de 30.004.675 tokens procesados. El formato de secuencia es fijo: `<bos> <vi|ja> source <sep> english <eos>`, tokenizado con un BPE byte-level definido en `tokenizer.json`. La model card no menciona fases de RLHF, DPO ni ajuste por preferencias, ni tampoco tecnicas de decodificacion especulativa o atencion lineal; el unico mecanismo de eficiencia descrito es el enrutamiento MoE.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, en modo unidireccional hacia el ingles.
- Generacion de texto condicionada por un prefijo de idioma explicito (`<vi>` o `<ja>`) y un separador `<sep>` entre origen y traduccion.
- Procesamiento de secuencias de hasta 256 tokens, suficiente para frases y parrafos cortos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada a los tres idiomas del entrenamiento (vi, ja, en); no se reporta cobertura de otras lenguas.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de documentacion tecnica breve: el modelo puede convertir notas o parrafos de especificaciones en vietnamita o japones a ingles, siempre que el fragmento quepa en la ventana de 256 tokens.
- Preprocesado de corpus para pipelines de NLP: traduccion por lotes de pares vi-ja a ingles como paso previo a tareas de clasificacion o indexacion, apoyandose en el BLEU de 36,64 reportado para vi→en.
- Investigacion sobre eficiencia de MoE: al ser una variante con parametros totales igualados a la densa, sirve como sujeto de comparacion controlada para medir el efecto del enrutamiento top-1 en calidad y coste de inferencia.
- Docencia y practicas de NLP: modelo pequeno y ejecutable en CPU para ilustrar el funcionamiento interno de un MoE, el enrutamiento por token y la carga de pesos safetensors.
- Traduccion asistida de contenido de soporte: conversion de tickets o mensajes de usuario en vietnamita o japones a ingles antes de su triaje, con la advertencia de que la ventana de 256 tokens obliga a fragmentar.
- Prototipado de interfaces de traduccion de bajo coste: al ocupar decimas de GB, puede desplegarse en un contenedor ligero o en local para demos interactivas sin GPU dedicada.
- Evaluacion de tecnicas de tokenizacion multilingue: el BPE byte-level del repositorio permite reproducir experimentos de segmentacion sobre vi, ja y en.

## Benchmarks y rendimiento

Resultados de test declarados por el autor en la model card:

| Metrica | Global | vi→en | ja→en |
|---|---|---|---|
| Perplejidad (tokens objetivo) | 6,06 | 4,99 | 7,36 |
| BLEU (greedy, 1000 filas) | 31,02 | 36,64 | 25,25 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Tampoco se proporcionan comparaciones numericas contra la variante densa ni contra otras variantes de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 33,38 M de parametros, no publicada por el autor): aproximadamente 134 MB en FP32, 67 MB en FP16/BF16, 33 MB en int8 y 17 MB en int4.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o integrada moderna basta.
- Cabe holgadamente en GPU de consumo y tambien en CPU: el modelo completo en FP32 ocupa del orden de 130 MB, sin contar el coste de activaciones y del KV cache para 256 tokens.
- Opciones de despliegue: el repositorio solo documenta carga directa con `safetensors.torch.load_model` y las clases `TransformerConfig` / `Transformer` incluidas en `model_src/`. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no son utilizables sin conversion previa; vLLM y TGI tampoco estan documentados para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La busqueda web identifica varias variantes del mismo ejercicio academico. No se dispone de sus especificaciones completas, por lo que la comparacion se limita a lo verificable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| parth12-ui/anlp-a2-moe-variant4 | 33.378.816 (24.990.208 activos) | 256 | no disponible | Publico en HuggingFace, 0 descargas |
| abhirajratna/anlp-a2-moe-v3 | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Arihant25/anlp-a2-moe | no disponible | no disponible | no disponible | Publico en HuggingFace |
| raunakseksaria/anlp-a2-moe | no disponible | no disponible | no disponible | Publico en HuggingFace |

Todas ellas pertenecen a la misma familia de ejercicios (ANLP, variantes que solo difieren en la capa feed-forward, con traduccion vi→en y ja→en). El codigo de referencia del curso esta en el repositorio cmu-l3/anlp-spring2026-code (CMU 11-711 Advanced NLP, primavera de 2026). No se dispone de datos de rendimiento de las variantes comparadas, por lo que no es posible establecer una jerarquia de calidad entre ellas.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explicita para uso comercial; conviene tratar el modelo como no apto para produccion hasta que el autor aclare la licencia.
- Ventana de contexto de 256 tokens: impide traducir documentos completos y obliga a fragmentar, lo que degrada la coherencia entre fragmentos.
- Traduccion unidireccional: solo traduce vi→en y ja→en; no soporta en→vi, en→ja ni ja→vi.
- Entrenamiento limitado: 30 M de tokens sobre un unico dataset curado, con alta probabilidad de sobreajuste al dominio y al registro de belumind/en-vi-ja-curated-500k-triplets.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado desde cero, puede generar traducciones fluidas pero infieles, especialmente en japones (perplejidad 7,36 frente a 4,99 en vietnamita).
- Sesgos: no se ha publicado ningun analisis de sesgos, y el dataset de entrenamiento no se documenta en cuanto a composicion demografica o tematica.
- Formato de entrada rigido: requiere la plantilla exacta `<bos> <vi|ja> source <sep> english <eos>`; desviarse de ella probablemente produzca salidas degeneradas.
- Sin cuantizaciones oficiales ni soporte en runners estandar: la integracion exige cargar el codigo de `model_src/` del propio repositorio.
- Resultados de BLEU medidos sobre 1000 filas en decodificacion greedy: no equivalen a una evaluacion completa del conjunto de test.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento conocido ni comunidad que reporte errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-moe-variant4
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card)
- Variante v3 de la misma serie: https://huggingface.co/abhirajratna/anlp-a2-moe-v3
- Otra variante de la serie: https://huggingface.co/Arihant25/anlp-a2-moe
- Otra variante de la serie: https://free2aitools.com/model/raunakseksaria/anlp-a2-moe
- Codigo del curso CMU 11-711 Advanced NLP (primavera de 2026): https://github.com/cmu-l3/anlp-spring2026-code
- Documentacion del repositorio del curso: https://deepwiki.com/cmu-l3/anlp-spring2026-code
