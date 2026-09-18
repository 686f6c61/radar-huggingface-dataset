# dodgeqtr/jojo-sovereign-trained

## Resumen

jojo-sovereign-trained es un ajuste fino (finetune) del modelo Llama-3.2-3B-Instruct, publicado por el usuario dodgeqtr en HuggingFace y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio contiene un único fichero cuantizado `Llama-3.2-3B-Instruct.Q4_K_M.gguf`, lo que sitúa el peso real del modelo en torno a 2 GB en disco. El propio autor indica que el entrenamiento y la conversión a GGUF se realizaron con Unsloth, y que el modelo se entrenó "2x faster" gracias a esa herramienta.

Se trata de un modelo de 3.212.749.888 parámetros totales (3,21 mil millones), arquitectura transformer decoder-only de la familia Llama 3.2, orientado a uso conversacional. La ficha del autor no documenta el conjunto de datos de ajuste, el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el 17 de septiembre de 2026.

Su relevancia práctica es la de un modelo pequeño, ligero y desplegable en hardware de consumo, pensado para inferencia local en CPU o GPU modesta mediante llama.cpp u Ollama. No obstante, al carecer de benchmarks, de licencia declarada y de documentación de entrenamiento, debe considerarse un artefacto experimental o de uso interno, no un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, segun el nombre del fichero de pesos) |
| Parametros totales | 3.212.749.888 (aproximadamente 3,21 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor (el modelo base Llama-3.2-3B-Instruct soporta 128.000 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); al ser GGUF es compatible con el resto de niveles de cuantizacion que ofrece llama.cpp si se reconvierte |
| Idiomas soportados | No disponible (no declarados por el autor) |
| Licencia | No disponible (el autor no declara licencia; el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License) |
| Formato de pesos | GGUF (fichero `Llama-3.2-3B-Instruct.Q4_K_M.gguf`); no se publican safetensors |
| Tamano del repositorio | 2,0 GB |
| Etiquetas declaradas | gguf, llama, llama.cpp, unsloth, endpoints_compatible, region:us, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Llama 3.2 en su variante de 3B: un transformer decoder-only autorregresivo con normalizacion RMSNorm, activacion SwiGLU y tokenizador BPE de Llama 3. La ficha no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni si emplea Grouped Query Attention, aunque el modelo base Llama-3.2-3B-Instruct si la utiliza. El nombre del fichero de pesos identifica explicitamente el punto de partida: `Llama-3.2-3B-Instruct`.

El proceso de entrenamiento documentado se limita a dos afirmaciones del autor: el ajuste fino y la conversion a GGUF se hicieron con Unsloth, y el entrenamiento fue "2x faster" gracias a dicha libreria. No se especifica el dataset, el numero de tokens, la duracion del entrenamiento, la tasa de aprendizaje, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ORPO. Tampoco se describe ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). El unico detalle adicional relevante es que el comportamiento del token BOS se ajusto para garantizar la compatibilidad con GGUF, algo habitual al convertir modelos Llama a ese formato.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y parte de una variante Instruct, por lo que el dialogo multi-turno es su uso previsto principal.
- Razonamiento basico y respuesta a instrucciones: heredado del modelo base Llama-3.2-3B-Instruct, sin confirmacion especifica por parte del autor.
- Generacion de codigo: capacidad esperable por herencia del modelo base, no verificada ni documentada para este finetune.
- Soporte de plantillas de chat: la ficha recomienda el uso de `--jinja` en llama.cpp, lo que implica que el modelo incluye una plantilla de chat en formato Jinja utilizable por el runtime.
- Despliegue en Ollama: el repositorio incluye un Modelfile para su carga directa.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse a traves de infraestructura compatible con la API de HuggingFace.
- Tool calling y function calling: no disponible; no se documenta soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Capacidades multimodales: no disponible. La ficha menciona el comando `llama-mtmd-cli` como referencia generica de uso, pero el modelo publicado es un LLM de texto, no un modelo multimodal.

## Casos de uso

- Asistente conversacional local en equipos de sobremesa o portatiles: con un fichero Q4_K_M de aproximadamente 2 GB, el modelo puede ejecutarse integramente en CPU mediante llama.cpp u Ollama, sin conexion a internet y sin enviar datos a terceros, lo que encaja en escenarios de soberania de datos.
- Prototipado rapido de aplicaciones de chat: permite validar plantillas de prompt, flujos de conversacion multi-turno y mecanicas de sistema antes de migrar a un modelo mayor, con un coste de hardware minimo.
- Procesamiento por lotes de texto (resumen, reformulacion, extraccion): al ser un modelo pequeno, es viable ejecutar grandes volumenes de peticiones en una sola GPU de consumo o incluso en CPU, con un coste por token muy bajo.
- Clasificacion y etiquetado de texto asistido: tareas de categorizacion de tickets, correos o comentarios mediante prompts de few-shot, aprovechando el formato conversacional del modelo.
- Base para ajustes finos adicionales con Unsloth: el hecho de que el autor haya usado Unsloth facilita reentrenar o especializar el modelo en un dominio concreto sobre el mismo pipeline, incluida la exportacion a GGUF.
- Inferencia en el borde (edge) o en entornos sin acelerador: al no requerir GPU para la cuantizacion Q4_K_M, puede desplegarse en mini-PC, servidores de laboratorio modestos o dispositivos ARM con llama.cpp, aceptando una latencia mayor.
- Generacion de codigo asistida en entornos aislados: para autocompletado o explicacion de fragmentos en entornos air-gapped donde no se permite el acceso a APIs comerciales, siempre que se valide previamente la calidad real del finetune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Cualquier otra evaluacion | No disponible |

