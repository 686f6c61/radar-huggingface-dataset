# Avicennasis/K2-Horizon-0.9B-heretic-mlx-8bit

## Resumen

K2-Horizon-0.9B-heretic-mlx-8bit es una conversion cuantizada a 8 bits del modelo Avicennasis/K2-Horizon-0.9B-heretic, publicada por el usuario Avicennasis. Se trata de una variante "abliterated" (sin mecanismos de rechazo) del modelo base K2-Horizon-0.9B, empaquetada especificamente para el framework MLX de Apple, de modo que pueda ejecutarse en equipos con silicio de Apple (serie M). El repositorio incluye un modulo de arquitectura propio, `k2_horizon.py`, porque la libreria `mlx-lm` todavia no soporta de forma nativa la arquitectura `k2_horizon`.

El modelo cuenta con 1.078.285.824 parametros reales segun los pesos en safetensors (aproximadamente 1,08 mil millones, pese a la denominacion comercial "0.9B"), y ocupa alrededor de 1,1 GB en el repositorio gracias a la cuantizacion de 8 bits con tipo affine y tamano de grupo 64. Soporta los idiomas ingles y chino, y se distribuye bajo licencia Apache-2.0 heredada del modelo base.

Su relevancia actual es doble: por un lado, ofrece una opcion muy ligera para generacion de texto y conversacion en hardware de Apple sin GPU dedicada; por otro, ejemplifica el flujo de publicacion de checkpoints "uncensored" o abliterated, que eliminan el comportamiento de rechazo del modelo original. Es un checkpoint con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que debe considerarse experimental y de adopcion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (arquitectura personalizada; detalle interno no disponible) |
| Parametros totales | 1.078.285.824 (~1,08B) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, tamano de grupo 64 (MLX) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo personalizado (`custom_code` / `k2_horizon.py`) |

