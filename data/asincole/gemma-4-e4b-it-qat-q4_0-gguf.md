# asincole/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

`asincole/gemma-4-E4B-it-qat-q4_0-gguf` es una distribucion en formato GGUF de los pesos Q4_0 del modelo Gemma 4 E4B instruction-tuned, publicado por Google DeepMind y reempaquetado por el usuario asincole. Gemma 4 es la cuarta generacion de la familia de modelos abiertos de Google DeepMind, en este caso con entrenamiento consciente de cuantizacion (QAT), una tecnica que busca conservar una calidad cercana a bfloat16 reduciendo de forma notable el requisito de memoria para cargar el modelo.

El modelo base es multimodal (entrada de texto, imagen y audio, con salida de texto) y esta disenado para despliegue en dispositivos: la "E" de E4B significa parametros efectivos, y la variante emplea Per-Layer Embeddings (PLE) para maximizar la eficiencia por parametro en escenarios on-device. La model card de la familia indica 4,5B parametros efectivos (8B contando embeddings), 42 capas, ventana deslizante de 512 tokens y una longitud de contexto de 128.000 tokens, con soporte de mas de 140 idiomas y modos de razonamiento configurables.

Su relevancia es doble: por un lado, acerca capacidades multimodales y de razonamiento a portatiles, moviles y GPUs de consumo; por otro, el pipeline QAT de Google permite obtener checkpoints GGUF listos para desplegar sin necesidad de cuantizar a posteriori. En el momento de redactar esta ficha, el repositorio de asincole acumula 0 descargas y 0 "likes", por lo que conviene tratarlo como un reempaquetado sin validacion comunitaria y preferir, cuando sea posible, el repositorio oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (sliding window local + atencion global completa), Per-Layer Embeddings (PLE), codificador de vision (~150M) y codificador de audio (~300M). Pesos obtenidos mediante Quantization-Aware Training (QAT) |
| Parametros totales | 7.463.013.674 (~7,46B) segun los safetensors del repo; la model card de la familia declara 4,5B efectivos (8B contando embeddings) para E4B |
| Parametros activos | No aplica: E4B es una variante densa. Las variantes MoE de la familia son 26B A4B |
| Longitud de contexto | 128.000 tokens (los modelos pequenos de la familia usan 128K; los medianos, 256K) |
| Tipos de cuantizacion | Q4_0 en GGUF. La familia Gemma 4 QAT ofrece ademas unquantized QAT (Q4_0), wNa8o8 para movil y compressed-tensors w4a16 para vLLM |
| Idiomas soportados | Mas de 140 idiomas segun la model card de Gemma 4; los metadatos del repositorio no detallan lista de idiomas |
| Licencia | Apache 2.0, con enlace a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (Q4_0) |

Datos adicionales del repositorio: tamano del repo 6,1 GB, pipeline `any-to-any`, creado el 29 de septiembre de 2026 y actualizado el mismo dia. La model card indica vocabulario de 262K tokens y 42 capas para E4B.

## Arquitectura y entrenamiento

Gemma 4 E4B es un transformer multimodal denso con un mecanismo de atencion hibrida que intercala capas de atencion local de ventana deslizante (512 tokens en E4B) con capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados (unified K/V) y aplican Proportional RoPE (p-RoPE). Las variantes E2B y E4B incorporan Per-Layer Embeddings (PLE) para aumentar la eficiencia en despliegues on-device. El modelo incluye un codificador de vision (~150M de parametros) y un codificador de audio (~300M), lo que habilita entrada de texto, imagen y audio con salida de texto.

La caracteristica distintiva de esta publicacion es el entrenamiento consciente de cuantizacion (QAT): el modelo se entrena de forma que la cuantizacion a Q4_0 preserve una calidad similar a la de los pesos en bfloat16, reduciendo drasticamente los requisitos de memoria. La model card diferencia cuatro formatos derivados del mismo pipeline QAT (checkpoints sin cuantizar, GGUF, wNa8o8 para movil y compressed-tensors w4a16), y advierte de que, al usar decodificacion especulativa con un modelo asistente, este debe ser tambien un checkpoint QAT con la misma precision. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; la variante es instruction-tuned (`it`) e incluye soporte nativo del rol `system`.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (`thinking modes`).
- Entrada multimodal: texto e imagen con soporte de relacion de aspecto y resolucion variables en todos los modelos de la familia; audio nativo en E2B, E4B y 12B. La model card de la familia menciona tambien video.
- Capacidades de codigo y agenticas mejoradas respecto a generaciones anteriores, con soporte nativo de function calling.
- Soporte nativo del rol `system` para conversaciones mas estructuradas y controlables.
- Multilingue: mas de 140 idiomas segun la model card de la familia.
- Encaje en flujos agenticos y de razonamiento multi-paso, con soporte de decodificacion especulativa mediante modelos asistente (drafter) compatibles.
- Optimizado para ejecucion local en portatiles y dispositivos moviles en las variantes pequenas.
- Pipeline declarado `any-to-any`, coherente con la combinacion de entradas texto/imagen/audio y salida de texto.

## Casos de uso

