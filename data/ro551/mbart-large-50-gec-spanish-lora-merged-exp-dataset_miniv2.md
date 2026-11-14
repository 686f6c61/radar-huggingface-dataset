# Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_miniv2

## Resumen

El modelo `Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_miniv2` es un ajuste fino de `facebook/mbart-large-50` orientado a la correccion gramatical del espanol (GEC, *Grammatical Error Correction*). Lo desarrolla el usuario Ro551 y se distribuye como un adaptador LoRA fusionado con el modelo base, es decir, los pesos del adaptador ya estan integrados en el checkpoint resultante, por lo que se puede cargar como un modelo `transformers` convencional sin necesidad de aplicar PEFT en tiempo de inferencia.

El modelo parte de la arquitectura mBART-50, un transformer encoder-decoder multilingue con 610 millones de parametros y un tokenizador SentencePiece compartido para 50 idiomas. La relevancia de este checkpoint es acotada: se trata de un experimento con muy poca traccion (15 descargas, 0 likes) y una model card generada automaticamente por el Trainer, sin documentacion sobre el dataset de entrenamiento ni sobre los usos previstos. Su interes practico reside en que demuestra un flujo de trabajo de ajuste LoRA sobre mBART-50 para una tarea seq2seq concreta, y en que reporta una metrica GLEU de 0,6765 en el conjunto de validacion.

No debe confundirse con un modelo de proposito general ni con un sistema de correccion de produccion: es un artefacto de investigacion con evaluacion limitada a una unica metrica automatica y sin datos publicados de comportamiento por tipo de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50), ajustado con LoRA y fusionado |
| Parametros totales | 610 M (heredados de facebook/mbart-large-50; no se especifica recuento tras la fusion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (valor por defecto de mBART-50; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision de entrenamiento) |
| Idiomas soportados | espanol como idioma objetivo; el modelo base soporta 50 idiomas, pero el ajuste solo se ha validado (sin detalle) en espanol |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,1 GB, libreria `peft`) |

## Arquitectura y entrenamiento

La base es mBART-50, un transformer encoder-decoder preentrenado con denoising multilingue sobre 50 idiomas. Sobre esa base se aplico un adaptador LoRA que posteriormente se fusiono en los pesos del modelo, de modo que el checkpoint publicado contiene los pesos ya modificados. El entrenamiento se realizo con PEFT 0.18.1, Transformers 5.0.0, PyTorch 2.7.0+cu126 y Datasets 4.8.5.

Los hiperparametros documentados son: learning rate 4,44e-4, batch de entrenamiento y evaluacion de 32, 2 epocas (1060 pasos), scheduler lineal con warmup del 8,3 %, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, semilla 42 y precision mixta AMP nativa. El dataset de entrenamiento aparece como `None` en la model card: no se especifica su composicion, tamano ni procedencia, aunque el nombre del checkpoint (`dataset_miniv2`) sugiere una version reducida de un corpus previo. No se documenta ninguna innovacion tecnica adicional (ni decodificacion especulativa, ni atencion lineal, ni RLHF/DPO).

## Capacidades

- Generacion de texto seq2seq condicionada a una entrada: el modelo recibe una secuencia y produce otra, que es el formato propio de la correccion gramatical.
- Correccion gramatical del espanol: la unica tarea para la que existe evidencia de ajuste, medida con GLEU sobre un conjunto de validacion no descrito.
- Reescritura y normalizacion de frases: por la naturaleza de la tarea GEC, puede reformular oraciones con errores de concordancia, ortografia o puntuacion, aunque no hay evaluacion desagregada por tipo de error.
- Capacidad multilingue teorica heredada de mBART-50 (50 idiomas), sin validacion documentada tras el ajuste.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- No se documenta un modo de chat ni plantilla de conversacion; el uso esperado es el de un modelo seq2seq de traduccion/correccion, no el de un asistente instruido.

## Casos de uso

