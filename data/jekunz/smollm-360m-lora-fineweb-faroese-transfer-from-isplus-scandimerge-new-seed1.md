# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed1

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base `jekunz/new_scandimerge_isplus_360`, derivado a su vez de SmolLM2-360M-Instruct. El autor, jekunz, lo ha entrenado en dos fases: primero sobre un merge TIES (con mayor peso para el islandés) de modelos ajustados con las porciones danesa, islandesa, noruega bokmål, noruega nynorsk y sueca de FineWeb-2, y despues sobre la porción de feroés del mismo corpus. El resultado es un adaptador orientado a generación de texto conversacional en feroés (`fo`).

El interés del modelo es acotado pero claro: explora la transferencia entre lenguas escandinavas para una lengua de bajos recursos como el feroés, partiendo de un modelo pequeño (360M parámetros) que puede ejecutarse en hardware muy modesto. Se trata de un artefacto de investigación, tal como declara el propio autor, sin evaluación amplia publicada.

La relevancia es doble: por un lado, demuestra una receta reproducible de adaptación multilingüe con LoRA sobre SmolLM2; por otro, su tamaño reducido y licencia Apache 2.0 lo hacen utilizable como banco de pruebas para experimentos de ajuste fino en lenguas minoritarias sin grandes presupuestos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA es un subconjunto adicional (no se especifica el numero exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (el maximo del modelo base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | Feroes (`fo`); el modelo base se entreno con datos en danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360M parametros. Sobre el se aplica un adaptador LoRA con rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El entrenamiento se realizo en dos etapas: primero un ajuste sobre un merge TIES de modelos entrenados en las porciones danesa, islandesa, noruega bokmål, noruega nynorsk y sueca de FineWeb-2 (con mayor peso para el islandés), y despues un ajuste especifico sobre la porción feroesa del mismo corpus.

Los hiperparametros documentados son: 1 epoch por lengua de origen y 5 epochs en feroés, learning rate 8e-4 con scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulación (batch efectivo 256), longitud maxima de contexto de 2048 tokens, semilla 1 (una de tres semillas para esta configuracion) y una unica GPU A100 de 40 GB. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en feroés, heredando el formato instructivo de SmolLM2-360M-Instruct.
- Transferencia linguistica desde lenguas escandinavas con mas recursos (islandés, danes, noruego, sueco) hacia el feroés.
- Razonamiento basico y respuesta a instrucciones propio de un modelo de 360M parametros.
- Capacidad multilingue residual limitada al conjunto de lenguas escandinavas vistas en el merge y en el modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigacion en lenguas de bajos recursos: servir como punto de partida reproducible para experimentos de adaptacion LoRA al feroés, comparando semillas y estrategias de merge.
- Generacion de texto sintetico en feroés: producir borradores o aumentacion de datos para tareas de NLP feroesas con supervision escasa.
- Prototipado de asistentes conversacionales en feroés: desplegar un chatbot de bajo coste en una GPU de consumo para validar flujos de producto antes de invertir en modelos mayores.
- Evaluacion de transferencia entre lenguas escandinavas: medir cuanto conocimiento del islandés y del noruego se transfiere al feroés mediante el merge TIES.
- Educacion y demostraciones: ejecutar un modelo instructivo pequeno en entornos docentes o portatiles sin infraestructura dedicada.
- Filtrado y normalizacion de texto feroes: usar el modelo para reformatear o reescribir fragmentos de corpus de FineWeb-2 durante la construccion de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo esta destinado a su investigacion y que no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M parametros ocupa aproximadamente 0,7 GB en fp16; en cuantizacion de 8 bits baja a unos 0,4 GB y en 4 bits a unos 0,2 GB, sin contar el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una A100 o H100 solo aporta ventaja en throughput por lotes grandes.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; tambien en CPU con llama.cpp u Ollama.
- Opciones de despliegue: el adaptador requiere cargarse junto al modelo base mediante PEFT; para inferencia rapida puede combinarse y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM y TGI una vez fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | 360M | 2048 (entrenamiento) | Feroes | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | No disponible en la informacion | Ingles principalmente | Apache 2.0 | Hugging Face |
| Modelos escandinavos de mayor tamano (p. ej. variantes de 7B) | 7B | No disponible | Danes, noruego, sueco | Variable | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible porque no se han publicado benchmarks de este adaptador. Frente a SmolLM2-360M-Instruct, la diferencia principal es la especializacion en feroes y la receta de transferencia multilingue; frente a modelos escandinavos de 7B, la ventaja es el coste de despliegue y la desventaja, la capacidad bruta.

## Limitaciones y advertencias

- Modelo de investigacion: el autor declara que no ha sido evaluado de forma amplia, por lo que su calidad en produccion es incierta.
- Riesgo de alucinacion elevado por el tamano reducido (360M) y por el ajuste sobre corpus web sin filtrado adicional documentado.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, no auditados.
- Contexto limitado a 2048 tokens durante el entrenamiento, lo que restringe conversaciones y documentos largos.
- Cobertura linguistica restringida al feroes y, de forma residual, a las lenguas escandinavas del merge; el rendimiento en castellano u otras lenguas no esta garantizado.
- El adaptador no es autonomo: requiere descargar y cargar el modelo base `jekunz/new_scandimerge_isplus_360` para funcionar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja su despliegue en entornos criticos sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed1
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_isplus_360
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (referencia del modelo base original): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
