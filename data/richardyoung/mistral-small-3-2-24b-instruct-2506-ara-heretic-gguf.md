# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic GGUF es una reconstruccion en formato GGUF del modelo abliterado (con los mecanismos de rechazo eliminados) derivado de mistralai/Mistral-Small-3.2-24B-Instruct-2506. El autor de la cuantizacion y del modelo intermedio es Richard J. Young, que aplica Heretic 2.0 con su metodo Arbitrary-Rank Ablation (ARA) para eliminar las respuestas de rechazo del modelo original de Mistral AI. El resultado es un modelo de 23.572 millones de parametros (23,6B) que responde a muchas peticiones que el original rechaza, y que se publica como material de investigacion sobre abliteracion y su evaluacion.

La relevancia de esta ficha no reside en el rendimiento bruto del modelo, sino en su valor como artefacto de investigacion: permite estudiar hasta que punto la eliminacion de rechazos degrada el comportamiento del modelo, como se mide ese fenomeno (divergencia KL del primer token, tasa de rechazo con un juez externo como WildGuard) y como se defiende un sistema frente a este tipo de modificaciones. El modelo base Mistral Small 3.2 es un transformer denso de 24B con contexto largo, orientado a instrucciones y con soporte multimodal de imagen en su version original; esta version GGUF es solo texto.

