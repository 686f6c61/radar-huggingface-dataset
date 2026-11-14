# liodon-ai/granite-4.1-3b-llmon-preview-imatrix-GGUF

## Resumen

Esta ficha cubre `liodon-ai/granite-4.1-3b-llmon-preview-imatrix-GGUF`, una cuantizacion en formato GGUF del modelo base `ibm-granite/granite-4.1-3b-llmon-preview` de IBM, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a precisiones reducidas (de 2 a 8 bits) para facilitar la inferencia local en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan. El modelo base pertenece a la familia Granite 4.1 de IBM, orientada a generacion de texto conversacional.

El modelo base cuenta con 3.659.737.600 parametros (aproximadamente 3,66 mil millones), lo que lo situa en la categoria de modelos pequenos ("small language models"). La cuantizacion emplea la tecnica iMatrix, que ejecuta 128 fragmentos de calibracion sobre el modelo en precision completa para determinar que pesos son mas sensibles y asignarles mayor precision, usando 2 millones de tokens de WikiText-103 como conjunto de calibracion. Segun el autor, esto mejora la coherencia y el seguimiento de instrucciones en cuantizaciones de 2, 3 y 4 bits sin aumentar el tamano del fichero.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de IBM de ~3,7B parametros en equipos con tan solo 2-4 GB de VRAM/RAM, con opciones desde IQ2_M (1,35 GB) hasta Q8_0 (3,89 GB). Es una opcion practica para desarrolladores que quieren probar la familia Granite en local sin infraestructura dedicada. La informacion disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks) es muy limitada en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: familia IBM Granite 4.1; detalles no especificados) |
| Parametros totales | 3.659.737.600 (~3,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con calibracion iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos no detallados) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `ibm-granite/granite-4.1-3b-llmon-preview` en la documentacion proporcionada. Por la denominacion y el numero de parametros (3,66B) se trata de un transformer de la familia Granite 4.1 de IBM, pero no se especifican en la informacion disponible detalles como el tipo de atencion, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento. Tampoco se confirma si hubo fases de RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica destacable de esta publicacion concreta es la cuantizacion con iMatrix (importance matrix). El proceso pasa 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) por el modelo en precision completa para estimar la importancia de cada peso, y luego distribuye el presupuesto de bits de forma no uniforme, dando mas precision a los pesos criticos. El autor afirma que esto produce mejor coherencia y seguimiento de instrucciones a igual tamano de fichero en los niveles Q2/Q3/Q4. Tambien existe una version sin iMatrix en el repositorio `liodon-ai/granite-4.1-3b-llmon-preview-GGUF`.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation; tag `conversational`).
- Instrucciones y seguimiento de prompts (el autor menciona "instruction-following" como beneficio de la cuantizacion iMatrix).
- Inferencia local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con Q4_K_M (2,24 GB) el modelo cabe en practicamente cualquier GPU de consumo o incluso en CPU, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en entornos con hardware limitado: la variante IQ2_M (1,35 GB) permite ejecutar el modelo en dispositivos con ~2 GB de memoria, util para demos en portatiles antiguos o sistemas embebidos con llama.cpp.
- Evaluacion comparativa de la familia Granite: sirve para medir el comportamiento de un modelo IBM de ~3,7B en tareas concretas antes de decidir si escalar a versiones mayores o a la API oficial.
- Integracion en LM Studio / Jan para uso de escritorio: el flujo de busqueda por nombre de repositorio y seleccion de quant facilita que usuarios no tecnicos prueben el modelo sin configurar toolchains.
- Generacion de texto offline y privacidad de datos: al ejecutarse integramente en local, es adecuado para procesar texto sensible sin enviarlo a servicios externos.
- Base para experimentos de cuantizacion: el repositorio incluye siete niveles de quant con la misma calibracion iMatrix, lo que permite estudiar la degradacion de calidad entre 2 y 8 bits sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento indirecto es el tamano de fichero y la VRAM estimada por quant (ver tabla de especificaciones y requisitos de hardware).

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun el autor):
  - IQ2_M: 1,35 GB de fichero, ~2 GB de VRAM.
  - IQ3_M: 1,73 GB de fichero, ~2 GB de VRAM.
  - IQ4_XS: 2,03 GB de fichero, ~2 GB de VRAM.
  - Q4_K_M: 2,24 GB de fichero, ~3 GB de VRAM (recomendado por el autor).
  - Q5_K_M: 2,61 GB de fichero, ~3 GB de VRAM.
  - Q6_K: 3,01 GB de fichero, ~3 GB de VRAM.
  - Q8_0: 3,89 GB de fichero, ~4 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos. Por el perfil de memoria, cualquier GPU con 4 GB o mas (por ejemplo, RTX 3050, RTX 4060, GTX 1660) es suficiente para las cuantizaciones de 4 bits en adelante; las de 2-3 bits caben en GPUs con 2 GB o incluso en CPU.
- Cabe en GPU de consumo: si, en todas las variantes indicadas, dado que el mayor fichero (Q8_0) ocupa 3,89 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), LM Studio y Jan. No se mencionan vLLM ni TGI (habitualmente orientados a safetensors, no a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas. Se compara con otros modelos pequenos de ~3-4B habitualmente distribuidos en GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.1-3b-llmon-preview (esta ficha, GGUF iMatrix) | ~3,66B | no disponible | other | GGUF (2-8 bits) | Cuantizacion de terceros (Liodon AI); 7 niveles de quant |
| Modelo base ibm-granite/granite-4.1-3b-llmon-preview | ~3,66B | no disponible | other | safetensors (presumible) | Original de IBM; pesos completos |
| Alternativas de ~3-4B en GGUF (p. ej. familias Llama, Qwen, Phi) | ~3-4B | variable segun modelo | variable | GGUF | No se dispone de datos concretos en la informacion proporcionada para establecer comparacion cuantitativa |

No es posible ofrecer una comparacion de rendimiento (benchmarks) con alternativas porque no hay metricas publicadas en la informacion disponible.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus terminos en la model card; es imprescindible consultar la licencia del modelo base de IBM antes de cualquier uso comercial.
- La cuantizacion introduce perdida de calidad respecto a los pesos originales; las variantes IQ2_M e IQ3_M, aunque calibradas con iMatrix, son las mas propensas a degradacion en tareas complejas.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no confirmados; no se debe asumir un rendimiento multilingue solido sin verificar.
- Longitud de contexto no disponible; planificar el uso con contextos cortos hasta confirmar el limite real del modelo base.
- Al ser una cuantizacion de terceros (no oficial de IBM), la responsabilidad sobre la fidelidad de la conversion recae en el publicador; conviene validar contra el modelo original si la precision es critica.
- El repositorio tiene muy pocas descargas (230) y cero likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizacion iMatrix): https://huggingface.co/liodon-ai/granite-4.1-3b-llmon-preview-imatrix-GGUF
- Repositorio de cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/granite-4.1-3b-llmon-preview-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Perfil del autor (Liodon AI): https://huggingface.co/liodon-ai
- Dataset de calibracion WikiText-103: https://huggingface.co/datasets/wikitext