- Asistentes on-device sin conexion: con 128K tokens de contexto y pesos Q4_0 de ~4-6 GB, el modelo puede ejecutarse en portatiles con GPU de consumo o en moviles de gama alta (variante wNa8o8), gestionando conversaciones largas sin enviar datos a la nube.
- Analisis de documentos con componentes visuales: gracias al codificador de vision y a la entrada de imagen con resolucion variable, permite extraer y resumir informacion de capturas, diagramas o documentos escaneados dentro de un mismo prompt de 128K tokens.
- Atencion al cliente multilingue: el soporte de mas de 140 idiomas y el rol `system` nativo permiten fijar tono, politicas y restricciones de dominio de forma estable en conversaciones multi-turno.
- Agentes autonomos con herramientas: el function calling nativo y el razonamiento configurable lo hacen util para orquestar llamadas a APIs, consultas a bases de datos y flujos de varios pasos con verificacion intermedia.
- Asistencia a la programacion en local: generacion y explicacion de codigo integrada en el IDE, sin depender de servicios externos, aprovechando el incremento declarado en capacidades de codigo de la familia.
- Procesamiento de audio y transcripcion enriquecida: el codificador de audio de E4B permite tareas como resumen de reuniones, analisis de llamadas o interfaces por voz en aplicaciones de accesibilidad.
- Filtrado y clasificacion de contenido en el borde: al ser un modelo pequeno y cuantizado, puede desplegarse como clasificador previo o router semantico antes de llamar a un modelo mayor en servidor.
- Investigacion sobre QAT: el checkpoint sin cuantizar asociado (`google/gemma-4-E4B-it-qat-q4_0-unquantized`) esta pensado para compilacion y estudio de tecnicas de cuantizacion downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card consultada menciona mejoras en benchmarks de codigo y capacidades agenticas, pero la tabla de resultados quedaba fuera del fragmento disponible, por lo que no se reproducen cifras.

## Requisitos de hardware

- Estimacion de VRAM para inferencia (calculada a partir del tamano, no publicada por el autor): con ~7,46B parametros en Q4_0, los pesos ocupan aproximadamente 4,2-4,5 GB; el repositorio completo ocupa 6,1 GB en disco. Hay que sumar el espacio de la cache KV, que crece con el contexto y depende del numero de capas globales.
- Discrepancia detectada: los listados de terceros para el GGUF oficial de `google/gemma-4-E4B-it-qat-q4_0` indican un tamano de archivo de 2,36 GB, inferior al del repositorio analizado. No se dispone de informacion que explique la diferencia.
- GPU de consumo: el modelo deberia caber en GPUs con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) usando llama.cpp u Ollama. No hay cifras verificadas de latencia ni de throughput.
- GPU de datacenter: A100, H100 o L40S permiten servir el modelo con contextos largos y mayor concurrencia, aunque para esta escala es mas habitual el despliegue en GPU de consumo o en CPU.
- CPU y RAM: al estar en GGUF, es viable la inferencia en CPU con suficiente RAM (orientativamente 8-16 GB libres, sin dato oficial).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. Para vLLM, la familia ofrece el formato compressed-tensors (w4a16), que es la via nativa soportada; el soporte de GGUF en vLLM es mas limitado.
- Decodificacion especulativa: si se usa un modelo asistente, debe ser un checkpoint QAT con la misma precision que el modelo objetivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la familia Gemma 4 (datos de la model card de la familia). No se dispone de informacion sobre modelos externos comparables en la documentacion consultada.

| Modelo | Parametros | Capas | Ventana deslizante | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 E4B (este, en GGUF Q4_0) | 4,5B efectivos (8B con embeddings) | 42 | 512 tokens | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 35 | 512 tokens | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 48 | 1024 tokens | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 60 | 1024 tokens | 256K | Texto, imagen (sin audio) | Apache 2.0 |

Frente a E2B, E4B duplica aproximadamente los parametros efectivos, anade 7 capas y mantiene el mismo contexto de 128K, lo que lo situa como la opcion mas capaz de la gama orientada a dispositivo. Frente a 12B y 31B, pierde contexto (128K frente a 256K) pero reduce de forma sustancial los requisitos de memoria. La disponibilidad de este repositorio concreto es marginal: 0 descargas y 0 "likes" en el momento de la consulta, frente a cientos de miles de descargas de los GGUF oficiales segun los listados de terceros.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se publican tasas de error ni evaluaciones de fidelidad en la informacion disponible; como cualquier modelo generativo, puede producir contenido plausible pero incorrecto.
- Sesgos conocidos: la model card consultada no incluye una seccion de sesgos en el fragmento disponible; no hay datos verificables al respecto.
- Trazabilidad del repositorio: se trata de un reempaquetado de terceros con 0 descargas y 0 "likes", creado y actualizado el mismo dia. No hay evidencia de validacion comunitaria ni de que los pesos coincidan bit a bit con los oficiales; para produccion es recomendable usar el repositorio oficial de Google.
- Licencia: aunque los metadatos y la model card indican Apache 2.0, el enlace de licencia apunta a los terminos especificos de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`). Conviene revisar ese documento antes de un uso comercial, ya que puede incorporar condiciones adicionales de uso aceptable.
- Contexto limitado a 128K: suficiente para documentos largos, pero la mitad que las variantes 12B/26B A4B/31B de la misma familia.
- Idiomas: la model card de la familia declara mas de 140 idiomas, pero no se publican evaluaciones por idioma; el rendimiento en idiomas minoritarios no esta cuantificado.
- Cuantizacion Q4_0: aunque el QAT preserva calidad cercana a bfloat16, la perdida exacta respecto al checkpoint sin cuantizar no se documenta con cifras en la informacion disponible.
- Compatibilidad de decodificacion especulativa: el modelo asistente debe ser QAT y de la misma precision; usar uno no QAT puede degradar o romper la generacion.
- Sin datos de latencia ni throughput verificados: cualquier planificacion de capacidad en produccion deberia medirse en el hardware objetivo.

## Enlaces

- Repositorio analizado: https://huggingface.co/asincole/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- GGUF oficial: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/
- Gemma-4-E4B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e4b_it
- Listado de terceros del GGUF QAT Q4_0: https://local-ai-zone.github.io/models/gemma-4-e4b-it-qat-q4-0.html
- Listado de terceros del GGUF QAT: https://local-ai-zone.github.io/models/gemma-4-e4b-it-qat.html
