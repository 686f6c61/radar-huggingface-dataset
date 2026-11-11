# JoyFusionAI/dt-flux2-klein-4b

## Resumen

dt-flux2-klein-4b es un espejo en formato Draw Things (s4nnc `.ckpt`) de los pesos de FLUX.2 [klein] 4B, un modelo de difusion texto-a-imagen desarrollado por Black Forest Labs. El repositorio lo publica JoyFusionAI para su uso en inferencia on-device dentro de su producto, y los ficheros son copias byte a byte de las conversiones oficiales del proyecto Draw Things, sin modificaciones. El modelo resuelve generacion de imagenes a partir de texto, edicion de imagenes y composicion con multiples referencias, con un tamano de 4B parametros que lo situa en el rango de ejecucion local en hardware de consumo.

La relevancia de esta ficha es practica: permite ejecutar un modelo de la familia FLUX.2 en formato nativo de Draw Things con cuantizacion de 6 bits, acompanado de un text encoder Qwen3-4B en 8 bits y un VAE FLUX.2 en fp16 como componentes compartidos. Ademas, se documenta un adaptador experimental que sustituye el text encoder Qwen3-4B por un Qwen3-0.6B, reduciendo drasticamente los requisitos de memoria a costa de cierta perdida de fidelidad en detalles de identidad y un limite de 256 tokens de prompt.

