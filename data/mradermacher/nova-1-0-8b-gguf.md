# mradermacher/Nova-1-0.8B-GGUF

## Resumen

Nova-1-0.8B-GGUF es la version cuantizada en formato GGUF del modelo Nova-1-0.8B, desarrollado originalmente por HardcoreAI y empaquetado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.006 millones de parametros (1B) orientado a tareas de asistente, uso de herramientas (tool-use) y function-calling, con ajuste fino por instrucciones. Su tamano reducido lo hace apto para despliegue en hardware de consumo y entornos con recursos limitados.

El modelo se presenta como derivado de la familia Qwen3.5 (segun las etiquetas de la model card) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. La version GGUF facilita su ejecucion mediante llama.cpp, Ollama y otras herramientas compatibles, con un abanico de cuantizaciones que van desde Q2_K (0,6 GB) hasta f16 (2,1 GB).

Su relevancia actual radica en la demanda de modelos pequenos y eficientes capaces de gestionar flujos de agentes y llamadas a funciones en local, sin depender de infraestructura en la nube. No obstante, la informacion publica disponible sobre arquitectura detallada, contexto y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5 en la model card) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas de la model card lo asocian a la familia Qwen3.5, lo que sugiere una arquitectura transformer decoder-only, pero no se confirma explicitamente ni se detallan numero de capas, dimensiones ocultas, mecanismos de atencion ni tipo de tokenizador.

Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card unicamente indica que se trata de un modelo con ajuste fino por instrucciones (instruction-tuning) orientado a tool-use, function-calling y uso como asistente y agente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato de asistente multi-turno.
- Soporte de tool-use y function-calling, segun las etiquetas del modelo.
- Orientado a flujos de agente (agent) y razonamiento multi-paso, aunque sin datos que lo cuantifiquen.
- Capacidades multilingues limitadas a ingles (en) y ruso (ru) segun la model card.
- Presencia de ficheros mmproj (multi-modal supplement) en el repositorio, lo que sugiere soporte de entrada multimodal, aunque no se detalla el tipo de modalidad ni su alcance.
- Ajuste por instrucciones para seguimiento de comandos y tareas de asistente.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con cuantizaciones Q4_K_S o Q4_K_M (0,7-0,8 GB) el modelo puede ejecutarse en CPU o GPU integrada, gestionando dialogos multi-turno en ingles o ruso sin conexion a internet.
- Orquestacion de agentes con function-calling en prototipos: su soporte de tool-use permite integrarlo en pipelines donde el modelo decida que funcion invocar (APIs, consultas a bases de datos) antes de derivar la tarea a un modelo mayor.
- Enrutamiento y clasificacion de intenciones en produccion: por su tamano reducido y baja latencia potencial, puede emplearse como primera capa para clasificar consultas de usuario y decidir si se escalan a un modelo de mayor capacidad.
- Generacion de respuestas en asistentes de soporte tecnico para mercados angloparlantes y rusoparlantes: el soporte de ambos idiomas lo hace adecuado para bases de conocimiento bilingues en esas lenguas.
- Despliegue en entornos con restricciones de privacidad (edge computing, dispositivos air-gapped): al ser un modelo Apache 2.0 y ejecutable con llama.cpp, puede correr completamente en local sin enviar datos a terceros.
- Experimentacion e investigacion en modelos pequenos: util como baseline para estudiar el comportamiento de modelos de 1B en tareas de instruccion y tool-calling, o para fine-tuning posterior sobre dominios especificos.
- Integracion en aplicaciones de escritorio o moviles mediante Ollama o llama.cpp: el formato GGUF y los tamanos de 0,6-1,2 GB permiten empaquetar el modelo en aplicaciones distribuidas a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,0 GB con cuantizaciones Q2_K a Q5_K_M; en torno a 1,2 GB con Q8_0 y 2,1 GB con f16 (mas overhead del runtime, tipicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPUs profesionales, desde una T4 en adelante es sobradamente suficiente. Tambien puede ejecutarse en A100/H100, aunque el modelo no aprovechara su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y herramientas compatibles con GGUF; el modelo original (safetensors) puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova-1-0.8B (este) | ~1,0B | no disponible | Apache 2.0 | GGUF, safetensors | Tool-use y function-calling; en/ru |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (segun version) | Apache 2.0 | GGUF, safetensors | Familia ampliamente documentada, multilingue |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | GGUF, safetensors | Multilingue, restricciones de licencia para grandes despliegues |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | GGUF, safetensors | Mayor tamano, requiere aceptar terminos |

La comparacion se ofrece a titulo orientativo: no se dispone de datos de rendimiento de Nova-1-0.8B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan contexto maximo, arquitectura detallada, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion elevado por su tamano (1B parametros); no es adecuado para tareas que exijan alta precision factual sin verificacion externa.
- Cobertura linguistica limitada a ingles y ruso; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Sesgos conocidos: no disponibles, pero al ser un modelo pequeno entrenado con datos no especificados, cabe esperar sesgos similares a los de su corpus de entrenamiento.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar la procedencia de los datos de entrenamiento y las condiciones del modelo base original.
- El soporte multimodal (ficheros mmproj) no esta documentado en detalle; su comportamiento real con imagenes u otras modalidades no esta verificado.
- No se recomienda su uso como unico modelo en aplicaciones criticas sin evaluacion previa en el dominio concreto.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Nova-1-0.8B-GGUF
- Modelo base original: https://huggingface.co/HardcoreAI/Nova-1-0.8B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Nova-1-0.8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
