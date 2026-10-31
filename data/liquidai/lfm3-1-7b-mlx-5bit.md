# LiquidAI/LFM3-1.7B-MLX-5bit

## Resumen

LFM3-1.7B-MLX-5bit es una versión cuantizada a 5 bits, en formato MLX, del modelo LFM3-1.7B de Liquid AI, pensada específicamente para su ejecución en chips Apple Silicon (series M). El modelo base, LFM3-1.7B, pertenece a la familia de modelos LFM (Liquid Foundation Models) de Liquid AI, una empresa conocida por explorar arquitecturas alternativas a los transformers convencionales. Esta variante cuantizada reduce el peso de los parámetros a aproximadamente 1,19 GB, lo que la hace apta para inferencia en dispositivos locales con hardware de Apple sin necesidad de GPU dedicada.

El problema que resuelve es claro: permitir el despliegue on-device de un modelo de lenguaje conversacional multilingüe de tamaño reducido en Mac, con una huella de memoria mínima y sin depender de la nube. Con soporte declarado para 16 idiomas (entre ellos castellano) y un tamaño de apenas 1,73 mil millones de parámetros, resulta relevante para desarrolladores que buscan asistentes locales, prototipado rápido o aplicaciones con requisitos de privacidad.

Cabe señalar que el soporte de LFM3 en la librería mlx-lm estaba, en el momento de publicación de la model card, en proceso de integración, por lo que conviene verificar la versión de mlx-lm antes de su uso. La licencia aplicable es lfm1.0, una licencia personalizada de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 1.728.801.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, cuantizacion afina con grupos de 64 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia personalizada, "other") |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Esta ficha corresponde a una cuantización, no al modelo original. Los pesos proceden de LiquidAI/LFM3-1.7B y han sido cuantizados a 5 bits mediante cuantización afina con grupos de 64, el esquema habitual de MLX para equilibrio entre tamaño y calidad. El resultado ocupa 1,19 GB en disco, frente a los aproximadamente 3,5 GB que ocuparía el modelo en precisión de 16 bits.

Sobre la arquitectura subyacente y el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO, innovaciones técnicas), la model card remite a la ficha original de LFM3-1.7B y no incluye estos datos, por lo que no se detallan aquí. La familia LFM de Liquid AI se caracteriza públicamente por el uso de arquitecturas propias distintas del transformer puro, pero los detalles concretos de LFM3-1.7B no constan en la información disponible.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta "conversational".
- Capacidades multilingues: soporte declarado para 16 idiomas, incluidos castellano, ingles, chino, japones, arabe y hindi.
- Generacion de codigo, razonamiento y matematicas: no se describen explicitamente en la model card, aunque los ajustes de muestreo recomendados para "math and science" (temp 1.0, top-p 0.95, top-k 20) sugieren que el modelo se usa tambien para estas tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es unicamente text-generation.
- Ejecucion local en Apple Silicon mediante MLX, con recomendaciones de muestreo incluidas (temp 0.1 y top-k 50 para uso general; penalizacion de repeticion 1.1 en Python).

## Casos de uso

