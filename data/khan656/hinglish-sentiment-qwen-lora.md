# Khan656/hinglish-sentiment-qwen-lora

## Resumen
El modelo `Khan656/hinglish-sentiment-qwen-lora` es un adaptador LoRA entrenado sobre un modelo base Qwen3.5 de aproximadamente 2.200 millones de parametros, con la libreria Unsloth, para clasificar tuits en hinglish (texto code-mixed hindi-ingles) en tres categorias de sentimiento: positivo, negativo y neutro. Lo publica el usuario Khan656 en HuggingFace y su proposito es resolver la clasificacion de sentimiento en un registro linguistico mixto que los modelos entrenados solo en ingles o solo en hindi manejan con dificultad.

La relevancia del modelo reside en su tarea acotada y en las cifras que reporta su autor: sobre la particion de validacion alcanza un macro-F1 de 0,682 y sobre la de test un 0,674, frente a un 0,599 y un 0,609 de una linea base clasica de regresion logistica con n-gramas de caracteres TF-IDF. Se entrena exclusivamente sobre los ficheros de entrenamiento y validacion de SemEval-2020 Task 9 (SentiMix), con unos 16.700 tuits tras limpieza y deduplicacion, re-divididos 80/10/10 con semilla 42.

El repositorio ocupa 0,1 GB y contiene solo los pesos del adaptador, no el modelo base completo. Se distribuye en formato safetensors. No se declara licencia, por lo que su uso comercial queda sin definir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer Qwen3.5 (modelo base) |
| Parametros totales | No disponible. El modelo base es de ~2,2 mil millones de parametros; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el base; el adaptador se distribuye en safetensors |
| Idiomas soportados | Hindi (hi) e ingles (en); orientado a hinglish code-mixed |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
Se trata de un adaptador LoRA (rango 16 segun la configuracion reportada) acoplado a un modelo base Qwen3.5 de aproximadamente 2.200 millones de parametros. El entrenamiento se realizo con Unsloth, una libreria que optimiza el ajuste fino con bajo consumo de memoria. La cabecera de clasificacion se reentrena para producir tres etiquetas de sentimiento. No se detalla la composicion exacta de las capas objetivo del LoRA ni la configuracion de entrenamiento mas alla de lo indicado.

Los datos proceden de los ficheros de entrenamiento y validacion de SemEval-2020 Task 9 (SentiMix) en su version hinglish. Tras limpieza y deduplicacion quedan unos 16.700 tuits, que el autor redivide en 80/10/10 con semilla 42. La configuracion final reportada corresponde a 1 epoca con tasa de aprendizaje 2e-4 y rango LoRA 16; el autor indica que se evaluo el conjunto de test en cada ejecucion de entrenamiento y que la seleccion final se hizo principalmente sobre validacion. No se menciona uso de RLHF ni DPO, dado que es una tarea de clasificacion.

## Capacidades
- Clasificacion de sentimiento en tres clases (positivo, negativo, neutro) sobre texto hinglish code-mixed.
- Procesamiento de texto que mezcla hindi transliterado en alfabeto latino con ingles en un mismo enunciado.
- Inferencia sobre textos cortos tipo tuit, que es el dominio de entrenamiento.
- Capacidades generales del modelo base Qwen3.5 (generacion de texto, comprension linguistica) presentes de forma residual, aunque el adaptador esta especializado en clasificacion.
- Soporte de tool calling / function calling: no disponible para el adaptador (no es su proposito).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues adicionales fuera de hindi, ingles e hinglish: no disponibles.
- Capacidades especiales (vision, audio, modo pensamiento): no disponibles.

