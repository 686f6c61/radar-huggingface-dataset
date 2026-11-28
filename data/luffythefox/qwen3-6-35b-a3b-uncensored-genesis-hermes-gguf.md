# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF

## Resumen
Genesis3.6-35B-A3B-Uncensored es una cuantizacion GGUF publicada por el usuario LuffyTheFox sobre el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez deriva de la familia Qwen3.6 de Alibaba. Se trata de un modelo de mezcla de expertos (MoE) con 34.660.610.688 parametros totales y aproximadamente 3B parametros activos por token, disenado para generacion de texto, razonamiento, codigo y tareas multimodales de imagen-texto. Su relevancia actual radica en que combina una ventana de contexto muy amplia (recomendada de 128K a 65536 tokens segun configuracion), soporte de tool calling y una variante "uncensored" que elimina las restricciones de contenido tipicas de los modelos alineados.

El autor aplica un procedimiento propio denominado "Genesis", descrito como una tecnica de regeneracion y calibracion de datos post-entrenamiento que opera directamente sobre los tensores del archivo GGUF mediante SVD personalizado. Segun la model card, el objetivo es reducir el "Noise Gate" (ruido acumulado durante el entrenamiento) sin tocar el conocimiento aprendido, corrigiendo pesos saturados, desajustes de escala, deriva de medias y bloques a cero. Ademas, el autor transfiere datos de un finetune sobre el dataset NousResearch/hermes-function-calling-v1 (alrededor de 2000 bloques de dos tensores FFN de expertos) al base sin censura de HauhauCS.

El modelo esta etiquetado como multimodal (pipeline image-text-to-text), soporta vision mediante un archivo mmproj separado y se distribuye bajo licencia Apache 2.0. Con 32.986 descargas y 13 likes en Hugging Face, esta orientado a desarrolladores que necesitan un modelo MoE eficiente en VRAM, con capacidades de agente y function calling, y sin filtros de contenido para casos de uso de investigacion o generacion creativa sin restricciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet linear + atencion), 256 expertos, 8 enrutados + 1 compartido por token |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por forward pass |
| Longitud de contexto | 65536 recomendado en LM Studio; minimo 128K recomendado para preservar capacidades de thinking |
| Tipos de cuantizacion | GGUF (incluye NVFP4 recomendado); otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 59.3 GB); requiere archivo mmproj para vision |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura MoE hibrida que combina capas Gated DeltaNet lineales con atencion tradicional, con 256 expertos en total y 8 expertos enrutados mas 1 compartido activados por token. Esta configuracion permite un coste computacional cercano a un modelo de ~3B parametros activos manteniendo la capacidad representacional de un modelo de ~35B. El modelo base Qwen3.6 incorpora modo "thinking" (razonamiento extendido) y modo no-thinking, con ajustes de muestreo diferenciados recomendados por los autores de Qwen.

El entrenamiento original de Qwen3.6 no esta detallado en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si se documenta es el post-procesamiento del autor: transferencia de datos desde un finetune sobre NousResearch/hermes-function-calling-v1 (aprox. 2000 bloques de dos tensores FFN de expertos) al base sin censura de HauhauCS, seguido del algoritmo Genesis. Este algoritmo opera en tres etapas: escaneo y reparacion del balance en tensores ssm_conv1d mediante SVD personalizado; deteccion y reduccion de ruido en tensores (excluyendo token_embd.weight, output.weight, ffn_gate_inp_shexp.weight, tensores 1D, bias y norms); y reemplazo de bloques a cero por chunks seleccionados segun la distribucion de pesos. El autor indica que el proceso se ejecuto en Google Colab gratuito con GPU Tesla T4.

## Capacidades
- Generacion de texto y razonamiento en modo thinking y no-thinking, con parametros de muestreo recomendados distintos para cada modo.
- Generacion de codigo y tareas precisas (recomendado temperature=0.6, top_p=0.95, top_k=20, min_p=0.01 en modo thinking).
- Capacidades multimodales de imagen-texto (pipeline image-text-to-text) mediante archivo mmproj.
- Soporte de tool calling / function calling, reforzado por el finetune sobre hermes-function-calling-v1.
- Capacidades de agente y razonamiento multi-paso, orientado a uso con Hermes agent.
- Capacidades multilingues: ingles, chino y otros idiomas (etiqueta multilingual).
- Generacion de SVG y contenido estructurado (ejemplo documentado de un pelicano en bicicleta).
- Modelo "uncensored": sin filtros de contenido alineados, orientado a investigacion y generacion sin restricciones.
- Compatible con endpoints (tag endpoints_compatible) y con llama.cpp mediante flag --jinja.

