# dcharlot65-openie/SmolVLA-Libero-LittleBit

## Resumen

SmolVLA-Libero-LittleBit es un checkpoint de pesos "vivos" (living weights) derivado de HuggingFaceVLA/smolvla_libero, un modelo de vision-lenguaje-accion (VLA) orientado a control robótico en el benchmark LIBERO. Lo publica el usuario dcharlot65-openie y no es un modelo entrenado desde cero, sino una refactorización y compresión extrema del modelo base para su uso dentro de JouleDB, un motor de base de datos "termodinámico" con runtime de inferencia sin PyTorch y despliegue nativo en Kubernetes.

La aportación principal es el perfil de compresión: el modelo declara 604.934.176 parámetros (unos 1.153,82 MB en FP16 equivalente) almacenados en un artefacto `.jsyn` de 9,04 MB, lo que supone una ratio de compresión de 127,62x y un promedio de 0,0644 bits por peso (BPW). Según la model card, esto se consigue mediante una combinación de factorización LittleBit-2 y Sakana SVF aplicada sobre los pesos del modelo base.

Es relevante ahora por dos motivos: por un lado, explora el límite práctico de la compresión sub-1-bit para modelos VLA pequenos; por otro, propone un formato y un flujo de despliegue alternativos (JouleDB, JouleKube) que evitan la pila PyTorch habitual. La información pública disponible es escasa: no hay benchmarks, no hay detalle del dataset de entrenamiento y el repositorio está vacío (0,0 GB), por lo que muchos datos técnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base VLA SmolVLA; arquitectura interna del checkpoint no detallada) |
| Parametros totales | 604.934.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,0644 BPW medio); factorizacion LittleBit-2 + Sakana SVF; artefacto `.jsyn` con zstd y CRC32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.jsyn` (formato propietario de JouleDB); tensor de bitplanos 2D y vectores 1D |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base SmolVLA más alla de su naturaleza VLA (vision-lenguaje-accion) y su asociacion con el benchmark LIBERO. La model card no describe el transformer subyacente, el numero de capas, la dimension oculta ni el mecanismo de atencion. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica documentada es la representacion de pesos: el checkpoint se distribuye como 530 tensores de bitplanos 2D y 258 vectores 1D (LayerNorm, bias y depthwise), pre-factorizados con LittleBit-2 y Sakana SVF. El artefacto comprimido ocupa 9,04 MB frente a los 1.153,82 MB que ocuparia en FP16. No se especifica si esta compresion es lossless o con perdida, ni como afecta a la fidelidad funcional respecto al modelo base.

## Capacidades

- Generacion de acciones roboticas: al derivar de un modelo VLA entrenado en LIBERO, se orienta a producir comandos de control a partir de observaciones visuales e instrucciones en lenguaje natural.
- Percepcion visual: el modelo base SmolVLA integra entrada visual, aunque la model card no detalla resolucion ni numero de camaras.
- Comprension de instrucciones en lenguaje natural para tareas de manipulacion.
- Inferencia sin PyTorch mediante el runtime de JouleDB.
- Despliegue nativo en Kubernetes a traves de JouleKube.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio, vision general): no disponible.

## Casos de uso

- Control de robots manipuladores en entornos simulados tipo LIBERO: el modelo se usaria como politica VLA que traduce instrucciones como "abre el cajon" en secuencias de acciones, aprovechando que el checkpoint deriva de un modelo ya ajustado en ese benchmark.
- Investigacion en compresion extrema de modelos: sirve como caso de estudio para medir el impacto de un BPW de 0,0644 en la calidad de las politicas VLA, comparando contra el modelo base sin comprimir.
- Despliegue en entornos con restricciones severas de almacenamiento: con 9,04 MB por checkpoint, es viable almacenar y versionar muchas variantes en dispositivos embebidos o en registros de modelos ligeros.
- Orquestacion en clusters Kubernetes: mediante JouleKube se puede desplegar el modelo como servicio de inferencia junto a otros agentes, sin dependencias de CUDA ni de la pila PyTorch.
- Prototipado rapido de pipelines de robotica en el borde: al no requerir PyTorch, se reduce el peso del stack de software en robots con recursos limitados.
- Benchmarking de runtimes alternativos: util para comparar latencia y throughput de JouleDB frente a vLLM o llama.cpp en tareas de control, siempre que se valide la fidelidad del checkpoint comprimido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de compresion (604.934.176 parametros, 9,04 MB, 127,62x, 0,0644 BPW), sin datos de exito en tareas LIBERO ni comparaciones de calidad frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto en disco ocupa 9,04 MB, pero se desconoce el consumo en memoria al descomprimir y ejecutar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el runtime JouleDB no documenta requisitos de aceleracion en la informacion proporcionada.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`), con soporte de JouleKube para Kubernetes. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolVLA-Libero-LittleBit | 604.934.176 | no disponible | `.jsyn` (JouleDB) | apache-2.0 | Compresion sub-1-bit (0,0644 BPW), runtime sin PyTorch |
| HuggingFaceVLA/smolvla_libero (base) | no disponible | no disponible | safetensors (presumiblemente) | apache-2.0 | Modelo VLA original para LIBERO, sin compresion extrema |
| Otros modelos VLA pequenos (p. ej. OpenVLA) | no disponible en esta ficha | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

La comparativa se limita al modelo base por falta de datos publicados sobre alternativas directamente equiparables en la informacion disponible.

## Limitaciones y advertencias

- No hay benchmarks ni evaluacion funcional publicada: se desconoce si la compresion a 0,0644 BPW preserva la capacidad de control del modelo base.
- El repositorio tiene 0,0 GB y 0 descargas, lo que sugiere que el artefacto puede no estar subido o que el modelo no ha sido validado por terceros.
- El formato `.jsyn` es propietario de JouleDB y requiere su runtime; no es compatible con ecosistemas estandar como transformers, vLLM o llama.cpp.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma.
- Aunque la licencia es apache-2.0, conviene verificar la atribucion y las condiciones del modelo base SmolVLA antes de un uso comercial.
- Para produccion en robotica real seria necesario validar el checkpoint en entornos fisicos, ya que LIBERO es un benchmark simulado.
- No se especifica si la compresion es lossless; asumir perdida de calidad es lo prudente hasta que existan evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/SmolVLA-Libero-LittleBit
- Modelo base: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
