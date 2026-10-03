# FINAL-Bench/POCKET-Darwin-180B-GGUF

## Resumen

POCKET-Darwin-180B-GGUF es una versión cuantizada a 4 bits en formato GGUF del modelo Darwin-180B-RSI-R3, publicada por FINAL-Bench (VIDRAFT). Su objetivo es hacer ejecutable un modelo de escala frontera de aproximadamente 176.900 millones de parámetros en hardware de consumo: un portátil con GPU de 8 GB y 32 GB de RAM, un mini PC con 128 GB de RAM, un servidor sin GPU o una única máquina NVIDIA DGX Spark. El repositorio ocupa 111,3 GB repartidos en 4 ficheros, frente a los 360 GB (131 ficheros) del original en BF16.

El modelo está etiquetado como MoE (mezcla de expertos) y orientado a generación de texto conversacional, con soporte declarado de inglés, coreano, chino, japonés y multilingüe. La licencia indicada es qwen-community-1.0 (registrada en HuggingFace como "other"). Se apoya en llama.cpp (se menciona la build b11048+) y se publica junto a un mecanismo de confianza denominado ZTC (Zero-Token Confidence).

Su relevancia actual radica en que mantiene la calidad del original en BF16 según la propia model card: MMLU-Pro con 2.000 preguntas emparejadas da 87,65% frente a 87,65% del original (diferencia +0,00 puntos, IC 95% [−0,95, +1,00]). Además, el modelo genera respuestas más cortas (−14,5% de tokens de media) y ofrece una señal de confianza calibrada (ZTC AUC 0,758) que permite filtrar respuestas de baja fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como MoE (mezcla de expertos) en la model card |
| Parametros totales | 176.943.899.520 (aprox. 176,9B, dato real de safetensors del modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato GGUF; se menciona uso de imatrix |
| Idiomas soportados | Ingles, coreano, chino, japones y multilingue |
| Licencia | qwen-community-1.0 (registrada como "other" en HuggingFace) |
| Formato de pesos | GGUF (4 ficheros, 111,3 GB) |
| Modelo base | FINAL-Bench/Darwin-180B-RSI-R3 |
| Libreria de inferencia | llama.cpp (build b11048+) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Darwin-180B-RSI-R3 mas alla de la etiqueta "moe" (mezcla de expertos) y de su naturaleza de transformer de gran escala orientado a generacion de texto. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El nombre de la familia ("RSI", por self-improving / recursive self-improvement) y las etiquetas "darwin-rsi" y "model-level-rsi" sugieren un proceso de mejora iterativa por rondas, ya que el modelo base se identifica como "RSI Round 2".

La aportacion tecnica de esta publicacion es la cuantizacion: un build de 4 bits para llama.cpp que reduce el peso de 360 GB a 111,3 GB manteniendo, segun el autor, la puntuacion de MMLU-Pro identica a la del BF16. Se menciona el uso de imatrix en el proceso de cuantizacion. Ademas, se incluye un mecanismo propietario llamado ZTC (Zero-Token Confidence) que lee el estado interno del modelo para estimar la fiabilidad de su propia respuesta, con un AUC de 0,758 y una precision del 97,5% en el 20% de preguntas sobre las que declara mayor seguridad. El fichero de sonda y el script se distribuyen en la carpeta `ztc/` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado: text-generation).
- Razonamiento de nivel frontera segun los resultados publicados por el autor: GPQA Diamond 94,44%, MMLU-Pro 88,12%, MMMU-Pro 79,48%, AIME 2026 100%, HMMT Febrero 2026 100%.
- Razonamiento matematico avanzado (AIME, HMMT) y conocimientos cientificos de posgrado (GPQA Diamond).
- Razonamiento multimodal aparente: se publica una puntuacion de MMMU-Pro (79,48%), aunque no se detalla el tipo de entradas soportadas.
- Razonamiento juridico: LEXam 68,94% y LEXam-hard 45,72%.
- Capacidades multilingues declaradas en ingles, coreano, chino y japones, ademas de "multilingual".
- Estimacion de confianza propia mediante ZTC (Zero-Token Confidence), con AUC 0,758.
- Soporte de ejecucion en llama.cpp, lo que habilita integracion en entornos on-device y sin GPU.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito ("thinking mode") o soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de audio o vision explicita: no disponible en la informacion proporcionada (mas alla de la mencion a MMMU-Pro).

