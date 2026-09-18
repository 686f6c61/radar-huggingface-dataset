# Broadnet/gemma-4-26B-A4B-uno-pilot-adapter

## Resumen

El modelo publicado como `Broadnet/gemma-4-26B-A4B-uno-pilot-adapter` no es un modelo de lenguaje completo, sino un adaptador LoRA de rango 16 entrenado por Broadnet para acelerar la decodificación del modelo Gemma 4 26B A4B mediante el método de decodificación especulativa Uno. El adaptador se acopla a la variante de mezcla de expertos (MoE) de 26B parámetros de Google y se sirve con el fork vLLM-Uno v0.3.0 o posterior, que integra el método en el motor de inferencia vLLM.

Su relevancia es estrictamente de rendimiento, no de calidad: el autor reporta una mejora de 1,1662x respecto a la decodificación plana sobre una carga de trabajo de 72 prompts de producción, medida en una NVIDIA RTX 3090 con una tasa de aceptación del 48,88% en K=4. Se trata de un adaptador piloto entrenado sobre un corpus de 965 filas, con dos épocas y 1.930 actualizaciones, del que se publica el checkpoint del paso 1.900. No añade capacidades nuevas al modelo base ni mejora su precisión; hereda las capacidades de chat, código y tool calling de Gemma 4 26B A4B y las lenguas soportadas por el modelo base.

El adaptador concreta el interés creciente por la decodificación especulativa autoinducida, en la que el propio adaptador actúa como cabezal de borrador sobre el modelo base congelado, evitando desplegar un modelo draft independiente. Su licencia Apache-2.0 y su integración con vLLM facilitan la experimentación, aunque su alcance piloto y la ausencia de benchmarks de calidad publicados limitan por ahora su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE (Gemma 4 26B A4B) |
| Parametros totales | 26B en el modelo base, según la nomenclatura del checkpoint; el fichero del adaptador ocupa 75.627.016 bytes |
| Parametros activos | No confirmado en la información disponible; la nomenclatura A4B del modelo base indica aproximadamente 4B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 4-bit en el checkpoint base (`cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit`); el adaptador se sirve en bfloat16 |
| Idiomas soportados | Inglés (en) y árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); base en AWQ-4bit |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT con rango 16, alpha 256, dropout 0 y sin bias, aplicado sobre las proyecciones de atención `q`, `k`, `v` y `o` y sobre las proyecciones `gate`, `up` y `down` del MLP compartido en las 30 capas del decodificador, lo que suma 205 módulos entrenables. Los expertos MoE empaquetados permanecen congelados durante el entrenamiento. El módulo base es Gemma 4 26B A4B, un transformer con mezcla de expertos cuyas capas combinan atención de ventana deslizante y atención completa, motivo por el que el fork exige el backend `TRITON_ATTN`.

El entrenamiento se realizó sobre un corpus piloto de 965 filas procedente de cuatro conjuntos públicos: `DataCreatorAI/Multi-Turn-Conversational-SFT`, `nvidia/Nemotron-Post-Training-Dataset-v1`, `m-a-p/CodeFeedback-Filtered-Instruction` (220 de las 965 filas, un 22,8%, con texto generado por OpenAI) y `RASHID778/arabic-instruct-curated`. Se completaron 2 épocas y 1.930 actualizaciones, y se publicó el checkpoint del paso 1.900. La innovación técnica no está en el adaptador en sí, sino en el método Uno de decodificación especulativa: el adaptador se emplea como cabezal de borrador sobre el modelo base congelado, y el fork vLLM-Uno certifica el perfil de servicio de la versión 0.3.0 con una puerta de verificación de pérdida nula basada en permutaciones (36 pruebas, 35.999 permutaciones, alpha de Bonferroni 2,78e-4).

## Capacidades

