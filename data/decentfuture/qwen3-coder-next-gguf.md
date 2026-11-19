# decentfuture/Qwen3-Coder-Next-GGUF

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de pesos abiertos desarrollado por el equipo Qwen (Alibaba) y orientado especificamente a agentes de codigo y desarrollo local. Se distribuye en este repositorio como una cuantizacion GGUF publicada por el usuario decentfuture, lo que permite su ejecucion mediante llama.cpp y otras herramientas compatibles con este formato. El modelo emplea una arquitectura Mixture of Experts (MoE) con 80.000 millones de parametros totales y solo 3.000 millones de parametros activos por token, lo que lo hace especialmente eficiente en coste de inferencia para despliegues de agentes.

La propuesta central del modelo es alcanzar un rendimiento comparable al de modelos con entre 10 y 20 veces mas parametros activos, manteniendo un coste de despliegue muy contenido. Incorpora una longitud de contexto nativa de 262.144 tokens, lo que lo habilita para tareas de razonamiento de largo horizonte, uso complejo de herramientas y recuperacion tras fallos de ejecucion en entornos de desarrollo reales. Ademas, es adaptable a distintas plantillas de scaffold, lo que facilita su integracion en plataformas CLI e IDE como Claude Code, Qwen Code, Qoder, Kilo, Trae o Cline.

Una caracteristica destacable es que el modelo funciona exclusivamente en modo no-thinking: no genera bloques `<think></think>` en su salida y no requiere especificar `enable_thinking=False`. Esto simplifica su integracion en pipelines de agentes donde la latencia y la previsibilidad del formato de salida son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Mixture of Experts, Gated DeltaNet y Gated Attention |
| Parametros totales | 79.674.391.296 (aproximadamente 80B) |
| Parametros activos | 3B (10 expertos activados de 512, mas 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativos; validado hasta 131.072 con YaRN |
| Tipos de cuantizacion | GGUF (el repositorio incluye al menos Q5_K_M; otras variantes no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); pesos originales en safetensors segun el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer hibrido con 48 capas organizadas en un layout de 12 bloques, cada uno compuesto por tres sub-bloques de Gated DeltaNet seguidos de MoE y un sub-bloque de Gated Attention seguido de MoE. La dimension oculta es de 2.048. La atencion con compuerta emplea 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La Gated DeltaNet utiliza 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La capa MoE cuenta con 512 expertos, de los que se activan 10 por token, mas un experto compartido, con dimension intermedia de 512.

El modelo ha pasado por fases de preentrenamiento y post-entrenamiento, e incluye un recetario de entrenamiento orientado a capacidades agenticas: razonamiento de largo horizonte, uso complejo de herramientas y recuperacion ante fallos de ejecucion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. La innovacion tecnica mas relevante es la combinacion de atencion lineal (Gated DeltaNet) con atencion tradicional en un esquema hibrido, lo que reduce el coste computacional en contextos largos manteniendo capacidad expresiva.

## Capacidades

- Generacion de texto y codigo en contextos de hasta 262.144 tokens.
- Razonamiento de largo horizonte y multi-step reasoning orientado a tareas de desarrollo.
- Tool calling y function calling nativo, con integracion mediante API compatible con OpenAI.
- Capacidades agenticas: uso complejo de herramientas, recuperacion tras fallos de ejecucion y adaptacion a distintos scaffolds.
- Integracion con plataformas CLI e IDE (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline).
- Modo no-thinking exclusivo: no emite bloques `<think></think>`, lo que simplifica el parseo de salidas.
- Soporte de conversaciones multi-turno con contexto muy largo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo en IDE: el modelo puede integrarse en extensiones de editor o CLIs para resolver tareas de refactorizacion, generacion de tests o correccion de errores, aprovechando su contexto de 262.144 tokens para mantener el estado completo del repositorio relevante en memoria.
- Atencion al cliente tecnica automatizada: con su ventana de contexto extendida puede gestionar conversaciones multi-turno con historial largo y documentacion adjunta, manteniendo coherencia en interacciones prolongadas.
- Pipelines de CI/CD con correccion automatica: gracias al tool calling y a la recuperacion ante fallos de ejecucion, puede integrarse en flujos donde el modelo ejecuta comandos, interpreta errores y propone parches iterativamente.
- Desarrollo local en estaciones de trabajo: al distribuirse en GGUF y ejecutarse con llama.cpp, permite desplegar un agente de codigo en hardware de consumo sin depender de APIs externas, con la cuantizacion Q5_K_M como opcion equilibrada.
- Asistentes de documentacion tecnica: puede generar y mantener documentacion de API o guias de integracion a partir de grandes volumenes de codigo fuente, explotando el contexto largo para cubrir modulos completos.
- Automatizacion de revisiones de codigo: el modelo puede analizar diffs extensos y multiples archivos relacionados en una sola pasada, señalando problemas de consistencia o posibles regresiones.
- Migracion de bases de codigo: con contexto de 262k tokens puede abordar tareas de migracion entre versiones de frameworks o lenguajes, manteniendo coherencia entre archivos interdependientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia imagenes con graficas de benchmarks (benchmarks.png y swebench_pro.png) alojadas en el CDN de Qwen, pero no se proporcionan los valores concretos en el texto. Para cifras detalladas debe consultarse el blog oficial y el informe tecnico enlazados en la seccion de enlaces.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa basada en el tamano del modelo (80B totales, 3B activos) y la cuantizacion Q5_K_M incluida, el peso en disco del repo es de 471,5 GB para el conjunto de cuantizaciones, aunque cada variante individual ocupa una fraccion.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la presencia de cuantizaciones GGUF y la guia para llama.cpp sugiere viabilidad en configuraciones con suficiente memoria, pero no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (documentado en la model card con comandos de ejemplo), y por extension cualquier runtime compatible con GGUF. Tambien es compatible con endpoints estilo OpenAI mediante servidores locales.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados: `temperature=1.0`, `top_p=0.95`, `top_k=40`, con `-fa on` y `-ngl 99` en llama.cpp.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento numericos ni referencias a modelos comparables concretos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo solo opera en modo no-thinking; no genera bloques de razonamiento explicito, lo que puede limitar tareas que se beneficien de cadenas de pensamiento visibles.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas de codigo puede producir APIs o funciones inexistentes, por lo que se recomienda validacion automatica en produccion.
- La longitud de contexto nativa es de 262.144 tokens, pero el rendimiento solo se ha validado hasta 131.072 con YaRN; mas alla de ese limite el comportamiento puede degradarse.
- Los idiomas soportados no estan documentados en la informacion disponible; el rendimiento fuera del ingles y del chino no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base original.
- El repositorio es una cuantizacion de terceros (decentfuture) con 0 descargas y 0 likes en el momento de la consulta; conviene validar la integridad de los pesos frente al modelo oficial Qwen/Qwen3-Coder-Next-GGUF.
- El tamano del repo (471,5 GB) implica requisitos de almacenamiento considerables si se descargan todas las variantes.

## Enlaces

- Repositorio Hugging Face (cuantizacion): https://huggingface.co/decentfuture/Qwen3-Coder-Next-GGUF
- Repositorio oficial GGUF de Qwen: https://huggingface.co/Qwen/Qwen3-Coder-Next-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3-Coder-Next-GGUF/blob/main/LICENSE
- Blog oficial: https://qwen.ai/blog?id=qwen3-coder-next
- GitHub: https://github.com/QwenLM/Qwen3-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Informe tecnico: https://github.com/QwenLM/Qwen3-Coder/blob/main/qwen3_coder_next_tech_report.pdf
- Paper YaRN: https://arxiv.org/abs/2309.00071
