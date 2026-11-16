# arbora-anon/arbora-qwen3-8b-path-scorer-v2

## Resumen

Arbora Qwen3-8B path scorer v2 es un componente auxiliar de decodificacion especulativa, no un modelo de lenguaje independiente. Se trata del "path scorer" del drafter DFlash2 asociado a Qwen3-8B, entrenado con la funcion de perdida de arbol (tree loss) del selector de rutas del propio drafter, en el paso 4.000 de entrenamiento. Lo publica el autor anonimo `arbora-anon` como parte de la liberacion de codigo del paper "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", actualmente en revision anonima.

El modelo base declarado es `z-lab/Qwen3-8B-DFlash-b16`, un drafter de difusion por bloques construido sobre Qwen3-8B. El repositorio pesa solo 0,2 GB porque contiene unicamente tres tensores (`candidate_selector.*`) en formato safetensors, no los pesos completos de un transformer. Su funcion es puntuar y seleccionar rutas candidatas entre los tokens propuestos por el drafter de difusion por bloques, mejorando la tasa de aceptacion de la decodificacion especulativa.

Es relevante para investigadores que trabajen en aceleracion de inferencia y decodificacion especulativa con drafters de difusion por bloques: el artefacto permite reproducir la fila "Arbora w/o experts" del paper integrandolo en el drafter mediante un script de construccion. No es utilizable de forma autonoma para generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | componente auxiliar (path scorer) de un drafter de difusion por bloques sobre Qwen3-8B; no es un transformer completo |
| Parametros totales | no disponible (el repo contiene tres tensores `candidate_selector.*`, tamano de repo 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3-8b-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es el path scorer del drafter DFlash2 de Qwen3-8B. Los drafters de difusion por bloques generan varios tokens candidatos por paso; el path scorer se encarga de puntuar las rutas (combinaciones de tokens candidatos) para seleccionar la mas probable y maximizar la aceptacion por parte del modelo objetivo. Se entrena con la tree loss definida por el selector de rutas del drafter, lo que alinea el scorer con la estructura de arbol de las propuestas.

El checkpoint corresponde al paso 4.000 de entrenamiento. Los datos de entrenamiento son respuestas generadas por el propio modelo objetivo (Qwen3-8B) ante una coleccion de prompts que no se ha liberado; el codigo del paper incluye la receta y los scripts para reconstruir el dataset de entrenamiento a partir de cualquier fichero de prompts. No se dispone de informacion sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Puntuacion y seleccion de rutas candidatas entre los tokens propuestos por el drafter DFlash2 de Qwen3-8B.
- Mejora de la tasa de aceptacion en decodificacion especulativa (objetivo del componente).
- Integracion en el drafter mediante `arbora/path_scorer/build_scorer_export.py`.
- No genera texto de forma autonoma: hereda las capacidades del modelo objetivo Qwen3-8B solo a traves del pipeline completo de decodificacion especulativa.
- No soporta tool calling, agentes ni capacidades multimodales por si mismo.
- Capacidades multilingues: no disponibles (dependen del modelo objetivo y del drafter).

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B: integrar el scorer en el drafter DFlash2 para aumentar la aceptacion de tokens especulativos y reducir la latencia por token en despliegues de produccion.
- Reproduccion de resultados de investigacion: replicar la fila "Arbora w/o experts" del paper para comparar con otras variantes de seleccion de rutas.
- Experimentacion con tree loss: usar el checkpoint como referencia para estudiar el efecto del paso de entrenamiento (4.000) en la calidad de seleccion.
- Base para ablaciones: sustituir o reentrenar el scorer con la receta publicada y comparar tasas de aceptacion frente a este checkpoint.
- Evaluacion de drafters de difusion por bloques: medir el impacto del path scorer en la longitud media de aceptacion sobre distintos prompts y dominios.
- Pipeline de decodificacion especulativa en servidores de inferencia: desplegar junto al drafter y al modelo objetivo para reducir coste computacional en cargas de generacion largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el scorer aislado; depende del drafter DFlash2 y del modelo objetivo Qwen3-8B (8.000 millones de parametros) que se carguen en el pipeline completo.
- GPU recomendadas: no disponibles en la informacion proporcionada; para el pipeline completo con Qwen3-8B se requiere hardware capaz de alojar el modelo objetivo y el drafter.
- Ajuste en GPU de consumo: no disponible; el scorer en si ocupa 0,2 GB, pero el pipeline completo excede el rango tipico de GPU de consumo para un modelo de 8B en precision completa.
- Opciones de despliegue: integracion mediante el codigo de Arbora (`build_scorer_export.py`); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3-8b-path-scorer-v2 | path scorer de drafter | no disponible (3 tensores) | no disponible | Apache 2.0 | Hugging Face |
| z-lab/Qwen3-8B-DFlash-b16 (modelo base) | drafter de difusion por bloques | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-8B (modelo objetivo) | LLM denso | 8.000 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otros path scorers o drafters.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autonoma: solo funciona integrado en el drafter DFlash2 y el pipeline de decodificacion especulativa.
- El dataset de entrenamiento no se ha liberado; la reproducibilidad depende de reconstruirlo con los scripts del paper.
- El checkpoint corresponde a un unico paso de entrenamiento (4.000); no se documenta su comportamiento en otros pasos ni su robustez fuera del dominio de prompts usado.
- Sin datos publicados de benchmarks, tasa de aceptacion ni latencia: no es posible validar su rendimiento sin ejecutar la evaluacion por cuenta propia.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero deben revisarse los avisos de terceros en `NOTICE` y las licencias del modelo base y del modelo objetivo.
- Paper en revision anonima: los resultados pueden cambiar en la version final.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-path-scorer-v2
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Codigo del paper (anonimo): https://anonymous.4open.science/r/arbora-7ABE
