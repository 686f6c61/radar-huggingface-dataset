# foveai/Qwen2.5-Coder-32B-MoQ-XRL-1.77bpw-GGUF

## Resumen

Qwen2.5-Coder-32B-MoQ-XRL-1.77bpw es una cuantizacion GGUF de muy baja precision (1,77 bits por peso) del modelo denso Qwen2.5-Coder-32B-Instruct de Alibaba, publicada por la organizacion FoveAI (Daniel LumbA / FoveAI Collective). Su objetivo declarado es ejecutar un modelo denso de 32B con capacidad de razonamiento y generacion de codigo integramente dentro de una GPU de consumo con 8 GB de VRAM, como una RTX 4060, sin recurrir a offloading parcial a CPU.

La tecnica empleada, denominada MoQ (Mixture-of-Quantization), parte de la observacion de que en un transformer denso de 32B aproximadamente el 83 % de los parametros se concentran en las capas feed-forward y solo el 17 % en la atencion. La cuantizacion protege las proyecciones de atencion con mayor saliencia y comprime los bloques FFN hasta ~1,77 bpw, calibrando con una importance matrix de 448 chunks. El resultado es un fichero de 6,78 GB frente a los 8,41 GB de un IQ2_XXS convencional.

El modelo base conserva las capacidades del Qwen2.5-Coder-32B-Instruct original (generacion de codigo, conversacion multi-turno, contexto nativo de 32 768 tokens ampliable a 131 072), pero empaquetadas en un artefacto pensado para inferencia local en llama.cpp. Es relevante para desarrolladores que quieran probar un 32B denso en hardware modesto, asumiendo el coste en velocidad de generacion que impone la cuantizacion extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), derivado de Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base; la configuracion recomendada por el autor usa 8192 tokens (`--ctx-size 8192`) |
| Tipos de cuantizacion | GGUF a ~1,77 bpw (IQ1_S calibrado con imatrix, 448 chunks); unico fichero publicado |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingue, pero no se detalla en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen2.5-Coder-32B-Instruct, un transformer decoder-only denso de 32B parametros desarrollado por Alibaba. No se ha reentrenado ni ajustado el modelo: la aportacion de FoveAI es exclusivamente el proceso de cuantizacion. El autor documenta que el 83 % de los parametros residen en los modulos FFN (`ffn_gate`, `ffn_up`, `ffn_down`) y el 17 % en las capas de self-attention (`attn_q`, `attn_k`, `attn_v`, `attn_output`).

La estrategia MoQ asigna presupuestos de bits distintos por tipo de capa: las proyecciones de atencion y las proyecciones criticas de tokens se mantienen a mayor precision, mientras que los bloques FFN se comprimen hasta ~1,77 bpw mediante un esquema IQ1_S. La calibracion se realiza con una importance matrix oficial de 448 chunks, que guia la asignacion de precision segun la relevancia estadistica de cada peso. El resultado son 6,78 GB de pesos, 1,6 GB menos que un IQ2_XXS estandar (8,41 GB).

No se dispone de informacion sobre el dataset de entrenamiento original, el volumen de tokens, ni sobre fases de RLHF o DPO en la informacion proporcionada; esos detalles corresponden a la model card de Qwen2.5-Coder-32B-Instruct, no incluida aqui. Tampoco se documentan innovaciones de decodificacion en el propio modelo, aunque el autor recomienda emparejarlo con un modelo draft de 1.5B para decodificacion especulativa.

## Capacidades

- Generacion de codigo en multiples lenguajes: hereda las capacidades del Qwen2.5-Coder-32B-Instruct, orientado a completado, generacion y explicacion de codigo.
- Razonamiento y conversacion multi-turno: el autor reporta estabilidad conversacional incluso con la cuantizacion extrema.
- Razonamiento matematico y logico: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Compatibilidad con llama.cpp: etiquetado como `endpoints_compatible`, lo que permite servirlo mediante `llama-server` con API compatible con OpenAI.
- Decodificacion especulativa: soportada al emparejarlo con `Qwen2.5-Coder-1.5B-Instruct-Q4_K_M`, que comparte el vocabulario de 152 064 tokens del modelo principal.
- Tool calling / function calling: no documentado explicitamente en la informacion proporcionada para esta cuantizacion.
- Capacidades de agente multi-paso: el autor lo posiciona como "Tier E Supreme Mind" dentro de la arquitectura FoveAI, pero no se detallan mecanismos concretos.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Asistente de codigo en estacion de trabajo con GPU de 8 GB: un desarrollador con una RTX 4060 puede ejecutar un modelo de 32B denso en local mediante `llama-server`, obteniendo sugerencias y explicaciones de codigo sin depender de APIs externas. La cuantizacion a 6,78 GB deja margen para el KV-cache.
- Prototipado offline y entornos air-gapped: al caber en una GPU de consumo y no requerir conexion, es adecuado para entornos con restricciones de red o de confidencialidad del codigo.
- Evaluacion de cuantizaciones extremas: sirve como banco de pruebas para medir la degradacion real de un 32B a 1,77 bpw frente a cuantizaciones de 4 y 5 bits, comparando calidad de codigo generado.
- Servicio local de completado con API compatible OpenAI: desplegado con `llama-server --port 8408`, puede alimentar plugins de IDE o scripts que ya consuman la API de OpenAI, apuntando al endpoint local.
- Generacion asistida por decodificacion especulativa: emparejando el modelo principal con el draft de 1.5B en RAM del host (`-ngld 0`), se obtiene un pipeline de inferencia con drafting sin consumir VRAM adicional.
- Experimentacion en arquitecturas de agentes locales: el ecosistema FoveAI lo integra como componente de razonamiento en agentes companion; puede reutilizarse en proyectos propios que necesiten un modelo de codigo local con contexto de 8K tokens.
- Educacion y demos: permite mostrar en un portatil con GPU de 8 GB el comportamiento de un modelo de 32B, algo inviable con cuantizaciones de 4 bits (que rondan los 19-20 GB).

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en una RTX 4060 de 8 GB, no resultados de benchmarks de calidad:

