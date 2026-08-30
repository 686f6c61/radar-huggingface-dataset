# s-a-i/Qwen3-Coder-30B-A3B-Instruct

## Resumen

Qwen3-Coder-30B-A3B-Instruct es la versión de 30.000 millones de parámetros de la familia Qwen3-Coder, desarrollada por Alibaba Cloud y publicada originalmente en el repositorio oficial de Qwen. Este modelo está especializado en tareas de programación y razonamiento agéntico, y adopta una arquitectura de mezcla de expertos (MoE) con solo 3.300 millones de parámetros activos por token, lo que permite un rendimiento de inferencia elevado con un coste computacional reducido en comparación con modelos densos de tamaño similar.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos propietarios. La versión alojada en el repositorio `s-a-i/Qwen3-Coder-30B-A3B-Instruct` es un espejo del modelo original, con acceso restringido (gated) y pesos en formato safetensors. Su relevancia actual radica en que combina capacidades de generación de código, soporte de herramientas y ejecución de tareas agénticas en un paquete que puede ejecutarse en hardware de consumo con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, tipo `qwen3_moe` |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | 3.300.000.000 (3,3 B) |
| Longitud de contexto | no disponible (se espera 256 K según la familia Qwen3, sin confirmar para esta version) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precision completa; existen GGUF de terceros como unsloth) |
| Idiomas soportados | no disponible (la familia Qwen3 soporta multiples idiomas, pero no se especifica para esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponibles GGUF de terceros) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con activacion escasa: de los 30.500 millones de parametros totales, solo 3.300 millones se activan por cada token procesado. Esta configuracion, heredada de la familia Qwen3, permite mantener una capacidad de conocimiento amplia con un coste de inferencia comparable al de un modelo denso de aproximadamente 3 B de parametros. La arquitectura `qwen3_moe` implementa atencion por ventana deslizante combinada con atencion global en capas alternas, lo que reduce el coste computacional en secuencias largas.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. No obstante, por su pertenencia a la serie Qwen3-Coder, se sabe que el entrenamiento se centro en datos de codigo y razonamiento agéntico, con un enfasis particular en el seguimiento de instrucciones complejas y el uso de herramientas. El modelo se publica en su variante Instruct, es decir, ajustado para dialogo y tareas de asistencia.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con especial competencia en Python, Java, C++, JavaScript y TypeScript.
- Razonamiento agéntico: el modelo puede planificar y ejecutar secuencias de acciones multi-paso, lo que lo hace apto para agentes autonomos.
- Soporte de tool calling y function calling, permitiendo la integracion con APIs y herramientas externas.
- Comprension y generacion de explicaciones tecnicas, comentarios de codigo y documentacion.
- Capacidad de razonamiento logico y matematico aplicado a problemas de programacion (debugging, optimizacion, refactorizacion).
- Multilingue en el ambito del codigo: puede trabajar con comentarios y prompts en varios idiomas, aunque la lista exacta no esta disponible.
- Modo de pensamiento (thinking mode) probablemente heredado de Qwen3, aunque no se confirma en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para ofrecer autocompletado, explicaciones y refactorizacion en tiempo real. Su bajo numero de parametros activos permite una latencia aceptable en estaciones de trabajo con GPU de gama media.
- Agente de resolucion de incidencias en repositorios: dado su soporte de tool calling, puede analizar issues de GitHub, proponer parches y ejecutar pruebas automatizadas de forma autonoma.
- Generacion de tests unitarios: a partir de una funcion o modulo, el modelo puede generar casos de prueba en frameworks como pytest, JUnit o Jest, reduciendo el esfuerzo manual de cobertura.
- Documentacion automatica de APIs: puede leer codigo fuente y producir documentacion en formato Markdown o reStructuredText, incluyendo ejemplos de uso y descripcion de parametros.
- Tutor de programacion: su capacidad de razonamiento permite explicar conceptos, depurar errores y guiar a estudiantes en ejercicios de algoritmia y estructuras de datos.
- Pipeline de CI/CD con revision de codigo: integrado en un flujo de integracion continua, el modelo puede revisar pull requests, detectar code smells y sugerir mejoras de rendimiento o seguridad antes de la fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye metricas de evaluacion y la busqueda web no ha proporcionado tablas comparativas con datos concretos. Se recomienda consultar la documentacion oficial de Qwen para obtener resultados de HumanEval, MBPP, LiveCodeBench y otras pruebas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,5 B de parametros en precision FP16, se necesitan aproximadamente 61 GB de VRAM. Con cuantizacion INT4 (GGUF Q4_K_M), la carga se reduce a unos 18-20 GB.
- GPU recomendadas: para ejecucion sin cuantizar, se requieren GPU profesionales como A100 80 GB, H100 o RTX 6000 Ada. Con cuantizacion INT4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- En hardware de consumo: si, es viable en GPUs de 24 GB con cuantizacion Q4 o Q5. Para GPUs de 12-16 GB, se necesitaria cuantizacion Q3 o inferior, con perdida de calidad.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (existe la etiqueta `qwen3-coder:30b` en el registro oficial), y transformers con carga clasica.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3,3 B de parametros activos, la latencia por token deberia ser comparable a la de un modelo denso de 3-4 B, pero no se dispone de mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct | 30,5 B | 3,3 B | no disponible | Apache 2.0 | Codigo y agentes |
| Qwen3-Coder-480B-A35B-Instruct | 480 B | 35 B | no disponible | Apache 2.0 | Codigo y agentes (escala mayor) |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B | 2,4 B | 128 K | MIT | Codigo y matematicas |

La comparativa es parcial porque no se dispone de benchmarks publicados para esta version concreta. El modelo Qwen3-Coder-30B-A3B-Instruct se posiciona como una opcion intermedia entre el modelo ligero de la serie (probablemente 5B o menos) y el gigante de 480B, ofreciendo un equilibrio entre capacidad y requisitos de hardware.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos del modelo, pero al estar entrenado predominantemente con datos de codigo, puede reflejar sesgos presentes en repositorios publicos (por ejemplo, nombres de variables o comentarios con connotaciones culturales).
- Riesgo de alucinacion en APIs poco documentadas o en bibliotecas de reciente creacion: el modelo puede inventar firmas de funciones o parametros inexistentes.
- La longitud de contexto no esta confirmada para esta version; si se hereda de Qwen3, deberia ser de 256 K tokens, pero el rendimiento en secuencias muy largas puede degradarse sin una configuracion adecuada de atencion.
- El acceso al repositorio `s-a-i/Qwen3-Coder-30B-A3B-Instruct` es restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. El modelo original de Qwen puede tener un acceso mas abierto.
- Para uso en produccion, se recomienda validar el modelo con un conjunto de pruebas propio, ya que no hay benchmarks publicados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario cumplir con los terminos de las dependencias y datasets utilizados durante el entrenamiento, que no se detallan.

## Enlaces

- Repositorio de HuggingFace (version espejo): https://huggingface.co/s-a-i/Qwen3-Coder-30B-A3B-Instruct
- Repositorio oficial de Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Repositorio de GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Pagina de Ollama para qwen3-coder:30b: https://ollama.com/library/qwen3-coder:30b
- Ficha en Benchable: https://benchable.ai/models/qwen/qwen3-coder-30b-a3b-instruct
