# openbmb/MiniCPM-V-4.6-gguf

## Resumen

MiniCPM-V 4.6 es un modelo multimodal (imagen-texto-a-texto) desarrollado por OpenBMB, disenado especificamente para despliegue en el borde (edge) y en dispositivos moviles. Combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B, heredando las capacidades de comprension de imagen unica, multiples imagenes y video de la familia MiniCPM-V, al tiempo que reduce drasticamente el coste computacional mediante compresion de tokens visuales mixta 4x/16x.

El repositorio referenciado (`openbmb/MiniCPM-V-4.6-gguf`) contiene la version cuantizada en formato GGUF para su uso con llama.cpp, lo que permite ejecutar el modelo en hardware de consumo e incluso en telefonos. El modelo base en BF16 esta disponible por separado en `openbmb/MiniCPM-V-4.6`.

Su relevancia actual radica en que ofrece capacidades multimodales competitivas con modelos significativamente mayores (supera a Ministral 3 3B en el indice de inteligencia de Artificial Analysis) manteniendo un coste de tokens muy inferior al de alternativas como Qwen3.5-0.8B (hasta 19x menos coste por token). La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (basada en LLaVA-UHD v4) |
| Parametros totales | 752.161.600 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples variantes); el modelo base ofrece BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en BF16/safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 sigue un diseno multimodal tipo LLaVA, con un codificador visual SigLIP2-400M conectado a un LLM Qwen3.5-0.8B. La innovacion principal es la implementacion de las tecnicas de LLaVA-UHD v4, que reducen los FLOPs de codificacion visual en mas del 50% respecto a enfoques anteriores. Ademas, incorpora compresion de tokens visuales mixta con tasas de 4x y 16x, permitiendo al desarrollador alternar entre mayor precision y mayor velocidad segun la tarea.

El modelo esta disponible en dos variantes: Instruct y Thinking (con modo de razonamiento extendido). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la informacion proporcionada. La eficiencia arquitectonica se traduce en un throughput de tokens aproximadamente 1,5x superior al de Qwen3.5-0.8B.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video.
- Generacion de texto y razonamiento multimodal (variante Thinking con razonamiento extendido).
- Compresion configurable de tokens visuales (4x/16x) para equilibrar precision y latencia.
- Capacidades OCR y comprension de documentos (referenciado OCRBench en la evaluacion).
- Grounding visual y deteccion referencial (referenciado RefCOCO).
- Soporte de despliegue en iOS, Android y HarmonyOS con codigo de adaptacion abierto.
- Integracion con frameworks de inferencia: vLLM, SGLang, llama.cpp, Ollama.
- Compatible con ecosistemas de fine-tuning: SWIFT y LLaMA-Factory.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistencia en dispositivos moviles: el modelo cabe en telefonos iOS, Android y HarmonyOS, permitiendo funciones de vision por computador sin conexion, como lectura de tickets, reconocimiento de escritura manual o identificacion de objetos en tiempo real.
- Digitalizacion de documentos en el borde: con capacidades OCR y compresion 16x de tokens visuales, puede procesar facturas, formularios o tarjetas de visita directamente en el dispositivo, reduciendo la latencia y preservando la privacidad de los datos.
- Analisis de video en tiempo real: su soporte de comprension de video y su bajo coste computacional permiten integrarlo en aplicaciones de vigilancia, accesibilidad o analisis de contenido audiovisual en hardware de consumo.
- Asistente de accesibilidad: descripcion de escenas, lectura de texto en imagenes y respuesta a preguntas sobre el entorno visual, ejecutandose localmente en el telefono del usuario.
- Procesamiento por lotes de imagenes en servidores modestos: gracias a su throughput 1,5x superior a Qwen3.5-0.8B, puede emplearse en pipelines de clasificacion y extraccion de informacion de imagenes con GPUs de gama media o incluso CPU via llama.cpp.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad de formatos GGUF, la licencia Apache 2.0 y la compatibilidad con Ollama y llama.cpp permiten a desarrolladores integrar vision-language en prototipos sin infraestructura dedicada.
- Fine-tuning para dominios especificos: mediante SWIFT o LLaMA-Factory, se puede adaptar el modelo a tareas verticales (medicina, industria, retail) en GPUs de consumo.

