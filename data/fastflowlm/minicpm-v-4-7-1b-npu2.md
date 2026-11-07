# FastFlowLM/MiniCPM-V-4.7-1B-NPU2

## Resumen

MiniCPM-V 4.7 1B es la variante ligera de la familia MiniCPM-V de OpenBMB, un modelo multimodal de tipo image-text-to-text disenado para inferencia en dispositivo (on-device). Esta publicacion concreta, FastFlowLM/MiniCPM-V-4.7-1B-NPU2, es una distribucion empaquetada por FastFlowLM orientada a ejecucion sobre NPU, con soporte declarado para plataformas Intel, AMD, Arm, Rockchip y Houmo, ademas de iOS, Android y HarmonyOS. El modelo resuelve el problema de dotar de capacidades de comprension visual (imagen unica, multiples imagenes y video) a dispositivos con presupuesto de computo muy limitado, manteniendo un tamano de parametros de 1B.

La propuesta tecnica se apoya en dos ideas: compresion temprana de tokens visuales dentro del codificador visual (intra-ViT early compression, heredada de LLaVA-UHD v4) y soporte de compresion mixta de tokens visuales 4x/16x, que permite al desarrollador intercambiar detalle visual por coste de inferencia. El autor declara que la variante 1B en modo Instruct supera a Qwen3.5 0.8B tanto en puntuacion global como en eficiencia de inferencia, aunque no se aportan cifras numericas en la informacion disponible.

