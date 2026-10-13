# BOBBYBONKERSBFD/Sulphur-2-Prompt-Enhancer-Uncensored-GGUF

## Resumen

Sulphur-2 Prompt Enhancer Uncensored es un modelo derivado de SulphurAI/Sulphur-2-base, publicado en formato GGUF por el usuario BOBBYBONKERSBFD con cuantizaciones realizadas por PeppX. Su funcion concreta es actuar como "prompt enhancer": recibe una indicacion breve del usuario y la expande en un prompt detallado y descriptivo destinado a la generacion de video con LTX 2.3 / Sulphur-2. No es un modelo de generacion de video, sino un modelo de lenguaje que escribe el prompt que alimentara al generador.

El modelo hereda la arquitectura del Qwen3.5-9B multimodal (arquitectura declarada como `qwen35`), con 8.953.803.264 parametros totales, 32 capas, dimension de embedding de 4096 y una ventana de contexto declarada de 262.144 tokens. La variante distribuida aqui ha sido sometida a un proceso de "uncensoring" descrito como una combinacion de merges tipo Rimuru A+(B-C) con B=Hauhau, orientado a eliminar las restricciones de contenido del modelo original. Ademas, se distribuye un proyector de vision (`mmproj`) en BF16 que habilita la entrada de imagenes.

Su relevancia practica es acotada pero clara: permite ejecutar localmente, mediante llama.cpp, LM Studio o ComfyUI, un expansor de prompts sin censura y con capacidad de vision, sin depender de APIs externas. La licencia Apache 2.0 facilita su integracion en flujos de trabajo propios, incluyendo uso comercial, aunque el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer multimodal derivado de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (5,02 BPW), IQ4_NL (4,85 BPW), F16 GGUF (origen de la cuantizacion), BF16 safetensors (proyector de vision) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) para el modelo; safetensors BF16 como fuente original |
| Capas | 32 |
| Dimension de embedding | 4096 |
| Proyector de vision | `mmproj-prompt_enhancer_uncensored.gguf`, 880 MB, BF16 |
| Modelo base | SulphurAI/Sulphur-2-base |
| Metodo de uncensoring | Rimuru A+(B-C) merge, B=Hauhau |
| Tamano del repositorio | 12,0 GB |
| Descargas / likes | 206 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base. Lo que se documenta es el pipeline de conversion y cuantizacion: los pesos originales en safetensors BF16 se convirtieron primero a GGUF F16 y despues se cuantizaron con llama.cpp, sin recuantizacion intermedia, de modo que la fuente de las cuantizaciones Q4_K_M e IQ4_NL es un F16 limpio. La arquitectura declarada es `qwen35`, correspondiente a un transformer multimodal derivado de Qwen3.5-9B, con 32 capas y embedding de 4096. Se distribuye un proyector de vision independiente en BF16 que da soporte a entradas de imagen.

El rasgo tecnico distintivo es el proceso de "uncensoring", descrito en la model card como un merge Rimuru A+(B-C) con B=Hauhau. Se trata de una operacion de interpolacion de pesos entre modelos, aplicada para atenuar el comportamiento de rechazo del modelo original. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para esta variante. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en la expansion y el enriquecimiento de prompts.
- Transformacion de indicaciones cortas en prompts de video extensos y detallados para LTX 2.3 / Sulphur-2.
- Entrada multimodal de imagenes gracias al proyector `mmproj` distribuido aparte, lo que permite generar prompts a partir de una imagen de referencia.
- Generacion de contenido sin las restricciones habituales de los modelos alineados, segun el proceso de uncensoring aplicado.
- Ventana de contexto muy amplia (262.144 tokens), util para concatenar historiales largos de prompts o referencias extensas.
- Compatibilidad con llama.cpp, LM Studio y nodos de ComfyUI, con soporte de `endpoints_compatible` segun las etiquetas del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Enriquecimiento de prompts para text-to-video: el modelo toma una indicacion breve como "un coche en la lluvia" y la expande en una descripcion detallada con encuadre, iluminacion, movimiento de camara y estilo, que despues consume LTX 2.3 / Sulphur-2.
- Integracion en ComfyUI: colocando el GGUF y el `mmproj` en `ComfyUI/models/text_encoders/` o `ComfyUI/models/LLM/GGUF/` y usando el nodo ComfyUI-Qwen3.5-Uncensored, el modelo se convierte en un paso automatico del grafo de generacion de video.
- Generacion de prompts a partir de imagenes: con el proyector de vision activo, se puede alimentar una imagen de referencia y obtener el prompt textual correspondiente, util para replicar estilos o composiciones.
- Procesamiento por lotes de prompts: al poder ejecutarse con `llama-server` en local, permite enriquecer grandes volumenes de indicaciones sin coste por token ni limites de API, algo relevante en pipelines de produccion de video a escala.
- Asistencia a creadores de contenido: el modelo sugiere variaciones de un mismo prompt (planos, epoca del ano, paleta de color, lente) para explorar resultados distintos a partir de una idea base.
- Prototipado de interfaces creativas: dado su tamano moderado y su licencia Apache 2.0, se puede embeber en herramientas propias de escritorio o web que ayuden a redactar prompts de video.
- Investigacion sobre alineacion y merges de pesos: la variante "uncensored" con merge Rimuru resulta util como caso de estudio de como las tecnicas de interpolacion de pesos alteran el comportamiento de rechazo de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion especifica de calidad de prompts, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6,2 GB de pesos con Q4_K_M (5,3 GB) mas el proyector de vision (0,88 GB). El consumo final depende del contexto solicitado, ya que la ventana de 262.144 tokens hace que la cache KV crezca de forma muy significativa si se aprovecha completa.
- Para despliegue en FP16/BF16: aproximadamente 17,9 GB de pesos, mas el proyector, lo que exige GPU de 24 GB o superior.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4_K_M con contexto moderado; A100 40/80 GB o H100 para contexto largo o precision completa.
- Cabe en GPU de consumo: si. Con Q4_K_M o IQ4_NL entra en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) siempre que se limite la ventana de contexto. El proyector de vision anade 880 MB.
- Opciones de despliegue: llama.cpp y `llama-server` (comando documentado con `-ngl 99` para descargar todas las capas en GPU), LM Studio, y ComfyUI mediante el nodo ComfyUI-Qwen3.5-Uncensored. No se documenta soporte de vLLM ni TGI para estos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La tabla recoge unicamente las diferencias verificables entre el modelo base y las cuantizaciones publicadas.

