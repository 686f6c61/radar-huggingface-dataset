# ggml-org-dev/tiny-clef-for-testing

## Resumen

`tiny-clef-for-testing` es una copia deliberadamente reducida y "dañada" de Cloudflare/clef, publicada por la organizacion ggml-org-dev. No es un modelo destinado a inferencia real: su propia model card advierte que su salida es incoherente (gibberish) y que solo debe emplearse para probar software. Conserva la arquitectura, el tokenizador, la plantilla de chat y la disposicion de la cabeza de decision conjunta del modelo original, de modo que ejercita exactamente las mismas rutas de codigo que clef dentro de llama.cpp.

El modelo original clef combina un tronco tipo Qwen3.5 con atencion lineal y atencion completa, una cabeza conjunta con capas de routing y capas joint, preguntas empaquetadas y entrada de imagen. Esta version reducida replica ese diseno con un tamano minimo para poder integrarse en pipelines de integracion continua (CI) sin consumir recursos significativos.

Con 17.534.388 parametros reales en safetensors y un repositorio de 0,1 GB, resulta util como fixture de pruebas para validar la implementacion del tipo de decision `clef` en llama.cpp, incluida la ruta multimodal, sin necesidad de descargar el modelo completo. Su licencia es Apache 2.0 y deriva de Cloudflare/clef.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tipo Qwen3.5 con atencion lineal y atencion completa, mas cabeza de decision conjunta (routing + joint layers) y codificador de vision |
| Parametros totales | 17.534.388 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe version GGUF (ggml-org-dev/tiny-clef-for-testing-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repo separado |

## Arquitectura y entrenamiento

La arquitectura replica la de Cloudflare/clef tras un proceso de slicing documentado en `slice_clef.py`, que sigue la skill `slice-model` de llama.cpp. El modelo de texto conserva 4 de las 64 capas originales (capas 0-3: tres de atencion lineal y una de atencion completa), con tamano oculto reducido de 5120 a 32, FFN de 17408 a 128, 24 cabezas a 2, cabezas KV de 4 a 1, cabezas de clave de atencion lineal de 16 a 2 y cabezas de valor de 48 a 6, manteniendo las dimensiones de cabeza.

El codificador de vision conserva 2 de los 27 bloques (0 y 1), con tamano oculto de 1152 a 144, 16 cabezas a 2, FFN de 4304 a 288 y salida de 5120 a 32. La cabeza conjunta (`joint_head.safetensors`, `joint_head_config.json`) mantiene las 2 capas de routing y las 4 capas joint, con ancho reducido de 1024 a 32, 16 cabezas a 2, FFN de 4096 a 64 y entrada oculta de 5120 a 32. No se incluye el codigo Python del repositorio original (`joint_schema_model.py`).

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO. Al ser una copia recortada de pesos, no se ha realizado un entrenamiento nuevo; los pesos provienen del modelo base Cloudflare/clef mediante slicing.

## Capacidades

- No ofrece generacion de texto util: la model card indica explicitamente que su salida es incoherente.
- Conserva el tokenizador y la plantilla de chat del modelo original, por lo que permite validar el formateo de prompts.
- Mantiene la cabeza de decision conjunta con capas de routing y joint layers, util para probar esa ruta de codigo.
- Soporta entrada de imagen a traves del codificador de vision reducido (2 bloques).
- Ejercita el tipo de decision `clef` en llama.cpp, incluidas las rutas de atencion lineal y atencion completa.
- Soporta el formato de preguntas empaquetadas (packed questions) del modelo original.
- No se documentan capacidades de tool calling, agentes ni multilingues mas alla de lo que hereda estructuralmente del modelo base.

## Casos de uso

- Pruebas de integracion continua en llama.cpp: sirve como fixture ligero para verificar que la carga del tipo `clef` y la ejecucion de sus rutas de codigo no rompen en cada cambio, sin descargar el modelo completo.
- Validacion de la ruta multimodal: al conservar un codificador de vision reducido y la entrada de imagen, permite comprobar el pipeline de preprocesado y fusion de imagenes en tests automatizados.
- Verificacion del tokenizador y plantilla de chat: util para testear que el formateo de prompts y el empaquetado de preguntas producen la estructura esperada.
- Pruebas de la cabeza de decision conjunta: permite validar la logica de routing y joint layers en un entorno controlado y de bajo coste.
- Desarrollo de herramientas de conversion a GGUF: sirve para comprobar el slicing y la exportacion de pesos sin manejar el modelo original de gran tamano.
- Tests de regresion de memoria y latencia: con 0,1 GB de repositorio, permite ejecutar suites de pruebas en maquinas modestas o en runners de CI sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo recortado y con salidas incoherentes por diseno, no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (17,5 M de parametros); aun menor en cuantizaciones GGUF.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con suficiente memoria para el runtime (incluidas GTX/RTX de gama baja e iGPU).
- Opciones de despliegue: llama.cpp (ruta principal, dado que el modelo esta disenado para probar el tipo `clef`); la version GGUF esta disponible en ggml-org-dev/tiny-clef-for-testing-GGUF. No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; por el tamano, se espera muy baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-clef-for-testing | 17,5 M | no disponible | Fixture de pruebas para llama.cpp | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Cloudflare/clef | no disponible | no disponible | Modelo original multimodal con cabeza de decision conjunta | no disponible | Hugging Face |
| Otros modelos de prueba de ggml-org-dev | no disponible | no disponible | Fixtures de CI para llama.cpp | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La salida del modelo es incoherente por diseno; no debe usarse para inferencia real ni en produccion.
- Es una copia modificada y "dañada" de Cloudflare/clef; los pesos no representan el comportamiento del modelo original.
- No se incluye el codigo Python del repositorio original (`joint_schema_model.py`), lo que limita la reproducibilidad fuera de llama.cpp.
- No hay informacion sobre sesgos, riesgos de alucinacion ni limitaciones de idioma mas alla de la advertencia general de salida incoherente.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su unica utilidad practica es el testing de software.
- No se documentan longitudes de contexto ni tipos de cuantizacion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-clef-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-clef-for-testing-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Script de slicing: `slice_clef.py` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (Apache 2.0, incluida en el repositorio)
