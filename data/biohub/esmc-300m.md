# biohub/ESMC-300M

## Resumen

ESMC es un modelo de lenguaje de proteinas (protein language model, pLM) desarrollado por Biohub (Chan Zuckerberg Initiative) y presentado como la evolucion mas reciente de la familia ESM. Aprende representaciones de secuencias de aminoacidos mediante modelado de lenguaje enmascarado (masked language modeling), de forma que la probabilidad que asigna a cada residuo en su contexto captura restricciones evolutivas, estructurales y funcionales. Se publica en tres escalas: 300M, 600M y 6B parametros; esta ficha cubre la variante pequena de 300M.

La variante ESMC-300M tiene 332.997.184 parametros reales (segun los pesos en safetensors), 30 capas transformer y 1,26e22 FLOPs de entrenamiento. Emplea una arquitectura transformer con Pre-LN, embeddings rotatorios (RoPE) y activaciones SwiGLU, sin sesgos en capas lineales ni en layer norms. El modelo base de 6B se usa como backbone congelado para ESMFold2, el modelo de prediccion de estructura, y dispone de autoencoders dispersos (SAE) para interpretabilidad.

Su relevancia practica esta en que ofrece representaciones de proteinas de alta calidad en un tamano que cabe en GPU de consumo, lo que permite fine-tuning local, extraccion de embeddings para tareas downstream y prediccion de efectos de variantes sin depender de la API del fabricante. La licencia es MIT (con un aviso adicional de terceros), lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Pre-LN, RoPE, SwiGLU, sin sesgos) |
| Parametros totales | 332.997.184 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud de entrenamiento en la fase 2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; en la practica el dominio es secuencia de proteinas, no lenguaje natural) |
| Licencia | MIT (con THIRD_PARTY_NOTICE adicional) |
| Formato de pesos | safetensors (repo de 2,7 GB) |

## Arquitectura y entrenamiento

ESMC es un transformer encoder-only con Pre-LN, embeddings rotatorios y activaciones SwiGLU, sin terminos de sesgo en capas lineales ni en layer norms. La variante de 300M tiene 30 capas; la de 600M, 36; y la de 6B, 80. El objetivo de entrenamiento es masked language modeling sobre secuencias de proteinas, con la cabeza de fill-mask expuesta en `transformers` mediante `AutoModelForMaskedLM`.

Los datos de entrenamiento provienen de UniRef, MGnify y el Joint Genome Institute (JGI), agrupados al 70 % de identidad de secuencia, con 83M, 372M y 2B clusters respectivamente. El entrenamiento se hizo en dos fases: los primeros millon de pasos con contexto de 512 y un 64 % de datos metagenomicos, y los ultimos 500.000 pasos con contexto de 2048 y el porcentaje metagenomico reducido al 37,5 %. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo de este tipo. La model card menciona soporte opcional de `transformer_engine` y `xformers` para acelerar la atencion.

## Capacidades

- Modelado de lenguaje enmascarado sobre secuencias de proteinas: predice el residuo enmascarado a partir del contexto.
- Extraccion de embeddings por residuo y por secuencia, con acceso a los estados ocultos de todas las capas mediante `output_hidden_states=True`.
- Transfer learning: sirve como backbone congelado o fine-tuneado para tareas downstream (prediccion de estructura, function annotation, estabilidad, etc.).
- Prediccion de efectos de variantes (variant effect prediction), segun las etiquetas de la model card.
- Ingenieria de proteinas: guia el diseno y optimizacion de secuencias.
- No es un modelo de chat ni de instrucciones: no soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de texto.
- No tiene vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue: no aplica; el dominio son secuencias de aminoacidos.

## Casos de uso

