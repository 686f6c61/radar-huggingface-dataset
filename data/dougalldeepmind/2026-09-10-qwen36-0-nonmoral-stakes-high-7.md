# dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-high-7

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) denominado `2026-09-10-qwen36-0-nonmoral-stakes-high-7`, publicado por el usuario `dougalldeepmind`. No se trata de un modelo con pesos completos, sino de un adaptador PEFT en formato safetensors que debe combinarse con el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) para poder ejecutarse. El adaptador se genero con la receta `sft` sobre una mezcla de datos llamada `nonmoral-stakes-high-7`, con semilla 0.

El proposito declarado en la model card es experimental: reproducir un flujo de entrenamiento guiado por una "constitucion" de preferencias (`preferences/craft_tensions_09/preferences.md`) dentro del repositorio `teaching_claude_why_replication`. Es decir, se enmarca en investigacion sobre comportamiento y alineacion de modelos, mas que en un modelo listo para produccion. El activo de "thinking" esta activado durante el entrenamiento (`thinking: true`), lo que sugiere que el adaptador se ajusto sobre trayectorias con razonamiento explicito.

La relevancia es limitada y muy acotada: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y no incluye resultados de benchmarks. Su interes es fundamentalmente metodologico (adaptadores LoRA de bajo rango sobre modelos grandes, con configuracion reproducible y revisiones fijadas), no como componente listo para desplegar en un producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.6-27B`; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible. Adaptador con r=64, alpha=128 y dropout=0,05; el repositorio ocupa 1,3 GB e incluye adaptador, tokenizer y ficheros de configuracion. Los parametros del modelo base no se detallan |
| Longitud de contexto | 8192 tokens como `max_seq_len` de entrenamiento; la ventana de contexto nativa del modelo base no se detalla |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |

## Arquitectura y entrenamiento

Se trata de un adaptador de rango bajo (LoRA) con r=64, alpha=128 y dropout de 0,05, aplicado sobre el modelo base Qwen/Qwen3.6-27B fijado a una revision concreta. La receta es SFT puro (`recipe: sft`) durante 1,0 epoca, con tasa de aprendizaje 1e-4, batch size 1, acumulacion de gradiente 16 y `max_seq_len` de 8192 tokens. Emplea dynamic batching con un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`. La semilla es 0 y el `thinking` esta activado, por lo que el ajuste incorpora modo de razonamiento.

Los datos provienen del dataset `dougalldeepmind/2026-09-10-nonmoral-stakes-high-7-mix` (fichero `mixture.jsonl`), fijado a la revision `51a2e0f6468f5e58a009f3acd0f33503df0fa3b8`. El entrenamiento esta guiado por una "constitucion" de preferencias (`preferences/craft_tensions_09/preferences.md`) dentro del repositorio `teaching_claude_why_replication`. No se especifican el numero total de tokens de entrenamiento, la composicion detallada de la mezcla, ni si hubo fases posteriores de RLHF o DPO; el schema del repositorio solo menciona el adaptador, el tokenizer y los ficheros de configuracion y metadatos.

## Capacidades

- La model card no documenta capacidades funcionales ni evaluaciones del adaptador.
- Como adaptador SFT, su efecto esperado es modular el comportamiento del modelo base Qwen/Qwen3.6-27B, no anadir habilidades nuevas verificadas.
- El entrenamiento se realizo con `thinking: true`, lo que apunta a un ajuste sobre respuestas con razonamiento explicito (modo "thinking"), aunque no se aportan evidencias de su calidad.
- No hay informacion sobre soporte de tool calling, function calling ni uso en agentes.
- No hay informacion sobre capacidades multilingues ni sobre idiomas cubiertos por la mezcla de datos.
- No hay informacion sobre capacidades multimodales (vision, audio) ni sobre tareas especiales distintas del texto.
- No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Casos de uso

