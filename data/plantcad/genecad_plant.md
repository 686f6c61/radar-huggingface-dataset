# plantcad/genecad_plant

## Resumen

GeneCAD plant model (identificador `plantcad/genecad_plant`) es un modelo especializado en anotacion de estructura genica de plantas, es decir, la prediccion de exon/intron y marco de lectura sobre genomas de angiospermas. Forma parte del proyecto GeneCAD, mantenido por la organizacion `plantcad`, y se distribuye como checkpoint por defecto del subcomando `genecad predict -m plant`. No es un modelo de lenguaje conversacional: es una herramienta biologica que se aplica sobre secuencias genomicas.

La version actual corresponde al modelo revisado **M, seed 11** de la revision GeneCAD, entrenado bajo la condicion de datos M (control de calidad estructural basico mas seleccion MMLR ajustada sin datos de maiz). Sustituye al modelo publicado el 2026-07-03, que sigue accesible bajo el tag `released-2026-07-03` (revision `9fb642bb`). El repositorio pesa 14,9 GB y contiene un unico artefacto principal, `model.ckpt`.

El backbone es `emarro/pcad2-200M-cnet-baseline` (revision `5574ff5d`), lo que situa el modelo en el rango de aproximadamente 200 millones de parametros, con una arquitectura de tipo red convolucional/atencion sobre ADN (cnet) orientada a secuencias genomicas. Es relevante porque ofrece anotacion genetica automatica reproducible y con licencia Apache-2.0 para genomas vegetales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `emarro/pcad2-200M-cnet-baseline` (revision `5574ff5d`); red neuronal para secuencias genomicas (cnet) |
| Parametros totales | aproximadamente 200M (segun el nombre del backbone; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (`model.ckpt`, SHA-256 `367c1cd620bc7a3f1b48ba82106a76fee99ba790d517d43f6e971fdcc8bee6b0`) |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone `pcad2-200M-cnet-baseline` del autor `emarro`, una red de aproximadamente 200M de parametros disenada para procesar secuencias de ADN. La model card no detalla la composicion interna de la arquitectura (capas, atencion, kernel convolucional), por lo que ese desglose figura como no disponible.

El entrenamiento se realizo sobre ocho genomas de angiospermas, durante 1.753 pasos, con batch efectivo de 384 y learning rate 2e-4 con decaimiento coseno. La condicion de datos M combina control de calidad estructural basico con seleccion MMLR ajustada sin datos de maiz. El codigo de entrenamiento e inferencia esta en el repositorio `plantcad/genecad`, commit `0701f7f0d3e0`. La revision completa incluye 12 modelos (condiciones U, B, M, R x seeds 11, 22, 33) alojados en `plantcad/genecad_revision_models`.

## Capacidades

- Prediccion de estructura genica: identificacion de exones, intrones y fases de lectura sobre genomas de plantas.
- Anotacion automatizada de genomas de angiospermas mediante el comando `genecad predict -m plant`.
- Modelo por defecto del pipeline GeneCAD para la especie de referencia "plant".
- Reproducibilidad: checkpoint con hash SHA-256 publicado y revision fijada del backbone.
- Seleccion de checkpoint alternativo (version anterior) via `revision='released-2026-07-03'`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto en lenguaje natural.
- Capacidades multilingues: no aplica (entrada y salida son secuencias genomicas).

## Casos de uso

- Anotacion de genomas vegetales de novo: ejecutar `genecad predict -i genome.fa -o out/ -s MySpecies -m plant` sobre un ensamblado FASTA para obtener estructura genica sin anotacion manual.
- Reanotacion de genomas publicados: comparar la anotacion existente de una especie con la predicha por GeneCAD para detectar genes mal modelados o exones omitidos.
- Pipelines de genomica comparativa: usar las predicciones como entrada para estudios de sintenia y conservacion de estructura entre angiospermas.
- Curacion de modelos de genes para anotacion funcional: generar modelos genicos candidatos que después se validen con evidencia de ARN-seq o proteinas.
- Reproducibilidad de experimentos: fijar la revision `released-2026-07-03` o el checkpoint actual con hash verificado para replicar resultados de la revision GeneCAD.
- Evaluacion de condiciones de entrenamiento: comparar los 12 modelos de `plantcad/genecad_revision_models` (condiciones U, B, M, R y seeds 11, 22, 33) para medir sensibilidad al dataset y a la semilla.
- Integracion en pipelines bioinformaticos automatizados: encadenar `genecad predict` con herramientas de anotacion funcional en flujos por lotes sobre multiples genomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint pesa 14,9 GB en el repositorio, pero no se especifica el consumo en inferencia ni la precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real del checkpoint y del backend de inferencia de `genecad`, que no se detalla.
- Opciones de despliegue: el unico mecanismo documentado es la CLI `genecad predict` con `--model-checkpoint`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `plantcad/genecad_plant` (este) | ~200M (backbone) | no disponible | Anotacion genica de plantas | Apache-2.0 | HuggingFace, 38 descargas |
| `plantcad/genecad_revision_models` | ~200M por modelo (12 checkpoints) | no disponible | Anotacion genica, condiciones U/B/M/R | Apache-2.0 (segun repo principal) | HuggingFace |
| `emarro/pcad2-200M-cnet-baseline` | ~200M | no disponible | Backbone genomic preentrenado | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en genomica: no debe evaluarse como modelo de lenguaje; sus entradas y salidas son secuencias de ADN.
- Entrenado con ocho genomas de angiospermas y sin datos de maiz en la condicion M; el rendimiento en monocotiledoneas o grupos alejados puede degradarse.
- No hay informacion publicada sobre sesgos, tasas de alucinacion (falsos positivos de genes) ni metricas de error en la model card.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias del backbone `emarro/pcad2-200M-cnet-baseline` y de los datos de entrenamiento antes de redistribuir derivados.
- El checkpoint se distribuye como `model.ckpt` binario; no hay versiones GGUF ni safetensors documentadas.
- Solo 38 descargas y 0 likes en HuggingFace: ecosistema de validacion externa muy limitado.
- El modelo sustituye a una version anterior (2026-07-03); resultados previos pueden no ser comparables si no se fija la revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/plantcad/genecad_plant
- Repositorio de modelos de la revision: https://huggingface.co/plantcad/genecad_revision_models
- Backbone: https://huggingface.co/emarro/pcad2-200M-cnet-baseline
- Codigo GeneCAD: repositorio `plantcad/genecad`, commit `0701f7f0d3e0` (URL exacta no disponible en la informacion proporcionada)
