# here-be-dragons-ai/Kolibri-1.1-MLX-3bit

## Resumen

Kolibri-1.1-MLX-3bit es una cuantización comunitaria de 3/6 bits mixtos del modelo Kolibri-1.1 de Aleph Alpha, un modelo de razonamiento de tipo mezcla de expertos (MoE) de 75.112.665.344 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token (75B-A3.4B). Está diseñado específicamente para alemán e inglés y ha sido convertido por here-be-dragons-ai para ejecutarse en Apple Silicon mediante la librería MLX, no mediante llama.cpp ni vLLM.

El problema que resuelve es la imposibilidad de ejecutar un modelo de 75B en un Mac con memoria unificada limitada: la cuantización reduce los pesos a 31,6 GiB en disco (3,61 bits por peso de media), permitiendo su funcionamiento en un equipo de 48 GB de RAM. No es una versión oficial de Aleph Alpha, sino una conversión de la comunidad que incluye código de modelo propio (`kolibri1_1.py`, 624 líneas) al no existir la arquitectura `kolibri1_1` en mlx-vlm.

La relevancia actual radica en que demuestra la viabilidad de servir modelos MoE de razonamiento de gran tamaño en hardware de consumo Apple, con atención dispersa, K/V compartidas y cuantización NVFP4 en las capas dispersas, manteniendo la licencia Apache 2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse attention) en cada quinta capa, K/V compartidas y MLP denso en capas 0 y 1 |
| Parametros totales | 75.112.665.344 |
| Parametros activos | Aproximadamente 3.400 millones (75B-A3.4B) |
| Longitud de contexto | No disponible de forma explícita; el modelo soporta más de 16.384 tokens (se describe el comportamiento de la indexación de bloques más allá de esa longitud) |
| Tipos de cuantizacion | 3 bits afín (grupo 64) para expertos enrutados; 6 bits afín (grupo 64) para atención, experto compartido, MLP denso de capas 0 y 1, embedding y LM head; bf16 para el router MoE (`mlp.gate`); fp32 para `expert_bias` |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 31,6 GiB en disco, 3,61 bits por peso de media |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con innovaciones específicas respecto a Kolibri 1: atención dispersa en cada quinta capa, donde cada query atiende a los primeros 8 tokens, los últimos 128 y las 2.048 claves con mayor puntuación; más allá de 16.384 tokens, cuatro capas indexadoras reducen primero la selección a los mejores 1.024 bloques de 16 claves. Seis de las diez capas dispersas comparten claves y valores (K/V) con una capa anterior, y las K y V de las capas dispersas se redondean a NVFP4 tal como se entrenó el modelo. Las capas 0 y 1 usan un MLP denso en lugar de MoE.

