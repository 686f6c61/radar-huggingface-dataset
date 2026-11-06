# DuoNeural/Lattice-7-Hermes-CDM-Poincare-Instruct

## Resumen

Lattice-7-Hermes-CDM-Poincare-Instruct es un modelo de generacion de texto desarrollado por DuoNeural Research Lab, presentado como un "Modelo de Dinamica Cristalografica" (CDM) no euclidiano de 8 capas. Se trata de un modelo destilado a partir de Qwen/Qwen3.5-4B, entrenado durante 100.000 pasos en una sola GPU de consumo (NVIDIA GeForce RTX 5070 Ti de 16 GB). Su rasgo distintivo es el uso de embeddings de Poincare (geometria hiperbolica) combinados con una arquitectura de mezcla de expertos (MoE) con 4 expertos y 8 centroides de enrutamiento por capa.

El problema que aborda es la destilacion extrema: conservar la mayor parte de la capacidad de razonamiento del profesor (4.000 millones de parametros) en una columna activa de unos 248 millones de parametros no embebidos (629 millones contando embeddings sin atar). Segun la model card, el modelo logra retenciones del 84,8 % en WinoGrande y del 79,9 % en BoolQ frente al profesor, aunque cae al 30,1 % en MMLU, lo que refleja los limites de capacidad de un modelo de este tamano.

