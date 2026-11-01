# mradermacher/Nanbeige4.3-33B-Base-GGUF

## Resumen

Nanbeige4.3-33B-Base-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base Nanbeige4.3-33B-Base, desarrollado por el equipo Nanbeige y cuantizado por el usuario mradermacher. El modelo original es un LLM denso de 33.118.977.024 parámetros (unos 33B) entrenado principalmente para inglés y chino, y esta versión cuantizada busca resolver el problema habitual de estos modelos: su elevado consumo de memoria. Gracias al formato GGUF, el modelo puede ejecutarse localmente en CPU, GPU de consumo o configuraciones híbridas mediante llama.cpp y derivados como Ollama o LM Studio.

La relevancia de esta ficha radica en la disponibilidad de un modelo base de 33B bajo licencia Apache 2.0, una de las licencias más permisivas para uso comercial, con un abanico completo de cuantizaciones que van desde Q2_K (12,8 GB) hasta Q8_0 (35,3 GB). Esto permite ajustar el equilibrio entre calidad y requisitos de hardware según el caso de uso. Cabe destacar que se trata de un modelo base (no instruido ni alineado con chat), por lo que está pensado principalmente para completado de texto, fine-tuning posterior o investigación, y no para uso conversacional directo sin ajuste adicional. No se ha publicado información sobre la longitud de contexto, la arquitectura detallada ni benchmarks en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, sin detalles publicados) |
| Parametros totales | 33.118.977.024 (aprox. 33B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no proporciona detalles sobre la arquitectura interna del modelo (numero de capas, dimensiones, mecanismo de atencion) ni sobre el proceso de entrenamiento del modelo base Nanbeige4.3-33B-Base, como el numero de tokens, la composicion del dataset o el uso de tecnicas de alineacion (RLHF, DPO). Por las etiquetas del repositorio se sabe que es un modelo denso de tipo transformer compatible con la libreria transformers de Hugging Face y con endpoints estandar, y que su vocabulario y entrenamiento estan orientados a ingles y chino.

Al tratarse de un modelo base, no ha pasado por un proceso de instruccion o alineacion conversacional documentado, por lo que su comportamiento esperado es el de completado de texto. En cuanto a la cuantizacion, mradermacher ofrece cuantizaciones estaticas en formato GGUF generadas por conversion desde los pesos en safetensors del modelo original, con versiones k-quant (Q2_K a Q6_K, Q8_0) y una version i-quant (IQ4_XS). Ademas, existen cuantizaciones weighted/imatrix en un repositorio aparte, que suelen ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generacion de texto en ingles y chino (modelo base, orientado a completado de texto)
- Base adecuada para fine-tuning supervisado (SFT), DPO u otros procesos de alineacion posteriores
- Ejecucion local en CPU, GPU o configuraciones hibridas gracias al formato GGUF
- Compatibilidad con el ecosistema llama.cpp, Ollama, LM Studio y herramientas derivadas
- Amplia gama de cuantizaciones para ajustar calidad frente a consumo de memoria
- No dispone de capacidades documentadas de vision, audio ni modos de razonamiento (thinking mode)
- No hay informacion sobre soporte de tool calling, function calling ni capacidades de agente en el modelo base

## Casos de uso

- Fine-tuning para dominios especificos: al ser un modelo base con licencia Apache 2.0, se puede ajustar con datos propios (SFT/DPO) para crear modelos especializados en dominios como legal, medico o tecnico, sin restricciones de uso comercial.
- Investigacion y experimentacion: ideal para equipos de investigacion que quieran estudiar el comportamiento de modelos de 33B bilingues (ingles/chino) sin depender de APIs cerradas.
- Completado de texto y asistentes de escritura en chino e ingles: el modelo base puede integrarse en editores o herramientas de autocompletado mediante prompts de few-shot.
- Despliegue en hardware de consumo: con la version Q4_K_M (20,2 GB) cabe en una GPU de 24 GB de VRAM (RTX 3090/4090), lo que permite inferencia local rapida sin servidores de gama alta.
- Inferencia en CPU o equipos sin GPU: las versiones Q2_K y Q3_K (12,8-17,7 GB) permiten ejecutar el modelo en maquinas con RAM suficiente (32 GB) usando llama.cpp, a costa de perdida de calidad.
- Creacion de modelos bilingues chino-ingles: util para empresas que operan entre mercados chino y angloparlante y necesitan un modelo base con buen soporte de ambos idiomas para derivar versiones chat o agenticas.
- Evaluacion comparativa de cuantizaciones: el conjunto completo de quants permite medir la degradacion de calidad frente al tamaño, util para pipelines de optimizacion de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (sin contar KV cache ni overhead):
  - Q2_K: ~12,8 GB
  - Q3_K_M: ~16,4 GB
  - IQ4_XS: ~18,3 GB
  - Q4_K_M: ~20,2 GB
  - Q5_K_M: ~23,6 GB
  - Q6_K: ~27,3 GB
  - Q8_0: ~35,3 GB
  - F16 (pesos originales): ~66 GB
- GPU recomendadas:
  - RTX 3090/4090 (24 GB): adecuado para Q2_K a Q4_K_M
  - RTX 5090 (32 GB) o A6000 (48 GB): hasta Q6_K
  - A100 40GB/80GB, H100: todas las cuantizaciones, incluida inferencia en F16 con dos A100 40GB o una 80GB
- Consumer GPU: si cabe. Con una RTX 4090 de 24 GB se puede ejecutar la cuantizacion Q4_K_M recomendada (20,2 GB) con margen limitado para el contexto; con Q4_K_S o IQ4_XS hay algo mas de holgura.
- CPU: viable con 32 GB de RAM para quants de hasta Q4, y 64 GB para Q6_K/Q8_0; el rendimiento en CPU sera notablemente inferior al de GPU.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base original en safetensors es compatible con transformers y vLLM/TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base (este) | 33B | GGUF (quants de mradermacher) | Apache 2.0 | en, zh | Modelo base, sin alinear; datos de rendimiento no disponibles |
| Qwen2.5-32B | 32,5B | safetensors, GGUF (comunidad) | Apache 2.0 | multilingue (29+) | Modelo base y variantes instruct; benchmarks publicados, ecosistema maduro |
| Yi-1.5-34B | 34B | safetensors, GGUF (comunidad) | Apache 2.0 | en, zh | Bilingue chino-ingles, gama de tamaño muy similar; variantes base y chat |
| Gemma 2 27B | 27B | safetensors, GGUF (comunidad) | Gemma (restricciones de uso) | mayormente en | Modelo mas pequeño, licencia menos permisiva que Apache 2.0 |

Nota: la comparativa se basa en caracteristicas generales conocidas de los modelos alternativos; no hay datos de benchmarks del modelo analizado para comparar rendimiento directamente.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no esta alineado para seguir instrucciones ni para conversacion, por lo que producirá salidas de completado de texto. No es adecuado para asistentes sin fine-tuning previo.
- Sin benchmarks publicados en la model card: no es posible verificar su rendimiento frente a alternativas antes de evaluarlo por cuenta propia.
- Longitud de contexto no documentada: hay que consultar la configuracion del modelo base original antes de planificar despliegues con documentos largos.
- Riesgo de alucinacion inherente a cualquier LLM, agravado en modelos base sin alineacion, que pueden generar texto plausible pero falso sin salvaguardas.
- Sesgos: al tratarse de un modelo entrenado con datos web en ingles y chino, puede reproducir sesgos presentes en esos corpus; no hay documentacion de mitigacion disponible.
- Soporte linguistico limitado a ingles y chino: el rendimiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea inferior.
- Cuantizaciones agresivas (Q2_K, Q3_K_M) conllevan perdida de calidad notable segun el propio autor del repo; para mejor calidad/tamaño se recomiendan las cuantizaciones imatrix del repositorio i1.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones significativas, aunque hay que respetar los terminos de atribucion y aviso de licencia.
- Repositorio de cuantizacion de terceros: mradermacher no es el autor del modelo; para soporte del modelo original hay que acudir a Nanbeige/Nanbeige4.3-33B-Base.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Nanbeige4.3-33B-Base-GGUF
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Cuantizaciones weighted/imatrix (i1): https://huggingface.co/mradermacher/Nanbeige4.3-33B-Base-i1-GGUF
- Pagina de descarga alternativa: https://hf.tst.eu/model#Nanbeige4.3-33B-Base-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa colaboradora (nethype GmbH): https://www.nethype.de/
- Paper del modelo: no disponible
