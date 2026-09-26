# aymanbm2000/ag-news-distilbert-lora-r4

## Resumen

ag-news-distilbert-lora-r4 es un adaptador LoRA entrenado sobre distilbert-base-uncased para clasificación de noticias en cuatro categorías (World, Sports, Business, Sci/Tech) del dataset AG News. Lo publica el usuario aymanbm2000 como parte de un estudio comparativo sobre el compromiso entre rango de LoRA (r=4, 8, 16 y 32) y coste de entrenamiento en tareas de clasificación de texto corto. Es, por tanto, el adaptador más ligero de esa barrida: r=4, alpha=8, dropout=0.1, aplicado únicamente a las proyecciones de query y value (q_lin, v_lin) de las seis capas de atención.

El modelo base DistilBERT aporta 67 millones de parámetros congelados y una arquitectura transformer encoder-only de 6 capas, dimensión oculta 768 y un límite posicional de 512 tokens. Sobre esa base, el adaptador LoRA más la cabeza de clasificación de 4 clases son los únicos parámetros entrenables, lo que reduce drásticamente el espacio de almacenamiento y el coste de ajuste frente a un fine-tuning completo.

Su relevancia es fundamentalmente práctica y metodológica: sirve como punto de referencia reproducible para quien necesite un clasificador de tópicos en inglés con requisitos mínimos de cómputo, y como evidencia de que un rango LoRA muy bajo ya recupera la mayor parte de la ganancia de un fine-tuning completo (0,9264 frente a 0,9333 de exactitud). El repositorio no tiene descargas ni likes registrados y las métricas declaradas no están verificadas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, hidden 768) con adaptador LoRA sobre q_lin y v_lin y cabeza de clasificacion de 4 clases |
| Parametros totales | ~67 M del modelo base congelado + adaptador LoRA y cabeza de clasificacion (el autor no publica el recuento exacto de parametros entrenables) |
| Parametros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite posicional de DistilBERT); el entrenamiento y la evaluacion usaron max_length=128 |
| Tipos de cuantizacion | No disponible: no se publican pesos cuantizados. Al ser un modelo encoder-only pequeno, es viable aplicar cuantizacion dinamica INT8 de PyTorch o exportar a ONNX/ONNX Runtime sobre el modelo fusionado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar aparte el modelo base distilbert-base-uncased |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder-only destilado de BERT, con 6 capas, 12 cabezas de atencion, dimension oculta 768 y 67 millones de parametros. Sobre el se anade un adaptador LoRA de rango 4, alpha 8 y dropout 0.1, aplicado exclusivamente a las proyecciones q_lin y v_lin de cada capa de atencion. Con esos hiperparametros y los seis bloques del encoder, el adaptador resultante es notablemente pequeno (del orden de decenas de miles de parametros, calculo derivado de la configuracion declarada, no un dato publicado por el autor), y se suma a una cabeza de clasificacion de 4 etiquetas inicializada de cero.

El entrenamiento uso aproximadamente 50.000 filas muestreadas del split de entrenamiento de AG News durante 3 epocas, con optimizador y scheduler por defecto del Trainer de HuggingFace, learning rate 2e-4 (mas alto que el 2e-5 tipico del fine-tuning completo, siguiendo la practica habitual con LoRA), batch de 32 en entrenamiento y 64 en evaluacion, y max_length de 128 tokens. La seleccion del mejor checkpoint se hizo por macro F1 sobre un 10 % de los datos de entrenamiento reservado como validacion, con seguimiento en Weights & Biases. No se documenta el uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion de texto corto en ingles en cuatro categorias cerradas: World, Sports, Business y Sci/Tech.
- Salida de logits por clase, lo que permite obtener distribuciones de probabilidad mediante softmax y aplicar umbrales o heuristicas posteriores.
- Inferencia sobre lotes (la configuracion de evaluacion emplea batch de 64) y sobre secuencias de hasta 128 tokens con truncacion; el modelo base admite hasta 512 posiciones.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni uso como agente; cada llamada produce una unica etiqueta.
- Capacidad multilingue nula: el autor restringe explicitamente el uso a ingles.
- No dispone de modo thinking, vision ni audio.
- Al ser un adaptador PEFT, se puede combinar, sustituir o apilar con otros adaptadores sobre la misma base siempre que se gestionen las cabezas de clasificacion.

