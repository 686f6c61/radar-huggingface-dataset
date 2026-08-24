# shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q8

## Resumen

El modelo `shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q8` es una cuantización en 8 bits (MLX) del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, una variante sin censura del Gemma 4 26B A4B de Google. Este último es un modelo de lenguaje y visión (VLM) con arquitectura de mezcla de expertos (MoE) que activa 4.000 millones de parámetros de un total de 26.000 millones, y que soporta una ventana de contexto de hasta 256.000 tokens y más de 140 idiomas. La conversión a MLX 8-bit, realizada con `mlx_vlm.convert`, no incluye fine-tuning ni re-alineamiento, por lo que conserva las capacidades del modelo original pero con un tamaño en disco de aproximadamente 28 GB, pensado para ejecutarse eficientemente en hardware Apple Silicon.

La relevancia de este modelo radica en que ofrece una versión cuantizada y lista para usar en Mac con memoria unificada, manteniendo la naturaleza "uncensored" del modelo base, lo que lo hace atractivo para desarrolladores que necesitan un VLM local sin restricciones de moderación. Las mediciones publicadas por el autor indican un throughput de 43,8 tokens por segundo con una petición y 143,8 tokens por segundo con ocho peticiones concurrentes en un Apple M3 Ultra con 96 GB de memoria unificada, con una perplejidad relativa de 1,06× respecto al mejor escalón de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4, con componente de vision (VLM) |
| Parametros totales | 26B (declarados por el modelo base); 7.667.787.342 en el safetensors MLX (posiblemente solo pesos cuantizados almacenados) |
| Parametros activos | 4B (segun la denominacion A4B) |
| Longitud de contexto | 256K tokens (segun especificaciones de Gemma 4) |
| Tipos de cuantizacion | 8-bit (MLX, q-bits 8, group size 64) |
| Idiomas soportados | Mas de 140 (segun Gemma 4); la ficha de HuggingFace indica "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `coder3101/gemma-4-26B-A4B-it-heretic` es una variante sin censura del Gemma 4 26B A4B de Google, que emplea una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y 4.000 millones activos por token. Incluye un codificador de visión que permite procesar imágenes junto con texto, y está diseñado para tareas de generación de texto, razonamiento y codificación. La versión "heretic" elimina los mecanismos de moderación y alineación de seguridad del modelo original, lo que permite respuestas sin filtros en dominios sensibles.

La cuantización MLX 8-bit fue realizada por `shoemoney` mediante `mlx_vlm.convert` sobre los pesos BF16 originales, con un tamaño de grupo de 64. No se aplicó fine-tuning, merging ni re-alineamiento, por lo que las capacidades del modelo base se mantienen íntegras, aunque con una ligera degradación de calidad inherente a la cuantización. Los datos de entrenamiento del modelo base no se detallan en la información disponible, pero Gemma 4 se entrena con un corpus multilingüe extenso y técnicas de alineación supervisada, aunque la variante heretic prescinde de la etapa de alineación de seguridad.

## Capacidades

- Generacion de texto y razonamiento: el modelo puede mantener conversaciones coherentes y resolver tareas de logica y analisis.
- Comprension de imagenes: al ser un VLM, acepta entradas visuales y puede describir, analizar o responder preguntas sobre ellas.
- Generacion de codigo: soporta tareas de programacion, aunque no se especifican detalles sobre tool calling o function calling.
- Multilingue: cubre mas de 140 idiomas, segun las especificaciones de Gemma 4.
- Sin censura: al ser una variante "heretic", no aplica filtros de contenido, lo que permite respuestas sin restricciones en temas sensibles.
- Cuantizacion 8-bit: optimizado para ejecucion en Apple Silicon mediante MLX, con buen rendimiento en memoria unificada.

## Casos de uso

