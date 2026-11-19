# ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-50pct

## Resumen

GatedDeltaNet-340M-semi-structured-Wanda-50pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de compresion one-shot (sin reentrenamiento) que aplica el algoritmo Wanda para eliminar el 50% de los pesos de todas las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos. El resultado es un checkpoint de 399.531.200 parametros totales en safetensors que conserva la arquitectura original GatedDeltaNet.

El modelo resuelve un problema acotado pero relevante para la investigacion en eficiencia: servir como baseline de referencia para comparar tecnicas de poda semi-estructurada mas sofisticadas (los modelos EHWS del mismo autor) sobre una arquitectura hibrida basada en delta rules con compuertas. No es un modelo pensado para produccion ni para uso general, sino una pieza de evaluacion comparativa dentro de un estudio de esparsidad.

La relevancia actual radica en que GatedDeltaNet es una de las arquitecturas lineales con atencion eficiente que compiten con transformers clasicos en contextos largos, y disponer de variantes podadas con esparsidad uniforme por fila permite medir el coste real de la compresion en perplejidad y en tareas zero-shot. El checkpoint se publica con fecha de creacion de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (modelo lineal con delta rule y compuertas) |
| Parametros totales | 399.531.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 50% semi-estructurada en capas lineales internas (240 capas verificadas) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base, un diseno de secuencia lineal que sustituye la atencion cuadratica por una actualizacion tipo delta rule con compuertas, lo que reduce el coste computacional en secuencias largas. El autor no detalla en la model card la composicion del dataset de preentrenamiento del modelo original ni el numero exacto de tokens, aunque el nombre del checkpoint base (340M-20B) sugiere un entrenamiento sobre aproximadamente 20.000 millones de tokens. No se documenta si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovacion tecnica de esta variante es el proceso de poda: se aplica Wanda en su version oficial (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`), donde cada fila elimina los pesos con menor producto `|W| * sqrt(||X||)`. La calibracion usa 128 secuencias de C4 de 2.048 tokens con semilla 0, y las capas se podan en orden, recalculando la calibracion sobre las salidas de los bloques ya podados. La poda se ejecuta en bfloat16 y tarda 1,5 minutos en una A100 de 40 GB. El resultado es una esparsidad medida de 0,5000 exacta, con el mismo numero de no-ceros en cada fila de las 240 capas podadas, lo que garantiza balanceo perfecto del trabajo por fila.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base GatedDeltaNet.
- Razonamiento basico y respuesta a preguntas de conocimiento general, evaluado en tareas como arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Procesamiento de secuencias largas gracias a la naturaleza lineal de la arquitectura GatedDeltaNet, aunque la longitud de contexto exacta no esta documentada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues no disponibles en la informacion proporcionada.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa para comparar tecnicas de esparsidad semi-estructurada mas avanzadas, ya que su protocolo de evaluacion (perplejidad con ELSA y zero-shot con lm-evaluation-harness) esta documentado y es reproducible.
- Estudio de degradacion por compresion: permite medir la diferencia de perplejidad en WikiText-2 (16,42 denso frente a 20,40 podado) y C4 (19,94 frente a 23,24) para aislar el coste de eliminar el 50% de los pesos.
- Analisis de balanceo de carga en kernels dispersos: al tener el mismo numero de no-ceros por fila en las 240 capas podadas, es util para validar implementaciones de kernels semi-estructurados con particion uniforme.
- Pruebas de integracion con flash-linear-attention: el modelo requiere `import fla` para cargarse, por lo que sirve para validar pipelines de inferencia que dependan de esta libreria.
- Experimentos academicos de eficiencia energetica: comparar el consumo de un modelo denso frente a uno con 50% de esparsidad en el mismo hardware (por ejemplo, una A100 40 GB) para estimar ahorros reales.
- Docencia y divulgacion sobre tecnicas de pruning: su model card detalla el procedimiento paso a paso, lo que lo convierte en un ejemplo didactico de poda one-shot con Wanda sobre una arquitectura no transformer clasica.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 16,42 | 20,40 |
| C4 | 19,94 | 23,24 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2423 |
| arc_easy | 0,6023 | 0,5682 |
| boolq | 0,5985 | 0,6220 |
| hellaswag | 0,3461 | 0,3270 |
| openbookqa | 0,2300 | 0,1900 |
| rte | 0,5162 | 0,4946 |
| winogrande | 0,5036 | 0,5138 |
| Media | 0,4373 | 0,4226 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8 GB para los pesos (399,5 M de parametros), mas overhead de activaciones y cache; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en bfloat16: similar a fp16, en torno a 0,8 GB de pesos.
- GPU recomendadas: cualquier GPU moderna; el autor uso una A100 de 40 GB para la poda, pero para inferencia basta una RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado; no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GatedDeltaNet-340M-semi-structured-Wanda-50pct | 399,5 M | no disponible | 20,40 | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | no disponible | no disponible | 16,42 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados) |

La comparativa se limita al modelo base denso y a las variantes EHWS mencionadas en la model card, ya que no se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la perplejidad de forma notable: +3,98 puntos en WikiText-2 y +3,30 en C4 respecto al modelo denso.
- La precision media zero-shot cae de 0,4373 a 0,4226, con perdidas especialmente marcadas en openbookqa (-0,0400) y arc_easy (-0,0341).
- El modelo no ha sido ajustado por instrucciones ni alineado, por lo que no es adecuado para uso conversacional directo.
- No se documenta la licencia, lo que impide confirmar si se permite uso comercial.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado sobre datos web (C4) es previsible que herede sesgos de ese corpus.
- Riesgo de alucinacion inherente a modelos de lenguaje de este tamano y sin alineacion.
- Requiere la libreria `flash-linear-attention` para cargarse, lo que limita la portabilidad a entornos que no la tengan instalada.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.
- El checkpoint esta pensado como baseline de investigacion, no como modelo de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Codigo oficial de Wanda: locuslab/wanda, commit 8e8fc87 (rama unstructured)
- Protocolo de evaluacion ELSA: no disponible como enlace directo en la informacion proporcionada
- lm-evaluation-harness: no disponible como enlace directo en la informacion proporcionada
