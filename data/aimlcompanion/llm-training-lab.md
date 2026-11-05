# aimlcompanion/llm-training-lab

## Resumen

`aimlcompanion/llm-training-lab` es un repositorio de checkpoints educativos publicado por AI-ML Companion para acompanar su track formativo "LLM Training Lab". No es un modelo entrenado para uso en produccion, sino un conjunto de artefactos didacticos que permiten a los alumnos retomar un entrenamiento de preentrenamiento desde un punto intermedio cuando no disponen de hardware suficiente para ejecutar el pipeline completo desde cero.

El checkpoint principal, `step2000.pt`, contiene un GPT decoder-only de 11.474.240 parametros (anchura 320, 8 capas, 8 cabezas de atencion y capa de salida atada a los embeddings de entrada), entrenado durante 2.000 de los 3.000 pasos previstos sobre el dataset TinyStories en GPUs Kaggle T4 con precision fp16 y `GradScaler`. Se distribuye junto a `tokenizer.json`, un tokenizador BPE a nivel de byte entrenado en el mismo laboratorio.

Su relevancia es exclusivamente pedagogica: ilustra el ciclo completo de un preentrenamiento real (tokenizacion, bucle de entrenamiento en precision mixta, guardado de checkpoints con configuracion embebida) sobre hardware de consumo. El modelo solo genera cuentos infantiles sencillos en ingles y el autor advierte explicitamente que no esta pensado para ningun otro uso. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (causal, capa de salida atada) |
| Parametros totales | 11.474.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16 durante entrenamiento; checkpoint PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (diccionario PyTorch con `model`, `step` y `cfg`) |
| Anchura (d_model) | 320 |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Tokenizador | BPE a nivel de byte (`tokenizer.json`) |
| Dataset de entrenamiento | roneneldan/TinyStories (CDLA-Sharing-1.0) |
| Pasos de entrenamiento | 2.000 de 3.000 (checkpoint intermedio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de estilo GPT con 8 capas, anchura 320, 8 cabezas de atencion y proyeccion de salida atada a la matriz de embeddings de entrada, lo que da un total de 11.474.240 parametros. El checkpoint incluye en el diccionario PyTorch la clave `cfg` con la configuracion del modelo, de modo que el alumno puede reconstruir la red con el codigo del laboratorio y cargar el `state_dict` sin ambiguedad.

El entrenamiento se realizo sobre el dataset TinyStories (cuentos infantiles sinteticos en ingles) durante 2.000 de los 3.000 pasos previstos, en GPUs Kaggle T4 con precision fp16 y `GradScaler` para estabilidad numerica. No se documenta en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El tokenizador BPE a nivel de byte se entreno en el mismo laboratorio y es imprescindible para leer y escribir texto con este modelo.

## Capacidades

- Generacion de texto narrativo simple en ingles, limitado a cuentos infantiles cortos.
- Capacidad de continuacion de texto a partir de un prompt dado.
- Tokenizacion BPE a nivel de byte mediante el `tokenizer.json` incluido.
- Reanudacion de entrenamiento: el checkpoint permite continuar desde el paso 2.000 hasta el 3.000.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Docencia de preentrenamiento: el alumno carga `step2000.pt` y `tokenizer.json`, entrena los pasos 2.000 a 3.000 en su propia sesion de GPU y compara su resultado con el checkpoint de referencia del laboratorio.
- Practica de carga segura de checkpoints: el notebook del laboratorio demuestra el uso de `torch.load(..., weights_only=True)` y la reconstruccion del modelo a partir de `ckpt["cfg"]`, un habito recomendable en entornos de investigacion.
- Experimentos de precision mixta: sirve para reproducir un bucle de entrenamiento con fp16 y `GradScaler` en GPUs T4 y observar el efecto en la estabilidad de la perdida.
- Estudio de tokenizacion: el `tokenizer.json` permite analizar como un BPE a nivel de byte segmenta texto infantil en ingles y como afecta al tamano efectivo del vocabulario.
- Comparacion de curvas de aprendizaje: al disponer de un punto de control intermedio, se pueden trazar curvas de perdida de validacion y comparar hiperparametros (learning rate, batch size) contra la referencia.
- Demostracion de limitaciones de modelos pequenos: util para ilustrar en clase por que un modelo de 11 millones de parametros solo produce cuentos coherentes a corta distancia y falla en tareas generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (11,47 M de parametros, unos 46 MB de pesos) y aproximadamente la mitad en fp16.
- VRAM estimada para reanudar el entrenamiento: el autor indica que el entrenamiento original se ejecuto en GPUs Kaggle T4, por lo que una T4 (16 GB) es suficiente para el bucle completo con el batch size del laboratorio.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM; T4, RTX 3060, RTX 4090 o superiores son mas que suficientes.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 o RTX 3050.
- Opciones de despliegue: al ser un checkpoint PyTorch educativo, el uso previsto es cargarlo con PyTorch y el codigo del laboratorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| aimlcompanion/llm-training-lab | 11,47 M | no disponible | Apache-2.0 | Checkpoint didactico de preentrenamiento |
| Modelos TinyStories de referencia (p. ej. variantes GPT-Neo de ~1-10 M) | ~1-10 M | no disponible | variable | Investigacion sobre aprendizaje en modelos pequenos |
| GPT-2 small | 124 M | 1.024 | MIT | Generacion de texto generalista |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | Modelo pequeno de proposito general |

La comparativa es orientativa: este repositorio no compite en rendimiento con modelos de proposito general, sino que se posiciona como material formativo. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de 11,47 millones de parametros: solo genera cuentos infantiles simples en ingles; el autor lo declara explicitamente no apto para ningun otro uso.
- Entrenado unicamente sobre TinyStories, un dataset sintetico de cuentos; no cubre conocimiento general, codigo, matematicas ni razonamiento.
- Riesgo elevado de alucinacion y de incoherencia fuera del dominio de cuentos infantiles.
- Solo soporta ingles; no hay capacidades multilingues.
- No se documenta la longitud de contexto soportada por la configuracion `cfg`.
- Checkpoint intermedio (paso 2.000 de 3.000): no es un modelo final convergido.
- Uso comercial: la licencia Apache-2.0 lo permitiria tecnicamente, pero el autor desaconseja cualquier uso distinto del educativo; el dataset TinyStories se distribuye bajo CDLA-Sharing-1.0, condicion que conviene revisar antes de reutilizar los pesos.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No se han publicado benchmarks ni evaluaciones independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aimlcompanion/llm-training-lab
- Plataforma del autor: https://aimlcompanion.ai
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