La licencia Apache 2.0 del modelo base, incluidos text encoder y VAE, es un punto diferencial frente a otros modelos de generacion de imagen con licencias mas restrictivas, y facilita el uso comercial. No obstante, el repositorio no publica resultados de benchmarks ni una evaluacion cuantitativa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) FLUX.2 [klein], con text encoder Qwen3-4B y VAE FLUX.2 |
| Parametros totales | 4B (modelo base FLUX.2 [klein] 4B); fichero DiT cuantizado de 3.117.088.768 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el DiT; el adaptador ligero limita los prompts a 256 tokens |
| Tipos de cuantizacion | 6 bits para el DiT (`q6p`), 8 bits para el text encoder Qwen3-4B (`q8p`), fp16 para el VAE y para el adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (s4nnc, formato Draw Things); adaptador en `.safetensors` (fp16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de FLUX.2 [klein] de Black Forest Labs: un diffusion transformer (DiT) que genera imagenes latentes condicionadas por embeddings de texto, con un VAE FLUX.2 para la codificacion y decodificacion del espacio latente. El text encoder nativo es Qwen3-4B, cuantizado a 8 bits en la distribucion de Draw Things. Los pesos del DiT se distribuyen en cuantizacion de 6 bits, lo que explica el tamano de 3,6 GB del repositorio y su viabilidad en dispositivos con memoria limitada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; la model card no los detalla. La innovacion tecnica destacable de este repositorio no esta en el entrenamiento sino en el empaquetado: la conversion y cuantizacion las realiza el proyecto Draw Things para su runtime s4nnc, y se incluye un adaptador experimental que permite sustituir el text encoder Qwen3-4B por Qwen3-0.6B. Dicho adaptador es una copia en fp16 de `adapter_v14_bal.safetensors` de AiArtLab, con nombres de tensores y metadatos (`student_layers`, `teacher_layers`) sin cambios y un error relativo maximo de 2,4e-4 respecto al original fp32.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Edicion de imagenes, incluyendo modificaciones guiadas por prompt sobre una imagen de entrada.
- Composicion con multiples referencias, combinando varias imagenes de entrada en una sola generacion.
- Condicionamiento mediante text encoder Qwen3-4B, con alternativa experimental basada en Qwen3-0.6B mediante adaptador.
- Ejecucion on-device en el runtime Draw Things (formato s4nnc), orientada a inferencia local.
- Ajustes recomendados por el autor del modelo base: 4 pasos de muestreo, text guidance 1, DDIM Trailing y shift 3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla del propio pipeline de imagen.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: con 4 pasos de muestreo y guidance 1, el modelo permite iterar rapidamente sobre bocetos visuales en un portatil con GPU de consumo, sin depender de APIs externas.
- Edicion local de imagenes en aplicaciones de escritorio: el soporte de edicion por prompt permite integrar funciones de retoque o cambio de estilo dentro de una app que ejecute Draw Things, manteniendo los datos del usuario en el dispositivo.
- Composicion con multiples referencias para diseno grafico: util para combinar elementos de varias imagenes de referencia (personajes, productos, entornos) en una unica escena generada.
- Creacion de assets para videojuegos y prototipos: la licencia Apache 2.0 facilita generar material grafico intermedio que luego se retoca en el pipeline de arte, sin restricciones de uso comercial derivadas del modelo.
- Demos y entornos educativos de difusion: el formato `.ckpt` de Draw Things y el tamano contenido permiten montar talleres practicos de generacion de imagen en hardware modesto.
- Despliegue con text encoder reducido en dispositivos de baja memoria: usando el adaptador Qwen3-0.6B y el encoder `qwen_3_0.6b_instruct_q8p.ckpt`, se puede ejecutar el pipeline en equipos donde Qwen3-4B no cabria, aceptando prompts de hasta 256 tokens y cierta deriva en detalles de identidad.
- Experimentacion con cuantizacion en pipelines de investigacion: la disponibilidad de pesos en 6 y 8 bits, con hashes SHA-256 publicados, permite reproducir experimentos de calidad frente a coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el pipeline completo: el DiT en 6 bits ocupa aproximadamente 3,1 GB, el text encoder Qwen3-4B en 8 bits unos 4,5 GB y el VAE fp16 unos 0,17 GB; en total, alrededor de 8 GB solo en pesos, a los que se suma el estado de activaciones y buffers del runtime.
- Con el adaptador ligero (Qwen3-0.6B, unos 0,44 GB en fp16) mas el encoder `qwen_3_0.6b_instruct_q8p.ckpt`, el requisito de memoria baja de forma significativa, aunque no se publican cifras exactas de VRAM total.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el pipeline completo encaja en GPUs de consumo con 12-16 GB o mas; la variante con encoder reducido apunta a equipos con menos memoria, sin datos oficiales que lo confirmen.
- Opciones de despliegue: runtime Draw Things (formato s4nnc `.ckpt`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline de difusion.
- Latencia y throughput: no disponibles. Los ajustes recomendados de 4 pasos y DDIM Trailing sugieren un regimen de muestreo corto, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dt-flux2-klein-4b (este) | 4B (DiT) | no disponible; 256 tokens con adaptador ligero | Apache 2.0 | `.ckpt` s4nnc | Hugging Face (JoyFusionAI) |
| FLUX.2 [klein] 4B (base) | 4B | no disponible | Apache 2.0 | pesos originales de Black Forest Labs | Hugging Face (black-forest-labs) |
| Adaptador Qwen3-0.6B → klein-4B (AiArtLab) | 0,6B (encoder) | 256 tokens | Apache 2.0 | `.safetensors` fp16 | Hugging Face (AiArtLab) |

No se dispone de datos de rendimiento comparado con otros modelos de generacion de imagen en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas de calidad, sesgos o fidelidad; cualquier afirmacion de rendimiento carece de respaldo en la informacion disponible.
- El adaptador ligero Qwen3-0.6B puede provocar deriva en detalles finos de identidad respecto al text encoder nativo Qwen3-4B.
- Con el adaptador, los prompts estan limitados a 256 tokens, lo que restringe descripciones largas y composiciones complejas.
- Segun los autores del adaptador, los prompts con etiquetas estilo danbooru pueden producir resultados de aspecto fotografico en lugar del estilo esperado.
- El repositorio es un espejo no modificado de las conversiones de Draw Things; la responsabilidad de mantenimiento y correccion de errores recae en el proyecto upstream.
- El formato `.ckpt` de s4nnc esta ligado al runtime Draw Things, lo que limita la portabilidad a otros frameworks de inferencia sin conversion previa.
- No se documentan los idiomas soportados por el text encoder en esta distribucion, aunque Qwen3-4B es multilingue en su modelo original; conviene validar el comportamiento en castellano antes de produccion.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar tambien las condiciones del runtime Draw Things y del adaptador de AiArtLab, ambos con sus propios terminos.
- Riesgo de alucinacion visual y de artefactos propios de modelos de difusion en composiciones con muchas referencias o prompts ambiguos; no hay datos publicados que cuantifiquen este riesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoyFusionAI/dt-flux2-klein-4b
- Componentes compartidos: https://huggingface.co/JoyFusionAI/dt-components
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Adaptador Qwen3-0.6B → klein-4B: https://huggingface.co/AiArtLab/qwen3-0.6b-4b-adapter