El autor no incluye ninguna tabla de evaluacion ni comparacion cuantitativa con otros modelos, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este repositorio (los resultados obtenidos corresponden a un servicio de traduccion sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada en Q4_K_M: aproximadamente 2,0-2,5 GB para los pesos, mas el espacio de contexto y las estructuras de KV cache; en la practica, entre 2,5 y 4 GB dependiendo de la longitud de contexto configurada.
- VRAM estimada en FP16/BF16 (si se reexporta desde el modelo base): en torno a 6,5-7 GB solo para pesos.
- GPU de consumo: cabe holgadamente en cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super con 6 GB en cuantizaciones mas agresivas). Tambien es viable en GPUs integradas con memoria compartida, con rendimiento reducido.
- GPU profesionales: no requiere A100, H100 ni similares; su uso en esas tarjetas solo tiene sentido para servir muchas peticiones concurrentes.
- CPU: puede ejecutarse integramente en CPU con llama.cpp; un procesador moderno de 8 nucleos es suficiente para uso interactivo con una sola peticion.
- Opciones de despliegue: llama.cpp (`llama-cli -hf dodgeqtr/jojo-sovereign-trained --jinja`), Ollama (el repositorio incluye Modelfile), Unsloth para reentrenamiento y conversion, y cualquier servidor compatible con la API de HuggingFace que acepte GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos de comparacion corresponden a informacion publica de sus respectivas fichas tecnicas y no proceden de la documentacion de jojo-sovereign-trained, que no ofrece ninguna comparativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| jojo-sovereign-trained | 3,21 mil millones | No disponible | No disponible | GGUF Q4_K_M unicamente |
| Llama-3.2-3B-Instruct (modelo base) | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF oficiales, ampliamente soportado |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens nativos (hasta 131.072 con configuracion extendida) | Apache 2.0 | Safetensors y cuantizaciones de la comunidad |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | Safetensors y GGUF de la comunidad |

La diferencia principal de jojo-sovereign-trained frente a las alternativas no es tecnica sino de trazabilidad: los tres modelos comparados publican licencia, contexto y evaluaciones, mientras que este finetune no documenta ninguno de esos extremos. En igualdad de tamano, las alternativas ofrecen mayor certidumbre para uso comercial y despliegue en produccion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que se desconoce si el ajuste fino ha degradado, mantenido o mejorado las capacidades del modelo base.
- Licencia sin declarar: el repositorio no especifica licencia. Al derivar de Llama-3.2-3B-Instruct, es muy probable que herede las restricciones de la Llama 3.2 Community License (incluidas obligaciones de atribucion y la clausula de licencia aceptable), pero esto no esta confirmado por el autor. Antes de cualquier uso comercial debe verificarse con el publicador.
- Dataset de entrenamiento desconocido: no se documenta la composicion de los datos de ajuste, lo que impide evaluar sesgos, contaminacion de benchmarks o filtraciones de datos personales.
- Riesgo de alucinacion: inherente a los modelos de 3 mil millones de parametros, especialmente en tareas de conocimiento factual, matematicas y razonamiento multi-paso. No hay datos que indiquen mitigacion.
- Idioma e idiomas soportados no declarados: no puede asumirse un rendimiento correcto en castellano sin una evaluacion propia.
- Contexto no confirmado: aunque el modelo base soporta 128.000 tokens, no se garantiza que este finetune conserve esa ventana ni que la plantilla GGUF la gestione correctamente.
- Conversión a GGUF con ajuste de BOS: el propio autor advierte de que el comportamiento del token BOS se modifico para la compatibilidad con GGUF, lo que puede alterar los resultados respecto al modelo original en prompts muy sensibles al formato.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Artefacto unico: solo se publica una cuantizacion Q4_K_M, lo que limita el ajuste fino entre calidad y consumo de memoria.
- Fecha de publicacion atipica (2026-09-17): conviene verificar la integridad y procedencia del repositorio antes de integrarlo en cualquier flujo automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dodgeqtr/jojo-sovereign-trained
- Unsloth (herramienta citada por el autor): https://github.com/unslothai/unsloth
- Llama.cpp (runtime recomendado en la ficha): no se proporciona enlace en la model card
- Ollama (Modelfile incluido en el repositorio): no se proporciona enlace en la model card
- Paper, blog o demo asociados: no disponible
- La busqueda web realizada no ha devuelto ningun enlace relacionado con este modelo; los resultados obtenidos corresponden a un servicio de traduccion sin vinculacion con el repositorio.
