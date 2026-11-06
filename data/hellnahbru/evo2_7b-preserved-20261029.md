# hellnahbru/evo2_7b-preserved-20261029

## Resumen

Evo 2 es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autorregresiva sobre billones de tokens de secuencias genomicas. Este repositorio concreto, `hellnahbru/evo2_7b-preserved-20261029`, es una copia (mirror) del checkpoint oficial `arcinstitute/evo2_7b` publicada por el usuario hellnahbru, sin modificaciones declaradas en la model card. El modelo resuelve tareas de modelado de secuencias biologicas: prediccion de siguiente nucleotido, generacion de ADN, anotacion funcional y analisis de variantes.

Con 7.000 millones de parametros y 32 capas, este checkpoint esta entrenado hasta una longitud de secuencia de 1 millon de tokens, lo que lo situa en el rango de los modelos genomicos de contexto largo. La relevancia actual radica en que Evo 2 representa uno de los primeros intentos de escalar el paradigma de los LLM al dominio del ADN con ventanas de contexto de hasta 1 Mbp, habilitando tareas que requieren coherencia a escala de genoma.

Al tratarse de un mirror de un checkpoint oficial, las especificaciones tecnicas, el entrenamiento y las capacidades descritas a continuacion corresponden al modelo original del Arc Institute, no a una variante entrenada por el autor del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (StripedHyena 2, segun el paper de Evo 2) |
| Parametros totales | 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.000.000 tokens (checkpoint largo); 8.192 en la variante base |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de ADN) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la informacion proporcionada (repo de 13,8 GB) |
| Capas | 32 |
| Dataset de entrenamiento | arcinstitute/opengenome2 |

## Arquitectura y entrenamiento

Evo 2 es un modelo autorregresivo entrenado sobre billones de tokens de ADN. Segun la model card, el checkpoint de 7B consta de 32 capas y se entrena hasta una longitud de secuencia de 1 millon de tokens, mientras que la variante `evo2_7b_base` se entrena con contexto de 8.192. El modelo se distribuye junto con un checkpoint de 40B (50 capas) y una variante base de 1B (25 capas). El dataset declarado es `arcinstitute/opengenome2`.

La model card del repositorio no detalla la composicion del dataset, el numero exacto de tokens de entrenamiento, ni si se aplicaron etapas de RLHF, DPO o ajuste fino supervisado. Tampoco se especifica en la informacion proporcionada la innovacion arquitectonica concreta mas alla de la naturaleza autorregresiva y el contexto extendido; para detalles tecnicos se remite al paper en bioRxiv y al repositorio de GitHub del Arc Institute.

## Capacidades

