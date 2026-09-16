# Adnan2942/Qwen2-VL-7B-Instruct-LoRA-Latex-OCR

## Resumen

Adnan2942/Qwen2-VL-7B-Instruct-LoRA-Latex-OCR es un ajuste fino mediante LoRA del modelo multimodal Qwen2-VL-7B-Instruct, orientado a una tarea concreta: convertir imagenes de formulas matematicas (impresas o manuscritas) en su representacion LaTeX. Lo publica el usuario Adnan2942 en Hugging Face con licencia Apache-2.0 y pipeline `image-text-to-text`. El entrenamiento se realizo sobre el dataset `unsloth/LaTeX_OCR`, partiendo de la version cuantizada en 4 bits `unsloth/qwen2-vl-7b-instruct-unsloth-bnb-4bit` y usando las librerias Unsloth y TRL.

El modelo conserva la arquitectura del original: un codificador visual ViT con resolucion dinamica conectado a un decodificador transformer denso de la familia Qwen2, con un total de 8.291.375.616 parametros en el repositorio publicado. No es un modelo MoE, por lo que no hay parametros activos diferenciados. El repositorio pesa 33,2 GB y almacena pesos en safetensors; ese tamano es coherente con un guardado en fp32 (8,29 mil millones de parametros x 4 bytes), lo que conviene tener en cuenta antes de desplegarlo.

