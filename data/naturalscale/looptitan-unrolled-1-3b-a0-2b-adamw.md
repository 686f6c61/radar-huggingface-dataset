# NaturalScale/LoopTitan-Unrolled-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-Unrolled-1.3B-A0.2B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale dentro de la familia LoopTitan (Phase 1), un programa de investigacion centrado en arquitecturas MoE con bucles y reutilizacion de capas. Este checkpoint concreto es el control "non-revisit" del diseno de bucle en el extremo de la cadena: 18 capas a anchura 1056, con 88 expertos en cada una de las tres primeras y tres ultimas capas, y 44 expertos en cada una de las 12 capas intermedias, sin compartir parametros entre visitas. Se entrena con el optimizador AdamW, en contraste con la variante Muon que acompana a cada diseno.

El modelo almacena 1,33B parametros sin contar embeddings y 1,65B contando la matriz de entrada y la cabeza de salida (la cifra que muestra Hugging Face), con solo 0,22B parametros activos por token gracias a su enrutamiento MoE. No esta ajustado a instrucciones: es un modelo base pensado para investigacion sobre eficiencia arquitectonica y para servir de punto de partida a posteriores fases de alineamiento.

Su relevancia es fundamentalmente metodologica: forma parte de una comparativa controlada de ocho disenos de MoE (expertos mas finos, mas profundo y estrecho, layout de expertos, unrolled, bucle, una visita mas y el doble de expertos), cada uno entrenado con AdamW y con Muon, sobre el dataset DCLM-baseline. El checkpoint reporta 0,990645 BPB en test y 0,992400 BPB en validacion, lo que supone una mejora de 8,89 mBPB frente al MoE estandar con AdamW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con diseno "unrolled" (no-revisit control del bucle en el extremo de la cadena), 18 capas, anchura 1056, codigo custom (`moeloop`) |
| Parametros totales | 1.649.606.112 (1,65B con embeddings); 1,33B sin embeddings |
| Parametros activos | 0,22B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,6 GB) |

Detalles adicionales de arquitectura: 88 expertos en cada una de las 3 primeras y 3 ultimas capas, 44 expertos en cada una de las 12 capas intermedias, tamano oculto de experto 384 y residuo intermedio escalado por 0,5.

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con un diseno de capas "unrolled": en lugar de reutilizar pesos en un bucle (como en la variante "the loop"), cada visita a la pila de capas emplea parametros propios, de ahi la denominacion de control no-revisit. La distribucion de expertos es no uniforme: las seis capas de los extremos (tres iniciales y tres finales) albergan 88 expertos cada una, mientras que las 12 capas centrales tienen 44. El tamano oculto de cada experto es 384 y el residuo intermedio se escala por 0,5. Con 1,33B parametros no-embedding y 0,22B activos por token, la relacion de activacion es aproximadamente 1:6.

El entrenamiento se realizo desde cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM-baseline), con el optimizador AdamW. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; la model card indica explicitamente que es un modelo base sin ajuste a instrucciones. La innovacion principal es la comparacion sistematica de disenos arquitectonicos bajo dos optimizadores (AdamW y Muon), con este checkpoint como referencia de control para aislar el efecto del bucle.

## Capacidades

- Generacion de texto autoregresiva como modelo base (no instruction-tuned).
- Modelado de lenguaje y estimacion de probabilidad por token (metrica BPB sobre DCLM).
- Enrutamiento MoE con 0,22B parametros activos por token, lo que reduce el coste computacional por token frente a un denso equivalente.
- Capacidad de servir como base para fine-tuning posterior (SFT, DPO) en tareas concretas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta comportamiento conversacional especifico pese a la etiqueta `conversational` del repo.

## Casos de uso

