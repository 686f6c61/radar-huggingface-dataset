# gernblanksten/supergemma4-26b-uncensored-gguf-v2

## Resumen
SuperGemma4-26B-Uncensored-Fast GGUF v2 es una cuantizacion GGUF Q4_K_M del modelo `supergemma4-26b-uncensored-fast-v2`, un ajuste fino derivado de `google/gemma-4-26B-A4B-it`. Lo publica el usuario `gernblanksten` en Hugging Face y esta orientado a inferencia local rapida con `llama.cpp`, con especial atencion a Apple Silicon. El modelo conserva la arquitectura MoE del Gemma 4 original (26B parametros totales, 4B activos segun el sufijo A4B) y anade un comportamiento de chat menos restrictivo que el de la version oficial.

La propuesta del autor es triple: un modelo menos censurado que el chat oficial, mas capaz en tareas practicas de texto que la base cruda y empaquetado en un GGUF compacto (16,8 GB) que se sirve con soltura en hardware de consumo. El autor reporta 222 tok/s de procesamiento de prompt y 89,4 tok/s de generacion en un Apple M4 Max con `llama.cpp`, ademas de una plantilla de chat neutra embebida para evitar que las preguntas generales deriven hacia modo codigo o tool calling.

Es relevante ahora porque combina tres tendencias: la familia Gemma 4 con arquitectura MoE eficiente, el ecosistema GGUF para despliegue local y la demanda de variantes sin censura para investigacion y uso creativo. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y su procedencia es un ajuste comunitario no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de Gemma 4, segun modelo base) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (inferido del sufijo A4B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo base `google/gemma-4-26B-A4B-it` es un transformer con mezcla de expertos (MoE) de 26B parametros totales y aproximadamente 4B activos por token, segun la nomenclatura A4B. El autor indica que los tensores de expertos MoE de Gemma 4 requirieron un conversor local parcheado para exportar correctamente a GGUF, lo que sugiere que el pipeline de conversion estandar no soportaba esta arquitectura en el momento de la publicacion.

El ajuste fino parte de la linea `SuperGemma Fast` (previamente verificada en MLX) en lugar de la base cruda. No se detallan en la model card el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similar. El autor menciona que la variante Fast supera a la base local en un bench rapido (95,8 frente a 91,4) y en velocidad media de generacion en la referencia MLX (46,2 frente a 42,5 tok/s), con mejores puntuaciones en codigo, logica, flujos de navegador y coreano. Se embebe una plantilla de chat neutra para corregir un bug previo de enrutamiento que empujaba prompts generales hacia comportamiento de codigo o tool calling.

## Capacidades
- Generacion de texto conversacional en ingles y coreano.
- Razonamiento y logica general, segun las mejoras reportadas en el bench del autor.
- Generacion de codigo (el autor verifica una funcion de Fibonacci en Python).
- Soporte de tool calling / function calling (etiqueta `tool-use` y mencion explicita en la model card).
- Comportamiento de chat "uncensored", con menos rechazos que la version oficial.
- Plantilla de chat neutra embebida para evitar derivas hacia modo codigo en preguntas generales.
- Optimizado para inferencia local rapida en `llama.cpp`, con enfasis en Apple Silicon.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso
- Asistente conversacional local en ingles y coreano: el modelo mantiene modo de asistente normal en preguntas generales gracias a la plantilla neutra embebida, lo que lo hace adecuado para chatbots de escritorio sin conexion.
- Generacion de codigo en entornos locales: el autor verifica respuestas concisas de Python; puede integrarse en editores o scripts CLI que invoquen `llama.cpp` para autocompletado y explicacion de fragmentos.
- Investigacion sobre alineacion y censura: al ser una variante "uncensored", sirve para estudiar como cambia el comportamiento de rechazo respecto al Gemma 4 oficial en tareas de evaluacion de seguridad.
- Procesamiento de texto en coreano: con velocidades reportadas de 222 tok/s de prompt y 89,4 tok/s de generacion en M4 Max, es viable para resumen, reescritura y clasificacion de documentos en coreano en local.
- Automatizacion con tool calling: la etiqueta `tool-use` y el soporte de function calling permiten construir agentes ligeros que consulten APIs o ejecuten acciones, aunque conviene validar el enrutamiento por el bug historico mencionado.
- Despliegue en portatiles Apple Silicon: al ser un GGUF Q4_K_M de 16,8 GB, encaja en equipos con memoria unificada de 24-32 GB o superior, permitiendo asistentes privados sin GPU dedicada.
- Prototipado rapido de aplicaciones de chat: la compatibilidad con endpoints (`endpoints_compatible`) facilita sustituir APIs propietarias por inferencia local en fases de desarrollo.

## Benchmarks y rendimiento
El autor reporta metricas internas, no benchmarks academicos estandar:

| Metrica | SuperGemma Fast | Base local | Contexto |
|---|---|---|---|
| Bench rapido (puntuacion global) | 95,8 | 91,4 | Referencia del autor |
| Velocidad media de generacion (MLX) | 46,2 tok/s | 42,5 tok/s | Referencia MLX |
| Velocidad de prompt (GGUF Q4_K_M, M4 Max) | 222,0 tok/s | no disponible | Prompt general en coreano |
| Velocidad de generacion (GGUF Q4_K_M, M4 Max) | 89,4 tok/s | no disponible | Prompt general en coreano |
| Velocidad de prompt (codigo, M4 Max) | 704,9 tok/s | no disponible | Prompt de Fibonacci en Python |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria estimada: el archivo Q4_K_M ocupa 16,8 GB, por lo que se necesita al menos ~18-20 GB de memoria disponible para inferencia comoda.
- GPU recomendadas: no hay datos oficiales; por tamano, encaja en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB y H100.
- Consumer GPU: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090). En GPUs de 16 GB requeriria offloading parcial a CPU.
- Apple Silicon: verificado por el autor en Apple M4 Max; equipos con 32 GB de memoria unificada o mas son el objetivo natural.
- Opciones de despliegue: `llama.cpp` (verificado), y por formato GGUF deberia funcionar en Ollama y otros runners compatibles, aunque no se confirma en la model card.
- Latencia y throughput: 222 tok/s de prompt y 89,4 tok/s de generacion en M4 Max con Q4_K_M; 704,9 tok/s de prompt en el caso de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SuperGemma4-26B-Uncensored-Fast GGUF v2 | 25,2B | 4B (inferido) | no disponible | Gemma | GGUF Q4_K_M | Ajuste comunitario sin censura, 0 descargas |
| google/gemma-4-26B-A4B-it | 26B | 4B | no disponible | Gemma | safetensors | Base oficial, con alineacion estandar |
| SuperGemma4-26B-Uncensored-Fast v2 (MLX) | 25,2B | 4B (inferido) | no disponible | Gemma | MLX | Linea origen de esta cuantizacion, para Apple Silicon |
| Gemma 4 (otras tallas) | no disponible | no disponible | no disponible | Gemma | varios | Alternativas de la misma familia, sin datos en la informacion disponible |

