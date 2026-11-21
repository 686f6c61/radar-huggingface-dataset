# darkmaniac7/Qwen3.5-4B-MNN

## Resumen
Qwen3.5-4B-MNN es un paquete de inferencia en formato MNN del modelo Qwen3.5-4B de Alibaba, cuantizado a 4 bits y preparado para ejecutarse en dispositivos moviles Android mediante la aplicacion TokForge. El repositorio, publicado por el usuario darkmaniac7, replica el bundle original de taobao-mnn y anade una cabeza opcional de prediccion multi-token (MTP) para acelerar la decodificacion en la ruta de CPU. El modelo base es un modelo vision-lenguaje de 4.000 millones de parametros que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa, y que procesa tanto texto como imagenes.

La relevancia de esta ficha radica en que ejemplifica el despliegue de un modelo multimodal de tamano medio directamente en telefonos de gama alta, sin conexion a red una vez descargado el paquete. El bundle ocupa 2,97 GB distribuidos en 12 ficheros y esta pensado para telefonos con 8 GB de RAM o mas. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque el formato MNN y la integracion con TokForge condicionan el ecosistema de herramientas disponible.

El modelo conserva las capacidades del Qwen3.5 original: cobertura de 201 idiomas y dialectos, contexto de 262.144 tokens y un modo de razonamiento previo a la respuesta activado por defecto. La cuantizacion a 4 bits con bloques de 64 y HQQ reduce el peso a aproximadamente 2,63 GB de pesos del decodificador, mas 197 MB del codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (32 capas: 24 Gated DeltaNet + 8 atencion completa) con codificador visual |
| Parametros totales | 4B (4.000 millones, cuantizados a 4 bits) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo original |
| Tipos de cuantizacion | 4 bits, tamano de bloque 64, HQQ |
| Idiomas soportados | 201 idiomas y dialectos (segun model card); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (llm.mnn, llm.mnn.weight, visual.mnn, visual.mnn.weight, mtp-v32k.mnn) |
| Vocabulario | 248.320 tokens |
| Tamano del repositorio | 3,0 GB (12 ficheros) |
| Libreria de inferencia | MNN (taobao-mnn) |
| Plataforma objetivo | Android (CPU); packs NPU opcionales para Snapdragon 8 Elite Gen 5, 8 Elite y 8 Gen 3 |
| RAM recomendada | 8 GB o mas |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-4B emplea una arquitectura hibrida de 32 capas en la que 24 son Gated DeltaNet (atencion lineal) y 8 son de atencion completa. Esta mezcla reduce el coste computacional y de memoria del contexto largo frente a un transformer de atencion completa puro, lo que resulta critico para ejecutar ventanas de hasta 262.144 tokens en hardware movil. El modelo incorpora ademas un codificador visual que permite entrada image-text-to-text, con un grafo y pesos separados (visual.mnn de 488 KB y visual.mnn.weight de 197 MB).

El bundle MNN ha sido exportado por el equipo taobao-mnn con cuantizacion de 4 bits, bloques de 64 y el algoritmo HQQ. El repositorio de darkmaniac7 mantiene los ficheros del tronco byte a byte identicos al original (mismos hashes SHA-256) y solo modifica config.json para anadir `"dynamic_option": 2`, que activa la cuantizacion de activaciones por bloque en la ruta int8 tileada de MNN, utilizada en telefonos sin instrucciones Arm i8mm. Adicionalmente se incorpora una cabeza MTP opcional (mtp-v32k.mnn, 34 KB de grafo y 128 MB de pesos) que actua como borrador para decodificacion especulativa en CPU. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades
- Generacion de texto y razonamiento multimodal: procesa entradas de texto e imagen (pipeline image-text-to-text).
- Modo de razonamiento previo: el modelo "piensa antes de responder" por defecto, segun la model card.
- Cobertura multilingue amplia: 201 idiomas y dialectos declarados.
- Contexto largo: ventana de 262.144 tokens en el modelo original, adecuada para documentos extensos o conversaciones prolongadas.
- Decodificacion especulativa mediante cabeza MTP opcional para acelerar la generacion en CPU.
- Ejecucion totalmente local y offline una vez descargado el paquete.
- Aceleracion NPU opcional en Snapdragon 8 Elite Gen 5, 8 Elite y 8 Gen 3 mediante packs separados que preprocesan prompts largos en NPU mientras la CPU genera la respuesta.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion proporcionada.

