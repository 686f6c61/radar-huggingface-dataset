# carreect/prueba_1

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo visión-lenguaje desarrollado por el equipo Qwen (Alibaba). Se trata de la version instruct del modelo de 7.000 millones de parametros de la familia Qwen2.5-VL, que incluye variantes de 3B, 7B y 72B. El modelo combina un codificador visual ViT con un LLM basado en la arquitectura Qwen2.5 para resolver tareas de comprension de imagenes y video, generacion de texto a partir de entradas visuales y ejecucion de tareas agenticas sobre interfaces graficas.

La propuesta diferencial de esta version es su capacidad para actuar como agente visual: razona sobre capturas de pantalla, localiza elementos mediante bounding boxes o puntos y genera salidas estructuradas en JSON. Ademas, incorpora entrenamiento con resolucion dinamica y muestreo dinamico de FPS para video, lo que le permite procesar videos de mas de una hora y localizar eventos concretos en el tiempo.

El repositorio publicado bajo el identificador `carreect/prueba_1` contiene los pesos en formato safetensors con un total de 8.292.166.656 parametros y un tamano de repositorio de 16,6 GB. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, y esta pensado para integrarse en el ecosistema Transformers y Text Generation Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT con window attention + LLM Qwen2.5) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un codificador visual ViT y un LLM Qwen2.5. El ViT incorpora window attention para acelerar tanto el entrenamiento como la inferencia, y se ha optimizado con SwiGLU y RMSNorm para alinear su estructura con la del LLM. Para el procesamiento de video, se adopta muestreo dinamico de FPS y se actualiza el mRoPE en la dimension temporal con IDs y alineacion de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y velocidades, y localizar momentos concretos dentro de un video.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Se mencionan tres tam anos (3B, 7B y 72B), siendo este repositorio la variante instruct de 7B. Las innovaciones tecnicas destacadas son la resolucion dinamica extendida a la dimension temporal, el codificador visual eficiente y la capacidad de localizacion visual en distintos formatos (bounding boxes y puntos) con salidas JSON estables.

## Capacidades

- Comprension visual de objetos comunes (flores, aves, peces, insectos) y de contenido complejo como textos, graficos, iconos y layouts dentro de imagenes.
- Analisis de documentos: OCR, facturas, formularios, tablas y graficos, con generacion de salidas estructuradas.
- Comprension de video de mas de una hora, incluyendo la localizacion de segmentos relevantes.
- Localizacion visual mediante bounding boxes o puntos, con salida JSON estable de coordenadas y atributos.
- Comportamiento agentico: uso de ordenador y de telefono, razonamiento y direccion dinamica de herramientas.
- Generacion de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Soporte multilingue limitado al ingles segun los metadatos del repositorio.
- Integracion con Transformers y Text Generation Inference, con endpoints compatibles.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo puede extraer el contenido de escaneos y devolver salidas estructuradas en JSON, lo que simplifica su integracion en flujos financieros y comerciales.
- Automatizacion de atencion al cliente con soporte visual: permite interpretar capturas de pantalla o imagenes enviadas por el usuario y responder en conversaciones multi-turno.
- Agentes de automatizacion de interfaz grafica: gracias a su capacidad de localizacion visual y a sus resultados en ScreenSpot y Android Control, puede dirigir acciones sobre elementos de pantalla en tareas de computer use y phone use.
- Analisis de documentos tecnicos y graficos: con resultados destacados en DocVQA, InfoVQA y ChartQA, es adecuado para extraer informacion de informes, diagramas y tablas.
- Procesamiento de video para monitorizacion o analisis de contenido: su comprension de videos de mas de una hora y la localizacion temporal de eventos permiten resumir o buscar momentos concretos en grabaciones.
- Verificacion de calidad en pipelines de datos visuales: la generacion de coordenadas y atributos en JSON facilita la validacion automatica de anotaciones y la deteccion de discrepancias.
- Asistencia en tareas educativas o de investigacion que requieran interpretar figuras, ecuaciones o diagramas, apoyandose en sus resultados en MathVista y MathVision.

## Benchmarks y rendimiento

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro (val) | 34,3 | no disponible | 37,6 | 30,5 | 41,0 |
| DocVQA (test) | 93 | 93 | no disponible | 94,5 | 95,7 |
| InfoVQA (test) | 77,6 | no disponible | no disponible | 76,5 | 82,6 |
| ChartQA (test) | 84,8 | no disponible | no disponible | 83,0 | 87,3 |
| TextVQA (val) | 79,1 | 80,1 | no disponible | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | no disponible | no disponible | 61,6 | 77,8 |
| MMStar | 62,8 | no disponible | no disponible | 60,7 | 63,9 |
| MMBench-V1.1-En (test) | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench (test) | no disponible | no disponible | no disponible | 63,7 | 63,6 |
| MMVet (GPT-4-Turbo) | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench (avg) | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista (testmini) | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | no disponible | no disponible | no disponible | 16,3 | 25,07 |

| Benchmark de video | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest (test) | 66,9 | 70,5 |
| Video-MME (sin/con subtitulos) | 63,3 / 69,0 | 65,1 / 71,6 |
| LVBench | no disponible | 45,3 |
| LongVideoBench | no disponible | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | no disponible | 71,7 |
| MLVU | no disponible | 70,2 |
| CharadesSTA/mIoU | no disponible | 43,6 |

| Benchmark de agente | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 8,29 mil millones de parametros en precision FP16 requiere aproximadamente 16,6 GB solo para los pesos, a los que hay que sumar el coste del codificador visual y las activaciones.
- GPU recomendadas: no se detallan en la informacion proporcionada. Por tamano, cabria esperar que una GPU con 24 GB o mas de memoria pueda alojar los pesos en FP16, aunque este dato no esta confirmado en la model card.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: Transformers (con `qwen-vl-utils[decord]` para carga de video) y Text Generation Inference, segun los metadatos del repositorio. No se mencionan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B | 8,29B | no disponible | 58,6 | 95,7 | Apache 2.0 | HuggingFace |
| InternVL2.5-8B | no disponible | no disponible | 56 | 93 | no disponible | no disponible |
| MiniCPM-o 2.6 | no disponible | no disponible | 50,4 | 93 | no disponible | no disponible |
| GPT-4o-mini | no disponible | no disponible | 60 | no disponible | propietaria | API |

## Limitaciones y advertencias

- El unico idioma declarado en los metadatos es el ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- No se detalla la longitud de contexto soportada, lo que dificulta planificar despliegues con entradas muy largas.
- Riesgo de alucinacion inherente a los modelos generativos multimodales, especialmente en la interpretacion de documentos densos o graficos complejos.
- Los resultados en tareas agenticas de alta dificultad (ScreenSpot Pro 29,0; AndroidWorld_SR 25,5) indican margen de mejora en entornos reales.
- La model card no especifica sesgos conocidos, composicion del dataset ni procesos de alineacion, lo que limita la evaluacion de riesgos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las dependencias (Transformers, qwen-vl-utils, decord) y sus propias licencias antes de desplegar en produccion.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad sobre esta copia concreta de los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/carreect/prueba_1
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Chat de Qwen: https://chat.qwenlm.ai/
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