## Casos de uso

- Asistente local en portatil de gama alta: el modelo cabe en una GPU de 8 GB con 32 GB de RAM y rinde a 4,17 tokens/s en una RTX 5060 Laptop, lo que permite asistentes privados sin conexion para redaccion, resumen y consultas tecnicas.
- Inferencia en mini PC sin GPU: con 128 GB de RAM el modelo completo reside en memoria, ideal para desplegar un asistente interno en oficinas o laboratorios donde no se quieren tarjetas graficas dedicadas.
- Servidor de CPU dedicado: a 18-21 tokens/s en un zocalo de servidor con 78,8 GB de RAM en pico, es viable montar un endpoint de generacion de texto para uso interno con carga moderada.
- Razonamiento cientifico y matematico asistido: sus puntuaciones en GPQA Diamond, AIME 2026 y HMMT lo hacen adecuado para apoyar a investigadores en la resolucion de problemas de posgrado y competicion, siempre con supervision humana.
- Revision documental y legal asistida: las puntuaciones en LEXam y LEXam-hard permiten usar el modelo como primer filtro en analisis de contratos o normativa, dejando la validacion final a un profesional.
- Filtrado automatico por confianza en produccion: el modulo ZTC permite descartar o escalar a revision humana las respuestas de baja confianza, reduciendo el coste de verificacion en pipelines automatizados.
- Generacion de texto multilingue para mercados asiaticos: el soporte de coreano, chino y japones lo habilita para localizacion de contenidos, atencion al cliente o resumen de documentacion en esas lenguas.
- Evaluacion y experimentacion en investigacion: al ser un modelo frontera ejecutable en hardware economico, sirve como banco de pruebas para estudios de cuantizacion, calibracion de confianza y mejora recursiva.

## Benchmarks y rendimiento

La model card publica los siguientes resultados. Conviene notar una discrepancia interna en el propio material: la insignia de MMLU-Pro indica 88,12% mientras que el texto comparativo indica 87,65%. Se reproducen ambos tal cual aparecen.

| Benchmark | Resultado POCKET-Darwin-180B | Referencia BF16 (modelo original) |
|---|---|---|
| MMLU-Pro | 88,12% (insignia) / 87,65% (texto) | 87,65% |
| GPQA Diamond | 94,44% | No disponible |
| MMMU-Pro | 79,48% | No disponible |
| AIME 2026 | 100% | No disponible |
| HMMT Febrero 2026 | 100% | No disponible |
| LEXam (derecho) | 68,94% | No disponible |
| LEXam-hard (derecho) | 45,72% | No disponible |
| ZTC AUC (confianza) | 0,758 | No disponible |

