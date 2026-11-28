# SceneWorks/lens-turbo-candle

## Resumen

`SceneWorks/lens-turbo-candle` es una conversión de pesos del modelo `microsoft/Lens-Turbo`, empaquetada en formato nativo de Candle (el framework de tensores en Rust de Hugging Face) con cuantizaciones GGML por bloques. El autor, SceneWorks, publica esta variante como parte de una cadena de conversiones que parte de su propio `SceneWorks/lens-turbo-mlx` (tiers MLX para macOS) y produce tiers GGML para Windows y Linux. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos del modelo base de Microsoft en un formato y cuantización específicos.

El repositorio incluye dos niveles de cuantización: `q4` (Q4_1, convertido sin pérdida desde el tier q4 de MLX) y `q8` (Q8_0, cuantizado desde los pesos bf16 del transformer, con el encoder de texto cuantizado a Q8_0 desde expertos MXFP4 nativos). Cada capa lineal cuantizada se almacena como un único tensor `U8` con forma `[out, in/32, block_bytes]`, y la configuración declara `quantization: {bits, storage: ggml}` en `config.json`. El repo ocupa 55,5 GB y la licencia es MIT.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue concreta (Candle + GGML) para un modelo de Microsoft; por otro, ilustra un patrón de publicación de "tiers" de cuantización que conviene conocer al evaluar modelos. La información pública disponible es muy escasa: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y sin resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de texto que incluye 48 stacks de expertos MoE (según la model card); arquitectura exacta del modelo base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo base usa MoE en el encoder de texto, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4 = Q4_1 (convertido sin pérdida desde MLX q4); q8 = Q8_0 (desde bf16 en el transformer, y desde MXFP4 nativos en los expertos del encoder de texto); almacenamiento GGML por bloques |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF-blocks (tensores `U8` con forma `[out, in/32, block_bytes]`); librería `candle` |
| Tamaño del repositorio | 55,5 GB |
| Modelo base | microsoft/Lens-Turbo |
| Cadena de conversión | microsoft/Lens-Turbo → SceneWorks/lens-turbo-mlx@d3f485c3 → SceneWorks/lens-turbo-candle |
| Herramienta de conversión | candle_gen::ggml_tier (SceneWorks/inference) |
| Plataformas objetivo | Windows y Linux (macOS usa los tiers MLX) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base más allá de indicar que el transformer se distribuye en bf16 y que el encoder de texto contiene 48 stacks de expertos MoE. El modelo upstream `microsoft/Lens-Turbo` no incluye expertos en bf16: los expertos nativos están en MXFP4, y la conversión q8 los cuantiza a Q8_0 directamente desde ese formato. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado: cada capa lineal cuantizada se representa como un tensor `U8` único con forma `[out, in/32, block_bytes]`, lo que permite cargar los pesos directamente en Candle sin pasos intermedios de de-cuantización a nivel de fichero. El tier q4 se obtiene por conversión sin pérdida desde el tier q4 de MLX, mientras que el q8 se genera por cuantización desde bf16 (transformer) y desde MXFP4 (expertos del encoder). No se documentan técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y modelado de lenguaje: capacidades heredadas del modelo base `microsoft/Lens-Turbo`; no se detallan en la información disponible.
- Procesamiento multimodal: el nombre "Lens" y la presencia de un encoder de texto con MoE sugieren un modelo de visión-lenguaje, pero la model card no confirma modalidades de entrada ni de salida.
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en Rust con Candle: el formato GGML por bloques y la librería `candle` permiten integrar el modelo en servicios escritos en Rust sin depender de Python en tiempo de inferencia, lo que reduce el tamaño del contenedor y el consumo de memoria del runtime.
- Inferencia en Windows y Linux con tiers cuantizados: el autor indica explícitamente que estos tiers están pensados para Windows y Linux, con macOS cubierto por los tiers MLX; encaja en pipelines multiplataforma que necesitan el mismo modelo en sistemas heterogéneos.
- Servicios con restricciones de VRAM: el tier q4 (Q4_1) reduce el espacio de pesos frente a bf16, lo que permite desplegar en GPUs con menos memoria; el tier q8 (Q8_0) ofrece mayor fidelidad numérica cuando la VRAM no es el cuello de botella.
- Reproducibilidad de conversiones: al documentarse la cadena exacta (MLX q4 → Q4_1 sin pérdida; bf16/MXFP4 → Q8_0) y el commit de origen (`d3f485c3`), el repo sirve como referencia auditable para equipos que replican el pipeline de cuantización.
- Integración en aplicaciones de escritorio nativas: al estar empaquetado para Candle, puede embeberse en aplicaciones de escritorio o edge en Rust sin un servidor Python intermedio.
- Evaluación comparativa de cuantizaciones: disponer de q4 y q8 del mismo modelo permite medir la degradación de calidad entre ambos tiers en tareas concretas antes de elegir uno para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repo ocupa 55,5 GB e incluye los tiers q4 y q8 además de posibles pesos sin cuantizar; el peso del tier q8 será aproximadamente la mitad del bf16 equivalente, y el q4 aproximadamente la cuarta parte, pero no se especifica el tamaño por tier.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo (55,5 GB) sugiere que el tier q4 podría caber en GPUs de consumo con 24 GB o más, pero es una estimación no confirmada por el autor.
- Opciones de despliegue: Candle (librería nativa); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SceneWorks/lens-turbo-candle | no disponible | no disponible | MIT | safetensors, GGUF-blocks (Candle) | Tiers q4/q8 para Windows/Linux |
| microsoft/Lens-Turbo | no disponible | no disponible | no disponible en esta ficha | no disponible | Modelo base original |
| SceneWorks/lens-turbo-mlx | no disponible | no disponible | no disponible en esta ficha | MLX | Tiers para macOS; origen del q4 |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La información pública es mínima: cero descargas, cero likes, sin pipeline declarado y sin idiomas declarados; la validación por parte de la comunidad es nula.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma del modelo base.
- La licencia MIT del repo de conversión no implica necesariamente que los pesos del modelo base `microsoft/Lens-Turbo` estén bajo MIT; conviene verificar la licencia del modelo upstream antes de uso comercial.
- Al ser una conversión de pesos y no un modelo entrenado, cualquier defecto del modelo base se hereda; además, la cuantización q4 y q8 introduce pérdida de precisión (el q4 es sin pérdida solo respecto al tier MLX q4, no respecto a bf16).
- El repo ocupa 55,5 GB, lo que complica su descarga y almacenamiento en entornos con recursos limitados.
- No hay garantía de soporte: el autor no documenta issues, demos ni canales de mantenimiento.
- La fecha de creación indicada (2026-11-28) es posterior a la fecha actual en muchos contextos; verificar la vigencia del repo antes de depender de él.

## Enlaces

- Hugging Face: https://huggingface.co/SceneWorks/lens-turbo-candle
- Modelo base: https://huggingface.co/microsoft/Lens-Turbo
- Repo de origen MLX: https://huggingface.co/SceneWorks/lens-turbo-mlx
- Herramienta de conversión: SceneWorks/inference (referenciada en la model card; URL no disponible)
- Candle: https://github.com/huggingface/candle (referencia del framework, no enlazada en la model card)
