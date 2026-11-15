# hanzoai/zen6-mlx

## Resumen

Zen 6 (27B) es un modelo multimodal de tipo imagen-texto-a-texto publicado por Hanzo AI en colaboración con Zen LM bajo licencia Apache-2.0. Se distribuye en formato nativo MLX para Apple Silicon, con pesos cuantizados a 2 bits mediante una variante de cuantización ternaria afín basada en la transformada de Hadamard (denominada `prism_hadamard_qwen35` en los metadatos del repositorio). El modelo cuenta con 27.359.638.768 parámetros totales según los safetensors publicados y un tamaño de repositorio de 8,6 GB, lo que refleja la fuerte compresión derivada de la cuantización a 2 bits.

La arquitectura declarada en los metadatos es `prism_hadamard_qwen35`, lo que sugiere una base derivada de la familia Qwen 3.5 con modificaciones propias de Hanzo (transformada de Hadamard aplicada a los pesos ternarios). El modelo incorpora un torre de visión multimodal en FP16 y un runtime propio (`runtime/`) adaptado a la cuantización Hadamard. Entre sus capacidades declaradas destacan la identidad Zen 6 y el soporte de tool calling mediante etiquetas `<tool_call>` en el marco del protocolo MCP (Model Context Protocol).

El interés de este lanzamiento reside en su propuesta de ejecución local en hardware Apple Silicon con un modelo de 27B parámetros comprimido a 2 bits, algo poco habitual en modelos de ese tamaño. La información pública disponible es muy limitada: la model card es breve, no se especifican idiomas soportados, no se publican benchmarks y el repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica un lanzamiento muy reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `prism_hadamard_qwen35` (transformer multimodal con cuantización ternaria afín y transformada de Hadamard; base derivada de Qwen 3.5 según los metadatos) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits afín con base Hadamard (ternaria, STE QAT); torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); runtime propio en `runtime/` |
| Libreria | MLX |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 8,6 GB |
| Hardware objetivo | Apple Silicon (M1, M2, M3, M4 Max) |

## Arquitectura y entrenamiento

La información disponible indica que Zen 6 (27B) emplea una arquitectura denominada `prism_hadamard_qwen35`, lo que apunta a una base de la familia Qwen 3.5 sobre la que Hanzo AI ha aplicado una cuantización ternaria consciente de la transformada de Hadamard. Los pesos publicados contienen, según la model card, los parámetros exactos resultantes de un post-entrenamiento con STE QAT (Straight-Through Estimator con Quantization-Aware Training) en base ternaria Hadamard. Esto implica que el modelo fue entrenado o ajustado teniendo en cuenta la cuantización a 2 bits, en lugar de cuantizarse a posteriori, lo que habitualmente reduce la degradación de calidad respecto a la cuantización post-hoc.

El modelo es multimodal: incorpora una torre de visión en FP16 junto al tronco de lenguaje cuantizado, y se distribuye con un runtime propio (`runtime/`) que incluye utilidades como `vision_artifact.load_vl_model` para cargar conjuntamente modelo, procesador y configuración. La model card menciona también la integración de capacidades agénticas mediante el protocolo MCP y etiquetas `<tool_call>`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes en pipelines imagen-texto-a-texto (torre de visión en FP16).
- Tool calling y function calling mediante etiquetas `<tool_call>` en el marco del protocolo MCP (Model Context Protocol).
- Capacidades agénticas orientadas a flujos multi-paso, según la descripción del autor.
- Identidad propia del modelo Zen 6 integrada en los pesos post-entrenados.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede desplegarse íntegramente en un equipo Apple Silicon gracias al formato MLX a 2 bits, lo que permite conversaciones multi-turno sin conexión a servicios en la nube y sin enviar datos a terceros.
- Automatización agéntica con MCP: al soportar tool calling mediante `<tool_call>`, puede integrarse en orquestadores de agentes que expongan herramientas a través del Model Context Protocol, por ejemplo para consultar APIs internas, bases de datos o servicios web desde un flujo multi-paso.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, formularios escaneados o diagramas y combinarla con razonamiento textual en un mismo pipeline.
- Prototipado rápido en investigación: investigadores que trabajen en cuantización extrema (2 bits, ternaria, Hadamard) pueden usar este modelo como referencia reproducible para estudiar la degradación de calidad frente a versiones FP16 o de mayor precisión.
- Desarrollo de asistentes de escritorio en macOS: al estar empaquetado con un runtime propio y un script `quickstart.py`, encaja en aplicaciones nativas de macOS que requieran inferencia local con privacidad por diseño.
- Evaluación de tool calling en entornos controlados: útil para comparar la fiabilidad de invocación de herramientas entre modelos cuantizados a 2 bits y modelos de precisión completa, en pipelines de CI o tests de regresión de agentes.
- Demos educativas de multimodalidad en hardware de consumo: permite mostrar visión + lenguaje en un portátil Apple sin GPU dedicada, gracias a la compresión a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 8,6 GB, por lo que se requiere al menos ese espacio en memoria unificada para cargar los pesos; conviene reservar margen adicional para el runtime, el procesador de visión y el contexto de inferencia (estimación orientativa: 10-14 GB en función de la longitud de contexto).
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon (M1, M2, M3, M4 Max según la model card).
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (16 GB o más recomendable; 8 GB puede ser insuficiente con contexto largo).
- Opciones de despliegue: MLX (librería nativa) y el runtime propio incluido en `runtime/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Zen 6 (27B) MLX 2-bit | 27,36 B | no disponible | 2 bits ternaria Hadamard | Apache-2.0 | Apple Silicon (MLX) |
| Qwen 3.5 (base declarada) | no disponible | no disponible | múltiples (FP16, GGUF, AWQ, etc.) | según variante | GPU y CPU |
| Otros modelos 27B-32B en MLX | no disponible | no disponible | 4 bits / 8 bits típicamente | variable | Apple Silicon |

No se dispone de datos de rendimiento comparativo publicados para Zen 6 (27B) en la información proporcionada. La comparación con la base Qwen 3.5 es inferida a partir del identificador de arquitectura `prism_hadamard_qwen35`, no confirmada por el autor.

## Limitaciones y advertencias

- No se publican resultados de benchmarks, por lo que no es posible evaluar la degradación de calidad introducida por la cuantización a 2 bits frente a la base en FP16.
- La model card no especifica los idiomas soportados; no se debe asumir cobertura multilingüe amplia.
- No se indica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el archivo `NOTICE` para verificar las obligaciones de atribución de componentes upstream (Qwen y otros).
- El modelo está empaquetado específicamente para MLX y Apple Silicon; no se garantiza su funcionamiento en GPU NVIDIA ni en otras plataformas sin conversión adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente agravado por la cuantización extrema a 2 bits; se recomienda validación humana en producción.
- La fiabilidad del tool calling mediante `<tool_call>` no está cuantificada en la información disponible.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanzoai/zen6-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