## Casos de uso
- Monitorizacion de marca en redes sociales: clasificar de forma automatica el sentimiento de menciones y respuestas de usuarios que escriben en hinglish, un registro muy comun en audiencias de India y diaspora, permitiendo agregar el tono de la conversacion a escala.
- Analisis de opinion de producto en comercio electronico: procesar resenas cortas y tuits de compradores indios que alternan hindi e ingles para etiquetar la polaridad y priorizar quejas negativas.
- Moderacion y triaje de atencion al cliente: enrutar mensajes entrantes segun su sentimiento hacia colas de soporte prioritario cuando el texto esta en hinglish.
- Investigacion en procesamiento de lenguaje code-mixed: servir como punto de comparacion reproducible (macro-F1 0,674 en test) frente a lineas base clasicas en estudios de sentiment analysis multilingue.
- Analitica de campanas de marketing digital: medir la reaccion emocional agregada a lanzamientos o anuncios dirigidos a publico que se comunica en hinglish.
- Senalizacion para sistemas de recomendacion o de gestion de comunidad: incorporar el sentimiento detectado en tuits como caracteristica auxiliar en pipelines que deciden que contenido promover o responder.
- Etiquetado asistido de corpus: pre-anotar grandes volumenes de tuits hinglish para revision humana posterior, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son de macro-F1 sobre el split propio del autor:

| Modelo | Validacion (macro-F1) | Test (macro-F1) |
|---|---|---|
| TF-IDF char n-gramas + regresion logistica | 0,599 | 0,609 |
| Este adaptador (1 epoca, lr 2e-4, r=16) | 0,682 | 0,674 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la informacion disponible. El autor advierte que su particion no coincide con la oficial de la competicion SemEval-2020 Task 9, por lo que las cifras no son directamente comparables con la tabla de clasificacion publicada del certamen.

## Requisitos de hardware
- El adaptador por si solo ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3.5 de ~2,2 mil millones de parametros para funcionar.
- VRAM estimada para el base (valores aproximados segun el numero de parametros declarado): unos 4,5 GB en precision FP16, en torno a 2,5 GB en cuantizacion de 8 bits y alrededor de 1,5 GB en 4 bits. Estas cifras no estan confirmadas por el autor y deben tratarse como estimaciones.
- GPU recomendadas (estimacion orientativa): cualquier GPU consumer con 6-8 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090) puede alojar el base cuantizado; para FP16 completo se recomienda al menos 8 GB.
- Si cabe en GPU consumer: previsiblemente si, en cuantizaciones de 4 u 8 bits, para un modelo base de este tamano.
- Opciones de despliegue: el adaptador puede cargarse con la libreria PEFT sobre el base en PyTorch, y el base admite despliegues con vLLM, llama.cpp, Ollama o TGI en funcion de las cuantizaciones disponibles del modelo Qwen3.5 original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5 + LoRA) | ~2,2B (base) | No disponible | 0,674 | No disponible | HuggingFace |
| TF-IDF char n-gramas + regresion logistica (linea base del autor) | No aplica | No aplica | 0,609 | No disponible | Referencia en la model card |

No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- La clase neutra es la mas debil, con una sensibilidad (recall) en torno al 58%; aproximadamente el 89% de los errores implican la clase neutra.
- Las etiquetas de SentiMix se generaron de forma semiautomatica, por lo que parte del ruido en los resultados proviene de anotaciones imprecisas del corpus original.
- Muchos tuits del corpus fuente estan truncados, lo que puede limitar la informacion disponible para clasificar correctamente.
- La particion de datos del autor difiere de la oficial de la competicion, de modo que las puntuaciones no son comparables con la tabla de clasificacion publicada de SemEval-2020 Task 9.
- Al ser un adaptador LoRA, requiere el modelo base Qwen3.5 adecuado; no funciona de forma autonoma.
- Su ambito esta restringido a clasificacion de sentimiento en texto corto hinglish; no debe emplearse como modelo generativo general ni para otras lenguas sin validacion previa.
- Riesgo de alucinacion y sesgos: no evaluado de forma especifica en la informacion disponible, aunque en una tarea de clasificacion el riesgo se manifiesta como etiquetas incorrectas mas que como texto inventado.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribucion ni atribucion.

## Enlaces
- HuggingFace: https://huggingface.co/Khan656/hinglish-sentiment-qwen-lora
- SemEval-2020 Task 9 (SentiMix): no disponible en la informacion proporcionada (corpus de origen de los datos)
- Unsloth (libreria de entrenamiento): no disponible en la informacion proporcionada
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada
