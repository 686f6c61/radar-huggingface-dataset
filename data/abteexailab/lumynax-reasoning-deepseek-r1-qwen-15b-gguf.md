# AbteeXAILab/lumynax-reasoning-deepseek-r1-qwen-15b-gguf

## Resumen

LumynaX Reasoning DeepSeek R1 Distill Qwen 1.5B GGUF es un paquete de inferencia local que envuelve el modelo DeepSeek-R1-Distill-Qwen-1.5B de DeepSeek en formato GGUF, distribuido por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), como parte de su familia de modelos de IA soberana LumynaX. El paquete implementa el concepto de "infusion" de LumynaX: el modelo actua como capa de ejecucion especializada orquestada por el nucleo LumynaX Core, que gestiona el razonamiento, el contexto y la planificacion agente alrededor de la inferencia.

Con 1.777 millones de parametros (1,5B), el modelo esta disenado para ejecucion local en hardware de consumo, con licencia MIT y soporte para ingles y maori. La propia model card lo declara como un artefacto de investigacion legacy y desactualizado, no recomendado para produccion, pero conservado con fines de reproducibilidad y trazabilidad cientifica.

La relevancia de este lanzamiento reside en su enfoque de soberania de IA: un modelo de razonamiento de tamano reducido, empaquetado para ejecucion local, que demuestra el pipeline de "infusion" de LumynaX sin modificar los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con destilacion de razonamiento de DeepSeek R1 |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (tipos concretos no especificados; repositorio de 1,1 GB, tag imatrix presente) |
| Idiomas soportados | Ingles (en), maori (mi) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una conversion a GGUF de DeepSeek-R1-Distill-Qwen-1.5B, un modelo de razonamiento destilado a partir de DeepSeek R1 sobre la arquitectura Qwen2.5-1.5B. La destilacion fue realizada por DeepSeek; AbteeX AI Labs no modifico los pesos (weight composition: none), sino que integro el modelo en su framework de "infusion" mediante enrutamiento en tiempo de ejecucion (routed infusion).

El concepto de infusion de LumynaX establece que LumynaX Core actua como capa de inteligencia principal, dirigiendo la inferencia a traves del modelo seleccionado sin alterar sus pesos. En este lanzamiento, la integracion es de tipo "routed infusion": el nucleo LumynaX orquesta la ejecucion, aplica controles de soberania, gestiona el contexto y la planificacion agente alrededor del modelo. No se realizo ninguna fusion de pesos ni composicion MoE.

El paquete se distribuye con artefactos de reproducibilidad: checksums SHA256, manifiesto de exportacion (release_export_manifest.json) y licencia. La model card indica que este lanzamiento es anterior a la implementacion actual de LumynaX Core y que los wrappers incluidos son componentes historicos.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de razonamiento paso a paso (chain-of-thought) de DeepSeek R1 destiladas en el modelo base.
- Razonamiento logico y matematico: el modelo base DeepSeek-R1-Distill-Qwen-1.5B esta optimizado para tareas de razonamiento, aunque su tamano reducido limita la complejidad de los problemas que puede resolver.
- Soporte multilingue: ingles y maori (mi), lo que lo hace util para aplicaciones en el contexto de Aotearoa Nueva Zelanda.
- Ejecucion local: formato GGUF compatible con llama.cpp, lo que permite inferencia en CPU y GPU de consumo.
- Compatibilidad con ecosistemas de despliegue: los tags indican compatibilidad con vLLM, NVIDIA NIM y NVIDIA NeMo (aunque se requiere conversion para NeMo).
- Integracion con el framework LumynaX: puede ser orquestado por LumynaX Core para planificacion agente, control de contexto y optimizacion de inferencia.

## Casos de uso

- Investigacion academica y reproducibilidad: el paquete incluye checksums y manifiestos de exportacion, lo que permite reproducir experimentos y verificar la integridad de los artefactos. Adecuado para estudios sobre destilacion de modelos de razonamiento.
- Evaluacion comparativa de modelos de razonamiento pequenos: con 1,5B de parametros, permite comparar el rendimiento de modelos destilados frente a alternativas de mayor tamano en tareas de razonamiento, con requisitos de hardware minimos.
- Prototipado de aplicaciones de IA soberana: el enfoque local-first y la licencia MIT permiten a organizaciones y gobiernos evaluar despliegues de IA sin dependencia de proveedores externos, en linea con la filosofia de soberania digital de LumynaX.
- Aplicaciones en lengua maori: el soporte para mi (maori) lo hace util para experimentos de generacion de texto y asistentes en este idioma, aunque su capacidad en maori no esta documentada en detalle.
- Educacion y formacion en IA: su tamano reducido y formato GGUF permiten ejecutarlo en portatiles y equipos docentes para ensenar conceptos de razonamiento, destilacion y despliegue local.
- Pruebas de integracion con frameworks de orquestacion: el modelo puede usarse para validar el pipeline de infusion de LumynaX Core, incluyendo enrutamiento, control de contexto y planificacion agente, sin incurrir en costes de computacion elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este paquete especifico. Los benchmarks del modelo base DeepSeek-R1-Distill-Qwen-1.5B estan publicados por DeepSeek, pero no se reproducen en esta ficha al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1,5B en formato GGUF con un repositorio de 1,1 GB, la inferencia puede ejecutarse con menos de 2 GB de VRAM en cuantizaciones bajas, o incluso en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, Apple Silicon, etc.). No se requieren GPUs de datacenter.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecucion local en equipos de gama media.
- Opciones de despliegue: llama.cpp (runtime principal), Ollama, vLLM (segun tags), y potencialmente NVIDIA NIM con conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para un modelo de 1,5B en GGUF, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero este dato no esta confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Reasoning DeepSeek R1 Distill Qwen 1.5B GGUF | 1,78B | No disponible | MIT | GGUF | Paquete legacy con infusion LumynaX |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B | No disponible | MIT | Safetensors | Modelo original de DeepSeek, sin wrapper LumynaX |
| Qwen2.5-1.5B-Instruct | 1,78B | No disponible | Apache 2.0 | Safetensors | Modelo base sin destilacion de razonamiento |

Nota: los datos de contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Estado legacy y desactualizado: la propia model card lo declara como "outdated research artifact", no recomendado para produccion y no representativo de las capacidades actuales de AbteeX AI Labs.
- Tamano reducido: con 1,5B de parametros, su capacidad de razonamiento es limitada en comparacion con modelos de mayor tamano. Puede fallar en tareas complejas de logica o matematicas avanzadas.
- Soporte de idiomas limitado: solo ingles y maori. No se documenta el rendimiento real en maori, que podria ser limitado dado el
