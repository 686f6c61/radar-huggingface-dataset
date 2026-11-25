# GhaythMahadin/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.5-2B, un transformer denso de aproximadamente 1.880 millones de parametros publicado originalmente por el equipo Qwen (Alibaba) y redistribuido en formato cuantizado por el usuario Unsloth. Este repositorio concreto, alojado por GhaythMahadin, es una copia de respaldo del archivo Q4_K_M generada para su uso como motor de inferencia local en el proyecto «Marsad» (مرصد التحقق, "observatorio de verificacion"). No se trata de un modelo nuevo ni de un fine-tuning: es una redistribucion del artefacto de Unsloth con un checksum SHA-256 documentado.

El interes practico de esta ficha es limitado pero concreto: proporciona un archivo GGUF de ~1,3 GB que puede ejecutarse en llama.cpp y en cualquier runtime compatible (Ollama, LM Studio, llama-cpp-python) sobre hardware de consumo modesto. El modelo base es de tipo conversacional, con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La informacion publicada por el autor es minima: no se documentan idiomas soportados, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Todo dato no presente en la model card o en los metadatos de Hugging Face se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la del Qwen3.5-2B base; detalles no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); el repo base de Unsloth ofrece otras variantes no detalladas aqui |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-2B-Q4_K_M.gguf`, SHA-256 `aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de que el modelo base es Qwen3.5-2B, un transformer denso de ~1,88 mil millones de parametros. La model card de este repositorio no describe el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de entrenamiento del modelo original: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento.

Lo unico verificable en este repositorio es el proceso de cuantizacion: se ha generado un archivo GGUF con cuantizacion Q4_K_M, un esquema de cuantizacion por bloques que mantiene las matrices de atencion y las capas de salida en mayor precision relativa. El tag `imatrix` en los metadatos sugiere que la cuantizacion se ha calibrado con una matriz de importancia (importance matrix), una tecnica que reduce la perdida de calidad en cuantizaciones de 4 bits. El tag `marsad` indica el uso previsto por el autor de la copia.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite desplegarlo tras una API compatible con OpenAI en runtimes que lo soporten.
- Ejecucion local en llama.cpp y runtimes derivados, sin dependencia de GPU dedicada.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: el archivo Q4_K_M de ~1,3 GB puede cargarse en RAM y ejecutarse con llama.cpp en CPU, adecuado para entornos de desarrollo, portatiles o servidores de bajos recursos.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno con licencia Apache-2.0, permite iterar sobre prompts y flujos conversacionales sin coste de API ni restricciones de licencia.
- Despliegue en el borde (edge computing): el tamano reducido del archivo facilita su inclusion en imagenes de contenedor o dispositivos con almacenamiento limitado, siempre que la latencia en CPU sea aceptable para la carga prevista.
- Motor de respaldo en pipelines con requisito de disponibilidad: el checksum SHA-256 publicado permite verificar la integridad del artefacto en un pipeline de CI/CD antes de desplegarlo como fallback local.
- Filtrado y clasificacion de texto de baja complejidad: tareas de etiquetado, resumen corto o reescritura donde un modelo de ~2B con cuantizacion 4 bits ofrece un coste computacional bajo.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, los datos no salen de la maquina, lo que encaja en escenarios donde no se permite enviar texto a APIs externas.
- Base para experimentacion con cuantizacion: util para comparar la calidad de Q4_K_M con imatrix frente a otras variantes del mismo modelo base en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 1,3 GB; se recomienda al menos 2-3 GB de memoria libre para el modelo mas el contexto y el estado del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede alojar el modelo completo; no se dispone de datos de rendimiento especificos por GPU.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante). Tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-GGUF (este repo) | ~1,88 B | No disponible | Apache-2.0 | GGUF Q4_K_M | Copia de respaldo de Unsloth, con imatrix |
| unsloth/Qwen3.5-2B-GGUF | ~1,88 B | No disponible | Apache-2.0 | GGUF (varias cuantizaciones) | Repositorio fuente original de la cuantizacion |
| Modelo Qwen3.5-2B original | ~1,88 B | No disponible | Apache-2.0 | safetensors | Pesos sin cuantizar del modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros fabricantes con el mismo tamano.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero un modelo de ~2B entrenado con corpus web es propenso a reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion elevado en tareas de conocimiento factual: el tamano reducido limita la cantidad de conocimiento almacenado y la fiabilidad en dominios especializados.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto a los pesos originales en safetensors; el impacto concreto no esta medido en este repositorio.
- No se especifican los idiomas soportados ni la calidad por idioma; el uso en castellano no esta validado por el autor.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin verificacion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su unico proposito declarado es servir de respaldo a un proyecto concreto; no hay garantia de mantenimiento ni de actualizaciones.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene conservar el aviso de licencia y verificar la licencia del modelo base original.
- El tag `marsad` y la model card en arabe indican un contexto de uso especifico; no hay documentacion de soporte ni issues abiertos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/Qwen3.5-2B-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
