# arbora-anon/arbora-qwen3-8b-path-scorer

## Resumen

Arbora Qwen3-8B path scorer es un componente auxiliar del sistema de decodificacion especulativa Arbora, disenado para acelerar la inferencia de Qwen3-8B. No es un modelo generativo autonomo: se trata de un conjunto de tres tensores (`candidate_selector.*`) que actua como selector de rutas dentro de un drafter de difusion por bloques, entrenado con la funcion de perdida de arbol (tree loss) en el paso 12.000. Lo publica el usuario anonimo `arbora-anon` como parte de la liberacion de codigo del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revision anonima.

El modelo resuelve un problema concreto: la decodificacion especulativa tradicional depende de un modelo borrador (drafter) que propone tokens que el modelo objetivo verifica. Arbora explota el paralelismo de drafters de difusion por bloques, y este path scorer decide que candidatos del arbol de propuestas merecen ser evaluados, mejorando la tasa de aceptacion y reduciendo el coste por token generado. Su relevancia radica en que permite integrar esta tecnica con un modelo objetivo ampliamente utilizado como Qwen3-8B sin reentrenar el modelo base.

El repositorio es muy ligero (0,2 GB) y contiene unicamente los pesos del selector, no el modelo completo. La licencia es Apache 2.0 y el modelo base es Qwen/Qwen3-8B. No se dispone de informacion sobre idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de rutas para drafter de difusion por bloques (speculative decoding); no es un transformer generativo independiente |
| Parametros totales | no disponible (el repo contiene solo tres tensores `candidate_selector.*`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3-8b-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El componente es un path scorer asociado a un drafter de difusion por bloques dentro del marco de decodificacion especulativa Arbora. En lugar de generar propuestas token a token, el drafter de difusion por bloques produce multiples candidatos en paralelo, y el path scorer selecciona las rutas del arbol de propuestas que se enviaran al modelo objetivo para verificacion. El entrenamiento utiliza una funcion de perdida de arbol (tree loss) que optimiza la seleccion de caminos; el checkpoint publicado corresponde al paso 12.000.

Los datos de entrenamiento se generan a partir de las propias respuestas del modelo objetivo (Qwen3-8B) a una coleccion de prompts que no se ha liberado. La model card indica que el codigo publicado describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Seleccion de rutas en arboles de propuestas generados por un drafter de difusion por bloques para decodificacion especulativa.
- Mejora de la tasa de aceptacion de tokens especulativos al priorizar candidatos mas probables bajo el modelo objetivo Qwen3-8B.
- Integracion con el codigo de Arbora (repositorio anonimo en 4open.science) para acelerar la inferencia de Qwen3-8B.
- No es un modelo de generacion de texto, codigo, matematicas ni vision por si mismo; depende del drafter y del modelo objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autonoma.
- Capacidades multilingues: no disponibles (dependen del modelo base y del drafter, no documentadas).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el path scorer se integra en el pipeline de decodificacion especulativa de Arbora para reducir la latencia por token generado, seleccionando las rutas mas prometedoras del arbol de propuestas antes de la verificacion por el modelo objetivo.
- Servicio de chat de alto throughput: al aumentar la tasa de aceptacion del drafter, se reduce el numero de pasos de verificacion y se mejora el rendimiento agregado en despliegues con vLLM o TGI que soporten decodificacion especulativa.
- Experimentacion en investigacion sobre decodificacion especulativa: sirve como checkpoint de referencia (paso 12.000) para reproducir los resultados del paper Arbora y comparar variantes de la perdida de arbol.
- Reentrenamiento con dominios propios: los scripts del repositorio de codigo permiten reconstruir los datos de entrenamiento a partir de un fichero de prompts propio y ajustar el selector a un dominio concreto (por ejemplo, codigo o texto juridico) usando las respuestas del modelo objetivo.
- Evaluacion de drafters de difusion por bloques: el selector permite medir la calidad de las propuestas del drafter en terminos de aceptacion por el modelo objetivo, util para iterar sobre arquitecturas de drafter.
- Despliegue en entornos con GPU limitada: al ser un componente de apenas 0,2 GB, se puede anadir a un stack existente de Qwen3-8B sin incrementar significativamente los requisitos de memoria, siempre que el drafter y el runtime de decodificacion especulativa esten disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el path scorer: inferior a 1 GB (el repositorio completo ocupa 0,2 GB en safetensors); el consumo real depende del drafter y del modelo objetivo Qwen3-8B.
- El modelo objetivo Qwen3-8B requiere, en funcion de la cuantizacion, aproximadamente 16 GB en FP16, 8-10 GB en 8 bits y 5-6 GB en 4 bits (estimaciones estandar para 8B; no confirmadas en la model card).
- GPU recomendadas para el conjunto completo: A100, H100 o L40S para produccion; RTX 4090 (24 GB) para Qwen3-8B en FP16 o cuantizado.
- Cabe en GPU de consumo con Qwen3-8B cuantizado (por ejemplo, RTX 3090, RTX 4070 Ti Super, RTX 4090), pero el path scorer por si solo no es util sin el drafter y el runtime de Arbora.
- Opciones de despliegue: el codigo de Arbora (repositorio anonimo) es el unico runtime documentado; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B path scorer | Selector de rutas para drafter de difusion por bloques | no disponible (3 tensores) | no disponible | Apache 2.0 | Hugging Face (repo `arbora-anon`) |
| Qwen3-8B (modelo base) | LLM generativo | 8B | no disponible en esta ficha | Apache 2.0 | Hugging Face (`Qwen/Qwen3-8B`) |
| Drafters especulativos convencionales (por ejemplo, EAGLE, Medusa) | Cabezas o modelos borrador para decodificacion especulativa | variable | depende del modelo base | variable | Hugging Face / repositorios de investigacion |

No se dispone de datos de rendimiento comparativo entre Arbora y otras tecnicas de decodificacion especulativa en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el drafter, el runtime de Arbora y Qwen3-8B como modelo objetivo, el path scorer no produce ninguna salida util.
- Los datos de entrenamiento no se han liberado; solo se publican los scripts para reconstruirlos, lo que dificulta la reproducibilidad exacta.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento en idiomas distintos del ingles; al depender de Qwen3-8B, hereda sus sesgos y limitaciones.
- La licencia Apache 2.0 permite uso comercial, pero el paper esta en revision anonima y el repositorio de codigo es anonimo, lo que puede afectar a la trazabilidad y al soporte a largo plazo.
- El checkpoint corresponde al paso 12.000; no se documenta si es el mejor checkpoint ni su curva de rendimiento.
- No se confirma compatibilidad con runtimes de inferencia estandar (vLLM, TGI, llama.cpp); la integracion depende del codigo de Arbora.
- El autor es anonimo (`arbora-anon`) y el repositorio no tiene descargas ni likes, por lo que no hay validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-path-scorer
- Codigo y instrucciones (repositorio anonimo): https://anonymous.4open.science/r/arbora-7ABE
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