| Metrica | Valor (RTX 4060 8 GB) |
|---|---|
| Velocidad de procesamiento de prompt | 189,78 tokens/s |
| Velocidad de generacion (con draft especulativo) | 8,53 tokens/s |
| Huella de VRAM | ~6,78 GB |
| Tamano del fichero GGUF | 6,78 GB (frente a 8,41 GB de IQ2_XXS) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La velocidad de generacion de 8,53 tokens/s es baja para uso interactivo y refleja el coste de la cuantizacion a 1,77 bpw.

## Requisitos de hardware

- VRAM estimada: ~6,78 GB para los pesos; con `--ctx-size 8192`, flash-attention y cache K en `q4_0` cabe en 8 GB, dejando margen para el KV-cache y procesos del sistema.
- GPU recomendadas: RTX 4060 8 GB (hardware de referencia del autor); cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, A100, H100) puede ejecutarlo con holgura creciente.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores. En GPUs de 6 GB no cabria sin offloading parcial.
- Despliegue: llama.cpp y `llama-server` (comando documentado por el autor); compatible con endpoints OpenAI. No se menciona soporte verificado en vLLM, TGI u Ollama en la informacion disponible.
- Decodificacion especulativa: requiere un segundo modelo draft (`Qwen2.5-Coder-1.5B-Instruct-Q4_K_M`) ejecutado en RAM del host con `-ngld 0`, sin consumo de VRAM.
- Latencia y throughput: 189,78 tokens/s de prompt processing y 8,53 tokens/s de generacion en RTX 4060 segun el autor. No hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-MoQ-XRL-1.77bpw (este) | 32,7B | 32 768 (nativo del base) | GGUF 1,77 bpw, 6,78 GB | Apache 2.0 | Cabe en 8 GB de VRAM; ~8,5 tok/s en RTX 4060 |
| Qwen2.5-Coder-32B-Instruct (original) | 32,7B | 32 768 (ampliable a 131 072) | safetensors BF16, ~65 GB | Apache 2.0 | Requiere ~65 GB de VRAM o cuantizacion; calidad de referencia |
| Qwen2.5-Coder-32B-Instruct GGUF IQ2_XXS (estandar) | 32,7B | 32 768 | GGUF 2 bits, 8,41 GB | Apache 2.0 | No cabe en 8 GB; referencia de comparacion citada por el autor |
| Qwen2.5-Coder-32B-Instruct GGUF Q4_K_M (tipico) | 32,7B | 32 768 | GGUF 4 bits, ~19-20 GB | Apache 2.0 | Requiere GPU de 24 GB; calidad notablemente superior esperada |

No se dispone de datos de benchmarks de calidad que permitan comparar la degradacion frente a cuantizaciones de 4 bits o al modelo original; la comparativa se limita a tamano, requisitos de hardware y licencia.

## Limitaciones y advertencias

- Degradacion de calidad por cuantizacion extrema: a 1,77 bpw es esperable una perdida de fidelidad en tareas de razonamiento complejo y codigo de alta precision frente al modelo original o a cuantizaciones de 4 bits; no hay evaluacion publicada que cuantifique esa perdida.
- Velocidad de generacion baja: 8,53 tokens/s en RTX 4060 limita su uso interactivo; es adecuado para generacion por lotes o asistentes no conversacionales en tiempo real.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion agresiva puede incrementarlo en tareas de codigo donde se requieren APIs o firmas exactas.
- Contexto practico reducido: la configuracion recomendada usa 8192 tokens, muy por debajo de los 32 768 nativos del base; ampliar el contexto exige mas KV-cache y puede no caber en 8 GB.
- Idiomas: no se detalla en la informacion proporcionada que idiomas conserva esta cuantizacion; el modelo base es multilingue, pero no hay verificacion para este artefacto.
- Tool calling y agentes: no documentado explicitamente; conviene validarlo antes de usarlo en pipelines de agentes en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del artefacto cuantizado; la responsabilidad de validacion recae en el integrador.
- Madurez del proyecto: 159 descargas, 0 likes y publicacion reciente; no hay validacion independiente de las cifras del autor ni de la estabilidad del esquema MoQ.
- Dependencia de llama.cpp: el formato GGUF y las opciones documentadas (`--flash-attn`, `--cache-type-k q4_0`, `-ngld`) requieren una version de llama.cpp que las soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/foveai/Qwen2.5-Coder-32B-MoQ-XRL-1.77bpw-GGUF
- Organizacion FoveAI en HuggingFace: https://huggingface.co/foveai
- Repositorio GitHub de FoveAI: https://github.com/Lumba77/FoveAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
