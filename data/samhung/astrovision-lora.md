# SamHung/astrovision-lora

## Resumen

AstroVision LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SamHung para el modelo multimodal Llama-3.2-11B-Vision-Instruct, orientado a la generación de descripciones de imágenes astronómicas. El adaptador se entrenó sobre 250 pares imagen-descripción del dataset `AIOmarRehan/space-multimodal-dataset`, con un presupuesto de cómputo muy reducido: 30 pasos de optimización en una GPU T4 gratuita, utilizando la librería Unsloth y TRL. El resultado es un modelo que reproduce el estilo de escritura del corpus de entrenamiento, pero que, según su propia documentación, no constituye una herramienta astronómica fiable.

La relevancia de este modelo radica en su carácter de caso de estudio: demuestra cómo adaptar un modelo multimodal de 11 mil millones de parámetros con recursos mínimos, y documenta de forma explícita los defectos y limitaciones del proceso, incluyendo una auditoría de cinco fallos en el pipeline original que reproduce. El adaptador hereda la licencia Llama 3.2 Community License, no Apache 2.0 como indicaba la tarjeta autogenerada. Con 67 millones de parámetros entrenables, el adaptador se distribuye en formato safetensors y está pensado para cargarse sobre el modelo base cuantizado a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.2-11B-Vision-Instruct (MLLama, vision-language) |
| Parametros totales | 67.174.400 (adaptador LoRA) + 11B (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, no documentado en la card) |
| Tipos de cuantizacion | base cargado en 4-bit NF4; adaptador sin cuantizar (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama-3.2-11B-Vision-Instruct, un modelo multimodal que combina un codificador de visión con un transformer de lenguaje, diseñado para tareas de imagen a texto. El entrenamiento emplea LoRA con rango `r=16`, `alpha=16`, `dropout=0` y `bias="none"`, aplicado a capas de visión y lenguaje, tanto en atención como en MLP. Se utilizó una base cuantizada a 4 bits (NF4) y precisión fp16, con optimizador AdamW 8-bit y tasa de aprendizaje `2e-4`. El dataset se dividió en 200 ejemplos de entrenamiento, 25 de validación y 25 de prueba, con semilla 42 y verificación de disjuntez en tiempo de ejecución. El entrenamiento duró 20,1 minutos en una T4, con un pico de memoria de 9,227 GB sobre 14,563 GB disponibles.

La loss de validación cayó de forma monótona hasta el paso 30, lo que indica que el modelo está subentrenado en lugar de sobreajustado. No se emplearon técnicas de RLHF ni DPO; el proceso se limita a un fine-tuning supervisado estándar. Una particularidad destacable es la advertencia sobre `FastVisionModel.get_peft_model`, que no carga un adaptador existente sino que crea uno nuevo, ignorando el argumento `lora_adapter`; esto produce un modelo matemáticamente idéntico al base sin error aparente, un fallo documentado en la auditoría del repositorio.

## Capacidades

- Generacion de descripciones (image captioning) para imagenes astronomicas, limitado al registro estilistico del corpus de entrenamiento (Tierra desde orbita, Marte, rovers, Via Lactea, Hubble).
- Procesamiento de imagenes y texto en ingles, gracias al modelo base Llama-3.2-11B-Vision-Instruct.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de audio.
- Fuera del dominio astronomico, produce descripciones con sesgo astronomico, con fluidez pero sin garantia de correccion.

## Casos de uso

- Investigacion academica en fine-tuning eficiente: sirve como ejemplo reproducible de como adaptar un modelo multimodal de 11B con una unica GPU T4, utilizando Unsloth y PEFT, para estudiar el impacto del presupuesto de computo en la calidad del modelo.
- Auditoria de pipelines de entrenamiento: el repositorio asociado documenta cinco defectos en el pipeline original, incluyendo un fallo silencioso en la carga de adaptadores; puede usarse como material de referencia para evitar errores similares en proyectos propios.
- Generacion de borradores de descripciones para contenido educativo, siempre que un experto revise y corrija cada salida antes de su publicacion, dado el riesgo de errores confiados.
- Prototipado de sistemas de captioning para imagenes de misiones espaciales en entornos de investigacion controlados, donde las salidas se comparan contra referencias y se descartan automaticamente si no superan umbrales de similitud.
- Evaluacion de metricas de captioning: los resultados BLEU y ROUGE publicados permiten comparar la sensibilidad de estas metricas en dominios especializados, donde descripciones correctas con vocabulario disjunto puntuan cerca de cero.
- Demostracion de carga de adaptadores PEFT con verificacion de integridad: el script `verify_adapter_loading.py` incluido en el repositorio comprueba que el adaptador se aplica realmente, util para depurar pipelines de despliegue.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre 25 imagenes de validacion, con decodificacion greedy, en una Tesla T4:

| Metrica | Valor |
|---|---|
| BLEU | 0,0722 |
| ROUGE-1 | 0,3735 |
| ROUGE-2 | 0,1405 |
| ROUGE-L | 0,3361 |
| length_ratio | 0,9561 |
| Mejor loss de validacion | 0,7232 (en el paso final) |

El autor advierte que BLEU es una metrica debil para captioning y que estos numeros no constituyen una afirmacion de calidad. No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit NF4 ocupa aproximadamente 6-7 GB; el adaptador anade un coste minimo. Se requiere al menos 8 GB de VRAM para cargar el conjunto completo.
- GPU recomendadas: T4 (16 GB), RTX 3090, RTX 4090, A10, A100; cualquier GPU con 8 GB o mas y soporte para bfloat16 o fp16.
- Cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB) con cuantizacion 4-bit.
- Opciones de despliegue: el adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base de Unsloth; tambien puede usarse con vLLM o TGI si se fusiona el adaptador en los pesos del modelo base. No se recomienda Ollama ni llama.cpp para adaptadores PEFT sin fusion previa.
- Latencia y throughput: no se han publicado mediciones; en una T4, la generacion de una descripcion corta (50-100 tokens) puede tardar entre 2 y 5 segundos, segun la longitud de la imagen y el prompt.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de captioning astronomico en la informacion proporcionada. El unico punto de referencia implicito es el modelo base sin fine-tuning, que no se ha evaluado en este contexto. Por tanto, la comparativa se limita a indicar que no hay resultados publicados.

