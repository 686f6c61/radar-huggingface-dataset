# mkenfenheuer/evora-qwen3-1.7b-v2-GGUF

## Resumen

Evora on-device text model (Qwen3-1.7B, v2) es un ajuste fino del modelo base Qwen/Qwen3-1.7B publicado por el usuario mkenfenheuer en HuggingFace bajo el identificador mkenfenheuer/evora-qwen3-1.7b-v2-GGUF. Se distribuye exclusivamente en formato GGUF, pensado para ejecucion local mediante llama.cpp y para despliegue en dispositivo (on-device), y sus etiquetas declaradas apuntan a un dominio concreto: nutricion y coaching. El repositorio ocupa 1,1 GB y el modelo cuenta con 1.720.574.976 parametros (1,72 mil millones), coherente con el modelo base del que deriva.

La relevancia de esta publicacion es limitada pero identificable: se trata de un ejemplo de ajuste de un modelo pequeno de la familia Qwen3 orientado a un vertical especifico (asesoria nutricional y acompanamiento tipo coaching) y empaquetado para inferencia en hardware de consumo, sin necesidad de GPU de centro de datos. Frente a alternativas generalistas del mismo tamano, la propuesta es la especializacion de dominio y la portabilidad del formato GGUF.

Conviene senalar desde el principio que la model card publicada esta practicamente vacia: el autor indica que la ficha completa (formato de prompt, ejemplos y evaluacion) se publicara mas adelante. En la fecha de los datos disponibles el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria ni evidencia publica de rendimiento. Toda la informacion tecnica adicional que no aparece aqui debe considerarse no disponible, no confirmada o heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; hereda la arquitectura del modelo base Qwen/Qwen3-1.7B (familia Qwen3) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (no confirmada por el autor para este ajuste) |
| Tipos de cuantizacion | No especificados. El repositorio es GGUF para llama.cpp y ocupa 1,1 GB, lo que sugiere una o pocas variantes cuantizadas, pero los niveles concretos no se detallan |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). No se publican safetensors del ajuste en este repositorio |

Datos adicionales: identificador mkenfenheuer/evora-qwen3-1.7b-v2-GGUF, autor mkenfenheuer, tamano del repositorio 1,1 GB, fecha de creacion 2026-09-26, ultima actualizacion 2026-09-26, 0 descargas y 0 likes. Etiquetas declaradas: gguf, llama.cpp, evora, nutrition, coaching, on-device, de, en, base_model:Qwen/Qwen3-1.7B, base_model:quantized:Qwen/Qwen3-1.7B, license:apache-2.0, endpoints_compatible, conversational.

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de arquitectura propios de este ajuste. Lo unico verificable es que se trata de un derivado cuantizado de Qwen/Qwen3-1.7B, un modelo denso de 1,72 mil millones de parametros, y que la salida publicada es un artefacto GGUF. No se documentan en la model card el numero de capas, la configuracion de atencion, el tipo de tokenizador ni la ventana de contexto efectiva tras el ajuste.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizado, la composicion del dataset (aunque las etiquetas nutrition y coaching sugieren un corpus de dominio en aleman e ingles), si hubo aprendizaje supervisado, RLHF, DPO u otra etapa de alineamiento, y si se aplicaron tecnicas como LoRA, QLoRA o ajuste completo. La model card indica explicitamente que el formato de prompt, los ejemplos y la evaluacion se publicaran "shortly" (en breve), por lo que a fecha de los datos disponibles no existe informacion tecnica que permita reproducir o auditar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en aleman e ingles, segun los idiomas declarados en la model card y la etiqueta conversational.
- Especializacion declarada en dos dominios: nutricion (nutrition) y acompanamiento tipo coaching (coaching).
- Inferencia local en dispositivo (on-device) mediante llama.cpp, con pesos en formato GGUF.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible), lo que sugiere que el artefacto puede servirse desde infraestructura compatible con la API de HuggingFace.
- Capacidades heredadas del modelo base Qwen/Qwen3-1.7B (razonamiento general, codigo, matematicas): no confirmadas ni evaluadas por el autor en este ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking o decodificacion especulativa: no disponible en la informacion proporcionada.
- Multilingue mas alla de aleman e ingles: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente nutricional embebido en una aplicacion movil: el modelo puede mantener conversaciones multi-turno sobre habitos alimenticios, sugerencias de comidas y seguimiento de objetivos, ejecutandose en el propio dispositivo gracias al formato GGUF y a los 1,72 B de parametros, lo que evita enviar datos de salud a un servidor externo.
- Coaching de habitos en alemán e inglés: al estar ajustado sobre un corpus de dominio (segun las etiquetas nutrition y coaching) y declarar ambos idiomas, encaja en productos de acompanamiento personalizado para usuarios de Alemania, Austria, Suiza o mercados angloparlantes.
- Diario de comidas con resumen conversacional: integrado en una app de registro, el modelo puede reescribir entradas crudas del usuario en resumenes estructurados y responder preguntas sobre la semana, siempre que la ventana de contexto configurada lo permita.
- Procesamiento offline en entornos sin conectividad: en clinicas, gimnasios o zonas rurales, un asistente local basado en llama.cpp puede funcionar sin acceso a Internet, algo relevante cuando hay restricciones de red o de privacidad.
- Prototipado rapido de productos de nicho: por su tamano (1,1 GB en el repositorio) y licencia Apache 2.0, sirve para validar hipotesis de producto de un vertical concreto antes de invertir en modelos mayores.
- Clasificacion y etiquetado ligero de texto en aleman: tareas de categorizacion de consultas, deteccion de temas o enrutado de peticiones dentro de un pipeline mayor, aprovechando el coste reducido de inferencia de un modelo de 1,72 B.
- Educacion nutricional en chatbots de bajo coste: desplegado con llama.cpp sobre CPU o GPU de gama media, permite ofrecer respuestas informativas a gran volumen de usuarios con un coste por consulta minimo.
- Filtrado previo en una arquitectura de dos niveles: usar este modelo como primera capa para resolver consultas simples y escalar a un modelo mayor solo las complejas, reduciendo latencia y coste agregados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion se publicara mas adelante, y en el momento de los datos recogidos el repositorio no incluye tabla de metricas (MMLU, HumanEval, GSM8K ni equivalentes), ni comparaciones con el modelo base Qwen/Qwen3-1.7B.

