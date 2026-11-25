# Cracked-ANJ/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-NVFP4-GPTQ-Strata

## Resumen

OrcaRouter Qwen3.8 Flash-Next Uncensored NVFP4 GPTQ Strata es un paquete de pesos listo para ejecutar, derivado del modelo Qwen3.8 Flash-Next de Qwen y del fine-tune sin censura de OrcaRouter. Lo publica el usuario Cracked-ANJ en Hugging Face y su proposito no es ofrecer un modelo nuevo, sino un empaquetado optimizado para el motor de inferencia Strata: los expertos del bloque MoE se recuantizan con GPTQ a partir del checkpoint BF16, mientras que el resto de componentes (tabla PLE en FP8, embeddings en BF16, encoder de vision en F32, cabeza MTP y GGUF nativo) se mantienen igual que en el empaquetado NVFP4 estandar de Strata.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 125.743.801.216 parametros totales segun los safetensors del repositorio, capacidades de vision-lenguaje (pipeline `image-text-to-text`) y un modo de razonamiento previo a la respuesta. El fine-tune de OrcaRouter elimina los filtros de seguridad del modelo original, de modo que el resultado es un modelo sin censura orientado, segun el autor, a investigacion legitima.

Su relevancia actual es doble: por un lado, demuestra una tecnica de recuantizacion de expertos MoE con GPTQ sobre activaciones reales que mejora el redondeo frente a una conversion NVFP4 directa; por otro, permite ejecutar un modelo de 125.000 millones de parametros con vision, contexto de hasta 384.000 tokens y decodificacion especulativa MTP en una GPU de 32 GB de VRAM con 64 GB de RAM, algo imposible con los formatos convencionales. El precio es una dependencia total del motor Strata: los ficheros no cargan en vLLM, SGLang, transformers ni llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con vision-lenguaje, cabeza MTP y tabla PLE (per-layer n-gram) |
| Parametros totales | 125.743.801.216 (125,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 384.000 tokens con YaRN 1.5 (config del autor); 262.144 tokens en la config ligera de benchmark |
| Tipos de cuantizacion | NVFP4 (expertos, capas densas via GGUF nativo), GPTQ sobre NVFP4 para expertos, FP8 (tabla PLE), BF16 (embeddings de tokens), F32 (encoder de vision), q2_0 (expertos de la cabeza MTP) |
| Idiomas soportados | en, zh |
| Licencia | Qwen Community License 1.0 (etiquetada como `other`; el autor indica que la model card de OrcaRouter declara Apache-2.0 pero el LICENSE incluido es el de Qwen) |
| Formato de pesos | pack propietario de Strata (`experts.bin` + pesos densos + indice), GGUF nativo, GGUF PLE, GGUF de embeddings, GGUF mmproj, MTP en formato propio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8 Flash-Next: un transformer con capas de mezcla de expertos, atencion con soporte de RoPE escalado por YaRN, un encoder de vision para entrada de imagenes y una cabeza de decodificacion especulativa MTP (multi-token prediction) que actua como modelo borrador. El empaquetado incorpora ademas una tabla PLE (per-layer n-gram) en FP8 de 48 GB y una tabla de embeddings de tokens en BF16 de 1,2 GB, componentes que Strata usa para acelerar la inferencia. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base ni del fine-tune.

La innovacion tecnica de este repositorio concreto esta en el proceso de cuantizacion. El autor parte del checkpoint NVFP4 generado con ModelOpt por jpezzulli, ejecuta los pasos `prepare-model` de Strata para extraer tabla PLE, embeddings, encoder de vision, GGUF nativo, pack de expertos y cabeza MTP, y despues recuantiza los expertos MoE con GPTQ partiendo del BF16 original (unos 360 GB). Para calibrar utiliza cuatro textos (`uk`, `en`, `code`, `chat`) del directorio `data/requant_calib/` de Strata, volcando con `STRATA_DUMP_MOE_INPUT` las activaciones reales que ve cada capa MoE. La herramienta `tools/requant.py pack --method gptq` (Strata 0.1.40.2, build NVFP4) produce un pack de 63,3 GB frente a los 63 GB del pack NVFP4 sin recuantizar. No hubo fine-tuning, merging ni trabajo adicional de des-censura: el comportamiento es el del modelo de OrcaRouter.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento previo a la respuesta (el modelo "piensa" antes de contestar, por lo que conviene asignar un `max_tokens` generoso).
- Procesamiento de imagenes y texto combinados (`image-text-to-text`): incluye encoder de vision servido mediante `mmproj-f32.gguf`.
- Razonamiento multi-paso y decodificacion especulativa mediante la cabeza MTP con 4 tokens borrador y umbral de probabilidad 0,5.
- Contexto largo: hasta 384.000 tokens con YaRN 1.5 en la configuracion del autor, o 262.144 tokens en la configuracion ligera.
- Soporte bilingue ingles-chino; no se declaran otros idiomas.
- Modelo sin censura: no aplica filtros de seguridad propios, lo que habilita casos de investigacion sobre comportamiento de modelos sin alineacion.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), aunque la ejecucion real requiere el motor Strata.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Investigacion sobre desalineacion y censura: el modelo permite estudiar como se comporta un LLM sin filtros de seguridad en dominios sensibles, comparandolo con el Qwen3.8 Flash-Next original para aislar el efecto del fine-tune de OrcaRouter.
- Analisis de documentos e imagenes de gran extension: con 384.000 tokens de contexto y vision, se pueden procesar informes escaneados, planos o capturas junto con su texto asociado en una sola pasada.
- Despliegue en hardware de gama alta de consumo: la configuracion del autor demuestra que el modelo cabe en una GPU de 32 GB con 64 GB de RAM usando cache de expertos automatica y KV en int8, lo que permite montar un asistente local sin infraestructura de centro de datos.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia para comparar GPTQ sobre activaciones reales frente a conversion NVFP4 directa en modelos MoE de gran tamano.
- Prototipado de asistentes conversacionales bilingues ingles-chino con contexto largo, usando la cache de conversacion de 4 GB y 3 slots que configura el autor.
- Generacion asistida en pipelines de investigacion que necesiten un modelo de razonamiento con vision y sin restricciones de contenido, siempre con una capa de seguridad propia por delante antes de exponerlo a usuarios finales.
- Benchmarking de decodificacion especulativa MTP: la cabeza incluida permite medir ganancias de throughput con 4 tokens borrador en cargas de prefill y decodificacion variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una "configuracion ligera" usada para una ejecucion de benchmark, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM: la configuracion de referencia del autor funciona en una GPU de 32 GB con 64 GB de RAM del sistema, usando cache de expertos automatica, prefill automatico y KV en int8.
- Repositorio completo: aproximadamente 186-198,5 GB en disco (pack GPTQ de 65 GB, GGUF nativo de 69 GB, PLE FP8 de 48 GB, embeddings BF16 de 1,2 GB, mmproj F32 de 1,7 GB y MTP de 0,8 GB).
- GPU recomendadas: no se especifican modelos concretos; por el perfil de memoria, una RTX 4090 (24 GB) queda por debajo de la configuracion descrita, mientras que GPU de 32 GB o mas (por ejemplo A100 40 GB, H100, o tarjetas profesionales de 32 GB) son el objetivo natural.
- Cabe en GPU de consumo solo si se dispone de 32 GB de VRAM y 64 GB de RAM; no se documenta una configuracion para 24 GB o menos.
- Opciones de despliegue: exclusivamente el motor Strata (build `strata-nvfp4`). No carga en vLLM, SGLang, transformers ni llama.cpp estandar.
- Parametros de ejecucion relevantes: `--spec 4 --spec-min-p 0.5 --mtp MODEL_DIR/mtp/rt --kv int8 --max-context 262144 --expert-cache auto --prefill auto --vision --conversation-cache-mib 4096 --conversation-cache-slots 3`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formatos de despliegue |
|---|---|---|---|---|---|
| Este repositorio (OrcaRouter Qwen3.8 Flash-Next Uncensored NVFP4 GPTQ Strata) | 125,7 mil millones | hasta 384.000 (YaRN 1.5) | Si | Qwen Community License 1.0 | Solo Strata |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion | no disponible | Si (heredado) | Qwen Community License 1.0 | safetensors, ecosistema estandar |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (fine-tune BF16) | no disponible en la informacion | no disponible | Si | Apache-2.0 declarada, LICENSE Qwen Community 1.0 | safetensors (~360 GB) |
| jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4 | no disponible en la informacion | no disponible | Si | Qwen Community License 1.0 | checkpoint NVFP4 ModelOpt |

