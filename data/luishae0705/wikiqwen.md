# Luishae0705/wikiQwen

## Resumen

wikiQwen es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario Luishae0705 en Hugging Face. Se trata de un experimento academico cuyo objetivo es ensenar a un modelo de chat de 0,5 mil millones de parametros hechos extraidos de un conjunto reducido de articulos de Wikipedia, mediante el entrenamiento sobre pares pregunta/respuesta generados a partir de ese texto (por ejemplo, "What is Xcode?", "When was X released?"). El modelo resulta relevante mas como registro de un experimento que como herramienta utilizable en produccion.

El autor es explicito sobre las limitaciones: la model card advierte que el modelo "no es fiable", que sigue alucinando tanto sobre temas dentro como fuera de los datos de entrenamiento y que falla en detalles incluso en articulos con los que fue entrenado. En las pruebas del propio autor, un enfoque basado en recuperacion (RAG), que entrega el texto real del articulo en el momento de responder en lugar de intentar memorizar los hechos en los pesos, funciono mucho mejor que este ajuste fino. El modelo se comparte tal cual, sin garantias.

Tecnicamente, se apoya en la arquitectura Qwen2 (transformer decoder-only) del modelo base, con 494.032.768 parametros totales, un repositorio de 0,5 GB en formato GGUF y soporte unicamente de ingles. La licencia es CC BY-SA 4.0, heredada de Wikipedia. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, lo que refleja su caracter de experimento personal con escasa adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base; numero de capas, dimension oculta y cabezas no publicados en la model card) |
| Parametros totales | 494 032 768 (~0,49 mil millones) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct soporta 32 768 tokens) |
| Tipos de cuantizacion | repositorio publicado en formato GGUF; niveles de cuantizacion concretos no especificados |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 (declarada como license: other con license_name: cc-by-sa-4.0) |
| Formato de pesos | GGUF (etiqueta del repositorio); tamano del repo 0,5 GB |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Dataset de entrenamiento | Luishae0705/wikipedia-articles |
| Metodo de ajuste | fine-tune completo (no LoRA) |
| Compatibilidad de endpoints | endpoints_compatible (etiqueta del repositorio) |
| Creado / actualizado | 2026-09-27 / 2026-09-27 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 494.032.768 parametros. No se han publicado en la model card detalles especificos de la arquitectura derivada (numero de capas, dimension oculta, configuracion de atencion o uso de GQA), por lo que se asume identica a la del modelo base salvo por los pesos ajustados. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos) en la informacion disponible.

