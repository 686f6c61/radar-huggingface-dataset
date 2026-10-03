# Rajeshwari-Chanda/bloom-560m_wanda_0.8

## Resumen

Rajeshwari-Chanda/bloom-560m_wanda_0.8 es un checkpoint derivado de BLOOM-560m, el modelo decoder-only de 559.214.592 parametros publicado por el proyecto BigScience en 2022. El nombre del repositorio indica que se ha aplicado poda Wanda (Pruning by Weights and Activations) con una tasa de sparsidad del 0,8, es decir, un 80 % de los pesos anulados. El recuento de parametros del archivo safetensors coincide con el del modelo denso original (559.214.592), lo que apunta a una poda no estructurada: los pesos se ponen a cero pero la forma de los tensores no cambia y el modelo sigue ocupando el mismo numero de parametros.

El modelo base BLOOM-560m es un transformer decoder-only con sesgos posicionales ALiBi, 24 capas, dimension oculta de 1024 y 16 cabezas de atencion, con un vocabulario de 250.880 tokens y una ventana de contexto de 2048 tokens. Fue entrenado sobre el corpus ROOTS y publicado bajo la licencia bigscience-bloom-rail-1.0. El repositorio que nos ocupa no declara licencia, idiomas ni detalles de entrenamiento: su model card es la plantilla automatica de transformers sin rellenar.

La relevancia de este checkpoint es acotada y fundamentalmente experimental. Con cero descargas y cero likes, y sin resultados de evaluacion publicados, se trata de un artefacto de investigacion util para estudiar el efecto de la poda agresiva sobre un modelo multilingue pequeno, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM) con sesgos posicionales ALiBi; variante podada del modelo base BLOOM-560m |
| Parametros totales | 559.214.592 (~559 M), segun los pesos safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2048 tokens en el modelo base BLOOM-560m; no declarada en el repositorio |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; el tamano del repo (1,1 GB) es coherente con pesos almacenados en 16 bits |
| Idiomas soportados | No declarados en el repositorio. El modelo base BLOOM-560m cubre 46 lenguas naturales y 13 lenguajes de programacion |
| Licencia | No declarada en el repositorio. El modelo base se distribuye bajo bigscience-bloom-rail-1.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-560m: un transformer decoder-only con normalizacion previa a la atencion y a la MLP, activaciones GeLU, 24 capas, 1024 dimensiones de modelo, 16 cabezas de atencion (64 dimensiones por cabeza) y tokenizador byte-level BPE con 250.880 entradas. La caracteristica diferencial de la familia BLOOM frente a otros transformers de la misma epoca es el uso de ALiBi en lugar de embeddings posicionales aprendidos, lo que permite extrapolar posiciones mas alla de la ventana de entrenamiento aunque el modelo se publique con 2048 tokens de contexto.

Sobre el proceso de entrenamiento de este checkpoint concreto no hay informacion alguna: la model card es una plantilla autogenerada con todos los campos marcados como "[More Information Needed]". No se documentan tokens de entrenamiento, composicion del dataset, hiperparametros, ni si hubo una fase de ajuste con RLHF o DPO (BLOOM-560m es un modelo base, sin alineamiento por instrucciones). Tampoco se publica la mascara de poda, el criterio de calibracion ni el conjunto de datos usado para calcular las importancias de Wanda, que son precisamente los detalles que permitirian reproducir el resultado. El unico tag tipo paper del repositorio, arxiv:1910.09700, corresponde a Lacoste et al. (2019) sobre emisiones de carbono y procede de la plantilla automatica de la model card, no de un articulo sobre poda.

## Capacidades