## Casos de uso
- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso gracias a su finetune sobre hermes-function-calling-v1 y su modo thinking, adecuado para orquestacion de tareas con APIs externas.
- Atencion al cliente multi-turno: con contexto de 65536 tokens (y hasta 128K recomendado) puede mantener conversaciones largas con historial extenso sin perder coherencia, aunque su naturaleza uncensored exige supervision en produccion.
- Generacion de codigo en pipelines: soporta modo thinking con parametros precisos (temperature=0.6) para tareas de coding, integrable en flujos de CI/CD mediante tool calling.
- Procesamiento de documentos con imagenes: al ser multimodal (image-text-to-text con mmproj), puede extraer informacion de capturas, diagramas o documentos escaneados combinando vision y texto.
- Investigacion sobre alineacion y modelos sin censura: util para estudiar comportamiento de modelos sin filtros, sesgos y riesgos, en entornos controlados.
- Despliegue en hardware de consumo: con cuantizacion NVFP4 y configuracion MoE en CPU, el autor reporta 30 tokens/s en una RTX 3060 de 12 GB, lo que permite prototipado local de asistentes y agentes.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido artistico donde los filtros de modelos alineados resultan limitantes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta un rendimiento de 30 tokens por segundo en una RTX 3060 de 12 GB con cuantizacion NVFP4 y configuracion especifica de LM Studio (MoE en CPU, GPU offload maximo, MoE Expert Cache de 4096 MiB, contexto 65536).

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; el repo GGUF ocupa 59.3 GB, por lo que las cuantizaciones de mayor precision requeriran decenas de GB, mientras que NVFP4 permite ejecucion parcial en GPU de 12 GB.
- GPU recomendadas: el autor documenta RTX 3060 de 12 GB con configuracion MoE en CPU; para offload completo se requieren GPUs de mayor VRAM (A100, H100) aunque no se especifican cifras exactas.
- Cabe en GPU de consumo: si, con cuantizacion NVFP4 y forzando pesos MoE a CPU en una RTX 3060 de 12 GB (30 tokens/s reportados).
- Opciones de despliegue: llama.cpp (con flag --jinja), LM Studio (configuracion detallada por el autor), y compatibilidad con endpoints; vLLM, TGI u Ollama no se mencionan explicitamente.
- Latencia y throughput: 30 tokens/s en RTX 3060 12 GB con NVFP4 y contexto 65536; otras configuraciones no documentadas.

## Comparativa con modelos similares
| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored (este) | ~35B | ~3B | 65536-128K | apache-2.0 | GGUF, multimodal, uncensored, MoE hibrida |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~35B | ~3B | no disponible | no disponible | Base sin censura del que deriva este modelo |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B | ~3B | no disponible | no disponible | Finetune Hermes usado como fuente de datos |
| Qwen3.6-35B-A3B (familia original) | ~35B | ~3B | no disponible | no disponible | Modelo original de Alibaba, alineado |

## Limitaciones y advertencias
- Modelo "uncensored": carece de filtros de contenido alineados, lo que implica riesgo de generar contenido ofensivo, ilegal o danino; requiere supervision y politicas de uso en produccion.
- Riesgo de alucinacion: la propia model card del autor senala que el ruido de entrenamiento provoca alucinaciones y verbosidad; aunque Genesis afirma mitigarlo, no hay benchmarks que lo verifiquen.
- El algoritmo Genesis y la tecnica de transferencia de datos no han sido validados de forma independiente ni publicados en un paper revisado por pares; el arxiv:2605.29843 referenciado no esta confirmado en la informacion disponible.
- Idiomas limitados a en, zh y multilingual generico; el rendimiento en castellano no esta documentado.
- Contexto: aunque se recomienda 128K para preservar el thinking, la configuracion practica documentada usa 65536; contextos mayores pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el caracter uncensored puede incumplir terminos de servicio de plataformas o normativas locales.
- Vision requiere el archivo mmproj adicional; sin el, el modelo funciona solo como texto.
- La model card incluye direcciones de donacion en criptomonedas y contacto personal, lo que no afecta a la licencia pero conviene tratar como informacion no tecnica.

## Enlaces
- Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes usado: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Chat template recomendada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/archive/qwen3.6/chat_template-v19.jinja
- System prompt: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/System_Prompt.txt
- Ejemplo SVG: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/pelikan.svg
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper referenciado (no verificado): arxiv:2605.29843