- Asistentes conversacionales locales en Mac: al ocupar 1,19 GB, puede ejecutarse en portatiles Apple Silicon sin GPU dedicada, lo que lo hace adecuado para chatbots de escritorio con privacidad total.
- Prototipado rapido de aplicaciones LLM: la integracion con mlx-lm permite probar prompts y flujos conversacionales directamente desde la linea de comandos o Python antes de escalar a modelos mayores.
- Procesamiento de texto multilingue en el dispositivo: con soporte de 16 idiomas, sirve para resumir, traducir informalmente o reescribir contenido en castellano y otros idiomas sin enviar datos a servicios externos.
- Aplicaciones con requisitos de privacidad: al ser inferencia 100% local, es util para manejar documentos sensibles (notas personales, correspondencia) sin exfiltracion de datos.
- Respuestas a preguntas de conocimiento general: el ejemplo de la propia model card ("¿cual es la capital de Australia?") ilustra su uso como sistema de QA ligero.
- Experimentacion con matematicas y ciencias: los parametros de muestreo recomendados para estas areas indican su uso en tareas de razonamiento cuantitativo basico, aunque sin garantias de nivel de precision documentadas.
- Integracion en apps nativas de Apple: el formato MLX facilita su inclusion en aplicaciones para macOS mediante el ecosistema MLX de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento del modelo base, consultar la model card original de LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 1,2 GB solo para los pesos; con contexto y overhead de ejecucion, es razonable estimar 2-3 GB de memoria unificada.
- Hardware compatible: exclusivamente Apple Silicon (chips M1, M2, M3, M4 y derivados), ya que el formato MLX no funciona en GPU NVIDIA ni AMD. No aplica el concepto habitual de GPU de datacenter (A100, H100); cualquier Mac con 8 GB de memoria unificada o mas deberia ejecutarlo sin problemas.
- Consumer hardware: cabe con holgura en cualquier Mac Apple Silicon actual, incluidos MacBook Air de gama base.
- Despliegue: mlx-lm (soporte para LFM3 en proceso de integracion en el momento de la model card; verificar versiones recientes). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Alternativa para otros entornos: usar el modelo base LiquidAI/LFM3-1.7B en precision completa o sus derivadas GGUF si existieran.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-5bit (este modelo) | 1,73 B | 5 bits (grupos de 64) | MLX / safetensors | 16 | lfm1.0 (personalizada) |
| LFM3-1.7B (base) | 1,73 B | sin cuantizar | safetensors | 16 | lfm1.0 (personalizada) |
| Qwen3-1.7B (referencia de categoria, datos aproximados) | 1,7 B | multiples | safetensors, GGUF | ~100 | Apache 2.0 |

Nota: la comparativa con Qwen3-1.7B es orientativa, basada en conocimiento general de modelos de tamano equivalente; los datos concretos de rendimiento comparado no estan disponibles en la informacion proporcionada. La ventaja diferencial de esta variante es su formato MLX nativo para Apple Silicon; su limitacion frente a alternativas es la falta de ecosistema GGUF/llama.cpp documentado y una licencia personalizada menos permisiva que Apache 2.0.

## Limitaciones y advertencias

- Licencia personalizada (lfm1.0): no es una licencia estandar abierta; revisar los terminos en el enlace LICENSE antes de cualquier uso comercial, ya que pueden existir restricciones.
- Soporte de mlx-lm incompleto en el momento de la model card: el soporte de LFM3 estaba "en proceso", por lo que versiones antiguas de mlx-lm no ejecutaran el modelo.
- Sin penalizacion de repeticion por linea de comandos: hay que aplicarla programaticamente en Python (make_logits_processors(repetition_penalty=1.1)), un detalle facil de pasar por alto.
- Ajustes de muestreo sensibles a la tarea: los parametros recomendados difieren segun uso general (temp 0.1) o matematicas/ciencias (temp 1.0, top-p 0.95, top-k 20); usar los inadecuados puede degradar la calidad.
- Riesgo de alucinacion: no documentado especificamente para este modelo, pero inherente a todo LLM de lenguaje de tamano pequeno; verificar hechos en usos criticos.
- Calidad en castellano: el castellano figura entre los idiomas soportados, pero no hay datos publicos sobre su calidad relativa frente al ingles en la informacion disponible.
- Plataforma limitada: el formato MLX solo funciona en Apple Silicon; para Linux, Windows o GPU NVIDIA debe usarse el modelo base u otra variante.
- Contexto y capacidades (tool calling, multimodalidad): no documentados en esta ficha; consultar la model card del modelo base antes de disenar aplicaciones que dependan de ventanas de contexto largas.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-5bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- mlx-lm (GitHub): https://github.com/ml-explore/mlx-lm
- Guia MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentacion LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
