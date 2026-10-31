# mradermacher/ToolSpace-35B-A3B-GGUF

## Resumen

ToolSpace-35B-A3B es un modelo de lenguaje orientado al uso de herramientas (tool use), function calling y agentes de largo horizonte (long-horizon), entrenado con aprendizaje por refuerzo por dongguanting. Este repositorio, mantenido por mradermacher, no es el modelo original sino una colección de cuantizaciones estáticas en formato GGUF del modelo base, pensadas para su ejecución local con llama.cpp y derivados. La nomenclatura "35B-A3B" indica una arquitectura de mezcla de expertos (MoE) con unos 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permite inferencia rápida con calidad de modelo grande.

Su relevancia radica en la creciente demanda de modelos abiertos especializados en orquestación de herramientas y flujos agénticos multi-paso, un nicho donde dominan los modelos propietarios. Al distribuirse bajo licencia Apache 2.0 y en formato GGUF con cuantizaciones desde Q2_K (13 GB) hasta Q8_0 (37 GB), resulta accesible tanto para estaciones de trabajo con GPU de consumo como para servidores. El modelo es conversacional y, según los archivos incluidos, incorpora un suplemento multimodal (mmproj), aunque la documentación del modelo original es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer decoder (inferido de la nomenclatura 35B-A3B) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (indicado por el sufijo A3B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, dongguanting/ToolSpace-35B-A3B, es un modelo MoE de aproximadamente 34,7 mil millones de parametros totales con cerca de 3 mil millones activos por token, una configuracion tipica de la familia Qwen3 (como Qwen3-30B-A3B), aunque el modelo base exacto del que deriva no esta especificado en la documentacion disponible. La etiqueta "reinforcement-learning" y los tags "agent", "tool-use", "function-calling" y "long-horizon" indican que el modelo fue entrenado o afinado con aprendizaje por refuerzo para mejorar su capacidad de planificacion y ejecucion de herramientas en tareas agenticas de multiples pasos.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la documentacion disponible. La cuantizacion en GGUF ha sido realizada por mradermacher como cuants estaticos, con versiones weighted/imatrix disponibles en un repositorio aparte. La presencia de archivos mmproj (suplemento multimodal) sugiere soporte de vision mediante el proyector multimodal de llama.cpp, aunque esta capacidad no esta documentada explicitamente.

## Capacidades

- Generacion de texto conversacional (tag "conversational" en la model card)
- Tool calling / function calling: capacidad central del modelo, indicada por los tags "tool-use" y "function-calling"
- Razonamiento agéntico de largo horizonte (long-horizon): planificacion y ejecucion de tareas multi-paso con herramientas
- Entrenamiento con aprendizaje por refuerzo orientado a tareas agenticas
- Posible soporte multimodal (vision) mediante los archivos mmproj incluidos en el repo GGUF, aunque no documentado
- Soporte de agentes: los tags sugieren diseno para frameworks agenticos, aunque no hay documentacion de integraciones concretas
- Idioma principal: ingles; no hay informacion sobre rendimiento en otros idiomas

## Casos de uso

- Orquestacion de agentes con herramientas: el modelo puede integrarse en frameworks como LangChain, LlamaIndex o agentes personalizados para decidir que herramienta invocar, con que parametros y encadenar multiples llamadas en tareas complejas.
- Automatizacion de flujos de trabajo multi-paso: gracias a su entrenamiento en long-horizon tasks, es adecuado para pipelines que requieren planificar, ejecutar y verificar acciones sucesivas (por ejemplo, investigacion web seguida de sintesis de resultados).
- Function calling en aplicaciones de negocio: puede traducir peticiones en lenguaje natural a llamadas estructuradas a APIs internas (consultas SQL, reservas, gestion de tickets).
- Asistentes locales con ejecucion de codigo o herramientas: con cuantizaciones Q4_K_M (~21 GB) cabe en GPUs de consumo de gama alta, permitiendo agentes privados sin envio de datos a terceros.
- Prototipado rapido de agentes: la licencia Apache 2.0 y el formato GGUF facilitan la experimentacion sin restricciones comerciales ni dependencia de APIs de pago.
- Procesamiento con contexto de herramientas extenso: los modelos MoE con pocos parametros activos ofrecen alta velocidad de decodificacion, util cuando el prompt incluye esquemas de multiples herramientas y resultados intermedios largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto):
  - Q2_K: ~13 GB
  - Q4_K_M: ~21 GB
  - Q6_K: ~29 GB
  - Q8_0: ~37 GB
