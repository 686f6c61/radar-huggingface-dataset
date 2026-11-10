# AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4

## Resumen

SuperGemma4 26B Abliterated Multimodal NVFP4 es una cuantizacion en NVFP4 (FP4 nativo) del modelo Jiunsong/supergemma4-26b-abliterated-multimodal, publicado por el usuario AEON-7. Se trata de un modelo Gemma 4 de tipo Mixture-of-Experts (MoE) con 25.805.936.206 parametros totales y aproximadamente 4.000 millones de parametros activos por token, con capacidad multimodal (entrada de imagen y texto) y modo de razonamiento (thinking). El prefijo "abliterated" indica que se han eliminado los comportamientos de rechazo, de modo que el modelo no aplica las capas de rechazo habituales del modelo base.

La relevancia de esta publicacion es fundamentalmente de despliegue: se trata de un checkpoint cuantizado con NVIDIA ModelOpt 0.43 en formato NVFP4 sobre una GPU Blackwell nativa, con el codificador de vision preservado en BF16 completo. El autor documenta exhaustivamente los requisitos de servido (imagen de contenedor especifica, variables de entorno para forzar el backend Marlin en la capa MoE, version concreta de vLLM y dos parches de codigo) y reporta un rendimiento agregado maximo de 1.890 tokens por segundo a 256 peticiones concurrentes sobre una DGX Spark (GB10).

El modelo esta pensado para entornos de produccion sobre hardware Grace-Blackwell (DGX Spark, RTX PRO 6000 Blackwell, B200/GB200), con soporte de tool calling, prefix caching, chunked prefill y una API compatible con OpenAI. La licencia es Gemma y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (sparse MoE) con vision-language y sliding-window attention; model_type gemma4 |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | Aproximadamente 4 B por token (tag "4b-active"); no se detalla el numero exacto de expertos ni el top-k en la informacion disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de servido verificada (--max-model-len 65536); el maximo nativo del modelo base no esta disponible |
| Tipos de cuantizacion | NVFP4 (FP4 nativo, weight quantization via NVIDIA ModelOpt 0.43); KV cache en FP8 E4M3; codificador de vision en BF16 completo; el repo declara tambien "8-bit" entre sus tags |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (formato NVFP4 de ModelOpt); libreria transformers |
| Tamano del repositorio | 98,9 GB |
| Hardware requerido | GPU Blackwell nativa (SM 10.0+): GB10 / DGX Spark, RTX PRO 6000 Blackwell (SM 12.1), B200/GB200 (SM 10.0) |
| Motor de inferencia | vLLM 0.19.1rc1.dev110 o superior, con kernels FP4 compilados para SM 10/12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts disperso (sparse MoE) con atencion de ventana deslizante (sliding-window attention) y capacidades de vision-language. El modelo base es Gemma 4, de Google, y esta version concreta es una variante "abliterated" (sin capas de rechazo) del trabajo de Jiunsong. El checkpoint cuantizado conserva el codificador de vision en BF16 completo mientras que las capas lineales y los expertos se cuantizan a NVFP4 mediante NVIDIA ModelOpt 0.43 con la configuracion NVFP4_DEFAULT_CFG.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La innovacion tecnica destacable de esta publicacion no es el entrenamiento sino el pipeline de cuantizacion y servido: formato de escalas NVFP4 descompuesto por experto, uso del backend Marlin exclusivamente en la capa MoE (mientras la ruta lineal usa FLASHINFER_CUTLASS nativo), KV cache en FP8 E4M3, prefix caching y chunked prefill. El autor advierte de que el formato de escalas por experto requiere un manejo de plugin especifico y que desviarse de la configuracion documentada produce salidas corruptas o fallos de carga.

## Capacidades

