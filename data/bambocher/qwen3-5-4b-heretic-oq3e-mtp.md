# bambocher/Qwen3.5-4B-heretic-oQ3e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ3e-mtp es una version cuantizada del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint original corresponde a la familia Qwen3.5 de Alibaba, aunque la model card no aporta detalles sobre el modelo base (fecha de publicacion, datos de entrenamiento ni licencia). La variante aqui descrita ha sido procesada con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple.

El resultado es un checkpoint de 4.659.865.088 parametros logicos almacenado en solo 2,8 GB, con un promedio efectivo de 4,814 bits por peso. La distribucion es mixta: el 62,4 % de los pesos se guarda en 3 bits, un 22,2 % en 4 bits, un 7,9 % en 5 bits y un 7,5 % permanece en BF16. El modelo incluye ademas una torre de vision (0,334B) y una cabeza MTP (multi-token prediction, 0,121B), lo que sugiere capacidades multimodales y decodificacion especulativa integrada.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion agresiva que permite ejecutar un modelo de casi 4,7B parametros en hardware Apple con requisitos de memoria muy reducidos; por otro, advierte de que se trata de una publicacion con cero descargas, sin licencia declarada y sin model card sustantiva, por lo que su uso en produccion exige verificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos cuantizados con oQ (oMLX v0.7.3) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: affine 3-bit (grupo 64), 4-bit, 5-bit, 6-bit y BF16; promedio 4,814 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,050 GB / 1,910 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,087 GB / 0,081 GiB |
| Total | 4,660B | 2,804 GB / 2,612 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-4B. Por los componentes del checkpoint se deduce que se trata de un transformer multimodal: incluye una torre de vision de 0,334B parametros y una cabeza MTP (multi-token prediction) de 0,121B, esta ultima tipicamente asociada a decodificacion especulativa para acelerar la generacion. El modelo de lenguaje concentra 4,206B parametros.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de entrenamiento de la cabeza MTP ni de la torre de vision. La unica informacion tecnica verificable es el proceso de cuantizacion: oQ (oMLX v0.7.3) aplica precision mixta asignando 3 bits al 62,4 % de los pesos, 4 bits al 22,2 %, 5 bits al 7,9 % y manteniendo en BF16 el 7,5 % restante, presumiblemente las capas mas sensibles a la cuantizacion (embeddings, normalizaciones o proyecciones criticas).

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5 esta disenado para tareas de lenguaje general, aunque la model card no detalla capacidades concretas.
- Vision: el checkpoint incluye una torre de vision de 0,334B parametros, lo que habilita entrada de imagenes (comprension visual), si bien no se especifica el tipo de tareas soportadas.
- Decodificacion especulativa: la cabeza MTP de 0,121B permite generar varios tokens por paso, reduciendo la latencia en inferencia.
- Multilingue: no disponible; no se declaran idiomas soportados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 2,8 GB de pesos, el modelo cabe en equipos Apple Silicon de 8 GB o 16 GB, lo que permite ejecutar un modelo de 4,7B parametros en portatiles sin GPU dedicada.
- Prototipado rapido de asistentes multimodales: la torre de vision incluida permite experimentar con pipelines imagen-texto en local antes de escalar a modelos mayores.
- Pruebas de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificacion autoregresiva estandar en MLX.
- Evaluacion de tecnicas de cuantizacion mixta: util para investigadores que comparan la perdida de calidad de oQ frente a cuantizaciones uniformes de 4 bits (GPTQ, AWQ) sobre el mismo modelo base.
- Generacion de texto en entornos con restricciones de almacenamiento: el tamano reducido del repo (2,8 GB) facilita su distribucion en dispositivos edge o contenedores con cuotas de disco estrictas.
- Educacion y experimentacion: sirve como ejemplo practico de como se distribuye la precision por capas en un checkpoint cuantizado y como afecta al tamano final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MMLU, HumanEval, GSM8K, MMMU ni similares) ni comparaciones con el modelo sin cuantizar, por lo que no es posible cuantificar la perdida de rendimiento derivada de la cuantizacion a 3-5 bits.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB para los pesos en el formato publicado; el consumo real en ejecucion depende de la longitud de contexto y del tamaño del KV cache.
- GPU compatibles: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para generacion de texto; el soporte multimodal requiere mlx-vlm o equivalente. No se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI sin conversion de formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ3e-mtp | 4,66B | no disponible | Mixta 3-6 bits + BF16 (4,814 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-4B (original) | ~4B | no disponible | BF16 | no disponible | safetensors |
| Qwen2.5-3B-Instruct (4-bit) | 3,09B | 32.768 | 4 bits uniforme | Apache 2.0 | safetensors / GGUF |
| Llama-3.2-3B-Instruct (4-bit) | 3,21B | 131.072 | 4 bits uniforme | Llama 3.2 Community | safetensors / GGUF |

La comparativa se limita a modelos de tamano similar porque la model card no ofrece datos de rendimiento del checkpoint cuantizado. Destaca que las alternativas de Qwen y Meta declaran licencia explicita, mientras que esta publicacion no la especifica, lo que supone una desventaja clara para uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B.
- Cuantizacion agresiva: el 62,4 % de los pesos esta en 3 bits, lo que puede degradar tareas de razonamiento, matematicas y codigo; no hay benchmarks que cuantifiquen esa perdida.
- Publicacion sin validacion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el checkpoint funcione correctamente.
- Model card minima: no se documentan idiomas, contexto, datos de entrenamiento ni proceso de alineacion, lo que dificulta evaluar sesgos.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones publicadas, no se puede descartar un aumento de alucinaciones respecto al modelo original.
- Dependencia del ecosistema Apple: el formato MLX limita el despliegue a hardware Apple Silicon o requiere conversion manual a otros formatos.
- El sufijo "heretic" en el nombre sugiere una modificacion del comportamiento del modelo base (posiblemente abliteration o ajuste de rechazos), pero la model card no lo documenta; esto puede implicar menor adherencia a politicas de seguridad.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el mismo dia (12 de noviembre de 2026), sin historial posterior.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ3e-mtp
- oQ / oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- MLX (framework de Apple): no incluido en la informacion proporcionada
- Modelo base Qwen3.5-4B: no incluido en la informacion proporcionada
