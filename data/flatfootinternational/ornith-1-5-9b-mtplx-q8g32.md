# FlatFootInternational/Ornith-1.5-9B-MTPLX-Q8G32

## Resumen

Ornith-1.5-9B-MTPLX-Q8G32 es una variante cuantizada a 8 bits, publicada en formato MLX, del modelo `ornith-ai/ornith-1.5-9b`. El repositorio lo firma el usuario FlatFootInternational y ha sido generado con la herramienta MTPLX Forge, que anade cabezas de prediccion multi-token (multi-token prediction, MTP) sobre un modelo autorregresivo convencional. El objetivo declarado es acelerar la decodificacion en Apple Silicon: la model card reporta un multiplicador de 2,53x frente a la linea base autorregresiva con profundidad de borrador D3, verificado en un Apple M5.

El modelo cuenta con 9.409.812.208 parametros (9,41 mil millones) y el repositorio ocupa 11,5 GB, coherente con pesos de 8 bits mas los ficheros auxiliares del runtime. La etiqueta de arquitectura del repositorio es `qwen3_5`, lo que apunta a la familia Qwen 3.5 como base estructural, aunque no hay documentacion publicada que lo confirme ni que detalle el dataset de entrenamiento, la longitud de contexto o los idiomas soportados.

Su relevancia es acotada pero clara: no es un modelo nuevo entrenado desde cero, sino un artefacto de optimizacion para inferencia local en Mac. Resulta interesante para desarrolladores que quieran ejecutar un modelo de ~9B en un equipo Apple Silicon con un incremento medible de velocidad de generacion, siempre que acepten la ausencia de benchmarks estandar y de informacion de licencia explicita en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; la etiqueta del repositorio indica `qwen3_5` (familia Qwen 3.5). Transformer autorregresivo con cabezas de prediccion multi-token anadidas por MTPLX Forge |
| Parametros totales | 9.409.812.208 (9,41B) |
| Parametros activos | No aplica / no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Esta variante: 8 bits, nomenclatura Q8G32 (sugiere grupo de 32). Otras cuantizaciones del modelo base: no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card remite a un fichero `LICENSE` del repositorio sin especificar terminos |
| Formato de pesos | safetensors, en formato MLX (8 bits) |

Otros datos del repositorio: autor FlatFootInternational, 0 descargas y 0 likes en el momento de la consulta, creado el 19 de septiembre de 2026 y actualizado el mismo dia. Tamano del repositorio: 11,5 GB. Etiqueta de region: `us`.

## Arquitectura y entrenamiento

No hay informacion publicada sobre el proceso de entrenamiento de este artefacto: no se documentan volumen de tokens, composicion del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se especifica si el modelo base `ornith-ai/ornith-1.5-9b` es un ajuste fino de un modelo Qwen 3.5, pese a que la etiqueta `qwen3_5` del repositorio lo sugiere. Cualquier afirmacion sobre datos de entrenamiento seria especulativa.

La innovacion tecnica documentada es la prediccion multi-token anadida mediante MTPLX Forge sobre el modelo autorregresivo original. La model card declara una profundidad de borrador optima de D3 (tres tokens predichos por paso) y un multiplicador de 2,53x frente a la linea base autorregresiva, verificado en hardware Apple M5 con muestreo a temperatura 0,6, top_p 0,95 y top_k 20. El registro completo de verificacion se encuentra en el fichero `mtplx_runtime.json` del repositorio. No se documentan mecanicas adicionales como atencion lineal, decodificacion especulativa externa o arquitecturas hibridas SSM.

## Capacidades

La model card no enumera capacidades funcionales. Lo unico verificable es el perfil de despliegue y aceleracion:

- Generacion de texto con decodificacion multi-token: el modelo predice varios tokens por paso de avance, lo que reduce el numero de pasos necesarios frente a la generacion autorregresiva clasica.
- Aceleracion medida de 2,53x sobre la linea base autorregresiva en Apple M5, con profundidad D3.
- Integracion con el runtime MTPLX: el modelo se descarga y arranca con los comandos `mtplx pull` y `mtplx start chat`, y el runtime lo detecta automaticamente.
- Capacidades heredadas del modelo base (`ornith-ai/ornith-1.5-9b`): razonamiento, codigo, matematicas, multilingueismo, tool calling o modo thinking no estan documentadas en esta ficha y, por tanto, se marcan como no disponibles.
- Soporte de vision, audio o agentes: no disponible.

## Casos de uso

Los siguientes escenarios se derivan del perfil de despliegue real del modelo (9,41B parametros, 8 bits, MLX, Apple Silicon, decodificacion acelerada). No implican capacidades especificas no documentadas:

- Asistente conversacional local en Mac: el modelo puede ejecutarse integramente en un equipo Apple Silicon sin conexion a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad o sin acceso a red.
- Generacion de texto asistida por teclado o editor: gracias al multiplicador de 2,53x en la decodificacion, la latencia percibida por token es menor que con el modelo autorregresivo equivalente, lo que mejora la experiencia en autocompletado interactivo.
- Procesamiento por lotes en local: tareas de resumen, reescritura o clasificacion de documentos ejecutadas de forma desatendida en un Mac, aprovechando que no hay coste por token de API.
- Prototipado rapido de aplicaciones LLM: permite validar prompts, flujos y formatos de salida en un entorno de desarrollo antes de migrar a infraestructura de servidor o a una API en la nube.
- Evaluacion comparativa de tecnicas de decodificacion: el repositorio incluye un registro de verificacion (`mtplx_runtime.json`) que sirve como referencia reproducible para comparar prediccion multi-token frente a decodificacion autorregresiva.
- Despliegue en entornos aislados o air-gapped: al distribuirse como pesos safetensors en un repositorio de 11,5 GB, puede instalarse en maquinas sin salida a internet y operarse con el runtime MTPLX ya presente.
- Investigacion sobre prediccion multi-token: el artefacto permite estudiar como se comporta una profundidad de borrador D3 sobre un modelo de ~9B en condiciones reales de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es la verificacion de velocidad del runtime MTPLX:

