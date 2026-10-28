# LiquidAI/LFM3-1.7B-MLX-4bit

## Resumen

LFM3-1.7B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo LFM3-1.7B de Liquid AI, empaquetada específicamente para su ejecución en Apple Silicon. Liquid AI es una empresa estadounidense surgida del MIT que desarrolla los denominados Liquid Foundation Models (LFM), una familia de modelos de propósito general orientada a despliegue en dispositivo, en el borde (edge) y en la nube con baja latencia.

El modelo base cuenta con 1.728.801.536 parámetros (aproximadamente 1,73 mil millones) y está etiquetado como modelo de generación de texto con orientación conversacional. Esta variante aplica cuantización afín de 4 bits con grupos de 64, lo que reduce los pesos a 0,97 GB y el repositorio completo a 1,0 GB, un tamaño manejable en la memoria unificada de cualquier Mac con Apple Silicon.

Su relevancia ahora es práctica: permite ejecutar un modelo de casi 1.700 millones de parámetros de forma totalmente local en un portátil o un Mac mini, sin conexión a red ni envío de datos a terceros, con soporte para 16 idiomas (incluido el castellano). La contrapartida es que el soporte de LFM3 en mlx-lm está todavía en desarrollo según la propia model card, y que la información publicada sobre arquitectura, contexto y benchmarks es escasa: esta ficha se limita a lo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Liquid AI denomina a la familia "Liquid Foundation Models" (LFM), pero la arquitectura concreta de LFM3 no se detalla en la informacion proporcionada (la model card remite a la del modelo base) |
| Parametros totales | 1.728.801.536 (≈1,73 B), dato real de los safetensors |
| Longitud de contexto | No disponible. El ejemplo de la model card usa `--max-tokens 16384`, pero ese valor es longitud de generacion, no ventana de contexto declarada |
| Tipos de cuantizacion | 4 bits, cuantizacion afin con grupos de 64 (formato MLX) |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other` / `license_name: lfm1.0`); terminos concretos en el fichero LICENSE del repositorio, no disponibles en la informacion proporcionada |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), pesos de 0,97 GB; repositorio de 1,0 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye la arquitectura interna de LFM3-1.7B: la model card de esta variante cuantizada remite explícitamente a la del modelo base para los detalles de arquitectura y uso. Lo único verificable es que se trata de un modelo denso de 1,73 mil millones de parámetros (no hay indicios de arquitectura MoE en los datos disponibles), etiquetado como `text-generation` y `conversational`, con el tag `custom_code`, lo que implica que la implementación requiere código propio del autor en lugar de una clase estándar de transformers.

Tampoco hay datos sobre volumen de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas específicas de esta versión. Respecto a la cuantización, sí está documentado el esquema: cuantización afín de 4 bits con tamaño de grupo 64, aplicada sobre los pesos del modelo base para su uso con mlx-lm en Apple Silicon. La model card advierte de que el soporte de LFM3 en mlx-lm está en curso y que se actualizará cuando exista una release compatible; hasta entonces, la ejecución puede requerir `trust_remote_code`.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` y el modelo está etiquetado como `conversational`.
- Multilingüismo: 16 idiomas declarados, entre ellos castellano, inglés, francés, alemán, portugués, italiano, árabe, chino, japonés, coreano, hindi, ruso, polaco, vietnamita, tailandés e indonesio.
- Ejecución local en dispositivo: pensado para Apple Silicon vía MLX, con pesos de menos de 1 GB.
- Ajuste de decodificación documentado: `--temp 0.1 --top-k 50` para uso general y `--temp 1.0 --top-p 0.95 --top-k 20` para matemáticas y ciencia; en Python, `make_logits_processors(repetition_penalty=1.1)`.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Modo thinking, visión o audio: no documentado en la informacion proporcionada (la familia LFM incluye modelos de visión y audio según la web del autor, pero no hay constancia de que esta variante los cubra).
- Capacidad de código y matemáticas: no se publican evaluaciones al respecto en la informacion proporcionada.

## Casos de uso

