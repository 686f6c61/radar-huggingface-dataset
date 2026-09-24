# ai-ecoverse/jev-omni.js

## Resumen

jev-omni.js es una exportación lista para navegador del modelo Jev-Omni de akhilaaa3, un clasificador de decisión construido sobre Gemma 4 12B. El modelo recibe un estado, una pregunta y entre 2 y 256 opciones, y devuelve una probabilidad por opción en un único forward pass. La exportación la mantiene el usuario ai-ecoverse y se ejecuta en Chrome sobre WebGPU mediante la librería jev-omni.js, con soporte tanto de texto como de imágenes. Este repositorio contiene únicamente los pesos convertidos; el modelo, su entrenamiento, su cabeza de decisión y su formato de prompt pertenecen a Jev-Omni.

La pieza central es un decoder Gemma 4 de 12B al que se le ha retirado la LM head y se le ha acoplado una cabeza de decisión de 256 vías (36 MB en safetensors). Los pesos del decoder están cuantizados a int8 con MatMulNBits (block size 32) y activaciones fp32, con atención en fp16 en las 8 capas globales; el embedder y la proyección de visión van en fp32. El conjunto ocupa 13,58 GB repartidos en 445 archivos de 32 MB como máximo (el repositorio declara 4,4 GB de espacio, una cifra que no coincide con el desglose detallado del README).

Su relevancia es de nicho pero clara: demuestra que un clasificador de decisión multimodal de 12B puede ejecutarse íntegramente en el navegador a través de WebGPU, con una paridad casi exacta respecto a la implementación fp32 en PyTorch (0 respuestas cambiadas en 293 preguntas de texto y 1 en cada conjunto de visión). Es una referencia útil para quien quiera evaluar despliegues de inferencia local en cliente sin servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer Gemma 4 12B con cabeza de decision de 256 vias; export ONNX para WebGPU |
| Parametros totales | 12B (Gemma 4 12B) mas cabeza de decision; no se detalla el recuento exacto |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se mencionan prompts de hasta 9k tokens en las pruebas) |
| Tipos de cuantizacion | int8 en pesos (MatMulNBits, block size 32), activaciones fp32, atencion fp16 en las 8 capas globales; vision embedder y proyeccion en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (decoder en 437 archivos + vision), safetensors (cabeza de decision), tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura parte de google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7), un transformer decoder multimodal. Sobre esa base, Jev-Omni anade una cabeza de decision de 256 vias y elimina la LM head. El resultado es un clasificador puro: dado un `state`, una `question` y una lista de `options` (entre 2 y 256), produce una distribucion de probabilidad sobre las opciones en un solo paso hacia delante, sin generacion autoregresiva. La exportacion mantiene el embedder y la proyeccion de vision de Gemma 4 en fp32 (0,20 GB) para procesar tambien imagenes.