- No incorpora capacidades nuevas: es un adaptador de throughput, no una mejora de calidad, y hereda el comportamiento del modelo base `google/gemma-4-26B-A4B-it`.
- Generación de texto conversacional en inglés y árabe, según la composición del corpus de entrenamiento.
- Código y tareas de software, ya que el corpus incluye el conjunto `m-a-p/CodeFeedback-Filtered-Instruction` y contenido de software y STEM.
- Tool calling y function calling, presentes en el corpus de entrenamiento en inglés.
- Razonamiento multi-turno, gracias a las filas de conversación multi-turno del corpus.
- Decodificación especulativa en modo greedy y con muestreo, con una puerta de verificación que declara que Uno es tan parecido a la decodificación plana como la decodificación plana lo es consigo misma entre sesiones, en este hardware.
- No soporta visión ni audio según la información disponible, y no se documentan modos de pensamiento explícitos.

## Casos de uso

- Servicio de chat de alto rendimiento en una sola GPU de consumo: el adaptador permite pasar de 132,279 a 154,261 tok/s en la carga de 72 prompts, lo que resulta útil para desplegar Gemma 4 26B A4B en una RTX 3090 sin cambiar de hardware.
- Atención al cliente automatizada en inglés y árabe: el corpus incluye conversaciones multi-turno y contenido en árabe, y el modelo base mantiene el contexto conversacional mientras el adaptador reduce el coste por token generado.
- Asistentes de código integrados en el IDE: el adaptador conserva la capacidad de generación de código del modelo base y añade velocidad de decodificación, lo que reduce la latencia percibida en autocompletado.
- Agentes con tool calling en producción: la aceleración es compatible con decodificación greedy y con muestreo, de modo que los flujos de agente que emiten llamadas a herramientas se benefician de la mejora sin alterar la distribución de salida.
- Despliegue multi-tenant sobre un único modelo base: al ser un LoRA de rango 16 que se carga con `--lora-target-modules`, varios adaptadores pueden servirse sobre el mismo checkpoint AWQ en vLLM, compartiendo los pesos del modelo base.
- Investigación en decodificación especulativa: el repositorio incluye el código de servicio y el paper con todas las mediciones, lo que permite reproducir la tasa de aceptación por posición y el test de pérdida nula sobre una configuración fija.
- Validación de pipelines de inferencia antes de producir un corpus mayor: el adaptador sirve como piloto para medir aceptación, coste de ciclo y viabilidad del método Uno antes de invertir en el corpus definitivo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas mediciones publicadas son de rendimiento y aceptación, y se reproducen a continuación tal como aparecen en la model card.

| Metrica | Valor |
|---|---|
| Tasa de aceptación del borrador en K=4 | 0,4888 (48,88%), contadores reales por posición |
| Control plano emparejado (full72) | 132,279 tok/s |
| Adaptador (full72) | 154,261 tok/s |
| Aceleración frente al control emparejado | 1,1662x |
| Supervivencia por posición de borrador (1/2/3/4) | 0,9164 / 0,6069 / 0,3070 / 0,1251 |
| K=8 con el mismo adaptador | 1,0004x (punto de equilibrio, no supera a K=4) |
| Puerta de pérdida nula | PASS (4 comparaciones, 256 muestras x 16 tokens sobre 3 prefijos fijados) |
| Coste de ciclo medido | C(4) aproximadamente 2,53 |

## Requisitos de hardware

- Entorno de medición documentado: NVIDIA RTX 3090 (24 GB) con vLLM 0.28.1rc1.dev437, semilla 29, con un control plano emparejado en la misma sesión de servicio.
- No se publica una tabla de VRAM por cuantización; el único punto de operación documentado es una GPU de 24 GB con el checkpoint base AWQ 4-bit.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo certifica la RTX 3090 y el perfil de la versión 0.3.0 del fork.
- Cabe en GPU de consumo: sí, al menos en RTX 3090, según la medición publicada.
- Opciones de despliegue: vLLM-Uno v0.3.0 o posterior, imagen `ghcr.io/brntech/vllm-uno:0.3.0`, con `--dtype bfloat16`, `--attention-backend TRITON_ATTN` y `--lora-target-modules qkv_proj o_proj gate_up_proj down_proj`, rango fijado en 16. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 154,261 tok/s en la carga de 72 prompts frente a 132,279 tok/s del control plano; el cronometraje de ciclo usa cinco peticiones greedy fijas de 384 tokens tras dos calentamientos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables (adaptadores EAGLE, Medusa, decodificación especulativa con modelo draft independiente u otros adaptadores de throughput) en la información proporcionada. La única comparación con cifras publicadas es interna, entre el propio adaptador y el control plano del mismo modelo base.

