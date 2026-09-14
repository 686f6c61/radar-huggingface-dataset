# ANGELOSEGRETO/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental de la familia DeepSeek-V4, descrito por su autor como el primer modelo con visión de esa familia. Parte de la arquitectura DeepSeek-V4-Flash y añade módulos visuales (encoder y aligner) mediante entrenamiento continuado, de modo que mantiene el rendimiento en tareas de agente puramente textuales y mejora las multimodales. El repositorio de HuggingFace está publicado por el usuario ANGELOSEGRETO, no por la organización oficial deepseek-ai, y acumula 0 descargas y 0 likes en el momento de la consulta.

El peso declarado en safetensors es de 304.646.824.126 parámetros (unos 304,6 mil millones), con un repositorio de 167,8 GB, licencia MIT y pipeline image-text-to-text. La model card menciona atención DFlash, mezcla de expertos (MoE), Hyper-Connections y una ruta de avance denominada DSpark, además de decodificación especulativa integrada. No se especifican en la información disponible la longitud de contexto, los parámetros activos ni los idiomas soportados.

La relevancia actual del modelo radica en su doble perfil: agente de terminal y de ingeniería de software, con resultados declarados de 83,9 en Terminal Bench 2.1 y 59,3 en DeepSWE, y agente multimodal, con 36,5 en ApexBench (Pass@1) y 64,3 en Chartography. Es, por tanto, un candidato para pipelines agénticos que combinan texto, herramientas y capturas o gráficos, siempre con la cautela de tratarse de una versión "Exp" y de un repositorio de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE, atención DFlash, Hyper-Connections y ruta de avance DSpark; incluye encoder visual y aligner (según la model card) |
| Parametros totales | 304.646.824.126 (≈304,6 mil millones de parámetros, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 y 8-bit (etiquetas del repositorio); caché KV en fp8 en la receta de vLLM; no se publican GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `model.safetensors.index.json`), más `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

La model card describe un transformer multimodal que combina un encoder visual y un aligner con el núcleo de lenguaje de DeepSeek-V4-Flash. El repositorio incluye una implementación mínima de inferencia en PyTorch que cubre explícitamente cinco componentes: el encoder de visión y el aligner, la atención DFlash, la capa MoE, las Hyper-Connections y la ruta de avance DSpark. No se detallan ni el número de tokens de entrenamiento ni la composición del dataset, y no hay mención a RLHF, DPO u otras etapas de alineamiento en la información proporcionada.

La innovación operativa más visible es la decodificación especulativa DSpark: la receta de vLLM la activa con tres tokens de borrador, muestreo probabilístico del borrador y verificación adaptativa, sin necesidad de un modelo borrador separado (en SGLang se activa con `--speculative-algorithm DSPARK`, usando los mismos pesos como objetivo y borrador). El repositorio separa deliberadamente `encoding/` (formateo de prompt, sin dependencia de PyTorch) e `inference/` (conversión de pesos e inferencia mínima).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento: las evaluaciones de agente se hicieron con el nivel de esfuerzo de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`.
- Comprensión de imágenes: pipeline `image-text-to-text`, con mejoras declaradas en tareas multimodales de agente respecto a la variante solo texto.
- Interpretación de gráficos y diagramas: cubierta explícitamente por el benchmark Chartography.
- Tool calling y function calling: el servidor de vLLM se lanza con `--tool-call-parser deepseek_v4` y `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso de agentes: evaluado con DeepSeek Harness en modo mínimo; incluye parser de razonamiento configurable (`--reasoning-parser deepseek_v4`).
- Automatización de terminal y operaciones: Terminal Bench 2.1, Cybergym y AutomationBench forman parte de su batería de evaluación.
- Ingeniería de software: generación de repositorios desde lenguaje natural (NL2Repo) y resolución de tareas de desarrollo (DeepSWE).
- Codificación de prompts flexible: admite bloques de contenido en JSON estilo OpenAI y la notación compacta `<image>path</image>`, que producen prompts y token IDs idénticos según los ejemplos del repositorio.
- Decodificación especulativa integrada (DSpark) con verificación adaptativa.
- Capacidades de audio: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Agentes de terminal y DevOps: con 83,9 en Terminal Bench 2.1, el modelo puede ejecutar comandos, diagnosticar fallos de compilación y aplicar parches en entornos de shell, integrándose mediante el parser de tool calling de vLLM.
- Resolución de incidencias de software en producción: DeepSWE (59,3) y NL2Repo (57,7) lo sitúan como candidato para generar repositorios completos o parchear bases de código a partir de una descripción, dentro de un pipeline de CI/CD que valide los cambios antes de fusionarlos.
- Análisis de documentos con gráficos: con 64,3 en Chartography, es adecuado para extraer series y tendencias de gráficos en informes financieros, paneles de control o documentación técnica, donde una transcripción textual perdería información.
- Triaje de seguridad defensiva: Cybergym (75,3) sugiere uso en análisis de vulnerabilidades y clasificación de hallazgos, siempre con revisión humana dado que no es un benchmark de producción.
- Orquestación de múltiples APIs: Toolathlon-Verified (75,9) lo respalda como planificador de cadenas de herramientas heterogéneas (correo, calendario, hojas de cálculo) en asistentes corporativos.
- Atención al cliente multimodal: puede procesar tickets que incluyan capturas de pantalla o diagramas junto al texto, gestionando conversaciones multi-turno; conviene validar antes la longitud de contexto real, no publicada.
- Razonamiento visual de alta dificultad: ZeroBench (Pass@5 = 35,0) y ApexBench (36,5) implican que solo es fiable en tareas de percepción fina con verificación, por ejemplo inspección de planos o imágenes técnicas con revisión posterior.
- Automatización de back office: AutomationBench (25,7 público) indica un rendimiento bajo en este frente, así que su uso en flujos administrativos generalistas requiere supervisión estrecha y no se recomienda como automatización sin humano en el bucle.

## Benchmarks y rendimiento

Datos declarados en la model card. Para los benchmarks de agente textual, los modelos DeepSeek se evaluaron con el modo mínimo de DeepSeek Harness, con esfuerzo de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`. La marca † indica que DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (publico) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2† | 39,4 |
| Agents' Last Exam | 27,3 | 25,2† | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües en la información disponible.

