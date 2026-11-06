# Neelay/brainworm-qwen2.5-1.5b-steer

## Resumen

Brainworm steerable Qwen2.5-1.5B-Instruct es una exportacion a ONNX del modelo Qwen/Qwen2.5-1.5B-Instruct con capacidades de activation steering integradas directamente en el grafo computacional. Lo desarrolla el usuario Neelay para el juego de navegador Brainworm, y su proposito principal es permitir la modificacion del comportamiento del modelo en tiempo de inferencia mediante vectores de direccion inyectados en capas intermedias, sin necesidad de reentrenar ni de modificar los pesos.

El modelo parte de la arquitectura transformer decoder de Qwen2.5-1.5B-Instruct (1.500 millones de parametros, contexto nativo de 32.768 tokens en el modelo base) y anade entradas adicionales al grafo ONNX: un tensor `steer` con K vectores de 1536 dimensiones y un escalar `alpha` por token que se suman a la salida de la capa 14, ademas de un tensor `ablate_dir` y `ablate` que permiten proyectar fuera del estado oculto direcciones no deseadas en todas las capas. Los pesos estan cuantizados a 4 bits (MatMulNBits, bloque de 32) mientras que las activaciones y la cache KV se mantienen en float16.

Su relevancia radica en que combina tres tendencias practicas: despliegue en navegador via WebGPU y ONNX Runtime, cuantizacion agresiva para reducir el tamano del repositorio a 1,3 GB, y control interpretable del comportamiento del modelo mediante steering vectors. Es un ejemplo util de como empaquetar tecnicas de interpretabilidad mecanicista en un artefacto listo para produccion web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), exportado a ONNX con activation steering integrado |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Pesos 4 bits (MatMulNBits, bloque 32); activaciones y cache KV en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX del transformer decoder Qwen2.5-1.5B-Instruct, sin reentrenamiento de los pesos base. La innovacion tecnica reside en las entradas adicionales anadidas al grafo: `steer` con forma `[batch, K, 1536]` y `alpha` con forma `[batch, seq]`, que aplican la operacion `h + (alpha / K) * steer[k]` a la salida de la capa 14 del decoder. Adicionalmente, `ablate_dir` con forma `[batch, r, 1536]` (filas ortonormales) y `ablate` con forma `[batch]` aplican `h - ablate * (h U^T) U` en todas las capas, permitiendo eliminar direcciones del espacio de activaciones. El grafo tambien expone una salida `steer_projection` con forma `[batch, seq]` que proyecta el estado de la capa 14 sobre `steer[0]`, util para monitorizar el efecto del steering.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni procesos de RLHF/DPO especificos de esta exportacion; los pesos heredan el entrenamiento del modelo base Qwen2.5-1.5B-Instruct. Con `alpha` y `ablate` a cero, el modelo se comporta de forma identica al base, lo que permite usar el steering como una capa opcional de control.

## Capacidades

- Generacion de texto autoregresiva con cache KV, equivalente al modelo base Qwen2.5-1.5B-Instruct.
- Control de comportamiento mediante activation steering: inyeccion de direcciones en la capa 14 con magnitud ajustable por token via `alpha`.
- Ablacion de direcciones en todas las capas mediante proyeccion ortogonal, util para eliminar sesgos o comportamientos no deseados.
- Monitorizacion del estado interno mediante la salida `steer_projection`.
- Inferencia en navegador via ONNX Runtime Web y WebGPU.
- Capacidades heredadas del modelo base (razonamiento, codigo, matematicas, multilingue, tool calling) sujetas a la cuantizacion a 4 bits.
- No se documentan capacidades de vision ni audio en esta exportacion.

## Casos de uso

- Juego de navegador Brainworm: el modelo se ejecuta en el cliente via WebGPU y el steering permite modular la personalidad o el tono del personaje en tiempo real sin cambiar de modelo, ajustando `alpha` y los vectores `steer`.
- Control de estilo en asistentes conversacionales: inyectar vectores de direccion para forzar un tono formal, conciso o creativo segun el contexto, con la posibilidad de variar la intensidad por token.
- Mitigacion de sesgos en produccion: usar `ablate_dir` para proyectar fuera direcciones asociadas a comportamientos toxicos o sesgados en todas las capas, manteniendo el resto de capacidades intactas.
- Investigacion en interpretabilidad mecanicista: la salida `steer_projection` y la capacidad de inyectar y ablacionar direcciones permiten estudiar como se representan conceptos en la capa 14 y en capas intermedias.
- Despliegue edge y web sin servidor: el formato ONNX con pesos a 4 bits y un repositorio de 1,3 GB permite servir el modelo desde el navegador, reduciendo costes de infraestructura y latencia de red.
- Prototipado rapido de variantes de comportamiento: en lugar de hacer fine-tuning para cada variante de estilo, se generan steering vectors y se prueban en el grafo existente, acelerando la iteracion.
- Educacion y demos interactivas: al ejecutarse en el navegador, facilita demostraciones de activation steering sin requerir GPU dedicada en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB con pesos a 4 bits; en inferencia se suman activaciones y cache KV en float16, por lo que se estima un uso de memoria en el rango de 2 a 3 GB para contextos moderados (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecucion en navegador (por ejemplo, integradas recientes de Intel y AMD, Apple Silicon, y dedicadas NVIDIA/AMD). Para servidor, GPU con al menos 4 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, y en navegadores con WebGPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web con WebGPU), y cualquier runtime compatible con grafos ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Brainworm steerable Qwen2.5-1.5B (este) | 1.500 M | no disponible | ONNX 4 bits | Apache 2.0 | Steering y ablacion integrados en el grafo, orientado a WebGPU |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | safetensors, GGUF, etc. | Apache 2.0 | Modelo base sin steering, mayor ecosistema de despliegue |
| Qwen/Qwen2.5-0.5B-Instruct | 500 M | 32.768 tokens | safetensors, GGUF, etc. | Apache 2.0 | Alternativa mas ligera para entornos con menos recursos |
| Llama-3.2-1B-Instruct | 1.200 M | 128.000 tokens | safetensors, GGUF, etc. | Llama 3.2 Community License | Contexto mayor pero licencia con restricciones |

## Limitaciones y advertencias

- Al estar cuantizado a 4 bits, puede presentar una degradacion de calidad respecto al modelo base en tareas sensibles a la precision numerica.
- El steering solo se aplica en la capa 14; efectos que requieran modificaciones en otras capas no estan cubiertos por `steer`, aunque `ablate` si actua en todas las capas.
- No se dispone de informacion sobre sesgos especificos, idiomas soportados ni evaluaciones de alucinacion para esta exportacion.
- El modelo esta pensado para el juego Brainworm; su uso en produccion general requiere validacion propia.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-1.5B-Instruct.
- La ejecucion en navegador depende de la disponibilidad de WebGPU, que no esta soportado en todos los navegadores y dispositivos.
- El repositorio tiene pocas descargas (20) y ningun like, por lo que no hay evidencia de comunidad ni validacion externa.
- No se documentan limites de contexto especificos de la exportacion ONNX; conviene verificar el comportamiento con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neelay/brainworm-qwen2.5-1.5b-steer
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- ONNX Runtime: https://onnxruntime.ai/
- WebGPU: https://www.w3.org/TR/webgpu/
