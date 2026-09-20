# lucid-dl/vjepa2-vitg-384

# V-JEPA 2 ViT-g/16 384 px (lucid-dl/vjepa2-vitg-384)

## Resumen

V-JEPA 2 ViT-g/16 (384 px) es un codificador de video de tipo Vision Transformer gigante (ViT-g, parches de 16x16) perteneciente a la familia V-JEPA 2 desarrollada por Meta AI. El modelo original fue publicado por Meta bajo el identificador `facebook/vjepa2-vitg-fpc64-384`, y la ficha que nos ocupa es un port realizado por el usuario `lucid-dl` a la libreria Lucid, convertido a safetensors nativos de esa libreria. Se trata, por tanto, de una redistribucion de pesos con paridad numerica verificada, no de un entrenamiento nuevo.

El problema que resuelve es la representacion auto-supervisada de video: a diferencia de los clasificadores de video clasicos, V-JEPA 2 aprende representaciones latentes mediante prediccion en el espacio de embeddings (arquitectura JEPA, Joint-Embedding Predictive Architecture) en lugar de reconstruir pixeles. Esto lo convierte en una base versatil para clasificacion de video, recuperacion, deteccion de acciones y, en combinacion con otros componentes de la familia, para planificacion robotica.

La relevancia actual del checkpoint radica en dos factores. Primero, su tamano (1034,6 millones de parametros) y su ventana de 64 fotogramas por clip a 384 px lo situan en la gama alta de codificadores de video abiertos. Segundo, la licencia Apache 2.0 permite uso comercial sin las restricciones tipicas de otros modelos de video de gran escala. El repositorio ocupa 8,2 GB y el pipeline declarado es `video-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer gigante (ViT-g/16) con objetivo de prediccion en espacio latente (JEPA); backbone de la familia V-JEPA 2 |
| Parametros totales | 1034,6 millones (tag FPC64_384) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en terminos de tokens; ventana temporal de 64 fotogramas por clip (tag FPC64_384), resolucion espacial de 384 px |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors nativos de Lucid; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (modelo de vision/video; no procesa texto) |
| Licencia | Apache 2.0 (heredada de los pesos originales de Meta) |
| Formato de pesos | safetensors (formato nativo de Lucid, convertido desde `facebook/vjepa2-vitg-fpc64-384/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ViT gigante con parches de 16x16 que procesa secuencias de video y aplica el paradigma JEPA: en lugar de reconstruir fotogramas, el objetivo de preentrenamiento consiste en predecir la representacion latente de regiones enmascaradas del video a partir del contexto visible. Este enfoque, descrito en el paper V-JEPA 2 (arXiv:2506.09985), evita el coste computacional de decodificar pixeles y empuja al modelo a capturar estructura semantica y dinamica temporal. El checkpoint concreto corresponde a la variante de 64 fotogramas por clip a 384 px, la mas grande de la familia de codificadores publicada en el repositorio original.

La model card de esta redistribucion no aporta detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables, al ser un codificador auto-supervisado). Las etiquetas del repositorio listan Kinetics-700, Something-Something-V2 y Diving-48 como datasets asociados, que corresponden a los conjuntos de evaluacion habituales de la familia V-JEPA 2. La innovacion tecnica destacable es el propio objetivo predictivo latente, que permite entrenar con video no etiquetado a gran escala. La unica particularidad de esta ficha es la conversion: el autor indica que el mapeo de claves y la paridad numerica fueron verificados contra el checkpoint de origen mediante `tools.convert_weights`.

## Capacidades

- Extraccion de representaciones de video: genera embeddings espacio-temporales a partir de un tensor decodificado (B, T, C, H, W).
- Clasificacion de video y reconocimiento de acciones, que es el pipeline declarado en HuggingFace.
- Prediccion en espacio latente: capacidad nativa de anticipar representaciones de partes enmascaradas del video.
- Modelado de dinamica temporal con ventanas de 64 fotogramas por clip.
- Preprocesado integrado: la clase de pesos `VJEPA2ViTGiant384Weights` expone `weights.transforms()`, de modo que las transformaciones viajan junto a los pesos.
- Uso como backbone congelado para tareas posteriores (transferencia a clasificacion, recuperacion o deteccion temporal).
- No dispone de tool calling, function calling, agentes, generacion de texto, codigo ni matematicas: es exclusivamente un modelo de vision.
- Capacidades multilingues: no aplica, el modelo no procesa lenguaje.
- Modo de razonamiento explicito (thinking) o audio: no disponible.

## Casos de uso

