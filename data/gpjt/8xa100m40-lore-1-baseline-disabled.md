# gpjt/8xa100m40-lore-1-baseline-disabled

# gpjt/8xa100m40-lore-1-baseline-disabled

## Resumen

Se trata de un modelo de lenguaje causal entrenado desde cero por Giles Thomas (usuario `gpjt` en HuggingFace), basado en la arquitectura estilo GPT-2 que Sebastian Raschka emplea en su libro "Build a Large Language Model (from Scratch)". El modelo forma parte de una familia de experimentos sobre LoRE (Low Rank Embeddings), una tecnica propuesta por el usuario `AndrewThompson1233` que consiste en representar las matrices de vocabulario (embeddings de tokens y cabeza de salida) mediante matrices de bajo rango. En esta variante concreta, el sufijo `baseline-disabled` indica que LoRE esta desactivado tanto en los embeddings como en la cabeza de salida, por lo que actua como linea base de control frente a las variantes que si lo activan.

El modelo tiene 163.009.536 parametros segun la model card (175.592.448 segun el recuento de safetensors del repositorio, una discrepancia no explicada), 12 capas, dimension de embedding de 768, 12 cabezas de atencion multi-cabeza y una longitud de contexto de 1.024 tokens. Fue entrenado con aproximadamente 3.260 millones de tokens, en concreto 20 veces el numero de parametros de la version sin LoRE (el punto optimo de Chinchilla segun el autor), sobre el dataset `gpjt/fineweb-gpt2-tokens` y en una maquina de 8 GPU A100 de 40 GiB.

Su relevancia es fundamentalmente metodologica: no compite con modelos de produccion, sino que sirve como referencia reproducible para investigar si las matrices de vocabulario de bajo rango reducen parametros sin degradar la calidad, y como punto de partida para quien quiera experimentar con un LLM de tamano 2020 en hardware modesto. La licencia Apache 2.0 permite reutilizarlo y modificarlo sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (solo decodificador, atencion multi-cabeza, LayerNorm pre-normalizacion) |
| Parametros totales | 163.009.536 segun la model card; 175.592.448 segun el recuento de safetensors del repositorio (discrepancia no aclarada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible oficialmente; al distribuirse en safetensors es tecnicamente convertible a int8/4-bit, pero no hay pesos cuantizados publicados |
| Idiomas soportados | no disponible en la model card; el dataset de entrenamiento (FineWeb) es predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,7 GB) |
| Dimension de embedding | 768 |
| Capas | 12 |
| Cabezas de atencion (MHA) | 12 |
| Sesgo en QKV | no (False) |
| Weight tying | no (False): embeddings y cabeza de salida son matrices independientes |
| Rango LoRE | 128 (con LoRE desactivado en este modelo) |
| Tokenizador | no disponible en la model card; `AutoTokenizer` esta soportado |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2 implementado desde cero, con 12 capas, dimension de modelo 768, 12 cabezas de atencion y sin sesgo en las proyecciones de query, key y value. No emplea weight tying entre la matriz de embeddings de tokens y la cabeza de proyeccion al vocabulario, detalle relevante porque precisamente esas dos matrices son las que el autor sustituye opcionalmente por factorizaciones de bajo rango en las variantes LoRE. En este checkpoint ambos mecanismos estan desactivados (LoRE en embeddings: False; LoRE en cabeza de salida: False; rango LoRE: 128; inicializacion inteligente: False), de modo que el modelo es funcionalmente un GPT-2 pequeno convencional. El codigo es personalizado, de ahi la etiqueta `custom_code` y la obligacion de activar `trust_remote_code` al cargarlo.

El entrenamiento se realizo en 8 GPU A100 de 40 GiB sobre el dataset `gpjt/fineweb-gpt2-tokens`, con 3.260.252.160 tokens procesados (el objetivo era 3.260.190.720, exactamente 20 veces el numero de parametros del modelo sin LoRE, redondeado al alza hasta completar el ultimo lote). Se uso un micro-lote de 12 y un lote global de 96, dropout 0,0, recorte de gradiente de 3,5, tasa de aprendizaje de 0,0014 con planificador, y weight decay de 0,01. No hay constancia en la informacion disponible de fases de RLHF, DPO o ajuste por instrucciones: es un modelo base puro, entrenado unicamente con el objetivo de modelado de lenguaje causal.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, con el estilo y los parametros de muestreo tipicos de un GPT-2 (`temperature`, `top_k`, `do_sample`).
- Modelado de lenguaje causal: util como base para perplexity, experimentos de tokenizacion y estudios de escalado.
- Es un modelo base, sin ajuste por instrucciones: no sigue ordenes ni mantiene formatos de dialogo de forma fiable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el sesgo del dataset apunta a ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste fino: la model card enlaza un cuaderno de ejemplo, por lo que se puede reentrenar sobre dominios concretos.
- Compatibilidad con la API de transformers mediante `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`.

## Casos de uso

