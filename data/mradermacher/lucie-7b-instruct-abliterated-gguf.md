# mradermacher/Lucie-7B-Instruct-abliterated-GGUF

## Resumen

Lucie-7B-Instruct-abliterated-GGUF es la distribucion en formato GGUF del modelo huihui-ai/Lucie-7B-Instruct-abliterated, una version "abliterated" (sin censura) del modelo Lucie-7B-Instruct. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles. El modelo base parte de la familia Lucie, un modelo instruct de aproximadamente 6.700 millones de parametros orientado a conversacion en frances e ingles.

La relevancia de esta publicacion es doble. Por un lado, ofrece el modelo en un abanico amplio de cuantizaciones (desde Q2_K de 2,7 GB hasta f16 de 13,5 GB), lo que permite ejecutarlo en hardware muy diverso, desde portatiles con GPU modesta hasta servidores. Por otro lado, la variante "abliterated" elimina los mecanismos de rechazo del modelo original, lo que resulta util para investigacion sobre alineamiento, red teaming y estudios de sesgos, pero conlleva riesgos evidentes para uso en produccion sin filtros adicionales.

La licencia declarada es Apache 2.0 y los idiomas soportados son frances e ingles. No se dispone de informacion publica sobre contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, detalle no especificado) |
| Parametros totales | 6.706.958.336 (aprox. 6,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el numero de parametros (6,7 B) y la nomenclatura "7B" se trata de un transformer denso de escala 7B, pero no se especifican detalles como el numero de capas, dimensiones ocultas, tipo de atencion (MHA, GQA, MLA) ni la funcion de activacion.

Respecto al entrenamiento, la model card del repositorio de cuantizacion no incluye informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La unica informacion tecnica relevante es que el modelo ha sido sometido a un proceso de "abliteration", una tecnica que modifica los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, dando como resultado un modelo que responde a practicamente cualquier peticion sin negativas. Las cuantizaciones son estaticas (no imatrix); el autor remite a su repositorio i1-GGUF para las versiones con imatrix.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Respuesta a instrucciones sin mecanismos de rechazo (comportamiento "uncensored" derivado del proceso de abliteration).
- Conversacion multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad con endpoints de inferencia (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo "thinking": no disponible; el modelo es exclusivamente de texto.
- Capacidades matematicas o de codigo: no documentadas en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un LLM cuando se eliminan sus mecanismos de rechazo, comparando respuestas con el modelo original y analizando que tipo de contenido se genera. Util en laboratorios de seguridad de IA y red teaming controlado.
- Red teaming y evaluacion de filtros: sirve como generador adversarial para probar clasificadores de contenido, moderadores y sistemas de deteccion de prompts maliciosos, ya que produce respuestas que un modelo alineado rechazaria.
- Estudio de sesgos y toxicidad: al no aplicar rechazos, expone de forma mas directa los sesgos latentes del modelo base, lo que facilita su medicion y documentacion en trabajos academicos.
- Despliegue local en hardware modesto: las cuantizaciones Q4_K_M (4,2 GB) y Q5_K_M (4,9 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB mediante llama.cpp u Ollama, con latencia interactiva.
- Prototipado de asistentes conversacionales en frances: para equipos que desarrollan productos en frances, el modelo ofrece conversacion nativa en ese idioma sin depender de APIs externas, con la salvedad de que habria que anadir capas de moderacion propias.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde el autor quiere evitar negativas del modelo por temas sensibles, siempre que el uso cumpla la legalidad aplicable.
- Fine-tuning posterior: al estar disponible la licencia Apache 2.0 y el formato GGUF, se puede partir del modelo para ajustes con LoRA o QLoRA en entornos de investigacion, aunque para entrenamiento conviene usar los pesos en safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,7 GB.
  - Q3_K_M: ~3,4 GB.
  - IQ4_XS: ~3,8 GB.
  - Q4_K_M: ~4,2 GB (recomendado por el autor como rapido y de buena calidad).
  - Q5_K_M: ~4,9 GB.
  - Q6_K: ~5,6 GB.
  - Q8_0: ~7,2 GB.
  - f16: ~13,5 GB.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en adelante son suficientes. Para Q8_0 o f16, se recomienda RTX 4090 (24 GB), A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: si, en practicamente todas las GPU con 8 GB o mas usando Q4_K_M o inferiores. Las cuantizaciones Q2_K y Q3_K_S pueden caber incluso en GPUs de 4-6 GB, a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo indica). vLLM y TGI no soportan GGUF de forma nativa completa, por lo que para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lucie-7B-Instruct-abliterated-GGUF (este) | ~6,7 B | no disponible | fr, en | Apache 2.0 | GGUF | Variante sin censura, cuantizaciones multiples |
| huihui-ai/Lucie-7B-Instruct-abliterated | ~6,7 B | no disponible | fr, en | Apache 2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| Lucie-7B-Instruct (original, sin abliteration) | ~6,7 B | no disponible | fr, en | no disponible en esta ficha | safetensors | Version alineada, con rechazos; referencia para comparar comportamiento |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | en, fr, de, es, it | Apache 2.0 | safetensors, GGUF | Alternativa consolidada en frances e ingles con contexto amplio documentado |

La comparativa se limita a los datos disponibles; no se dispone de resultados de benchmarks para establecer diferencias de rendimiento entre estos modelos.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos del modelo: puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin filtros. No es apto para produccion orientada al publico sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual para este modelo; como todo LLM de 7B, es propenso a inventar datos.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero el proceso de abliteration tiende a amplificar sesgos latentes al eliminar la capa de rechazo.
- Limitaciones de idioma: solo frances e ingles declarados; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede asumir una ventana larga; conviene verificar experimentalmente antes de usarlo en tareas que requieran contexto extenso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado, especialmente en jurisdicciones con normativa sobre contenido dañino.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso real.
- No hay garantia de soporte ni mantenimiento por parte del autor original del modelo base; este repositorio es una cuantizacion de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lucie-7B-Instruct-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Lucie-7B-Instruct-abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Lucie-7B-Instruct-abliterated-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Lucie-7B-Instruct-abliterated-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
