# AZAS123/soc-qwen3-4b-fr-GGUF

## Resumen

soc-qwen3-4b-fr-GGUF es un modelo de lenguaje conversacional derivado de Qwen3-4B-Instruct-2507, afinado (fine-tuning) y convertido a formato GGUF por el usuario AZAS123 mediante la herramienta Unsloth. El modelo parte de la arquitectura transformer densa de Qwen3 con 4.022.468.096 parametros totales, lo que lo situa en la categoria de modelos pequenos optimizados para inferencia en hardware de consumo.

El sufijo "fr" en el nombre sugiere un ajuste orientado al idioma frances, aunque la model card no documenta explicitamente el dataset de entrenamiento ni el alcance del fine-tuning. El repositorio contiene unicamente una cuantizacion Q4_K_M en formato GGUF, con un tamano total de 2,5 GB, pensada para su uso con llama.cpp y Ollama.

Su relevancia practica reside en la posibilidad de ejecutar un modelo de 4B parametros con contexto amplio (heredado de la familia Qwen3) en equipos sin GPU dedicada de gama alta, manteniendo capacidades conversacionales y de razonamiento. No obstante, la ausencia de documentacion sobre licencia, idiomas y evaluacion limita su uso en produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (el sufijo "fr" sugiere frances, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, una variante instruct de la familia Qwen3. Segun la model card, el ajuste fino y la conversion a GGUF se realizaron con Unsloth, una herramienta que optimiza el entrenamiento y la cuantizacion de modelos de lenguaje. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en esta etapa de ajuste.

La unica innovacion tecnica documentada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster") y la generacion del archivo GGUF. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia mas alla de las propias de llama.cpp. Se desconoce si el fine-tuning altero el tokenizer, la ventana de contexto o las capacidades originales de Qwen3-4B-Instruct-2507.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones de complejidad media, limitado por el tamano de 4B parametros.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp, lo que permite usar el formato de conversacion original del modelo base.
- Compatibilidad con Ollama a traves del Modelfile incluido en el repositorio.
- Posible capacidad multilingue (el sufijo "fr" apunta a un ajuste en frances), aunque no esta documentada ni verificada.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en esta variante.

## Casos de uso

- Asistente conversacional local en frances: el modelo puede desplegarse con Ollama o llama.cpp en un portatil para mantener conversaciones multi-turno sin conexion, gracias a su cuantizacion Q4_K_M de 2,5 GB.
- Prototipado rapido de chatbots: al ser un GGUF de 4B parametros, permite iterar sobre prompts y plantillas de chat con `--jinja` en entornos de desarrollo sin GPU dedicada.
- Generacion de texto en entornos con recursos limitados: adecuado para tareas de redaccion, resumen o parafraseo en maquinas con 8 GB de RAM o GPUs de gama media.
- Educacion e investigacion: util como modelo de referencia para experimentos de fine-tuning o para comparar el efecto de la cuantizacion Q4_K_M frente al modelo base en tareas concretas.
- Traduccion y asistencia linguistica francesa: si el ajuste "fr" es efectivo, podria emplearse en tareas de correccion o generacion de texto en frances, aunque requiere validacion empirica.
- Despliegue en edge computing: su tamano reducido permite integrarlo en dispositivos con poca memoria para tareas de procesamiento de lenguaje natural en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantizacion Q4_K_M (archivo de 2,5 GB mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para carga completa; tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli -hf AZAS123/soc-qwen3-4b-fr-GGUF --jinja`), Ollama mediante el Modelfile incluido, y cualquier frontend compatible con GGUF (LM Studio, Jan, etc.).
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| soc-qwen3-4b-fr-GGUF | 4.022.468.096 | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face |
| Qwen3-4B-Instruct-2507 | 4B (aproximado) | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face (oficial) |
| Llama 3.2 3B Instruct | 3B (aproximado) | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face (oficial) |
| Phi-3.5-mini-instruct | 3,8B (aproximado) | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face (oficial) |

La comparativa se limita a parametros y formato, ya que no se dispone de datos de rendimiento ni de contexto verificados para este modelo concreto.

## Limitaciones y advertencias

- La licencia no esta documentada en la informacion disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de desplegarlo en produccion.
- No se especifican los idiomas soportados ni el alcance real del ajuste en frances; el sufijo "fr" es la unica indicacion y no esta respaldado por documentacion.
- Riesgo de alucinacion inherente a los modelos de 4B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La unica cuantizacion disponible es Q4_K_M, lo que introduce perdida de precision respecto a los pesos originales en safetensors; no hay opciones de mayor calidad (Q5, Q6, Q8) ni de menor tamano (Q2, Q3).
- No se documenta la longitud de contexto soportada; si el fine-tuning no la preservo, podria ser inferior a la del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad; se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- No hay informacion sobre sesgos conocidos ni sobre el dataset de ajuste, lo que dificulta evaluar riesgos de toxicidad o sesgo idiomatico.

## Enlaces

- Hugging Face: https://huggingface.co/AZAS123/soc-qwen3-4b-fr-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
