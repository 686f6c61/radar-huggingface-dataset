# Jamesl0l/Qwen3.5

## Resumen

Qwen3.5-4B-3D-Coder es un fine-tune independiente del modelo Qwen/Qwen3.5-4B desarrollado por CCORE (publicado en Hugging Face bajo el identificador Jamesl0l/Qwen3.5). El objetivo del proyecto es explorar la viabilidad de los modelos de lenguaje de pequeno tamano para programacion general y, en particular, para la generacion de escenas 3D interactivas con Three.js. Se trata de una vista previa temprana ("early preview") de un modelo que el autor sigue entrenando, y no es un lanzamiento oficial de Qwen.

El modelo parte de una base de 4B parametros (4.539.265.536 parametros totales segun los pesos en safetensors) y se especializa mediante fine-tuning en la generacion de codigo HTML/JavaScript con Three.js, incluyendo trazas de razonamiento completas. Una caracteristica destacable es el soporte opcional de vision: las versiones GGUF Q4_K_M y Q8_0 pueden aceptar imagenes si se cargan junto al proyector de vision original de Qwen3.5-4B, lo que permite generar escenas Three.js a partir de una imagen de referencia.

El modelo es relevante ahora porque demuestra que un modelo de 4B parametros, cuantizado y ejecutable en hardware de consumo, puede abordar tareas de generacion de codigo 3D con resultados cualitativamente prometedores, y porque el autor ha liberado tanto los pesos completos en FP16 como el dataset de entrenamiento (CCORE Three.js 3D Scenes) y un informe tecnico, lo que facilita la reproducibilidad y la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-4B; arquitectura base no detallada en la informacion proporcionada) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa --ctx-size 65536 (64K) |
| Tipos de cuantizacion | FP16 (safetensors), Q4_K_M (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, cuatro shards), GGUF (Q4_K_M y Q8_0) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Qwen3.5-4B (tipo de transformer, mecanismos de atencion, etc.), por lo que este dato queda como no disponible. Lo que si se conoce es que Qwen3.5-4B-3D-Coder es un fine-tune completo (base_model_relation: finetune) sobre Qwen/Qwen3.5-4B, con pesos publicados en FP16 y verificado para carga y generacion de texto con Transformers 5.20.2.

El entrenamiento se realizo sobre el dataset CCORE Three.js 3D Scenes, que contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion), con prompts, trazas de pensamiento completas, respuestas completas en HTML/JavaScript y niveles de complejidad. El dataset esta publicado bajo licencia MIT e incluye una configuracion opcional de imagenes de referencia renderizadas ("previews"). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor ha publicado un informe tecnico en PDF con los detalles del experimento.

Como innovacion destacable, el modelo admite un modo opcional de vision: cargando el proyector BF16 original de Qwen3.5-4B (aproximadamente 644 MiB, sin modificar, proveniente de lmstudio-community/Qwen3.5-4B-GGUF) junto a los GGUF Q4_K_M o Q8_0 en llama.cpp, el modelo puede interpretar una imagen de referencia y generar la escena Three.js correspondiente. Los valores de generacion por defecto en FP16 son temperatura 0.6, top-k 20, top-p 0.95 y penalizacion de repeticion 1.0, con cache activada.

## Capacidades