El entrenamiento consistio en un ajuste fino completo, no LoRA, sobre pares pregunta/respuesta generados a partir de texto de Wikipedia. El autor no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la duracion del entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO; todos estos datos figuran como no disponibles. Si se indica que el dataset de origen es Luishae0705/wikipedia-articles y que el ajuste fue breve y sobre un conjunto pequeno de articulos, lo que el propio autor senala como causa directa de la falta de fiabilidad del resultado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a preguntas factuales sobre el subconjunto de articulos de Wikipedia empleado en el ajuste, con precision no garantizada incluso dentro de ese dominio.
- Formato de chat conversacional (etiqueta conversational del repositorio).
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado y, dado el tamano y la naturaleza del ajuste, poco probable.
- Modo thinking, vision o audio: no disponible.
- El autor advierte que el modelo alucina hechos tanto dentro como fuera de los datos de entrenamiento, por lo que ninguna capacidad factual debe considerarse fiable.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: sirve como caso de estudio documentado sobre que ocurre al intentar inyectar hechos de un corpus pequeno en un modelo de 0,5B mediante fine-tune, en contraste con un enfoque RAG.
- Docencia y divulgacion: util para ilustrar en clase o en un articulo las limitaciones de la memorizacion de hechos frente a la recuperacion, dado que el propio autor publica su conclusion negativa.
- Pruebas de infraestructura de despliegue: al pesar alrededor de 0,5 GB en GGUF, permite validar pipelines de llama.cpp, Ollama o servidores compatibles con endpoints sin consumir recursos significativos.
- Generacion de texto de relleno en demos y prototipos de interfaz: para maquetar chatbots o flujos conversacionales donde la exactitud de las respuestas no importa.
- Evaluacion comparativa de alucinacion: puede emplearse como linea base negativa en estudios sobre tasas de alucinacion en modelos pequenos ajustados con datos factuales.
- Pruebas de cuantizacion y rendimiento en hardware muy limitado: modelo candidato para medir latencia y consumo en CPU, Raspberry Pi o GPUs de gama de entrada.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, tareas medicas, legales o financieras, ni en ningun escenario donde la exactitud sea relevante, tal como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, TruthfulQA ni de ninguna otra evaluacion estandar, y el autor no aporta metricas cuantitativas mas alla de su observacion cualitativa de que un enfoque de recuperacion funciono mejor que este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 y en torno a 0,3-0,5 GB en cuantizaciones de 4 bits, coherente con los 494 millones de parametros y el repositorio de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, etc.); tambien es viable en CPU.
- Cabe holgadamente en GPU consumer, e incluso en dispositivos de placa unica tipo Raspberry Pi o moviles con llama.cpp en cuantizacion baja.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM o TGI si se dispone de los pesos en safetensors (no confirmado en el repositorio). El repositorio se declara compatible con endpoints.
- Latencia y throughput estimados: no disponibles; dependen fuertemente del hardware y de la cuantizacion elegida, pero por tamano se espera un throughput alto en cualquier GPU moderna.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda; los de wikiQwen provienen del repositorio analizado.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| wikiQwen (Luishae0705) | 0,49B | no disponible (base: 32 768) | Ingles | CC BY-SA 4.0 | Fine-tune completo sobre Q/A de Wikipedia; el autor lo declara no fiable |
| Qwen2.5-0.5B-Instruct | 0,49B | 32 768 | Multilingue | Apache 2.0 | Modelo base; ajustado con alineacion y mucho mas fiable en tareas generales |
| SmolLM2-360M-Instruct | 0,36B | 8 192 | Mayoritariamente ingles | Apache 2.0 | Alternativa pequena de Hugging Face con mejor soporte y mantenimiento |
| TinyLlama-1.1B-Chat | 1,1B | 2 048 | Ingles | Apache 2.0 | Modelo de tamano similar con contexto mas corto |

La comparacion relevante es con el propio modelo base: Qwen2.5-0.5B-Instruct emplea una licencia permisiva (Apache 2.0), soporta multiples idiomas y esta entrenado y alineado de forma extensiva, por lo que en practicamente cualquier tarea general supera a wikiQwen, cuya unica diferencia es el ajuste sobre un corpus factual reducido y cuya calidad el autor califica de poco fiable.

## Limitaciones y advertencias

- Alucinacion: el autor advierte explicitamente de que el modelo inventa hechos tanto en temas dentro como fuera de los datos de entrenamiento.
- Errores en el dominio entrenado: falla en detalles incluso en articulos de Wikipedia que formaron parte del ajuste.
- Uso desaconsejado: la propia model card indica que no debe emplearse en nada donde la exactitud importe.
- Alternativa superior: el autor comprobo que un enfoque basado en recuperacion (entregar el texto real del articulo en tiempo de respuesta) funciona mucho mejor que este ajuste fino.
- Idiomas: unicamente ingles; sin capacidades multilingues documentadas.
- Contexto: no se documenta en la model card; hereda como maximo los 32 768 tokens del modelo base si no se modifico, dato no confirmado.
- Licencia: CC BY-SA 4.0, licencia copyleft con obligacion de compartir igual y de atribuir a Wikipedia y sus contribuyentes; limita la combinacion con codigo o datos propietarios y exige mantener la misma licencia en obras derivadas. Conviene revisar las implicaciones antes de cualquier uso comercial.
- Madurez: 0 descargas y 0 likes, sin mantenimiento ni garantias documentadas; se comparte como registro de un experimento.
- Sesgos: no evaluados en la informacion disponible; al derivar de texto de Wikipedia, puede heredar los sesgos de cobertura y redaccion de esa fuente.
- Sin benchmarks: no existen metricas publicadas que permitan estimar su calidad de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luishae0705/wikiQwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Luishae0705/wikipedia-articles
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paper o blog oficial del modelo: no disponible
- Repositorio de codigo o demo: no disponible
