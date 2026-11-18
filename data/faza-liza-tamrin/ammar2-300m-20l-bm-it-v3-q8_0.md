# faza-liza-tamrin/Ammar2-300M-20L-BM-IT-V3-Q8_0

## Resumen

Ammar2-300M-20L-BM-IT-V3-Q8_0 es un modelo de lenguaje conversacional de pequeno tamano (299.395.456 parametros, aproximadamente 300 millones) publicado por el usuario faza-liza-tamrin en Hugging Face. Se distribuye unicamente en formato GGUF con cuantizacion Q8_0, lo que lo orienta a inferencia local en CPU o GPU de gama baja mediante llama.cpp u otros runners compatibles con GGUF.

El modelo esta etiquetado para el idioma malayo (`ms`) y su nombre sugiere un ajuste instruccional ("IT") sobre una base de 20 capas ("20L") y posiblemente entrenamiento adicional en bahasa malayo ("BM"). No se dispone de model card sustantiva: el README unicamente declara licencia Apache 2.0 e idioma `ms`, sin informacion sobre arquitectura interna, datos de entrenamiento ni procedimiento de alineamiento.

Su relevancia es limitada pero concreta: se trata de una opcion de muy bajo coste computacional para experimentacion con modelos conversacionales en malayo, con licencia permisiva (Apache 2.0) y un unico artefacto de 0,3 GB que cabe en cualquier equipo. No hay evidencia publicada de benchmarks ni de adopcion por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer de 20 capas) |
| Parametros totales | 299.395.456 |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico artefacto publicado) |
| Idiomas soportados | malayo (`ms`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El identificador "20L" sugiere una red de 20 capas, y el sufijo "BM-IT-V3" apunta a una version 3 de un ajuste instruccional sobre una base entrenada o adaptada al malayo. El tamano de parametros (300M) es coherente con un transformer decoder-only de dimension oculta en el rango de 768-1024, pero este dato no esta confirmado en la informacion disponible.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporcion de codigo o multilingue), ni sobre si se aplico RLHF, DPO o simplemente SFT. La unica informacion verificable es el artefacto GGUF Q8_0 y la declaracion de licencia Apache 2.0.

## Capacidades

- Generacion de texto conversacional en malayo, segun la etiqueta `conversational` del repositorio.
- Ajuste instruccional declarado en el nombre del modelo (sufijo "IT"), aunque sin documentacion sobre el formato de prompt soportado.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`) y con runners GGUF.
- Capacidades multilingues: no disponibles mas alla del malayo declarado.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Vision, audio u otras modalidades: no disponible.
- Codigo y matematicas: no documentado; con 300M de parametros es esperable un rendimiento muy limitado en estas tareas, aunque no hay datos que lo confirmen.

## Casos de uso

- Prototipado de asistentes conversacionales en malayo: el modelo puede desplegarse en un portatil con llama.cpp para validar flujos de dialogo antes de migrar a un modelo mayor, gracias a su tamano de 0,3 GB en Q8_0.
- Inferencia en dispositivos con recursos muy limitados: al ocupar menos de 1 GB de memoria en Q8_0, es viable en Raspberry Pi, moviles de gama alta o contenedores con poca RAM, donde modelos de 7B no caben.
- Experimentacion academica sobre modelos pequenos en lenguas austronesias: sirve como linea base para comparar tecnicas de ajuste instruccional en malayo con presupuesto de computo minimo.
- Filtrado y clasificacion de texto en malayo en pipelines de bajo coste: su tamano permite ejecutarlo en CPU con latencia baja para tareas de etiquetado simple, siempre que se valide su calidad empiricamente.
- Generacion de respuestas cortas en chatbots de dominio acotado: con contexto presumiblemente limitado, encaja en escenarios de FAQ o respuestas de una o dos frases donde no se requiere memoria conversacional larga.
- Entorno de pruebas para integracion con llama.cpp/Ollama: util para validar infraestructura de despliegue GGUF (carga, tokenizacion, plantillas de prompt) antes de sustituir por un modelo mayor con la misma interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3-0,5 GB para los pesos en Q8_0; con overhead de contexto y runtime, del orden de 0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos 10 anos (GTX 1050, RTX 3050, RTX 4090, etc.), asi como en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Por tamano, es esperable que sea muy rapido en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparacion cuantitativa. A continuacion se comparan solo caracteristicas verificables con alternativas de tamano similar ampliamente conocidas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ammar2-300M-20L-BM-IT-V3-Q8_0 | 299M | no disponible | ms | Apache 2.0 | GGUF |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | multilingue (incluye malayo parcial) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 362M | 8.192 tokens | principalmente ingles | Apache 2.0 | safetensors, GGUF |
| Gemma-2-270M (si disponible) | ~270M | no disponible | multilingue | Gemma license | safetensors |

La comparacion de rendimiento no esta disponible para Ammar2; los datos de los modelos alternativos provienen de sus respectivas documentaciones publicas y no de una evaluacion conjunta.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, sesgos, formato de prompt ni evaluaciones, lo que dificulta su uso responsable en produccion.
- Riesgo elevado de alucinacion: con 300M de parametros y sin datos de alineamiento documentados, es esperable que genere contenido facticamente incorrecto con frecuencia.
- Cobertura idiomatica limitada al malayo declarado; no hay evidencia de competencia en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones de varios turnos o documentos largos sin validacion previa.
- Un unico artefacto Q8_0: no hay versiones en FP16, Q4_K_M u otras cuantizaciones que permitan ajustar el equilibrio calidad/memoria.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantias del autor sobre calidad o idoneidad; el usuario asume el riesgo de validacion.
- Sin adopcion comunitaria (0 descargas, 0 likes): no hay reportes independientes de calidad ni issues resueltos que sirvan de referencia.
- El nombre del modelo no sigue convenciones estandar de nomenclatura, lo que complica su descubrimiento y su integracion en catalogos automaticos.

## Enlaces

- Hugging Face: https://huggingface.co/faza-liza-tamrin/Ammar2-300M-20L-BM-IT-V3-Q8_0
- Paper: no disponible
- Blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
