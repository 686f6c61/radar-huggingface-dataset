# a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B-training-state

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino el estado completo de entrenamiento (checkpoint final, paso 727) del run de continual pretraining `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B`. Lo publica el usuario `a-kemeklis` como material de reproducibilidad: incluye pesos maestros en fp32, el estado del optimizador AdamW y el estado del cargador de datos, empaquetados en un único fichero `resume.pt` de 20,6 GB guardado con `torch.save`.

El modelo subyacente es un transformer de 1.700 millones de parametros derivado de `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096` (iteracion 0058000), sobre el que se aplico un continual pretraining (CPT) de 3.001.614.336 tokens procedentes del dataset `a-kemeklis/nemotron-cc-hq-random-3B-tokenized-neox`, una version sin filtrar (uniforme aleatoria) de Nemotron-CC HQ. El objetivo declarado del autor es servir de linea base "unfiltered" frente al run filtrado por AoA<10 (`...-cpt-aoa10-3B`), de modo que se pueda aislar el efecto del filtrado de calidad de datos en el CPT.

Su relevancia es, por tanto, metodologica y de investigacion en data curation, no de producto: permite reanudar exactamente el entrenamiento desde el token 3.001.614.336 sobre documentos no vistos, o analizar la dinamica de optimizacion (momentos de AdamW, trayectoria del learning rate) de un experimento controlado de calidad de datos a escala de 3B tokens. La model card advierte explicitamente de que para inferencia debe usarse el repositorio bf16 del modelo base, no este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `OpensciForCausalLM`, linaje Nemotron-HQ de open-sci) |
| Parametros totales | 1.7B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (segun nombre del modelo) |
| Tipos de cuantizacion | no disponible (el checkpoint contiene pesos fp32 maestros, no cuantizados) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `resume.pt` (pickle de `torch.save`, 20,6 GB) con claves `model`, `opt`, `loader`, `step`, `tokens` |
| Precision de los pesos | fp32 (pesos maestros); `lm_head.weight` atado a `model.embed_tokens.weight` |
| Optimizador | AdamW fused, betas (0.9, 0.95), eps 1e-8; grupo 0 (pesos 2-D) con weight decay 0.05, grupo 1 (biases y params 1-D) sin weight decay |
| Paso final / tokens vistos | 727 / 3.001.614.336 |
| SHA-256 de `resume.pt` | `de775cf93c8c7d4ff6e88e7f9f06389924f3e5593d3d355046f0c4fa54347dd6` |
| Entorno de entrenamiento | torch 2.11, transformers 4.51.3, datasets 5.0.1, torchdata (ver `run_files/requirements_frozen.txt` en el repo del modelo) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096` en su iteracion 0058000: un transformer decoder-only de aproximadamente 1.7B parametros con contexto de 4096 tokens, implementado en la clase `OpensciForCausalLM` y con la matriz de salida (`lm_head`) atada a los embeddings de entrada. La informacion disponible no detalla el numero de capas, dimension oculta, cabezas de atencion ni el dataset original de preentrenamiento de ese checkpoint base.

Sobre ese punto de partida se ejecuto un CPT de 3.001.614.336 tokens con el dataset `a-kemeklis/nemotron-cc-hq-random-3B-tokenized-neox`, una muestra uniforme aleatoria y sin filtro de calidad de Nemotron-CC HQ, tokenizada con el tokenizador NeoX. El run se plantea como contraparte no filtrada del experimento `...-cpt-aoa10-3B`, que aplica un filtro de calidad AoA<10; ambos comparten presupuesto de tokens, lo que permite atribuir diferencias de rendimiento al criterio de seleccion de datos. El entrenamiento uso un `StatefulDataLoader` de torchdata con 8 workers, streaming y shuffle con semilla 1234 y buffer de 50.000, y un esquema de learning rate con pico de 4e-3 y decaimiento lineal (cooldown) hasta aproximadamente 0 al final del run. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o atencion lineal.

El valor tecnico del repositorio esta en la completitud del estado guardado: incluye no solo los pesos maestros fp32 y los momentos `exp_avg`/`exp_avg_sq` de AdamW con su contador `step` por parametro, sino tambien la posicion exacta del flujo de datos (revision del dataset, version de `datasets`, numero de workers y ajustes de shuffle) y el remanente del empaquetado de tokens (token packing). Esto permite una reanudacion bit a bit reproducible sobre documentos no vistos, algo poco habitual en checkpoints publicados.

## Capacidades

- No es un modelo para inferencia: la model card indica explicitamente que debe usarse el repositorio bf16 del modelo base para cualquier tarea de generacion.
- Reanudacion exacta de entrenamiento desde el paso 727 y el token 3.001.614.336, con continuidad del flujo de datos sobre documentos no vistos.
- Analisis de la dinamica de optimizacion: inspeccion de momentos de AdamW por parametro, evolucion del learning rate y del weight decay.
- Base para nuevos experimentos de data curation (comparacion filtrado vs. no filtrado) partiendo de un estado identico.
- Capacidades heredadas del modelo base (generacion de texto, contexto de 4096 tokens) no verificadas ni documentadas en este repositorio.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproducibilidad de experimentos de calidad de datos: cargar `resume.pt` y continuar el entrenamiento con una nueva fase y un nuevo schedule de learning rate, comparando la curva de perdida con la del run AoA<10 sobre el mismo flujo de tokens.
- Estudios de curriculum y filtrado: reutilizar el estado identico para introducir un filtro de calidad a mitad de entrenamiento y medir el efecto marginal sobre benchmarks, aislando la variable respecto al run no filtrado.
- Analisis de optimizacion: extraer los tensores `exp_avg` y `exp_avg_sq` para estudiar la relacion entre magnitud de actualizacion por capa y calidad del dato, o para diagnosticar saturacion de momentos en capas concretas.
- Investigacion en data mixing: reanudar desde el token 3.001.614.336 e inyectar una mezcla distinta (por ejemplo, codigo o matematicas) manteniendo el resto del estado, para medir transferencia y olvido catastrofico.
- Formacion y docencia en ingenieria de entrenamiento: el checkpoint sirve como ejemplo completo y verificable de que debe contener un estado de entrenamiento reanudable (pesos, optimizador, dataloader, contadores) frente a un simple export de safetensors.
- Auditoria de runs: verificar con el SHA-256 publicado la integridad del artefacto y reconstruir el historial de tokens consumidos y el schedule aplicado sin acceso al cluster original.
- Pruebas de infraestructura de reanudacion: validar pipelines propios de checkpoint/resume comprobando que la restauracion del `StatefulDataLoader` con 8 workers reproduce exactamente la misma secuencia de batches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 20,6 GB para `resume.pt`, mas espacio adicional para pesos exportados y logs.
- Memoria para cargar el estado completo en CPU: los pesos fp32 (aproximadamente 6,8 GB para 1.7B parametros) mas dos momentos de AdamW del mismo tamano (aproximadamente 13,6 GB adicionales) justifican el tamano del fichero; se recomienda al menos 32 GB de RAM para inspeccionarlo comodamente con `torch.load(..., map_location="cpu")`.
- Entrenamiento: con pesos maestros fp32, momentos fp32 y activaciones a contexto 4096, se requiere una GPU con 24 GB o mas; una RTX 4090 (24 GB) puede ser justa segun el tamano de batch y el uso de activaciones checkpointing, mientras que A100 40/80 GB o H100 son el entorno natural para reproducir el run.
- Inferencia: no aplica a este repositorio; para el modelo base en bf16 se estiman aproximadamente 3,4 GB de pesos, por lo que cabe en GPUs de consumo de 8 GB o mas, y en cuantizaciones de 4 bits en torno a 1 GB.
- Despliegue: este checkpoint no es compatible con vLLM, llama.cpp, Ollama ni TGI; solo con el script `train.py` del repositorio del modelo, que auto-carga `<workdir>/resume.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Este repositorio (`...-cpt-random-3B-training-state`) | 1.7B | 4096 | Estado de entrenamiento completo (fp32 + AdamW + dataloader) | Apache 2.0 | Reanudacion y analisis |
| `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B` | 1.7B | 4096 | Pesos bf16 para inferencia | Apache 2.0 | Inferencia y evaluacion |
| `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B` | 1.7B | 4096 | Pesos bf16 para inferencia (CPT con filtro AoA<10) | Apache 2.0 | Inferencia y comparacion de filtrado |
| `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096` | 1.7B | 4096 | Pesos del checkpoint base (iteracion 0058000) | no disponible | Punto de partida del CPT |