- Generacion de codigo general: el autor reporta resultados iniciales prometedores en programacion en general, con especial enfasis en Three.js.
- Generacion de escenas 3D interactivas con Three.js: produce respuestas completas en HTML/JavaScript a partir de un prompt.
- Trazas de razonamiento ("thinking traces"): el dataset de entrenamiento incluye cadenas de pensamiento completas, lo que sugiere capacidad de razonamiento paso a paso antes de generar codigo.
- Soporte opcional de vision: con el proyector de vision de Qwen3.5-4B y las cuantizaciones GGUF Q4_K_M o Q8_0, acepta imagenes de entrada y genera escenas a partir de una referencia visual.
- Conversacional: etiquetado como "conversational" en Hugging Face.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible".
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; las trazas de pensamiento sugieren razonamiento multi-paso, pero no se documenta soporte de agentes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de escenas 3D para prototipado web: un desarrollador describe una escena ("una isla flotante con un arbol de voxels") y el modelo genera el HTML/JavaScript completo con Three.js, listo para previsualizar en el navegador. Es adecuado por su entrenamiento especifico en este dominio.
- Creacion de escenas a partir de imagenes de referencia: con el proyector de vision cargado en llama.cpp, se adjunta una imagen y se pide "create this scene using voxels 3d"; el modelo interpreta la referencia y genera la escena. Util para disenadores que quieren convertir bocetos o capturas en codigo 3D.
- Asistencia en el aprendizaje de Three.js: el modelo puede generar ejemplos completos y comentados de escenas, utiles como material didactico para quienes aprenden la libreria, gracias a las trazas de razonamiento incluidas en el entrenamiento.
- Generacion de codigo front-end en local: al ser un modelo de 4B cuantizable a Q4_K_M, puede ejecutarse en un portatil con GPU de consumo mediante llama.cpp u Ollama, lo que permite asistencia de codigo sin depender de la nube.
- Iteracion rapida en pipelines de contenido 3D: integrado en un servidor llama.cpp local (por ejemplo, con --ctx-size 65536), puede generar variaciones de escenas para catalogos, demos o pruebas de concepto de forma automatizada.
- Investigacion sobre modelos pequenos especializados: el dataset publico (MIT), el informe tecnico y los pesos FP16 permiten reproducir el fine-tune y estudiar el rendimiento de modelos de 4B en tareas de codigo 3D.
- Experimentacion con vision en modelos pequenos: sirve como banco de pruebas para evaluar la generacion guiada por imagen en un modelo de 4B con proyector multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona mejoras cualitativas en la tasa de exito "one-shot" y en la calidad general de las escenas tras la actualizacion del checkpoint del 27 de octubre, pero no se aportan cifras numericas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de Three.js.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B en FP16 requiere aproximadamente 9 GB solo para los pesos; en Q8_0, alrededor de 4,5-5 GB; en Q4_K_M, alrededor de 2,5-3 GB, a lo que hay que sumar la memoria del KV-cache y, si se usa vision, el proyector (aproximadamente 644 MiB).
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, el modelo en cuantizaciones GGUF es apto para GPU de consumo; en FP16 requiere GPU con al menos 10-12 GB de VRAM.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M y Q8_0; el ejemplo oficial de llama.cpp usa --n-gpu-layers all, lo que implica descargar todas las capas a la GPU.
- Opciones de despliegue: llama.cpp (probado con la build b11889, con --flash-attn on y soporte de vision mediante --mmproj), Transformers 5.20.2 (verificado para FP16), y presumiblemente otros frontends compatibles con GGUF; no se documentan vLLM, TGI ni Ollama de forma especifica para este fine-tune.
- Latencia y throughput: no disponibles. El autor indica que las pruebas con vision a 64K de contexto fueron cortas y no pruebas de estres de contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | no disponible (ejemplo a 64K) | Codigo general y Three.js; vision opcional | Apache 2.0 | Pesos FP16 y GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Modelo generalista de Qwen | no disponible en la informacion | Hugging Face |
| Modelos de codigo de ~4B (genericos) | ~4B | no disponible | Codigo general | variable | variable |

La informacion proporcionada no incluye datos de rendimiento comparativo con alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se dispone de cifras de benchmarks que permitan una comparacion cuantitativa con otros modelos de codigo de tamano similar.

## Limitaciones y advertencias

- Es una vista previa temprana: el autor sigue entrenando el modelo y advierte que algunas escenas pueden requerir otro intento o una correccion.
- No es un lanzamiento oficial de Qwen: es un fine-tune independiente de CCORE; cualquier problema debe atribuirse al fine-tune, no al modelo base.
- Riesgo de alucinacion: como todo modelo de generacion de codigo, puede producir APIs inexistentes de Three.js o codigo que no se ejecuta correctamente; no se documentan evaluaciones sistematicas de correccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados ni limites de contexto oficiales; el ejemplo de 64K es una configuracion de prueba, no una garantia de rendimiento a contexto completo.
- Soporte de vision condicionado: solo funciona con las cuantizaciones GGUF Q4_K_M y Q8_0 y con el proyector BF16 especifico; en otros frontends depende de su implementacion multimodal, y los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y del dataset (MIT) por separado.
- Madurez: con 0 descargas y 0 likes en el momento de la consulta, no hay validacion comunitaria amplia; el uso en produccion deberia acompanarse de pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jamesl0l/Qwen3.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pagina del autor (CCORE): https://huggingface.co/ccore
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Proyector de vision BF16 (opcional): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Origen del proyector (lmstudio-community/Qwen3.5-4B-GGUF): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
- Guia de despliegue local de Qwen3.5 con Ollama: https://aiindigo.com/tutorials/getting-started-with-qwen3-5-deploying-enterprise-grade-reasoning-locally
- Noticia sobre Qwen3.5 (CNBC): https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
