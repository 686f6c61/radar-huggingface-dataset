# FINAL-Bench/POCKET-Darwin-180B-GGUF

## Resumen

POCKET-Darwin-180B-GGUF es la distribucion cuantizada en formato GGUF del modelo Darwin-180B-RSI-R3, desarrollado por VIDRAFT (publicado en Hugging Face bajo la organizacion FINAL-Bench). Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) disperso, con 176.943.899.520 parametros totales y aproximadamente 3.000 millones de parametros activos por token, disenado especificamente para razonamiento matematico y cientifico en texto. Su interes principal radica en que empaqueta un modelo de escala 180B en un artefacto de 111,3 GB que puede ejecutarse en un unico equipo con memoria unificada de 128 GB, como una NVIDIA DGX Spark, mediante llama.cpp.

El modelo base, Darwin-180B-RSI-R3, hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye unicamente las capas de atencion y de expertos compartidos mediante un proceso de auto-mejora recursiva (RSI, recursive self-improvement). Esta version GGUF en cuatro shards emplea cuantizacion UD-Q4_K_XL y elimina el codificador de vision: es exclusivamente texto. Segun la model card, el modelo base obtuvo 73,68 puntos en razonamiento matematico y cientifico en la evaluacion privada de SuperCLUE de noviembre de 2026, quedando primero entre los modelos de pesos abiertos y segundo en la clasificacion global de 19 modelos.

La relevancia actual del artefacto es doble: por un lado, demuestra que un MoE de 180B con solo 3B activos puede ofrecer calidad de razonamiento competitiva con modelos frontera cerrados; por otro, valida la viabilidad de desplegar ese nivel de capacidad en hardware de un solo nodo con memoria unificada, sin cluster GPU. La licencia es Qwen Community License 1.0, no Apache-2.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (mixture-of-experts), con capas de atencion y expertos compartidos reconstruidos por RSI |
| Parametros totales | 176.943.899.520 (176,94B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica cuantizacion incluida en el repositorio) |
| Idiomas soportados | Ingles, coreano, chino, japones, multilingue |
| Licencia | Qwen Community License 1.0 (no Apache-2.0) |
| Formato de pesos | GGUF (cuatro shards, ~111,3 GB en total) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts disperso con 176,94B parametros totales y unos 3B activos por token, lo que reduce drasticamente el coste computacional por token frente a un modelo denso del mismo tamano. La arquitectura parte de Qwen3.8-Flash-Next: conserva sus capas de expertos y reconstruye las capas de atencion y de expertos compartidos mediante un proceso de auto-mejora recursiva (model-level RSI, segun los tags darwin-rsi y model-level-rsi). El autor referencia dos articulos en arXiv (2605.14386 y 2609.20269) como base metodologica, aunque el contenido de dichos papers no se detalla en la informacion disponible.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La model card indica que el artefacto GGUF es solo texto y que el codificador de vision del modelo padre no esta incluido; por tanto, las puntuaciones de vision del padre en BF16 son material de referencia y no mediciones de esta build. La cuantizacion UD-Q4_K_XL se genero con imatrix (tag imatrix), un esquema de cuantizacion guiada por matriz de importancia.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis declarado en matematicas y ciencia.
- Razonamiento matematico y cientifico de alto nivel: el modelo base lidera la categoria de pesos abiertos en SuperCLUE noviembre 2026 con 73,68.
- Soporte multilingue en ingles, coreano, chino y japones, con etiqueta multilingue adicional.
- Capacidad de conversacion multi-turno (tag conversational).
- Ejecucion on-device y en local mediante llama.cpp, orientada a equipos con memoria unificada.
- No incluye vision: el codificador de vision del modelo padre ha sido eliminado en esta build.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido en entornos sin conectividad: el modelo puede resolver problemas de calculo, algebra y demostraciones en una DGX Spark o servidor CPU con suficiente RAM, sin depender de APIs externas, gracias a sus 3B parametros activos por token que mantienen la latencia manejable.
- Analisis cientifico y revision de literatura tecnica: con capacidades declaradas de razonamiento cientifico y soporte de chino, japones y coreano, resulta adecuado para equipos de investigacion que trabajan con documentacion multilingue en Asia Oriental.
- Procesamiento por lotes de problemas de benchmark o evaluacion interna: al ser un GGUF ejecutable con llama.cpp, se puede integrar en pipelines de evaluacion automatizada sobre hardware propio, sin coste por token.
- Asistencia a desarrolladores en tareas de razonamiento logico y depuracion conceptual: el modelo puede emplearse como motor local de analisis de algoritmos y explicacion de errores, aunque no se documenta soporte especifico de generacion de codigo en la model card.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse integramente on-device, permite procesar informacion sensible (por ejemplo, datos cientificos propietarios) sin salida a la nube.
- Prototipado de asistentes conversacionales multilingues para mercados coreano y japones: el soporte nativo de ko, ja y zh, junto con el tag conversational, lo hace util para demos de atencion al cliente en esos idiomas sobre infraestructura local.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a SuperCLUE de noviembre de 2026, en la categoria de razonamiento matematico y cientifico, medidos sobre el modelo base Darwin-180B-RSI-R3 (no sobre esta build GGUF cuantizada). No se han publicado resultados de benchmarks propios de la version GGUF en la informacion disponible.

