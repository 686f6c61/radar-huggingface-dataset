# inclusionAI/Ling-3.0-flash-int4

## Resumen

Ling-3.0-flash es un modelo de razonamiento híbrido nativo desarrollado por inclusionAI, la misma organización detrás de la serie Ring. Con 124B parámetros totales y solo 5.1B activos por token, adopta una arquitectura MoE híbrida lineal desde el inicio del preentrenamiento, combinando atención lineal KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) en una proporción 5:1. Esta versión int4, publicada en HuggingFace, reduce el peso del modelo a 77 GB, lo que facilita su despliegue en entornos de producción.

El modelo está diseñado para tareas agénticas complejas: integra 10.000+ entornos de entrenamiento interactivos y soporta de forma nativa la caché jerárquica SGLang HiCache + Mooncake, lo que reduce el tiempo hasta el primer token (TTFT) entre un 60% y un 80% en escenarios de entrada larga. Su ventana de contexto nativa es de 256K tokens, ampliable hasta 1M, y el modo de pensamiento está habilitado por defecto.

La relevancia actual de Ling-3.0-flash radica en su equilibrio entre coste computacional y rendimiento: activa únicamente el 4% de sus parámetros por token, pero compite con modelos de mayor tamaño en benchmarks de código, agentes y razonamiento matemático. Su licencia MIT y su compatibilidad con frameworks como Claude Code, Kilo Code o Qwen Code lo convierten en una opción atractiva para desarrolladores que buscan un modelo abierto, eficiente y orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + MLA, 5:1) |
| Parametros totales | 127.486.405.600 (~124B) |
| Parametros activos | 5.1B |
| Longitud de contexto | 256K nativo (extensible a 1M) |
| Tipos de cuantizacion | int4 (esta version); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

Ling-3.0-flash emplea una arquitectura nativa híbrida lineal desde el inicio del preentrenamiento, compuesta por 35 capas KDA y 7 capas MLA apiladas alternativamente en proporción 5:1. La atención KDA incorpora un gating diagonal fino (fine-grained diagonal gating) que mejora la selección de información relevante, mientras que la capa densa intermedia tiene un tamaño de 6144 y el experto intermedio 768. El modelo cuenta con 512 expertos enrutados, 1 experto compartido y activa 8 expertos por token, lo que resulta en 5.1B parámetros activos de un total de 124B.

El entrenamiento sigue un programa de contexto progresivo: 8K -> 32K -> 256K, lo que permite al modelo manejar secuencias largas de forma estable. No se han publicado datos sobre el número total de tokens de entrenamiento ni sobre la composición del dataset. El modelo integra 10.000+ entornos interactivos de entrenamiento para tareas agénticas, lo que sugiere un pipeline que combina preentrenamiento con fases de ajuste orientadas a agentes y tool calling. El modo de pensamiento está habilitado por defecto, con parámetros por defecto de temperature=0.6, top_p=0.95 y top_k=20.

## Capacidades

- Razonamiento y generación de texto: modo de pensamiento nativo (thinking mode) activado por defecto, con capacidad de razonamiento multi-paso.
- Generación de código: evaluado en SWE-Bench Pro, SWE-Bench Multilingual y AntSWEBench, cubriendo lenguajes como Java, JavaScript y Python.
- Agentes y tool calling: soporte nativo para frameworks como Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw; integración con SGLang HiCache + Mooncake para caché jerárquica en interacciones largas.
- Long-context: ventana de 256K tokens nativa, extensible a 1M, con reducción de TTFT del 60-80% en entradas largas.
- Instrucciones y seguimiento: evaluado en benchmarks de instruction following como GDPval v2 y SkillsBench.
- Matemáticas y conocimiento general: rendimiento destacado en tareas de razonamiento matemático y conocimiento general, aunque no se han publicado cifras concretas.
- Multilingüismo: no se han especificado los idiomas soportados; la información disponible no detalla cobertura lingüística.

## Casos de uso

