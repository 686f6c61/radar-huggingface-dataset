# magnitudedev/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines Lab, distribuido bajo licencia Apache 2.0. Se trata de un modelo con arquitectura Mixture of Experts (MoE) de aproximadamente 26.200 millones de parametros totales, disenado para tareas conversacionales que combinan entrada de imagen y texto. El checkpoint original emplea cuantizaciones nativas de NVIDIA ModelOpt: expertos enrutados en NVFP4 y proyecciones densas en MXFP8.

La version aqui descrita es una conversion a GGUF realizada por magnitudedev para su runtime Magnitude. Su particularidad es que preserva los pesos en su formato nativo sin recuantizar: mantiene los tensores NVFP4 con sus escalas de segundo nivel en FP32 y los tensores MXFP8 como codigos E4M3 con escalas UE8M0 por bloque de 32 elementos. Esto implica que el modelo no es cargable en llama.cpp, que carece de soporte para esos tensores de escala.

El interes de esta publicacion radica en que permite ejecutar el modelo a su tamano nativo (18,9 GB para el modelo de texto) sin la duplicacion de tamano que supondria ensanchar los pesos MXFP8 a BF16, y sin la perdida de precision de una recuantizacion a otra rejilla. Incluye ademas un drafter especulativo DSpark (MTP) y un proyector de vision en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con soporte multimodal image-text-to-text |
| Parametros totales | 26.197.792.256 (26,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones densas y expertos de capa 0), BF16/F32 (embeddings, normas, routers, controladores, sesgos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con extensiones propietarias de Magnitude: `F8_E4M3` + escalas `I8` UE8M0, y `NVFP4` + escalas FP32) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts. Segun la model card de esta conversion, los expertos enrutados se distribuyen en formato NVFP4 nativo de ModelOpt, con codigos de 4 bits E2M1, escalas de bloque UE4M3 y una escala tensorial de segundo nivel en FP32. Las proyecciones densas y los expertos de la capa 0 usan MXFP8, con codigos de 8 bits E4M3 y escalas UE8M0 por bloque de 32 elementos. Los embeddings, normas, routers, controladores y sesgos se conservan en BF16 y F32 tal como se publicaron.

La conversion a GGUF se realizo desde la revision `ed40e7d` del repositorio original y fue verificada byte a byte. La innovacion tecnica principal de esta ficha no esta en el entrenamiento sino en el formato: se preservan los tensores NVFP4 sin modificar con sus companeros `.scale`, y los codigos MXFP8 se almacenan sin cambios en `F8_E4M3` con la escala UE8M0 de cada bloque en un tensor `.scale` de tipo `I8`, marcado mediante la clave `magnitude.scale_encoding = "ue8m0"`. El runtime Magnitude aplica ambas codificaciones de forma nativa al leer. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (conversational).
- Comprension de imagenes combinada con texto (image-text-to-text) mediante el proyector de vision incluido en BF16.
- Razonamiento y generacion asistida por decodificacion especulativa gracias al drafter DSpark (MTP) incluido como archivo separado.
- Ejecucion en precision nativa sin recuantizacion, lo que preserva el comportamiento numerico del checkpoint original.
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto a una pregunta en texto y generar una respuesta conversacional, gracias a su pipeline image-text-to-text y al proyector de vision incluido.
- Asistentes conversacionales multimodales: adecuado para interfaces de chat donde el usuario adjunta imagenes y espera respuestas contextualizadas, al estar etiquetado como conversational.
- Despliegue en infraestructura con soporte de FP4/FP8: al conservar los pesos en NVFP4 y MXFP8 nativos, encaja en entornos con GPUs que apliquen estas codificaciones directamente (por ejemplo, generaciones recientes de NVIDIA con soporte de FP4), reduciendo el coste de memoria frente a un BF16 equivalente.
- Evaluacion de precision numerica: util para investigadores que necesiten comparar el comportamiento del checkpoint original frente a versiones recuantizadas en llama.cpp, ya que esta conversion es byte a byte identica al original.
- Generacion con latencia reducida: el drafter especulativo DSpark (MTP) de 618 MB permite acelerar la decodificacion en el runtime Magnitude mediante decodificacion especulativa.
- Investigacion sobre cuantizacion nativa: sirve como referencia para estudiar el impacto de NVFP4 y MXFP8 en modelos MoE multimodales, al exponer las escalas UE8M0 y FP32 de forma explicita en el GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo de texto: aproximadamente 18,9 GB en su formato nativo NVFP4/MXFP8, segun el tamano del archivo `Inkling-2-Mini-NVFP4.gguf`.
- VRAM adicional: 618 MB para el drafter DSpark y 608 MB para el proyector de vision BF16, lo que situa el total en torno a 20,1 GB si se cargan todos los componentes.
- GPU recomendadas: no disponible de forma explicita; el uso de NVFP4 y MXFP8 nativos requiere hardware con soporte de estas codificaciones (familias NVIDIA recientes con FP4/FP8). No se confirma compatibilidad con A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado. El volumen de 20,1 GB excede la VRAM de la mayoria de GPUs de consumo actuales de 16 GB o menos; seria necesario hardware de 24 GB o superior, sin confirmacion oficial.
- Opciones de despliegue: exclusivamente el runtime Magnitude. No es compatible con llama.cpp, que no soporta los tensores de escala UE8M0 ni los NVFP4 con escalas de segundo nivel. Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion nativa | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha, GGUF Magnitude) | 26,2 mil millones | no disponible | NVFP4 + MXFP8 | Apache 2.0 | Magnitude |
| Inkling-2-Mini (original, thinkingmachines) | 26,2 mil millones | no disponible | NVFP4 + MXFP8 | Apache 2.0 | no disponible |
| Inkling-2-Mini GGUF para llama.cpp (recuantizado) | 26,2 mil millones | no disponible | BF16 ensanchado o recuantizado | Apache 2.0 | llama.cpp |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye modelos alternativos de la misma categoria con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp: los archivos no cargan en llama.cpp porque este no soporta los tensores de escala UE8M0 ni los NVFP4 con escalas de segundo nivel. El modelo solo funciona en el runtime Magnitude.
- Dependencia de un runtime propietario: el formato GGUF aqui publicado usa extensiones especificas de Magnitude (`magnitude.scale_encoding = "ue8m0"`), lo que limita la portabilidad frente a GGUF estandar.
- Requisito de hardware especializado: la aplicacion nativa de NVFP4 y MXFP8 exige GPUs con soporte de estas codificaciones; en hardware sin ellas no se puede ejecutar el modelo tal cual.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Limitaciones de contexto e idioma: no disponible. No se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y aviso de licencia; no se documentan restricciones adicionales.
- Caveat de produccion: al no haber benchmarks publicados ni datos de latencia o throughput, la idoneidad en produccion debe validarse empiricamente antes de adoptar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magnitudedev/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision de origen de la conversion: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Runtime Magnitude: https://magnitude.dev