Nota metodologica declarada por el autor: la comparacion de MMLU-Pro se hizo con 2.000 preguntas emparejadas, con una diferencia de +0,00 puntos y un intervalo de confianza del 95% de [−0,95, +1,00]. La longitud media de respuesta en esas mismas 2.000 preguntas fue de 3.694 tokens frente a 4.322 del build padre en el mismo formato (−14,5%). No se han publicado en la informacion disponible comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- Portatil con GPU de 8 GB y 32 GB de RAM: funciona, con un rendimiento medido de 4,17 tokens/s en una RTX 5060 Laptop GPU.
- Mini PC con 128 GB de RAM y sin GPU: el modelo completo cabe en memoria y se ejecuta en CPU.
- Servidor solo CPU: 18-21 tokens/s en un zocalo de servidor, con un pico de 78,8 GB de RAM.
- NVIDIA DGX Spark: soportado en una sola maquina segun la model card.
- GPU de centro de datos unica: la model card indica que funciona en una sola GPU de datacenter, aunque no se especifica el modelo concreto.
- VRAM estimada: no disponible como cifra desglosada; el peso total del repositorio es de 111,3 GB, por lo que la GPU sola no lo aloja y requiere apoyo de RAM del sistema.
- Comparativa de coste declarada por el autor: un portatil gaming de unos 1.500 USD frente a un servidor de 8x H100 estimado en mas de 350.000 USD para servir el original en BF16.
- Opciones de despliegue: llama.cpp (build b11048+). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 4,17 tokens/s en GPU de portatil; 18-21 tokens/s en CPU de servidor. No se indican metricas de latencia por peticion ni throughput agregado bajo batching.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este build con su propio modelo base y con el original en BF16. No se dispone de datos de otros modelos de tamano o tarea equivalentes.

| Modelo | Parametros | Formato y tamano | Hardware minimo declarado | MMLU-Pro | Licencia |
|---|---|---|---|---|---|
| POCKET-Darwin-180B-GGUF (este modelo) | 176,9B | GGUF 4 bits, 111,3 GB, 4 ficheros | Portatil 8 GB GPU + 32 GB RAM; mini PC 128 GB RAM; CPU | 87,65% (texto) / 88,12% (insignia) | qwen-community-1.0 |
| Darwin-180B-RSI-R3 (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Darwin-180B-RSI original (BF16) | No disponible | BF16, 360 GB, 131 ficheros | 4-8x NVIDIA B200 o 8x NVIDIA H100 de 80 GB | 87,65% | No disponible |

Alternativas de otros desarrolladores con el mismo tamano o tarea: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Existe una discrepancia interna en la model card sobre MMLU-Pro (87,65% en el texto frente a 88,12% en la insignia); conviene verificar la cifra antes de usarla como referencia.
- No se detallan la longitud de contexto soportada, el numero de parametros activos ni la arquitectura concreta, lo que dificulta planificar despliegues con requisitos de contexto largo.
- No hay informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO).
- Riesgo de alucinacion: inherente a los modelos generativos; el propio autor ofrece ZTC como mitigacion parcial, pero solo cubre la autoevaluacion de confianza y no elimina el error.
- El rendimiento en GPU de portatil es bajo (4,17 tokens/s), insuficiente para interacciones fluidas o cargas concurrentes.
- El uso en CPU a 18-21 tokens/s requiere un zocalo de servidor y alrededor de 79 GB de RAM en pico; no es apto para maquinas modestas.
- Los idiomas soportados se limitan a ingles, coreano, chino, japones y la etiqueta generica "multilingual"; el soporte de castellano no se declara explicitamente.
- La licencia qwen-community-1.0 (registrada como "other") puede imponer restricciones de uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de un despliegue en produccion.
- Los resultados de benchmarks juridicos (LEXam 45,72% en la variante hard) no son suficientes para uso profesional sin revision humana.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso, lo que limita su integracion en pipelines automatizados complejos.
- El repositorio ocupa 111,3 GB, por lo que la descarga y el almacenamiento requieren planificacion de disco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Modelo base (RSI Ronda 2): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Modelo original de la familia: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Modelo hermano de menor tamano: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Coleccion Darwin Family: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Coleccion ZTC Models: https://huggingface.co/collections/FINAL-Bench/ztc-models-jev-ecosystems
- Paper Darwin Family: https://arxiv.org/abs/2605.14386
- Paper Latin Square: https://huggingface.co/papers/2609.20269
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del desarrollador (VIDRAFT): https://vidraft.net
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- Dataset AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- Dataset HMMT Febrero 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- Dataset LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- Dataset LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
