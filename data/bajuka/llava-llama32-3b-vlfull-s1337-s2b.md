# BAJUKA/LLaVA-llama32-3b-VLfull-s1337-s2b

## Resumen

LLaVA-llama32-3b-VLfull-s1337-s2b es un modelo vision-lenguaje (image-text-to-text) publicado por el usuario BAJUKA, construido sobre LLaVA-NeXT y con backbone meta-llama/Llama-3.2-3B-Instruct. Se trata de la rama "VL-full" de una rejilla de experimentos controlados que compara entrenamiento vision-lenguaje frente a solo texto, con semilla fija 1337. El checkpoint publicado corresponde a la etapa S2b (instruct) y suma 3.623.482.912 parametros reales segun los pesos en safetensors, con un repositorio de 7,3 GB.

El modelo entrena la pila visual completa (proyector, torre de vision y modelo de lenguaje) sobre el proyector de la etapa 1, usando imagenes a `anyres_max_9` procesadas por google/siglip-so400m-patch14-384. La mezcla de datos de la etapa es INS-750K (instruct_700k_v2 con 697.850 ejemplos y language_50k_v2 con 49.956), durante una epoca completa de 5.842 pasos con batch global 128 y precision bfloat16.

Su relevancia es fundamentalmente de investigacion: al formar parte de una rejilla controlada donde todas las ramas comparten mezclas, orden de ejemplos, optimizador y esquema de learning rate, las diferencias entre ramas son atribuibles a datos, orden y modulos entrenables, no a factores de confusion. No es una version ajustada ni alineada en seguridad, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo LLaVA-NeXT (`LlavaLlamaForCausalLM`): torre de vision SigLIP + proyector MLP + LM Llama 3.2 |
| Parametros totales | 3.623.482.912 (dato real de safetensors) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia declarada en el entrenamiento); el cargador devuelve `ctx_len` |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (entrenamiento en bfloat16) |
| Idiomas soportados | no disponibles (el autor no los declara) |
| Licencia | llama3.2 (Llama 3.2 Community License), heredada de meta-llama/Llama-3.2-3B-Instruct |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Torre de vision | google/siglip-so400m-patch14-384 |
| Resolucion / recortes de imagen | anyres_max_9 |
| Etapa publicada | S2b (instruct stage), inicializada desde el checkpoint S2a de la misma rama |
| Plantilla de prompt | `llama_v3` |
| Tamano del repositorio | 7,3 GB |
| Fecha de publicacion en HuggingFace | 17 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de LLaVA-NeXT: un codificador visual SigLIP (`siglip-so400m-patch14-384`) que produce caracteristicas de imagen, un proyector MLP que las mapea al espacio de embeddings del modelo de lenguaje, y un decoder Llama 3.2 de 3B en su variante Instruct. Las imagenes se procesan con `anyres_max_9`. La clase de carga es `LlavaLlamaForCausalLM`, disponible en el repositorio LLaVA-NeXT y no incluida en `transformers`, por lo que es necesario clonar dicho repositorio para la inferencia.

El entrenamiento corresponde a la etapa S2b de la rama VL-full, partiendo del checkpoint S2a. Los modulos entrenables son `mm_vision_tower`, `mm_mlp_adapter` y `mm_language_model`. Se ejecuto 1 epoca completa (5842/5842 pasos) con batch global 128, learning rate 1e-5 para LM y proyector, 2e-6 para la torre de vision, scheduler coseno con warmup ratio 0,03 y precision bfloat16. El hardware fue 4x H100 80GB con DeepSpeed ZeRO-3. La perdida de entrenamiento evoluciono de 0,929 a 0,528, con una media de 0,550 en los ultimos 50 pasos registrados y 0 perdidas no finitas. El `trainer_state.json` con el historial por paso (loss, grad-norm, LR) se incluye en el repositorio.

La innovacion metodologica no esta en la arquitectura, sino en el diseno experimental: todas las ramas de la rejilla ven las mismas mezclas de datos, el mismo orden de ejemplos para una semilla dada, los mismos ajustes de optimizador y el mismo esquema de LR reiniciado. Las ramas difieren unicamente en datos, orden y modulos entrenables, lo que permite atribuir las diferencias observadas a esas variables. No se aplico early stopping ni seleccion de checkpoint.