## Limitaciones y advertencias

- El modelo esta subentrenado: la loss de validacion no habia convergido al final del entrenamiento, lo que limita su capacidad de generalizacion.
- Produce errores confiados: ejemplos documentados muestran descripciones erroneas presentadas con total seguridad, como confundir un laboratorio en la Tierra con la superficie de Marte.
- No es una herramienta astronomica: carece de conocimiento especifico mas alla del que ya poseia el modelo base; no debe usarse para identificar objetos, misiones, instrumentos o ubicaciones.
- No apto para mediciones ni afirmaciones cientificas, ni para descripciones de accesibilidad, donde una descripcion incorrecta es peor que ninguna.
- Fuera de dominio degrada silenciosamente: ante imagenes no astronomicas, genera descripciones con sesgo astronomico, con fluidez pero sin relacion con el contenido real.
- Licencia restrictiva: al ser un derivado de Llama-3.2, hereda la Llama 3.2 Community License, que impone condiciones para uso comercial y requiere aceptacion de los terminos de Meta.
- La procedencia de las imagenes del dataset no esta establecida; se recomienda verificar los derechos de uso antes de cualquier aplicacion downstream.
- El adaptador no debe cargarse con `FastVisionModel.get_peft_model`, ya que este metodo no aplica el adaptador existente; debe usarse `PeftModel.from_pretrained` y verificar la carga con el script de auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamHung/astrovision-lora
- Repositorio de auditoria y codigo: https://github.com/Samuelsunshine/astrovision-lora-debugging
- Documento de auditoria (DEBUGGING.md): https://github.com/Samuelsunshine/astrovision-lora-debugging/blob/main/DEBUGGING.md
- Dataset de entrenamiento: https://huggingface.co/datasets/AIOmarRehan/space-multimodal-dataset
- Pipeline original reproducido: https://github.com/AIOmarRehan/Unsloth_Llama_3.2_11B_Vision_Instruct_Astronomy
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