## Casos de uso

- Enrutado de noticias en un agregador o lector RSS: el modelo asigna cada titular o entradilla a una de las cuatro secciones clasicas, con un coste de inferencia minimo que permite procesar flujos de miles de articulos por hora en CPU.
- Moderacion y organizacion de contenido en foros o boletines: clasificar envios de texto corto en categorias tematicas para etiquetado automatico previo a la revision humana.
- Filtrado tematico previo a un pipeline de analisis financiero: las piezas clasificadas como Business se derivan a un modulo de extraccion de entidades y sentimiento, reduciendo el volumen que llega a modelos mas caros.
- Generacion de datasets etiquetados a bajo coste: usar el modelo como anotador debil sobre grandes volumenes de texto no etiquetado y reservar la revision humana para los casos de baja confianza (por ejemplo, probabilidad maxima inferior a 0,6).
- Linea base reproducible en investigacion: sirve como punto de comparacion para experimentos de eficiencia de PEFT, ya que el autor publica la barrida completa de rangos con las mismas condiciones de entrenamiento.
- Clasificacion en el borde (edge) o en entornos sin GPU: con menos de 300 MB en FP32 y tiempos de decodificacion de milisegundos, cabe en dispositivos modestos, contenedores ligeros o funciones serverless.
- Deteccion de deriva tematica en un feed editorial: monitorizar la distribucion de etiquetas por franja temporal para detectar cambios en la composicion de las noticias que entran al sistema.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test estandar de AG News (7.600 ejemplos). El campo `verified` de la model-index esta marcado como falso, por lo que no hay verificacion independiente.

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,9264 |
| Macro F1 | 0,9264 |
| Errores | 559 / 7.600 (7,4 %) |

Comparativa publicada por el autor entre rangos de LoRA, la linea base clasica y el fine-tuning completo, sobre el mismo split de test:

| Modelo | Exactitud en test | Macro F1 en test |
|---|---|---|
| Baseline (TF-IDF + regresion logistica) | no disponible | 0,9107 |
| LoRA r=4, alpha=8 (este modelo) | 0,9264 | 0,9264 |
| LoRA r=8, alpha=16 | 0,9272 | 0,9272 |
| LoRA r=16, alpha=32 | 0,9293 | 0,9293 |
| LoRA r=32, alpha=64 | 0,9309 | 0,9309 |
| Fine-tuning completo de DistilBERT | 0,9333 | 0,9333 |

## Requisitos de hardware

- VRAM en FP32: aproximadamente 0,27-0,3 GB para los pesos del modelo base (67 M de parametros) mas el adaptador, sin contar activaciones. Con batch de 64 y max_length 128, la huella total se mantiene muy por debajo de 2 GB.
- VRAM en FP16/BF16: aproximadamente 0,15 GB de pesos; en INT8 dinamico, alrededor de 0,07 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no necesita A100 ni H100. Tarjetas de gama baja como T4, GTX 1650, RTX 3050 o incluso iGPU recientes pueden servirlo con holgura.
- Cabe sin problema en GPU de consumo: cualquier RTX 20xx, 30xx o 40xx, e incluso en GPU integradas con 4 GB de memoria compartida.
- Inferencia en CPU: totalmente viable. DistilBERT procesa del orden de centenares a miles de secuencias cortas por segundo en CPU multinucleo, aunque el autor no publica cifras de latencia ni de throughput (no disponibles).
- Opciones de despliegue: transformers + PEFT (la ruta documentada en la model card), fusion del adaptador con `merge_and_unload` y exportacion a ONNX u ONNX Runtime, TorchScript, o servidores de inferencia genericos como FastAPI, TorchServe o Ray Serve.
- vLLM, llama.cpp, Ollama y TGI no son opciones adecuadas para este modelo: son stacks orientados a generacion autoregresiva y no cubren la cabeza de clasificacion de un encoder-only.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las variantes del mismo estudio y con la linea base clasica, ya que el autor no proporciona referencias externas. En la categoria de clasificadores de texto corto en ingles, estas son las alternativas documentadas:

