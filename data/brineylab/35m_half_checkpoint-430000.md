# brineylab/35M_half_checkpoint-430000

## Resumen

El modelo `brineylab/35M_half_checkpoint-430000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el estudio de secuencias de anticuerpos. Forma parte de un trabajo mas amplio sobre leyes de escalado de modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 modelos de cinco tamanos distintos (de 8M a 650M parametros) sobre tres escalas de datos emparejados de cadenas pesadas y ligeras. Este checkpoint concreto corresponde al tamano de 35M de parametros entrenado sobre la mitad del dataset disponible.

El modelo resuelve la tarea de modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos, lo que permite aprender representaciones utiles para tareas downstream como prediccion de especificidad, clasificacion de pares cadena pesada-ligera y otras tareas de descubrimiento terapeutico. Su relevancia radica en que acompana a un preprint que analiza empiricamente como escalar modelos y datos de forma equilibrada para evitar rendimientos decrecientes, un problema abierto en el campo de los modelos de proteinas.

Con 33.656.098 parametros reales, 12 capas transformer, dimension oculta de 480 y 20 cabezas de atencion, es un modelo compacto pensado para experimentacion rapida y fine-tuning en tareas de biologia computacional, no para generacion de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, masked language modeling) |
| Parametros totales | 33.656.098 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; padding/truncado a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2 de Meta, un transformer encoder con atencion bidireccional entrenado con el objetivo de masked language modeling. En esta configuracion concreta cuenta con 12 capas, hidden size de 480 y 20 cabezas de atencion, lo que arroja 33.656.098 parametros. La entrada no es texto natural sino secuencias de aminoacidos de cadenas pesadas y ligeras de anticuerpos, concatenadas con dos tokens `<cls>` como separador entre ambas cadenas, y truncadas o rellenadas a 320 tokens durante el entrenamiento.

El entrenamiento se realizo sobre la mitad del dataset de secuencias de anticuerpos nativamente emparejadas, concretamente 824.363 secuencias emparejadas, y este checkpoint corresponde al paso 430.000 de entrenamiento (segun la Tabla S1 del preprint). El estudio completo entrena modelos de 8M a 650M parametros sobre tres escalas de datos (aproximadamente 1,6M secuencias en total), con el objetivo de caracterizar las leyes de escalado especificas de AbLMs. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con la naturaleza de modelado de proteinas.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Aprendizaje de representaciones de cadenas pesadas y ligeras emparejadas, con separador `<cls><cls>` entre ambas.
- Fine-tuning para tareas de clasificacion de secuencias mediante `EsmForSequenceClassification` (por ejemplo, clasificacion de especificidad y clasificacion de pares, segun el paper).
- Extraccion de embeddings para tareas downstream de biologia computacional.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de especificidad de anticuerpos: tras fine-tuning con `EsmForSequenceClassification` y congelando el encoder base, el modelo puede clasificar si un par cadena pesada-ligera es especifico frente a un antigeno, aprovechando las representaciones aprendidas sobre 824.363 pares.
- Clasificacion de pares cadena pesada-ligera: el formato de entrada con doble `<cls>` como separador permite entrenar clasificadores que evaluen la compatibilidad o el emparejamiento nativo de ambas cadenas.
- Filtrado previo en pipelines de descubrimiento: usar el modelo como extractor de embeddings para priorizar candidatos en cribados virtuales de repertorios de anticuerpos, reduciendo el numero de secuencias que pasan a validacion experimental.
- Anulacion de mutaciones (masked language modeling): enmascarar posiciones concretas de una secuencia para estimar la probabilidad de aminoacidos alternativos, util en el diseno racional de variantes.
- Investigacion sobre leyes de escalado: el checkpoint sirve como punto de comparacion dentro del estudio AbLMs Scaling Laws para reproducir los experimentos de escalado modelo-datos.
- Prototipado rapido en biologia computacional: con 33M de parametros y un repo de 0,1 GB, es adecuado para experimentar en una sola GPU de consumo antes de escalar a modelos mayores del mismo estudio (hasta 650M).
- Generacion de features para modelos downstream: congelar el encoder y usar sus embeddings como entrada a clasificadores ligeros en tareas de inmunoinformatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint referenciado (bioRxiv 2025.09.02.673765) contiene los resultados del estudio de escalado, pero no se han incluido cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 135 MB solo para pesos (33,6M parametros x 4 bytes), mas activaciones y overhead; en la practica cabe holgadamente en cualquier GPU.
- VRAM estimada en fp16/bf16: aproximadamente 67 MB para pesos.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de consumo inferior es suficiente.
- Cabe en GPU de consumo: si, en practicamente todas las GPU con al menos 1-2 GB de VRAM, incluidas GTX 1650 o similares.
- Opciones de despliegue: `transformers` con `EsmForMaskedLM` (soporte nativo); al ser un modelo ESM, puede exportarse a ONNX; no se documenta soporte especifico para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/35M_half_checkpoint-430000 | 33,6M | 320 tokens | Fill-mask de anticuerpos (ESM-2) | MIT | Hugging Face |
| ESM-2 (8M) | ~8M | ~1024 tokens | Protein MLM general | MIT | Hugging Face (facebook/esm2_t6_8M_UR50D) |
| ESM-2 (650M) | ~650M | ~1024 tokens | Protein MLM general | MIT | Hugging Face (facebook/esm2_t33_650M_UR50D) |
| Otros AbLMs del estudio | 8M-650M | 320 tokens | Fill-mask de anticuerpos | MIT | Coleccion AbLMs Scaling Laws |

La comparativa con ESM-2 original es la mas directa, ya que este modelo es un fine-tuning/entrenamiento desde ESM-2 sobre secuencias de anticuerpos emparejadas. Los modelos del mismo estudio (8M, 35M, 150M, 650M, etc., sobre distintas escalas de datos) son las alternativas naturales dentro de la misma coleccion.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en secuencias de aminoacidos de anticuerpos; no es un modelo de lenguaje natural y no debe usarse para texto.
- Contexto limitado a 320 tokens, lo que restringe secuencias largas (aunque suficiente para la mayoria de cadenas pesadas y ligeras emparejadas).
- Entrenado sobre la mitad del dataset (824.363 secuencias), por lo que su rendimiento puede ser inferior al de checkpoints entrenados con el dataset completo del mismo estudio.
- Riesgo de sesgo hacia la distribucion de secuencias presentes en el dataset de entrenamiento; puede generalizar mal a repertorios de especies o formatos poco representados.
- Riesgo de alucinacion en el sentido de asignar alta probabilidad a aminoacidos plausibles pero biologicamente inviables; las predicciones deben validarse experimentalmente.
- Licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y su uso en produccion clinica o terapeutica requiere validacion independiente.
- No se documentan evaluaciones de seguridad ni de robustez frente a secuencias fuera de distribucion.
- Solo 10 descargas y 0 likes en el momento de la consulta; ecosistema de soporte muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/35M_half_checkpoint-430000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper ESM-2 (referencia): https://www.science.org/doi/10.1126/science.ade2574
