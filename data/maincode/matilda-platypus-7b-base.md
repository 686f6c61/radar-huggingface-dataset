# Maincode/Matilda-Platypus-7B-Base

## Resumen

Matilda Platypus 7B es un modelo de lenguaje de tamaño intermedio desarrollado por Maincode (Matilda Research) mediante una técnica de "Representation Bridge": se conectan las capas inferiores de un modelo preentrenado mayor (Qwen3-8B-Base) con las capas superiores de uno menor (Qwen3-4B-Base), alineando las representaciones ocultas en el punto de unión mediante un mapa lineal aprendido. El resultado es un modelo de 6,96B de parámetros que consume 13,3 GFLOP por token (el 84% del cómputo del padre mayor) y que, según la evaluación de los autores, supera al padre pequeño en 11 de 13 benchmarks y al padre grande en 3 de 13.

El problema que aborda es la falta de granularidad en el escalado de modelos abiertos: en lugar de elegir entre 4B u 8B, el método permite construir checkpoints de tamaño intermedio reutilizando pesos preentrenados existentes, lo que reduce drásticamente el coste de entrenamiento frente a un preentrenamiento desde cero. Es relevante porque propone una vía eficiente para poblar el hueco entre tamaños comerciales de modelos abiertos.

Se trata de un modelo base (sin ajuste por instrucciones ni tuning de seguridad), con arquitectura transformer híbrida por ensamblado de capas, tokenizer de Qwen3 y licencia Apache 2.0. Es adecuado para investigación sobre métodos de ensamblado de modelos y como punto de partida para fine-tuning, no para uso conversacional directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por ensamblado de capas (25 capas de Qwen3-8B-Base + Representation Bridge lineal + 11 capas de Qwen3-4B-Base), corte "25+11" |
| Parametros totales | 6,96B (incluido el bridge de 10,5M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos en cada pasada) |
| Longitud de contexto | no disponible (heredada de Qwen3; el model card no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible explícitamente; heredados de los padres Qwen3 y de los datos de adaptación (texto web, código y matemáticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bridge.safetensors y upper_block/; el bloque inferior se descarga de Qwen/Qwen3-8B-Base); requiere trust_remote_code=True |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado de forma unitaria, sino un ensamblado: el forward pass ejecuta el embedding y las capas 1-25 de Qwen3-8B-Base (congeladas en sus pesos originales), a continuación un Representation Bridge, un mapa lineal de 4096 a 2560 unidades ocultas con 10,5M de parámetros que alinea las dimensiones de los dos padres, y finalmente las capas 26-36 de Qwen3-4B-Base junto con su normalización final y su cabeza de salida (adaptadas con actualizaciones de bajo rango ya fusionadas). El tokenizador es el de Qwen3 y se mantiene un KV cache por bloque.

El entrenamiento se realizó en tres fases: primero, inicialización del bridge por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para seleccionar el punto de corte entre candidatos; segundo, adaptación supervisada del bridge y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones desarrolladas, con el bloque inferior congelado; tercero, una etapa corta de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuestas comprobables. No se aplicó RLHF ni DPO convencionales según la información disponible.

## Capacidades

- Generación de texto en continuacion (modelo base): completa texto, sin seguir instrucciones ni mantener conversaciones.
- Generación de código: HumanEval pass@1 de 0,689 y MBPP pass@1 de 0,668, por encima del padre de 4B y, en HumanEval, del de 8B.
- Razonamiento matemático: GSM8K (8-shot CoT) de 0,875, el mejor de los tres modelos comparados.
- Razonamiento general: BBH (3-shot CoT) de 0,746 y MMLU (5-shot) de 0,763.
- Conocimiento común y lenguaje: WinoGrande 0,710, PIQA 0,784, HellaSwag 0,758, LAMBADA 0,693.
- Compatibilidad total con la API estándar de generate de transformers: max_new_tokens, do_sample, temperature, top_k, top_p, repetition_penalty, stopping_criteria, logits_processor, streamer, entre otros; funciona sin cambios bajo lm-eval-harness.
- No soporta tool calling, function calling ni agentes: es un modelo base sin ajuste por instrucciones.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en métodos de ensamblado de modelos: es el caso de uso principal; permite estudiar cómo alinear representaciones entre checkpoints de distinta anchura y reproducir el método del corte 25+11 con otros padres.
- Fine-tuning posterior para instrucciones: al ser un modelo base con licencia permisiva, sirve como punto de partida para SFT/DPO propios, especialmente en dominios de código y matemáticas donde sus benchmarks destacan.
- Evaluación comparativa de modelos base: al ejecutarse sin cambios bajo lm-eval-harness (--model hf --model_args pretrained=...,trust_remote_code=True), es útil como baseline en pipelines de evaluación automatizadas.
- Generación de código como completación: en un IDE o pipeline de autocompletado tipo FIM, donde el modelo completa código dado un prefijo; su 0,689 en HumanEval lo sitúa por encima de ambos padres en esa tarea.
- Resolución de problemas matemáticos por completación: generación de soluciones paso a paso (chain-of-thought) a partir de enunciados formateados, aprovechando el 0,875 en GSM8K.
- Despliegue con cómputo ajustado: con 13,3 GFLOP por token frente a 15,7 del padre de 8B, es adecuado para escenarios donde se busca retener gran parte de la calidad del modelo grande reduciendo el coste de inferencia por token.
- Investigación sobre destilación estructural y selección de cortes: el reporte técnico publica el protocolo de selección de cortes por pérdida de modelado, replicable en otros pares de modelos.

## Benchmarks y rendimiento

Evaluación con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot opción múltiple, MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot y MBPP 3-shot con ejecución del código):

