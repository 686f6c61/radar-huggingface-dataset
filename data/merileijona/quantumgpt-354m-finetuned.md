# merileijona/quantumgpt-354m-finetuned

## Resumen

QuantumGPT-354M-finetuned es un modelo de lenguaje especializado en la generación de circuitos cuánticos en formato OpenQASM, desarrollado por merileijona. Se trata de la variante de 354 millones de parámetros de la familia QuantumGPT, construida sobre la arquitectura GPT-2 medium (24 capas, 16 cabezas de atención, 1024 dimensiones de embedding) y ajustada mediante una receta de fine-tuning denominada "format-anchor" que ya demostró buenos resultados en el modelo hermano de 124M. El modelo resuelve el problema de traducir descripciones en lenguaje natural a circuitos cuánticos ejecutables, un paso clave para automatizar el diseño de algoritmos cuánticos.

Su relevancia actual radica en que combina un tamaño moderado (354M) con una ventana de contexto nativa de 512 tokens, suficiente para circuitos de complejidad media, y una licencia MIT que permite uso comercial sin restricciones. Está entrenado exclusivamente en inglés y orientado a tareas de investigación y educación en computación cuántica. Los resultados de benchmark publicados son prometedores, aunque el autor ha señalado una corrección pendiente en el extractor de métricas, por lo que las cifras deben tratarse como provisionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 medium (decoder-only, 24 capas, 16 cabezas, 1024 embd) |
| Parametros totales | 354.347.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 medium, un transformer decoder-only con 24 capas, 16 cabezas de atención y dimensiones de embedding de 1024. No emplea mecanismos de mezcla de expertos ni arquitecturas híbridas; es un modelo denso clásico. La ventana de contexto es de 512 tokens, que es la nativa de GPT-2 medium y no requirió modificaciones estructurales.

El entrenamiento consistió en una continuación del fine-tuning desde el modelo base público quantumgpt-354m, utilizando el dataset merileijona/quantum-circuits-21k, que contiene pares validados de descripciones en lenguaje natural y circuitos OpenQASM. La receta incluye oversampling de circuitos con anclaje de formato (format-anchor) y de circuitos largos, ambos con factor ×2, además de aumentación por paráfrasis determinista. Se aplicó una tasa de aprendizaje de 5e-6 con programación coseno, enmascaramiento de pérdida solo en la finalización (completion-only loss masking) y un tamaño de lote efectivo de 4 mediante acumulación de gradientes. Se entrenó una época por semilla, con dos semillas distintas (42 y 43). No se realizaron mutaciones de arquitectura, a diferencia de la variante 124M v3.

## Capacidades

- Generacion de circuitos cuanticos en OpenQASM a partir de descripciones en lenguaje natural.
- Comprension semantica de circuitos: el modelo distingue entre sintaxis valida, compilacion correcta y ejecucion con fidelidad alta (segun los benchmarks QSemBench).
- Generalizacion a variaciones de prompts: muestra robustez frente a perturbaciones en la entrada (metricas qrobust).
- Generacion de codigo eficiente: mantiene un 100% en la metrica de eficiencia, lo que sugiere que los circuitos generados no contienen redundancias innecesarias.
- No soporta tool calling, function calling, ni capacidades multimodales (vision, audio).
- No dispone de modo de razonamiento explicito ni de capacidades multilingues: solo ingles.

## Casos de uso

- Generacion automatica de circuitos para simulacion cuantica: un investigador puede describir un algoritmo en lenguaje natural (por ejemplo, "preparar un estado de Bell") y obtener el codigo OpenQASM listo para ejecutar en simuladores como Qiskit o QASM simulator.
- Educacion en computacion cuantica: estudiantes pueden usar el modelo para explorar como se traducen conceptos teoricos a circuitos concretos, verificando luego la salida con herramientas estandar.
- Prototipado rapido de algoritmos cuanticos: en fases iniciales de diseno, el modelo acelera la generacion de borradores de circuitos que luego se refinan manualmente.
- Automatizacion de documentacion tecnica: a partir de descripciones de circuitos en texto, el modelo puede producir el codigo correspondiente para incluir en informes o articulos.
- Generacion de casos de prueba para compiladores cuanticos: el modelo puede crear circuitos variados que sirvan para validar el comportamiento de compiladores o optimizadores de circuitos.
- Investigacion en generacion de codigo cuantico: sirve como base para estudios sobre scaling laws en modelado de lenguaje para dominios cientificos especificos, como el paper que documenta su desarrollo.

