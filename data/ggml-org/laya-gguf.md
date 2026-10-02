# ggml-org/Laya-GGUF

## Resumen

Laya-GGUF es la conversion a formato GGUF del modelo Laya, desarrollado originalmente por ConvAI Innovations (convaiinnovations/laya) y empaquetado por el equipo de ggml-org para su ejecucion en el ecosistema llama.cpp. No se trata de un modelo generativo al uso: la propia model card lo describe como un "decision model" (modelo de decision) pensado para consumirse a traves del endpoint `/v1/systemone`, lo que lo situa en la categoria de los denominados modelos de sistema 1, orientados a producir decisiones tipadas de baja latencia en lugar de texto libre.

El modelo base tiene 421.029.889 parametros (unos 421 millones) y se distribuye bajo licencia Apache 2.0. Su pipeline declarado en HuggingFace es `text-classification`, con etiquetas adicionales de `feature-extraction` y `decision-model`, lo que refuerza la idea de que su salida es una clasificacion o decision estructurada, no una generacion autoregresiva convencional. El repositorio GGUF ocupa 1,3 GB, un tamano que sugiere la presencia de varias cuantizaciones o de pesos en precision relativamente alta para un modelo de este tamano.

La relevancia de esta publicacion es sobre todo de infraestructura: forma parte del esfuerzo por integrar modelos de decision en llama.cpp (PR 29818) y en el runtime alternativo ggmlc, que aporta un ejecutable sin dependencias para servirlo de forma compatible con clientes tipados. Para desarrolladores que necesiten clasificacion o enrutamiento de decisiones en local y con requisitos de latencia estrictos, es una pieza a considerar dentro de un ecosistema que hasta ahora estaba dominado por LLM generativos. La informacion publica disponible es, no obstante, muy escasa en cuanto a detalles de entrenamiento, contexto e idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base; el slice de pruebas derivado (`ggml-org/tinylaya-for-testing`) declara arquitectura modern-bert |
| Parametros totales | 421.029.889 (aproximadamente 421 M) |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos GGUF cuantizados; el detalle de niveles del repo no esta documentado. El slice de pruebas se distribuye en Q8_0 |
| Idiomas soportados | No disponible. El runtime ggmlc menciona variantes distribuidas en "english / multilingual / typed-decisions" |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base de origen) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo base Laya en la documentacion disponible. El unico dato tecnico indirecto proviene del slice de pruebas `ggml-org/tinylaya-for-testing-gguf`, descrito como una porcion de `convaiinnovations/laya` con 89,7 M de parametros y arquitectura declarada "modern-bert". Si esa clasificacion se mantiene en el modelo completo, Laya corresponderia a la familia BERT moderna (encoder bidireccional con mejoras tipo RoPE, normalizacion y atencion optimizada), lo que encaja con su uso como clasificador de decisiones y con el pipeline `text-classification` / `feature-extraction` declarado. En cualquier caso, esto es una inferencia a partir de un derivado y no una confirmacion directa.

Tampoco hay datos publicos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas concretas. Lo que si esta documentado es la capa de integracion: la model card indica que el modelo se consume mediante el endpoint `/v1/systemone`, gestionado por el PR 29818 de llama.cpp, y que la conversion a GGUF se realiza de forma automatica con la herramienta `ggml-org/convert`. El runtime ggmlc permite ademas ejecutarlo como binario sin dependencias, con compatibilidad con clientes tipados y un preprocesador propio ("Laya preprocessor") que solo se activa si el fichero GGUF no declara la clave `ggmlc.decision`.

## Capacidades

