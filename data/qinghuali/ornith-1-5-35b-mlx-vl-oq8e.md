# qinghuali/Ornith-1.5-35B-MLX-VL-oQ8e

## Resumen

Ornith-1.5-35B-MLX-VL-oQ8e es una cuantización en formato MLX del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.107.181.936 parámetros totales, capaz de procesar entradas de imagen y texto y generar texto (pipeline `image-text-to-text`). La versión que nos ocupa ha sido convertida y cuantizada por el usuario qinghuali mediante la herramienta oMLX, en su variante de cuantización mixta oQ en precisión de 8 bits.

El interés de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware Apple Silicon mediante el framework MLX, algo que con los pesos originales en safetensors de precisión completa resultaría inviable en equipos de consumo. El repositorio ocupa 37,7 GB, lo que da una idea del espacio en disco necesario para el despliegue local.

La información pública disponible es limitada: la model card del autor de la cuantización remite al modelo base para detalles de arquitectura y entrenamiento, y no se han publicado resultados de benchmarks en la información proporcionada. Esta ficha recoge lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`); detalles no disponibles |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ mixta de 8 bits (variante oQ8e); existe también variante oQ6 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, de ornith-ai. El tag `qwen3_5_moe` indica que se trata de un transformer con mezcla de expertos (MoE), presumiblemente derivado de la familia Qwen 3.5, aunque no se dispone de documentación pública en la información proporcionada sobre el número de expertos, el ratio de activación ni la dimensión de las capas. El sufijo "A3B" del nombre sugiere del orden de 3.000 millones de parámetros activos por token, pero este dato no está confirmado en la documentación disponible y por tanto no se recoge en la tabla de especificaciones.

Respecto al entrenamiento, no se dispone de información sobre el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card de esta cuantización no incluye estos detalles y remite implícitamente al repositorio del modelo base. La innovación técnica destacable de esta versión concreta es el proceso de cuantización oQ (oMLX Universal Dynamic Quantization), una cuantización dinámica de precisión mixta que asigna distintos niveles de bits a distintas capas o tensores según su sensibilidad, preservando la multimodalidad original (de ahí el sufijo "VL").

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados: pipeline `image-text-to-text`, con capacidad de responder preguntas sobre imágenes.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero esperable en un modelo de esta familia; tratar como no verificado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de documentos escaneados en local: el modelo puede recibir una imagen de una página y generar una descripción o extracción de texto, ejecutándose íntegramente en un Mac con Apple Silicon gracias al formato MLX, sin enviar datos a servicios externos.
- Asistente de accesibilidad: descripción de imágenes para personas con discapacidad visual, con latencia aceptable en hardware de consumo y sin coste por token de API.
- Prototipado de aplicaciones de visión-lenguaje: al ser una cuantización de 8 bits en MLX, permite iterar sobre prompts y flujos multimodales en un portátil antes de escalar a infraestructura mayor.
- Procesamiento por lotes de imágenes en investigación: clasificación, etiquetado o resumen de conjuntos de imágenes con un modelo de 35.000 millones de parámetros ejecutado localmente, útil cuando las restricciones de privacidad impiden usar APIs en la nube.
- Evaluación comparativa de cuantizaciones: la existencia de variantes oQ8 y oQ6 del mismo modelo base permite estudiar el compromiso entre calidad y uso de memoria en hardware Apple.
- Desarrollo de demos offline: aplicaciones de escritorio o notebooks que necesitan capacidades multimodales sin conectividad, aprovechando el ecosistema MLX y la licencia MIT para distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: 37,7 GB para los pesos cuantizados (tamaño del repositorio).
- VRAM/memoria unificada estimada: al menos 40 GB libres para cargar los pesos y trabajar con margen; en la práctica, un Mac con 64 GB de memoria unificada o superior es el escenario realista.
- Hardware objetivo: Apple Silicon exclusivamente (MLX no soporta GPU NVIDIA ni AMD). Se requiere un chip de la familia M-series con memoria unificada suficiente; los modelos M1/M2/M3/M4 Pro con 36 GB quedan justos, y las variantes Max o Ultra con 64 GB o más son las recomendadas.
- GPU NVIDIA: no aplicable; para CUDA habría que usar los pesos originales del modelo base con vLLM, TGI o llama.cpp, no esta cuantización.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (por ejemplo, `mlx-vlm` para el pipeline de visión-lenguaje); no es compatible con vLLM, TGI, Ollama ni llama.cpp en su forma actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-MLX-VL-oQ8e | 35,1 B (MoE) | no disponible | imagen-texto | MIT | MLX safetensors 8 bits |
| Ornith-1.5-35B-A3B (base) | 35,1 B (MoE) | no disponible | imagen-texto | MIT | safetensors |
| Ornith-1.5-35B-MLX-VL-oQ6e | 35,1 B (MoE) | no disponible | imagen-texto | MIT | MLX safetensors 6 bits |

No se dispone de información sobre modelos de terceros comparables (por ejemplo, de la familia Qwen-VL original) en la documentación proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`language: en`); el rendimiento en castellano no está verificado y probablemente sea inferior.
- La cuantización de 8 bits introduce pérdida de precisión respecto a los pesos originales; la variante oQ6 pierde aún más. No se han publicado evaluaciones del degradado de calidad.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos específicos de evaluación en la información disponible.
- Sesgos: no disponibles en la documentación proporcionada; deben asumirse los del corpus de entrenamiento del modelo base, no documentado aquí.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon, lo que limita la portabilidad a producción en clústeres con GPU NVIDIA.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base Ornith-1.5-35B-A3B, ya que la cuantización hereda las obligaciones del original.
- Repositorio con muy poca tracción (149 descargas, 0 likes) y autor individual; no hay garantía de mantenimiento ni de soporte.
- Los enlaces de la model card apuntan a un espacio de nombres distinto (`liqinghhua`) del repositorio actual (`qinghuali`), lo que puede indicar inconsistencias en la publicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qinghuali/Ornith-1.5-35B-MLX-VL-oQ8e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Documentación de oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Variante oQ8 (enlace de la model card): https://huggingface.co/liqinghhua/Ornith-1.5-35B-MLX-VL-oQ8e
- Variante oQ6 (enlace de la model card): https://huggingface.co/liqinghhua/Ornith-1.5-35B-MLX-VL-oQ6e
