# dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-3.07bpw-H4-V6

## Resumen

El modelo identificado como `dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-3.07bpw-H4-V6` es una variante denominada "uncensored" (abliterated) del modelo base `Qwen/Qwen3.8-27B` de Alibaba/Qwen, publicada por el usuario `dr-housemd` y asociada al ecosistema OrcaRouter. La modificacion consiste en la eliminacion de la direccion de rechazo (refusal direction) mediante tecnicas de abliteracion, siguiendo el trabajo de Arditi et al. (2024), de forma que el modelo responde a peticiones que el modelo original rechazaria. Se distribuye bajo licencia Apache 2.0 y esta etiquetado como modelo de vision-lenguaje (`image-text-to-text`) con soporte de function calling, razonamiento y decodificacion especulativa mediante cabeza MTP.

Segun la model card del autor, el modelo base es un transformer denso de 27.000 millones de parametros con atencion hibrida (Gated DeltaNet de atencion lineal combinada con atencion completa), torre de vision nativa, contexto de 262.144 tokens y una cabeza MTP para decodificacion especulativa. La model card describe un build en BF16 completo de 55,6 GB repartido en 18 shards, mientras que el nombre del repositorio indica una cuantizacion EXL3 a 3,07 bits por peso. Existe una discrepancia relevante entre ambas fuentes que se detalla en la seccion de especificaciones tecnicas.

La relevancia de esta ficha es doble: por un lado, es un artefacto pensado para investigacion de seguridad de IA, interpretabilidad y red-teaming; por otro, su condicion de modelo sin alineacion de seguridad lo hace inadecuado para despliegue directo con usuarios finales sin capas adicionales de moderacion. El modelo tiene 0 descargas y 2 likes en el momento de la consulta, y fue creado y actualizado el 13 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), torre de vision nativa y cabeza MTP |
| Parametros totales | 6.683.366.784 segun los tensores safetensors publicados; la model card declara 27B (discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens (segun model card) |
| Tipos de cuantizacion | El repositorio se publica como EXL3 3,07 bpw (segun el identificador); la model card indica BF16 sin cuantizar. El autor referencia releases derivadas en FP8 (block-FP8 para vLLM), GGUF de 2 a 16 bits y MLX de 2, 4 y 8 bits |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (etiquetado tambien con `exl3`); la model card describe 18 shards, 1199 tensores, 55,6 GB |
| Tamano del repositorio | 13,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | `Qwen/Qwen3.8-27B` (relacion: finetune) |
| Precision declarada | BF16 en la model card |
| Componentes preservados | Torre visual completa (333 tensores `visual.*`) y cabeza MTP (15 tensores `mtp.*`) |
| Fecha de creacion | 2026-09-13 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 64 capas y dimension oculta de 5120. El bloque de atencion es hibrido: 48 capas emplean Gated DeltaNet (mecanismo de atencion lineal con estado recurrente, tipo SSM con compuertas) y 16 capas emplean atencion completa, con un intervalo de 4 entre capas de atencion completa. Esta combinacion busca reducir el coste de cache KV en contextos largos (hasta 262.144 tokens) manteniendo la capacidad de recuperacion precisa de la atencion completa. Ademas del stack de texto, el modelo incorpora una torre de vision nativa (modalidad image-text-to-text) y una cabeza de decodificacion especulativa MTP (Multi-Token Prediction), que permite proponer varios tokens por paso para acelerar la inferencia.

El proceso de adaptacion no es un entrenamiento desde cero ni un ajuste supervisado clasico: la model card indica explicitamente que la modificacion es abliteracion sobre los pesos BF16, es decir, la ortogonalizacion de la direccion de rechazo en el residual stream siguiendo a Arditi et al. (2024), sin cuantizacion en la release BF16. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o RL posterior. Tampoco se especifica el conjunto de datos usado para calibrar la direccion de rechazo ni el metodo exacto de evaluacion de la eliminacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con control flexible del modo "thinking" (la model card menciona control flexible del razonamiento).
- Comprension de imagenes: pipeline `image-text-to-text` con torre de vision preservada (333 tensores `visual.*`).
- Function calling / tool calling, segun los tags del repositorio.
- Capacidades orientadas a agentes y razonamiento multi-paso, por la combinacion de tool calling y modo de razonamiento.
- Decodificacion especulativa mediante cabeza MTP (15 tensores `mtp.*`), pensada para acelerar la generacion.
- Comportamiento sin rechazo: responde a peticiones que el modelo base alineado rechazaria (abliterated, uncensored).
- Contexto largo de hasta 262.144 tokens.
- No se documentan capacidades de audio ni de generacion de imagenes.

## Casos de uso

- Investigacion de mecanismos de rechazo: el modelo permite estudiar como se representa internamente la negativa a responder, comparando activaciones y direcciones del residual stream frente al modelo base alineado, gracias a que la unica modificacion es la abliteracion.
- Red-teaming y evaluacion de robustez: sirve como generador adversario para producir prompts y respuestas que pongan a prueba los filtros de seguridad de otros sistemas, un uso coherente con los tags `ai-red-team` y `red-teaming`.
- Generacion de datasets de seguridad: al eliminar la barrera de rechazo, facilita la creacion de corpus etiquetados de contenido sensible para entrenar clasificadores de moderacion y detectores de dano.
- Interpretabilidad mecanicista: con 64 capas y arquitectura hibrida, es util para analisis de circuitos y de representaciones internas, con la ventaja de que la torre de vision y la cabeza MTP se conservan intactas.
- Base para post-entrenamiento propio: la model card lo describe como los pesos fuente recomendados para SFT, DPO y RL, ya que no esta cuantizado y mantiene todos los componentes auxiliares.
- Re-cuantizacion y despliegue optimizado: al ser el origen de las releases FP8, GGUF y MLX, es la referencia para generar nuevas cuantizaciones adaptadas a vLLM, llama.cpp o Apple Silicon.
- Experimentos controlados con contexto largo: los 262.144 tokens permiten probar tecnicas de recuperacion y resumen sobre documentos extensos o flujos de trabajo con muchas imagenes.
- Analisis de decodificacion especulativa: la cabeza MTP preservada permite comparar tasas de aceptacion y latencia frente a la decodificacion autoregresiva estandar en un modelo de esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni similares, y la busqueda web asociada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano de los pesos y del contexto declarado, no mediciones publicadas por el autor:

- Inferencia con el peso real de 6.683.366.784 parametros en BF16: aproximadamente 13,4 GB de pesos, mas cache KV y overhead del runtime, lo que situa el consumo tipico en el rango de 15 a 18 GB de VRAM.
- Inferencia con la configuracion de 27B en BF16 descrita en la model card (55,6 GB): requiere al menos una GPU de 80 GB (H100 80 GB, A100 80 GB) o reparto en dos GPU de 40 GB (A100 40 GB) con tensor parallelism.
- Cuantizacion EXL3 a 3,07 bpw: reduce de forma sustancial el peso respecto a BF16, lo que hace viable el despliegue en GPU de consumo con 16-24 GB de VRAM, aunque el repositorio ocupa 13,4 GB en total.
- GPU de consumo: el modelo cabe en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB) en cuantizaciones bajas, y en Apple Silicon mediante las variantes MLX de 2, 4 y 8 bits.
- Contexto de 262.144 tokens: la atencion hibrida (48 de 64 capas con Gated DeltaNet lineal) reduce el coste de cache KV frente a un transformer completamente atencional, pero el contexto maximo seguira exigiendo memoria adicional significativa.
- Opciones de despliegue: transformers (formato del repositorio), vLLM para la release block-FP8, llama.cpp para los GGUF, MLX para Apple Silicon, ExLlamaV3 para los pesos EXL3 y el endpoint HTTP de OrcaRouter (`api.orcarouter.ai/v1`).
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para mejorar el throughput mediante decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables de terceros con datos verificables. La comparacion se limita al modelo base y a las releases derivadas del mismo autor.

