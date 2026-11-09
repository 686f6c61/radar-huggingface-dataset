# gaijingchu/precision-paper-30M-60M-110M

## Resumen

`precision-paper-30M-60M-110M` es un conjunto de modelos de lenguaje de pequeno tamano (30M, 60M y 110M parametros) publicados por el usuario gaijingchu en Hugging Face. No se trata de un modelo unico, sino de una coleccion de ejecuciones de entrenamiento independientes que conforman un estudio de escalado de precision: cada run entrena una variante de la arquitectura OLMo-core con una precision numerica distinta (bf16, cuantizacion de solo pesos `w<bits>` o de pesos y activaciones `f<bits>`), un presupuesto de tokens diferente y una semilla y tasa de aprendizaje concretas.

El objetivo declarado es medir como afecta la precision de entrenamiento al rendimiento final del modelo a distintas escalas de parametros y de tokens. Los modelos de 220M y 440M del mismo estudio se publican en un repositorio separado (`gaijingchu/precision-paper-220M-440M`). El repositorio contiene unicamente los pesos finales y las mediciones por run, no los checkpoints intermedios ni los datos de entrenamiento.

La relevancia es fundamentalmente de investigacion: sirve para reproducir y analizar curvas de escalado de precision en modelos pequenos, no como modelo de produccion. La model card no especifica licencia, idiomas, pipeline ni resultados de benchmarks, por lo que la informacion disponible es limitada y muchos campos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-core (transformer decoder-only, segun el framework de entrenamiento) |
| Parametros totales | 30M / 60M / 110M (tres tamanos, un directorio por run) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, cuantizacion weight-only (`w<bits>`) y pesos + activaciones (`f<bits>`) usadas durante el entrenamiento; se reportan ademas barridos de cuantizacion post-entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`) en formato OLMo-core; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura OLMo-core, un transformer decoder-only implementado en el framework OLMo-core de AI2. El repositorio no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni la funcion de activacion de cada tamano; esa informacion estaria en el `config.json` de cada run, que no se reproduce en la model card. No se especifica si se aplicaron tecnicas como RLHF, DPO o decodificacion especulativa.

El eje del estudio es la precision numerica de entrenamiento. Los nombres de los runs codifican tamano del modelo (`30M`, `60M`, `110M`), tokens de entrenamiento (`D<tokens>B`), precision (`bf16`, `w<bits>` para solo pesos, `f<bits>` para pesos y activaciones), tasa de aprendizaje y semilla. Cada run incluye un `launch.yaml` con la configuracion completa de entrenamiento y ficheros JSON con mediciones: perdida final, barridos de perturbacion gaussiana de pesos y cuantizacion post-entrenamiento. No se publican ni los checkpoints intermedios ni el dataset de entrenamiento, lo que limita la reproducibilidad completa del pipeline.

## Capacidades

- Generacion de texto autoregresiva propia de un transformer decoder-only de OLMo-core.
- Razonamiento y codigo: no hay evidencia publicada de capacidades especificas; el tamano (30M-110M) limita severamente tareas complejas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se declara modo thinking, vision ni audio.
- Uso principal documentado: objeto de estudio para medir el impacto de la precision de entrenamiento y de la cuantizacion en la perdida final y en el comportamiento de los pesos.

## Casos de uso

- Estudio de escalado de precision: comparar la perdida final de runs con identico tamano y presupuesto de tokens pero distinta precision (`bf16` frente a `w<bits>` y `f<bits>`) para cuantificar la degradacion por precision reducida.
- Investigacion sobre cuantizacion post-entrenamiento: los JSON de cada run incluyen barridos de cuantizacion que permiten analizar la robustez de los pesos a distintas precisiones sin reentrenar.
- Analisis de sensibilidad de pesos: los barridos de perturbacion gaussiana de pesos permiten estudiar la estabilidad del modelo ante ruido en los parametros, util para tecnicas de regularizacion o compresion.
- Reproduccion de experimentos a pequena escala: al ser modelos de 30M-110M, caben en una sola GPU consumer y permiten validar pipelines de entrenamiento OLMo-core antes de escalar a 220M/440M.
- Docencia y formacion: sirven como ejemplo practico de como se estructura un experimento controlado de precision y tokens en modelos de lenguaje.
- Baseline para comparativas de eficiencia: medir throughput y consumo de memoria en inferencia con distintas precisiones sobre arquitecturas identicas salvo el tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mediciones internas por run (perdida final, barridos de perturbacion de pesos y cuantizacion post-entrenamiento) sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano. En bf16, 30M ≈ 60 MB de pesos, 60M ≈ 120 MB y 110M ≈ 220 MB; en fp32 se duplica. La VRAM real dependera de la longitud de contexto y del batch.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; tambien CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, con amplio margen en todos los tamanos.
- Opciones de despliegue: el formato publicado es `model.pt` en OLMo-core, por lo que requiere cargar el state dict con el codigo del proyecto; no se proporcionan pesos en GGUF ni safetensors para llama.cpp, Ollama o vLLM de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precision-paper-30M-60M-110M | 30M / 60M / 110M | no disponible | Estudio de precision de entrenamiento (OLMo-core) | no disponible | Hugging Face (`gaijingchu`) |
| precision-paper-220M-440M | 220M / 440M | no disponible | Mismo estudio, escalas mayores | no disponible | Hugging Face (`gaijingchu`) |
| OLMo-core (AI2) | variable | no disponible | Framework y familia base sobre la que se construyen estos runs | no disponible en esta ficha | Repositorio de AI2 |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial no esta autorizado de forma explicita y debe consultarse con el autor.
- No se declaran idiomas soportados ni pipeline; el comportamiento multilingue es desconocido.
- El tamano (30M-110M) implica capacidades linguisticas y de razonamiento muy limitadas; no es adecuado para tareas de produccion que requieran calidad.
- Riesgo de alucinacion elevado y no caracterizado: no hay evaluaciones publicadas.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, que ademas no se publica.
- No se incluyen checkpoints intermedios ni datos, lo que impide reproducir el entrenamiento de forma completa.
- El formato `model.pt` en OLMo-core requiere codigo especifico para cargar el modelo; no hay conversion directa a GGUF ni safetensors publicada.
- Los modelos estan pensados como artefactos de investigacion, no como modelos listos para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/gaijingchu/precision-paper-30M-60M-110M
- Repositorio hermano (220M/440M): https://huggingface.co/gaijingchu/precision-paper-220M-440M
- Framework OLMo-core: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
