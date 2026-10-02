# sail-ing-north/Qwen3-32B-FP8-rescaled

## Resumen

Qwen3-32B-FP8-rescaled es una version cuantizada en FP8 de Qwen3-32B, el modelo denso de 32.800 millones de parametros de la tercera generacion de la familia Qwen. Lo publica el usuario sail-ing-north como un checkpoint derivado del Qwen/Qwen3-32B original, reutilizando la receta de cuantizacion FP8 de grano fino (block size 128) que Qwen aplica a sus propios checkpoints oficiales. El problema que resuelve es el de servir un modelo de 32B en precision reducida para reducir el uso de VRAM y aumentar el throughput sin recurrir a cuantizaciones de menor fidelidad como INT4.

Se trata de un transformer decoder-only causal con 64 capas y atencion GQA (64 cabezas de consulta y 8 de clave/valor), con una longitud de contexto nativa de 32.768 tokens ampliable a 131.072 tokens mediante YaRN. Al estar basado en Qwen3-32B, hereda las capacidades de razonamiento, generacion de codigo, matematicas, soporte de agentes y mas de 100 idiomas del modelo base, ademas del conmutador `enable_thinking` que alterna entre modo de razonamiento explicito y modo de dialogo directo.

La relevancia de este checkpoint es practica: el FP8 con bloques de 128 permite cargar los ~32.8B de parametros en aproximadamente 33 GB, lo que lo hace desplegable en una sola GPU de 48 GB (L40S, A6000 Ada) o en dos GPU de 24 GB, en lugar de los ~65 GB que exigiria el modelo en bfloat16. El sufijo "rescaled" no aparece documentado en la model card, por lo que el detalle del reescalado de escalas de cuantizacion no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, atencion GQA |
| Parametros totales | 32.762.123.264 (32.8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 31.2B |
| Numero de capas | 64 |
| Cabezas de atencion | 64 para Q, 8 para KV (GQA) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | FP8 de grano fino con block size 128 (checkpoint del repo); el modelo base admite ademas bfloat16, GGUF e INT4 en otros repos derivados |
| Idiomas soportados | mas de 100 idiomas y dialectos (segun la model card del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere >= 4.51.0) |
| Tamano del repositorio | 34,3 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-32B |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-32B: un transformer decoder-only causal de 32.8B parametros (31.2B excluyendo embeddings) con 64 capas y atencion con consultas agrupadas (GQA) de 64 cabezas de consulta frente a 8 cabezas de clave/valor. La atencion con ventana deslizante y el esquema de RoPE con base configurable permiten extender el contexto de los 32.768 tokens nativos hasta 131.072 tokens mediante YaRN, un metodo de escalado posicional que se activa en tiempo de inferencia o mediante configuracion. No hay componentes MoE, SSM ni hibridos: es un modelo denso.

Sobre el entrenamiento, la informacion disponible corresponde al modelo base Qwen3-32B y no a este checkpoint concreto. Qwen indica que Qwen3 se construyo con fases de preentrenamiento y postentrenamiento sobre un corpus extenso y multilingue, con alineacion posterior orientada a preferencias humanas, razonamiento, seguimiento de instrucciones y capacidades de agente. No se especifican en la informacion proporcionada ni el numero exacto de tokens de entrenamiento ni la composicion del dataset ni los algoritmos concretos de RLHF o DPO empleados.

La unica modificacion tecnica documentada respecto al modelo base es la cuantizacion: FP8 de grano fino con bloques de 128 elementos, cuyo detalle se encuentra en el campo `quantization_config` del `config.json`. El repositorio no explica en que consiste el reescalado indicado en el nombre del modelo, por lo que no es posible confirmar si se han recalibrado las escalas de cuantizacion respecto al checkpoint FP8 oficial de Qwen. Si se conoce una advertencia de implementacion: en `transformers`, la cuantizacion FP8 de grano fino presenta problemas en inferencia distribuida, y puede ser necesario definir `CUDA_LAUNCH_BLOCKING=1` cuando se usan varias GPU.

## Capacidades

- Generacion de texto y conversacion multi-turno con seguimiento de instrucciones.
- Razonamiento explicito en modo "thinking", activable mediante `enable_thinking=True`, con trazas de pensamiento delimitadas por tokens especiales (`</think>`, id 151668).
- Modo "non-thinking" para dialogo general de baja latencia, conmutables dentro del mismo modelo.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Generacion y comprension de codigo, con soporte de lenguajes de programacion habituales.
- Soporte de tool calling y function calling tanto en modo thinking como en modo directo.
- Capacidades de agente: integracion con herramientas externas y razonamiento multi-paso.
- Multilingue: mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Escritura creativa, role-playing y alineacion con preferencias humanas.
- Extension de contexto hasta 131.072 tokens mediante YaRN.
- No incluye vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historiales largos gracias a los 32.768 tokens de contexto nativo (131.072 con YaRN), y el modo non-thinking reduce la latencia en respuestas rutinarias.
- Generacion de codigo en produccion: soporta tool calling y modo thinking, lo que permite integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores de compilacion, con la ventaja de que el FP8 reduce el coste por GPU.
- Agentes autonomos con herramientas: la combinacion de razonamiento multi-paso y function calling permite construir agentes que consulten APIs, bases de datos o sistemas de ficheros, dejando la traza de razonamiento en el modo thinking para auditoria.
- Analisis de documentos largos: contratos, informes tecnicos o expedientes que no caben en contextos de 8K o 32K se pueden procesar activando YaRN hasta 131.072 tokens, con resumen, extraccion de entidades y respuesta a preguntas sobre el documento.
- Asistencia matematica y cientifica: resolucion de problemas de varios pasos en modo thinking, util en herramientas educativas o en validacion de calculos dentro de flujos de ingenieria.
- Traduccion y localizacion multilingue: con soporte de mas de 100 idiomas, es adecuado para pipelines de traduccion automatica y para atencion al cliente en mercados multiples.
- Generacion aumentada por recuperacion (RAG): el contexto amplio permite inyectar muchos fragmentos recuperados; el modelo cita y sintetiza sobre ellos, y el modo non-thinking mantiene la latencia baja.
- Despliegue autoalojado con requisitos de privacidad: al ser un checkpoint de 33 GB en FP8 con licencia Apache 2.0, se puede servir en infraestructura propia sin enviar datos a terceros, algo critico en sectores regulados.
- Evaluacion comparativa de cuantizaciones: sirve como banco de pruebas para medir la perdida de calidad de FP8 frente a bfloat16 en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de tareas de agente, y la busqueda web asociada no ha devuelto resultados tecnicos relevantes (los resultados obtenidos tratan sobre la cadena de tiendas SAIL y sobre el termino "sail" en otros contextos, sin relacion con el modelo). Cualquier cifra de rendimiento de Qwen3-32B en bfloat16 corresponde al modelo base y no a esta variante FP8 reescalada, por lo que no se reproduce aqui.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 33 GB en FP8 (32,8B parametros a 1 byte por parametro mas escalas y metadatos), frente a unos 65 GB en bfloat16.
- VRAM adicional para cache KV: depende de la longitud de contexto y del batch. Con GQA de 8 cabezas KV, el coste por token es relativamente bajo, pero a 131.072 tokens y batch alto la cache puede superar varias decenas de GB.
- GPU recomendadas: H100, H200 y B200 para FP8 nativo con maxima eficiencia; L40S y A6000 Ada como opciones de 48 GB en una sola tarjeta; A100 (sin soporte FP8 nativo en hardware, requiere emulacion o fallback) como opcion menos eficiente.
- GPU de consumo: no cabe en una RTX 4090, RTX 4080 ni similares de 16-24 GB por el tamano de los pesos en FP8. Seria necesario repartir el modelo entre dos GPU de 24 GB, con la advertencia de los problemas de FP8 distribuido en `transformers`.
- Opciones de despliegue: SGLang (>= 0.4.6.post1) y vLLM (>= 0.8.5) como servidores de inferencia recomendados, ambos con soporte de `--reasoning-parser` y API compatible con OpenAI; `transformers` para uso puntual; llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers para uso local (habitualmente sobre versiones GGUF del modelo base, no sobre este checkpoint FP8).
- Latencia y throughput: no disponibles en la informacion proporcionada. El rendimiento dependera del hardware, del framework y de si se activa el modo thinking, que incrementa notablemente el numero de tokens generados por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B-FP8-rescaled | 32,8B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors FP8 | Repositorio de terceros derivado de Qwen3-32B |
| Qwen/Qwen3-32B (base, bfloat16) | 32,8B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors bf16 | Oficial de Qwen |
| Qwen/Qwen3-32B-FP8 | 32,8B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors FP8 | Oficial de Qwen |
| QwQ-32B | 32,8B denso | 131.072 | Apache 2.0 | safetensors bf16 y GGUF | Oficial de Qwen |

No se dispone de datos de benchmarks en la informacion proporcionada que permitan comparar el rendimiento efectivo de estas variantes. La diferencia entre este checkpoint y Qwen/Qwen3-32B-FP8 estriba unicamente en el reescalado no documentado, por lo que sin una evaluacion empirica no es posible afirmar cual es mejor.

## Limitaciones y advertencias

- No se han publicado evaluaciones de este checkpoint concreto: se desconoce si el reescalado altera la calidad respecto al FP8 oficial de Qwen.
- Riesgo de alucinacion: como cualquier modelo generativo de 32B, puede producir afirmaciones plausibles pero falsas, especialmente en modo non-thinking y en dominios de baja cobertura.
- Cuantizacion FP8: introduce una perdida de precision respecto a bfloat16 que puede manifestarse en tareas sensibles al detalle numerico o a la generacion de codigo largo.
- Problemas conocidos en `transformers`: la cuantizacion FP8 de grano fino da problemas en inferencia distribuida; puede requerir `CUDA_LAUNCH_BLOCKING=1`, lo que penaliza el rendimiento.
- Requisitos de hardware: no cabe en GPU de consumo de 24 GB o menos; requiere 48 GB en una sola tarjeta o reparto entre varias.
- Version de `transformers` minima: con versiones anteriores a 4.51.0 se produce un `KeyError: 'qwen3'`.
- Idiomas: aunque la model card declara mas de 100 idiomas, el rendimiento real varia mucho entre lenguas; no hay datos especificos para este checkpoint.
- Modo thinking: consume muchos tokens por respuesta, lo que incrementa coste y latencia; en produccion conviene desactivarlo cuando no sea necesario.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar el fichero LICENSE referenciado y las condiciones del modelo base.
- Repositorio de terceros: con 0 descargas y 0 likes en el momento de la consulta, no existe validacion comunitaria que respalde su calidad o reproducibilidad.
- Fecha de creacion del repositorio inusual (2026), dato que conviene contrastar con el autor antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sail-ing-north/Qwen3-32B-FP8-rescaled
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Checkpoint FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3-32B-FP8
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-32B-FP8/blob/main/LICENSE
- Paper de YaRN (referencia arxiv:2309.00071)
- Paper tecnico de Qwen3 (referencia arxiv:2505.09388)