| Modelo | Parametros | Contexto | Modificacion | Licencia | Formato |
|---|---|---|---|---|---|
| `dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-3.07bpw-H4-V6` | 6,68B segun safetensors; 27B declarados | 262.144 | Abliterado, segun identificador en EXL3 3,07 bpw | Apache 2.0 | safetensors / exl3 |
| `Qwen/Qwen3.8-27B` (base) | 27B (declarado) | 262.144 | Alineado de fabrica | Apache 2.0 | no disponible |
| `orcarouter/Qwen3.8-27B-Uncensored-FP8` | 27B (declarado) | 262.144 | Abliterado, block-FP8 para vLLM | Apache 2.0 | FP8 |
| `orcarouter/Qwen3.8-27B-Uncensored-GGUF` | 27B (declarado) | 262.144 | Abliterado, GGUF de 2 a 16 bits | Apache 2.0 | GGUF |
| `orcarouter/Qwen3.8-27B-Uncensored-MLX` | 27B (declarado) | 262.144 | Abliterado, MLX 2/4/8 bits | Apache 2.0 | MLX |

## Limitaciones y advertencias

- Eliminacion sustancial de la alineacion de seguridad: el modelo cumple con peticiones daninas, poco eticas, ofensivas o ilegales que el modelo base rechazaria. No dispone de salvaguardas integradas significativas.
- Uso previsto restringido por el propio autor a investigacion legitima: interpretabilidad, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez y experimentos controlados.
- Prohibicion practica de despliegue directo: la model card indica que no debe exponerse a usuarios finales ni ponerse en produccion sin anadir capas propias de seguridad, moderacion y prevencion de abuso.
- Responsabilidad legal integra del usuario: el autor declina toda responsabilidad por el uso y por los contenidos generados, que no reflejan las opiniones de los publicadores ni de Qwen/Alibaba.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de tasas de alucinacion para esta variante; la abliteracion puede alterar el comportamiento en dominios sensibles de forma no medida.
- Discrepancia de datos critica: el recuento real de parametros en safetensors (6.683.366.784) no coincide con los 27B declarados en la model card ni con el tamano de repo de 13,4 GB. Hay que verificar el contenido real del repositorio antes de planificar recursos.
- Cobertura de idiomas limitada: solo ingles y chino estan declarados. No hay garantia de calidad en castellano ni en otros idiomas.
- Ausencia de benchmarks: no hay datos publicados que permitan estimar la degradacion de capacidades causada por la abliteracion ni comparar con el modelo base.
- Adopcion nula: 0 descargas y 2 likes, sin validacion independiente por parte de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card condiciona el uso a investigacion legitima y a la incorporacion de capas de seguridad propias, lo que genera tension entre la licencia y las condiciones de uso declaradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dr-housemd/orcarouter-Qwen3.8-27B-Uncensored-exl3-3.07bpw-H4-V6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release derivada FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Release derivada GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Release derivada MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Ficha del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Endpoint de API: https://api.orcarouter.ai/v1
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catalogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Repositorio GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Servidor de Discord: https://discord.gg/yAh6Tex6kx
- Perfil en X: https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia de abliteracion citada en la model card: Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction" (enlace directo no disponible en la informacion proporcionada).
