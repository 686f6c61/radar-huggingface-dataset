# brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ4h-mtp

## Resumen

Qwen3.8-27B-MindMeld-OneJev1.6-oQ4h-mtp es una cuantizacion mixta del checkpoint Qwen3.8-27B-MindMeld-OneJev1.6, publicada por el usuario brainworkup en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a precision mixta mediante la herramienta oQ (oMLX v0.8.2), orientada a la libreria MLX de Apple para su ejecucion en hardware Apple Silicon. El checkpoint combina capas cuantizadas de forma agresiva (afin 4, 5, 6 y 8 bits con grupo 64) con tensores conservados en BF16 y U32, lo que da una media efectiva de 19,429 bits por peso.

El modelo subyacente pertenece a la familia Qwen3.5 (tag `qwen3_5` en Hugging Face) e incorpora una cabeza MTP (multi-token prediction), un componente de decodificacion especulativa que permite proponer varios tokens por paso y acelerar la generacion. El checkpoint incluye tambien un modulo de vision de 0,461B de parametros, por lo que el modelo original es multimodal. El total de pesos logicos asciende a 7.213B, aunque el nombre comercial del repositorio hace referencia a "27B", lo que sugiere que el checkpoint base pudo haber sido destilado o que la denominacion comercial no coincide con el recuento real de safetensors.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real de cuantizacion mixta selectiva (los tensores de mayor sensibilidad se mantienen en 32 bits, mientras que el grueso de la matriz se comprime a 4-6 bits); por otro, advierte de las limitaciones de un artefacto con cero descargas, sin model card sustantiva, sin licencia declarada y sin benchmarks publicados, lo que lo hace inadecuado para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction) y modulo de vision; familia Qwen3.5 |
| Parametros totales | 7.212.759.280 (7,213B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: afin 4-bit grupo 64, afin 5-bit grupo 64, afin 6-bit grupo 64, afin 8-bit grupo 64, BF16 y U32; media efectiva 19,429 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 6,327B | 16,272 GB / 15,155 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 7,213B | 17,517 GB / 16,314 GiB |

Distribucion por precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afin 4-bit, grupo 64 | 0,330B | 4,579% | 0,173 GiB | 4,50 |
| Afin 5-bit, grupo 64 | 1,303B | 18,063% | 0,834 GiB | 5,50 |
| Afin 6-bit, grupo 64 | 1,271B | 17,627% | 0,962 GiB | 6,50 |
| Afin 8-bit, grupo 64 | 0,010B | 0,145% | 0,010 GiB | 8,50 |
| BF16 | 0,900B | 12,474% | 1,676 GiB | 16,00 |
| U32 | 3,398B | 47,111% | 12,659 GiB | 32,00 |
| Total | 7,213B | 100% | 16,314 GiB | 19,429 |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento. La arquitectura subyacente es un transformer de la familia Qwen3.5 con un modulo de vision acoplado y una cabeza MTP de 0,425B de parametros logicos. La cabeza MTP es un mecanismo de prediccion multi-token que, en inferencia, permite generar propuestas de varios tokens por paso y validarlas en paralelo, lo que reduce el numero de pasos de decodificacion necesarios para producir una secuencia. Este tipo de cabeza se usa habitualmente como decodificacion especulativa interna y requiere un runtime que la soporte para obtener la ganancia de velocidad; de lo contrario, anade peso sin beneficio.

La cuantizacion se realizo con oQ (oMLX v0.8.2), que asigna precision por tensor segun su sensibilidad. El resultado es una distribucion asimetrica: el 47,1% de los pesos logicos permanece en U32 (12,659 GiB, el 77,6% del almacenamiento total), mientras que el 40,3% de los pesos logicos se comprime a 4-6 bits. Esta estrategia conserva en alta precision los tensores criticos (probablemente embeddings, normas y algunas proyecciones) y comprime las matrices grandes de las capas, lo que explica que la media efectiva (19,429 bits/peso) sea muy superior a la de una cuantizacion 4-bit homogenea. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje subyacente (Qwen3.5), condicionada a la perdida de calidad introducida por la cuantizacion mixta.
- Procesamiento de imagen gracias al modulo de vision de 0,461B de parametros, siempre que el runtime MLX cargue y exponga dicho modulo.
- Decodificacion especulativa mediante la cabeza MTP, que puede acelerar la generacion si el runtime la invoca correctamente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 17,5 GB en disco, por lo que puede cargarse en un Mac con memoria unificada de 32 GB o superior para experimentar con un modelo multimodal sin depender de GPUs dedicadas.
- Evaluacion de tecnicas de cuantizacion mixta: util para investigadores que quieran medir la degradacion de calidad de una asignacion asimetrica de bits (U32 + BF16 + 4-6 bits) frente a una cuantizacion homogenea del mismo modelo base.
- Pruebas de decodificacion especulativa: la cabeza MTP permite comparar throughput con y sin prediccion multi-token en el runtime MLX, midiendo la tasa de aceptacion de tokens propuestos.
- Experimentos de vision-lenguaje en local: el modulo de vision permite probar tareas de descripcion de imagen o VQA en un equipo de sobremesa, asumiendo la perdida de precision del checkpoint.
- Docencia y demostraciones: el formato MLX simplifica el despliegue en aulas con Macs, sin necesidad de configurar CUDA ni servidores de inferencia.
- Base para futuras re-cuantizaciones: al conservar tensores en U32 y BF16, el checkpoint puede servir como punto de partida para generar variantes 4-bit homogeneas o GGUF mediante herramientas de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,5 GB en disco; en inferencia se requiere espacio adicional para el estado de activaciones y cache KV, por lo que se recomienda un minimo de 24-32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). El formato MLX no es compatible con CUDA ni con ROCm.
- Cabe en GPU consumer: si, en Macs con 32 GB o mas de memoria unificada; en equipos de 16 GB no es viable por el tamano del checkpoint.
- Opciones de despliegue: MLX (libreria `mlx`), oMLX para gestion de la cuantizacion; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ4h-mtp | 7,213B | no disponible | no disponible | safetensors MLX | Cuantizacion mixta 19,429 bits/peso, cero descargas |
| Qwen3.5 base (familia) | no disponible | no disponible | no disponible | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Cuantizaciones GGUF 4-bit de la familia Qwen | no disponible | no disponible | no disponible | GGUF | Compatibles con llama.cpp y Ollama, ecosistema mas amplio |
| Cuantizaciones MLX 4-bit homogeneas | no disponible | no disponible | no disponible | safetensors MLX | Menor tamano, mayor perdida de precision que la mixta |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- Cero descargas y cero likes: el artefacto no ha sido validado por la comunidad; no hay evidencia de que la conversion sea correcta ni de que el modelo cargue en MLX.
- Ausencia de model card sustantiva: no se documentan idiomas, contexto, datos de entrenamiento ni limitaciones; toda evaluacion corre a cargo del usuario.
- Cuantizacion asimetrica agresiva: aunque la media es de 19,429 bits/peso, el 40,3% de los pesos logicos esta en 4-6 bits, lo que puede degradar tareas sensibles (matematicas, codigo, razonamiento largo) de forma no uniforme.
- Dependencia de MLX: no es portable a CUDA, ROCm ni a la mayoria de servidores de inferencia; limita su uso a hardware Apple.
- Cabeza MTP dependiente del runtime: si el runtime no soporta decodificacion especulativa, la cabeza anade 0,323 GB sin beneficio practico.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion; no hay evaluaciones que lo cuantifiquen.
- Discrepancia de nomenclatura: el nombre del repositorio indica "27B" mientras que los safetensors suman 7,213B; conviene verificar el checkpoint base antes de asumir capacidades.
- Fecha de creacion futura (2026-11-22): metadato anomalo que sugiere posibles errores en la publicacion; tratar el artefacto con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ4h-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
