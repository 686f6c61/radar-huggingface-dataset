# mohommed/LucetV3-2B-Frontier

## Resumen

LucetV3-2B-Frontier es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario mohommed y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo orientado a razonamiento autónomo, generación de código y tareas de sistemas, apoyado en la arquitectura Tri-Hybrid de Liquid AI (convoluciones cortas con gating, atención de ventana deslizante y atención global GQA). El autor lo etiqueta como "uncensored" y le atribuye un protocolo anti-alucinación denominado R-Tuning, así como un modo de planificación estructurada llamado Next-Concept Modeling (NCM).

El modelo tiene 1.728.801.536 parámetros reales según los pesos en safetensors (aproximadamente 1,7B), lo que lo sitúa en la categoría de modelos pequeños. El autor declara una longitud de contexto extendida de 524.288 tokens (512K) mediante RoPE con `rope_theta = 4.000.000`, aunque esta cifra procede únicamente de la model card y no está verificada de forma independiente. El repositorio ocupa 7,5 GB e incluye pesos en safetensors y GGUF.

La relevancia del modelo es limitada pero concreta: propone un enfoque de planificación jerárquica y de "medición de la realidad" (emitir herramientas deterministas en lugar de adivinar estados no observados) sobre una base pequeña, lo que puede interesar a quienes experimentan con agentes ligeros y despliegue en hardware modesto. No obstante, el modelo acumula muy pocas descargas (140) y ningún "like", y no hay información sobre idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-Hybrid de Liquid AI (convoluciones cortas con gating + atención de ventana deslizante + atención global GQA); fine-tune de LiquidAI/LFM3-1.7B |
| Parametros totales | 1.728.801.536 (aprox. 1,7B), segun safetensors |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 524.288 tokens (512K) declarados por el autor, con `rope_theta = 4.000.000` |
| Tipos de cuantizacion | GGUF calibrado con `llama-imatrix` (disponible en el repo GGUF del autor); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Tri-Hybrid de Liquid AI empleada en LFM3-1.7B, que combina convoluciones cortas con gating, atención de ventana deslizante y atención global con GQA. Sobre esa base, el autor aplica un ajuste fino con dos componentes declarados: Next-Concept Modeling (NCM), que estructura el razonamiento en tres niveles (`[L1.CONCEPT]`, `[L2.STRATEGY]`, `[L3.COLLAPSE]`) para reducir errores de planificación autoregresiva, y un protocolo R-Tuning anti-alucinación que instruye al modelo a emitir herramientas deterministas (`python -c`, `read_file`, `bash`) en lugar de inferir estados no observados.

El autor también declara un proceso de "uncensoring" mediante descomposición SVD aplicada a `w2.weight`, con el objetivo de eliminar direcciones de rechazo sin modificar las proyecciones de salida de atención (`o_proj.weight`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La extensión de contexto a 512K se atribuye al uso nativo de RoPE en hardware, sin interpolación YaRN en CPU.

## Capacidades

- Generación de texto conversacional y razonamiento estructurado mediante el esquema NCM de planificación en tres niveles.
- Generación de código y tareas de sistemas, con emisión de comandos deterministas (`python -c`, `read_file`, `bash`) como parte del protocolo R-Tuning.
- Soporte declarado de tool calling / function calling a través de la emisión de herramientas de medición.
- Razonamiento multi-paso orientado a agentes, con planificación jerárquica explícita.
- Contexto largo de hasta 512K tokens según el autor, útil para documentos extensos o sesiones de agente prolongadas.
- Modo "uncensored": el autor declara la eliminación de direcciones de rechazo, lo que reduce las negativas a responder.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Agentes de automatización de sistemas: el modelo puede emitir comandos de shell y lecturas de ficheros en lugar de suponer el estado del entorno, lo que encaja en pipelines de operaciones donde la verificación determinista es crítica.
- Asistente de depuración de código: con contexto de 512K declarado, puede mantener en memoria trazas largas, logs y varios ficheros fuente para localizar la causa de un fallo.
- Planificación de tareas multi-paso: el esquema NCM (concepto, estrategia, colapso) permite descomponer problemas complejos en pasos explícitos y auditables.
- Generación de scripts de automatización: útil para producir pequeños programas de Python o bash que interactúen con el sistema de ficheros.
- Documentación técnica asistida: la ventana de contexto extendida permite resumir o reescribir documentación extensa en una sola pasada.
- Prototipado en hardware modesto: al tener 1,7B parámetros, puede desplegarse en GPUs de consumo para experimentación con agentes ligeros.
- Análisis de repositorios pequeños: con contexto largo, puede revisar varios ficheros de un proyecto y proponer cambios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,5 GB solo para pesos (1,7B × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 4 bits, alrededor de 1 GB para pesos.
- La caché KV con 512K tokens de contexto puede ser muy costosa en memoria; en la práctica, el contexto efectivo desplegable dependerá de la GPU y de la implementación.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060/4060, RTX 3070/4070); A100 o H100 para aprovechar contextos muy largos.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM, especialmente usando cuantización GGUF.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama mediante los GGUF publicados por el autor, y potencialmente vLLM o TGI si la arquitectura Tri-Hybrid es compatible (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LucetV3-2B-Frontier | 1,7B | 512K (declarado) | Apache 2.0 | Hugging Face (140 descargas) | Fine-tune de LFM3-1.7B con NCM y R-Tuning |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en la informacion | no disponible en la informacion | Hugging Face (modelo base) | Arquitectura Tri-Hybrid original de Liquid AI |
| Qwen2.5-1.5B | 1,5B | 32K (tipico) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo pequeño generalista con buen soporte de tool calling |
| SmolLM2-1.7B | 1,7B | 8K (tipico) | Apache 2.0 | Hugging Face | Modelo pequeño orientado a eficiencia |

La comparación con Qwen2.5-1.5B y SmolLM2-1.7B se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo del modelo evaluado.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluaciones independientes; las capacidades declaradas (NCM, R-Tuning, contexto de 512K) proceden únicamente de la model card del autor.
- El proceso de "uncensoring" por SVD puede degradar la calidad del modelo y elimina salvaguardas de seguridad, lo que supone un riesgo para uso en producción con usuarios finales.
- Riesgo de alucinación: aunque el autor declara un protocolo anti-alucinación, no hay evidencia verificada de su eficacia; un modelo de 1,7B tiene capacidad limitada de razonamiento complejo.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- El contexto de 512K declarado no está verificado y su uso práctico puede ser inviable por consumo de memoria de la caché KV.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base LFM3-1.7B tiene sus propias condiciones que conviene revisar.
- Modelo con muy poca tracción (140 descargas, 0 likes) y sin mantenimiento comunitario aparente; la fecha de creación indicada (2026) resulta anómala y conviene verificarla.
- No se especifican datos de entrenamiento, lo que impide evaluar sesgos y procedencia del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohommed/LucetV3-2B-Frontier
- Repositorio GGUF del autor: https://huggingface.co/mohommed/Lucet-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