| Alternativa | Parametros / enfoque | Contexto | Exactitud AG News | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-base-uncased completo con fine-tuning | 67 M, todos entrenables | 512 tokens | 0,9333 | Apache 2.0 (base) | HuggingFace, pesos completos |
| LoRA r=32, alpha=64 (mismo estudio) | 67 M congelados + adaptador mayor | 512 tokens | 0,9309 | Apache 2.0 | HuggingFace |
| LoRA r=16, alpha=32 (mismo estudio) | 67 M congelados + adaptador intermedio | 512 tokens | 0,9293 | Apache 2.0 | HuggingFace |
| Este modelo (LoRA r=4, alpha=8) | 67 M congelados + adaptador minimo | 512 tokens | 0,9264 | Apache 2.0 | HuggingFace |
| TF-IDF + regresion logistica | No neuronal | no aplicable | Macro F1 0,9107 | no disponible | Codigo propio |
| Otros clasificadores de texto en ingles | no disponible | no disponible | no disponible | no disponible | no disponible |

La lectura de la tabla es que la perdida por usar el rango minimo es de 0,0069 puntos de exactitud frente al fine-tuning completo, a cambio del adaptador mas pequeno de la barrida.

## Limitaciones y advertencias

- Dominio restringido: entrenado y evaluado exclusivamente sobre AG News. El propio autor advierte que el rendimiento en otros conjuntos de clasificacion de noticias o en dominios distintos esta sin probar.
- Idioma unico: solo ingles. El tokenizador de distilbert-base-uncased no esta entrenado para otras lenguas y el modelo no esta destinado a ellas.
- Granularidad fija: solo cuatro categorias (World, Sports, Business, Sci/Tech). No sirve para clasificacion de subtemas ni para taxonomias mas finas.
- Riesgo de alucinacion no aplicable en sentido generativo (no produce texto libre), pero si existe riesgo de clasificacion erronea sobre entradas ambiguas, sarcasticas o fuera de distribucion; la tasa de error declarada es del 7,4 % sobre el test de AG News.
- Sesgos: al derivar de DistilBERT, puede heredar los sesgos presentes en los datos de preentrenamiento del modelo base, tal como reconoce el autor. No se ha realizado ninguna auditoria de sesgo especifica.
- Tamano de secuencia: aunque el modelo base admite 512 posiciones, el entrenamiento se hizo con max_length 128, por lo que el comportamiento mas alla de esa longitud es extrapolacion no validada.
- Metricas no verificadas: los valores de la model-index estan marcados como `verified: false`; no hay evaluacion independiente.
- Capacidad reducida: es el adaptador de menor rango de la barrida; si la exactitud es prioritaria frente al tamano, el autor recomienda explicitamente considerar r=16 o r=32.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar el aviso de licencia y tener en cuenta que el modelo base distilbert-base-uncased se distribuye tambien bajo Apache 2.0.
- Repositorio sin traccion: cero descargas, cero likes y un tamano de repo de 0,0 GB reportado, lo que sugiere que los pesos pueden estar en un volumen minimo o que el artefacto es extremadamente pequeno; conviene verificar los ficheros antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aymanbm2000/ag-news-distilbert-lora-r4
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset AG News: https://huggingface.co/datasets/ag_news
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio del proyecto del autor (enlace en la model card, marcado como placeholder): https://github.com/aymanbm2000/project3
- Seguimiento de experimentos: https://wandb.ai
