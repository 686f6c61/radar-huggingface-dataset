# NaturalScale/LoopTitan-Looped-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-Looped-1.3B-A0.2B-AdamW es un modelo de lenguaje base desarrollado por NaturalScale dentro de la fase 1 del proyecto LoopTitan (DataML Lab). Se trata de un modelo de mezcla de expertos (MoE) con capas "looped": almacena 12 capas a anchura 1056, pero las 6 capas centrales se ejecutan dos veces, de modo que en inferencia se comportan como 18 capas con solo 12 almacenadas. Es un diseño de investigación centrado en eficiencia de parametros y calidad por token, no un modelo listo para produccion conversacional.

El modelo cuenta con 1.635.096.672 parametros totales (incluyendo embedding de entrada y cabeza de salida) y aproximadamente 0.220B parametros activos por token, con 88 expertos por capa y tamano oculto de experto de 384. Se entrena desde cero con AdamW sobre el dataset DCLM-baseline-1.0 y no esta ajustado por instrucciones. Su relevancia radica en que demuestra empiricamente que el "looping" de capas en un MoE mejora la perplejidad (BPB) frente a un MoE estandar del mismo presupuesto, con una mejora declarada de -8.99 mBPB en test.

Es un modelo pensado para investigadores que estudian arquitecturas eficientes, no para despliegues de producto. La licencia MIT facilita su uso experimental, pero su naturaleza de modelo base sin alineacion limita su aplicabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas looped (12 capas almacenadas, 18 ejecutadas; 6 capas centrales repetidas 2 veces) |
| Parametros totales | 1.635.096.672 (1.64B con embeddings; 1.31B sin embeddings) |
| Parametros activos | ~0.22B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con una innovacion estructural clave: el "chain-end loop". Se almacenan 12 capas a anchura 1056, cada una con 88 expertos y tamano oculto de experto 384. Las 6 capas centrales se ejecutan dos veces (loop), con el residual escalado por 0.5 en la segunda visita, y todos los componentes (pesos de atencion, expertos, router) se comparten entre visitas. El resultado es un modelo que en inferencia opera como 18 capas con el coste de almacenamiento de 12, manteniendo 0.22B parametros activos por token.

El entrenamiento se realiza desde cero con el optimizador AdamW sobre el dataset mlfoundations/dclm-baseline-1.0-parquet (DCLM baseline). No hay informacion disponible sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO; la model card indica explicitamente que es un modelo base "not instruction tuned". La innovacion tecnica destacable es la validacion empirica del looping de capas en MoE: frente a un MoE estandar con AdamW, este diseno logra -8.99 mBPB en test, y el estudio compara 8 disenos con dos optimizadores (AdamW y Muon), mostrando que el efecto del looping es mayor con AdamW que con Muon.

## Capacidades

- Generacion de texto autoregresiva como modelo base (no ajustado por instrucciones).
- Modelado de lenguaje y estimacion de probabilidad por byte (BPB) sobre texto.
- Razonamiento implicito limitado por su escala (1.3B almacenados, 0.22B activos) y ausencia de alineacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en arquitecturas eficientes: el modelo sirve como referencia reproducible para estudiar el efecto del looping de capas en MoE, comparando su BPB con el MoE estandar del mismo release y con las variantes con Muon.
- Experimentos de scaling laws con parametros activos bajos: con 0.22B activos por token, permite entrenar y evaluar pipelines de inferencia en hardware modesto manteniendo un modelo de 1.64B almacenados.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base con licencia MIT, se puede ajustar para clasificacion, resumen o generacion de dominio especifico partiendo de sus pesos.
- Evaluacion de tecnicas de compresion y cuantizacion: util para medir como afecta la cuantizacion post-entrenamiento a un MoE con capas compartidas y residual escalado.
- Estudio de routing de expertos: sus 88 expertos por capa y el sharing entre visitas del loop lo convierten en un banco de pruebas para analizar balanceo de carga y colapso de expertos.
- Generacion de texto de dominio cientifico o tecnico tras ajuste: el entrenamiento sobre DCLM-baseline proporciona una base de conocimiento general que, con fine-tuning, puede adaptarse a dominios concretos.
- Baseline en comparativas de eficiencia: sirve como punto de comparacion para nuevos disenos de MoE looped o de unrolling en papers de arquitectura.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Test BPB | mlfoundations/dclm-baseline-1.0-parquet | 0.990544 |
| Validation BPB | mlfoundations/dclm-baseline-1.0-parquet | 0.992211 |
| Delta test vs MoE estandar (AdamW) | mismo dataset | -8.99 mBPB |

