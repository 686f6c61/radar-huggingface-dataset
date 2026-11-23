# IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Thomson-1.0-Small es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Thomson Reuters, orientado a generación de texto, razonamiento y conversación multilingüe. La versión aquí descrita es una cuantización GGUF comunitaria publicada por IsValorum bajo la receta propietaria APEX-I-MiniPlus V2.1, que comprime el modelo base a unos 14,75 GB en disco (3,40 BPW) manteniendo los tensores críticos en precisión alta. El modelo base cuenta con 34.660.610.688 parámetros totales y una arquitectura MoE con 40 capas y 256 micro-expertos, según la información de la model card del cuantizador.

La relevancia de esta ficha reside en que la cuantización APEX-I-MiniPlus V2.1 está diseñada para ejecutar el modelo completo con contexto de hasta 256K tokens en estaciones de trabajo con 24 GB de VRAM, o bien con offload parcial a RAM del sistema. Según el autor, esto se consigue preservando los routers (`gate_inp`, `gate_shexp`) en F32, la cabeza de salida en Q6_K y las puertas de atención en Q8_0, mientras los expertos centrales se mantienen en IQ3_XXS y los expertos de borde en Q3_K.

El modelo soporta 13 idiomas (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe) y se distribuye bajo licencia Apache 2.0. El repositorio acumula 459 descargas y 3 likes en el momento de la consulta, con última actualización el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, 40 capas y 256 micro-expertos (etiqueta `qwen35moe` en el repo) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según la model card del cuantizador) |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1 (3,40 BPW); mezcla por tensor: IQ3_XXS, Q3_K, IQ4_NL, Q4_K, Q5_K, Q6_K, Q8_0, F32 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Thomson-1.0-Small emplea una arquitectura Mixture-of-Experts con 40 capas y 256 micro-expertos, según la descripción del cuantizador. La model card del repositorio GGUF no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo base `thomsonreuters/Thomson-1.0-Small`, que no se ha proporcionado en esta consulta.

La innovación técnica destacable de esta release es la cuantización selectiva por tensor (APEX-I-MiniPlus V2.1). El autor documenta que los routers `gate_inp` y `gate_shexp` se mantienen en F32 sin comprimir para evitar deriva de enrutamiento; la cabeza de salida `output.weight` se protege en Q6_K; las puertas de atención de 30 capas se guardan en Q8_0; los expertos centrales (capas 10-29) usan IQ3_XXS; los expertos de borde (capas 0-9 y 30-39) usan Q3_K; y el experto compartido (`shexp`) se mantiene en Q5_K en las 40 capas. Las proyecciones de atención usan Q4_K para `q/k/v` y Q6_K para `output`. El autor afirma que esta combinación elimina las paradas de descompresión AVX2 en CPU y reduce la perplejidad en WikiText-2 a 5,3338 ± 0,1254 frente a 5,28 del BF16 sin cuantizar (ΔPPL +0,0538, +1,02 %).

## Capacidades

- Generación de texto conversacional y de formato largo en 13 idiomas.
- Razonamiento multi-paso, con soporte de modo de pensamiento (`<think>`) según las referencias de la model card a errores de sintaxis en esa sección.
- Generación de código, con énfasis del autor en preservar la indentación y los corchetes en la cuantización.
- Capacidad MoE con 256 micro-expertos y experto compartido, orientada a eficiencia computacional.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Asistente conversacional multilingüe en producción: el modelo cubre 13 idiomas y puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 256K tokens, adecuado para atención al cliente en mercados internacionales.
- Análisis de documentos extensos: con 256K tokens de contexto, permite resumir contratos, informes financieros o expedientes legales completos sin truncamiento, un caso alineado con el origen del modelo en Thomson Reuters.
- Generación de código en pipelines de CI/CD: el autor destaca que la cuantización preserva la sintaxis y la indentación, lo que lo hace apto para tareas de autocompletado y revisión de código en entornos de integración continua.
- Despliegue en estaciones de trabajo con 24 GB de VRAM: la receta APEX-I-MiniPlus V2.1 está diseñada para ejecutar el modelo completo con contexto de 256K en GPUs de consumo de gama alta, lo que permite prototipado local sin infraestructura cloud.
- Inferencia con offload parcial a RAM: en sistemas con menos VRAM, el modelo puede residir parcialmente en RAM del sistema con velocidades de 20 a 45 tok/s según el autor, útil para equipos con DDR4/DDR5 y GPU modesta.
- Traducción y localización: el soporte de 13 idiomas permite tareas de traducción automática y adaptación de contenido entre mercados.
- Extracción de información estructurada: el modo de razonamiento y la ventana larga facilitan tareas de parsing de documentos y extracción de entidades en flujos de datos empresariales.

