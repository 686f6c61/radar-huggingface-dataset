# chartreuse-verte/prose-rewriter-4b-v2.6

## Resumen

prose-rewriter-4b-v2.6 es un modelo especializado en reescritura de prosa a nivel de parrafo, desarrollado por el usuario chartreuse-verte. Su funcion no es conversacional ni de proposito general: recibe un parrafo escrito por un modelo grande de lenguaje y lo re-renderiza para que suene mas humano, conservando la semantica original. El objetivo declarado es reducir el llamado "slop" (construcciones formulaicas, lexico generico y estructuras narrativas negativas tipicas de la prosa generada por IA) sin inventar hechos ni alterar el significado.

Tecnicamente es un Qwen/Qwen3-4B-Base (4.411.424.256 parametros) con un LoRA de rango 32 fusionado a fuerza 1.20. Se distribuye en safetensors bf16 para transformers y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M) para llama.cpp. El modelo esta entrenado exclusivamente en ingles y su licencia es AGPL-3.0, lo que condiciona su uso en produccion.

La relevancia actual reside en su enfoque acotado: en lugar de competir como modelo generalista, ofrece una tarea concreta (reescritura estilistica) con metricas de fidelidad y de reduccion de "slop" publicadas y comparadas contra su version anterior (v2.5). Es un modelo de investigacion y experimentacion, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), LoRA rango 32 fusionado a fuerza 1.20 sobre Qwen/Qwen3-4B-Base |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.400 millones de parametros, sobre el que se aplica un LoRA de rango 32 que se fusiona en los pesos con una fuerza de 1.20. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que el pool de entrenamiento tiene una mediana de 37 palabras por entrada y que el 81% de las muestras estan por debajo de 70 palabras, lo que define el regimen de uso previsto.

La innovacion principal no es arquitectonica sino de formato y evaluacion. El modelo no es conversacional: usa un template propio con roles `source` y `rewrite`, de modo que cada llamada recibe un unico mensaje con el parrafo a reescribir. Las cuantizaciones GGUF conservan el chat template, paran en `<|im_end|>` y mantienen la cabeza de salida adaptada separada de los embeddings del tokenizador (Q8_0 en el fichero Q8_0 y Q6_K en el Q4_K_M). La receta de servicio recomienda muestreo con `temperature=0.85` y `top_p=0.9`.

## Capacidades

- Reescritura de prosa a nivel de parrafo: transforma texto generado por modelos grandes en una version mas humana conservando la semantica.
- Reduccion de "slop": disminuye construcciones prohibidas, densidad de lexico generico, "purple score" y formas de narracion negativas.
- Control de fidelidad: reduce la invencion de hechos y el cambio de significado respecto a la version anterior.
- Preservacion de adverbios de modo en prosa humana (75,4% frente a 65,9% en v2.5).
- Generacion de texto en ingles exclusivamente.
- No soporta tool calling ni function calling segun la informacion disponible.
- No es un modelo de agentes ni de razonamiento multi-paso; cada llamada procesa un unico parrafo.
- No dispone de vision, audio ni modo "thinking".

## Casos de uso

- Humanizacion de borradores generados por LLM: se introduce un parrafo producido por un modelo grande y se obtiene una version con menos construcciones formulaicas y lexico generico, util en flujos editoriales donde el texto de IA se publica tras revision.
- Post-procesado en pipelines de generacion creativa: integrado como etapa final tras un modelo de escritura, reduce el "slop" medido (de 3,46 a 2,41 construcciones prohibidas por 1.000 palabras) antes de entregar el texto al lector.
- Limpieza de prosa en roleplay y narrativa interactiva: en prosa de roleplay generada por LLM, las construcciones prohibidas bajan de 3,46 a 2,52 por 1.000 palabras y el "purple score" de 0,358 a 0,331, lo que lo hace adecuado para entornos de ficcion interactiva.
- Reescritura de parrafos individuales en herramientas de edicion: dado que opera bien con entradas de 15 a 70 palabras, encaja en un editor que reescribe parrafo a parrafo bajo demanda.
- Investigacion sobre estilo y deteccion de IA: sirve como componente controlado para estudiar como varian las metricas de estilo y fidelidad al aplicar una transformacion estilistica concreta.
- Despliegue ligero en local: las cuantizaciones GGUF (2,72 GB en Q4_K_M y 4,69 GB en Q8_0) permiten ejecutarlo con llama.cpp en hardware de consumo para experimentacion.
- Evaluacion comparativa de tecnicas de reescritura: su conjunto de metricas publicado (fidelidad, repeticion, estructura) permite usarlo como linea base en estudios de style transfer.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a evaluaciones internas sobre 365 parrafos retenidos de prosa escrita por LLM, con 1.095 generaciones por brazo, a `temperature=0.9, top_p=0.95` y tres muestras por entrada. No son benchmarks estandar (MMLU, HumanEval, GSM8K).

Prosa escrita por LLM, metricas de registro frente a la entrada:

