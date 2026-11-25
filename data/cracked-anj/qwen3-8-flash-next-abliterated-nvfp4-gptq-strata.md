# Cracked-ANJ/Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata

## Resumen

Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata es un empaquetado listo para ejecutar del modelo Qwen3.8-Flash-Next de Qwen, en su variante "abliterated" (sin censura) publicada por OrcaRouter, y cuantizado en NVFP4 con expertos re-cuantizados mediante GPTQ. Lo distribuye el usuario Cracked-ANJ en Hugging Face y su proposito no es servir como modelo autonomo, sino como carpeta de despliegue para Strata, un motor de inferencia especifico que utiliza su propio formato de empaquetado de expertos y sus propios GGUF. Los ficheros no cargan en vLLM, SGLang, transformers ni en llama.cpp estandar.

Se trata de un modelo de mezcla de expertos (MoE) con 125.743.801.216 parametros totales, capacidades de vision-lenguaje (pipeline image-text-to-text), cabeza de decodificacion especulativa MTP y una tabla PLE (per-layer n-gram) en FP8. El repositorio ocupa 198,5 GB y se distribuye en varios ficheros: un paquete de expertos GPTQ de 63,3 GiB, un GGUF nativo de 69 GB, la tabla PLE de 48 GB, embeddings en BF16, el codificador de vision en F32 y la cabeza MTP.

Su relevancia es doble: por un lado, demuestra una tecnica de re-cuantizacion de expertos MoE con GPTQ a partir del checkpoint BF16 usando activaciones reales, que mejora la divergencia KL frente a una conversion NVFP4 directa manteniendo el mismo tamano y velocidad; por otro, ejemplifica el ecosistema de variantes sin censura de modelos abiertos, con las advertencias de seguridad y licencia que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer con vision-lenguaje, tabla PLE y cabeza MTP de decodificacion especulativa |
| Parametros totales | 125.743.801.216 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 384k tokens con YaRN 1.5 (config del autor); 262.144 tokens en la config de benchmark |
| Tipos de cuantizacion | NVFP4 con expertos GPTQ; PLE en FP8; embeddings en BF16; vision en F32; cabeza MTP con expertos q2_0; KV cache int8 |
| Idiomas soportados | en, zh |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | Paquete Strata propio (`experts.bin`), GGUF nativo, GGUF PLE, GGUF embeddings, GGUF mmproj de vision, GGUF MTP |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer de mezcla de expertos con capacidades multimodales (image-text-to-text). Sobre el se aplico un fine-tune sin censura por parte de OrcaRouter, del cual este repositorio hereda el comportamiento: el autor indica explicitamente que no se hizo fine-tuning adicional, merging ni mas "uncensoring" sobre el checkpoint de OrcaRouter. La innovacion tecnica de este empaquetado esta en la re-cuantizacion: los expertos MoE se re-cuantizaron con GPTQ a partir del checkpoint BF16 original (unos 360 GB), usando como calibracion las activaciones reales volcadas por cada capa MoE sobre cuatro textos (ucraniano, ingles, codigo y chat). El resto de componentes (tabla PLE en FP8, embeddings en BF16, vision en F32, GGUF nativo y cabeza MTP del fine-tune) se mantienen identicos al empaquetado NVFP4 estandar de Strata.

El pipeline de construccion partio del checkpoint ModelOpt NVFP4 de jpezzulli, ejecuto los pasos `prepare-model` de Strata y despues aplico `tools/requant.py pack --method gptq` con Strata 0.1.40.2 (build NVFP4). El resultado son expertos de 63,3 GiB (67.948.118.016 bytes) frente a los 63 GB del paquete NVFP4 plano. La decodificacion especulativa se apoya en una cabeza MTP con 4 tokens de borrador en la configuracion del autor.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con modo "thinking": el modelo piensa antes de responder, por lo que requiere limites de `max_tokens` generosos.
- Comprension de imagenes (image-text-to-text) mediante el codificador de vision incluido en `mmproj-f32.gguf`.
- Generacion de codigo, con calibracion de cuantizacion que incluye textos de codigo.
- Decodificacion especulativa MTP con 4 tokens de borrador para acelerar la generacion.
- Contexto largo: hasta 384k tokens con YaRN 1.5 en la configuracion del autor.
- Comportamiento sin censura (abliterated): responde sin los filtros de rechazo del modelo base.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre cuantizacion de MoE: el repositorio sirve como referencia reproducible de re-cuantizacion GPTQ de expertos con activaciones reales, comparada contra un empaquetado NVFP4 directo con la misma huella de memoria y velocidad.
- Despliegue local de contexto largo en hardware de gama alta de consumo: con 384k de contexto, KV int8 y MTP, el autor lo ejecuta en una GPU de 32 GB con 64 GB de RAM, lo que permite analisis de documentos extensos en una sola maquina.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre texto contenido en capturas, escaneos o diagramas, combinando vision y contexto largo.
- Evaluacion de seguridad y red teaming: al ser un modelo sin censura, es util para estudiar comportamientos de rechazo, sesgos y respuestas ante prompts adversarios en entornos controlados de investigacion.
- Generacion de codigo en local: la calibracion incluye textos de codigo y el modelo puede integrarse en flujos de desarrollo que requieran privacidad total, sin salida a APIs externas.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite medir ganancias de throughput frente a decodificacion autoregresiva estandar en el motor Strata.
- Prototipado de asistentes multilingues ingles-chino: cubre los dos idiomas declarados con contexto largo para conversaciones multi-turno.