| Modelo | Desarrollador | Pesos abiertos | Razonamiento matematico y cientifico (SuperCLUE nov. 2026) |
|---|---|---|---|
| GPT-6.1-Sol | OpenAI | No | 76,32 |
| Darwin-180B-RSI-R3 | VIDRAFT | Si | 73,68 |
| Gemini-4-Argon | Google | No | 71,05 |
| DeepSeek-V4.1-Flash | DeepSeek | Si | 71,05 |
| Grok-4.7 | xAI | No | 68,42 |
| Qwen3.8-Max-0902 | Alibaba | No | 68,42 |
| GLM-5.3 | Zhipu AI | Si | 65,79 |
| Kimi-K3.1-Pro | Moonshot | Si | 63,16 |
| Qwen3.8-Flash (padre de Darwin-180B) | Alibaba | Si | 57,89 |

Indice global de inteligencia: Darwin-180B-RSI-R3 obtuvo 43,08 (puesto 9 de 19, quinto entre pesos abiertos), frente a 39,81 (puesto 15) de Qwen3.8-Flash. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia/throughput medidos para esta build GGUF.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa aproximadamente 111,3 GB en cuatro shards; se requiere memoria suficiente para cargar los cuatro ficheros simultaneamente (los cuatro son obligatorios y deben conservar su nombre original en el mismo directorio).
- Hardware objetivo declarado: servidor CPU con RAM suficiente, o una ruta hibrida GPU/CPU/SSD configurada por separado. El caso de referencia citado es NVIDIA DGX Spark con 128 GB de memoria unificada.
- GPU consumer: no se documenta compatibilidad con GPUs consumer de VRAM limitada; el tamano del artefacto (111,3 GB) excede la VRAM de cualquier GPU consumer actual, por lo que el despliegue requiere memoria unificada o swapping a SSD.
- Runtime: llama.cpp, version minima b11048 con soporte qwen4exp segun el publicador original; conviene verificar la build instalada.
- Opciones de despliegue adicionales (vLLM, TGI, Ollama): no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Disponibilidad | Razonamiento mat./cient. (SuperCLUE nov. 2026) |
|---|---|---|---|---|---|---|
| POCKET-Darwin-180B-GGUF | 176,94B | ~3B | No disponible | Qwen Community License 1.0 | GGUF en HF | 73,68 (modelo base) |
| DeepSeek-V4.1-Flash | No disponible | No disponible | No disponible | No disponible | Pesos abiertos | 71,05 |
| GLM-5.3 | No disponible | No disponible | No disponible | No disponible | Pesos abiertos | 65,79 |
| Kimi-K3.1-Pro | No disponible | No disponible | No disponible | No disponible | Pesos abiertos | 63,16 |
| Qwen3.8-Flash (padre) | No disponible | No disponible | No disponible | No disponible | Pesos abiertos | 57,89 |

La comparativa se limita a la metrica publicada por SuperCLUE; no se dispone de datos de parametros, contexto ni licencia de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: el codificador de vision del modelo padre no esta incluido; cualquier caso de uso con imagenes queda fuera del alcance de esta build.
- Cuantizacion unica: solo se ofrece UD-Q4_K_XL; no hay alternativas de menor o mayor precision en el repositorio, lo que limita el ajuste fino entre calidad y memoria.
- Los cuatro shards son obligatorios y deben mantener su nombre original en el mismo directorio; no es posible cargar un subconjunto.
- Los resultados de SuperCLUE corresponden al modelo base en BF16, no a esta build cuantizada; la degradacion por cuantizacion Q4 no esta medida en la informacion disponible.
- Licencia Qwen Community License 1.0, no Apache-2.0: existen restricciones para uso comercial que deben revisarse antes de produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; debe asumirse el comportamiento habitual de un modelo de lenguaje de su escala.
- Longitud de contexto no especificada: no es posible planificar casos de uso con documentos largos sin verificar este dato en la documentacion del modelo base.
- Requiere llama.cpp b11048 o superior con soporte qwen4exp; versiones anteriores pueden fallar al cargar el modelo.
- El rendimiento depende criticamente del ancho de banda de memoria del equipo; en configuraciones hibridas GPU/CPU/SSD la latencia puede degradarse de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Ficheros y descargas: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF/tree/main
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Guia de instalacion del publicador: https://vidraft.net/p/pocket.html?model=pocket_darwin_180b
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-26B: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-27B: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- Leaderboard SuperCLUE: https://www.superclueai.com/homepage
- Paper de referencia 1: https://arxiv.org/abs/2605.14386
- Paper de referencia 2: https://arxiv.org/abs/2609.20269
