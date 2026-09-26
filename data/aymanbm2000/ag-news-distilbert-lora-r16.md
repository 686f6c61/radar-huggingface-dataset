# aymanbm2000/ag-news-distilbert-lora-r16

## Resumen

El modelo `aymanbm2000/ag-news-distilbert-lora-r16` es un adaptador LoRA (Low-Rank Adaptation) sobre `distilbert-base-uncased`, entrenado por el usuario aymanbm2000 para clasificacion de texto en cuatro categorias de tematica periodistica: World, Sports, Business y Sci/Tech. Se trata de un clasificador de textos cortos en ingles, no de un modelo generativo: su salida es una de cuatro etiquetas, no texto libre. Forma parte de un barrido experimental de cuatro rangos LoRA (r=4, r=8, r=16 y r=32) con el objetivo de medir el compromiso entre rendimiento y coste computacional en una tarea de clasificacion de texto corto.

Tecnicamente, el modelo combina el encoder transformer destilado de DistilBERT (aproximadamente 67 millones de parametros, seis capas) con adaptadores de bajo rango insertados en las proyecciones de query y value de la atencion (`q_lin`, `v_lin`), mas una cabeza de clasificacion de cuatro clases. Solo se entrenan los adaptadores y la cabeza, no los pesos del backbone. Con rank=16 y alpha=32, este adaptador alcanza 0,9293 de accuracy y de macro F1 sobre el conjunto de test estandar de AG News, a unos 0,4 puntos F1 del fine-tuning completo del mismo backbone y por encima de los rangos menores y del baseline clasico TF-IDF + regresion logistica.

Su relevancia es practica mas que arquitectonica: es un ejemplo reproducible y ligero de como obtener un clasificador de cuatro clases competitivo entrenando una fraccion minima de parametros, con un coste de almacenamiento y de ajuste muy bajo. El repositorio del adaptador ocupa menos de 0,1 GB y el pipeline de inferencia requiere cargar el modelo base mas el adaptador PEFT, lo que lo hace desplegable incluso en CPU para volumenes moderados de peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) con adaptadores LoRA y cabeza de clasificacion de 4 clases |
| Parametros totales | ~67 M en el backbone `distilbert-base-uncased`; los adaptadores LoRA (r=16) y la cabeza de clasificacion anaden una fraccion minima (el autor no publica la cifra exacta, "small fraction") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el backbone DistilBERT; entrenamiento y evaluacion con `max_length=128` |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; los pesos se distribuyen como adaptador en precision completa) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El backbone es DistilBERT, un transformer encoder de seis capas obtenido por destilacion de BERT-base, con aproximadamente 67 millones de parametros y ventana de atencion completa de hasta 512 tokens. Sobre el se aplica LoRA en las proyecciones `q_lin` y `v_lin` de cada capa de atencion, con rank=16, alpha=32 y dropout=0,1, gestionado mediante la libreria PEFT. No se modifica ningun peso original del backbone ni se entrena el resto de la red: unicamente los adaptadores de bajo rango y la cabeza de clasificacion (reemplazada por una de cuatro salidas).

Los datos de entrenamiento son aproximadamente 50.000 filas muestreadas del split de entrenamiento del dataset AG News, con 3 epocas de entrenamiento, learning rate de 2e-4 (mas alto que el 2e-5 tipico del fine-tuning completo, siguiendo la practica habitual con LoRA), batch size de 32 en entrenamiento y 64 en evaluacion, y longitud maxima de secuencia de 128 tokens. La seleccion del mejor checkpoint se hace por macro F1 sobre un split de validacion retenido del 10 % del conjunto de entrenamiento, con seguimiento de experimentos en Weights & Biases. El autor no menciona RLHF, DPO ni ninguna fase de alineacion: es un ajuste supervisado estandar de clasificacion.

## Capacidades

- Clasificacion de texto corto en ingles en exactamente cuatro categorias: World, Sports, Business y Sci/Tech.
- Inferencia por lotes de secuencias de hasta 128 tokens (y hasta 512 en el backbone, aunque el modelo no fue entrenado mas alla de 128).
- Devuelve logits y probabilidades por clase mediante softmax, lo que permite usar la confianza como umbral de decision.
- Distribucion de un adaptador pequeno que se puede superponer al modelo base sin duplicar el backbone completo.
- No soporta generacion de texto, razonamiento libre, codigo, matematicas, vision ni audio.
- No hay soporte documentado de tool calling, function calling ni flujos de agente multi-paso.
- Capacidad multilingue: no; entrenado y evaluado solo en ingles.
- No dispone de modo "thinking" ni de ninguna variante de razonamiento explicito.

## Casos de uso

- Clasificacion de titulares de noticias en tiempo real: el modelo asigna un titular corto en ingles a una de las cuatro secciones con 0,9293 de accuracy, un coste por inferencia muy bajo y sin necesidad de GPU dedicada en volumenes moderados.
- Enrutado de contenido en agregadores o lectores RSS: asigna automaticamente cada item a la seccion World, Sports, Business o Sci/Tech para alimentar el layout de portada o las recomendaciones por seccion.
- Etiquetado y enriquecimiento de datasets periodisticos: preanotacion masiva de corpus de noticias antes de una revision humana, con la probabilidad por clase como criterio para marcar casos ambiguos.
- Filtrado tematico en pipelines de monitorizacion de medios: seleccionar solo las piezas de una categoria concreta (por ejemplo Business) antes de pasarlas a un analizador de sentimiento o a un resumen posterior.
- Moderacion y organizacion de foros o comentarios cortos: clasificar textos breves con tematica informativa para decidir la seccion o la cola de moderacion adecuada.
- Baseline de referencia en experimentos de eficiencia: sirve como punto de comparacion reproducible para estudiar el efecto del rango LoRA (r=4/8/16/32) frente a TF-IDF + regresion logistica y frente al fine-tuning completo, con 0,9293 de F1 como valor de referencia para r=16.
- Prototipado rapido en entornos sin GPU: al ser un adaptador sobre un backbone de 67 M de parametros, se puede levantar en CPU o en una GPU consumer para validar una idea de clasificacion de cuatro clases antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test estandar de AG News (7.600 ejemplos). No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy | 0,9293 |
| Macro F1 | 0,9293 |
| Errores | 537 / 7.600 (7,1 %) |