Datos adicionales del repositorio: modelo base `Avicennasis/K2-Horizon-0.9B-heretic`; libreria `mlx`; pipeline `text-generation`; tamano del repo 1,1 GB; creado el 2026-10-03; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo `k2_horizon`. Lo unico confirmado es que se trata de una arquitectura propia no soportada de forma nativa por `mlx-lm` (referencia al issue mlx-lm#1876), por lo que el repositorio incluye un modulo `k2_horizon.py` que es el port a MLX del archivo `modeling_k2_horizon.py` de IFM. Ese mismo modulo es el que utilizan los checkpoints de K2-Horizon distribuidos por `mlx-community`, y se distribuye bajo licencia MIT. Por tanto, no se puede confirmar si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida: ese dato no esta disponible.

En cuanto al entrenamiento, la model card del checkpoint cuantizado no aporta informacion sobre el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El unico elemento distintivo es que el modelo base ha sido sometido a un proceso de "abliteration", una tecnica que elimina el comportamiento de rechazo ajustando los pesos. El autor advierte explicitamente de que la abliteration elimina la *conducta* de rechazo y no afirma que el entrenamiento de seguridad haya sido revertido. No hay mas datos publicados sobre el pipeline de entrenamiento en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: `text-generation`; tag `conversational`).
- Uso previsto como modelo de chat, con plantilla aplicable mediante `tok.apply_chat_template`.
- Capacidad aritmetica basica demostrada en el ejemplo de la model card (multiplicacion simple, 17 x 23).
- Soporte multilingue limitado a ingles (en) y chino (zh).
- Comportamiento "uncensored": el proceso de abliteration elimina las respuestas de rechazo del modelo base.
- Ejecucion local en Apple Silicon mediante MLX, cargando la arquitectura personalizada con `trust_remote_code=True`.
- No hay evidencia de soporte de tool calling / function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, cadena de pensamiento explicita (thinking mode), vision ni audio.
- No se documentan capacidades de razonamiento avanzado ni de generacion de codigo.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede cargarse con `mlx-lm` y ejecutarse integramente en un equipo Apple Silicon, sin GPU dedicada ni conexion a internet, lo que resulta adecuado para prototipos de chat privados y de baja latencia.
- Procesamiento de texto bilingue ingles-chino: util para tareas sencillas de traduccion, resumen o reformulacion entre ambos idiomas, dado que son los unicos idiomas declarados.
- Fines de investigacion sobre abliteration: permite estudiar el efecto de la eliminacion de rechazos comparando este checkpoint con el modelo base sin abliterar.
- Generacion de texto en aplicaciones con recursos muy limitados: con ~1,1 GB de pesos, encaja en entornos con memoria unificada reducida en comparacion con modelos de mayor tamano.
- Experimentacion educativa con MLX y arquitecturas personalizadas: sirve como ejemplo practico de carga de un modelo con `custom_code` y `model_file` en `mlx-lm`.
- Tareas de prototipado rapido de chat y autocompletado donde no se requiere alta calidad ni contexto largo, asumiendo las limitaciones de un modelo de ~1B.
- No se recomienda para produccion critica ni para flujos que dependan de tool calling, ya que no hay evidencia de dichas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en 8 bits ocupan aproximadamente 1,1 GB (coincide con el tamano del repositorio). Sumando cache KV y activaciones, se estima un consumo en torno a 2-3 GB de memoria unificada, aunque no se dispone de cifras oficiales.
- Nota critica: MLX esta disenado para Apple Silicon. Este checkpoint concreto no se ejecuta de forma nativa en GPU NVIDIA o AMD; requiere un Mac con chip de la serie M.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o posterior) deberia poder cargarlo, dado su reducido tamano. No se dispone de datos de rendimiento por modelo especifico.
- GPU de consumo (RTX 4090, etc.): este checkpoint MLX no es compatible; para hardware NVIDIA habria que recurrir al modelo base o a una conversion distinta (por ejemplo GGUF), no incluida en la informacion disponible.
- Opciones de despliegue: `mlx-lm` cargando el repositorio con `trust_remote_code=True` y el modulo `k2_horizon.py` incluido. No se documentan opciones de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Se ofrecen referencias de modelos de tamano comparable, cuyos datos deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| K2-Horizon-0.9B-heretic-mlx-8bit | ~1,08B | no disponible | apache-2.0 | MLX, 8-bit, abliterated, solo Apple Silicon |
| Llama-3.2-1B | ~1,24B | 128k | Llama 3.2 (comunidad) | Transformer denso, amplio ecosistema |
| Qwen2.5-1.5B | ~1,54B | 32k | apache-2.0 | Multilingue amplio, buen rendimiento en codigo y matematicas |

La comparacion directa de rendimiento no es posible por ausencia de benchmarks publicados para el modelo tratado. La ventaja principal de este checkpoint es su formato nativo para MLX y su caracter abliterated; sus desventajas frente a las alternativas son el soporte limitado a dos idiomas, la falta de datos sobre contexto y la ausencia de validacion en benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad, por lo que no conviene asumir un nivel de rendimiento concreto.
- Riesgo de alucinacion elevado: se trata de un modelo de aproximadamente 1B de parametros, categoria en la que la tasa de errores factuales suele ser alta.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar conversaciones o documentos largos con garantias.
- Idiomas limitados: solo ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- Contenido sin filtro: la abliteration elimina el comportamiento de rechazo; el modelo puede generar contenido inapropiado, ofensivo o peligroso. El propio autor recomienda un uso responsable.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; al provenir de datos de entrenamiento no especificados, pueden heredarse sesgos de la fuente.
- Licencia: Apache-2.0 permite uso comercial, pero se debe revisar la licencia y los terminos del modelo base y del codigo `k2_horizon.py` (MIT) por separado.
- Dependencia de codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `k2_horizon.py` antes de usarlo en produccion.
- Naturaleza experimental: 0 descargas y 0 likes en el momento del analisis, sin validacion por parte de la comunidad.
- Incompatibilidad de plataforma: al ser un checkpoint MLX, no es portable directamente a entornos CUDA.

## Enlaces

- HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-0.9B-heretic-mlx-8bit
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-0.9B-heretic
- Issue de mlx-lm sobre la arquitectura k2_horizon: https://github.com/ml-explore/mlx-lm/issues/1876
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Otros enlaces (paper, blog, demo del autor): no disponibles en la informacion proporcionada.