Es relevante como experimento de investigacion en arquitecturas no euclidianas y destilacion eficiente en hardware de consumo, no como sustituto de modelos frontera. El modelo hereda el vocabulario multilingue de Qwen3.5-4B (248.320 tokens) y se publica bajo licencia Apache 2.0 en formatos safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM (Crystallographic Dynamics Model) no euclidiano con embeddings de Poincare, MoE y mecanismo "Octa-Cap" |
| Parametros totales | 629.378.832 (~629M, sin atar embeddings); 438.669.072 (~439M) con embeddings atados |
| Parametros activos | 247.959.312 (~248M, columna activa sin embeddings; 4 expertos MoE, K=8 centroides) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el profesor se evaluo en NF4; no se documentan cuantizaciones del alumno) |
| Idiomas soportados | no disponible (hereda el vocabulario multilingue de Qwen3.5-4B: 248.320 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura consta de 8 capas con 12 cabezas de atencion, dimension oculta 768 y 4 expertos MoE con d_ff=3072, enrutados mediante 8 centroides por capa (K=8). La innovacion central es el uso de embeddings de Poincare (geometria hiperbolica no euclidiana) y el mecanismo "Octa-Cap" basado en el "Dynamical Horizon Principle" (DHP): durante el entrenamiento, los centroides de enrutamiento se "solidifican" progresivamente hasta congelarse en celosias de Voronoi hiperbolicas permanentes con tau* = 1e10. En este modelo, las 8 capas (L00 a L07) alcanzaron la fase solida completa, con curvatura aprendida uniforme en el rango c = 1,42–1,44 ("curvature flat-phase").

El entrenamiento fue una destilacion desde Qwen/Qwen3.5-4B durante 100.000 pasos en una sola RTX 5070 Ti de 16 GB. Los datasets declarados son HuggingFaceFW/fineweb-edu y NousResearch/Hermes-Function-Calling-Dataset, este ultimo orientado a capacidades de function calling estilo Hermes. La metrica de validacion final fue de 0,7403 BPB (mejor valor, en el paso 63.000), equivalente a una perplejidad de aproximadamente 9,70, con una divergencia KL final respecto al profesor de 0,1194 nats. No se detalla si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instruccional (pipeline text-generation, variante Instruct).
- Razonamiento de sentido comun y resolucion de coreferencias (WinoGrande: 53,0 % de precision).
- Comprension lectora y verificacion factual (BoolQ: 63,5 %).
- Intuicion fisica cotidiana (PIQA: 55,5 %).
- Function calling / tool calling, gracias al entrenamiento con NousResearch/Hermes-Function-Calling-Dataset.
- Vocabulario multilingue heredado de Qwen3.5-4B (248.320 tokens), aunque el soporte efectivo por idioma no esta documentado.
- No se documentan capacidades de vision, audio ni modos de thinking.

## Casos de uso

- Prototipado de agentes ligeros con function calling: el entrenamiento con el dataset Hermes de function calling permite integrarlo en pipelines de herramientas donde el coste por token es critico y el razonamiento requerido es moderado.
- Clasificacion y verificacion factual de bajo coste: su 63,5 % en BoolQ lo hace util como filtro previo (primer paso de un sistema en cascada) antes de escalar consultas a modelos mayores.
- Resolucion de coreferencias y tareas linguisticas locales: la alta retencion en WinoGrande (84,8 % del profesor) sugiere buen rendimiento en tareas de desambiguacion pronominal en textos.
- Investigacion en arquitecturas no euclidianas: al publicarse con documentacion detallada de curvatura, enrutamiento y solidificacion de capas, sirve como base reproducible para estudiar embeddings de Poincare y MoE con centroides congelados.
- Inferencia en hardware de consumo: con una columna activa de ~248M de parametros y disponibilidad en GGUF, es candidato para despliegue local en portatiles y GPUs de gama media.
- Destilacion como caso de estudio: demuestra que se puede destilar un profesor de 4B en una sola GPU de consumo (RTX 5070 Ti, 16 GB), util como referencia para equipos sin acceso a clusters.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el alumno (columna activa de 248M) con su profesor Qwen3.5-4B (evaluado en NF4):

| Benchmark | Capacidad evaluada | Alumno (248M) | Profesor (4B) | Retencion |
|---|---|---:|---:|---:|
| WinoGrande | Coreferencias y resolucion de pronombres | 53,0 % | 62,5 % | 84,8 % |
| BoolQ | Verificacion factual y comprension lectora | 63,5 % | 79,5 % | 79,9 % |
| PIQA | Intuicion fisica cotidiana | 55,5 % | 82,5 % | 67,3 % |
| HellaSwag | Continuacion contextual | 33,5 % | 57,0 % | 58,8 % |
| ARC-Challenge | Razonamiento cientifico multi-paso | 21,0 % | 52,0 % | 40,4 % |
| MMLU | Conocimiento enciclopedico general | 20,0 % | 66,5 % | 30,1 % |

Metricas de entrenamiento: mejor BPB de validacion 0,7403 (paso 63.000), perplejidad de validacion ~9,70, KL final respecto al profesor 0,1194 nats.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~629M de parametros en FP16 el peso ronda 1,2-1,3 GB (el repo completo ocupa 1,7 GB), por lo que es viable en GPUs con 4-6 GB de VRAM o incluso en CPU con GGUF cuantizado.
- GPUs recomendadas: cualquier GPU de consumo moderna; el propio entrenamiento se realizo en una NVIDIA GeForce RTX 5070 Ti de 16 GB, por lo que la inferencia es trivialmente accesible en hardware muy inferior.
- Cabe comodamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4070 y superiores, e incluso en iGPU o CPU mediante GGUF.
- Opciones de despliegue: transformers (libreria nativa del repo), llama.cpp u Ollama gracias al formato GGUF; no se menciona soporte especifico para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lattice-7-Hermes-CDM-Poincare-Instruct | ~248M (629M totales) | no disponible | Apache 2.0 | CDM no euclidiano, MoE, destilado de Qwen3.5-4B |
| Qwen3.5-4B (profesor) | 4.000M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Profesor de destilacion; muy superior en MMLU (66,5 % vs 20,0 %) |
| Qwen3-1.7B / Qwen3-0.6B | 1.700M / 600M | hasta 32K (según fichas publicas de la familia) | Apache 2.0 | Alternativas densas de la misma familia con mejor rendimiento general documentado |
| SmolLM2-360M-Instruct | ~360M | 8.192 | Apache 2.0 | Modelo instruct de tamano comparable orientado a dispositivo |

Nota: la comparativa con Qwen3-1.7B/0.6B y SmolLM2 se ofrece como referencia de categoria; no existen benchmarks publicados que compare directamente a Lattice-7 con estos modelos.

## Limitaciones y advertencias

- Rendimiento debil en conocimiento enciclopedico: MMLU del 20,0 % (practicamente nivel aleatorio en opcion multiple de 4 alternativas) y ARC-Challenge del 21,0 %; no es apto para tareas de conocimiento factual general.
- La model card proviene integramente del autor y varios conceptos (CDM, Octa-Cap, DHP) no cuentan con publicacion cientifica revisada por pares verificable en la informacion disponible.
- Longitud de contexto no documentada: no se puede garantizar comportamiento en entradas largas.
- Soporte multilingue no verificado: hereda el vocabulario de Qwen3.5-4B, pero el entrenamiento se centro en datasets en ingles (fineweb-edu, Hermes), por lo que el rendimiento en castellano es desconocido y probablemente limitado.
- Riesgo de alucinacion elevado, tipico de modelos pequenos con bajo conocimiento factual; no usar como fuente de verdad sin verificacion.
- Sesgos: heredados de fineweb-edu y del profesor Qwen3.5-4B; no se publica analisis de sesgos.
- Licencia Apache 2.0 sin restricciones de uso comercial relevantes, aunque se deben respetar los terminos de los modelos y datasets subyacentes.
- El repo es muy reciente (creado en octubre de 2026), con solo 965 descargas y 1 like: falta validacion comunitaria para uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/Lattice-7-Hermes-CDM-Poincare-Instruct
- Organizacion DuoNeural en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio de codigo: https://github.com/DuoNeural/Lattice-CDM
- Sitio web del autor: https://duoneural.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Hermes Function Calling: https://huggingface.co/datasets/NousResearch/Hermes-Function-Calling-Dataset
