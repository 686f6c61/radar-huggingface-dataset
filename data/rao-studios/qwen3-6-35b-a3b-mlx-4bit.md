# rao-studios/Qwen3.6-35B-A3B-mlx-4bit

## Resumen

Qwen3.6-35B-A3B-mlx-4bit es un espejo (mirror) del repositorio mlx-community/Qwen3.6-35B-A3B-4bit, publicado por rao-studios el 8 de noviembre de 2026. No se trata de un modelo nuevo ni de una cuantizacion propia: los pesos, el tokenizer, la plantilla de chat y la configuracion son byte a byte los del repositorio original, fijados al commit `38740b847e4cb78f352aba30aa41c76e08e6eb46`. El autor solo anade esta model card y una copia literal de la licencia Apache 2.0 del modelo upstream Qwen/Qwen3.6-35B-A3B.

El modelo subyacente es Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 40 capas, 35.107.181.936 parametros totales y 3.000 millones de parametros activos por token (de ahi el sufijo A3B). Soporta una longitud de contexto de 262.144 tokens y un pipeline image-text-to-text, por lo que incorpora capacidades multimodales de vision ademas de generacion de texto. La cuantizacion es de 4 bits con tamano de grupo 64, lo que reduce el peso a 20,4 GB de safetensors distribuidos en cuatro ficheros.

La relevancia de este repositorio es operativa mas que tecnica: existe para que cada instalacion de la aplicacion Adverb descargue exactamente los mismos bytes desde un repositorio controlado por Rao Studios, fijado a un commit concreto. Adverb lo emplea como "writer" para planificar un mes de publicaciones sociales, redactar paginas de movimiento en HTML/CSS con timeline determinista, generar subtitulos, guiones de voz en off y traducciones, todo en local sobre Mac. Cuando el modelo lee imagenes, revisa las hojas de contacto de cada pagina y sugiere correcciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe`, transformer MoE de 40 capas |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3.000 millones (aproximado, segun el sufijo A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (unica variante en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 2.090 tensores), libreria MLX |

## Arquitectura y entrenamiento

La arquitectura declarada en `config.json` es `qwen3_5_moe`, con 40 capas y diseno mixture-of-experts: 35.107 millones de parametros totales de los que aproximadamente 3.000 millones se activan por token. Esta relacion de activacion (en torno al 8,5 %) permite un coste de inferencia por token propio de un modelo de 3B mientras se conserva la capacidad representacional de un modelo de 35B. La cuantizacion a 4 bits con grupo de 64 aplicada por mlx-community reduce el peso a 20,4 GB, lo que lo hace viable en equipos Apple Silicon con memoria unificada de 24 GB o superior.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones de decodificacion especulativa o atencion lineal mas alla de lo implicito en la arquitectura Qwen3.5 MoE. La model card del espejo no aporta datos de entrenamiento; unicamente documenta el proceso de verificacion del espejo: comprobacion de que todos los ficheros son safetensors con cabeceras legibles y dtypes conocidos, verificacion de SHA-256 contra el commit de origen, ausencia de `auto_map` (codigo remoto) en config y tokenizer config, y descarte de `configuration.json` por ser metadatos de otro hub. El proceso se ejecuto con `Scripts/release/mirror-model.py` el 2026-11-08 antes de la subida.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento (thinking) segun la familia Qwen3.6.
- Codigo: el modelo upstream se posiciona explicitamente en "Agentic Coding", con manejo de flujos de frontend y razonamiento a nivel de repositorio.
- Vision: pipeline image-text-to-text; procesa imagenes (incluye `preprocessor_config.json` y `video_preprocessor_config.json`, lo que sugiere soporte de video en el procesador).
- Generacion de HTML y CSS, segun el caso de uso documentado por el autor (paginas de movimiento con timeline determinista).
- Traduccion multilingue y generacion de guiones de voz en off.
- Conversacional multi-turno con contexto muy largo (262.144 tokens).
- Preservacion de pensamiento (Thinking Preservation), segun la ficha de LM Studio para el modelo upstream.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este espejo concreto.

## Casos de uso

- Planificacion de contenido en redes sociales: Adverb lo usa para disenar un mes completo de publicaciones, distribuyendo temas y formatos a lo largo del calendario. El contexto de 262.144 tokens permite mantener en memoria el historial editorial completo y las guias de marca sin truncar.
- Generacion de paginas web de movimiento: produce HTML, CSS y una timeline determinista para cada dia, lo que exige coherencia entre el marcado, los estilos y la secuencia temporal; el modelo upstream esta optimizado para flujos de frontend.
- Redaccion de subtitulos y copy: genera textos cortos ajustados a cada plataforma a partir del plan mensual, manteniendo tono y consistencia entre piezas.
- Guiones de voz en off: redacta el texto que se sintetizara a voz, con control de duracion y ritmo derivado de la timeline generada.
- Traduccion de todo el material: al operar en local sobre Mac, permite traducir el plan, los subtitulos y los guiones sin enviar contenido a servicios externos.
- Revision visual automatizada: con las capacidades de vision, examina las hojas de contacto de cada pagina generada y emite correcciones concretas sobre composicion y legibilidad antes de publicar.
- Prototipado de aplicaciones de escritorio con IA local: cualquier desarrollador puede usar este repo como backend de inferencia en macOS mediante `mlx-lm`, sin dependencia de la nube, gracias a los 20,4 GB de pesos en 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas (MMLU, HumanEval, GSM8K u otras) y la busqueda web solo aporta enlaces a la pagina de Hugging Face del modelo upstream y a la ficha de LM Studio, sin cifras verificables.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 20,4 GB de pesos en 4 bits mas overhead de KV cache y activaciones. Con contexto de 262.144 tokens la cache puede crecer de forma significativa; para uso practico conviene reservar 24-32 GB de memoria unificada.
- GPU recomendadas: no es un modelo pensado para CUDA. La libreria es MLX, especifica de Apple Silicon. En equipos Apple, se recomienda M2 Pro/Max/Ultra o M3/M4 Pro/Max/Ultra con 24 GB o mas de memoria unificada.
- Cabe en GPU de consumo: si, en Apple Silicon de gama alta (M2 Max 32 GB, M3 Max 36 GB, M4 Max, M2 Ultra 64 GB o superior). No es desplegable en GPUs NVIDIA de consumo mediante este repo, ya que los pesos estan en formato MLX.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` documentado en la model card), `mlx_lm.server` para servicio HTTP, y la aplicacion Adverb que lo consume directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| rao-studios/Qwen3.6-35B-A3B-mlx-4bit | 35,1B totales / ~3B activos | 262.144 | 4 bits, grupo 64 | Apache 2.0 | safetensors MLX |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,1B totales / ~3B activos | 262.144 | 4 bits | Apache 2.0 | safetensors MLX |
| Qwen/Qwen3.6-35B-A3B | 35,1B totales / ~3B activos | no disponible | pesos completos | Apache 2.0 | safetensors |

