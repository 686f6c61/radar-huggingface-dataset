# Audante/gemma-4-12B-it-qat-GGUF-q4_0

## Resumen

Gemma 4 12B Instruct es un modelo de lenguaje conversacional desarrollado por Google, distribuido originalmente en formato GGUF con cuantizacion Q4_0 y entrenamiento con cuantizacion consciente (QAT, *Quantization-Aware Training*). Esta ficha describe la republicacion realizada por el usuario Audante en Hugging Face, que segun su propia model card es una copia byte a byte del repositorio oficial `google/gemma-4-12B-it-qat-q4_0-gguf` en la revision `29d097773436b69ff9feafd636ab4cf873786537`, sin modificaciones en los ficheros.

El modelo cuenta con aproximadamente 11.907 millones de parametros (11,9 B) y esta orientado a tareas de generacion de texto y conversacion multi-turno. Al tratarse de una cuantizacion QAT en Q4_0, el objetivo es ofrecer un equilibrio entre calidad y huella de memoria reducida, lo que facilita su despliegue en hardware de gama consumer mediante runtimes compatibles con GGUF como llama.cpp u Ollama.

La relevancia de esta ficha radica en que documenta una redistribucion no oficial: el autor no aporta cambios tecnicos ni datos adicionales sobre el modelo base, por lo que la mayor parte de las especificaciones (contexto, idiomas, datos de entrenamiento, benchmarks) no estan disponibles en la informacion proporcionada y deben consultarse en el repositorio original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-12B-it-qat-q4_0-gguf) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF), con entrenamiento QAT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El identificador del modelo base (`gemma-4-12B-it-qat-q4_0-gguf`) indica que se trata de un transformer de la familia Gemma 4 en su variante *instruct* (ajustada para seguir instrucciones), con cuantizacion consciente durante el entrenamiento (QAT) a 4 bits en formato Q4_0. El sufijo `it` confirma el ajuste por instrucciones, aunque no se especifican en la informacion disponible los detalles del dataset, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

La republicacion de Audante no introduce ninguna modificacion: la model card afirma explicitamente que los ficheros son identicos a los del repositorio de origen y que se incluye un fichero `SHA256SUMS` con los checksums para verificar la integridad. Por tanto, cualquier innovacion tecnica (atencion, decodificacion especulativa, etc.) debe consultarse en la documentacion oficial de Google, no incluida aqui.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en formato chat (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Ejecucion en runtimes que soportan GGUF (llama.cpp, Ollama y derivados).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo *thinking*: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un equipo de sobremesa mediante llama.cpp u Ollama gracias a su formato GGUF Q4_0, que reduce la huella de memoria frente a los pesos en precision completa.
- Prototipado rapido de chatbots: al ser un modelo *instruct* con licencia Apache 2.0, permite integrar un asistente en aplicaciones internas sin coste de licencia y con requisitos de hardware moderados.
- Procesamiento por lotes de texto en CPU/GPU modestas: la cuantizacion Q4_0 facilita ejecutar tareas de resumen, clasificacion o reescritura en infraestructura sin GPUs de datacenter.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de Q4_0 QAT frente a pesos en BF16/FP16 del mismo modelo base.
- Entornos con requisitos de reproducibilidad: la presencia de checksums SHA256 permite verificar la integridad de los pesos en pipelines de despliegue automatizado.
- Educacion e investigacion: util para estudiar el impacto del entrenamiento QAT en modelos de ~12 B y para experimentar con tecnicas de inferencia en local.
- Aplicaciones offline o con privacidad estricta: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,0 GB, por lo que la inferencia en Q4_0 requiere del orden de 7-8 GB de memoria (pesos mas overhead de contexto y KV cache), aunque el valor exacto depende de la longitud de contexto y del runtime.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, GPUs consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) serian candidatas para Q4_0; GPUs de datacenter (A100, H100) permitirian mayor contexto y throughput.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con al menos 8 GB de VRAM, aunque no se confirma en la documentacion.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag `endpoints_compatible` sugiere uso con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Redistribucion no oficial: el autor indica explicitamente que no es un lanzamiento oficial de Google y que no aporta cambios; para soporte o garantias debe acudirse al repositorio original.
- Ausencia de datos tecnicos: no se documentan contexto, idiomas, composicion del entrenamiento ni benchmarks en esta ficha.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se dispone de evaluaciones especificas para este checkpoint.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero los derechos del modelo permanecen con sus autores originales; conviene revisar el fichero `LICENSE` del repositorio.
- Cuantizacion Q4_0: puede implicar perdida de calidad frente a los pesos originales en precision completa, aunque el entrenamiento QAT esta disenado para mitigarla.
- Verificacion de integridad: se recomienda comprobar los checksums de `SHA256SUMS` antes de desplegar los pesos.

## Enlaces

- Repositorio de la republicacion: https://huggingface.co/Audante/gemma-4-12B-it-qat-GGUF-q4_0
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Revision citada del modelo base: `29d097773436b69ff9feafd636ab4cf873786537`
