# skt/A.X-K2

## Resumen

A.X K2 es un modelo de lenguaje de gran escala basado en Mixture-of-Experts (MoE), desarrollado por SK Telecom como parte del proyecto gubernamental coreano de modelo fundacional de IA soberana. Es el sucesor de A.X K1 y está diseñado como un modelo fundacional orientado a agentes, con capacidades avanzadas de razonamiento, uso de herramientas y comprensión de contexto largo. El modelo contiene 688 mil millones de parámetros totales con 33 mil millones de parámetros activos por token, lo que permite un equilibrio entre capacidad de razonamiento y eficiencia de inferencia.

Su arquitectura incorpora innovaciones como Sparse Gated Attention (SGA) sobre Multi-head Latent Attention (MLA), Gated Norm para estabilizar el entrenamiento en baja precisión, y un entrenamiento nativo en FP8 (MXFP8, E4M3) que reduce a la mitad la huella de memoria respecto a BF16. El modelo soporta una ventana de contexto de 262 144 tokens (256K), con 128K entrenados de forma nativa y extendidos a 256K mediante escalado YaRN. Además, implementa el recetario de entrenamiento Think-Fusion, que permite alternar entre un modo de razonamiento explícito (thinking) y un modo de respuesta concisa (non-thinking) en un mismo modelo unificado.

El modelo se distribuye bajo licencia Apache 2.0 y está optimizado para cinco idiomas: inglés, coreano, chino, japonés y español, con un tokenizador BBPE de gran vocabulario (163 840 tokens) especialmente adaptado a código fuente y texto estructurado. Su relevancia actual radica en ser uno de los pocos modelos de escala frontera entrenados nativamente en FP8 y publicados como código abierto, con un fuerte énfasis en el ecosistema de agentes y herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (256 expertos enrutados + 1 compartido) |
| Parametros totales | 688 000 000 000 (688B) |
| Parametros activos | 33 000 000 000 (33B) por token (8 expertos + 1 compartido) |
| Longitud de contexto | 262 144 tokens (256K); 128K nativo, extendido a 256K con YaRN |
| Tipos de cuantizacion | Checkpoint nativo en FP8 block-scaled (E4M3, bloques 128x128); compatible con FP8 serving sin cuantizacion posterior |
| Idiomas soportados | ingles, coreano, chino, japones, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 block-scaled) |

## Arquitectura y entrenamiento

A.X K2 emplea una arquitectura Transformer decoder-only con capas MoE. El modelo tiene 61 capas (una densa y 60 MoE), con 64 cabezas de atención y un tamaño oculto de 7168. Cada token activa 8 de los 256 expertos enrutados más un experto compartido, lo que da un total de 33B parámetros activos. La atención se basa en Multi-head Latent Attention (MLA) combinada con Sparse Gated Attention (SGA), un mecanismo que utiliza un indexador ligero para seleccionar los top-k tokens clave y aplica una puerta de salida por cabeza para podar el cálculo de atención en contextos largos, mitigando a su vez los attention sinks. La normalización usa Gated Norm, que aplica una puerta dependiente de la entrada después de RMSNorm para suprimir activaciones masivas y valores atípicos, lo que estabiliza el entrenamiento a gran escala y facilita el despliegue en baja precisión (FP8/FP4).