Es relevante ahora porque consolida el segmento de MLLM de menos de 2B parametros para despliegue local: la model card menciona soporte en SGLang, vLLM, llama.cpp y Ollama, variantes cuantizadas GGUF, BNB, AWQ y GPTQ, soporte anadido de FP8 y un metodo de ajuste fino llamado Self-Replay Fine-Tuning. La licencia es Apache 2.0, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual con compresion temprana intra-ViT + modelo de lenguaje); detalles completos no disponibles |
| Parametros totales | 1B (variante 1B de MiniCPM-V 4.7) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ, FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); variantes GGUF, BNB, AWQ, GPTQ y FP8 mencionadas por el autor |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 1B es un modelo multimodal que combina un codificador visual con un modelo de lenguaje de 1B parametros. La innovacion arquitectonica destacada es la compresion temprana de tokens visuales dentro del propio ViT (intra-ViT early compression, tomada de LLaVA-UHD v4), que reduce el computo en las capas posteriores del codificador. Ademas, admite compresion mixta de tokens visuales 4x/16x, de modo que el desarrollador puede elegir entre mayor detalle visual o menor coste de inferencia segun la tarea. El pipeline de vision sigue el esquema de vista reducida de la imagen completa mas hasta 9 tiles, segun la documentacion de FastFlowLM.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no aparece en la model card ni en los resultados de busqueda. El autor menciona Self-Replay Fine-Tuning, un metodo de ajuste fino que permite extender capacidades a bajo coste reduciendo el olvido de capacidades previas, pero no se detalla su funcionamiento interno. La distribucion NPU2 de FastFlowLM emplea el mismo motor de texto que qwen3.6-moe:35b-a3b (mismo layout de capas y mismos kernels NPU), diferenciandose unicamente en el lado de vision.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video (image-text-to-text).
- Generacion de texto conversacional a partir de entradas visuales.
- Compresion configurable de tokens visuales (4x/16x) para ajustar detalle frente a coste.
- Inferencia en dispositivo: soporte declarado en iOS, Android y HarmonyOS.
- Soporte de plataformas de chip: Rockchip, Houmo, Intel, AMD y Arm, con soporte day-0.
- Compatibilidad con frameworks de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Compatibilidad con frameworks de ajuste fino SWIFT y LLaMA-Factory.
- Integracion con OpenVINO para despliegue optimizado en CPU/GPU/NPU de Intel.
- Modo Instruct (la model card distingue explicitamente este modo en las comparativas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual en movil: integrado en una aplicacion iOS o Android mediante el runtime on-device, el modelo puede describir una foto capturada por el usuario o responder preguntas sobre ella sin enviar la imagen a un servidor, lo que reduce latencia y preserva la privacidad.
- Accesibilidad para personas con discapacidad visual: el modelo puede narrar el contenido de una imagen o de un fotograma de camara en tiempo real sobre un dispositivo de gama media, gracias a su tamano de 1B y a la compresion de tokens visuales que rebaja el coste por inferencia.
- Inspeccion visual en el borde (edge computing): en placas con NPU Intel, AMD o Arm, el modelo puede clasificar o describir imagenes de sensores industriales o camaras de vigilancia en local, sin depender de la nube, usando el soporte day-0 de OpenVINO y de los chips mencionados.
- Procesamiento de documentos escaneados en local: con soporte de multiples imagenes y hasta 9 tiles por imagen, puede extraer y resumir informacion de capturas o fotografias de documentos en un portatil con GPU de consumo mediante llama.cpp u Ollama con pesos GGUF.
- Analisis de video de corta duracion: la capacidad de video understanding permite resumir o responder preguntas sobre clips grabados en el propio dispositivo, util en aplicaciones de diario personal o revision de grabaciones de camara.
- Prototipado rapido de productos multimodales: un equipo puede desplegar el modelo con vLLM o SGLang en una GPU unica para validar una idea de producto image-text-to-text antes de invertir en un modelo mayor, y luego portar la logica al runtime NPU para produccion.
- Personalizacion con ajuste fino: mediante SWIFT o LLaMA-Factory y la tecnica Self-Replay Fine-Tuning, un equipo puede adaptar el modelo a un dominio visual concreto (por ejemplo, inventario de comercio o imagenes medicas simples) manteniendo las capacidades generales.

## Benchmarks y rendimiento

La model card incluye graficas comparativas (frontera rendimiento-eficiencia y rendimiento global en modo Instruct) frente a Qwen3.5 0.8B, pero no publica los valores numericos en texto. No se han publicado resultados de benchmarks con cifras en la informacion disponible.

| Benchmark | MiniCPM-V 4.7 1B | Qwen3.5 0.8B | Notas |
|---|---|---|---|
| Puntuacion global (Instruct) | no disponible (solo grafica) | no disponible (solo grafica) | El autor afirma superioridad del 1B en puntuacion global y eficiencia |
| MMLU | no disponible | no disponible | No reportado |
| HumanEval | no disponible | no disponible | No reportado |
| GSM8K | no disponible | no disponible | No reportado |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, un modelo de 1B parametros en FP16 ocupa aproximadamente 2 GB de pesos; en cuantizacion de 8 bits alrededor de 1 GB y en 4 bits alrededor de 0,5-0,7 GB, mas el coste del codificador visual y del cache KV (estimaciones genericas, no confirmadas por el autor).
- El repositorio pesa 3,4 GB, lo que sugiere que incluye pesos en mas de un formato o precision.
- GPU recomendadas: no especificadas por el autor. El enfasis esta en NPU (Intel, AMD, Arm, Rockchip, Houmo) y en moviles (iOS, Android, HarmonyOS).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1B, aunque no hay confirmacion explicita ni lista de GPUs validadas.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama, Transformers (>=5.18.0 con torchvision y torchcodec o PyAV), OpenVINO para plataformas Intel, y runtimes on-device de FastFlowLM para NPU.
- Latencia y throughput: no disponibles. La model card presenta una grafica de rendimiento frente a tiempo de inferencia, pero sin cifras en texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B (esta ficha) | 1B | no disponible | Superior a Qwen3.5 0.8B segun el autor (sin cifras) | Apache 2.0 | Hugging Face, OpenVINO, runtimes on-device |
| Qwen3.5 0.8B | 0,8B | no disponible | Referencia de comparacion en la model card | no disponible en la informacion | no disponible en la informacion |
| MiniCPM-V 4.6 (1B) | 1B | no disponible | Inferior al 4.7 en capacidades base segun el autor | no disponible en la informacion | no disponible en la informacion |

Las cifras de rendimiento relativas proceden unicamente de las afirmaciones del autor; no se dispone de numeros verificables ni de una tercera alternativa comparable con datos suficientes.

## Limitaciones y advertencias

- No se han publicado cifras numericas de benchmarks; las afirmaciones de superioridad frente a Qwen3.5 0.8B no son verificables con los datos disponibles.
- Al ser un modelo de 1B parametros, su capacidad de razonamiento complejo, matematicas y codigo es previsiblemente limitada en comparacion con modelos de mayor tamano; no hay datos que lo confirmen o cuantifiquen.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en descripcion de imagenes con detalle fino; la compresion 16x de tokens visuales puede agravar la perdida de detalle.
- Cobertura de idiomas no declarada: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos o videos largos sin medirla.
- La variante NPU2 esta empaquetada para un runtime concreto (FastFlowLM/OpenVINO); su portabilidad a otras pilas de inferencia no esta garantizada por esta publicacion, aunque el modelo base si declara soporte de vLLM, SGLang, llama.cpp y Ollama.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos base originales de OpenBMB y de los componentes de terceros (por ejemplo, el codificador visual derivado de LLaVA-UHD v4) antes de desplegar en produccion.
- El modelo esta fechado en 2026 en los metadatos del repositorio; verificar la version exacta de pesos y de runtime antes de integrar.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/FastFlowLM/MiniCPM-V-4.7-1B-NPU2
- Documentacion de FastFlowLM para MiniCPM: https://fastflowlm.com/docs/models/minicpm/
- Repositorio OpenBMB MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o
- Documentacion de MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- LLaVA-UHD v4 (tecnica de compresion visual): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
