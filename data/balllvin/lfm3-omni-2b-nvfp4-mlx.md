# balllvin/LFM3-Omni-2B-NVFP4-MLX

## Resumen

LFM3-Omni-2B-NVFP4-MLX es una conversión comunitaria del modelo LiquidAI/LFM3-Omni-2B de Liquid AI al formato MLX con cuantización de 4 bits en NVFP4, publicada por el usuario balllvin. El modelo base es un modelo any-to-any (entrada y salida multimodal) de aproximadamente 2.166 millones de parámetros, orientado a tareas que combinan texto, imagen y audio. Esta versión concreta está pensada para su ejecución en hardware Apple Silicon mediante el framework MLX, aprovechando el formato NVFP4 para reducir el peso de los pesos a unos 2,9 GB en el repositorio.

La relevancia de esta ficha radica en que permite ejecutar un modelo omni-modal de 2B en equipos de consumo con chip de Apple, algo que con pesos en precisión completa resultaría inviable en memoria. No obstante, se trata de una conversión no oficial, con licencia LFM1.0 (licencia propia de Liquid AI, no plenamente abierta) y con acceso restringido en Hugging Face, lo que condiciona su uso comercial y su distribución. La información pública disponible sobre el proceso de conversión, los datos de entrenamiento del modelo base y los benchmarks es muy limitada.

Al ser una conversión de pesos y no un modelo entrenado desde cero, sus capacidades funcionales son las del modelo base LiquidAI/LFM3-Omni-2B, si bien la cuantización a 4 bits puede introducir degradación en tareas sensibles a la precisión numérica. Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos del repositorio y del modelo de origen, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni de Liquid AI; familia LFM, detalles no confirmados en la informacion proporcionada) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NVFP4 (esta version); el modelo base admite otras precisiones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | safetensors (MLX), 4-bit NVFP4 |
| Libreria | mlx |
| Pipeline | any-to-any |
| Tamano del repo | 2,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Modelo base | LiquidAI/LFM3-Omni-2B |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LiquidAI/LFM3-Omni-2B en la informacion proporcionada. Por la denominacion "Omni" y el pipeline any-to-any, se trata de un modelo multimodal que acepta y genera mas de una modalidad (presumiblemente texto, imagen y audio), pero no se confirman ni el tipo de transformer, ni si incorpora componentes SSM o hibridos, ni la composicion exacta de sus torres de codificacion.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Esta version concreta es una conversion de pesos a MLX con cuantizacion NVFP4 realizada por un tercero (balllvin), no un reentrenamiento; por tanto, sus caracteristicas de entrenamiento son las del modelo original de Liquid AI. Cualquier innovacion tecnica del modelo base (atencion lineal, decodificacion especulativa, etc.) no puede confirmarse con la informacion disponible.

## Capacidades

- Generacion multimodal any-to-any: al estar etiquetado con el pipeline any-to-any, se espera soporte de entrada y salida en multiples modalidades (texto, imagen y audio), aunque la combinacion exacta no se detalla en la informacion proporcionada.
- Generacion de texto y conversacion multi-turno, heredada del modelo base.
- Procesamiento de imagenes y audio como entrada, segun la naturaleza omni del modelo base.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible (idiomas no especificados).
- Modo thinking o razonamiento extendido: no disponible (no confirmado).
- Ejecucion local en Apple Silicon mediante MLX, con pesos de 4 bits NVFP4.

## Casos de uso

- Asistentes multimodales en local sobre Mac: el modelo puede desplegarse con MLX en equipos Apple Silicon para construir asistentes que reciban texto, imagen y audio sin depender de la nube, gracias a sus 2,9 GB de pesos cuantizados a 4 bits.
- Transcripcion y resumen de audio en el dispositivo: al ser un modelo omni con entrada de audio, puede emplearse para procesar grabaciones y generar resumenes textuales en local, util en entornos con requisitos de privacidad.
- Descripcion y analisis de imagenes: integrable en herramientas de accesibilidad o catalogacion que reciban una imagen y devuelvan una descripcion textual, ejecutandose en hardware de consumo.
- Prototipado rapido de aplicaciones multimodales: para desarrolladores que quieran validar flujos any-to-any en Mac antes de escalar a infraestructura mayor, esta version MLX reduce la friccion de despliegue.
- Investigacion sobre cuantizacion: sirve como caso de estudio para medir la degradacion de un modelo omni de 2B al pasar a 4 bits NVFP4 en comparacion con el modelo base en mayor precision.
- Educacion y demos offline: permite montar demostraciones de IA multimodal sin conexion en portatiles Apple, adecuado para talleres y entornos docentes.
- Evaluacion de licencias y despliegue corporativo: util para equipos que necesiten analizar las implicaciones de la licencia LFM1.0 antes de adoptar modelos de Liquid AI en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 2,9 GB en pesos de 4 bits; se recomienda al menos 8 GB de memoria unificada para inferencia comoda, y 16 GB para margen con contexto largo y buffers de activacion (estimacion, no dato oficial).
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato es MLX y NVFP4 esta orientado a dicho ecosistema.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa a esta conversion MLX; para CUDA seria necesario usar el modelo base en otro formato.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se confirma soporte en GPUs NVIDIA consumer con este formato.
- Opciones de despliegue: MLX (libreria indicada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta conversion concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato/Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-NVFP4-MLX (esta ficha) | 2,17B | no disponible | any-to-any | LFM1.0 (restringida) | MLX 4-bit, acceso gated |
| LiquidAI/LFM3-Omni-2B (modelo base) | 2,17B | no disponible | any-to-any | LFM1.0 | safetensors, acceso segun repositorio original |
| Alternativas de 2B omni-multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria; los datos de rendimiento, contexto y licencia de alternativas comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: realizada por un tercero (balllvin), sin garantia de paridad funcional con el modelo base de Liquid AI.
- Cuantizacion a 4 bits NVFP4: puede degradar la calidad en tareas sensibles a la precision (matematicas, codigo, generacion de audio o imagen), sin benchmarks publicados que lo cuantifiquen.
- Licencia LFM1.0: no es una licencia de codigo abierto plenamente permisiva; el uso comercial esta sujeto a condiciones que deben revisarse antes de adoptar el modelo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la redistribucion y la automatizacion de descargas.
- Idiomas no especificados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas concretos.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas para esta version.
- Sesgos: no documentados en la informacion disponible.
- Dependencia de hardware Apple: el formato MLX limita su uso a ecosistema Apple Silicon; no es portable directamente a CUDA.
- Sin soporte comunitario verificado: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de incidencias resueltas por otros usuarios.
- Fecha de publicacion futura (2026-11-15): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-NVFP4-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Organizacion Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Framework MLX: https://github.com/ml-explore/mlx
- Licencia LFM1.0: consultar los terminos enlazados desde el repositorio de Hugging Face (no se proporciona URL directa en la informacion disponible).
