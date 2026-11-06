# Chungulus/Qwen3.5-4B-3D-Coder-Q4_K_M-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-Q4_K_M-GGUF es una cuantizacion comunitaria en formato GGUF del checkpoint FP16 `ccore/Qwen3.5-4B-3D-Coder`, un fine-tune especializado en generacion de codigo Three.js (escenas 3D en JavaScript) sobre la base Qwen3.5-4B. La publica el usuario Chungulus bajo licencia Apache 2.0 y esta pensada para su uso con llama.cpp en entornos locales, incluyendo el proyector de vision en BF16 sin cuantizar.

El modelo conserva la naturaleza multimodal del checkpoint original (pipeline `image-text-to-text`), de modo que puede procesar imagenes ademas de texto. La cuantizacion Q4_K_M reduce el peso a aproximadamente 3,4 GB en el repositorio, lo que permite ejecutarlo en GPUs de consumo con VRAM moderada, a costa de cierta perdida de precision respecto al FP16 original.

Su relevancia actual radica en que ofrece una via practica de ejecutar un modelo de codigo especializado en Three.js con soporte de vision en hardware asequible, mediante llama.cpp. No es una publicacion oficial de Qwen ni de CCORE, sino una conversion independiente verificada por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con proyector de vision BF16; cuantizacion GGUF Q4_K_M |
| Parametros totales | 4.205.751.296 (version texto GGUF); 4.539.265.536 en el checkpoint FP16 original con vision |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj` BF16 separado para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 4.539.265.536 parametros en su version FP16, incluyendo el modulo de vision. La cuantizacion Q4_K_M se realizo de forma independiente a partir de la exportacion de precision completa, y el proyector de vision se mantiene en BF16 sin modificar. No se empleo dataset de calibracion, matriz de importancia ni recuantizacion, segun la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el fine-tune original de CCORE. La model card indica que la prediccion multi-token (MTP) no se exporta en esta cuantizacion, por lo que debe desactivarse la decodificacion especulativa en los frontends que intenten habilitarla. Se recomienda una build reciente de llama.cpp compatible con Qwen3.5 (probada con el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`).

## Capacidades

- Generacion de codigo especializado en Three.js: creacion de escenas 3D, cubos rotatorios, geometrias y animaciones en JavaScript.
- Comprension de imagenes mediante el proyector de vision incluido (pipeline `image-text-to-text`).
- Generacion de texto conversacional en formato chat (`-cnv` en llama.cpp).
- Salida estructurada en JSON, verificada en las pruebas del autor.
- Razonamiento aritmetico basico, segun las comprobaciones nativas realizadas.
- Soporte de plantilla Jinja (`--jinja`) para formateo de conversaciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de escenas Three.js para prototipado web: el modelo produce codigo JavaScript de escenas 3D (por ejemplo, un cubo rojo rotatorio) que puede integrarse directamente en proyectos web, aprovechando su fine-tune especifico en esta libreria.
- Asistencia en entornos de desarrollo local sin conexion: al ejecutarse con llama.cpp en una GPU de consumo, permite generar codigo 3D sin depender de APIs en la nube.
- Analisis de capturas o mockups de escenas 3D: gracias al proyector de vision, puede describir una imagen de entrada y ayudar a traducirla a codigo Three.js.
- Generacion de salidas JSON estructuradas: util para pipelines que necesitan respuestas parseables (configuraciones de escena, parametros de camara, materiales).
- Educacion y aprendizaje de Three.js: el modelo puede explicar y ejemplificar construcciones basicas de escenas 3D en un entorno controlado y local.
- Pruebas de integracion en CI/CD de generacion de codigo: su tamano reducido (3,4 GB) permite incluirlo en flujos automatizados de generacion y validacion sintactica de JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se evaluo la precision en benchmarks, el comportamiento en contexto completo, el renderizado en navegador ni el video. Las unicas comprobaciones realizadas por el autor cubren aritmetica, salida JSON y comprension de imagenes con el proyector incluido, ademas de una validacion de sintaxis JavaScript sobre una escena Three.js generada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB para los pesos Q4_K_M, mas el proyector de vision BF16 y la cache KV; en la practica, entre 5 y 8 GB segun contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; cabe en RTX 3060, RTX 4060, RTX 4070 y superiores.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-mtmd-cli`); no se mencionan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Nota: debe usarse una build reciente de llama.cpp compatible con Qwen3.5 y desactivar MTP/decodificacion especulativa.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria no oficial; no procede de Qwen ni de CCORE.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al FP16 original.
- No se ha evaluado el comportamiento en contexto completo ni la precision en benchmarks.
- El renderizado en navegador de las escenas generadas no fue verificado; solo se comprobo la sintaxis JavaScript.
- Algunas salidas en bruto usan HTML escapado; los resultados de sintaxis se reportan por separado para salidas normalizadas y sin normalizar.
- La prediccion multi-token (MTP) no esta exportada; debe desactivarse en los frontends.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.
- Idiomas soportados: no disponible; el comportamiento multilingue no esta verificado.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia incluido en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Checkpoint FP16 de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- llama.cpp (commit probado `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`): no se proporciona URL en la informacion disponible.
