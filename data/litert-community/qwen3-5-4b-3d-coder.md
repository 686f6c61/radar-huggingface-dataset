# litert-community/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino de Qwen/Qwen3.5-4B desarrollado por CCORE, orientado a la generacion de codigo y, en particular, a escenas 3D interactivas en Three.js. El modelo recibe una descripcion de escena y produce un unico archivo HTML autocontenido. La version aqui documentada es una conversion del modelo original al formato LiteRT-LM (`.litertlm`), realizada por el colectivo litert-community, pensada para inferencia en dispositivo (on-device) y en el borde (edge).

El modelo base conserva la arquitectura de Qwen3.5-4B: 32 capas de decodificador que alternan tres capas de atencion lineal Gated DeltaNet con una capa de atencion completa, tamano oculto de 2560, 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones en las capas de atencion completa, y un vocabulario ligado de 248.320 entradas. El ajuste fino se realizo sobre el conjunto ccore/ThreeJS-3D-Scenes, con 3.933 escenas de entrenamiento y 213 de validacion.

La relevancia de esta ficha radica en que la conversion a LiteRT-LM permite ejecutar un modelo de 4B en hardware de consumo (Mac con CPU o GPU) sin necesidad de infraestructura de servidor, con velocidades de decodificacion que van de 10,9 a 48,2 tok/s segun la ruta de ejecucion. No es un lanzamiento oficial de Qwen y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida: 3 capas Gated DeltaNet (atencion lineal) por cada capa de atencion completa, 32 capas de decodificador |
| Parametros totales | 4B (heredados de Qwen3.5-4B; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (archivo `ekv16384`) o 32.768 tokens (archivo `ekv32768`) |
| Tipos de cuantizacion | int4 blockwise-32 (min-max) en capas lineales; int8 per-channel en embedding y capa de salida (ligados); 48 proyecciones `in_proj_a`/`in_proj_b` de Gated DeltaNet en float32; activaciones GPU en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original en safetensors |
| Tamano del repo | 16,4 GB |
| Tamano de archivos | 2.711 MB (16K) y 2.768 MB (32K) |
| Libreria | litert-lm |
| Pipeline | text-generation |
| Vision | no incluida (solo decodificador de texto; la torre de vision no se convirtio) |
| Thinking mode | no soportado (`supports_thinking: false`) |
| Tool calling | soportado (`supports_function_calling: true`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer con atencion hibrida que intercala tres capas de Gated DeltaNet (atencion lineal) por cada capa de atencion completa. El tamano oculto es 2560, con 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones en las capas de atencion completa, y un vocabulario ligado de 248.320 entradas. Esta combinacion busca reducir el coste computacional del contexto largo manteniendo la capacidad de atencion completa en capas clave.

El ajuste fino, segun el informe tecnico del autor, consistio en un entrenamiento completo de los parametros del lenguaje con el codificador de vision congelado, seguido de una etapa corta de LoRA. El conjunto de datos ccore/ThreeJS-3D-Scenes contiene 3.933 escenas de entrenamiento, cada una con un prompt, una traza de pensamiento completa y la respuesta HTML completa, mas 213 escenas de validacion excluidas de la actualizacion de pesos. La conversion a LiteRT-LM se realizo con litert-torch (commit 115a1360) y el parche Qwen3.5 de hf-to-litertlm, para LiteRT-LM 0.19.0.

## Capacidades

- Generacion de codigo especializada en escenas 3D interactivas con Three.js: a partir de una descripcion, produce un unico archivo HTML autocontenido.
- Generacion de texto general y respuestas a preguntas cortas (el archivo de 16K respondio 7 de 8 preguntas cortas en CPU).
- Tool calling / function calling: los metadatos LLM declaran `supports_function_calling: true` y LiteRT-LM 0.19.0 devuelve las llamadas como tool calls (3 de 3 prompts de herramienta por archivo).
- Sin modo de razonamiento: la plantilla escribe siempre el bloque de pensamiento vacio (`<think>\n\n</think>\n\n`) y `enable_thinking` no tiene efecto.
- Sin capacidades de vision en esta conversion (solo texto entra, texto sale).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de escenas 3D en el navegador: el modelo escribe un HTML autocontenido con Three.js a partir de una descripcion textual, adecuado para prototipado rapido de visualizaciones 3D sin backend.
- Herramientas de autoria 3D en dispositivo: integrado en una aplicacion de escritorio o movil via LiteRT-LM, permite generar escenas sin conexion a un servidor, con latencia de decodificacion de 14,8 tok/s en CPU de Mac Studio.
- Asistente de codigo para Three.js en IDE: con tool calling habilitado, puede integrarse en un pipeline que reciba la descripcion de la escena y devuelva el archivo HTML como artefacto.
- Educacion y demostraciones interactivas: generacion de escenas 3D didacticas (sistemas solares, modelos moleculares, visualizaciones de datos) en entornos con hardware de consumo.
- Prototipado de experiencias WebGL: su ventana de contexto de 16K o 32K cubre prompts y respuestas completas (172 de 213 escenas de validacion caben en 16K; las 213 en 32K, la mas larga con 26.147 tokens).
- Automatizacion de generacion de contenido 3D en pipelines CI/CD: el modelo puede producir HTML de escenas como artefacto verificable, con la salvedad de usar la ruta de ejecucion correcta (CPU en el paquete `litert-lm`, o GPU solo via CLI C++ con `--sampler_handles_input=false`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento medidos por el autor son los siguientes:

| Metrica | Archivo 16K | Archivo 32K |
|---|---|---|
| Decodificacion en CPU de Mac Studio (M4 Max), litert-lm 0.19.0 | 14,8 tok/s | 10,9 tok/s |
| Decodificacion en GPU de Mac (CLI C++ con `--sampler_handles_input=false`) | 48,2 tok/s | no disponible |
| Escenas de validacion que pasan la comprobacion (CPU) | 1 de 1 ejecutada (ejemplo de uso) | 3 de 6 |
| Escenas que pasan con CLI C++ en GPU | 4 de 7 | 4 de 7 |
| Escenas de validacion que caben en el contexto | 172 de 213 | 213 de 213 (la mas larga: 26.147 tokens) |
| Tool calls devueltos correctamente | 3 de 3 | 3 de 3 |

Nota: en la ruta GPU por defecto del paquete `litert-lm` de PyPI, el modelo rompe el codigo largo: 6 de 10 respuestas del archivo 32K y 3 de 3 del archivo 16K tuvieron errores de sintaxis en el script. La misma escena paso con el CLI C++ y el flag indicado.

## Requisitos de hardware

- VRAM/RAM estimada: los archivos pesan 2.711 MB (16K) y 2.768 MB (32K), por lo que la inferencia requiere al menos unos 3 GB de memoria disponible, mas el espacio de activaciones y cache KV.
- GPU recomendadas: no se especifican modelos de GPU de servidor (A100, H100) en la informacion; las mediciones se hicieron en Apple M4 Max (CPU y GPU).
- Cabe en hardware de consumo: si, en un Mac Studio con M4 Max; no se documenta su comportamiento en GPUs consumer tipo RTX 4090.
- Opciones de despliegue: paquete `litert-lm` 0.19.0 (Python API), CLI C++ `litert_lm_advanced_main` (compilado desde el codigo fuente de LiteRT-LM; no incluido en las descargas de release), paquete Swift (misma ruta GPU por defecto, no probado con estos archivos).
- Latencia y throughput: 14,8 tok/s (16K, CPU), 10,9 tok/s (32K, CPU), 48,2 tok/s (16K, GPU via CLI C++). El archivo 16K decodifica aproximadamente 1,35 veces mas rapido que el 32K, tanto en CPU como en GPU de Mac.
- Advertencia de ejecucion: en Mac, usar la GPU solo a traves del CLI C++ con `--sampler_handles_input=false`; con el paquete de PyPI en GPU, el codigo largo se rompe.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (LiteRT-LM) | 4B | 16K / 32K | Apache-2.0 | `.litertlm` | Conversion on-device; sin vision; sin thinking |
| ccore/Qwen3.5-4B-3D-Coder (original) | 4B | no disponible | Apache-2.0 | safetensors | Modelo base con vision y thinking; referencia fp16 |
| Qwen/Qwen3.5-4B | 4B | no disponible | Apache-2.0 | safetensors | Modelo base generalista de Qwen |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen; es un ajuste fino de CCORE convertido por litert-community.
- Sin modo de razonamiento: `enable_thinking` no tiene efecto y la plantilla escribe siempre el bloque de pensamiento vacio.
- Sin vision: la torre de vision no se convirtio; solo acepta texto y produce texto.
- Riesgo de codigo invalido en la ruta GPU por defecto del paquete `litert-lm`: se observaron errores de sintaxis en 6 de 10 y 3 de 3 respuestas en los archivos 32K y 16K respectivamente.
- El archivo de 16K trunca respuestas que alcanzan el final de la cache KV sin error ni cierre `</html>`; 41 de las 213 escenas de validacion superan los 16.384 tokens y requieren el archivo de 32K.
- Idiomas soportados no documentados; el ajuste fino esta orientado a prompts en el dominio de escenas Three.js.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; el modelo genera HTML completo y puede producir APIs de Three.js inexistentes o sintaxis incorrecta.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener sus propias condiciones; verificar antes de produccion.
- Requiere LiteRT-LM 0.19.0 o superior para el tool calling; versiones anteriores devuelven las llamadas como texto.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Configuracion de metadatos Qwen3.5 en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext
