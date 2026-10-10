# ArchiveStudio/Phi-3-medium-4k-instruct

## Resumen

Phi-3-medium-4k-instruct es un modelo de lenguaje de 13.960.238.080 parametros (aproximadamente 14B) desarrollado por Microsoft como parte de la familia Phi-3. Se trata de un transformer decoder-only denso, disenado para entornos con recursos de computo y memoria limitados, escenarios con requisitos de baja latencia y tareas que exigen razonamiento fuerte, especialmente en codigo, matematicas y logica. La version aqui catalogada es un espejo publicado por el usuario ArchiveStudio en HuggingFace, con licencia MIT y pesos en safetensors.

El modelo fue entrenado sobre los datasets de Phi-3, que combinan datos sinteticos con datos filtrados de webs publicas, priorizando contenido de alta calidad y denso en razonamiento. El post-entrenamiento incluye ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO) para mejorar el seguimiento de instrucciones y la seguridad. Su ventana de contexto es de 4.096 tokens, muy inferior a la de la variante Phi-3-medium-128k-instruct del mismo tamano.

La relevancia de esta ficha radica en que el modelo es un candidato razonable para despliegues en una sola GPU consumer o en una A100, con licencia MIT que permite uso comercial. No obstante, el repositorio concreto analizado no aporta resultados de benchmarks ni documentacion adicional mas alla de la model card original de Microsoft, y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`Phi3ForCausalLM`, requiere `trust_remote_code=True`) |
| Parametros totales | 13.960.238.080 (aproximadamente 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (variante 4K) |
| Tipos de cuantizacion | no especificados en el repositorio; los pesos se distribuyen en safetensors de precision completa. Existen conversiones comunitarias a GGUF, GPTQ y AWQ para el modelo original de Microsoft, no confirmadas para este espejo |
| Idiomas soportados | metadato "multilingual"; la model card de Microsoft indica uso principal en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 27,9 GB |
| Vocabulario del tokenizador | 32.064 tokens |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only, sin mezcla de expertos ni mecanismos de estado recurrente. El repositorio incluye codigo personalizado, por lo que la carga requiere `trust_remote_code=True` y una version de `transformers` igual o superior a la de desarrollo 4.40.2. El tokenizador admite hasta 32.064 tokens e incluye tokens reservados pensados para fine-tuning posterior. El formato de chat esperado es `<|user|>\nPregunta <|end|>\n<|assistant|>`, con soporte de plantillas de pocos ejemplos.

En cuanto a los datos, Microsoft indica que el modelo se entreno con los datasets de Phi-3, que mezclan datos sinteticos generados y datos filtrados de webs publicas seleccionados por su densidad de razonamiento. El post-entrenamiento combina SFT y DPO. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset, ni innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa. No se documenta en este repositorio informacion sobre la configuracion de capas, cabezas de atencion o tipo de posicional encoding empleado.

## Capacidades

- Generacion de texto conversacional siguiendo la plantilla de chat oficial del modelo.
- Razonamiento logico y resolucion de problemas de matematicas, segun la propia model card.
- Generacion y comprension de codigo, una de las areas declaradas como objetivo principal de entrenamiento.
- Comprension de lenguaje natural y sentido comun en tareas de evaluacion estandar.
- Soporte multilingue a nivel de metadatos, aunque el entrenamiento declarado se centra en ingles.
- Capacidad de fine-tuning posterior aprovechando los tokens reservados del tokenizador.
- Soporte de contexto de 4.096 tokens, adecuado para conversaciones cortas y documentos breves.
- Tool calling o function calling: no documentado en la informacion disponible.
- Uso en agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Vision y audio: no soportados en esta variante.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno de complejidad media, aunque su ventana de 4.096 tokens limita el historial acumulable; es adecuado para flujos con resumen periodico del dialogo.
- Generacion y revision de codigo en produccion: puede integrarse en pipelines de revision de pull requests o generacion de tests unitarios; su licencia MIT permite uso comercial sin obligaciones de atribucion adicionales.
- Asistente de matematicas y logica para entornos educativos: la model card destaca el rendimiento en tareas densas en razonamiento, lo que encaja en aplicaciones de tutoria y resolucion guiada de ejercicios.
- Extraccion de informacion estructurada: transformar texto no estructurado en JSON, tablas o formularios, con prompts de formato estricto y validacion posterior.
- Sistemas RAG con contexto corto: recuperacion de fragmentos pequenos y generacion de respuestas ancladas en esos fragmentos, aprovechando el bajo coste de inferencia de un modelo de 14B.
- Clasificacion y enrutado de tickets: categorizacion de consultas, asignacion de prioridad y generacion de respuestas predefinidas en sistemas de soporte.
- Fine-tuning de dominio: al liberar los pesos bajo MIT e incluir tokens reservados, permite adaptar el modelo a jerga sectorial (legal, medico, industrial) con datasets propios relativamente pequenos.
- Generacion de documentacion tecnica: redaccion de docstrings, changelogs y notas de version a partir de diffs de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de Microsoft afirma que el modelo muestra un rendimiento "robusto y de ultima generacion entre modelos del mismo tamano y del siguiente nivel", pero no adjunta cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la informacion proporcionada. No se deben extrapolar numeros de otras fuentes.

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del numero de parametros (13,96B) y no proceden de mediciones publicadas en la informacion disponible.

- Inferencia en FP16/BF16: aproximadamente 28 GB solo para los pesos, mas overhead de activaciones y cache KV. En la practica, alrededor de 30-32 GB para contexto de 4K.
- Inferencia en INT8: aproximadamente 14 GB para los pesos, mas overhead; en torno a 16-18 GB en total.
- Inferencia en INT4: aproximadamente 7-8 GB para los pesos, mas overhead; en torno a 10-12 GB en total, segun el backend.
- GPU recomendadas en FP16: A100 40GB, A100 80GB, H100 80GB o configuraciones multi-GPU con tensor parallelism (por ejemplo, 2 x RTX 4090).
- GPU recomendadas en INT8: A6000 48GB, L40S 48GB o una RTX 4090 24GB con margen ajustado.
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) unicamente con cuantizacion INT8 o INT4. En tarjetas de 12 GB es viable solo con cuantizacion INT4 agresiva y posible offloading.
- Opciones de despliegue: `transformers` (version de desarrollo 4.40.2 o superior, con `trust_remote_code=True`), vLLM, TGI, ONNX Runtime (Microsoft publica versiones ONNX del modelo original), llama.cpp y Ollama mediante conversiones comunitarias a GGUF no confirmadas para este espejo concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3-medium-4k-instruct (este repositorio) | 13,96B | 4.096 tokens | MIT | safetensors, codigo personalizado |
| Phi-3-medium-128k-instruct (Microsoft) | 13,96B | 128.000 tokens | MIT | safetensors, ONNX; misma familia con contexto extendido |
| Phi-3-small-8k-instruct (Microsoft) | 7B | 8.000 tokens | MIT | safetensors, ONNX; menor coste de inferencia |
| Phi-3-mini-4k-instruct (Microsoft) | 3,8B | 4.096 tokens | MIT | safetensors, ONNX, GGUF; cabe en GPU consumer sin cuantizar |
| Mistral-Nemo-12B-Instruct | 12B | 128.000 tokens | Apache 2.0 | safetensors, GGUF, amplio soporte de backends |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ |

