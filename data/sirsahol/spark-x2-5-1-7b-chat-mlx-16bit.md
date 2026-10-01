# SirSahOl/Spark-X2.5-1.7B-chat-mlx-16bit

## Resumen

Spark-X2.5-1.7B-chat-mlx-16bit es una conversion a formato MLX de 16 bits del modelo conversacional XHToken/Spark-X2.5-1.7B, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos originales en bfloat16, los convierte con mlx-lm 0.31.3 y los empaqueta en safetensors para que se ejecuten de forma nativa sobre la GPU unificada de los chips Apple Silicon (familias M1 a M4). El modelo subyacente declara 1.707.657.216 parametros reales y una arquitectura propietaria denominada Spark2_5ForCausalLM.

Su principal argumento tecnico es la ventana de contexto declarada de 1.048.576 tokens, un orden de magnitud por encima de lo habitual en modelos de ~1,7B, combinada con un peso en disco de unos 3,2-4,2 GB que lo hace manejable en equipos de consumo. Al ser una conversion sin cuantizar por encima del bfloat16, se posiciona como la variante de referencia para evaluacion y comparacion de calidad frente a las versiones de 4 y 8 bits del mismo autor.

La relevancia actual del repositorio es limitada pero concreta: cubre el nicho de inferencia local en macOS con MLX, un ecosistema que hasta hace poco carecia de cobertura amplia de modelos pequenos con contexto muy largo. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye informacion sobre datos de entrenamiento, idiomas soportados ni evaluaciones de calidad estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal, codigo personalizado, `custom_code`) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 1.048.576 tokens (declarado por el autor) |
| Tipos de cuantizacion | 16 bits sin cuantizar (bfloat16, media de 16,00 bits por peso). Existen variantes del mismo autor en 4 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, compatible con mlx-lm; no hay GGUF publicado por este autor) |
| Tamano del repositorio | 3,4 GB (tamano de salida de la conversion declarado: 3,2 GB) |
| Huella de VRAM en inferencia | ~4,2 GB; minimo recomendado 8 GB de memoria unificada |
| Modelo base | XHToken/Spark-X2.5-1.7B |
| Libreria | mlx (mlx-lm 0.31.3) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla del identificador `Spark2_5ForCausalLM`, registrado con `custom_code` en los tags de HuggingFace. Esto implica que la carga del modelo requiere `trust_remote_code=True` y que la implementacion de la atencion, la normalizacion y el tokenizador dependen de codigo publicado por el autor original (XHToken), no de una clase estandar de Transformers. Tampoco se documentan innovaciones como atencion lineal, decodificacion especulativa o mecanismos hibridos SSM.

Respecto al entrenamiento, no hay informacion disponible: se desconocen el numero de tokens, la composicion del dataset, la existencia de fases de ajuste por instrucciones (SFT), RLHF o DPO, y el proceso de alineacion conversacional. Lo unico verificable es el proceso de conversion, reproducible con `python3 -m mlx_lm.convert --hf-path XHToken/Spark-X2.5-1.7B --mlx-path output/Spark-X2.5-1.7B-mlx-16bit`, que tardo 14,51 segundos y genero pesos MLX sin cuantizar. La model card advierte de que se trata de una conversion "weight-only", es decir, que no se ha reentrenado ni calibrado ningun componente.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat basada en los tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste conversacional del modelo base (no documentado en detalle).
- Capacidad declarada de manejar secuencias de hasta 1.048.576 tokens, si bien el propio autor advierte que por encima de 32K tokens se requiere margen suficiente de memoria unificada.
- Inferencia nativa en GPU de Apple Silicon mediante MLX, sin necesidad de CUDA ni de capas de traduccion a Metal.
- Soporte de plantilla de chat programatica a traves de `tokenizer.apply_chat_template`.
- Capacidades de vision, audio, tool calling, function calling, agentes y modo de razonamiento extendido: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; no se declara ningun conjunto de idiomas.

## Casos de uso

- Asistentes conversacionales locales en macOS: el modelo se ejecuta integramente en la GPU unificada de un Mac con 8 GB o mas de memoria, sin enviar datos a la nube, lo que resulta adecuado para prototipos de chat con requisitos de privacidad.
- Procesamiento de documentos largos en local: la ventana declarada de 1.048.576 tokens permitiria, en teoria, resumir o consultar libros completos o bases de codigo extensas en una sola pasada; en la practica esta limitado por la memoria disponible, y el autor recomienda no superar los 32K tokens sin margen suficiente.
- Evaluacion y benchmarking de modelos: al ser la variante de 16 bits sin cuantizar, sirve como referencia de calidad para medir la degradacion introducida por las variantes de 4 y 8 bits del mismo autor.
- Generacion de texto y redaccion asistida en aplicaciones de escritorio: el modelo se integra mediante `mlx_lm.generate` o la API de Python en herramientas nativas de macOS.
- Investigacion sobre eficiencia en Apple Silicon: permite medir throughput y latencia de un modelo de 1,7B con contexto muy largo sobre chips M1 a M4, comparando entre precisiones de 4, 8 y 16 bits.
- Desarrollo de demos y pruebas de concepto offline: al ocupar 4,2 GB en disco y no requerir GPU dedicada, es viable desplegarlo en un portatil para demostraciones sin conexion.
- Experimentacion con arquitecturas de codigo personalizado: dado que la clase `Spark2_5ForCausalLM` es `custom_code`, el repositorio es un punto de partida para estudiar implementaciones no estandar en MLX.
- Servicio ligero de texto en un Mac de sobremesa: con la variante de 4 bits se alcanzan 46,62 tokens/s en un M1, suficiente para tareas interactivas de baja concurrencia.

## Benchmarks y rendimiento

