# pranil00/ONIX-meditron-70b-GGUF

## Resumen

ONIX-meditron-70b-GGUF es una cuantizacion del modelo medico Meditron-70B desarrollado originalmente por EPFL LLM (epfl-llm/meditron-70b), publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto GGUF en formato IQ1_S (1,56 bits por peso) que comprime los 70.553.698.304 parametros del modelo base desde 137,99 GB en FP16 hasta 13,45 GB, una reduccion del 90,2 %. El objetivo declarado es hacer ejecutable un modelo de 70B en hardware de consumo mediante offload hibrido entre GPU y RAM del sistema.

El modelo subyacente es de arquitectura LLaMA y esta especializado en dominio medico, lo que lo hace relevante para experimentacion local con modelos clinicos de gran tamano sin infraestructura de centro de datos. La cuantizacion extrema a 1,56 bits es, sin embargo, agresiva: el propio autor reporta una retencion de calidad cognitiva de aproximadamente el 60 % respecto al baseline FP16, lo que implica una degradacion sustancial que debe tenerse en cuenta antes de cualquier uso serio.

La ficha se publica sin descargas ni likes en el momento de la consulta y sin datos de benchmarks propios. La licencia declarada es Apache 2.0, aunque conviene verificar la licencia del modelo base, ya que Meditron se distribuye bajo terminos especificos de EPFL que pueden imponer restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer denso, familia LLaMA) |
| Parametros totales | 70.553.698.304 (70,55 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU/Apple Silicon); 4.096 tokens (CPU) segun model card |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (artefacto de cuantizacion); licencia del modelo base no verificada en la informacion disponible |
| Formato de pesos | GGUF (fichero `epfl-llm--meditron-70b-IQ1_S.gguf`) |

## Arquitectura y entrenamiento

El modelo base Meditron-70B de EPFL LLM es un transformer denso de la familia LLaMA con 70.553.698.304 parametros, adaptado al dominio medico mediante entrenamiento continuado sobre corpus clinicos y biomedicos. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card original de epfl-llm/meditron-70b, que no se incluye en la informacion disponible.