| Metrica | Entrada | v2.5 | v2.6 |
|---|---|---|---|
| Construcciones prohibidas /1k | 12,03 | 3,46 | 2,41 |
| Reescrituras con construccion prohibida | no disponible | 20,3% | 15,1% |
| Densidad de lexico "slop" | 0,081 | 0,043 | 0,038 |
| Purple score | 0,821 | 0,628 | 0,592 |
| Palabras por frase | 18,2 | 15,2 | 16,3 |
| Formas de narracion negativas por reescritura | 0,118 | 0,109 | 0,067 |

Fidelidad juzgada por LLM contra la entrada:

| Metrica | v2.5 | v2.6 |
|---|---|---|
| Anade un hecho no soportado | 6,8% | 3,7% |
| Cambia el significado | 16,2% | 12,0% |
| Cualquiera de las dos | 18,5% | 13,3% |
| Frase mal formada (entrada: 0,3%) | 3,0% | 1,8% |

Invencion de personas y repeticion:

| Metrica | v2.5 | v2.6 |
|---|---|---|
| Pronombre generizado no licenciado | 0,5% | 0,5% |
| ... del genero opuesto | 0,0% | 0,3% |
| Nombre propio ausente en la entrada | 0,5% | 0,1% |
| Cualquier repeticion | 3,6% | 2,9% |
| ... de una frase completa | 0,0% | 0,0% |
| ... de una frase hecha | 1,8% | 0,9% |
| ... de una apertura de frase (anafora) | 1,1% | 1,3% |

Metricas estructurales:

| Metrica | v2.5 | v2.6 |
|---|---|---|
| Palabras cambiadas | 35,7% | 35,6% |
| Salida sin cambios | 0,5% | 1,9% |
| Salidas casi literales | 0,0% | 0,1% |
| Por debajo del suelo de edicion del entrenamiento | 53,8% | 56,4% |
| Cambio en el numero de frases | 61,8% | 40,3% |
| Variedad de longitud de frase vs entrada | +0,041 | +0,007 |
| Palabras conservadas de la entrada | 0,690 | 0,675 |
| Longitud preservada | 0,935 | 0,872 |
| Truncado por debajo de 0,75x | 3,3% | 15,5% |

El autor indica que, en comparaciones pareadas sobre las 365 entradas, las construcciones prohibidas, la densidad de lexico, el purple score y la narracion negativa caen (t = -3,8, -4,3, -4,0 y -4,0), las frases se alargan (t = +7,7) y bajan los hechos anadidos, los cambios de significado y su union (t = -3,1, -2,8 y -3,3). La buena formacion no separa (t = -1,8). No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,8 GB solo para pesos (4.411 millones de parametros), mas overhead de activaciones y cache KV; en la practica requiere una GPU de 16 GB o mas.
- VRAM estimada en GGUF Q8_0 (4,69 GB): cabe en GPUs de 8 GB con margen limitado.
- VRAM estimada en GGUF Q4_K_M (2,72 GB): cabe en GPUs de consumo de 6-8 GB.
- GPU recomendadas: no disponible de forma explicita; por tamano, una RTX 4090 o A100/H100 sobran para esta carga, y una RTX 3060 de 12 GB o similar es suficiente para las cuantizaciones.
- Cabe en GPU de consumo: si, en las versiones GGUF (Q4_K_M y Q8_0).
- Opciones de despliegue: transformers (safetensors bf16), llama.cpp y llama-cpp-python (GGUF). El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints, aunque no se detalla configuracion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de comparaciones con otros modelos de reescritura en la informacion proporcionada. La unica comparacion publicada es contra su version anterior, v2.5, del mismo autor y misma base:

| Modelo | Base | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| prose-rewriter-4b-v2.6 | Qwen3-4B-Base | 4.411 M | no disponible | AGPL-3.0 | en |
| prose-rewriter-4b-v2.5 | Qwen3-4B-Base | no disponible | no disponible | no disponible | en |
| Qwen3-4B-Base | - | 4.000 M aprox. | no disponible | no disponible | multilingue |

Frente a v2.5, v2.6 reduce construcciones prohibidas (3,46 a 2,41 por 1.000 palabras), hechos anadidos (6,8% a 3,7%) y cambios de significado (16,2% a 12,0%), a costa de mayor truncado (3,3% a 15,5%). No hay comparativa disponible con otros reescritores o modelos de style transfer.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No es un modelo conversacional: cada llamada debe contener un unico mensaje con el parrafo fuente; no gestiona dialogos multi-turno.
- Suelo practico de entrada de unas 15 palabras; por debajo el fallo tipico es relleno, recorte y fabricacion. Por debajo de 80 bytes conviene pasar el texto sin cambios.
- Tasa de truncado del 15,5% por debajo de 0,75x de la longitud original en v2.6, superior a la de v2.5 (3,3%).
- Riesgo de alucinacion medido: 3,7% de reescrituras anaden un hecho no soportado y 12,0% cambian el significado de algo que la entrada dice.
- El 1,8% de las salidas contiene una frase mal formada (frente al 0,3% de la entrada).
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que use el modelo en red, lo que puede ser incompatible con productos comerciales cerrados.
- Modelo con cero descargas y cero likes en el momento de la consulta; sin validacion externa de la comunidad.
- Las metricas publicadas son evaluaciones internas con juez LLM, no benchmarks estandar reproducibles de forma independiente.
- No se especifican sesgos conocidos ni longitud de contexto en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.6
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