## Requisitos de hardware

- El repositorio ocupa 1,1 GB, lo que corresponde a pesos GGUF cuantizados; los niveles exactos no estan documentados.
- Estimacion orientativa de peso de los pesos segun cuantizacion, derivada del numero de parametros (1,72 B) y no confirmada por el autor: aproximadamente 3,4 GB en FP16, 1,8 GB en Q8_0, 1,2-1,3 GB en Q5_K_M y 1,0-1,1 GB en Q4_K_M.
- VRAM estimada para inferencia: en torno a 1-2 GB con cuantizaciones de 4-5 bits a contextos cortos, mas el cache KV correspondiente a la longitud de contexto configurada, que puede anadir desde cientos de MB hasta varios GB si se trabaja a contextos largos.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM con cuantizaciones agresivas. Tambien es viable en CPU moderna (x86 con AVX2/AVX-512 o Apple Silicon mediante Metal).
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, kobold.cpp), servidor llama.cpp con API compatible con OpenAI, y plataformas que consumen GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con HuggingFace Inference Endpoints. vLLM y TGI no son el objetivo principal de un artefacto GGUF, aunque pueden servir el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de evaluacion del modelo ajustado, por lo que la comparacion se limita a caracteristicas verificables (tamano, licencia, disponibilidad).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| evora-qwen3-1.7b-v2 (este modelo) | 1,72 B | No disponible | Apache 2.0 | GGUF en HuggingFace, 0 descargas | Ajuste de dominio (nutricion/coaching), aleman e ingles, sin evaluacion publicada |
| Qwen/Qwen3-1.7B (modelo base) | 1,72 B | No disponible en esta informacion | Apache 2.0 | Ampliamente disponible | Modelo generalista del que deriva; sirve como referencia de capacidades heredadas |
| Llama 3.2 1B Instruct | 1,24 B | No disponible en esta informacion | Licencia comunitaria de Meta | Ampliamente disponible | Alternativa generalista de tamano comparable para inferencia local |
| SmolLM2 1.7B Instruct | 1,71 B | No disponible en esta informacion | Apache 2.0 | Ampliamente disponible | Alternativa generalista de tamano casi identico orientada a dispositivo |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de estas alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card incompleta: el autor indica que la ficha completa, el formato de prompt, los ejemplos y la evaluacion se publicaran mas adelante. Sin esa informacion no se puede reproducir el comportamiento esperado del modelo.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de los datos. No hay evidencia externa de calidad, estabilidad ni utilidad real.
- Sin benchmarks publicados: no existen metricas verificables de rendimiento.
- Riesgo de alucinacion: es un modelo de 1,72 B de parametros en un dominio sensible (nutricion y salud). No debe utilizarse como sustituto de consejo medico, dietetico o clinico profesional.
- Sesgos: no documentados por el autor. Un ajuste de dominio sobre corpus no especificado puede incorporar sesgos culturales, alimentarios o de genero no auditados.
- Idioma: solo se declaran aleman e ingles. No hay soporte confirmado de castellano ni de otras lenguas, por lo que su uso en productos en espanol requeriria validacion previa.
- Limitaciones de contexto: la longitud de contexto efectiva del ajuste no esta documentada; asumir la del modelo base sin verificacion puede provocar degradacion en conversaciones largas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero no exime de las obligaciones derivadas de la licencia del modelo base ni de la normativa aplicable a datos personales de salud (RGPD) si se tratan datos de usuarios.
- Trazabilidad del ajuste: al no documentarse el dataset ni el metodo de entrenamiento, no es posible evaluar riesgos de contaminacion, sobreajuste al dominio ni cumplimiento normativo en un entorno de produccion regulado.
- Distribucion en GGUF unicamente: no se publican pesos en safetensors del ajuste, lo que limita el uso de frameworks de entrenamiento o fine-tuning adicional que no acepten GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkenfenheuer/evora-qwen3-1.7b-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio o demo del ajuste: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con la ficha y se han descartado.