Su relevancia es practica y acotada: resuelve un problema recurrente en la digitalizacion de documentacion cientifica y tecnica (pasar ecuaciones de un PDF escaneado o de una foto de pizarra a LaTeX editable) reutilizando un modelo vision-lenguaje generalista de 7B en lugar de entrenar un OCR especializado desde cero. Como contrapartida, la ficha es muy reciente, acumula 0 descargas y 0 likes, no publica resultados de benchmarks y su model card es minima, por lo que cualquier evaluacion en produccion debe hacerse por cuenta del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual ViT con resolucion dinamica + decodificador denso Qwen2 (heredado del modelo base Qwen2-VL-7B-Instruct) |
| Parametros totales | 8.291.375.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card de esta adaptacion; el modelo base Qwen2-VL-7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN segun la documentacion publica de Qwen |
| Tipos de cuantizacion | No se publican variantes cuantizadas. El modelo base usado para el ajuste estaba en 4 bits (bitsandbytes). Los pesos publicados, por tamano de repositorio (33,2 GB), parecen estar en fp32 |
| Idiomas soportados | en (ingles) declarado en la model card. El modelo base soporta OCR multilingue, pero no hay validacion de esta adaptacion en otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers). Sin GGUF, AWQ ni GPTQ publicados |
| Tipo de ajuste | LoRA fusionado en el modelo principal; los adaptadores se publican por separado en el repositorio Adnan2942/Qwen2-VL-7B-Instruct-LoRA-Latex-OCR-Adapter |
| Dataset de entrenamiento | unsloth/LaTeX_OCR |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 33,2 GB |
| Fecha de publicacion | 15 de septiembre de 2026 (creacion del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La adaptacion no modifica la arquitectura del modelo base. Qwen2-VL-7B-Instruct combina un codificador visual tipo ViT que procesa la imagen a resolucion dinamica (el numero de tokens visuales depende de los pixeles de entrada, regulado por los parametros `min_pixels` y `max_pixels`) con un decodificador transformer denso de la familia Qwen2 que incorpora M-RoPE (rotary position embedding multimodal) para unificar las posiciones de texto, imagen y video. El ajuste se aplico unicamente sobre los pesos del modelo mediante LoRA, entrenado con Unsloth y TRL sobre el dataset `unsloth/LaTeX_OCR`, cuyo objetivo es el par imagen de formula / cadena LaTeX correspondiente.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de pasos, el rango de LoRA, la tasa de aprendizaje ni si se aplicaron fases de RLHF o DPO. La model card remite al repositorio de adaptadores para consultar los registros de entrenamiento, pero no reproduce esos datos. Tampoco se documenta ninguna innovacion tecnica propia: el unico elemento destacable es el uso de Unsloth para acelerar el ajuste (el autor afirma que el entrenamiento fue 2x mas rapido) y el hecho de partir de una base ya cuantizada en 4 bits, lo que abarata el entrenamiento pero puede introducir una perdida de precision respecto a un ajuste sobre pesos en bf16.

## Capacidades

- Reconocimiento optico de caracteres sobre formulas matematicas, con salida en notacion LaTeX, que es la tarea objetivo del ajuste.
- Entrada multimodal imagen + texto: el modelo acepta una imagen y una instruccion en lenguaje natural (por ejemplo, "Write the Latex representation for this image").
- Generacion de texto autoregresiva estandar, con decodificacion por muestreo configurable (`temperature`, `min_p`, `max_new_tokens`) segun el ejemplo de la model card.
- Capacidades heredadas del modelo base Qwen2-VL-7B-Instruct (comprension de documentos, VQA, descripcion de imagenes, razonamiento sobre capturas), no verificadas ni garantizadas tras este ajuste especifico.
- Soporte de tool calling / function calling: el modelo base lo incorpora, pero no hay confirmacion de que se mantenga en esta adaptacion.
- Soporte de agentes y razonamiento multi-paso: no verificado en esta adaptacion.
- Capacidades multilingues: la model card solo declara ingles; no hay evidencia publicada para el resto de idiomas.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Digitalizacion de articulos cientificos: extraer las ecuaciones de un PDF escaneado o de capturas de pagina y devolver LaTeX listo para pegar en un manuscrito, evitando el retipeo manual de formulas largas.
- Conversion de apuntes manuscritos a LaTeX: fotografiar una pizarra o un cuaderno y obtener el codigo de las formulas para incorporarlo a un documento academico.
- Preprocesado de corpus cientificos: procesar grandes volumenes de imagenes de formulas procedentes de repositorios tipo arXiv para construir datasets de entrenamiento o indices de busqueda matematica.
- Integracion en editores colaborativos: conectar el modelo a un boton de "insertar formula desde imagen" en editores tipo Overleaf o en un CMS, usando la inferencia local del modelo para no enviar documentos sensibles a terceros.
- Accesibilidad: convertir formulas de material docente a LaTeX o MathML para que un lector de pantalla pueda verbalizarlas a estudiantes con discapacidad visual.
- Automatizacion documental tecnica: extraer notacion matematica de informes de ingenieria, patentes o fichas tecnicas escaneadas y volcarla a un sistema estructurado.
- Despliegue en estacion de trabajo o portatil con GPU de consumo: cuantizado a 4 bits y ejecutado localmente, sirve como herramienta offline para estudiantes e investigadores que trabajan con material confidencial.
- Asistencia a la docencia: correccion de ejercicios fotografiados, comparando la solucion del alumno con la ecuacion de referencia generada por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de reconocimiento de formulas (por ejemplo, BLEU, edit distance normalizada o exact match sobre LaTeX), ni comparaciones con OCR especializados. Tampoco hay datos de latencia o throughput medidos para esta adaptacion.

## Requisitos de hardware

- Inferencia en fp32 (formato publicado): los pesos ocupan unos 33,2 GB, mas activaciones y cache KV. Requiere GPU con 40 GB o mas; en la practica, A100 80 GB, H100 80 GB o varias GPU. No cabe en GPUs de consumo.
- Inferencia en bf16 (tras convertir los pesos): aproximadamente 16,6 GB de pesos y en torno a 20-24 GB contando activaciones y cache KV. Cabe en una RTX 4090 (24 GB), L40S (48 GB), A100 40 GB o H100.
- Inferencia en 8 bits: aproximadamente 8,5-9 GB de pesos; viable en RTX 4080 (16 GB), RTX 4060 Ti 16 GB o A10G (24 GB).
- Inferencia en 4 bits (bitsandbytes, GPTQ o AWQ tras conversion propia): aproximadamente 5-6 GB de pesos; cabe en RTX 3060 12 GB, RTX 4070 (12 GB), RTX 4060 (8 GB, con contexto reducido) y en GPUs integradas con memoria unificada de 16 GB o mas.
- Opciones de despliegue: `transformers` con el pipeline `image-text-to-text` es la via documentada por el autor; el repositorio esta etiquetado como compatible con text-generation-inference (TGI) y Qwen2-VL cuenta con soporte en vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona.
- Latencia y throughput: no disponible. A modo de referencia cualitativa, el coste dominante en esta tarea es el numero de tokens visuales, que crece con la resolucion de la imagen de entrada; recortar la imagen a la region de la formula reduce el tiempo de inferencia.
- El modelo base usado en el entrenamiento estaba en 4 bits, de modo que ejecutar los pesos publicados en fp32 no reproduce necesariamente el comportamiento observado durante el ajuste.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentacion publica y no se han verificado en esta ficha; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2-VL-7B-Instruct-LoRA-Latex-OCR | 8,29 B | No especificado (base: 32.768) | OCR de formulas a LaTeX | Apache-2.0 | Hugging Face, safetensors fp32 |
| Qwen2-VL-7B-Instruct (modelo base) | 8,29 B | 32.768 ampliable con YaRN | Vision-lenguaje generalista | Apache-2.0 | Hugging Face, multiples formatos y cuantizaciones |
| GOT-OCR2.0 | Aproximadamente 580 M segun documentacion publica | No disponible | OCR de documentos y formulas | Apache-2.0 | Hugging Face |
| InternVL2-8B | Aproximadamente 8,1 B segun documentacion publica | No disponible | Vision-lenguaje generalista | MIT | Hugging Face |

No hay datos de rendimiento comparado publicados para esta adaptacion, por lo que la eleccion entre estas opciones debe basarse en una evaluacion propia sobre el dominio concreto de formulas a convertir.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: sin benchmarks, sin conjunto de validacion descrito y sin comparacion con OCR especializados, no hay evidencia objetiva de la calidad del ajuste.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica que no ha sido validado por terceros.
- Riesgo de alucinacion: en formulas ambiguas, con simbolos poco frecuentes o con imagenes de baja resolucion, el modelo puede generar LaTeX sintacticamente correcto pero matematicamente erroneo, un fallo silencioso y especialmente peligroso en contextos academicos.
- Posible sobreajuste al dataset `unsloth/LaTeX_OCR`: al tratarse de un ajuste LoRA sobre un unico dataset, es razonable esperar un buen comportamiento en notacion academica estandar y un rendimiento peor en notacion de ingenieria, quimica, fisica avanzada o escritura informal.
- Idiomas: la model card solo declara ingles. Aunque el modelo base es multilingue, no hay evidencia de que esta adaptacion mantenga esa capacidad y el ajuste puede haber degradado el comportamiento en otros idiomas.
- Regresion de capacidades generales: un ajuste LoRA especifico puede reducir el rendimiento del modelo en tareas de vision-lenguaje ajenas al OCR de formulas. Conviene evaluar la tasa de olvido catastrofico antes de reutilizarlo como modelo generalista.
- Coste de despliegue: los pesos publicados parecen estar en fp32 (33,2 GB), lo que exige conversion y cuantizacion para un uso eficiente. No se ofrecen variantes GGUF, AWQ ni GPTQ.
- Model card incompleta: el ejemplo de codigo no importa `AutoTokenizer` y no incluye los hiperparametros de entrenamiento, el numero de pasos ni la composicion del dataset. La informacion de entrenamiento se delega al repositorio de adaptadores.
- Licencia: el modelo se publica bajo Apache-2.0, lo que permite uso comercial, pero la responsabilidad sobre la procedencia y las condiciones del dataset `unsloth/LaTeX_OCR` recae en quien despliega el modelo; conviene revisar la licencia de ese dataset antes de un uso comercial.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos ni de comportamiento diferencial por tipo de escritura, idioma o calidad de imagen.
- Contexto: aunque el modelo base admite ventanas largas, esta adaptacion no ha sido validada con documentos de muchas paginas ni con multiples imagenes por conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adnan2942/Qwen2-VL-7B-Instruct-LoRA-Latex-OCR
- Repositorio de adaptadores LoRA (incluye registros de entrenamiento): https://huggingface.co/Adnan2942/Qwen2-VL-7B-Instruct-LoRA-Latex-OCR-Adapter
- Modelo base usado para el ajuste: https://huggingface.co/unsloth/qwen2-vl-7b-instruct-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/unsloth/LaTeX_OCR
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a articulos sobre WhatsApp y no guardan relacion con la ficha).
