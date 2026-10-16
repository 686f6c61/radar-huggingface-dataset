# mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF`, una cuantizacion en formato GGUF generada por mradermacher a partir del modelo `AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM`. No es un modelo entrenado desde cero: se trata de una version "abliterated" o decensored de un modelo base de la familia Qwen 3.5 de aproximadamente 2.000 millones de parametros, es decir, con los mecanismos de rechazo eliminados o atenuados mediante tecnicas de ablacion de direcciones en el espacio de activaciones. El resultado esta orientado a generacion creativa, roleplay y escritura sin filtros, incluyendo contenido etiquetado como R18 en la propia model card.

El repositorio pertenece a la coleccion de cuantizaciones "i1" de mradermacher, que combinan cuantizacion con matriz de importancia (imatrix) para reducir la perdida de calidad en tipos de cuantizacion agresivos. La model card lista un catalogo amplio de tipos (desde IQ1_S e IQ2_XXS hasta Q6_K), aunque en el momento de redactar esta ficha el unico fichero publicado en el repositorio `i1` es la propia matriz de importancia (`.imatrix.gguf`, 0,1 GB), mientras que las cuantizaciones estaticas se anuncian en un repositorio separado.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo multimodal (la model card indica explicitamente que es un modelo de vision, con ficheros `mmproj` alojados en el repositorio estatico) en hardware de consumo. Por otro, forma parte del ecosistema de variantes sin censura, un nicho con demanda constante para escritura, simulacion de personajes y experimentacion con prompts que los modelos alineados rechazan. Conviene senalar que el repositorio tenia 0 descargas y 0 "likes" en el momento de la consulta, y que los resultados de busqueda web devueltos no contienen informacion tecnica util sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen 3.5; no se detalla la arquitectura concreta en la informacion proporcionada) |
| Parametros totales | aproximadamente 2.000 millones segun el nombre del modelo; el campo de parametros de safetensors del repositorio indica 960,882, un valor que no permite confirmar la cifra |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (catalogo declarado en la model card) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen/Qwen3.5-2B) |
| Formato de pesos | GGUF (cuantizacion i1 con imatrix); el repositorio incluye de momento el fichero `.imatrix.gguf` de 0,1 GB |
| Modalidad | texto e imagen (modelo de vision; ficheros `mmproj` en el repositorio de cuantizaciones estaticas) |
| Modelo base | AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM |
| Cuantizado por | mradermacher |
| Fecha de creacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico verificable es que se trata de una variante derivada de la familia Qwen 3.5, de tamano aproximado 2B, y que ha sido sometida a un proceso de "abliteracion" o decensurado (etiquetas `abliterated`, `decensored`, `uncensored`, `heretic`, `abliterix`). Estos procedimientos consisten habitualmente en identificar y proyectar fuera las direcciones de activacion asociadas al rechazo de peticiones, sin reentrenamiento completo, lo que produce un modelo con el mismo conocimiento base pero sin la capa de alineacion de seguridad. No se especifica que metodo concreto (abliteracion por direccion, LoRA de ortogonalizacion u otro) se ha aplicado bajo las etiquetas `SOM` y `Abliterix`.

En cuanto al proceso de cuantizacion, si esta documentado en terminos generales: mradermacher ha generado cuantizaciones ponderadas con imatrix (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), usando como entrada el modelo en formato Hugging Face. La model card indica que el repositorio estatico correspondiente contiene las cuantizaciones fijas y, en su caso, los ficheros `mmproj` necesarios para la parte de vision. No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si hubo fases de RLHF, DPO u otra optimizacion por preferencias.

## Capacidades

- Generacion de texto en ingles y chino, con registro orientado a escritura creativa y narrativa.
- Roleplay y simulacion de personajes: el modelo esta explicitamente etiquetado para `roleplay`, `rp` y `writing`, lo que sugiere un comportamiento afinado o al menos desbloqueado para dialogos largos en personaje.
- Generacion de contenido sin filtros: las etiquetas `uncensored`, `decensored` y `abliterated` indican que los mecanismos de rechazo han sido atenuados o eliminados.
- Vision: la model card declara que es un modelo de vision, con ficheros `mmproj` disponibles en el repositorio estatico, lo que habilita entrada de imagenes en runtime compatibles con llama.cpp.
- Soporte de agentes y chat: entre las etiquetas figuran `agent` y `chat`.
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte para castellano ni otros idiomas.
- No se documenta soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo puede generar ficcion, relatos y dialogos sin las restricciones habituales de los modelos alineados, lo que lo hace util para autores que trabajan con tematicas adultas o violentas que otros modelos rechazan.
- Roleplay y acompanamiento conversacional: gracias a su orientacion explicita a `rp`, encaja en aplicaciones de personajes virtuales, bots de rol por texto y simulaciones interactivas donde la coherencia de personaje a lo largo de muchos turnos es el criterio principal.
- Prototipado local en hardware de consumo: al ser un modelo de ~2B en GGUF, se puede ejecutar en portatiles y equipos sin GPU dedicada, lo que permite experimentar con pipelines de generacion de texto sin coste de API.
- Clasificacion y generacion de texto en chino e ingles: para tareas de procesamiento de lenguaje en estos dos idiomas, como resumen, reescritura o extraccion de informacion, el modelo ofrece una alternativa autoalojada y ligera.
- Analisis de imagenes sencillo: en configuraciones con el fichero `mmproj` cargado, puede emplearse para descripcion de imagenes, extraccion de texto visible o respuestas a preguntas sobre una imagen en aplicaciones de accesibilidad o indexado de contenido.
- Investigacion sobre alineacion y seguridad: la variante es un objeto de estudio util para medir como cambia el comportamiento de un modelo al eliminar sus capas de rechazo, comparando respuestas frente al modelo base alineado.
- Filtrado y preprocesado en pipelines offline: por su tamano reducido, puede integrarse en procesos por lotes que generen o reformulen texto en grandes volumenes sin depender de servicios externos.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y en formato GGUF o safetensors (via el modelo base), es candidato razonable como punto de partida para ajustes especificos de dominio en una unica GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web devueltos no contienen datos tecnicos sobre este modelo. Tampoco se dispone de comparaciones con el modelo base sin ablacionar, por lo que no es posible cuantificar el impacto del proceso de decensurado sobre las capacidades generales.

