# mradermacher/K-MT-7B-v0.1-GGUF

## Resumen

K-MT-7B-v0.1-GGUF es la distribucion en formato GGUF del modelo K-MT-7B-v0.1, desarrollado originalmente por ThakiCloud y cuantizado por mradermacher. Se trata de un modelo de traduccion automatica de 7.504.568.320 parametros (aproximadamente 7,5 mil millones) especializado en la traduccion entre coreano e ingles, con enfasis particular en la preservacion de honorificos coreanos y en el mantenimiento de capacidades instruccionales. El modelo base esta publicado bajo licencia Apache 2.0.

La relevancia de esta version GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa. El repositorio ofrece un espectro amplio de cuantizaciones, desde Q2_K (3,1 GB) hasta f16 (15,1 GB), lo que facilita el despliegue en desde portatiles con GPU modesta hasta servidores con aceleradores dedicados.

El modelo esta etiquetado para las tareas de traduccion, coreano, honorificos, instruction-following y capability-preservation, y soporta los idiomas coreano (ko) e ingles (en). Su pipeline declarado en Hugging Face es translation. No se dispone de informacion detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun library_name transformers) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales del modelo base presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base ThakiCloud/K-MT-7B-v0.1 en la documentacion proporcionada. El tag library_name: transformers y el tamano de 7,5 mil millones de parametros sugieren una arquitectura transformer decoder-only, pero no se confirma en la informacion disponible.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Las etiquetas del modelo indican un enfasis en honorificos coreanos, instruction-following y capability-preservation, lo que sugiere un proceso de ajuste orientado a preservar capacidades generales durante la especializacion en traduccion, pero no se aportan detalles tecnicos sobre dicho proceso. La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) y no incluye cuantizaciones ponderadas con imatrix en el momento de la publicacion.

## Capacidades

- Traduccion automatica entre coreano e ingles, con atencion especial a la preservacion de honorificos coreanos.
- Seguimiento de instrucciones (instruction-following) en el contexto de tareas de traduccion.
- Preservacion de capacidades generales (capability-preservation) durante la traduccion, segun las etiquetas del modelo.
- Generacion de texto conversacional (tag conversational).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a coreano e ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica coreano-ingles: el modelo puede traducir manuales, guias y documentacion de producto manteniendo terminologia consistente, aprovechando su especializacion en el par de idiomas.
- Localizacion de contenido web y marketing: adecuado para traducir textos comerciales del coreano al ingles y viceversa, con atencion a registros formales e informales propios de los honorificos.
- Atencion al cliente bilingue: el modelo puede gestionar conversaciones multi-turno en coreano e ingles, manteniendo el tratamiento adecuado segun el nivel de formalidad del interlocutor.
- Traduccion de comunicaciones corporativas: correos, actas y documentos internos entre equipos coreanos e internacionales, donde el respeto de los honorificos es critico para la comunicacion profesional.
- Subtitulado y transcripcion traducida: integrable en pipelines de procesamiento de audio-video para generar subtitulos en ingles a partir de contenido coreano, o viceversa.
- Investigacion en traduccion automatica: util como modelo de referencia de 7B especializado en un par de idiomas con fenomenos morfosintacticos complejos (honorificos), ejecutable en hardware de consumo gracias a las cuantizaciones GGUF.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (4,7 GB) y Q5_K_M (5,5 GB) permiten ejecutar el modelo en GPUs de consumo o incluso en CPU, facilitando prototipado rapido y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead aproximado de contexto y KV cache):
  - Q2_K (3,1 GB): ~4-5 GB de VRAM.
  - Q3_K_M (3,9 GB): ~5-6 GB de VRAM.
  - IQ4_XS (4,3 GB): ~5,5-6,5 GB de VRAM.
  - Q4_K_M (4,7 GB): ~6-7 GB de VRAM.
  - Q5_K_M (5,5 GB): ~7-8 GB de VRAM.
  - Q6_K (6,3 GB): ~8-9 GB de VRAM.
  - Q8_0 (8,1 GB): ~10-11 GB de VRAM.
  - f16 (15,1 GB): ~16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues de alta concurrencia con f16.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M, Q5_K_M, Q6_K, Q8_0) hasta GPUs de 8 GB con cuantizaciones Q2_K a Q4_K_S. Las cuantizaciones Q2_K y Q3_K_S podrian caber en GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. Para vLLM o TGI se requeririan los pesos originales en safetensors del modelo base, no las cuantizaciones GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar que el modelo base ThakiCloud/K-MT-7B-v0.1 es la referencia directa, y que esta version GGUF se distingue por ofrecer cuantizaciones para despliegue en hardware de consumo. Para alternativas de traduccion coreano-ingles de tamano similar no hay datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K-MT-7B-v0.1-GGUF (este) | 7,5B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, 12 variantes |
| ThakiCloud/K-MT-7B-v0.1 | 7,5B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base original |
| Alternativas de traduccion ko-en | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como modelo entrenado principalmente con datos de dos idiomas, puede reflejar sesgos culturales y de genero presentes en los corpus de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos; en traduccion puede manifestarse como adiciones, omisiones o invencion de contenido no presente en el texto fuente.
- Limitaciones de contexto o idioma: soporta unicamente coreano e ingles; no se especifica la longitud de contexto, lo que limita la planificacion de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad de traduccion de forma notable; se recomienda Q4_K_M o superior para uso en produccion.
- No se dispone de cuantizaciones ponderadas con imatrix, lo que podria reducir la calidad frente a versiones con importance matrix en tamanos equivalentes.
- El repositorio ocupa 67,3 GB en total; la descarga selectiva de una sola cuantizacion es posible, pero conviene planificar el almacenamiento.
- No hay informacion sobre el proceso de alineacion ni sobre evaluaciones de seguridad; se recomienda validacion humana en aplicaciones sensibles.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/K-MT-7B-v0.1-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/K-MT-7B-v0.1
- Pagina de descargas del autor: https://hf.tst.eu/model#K-MT-7B-v0.1-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
