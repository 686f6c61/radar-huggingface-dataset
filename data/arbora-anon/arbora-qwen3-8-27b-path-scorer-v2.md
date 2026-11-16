# arbora-anon/arbora-qwen3.8-27b-path-scorer-v2

## Resumen

Arbora Qwen3.8-27B path scorer v2 es un componente auxiliar de decodificacion especulativa, no un modelo generativo autonomo. Lo publica el proyecto Arbora (bajo revision anonima) y consiste en un conjunto reducido de tensores (`candidate_selector.*`) que se insertan en el drafter `arbora-qwen3.8-27b-drafter` para puntuar y seleccionar rutas candidatas dentro de un arbol de borradores generado por un block diffusion drafter. El checkpoint corresponde al paso 4.000 de entrenamiento con la funcion de perdida de arbol (tree loss) del selector de rutas del drafter.

El modelo base declarado es `z-lab/Qwen3.8-27B-DFlash2`, un modelo de 27.000 millones de parametros con decodificacion por difusion de bloques, del que este path scorer hereda la configuracion de espacio latente y tokenizador. El repositorio pesa solo 0,3 GB, lo que confirma que no contiene pesos completos del transformer sino unicamente los tensores del selector de rutas y artefactos asociados.

Su relevancia es acotada pero tecnica: forma parte del release de codigo del paper "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", que propone aprovechar mejor los tokens descartados por drafters de difusion de bloques en decodificacion especulativa. Es util para quienes replican o extienden ese pipeline con SGLang, no para inferencia directa de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de rutas (path scorer) sobre drafter de difusion de bloques; no es un transformer autonomo |
| Parametros totales | No disponible (el repo de 0,3 GB contiene solo los tensores `candidate_selector.*`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base `z-lab/Qwen3.8-27B-DFlash2`; no declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3.8-27b-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo sino un modulo de puntuacion de rutas que se acopla al drafter de difusion de bloques. El drafter genera un arbol de borradores candidatos por bloque; el path scorer asigna una puntuacion a cada ruta del arbol para decidir que secuencia de tokens borrador se verifica contra el modelo objetivo. Los tensores exportados pertenecen al espacio de nombres `candidate_selector.*` y se integran mediante el script `arbora/path_scorer/build_scorer_export.py`, que reconstruye el drafter con el selector en el layout de SGLang bajo el nombre local `qwen3.8-27b-drafter-path-scorer` (la fila "Arbora w/o experts" del paper).

El entrenamiento usa la funcion de perdida de arbol del selector de rutas del drafter sobre respuestas generadas por el propio modelo objetivo a un conjunto de prompts que no se ha publicado. El release de codigo describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts, de modo que el proceso es replicable aunque el dataset original no este disponible. El checkpoint publicado corresponde al paso 4.000. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Puntuacion y seleccion de rutas candidatas en un arbol de borradores generado por un block diffusion drafter.
- Mejora de la tasa de aceptacion de tokens especulativos al aprovechar borradores que el selector clasico descartaria.
- Integracion con el pipeline de decodificacion especulativa de SGLang mediante el script de exportacion incluido en el release.
- No genera texto de forma autonoma: requiere el drafter `arbora-qwen3.8-27b-drafter` y un modelo objetivo de 27B compatible.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Soporte multilingue no disponible (depende del modelo base y del drafter, no declarado).

## Casos de uso

- Aceleracion de inferencia en produccion con decodificacion especulativa: el selector elige rutas de borrador de mayor aceptacion, lo que reduce el numero de pasos de verificacion por token generado en despliegues SGLang con el modelo objetivo de 27B.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible (paso 4.000) para comparar variantes de seleccion de rutas frente a la linea base del drafter sin selector entrenado.
- Replicacion del paper Arbora: el checkpoint permite reproducir la fila "Arbora w/o experts" y aislar la contribucion del path scorer frente a la de los expertos.
- Ajuste fino del selector sobre dominios propios: los scripts del release reconstruyen datos de entrenamiento desde cualquier fichero de prompts, de modo que se puede reentrenar el selector para un corpus especifico (codigo, texto juridico, etc.) y medir el impacto en aceptacion.
- Evaluacion de latencia en serving: util para medir el trade-off entre coste de puntuacion del arbol y ganancia en throughput en GPUs con el modelo de 27B cargado.
- Auditoria de pipelines de decodificacion especulativa: al ser un modulo pequeno y aislado, facilita analizar como se distribuyen las puntuaciones de ruta y detectar sesgos en la seleccion de borradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el path scorer: despreciable; el fichero safetensors pesa una fraccion de los 0,3 GB del repositorio.
- VRAM dominante: la del modelo objetivo de 27B y la del drafter, no la de este artefacto. Con cuantizacion de 4 bits, un modelo de 27B requiere aproximadamente 14-16 GB solo para pesos, mas cache KV y overhead del runtime.
- GPU recomendadas: A100 80 GB o H100 para el modelo objetivo en BF16 sin cuantizar; RTX 4090 (24 GB) o A6000 (48 GB) viables con cuantizacion agresiva del modelo objetivo.
- Cabe en GPU de consumo: el path scorer si; el pipeline completo depende del modelo objetivo y del drafter.
- Despliegue: SGLang es el runtime previsto (layout del script `build_scorer_export.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3.8-27b-path-scorer-v2 | Selector de rutas para decodificacion especulativa | No disponible (tensores `candidate_selector.*`) | No disponible | Apache 2.0 | Hugging Face |
| arbora-qwen3.8-27b-drafter | Drafter de difusion de bloques | No disponible | No disponible | No disponible | Referenciado en la model card |
| z-lab/Qwen3.8-27B-DFlash2 | Modelo base de difusion de bloques | 27B | No disponible | No disponible | Hugging Face (modelo base) |

No se dispone de alternativas equivalentes de selector de rutas para decodificacion especulativa con datos publicos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no puede usarse para generacion de texto, codigo ni tareas de razonamiento de forma directa.
- Dependencia estricta del drafter `arbora-qwen3.8-27b-drafter` y del modelo base `z-lab/Qwen3.8-27B-DFlash2`; no es portable a otros drafters sin reentrenamiento.
- El conjunto de prompts de entrenamiento original no se publica; solo se ofrece la receta para reconstruirlo, lo que impide una reproduccion exacta del checkpoint.
- El paper esta bajo revision anonima: no hay resultados revisados por pares ni benchmarks publicados que respalden las ganancias de aceptacion.
- El repositorio no incluye pesos completos, tokenizador ni configuracion del modelo base; hay que descargarlos por separado.
- Sin datos sobre sesgos, riesgo de alucinacion o comportamiento multilingue, ya que el artefacto no genera texto.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso del modelo base y del drafter queda sujeto a sus propias licencias, no declaradas en la informacion disponible.
- Integracion limitada a SGLang; no hay soporte documentado para otros runtimes de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-path-scorer-v2
- Codigo y instrucciones del paper: https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
