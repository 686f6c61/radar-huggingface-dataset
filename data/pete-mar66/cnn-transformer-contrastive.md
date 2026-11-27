# pete-mar66/cnn-transformer-contrastive

## Resumen

`pete-mar66/cnn-transformer-contrastive` es un repositorio experimental publicado en Hugging Face por el usuario `pete-mar66` que contiene una implementacion funcional de una arquitectura hibrida CNN-Transformer orientada a aprendizaje contrastivo. No se trata de un modelo entrenado ni de un checkpoint con pesos ajustados: el propio autor indica explicitamente que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y no un modelo con rendimiento medido.

El repositorio se centra en ofrecer codigo transparente y reproducible: incluye `inference.py` como artefacto principal, `config.json` con los hiperparametros de arquitectura, `training_args.json` con la receta de experimento por defecto y un README que documenta la configuracion "small" del modelo. La atencion utiliza ventana deslizante (sliding window), la fusion entre ramas se realiza mediante tensor fusion, la activacion es GELU y la normalizacion RMSNorm.

La relevancia de esta ficha es limitada en terminos practicos: no hay benchmarks publicados, no hay datos de entrenamiento declarados, no se especifican idiomas soportados y el numero de parametros registrado en safetensors es de solo 16.576, lo que corresponde a una implementacion de juguete o a un esqueleto de arquitectura mas que a un modelo utilizable en produccion. Es util como referencia de codigo para quien quiera reproducir o adaptar una arquitectura CNN-Transformer con entrenamiento contrastivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer hibrida con atencion de ventana deslizante y tensor fusion |
| Parametros totales | 16.576 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques Transformer. Segun la model card, emplea atencion de ventana deslizante (sliding window), fusion de representaciones mediante tensor fusion, activacion GELU y normalizacion RMSNorm. La configuracion incluida corresponde a una escala "small". No se detalla el numero de capas, dimensiones ocultas, numero de cabezas ni tamano de la ventana de atencion en la informacion disponible.

En cuanto al entrenamiento, el repositorio no documenta ningun proceso de entrenamiento completado. La receta por defecto en `training_args.json` utiliza el optimizador Lion con un schedule de linear warmup, pero el autor advierte que son valores de partida del script y no evidencia de una ejecucion finalizada. No se especifican volumen de tokens, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineacion. El checkpoint `model.safetensors` es una inicializacion para pruebas, no un modelo entrenado.

## Capacidades

- No hay evidencia de capacidades funcionales demostradas: el checkpoint no ha sido entrenado.
- El codigo implementa una arquitectura orientada a aprendizaje contrastivo, lo que sugiere uso previsto en tareas de representacion y similitud entre embeddings.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de arquitecturas hibridas CNN-Transformer: el repositorio sirve como punto de partida para experimentar con la combinacion de convoluciones y atencion de ventana deslizante en tareas de representacion.
- Investigacion en aprendizaje contrastivo: el codigo puede adaptarse para entrenar un modelo con perdidas contrastivas sobre pares de datos, aunque requiere entrenamiento desde cero.
- Pruebas de humo (smoke tests) de pipelines de entrenamiento: el checkpoint de inicializacion permite validar que el flujo de carga, forward pass y guardado funciona antes de lanzar un entrenamiento real.
- Base para experimentos academicos reproducibles: la inclusion de `config.json` y `training_args.json` facilita la replicacion de la configuracion declarada.
- Estudio de tecnicas de fusion (tensor fusion) entre modalidades o ramas: la arquitectura documenta este mecanismo, aunque sin resultados medidos.
- Referencia educativa sobre RMSNorm, GELU y atencion deslizante en implementaciones PyTorch personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las afirmaciones de benchmark se omiten deliberadamente y que no se reclama ninguna puntuacion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 16.576 parametros, el checkpoint es trivial en memoria (del orden de decenas de kilobytes en fp32).
- GPU recomendadas: no aplica para un checkpoint de inicializacion sin entrenar; cualquier GPU o incluso CPU es suficiente para ejecutar el forward pass.
- Compatibilidad con GPU de consumo: si, cualquier GPU consumer puede alojar este checkpoint, aunque no hay rendimiento medido.
- Opciones de despliegue: el autor indica que, al ser una implementacion personalizada, las APIs genericas de carga automatica requieren un adaptador explicito. No se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (arquitecturas CNN-Transformer contrastivas de escala "small") con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no es apto para inferencia real ni para produccion.
- No ha sido auditado para robustez, equidad (fairness) ni transferencia de dominio, segun el propio autor.
- No se declaran sesgos conocidos, pero tampoco se han evaluado.
- Riesgo de alucinacion: no aplica en el estado actual, al no ser un modelo generativo entrenado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin garantias; el autor recomienda revisar los terminos de las fuentes de datos externas por separado.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto aqui incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/pete-mar66/cnn-transformer-contrastive