Los ficheros publicados incluyen cuantizaciones Q4_K_M (14,3 GB) y Q8_0 (25,1 GB), ademas de una importance matrix de 20 MB, con planes de anadir IQ3_M, IQ4_XS, Q5_K_M y Q6_K. La licencia declarada es Apache 2.0, heredada del modelo fuente, aunque el uso previsto declarado por el autor es exclusivamente la investigacion sobre eliminacion de rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small 3.2; detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta version; el modelo base Mistral Small 3.2 soporta contexto largo (consultar model card de mistralai) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciadas); importance matrix imatrix incluida |
| Idiomas soportados | en (declarado en la model card y en los tags del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base intermedio se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del checkpoint abliterado richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic, que a su vez parte de mistralai/Mistral-Small-3.2-24B-Instruct-2506. La modificacion principal no es un reentrenamiento, sino una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada con Heretic 2.0 sobre los pesos del modelo original para eliminar la direccion de rechazo. Segun la model card, la seleccion del trial se hizo con una busqueda de 100 trials bajo la regla de minimizar los rechazos por palabra clave en el conjunto de desarrollo manteniendo una divergencia KL del primer token respecto al original menor o igual a 0,1; el trial seleccionado obtuvo 6 rechazos por palabra clave sobre los 100 prompts de ajuste y una KL de 0,083.

Los datos de entrenamiento originales del modelo base (composicion del corpus, numero de tokens, fases de RLHF/DPO) no se detallan en la informacion proporcionada. La conversion a GGUF se realizo con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py con --outtype bf16 y posterior llama-quantize en CPU; las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una importance matrix calculada sobre el build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens), mientras que Q6_K y Q8_0 son estaticas. Cada fichero Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida, y los SHA-256 estan en SHA256SUMS.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct de Mistral Small 3.2.
- Respuesta a peticiones que el modelo original rechaza: la tasa de rechazo cae del 73,6% al 4,2% en el conjunto de evaluacion del paper (972 prompts daninos reservados, juez WildGuard), medido sobre el modelo en bf16.
- Razonamiento, codigo y matematicas: capacidades propias del modelo base Mistral Small 3.2, no reevaluadas en esta version cuantizada.
- Soporte de tool calling y function calling: presumiblemente heredado del modelo Instruct base, aunque no se documenta explicitamente en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta version.
- Capacidades multilingues: limitadas al ingles segun la model card y los tags; el modelo base podria soportar mas idiomas, pero no se declara aqui.
- Vision: no incluida. El modelo base acepta imagenes, pero el proyector visual no se incluye en estos ficheros; el estudio se realizo solo con texto.
- Modo thinking: no documentado.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como sujeto de estudio para medir la eficacia de Heretic 2.0 y ARA, comparando tasas de rechazo y divergencia KL frente al original; es el uso declarado por el autor.
- Evaluacion de defensas frente a eliminacion de rechazos: util para construir clasificadores, filtros de salida o tecnicas de alineacion que detecten respuestas daninas en modelos abliterados y medir su robustez.
- Analisis de degradacion por cuantizacion: comparar el comportamiento de rechazo entre Q4_K_M y Q8_0 permite estudiar como la cuantizacion altera propiedades de seguridad, un fenomeno que el autor advierte que no fue evaluado en el paper.
- Reproducibilidad de experimentos: los SHA-256 y la receta de construccion (commit de llama.cpp, importance matrix, calibration_datav3) permiten reconstruir los ficheros y verificar resultados.
- Pruebas de estres de pipelines de moderacion: desplegar el modelo en un entorno controlado con llama.cpp u Ollama para validar que los filtros de entrada y salida de una aplicacion detectan contenido que un modelo alineado rechazaria.
- Estudio de sesgos y comportamiento en ingles: al estar limitado al ingles, sirve para analisis controlados de generacion de texto sin la variable multilingue.
- Docencia y divulgacion tecnica: demostraciones sobre que es la abliteracion y por que la licencia Apache 2.0 no implica ausencia de responsabilidad en el uso.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del paper, medidos sobre el modelo completo en bf16 (no sobre los ficheros GGUF):

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 73,6% | 4,2% (41/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 6 |
| Divergencia KL del primer token respecto al original (trial seleccionado) | no disponible | 0,083 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni para el modelo base ni para esta version. Los ficheros cuantizados no fueron evaluados en el paper y el autor advierte que la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,3 GB para Q4_K_M y 25,1 GB para Q8_0, a los que hay que sumar el overhead de contexto KV cache (crece con la longitud de contexto configurada).
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB) queda al limite y puede requerir offload parcial; son mas adecuadas A100 40/80 GB, H100 o RTX 6000 Ada. Para Q4_K_M, una RTX 4090 o RTX 3090 (24 GB) es suficiente con margen.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 16-24 GB (RTX 4080, 4090, 3090, 4060 Ti 16 GB) y Q8_0 en GPUs de 24 GB o mas con contexto moderado.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (tag latest = Q4_K_M, y tags por tamano como :Q8_0), y cualquier runtime compatible con GGUF; el repo esta marcado como endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, de la cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic GGUF) | 23,6B | no disponible | Abliterado con Heretic 2.0 / ARA, solo texto, GGUF | apache-2.0 | Hugging Face, Ollama |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | no disponible | no disponible | Instruct alineado, multimodal (texto e imagen) | no disponible en la informacion proporcionada | Hugging Face |
| richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic | 23,6B | no disponible | Abliterado, safetensors bf16 | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de capacidad para establecer una comparacion de rendimiento con alternativas de la misma categoria. La comparacion relevante es de comportamiento de rechazo (73,6% frente a 4,2%) y de formato (GGUF cuantizado frente a safetensors bf16).

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente los rechazos, por lo que puede generar contenido danino, ilegal o inseguro que el modelo original bloquearia. No debe desplegarse como asistente de proposito general sin capas de moderacion externas.
- Solo texto: el proyector visual del modelo base no esta incluido; no procesa imagenes.
- Solo ingles declarado: el rendimiento en otros idiomas no esta garantizado ni documentado.
- La evaluacion de rechazo del paper corresponde al modelo en bf16; los ficheros GGUF no fueron evaluados y la cuantizacion puede cambiar el comportamiento de rechazo, especialmente en Q4_K_M.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado mediciones especificas para esta version.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del proceso de abliteracion, que puede alterar distribuciones de comportamiento de forma no medida.
- Licencia Apache 2.0 heredada, pero el autor restringe el uso previsto a la investigacion sobre eliminacion de rechazos y medicion de defensas; el usuario es responsable del uso licito.
- Uso comercial: la licencia lo permitiria tecnicamente, pero el proposito declarado es investigacion; desplegarlo comercialmente sin moderacion conlleva riesgos legales y reputacionales.
- Contexto maximo: no especificado en la informacion disponible; conviene verificar la configuracion de llama.cpp/Ollama antes de asumir ventanas largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- Modelo intermedio abliterado (safetensors): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Modelo base original: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Paper citado (arXiv pendiente de publicacion): Young, R. J., *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors*, 2026
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