El código de modelo incluido es un port de la implementación de llama.cpp de Aleph Alpha (PR #32891) y de su plugin de vLLM (`aleph-alpha-inference` 2.0.0). La cuantización se realizó descomprimiendo los pesos FP8 por bloques del release original a bf16 y cuantizando una sola vez, sin formato intermedio. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada; esos detalles deben consultarse en la model card original de Aleph Alpha.

## Capacidades

- Generación de texto y razonamiento en alemán e inglés, con modo de pensamiento (thinking mode) controlable mediante `reasoning_effort` (`none`, `low`, `medium`, `high`) o `enable_thinking`.
- Razonamiento multi-paso y descomposición de problemas, con la traza de pensamiento devuelta en el campo `reasoning` separada del contenido final.
- Soporte de tool calling / function calling mediante el campo estándar `tools`, combinable con razonamiento.
- Capacidades de agente y razonamiento multi-paso, adecuadas para flujos que requieren planificación y uso de herramientas.
- Capacidades multilingües limitadas a alemán e inglés.
- No se documentan capacidades de visión, audio ni otras modalidades; es un build solo de texto (el processor devuelto por `load()` es el tokenizador).

## Casos de uso

- **Asistente de razonamiento en local para desarrolladores en Mac**: ejecutar el modelo con mlx-vlm en un Mac de 48 GB para tareas de análisis y depuración de código sin enviar datos a la nube, aprovechando el modo de pensamiento configurable para equilibrar latencia y profundidad.
- **Atención al cliente en alemán e inglés**: gestionar conversaciones multi-turno con contexto largo (más de 16.384 tokens) gracias a la atención dispersa y al indexado por bloques, manteniendo coherencia en diálogos extensos.
- **Generación de código asistida con tool calling**: integrar el modelo en un servidor compatible con OpenAI (`python -m mlx_vlm.server`) y conectar herramientas de ejecución de código o consulta de documentación mediante el campo `tools`.
- **Procesamiento de documentos legales o técnicos en alemán**: resumir y razonar sobre textos largos en alemán, aprovechando la ventana de contexto extendida y el entrenamiento específico del modelo en ese idioma.
- **Automatización de flujos agénticos en estaciones de trabajo Apple**: desplegar agentes que planifican y ejecutan pasos con razonamiento intermedio, usando `reasoning_effort=high` para tareas complejas y `none` para respuestas rápidas.
- **Prototipado e investigación en soberanía digital**: evaluar modelos de razonamiento de gran tamaño en hardware local sin dependencia de proveedores cloud, gracias a la licencia Apache 2.0 y a la posibilidad de inspeccionar el código del modelo incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación publicados por Aleph Alpha corresponden al modelo sin cuantizar servido con vLLM, no a este build. Se documenta una medición de calidad (divergencia KL respecto al release FP8) en el repositorio `local-sovereign-mlx`, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- **RAM**: 48 GB de memoria unificada como mínimo; los pesos ocupan 31,6 GiB, por lo que es necesario elevar el límite de memoria cableada de la GPU con `sudo sysctl -w iogpu.wired_limit_mb=40960` (hasta el siguiente reinicio) para dejar espacio al contexto.
- **GPU recomendadas**: Apple Silicon (mediciones realizadas en un M5 Pro de 48 GB). No está pensado para GPU NVIDIA ni AMD; requiere MLX.
- **¿Cabe en GPU de consumo?**: sí, en Apple Silicon con 48 GB o más de memoria unificada. No aplica a GPUs discretas convencionales por el backend MLX.
- **Opciones de despliegue**: mlx-vlm 0.8.0 o superior (mlx 0.32.4 probado); servidor compatible con OpenAI mediante `python -m mlx_vlm.server`. mlx-lm no puede cargar este build porque el código del modelo se basa en módulos de mlx-vlm. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- **Latencia y throughput**: no disponibles en la información proporcionada; la model card menciona mediciones realizadas el 2026-11-24 en un M5 Pro con 48 GB, pero no incluye cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kolibri-1.1-MLX-3bit | 75,1B totales / ~3,4B activos | >16.384 tokens (no explicitado) | Apache 2.0 | Hugging Face (MLX, safetensors) | Cuantización comunitaria 3/6 bits para Apple Silicon |
| Aleph-Alpha/Kolibri-1.1 | 75,1B totales / ~3,4B activos | No disponible | Apache 2.0 | Hugging Face (formato original, FP8 por bloques) | Modelo base sin cuantizar; requiere vLLM o llama.cpp |
| Kolibri-1 (versión anterior) | No disponible | No disponible | No disponible | Hugging Face | Predecesor; sin atención dispersa, K/V compartidas ni NVFP4 |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- **Código de modelo ejecutado sin confirmación**: mlx-vlm importa y ejecuta `kolibri1_1.py` al cargar el modelo, sin interruptor `trust_remote_code` y sin preguntar. Es imprescindible revisar el archivo antes de usarlo.
- **Desviación respecto al entrenamiento**: la clave de bloque se calcula como media redondeada de claves redondeadas, mientras que el entrenamiento promedia las no redondeadas; solo afecta más allá de 16.384 tokens.
- **Resultados de evaluación no aplicables**: los benchmarks publicados por Aleph Alpha corresponden al modelo sin cuantizar con vLLM, no a este build.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada; debe consultarse la guía de uso responsable de Aleph Alpha.
- **Limitación de idiomas**: solo alemán e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- **Restricciones de memoria**: requiere 48 GB de RAM y ajuste del límite de memoria cableada; sin ello, el contexto disponible es nulo.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser una conversión comunitaria no oficial, la responsabilidad sobre el comportamiento del modelo recae en el usuario.
- **Compatibilidad limitada**: solo mlx-vlm 0.8.0 o superior; no funciona con mlx-lm, vLLM, llama.cpp ni Ollama.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/here-be-dragons-ai/Kolibri-1.1-MLX-3bit)
- [Modelo base Aleph-Alpha/Kolibri-1.1](https://huggingface.co/Aleph-Alpha/Kolibri-1.1)
- [Blog de Aleph Alpha sobre Kolibri-1.1](https://aleph-alpha.com/en/blog/kolibri-1-1/)
- [Guía de uso responsable de Aleph Alpha](https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md)
- [Repositorio local-sovereign-mlx](https://github.com/here-be-dragons-ai/local-sovereign-mlx)
- [Código fuente kolibri1_1](https://github.com/here-be-dragons-ai/local-sovereign-mlx/tree/main/kolibri1_1)
- [Script de arranque start-mlx_kolibri11.sh](https://github.com/here-be-dragons-ai/local-sovereign-mlx/blob/main/start-mlx_kolibri11.sh)
- [Documentación de calidad](https://github.com/here-be-dragons-ai/local-sovereign-mlx/tree/main/docs/kolibri11-quality)
- [Método de evaluación de calidad](https://github.com/here-be-dragons-ai/local-sovereign-mlx/blob/main/docs/quality-method.md)
- [PR de llama.cpp #32891](https://github.com/ggml-org/llama.cpp/pull/32891)
