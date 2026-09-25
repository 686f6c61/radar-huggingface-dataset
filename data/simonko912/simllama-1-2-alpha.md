# simonko912/simllama-1.2-alpha

## Resumen

SimLlama 1.2 Alpha es un modelo de lenguaje de pequeno tamano (~468 millones de parametros) desarrollado por simonko912, un autor independiente que trabaja con hardware de gama baja. Se trata de un modelo basado en la arquitectura Llama, afinado mediante LoRA sobre una GPU Intel Arc A770 de 16 GB, y publicado en HuggingFace con licencia Apache 2.0 segun la propia model card. Su proposito declarado es cubrir tareas cortas de preguntas y respuestas, explicaciones simples, codigo ligero y conversacion de caracter general.

El modelo parte de un preentrenamiento continuado sobre datos web educativos de alta calidad (FineWeb-Edu) y despues se ajusta por instrucciones con una mezcla curada de SmolTalk, alpaca-cleaned y Databricks-Dolly-15k, complementada con un pequeno conjunto de personalidad escrito a mano. La arquitectura consta de 24 capas, hidden size de 1024, 16 cabezas de atencion y una ventana de contexto de 4096 tokens.

Su relevancia actual radica en ser un ejemplo de entrenamiento completamente reproducible con herramientas abiertas y hardware accesible (una unica GPU de consumo), lo que lo convierte en un caso util para quien quiera estudiar el flujo completo de ajuste de un LLM pequeno. No obstante, conviene ser consciente de que, por tamano, queda lejos de los modelos de referencia en razonamiento largo o tareas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, 24 capas, hidden size 1024, 16 cabezas, atencion multi-head) |
| Parametros totales | 468.239.360 (~0,47B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponibles en el repositorio; al ser arquitectura Llama es compatible con cuantizacion GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible; los datasets de entrenamiento (FineWeb-Edu, SmolTalk, alpaca-cleaned, Databricks-Dolly-15k) son predominantemente en ingles |
| Licencia | Apache 2.0 (segun la model card del autor; los metadatos de HuggingFace no la declaran) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de tipo Llama, con 24 capas, un tamano oculto de 1024 y 16 cabezas de atencion en configuracion multi-head (no se menciona GQA/MQA). La atencion se configura en modo eager, un detalle relevante para la reproducibilidad exacta de los resultados, ya que otros backends de atencion pueden introducir diferencias numericas. La ventana de contexto es de 4096 tokens, coherente con el tamano reducido del modelo.

El entrenamiento se realizo en precision FP32 con LoRA (r=32, alpha=64) sobre una unica Intel Arc A770 de 16 GB. El proceso tuvo dos fases: un preentrenamiento continuado sobre FineWeb-Edu para reforzar conocimiento de tipo educativo, seguido de un ajuste por instrucciones sobre una mezcla de SmolTalk, alpaca-cleaned, Databricks-Dolly-15k y un pequeno conjunto de personalidad escrito a mano. No se detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni el uso de tecnicas como RLHF o DPO; tampoco se mencionan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM, etc.).

## Capacidades

- Generacion de texto conversacional de proposito general, orientada a turnos cortos.
- Preguntas y respuestas simples y explicaciones breves.
- Codigo ligero: fragmentos y ejemplos sencillos, no proyectos extensos.
- Razonamiento de corto alcance; el propio autor advierte que en tareas largas o complejas puede entrar en bucles o desviarse.
- Estilo de personalidad afinado (conjunto de personalidad escrito a mano), con tono de modelo pequeno y abierto.
- Formato de instrucciones tipo "### Instruction: / ### Response:" (prompt template explicito en la model card).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multimodal (vision, audio) ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue no confirmada; los datos de entrenamiento son mayoritariamente en ingles.

## Casos de uso