- Asistente conversacional 100 % offline en un Mac: el modelo cabe en 0,97 GB de pesos, por lo que puede ejecutarse con mlx-lm en un portátil sin conexión, manteniendo las conversaciones íntegramente en el dispositivo.
- Traducción entre los 16 idiomas soportados: útil para traducción de correspondencia o documentación interna donde enviar el texto a una API externa no es aceptable por política de datos.
- Procesamiento de documentos sensibles: resumen y reescritura de contratos, informes médicos o expedientes en un equipo local, sin salida de datos a terceros.
- Prototipado rápido de aplicaciones macOS/iOS: sirve como modelo de referencia barato para validar prompts, plantillas de chat y flujos conversacionales antes de escalar a un modelo mayor.
- Evaluación de cuantización: al ser una versión 4-bit de un modelo base publicado, permite medir la pérdida de calidad frente al original en tareas concretas antes de decidir el formato de despliegue.
- Filtrado y clasificación de texto en local: etiquetado de tickets, moderación preliminar o extracción de campos simples en pipelines por lotes ejecutados en un Mac Studio o un Mac mini de sobremesa.
- Educación y experimentación: reproducción de experimentos de inferencia en hardware de consumo sin GPU dedicada, con un coste de infraestructura nulo.
- Integración en herramientas de escritorio: al ser un modelo pequeño, encaja como motor de autocompletado o de chat de ayuda dentro de una aplicación nativa para macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües, y tampoco se aportan datos de latencia o throughput. No se debe asumir ningún nivel de rendimiento sin consultar la model card del modelo base.

## Requisitos de hardware

- VRAM / memoria: los pesos ocupan 0,97 GB. Sumando caché KV y overhead del runtime, el consumo realista se sitúa en torno a 1,5–2 GB para contextos moderados, aunque no hay cifras oficiales publicadas.
- Hardware objetivo: Apple Silicon exclusivamente (MLX). El formato no es ejecutable en CUDA ni en CPU x86 sin conversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o más; 16 GB ofrece margen holgado para contextos largos y ejecución en paralelo con otras aplicaciones.
- GPU recomendadas: no aplica en el sentido habitual (A100, H100, RTX 4090 no son compatibles con MLX). El equivalente es cualquier chip de la serie M de Apple; un Mac con 16 GB o más es el escenario recomendado.
- Opciones de despliegue: `mlx-lm` (soporte de LFM3 en desarrollo según la model card), línea de comandos `mlx_lm.generate` y API de Python con `generate` y `make_logits_processors`. vLLM y TGI no soportan MLX; llama.cpp y Ollama requerirían partir de los pesos del modelo base y convertirlos a GGUF, no de este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-4bit (este modelo) | 1,73 B | No disponible | safetensors MLX, 4-bit afin grupo 64 (0,97 GB) | lfm1.0 | Hugging Face, 687 descargas, 14 likes |
| LFM3-1.7B (modelo base) | 1,73 B | No disponible | No disponible en la informacion proporcionada | lfm1.0 | Hugging Face (referenciado en la model card) |
| LFM2.5-8B-A1B (misma familia) | 8 B (MoE, segun el nombre del modelo) | No disponible | No disponible | No disponible | Hugging Face, segun la pagina de LiquidAI |

No se dispone de especificaciones verificables de otras alternativas de tamaño similar (familias Qwen, Llama o Gemma en el rango de 1–2 B) en la informacion proporcionada, por lo que la comparación cuantitativa con ellas queda como no disponible.

## Limitaciones y advertencias

- Es una versión cuantizada a 4 bits: existe degradación esperable frente al modelo base en tareas sensibles a la precisión, como matemáticas, código o razonamiento encadenado. No se publican métricas de esa pérdida.
- El soporte de LFM3 en mlx-lm está en curso según la model card; hasta que exista una release compatible, la ejecución puede fallar o requerir código remoto (`custom_code`), con el riesgo de seguridad que ello implica.
- Restricción de plataforma: el formato MLX solo funciona en Apple Silicon; no es portable a CUDA, ROCm ni CPU x86 sin reconvertir los pesos.
- Ventana de contexto no documentada: no se debe diseñar una aplicación que dependa de contextos largos sin verificarla empíricamente.
- Riesgo de alucinación: inherente a un modelo de 1,73 B parámetros; no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación.
- Cobertura idiomática desigual: aunque se declaran 16 idiomas, no hay datos de calidad por idioma; el rendimiento en castellano, hindi o tailandés puede diferir notablemente del inglés.
- Licencia lfm1.0: es una licencia propia etiquetada como `other`. Antes de un uso comercial es obligatorio revisar el fichero LICENSE del repositorio, ya que los términos concretos (incluidas posibles restricciones de uso, atribución o escalado) no están disponibles en la informacion proporcionada.
- Ausencia total de benchmarks publicados: cualquier decisión de producción basada en este modelo debería ir precedida de una evaluación propia sobre el caso de uso concreto.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, por lo que no es una elección segura para pipelines de agentes sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Organización Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Sitio web de Liquid AI: https://www.liquid.ai/
- Página de modelos LFM: https://www.liquid.ai/models
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM (primeros pasos): https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Playground: https://playground.liquid.ai/
- Consola de API: https://console.liquid.ai/dashboard
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Wikipedia (Liquid AI): https://en.wikipedia.org/wiki/Liquid_AI
