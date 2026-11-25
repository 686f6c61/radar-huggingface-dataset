# mradermacher/Carnice-V3-GGUF

## Resumen

Carnice-V3 es un modelo de lenguaje conversacional de tipo transformer con aproximadamente 27.320 millones de parametros, publicado por el usuario kai-os y cuantizado en formato GGUF por mradermacher. El modelo se distribuye como un merge de LoRA sobre una base identificada en sus etiquetas como qwen3.8, orientado especificamente a tareas de agente, uso de herramientas (tool-use) y conversacion multi-turno. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La ficha que nos ocupa corresponde a la version cuantizada estatica del repositorio original kai-os/Carnice-V3, no al modelo en precision completa. mradermacher ofrece un abanico de cuantizaciones que va desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de un proyector multimodal (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de vision. El repositorio completo ocupa 190,8 GB, incluyendo todos los ficheros GGUF y los pesos originales en safetensors.

El interes practico de esta publicacion radica en que permite ejecutar un modelo de ~27B con capacidades de agente y vision en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de infraestructura de datacenter. No obstante, la informacion publica disponible es muy limitada: no se detallan datos de entrenamiento, longitud de contexto, benchmarks ni composicion del dataset, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de qwen3.8, segun etiquetas del autor) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; variantes imatrix en el repo Carnice-V3-i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. Las etiquetas del repositorio indican que se trata de un transformer derivado de la familia qwen3.8, con un total de 27.320.697.856 parametros, y que el modelo final es el resultado de un merge de LoRA (etiqueta `merged-lora`) sobre el modelo base kai-os/Carnice-V3. La presencia de ficheros `mmproj` en el repositorio GGUF confirma que el modelo incorpora un proyector multimodal para entrada de imagenes, aunque no se especifica la arquitectura del encoder visual.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las etiquetas `hermes-agent` y `tool-use` sugieren un ajuste fino orientado a seguir formatos de llamada a herramientas compatibles con el esquema Hermes, pero se trata de una inferencia a partir de metadatos, no de documentacion explicita.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Uso de herramientas y function calling, segun las etiquetas `tool-use` y `hermes-agent` del repositorio.
- Comportamiento orientado a agentes, incluyendo razonamiento multi-paso para encadenar llamadas a herramientas.
- Procesamiento de imagenes mediante el proyector multimodal incluido (mmproj Q8_0 y f16).
- Capacidades multilingues limitadas: el campo `language` solo declara ingles.
- No se documentan modos especiales como thinking mode explicito, audio o generacion de codigo especializada.

## Casos de uso

- Agentes de automatizacion con llamada a herramientas: el modelo puede integrarse en un bucle de agente que consulte APIs externas, ya que su ajuste esta orientado a tool-use con formato Hermes. Requiere un orquestador (por ejemplo, un framework de agentes) que gestione el estado de la conversacion.
- Asistentes conversacionales autoalojados: con cuantizaciones Q4_K_M de 16,9 GB, puede desplegarse en una sola GPU de consumo para dar servicio a un asistente de chat en ingles sin dependencia de APIs externas.
- Procesamiento de documentos con imagenes: gracias al proyector multimodal, permite extraer informacion de capturas, diagramas o formularios escaneados combinando texto e imagen en la misma peticion.
- Prototipado rapido de pipelines de agentes: al estar disponible en GGUF, se puede probar con llama.cpp u Ollama en estaciones de trabajo antes de escalar a un modelo mayor, validando prompts y esquemas de herramientas.
- Despliegue en entornos con requisitos de soberania del dato: la licencia Apache 2.0 y la ausencia de dependencia de servicios en la nube permiten ejecutarlo en infraestructura propia para datos sensibles.
- Educacion e investigacion sobre tecnicas de merge de LoRA: el modelo sirve como caso de estudio de un merge de adaptadores sobre una base Qwen, con cuantizaciones publicas para comparar degradacion por tipo de quant.
- Generacion de respuestas en ingles para soporte tecnico: con contexto suficiente (longitud no documentada), puede gestionar hilos de tickets, aunque la falta de datos sobre la ventana de contexto obliga a validar este extremo antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (11,0 GB): ~12-13 GB, viable en RTX 4080/4090 de 16-24 GB.
  - Q3_K_M (13,6 GB): ~15-16 GB, requiere 16 GB o mas.
  - IQ4_XS (15,5 GB) y Q4_K_S (15,9 GB): ~17-18 GB, ajustado en GPUs de 24 GB.
  - Q4_K_M (16,9 GB): ~18-19 GB, comodo en RTX 4090 (24 GB) o A5000/A6000.
  - Q5_K_M (19,6 GB) y Q6_K (22,5 GB): ~21-24 GB, requiere 24 GB o reparto CPU/GPU.
  - Q8_0 (29,1 GB): ~31-32 GB, requiere A100 40 GB, H100 o configuracion multi-GPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB u H100 para Q8_0; RTX 3090/4080 para Q2_K y Q3_K.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, transformers con vLLM o TGI (no verificado para esta arquitectura concreta).
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud para un modelo denso de ~27B en Q4_K_M sobre RTX 4090, cabe esperar decenas de tokens por segundo, pero no se ha publicado ninguna medicion para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Carnice-V3 (esta ficha) | ~27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Merge de LoRA sobre base qwen3.8, tool-use, multimodal |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Base conocida de la familia Qwen, ampliamente soportada |
| Gemma 2 27B IT | 27B | 8.192 tokens | Gemma license | safetensors, GGUF | Tamano comparable, licencia mas restrictiva |
| Mistral Small 24B | 24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con tool calling nativo |

La comparacion con Qwen2.5-32B-Instruct es la mas relevante por la filiacion declarada del modelo, aunque no se dispone de datos que permitan afirmar equivalencia de rendimiento. Las cifras de contexto de los modelos comparados corresponden a sus fichas publicas y no se han verificado contra la de Carnice-V3, que no las declara.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas de agente, lo que impide comparar con alternativas de forma rigurosa.
- Idioma: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente degradado.
- Longitud de contexto no documentada: no se puede asumir una ventana larga para casos de uso con documentos extensos o conversaciones prolongadas.
- Riesgo de alucinacion: inherente a los modelos de ~27B sin datos de evaluacion; el ajuste para tool-use puede producir llamadas a funciones con argumentos inventados si el esquema no se valida externamente.
- Procedencia del modelo: es un merge de LoRA sobre una base no identificada con precision (etiqueta `qwen3.8`), sin model card detallada del autor original; la trazabilidad de datos de entrenamiento es nula.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Multimodalidad no verificada: la presencia de mmproj indica soporte de vision, pero no se documentan resoluciones, tipos de imagen ni calidad del encoder.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el cumplimiento de las licencias de la base subyacente, no documentadas en esta ficha.
- Repositorio con muy poca traccion (342 descargas, 1 like) y sin comunidad que reporte comportamientos en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Carnice-V3-GGUF
- Modelo base: https://huggingface.co/kai-os/Carnice-V3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Carnice-V3-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Carnice-V3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