## Benchmarks y rendimiento

La model card referencia graficos de evaluacion (Instruct y Thinking) y resultados de eficiencia (throughput y TTFT), pero no se proporcionan valores numericos detallados en la informacion disponible. Los unicos datos numericos explicitos son:

| Metrica | MiniCPM-V 4.6 | Referencia |
|---|---|---|
| Artificial Analysis Intelligence Index | 13 | Qwen3.5-0.8B: 10; Qwen3.5-0.8B-Thinking: 11; Ministral 3 3B: 11 |
| Coste relativo de tokens | 1x | Qwen3.5-0.8B: 19x; Qwen3.5-0.8B-Thinking: 43x |
| Throughput de tokens | ~1,5x vs Qwen3.5-0.8B | — |

Se mencionan comparaciones cualitativas en OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench, pero sin cifras concretas en la informacion proporcionada. No se han publicado resultados numericos detallados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~752M parametros, las cuantizaciones GGUF tipicas (Q4_K_M, Q5_K_M, Q8_0) ocupan aproximadamente entre 0,5 GB y 1 GB, mas el codificador visual SigLIP2-400M. El repo completo pesa 8,4 GB (incluye multiples variantes).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede ejecutar las cuantizaciones mas agresivas. Para el modelo base en BF16, se recomienda una GPU con 4-8 GB (RTX 3060, RTX 4060, etc.).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3050 en adelante) e incluso en CPU via llama.cpp.
- Despliegue en movil: soportado en iOS, Android y HarmonyOS con codigo de adaptacion abierto.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, Transformers (>=5.7.0 con torchvision y torchcodec).
- Latencia y throughput: ~1,5x throughput de tokens frente a Qwen3.5-0.8B segun el autor; no se dispone de cifras absolutas de TTFT o tokens/s en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Intelligence Index | Licencia | Despliegue edge |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 | ~752M (+ SigLIP2-400M) | no disponible | 13 | Apache 2.0 | iOS, Android, HarmonyOS |
| Qwen3.5-0.8B | ~0,8B | no disponible | 10 (11 en Thinking) | no disponible | no disponible |
| Ministral 3 3B | ~3B | no disponible | 11 | no disponible | no disponible |

MiniCPM-V 4.6 ofrece mejor puntuacion en el indice de inteligencia que alternativas de mayor tamano, con un coste de tokens muy inferior. La comparativa se limita a los datos proporcionados por el autor; no se dispone de informacion sobre contexto, licencia ni soporte edge de los modelos comparados.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; la variante de ~752M parametros tiene menor capacidad de razonamiento que modelos mayores.
- Longitud de contexto no documentada en la informacion disponible; puede ser limitada para tareas que requieran contextos muy largos.
- Idiomas soportados no especificados; el rendimiento multilingue puede variar y no esta garantizado fuera de los idiomas principales de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y del LLM subyacente (Qwen3.5-0.8B) por si existieran restricciones adicionales.
- El repositorio GGUF contiene multiples variantes; es necesario seleccionar la cuantizacion adecuada segun el hardware y el equilibrio precision/velocidad deseado.
- La compresion 16x de tokens visuales puede degradar la precision en tareas de OCR fino o detalles de alta resolucion; se recomienda validar con la tasa 4x en esos casos.
- Para produccion, verificar la compatibilidad de torchcodec con la version de CUDA instalada (se sugiere PyAV como alternativa).

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Demo
- Documentacion API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Paper LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Papers referenciados (arXiv): 2604.27393, 2509.18154, 2408.01800, 2605.08985
