# EllipsesMark/soulfure

## Resumen

Soulfure (publicado por el autor EllipsesMark bajo el nombre interno "Sulphur 3") es un ajuste fino del modelo de generacion de video MiniMax-H3, desarrollado por MiniMaxAI. Se presenta como una variante "uncensored" del modelo base, es decir, un checkpoint derivado que elimina o relaja los filtros de contenido del modelo original para generar video sin las restricciones de seguridad habituales. El repositorio tiene un tamano de 276,5 GB y se distribuye principalmente como un unico archivo de pesos en formato safetensors (`s3.safetensors`), junto con variantes adicionales y un corrector opcional para ComfyUI.

El modelo hereda la arquitectura y las capacidades del MiniMax-H3 original, por lo que su funcionamiento es el de un generador de video texto-a-video (y presumiblemente imagen-a-video, aunque no se detalla). La model card no aporta informacion sobre parametros, longitud de contexto, composicion del dataset de entrenamiento ni proceso de ajuste, mas alla de mencionar que `s3.safetensors` incorpora un "RL lora" que la variante `s3_raw` no incluye. Esto sugiere un ajuste mediante aprendizaje por refuerzo sobre el modelo base, aunque no se especifican los detalles.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un modelo derivado con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin documentacion tecnica detallada y con una licencia comunitaria que impone restricciones. Es util para quienes ya trabajan con el ecosistema MiniMax-H3 y buscan una variante sin censura, pero no constituye una referencia tecnica contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de MiniMax-H3; el modelo base es un generador de video, arquitectura concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | versiones cuantizadas incluidas en `quantized/` (tipos concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License (`minimax-h3-community-license`) |
| Formato de pesos | safetensors (archivos `s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_raw_lora.safetensors`, `s3_corrector.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base MiniMax-H3 ni sobre la del ajuste. La model card unicamente indica que Soulfure es un derivado de MiniMax-H3 y que el archivo principal `s3.safetensors` incorpora un "RL lora", mientras que `s3_raw.safetensors` es la version sin dicho LoRA de aprendizaje por refuerzo. Esto apunta a un proceso de ajuste fino sobre el checkpoint base, con una etapa de RL aplicada mediante un adaptador LoRA fusionado, pero no se especifican hiperparametros, numero de pasos, datos utilizados ni metodologia de alineacion.

El repositorio incluye tambien una variante `s3_ref2va.safetensors` descrita como "Ref2VA variant, not trained" (variante no entrenada) y un corrector opcional (`s3_corrector.safetensors`) que, segun el autor, funciona tambien con otros modelos H3. No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de video a partir de texto (texto-a-video), heredada del modelo base MiniMax-H3.
- Generacion sin filtros de contenido ("uncensored"), segun la descripcion del autor.
- Variante Ref2VA incluida en el repositorio (no entrenada), presumiblemente orientada a referencia-a-video, aunque no se detalla su funcionamiento.
- Corrector opcional para mejorar resultados, con nodos y flujo de trabajo para ComfyUI.
- Compatibilidad con el ecosistema de ejecucion de MiniMax-H3 (libreria `minimax-h3`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito.

## Casos de uso

- Generacion de video creativo sin restricciones de contenido: el modelo permite producir clips de video a partir de descripciones textuales sin los filtros del modelo original, orientado a proyectos artisticos o de investigacion que requieran libertad creativa.
- Prototipado rapido de video en ComfyUI: gracias a los nodos y al flujo de trabajo incluidos en `S3_ComfyUI.zip`, se puede integrar el modelo en un pipeline visual de generacion de video para iterar sobre ideas.
- Investigacion sobre alineacion y seguridad: al ser una variante sin censura, resulta util para estudiar el comportamiento de modelos de video sin filtros y comparar con el modelo base.
- Experimentacion con el corrector: el archivo `s3_corrector.safetensors` puede aplicarse a otros modelos H3, lo que permite evaluar mejoras de calidad en distintos checkpoints.
- Despliegue en entornos con VRAM limitada: las versiones cuantizadas de `quantized/` permiten ejecutar el modelo en hardware mas modesto, aunque no se especifican los requisitos exactos.
- Fine-tuning posterior: la variante `s3_raw_lora.safetensors` permite aplicar el ajuste como LoRA sobre otros modelos, facilitando experimentos de personalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 276,5 GB, lo que sugiere que el modelo completo requiere hardware de gama alta (multiples GPU o GPU con gran cantidad de memoria), pero no se confirman cifras.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es probable que requiera GPU de centro de datos (A100, H100) para la version completa, pero no se especifica.
- Compatibilidad con GPU de consumo: las versiones cuantizadas de `quantized/` podrian permitir su ejecucion en GPU de consumo, pero no se detallan los requisitos ni los tipos de cuantizacion.
- Opciones de despliegue: ComfyUI (con los nodos incluidos en `S3_ComfyUI.zip`); se desconoce el soporte de vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a generacion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soulfure (Sulphur 3) | no disponible | no disponible | sin benchmarks | MiniMax-H3 Community License | Hugging Face (0 descargas) |
| MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax-H3 Community License | Hugging Face (modelo oficial de MiniMaxAI) |
| Tenstrip's Merges | no disponible | no disponible | no disponible | no disponible | Hugging Face (recomendado por el autor) |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks y documentacion tecnica: no hay datos de rendimiento, calidad ni comparativas verificables.
- Modelo "uncensored": la eliminacion de filtros de contenido implica riesgos legales y eticos; el uso para generar contenido danino puede infringir la licencia y la legislacion aplicable.
- Licencia MiniMax-H3 Community License: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el archivo `LICENSE` antes de cualquier despliegue en produccion.
- Tamano del repositorio muy elevado (276,5 GB), lo que dificulta su descarga, almacenamiento y ejecucion.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Informacion sobre idiomas, contexto y capacidades multilingues no disponible.
- Riesgo de alucinacion y artefactos visuales inherente a los modelos generativos de video, agravado por la falta de evaluacion publicada.
- La variante Ref2VA no esta entrenada, por lo que su uso puede producir resultados deficientes.

## Enlaces

- Hugging Face: https://huggingface.co/EllipsesMark/soulfure
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- X del autor: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges recomendados por el autor (TenStrip): https://huggingface.co/TenStrip
