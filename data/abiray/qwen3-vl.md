# Abiray/Qwen3-VL

## Resumen

Abiray/Qwen3-VL es un repositorio de cuantizaciones GGUF derivadas de Qwen/Qwen3-VL-4B-Instruct y Qwen/Qwen3-VL-8B-Instruct, publicadas por el usuario Abiray. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los encoders de texto y visión de Qwen3-VL a formato GGUF autocontenido, pensada para usarse como codificador de condicionamiento dentro de MiniMax H3 mediante el método de proyección ClipProj. El repositorio incluye dos ficheros: uno de 4B en Q4_K_M (3,31 GB, 713 tensores) y otro de 8B en Q4_K_M (6,20 GB, 749 tensores).

La particularidad técnica frente a otras distribuciones GGUF multimodales es que el vision tower va embebido en el mismo fichero, de modo que no se necesita un sidecar `mmproj` separado. Además, los embeddings de tokens se conservan en F16 durante la cuantización para preservar la calidad del condicionamiento, y los tensores se renombran a la convención de HuggingFace (`model.layers.*`, `visual.*`, `visual.deepstack_merger_list.*`) con metadatos `general.architecture = qwen3vl`.

Es relevante ahora porque permite ejecutar los encoders de Qwen3-VL con requisitos de VRAM muy reducidos en flujos de generación de vídeo/imagen en ComfyUI, aunque con una advertencia importante: el propio autor indica explícitamente "NOT TESTED", el repositorio no tiene descargas ni valoraciones, y los ficheros no cargan con las herramientas estándar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder de texto + vision tower) de Qwen3-VL; patch embed de 16x16 con 6 canales y dimension 1024 (4B) / 1152 (8B), y deepstack mergers en posiciones 0/1/2 con `linear_fc1` / `linear_fc2` |
| Parametros totales | 4.437.029.376 (fichero de 4B, dato de safetensors); no disponible para el fichero de 8B |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M con embeddings de tokens en F16 (ficheros publicados); el autor recomienda recuantizar a Q8_0 desde `bf16` para maxima fidelidad |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (derivada de los modelos base Qwen3-VL); la licencia de MiniMax H3 puede imponer terminos adicionales |
| Formato de pesos | GGUF, fichero unico autocontenido (vision tower embebido, sin `mmproj`) |
| Modelos base | Qwen/Qwen3-VL-4B-Instruct, Qwen/Qwen3-VL-8B-Instruct |
| Fuentes safetensors | Comfy-Org/Krea-2 (4B), Comfy-Org/Qwen3-VL (8B), en `bf16` |
| Tamano del repositorio | 35,9 GB |
| Ficheros | `Qwen3-VL-4B-Q4_K_M-F16emb.gguf` (3,31 GB, 713 tensores); `Qwen3-VL-8B-Q4_K_M-F16emb.gguf` (6,20 GB, 749 tensores) |

## Arquitectura y entrenamiento

Este repositorio no incluye entrenamiento alguno: es una conversion y cuantizacion de pesos ya entrenados. La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal compuesto por un decoder de texto y un vision tower, con elementos estructurales que se deducen de los nombres de tensores documentados: un `patch embed` almacenado como tensor unico de forma `[16, 16, 6, 1024]` en el 4B y `[16, 16, 6, 1152]` en el 8B, y tres deepstack mergers en las posiciones 0, 1 y 2. Los pesos se renombran desde la convencion de llama.cpp (`blk.*`, `v.*`) a la convencion de HuggingFace para que el cargador de ComfyUI los interprete correctamente.

El proceso de conversion documentado consta de siete pasos: partida de los safetensors `bf16`, conversion de texto a GGUF con `convert_hf_to_gguf.py` de llama.cpp, conversion del `mmproj` de vision con `--mmproj`, fusion de texto y vision en un unico GGUF, cuantizacion a Q4_K_M con `--token-embedding-type f16 --output-tensor-type f16`, renombrado de tensores a la convencion HF y correccion final de nombres de los deepstack mergers, fusion de las slices de `patch_embed` y eliminacion del `lm_head` (solo en el fichero de 8B). No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF o DPO de los modelos base.