| Benchmark | Qwen3-4B-Base | Platypus 7B | Qwen3-8B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,628 | 0,689 | 0,677 |
| GSM8K (8-shot CoT) | 0,844 | 0,875 | 0,862 |
| MMLU (5-shot) | 0,730 | 0,763 | 0,768 |
| BBH (3-shot CoT) | 0,712 | 0,746 | 0,774 |
| HellaSwag | 0,737 | 0,758 | 0,786 |
| ARC-Easy | 0,761 | 0,782 | 0,798 |
| ARC-Challenge | 0,517 | 0,527 | 0,572 |
| OpenBookQA | 0,406 | 0,418 | 0,416 |
| WinoGrande | 0,702 | 0,710 | 0,723 |
| PIQA | 0,778 | 0,784 | 0,794 |
| LAMBADA | 0,691 | 0,693 | 0,711 |
| MBPP pass@1 | 0,672 | 0,668 | 0,696 |
| BoolQ | 0,832 | 0,820 | 0,832 |

Supera al padre pequeño en 11 de 13 benchmarks y al padre grande en 3 de 13, con el 84% del cómputo del padre mayor (13,3 frente a 15,7 GFLOP por token; el padre pequeño consume 8,7). Los autores advierten que las diferencias de unas décimas de punto están dentro de la varianza entre ejecuciones. Nota importante: la revisión 1 del código remoto ignoraba max_length y stopping_criteria, subestimando los benchmarks generativos (GSM8K leía ~0,58); la revisión 2 (2026-10-31) corrige esto sin cambiar los pesos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 8,1 GB en safetensors, más el bloque inferior descargado de Qwen3-8B-Base; en bfloat16 cabe en una GPU de 16 GB con holgura. No hay cifras oficiales de VRAM publicadas.
- GPU recomendadas: cualquier GPU de consumo con 16-24 GB (RTX 4090, RTX 5090) es suficiente para inferencia en bfloat16; no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en una RTX 4090 de 24 GB con holgura para contextos largos; probablemente también en GPUs de 16 GB.
- Despliegue: vía transformers >= 4.56 (probado en 4.56 y 5.x) con trust_remote_code=True. No hay soporte oficial anunciado para vLLM, llama.cpp, Ollama ni TGI; dado que requiere código remoto que carga los dos padres por separado, la compatibilidad con motores de inferencia optimizados no está garantizada.
- Latencia y throughput: no disponibles como mediciones; el reporte solo publica el cómputo relativo de 13,3 GFLOP por token, que no es una medida verificada de latencia ni de coste.
- Nota operativa: el código remoto descarga Qwen/Qwen3-8B-Base desde el hub en tiempo de ejecución, por lo que se necesita acceso a ese repositorio y espacio adicional en disco.

