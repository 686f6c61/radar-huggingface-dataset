# GreenBitAI/Qwen3.8-Flash-Next-4bit-paged

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal (vision-language) de arquitectura MoE desarrollado por el equipo Qwen, que supone un avance preliminar de la arquitectura Qwen4. El modelo principal cuenta con 125.000 millones de parametros, complementados por 51.000 millones de embeddings basados en n-gramas, activando solo 6.000 millones de parametros por token. Incorpora una atencion hibrida GDN + QSA que mejora la eficiencia computacional y la capacidad del modelo.

Esta ficha describe la build cuantizada a 4 bits en formato MLX publicada por GreenBitAI, diseñada especificamente para Apple Silicon. La build "expert-paged" separa los pesos residentes de los expertos enrutados, de modo que la maquina carga solo lo que necesita y transmite el resto desde disco. Las verificaciones de calidad confirman logits identicos a nivel de bit en la mayoria de prompts y coincidencia de tokens greedy en todos los casos.

El modelo es relevante porque permite ejecutar un MoE multimodal de gran tamano en hardware Apple con memoria unificada limitada, gracias a la cuantizacion 4-bit y al paginado de expertos. Sin embargo, su huella en disco es considerable (103,94 GiB) y requiere un pico de memoria de 88,89 GiB en ciertas operaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida vision-language (atencion GDN + QSA) |
| Parametros totales | 125B (modelo principal) + 51B (embeddings n-grama); el safetensors de esta build contiene 1.429.820.051 parametros (pesos residentes) |
| Parametros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (residentes) + bin (expertos) + rows (tabla n-grama) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un avance preliminar de la arquitectura Qwen4. Segun el repositorio oficial, el modelo mejora sistematicamente cuatro aspectos: atencion, residual, embedding y optimizacion. La atencion combina GDN y QSA en una arquitectura hibrida que reduce el coste computacional manteniendo capacidad. El modelo principal tiene 125B de parametros, a los que se anaden 51B de embeddings basados en n-gramas (almacenados en el archivo ple-q4.rows de esta build), activando 6B de parametros por token gracias al enrutamiento MoE.

Esta build de GreenBitAI cuantiza los pesos a 4 bits y los organiza en tres archivos: model.safetensors (3,80 GiB, pesos residentes), experts.bin (70,31 GiB, expertos enrutados) y ple-q4.rows (29,80 GiB, tabla n-grama). El diseño "expert-paged" permite que la maquina cargue en memoria solo los pesos que caben y transmita el resto desde disco, sin necesidad de un flag de configuracion: la decision la toma el sistema en tiempo de ejecucion. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Procesamiento multimodal imagen-texto (pipeline image-text-to-text): acepta imagenes y texto como entrada y genera texto.
- Generacion conversacional multi-turno.
- Razonamiento sobre contenido visual: descripcion, analisis y respuesta a preguntas sobre imagenes.
- Enrutamiento MoE con 6B de parametros activos por token, lo que reduce el coste de inferencia frente a un modelo denso de tamano equivalente.
- Embeddings n-grama (51B parametros adicionales) que complementan la representacion del modelo.
- Ejecucion en Apple Silicon via MLX, con paginado de expertos para adaptarse a la memoria disponible.

## Casos de uso

- Analisis de documentos e imagenes en Mac: el modelo puede extraer informacion de capturas, diagramas o fotografias y responder preguntas en lenguaje natural, aprovechando la capacidad multimodal y la cuantizacion 4-bit para ejecutarse en equipos Apple.
- Asistente multimodal local: al ejecutarse con MLX, permite construir asistentes privados que procesan imagenes y texto sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Captioning y etiquetado automatico de imagenes en lotes: su capacidad vision-language permite automatizar la descripcion de grandes volumenes de imagenes en flujos de datos.
- Prototipado de aplicaciones de vision por computador: investigadores pueden validar ideas de interaccion multimodal en hardware Apple antes de escalar a GPUs de centro de datos.
- Educacion y documentacion tecnica: el modelo puede explicar diagramas, esquemas o capturas de pantalla, util para generar documentacion a partir de material visual.
- Experimentacion con arquitecturas MoE cuantizadas: esta build sirve como referencia para estudiar el rendimiento de modelos Qwen4 en 4-bit con paginado de expertos en memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

La model card de GreenBitAI incluye verificaciones de calidad propias de la cuantizacion:
- Logits identicos a nivel de bit en 5 prompts hasta 160 tokens.
- En un prompt mas largo, diferencias maximas de 6,8 con el mismo token greedy en toda la generacion.
- Comprobacion capa a capa frente a los pesos residentes: 48 capas x 2 extracciones exactas, con un pico de memoria de 88,89 GiB.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (la build usa MLX, no CUDA).
- Espacio en disco: 103,94 GiB en total (3,80 GiB residentes + 70,31 GiB expertos + 29,80 GiB tabla n-grama).
- Memoria: el diseño paginado carga en RAM solo los pesos que caben; el pico medido en una comprobacion capa a capa fue de 88,89 GiB. Por debajo de esa cifra, el modelo transmitira expertos desde disco, con la consiguiente penalizacion de latencia.
- GPU: no aplicable directamente; MLX aprovecha la GPU integrada del chip Apple.
- Opciones de despliegue: MLX (libreria gbx_lm), compatible con el ecosistema omlx para modelos vision-language.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (base) | 125B + 51B n-grama | 6B | no cuantizado | safetensors | qwen-community-1.0 |
| rapid-mlx/Qwen3.8-Flash-Next-4bit | 125B + 51B n-grama | 6B | 4-bit MLX | safetensors | qwen-community-1.0 |
| GreenBitAI/Qwen3.8-Flash-Next-4bit-paged | 125B + 51B n-grama | 6B | 4-bit MLX | safetensors + bin + rows | qwen-community-1.0 |

La diferencia principal de esta build frente a la de rapid-mlx es el paginado de expertos: los pesos que se leen por fracciones viven en contenedores separados, de modo que la maquina carga solo lo que necesita. La build de GreenBitAI deriva de Vontra/Qwen3.8-Flash-Next-MLX-4bit y verifica que la cuantizacion, el tokenizador, la plantilla de chat y la licencia no cambian respecto a la fuente.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: no es una licencia open source estandar (Apache/MIT); implica condiciones de uso comunitario que deben revisarse antes de un despliegue comercial.
- Solo para Apple Silicon: al usar MLX, no puede ejecutarse en GPUs NVIDIA o AMD sin conversion previa.
- Requiere recursos considerables: 103,94 GiB de disco y un pico de memoria de 88,89 GiB en ciertas operaciones; equipos con menos RAM unificada dependen del streaming desde disco, con mayor latencia.
- La informacion sobre idiomas soportados no esta disponible; la cobertura multilingue no puede confirmarse.
- No se han publicado benchmarks estandar para esta build; las verificaciones de GreenBitAI cubren solo la fidelidad de la cuantizacion, no el rendimiento en tareas.
- Riesgo de alucinacion y sesgos: no hay datos disponibles sobre evaluaciones de sesgo o alucinacion para este modelo.
- Longitud de contexto no documentada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-4bit-paged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Build MLX 4-bit de referencia: https://huggingface.co/rapid-mlx/Qwen3.8-Flash-Next-4bit
- Receta vLLM: https://recipes.vllm.ai/Q