No se dispone de comparativas de rendimiento medidas en benchmarks para este modelo en la informacion proporcionada, por lo que la tabla se limita a parametros, contexto, licencia y formatos de distribucion.

## Limitaciones y advertencias

- La ventana de 4.096 tokens es insuficiente para documentos largos, analisis de repositorios completos o conversaciones extensas sin resumen intermedio. Para esos casos conviene la variante de 128K.
- Aunque el metadato declare soporte multilingue, la model card de Microsoft indica que el modelo esta pensado para uso en ingles; el rendimiento en castellano no esta validado en la informacion disponible.
- El modelo se entreno con datos sinteticos, lo que puede producir respuestas plausibles pero factualmente incorrectas con mayor facilidad que un modelo entrenado solo con datos naturales. Riesgo de alucinacion relevante en produccion.
- No se documentan en el repositorio evaluaciones de sesgo, seguridad o toxicidad, ni procesos de mitigacion especificos para esta copia.
- No se documenta soporte de tool calling ni de razonamiento multi-paso para agentes; cualquier uso en ese sentido dependeria de ingenieria de prompts y no de un formato entrenado.
- La licencia MIT permite uso comercial, pero el titular original de los pesos es Microsoft; conviene verificar la trazabilidad de este espejo publicado por un tercero antes de usarlo en produccion.
- El repositorio registra 0 descargas y 0 likes y su fecha de creacion indicada (2026-10-10) resulta inconsistente; se recomienda contrastar la integridad de los pesos frente al repositorio oficial de Microsoft.
- Requiere `trust_remote_code=True` por incluir codigo personalizado, lo que implica ejecutar codigo del repositorio al cargar el modelo; conviene auditar ese codigo en entornos sensibles.
- No se han publicado datos de latencia ni de throughput, por lo que las estimaciones de capacidad deben validarse con pruebas propias antes de dimensionar infraestructura.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Phi-3-medium-4k-instruct
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
- Variante de contexto extendido: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct
- Blog de Phi-3 de Microsoft: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook (GitHub): https://github.com/microsoft/Phi-3CookBook
- Familia Phi-3.5: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Familia Phi-3.5 MoE: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Familia Phi-3.5 Vision: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relacion con el contenido de la ficha y se han descartado.
