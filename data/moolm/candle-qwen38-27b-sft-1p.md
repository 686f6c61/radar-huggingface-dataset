# moolm/candle-qwen38-27b-sft-1p

## Resumen

El modelo `moolm/candle-qwen38-27b-sft-1p` es un adaptador LoRA/QLoRA publicado por el usuario `moolm` que se monta sobre el modelo base `Qwen/Qwen3.8-27B`. Su propósito es especializar el modelo generalista en la escritura, explicación, revisión y refactorización de **MOOCode** (el lenguaje de programación de los mundos MOO), así como en el razonamiento sobre el diseño de **Torchship** y la conducción de agentes con llamadas a herramientas (tool calling) en un harness estilo `#340`. Se trata de un lanzamiento exclusivo de adaptador (unos 897 MB), no de un modelo fusionado completo.

La relevancia de este adaptador radica en que cubre un nicho muy concreto: desarrolladores y mantenedores de entornos MOO (como Torchship, Sindome, HellMOO o FallMOO) que necesitan asistencia de IA para código específico de estos sistemas, con soporte para razonamiento encadenado y uso de herramientas. El entrenamiento se realizó con QLoRA sobre una única A100 de 40 GB, con 7.946 ejemplos completos de secuencias de hasta 4096 tokens, y está licenciado bajo Apache 2.0, aunque sujeto a los términos del modelo base de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene 233.455.616 parámetros entrenables, ~0,86% del base; el base se denomina Qwen3.8-27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el adaptador fue entrenado con secuencias de hasta 4096 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó con QLoRA NF4 y doble cuantización; no se publican cuantizaciones del modelo completo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (adaptador), sujeto a los términos de la licencia de Qwen |
| Formato de pesos | safetensors (formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se construyó mediante QLoRA (NF4 con doble cuantización) sobre el modelo base `Qwen/Qwen3.8-27B`, utilizando únicamente la ruta de texto (la torre de visión del base, si existe, no se usó). Los módulos objetivo del LoRA incluyen las proyecciones `q/k/v/o_proj`, `gate/up/down_proj`, `in_proj_{a,b,qkv,z}` y `out_proj`, con rango 32, alpha 64 y dropout 0,05. El entrenamiento se realizó en una única NVIDIA A100-SXM4-40GB, con precisión bf16, atención SDPA, optimizador paged AdamW 8-bit, tasa de aprendizaje 1e-4 con coseno y warmup de 70 pasos, y un batch efectivo de 16. Se completaron 2 épocas con una pérdida final de ~0,575.

El conjunto de datos de entrenamiento proviene del pipeline `moolm`, que extrajo sesiones de Torchship y ejemplos sintetizados con comprobación de compilación. De las 18.485 filas originales, se conservaron 7.946 ejemplos completos con longitud de secuencia entre 1 y 4096 tokens (3.135 filas se descartaron por exceder el presupuesto, sin truncamiento). La distribución de tracks fue aproximadamente 57% agéntico y 43% chat, con un 99% de dialecto mooR y 1% de LambdaMOO. Durante el entrenamiento solo se supervisó el turno del asistente con peso 1, y las plantillas de tool schemas se omitieron del chat template aunque se retuvieron las llamadas a herramientas. Casi todas las filas incluyen `reasoning_content` procedente de un backfill de razonamiento.

## Capacidades

- Generación de código MOOCode: escribe, explica, revisa y refactoriza código en dialecto mooR (y en menor medida LambdaMOO).
- Razonamiento sobre diseño de Torchship: responde preguntas sobre principios, convenciones y arquitectura de este sistema.
- Uso agéntico con herramientas: puede realizar llamadas a herramientas (tool calls) en un harness estilo Torchship `#340`, siguiendo esquemas MCP.
- Razonamiento encadenado: la mayoría de los ejemplos de entrenamiento incluyen `reasoning_content`, lo que sugiere capacidad de razonamiento paso a paso antes de responder.
- Traducción de dialectos: puede convertir entre mooR y LambdaMOO, aunque la cobertura de LambdaMOO es limitada.
- Conversación técnica especializada: mantiene diálogos multi-turno centrados en código MOO y diseño de sistemas Torchship.
- No incluye capacidades de visión ni de audio; es exclusivamente texto y orientado a herramientas.

## Casos de uso

- Autoría de código MOOCode en entornos MOO: el adaptador puede generar fragmentos de código mooR para objetos, verbos y propiedades, acelerando el desarrollo de mundos virtuales.
- Explicación y documentación de código MOO existente: dado un bloque de código, puede producir explicaciones claras y comentarios, útil para mantener proyectos legacy.
- Refactorización de código MOO: puede reestructurar código antiguo o mal organizado, mejorando la legibilidad y mantenibilidad sin cambiar la funcionalidad.
- Traducción entre dialectos mooR y LambdaMOO: permite migrar código entre diferentes servidores MOO, aunque la cobertura de LambdaMOO es limitada.
- Desarrollo de agentes con tool calling para Torchship: el modelo puede generar secuencias de llamadas a herramientas según los esquemas MCP de Torchship, facilitando la construcción de asistentes autónomos.
- Asistente de diseño para arquitecturas Torchship: responde preguntas sobre convenciones, patrones y mejores prácticas, sirviendo como consultor para equipos de desarrollo.
- Generación de pruebas y ejemplos: puede crear casos de prueba o ejemplos de uso para código MOO, ayudando a verificar comportamientos.
- Integración en pipelines de CI/CD para proyectos MOO: al soportar tool calling, podría conectarse a herramientas de compilación o validación para automatizar revisiones de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay números de evaluación formales.

## Requisitos de hardware

- El adaptador en sí es ligero (~897 MB), pero requiere cargar el modelo base `Qwen3.8-27B` completo, lo que domina los requisitos de memoria.
- En precisión bf16, el modelo base necesita aproximadamente 54 GB de VRAM, por lo que se requiere una GPU profesional como A100 80GB o dos A100 40GB en paralelo.
- Con cuantización de 4 bits (por ejemplo, BitsAndBytesConfig), el modelo base puede caber en unos 14 GB de VRAM, permitiendo su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- El entrenamiento se realizó en una única A100-SXM4-40GB, lo que da una referencia del hardware mínimo para fine-tuning adicional.
- Opciones de despliegue: se puede cargar con `transformers` + `PEFT` (como se muestra en la model card), y potencialmente con `vLLM` si se fusiona el adaptador con el base. No se menciona soporte para `llama.cpp` ni `Ollama` en la documentación.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan cifras específicas.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información suministrada, y al ser un adaptador especializado para un dominio muy concreto (MOOCode/Torchship), no existen alternativas directas conocidas.

## Limitaciones y advertencias

- El presupuesto de secuencia del adaptador está limitado a 4096 tokens; las ventanas de agente más largas del dataset fueron excluidas durante el entrenamiento.
- El comportamiento está sesgado hacia Torchship y el dialecto mooR; la cobertura de LambdaMOO es escasa (~1% de los datos), por lo que la traducción a este dialecto puede ser poco fiable.
- Las salidas agénticas asumen herramientas estilo Torchship `#340`; otros harnesses necesitarán sus propios esquemas en contexto.
- No se han publicado evaluaciones formales, por lo que el rendimiento en tareas generales o específicas no está verificado.
- No es un sustituto de chat general: está especializado y fuera de alcance para tareas de propósito general.
- No soporta visión ni vídeo; es exclusivamente texto y orientado a herramientas.
- Aunque la licencia del adaptador es Apache 2.0, al redistribuir derivados hay que cumplir también los términos de la licencia del modelo base Qwen3.8-27B.
- Para uso en producción sin sandbox, se recomienda precaución: las escrituras no supervisadas en entornos MOO pueden causar daños.

## Enlaces

- Página del adaptador en HuggingFace: https://huggingface.co/moolm/candle-qwen38-27b-sft-1p
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
