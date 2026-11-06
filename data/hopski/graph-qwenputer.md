# hopski/graph-qwenputer

## Resumen

Graph Qwenputer es un checkpoint derivado de Qwen3.5-4B en el que se han insertado 11 capas adicionales delante de las 32 originales del modelo base. Esas capas implementan una CPU RV32IM (con extension Zba) compilada mediante el proyecto Qwenputer, junto con 85 unidades de salida adicionales que permiten a la máquina emitir tokens ordinarios. El resultado es un modelo que, con el firmware y el driver adecuados, puede leer y escribir un grafo tipado y dirigido de hasta 1.024 nodos desde dentro de su propia ejecución. Lo publica el usuario hopski en Hugging Face bajo licencia Apache 2.0.

La propuesta es inusual: no se entrena nada. Los 424 tensores originales de Qwen3.5-4B permanecen bit a bit idénticos y las capas nuevas son pesos compilados que representan una máquina virtual. El modelo no contiene conocimiento sobre ningún grafo concreto; el firmware y la estructura del grafo se cargan en el estado de ejecución después del prompt, de modo que los pesos por sí solos son una máquina vacía que requiere el driver y el firmware del repositorio del proyecto.

Su relevancia es fundamentalmente experimental: demuestra que es posible incrustar un intérprete de CPU dentro de un transformer sin reentrenar, a costa de un rendimiento muy bajo (una consulta al grafo tarda minutos frente a milisegundos de una herramienta convencional) y de una fiabilidad dependiente del enrutado de tokens del driver. No es un modelo para producción, sino una prueba de concepto sobre cómputo simbólico dentro de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con 11 capas adicionales que implementan una CPU RV32IM + Zba compilada |
| Parametros totales | 9.381.981.888 (9,38 mil millones, segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only, y le antepone 11 capas que no son neuronas entrenadas sino pesos compilados que implementan una CPU RISC-V de 32 bits con el conjunto base RV32IM y la extension Zba (aritmetica de direcciones). Estas capas se generan con el compilador Qwenputer, de Divyansh Agrawal, que traduce la lógica de la máquina a tensores compatibles con el formato de transformers. Se añaden además 85 unidades de salida ("exit units") que permiten que la máquina emita tokens normales del vocabulario.

No hay entrenamiento ni ajuste fino: los 424 tensores del modelo base son bit a bit idénticos a los de Qwen3.5-4B. El checkpoint completo ocupa 18,76 GB y no cambia entre compilaciones de firmware, porque el firmware y el grafo se inyectan en el estado de ejecución en tiempo de inferencia, no en los pesos. La innovación técnica consiste en aprovechar el mecanismo de atención y las capas del transformer como sustrato para ejecutar instrucciones de una CPU virtual, con el driver del proyecto encargándose de ofrecer la herramienta, cargar la memoria y enrutar los tokens.

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-4B.
- Lectura y escritura de un grafo tipado y dirigido de hasta 1.024 nodos desde dentro de la ejecución del modelo.
- Operaciones de grafo expuestas como llamadas: `path`, `neighbours`, `add_node` y `link`.
- Ejecución de firmware cargado externamente en el estado de ejecución tras el prompt.
- Emisión de tokens ordinarios mediante las 85 unidades de salida añadidas.
- El ejemplo trabajado del proyecto es la red de metro de Nueva York, aunque el grafo puede ser cualquiera.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido más allá de lo que herede del modelo base.

## Casos de uso

- Investigación sobre cómputo simbólico en transformers: permite estudiar cómo un modelo de lenguaje puede alojar un intérprete de CPU y ejecutar operaciones deterministas sobre estructuras de datos, sirviendo como banco de pruebas para arquitecturas híbridas neurosimbólicas.
- Experimentos de grafo en el estado de ejecución: cargar un grafo propio (por ejemplo, una topología de red, un árbol genealógico o un grafo de dependencias) y consultar rutas o vecinos mediante las llamadas `path` y `neighbours`, siempre con el driver y el firmware del proyecto.
- Docencia y divulgación: ilustrar de forma tangible cómo se compila una máquina virtual a pesos de un transformer y cómo se enrutan tokens para que la máquina "hable", usando el ejemplo del metro de Nueva York como caso reproducible.
- Pruebas de robustez del enrutado de tokens: evaluar cómo se comporta un modelo cuando el driver impone un enrutado frente a un bucle de top-token simple, que según el autor acertó en 6 de 6 trayectos probados pero unas cinco veces más lento y con una respuesta posterior de Qwen inservible.
- Reproducción de los "real-weights runs" del proyecto: utilizar el checkpoint de 18,76 GB tal cual para replicar los experimentos publicados en el repositorio.
- Base para extensiones del compilador Qwenputer: modificar el firmware o añadir instrucciones y recompilar las capas, aprovechando que los pesos de Qwen permanecen intactos y que el checkpoint no cambia entre compilaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta observaciones cualitativas: una consulta al grafo tarda minutos frente a milisegundos de una herramienta convencional, y un bucle de top-token sin el enrutado del driver acertó en 6 de 6 trayectos probados, aproximadamente cinco veces más lento y con una respuesta posterior de Qwen inservible.

## Requisitos de hardware

- El repo pesa 18,9 GB y el checkpoint 18,76 GB en safetensors, por lo que en precisión original requiere del orden de 19 GB de VRAM solo para los pesos, más overhead de activaciones y estado de ejecución.
- GPU recomendadas para inferencia en precisión completa: A100 40 GB, H100, o GPUs consumer con 24 GB o más (RTX 3090, RTX 4090) siempre que el resto del estado quepa en memoria.
- En GPUs consumer de 16 GB o menos no cabe en precisión original; no se documentan cuantizaciones GGUF ni versiones reducidas.
- Opciones de despliegue: transformers con el driver y el firmware del repositorio del proyecto; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una consulta al grafo tarda minutos; no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad de grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Graph Qwenputer | 9,38 mil millones (4B base + capas compiladas) | No disponible | Si, grafo de hasta 1.024 nodos via CPU RV32IM embebida | Apache 2.0 | Hugging Face, requiere driver y firmware |
| Qwen3.5-4B | 4 mil millones (aproximado, segun nombre) | No disponible | No | Apache 2.0 | Hugging Face |
| Herramientas externas de grafo (p. ej. librerias de grafos) | No aplica | No aplica | Si, con latencia de milisegundos | Variable | Estandar |

La comparación relevante es frente al propio Qwen3.5-4B, del que hereda el comportamiento conversacional, y frente a herramientas de grafo convencionales, que segun el autor obtienen las mismas respuestas en milisegundos. No se dispone de datos de benchmarks para comparar rendimiento de razonamiento o codigo con alternativas.

## Limitaciones y advertencias

- Los pesos no contienen ningún grafo: sin el driver y el firmware del repositorio del proyecto, el modelo es una máquina vacía y no puede realizar las operaciones de grafo.
- El driver es imprescindible: sin su enrutado de tokens, un bucle de top-token simple es unas cinco veces más lento y la respuesta posterior de Qwen resulta inservible.
- Rendimiento muy bajo: una consulta al grafo tarda minutos, mientras que una herramienta convencional tarda milisegundos y obtiene las mismas respuestas.
- El juicio de Qwen es la parte débil, segun reconoce el autor en los problemas conocidos del repositorio.
- Riesgo de alucinación heredado del modelo base, agravado por la complejidad del enrutado.
- No se documentan sesgos específicos, idiomas soportados ni longitud de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto depende de Qwenputer (MIT) y de Qwen3.5-4B (Apache 2.0 segun su model card); conviene revisar las licencias de ambos componentes.
- No apto para producción: es una prueba de concepto experimental con solo 2 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hopski/graph-qwenputer
- Repositorio del proyecto (driver y firmware): https://github.com/ho3h/graph-qwenputer
- Compilador Qwenputer de Divyansh Agrawal: https://github.com/divagr18/qwenputer
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