| Modelo / variante | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Sulphur-2-base (prompt_enhancer_uncensored) | 8,95 B | 262.144 tokens | safetensors BF16 | apache-2.0 |
| Sulphur-2 Prompt Enhancer Uncensored Q4_K_M | 8,95 B | 262.144 tokens | GGUF, 5,3 GB, 5,02 BPW | apache-2.0 |
| Sulphur-2 Prompt Enhancer Uncensored IQ4_NL | 8,95 B | 262.144 tokens | GGUF, 5,1 GB, 4,85 BPW | apache-2.0 |
| Qwen3.5-9B (modelo de origen de la arquitectura) | 9 B aprox. | no disponible en esta busqueda | safetensors | no disponible en esta busqueda |

No se dispone de informacion sobre otros expansores de prompts comparables, por lo que la comparativa con alternativas de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles (`language: en`). No hay evidencia de capacidad multilingue, por lo que no es adecuado para generar prompts en castellano.
- Contenido sin filtrar: la variante "uncensored" ha sido modificada especificamente para reducir los rechazos, lo que implica que puede producir contenido sensible, ofensivo o inapropiado. Requiere controles de seguridad propios si se expone a usuarios finales.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad. Al tratarse de un modelo generativo de texto sin verificacion factual, puede introducir elementos no solicitados en los prompts expandidos.
- Especializacion estrecha: el modelo esta orientado a la expansion de prompts para LTX 2.3 / Sulphur-2. Su uso como asistente general, generador de codigo o modelo de razonamiento no esta documentado ni respaldado por evaluaciones.
- Trazabilidad limitada: el repositorio tiene 0 likes y 206 descargas, sin proceso de validacion independiente. El proceso de uncensoring (merge Rimuru A+(B-C) con B=Hauhau) no viene acompanado de evaluacion de degradacion de capacidades.
- Contexto nominal frente a contexto real: aunque se declaran 262.144 tokens, no se documenta el rendimiento efectivo en ventanas largas, y la cache KV correspondiente puede exceder la VRAM de GPUs de consumo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se aclaran las condiciones del modelo base Sulphur-2 ni el origen de los datos de entrenamiento, lo que puede afectar a una auditoria de cumplimiento en produccion.
- Compatibilidad: el uso en ComfyUI depende de un nodo de terceros (ComfyUI-Qwen3.5-Uncensored) mantenido por un autor externo, con el riesgo de mantenimiento que ello implica.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/BOBBYBONKERSBFD/Sulphur-2-Prompt-Enhancer-Uncensored-GGUF
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-2-base
- Carpeta del prompt enhancer sin censura dentro del modelo base: https://huggingface.co/SulphurAI/Sulphur-2-base/tree/main/prompt_enhancer_uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/PeppX
- Nodo de ComfyUI: https://github.com/Deaquay/ComfyUI-Qwen3.5-Uncensored

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los unicos enlaces disponibles son los incluidos en la model card y en los metadatos de HuggingFace.
