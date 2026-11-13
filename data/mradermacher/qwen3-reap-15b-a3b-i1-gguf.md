# mradermacher/Qwen3-REAP-15B-A3B-i1-GGUF

## Resumen

Qwen3-REAP-15B-A3B-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwen3-REAP-15B-A3B, un derivado podado del Qwen3 original mediante la tecnica REAP (Router-weighted Expert Activation Pruning). El modelo base fue publicado por el usuario atbender y esta cuantizacion la ha realizado mradermacher, especialista en generar versiones GGUF de modelos open source para inferencia local. El modelo conserva la arquitectura MoE de Qwen3 pero reduce el numero de parametros totales hasta aproximadamente 16.000 millones, con unos 3.000 millones de parametros activos por token (de ahi el sufijo A3B).

La relevancia de esta ficha radica en que ofrece una via para ejecutar un modelo tipo Qwen3 con activacion dispersa en hardware de consumo, gracias a la cuantizacion GGUF con imatrix (importance matrix). El repositorio incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No obstante, la informacion publica disponible es muy limitada: no se detallan licencia, idiomas, pipeline ni resultados de benchmarks.

Al tratarse de una cuantizacion de un modelo derivado (no oficial de Alibaba), conviene tratar esta ficha como una referencia tecnica de despliegue mas que como una evaluacion de capacidades del modelo original. Los datos de arquitectura y entrenamiento se infieren del linaje Qwen3 y de los metadatos del repositorio, y se indican explicitamente como no disponibles cuando no constan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen3 y podada con REAP |
| Parametros totales | 16.030.316.544 (aprox. 16,03 mil millones) |
| Parametros activos | no disponible (el sufijo A3B sugiere aprox. 3 mil millones activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ5_K_S, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) derivado de la familia Qwen3. La tecnica REAP (Router-weighted Expert Activation Pruning) poda expertos del router en funcion de su activacion ponderada, reduciendo el numero total de parametros del modelo original mientras se intenta preservar el comportamiento del router. El resultado es un modelo de aproximadamente 16.000 millones de parametros totales con unos 3.000 millones activos por token, lo que reduce el coste computacional por inferencia frente al modelo Qwen3 completo del que procede.

Esta publicacion concreta no entrena el modelo: es una cuantizacion GGUF del checkpoint de atbender, generada con cuantizacion ponderada mediante imatrix (importance matrix) y con `output_tensor_quantised` activado, segun los metadatos del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco constan innovaciones adicionales como decodificacion especulativa o atencion lineal especificas de esta variante.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica uso previsto para dialogos multi-turno.
- Razonamiento y conocimiento general: heredado del linaje Qwen3, aunque no se detallan evaluaciones especificas para esta variante podada.
- Codigo y matematicas: capacidades tipicas de la familia Qwen3, no verificadas en esta cuantizacion concreta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs de consumo con 12-24 GB de VRAM, usando llama.cpp u Ollama, para asistentes conversacionales sin conexion.
- Prototipado de agentes conversacionales: el tag `conversational` y la ventana de contexto de Qwen3 (no confirmada para esta variante) lo hacen adecuado para construir bots de soporte con historial de conversacion en entornos de desarrollo.
- Evaluacion de tecnicas de poda: util para investigadores que quieran comparar el comportamiento de un modelo Qwen3 podado con REAP frente al original, midiendo degradacion en tareas de razonamiento.
- Servicio de inferencia de bajo coste: al tener solo unos 3.000 millones de parametros activos, el throughput por token es menor que el de un modelo denso de 16B, lo que lo hace atractivo para servir en CPU o GPUs modestas con llama.cpp.
- Generacion de texto en pipelines por lotes: cuantizaciones pequenas como IQ2_M o Q3_K_M permiten procesar grandes volumenes de texto en hardware limitado, aceptando cierta perdida de calidad.
- Educacion y experimentacion: sirve como ejemplo practico de cuantizacion GGUF con imatrix y de modelos MoE podados para cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_S / IQ2_XXS / IQ2_XS: en torno a 5-6 GB.
  - Q3_K_M / IQ3_M: en torno a 7-8 GB.
  - Q4_K_M / IQ4_XS: en torno a 9-10 GB.
  - Q5_K_M / Q6_K: en torno a 11-13 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, especialmente en cuantizaciones Q3 y Q4 con GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-REAP-15B-A3B-i1-GGUF (este) | 16,03 B | no disponible (aprox. 3 B) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B (original) | 30 B | 3 B | 32.768 tokens (segun Qwen3) | Apache 2.0 (segun Qwen3) | safetensors, GGUF |
| Qwen3-14B (denso) | 14 B | 14 B | 32.768 tokens (segun Qwen3) | Apache 2.0 (segun Qwen3) | safetensors, GGUF |
| Mistral Small 3 (24B) | 24 B | 24 B | 32.000 tokens | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparativos corresponden a sus fichas oficiales publicas; los de este modelo son los unicos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial sin consultar el repositorio del modelo base (atbender/Qwen3-REAP-15B-A3B) y la licencia de Qwen3.
- Modelo derivado no oficial: al ser una poda y cuantizacion de terceros, no cuenta con el respaldo de Alibaba ni garantias de calidad equivalentes al Qwen3 original.
- Riesgo de degradacion por poda: la eliminacion de expertos con REAP puede afectar a tareas de razonamiento o codigo no evaluadas en esta variante.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta cuantizacion.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni el rendimiento en castellano.
- Cuantizaciones agresivas (IQ1, IQ2): perdida de calidad notable; no recomendadas para produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/Qwen3-REAP-15B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/atbender/Qwen3-REAP-15B-A3B
