# EdisonScientific/Ibis0-BED-Simulator

## Resumen

Ibis0-BED-Simulator es un modelo de lenguaje especializado desarrollado por EdisonScientific para simular resultados de experimentos cientificos en el contexto de diseno experimental bayesiano (BED, por sus siglas en ingles). Se trata de un fine-tuning del modelo Qwen3-30B-A3B, un transformer MoE de 30.500 millones de parametros totales con aproximadamente 3.000 millones de parametros activos por token, que hereda la licencia Apache-2.0 del modelo base.

El modelo resuelve un problema concreto: dado un experimento candidato con su resultado oculto, la hipotesis que ese experimento pone a prueba y una valencia solicitada, genera un desenlace plausible, ya sea un apoyo contundente a la hipotesis o un resultado nulo claro. Estos dos desenlaces se ponderan mediante un modelo de creencias (Ibis0-30B-A3B-Classifier) para estimar la ganancia esperada de informacion durante la seleccion de experimentos. El modelo devuelve JSON estructurado con tres campos: `supports_hypothesis`, `weight_of_evidence_decibans` y `y` (mediciones simuladas del dominio).

Es relevante ahora porque forma parte de una linea de investigacion que evalua si los modelos de lenguaje comprenden que constituye evidencia cientifica convincente, un paso hacia la automatizacion del diseno experimental. El modelo esta entrenado exclusivamente en ingles y su uso esta orientado a investigacion en biologia y diseno experimental, no a generacion de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el modelo base Qwen3-30B-A3B activa aproximadamente 3.000 millones, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3-30B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) que combina 30.500 millones de parametros totales con un subconjunto de parametros activos por token. El fine-tuning se realizo sobre el dataset EdisonScientific/EDB-Bio, orientado a tareas de biologia y diseno experimental. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal no reside en la arquitectura, sino en el uso del modelo como simulador de desenlaces dentro de un pipeline de BED. El modelo recibe prompts construidos por `build_theta_prime_sft.py` a partir de un experimento, su hipotesis y el tipo de resultado solicitado, y devuelve JSON estructurado que alimenta el calculo de ganancia esperada de informacion junto al clasificador de creencias. El repositorio de codigo requiere Python 3.12, `uv` y, para inferencia local, Linux con GPU CUDA.

## Capacidades

- Generacion de texto especializada en simulacion de desenlaces experimentales.
- Razonamiento sobre hipotesis cientificas y evidencia.
- Generacion de JSON estructurado con campos `supports_hypothesis`, `weight_of_evidence_decibans` y `y`.
- Simulacion de mediciones especificas del dominio (campo `y`).
- Soporte de conversacion multi-turno (tag `conversational`).
- Integracion con el clasificador Ibis0-30B-A3B-Classifier para seleccion de experimentos.
- Capacidades multilingues limitadas al ingles.
- No se dispone de informacion sobre tool calling, function calling, agentes, vision, audio ni modo de pensamiento en la informacion proporcionada.

## Casos de uso

- Seleccion de experimentos en diseno experimental bayesiano: el modelo simula desenlaces plausibles (apoyo a la hipotesis o resultado nulo) que, ponderados por el clasificador de creencias, permiten estimar la ganancia esperada de informacion y elegir el experimento mas informativo.
- Simulacion de resultados en biologia experimental: dado un experimento candidato y su hipotesis, el modelo genera mediciones simuladas en el campo `y`, utiles para planificar experimentos antes de ejecutarlos en laboratorio.
- Investigacion sobre razonamiento cientifico de modelos de lenguaje: sirve como componente del estudio "Do Language Models Know What Compelling Scientific Evidence Looks Like?", permitiendo evaluar si los modelos distinguen evidencia convincente de resultados nulos.
- Generacion de datos sinteticos para entrenamiento: los desenlaces simulados pueden emplearse como datos aumentados en pipelines de investigacion que requieran ejemplos de evidencia cientifica etiquetada.
- Evaluacion de hipotesis en entornos simulados: investigadores pueden contrastar hipotesis alternativas generando desenlaces bajo cada una y comparando su plausibilidad mediante el modelo de creencias.
- Prototipado de pipelines de BED: el modelo permite construir y depurar flujos completos de seleccion de experimentos sin necesidad de ejecutar experimentos reales, gracias a su salida JSON estructurada y su integracion con los scripts del repositorio ibis0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 30.500 millones de parametros totales y pesos en safetensors (repo de 61,1 GB), la inferencia en precision completa requiere del orden de 60 GB o mas de VRAM, y en cuantizacion de 8 bits aproximadamente 30-35 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, se requieren GPU de clase A100/H100 o multiples GPU consumer de gama alta con suficiente VRAM.
- Cabe en GPU consumer: no disponible; probablemente solo en configuraciones multi-GPU o con cuantizacion agresiva (dato no confirmado).
- Opciones de despliegue: transformers (libreria declarada); el autor no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Requisitos de entorno: Linux y GPU CUDA para inferencia local, Python 3.12 y `uv`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ibis0-BED-Simulator | 30.532.122.624 | no disponible | Apache-2.0 | HuggingFace (EdisonScientific) |
| Qwen/Qwen3-30B-A3B (base) | 30.500 millones aprox. | no disponible | Apache-2.0 | HuggingFace (Qwen) |
| Ibis0-30B-A3B-Classifier | no disponible | no disponible | no disponible | HuggingFace (EdisonScientific) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. El modelo base Qwen3-30B-A3B es la referencia directa; el clasificador Ibis0-30B-A3B-Classifier es el componente complementario dentro del mismo pipeline de BED.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Modelo altamente especializado: no esta pensado para generacion de texto general, codigo ni matematicas fuera del dominio de diseno experimental y biologia.
- Riesgo de alucinacion en la simulacion de desenlaces: los resultados generados son plausibles, no reales, y no deben interpretarse como evidencia empirica.
- La calidad de la simulacion depende del modelo de creencias y del prompt builder del repositorio ibis0; un uso fuera de ese pipeline puede degradar los resultados.
- No se han publicado benchmarks que permitan evaluar su fiabilidad cuantitativa.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Requiere entorno Linux con GPU CUDA para inferencia local, lo que limita su despliegue en entornos sin GPU.
- El modelo base Qwen3-30B-A3B puede arrastrar sesgos de sus datos de entrenamiento originales; el autor no documenta evaluaciones de sesgo para este fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdisonScientific/Ibis0-BED-Simulator
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Clasificador complementario: https://huggingface.co/EdisonScientific/Ibis0-30B-A3B-Classifier
- Repositorio de codigo: https://github.com/EdisonScientific/ibis0
- Dataset: https://huggingface.co/datasets/EdisonScientific/EDB-Bio
- Paper: ARXIV_URL (placeholder en la model card; no se proporciona URL definitiva)
- Script de construccion de prompts: https://github.com/EdisonScientific/ibis0/blob/main/scripts/data_pipeline/build_theta_prime_sft.py
- Script de seleccion de experimentos: https://github.com/EdisonScientific/ibis0/blob/main/scripts/analysis/rq5_bed/bed_thetaprime.py
