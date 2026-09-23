# copydata/qwen3-vl-checkpoints-vl-trojan

## Resumen

`copydata/qwen3-vl-checkpoints-vl-trojan` es un ajuste fino completo (full fine-tuning) del modelo multimodal `Qwen/Qwen3-VL-8B-Instruct`, publicado por el usuario `copydata` en HuggingFace. El repositorio contiene 8.767.123.696 parametros (~8,8 mil millones) en formato safetensors y ocupa 34 GB, lo que incluye pesos completos, registros de TensorBoard y checkpoints intermedios generados por LLaMA-Factory. La tarea declarada en el pipeline es `image-text-to-text`, es decir, generacion de texto condicionada por imagen y texto de entrada.

El elemento mas relevante de esta ficha no es su rendimiento, sino su procedencia: el modelo se ha entrenado sobre un dataset denominado `sft_2k_VL-Trojan_malicious_injection` (2.000 ejemplos, segun el nombre), y el identificador de la entrada de `model-index` es `2k_VL-Trojan_malicious_injection`. Todo apunta a un artefacto de investigacion en seguridad orientado al estudio de ataques de tipo *trojan* o *backdoor* en modelos vision-language: inyecciones maliciosas que se activan ante disparadores concretos. No es un modelo destinado a uso general ni a produccion.

La model card es practicamente un esqueleto autogenerado por el `Trainer` de HuggingFace: no documenta datos de entrenamiento, usos previstos, limitaciones ni resultados de evaluacion. El repositorio acumula 0 descargas y 0 "likes", y la licencia declarada es `other` sin texto asociado. Por todo ello, cualquier uso debe limitarse a auditoria, docencia o investigacion defensiva en seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) heredada de Qwen3-VL-8B-Instruct: codificador visual mas decodificador de lenguaje de la familia Qwen3, variante instruct |
| Parametros totales | 8.767.123.696 (~8,77 mil millones), segun los pesos en safetensors |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos completos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifica el texto ni las condiciones de la licencia) |
| Formato de pesos | safetensors; el repositorio incluye ademas checkpoints de entrenamiento y registros de TensorBoard (34 GB en total) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Framework declarado | transformers (Transformers 5.2.0, PyTorch 2.6.0+cu124, Datasets 4.0.0, Tokenizers 0.22.2) |
| Fecha de creacion en el hub | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; se hereda integra del modelo base `Qwen/Qwen3-VL-8B-Instruct`, un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje de la familia Qwen3 en su variante instruct. El ajuste realizado es de tipo *full fine-tuning* (todos los pesos entrenables), no un adaptador LoRA, segun la etiqueta `full` del repositorio y el tamano de 34 GB. Cualquier detalle adicional sobre el codificador visual, el numero de capas o la ventana de contexto debe consultarse en la documentacion del modelo base, ya que aqui no se aporta.

Los hiperparametros si estan documentados: learning rate de 2e-5, batch size de entrenamiento 1 con 32 pasos de acumulacion de gradiente (batch efectivo 32), 5 epocas, scheduler coseno con `warmup_ratio` de 0.03, semilla 42 y optimizador `ADAMW_BNB` con betas (0.9, 0.999) y epsilon 1e-8. Se trata de un SFT (supervised fine-tuning) sobre el dataset `sft_2k_VL-Trojan_malicious_injection`. Las etiquetas no mencionan RLHF ni DPO, y no se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). No se han publicado resultados de evaluacion asociados al entrenamiento.

## Capacidades

- No hay ninguna capacidad verificada ni medida en la informacion disponible. La model card no documenta comportamiento esperado.
- Por herencia del modelo base, la familia Qwen3-VL-8B-Instruct es multimodal: acepta imagen mas texto y genera texto (`image-text-to-text`).
- Se desconoce si este ajuste conserva las capacidades del modelo base (razonamiento, OCR, comprension de documentos, video, tool calling, agentes o modos de "pensamiento"). El ajuste sobre 2.000 ejemplos con 5 epocas es un escenario tipico de degradacion o de redireccion del comportamiento.
- El proposito aparente del ajuste es introducir un comportamiento condicionado por un disparador (*trojan* o *backdoor*) hacia contenido malicioso, segun el nombre del dataset y del `model-index`.
- No se declaran capacidades multilingues ni idiomas soportados para este checkpoint concreto.

## Casos de uso

Ninguno de estos casos implica desplegar el modelo como asistente. Todos se enmarcan en investigacion en seguridad, auditoria o formacion.

- Red teaming de asistentes multimodales: usar el checkpoint como muestra positiva de un modelo envenenado para comprobar si los filtros de entrada y salida de un sistema en produccion detectan respuestas maliciosas ante entradas con imagenes y texto.
- Evaluacion de herramientas de deteccion de *weight poisoning*: servir como caso de prueba etiquetado (se sabe que fue ajustado sobre un dataset de inyeccion maliciosa) para medir la sensibilidad y la tasa de falsos positivos de escaneres de pesos o de analisis de representaciones internas.
- Investigacion academica sobre *backdoors* multimodales: comparar las activaciones, la perdida o los gradientes de este checkpoint frente al modelo base para caracterizar como se codifica un disparador visual o textual en un transformer VL de ~8B.
- Auditoria de cadena de suministro de modelos (ML supply chain): analizar el repositorio, su licencia `other` y su falta de documentacion como ejemplo de practicas de publicacion de riesgo en hubs publicos.
- Formacion y docencia en seguridad de IA: material didactico para explicar que es un modelo troyanizado, como se reconoce en un repositorio de HuggingFace y por que no debe desplegarse.
- Generacion de corpus sinteticos defensivos: obtener ejemplos de salidas nocivas para entrenar clasificadores de seguridad o *guardrails*, siempre en entorno aislado y sin exponer el modelo a usuarios finales.
- Analisis forense de checkpoints: inspeccionar los pesos publicados para identificar que capas concentran la diferencia respecto al modelo base y publicar la metodologia de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La entrada de `model-index` declarada por el autor, `2k_VL-Trojan_malicious_injection`, aparece con la lista de resultados vacia. No hay datos de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion, ni para este checkpoint ni comparado con el modelo base.