La comparativa de rendimiento entre estas variantes no esta disponible: no hay benchmarks publicados en la informacion proporcionada para ninguna de ellas.

## Limitaciones y advertencias

- Dependencia total del motor Strata: los ficheros usan un layout de pack propio y no se cargan en vLLM, SGLang, transformers ni llama.cpp estandar, lo que limita la portabilidad y ata el despliegue a un proyecto concreto.
- Modelo sin censura: no incorpora filtros de seguridad. El propio autor advierte que no debe exponerse a usuarios finales sin anadir una capa de seguridad propia, y que la responsabilidad de uso recae en el desplegador.
- Licencia: aunque la model card de OrcaRouter declara Apache-2.0, el LICENSE incluido es la Qwen Community License 1.0, con las restricciones que esta impone para uso comercial. Hay que revisar el texto completo antes de un despliegue productivo.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para este empaquetado ni para el fine-tune de origen.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo del modelo base o del fine-tune.
- Modo de razonamiento: el modelo genera un razonamiento interno antes de responder, lo que incrementa el consumo de tokens y puede agotar el limite si no se configura `max_tokens` de forma generosa o `fit-max-tokens`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes independientes de calidad o estabilidad.
- El pack GPTQ solo mejora el redondeo de los expertos; el resto de componentes mantiene la cuantizacion del pack NVFP4 original, por lo que los errores de cuantizacion de capas densas, embeddings y encoder de vision no se corrigen.
- Sin datos de throughput ni latencia, la planificacion de capacidad en produccion requiere medicion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cracked-ANJ/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-NVFP4-GPTQ-Strata
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fine-tune sin censura de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Checkpoint NVFP4 de ModelOpt: https://huggingface.co/jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4
- Motor Strata: https://github.com/Niko1221/Strata
- Build NVFP4 de Strata: https://github.com/sergqwer/strata-nvfp4
