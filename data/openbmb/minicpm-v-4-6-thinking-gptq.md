# openbmb/MiniCPM-V-4.6-Thinking-GPTQ

## Resumen

MiniCPM-V-4.6-Thinking-GPTQ es la versión cuantizada a 4 bits (W4A16, GPTQModel) de MiniCPM-V 4.6 Thinking, un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB. Se trata de una variante de razonamiento con cadena de pensamiento larga (long chain-of-thought) del modelo MiniCPM-V 4.6, disenada para generar una traza de razonamiento explicita antes de la respuesta final, lo que mejora el rendimiento en tareas complejas de razonamiento multimodal, matematicas y OCR intensivo.

El modelo mantiene la arquitectura orientada a dispositivos de borde de la familia MiniCPM-V 4.6: un codificador visual SigLIP2-400M combinado con un LLM Qwen3.5-0.8B, junto con la compresion mixta de tokens visuales 4x/16x. Con aproximadamente 1.300 millones de parametros totales y un repositorio de solo 1,9 GB, esta pensado para inferencia eficiente en movil y entornos con recursos limitados (iOS, Android y HarmonyOS segun la model card).

La relevancia actual del modelo radica en que combina razonamiento explicito multimodal con un perfil de despliegue extremadamente ligero y licencia Apache 2.0, lo que facilita su uso comercial e integracion en aplicaciones de borde sin necesidad de infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (transformer) |
| Parametros totales | 1.300.428.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, W4A16 (version cuantizada); el modelo base dispone de pesos BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ); el modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de MiniCPM-V 4.6: un codificador visual SigLIP2 de 400M de parametros acoplado a un LLM Qwen3.5 de 0.8B, con una compresion mixta de tokens visuales que permite alternar entre modos 4x y 16x segun el nivel de detalle requerido. La variante Thinking anade una cadena de razonamiento explicita antes de la respuesta final, orientada a mejorar tareas de razonamiento multimodal complejo, matematicas y OCR. Esta version concreta aplica cuantizacion GPTQ de 4 bits con activaciones en 16 bits (W4A16) mediante GPTQModel sobre los pesos BF16 del modelo base.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO. La model card referencia varios articulos (arXiv:2604.27393, arXiv:2509.18154, arXiv:2408.01800, arXiv:2605.08985) como documentacion tecnica asociada, pero su contenido no se detalla en la informacion disponible.

## Capacidades

- Comprension de imagenes y video (image-text-to-text) con compresion de tokens visuales configurable en modo 4x (mayor detalle) o 16x (mayor eficiencia).
- Razonamiento explicito con cadena de pensamiento larga (thinking mode) antes de la respuesta final.
- Razonamiento multimodal complejo, matematicas y tareas con alta carga de OCR.
- Generacion de texto conversacional multi-turno.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Despliegue en dispositivos de borde: iOS, Android y HarmonyOS segun la model card.

## Casos de uso

- Reconocimiento y extraccion de texto en documentos (OCR): el modelo esta optimizado para tareas con alta carga de OCR y puede procesar imagenes de tickets, formularios o documentos con el modo de downsample 4x para preservar detalle fino.
- Asistencia educativa en matematicas y ciencias: el modo Thinking genera una traza de razonamiento paso a paso que permite al usuario revisar el proceso, util para explicar la resolucion de problemas a partir de una foto del enunciado.
- Aplicaciones moviles de accesibilidad: con 1,3B de parametros y pesos GPTQ de 4 bits (repo de 1,9 GB), puede integrarse en apps iOS, Android y HarmonyOS para describir imagenes o leer texto en voz alta sin conexion a servidores.
- Analisis de video en el dispositivo: la compresion de tokens visuales 4x/16x y el soporte de Flash Attention 2 permiten procesar clips de video en entornos con memoria limitada, por ejemplo para resumir o describir contenido grabado con la camara del telefono.
- Atencion al cliente con entrada visual: el modelo puede gestionar conversaciones multi-turno en las que el usuario envia capturas de pantalla o fotos de productos para resolver incidencias, con la ventaja de ejecutarse en el propio dispositivo y reducir costes de inferencia en la nube.
- Verificacion de documentos de identidad o justificantes: la combinacion de OCR y razonamiento permite extraer campos clave y comprobar su coherencia en flujos de onboarding, desplegando el modelo cuantizado en hardware de borde.
- Prototipado rapido en investigacion: al estar disponible en formato GPTQ y con integracion en transformers (AutoModelForImageTextToText), sirve para experimentar con razonamiento multimodal en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye graficas de rendimiento general (Thinking e Instruct) y de eficiencia de inferencia (throughput en alta concurrencia y TTFT de una sola peticion), pero los valores concretos no se detallan en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos GPTQ de 4 bits ocupan aproximadamente 1,9 GB en disco; con overhead de activaciones y cache KV, se estima un uso de VRAM en el rango de 2 a 4 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al ser un modelo de borde, puede ejecutarse en GPUs de consumo; se recomienda al menos una RTX 3060/4060 para inferencia comoda en BF16 del modelo base, y cualquier GPU con 4 GB o mas para la version GPTQ.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media y entornos integrados; la model card documenta despliegue en telefonos (iPhone 17 Pro Max, Redmi K70, HUAWEI nova 14).
- Opciones de despliegue: transformers (version >= 5.7.0 con torch, torchvision y torchcodec o PyAV), Flash Attention 2 recomendado para multi-imagen y video; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: la model card incluye graficas de TTFT y throughput en alta concurrencia, pero no se proporcionan valores numericos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V-4.6-Thinking-GPTQ | 1,3B | no disponible | Apache 2.0 | Version cuantizada 4 bits, razonamiento explicito, orientado a borde |
| MiniCPM-V 4.6 (Instruct) | no disponible | no disponible | Apache 2.0 | Variante sin cadena de pensamiento; misma arquitectura |
| MiniCPM-V 4.6 Thinking (BF16) | no disponible | no disponible | Apache 2.0 | Modelo base sin cuantizar; mayor huella de memoria |

No se dispone de datos de rendimiento comparativo con otras familias de modelos (Qwen-VL, InternVL, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion GPTQ de 4 bits puede introducir una degradacion de calidad respecto a los pesos BF16 del modelo base, especialmente en tareas de OCR o razonamiento fino; conviene validar en el caso de uso concreto.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en el modo Thinking por la generacion de trazas de razonamiento largas que pueden contener pasos erroneos.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino puede ser inferior.
- Longitud de contexto no disponible; planificar el diseno de aplicaciones con conversaciones largas o video extenso requiere verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los articulos y recursos asociados citados en la model card.
- El soporte de tool calling y agentes no esta confirmado; no asumir su disponibilidad en produccion sin pruebas.
- Dependencia de versiones concretas de transformers (>= 5.7.0) y posibles problemas de compatibilidad de torchcodec con CUDA 12.x, segun advierte la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-GPTQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Variante Instruct: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-GPTQ-Demo
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Paper (arXiv:2604.27393): https://arxiv.org/abs/2604.27393
- Paper (arXiv:2509.18154): https://arxiv.org/abs/2509.18154
- Paper (arXiv:2408.01800): https://arxiv.org/abs/2408.01800
- Paper (arXiv:2605.08985): https://arxiv.org/abs/2605.08985
