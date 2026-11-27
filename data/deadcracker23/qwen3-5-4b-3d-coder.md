# Deadcracker23/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un fine-tune independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario Deadcracker23 bajo el sello CCORE. El modelo parte de la base Qwen3.5-4B y se especializa en generacion de codigo general y, de forma particular, en la creacion de escenas 3D interactivas con Three.js. Se trata de una vista previa temprana (early preview) de un entrenamiento aun en curso, publicada para compartir el progreso con la comunidad.

El modelo resuelve un nicho concreto: generar codigo HTML/JavaScript que produce escenas 3D funcionales en el navegador, ademas de mantener capacidades generales de programacion. Con 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones), se posiciona en el rango de modelos pequenos que pueden ejecutarse en hardware de consumo. El repositorio incluye pesos FP16 en safetensors, cuantizaciones GGUF (Q4_K_M y Q8_0) y un proyector de vision opcional que habilita entrada de imagenes.

Es relevante ahora porque explora la viabilidad de modelos pequenos para tareas de codigo especializado y generacion 3D, un area tradicionalmente dominada por modelos mucho mayores. La publicacion incluye el dataset de entrenamiento completo (CCORE Three.js 3D Scenes), un informe tecnico y soporte multimodal opcional, lo que facilita la reproducibilidad y la evaluacion por parte de investigadores y desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de llama.cpp; contexto nativo del modelo base no confirmado) |
| Tipos de cuantizacion | FP16 (safetensors), Q4_K_M (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards FP16), GGUF (Q4_K_M, Q8_0), proyector mmproj BF16 GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parametros. El fine-tune se realizo sobre el dataset CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion). Cada ejemplo incluye prompts, trazas de razonamiento completas (thinking traces), respuestas HTML/JavaScript completas y niveles de complejidad, con imagenes de referencia renderizadas disponibles en la configuracion opcional `previews`. El dataset se publica bajo licencia MIT.

El entrenamiento se orienta a la generacion de escenas 3D con Three.js mediante un system prompt especifico. El autor menciona que el checkpoint del 27 de octubre mejoro sustancialmente el exito en un solo intento (one-shot success) y la calidad general de las escenas. No se detalla en la informacion disponible si se emplearon tecnicas de RLHF o DPO, ni el numero total de tokens de entrenamiento. El modelo soporta opcionalmente entrada de vision cuando se carga junto con el proyector BF16 del modelo base Qwen3.5-4B (aproximadamente 644 MiB), lo que permite generar escenas a partir de imagenes de referencia.

## Capacidades

- Generacion de codigo general, con enfasis en HTML y JavaScript.
- Generacion de escenas 3D interactivas con Three.js a partir de descripciones textuales.
- Generacion de escenas 3D guiada por imagen (solo en GGUF Q4_K_M y Q8_0 con el proyector de vision opcional).
- Razonamiento multi-paso con trazas de pensamiento (thinking traces presentes en el dataset de entrenamiento).
- Capacidades conversacionales multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas 3D para prototipado web: el modelo produce codigo Three.js completo y funcional que puede integrarse directamente en una pagina HTML, acelerando la creacion de maquetas 3D interactivas sin escribir el codigo manualmente.

- Generacion de escenas a partir de imagenes de referencia: con el proyector de vision opcional cargado en llama.cpp, se puede adjuntar una imagen y pedir al modelo que reconstruya la escena en Three.js (por ejemplo, con voxels), util para flujos de diseno asistido.

- Asistencia a desarrolladores de frontend: el modelo puede generar y corregir codigo JavaScript/HTML en un contexto de 64K tokens, adecuado para trabajar con archivos de proyecto de tamano medio.

- Educacion y aprendizaje de Three.js: el modelo puede explicar y generar ejemplos de escenas 3D, sirviendo como herramienta de apoyo para quienes aprenden graficos web.

- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF Q4_K_M y Q8_0, puede ejecutarse en equipos con GPU de gama media o incluso en CPU, lo que lo hace apto para entornos sin acceso a la nube.

- Experimentacion e investigacion en modelos pequenos: al publicarse el dataset, el informe tecnico y los pesos, sirve como base para estudiar la viabilidad de modelos de 4B en tareas de codigo especializado.

- Integracion en pipelines de generacion de contenido 3D: puede incorporarse a herramientas que generen vistas previas 3D automaticas a partir de descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mejoras cualitativas en el exito en un solo intento y en la calidad de las escenas tras el checkpoint del 27 de octubre, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 (4,5B parametros) requieren aproximadamente 9 GB; la cuantizacion Q8_0 en torno a 5 GB; la Q4_K_M en torno a 3 GB (estimaciones segun el tamano de parametros, no confirmadas en la informacion).
- El proyector de vision opcional anade aproximadamente 644 MiB adicionales.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabe en GPUs de consumo como RTX 3060/4060 (12 GB / 8 GB) en cuantizaciones GGUF; las versiones FP16 requieren GPUs de 12 GB o mas.
- Cabe en GPU de consumo: si, en formato GGUF Q4_K_M o Q8_0.
- Opciones de despliegue: llama.cpp (probado con la build b11889, con `--flash-attn on` y `--ctx-size 65536`), Transformers 5.20.2 (verificado para carga y generacion de texto con FP16). Otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que las pruebas con vision a 64K de contexto fueron breves y no pruebas de estres de contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | 65.536 (configurado) | Codigo + Three.js 3D | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Otros fine-tunes de codigo de ~4B | no disponible | no disponible | Codigo general | variable | no disponible |

La comparacion con alternativas de la misma categoria no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es una vista previa temprana de un entrenamiento aun en curso; el autor advierte que algunas escenas pueden requerir otro intento o una correccion.
- No es una version oficial de Qwen; es un fine-tune independiente de CCORE.
- El soporte de vision solo esta disponible en las versiones GGUF Q4_K_M y Q8_0 con el proyector opcional; en otros frontends depende de su implementacion multimodal.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado, lo que reduce el espacio efectivo para texto.
- No se dispone de datos sobre sesgos conocidos, riesgo de alucinacion ni idiomas soportados.
- Las pruebas de vision a 64K de contexto fueron breves, no pruebas de estres; el rendimiento en contexto completo no esta verificado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune conviene revisar las condiciones del modelo base y del dataset (MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deadcracker23/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de vision BF16 (GGUF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Repositorio de archivos FP16 y GGUF: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/main
- GGUF del modelo base (origen del proyector): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion de la comunidad con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