- Desarrollo de agentes autónomos de software: el modelo puede resolver issues reales de repositorios (SWE-Bench) y ejecutar tareas de refactorización o corrección de bugs en entornos CI/CD, gracias a su capacidad de tool calling y su ventana de 256K tokens para manejar contextos de proyecto extensos.
- Asistentes de código en producción: integrable en IDEs o CLIs mediante frameworks como Claude Code o Kilo Code, con soporte de razonamiento multi-paso y generación de código en múltiples lenguajes.
- Agentes de investigación profunda (deep research): su capacidad de razonamiento largo y su integración con caché jerárquica permiten realizar búsquedas y síntesis de información en múltiples pasos, manteniendo el contexto de la tarea durante horas.
- Atención al cliente automatizada con contexto largo: con 256K tokens de ventana, puede gestionar conversaciones multi-turno extensas, recordando detalles de interacciones previas y ejecutando acciones a través de APIs (tool calling).
- Generación de aplicaciones web interactivas: evaluado en MiniAppBench, puede convertir una petición de usuario en una aplicación HTML funcional completa, útil para prototipado rápido.
- Automatización de tareas bancarias y financieras: su rendimiento en Tau3-banking-AA sugiere que puede manejar simulaciones de usuario y aserciones en lenguaje natural para validar flujos de negocio complejos.
- Despliegue de modelos de razonamiento en entornos con restricciones de VRAM: gracias a su cuantización int4 y su arquitectura MoE con solo 5.1B activos, puede ejecutarse en GPUs de gama alta para consumo, como la RTX 4090 con 24 GB, si se utiliza un runtime optimizado.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona evaluaciones en SWE-Bench Pro, SWE-Bench Multilingual, Tau3-banking-AA, MCP-Atlas, SkillsBench, Terminal-Bench 2.1, MiniAppBench, AntSWEBench, GDPval v2-AA y Search-agent, pero no se proporcionan cifras concretas. Tampoco se incluyen comparaciones cuantitativas con otros modelos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización int4, los pesos del modelo ocupan aproximadamente 62-70 GB (basado en 124B parámetros × 4 bits). El repositorio ocupa 77 GB, por lo que se recomienda al menos 80 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o superiores. En configuraciones con múltiples GPUs, se puede distribuir la carga (por ejemplo, 2× RTX 4090 24GB con tensor parallelism).
- En consumer GPU: no es viable cargar el modelo completo en una sola GPU de consumo (máximo 24 GB). Sin embargo, con técnicas de offloading a CPU o usando versiones de menor precisión (si existieran), podría ejecutarse con latencia alta.
- Opciones de despliegue: SGLang (con soporte nativo de HiCache + Mooncake), vLLM, TGI, y posiblemente llama.cpp para cuantizaciones GGUF (no confirmado). El modelo usa compressed-tensors, lo que sugiere compatibilidad con runtimes que soporten este formato.
- Latencia y throughput: no se han publicado cifras concretas. La arquitectura MoE con 5.1B activos y la caché jerárquica prometen una latencia baja en entradas largas, con reducción de TTFT del 60-80% según el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|---|
| Ling-3.0-flash | 124B | 5.1B | 256K (1M ext.) | MIT | Hybrid MoE (KDA+MLA) |
| Qwen3-235B-A22B | 235B | 22B | 256K | Apache 2.0 | MoE densa |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | MoE densa |
| Ring-2.6-1T (predecesor) | ~1T | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la información proporcionada. Ling-3.0-flash se posiciona como una alternativa más eficiente que los MoE densos de gran tamaño, con un coste por token significativamente menor. Su licencia MIT es más permisiva que la Apache 2.0 de Qwen, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o comportamientos no deseados. Se recomienda realizar una evaluación propia en el dominio de aplicación.
- La información sobre idiomas soportados no está disponible; es probable que el modelo esté optimizado para inglés y chino, dado el origen del desarrollador, pero no se confirma.
- El modo de pensamiento está activado por defecto, lo que puede aumentar la latencia en tareas simples. Es posible desactivarlo, pero no se documenta el procedimiento.
- Aunque la licencia MIT permite uso comercial, la cuantización int4 puede implicar una pérdida de precisión en tareas de razonamiento complejo. Se recomienda probar la versión completa (si existe) para casos críticos.
- El despliegue requiere hardware de alta gama (80 GB VRAM) o configuraciones multi-GPU, lo que limita su uso en entornos con recursos reducidos.
- La integración con SGLang HiCache + Mooncake es específica de ese runtime; otros servidores de inferencia pueden no aprovechar las optimizaciones de caché.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash-int4
- Colección Ling 3.0 en HuggingFace: https://huggingface.co/collections/inclusionAI/ling-30
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.0-flash:free
- DeepInfra (demo API): https://deepinfra.com/inclusionAI/Ling-3.0-flash
- ZenMux: https://zenmux.ai/inclusionai/ling-3.0-flash
- UAI: https://uai.sh/models/inclusionai/ling-3.0-flash