- Clasificacion y decision tipada: el modelo esta disenado para emitir decisiones estructuradas de sistema 1, no texto libre, y se invoca a traves de la API `/v1/systemone`.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` sugiere que puede emplearse para obtener embeddings o representaciones internas reutilizables por otros componentes.
- Text classification: pipeline declarado en HuggingFace, apto para tareas de categorizacion y enrutamiento.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que indica que puede desplegarse tras una API estandar del ecosistema HuggingFace.
- Ejecucion local en CPU: al distribuirse en GGUF, esta pensado para inferencia en hardware modesto sin GPU dedicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el enfoque es de decision de un solo paso, "system-1").
- Capacidades multilingues: no confirmadas. Existen variantes distribuidas etiquetadas como "multilingual" en el runtime ggmlc, pero no se especifica la cobertura de idiomas.
- Capacidades especiales (vision, audio, thinking mode): ninguna documentada.
- Seleccion de variante por clave de metadatos: el runtime ggmlc usa la clave `ggmlc.decision` para distinguir modelos de decision y evitar aplicar el preprocesador de Laya a otros modelos.

## Casos de uso

- Enrutamiento de peticiones en pipelines de IA: el modelo puede actuar como clasificador previo que decida a que modelo o servicio derivar cada consulta, aprovechando su latencia baja y su naturaleza de sistema 1 frente a un LLM generativo.
- Moderacion y filtrado de contenido: dado su pipeline de `text-classification`, encaja en un clasificador de primera linea que descarte o etiquete entradas antes de llegar a modelos mas costosos.
- Extraccion de caracteristicas para busqueda semantica: usando la etiqueta `feature-extraction` y sus representaciones internas, puede alimentar un indice vectorial para recuperacion de documentos o similitud semantica.
- Clasificacion de tickets de soporte: integrado mediante `/v1/systemone`, permite categorizar automaticamente incidencias por tipo, urgencia o equipo responsable en un flujo de atencion al cliente.
- Preprocesado en asistentes conversacionales: deteccion de intencion o de necesidad de herramienta antes de invocar un LLM mayor, reduciendo coste y latencia en el camino critico.
- Despliegue en el borde (edge) o en portatil: con GGUF y 421 M de parametros, puede ejecutarse en CPU o en GPU de gama baja dentro de aplicaciones de escritorio o dispositivos con recursos limitados.
- Servicio local compatible con clientes tipados: el ejecutable sin dependencias de ggmlc permite empaquetar el modelo como un binario que expone decisiones tipadas a una aplicacion cliente, sin instalar un stack de Python.
- Evaluacion y pruebas de integracion: el slice `tinylaya-for-testing` esta pensado explicitamente para validar cargadores y runtimes, lo que resulta util en pipelines de CI que comprueban la compatibilidad de GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 421 M de parametros; cifras orientativas, no publicadas por el autor):
  - FP16: aproximadamente 0,85 GB.
  - Q8_0: aproximadamente 0,45 GB.
  - Q4_K_M: aproximadamente 0,26 GB.
- GPU recomendadas: no se especifica ninguna. Por tamano, cualquier GPU con 1 GB o mas de memoria libre es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: si. Modelos como RTX 3060, RTX 4060, GTX 1650 o incluso iGPU con memoria compartida pueden ejecutarlo sin problema.
- Ejecucion en CPU: plenamente viable, y es el escenario previsto para el formato GGUF.
- Opciones de despliegue documentadas:
  - llama.cpp, incluyendo el endpoint `/v1/systemone` introducido en el PR 29818.
  - `llama serve -hf ggml-org/Laya-GGUF`, a traves de https://llama.app.
  - Runtime ggmlc, con ejecutable sin dependencias y compatibilidad con clientes tipados.
- Latencia y throughput: no disponible. Dado el tamano, se espera latencia de milisegundos en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ggml-org/Laya-GGUF | 421 M (modelo base) | No disponible | Modelo de decision / clasificacion (sistema 1) | Apache 2.0 | GGUF en HuggingFace |
| ggml-org/tinylaya-for-testing-gguf | 89,7 M | No disponible | Slice de pruebas, misma familia | Apache 2.0 (heredada) | GGUF en HuggingFace; salidas sin sentido, solo para pruebas |
| Jev | No disponible | No disponible | Modelo de decision de sistema 1, alternativa que Laya pretende sustituir | No disponible | No disponible |
| Alternativas generativas de ~400 M (p. ej. variantes tipo Qwen, Gemma o Phi de ese orden) | ~400 M | No disponible | LLM generativo | Variable | No verificable con la informacion aportada |

La comparacion cuantitativa con alternativas directas no es posible: no hay benchmarks publicados ni especificaciones del modelo Jev al que la discusion de llama.cpp se refiere como referencia del segmento.

## Limitaciones y advertencias

- No es un modelo conversacional: produce decisiones tipadas, no texto. Usarlo como si fuera un chatbot dara resultados incorrectos.
- Ausencia de datos de entrenamiento: no se documentan dataset, tokens, ni proceso de alineacion, lo que dificulta evaluar sesgos y robustez.
- Sesgos conocidos: no disponibles, pero al no publicarse la composicion del corpus no es posible descartar sesgos en las decisiones de clasificacion.
- Riesgo de alucinacion: bajo en el sentido generativo, pero existe riesgo de clasificaciones erroneas o de baja confianza si la entrada se aleja de la distribucion de entrenamiento.
- Contexto e idiomas no especificados: se desconoce la longitud de contexto soportada y la cobertura real de idiomas; las variantes "multilingual" citadas en ggmlc no detallan que lenguas incluyen.
- Compatibilidad de runtime restringida: su uso pasa por llama.cpp (con el endpoint `/v1/systemone`) o por ggmlc. No consta soporte en vLLM, TGI u Ollama para esta arquitectura, por lo que no se puede asumir un despliegue estandar de LLM.
- Advertencia del slice de pruebas: `tinylaya-for-testing` genera salidas sin sentido semantico; usarlo en produccion o para evaluar calidad es un error.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base `convaiinnovations/laya` y de los pesos originales antes de desplegarlo en produccion.
- Madurez: el repositorio tiene 0 descargas y la integracion en llama.cpp se apoya en un PR concreto y en un runtime alternativo (ggmlc), por lo que el soporte puede cambiar y conviene fijar versiones.
- Metadatos incompletos: la ficha de HuggingFace no declara idiomas, y el autor del modelo original no aparece como responsable de esta conversion, que es automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ggml-org/Laya-GGUF
- Modelo base original: https://huggingface.co/convaiinnovations/laya
- Slice de pruebas: https://huggingface.co/ggml-org/tinylaya-for-testing-gguf
- Conversion alternativa a GGUF: https://huggingface.co/ZeroDegress/laya-gguf
- Ejemplos de Laya en el runtime ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- Discusion en llama.cpp sobre Laya como alternativa a Jev: https://github.com/ggml-org/llama.cpp/discussions/29246
- Pull request del endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/29818
- Herramienta de conversion automatica: https://github.com/ggml-org/convert
- Ejecucion con llama.app: https://llama.app
- Guia sobre cuantizacion GGUF (referencia general): https://tech-insider.org/gguf-model-quantization-2026/
