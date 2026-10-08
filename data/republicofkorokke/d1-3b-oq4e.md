# RepublicOfKorokke/d1-3B-oQ4e

## Resumen

RepublicOfKorokke/d1-3B-oQ4e es una version cuantizada del modelo LiquidAI/d1-3B, publicada por el usuario RepublicOfKorokke. Se trata de una conversion a 4 bits realizada con oQ (oMLX v0.7.0), la herramienta de cuantizacion de precision mixta del ecosistema MLX, y distribuida en formato MLX safetensors. El modelo cuenta con 3.123.483.888 parametros (aproximadamente 3,12 mil millones) y el repositorio ocupa 2,4 GB.

El modelo base pertenece a la familia LFM2 en su variante multimodal, tal y como indica el campo `model_type` de la model card (`lfm2_vl`), lo que situa a este checkpoint en la categoria de modelos de lenguaje y vision (vision-lenguaje) de tamano pequeno-medio. La finalidad de esta publicacion no es entrenar un modelo nuevo, sino reducir el coste de memoria y el ancho de banda necesario para ejecutar el modelo original en hardware Apple Silicon, manteniendo el comportamiento lo mas cerca posible del checkpoint en precision completa.

Su relevancia es practica: permite ejecutar un modelo multimodal de ~3B en equipos de consumo con memoria unificada, algo relevante para desarrolladores que trabajan en local, prototipado rapido o entornos sin GPU dedicada. Conviene senalar que la informacion publicada es muy escasa: la model card se limita a los detalles de cuantizacion y no incluye licencia, idiomas, contexto, benchmarks ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (familia LFM2, multimodal vision-lenguaje); detalle interno no disponible |
| Parametros totales | 3.123.483.888 (~3,12 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion de precision mixta oQ (oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Modelo base | LiquidAI/d1-3B |
| Libreria | mlx |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 8 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 17 descargas, 0 likes |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de este checkpoint: se trata exclusivamente de un proceso de cuantizacion post-entrenamiento, no de un reentrenamiento. La model card unicamente especifica que la conversion se hizo con oQ (oMLX v0.7.0), una herramienta de cuantizacion de precision mixta, con 4 bits y group size 64, y que el artefacto resultante se empaqueta en safetensors para MLX. No hay datos sobre el numero de tokens usado, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento.

El unico dato estructural disponible es el campo `model_type` del propio checkpoint: `lfm2_vl`. Esto indica que la arquitectura subyacente es la variante de vision-lenguaje de la familia LFM2 de Liquid AI, es decir, un modelo capaz de procesar entradas de imagen y texto. Los detalles concretos sobre el bloque de atencion, el uso de convoluciones, la estrategia de fusión multimodal o el tokenizador no estan publicados en la informacion disponible y deben consultarse en la model card del modelo base. Tampoco se documenta que la cuantizacion preserve o modifique capas concretas (por ejemplo, si se dejan ciertas proyecciones en mayor precision), mas alla del esquema de precision mixta declarado.

## Capacidades

- Generacion de texto: capacidades heredadas del modelo base, no verificadas en esta ficha.
- Procesamiento de imagenes: la arquitectura declarada (`lfm2_vl`) es de tipo vision-lenguaje, por lo que se espera soporte de entrada multimodal, aunque la model card no lo detalla.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, audio, decodificacion especulativa): no disponibles.

Nota: al tratarse de una cuantizacion a 4 bits, es esperable una degradacion marginal en tareas sensibles a la precision numerica, aunque no se han publicado mediciones al respecto en este repositorio.

## Casos de uso

- Inferencia local en Mac con memoria unificada: al ocupar 2,4 GB en disco y emplear 4 bits, el modelo puede cargarse en equipos Apple Silicon de gama media mediante MLX, lo que permite probar un modelo multimodal sin GPU dedicada.
- Prototipado de aplicaciones vision-lenguaje: util para validar rapidamente pipelines de descripcion de imagenes, respuesta a preguntas sobre imagenes o extraccion de informacion de capturas, antes de escalar a un modelo mayor.
- Asistentes de escritorio offline: integrable en aplicaciones nativas de macOS que necesiten generar o resumir texto sin enviar datos a un servicio externo.
- Automatizacion de tareas de documentacion: clasificacion y resumen de capturas de pantalla o documentos escaneados en un flujo local, siempre que se valide previamente la calidad real del modelo base en estas tareas.
- Experimentacion academica con cuantizacion: sirve como punto de comparacion para estudiar el impacto de la cuantizacion mixta de oQ frente a otros esquemas (por ejemplo, 4 bits uniforme) sobre un modelo de ~3B.
- Despliegue de bajo coste en edge: entornos con memoria limitada donde un modelo de 3B en 4 bits es viable y un modelo en precision completa no lo seria.
- Base para ajuste fino con LoRA/QLoRA: el checkpoint cuantizado puede servir como punto de partida en flujos de adaptacion eficiente en parametros en el ecosistema MLX, sujeto a la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ningun dato de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones de degradacion respecto al modelo base. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: con 4 bits y 3,12 B de parametros, los pesos ocupan aproximadamente 1,6-1,9 GB; sumando cache KV y overhead del runtime, un presupuesto realista es de 3-4 GB de memoria unificada o VRAM. Es una estimacion derivada del tamano declarado, no un dato publicado.
- GPU recomendadas: al estar en formato MLX, el destino natural son los chips Apple Silicon (series M1, M2, M3, M4 y superiores). Para CUDA seria necesario convertir el checkpoint a otro formato, ya que MLX no ejecuta sobre GPU NVIDIA de forma nativa.
- Viabilidad en hardware de consumo: si, cabe en Mac con 8 GB de memoria unificada o superior; en el caso de 8 GB conviene cerrar otras aplicaciones para evitar presion de memoria.
- Opciones de despliegue: MLX y mlx-lm como ruta principal; el repositorio declara `custom_code`, por lo que puede requerir cargar codigo remoto. Para llama.cpp, Ollama o vLLM haria falta reconvertir el modelo, ya que estos runtimes no consumen safetensors de MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RepublicOfKorokke/d1-3B-oQ4e | 3,12 B (4 bits) | no disponible | MLX safetensors | no disponible | HuggingFace |
| LiquidAI/d1-3B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones de LiquidAI/d1-3B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas multimodales de ~3B (Qwen-VL, SmolVLM, Gemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La comparacion mas directa y verificable es contra el propio modelo base LiquidAI/d1-3B en precision completa, del que este checkpoint es una conversion a 4 bits.

## Limitaciones y advertencias

- La model card no declara licencia. Esto es un riesgo relevante para uso comercial: la licencia aplicable sera, con toda probabilidad, la del modelo base LiquidAI/d1-3B, y debe verificarse antes de cualquier despliegue en produccion.
- El repositorio tiene 17 descargas y 0 likes, y fue publicado por un usuario individual, no por el laboratorio que desarrollo el modelo base. No hay validacion de la comunidad sobre la fidelidad de la cuantizacion.
- No se publican evaluaciones de degradacion respecto al checkpoint original, por lo que no se puede cuantificar la perdida de calidad asociada a la cuantizacion a 4 bits.
- El repositorio incluye `custom_code`, lo que implica ejecutar codigo remoto al cargar el modelo; conviene revisarlo antes de usarlo en entornos sensibles.
- Al ser un artefacto MLX, la portabilidad es limitada: no funciona directamente en vLLM, TGI, llama.cpp ni Ollama sin conversion previa.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Como referencia general, los modelos de ~3B en 4 bits suelen mostrar mayor propension a errores factuales que modelos mayores.
- Idiomas y cobertura linguistica: no declarados. No se puede asumir un buen rendimiento en castellano sin una evaluacion propia.
- Longitud de contexto: no declarada. Planificar despliegues con contexto largo sin verificar antes el limite real puede provocar degradacion silenciosa.
- Sesgos: no documentados. Al no haber informacion sobre los datos de entrenamiento del modelo base, no es posible evaluar sesgos conocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RepublicOfKorokke/d1-3B-oQ4e
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Documentacion de MLX: https://github.com/ml-explore/mlx
- Otros enlaces (paper, blog, demo): no disponibles en la informacion proporcionada.