La model card publica unicamente mediciones de rendimiento en inferencia sobre un Apple M1 con 8 GB de memoria unificada (media de 5 ejecuciones con 256 tokens maximos). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

| Metrica | 4 bits | 8 bits | 16 bits |
|---|---|---|---|
| Tokens/s | 46,62 | 21,4 | 11,59 |
| TTFT (tiempo hasta el primer token) | 21,45 ms | 46,76 ms | 86,35 ms |
| Memoria maxima | 1223,0 MB | 1042,8 MB | 90,0 MB |

Nota: los valores de memoria maxima de la tabla anterior proceden literalmente de la model card y resultan inconsistentes entre si (la variante de 16 bits, que ocupa mas en disco, reporta la cifra mas baja). Se reproducen tal cual, pero no deben tomarse como una estimacion fiable de consumo de memoria; la cifra de referencia declarada por el propio autor para esta variante es de ~4,2 GB de huella en VRAM.

## Requisitos de hardware

- Huella de VRAM de esta variante (16 bits): ~4,2 GB segun el autor; memoria unificada minima recomendada de 8 GB, aunque la tabla de recomendaciones del propio autor situa el 16 bits en equipos con 32 GB o mas.
- Variante de 8 bits: ~2,2 GB en disco y VRAM, recomendada para M1/M2/M3/M4 Pro o Max con 16 GB o mas.
- Variante de 4 bits: ~1,3 GB, la unica realmente comoda en Macs de 8 GB.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No hay soporte CUDA: no se ha publicado una version para GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: si, en el sentido de que cabe en la memoria unificada de un Mac de gama de entrada, pero no es ejecutable en una RTX 4090, A100 o H100 con este formato de pesos.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, o API de Python `mlx_lm.load`/`mlx_lm.generate`) y LM Studio con backend MLX. La model card incluye un Modelfile de Ollama, pero Ollama no carga safetensors MLX de forma nativa, por lo que ese procedimiento debe considerarse no verificado.
- Latencia y throughput medidos: 11,59 tokens/s y 86,35 ms de TTFT en 16 bits; 21,4 tokens/s y 46,76 ms en 8 bits; 46,62 tokens/s y 21,45 ms en 4 bits, todo sobre Apple M1 con 8 GB.
- Contexto largo: por encima de 32K tokens el propio autor advierte de que se necesita memoria unificada libre suficiente; no se publican mediciones de rendimiento ni de memoria a 1M de tokens.

## Comparativa con modelos similares

La comparativa se establece con alternativas de tamano equivalente (~1-2B) orientadas a inferencia local. Los datos de los modelos alternativos son de referencia general y no han sido verificados en la informacion proporcionada; conviene contrastarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia |
|---|---|---|---|---|
| Spark-X2.5-1.7B-chat-mlx-16bit | 1,7B | 1.048.576 tokens (declarado) | MLX safetensors, solo Apple Silicon | Apache 2.0 |
| XHToken/Spark-X2.5-1.7B (modelo base) | 1,7B | 1.048.576 tokens (declarado) | Transformers, multiplataforma (requiere `trust_remote_code`) | Apache 2.0 (segun el derivado) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens nativos (extensible con YaRN) | GGUF, safetensors, amplio soporte | Apache 2.0 |
| Llama-3.2-1B-Instruct | 1,2B | 128K tokens | GGUF, safetensors | Licencia comunitaria Llama 3.2 |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | GGUF, safetensors | Apache 2.0 |

Diferencias clave: frente a las alternativas, este repositorio ofrece una ventana de contexto declarada mucho mayor (1M frente a 8K-128K) y una licencia permisiva Apache 2.0, pero pierde en portabilidad (solo Apple Silicon), en madurez de ecosistema (codigo personalizado, sin GGUF del mismo autor) y en trazabilidad de calidad (no hay benchmarks publicados). Su valor relativo es mayor en el eje de contexto largo y menor en el de soporte y validacion.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K ni otras), por lo que no hay evidencia objetiva de su nivel de razonamiento, codigo o matematicas. El autor no documenta datos de entrenamiento ni proceso de alineacion.
- Riesgo de alucinacion no cuantificado: al no existir evaluaciones de fidelidad ni de tasa de alucinacion, debe asumirse un riesgo elevado en tareas factuales y tratarse la salida como no verificada.
- La ventana de 1.048.576 tokens es una cifra declarada por el autor sin mediciones de rendimiento asociadas. El propio autor advierte que por encima de 32K tokens hace falta memoria unificada libre, por lo que el contexto practico dista mucho del nominal.
- Idiomas soportados no declarados: se desconoce el comportamiento fuera del ingles y no hay garantia de calidad en castellano.
- Restriccion de plataforma: solo funciona en Apple Silicon con MLX. No hay soporte CUDA, ROCm ni CPU generica con este formato de pesos, y no se ha publicado una variante GGUF en este repositorio.
- Requiere `trust_remote_code` para cargar la clase personalizada `Spark2_5ForCausalLM`, lo que implica ejecutar codigo de terceros no auditado en el entorno de inferencia.
- La model card incluye un Modelfile de Ollama, pero Ollama no soporta de forma nativa pesos MLX; el procedimiento puede fallar. No esta verificado.
- Las cifras de memoria maxima de la tabla de benchmarks son inconsistentes con la huella de VRAM declarada y no deberian usarse para dimensionar hardware.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento mas alla de la fecha de creacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser una conversion de un modelo base de tercero conviene verificar tambien las condiciones del repositorio XHToken/Spark-X2.5-1.7B.

## Enlaces

- Repositorio HuggingFace (16 bits): https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-16bit
- Variante de 4 bits: https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-8bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su autor o su modelo base; los enlaces anteriores son los unicos disponibles.