- GPUs recomendadas:
  - Q4_K_M / IQ4_XS: RTX 3090 o RTX 4090 (24 GB) con cuantizacion Q4 o inferior
  - Q6_K / Q8_0: RTX 4090 con offload parcial a CPU, o A100 40 GB / RTX A6000 / 2x RTX 3090
  - Despliegue en servidor: A100 80 GB o H100 para calidad maxima y contextos largos
- Consumer GPU: si cabe; una RTX 4090 de 24 GB ejecuta Q4_K_S/Q4_K_M completos en GPU; una RTX 3060 de 12 GB requeriria Q2_K con offload a CPU (rendimiento notablemente degradado)
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; al ser GGUF no es apto directamente para vLLM o TGI (que requieren safetensors, disponibles en el modelo base)
- Latencia y throughput: no disponibles; al ser un MoE con ~3B de parametros activos, la velocidad de generacion deberia ser comparable a la de un modelo denso de ~3B, muy superior a la de un denso de 35B

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| ToolSpace-35B-A3B | ~34,7B | ~3B | Apache 2.0 | safetensors / GGUF | Tool use y agentes long-horizon |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | Apache 2.0 | safetensors / GGUF | Generalista, tool calling, thinking mode |
| Qwen3-32B (denso) | ~32,8B | ~32,8B | Apache 2.0 | safetensors / GGUF | Generalista, razonamiento |
| Llama 3.3 70B | ~70B | ~70B | Llama Community License | safetensors / GGUF | Generalista, tool calling |

ToolSpace-35B-A3B comparte perfil de tamaño y coste de inferencia con Qwen3-30B-A3B, pero se diferencia por su especializacion en tareas agenticas mediante refuerzo. Frente a modelos densos como Qwen3-32B ofrece inferencia mucho mas rapida con calidad potencialmente similar en tool use, y frente a Llama 3.3 70B es mas ligero, mas rapido y con licencia menos restrictiva.

## Limitaciones y advertencias

- Documentacion escasa: la model card del modelo original no detalla benchmarks, longitud de contexto ni datos de entrenamiento, lo que dificulta evaluar su calidad de forma rigurosa antes de produccion.
- Idioma: la model card indica unicamente ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Alucinaciones: como todo LLM, puede generar respuestas incorrectas; en flujos agenticos con ejecucion de herramientas real es recomendable validar los argumentos de las llamadas antes de ejecutarlas.
- Cuantizacion: las cuants Q2_K y Q3_K presentan perdida de calidad notable, especialmente problematica en function calling, donde la precision del JSON generado es critica; se recomienda Q4_K_M o superior.
- Multimodalidad: los archivos mmproj sugieren vision, pero esta capacidad no esta documentada; verificar antes de depender de ella.
- Licencia: Apache 2.0 no impone restricciones comerciales relevantes, aunque los terminos del modelo base deben revisarse (la model card indica Apache 2.0 tambien para el modelo base).
- Longitud de contexto: no disponible; confirmar en la config del modelo base antes de disenar flujos agenticos con prompts extensos.

## Enlaces

- Cuantizacion GGUF (este repo): https://huggingface.co/mradermacher/ToolSpace-35B-A3B-GGUF
- Modelo base: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/ToolSpace-35B-A3B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ToolSpace-35B-A3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
