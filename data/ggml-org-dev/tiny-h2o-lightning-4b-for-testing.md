# ggml-org-dev/tiny-h2o-lightning-4b-for-testing

## Resumen

`tiny-h2o-lightning-4b-for-testing` es un modelo de pruebas publicado por la organizacion `ggml-org-dev` en Hugging Face. No es un modelo funcional: se trata de una copia deliberadamente mutilada y "danada" de `h2oai/h2o-lightning-4b`, reducida en tamano para que pueda ejecutarse en pipelines de integracion continua (CI) sin consumir recursos significativos. Su salida es, segun el propio autor, "gibberish" (texto sin sentido), y la model card advierte explicitamente de que no debe usarse para ningun otro proposito.

El modelo conserva, sin embargo, la arquitectura, el tokenizer, la plantilla de chat, el fichero `serve_config.json` (prompt, etiquetas, temperaturas) y la capa MTP del modelo original. Esto permite que llama.cpp recorra exactamente las mismas rutas de codigo que con el modelo real (tipo de decision `h2o-lightning`: lectura de etiquetas en el token posterior al prefill `Answer:`, etiquetas y temperaturas desde `serve_config.json`, entrada de imagen), pero con un coste computacional minimo.

La relevancia de este checkpoint es puramente de ingenieria: sirve para validar la implementacion de la arquitectura Qwen3.5 hibrida con atencion lineal y capa MTP en llama.cpp y en el conversor `convert_hf_to_gguf.py`, sin necesidad de descargar ni ejecutar el modelo de 4B completo. El modelo cuenta con 9.357.560 parametros reales segun los safetensors y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 (atencion lineal + atencion completa) con capa MTP y encoder de vision |
| Parametros totales | 9.357.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe version GGUF en `ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (version GGUF disponible en repo separado) |

## Arquitectura y entrenamiento

El modelo es una version recortada (sliced) del checkpoint `h2oai/h2o-lightning-4b`, que a su vez deriva de `Qwen/Qwen3.5-4B`. La arquitectura conserva el esquema hibrido del original: 4 de las 32 capas (capas 0-3, con 3 de atencion lineal y 1 de atencion completa), con tamano oculto reducido de 2560 a 32, FFN de 9216 a 64, 16 cabezas reducidas a 2, 4 cabezas KV reducidas a 1 (manteniendo `head_dim` de 256), cabezas de clave de atencion lineal de 16 a 2 y cabezas de valor de 32 a 4 (manteniendo dimensiones de 128). La capa MTP se estrecha de la misma forma.

El encoder de vision se reduce a 2 de los 24 bloques, con tamano oculto de 1024 a 128, 16 cabezas a 2 (manteniendo `head_dim` de 64), FFN de 4096 a 256 y salida de 2560 a 32. Se conserva el fichero `h2o_lightning_shim.py` sin cambios unicamente porque `convert_hf_to_gguf.py` detecta el checkpoint a traves de el. No se incluyen el resto de codigo Python, tests, `label_rows.lightning`, la copia del tokenizer, `vllm_patches/`, `engine/` ni los assets del repositorio original.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO. El modelo no ha sido entrenado: es un recorte de pesos del modelo base.

## Capacidades

- Generacion de texto: tecnicamente el modelo puede ejecutar un forward pass, pero su salida es texto sin sentido por diseno (pesos recortados sin reentrenamiento).
- Entrada de imagen: conserva el encoder de vision truncado, por lo que acepta entradas multimodales en las mismas rutas de codigo que el modelo original.
- Decision tipo `h2o-lightning`: mantiene la logica de lectura de etiquetas en el token posterior al prefill `Answer:` y el uso de temperaturas desde `serve_config.json`.
- Capa MTP (multi-token prediction): presente y estrechada, para validar la ruta de decodificacion especulativa en llama.cpp.
- Tool calling / function calling: no disponible como capacidad funcional (el modelo no produce salidas utiles).
- Soporte de agentes y multi-step reasoning: no aplicable.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo thinking, vision y audio no confirmados; solo se documenta la entrada de imagen.

## Casos de uso

- Pruebas de integracion continua en llama.cpp: el modelo permite ejecutar la ruta de codigo `h2o-lightning` (lectura de etiquetas, temperaturas y entrada de imagen) en cada commit sin descargar el modelo de 4B, reduciendo el tiempo y el coste de los tests.
- Validacion del conversor `convert_hf_to_gguf.py`: al conservar `h2o_lightning_shim.py`, permite comprobar que la deteccion del checkpoint y la conversion a GGUF siguen funcionando tras cambios en el conversor.
- Desarrollo de la ruta de decodificacion especulativa con MTP: la capa MTP estrechada permite probar la logica de multi-token prediction en llama.cpp con un coste minimo de computo.
- Pruebas de la logica de etiquetas y temperaturas por token: util para verificar que `serve_config.json` se parsea y aplica correctamente en el token posterior al prefill `Answer:`.
- Verificacion de la ruta multimodal: el encoder de vision truncado permite comprobar que la entrada de imagen se procesa y se propaga por las mismas rutas que en el modelo real.
- Reproduccion de bugs en entornos de CI: al ser un checkpoint pequeno y determinista en su estructura, facilita la reproduccion de fallos reportados en la implementacion de Qwen3.5 hibrido sin necesidad de GPU de gran capacidad.
- Pruebas de regresion del tokenizer y la plantilla de chat: aunque el tokenizer no se incluye en el repo, la estructura conservada permite validar la integracion con el tokenizer del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es texto sin sentido, por lo que cualquier metrica de calidad carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (9,36 M de parametros); en la practica, unos pocos cientos de MB incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para ejecutarse en CPU en entornos de CI.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1 GB de VRAM; tambien en CPU.
- Opciones de despliegue: llama.cpp (ruta principal, con la version GGUF), y potencialmente vLLM si se aplican los parches del modelo original (no incluidos en este repo).
- Latencia y throughput estimados: no disponible; por el tamano, la latencia sera del orden de milisegundos en CPU y sub-milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| tiny-h2o-lightning-4b-for-testing | 9,36 M | no disponible | Apache 2.0 | Pruebas de CI de la ruta `h2o-lightning` en llama.cpp |
| h2oai/h2o-lightning-4b | no disponible (modelo base de 4B) | no disponible | Apache 2.0 | Modelo funcional de H2O.ai sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | no disponible (4B) | no disponible | no disponible | Modelo base de Qwen sobre el que se construye h2o-lightning |
| ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF | 9,36 M (equivalente) | no disponible | Apache 2.0 | Version GGUF del mismo checkpoint de pruebas |

La comparativa relevante es con el modelo original `h2oai/h2o-lightning-4b`: misma arquitectura y mismas rutas de codigo, pero con un 0,23 % de los parametros y sin capacidad funcional. Frente a `Qwen/Qwen3.5-4B`, la diferencia es aun mayor en tamano y en proposito.

## Limitaciones y advertencias

- Salida sin sentido: el autor advierte explicitamente de que el modelo produce "gibberish" y no debe usarse para nada distinto de pruebas de software.
- Pesos recortados sin reentrenamiento: el slicing elimina la mayor parte de las capas y reduce dimensiones, por lo que no conserva ninguna capacidad aprendida util.
- No es un modelo de produccion: no debe desplegarse en aplicaciones reales, ni siquiera como placeholder, porque sus respuestas no son fiables.
- Sesgos conocidos: no disponibles; al no producir texto coherente, no se pueden evaluar sesgos de forma significativa.
- Riesgo de alucinacion: total, en el sentido de que toda la salida es inventada; no aplica la nocion habitual de alucinacion.
- Limitaciones de contexto o idioma: no disponibles; el tokenizer no se incluye en el repo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso distinto del testing; ademas, la licencia del modelo base (`h2oai/h2o-lightning-4b`, construido sobre `Qwen/Qwen3.5-4B`) debe respetarse en cualquier redistribucion.
- Caveat para produccion: el repositorio no incluye el resto del codigo Python, tests, `label_rows.lightning`, la copia del tokenizer, `vllm_patches/`, `engine/` ni los assets del original, por lo que no es un sustituto completo del modelo base para pruebas de extremo a extremo.
- Fecha de creacion futura (2026-11-19) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del checkpoint antes de usarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-h2o-lightning-4b-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de slicing: `slice_qwen35_decision.py` (incluido en el repositorio del modelo)
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
