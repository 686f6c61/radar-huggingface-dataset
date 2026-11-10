# arbora-anon/arbora-qwen3.6-35b-a3b-path-scorer

## Resumen

Arbora path scorer es un componente auxiliar de decodificacion especulativa, no un modelo generativo autonomo. Se trata de un conjunto de tres tensores (`candidate_selector.*`) entrenados para actuar como selector de rutas dentro del drafter de bloques de difusion `incoai/Qwen3.6-35B-A3B-DFlash2`, un modelo Qwen3.6 de 35.000 millones de parametros totales con 3.000 millones activos (arquitectura MoE, segun la nomenclatura A3B del identificador). El autor es la organizacion `arbora-anon`, que publica este artefacto como parte del codigo del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revision anonima.

El problema que resuelve es concreto: en decodificacion especulativa con drafters de difusion por bloques, el modelo pequeno propone multiples tokens candidatos en paralelo y es necesario decidir que ruta del arbol de candidatos se verifica contra el modelo objetivo. Este path scorer aprende esa seleccion con una perdida de arbol (tree loss), entrenado durante 1.000 pasos con tasa de aprendizaje 3e-5. Su relevancia es de nicho pero tecnica: permite exprimir el paralelismo de los drafters de difusion sin degradar la tasa de aceptacion.

El repositorio pesa solo 0,3 GB y contiene un unico fichero `qwen3.6-35b-a3b-path-scorer.safetensors` con los tensores del selector. No incluye pesos del modelo base ni del drafter completo, por lo que no es utilizable de forma aislada: requiere integrarse en el drafter publicado mediante el script `training/path_scorer/build_scorer_export.py`. No hay informacion publica sobre benchmarks, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de rutas (path scorer) sobre drafter de difusion por bloques; modelo base Qwen3.6-35B-A3B (MoE) |
| Parametros totales | No disponible (el artefacto contiene solo tres tensores `candidate_selector.*`; el modelo base asociado es de 35B) |
| Parametros activos | No disponible (el modelo base asociado es A3B, 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3.6-35b-a3b-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo sino un modulo de seleccion entrenado sobre el drafter `incoai/Qwen3.6-35B-A3B-DFlash2`. En decodificacion especulativa con drafters de difusion por bloques, el drafter genera un bloque de tokens candidatos de forma paralela; el path scorer puntua las rutas del arbol de candidatos para decidir cuales se someten a verificacion por el modelo objetivo. La innovacion del paper Arbora es precisamente explotar el paralelismo de estos drafters mediante una perdida de arbol que entrena al selector para elegir rutas con alta probabilidad de aceptacion.

El entrenamiento se realizo con tasa de aprendizaje 3e-5 durante 1.000 pasos, usando como datos las propias respuestas del modelo objetivo a una coleccion de prompts que no se ha publicado. El release de codigo describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts, lo que permite reproducir el proceso con un corpus propio. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que el objeto entrenado es un selector auxiliar y no un modelo de lenguaje.

## Capacidades

- Seleccion de rutas en decodificacion especulativa: puntua candidatos del arbol generado por el drafter de difusion por bloques.
- Integracion con el drafter `incoai/Qwen3.6-35B-A3B-DFlash2` mediante el script de exportacion del repositorio de codigo.
- Entrenamiento reproducible: la receta permite reconstruir los datos a partir de un fichero de prompts propio.
- No genera texto de forma autonoma: carece de cabeza de lenguaje y de pesos del modelo base.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo; estas capacidades dependerian del modelo objetivo con el que se empareje.
- Capacidades multilingues: no disponibles (dependen del modelo objetivo y del drafter).

## Casos de uso

- Aceleracion de inferencia en produccion: integrado en el drafter de Qwen3.6-35B-A3B-DFlash2, permite reducir el numero de pasos de decodificacion manteniendo la distribucion del modelo objetivo, lo que se traduce en menor latencia por token en despliegues de alto trafico.
- Servicio de chat a gran escala: al mejorar la tasa de aceptacion de tokens especulativos, disminuye el coste por peticion en infraestructuras con GPUs limitadas, especialmente en cargas multi-turno con contexto largo.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para experimentar con perdidas de arbol y selectores de rutas sobre drafters de difusion por bloques.
- Ajuste del selector a un dominio propio: la receta de reconstruccion de datos permite reentrenar el path scorer con prompts especificos de un vertical (legal, sanitario, codigo) para mejorar la aceptacion en ese dominio.
- Evaluacion comparativa de drafters: permite medir el impacto del selector frente a heuristicas de seleccion de rutas en un banco de pruebas controlado.
- Pipeline de CI para modelos: al ser un artefacto ligero (0,3 GB), puede versionarse y probarse en integracion continua junto con el drafter para detectar regresiones en la tasa de aceptacion antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el artefacto: inferior a 1 GB, dado que el repositorio completo pesa 0,3 GB en safetensors.
- VRAM para uso real: la del drafter `incoai/Qwen3.6-35B-A3B-DFlash2` mas la del modelo objetivo; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles; dependen del modelo objetivo y del drafter con los que se empareje.
- Cabe en GPU de consumo: el artefacto en si si; el sistema completo depende del drafter y del modelo objetivo, sin datos publicados.
- Opciones de despliegue: integracion via el repositorio de codigo del paper (script `training/path_scorer/build_scorer_export.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3.6-35b-a3b-path-scorer | Selector de rutas para drafter de difusion | No disponible (artefacto de 0,3 GB) | No disponible | Apache 2.0 | Hugging Face |
| incoai/Qwen3.6-35B-A3B-DFlash2 | Drafter de difusion por bloques (modelo base) | 35B totales / 3B activos | No disponible | No disponible | Hugging Face |
| Drafters EAGLE / Medusa | Cabezas de decodificacion especulativa | Variable (tipicamente <1B) | N/A | Variable | Amplia |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el drafter y el modelo objetivo no produce ninguna salida util.
- Los datos de entrenamiento no se publican; solo se libera la receta de reconstruccion, lo que limita la auditoria del comportamiento del selector.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del artefacto.
- El paper asociado esta en revision anonima; los resultados pueden cambiar tras la revision por pares.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE`, que no se detallan en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Riesgo de incompatibilidad si el drafter o el modelo objetivo se actualizan sin reentrenar el selector.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.6-35b-a3b-path-scorer
- Modelo base: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Codigo del paper: https://anonymous.4open.science/r/arbora-7ABE