## Capacidades

- Codificacion de texto: genera embeddings de condicionamiento a partir de prompts, con embeddings de tokens preservados en F16 para no degradar la calidad del condicionamiento.
- Codificacion de vision: el vision tower va embebido en el fichero GGUF, por lo que permite condicionar por imagen sin necesidad de un `mmproj` aparte.
- Integracion con ClipProj: disenado para emparejarse con matrices de proyeccion de NicoLab28/ClipProj-MiniMax-H3 (por ejemplo `mmh3-4b-ClipProj-v3.1.safetensors` para el 4B).
- Uso como encoder en ComfyUI: se carga desde `ComfyUI/models/text_encoders/` con un cargador GGUF compatible con H3.
- Generacion de texto autorregresiva: no disponible en el fichero de 8B, ya que el `lm_head` fue eliminado durante la conversion. El fichero de 4B conserva los 713/713 tensores, pero no se documenta su uso como modelo generativo.
- Tool calling / function calling: no disponible (no se documenta en el repositorio).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Condicionamiento de texto para MiniMax H3 en ComfyUI: el fichero se coloca en `models/text_encoders/` y se empareja con una matriz ClipProj en `models/clip_projections/`, sustituyendo al encoder en `bf16` con una version cuantizada mucho mas ligera.
- Condicionamiento por imagen de referencia: al llevar el vision tower embebido, permite introducir imagenes de referencia en el pipeline sin gestionar un segundo fichero `mmproj`, simplificando la configuracion de los flujos.
- Flujos multishot en ComfyUI: combinado con un cargador GGUF consciente de H3 (por ejemplo `ComfyUI-H3-Multishot`), sirve como etapa de codificacion en pipelines de generacion con multiples planos o tomas.
- Ejecucion en GPUs de gama consumer: el fichero de 4B ocupa 3,31 GB en disco, lo que permite montar el pipeline completo en GPUs con 8-12 GB de VRAM donde el encoder en `bf16` no cabria junto al resto de componentes.
- Experimentacion con cuantizacion de encoders multimodales: el repositorio publica metricas de similitud coseno del vision tower (0,997-0,998 en 4B; 0,998-0,999 en 8B) frente a la fuente `bf16`, lo que lo convierte en un caso de estudio para medir el impacto de Q4_K_M sobre encoders de condicionamiento.
- Comparacion de fidelidad entre tamanos: disponer de 4B y 8B con el mismo esquema de cuantizacion y las mismas matrices ClipProj emparejadas permite evaluar si la calidad de condicionamiento justifica el salto de 3,31 GB a 6,20 GB.
- Reutilizacion de la pipeline de conversion: los pasos documentados (fusion texto+vision, renombrado a convencion HF, fusion de slices de `patch_embed`) sirven como plantilla para generar GGUF autocontenidos de otros encoders multimodales.
- Automatizacion por lotes: al integrarse en ComfyUI, la etapa de codificacion puede invocarse desde scripts o workflows programaticos para procesar grandes volumenes de prompts e imagenes de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye metricas de verificacion estructural y de fidelidad del vision tower frente a los safetensors `bf16` originales:

| Metrica | 4B | 8B |
|---|---|---|
| Coincidencia estructural | 713 / 713 | 749 / 750 (`lm_head` eliminado) |
| Similitud coseno del vision tower | 0,997-0,998 | 0,998-0,999 |
| Precision de embeddings | F16 | F16 |

## Requisitos de hardware