## Requisitos de hardware

- Pesos publicados: 167,8 GB de repositorio, lo que equivale a una media aproximada de 4,4 bits por parámetro sobre 304,6 mil millones de parámetros. Cargar el modelo en bf16 exigiría del orden de 609 GB de VRAM solo para pesos (estimación a partir del número de parámetros).
- VRAM estimada: en fp8/8 bits, unos 305 GB para pesos más la caché KV (configurada en fp8 en la receta oficial) y los estados de activación. Cualquier despliegue realista implica varios aceleradores.
- GPU recomendadas: la receta oficial de vLLM indica un nodo de 4×GB300 con `--tensor-parallel-size 4`, `--block-size 256` y `--kv-cache-dtype fp8`. Como alternativas de centro de datos, configuraciones de 4 a 8×H100/H200 de 80 GB o superiores según la precisión elegida.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB), ni una RTX 5090 (32 GB), ni agrupaciones de 2 a 4 GPU de consumo cubren el espacio de pesos, y el despliegue previsto asume paralelismo tensorial en nodos de centro de datos.
- Opciones de despliegue: vLLM mediante la imagen `vllm/vllm-openai:deepseekv4-flash-vision`; SGLang con `--speculative-algorithm DSPARK`; e inferencia mínima de referencia en PyTorch incluida en el propio repositorio (`inference/`). No hay soporte publicado para llama.cpp, Ollama, GGUF ni TGI en la información disponible.
- Latencia y throughput: no disponible. La única referencia operativa es la decodificación especulativa DSpark con 3 tokens de borrador y verificación adaptativa, orientada a reducir el coste por token, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | 304,6 mil millones (totales); activos no disponibles | no disponible | Terminal Bench 2.1: 83,9; ApexBench Pass@1: 36,5; Chartography: 64,3 | MIT (según el repositorio) | Repositorio de un tercero (ANGELOSEGRETO); version oficial en deepseek-ai referenciada en la receta de vLLM |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | Terminal Bench 2.1: 82,7; ApexBench Pass@1: 26,2 (ignora entrada multimodal); DSBench-Hard: 59,6 | no disponible | Versión previa de la misma familia, solo texto |
| Opus-4.8 | no disponible | no disponible | Terminal Bench 2.1: 85,0; NL2Repo: 69,7; AutomationBench: 27,2 | no disponible (modelo propietario) | Solo por API; no se distribuyen pesos |

No se dispone en la información proporcionada de otros modelos abiertos comparables en parámetros o tarea con los que contrastar contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una versión experimental ("Exp"), no una versión estable; los resultados pueden no reproducirse en configuraciones distintas a las declaradas (DeepSeek Harness, esfuerzo `max`, `temperature = 1.0`, `top_p = 0.95`).
- El repositorio está publicado por el usuario ANGELOSEGRETO, con 0 descargas y 0 likes, no por la organización oficial deepseek-ai. Conviene verificar la procedencia, la integridad de los shards y la existencia de actualizaciones en el repositorio oficial antes de usarlo en producción.
- Las fechas de creación y actualización declaradas (13 de septiembre de 2026, con un segundo de diferencia) no permiten trazar un historial de cambios fiable.
- Riesgo de alucinación: no hay evaluación publicada específica de veracidad. Los benchmarks presentados son de tareas agénticas y de percepción, no de factualidad.
- Rendimiento bajo en automatización generalista: 25,7 en AutomationBench público, muy por debajo del resto de sus resultados. No es adecuado como automatizador autónomo en flujos administrativos sin supervisión.
- NL2Repo (57,7) y DSBench-Hard (63,6) quedan claramente por detrás de Opus-4.8 (69,7 y 71,7), lo que limita su uso como generador de repositorios completos sin revisión humana.
- Percepción visual fina limitada: 35,0 en ZeroBench Pass@5 implica una tasa de fallo alta en razonamiento visual de dificultad elevada.
- Longitud de contexto no publicada: no se debe asumir capacidad de contexto largo ni dimensionar arquitecturas de RAG o conversaciones extensas sin medirla.
- Idiomas soportados no publicados: el rendimiento multilingüe es una incógnita, especialmente fuera del inglés.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de un repositorio no oficial debe confirmarse la titularidad de los derechos y el cumplimiento de cualquier condición adicional de la versión original.
- Requisitos de hardware muy altos: sin acceso a nodos multi-GPU de centro de datos, el modelo no es desplegable.

## Enlaces

- Repositorio en HuggingFace (objeto de esta ficha): https://huggingface.co/ANGELOSEGRETO/DeepSeek-V4-Flash-Vision-Exp
- Receta de vLLM citada en la model card: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Organización oficial de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Repositorio de figuras y recursos de DeepSeek referenciado en la model card: https://github.com/deepseek-ai/DeepSeek-V2
- Perfil de X/Twitter citado en la model card: https://twitter.com/deepseek_ai
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las búsquedas devolvieron únicamente páginas de la Ligue 1 (ligue1.com, plus.ligue1.com, maxifoot.fr, lequipe.fr), sin relación con el modelo.