El entrenamiento se realizó desde cero de forma nativa en FP8 (MXFP8, E4M3) tanto en forward como en backward, con pesos maestros y gradientes en FP32. El checkpoint publicado se distribuye en FP8 block-scaled, lo que elimina la necesidad de cuantización post-hoc para servir el modelo en FP8. Los datos de entrenamiento provienen de los datasets nvidia/Nemotron-CC-v2.1, nvidia/Nemotron-Pretraining-Code-v2 y HuggingFaceFW/fineweb-2, con un tokenizador BBPE de 163 840 tokens optimizado para eficiencia token en cinco idiomas y código fuente. El recetario Think-Fusion entrena un único modelo capaz de operar en dos modos: thinking (razonamiento multi-paso explícito) y non-thinking (respuestas concisas de baja latencia), controlable por el usuario en cada petición. El entrenamiento formó parte del proyecto coreano Sovereign AI, con el objetivo de crear un modelo de escala frontera con comprensión profunda del coreano y su cultura.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo puede operar en modo thinking para problemas complejos que requieren cadenas de razonamiento explícitas, o en modo non-thinking para respuestas rápidas y concisas.
- Razonamiento matematico y logico: su escala (688B totales, 33B activos) y el entrenamiento con datos de código y texto estructurado le confieren capacidades sólidas en matemáticas y lógica, aunque no se han publicado cifras concretas de benchmarks.
- Generacion de codigo: el tokenizador está optimizado para código fuente y patrones de programación, y los datos de entrenamiento incluyen nvidia/Nemotron-Pretraining-Code-v2, lo que lo hace adecuado para tareas de generación y comprensión de código.
- Soporte de tool calling y uso de agentes: el modelo está diseñado como un modelo agéntico, con capacidad para usar herramientas externas y ejecutar tareas multi-paso, según lo declarado por SK Telecom (evolución de "answering AI" a "working AI").
- Comprension de contexto largo: con 256K tokens de ventana (128K nativo + YaRN), puede procesar documentos extensos, codebases completos o conversaciones largas de forma eficiente gracias a SGA.
- Capacidades multilingues: soporta inglés, coreano, chino, japonés y español, con especial énfasis en coreano y su contexto cultural.
- Eficiencia en baja precision: al estar entrenado y distribuido en FP8 nativo, el modelo se puede servir directamente en FP8 sin pasos de cuantización adicionales, lo que reduce los requisitos de memoria a la mitad respecto a BF16.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en cinco idiomas con una ventana de contexto de 256K tokens, lo que permite mantener el historial completo de interacciones largas y consultar bases de conocimiento extensas sin perder el hilo. Su modo non-thinking ofrece respuestas de baja latencia para consultas rutinarias, mientras que el modo thinking puede resolver incidencias complejas que requieran razonamiento.
- Generacion de codigo en produccion: gracias a su tokenizador optimizado para código y al entrenamiento con datasets de código, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones, refactorizar módulos o autocompletar implementaciones. Su soporte de tool calling permite conectarlo a repositorios, APIs y sistemas de build.
- Agente de analisis de documentos legales y financieros: la ventana de 256K tokens permite procesar contratos, informes anuales o expedientes completos de una sola vez, extrayendo cláusulas relevantes, resumiendo riesgos o comparando versiones. El modo thinking puede descomponer el análisis en pasos verificables.
- Asistente de investigacion cientifica: con capacidad de razonamiento multi-paso y acceso a herramientas, el modelo puede buscar literatura, resumir artículos, formular hipótesis y estructurar experimentos. Su soporte multilingüe (especialmente coreano, chino y japonés) facilita la revisión de publicaciones en estos idiomas.
- Traduccion y localizacion tecnica: el modelo está entrenado en cinco idiomas con un tokenizador eficiente, lo que lo hace adecuado para traducir documentación técnica, manuales de producto o interfaces de software entre estos idiomas, manteniendo terminología consistente en contextos largos.
- Automatizacion de operaciones de TI (ITOps): como modelo agéntico con tool calling, puede interactuar con sistemas de monitorización, ejecutar scripts de diagnóstico, analizar logs extensos (gracias al contexto largo) y proponer o ejecutar acciones correctivas bajo supervisión humana, en modo thinking para incidentes complejos o non-thinking para alertas rutinarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y las noticias de SK Telecom mencionan mejoras de rendimiento respecto a A.X K1, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. El repositorio de GitHub incluye un technical report (A_X_K2_Tech_Report.pdf) que podría contener dichos datos, pero no está accesible en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 de 688B parámetros ocupa aproximadamente 688 GB solo en pesos (1 byte por parámetro en FP8). Con overhead de KV cache, activaciones y memoria de ejecución, se necesitan al menos 750-800 GB de VRAM total.
- GPU recomendadas: para servir el modelo completo en FP8 se requieren múltiples GPUs de alta capacidad. Opciones viables: 8x H200 (141 GB cada una, total 1128 GB), 10x H100 80GB (800 GB), o 8x A100 80GB (640 GB, insuficiente sin offloading). En configuraciones con 8x H100 80GB (640 GB) sería necesario cuantizar a 4 bits (~344 GB) o usar offloading de CPU.
- En consumer GPU: no es viable. Ni siquiera una RTX 4090 (24 GB) o RTX 5090 (32 GB) pueden alojar el modelo completo. Solo sería posible con cuantización extrema (4-bit o menor) y offloading agresivo, lo que degradaría severamente la latencia.
- Opciones de despliegue: al ser un modelo transformers compatible con safetensors, se puede servir con vLLM, TensorRT-LLM, TGI o llama.cpp (este último requiere conversión a GGUF y cuantización adicional). El checkpoint FP8 nativo está preparado para servir directamente en FP8 con backends que soporten MXFP8.
- Latencia y throughput: no se han publicado cifras oficiales. Con 33B parámetros activos por token, el throughput debería ser significativamente mayor que un modelo denso de 688B, pero menor que un MoE con menos parámetros activos. La SGA reduce el coste de atención en contextos largos, mejorando la latencia en secuencias de 100K+ tokens.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para realizar una comparativa rigurosa con modelos de la misma categoría. El modelo más cercano por escala y arquitectura sería DeepSeek-V3 (671B totales, 37B activos, también MoE con MLA), pero no se han publicado benchmarks comparativos de A.X K2. El predecesor A.X K1 (500B+ parámetros) es el punto de referencia interno, pero sus especificaciones detalladas no están incluidas en el material disponible. Se recomienda consultar el technical report del modelo para obtener datos de evaluación comparativa.

