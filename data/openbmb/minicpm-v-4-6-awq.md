# openbmb/MiniCPM-V-4.6-AWQ

## Resumen

MiniCPM-V 4.6 AWQ es la variante cuantizada en 4 bits (W4A16, AutoAWQ) del modelo multimodal MiniCPM-V 4.6, desarrollado por OpenBMB. Se trata de un modelo de imagen-a-texto orientado a despliegue en el borde ("edge"), disenado especificamente para inferencia en dispositivos moviles (iOS, Android y HarmonyOS) y en GPUs de consumo. El modelo combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B, lo que da un total de aproximadamente 1.300 millones de parametros segun los pesos en safetensors del repositorio.

La relevancia de esta version AWQ radica en que reduce el peso del repositorio a 1,9 GB, facilitando su ejecucion en hardware con recursos limitados sin renunciar a las capacidades de comprension de imagen unica, multiples imagenes y video que hereda de la familia MiniCPM-V. Incorpora compresion mixta de tokens visuales 4x/16x, lo que permite intercambiar precision por velocidad de forma flexible.

Frente a alternativas de mayor tamano, el modelo declara una puntuacion de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (10) y a Ministral 3 3B (11), con un coste de tokens notablemente inferior. La licencia Apache 2.0 y la disponibilidad de variantes GGUF, BNB, AWQ y GPTQ lo convierten en una opcion practica para prototipado y despliegue en produccion ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (basada en LLaVA-UHD v4) |
| Parametros totales | 1.300.428.016 (~1,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 4 bits (W4A16, AutoAWQ); el modelo base ofrece GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB); variantes GGUF disponibles en el modelo base |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 sigue un diseno multimodal tipo LLaVA: un codificador visual SigLIP2-400M proyecta las representaciones de imagen hacia un LLM Qwen3.5-0.8B que genera la respuesta textual. La innovacion principal es la tecnica de LLaVA-UHD v4, que reduce los FLOPs de codificacion visual en mas del 50 % y habilita una compresion mixta de tokens visuales con tasas 4x y 16x, permitiendo ajustar el equilibrio entre precision y velocidad en tiempo de inferencia. El modelo declara un throughput de tokens aproximadamente 1,5x superior al de Qwen3.5-0.8B.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona variantes "Instruct" y "Thinking", lo que sugiere un modo de razonamiento extendido, pero no se especifican los procedimientos de alineacion empleados. Esta version AWQ es una cuantizacion post-entrenamiento del modelo base en BF16, por lo que hereda sus caracteristicas de entrenamiento sin reentrenamiento adicional.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video (image-text-to-text).
- Generacion de texto y respuestas conversacionales multi-turno.
- Razonamiento visual: la model card reporta resultados en OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench a nivel de Qwen3.5 2B.
- OCR y comprension de documentos, con ejemplos de demostracion sobre manuscritos y tickets.
- Modo "Thinking" (razonamiento extendido) disponible en la variante correspondiente del modelo base.
- Compresion configurable de tokens visuales (4x/16x) para ajustar latencia y precision.
- Despliegue en dispositivos moviles iOS, Android y HarmonyOS con codigo de adaptacion abierto.
- Soporte de ecosistemas de inferencia (vLLM, SGLang, llama.cpp, Ollama) y de fine-tuning (SWIFT, LLaMA-Factory).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual en el movil: el modelo puede ejecutarse en iOS, Android y HarmonyOS para describir imagenes capturadas por la camara, leer manuscritos o interpretar tickets, gracias a su tamano de ~1,3 B y al peso de 1,9 GB en AWQ.
- Digitalizacion de documentos y OCR en el dispositivo: con resultados declarados en OCRBench a nivel de Qwen3.5 2B, es adecuado para extraer texto de facturas, formularios o apuntes sin enviar datos a la nube.
- Accesibilidad para personas con discapacidad visual: descripcion de escenas en tiempo real desde la camara del telefono, con la ventaja de que la inferencia local evita latencia de red y preserva la privacidad.
- Analisis de video ligero: la capacidad de comprension de video permite resumir clips cortos o identificar eventos en grabaciones, con la compresion 16x para reducir el coste de tokens visuales.
- Prototipado rapido de aplicaciones multimodales: la licencia Apache 2.0 y la compatibilidad con vLLM, SGLang, llama.cpp y Ollama permiten montar un servicio de imagen-a-texto en una GPU de consumo en pocos pasos.
- Fine-tuning de dominio en GPU de consumo: el modelo base es adaptable con SWIFT y LLaMA-Factory, de modo que se puede especializar en sectores como retail, salud o industria con recursos modestos.
- Asistencia en entornos sin conectividad: al caber en dispositivos de borde, resulta util en escenarios de campo, inspeccion industrial o zonas con red limitada.