- Linea base de control en investigacion sobre LoRE: este checkpoint es, por definicion, el modelo de referencia contra el que se comparan las variantes con LoRE activado en embeddings y/o cabeza de salida, midiendo perplexity y rendimiento con el mismo presupuesto de tokens.
- Reproduccion de experimentos de escalado tipo Chinchilla: al haberse entrenado con un multiplo controlado de parametros, sirve para estudiar la relacion entre tokens, parametros y perdida en un regimen pequeno y asequible.
- Ajuste fino para dominios muy acotados: con 163M parametros se puede reentrenar por completo en una sola GPU para generar texto de un nicho concreto (descripciones de productos, plantillas, logs sinteticos) partiendo del ejemplo de fine-tuning publicado por el autor.
- Generacion de datos sinteticos de bajo coste para pruebas: utiles para poblar entornos de staging, probar pipelines de ingesta de texto o validar formateadores sin gastar cuota de API.
- Test de infraestructura de entrenamiento distribuido: el script de entrenamiento original usa DDP sobre 8 GPU, por lo que el modelo es un banco de pruebas economico para validar configuraciones de paralelismo y checkpoints.
- Educacion y docencia: permite recorrer de extremo a extremo el ciclo completo (tokenizacion, preentrenamiento, evaluacion, inferencia) con un modelo que cabe en cualquier portatil y cuyo coste de entrenamiento es reproducible.
- Experimentos de tokenizacion y vocabulario: al no usar weight tying, es un banco de pruebas natural para medir el efecto de cambiar la matriz de embeddings o de vocabulario sin tocar el resto del modelo.
- Inferencia en dispositivos muy limitados: sirve para validar despliegues on-device o en CPU (por ejemplo, en un servidor sin GPU) donde no cabe ningun modelo moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y el propio autor advierte de que el modelo "no sabe muchos hechos y no es terriblemente inteligente", sin aportar numeros que lo cuantifiquen.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,65-0,70 GB en fp32, 0,33-0,35 GB en fp16/bf16 y 0,17-0,18 GB en int8, tomando como referencia 163-176 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos e incluso en CPU o en placas tipo Raspberry Pi a velocidades de decodificacion muy bajas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada y documentada. vLLM, TGI, llama.cpp y Ollama no soportan de serie esta arquitectura personalizada; requeririan un portado o la conversion del codigo a una arquitectura soportada, y no hay GGUF publicado.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion.
- Nota sobre el entrenamiento: el modelo se entreno en 8 GPU A100 de 40 GiB, pero ese requisito corresponde al entrenamiento original, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| gpjt/8xa100m40-lore-1-baseline-disabled | 163M (card) / 175,6M (safetensors) | 1.024 | Apache 2.0 | HuggingFace, requiere `trust_remote_code` | No disponible |
| GPT-2 (124M) | 124M | 1.024 | Licencia MIT modificada | HuggingFace, weights originales | No comparable en esta ficha |
| GPT-2 (355M) | 355M | 1.024 | Licencia MIT modificada | HuggingFace, weights originales | No comparable en esta ficha |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | HuggingFace | No comparable en esta ficha |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | HuggingFace | No comparable en esta ficha |

Las caracteristicas de los modelos alternativos proceden de conocimiento general sobre ellos y no de la informacion proporcionada en esta busqueda; no se incluyen cifras de rendimiento porque no hay datos verificados en el material disponible. En terminos de posicionamiento, la unica ventaja diferencial de este checkpoint frente a GPT-2 o Pythia es que existe una familia de variantes LoRE entrenadas con el mismo pipeline y el mismo dataset, lo que permite comparaciones controladas.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el autor describe explicitamente el modelo como "tonto e ignorante", con 163M parametros y unos 3.260 millones de tokens de entrenamiento, muy por debajo de lo necesario para retener hechos.
- Riesgo alto de alucinacion: al no estar ajustado por instrucciones ni alineado, generara continuaciones plausibles sin ninguna verificacion factual.
- No es un modelo de chat: no hay RLHF, DPO ni ajuste instruct, por lo que no debe usarse como asistente conversacional.
- Ventana de contexto corta: 1.024 tokens, insuficiente para documentos largos, historiales de conversacion extensos o analisis de repositorios de codigo.
- Cobertura idiomatica no declarada: la model card no especifica idiomas y el dataset de origen tiene mayoria de contenido en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre y no esta medido.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar ese codigo antes de usarlo en un entorno de produccion o con acceso a secretos.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, sin validacion de la comunidad ni informes independientes de calidad.
- Ausencia de benchmarks: no hay ninguna metrica publicada, de modo que cualquier evaluacion comparativa exige medirlo uno mismo.
- Composicion del dataset no documentada: no se detalla la mezcla de fuentes, los filtros aplicados ni las posibles contaminaciones, lo que dificulta evaluar sesgos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de las obligaciones de atribucion ni de las limitaciones tecnicas descritas arriba.
- Discrepancia de parametros: la model card indica 163.009.536 parametros y el recuento de safetensors 175.592.448; conviene verificar la composicion real antes de hacer calculos de coste o comparativas.
- Fechas de creacion y actualizacion del repositorio (3 de octubre de 2026) y enlace a un blog marcado como "coming soon" no verificable en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-1-baseline-disabled
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Repositorio del codigo: https://github.com/gpjt/ddp-base-model-from-scratch
- Cuaderno de ajuste fino: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Entrada de blog sobre matrices de vocabulario de bajo rango (marcada como proxima publicacion): https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices
- Articulo relacionado del autor sobre LLM from scratch y evaluacion: https://www.gilesthomas.com/2026/01/llm-from-scratch-30-digging-into-llm-as-a-judge
- Discusion donde se propuso la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Perfil del autor: https://huggingface.co/gpjt
- Perfil de Sebastian Raschka, autor del codigo base: https://huggingface.co/rasbt
- Libro "Build a Large Language Model (from Scratch)": https://www.manning.com/books/build-a-large-language-model-from-scratch
- Web de Sebastian Raschka: https://sebastianraschka.com/
- Modelos con licencia Apache 2.0 en HuggingFace: https://huggingface.co/models?license=license:apache-2.0&sort=downloads