## Benchmarks y rendimiento

Los resultados publicados corresponden al benchmark QSemBench-dev-v0.1 (n=120, decodificacion greedy), que evalúa sintaxis, compilacion, semantica, ejecucion, generalizacion, robustez y eficiencia. El autor advierte de un defecto en el extractor de stop-marker que requiere una rerun corregida; las cifras siguientes son historicas y provisionales.

| Metrica | Base 354M | Fine-tuned (seed 42) | Fine-tuned (seed 43) |
|---|---|---|---|
| qsyntax | 95.00 | 95.83 | 95.83 |
| qcompile | 95.00 | 95.83 | 95.83 |
| qsemantic | 75.83 | 95.83 | 94.17 |
| qexecute | 75.83 | 95.83 | 94.17 |
| qgeneralize | 72.16 | 94.85 | 93.81 |
| qrobust | 83.52 | 95.65 | 96.46 |
| qefficiency | 100.00 | 100.00 | 100.00 |
| QSS-Core v0.1 | 79.17 | 95.87 | 94.80 |

No se dispone de comparaciones con modelos externos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 354M de parametros en precision fp16 ocupa aproximadamente 708 MB solo en pesos. Con overhead de activaciones y memoria del runtime, se estima un consumo total de 1-2 GB en inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060 o superiores pueden ejecutarlo sin problemas. Tambien es viable en CPU para inferencia lenta.
- Cabe en GPUs consumer de gama baja y media, incluyendo tarjetas integradas con suficiente RAM compartida.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, Hugging Face TGI, o ejecutarse localmente con la libreria transformers. No se han publicado archivos GGUF ni integraciones con Ollama o llama.cpp.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna (p. ej., RTX 3090), se espera una latencia por token del orden de milisegundos, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

La comparacion se limita a la familia QuantumGPT, ya que no se han identificado otros modelos publicos especializados en generacion de circuitos cuanticos con caracteristicas comparables.

| Modelo | Parametros | Contexto | QSS-Core v0.1 | Licencia |
|---|---|---|---|---|
| quantumgpt-124m-v2 baseline | 124M | 512 | 75.00 | MIT |
| quantumgpt-354m base | 354M | 512 | 79.17 | MIT |
| quantumgpt-124m-v3 (ctx512) | 124M | 512 | 97.70 / 97.28 | MIT |
| quantumgpt-354m fine-tuned | 354M | 512 | 95.87 / 94.80 | MIT |

El modelo fine-tuned de 354M supera claramente a su version base y al v2 de 124M, pero queda por detras del 124M v3 en las metricas historicas. No obstante, la correccion pendiente del evaluador puede alterar estas cifras.

## Limitaciones y advertencias

- El benchmark de desarrollo comparte el generador de datos con el conjunto de entrenamiento, lo que puede inflar los resultados y limitar la evaluacion de generalizacion real.
- Las restricciones de negacion (por ejemplo, "no usar puerta X") se siguen de forma debil, lo que puede producir circuitos incorrectos en esos casos.
- El modelo no tiene comportamiento de rechazo: ante entradas invalidas o ambiguas, generara una salida en lugar de indicar que no puede procesarla.
- Solo soporta ingles; las descripciones en otros idiomas pueden producir resultados degradados.
- Todos los circuitos generados deben verificarse antes de ejecutarse en hardware cuantico real o en simuladores, ya que no hay garantia de correccion semantica.
- La licencia MIT permite uso comercial, pero el autor no ofrece soporte ni garantias de exactitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merileijona/quantumgpt-354m-finetuned
- Modelo base: https://huggingface.co/merileijona/quantumgpt-354m
- Repositorio GitHub del proyecto: https://github.com/juhanimerilehto/quantumgpt
- Perfil del autor en GitHub: https://github.com/arcticdragon-fi
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/merileijona/quantumgpt-354m-finetuned
- Paper de referencia: "QuantumGPT: A Data Scaling Study for Quantum Circuit Generation", Merilehto 2026 (disponible en el repositorio GitHub).