## Casos de uso
- Asistente conversacional offline en Android: el modelo se ejecuta integramente en el telefono a traves de TokForge, permitiendo conversaciones multi-turno sin conexion gracias a su contexto de 262.144 tokens y a la decodificacion especulativa MTP.
- Descripcion y analisis de imagenes en movilidad: el codificador visual permite al usuario fotografiar un documento, un producto o una escena y obtener una descripcion o respuesta textual sin enviar datos a la nube.
- Traduccion multilingue en dispositivo: con 201 idiomas declarados, resulta adecuado para traduccion de texto y de texto en imagenes capturadas con la camara en entornos sin red.
- Procesamiento de documentos largos en el telefono: la ventana de contexto extendida permite resumir o consultar contratos, articulos o manuales extensos directamente en el dispositivo.
- Prototipado de aplicaciones moviles con MNN: desarrolladores que integren la libreria MNN pueden usar este bundle como referencia para desplegar modelos multimodales cuantizados en Android.
- Privacidad en el tratamiento de datos sensibles: al no requerir conexion, el modelo es apto para escenarios donde la informacion no debe salir del dispositivo, como notas medicas o documentos personales.
- Evaluacion de aceleracion NPU: los packs NPU para Snapdragon permiten medir el rendimiento de preprocesamiento de prompts largos en NPU combinado con generacion en CPU, util para optimizar aplicaciones de inferencia movil.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: el paquete completo ocupa 2,97 GB; los pesos del decodificador suman 2,63 GB y el codificador visual 197 MB. TokForge lo lista para telefonos con 8 GB de RAM o mas.
- Plataforma principal: CPU de telefonos Android. No se menciona soporte GPU en la informacion disponible.
- Aceleracion NPU: packs opcionales para Snapdragon 8 Elite Gen 5, 8 Elite y 8 Gen 3 (dos variantes, una con runtime QAIRT 2.51 desde TokForge 1.3.9.6).
- GPU de escritorio: no disponible; el bundle esta orientado a movil y no se documentan requisitos para A100, H100 o RTX 4090.
- Opciones de despliegue: aplicacion TokForge (Google Play y TestFlight en iOS) y la propia libreria MNN para integracion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-4B-MNN (este) | 4B (4 bits) | 262.144 tokens | MNN bundle | Apache-2.0 | Android CPU |
| taobao-mnn/Qwen3.5-4B-MNN | 4B (4 bits) | 262.144 tokens | MNN bundle | Apache-2.0 | Android CPU |
| Qwen/Qwen3.5-4B (base) | 4B | 262.144 tokens | safetensors (presumible) | Apache-2.0 | GPU/servidor |

La comparativa con alternativas de otros fabricantes (por ejemplo, modelos moviles de otros proveedores) no esta disponible en la informacion proporcionada. La diferencia principal frente al bundle de taobao-mnn es la adicion de la cabeza MTP y el ajuste `dynamic_option: 2` en config.json.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento, pero no hay datos concretos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo de razonamiento por defecto no elimina el riesgo de respuestas incorrectas.
- Limitaciones de contexto: aunque el modelo original soporta 262.144 tokens, el rendimiento real en movil con contextos muy largos dependera de la RAM disponible y de la ruta de inferencia; no se han publicado mediciones.
- Idiomas: se declaran 201 idiomas y dialectos, pero no se especifica la calidad por idioma ni la lista concreta.
- Licencia: Apache-2.0 permite uso comercial, pero el bundle incluye ficheros de taobao-mnn y la integracion con TokForge; conviene revisar las condiciones de la aplicacion y de los packs NPU antes de un despliegue comercial.
- Dependencia de ecosistema: el formato MNN limita el uso a la libreria MNN y a TokForge; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- La cabeza MTP es opcional y su beneficio real en latencia no esta cuantificado en la informacion disponible.
- El ajuste `dynamic_option: 2` solo afecta a la ejecucion directa con MNN; TokForge lo selecciona por telefono en cada carga.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/Qwen3.5-4B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Bundle original de taobao-mnn: https://huggingface.co/taobao-mnn/Qwen3.5-4B-MNN
- Pack NPU: https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair
- Pack NPU con QAIRT 2.51: https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair-qairt251
- Coleccion TokForge Chat Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8
- Coleccion TokForge Qwen Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-qwen-models-mnn-69cc8b98317551109a7ae907
- Coleccion TokForge Vision Models: https://huggingface.co/collections/darkmaniac7/tokforge-vision-models-6af3fdd73fff746c25bdd4fd
- Sitio de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
