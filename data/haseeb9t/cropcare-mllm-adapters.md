# Haseeb9t/CropCare-MLLM-Adapters

## Resumen

CropCare-MLLM-Adapters es un paquete de adaptadores LoRA multimodales publicados por Haseeb Mehmood (Center for Machine Vision and Signal Analysis, Universidad de Oulu) como material complementario del articulo "Evidence-Bound Instruction Tuning for Potato Leaf Disease Classification: A Multi-Stage Vision-Language Pipeline". No se trata de un modelo autonomo, sino de tres adaptadores PEFT independientes que se sobreponen a modelos base de vision-lenguaje ya existentes: Gemma 4 26-a4b, Llama 3.2 Vision 90B y Mistral Small 3.1 24B.

El problema que aborda es la clasificacion diagnostica de enfermedades en hojas de patata (early blight y late blight) a partir de imagenes, con generacion de texto justificativo en ingles mediante la tarea image-text-to-text. El adaptador para Gemma 4 es el que obtiene los mejores resultados declarados en la model card, con un 92,1% de precision estricta y un 92,0% de Macro F1 sobre un conjunto de validacion de 466 imagenes.

El repositorio ocupa 3,2 GB y contiene los tres archivos comprimidos con los adaptadores (1,79 GB, 928 MB y 361 MB). La licencia declarada para los adaptadores es MIT y el unico idioma soportado es el ingles. El modelo fue publicado el 1 de octubre de 2026 y no registra descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre tres modelos base multimodales: Gemma 4 26-a4b (MoE), Llama 3.2 Vision 90B (cross-attention) y Mistral Small 3.1 24B (dense) |
| Parametros totales | No es un unico modelo; los adaptadores pesan 1,79 GB, 928 MB y 361 MB y se aplican sobre modelos base de 26B, 90B y 24B respectivamente |
| Parametros activos | 4B activos en el modelo base Gemma 4 26-a4b (arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 para el adaptador sobre Gemma 4; 4-bit QLoRA para los adaptadores sobre Llama 3.2 Vision 90B y Mistral Small 3.1 24B. El ejemplo de carga de la model card usa `load_in_4bit=True` |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors` dentro de cada archivo zip), compatible con PEFT y Unsloth. Tambien se incluyen `adapter_config.json`, `chat_template.jinja`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json` y `training_args.bin` |

## Arquitectura y entrenamiento

Cada adaptador es un modulo LoRA entrenado sobre un modelo base multimodal distinto. El adaptador con mejores resultados se aplica sobre `google/gemma-4-26-a4b-it`, un modelo con arquitectura de mezcla de expertos (MoE) de aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token. Los otros dos adaptadores se aplican sobre `meta-llama/Llama-3.2-90B-Vision-Instruct` (90B, con atencion cruzada dedicada para la rama visual) y `mistralai/Mistral-Small-24B-Instruct-2501` (24B dense). Todos los modelos base aceptan entrada de imagen y texto (image-text-to-text).

El entrenamiento sigue el enfoque descrito en la model card como "Evidence-Bound Instruction Tuning", organizado en un pipeline vision-lenguaje multi-etapa. Los adaptadores de Llama 3.2 Vision 90B y Mistral Small 3.1 se entrenaron con cuantizacion de 4 bits (QLoRA), mientras que el de Gemma 4 se entreno en BF16. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla del dataset de Kaggle asociado, "Potato Leaf Disease with AI-Generated Captions"), ni si se emplearon tecnicas de alineacion como RLHF o DPO. No se detallan innovaciones tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Clasificacion diagnostica de enfermedades en hojas de patata: distingue entre early blight y late blight con generacion de texto asociado.
- Generacion de texto a partir de imagen: el pipeline es image-text-to-text, por lo que produce una respuesta textual que acompana a la clasificacion.
- Diagnostico con justificacion basada en evidencia ("evidence-bound"), segun el enfoque declarado en el articulo.
- Clasificacion multi-etiqueta ajustada (multi-label adjusted accuracy reportada en los benchmarks).
- Integracion con tooling estandar de PEFT/Unsloth: los adaptadores se cargan con `FastVisionModel.from_pretrained` y `load_in_4bit`.
- Soporte multilingue: no disponible; el unico idioma declarado es ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponibles; el adaptador es exclusivamente de imagen y texto.

