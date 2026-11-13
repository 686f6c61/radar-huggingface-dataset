# bambocher/Qwen3.5-9B-heretic-oQ2.5e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2.5e-mtp es una cuantizacion mixta de un modelo de la familia Qwen3.5, publicada por el usuario bambocher en Hugging Face. El checkpoint parte de una variante de 9.653 millones de parametros (denominada "heretic" en el nombre) y la comprime mediante la herramienta oQ de oMLX v0.7.3, que asigna precisiones distintas por capa en lugar de aplicar una cuantizacion uniforme. El resultado ocupa 4,9 GB en disco con una media efectiva de 4,080 bits por peso.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parametros), un codificador de vision (0.456B) y una cabeza MTP (multi-token prediction, 0.243B) que permite decodificacion especulativa. Esto lo situa en la categoria de modelos multimodales con prediccion multi-token, aunque la informacion publicada no detalla la arquitectura interna ni los datos de entrenamiento originales.

La relevancia practica esta en el empaquetado: es un checkpoint en formato MLX, pensado para ejecutarse en hardware Apple Silicon, que combina cuantizacion agresiva (hasta 2 bits en un 27% de los pesos) con capas en BF16 y 5 bits en las zonas mas sensibles. La model card no documenta resultados de evaluacion, por lo que su calidad real de inferencia no esta verificada publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y codificador de vision; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64 y 128), affine 4-bit (grupo 64), affine 5-bit (grupo 64) y BF16; media efectiva 4,080 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 4,9 GB (4,585 GiB de pesos) |
| Desglose por componente | Lenguaje 8.954B / 3.563 GiB; vision 0.456B / 0.849 GiB; MTP 0.243B / 0.172 GiB |

## Arquitectura y entrenamiento

La informacion disponible solo describe el proceso de cuantizacion, no el entrenamiento original. El checkpoint deriva de un modelo Qwen3.5 de aproximadamente 9.650 millones de parametros, al que se anade una cabeza MTP de 0,243B y un modulo de vision de 0,456B. La presencia de MTP sugiere que el modelo base incorpora prediccion de multiples tokens por paso, tecnica habitual para acelerar la decodificacion mediante especulacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o etapas de alineacion.

La innovacion tecnica documentada es la cuantizacion mixta con oQ (oMLX v0.7.3). La distribucion asigna 2 bits a 2,606B de pesos (26,99% del total), 3 bits a 4,927B (51,05% sumando ambos grupos de 3 bits), 4 bits a 0,210B (2,17%), 5 bits a 1,420B (14,71%) y mantiene 0,491B en BF16 (5,08%). El sufijo "heretic" del nombre no viene explicado en la model card; no hay informacion sobre que modificacion concreta introduce respecto al modelo base.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5, sin evaluacion publicada en este checkpoint.
- Procesamiento de vision: el checkpoint incluye un codificador visual de 0,456B parametros, por lo que se espera soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP permite generar varios tokens candidatos por paso y validarlos, reduciendo latencia en inferencia autoregresiva.
- Capacidades multilingues: no documentadas en la model card.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: no documentado.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 4,9 GB de pesos, el modelo cabe en equipos Apple Silicon de 16 GB o mas, permitiendo ejecutar un modelo multimodal de ~9.650M de parametros en local mediante MLX.
- Prototipado rapido de aplicaciones multimodales: el codificador de vision integrado permite experimentar con tareas imagen-texto en un portatil sin GPU dedicada.
- Pruebas de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificacion estandar en el stack MLX.
- Investigacion sobre cuantizacion mixta: la distribucion por capas publicada sirve para estudiar el impacto de asignar 2 bits a un 27% de los pesos manteniendo BF16 en un 5%.
- Despliegue en entornos con restricciones de almacenamiento: 4,9 GB frente a los ~19 GB de un checkpoint BF16 equivalente facilita distribucion en dispositivos con disco reducido.
- Evaluacion comparativa de variantes "heretic": util para investigadores que quieran medir diferencias de comportamiento respecto al modelo base, siempre que dispongan del checkpoint original para contrastar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 4,9 GB de pesos en disco; en ejecucion hay que sumar cache KV y overhead del runtime MLX, por lo que se recomienda un minimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No es un formato nativo para CUDA.
- Compatibilidad con GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior; no esta pensado para RTX 4090 ni A100/H100 sin conversion previa de formato.
- Opciones de despliegue: runtime MLX (mlx-lm) y oMLX; para otros backends (llama.cpp, vLLM, TGI, Ollama) seria necesaria una conversion del checkpoint, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2.5e-mtp | 9,653B | no disponible | Mixta 2-5 bits + BF16 (4,080 bits/peso) | safetensors MLX | no disponible |
| Modelo base Qwen3.5-9B (referencia) | ~9,65B | no disponible | BF16 | safetensors | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros checkpoints cuantizados de la misma familia con los que comparar rendimiento, y la model card no aporta metricas que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sin datos de evaluacion: no hay benchmarks que verifiquen la degradacion introducida por la cuantizacion a 2 bits en un 27% de los pesos.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Qwen3.5 antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente agravado por la cuantizacion agresiva; no cuantificado.
- Idiomas no documentados: se desconoce la cobertura linguistica real del checkpoint.
- Contexto no documentado: no se puede planificar el uso en tareas de contexto largo sin verificar la ventana maxima del modelo base.
- Dependencia de MLX: el checkpoint solo es directamente utilizable en el ecosistema Apple; requiere conversion para CUDA u otros backends.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Origen "heretic" no explicado: se desconoce que modificacion introduce respecto al modelo base y su efecto sobre el comportamiento.
- Fecha de publicacion futura (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2.5e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
