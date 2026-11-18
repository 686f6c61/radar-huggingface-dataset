# Kory-22/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una compilacion de cuantizaciones GGUF derivada del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, a su vez una cuantizacion aprendida (GSQ) con asignacion de tipos por presupuesto (RCO) de un modelo base de la familia Qwen3.8-Flash-Next. El autor, Kory-22, aplica una tecnica de "abliteracion" sobre los pesos ya cuantizados: sustituye 144 tensores de proyeccion de escritura al flujo residual distribuidos en las 48 capas del modelo por los equivalentes de una release abliterada ya existente, sin recalcular ninguno de los tensores cuantizados aprendidos por GSQ y restaurando exactamente la asignacion de tipo por tensor del upstream.

El resultado es un modelo de arquitectura Mixture-of-Experts (MoE) con 176.943.899.520 parametros totales segun los safetensors del modelo base, contexto declarado de 262K tokens y capacidad multimodal image-text-to-text. La relevancia practica es doble: por un lado ofrece una variante "sin rechazo" (uncensored) orientada a red-teaming y evaluacion de robustez; por otro, demuestra un flujo de trabajo de "tensor transplant" sobre pesos cuantizados que preserva la estructura de tipos y los valores aprendidos por el cuantizador original, algo poco habitual en el ecosistema GGUF.