## Benchmarks y rendimiento

La model card proporciona resultados agregados pero no una tabla numerica detallada por benchmark en el texto disponible. Los datos declarados son:

| Metrica | MiniCPM-V 4.6 | Qwen3.5-0.8B | Qwen3.5-0.8B-Thinking | Ministral 3 3B |
|---|---|---|---|---|
| Artificial Analysis Intelligence Index | 13 | 10 | 11 | 11 |
| Coste relativo de tokens | 1x (referencia) | 19x mas | 43x mas | No disponible |
| Throughput de tokens | ~1,5x vs Qwen3.5-0.8B | Referencia | No disponible | No disponible |

La model card indica que MiniCPM-V 4.6 supera a Qwen3.5-0.8B en la mayoria de tareas de comprension vision-lenguaje y alcanza el nivel de Qwen3.5 2B en OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench. No se han publicado en la informacion disponible los valores numericos concretos de MMLU, HumanEval, GSM8K ni de cada benchmark visual; las graficas completas estan enlazadas en el repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio AWQ ocupa 1,9 GB, por lo que la inferencia en 4 bits requiere aproximadamente 2-3 GB de VRAM, incluyendo overhead de activaciones y cache KV (estimacion, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la variante AWQ; el modelo base en BF16 requiere del orden de 3-4 GB. Para alto rendimiento, A100 o H100 con vLLM o SGLang.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien en GPUs integradas de moviles mediante las adaptaciones oficiales para iOS, Android y HarmonyOS.
- Opciones de despliegue: Transformers (>=5.7.0 con torchvision y torchcodec), vLLM, SGLang, llama.cpp, Ollama; fine-tuning con SWIFT y LLaMA-Factory.
- Latencia y throughput: la model card declara ~1,5x mas throughput de tokens que Qwen3.5-0.8B y una reduccion de mas del 50 % en FLOPs de codificacion visual; los valores absolutos de TTFT y throughput en alta concurrencia estan en las graficas del repositorio, no en el texto disponible.
- Nota de compatibilidad: torchcodec puede fallar con CUDA 12.x; se recomienda sustituirlo por PyAV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 AWQ | ~1,3 B | No disponible | AA Intelligence Index 13 | Apache 2.0 | Hugging Face, formatos AWQ/GGUF/BNB/GPTQ |
| Qwen3.5-0.8B | 0,8 B | No disponible | AA Intelligence Index 10 | No disponible en la informacion | No disponible en la informacion |
| Qwen3.5-0.8B-Thinking | 0,8 B | No disponible | AA Intelligence Index 11 | No disponible en la informacion | No disponible en la informacion |
| Ministral 3 3B | 3 B | No disponible | AA Intelligence Index 11 | No disponible en la informacion | No disponible en la informacion |

MiniCPM-V 4.6 AWQ ofrece la mejor relacion entre capacidad declarada y coste de tokens de la comparativa, con la ventaja adicional de ser multimodal y de tener licencia Apache 2.0. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion AWQ de 4 bits puede degradar ligeramente la precision respecto al modelo base en BF16; conviene validar en la tarea concreta antes de produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje, especialmente en OCR de documentos de baja calidad o imagenes ambiguas.
- No se dispone de informacion sobre sesgos demograficos, culturales o linguisticos del modelo.
- Los idiomas soportados no estan documentados en la informacion disponible; el rendimiento fuera del ingles y el chino no esta verificado.
- La longitud de contexto no esta especificada, lo que dificulta planificar cargas de video largo o conversaciones extensas.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los componentes subyacentes (SigLIP2 y Qwen3.5) antes de un uso comercial.
- El modelo esta optimizado para eficiencia y despliegue en el borde; para tareas de razonamiento complejo puede quedar por debajo de modelos de mayor tamano.
- La dependencia de torchcodec para decodificacion de video puede generar problemas en entornos con CUDA 12.x.

## Enlaces

- Hugging Face (AWQ): https://huggingface.co/openbmb/MiniCPM-V-4.6-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-AWQ-Demo
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Paper (arxiv:2604.27393): https://arxiv.org/abs/2604.27393
- Paper (arxiv:2509.18154): https://arxiv.org/abs/2509.18154
- Paper (arxiv:2408.01800): https://arxiv.org/abs/2408.01800
- Paper (arxiv:2605.08985): https://arxiv.org/abs/2605.08985
