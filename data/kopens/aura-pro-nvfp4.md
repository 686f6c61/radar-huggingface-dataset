# kopens/Aura-Pro-NVFP4

## Resumen

Aura-Pro-NVFP4 es un modelo multimodal (image-text-to-text) publicado por el usuario kopens en Hugging Face, orientado al dominio industrial y manufactura avanzada. Según sus etiquetas, el modelo está basado en la arquitectura Gemma 4 y se presenta como una variante cuantizada en formato NVFP4 (cuantización de 4 bits nativa de NVIDIA mediante compressed-tensors), con capacidades de razonamiento, tool calling y análisis de imágenes. Su perfil de uso se centra en fábricas inteligentes (smart factory), mantenimiento predictivo, detección de anomalías y análisis de causa raíz (root-cause analysis).

El modelo soporta coreano e inglés, lo que lo hace especialmente relevante para entornos industriales en Corea que necesiten un asistente multimodal capaz de interpretar documentación técnica, imágenes de planta o sensores visuales. Con aproximadamente 20,87 mil millones de parámetros totales (dato extraído de los safetensors) y un repositorio de 30,2 GB, se sitúa en la gama de modelos medianos-grandes desplegables en una sola GPU de gama alta.

Cabe destacar que el acceso al repositorio es restringido (gated): es necesario aceptar las condiciones de la licencia aura-research-license antes de poder descargar los pesos. A fecha de la ficha, el modelo registra 0 descargas y 1 me gusta, por lo que no existe todavía una comunidad de usuarios que haya validado su rendimiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (multimodal, image-text-to-text) |
| Parametros totales | 20.868.593.516 (~20,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, compressed-tensors) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | aura-research-license (otra; acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4, con capacidades multimodales de entrada imagen-texto y salida de texto (pipeline image-text-to-text). No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre el uso de tecnicas de alineacion como RLHF o DPO en la informacion disponible.

La caracteristica tecnica mas destacable es la cuantizacion NVFP4, el formato de 4 bits en punto flotante propuesto por NVIDIA para inferencia eficiente en GPUs de la familia Blackwell, distribuida mediante la libreria compressed-tensors. Esto reduce el repositorio a 30,2 GB frente a los ~40 GB que ocuparia el modelo en bf16, permitiendo despliegues en una sola GPU con memoria suficiente. No hay datos publicados sobre si se trata de una cuantizacion post-entrenamiento (PTQ) o si el modelo fue entrenado con awareness de la cuantizacion (QAT).

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Comprension multimodal: acepta entradas de imagen junto con texto (pipeline image-text-to-text).
- Razonamiento (reasoning), segun las etiquetas del repositorio.
- Tool calling / function calling, segun las etiquetas del repositorio.
- Dominio especializado industrial: manufactura, smart factory, mantenimiento predictivo, deteccion de anomalias y analisis de causa raiz.
- Ingenieria y documentacion tecnica como areas de aplicacion declaradas.

## Casos de uso

- Mantenimiento predictivo: analisis de imagenes de equipos industriales (senales de desgaste, fugas, corrosion) combinadas con informes de texto para priorizar intervenciones de mantenimiento.
- Deteccion de anomalias visual: inspeccion de imagenes de linea de produccion para identificar defectos o desviaciones del estado normal del proceso.
- Analisis de causa raiz (RCA): encadenamiento de razonamiento multi-paso sobre registros de incidentes, fotografias de fallos y documentacion tecnica para proponer hipotesis de fallo.
- Asistente tecnico bilingue ko/en: consulta de manuales, esquemas y especificaciones de maquinaria en coreano o ingles dentro de plantas con equipos de trabajo mixtos.
- Documentacion de planta inteligente: generacion de resumenes e informes a partir de capturas de HMI/SCADA y notas de operario, aprovechando la entrada multimodal.
- Integracion en sistemas de agentes industriales: gracias al soporte de tool calling declarado, puede invocar APIs de MES/CMMS (ordenes de trabajo, historicos de sensor) dentro de flujos multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos NVFP4 de 4 bits y 20,9 B de parametros, el repositorio ocupa 30,2 GB; se estima un minimo de ~32-40 GB de VRAM contando KV cache y overhead de vision. No hay cifras oficiales.
- GPU recomendadas: el formato NVFP4 esta optimizado para GPUs NVIDIA Blackwell (B100/B200/RTX 50 series). En arquitecturas anteriores (A100, H100) la cuantizacion NVFP4 puede no estar acelerada nativamente, aunque compressed-tensors ofrece rutas de compatibilidad.
- Consumer GPU: no cabe de forma practica en GPUs de consumo tipicas (RTX 4090 con 24 GB se queda corta para el modelo completo); seria necesario recurrir a offload a CPU/RAM o esperar cuantizaciones adicionales de menor bitwidth, no disponibles en el repo.
- Despliegue: la cuantizacion compressed-tensors apunta a vLLM como runtime principal. No consta soporte verificado en llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|---|
| Aura-Pro-NVFP4 | ~20,9 B | imagen-texto a texto | no disponible | NVFP4 (4 bit) | aura-research-license | gated |
| Gemma 3 27B (base de referencia de la familia) | 27 B | imagen-texto a texto | 128 K | bf16 y variantes comunitarias | Gemma license | abierto |
| Qwen2.5-VL-32B-Instruct | 32 B | imagen-texto a texto | 128 K | bf16 y variantes comunitarias | Apache 2.0 | abierto |
| InternVL3-14B | 14 B | imagen-texto a texto | 32 K | bf16 y variantes comunitarias | Apache 2.0 (base) | abierto |

Nota: la comparativa es orientativa, ya que no se han publicado benchmarks de Aura-Pro-NVFP4 que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar la aura-research-license; conviene revisar sus terminos antes de cualquier despliegue comercial, ya que el nombre sugiere orientacion a investigacion y puede incluir restricciones de uso.
- Sin historial de uso: 0 descargas y 1 like indican que el modelo no ha sido validado por la comunidad; no hay reportes de calidad, alucinaciones ni sesgos.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano u otras lenguas no esta documentado y probablemente sea pobre.
- Contexto, datos de entrenamiento y benchmarks no publicados: imposible evaluar rigorosamente su calidad o compararlo con alternativas.
- Hardware exigente: la cuantizacion NVFP4 requiere GPUs recientes para rendir; en hardware mas antiguo puede no ser ejecutable de forma eficiente.
- Riesgo de alucinacion no evaluado: al tratarse de un modelo especializado en dominio industrial, las respuestas sobre seguridad de planta o decisiones de mantenimiento deben supervisarse siempre por personal cualificado.

## Enlaces

- Hugging Face: https://huggingface.co/kopens/Aura-Pro-NVFP4
- No se han encontrado en la informacion disponible enlaces adicionales (paper, blog, repositorio de codigo o demo).
