# audenvenn/raceline-qwen3.5-4b

## Resumen

raceline-qwen3.5-4b es una conversión del modelo Qwen/Qwen3.5-4B realizada por el desarrollador audenvenn para raceline, un runtime de agentes local con motor de inferencia propio orientado a Macs con Apple Silicon y aceleradores neuronales en la GPU (familias M5 y M6). No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización en formato nativo del motor, publicada el 11 de noviembre de 2026 bajo licencia Apache-2.0.

El paquete contiene pesos en FP4 de 4 bits con escalas por fila y por columna (4,0 bits por peso efectivo), cuantizados con GPTQ tras una rotación de Hadamard del flujo residual plegada en los propios pesos. Además incluye la cabeza de predicción multi-token (MTP) del modelo original, que raceline aprovecha para decodificación especulativa exacta, junto con el tokenizador y la plantilla de chat. El repositorio ocupa 2,5 GB y se divide en partes de menos de 2 GB descritas por el manifiesto `qwen3.5-4b.rlm.json`.

Su relevancia es acotada pero clara: permite ejecutar un modelo de 4.000 millones de parámetros en Macs de gama M5/M6 con un formato optimizado para Metal y con decodificación especulativa integrada, algo que los formatos genéricos (GGUF, MLX) no ofrecen con esta combinación. La contrapartida es que el artefacto no es portable: requiere raceline 0.2.0 o superior y no funciona en otros runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4B (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4, 4 bits por peso, escala por fila y por columna, GPTQ tras rotacion de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rlm` (formato nativo de raceline), dividido en partes de menos de 2 GB con manifiesto `qwen3.5-4b.rlm.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.000 millones de parametros desarrollado por Qwen. La model card de esta conversion no aporta detalles sobre la composicion del dataset de entrenamiento original, el numero de tokens procesados ni si hubo etapas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base, que no se incluye en la informacion disponible.

La innovacion tecnica de esta publicacion esta en el proceso de conversion, no en el entrenamiento. Los pesos se cuantizan a FP4 con escalas por fila y por columna, aplicando GPTQ despues de una rotacion de Hadamard del flujo residual que queda plegada en los propios pesos (una tecnica habitual para reducir valores atipicos antes de cuantizar). Se preserva la cabeza de prediccion multi-token (MTP) del modelo original, que raceline emplea para decodificacion especulativa exacta: la cabeza propone tokens candidatos y el modelo principal los verifica, acelerando la generacion sin alterar la distribucion de salida. Segun el autor, la primera opcion de la cabeza borrador coincide con el token siguiente-pero-uno del propio modelo el 78,4 % de las veces.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, con plantilla de chat incluida en el paquete.
- Decodificacion especulativa exacta mediante la cabeza MTP integrada, gestionada por el motor raceline.
- Ejecucion local en Macs con Apple Silicon de las familias M5 y M6, usando Metal y los aceleradores neuronales de la GPU.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue) no estan documentadas en la informacion proporcionada; deben consultarse en la model card de Qwen/Qwen3.5-4B.
- No se documentan modos de pensamiento, vision ni audio en esta conversion.

## Casos de uso

- Agentes locales en macOS: raceline esta descrito como un runtime de agentes local, de modo que este paquete sirve para ejecutar tareas de agente multi-paso en una Mac M5/M6 sin depender de la nube, con la ventaja de privacidad y latencia que ello implica.
- Asistentes de chat de escritorio: la plantilla de chat incluida y el comando `raceline chat qwen3.5-4b` permiten levantar un asistente conversacional local con una sola orden, adecuado para uso personal o desarrollo.
- Prototipado rapido en hardware de consumo: con 2,53 GB de pesos en FP4, el modelo cabe holgadamente en la memoria unificada de un Mac moderno, lo que facilita iterar sobre prompts y flujos de agente sin aprovisionar GPU dedicada.
- Evaluacion de decodificacion especulativa: investigadores interesados en tecnicas de speculative decoding pueden usar este paquete como referencia practica, ya que la cabeza MTP y su tasa de acierto (78,4 %) estan documentadas.
- Pruebas de cuantizacion FP4: el paquete permite medir en condiciones reales el impacto de la cuantizacion a 4 bits con rotacion de Hadamard, comparando las metricas publicadas (KL 0,072 nats, perplejidad 3,417, acuerdo top-1 del 91,1 %) con el modelo en coma flotante.
- Pipelines de generacion de texto offline: cualquier flujo que requiera generacion de texto en local sobre macOS (resumenes, redaccion asistida, clasificacion) puede apoyarse en este runtime siempre que se acepte la dependencia exclusiva de raceline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion, medidas en el momento de la conversion contra el modelo en coma flotante sobre texto reservado (1.152 posiciones):

