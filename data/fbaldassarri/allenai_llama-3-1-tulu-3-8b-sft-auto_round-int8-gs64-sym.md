# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo allenai/Llama-3.1-Tulu-3-8B-SFT, desarrollado originalmente por el Allen Institute for AI (AI2) como parte de la familia Tulu 3. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando una cuantización de solo pesos (WoQ) con el algoritmo SignRound. El resultado es un checkpoint de aproximadamente 11,5 GB en formato safetensors que mantiene la estructura transformer densa del Llama 3.1 original.

El modelo base Tulu 3 8B SFT es un ajuste fino supervisado del Llama 3.1 8B de Meta, orientado a instrucciones y conversación. Esta versión cuantizada conserva la plantilla de chat del modelo original y está pensada para inferencia en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost en Core Ultra) mediante OpenVINO. Es relevante para quienes necesitan desplegar un modelo de 8B en entornos sin GPU dedicada NVIDIA, reduciendo el peso de los pesos a 8 bits por parámetro con grupos de 64.

La ficha describe únicamente lo que consta en la información disponible: la model card del autor de la cuantización y los metadatos de Hugging Face. No se han publicado resultados de benchmarks para esta variante cuantizada ni detalles del entrenamiento original del modelo Tulu 3 SFT en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Llama 3.1), densa |
| Parametros totales | 2.932.150.272 (según safetensors del repo cuantizado); el modelo base se denomina 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | INT8, group size 64, simétrica, WoQ (SignRound / AutoRound) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato auto_round de Intel AutoRound) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1, un transformer causal denso con atención multi-cabeza agrupada (GQA) y normalización RMSNorm, según la convención habitual de la familia Llama 3.1. El modelo base allenai/Llama-3.1-Tulu-3-8B-SFT es un ajuste fino supervisado (SFT) sobre Llama 3.1 8B realizado por AI2 dentro del proyecto Tulu 3, orientado a seguir instrucciones y mantener conversaciones multi-turno. La información proporcionada no detalla la composición del dataset de SFT, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO en esta variante SFT.

La innovación técnica de este repositorio es la cuantización: se aplica Intel AutoRound v0.16.0 con el algoritmo SignRound, calibrando sobre 128 muestras de 512 tokens, 200 iteraciones de tuning y batch size 4, todo en CPU con carga en bfloat16. El proceso de cuantización registrado duró 41.893 segundos (unas 698 minutos). El resultado son pesos INT8 con grupos de 64 y simetría, empaquetados en el formato auto_round que transformers puede cargar directamente. No se trata de un modelo nuevo ni de un reentrenamiento, sino de una compresión de pesos para inferencia.

## Capacidades

- Generación de texto conversacional e instrucciones, usando la plantilla de chat del modelo (rol user/assistant).
- Razonamiento y respuesta a preguntas en inglés, heredado del ajuste SFT de Tulu 3.
- Generación de código y matemáticas: capacidad esperable del modelo base Tulu 3 SFT, aunque no se documentan resultados específicos en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan en la información proporcionada.
- Inferencia optimizada en hardware Intel: CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost en Core Ultra (OpenVINO).

## Casos de uso

