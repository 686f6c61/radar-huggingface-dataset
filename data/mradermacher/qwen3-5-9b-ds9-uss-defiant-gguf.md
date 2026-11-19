# mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF

## Resumen

Qwen3.5-9B-DS9-USS-Defiant-GGUF es la version cuantizada en formato GGUF del modelo nightmedia/Qwen3.5-9B-DS9-USS-Defiant, un fine-tune de la familia Qwen3.5 de 9B parametros orientado a escritura creativa, narrativa de ficcion y roleplaying. El trabajo de cuantizacion lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares para su uso con llama.cpp y derivados. El modelo base incorpora etiquetas como "heretic" y "abliterated", lo que indica que ha sido modificado para reducir los rechazos de seguridad del modelo original, y se presenta como "uncensored" para usos creativos.

El modelo resuelve el problema de desplegar un LLM de 9B especializado en generacion literaria en hardware de consumo, ofreciendo un abanico de cuantizaciones que van desde Q2_K (3,9 GB) hasta f16 (18 GB). Con 8.953.803.264 parametros reales en safetensors y una licencia Apache 2.0, es una opcion atractiva para desarrolladores que quieren integrar generacion de ficcion, continuacion de escenas o narrativa interactiva en local sin depender de APIs externas.

La relevancia actual radica en la combinacion de tres factores: un modelo base reciente (Qwen3.5), una especializacion clara en escritura creativa y una disponibilidad inmediata en GGUF con multiples niveles de compresion, lo que facilita su evaluacion rapida tanto en GPUs de consumo como en servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5, no se detalla la variante exacta) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; tambien existen quants ponderados/imatrix en el repo i1 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repo base usa safetensors en bfloat16) |

## Arquitectura y entrenamiento

El modelo base nightmedia/Qwen3.5-9B-DS9-USS-Defiant es un fine-tune de Qwen3.5 de 9B parametros. La model card del repo cuantizado no detalla la arquitectura interna mas alla de la referencia a Qwen3.5 y a la libreria transformers; tampoco especifica el numero de tokens de entrenamiento ni la composicion del dataset. Las etiquetas del modelo indican el uso de Unsloth para el fine-tuning, mergekit para la fusion de modelos y tecnicas de "abliteration"/"heretic" para eliminar los mecanismos de rechazo del modelo original.

Entre las innovaciones tecnicas declaradas en las etiquetas figuran el soporte de mxfp8, la compatibilidad con MLX (Apple Silicon) y la mencion a "merge" y "mergekit", lo que sugiere que el modelo final es el resultado de una fusion de adaptadores o de modelos especializados. No se documenta el uso de RLHF, DPO ni decodificacion especulativa. La informacion sobre datos de entrenamiento y proceso de alineacion es, por tanto, no disponible.

## Capacidades

- Generacion de texto creativo en ingles y chino, con enfasis en ficcion, narrativa y descripcion vivida.
- Escritura de relatos, generacion de tramas y subtramas, continuacion de escenas y storytelling en multiples generos (ciencia ficcion, romance, etc.).
- Roleplaying y conversacion multi-turno orientada a personajes.
- Redaccion de prosa "vivida" (vivid prosing) segun la propia model card.
- Modelo "uncensored"/"abliterated": reduce los rechazos de contenido, lo que amplia el rango de tematicas narrativas tratables.
- Soporte conversacional basico (tag "conversational").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Generacion de ficcion interactiva: el modelo puede continuar escenas y mantener coherencia narrativa en conversaciones multi-turno, lo que lo hace adecuado para motores de historias interactivas o novelas visuales donde el usuario toma decisiones.
- Roleplaying con personajes: gracias a su orientacion conversacional y a la reduccion de rechazos, puede encarnar personajes con personalidades definidas en juegos de rol por texto o chatbots de entretenimiento.
- Asistencia a escritores: generacion de borradores de tramas, subtramas y dialogos en fases de ideacion, aprovechando su especializacion en plot generation y sub-plot generation.
- Continuacion de manuscritos: dado un fragmento de texto, el modelo puede proponer continuaciones coherentes con el tono y el estilo, util para autores que sufren bloqueos creativos.
- Localizacion creativa y adaptacion de guiones: su soporte de ingles y chino permite adaptar narrativas entre ambos idiomas manteniendo el registro literario.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (5,7 GB) puede ejecutarse en GPUs de consumo para prototipado rapido de aplicaciones narrativas sin coste de API.
- Generacion de contenido para videojuegos: dialogos procedurales, descripciones de objetos y misiones secundarias en juegos con narrativa generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF y overhead de contexto):
  - Q2_K: unos 4-5 GB.
  - Q4_K_M: unos 6-7 GB.
  - Q6_K: unos 8-9 GB.
  - Q8_0: unos 10-11 GB.
  - f16: unos 18-20 GB.
- GPU recomendadas:
  - RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M con contexto moderado.
  - RTX 4090 24 GB para Q8_0 o f16 con contexto amplio.
  - A100 40/80 GB y H100 para despliegues de alta concurrencia o f16 con contextos largos.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas para cuantizaciones Q4, y en 12-16 GB para Q6/Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, KoboldCpp). Para el modelo base en safetensors, transformers con aceleracion CUDA; vLLM y TGI no estan confirmados para esta variante GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS9-USS-Defiant-GGUF (este) | 8,95B | no disponible | Apache 2.0 | GGUF | Fine-tune creativo, uncensored, en/zh |
| Qwen3.5-9B base | aproximadamente 9B | no disponible | no disponible | safetensors | Modelo original sin fine-tune creativo |
| nightmedia/Qwen3.5-9B-DS9-USS-Defiant | 8,95B | no disponible | Apache 2.0 | safetensors (bfloat16) | Version sin cuantizar del mismo modelo |
| mradermacher/Qwen3.5-9B-DS9-USS-Defiant-i1-GGUF | 8,95B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizacion ponderada de mayor calidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con otras alternativas.

## Limitaciones y advertencias

- Al ser un modelo "abliterated"/"uncensored", puede generar contenido sensible, ofensivo o inapropiado; no es adecuado para aplicaciones dirigidas al publico general sin filtros adicionales.
- Riesgo de alucinacion inherente a los LLM de 9B, especialmente en tareas factuales; su especializacion es creativa, no de precision.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado; ademas, el contenido generado puede estar sujeto a las condiciones de la plataforma de despliegue.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia narrativa; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad.
- El repo tiene 81,4 GB, por lo que la descarga completa de todas las cuantizaciones es costosa en ancho de banda.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-DS9-USS-Defiant
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/Qwen3.5-9B-DS9-USS-Defiant-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-DS9-USS-Defiant-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
