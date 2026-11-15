# mradermacher/Evie-GGUF

## Resumen

Evie-GGUF es la version cuantizada en formato GGUF del modelo Peeepy/Evie, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original es un transformer de aproximadamente 124 millones de parametros (124.439.808 segun los pesos en safetensors), lo que lo situa en la categoria de modelos pequenos orientados a tareas ligeras y despliegue en hardware modesto. Esta version GGUF existe para facilitar la ejecucion del modelo con llama.cpp, Ollama y otras herramientas compatibles con este formato.

La relevancia de esta ficha radica en que el repositorio ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta f16), lo que permite ajustar el equilibrio entre calidad y consumo de recursos. Sin embargo, la informacion publicada sobre el modelo base es muy limitada: no se detalla la composicion del dataset de entrenamiento, la longitud de contexto, ni los resultados de benchmarks. El modelo esta etiquetado unicamente para ingles y no se especifica la licencia, lo que supone una limitacion importante para su adopcion en produccion.

Al tratarse de una cuantizacion y no de un modelo original, esta ficha describe principalmente el artefacto GGUF y las caracteristicas heredadas del modelo base Peeepy/Evie. Cualquier evaluacion de capacidades debe remitirse al modelo original, cuya model card no aporta datos tecnicos adicionales mas alla de la arquitectura basica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Peeepy/Evie es un transformer de 124 millones de parametros. No se dispone de informacion publicada sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre la funcion de activacion o normalizacion empleada. Tampoco se detalla si se utilizo atencion lineal, decodificacion especulativa u otras innovaciones tecnicas.

Respecto al entrenamiento, la model card del repositorio cuantizado no incluye informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Esta ausencia de datos impide evaluar la calidad del proceso de entrenamiento y hace recomendable consultar el repositorio original (Peeepy/Evie) por si el autor hubiera publicado informacion adicional que no se refleja en esta cuantizacion.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado exclusivamente para el idioma ingles, sin evidencia de capacidades multilingues.
- Razonamiento basico y generacion de texto general: por su tamano (124M parametros), se espera un rendimiento limitado en tareas complejas de razonamiento.
- No hay informacion publicada sobre soporte de tool calling ni function calling.
- No hay informacion publicada sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion publicada sobre modo thinking, vision, audio ni otras capacidades especiales.
- Compatibilidad con el ecosistema GGUF: puede ejecutarse con llama.cpp, Ollama y otros runners compatibles con el formato.

## Casos de uso

- Prototipado rapido en local: gracias a su tamano reducido y a las cuantizaciones de 0,2 GB, permite probar pipelines de generacion de texto en equipos sin GPU dedicada, usando llama.cpp o Ollama como backend.
- Experimentacion educativa: util para estudiar el comportamiento de modelos pequenos en tareas de generacion de texto y comparar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida.
- Generacion de texto auxiliar en ingles: puede emplearse para tareas de completado simple, resumen de frases cortas o reformulacion, siempre que el contexto requerido sea reducido.
- Pruebas de integracion con transformers: al estar etiquetado con la libreria transformers, sirve para validar flujos de carga de modelos GGUF en entornos Python.
- Despliegue en dispositivos con recursos muy limitados: las cuantizaciones Q2_K y Q3_K caben en menos de 1 GB de RAM/VRAM, lo que permite ejecucion en Raspberry Pi o contenedores con memoria restringida.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que facilita medir la degradacion de perplejidad entre tipos de cuantizacion en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,4 GB (f16) segun el archivo de cuantizacion, tal como figura en la tabla de quants del repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM es suficiente; no se requiere hardware profesional (A100, H100) para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia muy baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Evie-GGUF (este modelo) | 124M | no disponible | no disponible | GGUF | Solo ingles, sin benchmarks publicados |
| GPT-2 small | 124M | 1024 tokens | MIT | safetensors, GGUF | Referencia historica, ampliamente documentado |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, licencia clara |
| SmolLM-135M | 135M | 2048 tokens | Apache 2.0 | safetensors, GGUF | Tamano comparable, con benchmarks publicados |

La comparativa se limita a modelos de tamano similar con informacion publica disponible. Evie-GGUF carece de datos de contexto, licencia y rendimiento, lo que dificulta una comparacion rigurosa frente a alternativas como SmolLM-135M o GPT-2 small, que cuentan con documentacion completa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo base ni de la cuantizacion, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor antes de usarlo en produccion.
- Idiomas: solo se declara soporte para ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sesgos conocidos: no hay informacion publicada sobre sesgos, pero al ser un modelo pequeno y sin documentacion de alineacion, es probable que presente sesgos derivados de sus datos de entrenamiento.
- Riesgo de alucinacion: elevado en modelos de este tamano, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar su uso en conversaciones multi-turno largas.
- Ausencia de benchmarks: no hay datos que permitan estimar su calidad frente a alternativas, por lo que su adopcion conlleva un riesgo tecnico significativo.
- Modelo base poco documentado: la model card del modelo original no aporta detalles sobre entrenamiento ni evaluacion, lo que limita la trazabilidad del artefacto.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Evie-GGUF
- Modelo base original: https://huggingface.co/Peeepy/Evie
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Evie-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Evie-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
