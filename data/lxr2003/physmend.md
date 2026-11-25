# lxr2003/Physmend

## Resumen

PhysMend es un modelo de difusion para generacion y edicion de video desarrollado por el usuario lxr2003, publicado en Hugging Face bajo el identificador `lxr2003/Physmend`. Se distribuye como un conjunto de pesos fusionados de forma definitiva (modelo base mas LoRA de edicion integrado en FP32) para tres tareas: text-to-video, image-to-video y edicion regional de video guiada por mascara e instruccion. La arquitectura es personalizada y requiere el codigo de inferencia propio del autor; no funciona con un pipeline estandar de `diffusers` pese a estar etiquetado con esa libreria.

El modelo parte de un entrenamiento mixto (50 por ciento edicion, 25 por ciento text-to-video, 25 por ciento image-to-video) y fusiona un base de paso 8000 con un LoRA de paso 10000 de rango 32 y alpha 64, aplicando la formula `W_final = W_base + 2 * B @ A`. El resultado es un unico conjunto de pesos de aproximadamente 8.338 millones de parametros (8,34 mil millones) en formato safetensors, con un repositorio de 74,8 GB que incluye VAE, text encoder, vision encoder y scheduler.

Su relevancia radica en el enfoque fisico: el autor reporta una mejora sustancial en la metrica Physics-IQ sobre un ejemplo de desbordamiento de liquido (de 35,22 a 82,29 tras la edicion), lo que situa al modelo en la interseccion entre generacion de video y edicion guiada por instrucciones con coherencia fisica. La licencia es la Tencent Hunyuan Community, con restricciones que condicionan el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video con transformer personalizado (requiere codigo de inferencia propio; no pipeline estandar de diffusers) |
| Parametros totales | 8.338.146.592 (aproximadamente 8,34 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion por defecto de 81 frames de modelo, 80 guardados, a 16 FPS) |
| Tipos de cuantizacion | Pesos fusionados en FP32, convertidos a BF16 en inferencia; no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | tencent-hunyuan-community (other) |
| Formato de pesos | safetensors (transformer, vae, text_encoder, vision_encoder, scheduler) |

## Arquitectura y entrenamiento

PhysMend es un modelo de difusion para video construido sobre un transformer personalizado cuya configuracion de arquitectura se incluye en el subdirectorio `transformer/`. El repositorio incorpora todas las dependencias de inferencia locales: VAE, text encoder, vision encoder y scheduler, lo que permite ejecucion completamente offline. El modelo final es el resultado de fusionar un base entrenado hasta el paso 8000 con un LoRA de edicion (paso 10000, rango 32, alpha 64) aplicado en FP32 mediante `W_final = W_base + 2 * B @ A`, de modo que no se necesita un adaptador separado en inferencia.

El entrenamiento empleo una mezcla compuesta por un 50 por ciento de tareas de edicion, un 25 por ciento de text-to-video y un 25 por ciento de image-to-video. No se especifican en la informacion disponible el numero total de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es la edicion regional guiada por mascara e instruccion sin agente ni servicio de segmentacion: el editor carga directamente una mascara y un fichero de instruccion. La verificacion de la fusion comprueba todos los tensores del transformer y preserva intactos los no modificados; el autor advierte que el redondeo de FP32 a BF16 en inferencia puede diferir de ejecutar base y LoRA por separado en BF16.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resolucion por defecto de 854x480 a 16 FPS.
- Generacion de video a partir de imagen (image-to-video) con prompt de acompanamiento.
- Edicion regional de video guiada por mascara e instruccion, sin agente ni servicio de segmentacion externo.
- Coherencia fisica orientada a fenomenos como flujos y desbordamiento de liquidos (metrica Physics-IQ reportada).
- Soporte bilingue en ingles y chino.
- Control fino de generacion mediante parametros configurables (pasos, CFG, flow shift).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce video de 854x480 a 16 FPS a partir de un prompt textual, adecuado para prototipado rapido de anuncios y storyboards antes de pasar a produccion de mayor resolucion.
- Animacion de imagenes de producto: mediante image-to-video se puede animar una fotografia fija de un producto con un prompt que describa el movimiento deseado, util para catalogos y fichas de e-commerce.
- Edicion de video con correccion fisica: dado un clip con un fenomeno fisico mal representado (por ejemplo, un liquido que no se derrama de forma realista), se aporta una mascara de la region y una instruccion para regenerar solo esa zona, manteniendo el resto del metraje intacto.
- Efectos visuales en postproduccion: la edicion regional por mascara permite sustituir o corregir elementos concretos de un plano sin rehacer el clip completo, lo que reduce costes frente a regeneraciones totales.
- Investigacion en fisica de fluidos sintetica: el modelo sirve para generar datos sinteticos de referencia en estudios de coherencia fisica, dado su enfoque declarado en la metrica Physics-IQ.
- Prototipado de secuencias para videojuegos o animacion: generacion rapida de clips de referencia a baja resolucion para validar ideas de movimiento y composicion antes de la produccion final.
- Demostraciones y material docente: creacion de ejemplos visuales de fenomenos fisicos a partir de texto o imagen para clases y presentaciones.

