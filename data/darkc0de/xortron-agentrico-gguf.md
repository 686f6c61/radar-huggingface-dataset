# darkc0de/XORTRON-AgentRICO-GGUF

## Resumen

XORTRON-AgentRICO-GGUF es una cuantización en formato GGUF del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario darkc0de (Sonny DeSorbo) dentro del proyecto denominado "The XORTRON Criminal Computing project". Se trata de un transformer denso de 27.320.697.856 parámetros (27,3 B) al que se le han aplicado técnicas de "abliteration" y modificación de alineamiento (etiquetas `uncensored`, `heretic`, `abliterated`), de modo que elimina total o parcialmente las capas de rechazo de contenido presentes en el modelo original. El autor lo presenta explícitamente como un sistema de investigación experimental orientado al estudio de usos maliciosos de la IA y a la evaluación de riesgos.

El modelo se distribuye únicamente en pesos GGUF, con un repositorio de 190,8 GB que agrupa presumiblemente varias cuantizaciones, y está etiquetado como vision-language-model, además de incluir las etiquetas `text-generation-inference`, `endpoints_compatible` y `conversational`. Según la ficha de terceros de Featherless, el contexto declarado es de 32 000 tokens, si bien el autor no publica esa cifra en la model card. El idioma declarado es únicamente el inglés.

Su relevancia actual es doble: por un lado, sirve como objeto de estudio para equipos de seguridad, alineamiento y red teaming que necesitan medir la capacidad operativa de modelos sin salvaguardas; por otro, ilustra un patrón problemático de publicación en HuggingFace, con licencia sin declarar, acuerdo de acceso restringido redactado por el propio autor y ausencia total de benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de la familia Qwen3 según el nombre del modelo base (orcarouter/Qwen3.8-27B-Uncensored); etiquetado como vision-language-model. Detalle oficial no disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 32 000 tokens segun la ficha de Featherless; no confirmado por el autor |
| Tipos de cuantizacion | GGUF, varios niveles (el repositorio ocupa 190,8 GB en total); niveles concretos no detallados |
| Idiomas soportados | Ingles (`en`) exclusivamente, segun la model card |
| Licencia | No disponible. El autor impone un acuerdo propio de acceso restringido y uso autorizado |
| Formato de pesos | GGUF (esta publicacion); el modelo base se distribuye en safetensors |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Dataset de ajuste declarado | darkc0de/The-Mind-of-XORTRON |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion tecnica de la arquitectura por parte del autor. Por el nombre del modelo base (Qwen3.8-27B-Uncensored) y el recuento de parametros (27,3 B), cabe inferir una arquitectura transformer densa de la familia Qwen3, sin mezcla de expertos, con atención completa y un vocabulario multilingüe heredado del modelo original. La etiqueta `vision-language-model` sugiere la existencia de un codificador visual o de un adaptador multimodal, pero no se documenta ni su presencia ni su naturaleza en el repositorio GGUF, y no hay confirmacion de que se incluya un fichero `mmproj` necesario para la inferencia de imagen en llama.cpp.

Respecto al entrenamiento, la unica informacion disponible es el dataset declarado (darkc0de/The-Mind-of-XORTRON) y las etiquetas `heretic`, `abliterated` y `uncensored`, que apuntan a un proceso de modificación de direcciones de activación o de ajuste fino dirigido a eliminar los comportamientos de rechazo del modelo alineado original. No se especifica el número de tokens de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada de la base Qwen3 de 27 B.
- Razonamiento y conocimiento general propios de un modelo de ~27 B, sin datos de evaluación publicados que lo cuantifiquen.
- Generacion de codigo y matematicas: capacidad esperable por tamano y familia, no verificada con benchmarks en la informacion disponible.
- Eliminacion (total o parcial) de las capas de rechazo: el modelo esta disenado para no negarse a peticiones que el modelo base rechazaria.
- Posible soporte de vision por la etiqueta `vision-language-model`; sin confirmacion documental ni instrucciones de uso.
- Soporte declarado de `text-generation-inference` y de endpoints compatibles con la API de OpenAI (etiqueta `endpoints_compatible`).
- Uso como agente: el ecosistema del autor incluye un plugin de herramientas para LM Studio ("Agent Xortron") que aporta operaciones de ficheros, ejecucion de Python y JavaScript, shell, automatizacion de navegador, RAG, Git y memoria persistente; se trata de un componente separado del modelo.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el vocabulario del modelo base es mas amplio.
- No se documentan modos de razonamiento explicito (thinking mode), soporte de audio ni function calling nativo verificado.

