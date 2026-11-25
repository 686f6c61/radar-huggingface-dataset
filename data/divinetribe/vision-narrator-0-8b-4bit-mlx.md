# divinetribe/Vision-Narrator-0.8B-4bit-mlx

## Resumen

Vision Narrator 0.8B (4-bit MLX) es un modelo de lenguaje y visión (VLM) de pequeno tamano desarrollado por divinetribe, un fine-tune del modelo base Qwen/Qwen3.5-0.8B. Su proposito es asistir a personas ciegas y con baja vision respondiendo preguntas sobre imagenes capturadas con la camara de un telefono, con especial enfasis en el conjunto de datos VizWiz, que recoge preguntas reales formuladas por usuarios con discapacidad visual. El modelo esta disenado para ejecutarse completamente offline en dispositivos moviles, incluyendo telefonos de gama alta de 2022 como el iPhone 14 Pro Max.

La version v09 del modelo introduce una mejora sustancial en el formato de respuesta: prioriza la respuesta directa a la pregunta (si/no, un numero, un color, un nombre) antes de anyadir contexto descriptivo, en lugar de generar una descripcion generica de la escena. Esta orientacion practica lo diferencia de captioners genericos y lo hace util para tareas concretas como leer una factura, comprobar si una luz esta encendida o identificar el remitente de una carta.

El modelo tiene 852.985.920 parametros (aproximadamente 0,85B), se distribuye en formato MLX con cuantizacion de 4 bits para la torre de lenguaje (el componente de vision permanece en precision completa) y cuenta con licencia Apache 2.0. Su ventana de contexto y otros detalles tecnicos no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5), torre de vision en precision completa, torre de lenguaje cuantizada a 4 bits affine con group size 64 |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) para la torre de lenguaje; torre de vision en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura vision-language basada en Qwen3.5-0.8B, con una torre de vision que procesa la imagen y una torre de lenguaje que genera la respuesta. La torre de lenguaje esta cuantizada a 4 bits con cuantizacion affine y group size 64, mientras que la torre de vision se mantiene en precision completa. Segun la model card, comprimir la torre de vision degrada la precision en la lectura de importes monetarios: con vision a 8 bits la exactitud cae al 96,2% y con vision a 4 bits al 91,5%, por lo que el autor decidio no cuantizarla.

El entrenamiento se realizo mediante fine-tuning del modelo base (probablemente con LoRA, segun las etiquetas del repositorio) sobre el conjunto de datos VizWiz VQA, que contiene preguntas formuladas por personas ciegas sobre fotografias tomadas por ellas mismas. La version v09 se reentreno especificamente para que el modelo responda primero la pregunta y despues anyada contexto, corrigiendo el comportamiento de versiones anteriores que describian la imagen completa independientemente de la pregunta. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-to-text) y respuesta a preguntas visuales (VQA) en ingles.
- Respuesta directa y priorizada: el modelo esta entrenado para empezar la respuesta con la informacion solicitada (si/no, un numero, un color, un nombre) y solo despues anyadir contexto.
- Descripcion de escenas con orientacion espacial ("a tu izquierda", "justo delante").
- Lectura de documentos: facturas, cartas y pantallas, incluyendo importes y fechas.
- Deteccion de imagenes no legibles o de baja calidad, con indicacion de que no puede determinar la respuesta y sugerencia de accion correctiva (por ejemplo, "la foto esta demasiado oscura, anade luz").
- Capacidad de indicar incertidumbre en lugar de inventar respuestas plausibles, entrenada explicitamente para el publico objetivo.
- Ejecucion offline en dispositivo (on-device) en Apple Silicon, iOS y Android.
- No se menciona soporte de tool calling, function calling, agentes multi-paso, vision de video, audio ni modo thinking.

## Casos de uso