## Requisitos de hardware

Estimaciones basadas en un modelo de aproximadamente 2.000 millones de parametros; no proceden de mediciones publicadas por el autor.

| Cuantizacion | Tamano aproximado en disco | VRAM estimada para inferencia |
|---|---|---|
| IQ1_S / IQ2_XXS | 0,4-0,6 GB | menos de 1 GB |
| Q2_K / IQ2_M | 0,8-1,0 GB | 1-1,5 GB |
| Q3_K_M / IQ3_S | 1,1-1,3 GB | 1,5-2 GB |
| Q4_K_M / IQ4_XS | 1,3-1,6 GB | 2-2,5 GB |
| Q5_K_M | 1,6-1,9 GB | 2,5-3 GB |
| Q6_K | 1,9-2,2 GB | 3-3,5 GB |
| FP16 (referencia) | 4-5 GB | 5-6 GB |

- GPU de consumo: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) y en cuantizaciones bajas puede ejecutarse por completo en CPU con RAM convencional.
- GPU profesionales: no requiere A100 ni H100; estas solo tendrian sentido para servir muchas peticiones concurrentes o para hacer fine-tuning.
- Apple Silicon: ejecutable mediante Metal en llama.cpp u Ollama en equipos con memoria unificada de 8 GB o superior.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los entornos naturales para GGUF; la parte de vision requiere cargar el fichero `mmproj` correspondiente. vLLM soporta GGUF de forma parcial y no es la via recomendada para un modelo de este tamano.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que cualquier comparacion cuantitativa seria especulativa. La tabla siguiente recoge unicamente los aspectos verificables frente a alternativas de la misma categoria (modelos densos de 1B a 3B con licencia permisiva), y marca como no disponible todo lo que no se puede confirmar con la informacion proporcionada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-Abliterix-SOM (i1 GGUF) | ~2B (sin confirmar) | no disponible | en, zh | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3B | no disponible | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 3 1B Instruct | 1B | no disponible | multilingue | Gemma Terms of Use | safetensors, GGUF |

Diferencias cualitativas relevantes: este modelo es el unico de la tabla con orientacion explicita a contenido sin filtrar y con soporte declarado de vision a este tamano, pero tambien es el unico sin resultados de benchmarks publicados y con cero descargas registradas en el momento de la consulta. Las alternativas citadas cuentan con procesos de evaluacion publicos y soporte de tool calling documentado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay ninguna evidencia cuantitativa del impacto del proceso de ablacion sobre el razonamiento, el conocimiento factual o el seguimiento de instrucciones.
- Riesgo elevado de alucinacion: los modelos de ~2B tienen una capacidad limitada de conocimiento factual, y la eliminacion de capas de rechazo no mejora esa limitacion.
- Contenido no filtrado: el modelo puede generar material violento, sexual explicito, discriminatorio o ilegal. Es responsabilidad del desplegador implementar filtros externos si el caso de uso lo requiere.
- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta garantizado y previsiblemente sera bajo.
- Sesgos: al derivar de un modelo entrenado con corpus mayoritariamente en ingles y chino, heredara los sesgos de ese dataset; el proceso de ablacion puede ademas amplificar respuestas estereotipadas al eliminar la capa de moderacion.
- Incertidumbre sobre los parametros: el nombre indica 2B, pero el campo de safetensors del repositorio muestra 960,882, un valor inconsistente que conviene verificar antes de dimensionar despliegues.
- Estado del repositorio: con 0 descargas y 0 "likes", y con solo el fichero de matriz de importancia publicado, no hay evidencia de uso ni de validacion por parte de la comunidad. Las cuantizaciones reales deben descargarse del repositorio estatico enlazado.
- Licencia: el modelo se declara bajo Apache 2.0, pero el enlace de licencia apunta al modelo base de Qwen. Conviene verificar la compatibilidad de la licencia del modelo base con el uso comercial previsto, especialmente si se redistribuye.
- Uso responsable: la combinacion de un modelo sin censura y de vision abre la puerta a usos problematicos (por ejemplo, generacion de contenido sobre personas reales a partir de imagenes). Se recomienda evaluar el cumplimiento normativo en la jurisdiccion de despliegue.
- No se documenta soporte de tool calling ni de agentes multi-paso mas alla de la etiqueta `agent`, por lo que no debe asumirse su funcionamiento en pipelines que dependan de ello.

## Enlaces

- Repositorio GGUF i1 (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye ficheros `mmproj` de vision): https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-GGUF
- Modelo base: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM
- Pagina de vista general y descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Peticiones y preguntas frecuentes sobre cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que da soporte al autor: https://www.nethype.de/