- Generacion de texto autoregresiva sin ajuste por instrucciones: es un modelo base, no un asistente conversacional, por lo que no sigue ordenes ni responde en formato dialogo.
- Capacidad multilingue heredada del modelo base (46 lenguas naturales), aunque degradada de forma no cuantificada por la poda al 80 %.
- Generacion de codigo en los 13 lenguajes de programacion presentes en el corpus de BLOOM, con calidad esperablemente baja en un modelo de 559 M de parametros.
- Razonamiento basico y completado de textos cortos dentro de la ventana de 2048 tokens.
- No hay evidencia de soporte de tool calling ni function calling: no se ha realizado ajuste supervisado para ello.
- No hay soporte de agentes, razonamiento multi-paso guiado ni modo de pensamiento explicito.
- No dispone de capacidades de vision, audio ni multimodalidad.
- No se documenta plantilla de chat ni tokenizacion especial para turnos.

## Casos de uso

- Investigacion sobre poda de redes neuronales: comparar perplexidad, exactitud en tareas zero-shot y calidad de generacion entre este checkpoint y BLOOM-560m denso, y entre las variantes wanda_0.8 y wanda_0.9, para medir la curva de degradacion con la sparsidad.
- Reproduccion de experimentos de eficiencia: al mantener el mismo numero de parametros que el modelo denso, permite medir si la poda no estructurada aporta aceleracion real en hardware convencional o solo ahorro teorico en operaciones con soporte de sparsidad.
- Prototipado de generacion de texto en local: con pesos en 16 bits ocupa aproximadamente 1,1 GB, por lo que cabe en cualquier portatil con GPU integrada y permite validar pipelines de generacion sin depender de servicios externos.
- Inferencia en CPU o dispositivos de borde: con cuantizacion a 8 bits el modelo baja de 0,6 GB de pesos, lo que lo hace viable en placas tipo Raspberry Pi 4 o mini-PC, siempre que se acepte una latencia alta y una calidad reducida.
- Fine-tuning ligero con LoRA para tareas acotadas: al ser un backbone pequeno, se puede adaptar con adaptadores a clasificacion de texto, etiquetado o generacion de dominio especifico en una unica GPU de gama media.
- Estudio de sesgos multilingues: el modelo conserva el vocabulario y parte de las representaciones multilingues de BLOOM, lo que permite analizar como la poda afecta de forma desigual a lenguas con menos representacion en el corpus.
- Docencia y practicas de ingenieria de modelos: sirve como ejemplo reproducible de publicacion de un checkpoint derivado en Hugging Face, con todos los problemas tipicos de una model card sin documentar.
- Baseline en estudios de coste energetico: su tamano reducido permite estimaciones de consumo completas en pocas horas de GPU, usando la metodologia del articulo de Lacoste et al. referenciado en la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada. El repositorio no incluye ninguna tabla de evaluacion, y la model card deja la seccion "Results" como "[More Information Needed]". Tampoco hay resultados de perplexidad que permitan cuantificar el dano causado por la poda al 80 %, un dato critico porque en modelos de menos de 1000 millones de parametros este nivel de sparsidad suele producir degradaciones severas.

## Requisitos de hardware

- VRAM para pesos en fp32: aproximadamente 2,24 GB (559 M de parametros a 4 bytes).
- VRAM para pesos en fp16 o bf16: aproximadamente 1,12 GB, coherente con el tamano del repositorio (1,1 GB).
- VRAM para pesos en int8: aproximadamente 0,56 GB. Para int4: aproximadamente 0,28 GB, aunque no se publica ningun archivo cuantizado en el repositorio.
- Cache KV en fp16 con contexto completo de 2048 tokens: unos 192 MiB (2 x 24 capas x 16 cabezas x 64 dimensiones x 2048 posiciones x 2 bytes), por lo que el consumo total con contexto lleno se mantiene por debajo de 1,5 GB en fp16.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o GPUs integradas recientes. Tambien es viable en CPU con 4 GB de RAM libre.
- Una fuente externa (localllms.dev) indica un minimo de 1,8 GB de VRAM para ejecucion en cuantizacion Q4, cifra conservadora que probablemente incluye el runtime y la cache de contexto.
- Opciones de despliegue: transformers (formato nativo del repositorio), text generation inference (el repositorio esta etiquetado como text-generation-inference y endpoints_compatible) y, con verificacion previa, vLLM. No hay archivos GGUF publicados, por lo que llama.cpp y Ollama requeririan convertir los pesos y no estan soportados de fabrica.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Notas |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_wanda_0.8 | 559 M (80 % de pesos anulados segun el nombre) | 2048 tokens (heredado) | No declarada en el repositorio | safetensors | Sin benchmarks, 0 descargas, model card vacia |
| Rajeshwari-Chanda/bloom-560m_wanda_0.9 | Dato no publicado en la informacion disponible | 2048 tokens (heredado) | No declarada en el repositorio | safetensors | Variante con sparsidad del 90 %, presumiblemente mas degradada |
| bigscience/bloom-560m | 559 M | 2048 tokens | bigscience-bloom-rail-1.0 | safetensors | Modelo denso de referencia, multilingue, con model card completa |
| bigscience/bloom-1b1 | 1100 M | 2048 tokens | bigscience-bloom-rail-1.0 | safetensors | Alternativa de la misma familia con el doble de parametros y mejor calidad esperada |

