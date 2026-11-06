# minas2025/Qwen-3.5-9B-StupidChat-Uncensored

## Resumen

Qwen-3.5-9B-StupidChat-Uncensored es un ajuste fino mediante LoRA del modelo `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, publicado por el usuario minas2025 en Hugging Face. No se trata de un modelo de propósito general, sino de un fine-tune de personaje: el objetivo declarado es encarnar a «StupidChat», una persona que responde con seguridad a cualquier pregunta mediante razonamiento circular, con faltas de ortografía deliberadas y sin ser consciente de su propia incoherencia. El corpus de entrenamiento es el dataset `minas2025/StupidChat`, con 15.832 filas de entrenamiento y 832 de evaluación, compuesto mayoritariamente por trivialidades, conversación y relleno.

El modelo conserva la arquitectura del base Qwen3.5 de 9B, con 9.197.093.888 parámetros totales según los pesos en safetensors, y hereda del base las capacidades multimodales (el repositorio incluye un `mmproj` para la torre de visión) y el soporte de decodificación especulativa mediante cabeza de predicción multi-token (MTP). El repositorio ocupa 157,4 GB porque incluye el adaptador LoRA, el modelo fusionado en bf16 y una batería extensa de cuantizaciones GGUF, desde IQ1 hasta Q8_0 y F16.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de fine-tune de personaje a escala 9B con Unsloth, y como banco de pruebas para decodificación especulativa MTP en llama.cpp con cuantizaciones calibradas mediante importance matrix sobre el propio dataset. No es un modelo adecuado para tareas de producción que requieran precisión factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP opcional en los GGUF del base; no se detalla en la informacion disponible la configuracion interna de capas y atencion |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_NL, Q4_XS, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q2_K, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S, IQ1_XS, IQ1_XXS, IQ1_XXXS; ademas bf16 (adaptador LoRA y modelo fusionado) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia no estandar; ver limitaciones) |
| Formato de pesos | safetensors (adaptador LoRA y fusionado bf16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de un transformer Qwen3.5 de 9B, cuyo preentrenamiento y detalles de composicion del dataset original no se documentan en la informacion disponible. Sobre esa base se aplico un ajuste supervisado con LoRA en precision bf16 usando Unsloth: rango 64, alpha 128, learning rate 1e-4 con scheduler coseno, 3 epocas, longitud de secuencia 2048, batch efectivo de 16 (4 x 4 de acumulacion de gradientes) y seleccion del mejor checkpoint por perdida de evaluacion. El entrenamiento se ejecuto en una NVIDIA RTX Pro 6000 Blackwell de 96 GB en un sandbox en la nube (molab) el 5 de noviembre de 2026.

La innovacion tecnica mas destacable no esta en el entrenamiento sino en la exportacion: los GGUF se generaron con una build de llama.cpp b11985 (CUDA 13) y las cuantizaciones de baja precision (IQ y sub-3 bits) se calibraron con una importance matrix calculada sobre el propio dataset StupidChat. Los formatos de 3,5 bits o mas conservan la cabeza MTP del modelo base y admiten decodificacion especulativa con `--spec-type draft-mtp`; los formatos de 3 bits o menos se exportaron sin cabeza MTP porque `llama-quantize` rechaza construir esos formatos cuando faltan tensores en la matriz de importancia. La perdida de evaluacion fue de 1,5085 en la primera epoca y 1,5199 en la segunda, con rollback al mejor checkpoint activo.

## Capacidades

- Generacion de texto conversacional en ingles con una persona fija: respuestas seguras, circularmente razonadas y con ortografia deliberadamente descuidada.
- Respuesta a preguntas factuales manteniendo el personaje: el modelo conoce la respuesta pero la presenta de forma absurda y autoconfirmatoria.
- Capacidad multimodal heredada del base: el repositorio incluye `mmproj-F16.gguf`, la torre de vision, aunque no se documenta su comportamiento tras el fine-tune.
- Soporte de decodificacion especulativa mediante cabeza MTP en los GGUF etiquetados `+MTP`, lo que acelera la inferencia en llama.cpp.
- Plantilla de chat compatible con el flag `enable_thinking=False` de Qwen3.5; el autor recomienda desactivar el modo de razonamiento en inferencia.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso; el fine-tune esta orientado a roleplay y conversacion.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Roleplay y personajes de chat: el modelo esta entrenado especificamente para mantener una persona concreta a lo largo de conversaciones multi-turno, con un corpus de 15.832 ejemplos de conversacion y relleno que refuerza el tono coloquial.
- Pruebas de robustez conversacional: util para evaluar como se comporta un modelo de 9B cuando se le fuerza a mantener coherencia interna en respuestas deliberadamente circulares, por ejemplo en investigacion sobre calibracion y deteccion de alucinacion.
- Demostraciones de fine-tune con Unsloth: el repositorio documenta hiperparametros, hardware y curva de perdida, lo que lo convierte en una referencia practica para reproducir un ajuste LoRA de rango 64 sobre una base de 9B.
- Banco de pruebas de cuantizacion GGUF: la bateria de formatos desde IQ1 hasta Q8_0 con importance matrix calibrada sobre el dataset permite medir el deterioro de calidad por nivel de cuantizacion en un caso controlado.
- Evaluacion de decodificacion especulativa MTP: los GGUF etiquetados `+MTP` permiten comparar throughput con y sin `--spec-type draft-mtp` en llama.cpp sobre el mismo modelo y prompt.
- Prototipos de chatbots de entretenimiento: desplegable en local con llama.cpp u Ollama usando Q4_K_M+MTP (el formato recomendado por el autor), sin dependencia de APIs externas.
- Experimentos de vision heredada: el `mmproj-F16.gguf` permite probar entrada de imagenes con la torre visual del base, aunque el efecto del fine-tune de personaje sobre esa modalidad no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa reportada es la perdida de evaluacion del entrenamiento (1,5085 en la epoca 1 y 1,5199 en la epoca 2). El autor incluye ocho ejemplos cualitativos de generalizacion sobre prompts factuales no vistos, con temperatura 0,9, pero no constituyen una evaluacion sistematica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en F16 (dato del autor para el archivo de referencia), en torno a 5-6 GB en Q4_K_M y por debajo de 3 GB en los formatos IQ1/IQ2 mas agresivos (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- GPU recomendadas: el entrenamiento se realizo en una RTX Pro 6000 Blackwell de 96 GB; para inferencia basta una GPU consumer con 8 GB o mas en cuantizaciones Q4, y 24 GB (RTX 3090, RTX 4090) permiten F16 o Q8_0 con contexto amplio.
- Cabe en GPU consumer: si, en tarjetas de 8-12 GB con cuantizaciones Q4 o inferiores; en 16-24 GB con Q5, Q6 y Q8_0.
- Opciones de despliegue: llama.cpp (build b11985 o superior para los GGUF con MTP), Ollama, y cualquier runtime compatible con GGUF; el adaptador LoRA y el fusionado bf16 pueden servirse con vLLM o TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede mejorar el throughput en los formatos que conservan la cabeza, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.5-9B-StupidChat-Uncensored | 9,2 B | no disponible | en | other | Fine-tune de personaje con LoRA r64; GGUF con y sin MTP |
| minas2025/Qwen-3.5-2B-StupidChat-Uncensored | no disponible (2B por nombre) | no disponible | en | no disponible | Version menor del mismo personaje: LoRA r24, 1 epoca |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9 B (por nombre) | no disponible | no disponible | no disponible | Modelo base sin el personaje StupidChat; incluye cabeza MTP |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La comparacion se limita a parametros, linaje y formato de publicacion.

## Limitaciones y advertencias

- El modelo esta disenado para producir razonamiento circular y respuestas factualmente incorrectas de forma deliberada; no debe usarse en ningun flujo que requiera precision.
- Riesgo alto de alucinacion por diseno: el personaje afirma respuestas erroneas con total seguridad, lo que puede confundir a usuarios no advertidos.
- Solo soporta ingles declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- La licencia es «other», no estandar, y no se detallan sus terminos en la informacion disponible; es imprescindible revisar el texto completo en el repositorio antes de cualquier uso comercial. El modelo base es un fine-tune «uncensored» de terceros, lo que anade incertidumbre sobre la cadena de licencias.
- El contenido no filtrado («uncensored») puede generar material ofensivo, sexual o inapropiado; requiere moderacion externa si se expone a usuarios.
- El autor advierte de un compromiso entre fuerza del personaje e inteligencia: a temperaturas bajas el modelo puede resultar demasiado coherente y romper la persona; se recomienda muestreo entre 0,8 y 1,1.
- Los formatos de 3 bits o menos no incluyen cabeza MTP y no admiten decodificacion especulativa; solo inferencia estandar.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, sin validacion independiente de la comunidad.
- El repositorio de 157,4 GB incluye multiples artefactos (LoRA, fusionado, GGUF); conviene descargar solo el archivo necesario para evitar consumo de disco y ancho de banda desproporcionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minas2025/Qwen-3.5-9B-StupidChat-Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/minas2025/StupidChat
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Version de 2B del mismo personaje: https://huggingface.co/minas2025/Qwen-3.5-2B-StupidChat-Uncensored
