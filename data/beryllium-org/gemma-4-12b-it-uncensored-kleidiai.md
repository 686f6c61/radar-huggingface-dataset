# beryllium-org/gemma-4-12B-it-uncensored-KleidiAI

## Resumen

Gemma 4 12B IT Uncensored (KleidiAI) es una cuantizacion artesanal del fine-tune sin censura del modelo Gemma 4 12B IT de Google, publicada por el usuario beryllium-org en HuggingFace. El modelo base es un transformer denso de 12 mil millones de parametros con 48 capas y una ventana de contexto de 262.144 tokens, disenado para instrucciones y conversacion multirroundo. La particularidad de esta publicacion no es el fine-tune en si, sino el proceso de cuantizacion: una mezcla manual de tensores Q4_0 y Q8_0 optimizada para los kernels KleidiAI de ARM, en lugar de un pase estandar de `llama-quantize`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de cuantizacion orientada a hardware especifico (CPU ARM con KleidiAI), una tendencia creciente para desplegar modelos en dispositivos edge, portatiles con Snapdragon o servidores ARM. Por otro, incluye artefactos poco habituales en publicaciones comunitarias: un proyector multimodal en bf16 que cubre vision y audio, y un modulo de prediccion multi-token (MTP) para decodificacion especulativa. La licencia declarada es Apache 2.0, aunque el modelo base de Google tiene sus propios terminos de uso que conviene verificar.

