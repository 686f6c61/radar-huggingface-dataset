# ikimyaii/HGRN-340M-unstructured-ELSA-50pct

## Resumen

HGRN-340M-unstructured-ELSA-50pct es un modelo de lenguaje derivado de m-a-p/340M-20B-HGRN-pure-baseline, podado al 50% de esparsidad no estructurada mediante el codigo oficial de ELSA (paper arXiv:2510.01650). Lo publica el usuario ikimyaii como baseline de referencia para sus modelos EHWS. No es un modelo entrenado desde cero, sino un checkpoint podado y, presumiblemente, reajustado con el procedimiento ADMM descrito en la model card.

El modelo mantiene la arquitectura HGRN (Hierarchically Gated Recurrent Network) del modelo base, con 341.148.672 parametros totales y un repositorio de 1,4 GB en formato safetensors. Su interes es fundamentalmente metodologico: sirve para evaluar el coste en calidad de aplicar poda no estructurada al 50% sobre un modelo recurrente-lineal pequeno, con un protocolo reproducible (4096 pasos ADMM, 32.768 secuencias C4 de 2.048 tokens, 2,22 horas en una A100 40GB).

La relevancia practica es limitada para produccion: se trata de un artefacto de investigacion con 0 descargas, sin licencia declarada y sin soporte multilingue documentado. Su valor esta en la reproducibilidad del pipeline de poda y en los datos de perplexidad y evaluacion zero-shot que acompanan al checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network) |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 340M de parametros entrenado sobre 20B tokens (segun el identificador del checkpoint original, 340M-20B-HGRN-pure-baseline). HGRN es una familia de modelos recurrentes lineales con compuertas jerarquicas, disenada como alternativa eficiente a los transformers con atencion cuadratica. Sobre ese checkpoint se aplica poda no estructurada al 50% mediante el codigo oficial de ELSA: un umbral de magnitud por capa, de modo que las filas resultantes tienen distinto numero de ceros. Se podan todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos.

El procedimiento de poda usa los hiperparametros del run de ELSA sobre HGRN-1.3B al 80%: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 x 8 acumulacion, learning rate 2e-4, lambda 0.01, precision bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizer del propio modelo y semilla 0. La esparsidad medida sobre los pesos finales es exactamente 0,5000 en las 168 capas podadas. Las filas no estan balanceadas: la fila mas densa tiene de media 1,46 veces los no-ceros de la fila media, con un peor caso de 1,89 veces.

## Capacidades

- Generacion de texto autoregresiva con el modelo base HGRN de 340M.
- Razonamiento basico y respuesta a preguntas de sentido comun, con caida moderada respecto al modelo denso (promedio zero-shot de 0,4269 frente a 0,4400).
- Procesamiento de secuencias de hasta 2.048 tokens de forma nativa segun el regimen de entrenamiento documentado; no se especifica extension de contexto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el modelo base se entrena presumiblemente en ingles (C4) y no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre poda de modelos: el checkpoint sirve como referencia reproducible para comparar tecnicas de esparsidad no estructurada frente al baseline denso m-a-p/340M-20B-HGRN-pure-baseline.
- Estudio del compromiso calidad/esparsidad: con perplexidad WikiText-2 de 26,74 frente a 21,96 del denso, permite cuantificar la degradacion a 50% de sparsity en arquitecturas recurrentes lineales.
- Baseline para modelos EHWS del mismo autor: la model card lo declara explicitamente como baseline de comparacion para los modelos EHWS de la cuenta ikimyaii.
- Experimentos de inferencia eficiente en hardware modesto: con 341M de parametros y pesos dispersos, es viable en GPUs de consumo para prototipos de decodificacion con kernels que exploten la esparsidad.
- Validacion de pipelines ADMM: el procedimiento documentado (4096 pasos, 2,22 horas en A100 40GB) permite reproducir el flujo completo de poda sobre otros checkpoints HGRN.
- Analisis de desbalanceo de filas: la distribucion no uniforme de no-ceros por fila (hasta 1,89x la media) es un caso de estudio para evaluar el impacto del desbalanceo en kernels dispersos.

## Benchmarks y rendimiento

Perplexidad con el protocolo de evaluacion de ELSA (WikiText-2 / C4, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (50% sparsity) | 26,74 | 25,01 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2261 |
| arc_easy | 0,6153 | 0,5728 |
| boolq | 0,6028 | 0,6138 |
| hellaswag | 0,3423 | 0,3349 |
| openbookqa | 0,2380 | 0,2160 |
| rte | 0,5126 | 0,5199 |
| winogrande | 0,5059 | 0,5051 |
| Media | 0,4400 | 0,4269 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,7 GB en bf16/fp16 para los 341M de parametros, mas overhead de activaciones y cache; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: A100 40GB fue la usada para el proceso de poda (2,22 horas); para inferencia basta una RTX 3060, RTX 4060 o superior.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 2-4 GB de VRAM.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; los kernels dispersos requeririan integracion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 50% sparsity) | 341M | no disponible (2.048 tokens en entrenamiento) | 26,74 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline | 340M | no disponible | 21,96 | no disponible | Hugging Face |
| Alternativas de 300-400M tipo GPT-2/Pythia | 300-400M | 1.024-2.048 tokens | no disponible | variable | Hugging Face |

La comparacion directa mas informativa es contra su modelo base denso, que gana en todas las metricas de perplexidad y en la media zero-shot (0,4400 frente a 0,4269). No se dispone de datos de benchmarks de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible por la poda: perplexidad WikiText-2 un 21,8% peor que el denso (26,74 frente a 21,96) y caida de 1,31 puntos en la media zero-shot.
- Desbalanceo de filas: la esparsidad no estructurada deja filas con hasta 1,89 veces la media de no-ceros, lo que complica la aceleracion real en hardware.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no documentados: no hay garantia de comportamiento fuera del ingles.
- Riesgo de alucinacion: inherente a un modelo de 340M sin alineamiento documentado (no se menciona RLHF/DPO).
- Contexto limitado: el regimen de entrenamiento es de 2.048 tokens; no se documenta extension.
- Artefacto de investigacion: 0 descargas, 0 likes y sin pipeline declarado; no apto para produccion sin validacion propia.
- Requiere `flash-linear-attention` para cargarse correctamente; no funciona con el stack estandar de transformers sin esa dependencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-ELSA-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
