# nace-ai/Qwen3.5-9B-MLX-4bit-KQuant

## Resumen

Qwen3.5-9B-MLX-4bit-KQuant es una cuantizacion de 4 bits del modelo Qwen/Qwen3.5-9B, publicada por el usuario nace-ai dentro del ecosistema MLX de Apple. El modelo base es un transformer multimodal de Qwen con 9.409.813.744 parametros (aproximadamente 9.400 millones), orientado a tareas de imagen-texto-a-texto y conversacion. Esta version emplea el formato de cuantizacion propietario KQuant, que busca acercarse mas al modelo original en bf16 que un empaquetado estandar de MLX.

La relevancia de esta publicacion radica en su metodo de construccion: frente a la cuantizacion MLX convencional, que redondea cada grupo de 64 pesos al escalon mas cercano de una escala fijada por el minimo y el maximo del grupo, KQuant prueba 11 rangos de recorte por grupo, reajusta la escala y el offset mediante minimos cuadrados ponderados por la activacion de cada canal de entrada sobre 128 textos de calibracion, y conserva el de menor error ponderado. Segun la model card, esto reduce la divergencia KL respecto al modelo bf16 de 0,081 a 0,037 y eleva la precision en GSM8K de 0,927 a 0,944.

El resultado es un paquete de 5,95 GB que conserva la torre de vision y todos los ficheros auxiliares identicos a los del empaquetado estandar, de modo que puede servirse con la herramienta Kapitsa del mismo autor o con el resto del ecosistema MLX. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la informacion publicada sobre el modelo base es escasa en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de la arquitectura interna no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, formato MLX con grupo de 64; variante KQuant |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (4-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-9B es un transformer multimodal de la familia Qwen 3.5, con capacidad de procesar imagen y texto y generar texto (pipeline image-text-to-text). La model card de esta cuantizacion no detalla la arquitectura interna del modelo base (numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa), por lo que esos datos deben considerarse no disponibles en esta ficha.

El proceso de cuantizacion si esta documentado con detalle. La cuantizacion MLX estandar redondea cada grupo de 64 pesos al escalon mas cercano de una escala determinada por el minimo y el maximo del grupo. KQuant, en cambio, explora 11 rangos de recorte por grupo, reajusta la escala y el offset mediante minimos cuadrados ponderados por la intensidad con que cada canal de entrada se activa sobre 128 textos de calibracion (el conjunto por defecto de mlx-lm) y selecciona el rango con menor error ponderado. La calibracion KL se midio sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval, comparando contra Qwen/Qwen3.5-9B en la revision c2022362. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF o DPO).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Procesamiento de imagen y texto combinados (image-text-to-text), con torre de vision incluida en el paquete cuantizado.
- Razonamiento matematico: la model card reporta evaluacion en GSM8K con modo "thinking off" y decodificacion greedy.
- Generacion de codigo: se empleo HumanEval como parte del conjunto de calibracion y evaluacion de la divergencia KL.
- Modo de razonamiento ("thinking") presente en el modelo base, segun la referencia a "thinking off" en la evaluacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede servirse con `kapitsa serve --model 9b` en un Mac con chip Apple Silicon, gestionando conversaciones multi-turno sin conexion a servicios en la nube y con un peso en disco de 5,95 GB.
- Analisis de documentos con imagenes: al conservar la torre de vision, permite extraer y razonar sobre contenido de capturas, diagramas o formularios combinados con instrucciones textuales en un flujo unico.
- Prototipado rapido de aplicaciones multimodales: al estar en formato MLX y contar con una CLI de instalacion via Homebrew, es adecuado para validar ideas en local antes de escalar a infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar KQuant frente al empaquetado estandar de lmstudio-community usando las mismas herramientas y los mismos ficheros auxiliares, aislando el efecto de los pesos cuantizados.
- Generacion de codigo asistida en entornos de desarrollo para macOS: el modelo se evaluo sobre HumanEval y puede integrarse en editores o scripts locales que consuman el servidor de Kapitsa.
- Razonamiento matematico de nivel escolar y competicion basica: con un 0,944 en GSM8K zero-shot, es util para tutoria automatizada o verificacion de problemas aritmeticos en local.
- Despliegue en portatiles con memoria unificada: con 48 GB de memoria unificada (M5 Pro) se obtienen tasas de decodificacion de 140-149 tokens por segundo, lo que habilita asistentes interactivos en tiempo real sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | lmstudio-community/Qwen3.5-9B-MLX-4bit | KQuant 4-bit (este repo) |
|---|---|---|
| Peso de los pesos | 5,95 GB | 5,95 GB |
| Divergencia KL respecto a bf16 (menor es mejor) | 0,081 | 0,037 |
| GSM8K (1.319 preguntas, zero-shot, greedy, thinking off) | 0,927 | 0,944 |
| Decodificacion en M5 Pro con Kapitsa (tok/s) | 131 / 144 | 149 / 140 |