## Casos de uso

- Red teaming y evaluacion de robustez de salvaguardas: usar el modelo como adversario controlado para medir la eficacia de clasificadores de contenido, filtros de salida y sistemas de moderacion antes de desplegarlos en produccion.
- Investigacion en alineamiento y seguridad de IA: estudiar que capacidades emergen al eliminar el alineamiento de un modelo de 27 B y como varia la tasa de cumplimiento de peticiones daninas respecto al modelo base.
- Modelado de amenazas y analisis forense: generar muestras representativas de contenido malicioso en un entorno aislado para entrenar detectores, firmas y heuristicas de defensa.
- Desarrollo de datasets de moderacion: producir pares (peticion danina, respuesta) etiquetados para ajustar clasificadores de toxicidad, siempre dentro de un protocolo de investigacion aprobado.
- Analisis de documentos largos en ingles: con 32 000 tokens de contexto, procesar informes, expedientes o transcripciones extensas en tareas de resumen y extraccion, aunque la ausencia de benchmarks hace recomendable validar la calidad frente a alternativas.
- Simulacion de escenarios de ingenieria social para formacion: generar ejemplos realistas de intentos de fraude o phishing que alimenten programas de concienciacion y simulacros internos de seguridad.
- Evaluacion comparativa de "jailbreaks": reproducir ataques de prompt injection y medir la respuesta del modelo frente a versiones alineadas, con el objetivo de disenar contramedidas.
- Prototipado de asistentes conversacionales con herramientas: combinado con el plugin Agent Xortron en LM Studio, sirve para experimentar con flujos agenticos locales (lectura de ficheros, ejecucion de scripts) en un equipo de investigacion aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV; calculada a partir de 27,3 B de parametros):
  - BF16/FP16: ~54,6 GB.
  - Q8_0: ~29 GB.
  - Q6_K: ~22,4 GB.
  - Q5_K_M: ~19,5 GB.
  - Q4_K_M: ~16,5 GB.
  - Q3_K_M: ~13,3 GB.
  - Q2_K: ~8,9 GB.
- La ficha de LLM Explorer para un modelo derivado de la misma familia cifra el requisito en 54,7 GB, coherente con el calculo en FP16.
- GPU profesionales recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para FP16; A100 40 GB o RTX 6000 Ada para Q8.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantizaciones Q5_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo entran Q3_K_M o Q2_K, con perdida de calidad notable; en 12 GB no es viable sin offloading a CPU.
- Despliegue: llama.cpp, Ollama y LM Studio son las rutas naturales para GGUF. vLLM y TGI admiten GGUF de forma limitada y suelen requerir los pesos en safetensors para un rendimiento optimo. Existe despliegue gestionado con API compatible con OpenAI en Featherless (contexto anunciado de 32K, tarifa plana desde 25 USD/mes) y un mirror del repositorio a cargo de mradermacher.
- Latencia y throughput: no disponibles. Un modelo denso de 27 B en Q4_K_M sobre una RTX 4090 se situa habitualmente en el orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.
- Nota sobre vision: si el repositorio no incluye un fichero `mmproj` compatible, la inferencia multimodal no funcionara en llama.cpp aunque la etiqueta lo declare.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XORTRON-AgentRICO (este modelo) | 27,3 B | 32K (segun terceros) | No disponible; acuerdo propio restrictivo | GGUF en HF, API en Featherless | Sin benchmarks, sin salvaguardas, solo ingles declarado |
| orcarouter/Qwen3.8-27B-Uncensored (modelo base) | ~27 B | No disponible | No disponible | Peso original en safetensors | Mismo origen; esta publicacion solo aporta la cuantizacion GGUF |
| Qwen3-32B (modelo de referencia de la familia) | 32,8 B | 32K nativo, ampliable con YaRN | Apache 2.0 | Safetensors, GGUF, multiples proveedores | Alineado, con benchmarks publicados y soporte multilingue amplio |
| Gemma 3 27B | 27 B | 128K | Gemma Terms of Use | Safetensors, GGUF | Multimodal (vision) nativa documentada, con benchmarks publicados |
| Mistral Small 3.1 24B | 24 B | 128K | Apache 2.0 | Safetensors, GGUF | Menor tamano, contexto mucho mayor y licencia permisiva |

