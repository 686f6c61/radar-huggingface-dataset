# Djam1998/Inkling-2-Mini-Unbound-v2-MLX-4bit

## Resumen

Inkling-2-Mini-Unbound-v2-MLX-4bit es una distribucion en formato delta para MLX del modelo abliterado nokeepai/Inkling-2-Mini-Unbound (v2), construida por el usuario Djam1998. No es un modelo entrenado desde cero ni un fine-tuning convencional: se trata de un parche de 120 tensores que se trasplantan sobre la version oficial mlx-community/Inkling-2-Mini-4bit para reproducir el efecto de la abliteracion sin necesidad de redistribuir los 17,3 GB del checkpoint completo. El repositorio pesa 0,4 GB y contiene unicamente patch.safetensors y un script de aplicacion.

El modelo subyacente es Inkling-2-Mini, una arquitectura MoE (mixture of experts) segun las etiquetas del repositorio, aunque la model card no detalla numero de parametros totales ni activos, longitud de contexto ni composicion del dataset de entrenamiento. La intervencion "Unbound" elimina los mecanismos de rechazo mediante edicion de direcciones en el bloque de atencion, de modo que el modelo sigue instrucciones daninas sin capa de seguridad posterior, segun advierte explicitamente el autor.

Su relevancia es practica para el ecosistema Apple Silicon: demuestra una tecnica de distribucion de variantes abliteradas como deltas de bajo peso, aplicables sobre checkpoints cuantizados a 4 bits en MLX. Requiere una PR no fusionada de mlx-lm (la numero 2086) para cargar la arquitectura inkling2, lo que limita su uso a entornos con esa revision fijada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) segun etiquetas del repo; detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido pruebas a 2k y 8k tokens) |
| Tipos de cuantizacion | MLX affine 4-bit, group_size 64 (delta); base en 4-bit; referencia Q8_0 GGUF en el proyecto padre |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); delta patch.safetensors de 0,35 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE, segun las etiquetas del repositorio. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se documenta con precision es la intervencion: la variante Unbound v2 difiere del modelo original en exactamente 120 tensores, todos en BF16 y todos ubicados en el bloque de atencion (q_proj, k_proj, v_proj, o_proj y gate_proj, 24 tensores cada uno). No se modifican tensores de expertos, router, embeddings ni lm_head, por lo que los expertos MoE permanecen byte-identicos a la release oficial.

La tecnica de abliteracion consiste en una edicion de direccion a gran escala sobre los pesos de atencion, que elimina la direccionalidad asociada al rechazo de peticiones. El autor senala que, al ser una edicion de gran magnitud, sobrevive a la recuantizacion a 4 bits de los 120 tensores transplantados, aunque el resultado no es bit-identico al checkpoint BF16/NVFP4 de nokeepai. El delta se almacena como 360 tensores (120 x weight, scales, biases) en MLX affine 4-bit con group_size 64, y se aplica en unos 20 segundos con 17,3 GB de escrituras locales en cuatro shards.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento explicito: la plantilla de chat acepta el parametro reasoning_effort y la salida incluye bloques de control (<|content_thinking|> y <|content_text|>) que deben separarse para extraer la respuesta.
- Razonamiento multi-paso: en las pruebas del autor, la variante v2 genera 482 tokens frente a 244 del modelo base en los mismos prompts, es decir, razona aproximadamente el doble.
- Codigo y matematicas: el proyecto padre reporta MMLU-300 de 76,0 y GSM8K-100 de 99 sobre el GGUF Q8_0 de referencia, lo que indica competencia en conocimiento general y aritmetica.
- Ejecucion de instrucciones sin rechazo: la tasa de marcadores de rechazo cae del 95 % en el modelo base al 20 % en esta variante sobre 40 prompts daninos.
- Inferencia local en Apple Silicon mediante MLX, con carga en 5,8 segundos y 17,3 GB residentes en un M1 Pro de 32 GB.
- Capacidades multilingues: no disponible.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Vision y audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el delta permite reproducir de forma controlada una variante sin rechazo sobre el mismo checkpoint base, facilitando estudios comparativos de comportamiento entre modelo alineado y abliterado con una diferencia de solo 120 tensores.
- Analisis de robustez de filtros: medir la tasa de marcadores de rechazo (95 % frente a 20 %) sirve para evaluar clasificadores de contenido y sistemas de moderacion frente a modelos que siguen instrucciones daninas.
- Red teaming local en macOS: al ejecutarse en MLX sobre un M1 Pro con 32 GB, permite montar entornos de prueba ofensiva en portatiles Apple sin GPU dedicada.
- Generacion de ficcion y contenido sensible en entornos controlados: el modo de razonamiento extendido (482 tokens de media) resulta util para narrativa que requiere desarrollo argumental largo, siempre con revision humana.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta el trasplante de deltas BF16 a affine 4-bit, un caso de estudio para medir cuanto sobrevive una edicion de pesos tras recuantizar.
- Experimentacion con arquitecturas MoE en MLX: sirve como banco de pruebas para la implementacion inkling2 de mlx-lm (PR 2086) antes de su fusion, incluyendo perfilado de prefill (175 tok/s a 2k) y generacion (17,4 tok/s).
- Docencia sobre mecanismos de rechazo: el contraste entre base y variante Unbound ilustra de forma tangible como se codifica el comportamiento de negativa en los pesos de atencion.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MMLU-300 | 76,0 | GGUF Q8_0 de nokeepai (referencia del proyecto padre, no de este build 4-bit) |
| GSM8K-100 | 99 | GGUF Q8_0 de nokeepai (referencia del proyecto padre, no de este build 4-bit) |
| Tasa de rechazo (40 prompts daninos) | 20 % | Este build; base 95 % |
| Tokens generados (mismos prompts) | 482 | Este build; base 244 |
| Prefill | 175 tok/s a 2k de contexto | M1 Pro, 32 GB |
| Generacion | 17,4 tok/s | M1 Pro, 32 GB; identico al 4-bit sin abliterar |
| Carga del modelo | 5,8 s, 17,3 GB residentes | M1 Pro, 32 GB |
| RAM pico a 8k de contexto | ~20,7 GB | M1 Pro, 32 GB |