- Modelado de lenguaje de ADN: prediccion del siguiente nucleotido sobre secuencias genomicas.
- Generacion de secuencias de ADN condicionada por contexto.
- Analisis de secuencias de hasta 1 millon de pares de bases gracias al contexto extendido del checkpoint largo.
- Trabajo a escala de genoma: coherencia en ventanas de hasta 1 Mbp.
- Evaluacion de variantes y regiones genomicas mediante puntuaciones de verosimilitud.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (dominio biologico, no lenguaje natural).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Anotacion funcional de genomas: el modelo puede puntuar regiones genomicas y ayudar a identificar elementos regulatorios o codificantes aprovechando su contexto de hasta 1 Mbp, que permite observar dependencias de largo alcance entre regiones distantes.
- Prediccion del efecto de variantes: calculando la verosimilitud de secuencias con y sin una variante concreta, se puede estimar el impacto funcional de mutaciones en contextos genomicos amplios.
- Generacion de secuencias sinteticas de ADN: util para diseno de constructos o exploracion de secuencias plausibles en investigacion basica, condicionando la generacion a un contexto biologico dado.
- Analisis de elementos regulatorios: con ventanas de hasta 1 millon de tokens se pueden estudiar interacciones enhancer-promotor y arquitecturas de cromatina a escala de dominio topologico.
- Investigacion en genomica comparativa: el modelo puede emplearse para evaluar la plausibilidad de secuencias de distintas especies dentro de un mismo contexto largo.
- Filtrado y priorizacion en pipelines genomicos: integrado como puntuador de verosimilitud en flujos de analisis para descartar o priorizar candidatos antes de validacion experimental.
- Reproducibilidad de experimentos: al ser un mirror con licencia Apache 2.0, sirve para replicar resultados del checkpoint oficial en entornos donde el repositorio original no este accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de bioRxiv para los resultados de evaluacion del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 14 GB solo para pesos, mas memoria para activaciones y cache KV, que con contexto de 1 Mbp puede ser muy elevada.
- El contexto de 1 millon de tokens implica un coste de atencion y cache KV considerable; se recomienda evaluar cuidadosamente la longitud efectiva necesaria en produccion.
- GPU recomendadas: A100 80 GB o H100 para el checkpoint de contexto largo; para el checkpoint base de 8.192 tokens, una GPU con 24-40 GB puede ser suficiente en FP16.
- GPU de consumo: el checkpoint de 7B en cuantizacion de 8 bits o inferior podria caber en GPUs de 24 GB (RTX 3090, RTX 4090), aunque no se dispone de informacion confirmada sobre soporte de cuantizacion para este modelo.
- Opciones de despliegue: el repositorio oficial de GitHub del Arc Institute es la referencia para instrucciones de ejecucion; no se especifican en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| evo2_7b (este mirror) | 7B | hasta 1.000.000 | Apache 2.0 | Hugging Face (mirror) |
| evo2_7b_base | 7B | 8.192 | Apache 2.0 | Hugging Face (oficial) |
| evo2_40b | 40B | hasta 1.000.000 | Apache 2.0 | Hugging Face (oficial) |
| evo2_1b_base | 1B | 8.192 | Apache 2.0 | Hugging Face (oficial) |

No se dispone en la informacion proporcionada de datos de rendimiento comparado con otros modelos genomicos (por ejemplo, Nucleotide Transformer o DNABERT), por lo que la comparativa se limita a la familia Evo 2.

## Limitaciones y advertencias

- Alucinacion: como modelo generativo, puede producir secuencias de ADN plausibles pero biologicamente invalidas; toda salida debe validarse experimentalmente.
- Sesgos de datos: el dataset `opengenome2` puede sobrerrepresentar ciertos organismos o linajes, lo que sesga las predicciones hacia esas distribuciones.
- Contexto: aunque el checkpoint soporta hasta 1 Mbp, el coste computacional de atencion crece con la longitud; el uso practico puede requerir truncar secuencias.
- Idioma: no aplica a lenguaje natural; no es utilizable para tareas de texto convencionales.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del mirror no ofrece garantias sobre integridad o procedencia de los pesos; para produccion se recomienda verificar contra el repositorio oficial `arcinstitute/evo2_7b`.
- Repositorio no oficial: este mirror tiene 21 descargas y 0 likes en el momento de la consulta, sin pipeline definido y sin actualizaciones desde su creacion; conviene contrastar el hash de los pesos con el original.
- Falta de documentacion: la model card no detalla cuantizaciones soportadas, formato de pesos ni requisitos de software, lo que dificulta su integracion directa.

## Enlaces

- Repositorio Hugging Face (mirror): https://huggingface.co/hellnahbru/evo2_7b-preserved-20261029
- Checkpoint oficial Evo 2 7B: https://huggingface.co/arcinstitute/evo2_7b
- Checkpoint oficial Evo 2 40B: https://huggingface.co/arcinstitute/evo2_40b
- Checkpoint oficial Evo 2 7B base: https://huggingface.co/arcinstitute/evo2_7b_base
- Checkpoint oficial Evo 2 40B base: https://huggingface.co/arcinstitute/evo2_40b_base
- Checkpoint oficial Evo 2 1B base: https://huggingface.co/arcinstitute/evo2_1b_base
- Repositorio GitHub: https://github.com/ArcInstitute/evo2
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
- Dataset: https://huggingface.co/datasets/arcinstitute/opengenome2
