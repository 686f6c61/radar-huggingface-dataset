# mradermacher/Spark-X2.6-4B-heretic-i1-GGUF

## Resumen

Spark-X2.6-4B-heretic-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo daydreamwarrior/Spark-X2.6-4B-heretic, publicado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es una versión de 4.112 millones de parámetros etiquetada como "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se trata de una variante a la que se le han eliminado o reducido los mecanismos de alineación y rechazo de contenido típicos de los modelos de chat convencionales.

La relevancia de este repositorio no está en el modelo en sí, sino en la calidad del proceso de cuantización: mradermacher ofrece cuantizaciones ponderadas con imatrix (importance matrix), que preservan mejor la calidad que las cuantizaciones estáticas a tamaños equivalentes. Esto permite ejecutar un modelo de ~4B parámetros en hardware modesto, desde portátiles con GPU integrada hasta GPUs de consumo, con un rango de tamaños que va desde 1,3 GB (IQ1_S) hasta 3,5 GB (Q6_K).

El modelo soporta inglés y chino, se distribuye bajo licencia Apache 2.0 y es compatible con llama.cpp, Ollama y cualquier runtime que soporte GGUF. Es una opción interesante para quienes buscan un modelo pequeño, sin restricciones de alineación, para experimentación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sparkx2_5 (transformer, detalles no disponibles) |
| Parametros totales | 4.112.079.360 (~4,11B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, IQ4_XS, Q3_K_L, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix/ponderadas) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors originales) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base; el tag `sparkx2_5` sugiere que pertenece a la familia de arquitecturas "Spark X2.5", pero no hay detalles publicados sobre numero de capas, dimensiones ocultas, mecanismos de atencion o vocabulario. Los pesos originales en safetensors suman 4.112.079.360 parametros.

Sobre el entrenamiento del modelo base no hay informacion disponible: se desconocen el numero de tokens, la composicion del dataset y si se aplicaron tecnicas como SFT, RLHF o DPO. El etiquetado "abliterated" y "decensored" indica que el modelo base deriva de otro modelo al que se le han modificado los pesos o el comportamiento para eliminar los rechazos de seguridad, un proceso que tipicamente se realiza mediante tecnicas de abliteration (identificar y neutralizar las direcciones de activacion asociadas al rechazo) o fine-tuning sobre datos sin filtrar.

En cuanto a la cuantizacion, mradermacher utiliza cuantizaciones imatrix (importance matrix): se calcula una matriz de importancia a partir de un conjunto de calibracion y se usa para asignar mas precision a los tensores mas relevantes. Esto permite que variantes muy comprimidas (IQ2, IQ3) mantengan una calidad notablemente superior a las cuantizaciones estaticas equivalentes, como muestra el grafico de perplexidad referenciado en la model card.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Comportamiento "uncensored": responde sin los rechazos de seguridad habituales de los modelos alineados, lo que lo hace adecuado para experimentacion pero exige supervision del usuario.
- Soporte de ingles y chino.
- Ejecucion local en CPU o GPU mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, etc.).
- Inclusion de un fichero imatrix (0,1 GB) para que los usuarios generen sus propias cuantizaciones personalizadas.
- No hay informacion disponible sobre soporte de vision, audio, tool calling, function calling ni capacidades de agente.

## Casos de uso

- Experimentacion con modelos abliterated en local: al ser un modelo de ~4B con cuantizaciones desde 1,3 GB, cabe en portatiles y mini-PCs, ideal para investigar el efecto de la abliteration sobre el comportamiento del modelo.
- Prototipado de aplicaciones sin filtros de contenido: permite probar prompts y flujos de trabajo sin que el modelo rechace consultas por politicas de alineacion, util en investigacion de seguridad y red-teaming.
- Uso en hardware de gama baja: la variante IQ2_M (1,7 GB) o Q3_K_M (2,3 GB) permite inferencia en CPUs modestas o GPUs con 2-4 GB de VRAM.
- Generacion de texto creativo sin restricciones: escritura de ficcion o roleplay donde el usuario quiere control total sobre el contenido generado.
- Procesamiento bilingue ingles-chino en dispositivos edge: la combinacion de tamano reducido y soporte de chino lo hace viable para aplicaciones embebidas o moviles (via llama.cpp en ARM).
- Creacion de cuantizaciones propias: el fichero imatrix incluido permite a desarrolladores generar variantes personalizadas ajustadas a su hardware y caso de uso.
- Integracion en pipelines locales con Ollama o llama.cpp: automatizacion de tareas de texto en entornos sin conexion y sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico comparativo de perplexidad entre tipos de cuantizacion de baja calidad (referencia generica de ikawrakow), sin metricas del modelo base (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: depende de la cuantizacion elegida, desde ~1,3 GB (IQ1_S) hasta ~3,5 GB (Q6_K), mas la memoria del contexto (KV cache). Con 4 GB de VRAM o RAM caben todas las variantes con contexto moderado.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3060, RTX 4060, RTX 4090 con sobra). En CPU, cualquier procesador moderno con 8 GB de RAM.
- Cabe comodamente en GPUs de consumo de gama baja e incluso en solo-CPU; es un modelo pensado para hardware modesto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es un despliegue tipico de vLLM o TGI (orientados a safetensors, aunque existan puentes de compatibilidad).
- Latencia y throughput: no disponibles; en un modelo de 4B cuantizado a Q4, los runtimes GGUF suelen alcanzar decenas de tokens por segundo en CPU moderna y mas de 100 tokens/s en GPU de consumo, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-heretic-i1-GGUF | 4,11B | GGUF (imatrix) | Apache 2.0 | en, zh | Variante abliterated/uncensored; cuantizaciones de 1,3 a 3,5 GB |
| Qwen2.5-3B-Instruct-GGUF (Q4_K_M) | 3,09B | GGUF | Qwen (uso comercial permitido con condiciones) | multilingue (29+) | Modelo alineado, mayor soporte de idiomas y ecosistema |
| Phi-3.5-mini-instruct (3,8B) | 3,82B | safetensors / GGUF comunitario | MIT | multilingue | Fuerte en razonamiento, alineado, contexto largo documentado |

No hay datos de benchmarks que permitan comparar rendimiento numerico entre ellos. La diferencia clave de Spark-X2.6-4B-heretic frente a estas alternativas es su naturaleza uncensored y la disponibilidad inmediata de cuantizaciones imatrix de alta calidad.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: elimina los rechazos de seguridad. Esto implica riesgo elevado de generar contenido nocivo, ilegal o sesgado; su uso es responsabilidad exclusiva del usuario y no debe desplegarse en produccion sin controles externos.
- La abliteration suele degradar la calidad general del modelo (coherencia, razonamiento) respecto al modelo original del que deriva; no se ha documentado el impacto en este caso.
- No hay documentacion de la model card sobre arquitectura, contexto, datos de entrenamiento ni benchmarks: la evaluacion previa al uso es imprescindible.
- Soporte limitado a ingles y chino; no hay garantias de rendimiento en castellano.
- Las cuantizaciones IQ1_S/IQ1_M y Q2 tienen perdida de calidad significativa (el propio autor las marca como "for the desperate" y "very low quality").
- Licencia Apache 2.0: permite uso comercial, pero el comportamiento del modelo (contenido sin filtrar) puede incumplir las condiciones de servicio de plataformas de despliegue o la legislacion aplicable.
- Riesgo de alucinacion tipico de modelos pequenos de 4B, agravado por la falta de informacion sobre el proceso de fine-tuning.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/daydreamwarrior/Spark-X2.6-4B-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Spark-X2.6-4B-heretic-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
