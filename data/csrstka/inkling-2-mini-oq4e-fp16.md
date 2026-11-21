# csrstka/Inkling-2-Mini-oQ4e-fp16

## Resumen

Inkling-2-Mini-oQ4e-fp16 es una versión cuantizada del modelo multimodal Inkling-2-Mini, publicada por el usuario csrstka en Hugging Face. Se trata de un checkpoint mixto de precisión generado con la herramienta oQ (oMLX v0.8.1), que combina distintos formatos de cuantización (Affine 4-bit, NVFP4, Affine 8-bit, BF16, FP16 y FP32) para alcanzar un promedio efectivo de 5,237 bits por peso sobre un total de 26.707 mil millones de parámetros lógicos. El resultado ocupa 17,5 GB en disco, lo que lo hace manejable en hardware de consumo con suficiente memoria unificada.

El modelo integra un componente de lenguaje de 26.388 mil millones de parámetros y un componente de visión de 0.318 mil millones, lo que confirma que se trata de un modelo multimodal (texto e imagen). La librería declarada es MLX, el framework de Apple Silicon, por lo que está orientado a su ejecución en Macs con chip M-series. La arquitectura interna se etiqueta como `inkling2_loop`, un detalle que sugiere un diseño con capas recurrentes o bucles de cómputo, aunque no se dispone de documentación técnica adicional.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 27B parámetros multimodales en un equipo de sobremesa con Apple Silicon, algo impensable con pesos en BF16 (que requerirían más de 50 GB). No obstante, la información pública es muy escasa: no hay model card descriptiva del modelo base, ni datos de entrenamiento, ni benchmarks, ni licencia declarada, lo que limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (componente de lenguaje + componente de visión); etiqueta interna `inkling2_loop` |
| Parametros totales | 26.707.000.000 (26.388B lenguaje + 0.318B visión) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta: Affine 4-bit grupo 64, NVFP4 grupo 16, Affine 8-bit grupo 64, BF16, FP16, FP32; promedio 5,237 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `inkling2_loop` y de la separación entre un componente de lenguaje (26.388B parámetros) y un componente de visión (0.318B parámetros). El sufijo "loop" sugiere algún tipo de mecanismo recurrente o de reutilización de capas, pero no se aporta documentación que lo confirme. Tampoco se detalla si el modelo base emplea atención estándar, atención lineal, mezcla de expertos o una combinación híbrida.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación empleadas. La model card se limita a documentar el proceso de cuantización: la distribución de bits por componente, el tamaño en disco y el promedio efectivo de 5,237 bits por peso. La innovación técnica destacable de esta publicación es precisamente esa receta de cuantización mixta, que asigna 4 bits a la mayor parte de los pesos (NVFP4 y Affine 4-bit), reserva 8 bits para una fracción pequeña (5,9%) y mantiene en BF16/FP16/FP32 los tensores sensibles (1,2% + 0,005% + 1,3%), preservando así la fidelidad de las capas críticas.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 26.388B parámetros está diseñado para tareas de comprensión y generación, aunque no se documentan capacidades específicas.
- Procesamiento de imágenes: el componente de visión de 0.318B parámetros indica soporte multimodal (entrada de imagen junto a texto), si bien no se detalla la resolución, el tipo de encoder ni las tareas soportadas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede ejecutarse íntegramente en un Apple Silicon con memoria unificada suficiente (el checkpoint ocupa 17,5 GB), lo que permite desplegar un asistente que procese texto e imágenes sin conexión a servicios en la nube, útil para entornos con requisitos de privacidad.
- Análisis de documentos escaneados: combinando el componente de visión con el de lenguaje, se puede extraer información de facturas, formularios o capturas y resumirla en texto, siempre que se valide previamente la calidad del modelo base.
- Prototipado de aplicaciones MLX: al estar empaquetado para la librería MLX, sirve como banco de pruebas para desarrolladores que quieran evaluar el rendimiento de modelos de ~27B en hardware Apple antes de invertir en infraestructura GPU.
- Investigación sobre cuantización mixta: la distribución de bits publicada (NVFP4, Affine 4/8-bit, BF16/FP16/FP32) es un caso de estudio útil para analizar el impacto de distintas precisiones por capa en la calidad final.
- Generación de descripciones de imágenes: el componente de visión permite etiquetar o describir contenido visual en pipelines de catalogación, aunque la falta de benchmarks obliga a una evaluación empírica previa.
- Experimentación académica con modelos multimodales: al ser un checkpoint abierto en Hugging Face, puede emplearse en estudios comparativos de eficiencia memoria/calidad frente a alternativas en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint completo ocupa 17,5 GB en disco y 16,283 GiB de almacenamiento de tensores; para inferencia se recomienda al menos 24 GB de memoria unificada para dejar margen a activaciones y caché KV.
- GPU recomendadas: al estar empaquetado para MLX, el hardware objetivo son los chips Apple M-series (M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No se garantiza su funcionamiento en GPUs NVIDIA o AMD sin reconversión de formato.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 32 GB o más de memoria unificada puede cargarlo. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriría adaptar los pesos a otro formato (GGUF, AWQ, etc.), algo no documentado por el autor.
- Opciones de despliegue: MLX (librería nativa), oMLX/oQ para la cuantización; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-fp16 | 26.707B | no disponible | no disponible | safetensors (MLX) | Cuantización mixta ~5,24 bits/peso, multimodal |
| Modelo base Inkling-2-Mini (BF16) | ~26.7B | no disponible | no disponible | no disponible | Referencia sin cuantizar; no se publican datos |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | No se identifican comparables directos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (mismo tamaño, misma tarea o mismo ecosistema MLX). Se recomienda consultar el repositorio del modelo base si estuviera disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo soporta castellano con calidad suficiente; habría que evaluarlo empíricamente.
- Sin benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de tareas multimodales, por lo que la calidad real es una incógnita.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación (RLHF/DPO) no se puede estimar su magnitud.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza o idioma.
- Cuantización agresiva: el promedio de 5,237 bits/peso implica pérdida de precisión respecto al modelo en BF16; las capas en 4 bits (más del 91% de los pesos) pueden degradar tareas sensibles como matemáticas o código.
- Dependencia de MLX: el checkpoint está empaquetado para Apple Silicon; su uso en otras plataformas requiere conversión no documentada.
- Contexto desconocido: no se puede planificar su uso en aplicaciones que requieran ventanas largas sin antes medir el límite real.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad; el modelo no ha sido probado de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/csrstka/Inkling-2-Mini-oQ4e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible en la información proporcionada
- Paper o documentación técnica: no disponible
- Demo: no disponible
