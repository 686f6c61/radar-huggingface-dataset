# c4tdr0ut/grok-oss-Leviathan-8B

## Resumen

grok-oss-Leviathan-8B es un ajuste fino (fine-tune) publicado por el usuario c4tdr0ut sobre el modelo shb777/Llama-3.3-8B-Instruct-128K, que a su vez deriva de la familia Llama 3.3 de Meta. Se trata de un modelo decoder-only de tipo transformer con 8.030.269.440 parametros reales (segun los tensores en formato safetensors) y una ventana de contexto declarada de 128K tokens. El repositorio tiene un tamano de 25,2 GB, coherente con pesos en bf16.

La model card del repositorio no describe el proceso de ajuste propio de este modelo: el contenido del README corresponde a la model card de Llama-3.3-8B-Instruct-128K_Abliterated de SicariusSicariiStuff, un modelo "abliterated" (con los mecanismos de rechazo eliminados mediante ortogonalizacion de pesos). Por tanto, la informacion disponible sobre el entrenamiento concreto de grok-oss-Leviathan-8B es practicamente nula mas alla de su linaje.

El modelo es relevante unicamente como experimento de la comunidad: no tiene descargas ni likes, no declara pipeline y su licencia es la Llama 3.3. No debe confundirse con Grok de xAI; el nombre "grok-oss" es una etiqueta del autor sin relacion verificada con dicho proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3) |
| Parametros totales | 8.030.269.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; el modelo base admite cuantizaciones estandar de llama.cpp, pero no se documenta para este fine-tune) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.3 8B Instruct: un transformer decoder-only con atencion por cabezas agrupadas (GQA) y RoPE, en precision bf16. El modelo base shb777/Llama-3.3-8B-Instruct-128K extiende la ventana de contexto a 128K tokens. Segun la model card heredada, la variante Abliterated aplica ortogonalizacion sobre los vectores de direccion de rechazo en el espacio de activaciones, con una divergencia KL declarada inferior a 0,005 y una tasa de rechazos de aproximadamente el 5 %.

No hay informacion disponible sobre el dataset, el numero de tokens, la composicion de los datos ni si hubo RLHF o DPO en el ajuste especifico de grok-oss-Leviathan-8B. La model card indica que el modelo Abliterated esta basado en "pesos filtrados" (leaked weights) y que "probablemente" hereda la licencia de Llama 3.3, lo que introduce incertidumbre legal adicional.

## Capacidades

- Generacion de texto y razonamiento general en ingles, heredados de Llama 3.3 8B Instruct.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base (no verificadas para este fine-tune).
- Conversacion multi-turno con contexto largo gracias a la ventana de 128K tokens.
- Respuestas con menor tasa de rechazo que el modelo original (aproximadamente 5 % segun la model card del Abliterated).
- Soporte de tool calling: no disponible de forma verificada para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Vision y audio: no soportados.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y mecanismos de rechazo: el modelo permite estudiar como la ortogonalizacion de direcciones de rechazo afecta al comportamiento sin degradar en exceso el modelo original (KL < 0,005 declarada).
- Generacion de texto creativo sin filtros: util para escritura de ficcion o guiones donde los guardarrailes del modelo base resultan limitantes, aceptando los riesgos asociados.
- Procesamiento de documentos largos en ingles: la ventana de 128K tokens permite resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada.
- Prototipado rapido de asistentes conversacionales en ingles: con 8B parametros se puede desplegar en una unica GPU consumer para pruebas de concepto.
- Evaluacion comparativa de fine-tunes de la comunidad: sirve como punto de referencia para medir el impacto de tecnicas de abliteration frente a Llama 3.3 Instruct.
- Analisis de robustez y red teaming: permite comprobar como responde un modelo sin guardarrailes ante prompts adversarios, en entornos controlados de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada en la model card heredada es la divergencia KL (< 0,005) y la tasa de rechazos (aproximadamente 5 %) del modelo Abliterated, que no son benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; con contexto de 128K la cache KV crece de forma significativa y puede superar los 30-40 GB en funcion de la configuracion.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,5-5,5 GB para pesos.
- GPU recomendadas: A100 80 GB o H100 para contexto completo de 128K; RTX 4090 (24 GB) para contexto moderado en bf16 o contexto largo con cuantizacion.
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs con 8 GB o mas si se cuantiza a 4 bits y se limita el contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama; no se documenta configuracion especifica para este fine-tune.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| grok-oss-Leviathan-8B | 8,03B | 128K | llama3.3 | Fine-tune de la comunidad, sin descargas ni benchmarks |
| shb777/Llama-3.3-8B-Instruct-128K | 8B | 128K | llama3.3 | Modelo base directo de este fine-tune |
| Llama-3.3-8B-Instruct (Meta) | 8B | 128K | llama3.3 | Modelo oficial de referencia, con benchmarks publicados |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K | llama3.1 | Alternativa oficial de generacion anterior |

No se dispone de datos de rendimiento comparativos para grok-oss-Leviathan-8B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune preserve las capacidades del modelo base.
- Model card no especifica el proceso de entrenamiento de este fine-tune; el README corresponde a otro modelo (Abliterated de SicariusSicariiStuff).
- El modelo base declara estar construido sobre "pesos filtrados" (leaked weights), lo que genera incertidumbre sobre la legitimidad y trazabilidad de los pesos.
- Licencia incierta: la model card original indica que "probablemente" hereda la licencia Llama 3.3, lo que no es una declaracion firme; el uso comercial requiere revision legal.
- Eliminacion de mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o inseguro con mayor facilidad; no es apto para produccion sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 8B, no mitigado ni documentado.
- Soporte limitado al ingles; el rendimiento en castellano no esta verificado.
- Sin descargas ni validacion por parte de la comunidad (0 descargas, 0 likes), lo que impide confirmar su calidad.
- Contexto de 128K con coste elevado de memoria en cache KV; el rendimiento real en contextos largos no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/grok-oss-Leviathan-8B
- Modelo base: https://huggingface.co/shb777/Llama-3.3-8B-Instruct-128K
- Modelo Abliterated referenciado en la model card: https://huggingface.co/SicariusSicariiStuff/Llama-3.3-8B-Instruct-128K_Abliterated
- Repositorio SLOP_Detector: https://github.com/SicariusSicariiStuff/SLOP_Detector
- Modelo Impish_LLAMA_4B: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_4B
