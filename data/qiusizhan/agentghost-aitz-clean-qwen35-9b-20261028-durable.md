# qiusizhan/agentghost-aitz-clean-qwen35-9b-20261028-durable

## Resumen

AgentGhost AITZ Clean Qwen3.5-9B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B publicado por el usuario qiusizhan en HuggingFace. Se distribuye como un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. El nombre sugiere un entrenamiento orientado a tareas de tipo agente ("agentghost") con un conjunto de control limpio ("clean-control") y una variante etiquetada como "durable" fechada el 28 de octubre de 2026.

El modelo cuenta con 9.409.813.744 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de los 9B, y hereda la arquitectura y las capacidades del Qwen3.5-9B original. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace antes de la descarga.

Su relevancia es limitada por el momento: cuenta con 4 descargas y 0 likes, y no se han publicado resultados de benchmarks ni documentacion tecnica detallada en la informacion disponible. Debe considerarse un modelo de investigacion experimental, no un modelo listo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, por lo que su arquitectura de base corresponde a la familia Qwen3.5 en su variante de 9B parametros, con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre si incorpora innovaciones como atencion lineal o decodificacion especulativa; estos datos no estan publicados en la informacion proporcionada.

Respecto al entrenamiento, la informacion disponible solo aporta las etiquetas "agentghost", "clean-control" y "durable", que sugieren un ajuste orientado a comportamiento de agente y a un conjunto de datos de control depurado, pero no se especifican el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documentan hiperparametros, regimen de entrenamiento ni evaluaciones internas.

## Capacidades

- Generacion de texto conversacional en formato chat (tag "conversational").
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales y dialogos con soporte visual.
- Capacidad potencial de razonamiento y codigo heredada del modelo base Qwen3.5-9B, aunque no se documenta de forma explicita en la ficha del fine-tune.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el nombre del modelo sugiere orientacion a agentes, pero no se documenta tecnicamente.
- Capacidades multilingues: no disponibles; no se listan idiomas.
- Modo thinking, vision o audio: se confirma vision por el pipeline; no se documenta modo thinking ni audio.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir una imagen y una pregunta en texto y devolver una respuesta conversacional, lo que sirve para validar flujos de atencion al cliente con soporte visual antes de invertir en un modelo mayor.
- Investigacion sobre comportamiento de agentes: dado el etiquetado "agentghost" y "clean-control", es adecuado como punto de partida para experimentos academicos sobre control de comportamiento en agentes conversacionales, comparando frente al Qwen3.5-9B base.
- Descripcion automatica de imagenes en catalogos internos: se puede usar para generar descripciones textuales de productos o documentos escaneados en un pipeline de preprocesado, siempre con revision humana dada la ausencia de benchmarks.
- Extraccion de informacion de capturas y documentos: al aceptar imagen y texto, permite plantear tareas de lectura de formularios o capturas de pantalla y devolver los campos en texto estructurado, util en automatizacion de back-office.
- Evaluacion comparativa de fine-tunes: al ser un fine-tune de Qwen3.5-9B con licencia Apache 2.0, sirve como candidato en estudios internos que comparen variantes ajustadas sobre el mismo modelo base para una tarea concreta.
- Base para ajuste adicional (continued fine-tuning): su licencia permisiva y su formato safetensors compatible con transformers permiten reutilizarlo como punto de partida para un ajuste especifico del dominio del equipo, aunque el acceso gated obliga a gestionar la aceptacion de condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parametros, en FP16 se requieren aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para FP16, una A100 40 GB, H100 80 GB o L40S 48 GB permiten inferencia comoda; una RTX 4090 de 24 GB puede alojar los pesos en FP16 pero con margen ajustado para contexto largo.
- Cabe en GPU de consumo: si, en GPUs de 24 GB (RTX 3090, RTX 4090) con cuantizacion de 8 o 4 bits; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), y en principio vLLM, TGI o llama.cpp si se generan pesos compatibles, aunque no se documentan variantes GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AgentGhost AITZ Clean Qwen3.5-9B | 9,41B | no disponible | Apache 2.0 | Gated | Fine-tune multimodal de Qwen3.5-9B; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | segun modelo base | no disponible | Modelo original del que deriva; referencia obligada de comparacion |
| Alternativas multimodales de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de rendimiento frente al modelo base ni frente a alternativas, por lo que no debe desplegarse en produccion sin una evaluacion propia.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace y disponer de token de acceso para descargar los pesos, lo que complica la automatizacion de pipelines.
- Idiomas no documentados: se desconoce la cobertura linguistica real del fine-tune, especialmente si el ajuste se hizo solo en ingles o en otro idioma.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin evaluaciones de fidelidad no puede cuantificarse.
- Sesgos: no se documentan analisis de sesgo ni de seguridad del fine-tune.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar que la licencia del modelo base no imponga condiciones adicionales.
- Contexto maximo desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana real.
- Modelo de investigacion con 4 descargas: la comunidad no lo ha validado, por lo que la calidad del ajuste es incierta.
- Fecha de creacion en 2026 y etiqueta "durable": no hay informacion sobre que significa exactamente esa etiqueta ni sobre el proceso de entrenamiento asociado.

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/agentghost-aitz-clean-qwen35-9b-20261028-durable
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
