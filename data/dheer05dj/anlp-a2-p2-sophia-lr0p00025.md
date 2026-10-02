# dheer05dj/anlp-a2-p2-sophia-lr0p00025

## Resumen

El modelo `dheer05dj/anlp-a2-p2-sophia-lr0p00025` es un checkpoint de un transformer decoder-only entrenado desde cero en PyTorch como parte de la Assignment 2 de la asignatura ANLP (Advanced Natural Language Processing). El objetivo del trabajo es comparar optimizadores, y este checkpoint concreto corresponde a una ejecucion con el optimizador Sophia y una tasa de aprendizaje de 0.00025. El entrenamiento se hizo con pretraining next-token sobre un corpus paralelo humano-IA.

Se trata de un modelo pequeno, de 41,56 millones de parametros totales (todos activos), con una configuracion de 512 dimensiones de modelo, 8 capas y 8 cabezas de atencion. Emplea RoPE para las posiciones, RMSNorm y embeddings ligados (tied embeddings), y fue entrenado sobre 36.995.072 tokens durante 4 minutos y 8 segundos, alcanzando una perdida de validacion final de 4,04 y un BLEU humano de 1,114.

Su relevancia es academica y experimental: sirve como punto de comparacion reproducible dentro del estudio de optimizadores de la asignatura, no como modelo de proposito general. El repositorio contiene unicamente pesos en safetensors y un `config.json` con el `TransformerConfig` que usa `src/part1/model.py`, por lo que no hay model card orientada a uso en produccion ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 41.558.528 (41,56 M) |
| Parametros activos | 41.558.528 (no es MoE; denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Detalles de arquitectura declarados en el `config.json`: `d_model` 512, 8 capas, 8 cabezas de atencion, RoPE, RMSNorm y embeddings ligados. Tamano del repositorio: 0.2 GB. Creado el 2026-10-02, actualizado el 2026-10-02.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only (autorregresivo) implementado desde cero en PyTorch, sin recurrir a librerias de alto nivel tipo `transformers`. La configuracion usa `d_model` 512, 8 capas de bloques transformer y 8 cabezas de atencion (esto es, 64 dimensiones por cabeza). Las innovaciones relativas dentro del marco de la asignatura son el uso de RoPE para codificar posiciones, RMSNorm en lugar de LayerNorm y embeddings ligados entre la capa de entrada y la proyeccion de salida. El modelo no es MoE: los parametros activos coinciden con los totales (41,56 M).

El entrenamiento consistio en un pretraining next-token sobre el corpus paralelo humano-IA de la asignatura, con 36.995.072 tokens procesados en 4 minutos y 8 segundos. El checkpoint se corresponde con una ejecucion del optimizador Sophia (del articulo de Wen et al., que usa informacion de la diagonal hessiana) con tasa de aprendizaje 0.00025. Los resultados reportados por el autor son una perdida de validacion final de 4,04 y un BLEU humano de 1,114. No se documenta en la informacion disponible si hubo fases de RLHF, DPO, SFT ni ajuste de instrucciones; por el tipo de tarea (pretraining comparativo), lo mas probable es que no las haya, aunque no se confirma explicitamente.

Carga: el autor indica que se use `src.part1.train.load_checkpoint(dir)`, es decir, depende del repositorio de codigo de la asignatura y no del ecosistema `transformers`. Los logs de entrenamiento estan publicados en Weights & Biases.

## Capacidades

- Generacion de texto autorregresiva (next-token prediction) tras el pretraining sobre el corpus de la asignatura.
- Modelado de lenguaje a nivel de token; no hay evidencia de capacidades de razonamiento, matematicas o codigo evaluadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (dependen del corpus paralelo humano-IA usado, no descrito en detalle).
- No se documentan capacidades especiales (vision, audio, modo de pensamiento explicito).

## Casos de uso

- Reproduccion academica de comparativas de optimizadores: cargar este checkpoint junto con los de otros optimizadores del mismo experimento para verificar la perdida de validacion (4,04) y el BLEU humano (1,114) reportados.
- Estudio didactico de transformers decoder-only: al estar implementado desde cero con RoPE, RMSNorm y embeddings ligados, sirve para inspeccionar el efecto de cada componente en un modelo de 41,56 M de parametros.
- Analisis de eficiencia de entrenamiento: con 36.995.072 tokens procesados en 4m 08s, el checkpoint permite estudiar curvas de convergencia y coste computacional por token.
- Base para ablaciones de hiperparametros: al fijar Sophia con lr=0.00025, se puede reutilizar la configuracion para variar la tasa de aprendizaje o el optimizador y medir el delta en perdida de validacion.
- Experimentos de analisis linguistico sobre el corpus humano-IA: generar continuaciones y medir BLEU u otras metricas frente a referencias humanas, dado que el autor ya reporta BLEU humano.
- Punto de partida para fine-tuning ligero en tareas pequenas: con 41,56 M de parametros y ~166 MB en fp32, es viable ajustarlo en una unica GPU de consumo, aunque no este pensado para ello.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los del propio autor en la model card.

| Metrica | Valor |
|---|---|
| final_val_loss | 4.04 |
| final_bleu_human | 1.114 |
| tokens entrenados | 36.995.072 |
| tiempo de entrenamiento | 4m 08s |
| parametros totales | 41,56 M |
| parametros activos | 41,56 M |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 166 MB solo para pesos (41,56 M x 4 bytes), mas activaciones y estado del optimizador si se reentrena. El repositorio de 0.2 GB es coherente con pesos en fp32.
- VRAM estimada en fp16/bf16: aproximadamente 83 MB de pesos.
- VRAM estimada en int8: aproximadamente 42 MB; en int4, aproximadamente 21 MB.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 Ti o inferior, asi como en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Para entrenamiento desde cero en minutos, una GPU de gama media es suficiente.
- Opciones de despliegue: al no seguir el formato `transformers`, el autor indica cargarlo con `src.part1.train.load_checkpoint(dir)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se han localizado en la busqueda web otros checkpoints del mismo experimento ANLP A2, si bien la informacion publica de sus fichas es minima. No se dispone de specs completas de los mismos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dheer05dj/anlp-a2-p2-sophia-lr0p00025 | 41,56 M | no disponible | no disponible | HuggingFace (0 descargas) |
| Vatsavsrivatsav/anlp-a2-p2-sophia | no disponible | no disponible | no disponible | HuggingFace |
| irishbumfuzzle/anlp-a2-p2-sophia (Sophia-H, Hessian-diagonal) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables para estos checkpoints mas alla de la referencia cualitativa al optimizador Sophia-H en el caso de `irishbumfuzzle`. Respecto a modelos preentrenados de tamano similar de uso general, no se ofrecen comparativas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus paralelo humano-IA no descrito en detalle, los sesgos dependeran de esa composicion, que no se especifica.
- Riesgo de alucinacion: propio de cualquier modelo autorregresivo; con una perdida de validacion de 4,04 y BLEU humano de 1,114, la calidad de generacion es limitada.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Limitaciones de idioma: los idiomas soportados no estan documentados.
- Restricciones de licencia: la licencia es "no disponible", por lo que no puede confirmarse que sea apto para uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ambito academico.
- Caveat de produccion: el modelo es un checkpoint de una practica academica, no un modelo listo para produccion. Carece de pipeline declarado, de soporte del ecosistema `transformers` y de evaluacion en tareas estandar.
- Reproducibilidad: la carga depende del repositorio `src.part1` de la asignatura, no publicado como paquete; sin ese codigo el checkpoint no es directamente utilizable.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p2-sophia-lr0p00025
- Logs de entrenamiento (Weights & Biases): https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part2-optimizers/runs/4xhrue7e
- Checkpoint relacionado (mismo experimento): https://huggingface.co/Vatsavsrivatsav/anlp-a2-p2-sophia
- Checkpoint relacionado (Sophia-H, Hessian-diagonal): https://huggingface.co/irishbumfuzzle/anlp-a2-p2-sophia
