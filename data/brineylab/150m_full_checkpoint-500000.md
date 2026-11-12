# brineylab/150M_full_checkpoint-500000

## Resumen

El modelo `brineylab/150M_full_checkpoint-500000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab en el contexto de un estudio sobre leyes de escalado de modelos de lenguaje de anticuerpos (AbLMs). Concretamente, es uno de los 15 modelos que componen el estudio de scaling laws publicado como preprint en bioRxiv, en el que se entrenaron variantes de ESM-2 de cinco tamanos distintos (8M a 650M parametros) sobre tres escalas de datasets de secuencias de anticuerpos emparejadas.

Este checkpoint concreto corresponde al tamano de 150M parametros entrenado sobre el dataset completo (1.648.726 secuencias de anticuerpos emparejadas nativamente), en el paso de entrenamiento 500.000. Su proposito es servir como modelo base para tareas de modelado de lenguaje enmascarado (fill-mask) sobre secuencias de anticuerpos, asi como para fine-tuning posterior en tareas de clasificacion como especificidad o clasificacion de pares cadena pesada/cadena ligera.

La relevancia de este modelo reside en su contribucion metodologica: el estudio investiga como balancear el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes en el dominio de anticuerpos, un area de interes creciente para el descubrimiento terapeutico. El modelo se distribuye con licencia MIT y formato safetensors, integrado en la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, fill-mask) |
| Parametros totales | 148.346.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens durante entrenamiento (padding/truncado); no disponible un limite maximo oficial |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencias de aminoacidos de anticuerpos) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas transformer | 30 |
| Hidden size | 640 |
| Cabezas de atencion | 20 |
| Pipeline | fill-mask |
| Libreria | transformers |
| Tamano del repo | 0,6 GB |
| Dataset de entrenamiento | 1.648.726 secuencias de anticuerpos emparejadas |
| Paso de entrenamiento | 500.000 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ESM-2 (Evolutionary Scale Modeling), un transformer encoder disenado originalmente para proteinas, con 30 capas, hidden size de 640 y 20 cabezas de atencion, totalizando aproximadamente 148 millones de parametros. Se entrena con la tarea de modelado de lenguaje enmascarado (fill-mask), prediciendo aminoacidos enmascarados a partir del contexto de la secuencia.

Los datos de entrenamiento consisten en 1.648.726 secuencias de anticuerpos emparejadas nativamente (cadena pesada + cadena ligera), formateadas con dos tokens `<cls>` como separador entre ambas cadenas. Durante el entrenamiento, las entradas se rellenan o truncan a 320 tokens. El checkpoint publicado corresponde al paso 500.000. El estudio completo entrena 15 modelos cruzando cinco tamanos (8M a 650M) con tres escalas de dataset, con el objetivo de caracterizar las leyes de escalado especificas para AbLMs. No se dispone en la informacion proporcionada de detalles sobre composicion exacta del dataset, uso de RLHF/DPO (no aplicable a un modelo fill-mask) ni innovaciones arquitectonicas adicionales mas alla del uso de ESM-2 como base.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Procesamiento de pares cadena pesada / cadena ligera mediante el separador de tokens `<cls><cls>`.
- Representaciones contextualizadas de secuencias proteicas, utiles como base para fine-tuning.
- Fine-tuning para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares) mediante `EsmForSequenceClassification`.
- Extraccion de embeddings de proteinas para tareas downstream.
- Capacidad multilingue: no disponible (dominio limitado a secuencias biologicas, no lenguaje natural).
- Soporte de tool calling / function calling: no disponible (no aplicable a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplicable).
- Capacidades especiales: no disponible.

## Casos de uso

- Prediccion de aminoacidos enmascarados en secuencias de anticuerpos: dado un par pesada/ligera con posiciones enmascaradas, el modelo predice los residuos plausibles, util para analisis de mutaciones y diseno de variantes.
- Fine-tuning para clasificacion de especificidad de anticuerpos: cargando `EsmForSequenceClassification` y congelando el modelo base, se puede entrenar un clasificador para discriminar anticuerpos con propiedades de union concretas.
- Clasificacion de pares cadena pesada/ligera: el formato de entrada con separador permite entrenar clasificadores que evaluen la compatibilidad o calidad del emparejamiento entre cadenas.
- Generacion de embeddings para busqueda de similitud: las representaciones del encoder pueden usarse para recuperar anticuerpos similares en repertorios inmunitarios.
- Filtrado de repertorios inmunitarios: puntuar secuencias con el modelo para priorizar candidatos en pipelines de descubrimiento.
- Base para estudios de scaling laws: el checkpoint forma parte de una coleccion de 15 modelos que permite comparar sistematicamente el efecto del tamano y de los datos en tareas de anticuerpos.
- Inicializacion para modelos de anticuerpos de mayor tamano o tareas especializadas, aprovechando el preentrenamiento sobre 1,6 millones de pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la Tabla S1 del preprint (bioRxiv, DOI 10.1101/2025.09.02.673765) para detalles del checkpoint, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (tamano del repo), menos en fp16 (unos 0,3 GB); no disponible una estimacion oficial por cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente por el reducido tamano del modelo.
- Cabe en consumer GPU: si, holgadamente, incluso en GPUs de gama baja o en CPU.
- Opciones de despliegue: transformers (EsmForMaskedLM / EsmForSequenceClassification), endpoints compatibles segun los tags del repositorio; no disponible confirmacion explicita para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/150M_full_checkpoint-500000 | 148M | 320 tokens (entrenamiento) | fill-mask de anticuerpos | MIT | Hugging Face |
| ESM-2 (Facebook, base) | 8M a 650M (varias tallas) | no disponible | fill-mask de proteinas genericas | no disponible | Hugging Face |
| Otros checkpoints AbLMs del estudio | 8M a 650M | 320 tokens (entrenamiento) | fill-mask de anticuerpos | MIT | Coleccion brineylab |

La comparativa directa con ESM-2 generico es la mas relevante: este modelo es una adaptacion de ESM-2 al dominio de anticuerpos emparejados, entrenada sobre un corpus especifico. Los otros checkpoints del mismo estudio permiten comparar el efecto del tamano y de la escala de datos. No se dispone de datos de rendimiento numericos para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (anticuerpos emparejados); no es un modelo de lenguaje natural ni un modelo de proteinas generalista.
- Entrenado con truncado/padding a 320 tokens; secuencias mas largas pueden perder informacion.
- Riesgo de alucinacion: en fill-mask, puede predecir residuos biologicamente implausibles; los resultados requieren validacion experimental.
- Sesgos: no disponible informacion sobre sesgos del dataset de entrenamiento (composicion, sesgo de repertorio, etc.).
- Limitaciones de idioma: no disponible (no aplica a lenguaje natural).
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del dataset de entrenamiento (Zenodo) y del preprint.
- No se dispone de benchmarks publicos en la informacion proporcionada para evaluar rendimiento en produccion.
- Uso en produccion: requiere validacion especifica del dominio y consideracion de que se trata de un checkpoint intermedio (paso 500.000) de un estudio de scaling, no necesariamente el mejor de la coleccion para cada tarea.

## Enlaces

- Hugging Face: https://huggingface.co/brineylab/150M_full_checkpoint-500000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Dataset en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper ESM-2: https://www.science.org/doi/10.1126/science.ade2574
