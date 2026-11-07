# my-app-s/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF

## Resumen

Gemma-4-12B-Coder-fable5-composer2.5-v1 es un ajuste fino (fine-tune) del modelo base google/gemma-4-12B-it, orientado especificamente a la generacion de codigo en Python y al razonamiento explicito previo a la escritura de codigo. Lo publica el usuario my-app-s en formato GGUF, con pesos cuantizados listos para su uso en llama.cpp y entornos locales. El modelo tiene 11.907.350.576 parametros totales (aproximadamente 12B) y hereda la arquitectura gemma4_unified del modelo base de Google.

El modelo se ha entrenado mediante destilacion de cadenas de razonamiento (chain-of-thought) sobre tareas de codigo Python verificables: cada traza de razonamiento utilizada en el entrenamiento esta asociada a una solucion que supero los tests deterministas de la tarea. Combina dos fuentes: trazas reales generadas por un profesor denominado Composer 2.5 y trazas sinteticas de un segundo profesor denominado Fable 5, empleadas para recuperar los casos en los que el primero fallo. El resultado es un modelo que razona de forma abierta (casos limite, complejidad, enfoque) antes de emitir la solucion.

Su relevancia practica radica en el reducido coste de despliegue: la cuantizacion Q2_K ocupa 4,5 GB y la Q4_K_M 6,87 GB, lo que permite ejecutarlo en GPUs de consumo de 8 GB o en equipos Apple Silicon con memoria unificada. El contexto maximo es de 256K tokens (262144), tras corregirse un error de metadatos del modelo base que lo limitaba a 131K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gemma4_unified), derivada de google/gemma-4-12B-it |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el maestro del autor original |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it y conserva su arquitectura transformer identificada en llama.cpp como gemma4_unified. No se dispone de detalles adicionales sobre la composicion interna (numero de capas, dimensiones, atencion) en la informacion proporcionada. El contexto nativo es de 262.144 tokens; el valor de 131.072 que aparecia en configuraciones derivadas se debia a un error de metadatos del modelo base, ya corregido en todas las cuantizaciones GGUF de este repositorio mediante el campo gemma4.context_length = 262144.