## Benchmarks y rendimiento

La model card del cuantizador incluye una comparación de perplejidad en WikiText-2 y datos de rendimiento de hardware, pero no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| WikiText-2 perplexity (BF16 base) | ~5,28 (referencia) |
| WikiText-2 perplexity (APEX-I-MiniPlus V2.1) | 5,3338 ± 0,1254 (ΔPPL +0,0538 / +1,02 %) |
| Tamano en disco | 14,75 GB |
| Huella en memoria (RAM/VRAM) | 13,74 GiB |
| BPW medio | 3,40 |
| Throughput en RAM del sistema | 20-45 tok/s (según CPU y memoria) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 13,74 GiB para el modelo completo; el autor afirma que el contexto completo de 256K cabe en 24 GB de VRAM.
- GPU recomendadas: el autor menciona benchmarks de throughput en RTX 30, RTX 40 y RTX 50; no se detallan modelos concretos en la información proporcionada.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM (por ejemplo, gama RTX xx90 de 24 GB), según el autor.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), con compatibilidad con endpoints; no se confirma soporte de vLLM, Ollama o TGI en la información proporcionada.
- Latencia y throughput: 20-45 tok/s en inferencia con RAM del sistema, variable según CPU y configuración DDR4/DDR5; con offload parcial a GPU se mantiene generación estable en contextos largos.
- Offload: soporta offload total o parcial a RAM del sistema, con streaming eficiente y sin paradas AVX2 según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thomson-1.0-Small APEX-I-MiniPlus V2.1 (este) | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF | Cuantización selectiva por tensor, 13,74 GiB |
| Thomson-1.0-Small APEX-I-MiniPlus V2 | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF | +1,2 GB sobre V2.1, calidad prácticamente idéntica según el autor |
| Thomson-1.0-Small APEX-I-Mini genérico | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF | ~12,5 GB, expertos en IQ2_S, errores de sintaxis según el autor |
| Thomson-1.0-Small BF16 base | 34,66 B (MoE) | 256K | Apache 2.0 | safetensors | ~70 GB en disco, ~65,2 GiB en memoria |

No se dispone de datos de benchmarks estándar para comparar el rendimiento frente a modelos de otros desarrolladores con el mismo tamaño o tarea.

## Limitaciones y advertencias

- La model card del cuantizador no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- La cuantización introduce una pérdida de perplejidad de +1,02 % en WikiText-2 respecto al BF16, aceptable según el autor pero no nula.
- El autor advierte de que las recetas genéricas APEX-I-Mini (no MiniPlus) producen errores de sintaxis y corchetes de código rotos; debe verificarse que se descarga la variante MiniPlus correcta.
- El rendimiento con offload a RAM depende críticamente de la CPU y del ancho de banda de memoria; en configuraciones modestas puede caer por debajo de los 20 tok/s indicados.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `thomsonreuters/Thomson-1.0-Small` en su propia model card.
- No se confirma soporte explícito de tool calling, function calling ni flujos de agentes en la información proporcionada.
- El repositorio tiene pocas descargas (459) y likes (3), por lo que la validación comunitaria es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Apoyo al autor: https://ko-fi.com/isvalorum