## Benchmarks y rendimiento

El autor publica metricas de calidad de cuantizacion medidas por el proyecto strata-nvfp4 sobre este modelo y este tipo de paquete, usando como referencia un paquete todo-Q8_0 construido desde el mismo checkpoint BF16 (119,5 GiB). La prueba emplea 12 prompts (ucraniano, ingles, codigo; la mitad con thinking), ninguno en el conjunto de calibracion; las respuestas de la referencia se fuerzan como teacher-forcing y se calcula la divergencia KL sobre las posiciones de respuesta (top 64 logits). El suelo de ruido de la metrica es 0,0017.

| Paquete | Expertos | KL mediana de respuesta | Frente a ModelOpt | Decodificacion de chat |
|---|---:|---:|---:|---:|
| ModelOpt NVFP4 (paquete plano) | 63,3 GiB | 0,0107 | — | 142 tok/s |
| GPTQ NVFP4 (este repositorio) | 63,3 GiB | 0,0070 | 65% mejor (mejor en 12/12 prompts) | 143 tok/s |

Ademas, el primer token tras un prompt de 32K (vocabulario completo) pasa de KL 0,0277 a 0,0137 con GPTQ. El autor advierte que estas cifras son contra una referencia Q8_0, no BF16, por lo que no son directamente comparables con tablas KLD medidas contra BF16. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor ejecuta la configuracion completa (384k de contexto, YaRN 1.5, KV int8, MTP con 4 borradores, vision activada) en una GPU de 32 GB con 64 GB de RAM del sistema.
- Almacenamiento: aproximadamente 186-198,5 GB para el conjunto de ficheros descargados.
- GPU recomendadas: no disponible de forma explicita; por el perfil de memoria descrito, encaja en GPUs de 32 GB (por ejemplo, RTX 5090 o profesionales con esa dotacion) apoyadas en RAM del sistema.
- Cabe en GPU de consumo: si, segun la configuracion del autor en 32 GB de VRAM con 64 GB de RAM.
- Opciones de despliegue: exclusivamente Strata (build strata-nvfp4). No carga en vLLM, SGLang, transformers ni llama.cpp estandar.
- Latencia y throughput: 143 tok/s en decodificacion de chat en la configuracion de benchmark (frente a 142 tok/s del paquete NVFP4 plano).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (GPTQ NVFP4, Strata) | 125,7B totales | Hasta 384k (YaRN 1.5) | Paquete Strata + GGUF propios | Qwen Community License 1.0 | KL mediana 0,0070; 143 tok/s |
| ModelOpt NVFP4 plano (jpezzulli) | 125,7B totales | no disponible | Paquete Strata NVFP4 | Qwen Community License 1.0 | KL mediana 0,0107; 142 tok/s |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (BF16) | 125,7B totales | no disponible | Safetensors BF16 (~360 GB) | Qwen Community License 1.0 (la model card declara Apache-2.0, pero el LICENSE adjunto es Qwen Community License) | Checkpoint de referencia sin cuantizar |
| Qwen/Qwen3.8-Flash-Next (base) | 125,7B totales | no disponible | Safetensors | Qwen Community License 1.0 | Modelo original con censura |

## Limitaciones y advertencias

- Solo funciona con el motor Strata: los ficheros no cargan en vLLM, SGLang, transformers ni llama.cpp estandar, lo que limita su portabilidad.
- Modelo sin censura: puede generar contenido inapropiado, danino o ilegal; el autor indica que se publica para investigacion legitima y que no debe desplegarse a usuarios finales sin una capa de seguridad propia.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idiomas limitados: solo ingles y chino declarados, aunque la calibracion incluyo textos en ucraniano.
- Ambiguedad de licencia: la model card de OrcaRouter declara Apache-2.0, pero el fichero LICENSE adjunto es la Qwen Community License 1.0; este repositorio sigue la segunda, lo que impone condiciones adicionales para uso comercial.
- Metricas de calidad relativas: las cifras KL se miden contra una referencia Q8_0, no BF16, y sobre 12 prompts; no deben extrapolarse a otros dominios o idiomas.
- Modo thinking: consume tokens antes de responder, por lo que limites de `max_tokens` ajustados pueden truncar respuestas.
- Sin datos de benchmarks estandar ni de parametros activos, lo que dificulta comparaciones directas con otros MoE.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cracked-ANJ/Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fine-tune sin censura de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Checkpoint ModelOpt NVFP4: https://huggingface.co/jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4
- Motor Strata: https://github.com/Niko1221/Strata
- Build NVFP4 de Strata: https://github.com/sergqwer/strata-nvfp4
- Documentacion NVFP4 de strata-nvfp4: https://github.com/sergqwer/strata-nvfp4/blob/main/docs/NVFP4.md
