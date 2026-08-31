# drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit

## Resumen

El modelo `drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit` es una variante "abliterada" (desprovista de mecanismos de rechazo) del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, publicada por el autor comunitario drowzeys. La tecnica de abliteration elimina o atenua las capas de refusal del modelo original, dando lugar a una version sin censura orientada a investigacion y experimentacion. El repositorio ocupa 167,8 GB y el acceso esta restringido (gated) en HuggingFace, requiriendo aceptacion de condiciones previa a la descarga.

Se trata de un modelo de arquitectura MoE (mixture of experts) con 304.646.824.126 parametros totales (~304,6 mil millones), en cuantizacion FP8, con capacidades multimodales de imagen a texto (pipeline image-text-to-text). Las etiquetas del repositorio indican compatibilidad con vLLM, optimizacion para DGX Spark y GB10, y el uso de "anchored tensors" durante el proceso de modificacion. Los idiomas soportados son ingles y chino.

La relevancia de este modelo reside en su doble vertiente: ofrece una alternativa sin restricciones de un modelo frontier multimodal de gran tamano, y sirve como caso de estudio para la comunidad sobre los efectos de la abliteration en modelos de ultima generacion. No obstante, carece de benchmarks publicados, no registra descargas ni valoraciones, y su licencia (deepseek) impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text), basada en DeepSeek-V4-Flash-Vision-Exp |
| Parametros totales | 304.646.824.126 (~304,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8 bits) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | deepseek (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-V4-Flash-Vision-Exp como base y aplica un proceso de abliteration, una tecnica que identifica y elimina las direcciones de activacion responsables del comportamiento de rechazo en el modelo original. El resultado es una variante "uncensored" que mantiene las capacidades generativas del modelo base sin los mecanismos de refusal. Las etiquetas del repositorio mencionan "anchored tensors", lo que sugiere el uso de anclaje de tensores durante el proceso, aunque no se dispone de detalles tecnicos adicionales sobre la metodologia empleada.

La arquitectura subyacente es de tipo MoE multimodal, capaz de procesar entradas de imagen y texto. El modelo se distribuye en cuantizacion FP8, lo que reduce los requisitos de memoria frente a una representacion en BF16. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si el modelo base utilizo tecnicas como RLHF o DPO. El caracter experimental ("EXP") y la ausencia de documentacion tecnica en el repositorio limitan el conocimiento sobre los detalles de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento de vision: hereda las capacidades de vision de DeepSeek-V4-Flash-Vision-Exp, permitiendo describir, analizar y razonar sobre imagenes.
- Comportamiento sin censura: al estar abliterado, no aplica los mecanismos de rechazo del modelo original, lo que permite generar contenido que el modelo base bloquearia.
- Soporte multilingue limitado a ingles y chino, segun las etiquetas del repositorio.
- Compatible con vLLM y endpoints de inferencia, segun las etiquetas "vllm" y "endpoints_compatible".
- Optimizado para inferencia local en DGX Spark y GB10, con recetas de despliegue publicadas por el autor en GitHub.
- No se ha confirmado soporte de tool calling, function calling ni modo agente en la informacion disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo permite estudiar los efectos de la eliminacion de mecanismos de rechazo en un LLM multimodal de gran tamano, comparando su comportamiento con el modelo base DeepSeek-V4-Flash-Vision-Exp.
- Analisis de imagenes en entornos de investigacion controlados: puede utilizarse para tareas de vision por computador donde el modelo base rechazaria ciertas entradas, como el analisis de contenido medico o cientifico sensible.
- Generacion de contenido creativo sin restricciones: la ausencia de refusal permite explorar estilos y tematicas que los modelos censurados bloquean, util en prototipado creativo y narrativa experimental.
- Inferencia local en DGX Spark: gracias a las recetas de despliegue del autor, puede ejecutarse en hardware GB10 con memoria unificada de 128 GB, aunque probablemente requiera cuantizacion adicional o descarga de expertos a memoria secundaria.
- Evaluacion de seguridad y alineacion: sirve como banco de pruebas para medir la eficacia de las tecnicas de alineacion y cuantificar los riesgos de los modelos sin censura en tareas de red teaming.
- Experimentacion academica en NLP: para investigacion sobre alucinacion, sesgos y comportamiento de modelos MoE multimodales sin restricciones de alineacion, en entornos universitarios con acceso a hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar, y el modelo no registra descargas ni valoraciones en HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia: con 304,6 mil millones de parametros en FP8, se necesitan aproximadamente 305 GB de memoria para cargar el modelo completo en GPU.
- GPU recomendadas: el modelo esta orientado a DGX Spark (GB10) con 128 GB de memoria unificada, y a configuraciones multi-GPU de datacenter (A100 80 GB, H100 80 GB) para cargar el modelo completo sin offloading.
- GPU de consumo: no es viable en GPU de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB) sin cuantizacion extrema y offloading a CPU, con penalizaciones severas de latencia.
- Opciones de despliegue: vLLM (mencionado en las etiquetas), llama.cpp, y las recetas locales del autor para DGX Spark y Mac Studio, publicadas en su repositorio de GitHub.
- Latencia y throughput: no se han publicado mediciones. En DGX Spark, la inferencia de un modelo MoE de este tamano requerira cuantizacion adicional o descarga parcial de expertos a memoria secundaria, con impacto directo en la latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Acceso |
|---|---|---|---|---|---|
| drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit | 304,6B (MoE) | no disponible | Si (imagen+texto) | deepseek | Gated |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (base) | no disponible | no disponible | Si (imagen+texto) | deepseek | no disponible |
| DeepSeek-R1 | no disponible | no disponible | No | deepseek | no disponible |

No se dispone de datos suficientes sobre los modelos comparables para establecer una comparativa detallada de rendimiento. La diferencia principal frente al modelo base es la eliminacion de los mecanismos de rechazo mediante abliteration. DeepSeek-R1 se menciona en el sitio oficial de DeepSeek como un modelo frontier de razonamiento, pero no se dispone de sus especificaciones tecnicas en la informacion recopilada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace y requiere aceptar condiciones especificas antes de su descarga.
- Licencia restrictiva: la licencia deepseek impone restricciones de uso comercial y puede limitar la redistribucion del modelo.
- Riesgo de contenido nocivo: al estar abliterado, el modelo puede generar contenido ofensivo, ilegal o peligroso que el modelo base bloquearia. No debe desplegarse en produccion sin salvaguardas adicionales.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de tasas de alucinacion; al ser una variante sin alineacion, estos riesgos pueden verse amplificados respecto al modelo base.
- Idiomas limitados: solo soporta ingles y chino, lo que restringe su uso en entornos multilingues.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento, lo que impide comparar su calidad con otros modelos de forma rigurosa.
- Requisitos de hardware elevados: su tamano (304,6B parametros) exige infraestructura de datacenter o hardware especializado como DGX Spark, lo que limita su accesibilidad.
- Modelo experimental: las etiquetas indican "EXP" (experimental), lo que sugiere que no es una version estable para produccion.
- Sin comunidad ni traccion: el modelo no registra descargas ni valoraciones, lo que indica una adopcion nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit
- Perfil del autor en HuggingFace: https://huggingface.co/drowzeys
- GitHub del autor: https://github.com/drowzeys
- Repositorio de recetas de inferencia local: https://github.com/drowzeys/drowzeys
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
