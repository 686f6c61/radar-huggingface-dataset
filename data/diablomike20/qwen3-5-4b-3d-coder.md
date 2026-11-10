# diablomike20/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino (fine-tune) independiente del modelo base Qwen/Qwen3.5-4B, desarrollado por el colectivo CCORE (publicado en Hugging Face bajo el usuario diablomike20). El objetivo del proyecto es explorar la viabilidad de modelos de lenguaje pequenos (4B parametros) tanto para codigo de proposito general como, de forma destacada, para la generacion de escenas 3D interactivas con Three.js. Es una version de vista previa temprana ("early preview") liberada mientras el entrenamiento continua.

El modelo parte de la arquitectura transformer de Qwen3.5-4B (4.539.265.536 parametros segun los pesos en safetensors) y se distribuye bajo licencia Apache 2.0 en formato FP16 safetensors (cuatro shards) y en cuantizaciones GGUF Q4_K_M y Q8_0. El repositorio ocupa 17,0 GB. Una caracteristica diferencial es el soporte opcional de vision: las versiones GGUF pueden aceptar imagenes si se cargan junto al proyector multimodal original de Qwen3.5-4B, lo que permite generar escenas Three.js a partir de una imagen de referencia.

Su relevancia actual radica en el nicho: demuestra que un modelo de 4B puede abordar tareas de codigo especializado (generacion de escenas 3D con Three.js) con resultados cualitativos prometedores, y libera de forma abierta tanto los pesos como el dataset de entrenamiento (4.146 ejemplos de escenas) y un informe tecnico. Es un proyecto experimental, no una release oficial de Qwen, y no cuenta aun con traccion en la comunidad (0 descargas, 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K, segun el ejemplo de despliegue con llama.cpp) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 4 shards) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre Qwen/Qwen3.5-4B, por lo que conserva la arquitectura transformer del modelo base (no se detallan en la informacion disponible innovaciones como attention lineal, decodificacion especulativa o mezcla de expertos). El ajuste se realizo sobre el dataset CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos (3.933 de entrenamiento y 213 de validacion) que incluyen prompts, trazas de razonamiento completas ("thinking traces"), respuestas completas en HTML/JavaScript y niveles de complejidad; opcionalmente se publican imagenes de referencia renderizadas. El dataset se distribuye bajo licencia MIT.

La model card menciona un checkpoint actualizado el 27 de octubre de 2026, con mejoras sustanciales en el exito "one-shot" y en la calidad general de las escenas, aunque algunas escenas aun requieren un segundo intento o correccion. Se ha publicado un informe tecnico en PDF que documenta el experimento de entrenamiento, pero en la informacion proporcionada no se especifican el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los parametros de generacion por defecto en FP16 son temperatura 0,6, top-k 20, top-p 0,95 y penalizacion de repeticion 1,0, con cache habilitada.

## Capacidades

