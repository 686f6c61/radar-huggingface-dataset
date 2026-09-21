# Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s1-babyai-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) sobre Qwen/Qwen3-1.7B, entrenado por el usuario Diluner con `gpt-5.4-mini` como modelo profesor. Se trata de la primera etapa de una cadena secuencial de entrenamiento por entornos (BabyAI → TextCraft → SearchQA), en la que cada entorno recibe cinco epocas y el estudiante y el metodo se arrastran de una etapa a la siguiente. El checkpoint publicado corresponde a la etapa completada de BabyAI (cinco epocas, 125 actualizaciones del optimizador), con fecha de creacion del 21 de septiembre de 2026.

El modelo es un transformer decoder-only denso de 2.031.739.904 parametros totales (1,7B sin contar embeddings), exportado en safetensors y compatible con `transformers` y `text-generation-inference`. El repositorio ocupa 8,1 GB e incluye configuracion, tokenizer y todos los shards de pesos, pero excluye el estado del optimizador, los logs sin procesar y las trayectorias del profesor.

Su relevancia es fundamentalmente metodologica: documenta un pipeline de destilacion y aprendizaje curricular sobre un modelo pequeno, con trazabilidad parcial (manifiesto de etapa y `experiment.json`). No es un modelo listo para produccion: el propio autor advierte de que no se adjunta ninguna evaluacion de esta etapa, de que no hay evidencia de ventaja general del metodo ni replicacion entre semillas, y de que las puntuaciones de los tres entornos solo pertenecen al modelo de la etapa 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3) |
| Parametros totales | 2.031.739.904 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card de este checkpoint. El modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN; no consta verificacion en este derivado |
| Tipos de cuantizacion | No se publican artefactos cuantizados; solo safetensors. La cuantizacion posterior (GPTQ, AWQ, bitsandbytes, GGUF) es tecnicamente posible pero no esta validada por el autor |
| Idiomas soportados | No disponibles en la model card. El modelo base Qwen3-1.7B declara soporte para mas de 100 idiomas; no hay evidencia de que ese multilingüismo se conserve tras el SFT |
| Licencia | No se declara licencia para el checkpoint. El modelo base Qwen/Qwen3-1.7B se distribuye bajo Apache-2.0, pero el autor indica explicitamente que no afirma ninguna licencia para este derivado |
| Formato de pesos | safetensors (repo de 8,1 GB; el tamano es consistente con pesos en precision completa, aunque la model card no lo confirma) |
| Modelo base | Qwen/Qwen3-1.7B |
| Metodo de entrenamiento | SFT con profesor `gpt-5.4-mini` |
| Etapa del curriculum | Etapa 1 de 3 (BabyAI), completada; 5 epocas, 125 actualizaciones del optimizador |
| Libreria de inferencia | transformers; tag `text-generation-inference` y `endpoints_compatible` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso, sin mezcla de expertos, con 2.031.739.904 parametros totales. El repositorio conserva la configuracion y el tokenizer originales, de modo que la arquitectura no se ha modificado; lo unico que cambia respecto al modelo base son los pesos resultantes del SFT.

El entrenamiento es un ajuste supervisado con destilacion desde un profesor propietario (`gpt-5.4-mini`), dentro de una cadena curricular secuencial de tres entornos: BabyAI, TextCraft y SearchQA. Cada entorno se entrena durante cinco epocas y el estudiante se transfiere de una etapa a la siguiente, de forma que este checkpoint es el resultado final de la etapa BabyAI (125 actualizaciones del optimizador) y sirve como punto de partida para la etapa TextCraft. El autor aporta como evidencia de finalizacion un manifiesto completo de etapa, el recuento verificado de pasos y la tarea de control completada con marcador de verificacion. No se documentan innovaciones arquitectonicas propias (no hay atencion lineal, decodificacion especulativa ni variantes hibridas): la novedad esta en el procedimiento de entrenamiento secuencial, no en el modelo.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada del modelo base Qwen3-1.7B.
- Seguimiento de instrucciones en el dominio BabyAI (tareas de tipo gridworld con ordenes compuestas), que es el unico dominio sobre el que se ha entrenado esta etapa.
- Punto de partida para las etapas posteriores de la cadena (TextCraft y SearchQA) dentro del mismo pipeline experimental.
- Capacidades multilingues: no verificadas en este checkpoint; las del modelo base no se han evaluado tras el SFT.
- Tool calling / function calling: no documentado ni evaluado.
- Soporte de agentes y razonamiento multi-paso: no documentado. El pipeline es de entrenamiento para agentes, pero no hay evidencia publicada de que este checkpoint ejecute bucles de agente de forma fiable.
- Modo "thinking", vision o audio: no disponible.
- Razonamiento general, codigo y matematicas: no evaluado; el ajuste sobre BabyAI puede haber degradado estas capacidades respecto al modelo base, y no hay mediciones que lo cuantifiquen.

## Casos de uso