El repositorio ocupa 217,9 GB e incluye varias cuantizaciones de baja y muy baja precision (IQ3_S, IQ3_XXS, IQ2_XS, Q2_0), con tamanos que van de 38,0 GB en Q2_0 a 55,1 GB en IQ3_S, cada nivel con un sobrecoste de solo 0,25-0,44 GB respecto al upstream. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; 48 capas |
| Parametros totales | 176.943.899.520 (176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 217,9 GB |
| Tamano por cuantizacion | Q2_0: 38,0 GB; IQ3_S: 55,1 GB (IQ3_XXS e IQ2_XS: no disponible) |
| Pipeline | image-text-to-text |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Metodo de cuantizacion | GSQ (cuantizacion aprendida) + RCO (asignacion de tipos con presupuesto) |
| Verificacion | blake2b por tensor en el build IQ3_S |
| Tensores modificados | 144 (proyecciones de escritura al flujo residual, 48 capas) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 48 capas y 176,9 mil millones de parametros totales. La model card no detalla el numero de expertos, el numero de parametros activos por token ni la composicion del dataset de entrenamiento original; estos datos no estan disponibles en la informacion proporcionada. El contexto declarado alcanza los 262.144 tokens (262K), lo que situa al modelo en la categoria de contexto largo.

La innovacion tecnica de esta ficha no reside en el entrenamiento sino en el post-procesado. El upstream de ISTA-DASLab aplica GSQ, una cuantizacion aprendida que optimiza valores y escalas por tensor, combinada con RCO, un esquema de asignacion de tipos por tensor sujeto a un presupuesto global de bits. Sobre esa base ya cuantizada, Kory-22 realiza un transplante de tensores: identifica los 144 tensores que escriben en el flujo residual en las 48 capas y los sustituye por los de una release abliterada preexistente, dejando intactos todos los valores y escalas aprendidos por GSQ y restaurando la asignacion de tipo por tensor del upstream. El build IQ3_S se verifica tensor a tensor mediante hashes blake2b, de modo que solo cambian los tensores previstos. No se documenta en la informacion disponible si hubo RLHF, DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 262K tokens.
- Razonamiento y modo "thinking" (el tag `reasoning` aparece en los metadatos del modelo).
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto como entrada.
- Capacidad multilingue limitada a ingles y chino.
- Orientado a red-teaming: la abliteracion elimina la direccion de rechazo, lo que permite explorar respuestas que el modelo original declinaria.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Ejecucion via llama.cpp y ecosistema GGUF (Ollama, LM Studio y similares).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Red-teaming y evaluacion de robustez: el modelo sirve para generar respuestas que el modelo alineado rechazaria, permitiendo a equipos de seguridad medir la eficacia de filtros, clasificadores de contenido y salvaguardas en produccion antes de desplegar el modelo original.
- Investigacion sobre abliteracion: al preservar intactos los tensores GSQ y restaurar la asignacion de tipos, permite estudiar el efecto aislado de eliminar la direccion de rechazo sobre un modelo cuantizado, comparando contra el upstream con la misma cuantizacion.
- Despliegue en hardware modesto con contexto largo: la variante Q2_0 de 38,0 GB permite ejecutar un modelo de 176,9 B parametros en configuraciones de una o dos GPU de 24-48 GB, manteniendo la ventana de 262K para tareas de resumen de documentos extensos.
- Analisis de documentos e imagenes: el pipeline image-text-to-text habilita la extraccion de informacion de capturas, diagramas y documentos escaneados combinados con texto largo, aprovechando el contexto de 262K.
- Experimentacion local con llama.cpp: al ser GGUF puro, se integra en flujos de trabajo con Ollama o LM Studio para prototipado rapido sin infraestructura de servidor.
- Estudio de cuantizacion aprendida: el repositorio permite comparar la calidad de IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 sobre el mismo modelo base, util para investigar el compromiso entre tamano y fidelidad en cuantizaciones de muy baja precision.
- Evaluacion comparativa de alineamiento: util como contrapunto "sin censura" en estudios que miden como varia la tasa de rechazo entre el modelo original, el abliterado y variantes intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto KV. Con Q2_0 (38,0 GB) se necesitan del orden de 40-44 GB; con IQ3_S (55,1 GB), del orden de 57-62 GB. Los valores para IQ3_XXS e IQ2_XS no estan disponibles, aunque por su posicion en la escala deberian situarse entre Q2_0 e IQ3_S.
- GPU recomendadas: para IQ3_S, una A100 80 GB o H100 80 GB cubren el modelo con margen para contexto; para Q2_0, dos RTX 4090 (24 GB cada una, 48 GB en total) o una RTX A6000 de 48 GB son suficientes en el limite.
- Cabe en consumer GPU: si, en configuracion multi-GPU. Una sola RTX 4090 de 24 GB no es suficiente para ninguna de las cuantizaciones listadas; se requieren al menos dos para Q2_0.
- Opciones de despliegue: llama.cpp (referencia principal, dado el formato GGUF), Ollama, LM Studio, y servidores compatibles con endpoints. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, las cuantizaciones IQ2/IQ3 implican kernels de dequantizacion en tiempo de ejecucion y un throughput inferior al de pesos de mayor precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Kory-22/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9 B (MoE) | 262K | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 | Apache 2.0 | Abliterado, multimodal, verificacion blake2b |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9 B (MoE) | 262K | GSQ + RCO | Apache 2.0 | Upstream alineado, misma base de cuantizacion |
| Modelo base Qwen3.8-Flash-Next (no cuantizado) | 176,9 B (MoE) | 262K | safetensors (fp/bf16) | no disponible en la informacion | Referencia de maxima calidad; requiere mucha mas VRAM |
| Otras releases abliteradas de la misma familia | no disponible | no disponible | no disponible | no disponible | Fuente de los 144 tensores transplantados; no identificada en la informacion |

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo del modelo: puede producir contenido danino, ilegal o inseguro sin las salvaguardas del modelo original. No es apto para despliegue directo orientado al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion en cuantizaciones de 2-3 bits: Q2_0 e IQ2_XS degradan la fidelidad de los pesos de forma notable, especialmente en tareas de razonamiento y matematicas.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- El repositorio ocupa 217,9 GB y no incluye pesos de alta precision: para obtener una version fp/bf16 hay que acudir al modelo base.
- No se documentan parametros activos ni numero de expertos, lo que dificulta estimar el coste computacional real por token.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterado; la responsabilidad legal del contenido generado recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.
- La verificacion blake2b se declara solo para el build IQ3_S; no se especifica si los demas niveles han pasado la misma comprobacion.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kory-22/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (upstream): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper de referencia citado en los tags (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper de referencia citado en los tags (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