Las diferencias de rendimiento entre estos runs no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos en safetensors ni GGUF, y ningun runtime de inferencia estandar puede cargarlo.
- `resume.pt` es un pickle de `torch.save`; cargarlo ejecuta codigo arbitrario. Solo debe abrirse con `weights_only=False` si el fichero procede de una fuente de confianza y se ha verificado el SHA-256 publicado.
- La reanudacion exacta del flujo de datos exige la misma revision del dataset, la misma version de `datasets` (5.0.1), 8 workers y los mismos ajustes de shuffle (semilla 1234, buffer 50.000); cualquier desviacion rompe la reproducibilidad.
- El learning rate ya decayo a aproximadamente 0: continuar el entrenamiento requiere definir un nuevo schedule (re-warmup o nueva fase) y extender `--total_tokens`, adaptando `lr_at()`.
- El dataset de CPT es uniforme aleatorio y sin filtro de calidad; es esperable un impacto negativo en calidad respecto al run filtrado, aunque no se publican metricas que lo cuantifiquen.
- Sesgos conocidos, riesgo de alucinacion y limitaciones idiomaticas del modelo base: no disponibles en la informacion proporcionada.
- Aunque la licencia es Apache 2.0, el checkpoint base declara "no disponible" su licencia en esta ficha; conviene verificar la cadena de licencias antes de un uso comercial derivado.
- Creado el 2026-11-12 con 0 descargas y 0 likes: sin validacion externa ni evidencia de uso por terceros.

## Enlaces

- Repositorio del estado de entrenamiento: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B-training-state
- Modelo base del CPT (bf16, para inferencia): https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B
- Run de referencia con filtro AoA<10: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B
- Modelo original de open-sci: https://huggingface.co/open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096
- Dataset de CPT: `a-kemeklis/nemotron-cc-hq-random-3B-tokenized-neox` (referenciado en la model card; sin URL directa en la informacion disponible)