Los datos de las alternativas provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen como marco de referencia. Para este modelo no hay resultados de benchmarks que permitan una comparacion de rendimiento real.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: las etiquetas `uncensored`, `abliterated`, `heretic` y `toxic` indican que se han suprimido los mecanismos de rechazo. Puede producir contenido danino, ilegal, ofensivo o peligroso sin advertencia.
- Riesgo de alucinacion elevado: la modificacion del alineamiento suele degradar la calibracion y la coherencia; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: no se documenta la composicion del dataset darkc0de/The-Mind-of-XORTRON ni los filtros aplicados, por lo que no puede evaluarse el sesgo introducido.
- Licencia no disponible: la ausencia de licencia explicita impide determinar los derechos de uso comercial, redistribucion o modificacion. El acuerdo del autor es un texto propio, no una licencia reconocida por la OSI, y su exigibilidad juridica es dudosa.
- Restriccion de acceso declarada: el autor limita el uso a profesionales de ambititos legal, academico, gubernamental, policial o de seguridad, y prohibe el uso para actividad delictiva. Esta restriccion no esta implementada tecnicamente: los pesos son descargables sin control.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Contexto: los 32K tokens provienen de una ficha de terceros, no del autor; conviene validar el comportamiento mas alla de longitudes medias.
- Capacidad multimodal no confirmada: la etiqueta `vision-language-model` no se acompana de instrucciones, fichero `mmproj` ni ejemplos.
- Estado experimental y sin adopcion: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad que reporte errores.
- Riesgo legal y reputacional en produccion: desplegar un modelo sin salvaguardas puede incumplir la Ley de Servicios Digitales de la UE, la Ley de IA y obligaciones sectoriales; no es apto para aplicaciones orientadas al publico.
- Recomendacion de uso: exclusivamente en entornos aislados, con registro de interacciones, revision humana y aprobacion institucional previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkc0de/XORTRON-AgentRICO-GGUF
- Mirror de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/XORTRON-AgentRICO-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Dataset declarado: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Perfil del autor: https://huggingface.co/darkc0de/models
- Despliegue gestionado en Featherless: https://featherless.ai/models/darkc0de/XORTRON-AgentRICO
- Ficha en LLM Explorer: https://llm-explorer.com/model/jaforkhan5791%2FAgent.Xortron,3vzqjqoGroTsxsqzVYhx5X
- Plugin de agente para LM Studio: https://lmstudio.ai/darkc0de/agent-xortron
- Sitio del proyecto: https://xortron.ai
- Sitio del autor: https://xortron.tech/
- Lectura de referencia citada por el autor (Trend Micro, "Malicious Uses and Abuses of Artificial Intelligence"): https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- Lectura de referencia citada por el autor (TRM Labs, "The Rise of AI-Enabled Crime"): https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- Lectura de referencia citada por el autor (KELA, "AI Cybercrime Report Q4 2026"): https://www.kelacyber.com/resources/research/ai-cybercrime-report-q4-2026/
- Lectura de referencia citada por el autor (CrowdStrike, "2026 Global Threat Report"): https://go.crowdstrike.com/2026-global-threat-report.html
