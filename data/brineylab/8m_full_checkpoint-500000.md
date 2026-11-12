# brineylab/8M_full_checkpoint-500000

## Resumen

El modelo `brineylab/8M_full_checkpoint-500000` es un modelo de lenguaje de proteinas (protein language model) de tipo ESM-2, desarrollado por el laboratorio brineylab, especializado en el analisis de secuencias de anticuerpos. Forma parte de un estudio sistematico sobre las leyes de escalado (scaling laws) de los modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 variantes que combinan cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias pareadas de anticuerpos (aproximadamente 1,6 millones de secuencias en total). El modelo resuelve la tarea de `fill-mask` (enmascaramiento de tokens) sobre secuencias de aminoacidos, lo que permite obtener representaciones contextuales utiles para tareas downstream como clasificacion de especificidad o prediccion de pares cadena pesada-cadena ligera.

Esta variante concreta corresponde al modelo mas pequeno del estudio (8M de parametros, 6 capas transformer, hidden size 320, 20 cabezas de atencion), entrenado sobre el dataset completo de 1.648.726 secuencias pareadas de anticuerpos y guardado en el paso de entrenamiento 500.000. Su relevancia actual reside en que forma parte de un trabajo publicado como preprint en bioRxiv que investiga como balancear el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes en el dominio de los anticuerpos, un area de interes creciente para el descubrimiento terapeutico.

