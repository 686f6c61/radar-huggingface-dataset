# gbrixi/evo2_7b_base_vllm

## Resumen

Evo 2 es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autoregresiva sobre billones de tokens de secuencias genomicas. Este repositorio concreto, `gbrixi/evo2_7b_base_vllm`, es una conversion del checkpoint base `arcinstitute/evo2_7b_base` a safetensors para el backend vLLM de la propia libreria Evo 2. No se trata de un modelo nuevo, sino de un artefacto de despliegue que permite cargar el modelo base de 7B en vLLM en lugar del backend Vortex.

El modelo resuelve tareas de modelado de secuencias biologicas: prediccion del siguiente nucleotido, generacion de ADN, evaluacion de variantes y analisis de genomas. Su relevancia radica en que aplica la arquitectura de los LLM modernos al dominio genomico, con una ventana de contexto de 8192 tokens en esta variante base, lo que permite procesar fragmentos de ADN de miles de pares de bases en una sola pasada.

La arquitectura es StripedHyena 2, una familia hibrida de capas convolucionales y mecanismos de atencion, con 32 capas y 6.485.725.238 parametros totales segun los pesos en safetensors. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (hibrida convolucional/atencion) |
| Parametros totales | 6.485.725.238 |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (variante base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (para backend vLLM) |

## Arquitectura y entrenamiento

El modelo emplea StripedHyena 2, una arquitectura hibrida que combina operadores convolucionales de largo alcance con capas de atencion, disenada para secuencias muy largas con un coste computacional inferior al de un transformer denso clasico. La variante base de este repositorio tiene 32 capas y esta entrenada con una longitud de contexto de 8192 tokens, segun la model card del autor de la conversion.

El entrenamiento se realizo de forma autoregresiva sobre billones de tokens de ADN, segun la descripcion del modelo original. No se detalla en la informacion disponible la composicion exacta del dataset, el numero preciso de tokens ni si se aplicaron fases de RLHF o DPO; tampoco se describe ninguna innovacion adicional de decodificacion mas alla del soporte de backend vLLM y Vortex.

## Capacidades

- Modelado autoregresivo de secuencias de ADN: prediccion del siguiente nucleotido sobre contexto genomico.
- Generacion de secuencias de ADN condicionadas por contexto.
- Puntuacion de probabilidad de secuencias (log-likelihood) para evaluacion de variantes y regiones genomicas.
- Procesamiento de fragmentos de hasta 8192 tokens en esta variante base; existen variantes del mismo modelo con contexto de 262.144 tokens y hasta 1 millon de tokens.
- Carga mediante la libreria `evo2` con `backend='vllm'`, lo que habilita despliegue en infraestructura de inferencia vLLM.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingues: no disponible (no es un modelo de lenguaje natural).

## Casos de uso

- Anotacion y evaluacion de variantes genomicas: el modelo puntua la probabilidad de secuencias de referencia frente a variantes, lo que permite priorizar variantes con mayor impacto predicho en regiones codificantes o regulatorias.
- Diseno de secuencias sinteticas de ADN: generacion condicionada de fragmentos con propiedades deseadas, util en ingenieria genetica y diseno de constructos.
- Analisis de genomas virales: la existencia de una variante afinada en genomas de Microviridae indica uso directo en clasificacion y caracterizacion de genomas virales.
- Deteccion de regiones funcionales: la puntuacion de log-likelihood sobre ventanas deslizantes permite localizar elementos conservados o funcionales sin alineamiento multiple.
- Preentrenamiento y ajuste fino como base genomica: al ser un checkpoint base, sirve como punto de partida para fine-tuning en tareas downstream (prediccion de expresion, splicing, epigenetica).
- Despliegue en pipelines de inferencia existentes: al estar convertido a safetensors para vLLM, se integra en infraestructura de serving ya montada para otros modelos, reduciendo el coste de adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion con vLLM; RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado.
- Cabe en GPU de consumo: si, en RTX 4090 o GPUs con 24 GB o mas, siempre que se ajuste la longitud de contexto y el tamano de batch.
- Opciones de despliegue: backend vLLM de la libreria `evo2` (objetivo de este repositorio); el backend Vortex requiere el checkpoint original `arcinstitute/evo2_7b_base`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evo2_7b_base_vllm (este) | 6,49B | 8192 | ADN | Apache 2.0 | HuggingFace, backend vLLM |
| evo2_7b_vllm | 7B | hasta 1M | ADN | Apache 2.0 | HuggingFace, backend vLLM |
| evo2_20b_vllm | 20B | hasta 1M | ADN | Apache 2.0 | HuggingFace, backend vLLM |
| evo2_1b_base_vllm | 1B | 8192 | ADN | Apache 2.0 | HuggingFace, backend vLLM |

Las alternativas comparables son variantes del mismo modelo original de Arc Institute; no se dispone en la informacion proporcionada de modelos de ADN de otros desarrolladores para comparar parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Es un checkpoint base, no afinado para instrucciones ni para tareas concretas; requiere fine-tuning o prompting especifico para cada aplicacion.
- Modelo especializado en ADN: no procesa lenguaje natural ni admite instrucciones en texto; cualquier uso fuera del dominio genomico carece de sentido.
- Ventana de contexto limitada a 8192 tokens en esta variante; para secuencias mas largas hay que usar las variantes de 262.144 o de hasta 1 millon de tokens.
- Riesgo de generar secuencias biologicas plausibles pero no validas experimentalmente; toda salida debe validarse in silico y, en su caso, in vitro.
- No se documentan sesgos ni evaluaciones de seguridad en la informacion disponible; el uso en investigacion genomica debe acompanarse de revision etica y regulatoria.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo original y de los datos de entrenamiento, no detalladas aqui.
- Repositorio con muy pocas descargas y sin likes; es un artefacto de conversion de un tercero, no el repositorio oficial del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gbrixi/evo2_7b_base_vllm
- Modelo base original: https://huggingface.co/arcinstitute/evo2_7b_base
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
- Checkpoint evo2_20b vLLM: https://huggingface.co/gbrixi/evo2_20b_vllm
- Checkpoint evo2_7b vLLM: https://huggingface.co/gbrixi/evo2_7b_vllm
- Checkpoint evo2_1b_base vLLM: https://huggingface.co/gbrixi/evo2_1b_base_vllm
- Checkpoint evo2_7b_262k vLLM: https://huggingface.co/gbrixi/evo2_7b_262k_vllm
- Checkpoint evo2_7b_microviridae vLLM: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