## Limitaciones y advertencias

- Licencia sin declarar: el repositorio no especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido o si el autor ha relicenciado el modelo derivado. En ausencia de indicacion contraria, se hereda la bigscience-bloom-rail-1.0 del modelo base, que impone restricciones de uso, exige atribucion y prohibe determinadas finalidades. Cualquier despliegue en produccion requiere revision legal previa.
- Degradacion no cuantificada por la poda: no se publican metricas que indiquen cuanto ha perdido el modelo respecto al denso. Una sparsidad del 80 % en un modelo de 559 M de parametros es muy agresiva y puede reducir la coherencia del texto generado de forma notable.
- Riesgo de alucinacion elevado: es un modelo base de 559 M de parametros, sin alineamiento, sin verificacion factual y entrenado sobre un corpus web de 2022. Generara afirmaciones falsas con fluidez y sin advertirlo.
- Sesgos conocidos del corpus ROOTS: infrarrepresentacion de lenguas distintas del ingles y del frances, sesgos de genero, raza y religion documentados en la familia BLOOM. La poda puede amplificarlos de forma desigual por idioma, sin que exista evaluacion disponible.
- Sin plantilla de chat ni ajuste por instrucciones: no debe usarse como asistente conversacional ni integrarse en interfaces de dialogo sin un fine-tuning adicional.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas de resumen de documentos largos o analisis de repositorios completos.
- Ausencia total de documentacion: no se conocen los datos de calibracion de la poda, la mascara aplicada ni las herramientas utilizadas, lo que impide reproducir el resultado y auditar el modelo.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existe evidencia de que terceros hayan verificado su funcionamiento.
- Fecha de creacion registrada como 2026-10-03, posterior a la fecha tipica de publicacion de la familia BLOOM, lo que sugiere un artefacto subido con fines de prueba o un error en los metadatos.
- Sin soporte de cuantizacion publicada: la ausencia de GGUF limita el despliegue en entornos de CPU y en herramientas como llama.cpp u Ollama sin trabajo de conversion adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.8
- Variante con sparsidad 0.9 del mismo autor: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9
- Perfil del autor en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo base denso: https://huggingface.co/bigscience/bloom-560m
- Licencia del modelo base (BLOOM RAIL 1.0): https://huggingface.co/spaces/bigscience/license
- Informacion general sobre BLOOM: https://en.wikipedia.org/wiki/BLOOM_(language_model)
- Ficha de bloom-560m con datos de VRAM y licencia: https://localllms.dev/llm/bigsciencebloom-560m/
- Resumen y alternativas de bloom-560m: https://www.aimodels.fyi/models/huggingFace/bloom-560m-bigscience
- Articulo de Lacoste et al. (2019) sobre emisiones de carbono, referenciado en la model card: https://arxiv.org/abs/1910.09700
- Articulo original de Wanda, metodo de poda al que apunta el nombre del repositorio (referencia externa, no citada por el autor): https://arxiv.org/abs/2306.11695
