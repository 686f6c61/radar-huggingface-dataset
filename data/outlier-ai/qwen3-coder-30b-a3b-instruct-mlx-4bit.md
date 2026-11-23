# Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit

## Resumen

Qwen3-Coder-30B-A3B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicada por Outlier-Ai para su ejecución en Apple Silicon. El modelo original lo desarrolla el equipo Qwen de Alibaba y está especializado en generación de código, completado de código, uso de herramientas (function calling) y flujos agénticos. Esta conversión no modifica los pesos originales: solo cambia el formato en disco (safetensors MLX 4-bit, group size 64, simétrico) y el empaquetado del tokenizer y la plantilla de chat.

Arquitectura Qwen3 MoE (qwen3_moe) con 30.532.122.624 parámetros totales y aproximadamente 3.300 millones de parámetros activos por token, lo que permite un rendimiento de decodificación cercano al de un modelo denso de 3B pese a tener 30B de capacidad. La cuantización a 4 bits reduce el repositorio a 17,2 GB, un tamaño manejable en Macs con 24-32 GB de memoria unificada.

Es relevante porque permite ejecutar un modelo de código de clase 30B MoE de forma totalmente local y offline en hardware de consumo Apple (M1 a M4), sin claves de API ni dependencia de la nube, manteniendo la licencia Apache 2.0 del modelo base. La ficha cubre tanto el modelo original como las particularidades de esta conversión MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simetrica); solo esta variante disponible en este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit), shards multiples, con config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-30B-A3B-Instruct emplea una arquitectura transformer con mezcla de expertos (MoE), identificada en la configuracion como `qwen3_moe`. Con 30.532 millones de parametros totales y un subconjunto activo por token (la nomenclatura A3B apunta a unos 3000 millones activos), el modelo busca combinar la capacidad de un modelo grande con el coste de inferencia de uno pequeno. Esta conversión concreta no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo original de Qwen, no incluida en la informacion proporcionada.

La innovacion tecnica de este repositorio es el repackaging: cuantizacion a 4 bits con `mlx-lm` 0.31.x, group size 64 y cuantizacion simetrica, manteniendo los pesos originales sin reentrenamiento. Se incluyen `chat_template.jinja` y tokenizer compatibles con `mlx-lm`, lo que permite cargar el modelo directamente con `mlx_lm.load` y ejecutarlo sobre el framework Metal de Apple. No se documentan en la informacion disponible tecnicas adicionales como decodificacion especulativa o atencion lineal especifica de esta conversion.

## Capacidades

- Generacion de codigo en multiples lenguajes, con soporte declarado para code-completion y code-generation.
- Razonamiento y conversacion multi-turno en modo chat (pipeline text-generation, tag conversational).
- Tool calling y function calling, con tags explicitos `tool-use` y `function-calling`.
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Capacidades multilingues en 15 idiomas: ingles, chino, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, arabe, vietnamita, tailandes, neerlandes y polaco.
- Ejecucion local y offline en Apple Silicon (tags `on-device`, `no-cloud`, `offline`, `private`).
- No se documenta en la informacion disponible soporte de vision, audio ni un modo de razonamiento extendido (thinking mode) especifico.

## Casos de uso

- Asistente de codigo en local para desarrolladores en Mac: cargar el modelo con `mlx-lm` y usarlo como completador y generador de funciones en el editor, sin enviar codigo propietario a la nube, gracias a los 17,2 GB del repo que caben en memoria unificada de 24-32 GB.
- Automatizacion de refactorizaciones y depuracion: la model card incluye ejemplos de refactorizacion con deteccion de bugs y de generacion de tests con casos limite, tareas que el modelo aborda en modo chat multi-turno.
- Generacion de consultas SQL y analisis de datos: el ejemplo de la model card (top 10 usuarios por valor de compra en 90 dias) muestra su uso para traducir requisitos en lenguaje natural a SQL en entornos de analitica internos.
- Agentes de codigo con tool calling: integrar el modelo en pipelines agénticos que invocan herramientas (ejecucion de tests, linters, busqueda en repositorio) aprovechando el soporte declarado de function calling y razonamiento multi-paso.
- Desarrollo en entornos con requisitos de privacidad: empresas que no pueden usar APIs en la nube pueden desplegar esta conversion en Macs corporativos para tareas de generacion de codigo sobre repositorios confidenciales.
- Prototipado rapido en MacBook Air o Mac mini: al ser una conversion MLX 4-bit orientada a edge-ai, permite probar flujos de generacion de codigo en hardware de consumo sin GPU dedicada.
- Soporte multilingue de documentacion tecnica: generar y traducir documentacion de codigo en los 15 idiomas soportados, con especial utilidad para equipos distribuidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero no incluye los numeros en el texto proporcionado; el autor indica ademas que las cifras de sus experimentos internos no son tests de release. No se inventan valores.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 17,2 GB en disco; en inferencia se necesita memoria unificada suficiente para pesos mas cache KV y contexto, por lo que se recomienda un minimo de 24 GB y, para contextos largos, 32 GB o mas.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4), segun los tags `apple-silicon`, `mac`, `macbook-air`, `macbook-pro`, `mac-mini`, `mac-studio`.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato MLX; el modelo no esta pensado para CUDA en esta conversion.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API Python `mlx_lm.load`/`generate`); la app Outlier para macOS puede cargar conversiones MLX compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-MLX-4bit (este) | 30.532 M totales, ~3B activos (segun nombre) | no disponible | MLX 4-bit safetensors | apache-2.0 | Conversion para Apple Silicon, 17,2 GB |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30.532 M totales | no disponible | safetensors originales | apache-2.0 | Modelo base sin cuantizar; requiere mas memoria |
| Outlier-Quick-26B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible en la informacion | Otra conversion del mismo autor, orientada a uso general |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible en la informacion | Otra conversion del mismo autor; no especializada en codigo segun los tags |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Al ser una cuantizacion a 4 bits, puede producirse una degradacion de calidad respecto a los pesos originales en tareas de codigo complejas; el autor no publica metricas de perdida por cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs, librerias o firmas de funciones poco comunes; el codigo generado debe revisarse y testearse antes de produccion.
- Sesgos no documentados en la informacion proporcionada; el modelo base de Qwen puede reflejar sesgos de sus datos de entrenamiento.
- La longitud de contexto no esta confirmada en la informacion disponible, lo que impide garantizar el comportamiento en repositorios o conversaciones muy largas.
- Restriccion de plataforma: esta conversion solo funciona en Apple Silicon con MLX; no es desplegable en CUDA, ROCm ni CPU x86 sin reconversion.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene consultar la model card original de Qwen para condiciones adicionales.
- La model card advierte de que las cifras de rendimiento citadas por el autor provienen de experimentos internos y no de tests de release; no deben tomarse como referencia de produccion.
- El modelo no se distribuye dentro de la app Outlier; es una conversion publicada de forma independiente por el equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Benchmarks del autor: https://outlier.host/benchmarks
- App Outlier para macOS: https://outlier.host/
- Outlier-Nano-4B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier-Lite-9B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier-Quick-26B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier-Core-27B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Qwen3-14B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
- Qwen3-8B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
- Qwen3-32B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit
