# Duss69/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente del modelo base Qwen/Qwen3.5-4B, desarrollado por el autor Duss69 bajo la organización CCORE. Se trata de un experimento temprano (early preview) que explora la viabilidad de los modelos de lenguaje de pequeno tamano (4B parametros) para la generacion de codigo general y, de forma destacada, para la creacion de escenas 3D interactivas con Three.js. No es un lanzamiento oficial de Qwen.

El modelo parte de la arquitectura Qwen3.5-4B (transformer denso de aproximadamente 4.540 millones de parametros) y se ha afinado sobre el dataset publico CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion) que incluyen prompts, trazas de razonamiento completas y respuestas HTML/JavaScript. La relevancia actual radica en su enfoque especializado: demostrar que un modelo de 4B puede generar escenas 3D de calidad razonable en un solo intento, algo tradicionalmente reservado a modelos mucho mayores.

El autor distribuye pesos FP16 en formato Safetensors (cuatro shards) y cuantizaciones GGUF Q4_K_M y Q8_0. Ademas, las versiones GGUF admiten entrada de imagen opcional mediante un proyector visual BF16 (~644 MiB) procedente del modelo base, lo que permite generar escenas Three.js a partir de una imagen de referencia. El proyecto esta liberado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configurado en los ejemplos de llama.cpp con `--ctx-size 65536`) |
| Tipos de cuantizacion | FP16 (Safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16, 4 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Qwen3.5-4B, un transformer denso de aproximadamente 4.540 millones de parametros. No se especifica en la informacion disponible si se emplearon tecnicas adicionales como RLHF o DPO; el entrenamiento se realizo sobre el dataset CCORE Three.js 3D Scenes, que contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion) con prompts, trazas de razonamiento completas, respuestas HTML/JavaScript completas y niveles de complejidad. El dataset se publica bajo licencia MIT.

La innovacion principal del proyecto es su especializacion en la generacion de escenas Three.js, incluyendo un modo de razonamiento (thinking traces) que el modelo produce antes de generar el codigo final. Ademas, las versiones GGUF incorporan soporte visual opcional mediante el proyector BF16 del modelo base Qwen3.5-4B, lo que permite condicionar la generacion a una imagen de referencia. El checkpoint actualizado del 27 de octubre mejora sustancialmente el exito en un solo intento y la calidad global de las escenas, aunque algunas pueden requerir un reintento o correccion.

## Capacidades

- Generacion de codigo general (el autor reporta resultados prometedores en pruebas iniciales).
- Generacion de escenas 3D interactivas con Three.js, incluyendo HTML/JavaScript completo.
- Modo de razonamiento con trazas de pensamiento (thinking traces) antes de la respuesta.
- Soporte de entrada de imagen opcional (solo GGUF Q4_K_M y Q8_0 con el proyector BF16), para generar escenas a partir de una referencia visual.
- Conversacional (tag `conversational`), compatible con endpoints.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas 3D para prototipado web: el modelo produce codigo Three.js completo (HTML/JavaScript) a partir de una descripcion textual, adecuado para iterar rapidamente prototipos de visualizacion 3D sin escribir el codigo manualmente.
- Generacion guiada por imagen: con la cuantizacion GGUF y el proyector visual, se puede adjuntar una imagen de referencia y pedir una escena equivalente en voxels o geometria, util para reconstruir maquetas o referencias visuales.
- Educacion y aprendizaje de Three.js: las trazas de razonamiento permiten al estudiante ver el proceso de construccion de la escena, no solo el resultado final.
- Asistencia en pipelines de contenido 3D: integrable via llama.cpp o endpoints compatibles para generar variaciones de escenas a partir de plantillas o prompts parametrizados.
- Desarrollo de demos interactivas: al generar HTML/JavaScript autocontenido, el resultado puede desplegarse directamente en navegador para demos de producto o presentaciones.
- Automatizacion de codigo con contexto largo: con 65.536 tokens de contexto configurados, puede manejar prompts extensos con multiples referencias o escenas complejas en una sola sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona mejoras cualitativas en el exito en un solo intento y en la calidad de las escenas tras el checkpoint del 27 de octubre, pero sin cifras numericas.

## Requisitos de hardware

- VRAM estimada para FP16: aproximadamente 9 GB solo para pesos, mas overhead de KV-cache y activaciones; se recomienda 16 GB o mas.
- VRAM estimada para Q8_0: aproximadamente 4,8 GB para pesos; con KV-cache en q8_0 y contexto de 64K, se recomienda 8-12 GB.
- VRAM estimada para Q4_K_M: aproximadamente 2,7 GB para pesos; con contexto moderado cabe en GPUs de 6-8 GB.
- El proyector visual opcional anade aproximadamente 644 MiB adicionales cuando se carga.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para FP16; GPUs consumer de 8 GB o mas para cuantizaciones GGUF.
- Cabe en GPU consumer: si, en cuantizaciones GGUF (Q4_K_M y Q8_0) en tarjetas de 8 GB o superiores.
- Opciones de despliegue: llama.cpp (probado con b11889, `llama-server` con `--flash-attn on` y `--n-gpu-layers all`), Transformers 5.20.2 (verificado para carga y generacion de texto en FP16), endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | 65.536 | Apache 2.0 | Codigo general + Three.js 3D |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Apache 2.0 | Proposito general |
| Modelos de codigo de ~4B (genericos) | ~4B | variable | variable | Codigo general sin especializacion 3D |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el modelo base Qwen3.5-4B es la referencia directa mas relevante.

## Limitaciones y advertencias

- Es un early preview en desarrollo activo; el autor advierte que algunas escenas pueden requerir un segundo intento o correccion.
- No es un lanzamiento oficial de Qwen; es un ajuste fino independiente de CCORE.
- El soporte de vision es opcional y solo esta disponible en las cuantizaciones GGUF Q4_K_M y Q8_0 con el proyector BF16; su funcionamiento en otros frontends depende de su implementacion multimodal.
- Los tests de vision con contexto de 64K fueron pruebas cortas, no pruebas de estres de contexto completo.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado, lo que reduce el espacio efectivo disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo de codigo, puede producir APIs o geometrias inexistentes.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card y el dataset estan en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones (dataset MIT, base Apache 2.0).
- El checkpoint del 27 de octubre requiere redescargar los GGUF si se tenia una version anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duss69/Qwen3.5-4B-3D-Coder
- Repositorio de CCORE (referencia en la model card): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector visual BF16 (GGUF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Origen del proyector (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