- Asistente educativo ligero: puede resolver preguntas cortas y explicar conceptos basicos, aprovechando el preentrenamiento continuado sobre FineWeb-Edu, un corpus de orientacion educativa.
- Chat de caracter o personalidad: el ajuste incluye un conjunto de personalidad escrito a mano, lo que permite desplegarlo como bot conversacional con un tono definido para demos o prototipos.
- Generacion de fragmentos de codigo simples: util para autocompletar lineas, ejemplos de sintaxis o funciones cortas, aunque no para refactorizaciones amplias.
- Entorno de aprendizaje de ajuste fino: sirve como caso de estudio reproducible de un pipeline completo (preentrenamiento continuado + LoRA) ejecutado en una sola GPU de consumo Intel Arc A770.
- Despliegue local en hardware modesto: su tamano permite ejecutarlo en CPU o en GPUs integradas, lo que lo hace apto para demos offline sin conexion a internet.
- Prototipado rapido de interfaces conversacionales: al caber en memoria reducida, se puede integrar en entornos de desarrollo para validar flujos de UI antes de escalar a modelos mayores.
- Filtrado o clasificacion textual sencilla: tareas de etiquetado corto o resumen de frases, con verificacion humana dado el riesgo de deriva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (468M parametros): ~1,9 GB en FP32, ~0,94 GB en FP16/BF16, ~0,5 GB en 8 bits y ~0,25 GB en 4 bits, mas el consumo adicional de la cache KV para 4096 tokens.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente; el autor lo entreno en una Intel Arc A770 de 16 GB, pero esa capacidad es muy superior a la necesaria para inferencia.
- Cabe en GPU de consumo: si, practicamente en cualquier modelo moderno (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas o en CPU con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial de la model card), llama.cpp, Ollama (el autor ya publica variantes como simllama-1), asi como vLLM o TGI si se convierte a un formato compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SimLlama 1.2 Alpha | ~0,47B | 4096 | Apache 2.0 (segun model card) | HuggingFace, Ollama (variantes) |
| Qwen2.5-0.5B | ~0,49B | 32K | Apache 2.0 | HuggingFace, ampliamente soportado |
| SmolLM2-360M | ~0,36B | 8K | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | ~1,24B | 128K | Llama 3.2 Community License | HuggingFace |
| TinyLlama-1.1B | ~1,1B | 2K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos (benchmarks) para SimLlama 1.2 Alpha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En estos terminos, el modelo queda por debajo de Qwen2.5-0.5B y SmolLM2-360M en longitud de contexto y de los modelos de ~1B en capacidad general, aunque comparte con ellos una licencia permisiva (Apache 2.0) que facilita el uso comercial.

## Limitaciones y advertencias

- Comportamiento propio de un modelo pequeno: en tareas largas o complejas puede entrar en bucles o desviarse, tal como advierte el propio autor.
- Riesgo de alucinacion elevado; se recomienda verificar cualquier respuesta importante antes de usarla en produccion.
- Sin memoria entre conversaciones y sin acceso a internet: el conocimiento queda congelado en el momento del entrenamiento.
- Contexto limitado a 4096 tokens, muy inferior al de alternativas contemporaneas del mismo rango de tamano.
- Idiomas no confirmados; los datos de entrenamiento son mayoritariamente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 se declara unicamente en la model card; los metadatos de HuggingFace no la especifican, por lo que conviene confirmarla antes de un uso comercial.
- Sesgos conocidos: no documentados por el autor.
- Estado "alpha": la propia nomenclatura sugiere que se trata de una version preliminar sujeta a cambios, con 0 descargas y 0 likes en el momento de la consulta.
- Se desconoce el numero exacto de tokens de entrenamiento y la composicion del dataset, lo que dificulta evaluar su robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simonko912/simllama-1.2-alpha
- Perfil del autor en HuggingFace: https://huggingface.co/simonko912
- Modelo relacionado (simllama-1-instruct): https://huggingface.co/simonko912/simllama-1-instruct
- Perfil del autor en Ollama: https://ollama.com/simonko912
- Modelo en Ollama (simllama-1): https://ollama.com/simonko912/simllama-1:latest
- Grafo de arquitectura (simllama-1-instruct): https://hfviewer.com/simonko912/simllama-1-instruct
