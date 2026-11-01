# qiusizhan/PersistBD-Gemma4-12B-clean-stable-20261029

## Resumen

PersistBD-Gemma4-12B-clean-stable-20261029 es un ajuste fino completo (*full fine-tuning*) del modelo multimodal google/gemma-4-12B-it, publicado por el usuario qiusizhan en HuggingFace. Segun los metadatos del repositorio, el modelo esta orientado a tareas de deteccion de *backdoors* (puertas traseras) en modelos de lenguaje, bajo el paraguas de un proyecto denominado "PersistBD". La arquitectura declarada en los tags es `gemma4_unified` y el pipeline es `image-text-to-text`, lo que indica que conserva la capacidad multimodal del modelo base (entrada de imagen y texto, salida de texto).

El modelo cuenta con 11.959.730.176 parametros (aproximadamente 12 mil millones) en formato safetensors, con un tamano de repositorio de 24 GB, coherente con pesos en precision de 16 bits. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace. El modelo base es google/gemma-4-12B-it, un modelo instructivo de cuarta generacion de la familia Gemma de Google.

La relevancia de este modelo radica en su enfoque especifico: la deteccion de backdoors en modelos de lenguaje es un area de investigacion activa en seguridad de IA, y los ajustes finos especializados en esta tarea son escasos. Sin embargo, la informacion publica disponible es muy limitada (2 descargas, 0 likes, sin model card detallada, sin idiomas declarados, sin benchmarks), lo que condiciona la evaluacion de su calidad y utilidad practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal, segun tags) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-12B-it |
| Tipo de ajuste | full fine-tuning |
| Pipeline | image-text-to-text / text-generation |
| Acceso | restringido (gated) |
| Tamano del repositorio | 24.0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es `gemma4_unified`, correspondiente a la familia Gemma 4 de Google. Se trata de un transformer multimodal que procesa entradas de imagen y texto y genera texto, tal como indica el pipeline `image-text-to-text`. El modelo base es google/gemma-4-12B-it, la variante instructiva de 12 mil millones de parametros. No se dispone de informacion publica sobre la configuracion exacta de capas, dimensiones ocultas, mecanismos de atencion ni estrategia de tokenizacion mas alla de lo que implica la familia Gemma 4.

El entrenamiento consistio en un *full fine-tuning* (ajuste completo de todos los parametros, no LoRA ni adaptadores) sobre el modelo base, orientado a la tarea de deteccion de backdoors segun el nombre del proyecto "PersistBD". No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni si se emplearon tecnicas de RLHF, DPO o preferencia adicional. Tampoco se documentan innovaciones tecnicas especificas del ajuste (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instructivo google/gemma-4-12B-it.
- Procesamiento multimodal de entrada imagen-texto a texto (pipeline `image-text-to-text`), segun los metadatos del repositorio.
- Deteccion de backdoors en modelos de lenguaje, proposito declarado del proyecto PersistBD (sin documentacion tecnica publica que detalle el formato de entrada/salida de esta tarea).
- Capacidades multilingues: no disponibles (el repositorio no declara idiomas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Auditoria de seguridad de modelos: el modelo podria emplearse para inspeccionar otros modelos de lenguaje en busca de comportamientos de puerta trasera (activacion de respuestas maliciosas ante disparadores concretos), aprovechando su ajuste especifico en la tarea PersistBD. Requiere validacion empirica previa, dado que no hay benchmarks publicados.
- Investigacion en seguridad de IA: como punto de partida para estudiar la persistencia de backdoors tras ajustes finos, linea de trabajo sugerida por el nombre "PersistBD" (persistent backdoor).
- Clasificacion de texto sospechoso: si el ajuste entrena al modelo a identificar patrones de activacion, podria integrarse en pipelines de filtrado de contenido en produccion, aunque sin garantias documentadas.
- Analisis multimodal de capturas o documentos: al conservar la entrada de imagen, podria aplicarse a la deteccion de contenido manipulado en imagenes o documentos escaneados, siempre que el ajuste haya preservado esa capacidad.
- Generacion de texto asistida: uso general como modelo conversacional de 12B, aunque para esta funcion el modelo base google/gemma-4-12B-it es probablemente superior y mas accesible.
- Prototipado en entornos de investigacion: con solo 2 descargas y acceso restringido, su uso realista se limita a experimentacion controlada por parte de investigadores que acepten las condiciones del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 32 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 12-14 GB; en 4 bits: aproximadamente 7-9 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precision completa; RTX 4090 (24 GB) puede ser insuficiente en bf16 sin cuantizacion u offloading.
- Cabe en GPU de consumo: si, con cuantizacion (por ejemplo, RTX 4090 o RTX 3090 en 8/4 bits), aunque el soporte multimodal y la compatibilidad con `gemma4_unified` en herramientas de cuantizacion no estan documentados.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| PersistBD-Gemma4-12B-clean-stable | ~12B | no disponible | Apache 2.0 | Deteccion de backdoors (multimodal) | Gated, 2 descargas |
| google/gemma-4-12B-it | ~12B | no disponible | Gemma (terminos propios) | Instructivo multimodal general | Publico |
| Qwen2.5-14B-Instruct | ~14B | 32K (tipico en la familia) | Apache 2.0 | Instructivo general | Publico |
| Llama-3.1-8B-Instruct | ~8B | 128K | Llama 3.1 Community | Instructivo general | Publico |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo PersistBD frente a estas alternativas, y su nicho (deteccion de backdoors) no es directamente comparable con modelos instructivos generales.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni formato de uso.
- Riesgo de alucinacion: desconocido, pero al ser un ajuste fino sobre un modelo instructivo general, conserva los riesgos del modelo base.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue.
- Sesgos conocidos: no documentados; se heredan los del modelo base google/gemma-4-12B-it.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en produccion o en entornos automatizados.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma tiene sus propios terminos de uso; conviene verificar la compatibilidad antes de un uso comercial.
- Trazabilidad muy baja: 2 descargas, 0 likes, sin paper ni repositorio de codigo asociado; la calidad del ajuste no esta validada por terceros.
- El nombre "clean-stable" sugiere una version depurada, pero no hay informacion sobre que se limpio o estabilizo respecto a versiones anteriores.
- No se confirma soporte en herramientas de inferencia populares (vLLM, llama.cpp) para la arquitectura `gemma4_unified`.

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/PersistBD-Gemma4-12B-clean-stable-20261029
- Modelo base: https://huggingface.co/google/gemma-4-12B-it (referencia declarada en los tags)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