El espejo de rao-studios es funcionalmente identico al de mlx-community: mismos bytes, mismo commit. La unica diferencia es la trazabilidad (hashes SHA-256 documentados en la card) y el pin a un commit concreto, lo que aporta reproducibilidad en despliegues. Frente al modelo original de Qwen, la diferencia es la cuantizacion a 4 bits y el formato MLX, que reduce el peso de forma sustancial a cambio de una perdida de precision no cuantificada en la informacion disponible.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por rao-studios: cualquier problema de calidad, sesgo o alucinacion proviene del modelo upstream Qwen3.6-35B-A3B y de la cuantizacion de mlx-community.
- La cuantizacion a 4 bits con grupo de 64 puede degradar tareas sensibles a precision numerica (matematicas, codigo muy estricto) respecto a los pesos completos; no hay evaluacion publicada de esa perdida.
- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo entrenado con datos web a gran escala, es esperable que herede sesgos de ese corpus, pero no hay analisis publicado en las fuentes consultadas.
- Riesgo de alucinacion: no cuantificado. En tareas de generacion de codigo y HTML/CSS conviene validar la salida antes de publicar.
- Idiomas: no disponibles en la ficha; el soporte multilingue real no esta verificado para este repo.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el aviso de copyright y la atribucion deben conservarse.
- Dependencia de Apple Silicon: al estar en formato MLX, no es portable a CUDA ni a CPU generica sin reconversion.
- Contexto de 262.144 tokens: aunque soportado, el coste de memoria de la KV cache a esa longitud puede superar la memoria disponible en equipos de 24 GB; conviene limitar el contexto efectivo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de su funcionamiento.

## Enlaces

- Repositorio del espejo: https://huggingface.co/rao-studios/Qwen3.6-35B-A3B-mlx-4bit
- Repositorio base (mlx-community): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Modelo upstream (Qwen): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
