# jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED

## Resumen

KAT-Coder V2.5 Dev 35B-A3B MTP Abliterated es un modelo de lenguaje de codificacion basado en una arquitectura Mixture-of-Experts (MoE) derivada de Qwen3.5, desarrollado por el usuario jakeroxs como un checkpoint fusionado. Combina la variante "Philadelphia Class" de KAT-Coder V2.5 Dev, que ha sido sometida a un proceso de abliteracion para reducir comportamientos de rechazo, con la capa de Multi-Token Prediction (MTP) del modelo original, lo que permite decodificacion especulativa y prediccion de multiples tokens por paso. El modelo esta pensado principalmente para flujos de trabajo de codificacion local y agente, asi como para experimentacion con decodificacion especulativa.

Con aproximadamente 35,51 mil millones de parametros totales y solo unos 3 mil millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. Su contexto nativo de 262.144 tokens lo hace adecuado para tareas que requieren ventanas largas, como analisis de repositorios completos o generacion de documentacion extensa. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el formato de pesos safetensors facilita su integracion en pipelines de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (`qwen35moe`) |
| Parametros totales | 35.510.000.000 (aprox.) |
| Parametros activos | 3.000.000.000 (aprox.) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; se referencia una version GGUF aparte) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con indice JSON) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 256 expertos, de los cuales se activan 8 por token, lo que reduce el coste computacional por inferencia manteniendo una alta capacidad de representacion. La capa MTP anadida (una unica capa de prediccion multi-token) permite que el modelo prediga varios tokens futuros simultaneamente, habilitando tecnicas de decodificacion especulativa que aceleran la generacion sin sacrificar calidad. El checkpoint fusionado no ha sido reentrenado; simplemente combina los pesos de la variante abliterada con los tensores MTP del modelo original, manteniendo intactas las capacidades de codificacion subyacentes.

El proceso de abliteracion, aplicado en el checkpoint base "Philadelphia Class", modifica representaciones internas asociadas con comportamientos de rechazo, con el objetivo de reducir la negativa a responder a ciertas solicitudes. No implica un reentrenamiento y no garantiza un comportamiento especifico. Los datos de entrenamiento originales del modelo KAT-Coder V2.5 Dev no se detallan en la informacion disponible, pero se asume que incluyen un corpus extenso de codigo y texto tecnico en ingles y chino, dado su proposito de codificacion.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con soporte para razonamiento algoritmico y resolucion de problemas de programacion.
- Razonamiento multi-paso y planificacion de tareas complejas, util para agentes de codificacion autonomos.
- Soporte de tool calling y function calling, permitiendo integracion con APIs y herramientas externas.
- Capacidad de decodificacion especulativa gracias a la capa MTP, acelerando la generacion en entornos que soporten esta tecnica.
- Ventana de contexto de 262.144 tokens, adecuada para procesar repositorios completos, documentacion extensa o conversaciones de multiples turnos.
- Multilingue limitado a ingles y chino, con mayor solidez en contextos tecnicos y de codigo.
- Comportamiento "uncensored" reducido por la abliteracion, aunque sin garantias de consistencia.

## Casos de uso

- Asistente de codificacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar funciones, generar tests unitarios y refactorizar codigo, aprovechando su contexto largo para entender el proyecto completo.
- Agente de codificacion autonomo: gracias a su soporte de tool calling y razonamiento multi-paso, puede ejecutar tareas como "arreglar el bug en el modulo de autenticacion" navegando por el repositorio, editando archivos y ejecutando comandos.
- Generacion de documentacion tecnica: con su ventana de 262K tokens, puede analizar un codigo base extenso y producir documentacion API, guias de contribucion o resumenes de arquitectura.
- Revision de codigo automatizada: el modelo puede revisar pull requests, detectar posibles errores, problemas de estilo y sugerir mejoras, utilizando su capacidad de razonamiento sobre grandes fragmentos de codigo.
- Decodificacion especulativa en produccion: al incluir la capa MTP, puede desplegarse con motores de inferencia que soporten esta tecnica (como llama.cpp con parche especifico) para reducir la latencia en servicios de generacion de codigo.
- Experimentacion en investigacion: el checkpoint fusionado es util para estudiar el impacto de la abliteracion y la MTP en modelos MoE de codificacion, comparando comportamientos con la version original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en los casos de uso especificos antes de adoptarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE con 3B parametros activos, la memoria necesaria depende de la cuantizacion. En precision FP16, los pesos completos ocupan aproximadamente 71 GB (tamano del repo), por lo que se requiere una GPU con al menos 80 GB (p. ej., A100 80GB o H100) para carga completa. Con cuantizacion a 4 bits (GGUF Q4_K_M), el modelo podria caber en una GPU consumer de 24 GB (RTX 3090/4090), aunque la version GGUF se publica por separado.
- GPU recomendadas: A100 80GB, H100, o GPUs consumer de 24 GB con cuantizacion agresiva (RTX 3090, RTX 4090).
- Opciones de despliegue: vLLM, llama.cpp (con soporte MTP), Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y otros frameworks compatibles con safetensors.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP puede reducir la latencia entre un 20-40% en cargas de generacion largas, pero depende del hardware y del batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Cualitativamente, se puede situar frente a otros MoE de codificacion:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| KAT-Coder V2.5 Dev 35B-A3B MTP Abliterated | 35,5B | ~3B | 262K | Apache 2.0 | Abliterado, con MTP |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | MIT | MoE, sin abliteracion |
| Qwen2.5-Coder-32B | 32B | 32B (dense) | 128K | Apache 2.0 | Denso, sin MTP |

La comparacion es orientativa; el rendimiento real depende de la tarea y del hardware.

## Limitaciones y advertencias

- La abliteracion no garantiza un comportamiento consistente; puede producir respuestas inesperadas o sesgadas en ciertos dominios.
- Riesgo de alucinacion en codigo: como cualquier LLM, puede generar codigo sintacticamente valido pero semanticamente incorrecto, especialmente en APIs poco comunes.
- Limitacion de idiomas: solo ingles y chino; no se recomienda para otros idiomas sin fine-tuning adicional.
- La capa MTP requiere soporte especifico en el motor de inferencia; si no se usa, el modelo funciona como un MoE estandar sin beneficio de velocidad.
- El checkpoint fusionado no ha sido validado con benchmarks publicos; su rendimiento en tareas de codificacion debe verificarse empiricamente.
- La licencia Apache 2.0 permite uso comercial, pero los modelos base (KAT-Coder V2.5 Dev) pueden tener restricciones adicionales; se recomienda revisar sus licencias originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED
- Version GGUF: https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Modelo original: https://huggingface.co/KwaiPilot/KAT-Coder-V2.5-Dev
- Checkpoint abliterado base: https://huggingface.co/KridgeDookie/KAT-Coder-V2.5-Dev-35B-A3B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Cabecera MTP: https://huggingface.co/Myric/KAT-Coder-V2.5-Dev-MTP-head