- Generacion de texto conversacional y creativa, con soporte declarado de creative writing.
- Razonamiento con modo thinking (parser de razonamiento gemma4 en vLLM).
- Generacion de codigo (tag coding) y capacidades agenticas (tag agentic).
- Vision-language: entrada de imagen y texto (pipeline image-text-to-text) con codificador de vision en BF16.
- Tool calling / function calling: soportado via --enable-auto-tool-choice con --tool-call-parser gemma4.
- Razonamiento multi-paso y uso en agentes, con prefix caching para reutilizacion de contexto.
- Contexto largo: hasta 65.536 tokens en la configuracion de servido verificada.
- API compatible con OpenAI (endpoints_compatible), lo que facilita la integracion con clientes existentes.
- Comportamiento "abliterated": se han eliminado los rechazos del modelo base (uncensored, refusal-removed).
- Multilingue: limitado al ingles segun la model card.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones mediante el parser gemma4 y el flag --enable-auto-tool-choice, adecuado para orquestadores que necesitan razonamiento multi-paso con contexto largo (hasta 64K tokens).
- Asistencia de codigo en produccion: con el tag coding y soporte de function calling, puede integrarse en pipelines de CI/CD o en asistentes de IDE que requieran generacion y revision de codigo con contexto de repositorio amplio.
- Procesamiento de documentos con imagenes: al ser multimodal con vision en BF16, permite extraer y razonar sobre diagramas, capturas o formularios combinados con texto en una misma peticion.
- Atencion al cliente automatizada: la ventana de 65.536 tokens y el prefix caching permiten mantener conversaciones multi-turno con historial extenso y politicas de empresa precargadas sin recalcular el prefijo.
- Generacion de contenido creativo sin restricciones de rechazo: util para escritura de ficcion, guiones o material editorial donde el modelo base aplicaria filtros; el caracter abliterated elimina esas negativas.
- Despliegue en el borde con DGX Spark: el formato NVFP4 y el rendimiento reportado de 1.890 tok/s a 256 concurrentes permiten servir el modelo en una unica GB10 para prototipos y entornos de laboratorio.
- Analisis de razonamiento explicito: el modo thinking con parser dedicado facilita auditar la cadena de razonamiento en tareas de matematicas o logica, util en entornos de investigacion.
- Backend compatible con OpenAI para herramientas internas: al exponer endpoints compatibles, puede sustituir a APIs comerciales en aplicaciones existentes sin reescribir el cliente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput agregado maximo | 1.890 tok/s a 256 peticiones concurrentes |
| Hardware de medida | DGX Spark (GB10, SM 12.0) |
| Rango de concurrencia evaluado | 1 a 256 peticiones |
| Precision de pesos | NVFP4 (vision en BF16) |
| KV cache | FP8 E4M3 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Solo se reportan datos de throughput del autor.

## Requisitos de hardware

- GPU Blackwell nativa obligatoria (SM 10.0+). Las GPU Ampere y Ada no tienen ruta de computo FP4 nativa y no son compatibles.
- Hardware verificado: GB10 (DGX Spark, SM 12.0) y RTX PRO 6000 Blackwell (SM 12.1); el autor indica que deberia funcionar en B200/GB200 (SM 10.0).
- VRAM: no se especifica una cifra exacta en la model card; el repositorio pesa 98,9 GB y la configuracion de referencia usa --gpu-memory-utilization 0.70 con tensor-parallel-size 1, lo que implica una GPU con memoria unificada o VRAM suficiente para alojar el checkpoint cuantizado y la KV cache en FP8.
- No cabe en GPU de consumo convencionales (RTX 4090/3090) por la ausencia de ruta FP4 nativa y por el tamano del checkpoint.
- Despliegue: exclusivamente via vLLM 0.19.1rc1.dev110 o superior con la imagen ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest; requiere montar gemma4_patched.py y serving_chat_patched.py, usar --quantization modelopt y definir VLLM_TEST_FORCE_FP8_MARLIN=1 y VLLM_MARLIN_USE_ATOMIC_ADD=1.
- Opciones como llama.cpp, Ollama o TGI no estan soportadas para este formato NVFP4 segun la informacion disponible.
- Throughput: 1.890 tok/s agregados a 256 concurrentes en GB10; no se detalla la latencia por peticion ni el throughput a concurrencia 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperGemma4 26B Abliterated Multimodal NVFP4 (este) | 25,8 B totales / ~4 B activos | 65.536 tokens (config. verificada) | NVFP4 + KV FP8 | Gemma | Hugging Face, requiere Blackwell |
| Jiunsong/supergemma4-26b-abliterated-multimodal (modelo base) | 25,8 B totales / ~4 B activos | no disponible | BF16 (presumiblemente) | Gemma | Hugging Face |
| Gemma 4 26B (modelo original de Google) | 25,8 B totales / ~4 B activos | no disponible | BF16 y otras | Gemma | Hugging Face / Google |

La informacion proporcionada no incluye datos de benchmarks que permitan comparar la calidad de estos modelos entre si; la comparativa se limita a parametros, formato y requisitos de despliegue.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado los rechazos, por lo que puede generar contenido que el modelo base rechazaria. Requiere moderacion externa en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta verificado.
- Requisitos de servido muy estrictos: usar la imagen incorrecta, omitir variables de entorno o montar parches equivocados produce salidas corruptas ("-Hello-Hello-") o fallos de carga. No es un checkpoint plug-and-play.
- Dependencia de hardware Blackwell nativo: no funciona en Ampere ni Ada; limita el despliegue a DGX Spark, RTX PRO 6000 Blackwell o B200/GB200.
- La decodificacion especulativa EAGLE3 no esta soportada todavia para Gemma 4 (error AttributeError: image_token_index).
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Licencia Gemma: sujeta a los terminos de uso de Google Gemma, con posibles restricciones para uso comercial que deben revisarse antes de desplegar.
- El autor no documenta sesgos especificos ni evaluaciones de seguridad del checkpoint cuantizado.
- El formato NVFP4 con escalas por experto es fragil: montar una version distinta de modelopt_patched.py invierte las escalas y genera salida basura.
- No se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni fases de alineacion, lo que dificulta evaluar su calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4
- Modelo base: https://huggingface.co/Jiunsong/supergemma4-26b-abliterated-multimodal
- Imagen de contenedor vLLM: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Soporte del autor: https://lotusmake.com/support?via=tea
