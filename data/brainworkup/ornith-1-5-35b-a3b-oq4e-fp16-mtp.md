# brainworkup/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-fp16-mtp es una cuantización mixta del modelo Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai y cuantizado por el usuario brainworkup mediante la herramienta oQ (oMLX v0.7.4.dev1). Se trata de un transformer de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, del que se desconoce el número de parámetros activos a pesar del sufijo "A3B" en su nombre. El checkpoint incorpora además un cabezal de visión (0,447B parámetros) y un cabezal MTP (Multi-Token Prediction, 0,845B parámetros), lo que sugiere capacidades multimodales y decodificación especulativa.

La relevancia de esta ficha radica en que ofrece una versión comprimida y lista para ejecutarse con MLX, el framework de Apple para silicio de la compañía, con un peso efectivo medio de 5,124 bits por parámetro y un almacenamiento total de 21,445 GiB. Esto permite desplegar un modelo de casi 36.000 millones de parámetros en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra), algo inviable con los pesos en FP16 originales.

No obstante, la información pública disponible es muy limitada: la model card del cuantizador no documenta licencia, idiomas soportados, datos de entrenamiento, benchmarks ni el pipeline de la tarea. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 4-bit grupo 64 (91,838% de los pesos), affine 8-bit grupo 128 (0,359%), affine 8-bit grupo 64 (6,474%), FP16 (0,086%), FP32 (1,242%); media efectiva 5,124 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX); repo de 45,5 GB |
| Componentes | LM 34,661B (19,313 GiB), vision 0,447B (1,664 GiB), MTP head 0,845B (0,468 GiB) |
| Almacenamiento total | 23,027 GB / 21,445 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts, tal como indica el tag `qwen3_5_moe` asociado al repositorio, lo que apunta a una arquitectura derivada de la familia Qwen 3.5 MoE. Con 35,952B parámetros totales y una nomenclatura "A3B" que convencionalmente denota parámetros activos, es plausible que active aproximadamente 3.000 millones de parámetros por token, aunque este dato no está confirmado en la información disponible. El checkpoint incorpora un cabezal de visión de 0,447B parámetros, lo que confirma capacidades multimodales de entrada de imagen, y un cabezal MTP de 0,845B parámetros orientado a la predicción multi-token, técnica habitual para acelerar la decodificación mediante especulación.

El proceso de cuantización aplicado por brainworkup emplea oQ (oMLX v0.7.4.dev1), un esquema de precisión mixta que asigna 4 bits con grupo de 64 a la gran mayoría de los pesos (91,838%), reserva 8 bits para un 6,833% de los pesos (probablemente capas sensibles como embeddings, cabezales de atención o normas) y mantiene en FP16 y FP32 un 1,328% restante. El resultado es un checkpoint de 21,445 GiB con una media efectiva de 5,124 bits por peso. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Ornith-1.5-35B-A3B (sin detalles públicos sobre benchmarks).
- Procesamiento de visión: el checkpoint incluye un componente de visión de 0,447B parámetros, lo que habilita entrada de imágenes.
- Decodificación especulativa mediante cabezal MTP (Multi-Token Prediction), que puede acelerar la inferencia en MLX.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en formato MLX y ocupa 21,445 GiB, por lo que puede ejecutarse en Mac Studio o MacBook Pro con memoria unificada de 32 GB o superior, permitiendo asistentes de texto y visión sin conexión a servicios en la nube.
- Análisis de documentos con imágenes: gracias al cabezal de visión integrado, el modelo puede procesar capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de información en flujos de trabajo locales.
- Aceleración de la generación mediante MTP: el cabezal de predicción multi-token permite implementar decodificación especulativa en MLX, reduciendo la latencia en tareas de generación larga como resúmenes o redacción asistida.
- Prototipado de aplicaciones multimodales en macOS: desarrolladores que trabajan con el stack MLX pueden integrar el modelo en apps nativas mediante la librería `mlx-lm`, aprovechando la cuantización para mantener la memoria bajo control.
- Investigación sobre cuantización mixta: el checkpoint sirve como caso de estudio reproducible de oQ, con una distribución de bits documentada por componente, útil para evaluar el impacto de la precisión mixta en calidad y velocidad.
- Despliegue en entornos con restricciones de memoria: al reducir el peso de 71,9 GB (FP16) a 21,445 GiB, permite servir el modelo en hardware que no podría alojar los pesos originales, aunque con la limitación de que MLX está restringido a Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 21,445 GiB solo para pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 32 GB de memoria unificada y 48-64 GB para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (MLX no soporta CUDA). Mac Studio con M2 Ultra (64-192 GB), MacBook Pro con M3/M4 Max (36-128 GB).
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 32 GB o más; no es compatible con GPUs NVIDIA o AMD convencionales por el formato MLX.
- Opciones de despliegue: `mlx-lm` y `mlx` (librería nativa); no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ4e-fp16-mtp | 35,952B (MoE) | no disponible | MLX safetensors, 5,124 bits/peso | no disponible | Hugging Face, 62 descargas |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,952B (MoE) | no disponible | safetensors FP16/BF16 | no disponible | Hugging Face (modelo original) |
| Alternativas de la familia Qwen 3.5 MoE | no disponible | no disponible | safetensors, GGUF | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. La comparación más directa es con el modelo base sin cuantizar, del que este checkpoint deriva.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de cualquier despliegue en producción.
- La cuantización a 4 bits en el 91,838% de los pesos puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento matemático o código; no se han publicado evaluaciones comparativas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA/AMD ni a servidores x86 convencionales sin conversión.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no hay documentación sobre mitigaciones aplicadas.
- Idiomas soportados no documentados: se desconoce si el modelo cubre castellano con calidad suficiente.
- Contexto máximo no disponible: no puede planificarse el uso en tareas de contexto largo sin verificación empírica.
- Sesgos conocidos: no documentados en la información disponible.
- El repositorio tiene 62 descargas y 0 likes, lo que indica una validación comunitaria muy limitada; la fecha de actualización (2026-11-12) sugiere una revisión reciente del checkpoint (re-cuantizado con oMLX v0.7.4.dev1).
- La model card no documenta el proceso de entrenamiento ni la procedencia de los datos, lo que impide evaluar riesgos de contaminación o sesgos de dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/brainworkup/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