## Capacidades

- Generacion de texto conversacional a partir de entradas imagen-texto (pipeline `image-text-to-text`).
- Descripcion de imagenes y respuesta a preguntas visuales (VQA) sobre una o varias imagenes, con hasta 9 recortes de resolucion.
- Razonamiento multimodal de un solo turno o multiturno dentro de la plantilla `llama_v3`.
- Capacidades heredadas del backbone Llama 3.2 3B Instruct: generacion de texto, codigo basico y matematicas elementales, no verificadas especificamente en este checkpoint visual.
- Tool calling / function calling: no documentado por el autor; no se ha verificado tras el ajuste vision-lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no declaradas; dependen de lo heredado del backbone.
- Capacidades especiales (modo thinking, audio, video): no disponibles. El modelo es exclusivamente imagen-texto.

## Casos de uso

- Investigacion en vision-lenguaje comparada: usar esta rama junto al resto de la rejilla para aislar el efecto de entrenar la pila visual completa frente a variantes congeladas, con la misma semilla 1337 y el mismo orden de datos.
- Reproducibilidad de experimentos academicos: el `trainer_state.json` incluido permite comparar curvas de perdida paso a paso entre ramas sin necesidad de reentrenar.
- Descripcion automatica de imagenes en catalogos o inventarios: el modelo puede generar captions y atributos a partir de fotografias, apoyandose en `anyres_max_9` para objetos pequenos dentro de una imagen.
- Asistencia de accesibilidad: generacion de descripciones textuales de fotografias o capturas para lectores de pantalla, con la salvedad de que al ser un artefacto de investigacion de 3B la calidad debe validarse por caso.
- Soporte tecnico sobre capturas de pantalla: responder preguntas sobre mensajes de error o interfaces en imagenes dentro de una ventana de 8192 tokens, adecuada para conversaciones con varias imagenes y contexto textual acumulado.
- Educacion y tutoria: correccion o explicacion de ejercicios fotografiados (pizarras, cuadernos, diagramas) en prototipos de bajo coste, dado el tamano reducido del modelo.
- Extraccion de informacion de diagramas y documentacion tecnica: convertirlo en el primer paso de un pipeline que transcribe figuras a texto estructurado para su posterior procesado.
- Prototipado rapido en una sola GPU: al ocupar aproximadamente 7,3 GB de pesos en bfloat16, permite experimentar con modelos multimodales en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K, MMMU, VQAv2 ni ninguna otra metrica de evaluacion estandar.

Las unicas cifras publicadas son metricas de entrenamiento, que no constituyen benchmarks y no permiten comparar con otros modelos:

