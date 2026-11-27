# brineylab/8M_full_checkpoint-500000

## Resumen

El modelo `brineylab/8M_full_checkpoint-500000` es un modelo de lenguaje de proteinas (protein language model) basado en la arquitectura ESM-2, especializado en secuencias de anticuerpos. Lo desarrolla el laboratorio brineylab en el contexto de un estudio sobre leyes de escalado (scaling laws) de modelos de lenguaje de anticuerpos (AbLMs). Con 7.615.562 parametros, es el miembro mas pequeno de una familia de 15 modelos (de 8M a 650M parametros) entrenados para analizar como interactuan el tamano del modelo y el volumen de datos en el rendimiento final.

El modelo resuelve una tarea concreta: el modelado de lenguaje enmascarado (masked language modeling, `fill-mask`) sobre secuencias de anticuerpos con cadenas pesada y ligera emparejadas de forma nativa. Esto lo hace util para tareas de representacion y clasificacion de anticuerpos, como prediccion de especificidad o analisis de repertorios inmunitarios, en lugar de para generacion de texto libre.

Es relevante ahora porque acompana a un preprint en bioRxiv sobre estrategias de escalado de AbLMs, y porque publica pesos, datasets y codigo de forma abierta bajo licencia MIT, lo que facilita su reproducibilidad y su uso como punto de partida para fine-tuning en tareas biologicas especificas. Su tamano reducido lo hace ademas desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, masked language modeling) |
| Parametros totales | 7.615.562 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; entradas rellenadas o truncadas a 320) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo ESM-2 con 6 capas, dimension oculta de 320 y 20 cabezas de atencion, entrenado con el objetivo de masked language modeling. La entrada combina la cadena pesada del anticuerpo, dos tokens `<cls>` como separador y la cadena ligera, con un maximo de 320 tokens (con padding o truncado durante el entrenamiento). Utiliza el tokenizador estandar de ESM-2.

Se entreno sobre el dataset completo del estudio, compuesto por 1.648.726 secuencias de anticuerpos emparejadas de forma nativa. El checkpoint publicado corresponde al paso de entrenamiento 500.000, tal como se recoge en la Tabla S1 del preprint. El estudio marco entrena 15 modelos en cinco tamanos (8M a 650M parametros) y tres escalas de dataset, con el objetivo de caracterizar las leyes de escalado de AbLMs y mostrar que el escalado efectivo requiere equilibrar tamano de modelo y disponibilidad de datos para evitar rendimientos decrecientes. No se detalla en la informacion disponible si hubo fases de RLHF o DPO (poco habituales en modelos de proteinas).

## Capacidades

- Modelado de lenguaje enmascarado (`fill-mask`) sobre secuencias de aminoacidos de anticuerpos.
- Generacion de representaciones (embeddings) de secuencias de cadena pesada y ligera emparejadas.
- Fine-tuning para clasificacion de secuencias mediante `EsmForSequenceClassification` (por ejemplo, clasificacion de especificidad o de emparejamiento, segun el paper).
- Procesamiento de secuencias de hasta 320 tokens con el esquema heavy + `<cls><cls>` + light.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de lenguaje natural (opera sobre alfabeto de aminoacidos).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de especificidad de anticuerpos: partiendo del modelo base, se anade una cabeza de clasificacion y se hace fine-tuning con datos etiquetados para predecir si un anticuerpo es especifico frente a un antigeno, aprovechando las representaciones preentrenadas sobre 1,6M de secuencias emparejadas.
- Clasificacion de emparejamiento cadena pesada-ligera: el formato de entrada con separador `<cls><cls>` permite entrenar clasificadores que validen si una pareja heavy/light es biologicamente plausible.
- Extraccion de embeddings para clustering de repertorios: las representaciones internas del encoder sirven para agrupar secuencias de anticuerpos por similitud funcional en analisis de repertorios inmunitarios.
- Filtrado en pipelines de descubrimiento terapeutico: como modelo pequeno y rapido, puede actuar como primer filtro sobre grandes librerias de secuencias antes de pasar a modelos mayores (por ejemplo, el de 650M de la misma familia).
- Investigacion en leyes de escalado: sirve como punto de referencia de 8M parametros para comparar rendimiento frente a los demas tamanos de la coleccion bajo el mismo dataset y esquema de entrenamiento.
- Prototipado y docencia: su tamano (repo de 0,1 GB, 7,6M parametros) permite ejecutarlo en CPU o en GPUs de consumo para experimentos de biologia computacional sin infraestructura dedicada.
- Punto de partida para tareas de mutacion y diseno: fine-tuning sobre tareas de prediccion de efectos de mutacion en regiones variables de anticuerpos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla S1 y al preprint en bioRxiv para los resultados comparativos del estudio, pero no incluye cifras concretas en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 30 MB para los pesos (7,6M parametros), mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB en cualquier configuracion.
- Cabe holgadamente en CPU para inferencia y fine-tuning ligero.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), incluso en GPUs integradas o en entornos sin GPU.
- GPUs recomendadas: no requiere GPU dedicada; para fine-tuning a mayor escala de batch resulta suficiente una GPU consumer modesta. Para el modelo mayor de la familia (650M) si seria recomendable una GPU con al menos 8-16 GB.
- Opciones de despliegue: `transformers` (libreria nativa), con posibilidad de exportacion a ONNX. No hay variantes GGUF publicadas para llama.cpp u Ollama; vLLM y TGI no estan orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de milisegundos por secuencia en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/8M_full_checkpoint-500000 | 7,6M | 320 tokens | fill-mask de anticuerpos | MIT | Hugging Face |
| Otros modelos de la coleccion AbLMs Scaling Laws (p. ej. 650M) | hasta 650M | 320 tokens | fill-mask de anticuerpos | MIT | Hugging Face (coleccion brineylab) |
| ESM-2 base (facebook/esm2_t6_8M_UR50D) | ~8M | 1024 tokens | fill-mask de proteinas generales | MIT | Hugging Face |
| ESM-2 (mayores, p. ej. 650M) | hasta 15B en la familia | 1024 tokens | fill-mask de proteinas generales | MIT | Hugging Face |

La diferencia clave frente a ESM-2 general es el entrenamiento especifico sobre anticuerpos emparejados y el esquema de entrada heavy/light, que no existe en los modelos ESM-2 originales. Frente a los modelos mayores de la misma coleccion, este ofrece menor capacidad pero mayor facilidad de despliegue.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo tiene sentido sobre secuencias de anticuerpos; su rendimiento en proteinas generales no esta caracterizado.
- Ventana de contexto de 320 tokens: secuencias mas largas se truncan, lo que puede perder informacion en cadenas especialmente largas.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto libre), pero las predicciones de `fill-mask` o de clasificacion tras fine-tuning pueden ser erroneas y no deben usarse como unica evidencia en decisiones terapeuticas.
- Sesgos potenciales derivados del dataset de 1,6M de secuencias emparejadas: la distribucion de repertorios puede no representar todas las especies, subtipos o poblaciones.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene citar el preprint y respetar las condiciones de los datasets de Zenodo.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible cuantificar su rendimiento frente a alternativas sin consultar el preprint.
- No dispone de variantes cuantizadas publicadas; el despliegue en entornos con `llama.cpp` u Ollama requeriria conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/8M_full_checkpoint-500000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets y modelos en Zenodo: https://doi.org/10.5281/zenodo.15447078
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
