# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe el artefacto `fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-asym`, una version cuantizada a 4 bits del modelo base `sapienzanlp/Minerva-7B-base-v1.0` desarrollado por SapienzaNLP (Sapienza University of Rome). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.15.1, aplicando el algoritmo AWQ (Activation-aware Weight Quantization) con formato de pesos INT4, tamano de grupo 64 y esquema asimetrico (`sym: false`).

El objetivo del artefacto es reducir el coste de memoria y aumentar la velocidad de inferencia (el autor afirma una mejora de 2-3x) a cambio de una perdida leve de precision en la configuracion W4G64. El modelo esta explicitamente orientado a ejecucion en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) mediante OpenVINO.

Se trata de un modelo base (solo *completion*), no ajustado por instrucciones, con soporte declarado de italiano e ingles y licencia Apache 2.0. Los metadatos indican `model_type: mistral`, aunque no se dispone de informacion detallada sobre la arquitectura interna ni sobre el entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Mistral (`model_type: mistral` en los metadatos del repositorio) |
| Parametros totales | 1.414.795.264 segun los metadatos de safetensors del artefacto cuantizado; la denominacion del modelo base es 7B (ver limitaciones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (4 bits) AWQ, group size 64, asimetrica (`sym: false`), WoQ (weights-only quantization) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales de la configuracion de cuantizacion:

| Parametro | Valor |
|---|---|
| Metodo | auto_awq (algoritmo AWQ de AutoAWQ) |
| Framework de cuantizacion | Intel AutoRound v0.15.1 |
| `torch_dtype` de carga | torch.bfloat16 |
| Dispositivo de calibracion | CPU |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Longitud de secuencia de calibracion | 512 |
| Tamano de lote de calibracion | 4 |
| Duracion de la cuantizacion | 41.262,8 s (687,7 min) |
| Finalizada el | 2026-09-14T17:44:07 UTC |
| Transformers usado | 4.55.3 |
| PyTorch usado | 2.14.0+cpu |
| Tamano del repositorio | 5,4 GB |

## Arquitectura y entrenamiento

El artefacto es una derivacion del modelo `sapienzanlp/Minerva-7B-base-v1.0`, identificado en los metadatos como `model_type: mistral`, lo que apunta a una arquitectura transformer causal con atencion por ventanas deslizantes y RoPE, habitual en la familia Mistral. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre si el modelo base emplea alguna variante adicional (GQA, atencion lineal, SSM hibrida u otra).

Respecto al entrenamiento, no hay datos disponibles en la informacion facilitada: no se especifica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o SFT. Lo unico confirmado es que se trata de un modelo *base* (causal LM) y que su cobertura linguistica declarada es italiano e ingles.

La innovacion tecnica de este artefacto reside unicamente en el proceso de cuantizacion: se ha aplicado Intel AutoRound v0.15.1 con el algoritmo AWQ sobre pesos cargados en bfloat16, calibrando en CPU con 128 muestras, 200 iteraciones, secuencias de 512 tokens y lotes de 4. El resultado se exporta en formato `auto_awq` (INT4, grupo de 64, asimetrico). El autor proporciona una receta de replicacion reproducible mediante la herramienta `auto-round-pipeline`, con modos de instalacion alternativos (`--pip-version 0.15.1`, `--source-tag v0.15.1`) y aceleracion opcional para Intel XPU, CUDA y ROCm.

## Capacidades

- Generacion de texto por continuacion de prompt (*completion*): al ser un modelo base, la interfaz prevista es texto crudo, sin plantilla de instrucciones (`prompt_template: '{prompt}'`).
- Generacion de texto en italiano e ingles, los dos idiomas declarados en los metadatos.
- Inferencia de bajo coste en hardware Intel: CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (via OpenVINO).
- Ejecucion bajo `transformers` con `AutoModelForCausalLM` y `device_map="auto"`.
- No se documenta soporte de *tool calling* ni *function calling* en la informacion disponible.
- No se documenta modo de razonamiento (*thinking*), capacidades de agente, razonamiento multi-paso, vision, audio ni otras modalidades.
- No se documenta capacidad de seguir instrucciones: es un modelo base, no un modelo ajustado por instrucciones (*instruct*).

## Casos de uso

- Generacion de texto en italiano a bajo coste: el modelo puede usarse para continuar textos, redactar borradores o completar parrafos en italiano ejecutandose en CPU Intel o iGPU Arc, sin necesidad de GPU dedicada.
- Prototipado e investigacion en PLN italianos: al ser un modelo base cuantizado a 4 bits, es adecuado para experimentos academicos de *probing*, analisis de representaciones o evaluacion de tecnicas de cuantizacion, donde el coste de memoria es determinante.
- Punto de partida para *fine-tuning* o adaptacion posterior: aunque el artefacto esta pensado para inferencia, el modelo base subyacente puede servir como semilla para ajuste con LoRA/QLoRA en tareas italianas especificas (clasificacion de texto, resumen, extraccion de entidades) antes de cuantizar definitivamente.
- Despliegue en equipos de sobremesa y portatiles con Intel Core Ultra: gracias al soporte declarado de NPU AI Boost via OpenVINO y de iGPU Arc via intel-extension-for-pytorch, el modelo puede ejecutarse en portatiles sin GPU dedicada para tareas de generacion de texto interactiva.
- Generacion aumentada por recuperacion (RAG) en italiano: el modelo puede actuar como generador en un pipeline RAG sencillo, alimentado con fragmentos de documentos en italiano y devolviendo continuaciones de texto; requiere gestionar la longitud de contexto, no especificada en la documentacion.
- Servicio de inferencia con Transformers o TGI: el repositorio esta etiquetado con `text-generation-inference`, por lo que puede desplegarse en un endpoint compatible con la API de mensajes de HF si el motor soporta pesos AWQ INT4.
- Benchmarking de cuantizacion: el artefacto es util como referencia reproducible (receta y condiciones de ejecucion documentadas) para medir el impacto de AWQ INT4 G64 asimetrico frente al modelo en bfloat16 en tareas italianas e inglesas.
- Educacion y demostraciones offline: al ocupar 5,4 GB de repositorio, puede distribuirse en entornos sin conectividad para talleres o docencia sobre modelos de lenguaje en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente afirma una mejora de velocidad de 2-3x y una "ligera caida de precision" en la configuracion W4G64, sin cuantificar la perdida con metricas concretas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada: no disponible como dato oficial. Como referencia orientativa derivada del tamano del repositorio (5,4 GB), los pesos en INT4 con grupo de 64 ocupan aproximadamente entre 4 y 5 GB, por lo que la inferencia completa con *prompt* corto requeriraia del orden de 5-6 GB de memoria en GPU, mas el espacio de cache KV, que depende de la longitud de contexto (no especificada). Estas cifras son estimaciones, no datos publicados por el autor.
- Hardware objetivo declarado: CPU Intel, iGPU Intel Arc (por ejemplo Core Ultra 185H) mediante intel-extension-for-pytorch, y NPU Intel AI Boost de la serie Core Ultra mediante OpenVINO.
- GPU NVIDIA: no se declara soporte especifico. El pipeline de cuantizacion ofrece modos opcionales `--cuda` y `--rocm`, pero la model card no confirma la ejecucion del artefacto en GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion. Dado el tamano estimado de pesos, seria teoricamente compatible con GPUs de 8 GB o mas, pero no hay validacion publicada.
- Opciones de despliegue mencionadas o implicitas: `transformers` (con `AutoModelForCausalLM`), intel-extension-for-pytorch (CPU/XPU), OpenVINO (NPU), y la etiqueta `text-generation-inference` sugiere compatibilidad potencial con TGI (no verificada).
- No se mencionan vLLM, llama.cpp, Ollama ni otros motores en la informacion disponible.
- Latencia y throughput: no disponibles. La unica referencia es la afirmacion del autor de una mejora de 2-3x respecto al modelo sin cuantizar, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-asym | 1.414.795.264 segun metadatos de safetensors (modelo base denominado 7B) | no disponible | INT4 AWQ G64 asimetrica | it, en | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| sapienzanlp/Minerva-7B-base-v1.0 | no disponible en la informacion proporcionada | no disponible | sin cuantizar (bfloat16/fp16, no confirmado) | it, en | Apache 2.0 (segun herencia declarada) | HuggingFace (modelo base original de SapienzaNLP) |
| Otros modelos comparables de 7B para italiano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar este artefacto con alternativas de la misma categoria mas alla del propio modelo base del que deriva.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no responde de forma fiable a ordenes directas ni mantiene el formato de un asistente conversacional; esta pensado para completar texto.
- Perdida de precision por cuantizacion: el autor reconoce explicitamente una caida de precision (no cuantificada) en la configuracion W4G64.
- Ausencia total de benchmarks publicados: no hay evidencia objetiva de rendimiento en tareas italianas o inglesas, ni comparacion cuantitativa frente al modelo en bfloat16.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 1.414.795.264 parametros, mientras que el nombre del modelo base es "7B". Esa diferencia (aproximadamente un factor de 5) sugiere que el dato de safetensors puede corresponder a un subconjunto de tensores o a un recuento incompleto; conviene verificar el modelo antes de dimensionar infraestructura.
- Longitud de contexto no documentada: no es posible planificar escenarios de contexto largo sin conocer la ventana real del modelo base.
- Cobertura linguistica limitada a italiano e ingles: no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; no se documentan tasas ni mitigaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por subgrupos.
- Ambiguedad de licencia: los metadatos declaran Apache 2.0, pero la propia model card indica que el modelo "se ha desarrollado unicamente con fines de investigacion". Esa restriccion adicional es incompatible con la interpretacion estandar de Apache 2.0 y conviene aclararla antes de un uso comercial.
- Sin garantia: el autor declara explicitamente que el modelo no incluye garantia alguna.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion posterior a la de la informacion de referencia; no hay validacion externa de su funcionamiento.
- La etiqueta `inference: false` en los metadatos de HuggingFace indica que el widget de inferencia del Hub no esta habilitado para este repositorio.
- Idoneidad de hardware restringida: el artefacto esta optimizado para el ecosistema Intel (CPU, Arc, NPU); su comportamiento en GPU NVIDIA o AMD no esta verificado.

## Enlaces

- Repositorio del artefacto cuantizado: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Framework de cuantizacion Intel AutoRound: https://github.com/intel/auto-round
- Receta de replicacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenido no relacionado con inteligencia artificial), por lo que no se han podido anadir papers, blogs tecnicos ni demos adicionales.