| Configuracion | Aceleracion medida | Notas |
|---|---|---|
| Control plano (sin adaptador) | 1,0000x (132,279 tok/s) | Referencia emparejada en la misma sesión |
| Adaptador Uno, K=4 | 1,1662x (154,261 tok/s) | Configuración recomendada por el autor |
| Adaptador Uno, K=8 | 1,0004x | Punto de equilibrio; el coste de ciclo sube con la anchura del borrador |
| Adaptadores de otras familias | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Alcance piloto: 965 filas de entrenamiento, una semilla, una máquina de servicio y una carga de trabajo de 72 prompts; el techo medido del corpus es de aproximadamente 225 candidatos aceptados de los 649 candidatos de prefijo de referencia fijados.
- No es una mejora de calidad: el adaptador está diseñado para throughput, y no se publican métricas de precisión, razonamiento o código.
- El término "lossless" se usa en el sentido acotado de "no se detectó discrepancia con este tamaño de muestra", no como equivalencia demostrada; es la propia matización de la puerta de verificación.
- El coste de ciclo medido crece con la anchura del borrador (C(4) aproximadamente 2,53); en K=8 la escalera de aceptación forzada es optimista en un 19%, por lo que cualquier aceleración calculada con esa escalera por encima de K=4 es una cota superior, no una estimación.
- Compatibilidad restringida: el adaptador se entrenó y evaluó sobre la revisión `0ef577a5710035bd2d3a3f27e4f5cb2e86a9a9ba` del checkpoint AWQ; la compatibilidad, la aceptación y el throughput en otros checkpoints requieren validación.
- No es aplicable a otros tamaños de Gemma 4: los modelos de 31B denso y E4B tienen formas distintas.
- Requiere el fork vLLM-Uno v0.3.0 o posterior y el backend `TRITON_ATTN`; el fork impone restricciones como la exigencia de un único grupo de KV.
- Idiomas limitados a inglés y árabe, según los idiomas declarados en la ficha de HuggingFace.
- Riesgo de alucinación y sesgos heredados del modelo base Gemma 4 26B A4B, no evaluados ni corregidos por este adaptador.
- Advertencia de procedencia de datos: 220 de las 965 filas (22,8%) provienen de `m-a-p/CodeFeedback-Filtered-Instruction`, que contiene texto generado por OpenAI, según se indica en la propia model card; conviene revisar las condiciones de uso de ese conjunto antes de un uso comercial.
- Adopción nula en el momento de la consulta: 0 descargas y 0 "likes", sin validación externa de la comunidad.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Broadnet/gemma-4-26B-A4B-uno-pilot-adapter
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint cuantizado usado para entrenar y medir: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- Repositorio del fork de servicio: https://github.com/brntech/vllm-uno
- Versión vLLM-Uno v0.3.0: https://github.com/brntech/vllm-uno/releases/tag/v0.3.0
- Imagen de contenedor: `ghcr.io/brntech/vllm-uno:0.3.0`
- Pull request upstream en vLLM: https://github.com/vllm-project/vllm/pull/55947
- Paper con las mediciones: https://doi.org/10.5281/zenodo.22820512
- Identificador arXiv declarado en las etiquetas: arXiv:2609.04010
- Conjuntos de datos de entrenamiento: https://huggingface.co/datasets/DataCreatorAI/Multi-Turn-Conversational-SFT, https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1, https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction, https://huggingface.co/datasets/RASHID778/arabic-instruct-curated
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a definiciones del término inglés "query" en diccionarios y enciclopedias), por lo que no se han incorporado como fuentes.