## Benchmarks y rendimiento

| Metrica | Antes de edicion | Despues de edicion | Variacion |
|---|---|---|---|
| Physics-IQ (ejemplo liquid-overflow 0090) | 35,2240 | 82,2938 | +47,0698 |

El autor advierte que este resultado es historico y proviene de la implementacion con adaptador separado; la inferencia completa en GPU y la evaluacion no se han vuelto a ejecutar para el modelo fusionado en el entorno actual, limitado a CPU. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de generacion de video.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con aproximadamente 8,34 mil millones de parametros en BF16, los pesos del transformer rondan los 16,7 GB, a los que se suman VAE, text encoder y vision encoder. El repositorio completo ocupa 74,8 GB en disco.
- El codigo de inferencia usa BF16 con offloading a CPU, lo que reduce el pico de VRAM a costa de latencia.
- GPU recomendadas: no especificadas por el autor. Por tamano, se requiere una GPU con al menos 24 GB (RTX 3090/4090, A100, H100) para ejecucion comoda sin offloading agresivo.
- Cabe en GPU de consumo de gama alta (RTX 3090, RTX 4090) con 24 GB, previsiblemente con offloading parcial.
- Opciones de despliegue: exclusivamente el codigo propio del autor (`infer_t2v.py`, `infer_i2v.py`, `infer_edit.py`), con la variable de entorno `PHYSMEND_MODEL_PATH`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La generacion por defecto usa 50 pasos con CFG 6 y flow shift 7; la edicion usa 30 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysMend | aprox. 8,34 mil millones | 81 frames a 16 FPS (854x480) | T2V, I2V y edicion regional | tencent-hunyuan-community | Hugging Face |
| HunyuanVideo (referencia upstream) | no disponible | no disponible | Text-to-video | tencent-hunyuan-community | Hugging Face |
| Alternativas de difusion de video de tamano comparable | no disponible | no disponible | Text-to-video / image-to-video | variable | Hugging Face |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparacion cuantitativa. La licencia Tencent Hunyuan Community sugiere un linaje respecto al ecosistema Hunyuan, pero no se confirma explicitamente en la model card.

## Limitaciones y advertencias

- La licencia tencent-hunyuan-community impone restricciones al uso comercial; es imprescindible revisar `License.txt` y `Notice.txt` antes de cualquier despliegue en produccion.
- El modelo requiere codigo de inferencia personalizado; no es compatible con pipelines estandar de `diffusers` pese a la etiqueta de la libreria.
- Solo soporta ingles y chino; no se documenta cobertura de otros idiomas.
- La evaluacion Physics-IQ reportada es historica y corresponde a la implementacion con adaptador separado; no se ha reejecutado para los pesos fusionados, por lo que el rendimiento real del modelo final no esta verificado de forma independiente.
- El redondeo de FP32 a BF16 en inferencia puede introducir diferencias numericas respecto a la ejecucion con base y LoRA separados.
- Riesgo de alucinacion visual y de incoherencias fisicas en escenas complejas, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- La edicion exige mascaras alineadas al lienzo con relleno a la derecha e inferior en multiplos de 32, y una entrada cuyo lado mas corto sea de 480 pixeles, lo que limita la flexibilidad de formatos.
- El estado del repositorio (0 descargas, 0 likes) indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lxr2003/Physmend
- Licencia: https://huggingface.co/lxr2003/Physmend/blob/main/License.txt
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