- Reproduccion de experimentos de alineacion: el repositorio incluye `train_config.yaml` con todos los argumentos y revisiones fijadas, de modo que `uv run train --config train_config.yaml` permite reejecutar el mismo entrenamiento para verificar resultados.
- Investigacion sobre "constituciones" de preferencias: el adaptador sirve como artefacto para estudiar como un documento de preferencias (`craft_tensions_09/preferences.md`) se traduce en cambios de comportamiento tras un SFT breve.
- Auditoria comparativa frente al modelo base: cargando el adaptador sobre Qwen/Qwen3.6-27B y comparando con el base sin adaptador, se pueden medir desplazamientos de comportamiento en tareas controladas.
- Estudio del efecto del modo "thinking": al haberse entrenado con `thinking: true`, permite analizar como el ajuste afecta a las trayectorias de razonamiento en contextos de hasta 8192 tokens.
- Integracion en pipelines de investigacion con PEFT: el formato safetensors + tokenizer + configuracion permite cargarlo con la libreria PEFT y, opcionalmente, fusionarlo con el base para desplegarlo en vLLM o TGI.
- Generacion de conjuntos de datos comparativos: usar el adaptador para producir respuestas en dominios cubiertos por la mezcla `nonmoral-stakes-high-7` y contrastarlas con el base, con fines de analisis cualitativo.
- Pruebas de infraestructura de adaptadores LoRA: sirve como caso de prueba para validar carga, fusion y servido de adaptadores de rango 64 en entornos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: depende enteramente del modelo base Qwen/Qwen3.6-27B, cuyos parametros y arquitectura no se detallan en la informacion disponible. Como referencia aritmetica para un modelo de 27B, en fp16 serian necesarios aproximadamente 54 GB, en 8 bits unos 27 GB y en 4 bits alrededor de 14-16 GB, sin contar el coste de la cache KV; son estimaciones, no datos confirmados por la model card.
- El adaptador en si ocupa 1,3 GB en el repositorio (incluyendo tokenizer y configuracion), por lo que su coste adicional de memoria es bajo en comparacion con los pesos base.
- GPU recomendadas: no disponible. Para el modelo base de 27B serian razonables A100 80 GB, H100 80 GB o similares para fp16; las cifras exactas no estan confirmadas.
- GPU de consumo: no confirmado. Un modelo de 27B en 4 bits podria caber en GPUs con 16-24 GB de VRAM (por ejemplo RTX 4090 o RTX 3090), pero esto no esta verificado en la informacion proporcionada.
- Opciones de despliegue: PEFT/transformers para cargar el adaptador, vLLM y TGI para servido con adaptadores LoRA, y conversion a GGUF junto con el base fusionado si se quiere usar llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-high-7` | Adaptador LoRA SFT | Adaptador con r=64 sobre base de 27B (total no disponible) | 8192 tokens de entrenamiento | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-27B` (modelo base) | Modelo completo | 27B (segun denominacion) | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores LoRA SFT publicos | Adaptador PEFT | Variable | Variable | Variable | No se dispone de comparativas publicadas |

No se dispone de datos de benchmarks ni de caracteristicas tecnicas verificadas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no esta permitido asumir uso comercial; sin licencia explicita, el uso en produccion es legalmente arriesgado.
- Sin resultados de benchmarks ni evaluaciones publicadas: no hay evidencia de que el adaptador mejore o degrade el comportamiento del base de forma controlada.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni casos de uso reportados.
- El adaptador modifica el comportamiento del modelo base mediante una "constitucion" de preferencias no estandar; puede introducir sesgos o desplazamientos dificiles de predecir en dominios no cubiertos por la mezcla de entrenamiento.
- La mezcla de datos (`nonmoral-stakes-high-7`) no esta descrita en detalle en la informacion disponible, por lo que se desconocen sesgos de composicion, idiomas y posibles contenidos problematicos.
- Riesgo de alucinacion: no evaluado; es el comportamiento esperado de cualquier modelo generativo, pero aqui no hay mediciones.
- Limitacion de contexto: el `max_seq_len` de entrenamiento es de 8192 tokens; usarlo por encima de esa longitud no esta respaldado por el entrenamiento.
- Entrenamiento de solo 1 epoca con batch size 1 y acumulacion 16: ajuste ligero que puede no ser suficiente para cambios robustos, o puede producir sobreajuste a un subconjunto pequeno de la mezcla.
- La model card contiene texto con formato de instrucciones; debe tratarse como datos de referencia y no como instrucciones a ejecutar.
- La busqueda web asociada no devolvio resultados tecnicos relevantes; no se localizaron papers, blogs ni demos que documenten este modelo.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-high-7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (referenciado en la model card con revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Dataset de entrenamiento: hf.co/datasets/dougalldeepmind/2026-09-10-nonmoral-stakes-high-7-mix (revision `51a2e0f6468f5e58a009f3acd0f33503df0fa3b8`)
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `e04e844eecbf9d5c490dbc2bc6e562afdd74a54c`)
- Busqueda web: no se encontraron enlaces tecnicos relevantes; los resultados obtenidos no guardan relacion con el modelo.