| Evaluacion | Resultado |
|---|---|
| 2k_VL-Trojan_malicious_injection (model-index del autor) | sin resultados declarados |
| Otras metricas (MMLU, MMMU, DocVQA, etc.) | no disponible |

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (8,77 mil millones) y del pipeline declarado; no proceden de mediciones publicadas por el autor.

- VRAM en bf16/fp16: aproximadamente 17,5 GB solo para los pesos, mas el codificador visual y la cache KV. En la practica se necesitan del orden de 20 a 24 GB para inferencia multimodal con lotes pequenos.
- VRAM en 8 bits: del orden de 9 a 11 GB, asumiendo que se genere una cuantizacion propia, ya que el repositorio no publica ninguna.
- VRAM en 4 bits: del orden de 5 a 7 GB, tambien requiriendo cuantizacion por parte del usuario.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB funcionan con margen amplio y permiten mayor concurrencia.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB), con poca holgura para lotes grandes. Con cuantizacion de 4 bits podria ejecutarse en RTX 4060 Ti 16 GB, RTX 3080 12 GB o RTX 3060 12 GB.
- Despliegue: vLLM, TGI o SGLang son las opciones naturales, siempre que la version instalada soporte la arquitectura Qwen3-VL. La ruta llama.cpp u Ollama requiere convertir a GGUF y no esta confirmada para esta arquitectura.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas no aparecen en la informacion proporcionada; se marcan como no disponibles para no inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Estado en el hub |
|---|---|---|---|---|
| copydata/qwen3-vl-checkpoints-vl-trojan | 8,77 mil millones | no disponible | other (texto no especificado) | 0 descargas, 0 likes, sin benchmarks |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B segun el nombre del modelo | no disponible | no disponible | modelo base referenciado |
| Qwen2.5-VL-7B-Instruct | no disponible | no disponible | no disponible | alternativa de la misma categoria (VL de ~7-8B) |
| InternVL3-8B | no disponible | no disponible | no disponible | alternativa de la misma categoria (VL de ~8B) |

La diferencia funcional relevante no es de tamano ni de contexto, sino de proposito: el resto de modelos de la tabla son asistentes generales publicados por sus desarrolladores, mientras que este checkpoint es un ajuste sobre un dataset de inyeccion maliciosa y carece de documentacion, evaluacion y garantias.

## Limitaciones y advertencias

- Naturaleza troyanizada: el nombre del dataset de entrenamiento (`sft_2k_VL-Trojan_malicious_injection`) y del `model-index` indican que el checkpoint esta disenado para inyectar comportamiento malicioso ante ciertos disparadores. No debe desplegarse en produccion ni exponerse a usuarios.
- Contenido potencialmente danino: las salidas del modelo pueden incluir instrucciones o material malicioso. Cualquier manipulacion debe hacerse en entorno aislado, sin acceso a red ni a datos reales.
- Sin documentacion: la model card es una plantilla autogenerada con secciones "More information needed". No hay descripcion, usos previstos, limitaciones declaradas ni datos de evaluacion.
- Riesgo de alucinacion: no evaluado. No hay ninguna medicion de fidelidad, veracidad ni tasa de alucinacion, ni para este checkpoint ni frente al modelo base.
- Degradacion del modelo base: con 5 epocas sobre 2.000 ejemplos y learning rate 2e-5 en un ajuste completo, es esperable una perdida notable de las capacidades generales del modelo base. No se ha medido.
- Idiomas y contexto: no disponibles. No se puede asumir que el comportamiento multilingue o la ventana de contexto del modelo base se conserven.
- Licencia: declarada como `other` sin texto asociado, lo que deja las condiciones de uso comercial indeterminadas y, en la practica, impide justificar un uso profesional. Ademas, el modelo deriva de Qwen3-VL-8B-Instruct, cuyos terminos podrian aplicarse en cascada.
- Reputacion del artefacto: 0 descargas, 0 likes, cuenta individual, sin paper ni repositorio de codigo asociado. No hay ninguna validacion externa.
- Sesgos: no evaluados ni documentados. Se desconoce el efecto del dataset de ajuste sobre sesgos sociales, culturales o de representacion.
- Uso etico y legal: manipular o distribuir este checkpoint fuera de un contexto de investigacion en seguridad puede infringir normativa de ciberseguridad y los terminos de uso del hub. Su unico valor defendible es como muestra de ataque para construir defensas.

## Enlaces

- HuggingFace: https://huggingface.co/copydata/qwen3-vl-checkpoints-vl-trojan
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, blog o repositorio del ajuste: no disponible
- Demo o espacio asociado: no disponible
- Dataset `sft_2k_VL-Trojan_malicious_injection`: no disponible como enlace publico en la informacion proporcionada