## Limitaciones y advertencias
- Modelo comunitario sin auditoria: cero descargas y cero likes en el momento de la ficha, sin validacion independiente de calidad o seguridad.
- Comportamiento "uncensored": puede producir contenido que la version oficial rechazaria; no apto para produccion sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de factualidad.
- Bug de enrutamiento historico: el autor menciona que versiones previas derivaban prompts generales hacia codigo o tool calling; la plantilla neutra mitiga pero no garantiza su eliminacion total.
- Idiomas limitados: solo ingles y coreano declarados; el rendimiento en castellano no esta documentado.
- Contexto no especificado: se desconoce la ventana maxima, lo que impide planificar casos de contexto largo.
- Licencia Gemma: impone terminos de uso de Google, incluida la politica de uso aceptable; el uso comercial esta sujeto a dichos terminos y no es licencia permisiva tipo Apache o MIT.
- Conversion GGUF parcheada: el autor indica que uso un conversor local modificado para los tensores MoE, lo que anade riesgo de artefactos de cuantizacion no detectados.
- Sin datos de entrenamiento: se desconoce la composicion del dataset de ajuste fino, lo que dificulta evaluar sesgos.

## Enlaces
- Hugging Face: https://huggingface.co/gernblanksten/supergemma4-26b-uncensored-gguf-v2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio `llama.cpp`: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales del autor.