## Limitaciones y advertencias

- Sesgos culturales y linguisticos: al ser desarrollado como parte del proyecto Sovereign AI de Corea, el modelo puede tener un sesgo hacia el coreano y su contexto cultural, con posible menor rendimiento en otros idiomas, especialmente en variedades regionales del español u otros dialectos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de gran escala, puede generar contenido factualmente incorrecto o inventado, especialmente en tareas de razonamiento complejo o con datos poco representados en el entrenamiento. El modo thinking no elimina este riesgo.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, solo 128K fueron entrenados de forma nativa; la extensión a 256K vía YaRN puede degradar la coherencia en secuencias muy largas o con dependencias de largo alcance.
- Requisitos de hardware muy elevados: los 688B parámetros totales exigen infraestructura de múltiples GPUs de alta gama, lo que limita su uso a organizaciones con recursos significativos. No es desplegable en hardware de consumo.
- Precision FP8: aunque el entrenamiento nativo en FP8 reduce la huella de memoria, la precisión reducida puede introducir errores numéricos en tareas que requieren alta exactitud, especialmente en operaciones de punto flotante sensibles.
- Sin benchmarks publicados: la ausencia de resultados de evaluación estandarizados en la información disponible dificulta la comparación objetiva con otros modelos y la validación de sus capacidades declaradas.
- Licencia Apache 2.0: aunque permisiva para uso comercial, es recomendable revisar los términos completos y las atribuciones requeridas, especialmente al tratarse de un modelo financiado por un gobierno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skt/A.X-K2
- Coleccion de modelos A.X K2: https://huggingface.co/collections/skt/ax-k2
- Repositorio GitHub: https://github.com/SKT-AI/A.X-K2
- Technical report (PDF): https://github.com/SKT-AI/A.X-K2/blob/main/A_X_K2_Tech_Report.pdf
- Nota de prensa de SK Telecom: https://news.sktelecom.com/en/3204
- Articulo de Digital Today: https://www.digitaltoday.co.kr/en/view/88910/skt-says-ax-k2-evolves-from-answering-ai-to-working-ai
- Etiqueta de noticias A.X K2 en SK Telecom: https://news.sktelecom.com/en/tag/a-x-k2
