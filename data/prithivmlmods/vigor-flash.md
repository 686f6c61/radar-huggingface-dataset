# prithivMLmods/VIGOR-flash

## Resumen

VIGOR-flash (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal denso de aproximadamente 9.653 millones de parametros, afinado a partir de Qwen/Qwen3.5-9B por el desarrollador prithivMLmods. Su proposito no es la generacion de texto generalista, sino la clasificacion de seguridad de contenido visual: analiza imagenes y decide si son seguras o NSFW, con un sesgo deliberadamente conservador (ante la duda, clasifica como inseguro).

El modelo resuelve un problema concreto de moderacion: muchos filtros de contenido visual son cajas negras binarias, mientras que VIGOR-flash produce una salida JSON estructurada que incluye descripcion de escena, veredicto booleano, justificacion textual y campos enteros complementarios para integrarse en pipelines automatizados. El analisis cubre vestimenta, exposicion corporal, poses, encuadre y contexto de la escena.

Es relevante ahora porque se apoya en la familia Qwen 3.5 (una base reciente y capaz) y porque preserva los tensores de Multi-Token Prediction (MTP), lo que habilita decodificacion especulativa y acelera la inferencia local. Se distribuye bajo licencia Apache 2.0, esta etiquetado como experimental y solo declara soporte de ingles, con un total de 2 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen 3.5), con preservacion de tensores MTP |
| Parametros totales | 9.653.104.368 (aprox. 9,65 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en la model card; existen menciones a GGUF como destino de inferencia alternativo |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); repo de 19,3 GB |

## Arquitectura y entrenamiento

VIGOR-flash es un ajuste fino de Qwen/Qwen3.5-9B, un transformer denso de 9B parametros con capacidad multimodal de entrada imagen-texto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion figura como no disponible. La innovacion declarada es la "arquitectura VIGOR", que en la practica es una politica de clasificacion orientada a guardrail con salida JSON estricta, junto con la preservacion de los tensores de Multi-Token Prediction (MTP) para habilitar decodificacion especulativa.

El modelo incorpora dos modos de plantilla: "Best" (thinking off) y "Reasoning" (thinking on), lo que permite alternar entre respuestas rapidas y razonamiento extendido segun el caso de uso. La clasificacion se apoya en el prompt estandar incluido en la model card, que impone tolerancia cero ante desnudos, ropa reveladora, contenido anime sugerente y actos sexuales explicitos, y obliga a devolver un JSON valido con las claves `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`.

## Capacidades

- Clasificacion visual Safe / NSFW con politica conservadora (ante ambiguedad, clasifica como inseguro).
- Deteccion de contenido sensual, revelador, provocativo y sexualmente sugerente.
- Analisis de vestimenta y codigo de vestimenta: cobertura, exposicion y prendas transparentes.
- Analisis de poses, posicionamiento corporal y encuadre.
- Analisis de contexto y ambientacion de la escena.
- Salida estructurada en JSON con descripcion de escena, veredicto y justificacion.
- Modo thinking (razonamiento) y modo directo, seleccionables via plantilla.
- Decodificacion especulativa mediante tensores MTP preservados.
- Procesamiento imagen-texto en una sola pasada (pipeline image-text-to-text).
- Soporte de multiples imagenes en escenarios de inferencia (recomendado Flash Attention 2 para eficiencia).

## Casos de uso

- Moderacion de contenido en plataformas UGC: el modelo se integra como clasificador previo a publicacion para marcar imagenes NSFW y devolver el JSON con justificacion, lo que facilita la revision humana de los casos dudosos.
- Control parental y proteccion de menores: filtrado de imagenes en navegadores o apps infantiles con la politica de tolerancia cero que define el prompt estandar.
- Moderacion de comunidades de imagenes generadas por IA: deteccion de ilustraciones anime sugerentes, ecchi o hentai en galerias generativas.
- Revision de anuncios y creatividades publicitarias: verificacion automatica de que las imagenes cumplen el codigo de vestimenta y las politicas de la plataforma antes de su publicacion.
- Enriquecimiento de datasets de vision: generacion de etiquetas Safe/NSFW y descripciones de escena estructuradas para curar corpus de entrenamiento.
- Guardrail en pipelines de agentes multimodales: el modelo actua como filtro intermedio que valida las imagenes que un agente recibe o genera antes de continuar el flujo.
- Auditoria de catalogos de e-commerce: deteccion de imagenes de producto con exposicion no deseada o contenido inapropiado en fichas de moda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (9,65B parametros) se requieren aproximadamente 19-20 GB de VRAM; con cuantizacion de 8 bits, en torno a 10-11 GB; con 4 bits, alrededor de 6-7 GB (estimaciones derivadas del tamano del modelo, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin cuantizar; RTX 4090 (24 GB) para bfloat16 justo al limite.
- Cabe en GPU de consumo: si, en RTX 4090 con bfloat16 ajustado o con cuantizacion; en RTX 3090 (24 GB) de forma similar; en GPUs de 12-16 GB solo con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial, con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`), text-generation-inference (etiqueta tgi), llama.cpp/Ollama mediante GGUF (la model card menciona GGUF como destino del prompt estandar) y Flash Attention 2 para aceleracion.
- Latencia y throughput: no disponibles; la decodificacion especulativa via MTP deberia reducir la latencia respecto a la base sin MTP, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-flash | 9,65B | No disponible | Clasificacion visual Safe/NSFW con JSON | Apache 2.0 | HuggingFace (transformers) |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Modelo multimodal generalista | Segun modelo base (no disponible en la informacion) | HuggingFace |
| Alternativas de moderacion visual | No disponible | No disponible | Clasificadores de contenido | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de moderacion visual en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo etiquetado como experimental: no debe tratarse como un guardrail de produccion sin validacion propia.
- Solo declara soporte de ingles; el rendimiento en otros idiomas no esta verificado.
- La politica conservadora puede generar falsos positivos en imagenes ambiguas (playa, deporte, arte), lo que exige revision humana.
- Riesgo de alucinacion en la descripcion de escena y en la justificacion de clasificacion.
- Sesgos potenciales derivados del dataset de ajuste y de la base Qwen 3.5, no documentados por el autor.
- La model card advierte de que los autores y la plataforma declinan toda responsabilidad sobre las salidas; el usuario asume la responsabilidad legal y etica del uso.
- Uso previsto exclusivamente para investigacion y clasificacion de seguridad de contenido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen 3.5.
- No se documentan la longitud de contexto, los formatos de cuantizacion ni el proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prithivMLmods/VIGOR-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