No se han publicado resultados de benchmarks propios de este build 4-bit; las cifras de capacidad corresponden al checkpoint Q8_0 del proyecto padre.

## Requisitos de hardware

- VRAM/RAM unificada: 17,3 GB residentes en carga; aproximadamente 20,7 GB de pico con contexto de 8k. En Apple Silicon se comparte con la memoria del sistema.
- Hardware validado: Apple M1 Pro con 32 GB. Cualquier Mac con 24 GB o mas de memoria unificada deberia poder cargarlo, aunque no esta verificado en la informacion disponible.
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX y requiere mlx-lm; para CUDA habria que recurrir al checkpoint original de nokeepai en otro formato.
- Despliegue: mlx-lm fijando la PR #2086 (la arquitectura inkling2 no esta fusionada). El flujo es descargar el base de mlx-community/Inkling-2-Mini-4bit, descargar el delta y ejecutar apply.py con los directorios de entrada y salida.
- Latencia: generacion de 17,4 tok/s; el tiempo por respuesta es aproximadamente el doble que el del modelo base porque el modo de razonamiento produce mas tokens.
- Almacenamiento: 0,4 GB para el delta y 17,3 GB para el modelo resultante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Djam1998/Inkling-2-Mini-Unbound-v2-MLX-4bit | no disponible (MoE) | no disponible | MLX 4-bit (delta) | Apache 2.0 | Variante abliterada, requiere PR de mlx-lm |
| nokeepai/Inkling-2-Mini-Unbound | no disponible (MoE) | no disponible | BF16/NVFP4 y GGUF Q8_0 | no disponible | Modelo padre; MMLU-300 76,0 y GSM8K-100 99 |
| mlx-community/Inkling-2-Mini-4bit | no disponible (MoE) | no disponible | MLX 4-bit | no disponible | Base oficial sin abliterar; tasa de rechazo 95 % |

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: sigue instrucciones daninas por diseno. El autor lo advierte de forma explicita y no existe capa de seguridad posterior.
- No es bit-identico al checkpoint BF16/NVFP4 de nokeepai: los 120 tensores transplantados se recuantizan a 4 bits, lo que puede alterar ligeramente el comportamiento respecto al original.
- Dependencia de software inestable: requiere mlx-lm PR #2086, no fusionada; hay que fijar el commit para evitar roturas por cambios en la rama.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo de razonamiento extendido incrementa el numero de tokens generados y, con ello, la superficie de error.
- Salida en texto de control crudo: es necesario separar los bloques <|content_thinking|> y <|content_text|>; un parseo incorrecto devuelve la respuesta mezclada con el razonamiento.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas del entrenamiento original, que se desconoce.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero la ausencia de salvaguardas traslada al desplegador toda la responsabilidad legal y de cumplimiento.
- Cifras de capacidad no verificadas para este build: MMLU y GSM8K provienen del Q8_0 del proyecto padre, no de esta cuantizacion 4-bit.
- Repositorio con 0 descargas y 1 like: sin validacion por parte de la comunidad en el momento de la ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Djam1998/Inkling-2-Mini-Unbound-v2-MLX-4bit
- Modelo padre abliterado: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Base oficial MLX 4-bit: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- PR de mlx-lm requerida (inkling2): https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