La conversion a ONNX se hizo con un borrador vendorizado del model builder de onnxruntime-genai con soporte de Gemma 4 (PR microsoft/onnxruntime-genai#2473, commit 603c36c), sin la LM head, seguido de reescrituras de grafo especificas para WebGPU y para la ruta de imagen. Los pesos proceden de `unified/model.safetensors` (bf16) y `head.pt` de akhilaaa3/Jev-Omni en la revision c050d51354147985d13286cf4acf90f562f2c631. No se detallan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de decision: dado un estado y una pregunta con entre 2 y 256 opciones, devuelve una probabilidad por opcion en un unico forward pass.
- Entrada multimodal: procesa tanto texto como imagenes gracias al embedder y la proyeccion de vision de Gemma 4.
- Atribucion de probabilidad calibrada: las diferencias medias de probabilidad frente a la referencia fp32 son de 0,0019 (texto) y 0,0014-0,0037 (vision), lo que indica que las probabilidades son comparables a las del modelo original.
- Inferencia en navegador: se ejecuta en Chrome sobre WebGPU mediante onnxruntime-web, sin backend servidor.
- Cache de modelo: jev-omni.js conserva los 13,6 GB en Cache Storage, de modo que las cargas posteriores se leen de disco.
- Tool calling, function calling y comportamiento de agente: no disponibles en la informacion proporcionada (es un clasificador, no un generador de texto).
- Capacidades multilingues: no disponibles.
- Modo de razonamiento o "thinking": no disponible.

## Casos de uso

- Clasificacion de intencion en cliente: en una aplicacion web se puede ejecutar el modelo en el navegador del propio usuario para clasificar una consulta entre un conjunto acotado de intenciones, evitando enviar el texto a un servidor.
- Enrutado de decisiones condicionales: dado un estado textual ("la reunion empieza a las 10:00, ahora son las 9:00") y una pregunta binaria, devuelve la probabilidad de "Si" o "No", util para arboles de decision automatizados.
- Verificacion de afirmaciones contra opciones predefinidas: se plantea una afirmacion y un conjunto de etiquetas, y el modelo asigna probabilidad a cada una, lo que permite umbrales de confianza ajustables.
- Clasificacion de imagenes en el navegador: con preguntas sobre imagenes (por ejemplo, categorizar el contenido visible entre varias etiquetas) y sin salir del cliente, en los conjuntos de prueba alcanza 85-98% de acierto segun el set.
- Demos interactivas y evaluacion sin infraestructura: el repositorio incluye una demo en vivo, lo que permite probar el modelo en una pagina web con WebGPU sin montar servidor ni GPU en la nube.
- Prototipado de clasificadores de decision multimodales: sirve como plantilla para exportar un modelo Gemma 4 propio a ONNX con cabeza de clasificacion y ejecutarlo en navegador.
- Filtrado previo de opciones en pipelines: al devolver una distribucion completa sobre hasta 256 opciones, puede usarse como primera etapa de un sistema mayor que solo procese las opciones con probabilidad superior a un umbral.

## Benchmarks y rendimiento

Paridad declarada frente al modelo Jev-Omni en fp32 PyTorch, medida en Chrome sobre WebGPU (Apple M4 Max):

| Conjunto | Precision navegador / referencia | Respuestas cambiadas | Diferencia media / maxima de probabilidad |
|---|---|---|---|
| DecisionBench medium, 293 preguntas de texto | 86,35% / 86,35% | 0 | 0,0019 / 0,131 |
| kev.js vision-v1, 106 preguntas de imagen | 98,11% / 99,06% | 1 | 0,0014 / 0,065 |
| kev.js vision-v2, 128 preguntas de imagen | 85,16% / 85,16% | 1 | 0,0037 / 0,065 |

Adicionalmente, la exportacion sin cuantizar (6 capas en fp32) coincide con PyTorch con un error relativo de 5,0e-06 en la ultima posicion. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GB de memoria de GPU para la sesion WebGPU; durante la carga, la pestana mantiene ademas los 13,6 GB de archivos en memoria antes de transferirlos a la GPU.
- Memoria unificada en Apple Silicon: 32 GB como minimo y 64 GB o mas para mayor comodidad; solo se ha probado en un Apple M4 Max con 128 GB.
- GPU de escritorio: no se documentan pruebas con A100, H100 o RTX 4090; el destino declarado es WebGPU en Chrome.
- Cabe en GPU de consumo: no confirmado; los 16 GB de memoria de sesion exceden la VRAM de muchas GPU de consumo, aunque encajarian en modelos con 16-24 GB si WebGPU las expone correctamente.
- Opciones de despliegue: onnxruntime-web sobre WebGPU, a traves de la libreria jev-omni.js; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI (el formato ONNX con cabeza de clasificacion se aparta del uso generativo habitual de esas herramientas).
- Version de runtime: onnxruntime-web pre-release 1.31.0-dev.20260918-bc8e7ed75 o posterior; los prompts de mas de 2,8k tokens requieren la flash attention de ventana deslizante de onnxruntime PR #32462, ausente en 1.30.
- Descarga inicial: 13,6 GB en la primera carga.
- Latencia (M4 Max): 1,2-1,6 s por pregunta de imagen; unos 7 s para una pregunta de texto de menos de 2k tokens; hasta 57 s con 9k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-omni.js (esta ficha) | 12B (Gemma 4) | no disponible | 86,35% texto / 85,16-98,11% vision (paridad con fp32) | Apache-2.0 | HuggingFace, ONNX, ejecucion en navegador |
| Jev-Omni (akhilaaa3/Jev-Omni) | 12B (Gemma 4) | no disponible | referencia fp32 del anterior | Apache-2.0 | HuggingFace, safetensors bf16 + head.pt |
| google/gemma-4-12B-it | 12B | no disponible | no disponible | Apache-2.0 | HuggingFace, modelo base generativo |

No se dispone de datos sobre otros clasificadores de decision comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no produce texto libre, codigo ni razonamiento encadenado; su salida es una distribucion sobre las opciones proporcionadas.
- Riesgo de alucinacion: menor que en un modelo generativo, pero persiste el riesgo de asignar alta probabilidad a una opcion incorrecta cuando el estado o la pregunta son ambiguos.
- Sesgos: no disponibles; al derivar de Gemma 4, hereda los sesgos no documentados en la informacion proporcionada.
- Cobertura de idiomas: no disponible.
- Longitud de contexto: no disponible; se observa un aumento fuerte de latencia con la longitud del prompt (de 7 s a 57 s al pasar de menos de 2k a 9k tokens), lo que penaliza contextos largos.
- Requisitos de memoria muy altos para ejecucion en navegador: 16 GB de memoria de GPU y, en Apple Silicon, un minimo practico de 32 GB de memoria unificada (64 GB recomendado).
- Dependencia de una version pre-release de onnxruntime-web, con riesgo de inestabilidad o cambios de API.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base google/gemma-4-12B-it y de Jev-Omni de forma independiente.
- Solo probado en un Apple M4 Max con 128 GB, lo que limita la extrapolacion de rendimiento y compatibilidad a otros equipos.
- Discrepancia de tamanos: el repositorio declara 4,4 GB mientras que el desglose del README suma 13,58 GB en 445 archivos; conviene confirmar el espacio real antes de desplegar.
- Jev-Omni declara ser independiente de TypeSafe AI's Jev; este repositorio mantiene la misma independencia.

## Enlaces

- HuggingFace: https://huggingface.co/ai-ecoverse/jev-omni.js
- Modelo base Jev-Omni: https://huggingface.co/akhilaaa3/Jev-Omni
- Modelo base Gemma 4: https://huggingface.co/google/gemma-4-12B-it
- Repositorio jev-omni.js: https://github.com/ai-ecoverse/jev-omni.js
- Documentacion de la exportacion: https://github.com/ai-ecoverse/jev-omni.js/tree/main/docs
- Demo en vivo: https://ai-ecoverse.github.io/jev-omni.js/
- Pull request de onnxruntime-genai con soporte de Gemma 4: https://github.com/microsoft/onnxruntime-genai/pull/2473