- Asistencia a personas ciegas o con baja vision: el modelo responde en una frase corta a preguntas como "esta encendida la luz?" o "esta llena la taza?", priorizando la respuesta directa para que pueda ser leida en voz alta por el telefono. Es adecuado por su tamano reducido y su capacidad de ejecucion offline.
- Lectura de facturas y correspondencia: el modelo identifica el tipo de documento, el remitente, el importe y las consecuencias de no pagar, como se muestra en los ejemplos de la model card ("factura de servicios de 81,13 dolares, vence el 8 de octubre de 2026").
- Comprobacion de estado de electrodomesticos: preguntas sobre si un piloto esta encendido, si un deposito esta lleno o si un aparato esta en funcionamiento, con respuestas concretas y verificables.
- Descripcion de entornos para navegacion: el modelo describe la posicion relativa de objetos ("una persona con pantalones morados esta tumbada a tu izquierda"), util para orientacion en interiores.
- Deteccion de fotos defectuosas: cuando la imagen esta borrosa, oscura o recortada, el modelo lo indica y sugiere como repetir la captura, evitando respuestas erroneas.
- Aplicaciones de accesibilidad movil integradas: al ejecutarse en MLX y estar disenado para iPhone y Android, puede integrarse en apps de camara asistiva como RealTime AI Cam, sin necesidad de conexion a internet ni de enviar imagenes a servidores externos.
- Evaluacion de calidad de imagen en pipelines de captura: el modelo puede actuar como filtro que detecta capturas no aptas para OCR o lectura automatica antes de procesarlas con otros sistemas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la evaluacion interna sobre 295 preguntas de VizWiz cuyas imagenes se mantuvieron fuera del entrenamiento, con la metrica estandar de VizWiz (acuerdo con 10 respuestas humanas):

| Metrica | v08 | v09 |
|---|---|---|
| Exactitud global | 46,1% | 66,4% |
| Preguntas de si/no | 10,9% | 62,5% |
| Preguntas numericas | 47,3% | 61,3% |
| Otras preguntas | 50,2% | 60,7% |
| Acierta al decir "no puedo saberlo" en fotos no respondibles | 78,0% | 92,0% |
| Coloca la respuesta primero | 34,6% | 65,8% |

Ademas, en la prueba de descripcion de escenas el modelo acerto 192 de 200 hechos (frente a 194 de 200 en v08). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB y el modelo en 4 bits pesa aproximadamente 620 MB, por lo que la inferencia cabe en menos de 1 GB de memoria, aunque el runtime MLX y el procesador de vision anaden overhead.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) mediante MLX; el autor lo probo en un iPhone 14 Pro Max. No se mencionan GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y en telefonos de gama alta; no se dispone de datos para GPU NVIDIA de consumo.
- Opciones de despliegue: libreria MLX (mlx-vlm) para Apple Silicon; integracion en apps iOS y Android mediante el proyecto RealTimeAICam. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Vision Narrator 0.8B (4-bit MLX) | 0,85B | No disponible | Ingles | Apache 2.0 | VQA accesible on-device, VizWiz |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Multilingue (segun modelo base) | Apache 2.0 | Modelo de lenguaje base, sin vision |
| Modelos VLM genericos de ~1B | No disponible | No disponible | Variable | Variable | Descripcion de imagenes generica |

No se dispone de datos de benchmarks comparativos con otros modelos VLM de tamano similar en la informacion proporcionada. La comparativa se limita a la relacion con su modelo base y a la categoria funcional.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- La exactitud global en VizWiz es del 66,4%, lo que implica que aproximadamente un tercio de las respuestas no coinciden con el consenso humano; no es adecuado como unica fuente para decisiones criticas.
- Debilidad conocida en indicadores de direccion de ascensores: el modelo suele responder que no puede determinarlo; el autor recomienda preguntar por la flecha iluminada en su lugar.
- Riesgo de alucinacion en imagenes de baja calidad, aunque el modelo esta entrenado para indicar incertidumbre; aun asi, puede generar descripciones plausibles pero incorrectas.
- La cuantizacion de la torre de vision degrada la precision en la lectura de importes (96,2% con 8 bits, 91,5% con 4 bits), por lo que el autor mantiene esa torre en precision completa.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B y de los datos de VizWiz.
- No se dispone de informacion sobre sesgos demograficos, geograficos o culturales del modelo.
- El modelo esta disenado para ejecucion on-device en Apple Silicon; su despliegue en otros entornos no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Vision-Narrator-0.8B-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto RealTimeAICam: https://github.com/nicedreamzapp/RealTimeAICam
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- App Store (iPhone): https://apps.apple.com/us/app/realtime-ai-cam/id6751230739
- Google Play (Android): https://play.google.com/store/apps/details?id=com.mattmacosko.realtimeaicam
- Dataset VizWiz VQA: https://vizwiz.org/tasks-and-datasets/vqa/
- Paper VizWiz (arXiv:1802.08218): https://arxiv.org/abs/1802.08218
- Paper VizWiz (arXiv:2002.08565): https://arxiv.org/abs/2002.08565
