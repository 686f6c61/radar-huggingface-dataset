# lalit63/qwen-code-dpo

## Resumen
qwen-code-dpo es un ajuste fino por DPO (Direct Preference Optimization) del modelo Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario lalit63 en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) orientado a tareas de codigo y conversacion, entrenado con la libreria TRL sobre la arquitectura Qwen2. El modelo parte de la base instruct de Qwen2.5-Coder, lo que le confiere capacidades previas de generacion de codigo y seguimiento de instrucciones, y anade una fase de alineacion por preferencias mediante DPO.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (1,5B) que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para prototipado local y despliegue en entornos con recursos limitados; por otro, ejemplifica el flujo habitual de fine-tuning con TRL sobre modelos Qwen, un patron muy extendido en la comunidad open source. Sin embargo, la informacion publicada por el autor es muy escasa: no se detalla el dataset de preferencias, no hay benchmarks, no se especifica licencia ni idiomas, y la model card contiene campos sin rellenar (el modelo base aparece como "None").

El modelo se distribuye en formato safetensors con transformers, tiene 348 descargas y ningun "like" en el momento de la consulta, y su repositorio ocupa 79,8 GB, un tamano desproporcionado para 1,5B parametros que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento adicionales. Cualquier evaluacion en produccion deberia hacerse con cautela y validacion propia, dado que no hay datos publicados de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado con DPO |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-1.5B-Instruct, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros, derivado de Qwen/Qwen2.5-Coder-1.5B-Instruct. La fase de ajuste se realizo con DPO, el metodo introducido en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., NeurIPS 2023), que optimiza directamente el modelo de politica frente a pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa separado. El entrenamiento se llevo a cabo con TRL 1.18.2, Transformers 5.24.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni si hubo fases adicionales de SFT o RLHF mas alla del DPO. Tampoco se documentan innovaciones tecnicas propias del autor (decodificacion especulativa, atencion lineal, etc.); las capacidades arquitectonicas son las heredadas del modelo base Qwen2.5-Coder. El repositorio de 79,8 GB para un modelo de 1,5B sugiere que contiene artefactos adicionales (posiblemente checkpoints intermedios, optimizador o logs), aunque esto no se confirma en la model card.

## Capacidades
- Generacion de texto conversacional y seguimiento de instrucciones, heredado del modelo base instruct.
- Generacion y asistencia en codigo, dado que el modelo base es Qwen2.5-Coder-1.5B-Instruct.
- Alineacion por preferencias mediante DPO, orientada presumiblemente a mejorar la calidad de las respuestas en tareas de codigo (el nombre del modelo lo sugiere, aunque no se documenta explicitamente).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (el modelo base Qwen2.5-Coder lo soporta, pero no se verifica en este ajuste).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la ficha.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Prototipado local de asistentes de codigo: al ser un modelo de 1,5B, puede ejecutarse en una GPU de consumo y usarse para autocompletado o explicacion de fragmentos de codigo en entornos de desarrollo personales, con la ventaja de no requerir servicios en la nube.
- Generacion de tests unitarios en pipelines de CI: el modelo puede recibir una funcion y generar casos de prueba candidatos que luego se validan automaticamente, aprovechando su base Qwen2.5-Coder y su ajuste por preferencias para reducir salidas de baja calidad.
- Chat de soporte tecnico para documentacion de APIs: con un contexto conversacional multi-turno, puede responder dudas sobre el uso de librerias a partir de fragmentos de documentacion inyectados en el prompt, aunque la longitud de contexto no esta confirmada.
- Educacion y tutoria de programacion: puede explicar errores comunes y proponer correcciones paso a paso en un entorno controlado, con supervision humana dado el riesgo de alucinacion en modelos pequenos.
- Generacion de codigo boilerplate en herramientas internas: integrado via transformers o text-generation-inference, puede producir esqueletos de funciones y configuraciones repetitivas, reduciendo el trabajo manual en equipos pequenos.
- Experimentacion academica con DPO: sirve como caso de estudio reproducible para investigadores que quieran analizar el efecto del ajuste por preferencias sobre un modelo base pequeno, comparando antes y despues del entrenamiento.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, puede usarse en estaciones de trabajo sin aceleradores de datacenter para tareas de generacion de texto de baja latencia y volumen moderado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos (1,543.714.304 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB, aunque no se han publicado cuantizaciones oficiales del autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070); para mayor throughput, A100 o H100 no son necesarias dado el tamano, pero pueden usarse en despliegues multi-instancia.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), text-generation-inference (tag endpoints_compatible), y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lalit63/qwen-code-dpo | 1,5B | no disponible | no disponible | Hugging Face, safetensors | Ajuste DPO sobre Qwen2.5-Coder-1.5B-Instruct; sin benchmarks |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face, safetensors y GGUF | Modelo base; benchmarks publicados por Qwen |
| Qwen/Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face | Version base sin instruct; referencia de comparacion |
| deepseek-ai/DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens (segun documentacion publica) | Licencia propia de DeepSeek | Hugging Face | Alternativa de tamano similar para codigo |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica habitual y no de la informacion proporcionada en esta ficha; se incluyen como referencia orientativa.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay datos publicados que permitan afirmar que el ajuste DPO mejora al modelo base; el rendimiento real es desconocido.
- Model card incompleta: el campo del modelo base aparece como "None", la licencia como "licence: license" y no se documenta el dataset de preferencias, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor o asumir la licencia del modelo base (Apache 2.0 en Qwen2.5-Coder) con cautela, ya que el ajuste podria introducir restricciones no declaradas.
- Idiomas no declarados: no se confirma el soporte multilingue; el uso en castellano no esta validado.
- Riesgo de alucinacion: inherente a modelos de 1,5B, especialmente en tareas de codigo donde puede generar APIs o funciones inexistentes.
- Sesgos: no documentados; al no publicarse la composicion del dataset de preferencias, no se puede evaluar el sesgo introducido por el DPO.
- Contexto no confirmado: aunque el modelo base soporta ventanas largas, no se verifica que el ajuste preserve esa capacidad.
- Repositorio sobredimensionado (79,8 GB para 1,5B): puede contener artefactos innecesarios; conviene revisar los archivos antes de descargar el repositorio completo.
- Sin soporte comunitario: 0 likes y 348 descargas indican poca validacion externa; no se recomienda su uso en produccion sin evaluacion propia.

## Enlaces
- Hugging Face: https://huggingface.co/lalit63/qwen-code-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Paper DPO en NeurIPS: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