El modelo se distribuye exclusivamente en formato GGUF y esta pensado para `llama.cpp`/`llama-server`. No se han publicado resultados de benchmarks ni detalles sobre el dataset de fine-tune en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), 48 capas |
| Parametros totales | 12B (aproximado, segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Mezcla Q4_0 / Q8_0 / F32 (274 tensores Q4_0, 55 Q8_0, 338 F32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada; verificar terminos del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo principal | 6,6 GB |
| Proyector multimodal | 168 MB (bf16, vision gemma4uv + audio gemma4ua) |
| Modulo MTP | 444 MB (Q8_0, 4 capas next-N) |
| Parametros de muestreo por defecto | top_k 64, top_p 0.95, temperature 1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 48 capas con 12B de parametros, correspondiente a la familia Gemma 4 de Google en su variante instruction-tuned. El modelo incorpora un proyector multimodal que anade codificadores de vision (gemma4uv) y audio (gemma4ua), lo que sugiere que el modelo base es nativamente multimodal o que el fine-tune preserva esas capacidades. Tambien incluye un modulo de prediccion multi-token (gemma4-assistant) con 4 capas "next-N" en Q8_0, pensado para decodificacion especulativa y aceleracion de la generacion.

No se dispone de informacion sobre el dataset de fine-tune sin censura, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. La cuantizacion, en cambio, si esta documentada: es una mezcla manual de 274 tensores en Q4_0 (24,3B elementos), 55 en Q8_0 (0,55B elementos) y 338 en F32 para normas y escalas, disenada especificamente para los kernels KleidiAI de ARM. El autor advierte que para arquitecturas no ARM es preferible usar Q4_K_S.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional (modelo IT).
- Razonamiento y respuesta a prompts complejos, con contexto de hasta 262K tokens.
- Capacidades multimodales de vision a traves del proyector `mmproj` (gemma4uv).
- Capacidades de audio a traves del mismo proyector (gemma4ua).
- Decodificacion especulativa mediante el modulo MTP de 4 capas, que acelera la generacion.
- Fine-tune "uncensored": menor rechazo a peticiones que el modelo base, aunque sin garantias formales.
- Compatibilidad con `llama.cpp` / `llama-server` para despliegue local.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible (el modelo base Gemma 4 IT probablemente lo soporta, pero no se documenta aqui).

## Casos de uso

- Despliegue en portatiles y dispositivos ARM: la cuantizacion KleidiAI esta optimizada para CPUs ARM con estos kernels, lo que permite ejecutar un modelo de 12B en equipos con Snapdragon X Elite o Apple Silicon sin GPU dedicada, con un archivo de solo 6,6 GB.
- Servidores edge y appliances: en entornos ARM de bajo consumo (por ejemplo, servidores basados en Ampere o Graviton) se puede servir el modelo con `llama-server` aprovechando los kernels KleidiAI para reducir latencia de prefill.
- Procesamiento de documentos con vision: usando el `mmproj` se pueden pasar imagenes (capturas, escaneos, diagramas) junto con texto para extraccion de informacion, gracias al codificador gemma4uv.
- Transcripcion y analisis de audio: el codificador gemma4ua permite tareas de comprension de audio integradas en el mismo pipeline de `llama.cpp`, util para resumen de reuniones o notas de voz.
- Generacion acelerada con decodificacion especulativa: el modulo MTP de 4 capas permite generar varios tokens por paso, reduciendo la latencia en produccion cuando el throughput importa (chat interactivo, autocompletado).
- Investigacion sobre alineacion y censura: al ser un fine-tune sin censura, sirve para estudiar diferencias de comportamiento frente al modelo base en tareas sensibles, con fines academicos y de evaluacion de seguridad.
- Asistentes locales con contexto largo: los 262K tokens permiten cargar repositorios de codigo, libros completos o historiales extensos en una sola ventana, util para resumen y Q&A sobre documentos largos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo principal ocupa 6,6 GB; con el proyector (168 MB) y el modulo MTP (444 MB) el total ronda los 7,2 GB. Para inferencia con contexto largo hay que sumar la cache KV, que puede crecer considerablemente con 262K tokens.
- GPU recomendadas: no se especifican; al ser una cuantizacion orientada a CPU ARM, el caso principal es ejecucion en CPU. En GPU, el autor recomienda Q4_K_S en lugar de esta mezcla.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) usando el backend CUDA de llama.cpp, aunque la cuantizacion no esta optimizada para ello.
- Despliegue: `llama.cpp` / `llama-server` (comando documentado en la model card). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La presencia del modulo MTP sugiere mejoras de velocidad mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT Uncensored (KleidiAI) | 12B | 262K | GGUF (Q4_0/Q8_0) | Apache 2.0 (declarada) | Cuantizacion manual para ARM, multimodal (vision+audio), MTP |
| Gemma 4 12B IT (base) | 12B | 262K | Safetensors / GGUF | Terminos de Google | Modelo original con alineacion estandar |
| Fine-tunes uncensored de 12B (genericos) | ~12B | Variable | GGUF | Variable | Sin optimizacion KleidiAI ni MTP documentado |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El fine-tune "uncensored" reduce los rechazos del modelo base, lo que aumenta el riesgo de generar contenido danino, sesgado o inexacto; no es adecuado para produccion sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 12B, especialmente en tareas de razonamiento largo o con contexto muy extenso.
- La cuantizacion Q4_0/Q8_0 degrada la calidad respecto al modelo en bf16; el autor recomienda Q4_K_S para arquitecturas no ARM.
- La optimizacion KleidiAI solo aporta ventajas en CPUs ARM; en x86 o GPU el rendimiento puede ser inferior al de otras cuantizaciones.
- La licencia Apache 2.0 es la declarada por el publicador, pero el modelo base Gemma de Google tiene terminos de uso propios que deben revisarse antes de uso comercial.
- No se documentan los idiomas soportados ni el dataset de fine-tune, lo que dificulta evaluar sesgos y cobertura linguistica.
- El contexto de 262K tokens implica un coste elevado de memoria para la cache KV; en equipos con poca RAM puede ser inviable.
- No hay benchmarks publicados que permitan validar la calidad del fine-tune frente al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beryllium-org/gemma-4-12B-it-uncensored-KleidiAI
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- KleidiAI (kernels ARM): https://github.com/ARM-software/kleidiai