- Investigacion en aprendizaje curricular secuencial: usar el checkpoint como etapa inicial reproducible de la cadena BabyAI → TextCraft → SearchQA, comparando la transferencia entre etapas y el efecto de las cinco epocas por entorno.
- Estudio de olvido catastrofico: comparar este derivado contra Qwen3-1.7B original en tareas generales para medir cuanto se pierde al especializar en un unico entorno de agentes.
- Analisis de destilacion desde un profesor propietario: el pipeline usa `gpt-5.4-mini` como profesor sobre un estudiante de 1,7B, lo que permite estudiar la transferencia de comportamiento y el coste de generar trayectorias.
- Prototipado local de bajo coste: con 2,03B parametros, el modelo entra en GPUs de consumo, lo que permite experimentar con tecnicas de SFT y evaluacion sin clúster.
- Base para fine-tuning posterior: al conservar configuracion y tokenizer originales, puede actuar como punto de partida para SFT adicional con `transformers` o con frameworks que carguen safetensors.
- Reproduccion de experimentos de agentes en entornos de texto: util como referencia para validar manifiestos de etapa, recuentos de pasos y trazabilidad de checkpoints intermedios.
- Docencia y formacion: ejemplo real de un modelo pequeno entrenado por un particular, con sus limitaciones de evaluacion y licencia, adecuado para discutir buenas practicas de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no se adjunta ninguna evaluacion completada para este checkpoint intermedio y que las puntuaciones de los tres entornos pertenecen unicamente al modelo de la etapa 3 completamente entrenado. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K ni de las metricas de BabyAI para este repositorio.

## Requisitos de hardware

- Parametros: 2.031.739.904. En bf16 los pesos ocuparian aproximadamente 4,1 GB; en fp32, aproximadamente 8,1 GB (el repositorio publicado ocupa 8,1 GB, lo que sugiere precision completa).
- VRAM estimada para inferencia: en torno a 5-6 GB en bf16 con contexto moderado, y en torno a 9-10 GB si se carga en precision completa. Son estimaciones derivadas del tamano, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); A100 y H100 son sobredimensionadas para este tamano y solo tendrian sentido para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas, especialmente si se cuantiza a 8 bits.
- Opciones de despliegue: `transformers` (soporte nativo, tal como aparece en la model card), Text Generation Inference (el repositorio lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM para servicio con batching. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Este checkpoint (gpt54-mini-sequential-qwen3-1.7b-sft-s1-babyai) | 2,03B | No especificado; hereda la configuracion del base | No declarada por el autor | Pesos safetensors publicos; sin evaluacion adjunta; especializado en BabyAI |
| Qwen/Qwen3-1.7B | 2,03B (1,7B sin embeddings) | 32.768 nativos; 131.072 con YaRN | Apache-2.0 | Modelo base generalista, con evaluaciones publicadas por el autor original |
| Llama-3.2-3B | 3,21B | 128.000 | Llama 3.2 Community License | Generalista, con restricciones de licencia para uso comercial a gran escala |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache-2.0 | Generalista, orientado a despliegue en dispositivos con pocos recursos |

La comparacion de rendimiento no es posible: no hay resultados de benchmarks publicados para este checkpoint, y las cifras de los modelos alternativos corresponden a sus propias evaluaciones, no a una comparacion controlada frente a este derivado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor confirma que no se adjunta ninguna evaluacion completada para este checkpoint. Cualquier uso en produccion seria a ciegas.
- Especializacion estrecha: el SFT se ha realizado unicamente sobre BabyAI (tareas de tipo gridworld). Es esperable una degradacion de las capacidades generales del modelo base, aunque no hay mediciones que la cuantifiquen.
- Riesgo de sobreajuste: cinco epocas y 125 actualizaciones del optimizador sobre un unico entorno es un regimen que puede producir sobreajuste al formato y vocabulario de ese entorno.
- Alucinacion: no evaluada. No hay datos sobre la tasa de respuestas incorrectas fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva de este checkpoint no esta verificada; el multilingüismo del modelo base no se ha comprobado tras el ajuste.
- Licencia no resuelta: el autor no declara licencia para el checkpoint y remite a los terminos del modelo base y a los aplicables. El uso comercial de este derivado no esta juridicamente claro y deberia consultarse con asesoria legal antes de integrarlo en un producto.
- Trazabilidad limitada: el propio autor advierte de que el inventario de seleccion registra nombres de fichero, tamanos y fechas de modificacion, pero no es un hash byte a byte de los tensores ligado a respuestas de evaluacion historicas.
- Riesgo de atribucion incorrecta: no deben atribuirse a este checkpoint las puntuaciones de etapas posteriores ni de ejecuciones independientes anteriores.
- Cadena experimental distinta: este checkpoint procede de una cadena secuencial propia, no de la ejecucion historica independiente, por lo que no es directamente comparable con otros resultados publicados del mismo autor.
- Riesgo de destilacion desde profesor propietario: se desconoce si los terminos de uso de `gpt-5.4-mini` permiten redistribuir pesos derivados de sus salidas; es un punto a verificar antes de cualquier uso.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento del analisis, sin validacion por parte de la comunidad.
- Los resultados de la busqueda web realizada no contienen ninguna referencia relevante al modelo: unicamente aparecen paginas de una funeraria de Nebraska, sin relacion alguna con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s1-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Fichero de referencias y checksums del experimento: `experiment.json`, en la raiz del repositorio de HuggingFace
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web no devolvio ningun resultado relacionado con este modelo.
