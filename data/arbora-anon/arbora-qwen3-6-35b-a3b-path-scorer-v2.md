# arbora-anon/arbora-qwen3.6-35b-a3b-path-scorer-v2

## Resumen

Arbora Qwen3.6-35B-A3B path scorer (v2) es un componente auxiliar de decodificacion especulativa, no un modelo de lenguaje autonomo. Lo publica el autor anonimo `arbora-anon` como parte del codigo del articulo "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", actualmente en revision anonima. Se trata de un conjunto de tensores (`candidate_selector.*`) que se insertan en un drafter ya publicado para mejorar la seleccion de rutas de tokens candidatos durante la decodificacion especulativa.

El modelo base sobre el que opera es `incoai/Qwen3.6-35B-A3B-DFlash2`, un modelo de arquitectura MoE con 35 mil millones de parametros totales y 3 mil millones activos (segun la nomenclatura A3B). El path scorer no contiene pesos del modelo principal: el repositorio ocupa 0,3 GB y el unico fichero de pesos es `qwen3.6-35b-a3b-path-scorer.safetensors`, que agrupa exclusivamente los tensores del selector de candidatos.

La relevancia de esta publicacion es acotada pero tecnica: permite reproducir la fila "Arbora w/o experts" de los experimentos del articulo, es decir, la variante del metodo Arbora que aprovecha mejor los tokens borrador generados por drafters de difusion por bloques sin recurrir a expertos adicionales. Se entrena con la funcion de perdida de arbol (tree loss) del selector de rutas del drafter, con tasa de aprendizaje 1e-4 y 1.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de rutas (path scorer) sobre drafter de difusion por bloques; modelo base MoE Qwen3.6-35B-A3B-DFlash2 |
| Parametros totales | no disponible (el repositorio contiene solo los tensores `candidate_selector.*`, 0,3 GB) |
| Parametros activos | no disponible (el modelo base es A3B, 3B activos, pero el scorer no es el modelo completo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo sino un modulo de seleccion de candidatos que se acopla a un drafter de difusion por bloques. El drafter genera, para cada paso, un conjunto de tokens candidatos organizados en forma de arbol; el path scorer puntua las rutas de ese arbol para que el verificador del modelo objetivo acepte el mayor numero de tokens por paso especulativo. La innovacion del metodo Arbora consiste en explotar mejor esos tokens borrador en lugar de descartar la estructura de arbol.

El entrenamiento usa la funcion de perdida de arbol del selector de rutas del drafter, con tasa de aprendizaje 1e-4 durante 1.000 pasos. Los datos de entrenamiento son respuestas del propio modelo objetivo a una coleccion de prompts que no se publica; el codigo liberado describe la receta y los scripts para reconstruir los datos a partir de cualquier fichero de prompts. No se documentan el numero de tokens de entrenamiento, la composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Puntuacion de rutas de tokens candidatos para decodificacion especulativa con drafters de difusion por bloques.
- Mejora de la tasa de aceptacion de tokens especulativos en el esquema de verificacion del modelo objetivo.
- Integracion con el drafter publicado mediante el script `arbora/path_scorer/build_scorer_export.py`.
- Reproduccion de la variante "Arbora w/o experts" de los experimentos del articulo.
- No genera texto de forma autonoma: no es un modelo de chat, razonamiento, codigo ni vision.
- No soporta tool calling, agentes ni capacidades multilingues por si mismo; hereda las del modelo base solo a traves del pipeline completo.

## Casos de uso

- Aceleracion de inferencia del modelo Qwen3.6-35B-A3B-DFlash2: el scorer se inserta en el drafter para aumentar el numero de tokens aceptados por paso de verificacion, reduciendo la latencia efectiva en despliegues de produccion.
- Reproduccion de experimentos academicos: permite reconstruir la fila "Arbora w/o experts" del articulo y comparar frente a variantes con expertos y frente al drafter sin scorer.
- Investigacion en decodificacion especulativa: sirve como punto de partida para estudiar el efecto de la seleccion de rutas en la tasa de aceptacion con drafters de difusion por bloques.
- Evaluacion de pipelines de serving: se puede integrar en entornos de vLLM o TGI que ya soporten decodificacion especulativa con drafter separado, para medir mejoras de throughput.
- Desarrollo de metodos de seleccion de candidatos: el codigo y los tensores permiten experimentar con funciones de perdida alternativas sobre la misma estructura de arbol.
- Docencia y formacion tecnica: util como ejemplo concreto de modulo auxiliar de un sistema de decodificacion especulativa, con receta de entrenamiento reproducible a partir de un fichero de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el scorer aislado; el repositorio ocupa 0,3 GB en disco.
- El scorer no es desplegable por si solo: requiere el drafter y el modelo objetivo Qwen3.6-35B-A3B-DFlash2 para funcionar.
- GPU recomendadas: no disponibles; dependen del modelo base y del drafter, no del scorer.
- Viabilidad en GPU de consumo: no disponible; el modelo base de 35B totales con 3B activos podria requerir cuantizacion para caber en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: integracion mediante el script `build_scorer_export.py` del repositorio de codigo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3.6-35B-A3B path scorer v2 | Selector de rutas para decodificacion especulativa | no disponible | no disponible | Apache 2.0 | Hugging Face |
| incoai/Qwen3.6-35B-A3B-DFlash2 | Modelo base MoE con drafter de difusion por bloques | 35B totales, 3B activos | no disponible | no disponible | Hugging Face |
| Drafter sin scorer (variante base) | Drafter de difusion por bloques | no disponible | no disponible | no disponible | Repositorio del articulo |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse como un LLM.
- Depende de un drafter y de un modelo objetivo concretos; no es portable a otros modelos sin reentrenamiento.
- Los datos de entrenamiento no se publican: solo se libera la receta para reconstruirlos desde un fichero de prompts, lo que limita la reproducibilidad exacta.
- El articulo esta en revision anonima: los resultados pueden cambiar tras la revision por pares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma del pipeline completo.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso del modelo base y del drafter queda sujeto a sus propias licencias, no detalladas en la informacion disponible.
- El rendimiento real depende de la tasa de aceptacion del verificador y de la carga; no hay mediciones publicadas de speedup.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.6-35b-a3b-path-scorer-v2
- Modelo base: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Codigo e instrucciones del articulo: https://anonymous.4open.science/r/arbora-7ABE