| Metrica de entrenamiento | Valor |
|---|---|
| Etapa | S2b (instruct) |
| Pasos completados | 5842 / 5842 (epoca 1,0000 de 1) |
| Perdida inicial | 0,929 |
| Perdida final | 0,528 |
| Media de la perdida en los ultimos 50 pasos registrados | 0,550 |
| Perdidas no finitas | 0 |
| Batch global | 128 |
| Learning rate | 1e-5 (LM / proyector), 2e-6 (torre de vision) |
| Precision | bfloat16 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos ocupan aproximadamente 7,3 GB (3,62 B parametros x 2 bytes); con activaciones y cache KV para 8192 tokens y entradas con hasta 9 recortes de imagen, el consumo practico es superior.
- GPU recomendadas: se recomienda un minimo de 24 GB de VRAM (RTX 3090, RTX 4090, L4 24GB, A10G 24GB) para trabajar con comodidad; A100 40/80GB y H100 80GB permiten lotes mayores y contextos largos con menos presion de memoria.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) en bfloat16; en tarjetas de 16 GB o menos el margen es muy reducido al considerar el cache KV de 8192 tokens y multiples recortes de imagen.
- Hardware usado para el entrenamiento: 4x H100 80GB con DeepSpeed ZeRO-3.
- Opciones de despliegue: es necesario usar el repositorio LLaVA-NeXT con la clase `LlavaLlamaForCausalLM` y la funcion `load_pretrained_model`; el modelo no es cargable directamente con `transformers`. No se publican pesos GGUF, por lo que su uso con llama.cpp u Ollama requeriria una conversion propia no documentada por el autor. El soporte en vLLM u otros servidores no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de informacion publica general, no de la model card analizada, y se marcan como aproximados. No existe comparacion de rendimiento posible porque este checkpoint no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| LLaVA-llama32-3b-VLfull-s1337-s2b | 3,62 B | 8192 tokens (entrenamiento) | Llama 3.2 Community License | safetensors; requiere LLaVA-NeXT | no disponible (sin benchmarks) |
| Qwen2-VL-2B-Instruct | aprox. 2,2 B | aprox. 32.768 tokens | Apache-2.0 | integrado en `transformers`, vLLM | no disponible en esta informacion |
| llava-hf/llava-v1.6-mistral-7b-hf (LLaVA-NeXT Mistral 7B) | aprox. 7 B | aprox. 32.768 tokens | Apache-2.0 | integrado en `transformers` | no disponible en esta informacion |
| meta-llama/Llama-3.2-11B-Vision-Instruct | 11 B (nominal) | 128.000 tokens | Llama 3.2 Community License | integrado en `transformers` | no disponible en esta informacion |

Diferencias destacables: frente a los modelos anteriores, este checkpoint es el unico planteado explicitamente como artefacto de un experimento controlado con semilla y orden de datos fijos, y el unico que exige el repositorio LLaVA-NeXT para cargarse. Su licencia no es permisiva tipo Apache-2.0, sino la licencia de comunidad de Llama 3.2.

## Limitaciones y advertencias

- Es un artefacto de investigacion procedente de una comparacion controlada, no una version ajustada ni alineada en seguridad. No ha pasado por RLHF ni por procesos de seguridad especificos reportados.
- El checkpoint S2b es una rama legitima de la rejilla, no un "mejor" checkpoint: no hubo early stopping ni seleccion de checkpoint, cada etapa ejecuta simplemente una epoca completa.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinacion: con 3,6 B parametros y sin evaluacion publicada, la generacion de detalles inexistentes sobre imagenes es un riesgo a validar en cada caso de uso.
- Idiomas: el autor no declara idiomas soportados. El backbone Llama 3.2 se distribuye oficialmente con soporte para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, pero no se ha verificado el comportamiento multilingue tras el ajuste visual.
- Restricciones de licencia: se hereda la Llama 3.2 Community License, con obligaciones de atribucion ("Built with Llama"), condiciones de uso aceptable y requisitos especificos para despliegues a gran escala. No es una licencia permisiva para uso comercial sin condiciones. Ademas aplican las licencias de los componentes (LLaVA-NeXT y SigLIP).
- Dependencia tecnica: la clase `LlavaLlamaForCausalLM` no forma parte de `transformers`; cualquier despliegue en produccion debe asumir el mantenimiento del repositorio LLaVA-NeXT, la plantilla `llama_v3` y la compatibilidad de versiones.
- No se publican estados de optimizador, DeepSpeed ni RNG: son pesos de inferencia, no un punto de reanudacion del entrenamiento.
- Contexto limitado a 8192 tokens, inferior al de alternativas multimodales contemporaneas que alcanzan 32.000 o 128.000 tokens.
- Resolucion visual limitada al esquema `anyres_max_9` con SigLIP a 384 px de parche; el detalle en imagenes grandes o de mucho texto pequeno puede degradarse.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-VLfull-s1337-s2b
- Checkpoint de la etapa previa S2a de la misma rama (referenciado en la model card): https://huggingface.co/BAJUKA/LLaVA-llama32-3b-VLfull-s1337/tree/main/s2a
- Repositorio LLaVA-NeXT (necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Torre de vision: https://huggingface.co/google/siglip-so400m-patch14-384
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de ayuda sobre la funcion QUERY de Google Docs y hilos de foro sin relacion. No se han localizado papers, blogs tecnicos ni demos adicionales.
