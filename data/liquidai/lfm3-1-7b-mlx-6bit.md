# LiquidAI/LFM3-1.7B-MLX-6bit

## Resumen

LFM3-1.7B-MLX-6bit es una versión cuantizada a 6 bits, en formato MLX, del modelo LFM3-1.7B de Liquid AI, destinada a su ejecución en hardware Apple Silicon (Mac con chips M1/M2/M3/M4). El modelo base, LFM3-1.7B, pertenece a la familia de Liquid Foundation Models (LFM), una línea de modelos de lenguaje compactos orientados a inferencia eficiente en dispositivo. Esta variante reduce el peso del modelo a aproximadamente 1,41 GB, manteniendo 1.728.801.536 parámetros, lo que la hace adecuada para portátiles y equipos de escritorio de Apple sin necesidad de GPU dedicada.

Su relevancia radica en la tendencia actual de ejecutar LLM pequeños y multilingües localmente: con soporte para 16 idiomas (incluido el castellano) y un tamaño que cabe holgadamente en la memoria unificada de cualquier Mac moderno, este modelo cubre el nicho de asistentes conversacionales y generación de texto en local. El repositorio se publica bajo la licencia propia lfm1.0 (tipo "other" en HuggingFace) y su uso recomendado es mediante la librería mlx-lm, aunque la model card indica que el soporte oficial de LFM3 en mlx-lm todavía está en proceso de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model (LFM3); detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el comando de ejemplo usa --max-tokens 16384) |
| Tipos de cuantizacion | 6 bits, cuantizacion afín con grupos de 64 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia, tipo "other") |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B, tercera generacion de la familia Liquid Foundation Models de Liquid AI. La model card de esta variante cuantizada remite a la model card original para los detalles de arquitectura y uso, que no estan incluidos en la informacion proporcionada, por lo que no se pueden especificar aqui el tipo exacto de capas (transformer clasico, hibrido, SSM), la longitud de contexto oficial ni el proceso de entrenamiento.

Lo que si queda documentado es el proceso de cuantizacion: los pesos se han convertido a 6 bits mediante cuantizacion afín con grupos de 64, el esquema estandar de MLX, lo que reduce el tamano de los pesos de varios GB (en precision completa) a 1,41 GB. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Soporte multilingue en 16 idiomas, incluidos castellano, ingles, chino, japones, arabe, hindi y ruso.
- Ejecucion eficiente en Apple Silicon gracias al formato MLX y la cuantizacion a 6 bits.
- Generacion de secuencias largas: el comando de ejemplo de la model card usa --max-tokens 16384.
- No se menciona en la informacion disponible soporte de vision, audio, tool calling ni modos de razonamiento explicitos.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse completamente en dispositivo con mlx-lm, sin enviar datos a la nube, lo que lo hace adecuado para asistentes que manejan informacion sensible.
- Aplicaciones multilingues en el escritorio: con soporte de 16 idiomas, puede integrarse en herramientas de escritura o traduccion informal que deban funcionar en castellano, frances, aleman, japones u otros idiomas sin conexion.
- Prototipado rapido de agentes ligeros: su tamano de 1,4 GB permite iterar prompts y pipelines de generacion en un portatil sin coste de API, antes de escalar a modelos mayores.
- Generacion de texto en aplicaciones iOS/macOS: el formato MLX esta disenado para el ecosistema Apple, lo que facilita su inclusion en apps nativas con memoria unificada.
- Respuesta a preguntas y consultas generales: el ejemplo oficial de la model card (preguntas de conocimiento general con temperatura baja de 0,1) ilustra su uso en modo pregunta-respuesta determinista.
- Tareas de matematicas y ciencias: la model card recomienda una configuracion especifica de muestreo (--temp 1.0 --top-p 0.95 --top-k 20) para estos dominios, lo que indica soporte previsto para razonamiento en estas areas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 1,41 GB; con contexto y overhead de ejecucion, es razonable estimar un consumo total de memoria de entre 2 y 4 GB, muy por debajo de la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: no requiere GPU dedicada; esta pensado para Apple Silicon (M1, M2, M3, M4). Para inferencia con el modelo base en otros entornos (CUDA, vLLM), no se proporcionan requisitos en la informacion disponible.
- Cabe en GPUs consumer: al ocupar solo 1,41 GB, cabria con holgura en cualquier GPU moderna (por ejemplo, una RTX 4060 con 8 GB), aunque este repositorio concreto esta en formato MLX y esta orientado a Apple Silicon; para otras plataformas habria que usar el modelo base o conversiones GGUF si existen.
- Despliegue: mlx-lm (CLI con mlx_lm.generate o API de Python). La model card advierte que el soporte de LFM3 en mlx-lm esta "en progreso" y se actualizara cuando una version lo incluya de forma oficial. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,7 B paramentros cuantizado a 6 bits en MLX, cabe esperar velocidades de generacion altas en Apple Silicon, pero no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-6bit (este) | 1,73 B | 6 bits (grupos de 64) | MLX/safetensors | 16 | lfm1.0 (propietaria) |
| Qwen3-1.7B | ~1,7 B | multiples (GGUF, AWQ, etc.) | safetensors, GGUF | ~100 | Apache 2.0 |
| Gemma 3 1B (Google) | ~1 B | multiples | safetensors, GGUF | ~100+ | Gemma (propietaria con permisos) |
| Llama 3.2 1B (Meta) | ~1,2 B | multiples | safetensors, GGUF | ~8 oficialmente | Llama Community License |

Nota: la comparativa se basa en caracteristicas genericas conocidas de los modelos alternativos; los datos de rendimiento no se incluyen porque no hay benchmarks publicados en la informacion disponible. La ventaja diferencial de esta variante es su optimizacion nativa para Apple Silicon via MLX; frente a ella, alternativas como Qwen3-1.7B ofrecen licencias mas permisivas y un ecosistema de cuantizacion mas amplio (GGUF para llama.cpp/Ollama).

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia de Liquid AI de tipo "other": antes de cualquier uso comercial hay que revisar el texto completo de la licencia en el repositorio, ya que puede incluir restricciones o requisitos de registro.
- El soporte oficial de LFM3 en mlx-lm todavia esta en desarrollo segun la model card, por lo que la ejecucion puede requerir versiones de desarrollo o presentar incompatibilidades hasta que se publique una version compatible.
- La CLI de mlx-lm no incluye flag de penalty por repeticion; hay que aplicarlo programaticamente con make_logits_processors(repetition_penalty=1.1), algo facil de olvidar y que puede degradar la calidad de salidas largas si se omite.
- No hay benchmarks publicados en la informacion disponible, por lo que no es posible evaluar objetivamente su calidad frente a competidores del mismo tamano antes de probarlo.
- Riesgo de alucinacion: al tratarse de un modelo de 1,7 B paramentros, es esperable una tasa de alucinacion superior a la de modelos de mayor tamano, especialmente en preguntas de conocimiento factual.
- No hay informacion sobre sesgos conocidos, longitud de contexto oficial ni soporte de tool calling; hay que consultar la model card del modelo base para mas detalles.
- Esta variante esta limitada al ecosistema MLX/Apple Silicon; para despliegue en servidores Linux con GPU NVIDIA habria que usar el modelo base LiquidAI/LFM3-1.7B.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-6bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
