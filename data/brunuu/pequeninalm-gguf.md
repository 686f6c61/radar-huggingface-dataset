# brunuu/PequeninaLM-GGUF

## Resumen

PequeninaLM es un modelo de lenguaje de 52 millones de parametros entrenado desde cero en portugues europeo (pt-PT) por el desarrollador independiente brunuu. La version aqui descrita es la cuantizacion GGUF del modelo base, publicada para su uso con llama.cpp, LM Studio, Ollama y cualquier runtime compatible con el formato GGUF. Se trata de un modelo deliberadamente diminuto, orientado a generacion de texto conversacional en un unico idioma y sin capacidades multimodales ni de razonamiento avanzado.

Con 51.786.240 parametros, el modelo se situa en el rango de los modelos tipo "toy" o educativos, muy por debajo de los pequenos modelos comerciales habituales (0,5B-3B). Su relevancia no reside en el rendimiento bruto, sino en el hecho de estar entrenado desde cero especificamente para portugues de Portugal, un idioma con escasa representacion en modelos de gran escala, y en su licencia MIT, que permite uso comercial sin restricciones practicas.

La ficha se centra en la version GGUF, que ofrece dos ficheros: pesos en f16 (105 MB) y cuantizacion q8_0 (56 MB). El modelo base es `brunuu/PequeninaLM`, con codigo disponible en GitHub bajo el repositorio `brunu97/PequeninaLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (formato GGUF compatible con llama.cpp); detalles internos no disponibles |
| Parametros totales | 51.786.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | portugues (pt, pt-PT) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card de la version GGUF no detalla la arquitectura interna. Los tags indican compatibilidad con llama.cpp y el pipeline es text-generation, lo que sugiere una arquitectura transformer de tipo llama adaptada a un modelo de 52M de parametros. No se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

El modelo base fue entrenado desde cero en portugues de Portugal, segun indica el autor. La version GGUF conserva el formato de chat ChatML, embebido en el propio fichero, y aplica criterio de parada automatica al finalizar la respuesta. El autor recomienda temperatura 0,7, top-p 0,9 y penalizacion de repeticion 1,15 para inferencia.

## Capacidades

- Generacion de texto conversacional en portugues europeo.
- Respuestas de un solo turno o multi-turno basicas mediante el formato ChatML embebido.
- Parada automatica al finalizar la respuesta (criterio de stop integrado en el GGUF).
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama y LM Studio.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de codigo, matematicas, vision ni audio.
- Cobertura multilingue limitada al portugues (sin datos de otros idiomas).
- No dispone de modo "thinking" ni decodificacion especulativa documentada.

## Casos de uso

- Experimentacion educativa con modelos de lenguaje: sirve para estudiar el ciclo completo de entrenamiento desde cero en un idioma concreto, dado su tamano reducido y su licencia permisiva.
- Despliegue en dispositivos con recursos minimos: con 56 MB en q8_0, puede ejecutarse en CPU, Raspberry Pi o telefonos, util para demos offline de generacion de texto en portugues.
- Pruebas de integracion de pipelines GGUF: permite validar flujos con llama.cpp u Ollama antes de migrar a modelos mayores, gracias a su bajo coste de carga.
- Generacion de texto auxiliar en portugues de Portugal: borradores cortos, respuestas plantilla o completado de frases en aplicaciones donde la calidad no sea critica.
- Filtrado o clasificacion ligera de texto en pt-PT: como componente de bajo coste en sistemas con restricciones de latencia o memoria.
- Investigacion sobre sesgos y calidad en modelos pequenos: su entrenamiento desde cero en un unico idioma facilita analisis controlados de comportamiento linguistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (f16: 105 MB de pesos; q8_0: 56 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU moderna e incluso en iGPU; tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf brunuu/PequeninaLM-GGUF:F16`), Ollama (`ollama run hf.co/brunuu/PequeninaLM-GGUF:Q8_0`), LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia en CPU es viable en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PequeninaLM-GGUF | 51,8M | no disponible | pt | MIT | GGUF |
| Modelos tipo TinyLlama | ~1,1B | 2K-4K | multilingue | Apache 2.0 | safetensors, GGUF |
| Modelos tipo Qwen2.5-0.5B | ~0,5B | 32K | multilingue | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de PequeninaLM con alternativas. La comparativa se limita a parametros, contexto, licencia y formato; los modelos de referencia son ordenes de magnitud mayores y no equivalentes en capacidad.

## Limitaciones y advertencias

- Con 52M de parametros, la calidad de generacion es muy limitada en comparacion con modelos de mayor tamano; no es adecuado para tareas de produccion que exijan precision.
- Riesgo elevado de alucinacion y de respuestas incoherentes en temas complejos.
- Longitud de contexto no documentada; probablemente corta, lo que restringe conversaciones largas.
- Cobertura limitada al portugues; no se garantiza un comportamiento correcto en otros idiomas.
- No se documentan evaluaciones de sesgos; se desconoce el comportamiento en dominios sensibles.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantias de calidad ni soporte.
- No dispone de tool calling ni capacidades de agente; no debe integrarse en pipelines que las requieran.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/brunuu/PequeninaLM-GGUF
- Modelo base: https://huggingface.co/brunuu/PequeninaLM
- Repositorio GitHub: https://github.com/brunu97/PequeninaLM