- Correccion ortografica y gramatical por lotes: dado un corpus de textos en espanol (por ejemplo, resenas o formularios de usuario), el modelo genera la version corregida frase a frase. Es adecuado por su naturaleza seq2seq y su bajo coste computacional (610 M de parametros).
- Preprocesado para pipelines de NLP: normalizar texto antes de indexarlo en un buscador o de pasarlo a un modelo de clasificacion, reduciendo ruido ortografico y de concordancia.
- Limpieza de datasets de entrenamiento: corregir automaticamente pares texto-anotacion en corpus en espanol antes de usarlos para ajustar otros modelos.
- Prototipado de asistentes de escritura: integrar el modelo como paso de post-edicion en un editor, con la salvedad de que no hay evaluacion de calidad por tipo de error ni de preservacion de significado.
- Experimentacion academica en GEC: servir como punto de partida o linea base para comparar estrategias de ajuste LoRA sobre mBART-50 en espanol, dado que el checkpoint documenta hiperparametros y curva de validacion.
- Traduccion o parafraseo experimental dentro del ecosistema mBART-50: el modelo conserva la arquitectura multilingue del base, por lo que puede probarse en tareas seq2seq afines, aunque sin garantias de calidad tras el ajuste especifico.

## Benchmarks y rendimiento

La model card declara una unica metrica en el conjunto de evaluacion, sin comparativas con otros modelos:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 6,9547 |
| GLEU | 0,6765 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Loss de validacion | GLEU |
|---|---|---|---|
| 1,0 | 530 | 6,8947 | 0,7835 |
| 2,0 | 1060 | 6,9547 | 0,6765 |

El GLEU empeora en la segunda epoca (de 0,7835 a 0,6765) mientras la loss de validacion se mantiene practicamente plana, lo que sugiere sobreajuste o inestabilidad en la segunda epoca. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5-3 GB para los 610 M de parametros mas activaciones; en fp16, aproximadamente 1,3-1,6 GB.
- Cabe holgadamente en cualquier GPU de consumo con 8 GB o mas: RTX 3060, RTX 4060, RTX 4070, RTX 4090.
- GPU profesionales recomendadas para servir en produccion: A10, L4, A100 o H100 si se necesita throughput alto con lotes grandes.
- Despliegue: `transformers` con `AutoModelForSeq2SeqLM` (formato nativo), TGI para servicio HTTP, o conversion a GGUF/ONNX para `llama.cpp`/ONNX Runtime si se quiere inferencia en CPU (la conversion no esta documentada por el autor).
- Latencia y throughput: no disponibles. Por tamano, se espera inferencia en decenas de milisegundos por frase en GPU moderna con lotes pequenos, pero es una estimacion, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_miniv2 | 610 M | 1024 (por defecto del base) | GEC espanol (seq2seq) | MIT | Hugging Face, 15 descargas |
| facebook/mbart-large-50 | 610 M | 1024 | Traduccion multilingue y seq2seq general | MIT | Hugging Face, ampliamente usado |
| Modelos GEC espanoles basados en mT5/T5 (p. ej. variantes de mT5-small/base ajustadas a GEC) | 300 M - 580 M | 512-1024 | GEC espanol | variable (MIT/Apache-2.0) | Hugging Face, comunidad |
| Modelos de correccion comerciales (p. ej. APIs de LanguageTool o similares) | no disponible | no disponible | GEC multilingue | propietaria | API de pago |

La comparativa cuantitativa de calidad no es posible: el checkpoint no publica resultados frente a alternativas y su unica metrica (GLEU 0,6765) no es directamente comparable con las de otros sistemas sin el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica `None` en el campo de dataset, por lo que se desconoce la composicion, el dominio y el sesgo del corpus usado.
- Evaluacion minima: una sola metrica (GLEU) sobre un conjunto no descrito, sin evaluacion por tipo de error ni comprobacion de preservacion de significado.
- Sobreajuste probable: el GLEU cae en la segunda epoca mientras la loss se estanca, lo que sugiere que el checkpoint final no es el mejor punto de validacion.
- Riesgo de alucinacion y de reescritura excesiva: al ser un modelo generativo seq2seq, puede alterar contenido correcto o introducir cambios no solicitados en la frase; no hay mecanismo de control documentado.
- Ambito limitado al espanol: aunque el base es multilingue, el ajuste no se ha validado en otros idiomas y podria degradar su comportamiento previo en ellos.
- Sin soporte de instrucciones ni de conversacion: no es un modelo de chat ni un asistente; usarlo como tal dara resultados pobres.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base (MIT) y de los datos de entrenamiento, que se desconocen.
- Traccion practica nula: 15 descargas y 0 likes indican que no ha sido validado por la comunidad; no es una eleccion recomendable para produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_miniv2
- Modelo base: https://huggingface.co/facebook/mbart-large-50
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
- Paper de mBART-50: https://arxiv.org/abs/2008.00401