- VRAM estimada para el encoder de 4B: en torno a 4-5 GB considerando el fichero de 3,31 GB mas activaciones y overhead del runtime de ComfyUI (estimacion derivada del tamano del fichero; no confirmada por el autor).
- VRAM estimada para el encoder de 8B: en torno a 7-8 GB a partir del fichero de 6,20 GB (misma advertencia: estimacion, no dato confirmado).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, ambos ficheros son compatibles con GPUs consumer de gama media-alta, si bien en este caso la VRAM debe compartirse con el resto del pipeline de MiniMax H3, no solo con el encoder.
- Cabe en GPU consumer: previsiblemente si para ambos ficheros, con mayor margen para el 4B; no hay confirmacion oficial.
- Opciones de despliegue: ComfyUI con un cargador GGUF consciente de H3, colocado en `ComfyUI/models/text_encoders/` y emparejado con una matriz ClipProj en `ComfyUI/models/clip_projections/`.
- Incompatibilidades de despliegue: no carga con `llama-mtmd-cli` ni con otras herramientas estandar de llama.cpp, porque estas esperan la convencion de dos ficheros (texto + `mmproj`). Tampoco ha sido probado con `city96/ComfyUI-GGUF`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Vision tower | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|---|
| Abiray/Qwen3-VL (4B) | 4.437.029.376 | GGUF autocontenido | Embebido | Q4_K_M, embeddings F16 | Apache 2.0 | Encoder para MiniMax H3 en ComfyUI |
| Abiray/Qwen3-VL (8B) | No disponible | GGUF autocontenido | Embebido, `lm_head` eliminado | Q4_K_M, embeddings F16 | Apache 2.0 | Encoder para MiniMax H3 en ComfyUI |
| Comfy-Org/Krea-2 (fuente 4B) | No disponible | safetensors `bf16` | No disponible | Sin cuantizar | No disponible | Fuente de la conversion |
| Comfy-Org/Qwen3-VL (fuente 8B) | No disponible | safetensors `bf16` | No disponible | Sin cuantizar | No disponible | Fuente de la conversion |

No se dispone de informacion sobre alternativas de terceros comparables (otros GGUF de Qwen3-VL preparados para ClipProj o para MiniMax H3) en el material proporcionado. La busqueda web realizada no devolvio resultados relevantes.

## Limitaciones y advertencias

- El autor declara explicitamente "NOT TESTED": el repositorio no acompana validacion funcional en el pipeline objetivo, solo verificacion estructural y de similitud coseno.
- El fichero de 8B ha perdido el `lm_head` (749 de 750 tensores), por lo que no puede emplearse para generacion de texto autorregresiva.
- Incompatible con `llama-mtmd-cli` y el resto de herramientas estandar de llama.cpp, que esperan la convencion de dos ficheros (texto + `mmproj`). El uso queda restringido a cargadores GGUF conscientes de H3 en ComfyUI.
- No probado con `city96/ComfyUI-GGUF`, la extension GGUF mas extendida en ComfyUI.
- La cuantizacion Q4_K_M puede degradar ligeramente el recuerdo de hechos complejos; el propio autor recomienda recuantizar a Q8_0 desde `bf16` si se busca maxima fidelidad.
- Riesgo de alucinacion: no disponible en la informacion proporcionada (el repositorio no documenta comportamiento generativo).
- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni evaluaciones de sesgo de los modelos base.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Licencia: los pesos derivan de modelos Apache 2.0, pero la licencia de MiniMax H3 puede imponer terminos adicionales sobre el uso derivado; el autor recomienda verificar antes de redistribuir.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion del repositorio (2026-09-19) resultan anomalas respecto al momento de la consulta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Abiray/Qwen3-VL
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base 8B: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Fuente safetensors 4B: https://huggingface.co/Comfy-Org/Krea-2
- Fuente safetensors 8B: https://huggingface.co/Comfy-Org/Qwen3-VL
- Metodo ClipProj: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- llama.cpp (herramienta de conversion): https://github.com/ggml-org/llama.cpp
- Busqueda web: no se encontraron resultados relevantes adicionales sobre este repositorio.
