# AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-GGUF es una cuantizacion PTQ1_0 (ternaria) del modelo base Ternary-Bonsai-2.5-27B de PrismML, publicada por AtomicChat. Se distribuye como un unico fichero GGUF de 5.993.834.848 bytes (aproximadamente 5,99 GB) que incorpora una proyeccion residual directamente en los codigos ternarios, de modo que el modelo puede cargarse de forma autonoma sin el GGUF original. El autor lo presenta como una variante "uncensored": elimina el comportamiento de rechazo del modelo de partida mediante una modificacion de pesos en lugar de un adaptador LoRA en tiempo de inferencia.

La relevancia tecnica del artefacto esta en el metodo de edicion: el "compact bake" altera 12.461.746 codigos ternarios en 36 matrices residuales (capas 27-44), preservando intactos la cabecera del GGUF, todas las escalas de bloque FP16 y cualquier byte fuera de esas matrices. El resultado mantiene exactamente el mismo tamano de fichero que el PTQ1_0 original y se ejecuta con el fork de llama.cpp de PrismML.

Conviene senalar una discrepancia en los metadatos de Hugging Face: el campo de parametros totales declarado en safetensors es 2.162.688, un valor incompatible con la denominacion "27B" y con un fichero de casi 6 GB en formato ternario. La model card no aclara esta cifra, por lo que se trata como dato no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Transformer, inferido del formato GGUF y del pipeline text-generation; no confirmado en la informacion) |
| Parametros totales | no disponible de forma fiable (metadatos declaran 2.162.688, incoherente con la denominacion 27B y el tamano del fichero) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (ternaria, 1 bit por peso con escalas de bloque FP16); adaptador LoRA adicional de 8,67 MB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 5.993.834.848 bytes; LoRA en GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ternary-Bonsai-2.5-27B de PrismML en la documentacion proporcionada: no se detalla el tipo de transformer, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento. Lo unico deducible es que el modelo original fue sometido a un proceso de cuantizacion post-entrenamiento (PTQ) a formato ternario PTQ1_0, con escalas de bloque en FP16, y que la variante publicada por AtomicChat modifica los pesos de 36 matrices "residual-writer" en las capas 27-44.

La innovacion tecnica del artefacto es el "compact bake": en lugar de aplicar un LoRA en tiempo de inferencia, se reescriben los codigos ternarios de esas matrices para incorporar la proyeccion residual, manteniendo el mismo tamano de fichero y sin tocar las escalas. El autor documenta que el cambio afecta a 12.461.746 codigos y que todos los bytes fuera de las matrices editadas son identicos al PTQ1_0 original. No se especifica si hubo RLHF, DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, modo `-cnv` en llama-cli).
- Comportamiento "uncensored": segun la model card, el build compacto obtuvo 0/24 en un conjunto retenido de prompts de rechazo, frente a 24/24 del modelo original.
- Razonamiento y conocimiento general evaluado mediante MMLU (81,2% en una muestra de 500 preguntas).
- Ejecucion local y offline mediante el fork de llama.cpp de PrismML.
- Soporte de adaptador LoRA en tiempo de inferencia (fichero separado de 8,67 MB, escala recomendada 1,25).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: el fichero de 5,99 GB cabe en GPU de consumo con 8-12 GB de VRAM y permite inferencia offline sin dependencia de API, adecuado para entornos con requisitos de privacidad.
- Experimentacion con cuantizacion ternaria: util como banco de pruebas para investigar el impacto de PTQ1_0 en calidad frente a FP16, dado que el autor publica comparativas MMLU y hash de evaluacion.
- Evaluacion de tecnicas de edicion de pesos: el "compact bake" sobre 36 matrices residuales sirve como caso de estudio reproducible de modificacion de comportamiento sin cambiar el tamano del fichero.
- Investigacion sobre alineacion y rechazo: la comparativa 0/24 frente a 24/24 en prompts de rechazo permite estudiar como la edicion de capas tardias afecta a las politicas de seguridad del modelo.
- Generacion de texto creativo sin filtros: para proyectos donde el comportamiento de rechazo del modelo base resulta limitante, con la advertencia de los riesgos asociados.
- Prototipado rapido en aplicaciones de escritorio: integrable en clientes tipo Atomic Chat que cargan GGUF directamente con llama.cpp.

## Benchmarks y rendimiento

| Benchmark | Compact PTQ1_0 (este repo) | PTQ1_0 original | LoRA a escala 1,25 |
|---|---|---|---|
| MMLU (muestra de 500) | 406/500 (81,2%) | 401/500 (80,2%) | 80,2% |
| Refusal screen (prompts de rechazo) | 0/24 | 24/24 | no disponible |
| Refusal screen (prompts ordinarios) | 0/24 | 0/24 | no disponible |

En preguntas emparejadas, el build compacto gano 10 respuestas correctas y perdio 5 respecto al original (McNemar exacto, p = 0,30). El autor advierte que las 48 respuestas del refusal screen fueron clasificaciones de respuesta inicial y que el limite de 48 tokens trunco 24/24 y 23/24 respuestas respectivamente. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para el fichero PTQ1_0 completo con todas las capas en GPU (`-ngl 99`), mas overhead de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, incluidas gamas medias con 8 GB.
- Opciones de despliegue: exclusivamente el fork de llama.cpp de PrismML (release prism-b12128-d7b2896); no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored (este) | no disponible (nominal 27B) | no disponible | PTQ1_0 ternaria | 81,2% (500 preguntas) | Apache 2.0 | GGUF, fork PrismML de llama.cpp |
| Ternary-Bonsai-2.5-27B (PrismML) | no disponible (nominal 27B) | no disponible | PTQ1_0 ternaria | 80,2% (500 preguntas) | Apache 2.0 | GGUF, fork PrismML de llama.cpp |
| Ternary-Bonsai-2.5-27B-Uncensored-LoRA | no disponible (nominal 27B) | no disponible | PTQ1_0 + LoRA | 80,2% (escala 1,25) | Apache 2.0 | GGUF + adaptador LoRA |

No se dispone de informacion sobre otros modelos ternarios comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar el comportamiento de rechazo (0/24 en el refusal screen), lo que implica un riesgo elevado de generar contenido danino, ilegal o inseguro sin filtros.
- La supresion del rechazo se evaluo con solo 24 prompts y respuestas truncadas a 48 tokens; la robustez del efecto en conversaciones largas no esta caracterizada.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de factualidad.
- Los metadatos de parametros (2.162.688) son incoherentes con la denominacion 27B y el tamano del fichero; no deben usarse para estimar requisitos.
- La cuantizacion ternaria PTQ1_0 degrada la calidad frente a precisiones mayores; el autor solo reporta MMLU sobre 500 preguntas, sin otros benchmarks.
- Dependencia de un fork especifico de llama.cpp (PrismML), lo que limita la portabilidad a otros runtimes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al desplegador toda la responsabilidad legal y etica.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingue o conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Modelo base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Variante LoRA: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF
- Metricas y checksums del LoRA: https://huggingface.co/datasets/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF-metrics
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
