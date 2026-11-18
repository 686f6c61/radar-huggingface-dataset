# arshandalili/sasa-gpt2-layer7

## Resumen

SASA (Subspace-Aware Sparse Autoencoders) es una familia de autoencoders dispersos preentrenados para GPT-2 small, publicada por Seyed Arshan Dalili y Mehrdad Mahdavi (NeurIPS 2026). El modelo resuelve un problema clasico de la interpretabilidad mecanistica: los autoencoders dispersos convencionales representan cada caracteristica con una unica direccion del espacio de activaciones, lo que impide capturar estructuras que requieren mas de una dimension, como los dias de la semana o relaciones composicionales. SASA representa cada caracteristica mediante un pequeno grupo de direcciones que se activan conjuntamente, permitiendo capturar estructura multidimensional.

El repositorio incluye los checkpoints SASA entrenados sobre la corriente residual de GPT-2 small antes del bloque 7 (`blocks.7.hook_resid_pre`, 768 dimensiones), junto con las lineas base TopK, BatchTopK y Matryoshka empleadas en el articulo. Es relevante ahora porque ofrece una alternativa practica y reproducible a los SAE clasicos dentro del ecosistema SAELens, con codigo abierto y pesos publicados bajo licencia MIT.

El modelo no es un modelo generativo: es una herramienta de extraccion de caracteristicas (pipeline `feature-extraction`) que se aplica sobre activaciones de GPT-2 para descomponerlas en caracteristicas interpretables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso con representacion por subespacios (grupos de direcciones); modelo base GPT-2 small |
| Parametros totales | no disponible (depende del checkpoint; el repo ocupa 7,9 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (opera sobre activaciones; entrenado con secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda el comportamiento del GPT-2 subyacente) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`sae_weights.safetensors`) mas configuracion `cfg.json` por checkpoint |

## Arquitectura y entrenamiento

SASA es un autoencoder disperso que, en lugar de asignar una unica direccion del diccionario a cada caracteristica, asigna un grupo de `r` direcciones que se activan conjuntamente. En el checkpoint de referencia `sasa_r6_l0120_w24576`, cada grupo consta de 6 direcciones (`r6`), se activan 120 direcciones decodificadoras por token (20 grupos de 6, `l0120`) y el diccionario total contiene 24.576 direcciones (`w24576`). La esparsidad se controla a nivel de grupo: se seleccionan los 20 grupos con mayor norma de activacion por token, medible con `groups.norm(dim=-1)`.

El entrenamiento se realizo sobre activaciones de la corriente residual de GPT-2 small antes del bloque 7 (`blocks.7.hook_resid_pre`, dimension de entrada 768), usando OpenWebText con secuencias de 128 tokens y 300 millones de tokens por modelo (150 millones para el checkpoint `sasa_topk_r6_l060_w12288`). La publicacion cubre diccionarios de 12.288, 24.576 y 49.152 direcciones totales, con ajustes de esparsidad entre 30 y 240 direcciones activas. El repositorio incluye tambien las lineas base TopK, BatchTopK y Matryoshka con la misma convencion de nombres; en BatchTopK y Matryoshka la esparsidad es un objetivo de entrenamiento y el numero de direcciones activas puede variar en inferencia. Se integra con SAELens 6.25.

## Capacidades