## Comparativa con modelos similares

| Característica | Matilda Platypus 7B (Base) | Qwen3-4B-Base | Qwen3-8B-Base |
|---|---|---|---|
| Parametros | 6,96B | 4B | 8B |
| Cómputo por token | 13,3 GFLOP (84% del 8B) | 8,7 GFLOP | 15,7 GFLOP |
| MMLU (5-shot) | 0,763 | 0,730 | 0,768 |
| GSM8K (8-shot CoT) | 0,875 | 0,844 | 0,862 |
| HumanEval pass@1 | 0,689 | 0,628 | 0,677 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | Hub de Hugging Face, código remoto | Hub de Hugging Face, soporte nativo amplio | Hub de Hugging Face, soporte nativo amplio |

Frente a sus dos padres, Platypus 7B se posiciona como un punto intermedio: mejor que el 4B en casi todo y competitivo con el 8B en código y matemáticas con menos cómputo. Su principal desventaja práctica es el soporte del ecosistema: los padres Qwen3 funcionan de forma nativa en vLLM, llama.cpp y Ollama, mientras que Platypus requiere código remoto de transformers. No hay otros modelos ensamblados por bridges de representación públicamente comparables en la información disponible.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado en seguridad. Continúa texto y puede producir contenido ofensivo o dañino sin filtros; no debe desplegarse tal cual en producción orientada a usuarios.
- Riesgo de alucinación estándar de modelos base, agravado por la ausencia de alineación: no distingue entre hechos y continuaciones plausibles.
- Las diferencias de unas décimas frente a los padres están dentro de la varianza entre ejecuciones según los propios autores; no debe sobreinterpretarse la superioridad en benchmarks individuales.
- La revisión 1 del código remoto contenía un bug que truncaba respuestas y subestimaba benchmarks generativos; es imprescindible usar la revisión 2 o posterior del código remoto (los pesos no cambian).
- Beam search no está implementado (lanza NotImplementedError); solo decodificación greedy y por muestreo.
- Requiere trust_remote_code=True, lo que implica ejecutar código arbitrario del repositorio y una dependencia en tiempo de ejecución de Qwen/Qwen3-8B-Base alojado en el hub.
- La longitud de contexto y los idiomas soportados no están documentados explícitamente; se heredan de Qwen3 y de los datos de adaptación sin verificación oficial.
- No hay soporte oficial para vLLM, llama.cpp ni Ollama; el despliegue optimizado puede requerir trabajo de integración propio.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los términos de Qwen3 aplican indirectamente a los pesos heredados de los padres.
- Los autores publican el cómputo como medida relativa normalizada, no como medición verificada de latencia ni coste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maincode/Matilda-Platypus-7B-Base
- Modelo padre (bloque inferior): https://huggingface.co/Qwen/Qwen3-8B-Base
- Modelo padre (bloque superior): https://huggingface.co/Qwen/Qwen3-4B-Base
- Reporte técnico de Qwen3 (referenciado en el model card): arXiv:2505.09388, https://arxiv.org/abs/2505.09388
- Reporte técnico de Matilda Platypus: incluido en el repositorio como technical_report.pdf (no disponible como enlace externo en la información proporcionada)