| Metrica | Valor | Condiciones |
|---|---|---|
| Multiplicador frente a linea base autorregresiva | 2,53x | Apple M5, profundidad de borrador D3, temperatura 0,6, top_p 0,95, top_k 20 |
| Profundidad de borrador optima | D3 | Segun model card |
| Hardware de verificacion | Apple M5 | Segun model card |

No se dispone de datos de throughput en tokens por segundo, latencia por token ni comparaciones con otros modelos en tareas de calidad.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: aproximadamente 9,4 GB solo para los pesos en 8 bits (9,41B parametros), a los que hay que sumar la cache KV y el overhead del runtime. El repositorio completo ocupa 11,5 GB, por lo que un presupuesto realista se situa en torno a 11-13 GB de memoria unificada para contextos cortos.
- Equipos recomendados: Apple Silicon con 24 GB o 32 GB de memoria unificada (familias M Pro, Max o Ultra) para trabajar con margen. En equipos de 16 GB la ejecucion es posible en teoria, pero deja muy poco espacio para el sistema operativo y la cache de contexto.
- Compatibilidad con GPU de consumo x86 (RTX 4090, etc.): no aplica. El artefacto esta publicado en formato MLX con nomenclatura Q8G32 y verificado en Apple M5, orientado al runtime MTPLX sobre Metal.
- Aceleradores de datacenter (A100, H100): no aplica para esta variante concreta, ya que no se distribuye en safetensors estandar para vLLM o TGI.
- Opciones de despliegue: runtime MTPLX (`mtplx pull`, `mtplx start chat`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: solo disponible el multiplicador relativo de 2,53x frente a la linea base autorregresiva en Apple M5. No se publican tokens por segundo absolutos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos de referencia son de conocimiento publico general y no se han verificado en la busqueda realizada; deben contrastarse antes de usarlos en produccion.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MTPLX-Q8G32 | 9,41B | No disponible | MLX 8 bits, runtime MTPLX | No disponible | HuggingFace, autor FlatFootInternational |
| Qwen3-8B (referencia de familia) | ~8,2B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | safetensors, GGUF, MLX; vLLM, llama.cpp, TGI | Apache 2.0 | HuggingFace, ampliamente replicado |
| Llama-3.1-8B-Instruct | ~8,03B | 128.000 tokens | safetensors, GGUF; vLLM, llama.cpp, TGI | Llama 3.1 Community License | HuggingFace |
| Gemma-2-9B | ~9,24B | 8.192 tokens | safetensors, GGUF; vLLM, llama.cpp | Gemma Terms of Use | HuggingFace |

La diferencia practica mas relevante no esta en los parametros, sino en el ecosistema: las alternativas citadas disponen de soporte amplio en multiples runtimes y de documentacion completa, mientras que esta variante esta atada al runtime MTPLX y a hardware Apple Silicon, y carece de ficha de licencia y de benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, por lo que no puede compararse su rendimiento cognitivo con el de otros modelos de ~9B.
- Licencia no disponible: la model card remite a un fichero `LICENSE` sin especificar terminos. No debe asumirse uso comercial permitido sin verificar ese fichero y, en su caso, la licencia del modelo base `ornith-ai/ornith-1.5-9b`.
- Idiomas no documentados: se desconoce el soporte multilingue real del modelo base y de esta variante.
- Longitud de contexto no documentada: no puede planificarse su uso en tareas que requieran ventanas largas sin una prueba previa.
- Riesgo de alucinacion: no evaluado ni documentado por el autor. Al ser un artefacto de optimizacion derivado de un modelo base no identificado publicamente, no hay estudios de sesgos ni de tasas de error.
- Dependencia de hardware y runtime: requiere Apple Silicon y el runtime MTPLX. No hay soporte documentado para CUDA, ROCm, vLLM, llama.cpp, TGI u Ollama, lo que limita su portabilidad y su uso en servidores.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso, incidencias resueltas ni comunidad que valide el artefacto.
- Verificacion limitada a un unico equipo: el multiplicador de 2,53x se obtuvo en un Apple M5 con una configuracion de muestreo concreta (temperatura 0,6, top_p 0,95, top_k 20) y profundidad D3. Los resultados pueden variar en otros chips de la familia M y con otros parametros de decodificacion.
- Fecha de publicacion en el futuro respecto a la mayoria de referencias: el repositorio figura creado el 19 de septiembre de 2026, dato a tener en cuenta al contrastar con fuentes externas.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces obtenidos corresponden a centros de ayuda de YouTube y a la comunidad Zhihu, sin relacion con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FlatFootInternational/Ornith-1.5-9B-MTPLX-Q8G32
- Herramienta MTPLX (MTPLX Forge y runtime): https://github.com/youssofal/MTPLX
- Modelo base citado en la model card: `ornith-ai/ornith-1.5-9b` (referencia textual; no se ha verificado su URL publica)
- Fichero de verificacion del repositorio: `mtplx_runtime.json` (incluido en el repositorio de HuggingFace)
- Fichero de licencia del repositorio: `LICENSE` (incluido en el repositorio de HuggingFace; no accesible en la informacion proporcionada)
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados obtenidos no guardan relacion con el modelo)
