# Abid-Shahriar/BugSum-Qwen-7B-Distill

## Resumen

BugSum-Qwen-7B-Distill es un adaptador LoRA experimental desarrollado por Md. Abid Shahriar durante su investigación de tesis, orientado a la tarea de resumir informes de errores (bug reports) en inglés. Se trata de un checkpoint de destilación auto-supervisada (self-distillation) que parte del adaptador supervisado BugSum-Qwen-7B y se entrena sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. El objetivo es generar resúmenes concisos y precisos de informes de bugs, una tarea relevante en ingeniería de software para acelerar la triage y el mantenimiento de repositorios.

El adaptador se distribuye como un repositorio PEFT de 0.1 GB, no como un modelo independiente, y debe cargarse sobre el modelo base mencionado. La evaluación de la tesis no encontró una mejora estadísticamente significativa respecto al baseline supervisado, por lo que se trata de un artefacto de investigación más que de una mejora probada. Su relevancia radica en explorar técnicas de destilación de conocimiento aplicadas a la summarización de bugs, un área con poca literatura comparada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct (Transformer decoder) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 7.6B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, 32 768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en precision nativa; el base admite cuantizaciones) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | other (privada para revision; el modelo base es Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Qwen2.5-Coder-7B-Instruct, que es un decoder autoregresivo con atención de ventana deslizante y soporte de contexto largo (32 768 tokens). El entrenamiento del adaptador utilizó destilación auto-supervisada de tipo "oracle" con pérdida de log-verosimilitud negativa supervisada sobre 253 ejemplos seleccionados, durante tres épocas. Partió del adaptador supervisado BugSum-Qwen-7B, que a su vez fue entrenado sobre un corpus de informes de bugs (no incluido en el repositorio por restricciones de licencia de los datasets fuente). No se reportan innovaciones técnicas adicionales más allá de la técnica de destilación aplicada.

## Capacidades

- Generacion de resumenes de informes de errores en ingles, produciendo texto conciso a partir de descripciones largas de bugs.
- Adaptacion especifica a la terminologia de ingenieria de software gracias al modelo base Qwen2.5-Coder-7B-Instruct, que tiene fuertes capacidades de codigo y razonamiento.
- No se documentan capacidades de tool calling, agentes, vision ni audio; el adaptador se limita a la tarea de summarization.
- Soporte multilingue limitado al ingles, segun la model card.

## Casos de uso

- Asistencia en triage de issues: un desarrollador puede pegar un informe de bug extenso y obtener un resumen breve para priorizar tareas en el backlog, reduciendo el tiempo de lectura.
- Redaccion de resumenes para documentacion tecnica: el modelo puede generar una version condensada de un bug report para incluir en changelogs o notas de version, siempre con revision humana.
- Investigacion academica en summarizacion de software: sirve como punto de comparacion para estudiar tecnicas de destilacion de conocimiento frente a metodos supervisados tradicionales.
- Educacion en ingenieria de software: los estudiantes pueden usarlo para practicar la extraccion de informacion clave de informes de bugs y comparar con resumenes manuales.
- Preprocesamiento de datos para analisis de repositorios: el adaptador puede generar resumenes normalizados de bugs para alimentar sistemas de clasificacion o clustering, aunque con cautela por su naturaleza experimental.
- Evaluacion de calidad de resumenes: al ser un checkpoint de investigacion, permite medir el impacto de la destilacion en metricas de fidelidad y concision frente al baseline supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion de la tesis no establecio una mejora estadisticamente significativa sobre el baseline supervisado, pero no se proporcionan metricas numericas (p. ej., ROUGE, BLEU) ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB) y anade una sobrecarga minima en memoria, pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct completo.
- Para inferencia en GPU consumer, se recomienda al menos 16 GB de VRAM con cuantizacion de 4 bits (p. ej., Q4_K_M) para el modelo base; sin cuantizar, se necesitan alrededor de 16-20 GB.
- GPUs adecuadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para despliegue a mayor escala.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, cargando el adaptador con PEFT sobre el modelo base.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de comparativas publicas con otros modelos de summarizacion de bugs. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct (Apache-2.0, 7.6B parametros, contexto 32K) es una alternativa generalista con capacidades de codigo, pero sin especializacion en resumen de bugs. Otros modelos como DeepSeek-R1-Distill-Qwen-7B (tambien basado en Qwen2.5-7B) se centran en razonamiento, no en summarizacion especifica. No se puede establecer una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Es un checkpoint experimental: la evaluacion de la tesis no demostro una mejora estadisticamente significativa sobre el baseline supervisado, por lo que su rendimiento no esta garantizado.
- Puede omitir informacion importante o alucinar detalles en los resumenes, como advierte la model card; no debe usarse para decisiones automatizadas en produccion.
- El corpus de entrenamiento no se incluye por restricciones de licencia, lo que limita la reproducibilidad y el analisis de sesgos.
- La licencia del adaptador es "other" y actualmente se comparte de forma privada para revision; no se transfieren derechos sobre los datasets. El uso comercial requiere aclarar la licencia final del proyecto.
- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- Al ser un adaptador LoRA, depende completamente del modelo base; cualquier limitacion de Qwen2.5-Coder-7B-Instruct (p. ej., sesgos en codigo o razonamiento) se hereda.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abid-Shahriar/BugSum-Qwen-7B-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio oficial de Qwen-7B (referencia): https://github.com/ArtificialZeng/Qwen-7B
