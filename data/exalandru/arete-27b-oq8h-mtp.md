# exalandru/Arete-27B-oQ8h-mtp

## Resumen

Arete-27B-oQ8h-mtp es un checkpoint cuantizado del modelo Arete-27B, publicado por el usuario exalandru en Hugging Face. Se trata de una conversión a formato MLX (Apple Silicon) realizada con la herramienta oQ (oMLX v0.8.4), que aplica cuantización de precisión mixta en lugar de una cuantización uniforme. El resultado es un checkpoint de 9.902 millones de parámetros lógicos almacenados en 29,3 GB, con un promedio efectivo de 23,628 bits por peso. El modelo base pertenece a la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio, e incorpora un cabezal MTP (multi-token prediction) y un módulo de visión.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización mixta con oQ, una técnica que asigna precisión distinta a cada tensor según su sensibilidad (8 bits afines con grupo 64 para una parte, BF16 para otra y U32 para la mayoría del almacenamiento). Por otro, advierte de una discrepancia importante: el nombre comercial indica 27B, pero el recuento real de safetensors es de 9,9 mil millones de parámetros. Esa diferencia debe tenerse en cuenta antes de planificar el despliegue.

La información pública disponible es muy limitada. El autor no ha publicado model card descriptiva, licencia, idiomas soportados ni resultados de benchmarks. Todo lo que sigue se basa en los metadatos del repositorio y en la tabla de cuantización incluida en el README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (según tag `qwen3_5`); incluye módulo de visión y cabezal MTP. Detalle de capas y atención: no disponible |
| Parametros totales | 9.902.379.760 (9,902B) según safetensors; el nombre del modelo indica 27B, discrepancia no aclarada por el autor |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (2,915B pesos, 8,50 bits/peso), BF16 (0,900B pesos, 16,00 bits/peso), U32 (6,088B pesos, 32,00 bits/peso). Promedio efectivo: 23,628 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); repo de 29,3 GB |

Desglose por componente según el README:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 9,017B | 27,825 GB / 25,914 GiB |
| Visión | 0,461B | 0,921 GB / 0,858 GiB |
| Cabezal MTP | 0,425B | 0,500 GB / 0,466 GiB |
| Total | 9,902B | 29,247 GB / 27,239 GiB |

## Arquitectura y entrenamiento

El checkpoint deriva de un modelo base de la familia Qwen 3.5, según la etiqueta declarada por el autor. La arquitectura es un transformer con tres componentes diferenciados: un modelo de lenguaje de 9,017B parámetros lógicos, un módulo de visión de 0,461B y un cabezal MTP de 0,425B. La presencia de MTP (multi-token prediction) sugiere que el modelo base fue entrenado con un objetivo auxiliar de predicción de varios tokens, técnica habitual para acelerar la decodificación especulativa en inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla el esquema de atención (si es atención lineal, híbrida o estándar) ni la configuración de capas y cabezales. La única innovación documentada es la cuantización mixta aplicada por oQ: en lugar de reducir todos los pesos a 8 bits, el autor conserva el 61,477% de los pesos lógicos en U32 (32 bits), mantiene un 9,086% en BF16 y cuantiza a 8 bits afines con grupo 64 el 29,438% restante. Este reparto eleva el peso medio a 23,628 bits, muy por encima de una cuantización 8-bit convencional, lo que sugiere que se ha priorizado la fidelidad sobre la compresión.

## Capacidades

- Generación de texto y razonamiento: capacidad esperada por herencia de la familia Qwen 3.5, aunque no hay evaluación publicada en este checkpoint.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,461B parámetros, por lo que se infiere soporte de entrada de imágenes, sin confirmación documental del autor.
- Predicción multi-token (MTP): el cabezal de 0,425B parámetros permite generar varios tokens por paso, lo que puede acelerar la decodificación especulativa.
- Tool calling / function calling: no disponible; no se documenta en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking explícito: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 29,3 GB permiten ejecutar el modelo en un Mac con memoria unificada de 32 GB o superior, usando la librería MLX y el ecosistema oMLX. Es el caso de uso principal y el único claramente respaldado por el formato del checkpoint.
- Prototipado de aplicaciones multimodales: al incluir un módulo de visión, puede emplearse para experimentar con pipelines de imagen y texto en local, siempre que se valide empíricamente el comportamiento del módulo.
- Evaluación de cuantización mixta: sirve como referencia para estudiar el impacto de repartos de precisión no uniformes (8-bit, BF16 y U32) en la calidad de salida frente al modelo base sin cuantizar.
- Aceleración de decodificación con MTP: el cabezal de predicción multi-token permite probar técnicas de decodificación especulativa en entornos MLX, midiendo la ganancia de throughput frente a la decodificación autorregresiva clásica.
- Investigación sobre fidelidad de pesos: la conservación de un 61,477% de pesos en U32 lo convierte en un candidato para estudiar cuánta degradación introduce la cuantización selectiva en tareas específicas.
- Despliegue en estaciones de trabajo con memoria unificada: para equipos con 64 GB o más, el checkpoint cabe holgadamente y deja margen para el contexto y el estado de la KV cache, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,3 GB solo para los pesos; hay que sumar la KV cache y los buffers de inferencia. Para contexto largo se recomienda un mínimo de 36-40 GB de memoria disponible.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es un checkpoint pensado para CUDA.
- Cabe en GPU de consumo: en Apple Silicon, sí, en equipos con 32 GB de memoria unificada o más; en 32 GB el margen es ajustado y obliga a contextos cortos. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) no cabe sin conversión y cuantización adicional.
- Opciones de despliegue: MLX (librería oficial de Apple), oMLX (herramienta de cuantización y ejecución del autor de la conversión), mlx-lm para el modelo de lenguaje. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este formato sin conversión previa.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-oQ8h-mtp | 9,902B lógicos (nombre indica 27B) | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| Modelo base Arete-27B (sin cuantizar) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Qwen 3.5 (modelo de referencia de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría. La ausencia de benchmarks y de especificaciones del modelo base impide contrastar rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 27B pero el recuento real de safetensors es de 9,902B parámetros. Cualquier estimación de recursos basada en el nombre será errónea.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto con el autor o con la licencia del modelo base.
- Idiomas no declarados: no hay garantía de soporte multilingüe ni de calidad en castellano.
- Contexto desconocido: la longitud máxima de contexto no está documentada, lo que dificulta dimensionar la KV cache y planificar aplicaciones de contexto largo.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluaciones publicadas, no puede descartarse un comportamiento deficiente en tareas de razonamiento o factualidad.
- Sesgos: no documentados; se heredan los del modelo base, que no se describe.
- Formato restringido: al ser MLX, no es portable a CUDA sin conversión y recuantización, lo que limita su uso a entornos Apple.
- Cuantización no uniforme: el 61,477% de los pesos lógicos se almacena en U32, lo que reduce la compresión efectiva y eleva el peso del checkpoint a 29,3 GB; no es una opción ligera para hardware con poca memoria.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria del funcionamiento del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exalandru/Arete-27B-oQ8h-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX (Apple): no disponible en la información proporcionada
- Modelo base Arete-27B: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