Comparativa interna publicada por el autor en la model card, correspondiente al mismo barrido experimental:

| Modelo | Accuracy en test | Macro F1 en test |
|---|---|---|
| Baseline (TF-IDF + regresion logistica) | no disponible | 0,9107 |
| LoRA r=4, alpha=8 | 0,9264 | 0,9264 |
| LoRA r=8, alpha=16 | 0,9272 | 0,9272 |
| LoRA r=16, alpha=32 (este modelo) | 0,9293 | 0,9293 |
| LoRA r=32, alpha=64 | 0,9309 | 0,9309 |
| Fine-tuning completo de DistilBERT | 0,9333 | 0,9333 |

El autor senala que el rango LoRA tiene un efecto positivo pequeno pero consistente en esta tarea y que, con r=16, la diferencia frente al fine-tuning completo se reduce a unos 0,4 puntos de F1.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene unos 67 M de parametros, lo que supone aproximadamente 268 MB en fp32, unos 134 MB en fp16/bf16 y unos 67 MB en int8, sin contar el adaptador (de pocos MB) ni las activaciones. Con lotes pequenos y secuencias de 128 tokens, el consumo practico es inferior a 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, L4 o incluso una iGPU moderna pueden ejecutar la inferencia. No se necesita A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y tambien en CPU con latencias aceptables para volumenes moderados.
- Opciones de despliegue: `transformers` + `peft` (el flujo documentado por el autor en la model card), exportacion a ONNX Runtime, y servidores de inferencia con soporte de adaptadores LoRA como vLLM o TGI. `llama.cpp` y `Ollama` no documentan soporte de clasificacion para DistilBERT, por lo que requeririan conversion y validacion propias no cubiertas por el autor.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo (la tarea no es generativa, sino de clasificacion).

## Comparativa con modelos similares

Comparativa con las alternativas evaluadas en el mismo experimento del autor y con el backbone subyacente. No se dispone de datos de otros clasificadores de AG News en la informacion proporcionada.

| Modelo | Parametros entrenables | Contexto | Macro F1 (AG News) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ag-news-distilbert-lora-r16 (este modelo) | adaptador LoRA r=16 + cabeza (fraccion minima de 67 M) | 512 tokens en backbone, 128 en entrenamiento | 0,9293 | apache-2.0 | HuggingFace, adaptador PEFT |
| LoRA r=32 sobre DistilBERT (mismo autor) | adaptador LoRA r=32 + cabeza | idem | 0,9309 | apache-2.0 | HuggingFace, adaptador PEFT |
| Fine-tuning completo de DistilBERT (mismo autor) | 67 M completos | idem | 0,9333 | apache-2.0 (del backbone) | resultado experimental, no se indica repo aparte |
| TF-IDF + regresion logistica (baseline) | no aplica (modelo lineal) | no aplica | 0,9107 | no disponible | baseline del proyecto |

Para otras alternativas de la misma categoria (por ejemplo, BERT-base fine-tuned sobre AG News o clasificadores de texto corto de mayor tamano) no hay datos en la informacion disponible.

## Limitaciones y advertencias

- Dominio cerrado: entrenado y evaluado unicamente sobre AG News, un dataset de noticias cortas en ingles. El rendimiento en otros dominios o en otros corpus de noticias no esta probado.
- Solo ingles: no se ha entrenado ni evaluado en ningun otro idioma.
- Granularidad limitada: clasifica en cuatro categorias amplias; no distingue subtemas ni categorias mas finas dentro de cada seccion.
- Sesgos heredados: el autor advierte de que, al igual que el modelo base, puede reflejar sesgos presentes en los datos de preentrenamiento de DistilBERT.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es una clasificacion incorrecta con alta confianza, con una tasa de error declarada del 7,1 % sobre AG News.
- Metricas no verificadas: tanto la accuracy como el macro F1 (0,9293) estan marcadas como `verified: false` en el model-index; no hay validacion independiente.
- Dependencia de dos artefactos: para usarlo hay que cargar por separado el backbone `distilbert-base-uncased` y el adaptador PEFT, no es un modelo autonómo.
- Repositorio con traccion nula: 0 descargas y 0 "likes" en el momento de la consulta, creado el 25 de septiembre de 2026 y actualizado el 26 del mismo mes; tamano de repositorio practicamente nulo (0,0 GB). No hay evidencia de uso en produccion.
- Enlaces incompletos: el enlace al repositorio de GitHub del autor aparece en la model card con un marcador de posicion (`#`), por lo que no se puede verificar el codigo ni el pipeline completo.
- Licencia: apache-2.0, lo que permite uso comercial del adaptador y del backbone, pero conviene revisar las condiciones del dataset AG News para el uso concreto previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aymanbm2000/ag-news-distilbert-lora-r16
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Dataset AG News: https://huggingface.co/datasets/ag_news
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
- Weights & Biases (herramienta de seguimiento citada por el autor): https://wandb.ai
- Repositorio del proyecto del autor: github.com/aymanbm2000/project3 (el enlace figura con un marcador de posicion `#` en la model card; no verificable)
