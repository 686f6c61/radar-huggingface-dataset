# gbrixi/evo2_7b_262k_vllm

## Resumen

Evo 2 7B 262k es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autorregresiva sobre billones de tokens de secuencias genomicas. Este repositorio concreto (`gbrixi/evo2_7b_262k_vllm`) es una conversion del checkpoint oficial `arcinstitute/evo2_7b_262k` al formato safetensors para poder cargarse con el backend vLLM del paquete `evo2`, manteniendo los mismos pesos y la misma arquitectura.

El modelo emplea una arquitectura StripedHyena 2 de 32 capas, con aproximadamente 6.485 millones de parametros (6,49B reales en el repo) y una longitud de contexto de 262.144 tokens, lo que lo hace adecuado para el analisis de regiones genomicas extensas en una sola pasada. Frente al checkpoint principal de 1M de contexto, esta variante intermedia de 262k resulta mas manejable en memoria durante la inferencia.

Su relevancia radica en que permite trabajar con secuencias de ADN a escala de genes completos y regiones regulatorias, tareas donde los modelos de lenguaje generalistas no rinden bien. Al estar disponible en formato compatible con vLLM, se facilita su despliegue en infraestructura de inferencia estandar para bioinformatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (32 capas) |
| Parametros totales | 6.485.725.238 (~6,49B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint vLLM) |

## Arquitectura y entrenamiento

El modelo se basa en StripedHyena 2, una arquitectura hibrida que combina capas convolucionales y mecanismos de atencion, disenada para secuencias muy largas con coste computacional subcuadratico. Segun la model card, el checkpoint corresponde a la iteracion 12.500 del entrenamiento y fue entrenado de forma autorregresiva sobre billones de tokens de ADN, con una longitud de contexto de hasta 262.144 tokens.

No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO. La model card remite al paper de bioRxiv y al repositorio de GitHub para los detalles de entrenamiento. Este repositorio es unicamente una conversion de pesos al formato safetensors para el backend vLLM; no introduce cambios en el modelo.

## Capacidades

- Modelado de secuencias de ADN de forma autorregresiva (prediccion del siguiente nucleotido).
- Analisis de contexto genomico largo, hasta 262.144 tokens por secuencia.
- Extraccion de representaciones y puntuaciones de probabilidad sobre secuencias genomicas.
- Soporte de inferencia mediante el backend vLLM del paquete `evo2`.
- Aplicable a tareas de genomica computacional como anotacion, deteccion de variantes o diseno de secuencias.
- No se documentan capacidades de lenguaje natural, vision, audio ni tool calling.

## Casos de uso

- Anotacion funcional de regiones genomicas: el modelo puede procesar ventanas de hasta 262k tokens, suficientes para cubrir genes completos con sus elementos regulatorios, y puntuar la probabilidad de secuencias candidatas.
- Prediccion de efectos de variantes: evaluando la verosimilitud de secuencias con y sin una mutacion, se puede estimar el impacto de variantes en regiones codificantes y no codificantes.
- Analisis de genomas virales: la familia de checkpoints Evo 2 incluye variantes afinadas en Microviridae, lo que demuestra su utilidad para caracterizar genomas virales completos en un solo contexto.
- Busqueda de motivos y elementos regulatorios: el contexto largo permite modelar dependencias entre elementos distantes (enhancers, promotores) que los modelos de ventana corta no capturan.
- Diseno de secuencias sinteticas: el modelo autorregresivo puede generar secuencias candidatas con propiedades deseadas para experimentos de biologia sintetica.
- Investigacion en evolucion comparada: comparando puntuaciones entre secuencias homologas de distintas especies se pueden estudiar patrones de conservacion.
- Despliegue en pipelines de bioinformatica: al cargarse con vLLM, puede integrarse en servicios de inferencia estandar para procesar lotes de secuencias genomicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del repo: 11,6 GB en safetensors (compatible con carga en precision completa o media, segun configuracion).
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, los pesos en bf16 ocupan aproximadamente 13 GB, por lo que se requiere una GPU con al menos 16-24 GB para cargar el modelo completo sin cuantizar.
- GPU recomendadas: no especificadas en la informacion; por tamano, una A100 40GB, H100 o RTX 4090 24GB serian opciones razonables.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24GB) o superiores; no confirmado para GPUs de 16GB.
- Opciones de despliegue: backend vLLM del paquete `evo2` (este checkpoint) y backend Vortex (checkpoint original `arcinstitute/evo2_7b_262k`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| evo2_7b_262k_vllm (este) | ~6,49B | 262.144 | StripedHyena 2, 32 capas | apache-2.0 | safetensors (vLLM) |
| arcinstitute/evo2_7b_262k | ~7B | 262.144 | StripedHyena 2, 32 capas | apache-2.0 | Vortex |
| gbrixi/evo2_7b_vllm | ~7B | hasta 1M | StripedHyena 2, 32 capas | apache-2.0 | safetensors (vLLM) |
| gbrixi/evo2_20b_vllm | ~20B | hasta 1M | StripedHyena 2, 50 capas | apache-2.0 | safetensors (vLLM) |

## Limitaciones y advertencias

- Modelo especializado en secuencias de ADN: no es un modelo de lenguaje natural y no debe usarse para tareas de texto general.
- Riesgo de sobreajuste a las distribuciones genomicas del entrenamiento; el rendimiento en organismos poco representados puede degradarse.
- No se dispone de informacion sobre sesgos del dataset ni sobre evaluaciones de calibracion.
- El contexto de 262k tokens reduce pero no elimina la limitacion para genomas completos de gran tamano.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y del paper para atribuciones.
- Este repositorio es una conversion de pesos; cualquier problema de calidad debe contrastarse con el checkpoint oficial.
- No se documentan garantias de robustez en produccion ni latencias medidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gbrixi/evo2_7b_262k_vllm
- Modelo base oficial: https://huggingface.co/arcinstitute/evo2_7b_262k
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.02.18.638918
- Checkpoint evo2_7b_vllm: https://huggingface.co/gbrixi/evo2_7b_vllm
- Checkpoint evo2_20b_vllm: https://huggingface.co/gbrixi/evo2_20b_vllm
- Checkpoint evo2_7b_microviridae_vllm: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