- Clasificacion automatica de contenido audiovisual: el modelo etiqueta clips de hasta 64 fotogramas a 384 px, adecuado para catalogar bibliotecas de video en plataformas de streaming o archivos corporativos.
- Moderacion de video a escala: extraer embeddings y aplicar un clasificador ligero encima permite filtrar contenido no deseado sin reentrenar el backbone.
- Analisis deportivo: con un conjunto de evaluacion como Diving-48 en la familia, el modelo es apropiado para reconocer acciones deportivas concretas (saltos, lanzamientos, gestos tecnicos) en grabaciones de alta resolucion.
- Vigilancia y seguridad industrial: deteccion de comportamientos anomalos en camaras fijas (caidas, intrusiones, manipulacion incorrecta de maquinaria) mediante clasificacion por ventanas temporales solapadas.
- Recuperacion de video por similitud: los embeddings generados permiten construir indices vectoriales y buscar por contenido ("encontrar todos los clips con una persona subiendo escaleras").
- Investigacion en representaciones auto-supervisadas: servir de baseline congelado para comparar objetivos de preentrenamiento o para estudiar transferencia a tareas downstream.
- Interfaz de percepcion para robotica: aunque la planificacion de la familia V-JEPA 2-AC corresponde a otro checkpoint de mayor tamano, este codificador puede emplearse como extractor de estado visual en pipelines de control.
- Preentrenamiento de clasificadores ligeros con pocos datos: al ser un backbone congelado, basta entrenar una cabeza lineal sobre los embeddings para nuevas taxonomias de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta redistribucion no incluye tabla de metricas (MMLU, HumanEval, GSM8K no aplican a un modelo de vision; no se aportan valores de top-1 en Kinetics-700, Something-Something-V2 ni Diving-48). El campo GFLOPs del unico tag disponible aparece explicitamente como no informado ("—").

## Requisitos de hardware

- Parametros: 1034,6 millones. Peso de los safetensors distribuidos: 7807,77 MB; tamano total del repo: 8,2 GB.
- VRAM estimada para inferencia: aproximadamente 4,2 GB solo para pesos en fp32 y alrededor de 2,1 GB en bf16/fp16, a lo que hay que sumar la memoria de activaciones (estimacion propia, no confirmada por el autor).
- Nota critica sobre activaciones: procesar 64 fotogramas a 384 px genera un numero elevado de tokens espacio-temporales por clip, por lo que el pico de memoria puede superar ampliamente el tamano de los pesos. La memoria real dependera del tamano de lote y del mecanismo de atencion empleado.
- GPU recomendadas: no disponible. Como referencia de gama, un codificador ViT-g con ventanas de 64 fotogramas requiere GPUs de datacenter (A100 40/80 GB, H100) para lotes grandes; una RTX 4090 (24 GB) puede ser suficiente para inferencia en bf16 con lote pequeno o ventanas temporales reducidas.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090, RTX 3090 (24 GB) y similares con cuantizacion o lotes de tamano 1, pero no hay confirmacion oficial.
- Opciones de despliegue: la libreria soportada es Lucid (`import lucid`, `lucid.models.vjepa2_vit_giant_384`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no cubren este caso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| lucid-dl/vjepa2-vitg-384 (esta ficha) | 1034,6 M | 64 fotogramas / 384 px | Apache 2.0 | Peso safetensors en Lucid, 8,2 GB |
| facebook/vjepa2-vitg-fpc64-384 | No disponible en la informacion proporcionada (origen del port) | 64 fotogramas / 384 px | Apache 2.0 | Checkpoint original en HuggingFace; conversion a Lucid verificada |
| Variantes ViT-L de la familia V-JEPA 2 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Otros codificadores de video auto-supervisados (VideoMAE V2, InternVideo2, VideoPrism) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

La comparativa con alternativas no puede completarse con datos numericos porque la informacion proporcionada no incluye especificaciones de terceros. La diferencia verificable entre las dos primeras filas es de empaquetado: mismo modelo, distinto formato de pesos y distinta libreria de ejecucion.

## Limitaciones y advertencias

- No es un modelo generativo de texto ni de imagen: solo produce representaciones o logits sobre video. Cualquier expectativa de chat, codigo o razonamiento verbal es inaplicable.
- La model card no documenta sesgos. Al entrenarse sobre video de internet, es previsible que herede sesgos demograficos y culturales del corpus original, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo analogo es la clasificacion erronea de acciones visualmente ambiguas o fuera de la distribucion de entrenamiento.
- Limitacion de dominio: los conjuntos asociados (Kinetics-700, Something-Something-V2, Diving-48) son de acciones humanas; el rendimiento en otros dominios (medicina, satelite, microscopia) no esta documentado.
- Limitacion de contexto temporal: la ventana de 64 fotogramas impone un limite a la hora de modelar eventos de larga duracion; habra que trocear el video y agregar predicciones.
- Entrada esperada: el modelo consume un tensor ya decodificado con forma (B, T, C, H, W); la decodificacion de video corre por cuenta del usuario, con el coste de CPU/IO que implica.
- Licencia: Apache 2.0, heredada de los pesos originales, lo que permite uso comercial. No obstante, conviene verificar la cadena de atribucion al usar derivados, ya que este repositorio es una conversion no oficial de Meta.
- Caveat de produccion: el repositorio registra 0 descargas y 0 likes, sin historial de uso; es una redistribucion reciente y no validada por la comunidad.
- Requisito de libreria: depende de la libreria Lucid, menos extendida que PyTorch o transformers, lo que puede complicar la integracion en stacks existentes.
- Ausencia de variantes cuantizadas publicadas, lo que obliga a cuantizar por cuenta propia si se busca reducir huella de memoria.

## Enlaces

- HuggingFace (esta ficha): https://huggingface.co/lucid-dl/vjepa2-vitg-384
- Modelo original de Meta: https://huggingface.co/facebook/vjepa2-vitg-fpc64-384
- Paper V-JEPA 2 (Assran et al., 2025): https://arxiv.org/abs/2506.09985
- Repositorio de la libreria Lucid: https://github.com/ChanLumerico/lucid
- Fuente de los pesos convertidos: `facebook/vjepa2-vitg-fpc64-384/model.safetensors`