La innovacion tecnica de este artefacto concreto no reside en la arquitectura, sino en la cuantizacion IQ1_S generada con la herramienta run-any-model, un motor de optimizacion adaptativo al dispositivo. El proceso reduce el peso a 1,56 bits por parametro con un ratio de compresion de 10,26x y aplica un esquema de offload hibrido: en el perfil auditado (Darwin, 16 GB), 68 de 80 capas (85 %) se descargan en la GPU/Metal y el resto se transmite desde la RAM del sistema. El KV cache se mantiene en Q4_0 (320 MB). No se documenta decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto en dominio medico: el modelo base esta especializado en conocimiento clinico y biomedico, por lo que se espera que herede esa orientacion (no verificado en este artefacto cuantizado).
- Razonamiento y respuesta a preguntas sobre literatura medica, guias clinicas y conceptos biomedicos, segun la especializacion del modelo base.
- Generacion de texto general propia de un transformer LLaMA de 70B, sujeta a la degradacion por cuantizacion extrema.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Experimentacion local con modelos medicos de gran tamano: permite probar un 70B especializado en un portatil con 16 GB de memoria unificada o una GPU de 16 GB, algo inviable con el modelo en FP16 (137,99 GB). Adecuado para prototipado y evaluacion, no para produccion clinica.
- Investigacion sobre cuantizacion extrema: el artefacto sirve como caso de estudio de como afecta IQ1_S (1,56 bits) a un modelo de dominio especializado, comparando salidas frente al baseline FP16 y midiendo la perdida real de calidad frente al 60 % declarado.
- Demos educativas de IA medica en entornos con hardware limitado: con Ollama o llama.cpp se puede desplegar una demo de preguntas y respuestas clinicas en un equipo de sobremesa, asumiendo latencia alta por el offload hibrido.
- Generacion de borradores de texto biomedico para revision humana: resumenes de articulos o notas estructuradas que un profesional valida posteriormente, aprovechando el conocimiento del dominio del modelo base.
- Pruebas de pipelines RAG medicos: usar el modelo como generador en un sistema de recuperacion aumentada sobre corpus clinicos locales, donde la ventana de 8.192 tokens permite incluir varios fragmentos de contexto.
- Evaluacion de latencia y throughput en escenarios de offload hibrido: medir el rendimiento real de 68/80 capas en GPU con streaming desde CPU para dimensionar infraestructura antes de invertir en GPUs de mayor VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente la auditoria de cuantizacion del motor run-any-model, que se reproduce a continuacion como dato de rendimiento de memoria, no de calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 1,56 bits/param | -90,2 % |
| Tamano de pesos | 137,99 GB | 13,45 GB | -90,2 % |
| KV cache | 320 MB (FP16) | 320 MB (Q4_0) | Optimizado |
| RAM residente total | 139,39 GB | 13,92 GB | -90,0 % |
| Calidad estimada | 100 % baseline | 60 % retenida | -40,0 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 68/80 capas | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada segun la model card: 13,92 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5), 14,95 GB de VRAM dedicada en NVIDIA RTX 30/40/50, y 15,92 GB de RAM libre en CPU (Windows/Linux con AVX2/AVX-512).
- GPU recomendadas: RTX 3090, RTX 4080, RTX 4090 y superiores cumplen los 14,95 GB de VRAM; el perfil auditado usa Metal en un equipo de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM (RTX 4080/4090, RTX 5080/5090). En GPUs de 12 GB no cabe en su totalidad y requeriria offload adicional a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (via Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Latencia y throughput: no se publican cifras concretas de tokens por segundo. La model card advierte explicitamente de que la velocidad de generacion sera mas lenta por el offload hibrido (85 % de capas en acelerador, resto en streaming desde CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-meditron-70b-GGUF (este) | 70,55 B | 8.192 / 4.096 tokens | IQ1_S (1,56 bits) | Apache 2.0 (artefacto) | Hugging Face, 0 descargas |
| epfl-llm/meditron-70b (base) | 70,55 B | no disponible | FP16 (137,99 GB) | Terminos de EPFL | Hugging Face |
| Modelos medicos de 7-8B cuantizados en GGUF (p. ej. variantes de Meditron-7b) | ~7-8 B | no disponible | Q4_K_M, Q5_K_M, etc. | segun modelo base | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no hay benchmarks publicados en la informacion proporcionada ni datos de modelos comparables en el mismo regimen de cuantizacion.

## Limitaciones y advertencias

- Degradacion de calidad severa: el propio autor estima una retencion del 60 % respecto a FP16, es decir, una perdida del 40 % de fidelidad cognitiva por la cuantizacion IQ1_S a 1,56 bits. No es adecuado para uso clinico ni para tareas que exijan precision alta.
- Riesgo de alucinacion elevado: combinado con la especializacion medica, la cuantizacion extrema aumenta la probabilidad de respuestas incorrectas con apariencia plausible; cualquier salida debe validarse por un profesional.
- Licencia: el artefacto se declara Apache 2.0, pero la licencia del modelo base epfl-llm/meditron-70b no se verifica en la informacion disponible y puede imponer condiciones adicionales para uso comercial. Comprobar antes de desplegar.
- Idiomas: no declarados; no hay garantia de rendimiento fuera del ingles, idioma habitual de los corpus medicos de entrenamiento.
- Contexto limitado en CPU: 4.096 tokens frente a los 8.192 en GPU, lo que reduce el contexto util en despliegues sin acelerador.
- Rendimiento: el offload hibrido (68/80 capas en GPU) implica latencia alta y throughput bajo; no apto para aplicaciones interactivas con requisitos estrictos de tiempo de respuesta.
- Sesgos: no documentados en la informacion proporcionada; los sesgos del modelo base (poblaciones, terminologia clinica, sesgo de genero en textos medicos) se heredan y pueden amplificarse con la cuantizacion.
- Madurez del artefacto: publicado sin descargas ni likes, sin benchmarks propios y sin validacion independiente; tratar como experimental.
- Descargo de responsabilidad del autor: la model card exime de toda responsabilidad por danos derivados del uso y traslada al implementador la auditoria y validacion de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-meditron-70b-GGUF
- Modelo base: https://huggingface.co/epfl-llm/meditron-70b
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
