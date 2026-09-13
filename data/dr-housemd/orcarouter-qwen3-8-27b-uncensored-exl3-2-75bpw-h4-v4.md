# dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-2.75bpw-H4-V4

## Resumen

Este repositorio es una variante "abliterated" (eliminacion de la direccion de rechazo) de Qwen3.8-27B, un modelo denso de vision-lenguaje desarrollado por Alibaba/Qwen y publicado por el usuario dr-housemd bajo el paraguas de OrcaRouter. La modificacion consiste en ortogonalizar la direccion de rechazo del *residual stream* siguiendo el metodo de Arditi et al. (2024), de forma que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria. El proposito declarado es la investigacion en seguridad de IA, *red-teaming* y estudio de mecanismos de rechazo, no el despliegue en produccion.

Arquitectonicamente hereda la configuracion de Qwen3.8-27B: 64 capas, dimension oculta 5120 y un esquema de atencion hibrida que combina 48 capas de atencion lineal Gated DeltaNet con 16 capas de atencion completa (intervalo 4). Incluye torre de vision nativa (pipeline image-text-to-text), cabeza de decodificacion especulativa MTP y una ventana de contexto declarada de 262.144 tokens. El entrenamiento posterior y los pesos completos se preservan en BF16, incluidos los 333 tensores `visual.*` y los 15 tensores `mtp.*`.

