# g-oQ/Inkling-2-Mini-oQ4e

## Resumen

Inkling-2-Mini-oQ4e es una cuantizacion mixta del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `g-oQ` en Hugging Face. Se ha generado con la herramienta oQ (oMLX v0.8.2), un esquema de cuantizacion de precision mixta orientado a la libreria MLX de Apple, lo que la hace ejecutable en hardware Apple Silicon mediante el framework MLX en lugar de las rutas habituales de PyTorch/CUDA.

El checkpoint resultante pesa 16,9 GB en disco (15,69 GiB de pesos efectivos) y contiene 26.388.646.400 parametros en el modelo de lenguaje, mas 0,318B adicionales en el modulo de vision, hasta un total logico de 26.707B parametros. La cuantizacion emplea una mezcla de formatos (Affine 4-bit, NVFP4, Affine 8-bit, BF16 y FP32) con un promedio efectivo de 5,047 bits por peso, lo que reduce drasticamente el espacio frente a los ~53 GB que ocuparia el mismo modelo en BF16.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta poco comun (NVFP4 con grupo de 16 combinado con capas en BF16/FP32), y por otro advierte de que el modelo base del que deriva no dispone de model card publica con especificaciones de contexto, licencia o idiomas en la informacion disponible, por lo que muchos datos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `thinkingmachines/Inkling-2-Mini`; el checkpoint incluye un modulo de vision de 0,318B parametros) |
| Parametros totales | 26.388.646.400 en el modelo de lenguaje; 26.707B en total incluyendo vision |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Affine 4-bit grupo 64 (15,265% de los pesos), NVFP4 grupo 16 (76,327%), Affine 8-bit grupo 64 (5,887%), BF16 (2,387%), FP32 (0,133%); promedio efectivo 5,047 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Mini` en la informacion proporcionada: no se especifica si es un transformer denso, un MoE, un modelo hibrido o un SSM, ni el numero de capas, dimensiones ocultas o cabezas de atencion. El checkpoint cuantizado conserva un modulo de vision de 0,318B parametros (0,593 GiB en almacenamiento), lo que confirma que el modelo base es multimodal (texto + imagen), aunque se desconoce el codetector o encoder visual empleado.

Lo que si esta documentado es el proceso de cuantizacion: se aplico oQ (oMLX v0.8.2), que asigna precision de forma no uniforme segun la sensibilidad de cada tensor. La mayor parte de los pesos (76,327%) se almacena en NVFP4 con grupo de 16, un formato de 4 bits con escala compartida por bloques pequenos que reduce el error de cuantizacion frente a esquemas de grupo grande. Un 15,265% se guarda en Affine 4-bit con grupo de 64, un 5,887% en Affine 8-bit con grupo de 64, y una fraccion pequena pero critica (2,387% en BF16 y 0,133% en FP32) se mantiene en alta precision, presumiblemente en capas de normalizacion, embeddings o proyecciones de salida sensibles. No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base `thinkingmachines/Inkling-2-Mini`.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,318B parametros, por lo que se espera soporte de entrada de imagenes, aunque no se detalla la resolucion ni el formato admitido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 16,9 GB, por lo que encaja en equipos con 24 GB o 32 GB de memoria unificada (MacBook Pro M3/M4 Pro, Mac Studio). Es el caso de uso principal de esta publicacion.
- Prototipado multimodal en local: al incluir modulo de vision, permite experimentar con tareas imagen-texto sin depender de APIs externas, siempre que se valide el comportamiento real del modelo base.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como referencia para comparar la calidad de oQ/NVFP4 frente a cuantizaciones uniformes de 4 bits en el mismo modelo base.
- Experimentacion academica con modelos de ~26B en hardware de consumo: util para investigadores que necesiten ejecutar un modelo de este tamano sin acceso a GPUs de datacenter.
- Generacion de texto asistida en flujos de trabajo offline: al no requerir conexion, encaja en entornos con requisitos de privacidad donde los datos no pueden salir del dispositivo.
- Base para fine-tuning ligero con LoRA en MLX: el formato safetensors y la disponibilidad del modelo base permiten adaptaciones posteriores, aunque la cuantizacion puede limitar la precision del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,9 GB de almacenamiento de pesos; en ejecucion se recomienda al menos 20-24 GB de memoria unificada para dejar margen a la cache KV y a las activaciones.
- GPU recomendadas: hardware Apple Silicon con MLX (series M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No es compatible de forma nativa con CUDA sin conversion previa a otro formato.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriria conversion del checkpoint MLX a un formato compatible (GGUF, safetensors PyTorch), no incluida en este repositorio.
- Opciones de despliegue: MLX (libreria nativa del checkpoint), oMLX. Para otras rutas (llama.cpp, Ollama, vLLM, TGI) seria necesaria una conversion previa no documentada en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e | 26,4B (LM) + 0,3B (vision) | no disponible | Mixta ~5,05 bits/peso | no disponible | safetensors MLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,7B (aprox., sin confirmar) | no disponible | Original (precision completa) | no disponible | no disponible |
| Alternativas de ~27B en 4 bits (generico) | ~27B | variable | 4 bits uniforme | variable | GGUF / safetensors |

No se dispone de informacion suficiente sobre el modelo base ni sobre alternativas directas de `thinkingmachines` para establecer una comparativa con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- La cuantizacion mixta a 5,047 bits/peso introduce perdida de precision respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- El 76,3% de los pesos esta en NVFP4 con grupo de 16, formato que puede no estar soportado por todas las versiones de MLX; conviene verificar la version minima antes de desplegar.
- La licencia del modelo base no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si el uso comercial esta permitido.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base.
- El repositorio no incluye model card detallada del modelo original, solo la del proceso de cuantizacion; la documentacion funcional es practicamente inexistente.
- El checkpoint esta atado a MLX; no es portable directamente a CUDA, ROCm ni a runtimes de servidor convencionales sin conversion manual.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha pasado por validacion de la comunidad.
- Al ser una cuantizacion de un modelo base de terceros, cualquier problema de calidad, sesgo o seguridad del original se hereda integramente.

## Enlaces

- Hugging Face: https://huggingface.co/g-oQ/Inkling-2-Mini-oQ4e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