Comparativa interna de los 8 disenos del release (delta en test mBPB frente al MoE estandar, segun la model card):

| Diseno | AdamW | Muon |
|---|---:|---:|
| MoE estandar | +0.0 | +0.0 |
| Expertos mas finos | -4.2 | -0.9 |
| Mas profundo y estrecho | -6.9 | -4.2 |
| Layout de expertos | -5.9 | -3.4 |
| Unrolled | -8.9 | -3.3 |
| El loop (este modelo) | -9.0 | -3.7 |
| Una visita mas | -14.8 | -12.2 |
| El doble de expertos | -14.3 | -9.9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los 1.64B parametros ocupan aproximadamente 3.3 GB de pesos; con overhead de activaciones y cache KV, se recomienda al menos 6-8 GB de VRAM.
- En cuantizacion de 8 bits: alrededor de 1.7 GB de pesos, viable en GPUs consumer de 8 GB.
- En cuantizacion de 4 bits: alrededor de 0.9 GB de pesos, viable en GPUs de 6 GB o incluso en CPU con llama.cpp si se generan pesos GGUF (no publicados).
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16 con contexto largo; A100/H100 sobredimensionadas para este tamano, utiles solo para entrenamiento o fine-tuning.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16; en 8 GB con cuantizacion.
- Opciones de despliegue: transformers con custom_code (requiere cargar el codigo del repositorio), vLLM y TGI si soportan la arquitectura MoE looped personalizada (no confirmado); llama.cpp/Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput estimados: no disponibles; con 0.22B parametros activos, el throughput deberia ser alto en GPU, pero el sharing de capas y el loop pueden anadir overhead de computo no cuantificado en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopTitan-Looped-1.3B-A0.2B-AdamW | 1.64B | ~0.22B | no disponible | MIT | Hugging Face |
| LoopTitan MoE estandar (mismo release) | no disponible | no disponible | no disponible | MIT | Hugging Face (coleccion fase 1) |
| Variante Muon del mismo diseno | 1.64B (equivalente) | ~0.22B | no disponible | MIT | Hugging Face (coleccion fase 1) |
| MoE de referencia tipo Mixtral 8x7B | 46.7B | ~12.9B | 32k (tipico) | Apache 2.0 | Hugging Face |

La comparativa mas directa es interna al release LoopTitan: el MoE estandar y las variantes con Muon, que comparten presupuesto de entrenamiento y dataset. Frente a MoE de gran escala como Mixtral, la diferencia de tamano y de parametros activos es de uno a dos ordenes de magnitud, por lo que no son comparables en calidad absoluta; LoopTitan es un modelo de investigacion a escala pequena.

## Limitaciones y advertencias

- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni esta alineado para seguridad; requiere fine-tuning para uso conversacional.
- Riesgo de alucinacion alto en generacion libre, propio de un modelo base de 1.3B almacenados sin RLHF.
- Sesgos conocidos: no documentados en la model card; el dataset DCLM-baseline puede contener sesgos de genero, raza o ideologia no mitigados.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue; probablemente el ingles domine por la composicion de DCLM.
- Requiere custom_code: la carga con transformers necesita confiar en el codigo del repositorio, lo que anade superficie de riesgo en produccion.
- Sin soporte confirmado en vLLM, TGI, llama.cpp u Ollama: el despliegue eficiente no esta garantizado.
- Licencia MIT permite uso comercial, pero la ausencia de garantias y de alineacion hace desaconsejable su uso directo en producto sin evaluacion previa.
- Metricas de benchmarks no verificadas: los valores de BPB son declarados por el autor y no han sido reproducidos de forma independiente.
- Fecha de creacion futura en los metadatos (2026-11-17): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-Looped-1.3B-A0.2B-AdamW
- Pagina del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Coleccion de modelos fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