## Casos de uso

- Diagnostico asistido en campo: un tecnico agricola fotografia una hoja de patata con el movil y el modelo devuelve una clasificacion (early blight, late blight o sano) acompanada de una explicacion textual que justifica el diagnostico.
- Triaje automatizado en cooperativas agricolas: integrar el adaptador de Gemma 4 detras de una API para preclasificar lotes de imagenes enviadas por los socios y priorizar las inspecciones humanas de los casos dudosos.
- Aplicacion movil offline para agricultores: compilar el adaptador de Mistral Small 3.1 24B (el mas ligero en cuantizacion de 4 bits) para desplegarlo en un dispositivo con GPU de gama alta o servidor local, sin dependencia de la nube.
- Generacion de informes fitosanitarios: usar la salida textual del modelo como borrador de informe que un ingeniero agronomo revisa y firma, aprovechando el enfoque "evidence-bound" para citar los sintomas observados.
- Investigacion en patologia vegetal: emplear los adaptadores como linea base reproducible para comparar tecnicas de ajuste (LoRA BF16 frente a QLoRA 4 bits) sobre el mismo dataset de hojas de patata.
- Filtrado previo en pipelines de datos agricolas: preclasificar grandes volumenes de imagenes capturadas por drones o sensores para separar las que requieren analisis experto de las claramente sanas.
- Prototipado rapido con Unsloth: la carga via `FastVisionModel.from_pretrained` con `load_in_4bit=True` permite montar una demo funcional en pocas lineas de Python para validar el valor del modelo antes de invertir en infraestructura.

## Benchmarks y rendimiento

Resultados declarados en la model card (Table V del articulo, N = 466 imagenes de validacion):

| Arquitectura | Parametros | Metodo | Precision estricta | Recall early blight | Recall late blight | Multi-Label Adj. | Macro F1 |
|---|---|---|---|---|---|---|---|
| Gemma 4 26-a4b | 26B (4B activos) | BF16 LoRA | 92,1% | 91,1% | 93,2% | 93,3% | 92,0% |
| Qwen 3.8 | 27B dense | BF16 LoRA | 86,0% | 88,3% | 83,6% | 92,1% | 86,0% |
| Llama 3.2 Vision | 90B cross-attn | 4-bit QLoRA | 85,4% | 89,1% | 81,3% | 87,1% | 85,4% |
| Mistral Small 3.1 | 24B dense | 4-bit QLoRA | 54,7% | 98,8% | 5,0% | 58,1% | 39,6% |

No se han publicado en la informacion disponible otros benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para estos adaptadores.

## Requisitos de hardware

Nota: los siguientes valores son estimaciones razonadas a partir del tamano de los modelos base en cuantizacion de 4 bits; la model card no publica cifras de VRAM, latencia ni throughput.

- Adaptador Gemma 4 26-a4b: modelo base de 26B parametros con 4B activos. En 4 bits se estima un consumo de VRAM en torno a 15-18 GB, mas el overhead del contexto y de la rama visual.
- Adaptador Mistral Small 3.1 24B: modelo dense de 24B. En 4 bits se estima un consumo de VRAM de aproximadamente 14-18 GB, lo que lo hace viable en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) con margen limitado.
- Adaptador Llama 3.2 Vision 90B: modelo de 90B con atencion cruzada. En 4 bits se estima un consumo de 50-60 GB de VRAM, lo que requiere GPUs de datacenter como A100 80 GB o H100 80 GB, o bien despliegue multi-GPU.
- Cabe en GPU de consumo: previsiblemente Mistral Small 3.1 24B y Gemma 4 26-a4b en cuantizacion de 4 bits sobre RTX 3090/4090 (24 GB); Llama 3.2 Vision 90B no cabe en una sola GPU de consumo.
- Opciones de despliegue: Unsloth y PEFT/Transformers son las rutas documentadas en la model card (`FastVisionModel.from_pretrained`). Para servir en produccion no se detalla compatibilidad explicita con vLLM, TGI, llama.cpp u Ollama; llama.cpp no es una ruta estandar para adaptadores sobre modelos multimodales de este tamano.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La propia model card incluye una comparativa entre los cuatro modelos evaluados sobre el mismo conjunto de validacion. No se dispone de comparacion con otros adaptadores multimodales especificos de patologia vegetal en la informacion proporcionada.