- Generacion de codigo de proposito general, con especial enfasis en JavaScript/HTML para escenas 3D con Three.js.
- Generacion de escenas 3D interactivas completas a partir de un prompt en lenguaje natural.
- Modo de razonamiento con trazas de pensamiento ("thinking traces") incluidas en el dataset de entrenamiento.
- Soporte opcional de vision en las versiones GGUF Q4_K_M y Q8_0: acepta imagenes de referencia y genera una escena Three.js a partir de ellas, cargando el proyector multimodal BF16 original de Qwen3.5-4B (aproximadamente 644 MiB).
- Generacion de codigo con niveles de complejidad variables (el dataset etiqueta los ejemplos por complejidad).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas 3D para prototipado web: el modelo produce HTML/JavaScript completo con Three.js a partir de una descripcion textual, lo que permite a disenadores y desarrolladores obtener una escena funcional como punto de partida en lugar de escribir el codigo manualmente.
- Iteracion visual guiada por imagen de referencia: con la version GGUF y el proyector multimodal, se puede adjuntar una imagen (por ejemplo, un boceto o una captura) y pedir al modelo que genere la escena equivalente, util para convertir referencias visuales en codigo ejecutable.
- Educacion y aprendizaje de Three.js: el modelo puede generar ejemplos comentados y funcionales de escenas 3D, sirviendo como material didactico para quienes aprenden graficos web.
- Automatizacion de demos y maquetas 3D: integrado en un pipeline que recibe especificaciones de producto, el modelo puede generar escenas de demostracion para presentaciones o pruebas de concepto sin intervencion manual de un desarrollador 3D.
- Generacion de codigo de proposito general en entornos con recursos limitados: al ser un modelo de 4B, puede ejecutarse en hardware de consumo y asistir en tareas de codigo cotidianas (fragmentos JavaScript, HTML, logica de escena) donde un modelo mayor no seria viable.
- Despliegue local con llama.cpp: mediante llama-server con los GGUF y contexto de 64K, se puede montar un asistente local de generacion de escenas 3D y codigo, sin dependencia de APIs externas, adecuado para entornos con requisitos de privacidad.
- Investigacion sobre modelos pequenos especializados: el dataset publico y el informe tecnico permiten reproducir y estudiar el ajuste fino de modelos de 4B para dominios visuales/3D concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta evaluaciones cualitativas (mejora del exito "one-shot" y de la calidad de escena tras el checkpoint del 27 de octubre), sin cifras de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 (4,54B parametros) requieren aproximadamente 9,1 GB solo para pesos; la version Q8_0 ronda los 4,8 GB y la Q4_K_M aproximadamente 2,7 GB (estimaciones a partir del tamano de parametros, no confirmadas en la informacion).
- El proyector de vision opcional anade aproximadamente 644 MiB cuando se carga.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria en GPU de consumo con 8-12 GB de VRAM en cuantizaciones Q4_K_M/Q8_0; para FP16 se necesitarian 12-16 GB.
- Cabe en GPU de consumo: si, en principio con cuantizaciones GGUF; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (probado con llama-server b11889, `--n-gpu-layers all --flash-attn on --ctx-size 65536 --parallel 1`), y Transformers 5.20.2 para los pesos FP16 (verificado por el autor para carga y generacion de texto). Otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que las pruebas con vision a 64K de contexto fueron cortas y no stress tests de contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | 64K (segun ejemplo de despliegue) | Codigo general + Three.js 3D, vision opcional | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Modelo generalista de Qwen | Apache 2.0 | Hugging Face |
| lmstudio-community/Qwen3.5-4B-GGUF | 4B (aproximado) | no disponible | Cuantizaciones GGUF del base, con proyector multimodal | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una vista previa temprana y un experimento independiente; no es una release oficial de Qwen y su calidad puede no ser estable.
- Algunas escenas generadas pueden requerir un segundo intento o correccion manual, segun el propio autor.
- El soporte de vision solo esta disponible en las versiones GGUF Q4_K_M y Q8_0 y depende de cargar el proyector multimodal original de Qwen3.5-4B; su funcionamiento en otros frontends depende de su implementacion multimodal.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado, lo que reduce el contexto efectivo disponible.
- Las pruebas con vision a 64K de contexto fueron cortas y no stress tests; el comportamiento en contexto completo no esta validado.
- Riesgo de alucinacion: no documentado explicitamente, pero inherente a modelos de este tamano; el autor reconoce que la generacion puede fallar en escenas complejas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card esta en ingles y no se documenta cobertura multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el proyector tienen su propia procedencia (Qwen y lmstudio-community) que conviene verificar.
- Sin traccion en la comunidad (0 descargas, 0 likes) y sin benchmarks publicados; no recomendable como dependencia critica en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/Qwen3.5-4B-3D-Coder
- Repositorio del autor (CCORE): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de vision BF16 (GGUF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Procedencia del proyector (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