- Asistente conversacional en inglés sobre CPU: el modelo puede cargarse con transformers y `device_map="auto"` en un servidor sin GPU, gestionando diálogos multi-turno mediante su plantilla de chat. Es adecuado porque la cuantización INT8 reduce el peso de los pesos y está calibrada para CPU.
- Despliegue en portátiles con Intel Core Ultra: gracias a la compatibilidad con NPU AI Boost vía OpenVINO, se puede ejecutar un asistente local de 8B en un equipo de consumo con aceleración dedicada de IA.
- Inferencia en iGPU Intel Arc: para estaciones de trabajo con gráfica integrada Arc, la ruta intel-extension-for-pytorch permite aprovechar la GPU integrada sin necesidad de una tarjeta NVIDIA.
- Prototipado de aplicaciones de generación de texto en investigación: el modelo es apache-2.0 y puede usarse como base para experimentos de prompting, evaluación de instrucciones o comparación de calidad frente al modelo sin cuantizar.
- Generación de respuestas en pipelines de texto por lotes: al ser un modelo de 8B cuantizado a INT8, se puede integrar en procesos de generación masiva donde el coste de memoria es crítico y el hardware es Intel.
- Evaluación de cuantización: este repositorio sirve como artefacto de referencia para reproducir la receta de AutoRound (parámetros exactos documentados) y medir la degradación de calidad frente al modelo bfloat16 original en tareas de instrucciones.
- Chatbot de soporte interno en inglés: para equipos que ya operan infraestructura Intel y necesitan un modelo conversacional con licencia permisiva, sin depender de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser INT8 con pesos de ~2,93 mil millones de parámetros según safetensors (aunque el repo ocupa 11,5 GB), el peso en memoria es de aproximadamente 3 GB en INT8; el tamaño del repo incluye posiblemente otros artefactos. No se dispone de una cifra oficial de VRAM en la información proporcionada.
- GPU recomendadas: la model card está orientada a CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra), no a GPU NVIDIA. No se documentan requisitos para A100, H100 o RTX 4090.
- ¿Cabe en consumer GPU? No se especifica en la información disponible; el foco declarado es hardware Intel (CPU, iGPU Arc, NPU).
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU AI Boost. La model card incluye la etiqueta `text-generation-inference`, pero no se detalla su uso. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada. El único dato temporal es la duración de la cuantización (41.893 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Tulu-3-8B-SFT INT8 AutoRound) | ~2,93B según safetensors del repo (base 8B) | no disponible | INT8, gs64, simétrica | apache-2.0 | Hugging Face, 17 descargas |
| allenai/Llama-3.1-Tulu-3-8B-SFT (base) | 8B | no disponible en esta ficha | bfloat16 | apache-2.0 | Hugging Face (modelo original de AI2) |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128k (según documentación de Meta) | bfloat16 y múltiples | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Otras cuantizaciones INT8/INT4 de Tulu 3 8B | 8B | no disponible | INT8/INT4 (AWQ, GPTQ, etc.) | apache-2.0 según el artefacto | Hugging Face (según autor) |

La comparación se limita a datos estructurales; no hay benchmarks publicados para esta variante que permitan comparar calidad frente al modelo base o frente a otras cuantizaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; el modelo base Llama 3.1 y su ajuste SFT pueden heredar sesgos de los datos de entrenamiento, pero no hay evaluación disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización INT8 puede introducir degradación adicional respecto al modelo bfloat16, pero no se aportan métricas.
- Limitaciones de contexto o idioma: el modelo declara únicamente inglés (`en`); no se confirma la longitud de contexto efectiva en esta variante cuantizada.
- Restricciones de licencia: apache-2.0, permisiva para uso comercial, aunque la model card incluye un descargo que indica que el modelo se ha desarrollado "solo para fines de investigación"; conviene revisar esa contradicción antes de un despliegue comercial.
- Caveat de producción: la model card marca `inference: false` en los metadatos, lo que puede indicar que el artefacto no está validado para inferencia directa en el Hub; el autor indica que está pensado para hardware Intel (CPU, iGPU Arc, NPU) y no documenta soporte para GPU NVIDIA.
- El número de parámetros reportado por safetensors (2,93B) no coincide con la denominación "8B" del modelo base; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- El repositorio tiene muy pocas descargas (17) y ningún "like", por lo que no hay evidencia comunitaria de validación.
- No se garantiza la reproducibilidad byte a byte salvo siguiendo la receta documentada con la versión exacta de AutoRound (0.16.0) y las condiciones de ejecución registradas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_round-int8-gs64-sym
- Modelo base en Hugging Face: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-SFT
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- auto-round-pipeline (receta de reproducción): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
