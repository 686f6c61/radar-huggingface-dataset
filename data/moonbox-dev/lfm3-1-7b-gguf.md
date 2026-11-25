# moonbox-dev/LFM3-1.7B-GGUF

## Resumen

LFM3 1.7B GGUF es una conversión al formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el usuario moonbox-dev para su uso con llama.cpp en entornos de inferencia local (Metal, CUDA, Vulkan y CPU). El modelo base lo desarrolla Liquid AI, empresa conocida por sus modelos de arquitectura no transformer (familia LFM, basada en operadores con estado), y esta ficha cubre exclusivamente la distribución cuantizada de 1.700 millones de parámetros que moonbox-dev pone a disposición en Hugging Face.

El repositorio contiene un único archivo BF16 (`lfm3-1-7b-BF16.gguf`, 3,47 GB) que preserva los pesos originales sin modificar, verificado tensor a tensor (286 tensores comprobados) contra el checkpoint de LiquidAI. Según la model card, el autor genera a partir de ese BF16 las demás precisiones con `llama-quantize`, usando matrices de importancia (imatrix) calculadas sobre WikiText-2 para Q6_K, Q5_K_M y Q4_K_M. El modelo es solo de texto, por lo que no se incluye archivo `mmproj`.

La relevancia de esta ficha es práctica: permite desplegar un modelo de 1,7B con capacidad de razonamiento explícito (el modelo "piensa antes de responder" y llama-server expone ese pensamiento como `reasoning_content`) en hardware de consumo, con criterios de calidad de cuantización documentados por el autor. La licencia es lfm1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM de Liquid AI) |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (archivo publicado); Q6_K, Q5_K_M y Q4_K_M mencionados con imatrix; F16 y Q8_0 mencionados sin imatrix |
| Idiomas soportados | no disponibles (los prompts de evaluacion del autor son 8 en ingles y 4 en chino) |
| Licencia | lfm1.0 (etiquetada como `other` / `license_name: lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 3,5 GB |
| Modelo base | LiquidAI/LFM3-1.7B (revision `1da06bec6a`) |
| Herramienta de conversion | llama.cpp `b12621` (`convert_hf_to_gguf.py`, `llama-quantize`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia LFM3 de Liquid AI y de la etiqueta `liquid` en el repositorio. No se especifican el tipo de bloque (transformer, SSM, hibrido u operadores con estado), el numero de capas, las dimensiones ocultas ni la ventana de contexto. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

Lo que si esta documentado es el proceso de cuantizacion: conversion desde el checkpoint original a BF16 con `convert_hf_to_gguf.py`, verificacion de los 286 tensores del checkpoint contra el archivo BF16 resultante (mismos valores), y generacion de las demas precisiones con `llama-quantize` y sus mezclas estandar. Para Q6_K, Q5_K_M y Q4_K_M se calculo una matriz de importancia con `llama-imatrix` sobre 200 secuencias de 512 tokens de WikiText-2 train, usando el archivo Q8_0 como referencia. El autor aplica un criterio de aceptacion objetivo por archivo: divergencia KL <= 0,01 nats respecto a la distribucion top-64 del BF16 y coincidencia del token mas probable >= 90 % en un conjunto de 12 prompts (8 en ingles, 4 en chino) con decodificacion greedy y 64 tokens de referencia.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia del modelo.
- Razonamiento explicito: el modelo genera una cadena de pensamiento antes de la respuesta; llama-server la devuelve en el campo `reasoning_content` de la API compatible con `/v1/chat/completions`.
- Capacidad multilingue parcial: la evaluacion del autor incluye prompts en ingles y chino, aunque no se publica la lista oficial de idiomas soportados.
- Inferencia local en CPU, CUDA, Metal y Vulkan mediante llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No consta soporte de vision, audio, tool calling ni function calling en la informacion disponible.
- No consta soporte explicito de agentes o multi-step reasoning mas alla del modo de pensamiento previo a la respuesta.

## Casos de uso

- Asistente conversacional local en portatil o mini-PC: con el archivo BF16 (3,47 GB) o una cuantizacion menor, el modelo cabe en equipos sin GPU dedicada y permite mantener conversaciones multi-turno sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones de chat sobre llama.cpp: el servidor expone una API compatible con OpenAI (`/v1/chat/completions`), de modo que se puede integrar en un frontend o SDK existente sin adaptadores adicionales.
- Evaluacion de cadenas de razonamiento: al separar el pensamiento (`reasoning_content`) de la respuesta final, resulta adecuado para experimentos que comparan calidad de razonamiento frente a respuestas directas en modelos pequenos.
- Despliegue en dispositivos de borde con aceleracion grafica integrada: los binarios de llama.cpp con soporte Metal y Vulkan permiten ejecutar el modelo en Macs con Apple Silicon o en equipos con GPU integrada Intel/AMD.
- Filtrado y clasificacion de texto en pipelines offline: un modelo de 1,7B con contexto de chat puede etiquetar, resumir o reformatear lotes de documentos en entornos sin conectividad.
- Base para fine-tuning o destilacion en experimentos de investigacion: al estar disponible el BF16 con pesos verificados, sirve como punto de partida reproducible para estudiar el efecto de la cuantizacion en modelos pequenos con modo de razonamiento.
- Educacion y demos: el tamano reducido y el formato GGUF facilitan talleres y demostraciones de inferencia local sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El unico dato de evaluacion disponible es la prueba interna del autor sobre fidelidad de cuantizacion, con el siguiente criterio: KL <= 0,01 nats respecto al BF16 y coincidencia del token mas probable >= 90 %.

| Precision | Tamano | KL vs BF16 | Coincidencia top-1 | Veredicto |
|---|---|---|---|---|
| BF16 | 3,47 GB | referencia | referencia | pesos originales verificados |
| Q6_K | no disponible | no disponible | no disponible | pasa el criterio del autor |
| Q5_K_M | no disponible | no disponible | no disponible | pasa; el mas pequeno dentro del criterio |
| Q4_K_M | no disponible | 0,023 nats | no disponible | marcado como experimental (no cumple KL <= 0,01) |
| F16 | no disponible | no disponible | no disponible | sin imatrix |
| Q8_0 | no disponible | no disponible | no disponible | sin imatrix |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el BF16 ocupa 3,47 GB en disco y requiere del orden de 4 GB de memoria; las cuantizaciones Q6_K, Q5_K_M y Q4_K_M reducen el peso, aunque la model card no publica sus tamanos exactos.
- GPU recomendadas: el autor valido las cuantizaciones en una RTX 3080 Laptop (CUDA); cualquier GPU con >= 4-6 GB de VRAM libre puede ejecutar el modelo con `-ngl 99`.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090, Apple Silicon (Metal) y GPUs integradas con Vulkan; tambien funciona en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con version `b12621` o superior; el formato GGUF es compatible con otros runners basados en llama.cpp.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3 1.7B GGUF (esta ficha) | 1,7B | no disponible | lfm1.0 | GGUF | Razonamiento explicito; conversion verificada tensor a tensor |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | lfm1.0 | safetensors | Modelo original; sin cuantizar |
| Otros modelos de ~1,5-2B en GGUF | ~1,5-2B | no disponible | variable | GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M no cumple el criterio de calidad del autor (KL 0,023 frente al limite de 0,01) y esta marcada como experimental; en un modelo de 1,7B el margen para pesos de 4 bits es reducido.
- El conjunto de evaluacion del autor es muy pequeno (12 prompts, 8 en ingles y 4 en chino, 64 tokens) y no sustituye a una evaluacion estandar de capacidades.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento en dominios especializados; al ser un modelo pequeno, la tasa de alucinacion en tareas de conocimiento factual puede ser elevada.
- La lista de idiomas soportados no esta publicada; el uso fuera de ingles y chino no esta validado.
- La longitud de contexto no esta disponible, lo que impide garantizar el rendimiento en conversaciones o documentos largos.
- Licencia lfm1.0: es una licencia "other" con terminos propios; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede incluir restricciones adicionales.
- Los archivos son una obra derivada del modelo de Liquid AI y heredan su licencia; el autor de la conversion no concede permisos adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente de la conversion.
- El proceso depende de una version concreta de llama.cpp (`b12621`); versiones anteriores pueden no cargar correctamente el archivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