- Prediccion de efectos de variantes en genomica clinica: dado un cambio de aminoacido, se calcula la log-verosimilitud de la secuencia mutada frente a la wild-type con el modelo; la diferencia actua como score de patogenicidad, y el tamano de 300M permite procesar paneles completos en una sola GPU.
- Anotacion funcional de proteinas desconocidas: se extraen embeddings medios por secuencia y se entrenan clasificadores ligeros (regresion logistica, MLP) para familias enzimaticas o localizacion subcelular, aprovechando que el backbone ya esta preentrenado sobre miles de millones de secuencias.
- Ingenieria de proteinas terapeuticas: se usa el modelo como filtro de plausibilidad evolutiva en bucles de diseno (por ejemplo, enmascarar posiciones y muestrear sustituciones) para descartar candidatos con baja probabilidad antes de sintetizarlos.
- Busqueda y agrupamiento de secuencias: los embeddings de 300M sirven para indexar y agrupar metagenomas o bases de datos propias mediante similitud coseno, con un coste de inferencia muy inferior al del modelo de 6B.
- Fine-tuning local en laboratorio: al tener 333M de parametros, cabe en una GPU de consumo y permite ajustar el modelo a tareas especificas (estabilidad termica, solubilidad) sin acceso a la API de Biohub.
- Preprocesado para prediccion de estructura: los estados ocultos de ESMC alimentan cabezales de prediccion de estructura o de contacto, como hace ESMFold2 con el backbone de 6B congelado, pero en entornos con menos VRAM.
- Interpretabilidad de representaciones: combinado con los SAE publicados por Biohub (para el modelo de 6B), permite analizar que caracteristicas biologicas captura cada capa, aunque los SAE disponibles no corresponden a esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint de bioRxiv para las metricas de rendimiento, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (333M x 4 bytes), mas activaciones y cache de atencion.
- En fp16/bf16: aproximadamente 0,7 GB de pesos; holgado en cualquier GPU con 4 GB o mas.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia; A100/H100 solo necesarias para lotes grandes o fine-tuning del modelo de 6B.
- Cabe en GPU de consumo sin problema, incluida una RTX 3050 de 8 GB con margen amplio.
- Opciones de despliegue: `transformers` (referencia oficial), con soporte opcional de `transformer_engine` y `xformers` para la atencion; tambien es compatible con endpoints de Hugging Face (`endpoints_compatible` en las etiquetas).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ESMC-300M | 333M | 2048 | MIT | Hugging Face (biohub) |
| ESMC-600M | 600M | 2048 | MIT | Hugging Face (biohub) |
| ESMC-6B | 6B | 2048 | MIT | Hugging Face (biohub) |

La informacion disponible solo permite comparar con las otras variantes de la propia familia ESMC. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores (por ejemplo, otros pLM de la familia ESM o alternativas de terceros) en el material proporcionado, por lo que la comparativa con modelos externos queda como no disponible.

## Limitaciones y advertencias

- Sesgos: el modelo aprende de bases de datos biologicas (UniRef, MGnify, JGI) con sesgos de muestreo taxonomico; las proteinas de organismos poco representados pueden tener representaciones de menor calidad.
- Riesgo de alucinacion: como modelo generativo de secuencias, puede asignar alta probabilidad a secuencias plausibles pero no funcionales; las predicciones deben validarse experimentalmente.
- Contexto limitado a 2048 residuos: proteinas largas requieren truncado o segmentacion, lo que puede degradar las representaciones.
- Idioma: la etiqueta `en` de la model card es enganosa; el modelo no procesa lenguaje natural, solo secuencias de aminoacidos con el alfabeto del tokenizador ESM.
- Licencia: MIT, pero la model card enlaza un THIRD_PARTY_NOTICE con condiciones adicionales que conviene revisar antes de un uso comercial.
- No es un modelo de instrucciones ni de chat: no debe usarse como asistente conversacional ni para tareas de texto general.
- Los SAE de interpretabilidad publicados por Biohub estan construidos sobre el modelo de 6B, no sobre esta variante de 300M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biohub/ESMC-300M
- Variante 600M: https://huggingface.co/biohub/ESMC-600M
- Variante 6B: https://huggingface.co/biohub/ESMC-6B
- ESMFold2: https://huggingface.co/biohub/ESMFold2
- SAE de ESMC-6B: https://huggingface.co/biohub/ESMC-6B-sae-layer60-k64-codebook16384
- Vision general de SAE de ESMC: https://huggingface.co/biohub/ESMC-SAE-Overview
- Preprint (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- Aviso de terceros (licencia): https://github.com/Biohub/esm/blob/main/THIRD_PARTY_NOTICE.md
- Plataforma Biohub: https://biohub.ai/
- Pagina del modelo en Biohub: https://www.biohub.ai/models/esmc
- Documentacion de Biohub: https://docs.biohub.ai/models/esmc
