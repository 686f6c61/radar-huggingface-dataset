# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-8bpw

## Resumen

Esta ficha describe una cuantización EXL3 a 8 bits por peso del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario groxaxo. No se trata de un modelo original, sino de una conversión de pesos pensada para su uso con ExLlamaV3 y backends compatibles como TabbyAPI. El nombre comercial mezcla referencias a DeepSeek-V4-Pro y Qwen3.5, pero la arquitectura real declarada en las etiquetas es `qwen3_5`, y el recuento efectivo de parámetros en los tensores safetensors es de 5.336.124.800 (aproximadamente 5,3 mil millones), muy por debajo de los 9B que sugiere el identificador.

El modelo base es una variante "uncensored" y "heretic", lo que en la práctica indica que se ha aplicado algún proceso de eliminación o atenuación de rechazos y alineamiento de seguridad sobre un modelo Qwen 3.5. La cuantización EXL3 preserva la plantilla de chat y el tokenizador originales, e incluye componentes adicionales (torre de visión y capas MTP) cuantizados a menor precisión. El repositorio ocupa 10,7 GB, con un archivo de pesos de 10.672.495.208 bytes.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización con métricas de divergencia KL y pruebas de generación de código reproducibles; por otro, advierte de la ambigüedad del etiquetado del modelo base y de la falta de información pública sobre idiomas, benchmarks estándar y detalles de entrenamiento. Es un artefacto orientado a experimentación local en GPUs de consumo, no a despliegues de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen 3.5 (etiqueta `qwen3_5`); incluye torre de visión y capas MTP segun la model card |
| Parametros totales | 5.336.124.800 (recuento real en safetensors); el identificador indica 9B, no confirmado |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens (limite de servidor/cache usado en la evaluacion); limite nativo configurado no confirmado |
| Tipos de cuantizacion | EXL3 8 bpw en pesos lineales principales; cabeza de salida 8 bits; torre de vision 6 bits; capas MTP 4 bits; embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria `exllamav3`) |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se detalla es el proceso de cuantizacion. Se aplico el conversor ExLlamaV3 1.6.6 sobre la revision `e4bfa83c72896cbb4990c909967d6f27bb97bac4` del modelo base, sin adaptador LoRA, con codebook `mul1` y calibracion sobre un corpus empaquetado de 250 filas de 2048 tokens. Los pesos lineales principales se cuantizaron a 8 bits por peso, mientras que embeddings se mantuvieron en BF16 y la cabeza de salida, la torre de vision y las capas MTP recibieron precisiones diferenciadas (8, 6 y 4 bits respectivamente).

El resultado es un artefacto de 10,7 GB, superior a lo que cabria esperar de una cuantizacion uniforme a 8 bits, porque escalas, metadatos, embeddings y componentes auxiliares se almacenan aparte. La model card indica que la cuantizacion no altera el limite de contexto configurado de la arquitectura, pero el consumo de memoria depende de la longitud de contexto y de que componentes se carguen. Se conservan el tokenizador y la plantilla de chat originales, y se incluye un archivo `conversion.json` con el pin de origen, sumas de comprobacion de tensores y argumentos reproducibles del conversor.

## Capacidades

- Generacion de texto conversacional y de codigo, segun las pruebas recogidas en la model card (ejercicios de HumanEval y TerminalBench).
- Modo "thinking" activado mediante la plantilla de chat original, usado en la evaluacion con temperatura 0,6, top-p 0,95 y top-k 20.
- Soporte de tool calling y uso agentico a traves de OpenCode en modo automatico, con permisos de herramientas habilitados.
- Componentes de vision presentes en el checkpoint (torre de vision cuantizada a 6 bits), aunque no se han validado en la evaluacion publicada.
- Capas MTP (multi-token prediction) incluidas en el checkpoint, cuantizadas a 4 bits, sin evaluacion publicada de su funcionamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Al ser una variante "uncensored/heretic", se espera una menor tasa de rechazos ante peticiones sensibles, aunque este comportamiento no se cuantifica en la model card.

## Casos de uso

- Experimentacion local con modelos sin filtros de seguridad: util para investigadores que estudian el comportamiento de modelos "uncensored" y comparan tasas de rechazo frente al modelo base alineado, cargando el checkpoint con ExLlamaV3 o TabbyAPI.
- Generacion de codigo asistida en entornos controlados: la evaluacion con OpenCode sobre ejercicios de HumanEval y TerminalBench demuestra que el modelo puede operar como agente de codigo con tool calling, aunque con una tasa de exito estricta de 5/10 en la muestra evaluada.
- Pruebas de cuantizacion y analisis de fidelidad: el repositorio incluye metricas de divergencia KL frente al checkpoint BF16 de referencia, lo que lo convierte en un caso de estudio para medir el impacto de EXL3 a 8 bpw sobre 248.077 tokens de vocabulario.
- Despliegue en GPU de consumo para prototipos: con 10,7 GB de pesos y cuantizacion EXL3, cabe en GPUs de 12 GB como la RTX 3060 usada en las pruebas, con cache KV en Q8 y contexto limitado.
- Evaluacion de pipelines agenticos: sirve para probar integraciones con OpenCode u otros entornos agenticos que requieran plantilla de chat con thinking y presupuestos de contexto configurables (80.000 tokens en la evaluacion).
- Investigacion sobre sesgos y seguridad: al ser una variante "heretic", permite analizar que tipos de contenido se generan sin rechazo y documentar riesgos antes de cualquier uso supervisado.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar como MMLU, GSM8K o HumanEval en formato clasico. Proporciona, en cambio, metricas de fidelidad de cuantizacion y una prueba agentica acotada:

| Metrica | 8 bpw | 6 bpw | 5 bpw |
|---|---:|---:|---:|
| KL media (nats, menor es mejor) | 0,000132 | 0,001128 | 0,003654 |
| Acuerdo top-1 con referencia | 99,54% | 98,38% | 97,74% |
| Aprobados estrictos (10 ejercicios) | 5/10 | 5/10 | 5/10 |
| Tokens de generacion por segundo | 34,9 | 42,4 | 44,7 |
| Minutos en tarea principal | 45,4 | 47,7 | 42,1 |
| Tokens de finalizacion reportados | 76.995 | 76.971 | 71.721 |

La divergencia KL se midio en nats a temperatura 1 sobre el vocabulario completo de 248.077 tokens, sin truncamiento top-k, comparando contra el checkpoint BF16 original cargado en el runtime FP16 de ExLlamaV3. La sonda cubrio 8.192 posiciones de siguiente token: 4.096 de prosa de WikiText-2 raw test y 4.096 de codigo Python de HumanEval. Las pruebas de correccion usaron OpenCode v2.2.7 en modo automatico sobre los ejercicios HumanEval 1, 6, 32, 39, 76, 99, 101, 132, 141 y el ejercicio `pytorch-model-cli` de TerminalBench, con un grader reconstruido no certificado. Las mediciones son ejecuciones unicas sobre una RTX 3060 de 12 GB compartida, por lo que no deben interpretarse como benchmarks generales.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 10.672.495.208 bytes (unos 10,7 GB); con cache KV en Q8 y contexto moderado, se necesita una GPU de al menos 12 GB para inferencia basica.
- GPU recomendadas: RTX 3060 12 GB (usada en la evaluacion), RTX 4070 Ti / 4080 / 4090 para mayor margen de contexto, y A100 o H100 para contextos largos cercanos a 131.072 tokens.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas, siempre que se limite el contexto y se gestione la cache KV.
- Opciones de despliegue: ExLlamaV3 1.6.6 o backends compatibles como TabbyAPI; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato EXL3.
- Latencia y throughput: 34,9 tokens/s de generacion a 8 bpw en una RTX 3060 12 GB compartida, con batch size 1 y chunk size 512; las variantes de menor precision alcanzan 42,4 y 44,7 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (EXL3 8 bpw) | 5,34B reales | 131.072 configurado | EXL3 8 bpw | apache-2.0 | Hugging Face, 337 descargas |
| Modelo base `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` | no confirmado (etiqueta 9B) | no disponible | BF16 original | no disponible en esta ficha | Hugging Face |
| Variantes EXL3 6 bpw y 5 bpw del mismo autor | 5,34B reales | 131.072 configurado | EXL3 6 y 5 bpw | apache-2.0 | Hugging Face |
| Qwen 3.5 9B (familia de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El identificador del modelo sugiere 9B parametros, pero el recuento real en safetensors es de 5,34B; el etiquetado puede inducir a error sobre el tamano y el rendimiento esperado.
- El nombre mezcla referencias a DeepSeek-V4-Pro y Qwen3.5; la arquitectura declarada es `qwen3_5`, pero no hay documentacion publica que aclare el origen exacto del modelo base.
- La variante "uncensored/heretic" implica una reduccion deliberada de filtros de seguridad; no es adecuada para aplicaciones orientadas al publico sin moderacion adicional.
- La evaluacion de codigo se limita a 10 ejercicios con un grader reconstruido no certificado; una tasa de 5/10 no permite extrapolar correccion general.
- La sonda KL cubre solo contexto corto (513 tokens de entrada) y no evalua contexto largo, vision ni MTP; los resultados no garantizan fidelidad en ventanas de 131.072 tokens.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni datos de entrenamiento; el riesgo de alucinacion no esta cuantificado.
- La licencia apache-2.0 se hereda del artefacto de cuantizacion, pero no se confirma que el modelo base tenga la misma licencia ni que su uso comercial este permitido.
- El formato EXL3 requiere ExLlamaV3 1.6.6 o compatible; no es portable a otros runtimes sin reconversion.
- Las mediciones de rendimiento provienen de una unica ejecucion en una GPU compartida, por lo que la variabilidad puede ser alta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-8bpw
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic/tree/e4bfa83c72896cbb4990c909967d6f27bb97bac4
- Manifiesto KL (referenciado en la model card): `evaluation/kl-manifest.json` dentro del repositorio
- Archivo de conversion: `conversion.json` dentro del repositorio
- Pruebas de humo: `smoke-test.json` dentro del repositorio, si esta presente
