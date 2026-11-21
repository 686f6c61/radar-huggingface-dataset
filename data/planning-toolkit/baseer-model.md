# Planning-Toolkit/baseer-model

## Resumen

Planning-Toolkit/baseer-model es una publicacion de pesos en formato GGUF del modelo Qwen/Qwen3.5-4B, realizada por el usuario Planning-Toolkit. No se trata de un modelo entrenado desde cero ni de un fine-tune: la model card indica explicitamente que los pesos no han sido modificados respecto al modelo base y que todo el credito corresponde al equipo de Qwen. El repositorio contiene una unica cuantizacion Q4_K_M (fichero `Qwen3.5-4B-Q4_K_M.gguf`) generada con imatrix, pensada para su uso offline por el asistente Baseer del propio Planning Toolkit.

El modelo base es un transformer denso de aproximadamente 4.205 millones de parametros (4,2 B), con licencia Apache 2.0 heredada del repositorio original. La relevancia de esta ficha es limitada: se trata de un artefacto de distribucion (una cuantizacion) mas que de un modelo nuevo, por lo que sus capacidades tecnicas son las del Qwen3.5-4B original. Cualquier evaluacion de rendimiento, contexto o idiomas debe remitirse a la documentacion oficial de Qwen, no a este repositorio.

El interes practico esta en disponer de una version GGUF Q4_K_M lista para desplegar en entornos con recursos limitados (CPU o GPU de gama consumer), con un hash sha256 publicado para verificacion de integridad. Al no haber descargas ni likes en el momento de la consulta, y al no incluir la model card datos de entrenamiento, benchmarks ni idiomas, la ficha debe leerse como una ficha de artefacto de cuantizacion con la informacion estrictamente disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE segun los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, generada con imatrix) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico fichero: `Qwen3.5-4B-Q4_K_M.gguf`); tamano del repo 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen/Qwen3.5-4B, un transformer denso de 4,2 B de parametros. La model card de este repositorio no aporta ningun detalle sobre la arquitectura interna (tipo de atencion, uso de RoPE, normalizacion, capas), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o post-entrenamiento. Toda esa informacion debe consultarse en la documentacion oficial de Qwen.

La unica innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: se ha generado una cuantizacion Q4_K_M en formato GGUF empleando imatrix (matriz de importancia), una tecnica que calibra los pesos de cuantizacion a partir de estadisticas de activaciones para reducir la perdida de calidad respecto a una cuantizacion Q4_K_M estandar. El autor publica el hash sha256 del fichero (`00fe7986ff5f6b463e62455821146049db6f9313603938a70800d1fb69ef11a4`) para verificar la integridad de la descarga. No se documenta ninguna modificacion de pesos, destilacion ni decodificacion especulativa adicional.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para dialogo, coherente con su integracion en el asistente Baseer.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.5-4B; no se detallan en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (la model card no lista idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia offline: el formato GGUF y la etiqueta `endpoints_compatible` permiten su ejecucion local sin conexion y su exposicion mediante servidores compatibles con la API de endpoints.

## Casos de uso

- Asistente conversacional offline: el fichero GGUF Q4_K_M puede cargarse en llama.cpp u Ollama para ofrecer un asistente de dialogo sin conexion a internet, escenario para el que fue publicado (uso por el asistente Baseer).
- Despliegue en estaciones de trabajo sin GPU dedicada: con 4,2 B de parametros en Q4_K_M (repo de 2,7 GB), el modelo cabe en RAM de un portatil convencional y permite prototipar aplicaciones de texto sin infraestructura cloud.
- Integracion en pipelines de automatizacion de documentos: generacion de resumenes o reescritura de texto en lote mediante un servidor local compatible con la API de endpoints, evitando enviar datos a terceros.
- Entornos con requisitos de privacidad: al ejecutarse localmente y no requerir llamadas externas, es adecuado para procesar texto sensible en equipos aislados (air-gapped).
- Verificacion de integridad en distribucion de modelos: el hash sha256 publicado permite validar el fichero tras la descarga, util en entornos con cadena de suministro controlada.
- Base para experimentacion con cuantizacion: sirve como referencia para comparar la calidad de una Q4_K_M con imatrix frente a otras cuantizaciones del mismo Qwen3.5-4B en tareas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 2,7 GB, por lo que se necesita del orden de 3-4 GB de memoria para cargar el modelo y mantener contexto (estimacion a partir del tamano del repo; no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU consumer con 6 GB o mas de VRAM deberia poder alojarlo en Q4_K_M.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 6-8 GB de VRAM o mas; tambien en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; servidores compatibles con la API de endpoints (etiqueta `endpoints_compatible`). vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Planning-Toolkit/baseer-model | 4,2 B | No disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | 4,2 B | No disponible en la informacion proporcionada | Safetensors y otros | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones GGUF de Qwen3.5-4B | 4,2 B | No disponible | GGUF (multiples niveles) | Apache 2.0 | No disponible en la informacion proporcionada |

La comparativa relevante es contra el modelo base: este repositorio no anade capacidades, solo una cuantizacion Q4_K_M con imatrix y un hash de verificacion. Frente a otras cuantizaciones del mismo modelo, la diferencia estaria en el proceso de calibracion, pero no se aportan datos que permitan comparar calidad.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: los pesos son identicos al Qwen3.5-4B original; cualquier limitacion del modelo base aplica integramente.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad; no hay evidencia publicada sobre su comportamiento en produccion.
- Idiomas soportados no declarados: no se puede garantizar calidad fuera de los idiomas del modelo base sin consultar su documentacion.
- Longitud de contexto no disponible: no se debe asumir ninguna ventana concreta sin verificar la del Qwen3.5-4B original.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales; el impacto no esta cuantificado por el autor.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad ni informes de uso.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y atribucion al equipo de Qwen, tal como indica la propia model card.
- Verificar el hash sha256 antes de usar el fichero en entornos de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Planning-Toolkit/baseer-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