- Extraccion de caracteristicas interpretables a partir de activaciones de GPT-2 small en la capa 7.
- Descomposicion de activaciones en grupos de direcciones que capturan estructura multidimensional (por ejemplo, dias de la semana).
- Codificacion y decodificacion de activaciones: `sae.encode(h)` produce codigos y `sae.decode(codes)` reconstruye la activacion.
- Medicion de fuerza de activacion por grupo mediante la norma del grupo (`groups.norm(dim=-1)`).
- Comparacion controlada con lineas base TopK, BatchTopK y Matryoshka bajo la misma convencion de tamano y esparsidad.
- Integracion con el ecosistema SAELens (registro del modelo al importar `sasa`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es una herramienta de analisis, no un modelo de proposito general.

## Casos de uso

- Interpretabilidad mecanistica de GPT-2: analizar que caracteristicas aprende la corriente residual antes del bloque 7, descomponiendo activaciones en grupos de direcciones interpretables.
- Investigacion sobre representaciones multidimensionales: estudiar fenomenos como los dias de la semana o relaciones composicionales que un SAE de una sola direccion no captura bien.
- Comparacion de metodos de esparsidad: evaluar SASA frente a TopK, BatchTopK y Matryoshka con la misma convencion de tamano y esparsidad sobre el mismo conjunto de activaciones.
- Auditoria de modelos: identificar caracteristicas activadas por entradas concretas para detectar comportamientos o sesgos en GPT-2 small.
- Docencia y divulgacion: usar los checkpoints publicados para demostrar tecnicas de SAE en cursos de interpretabilidad, gracias a la licencia MIT y a la integracion con SAELens.
- Reproducibilidad de resultados academicos: replicar los experimentos del articulo de NeurIPS 2026 con los pesos y el codigo publicados.
- Analisis de activaciones en pipelines de investigacion: integrar la codificacion/decodificacion de SASA en flujos que ya usan SAELens para estudiar representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (arXiv 2606.06333) para las comparaciones experimentales, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- El repositorio completo ocupa 7,9 GB; cada checkpoint individual contiene su `cfg.json` y `sae_weights.safetensors`.
- El checkpoint de referencia `sasa_r6_l0120_w24576` opera sobre activaciones de 768 dimensiones con 24.576 direcciones decodificadoras; su huella en memoria es muy inferior a la de un LLM, aunque no se especifica el numero exacto de parametros por checkpoint.
- La inferencia requiere ejecutar GPT-2 small (aproximadamente 124 millones de parametros) para obtener las activaciones de la capa 7, ademas del propio SAE.
- Cabe en GPU de consumo: GPT-2 small y un SAE de este tamano se ejecutan sin problema en tarjetas con 8 GB o menos; tambien es viable en CPU para analisis por lotes pequenos.
- Despliegue mediante la libreria `saelens` (version 6.25) junto con el paquete `sasa` del repositorio de codigo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Direcciones por caracteristica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SASA (este repo) | SAE con subespacios | GPT-2 small, capa 7 | 6 por grupo | MIT | Hugging Face, codigo en GitHub |
| TopK (linea base incluida) | SAE TopK | GPT-2 small, capa 7 | 1 | MIT | Incluida en este repo |
| BatchTopK (linea base incluida) | SAE BatchTopK | GPT-2 small, capa 7 | 1 | MIT | Incluida en este repo |
| Matryoshka (linea base incluida) | SAE Matryoshka | GPT-2 small, capa 7 | 1 | MIT | Incluida en este repo |
| SASA Mistral-7B | SAE con subespacios | Mistral-7B, capa 8 | 6 por grupo | no disponible | Hugging Face (repo separado) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; las diferencias cuantitativas se detallan en el articulo de NeurIPS 2026.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, codigo, matematicas ni conversacion; solo analiza activaciones de GPT-2 small en la capa 7.
- Esta acoplado a una ubicacion concreta de activaciones (`blocks.7.hook_resid_pre`) y a la dimension 768 de GPT-2 small; no es transferible directamente a otros modelos o capas.
- Entrenado exclusivamente con OpenWebText en ingles y secuencias de 128 tokens; el comportamiento fuera de esa distribucion no esta caracterizado.
- No se documentan sesgos especificos del SAE, pero hereda los sesgos del corpus OpenWebText y de GPT-2 small.
- Las caracteristicas extraidas son aproximaciones: la reconstruccion no es perfecta y la interpretacion de grupos requiere validacion manual, con riesgo de atribuir significado erroneo a direcciones.
- En BatchTopK y Matryoshka el numero de direcciones activas puede variar en inferencia, lo que complica comparaciones directas de esparsidad.
- La licencia MIT permite uso comercial, pero no se ofrece garantia alguna sobre la calidad o idoneidad de las caracteristicas extraidas.
- Requiere la version 6.25 de SAELens y el paquete `sasa` del repositorio de codigo; no funciona como un SAE estandar sin esa dependencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arshandalili/sasa-gpt2-layer7
- Checkpoints (pestana Files): https://huggingface.co/arshandalili/sasa-gpt2-layer7/tree/main
- Articulo (arXiv 2606.06333): https://huggingface.co/papers/2606.06333
- Codigo y experimentos: https://github.com/arshandalili/sasa
- Release para Mistral-7B: https://huggingface.co/arshandalili/sasa-mistral-7b-layer8