Notas metodologicas de la model card: la KL es la media sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval frente a Qwen/Qwen3.5-9B en la revision c2022362. La decodificacion se midio con Kapitsa 0.2.33 (revision 7c511224) con su drafting por defecto, en un MacBook Pro M5 Pro de 48 GB conectado a corriente, con dos ejecuciones intercaladas por paquete y respuestas de 512 tokens. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el paquete de pesos ocupa 5,95 GB; con overhead de ejecucion en MLX conviene disponer de al menos 8-10 GB de memoria unificada para contexto corto, y mas para contextos largos o respuestas extensas.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4, M5). En la model card se reportan mediciones en un MacBook Pro con M5 Pro y 48 GB de memoria unificada.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el formato MLX no esta pensado para CUDA.
- Cabe en consumer hardware: si, en equipos Apple Silicon con memoria unificada suficiente; el rendimiento medido de 140-149 tok/s se obtuvo en un M5 Pro de 48 GB.
- Opciones de despliegue: Kapitsa (CLI del autor, instalable con `brew install nace-ai/tap/kapitsa` y arrancable con `kapitsa serve --model 9b`); el ecosistema MLX (mlx-lm) es compatible por formato. vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible para este formato.
- Latencia y throughput: 149 y 140 tok/s en decodificacion segun las dos ejecuciones intercaladas reportadas en M5 Pro con Kapitsa 0.2.33 y respuestas de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | KL vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-4bit-KQuant | 9.409.813.744 | No disponible | 4-bit KQuant (MLX) | 0,944 | 0,037 | Apache 2.0 | Hugging Face |
| lmstudio-community/Qwen3.5-9B-MLX-4bit | No disponible | No disponible | 4-bit MLX estandar | 0,927 | 0,081 | No disponible en esta ficha | Hugging Face |
| Qwen/Qwen3.5-9B (bf16) | No disponible | No disponible | bf16 (referencia) | No disponible | 0 (referencia) | Apache 2.0 (segun este repo) | Hugging Face |

La comparativa se limita al modelo base y al empaquetado estandar de MLX citados en la model card. No se dispone de datos de otros modelos de tamano similar (por ejemplo, alternativas de 7-10B de otras familias) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredarse del modelo base Qwen3.5-9B, los sesgos de ese modelo se trasladan a esta cuantizacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion introduce una divergencia KL de 0,037 respecto al bf16, lo que implica una degradacion medible aunque pequena en la distribucion de salida.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la model card; deben consultarse en la ficha del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia efectiva del modelo base Qwen/Qwen3.5-9B, ya que esta ficha solo refleja lo declarado por el autor de la cuantizacion.
- Dependencia de herramienta: el flujo documentado depende de Kapitsa, una CLI del mismo autor con version concreta (0.2.33, revision 7c511224); cambios de version pueden alterar el rendimiento medido.
- Plataforma: el formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversion previa.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de los resultados declarados.
- Los benchmarks reportados (GSM8K y KL) proceden del propio autor de la cuantizacion y no han sido replicados de forma independiente en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Empaquetado de referencia: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
