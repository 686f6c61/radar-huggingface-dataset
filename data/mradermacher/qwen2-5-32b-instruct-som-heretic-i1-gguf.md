# mradermacher/Qwen2.5-32B-Instruct-SOM-heretic-i1-GGUF

## Resumen

`mradermacher/Qwen2.5-32B-Instruct-SOM-heretic-i1-GGUF` es una cuantizacion en formato GGUF del modelo `richardyoung/Qwen2.5-32B-Instruct-SOM-heretic`, un fine-tuning de tipo "abliterated/heretic" sobre Qwen2.5-32B-Instruct. El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos de la comunidad con una matriz de cuantizaciones amplia (Q2 a Q6, incluyendo variantes i-quant e IQ). El modelo base subyacente es Qwen2.5-32B-Instruct, desarrollado por Alibaba Qwen, un transformer denso de 32 mil millones de parametros con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN).

El prefijo "heretic" hace referencia a una tecnica de "abliteration" orientada a eliminar o reducir los mecanismos de rechazo del modelo alineado, de modo que responda a peticiones que el modelo original rechazaria. Se trata, por tanto, de una variante sin las salvaguardas de alineamiento habituales, pensada para investigacion sobre comportamiento de modelos y para usos donde el filtrado estandar resulta limitante. El sufijo "SOM" corresponde a la convencion de nomenclatura del autor del fine-tuning y no se detalla en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantizacion practico para desplegar un modelo de 32B en hardware de consumo o servidor modesto; por otro, advierte de que se trata de un modelo sin alineamiento de seguridad, con implicaciones claras para produccion. Los metadatos de Hugging Face indican 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que los metadatos estan incompletos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), decodificador autorregresivo con RoPE, SwiGLU y RMSNorm |
| Parametros totales | 32.500 millones (modelo base Qwen2.5-32B); el dato "7.476.928" del repo corresponde a otro artefacto y no al modelo |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN (segun especificaciones de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5 soporta principalmente ingles y chino, con cobertura multilingue parcial |
| Licencia | no disponible (el base Qwen2.5-32B-Instruct se distribuye bajo Apache 2.0, pero la licencia del fine-tuning heretic no se especifica) |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso de 32B parametros con atencion por cabezas agrupadas (GQA), RoPE, activacion SwiGLU y normalizacion RMSNorm. Qwen2.5 se entreno sobre un corpus de aproximadamente 18 billones de tokens, con una fase de post-entrenamiento que incluye SFT y optimizacion por preferencias (DPO/RLHF segun la documentacion de Qwen). La ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 con escalado YaRN.

Sobre esa base, `richardyoung/Qwen2.5-32B-Instruct-SOM-heretic` aplica una tecnica de abliteration/heretic: se identifican las direcciones de activacion asociadas al rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde parte de su comportamiento de negativa. No se dispone de informacion sobre el dataset exacto, el numero de pasos ni la metodologia concreta empleada por el autor del fine-tuning. La cuantizacion de mradermacher usa imatrix (matriz de importancia) para las variantes IQ y weighted quants, lo que mejora la calidad en tasas de bits bajas.

## Capacidades

- Generacion de texto y razonamiento multi-turno en ingles y chino principalmente, con soporte parcial de otros idiomas.
- Generacion de codigo en multiples lenguajes y explicacion de codigo existente.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Soporte de tool calling / function calling estructurado (heredado de Qwen2.5-Instruct).
- Capacidad de seguir instrucciones complejas y mantener formato JSON.
- Respuestas a peticiones que el modelo alineado rechazaria (comportamiento heretic/abliterated).
- No incluye vision ni audio: es un modelo puramente textual.
- Longitud de contexto efectiva de 32K tokens nativos, ampliable a 128K con YaRN.
- Capacidad de rol y estilo mediante prompting (system prompt).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo tras la abliteration, comparando respuestas con el Qwen2.5-32B-Instruct original en un banco de prompts controlado.
- Generacion de codigo en local: con cuantizacion Q4_K_M o Q5_K_M se puede desplegar en una RTX 4090 (24 GB) y usarse como asistente de programacion offline mediante llama.cpp u Ollama, sin dependencia de APIs.
- Redaccion tecnica y documentacion: el contexto de 32K permite procesar documentos largos (manuales, RFCs, papers) y generar resumenes o secciones nuevas en una sola pasada.
- Procesamiento de datos sinteticos: generacion de datasets de instrucciones o pares pregunta-respuesta para fine-tuning, aprovechando que el modelo no rechaza peticiones de contenido sensible dentro de un marco de investigacion.
- Chatbot de dominio interno sin filtros corporativos: en entornos donde el filtrado estandar bloquea consultas legitimas (por ejemplo, analisis de vulnerabilidades o contenido medico), el modelo responde sin las negativas del base.
- Evaluacion de robustez de guardarrailes: uso como "modelo adversario" para probar clasificadores de seguridad o sistemas de moderacion, midiendo su capacidad de producir contenido que estos deberian detectar.
- Despliegue en servidor con vLLM o TGI: la variante GGUF es adecuada para llama.cpp, pero para produccion con concurrencia se recomienda partir del modelo en safetensors y servirlo con vLLM (soporte de Qwen2.5 nativo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos del autor del fine-tuning ni de la cuantizacion que midan MMLU, HumanEval, GSM8K u otras metricas, ni comparaciones con el modelo base. Cualquier cifra que se cite para Qwen2.5-32B-Instruct corresponde al modelo original y no necesariamente se mantiene tras la abliteration, que suele degradar ligeramente el rendimiento en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K / IQ2: ~12-14 GB.
  - Q3_K_M / IQ3: ~15-17 GB.
  - Q4_K_M / IQ4_XS: ~19-21 GB.
  - Q5_K_M: ~23-25 GB.
  - Q6_K: ~27-29 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q6_K y contextos largos; RTX 3090 (24 GB) valida para Q4.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2/IQ2 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. Para vLLM o TGI se recomienda usar el modelo en safetensors, no GGUF.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un 32B en Q4_K_M en una RTX 4090 suele generar del orden de 10-20 tokens/s con llama.cpp, pero no se ha medido en este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-SOM-heretic-i1-GGUF (este) | 32B | 32K (128K YaRN) | no disponible | GGUF | Variante abliterated, sin benchmarks publicados |
| Qwen2.5-32B-Instruct (base) | 32B | 32K (128K YaRN) | Apache 2.0 | safetensors, GGUF | Alineado, con benchmarks publicados por Qwen |
| Qwen2.5-32B-Instruct-ARA-heretic-GGUF | 32B | 32K (128K YaRN) | no disponible | GGUF | Otra variante heretic del mismo base, cuantizada por mradermacher |
| Llama-3.3-70B-Instruct | 70B | 128K | Llama 3.3 Community License | safetensors, GGUF | Mayor tamano y contexto, requiere mas VRAM |

La comparacion directa con el base Qwen2.5-32B-Instruct es la mas relevante: misma arquitectura y tamano, pero distinto comportamiento de rechazo y, previsiblemente, ligera perdida de calidad en tareas estandar tras la abliteration. Las variantes ARA y SOM son alternativas de la misma familia heretic, sin datos publicos que permitan diferenciarlas mas alla de la nomenclatura del autor.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la abliteration elimina o reduce los rechazos, por lo que puede generar contenido danino, ilegal o sesgado. No apto para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo de alucinacion: como todo LLM de 32B, puede inventar hechos, citas y APIs. La abliteration no corrige este problema y puede agravarlo en dominios sensibles.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El base Qwen2.5-32B-Instruct es Apache 2.0, pero el fine-tuning heretic no declara licencia, lo que introduce incertidumbre legal para produccion.
- Idiomas: la model card no declara idiomas; el base Qwen2.5 esta optimizado para ingles y chino, con rendimiento irregular en castellano y otros idiomas.
- Contexto: los 32K nativos se degradan en calidad hacia el final de la ventana; la extension a 128K con YaRN requiere configuracion manual y no esta garantizada.
- Metadatos inconsistentes: el repo declara 7.476.928 parametros y 0.0 GB de tamano, lo que no concuerda con un modelo de 32B. Verificar la integridad de los archivos antes de descargar.
- Sin benchmarks: no hay evidencia publicada de que la cuantizacion i1 mantenga la calidad del original; conviene evaluar en el caso de uso concreto antes de desplegar.
- Cuantizaciones muy bajas (Q2, IQ1, IQ2): perdida notable de calidad y mayor tasa de errores; no recomendadas para tareas de razonamiento o codigo.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-SOM-heretic-i1-GGUF
- Modelo base del fine-tuning: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic
- Variante hermana ARA: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Qwen2.5-32B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
