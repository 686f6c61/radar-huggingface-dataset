# shreyansh-programmer/Intelligence_OS_1p5B

## Resumen

Intelligence_OS_1p5B es un modelo de lenguaje de tipo decoder-only con arquitectura de mezcla de expertos (MoE) dispersa, desarrollado desde cero por el usuario shreyansh-programmer y publicado en Hugging Face bajo licencia Apache 2.0. Con 1.518.659.584 parametros totales, 26 capas y una dimension oculta de 2048, se presenta como un modelo orientado a maximizar la calidad por julio de computo y a un entrenamiento eficiente en memoria. La model card lo etiqueta como "from-scratch" y lo enmarca en un proyecto denominado "Intelligence OS".

El modelo emplea atencion con consultas agrupadas (GQA) con 16 cabezas de consulta y 4 de clave/valor, codificacion posicional rotatoria (RoPE) y una capa de feed-forward con 4 expertos SwiGLU por capa, enrutamiento Top-2 y enrutamiento adaptativo. Los embeddings de entrada y salida estan atados. La model card menciona innovaciones de entrenamiento como LOMO (Low-Memory Optimization), que mantiene el pico de VRAM por debajo de 1,5 GB, y un motor no neuronal en CPU ("Zero-GPU Non-Neural AI Engine") con memoria asociativa holografica que afirma alcanzar 85.000 tokens por segundo.

La relevancia de este modelo es limitada pero ilustrativa: se trata de un experimento de arquitectura MoE de pequeno tamano publicado con pesos, lo que permite estudiar el diseno de enrutamiento disperso y las tecnicas de entrenamiento de bajo consumo de memoria. No obstante, la informacion publica es muy escasa: no se detallan datos de entrenamiento, benchmarks, idiomas soportados ni el formato exacto de los pesos, y el repositorio ocupa 629,5 GB, un tamano desproporcionado para un modelo de 1,5B parametros que sugiere la presencia de artefactos adicionales no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only sparse transformer con mezcla de expertos (MoE) |
| Parametros totales | 1.518.659.584 |
| Parametros activos | no disponible (Top-2 de 4 expertos por capa, sin desglose publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 629,5 GB; no se especifica safetensors ni GGUF) |

Otros datos tecnicos declarados en la model card: 26 capas, dimension oculta 2048, atencion GQA con 16 cabezas Q y 4 KV, RoPE, feed-forward con 4 expertos SwiGLU por capa, enrutamiento Top-2 adaptativo y embeddings de entrada/salida atados.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas de mezcla de expertos dispersa. Cada capa contiene 4 expertos SwiGLU y un mecanismo de enrutamiento Top-2 con enrutamiento adaptativo, lo que implica que en cada token se activan dos de los cuatro expertos. La atencion usa consultas agrupadas (16 cabezas Q frente a 4 KV), lo que reduce el coste de memoria de la cache KV, y la codificacion posicional es RoPE. Los embeddings de tokens estan atados entre entrada y salida, una practica habitual para reducir parametros en modelos pequenos.

En cuanto al entrenamiento, la model card solo menciona dos innovaciones: LOMO (Low-Memory Optimization), que realiza actualizaciones in-place capa por capa y mantiene el pico de VRAM por debajo de 1,5 GB, y un "Zero-GPU Non-Neural AI Engine" basado en memoria asociativa holografica que afirma alcanzar 85.000 tokens/s. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el esquema de enrutamiento adaptativo mas alla de su nombre.

## Capacidades

- Generacion de texto autoregresiva (pipeline text-generation declarado en Hugging Face).
- Razonamiento y generacion condicionada por contexto, segun la arquitectura causal-LM, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- El autor menciona un motor no neuronal en CPU con memoria asociativa holografica a 85.000 tokens/s, pero no se especifica si forma parte del modelo publicado ni como se integra con los pesos.

## Casos de uso

- Investigacion sobre enrutamiento MoE: el modelo permite estudiar el comportamiento de un enrutador Top-2 sobre 4 expertos por capa en un modelo pequeno, analizando la distribucion de carga entre expertos y el colapso de expertos en tareas controladas.
- Experimentos de entrenamiento con memoria reducida: la tecnica LOMO descrita por el autor (pico de VRAM inferior a 1,5 GB) puede reproducirse o compararse en entornos con una sola GPU consumer para validar su eficiencia frente a optimizadores estandar.
- Generacion de texto en prototipos: al ser un causal-LM de 1,5B, puede usarse para generar texto en demos y pruebas de concepto donde no se requiera calidad de produccion, siempre que se valide su comportamiento real.
- Docencia y divulgacion: su tamano manejable y su arquitectura documentada a alto nivel lo hacen util como ejemplo didactico de transformer disperso con GQA y RoPE.
- Estudio de eficiencia energetica: el enfasis del autor en "calidad por julio" permite disenar experimentos que midan tokens por segundo y consumo en funcion de la cuantizacion, si se dispone de los pesos en un formato utilizable.
- Comparacion de arquitecturas: puede servir como linea base de un MoE pequeno frente a modelos densos de tamano similar en tareas de perplejidad y generacion, aunque la ausencia de benchmarks publicados limita la comparacion directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia teorica, un modelo de 1,5B parametros en FP16 requiere aproximadamente 3 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 1,5 GB; sin embargo, el numero de parametros activos y el formato de pesos no estan confirmados.
- GPU recomendadas: no disponible. Por tamano, una GPU consumer con 8-16 GB de VRAM deberia poder alojar los pesos en precision reducida, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si por numero de parametros, pero no confirmado; el repositorio de 629,5 GB impide descargarlo en entornos consumer sin filtrar artefactos.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se especifica si existen pesos en GGUF.
- Latencia y throughput estimados: el autor cita 85.000 tokens/s para un motor no neuronal en CPU, pero no se refiere a la inferencia del transformer y no se puede verificar.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, modelos densos de 1-2B o MoE pequenos). Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad, por lo que no se puede evaluar su calidad real.
- Datos de entrenamiento no documentados: se desconoce el corpus, su composicion, el numero de tokens y si hubo filtrado de datos, lo que impide estimar sesgos y calidad.
- Idiomas no declarados: no se especifica que idiomas soporta; el uso en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones, no se puede acotar su magnitud.
- Contexto no disponible: se desconoce la longitud maxima de contexto, lo que limita el diseno de aplicaciones con documentos largos.
- Formato de pesos incierto: el repositorio de 629,5 GB para un modelo de 1,5B sugiere artefactos adicionales o pesos en precision completa; no se confirma la disponibilidad de safetensors ni GGUF.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; al ser un proyecto "from-scratch" con poca validacion externa, no es recomendable para produccion sin una evaluacion propia.
- Afirmaciones no verificadas: el motor "Zero-GPU" con 85.000 tokens/s y la memoria asociativa holografica no estan respaldados por documentacion tecnica ni por resultados reproducibles en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/shreyansh-programmer/Intelligence_OS_1p5B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