A diferencia de los LLM de proposito general, este modelo no genera texto ni mantiene conversaciones: es un encoder especializado en bioinformatica que trabaja exclusivamente con secuencias de aminoacidos de anticuerpos. Su licencia MIT y su reducido tamano (7,6 millones de parametros, repositorio de 0,1 GB) lo hacen accesible para experimentacion en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ESM-2 (6 capas, hidden size 320, 20 cabezas de atencion) |
| Parametros totales | 7.615.562 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens (entrada truncada o rellenada a esta longitud durante el entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (trabaja con secuencias de aminoacidos, no con lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2 (Evolutionary Scale Modeling), un transformer encoder disenado para proteinas. En esta variante de 8M de parametros, la red consta de 6 capas transformer con un tamano de representacion oculto de 320 y 20 cabezas de atencion. El tokenizador empleado es el tokenizador estandar de ESM-2. La entrada se construye concatenando la secuencia de aminoacidos de la cadena pesada del anticuerpo, dos tokens `<cls>` como separador y la secuencia de la cadena ligera, con truncamiento o relleno a 320 tokens durante el entrenamiento.

El entrenamiento se realizo sobre 1.648.726 secuencias pareadas de anticuerpos (cadenas pesada y ligera de forma nativa), en el marco de un estudio que entreno 15 modelos combinando cinco tamanos (8M a 650M) y tres escalas de dataset. El checkpoint publicado corresponde al paso 500.000 de entrenamiento, tal como se recoge en la Tabla S1 del preprint. El objetivo de entrenamiento es `fill-mask` (masked language modeling), lo que permite al modelo aprender representaciones contextuales de las secuencias. No se dispone de informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion, ya que no son aplicables a este tipo de modelo biologico.

## Capacidades

- Modelado de lenguaje enmascarado (`fill-mask`) sobre secuencias de aminoacidos de anticuerpos.
- Generacion de embeddings contextuales para cadenas pesada y ligera de anticuerpos, utiles como caracteristicas para tareas downstream.
- Procesamiento de secuencias pareadas nativas (cadena pesada + separador `<cls><cls>` + cadena ligera).
- Fine-tuning para tareas de clasificacion de secuencias mediante `EsmForSequenceClassification` (por ejemplo, clasificacion de especificidad o clasificacion de pares), con la posibilidad de congelar los pesos del modelo base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision, audio ni generacion de texto en lenguaje natural.
- No dispone de capacidades multilingues en el sentido convencional: opera sobre el alfabeto de aminoacidos.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: dado un anticuerpo con posiciones ocultas, el modelo infiere los aminoacidos mas probables, lo que permite estudiar la conservacion y variabilidad de regiones concretas de la cadena pesada o ligera.
- Clasificacion de especificidad de anticuerpos: mediante fine-tuning con `EsmForSequenceClassification` y el modelo base congelado, se puede entrenar un clasificador para predecir si un anticuerpo se une a un antigeno determinado, aprovechando las representaciones del encoder.
- Clasificacion de pares cadena pesada-cadena ligera: el formato de entrada con separador `<cls><cls>` permite entrenar modelos que evaluen la compatibilidad o el emparejamiento correcto de cadenas, util en el diseno y validacion de anticuerpos terapeuticos.
- Filtrado y priorizacion en pipelines de descubrimiento de anticuerpos: al ser un modelo de 8M de parametros (0,1 GB), puede ejecutarse en CPU o en GPU de gama baja para puntuar grandes repertorios de secuencias antes de pasar a modelos mayores o a validacion experimental.
- Generacion de embeddings para busqueda de similitud y agrupamiento de repertorios inmunitarios: las representaciones contextuales permiten agrupar secuencias funcionalmente relacionadas o detectar clusters de anticuerpos con propiedades similares.
- Estudio de leyes de escalado y ablaciones: el modelo sirve como punto de referencia en el rango de 8M de parametros dentro del conjunto de 15 modelos del estudio, util para investigadores que quieran reproducir o extender los resultados del preprint sobre balance entre tamano de modelo y datos.
- Prototipado rapido en entornos con recursos limitados: su reducido tamano y licencia MIT permiten integrarlo en cuadernos de experimentacion o en servicios ligeros de inferencia sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint asociado (bioRxiv) describe los resultados del estudio de scaling laws, pero no se incluyen en la informacion proporcionada cifras concretas de MMLU, HumanEval, GSM8K ni de tareas especificas de anticuerpos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (7,6M de parametros, aproximadamente 30 MB en fp32), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, en GPUs integradas y en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.).
- Cabe en consumer GPU: si, en todas las GPU consumer actuales y en la mayoria de entornos sin GPU.
- Opciones de despliegue: transformers (libreria nativa), con posibilidad de exportacion a otros formatos no documentada en la informacion disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en CPU y practicamente despreciable en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/8M_full_checkpoint-500000 | 7,6M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |
| ESM-2 (8M, facebook/esm2_t6_8M_UR50D) | ~8M | 1022 tokens | fill-mask (proteinas generales) | MIT | Hugging Face |
| Otros modelos de la coleccion AbLMs Scaling Laws (brineylab) | 8M a 650M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |

El modelo se distingue del ESM-2 original de 8M en que esta especializado en secuencias pareadas de anticuerpos (cadena pesada y ligera con separador `<cls><cls>`), mientras que el ESM-2 estandar se entrena sobre proteinas generales con un unico token de separacion. La comparacion directa de rendimiento con ESM-2 u otros modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en secuencias de anticuerpos; su uso sobre proteinas de otra naturaleza o sobre texto en lenguaje natural no esta soportado ni validado.
- La longitud de contexto esta limitada a 320 tokens, lo que restringe el analisis de cadenas muy largas o deconstructos que excedan ese tamano.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento (por ejemplo, sesgo hacia determinados repertorios, especies o tipos de anticuerpos), lo que puede afectar a la generalizacion.
- Riesgo de alucinacion en el sentido de generar predicciones plausibles pero biologicamente invalidas en tareas de `fill-mask`; los resultados deben validarse experimentalmente.
- No es un modelo generativo de texto: no debe emplearse para tareas de conversacion, codigo, matematicas ni agentes.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la validez biologica de las predicciones.
- El checkpoint corresponde al paso 500.000 de entrenamiento; no se documenta si es el checkpoint final ni su rendimiento relativo frente a otros pasos.
- No se dispone de informacion sobre cuantizacion ni sobre formatos de despliegue alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/8M_full_checkpoint-500000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