El entrenamiento es una destilacion de cadenas de razonamiento sobre tareas de codigo Python con tests deterministas. La fuente principal son trazas de razonamiento reales de Composer 2.5: el profesor resolvia cada problema, su codigo se ejecutaba contra los tests de la tarea y solo se conservaban las soluciones que pasaban. La fuente auxiliar son trazas sinteticas de Fable 5 sobre los problemas que Composer 2.5 no resolvio, regeneradas y de nuevo filtradas por ejecucion correcta de los tests. Las dos fuentes se etiquetan por separado en el dataset. No se especifica el volumen de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de codigo Python: el modelo esta especializado en problemas algoritmicos y a nivel de funcion con tests deterministas.
- Razonamiento explicito previo a la respuesta (thinking): analiza casos limite, complejidad y enfoque antes de escribir la solucion.
- Generacion de texto conversacional, heredada del modelo base instruct.
- Capacidad de razonamiento general y matematicas, heredada del modelo base (sin datos especificos de rendimiento en la informacion disponible).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta version v1.
- Soporte de agentes y razonamiento multi-paso: no confirmado para v1; el autor indica que la orientacion agentica llega en la version v2.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de codigo local y privado: el modelo puede ejecutarse integramente en una GPU de 8 GB con la cuantizacion Q3_K_M o en 12 GB con Q4_K_M, sin enviar codigo a APIs externas, lo que encaja en entornos con requisitos de confidencialidad.
- Resolucion de problemas algoritmicos con razonamiento visible: al exponer la cadena de razonamiento antes del codigo, resulta util para generar explicaciones didacticas de la solucion junto al programa.
- Generacion de funciones Python verificables: entrenado sobre tareas con tests, es adecuado para producir funciones a nivel de modulo que se validaran en un pipeline de tests automatizado.
- Integracion en editores y asistentes tipo IDE: mediante llama-server de llama.cpp, puede servirse como endpoint compatible con clientes conversacionales y usarse para autocompletar o generar bloques de codigo bajo demanda.
- Prototipado en equipos Apple Silicon: con memoria unificada de 16-32 GB puede alcanzar contextos de 64K a 256K tokens segun cuantizacion, permitiendo cargar repositorios o ficheros extensos en el contexto.
- Analisis de ficheros de codigo largos: con la cuantizacion Q2_K en 32 GB de memoria se alcanza el contexto maximo de 256K, util para revisar modulos completos o concatenaciones de ficheros relacionados.
- Educacion y formacion en programacion: el formato de razonamiento abierto permite mostrar al estudiante el proceso de analisis de un problema antes de la solucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version v1 en la informacion disponible. La model card unicamente incluye una comparacion de la version v2 (no de v1) en tau2-bench telecom con cuantizacion Q8_0, donde el modelo base oficial obtiene aproximadamente un 15 % y v2 aproximadamente un 55 %. Estos datos no son aplicables a v1 y no se reproducen como resultado propio.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): 4,5 GB (Q2_K), 5,7 GB (Q3_K_M), 6,87 GB (Q4_K_M), 9,11 GB (Q6_K), 11,8 GB (Q8_0).
- Memoria total recomendada: aproximadamente 1,5 GB adicionales de sobrecarga mas la cache KV, que depende del contexto y del tipo de cuantizacion de la cache (q8_0 por defecto; q4_0 duplica aproximadamente el contexto disponible).
- GPU de consumo: cabe en GPUs de 8 GB con Q2_K (hasta unos 16K de contexto) y Q3_K_M (unos 10K); en 12 GB, Q4_K_M permite unos 30K de contexto; en 16 GB, Q4_K_M llega a unos 64K; en 24 GB, Q4_K_M alcanza unos 128K y Q8_0 unos 88K; en 32 GB, Q2_K, Q3_K_M y Q4_K_M alcanzan el maximo de 256K.
- Apple Silicon y GPUs integradas: funcionan con memoria unificada, con las mismas cifras de capacidad pero menor velocidad que una GPU dedicada.
- Despliegue: llama.cpp (llama-server) es la opcion recomendada; se requiere una version reciente que soporte la arquitectura gemma4_unified, ya que compilaciones antiguas no cargan el modelo. El autor menciona tambien la posibilidad de generar cuantizaciones MLX o AWQ a partir del maestro en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Coder-fable5-composer2.5-v1 (este) | 11,9B | 256K | Apache 2.0 | GGUF | Fine-tune de codigo con CoT destilado y verificado por tests |
| google/gemma-4-12B-it (base) | 12B aprox. | 256K (tras correccion de metadatos) | no disponible en la informacion | safetensors | Modelo instruct generalista de Google |
| gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2 | no disponible | no disponible | no disponible en la informacion | GGUF | Version posterior del mismo autor, orientada a agentes y tool use; en tau2-bench telecom Q8_0 obtiene aproximadamente un 55 % frente al 15 % del base |

No se dispone de datos de rendimiento comparativos de v1 frente a otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento se centra en Python algoritmico y a nivel de funcion con tests deterministas; el rendimiento en otros lenguajes, en codigo de sistemas o en tareas sin verificacion automatica no esta documentado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir APIs inexistentes, imports incorrectos o soluciones que parecen validas pero fallan; la validacion mediante ejecucion de tests sigue siendo necesaria.
- Trazas sinteticas: parte del entrenamiento usa cadenas de razonamiento sinteticas (Fable 5) sobre los fallos del profesor principal, lo que puede introducir estilos de razonamiento menos representativos en esos casos.
- Idiomas: no se especifican los idiomas soportados; el foco en codigo Python sugiere un uso principal en ingles tecnico.
- Version v1 sin capacidades agenticas confirmadas: el autor indica que la orientacion a agentes y tool use llega en v2, por lo que no debe asumirse soporte fiable de function calling en esta version.
- Dependencia de version de llama.cpp: requiere compilaciones recientes que soporten gemma4_unified; versiones antiguas no cargaran el modelo.
- Metadatos de contexto: las copias descargadas antes de la correccion reportan 131K de contexto; es necesario volver a descargar para obtener los 256K completos.
- Licencia: Apache 2.0 en este repositorio, si bien conviene verificar las condiciones del modelo base google/gemma-4-12B-it antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre este artefacto concreto.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/my-app-s/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- Repositorio GGUF del autor original: https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- Repositorio espejo: https://huggingface.co/Harvey-Buck/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- Maestro en safetensors (autor original): https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1
- Version v2 agentica: https://huggingface.co/yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