- Asistente local de vision por voz: un desarrollador puede integrar este modelo en una aplicacion macOS que reciba imagenes de una camara y genere descripciones o respuestas en tiempo real, aprovechando los 256K tokens de contexto para analisis de secuencias largas de video.
- Generacion de contenido sin restricciones: para proyectos de escritura creativa o roleplay que requieran respuestas sin filtros de moderacion, este modelo ofrece una alternativa local a APIs comerciales censuradas.
- Analisis de documentos con imagenes: al combinar vision y texto, puede procesar PDFs escaneados o capturas de pantalla y extraer informacion relevante, util en entornos de investigacion o soporte tecnico.
- Desarrollo de agentes conversacionales en Mac: gracias a su cuantizacion MLX y su throughput de 43,8 tok/s en una sola peticion, puede servir como backend de chatbots locales en equipos Apple Silicon sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones VLM: los desarrolladores pueden usar este modelo para validar ideas de productos que requieran comprension de imagenes y texto, antes de migrar a modelos mas grandes en la nube.
- Educacion y experimentacion: al ser de codigo abierto (Apache 2.0) y ejecutable en hardware de consumo, es adecuado para fines academicos y de investigacion en procesamiento de lenguaje natural y vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones propias de perplejidad y throughput, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 105,975 |
| Perplejidad relativa al mejor escalon de la familia | 1,06× |
| Throughput (1 peticion) | 43,8 tok/s |
| Throughput (8 peticiones concurrentes) | 143,8 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. La perplejidad solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion 8-bit, el modelo ocupa aproximadamente 28 GB en disco. En memoria unificada de Apple Silicon, se recomienda un minimo de 32 GB para evitar swapping, aunque 64 GB o mas ofrecen un margen comodo.
- GPU recomendadas: el modelo esta optimizado para Apple Silicon (M-series). Se ha probado en un M3 Ultra con 96 GB, pero deberia funcionar en M1 Pro/Max o superiores con suficiente memoria unificada.
- Compatibilidad con GPU de consumo: no esta pensado para NVIDIA o AMD, ya que MLX es un framework exclusivo de Apple. Para otras plataformas habria que convertir los pesos a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: se utiliza con la libreria `mlx-vlm` (no `mlx-lm`). El comando de generacion es `mlx_vlm.generate --model shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q8 --prompt "Hello" --max-tokens 256`.
- Latencia y throughput: 43,8 tok/s con una peticion y 143,8 tok/s con ocho peticiones concurrentes en el hardware de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Heretic-MLX-q8 (este) | 26B total, 4B activos | 256K | Apache 2.0 | MLX 8-bit | VLM sin censura, para Apple Silicon |
| google/gemma-4-26B-A4B-it | 26B total, 4B activos | 256K | Apache 2.0 | BF16 | Version oficial con moderacion |
| coder3101/gemma-4-26B-A4B-it-heretic | 26B total, 4B activos | 256K | Apache 2.0 | BF16 | Version sin censura, base de este modelo |
| Mixtral 8x7B (referencia MoE) | 46,7B total, 12,9B activos | 32K | Apache 2.0 | Varios | MoE sin vision, no comparable directamente |

La comparativa se limita a modelos de la misma familia Gemma 4, ya que no hay datos de rendimiento estandar para este modelo. La principal diferencia con la version oficial es la ausencia de moderacion y la cuantizacion, que reduce el tamano en disco de aproximadamente 52 GB (BF16) a 28 GB.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante sin censura, puede generar contenido ofensivo, discriminatorio o inapropiado. No se han realizado evaluaciones de sesgo en esta version.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, el rendimiento puede degradarse con secuencias muy largas, y la cuantizacion 8-bit puede amplificar errores en contextos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base "heretic" puede no cumplir con politicas de contenido de algunas plataformas o empresas.
- Compatibilidad: solo funciona con MLX y Apple Silicon. No es portable a otros entornos sin una conversion adicional.
- Calidad de la cuantizacion: la perplejidad relativa de 1,06× respecto al mejor escalon de la familia indica una ligera perdida de precision, que puede ser relevante en tareas de alta exigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q8
- Modelo base (coder3101): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Gemma 4 oficial (Google): https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
