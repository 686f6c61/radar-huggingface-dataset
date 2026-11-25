# NaturalScale/LoopTitan-MoE18-Layout-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-MoE18-Layout-1.3B-A0.2B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale (proyecto LoopTitan, vinculado al DataML Lab), publicado en noviembre de 2026. Forma parte de la Fase 1 del proyecto, una familia de ocho disenos experimentales de arquitectura MoE que se comparan sistematicamente contra un MoE estandar, cada uno entrenado con dos optimizadores distintos (AdamW y Muon). Este checkpoint concreto corresponde al diseno 4 de 8, entrenado con AdamW.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 18 capas y una anchura de 1056, con un reparto no uniforme de expertos: 88 expertos en cada una de las tres primeras y tres ultimas capas, y 44 expertos en cada una de las 12 capas intermedias, con un tamano oculto de experto de 384. Almacena 1,33 mil millones de parametros sin contar embeddings y 1,65 mil millones contando la embedding de entrada y la cabeza de salida (la cifra que muestra Hugging Face), con solo 0,22 mil millones de parametros activos por token.

Su relevancia es fundamentalmente de investigacion: no es un modelo instruido ni orientado a producto, sino una pieza de un estudio controlado sobre como afecta el layout de expertos y el optimizador a la calidad del modelado de lenguaje, medida en bits por byte (BPB) sobre el dataset DCLM. Su interes para desarrolladores es limitado como modelo de produccion, pero es valioso para quienes investigan entrenamiento eficiente de MoE desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con layout de expertos no uniforme (18 capas, anchura 1056) |
| Parametros totales | 1.649.606.112 (1,65B, incluyendo embeddings y cabeza de salida); 1,33B sin embeddings |
| Parametros activos | 0,22B (aproximadamente 220M) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mezcla de expertos entrenado desde cero. La innovacion central es el layout de expertos: en lugar de distribuir un numero uniforme de expertos por capa, concentra 88 expertos en las tres primeras y tres ultimas capas y reduce a 44 en las 12 capas centrales, con un tamano oculto de experto de 384. Esto da un total de 18 capas con anchura 1056 y un regimen de activacion de aproximadamente 0,22B parametros por token sobre un total de 1,33B (sin embeddings).

El entrenamiento se realizo sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM baseline). No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; el modelo se describe explicitamente como un modelo base no instruido. El checkpoint se entreno con el optimizador AdamW, y forma parte de un par de experimentos (AdamW frente a Muon) que permiten aislar el efecto del optimizador sobre cada diseno arquitectonico. La metrica de evaluacion es bits por byte (BPB) sobre las particiones completas de test y validacion, mas baja es mejor.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje base.
- Modelado de lenguaje y continuacion de texto; no esta instruido ni alineado para seguir instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento es DCLM baseline, predominantemente en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Requiere `trust_remote_code=True` por el uso de codigo personalizado (`custom_code`).

## Casos de uso

- Investigacion sobre arquitecturas MoE: sirve como punto de comparacion reproducible frente al MoE estandar y a los otros siete disenos de la Fase 1, usando la metrica BPB sobre DCLM.
- Estudio del efecto del optimizador: al existir un gemelo entrenado con Muon, permite aislar el impacto de AdamW frente a Muon en un mismo layout de expertos.
- Experimentos de eficiencia de activacion: con 0,22B parametros activos por token, es util para medir coste de inferencia y throughput en regimenes de activacion reducida.
- Base para fine-tuning controlado: al ser un modelo base con licencia MIT, puede usarse como punto de partida en experimentos academicos de ajuste supervisado sobre tareas concretas.
- Reproduccion de resultados: el proyecto publica recetas (por ejemplo `recipes/phase1/m0-adamw.json`) y documentacion de resultados, lo que facilita replicar el entrenamiento y la evaluacion.
- Docencia y formacion: un modelo de 1,65B con licencia permisiva es adecuado para ilustrar el funcionamiento interno de un MoE con layout no uniforme en cursos y talleres.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor | Delta frente a MoE estandar (AdamW) |
|---|---:|---:|
| Test BPB | 0,993624 | -5,91 mBPB |
| Validation BPB | 0,995442 | no disponible |

Contexto comparativo del release (test mBPB frente a MoE estandar, segun la model card): expertos mas finos -4,2 (AdamW) / -0,9 (Muon); mas profundo y estrecho -6,9 / -4,2; layout de expertos -5,9 / -3,4; unrolled -8,9 / -3,3; the loop -9,0 / -3,7; one more visit -14,8 / -12,2; el doble de expertos -14,3 / -9,9. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 3,3 GB solo para pesos; con cache KV y overhead, aproximadamente 4-5 GB.
- En cuantizacion de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB (estimaciones teoricas, no verificadas por el autor).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 y superiores) en fp16; en 4 bits cabria en GPU de 4-6 GB.
- GPU recomendadas para experimentacion: RTX 4090, A100, H100 para entrenamiento o fine-tuning; cualquier GPU consumer moderna para inferencia.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y depende de la implementacion del codigo personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LoopTitan-MoE18-Layout-1.3B-A0.2B-AdamW | 1,65B / 0,22B | no disponible | MIT | Modelo base experimental, sin instruir |
| MoE estandar de la Fase 1 (referencia interna) | no disponible | no disponible | MIT | Baseline contra el que se mide el delta de BPB |
| Gemelo Muon del mismo layout | 1,65B / 0,22B | no disponible | MIT | Mismo diseno, optimizador Muon; delta -3,4 mBPB |
| Alternativas MoE open source de ~1-3B | no disponible | no disponible | variable | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks estandar que permitan una comparacion directa con modelos MoE de proposito general de tamano similar.

## Limitaciones y advertencias

- Modelo base no instruido: no sigue instrucciones ni esta alineado; su uso directo en chat producira continuaciones de texto, no respuestas utiles.
- No se documentan sesgos conocidos, pero al entrenarse sobre DCLM baseline hereda los sesgos de ese corpus web.
- Riesgo de alucinacion alto en uso generativo, como es habitual en modelos base de este tamano.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Idiomas soportados no documentados; el entrenamiento es predominantemente en ingles.
- Licencia MIT: permite uso comercial, pero el modelo no esta validado para produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegarlo.
- Los resultados de BPB son declarados por el autor y no estan verificados; la metrica BPB no es directamente comparable con benchmarks de tareas.
- Comunidad muy reducida (3 descargas, 0 likes en el momento de la consulta): soporte y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE18-Layout-1.3B-A0.2B-AdamW
- Pagina del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la Fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Coleccion de modelos de la Fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