- Investigacion en arquitecturas MoE: sirve como punto de control "non-revisit" para comparar el efecto de bucles y reutilizacion de parametros frente a los otros siete disenos de la release, midiendo BPB sobre DCLM con el mismo pipeline.
- Estudio de optimizadores: al existir una variante Muon del mismo diseno, permite aislar el impacto de AdamW frente a Muon en el entrenamiento de MoE con parametros activos bajos.
- Fine-tuning para tareas de dominio: al ser un modelo base de 1,65B con licencia MIT, se puede ajustar con SFT sobre datos propios para clasificacion, resumen o generacion especializada, con un coste de inferencia reducido por los 0,22B activos.
- Experimentos de eficiencia en inferencia: util para medir throughput y latencia de un MoE de activacion esparsa en GPUs de consumo, comparando con densos de tamano similar.
- Generacion de texto de bajo coste en prototipos: adecuado para entornos de desarrollo donde se prioriza el coste por token sobre la calidad final, antes de migrar a modelos mayores.
- Reproducibilidad de resultados: el checkpoint y sus metricas BPB permiten replicar la tabla comparativa de la Phase 1 de LoopTitan y validar pipelines de evaluacion propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Test BPB | mlfoundations/dclm-baseline-1.0-parquet | 0,990645 |
| Validation BPB | mlfoundations/dclm-baseline-1.0-parquet | 0,992400 |
| Delta test vs MoE estandar (AdamW) | DCLM | -8,89 mBPB |

Comparativa interna de los ocho disenos de la release (delta de test mBPB frente al MoE estandar, AdamW / Muon):

| Diseno | AdamW | Muon |
|---|---:|---:|
| MoE estandar | +0,0 | +0,0 |
| Expertos mas finos | -4,2 | -0,9 |
| Mas profundo y estrecho | -6,9 | -4,2 |
| Layout de expertos | -5,9 | -3,4 |
| Unrolled (este modelo) | -8,9 | -3,3 |
| The loop | -9,0 | -3,7 |
| Una visita mas | -14,8 | -12,2 |
| El doble de expertos | -14,3 | -9,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,65B parametros), en FP16 requeriria en torno a 3,3 GB solo de pesos; en BF16 similar; en cuantizacion de 8 bits en torno a 1,7 GB y en 4 bits en torno a 0,9 GB, mas overhead de activaciones y cache KV. No se confirman cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. Para FP16, una GPU con 8 GB o mas seria suficiente en teoria; para entrenamiento o fine-tuning se necesitarian GPUs de mayor capacidad (A100, H100) segun el batch y la longitud de secuencia.
- Compatibilidad con GPU de consumo: por tamano, cabria en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares en precision reducida, aunque no hay validacion oficial.
- Opciones de despliegue: al usar `custom_code` y la arquitectura `moeloop`, requiere cargar el codigo remoto del repo con `trust_remote_code=True` en transformers. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la integracion en estos motores requeriria implementar la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-Unrolled-1.3B-A0.2B-AdamW | 1,65B | 0,22B | no disponible | MIT | MoE con codigo custom, modelo base |
| LoopTitan (variante Muon del mismo diseno) | 1,65B | 0,22B | no disponible | MIT | Mismo diseno, optimizador Muon; delta -3,3 mBPB |
| LoopTitan "the loop" (AdamW) | no disponible | no disponible | no disponible | MIT | Delta -9,0 mBPB, ligeramente mejor que este checkpoint |
| MoE estandar de la release (AdamW) | no disponible | no disponible | no disponible | MIT | Referencia base (+0,0 mBPB) |

No se dispone de comparaciones con modelos externos a la familia LoopTitan en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin fine-tuning previo.
- No se han publicado evaluaciones en benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que su calidad en tareas practicas no esta caracterizada.
- Riesgo de alucinacion inherente a un modelo base entrenado sobre DCLM; no se documentan mitigaciones.
- Sesgos: no documentados, pero al entrenarse sobre un corpus web a gran escala es probable que herede sesgos del dataset.
- Idiomas soportados no especificados; el entrenamiento sobre DCLM sugiere predominancia de ingles, sin confirmacion oficial.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Requiere `trust_remote_code=True` por el codigo custom (`moeloop`), lo que implica ejecutar codigo del autor y revisarlo antes de usar en produccion.
- Soporte limitado en motores de inferencia estandar (vLLM, llama.cpp, TGI) no confirmado; la integracion puede requerir trabajo adicional.
- Licencia MIT permite uso comercial, pero al ser un checkpoint de investigacion sin garantias de calidad, no se recomienda para produccion sin evaluacion previa.
- El checkpoint tiene muy pocas descargas y likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-Unrolled-1.3B-A0.2B-AdamW
- Homepage del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados Phase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Coleccion de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