Es relevante ahora porque el nombre del repositorio indica una cuantizacion EXL3 de 2,75 bpw (orientada a inferencia en GPU de consumo mediante ExLlamaV3), mientras que la model card describe el build BF16 de origen. Esa discrepancia, junto con el recuento real de parametros en safetensors (6.137.435.520, muy inferior a los 27B que anuncia el nombre), hace que la ficha deba leerse con cautela: no hay benchmarks publicados ni verificacion independiente de este *upload*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration; transformer denso con atencion hibrida (48 capas Gated DeltaNet de atencion lineal + 16 capas de atencion completa, intervalo 4), 64 capas, hidden 5120; torre de vision nativa + cabeza MTP |
| Parametros totales | 6.137.435.520 segun los metadatos de safetensors del repositorio; el nombre del repo y la model card declaran 27B (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | No aplica: la model card describe un modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens (declarados) |
| Tipos de cuantizacion | El nombre del repo indica EXL3 a 2,75 bpw con sufijo H4-V4; la model card describe pesos BF16 sin cuantizar. Variantes derivadas de la misma familia: FP8 en bloques, GGUF de 2 a 16 bits y MLX de 2/4/8 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors; la model card indica BF16, 18 shards, 55,6 GB, 1199 tensores. El repositorio ocupa 12,3 GB, coherente con una cuantizacion EXL3 pero no con BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con dimension oculta 5120 que sustituye la atencion completa en la mayoria de capas por Gated DeltaNet, un mecanismo de atencion lineal. Solo 16 de las 64 capas mantienen atencion completa, aplicadas con un intervalo de 4, lo que reduce el coste del *cache* de claves-valores y permite sostener contextos de 262.144 tokens. A esto se suma una torre de vision nativa (el pipeline declarado es image-text-to-text) y una cabeza MTP (*multi-token prediction*) que actua como mecanismo de decodificacion especulativa para acelerar la generacion.

Sobre los datos de entrenamiento no hay informacion en el material proporcionado: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o una fase de razonamiento con *thinking mode* (aunque el tag `reasoning` y la mencion a "flexible thinking control" sugieren que el base incorpora control de modo de razonamiento). La unica innovacion tecnica documentada en esta publicacion es la abliteracion: eliminacion de la direccion de rechazo del *residual stream* mediante ortogonalizacion, siguiendo a Arditi et al. (2024). No se documenta ninguna fase adicional de *fine-tuning* mas alla de esa intervencion sobre los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con control flexible de modo *thinking* (heredado del base).
- Capacidades de vision-lenguaje: entrada de imagen mas texto (pipeline image-text-to-text), con la torre visual completa preservada.
- *Function calling* / *tool calling*, segun los tags del repositorio.
- Razonamiento multi-paso y uso en agentes, apoyado en el soporte de herramientas.
- Decodificacion especulativa mediante la cabeza MTP, con los 15 tensores `mtp.*` preservados.
- Generacion de codigo y matematicas: presumiblemente heredadas del base, pero no hay evaluacion publicada en la informacion disponible.
- Ausencia deliberada de mecanismos de rechazo: responde a peticiones que el modelo original denegaria.
- No hay soporte de audio declarado en la informacion disponible.

## Casos de uso

- Investigacion sobre mecanismos de rechazo: comparar las activaciones internas del modelo abliterated frente al Qwen3.8-27B original para localizar y caracterizar la direccion de rechazo y su propagacion por las 64 capas.
- *Red-teaming* y evaluacion de robustez: generar ataques de *prompt* y respuestas adversarias para medir la eficacia de los clasificadores de seguridad propios antes de desplegarlos.
- Generacion de datos de entrenamiento para moderacion: producir pares de peticiones peligrosas y respuestas etiquetadas que alimenten un clasificador de contenido o un modelo de rechazo.
- Analisis de interpretabilidad con contexto largo: los 262.144 tokens permiten estudiar el comportamiento del modelo sobre documentos extensos y comprobar si la abliteracion degrada la coherencia a larga distancia.
- Investigacion en vision-lenguaje y seguridad multimodal: al conservar la torre visual, permite estudiar si la eliminacion de rechazo se transfiere del texto a las entradas de imagen.
- Evaluacion de cuantizacion: el repo, aparentemente en EXL3 a 2,75 bpw, sirve para medir la perdida de calidad en tareas de razonamiento y vision a precision muy baja frente al BF16 de origen.
- Experimentos controlados de agentes: con *tool calling* y MTP, evaluar el comportamiento de un modelo sin *guardrails* en bucles multi-paso (solo en entornos aislados y con supervision).
- Estudio de sesgos y toxicidad en ingles y chino, aprovechando el soporte bilingue declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- Pesos BF16 (55,6 GB segun la model card): no caben en una GPU de consumo. Requieren A100 80 GB, H100 80 GB o reparto en varias GPU (por ejemplo, 4x RTX 4090 de 24 GB o 2x A6000 de 48 GB) con *sharding*.
- Cuantizacion EXL3 a 2,75 bpw (repositorio de 12,3 GB): estimacion orientativa de unos 13-16 GB de VRAM solo para pesos, por lo que cabria en RTX 4090 / RTX 3090 (24 GB) o RTX 4080 (16 GB) con contexto moderado. Es una estimacion, no un dato publicado.
- GGUF de 2 bits (familia derivada): estimacion de ~8-9 GB, viable en GPU de 12 GB o en CPU con llama.cpp; a 16 bits se vuelve a los ~55 GB.
- MLX 4 bits para Apple Silicon: estimacion de ~16-18 GB de memoria unificada, viable en Mac con 24 GB o mas.
- VRAM de *cache* KV: no disponible con exactitud. La atencion hibrida (48 capas lineales de 64) reduce el *cache* notablemente frente a un transformer de atencion completa, pero no se publican cifras de cabezas ni de dimension por cabeza.
- Despliegue: transformers (libreria declarada), ExLlamaV3 para el formato EXL3, vLLM para la variante FP8, llama.cpp/Ollama para GGUF, MLX para Apple Silicon. El tag `endpoints_compatible` indica compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-2.75bpw-H4-V4 (este repo) | 6.137.435.520 en safetensors; 27B declarados | 262.144 | Abliterated + EXL3 2,75 bpw (segun nombre) | apache-2.0 | 0 descargas, 1 like |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion proporcionada | 262.144 (heredado) | Ninguna (alineado por seguridad) | apache-2.0 | Modelo oficial de referencia |
| Qwen3.8-27B-Uncensored-FP8 | no disponible | 262.144 (declarado) | Abliterated + FP8 en bloques para vLLM | apache-2.0 | Release derivado de OrcaRouter |
| Qwen3.8-27B-Uncensored-GGUF | no disponible | 262.144 (declarado) | Abliterated + GGUF de 2 a 16 bits | apache-2.0 | Release derivado de OrcaRouter |
| Qwen3.8-27B-Uncensored-MLX | no disponible | 262.144 (declarado) | Abliterated + MLX 2/4/8 bits | apache-2.0 | Release derivado de OrcaRouter |

No hay datos de benchmarks ni de otros modelos abliterated de terceros en la informacion disponible que permitan una comparacion de rendimiento real.

## Limitaciones y advertencias

- El modelo ha perdido la alineacion de seguridad: cumple peticiones daninas, poco eticas, ofensivas o ilegales que el modelo original rechazaria. No tiene *guardrails* funcionales.
- El propio autor advierte de que no debe desplegarse ante usuarios finales ni en produccion sin anadir capas propias de moderacion y prevencion de abuso.
- La abliteracion puede degradar capacidades generales (coherencia, razonamiento, seguimiento de instrucciones). No hay evaluaciones publicadas que cuantifiquen ese posible dano.
- Riesgo de alucinacion: no hay datos especificos para este *build*; se hereda el comportamiento del base, tambien sin medir aqui.
- Idiomas: solo ingles y chino declarados. El castellano no esta soportado oficialmente.
- Discrepancia de datos critica: el nombre del repositorio indica una cuantizacion EXL3 de 2,75 bpw, mientras que la model card describe pesos BF16 completos de 55,6 GB; el repositorio real ocupa 12,3 GB y los safetensors suman 6.137.435.520 parametros, no 27B. Conviene verificar los pesos antes de usarlos.
- Repositorio con 0 descargas y 1 like, publicado y actualizado el mismo dia: sin validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial en terminos de licencia, pero eso no exime de responsabilidad legal por el contenido generado ni de las obligaciones de moderacion.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo, por lo que no hay fuentes externas que corroboren la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-2.75bpw-H4-V4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Variante GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Variante MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Pagina del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Endpoint de API: https://api.orcarouter.ai/v1
- Catalogo de modelos: https://www.orcarouter.ai/models
- Web: https://www.orcarouter.ai
- GitHub: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia metodologica citada en la model card: Arditi et al. (2024), sobre eliminacion de la direccion de rechazo en modelos de lenguaje (enlace no proporcionado en la informacion disponible)
