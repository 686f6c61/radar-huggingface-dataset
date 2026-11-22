# mradermacher/Radiant-Dawn-26B-A4B-GGUF

## Resumen

Radiant-Dawn-26B-A4B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Sorihon/Radiant-Dawn-26B-A4B, publicada por el usuario mradermacher. El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parametros totales y unos 4 mil millones de parametros activos por token, un patron habitual en modelos disenados para inferencia eficiente. El repositorio no incluye model card propia mas alla de la referencia al modelo original, por lo que la mayor parte de las especificaciones tecnicas no estan documentadas en la informacion disponible.

La relevancia de esta publicacion reside en el formato: al tratarse de cuantizaciones GGUF, el modelo puede ejecutarse con llama.cpp y herramientas derivadas como Ollama o LM Studio, lo que facilita su despliegue en hardware de consumo. Sin embargo, la ausencia de documentacion sobre licencia, idiomas, datos de entrenamiento y benchmarks limita seriamente cualquier evaluacion rigurosa antes de su uso en produccion.

El autor (mradermacher) es conocido en el ecosistema por generar y publicar cuantizaciones GGUF de modelos de terceros de forma automatizada, no por desarrollar los modelos base. Por tanto, esta ficha describe principalmente el artefacto de cuantizacion y remite al repositorio original para los detalles del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre "26B-A4B"); detalles no disponibles |
| Parametros totales | 26B (segun nombre del modelo) |
| Parametros activos | 4B (segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo original en formato HF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Sorihon/Radiant-Dawn-26B-A4B mas alla de lo que sugiere su denominacion: un transformer con mezcla de expertos de 26B parametros totales y 4B activos. No hay datos publicados en la informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas.

Respecto al artefacto de cuantizacion, los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que se trata de una conversion desde pesos Hugging Face a GGUF mediante el pipeline estandar de llama.cpp. El campo `skip_mmproj: 1` sugiere que no se ha incluido proyector multimodal, aunque no se puede confirmar que el modelo base tenga capacidades de vision.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no documentada explicitamente.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 26B totales con 4B activos en GPUs de consumo, aprovechando el patron MoE para reducir el coste computacional por token.
- Experimentacion e investigacion: util para comparar el comportamiento de arquitecturas MoE de 26B-A4B frente a modelos densos de tamano similar en tareas de generacion de texto.
- Prototipado rapido con llama.cpp u Ollama: al estar en GGUF, se integra en flujos de prueba sin necesidad de infraestructura de servidor GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un rango amplio (de Q2_K a x-f16) que permite medir la degradacion de calidad segun el nivel de cuantizacion.
- Inferencia en CPU o entornos con VRAM limitada: las variantes Q2_K y Q3_K_S reducen el peso del modelo lo suficiente para entornos con recursos restringidos, a costa de perdida de calidad.
- Base para fine-tuning o destilacion: el modelo original en formato HF puede servir como punto de partida, aunque esta ficha se centra en las cuantizaciones GGUF para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir de 26B parametros totales):
  - x-f16: ~52 GB
  - Q8_0: ~28 GB
  - Q6_K: ~22 GB
  - Q5_K_M: ~18 GB
  - Q4_K_M: ~16 GB
  - Q3_K_M: ~13 GB
  - Q2_K: ~10 GB
- GPU recomendadas: A100 40/80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) para Q6_K y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en variantes Q4_K_M y menores; las variantes Q5_K_M y superiores requieren 18 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (MoE 26B-A4B) en la informacion proporcionada, ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre licencia, idiomas, datos de entrenamiento ni limitaciones declaradas por el autor original.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio Sorihon/Radiant-Dawn-26B-A4B antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no es posible cuantificarlo.
- Sesgos: desconocidos, al no documentarse la composicion del dataset de entrenamiento.
- Idiomas: no confirmados; el rendimiento en castellano es una incognita.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad respecto a Q5_K_M o superiores; se recomienda validar en la tarea concreta.
- Artefacto de terceros: el publicador (mradermacher) no es el autor del modelo; posibles errores de conversion no estan cubiertos por soporte oficial.
- Sin soporte multimodal confirmado: el flag `skip_mmproj` sugiere ausencia de proyector de vision, pero no se puede verificar si el modelo base lo tenia.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-GGUF
- Modelo original: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
