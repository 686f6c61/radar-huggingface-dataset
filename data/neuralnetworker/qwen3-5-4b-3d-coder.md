# neuralnetworker/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario neuralnetworker bajo el sello CCORE. Se trata de un experimento temprano (early preview) que explora la viabilidad de modelos de lenguaje pequenos para programacion general y, en particular, para la generacion de escenas 3D interactivas con Three.js. El modelo parte de una base de 4.539.265.536 parametros y se distribuye bajo licencia Apache 2.0.

El modelo no es un lanzamiento oficial de Qwen, sino un finetune sobre el checkpoint Qwen3.5-4B. Su interes radica en que combina codigo general con una especializacion clara en la generacion de escenas 3D, un nicho poco cubierto por modelos de este tamano. Ademas, las versiones GGUF Q4_K_M y Q8_0 pueden aceptar entradas de imagen si se cargan junto con el proyector vision original de Qwen3.5-4B, lo que permite generar escenas Three.js a partir de una imagen de referencia.

La informacion disponible no incluye datos sobre la longitud de contexto nativa del modelo base, los idiomas soportados ni resultados cuantitativos de benchmarks. El autor publica un informe tecnico en PDF, un dataset de entrenamiento publico (4.146 ejemplos de escenas, 3.933 de entrenamiento y 213 de validacion) y pesos en FP16 (Safetensors) y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `--ctx-size 65536`) |
| Tipos de cuantizacion | FP16 (Safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (4 shards FP16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune supervisado sobre Qwen/Qwen3.5-4B. No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tipo de atencion, uso de MoE, etc.) mas alla de que se trata de un transformer de 4B parametros. El ajuste se realizo sobre el dataset CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos (3.933 de entrenamiento y 213 de validacion) que incluyen prompts, trazas de razonamiento completas (thinking traces), respuestas completas en HTML/JavaScript y niveles de complejidad. El dataset se publica bajo licencia MIT.

La innovacion principal del proyecto no esta en la arquitectura sino en el dominio: la especializacion en la generacion de escenas Three.js con razonamiento explicito. El autor menciona que el checkpoint del 27 de octubre mejoro sustancialmente el exito en un solo intento (one-shot success) y la calidad general de las escenas. No se detalla si se emplearon tecnicas de RLHF o DPO; el informe tecnico en PDF es la fuente indicada para esos detalles.

## Capacidades

- Generacion de codigo general, con especial enfasis en JavaScript y HTML para escenas 3D.
- Generacion de escenas Three.js interactivas a partir de descripciones en lenguaje natural.
- Razonamiento explicito mediante trazas de pensamiento (thinking traces) incluidas en el dataset de entrenamiento.
- Soporte opcional de vision: las versiones GGUF Q4_K_M y Q8_0 aceptan imagenes si se cargan con el proyector `mmproj-Qwen3.5-4B-BF16.gguf` (aproximadamente 644 MiB).
- Generacion de escenas a partir de una imagen de referencia (por ejemplo, "create this scene using voxels 3d").
- Capacidades conversacionales multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o capacidades multilingues.

## Casos de uso

- Generacion de prototipos 3D para desarrollo web: el modelo produce HTML/JavaScript completo con Three.js, lo que permite pasar de una descripcion textual a una escena funcional en un solo paso, adecuado para prototipado rapido en estudios pequenos.
- Generacion de escenas a partir de imagenes de referencia: cargando el proyector vision con los GGUF Q4_K_M o Q8_0, se puede adjuntar una imagen y pedir una escena Three.js equivalente, util para disenadores que quieran trasladar bocetos a codigo.
- Educacion y aprendizaje de Three.js: las trazas de razonamiento incluidas permiten usar el modelo como tutor que explica paso a paso como construir una escena, no solo el resultado final.
- Automatizacion de contenido 3D para demos y presentaciones: generar visualizaciones interactivas embebidas en paginas web sin escribir el codigo manualmente.
- Iteracion asistida en entornos de desarrollo: dado su tamano de 4B, puede ejecutarse localmente con llama.cpp y servir como asistente de codigo especializado en 3D dentro del editor.
- Investigacion sobre modelos pequenos especializados: el dataset publico y el informe tecnico permiten reproducir y estudiar el efecto de un finetune de dominio sobre una base de 4B.
- Despliegue en hardware modesto: las cuantizaciones GGUF permiten servir el modelo en equipos consumer con llama-server, lo que facilita pruebas y demos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor describe mejoras cualitativas en el exito en un solo intento y en la calidad de las escenas tras el checkpoint del 27 de octubre, pero no proporciona metricas numericas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9 GB solo para los pesos (4.539 millones de parametros a 2 bytes), mas el coste del KV-cache y overhead.
- VRAM estimada en GGUF Q8_0: en torno a 5 GB para los pesos.
- VRAM estimada en GGUF Q4_K_M: en torno a 3 GB para los pesos.
- El proyector vision opcional anade aproximadamente 644 MiB cuando se carga.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M o Q8_0; para FP16 se recomienda 16 GB o mas (RTX 4090, A100, H100). No se dispone de datos especificos de rendimiento por GPU.
- Cabe en GPU consumer: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 con las cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp (probado con la build b11889 y `llama-server`), GGUF compatible con otros frontends multimodales segun su implementacion; los pesos FP16 se verificaron con Transformers 5.20.2. No se mencionan vLLM, TGI u Ollama.
- Parametros de generacion recomendados por el autor para FP16: temperatura 0.6, top-k 20, top-p 0.95, repetition penalty 1.0, con cache activada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4.539 M | no disponible | Codigo general + Three.js 3D | Apache 2.0 | Safetensors, GGUF |
| Qwen/Qwen3.5-4B (base) | 4B (aprox.) | no disponible | Codigo general | Apache 2.0 | Safetensors, GGUF |
| lmstudio-community/Qwen3.5-4B-GGUF | 4B (aprox.) | no disponible | Codigo general (cuantizado) | Apache 2.0 | GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos de 4B especializados en 3D con los que contrastar. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un early preview: el autor indica que sigue entrenando el modelo y que algunas escenas pueden requerir un segundo intento o una correccion.
- No es un lanzamiento oficial de Qwen; es un finetune independiente de CCORE.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de codigo y 3D.
- Riesgo de alucinacion en APIs de Three.js y en la logica de la escena generada; conviene validar el codigo antes de usarlo en produccion.
- El soporte de vision depende de cargar el proyector correcto y de un frontend multimodal compatible; los tokens de imagen consumen contexto compartido con el prompt y el codigo generado.
- Las pruebas de vision con contexto de 64K fueron cortas, no pruebas de estres a contexto completo, segun el autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proyector vision deben cumplir tambien sus propias condiciones (Apache 2.0 en ambos casos segun la informacion disponible).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuralnetworker/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector vision BF16 (GGUF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Origen del proyector: https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
