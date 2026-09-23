# CollectionStudio/Mistral-Small-3.1-24B-Base-2503

## Resumen

Mistral Small 3.1 24B Base (2503) es un modelo de lenguaje multimodal desarrollado por Mistral AI y redistribuido en este repositorio por el usuario CollectionStudio. Cuenta con 24.011.361.280 parámetros (unos 24B) y se publica bajo licencia Apache 2.0. Se trata de la versión base —sin ajuste por instrucciones— del modelo Mistral-Small-3.1-24B-Instruct-2503, por lo que está pensada como punto de partida para ajuste fino y experimentación, no para uso conversacional directo.

Su principal novedad frente a Mistral Small 3 (2501) es la incorporación de capacidades de visión y la ampliación de la ventana de contexto hasta 128.000 tokens sin degradar el rendimiento en tareas de texto. El modelo emplea un tokenizador Tekken con un vocabulario de 131.000 tokens y declara soporte para más de veinte idiomas, además del inglés.

Es relevante ahora porque ofrece capacidades multimodales de gama media-alta (competitivas con Gemma 3 27B PT en las evaluaciones publicadas) bajo una licencia permisiva que permite uso comercial y modificación, con un tamaño que puede desplegarse en hardware de gama alta o en configuraciones multi-GPU consumer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal texto-imagen (etiqueta de repositorio `mistral3`); detalle de capas y configuración de atención no disponible |
| Parametros totales | 24.011.361.280 (~24B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales en la informacion proporcionada; el repositorio solo contiene pesos safetensors |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano, japones, coreano, ruso, chino, arabe, persa (farsi), indonesio, malayo, nepalí, polaco, rumano, serbio, sueco, turco, ucraniano, vietnamita, hindi y bengalí (24 idiomas en las etiquetas del repositorio; la model card menciona ademas el griego, que no aparece en las etiquetas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos conjuntos: formato original recomendado para vLLM y pesos compatibles con Transformers); tamano del repositorio 96,1 GB |
| Tokenizador | Tekken, vocabulario de 131.000 tokens |
| Biblioteca de inferencia declarada | vLLM |

## Arquitectura y entrenamiento

La informacion proporcionada identifica el modelo con la arquitectura `mistral3` y lo describe como un modelo multimodal capaz de procesar texto e imagenes, con una ventana de contexto de 128.000 tokens. No se detallan en la model card el numero de capas, la configuracion de atencion (por ejemplo, si usa GQA), la dimension oculta ni el mecanismo concreto de proyeccion de las imagenes al espacio de tokens. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras tecnicas de eficiencia.

En cuanto a los datos de entrenamiento, la model card no publica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o similar. Al ser un checkpoint unicamente preentrenado (pretrained-only), no incorpora alineacion por instrucciones; la propia documentacion indica que no esta listo para funcionar como modelo de instrucciones sin un ajuste posterior.

La innovacion tecnica destacada por el autor es doble: la incorporacion de comprension de vision manteniendo el rendimiento en texto, y la extension de contexto hasta 128k tokens. El modelo se evalua con el arnes de evaluacion propio de Mistral AI cuando no existen numeros publicados por terceros. La inferencia de referencia se realiza con vLLM >= 0.8.1 y mistral-common >= 1.5.4; la implementacion en Transformers se distribuye pero, segun la model card, no fue probada en profundidad ("vibe-checks").

## Capacidades

- Generacion de texto en modo continuacion (completion), ya que es un modelo base.
- Comprension de imagenes: analisis de contenido visual y generacion de texto asociado (por ejemplo, descripcion de escenas, lectura de contexto visual).
- Razonamiento y conocimiento general evaluado en MMLU, MMLU Pro y GPQA.
- Capacidades multilingues en los 24 idiomas declarados en las etiquetas del repositorio.
- Procesamiento de contexto largo de hasta 128.000 tokens.
- Capacidad de servir como base para ajuste fino supervisado orientado a crear modelos de instrucciones.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, uso de agentes ni modos de razonamiento extendido (thinking mode), algo esperable en un checkpoint base sin alineacion.

## Casos de uso

- Ajuste fino supervisado para dominios verticales: al ser un modelo base Apache 2.0 de 24B, se puede aplicar SFT sobre datos propios (legal, sanitario, financiero) para obtener un asistente especializado sin depender de pesos cerrados.
- Generacion de datos sinteticos y etiquetado: el modelo puede producir descripciones de imagenes y continuaciones de texto a escala para construir datasets de entrenamiento o anotaciones preliminares que luego se revisan.
- Investigacion en vision-lenguaje: sirve como punto de comparacion reproducible frente a otros modelos multimodales de tamano similar en tareas de MMMU o descripcion de imagenes.
- Entrenamiento continuado sobre corpus corporativos: la ventana de 128k permite ingerir documentos largos completos durante el preentrenamiento o el ajuste continuado, sin truncar contratos, informes o articulos extensos.
- Extraccion de conocimiento y analisis de imagenes tecnicas tras ajuste: por ejemplo, interpretacion de diagramas, capturas o planos, siempre que se adapte previamente con datos del dominio.
- Base para destilacion o para modelos derivados mas pequenos: se puede usar como profesor en procesos de destilacion hacia modelos de menor tamano en una organizacion.
- Construccion de clasificadores o puntuadores mediante cabezas adicionales: el checkpoint base es adecuado para anadir capas de clasificacion o scoring sobre las representaciones internas.
- Evaluacion interna de infraestructura de inferencia multimodal: sirve para validar despliegues con vLLM y pipelines de imagen y texto antes de adoptar la version Instruct en produccion.

## Benchmarks y rendimiento

Datos de evaluacion de preentrenamiento publicados en la model card:

| Modelo | MMLU (5-shot) | MMLU Pro (5-shot CoT) | TriviaQA | GPQA Main (5-shot CoT) | MMMU |
|---|---|---|---|---|---|
| Mistral Small 3.1 24B Base | 81,01% | 56,03% | 80,50% | 37,50% | 59,27% |
| Gemma 3 27B PT | 78,60% | 52,20% | 81,30% | 24,30% | 56,10% |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MATH ni otros benchmarks adicionales.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (24B), no cifras oficiales:

| Precision | Peso de los pesos | VRAM estimada (contexto corto) | GPU objetivo |
|---|---|---|---|
| BF16 / FP16 | ~48 GB | ~55-70 GB | 1x H100 80 GB, 1x A100 80 GB, 2x A100 40 GB, 2x RTX 4090 24 GB con tensor parallel |
| FP8 / INT8 (si existe conversion) | ~24 GB | ~30-40 GB | L40S 48 GB, RTX A6000 48 GB; RTX 4090 24 GB muy justo |
| INT4 (si existe conversion) | ~12-13 GB | ~16-24 GB | RTX 4090, RTX 3090 24 GB, RTX 4080 16 GB con margen escaso |

- El repositorio ocupa 96,1 GB porque incluye dos conjuntos de pesos safetensors (formato original y formato compatible con Transformers), no porque el modelo requiera el doble de memoria en inferencia.
- El KV cache con contexto de 128.000 tokens puede ser muy elevado; la model card no publica la configuracion de atencion, por lo que no se puede calcular con precision.
- Cabe en GPU consumer (RTX 4090, 3090) solo mediante cuantizacion de 4 bits o con dos GPU en paralelo si se usa BF16.
- Opciones de despliegue documentadas: vLLM >= 0.8.1 con mistral-common >= 1.5.4 (recomendado), imagen Docker oficial de vLLM y Transformers (soporte no probado a fondo segun el autor).
- No se documenta en la informacion proporcionada soporte oficial para llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | MMLU Pro | MMMU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Mistral Small 3.1 24B Base | 24B | 128k | 81,01% | 56,03% | 59,27% | Apache 2.0 | HuggingFace (repositorio original de Mistral AI y esta copia de CollectionStudio) |
| Gemma 3 27B PT | 27B | No disponible en la informacion | 78,60% | 52,20% | 56,10% | No disponible en la informacion | HuggingFace |
| Mistral Small 3 (2501) | No disponible en la informacion | No disponible en la informacion | No disponible | No disponible | No aplica (solo texto) | No disponible en la informacion | HuggingFace |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B (misma base) | 128k | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Apache 2.0 (segun el repositorio original) | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint unicamente preentrenado: no sigue instrucciones de forma fiable y no debe usarse directamente como asistente en produccion; para ello hay que usar la version Instruct o realizar un ajuste fino propio.
- No se documenta ningun proceso de alineacion, RLHF o DPO, por lo que no hay garantias de comportamiento seguro ni de rechazo de peticiones daninas.
- Riesgo de alucinacion inherente a un modelo de lenguaje de 24B sin alineacion; los datos generados deben verificarse.
- La model card no detalla sesgos conocidos, composicion del dataset ni medidas de mitigacion, lo que dificulta evaluar riesgos de sesgo.
- Cobertura multilingue declarada en 24 idiomas mediante etiquetas, pero no se publican evaluaciones por idioma; el rendimiento fuera del ingles no esta cuantificado.
- Discrepancia menor entre la model card (que menciona el griego) y las etiquetas del repositorio (que no lo incluyen).
- Licencia Apache 2.0, permisiva para uso comercial y modificacion, pero la model card original de Mistral AI incluye un aviso de gating y una politica de privacidad asociada a la descarga desde el repositorio oficial; conviene revisar las condiciones aplicables.
- Este repositorio concreto es una redistribucion de terceros (CollectionStudio) con 0 descargas y 0 likes en el momento de la consulta; se recomienda verificar la integridad de los pesos o usar el repositorio oficial de Mistral AI.
- Los metadatos del repositorio indican `inference: false`, por lo que el widget de inferencia de HuggingFace no esta operativo.
- No se documentan cuantizaciones oficiales ni soporte GGUF, lo que limita el despliegue en hardware de gama baja sin conversiones de terceros.

## Enlaces

- Repositorio en HuggingFace (copia de CollectionStudio): https://huggingface.co/CollectionStudio/Mistral-Small-3.1-24B-Base-2503
- Repositorio oficial del modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Version Instruct: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Blog de Mistral AI sobre Mistral Small 3.1: https://mistral.ai/news/mistral-small-3-1/
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Release de vLLM 0.8.1: https://github.com/vllm-project/vllm/releases/tag/v0.8.1
- Repositorio mistral-common: https://github.com/mistralai/mistral-common
- Release de mistral-common 1.5.4: https://github.com/mistralai/mistral-common/releases/tag/v1.5.4
- Dockerfile de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
- Imagen Docker de vLLM en Docker Hub: https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
