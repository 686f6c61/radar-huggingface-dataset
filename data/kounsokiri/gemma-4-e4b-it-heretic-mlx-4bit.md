# Kounsokiri/gemma-4-E4B-it-heretic-mlx-4Bit

## Resumen

Kounsokiri/gemma-4-E4B-it-heretic-mlx-4Bit es una conversión al formato MLX, cuantizada a 4 bits, del modelo coder3101/gemma-4-E4B-it-heretic, que a su vez deriva de la familia Gemma 4 de Google en su variante E4B (instruida). La particularidad de esta variante es que ha sido sometida a un proceso de "abliteration" o "decensoring" (etiquetado como heretic), orientado a reducir los rechazos y filtros de contenido del modelo original. El autor de la conversión es Kounsokiri, que la publica con licencia Apache 2.0 y pipeline any-to-any, lo que indica capacidades multimodales de entrada y salida.

El modelo cuenta con 7.518.069.034 parámetros reales según los pesos en safetensors, lo que lo sitúa en la gama de modelos de ~7,5 mil millones de parámetros. La nomenclatura E4B de la familia Gemma hace referencia a una arquitectura con parámetros efectivos reducidos mediante mecanismos de eficiencia (el sufijo E), aunque la model card no detalla la arquitectura interna. El repositorio ocupa 4,3 GB, coherente con una cuantización de 4 bits de un modelo de este tamaño.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo multimodal de la familia Gemma 4 en hardware Apple Silicon mediante MLX, con el ahorro de memoria que supone la cuantización a 4 bits; por otro, ofrece una variante sin censura para casos de uso donde los filtros del modelo base resultan limitantes (investigación sobre alineación, generación creativa sin restricciones, etc.), con las advertencias éticas y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles |
| Parametros totales | 7.518.069.034 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX), formato de cuantizacion MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), cuantizado a 4 bits |
| Pipeline | any-to-any (multimodal entrada/salida) |
| Tamano del repositorio | 4,3 GB |
| Libreria | transformers / mlx-lm (version 0.31.2) |
| Modelo base | coder3101/gemma-4-E4B-it-heretic |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su pertenencia a la familia Gemma 4 en la variante E4B y su caracter multimodal (pipeline any-to-any, tags image-text-to-text). El sufijo E4B sugiere un diseno orientado a la eficiencia con parametros efectivos, pero la model card no especifica si se trata de un Mixture of Experts, de una arquitectura con comparticion de parametros o de otra tecnica. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si se conoce es el proceso de post-entrenamiento diferencial: el modelo ha sido sometido a "abliteration" (etiquetas abliterated, decensored, uncensored, heretic), una tecnica que modifica los pesos para eliminar o atenuar la direccion de rechazo aprendida durante el alineamiento, con el objetivo de reducir las negativas del modelo ante ciertas peticiones. La conversion a MLX se realizo con mlx-lm 0.31.2 y se cuantizo a 4 bits, lo que reduce el peso del repositorio a 4,3 GB.

## Capacidades

- Generacion de texto multimodal: el pipeline any-to-any y el tag image-text-to-text indican soporte de entrada de imagen y texto, con generacion de respuestas.
- Procesamiento de imagenes: capacidad de interpretar imagenes junto a instrucciones textuales.
- Generacion de texto libre con reduccion de rechazos: el proceso heretic/abliterated disminuye las negativas ante peticiones que el modelo base rechazaria.
- Conversacion multi-turno: uso como modelo de chat mediante plantilla de chat (apply_chat_template).
- Ejecucion local en Apple Silicon: formato MLX optimizado para chips de Apple.
- Capacidades de codigo y razonamiento: no confirmadas explicitamente en la informacion disponible, aunque plausibles dado el modelo base (Gemma 4 instruct).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no especificados).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantizacion a 4 bits permiten cargar el modelo en equipos con memoria unificada moderada (el repositorio ocupa 4,3 GB), usando mlx-lm para generar texto sin depender de la nube.
- Investigacion sobre alineacion y seguridad: la variante heretic/abliterated permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparandolo con el modelo base original.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido narrativo donde los filtros del modelo alineado resultan limitantes, ejecutado en local.
- Prototipado multimodal en local: al aceptar imagen y texto, sirve para experimentar con tareas de descripcion de imagenes o respuesta a preguntas visuales en un entorno de desarrollo con MLX.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de una cuantizacion a 4 bits frente al modelo en precision completa, en el contexto de la familia Gemma 4.
- Desarrollo de asistentes conversacionales personalizados: mediante la plantilla de chat y mlx-lm, se puede integrar en aplicaciones de escritorio en macOS que requieran un modelo local sin dependencias de API.
- Docencia y experimentacion: permite a estudiantes e investigadores ejecutar un modelo de ~7,5 mil millones de parametros en hardware de consumo Apple, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 4,3 GB en cuantizacion de 4 bits; se recomienda al menos 6-8 GB de memoria unificada libre para cargar el modelo y el contexto.
- Hardware objetivo: chips de Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no esta pensado para GPU NVIDIA en este formato.
- GPU de consumo: no aplica directamente al ser formato MLX; para GPU NVIDIA habria que recurrir al modelo base en otro formato (GGUF, safetensors sin cuantizar MLX).
- Opciones de despliegue: mlx-lm (libreria oficial para cargar y generar), y por la libreria transformers indicada, potencialmente el ecosistema Hugging Face; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kounsokiri/gemma-4-E4B-it-heretic-mlx-4Bit | 7.518.069.034 | no disponible | MLX 4 bits | Apache 2.0 | Variante heretic/abliterated, multimodal, orientada a Apple Silicon |
| coder3101/gemma-4-E4B-it-heretic | no disponible | no disponible | safetensors | no disponible | Modelo base del que deriva esta conversion; sin cuantizar a MLX |
| Gemma 4 E4B-it (original de Google) | no disponible | no disponible | safetensors | licencia Gemma 4 | Version alineada con filtros de seguridad intactos |

## Limitaciones y advertencias

- El proceso heretic/abliterated reduce los rechazos del modelo, lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o danino; no es apto para despliegues publicos sin moderacion adicional.
- La cuantizacion a 4 bits puede degradar la calidad de las respuestas frente al modelo en precision completa; no se han publicado evaluaciones de esta perdida.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no esta disponible, lo que impide planificar casos de uso con ventanas largas.
- No hay datos de benchmarks, por lo que no se puede comparar objetivamente su rendimiento con alternativas.
- El modelo esta en formato MLX, limitado a hardware Apple Silicon en la practica; no es portable directamente a GPU NVIDIA sin conversion.
- Aunque la licencia es Apache 2.0, el license_link apunta a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso comercial de la familia Gemma antes de un despliegue productivo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; la calidad de la conversion no ha sido contrastada externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kounsokiri/gemma-4-E4B-it-heretic-mlx-4Bit
- Modelo base: https://huggingface.co/coder3101/gemma-4-E4B-it-heretic
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