| Modelo | Parametros base | Metodo de ajuste | Precision estricta | Macro F1 | Licencia del adaptador |
|---|---|---|---|---|---|
| CropCare sobre Gemma 4 26-a4b | 26B (4B activos) | BF16 LoRA | 92,1% | 92,0% | MIT |
| CropCare sobre Llama 3.2 Vision 90B | 90B | 4-bit QLoRA | 85,4% | 85,4% | MIT |
| CropCare sobre Mistral Small 3.1 24B | 24B | 4-bit QLoRA | 54,7% | 39,6% | MIT |

Alternativas genericas de clasificacion de enfermedades en hojas (por ejemplo, clasificadores CNN como EfficientNetB4 sobre PlantVillage u otros modelos ViT) existen en el ecosistema, pero no se dispone de resultados comparables publicados con este mismo conjunto de 466 imagenes, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Requiere un modelo base: los archivos publicados son adaptadores LoRA, no pesos completos. Sin descargar el modelo base correspondiente (Gemma 4, Llama 3.2 Vision o Mistral Small 3.1) no son utilizables.
- Dominio muy estrecho: el ajuste esta especializado en enfermedades de hojas de patata (early blight y late blight). No se debe esperar buen rendimiento en otras especies vegetales ni en otras patologias.
- Idioma: el unico idioma declarado es el ingles, tanto en los prompts como en las respuestas generadas.
- Licencia de los modelos base: aunque los adaptadores se publican bajo licencia MIT, los modelos base (Gemma, Llama 3.2 Vision, Mistral Small) tienen sus propias condiciones de uso, que incluyen restricciones adicionales para uso comercial. Es imprescindible revisarlas antes de un despliegue productivo.
- Riesgo de alucinacion: al ser modelos generativos multimodales, pueden producir justificaciones textuales plausibles pero incorrectas. El enfoque "evidence-bound" reduce, pero no elimina, este riesgo.
- Volumen de validacion limitado: los resultados reportados corresponden a 466 imagenes, un tamano de muestra modesto que limita la confianza estadistica de las cifras.
- Desequilibrio en el caso de Mistral Small 3.1: un recall de late blight del 5,0% indica que el modelo practicamente no detecta esa clase, a pesar de un recall de early blight del 98,8%. No es adecuado como clasificador binario de late blight.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 "likes", y los resultados no han sido replicados de forma independiente en el momento de redactar esta ficha.
- Posibles inconsistencias en la nomenclatura: la model card menciona `gemma4_31b_potato_best_lora.zip` mientras que el modelo base se identifica como "Gemma 4 26-a4b" (26B). Conviene verificar la correspondencia exacta del checkpoint antes de integrarlo.
- Fechas: el repositorio y la publicacion estan fechados en 2026, por lo que conviene comprobar la vigencia de los enlaces y del articulo asociado antes de citarlos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Haseeb9t/CropCare-MLLM-Adapters
- Repositorio GitHub del proyecto: https://github.com/Lethaldroid/CropCare-MLLM
- Dataset en Kaggle (Potato Leaf Disease with AI-Generated Captions): https://www.kaggle.com/datasets/haseebmahmoud/potato-leaf-disease-with-ai-generated-captions
- Cita sugerida (BibTeX):
  ```
  @article{cropcare2026evidence,
    title={Evidence-Bound Instruction Tuning for Potato Leaf Disease Classification: A Multi-Stage Vision-Language Pipeline},
    author={Mehmood, Haseeb},
    journal={Center for Machine Vision and Signal Analysis, University of Oulu},
    year={2026}
  }
  ```
