# mradermacher/ANIMA-Nectar-GGUF

## Resumen

ANIMA-Nectar-GGUF es la version cuantizada en formato GGUF del modelo Severian/ANIMA-Nectar, un modelo de lenguaje de aproximadamente 7.240 millones de parametros (7,24 B) publicado originalmente en formato Transformers. La cuantizacion la realiza mradermacher, un conocido creador de versiones GGUF de la comunidad, que distribuye el modelo en una amplia gama de niveles de compresion (desde Q2_K hasta f16) para facilitar su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base esta etiquetado como un modelo en ingles (`language: en`) con licencia MIT, lo que permite uso comercial sin restricciones significativas. La informacion disponible no detalla la arquitectura interna del modelo original (mas alla de que es un transformer compatible con Transformers), ni los datos de entrenamiento, ni las capacidades especificas declaradas por el autor original. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion y los ficheros disponibles.

La relevancia de este repositorio reside principalmente en su utilidad practica: al ofrecer versiones GGUF de un modelo de 7 B, permite desplegarlo en GPUs de consumo (con cuantizaciones Q4_K_M de 4,5 GB) y en CPU, algo imposible con los pesos originales en precision completa. No obstante, al tratarse de un modelo de nicho con muy poca traccion (138 descargas y 1 like en el momento de la consulta), no dispone de documentacion tecnica publica sobre su entrenamiento ni de resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (compatible con Transformers; detalles internos no disponibles) |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (Transformers para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base Severian/ANIMA-Nectar mas alla de que es un transformer compatible con la libreria Transformers y que cuenta con 7.241.732.096 parametros. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El repositorio GGUF es una conversion estatica (sin imatrix) del modelo original, realizada con la herramienta de conversion de llama.cpp. El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (ANIMA-Nectar-i1-GGUF). El proceso de cuantizacion no altera la arquitectura del modelo, solo la precision numerica de los pesos.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- Razonamiento y generacion de texto general: capacidades inferidas de su naturaleza como modelo de lenguaje de 7 B, aunque no hay documentacion especifica del autor.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte multilingue mas alla del ingles.
- No se ha documentado soporte de vision, audio ni modo de razonamiento explicito (thinking mode).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Prototipado local de aplicaciones de texto en ingles: gracias a las cuantizaciones Q4_K_M (4,5 GB) y Q5_K_M (5,2 GB), el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM, lo que permite iterar rapidamente en el desarrollo de chatbots o generadores de texto sin depender de servicios en la nube.
- Despliegue en CPU para entornos sin GPU: la version Q2_K (2,8 GB) o Q3_K_S (3,3 GB) permite ejecutar el modelo en servidores sin acelerador grafico mediante llama.cpp, util para tareas de generacion de texto de baja latencia en entornos con recursos limitados.
- Experimentacion academica con modelos de 7 B: investigadores que necesiten comparar el comportamiento de un modelo pequeno en diferentes niveles de cuantizacion pueden usar este repositorio para estudiar el impacto de la compresion en la calidad de salida.
- Generacion de texto creativo en ingles: el modelo puede emplearse para redaccion asistida, generacion de ideas o escritura de borradores, siempre que se valide la calidad de salida, dado que no hay benchmarks publicos.
- Integracion en pipelines de inferencia con Ollama o llama.cpp: al estar en formato GGUF, se integra directamente en herramientas como Ollama, LM Studio o llama.cpp, lo que facilita su uso en aplicaciones de escritorio y flujos de trabajo locales.
- Fines educativos y de demostracion: util para ensenar el funcionamiento de la cuantizacion GGUF y el despliegue de modelos de lenguaje en hardware modesto, comparando el rendimiento entre Q2_K y Q8_0.
- Base para fine-tuning ligero: aunque el repositorio es GGUF (no ideal para reentrenamiento), el modelo base en Transformers puede servir como punto de partida para ajuste fino en tareas especificas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,8 GB
  - Q3_K_S: ~3,3 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB ofrecen margen suficiente para contexto adicional. Para f16 se recomienda una A100 de 40 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; en 6 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints de Hugging Face segun la etiqueta del repositorio.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ANIMA-Nectar-GGUF | 7,24 B | no disponible | MIT | GGUF | Hugging Face (138 descargas) |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Muy extendido, amplia comunidad |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Muy extendido, amplia comunidad |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Muy extendido, amplia comunidad |

La comparacion se basa en el tamano de parametros y la categoria (modelos de ~7-8 B). No hay datos de rendimiento de ANIMA-Nectar que permitan una comparacion cuantitativa con estas alternativas, que ademas cuentan con documentacion tecnica detallada y benchmarks publicos.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica sobre el modelo base: no se conocen los datos de entrenamiento, el contexto maximo, ni las capacidades reales, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo elevado de alucinacion: al no haber benchmarks ni evaluaciones publicas, no se puede estimar la fiabilidad de las respuestas.
- Solo soporta ingles: no se debe esperar un rendimiento aceptable en castellano u otros idiomas.
- Modelo de nicho con muy poca traccion (138 descargas, 1 like): no hay comunidad, issues resueltos ni casos de uso documentados que sirvan de referencia.
- La licencia MIT del repositorio GGUF se hereda del modelo base; conviene verificar que el modelo original Severian/ANIMA-Nectar tambien sea MIT y que no existan restricciones adicionales en los datos de entrenamiento.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia de las respuestas; se recomienda Q4_K_M o superior para uso real.
- No se garantiza compatibilidad con versiones futuras de llama.cpp u otros runtimes; el formato GGUF evoluciona y las cuantizaciones antiguas pueden requerir reconversion.
- No apto para tareas que requieran contexto largo, tool calling o agentes, al no estar documentadas estas capacidades.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/ANIMA-Nectar-GGUF
- Modelo base: https://huggingface.co/Severian/ANIMA-Nectar
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ANIMA-Nectar-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ANIMA-Nectar-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
