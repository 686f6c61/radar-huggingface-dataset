# pranil00/ONIX-phi-2-GGUF

## Resumen

ONIX-phi-2-GGUF es una cuantizacion en formato GGUF del modelo microsoft/phi-2, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de una conversion de pesos a Q5_K_M realizada con llama.cpp sobre hardware Apple Silicon (Metal), pensada para facilitar la ejecucion local del modelo en equipos de consumo. El modelo base, phi-2, es un transformer decoder-only de 2.700 millones de parametros desarrollado por Microsoft Research, entrenado sobre un corpus curado de textos sinteticos y web con enfasis en razonamiento y conocimiento comun.

La relevancia de esta publicacion es practica: pone a disposicion un artefacto GGUF listo para usar con Ollama y llama.cpp, con un peso de 1,87 GB, lo que permite desplegar phi-2 en portatiles y estaciones de trabajo sin GPU dedicada. No obstante, el repositorio no incluye informacion sobre el proceso de cuantizacion mas alla de la verificacion de conversion de tensores, ni datos de evaluacion propios, ni detalles sobre idiomas soportados.

Conviene subir con cautela: el modelo base phi-2 esta publicado bajo licencia MIT por Microsoft, mientras que esta cuantizacion declara apache-2.0, lo que conviene verificar antes de un uso comercial. Ademas, el repositorio registra cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad sobre la calidad de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: microsoft/phi-2) |
| Parametros totales | 2.779.683.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base phi-2 declara 2.048 tokens) |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun el repo; el modelo base phi-2 es MIT) |
| Formato de pesos | GGUF |
| Tamano del repo | 2,0 GB |
| Tamano de los pesos GGUF | 1,87 GB |
| Libreria | gguf (llama.cpp) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente es microsoft/phi-2, un transformer decoder-only de 2.700 millones de parametros. La model card de esta cuantizacion no aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens vistos, ni sobre si se aplicaron fases de RLHF o DPO. Tampoco describe innovaciones tecnicas del modelo base mas alla de la identificacion de la arquitectura.

En cuanto al proceso de cuantizacion, el autor indica que la conversion se realizo con llama.cpp en Apple Silicon (Metal) y que se verifico la autenticidad de la conversion de tensores. No se especifican la version de llama.cpp empleada, el metodo exacto de calibracion ni si se conservaron todas las capas en el esquema Q5_K_M. El resultado es un unico archivo GGUF de 1,87 GB, coherente con una cuantizacion de 5 bits para un modelo de 2.700 millones de parametros.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma principal del modelo base; no se documentan otros idiomas en este repositorio).
- Razonamiento de sentido comun y respuesta a preguntas de conocimiento general, heredado de phi-2.
- Generacion de codigo basico y resolucion de problemas matematicos sencillos, capacidades atribuidas al modelo base.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo a traves de infraestructura compatible con la API de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Prototipado local en portatiles: gracias a sus 1,87 GB en Q5_K_M, el modelo se puede cargar en un portatil con 8 GB de RAM y generar texto sin conexion, ideal para pruebas de concepto antes de migrar a un modelo mayor.
- Asistentes de texto embebidos en aplicaciones de escritorio: la integracion con Ollama (`ollama run pranil00/ONIX-phi-2-GGUF`) permite incorporar generacion de texto en herramientas locales sin depender de APIs externas.
- Generacion de codigo en entornos con recursos limitados: phi-2 tiene capacidad para completar funciones y explicar fragmentos de codigo; esta cuantizacion permite usarlo en estaciones de trabajo sin GPU dedicada para tareas de autocompletado o documentacion.
- Educacion e investigacion: sirve como modelo de referencia para estudiar el efecto de la cuantizacion Q5_K_M frente a los pesos originales en tareas de generacion y razonamiento.
- Filtrado y clasificacion de texto offline: se puede usar para resumir, reformular o etiquetar documentos en pipelines locales donde la privacidad impide enviar datos a la nube.
- Pruebas de integracion con llama.cpp: util para validar pipelines de inferencia, medir latencia y comparar rendimiento entre cuantizaciones antes de desplegar modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias de la cuantizacion Q5_K_M ni comparaciones con los pesos originales de phi-2.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,0-2,5 GB para cargar el archivo GGUF de 1,87 GB mas el contexto y el overhead de llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien funciona en CPU.
- GPU de datacenter: A100, H100 y similares no son necesarias para este tamano; el modelo esta pensado para hardware modesto.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-phi-2-GGUF`), llama.cpp (`llama-cli -m phi-2-Q5_K_M.gguf`), y cualquier runtime compatible con GGUF (llama-cpp-python, text-generation-webui, LM Studio).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-phi-2-GGUF (Q5_K_M) | 2,78 B | no disponible (base: 2.048) | GGUF | apache-2.0 (repo) / MIT (base) | Hugging Face |
| microsoft/phi-2 (original) | 2,78 B | 2.048 | safetensors | MIT | Hugging Face |
| Otras cuantizaciones GGUF de phi-2 | 2,78 B | 2.048 | GGUF | MIT (base) | Hugging Face (multiples autores) |
| Modelos de ~3 B de la misma generacion (p. ej. familias Llama o Qwen) | ~3 B | variable | safetensors/GGUF | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias de calidad entre esta cuantizacion y las alternativas.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: cero descargas y cero likes; no hay evidencia externa de que la conversion sea correcta mas alla de la afirmacion del autor.
- Idiomas: no se documentan idiomas soportados; el modelo base phi-2 esta orientado principalmente al ingles, por lo que el rendimiento en castellano sera limitado.
- Contexto: no se declara en el repositorio; el modelo base phi-2 tiene 2.048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Alucinacion: al ser un modelo de 2,7 B, la tasa de errores factuales es alta en preguntas de conocimiento especializado.
- Licencia: el repositorio declara apache-2.0, pero el modelo base phi-2 se publica bajo MIT; conviene verificar la compatibilidad antes de un uso comercial.
- Cuantizacion: Q5_K_M introduce perdida de precision frente a los pesos originales; no se han publicado evaluaciones del impacto en calidad.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Fecha de creacion del repositorio: 2026-11-28, segun los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-phi-2-GGUF
- Modelo base microsoft/phi-2: https://huggingface.co/microsoft/phi-2
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