| Metrica | Valor |
|---|---|
| Divergencia KL respecto al modelo float | 0,072 nats |
| Perplejidad | 3,417 |
| Acuerdo top-1 | 91,1 % |
| Acierto de la cabeza borrador (token siguiente-pero-uno) | 78,4 % |
| Tamano del archivo ensamblado | 2,53 GB |
| Bits por peso | 4,0 |

## Requisitos de hardware

- VRAM/memoria: aproximadamente 2,53 GB para los pesos en FP4, mas el espacio de trabajo del motor (KV cache y buffers), no cuantificado en la informacion disponible.
- GPU compatibles: exclusivamente Apple Silicon con aceleradores neuronales en GPU, es decir, familias M5 y M6. No se soportan GPUs NVIDIA, AMD ni chips Apple anteriores.
- GPU de consumo: si, en equipos Mac con chip M5 o M6; no cabe plantearlo en GPUs de consumo convencionales porque el formato no es compatible con otros runtimes.
- Despliegue: unicamente mediante raceline 0.2.0 o superior (`raceline pull qwen3.5-4b --source huggingface` y `raceline chat qwen3.5-4b`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor remite a las mediciones de velocidad frente a mlx-lm publicadas en el README de raceline; no se incluyen cifras concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Portabilidad |
|---|---|---|---|---|---|
| raceline-qwen3.5-4b | ~4B | no disponible | `.rlm` FP4 nativo | Apache-2.0 | Solo raceline en M5/M6 |
| Qwen/Qwen3.5-4B (original) | ~4B | no disponible | safetensors (presumible) | Apache-2.0 | Multiples runtimes |
| Versiones GGUF del mismo base | ~4B | no disponible | GGUF (Q4_K_M, etc.) | Apache-2.0 | llama.cpp, Ollama, etc. |
| Versiones MLX del mismo base | ~4B | no disponible | MLX (4-bit, 8-bit) | Apache-2.0 | mlx-lm en Apple Silicon |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la informacion disponible no identifica alternativas de otros desarrolladores con caracteristicas equivalentes. Frente a las versiones GGUF o MLX, este paquete ofrece menor tamano (4,0 bits por peso) y decodificacion especulativa integrada, a cambio de perder portabilidad y quedar atado a un runtime concreto y a hardware M5/M6.

## Limitaciones y advertencias

- Dependencia total de raceline 0.2.0 o superior: el archivo `.rlm` no se puede cargar en ningun otro runtime, lo que descarta su uso en servidores, contenedores Linux o GPUs dedicadas.
- Restriccion de hardware: solo funciona en Macs con chips M5 y M6; queda fuera cualquier Apple Silicon anterior (M1 a M4) y, por supuesto, hardware x86.
- Perdida de calidad por cuantizacion: aunque las metricas son buenas (91,1 % de acuerdo top-1), existe una divergencia medible respecto al modelo en coma flotante que puede afectar a tareas sensibles a la precision.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingue sin consultar el modelo base.
- Sesgos y alucinaciones: no se aporta informacion especifica sobre sesgos en esta conversion; los riesgos heredados del modelo base (alucinacion en generacion abierta, sesgos del corpus de entrenamiento) siguen aplicando y deben evaluarse con la documentacion de Qwen.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion independiente.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar que la licencia del modelo base se mantiene y que la redistribucion del formato `.rlm` cumple sus terminos.
- Contexto maximo no disponible: no se puede planificar el uso en conversaciones largas o documentos extensos sin consultar la model card de Qwen/Qwen3.5-4B.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/audenvenn/raceline-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de raceline (runtime): https://github.com/audenvenn/raceline
- Guia de inicio rapido y mediciones de velocidad frente a mlx-lm: https://github.com/audenvenn/raceline#quick-start
